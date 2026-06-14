# Shard 019: Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L717-L726

Source SHA256: `e3020a8d154a4d6e6068ddd763dd6bf1b5cace42554a308b207f035eeb4e776c`

---

## Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)


Worktree-native isolation remains canonical, but runtime recovery must integrate with it.

### Required rules
- a safe point may reference worktree-specific baseline state
- restore-before-rerun operations must specify which worktree/baseline they target
- merge/conflict or dirty-state detection may block resume and must surface an explicit reason rather than silently reusing a changed worktree
- worktree isolation does not replace runtime blocked classification; it complements it
