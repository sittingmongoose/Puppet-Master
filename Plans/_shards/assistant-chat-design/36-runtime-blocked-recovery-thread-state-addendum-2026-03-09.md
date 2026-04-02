## Runtime Blocked / Recovery Thread-State Addendum (2026-03-09)

> **Superseded** — see [Unified Thread Blocked-State Lifecycle](#unified-thread-blocked-state-lifecycle).

Chat thread state must align with runtime execution state.

### Canonical thread states
- `active`
- `attention_required`
- `blocked`
- `completed`
- `failed`

`attention_required` means clarification or review can proceed inside the current flow. `blocked` means execution cannot continue automatically until a prerequisite changes.

### Escalation rule
Repeated unresolved clarification or a user action that the current mode cannot complete may escalate from `attention_required` to `blocked`. The system MUST record why that escalation happened.

### Thread banner contract
When blocked, the chat thread MUST show:
- the exact `blocked_reason_code`
- a human-readable explanation
- the current attempt or node reference when available
- allowed recovery actions only
- whether local work was preserved

### Resume semantics
Resume/retry buttons in chat MUST map to canonical runtime actions. Chat MUST NOT invent thread-local resume paths that bypass scheduler classification, safe-point restore requirements, or external approval checks.
