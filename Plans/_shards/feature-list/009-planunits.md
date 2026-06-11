# Shard 009: PlanUnits

Source: `Plans/feature-list.md`

Source lines: L219-L329

Source SHA256: `698760ada2b926dd1f787cb37331443deab51650d53578a672db41c1f5fea53c`

---

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

