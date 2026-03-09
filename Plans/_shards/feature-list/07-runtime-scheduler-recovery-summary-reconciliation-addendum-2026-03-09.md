## Runtime Scheduler / Recovery Summary Reconciliation Addendum (2026-03-09)

Summary bullets for executor/runtime behavior MUST say:
- deterministic scored ready-set scheduler rather than pure lexical dispatch
- event-driven queue-analysis passes keyed by canonical pass identity
- blocked outcomes with explicit recovery actions rather than generic failures
- safe-point-backed recovery distinct from user-facing restore points
- pre-lock-only draft decomposition fallback and post-lock graph-integrity stop behavior
