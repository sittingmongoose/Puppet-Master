# Shard 038: Shared actor-boundary, route payload, and blocked_notice packet

Source: `Plans/assistant-chat-design.md`

Source lines: L3258-L3279

Source SHA256: `c4974fbcf8a2f9df1db3ecafe3847e56de05f47487c4079ab98c9969df254b01`

---

## Shared actor-boundary, route payload, and blocked_notice packet


### Actor boundary and runtime identity
- Assistant chat actors share runtime identity semantics with Orchestrator and Interview agents.
- Chat actors remain chat/session actors; they do not become nodes or lanes merely because they delegate to subagents.
- Requested/effective runtime identity, `execution_role`, and `operational_identity` are visible on chat-facing surfaces and in delegated child-run handoffs.

`execution_role` identifies the runtime actor; `operational_identity` identifies the side-effect identity or target context used by the action. `package-overseer` and seam-overseer identities are named runtime actors for handoff/display; they are not ordinary delegated subagents merely because a chat thread shows them.

### Canonical route payload
- Chat context includes route args from the parent run or session.
- Route args govern which tools and subagents are accessible within the chat session.
- Route args are immutable for the duration of the chat session; dynamic route changes are prohibited.

### blocked_notice packet
- When a chat query cannot be resolved within the current route/context, a structured blocked_notice packet is emitted.
- The blocked_notice includes the blocked query, the blocker reason, and a fallback resolution path (escalate to human, delegate to full Orchestrator, etc.).
- Blocked notices are distinct from errors; they indicate that the chat agent is functioning correctly but the requested work is out of scope.

`blocked_notice` packets include the blocked reason, detail ref, `/attempt` and node references when applicable, preserved-local-work summary, and ordered `allowed_action_ids[]` / `allowed_action_ids` action rendering. `wizard.blocked` and `node.blocked` consume the same stronger blocked taxonomy; any older `pre-runtime-escalation` wizard shape is compatibility evidence, not a separate live state.

