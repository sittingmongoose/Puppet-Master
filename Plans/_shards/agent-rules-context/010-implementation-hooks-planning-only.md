# Shard 010: Implementation Hooks (Planning Only)

Source: `Plans/agent-rules-context.md`

Source lines: L119-L127

Source SHA256: `64d60448dac0a023b529346f47bff671430f35b8ba26fe20f72985f21483a43e`

---

## Implementation Hooks (Planning Only)

1. **Define storage:** Application rules live in redb settings (`settings` namespace key `app.agent_rules.application_markdown`). Project rules live in `<project_root>/.puppet-master/project-rules.md`.
   ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, ContractName:Plans/storage-plan.md
2. **Rules pipeline:** Implement the one function `get_agent_rules_context(request: &AgentRulesContextRequest) -> AgentRulesContextResult` (the locked function contract in FABLE Deferred Action Concrete Repair Addendum - 2026-07-08): it loads application rules and the work Computer's applicable application context, loads project rules only when a Project is bound, and returns a result whose `formatted_block_ref` names the single formatted block when `errors[]` is empty. Use this in one place so all callers depend on it (DRY). The earlier hook text "Implement `get_agent_rules_context(app_config, project_path)` ... returns a single formatted string" is source lineage for this contract, not a second signature.
3. **Orchestrator:** When building iteration (or system) prompt, call the rules pipeline with a request for the run (`caller = orchestrator`, `run_id`, `computer_id`, the run's workspace Project when bound, source revisions); inject the block `formatted_block_ref` names, or refuse the dispatch with the first error code when `errors[]` is not empty.
4. **Interview:** When building any agent prompt, call the rules pipeline with a request for the interview (`caller = interview`, `thread_id`, `computer_id`, the target Project when bound, source revisions); inject the block `formatted_block_ref` names, or refuse the dispatch with the first error code when `errors[]` is not empty.
5. **Assistant:** When building context for the chat CLI, call the rules pipeline with a request for the chat (`caller = assistant`, `thread_id`, `computer_id`, the selected Project or none, source revisions); inject the block `formatted_block_ref` names, or refuse the dispatch with the first error code when `errors[]` is not empty.
6. **GUI:** Add Application rules and Project rules (when project selected) to Settings/Config; persist and read via the same storage the rules pipeline uses.
