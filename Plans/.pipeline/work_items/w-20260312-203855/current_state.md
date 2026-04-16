# Current State

## Work Item
- work_id: `w-20260312-203855`
- mode: `migrated`
- topic_or_scope: `Orchestrator rewrite transfer-fidelity audit, legacy-canon cleanup readiness, and reconciliation prep`
- status: `blocked`

## Scope
- Keep the work item in compact audit form for `8` unresolved blocker families, `8` canon items, and `19` affected docs.
- Preserve the sharpened audit framing: several blockers remain real, but the current failures are mostly split owner anchors, missing discoverable headings, under-propagated consumer payloads, and exact stale survivors rather than total canon absence.

## Locked Decisions
- This remains the existing migrated work item; no new work item is created.
- `canon_inventory.json` is the exact canon source for required terms, behaviors, structural headings, targets, and stale literals to retire.
- `open_gaps.json` keeps only unresolved blockers and their exact missing items.
- `reconciliation_plan.json` remains absent while material blockers remain non-zero.
- Status remains `blocked`; `open_gaps.json.summary.material_blockers = 8` is still the controlling readiness fact.
- `meta.json.next_required_stage = Audit Mode` remains the operative stage because unresolved blockers still require audit-stage doc repair before any planning mutation pass.
- This audit pass confirmed that glossary labels, receipt bridge refs, account-history records, and requested/effective runtime visibility are already transferred in several owner/consumer docs; the unresolved work is now the missing owner anchors, missing consumer sections, and remaining stale survivors.

## Exact Canon That Must Survive
- `execution_unit_context` remains the shared runtime identity packet, carrying `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `operational_identity`, and `tool_use_id`.
- `route_target` remains the shared route/open payload with closed `target_kind`, canonical `subject_id` families, selector exclusivity, and command normalization anchored by `command_kind` and `normalization`.
- Storage owns runtime-artifact identity, worktree/lane records, `orchestrator.project_state.{project_id}`, and explicit `historical` / `archived` / `removed` semantics.
- Receipt and validation lineage must preserve `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `validation_pass_report`, `workflow_run_id`, `run_id`, `pass_verdict`, `phase_plan_ref`, and `requirements_quality_report_ref`.
- Blocked episodes stay anchored by `blocked_sequence` and `approval_scope_key`, with unified tool/runtime attribution and one escalation ladder spanning `info`, `warning`, `attention_required`, `blocked`, and `system_notification`.
- The help system remains the three-part contract: `canonical term system`, `contextual help system`, and `dedicated help-entry contract`.
- Orchestrator remains the why/coordination surface beside worktree-first Source Control and must own scope, current-vs-historical behavior, and separate health/activity/attention semantics.
- Usage, interview, and account-history surfaces must use stable internal account identity plus projection-health-aware degrade behavior.

## Docs / Sections In Scope
- Owner targets: `Plans/Contracts_V0.md` (`### 5.1B Persona/Runtime Snapshot Payload Contract`, `7.3 \`route_target\``), `Plans/Executor_Protocol.md` (`### 5.1 Unified \`DispatchContext\` schema`), `Plans/storage-plan.md` (`### Required redb keys`, `### Restart and stale history`, `### Cross-surface receipt record`), `Plans/Glossary.md` (`### Orchestrator rewrite terms`, `### Runtime and routing terms`), `Plans/UI_Command_Catalog.md` (`### 2.0 Command entry contract (doc-level)`, `Search-command routing`, `Canonical runtime recovery command ownership`), `Plans/Orchestrator_Page.md` (`## 1. Scope and canonical model`, `Current vs historical run behavior`, `Concern and notification model`)
- Highest-pressure consumer docs: `Plans/usage-feature.md`, `Plans/assistant-chat-design.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/FinalGUISpec.md`, `Plans/interview-subagent-integration.md`, `Plans/human-in-the-loop.md`

## Open Blockers
- `execution_unit_context` is materially transferred, but owner authority is still split across differently named sections in `Plans/Contracts_V0.md` and `Plans/Executor_Protocol.md`, subagent consumers still under-carry `requested_account_binding` / `requested_account_policy` / `tool_use_id`, and stale `TierContext` / `tier_id` residue still survives.
- `route_target` and command normalization are materially transferred, but `### 2.0 Command entry contract (doc-level)`, `Search-command routing`, and `Canonical runtime recovery command ownership` still are not discoverable owner anchors, `detached_window` still survives in `target_kind`, and search commands still use stale `result_id`.
- Storage/runtime-artifact canon is substantially transferred, but `orchestrator.project_state.{project_id}` and the exact `historical` / `archived` / `removed` distinction are still unresolved.
- Receipt and validation lineage are partially transferred, but the explicit `### Cross-surface receipt record` owner section is still missing and the remaining unresolved receipt fields are now narrowed to `run_id` in receipt minimum fields, `pass_verdict`, `phase_plan_ref`, `requirements_quality_report_ref`, and the missing consumer anchors.
- Blocked-episode canon is materially transferred in HITL, but Tools/chat consumers still lack blocked-packet carry-through for `blocked_sequence` / `approval_scope_key`, still lack a fully owned escalation schema, and assistant chat still contains stale closure text.
- Glossary/help canon already carries labels and core term rows, but the required owner headings and instantiated help-entry sections are still absent.
- Orchestrator scope/history/attention canon is materially transferred inline, but discoverable owner headings remain weak and `Plans/FinalGUISpec.md` still contains a live `restore points` contradiction.
- Account-history and projection-health canon is already present in storage, Final GUI, and Interview, but `Plans/usage-feature.md` still under-specifies usage attribution, export taxonomy, account history, and projection-health-aware degrade behavior.
- Highest-pressure docs remain `Plans/Orchestrator_Page.md`, `Plans/usage-feature.md`, `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/Contracts_V0.md`, and `Plans/FinalGUISpec.md`.
- Exact stale survivors still to retire: `TierContext`, `tier_id`, `detached_window`, `result_id`, `artifact_kind`, `task_id`, `{ tool_name, invocation_summary, options }`, `No remaining gaps`, `restore points`.
- All unresolved blocker entries still carry severity `blocker`, and their next-resolution stages still point to `Audit Mode`.

## Next Required Stage
- `Audit Mode`

## Resume Notes
- Start from `open_gaps.json` and the top-pressure docs first: `Plans/Orchestrator_Page.md`, `Plans/usage-feature.md`, `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/Contracts_V0.md`, and `Plans/FinalGUISpec.md`.
- The sharpest next audit targets are: split runtime owner anchors in `Plans/Contracts_V0.md` / `Plans/Executor_Protocol.md`, missing command-routing headings in `Plans/UI_Command_Catalog.md`, missing receipt and account-history owner anchors in `Plans/storage-plan.md`, and missing consumer sections in `Plans/usage-feature.md`.
