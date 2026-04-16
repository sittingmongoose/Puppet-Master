# Current State

## Current status
- Work item: `w-20260312-203855`
- Status: `blocked`
- Ready check verdict: **not ready for planning**
- Canon inventory is usable and non-empty: `8` canon items with exact fields, headings, cross-reference targets, and stale literals to retire.
- Open blockers remain material: `8` blocker families backed by `45` live gap evidences across `19` docs.

## Locked canon
- `execution_unit_context` is the runtime identity owner packet and must carry `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `effective_account_id`, and `operational_identity`.
- `route_target` remains the shared routing payload, with closed `target_kind`, canonical `subject_id` families, selector exclusivity, and command normalization anchored by `command_kind`.
- Storage owns runtime-artifact identity, worktree/lane records, `orchestrator.project_state.{project_id}`, and the distinct lifecycle terms `historical`, `archived`, and `removed`.
- Receipt and validation lineage must preserve `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `validation_pass_report`, `workflow_run_id`, and `run_id`.
- Blocked episodes stay anchored by `blocked_sequence` and `approval_scope_key`, with unified tool/runtime attribution and one shared escalation ladder.
- The help system remains a three-part contract: `canonical term system`, `contextual help system`, and `dedicated help-entry contract`.

## Open blockers
- `execution_unit_context` and requested/effective runtime identity are still missing exact owner and consumer transfer across Contracts, Executor, chat, subagent, interview, and usage surfaces.
- `route_target`, closed routing enums, selector rules, and command normalization still lack exact owner sections and consumer propagation.
- Storage/runtime-artifact ownership still lacks exact key families, `orchestrator.project_state.{project_id}`, and explicit `historical` / `archived` / `removed` semantics.
- Receipt, bridge, and `validation_pass_report` lineage still do not carry the full downstream handoff contract.
- Blocked episodes, restart restoration, tool events, and HITL approvals still do not share one exact blocked-identity packet and escalation ladder.
- Help/glossary owner sections still do not instantiate rewrite, routing, and historical term entries using the help-entry contract.
- Orchestrator still lacks explicit owner sections for scope boundary, current-vs-historical behavior, and health/activity/attention separation.
- Usage/interview/account-history surfaces still do not carry stable internal account identity and projection-health-driven degrade behavior.
- Exact stale survivors still to retire: `TierContext`, `tier_id`, `detached_window`, `result_id`, `artifact_kind`, `task_id`, `{ tool_name, invocation_summary, options }`, `No remaining gaps`, `restore points`.

## Next required stage
- `Audit Mode`
