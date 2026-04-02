## Blocked Thread Message and Persistence Reconciliation Addendum (2026-03-09)

> **Superseded** — see [Unified Thread Blocked-State Lifecycle](#unified-thread-blocked-state-lifecycle).

Add a dedicated blocked-state system message contract.

### `blocked_notice` message
Required fields:
- `type = blocked_notice`
- `thread_id`
- `node_id?`
- `attempt_id?`
- `blocked_reason_code`
- `explanation`
- `allowed_action_ids[]`
- `preserved_local_work`
- `detail_ref?`
- `resume_url?`

### Persistence rules
A blocked thread MUST persist:
- latest `blocked_reason_code`
- latest blocked message id
- current attempt/node reference when available
- `allowed_action_ids[]`
- preserved-local-work flag

Resume/retry controls in chat MUST map to canonical runtime actions rather than thread-local shortcuts.
