# Shard 019: Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L774-L783

Source SHA256: `e881a7b6671cfeb35a10fc348a2c27809aa69968b1688c259665697fc70eb1e2`

---

## Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)


Worktree-native isolation remains canonical, but runtime recovery must integrate with it.

### Required rules
- a safe point may reference worktree-specific baseline state
- restore-before-rerun operations must specify which worktree/baseline they target
- merge/conflict or dirty-state detection may block resume and must surface an explicit reason rather than silently reusing a changed worktree
- worktree isolation does not replace runtime blocked classification; it complements it
