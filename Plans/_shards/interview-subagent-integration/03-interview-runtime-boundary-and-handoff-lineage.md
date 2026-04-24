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
