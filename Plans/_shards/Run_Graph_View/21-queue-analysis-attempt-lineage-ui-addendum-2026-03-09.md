## Queue Analysis / Attempt Lineage UI Addendum (2026-03-09)

The run graph is the canonical visual surface for scheduler and recovery details.

### Required node data model fields
Add the following to the graph node / detail payload contract:
- `attempt_id` for current or selected attempt
- `scheduler_lane`
- score tuple breakdown terms
- `non_selected_reason`
- `failure_class`
- `blocked_reason_code`
- `allowed_action_ids[]`
- `safe_point_id`
- remediation lineage identifiers
- `replan_generation`
- preserved-local-work indicator

### Queue analysis surface
The graph view MUST include a queue-analysis affordance showing:
- last wake reason
- selected nodes for the latest pass
- ready but unselected nodes and their reasons
- current capacity / reservation state

### CTA rules
The graph MUST NOT show actions that are invalid for the current classification.
- auth-blocked: show reconnect / resume after auth
- external side-effect blocked: show approve/decline and reevaluate
- FileSafe-blocked: show inspect denial / rerun after policy change
- transient failure: show retry/backoff state
- replan-required: show replan action rather than retry

### Eventing rule
Graph state must update from runtime events and stored projections, not timer polling.
