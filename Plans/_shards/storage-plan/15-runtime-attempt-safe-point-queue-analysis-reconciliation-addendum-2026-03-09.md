## Runtime Attempt / Safe Point / Queue Analysis Reconciliation Addendum (2026-03-09)

Storage and projections MUST persist the scheduler and recovery model without ambiguity.

### Required logical records
1. `attempt_record`
   - keys: `run_id`, `node_id`, `attempt_id`
   - fields: lifecycle state, `attempt_count`, `retry_count`, `failure_class?`, `blocked_reason_code?`, timestamps, requested/effective model snapshot identifiers, requested/effective permission snapshot identifiers, `safe_point_id?`, remediation lineage fields, `replan_generation`, stale/historical marker
2. `safe_point_record`
   - keys: `safe_point_id`
   - fields: originating attempt, worktree/workspace refs, captured baseline refs, creation reason, restore result, generation
3. `scheduler_pass_record`
   - keys: `run_id`, `scheduler_pass_id`
   - legacy alias: `analysis_id = scheduler_pass_id`
   - fields: `wake_reason`, capacity summary, ready nodes with score terms, selected nodes, non-selected nodes with reason, pass timestamps
4. `blocked_projection`
   - keys: `run_id`, `node_id`, `attempt_id?`, `blocked_sequence`
   - fields: `blocked_reason_code`, `allowed_action_ids[]`, prerequisite metadata, preserved-local-work flag, resolved-by ref when available
5. `remediation_lineage_record`
   - keys: `remediation_root_id`
   - fields: parent attempt, child attempts, findings, generation, terminal resolution

### Counter semantics
- `attempt_count` = total dispatch attempts for the node in the run, including the first attempt
- `retry_count` = `attempt_count - 1`

### Projection rules
- run-graph and orchestrator projections MUST resolve by `attempt_id`, not only `node_id`
- blocked projections remain historical after resolution; unblocking does not overwrite prior blocked rows
- `ready_since_utc` survives projection refresh only while the node remains continuously ready
- attempts from older generations remain queryable but are labeled stale and are never resumable

### Snapshot refresh rules
- permission/auth/approval/replan resolution creates a new attempt snapshot; old attempt snapshots remain immutable
- safe-point restore does not mutate the originating attempt record in place; it leads to a new attempt record tied back by lineage
