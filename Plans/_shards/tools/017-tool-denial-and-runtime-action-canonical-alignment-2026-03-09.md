# Shard 017: Tool Denial and Runtime Action Canonical Alignment (2026-03-09)

Source: `Plans/Tools.md`

Source lines: L1567-L1578

Source SHA256: `78420b4d2c670dadc9747ffd98d3e2c1b817ace8238e70df542967f62f2e8a45`

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
