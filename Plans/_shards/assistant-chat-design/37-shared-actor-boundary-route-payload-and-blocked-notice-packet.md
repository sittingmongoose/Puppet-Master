## Shared actor-boundary, route payload, and blocked_notice packet

### Actor boundary and runtime identity
- Assistant chat actors share runtime identity semantics with Orchestrator and Interview agents.
- Chat actors remain chat/session actors; they do not become nodes or lanes merely because they delegate to subagents.
- Requested/effective runtime identity, `execution_role`, and `operational_identity` are visible on chat-facing surfaces and in delegated child-run handoffs.

### Canonical route payload
- Chat context includes route args from the parent run or session.
- Route args govern which tools and subagents are accessible within the chat session.
- Route args are immutable for the duration of the chat session; dynamic route changes are prohibited.

### blocked_notice packet
- When a chat query cannot be resolved within the current route/context, a structured blocked_notice packet is emitted.
- The blocked_notice includes the blocked query, the blocker reason, and a fallback resolution path (escalate to human, delegate to full Orchestrator, etc.).
- Blocked notices are distinct from errors; they indicate that the chat agent is functioning correctly but the requested work is out of scope.
