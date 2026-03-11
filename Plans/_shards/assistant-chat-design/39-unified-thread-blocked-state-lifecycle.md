## Unified Thread Blocked-State Lifecycle
Canonical thread states:
- `active`
- `attention_required`
- `blocked`
- `completed`
- `failed`

Rules:
- `attention_required` means the active flow can continue inside the same clarification or review loop
- `blocked` means automation cannot continue until a prerequisite changes or a new explicit recovery action occurs
- blocked episodes are persisted as distinct episodes and MUST NOT be collapsed into one mutable thread flag
- thread-surface action buttons are rendered from ordered `allowed_action_ids[]` plus blocked metadata; chat does not invent thread-local recovery semantics

### Precedence
1. active node-blocked episode for the visible runtime context
2. active wizard-blocked episode
3. active `attention_required` clarification
4. historical blocked episodes

### Multi-episode display
- each `blocked_notice` renders as its own system message
- a thread with multiple active blocked episodes shows the highest-severity active badge plus a count indicator
- resolving one blocked episode updates only that episode; others remain active
- `validation_blocked` and `remediation_ceiling_exceeded` are ordinary members of the canonical blocked taxonomy and render through the same blocked-notice contract

### Persistence and restore rule
Thread blocked notices persist enough identity to restore the same blocked surfaces and action set after restart or resume.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md
