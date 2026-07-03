# Shard 016: Plugin Block Runtime Taxonomy Consolidation Addendum (2026-03-09)

Source: `Plans/Plugins_System.md`

Source lines: L603-L610

Source SHA256: `cca40fa6093aa76b4d142554a8c9114a1f1a4d3b4acc57b1462f0e9be8c835c2`

---

## Plugin Block Runtime Taxonomy Consolidation Addendum (2026-03-09)

Plugin-driven blocking that affects execution MUST map into the canonical runtime blocked model.

### Required rules
- `plugin.hook.blocked` that stops execution maps to `blocked_reason_code = plugin_hook_blocked`
- runtime-facing plugin-blocked payloads MUST expose canonical `allowed_action_ids[]`, prerequisite metadata, and `preserved_local_work` when relevant
- plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy
