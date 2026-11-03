# Shard 018: Tool Denial Runtime Blocked Payload Consolidation Addendum (2026-03-09)

Source: `Plans/Tools.md`

Source lines: L1589-L1610

Source SHA256: `ede2a7942ae8c531e17d141bb5f9b2c6f0a9e43c259bfe1fa9f102f70e9d0a67`

---

## Tool Denial Runtime Blocked Payload Consolidation Addendum (2026-03-09)


Tool-layer refusals that affect execution MUST normalize into canonical runtime blocked semantics before UI or scheduler layers consume them.

### Canonical runtime-facing payload
Runtime-facing denial paths MUST expose:
- `blocked_reason_code`
- `allowed_action_ids[]`
- `executed_at_all`
- prerequisite metadata needed to bind the exact recovery command
- `failure_class?` only when the denial followed a classified attempt outcome

### Source mapping rules
- permission-layer denial -> `permission_denied`
- headless interactive denial -> `headless_ask_denied`
- user refusal -> `user_declined`
- FileSafe denial that stops execution -> `filesafe_blocked`
- plugin/tool hook denial that stops execution -> `plugin_hook_blocked`

### No success-shaped fallback rule
Tools MUST NOT convert denied work into success-shaped or generic-failure fallbacks. The blocked state must remain inspectable so scheduler, chat, and GUI surfaces can render the correct recovery path.
