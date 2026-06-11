# Shard 006: PlanUnits

Source: `Plans/interview-subagent-integration.md`

Source lines: L62-L147

Source SHA256: `faeb6f2c9d9ee2a62871930314b90fbe5278b503f32f1d84f77a85f32e15a2c6`

---

## PlanUnits

### ISI-001 - Interview Feature Subagent Integration -- Implementation Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: ISI-001
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: Plans/interview-subagent-integration.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:interview-subagent-integration-S0011
preserved_exact_tokens:
- Interview Feature Subagent Integration -- Implementation Plan
- Canonical owner-section requirements
- Shared conversational/runtime boundary
- Change Summary
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM'
- 'ContractRef: `Plans/chain-wizard-flexibility.md`, `SchemaID:pm.requirements_quality_report.schema.v1`.'
- Interview runtime boundary and handoff lineage
- Shared runtime boundary
- Question system alignment
- Runtime identity visibility
- Requested/effective Interview contract
- Wizard and interview handoff packet
- validation_pass_report bridge
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md'
negative_constraints:
- '- Example handoff payloads MUST NOT normalize missing thread linkage as `thread_id: None`; that value is a concrete drift signal, not an acceptable omitted-detail placeholder. If no thread exists, record a typed absence reason without letting `thread_id` masquerade as a nullable placeholder.'
- '- Interview reviewer-cap limits consume the Orchestrator concurrency SSOT; the requirements-quality-reviewer autofill cap is reviewer-only and MUST NOT redefine global spawn, nesting, shell-isolation, or child timeout ceilings.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Shared conversational/runtime boundary'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- 2026-02-26: Added capability introspection and media-generation gating requirements: Interview agent MUST call `capabilities.get` when offering media options and honor enabled/disabled gating; may propose media generation but only execute when enabled. SSOT: `Plans/Media_Generation_and_Capabilitie'
- '- 2026-02-24: Added UI wiring artifacts (`ui/wiring_matrix.json`, `ui/ui_command_catalog.json`) to interview outputs for GUI projects; updated Phase 3 (Product/UX) subagent responsibilities, §5.2 wiring/completeness requirements, and Contract Layer outputs. SSOT: `Plans/UI_Wiring_Rules.md`, `Plans/W'
- '- 2026-02-24: Updated the user-project Contract Layer outputs so the Interviewer/Wizard emits a **sharded-only plan graph** under `.puppet-master/project/plan_graph/` (canonical; persisted canonically in seglog). `plan_graph/exports/plan_graph.monolithic.json` is an optional derived export only. (SS'
- '- 2026-02-23: Added a cross-plan alignment section making the Interview phase manager responsible for (1) intent-driven adaptive phase selection (phase plan) and (2) producing Contract Layer outputs via contract fragments + a deterministic Contract Unification Pass (SSOT: `Plans/chain-wizard-flexibi'
- '## Interview runtime boundary and handoff lineage'
- '### Shared runtime boundary'
- '- Interview question cards, validation reports, and handoff packets display the same requested/effective runtime identity fields as the shared runtime boundary: requested/effective runtime identity, requested/effective account identity, `execution_role`, `operational_identity`, and the launched chil'
- '- Interview surfaces may summarize those fields for display, but persisted records and downstream handoffs preserve the canonical field names so question handling, validation, and execution launch all reconcile to the same runtime identity packet.'
- '- Question answers, validation artifacts, and generated handoff bundles must retain that requested/effective alignment when they reference `QuestionItem` entries, so consumer docs can retire local question/runtime variants without losing interview lineage.'
- '- The canonical handoff packet carries `project_id`, `thread_id`, `wizard_id`, `interview_session_id`, requested/effective runtime identity, requested/effective account identity, `execution_role`, and an explicit `launched_run_id` / `launched_run_ref` bridge.'
- '- Provider-native delegation syntax, provider-native exports/imports, and `/imports` remain interoperability-only; the same direct-provider and child-run canon applies, and the canonical `/handoff` is the Puppet Master child-run packet.'
- '- Interview reviewer-cap limits consume the Orchestrator concurrency SSOT; the requirements-quality-reviewer autofill cap is reviewer-only and MUST NOT redefine global spawn, nesting, shell-isolation, or child timeout ceilings.'
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

