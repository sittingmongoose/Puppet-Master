## FileSafe Action Mapping and Persistence
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

### Dangerous-command blocking GUI reconciliation

Dangerous-command blocking is a first-class blocked feature, not terminal-only messaging.

Rules:
- blocked destructive actions render in the thread, runtime status surfaces, and action-needed routing
- terminal/output rendering may summarize the block, but it is not the only user-visible surface
- if rerun requires restore-before-rerun, that requirement is visible before the rerun action executes
- restore-and-branch from a FileSafe-blocked state follows the same branch lineage and preserved-work rules as other restore-driven branching flows

### Shared runtime fields
FileSafe blocked payloads MUST use the canonical blocked payload:
- `blocked_reason_code = filesafe_blocked`
- `allowed_action_ids[]`
- `preserved_local_work`
- `requires_safe_point_restore?`
- `detail_ref?`

### Shared vs local actions
Shared runtime action IDs remain the canonical recovery families. Labels such as `Approve and add to allowlist` and `Edit and retry` are FileSafe-local affordances layered on top of shared actions and metadata. They are not new shared runtime action IDs unless the global action enum explicitly adopts them.

### Restore override
When `requires_safe_point_restore = true`, the only legal rerun path is `restore_safe_point_then_retry`.

### Persistence
A FileSafe block is a persistent blocked runtime episode until resolved or superseded.
