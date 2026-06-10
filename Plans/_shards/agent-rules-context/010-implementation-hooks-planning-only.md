# Shard 010: Implementation Hooks (Planning Only)

Source: `Plans/agent-rules-context.md`

Source lines: L119-L128

Source SHA256: `95c2cfd80f6f84d3673a2ec3a50cd30f475a8c6a763595cac75b9699f525db08`

---

## Implementation Hooks (Planning Only)

1. **Define storage:** Application rules live in redb settings (`settings` namespace key `app.agent_rules.application_markdown`). Project rules live in `<project_root>/.puppet-master/project-rules.md`.
   ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, ContractName:Plans/storage-plan.md
2. **Rules pipeline:** Implement `get_agent_rules_context(app_config, project_path)` that loads application rules, optionally loads project rules when `project_path` is set, and returns a single formatted string. Use this in one place so all callers depend on it (DRY).
3. **Orchestrator:** When building iteration (or system) prompt, call the rules pipeline with the run's workspace path; inject the returned block.
4. **Interview:** When building any agent prompt, call the rules pipeline with the interview's target project path; inject the returned block.
5. **Assistant:** When building context for the chat CLI, call the rules pipeline with the current project path (or None); inject the returned block.
6. **GUI:** Add Application rules and Project rules (when project selected) to Settings/Config; persist and read via the same storage the rules pipeline uses.

