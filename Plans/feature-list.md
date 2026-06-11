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
## Part 1A - Markdown, Mermaid, and Unified Rendering Addendum (2026-03-07)
This addendum captures the rewrite's document and preview rendering model: source remains canonical, rendered output is first-class, and richer preview experiences never replace the underlying editable artifact. The same rendering pipeline must support chat, planning docs, editor preview, and future deeper planning surfaces without introducing a hidden document model.

**Key capabilities**

- First-class Markdown rendering in chat, editor preview, document panes, and planning documents.
- Native Mermaid detection/rendering from fenced `mermaid` blocks and `.mmd` files.
- Mermaid export as SVG (canonical) and PNG (derived).
- Full Markdown support centered on source-canonical editing plus rendered preview, not on replacing Markdown with a hidden WYSIWYG model.
- HTML files support both source editing and full rendered browser-like viewing.
- Built-in browser, rendered preview, and click-to-context are separate from web/read tool lineage: `web_search`, `web_fetch`, `read-website`, and `/site-reader` remain discovery or Site Reader/read-path concepts and must not own the visible editor-tab/detached browser product surface.
- Image files render natively in the Slint app surface.
- Detached preview/browser windows are first-class, cross-platform guaranteed behavior.
- Embedded webviews are optional optimizations, not required product invariants.
- Generated Markdown/Mermaid previews use a restricted trust tier; full HTML/browser mode uses a separate trust tier.
- Preview-mode edits are limited to validated structured commands and otherwise fall back to source editing.
- Planning documents, including future Deep Plan Mode surfaces, use the same Markdown/Mermaid pipeline and canonical-source rules.
- `xeditor-monorepo` is useful as interaction inspiration only; it is not a strong candidate for direct adoption as an MVP-native PM core feature.

**Detailed spec:** `Plans/FinalGUISpec.md`, `Plans/PMConcept.html`, [Crosswalk](#crosswalk-ref)

<a id="feature-sc-gha-docker"></a>
## Source Control, GitHub Actions, and Docker Manager MVP Consolidation Addendum (2026-03-12)
This consolidation addendum defines the rewrite-era MVP for repository operations, CI visibility, and container/runtime management as coordinated first-class panels. Its goal is to expose lineage and operational pivots across source control, workflows, and containers without fragmenting state ownership or inventing panel-local recovery semantics.

**Key capabilities**
### GUI and views
- first-class `Source Control` side-panel surface with Changes, History, Graph, Worktrees, and Branches / Stash
- first-class `GitHub Actions` side-panel surface with Current Branch, Workflows, and Settings
- first-class `Docker Manager` side-panel surface with Containers, Images, Compose, Registries, Build / Bake, Publish / Unraid, and project-focused Kubernetes
- external `/current` reference research validates these as parity-plus feature families, not speculative extras: Source Control carries `/history/stash/merge-editor/worktree` expectations, GitHub Actions readiness is split into name/scope-based sub-capabilities, and Docker/Kubernetes scope is project-focused rather than cluster-administration.
- Source Control keeps `Worktrees` as the primary subview and `/object` list; lane-first is an overlay or filter when lane/package ownership is known, not the replacement object model.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md

### Orchestration and recovery
- run-to-repo lineage and worktree ownership surfaced across Orchestrator tabs
- `Run-to-repo lineage` remains a GUI cross-surface differentiator, not optional polish: Orchestrator run detail and history rows show `to-repo` pivots into Source Control, GitHub Actions, and Docker Manager `destination-panel` views so users can trace which worktree, branch, commits, PR, Actions runs, publish artifacts, `/deploy` outputs, and Operation receipts came from a given run or `/attempt`.
- run-to-workflow and workflow-to-diff correlation
- publish/runtime/template and Kubernetes rollout linkage surfaced in Orchestrator and Run Graph
- cross-surface `Open in Source Control`, `Open in GitHub Actions`, and `Open in Docker Manager` pivots

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md

### State and commands
- Source Control, GitHub Actions, and Docker Manager panel state persisted per project where applicable
- Run-to-repo lineage state includes lineage detail level, derived artifact category visibility, and retain-after-cleanup `/settings`; `/event/storage` receipt joins preserve SCM, Actions, publish, and Kubernetes identifiers across restarts, while partial chains remain visible with unresolved labels instead of hiding known lineage. `/disabled` fallback and `/tradeoffs` are explicit: lineage must survive cleanup and restarts without overclaiming incomplete joins.
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

## Web tools, skills, planning, and approval owner alignment (2026-04-04)

Rewrite-era feature summaries must align to the current owner docs for web tools, skills, planning, permissions, and approval surfaces.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Skills_System.md

Summary:
- PM owns a six-tool web family plus `batch_webfetch` and `batch_webextract`
- slash-command canon uses the final reconciled built-in set with bare `/web` help/autocomplete, `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, `/web map`, `/skill` discovery/invocation behavior, and deprecated `/cancel` alias handling
- Agent Config owns Personas + Skills while Settings owns providers/accounts/models/permissions
- provider/server-profile feature summaries preserve `connection_profile_id` while deferring the profile model to `Plans/Provider_OpenCode.md`, `Plans/Multi-Account.md`, and shared runtime identity contracts
- refined tool behavior for web, LSP, skill, permission, planning/TODO, question, operation-card, and visualizer summaries defers to the repaired owner sections
- Feature-list summaries remain consumers of those owner docs for repaired web, question, tool, TODO, permission, operation-card, and visualizer behavior; summary copy must stay accurate to the owner sections instead of restating lower-level contracts.
- Help and teaching surfaces may expose `Feature Seam` through user-facing ELI5 language in `/help`, but that aliasing cannot rename the canonical graph object or hide the owning feature-seam contract.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/feature-list.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### FL-001 - Puppet Master Feature List (Reference) Source-Preserving PlanUnit

```yaml
plan_unit_id: FL-001
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: Plans/feature-list.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:feature-list-S0018
preserved_exact_tokens:
- Puppet Master Feature List (Reference)
- Part 1 - Planned and New Features (from Plans)
- Reference anchors used in this document
- 6A. Debug Mode and shared debug-capable tooling
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_Integration.md'
- 1. Rewrite and architecture
- 2. Chat and assistant
- 3. GUI layout and shell
- 4. Orchestration and subagents
- 5. Usage, recovery, and analytics
- Runtime storage and feature-summary alignment
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Executor_Protocol.md'
- 6. Git and worktree
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/usage-feature.md'
- Part 1A - Markdown, Mermaid, and Unified Rendering Addendum (2026-03-07)
- Source Control, GitHub Actions, and Docker Manager MVP Consolidation Addendum (2026-03-12)
- GUI and views
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md'
- Orchestration and recovery
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md'
- State and commands
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Decision_Policy.md'
- Runtime Scheduler Recovery Summary Consolidation Addendum (2026-03-09)
- Web tools, skills, planning, and approval owner alignment (2026-04-04)
negative_constraints:
- Scheduler and recovery summaries must preserve deterministic scored ready-set behavior rather than drifting back to lexicographic `node_id` dispatch. Feature copy may name `node_id` for correlation, but dispatch is based on the scored ready-set, `attempt_id`, `scheduler_lane`, first-class safe-point
- '- Built-in browser, rendered preview, and click-to-context are separate from web/read tool lineage: `web_search`, `web_fetch`, `read-website`, and `/site-reader` remain discovery or Site Reader/read-path concepts and must not own the visible editor-tab/detached browser product surface.'
compatibility_only_notes:
- Feature summaries must describe the runtime/storage/schema backbone as attempt-scoped execution state, not as mutable plan-shard state. `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `/plan_graph.schema.json`, `/project_plan_
stale_retired_dispositions:
- '- **Media generation and capabilities** — `Plans/Media_Generation_and_Capabilities.md`; canonical for capability discovery and media generation routing. Feature summaries MUST defer Gemini media/account capability wording to the owner docs: Gemini Direct is key-only/API-key-backed, Gemini CLI is mod'
- '- Orchestrator shell summaries are tab-first rather than widget-first: `Progress` is widget-hosting, `Seams` is the `/package-oriented` replacement for stale `Tiers` language, `Node Graph Display` is preserved as the graph-patch lineage surface, and `Evidence`, `History`, and `Ledger` remain peer ta'
- '- slash-command canon uses the final reconciled built-in set with bare `/web` help/autocomplete, `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, `/web map`, `/skill` discovery/invocation behavior, and deprecated `/cancel` alias handling'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- **storage-plan** — `Plans/storage-plan.md`; canonical storage, projection, persistence, and artifact-retention semantics.'
- '- **assistant-chat-design** — `Plans/assistant-chat-design.md`; canonical Assistant Chat behavior, modes, thread UX, and slash-command semantics.'
- '- **Media generation and capabilities** — `Plans/Media_Generation_and_Capabilities.md`; canonical for capability discovery and media generation routing. Feature summaries MUST defer Gemini media/account capability wording to the owner docs: Gemini Direct is key-only/API-key-backed, Gemini CLI is mod'
- '- investigations use canonical `investigation_id`, `instrumentation_id`, visible Investigation Context, and runtime-artifact linkage rather than hidden evidence ingress'
- The rewrite architecture feature family establishes the node graph, seam/package ownership, and canonical cross-cutting primitives as the structural backbone of the product. Instead of allowing individual surfaces to reinvent runtime identity, routing, or execution semantics, this feature consolidat
- '- node graph is the canonical orchestration model'
- '- runtime blocked identity, requested/effective runtime identity, and route/open primitives are canonical cross-cutting contracts'
- The chat-and-assistant feature family ensures Assistant Chat is a consumer of shared platform contracts rather than an isolated subsystem with its own parallel schema. That alignment keeps navigation, runtime disclosure, and source-opening behavior predictable across chat, orchestration, and support
- 'This addendum captures the rewrite''s document and preview rendering model: source remains canonical, rendered output is first-class, and richer preview experiences never replace the underlying editable artifact. The same rendering pipeline must support chat, planning docs, editor preview, and future'
- '- Mermaid export as SVG (canonical) and PNG (derived).'
- '- Full Markdown support centered on source-canonical editing plus rendered preview, not on replacing Markdown with a hidden WYSIWYG model.'
- '- Planning documents, including future Deep Plan Mode surfaces, use the same Markdown/Mermaid pipeline and canonical-source rules.'
- '- new canonical command families for Source Control, GitHub Actions, Docker Manager, and cross-surface pivots'
- This scheduler recovery addendum standardizes how retry, blocked, remediation, and safe-point behavior must be summarized across rewrite docs. It exists to prevent regressions back to older lexical-dispatch phrasing and to ensure every related feature description speaks in terms of canonical schedul
- '## Web tools, skills, planning, and approval owner alignment (2026-04-04)'
- Rewrite-era feature summaries must align to the current owner docs for web tools, skills, planning, permissions, and approval surfaces.
- '- refined tool behavior for web, LSP, skill, permission, planning/TODO, question, operation-card, and visualizer summaries defers to the repaired owner sections'
- '- Feature-list summaries remain consumers of those owner docs for repaired web, question, tool, TODO, permission, operation-card, and visualizer behavior; summary copy must stay accurate to the owner sections instead of restating lower-level contracts.'
- '- Help and teaching surfaces may expose `Feature Seam` through user-facing ELI5 language in `/help`, but that aliasing cannot rename the canonical graph object or hide the owning feature-seam contract.'
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `0390ce7b79dff02042ca161249fd663705f94cc6c735cb0e4122604267595863`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `feature-list-S0001` through `feature-list-S0018` are preserved in place and mapped in `coverage_map.jsonl` to `FL-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
