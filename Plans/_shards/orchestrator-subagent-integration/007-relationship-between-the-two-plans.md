# Shard 007: Relationship Between the Two Plans

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L165-L181

Source SHA256: `097cca524dae257dabb2a8c375040eb1712ec93e5847ed2c8ce0002f2fa65c91`

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
