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
- Gemini auth plan-map status is `RECONCILE complete` for this high-level feature summary: Gemini Direct and Gemini CLI are separate provider entries, API-key access is a scoped exception rather than the default UI posture, and consumer docs inherit requested/effective auth/account identity from `Plans/Multi-Account.md`, `Plans/Contracts_V0.md`, `Plans/Prompt_Pipeline.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/feature-list.md`, `Plans/assistant-chat-design.md`, `Plans/newtools.md`, `Plans/00-plans-index.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/Orchestrator_Page.md` instead of restating stale Gemini API-key-default language.
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

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/newfeatures.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### N-001 - New Features Implementation Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: N-001
unit_type: requirement
status: accepted
owner_doc: Plans/newfeatures.md
canonical_text: Plans/newfeatures.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/newfeatures.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:newfeatures-S0014
preserved_exact_tokens:
- New Features Implementation Plan
- Plan Document Status
- Rewrite alignment (2026-03-17)
- 'ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Orchestrator_Page.md'
- Executive Summary
- High-level feature themes
- 1. Orchestration and governance
- 2. Runtime identity and provider behavior
- 3. UI and navigation
- 3A. Workbench and feature-cluster lessons
- 4. Recovery and historical truth
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md'
- 24. Browser preview and code-context integration
- 24.1 Built-in browser preview
- 24.2 Relationship to Built-in Browser and Click-to-Context
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Glossary.md'
- Web tools, provider routing, and shared UI alignment addendum (2026-04-04)
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
negative_constraints:
- Assistant/chat display requirements consume runtime-state and runtime identity from owner docs such as `Plans/Prompt_Pipeline.md`, `Plans/Contracts_V0.md`, and `Plans/assistant-chat-design.md`; they must not create assistant-local schema or re-own those semantics in this summary.
- '- PM may learn breadth from file-heavy systems and runtime seams from delegated-backend `/container/control-plane` products, but it must not become a monolithic request layer or delegate core `/file-manager/diff/LSP`, editor, storage, routing, or shell ownership to an upstream IDE. A strong native R'
- Agents may drive the built-in browser as a first-class web debug adapter for navigation, reproduction steps, and visible `/client-side` signal capture; this must not degrade into external-automation-only or paste-only workflows.
compatibility_only_notes: []
stale_retired_dispositions:
- '- Gemini auth plan-map status is `RECONCILE complete` for this high-level feature summary: Gemini Direct and Gemini CLI are separate provider entries, API-key access is a scoped exception rather than the default UI posture, and consumer docs inherit requested/effective auth/account identity from `Pl'
- '- `Plans/**` and `/spec` summaries must reflect feature seam and work package governance objects in GUI copy; absence from broad plan search is treated as stale summary drift, not as permission to omit them. `rewrite-tie-in-memo.md` and rewrite-tie-in-memo remain route/open references for `/open`, `'
- 'Cross-reference consumers remain explicit: `Plans/feature-list.md` keeps new web-tool, question-system, TODO-schema, and Mermaid-rendering feature summaries accurate; `Plans/Prompt_Pipeline.md` keeps prompt context injection aligned to current web-tool names; `Plans/Progression_Gates.md` keeps tool '
owner_boundary_notes:
- Assistant/chat display requirements consume runtime-state and runtime identity from owner docs such as `Plans/Prompt_Pipeline.md`, `Plans/Contracts_V0.md`, and `Plans/assistant-chat-design.md`; they must not create assistant-local schema or re-own those semantics in this summary.
- 'The rewrite is aligned to these canonical decisions:'
- '- runtime blocked identity replaces request-centric approval identity as canonical action scope'
- '- `route_target` and `OpenSubject` are canonical navigation and identity-open primitives'
- '- Gemini auth plan-map status is `RECONCILE complete` for this high-level feature summary: Gemini Direct and Gemini CLI are separate provider entries, API-key access is a scoped exception rather than the default UI posture, and consumer docs inherit requested/effective auth/account identity from `Pl'
- '- `feature-list`, `feature-list.md`, and `newfeatures.md` are broad drift amplifiers; their summaries must stay aligned to owner docs and cannot compress detailed rules, field schemas, examples, or operational policies into vague high-level copy.'
- '- the coherent left-panel `/product` model is MVP: Source Control, GitHub Actions, Docker Manager, Assistant/Chat, Files, Artifacts/Runtime, Usage, and Settings are first-class owner surfaces, not a bag of individually listed `/underdefined` pieces'
- '- PM preserves the strongest competitive feature clusters as product requirements: visible plans `/tasks/artifacts/approval` state, multi-surface orchestration across editor, terminal, browser/preview, docs, and review, reusable diff/review pipelines with hunk-level actions instead of one-off compar'
- '- PM may learn breadth from file-heavy systems and runtime seams from delegated-backend `/container/control-plane` products, but it must not become a monolithic request layer or delegate core `/file-manager/diff/LSP`, editor, storage, routing, or shell ownership to an upstream IDE. A strong native R'
- '- blocked episodes as canonical recovery anchors'
- 'Cross-reference consumers remain explicit: `Plans/feature-list.md` keeps new web-tool, question-system, TODO-schema, and Mermaid-rendering feature summaries accurate; `Plans/Prompt_Pipeline.md` keeps prompt context injection aligned to current web-tool names; `Plans/Progression_Gates.md` keeps tool '
- '- six canonical web operations plus native batch variants'
- '- reserved slash-command set, `/web` family behavior, and Agent Config naming stay aligned to their owner docs rather than older promoted-feature summaries'
- '- four-step approval ladder and MCP owner-doc alignment'
owner_hints:
- Plans/newfeatures.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `360bfc1732e8b68dc5199eac373fe54df23eff7e6f1788d69b5f2ae21426a64c`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `newfeatures-S0001` through `newfeatures-S0014` are preserved in place and mapped in `coverage_map.jsonl` to `N-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
