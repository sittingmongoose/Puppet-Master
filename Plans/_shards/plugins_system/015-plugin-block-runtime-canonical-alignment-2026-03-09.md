# Shard 015: Plugin Block Runtime Canonical Alignment (2026-03-09)

Source: `Plans/Plugins_System.md`

Source lines: L597-L604

Source SHA256: `bf875f3ffc181eb594657726a7bfe97bf5456d5d06d5422d8705286383679d15`

---

## Plugin Block Runtime Canonical Alignment (2026-03-09)

Plugin-driven blocking must map into the canonical runtime blocked model.

Rules:
- `plugin.hook.blocked` that affects execution maps to `blocked_reason_code = plugin_hook_blocked`
- the runtime-facing blocked path MUST expose `allowed_action_ids[]`, guard metadata, and preserved-local-work state when relevant
- plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy
