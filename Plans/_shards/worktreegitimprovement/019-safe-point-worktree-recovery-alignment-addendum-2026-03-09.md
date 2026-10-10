# Shard 019: Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L772-L781

Source SHA256: `666fbd8284d458baa27327e4936c48fb4d045935fb4dd14399a1c76d6259d857`

---

## Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)


Worktree-native isolation remains canonical, but runtime recovery must integrate with it.

### Required rules
- a safe point may reference worktree-specific baseline state
- restore-before-rerun operations must specify which worktree/baseline they target
- merge/conflict or dirty-state detection may block resume and must surface an explicit reason rather than silently reusing a changed worktree
- worktree isolation does not replace runtime blocked classification; it complements it
