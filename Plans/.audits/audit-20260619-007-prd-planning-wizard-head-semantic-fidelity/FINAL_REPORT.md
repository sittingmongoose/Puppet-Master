# audit-20260619-007-prd-planning-wizard-head-semantic-fidelity

Status: BLOCKED

Ledger: `pldg-20260618-001-prd-planning-wizard`
Baseline: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe`
Subject: `3b9e20b6b58438ff7993a76950b919b316442449`
Range: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe..3b9e20b6b58438ff7993a76950b919b316442449`
Created: `2026-06-19T11:35:44Z`

## Summary

This audit is audit-only and writes only under `Plans/.audits/audit-20260619-007-prd-planning-wizard-head-semantic-fidelity/`. It verifies the latest PRD Builder / Planning Wizard ledger-to-Plans cycle at `HEAD` and does not repair canonical Plans, generated governance artifacts, ledgers, scripts, or implementation files.

Result: `BLOCKED` because 4 rows have `repair_required=true`: 3 blocker-level semantic/atom findings and 1 warning-level owner-routing finding.

## Artifact Counts

- `atom_fidelity_matrix.jsonl`: 168 rows; classifications `{'equivalent_with_evidence': 61, 'exact_present': 99, 'missing_or_drift': 1, 'previously_closed': 7}`; repair_required 1
- `planunit_source_claims.jsonl`: 62 rows; all source-lineage supported; repair_required 0
- `owner_routing_findings.jsonl`: 1 row; repair_required 1
- `closure_reuse.jsonl`: 9 rows; hash mismatches 0; stale closure rows not reused 7
- `ledger_consistency.json`: status `pass`; repair_required false
- `semantic_risks.jsonl`: 2 rows; repair_required 2
- `validator_results.json`: status `pass`; 16/16 commands passed; non-audit side effects 0

## Repair-Required Rows

- atom_fidelity_matrix.jsonl:167 | blocker | atom-0167 | sfk-8e89d5a3ec1c8ddcae9899d0 | Source atom atom-0167 says the repair Goal builds a complete closure matrix and repairs or adjudicates every finding/detail; current live contracts intentionally narrow closure matrix and registry work to repair_required=true actionable rows and no-op on repair_required=false, previously_closed, and audit-artifact wording rows.
- semantic_risks.jsonl:1 | blocker | live_planunit_validation_surface_local_state | sfk-9004c05d325c979c02058376 | Current live canonical PlanUnits and validation prose compile a machine-local dependency path into validation_surfaces. AGENTS.md forbids local machine state, and older base PlanUnit examples use repo-relative validators without this host-specific path.
- semantic_risks.jsonl:2 | blocker | plancompile_launch_mode_schema_contradiction | sfk-678e9596c78963b2c1cbdd12 | Live docs simultaneously say ordinary Approve And Build immediately creates or resumes a PlanCompileRun and preserve design-only disabled launch boundaries. The schema admits native_runtime and automatic_after_approval values while all launch enablement booleans remain const:false, so native launch mode cannot be expressed without violating the same schema.
- owner_routing_findings.jsonl:1 | warning | owner_map_underreports_compiled_owner_docs | sfk-f359a7d831b908a36af76013 | The live PRD Builder and Planning Wizard index map names only eight ContractRef owner docs while current PlanUnit lineage for the same ledger spans 35 owner docs. Several owner/consumer addenda are therefore not represented in the map ContractRef list, even though they carry accepted PlanUnits with source lineage to this ledger.

## Lineage And Routing

Reciprocal lineage passed: 62 audited PlanUnits are supported by compile_queue source atoms and current PlanUnit `source_atom_ids` / `source_lineage`. No lineage overclaims were found.

Owner routing has one repair-required warning: the `Plans/00-plans-index.md` PRD Builder and Planning Wizard map ContractRef names 8 owner docs while current PlanUnit lineage for this ledger spans 35 owner docs. The row in `owner_routing_findings.jsonl` lists the omitted owner docs.

## Closure Reuse

Closure reuse is hash-strict for this audit. Seven matching registry rows from `audit-20260619-002` were reused for previously closed atom findings. Two matching audit-level closure rows from `audit-20260619-005` were reused. Seven audit-005 atom closure rows were not reused because their `Plans/.plan_index/plan_units.jsonl` hash is stale at this subject ref; those atoms were evaluated against live PlanUnit evidence instead.

## Forbidden Artifacts

No WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, GoalRuns, implementation files, runtime dispatch, Orchestrator builds, or production build tasks were created by the audited cycle or this audit.

## Validators

- git_status_before: pass (exit 0, side_effects 0)
- pm_plans_verify_run_gates: pass (exit 0, side_effects 0)
- pm_shard_plans_check: pass (exit 0, side_effects 0)
- pm_plan_index_validate: pass (exit 0, side_effects 0)
- pm_audit_closure_validate_audit_007: pass (exit 0, side_effects 0)
- pm_bootstrap_ledger_validate_prd_planning_wizard: pass (exit 0, side_effects 0)
- pm_plan_migration_validate: pass (exit 0, side_effects 0)
- pm_plans_verify_audit_governance: pass (exit 0, side_effects 0)
- pm_plans_verify_spec_lock: pass (exit 0, side_effects 0)
- pm_plans_verify_auto_decisions: pass (exit 0, side_effects 0)
- pm_plans_verify_evidence: pass (exit 0, side_effects 0)
- pm_plans_verify_plan_graph: pass (exit 0, side_effects 0)
- pm_plans_verify_handoff_schema: pass (exit 0, side_effects 0)
- test_pm_audit_closure_unittest: pass (exit 0, side_effects 0)
- git_diff_check_cycle_range: pass (exit 0, side_effects 0)
- git_status_after: pass (exit 0, side_effects 0)

Closure validator note: `pm_audit_closure_validate_audit_007` passed without `--require-closure-matrix` and reported `repair_required_count=4`. `repair_closure_matrix.jsonl` is intentionally absent because this is an audit-only lane; the next bounded repair lane must create it.

## Next Bounded Repair Prompt

```text
/goal
Repair PM Bootstrap deep semantic audit audit-20260619-007-prd-planning-wizard-head-semantic-fidelity.

Read AGENTS.md, Plans/00-plans-index.md, Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md, Plans/bootstrap/Bootstrap_Planning_Workflow.md, Plans/bootstrap/Codex_Prompts.md, Plans/.audits/_semantic_closure_registry.jsonl, and every artifact under Plans/.audits/audit-20260619-007-prd-planning-wizard-head-semantic-fidelity/.

Bounded repair only. Repair or explicitly adjudicate only rows with repair_required=true in atom_fidelity_matrix.jsonl, semantic_risks.jsonl, owner_routing_findings.jsonl, ledger_consistency.json, planunit_source_claims.jsonl, or validator_results.json. Do not redo the audit, broaden scope, or create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime dispatch, Orchestrator builds, or production build tasks.

Write Plans/.audits/audit-20260619-007-prd-planning-wizard-head-semantic-fidelity/repair_closure_matrix.jsonl covering every actionable source row and update Plans/.audits/_semantic_closure_registry.jsonl only for actionable closures. Then run validators, record repair_validator_results.json, and rerun a fresh semantic audit at new HEAD.
```
