# Shard 016: Plugin Block Runtime Taxonomy Consolidation Addendum (2026-03-09)

Source: `Plans/Plugins_System.md`

Source lines: L605-L612

Source SHA256: `bf875f3ffc181eb594657726a7bfe97bf5456d5d06d5422d8705286383679d15`

---

## Plugin Block Runtime Taxonomy Consolidation Addendum (2026-03-09)

Plugin-driven blocking that affects execution MUST map into the canonical runtime blocked model.

### Required rules
- `plugin.hook.blocked` that stops execution maps to `blocked_reason_code = plugin_hook_blocked`
- runtime-facing plugin-blocked payloads MUST expose canonical `allowed_action_ids[]`, prerequisite metadata, and `preserved_local_work` when relevant
- plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy
