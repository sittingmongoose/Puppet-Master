## Runtime Recovery Persistence and Restart Reconciliation Addendum (2026-03-09)
### Promoted Section 15 restore-scope rules

Restore eligibility:
- workspace tabs restore independently with project identity, active surface, and local shell state
- detached windows restore only when their surface class and platform support allow it
- in-shell browser tabs restore by project and workspace tab
- auth sessions and automation sessions do not auto-restore as shell browser tabs
- terminal sessions and dev sessions restore as records of prior state; a live process is not presumed healthy after restart without verification

Project-switch rule:
- switching projects recalculates effective tool/MCP/persona/browser capability state for the new project context
- background activity from the previous project remains queryable and visible through its own project/workspace identities rather than being collapsed into the new active project
This section is the canonical persistence contract for runtime recovery, blocked episodes, usage attribution, and runtime identity needed by Orchestrator, Run Graph, HITL, and chat surfaces.

### Canonical keys
- `scheduler_pass_record`: key = `run_id`, `scheduler_pass_id`
- `blocked_projection`: key = `run_id`, `node_id`, `blocked_sequence`
- `attempt_record`: key = `run_id`, `node_id`, `attempt_id`
- `usage_record`: key = `run_id`, `attempt_id?`, `usage_sequence`
- `evidence_record`: key = `run_id`, `node_id?`, `evidence_id`
- `wizard_runtime_state`: key = `wizard_id`
- `safe_point_restore_record`: key = `safe_point_id`, `restore_sequence`
- `thread_blocked_notice`: key = `thread_id`, `blocked_sequence`

`attempt_id?` and `thread_id?` remain fields on `blocked_projection` and are not primary-key components.

### Cross-surface receipt record

The runtime receipt record is the canonical bridge between Orchestrator, Source Control, GitHub Actions, Docker Manager, Artifacts, and Usage.

Minimum fields:
- `run_id`
- `attempt_id`
- `project_id`
- `repo_id?`
- `worktree_id?`
- `branch_ref?`
- `commit_range?`
- `workflow_refs?` with workflow / run / job / step identifiers
- `docker_refs?` with runtime/context/image/publish/template identifiers
- `kubernetes_refs?` with context/namespace/workload/rollout identifiers
- `usage_event_ref?`
- `created_at_utc`

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Orchestrator_Page.md

### Canonical records
1. `attempt_record`
   - fields include `scheduler_pass_id`, requested/effective persona snapshot refs, requested/effective model snapshot refs, requested/effective permission snapshot refs, `requested_auth_mode?`, `effective_auth_mode?`, `requested_account_policy?`, `effective_account_id?`, `effective_project_id?`, `account_switch_reason?`, `replan_generation`, `mutation_capable`, `safe_point_id?`, `provider_attempt_ref?`, remediation lineage refs, and terminal outcome fields
2. `blocked_projection`
   - fields include `blocked_reason_code`, ordered `allowed_action_ids[]`, `preserved_local_work`, `requires_safe_point_restore?`, prerequisite metadata, `failure_class?`, `detail_ref?`, `attempt_id?`, and `thread_id?`

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md#EventRecord

3. `usage_record`
   - fields include `run_kind`, `run_id`, `node_id?`, `attempt_id?`, `thread_id?`, `usage_event_ref?`, `effective_platform`, `effective_model`, `effective_auth_mode?`, `effective_account_id?`, `provider_account_id?`, `usage_source_kind?`, `signal_confidence?`, `effective_project_id?`, `input_tokens`, `output_tokens`, `total_tokens`, `estimated_cost?`, and usage timestamps suitable for rollups and ledger views
4. `evidence_record`
   - fields include `summary`, `summary_kind?`, evidence refs, and any parent-summary/handoff refs needed by completed-prose surfaces
5. `thread_blocked_notice`
   - fields include `node_id?`, `attempt_id?`, active blocked metadata, `message_id`, and `resume_url?`
6. `wizard_runtime_state`
   - fields include `wizard_status`, `wizard_step`, `blocked_reason_code?`, `clarification_round_count`, `report_ref?`, `resume_url?`, `decomposition_degraded`, `degradation_reason?`, and `replan_generation?`

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Orchestrator_Page.md
### Counter rule
- `attempt_count` is the total started attempts for the node in the run
- `automatic_retry_count`, `prerequisite_resume_count`, `manual_resume_count`, and `remediation_retry_count` remain independent stored counters
- `retry_count` is derived display data only and MUST NOT drive policy

### Restart and stale history
Attempts from older generations, or in-flight attempts that cannot resume after restart, transition to `stale_historical`. They remain queryable but are never resumable.

### Identity and field-name rules
- canonical blocked-action field is `allowed_action_ids[]`
- canonical persisted references use `*_ref` fields; raw `*_path` naming is compatibility-only
- requested vs effective persona/platform/model state must remain queryable from runtime records so UI surfaces do not reconstruct it heuristically

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Personas.md
