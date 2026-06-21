# Shard 008: Tier-Level Subagent Strategy

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L180-L194

Source SHA256: `2ee55b103561817b0df045551f72aaa1872b84c9e669aeefb7a3c1a6be5fa2f0`

---

## Tier-Level Subagent Strategy
Canonical worker strategy remains graph-owned rather than tier-owned, but provider/runtime selection for node workers must now use the reconciled runtime ontology.

This heading is retained as a compatibility/search anchor. Canonical worker strategy is capability-lane and graph/package/seam/lane owned, with tier labels permitted only as legacy projection or migration vocabulary.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Graph_View.md

Required orchestration rules:
- node execution selects from the same provider-entry / account-or-profile model used elsewhere in the rewrite.
- the orchestrator may request a provider family pool, but the frozen requested/effective runtime snapshot must still identify the concrete provider entry selected for each node worker.
- OpenCode subagent execution selects a server profile, not an account row.
- GitHub Copilot and Codex subagent execution use direct-provider account rows rather than legacy CLI assumptions.
- orchestrator-side skill and MCP behavior follows the PM-native skill/MCP model and does not require provider-specific native skill delivery contracts.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Skills_System.md
