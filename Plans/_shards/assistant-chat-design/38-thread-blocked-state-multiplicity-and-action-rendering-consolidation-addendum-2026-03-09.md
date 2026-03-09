## Thread Blocked-State Multiplicity and Action Rendering Consolidation Addendum (2026-03-09)

### Blocked notice identity
A blocked notice is scoped to one blocking episode:
- key: `thread_id`, `node_id?`, `attempt_id?`, `blocked_sequence`

Multiple concurrent blocked episodes in one thread MUST NOT be collapsed into one mutable record.

### Thread banner and history
- the thread banner shows the highest-priority currently active blocked episode for the visible context
- prior blocked notices remain in history as separate system messages
- switching between blocked episodes is keyed by node/attempt identity, not only thread identity

### Persisted thread state
A blocked thread MUST persist:
- latest active blocked episode refs
- all active `allowed_action_ids[]`
- `preserved_local_work`
- current attempt/node reference when available
- `blocked_reason_code`

### Action rendering rule
Chat buttons are rendered from canonical `allowed_action_ids[]` plus blocked metadata. Chat MUST NOT invent thread-local recovery actions that bypass scheduler classification, safe-point requirements, or prerequisite checks.

