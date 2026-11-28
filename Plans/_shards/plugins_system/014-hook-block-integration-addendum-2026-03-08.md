# Shard 014: Hook/Block Integration Addendum (2026-03-08)

Source: `Plans/Plugins_System.md`

Source lines: L591-L602

Source SHA256: `dc83a2989c3fd9441ed0491ee22634cf75f13fa15d97da6a2afd55d295673799`

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
