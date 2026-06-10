# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L35-L42

Source SHA256: `331b85403ae824bae9bb418141c74b3c4859d018a7f2cb4a84415a5cd2077400`

---

## Rewrite alignment (2026-02-21)

This plan's correctness requirements remain authoritative. As the rewrite lands (see `Plans/rewrite-tie-in-memo.md`):

- Worktrees/branches/sandboxes are part of the **patch/apply/verify/rollback pipeline** (core reliability), not just a Git feature
- Provider working directories (and MCP injection) must respect worktree execution contexts deterministically
- Config references to YAML files should be treated as *current representations*; the rewrite may project settings via redb while retaining import/export

