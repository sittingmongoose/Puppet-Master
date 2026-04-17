# Current State

_Refreshed: 2026-04-17T03:15:00Z — Verifier PASS; all 23 mutation targets verified in live docs; run-gates exit 0_

## Work Item
- work_id: `w-20260312-203855`
- mode: `migrated`
- topic_or_scope: `Orchestrator rewrite transfer-fidelity audit, legacy-canon cleanup readiness, and reconciliation prep`
- status: `verified`
- run_id: `r-20260312-203855-15`
- next_run_seq: `16`
- blocker split: `0` planning blockers, `8` fix backlog items (write-ready, do not block planning)
- reconciliation plan: `reconciliation_plan.json` v3 emitted, 24 targets (23 mutation + 1 observe_only) across 15 docs
- scribe result: 23 mutation targets applied; 19 were already correct (no-op); 4 required actual edits

## Ready Check Result
**PASSED.** Mutation planning is allowed.

Criteria met:
- `canon_inventory.json`: 8 canon items, 17 owner targets, 29 consumer targets — usable and non-empty
- `planning_blockers`: 0 — no blockers
- All 8 open gaps carry explicit owner/consumer targets and `next_resolution_stage: Reconciliation Planner`
- Fix backlog (8 items) is write-ready and does not block planning

## Locked Decisions
- This remains the existing migrated work item; no new work item is created.
- `canon_inventory.json` is the exact canon source for terms, behaviors, structural headings, owner/consumer targets, and stale literals to retire.
- `open_gaps.json` v3 split (0 planning / 8 fix backlog) is authoritative and stable.
- `reconciliation_plan.json` maps the fix backlog into explicit mutation targets, fallback anchors, owner-heading creation flags, and replace scopes.
- Fix backlog is a Reconciliation Planner concern; it does not gate mutation planning.

## Exact Canon That Must Survive
- `execution_unit_context`: `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `operational_identity`, `tool_use_id`.
- `route_target`: closed `target_kind`, canonical `subject_id` families, selector exclusivity, command normalization via `command_kind` and `normalization`.
- Storage owns runtime-artifact identity, worktree/lane records, `orchestrator.project_state.{project_id}`, projection freshness/health, `historical`/`archived`/`removed` semantics.
- Receipt/validation lineage: `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `validation_pass_report`, `workflow_run_id`, `run_id`, `pass_verdict`, `phase_plan_ref`, `requirements_quality_report_ref`.
- Blocked episodes: `blocked_sequence`, `approval_scope_key`, unified tool/runtime attribution, escalation ladder `info`→`warning`→`attention_required`→`blocked`→`system_notification`.
- Help system: three-part contract — `canonical term system`, `contextual help system`, `dedicated help-entry contract`.
- Orchestrator: why/coordination surface; scope, current-vs-historical, health/activity/attention remain separate from Source Control.
- Usage/interview/account-history: stable internal account identity + projection-health-aware degrade behavior.

## Remaining Fix Backlog (gap-001 – gap-008, all `fix_backlog`)

Audit pass (2026-04-17) confirmed that all required owner headings now exist in `Plans/**`. Remaining work is consumer carry-through, stale survivor retirement, and broken cross-reference repair.

| gap | class | actual remaining work | top affected doc |
|-----|-------|-----------------------|-----------------|
| gap-001 | stale_contradictory_survivor | Stale `TierContext`/`tier_id` throughout doc; missing `requested_account_policy`/`tool_use_id` consumer carry-through | `Plans/orchestrator-subagent-integration.md` |
| gap-002 | missing_structural_heading | Stale `detached_window` in `target_kind` closed set; broken `Orchestrator_Page.md#10. Search, routing, and action policy` ref | `Plans/Contracts_V0.md` |
| gap-003 | over_summarized_transfer | Broken `#Canonical records` consumer refs in `Contracts_V0.md` and `Orchestrator_Page.md`; broken `#Restart and stale history` refs | `Plans/storage-plan.md` |
| gap-004 | over_summarized_transfer | Missing consumer anchors for drill-through, validation lineage, bridge-field viewer, and validation/report in downstream consumers | `Plans/Runtime_Artifacts_Panel.md` |
| gap-005 | stubbed_consumer_propagation | Stale `{ tool_name, invocation_summary, options }` ask tuple; missing `action_available` owner; `blocked_notice` missing `blocked_sequence`/`approval_scope_key` | `Plans/Tools.md` |
| gap-006 | missing_structural_heading | Help-entry rows not yet instantiated; broken `Plans/Glossary.md#Orchestrator rewrite terms` refs in `Orchestrator_Page.md` | `Plans/Glossary.md` |
| gap-007 | missing_structural_heading | Stale `ContractRef: Plans/Orchestrator_Page.md#11. Source Control boundary` anchor in `WorktreeGitImprovement.md` | `Plans/WorktreeGitImprovement.md` |
| gap-008 | over_summarized_transfer | Missing exact consumer carry-through for `credential_ref`, `execution_role`, `operational_identity` in `usage-feature.md` | `Plans/usage-feature.md` |

**Stale literals to retire:** `TierContext`, `tier_id`, `detached_window`, `{ tool_name, invocation_summary, options }`, `No remaining gaps`, stale `#11. Source Control boundary` anchor

## Next Required Stage
- `Fidelity Audit`

## Resume Notes
- Scribe completed 2026-04-17T02:38:02Z; all 23 mutation targets applied to Plans/**.
- Verifier completed 2026-04-17T03:15:00Z; all 23 mutation targets verified PASS; run-gates exit 0.
- 19 targets were already byte-identical to content_markdown (no-op). 4 required edits + 1 fixup:
  - target-007: `Plans/UI_Command_Catalog.md` §2.8A — added search routing policy rule
  - target-017: `Plans/Glossary.md` §2. Core terms — added Feature Seam, Work Package, Package Overseer, Seam Overseer, target_kind, object_kind, inspector_target, subject_id, resume_url; fixed `related_concepts:` underscore
  - target-023: `Plans/usage-feature.md` §Runtime Scheduler — added `(action_available)` qualifier on blocked-action disclosure line
  - target-024: `Plans/Contracts_V0.md` §7. UICommand — added ### 7.2/7.3/7.4 subheadings; retired `detached_window` from `target_kind` closed set; removed two stale ContractRefs
  - target-019 fixup: `Plans/GitHub_Integration.md` §A.3 — removed backtick wrapping around `Source Control` to match content_markdown exactly
- target-002 (observe_only) correctly excluded from all edits.
- Verifier reports at `Plans/.pipeline/verifier_report.txt` and `verifier_exit_code.txt`; mirrored to run folder.
- Run artifact at `Plans/.pipeline/runs/r-20260312-203855-15/research_packet.json`; global mirror at `Plans/.pipeline/research_packet.json`.
