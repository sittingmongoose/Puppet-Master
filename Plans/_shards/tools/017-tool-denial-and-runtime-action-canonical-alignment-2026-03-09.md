# Shard 017: Tool Denial and Runtime Action Canonical Alignment (2026-03-09)

Source: `Plans/Tools.md`

Source lines: L1474-L1485

Source SHA256: `85e8dc86742832e1f4e8361022659b17aea2aa1a148b1e02c11e2dd71ff2696f`

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
