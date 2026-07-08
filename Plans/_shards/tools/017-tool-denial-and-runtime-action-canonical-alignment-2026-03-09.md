# Shard 017: Tool Denial and Runtime Action Canonical Alignment (2026-03-09)

Source: `Plans/Tools.md`

Source lines: L1474-L1485

Source SHA256: `61442f37cdfa57232b47b3bc3043b1e9fdc6e838a83cfbc2d09198245f4af352`

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
