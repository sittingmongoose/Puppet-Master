# Puppet Master Feature List (Reference)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


This document exists to avoid losing features when writing rewrite implementation docs. Part 1 lists planned and new features from the Plans folder, organized by category and relation. Part 2 records what exists in the codebase today for reference. Plans define target behavior; implementation may change.

---

## Part 1 - Planned and New Features (from Plans)

## Reference anchors used in this document

<a id="crosswalk-ref"></a>
- **Crosswalk** — `Plans/Crosswalk.md`; ownership boundaries for shared primitives and cross-surface responsibilities.

<a id="storage-plan-ref"></a>
- **storage-plan** — `Plans/storage-plan.md`; canonical storage, projection, persistence, and artifact-retention semantics.

<a id="assistant-chat-design-ref"></a>
- **assistant-chat-design** — `Plans/assistant-chat-design.md`; canonical Assistant Chat behavior, modes, thread UX, and slash-command semantics.

<a id="feature-debug-mode"></a>
### 6A. Debug Mode and shared debug-capable tooling
Debug Mode is the rewrite-era assistant investigation workflow: it treats diagnosis, instrumentation, evidence capture, verification, and cleanup as one coherent thread-scoped operation rather than as disconnected debugger gestures. The feature matters because Puppet Master must support automated, evidence-first debugging without collapsing Debug Mode into classical DAP debugger semantics or into opaque agent-only behavior.

**Key capabilities**
- Assistant Chat exposes `Debug` as a first-class primary mode distinct from the classical `Debugger` / DAP surface
- Debug-capable tools remain shared platform capabilities across Assistant, Orchestrator, Interview, and delegated runs
- investigations use canonical `investigation_id`, `instrumentation_id`, visible Investigation Context, and runtime-artifact linkage rather than hidden evidence ingress
- default Debug behavior is fully automated, evidence-first reproduction / diagnosis / fix / verification / cleanup under a run-scoped Debug Automation Profile
- remote Debug MVP applies to local projects and PM-managed remote-mode projects only; no arbitrary ad-hoc remote attach and no silent local fallback

**Detailed spec:** [assistant-chat-design](#assistant-chat-design-ref), `Plans/Run_Modes.md`, `Plans/GitHub_Integration.md`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_Integration.md

<a id="feature-rewrite-architecture"></a>
### 1. Rewrite and architecture
The rewrite architecture feature family establishes the node graph, seam/package ownership, and canonical cross-cutting primitives as the structural backbone of the product. Instead of allowing individual surfaces to reinvent runtime identity, routing, or execution semantics, this feature consolidates those contracts so downstream plans can compose behavior without redefining the foundation.

**Key capabilities**
- node graph is the canonical orchestration model
- `Feature Seam` and `Work Package` are first-class graph-owned objects
- runtime blocked identity, requested/effective runtime identity, and route/open primitives are canonical cross-cutting contracts

**Detailed spec:** [Crosswalk](#crosswalk-ref), `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`

<a id="feature-chat-assistant"></a>
### 2. Chat and assistant
The chat-and-assistant feature family ensures Assistant Chat is a consumer of shared platform contracts rather than an isolated subsystem with its own parallel schema. That alignment keeps navigation, runtime disclosure, and source-opening behavior predictable across chat, orchestration, and supporting panels while preserving chat-specific ergonomics.

**Key capabilities**
- assistant chat consumes shared requested/effective runtime identity rather than defining local schema
- chat navigation, usage pivots, and source-open behavior align to `route_target`, `OpenSubject`, and `OpenFile`

**Detailed spec:** [assistant-chat-design](#assistant-chat-design-ref), `Plans/Contracts_V0.md`, `Plans/Prompt_Pipeline.md`

<a id="feature-gui-layout-shell"></a>
### 3. GUI layout and shell
The GUI layout and shell feature family describes the product's high-level workspace composition, especially the tab-first Orchestrator and narrow, worktree-first Source Control layout. These decisions are architectural, not cosmetic: they define which surface owns each kind of state, how users pivot between views, and how shell-adjacent workflows remain legible inside the rewrite.

**Key capabilities**
- Orchestrator remains tab-first with `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- `Progress` is the only widget-composed Orchestrator tab
- Source Control remains narrow and worktree-first

**Detailed spec:** `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md`, [Crosswalk](#crosswalk-ref)

<a id="feature-orchestration-subagents"></a>
### 4. Orchestration and subagents
This feature family covers how execution responsibility is delegated, supervised, retried, and patched across the graph. It keeps governance roles explicit and makes graph evolution a first-class lineage event so orchestration remains auditable even when the system decomposes work into multiple specialized workers and later replans the graph.

**Key capabilities**
- `Package Overseer` and `Seam Overseer` are governance roles
- default node worker policy is `subagent`
- default retry policy is `fresh worker`
- graph patching creates new graph generations while preserving historical lineage

**Detailed spec:** `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/Executor_Protocol.md`

<a id="feature-usage-recovery-analytics"></a>
### 5. Usage, recovery, and analytics
Usage, recovery, and analytics are modeled as runtime-native records rather than as optional UI summaries. The rewrite uses shared runtime identity, blocked-episode lineage, and persistent account history so usage analysis and recovery flows can explain what happened, who acted, and why the system transitioned between states.

**Key capabilities**
- usage correlation is runtime-first, not `tier_id`-first
- blocked approvals and recovery use runtime blocked-episode identity
- account pressure and account-switch history are first-class shared runtime records

**Detailed spec:** `Plans/usage-feature.md`, [storage-plan](#storage-plan-ref), `Plans/Contracts_V0.md`

<a id="feature-git-worktree"></a>
### 6. Git and worktree
The Git/worktree feature family separates orchestration truth from concrete repository operations so that historical execution lineage survives even when a live worktree is cleaned up or re-bound. This prevents Source Control actions from erasing the audit trail that Orchestrator, Assistant Chat, and recovery flows rely on.

**Key capabilities**
- lane/worktree lifecycle is split between Orchestrator operational truth and Source Control concrete Git actions
- historical lane identity survives live worktree cleanup

**Detailed spec:** `Plans/GitHub_Integration.md`, `Plans/WorktreeGitImprovement.md`, [storage-plan](#storage-plan-ref)

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/usage-feature.md

<a id="feature-markdown-mermaid-rendering"></a>
## Part 1A - Markdown, Mermaid, and Unified Rendering Addendum (2026-03-07)
This addendum captures the rewrite's document and preview rendering model: source remains canonical, rendered output is first-class, and richer preview experiences never replace the underlying editable artifact. The same rendering pipeline must support chat, planning docs, editor preview, and future deeper planning surfaces without introducing a hidden document model.

**Key capabilities**

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

**Detailed spec:** `Plans/FinalGUISpec.md`, `Plans/PMConcept.html`, [Crosswalk](#crosswalk-ref)

<a id="feature-sc-gha-docker"></a>
## Source Control, GitHub Actions, and Docker Manager MVP Consolidation Addendum (2026-03-12)
This consolidation addendum defines the rewrite-era MVP for repository operations, CI visibility, and container/runtime management as coordinated first-class panels. Its goal is to expose lineage and operational pivots across source control, workflows, and containers without fragmenting state ownership or inventing panel-local recovery semantics.

**Key capabilities**
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

**Detailed spec:** `Plans/FinalGUISpec.md`, `Plans/GitHub_Integration.md`, [storage-plan](#storage-plan-ref)

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Decision_Policy.md

<a id="feature-runtime-scheduler-recovery"></a>
## Runtime Scheduler Recovery Summary Consolidation Addendum (2026-03-09)
This scheduler recovery addendum standardizes how retry, blocked, remediation, and safe-point behavior must be summarized across rewrite docs. It exists to prevent regressions back to older lexical-dispatch phrasing and to ensure every related feature description speaks in terms of canonical scheduler lineage, wakeups, and blocked-state handling.

**Key capabilities**
- deterministic scored ready-set scheduling instead of pure lexical dispatch
- event-driven queue-analysis passes keyed by `scheduler_pass_id`
- immutable attempt lineage with new `attempt_id` per dispatch and explicit runtime fields for retry/blocking/remediation/safe points
- blocked outcomes with explicit recovery actions instead of generic failures, with distinct `attention_required` vs `blocked` wizard/thread/dashboard states
- safe-point-backed recovery distinct from user-facing restore points
- remediation child execution with explicit lineage and shared failure-class retry/backoff policy
- pre-lock-only draft decomposition fallback and post-lock graph-integrity stop behavior

Remove or revise older summary phrasing that implies lexical dispatch, node-centric retry commands, or `attention_required` as the only paused clarification state.

**Detailed spec:** `Plans/Executor_Protocol.md`, `Plans/Run_Graph_View.md`, [storage-plan](#storage-plan-ref)

**Artifacts panel and panels (from GUI/Artifacts/Usage scope):** Artifacts panel (runtime artifacts, 19 types, cost_usage, Show in Ledger/Usage); side-panel toggling for Git, Docker, Unraid, Artifacts, Chat, Files (single slot, last-click wins); layout save per project; OpenCode-style usage-on-message reference; AI in Git; multi-repo source control (or explicit deferral).
