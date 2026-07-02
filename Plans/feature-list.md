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
- Orchestrator remains tab-first with `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- `Progress` is the only widget-composed Orchestrator tab
- Source Control remains narrow and worktree-first
- Orchestrator shell summaries are tab-first rather than widget-first: `Progress` is widget-hosting, `Plan Compile` is the plans-to-code projection tab, `Seams` is the `/package-oriented` replacement for stale `Tiers` language, `Node Graph Display` is preserved as the graph-patch lineage surface, and `Evidence`, `History`, and `Ledger` remain peer tabs rather than hidden composite-reference details.
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

**Detailed spec:** `Plans/FinalGUISpec.md`, `Concepts/PMConcept.html` as source-lineage input only, [Crosswalk](#crosswalk-ref)

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

### FL-002 - Feature List Scope And Reference Authority

```yaml
plan_unit_id: FL-002
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  feature-list.md is a reference inventory that prevents feature loss while rewrite implementation docs are written; Plans define target behavior and implementation may change, under DRY, Contracts, naming, and deterministic-default compliance constraints.
gui_related: false
gui_classification_reason: This unit defines reference-document scope and compliance authority, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: feature_list_scope_and_reference_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0001
preserved_exact_tokens:
- Puppet Master Feature List (Reference)
- Plans/DRY_Rules.md
- Plans/Contracts_V0.md
- Puppet Master
- No open questions
- Plans define target behavior; implementation may change
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Feature-list owns summary/reference inventory wording only; detailed behavior remains in the linked Plans.
owner_hints:
- Plans/feature-list.md
```

### FL-003 - Planned And New Feature Inventory Section

```yaml
plan_unit_id: FL-003
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Part 1 of the feature list groups planned and new features from Plans as a feature inventory section.
gui_related: false
gui_classification_reason: This unit preserves a document inventory section heading, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: planned_and_new_feature_inventory_section
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0002
preserved_exact_tokens:
- Part 1 - Planned and New Features (from Plans)
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This is a structural inventory section for feature summaries.
owner_hints:
- Plans/feature-list.md
```

### FL-004 - Reference Anchors And Media Capability Owner Deferral

```yaml
plan_unit_id: FL-004
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Feature-list reference anchors route summaries to Crosswalk, storage-plan, assistant-chat-design, and Media Generation owner docs, and media-account capability summaries must defer Gemini wording to those owners rather than using stale shorthand.
gui_related: false
gui_classification_reason: This unit preserves reference anchors and owner routing constraints, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: reference_anchors_and_media_capability_owner_deferral
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0003
preserved_exact_tokens:
- crosswalk-ref
- storage-plan-ref
- assistant-chat-design-ref
- media-generation-capabilities-ref
- MUST defer
- Gemini Direct
- key-only/API-key-backed
- Gemini CLI
- OAuth/API-key/Google-credential
- mixed-account
- key-exception
negative_constraints:
- Feature summaries must not treat stale-canon mixed-account or bare key-exception shorthand as a complete feature description.
compatibility_only_notes: []
stale_retired_dispositions:
- stale-canon `mixed-account` or bare `key-exception` shorthand is not a complete feature description.
owner_boundary_notes:
- Media generation and capability details are owned by Plans/Media_Generation_and_Capabilities.md and related owner docs.
owner_hints:
- Plans/feature-list.md
```

### FL-005 - Debug Mode Shared Tooling Summary

```yaml
plan_unit_id: FL-005
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Debug Mode is the rewrite-era assistant investigation workflow spanning diagnosis, instrumentation, evidence capture, verification, and cleanup with canonical investigation and instrumentation identity, shared debug-capable tooling, automated evidence-first behavior, and constrained remote Debug MVP scope.
gui_related: false
gui_classification_reason: This unit summarizes assistant-led debug workflow behavior and shared tooling, not GUI layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: debug_mode_shared_tooling_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0004
preserved_exact_tokens:
- Debug
- Debugger
- DAP Debugger
- /DAP
- investigation_id
- instrumentation_id
- visible Investigation Context
- planned
- active
- collecting
- cleanup_pending
- cleaned
- cleanup_failed
- Debug Automation Profile
- remote Debug MVP
- ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_Integration.md
negative_constraints:
- Debug Mode must not collapse into classical DAP debugger semantics or opaque agent-only behavior.
- Remote Debug MVP has no arbitrary ad-hoc remote attach and no silent local fallback.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Detailed Debug behavior is owned by assistant-chat-design, Run_Modes, and GitHub_Integration.
owner_hints:
- Plans/feature-list.md
```

### FL-006 - Rewrite Architecture Backbone Summary

```yaml
plan_unit_id: FL-006
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  The rewrite architecture feature family establishes the node graph, Feature Seam, Work Package, runtime blocked identity, requested/effective runtime identity, and route/open primitives as shared structural contracts so downstream plans do not redefine the foundation.
gui_related: false
gui_classification_reason: This unit summarizes runtime architecture primitives, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: rewrite_architecture_backbone_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0005
preserved_exact_tokens:
- node graph
- Feature Seam
- Work Package
- runtime blocked identity
- requested/effective runtime identity
- route/open primitives
- Crosswalk
- Plans/Orchestrator_Page.md
- Plans/Run_Graph_View.md
negative_constraints:
- Individual surfaces must not reinvent runtime identity, routing, or execution semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Crosswalk and related owner docs own the detailed cross-cutting primitive contracts.
owner_hints:
- Plans/feature-list.md
```

### FL-007 - Assistant Chat Shared Contract Consumer Boundary

```yaml
plan_unit_id: FL-007
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Assistant Chat is a consumer of shared platform contracts for requested/effective runtime identity, route_target, OpenSubject, OpenFile, runtime safety, prompt determinism, provider variance, audit/event clarity, precedence/conflict handling, thread isolation, resume/recovery, and sensitivity/privacy boundaries.
gui_related: false
gui_classification_reason: This unit preserves backend/runtime consumer-boundary behavior for Assistant Chat, not visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: assistant_chat_shared_contract_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0006
preserved_exact_tokens:
- assistant chat consumes shared requested/effective runtime identity
- route_target
- OpenSubject
- OpenFile
- runtime `/safety`
- prompt determinism
- provider variance handling
- audit/event clarity
- precedence/conflict handling
- thread isolation
- resume/recovery
- sensitivity/privacy boundaries
negative_constraints:
- Assistant Chat must not define an isolated subsystem with its own parallel schema for shared runtime identity and source-opening behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Assistant Chat summary copy consumes assistant-chat-design, Contracts_V0, and Prompt_Pipeline owner behavior.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Source span also includes native document annotation/review UX, which is split into FL-008.
```

### FL-008 - Native Document Annotation Review UX Summary

```yaml
plan_unit_id: FL-008
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Document annotation and selection-to-chat review remain native in-app document/chat surfaces with a stronger Puppet Master review grammar, while external open-plan-annotator research is background-only browser-hook/plugin inspiration.
gui_related: true
gui_classification_reason: This unit summarizes user-visible document annotation and review surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: native_document_annotation_review_ux_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0006
preserved_exact_tokens:
- document annotation
- selection-to-chat review
- open-plan-annotator
- hook/plugin flow
- deletion/comment/insertion/replacement actions
- approve vs deny/request changes
- structured markdown feedback
- native in-app document/chat surfaces
- browser mediation
negative_constraints:
- Puppet Master keeps native in-app document/chat review surfaces instead of browser mediation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This unit isolates the GUI/review UX portion of the chat-and-assistant feature span.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Split from FL-007 so GUI review UX is addressable separately from shared contract consumer boundaries.
```

### FL-009 - GUI Shell Composition Summary

```yaml
plan_unit_id: FL-009
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
    The GUI layout and shell family keeps Orchestrator tab-first, Progress widget-hosting only, Plan Compile as the plans-to-code projection tab, Seams/package-oriented ownership live, Node Graph/Evidence/History/Ledger as peer tabs, and Source Control narrow and worktree-first.
gui_related: true
gui_classification_reason: This unit summarizes workspace layout, tabs, and Source Control visible shell behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: gui_shell_composition_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0007
preserved_exact_tokens:
- Orchestrator
- tab-first
- Progress
- Seams
- Node Graph
- Evidence
- History
- Ledger
- Source Control
- narrow and worktree-first
- widget-based Tiers
- /superseded
- package-oriented ownership
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Tiers is superseded display vocabulary; Seams plus package-oriented ownership are the live object model.
owner_boundary_notes:
- FinalGUISpec, Orchestrator_Page, and Crosswalk own the detailed shell and object-model behavior.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Source span also includes non-GUI routing/open primitive summary, split into FL-010.
```

### FL-010 - Cross-Surface Routing Open Primitive Summary

```yaml
plan_unit_id: FL-010
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Crosswalk-level feature summaries must name routing/open primitives directly, including route_target, OpenSubject, /open-by-identity, FileManager open-by-identity, runtime-artifact envelopes, and artifact-opening behavior as shared cross-surface contracts.
gui_related: false
gui_classification_reason: This unit summarizes shared routing/open primitives, not layout or styling.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: cross_surface_routing_open_primitive_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0007
preserved_exact_tokens:
- route_target
- OpenSubject
- /open-by-identity
- FileManager `open-by-identity`
- runtime-artifact envelopes
- artifact-opening behavior
- shared cross-surface contracts
- local GUI conveniences
negative_constraints:
- Routing/open primitives must not be treated as local GUI conveniences.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Crosswalk and FileManager own the detailed routing/open primitive contracts.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Split from GUI shell composition so backend/shared routing contracts remain non-GUI.
```

### FL-011 - Orchestration Delegation And Graph Lineage Summary

```yaml
plan_unit_id: FL-011
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  The orchestration and subagents family keeps Package Overseer and Seam Overseer governance roles explicit, defaults node workers to subagent, defaults retry to fresh worker, and makes graph patching create new graph generations with historical lineage.
gui_related: false
gui_classification_reason: This unit summarizes execution delegation, supervision, retry, and graph lineage behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: orchestration_delegation_and_graph_lineage_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0008
preserved_exact_tokens:
- Package Overseer
- Seam Overseer
- subagent
- fresh worker
- graph generations
- historical lineage
- Plans/Executor_Protocol.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator_Page, Run_Graph_View, and Executor_Protocol own detailed orchestration behavior.
owner_hints:
- Plans/feature-list.md
```

### FL-012 - Usage Recovery Runtime Records Summary

```yaml
plan_unit_id: FL-012
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Usage, recovery, and analytics are runtime-native records using shared runtime identity, blocked-episode lineage, account pressure, and account-switch history so usage and recovery flows can reconstruct what happened through first-class runtime records.
gui_related: false
gui_classification_reason: This unit summarizes runtime identity and records, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: usage_recovery_runtime_records_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0009
preserved_exact_tokens:
- runtime-native records
- runtime-first
- not `tier_id`-first
- blocked-episode identity
- account pressure
- account-switch history
- shared runtime identity
negative_constraints: []
compatibility_only_notes:
- tier_id-first usage correlation is historical compatibility vocabulary, not live behavior.
stale_retired_dispositions: []
owner_boundary_notes:
- usage-feature, storage-plan, and Contracts_V0 own detailed usage and recovery contracts.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Source span also describes explanatory user-facing surfaces, split into FL-013.
```

### FL-013 - Usage Recovery Explanation Surface Summary

```yaml
plan_unit_id: FL-013
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Usage analysis and recovery flows explain what happened, who acted, and why the system transitioned between states.
gui_related: true
gui_classification_reason: This unit captures user-visible explanatory usage/recovery views.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: usage_recovery_explanation_surface_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0009
preserved_exact_tokens:
- explain what happened
- who acted
- why the system transitioned between states
- usage views
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This unit isolates user-visible explanation consequences from runtime records.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Split from FL-012 so GUI/user-visible explanation surfaces do not mix with backend runtime record ownership.
```

### FL-014 - Runtime Storage Scheduler And Account Switch Alignment Summary

```yaml
plan_unit_id: FL-014
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Feature summaries describe the runtime/storage/schema backbone as attempt-scoped execution state with attempt_id, scheduler_lane, safe-point recovery, blocked lineage, package/seam/lane promotion, /storage/schema separation, deterministic scored ready-set scheduling, and append-only account-switch events.
gui_related: false
gui_classification_reason: This unit summarizes runtime/storage/schema and scheduler/account identity behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: runtime_storage_scheduler_and_account_switch_alignment_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0010
preserved_exact_tokens:
- attempt_id
- scheduler_lane
- /storage/schema
- /phase/iteration
- tier_runtime_record
- tier_id
- scored ready-set
- node_id
- account.switched
- recent_switch_reason
- account_switch_reason
- requested account
- effective account
- ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Executor_Protocol.md
negative_constraints:
- Scheduler and recovery summaries must preserve deterministic scored ready-set behavior rather than drifting back to lexicographic `node_id` dispatch.
compatibility_only_notes:
- /phase/iteration, tier_runtime_record, and tier_id vocabulary is compatibility history.
stale_retired_dispositions: []
owner_boundary_notes:
- storage-plan, usage-feature, and Executor_Protocol own detailed runtime storage and scheduler behavior.
owner_hints:
- Plans/feature-list.md
```

### FL-015 - Git Worktree Lineage Summary

```yaml
plan_unit_id: FL-015
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  The Git/worktree feature family separates orchestration truth from concrete repository operations so historical execution lineage survives live worktree cleanup or rebinding, with lane/worktree lifecycle split between Orchestrator operational truth and Source Control Git actions.
gui_related: false
gui_classification_reason: This unit summarizes repository lineage and worktree ownership behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: git_worktree_lineage_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0011
preserved_exact_tokens:
- lane/worktree lifecycle
- Orchestrator operational truth
- Source Control concrete Git actions
- historical lane identity
- live worktree cleanup
- ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/usage-feature.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GitHub_Integration, WorktreeGitImprovement, storage-plan, Orchestrator_Page, Run_Graph_View, and usage-feature own detailed Git/worktree behavior.
owner_hints:
- Plans/feature-list.md
```

### FL-016 - Markdown Mermaid Browser Preview Surface Summary

```yaml
plan_unit_id: FL-016
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Markdown, Mermaid, HTML, browser, preview, and image rendering are first-class visible surfaces across chat, editor preview, document panes, planning documents, detached preview/browser windows, and Slint app image rendering.
gui_related: true
gui_classification_reason: This unit summarizes visible rendering, preview, browser, and image surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: markdown_mermaid_browser_preview_surface_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0012
preserved_exact_tokens:
- Markdown rendering
- Mermaid
- .mmd
- SVG (canonical)
- PNG (derived)
- HTML files
- rendered browser-like viewing
- Built-in browser
- rendered preview
- Image files render natively in the Slint app surface
- Detached preview/browser windows
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FinalGUISpec, PMConcept, and Crosswalk own detailed rendering and preview behavior.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Source span also includes source-canonical/trust and external-inspiration constraints, split into FL-017.
```

### FL-017 - Source Canonical Rendering Trust And External Inspiration Constraints

```yaml
plan_unit_id: FL-017
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Rendering summaries preserve source-canonical editing, avoid hidden WYSIWYG replacement, separate browser/editor-tab product surfaces from web/read discovery lineage, use trust tiers for generated previews and full HTML/browser mode, and treat xeditor-monorepo as inspiration only.
gui_related: false
gui_classification_reason: This unit defines source-canonical and trust boundary constraints, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: source_canonical_rendering_trust_and_external_inspiration_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0012
preserved_exact_tokens:
- source remains canonical
- no hidden document model
- hidden WYSIWYG
- web_search
- web_fetch
- read-website
- /site-reader
- restricted trust tier
- full HTML/browser mode
- xeditor-monorepo
- inspiration only
negative_constraints:
- Built-in browser, rendered preview, and click-to-context are separate from web/read tool lineage.
- Full Markdown support is centered on source-canonical editing plus rendered preview, not replacing Markdown with a hidden WYSIWYG model.
- xeditor-monorepo is not a strong candidate for direct adoption as an MVP-native PM core feature.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This unit isolates non-GUI trust/source constraints from visible rendering surfaces.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Split from FL-016 so trust and ownership constraints remain non-GUI.
```

### FL-018 - Source Control GitHub Actions Docker MVP Consolidation Scope

```yaml
plan_unit_id: FL-018
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  The Source Control, GitHub Actions, and Docker Manager MVP consolidation exposes lineage and operational pivots across coordinated first-class panels without fragmenting state ownership or inventing panel-local recovery semantics.
gui_related: true
gui_classification_reason: This unit summarizes first-class coordinated GUI panel scope for Source Control, GitHub Actions, and Docker Manager.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: sc_gha_docker_mvp_consolidation_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0013
preserved_exact_tokens:
- Source Control, GitHub Actions, and Docker Manager MVP Consolidation Addendum (2026-03-12)
- repository operations
- CI visibility
- container/runtime management
- first-class panels
- lineage and operational pivots
- panel-local recovery semantics
negative_constraints:
- Panel-local recovery semantics must not replace product-wide state ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FinalGUISpec, GitHub_Integration, and Containers_Registry_and_Unraid own detailed panel behavior.
owner_hints:
- Plans/feature-list.md
```

### FL-019 - Source Control GitHub Actions Docker GUI Views

```yaml
plan_unit_id: FL-019
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Source Control, GitHub Actions, and Docker Manager expose first-class side-panel views for source history/worktrees, workflow visibility/settings, containers/images/compose/registries/build/publish/Unraid, and project-focused Kubernetes.
gui_related: true
gui_classification_reason: This unit enumerates visible side-panel subviews and project-focused container/runtime views.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: sc_gha_docker_gui_views
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0014
preserved_exact_tokens:
- Source Control
- Changes
- History
- Graph
- Worktrees
- Branches / Stash
- GitHub Actions
- Current Branch
- Workflows
- Settings
- Docker Manager
- Containers
- Images
- Compose
- Registries
- Build / Bake
- Publish / Unraid
- project-focused Kubernetes
- ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Panel view details remain owned by FinalGUISpec, GitHub_Integration, and Containers_Registry_and_Unraid.
owner_hints:
- Plans/feature-list.md
```

### FL-020 - Run To Repo Orchestration And Cross Panel Pivots

```yaml
plan_unit_id: FL-020
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Run-to-repo lineage is a GUI cross-surface differentiator across Orchestrator, Source Control, GitHub Actions, Docker Manager, Run Graph, and runtime/publish/Kubernetes rollout surfaces, with explicit cross-panel pivots.
gui_related: true
gui_classification_reason: This unit summarizes user-visible orchestration pivots across panels and run history/details.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: run_to_repo_orchestration_and_cross_panel_pivots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0015
preserved_exact_tokens:
- Run-to-repo lineage
- to-repo
- destination-panel
- PR
- Actions runs
- /deploy
- Operation receipts
- Open in Source Control
- Open in GitHub Actions
- Open in Docker Manager
- publish/runtime/template
- Kubernetes rollout linkage
- ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator_Page, Run_Graph_View, and storage-plan own detailed lineage and pivot behavior.
owner_hints:
- Plans/feature-list.md
```

### FL-021 - Panel State Persistence And Lineage Receipts

```yaml
plan_unit_id: FL-021
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Panel state persists per project where applicable, and run-to-repo lineage storage preserves lineage detail level, derived artifact category visibility, retain-after-cleanup settings, event/storage joins, SCM/Actions/publish/Kubernetes identifiers, disabled fallback, and tradeoff visibility.
gui_related: false
gui_classification_reason: This unit summarizes persistence and event/storage receipt lineage, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: panel_state_persistence_and_lineage_receipts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0016
preserved_exact_tokens:
- persisted per project
- lineage detail level
- derived artifact category visibility
- retain-after-cleanup `/settings`
- /event/storage
- SCM
- Actions
- publish
- Kubernetes identifiers
- partial chains
- /disabled
- /tradeoffs
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- storage-plan and panel owner docs own detailed persistence and lineage receipt behavior.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Source span also includes visible command-family/product-wide command behavior, split into FL-022.
```

### FL-022 - Canonical Panel Command Families And Product Wide Blocked Rules

```yaml
plan_unit_id: FL-022
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Source Control, GitHub Actions, Docker Manager, and cross-surface pivots use new canonical command families, while blocked-state and requested-vs-effective rules remain product-wide behavior rather than panel-local polish.
gui_related: true
gui_classification_reason: This unit covers user-invoked command families and visible blocked-state/requested-vs-effective behavior across panels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: canonical_panel_command_families_and_product_wide_blocked_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0016
preserved_exact_tokens:
- new canonical command families
- Source Control
- GitHub Actions
- Docker Manager
- cross-surface pivots
- blocked-state
- requested-vs-effective
- product-wide behavior
- panel-local polish
- ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Decision_Policy.md
negative_constraints:
- Blocked-state and requested-vs-effective rules must not be reduced to panel-local polish.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- UI_Command_Catalog, Permissions_System, and Decision_Policy own detailed command and blocked-state rules.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Split from FL-021 so command-facing GUI behavior is separate from persistence receipts.
```

### FL-023 - Scheduler Recovery Invariants Summary

```yaml
plan_unit_id: FL-023
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Runtime scheduler recovery summaries preserve deterministic scored ready-set scheduling, scheduler_pass_id queue-analysis passes, immutable attempt lineage, explicit retry/blocking/remediation/safe-point fields, remediation child lineage, and pre-lock versus post-lock graph-integrity behavior.
gui_related: false
gui_classification_reason: This unit summarizes runtime scheduler and recovery invariants, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: scheduler_recovery_invariants_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0017
preserved_exact_tokens:
- deterministic scored ready-set scheduling
- scheduler_pass_id
- attempt_id
- safe-point recovery
- remediation child lineage
- pre-lock-only draft decomposition fallback
- post-lock graph-integrity stop behavior
- lexical dispatch
- node-centric retry commands
negative_constraints:
- Feature summaries must remove or revise older phrasing that implies lexical dispatch, node-centric retry commands, or attention_required as the only paused clarification state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Executor_Protocol, Run_Graph_View, and storage-plan own detailed scheduler recovery behavior.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Source span also includes visible recovery states and Artifacts panel summary, split into FL-024.
```

### FL-024 - Visible Recovery States And Artifacts Panel Summary

```yaml
plan_unit_id: FL-024
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Recovery summaries preserve visible attention_required versus blocked states across wizard, thread, and dashboard surfaces, plus Artifacts panel behavior with runtime artifacts, 19 types, cost_usage, Ledger/Usage pivots, and single-slot side-panel toggling.
gui_related: true
gui_classification_reason: This unit summarizes user-visible recovery states, dashboard/thread/wizard states, and artifacts panel behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: visible_recovery_states_and_artifacts_panel_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0017
preserved_exact_tokens:
- attention_required
- blocked
- wizard/thread/dashboard states
- Artifacts panel
- runtime artifacts
- 19 types
- cost_usage
- Show in Ledger/Usage
- Git
- Docker
- Unraid
- Artifacts
- Chat
- Files
- single slot
- last-click wins
- OpenCode-style usage-on-message reference
- AI in Git
- multi-repo source control
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This unit isolates user-visible recovery and artifacts surface summaries from scheduler invariants.
owner_hints:
- Plans/feature-list.md
split_recommendation_reason: Split from FL-023 so GUI/user-visible recovery and panel behavior are separate from runtime scheduler invariants.
```

### FL-025 - Web Tools Skills Planning Approval Owner Alignment Summary

```yaml
plan_unit_id: FL-025
unit_type: requirement
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  Feature-list summaries align web tools, skills, planning, permissions, approval, provider/server profiles, tool/TODO/question/operation-card/visualizer behavior, and Feature Seam help language to current owner docs instead of restating lower-level contracts.
gui_related: false
gui_classification_reason: This unit summarizes owner alignment for web tools, skills, planning, permissions, and approval behavior, not GUI layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This feature-list PlanUnit preserves summary/reference behavior without replacing the detailed owner docs named by ContractRefs or detailed spec links.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_summary_drift
reasoning_tier: standard
context_scope: feature_list_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: web_tools_skills_planning_approval_owner_alignment_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0018
preserved_exact_tokens:
- six-tool web family
- batch_webfetch
- batch_webextract
- /web
- /web search
- /web fetch
- /web extract
- /web research
- /web crawl
- /web map
- /skill
- deprecated `/cancel` alias
- Agent Config
- Settings
- connection_profile_id
- Feature Seam
- ELI5
- /help
- ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Skills_System.md
negative_constraints:
- Feature-list summaries must stay accurate to owner sections instead of restating lower-level contracts.
- Help and teaching surfaces may expose Feature Seam through ELI5 language in /help, but that aliasing cannot rename the canonical graph object or hide the owning feature-seam contract.
compatibility_only_notes: []
stale_retired_dispositions:
- Deprecated /cancel alias handling remains a compatibility/retirement detail.
owner_boundary_notes:
- Tools, Permissions_System, Skills_System, Provider_OpenCode, Multi-Account, and runtime identity owner docs own detailed behavior.
owner_hints:
- Plans/feature-list.md
```

### FL-001 - Feature List Retired Source-Preserving Bridge

```yaml
plan_unit_id: FL-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/feature-list.md
canonical_text: >-
  The former feature-list source-preserving bridge is retired after Phase 2B atomized feature-list-S0001 through feature-list-S0018 into FL-002 through FL-025 and structurally dispositioned the owner map, PlanUnits heading, and Migration Coverage. FL-001 remains only as migration lineage for the retired bridge span and must not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior; coverage_map still preserves S0021 gui_related_inferred=true from the historical broad bridge span.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- FL-001 no longer uses the source-preserving PlanUnit compile hint.
- FL-002 through FL-025 own product summary coverage for feature-list-S0001 through feature-list-S0018.
- feature-list-S0019, S0020, and S0022 are structural owner-map, heading, and migration-coverage dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/feature-list.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:feature-list-S0021
preserved_exact_tokens:
- FL-001
- source_preserving_planunit
- source_preserving_bridge_retired
- FL-002
- FL-025
- feature-list-S0001
- feature-list-S0022
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- Do not remap atomized feature-list spans back to FL-001.
- Do not treat the retired bridge as implementation-ready product summary coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit.
compatibility_only_notes:
- The old source-preserving bridge is retained only so migration lineage and historical references to FL-001 remain auditable.
stale_retired_dispositions: []
owner_boundary_notes:
- FL-002 through FL-025 own product summary coverage for S0001-S0018.
- S0019, S0020, and S0022 are structural owner-map, PlanUnits-heading, and Migration Coverage dispositions.
owner_hints:
- Plans/feature-list.md
```
## Migration Coverage

Original hash: `0390ce7b79dff02042ca161249fd663705f94cc6c735cb0e4122604267595863`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B batch 053 atomized `feature-list-S0001` through `feature-list-S0018` into `FL-002` through `FL-025`, structurally dispositioned `feature-list-S0019`, `feature-list-S0020`, and `feature-list-S0022`, and retired `FL-001` as migration lineage for `feature-list-S0021`. No residual source-preserving feature-list PlanUnit remains. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
