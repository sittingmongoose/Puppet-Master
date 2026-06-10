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

### validation_pass_report bridge
- Extend `validation_pass_report` with planning/governance lineage and an explicit bridge into the launched run.
- Validation/governance lineage preserves `phase_plan_ref`, `requirements_quality_report_ref`, `workflow_run_id`, `pass_verdict`, `wizard_snapshot_ref`, and `launched_run_id` / `launched_run_ref`.
- Preview, validation, review, and resume surfaces reuse that bridge instead of reconstructing joins from filenames, timestamps, or provider-native traces.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md
