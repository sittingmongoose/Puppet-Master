"""PWIZ-023 typed owner-original custody joins for the existing Tour v3 exchange.

Static joins only.  This module never authenticates issuance, custody or current
authority: it proves that the typed records the existing Tour v3 action exchange
already carries are mutually consistent with that exchange's own entry point and
with the required injected issuing-owner resolver/readback interface.  A ref
string, a fixture, an equal current value, a self-declared boolean, a released
transaction-slot prior or a saved Tour checkpoint still authenticates nothing;
the native capture/readback adapter and the physical checkpoint admission remain
separate, later obligations.
"""
from __future__ import annotations

from typing import Any, Callable

OwnerCoverageResolver = Callable[[str, str, str], dict[str, Any] | None]

TERMINAL_ACTIONS = frozenset({"skip", "finish"})
TERMINAL_DETAIL_SCHEMA_ID = "pm.guided_tour.terminal_result.v3"
RESOLVER_INTERFACE_REF = "owner_original_resolver"
RESOLVER_BOUNDARIES = ("admission", "final_restore_release_boundary")
PRESENT_ORIGINAL = "present_held"
DENYING_LIFECYCLES = frozenset({"tombstoned", "permission_denied", "scope_denied"})
HOME_RECORD_KIND = "home_workspace_layout_record"
LANE_RECORD_KIND = "widget_or_panel_layout_lane_record"


def _context(value: Any) -> dict[str, Any] | None:
    context = value.get("context") if isinstance(value, dict) else None
    return context if isinstance(context, dict) else None


def binding(value: Any) -> dict[str, Any] | None:
    """The typed owner-original custody binding carried by this exchange."""
    context = _context(value)
    carried = context.get("original_custody") if context else None
    return carried if isinstance(carried, dict) else None


def _capture(value: Any) -> dict[str, Any]:
    context = _context(value) or {}
    capture = context.get("original_capture")
    return capture if isinstance(capture, dict) else {}


def _request(value: Any) -> dict[str, Any]:
    request = value.get("request") if isinstance(value, dict) else None
    return request if isinstance(request, dict) else {}


def _result(value: Any) -> dict[str, Any]:
    result = value.get("result") if isinstance(value, dict) else None
    return result if isinstance(result, dict) else {}


def action(value: Any) -> str:
    return str(_request(value).get("action_id", "")).rsplit(".", 1)[-1]


def _restoration(value: Any) -> dict[str, Any] | None:
    """The terminal restoration of this same action, or None when another owner
    record (or another rule) carries the mismatch."""
    detail = _result(value).get("detail")
    if not isinstance(detail, dict) or detail.get("schema_id") != TERMINAL_DETAIL_SCHEMA_ID:
        return None
    if detail.get("action_id") != _request(value).get("action_id"):
        return None
    restoration = detail.get("restoration")
    return restoration if isinstance(restoration, dict) else None


def _layout(value: Any) -> dict[str, Any]:
    layout = binding(value).get("layout_originals")
    return layout if isinstance(layout, dict) else {}


def _layout_entries(value: Any) -> list[dict[str, Any]]:
    entries = _layout(value).get("entries")
    return [entry for entry in entries if isinstance(entry, dict)] if isinstance(entries, list) else []


def _originals(value: Any) -> dict[str, dict[str, Any]]:
    """original_ref -> owner-scoped original record (Chat original and each layout entry)."""
    originals: dict[str, dict[str, Any]] = {}
    chat = binding(value).get("chat_original")
    if isinstance(chat, dict):
        originals[chat["original_ref"]] = chat
    for entry in _layout_entries(value):
        originals[entry["original_ref"]] = entry
    return originals


def _readback(value: Any, name: str) -> dict[str, Any] | None:
    resolver = binding(value).get("resolver_binding")
    readback = resolver.get(name) if isinstance(resolver, dict) else None
    return readback if isinstance(readback, dict) else None


def _readback_entries(readback: dict[str, Any] | None) -> list[dict[str, Any]]:
    entries = (readback or {}).get("owner_entries")
    return [entry for entry in entries if isinstance(entry, dict)] if isinstance(entries, list) else []


def _resolver_admitted(value: Any) -> bool:
    resolver = binding(value).get("resolver_binding")
    return isinstance(resolver, dict) and resolver.get("availability") == "admitted"


def _restore_entries(value: Any) -> list[dict[str, Any]]:
    attempt = binding(value).get("restore_boundary")
    entries = attempt.get("entries") if isinstance(attempt, dict) else None
    return [entry for entry in entries if isinstance(entry, dict)] if isinstance(entries, list) else []


def entry_point_join(value: Any) -> bool:
    """The typed records are bound to this exact exchange, not to a parallel example."""
    carried, capture, request, context = binding(value), _capture(value), _request(value), _context(value) or {}
    chat, layout = carried["chat_original"], _layout(value)
    if carried["captured_state_ref"] != context.get("captured_state_ref"):
        return False
    if carried["tour_session_id"] != context.get("tour_session_id") or carried["tour_session_id"] != request.get("tour_session_id"):
        return False
    if carried["project_id"] != request.get("project_id") or carried["project_id"] != chat["scope"]["project_ref"]:
        return False
    if chat["owner_ref"] != capture.get("chat_state_owner_ref"):
        return False
    if chat["chat_owner_snapshot_ref"] != capture.get("chat_owner_snapshot_ref"):
        return False
    if layout["layout_owner_snapshot_ref"] != capture.get("layout_owner_snapshot_ref"):
        return False
    if chat["placeholder_ref"] != capture.get("chat_placeholder_ref") or chat["focus_ref"] != capture.get("chat_focus_ref"):
        return False
    if chat["thread_coverage"] == "capture_time_absence":
        # An explicitly absent thread is captured as an absence: no thread and no selection.
        if chat["thread_ref"] is not None or chat["selection_ref"] is not None:
            return False
    else:
        if chat["thread_ref"] != capture.get("chat_thread_ref"):
            return False
        if chat["selection_ref"] != capture.get("chat_selection_ref"):
            return False
        if chat["thread_ref"] is None or chat["selection_ref"] is None:
            return False
    return bool(carried["binding_ref"] and layout["set_ref"] and layout["owner_binding_ref"]
                and carried["hold_lifecycle"]["hold_ref"])


def capture_precedes_first_mutation(value: Any) -> bool:
    """Every original was captured before its own owner's first mutation."""
    chat = binding(value)["chat_original"]
    if chat["capture_sequence"] >= chat["first_chat_mutation_sequence"]:
        return False
    for entry in _layout_entries(value):
        if entry["capture_sequence"] >= entry["first_owner_mutation_sequence"]:
            return False
    return True


def admission_readback_authentication(value: Any) -> bool:
    """The injected resolver authenticates each original at admission with the
    captured owner revision/currentness, never by the ref string alone."""
    resolver = binding(value)["resolver_binding"]
    admission = resolver["admission_readback"]
    if resolver["availability"] != "admitted":
        return admission is None
    if not isinstance(admission, dict) or admission.get("boundary") != RESOLVER_BOUNDARIES[0]:
        return False
    wanted = {
        ref: (original["owner_ref"], original["owner_revision_at_capture"], original["owner_currentness_sha256_at_capture"])
        for ref, original in _originals(value).items()
    }
    received = {entry["original_ref"]: entry for entry in _readback_entries(admission)}
    if set(received) != set(wanted):
        return False
    readback_refs = [entry["readback_ref"] for entry in _readback_entries(admission)]
    if len(set(readback_refs)) != len(readback_refs):
        return False
    for ref, (owner_ref, revision, currentness) in wanted.items():
        entry = received[ref]
        if entry["owner_ref"] != owner_ref:
            return False
        if entry["original_state"] != PRESENT_ORIGINAL or entry["current_lifecycle"] != "present":
            return False
        if entry["current_owner_revision"] != revision or entry["current_currentness_sha256"] != currentness:
            return False
    return True


def layout_affected_set(value: Any, owner_coverage_resolver: OwnerCoverageResolver | None = None) -> bool:
    """The layout binding enumerates the complete affected owner-scoped set; a
    single Home row is admitted only when the Home owner's coverage proves the
    affected set is exactly that row."""
    # The complete set must come from the issuing-owner resolver, not from any
    # combination of the exchange's own lists, counts, or coverage booleans.
    # A controlled fixture double can exercise this join but is never native proof.
    if owner_coverage_resolver is None:
        return False
    carried = binding(value)
    layout = _layout(value)
    try:
        coverage = owner_coverage_resolver(
            carried["project_id"], carried["tour_session_id"], layout["set_ref"]
        )
    except (KeyError, TypeError, ValueError):
        return False
    if not isinstance(coverage, dict) or coverage.get("authority_source") != "issuing_owner_readback":
        return False
    if coverage.get("proof_class") != "controlled_test_double" or coverage.get("native_proof") is not False:
        return False
    if coverage.get("project_id") != carried["project_id"] or coverage.get("tour_session_id") != carried["tour_session_id"]:
        return False
    if coverage.get("layout_set_ref") != layout["set_ref"]:
        return False
    actual = coverage.get("affected_originals")
    if not isinstance(actual, list) or not actual or any(
        not isinstance(row, dict) or not isinstance(row.get("owner_ref"), str) or
        not isinstance(row.get("original_ref"), str) for row in actual
    ):
        return False
    actual_pairs = [(row["owner_ref"], row["original_ref"]) for row in actual]
    if len(set(actual_pairs)) != len(actual_pairs):
        return False
    entries = _layout_entries(value)
    carried_pairs = [(entry["owner_ref"], entry["original_ref"]) for entry in entries]
    if len(set(carried_pairs)) != len(carried_pairs) or set(carried_pairs) != set(actual_pairs):
        return False
    completeness = layout["completeness"]
    entry_owners = {entry["owner_ref"] for entry in entries}
    if entry_owners != set(layout["affected_owner_refs"]) or completeness["declared_owner_count"] != len(entries):
        return False
    home_owner = _capture(value).get("layout_owner_ref")
    if completeness["single_home_row_claim"]:
        if len(entries) != 1 or entries[0]["record_kind"] != HOME_RECORD_KIND:
            return False
        if completeness["practice_mutates_widget_or_panel_lane"]:
            return False
    if completeness["practice_mutates_widget_or_panel_lane"] and not any(
        entry["record_kind"] == LANE_RECORD_KIND for entry in entries
    ):
        return False
    if entries and all(entry["record_kind"] == LANE_RECORD_KIND for entry in entries) and home_owner is None:
        return False
    identity_readbacks = {
        entry["original_ref"]: entry
        for readback in (_readback(value, "admission_readback"), _readback(value, "final_boundary_readback"))
        for entry in _readback_entries(readback)
    }
    for entry in entries:
        if entry["record_kind"] == HOME_RECORD_KIND:
            if entry["owner_ref"] != home_owner:
                return False
        elif entry["owner_ref"] == home_owner:
            # Home never covers widget/panel layout values another owner holds.
            return False
        authenticated = identity_readbacks.get(entry["original_ref"])
        if authenticated is not None and authenticated["owner_identity"] != entry["owner_identity"]:
            return False
    return True


def resolver_required(value: Any) -> bool:
    """The injected issuing-owner resolver/readback interface is required at
    admission and again at the final restore/release boundary; an absent or
    failing resolver refuses any production claim."""
    resolver = binding(value)["resolver_binding"]
    attempt = binding(value).get("restore_boundary")
    if resolver["availability"] == "admitted":
        if not isinstance(resolver["admission_readback"], dict):
            return False
        if attempt is None:
            return resolver["final_boundary_readback"] is None
        final = resolver["final_boundary_readback"]
        if not isinstance(final, dict) or final.get("boundary") != RESOLVER_BOUNDARIES[1]:
            return False
        if final["readback_ref"] != attempt["resolver_readback_ref"]:
            return False
        return True
    if resolver["admission_readback"] is not None or resolver["final_boundary_readback"] is not None:
        return False
    if attempt is not None and any(entry["applied"] for entry in attempt["entries"]):
        return False
    restoration = _restoration(value)
    if isinstance(restoration, dict) and restoration["status"] == "applied":
        return False
    return action(value) not in TERMINAL_ACTIONS or _result(value).get("status") == "recovery_required"


def original_resolvable(value: Any) -> bool:
    """A reported applied or keep outcome requires the held Chat original to be
    genuinely resolvable at the final boundary."""
    restoration = _restoration(value)
    if restoration is None or restoration["status"] not in {"applied", "not_required"}:
        return True
    if not _resolver_admitted(value):
        return True
    final = _readback(value, "final_boundary_readback")
    if not isinstance(final, dict):
        return True
    chat_ref = binding(value)["chat_original"]["original_ref"]
    for entry in _readback_entries(final):
        if entry["original_ref"] == chat_ref:
            return entry["original_state"] == PRESENT_ORIGINAL
    return False


def current_authority_revalidation(value: Any) -> bool:
    """Each owner applies nothing its own current lifecycle, deletion/tombstone,
    permission or scope denies, and issues current mutation metadata."""
    attempt = binding(value).get("restore_boundary")
    if not isinstance(attempt, dict) or not _resolver_admitted(value):
        return True
    final = _readback(value, "final_boundary_readback")
    if not isinstance(final, dict):
        return True
    readbacks = {entry["readback_ref"]: entry for entry in _readback_entries(final)}
    for entry in attempt["entries"]:
        current = readbacks.get(entry["current_authority_readback_ref"])
        if current is None:
            return False
        if current["owner_ref"] != entry["owner_ref"] or current["original_ref"] != entry["original_ref"]:
            return False
        if entry["applied"] is not (entry["apply_status"] == "applied"):
            return False
        if entry["applied"]:
            if current["current_lifecycle"] != "present" or not entry["mutation_metadata_issued"]:
                return False
            # The Chat original's resolvability at the boundary is its own rule.
            if entry["original_kind"] == "layout" and current["original_state"] != PRESENT_ORIGINAL:
                return False
        if current["current_lifecycle"] in DENYING_LIFECYCLES or current["current_lifecycle"] == "deleted":
            if entry["apply_status"] != "not_applied_denied":
                return False
    return True


def restoration_outcome_matches_owners(value: Any) -> bool:
    """A partial, denied or unavailable original never yields applied or
    completed restoration; explicit layout Keep skips layout restore only."""
    attempt = binding(value).get("restore_boundary")
    if action(value) not in TERMINAL_ACTIONS:
        if action(value) == "resume" and attempt is not None:
            # The dedicated resume rule owns this exact counterexample.
            return True
        # Next, pause, replay and resume cannot smuggle a final restore attempt
        # through a local (nonterminal) result detail.
        return attempt is None
    restoration = _restoration(value)
    if restoration is None:
        return attempt is None
    if not isinstance(attempt, dict):
        return False
    entries = attempt["entries"]
    refs = [entry["original_ref"] for entry in entries]
    if len(set(refs)) != len(refs) or set(refs) != set(_originals(value)):
        return False
    chat_ref = binding(value)["chat_original"]["original_ref"]
    chat_entries = [entry for entry in entries if entry["original_kind"] == "chat_state"]
    layout_entries = [entry for entry in entries if entry["original_kind"] == "layout"]
    if len(chat_entries) != 1 or chat_entries[0]["original_ref"] != chat_ref:
        return False
    if len(layout_entries) != len(_layout_entries(value)):
        return False
    if any(entry["apply_status"] == "skipped_layout_keep" and entry["original_kind"] != "layout" for entry in entries):
        return False
    status = restoration["status"]
    if status == "applied":
        if not chat_entries[0]["applied"] or not all(entry["applied"] for entry in layout_entries):
            return False
        return restoration["layout_restored"] is True and restoration["chat_state_restored"] is True
    if status == "not_required":
        if not chat_entries[0]["applied"] or restoration["chat_state_restored"] is not True:
            return False
        if any(entry["applied"] or entry["apply_status"] != "skipped_layout_keep" for entry in layout_entries):
            return False
        return restoration["layout_restored"] is False
    return restoration["retryable"] is True and not all(entry["applied"] for entry in entries)


def retry_reuses_held_original(value: Any) -> bool:
    """A failed restoration retries with the same held original, never with a
    substituted or re-created source."""
    attempt = binding(value).get("restore_boundary")
    if not isinstance(attempt, dict):
        return True
    retry = attempt["retry"]
    if retry["retry_source"] is None:
        return (retry["retry_of_attempt_ref"] is None and retry["retry_sequence"] is None
                and retry["retry_original_refs"] == [])
    if retry["retry_of_attempt_ref"] is None or not isinstance(retry["retry_sequence"], int):
        return False
    if retry["retry_sequence"] >= attempt["attempt_sequence"]:
        return False
    retried = retry["retry_original_refs"]
    return set(retried) == set(_originals(value)) and len(retried) == len(_originals(value))


def release_after_settlement(value: Any) -> bool:
    """Released only after terminal settlement or the recovery resolution that
    ends the session; held while mutation, resume or retry can still require it."""
    hold = binding(value)["hold_lifecycle"]
    attempt = binding(value).get("restore_boundary")
    if action(value) not in TERMINAL_ACTIONS:
        if action(value) == "resume" and attempt is not None:
            return True
        return hold["hold_state"] == "held" and attempt is None
    if hold["hold_state"] == "held":
        return (hold["release_trigger"] == "none_yet" and hold["release_sequence"] is None
                and hold["settlement_ref"] is None)
    if not isinstance(attempt, dict) or not hold["settlement_ref"]:
        return False
    if hold["release_trigger"] == "none_yet" or not isinstance(hold["release_sequence"], int):
        return False
    if hold["release_sequence"] <= attempt["attempt_sequence"]:
        return False
    restoration = _restoration(value)
    if restoration is None:
        return False
    result = _result(value)
    detail = result.get("detail")
    state_after = result.get("state_after")
    if not isinstance(detail, dict) or not isinstance(state_after, dict):
        return False
    if hold["release_trigger"] == "terminal_settlement":
        return (result.get("status") == "applied"
                and detail.get("status") == state_after.get("status")
                and detail.get("status") in {"skipped", "completed"}
                and restoration["status"] in {"applied", "not_required"})
    return (hold["release_trigger"] == "ending_recovery_resolution"
            and result.get("status") == "recovery_required"
            and detail.get("status") == state_after.get("status") == "recovery_required"
            and restoration["status"] == "failed")


def resume_never_restores(value: Any) -> bool:
    """Close/reload resume revalidates the checkpoint and the held originals; it
    never applies an original merely because the tour resumed."""
    if action(value) != "resume":
        return True
    if binding(value).get("restore_boundary") is not None:
        return False
    return _restoration(value) is None


CUSTODY_RULES = (
    ("tour.original_custody_entry_point_join", entry_point_join),
    ("tour.original_custody_capture_precedes_first_mutation", capture_precedes_first_mutation),
    ("tour.original_custody_admission_readback_authentication", admission_readback_authentication),
    ("tour.original_custody_layout_affected_set", layout_affected_set),
    ("tour.original_custody_resolver_required", resolver_required),
    ("tour.original_custody_original_resolvable", original_resolvable),
    ("tour.original_custody_current_authority_revalidation", current_authority_revalidation),
    ("tour.original_custody_restoration_outcome_matches_owners", restoration_outcome_matches_owners),
    ("tour.original_custody_retry_reuses_held_original", retry_reuses_held_original),
    ("tour.original_custody_release_after_settlement", release_after_settlement),
    ("tour.original_custody_resume_never_restores", resume_never_restores),
)


def guided_tour_custody_semantic_failures(
    value: Any, owner_coverage_resolver: OwnerCoverageResolver | None = None
) -> list[str]:
    """Named custody joins for one Tour v3 action exchange. Fail closed."""
    if binding(value) is None:
        return [CUSTODY_RULES[0][0]]
    failures: list[str] = []
    for name, check in CUSTODY_RULES:
        try:
            valid = (check(value, owner_coverage_resolver) if check is layout_affected_set
                     else check(value))
        except (KeyError, TypeError, ValueError, IndexError):
            # A structurally valid exchange with a missing or wrong-typed nested
            # record fails closed instead of skipping the remaining joins.
            valid = False
        if not valid:
            failures.append(name)
    return failures
