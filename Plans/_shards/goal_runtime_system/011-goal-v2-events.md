# Shard 011: Goal V2 events

Source: `Plans/Goal_Runtime_System.md`

Source lines: L271-L281

Source SHA256: `9f8c49299453abd893e62f18c22ddbed101869eeeeda878eb1ede2b8ec87d984`

---

## Goal V2 events

The required semantic event names are `goal.created`, `goal.updated`, `goal.paused`, `goal.resumed`, `goal.blocked`, `goal.completed`, `goal.cancelled`, and `goal.continuation_evaluated`. Each exact name requires its own central EventRecord registration and payload schema before emission. `goal.created` is admitted only through CV-341/SP-294 and `goal.updated` only through CV-342/SP-299; their current source/receipt/result obligations and native availability still apply. Other names retain their own individual admission state; no sibling registration grants emission.

Envelopes carry Project, thread, and Goal identity, revision, `currentness_hash`, actor, correlation and causation, idempotency key, and redacted source refs. `goal.updated` carries `change_source` and, for the agent path, `approval_id`. `goal.continuation_evaluated` carries `result`, `user_stop_epoch`, and completion-evidence refs by reference rather than by value.

No event may carry `objective_text` in full where a hash and a revision reference suffice for audit, and no event may carry secrets, tokens, provider credentials, or raw file bodies.

There is deliberately no `goal.phase_*`, `goal.tranche_*`, `goal.child_*`, or `goal.budget_*` event. Registering one would reintroduce retired structure through the event catalog.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/storage-plan.md
