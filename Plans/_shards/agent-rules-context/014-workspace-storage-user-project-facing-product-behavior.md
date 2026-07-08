# Shard 014: Workspace & Storage (User-Project Facing Product Behavior)

Source: `Plans/agent-rules-context.md`

Source lines: L237-L246

Source SHA256: `2f36d282c3795dd66d65f8fa473693d2bce1447500c2fe32d789b3faba2ab603`

---

## Workspace & Storage (User-Project Facing Product Behavior)
Puppet Master should store these artifacts in a sidecar workspace by default:
- prevents polluting user repos
- allows consistent lifecycle management and truncation rules
Recommended: `.puppet-master/workspace/<project>/<run>/<node>/` containing:
- `AGENTS.md` (managed or user-owned depending on mode)
- `parent_summary.md`
- `attempt_journal.md`
- attempt/run artifacts
---
