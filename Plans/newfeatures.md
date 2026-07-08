# New Features Implementation Plan


## Plan Document Status
This document remains a high-level feature summary and does not re-own orchestration canon.
Assistant/chat display requirements consume runtime-state and runtime identity from owner docs such as `Plans/Prompt_Pipeline.md`, `Plans/Contracts_V0.md`, and `Plans/assistant-chat-design.md`; they must not create assistant-local schema or re-own those semantics in this summary.

## Rewrite alignment (2026-03-17)
The rewrite is aligned to these canonical decisions:
- node graph is the execution model
- `Feature Seam` and `Work Package` replace tiers as first-class orchestration objects
- runtime blocked identity replaces request-centric approval identity as canonical action scope
- shared requested/effective runtime identity spans assistant, interview, builders, overseers, and node workers
- `route_target` and `OpenSubject` are canonical navigation and identity-open primitives
- Source Control remains worktree-first while Orchestrator carries lane/package/seam operational context
- Gemini auth plan-map status is `RECONCILE complete` for this high-level feature summary: Gemini Direct remains the active direct API provider, Antigravity CLI is the active Google-owned CLI-runtime provider, Gemini CLI is retired/source-lineage only, API-key access is a scoped exception rather than the default UI posture, and consumer docs inherit requested/effective auth/account identity from `Plans/Multi-Account.md`, `Plans/Contracts_V0.md`, `Plans/Prompt_Pipeline.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/feature-list.md`, `Plans/assistant-chat-design.md`, `Plans/newtools.md`, `Plans/00-plans-index.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/Orchestrator_Page.md` instead of restating stale Gemini API-key-default language.
- Rewrite-root summaries are now owned here at feature-summary level: `Plans/Decision_Log.md` and `/Decision_Log.md` are not sufficient as a rewrite-era decision ledger when they only carry 2026-02-27 OpenCode extraction entries. This high-level GUI/spec summary must name the graph-owned `Feature Seam`, `Work Package`, `Package Overseer`, `Seam Overseer`, worktree-first Source Control with `/worktree` lane split, requested/effective runtime identity, blocked-episode identity over HITL request identity, `route_target`, `OpenSubject`, `projection_freshness`, and `projection_health`.
- `Plans/**` and `/spec` summaries must reflect feature seam and work package governance objects in GUI copy; absence from broad plan search is treated as stale summary drift, not as permission to omit them. `rewrite-tie-in-memo.md` and rewrite-tie-in-memo remain route/open references for `/open`, `/health`, `/runtime`, rewrite-root routing, `/seam/package`, and blocked/runtime approval identity.
- Run Graph summary language must preserve the under-modeled command and struct gaps: `/corroboration/promotion/graph-patch`, concern, corroboration, promotion, graph-patch, trust state, and command-catalog fields are required feature families rather than high-level placeholders.
- Runtime object summaries refresh `object_kind` around rewrite-era lineage objects. First-class target kinds include Concern, Graph Patch, Feature Seam, Work Package, History, Ledger, `/timeline`, usage-linked receipts, Crosswalk.md `/open` contracts, and the distinction between a chronological History story and a structured durable Ledger inspection surface.
- `feature-list`, `feature-list.md`, and `newfeatures.md` are broad drift amplifiers; their summaries must stay aligned to owner docs and cannot compress detailed rules, field schemas, examples, or operational policies into vague high-level copy.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Orchestrator_Page.md

## Executive Summary
Puppet Master's rewrite-era feature set is organized around graph-native execution, stable runtime identity, durable lineage, and explicit cross-surface boundaries rather than around tier-era decomposition and request-centric recovery.

## High-level feature themes
### 1. Orchestration and governance
- package-local governance through `Package Overseer`
- seam-level integration governance through `Seam Overseer`
- promotion, corroboration, concern, graph-patch, and recovery records as first-class governance/runtime objects

### 2. Runtime identity and provider behavior
- requested/effective runtime identity across personas, models, accounts, and execution roles
- multi-account switching with concrete account binding and durable switch/pressure history

### 3. UI and navigation
- tab-first Orchestrator
- worktree-first Source Control
- route/open primitives shared across chat, runtime, usage, artifacts, and orchestration
- the coherent left-panel `/product` model is MVP: Source Control, GitHub Actions, Docker Manager, Assistant/Chat, Files, Artifacts/Runtime, Usage, and Settings are first-class owner surfaces, not a bag of individually listed `/underdefined` pieces

### 3A. Workbench and feature-cluster lessons
- PM preserves the strongest competitive feature clusters as product requirements: visible plans `/tasks/artifacts/approval` state, multi-surface orchestration across editor, terminal, browser/preview, docs, and review, reusable diff/review pipelines with hunk-level actions instead of one-off compare UIs, project/framework autodetection, honest `/loading/indexing` and degraded state, durable tabs `/splits/workspace` recovery, `/reconnect/offline` resilience with explicit cache `/read-only/fallback` messaging, source-canonical rich previews, virtualized lazy file trees, background indexing/search, IME correctness, and skepticism toward demo-friendly thin-wrapper UIs.
- PM may learn breadth from file-heavy systems and runtime seams from delegated-backend `/container/control-plane` products, but it must not become a monolithic request layer or delegate core `/file-manager/diff/LSP`, editor, storage, routing, or shell ownership to an upstream IDE. A strong native Rust + Slint `/workbench` keeps file-manager operations as typed services with policy/error handling, treats remote/runtime orchestration as an explicit control-plane with `/bootstrap` diagnostics, and bounds any external editor/workbench interop as a subsystem rather than the hidden owner.

### 4. Recovery and historical truth
- blocked episodes as canonical recovery anchors
- graph generations retained as visible lineage
- historical runs distinct from superseded objects unless explicit lineage says otherwise

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

## 24. Browser preview and code-context integration

### 24.1 Built-in browser preview
The rewrite includes a built-in browser preview surface for live rendering of web content produced by the active project. This preview is part of the product's visual-debugging and UI-validation loop rather than a detached convenience viewer, so it must participate in shared navigation, evidence capture, and source-opening flows.
Agents may drive the built-in browser as a first-class web debug adapter for navigation, reproduction steps, and visible `/client-side` signal capture; this must not degrade into external-automation-only or paste-only workflows.

### 24.2 Relationship to Built-in Browser and Click-to-Context
The built-in browser preview provides live rendering of web content. Click-to-context allows users to click elements in the browser preview to navigate to the corresponding source code. This bridges the visual output and code representation by making rendered UI state, editable source, and assistant context part of the same troubleshooting and iteration loop instead of three separate tools.

Integration points:
- browser preview ↔ editor (`click-to-source`)
- browser preview ↔ chat (`screenshot-to-context`)
- browser DevTools ↔ debug mode (`DOM inspection as evidence`)

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Glossary.md

## Web tools, provider routing, and shared UI alignment addendum (2026-04-04)

The promoted rewrite feature set includes the repaired web/provider/question/planning canon rather than the earlier summarized placeholders.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

Cross-reference consumers remain explicit: `Plans/feature-list.md` keeps new web-tool, question-system, TODO-schema, and Mermaid-rendering feature summaries accurate; `Plans/Prompt_Pipeline.md` keeps prompt context injection aligned to current web-tool names; `Plans/Progression_Gates.md` keeps tool availability and permission semantics gateable; `Plans/OpenCode_Coverage_Matrix.md` tracks slash-command, MCP, and tool-operation coverage; `Plans/newfeatures.md` keeps promoted-feature cross-references to web-tool enhancements current; `Plans/MiscPlan.md` keeps cross-cutting slash command references and stale lists aligned; `Plans/FileManager.md` keeps browser surface and Mermaid rendering language consistent with Part H inline visualizer behavior; and `Plans/OpenCode_Deep_Extraction.md` remains extraction/reference lineage rather than a competing owner.

Highlights:
- six canonical web operations plus native batch variants
- routing-aware provider disclosure and support-tier visibility
- reserved slash-command set, `/web` family behavior, and Agent Config naming stay aligned to their owner docs rather than older promoted-feature summaries
- shared question and TODO schemas across chat, widgets, storage, and delegated work
- distinct Mermaid and inline visualizer behavior
- four-step approval ladder and MCP owner-doc alignment
- Docker reference parity combines `docker/vscode-extension` / `/vscode-extension` authoring cues with Container Tools management and `/registry` behavior; Docker Hub management parity is not satisfied by the extension reference alone

## Owner / Consumer Map

This feature-summary document preserves the owner and consumer boundaries stated in its source sections. `Plans/newfeatures.md` owns high-level rewrite-era feature-summary coverage only; normative behavior remains with the referenced owner docs, ContractRefs, and boundary notes.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### N-002 - Summary Scope And Assistant Runtime Boundary

```yaml
plan_unit_id: N-002
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  Plans/newfeatures.md is a high-level feature summary and does not re-own orchestration canon. Assistant/chat display
  requirements consume runtime-state and runtime identity from Plans/Prompt_Pipeline.md, Plans/Contracts_V0.md, and
  Plans/assistant-chat-design.md, and they must not create assistant-local schema or re-own those semantics in this
  summary.
gui_related: false
gui_classification_reason: The unit defines summary scope and cross-owner runtime boundaries rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- newfeatures.md remains a high-level feature summary.
- Assistant/chat display requirements consume runtime-state and runtime identity from owner docs.
- Assistant/chat display requirements do not create assistant-local schema.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_drift
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: summary_scope_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0002
preserved_exact_tokens:
- Plan Document Status
- high-level feature summary
- Plans/Prompt_Pipeline.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
negative_constraints:
- Assistant/chat display requirements must not create assistant-local schema or re-own runtime identity semantics in this summary.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Prompt_Pipeline.md, Plans/Contracts_V0.md, and Plans/assistant-chat-design.md own the runtime-state and runtime identity semantics consumed here.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs: []
```

### N-003 - Rewrite Feature-Set Organizing Principle

```yaml
plan_unit_id: N-003
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  Puppet Master's rewrite-era feature set is organized around graph-native execution, stable runtime identity, durable
  lineage, and explicit cross-surface boundaries rather than tier-era decomposition or request-centric recovery.
  Rewrite summary language preserves node graph execution, Feature Seam, Work Package, runtime blocked identity, shared
  requested/effective runtime identity, worktree-first Source Control, route_target, OpenSubject, projection_freshness,
  projection_health, and feature-summary alignment to the referenced owner docs.
gui_related: false
gui_classification_reason: The unit summarizes rewrite-era architecture and feature organization rather than GUI presentation.
split_recommended: true
depends_on:
- N-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Feature Seam and Work Package remain first-class orchestration objects in the summary.
- Runtime blocked identity replaces request-centric approval identity in this summary.
- The executive summary stays aligned to graph-native execution, stable runtime identity, durable lineage, and cross-surface boundaries.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: summary_alignment
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: rewrite_feature_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0004
preserved_exact_tokens:
- node graph
- Feature Seam
- Work Package
- runtime blocked identity
- requested/effective runtime identity
- route_target
- OpenSubject
- projection_freshness
- projection_health
- Executive Summary
negative_constraints:
- The summary must not fall back to tier-era decomposition or request-centric recovery.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Decision_Log.md and Plans/Crosswalk.md remain referenced decision/crosswalk sources.
- Plans/Orchestrator_Page.md owns detailed Orchestrator behavior.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Orchestrator_Page.md'
split_recommendation_reason: newfeatures-S0003 mixes orchestration, identity, GUI summary, routing, and runtime-object summary obligations.
```

### N-004 - Provider Auth Summary Reconciliation

```yaml
plan_unit_id: N-004
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  Gemini auth plan-map status is RECONCILE complete for this high-level feature summary. Gemini Direct remains the active
  direct API provider, Antigravity CLI is the active Google-owned CLI-runtime route, Gemini CLI wording is retired
  source-lineage only, API-key access is a scoped exception rather than the default UI posture, and consumers inherit
  requested/effective auth and account identity from the owner docs instead of restating stale Gemini API-key-default language.
gui_related: true
gui_classification_reason: The unit preserves provider-auth UI posture and requested/effective identity disclosure summary.
split_recommended: false
depends_on:
- N-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini Direct remains active, Antigravity CLI is the active CLI-runtime route, and Gemini CLI remains retired/source-lineage only in this summary.
- API-key access remains a scoped exception rather than the default UI posture.
- Stale Gemini API-key-default language is not revived.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_auth_drift
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: provider_auth_summary_reconciliation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0003
preserved_exact_tokens:
- RECONCILE complete
- Gemini Direct
- Gemini CLI
- API-key access
- requested/effective auth/account identity
negative_constraints:
- API-key access must not be summarized as the default UI posture.
- Consumers must not restate stale Gemini API-key-default language.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale Gemini API-key-default language is retired for this high-level feature summary.
owner_boundary_notes:
- Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/Prompt_Pipeline.md, Plans/CLI_Bridged_Providers.md, Plans/feature-list.md, Plans/assistant-chat-design.md, Plans/newtools.md, Plans/00-plans-index.md, Plans/Runtime_Artifacts_Panel.md, and Plans/Orchestrator_Page.md own the detailed requested/effective auth and account semantics consumed here.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Orchestrator_Page.md'
```

### N-005 - Route/Open Projection Summary Alignment

```yaml
plan_unit_id: N-005
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  Plans/** and /spec summaries must reflect Feature Seam and Work Package governance objects in GUI copy. Absence from
  broad plan search is stale summary drift rather than permission to omit them. rewrite-tie-in-memo.md remains a route
  and open reference for /open, /health, /runtime, rewrite-root routing, /seam/package, and blocked/runtime approval
  identity, while this summary preserves route_target, OpenSubject, projection_freshness, and projection_health as
  required rewrite-era navigation and runtime identity concepts.
gui_related: true
gui_classification_reason: The unit governs GUI copy and user-visible route/open/runtime projection summary obligations.
split_recommended: false
depends_on:
- N-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- GUI copy names Feature Seam and Work Package governance objects.
- route_target and OpenSubject remain preserved exact tokens.
- projection_freshness and projection_health remain preserved exact tokens.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: route_open_summary_drift
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: route_open_projection_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0003
preserved_exact_tokens:
- /open
- /health
- /runtime
- /seam/package
- route_target
- OpenSubject
- projection_freshness
- projection_health
negative_constraints:
- Absence from broad plan search is stale summary drift, not permission to omit Feature Seam or Work Package governance objects.
compatibility_only_notes: []
stale_retired_dispositions:
- Broad plan search omissions are treated as stale summary drift.
owner_boundary_notes:
- rewrite-tie-in-memo.md remains the route/open reference for the slash-path concepts summarized here.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Orchestrator_Page.md'
```

### N-006 - Run Graph Command And Runtime Object Gaps

```yaml
plan_unit_id: N-006
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  Run Graph summary language preserves the under-modeled command and struct gaps: /corroboration/promotion/graph-patch,
  concern, corroboration, promotion, graph-patch, trust state, and command-catalog fields are required feature families.
  Runtime object summaries refresh object_kind around rewrite-era lineage objects including Concern, Graph Patch, Feature
  Seam, Work Package, History, Ledger, /timeline, usage-linked receipts, Crosswalk.md /open contracts, and the
  distinction between chronological History and structured durable Ledger inspection. Corroboration, promotion, graph-patch,
  and trust-state summary coverage consumes the concrete governance runtime record schemas and state machines from
  Contracts_V0 CV-315 and storage-plan SP-233 rather than leaving those families as placeholders.
gui_related: true
gui_classification_reason: The unit preserves user-visible command-catalog, route/open, and runtime object summary gaps.
split_recommended: false
depends_on:
- N-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- /corroboration/promotion/graph-patch remains a preserved required feature family.
- corroboration, promotion, graph-patch, and trust-state families are owner-linked to CV-315 and SP-233 schemas/state machines.
- object_kind runtime object summary language remains preserved.
- History and Ledger remain distinguished in the summary.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_catalog_summary_gap
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: run_graph_command_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0003
preserved_exact_tokens:
- /corroboration/promotion/graph-patch
- concern
- corroboration
- promotion
- graph-patch
- trust state
- command-catalog fields
- object_kind
- /timeline
- Crosswalk.md
negative_constraints:
- Required feature families must not be reduced to vague high-level placeholders.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Contracts_V0.md CV-315 owns governance runtime record schemas and state machines for corroboration, promotion, graph-patch, and projection_trust.
- storage-plan.md SP-233 owns the durable storage keys and projection trust revalidation gates.
- Crosswalk.md owns referenced /open contracts; this document preserves high-level feature-summary coverage only.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
```

### N-007 - Broad Summary Compression Guard

```yaml
plan_unit_id: N-007
unit_type: constraint
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  feature-list, feature-list.md, and newfeatures.md are broad drift amplifiers. Their summaries must stay aligned to
  owner docs and cannot compress detailed rules, field schemas, examples, or operational policies into vague high-level
  copy.
gui_related: false
gui_classification_reason: The unit is a documentation drift guard rather than GUI presentation.
split_recommended: false
depends_on:
- N-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Broad summaries remain aligned to owner docs.
- Detailed rules, field schemas, examples, and operational policies are not compressed into vague copy.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: broad_summary_drift
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: broad_summary_compression_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0003
preserved_exact_tokens:
- feature-list
- feature-list.md
- newfeatures.md
- broad drift amplifiers
negative_constraints:
- Broad summaries must not compress detailed rules, field schemas, examples, or operational policies into vague high-level copy.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Owner docs remain authoritative over detailed rules, field schemas, examples, and operational policies.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Orchestrator_Page.md'
```

### N-008 - Orchestration Governance Feature Themes

```yaml
plan_unit_id: N-008
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  The high-level feature themes preserve package-local governance through Package Overseer, seam-level integration
  governance through Seam Overseer, and promotion, corroboration, concern, graph-patch, and recovery records as
  first-class governance/runtime objects.
gui_related: false
gui_classification_reason: The unit summarizes governance/runtime object themes rather than GUI presentation.
split_recommended: false
depends_on:
- N-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Package Overseer remains preserved as package-local governance.
- Seam Overseer remains preserved as seam-level integration governance.
- promotion, corroboration, concern, graph-patch, and recovery records remain first-class governance/runtime objects.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: governance_summary_drift
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: orchestration_governance_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0006
preserved_exact_tokens:
- Package Overseer
- Seam Overseer
- promotion
- corroboration
- concern
- graph-patch
- recovery records
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Detailed orchestration behavior remains owned by orchestration owner docs.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs: []
```

### N-009 - Runtime Identity And Provider Feature Themes

```yaml
plan_unit_id: N-009
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  Runtime identity and provider behavior summaries preserve requested/effective runtime identity across personas,
  models, accounts, and execution roles, with multi-account switching tied to concrete account binding and durable
  switch/pressure history.
gui_related: false
gui_classification_reason: The unit summarizes runtime identity and provider behavior rather than GUI presentation.
split_recommended: false
depends_on:
- N-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- requested/effective runtime identity remains preserved across personas, models, accounts, and roles.
- Multi-account switching remains tied to concrete account binding.
- Durable switch/pressure history remains preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_summary_drift
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: runtime_identity_provider_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0007
preserved_exact_tokens:
- requested/effective runtime identity
- personas
- models
- accounts
- execution roles
- multi-account switching
- durable switch/pressure history
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime identity detail remains owned by the runtime identity owner docs and Multi-Account contract.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs: []
```

### N-010 - UI Navigation Product Surface Summary

```yaml
plan_unit_id: N-010
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  UI and navigation summaries preserve tab-first Orchestrator, worktree-first Source Control, route/open primitives
  shared across chat, runtime, usage, artifacts, and orchestration, and the coherent left-panel /product model as MVP.
  Source Control, GitHub Actions, Docker Manager, Assistant/Chat, Files, Artifacts/Runtime, Usage, and Settings are
  first-class owner surfaces, not individually listed /underdefined pieces.
gui_related: true
gui_classification_reason: The unit summarizes user-visible navigation, left-panel surfaces, and route/open GUI behavior.
split_recommended: false
depends_on:
- N-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- tab-first Orchestrator remains preserved.
- worktree-first Source Control remains preserved.
- The coherent left-panel /product model remains MVP.
- First-class owner surfaces are not reduced to /underdefined pieces.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: navigation_summary_drift
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: ui_navigation_product_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0008
preserved_exact_tokens:
- tab-first Orchestrator
- worktree-first Source Control
- route/open primitives
- /product
- Source Control
- GitHub Actions
- Docker Manager
- Assistant/Chat
- Files
- Artifacts/Runtime
- Usage
- Settings
- /underdefined
negative_constraints:
- First-class owner surfaces must not be reduced to a bag of individually listed /underdefined pieces.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Detailed surface behavior remains owned by the relevant surface owner docs.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs: []
```

### N-011 - Workbench Feature Cluster Requirements

```yaml
plan_unit_id: N-011
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  PM preserves competitive workbench feature clusters as product requirements: visible plans/tasks/artifacts/approval
  state, multi-surface orchestration across editor, terminal, browser/preview, docs, and review, reusable diff/review
  pipelines with hunk-level actions, project/framework autodetection, honest loading/indexing and degraded state,
  durable tabs/splits/workspace recovery, reconnect/offline resilience with read-only/fallback messaging,
  source-canonical rich previews, virtualized lazy file trees, background indexing/search, IME correctness, and
  skepticism toward demo-friendly thin-wrapper UIs.
gui_related: true
gui_classification_reason: The unit summarizes user-visible workbench surfaces, previews, tabs, file trees, and UI resilience.
split_recommended: true
depends_on:
- N-010
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Visible plans/tasks/artifacts/approval state remains preserved.
- Multi-surface orchestration across editor, terminal, browser/preview, docs, and review remains preserved.
- Durable tabs/splits/workspace recovery and reconnect/offline resilience remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: workbench_feature_cluster_drift
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: workbench_feature_cluster_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0009
preserved_exact_tokens:
- /tasks/artifacts/approval
- browser/preview
- hunk-level actions
- /loading/indexing
- /splits/workspace
- /reconnect/offline
- /read-only/fallback
- source-canonical rich previews
- virtualized lazy file trees
- IME correctness
negative_constraints:
- PM must preserve skepticism toward demo-friendly thin-wrapper UIs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Detailed workbench behavior remains owned by workbench and surface owner docs.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs: []
split_recommendation_reason: newfeatures-S0009 mixes workbench product features with ownership and interop constraints.
```

### N-012 - Native Workbench Ownership And Interop Boundary

```yaml
plan_unit_id: N-012
unit_type: constraint
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  PM may learn from file-heavy systems and delegated-backend container/control-plane products, but it must not become a
  monolithic request layer or delegate core file-manager/diff/LSP, editor, storage, routing, or shell ownership to an
  upstream IDE. A native Rust + Slint workbench keeps file-manager operations as typed services with policy/error
  handling, treats remote/runtime orchestration as an explicit control-plane with bootstrap diagnostics, and bounds
  external editor/workbench interop as a subsystem rather than the hidden owner.
gui_related: true
gui_classification_reason: The unit constrains visible workbench ownership, editor interop, and file-manager surface behavior.
split_recommended: true
depends_on:
- N-011
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- PM does not become a monolithic request layer.
- Core file-manager/diff/LSP, editor, storage, routing, and shell ownership are not delegated to an upstream IDE.
- Native Rust + Slint /workbench remains preserved as the summary implementation direction.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ownership_boundary
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: native_workbench_ownership_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0009
preserved_exact_tokens:
- /container/control-plane
- /file-manager/diff/LSP
- /workbench
- Rust + Slint
- /bootstrap
negative_constraints:
- PM must not become a monolithic request layer.
- PM must not delegate core /file-manager/diff/LSP, editor, storage, routing, or shell ownership to an upstream IDE.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- External editor/workbench interop is bounded as a subsystem rather than the hidden owner.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs: []
split_recommendation_reason: newfeatures-S0009 mixes GUI workbench features, backend typed services, and owner-boundary constraints.
```

### N-013 - Recovery And Historical Truth Summary

```yaml
plan_unit_id: N-013
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  Recovery and historical truth summaries preserve blocked episodes as canonical recovery anchors, graph generations as
  visible lineage, and historical runs as distinct from superseded objects unless explicit lineage says otherwise.
gui_related: false
gui_classification_reason: The unit summarizes recovery and lineage semantics rather than GUI presentation.
split_recommended: false
depends_on:
- N-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Blocked episodes remain canonical recovery anchors.
- Graph generations remain visible lineage.
- Historical runs remain distinct from superseded objects unless explicit lineage says otherwise.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: recovery_lineage_summary
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: recovery_historical_truth_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0010
preserved_exact_tokens:
- blocked episodes
- canonical recovery anchors
- graph generations
- visible lineage
- historical runs
- superseded objects
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Prompt_Pipeline.md, Plans/Executor_Protocol.md, and Plans/Contracts_V0.md own detailed recovery and runtime contract semantics.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md'
```

### N-014 - Browser Preview Summary And Debug Adapter Boundary

```yaml
plan_unit_id: N-014
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  The built-in browser preview is summarized as a live rendering surface for web content produced by the active project.
  It participates in the product's visual-debugging and UI-validation loop, shared navigation, evidence capture, and
  source-opening flows. Agents may drive it as a first-class web debug adapter for navigation, reproduction steps, and
  visible client-side signal capture; it must not degrade into external-automation-only or paste-only workflows.
gui_related: true
gui_classification_reason: The unit covers browser preview, visual debugging, UI validation, and user-visible source-opening flows.
split_recommended: false
depends_on:
- N-010
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Browser preview remains part of visual-debugging and UI-validation.
- Browser preview participates in shared navigation, evidence capture, and source-opening flows.
- Agent-driven browser preview does not degrade into external-automation-only or paste-only workflows.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_preview_boundary
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: browser_preview_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0012
preserved_exact_tokens:
- built-in browser preview
- visual-debugging
- UI-validation
- evidence capture
- source-opening
- first-class web debug adapter
- /client-side
negative_constraints:
- Agent browser preview workflows must not degrade into external-automation-only or paste-only workflows.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Normative browser behavior remains in subsystem owner docs; this document preserves promoted-feature summary coverage.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs: []
```

### N-015 - Browser Click-To-Context Summary

```yaml
plan_unit_id: N-015
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  Built-in browser preview and click-to-context connect live rendered UI state, corresponding source code, and assistant
  context. Integration points preserve browser preview to editor click-to-source, browser preview to chat
  screenshot-to-context, and browser DevTools to debug mode DOM inspection as evidence.
gui_related: true
gui_classification_reason: The unit covers user-visible browser preview, click-to-context, screenshot, and DevTools interactions.
split_recommended: false
depends_on:
- N-014
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Click-to-context remains linked to corresponding source code.
- Rendered UI state, editable source, and assistant context remain part of the same troubleshooting loop.
- click-to-source, screenshot-to-context, and DOM inspection as evidence remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_context_linkage
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: browser_click_to_context_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0013
preserved_exact_tokens:
- Click-to-Context
- click-to-source
- screenshot-to-context
- DOM inspection as evidence
- rendered UI state
- editable source
- assistant context
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/FinalGUISpec.md, Plans/assistant-chat-design.md, and Plans/Glossary.md own detailed GUI and terminology behavior.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Glossary.md'
```

### N-016 - Web Operations And Approval Alignment

```yaml
plan_unit_id: N-016
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  The promoted rewrite feature summary preserves the repaired web/provider/question/planning canon, including six
  canonical web operations plus native batch variants, the four-step approval ladder, and MCP owner-doc alignment.
gui_related: false
gui_classification_reason: The unit summarizes web operation and approval semantics rather than GUI presentation.
split_recommended: true
depends_on:
- N-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Six canonical web operations plus native batch variants remain preserved.
- The four-step approval ladder remains preserved.
- MCP owner-doc alignment remains preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_operations_summary
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: web_operations_approval_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0014
preserved_exact_tokens:
- six canonical web operations
- native batch variants
- four-step approval ladder
- MCP owner-doc alignment
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Tools.md owns detailed web-operation behavior.
- Plans/assistant-chat-design.md and Plans/FinalGUISpec.md own detailed UI consumption.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: newfeatures-S0014 mixes web operations, provider disclosure, schemas, visualizers, consumer lineage, and Docker registry parity.
```

### N-017 - Provider Disclosure Questions TODOs And Visualizers

```yaml
plan_unit_id: N-017
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  The promoted feature summary preserves routing-aware provider disclosure, support-tier visibility, reserved
  slash-command set, /web family behavior, Agent Config naming, shared question and TODO schemas across chat, widgets,
  storage, and delegated work, plus distinct Mermaid and inline visualizer behavior.
gui_related: true
gui_classification_reason: The unit covers user-visible provider disclosure, slash commands, shared schemas, Mermaid, and visualizer behavior.
split_recommended: true
depends_on:
- N-016
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Routing-aware provider disclosure and support-tier visibility remain preserved.
- Reserved slash-command set and /web family behavior stay aligned to owner docs.
- Shared question and TODO schemas remain preserved.
- Mermaid and inline visualizer behavior remain distinct.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: promoted_feature_ui_summary
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: provider_disclosure_visualizer_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0014
preserved_exact_tokens:
- routing-aware provider disclosure
- support-tier visibility
- reserved slash-command set
- /web
- Agent Config naming
- shared question and TODO schemas
- Mermaid
- inline visualizer
negative_constraints:
- Reserved slash-command set, /web family behavior, and Agent Config naming must stay aligned to owner docs rather than older promoted-feature summaries.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Owner docs for tools, prompts, gates, widgets, storage, and chat own detailed schemas and behavior.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: newfeatures-S0014 contains multiple GUI and backend consumer surfaces.
```

### N-018 - Web Consumer And Extraction Lineage Boundary

```yaml
plan_unit_id: N-018
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  Cross-reference consumers remain explicit across feature-list.md, Prompt_Pipeline.md, Progression_Gates.md,
  OpenCode_Coverage_Matrix.md, newfeatures.md, MiscPlan.md, and FileManager.md. OpenCode_Deep_Extraction.md remains
  extraction/reference lineage rather than a competing owner.
gui_related: false
gui_classification_reason: The unit preserves cross-document consumer and extraction-lineage boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- N-016
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Cross-reference consumers remain explicit.
- OpenCode_Deep_Extraction.md remains extraction/reference lineage.
- OpenCode_Deep_Extraction.md does not become a competing owner.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: consumer_lineage_boundary
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: web_consumer_extraction_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0014
preserved_exact_tokens:
- Cross-reference consumers remain explicit
- Plans/feature-list.md
- Plans/Prompt_Pipeline.md
- Plans/Progression_Gates.md
- Plans/OpenCode_Coverage_Matrix.md
- Plans/newfeatures.md
- Plans/MiscPlan.md
- Plans/FileManager.md
- Plans/OpenCode_Deep_Extraction.md
negative_constraints:
- Plans/OpenCode_Deep_Extraction.md must remain extraction/reference lineage rather than a competing owner.
compatibility_only_notes: []
stale_retired_dispositions:
- Older promoted-feature summaries do not override the explicit owner-doc alignment described here.
owner_boundary_notes:
- Cross-reference consumers preserve alignment without becoming owner docs for the detailed web/tool canon.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
```

### N-019 - Docker Reference Parity And Registry Management

```yaml
plan_unit_id: N-019
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  Docker reference parity combines docker/vscode-extension and /vscode-extension authoring cues with Container Tools
  management and /registry behavior. Docker Hub management parity is not satisfied by the extension reference alone.
gui_related: true
gui_classification_reason: The unit covers user-visible Container Tools management and registry behavior summary.
split_recommended: false
depends_on:
- N-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- docker/vscode-extension and /vscode-extension authoring cues remain preserved.
- Container Tools management and /registry behavior remain preserved.
- Docker Hub management parity is not treated as satisfied by the extension reference alone.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_reference_parity
reasoning_tier: standard
context_scope: newfeatures_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: docker_reference_registry_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0014
preserved_exact_tokens:
- docker/vscode-extension
- /vscode-extension
- Container Tools
- /registry
- Docker Hub management parity
negative_constraints:
- Docker Hub management parity is not satisfied by the extension reference alone.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Detailed Docker and container behavior remains with the relevant owner docs.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
```

### N-001 - New Features Retired Source-Preserving Bridge

```yaml
plan_unit_id: N-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: >-
  N-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 103 because
  newfeatures-S0001 through newfeatures-S0018 are covered by N-002 through N-019 or explicit structural, retired, and
  migration-coverage dispositions. N-001 no longer carries source_preserving_planunit compile mode and must not own
  product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried by fine-grained newfeatures PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- N-002
- N-003
- N-004
- N-005
- N-006
- N-007
- N-008
- N-009
- N-010
- N-011
- N-012
- N-013
- N-014
- N-015
- N-016
- N-017
- N-018
- N-019
unblocks: []
acceptance_criteria:
- N-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 103.
- newfeatures-S0001 through newfeatures-S0018 product coverage is owned by N-002 through N-019 or explicit structural, retired, and migration-coverage dispositions.
- N-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/newfeatures.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newfeatures-S0017
preserved_exact_tokens:
- N-001
- New Features Implementation Plan Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- N-001 must not re-own newfeatures-S0001 through newfeatures-S0018 after Phase 2B batch 103.
- N-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- N-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former N-001 residual source-preserving bridge is retired by Phase 2B batch 103.
owner_boundary_notes:
- N-002 through N-019 and explicit coverage dispositions own newfeatures product coverage after bridge retirement.
- newfeatures-S0017 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/newfeatures.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
split_recommendation_reason: The former source-preserving bridge has been atomized or structurally dispositioned and is now retired.
```

## Migration Coverage

Original hash: `360bfc1732e8b68dc5199eac373fe54df23eff7e6f1788d69b5f2ae21426a64c`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 103 atomized source spans `newfeatures-S0002` through `newfeatures-S0014` into fine-grained PlanUnits `N-002` through `N-019`. `newfeatures-S0001`, `newfeatures-S0005`, `newfeatures-S0011`, `newfeatures-S0015`, `newfeatures-S0016`, and `newfeatures-S0018` are structurally dispositioned. `newfeatures-S0017` is the retired `N-001` bridge disposition. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 350` (explicitly_deferred; source line 1178; `sfk-a842ba71d3915b955e7ddd63`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: pure PlanUnit YAML with no data models/algorithms/GUI wiring mislabeled "Implementation Plan" in its own H1 despite every unit having `create_worknodes: false`.
- `registry_line 351` (repaired; source line 1179; `sfk-382a8aaadd071809899261b5`): Repaired: N-006 now links corroboration, promotion, graph-patch, and trust-state summary coverage to the `CV-315` governance runtime record schemas/state machines and `SP-233` storage binding. No buildability or runtime proof is claimed here. Source summary: - [HIGH] N-006: names required feature families (corroboration/promotion/graph-patch, trust state) with zero schema or state machine.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime newfeatures rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-a842ba71d3915b955e7ddd63`: this document is a feature summary/source-lineage compilation, not an implementation plan. Its PlanUnits preserve intent and route ownership while `create_worknodes` remains false.
- Repairs `sfk-382a8aaadd071809899261b5`: N-006 now owner-links corroboration, promotion, graph-patch, and trust-state summary coverage to the `CV-315` governance runtime record schemas/state machines and the `SP-233` storage binding. This is non-runtime owner-doc/schema repair only and does not create WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 evidence.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
