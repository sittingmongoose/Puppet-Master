# Shard 006: Rule Scope Model

Source: `Plans/agent-rules-context.md`

Source lines: L52-L73

Source SHA256: `abc7dcb9b880d42034005d801131e1eb874cebd74eed7af23de2a74cb86375e6`

---

## Rule Scope Model

The normative model is not a Phase/Task/Subtask/Iteration hierarchy and does not create runtime role policy. The durable instruction scopes are:

### Application-Level Rules (Puppet Master)
- **Scope:** every agent run under Puppet Master, regardless of whether the work is Assistant, Interview, Orchestrator, or a delegated child run
- **Purpose:** global policies that apply everywhere
- **Storage:** owner record `app.agent_rules.application_markdown` at the Everywhere home, with applicable Computer application context and source revisions; the storage owner binds exact scope-aware storage refs without a second rule writer
- **Bootstrap:** if empty, seed from the Puppet Master repo `AGENTS.md`

### Project-Level Rules
- **Scope:** every agent invocation that runs against a selected project/workspace
- **Purpose:** project-specific conventions, tooling expectations, and non-obvious constraints
- **Storage:** `<project_root>/.puppet-master/project-rules.md`

### Order and precedence
- Everywhere application rules and applicable Computer application context form the application block, included first through the one rules pipeline. Computer scope does not turn Project rules into application rules.
- Project rules are included when a project context exists.
- Application rules win over project rules on conflict.
- Node/work-package/attempt-specific context is **not** another rules layer; it belongs to the Work Bundle and Memory Bundle.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:AGENTS.md
