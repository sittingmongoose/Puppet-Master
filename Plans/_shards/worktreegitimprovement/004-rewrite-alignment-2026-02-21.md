# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L35-L41

Source SHA256: `e881a7b6671cfeb35a10fc348a2c27809aa69968b1688c259665697fc70eb1e2`

---

## Rewrite alignment (2026-02-21)

This plan's correctness requirements remain authoritative. As the rewrite lands (see `Plans/rewrite-tie-in-memo.md`):

- Worktrees/branches/sandboxes are part of the **patch/apply/verify/rollback pipeline** (core reliability), not just a Git feature
- Provider working directories (and MCP injection) must respect worktree execution contexts deterministically
- Config references to YAML files should be treated as *current representations*; the rewrite may project settings via redb while retaining import/export
