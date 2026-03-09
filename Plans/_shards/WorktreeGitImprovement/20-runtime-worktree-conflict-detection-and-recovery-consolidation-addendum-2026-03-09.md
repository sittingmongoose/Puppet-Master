## Runtime Worktree Conflict Detection and Recovery Consolidation Addendum (2026-03-09)

Worktree-native isolation remains canonical, but runtime recovery must classify worktree problems deterministically.

### Detection inputs
Canonical worktree conflict / dirty-baseline detection MUST use:
- declared touch sets when available
- active worktree assignment / occupancy metadata
- git status / baseline drift checks for the targeted worktree
- merge/conflict markers or overlapping mutable-path evidence when available

### Canonical outcomes
- overlapping mutable state or merge/conflict risk that forbids dispatch -> `blocked_reason_code = worktree_conflict`
- dirty or drifted baseline that forbids safe restore/reuse -> `blocked_reason_code = dirty_worktree`
- lack of free slots only -> `non_selected_reason = capacity_deferred`

### Recovery rule
Any restore-before-rerun operation MUST identify the exact worktree and baseline target and MUST NOT silently reuse a changed worktree.
