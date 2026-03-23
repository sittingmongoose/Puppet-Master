# Puppet Master Feature List (Reference)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


This document exists to avoid losing features when writing rewrite implementation docs. Part 1 lists planned and new features from the Plans folder, organized by category and relation. Part 2 records what exists in the codebase today for reference. Plans define target behavior; implementation may change.

---

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
## Part 1A - Markdown, Mermaid, and Unified Rendering Addendum (2026-03-07)

Reference additions for rewrite planning:

- First-class Markdown rendering in chat, editor preview, document panes, and planning documents.
- Native Mermaid detection/rendering from fenced `mermaid` blocks and `.mmd` files.
- Mermaid export as SVG (canonical) and PNG (derived).
- Full Markdown support centered on source-canonical editing plus rendered preview, not on replacing Markdown with a hidden WYSIWYG model.
- HTML files support both source editing and full rendered browser-like viewing.
- Image files render natively in the Slint app surface.
- Detached preview/browser windows are first-class, cross-platform guaranteed behavior.
- Embedded webviews are optional optimizations, not required product invariants.
- Generated Markdown/Mermaid previews use a restricted trust tier; full HTML/browser mode uses a separate trust tier.
- Preview-mode edits are limited to validated structured commands and otherwise fall back to source editing.
- Planning documents, including future Deep Plan Mode surfaces, use the same Markdown/Mermaid pipeline and canonical-source rules.

## Source Control, GitHub Actions, and Docker Manager MVP Consolidation Addendum (2026-03-12)

### GUI and views
- first-class `Source Control` side-panel surface with Changes, History, Graph, Worktrees, and Branches / Stash
- first-class `GitHub Actions` side-panel surface with Current Branch, Workflows, and Settings
- first-class `Docker Manager` side-panel surface with Containers, Images, Compose, Registries, Build / Bake, Publish / Unraid, and project-focused Kubernetes

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md

### Orchestration and recovery
- run-to-repo lineage and worktree ownership surfaced across Orchestrator tabs
- run-to-workflow and workflow-to-diff correlation
- publish/runtime/template and Kubernetes rollout linkage surfaced in Orchestrator and Run Graph
- cross-surface `Open in Source Control`, `Open in GitHub Actions`, and `Open in Docker Manager` pivots

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md

### State and commands
- Source Control, GitHub Actions, and Docker Manager panel state persisted per project where applicable
- new canonical command families for Source Control, GitHub Actions, Docker Manager, and cross-surface pivots
- blocked-state and requested-vs-effective rules remain product-wide behavior, not panel-local polish

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Decision_Policy.md

## Runtime Scheduler Recovery Summary Consolidation Addendum (2026-03-09)

Summary bullets for this feature family MUST say:
- deterministic scored ready-set scheduling instead of pure lexical dispatch
- event-driven queue-analysis passes keyed by `scheduler_pass_id`
- immutable attempt lineage with new `attempt_id` per dispatch and explicit runtime fields for retry/blocking/remediation/safe points
- blocked outcomes with explicit recovery actions instead of generic failures, with distinct `attention_required` vs `blocked` wizard/thread/dashboard states
- safe-point-backed recovery distinct from user-facing restore points
- remediation child execution with explicit lineage and shared failure-class retry/backoff policy
- pre-lock-only draft decomposition fallback and post-lock graph-integrity stop behavior

Remove or revise older summary phrasing that implies lexical dispatch, node-centric retry commands, or `attention_required` as the only paused clarification state.

**Artifacts panel and panels (from GUI/Artifacts/Usage scope):** Artifacts panel (runtime artifacts, 19 types, cost_usage, Show in Ledger/Usage); side-panel toggling for Git, Docker, Unraid, Artifacts, Chat, Files (single slot, last-click wins); layout save per project; OpenCode-style usage-on-message reference; AI in Git; multi-repo source control (or explicit deferral).
