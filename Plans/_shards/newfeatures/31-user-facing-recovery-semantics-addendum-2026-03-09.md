## User-Facing Recovery Semantics Addendum (2026-03-09)

Any user-facing summary of this feature set must explain:
- scored deterministic scheduling instead of pure lexical dispatch
- event-driven wakeups
- blocked outcomes that preserve local work
- safe points as runtime recovery anchors
- restore points as user-facing history checkpoints, distinct from safe points
- deterministic draft fallback only before graph lock
