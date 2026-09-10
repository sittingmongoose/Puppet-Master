"""Cross-field laws for the Shared Integration Runtime's full-thread values.

This is a static contract oracle, not a runtime owner, adapter, or producer.
JSON Schema validates the closed shapes first. These comparisons supplement it
where bounds, equality, or identity preservation involve multiple fields.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def _timestamp(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value[:-1] + "+00:00" if value.endswith("Z") else value)
    except ValueError:
        return None
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        return None
    return parsed.astimezone(timezone.utc)


def full_thread_semantic_failures(definition_name: str, value: Any) -> list[str]:
    """Return stable rule IDs; callers must also validate the complete schema."""

    if not isinstance(value, dict):
        return []
    failures: list[str] = []
    if definition_name == "CommandOutcomeRecord":
        receipt = value.get("acknowledgement_receipt_ref")
        if receipt is not None:
            same_frame = value.get("dispatch_frame_id") == value.get("acknowledgement_frame_id")
            zero_offset = value.get("acknowledgement_frame_offset") == 0
            if same_frame != zero_offset or value.get("same_frame_acknowledged") != same_frame:
                failures.append("command_acknowledgement_frame_parity")
    elif definition_name == "ObservableWorkRecord":
        completed, total = value.get("completed_units"), value.get("total_units")
        if isinstance(completed, (int, float)) and isinstance(total, (int, float)) and completed > total:
            failures.append("work_progress_exceeds_denominator")
        work_id, parent = value.get("observable_work_id"), value.get("parent_work_id")
        children = value.get("child_work_ids", [])
        if isinstance(children, list) and (
            work_id in children or (parent is not None and (parent == work_id or parent in children))
        ):
            failures.append("work_relationship_cycle")
        observed = _timestamp(value.get("observed_at"))
        activity = _timestamp(value.get("last_activity_at"))
        heartbeat_value = value.get("heartbeat_at")
        heartbeat = _timestamp(heartbeat_value)
        if observed is None or activity is None or (heartbeat_value is not None and heartbeat is None):
            failures.append("work_activity_timestamp_invalid")
        elif activity > observed or (heartbeat is not None and heartbeat > observed):
            failures.append("work_activity_in_future")
    elif definition_name == "FullThreadProjectionRecord":
        start = value.get("window_start")
        count = value.get("window_count")
        overscan = value.get("overscan_count")
        total = value.get("total_item_count")
        ids = value.get("stable_item_ids")
        if all(isinstance(item, int) and not isinstance(item, bool) for item in (start, count, overscan, total)):
            if start > total or start + count > total or count + overscan > total:
                failures.append("projection_window_out_of_bounds")
            if isinstance(ids, list) and len(ids) != count + overscan:
                failures.append("projection_stable_id_cardinality")
        projection, latest = value.get("projection_generation"), value.get("latest_request_generation")
        disposition = value.get("stale_generation_disposition")
        if isinstance(projection, int) and isinstance(latest, int):
            if projection > latest or (projection == latest) != (disposition == "not_stale"):
                failures.append("projection_generation_disposition")
    elif definition_name == "ContinuityRecord":
        prior_epoch, current_epoch = value.get("prior_transport_epoch"), value.get("current_transport_epoch")
        if isinstance(prior_epoch, int) and isinstance(current_epoch, int) and current_epoch < prior_epoch:
            failures.append("continuity_transport_epoch_regressed")
        prior, current = value.get("prior_identity"), value.get("identity")
        if isinstance(prior, dict) and isinstance(current, dict):
            # Attempt identity may change; durable operation, target, and owner
            # generations cannot be silently reminted by a transport return.
            fields = (
                "scope_kind", "operation_id", "operation_generation", "command_instance_id",
                "server_id", "project_id", "project_home_server_id", "named_plan_id",
                "thread_id", "goal_id", "execution_host_id", "execution_environment_id",
                "source_location_id", "topology_generation",
            )
            if any(prior.get(field) != current.get(field) for field in fields):
                failures.append("continuity_logical_identity_changed")
        generation, expected = value.get("continuation_generation"), value.get("expected_continuation_generation")
        if isinstance(generation, int) and isinstance(expected, int):
            stale = generation != expected
            if stale != (value.get("disposition") == "stale_generation_rejected"):
                failures.append("continuity_generation_disposition")
    return sorted(set(failures))


def command_outcome_binding_failures(owner_result: Any, outcome: Any, outcome_ref: str) -> list[str]:
    """Check the central result's actual join to a separately validated outcome.

    Owner-specific result payloads remain owned and validated by their own
    schemas; the central result and this side record do not replace them.
    """

    if not isinstance(owner_result, dict) or not isinstance(outcome, dict):
        return ["command_outcome_binding_not_objects"]
    identity = outcome.get("identity")
    if not isinstance(identity, dict):
        return ["command_outcome_binding_identity_missing"]
    failures: list[str] = []
    if owner_result.get("command_outcome_ref") != outcome_ref:
        failures.append("command_outcome_reference_mismatch")
    if owner_result.get("command_id") != outcome.get("command_id"):
        failures.append("command_outcome_command_mismatch")
    for field in ("command_instance_id", "operation_id"):
        if owner_result.get(field) != identity.get(field):
            failures.append(f"command_outcome_{field}_mismatch")
    return failures
