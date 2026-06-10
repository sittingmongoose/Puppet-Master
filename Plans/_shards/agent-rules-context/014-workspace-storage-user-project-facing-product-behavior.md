# Shard 014: Workspace & Storage (User-Project Facing Product Behavior)

Source: `Plans/agent-rules-context.md`

Source lines: L237-L246

Source SHA256: `95c2cfd80f6f84d3673a2ec3a50cd30f475a8c6a763595cac75b9699f525db08`

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
