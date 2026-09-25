# Shard 016: Plugin Block Runtime Taxonomy Consolidation Addendum (2026-03-09)

Source: `Plans/Plugins_System.md`

Source lines: L609-L616

Source SHA256: `1db4388a3b37844d0c3fc3384fe23673927da818a28587fc74c2b725aa6bafa1`

---

## Plugin Block Runtime Taxonomy Consolidation Addendum (2026-03-09)

Plugin-driven blocking that affects execution MUST map into the canonical runtime blocked model.

### Required rules
- `plugin.hook.blocked` that stops execution maps to `blocked_reason_code = plugin_hook_blocked`
- runtime-facing plugin-blocked payloads MUST expose canonical `allowed_action_ids[]`, prerequisite metadata, and `preserved_local_work` when relevant
- plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy
