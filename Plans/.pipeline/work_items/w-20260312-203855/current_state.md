# Current State

## Work Item
- work_id: `w-20260312-203855`
- mode: `migrated`
- topic_or_scope: `Orchestrator rewrite transfer-fidelity audit, legacy-canon cleanup readiness, and reconciliation prep`
- status: `blocked`
- condensed blocker bundle: `8` blocker families, `8` canon items, `20` affected docs, `62` underlying evidence refs
- ready check verdict: `canon_inventory.json` is usable, but the work item is not planning-ready because `open_gaps.json.summary.material_blockers = 8` and every unresolved gap still routes through `Audit Mode`

## Locked Decisions
- This remains the existing migrated work item; no new work item is created.
- `canon_inventory.json` is the exact canon source for terms, behaviors, structural headings, targets, and stale literals to retire.
- `open_gaps.json` keeps only unresolved blockers and their exact missing items.
- `reconciliation_plan.json` remains absent while material blockers remain non-zero.
- The latest condensation synced the sharpened storage and receipt blocker wording into `canon_inventory.json`, including the broken `Plans/storage-plan.md` anchor consumers.
- The latest condensation removed the overstated `restore points` contradiction from `canon-007`; the remaining Orchestrator blocker is structural-heading and broken-reference drift only.
- Ready Check stays blocked until the open blocker set is reduced to zero and no unresolved gap still routes through `Audit Mode`.

## Exact Canon That Must Survive
- `execution_unit_context` remains the shared runtime identity packet with `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `operational_identity`, and `tool_use_id`.
- `route_target` remains the shared route/open payload with closed `target_kind`, canonical `subject_id` families, selector exclusivity, and command normalization anchored by `command_kind` and `normalization`.
- Storage owns runtime-artifact identity, worktree/lane records, `orchestrator.project_state.{project_id}`, projection freshness/health, and explicit `historical` / `archived` / `removed` semantics.
- Receipt and validation lineage must preserve `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `validation_pass_report`, `workflow_run_id`, `run_id`, `pass_verdict`, `phase_plan_ref`, and `requirements_quality_report_ref`.
- Blocked episodes stay anchored by `blocked_sequence` and `approval_scope_key`, with unified tool/runtime attribution and one escalation ladder spanning `info`, `warning`, `attention_required`, `blocked`, and `system_notification`.
- The help system remains the three-part contract: `canonical term system`, `contextual help system`, and `dedicated help-entry contract`.
- Orchestrator remains the why/coordination surface beside worktree-first Source Control and must keep scope, current-vs-historical behavior, and health/activity/attention separate.
- Usage, interview, and account-history surfaces must use stable internal account identity plus projection-health-aware degrade behavior.

## Open Blockers
- `gap-001`: `execution_unit_context` is materially transferred, but the exact `### 5.1B Persona/Runtime Snapshot Payload Contract` owner anchor is still absent, the live required-field enumeration still omits `requested_account_binding`, `requested_account_policy`, and `operational_identity`, subagent/interview/usage consumers still drop parts of the requested/effective account field set, and `TierContext` / `tier_id` still survive.
- `gap-002`: `route_target` and command normalization are materially transferred, but the exact UI command ownership anchors are still missing, `Plans/UI_Command_Catalog.md` still points at non-existent Orchestrator search-routing ownership, `detached_window` still survives, and `result_id` remains live in search command args.
- `gap-003`: storage/runtime-artifact canon is substantially transferred, and storage now clearly owns the broader `project_summary.v1:{project_id}` record family, but the exact `orchestrator.project_state.{project_id}` key still is absent, `Plans/storage-plan.md` still lacks discoverable `Canonical records` / `Restart and stale history` anchors, live consumers in `Plans/Contracts_V0.md`, `Plans/Orchestrator_Page.md`, and `Plans/WorktreeGitImprovement.md` still point at those missing anchors, and the lifecycle boundary semantics for `historical` / `archived` / `removed` remain scattered and under-specified.
- `gap-004`: receipt and validation lineage are materially transferred, `run_id` is already present in the receipt minimum-fields list, and validation-pass lineage fields already live in `Plans/Project_Output_Artifacts.md`, but the explicit receipt owner heading is still missing, `Plans/Runtime_Artifacts_Panel.md` still points at that missing anchor, and the drill-through / validation consumer anchors still are absent.
- `gap-005`: blocked-episode canon is materially transferred, but the live `blocked_notice` payload still carries only `blocked_family` and `allowed_action_ids[]`, Usage still only counts blocked attempts by `blocked_reason_code`, `action_available` still lacks a discoverable owner, and stale closure/ask-tuple residue still survives.
- `gap-006`: glossary/help canon already carries the field template, labels, and many core terms, but the required owner headings and populated help-entry rows are still absent, the live glossary still uses two-column tables or inline bullets instead of the full help-entry field set, and `Plans/Orchestrator_Page.md` still contains broken references to `Plans/Glossary.md#Orchestrator rewrite terms`.
- `gap-007`: Orchestrator scope/history/attention canon is materially transferred inline, but discoverable owner headings are still missing and the broken `Plans/Orchestrator_Page.md#11. Source Control boundary` reference still survives in `Plans/GitHub_Integration.md`, `Plans/storage-plan.md`, and `Plans/WorktreeGitImprovement.md`.
- `gap-008`: account-history and projection-health canon is already present in storage, Final GUI, and Interview, and Usage already preserves canonical `account_id`, but Usage still lacks explicit usage/account-history/degrade sections and still drops requested/effective identity, `credential_ref`, runtime-role, and `operational_identity` carry-through.
- Highest-pressure docs: `Plans/usage-feature.md`, `Plans/storage-plan.md`, `Plans/Orchestrator_Page.md`, `Plans/assistant-chat-design.md`, `Plans/interview-subagent-integration.md`, `Plans/Contracts_V0.md`.
- Exact stale strings still to retire: `TierContext`, `tier_id`, `artifact_kind`, `task_id`, `detached_window`, `result_id`, `{ tool_name, invocation_summary, options }`, `No remaining gaps`.

## Next Required Stage
- `Audit Mode`

## Resume Notes
- Start from the current condensed bundle (`canon_inventory.json` + `open_gaps.json`); broad ledger re-reading is unnecessary unless one of the exact stale survivors or owner-anchor claims is disputed.
- The next pass must remove or downgrade blocker evidence in `Audit Mode` before the work item can return to Ready Check.
