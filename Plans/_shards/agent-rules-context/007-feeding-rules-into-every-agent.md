# Shard 007: Feeding Rules Into Every Agent

Source: `Plans/agent-rules-context.md`

Source lines: L75-L93

Source SHA256: `5fb81425507647a77ace998f0db987a831d18dd3550756c68db9e59eea37fae6`

---

## Feeding Rules Into Every Agent

### Single Rules Pipeline (DRY)

- **Concept:** One module or function that, given (optional) project path, returns a **single formatted block** of text: "Application rules" + "Project rules" (if project path is set and project rules exist). All callers use this block when building prompts or system prompts.
- **Signature (EXAMPLE only):** `get_agent_rules_context(application_config, project_path: Option<&Path>) -> String`. Returns the concatenated rules block (with optional headers like "## Application rules" and "## Project rules" for clarity inside the prompt). This example illustrates the formatted text only. The one function every caller uses is `get_agent_rules_context(request: &AgentRulesContextRequest) -> AgentRulesContextResult`, the locked function contract in FABLE Deferred Action Concrete Repair Addendum - 2026-07-08; its `formatted_block_ref` names this block, and a caller injects it only when `errors[]` is empty.
- **Callers:**
  - **Orchestrator:** When building the iteration prompt (or system prompt) for each node, call the rules pipeline with the current workspace path (request `caller = orchestrator`, the run's `run_id`, its work `computer_id` and source revisions); prepend or append the returned block to the prompt (or inject via the context injection hook or a dedicated "rules injector" step).
  - **Interview:** When building any prompt that goes to an agent (research, validation, phase Q&A), call the rules pipeline with the interview's target project path (request `caller = interview`, the interview's `thread_id`, its work `computer_id` and source revisions); include the block in the prompt.
  - **Assistant:** When the user has a project selected, call the rules pipeline with that project path (request `caller = assistant`, the chat `thread_id`, its work `computer_id` and source revisions) and include the block in the context sent to the CLI. When no project is selected, call with `project_path: None` so application rules including the actual work-Computer context are included; conversion reassembles future context from destination scope and leaves frozen history unchanged.
- **DRY:** Rule content lives in one place per layer (application store, project file). The pipeline is the single place that assembles them; no copy-paste of "Context7" or "DRY" into multiple prompt builders.
  ContractRef: Primitive:DRYRules

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Prompt_Pipeline.md
### Where in the Prompt

- **Injection location (deterministic):** Prepend the combined rules block to the main (user) prompt for every agent invocation.
  AutoDecision: Prepend-only; do not rely on platform-specific system-prompt flags.
  ContractRef: PolicyRule:Decision_Policy.md§2, Primitive:DRYRules
