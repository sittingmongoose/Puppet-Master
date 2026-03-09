## Blocked / Recovery GUI Reconciliation

### Dashboard Action Required
Render Action Required whenever one or more of the following exists:
- `wizard_blocked`
- `wizard_attention_required`
- active runtime blocked episode
- active approval gate

Priority order:
`wizard_blocked > active runtime blocked > approval > wizard_attention_required > interrupted > rate_limit > warnings`

### Thread and run status taxonomy
Visible statuses MUST distinguish:
- `idle`
- `running`
- `queued`
- `attention_required`
- `blocked`
- `retrying_backoff`
- `remediation`
- `failed`

Canonical visual distinction:
- `attention_required` uses amber styling with “Needs input” copy
- `blocked` uses red styling with “Blocked” copy
- `waiting_approval` uses blue approval styling

### Scope rule
Node-level blocked state does not imply run-global pause. Unrelated runnable work may continue.

### FileSafe rendering
A FileSafe block is a persistent blocked episode until the underlying runtime block resolves. It MUST NOT auto-dismiss while still active.

### Degraded draft warning
Decomposition degradation is a pre-lock planning state only. GUI copy MUST NOT imply silent degraded canonical execution after graph lock.

### All-nodes-blocked gating
Until owner runtime contracts define dedicated all-blocked events, GUI surfaces MAY derive all-blocked banners from current projections but MUST NOT treat undeclared runtime events as canonical.
