# Shard 036: Unified Thread Blocked-State Lifecycle

Source: `Plans/assistant-chat-design.md`

Source lines: L2751-L2766

Source SHA256: `0fe964276531d100915e802554b18a7d8474ab3fa7d52e9f4a4661b440a627c2`

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
