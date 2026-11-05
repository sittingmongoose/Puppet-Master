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
    if kind.startswith("round4_"):
        return round4_probe(g, trap, memory)
    if kind.startswith("round3_"):
        return round3_probe(g, trap, memory, uri)
    if kind.startswith("review_"):
        return review_probe(g, trap, memory, uri)
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
            catalog = g.SchemaCatalog({uri: trap["schema"]}, roots=(uri + "#/definitions/tuple",) if kind == "dialect" else None)
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
            s = suite(11, [])
            report = g.run(s, memory=memory)
            return report, report["status"] == "FAIL" and all(target in report["unproved_guards"] for target in (lo, hi)) and not report["rows"]
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
        elif (candidate["action"] in ("return", "predicate") or candidate["expression"] in ("Outcome.accept()", "errors")) and not acceptance_predicate:
            evidence = ("error-list carrier; both producer appends are inventoried and independently cut; callback translates the actual list"
                        if candidate["expression"] == "errors" else "accepting terminal return; no rejection")
            dispositions[candidate["id"]] = g.Classification(candidate["id"], "selector", evidence)
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
        return report, all(any(f["kind"] == "uninventoried_code_site" and f['site']['action']=='raise' and repr(field) in f['site']['expression'] for f in report['failures']) for field in ('x','y'))
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


def round3_probe(g, trap, memory, uri):
    """Astra's exact false clearances plus conservative grammar boundaries."""
    import ast
    import copy
    from jsonschema import validators
    kind = trap['kind']
    if kind == 'round3_python_audit':
        rows = python_audit(g, memory)
        return {'rows': rows, 'totals': {k: sum(r['disposition'] == k for r in rows) for k in ('atomic_cuts', 'fails_closed')}}, all(x['caught'] for x in rows)
    if kind == 'round3_invariant_context':
        reports = []
        for schema, good, bad, keyword in [
            ({'allOf': [{'contains': {'const': 1}}, {'contains': {'const': 2}}]}, [1, 2], [], 'minContains'),
            ({'dependentSchemas': {'a': {'required': ['x']}, 'b': {'required': ['x']}}}, {'a': 1, 'b': 1, 'x': 1}, {'a': 1, 'b': 1}, 'required'),
            ({'dependencies': {'a': {'required': ['x']}, 'b': {'required': ['x']}}}, {'a': 1, 'b': 1, 'x': 1}, {'a': 1, 'b': 1}, 'required'),
        ]:
            cat = g.SchemaCatalog({uri: schema})
            sites = tuple(x.id for x in cat.guards.values() if x.keyword == keyword)
            def runner(v, state):
                return g.Outcome.accept() if state.schema.validator(uri).is_valid(v) else g.Outcome.refuse('schema')
            suite = g.Suite(trap['id'], runner, [g.Control('valid', good, 'synthetic')],
                [g.Negative('both', bad, 'bad-dupe', 'schema', 'valid', 'deliberately conflated independent predicates')], cat,
                duplicates=[g.Duplicate('bad-dupe', sites, cat.guards[sites[0]].invariant, 'same field and keyword is insufficient')])
            reports.append(g.run(suite, memory=memory))
        return {'reports': reports}, all(r['status'] == 'FAIL' and any('merges distinct' in f.get('error', '') for f in r['failures']) for r in reports)
    if kind == 'round3_keyword_audit':
        rows = keyword_audit(g)
        failing = [x for x in rows if x['disposition'] == 'fails_closed']
        allowed = [x for x in rows if x['disposition'] == 'atomic_cuts']
        return {'rows': rows, 'totals': {k: sum(r['disposition'] == k for r in rows) for k in ('atomic_cuts', 'fails_closed', 'zero_predicates')}}, (
            bool(allowed) and bool(failing) and all(r['atomic_contract_valid'] for r in rows) and
            {r['dialect'] for r in rows} == {c.__name__ for c in g.SUPPORTED_DIALECTS} and
            all(r['disposition'] == 'fails_closed' for r in rows if r['keyword'] in ('pattern', 'format', 'patternProperties', '$vocabulary', '<unknown>') or (r['keyword'] in ('unevaluatedItems', 'unevaluatedProperties') and r['dialect'] in ('Draft201909Validator', 'Draft202012Validator'))))
    if kind == 'round3_memory_finite':
        blocked = []
        for key in ('max_rss', 'pause_when_low', 'resume_at', 'poll', 'low_timeout'):
            for value in (float('nan'), float('inf'), float('-inf')):
                try: g.MemoryGate(**{key: value})
                except g.IsolationError: blocked.append([key, repr(value)])
        return {'blocked': blocked}, len(blocked) == 15
    if kind == 'round3_memory_fresh':
        now, available, samples, sleeps = [0.0], [7], [], []
        def sample(): samples.append(available[0]); return available[0]
        def sleep(sec): sleeps.append(sec); now[0] += sec; available[0] = 7
        gate = g.MemoryGate(max_rss=0, pause_when_low=6, resume_at=7, available=sample, sleep=sleep, clock=lambda: now[0])
        gate.check(); available[0] = 5; now[0] = .5; gate.check()
        return {'samples': samples, 'sleeps': sleeps}, samples == [7, 5, 7] and sleeps == [120]
    if kind == 'round3_memory_resume':
        from types import SimpleNamespace
        original, rss, available, reads = g.resource.getrusage, [10], [5], []
        def usage(who): reads.append(rss[0]); return SimpleNamespace(ru_maxrss=rss[0] * (1024 * 1024 if g.sys.platform == 'darwin' else 1024))
        def sleep(sec): rss[0] = 200; available[0] = 7
        g.resource.getrusage = usage
        try:
            gate = g.MemoryGate(max_rss=100, pause_when_low=6, resume_at=7, available=lambda: available[0], sleep=sleep)
            try: gate.check()
            except g.IsolationError as exc: return {'error': str(exc), 'rss_reads': reads}, 'max-rss exceeded' in str(exc) and reads == [10, 200]
            return {'rss_reads': reads}, False
        finally: g.resource.getrusage = original
    if kind == 'round3_pattern_witnesses':
        values = ['ref:abc', 'BAD', 'ref:abc\n']
        patterns = {'original': r'^(?![\s\S]*[\r\n])ref:[a-z]+$',
                    'syntax-cut-only': r'^(?![\s\S]*[\r\n])[\s\S]*$', 'line-feed-cut-only': r'^ref:[a-z]+$'}
        observations = {k: [validators.Draft202012Validator({'pattern': v}).is_valid(x) for x in values] for k, v in patterns.items()}
        return {'values': values, 'independent_predicate_witnesses': observations}, observations == {
            'original': [True, False, False], 'syntax-cut-only': [True, True, False], 'line-feed-cut-only': [True, False, True]}
    if 'schema' in trap:
        catalog = g.SchemaCatalog({uri: trap['schema']})
        def runner(value, state):
            return g.Outcome.accept() if state.schema.validator(uri).is_valid(value) else g.Outcome.refuse('schema')
        suite = g.Suite(trap['id'], runner, [g.Control('valid', trap['control'], 'synthetic')], [], catalog)
        report = g.run(suite, memory=memory)
        native = validators.validator_for(trap['schema'])(trap['schema'])
        refused = [not native.is_valid(v) for v in trap.get('heldout', [])]
        blocked = []
        for guard in catalog.guards.values():
            if guard.classification == 'unclassified':
                try: catalog.mutated(frozenset([guard.id]))
                except g.IsolationError: blocked.append(guard.id)
        labelled = None
        if trap.get('label_keyword'):
            target = next(x.id for x in catalog.guards.values() if x.keyword == trap['label_keyword'] and x.path == tuple(trap.get('label_path', [])))
            suite.negatives = [g.Negative(str(i), v, target, 'schema', 'valid', 'independent predicate '+str(i)) for i, v in enumerate(trap['heldout'][:trap.get('label_count', 1)])]
            labelled = g.run(suite, memory=memory)
        return {'report': report, 'labelled_report': labelled, 'heldout_rejected': refused, 'blocked_cuts': blocked}, (
            report['status'] == 'FAIL' and bool(report['unproved_guards']) and all(refused) and
            (labelled is None or labelled['status'] == 'FAIL') and
            (bool(blocked) if kind != 'round3_legacy_contains' else any(x.keyword == 'minContains' and x.classification == 'guard' and x.predicate_count == 1 for x in catalog.guards.values())))
    source = trap['source']
    def require(ok, code):
        if not ok: raise ValueError(code)
    ns = {'require': require}; exec(source, ns)
    module = g.AstGuards('round3', source, ns)
    candidates = module.candidates()
    dispositions = {c['id']: g.Classification(c['id'], 'selector', 'literal successful terminal return') for c in candidates if c['expression'] == 'True'}
    ids = []
    # List-refusal probes retain their real, independently proved x guard. The
    # unsupported y writes must still prevent that nonempty proof clearing.
    for c in candidates:
        if c['action'] == 'raise' and "['x']" in c['expression']:
            ids.append(module.register(c, 'bad_x', g.Invariant('/x', 'x >= 0')))
    def runner(value, state):
        errors = []
        try:
            result = state.modules['round3'].check(value, errors) if trap.get('errors_argument') else state.modules['round3'].check(value)
        except ValueError as exc: return g.Outcome.refuse(str(exc))
        if trap.get('errors_argument'): return g.Outcome.refuse(errors[0]) if errors else g.Outcome.accept()
        if trap.get('require_call'): return g.Outcome.accept()
        return g.Outcome.accept() if result is True else g.Outcome.refuse('range')
    negatives = [g.Negative('x', trap['negative'], ids[0], 'bad_x', 'valid', 'only x') ] if ids else []
    suite = g.Suite(trap['id'], runner, [g.Control('valid', trap['control'], 'synthetic')], negatives, modules=[module], code_dispositions=dispositions)
    report = g.run(suite, memory=memory)
    independent = [g.asdict(runner(v, suite.state())) for v in trap.get('heldout', [])]
    blocked = []
    for c in candidates:
        if c['action'] == 'unsupported':
            try: module.register(c, 'range', g.Invariant('/x', 'claimed lower bound'))
            except g.IsolationError: blocked.append(c['id'])
    aggregate = None
    if trap.get('aggregate'):
        target = next(c['id'] for c in candidates if c['action'] == 'unsupported')
        attempted = copy.copy(suite)
        attempted.negatives = [g.Negative(str(i), v, target, 'range', 'valid', 'separate bound/field predicate '+str(i)) for i, v in enumerate(trap['heldout'])]
        aggregate = g.run(attempted, memory=memory)
    return {'source': source, 'candidates': candidates, 'report': report, 'aggregate_report': aggregate, 'independent_refusals': independent, 'blocked_registrations': blocked}, (
        report['status'] == 'FAIL' and bool(report['unproved_guards']) and bool(blocked) and
        (aggregate is None or aggregate['status'] == 'FAIL') and
        all(not x['accepted'] and 'error' not in x for x in independent) and
        (not ids or any(r['id'] == ids[0] and r['proved'] and r['flips'] == ['x'] for r in report['rows'])))


def keyword_audit(g):
    """Executable 4-dialect x 3-context vocabulary audit (not a general prover).

    Each cell uses the same complete catalog as adapters; unknown keywords and
    unsupported grammars must have visible unclassified obligations. The guide
    defines the scope/zero-predicate rules, rather than inferring from samples.
    """
    samples = {k: {k: 1} for k in ('minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
        'minLength', 'maxLength', 'minItems', 'maxItems', 'minProperties', 'maxProperties')}
    samples.update({
        'type': {'type': 'number'}, 'const': {'const': 1}, 'enum': {'enum': [1, 2]},
        'pattern': {'pattern': '^x$'}, 'format': {'format': 'date-time'}, 'uniqueItems': {'uniqueItems': True},
        'required': {'required': ['x']}, 'dependentRequired': {'dependentRequired': {'x': ['y']}},
        'dependencies': {'dependencies': {'x': ['y']}}, 'dependentSchemas': {'dependentSchemas': {'x': {'required': ['y']}}},
        'properties': {'properties': {'x': {'minimum': 0}}}, 'patternProperties': {'patternProperties': {'^x$': {'minimum': 0}}},
        'additionalProperties': {'additionalProperties': False}, 'unevaluatedProperties': {'unevaluatedProperties': False},
        'items': {'items': {'minimum': 0}}, 'prefixItems': {'prefixItems': [{'minimum': 0}]},
        'additionalItems': {'items': [{}], 'additionalItems': False}, 'unevaluatedItems': {'unevaluatedItems': False},
        'propertyNames': {'propertyNames': {'minLength': 2}}, 'contains': {'contains': {'const': 1}},
        'minContains': {'contains': {'const': 1}, 'minContains': 2},
        'maxContains': {'contains': {'const': 1}, 'minContains': 0, 'maxContains': 2},
        'allOf': {'allOf': [{'minimum': 0}]}, 'anyOf': {'anyOf': [{'minimum': 0}]},
        'oneOf': {'oneOf': [{'minimum': 0}, {'maximum': 10}]}, 'not': {'not': {'minimum': 0}},
        'if': {'if': {'const': 1}, 'then': False}, 'then': {'if': {'const': 1}, 'then': False},
        'else': {'if': {'const': 1}, 'else': False},
        '$ref': {'$ref': '#/definitions/n', 'definitions': {'n': {'minimum': 0}}},
        '$dynamicRef': {'$dynamicRef': '#/definitions/n', 'definitions': {'n': {'minimum': 0}}},
        '$recursiveRef': {'$recursiveAnchor': True, '$recursiveRef': '#'},
        '$defs': {'$defs': {'n': {'minimum': 0}}}, 'definitions': {'definitions': {'n': {'minimum': 0}}},
        '$boolean': False, '$vocabulary': {'$vocabulary': {'https://review.invalid/vocabulary': True}},
        'contentSchema': {'contentSchema': {'minimum': 0}}, '<unknown>': {'x-unknown-rejection': 1},
    })
    annotation_values = {'$id': 'https://pm.invalid/audit-id', '$anchor': 'n', '$dynamicAnchor': 'n', '$recursiveAnchor': True,
        '$comment': 'audit', 'title': 'audit', 'description': 'audit', 'default': 1, 'examples': [1],
        'deprecated': True, 'readOnly': True, 'writeOnly': True, 'contentEncoding': 'base64', 'contentMediaType': 'application/json'}
    samples.update({k: {k: v} for k, v in annotation_values.items()})
    rows = []
    for cls in g.SUPPORTED_DIALECTS:
        assert set(cls.VALIDATORS) <= set(samples), 'new validator keyword must be audited explicitly'
        dialect = cls.META_SCHEMA.get('$id', cls.META_SCHEMA.get('id'))
        for keyword, fragment in {**samples, '$schema': {}}.items():
            # Tuple items were removed in 2020-12; audit the ignored additionalItems keyword with the valid modern items shape.
            if keyword == 'additionalItems' and cls is g.validators.Draft202012Validator:
                fragment = {'items': {}, 'additionalItems': False}
            for context, wrap in (('positive', lambda x: x), ('negative', lambda x: {'not': x}),
                                  ('nested_not', lambda x: {'not': {'not': x}})):
                local = g.schema_copy(fragment)
                if isinstance(local, dict):
                    if cls is g.validators.Draft202012Validator and '$recursiveAnchor' in local:
                        local['$recursiveAnchor'] = 'n'  # deprecated 2020-12 meta-schema spelling
                    for ref in ('$ref', '$dynamicRef'):
                        if local.get(ref) == '#/definitions/n':
                            local[ref] = '#' + ('/not' if context == 'negative' else '/not/not' if context == 'nested_not' else '') + '/definitions/n'
                body = wrap(local)
                if type(body) is bool: body = {'allOf': [body]}
                body = {'$schema': dialect, **body}
                cat = g.SchemaCatalog({'https://pm.invalid/keyword-audit': body})
                active = [x for x in cat.guards.values() if x.classification == 'guard']
                unresolved = [x for x in cat.guards.values() if x.classification == 'unclassified']
                rows.append({'keyword': keyword, 'dialect': cls.__name__, 'context': context,
                    'disposition': 'fails_closed' if unresolved else 'atomic_cuts' if active else 'zero_predicates',
                    'atomic_predicates': len(active), 'unclassified_obligations': len(unresolved),
                    'cuts': sorted(set(x.cut for x in active)),
                    'classifications': sorted(set(x.classification for x in cat.guards.values())),
                    'atomic_contract_valid': all(x.predicate_count == 1 and x.cut == g.SCHEMA_CUTS[x.keyword] for x in active)})
    return rows


def review_probe(g, trap, memory, uri):
    """Reviewer counterexamples, with assertions on specific report rows."""
    kind = trap['kind']
    def failure(report, name):
        return any(f['kind'] == name for f in report['failures'])
    def schema_case(schema, control, cases, roots=None):
        cat = g.SchemaCatalog({uri: schema}, roots=roots)
        def select(keyword, path=(), member=None):
            return next(x.id for x in cat.guards.values() if x.keyword == keyword and x.path == path and x.member == member)
        def runner(v, state):
            return g.Outcome.accept() if state.schema.validator(uri).is_valid(v) else g.Outcome.refuse('schema')
        suite = g.Suite(trap['id'], runner, [g.Control('c', control, 'synthetic')],
            [g.Negative(n, v, select(k, p, m), 'schema', 'c', n) for n,v,k,p,m in cases], cat)
        return cat, suite, select
    def row(report, target):
        return next(r for r in report['rows'] if r['id'] == target)
    if kind in ('review_assigned_class_append', 'review_annotated_append'):
        source = ("class Checker:\n    def check(self, value, errors):\n        if value['x'] < 0:\n            discarded = errors.append('bad_x')\n"
                  if kind == 'review_assigned_class_append' else
                  "def check(value, errors):\n    if value['x'] < 0:\n        discarded: object = errors.append('bad_x')\n")
        ns = {}; exec(source, ns)
        backend = g.AstGuards('assigned', source, ns)
        def runner(value, state):
            errors = []
            subject = state.modules['assigned']
            check = subject.Checker().check if kind == 'review_assigned_class_append' else subject.check
            check(value, errors)
            return g.Outcome.refuse(errors[0]) if errors else g.Outcome.accept()
        suite = g.Suite(trap['id'], runner, [g.Control('c', {'x': 0}, 'synthetic')], [], modules=[backend])
        report = g.run(suite, memory=memory)
        candidates = backend.candidates()
        candidate = next(c for c in candidates if c['function'] == ('Checker.check' if kind == 'review_assigned_class_append' else 'check')
                         and c['expression'].startswith('errors.append('))
        independent = g.asdict(runner({'x': -1}, suite.state()))
        return dict(source=source, report=report, candidates=candidates, independent_negative=independent), (
            report['status'] == 'FAIL' and report['controls'][0]['outcome'] == g.asdict(g.Outcome.accept()) and
            independent == g.asdict(g.Outcome.refuse('bad_x')) and bool(candidates) and
            candidate['action'] == 'unsupported' and bool(candidate.get('reason')) and
            candidate['id'] in report['unproved_guards'] and
            any(x['id'] == candidate['id'] for x in report['inventory']) and
            failure(report, 'uninventoried_code_site') and not report['rows'])
    if kind in ('review_cross_dialect', 'review_cross_dialect_child'):
        from jsonschema import validators
        from referencing import Registry, Resource
        legacy_uri = uri + '.legacy'
        child = kind == 'review_cross_dialect_child'
        legacy = {'$schema': 'http://json-schema.org/draft-07/schema#', '$id': legacy_uri,
                  'definitions': {'n': {} if child else {'minimum': 0}}, '$ref': '#/definitions/n',
                  **({'properties': {'x': {'minimum': 0, 'maximum': 2}}} if child else {'maximum': 2})}
        docs = {uri: {'$schema': 'https://json-schema.org/draft/2020-12/schema', '$ref': legacy_uri}, legacy_uri: legacy}
        registry = Registry().with_resources((u, Resource.from_contents(d)) for u, d in docs.items()).crawl()
        native = validators.validator_for(docs[uri])(docs[uri], registry=registry)
        direct = validators.validator_for(legacy)(legacy, registry=registry)
        cat = g.SchemaCatalog(docs, roots=(uri,))
        def runner(value, state):
            return g.Outcome.accept() if state.schema.validator(uri).is_valid(value) else g.Outcome.refuse('schema')
        good, low, high = ({'x': 0}, {'x': -1}, {'x': 3}) if child else (0, -1, 3)
        suite = g.Suite(trap['id'], runner, [g.Control('c', good, 'synthetic')], [], cat)
        report = g.run(suite, memory=memory)
        view = cat.mutated(frozenset()).validator(uri)
        observations = [dict(value=v, native=native.is_valid(v), direct_legacy=direct.is_valid(v), uncut=view.is_valid(v))
                        for v in (low, good, high)]
        bounds = [x for x in cat.guards.values() if x.keyword in ('minimum', 'maximum')]
        blocked = []
        for bound in bounds:
            try: cat.mutated(frozenset([bound.id]))
            except g.IsolationError: blocked.append(bound.id)
        # Preserve the review's minimum-only false-PASS attempt. Unsupported
        # labels must now be refused before any misleading removal row exists.
        minimum = next(x.id for x in bounds if x.keyword == 'minimum')
        suite.negatives = [g.Negative('low', low, minimum, 'schema', 'c', 'minimum only')]
        labelled = g.run(suite, memory=memory)
        suite.negatives = []
        suite.controls.append(g.Control('formerly-ignored', high, 'synthetic'))
        refused_control = g.run(suite, memory=memory)
        return dict(documents=docs, observations=observations, report=report, minimum_only_report=labelled,
                    two_control_report=refused_control, blocked_cuts=blocked), (
            [o['native'] for o in observations] == [False, True, False] and
            all(o['native'] == o['uncut'] for o in observations) and observations[2]['direct_legacy'] and
            len(bounds) == 2 and all(x.classification == 'unclassified' and x.id in report['unproved_guards'] and
                                      'mixed-dialect' in x.evidence for x in bounds) and
            report['status'] == 'FAIL' and not report['rows'] and len(blocked) == 2 and
            labelled['status'] == 'FAIL' and failure(labelled, 'infrastructure_or_declaration') and not labelled['rows'] and
            refused_control['status'] == 'FAIL' and failure(refused_control, 'control_refused') and
            g.digest(docs) == g.digest(cat.documents))
    if kind == 'review_mixed_not_call':
        class Refusal(Exception): pass
        def require(ok, code):
            if not ok: raise Refusal(code)
        source = "def check(v):\n    require(not (v['x'] < 0 or not (v['y'] >= 0)) and not (v['z'] < 0), 'bad')\n    return True\n"
        ns = {'require': require}; exec(source, ns)
        backend = g.AstGuards('mixed-not', source, ns); ids, dispositions = {}, {}
        for candidate in backend.candidates():
            if candidate['expression'] == 'True':
                dispositions[candidate['id']] = g.Classification(candidate['id'], 'selector', 'accepting terminal return')
            else:
                field = next(f for f in ('x', 'y', 'z') if repr(f) in candidate['expression'])
                ids[field] = backend.register(candidate, 'bad', g.Invariant('/'+field, 'nonnegative'))
        def runner(value, state):
            try:
                state.modules['mixed-not'].check(value)
                return g.Outcome.accept()
            except Refusal as exc: return g.Outcome.refuse(str(exc))
        good = dict(x=0, y=0, z=0)
        suite = g.Suite(trap['id'], runner, [g.Control('c', good, 'synthetic')],
            [g.Negative(f, {**good, f: -1}, target, 'bad', 'c', f+' only') for f, target in ids.items()],
            modules=[backend], code_dispositions=dispositions)
        report = g.run(suite, memory=memory)
        return report, report['status'] == 'PASS' and len(ids) == 3 and len(report['rows']) == 3 and all(
            row(report, target)['flips'] == [f] and row(report, target)['proved'] and row(report, target)['restored']
            for f, target in ids.items())
    if kind == 'review_swallowed_entry':
        cat = g.SchemaCatalog({uri: {'type': 'object', '$defs': {'hidden': {'minimum': 0}}}})
        target = next(x.id for x in cat.guards.values() if x.keyword == 'type')
        def runner(value, state):
            first = state.schema.validator(uri).is_valid(value['root'])
            try: second = state.schema.validator(uri+'#/$defs/hidden').is_valid(value['hidden'])
            except g.IsolationError: second = True
            return g.Outcome.accept() if first and second else g.Outcome.refuse('schema')
        suite = g.Suite(trap['id'], runner, [g.Control('c', dict(root={}, hidden=0), 'synthetic')],
            [g.Negative('root', dict(root=[], hidden=0), target, 'schema', 'c', 'root type')], cat)
        report = g.run(suite, memory=memory)
        hidden = [x for x in report['inventory'] if x.get('keyword') == 'minimum']
        return report, report['status'] == 'FAIL' and failure(report, 'consumed_entry_not_declared') and bool(hidden) and all(
            x['classification'] == 'unclassified' and x['id'] in report['unproved_guards'] for x in hidden) and report['controls'][0]['outcome']['accepted']
    if kind == 'review_negated_ref_peer':
        schema = {'$defs': {'both': {'properties': {'x': {'minimum': 0}, 'y': {'minimum': 0}}}},
                  'not': {'$ref': '#/$defs/both'}, 'properties': {'z': {'minimum': 0}}}
        cat, suite, select = schema_case(schema, dict(x=-1, y=-1, z=0),
            [('z', dict(x=-1, y=-1, z=-1), 'minimum', ('properties', 'z'), None)])
        report = g.run(suite, memory=memory)
        negative = [x for x in cat.guards.values() if x.kind == 'schema' and x.polarity < 0]
        blocked = []
        for guard in negative:
            try: cat.mutated(frozenset([guard.id]))
            except g.IsolationError: blocked.append(guard.id)
        return report, report['status'] == 'FAIL' and len(negative) == len(blocked) == 2 and all(
            x.classification == 'unclassified' and x.id in report['unproved_guards'] for x in negative) and len(report['rows']) == 1 and report['rows'][0]['proved']
    if kind=='review_memory_reset':
        now=[0]; samples=[]; sequence=iter([5,6,5,6,7])
        def available():
            value=next(sequence); samples.append(value); return value
        def sleep(seconds): now[0]+=seconds
        gate=g.MemoryGate(max_rss=0,pause_when_low=6,resume_at=7,poll=120,low_timeout=240,
            available=available,sleep=sleep,clock=lambda:now[0])
        gate.check()
        return dict(samples=samples,elapsed=now[0]), samples==[5,6,5,6,7] and now[0]==480
    if kind in ('review_type_const','review_conditional_four'):
        if kind=='review_type_const':
            cat,s,select=schema_case({'type':'string','const':'red'},'red',[
                ('type',17,'type',(),None),('const','blue','const',(),None)])
        else:
            cat,s,select=schema_case({'if':{'type':'string'},'then':{'minLength':1,'maxLength':3},'else':{'minimum':0,'maximum':2}},'a',[
                ('short','','minLength',('then',),None),('long','abcd','maxLength',('then',),None),
                ('low',-1,'minimum',('else',),None),('high',3,'maximum',('else',),None)])
            s.controls.append(g.Control('null',None,'synthetic'))
        report=g.run(s,memory=memory)
        return report, report['status']=='PASS' and all(r['proved'] and len(r['flips'])==1 for r in report['rows'])
    if kind=='review_implied_max':
        import itertools
        cat,s,select=schema_case({'type':'array','items':{'enum':['a','b']},'uniqueItems':True,'maxItems':2},['a'],[
            ('array','a','type',(),None),('enum',['c'],'enum',('items',),None),('unique',['a','a'],'uniqueItems',(),None)])
        maximum=select('maxItems'); raw=g.run(s,memory=memory)
        stock=cat.mutated(frozenset()).validator(uri); cut=cat.mutated(frozenset([maximum])).validator(uri)
        values=[list(v) for length in range(5) for v in itertools.product(['a','b','c'],repeat=length)]
        equivalent=all(stock.is_valid(v)==cut.is_valid(v) for v in values)
        s.classifications=[g.Classification(maximum,'redundant','exactly two item enum values and uniqueness imply length <= 2 by the pigeonhole principle')]
        evidenced=g.run(s,memory=memory)
        return dict(raw=raw,with_evidence=evidenced,bounded_equivalence=equivalent,count=len(values)), (
            raw['status']=='FAIL' and maximum in raw['unproved_guards'] and evidenced['status']=='PARTIAL' and equivalent and len(values)==121)
    if kind in ('review_assert_crash','review_success_zero'):
        cat,s,select=schema_case({'minimum':0},0,[('low',-1,'minimum',(),None)])
        original=s.runner
        def runner(v,state):
            if v==0:return original(v,state)
            if kind=='review_assert_crash':raise AssertionError('test failure')
            return 0
        s.runner=runner; report=g.run(s,memory=memory)
        return report, report['status']=='FAIL' and any(f['kind']=='wrong_baseline_refusal' and 'error' in f['actual'] for f in report['failures'])
    if kind=='review_recursive':
        cat,s,select=schema_case({'type':'object','properties':{'next':{'$ref':'#'}}},{'next':{}},[])
        report=g.run(s,memory=memory)
        assertions=[x for x in cat.guards.values() if x.keyword=='type']
        return report, report['status']=='FAIL' and bool(assertions) and all(x.classification=='unclassified' and x.id in report['unproved_guards'] for x in assertions)
    if kind=='review_negated_allof':
        cat,s,select=schema_case({'not':{'allOf':[{'minimum':0},{'maximum':10}]}},11,[])
        report=g.run(s,memory=memory)
        assertions=[x for x in cat.guards.values() if x.keyword in ('minimum','maximum')]
        return report, report['status']=='FAIL' and len(assertions)==2 and all(x.classification=='unclassified' and x.id in report['unproved_guards'] for x in assertions) and not report['rows']
    if kind in ('review_negated_raise', 'review_negated_return', 'review_single_negative', 'review_nested_not'):
        source = ("def check(v):\n    if not (v['x'] >= 0 and v['y'] >= 0):\n        raise Refusal('bad')\n    return True\n"
                  if kind == 'review_negated_raise' else
                  "def check(v):\n    return not (not (v['x'] >= 0) or not not (v['y'] < 0))\n"
                  if kind == 'review_nested_not' else
                  "def check(v):\n    return not (v['x'] < 0 or v['y'] < 0)\n")
        class Refusal(Exception): pass
        ns = {'Refusal': Refusal}; exec(source, ns)
        backend = g.AstGuards('review', source, ns); ids = {}; dispositions = {}
        for c in backend.candidates():
            if c['expression'] == 'True':
                dispositions[c['id']] = g.Classification(c['id'], 'selector', 'accepting terminal return')
            else:
                field = 'x' if "['x']" in c['expression'] else 'y'
                if kind == 'review_single_negative' and field == 'y':
                    continue
                ids[field] = backend.register(c, 'bad', g.Invariant('/'+field, 'nonnegative'))
        def run(v, state):
            try:
                return g.Outcome.accept() if state.modules['review'].check(v) is True else g.Outcome.refuse('bad')
            except Refusal as exc: return g.Outcome.refuse(str(exc))
        s = g.Suite(trap['id'], run, [g.Control('c', dict(x=0,y=0), 'synthetic')],
            [g.Negative(field, dict(x=-1 if field=='x' else 0, y=-1 if field=='y' else 0), target, 'bad', 'c', field)
             for field,target in ids.items()], modules=[backend], code_dispositions=dispositions)
        report = g.run(s, memory=memory)
        held = g.asdict(run(dict(x=0,y=-1), s.state(frozenset([ids['x']]))))
        if kind == 'review_single_negative':
            caught = report['status']=='FAIL' and failure(report,'uninventoried_code_site') and held==g.asdict(g.Outcome.refuse('bad'))
        else:
            caught = report['status']=='PASS' and len(ids)==2 and all(row(report,target)['flips']==[field] and row(report,target)['proved'] for field,target in ids.items())
        return dict(report=report, candidates=backend.candidates(), held_out_y_under_x_cut=held), caught
    if kind in ('review_class_require', 'review_class_append', 'review_module_require', 'review_nested_append'):
        source = ("class Checker:\n    def check(self, v):\n        require(v['x'] >= 0, 'bad')\n" if kind=='review_class_require' else
                  "class Checker:\n    def check(self, v, errors):\n        if v['x'] < 0:\n            errors.append('bad')\n" if kind=='review_class_append' else
                  "require(value['x'] >= 0, 'bad')\n" if kind=='review_module_require' else
                  "def outer(v, errors):\n    def inner():\n        if v['x'] < 0:\n            errors.append('bad')\n    inner()\n")
        class Refusal(Exception): pass
        def require(ok, code):
            if not ok: raise Refusal(code)
        ns = {'require': require, 'value': {'x': 0}}; exec(source, ns)
        backend = g.AstGuards('hidden', source, ns)
        def runner(v, state):
            try:
                errors = []
                if kind=='review_class_require': state.modules['hidden'].Checker().check(v)
                elif kind=='review_class_append': state.modules['hidden'].Checker().check(v, errors)
                elif kind=='review_nested_append': state.modules['hidden'].outer(v, errors)
                else: exec(source, {'require': require, 'value': v})
                return g.Outcome.refuse(errors[0]) if errors else g.Outcome.accept()
            except Refusal as exc: return g.Outcome.refuse(str(exc))
        s = g.Suite(trap['id'], runner, [g.Control('c',dict(x=0),'synthetic')], [], modules=[backend])
        report = g.run(s, memory=memory); independent = g.asdict(runner(dict(x=-1),s.state()))
        return dict(report=report, candidates=backend.candidates(), independently_invalid=independent), (
            report['status']=='FAIL' and bool(report['unproved_guards']) and failure(report,'uninventoried_code_site') and
            all(c.get('reason') for c in backend.candidates() if c['action']=='unsupported') and independent==g.asdict(g.Outcome.refuse('bad')))
    if kind in ('review_consumed_entry', 'review_mutant_entry', 'review_entry_alias', 'review_declared_fragment'):
        schema = {'$id': uri, 'type':'object', '$defs':{'used_directly':{'$anchor':'used','minimum':0}}}
        fragment = uri+'#/$defs/used_directly'
        roots = (uri, fragment) if kind=='review_declared_fragment' else (uri,)
        cat = g.SchemaCatalog({uri:schema}, roots=roots)
        target = next(x.id for x in cat.guards.values() if x.keyword=='type')
        def runner(v, state):
            first = state.schema.validator(uri+'#' if kind=='review_entry_alias' else uri).is_valid(v['root'])
            second = True
            if kind!='review_entry_alias' and (kind!='review_mutant_entry' or state.cuts):
                second = state.schema.validator(uri+'#used').is_valid(v['hidden'])
            return g.Outcome.accept() if first and second else g.Outcome.refuse('schema')
        s = g.Suite(trap['id'], runner, [g.Control('c',dict(root={},hidden=0),'synthetic')],
            [g.Negative('root',dict(root=[],hidden=0),target,'schema','c','root type')],cat)
        if kind=='review_declared_fragment':
            minimum = next(x.id for x in cat.guards.values() if x.keyword=='minimum' and x.entry_uri==fragment)
            s.negatives.append(g.Negative('hidden',dict(root={},hidden=-1),minimum,'schema','c','hidden minimum'))
        report = g.run(s,memory=memory)
        if kind in ('review_entry_alias','review_declared_fragment'):
            caught = report['status']=='PASS'
        else:
            hidden = [x for x in report['inventory'] if x.get('keyword')=='minimum']
            caught = report['status']=='FAIL' and failure(report,'consumed_entry_not_declared') and bool(hidden) and all(
                x['classification']=='unclassified' and x['id'] in report['unproved_guards'] for x in hidden)
            if kind=='review_mutant_entry': caught = caught and all(f['cuts'] for f in report['failures'] if f['kind']=='consumed_entry_not_declared')
        return report, caught
    if kind=='review_dynamic':
        cat = g.SchemaCatalog({uri:{'$defs':{'n':{'$dynamicAnchor':'n','type':'integer','minimum':0}},'$dynamicRef':'#n'}})
        def runner(v,state): return g.Outcome.accept() if state.schema.validator(uri).is_valid(v) else g.Outcome.refuse('schema')
        s = g.Suite(trap['id'],runner,[g.Control('c',0,'synthetic')],[],cat)
        report = g.run(s,memory=memory)
        v = cat.mutated(frozenset()).validator(uri)
        assertions = [x for x in cat.guards.values() if x.keyword in ('type','minimum')]
        return dict(report=report, invalid=v.is_valid(-1), valid=v.is_valid(0)), (report['status']=='FAIL' and not v.is_valid(-1) and v.is_valid(0) and
            len(assertions)==2 and all(x.classification=='unclassified' and x.id in report['unproved_guards'] and x.dialect=='Draft202012Validator' for x in assertions))
    if kind=='review_draft7_sibling':
        cat,s,select = schema_case({'$schema':'http://json-schema.org/draft-07/schema#','definitions':{'n':{'minimum':0}},'$ref':'#/definitions/n','maximum':2},0,
            [('low',-1,'minimum',('definitions','n'),None)])
        report = g.run(s,memory=memory); ignored = cat.guards[select('maximum')]
        return dict(report=report, accepted_three=cat.mutated(frozenset()).validator(uri).is_valid(3)), (report['status']=='PASS' and
            ignored.classification=='unreachable' and 'siblings are ignored' in ignored.evidence and ignored.dialect=='Draft7Validator' and
            ignored.id not in report['unproved_guards'] and cat.mutated(frozenset()).validator(uri).is_valid(3))
    if kind=='review_negated_schema':
        cat,s,select = schema_case({'not':{'minimum':0,'maximum':10}},11,[])
        report = g.run(s,memory=memory)
        blocked = []
        for x in cat.guards.values():
            if x.keyword in ('minimum','maximum'):
                try: cat.mutated(frozenset([x.id]))
                except g.IsolationError: blocked.append(x.id)
        return report, report['status']=='FAIL' and len(blocked)==2 and all(x in report['unproved_guards'] for x in blocked) and not report['rows']
    if kind=='review_non_type':
        cat,s,select = schema_case({'properties':{'user_stop_epoch':{'minimum':0},'body_receipt_ref':{'maxLength':256}}},
            dict(user_stop_epoch=0,body_receipt_ref='ok'),[])
        report = g.run(s,memory=memory)
        return report, report['status']=='FAIL' and all(select(k,p) in report['unproved_guards'] for k,p in (
            ('minimum',('properties','user_stop_epoch')),('maxLength',('properties','body_receipt_ref'))))
    if kind=='review_required':
        cat,s,select = schema_case({'required':['x','y']},dict(x=1,y=1),[
            ('x',dict(y=1),'required',(),'x'),('y',dict(x=1),'required',(),'y')])
        report = g.run(s,memory=memory)
        return report, report['status']=='PASS' and all(row(report,select('required',member=f))['flips']==[f] for f in ('x','y'))
    if kind=='review_foreign_pair':
        cat,s,select = schema_case({'properties':{'event_type':{'const':'own'},'payload_schema_id':{'const':'own.schema'}}},
            dict(event_type='own',payload_schema_id='own.schema'),[
                ('foreign-pair',dict(event_type='other',payload_schema_id='other.schema'),'const',('properties','event_type'),None)])
        report = g.run(s,memory=memory)
        return report, report['status']=='FAIL' and any(x['negative']=='foreign-pair' and x['actual']==g.asdict(g.Outcome.refuse('schema')) for x in report['masked_negatives'])
    if kind=='review_duplicate_peer':
        cat,s,select = schema_case({'allOf':[{'minimum':0},{'minimum':0}],'maximum':10},1,[('upper',11,'maximum',(),None)])
        sites = tuple(x.id for x in cat.guards.values() if x.keyword=='minimum')
        s.duplicates = [g.Duplicate('same-minimum',sites,cat.guards[sites[0]].invariant,'same root field and minimum enforced at two sites')]
        s.negatives.append(g.Negative('lower',-1,'same-minimum','schema','c','lower bound'))
        report = g.run(s,memory=memory)
        return report, report['status']=='PASS' and report['duplicates'][0]['proved'] and row(report,'same-minimum')['flips']==['lower'] and row(report,select('maximum'))['flips']==['upper']
    if kind in ('review_overlap','review_pointer','review_stale'):
        class Refusal(Exception): pass
        source = ("def check(v):\n    if v['x'] < 0 or v['y'] < 0:\n        raise Refusal('bad')\n    return True\n" if kind=='review_overlap' else
                  "def check(v):\n    if len(v['x']) > 8:\n        raise Refusal('bad')\n    if v['x'] != 'ref:ok':\n        raise Refusal('bad')\n    return True\n" if kind=='review_pointer' else
                  "def check(v):\n    if v['x'] < 0:\n        raise Refusal('bad')\n    if v['x'] != v['y']:\n        raise Refusal('copy')\n    return True\n")
        ns = {'Refusal':Refusal}; exec(source,ns); backend = g.AstGuards('review',source,ns); ids=[]; dispositions={}
        for c in backend.candidates():
            if c['action']=='raise':
                field = '/y' if "['y']" in c['expression'] and kind=='review_overlap' else '/x'
                predicate = 'nonnegative' if kind=='review_overlap' else c['expression']
                ids.append(backend.register(c,'copy' if kind=='review_stale' and '!=' in c['expression'] else 'bad',g.Invariant(field,predicate)))
            else: dispositions[c['id']]=g.Classification(c['id'],'selector','accepting terminal')
        def runner(v,state):
            try: state.modules['review'].check(v); return g.Outcome.accept()
            except Refusal as exc: return g.Outcome.refuse(str(exc))
        control = dict(x='ref:ok' if kind=='review_pointer' else 0,y=0)
        bad = dict(x='ref:ok'+'x'*9 if kind=='review_pointer' else -1,y=0)
        s = g.Suite(trap['id'],runner,[g.Control('c',control,'synthetic')],[g.Negative('x',bad,ids[0],'bad','c','target defect')],
            modules=[backend],code_dispositions=dispositions)
        if kind=='review_overlap':
            s.negatives.append(g.Negative('y',dict(x=0,y=-1),ids[1],'bad','c','y defect'))
            independent = g.run(s,memory=memory)
            s.duplicates=[g.Duplicate('invalid-overlap',tuple(ids),backend.sites[ids[0]].guard.invariant,'shared site/code does not prove a duplicate')]
            report = g.run(s,memory=memory)
            return dict(independent=independent,invalid_union=report), independent['status']=='PASS' and report['status']=='FAIL' and any('merges distinct' in f.get('error','') for f in report['failures'])
        report = g.run(s,memory=memory)
        masking_code = 'copy' if kind=='review_stale' else 'bad'
        return report, report['status']=='FAIL' and any(x['negative']=='x' and x['actual']==g.asdict(g.Outcome.refuse(masking_code)) for x in report['masked_negatives'])
    raise AssertionError('unimplemented review trap: '+kind)


def python_audit(g, memory):
    """Behavioral cut/peer tests for falsy returns and an AST seam census."""
    bodies = {'raise': 'raise ValueError("bad")', 'return-False': 'return False',
        'return-None': 'return None', 'return-bare': 'return', 'return-zero': 'return 0',
        'return-float-zero': 'return 0.0', 'return-empty-string': 'return ""',
        'return-list': 'return []', 'return-dict': 'return {}', 'return-set': 'return set()'}
    specs = {name: ('def check(v):\n    if v["x"] < 0:\n        '+body+'\n    if v["y"] < 0:\n        return False\n    return True\n', name not in ('return-list', 'return-dict', 'return-set')) for name, body in bodies.items()}
    specs.update({
        'return-and': ('def check(v):\n    return v["x"] >= 0 and v["y"] >= 0\n', True),
        'return-or-not': ('def check(v):\n    return not (v["x"] < 0 or v["y"] < 0)\n', True),
        'return-chain': ('def check(v):\n    return 0 <= v["x"] <= 10\n', False),
        'return-conditional': ('def check(v):\n    return False if v["x"] < 0 or v["y"] < 0 else True\n', False),
        'return-name': ('def check(v):\n    allowed = v["x"] >= 0 and v["y"] >= 0\n    return allowed\n', False),
        'return-negated-name': ('def check(v):\n    errors = [x for x in v.values() if x < 0]\n    return not errors\n', False),
        'conditional-compound-return': ('def check(v):\n    if True:\n        return v["x"] >= 0 and v["y"] >= 0\n', False),
        'implicit-falsy-return': ('def check(v):\n    if v["x"] >= 0:\n        return True\n', False),
        'require-chain': ('def check(v):\n    require(0 <= v["x"] <= 10, "bad")\n    return True\n', False),
        'opaque-helper': ('def check(v):\n    helper(v)\n    return True\n', False),
        'extend': ('def check(v, errors):\n    if v["x"] < 0:\n        errors.extend(["bad"])\n', False),
        'iadd': ('def check(v, errors):\n    if v["x"] < 0:\n        errors += ["bad"]\n', False),
        'slice-assignment': ('def check(v, errors):\n    if v["x"] < 0:\n        errors[len(errors):] = ["bad"]\n', False),
        'insert': ('def check(v, errors):\n    if v["x"] < 0:\n        errors.insert(0, "bad")\n', False),
        'item-assignment': ('def check(v, errors):\n    if v["x"] < 0:\n        errors[0] = "bad"\n', False),
        'append-clauses': ('def check(v, errors):\n    if v["x"] < 0 or v["y"] < 0:\n        errors.append("bad")\n    return True\n', True),
        'require-clauses': ('def check(v):\n    require(v["x"] >= 0 and v["y"] >= 0, "bad")\n    return True\n', True),
        'assert-clauses': ('def check(v):\n    assert v["x"] >= 0 and v["y"] >= 0, "bad"\n    return True\n', True),
    })
    rows = []
    for name, (source, supported) in specs.items():
        def require(ok, code):
            if not ok: raise ValueError(code)
        ns = {'require': require}; exec(source, ns)
        mod = g.AstGuards('python-audit', source, ns); candidates = mod.candidates()
        dispositions, ids = {}, {}
        for c in candidates:
            if c['expression'] == 'True' and c['action'] == 'predicate':
                dispositions[c['id']] = g.Classification(c['id'], 'selector', 'literal successful terminal return')
            elif c['action'] != 'unsupported':
                field = 'x' if "['x']" in c['expression'] else 'y'
                ids[field] = mod.register(c, 'bad', g.Invariant('/'+field, 'nonnegative'))
        def runner(value, state):
            errors = []
            try:
                result = state.modules['python-audit'].check(value, errors) if 'errors):' in source else state.modules['python-audit'].check(value)
            except (ValueError, AssertionError): return g.Outcome.refuse('bad')
            return g.Outcome.accept() if result is True and not errors else g.Outcome.refuse('bad')
        suite = g.Suite('python-audit/'+name, runner, [g.Control('valid', {'x': 1, 'y': 1}, 'synthetic')],
            [g.Negative(f, {'x': -1 if f == 'x' else 1, 'y': -1 if f == 'y' else 1}, gid, 'bad', 'valid', f+' only') for f, gid in ids.items()],
            modules=[mod], code_dispositions=dispositions)
        report = g.run(suite, memory=memory)
        caught = (report['status'] == 'PASS' and len(report['rows']) == 2 and all(r['proved'] and r['flips'] == [f] for f, gid in ids.items() for r in report['rows'] if r['id'] == gid)) if supported else (
            report['status'] == 'FAIL' and any(c['action'] == 'unsupported' and c['id'] in report['unproved_guards'] for c in candidates))
        rows.append({'construct': name, 'disposition': 'atomic_cuts' if supported else 'fails_closed',
            'predicates': len(ids), 'candidates': candidates, 'report_status': report['status'], 'caught': caught,
            'rows': report['rows'], 'unproved_guards': report['unproved_guards']})
    return rows


def round4_probe(g, trap, memory):
    """Cycle-4 exact witnesses and interpreter-derived completeness gates."""
    import ast
    import copy
    if trap['kind'] == 'round4_census_gate':
        mode = trap['mode']
        name = 'Round4UnclassifiedStatement'
        original = copy.deepcopy(g.PYTHON_AST_POLICY)
        try:
            if mode == 'new_node':
                setattr(ast, name, type(name, (ast.stmt,), {'_fields': (), '__module__': 'ast'}))
            elif mode == 'missing_position':
                del g.PYTHON_AST_POLICY['While']['controlling_context']
            elif mode == 'nonexistent_node':
                g.PYTHON_AST_POLICY[name] = {p: 'closed' for p in g.PYTHON_AST_POSITIONS}
            else:
                raise ValueError(mode)
            report = g.self_test(memory)
            try:
                g.AstGuards('gate', 'def check(v):\n    return True\n', {})
            except g.IsolationError as exc:
                refused = str(exc)
            else:
                refused = ''
            errors = report['python_census']['errors']
            expected = 5 if mode == 'new_node' else 1
            return {'mode': mode, 'gate': report, 'catalog_refusal': refused}, (
                report['status'] == 'FAIL' and len(errors) == expected and bool(refused) and not report['traps'])
        finally:
            g.PYTHON_AST_POLICY.clear()
            g.PYTHON_AST_POLICY.update(original)
            if mode == 'new_node':
                delattr(ast, name)
    if trap['kind'] == 'round4_scalar_boundaries':
        blocked = {}
        for operand in ('(v["x"], v["y"])', '[v["x"], v["y"]]', '{v["x"], v["y"]}',
                        '{"x": v["x"], "y": v["y"]}', '(*v,)', '[*v]',
                        '[x for x in v]', '{x for x in v}', '{x: x for x in v}',
                        '(x for x in v)', '(v["x"] if v["y"] else 0)',
                        '(v["x"] + v["y"])', 'opaque(v)', 'v[0:2]'):
            for side in ('left', 'right'):
                expression = operand + ' == 0' if side == 'left' else '0 == ' + operand
                blocked[expression] = g.python_atom_reason(ast.parse(expression, mode='eval').body)
        allowed = {expr: g.python_atom_reason(ast.parse(expr, mode='eval').body)
                   for expr in ('v["x"] == 0', 'len(v["x"].encode()) > 8', 'v.get("x", 0) >= -1')}
        payloads = []
        for body in ('assert v["x"] >= 0, (v["x"], v["y"])',
                     'assert v["x"] >= 0, opaque(v)',
                     'if v["x"] < 0:\n        raise ValueError((v["x"], v["y"]))',
                     'if v["x"] < 0:\n        errors.append((v["x"], v["y"]))',
                     'require(v["x"] >= 0, opaque(v))',
                     'if v["x"] < 0:\n        refuse(opaque(v))'):
            source = 'def check(v):\n    ' + body + '\n    return True\n'
            module = g.AstGuards('payload', source, {})
            target = module.candidates()[0]
            try:
                module.register(target, 'bad', g.Invariant('/x', 'nonnegative'))
                refused = False
            except g.IsolationError:
                refused = True
            payloads.append({'source': source, 'target': target, 'registration_refused': refused})
        return {'blocked': blocked, 'allowed': allowed, 'payloads': payloads}, (
            all(blocked.values()) and not any(allowed.values()) and all(p['registration_refused'] for p in payloads))
    if trap['kind'] == 'round4_control_boundaries':
        bodies = {
            'while-if': 'while v["x"] < 0 or v["y"] < 0:\n        if True:\n            return False',
            'while-else': 'while False:\n        pass\n    else:\n        return v["x"] >= 0 and v["y"] >= 0',
            'for': 'for x in (v["x"], v["y"]):\n        return False',
            'with': 'with manager():\n        return False',
            'try': 'try:\n        return False\n    finally:\n        pass',
            'except': 'try:\n        pass\n    except ValueError:\n        return False',
            'match': 'match v:\n        case {"x": x} if x < 0:\n            return False',
            'nested-if': 'if v["x"] < 0:\n        if v["y"] < 0:\n            return False',
            'if-else': 'if v["x"] >= 0 and v["y"] >= 0:\n        pass\n    else:\n        return False',
        }
        rows = []
        for name, body in bodies.items():
            source = 'def check(v):\n    ' + body + '\n    return True\n'
            mod = g.AstGuards('context', source, {})
            refusal_lines = {n.lineno for n in ast.walk(mod.tree) if isinstance(n, ast.Return)
                             and not (isinstance(n.value, ast.Constant) and n.value.value is True)}
            refusals = [c for c in mod.candidates() if c['line'] in refusal_lines]
            blocked = []
            for candidate in refusals:
                try:
                    mod.register(candidate, 'bad', g.Invariant('/', 'must not credit unsupported control'))
                except g.IsolationError:
                    blocked.append(candidate['id'])
            rows.append({'name': name, 'source': source, 'refusals': refusals, 'blocked': blocked})
        return {'rows': rows}, all(r['refusals'] and len(r['blocked']) == len(r['refusals'])
                                  and all(c['action'] == 'unsupported' and c['predicate_count'] is None and not c['cut'] for c in r['refusals']) for r in rows)

    source, name = trap['source'], trap['id']
    ns = {}; exec(source, ns)
    mod = g.AstGuards(name, source, ns)
    candidates = mod.candidates()
    target = next(c for c in candidates if c['line'] == trap['target_line'] and c['expression'] == trap['target_expression'])
    dispositions = {c['id']: g.Classification(c['id'], 'selector', 'unconditional literal successful terminal return')
                    for c in candidates if c['expression'] == 'True' and c['action'] == 'predicate'}
    def runner(value, state):
        try:
            result = state.modules[name].check(value)
        except ValueError as exc:
            return g.Outcome.refuse(str(exc))
        return g.Outcome.accept() if result is True else g.Outcome.refuse('bad')
    good, bad_x, bad_y = {'x': 0, 'y': 0}, {'x': -1, 'y': 0}, {'x': 0, 'y': -1}
    reports, blocked = {}, {}
    for mode, fields in (('single', ('x',)), ('aggregate', ('x', 'y'))):
        invariant = g.Invariant('/x' if mode == 'single' else '/', trap['invariants'][mode])
        try:
            mod.register(target, 'bad', invariant, evidence='exact cycle-4 ' + mode + ' binding')
        except g.IsolationError as exc:
            blocked[mode] = str(exc)
        suite = g.Suite(name + '/' + mode, runner, [g.Control('valid', good, 'synthetic')],
            [g.Negative(f, bad_x if f == 'x' else bad_y, target['id'], 'bad', 'valid', 'only '+f) for f in fields],
            modules=[mod], code_dispositions=dispositions)
        reports[mode] = g.run(suite, memory=memory)
    baseline = [g.asdict(runner(v, suite.state())) for v in (good, bad_x, bad_y)]
    independent = {}
    for cut, narrow_source in trap['independent_sources'].items():
        env = {}; exec(narrow_source, env)
        accepted = []
        for value in (good, bad_x, bad_y):
            try:
                accepted.append(env['check'](value) is True)
            except ValueError:
                accepted.append(False)
        independent[cut] = accepted
    return {'source': source, 'candidate': target, 'all_candidates': candidates,
            'single_report': reports['single'], 'aggregate_report': reports['aggregate'],
            'blocked_registrations': blocked, 'baseline': baseline,
            'heldout_y_before': baseline[2], 'heldout_y_after_x_cut': None,
            'cut_unavailable': 'unsupported registration refused; no cut receives credit',
            'independent_witnesses': independent}, (
        baseline == [g.asdict(g.Outcome.accept()), g.asdict(g.Outcome.refuse('bad')), g.asdict(g.Outcome.refuse('bad'))]
        and target['action'] == 'unsupported' and target['predicate_count'] is None and not target['cut']
        and set(blocked) == {'single', 'aggregate'}
        and all(r['status'] == 'FAIL' and target['id'] in r['unproved_guards'] and not any(row.get('proved') for row in r['rows']) for r in reports.values())
        and independent == {'x_only_cut': [True, True, False], 'y_only_cut': [True, False, True]})
