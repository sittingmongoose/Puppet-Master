# Shard 003: Reference anchors used in this document

Source: `Plans/feature-list.md`

Source lines: L13-L124

Source SHA256: `daf7f1cca8827312aa019c3a55455321a664f207662709d2f3a3d74ff6a399b4`

---

## Reference anchors used in this document

<a id="crosswalk-ref"></a>
- **Crosswalk** — `Plans/Crosswalk.md`; ownership boundaries for shared primitives and cross-surface responsibilities.

<a id="storage-plan-ref"></a>
- **storage-plan** — `Plans/storage-plan.md`; canonical storage, projection, persistence, and artifact-retention semantics.

<a id="assistant-chat-design-ref"></a>
- **assistant-chat-design** — `Plans/assistant-chat-design.md`; canonical Assistant Chat behavior, modes, thread UX, and slash-command semantics.

<a id="media-generation-capabilities-ref"></a>
- **Media generation and capabilities** — `Plans/Media_Generation_and_Capabilities.md`; canonical for capability discovery and media generation routing. Feature summaries MUST defer Gemini media/account capability wording to the owner docs: Gemini Direct is key-only/API-key-backed, Gemini CLI is mode-dependent across OAuth/API-key/Google-credential rows, and stale-canon `mixed-account` or bare `key-exception` shorthand is not a complete feature description.

<a id="feature-debug-mode"></a>
### 6A. Debug Mode and shared debug-capable tooling
Debug Mode is the rewrite-era assistant investigation workflow: it treats diagnosis, instrumentation, evidence capture, verification, and cleanup as one coherent thread-scoped operation rather than as disconnected debugger gestures. The feature matters because Puppet Master must support automated, evidence-first debugging without collapsing Debug Mode into classical DAP debugger semantics or into opaque agent-only behavior.

**Key capabilities**
- Assistant Chat exposes `Debug` as a first-class assistant-led primary mode distinct from the classical `Debugger`, `DAP Debugger`, and `/DAP` surface
- Debug-capable tools remain shared platform capabilities across Assistant, Orchestrator, Interview, and delegated runs
- investigations use canonical `investigation_id`, `instrumentation_id`, visible Investigation Context, and runtime-artifact linkage rather than hidden evidence ingress
- instrumentation lifecycle states are explicit: `planned`, `active`, `collecting`, `cleanup_pending`, `cleaned`, and `cleanup_failed`
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
- document annotation and selection-to-chat review is a cross-surface feature with runtime `/safety` boundaries: prompt determinism, provider variance handling, audit/event clarity, precedence/conflict handling, thread isolation, resume/recovery, and sensitivity/privacy boundaries remain owned by the detailed contracts rather than by this feature index
- external `open-plan-annotator` research is background only: it demonstrated a browser-based local review UI opened from a hook/plugin flow, with deletion/comment/insertion/replacement actions, approve vs deny/request changes, and structured markdown feedback, but Puppet Master keeps the stronger review grammar in native in-app document/chat surfaces instead of browser mediation

**Detailed spec:** [assistant-chat-design](#assistant-chat-design-ref), `Plans/Contracts_V0.md`, `Plans/Prompt_Pipeline.md`

<a id="feature-gui-layout-shell"></a>
### 3. GUI layout and shell
The GUI layout and shell feature family describes the product's high-level workspace composition, especially the tab-first Orchestrator and narrow, worktree-first Source Control layout. These decisions are architectural, not cosmetic: they define which surface owns each kind of state, how users pivot between views, and how shell-adjacent workflows remain legible inside the rewrite.

**Key capabilities**
- Orchestrator remains tab-first with `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- `Progress` is the only widget-composed Orchestrator tab
- Source Control remains narrow and worktree-first
- Orchestrator shell summaries are tab-first rather than widget-first: `Progress` is widget-hosting, `Seams` is the `/package-oriented` replacement for stale `Tiers` language, `Node Graph Display` is preserved as the graph-patch lineage surface, and `Evidence`, `History`, and `Ledger` remain peer tabs rather than hidden composite-reference details.
- `Plans/Orchestrator_Page.md` may still explain widget-based Tiers as historical scaffolding, but feature copy treats `Tiers` as `/superseded` display vocabulary and keeps `Seams` plus package-oriented ownership as the live object model.
- Crosswalk-level summaries must name routing/open primitives directly: `route_target`, `OpenSubject`, `/open-by-identity`, FileManager `open-by-identity`, runtime-artifact envelopes, and artifact-opening behavior are shared cross-surface contracts rather than local GUI conveniences.

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

### Runtime storage and feature-summary alignment
Feature summaries must describe the runtime/storage/schema backbone as attempt-scoped execution state, not as mutable plan-shard state. `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `/plan_graph.schema.json`, `/project_plan_node.schema.json`, `/storage-plan.md`, and `/usage-feature.md` remain the detailed owners; this reference keeps only the feature-level consequences. The legacy `/phase/iteration`, `tier_runtime_record`, and `tier_id` vocabulary is compatibility history, while live behavior uses `attempt_id`, `scheduler_lane`, safe-point recovery, blocked lineage, package/seam/lane promotion, and the `/storage/schema` separation between immutable plan structure and mutable runtime projections. The `/seam/lane/promotion` summary is a feature alias for package completion, seam transition, lane/worktree identity, and promotion records owned by the runtime contracts.

Scheduler and recovery summaries must preserve deterministic scored ready-set behavior rather than drifting back to lexicographic `node_id` dispatch. Feature copy may name `node_id` for correlation, but dispatch is based on the scored ready-set, `attempt_id`, `scheduler_lane`, first-class safe-point metadata, remediation child lineage, `worktree-conflict` handling, graph-local retry lineage, blocked/runtime outcomes, and the `/runtime/storage` event stream. Any `tier-era` or lexical-dispatch phrasing is explicitly historical and must not own the current scheduler contract.

Account-switching summaries preserve both latest-state and append-only event requirements. Runtime identity features include `account.switched`, `recent_switch_reason`, `account_switch_reason`, effective/requested account fields, and account-pressure history as first-class `/runtime` records, so usage views can reconstruct the switch-history rather than reading only the newest account label.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Executor_Protocol.md

<a id="feature-git-worktree"></a>
### 6. Git and worktree
The Git/worktree feature family separates orchestration truth from concrete repository operations so that historical execution lineage survives even when a live worktree is cleaned up or re-bound. This prevents Source Control actions from erasing the audit trail that Orchestrator, Assistant Chat, and recovery flows rely on.

**Key capabilities**
- lane/worktree lifecycle is split between Orchestrator operational truth and Source Control concrete Git actions
- historical lane identity survives live worktree cleanup

**Detailed spec:** `Plans/GitHub_Integration.md`, `Plans/WorktreeGitImprovement.md`, [storage-plan](#storage-plan-ref)

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/usage-feature.md

<a id="feature-markdown-mermaid-rendering"></a>
