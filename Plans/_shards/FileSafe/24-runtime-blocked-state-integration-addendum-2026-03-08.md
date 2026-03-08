## Runtime Blocked-State Integration Addendum (2026-03-08)

### 1. FileSafe outcomes are first-class blocked outcomes

FileSafe decisions must integrate with the shared runtime blocked taxonomy.

Required rule:
- a FileSafe block becomes `blocked_reason_code = filesafe_blocked`
- it is not an execution failure and is not auto-retryable

### 2. Recovery options

When FileSafe allows user recovery, runtime/UI surfaces must expose exact options.

Allowed examples:
- `Approve once`
- `Approve & add to list`
- `Cancel`

If recovery is not allowed for the specific guard, the runtime must say so explicitly.

### 3. Event and analytics requirements

FileSafe event payloads must remain rich enough for both analytics and runtime recovery surfaces.

Minimum fields:
- `guard_type`
- `pattern_id` or pattern name
- `timestamp`
- `command_or_path_summary`
- `recovery_allowed`
- `recovery_options[]`

### 4. Safe-point interaction

A FileSafe block that occurs before execution does not consume a mutation safe point and does not require rollback.

### 5. Acceptance criteria

- FileSafe blocks appear as blocked outcomes with explicit reason codes.
- FileSafe blocks are not auto-retried.
- Recovery-capable FileSafe blocks present exact allowed actions.
- FileSafe analytics data remains usable after runtime integration.
