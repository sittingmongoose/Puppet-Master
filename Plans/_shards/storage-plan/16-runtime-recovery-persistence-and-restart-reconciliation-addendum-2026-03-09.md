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

Canonical records for this feature set must support rebuild, resume, auditability, and UI reconstruction without hidden side stores.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/orchestrator-subagent-integration.md

Required canonical records:
- child runs and attempts
- child batch and subgroup structure
- crew and crew-board state
- planning-output projections derived from plan-mode children
- context-shaping state tied to stable block refs
- requested/effective runtime snapshots for child launches
- blocked-episode and awaiting-parent correlation metadata

Canonical truth exclusions:
- `.puppet-master/memory/*` is not canonical child or crew continuity storage.
- `active-agents.json` and `active-subagents.json` are not canonical live-state stores.
- provider-native session trees are correlation data, not PM identity.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/WorktreeGitImprovement.md
### Counter rule
- `attempt_count` is the total started attempts for the node in the run
- `automatic_retry_count`, `prerequisite_resume_count`, `manual_resume_count`, and `remediation_retry_count` remain independent stored counters
- `retry_count` is derived display data only and MUST NOT drive policy

### Restart and stale history
Attempts from older generations, or in-flight attempts that cannot resume after restart, transition to `stale_historical`. They remain queryable but are never resumable.

### Identity and field-name rules
Canonical naming and identity rules:
- persisted requested/effective runtime base fields keep the names defined in `Plans/Contracts_V0.md`
- additive runtime disclosure fields MAY extend those snapshots but MUST NOT rename or shadow them
- canonical persisted references use stable `*_id` or `*_ref` fields; user-facing labels remain additive disclosure fields only
- `account_id` identifies account-backed runtime subjects
- `connection_profile_id` identifies server-profile-backed runtime subjects
- `terminal_session_id` remains PTY continuity identity
- `terminal_workgroup_id`, `terminal_leaf_pane_id`, and `editor_terminal_panel_id` identify the terminal layout objects introduced by the updated bottom-terminal/editor model

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

Additional runtime-field rules:
- `requested_platform` and `effective_platform` identify the concrete provider entry/runtime surface used for execution.
- `provider_family_id` is additive and groups pooled or related runtime surfaces without replacing the concrete provider entry fields.
- `requested_runtime_platform_id`, `effective_runtime_platform_id`, `requested_model_provider_id`, `effective_model_provider_id`, and billing/entity fields are additive disclosure fields only.
- `selectable_unit_id` remains diagnostic/scheduler data and MUST NOT become a canonical persisted runtime identity field.
- terminal historical records MUST preserve the effective restore outcome and capability degradation state captured for that record; the UI MUST NOT infer those values later from current local capabilities.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md
