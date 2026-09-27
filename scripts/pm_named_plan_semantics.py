"""Single authoritative NamedPlan child-parent join resolver (static contract oracle).

PERF-001 closes immutable child-to-NamedPlan joins with ONE resolver contract
instead of duplicating every child state machine. JSON Schema validates the
closed request/owner-view/verdict/case shapes first; this module performs the
substantive comparison the schema cannot express.

Trust model. The GUI/caller supplies only the join request (explicit
``project_id``/``named_plan_id``, exact child ``ref``/``kind``/``revision``/``hash``,
expected aggregate generation, read-or-mutate intent, optional claimed edge) and
an untrusted proposed owner view. The child owner's adapter mints the
authoritative actual owner record by reading the real source keyed by exact
child kind/ref at one consistent snapshot, and the aggregate adapter supplies
the actual aggregate at that same snapshot. The resolver verifies every
proposed view field against the actual record first, then compares the request
against the actuals only. A caller-shaped view that agrees with the request
proves nothing: when the actual record disagrees, the join rejects, and the
verdict carries no project/Plan identity, so ownership can never be
manufactured from the requested Plan.

Rejection precedence (first failure wins, deterministic):
  1. focus_only_no_explicit_identity: request lacks explicit project/Plan identity
  2. incomplete_join_request: request lacks exact child fields, expected
     aggregate generation, or intent
  3. owner_record_mismatch: actual record is malformed or keyed to a different
     child ref than requested
  4. kind_mismatch: actual record is a different child kind than requested
  5. proposed_owner_view_mismatch: any proposed view field differs from actual
  6. wrong_project / wrong_plan_same_project: actual owner record names another
  7. stale_child_revision / stale_child_hash: actual child generation disagrees
  8. wrong_project / wrong_plan_same_project: actual aggregate names another
  9. stale_aggregate_revision / stale_aggregate_hash: aggregate generation moved
  10. snapshot_mismatch: owner and aggregate actuals are not from one snapshot
  11. orphan_no_aggregate_edge: ref sits on neither current nor historical edge
  12. edge_claim_mismatch: found edge disagrees with the optional claimed edge
  13. historical_edge_mutation_forbidden: mutate intent on a historical edge

Historical-edge acceptance authorizes read/inspection only, never mutation:
write, approve, compile, and handoff require a current-edge accept. Flat
historical refs are membership-only; child kind always comes from the
authoritative actual owner record, never from the flat list.

This is a static contract oracle, not a runtime owner, adapter, dispatcher, or
storage writer. Native handlers remain unavailable; no production storage keys
or events are invented here. Child lifecycle and status stay owned by the child
owner: owner views carry identity plus snapshot fields only, and the verdict
carries no lifecycle claim. Fixture cases that copy a record prove static
conformance of this comparison logic, never native authenticity.
"""

from __future__ import annotations

from typing import Any

JOIN_CASE_SCHEMA_ID = "pm.named_plan.owner_join_case.v1"
JOIN_CASE_DEFINITION = "named_plan_owner_join_case"

VERDICT_SCHEMA_ID = "pm.named_plan.owner_join_verdict.v1"
VERDICT_SCHEMA_VERSION = "1.0.0"

# Every owner-view identity field the resolver verifies proposed-vs-actual.
OWNER_VIEW_COMPARED_FIELDS = (
    "child_ref",
    "child_kind",
    "project_id",
    "named_plan_id",
    "child_revision",
    "child_currentness_sha256",
    "snapshot_ref",
)

# Aggregate fields carrying typed current edges, by child kind. Historical edges
# come from the flat historical_child_refs list for every kind; kinds without a
# typed current slot (assistant_plan_link) resolve historical-only.
CURRENT_EDGE_FIELDS: dict[str, tuple[str, ...]] = {
    "prd": ("primary_prd_ref",),
    "planning_run": ("current_planning_run_ref",),
    "approved_plan_pack": ("current_approved_plan_pack_ref",),
    "plan_compile_run": ("current_plan_compile_run_ref",),
    "goal_run": ("current_goal_run_refs",),
    "assistant_plan_link": (),
}


def _is_non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and len(value) > 0


def _is_revision(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value >= 1


def _current_edges_by_kind(aggregate: dict[str, Any]) -> dict[str, set[str]]:
    """Collect typed current-edge refs per child kind from the aggregate record."""

    edges: dict[str, set[str]] = {kind: set() for kind in CURRENT_EDGE_FIELDS}
    for kind, fields in CURRENT_EDGE_FIELDS.items():
        for field in fields:
            raw = aggregate.get(field)
            if isinstance(raw, str) and raw:
                edges[kind].add(raw)
            elif isinstance(raw, list):
                for entry in raw:
                    if isinstance(entry, str) and entry:
                        edges[kind].add(entry)
    return edges


def _historical_refs(aggregate: dict[str, Any]) -> set[str]:
    raw = aggregate.get("historical_child_refs")
    if not isinstance(raw, list):
        return set()
    return {entry for entry in raw if isinstance(entry, str) and entry}


def _rejected(code: str) -> dict[str, Any]:
    return {
        "schema_id": VERDICT_SCHEMA_ID,
        "schema_version": VERDICT_SCHEMA_VERSION,
        "decision": "rejected",
        "rejection_code": code,
        "edge_found": None,
    }


def resolve_named_plan_owner_join(
    join_request: Any,
    proposed_owner_view: Any,
    actual_owner_record: Any,
    aggregate: Any,
) -> dict[str, Any]:
    """Recompute the authoritative verdict from the proposal plus trusted actuals.

    Only ``join_request`` and ``proposed_owner_view`` come from the caller; the
    actual owner record and aggregate are trusted adapter reads. Returns a
    schema-valid ``named_plan_owner_join_verdict`` value. Every rejection
    carries exactly one closed rejection code and ``edge_found`` null; no
    partial or summary proof is ever accepted.
    """

    if not isinstance(join_request, dict):
        return _rejected("incomplete_join_request")
    project_id = join_request.get("project_id")
    named_plan_id = join_request.get("named_plan_id")
    if not _is_non_empty_string(project_id) or not _is_non_empty_string(named_plan_id):
        return _rejected("focus_only_no_explicit_identity")

    child_ref = join_request.get("child_ref")
    child_kind = join_request.get("child_kind")
    child_revision = join_request.get("child_revision")
    child_hash = join_request.get("child_currentness_sha256")
    expected_aggregate_revision = join_request.get("expected_aggregate_revision")
    expected_aggregate_hash = join_request.get("expected_aggregate_currentness_sha256")
    intent = join_request.get("intent")
    claimed_edge = join_request.get("claimed_edge")
    if (
        not _is_non_empty_string(child_ref)
        or not _is_non_empty_string(child_kind)
        or not _is_revision(child_revision)
        or not _is_non_empty_string(child_hash)
        or not _is_revision(expected_aggregate_revision)
        or not _is_non_empty_string(expected_aggregate_hash)
        or intent not in ("read", "mutate")
        or claimed_edge not in (None, "current", "historical")
    ):
        return _rejected("incomplete_join_request")

    # Trusted actual, acquired by exact child ref with its kind verified.
    if not isinstance(actual_owner_record, dict):
        return _rejected("owner_record_mismatch")
    if any(actual_owner_record.get(field) is None for field in OWNER_VIEW_COMPARED_FIELDS):
        return _rejected("owner_record_mismatch")
    if actual_owner_record.get("child_ref") != child_ref:
        return _rejected("owner_record_mismatch")
    if actual_owner_record.get("child_kind") != child_kind:
        return _rejected("kind_mismatch")

    # Untrusted proposal: every field must equal the actual record.
    if not isinstance(proposed_owner_view, dict):
        return _rejected("proposed_owner_view_mismatch")
    for field in OWNER_VIEW_COMPARED_FIELDS:
        if proposed_owner_view.get(field) != actual_owner_record.get(field):
            return _rejected("proposed_owner_view_mismatch")

    # Request vs actual owner record: the original source edge decides.
    if actual_owner_record.get("project_id") != project_id:
        return _rejected("wrong_project")
    if actual_owner_record.get("named_plan_id") != named_plan_id:
        return _rejected("wrong_plan_same_project")
    if actual_owner_record.get("child_revision") != child_revision:
        return _rejected("stale_child_revision")
    if actual_owner_record.get("child_currentness_sha256") != child_hash:
        return _rejected("stale_child_hash")

    # Request vs actual aggregate, including its fenced generation.
    if not isinstance(aggregate, dict):
        return _rejected("orphan_no_aggregate_edge")
    if aggregate.get("project_id") != project_id:
        return _rejected("wrong_project")
    if aggregate.get("named_plan_id") != named_plan_id:
        return _rejected("wrong_plan_same_project")
    if aggregate.get("revision") != expected_aggregate_revision:
        return _rejected("stale_aggregate_revision")
    if aggregate.get("currentness_sha256") != expected_aggregate_hash:
        return _rejected("stale_aggregate_hash")
    if aggregate.get("snapshot_ref") != actual_owner_record.get("snapshot_ref"):
        return _rejected("snapshot_mismatch")

    current = _current_edges_by_kind(aggregate)
    if child_ref in current.get(child_kind, set()):
        edge_found = "current"
    elif child_ref in _historical_refs(aggregate):
        edge_found = "historical"
    else:
        return _rejected("orphan_no_aggregate_edge")

    if claimed_edge is not None and claimed_edge != edge_found:
        return _rejected("edge_claim_mismatch")
    if intent == "mutate" and edge_found == "historical":
        return _rejected("historical_edge_mutation_forbidden")

    return {
        "schema_id": VERDICT_SCHEMA_ID,
        "schema_version": VERDICT_SCHEMA_VERSION,
        "decision": "accepted",
        "rejection_code": None,
        "edge_found": edge_found,
    }


def named_plan_owner_join_failures(definition_name: str, value: Any) -> list[str]:
    """Return stable rule IDs for gate dispatch; schema validates structure first.

    Join cases pass only when the recomputed verdict matches the authored
    expected verdict field by field. All other NamedPlan definitions are
    structural-only and return no semantic failures.
    """

    is_case = definition_name == JOIN_CASE_DEFINITION or (
        isinstance(value, dict) and value.get("schema_id") == JOIN_CASE_SCHEMA_ID
    )
    if not is_case:
        return []
    if not isinstance(value, dict):
        return ["owner_join_case_malformed"]
    join_request = value.get("join_request")
    proposed_owner_view = value.get("owner_view")
    actual_owner_record = value.get("actual_owner_record")
    aggregate = value.get("aggregate")
    expected = value.get("expected_verdict")
    if not isinstance(join_request, dict) or not isinstance(proposed_owner_view, dict):
        return ["owner_join_case_malformed"]
    if not isinstance(actual_owner_record, dict):
        return ["owner_join_case_malformed"]
    if not isinstance(aggregate, dict) or not isinstance(expected, dict):
        return ["owner_join_case_malformed"]

    recomputed = resolve_named_plan_owner_join(
        join_request, proposed_owner_view, actual_owner_record, aggregate
    )
    failures: list[str] = []
    if recomputed.get("decision") != expected.get("decision"):
        failures.append("owner_join_expected_decision_mismatch")
    if recomputed.get("rejection_code") != expected.get("rejection_code"):
        failures.append("owner_join_expected_rejection_code_mismatch")
    if recomputed.get("edge_found") != expected.get("edge_found"):
        failures.append("owner_join_expected_edge_mismatch")
    return sorted(failures)
