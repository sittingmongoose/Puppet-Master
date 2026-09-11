"""Static ATS-048 / RAP-056 exact-binding oracle; no native authority executes.

The supplied owner_snapshot and original_result are fixture stand-ins for trusted
owner lookups. Client-provided metadata can never authorize these operations.
"""

from __future__ import annotations

import copy
import hashlib
import json


def request_digest(request):
    """Closed string/integer fixture domain; not general native JCS proof.

    Transport command_instance_id and replay locators are excluded so a retry
    joins the same operation; every owner target, argument and scope is bound.
    """
    body = {key: request[key] for key in ("command_id", "context", "subject", "args")}
    body["idempotency"] = {key: request["idempotency"][key] for key in ("idempotency_key", "scope_ref")}
    return hashlib.sha256(json.dumps(body, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()


def evidence_command_semantic_failures(definition_name, value):
    if not isinstance(value, dict):
        return []
    failures = []
    if value.get("record_kind") in {"TestingSessionCommandRequest", "ArtifactRecordingCommandRequest"}:
        if request_digest(value) != value["idempotency"]["binding_sha256"]:
            failures.append("evidence_request_binding_mismatch")
        subject = value["subject"]
        if subject["kind"] == "test_run" and subject["test_run_id"] != value["context"]["run_id"]:
            failures.append("evidence_run_scope_mismatch")
        selected = subject.get("selected_evidence", value["args"].get("selected_evidence", []))
        ids = [row["artifact_id"] for row in selected]
        if len(ids) != len(set(ids)):
            failures.append("evidence_duplicate_artifact_identity")
    return failures


def evidence_binding_failures(request, result, owner_snapshot, original_result=None):
    """After structural validation, join exact owner-resolved scope and receipts.

    This is a fail-closed static fixture oracle, not a production authorization
    function. The native owner must separately authenticate all resolutions.
    """
    failures = evidence_command_semantic_failures("<root>", request)
    for field in ("command_id", "command_instance_id", "context"):
        if request[field] != result[field]:
            failures.append("evidence_result_" + field + "_mismatch")
    if result["request_binding_sha256"] != request_digest(request):
        failures.append("evidence_result_binding_mismatch")
    for field in ("context", "subject", "args"):
        if request[field] != owner_snapshot.get(field):
            failures.append("evidence_owner_" + field + "_mismatch")
    for field in ("subject_ref", "operation_id", "status"):
        if result[field] != owner_snapshot.get(field):
            failures.append("evidence_owner_" + field + "_mismatch")
    if result["receipt_ref"] is not None and result["receipt_ref"] != owner_snapshot.get("receipt_ref"):
        failures.append("evidence_owner_receipt_ref_mismatch")
    if result["status"] in {"accepted", "completed", "no_change"}:
        for field in ("native_handler_available", "permission_allowed", "subject_current", "redaction_allowed", "capability_available"):
            if owner_snapshot.get(field) is not True:
                failures.append("evidence_owner_gate_" + field)
    if result["status"] in {"completed", "no_change"}:
        for field in ("receipt_ref", "projection_ref", "currentness_ref", "currentness_sha256", "artifact_refs"):
            if result[field] != owner_snapshot.get(field):
                failures.append("evidence_owner_" + field + "_mismatch")
    if result["replayed"]:
        if not isinstance(original_result, dict):
            failures.append("evidence_original_result_missing")
        else:
            stable = copy.deepcopy(result)
            original = copy.deepcopy(original_result)
            for record in (stable, original):
                for field in ("replayed", "original_result_ref", "command_instance_id"):
                    record.pop(field, None)
            if stable != original or result["original_result_ref"] != owner_snapshot.get("original_result_ref"):
                failures.append("evidence_replay_changed_original_result")
    return sorted(set(failures))
