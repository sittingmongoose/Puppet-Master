"""Small synthetic counterexamples for pm_guard_isolation --self-test.

This is a verification companion, not a lane proof implementation. The engine
must report the expected defect or exact flip/stay row for every corpus entry.
"""
import json
from pathlib import Path


def exercise(g, memory):
    corpus = json.loads((Path(__file__).resolve().parents[1] / "Plans/guard_isolation_traps.json").read_text())
    results = []
    for trap in corpus["traps"]:
        try:
            memory.check()
            detail, caught = probe(g, trap, memory)
            results.append({"id": trap["id"], "expected": trap["expected"], "caught": bool(caught), "report": detail})
        except Exception as exc:
            results.append({"id": trap["id"], "expected": trap["expected"], "caught": False,
                            "unexpected_error": type(exc).__name__ + ": " + str(exc)})
    caught = sum(r["caught"] for r in results)
    return {"version": 1, "status": "PASS" if caught == len(results) else "FAIL", "caught": caught, "traps": results}


def example_suite():
    """Runnable adapter wiring example; synthetic schema, no product authority."""
    import pm_guard_isolation as g
    uri = "https://pm.invalid/adapter-example.json"
    schema = g.SchemaCatalog({uri: {"type": "string", "enum": ["red"]}})
    ids = {guard.keyword: guard.id for guard in schema.guards.values()}
    def runner(value, state):
        return g.Outcome.accept() if state.schema.validator(uri).is_valid(value) else g.Outcome.refuse("schema")
    return g.Suite("adapter-example", runner, [g.Control("valid", "red", "synthetic")], [
        g.Negative("type", 17, ids["type"], "schema", "valid", "wrong type"),
        g.Negative("enum", "blue", ids["enum"], "schema", "valid", "well-typed nonmember")], schema)


def probe(g, trap, memory):
    kind = trap["kind"]
    uri = "https://pm.invalid/traps/" + trap["id"] + ".json"
    if kind == "native_schema_alias":
        shared = {"minimum": 0}
        synthetic = {**trap, "kind": "shared_fields", "schema": {"properties": {"a": shared, "b": shared}}}
        return probe(g, synthetic, memory)
    if kind == "typed_evidence":
        values = [-0.0, 0.0, False, 0, 1, 1.0, "1", [], (), b"x", bytearray(b"x"), {"1": 1}, {1: 1}]
        hashes = [g.digest(value) for value in values]
        changed = g.typed_changes({"x": False}, {"x": 0})
        return {"distinct": len(set(hashes)), "values": len(values), "typed_change": changed}, len(set(hashes)) == len(values) and changed == ["/x"]
    if kind == "outcome_types":
        try:
            g.Outcome(1, "")
        except g.IsolationError as exc:
            return {"error": str(exc)}, "exact boolean" in str(exc)
        return {}, False
    if kind.startswith("memory_"):
        now = [0.0]
        sleeps = []
        sequence = iter([5, 6, 7] if kind == "memory_resume" else [5] * 10)
        def sleep(seconds):
            sleeps.append(seconds); now[0] += seconds
        gate = g.MemoryGate(max_rss=0, pause_when_low=6, resume_at=7, poll=120, low_timeout=240,
                            available=lambda: next(sequence), sleep=sleep, clock=lambda: now[0])
        try:
            gate.check()
        except g.IsolationError as exc:
            return {"error": str(exc), "sleeps": sleeps}, kind == "memory_timeout" and "low-timeout" in str(exc)
        return {"sleeps": sleeps}, kind == "memory_resume" and sleeps == [120, 120]
    if "schema" in trap:
        try:
            catalog = g.SchemaCatalog({uri: trap["schema"]})
        except g.IsolationError as exc:
            return {"error": str(exc)}, kind == "dangling" and "unresolved" in str(exc)
        def gid(keyword, path=(), member=None):
            return next(x.id for x in catalog.guards.values() if x.keyword == keyword and x.path == path and x.member == member)
        def runner(value, state):
            errors = list(state.schema.validator(uri).iter_errors(value))
            return g.Outcome.refuse("schema") if errors else g.Outcome.accept()
        def suite(control, negatives):
            return g.Suite(trap["id"], runner, [g.Control("valid", control, "synthetic")],
                [g.Negative(name, value, target, "schema", "valid", name) for name, value, target in negatives], catalog)
        def row(report, target):
            return next(r for r in report["rows"] if r["id"] == target)
        if kind == "merged":
            x, y = gid("minimum", ("properties", "x")), gid("minimum", ("properties", "y"))
            s = suite({"x": 0, "y": 0}, [("x", {"x": -1, "y": 0}, x)])
            s.duplicates = [g.Duplicate("bad-merge", (x, y), catalog.guards[x].invariant, "trap: shared enforcement location is not equivalence")]
            report = g.run(s, memory=memory)
            return report, any("merges distinct" in f.get("error", "") for f in report["failures"])
        if kind == "required":
            x, y = gid("required", member="x"), gid("required", member="y")
            report = g.run(suite({"x": 1, "y": 1}, [("x", {"y": 1}, x), ("y", {"x": 1}, y)]), memory=memory)
            r = row(report, x)
            return report, r["flips"] == ["x"] and not r["unrelated_changes"] and row(report, y)["flips"] == ["y"]
        if kind == "inventory":
            target = gid("type")
            report = g.run(suite("ab", [("type", 3, target)]), memory=memory)
            return report, all(gid(k) in report["unproved_guards"] for k in ("minLength", "maxLength", "pattern"))
        if kind == "masked":
            target = gid("minimum", ("properties", "x"))
            report = g.run(suite({"x": 0, "y": 0}, [("two-defects", {"x": -1, "y": -1}, target)]), memory=memory)
            return report, any(m["negative"] == "two-defects" and m["actual"] == {"accepted": False, "code": "schema"} for m in report["masked_negatives"])
        if kind == "type_enum":
            t, e = gid("type"), gid("enum")
            report = g.run(suite("red", [("type", 17, t), ("enum", "blue", e)]), memory=memory)
            return report, report["status"] == "PASS" and row(report, t)["flips"] == ["type"] and not row(report, t)["unrelated_changes"]
        if kind == "conditional":
            lo, hi = gid("minLength", ("then",)), gid("maxLength", ("then",))
            s = suite("a", [("short", "", lo), ("long", "abcde", hi)])
            s.controls.append(g.Control("null-control", None, "synthetic"))
            report = g.run(s, memory=memory)
            return report, row(report, lo)["proved"] and row(report, hi)["proved"] and catalog.guards[gid("type", ("if",))].classification == "selector"
        if kind == "unexposed":
            report = g.run(suite(1, [("low", -1, gid("minimum"))]), memory=memory)
            return report, gid("maximum") in report["unproved_guards"]
        if kind == "dependency":
            y, z = (gid("dependentRequired", member=g.encoded(["x", n])) for n in ("y", "z"))
            report = g.run(suite({"x": 1, "y": 1, "z": 1}, [("y", {"x": 1, "z": 1}, y), ("z", {"x": 1, "y": 1}, z)]), memory=memory)
            return report, row(report, y)["proved"] and row(report, z)["proved"]
        if kind == "ref_sibling":
            lo, hi = gid("minimum", ("$defs", "base")), gid("maximum")
            report = g.run(suite(1, [("low", -1, lo), ("high", 6, hi)]), memory=memory)
            return report, row(report, lo)["proved"] and row(report, hi)["proved"]
        if kind == "contains":
            lo, hi = gid("minContains"), gid("maxContains")
            report = g.run(suite([1], [("none", [], lo), ("three", [1, 2, 3], hi)]), memory=memory)
            return report, row(report, lo)["proved"] and row(report, hi)["proved"]
        if kind == "oneof":
            target = gid("oneOf:maxMatches")
            report = g.run(suite(-1, [("overlap", 1, target)]), memory=memory)
            view = catalog.mutated(frozenset((target,)))
            # A zero-match value must stay refused (branches require number or >=0).
            # JSON domain only: make a second schema with two disjoint const branches.
            other = g.SchemaCatalog({uri: {"oneOf": [{"const": "a"}, {"const": "b"}]}})
            other_id = next(x.id for x in other.guards.values() if x.keyword == "oneOf:maxMatches")
            zero_stays = not other.mutated(frozenset((other_id,))).validator(uri).is_valid("c")
            return report, row(report, target)["proved"] and zero_stays and view.validator(uri).is_valid(1)
        if kind == "not":
            target = gid("type", ("not",))
            report = g.run(suite("a", [("forbidden", 1, target)]), memory=memory)
            return report, row(report, target)["proved"]
        if kind == "cycle":
            v = catalog.mutated(frozenset()).validator(uri)
            return {"references": catalog.references, "inventory": [g.asdict(x) for x in catalog.guards.values()]}, v.is_valid({"next": {"next": {}}}) and len(catalog.references) == 1
        if kind == "selector_ref":
            target = gid("type", ("$defs", "selector"))
            return {"guard": g.asdict(catalog.guards[target])}, catalog.guards[target].classification == "selector"
        if kind == "boolean_ref":
            target = gid("$boolean", ("$defs", "forbidden"))
            other = gid("$boolean", ("$defs", "unrelated"))
            s = suite({}, [("forbidden", {"a": 1}, target)])
            report = g.run(s, memory=memory)
            return report, row(report, target)["proved"] and catalog.guards[other].classification == "unreachable"
        if kind == "negative_ref":
            target = gid("type", ("$defs", "n"))
            report = g.run(suite("a", [("forbidden", 1, target)]), memory=memory)
            return report, row(report, target)["proved"] and catalog.guards[target].polarity == -1
        if kind == "anchor":
            target = gid("minimum", ("$defs", "part"))
            report = g.run(suite(1, [("low", -1, target)]), memory=memory)
            return report, row(report, target)["proved"]
        if kind == "branch_inventory":
            paths = {x.path for x in catalog.guards.values()}
            expected = {("allOf", 0, "then"), ("allOf", 0, "else"), ("anyOf", 0), ("anyOf", 1)}
            return {"inventory": [g.asdict(x) for x in catalog.guards.values()]}, expected <= paths
        if kind == "boolean_not":
            target = gid("$boolean", ("not",))
            other = g.SchemaCatalog({uri: {"not": False}})
            counterpart = next(x for x in other.guards.values() if x.path == ("not",))
            return {"guard": g.asdict(catalog.guards[target]), "counterpart": g.asdict(counterpart)}, catalog.guards[target].classification == "guard" and counterpart.classification == "redundant"
        if kind == "mixed_ref":
            occurrences = [x for x in catalog.guards.values() if x.keyword == "type" and x.path == ("not",)]
            return {"guards": [g.asdict(x) for x in occurrences]}, len(occurrences) == 2 and {x.polarity for x in occurrences} == {-1, 1}
        if kind in ("shared_fields", "shared_duplicate", "inline_duplicate", "mixed_fields"):
            relevant = [x for x in catalog.guards.values() if x.kind == "schema" and x.classification == "guard"]
            if kind in ("shared_fields", "mixed_fields"):
                a = next(x for x in relevant if x.input_path == ("a",))
                b = next(x for x in relevant if x.input_path == ("b",))
                control = {"a": 0, "b": "text" if kind == "mixed_fields" else 0}
                avalue = {"a": "text" if kind == "mixed_fields" else -1, "b": control["b"]}
                bvalue = {"a": 0, "b": 1 if kind == "mixed_fields" else -1}
                report = g.run(suite(control, [("a", avalue, a.id), ("b", bvalue, b.id)]), memory=memory)
                return report, report["status"] == "PASS" and row(report, a.id)["flips"] == ["a"] and row(report, b.id)["flips"] == ["b"]
            s = suite(0, [])
            assert len(relevant) == 2 and relevant[0].invariant == relevant[1].invariant
            s.duplicates = [g.Duplicate("same-value-bound", tuple(x.id for x in relevant), relevant[0].invariant,
                "same root value and minimum=0 enforced in two evaluation occurrences")]
            s.negatives = [g.Negative("negative", -1, "same-value-bound", "schema", "valid", "root minimum violated")]
            report = g.run(s, memory=memory)
            return report, report["status"] == "PASS" and report["duplicates"][0]["proved"]
        if kind == "negated_compound":
            lo, hi = gid("minimum", ("not",)), gid("maximum", ("not",))
            s = suite(11, [("minimum-labelled", 0, lo), ("maximum-labelled", 10, hi)])
            report = g.run(s, memory=memory)
            return report, report["status"] == "FAIL" and any(r["unrelated_changes"] for r in report["rows"])
        if kind == "dialect":
            v = catalog.mutated(frozenset()).validator(uri + "#/definitions/tuple")
            return {"validator": type(v).__name__}, v.is_valid([1]) and not v.is_valid(["wrong"])
        if kind == "unconsumed":
            s = suite(1, [("type", "a", gid("type"))])
            s.runner = lambda value, state: g.Outcome.accept() if type(value) is int else g.Outcome.refuse("schema")
            report = g.run(s, memory=memory)
            return report, any(f["kind"] == "declared_root_not_consumed" for f in report["failures"])
        if kind == "array_inventory":
            kinds = {x.keyword for x in catalog.guards.values()}
            expected = {"minProperties", "maxProperties", "additionalProperties", "unevaluatedProperties", "$boolean", "prefixItems", "items", "minItems", "maxItems", "uniqueItems", "const"}
            return {"inventory": [g.asdict(x) for x in catalog.guards.values()]}, expected <= kinds
        if kind == "scalar_inventory":
            kinds = {x.keyword for x in catalog.guards.values()}
            expected = {"minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "format", "const"}
            fmt_schema = g.SchemaCatalog({uri: {"type": "string", "format": "date-time"}})
            try:
                enforced = not fmt_schema.mutated(frozenset()).validator(uri).is_valid("not-a-date")
                mode = "enforced"
            except g.IsolationError as exc:
                enforced, mode = "format checker unavailable" in str(exc), "missing checker fails closed"
            return {"inventory": [g.asdict(x) for x in catalog.guards.values()], "format_mode": mode}, expected <= kinds and enforced
        if kind == "runner_crash":
            s = suite(1, [("low", -1, gid("minimum"))])
            def broken(value, state):
                if value < 0: raise RuntimeError("broken checker")
                return g.Outcome.accept()
            s.runner = broken
            report = g.run(s, memory=memory)
            return report, any(f["kind"] == "wrong_baseline_refusal" and "error" in f["actual"] for f in report["failures"])
        if kind == "false_success":
            s = suite(1, [("low", -1, gid("minimum"))])
            s.runner = lambda value, state: g.Outcome.accept()
            report = g.run(s, memory=memory)
            return report, any(f["kind"] == "wrong_baseline_refusal" for f in report["failures"])
        if kind == "duplicate_labels":
            s = suite(1, [("same", "a", gid("type")), ("same", [], gid("type"))])
            report = g.run(s, memory=memory)
            return report, any("IDs must be unique" in f.get("error", "") for f in report["failures"])
    else:
        return code_probe(g, trap, memory)
    raise AssertionError("unimplemented trap: " + kind)


def code_probe(g, trap, memory):
    kind = trap["kind"]
    code = '''def check(v):
    if v["x"] < 0:
        raise Refusal("bad_x")
    if v["y"] < 0:
        raise Refusal("bad_y")
    return Outcome.accept()
'''
    if kind == "compound_code":
        code = '''def check(v):
    if v["x"] < 0 or v["y"] < 0:
        raise Refusal("range")
    return Outcome.accept()
'''
    if kind == "duplicate_code":
        code = '''def check(v):
    if v["x"] < 0:
        raise Refusal("bad_x")
    if v["x"] < 0:
        raise Refusal("bad_x")
    if v["y"] < 0:
        raise Refusal("bad_y")
    return Outcome.accept()
'''
    if kind == "predicate_return":
        code = '''def check(v):
    return v["x"] >= 0 and v["y"] >= 0
'''
    if kind == "require_call":
        code = '''def require(ok, reason):
    if not ok:
        raise Refusal(reason)
def check(v):
    require(v["x"] >= 0 and v["y"] >= 0, "range")
    return Outcome.accept()
'''
    if kind == "assert_clause":
        code = '''def check(v):
    assert v["x"] >= 0 and v["y"] >= 0, "range"
    return Outcome.accept()
'''
    if kind == "accumulated":
        code = '''def check(v):
    errors = []
    if v["x"] < 0:
        errors.append("bad_x")
    if v["y"] < 0:
        errors.append("bad_y")
    return errors
'''
    if kind == "class_guard":
        code = '''class Hidden:
    def check(self, v):
        if v["x"] < 0:
            raise Refusal("bad_x")
'''
    class Refusal(Exception): pass
    namespace = {"Refusal": Refusal, "Outcome": g.Outcome}
    exec(code, namespace)
    module = g.AstGuards("trap", code, namespace)
    if kind == "class_guard":
        s = g.Suite(trap["id"], lambda value, state: g.Outcome.accept(),
                    [g.Control("valid", {"x": 0}, "synthetic")], [], modules=[module])
        report = g.run(s, memory=memory)
        return report, any(f["kind"] == "uninventoried_code_site" and f["site"]["action"] == "unsupported" for f in report["failures"])
    dispositions, ids = {}, []
    for candidate in module.candidates():
        acceptance_predicate = kind == "predicate_return" and candidate["action"] == "predicate"
        if candidate["function"] == "require":
            dispositions[candidate["id"]] = g.Classification(candidate["id"], "selector", "parameterized enforcement helper; each caller acceptance predicate separately inventoried")
        elif candidate["action"] in ("return", "predicate") and not acceptance_predicate:
            dispositions[candidate["id"]] = g.Classification(candidate["id"], "selector", "accepting terminal return; no rejection")
        elif kind == "unexposed_code":
            continue
        else:
            field = "x" if 'v[\'x\']' in candidate["expression"] else "y"
            reason = "range" if kind in ("compound_code", "predicate_return", "require_call", "assert_clause") else "bad_" + field
            ids.append(module.register(candidate, reason, g.Invariant("/" + field, "integer >= 0")))
    def runner(value, state):
        try:
            result = state.modules["trap"].check(value)
            if kind == "predicate_return":
                return g.Outcome.accept() if result is True else g.Outcome.refuse("range")
            if kind == "accumulated":
                return g.Outcome.refuse(result[0]) if result else g.Outcome.accept()
            return result
        except Refusal as exc:
            return g.Outcome.refuse(str(exc))
        except AssertionError as exc:
            if kind != "assert_clause": raise
            return g.Outcome.refuse(str(exc))
    s = g.Suite(trap["id"], runner, [g.Control("valid", {"x": 0, "y": 0}, "synthetic")], [],
                modules=[module], code_dispositions=dispositions)
    if kind == "unexposed_code":
        report = g.run(s, memory=memory)
        return report, sum(f["kind"] == "uninventoried_code_site" for f in report["failures"]) == 2
    if kind == "duplicate_code":
        invariant = module.sites[ids[0]].guard.invariant
        s.duplicates = [g.Duplicate("same-x", tuple(ids[:2]), invariant, "same /x >=0 repeated at two exact sites")]
        s.negatives = [g.Negative("x", {"x": -1, "y": 0}, "same-x", "bad_x", "valid", "x negative"),
                       g.Negative("y", {"x": 0, "y": -1}, ids[2], "bad_y", "valid", "y negative")]
        report = g.run(s, memory=memory)
        return report, report["status"] == "PASS" and report["duplicates"][0]["proved"]
    s.negatives = [g.Negative("x", {"x": -1, "y": -1 if kind == "changed_code" else 0}, ids[0],
                            "range" if kind in ("compound_code", "predicate_return", "require_call", "assert_clause") else "bad_x", "valid", "x negative"),
                   g.Negative("y", {"x": 0, "y": -1}, ids[1], "range" if kind in ("compound_code", "predicate_return", "require_call", "assert_clause") else "bad_y", "valid", "y negative")]
    report = g.run(s, memory=memory)
    if kind == "changed_code":
        return report, any(m["actual"] == {"accepted": False, "code": "bad_y"} for m in report["masked_negatives"])
    return report, report["status"] == "PASS" and all(r["proved"] for r in report["rows"])
