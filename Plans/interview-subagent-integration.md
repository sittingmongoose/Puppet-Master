# Interview Feature Subagent Integration -- Implementation Plan


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Shared conversational/runtime boundary
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Change Summary

- 2026-02-26: Added capability introspection and media-generation gating requirements: Interview agent MUST call `capabilities.get` when offering media options and honor enabled/disabled gating; may propose media generation but only execute when enabled. SSOT: `Plans/Media_Generation_and_Capabilities.md`. ContractRef: ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM
- 2026-02-24: Added UI wiring artifacts (`ui/wiring_matrix.json`, `ui/ui_command_catalog.json`) to interview outputs for GUI projects; updated Phase 3 (Product/UX) subagent responsibilities, §5.2 wiring/completeness requirements, and Contract Layer outputs. SSOT: `Plans/UI_Wiring_Rules.md`, `Plans/Wiring_Matrix.schema.json`.
- 2026-02-24: Updated the user-project Contract Layer outputs so the Interviewer/Wizard emits a **sharded-only plan graph** under `.puppet-master/project/plan_graph/` (canonical; persisted canonically in seglog). `plan_graph/exports/plan_graph.monolithic.json` is an optional derived export only. (SSOT: `Plans/Project_Output_Artifacts.md`, `Plans/orchestrator-subagent-integration.md`.)
- 2026-02-24: Added `requirements-quality-reviewer` cross-phase subagent persona (Quality Review category in Cross-Phase Subagents); added §5.5 Requirements Quality Reviewer Trigger Rule with deterministic two-trigger invocation order, 2-iteration autofill loop cap, and Autofill-First Rule; added quality gate bullet to §2) Contract Layer output generation specifying how `verdict` from the quality report gates the Contract Unification Pass. ContractRef: `Plans/chain-wizard-flexibility.md`, `SchemaID:pm.requirements_quality_report.schema.v1`.
- 2026-02-23: Added a cross-plan alignment section making the Interview phase manager responsible for (1) intent-driven adaptive phase selection (phase plan) and (2) producing Contract Layer outputs via contract fragments + a deterministic Contract Unification Pass (SSOT: `Plans/chain-wizard-flexibility.md` §6 and `Plans/Project_Output_Artifacts.md`).

## Interview runtime boundary and handoff lineage

Interview-phase launches share the runtime identity packet with Orchestrator while preserving interview-specific actor identity and launched-run lineage.

### Shared runtime boundary
- Assistant/chat/interview/builder actors share provider/runtime identity semantics with Orchestrator.
- They remain distinct actor/run kinds rather than package/seam/node execution objects.
- Shared runtime packets preserve requested/effective runtime identity, requested/effective account identity, `execution_role`, `operational_identity`, and the launched child-run reference without relabeling the interview actor as a graph node or worktree lane.

### Question system alignment
- Interview clarification and questionnaire flows consume the shared `question` / `/questionnaire` contract and the `QuestionItem` item shape instead of defining an interview-local prompt schema. Interview consumers preserve `question_id`, `question`, `options[]`, `required`, `multi_select`, `allow_freeform`, and `default_values`, and they keep per-question display text in `question` while reserving `prompt` for envelope or header copy.
- Required interview questions gate submit through the shared question-card flow. Draft, pause, resume, and submitted outcomes use PM-managed `draft_value`, response, and validation state rather than interview-only status names.

### Runtime identity visibility
- Interview question cards, validation reports, and handoff packets display the same requested/effective runtime identity fields as the shared runtime boundary: requested/effective runtime identity, requested/effective account identity, `execution_role`, `operational_identity`, and the launched child-run reference.
- Interview surfaces may summarize those fields for display, but persisted records and downstream handoffs preserve the canonical field names so question handling, validation, and execution launch all reconcile to the same runtime identity packet.

### Requested/effective Interview contract
- Interview-specific runtime packets align requested values, effective values, and launched-run lineage before execution starts. The interview actor remains a distinct actor/run kind, but any execution-affecting handoff carries the requested/effective runtime and account fields needed by Orchestrator, storage, permissions, and usage consumers.
- Question answers, validation artifacts, and generated handoff bundles must retain that requested/effective alignment when they reference `QuestionItem` entries, so consumer docs can retire local question/runtime variants without losing interview lineage.
- Deterministic Contract Unification requires explicit conflict-resolution authority and `/rules` for contradictory upstream phase outputs. When those rules cannot resolve a contradiction, the interview handoff records an unresolved conflict instead of silently choosing one phase output.

### Wizard and interview handoff packet
- Extend wizard/interview handoff with project/thread/wizard/runtime identity and execution_role.
- The canonical handoff packet carries `project_id`, `thread_id`, `wizard_id`, `interview_session_id`, requested/effective runtime identity, requested/effective account identity, `execution_role`, and an explicit `launched_run_id` / `launched_run_ref` bridge.
- Example handoff payloads MUST NOT normalize missing thread linkage as `thread_id: None`; that value is a concrete drift signal, not an acceptable omitted-detail placeholder. If no thread exists, record a typed absence reason without letting `thread_id` masquerade as a nullable placeholder.
- Provider-native delegation syntax, provider-native exports/imports, and `/imports` remain interoperability-only; the same direct-provider and child-run canon applies, and the canonical `/handoff` is the Puppet Master child-run packet.
- Interview reviewer-cap limits consume the Orchestrator concurrency SSOT; the requirements-quality-reviewer autofill cap is reviewer-only and MUST NOT redefine global spawn, nesting, shell-isolation, or child timeout ceilings.

### auditor_cycle_report bridge
- Extend `auditor_cycle_report` with planning/governance lineage and an explicit bridge into the launched run. Legacy `validation_pass_report` mirrors may expose the same bridge only with `compatibility_only: true` and `cycle_report_ref`.
- Validation/governance lineage preserves `phase_plan_ref`, `requirements_quality_report_ref`, `workflow_run_id`, `pass_verdict`, `wizard_snapshot_ref`, and `launched_run_id` / `launched_run_ref`.
- Preview, validation, review, and resume surfaces reuse that bridge instead of reconstructing joins from filenames, timestamps, or provider-native traces.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/interview-subagent-integration.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### ISI-002 - Media Capability Gating

```yaml
plan_unit_id: ISI-002
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: When offering media options, the Interview agent must call capabilities.get, honor enabled/disabled media-generation gating, and may propose media generation but only execute it when enabled by the Media Generation and Capabilities SSOT.
gui_related: true
gui_classification_reason: This unit governs interview UI, question cards, GUI project wiring, media option affordances, or visible runtime identity.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-002 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: media_capability_gating
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0004
preserved_exact_tokens:
- capabilities.get
- enabled/disabled gating
- may propose media generation but only execute when enabled
- Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM
negative_constraints:
- The Interview agent may not execute media generation when the capability is disabled.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM'
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-003 - GUI Project Wiring Artifacts

```yaml
plan_unit_id: ISI-003
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: For GUI projects, Interview outputs include UI wiring artifacts ui/wiring_matrix.json and ui/ui_command_catalog.json, update Phase 3 Product/UX subagent responsibilities, preserve section 5.2 wiring/completeness requirements, and feed Contract Layer outputs under the UI wiring SSOTs.
gui_related: true
gui_classification_reason: This unit governs interview UI, question cards, GUI project wiring, media option affordances, or visible runtime identity.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-003 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: gui_project_wiring_artifacts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0004
preserved_exact_tokens:
- ui/wiring_matrix.json
- ui/ui_command_catalog.json
- GUI projects
- Phase 3 (Product/UX)
- §5.2
- Contract Layer outputs
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.schema.json
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/UI_Wiring_Rules.md and Plans/Wiring_Matrix.schema.json own wiring schema semantics; this document owns interview output obligations.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-004 - Sharded-Only Plan Graph Output

```yaml
plan_unit_id: ISI-004
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: The Interviewer/Wizard emits a sharded-only plan graph under .puppet-master/project/plan_graph as canonical output persisted canonically in seglog; plan_graph/exports/plan_graph.monolithic.json is an optional derived export only.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-004 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: sharded_only_plan_graph_output
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0004
preserved_exact_tokens:
- '**sharded-only plan graph**'
- .puppet-master/project/plan_graph/
- canonical
- seglog
- plan_graph/exports/plan_graph.monolithic.json
- optional derived export
negative_constraints:
- The monolithic plan graph export is optional and derived only, not canonical.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Project_Output_Artifacts.md and Plans/orchestrator-subagent-integration.md own project output artifact and orchestrator integration details.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-005 - Requirements Quality Reviewer Gate

```yaml
plan_unit_id: ISI-005
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: The requirements-quality-reviewer persona belongs to the Quality Review category, uses deterministic two-trigger invocation order, a two-iteration autofill loop cap, and the Autofill-First Rule, and its quality report verdict gates the Contract Unification Pass.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-005 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: requirements_quality_reviewer_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0004
preserved_exact_tokens:
- requirements-quality-reviewer
- Quality Review category
- deterministic two-trigger invocation order
- 2-iteration autofill loop cap
- Autofill-First Rule
- verdict
- Contract Unification Pass
- SchemaID:pm.requirements_quality_report.schema.v1
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: `Plans/chain-wizard-flexibility.md`, `SchemaID:pm.requirements_quality_report.schema.v1`.'
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-006 - Phase Plan And Contract Unification

```yaml
plan_unit_id: ISI-006
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: The Interview phase manager is responsible for intent-driven adaptive phase selection through a phase plan and for producing Contract Layer outputs via contract fragments plus a deterministic Contract Unification Pass.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-006 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: phase_plan_and_contract_unification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0004
preserved_exact_tokens:
- intent-driven adaptive phase selection
- phase plan
- Contract Layer outputs
- contract fragments
- deterministic Contract Unification Pass
- Plans/chain-wizard-flexibility.md
- Plans/Project_Output_Artifacts.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/chain-wizard-flexibility.md and Plans/Project_Output_Artifacts.md remain SSOTs for phase planning and output artifacts.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-007 - Shared Runtime Identity Packet

```yaml
plan_unit_id: ISI-007
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: Interview-phase launches share the runtime identity packet with Orchestrator and preserve requested/effective runtime identity, requested/effective account identity, execution_role, operational_identity, and launched child-run reference.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-007 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: shared_runtime_identity_packet
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0006
preserved_exact_tokens:
- Interview runtime boundary and handoff lineage
- Shared runtime boundary
- requested/effective runtime identity
- requested/effective account identity
- execution_role
- operational_identity
- launched child-run reference
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-008 - Actor Kind Boundary

```yaml
plan_unit_id: ISI-008
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: Assistant, chat, interview, and builder actors share provider/runtime identity semantics with Orchestrator while remaining distinct actor/run kinds rather than package, seam, or node execution objects, and shared packets must not relabel the interview actor as a graph node or worktree lane.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-008 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: actor_kind_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0006
preserved_exact_tokens:
- Assistant/chat/interview/builder actors
- provider/runtime identity semantics
- distinct actor/run kinds
- package/seam/node execution objects
- graph node
- worktree lane
negative_constraints:
- Interview actors must not be relabeled as graph nodes or worktree lanes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-009 - Shared Question Contract Consumption

```yaml
plan_unit_id: ISI-009
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: Interview clarification and questionnaire flows consume the shared question/questionnaire contract and QuestionItem shape, preserving question_id, question, options, required, multi_select, allow_freeform, default_values, and per-question display text in question while reserving prompt for envelope or header copy.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-009 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: shared_question_contract_consumption
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0007
preserved_exact_tokens:
- question
- /questionnaire
- QuestionItem
- question_id
- options[]
- required
- multi_select
- allow_freeform
- default_values
- prompt
negative_constraints:
- Interview flows must not define an interview-local prompt schema.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-010 - Required Question Submit And Draft State

```yaml
plan_unit_id: ISI-010
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: Required interview questions gate submit through the shared question-card flow, and draft, pause, resume, and submitted outcomes use PM-managed draft_value, response, and validation state rather than interview-only status names.
gui_related: true
gui_classification_reason: This unit governs interview UI, question cards, GUI project wiring, media option affordances, or visible runtime identity.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-010 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: required_question_submit_and_draft_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0007
preserved_exact_tokens:
- Required interview questions
- shared question-card flow
- submit
- draft
- pause
- resume
- submitted
- draft_value
- response
- validation state
- interview-only status names
negative_constraints:
- Required interview questions must not use interview-only status names for shared draft/response/validation state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-011 - Runtime Identity Visibility

```yaml
plan_unit_id: ISI-011
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: Interview question cards, validation reports, and handoff packets display the same requested/effective runtime and account identity fields as the shared runtime boundary, may summarize those fields for display, and preserve canonical field names in persisted records and downstream handoffs.
gui_related: true
gui_classification_reason: This unit governs interview UI, question cards, GUI project wiring, media option affordances, or visible runtime identity.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-011 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: runtime_identity_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0008
preserved_exact_tokens:
- Interview question cards
- validation reports
- handoff packets
- requested/effective runtime identity
- requested/effective account identity
- execution_role
- operational_identity
- launched child-run reference
- canonical field names
negative_constraints:
- Persisted records and downstream handoffs must preserve canonical field names.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
```

### ISI-012 - Requested/Effective Interview Alignment

```yaml
plan_unit_id: ISI-012
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: Interview-specific runtime packets align requested values, effective values, and launched-run lineage before execution starts, and execution-affecting handoffs carry the requested/effective runtime and account fields needed by Orchestrator, storage, permissions, and usage consumers.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-012 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: requested_effective_interview_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0009
preserved_exact_tokens:
- Requested/effective Interview contract
- requested values
- effective values
- launched-run lineage
- Orchestrator
- storage
- permissions
- usage consumers
- QuestionItem
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-013 - Contract Unification Conflict Rules

```yaml
plan_unit_id: ISI-013
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: Deterministic Contract Unification requires explicit conflict-resolution authority and rules for contradictory upstream phase outputs; when rules cannot resolve a contradiction, the interview handoff records an unresolved conflict instead of silently choosing one phase output.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-013 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: contract_unification_conflict_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0009
preserved_exact_tokens:
- Deterministic Contract Unification
- conflict-resolution authority
- /rules
- contradictory upstream phase outputs
- unresolved conflict
- silently choosing one phase output
negative_constraints:
- The interview handoff must record an unresolved conflict instead of silently choosing one phase output when rules cannot resolve a contradiction.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-014 - Wizard/Interview Handoff Packet Fields

```yaml
plan_unit_id: ISI-014
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: The canonical wizard/interview handoff packet carries project_id, thread_id, wizard_id, interview_session_id, requested/effective runtime identity, requested/effective account identity, execution_role, and explicit launched_run_id/launched_run_ref bridge fields.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-014 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: wizard_interview_handoff_packet_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0010
preserved_exact_tokens:
- project_id
- thread_id
- wizard_id
- interview_session_id
- requested/effective runtime identity
- requested/effective account identity
- execution_role
- launched_run_id
- launched_run_ref
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-015 - Missing Thread Typed Absence

```yaml
plan_unit_id: ISI-015
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: 'Example handoff payloads must not normalize missing thread linkage as thread_id: None; that value is a concrete drift signal, and if no thread exists the packet records a typed absence reason without letting thread_id masquerade as a nullable placeholder.'
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-015 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: missing_thread_typed_absence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0010
preserved_exact_tokens:
- 'thread_id: None'
- concrete drift signal
- typed absence reason
- nullable placeholder
negative_constraints:
- 'Example handoff payloads MUST NOT normalize missing thread linkage as thread_id: None.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-016 - Provider-Native Delegation Boundary

```yaml
plan_unit_id: ISI-016
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: Provider-native delegation syntax, provider-native exports/imports, and /imports remain interoperability-only; direct-provider and child-run canon still apply, and the canonical handoff is the Puppet Master child-run packet.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-016 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: provider_native_delegation_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0010
preserved_exact_tokens:
- Provider-native delegation syntax
- provider-native exports/imports
- /imports
- interoperability-only
- direct-provider
- child-run canon
- canonical /handoff
- Puppet Master child-run packet
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-017 - Reviewer Cap Boundary

```yaml
plan_unit_id: ISI-017
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: Interview reviewer-cap limits consume the Orchestrator concurrency SSOT, and the requirements-quality-reviewer autofill cap is reviewer-only and must not redefine global spawn, nesting, shell-isolation, or child timeout ceilings.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-017 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: reviewer_cap_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0010
preserved_exact_tokens:
- Interview reviewer-cap limits
- Orchestrator concurrency SSOT
- requirements-quality-reviewer autofill cap
- reviewer-only
- global spawn
- nesting
- shell-isolation
- child timeout ceilings
negative_constraints:
- The requirements-quality-reviewer autofill cap MUST NOT redefine global spawn, nesting, shell-isolation, or child timeout ceilings.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
split_recommendation_reason: The source span contains multiple separable interview integration concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### ISI-018 - Auditor Cycle Report Bridge

```yaml
plan_unit_id: ISI-018
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: auditor_cycle_report includes planning/governance lineage and an explicit launched-run bridge with phase_plan_ref, requirements_quality_report_ref, workflow_run_id, pass_verdict, wizard_snapshot_ref, launched_run_id, and launched_run_ref, and preview, validation, review, and resume surfaces reuse that bridge instead of reconstructing joins from filenames, timestamps, or provider-native traces. Legacy validation_pass_report mirrors may expose the same bridge only with compatibility_only true and cycle_report_ref.
gui_related: false
gui_classification_reason: This unit defines interview runtime, handoff, contract, or governance semantics rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through ISI-018 instead of broad ISI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_runtime_drift
reasoning_tier: standard
context_scope: interview_subagent_integration_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: auditor_cycle_report_bridge
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0011
preserved_exact_tokens:
- auditor_cycle_report
- validation_pass_report
- cycle_report_ref
- compatibility_only
- phase_plan_ref
- requirements_quality_report_ref
- workflow_run_id
- pass_verdict
- wizard_snapshot_ref
- launched_run_id
- launched_run_ref
- filenames
- timestamps
- provider-native traces
negative_constraints:
- Preview, validation, review, and resume surfaces must not reconstruct joins from filenames, timestamps, or provider-native traces.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/interview-subagent-integration.md owns interview integration behavior while referenced SSOT documents retain implementation ownership.
owner_hints:
- Plans/interview-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md'
```

### ISI-001 - Interview Feature Subagent Integration Retired Source-Preserving Bridge

```yaml
plan_unit_id: ISI-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: The former interview-subagent-integration doc-level source-preserving bridge is retired after Phase 2B atomized interview-subagent-integration-S0004 through S0011 into ISI-002 through ISI-018 and structurally dispositioned S0001, S0002, S0003, S0012, S0013, and S0015. ISI-001 remains only as migration lineage for interview-subagent-integration-S0014 and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained ISI PlanUnits where applicable.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- ISI-001 no longer uses source_preserving_planunit compile mode.
- ISI-002 through ISI-018 own product coverage for atomized interview-subagent-integration spans.
- Structural spans are explicit coverage dispositions, not product coverage owned by ISI-001.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/interview-subagent-integration.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:interview-subagent-integration-S0014
preserved_exact_tokens:
- ISI-001
- source_preserving_planunit
- source_preserving_bridge_retired
- Interview Feature Subagent Integration -- Implementation Plan
- interview-subagent-integration-S0014
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- ISI-001 must not re-own atomized interview-subagent-integration product coverage.
- ISI-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- ISI-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former ISI-001 source-preserving bridge is retired by Phase 2B batch 083.
owner_boundary_notes:
- ISI-002 through ISI-018 own atomized interview-subagent-integration product coverage.
- interview-subagent-integration-S0014 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/interview-subagent-integration.md
```

## Migration Coverage

Original hash: `faeb6f2c9d9ee2a62871930314b90fbe5278b503f32f1d84f77a85f32e15a2c6`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 083 atomized `interview-subagent-integration-S0004` through `interview-subagent-integration-S0011` into `ISI-002` through `ISI-018`, with dense change-summary, runtime-boundary, question, requested/effective, and handoff spans split where safe. `interview-subagent-integration-S0001`, `interview-subagent-integration-S0002`, `interview-subagent-integration-S0003`, `interview-subagent-integration-S0012`, `interview-subagent-integration-S0013`, and `interview-subagent-integration-S0015` are structural or reference dispositions. `ISI-001` is retired as migration-lineage compatibility coverage for `interview-subagent-integration-S0014`; `Plans/interview-subagent-integration.md` has no residual source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Interview Subagent Integration owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### ISI-019 - Interview Prompt Route DRY Consumer

```yaml
plan_unit_id: ISI-019
unit_type: requirement
status: accepted
owner_doc: Plans/interview-subagent-integration.md
canonical_text: >-
  Interview prompt routes consume the shared DRY Method Instruction Bundle route from Prompt Pipeline and Agent Rules
  Context. Interview does not define a separate DRY prompt model, local DRY prose, or route-local effective-state enum.
  Interview clarification, handoff, and question flows preserve DRY receipt fields through the shared CV-299 contract
  when DRY applies, degrades, is disabled, blocks, or caveats the route.
gui_related: false
gui_classification_reason: Defines Interview prompt-route behavior and receipt fields rather than visual presentation.
depends_on: [ARC-036, PP-057, CV-299, DR-036, DP-063]
unblocks: [ATS-018]
acceptance_criteria:
  - Interview consumes the shared DRY Instruction Bundle route.
  - Interview does not fork DRY prose or effective-state enums.
  - DRY receipt state remains available across Interview clarification, question, and handoff paths.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Interview DRY route conformance fixtures
risk_class: interview_dry_shadow_route
reasoning_tier: high
context_scope: interview_dry_method_consumer
implementation_surfaces:
  - Plans/interview-subagent-integration.md
  - future Interview prompt routes
node_compile_hint:
  mode: interview_dry_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-prompt-route-static-conformance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0076
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0076, atom-0083]
preserved_exact_tokens:
  - "Interview"
  - "Instruction Bundle"
  - "DRY Method"
  - "question flows"
  - "handoff"
  - "dry_method_effective_state"
negative_constraints:
  - Do not define a separate Interview DRY prompt model.
  - Do not create route-local DRY enums that diverge from CV-299.
owner_hints:
  - Plans/interview-subagent-integration.md
  - Plans/Prompt_Pipeline.md
  - Plans/agent-rules-context.md
```
