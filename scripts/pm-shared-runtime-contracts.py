#!/usr/bin/env python3
"""Validate Shared Integration Runtime schemas and cross-field invariants.

Draft 2020-12 closes shapes and conditional branches.  This companion validator
handles value comparisons and the ref/content safety checks that JSON Schema
cannot express without non-portable extensions.  It does not confer Event
Authority, PNC-019, buildability, or runtime certification.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "Plans/shared_runtime_contracts.schema.json"
TERMINAL_WORK_STATES = {"succeeded", "failed", "cancelled", "recovery_required"}
TERMINAL_INSTALLATION_PHASES = {"cancelled", "blocked", "failed", "ready", "rolled_back", "recovery_required"}
WAITING_WORK_STATES = {"awaiting_permission", "awaiting_user", "awaiting_resource", "retry_backoff"}
TERMINAL_OUTBOX_STATES = {"acknowledged", "cancelled", "expired", "rejected", "terminal_unknown"}
TERMINAL_CAPABILITY_PHASES = {"ready", "blocked", "failed", "cancelled", "rolled_back", "recovery_required"}
TERMINAL_DEBUG_STATES = {"terminated", "failed", "recovery_required"}
TERMINAL_EVAL_STATES = {"stopped", "failed", "recovery_required"}
TERMINAL_OPERATIONAL_STATES = {"succeeded", "failed", "cancelled", "recovery_required"}
OUTBOX_TRANSITIONS = {
    "queued": {"queued", "dispatching", "cancel_requested", "cancelled", "expired", "rejected"},
    "dispatching": {"dispatching", "queued", "acknowledged", "cancel_requested", "cancelled", "expired", "rejected", "terminal_unknown"},
    "cancel_requested": {"cancel_requested", "acknowledged", "cancelled", "terminal_unknown"},
}
LEASE_TRANSITIONS = {
    "requested": {"requested", "active", "revoked", "quarantined"},
    "active": {"active", "renewing", "release_requested", "expired_pending_reconciliation", "revoked", "quarantined"},
    "renewing": {"renewing", "active", "release_requested", "expired_pending_reconciliation", "revoked", "quarantined"},
    "release_requested": {"release_requested", "released", "reconciling", "quarantined"},
    "expired_pending_reconciliation": {"expired_pending_reconciliation", "reconciling", "quarantined"},
    "reconciling": {"reconciling", "reconciled", "quarantined"},
    "released": {"released"},
    "reconciled": {"reconciled"},
    "revoked": {"revoked", "reconciling", "reconciled", "quarantined"},
    "quarantined": {"quarantined", "reconciling", "reconciled"},
}
FORBIDDEN_REF_RE = re.compile(
    r"(?:^|[/?#:&._-])(?:password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|bearer|private[_-]?key)(?:$|[=:/?#&._-])",
    re.IGNORECASE,
)
TOKEN_SHAPED_RE = re.compile(
    r"^(?:sk-[A-Za-z0-9_-]{8,}|Bearer\s+\S+|gh[pousr]_[A-Za-z0-9]{8,}|xox[baprs]-\S+)$",
    re.IGNORECASE,
)
ABSOLUTE_PATH_RE = re.compile(r"^(?:/|file://|[A-Za-z]:[\\/]|\\\\)")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def pointer(path: tuple[Any, ...]) -> str:
    return "$" + "".join(f"[{value}]" if isinstance(value, int) else f".{value}" for value in path)


def schema_failures(value: Any, definition_name: str, schema: dict[str, Any]) -> list[dict[str, Any]]:
    definition = schema["$defs"][definition_name]
    validator = Draft202012Validator(
        {**definition, "$defs": schema["$defs"]},
        format_checker=FormatChecker(),
    )
    return [
        {
            "error": "json_schema_validation_failed",
            "pointer": pointer(tuple(error.absolute_path)),
            "message": error.message,
        }
        for error in sorted(validator.iter_errors(value), key=lambda item: list(item.absolute_path))
    ]


def walk_refs(value: Any, path: tuple[Any, ...] = ()) -> list[tuple[tuple[Any, ...], str]]:
    refs: list[tuple[tuple[Any, ...], str]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            next_path = (*path, key)
            if (str(key).endswith("_ref") or str(key).endswith("_refs")) and isinstance(child, str):
                refs.append((next_path, child))
            elif str(key).endswith("_refs") and isinstance(child, list):
                refs.extend(((*next_path, index), item) for index, item in enumerate(child) if isinstance(item, str))
            refs.extend(walk_refs(child, next_path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            refs.extend(walk_refs(child, (*path, index)))
    return refs


def semantic_failures(value: dict[str, Any], definition_name: str) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []

    for path, ref_value in walk_refs(value):
        if (
            FORBIDDEN_REF_RE.search(ref_value)
            or TOKEN_SHAPED_RE.search(ref_value)
            or ABSOLUTE_PATH_RE.search(ref_value)
        ):
            failures.append(
                {
                    "error": "secret_or_local_path_in_non_secret_ref",
                    "pointer": pointer(path),
                }
            )

    if definition_name == "installation_lifecycle_record":
        is_terminal = value.get("phase") in TERMINAL_INSTALLATION_PHASES
        if is_terminal != (value.get("terminal_at_utc") is not None):
            failures.append({"error": "installation_terminal_timestamp_mismatch", "pointer": "$.terminal_at_utc"})
        for earlier, later, code in (
            ("started_at_utc", "updated_at_utc", "installation_updated_before_started"),
            ("updated_at_utc", "terminal_at_utc", "installation_terminal_before_updated"),
        ):
            if value.get(earlier) is not None and value.get(later) is not None:
                if parse_timestamp(value[later]) < parse_timestamp(value[earlier]):
                    failures.append({"error": code, "pointer": f"$.{later}"})

    if definition_name == "environment_connection_transition":
        previous = value.get("previous", {})
        current = value.get("current", {})
        if previous.get("environment_id") != current.get("environment_id"):
            failures.append({"error": "connection_environment_identity_changed", "pointer": "$.current.environment_id"})
        previous_generation = previous.get("supervisor_generation", -1)
        current_generation = current.get("supervisor_generation", -1)
        if current_generation < previous_generation:
            failures.append({"error": "connection_supervisor_generation_regressed", "pointer": "$.current.supervisor_generation"})
        if previous.get("supervisor_id") != current.get("supervisor_id") and current_generation <= previous_generation:
            failures.append({"error": "connection_supervisor_replaced_without_generation_increment", "pointer": "$.current.supervisor_generation"})
        if current_generation == previous_generation:
            if current.get("connection_epoch", -1) < previous.get("connection_epoch", -1):
                failures.append({"error": "connection_epoch_regressed", "pointer": "$.current.connection_epoch"})
            if (
                current.get("transport_generation") != previous.get("transport_generation")
                and current.get("connection_epoch", -1) <= previous.get("connection_epoch", -1)
            ):
                failures.append({"error": "transport_replaced_without_epoch_increment", "pointer": "$.current.connection_epoch"})

    if definition_name == "environment_domain_sync_transition":
        previous = value.get("previous", {})
        current = value.get("current", {})
        if (previous.get("environment_id"), previous.get("domain")) != (
            current.get("environment_id"), current.get("domain")
        ):
            failures.append({"error": "domain_sync_identity_changed", "pointer": "$.current"})
        if current.get("connection_epoch", -1) < previous.get("connection_epoch", -1):
            failures.append({"error": "domain_sync_connection_epoch_regressed", "pointer": "$.current.connection_epoch"})
        if current.get("domain_generation", -1) < previous.get("domain_generation", -1):
            failures.append({"error": "domain_sync_generation_regressed", "pointer": "$.current.domain_generation"})
        if (
            current.get("connection_epoch") > previous.get("connection_epoch")
            and current.get("domain_generation", -1) <= previous.get("domain_generation", -1)
        ):
            failures.append({"error": "domain_sync_new_connection_requires_new_generation", "pointer": "$.current.domain_generation"})
        if parse_timestamp(current["updated_at_utc"]) < parse_timestamp(previous["updated_at_utc"]):
            failures.append({"error": "domain_sync_timestamp_regressed", "pointer": "$.current.updated_at_utc"})

    if definition_name == "installation_inventory_record":
        candidates = value.get("candidates", [])
        candidate_ids = [candidate.get("candidate_id") for candidate in candidates]
        if len(candidate_ids) != len(set(candidate_ids)):
            failures.append({"error": "installation_candidate_id_not_unique", "pointer": "$.candidates"})
        selected = value.get("selected_candidate_id")
        selected_rows = [candidate for candidate in candidates if candidate.get("selection_state") == "selected"]
        if selected is None and selected_rows:
            failures.append({"error": "selected_candidate_id_missing", "pointer": "$.selected_candidate_id"})
        if selected is not None:
            if selected not in candidate_ids:
                failures.append({"error": "selected_candidate_id_unknown", "pointer": "$.selected_candidate_id"})
            if len(selected_rows) != 1 or selected_rows[0].get("candidate_id") != selected:
                failures.append({"error": "selected_candidate_state_mismatch", "pointer": "$.candidates"})

    if definition_name == "capability_provisioning_operation":
        is_terminal = value.get("phase") in TERMINAL_CAPABILITY_PHASES
        if is_terminal != (value.get("terminal_at_utc") is not None):
            failures.append({"error": "capability_terminal_timestamp_mismatch", "pointer": "$.terminal_at_utc"})
        for earlier, later, code in (
            ("started_at_utc", "updated_at_utc", "capability_updated_before_started"),
            ("updated_at_utc", "terminal_at_utc", "capability_terminal_before_updated"),
        ):
            if value.get(earlier) is not None and value.get(later) is not None:
                if parse_timestamp(value[later]) < parse_timestamp(value[earlier]):
                    failures.append({"error": code, "pointer": f"$.{later}"})

    if definition_name == "runtime_resource_admission":
        if value.get("outcome") in {"queued", "blocked", "rejected"}:
            if value.get("reason_ref") is None:
                failures.append({"error": "non_admitted_resource_outcome_missing_reason", "pointer": "$.reason_ref"})
            if value.get("reevaluation_trigger_ref") is None:
                failures.append(
                    {"error": "non_admitted_resource_outcome_missing_reevaluation", "pointer": "$.reevaluation_trigger_ref"}
                )

    if definition_name == "observable_work_projection":
        state = value.get("state")
        if state in WAITING_WORK_STATES:
            if value.get("wait_reason_ref") is None:
                failures.append({"error": "observable_wait_missing_reason", "pointer": "$.wait_reason_ref"})
            if value.get("reevaluation_ref") is None:
                failures.append({"error": "observable_wait_missing_reevaluation", "pointer": "$.reevaluation_ref"})
        is_terminal = state in TERMINAL_WORK_STATES
        if is_terminal != (value.get("terminal_at_utc") is not None):
            failures.append({"error": "observable_terminal_timestamp_mismatch", "pointer": "$.terminal_at_utc"})
        completed = value.get("completed_units")
        total = value.get("total_units")
        if completed is not None and total is not None and completed > total:
            failures.append({"error": "observable_completed_exceeds_total", "pointer": "$.completed_units"})
        for earlier, later, code in (
            ("started_at_utc", "updated_at_utc", "observable_updated_before_started"),
            ("updated_at_utc", "terminal_at_utc", "observable_terminal_before_updated"),
        ):
            if value.get(earlier) is not None and value.get(later) is not None:
                if parse_timestamp(value[later]) < parse_timestamp(value[earlier]):
                    failures.append({"error": code, "pointer": f"$.{later}"})

    if definition_name == "conditional_rule_intervention_receipt":
        before = value.get("context_epoch_before")
        after = value.get("context_epoch_after")
        if isinstance(before, int) and isinstance(after, int) and after < before:
            failures.append({"error": "conditional_rule_context_epoch_regressed", "pointer": "$.context_epoch_after"})
        outcome = value.get("outcome")
        effective = value.get("effective_action")
        expected_action = {
            "instruction_emitted": "bounded_instruction",
            "steer_requested": "steer",
            "retry_requested": "retry",
        }.get(outcome)
        if expected_action is not None and effective != expected_action:
            failures.append({"error": "conditional_rule_outcome_action_mismatch", "pointer": "$.effective_action"})
        if outcome in {"not_matched", "matched_noop", "suppressed_duplicate", "suppressed_cap", "blocked_by_policy", "failed_closed"} and effective != "none":
            failures.append({"error": "conditional_rule_suppressed_action_not_none", "pointer": "$.effective_action"})
        if outcome in {"suppressed_duplicate", "suppressed_cap"} and value.get("suppression_identity") is None:
            failures.append({"error": "conditional_rule_suppression_identity_missing", "pointer": "$.suppression_identity"})

    if definition_name == "runtime_resource_lease":
        for earlier, later, code in (
            ("acquired_at_utc", "renewed_at_utc", "lease_renewed_before_acquired"),
            ("renewed_at_utc", "expires_at_utc", "lease_expiry_before_renewal"),
            ("acquired_at_utc", "released_at_utc", "lease_released_before_acquired"),
        ):
            if value.get(earlier) is not None and value.get(later) is not None:
                if parse_timestamp(value[later]) < parse_timestamp(value[earlier]):
                    failures.append({"error": code, "pointer": f"$.{later}"})

    if definition_name == "runtime_resource_lease_transition":
        previous = value.get("previous", {})
        current = value.get("current", {})
        immutable_fields = ("lease_id", "resource_kind", "resource_identity_ref", "scope_ref")
        for field in immutable_fields:
            if previous.get(field) != current.get(field):
                failures.append({"error": "lease_identity_changed", "pointer": f"$.current.{field}"})
        if current.get("generation", -1) < previous.get("generation", -1):
            failures.append({"error": "lease_generation_regressed", "pointer": "$.current.generation"})
        if current.get("epoch", -1) < previous.get("epoch", -1):
            failures.append({"error": "lease_epoch_regressed", "pointer": "$.current.epoch"})
        if previous.get("holder_identity_ref") != current.get("holder_identity_ref") and (
            current.get("generation", -1) <= previous.get("generation", -1)
            or current.get("epoch", -1) <= previous.get("epoch", -1)
        ):
            failures.append({"error": "lease_holder_changed_without_generation_and_epoch", "pointer": "$.current.holder_identity_ref"})
        allowed = LEASE_TRANSITIONS.get(previous.get("state"), {previous.get("state")})
        if current.get("state") not in allowed:
            failures.append({"error": "lease_state_transition_invalid", "pointer": "$.current.state"})

    if definition_name == "bsd_runtime_record":
        requested = value.get("requested_mode")
        if requested is None and value.get("effective_mode") != "Auto":
            failures.append({"error": "bsd_missing_request_must_resolve_auto", "pointer": "$.effective_mode"})
        if parse_timestamp(value["terminal_at_utc"]) < parse_timestamp(value["started_at_utc"]):
            failures.append({"error": "bsd_terminal_before_started", "pointer": "$.terminal_at_utc"})

    if definition_name == "dev_session_record":
        state = value.get("state")
        is_terminal = state in TERMINAL_DEBUG_STATES
        if is_terminal != (value.get("terminal_at_utc") is not None):
            failures.append({"error": "debug_terminal_timestamp_mismatch", "pointer": "$.terminal_at_utc"})
        if state in {"running", "paused", "terminating", "terminated"}:
            if value.get("waiter_arm_ref") is None or value.get("waiter_armed_at_utc") is None or value.get("triggered_at_utc") is None:
                failures.append({"error": "debug_immediate_event_waiter_evidence_missing", "pointer": "$.waiter_arm_ref"})
            elif parse_timestamp(value["triggered_at_utc"]) < parse_timestamp(value["waiter_armed_at_utc"]):
                failures.append({"error": "debug_trigger_preceded_waiter_arm", "pointer": "$.triggered_at_utc"})

    if definition_name == "eval_session_record":
        state = value.get("state")
        is_terminal = state in TERMINAL_EVAL_STATES
        if is_terminal != (value.get("terminal_at_utc") is not None):
            failures.append({"error": "eval_terminal_timestamp_mismatch", "pointer": "$.terminal_at_utc"})
        if value.get("variable_disposition") == "exported_redacted_artifact" and value.get("full_output_artifact_ref") is None:
            failures.append({"error": "eval_exported_variables_missing_artifact", "pointer": "$.full_output_artifact_ref"})

    if definition_name == "thread_command_outbox_record":
        state = value.get("state")
        is_terminal = state in TERMINAL_OUTBOX_STATES
        if is_terminal != (value.get("terminal_at_utc") is not None):
            failures.append({"error": "outbox_terminal_timestamp_mismatch", "pointer": "$.terminal_at_utc"})
        if parse_timestamp(value["updated_at_utc"]) < parse_timestamp(value["created_at_utc"]):
            failures.append({"error": "outbox_updated_before_created", "pointer": "$.updated_at_utc"})

    if definition_name == "thread_command_outbox_transition":
        previous = value.get("previous", {})
        current = value.get("current", {})
        immutable_fields = (
            "project_id", "thread_id", "command_instance_id", "command_id", "payload_sha256",
            "idempotency_key", "order_key", "target_generation",
        )
        for field in immutable_fields:
            if previous.get(field) != current.get(field):
                failures.append({"error": "outbox_identity_or_payload_changed", "pointer": f"$.current.{field}"})
        previous_state = previous.get("state")
        current_state = current.get("state")
        allowed = OUTBOX_TRANSITIONS.get(previous_state, {previous_state})
        if current_state not in allowed:
            failures.append({"error": "outbox_state_transition_invalid", "pointer": "$.current.state"})
        if current.get("attempt_count", -1) < previous.get("attempt_count", -1):
            failures.append({"error": "outbox_attempt_count_regressed", "pointer": "$.current.attempt_count"})
        if previous_state in TERMINAL_OUTBOX_STATES and current != previous:
            failures.append({"error": "outbox_terminal_record_mutated", "pointer": "$.current"})

    if definition_name == "replay_snapshot_checkpoint":
        applied = value.get("applied_cursor")
        published = value.get("published_cursor")
        low = value.get("buffered_low_cursor")
        high = value.get("buffered_high_cursor")
        if low is not None and high is not None and high < low:
            failures.append({"error": "replay_buffer_cursor_range_inverted", "pointer": "$.buffered_high_cursor"})
        if value.get("state") == "current" and applied != published:
            failures.append({"error": "replay_current_published_cursor_not_applied_high_water", "pointer": "$.published_cursor"})
        if value.get("snapshot_ref") is None and value.get("snapshot_sha256") is not None:
            failures.append({"error": "replay_snapshot_digest_without_ref", "pointer": "$.snapshot_sha256"})
        if value.get("snapshot_ref") is not None and value.get("snapshot_sha256") is None:
            failures.append({"error": "replay_snapshot_ref_without_digest", "pointer": "$.snapshot_sha256"})

    if definition_name == "replay_snapshot_transition":
        previous = value.get("previous", {})
        current = value.get("current", {})
        if (previous.get("environment_id"), previous.get("domain")) != (
            current.get("environment_id"), current.get("domain")
        ):
            failures.append({"error": "replay_identity_changed", "pointer": "$.current"})
        if current.get("connection_epoch", -1) < previous.get("connection_epoch", -1):
            failures.append({"error": "replay_connection_epoch_regressed", "pointer": "$.current.connection_epoch"})
        if current.get("domain_generation", -1) < previous.get("domain_generation", -1):
            failures.append({"error": "replay_domain_generation_regressed", "pointer": "$.current.domain_generation"})
        if (
            current.get("connection_epoch") == previous.get("connection_epoch")
            and current.get("domain_generation") == previous.get("domain_generation")
        ):
            for field in ("applied_cursor", "published_cursor"):
                before = previous.get(field)
                after = current.get(field)
                if before is not None and after is not None and after < before:
                    failures.append({"error": "replay_cursor_regressed", "pointer": f"$.current.{field}"})

    if definition_name == "stream_coalescing_record":
        first = value.get("input_first_seq")
        last = value.get("input_last_seq")
        count = value.get("input_item_count")
        if isinstance(first, int) and isinstance(last, int):
            if last < first:
                failures.append({"error": "stream_input_sequence_range_inverted", "pointer": "$.input_last_seq"})
            elif count != last - first + 1:
                failures.append({"error": "stream_input_count_not_contiguous", "pointer": "$.input_item_count"})
        if value.get("output_item_count", 0) > value.get("input_item_count", 0):
            failures.append({"error": "stream_coalescing_expanded_item_count", "pointer": "$.output_item_count"})
        if value.get("terminal_published"):
            barrier = value.get("flush_barrier_seq")
            flushed = value.get("flushed_through_seq")
            if not isinstance(barrier, int) or not isinstance(flushed, int) or flushed < barrier:
                failures.append({"error": "stream_terminal_published_before_flush_barrier", "pointer": "$.flushed_through_seq"})

    if definition_name == "thread_detail_projection":
        base = value.get("base_cursor", -1)
        applied = value.get("applied_cursor", -1)
        published = value.get("published_cursor", -1)
        if not (base <= published <= applied):
            failures.append({"error": "thread_detail_cursor_order_invalid", "pointer": "$.published_cursor"})
        if value.get("state") == "current" and published != applied:
            failures.append({"error": "thread_detail_current_not_fully_published", "pointer": "$.published_cursor"})

    if definition_name == "mcp_server_lifecycle_transition":
        previous = value.get("previous", {})
        current = value.get("current", {})
        if previous.get("server_id") != current.get("server_id"):
            failures.append({"error": "mcp_server_identity_changed", "pointer": "$.current.server_id"})
        for field in ("runtime_generation", "config_epoch", "auth_epoch", "connection_epoch", "catalog_generation"):
            if current.get(field, -1) < previous.get(field, -1):
                failures.append({"error": "mcp_lifecycle_epoch_regressed", "pointer": f"$.current.{field}"})

    if definition_name == "operational_attribution_record":
        state = value.get("status")
        terminal = state in TERMINAL_OPERATIONAL_STATES
        if terminal != (value.get("completed_at_utc") is not None):
            failures.append({"error": "operational_terminal_timestamp_mismatch", "pointer": "$.completed_at_utc"})
        if value.get("completed_at_utc") is not None and parse_timestamp(value["completed_at_utc"]) < parse_timestamp(value["started_at_utc"]):
            failures.append({"error": "operational_completed_before_started", "pointer": "$.completed_at_utc"})
        partitions = value.get("time_partitions", {})
        partition_sum = sum(
            partitions.get(field, 0)
            for field in (
                "provider_active_ms", "local_compute_ms", "resource_wait_ms",
                "permission_approval_wait_ms", "offline_outbox_wait_ms",
                "reconnect_sync_replay_snapshot_ms", "maintenance_ms",
            )
        )
        if partition_sum > partitions.get("total_elapsed_ms", 0):
            failures.append({"error": "operational_partitions_exceed_total", "pointer": "$.time_partitions.total_elapsed_ms"})

    if definition_name in {"provider_dispatch_admission_receipt", "provider_request_permit"}:
        issued = parse_timestamp(value["issued_at_utc"])
        expires = parse_timestamp(value["expires_at_utc"])
        if expires <= issued:
            failures.append({"error": "dispatch_expiry_not_after_issuance", "pointer": "$.expires_at_utc"})
        consumed_raw = value.get("consumed_at_utc")
        if consumed_raw is not None:
            consumed = parse_timestamp(consumed_raw)
            if consumed < issued:
                failures.append({"error": "dispatch_consumed_before_issuance", "pointer": "$.consumed_at_utc"})
            if consumed > expires:
                failures.append({"error": "dispatch_consumed_after_expiry", "pointer": "$.consumed_at_utc"})

    if definition_name == "provider_dispatch_attempt_validation":
        receipt = value.get("receipt", {})
        for child_failure in semantic_failures(receipt, "provider_dispatch_admission_receipt"):
            failures.append({
                **child_failure,
                "pointer": "$.receipt" + child_failure.get("pointer", "$").removeprefix("$"),
            })
        dispatch_at = parse_timestamp(value["dispatch_at_utc"])
        issued = parse_timestamp(receipt["issued_at_utc"])
        expires = parse_timestamp(receipt["expires_at_utc"])
        if dispatch_at < issued:
            failures.append({"error": "provider_dispatch_before_permit_issuance", "pointer": "$.dispatch_at_utc"})
        if dispatch_at >= expires:
            failures.append({"error": "provider_dispatch_permit_expired", "pointer": "$.dispatch_at_utc"})
        if receipt.get("consumed_at_utc") is not None:
            failures.append({"error": "provider_dispatch_permit_already_consumed", "pointer": "$.receipt.consumed_at_utc"})
        matching_fields = (
            "final_request_sha256", "structured_attachment_manifest_sha256", "route_ref", "model_ref",
            "effective_account_ref", "permission_snapshot_id", "policy_generation_refs",
            "filesafe_receipt_refs", "context_epoch", "topology_generation",
        )
        for field in matching_fields:
            if value.get(field) != receipt.get(field):
                failures.append({"error": "provider_dispatch_binding_mismatch", "pointer": f"$.{field}"})

    return failures


def validate(value: Any, definition_name: str, schema: dict[str, Any]) -> list[dict[str, Any]]:
    failures = schema_failures(value, definition_name, schema)
    if failures or not isinstance(value, dict):
        return failures
    return semantic_failures(value, definition_name)


def self_test(schema: dict[str, Any]) -> dict[str, bool]:
    dispatch = {
        "schema_id": "pm.shared_runtime.provider_dispatch_admission_receipt.v1",
        "schema_version": "1.0.0",
        "receipt_id": "receipt:1",
        "operation_id": "operation:1",
        "attempt_id": "attempt:1",
        "provider_request_attempt_id": "provider-attempt:1",
        "final_request_sha256": "b" * 64,
        "prompt_capsule_ref": "prompt-capsule:1",
        "structured_attachment_manifest_sha256": "c" * 64,
        "structured_attachment_manifest_ref": "attachment-manifest:1",
        "packet_admission_decision_ref": "packet-admission:1",
        "runtime_resource_admission_ref": "resource-admission:1",
        "context_epoch": 0,
        "route_ref": "route:1",
        "model_ref": "model:1",
        "requested_account_ref": None,
        "effective_account_ref": None,
        "project_id": "project:1",
        "thread_id": None,
        "goal_id": None,
        "run_id": None,
        "node_id": None,
        "agent_id": None,
        "execution_host_id": None,
        "execution_environment_id": None,
        "permission_snapshot_id": "snapshot:1",
        "filesafe_receipt_refs": [],
        "mutation_capable": False,
        "policy_generation_refs": [],
        "topology_generation": 0,
        "issued_at_utc": "2026-08-13T00:00:00Z",
        "expires_at_utc": "2026-08-13T00:05:00Z",
        "single_use": True,
        "consumed_at_utc": None,
        "consumption_evidence_ref": None,
        "issuer_service": "ProviderDispatchAdmissionService",
        "network_transmission_allowed": True,
    }

    def install(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.installation_lifecycle_record.v1",
            "schema_version": "1.0.0",
            "operation_id": "operation:1",
            "installation_id": "installation:1",
            "subject_kind": "provider_cli",
            "subject_id": "provider:example",
            "provider_cli": True,
            "acquisition_basis": "explicit_user_acquisition",
            "host_id": "host:1",
            "environment_id": "environment:1",
            "requested_action": "install",
            "phase": "ready",
            "source_ref": "official-source:1",
            "provenance_ref": "provenance:1",
            "permission_snapshot_id": "snapshot:1",
            "resource_lease_id": None,
            "observable_work_id": "work:1",
            "from_installation_ref": None,
            "to_installation_ref": "installation:1",
            "verification_ref": "verification:1",
            "rollback_ref": None,
            "failure_fingerprint": None,
            "started_at_utc": "2026-08-13T00:00:00Z",
            "updated_at_utc": "2026-08-13T00:01:00Z",
            "terminal_at_utc": "2026-08-13T00:01:00Z",
            "redaction_profile": "no_secrets",
        }
        value.update(updates)
        return value

    def work(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.observable_work_projection.v1",
            "schema_version": "1.0.0",
            "work_id": "work:1",
            "domain": "installation",
            "operation_ref": "operation:1",
            "source_event_refs": [],
            "source_value_refs": ["value:operation:1"],
            "project_id": "project:1",
            "host_id": "host:1",
            "environment_id": "environment:1",
            "state": "running",
            "phase": "verifying",
            "wait_reason_ref": None,
            "reevaluation_ref": None,
            "completed_units": 1,
            "total_units": 2,
            "activity_evidence_ref": "activity:1",
            "resource_refs": [],
            "lease_refs": [],
            "usage_refs": [],
            "diagnostic_refs": [],
            "receipt_refs": [],
            "started_at_utc": "2026-08-13T00:00:00Z",
            "updated_at_utc": "2026-08-13T00:01:00Z",
            "terminal_at_utc": None,
            "currentness_ref": "currentness:1",
        }
        value.update(updates)
        return value

    def admission(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.runtime_resource_admission.v1",
            "schema_version": "1.0.0",
            "admission_id": "admission:1",
            "request_ref": "request:1",
            "host_id": "host:1",
            "environment_id": "environment:1",
            "physical_budget_parent_id": "physical-host:1",
            "resource_kind": "process",
            "outcome": "admitted",
            "requested_limits_ref": "limits:requested",
            "effective_limits_ref": "limits:effective",
            "reason_ref": None,
            "policy_generation": 1,
            "host_observation_ref": "observation:1",
            "lease_refs": [],
            "reevaluation_trigger_ref": None,
            "observable_work_id": "work:1",
            "decided_at_utc": "2026-08-13T00:00:00Z",
        }
        value.update(updates)
        return value

    def connection_state(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.environment_connection_state.v1",
            "schema_version": "1.0.0",
            "supervisor_id": "supervisor:1",
            "environment_id": "environment:1",
            "supervisor_generation": 1,
            "transport_generation": 1,
            "connection_epoch": 1,
            "state": "online",
            "retry_ref": None,
            "backoff_ref": None,
            "auth_block_ref": None,
            "probe_ref": "probe:1",
            "error_ref": None,
            "currentness_ref": "currentness:1",
            "updated_at_utc": "2026-08-13T00:01:00Z",
        }
        value.update(updates)
        return value

    def domain_sync(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.environment_domain_sync_state.v1",
            "schema_version": "1.0.0",
            "environment_id": "environment:1",
            "domain": "thread_shell",
            "domain_generation": 1,
            "connection_epoch": 1,
            "state": "current",
            "cursor_ref": "cursor:10",
            "snapshot_ref": None,
            "currentness_ref": "currentness:1",
            "error_ref": None,
            "updated_at_utc": "2026-08-13T00:01:00Z",
        }
        value.update(updates)
        return value

    def replay(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.replay_snapshot_checkpoint.v1",
            "schema_version": "1.0.0",
            "checkpoint_id": "checkpoint:1",
            "environment_id": "environment:1",
            "domain": "thread_shell",
            "connection_epoch": 1,
            "domain_generation": 1,
            "state": "current",
            "requested_cursor": 5,
            "base_cursor": 5,
            "applied_cursor": 10,
            "published_cursor": 10,
            "buffered_low_cursor": None,
            "buffered_high_cursor": None,
            "buffered_event_count": 0,
            "buffer_overflowed": False,
            "snapshot_ref": None,
            "snapshot_sha256": None,
            "contiguous_applied": True,
            "live_buffer_drained": True,
            "currentness_ref": "currentness:checkpoint:1",
            "updated_at_utc": "2026-08-13T00:01:00Z",
        }
        value.update(updates)
        return value

    def stream(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.stream_coalescing_record.v1",
            "schema_version": "1.0.0",
            "stream_id": "stream:1",
            "stream_generation": 1,
            "input_first_seq": 1,
            "input_last_seq": 3,
            "input_item_count": 3,
            "output_item_count": 2,
            "canonical_payload_sha256": "a" * 64,
            "display_payload_sha256": "b" * 64,
            "terminal_requested": True,
            "flush_barrier_seq": 3,
            "flushed_through_seq": 3,
            "terminal_published": True,
            "canonical_drop_count": 0,
            "updated_at_utc": "2026-08-13T00:01:00Z",
        }
        value.update(updates)
        return value

    def outbox(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.thread_command_outbox_record.v1",
            "schema_version": "1.0.0",
            "project_id": "project:1",
            "thread_id": "thread:1",
            "command_instance_id": "command-instance:1",
            "command_id": "cmd.thread.request",
            "payload_sha256": "c" * 64,
            "idempotency_key": "idempotency:1",
            "order_key": "thread:1:10",
            "target_generation": 1,
            "state": "queued",
            "attempt_count": 0,
            "acknowledgement_ref": None,
            "terminal_reason_ref": None,
            "created_at_utc": "2026-08-13T00:00:00Z",
            "updated_at_utc": "2026-08-13T00:00:00Z",
            "terminal_at_utc": None,
        }
        value.update(updates)
        return value

    def lease(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.runtime_resource_lease.v1",
            "schema_version": "1.0.0",
            "lease_id": "lease:1",
            "resource_kind": "port",
            "resource_identity_ref": "port:4177",
            "scope_ref": "project:1",
            "holder_identity_ref": "operation:1",
            "mode": "exclusive",
            "state": "active",
            "generation": 1,
            "epoch": 1,
            "acquired_at_utc": "2026-08-13T00:00:00Z",
            "renewed_at_utc": "2026-08-13T00:00:00Z",
            "expires_at_utc": "2026-08-13T00:05:00Z",
            "policy_ref": "policy:1",
            "cleanup_strategy": "resource_probe",
            "terminal_disposition": None,
            "reconciliation_evidence_ref": None,
            "released_at_utc": None,
        }
        value.update(updates)
        return value

    def mcp(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.mcp_server_lifecycle_record.v1",
            "schema_version": "1.0.0",
            "server_id": "mcp:example",
            "runtime_generation": 2,
            "config_epoch": 2,
            "auth_epoch": 2,
            "connection_epoch": 2,
            "catalog_generation": 2,
            "provider_id": "provider:example",
            "runtime_subject_id": "runtime:1",
            "configured": "enabled",
            "auth": "authenticated",
            "transport": "connected",
            "catalog": "fresh",
            "subscription": "active",
            "tool_projection": "materialized",
            "health": "healthy",
            "config_ref": "mcp-config:1",
            "credential_profile_ref": "credential-profile:1",
            "lease_ref": "lease:1",
            "breaker_state": "closed",
            "next_allowed_at_utc": None,
            "catalog_schema_sha256": "d" * 64,
            "subscription_rollback_ref": None,
            "currentness_ref": "currentness:mcp:1",
            "reason_code": None,
            "observed_at_utc": "2026-08-13T00:01:00Z",
        }
        value.update(updates)
        return value

    def operational(**updates: Any) -> dict[str, Any]:
        value = {
            "schema_id": "pm.shared_runtime.operational_attribution_record.v1",
            "schema_version": "1.0.0",
            "operation_id": "operation:1",
            "command_id": "cmd.environment.reconnect",
            "purpose": "environment_reconnect",
            "project_id": "project:1",
            "thread_id": None,
            "goal_id": None,
            "plan_id": None,
            "run_id": None,
            "agent_id": None,
            "crew_id": None,
            "execution_host_id": "host:1",
            "execution_environment_id": "environment:1",
            "status": "succeeded",
            "outcome": "reconnected",
            "started_at_utc": "2026-08-13T00:00:00Z",
            "completed_at_utc": "2026-08-13T00:00:01Z",
            "time_partitions": {
                "provider_active_ms": 0,
                "local_compute_ms": 100,
                "resource_wait_ms": 100,
                "permission_approval_wait_ms": 0,
                "offline_outbox_wait_ms": 0,
                "reconnect_sync_replay_snapshot_ms": 700,
                "maintenance_ms": 0,
                "total_elapsed_ms": 1000,
            },
            "provider_usage_refs": [],
            "event_refs": [],
            "receipt_refs": ["receipt:1"],
            "artifact_refs": [],
            "currentness_ref": "currentness:operation:1",
        }
        value.update(updates)
        return value

    def dispatch_attempt(**updates: Any) -> dict[str, Any]:
        value = {
            "receipt": dict(dispatch),
            "dispatch_at_utc": "2026-08-13T00:01:00Z",
            "final_request_sha256": dispatch["final_request_sha256"],
            "structured_attachment_manifest_sha256": dispatch["structured_attachment_manifest_sha256"],
            "route_ref": dispatch["route_ref"],
            "model_ref": dispatch["model_ref"],
            "effective_account_ref": dispatch["effective_account_ref"],
            "permission_snapshot_id": dispatch["permission_snapshot_id"],
            "policy_generation_refs": list(dispatch["policy_generation_refs"]),
            "filesafe_receipt_refs": list(dispatch["filesafe_receipt_refs"]),
            "context_epoch": dispatch["context_epoch"],
            "topology_generation": dispatch["topology_generation"],
            "prior_consumption_count": 0,
        }
        value.update(updates)
        return value

    cases: dict[str, tuple[str, dict[str, Any], bool]] = {
        "valid_installation": ("installation_lifecycle_record", install(), True),
        "installation_requires_resource_lease_field": (
            "installation_lifecycle_record",
            {key: value for key, value in install().items() if key != "resource_lease_id"},
            False,
        ),
        "provider_maintenance_cannot_use_non_provider_basis": (
            "installation_lifecycle_record",
            install(requested_action="update", acquisition_basis="non_provider_demand"),
            False,
        ),
        "installation_terminal_time_required": (
            "installation_lifecycle_record",
            install(terminal_at_utc=None),
            False,
        ),
        "installation_time_order_enforced": (
            "installation_lifecycle_record",
            install(updated_at_utc="2026-08-12T23:59:00Z"),
            False,
        ),
        "valid_observable_work": ("observable_work_projection", work(), True),
        "observable_wait_requires_reason_and_reevaluation": (
            "observable_work_projection",
            work(state="awaiting_resource"),
            False,
        ),
        "observable_completed_not_over_total": (
            "observable_work_projection",
            work(completed_units=3, total_units=2),
            False,
        ),
        "observable_terminal_time_not_on_running": (
            "observable_work_projection",
            work(terminal_at_utc="2026-08-13T00:02:00Z"),
            False,
        ),
        "resource_block_requires_reason_and_reevaluation": (
            "runtime_resource_admission",
            admission(outcome="blocked"),
            False,
        ),
        "valid_connection_transition": (
            "environment_connection_transition",
            {
                "schema_id": "pm.shared_runtime.environment_connection_transition.v1",
                "schema_version": "1.0.0",
                "previous": connection_state(),
                "current": connection_state(connection_epoch=2, transport_generation=2),
            },
            True,
        ),
        "supervisor_replacement_requires_generation": (
            "environment_connection_transition",
            {
                "schema_id": "pm.shared_runtime.environment_connection_transition.v1",
                "schema_version": "1.0.0",
                "previous": connection_state(),
                "current": connection_state(supervisor_id="supervisor:2"),
            },
            False,
        ),
        "connection_epoch_cannot_regress": (
            "environment_connection_transition",
            {
                "schema_id": "pm.shared_runtime.environment_connection_transition.v1",
                "schema_version": "1.0.0",
                "previous": connection_state(connection_epoch=2),
                "current": connection_state(connection_epoch=1),
            },
            False,
        ),
        "valid_current_domain_sync_has_evidence": (
            "environment_domain_sync_state",
            domain_sync(),
            True,
        ),
        "current_domain_sync_requires_cursor_or_snapshot": (
            "environment_domain_sync_state",
            domain_sync(cursor_ref=None, snapshot_ref=None),
            False,
        ),
        "valid_outbox": ("thread_command_outbox_record", outbox(), True),
        "outbox_acknowledgement_requires_receipt_and_terminal_time": (
            "thread_command_outbox_record",
            outbox(state="acknowledged"),
            False,
        ),
        "terminal_outbox_cannot_retry": (
            "thread_command_outbox_transition",
            {
                "schema_id": "pm.shared_runtime.thread_command_outbox_transition.v1",
                "schema_version": "1.0.0",
                "previous": outbox(
                    state="acknowledged", acknowledgement_ref="ack:1",
                    terminal_at_utc="2026-08-13T00:01:00Z",
                ),
                "current": outbox(state="dispatching", attempt_count=2, updated_at_utc="2026-08-13T00:02:00Z"),
            },
            False,
        ),
        "valid_replay_checkpoint": ("replay_snapshot_checkpoint", replay(), True),
        "current_replay_cursor_must_converge": (
            "replay_snapshot_checkpoint",
            replay(published_cursor=9),
            False,
        ),
        "replay_overflow_cannot_be_current": (
            "replay_snapshot_checkpoint",
            replay(buffer_overflowed=True),
            False,
        ),
        "replay_old_epoch_cannot_publish": (
            "replay_snapshot_transition",
            {
                "schema_id": "pm.shared_runtime.replay_snapshot_transition.v1",
                "schema_version": "1.0.0",
                "previous": replay(connection_epoch=2, domain_generation=2),
                "current": replay(connection_epoch=1, domain_generation=2),
            },
            False,
        ),
        "domain_sync_old_epoch_rejected": (
            "environment_domain_sync_transition",
            {
                "schema_id": "pm.shared_runtime.environment_domain_sync_transition.v1",
                "schema_version": "1.0.0",
                "previous": domain_sync(connection_epoch=2, domain_generation=2),
                "current": domain_sync(connection_epoch=1, domain_generation=2),
            },
            False,
        ),
        "lease_expiry_is_not_cleanup": (
            "runtime_resource_lease_transition",
            {
                "schema_id": "pm.shared_runtime.runtime_resource_lease_transition.v1",
                "schema_version": "1.0.0",
                "previous": lease(state="expired_pending_reconciliation"),
                "current": lease(state="active", epoch=2),
            },
            False,
        ),
        "mcp_old_epoch_callback_rejected": (
            "mcp_server_lifecycle_transition",
            {
                "schema_id": "pm.shared_runtime.mcp_server_lifecycle_transition.v1",
                "schema_version": "1.0.0",
                "previous": mcp(),
                "current": mcp(connection_epoch=1),
            },
            False,
        ),
        "valid_operational_attribution": ("operational_attribution_record", operational(), True),
        "operational_partitions_cannot_exceed_total": (
            "operational_attribution_record",
            operational(time_partitions={
                "provider_active_ms": 1000,
                "local_compute_ms": 1000,
                "resource_wait_ms": 0,
                "permission_approval_wait_ms": 0,
                "offline_outbox_wait_ms": 0,
                "reconnect_sync_replay_snapshot_ms": 0,
                "maintenance_ms": 0,
                "total_elapsed_ms": 1000,
            }),
            False,
        ),
        "valid_terminal_stream_flush": ("stream_coalescing_record", stream(), True),
        "terminal_stream_requires_flush_barrier": (
            "stream_coalescing_record",
            stream(flushed_through_seq=2),
            False,
        ),
        "canonical_stream_cannot_drop": (
            "stream_coalescing_record",
            stream(canonical_drop_count=1),
            False,
        ),
        "valid_dispatch": ("provider_dispatch_admission_receipt", dispatch, True),
        "valid_dispatch_attempt": ("provider_dispatch_attempt_validation", dispatch_attempt(), True),
        "dispatch_attempt_expired_at_boundary": (
            "provider_dispatch_attempt_validation",
            dispatch_attempt(dispatch_at_utc=dispatch["expires_at_utc"]),
            False,
        ),
        "dispatch_attempt_reuse_rejected": (
            "provider_dispatch_attempt_validation",
            dispatch_attempt(receipt={
                **dispatch,
                "consumed_at_utc": "2026-08-13T00:00:30Z",
                "consumption_evidence_ref": "consumption:1",
            }),
            False,
        ),
        "dispatch_attempt_binding_hash_must_match": (
            "provider_dispatch_attempt_validation",
            dispatch_attempt(final_request_sha256="f" * 64),
            False,
        ),
        "dispatch_expiry_after_issuance": (
            "provider_dispatch_admission_receipt",
            {**dispatch, "expires_at_utc": "2026-08-12T23:59:00Z"},
            False,
        ),
        "dispatch_consumption_within_window": (
            "provider_dispatch_admission_receipt",
            {
                **dispatch,
                "consumed_at_utc": "2026-08-12T23:59:00Z",
                "consumption_evidence_ref": "consumption:1",
            },
            False,
        ),
        "secret_or_path_ref_rejected": (
            "provider_dispatch_admission_receipt",
            {**dispatch, "route_ref": "file:///tmp/provider-secret"},
            False,
        ),
        "secret_shaped_route_rejected": (
            "provider_request_permit",
            {**dispatch, "route_ref": "sk-abcdefgh12345678"},
            False,
        ),
        "bearer_value_rejected": (
            "provider_request_permit",
            {**dispatch, "route_ref": "Bearer abcdefgh12345678"},
            False,
        ),
        "windows_absolute_path_rejected": (
            "provider_request_permit",
            {**dispatch, "route_ref": "C:\\Users\\someone\\credentials.json"},
            False,
        ),
    }
    return {
        name: (not validate(instance, definition, schema)) is expected_valid
        for name, (definition, instance, expected_valid) in cases.items()
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("definition", nargs="?", choices=sorted(read_json(SCHEMA_PATH)["$defs"]))
    parser.add_argument("instance", nargs="?", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    schema = read_json(SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    if args.self_test:
        checks = self_test(schema)
        failures = sorted(name for name, passed in checks.items() if not passed)
        print(json.dumps({"checks": checks, "failures": failures, "status": "fail" if failures else "pass"}, indent=2))
        return 1 if failures else 0
    if args.definition is None or args.instance is None:
        parser.error("definition and instance are required unless --self-test is used")
    failures = validate(read_json(args.instance), args.definition, schema)
    print(json.dumps({"definition": args.definition, "failures": failures, "status": "fail" if failures else "pass"}, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
