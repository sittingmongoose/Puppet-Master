# Shard 005: Relationship to Other Plans

Source: `Plans/agent-rules-context.md`

Source lines: L39-L51

Source SHA256: `4c85ec54db656bd379cd8af6870d0fd2ac16853b2ff88199cd14e528a78635db`

---

## Relationship to Other Plans

| Plan | Relevance |
|------|-----------|
| **Plans/orchestrator-subagent-integration.md** | Orchestrator builds iteration prompts and injects context (e.g. context injection hook, coordination context). The **rules block** (application + project) must be included when building every iteration prompt or system prompt. Use the shared rules pipeline; do not duplicate rule content in the orchestrator. |
| **Plans/interview-subagent-integration.md** | Interview builds prompts for research, validation, and phase Q&A. Application rules always injected; project rules injected when the interview is run for a specific (target) project. Use the shared rules pipeline. |
| **Plans/assistant-chat-design.md** | Assistant chat sends context to the platform CLI. When the user is working in the context of a project, application rules + project rules must be included. When no project is selected, application rules only. Use the shared rules pipeline. |
| **AGENTS.md** | Today the Puppet Master repo's AGENTS.md contains rules like "Always use Context7 MCP." That content can be **one source** for default application rules (e.g. on first run or when no application rules file exists). Long term, application rules are a **configurable** list so the user can add/edit without editing AGENTS.md in the app repo. Current OpenAI Codex product docs support `AGENTS.md` as a native guidance surface for Codex tasks, so PM's AGENTS-centered canonical instruction model remains aligned with Codex. |

Rules-context assembly consumes cache-friendly prompt assembly from `Plans/Prompt_Pipeline.md` and treats `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` as the external V0-to-A2A event mapping reference; this document does not re-own either contract.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/assistant-chat-design.md
<a id="two-tier-rules-model"></a>
