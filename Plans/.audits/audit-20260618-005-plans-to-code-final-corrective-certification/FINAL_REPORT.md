# Plans-To-Code Final Corrective Certification

Status: PASS_CERTIFIED

Scope: bounded final repair only. This did not redo ledger compile, re-audit all 64 atoms, broadly rewrite Plans, enable PlanCompile, or create NodeSeeds, WorkNodes, queues, manifests, GoalRuns, product code, or build tasks.

## Subagent Findings

- Faraday: stale finalization state was limited to `ledger_registry.json` timestamps/hashes, closure rows, and evidence bundles that consumed the final registry or generated hashes. Finalization order was ledger/registry first, generated outputs, evidence/Spec Lock, then closure restamp.
- Ampere: active `validation_pass_report` owner/consumer text still needed demotion to legacy mirror semantics in Project Output Artifacts, Storage Plan receipts, CWF-016/CWF-122, and direct compatibility cases. The final repair makes `auditor_cycle_report` canonical and requires `compatibility_only: true` plus `cycle_report_ref` for legacy mirrors.
- Tesla: the broken POA anchor, exact route-target schema, `stage_card.stage_id`, nullable `last_green_stage`/`next_required_stage`, active exhaustive tab lists, and schema validator fixtures needed final correction.

## Corrective Repairs

- Made `auditor_cycle_report` canonical in active contracts and kept `validation_pass_report` only as a legacy compatibility mirror with `compatibility_only: true` and `cycle_report_ref`.
- Replaced the nonexistent `Project_Output_Artifacts.md#10. Auditor Cycle Report Artifacts` reference with `Plans/Project_Output_Artifacts.md#POA-045`.
- Added `Plan Compile` to active exhaustive Orchestrator tab lists and corrected the direct native-surface consumer to use `Node Graph`.
- Made routes strict objects with `route_kind`, `target_stage`, `reason`, optional `resume_ref`, terminal null target rules, and valid `stage_name` targets for nonterminal routes.
- Required `stage_card.stage_id` and constrained `plan_compile_run.last_green_stage` and `next_required_stage` to `stage_name | null`.
- Extended `validate-plans-to-code-handoff-schema` with positive/negative route fixtures for target pairing, terminal null rules, valid stage IDs, and free-form route rejection.

## Hand-Edited Files

- `Plans/Project_Output_Artifacts.md`
- `Plans/storage-plan.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Plan_To_Node_Compilation.md`
- `Plans/plans_to_code_handoff.schema.json`
- `scripts/pm-plans-verify.py`
- Compact ledger/registry files under `Plans/ledgers/v2/pldg-20260617-001-plans-to-code-handoff/` and `Plans/ledgers/v2/ledger_registry.json`

## Generated And Restamped Files

- Regenerated PlanUnit index outputs in `Plans/.plan_index/`.
- Refreshed migration batch/final summaries in `Plans/.plan_migration/pds-20260611-002-atomize-planunits/`.
- Regenerated shards and sharding report under `Plans/_shards/` and `Plans/.evidence/plan-sharding-2026-06-09/reports/shard_report.json`.
- Refreshed `Plans/Spec_Lock.json` and required evidence bundles reported by governance validators.
- Restamped `Plans/.audits/_semantic_closure_registry.jsonl` against the final generated and registry hashes.

## Certification Checks

- Registry hash stable across both final runs: `b0a23019f07670d7ff276f52dd266bc8e8fb48dced4b8dcdf1178f613b5b1d42`.
- Git status stable across both final runs: true.
- Active Auditor alias sections compatibility-only: true.
- Active exhaustive tab lists include Plan Compile and canonical Node Graph naming: true.
- Exact route targets enforced by schema and validator fixtures: true.
- Forbidden runtime/build artifacts in changed paths: none.

## Validators

| Command | Run 1 rc | Run 2 rc |
| --- | ---: | ---: |
| `bootstrap_ledger_validate` | 0 | 0 |
| `pm_plan_index_validate` | 0 | 0 |
| `pm_plan_migration_validate` | 0 | 0 |
| `validate_plans_to_code_handoff_schema` | 0 | 0 |
| `draft_2020_12_metaschema_check` | 0 | 0 |
| `pm_audit_closure_validate` | 0 | 0 |
| `pm_shard_plans_check` | 0 | 0 |
| `pm_plans_verify_run_gates` | 0 | 0 |
| `pm_plans_verify_audit_governance` | 0 | 0 |
| `git_diff_check` | 0 | 0 |

Full captured stdout/stderr and return codes are in `validator_results.json`. Direct certification check output is in `certification_checks.json`.

## Blockers

None.
