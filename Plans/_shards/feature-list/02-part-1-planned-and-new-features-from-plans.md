## Part 1 - Planned and New Features (from Plans)

### 6A. Debug Mode and shared debug-capable tooling
- Assistant Chat exposes `Debug` as a first-class primary mode distinct from the classical `Debugger` / DAP surface
- Debug-capable tools remain shared platform capabilities across Assistant, Orchestrator, Interview, and delegated runs
- investigations use canonical `investigation_id`, `instrumentation_id`, visible Investigation Context, and runtime-artifact linkage rather than hidden evidence ingress
- default Debug behavior is fully automated, evidence-first reproduction / diagnosis / fix / verification / cleanup under a run-scoped Debug Automation Profile
- remote Debug MVP applies to local projects and PM-managed remote-mode projects only; no arbitrary ad-hoc remote attach and no silent local fallback

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_Integration.md

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
