# Current State

## Work Item
- work_id: `w-20260312-203855`
- mode: `migrated`
- topic_or_scope: `Orchestrator rewrite transfer-fidelity audit, legacy-canon cleanup readiness, and reconciliation prep`
- status: `packetized`
- blocker split: `0` planning blockers, `8` fix backlog items, `8` total unresolved gaps, `20` affected docs, `62` underlying evidence refs
- packet verdict: `research_packet.json` is now emitted for run `r-20260312-203855-10`, carrying `23` mutation targets across `15` planning docs with no observe-only leakage

## Locked Decisions
- This remains the existing migrated work item; no new work item is created.
- `canon_inventory.json` remains the exact canon source for terms, behaviors, structural headings, owner/consumer targets, and stale literals to retire.
- `open_gaps.json` now separates planning blockers from fix backlog under `pm.open_gaps.v3`.
- The remaining unresolved work is planner-fixable: each gap already points at known owner/consumer targets and known missing fields, headings, or stale survivors.
- `reconciliation_plan.json` is now present and maps the fix backlog into explicit packet targets, fallback anchors, owner-heading creation flags, and replace scopes.
- `research_packet.json` now materializes those packet targets as insertable markdown for Packet Builder output.
- The latest audit rechecked the repaired blocker split against live `Plans/**` and found no new exact missing item or reclassification that would move any gap back to `blocker_type=planning`.
- The latest condensation keeps `canon_inventory.json` and the v3 backlog split as-is because the last audit produced zero new exact canon findings.
- Fix backlog remains a reconciliation-planner concern and does not block mutation planning.

## Exact Canon That Must Survive
- `execution_unit_context` remains the shared runtime identity packet with `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `operational_identity`, and `tool_use_id`.
- `route_target` remains the shared route/open payload with closed `target_kind`, canonical `subject_id` families, selector exclusivity, and command normalization anchored by `command_kind` and `normalization`.
- Storage owns runtime-artifact identity, worktree/lane records, `orchestrator.project_state.{project_id}`, projection freshness/health, and explicit `historical` / `archived` / `removed` semantics.
- Receipt and validation lineage must preserve `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `validation_pass_report`, `workflow_run_id`, `run_id`, `pass_verdict`, `phase_plan_ref`, and `requirements_quality_report_ref`.
- Blocked episodes stay anchored by `blocked_sequence` and `approval_scope_key`, with unified tool/runtime attribution and one escalation ladder spanning `info`, `warning`, `attention_required`, `blocked`, and `system_notification`.
- The help system remains the three-part contract: `canonical term system`, `contextual help system`, and `dedicated help-entry contract`.
- Orchestrator remains the why/coordination surface beside worktree-first Source Control and must keep scope, current-vs-historical behavior, and health/activity/attention separate.
- Usage, interview, and account-history surfaces must use stable internal account identity plus projection-health-aware degrade behavior.

## Remaining Fix Backlog
- `gap-001` through `gap-008` remain open as packet-builder backlog, not planning blockers.
- Highest-pressure docs: `Plans/Orchestrator_Page.md`, `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/Contracts_V0.md`, `Plans/assistant-chat-design.md`, `Plans/interview-subagent-integration.md`.
- Dominant gap classes: `missing_structural_heading`, `over_summarized_transfer`.
- Exact stale strings still to retire: `TierContext`, `tier_id`, `artifact_kind`, `task_id`, `detached_window`, `result_id`, `{ tool_name, invocation_summary, options }`, `No remaining gaps`.

## Next Required Stage
- `Scribe`

## Resume Notes
- The repaired `pm.open_gaps.v3` backlog split held up under audit; no planning blockers re-emerged.
- Scribe should consume `research_packet.json` for run `r-20260312-203855-10` and turn the packetized mutation bodies into the final writing pass.
