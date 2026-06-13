# Shard 026: FileSafe Runtime Blocked and Restore Override Consolidation Addendum (2026-03-09)

Source: `Plans/FileSafe.md`

Source lines: L2669-L2710

Source SHA256: `6642343f4a818301c0a88c8b6897e9871d7ea0468b00dc57603df4bbb4a4e76d`

---

## FileSafe Runtime Blocked and Restore Override Consolidation Addendum (2026-03-09)


This section defines fileSafe Action Mapping and Persistence.

### Shared runtime fields
FileSafe blocked payloads MUST use the canonical blocked payload:
- `blocked_reason_code = filesafe_blocked`
- `allowed_action_ids[]`
- `preserved_local_work`
- `requires_safe_point_restore?`
- `detail_ref?`

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### Shared vs local actions
Shared runtime action IDs remain the canonical recovery families. Labels such as `Approve and add to allowlist` and `Edit and retry` are FileSafe-local affordances layered on top of shared actions and metadata. They are not new shared runtime action IDs unless the global action enum explicitly adopts them.

Required rules:
- runtime-facing FileSafe blocks use canonical `blocked_reason_code` plus ordered `allowed_action_ids[]`
- FileSafe blocked-action recovery maps to `approve_once`, `filesafe_add_rule`, and `open_filesafe_settings` when the current surface can safely offer them; user-facing copy may say approve once/add rule/open FileSafe settings, but the runtime payload keeps the canonical action IDs.
- `recovery_options[]` and `allowed_actions[]` are not canonical shared runtime fields
- child runs blocked by FileSafe remain child runs with canonical lineage and status history
- rerun and restore behavior must preserve canonical child/run/worktree identities

### Restore override
`filesafe_blocked` is not retryable by default.

If a mutation-capable attempt performed local changes before the FileSafe block was finalized, the blocked projection MUST expose:
- `preserved_local_work = true`
- `requires_safe_point_restore = true`

When `requires_safe_point_restore = true`, the only legal rerun path is `restore_safe_point_then_retry`.

### Persistence
A FileSafe block is a persistent blocked runtime episode until resolved or superseded.

Context-shaping and handoff rule:
- FileSafe does not define alternate child continuity or alternate memory behavior.
- any rerun or restore after FileSafe denial uses canonical handoff reconstruction.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md
