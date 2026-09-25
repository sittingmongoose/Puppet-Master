"""Existing capability/Permissions/lifecycle owner joins. No effect dispatcher."""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import json
import os
from pathlib import Path
import sys

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

CANON = Path(os.environ.get("PM_CANON_ROOT", str(Path(__file__).resolve().parents[1])))
sys.path.insert(0, str(CANON / "scripts"))
from pm_capability_continuation_semantics import OwnerValue
from pm_full_thread_semantics import full_thread_semantic_failures, command_outcome_binding_failures
from pm_ui_command_response import owner_result_digest as digest

SCHEMA_FILE = "capability_ensure_custody_contracts.schema.json"
RESULT_ROUTE = {"path": "Plans/" + SCHEMA_FILE, "json_pointer": "#/$defs/capability_ensure_result_v2",
                "schema_id": "pm.shared_runtime.capability_ensure_result.v2"}
SCOPE = ("scope_kind", "server_id", "project_id", "project_home_server_id", "named_plan_id",
         "execution_host_id", "execution_environment_id", "topology_generation")


@lru_cache(maxsize=1)
def schemas():
    names = [SCHEMA_FILE, "shared_runtime_contracts.schema.json",
             "shared_runtime_command_contracts.schema.json", "full_thread_runtime_contracts.schema.json",
             "capability_provisioning_continuation_contracts.schema.json"]
    docs = {}
    for name in names:
        root = Path(__file__).resolve().parents[1] if name == SCHEMA_FILE else CANON
        docs[name] = json.loads((root / "Plans" / name).read_text())
    registry = Registry().with_resources((v["$id"], Resource.from_contents(v)) for v in docs.values())
    return docs, registry


def shape(definition, value, namespace=SCHEMA_FILE):
    docs, registry = schemas()
    doc = docs[namespace]
    return [e.message for e in Draft202012Validator(
        {"$schema": doc["$schema"], "$ref": doc["$id"] + "#/$defs/" + definition},
        registry=registry, format_checker=FormatChecker()).iter_errors(value)]


def binding(record):
    return dict(record_ref=record.record_ref, generation=record.generation, sha256=digest(record.value))


def time(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def operation_relationships(value):
    """Necessary same-family value joins; original custody still needs its owner."""
    if shape("capability_provisioning_operation_v2", value):
        return ["operation_shape"]
    errors = []
    op = value["operation"]
    seen_waiters, seen_requests = set(), set()
    for entry in value["origins"]:
        d, w, p, ready, current, settlement = [entry[k] for k in
            ("demand", "waiter", "permission", "readiness", "currentness", "settlement")]
        if w["waiter_ref"] in seen_waiters or entry["request"]["record_ref"] in seen_requests:
            errors.append("duplicate_origin")
        seen_waiters.add(w["waiter_ref"]); seen_requests.add(entry["request"]["record_ref"])
        if w["demand"]["record_ref"] != d["demand_ref"] or w["demand"]["sha256"] != digest(d):
            errors.append("stored_demand_binding")
        if w["shared_operation_id"] != op["operation_id"]:
            errors.append("stored_waiter_operation")
        if (d["capability_id"], d["origin_identity"]["execution_host_id"],
            d["origin_identity"]["execution_environment_id"], d["origin_identity"]["topology_generation"]) != (
            op["capability_id"], op["host_id"], op["environment_id"], value["topology_generation"]):
            errors.append("stored_demand_target")
        if p is not None and (p["request"] != entry["request"] or p["policy"] != w["admitted_policy"]
                              or p["effective_mode"] != w["effective_mode"]):
            errors.append("stored_permission_binding")
        if ready is not None and (ready["shared_operation_id"] != op["operation_id"]
                                  or ready["capability_id"] != d["capability_id"]):
            errors.append("stored_readiness_binding")
        if ready is not None:
            if op["phase"] != "ready" or p is None:
                errors.append("stored_ready_without_originals")
            if ready["compatibility_requirement"] != d["compatibility_requirement"]:
                errors.append("stored_readiness_requirement")
            for field in ("execution_host_id", "execution_environment_id", "topology_generation"):
                if ready[field] != d["origin_identity"][field]:
                    errors.append("stored_readiness_target")
            if ready["readiness_basis"] == "verified_provisioning" and w["effective_mode"] == "Off":
                errors.append("stored_off_provisioning")
        if current is not None and current["waiter_ref"] != w["waiter_ref"]:
            errors.append("stored_currentness_waiter")
        if settlement is not None:
            if current is None or settlement["currentness_snapshot_ref"] != current["snapshot_ref"]:
                errors.append("stored_settlement_currentness")
            if (settlement["waiter_ref"], settlement["provisioning_operation_ref"],
                settlement["readiness_result_ref"]) != (
                w["waiter_ref"], value["operation_ref"], None if ready is None else ready["result_ref"]):
                errors.append("stored_settlement_binding")
    return errors


def _proof(callback, label, *args):
    try:
        result = callback(*args)
    except (KeyError, ValueError, TypeError, OSError):
        return [label + "_unavailable"]
    if not isinstance(result, list) or any(not isinstance(x, str) or not x for x in result):
        return [label + "_invalid_response"]
    return [label + ":" + x for x in result]


def validate_current_write(operation_ref, *, resolve_record, verify_writer_admission):
    """Native owner must authenticate all originals, IRT-009 and storage admission.

    This validates candidate value relationships only, never writes or migrates.
    verify_writer_admission includes every origin's actual custody and immutable
    original lifetime/holds, genuine storage version and current write fence.
    """
    try:
        record = resolve_record("operation", operation_ref)
        if not isinstance(record, OwnerValue) or record.record_ref != operation_ref:
            return ["writer_original_unavailable"]
        original = deepcopy(record)
        value = record.value
        errors = operation_relationships(value)
        if errors:
            return errors
        if value["operation_ref"] != operation_ref or value["operation_generation"] != record.generation:
            errors.append("writer_identity")
        errors += _proof(verify_writer_admission, "writer_admission", record)
        if record != original:
            errors.append("writer_original_changed")
        return errors
    except (KeyError, ValueError, TypeError, OSError):
        return ["writer_original_unavailable"]


def validate_ensure_result(result_ref, *, resolve_record, verify_original_admission,
        verify_permission_issuer, verify_coalescing, validate_continuation,
        verify_effect_owner, check_current_disclosure):
    """Resolve actual originals; callbacks are real owner adapters, not grants.

    Kinds: result/request/operation/outcome/work/permission/admission/effect.
    Original admission authenticates request, demand/source/requirement/policy,
    topology and command idempotency admission. Permissions authenticates its
    original decision, approvals/audit and effect-time validity/revocation.
    Coalescing validates IRT-009's exact fourteen fields and independent waiters.
    Continuation invokes the actual CP004 validator with its mandatory native
    adapters; no standalone reference-only continuation proof is sufficient.
    Effect owner verifies actual result semantics and independent lifecycle/
    Connection target, source/provenance, verification, work and original effect
    gates, including no-effect and failed paths. Final disclosure checks original
    surviving custody and current read authority after every helper.
    No method authorizes dispatch, resumes work or converts stale history to ready.
    """
    errors, originals = [], []
    def eq(a, b, label):
        if a != b:
            errors.append(label)
    def read(kind, ref, definition=None, namespace=SCHEMA_FILE):
        record = resolve_record(kind, ref)
        if not isinstance(record, OwnerValue) or record.record_ref != ref:
            raise ValueError("original identity")
        if type(record.generation) is not int or record.generation < 0:
            raise ValueError("original generation")
        # Capture immediately: later resolvers may not rewrite an earlier source.
        originals.append((record, deepcopy(record)))
        if definition and shape(definition, record.value, namespace):
            raise ValueError("original shape")
        return record
    try:
        rr = read("result", result_ref, "capability_ensure_result_v2"); result = rr.value
        qr = read("request", result["request"]["record_ref"], "capability_ensure_request_v2"); request = qr.value
        ar = read("operation", result["operation_record"]["record_ref"], "capability_provisioning_operation_v2")
        aggregate = ar.value; op = aggregate["operation"]
        errors += operation_relationships(aggregate)
        eq(result["request"], binding(qr), "result_request_binding")
        eq(result["operation_record"], binding(ar), "result_operation_binding")
        eq(aggregate["operation_ref"], ar.record_ref, "operation_reference")
        eq(aggregate["operation_generation"], ar.generation, "operation_generation")
        matches = [x for x in aggregate["origins"] if x["waiter"]["waiter_ref"] == result["waiter_ref"]]
        if len(matches) != 1:
            return ["result_waiter_membership"]
        entry = matches[0]
        demand, waiter, decision, ready, current, settlement = [entry[k] for k in
            ("demand", "waiter", "permission", "readiness", "currentness", "settlement")]
        eq(entry["request"], binding(qr), "origin_request_binding")
        eq(request["demand"], waiter["demand"], "request_demand_binding")
        eq(request["requirement_ref"], demand["demand_ref"], "request_requirement")
        eq(request["origin_operation_id"], demand["origin_identity"]["operation_id"], "request_origin")
        eq(request["capability_id"], demand["capability_id"], "request_capability")
        eq(request["provisioning_mode"], demand["requested_mode"], "request_policy")
        for field in SCOPE:
            eq(request[field], demand["origin_identity"][field], "request_scope_" + field)
        for field in ("plan_id", "run_id", "agent_id", "crew_id"):
            eq(request[field], demand["origin_lineage"][field], "request_lineage_" + field)
        # Optional IdentityEnvelope lineage is absent when it does not participate.
        # A nullable request null does not manufacture an absent owner field.
        for field in ("goal_id", "thread_id", "source_location_id"):
            eq(request[field], demand["origin_identity"].get(field), "request_lineage_" + field)
        eq(result["command_instance_id"], request["command_instance_id"], "result_command_instance")
        eq(result["operation_id"], op["operation_id"], "result_operation")
        eq(result["subject_ref"], ar.record_ref, "result_subject")
        eq(result["current_revision_or_epoch"], ar.generation, "result_generation")
        eq(result["observable_work_id"], op["observable_work_id"], "result_work")
        if result["replayed"]:
            eq(result["original_operation_id"], op["operation_id"], "replay_operation")
        outcome_r = read("outcome", result["command_outcome_ref"], "CommandOutcomeRecord",
                         "full_thread_runtime_contracts.schema.json"); outcome = outcome_r.value
        work_r = read("work", result["work_record"]["record_ref"], "ObservableWorkRecord",
                      "full_thread_runtime_contracts.schema.json"); work = work_r.value
        eq(result["work_record"], binding(work_r), "original_work_binding")
        eq(work["identity"], aggregate["work_identity"], "shared_work_identity")
        errors += command_outcome_binding_failures(result, outcome, outcome_r.record_ref)
        errors += full_thread_semantic_failures("CommandOutcomeRecord", outcome)
        errors += full_thread_semantic_failures("ObservableWorkRecord", work)
        eq(outcome["owner_result_ref"], rr.record_ref, "outcome_result_ref")
        eq(outcome["owner_result_sha256"], digest(result), "outcome_result_digest")
        eq(outcome["owner_result_schema_ref"], RESULT_ROUTE, "outcome_result_schema")
        eq(outcome["payload_sha256"], digest(request), "outcome_request_digest")
        eq(outcome["idempotency_key"], request["idempotency"]["idempotency_key"], "outcome_idempotency")
        eq(outcome["target_generation"], request["topology_generation"], "outcome_target_generation")
        for field in SCOPE:
            eq(outcome["identity"][field], request[field], "outcome_scope_" + field)
        for field, expected in (("operation_id", op["operation_id"]), ("operation_generation", ar.generation),
                                ("server_id", aggregate["server_id"]), ("execution_host_id", op["host_id"]),
                                ("execution_environment_id", op["environment_id"]),
                                ("topology_generation", aggregate["topology_generation"])):
            eq(work["identity"][field], expected, "work_identity_" + field)
            eq(outcome["identity"][field], expected, "outcome_identity_" + field)
        if ar.record_ref not in work["subject_refs"]:
            errors.append("work_subject")
        eq(work["observable_work_id"], op["observable_work_id"], "work_id")
        errors += _proof(verify_original_admission, "original_admission", qr, ar, entry)
        errors += _proof(verify_coalescing, "coalescing", ar, work_r)

        if decision is not None:
            pr = read("permission", decision["decision_ref"], "capability_operation_decision")
            eq(pr.value, decision, "actual_permission_value")
            eq(decision["identity"], outcome["identity"], "permission_operation_identity")
            eq(decision["actor_ref"], request["actor_ref"], "permission_actor")
            eq(decision["request"], binding(qr), "permission_request")
            eq(decision["effect"]["capability_id"], demand["capability_id"], "permission_capability")
            eq(decision["effect"]["compatibility_requirement"], demand["compatibility_requirement"], "permission_requirement")
            eq(decision["effect"]["effect_scope"], demand["requested_effect_scope"], "permission_effect_scope")
            snapshot = decision["attempt_snapshot"]
            eq(request["permission_snapshot_ref"], None if snapshot is None else snapshot["record_ref"], "permission_attempt")
            if request["scope_kind"] == "application" and snapshot is not None:
                errors.append("application_fake_attempt_snapshot")
            errors += _proof(verify_permission_issuer, "permission_issuer", pr, qr, ar, entry)
            if not time(decision["captured_at_utc"]) < time(decision["expires_at_utc"]):
                errors.append("permission_validity_interval")

        status = result["outcome"]
        terminal = status != "accepted"
        expected_outcome = {"accepted": ("accepted", "acknowledged", "executing"), "succeeded": ("succeeded",),
            "no_change": ("succeeded",), "blocked": ("rejected",), "failed": ("failed",),
            "cancelled": ("cancelled",), "recovery_required": ("terminal_unknown",)}[status]
        if outcome["outcome"] not in expected_outcome:
            errors.append("command_outcome_status")
        if status in ("succeeded", "no_change"):
            if ready is None or settlement is None or decision is None:
                return errors + ["ready_originals_missing"]
            eq(op["phase"], "ready", "operation_not_ready")
            eq(work["work_state"], "completed", "work_not_completed")
            eq(decision["decision"], "allow", "permission_not_allowed")
            if decision["audit"] is None:
                errors.append("permission_audit_missing")
            basis = "existing_verified_capability" if status == "no_change" else "verified_provisioning"
            eq(ready["readiness_basis"], basis, "success_vs_already_ready")
            eq(result["readiness_ref"], ready["result_ref"], "result_readiness")
            eq(result["terminal_owner_result_ref"], ready["result_ref"], "result_ready_receipt")
            eq(work.get("result_receipt_ref"), ready["result_ref"], "work_ready_receipt")
            if result["error"] is not None or result["disabled_reason"] is not None:
                errors.append("success_has_error")
            if basis == "verified_provisioning" and waiter["effective_mode"] == "Off":
                errors.append("off_new_provisioning")
            if basis == "verified_provisioning" and decision["effect"]["lifecycle_request"] is None:
                errors.append("provisioning_effect_request_missing")
            if basis == "existing_verified_capability" and (ready["effect_result"] is not None
                    or op["installation_operation_ref"] is not None or decision["effect"]["lifecycle_request"] is not None):
                errors.append("already_ready_has_new_effect")
            # Expiry is checked by the actual Permissions/effect owner at its
            # original effect fence, not against a later observation/settlement.
            # A delayed successful result does not rewrite historical admission.
        elif terminal:
            allowed = {"blocked": ("blocked",), "failed": ("failed", "rolled_back"),
                       "cancelled": ("cancelled",), "recovery_required": ("recovery_required",)}[status]
            if op["phase"] not in allowed:
                errors.append("failure_phase")
            eq(result["readiness_ref"], None, "failure_claims_ready")
            if ready is not None:
                errors.append("failure_has_readiness")
            if settlement is None:
                errors.append("failure_settlement_missing")
            else:
                eq(result["terminal_owner_result_ref"], settlement["settlement_ref"], "failure_receipt")
            expected_work = {"blocked": "failed", "failed": "failed", "cancelled": "cancelled",
                             "recovery_required": "recovery-required"}[status]
            eq(work["work_state"], expected_work, "failure_work_status")
        else:
            if op["phase"] in ("ready", "blocked", "failed", "cancelled", "rolled_back", "recovery_required"):
                errors.append("accepted_is_terminal")
            if work["work_state"] in ("completed", "failed", "cancelled", "recovery-required"):
                errors.append("accepted_work_terminal")
            if result["terminal_owner_result_ref"] is not None or result["readiness_ref"] is not None or result["settlement_ref"] is not None:
                errors.append("accepted_claims_terminal")

        if terminal:
            eq(result["settlement_ref"], None if settlement is None else settlement["settlement_ref"], "result_settlement")
            eq(outcome["result_receipt_ref"], result["terminal_owner_result_ref"], "outcome_receipt")
            if result["terminal_owner_result_ref"] not in result["receipt_refs"]:
                errors.append("result_receipt_membership")
            if settlement is not None:
                errors += _proof(validate_continuation, "continuation", ar, entry)
        effect = None
        if ready is not None and ready["effect_result"] is not None:
            effect = read("effect", ready["effect_result"]["record_ref"])
            eq(ready["effect_result"], binding(effect), "actual_effect_binding")
            if ready["subject"]["kind"] == "Installation":
                if shape("installation_lifecycle_record_v2", effect.value):
                    errors.append("installation_effect_shape")
                elif decision is None:
                    errors.append("installation_permission_missing")
                else:
                    admission = read("admission", decision["effect"]["lifecycle_request"]["record_ref"],
                                     "capability_lifecycle_admission")
                    errors += lifecycle_relationships(effect, admission, pr, qr, ar, ready)
            elif op["installation_operation_ref"] is not None:
                errors.append("connection_fake_installation")
        errors += _proof(verify_effect_owner, "effect_owner", qr, ar, entry, effect, work_r)
        errors += _proof(check_current_disclosure, "current_disclosure", rr, qr, ar, outcome_r, work_r)
        if any(record != frozen for record, frozen in originals):
            errors.append("original_changed_by_helper")
        return sorted(set(errors))
    except (KeyError, ValueError, TypeError, OSError, OverflowError):
        return sorted(set(errors + ["ensure_original_unavailable"]))


def validate_ensure_response(response, original_result_ref, *, resolve_record, **owner_adapters):
    """Replay decoration cannot rewrite the actual original result/outcome.

    The same mandatory adapters and current disclosure fence apply. This pure
    comparison is not a native transport release fence or a dispatch permit.
    """
    try:
        original = resolve_record("result", original_result_ref)
        if not isinstance(original, OwnerValue) or original.record_ref != original_result_ref:
            return ["response_original_unavailable"]
        frozen_original, frozen_response = deepcopy(original), deepcopy(response)
        if shape("capability_ensure_result_v2", response):
            return ["response_shape"]
        def read(kind, ref):
            return original if (kind, ref) == ("result", original_result_ref) else resolve_record(kind, ref)
        errors = validate_ensure_result(original_result_ref, resolve_record=read, **owner_adapters)
        expected = deepcopy(frozen_original.value)
        if response["replayed"]:
            expected.update(replayed=True, original_operation_id=expected["operation_id"])
        if response != expected:
            errors.append("response_rewrites_original")
        if original != frozen_original or response != frozen_response:
            errors.append("response_original_changed")
        return sorted(set(errors))
    except (KeyError, ValueError, TypeError, OSError):
        return ["response_original_unavailable"]


def lifecycle_relationships(effect, admission, permission, request, aggregate, ready):
    """Exact Installation owner composition; Connection effects use their owner."""
    e, a, p, q, outer = effect.value, admission.value, permission.value, request.value, aggregate.value
    errors = []
    def eq(x, y, code):
        if x != y:
            errors.append(code)
    eq(e["permission_authority_kind"], "capability_operation_decision", "lifecycle_permission_kind")
    eq(e["capability_admission"], binding(admission), "lifecycle_admission_binding")
    eq(e["capability_admission_value"], a, "lifecycle_original_admission_value")
    eq(e["capability_permission_decision"], binding(permission), "lifecycle_permission_binding")
    eq(p["effect"]["lifecycle_request"], binding(admission), "permission_lifecycle_request")
    eq(a["admission_ref"], admission.record_ref, "lifecycle_admission_identity")
    eq(a["ensure_request"], binding(request), "lifecycle_ensure_request")
    eq(a["ensure_operation_id"], outer["operation"]["operation_id"], "lifecycle_parent_operation")
    eq(a["permission_decision_ref"], p["decision_ref"], "lifecycle_decision_ref")
    eq(a["target"], p["effect"]["target"], "lifecycle_target")
    for field in SCOPE:
        eq(a["identity"][field], q[field], "lifecycle_scope_" + field)
    eq(e["operation_id"], a["identity"]["operation_id"], "lifecycle_operation")
    eq(e["requested_action"], a["requested_action"], "lifecycle_action")
    eq(e["installation_id"], a["installation_id"], "lifecycle_installation")
    eq(e["host_id"], q["execution_host_id"], "lifecycle_host")
    eq(e["environment_id"], q["execution_environment_id"], "lifecycle_environment")
    eq(e["phase"], "ready", "lifecycle_not_ready")
    eq(e["source_ref"], a["source"]["record_ref"], "lifecycle_source")
    eq(e["provenance_ref"], a["provenance"]["record_ref"], "lifecycle_provenance")
    eq(e["to_installation_ref"], ready["subject"]["record_ref"], "lifecycle_verified_subject")
    eq(e["verification_ref"], ready["verification"]["record_ref"], "lifecycle_verification")
    eq(outer["operation"]["installation_operation_ref"], effect.record_ref, "lifecycle_effect_reference")
    if q["scope_kind"] == "application":
        eq(e["permission_snapshot_id"], None, "lifecycle_fake_application_snapshot")
    # Actual snapshot IDs, independent child work, resource lease, successful
    # verification and original effect-time permission are authenticated by
    # verify_effect_owner, not inferred from matching references here.
    return errors
def fixture_dependencies(v):
    """Synthetic static doubles ONLY; never native custody or permission proof."""
    import pm_capability_continuation_semantics as cp
    outer, q, r = v["operation"], v["request"], v["result"]
    e = outer["origins"][0]; p = e["permission"]
    values = {("result", "result:ensure"): (1, r), ("request", "request:ensure"): (1, q),
        ("operation", outer["operation_ref"]): (outer["operation_generation"], outer),
        ("outcome", "outcome:ensure"): (1, v["outcome"]),
        ("work", v["work"]["observable_work_id"]): (1, v["work"])}
    if p is not None:
        values[("permission", p["decision_ref"])] = (1, p)
    if v["effect"] is not None:
        values[("effect", "effect:fixture")] = (1, v["effect"])
        values[("admission", v["admission"]["admission_ref"])] = (1, v["admission"])
    def read(kind, ref):
        generation, value = values[(kind, ref)]
        return OwnerValue(ref, generation, value)
    def continuation(ar, entry):
        cv = dict(schema_id="pshared_runtime.capability_continuation_fixture.v1",
                  schema_version="1.0.0", runtime_evidence=False, operation=ar.value["operation"])
        cv.update({k: entry[k] for k in ("demand", "waiter", "readiness", "currentness", "settlement")})
        deps = cp.fixture_dependencies(cv)
        original = deps["resolve_owner_record"]
        def cp_read(kind, ref):
            if kind == "effect" and v["effect"] is not None:
                return OwnerValue(ref, 1, v["effect"])
            return original(kind, ref)
        deps["resolve_owner_record"] = cp_read
        return cp.validate_capability_settlement(entry["settlement"]["settlement_ref"], **deps)
    def effect_owner(qr, ar, entry, effect, work):
        if effect is None:
            return [] if entry["readiness"] is None or entry["readiness"]["effect_result"] is None else ["missing_effect"]
        errors = shape("installation_lifecycle_record_v2", effect.value)
        child = v["effect_work"]
        if child is None:
            return errors + ["missing_actual_child_work"]
        errors += shape("ObservableWorkRecord", child, "full_thread_runtime_contracts.schema.json")
        if (child["observable_work_id"] != effect.value["observable_work_id"]
            or child["identity"]["operation_id"] != effect.value["operation_id"]
            or child["parent_work_id"] != work.value["observable_work_id"]
            or child["observable_work_id"] not in work.value["child_work_ids"]
            or child["work_state"] != "completed" or child["result_receipt_ref"] != effect.record_ref):
            errors.append("actual_child_work_mismatch")
        return errors
    return dict(resolve_record=read, verify_original_admission=lambda *args: [],
        verify_permission_issuer=lambda *args: [], verify_coalescing=lambda *args: [],
        validate_continuation=continuation, verify_effect_owner=effect_owner,
        check_current_disclosure=lambda *args: [])


def capability_ensure_semantic_failures(definition, value):
    """Central static fixture join enrollment; this never dispatches native work."""
    errors = shape(definition, value)
    if errors:
        return errors
    if definition == "capability_ensure_fixture":
        return validate_ensure_result("result:ensure", **fixture_dependencies(value))
    if definition in ("capability_provisioning_operation_v2", "capability_provisioning_operation_current_write"):
        return operation_relationships(value)
    # A standalone lifecycle shape has no original admission/permission/request
    # context. Its semantic joins run only through the complete fixture above.
    return []
