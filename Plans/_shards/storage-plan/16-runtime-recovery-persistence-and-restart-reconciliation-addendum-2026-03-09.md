## Runtime Recovery Persistence and Restart Reconciliation Addendum (2026-03-09)
### Promoted Section 15 restore-scope rules
Restore eligibility:
- workspace tabs restore independently with project identity, active surface, and local shell state
- detached windows restore only when their surface class and platform support allow it
- `workspace_preview` restores by project and workspace tab
- `detached_preview` restores with its originating normal browsing session when supported
- `automation_session` and `auth_session` do not silently resume active live work after restart
- terminal sessions and dev sessions restore as records of prior state; a live process is not presumed healthy after restart without verification

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

Terminal restore guarantees:
- section, tab, pane, label, pin state, selected focus, and linked dev-session refs are `guaranteed_durable`
- bounded transcript snapshots, command-block metadata, cwd snapshots, shell-integration hints, and derived output or ports linkage are `best_effort_durable`
- live PTY continuity, unlimited scrollback, active alternate-screen TUI content, and in-flight selection or search highlights are `transient_only`

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Glossary.md, ContractName:Plans/FinalGUISpec.md

Canonical restore outcomes are:
- `restored_live`
- `restored_exited`
- `restored_disconnected`
- `restored_without_history`

ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md

Browser recovery rules:
- browser crash or runtime loss preserves recoverable metadata and any completed evidence artifacts when possible
- reopened automation/auth sessions return as stopped or attention-required rather than as silently running live sessions
- `Reopen`, `Retry`, and `Keep Closed` are the canonical recovery actions for failed browser sessions
- promotion from paused automation into normal browsing copies/promotes eligible state into a normal browser profile and changes future restore behavior accordingly

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Wiring_Matrix.md

Project-switch rule:
- switching projects recalculates effective tool, MCP, Persona, browser capability, and terminal capability state for the new project context
- background activity from the previous project remains queryable and visible through its own project and workspace identities rather than being collapsed into the new active project
- browser and terminal requested/effective state snapshots remain frozen per runtime record and MUST NOT be recomputed from current settings

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/usage-feature.md
### Canonical keys
- `scheduler_pass_record`: key = `run_id`, `scheduler_pass_id`
- `blocked_projection`: key = `run_id`, `node_id`, `blocked_sequence`
- `attempt_record`: key = `run_id`, `node_id`, `attempt_id`
- `usage_record`: key = `run_id`, `attempt_id?`, `usage_sequence`
- `evidence_record`: key = `run_id`, `node_id?`, `evidence_id`
- `wizard_runtime_state`: key = `wizard_id`
- `safe_point_restore_record`: key = `safe_point_id`, `restore_sequence`
- `thread_blocked_notice`: key = `thread_id`, `blocked_sequence`
- `terminal_workspace_state`: key = `project_id`, `workspace_tab_id`
- `terminal_section_record`: key = `project_id`, `terminal_section_id`
- `terminal_tab_record`: key = `project_id`, `terminal_tab_id`
- `terminal_pane_record`: key = `project_id`, `terminal_pane_id`
- `terminal_session_record`: key = `project_id`, `terminal_session_id`
- `terminal_command_block`: key = `project_id`, `terminal_session_id`, `command_block_id`
- `dev_session_record`: key = `project_id`, `dev_session_id`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md

`attempt_id?` and `thread_id?` remain fields on `blocked_projection` and are not primary-key components.

Rules:
- terminal workspace containers use stable terminal section, tab, and pane keys even when their bound sessions are replaced
- command-block identity is subordinate to the owning `terminal_session_id`
- `dev_session_record` is workflow-scoped and may link multiple terminal sessions without collapsing them into one key family

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md
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
3. `usage_record`
   - fields include `run_kind`, `run_id`, `node_id?`, `attempt_id?`, `thread_id?`, `usage_event_ref?`, `effective_platform`, `effective_model`, `effective_auth_mode?`, `effective_account_id?`, `provider_account_id?`, `usage_source_kind?`, `signal_confidence?`, `effective_project_id?`, `input_tokens`, `output_tokens`, `total_tokens`, `estimated_cost?`, and usage timestamps suitable for rollups and ledger views
4. `evidence_record`
   - fields include `summary`, `summary_kind?`, evidence refs, and any parent-summary/handoff refs needed by completed-prose surfaces
5. `thread_blocked_notice`
   - fields include `node_id?`, `attempt_id?`, active blocked metadata, `message_id`, and `resume_url?`
6. `wizard_runtime_state`
   - fields include `wizard_status`, `wizard_step`, `blocked_reason_code?`, `clarification_round_count`, `report_ref?`, `resume_url?`, `decomposition_degraded`, `degradation_reason?`, and `replan_generation?`

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md#EventRecord

7. `terminal_workspace_state`
   - fields include ordered terminal sections, section presentation (`docked` or `detached`), selected section or tab refs, tab order, pane tree, pane-to-session bindings, labels, pin state, linked `dev_session_id?`, recovery banners, and bounded transcript-snapshot refs used by GUI projection `terminal_state:v1`
8. `terminal_session_record`
   - fields include `terminal_session_id`, `project_id`, `workspace_tab_id`, `cwd_snapshot`, `shell_profile_label?`, `shell_integration_tier`, `requested_renderer_mode?`, `effective_renderer_mode`, `capability_degradations[]`, lifecycle state, exit or stop metadata, transcript-retention tier, restore outcome, transcript refs, and linked `dev_session_id?`
9. `terminal_command_block`
   - fields include `command_block_id`, transcript anchor refs, observed command label when supported, confidence tier, start and end timestamps, cwd snapshot, exit metadata, and state such as `running`, `succeeded`, `failed`, `terminated`, or `degraded_observation`
10. `dev_session_record`
    - fields include `dev_session_id`, intent or mode, lifecycle state, linked terminal session refs, linked Output or Problems or Ports refs, reload mode (`hot_reload` or `live_reload` or `none`), port bindings, and last-known recovery state

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md
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
- terminal requested/effective capability disclosure uses explicit fields such as `requested_renderer_mode?`, `effective_renderer_mode`, `shell_integration_tier`, `capability_degradations[]`, `restore_outcome`, and transcript-retention tier
- `terminal_session_id` is the canonical meaning of same-session shell continuity; `dev_session_id` is higher-level workflow continuity only

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md

Additional rules:
- GUI projection key `terminal_state:v1` may remain as a compatibility-facing projection name, but canonical storage ownership stays with terminal workspace, session, and command-block records
- restored historical terminal records MUST NOT be misreported as live sessions solely because durable metadata exists
- requested terminal presentation preferences do not override the effective restore outcome or effective capability state captured for that historical record

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md
