# Shard 007: Relationship Between the Two Plans

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L163-L179

Source SHA256: `af545965fa3150db48b829e91a13929d03f940b88f01f5cae8bccd2852ea1339`

---

## Relationship Between the Two Plans

The rewrite no longer treats `Phase -> Task -> Subtask -> Iteration` as the canonical orchestration ontology.

Canonical orchestration identity is:
- `Feature Seam`
- `Work Package`
- `Node`
- graph generation lineage
- lane/worktree lineage

Rules:
- any surviving phase/task/subtask language is derived decomposition/view language only
- conversational actors, interview actors, and document builders may share runtime identity semantics with orchestration actors without becoming graph objects
- worktree ownership, recovery, approval, usage, and routing must align to run/node/attempt/lane/worktree identity rather than to `tier_id`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md
