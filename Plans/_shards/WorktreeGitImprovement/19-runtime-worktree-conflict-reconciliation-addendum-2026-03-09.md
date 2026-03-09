## Runtime Worktree Conflict Reconciliation Addendum (2026-03-09)

Worktree-native isolation remains canonical, but runtime recovery must classify worktree problems explicitly.

### Required runtime classifications
- merge/conflict risk or overlapping mutable state that forbids dispatch -> `blocked_reason_code = worktree_conflict`
- dirty or drifted baseline that forbids safe restore/reuse -> `blocked_reason_code = dirty_worktree`
- lack of free slots alone -> `non_selected_reason = capacity_deferred`

### Recovery rule
Any restore-before-rerun operation MUST identify the exact worktree/baseline target and MUST NOT silently reuse a changed worktree.
