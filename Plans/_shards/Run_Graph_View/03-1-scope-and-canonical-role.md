## 1. Scope and canonical role
Run Graph is the canonical graph/lineage inspection surface for orchestrated execution.

Rules:
- graph nodes are runtime nodes, not tiers
- graph lineage spans generations when graph patching occurs
- blocked/recovery/promotion/corroboration state belongs in graph detail when it pertains to the selected node or related lineage object

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md

