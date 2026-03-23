## Tier-Level Subagent Strategy

Canonical worker strategy is graph-owned rather than tier-owned.

Default worker policy is:
- node execution default = `subagent`
- retry default = `fresh worker`

GUI override surface must allow:
- `subagent` vs `agent`
- `fresh worker` vs `reused worker`

Governance strategy is:
- package-local governance through `Package Overseer`
- seam-level integration governance through `Seam Overseer`
- node execution through node workers bound to `execution_unit_context`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md

`Tier Context` survives only as derived decomposition/view context when needed for prompt helpers or legacy labels. It does not remain the canonical runtime context.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Decision_Policy.md

