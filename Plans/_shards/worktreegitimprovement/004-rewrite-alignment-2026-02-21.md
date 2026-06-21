# Shard 004: Rewrite alignment (2026-02-21)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L35-L41

Source SHA256: `a7d2273c08de3321166347b4a05d314b40aca1a6c5fc24957594e1c2e70d47f9`

---

## Rewrite alignment (2026-02-21)

This plan's correctness requirements remain authoritative. As the rewrite lands (see `Plans/rewrite-tie-in-memo.md`):

- Worktrees/branches/sandboxes are part of the **patch/apply/verify/rollback pipeline** (core reliability), not just a Git feature
- Provider working directories (and MCP injection) must respect worktree execution contexts deterministically
- Config references to YAML files should be treated as *current representations*; the rewrite may project settings via redb while retaining import/export
