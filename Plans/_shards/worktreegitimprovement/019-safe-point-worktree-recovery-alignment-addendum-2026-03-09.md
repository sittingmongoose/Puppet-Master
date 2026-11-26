# Shard 019: Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L789-L798

Source SHA256: `3312b3df85bb8bcda384c2903870fba7081fc8467e0e7bc9b1e8b00e37349ead`

---

## Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)


Worktree-native isolation remains canonical, but runtime recovery must integrate with it.

### Required rules
- a safe point may reference worktree-specific baseline state
- restore-before-rerun operations must specify which worktree/baseline they target
- merge/conflict or dirty-state detection may block resume and must surface an explicit reason rather than silently reusing a changed worktree
- worktree isolation does not replace runtime blocked classification; it complements it
