## FileSafe Restore-Before-Rerun Reconciliation Addendum (2026-03-09)

`filesafe_blocked` is not retryable by default.

If a mutation-capable attempt performed local changes before the FileSafe block was finalized, the blocked projection MUST expose:
- `preserved_local_work = true`
- `requires_safe_point_restore = true`

When `requires_safe_point_restore = true`, runtime recovery MUST require `restore_safe_point_then_retry` before any rerun, even if a broader retry matrix would otherwise say rollback is not normally required for `filesafe_blocked`.
