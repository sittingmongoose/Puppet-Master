## Runtime Scheduler Recovery Summary Consolidation Addendum (2026-03-09)

Summary bullets for this feature family MUST say:
- deterministic scored ready-set scheduling instead of pure lexical dispatch
- queue-analysis passes keyed by `scheduler_pass_id`
- immutable attempt lineage with new `attempt_id` per dispatch
- blocked outcomes with explicit recovery actions instead of generic failures
- safe-point-backed recovery distinct from user-facing restore points
- remediation child execution with explicit lineage
- pre-lock-only draft decomposition fallback and post-lock graph-integrity stop behavior

Remove or revise older summary phrasing that implies lexical dispatch, node-centric retry commands, or `attention_required` as the only paused clarification state.
