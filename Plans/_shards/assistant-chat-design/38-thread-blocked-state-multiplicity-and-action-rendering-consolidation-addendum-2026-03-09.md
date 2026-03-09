## Thread Blocked-State Multiplicity and Action Rendering Consolidation Addendum (2026-03-09)

Canonical thread states:
- `active`
- `attention_required`
- `blocked`
- `completed`
- `failed`

Rules:
- `attention_required` means the active flow can continue inside the same clarification or review loop.
- `blocked` means automation cannot continue until a prerequisite changes or a new explicit recovery action occurs.
- wizard-blocked and node-blocked episodes are distinct persisted episodes and MUST NOT be collapsed into one mutable thread flag.

### Precedence
1. active node-blocked episode for the visible runtime context
2. active wizard-blocked episode
3. active `attention_required` clarification
4. historical blocked episodes

### Multi-episode display
- thread selector shows the highest-severity active badge
- when more than one blocked episode is active, show a count badge
- resolving one blocked episode updates only that episode; others remain active
- action buttons are rendered from canonical `allowed_action_ids[]` plus blocked metadata and MUST NOT invent thread-local recovery semantics
