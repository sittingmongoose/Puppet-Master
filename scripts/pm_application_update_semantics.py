"""Finite RSC-014 check arithmetic and transition oracle, never native admission.

Inputs are contract values. No supplied map, ref, Boolean or fixture supplies
source authentication, policy admission, installation custody or a storage CAS.
Native owners must obtain those original records and commit under their own
authority before applying these relationships. This module does no I/O or writes.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone


def _time(value):
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None or parsed.utcoffset() != timedelta(0):
        raise ValueError("not UTC")
    return parsed


def _state_failures(state):
    errors = []
    success, cache, due = state["last_success"], state["cache"], state["due"]
    if (success is None) != (cache is None) or (success is None) != (due is None):
        return ["update_check_anchor_cache_due_presence"]
    if cache is not None:
        if cache["publication_revision"] != success["publication_revision"]:
            errors.append("update_check_success_publication")
        if any(row["channel"] != state["scope"]["channel_id"] for row in cache["metadata"]):
            errors.append("update_check_metadata_channel")
        if due["anchor_result_id"] != success["result_id"]:
            errors.append("update_check_due_anchor")
        if due["policy_version"] != state["policy_version"]:
            errors.append("update_check_due_policy")
        seconds = due["interval_seconds"] + due["jitter_seconds"]
        channel = state["scope"]["channel_id"]
        if seconds <= 0:
            errors.append("update_check_nonpositive_interval")
        if channel == "stable" and due["interval_seconds"] != 86400:
            errors.append("update_check_stable_base")
        for selected, low, high in (("canary", 21600, 43200), ("nightly", 3600, 21600)):
            if channel == selected and not (low <= due["interval_seconds"] <= high and low <= seconds <= high):
                errors.append("update_check_channel_bounds")
        if _time(due["due_at_utc"]) != _time(success["validated_at_utc"]) + timedelta(seconds=seconds):
            errors.append("update_check_due_arithmetic")
        if state["last_attempt_at_utc"] is None:
            errors.append("update_check_success_without_attempt")
    if state["retry_not_before_utc"] is not None:
        if state["last_attempt_at_utc"] is None or _time(state["retry_not_before_utc"]) <= _time(state["last_attempt_at_utc"]):
            errors.append("update_check_backoff_order")
    return errors


def check_due(state, *, current_scope, current_policy_version, now_utc, trigger):
    """Pure due classification; arguments are not an authenticated authority API.

    Even `due` needs actual Server permission/policy admission and a revision CAS.
    Repeated calls reuse the persisted due selection, including across restart.
    """
    if trigger not in ("launch", "background", "manual"):
        return "invalid_trigger"
    if state["scope"] != current_scope:
        return "scope_changed"
    if state["policy_version"] != current_policy_version:
        return "policy_changed"
    if application_update_semantic_failures("ApplicationCheckState", state):
        return "invalid_state"
    now = _time(now_utc)
    anchors = [state["last_attempt_at_utc"]]
    if state["last_success"] is not None:
        anchors.append(state["last_success"]["validated_at_utc"])
    if any(value is not None and _time(value) > now for value in anchors):
        return "clock_discontinuity"
    if state["in_flight_operation_id"] is not None:
        return "coalesce"
    if trigger != "manual" and not state["automatic_enabled"]:
        return "automatic_disabled"
    if trigger == "background" and state["scope"]["channel_id"] == "stable":
        return "launch_only"
    if state["retry_not_before_utc"] is not None and now < _time(state["retry_not_before_utc"]):
        return "backoff"
    if trigger == "manual" or state["due"] is None or now >= _time(state["due"]["due_at_utc"]):
        return "due"
    return "not_due"


def _transition_failures(value):
    before, attempt, result, after = (value[key] for key in ("before", "attempt", "result", "after"))
    errors = _state_failures(before) + _state_failures(after)
    for record in (attempt, result, after):
        if record["scope"] != before["scope"]:
            errors.append("update_check_scope")
        if record["policy_version"] != before["policy_version"]:
            errors.append("update_check_policy")
    if before["in_flight_operation_id"] != attempt["operation_id"] or result["operation_id"] != attempt["operation_id"]:
        errors.append("update_check_operation")
    if before["revision"] != attempt["expected_revision"] + 1 or after["revision"] != before["revision"] + 1:
        errors.append("update_check_revision")
    if before["last_attempt_at_utc"] != attempt["started_at_utc"] or after["last_attempt_at_utc"] != before["last_attempt_at_utc"]:
        errors.append("update_check_attempt_time")
    if after["in_flight_operation_id"] is not None:
        errors.append("update_check_unsettled_operation")
    if after["automatic_enabled"] != before["automatic_enabled"]:
        errors.append("update_check_toggle_mutation")
    if attempt["trigger"] != "manual" and not before["automatic_enabled"]:
        errors.append("update_check_disabled_automatic_attempt")
    if attempt["trigger"] == "background" and before["scope"]["channel_id"] == "stable":
        errors.append("update_check_stable_background")
    started, completed = _time(attempt["started_at_utc"]), _time(result["completed_at_utc"])
    if attempt["trigger"] != "manual" and before["due"] is not None and started < _time(before["due"]["due_at_utc"]):
        errors.append("update_check_attempt_before_due")
    if before["retry_not_before_utc"] is not None and started < _time(before["retry_not_before_utc"]):
        errors.append("update_check_attempt_during_backoff")
    if completed < started:
        errors.append("update_check_completion_order")
    if before["last_success"] is not None and started < _time(before["last_success"]["validated_at_utc"]):
        errors.append("update_check_clock_discontinuity")
    if attempt["submitted_validator"] != result["submitted_validator"]:
        errors.append("update_check_submitted_validator")
    if attempt["submitted_validator"] is not None and (before["cache"] is None or attempt["submitted_validator"] != before["cache"]["conditional_validator"]):
        errors.append("update_check_unbound_validator")
    outcome, publication = result["outcome"], result["publication"]
    if outcome in ("validated", "not_modified"):
        if publication is None or result["source_evidence_ref"] is None:
            return errors + ["update_check_missing_source_validation"]
        if before["last_success"] is not None and result["result_id"] == before["last_success"]["result_id"]:
            errors.append("update_check_replayed_success_is_not_new_validation")
        if before["cache"] is not None and publication["publication_revision"] == before["cache"]["publication_revision"] and publication["metadata"] != before["cache"]["metadata"]:
            errors.append("update_check_immutable_publication_changed")
        if outcome == "not_modified":
            if before["cache"] is None or attempt["submitted_validator"] is None or publication != before["cache"]:
                errors.append("update_check_conditional_publication")
        elif publication["source_result_id"] != result["result_id"]:
            errors.append("update_check_publication_result")
        expected_success = {
            "result_id": result["result_id"], "validated_at_utc": result["completed_at_utc"],
            "publication_revision": publication["publication_revision"],
            "source_evidence_ref": result["source_evidence_ref"],
        }
        if after["last_success"] != expected_success or after["cache"] != publication:
            errors.append("update_check_success_settlement")
        if after["retry_not_before_utc"] is not None:
            errors.append("update_check_success_retains_backoff")
    else:
        for key in ("last_success", "cache", "due"):
            if after[key] != before[key]:
                errors.append("update_check_nonsuccess_mutates_" + key)
        if publication is not None or result["source_evidence_ref"] is not None:
            errors.append("update_check_nonsuccess_source_claim")
        if outcome in ("offline", "failed"):
            if after["retry_not_before_utc"] is None or _time(after["retry_not_before_utc"]) <= completed:
                errors.append("update_check_failure_backoff")
        elif after["retry_not_before_utc"] != before["retry_not_before_utc"]:
            errors.append("update_check_cache_creates_retry")
    return errors


def application_update_semantic_failures(definition_name, value):
    """Schema validator runs first; fail closed on malformed direct callers too."""
    try:
        if definition_name == "ApplicationCheckState":
            return sorted(set(_state_failures(value)))
        if definition_name == "ApplicationCheckTransition":
            return sorted(set(_transition_failures(value)))
        return []
    except (KeyError, TypeError, ValueError, OverflowError):
        return ["update_check_malformed_semantic_input"]
