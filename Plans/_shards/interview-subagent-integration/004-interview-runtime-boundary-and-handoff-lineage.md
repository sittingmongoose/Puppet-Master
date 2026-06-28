# Shard 004: Interview runtime boundary and handoff lineage

Source: `Plans/interview-subagent-integration.md`

Source lines: L20-L54

Source SHA256: `09870b344b6b002b65b4525e209ddfc4638b45ffe8f2523a543c6ee02325e9a5`

---

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
