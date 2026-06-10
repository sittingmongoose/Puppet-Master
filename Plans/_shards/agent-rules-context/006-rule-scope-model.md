# Shard 006: Rule Scope Model

Source: `Plans/agent-rules-context.md`

Source lines: L52-L74

Source SHA256: `95c2cfd80f6f84d3673a2ec3a50cd30f475a8c6a763595cac75b9699f525db08`

---

## Rule Scope Model

The normative model is not a Phase/Task/Subtask/Iteration hierarchy and does not create runtime role policy. The durable instruction scopes are:

### Application-Level Rules (Puppet Master)
- **Scope:** every agent run under Puppet Master, regardless of whether the work is Assistant, Interview, Orchestrator, or a delegated child run
- **Purpose:** global policies that apply everywhere
- **Storage:** redb settings key `app.agent_rules.application_markdown`
- **Bootstrap:** if empty, seed from the Puppet Master repo `AGENTS.md`

### Project-Level Rules
- **Scope:** every agent invocation that runs against a selected project/workspace
- **Purpose:** project-specific conventions, tooling expectations, and non-obvious constraints
- **Storage:** `<project_root>/.puppet-master/project-rules.md`

### Order and precedence
- Application rules are always included first.
- Project rules are included when a project context exists.
- Application rules win over project rules on conflict.
- Node/work-package/attempt-specific context is **not** another rules layer; it belongs to the Work Bundle and Memory Bundle.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:AGENTS.md

