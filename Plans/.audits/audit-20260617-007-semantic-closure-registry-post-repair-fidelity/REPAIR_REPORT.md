# REPAIR REPORT - audit-20260617-007-semantic-closure-registry-post-repair-fidelity

Status: repaired_validators_passed

## Scope

- audit_id: `audit-20260617-007-semantic-closure-registry-post-repair-fidelity`
- ledger_id: `pldg-20260616-002-orchestrator-goal-runtime-flow`
- bounded repair only; no product Plan prose, ledger records, PlanUnits, WorkNodes, NodeSeeds, queues, manifests, implementation files, or production build tasks were created.

## Items Closed

- Semantic risks closed: 3
- Atom fidelity dispositions recorded: 5
- PlanUnit source-claim dispositions recorded: 3
- Owner-routing warnings closed: 2
- Ledger consistency deferrals recorded: 1
- Repair closure matrix rows: 14
- New registry rows: 14
- Existing registry rows refreshed/corrected: 16
- Blocked user decisions: 0

## Repairs

- Hardened scripts/pm-audit-closure.py to compare current file hashes for owner_evidence_hashes and closure_evidence_hashes.
- Refreshed stale closure registry hashes for rows identified by SR-007-001, including the changed validator script hash.
- Corrected registry row 5 and 6 consumer_docs to include bootstrap workflow and prompt consumers.
- Corrected registry row 22 owner_docs/plan_unit_ids to PDS-014 and registry row 23 owner_docs/plan_unit_ids to PLS-012.
- Replaced self-referential registry-hash evidence in rows 8 and 23 with stable audit-006 report/evidence artifacts.
- Added audit-007 closure rows and repair matrix coverage for every actionable audit item.

## Changed Files

- `scripts/pm-audit-closure.py`
- `Plans/.audits/_semantic_closure_registry.jsonl`
- `Plans/.audits/audit-20260617-007-semantic-closure-registry-post-repair-fidelity/repair_closure_matrix.jsonl`
- `Plans/.audits/audit-20260617-007-semantic-closure-registry-post-repair-fidelity/repair_report.json`
- `Plans/.audits/audit-20260617-007-semantic-closure-registry-post-repair-fidelity/REPAIR_REPORT.md`

## PlanUnits And Ledger Records

- PlanUnits changed: none.
- Ledger records changed: none.
- Governance regeneration: `not_required_no_live_plan_or_generated_governance_changes`.

## Validators

All passed: `true`

- `pm_audit_closure_validate_registry`: pass (exit 0, mutated_status=false)
- `pm_audit_closure_validate_audit_dir`: pass (exit 0, mutated_status=false)
- `bootstrap_ledger_validate`: pass (exit 0, mutated_status=false)
- `pm_plan_index_validate`: pass (exit 0, mutated_status=false)
- `pm_plan_migration_validate`: pass (exit 0, mutated_status=false)
- `run_gates`: pass (exit 0, mutated_status=false)
- `shard_check`: pass (exit 0, mutated_status=false)
- `validate_auto_decisions`: pass (exit 0, mutated_status=false)
- `verify_spec_lock`: pass (exit 0, mutated_status=false)
- `validate_evidence`: pass (exit 0, mutated_status=false)
- `git_diff_check`: pass (exit 0, mutated_status=false)

No validator changed git status beyond the existing repair edits.

## Governance

No canonical Plans prose or generated governance artifact changed, so `.plan_index`, shards, Spec Lock, auto-decisions, and evidence were not regenerated. Existing governance validators passed.

## Next Safe Action

Commit the bounded repair after review.
