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
