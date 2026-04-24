# Interview Feature Subagent Integration -- Implementation Plan

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
- Interview actors share provider/runtime identity semantics with Orchestrator.
- Interview actors remain interview/session actors; they do not become graph nodes, packages, seams, lanes, or worktrees merely because they launch child work.
- Requested/effective runtime identity, `execution_role`, and `operational_identity` remain visible on interview-facing runtime rows and delegated child-run surfaces.

### Wizard and interview handoff packet
- The handoff from wizard/interview planning into execution MUST carry `project_id`, `thread_id`, `wizard_id`, requested/effective runtime identity, and `execution_role`.
- The same handoff MUST expose an explicit launched-run bridge so review, resume, and drill-through land on the run that actually executes the approved work.
- Provider-native delegation syntax remains interoperability-only; the canonical handoff is the PM child-run packet.

### validation_pass_report bridge
- `validation_pass_report` remains an upstream artifact tied to canonical receipt lineage rather than a local replacement record.
- Validation/governance lineage MUST preserve `phase_plan_ref`, `requirements_quality_report_ref`, `workflow_run_id`, `pass_verdict`, and the launched-run bridge.
- Preview, validation, and resume surfaces reuse that shared lineage instead of reconstructing joins from filenames or timestamps.
