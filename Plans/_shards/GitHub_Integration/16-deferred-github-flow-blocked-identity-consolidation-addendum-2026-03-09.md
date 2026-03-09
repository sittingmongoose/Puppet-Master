## Deferred GitHub Flow Blocked Identity Consolidation Addendum (2026-03-09)

Deferred GitHub launch and resume flows MUST persist a binding record containing:
- `wizard_id?`
- `thread_id?`
- `run_id?`
- `node_id?`
- `attempt_id?`
- deferred payload ref
- `blocked_sequence?`
- `replan_generation?`
- clearing status

Rules:
- the binding is created before handing control to deferred GitHub auth/import/launch flows
- if the deferred flow blocks, the runtime blocked episode references this binding
- the binding is cleared only when the deferred flow completes successfully, the owning blocked episode is abandoned, or the wizard/run context is cancelled or superseded
- approval or auth resolution wakes the scheduler/event consumer immediately; it is not a polling loop
