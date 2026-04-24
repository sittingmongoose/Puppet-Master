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
- concern adjacency: `review_refs[]`, `corroboration_refs[]`, `graph_patch_refs[]`, `recovery_refs[]`, `blocked_episode_refs[]`, and `promotion_refs[]`
- blocked episode state and allowed runtime actions

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md

Rules:
- `request_id` and `tier_id` do not remain primary graph action keys
- approval/recovery actions resolve through blocked runtime identity
- evidence and artifact pivots route into native Evidence and Ledger targets using canonical route/open contracts
- blocked episodes may reference concerns without replacing concern identity

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md
