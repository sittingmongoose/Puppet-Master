## FileSafe Action Mapping and Persistence

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
