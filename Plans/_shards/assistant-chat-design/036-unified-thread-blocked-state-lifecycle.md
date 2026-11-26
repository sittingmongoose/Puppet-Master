# Shard 036: Unified Thread Blocked-State Lifecycle

Source: `Plans/assistant-chat-design.md`

Source lines: L2896-L2911

Source SHA256: `abba158a9dd9a3e735683a21618cdd13e8b10232eab43869d579088560ba391a`

---

## Unified Thread Blocked-State Lifecycle

Canonical thread blocked surfaces reuse the shared blocked packet instead of local ask-flow tuples. This section supersedes earlier overlapping blocked-state addenda in this document; those addenda remain historical transfer notes and must not be read as peer recovery guidance.


Required fields:
- `blocked_notice`
- `blocked_sequence`
- `approval_scope_key`
- `allowed_action_ids[]`

### Multi-episode display
- each `blocked_notice` renders as its own system message
- `validation_blocked` and `remediation_ceiling_exceeded` remain ordinary members of the blocked taxonomy
- chat action buttons are rendered from ordered `allowed_action_ids[]`
- resolving one blocked episode does not collapse sibling blocked episodes
