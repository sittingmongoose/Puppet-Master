## Attempt-Centric Runtime Recovery UI Reconciliation Addendum (2026-03-09)

Run Graph is a consumer of canonical runtime contracts and MUST NOT invent alternate state families.

Required rules:
- queue-analysis links use `scheduler_pass_id`
- pass-history rows may show `selected_at_utc`, score breakdown, and `newly_ready_nodes[]` only when present in canonical scheduler-pass records
- blocked node lists sort by `blocked_sequence` descending within the active view
- pre-attempt blocked episodes bind recovery to `blocked_sequence`, not a fabricated `attempt_id`
- node surfaces use canonical blocked reasons; `attention_required` is not a node runtime state
- remediation ceiling surfaces show a persistent blocked state with recovery actions driven by canonical commands and visible remediation lineage
- safe-point history links open by `safe_point_id`, not by loose attempt-only heuristics
