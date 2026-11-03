# Shard 016: Plugin Block Runtime Taxonomy Consolidation Addendum (2026-03-09)

Source: `Plans/Plugins_System.md`

Source lines: L611-L618

Source SHA256: `d9a210e3a709ee17b5fd624480bcbe73969fee68d37c1c90113b20217cf23809`

---

## Plugin Block Runtime Taxonomy Consolidation Addendum (2026-03-09)

Plugin-driven blocking that affects execution MUST map into the canonical runtime blocked model.

### Required rules
- `plugin.hook.blocked` that stops execution maps to `blocked_reason_code = plugin_hook_blocked`
- runtime-facing plugin-blocked payloads MUST expose canonical `allowed_action_ids[]`, prerequisite metadata, and `preserved_local_work` when relevant
- plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy
