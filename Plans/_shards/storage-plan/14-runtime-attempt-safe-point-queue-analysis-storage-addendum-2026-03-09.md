## Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)

Storage and projections MUST persist the scheduler and recovery model without SQLite.

### Required logical records
1. `attempt_record`
   - keys: `run_id`, `node_id`, `attempt_id`
   - fields: lifecycle state, retry count, `failure_class`, `blocked_reason_code`, timestamps, requested/effective model snapshot IDs, permission snapshot ID, `safe_point_id`, `remediation_*` lineage fields, `replan_generation`
2. `safe_point_record`
   - keys: `safe_point_id`
   - fields: originating attempt, workspace/worktree refs, captured baseline refs, creation reason, restore result, generation
3. `scheduler_pass_record`
   - keys: `run_id`, monotonic pass index
   - fields: `wake_reason`, capacity summary, ready nodes with score terms, selected nodes, non-selected nodes with reason
4. `blocked_projection`
   - keyed by run/thread/node and, when available, `attempt_id`
   - exposes `blocked_reason_code`, `allowed_actions[]`, preserved-local-work flag, and recovery prerequisites
5. `remediation_lineage_record`
   - keys: `remediation_root_id`
   - fields: parent attempt, child attempts, findings, generation, terminal resolution

### Projection rules
- run-graph and orchestrator projections MUST resolve by `attempt_id` rather than only by `node_id`
- the latest blocked state must remain inspectable after app restart
- `ready_since_utc` must survive projection refresh while the node remains continuously ready
- stale attempts from an older `replan_generation` must remain queryable for history but may not be resumed as active work

### Persistence safety rules
- safe-point metadata must persist before mutation-capable attempt execution begins
- local-work-preserved blocked outcomes must be represented explicitly, not inferred from missing failure rows
- queue-analysis records are append-only observability data; later projections may summarize them, but the canonical pass history must remain reconstructable
