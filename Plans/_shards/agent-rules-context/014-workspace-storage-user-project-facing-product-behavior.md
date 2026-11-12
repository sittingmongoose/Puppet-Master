# Shard 014: Workspace & Storage (User-Project Facing Product Behavior)

Source: `Plans/agent-rules-context.md`

Source lines: L237-L246

Source SHA256: `212cf76ee5e4a1c283b0d769c6a03a740e09169e4f0b29c03edfbf8d7c095c02`

---

## Workspace & Storage (User-Project Facing Product Behavior)
Puppet Master should store these artifacts in a sidecar workspace by default:
- prevents polluting user repos
- allows consistent lifecycle management and truncation rules
Project sidecars retain their actual Project/run/node home. App sidecars live in the owning Server's app thread/run area, named by real Computer/thread/run identities without a Project placeholder; only admitted user-visible exports use the chat folder. Conversion reissues future sidecar context through its owner and never forwards unrelated journals or another run's private memory.
- `AGENTS.md` (managed or user-owned depending on mode)
- `parent_summary.md`
- `attempt_journal.md`
- attempt/run artifacts
---
