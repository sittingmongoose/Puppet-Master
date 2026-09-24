# Shard 014: Hook/Block Integration Addendum (2026-03-08)

Source: `Plans/Plugins_System.md`

Source lines: L589-L600

Source SHA256: `5221647058ce770c078337c1e9c8b9c966059498610d062fa1f0988b6437c3c5`

---

## Hook/Block Integration Addendum (2026-03-08)

Plugin hooks must reconcile with the runtime scheduler packet's blocked/failure model.

Required behavior:
- `plugin.hook.blocked` outcomes must map into explicit blocked-state handling rather than disappearing as generic plugin warnings
- hook-driven blocking must not silently bypass scheduler observability, retry classification, or recovery-option rendering
- if a plugin modifies prompt or tool behavior in a way that causes remediation/retry, the canonical runtime lineage still belongs to the shared scheduler/remediation contract, not to plugin-private state

Acceptance criteria:
- plugin-driven blocks are visible as first-class blocked outcomes when they affect execution
- plugin hooks do not become a side-channel that bypasses queue analysis or remediation observability
