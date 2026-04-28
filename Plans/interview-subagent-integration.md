# Interview Feature Subagent Integration -- Implementation Plan

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-065: Shared conversational/runtime boundary
- Coverage rows: cov-065
- Fidelity gap refs: cov-065
- Required fidelity items:
- Exact required item: Assistant/chat/interview/builder actors share provider/runtime identity semantics with Orchestrator
- Exact required item: They remain distinct actor/run kinds rather than package/seam/node execution objects
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-065: Shared conversational/runtime boundary` exists in `Plans/interview-subagent-integration.md`.
- Exact acceptance check: The `cov-065` repair states the exact requirement: Assistant/chat/interview/builder actors share provider/runtime identity semantics with Orchestrator
- Exact acceptance check: The `cov-065` repair states the exact requirement: They remain distinct actor/run kinds rather than package/seam/node execution objects
- Exact acceptance check: The `cov-065` repair is in the owner section for `Plans/interview-subagent-integration.md` and is not only a downstream consumer note.

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

### Wizard and interview handoff packet
- Extend wizard/interview handoff with project/thread/wizard/runtime identity and execution_role.
- The canonical handoff packet carries `project_id`, `thread_id`, `wizard_id`, `interview_session_id`, requested/effective runtime identity, requested/effective account identity, `execution_role`, and an explicit `launched_run_id` / `launched_run_ref` bridge.
- Provider-native delegation syntax remains interoperability-only; the canonical handoff is the Puppet Master child-run packet.

### validation_pass_report bridge
- Extend `validation_pass_report` with planning/governance lineage and an explicit bridge into the launched run.
- Validation/governance lineage preserves `phase_plan_ref`, `requirements_quality_report_ref`, `workflow_run_id`, `pass_verdict`, `wizard_snapshot_ref`, and `launched_run_id` / `launched_run_ref`.
- Preview, validation, review, and resume surfaces reuse that bridge instead of reconstructing joins from filenames, timestamps, or provider-native traces.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md
