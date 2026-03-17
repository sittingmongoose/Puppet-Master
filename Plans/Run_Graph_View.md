# Run Graph View (Node Graph Display) -- Specification

## 1. Scope and canonical role
Run Graph is the canonical graph/lineage inspection surface for orchestrated execution.

Rules:
- graph nodes are runtime nodes, not tiers
- graph lineage spans generations when graph patching occurs
- blocked/recovery/promotion/corroboration state belongs in graph detail when it pertains to the selected node or related lineage object

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md

## 2. Layout
The graph view has three primary regions:
- top header for run scope, generation scope, and trust state
- main graph canvas with minimap/search/overlays
- right-side inspector and table region

Rules:
- current generation is emphasized by default
- superseded and historical branches remain visible and clickable
- large-graph modes use virtualization, level-of-detail reduction, and lineage-focused defaults rather than hiding historical truth

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

## 3. Node detail inspector
The inspector must show at minimum:
- node summary and graph lineage
- package and seam mapping
- requested/effective provider/model/effort/persona/account identity
- worker policy and retry policy
- attempt history and safe points
- lane/worktree/snapshot state
- usage/token/cost links
- evidence, artifacts, reviews, promotions, and concerns
- blocked episode state and allowed runtime actions

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md

Rules:
- `request_id` and `tier_id` do not remain primary graph action keys
- approval/recovery actions resolve through blocked runtime identity
- evidence and artifact pivots route into native Evidence and Ledger targets using canonical route/open contracts

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md

## 4. Data model and identity
Graph projection identity is anchored by:
- `project_id`
- `run_id`
- `node_id`
- `attempt_id?`
- `blocked_sequence?`
- `graph_generation_id?`
- `feature_seam_id?`
- `work_package_id?`
- `lane_id?`
- `worktree_id?`

Rules:
- usage correlation resolves through canonical usage identity such as `usage_event_ref` and runtime attribution fields, not by `tier_id`
- runtime artifacts link through `artifact_id`, `provider_attempt_ref`, `usage_event_ref`, and external receipt refs as bridges rather than as replacement primary keys

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md
