## Runtime Attempt / Safe Point / Queue Analysis Reconciliation Addendum (2026-03-09)

Storage and projections MUST persist the scheduler and recovery model without ambiguity.

### Counter semantics
- `attempt_count` = total dispatch attempts for the node in the run, including the first attempt
- `retry_count` = `attempt_count - 1`

### Projection rules (reconciled)
- run-graph and orchestrator projections MUST resolve by `attempt_id`, not only `node_id`
- blocked projections remain historical after resolution; unblocking does not overwrite prior blocked rows
- `ready_since_utc` survives projection refresh only while the node remains continuously ready
- attempts from older generations remain queryable but are labeled stale and are never resumable

### Snapshot refresh rules
- permission/auth/approval/replan resolution creates a new attempt snapshot; old attempt snapshots remain immutable
- safe-point restore does not mutate the originating attempt record in place; it leads to a new attempt record tied back by lineage
