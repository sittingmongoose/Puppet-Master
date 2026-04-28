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
