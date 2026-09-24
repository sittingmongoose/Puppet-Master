# Shard 015: Plugin Block Runtime Canonical Alignment (2026-03-09)

Source: `Plans/Plugins_System.md`

Source lines: L601-L608

Source SHA256: `5221647058ce770c078337c1e9c8b9c966059498610d062fa1f0988b6437c3c5`

---

## Plugin Block Runtime Canonical Alignment (2026-03-09)

Plugin-driven blocking must map into the canonical runtime blocked model.

Rules:
- `plugin.hook.blocked` that affects execution maps to `blocked_reason_code = plugin_hook_blocked`
- the runtime-facing blocked path MUST expose `allowed_action_ids[]`, guard metadata, and preserved-local-work state when relevant
- plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy
