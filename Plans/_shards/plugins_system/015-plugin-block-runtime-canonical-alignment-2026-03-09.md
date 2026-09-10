# Shard 015: Plugin Block Runtime Canonical Alignment (2026-03-09)

Source: `Plans/Plugins_System.md`

Source lines: L601-L608

Source SHA256: `0b754bd9e29239becb917810f8b63479913ea56b425d53e00386acc65174f6da`

---

## Plugin Block Runtime Canonical Alignment (2026-03-09)

Plugin-driven blocking must map into the canonical runtime blocked model.

Rules:
- `plugin.hook.blocked` that affects execution maps to `blocked_reason_code = plugin_hook_blocked`
- the runtime-facing blocked path MUST expose `allowed_action_ids[]`, guard metadata, and preserved-local-work state when relevant
- plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy
