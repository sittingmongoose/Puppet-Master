# Shard 007: Feeding Rules Into Every Agent

Source: `Plans/agent-rules-context.md`

Source lines: L75-L94

Source SHA256: `7815be0dff378aa826fab1ec2295a7c1e1f87c5580142922ed5b3c64a58698de`

---

## Feeding Rules Into Every Agent

### Single Rules Pipeline (DRY)

- **Concept:** One module or function that, given (optional) project path, returns a **single formatted block** of text: "Application rules" + "Project rules" (if project path is set and project rules exist). All callers use this block when building prompts or system prompts.
- **Signature (EXAMPLE only):** `get_agent_rules_context(application_config, project_path: Option<&Path>) -> String`. Returns the concatenated rules block (with optional headers like "## Application rules" and "## Project rules" for clarity inside the prompt).
- **Callers:**
  - **Orchestrator:** When building the iteration prompt (or system prompt) for each node, call the rules pipeline with the current workspace path; prepend or append the returned block to the prompt (or inject via the context injection hook or a dedicated "rules injector" step).
  - **Interview:** When building any prompt that goes to an agent (research, validation, phase Q&A), call the rules pipeline with the interview's target project path; include the block in the prompt.
  - **Assistant:** When the user has a project selected, call the rules pipeline with that project path and include the block in the context sent to the CLI. When no project is selected, call with `project_path: None` so only application rules are included.
- **DRY:** Rule content lives in one place per layer (application store, project file). The pipeline is the single place that assembles them; no copy-paste of "Context7" or "DRY" into multiple prompt builders.
  ContractRef: Primitive:DRYRules

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Prompt_Pipeline.md
### Where in the Prompt

- **Injection location (deterministic):** Prepend the combined rules block to the main (user) prompt for every agent invocation.
  AutoDecision: Prepend-only; do not rely on platform-specific system-prompt flags.
  ContractRef: PolicyRule:Decision_Policy.md§2, Primitive:DRYRules

