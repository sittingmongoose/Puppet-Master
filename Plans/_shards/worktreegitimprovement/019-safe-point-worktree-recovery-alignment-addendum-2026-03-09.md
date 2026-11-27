# Shard 019: Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L790-L799

Source SHA256: `c2ddab928a242660ba6faa69d6e17ad63fd87a678f5114d0f0d903019c2a5798`

---

## Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)


Worktree-native isolation remains canonical, but runtime recovery must integrate with it.

### Required rules
- a safe point may reference worktree-specific baseline state
- restore-before-rerun operations must specify which worktree/baseline they target
- merge/conflict or dirty-state detection may block resume and must surface an explicit reason rather than silently reusing a changed worktree
- worktree isolation does not replace runtime blocked classification; it complements it
