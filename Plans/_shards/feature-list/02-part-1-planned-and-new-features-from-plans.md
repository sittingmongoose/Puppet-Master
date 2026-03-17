## Part 1 - Planned and New Features (from Plans)

### 1. Rewrite and architecture
- node graph is the canonical orchestration model
- `Feature Seam` and `Work Package` are first-class graph-owned objects
- runtime blocked identity, requested/effective runtime identity, and route/open primitives are canonical cross-cutting contracts

### 2. Chat and assistant
- assistant chat consumes shared requested/effective runtime identity rather than defining local schema
- chat navigation, usage pivots, and source-open behavior align to `route_target`, `OpenSubject`, and `OpenFile`

### 3. GUI layout and shell
- Orchestrator remains tab-first with `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- `Progress` is the only widget-composed Orchestrator tab
- Source Control remains narrow and worktree-first

### 4. Orchestration and subagents
- `Package Overseer` and `Seam Overseer` are governance roles
- default node worker policy is `subagent`
- default retry policy is `fresh worker`
- graph patching creates new graph generations while preserving historical lineage

### 5. Usage, recovery, and analytics
- usage correlation is runtime-first, not `tier_id`-first
- blocked approvals and recovery use runtime blocked-episode identity
- account pressure and account-switch history are first-class shared runtime records

### 6. Git and worktree
- lane/worktree lifecycle is split between Orchestrator operational truth and Source Control concrete Git actions
- historical lane identity survives live worktree cleanup

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/usage-feature.md
