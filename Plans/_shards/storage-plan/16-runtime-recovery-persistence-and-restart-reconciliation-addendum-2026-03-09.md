## Runtime Recovery Persistence and Restart Reconciliation Addendum (2026-03-09)

### Canonical runtime records
1. `attempt_record`
   - key: `run_id`, `node_id`, `attempt_id`
2. `scheduler_pass_record`
   - key: `run_id`, `scheduler_pass_id`
3. `blocked_projection`
   - key: `run_id`, `node_id`, `blocked_sequence`
   - `attempt_id?` links the active or latest relevant attempt
4. `safe_point_record`
   - key: `safe_point_id`
5. `remediation_lineage_record`
   - key: `remediation_root_id`

### Counter families
Store all of the following explicitly:
- `attempt_count`
- `automatic_retry_count`
- `prerequisite_resume_count`
- `manual_resume_count`
- `remediation_retry_count`

`attempt_count` is total attempts ever started for the node in the run. The other counters are independent policy counters and MUST NOT be inferred by subtracting from `attempt_count`.

### `blocked_sequence` semantics
`blocked_sequence` is a per-node monotonic counter incremented each time the node enters a new blocked episode after not being blocked.

### Required fields
`attempt_record` MUST include:
- attempt state enum
- `scheduler_pass_id`
- requested/effective model snapshot identifiers
- requested/effective permission snapshot identifiers
- `replan_generation`
- `mutation_capable`
- `safe_point_id?`
- remediation lineage identifiers when present
- stale / historical marker

`scheduler_pass_record` MUST include:
- `scheduler_pass_id`
- `wake_reason`
- capacity summary
- full ready-node score breakdowns
- selected node list
- non-selected node list with reasons

`blocked_projection` MUST include:
- `blocked_reason_code`
- `allowed_action_ids[]`
- `preserved_local_work`
- prerequisite metadata
- `resolved_by_ref?`
- `failure_class?`

`safe_point_record` MUST include:
- `source_attempt_id`
- worktree/workspace refs
- baseline refs
- creation reason
- latest restore result
- `resulting_attempt_id?`

### Persistence ordering
For any mutation-capable attempt:
1. capture baseline
2. persist `safe_point_record`
3. persist `attempt_record` in `starting` state
4. persist `attempt.started`
5. allow execution to begin

A crash between these steps MUST be recoverable from persisted state without guessing.

### Startup reconciliation
On restart the runtime MUST:
- rehydrate pending backoff timers
- classify any `starting` or `running` attempt with no terminal event as `interrupted_by_restart`
- preserve blocked projections as historical episodes rather than overwriting them
- emit a scheduler wake with `wake_reason = startup_recovered`
- require a new attempt for any resumed work; prior attempts remain immutable history

### Restart safety rules
- safe-point metadata MUST survive until the originating lineage reaches terminal resolution
- remediation lineage metadata MUST survive until the parent lineage reaches terminal resolution
- queue-analysis history is append-only and keyed by `scheduler_pass_id`
- attempts from older generations remain queryable but are labeled stale and are never resumable
