# Shard 017: Tool Denial and Runtime Action Canonical Alignment (2026-03-09)

Source: `Plans/Tools.md`

Source lines: L1584-L1595

Source SHA256: `dc754309b0e950bdc6cfd48c36ca68e77c262d18441d22ebf13af8c260ae955e`

---

## Tool Denial and Runtime Action Canonical Alignment (2026-03-09)

Tool-layer refusals that affect execution MUST collapse into canonical runtime blocked semantics before reaching orchestration or UI layers.

Runtime-facing blocked payloads from tool denials MUST expose:
- `blocked_reason_code`
- `failure_class?`
- `allowed_action_ids[]`
- guard/rule metadata needed to bind the exact UI command
- `executed_at_all` boolean

Runtime-facing tool-denial paths MUST NOT publish a parallel `recovery_options[]` schema.
