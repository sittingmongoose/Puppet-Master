## Scheduler Analysis and Remediation Visibility Addendum (2026-03-08)

### 1. New node/runtime fields in graph projections

The Run Graph UI must expose the runtime fields introduced by the scheduler packet.

Required new visible or drill-down fields:
- `attempt_count`
- `retry_count`
- `failure_class`
- `blocked_reason_code`
- `wake_reason`
- `scheduler_lane`
- `scheduler_score_breakdown`
- `ready_since_utc`
- `selected_at_utc`
- `backoff_until_utc`
- `safe_point_id`
- `remediation_root_id`
- `remediation_parent_attempt_id`
- `replan_generation`

### 2. Queue-analysis panel / section

Add a queue-analysis section for the selected run and, when applicable, the selected node.

Required content:
- last scheduler wake reason
- available slots at the last analysis
- selected nodes for that analysis
- selected node score breakdown
- ready-but-unselected candidates with `non_selected_reason`
- blocked summary counts by `blocked_reason_code`
- active backoff summary

### 3. Remediation lineage visibility

For a node that entered remediation:
- show remediation root ID
- show remediation generation count
- show origin finding IDs / linked finding summary
- show whether the current attempt supersedes a prior attempt
- show final remediation outcome when available

### 4. Safe-point visibility

The node detail panel must show `safe_point_id` for mutation-capable attempts.

Required behavior:
- safe-point identity is visible for audit/debugging
- UI copy makes clear that runtime safe points are not the same as user-facing restore points

### 5. Blocked and backoff presentation

Distinguish these states visually and semantically:
- blocked waiting for user / policy / auth / replan
- retry backoff pending
- failed terminal
- remediation in progress

Required rule:
- blocked outcomes must not be shown as generic failures when the runtime intentionally did not execute the action

### 6. Critical path clarification

Critical-path view may remain as a visualization preset, but the view must not imply that the scheduler currently selects by critical-path weighting.

Recommended copy:
- `Critical Path` is a visual bottleneck aid, not an MVP scheduler score input

### 7. Acceptance criteria

- Selected-node details explain why the node ran.
- Ready-but-unselected nodes can be inspected.
- Backoff and blocked states are distinct.
- Remediation lineage is traceable end-to-end.
- Safe-point IDs are visible but clearly separate from restore-point UI.
