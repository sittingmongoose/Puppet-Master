# Shard 014: Workspace & Storage (User-Project Facing Product Behavior)

Source: `Plans/agent-rules-context.md`

Source lines: L237-L246

Source SHA256: `7815be0dff378aa826fab1ec2295a7c1e1f87c5580142922ed5b3c64a58698de`

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
