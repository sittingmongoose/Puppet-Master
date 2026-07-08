# Shard 006: Relationship to Other Plans

Source: `Plans/human-in-the-loop.md`

Source lines: L136-L143

Source SHA256: `7aaa04e47769b1e276e701736ff33f9200125da8385a05d5fe9c5eb0be5c87f6`

---

## Relationship to Other Plans

| Plan | Relevance to HITL |
|------|-------------------|
| **Plans/orchestrator-subagent-integration.md** | Defines the visible Phase → Task → Subtask → Iteration grouping and verification labels. HITL consumes those labels as configuration/display groupings only; canonical approval scope, recovery identity, and progression blocking come from package/seam gates and runtime blocked episodes. |
| **Plans/interview-subagent-integration.md** | Interview flow has its own phases (Scope, Architecture, UX, etc.). HITL in this plan applies to orchestrator package/seam decision points surfaced through Phase/Task/Subtask grouping controls. Interview-phase-level HITL (pause after each interview phase for approval) is out of scope here but could mirror this grouping model if added later. |
| **Plans/assistant-chat-design.md** | Defines **Dashboard warnings and Calls to Action (CtA)** and that they are **addressable via the chat Assistant**. HITL prompts are one type of CtA: when paused for approval, the Dashboard shows a CtA; the user can respond via the Assistant or a direct Dashboard control. See §16 there. |
| **Plans/newfeatures.md §20** | Summary and orchestrator integration: HITL is a **setting** only; visible grouping labels stay aligned with Plans/orchestrator-subagent-integration.md, while blocked-episode and package/seam gate semantics remain defined here and in the runtime contracts. |
