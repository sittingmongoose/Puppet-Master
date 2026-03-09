## Attempt-Centric Runtime Recovery UI Reconciliation Addendum (2026-03-09)

The run graph is the canonical node-level surface for scheduler and recovery diagnostics.

### Required node/attempt payload fields
- `attempt_id`
- `scheduler_pass_id?`
- score tuple breakdown terms
- `non_selected_reason?`
- `failure_class?`
- `blocked_reason_code?`
- `allowed_action_ids[]`
- `preserved_local_work`
- `safe_point_id?`
- remediation lineage identifiers
- `replan_generation`
- stale/historical marker

### Required detail sections
1. current execution status and generation
2. current attempt identity plus most recent stale attempt when present
3. scheduler score breakdown and latest queue-analysis explanation
4. blocked or failed classification with exact canonical reason codes
5. currently valid recovery actions only
6. safe-point creation/restore history and latest restore outcome
7. remediation lineage and child attempts
8. evidence/artifacts for the selected attempt

### Default selection rules
- default to the latest active attempt
- otherwise default to the latest blocked attempt
- otherwise default to the latest historical attempt
- stale attempts MUST be visibly marked as historical and non-resumable

### State rendering rules
Render `blocked`, `retrying/backoff`, `remediation in progress`, `terminal failure`, and `stale historical attempt` as distinct visual states. Blocked work MUST NOT reuse generic failure styling.

### Queue-analysis affordance
The selected node detail MUST expose a queue-analysis link bound to the latest relevant `scheduler_pass_id`.

### Confirmation rules
`Start fresh attempt`, `Skip`, and `Abort` require confirmation when local work would be discarded, the blocked state is resumable, or the action is irreversible at run scope.

