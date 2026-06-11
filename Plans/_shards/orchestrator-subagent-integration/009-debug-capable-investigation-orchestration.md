# Shard 009: Debug-capable investigation orchestration

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L191-L203

Source SHA256: `a29fb722e82fd1f89823b9be4c7a2aaa3b75418b6d3659c9b6657c0b15971241`

---

## Debug-capable investigation orchestration


Orchestrator may launch shared investigations when builds, tests, environment setup, or runtime verification fail.

Required rules:
- Orchestrator does not switch into the Assistant `Debug` mode strip; instead, it uses the same shared investigation contracts and debug-capable tools under orchestration ownership
- investigation state remains subordinate to the owning attempt / remediation lineage rather than replacing orchestrator run identity
- delegated workers may contribute evidence, traces, or fixes to the same `investigation_id` when they are operating on the same issue
- only one mutation-capable investigation may target the same project/worktree at a time unless the orchestrator explicitly isolates work in a separate worktree or host context

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md

