# Shard 009: PlanUnits

Source: `Plans/newfeatures.md`

Source lines: L94-L188

Source SHA256: `a49cd1097dcfc0917124f500b33f95da09edc3804cb0b799c6524f512ac8fe63`

---

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

