"""Shared finite NUMRULE oracle runner; imported by pm_event_numbers --self-test.

This models trusted custody with a separate sealed fixture lookup. It does not
authenticate a native store, register a family, or run the other drafting lanes.
"""
from __future__ import annotations

import ast
from dataclasses import replace
from decimal import Decimal
import hashlib
import json
from pathlib import Path
import struct
import sys
import types


def _value(value):
    if type(value) is dict:
        if set(value) == {"@int"}:
            import pm_event_numbers as m
            return m._integer_digits(value["@int"])
        if set(value) == {"@float"}:
            return float(value["@float"])
        if set(value) == {"@decimal"}:
            return Decimal(value["@decimal"])
        if set(value) == {"@binary"}:
            return bytes.fromhex(value["@binary"])
        return {k: _value(v) for k, v in value.items()}
    if type(value) is list:
        return [_value(v) for v in value]
    return value


def _retained(m, case, corpus):
    raw = corpus["historical_originals"][case.get("original", "integral_float")].encode()
    binding = m.OriginalBinding("store-A", "application", "server-A", None,
                                "fixture.number", "original-event", "original-key",
                                "original-operation", hashlib.sha256(raw).hexdigest())
    base_recipe = m.RecipeTuple("pm.event.v0", "1.0.0", "fixture.payload", "1.0.0",
                               "fixture.original-owner", "earlier-edition", "earlier-registry",
                               "fixture.identity.old", "fixture.decimal.old", m.EVENT_VALUE,
                               "fixture.full.old", "fixture.source.old", "application/json",
                               hashlib.sha256(b"frozen fixture resources").hexdigest())
    current_recipe = replace(base_recipe, owner_edition="current-edition",
                             identity_recipe="fixture.identity.current")
    original = m.OriginalCustody(binding, base_recipe, raw, b"original-result", b"original-receipt")
    scenario = case.get("scenario", "valid")
    if scenario == "current_original":
        original = replace(original, recipe=current_recipe)
    sealed = original
    expected = binding
    override = None
    allow = True
    observed = original
    if scenario.startswith("foreign_"):
        name = scenario.removeprefix("foreign_")
        val = "foreign" if name != "project_id" else "foreign-project"
        if name == "scope_kind":
            expected = replace(binding, scope_kind="project", project_id="foreign-project")
        elif name == "project_id":
            # Valid project context, different original project, one changed join.
            binding = replace(binding, scope_kind="project", project_id="project-A")
            original = replace(original, binding=binding)
            sealed = observed = original
            expected = replace(binding, project_id=val)
        else:
            expected = replace(binding, **{name: val})
    elif scenario == "caller_override":
        override = base_recipe
    elif scenario == "downgrade":
        sealed = replace(original, recipe=current_recipe)
        observed = original  # Supported old recipe, wrong original selection.
    elif scenario == "unknown_recipe":
        observed = replace(original, recipe=replace(base_recipe, identity_recipe="unregistered"))
    elif scenario == "rewritten_resources":
        observed = replace(original, recipe=replace(base_recipe, resource_manifest_sha256="f" * 64))
    elif scenario == "ambiguous":
        observed = (original, replace(original, recipe=current_recipe))
    elif scenario == "missing":
        observed = None
    elif scenario == "self_authenticated_dict":
        observed = {"verified": True, "original": original, "sha256": hashlib.sha256(raw).hexdigest()}
    elif scenario == "verified_string":
        observed = {"verified": "true", "original": original}
    elif scenario == "forged_bytes_selfhash":
        forged = raw.replace(b'1.0', b'2.0')
        forged_binding = replace(binding, source_commitment=hashlib.sha256(forged).hexdigest())
        observed = replace(original, binding=forged_binding, record_bytes=forged)
        expected = forged_binding  # Re-key the caller hash too; anchor remains original.
    elif scenario in ("forged_result", "forged_receipt"):
        observed = replace(original, **{scenario.removeprefix("forged_") + "_bytes": b"forged"})
    elif scenario == "string_record_bytes":
        observed = replace(original, record_bytes=raw.decode())
    elif scenario in ("denied", "deleted", "withdrawn", "hold_denied"):
        allow = False
    elif scenario == "truthy_disclosure":
        allow = "true"

    calls = []

    class FixtureOwner:
        def authenticated_original(self, ref):
            if ref != "sealed-ref":
                raise m.Refusal("original_authority")
            return observed

    def verify(record):
        calls.append(record.recipe)
        # Exact independent original pin joins bytes/identity/source/recipe/result.
        # These names describe fixture recipes, not newly registered product IDs.
        return (record == sealed and
                hashlib.sha256(record.record_bytes).hexdigest() == record.binding.source_commitment)

    dispatcher = m.RetainedDispatcher(FixtureOwner(), {
        base_recipe: m.FrozenRecipe(verify), current_recipe: m.FrozenRecipe(verify),
    })
    try:
        out = dispatcher.resolve("sealed-ref", expected, disclose=lambda b: allow,
                                 recipe_override=override)
    finally:
        if len(calls) > 1:
            raise AssertionError("tried alternative recipes")
    if out.record_bytes != observed.record_bytes or out.result_bytes != b"original-result" or out.receipt_bytes != b"original-receipt":
        raise AssertionError("retained output changed")
    return "original-returned-with-zero-effects"


def execute(m, case, corpus):
    op = case["op"]
    if op == "token":
        m.current_integer_token(case["raw"], **case.get("bounds", {}))
        return "accepted"
    if op == "slot":
        tree = m.loads_exact('{"nested":{"number":' + case["raw"] + '}}')
        m.current_integer(tree["nested"]["number"], **case.get("bounds", {}))
        return "accepted"
    if op == "integer":
        m.current_integer(_value(case["value"]), **case.get("bounds", {}))
        return "accepted"
    if op == "uint64":
        m.storage_uint64(_value(case["value"]))
        return "accepted"
    if op == "boolean":
        m.exact_boolean(_value(case["value"]))
        return "accepted"
    if op == "append_policy":
        return m.current_append_policy(case["value"])
    if op == "parse":
        m.loads_exact(case["raw"])
        return "accepted"
    if op == "parse_token":
        return m.loads_exact(case["raw"]).token
    if op == "current_json":
        m.loads_current_json(case["raw"])
        return "accepted"
    if op == "jcs":
        return m.qualified_jcs(m.loads_exact(case["raw"])).decode()
    if op == "jcs_value":
        return m.qualified_jcs(_value(case["value"]),
                               type_sensitive_paths={()} if case.get("typed") else set()).decode()
    if op == "physical":
        return m.storage_value_bytes(_value(case["value"]), profile=case.get("profile", m.EVENT_VALUE)).hex()
    if op == "decode":
        m.decode_storage_value(bytes.fromhex(case["hex"]), profile=case.get("profile", m.EVENT_VALUE))
        return "accepted"
    if op == "history":
        return _retained(m, case, corpus)
    if op == "recipe_constructor":
        values = ["fixture"] * 13 + ["a" * 64]
        values[case.get("field_index", 13)] = case["value"]
        m.RecipeTuple(*values)
        return "accepted"
    if op == "payload":
        import blake3
        raw = (case.get("raw", "x") * case["length"]).encode()
        original = (case.get("original_raw", case.get("raw", "x")) * case["length"]).encode()
        descriptor = {"byte_size": len(original), "id": blake3.blake3(original).hexdigest(),
                      "media_type": "application/json"}
        descriptor.update(case.get("descriptor", {}))
        m.verify_payload_bytes(raw, byte_size=descriptor["byte_size"], payload_id=descriptor["id"],
                               media_type=descriptor["media_type"], expected_media_type="application/json",
                               inline=case.get("route", "inline") == "inline")
        return "accepted"
    raise AssertionError("Unknown corpus operation: " + op)


def _mutation_module(m, reasons, name):
    """Remove the named authored refusal guards; no corpus input is repaired."""
    tree = ast.parse(Path(m.__file__).read_text())

    class Remove(ast.NodeTransformer):
        def visit_Expr(self, node):
            call = node.value
            if (isinstance(call, ast.Call) and isinstance(call.func, ast.Name) and
                    call.func.id == "_refuse" and call.args and
                    isinstance(call.args[0], ast.Constant) and call.args[0].value in reasons):
                return ast.Pass()
            return self.generic_visit(node)

        def visit_If(self, node):
            if len(node.body) == 1 and isinstance(node.body[0], ast.Expr):
                call = node.body[0].value
                if (isinstance(call, ast.Call) and isinstance(call.func, ast.Name) and
                        call.func.id == "_refuse" and call.args and
                        isinstance(call.args[0], ast.Constant) and call.args[0].value in reasons):
                    return ast.Pass()
            return self.generic_visit(node)
    module = types.ModuleType(name)
    module.__file__ = m.__file__
    sys.modules[name] = module
    exec(compile(ast.fix_missing_locations(Remove().visit(tree)), m.__file__, "exec"), module.__dict__)
    return module


def run_corpus(path):
    import pm_event_numbers as m
    corpus = json.loads(Path(path).read_text(), object_pairs_hook=m._unique_object)
    failures, outcomes = [], {}
    for c in corpus["cases"]:
        try:
            output = execute(m, c, corpus)
            actual = {"output": output}
        except m.Refusal as error:
            actual = {"error": error.reason}
        except Exception as error:
            actual = {"unexpected": type(error).__name__ + ": " + str(error)}
        expected = {"error": c["error"]} if "error" in c else {"output": c["output"]}
        outcomes[c["id"]] = actual
        if actual != expected:
            failures.append({"id": c["id"], "expected": expected, "actual": actual})
    cases = {c["id"]: c for c in corpus["cases"]}
    proofs = []
    for index, proof in enumerate(corpus["guard_removal"]):
        name = "_pm_number_mutant_" + str(index)
        module = _mutation_module(m, set(proof["guards"]), name)
        flipped = []
        for case_id in proof["case_ids"]:
            try:
                execute(module, cases[case_id], corpus)
                flipped.append(case_id)
            except Exception:
                pass
        # An unrelated exact boolean guard must survive every non-boolean mutation.
        control = "int-string" if "boolean_type" in proof["guards"] else "bool-number"
        try:
            execute(module, cases[control], corpus)
            isolated = False
        except module.Refusal:
            isolated = True
        except Exception:
            isolated = False
        ok = flipped == proof["case_ids"] and isolated
        proofs.append({"guards": proof["guards"], "flipped": flipped, "unrelated_control_refused": isolated, "pass": ok})
        if not ok:
            failures.append({"guard_proof": proof, "flipped": flipped, "isolated": isolated})
        del sys.modules[name]
    # Real unchanged owner vectors, not self-generated expected bytes.
    root = Path(__file__).resolve().parents[1]
    wire = json.loads((root / "Plans/seglog_frame_v2_wire_fixtures.json").read_text())
    frame = bytes.fromhex(wire["base_frame_hex"])
    header_length = int.from_bytes(frame[9:11], "little")
    original_payload = frame[48 + header_length:]
    checks = {
        "frozen_complete_event_bytes": m.storage_value_bytes(wire["base_event"]) == original_payload,
        "frozen_complete_event_decode": m.decode_storage_value(original_payload) == wire["base_event"],
    }
    full = json.loads((root / "Plans/event_append_receipt_full_value_fixtures.json").read_text())
    checks["frozen_full_value_commitment"] = m.full_value_commitment(full["base_original_event"]) == full["commitment_sha256"]
    event = wire["base_event"]
    producer = m.producer_semantic_digest(event)
    for field, val in (("sequence_id", (1 << 64) - 1), ("observed_at_utc", "2099-01-01T00:00:00Z"),
                       ("persisted_at_utc", "2099-01-01T00:00:00Z")):
        changed = dict(event, **{field: val})
        checks["producer_excludes_" + field] = m.producer_semantic_digest(changed) == producer
        checks["full_value_includes_" + field] = m.full_value_commitment(changed) != m.full_value_commitment(event)
    for field in m.PRODUCER_FIELDS:
        changed = dict(event, **{field: "changed-caller-value"})
        checks["producer_includes_" + field] = m.producer_semantic_digest(changed) != producer
        omitted = {k: v for k, v in event.items() if k != field}
        try:
            m.producer_semantic_digest(omitted)
            checks["producer_requires_present_" + field] = False
        except m.Refusal as error:
            checks["producer_requires_present_" + field] = error.reason == "producer_projection"
    from pm_projects_refresh_contracts import semantic_hash
    for left, right in ((1, 1.0), (0.0, -0.0), (True, 1)):
        checks["app_typed_" + repr(left) + "_vs_" + repr(right)] = semantic_hash("accepted_source", left) != semantic_hash("accepted_source", right)
    checks["app_arbitrary_integer"] = semantic_hash("accepted_source", 1 << 100) != semantic_hash("accepted_source", (1 << 100) + 1)
    import blake3
    for n in (16384, 16385):
        raw = b"x" * n
        checks["payload_exact_size_" + str(n)] = len(raw) == n and blake3.blake3(raw).digest() != blake3.blake3(raw + b"\n").digest()
    for name, ok in checks.items():
        if not ok:
            failures.append({"integration_check": name})
    return {"status": "fail" if failures else "pass", "corpus_cases": len(corpus["cases"]),
            "case_passes": len(corpus["cases"]) - sum("id" in f for f in failures),
            "guard_removal": proofs, "owner_integration_checks": checks,
            "conflicts_covered": sorted({x for c in corpus["cases"] for x in c["conflicts"]}),
            "failures": failures, "native_authority": "NOT_RUN",
            "scope": "Shared adapter/corpus only; no complete lane checker or family admission."}
