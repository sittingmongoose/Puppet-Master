## FileSafe Runtime Blocked and Restore Override Consolidation Addendum (2026-03-09)

FileSafe denials that stop execution are blocked outcomes, not generic failures.

### Canonical FileSafe runtime fields
Runtime-facing FileSafe blocked state MUST expose:
- `blocked_reason_code = filesafe_blocked`
- `allowed_action_ids[]`
- `preserved_local_work`
- `requires_safe_point_restore`
- guard/pattern metadata needed to explain the denial

### Restore-before-rerun override
If a mutation-capable attempt performed local changes before the FileSafe block was finalized:
- `preserved_local_work = true`
- `requires_safe_point_restore = true`

When `requires_safe_point_restore = true`, rerun MUST go through `restore_safe_point_then_retry` even if the broader matrix would not usually require rollback for `filesafe_blocked`.

### Action-family rule
Domain-specific UI labels such as approve-once or allowlist remain presentation concerns. Shared runtime surfaces still use canonical `allowed_action_ids[]`.

### Field name correction

All references to `recovery_options[]` in this document are replaced by the canonical field name `allowed_action_ids[]`. The deprecated name `recovery_options[]` MUST NOT be used in new content.

### FileSafe action ID mapping

| FileSafe UI Action | `allowed_action_ids[]` value | Effect |
|-------------------|------------------------------|--------|  
| Approve once | `approve` | Allow this specific file operation for this attempt only. |
| Approve & add to allowlist | `approve_and_allowlist` | Allow this file operation and add the pattern to the project allowlist. |
| Cancel | `decline` | Deny the file operation; node enters `blocked` state with `filesafe_blocked`. |
| Edit & retry | `edit_and_retry` | Open the file for manual editing, then re-attempt the operation. |

All FileSafe recovery actions MUST use these canonical IDs in the `allowed_action_ids[]` field of the blocked notice payload.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md
