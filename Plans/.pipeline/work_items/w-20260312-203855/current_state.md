# Current State

## Work Item
- work_id: `w-20260312-203855`
- mode: `migrated`
- topic_or_scope: `Orchestrator rewrite transfer-fidelity audit, legacy-canon cleanup readiness, and reconciliation prep`
- status: `blocked`

## Scope
- Ready Check confirmed the canon bundle is usable but not planning-ready because `8` unresolved blocker families still remain across `19` affected docs.
- Preserve the partial-transfer refinements so the bundle continues to distinguish genuinely missing canon from stubbed, over-summarized, and stale-survivor transfer failures.

## Locked Decisions
- This remains the existing migrated work item; no new work item is created.
- `canon_inventory.json` is the exact canon source for required terms, behaviors, structural headings, targets, and stale literals to retire.
- `open_gaps.json` keeps only unresolved blockers and their exact missing items.
- `reconciliation_plan.json` remains absent while material blockers remain non-zero.
- Ready Check does not advance planning while `open_gaps.json.summary.material_blockers = 8`.
- The next required stage returns to `Audit Mode` because every unresolved blocker still depends on audit-stage doc repair rather than mutation planning.

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
- `execution_unit_context` is partially transferred, but owner authority is still split between `Plans/Contracts_V0.md` and `Plans/Executor_Protocol.md`, and stale `TierContext` / `tier_id` residue still survives in subagent docs.
- `route_target` and command normalization are partially transferred, but `Search-command routing` and `Canonical runtime recovery command ownership` are still missing as discoverable owner headings, `detached_window` still survives in `target_kind`, and search commands still use stale `result_id`.
- Storage/runtime-artifact canon is substantially transferred, but `orchestrator.project_state.{project_id}` and the exact `historical` / `archived` / `removed` distinction are still unresolved.
- Receipt and validation lineage are partially transferred, but the explicit `### Cross-surface receipt record` owner section and the remaining lineage fields are still missing.
- Blocked-episode canon is partially transferred, but the full blocked packet is still under-propagated in Tools/chat consumers and assistant chat still contains stale closure text.
- Glossary/help canon is partially transferred, but the required owner headings and instantiated help-entry sections are still absent.
- Orchestrator scope/history/attention canon is partially transferred, but discoverable owner headings remain weak and `restore points` still survives as a false cognate.
- Usage/interview/account-history canon still lacks stable internal account identity and projection-health-aware degrade behavior.
- Highest-pressure docs: `Plans/Orchestrator_Page.md`, `Plans/usage-feature.md`, `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/Contracts_V0.md`, `Plans/FinalGUISpec.md`
- Exact stale survivors still to retire: `TierContext`, `tier_id`, `detached_window`, `result_id`, `artifact_kind`, `task_id`, `{ tool_name, invocation_summary, options }`, `No remaining gaps`, `restore points`
- Planning readiness failed because blocker severities remain `blocker` and blocker next-resolution stages still point to `Audit Mode`.

## Next Required Stage
- `Audit Mode`

## Resume Notes
- Start from `open_gaps.json` and audit the highest-pressure docs first: `Plans/Orchestrator_Page.md`, `Plans/usage-feature.md`, `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/Contracts_V0.md`, and `Plans/FinalGUISpec.md`.
- The next ready-check should happen only after those audit-stage blockers are reduced to zero and no blocker still points to `Audit Mode`.
