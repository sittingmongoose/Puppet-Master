# Repair Report - audit-20260619-001-prd-planning-wizard-final-semantic-fidelity

## Status

PASS_REPAIRED. All audit checklist rows are closed as `repaired`; no false positives, deferrals, or blocked product decisions remain.

## Repaired Items
- Replaced stale governance-pending footers in Plans/PRD_Builder.md and Plans/Planning_Wizard.md.
- Registered PRD_Builder.md and Planning_Wizard.md in sharding_config, generated shards, plan-sharding evidence, Spec Lock, plan graph, and auto_decisions using scripts/pm-governance-seal.py register-canonical-docs.
- Updated PNC-006 active terminology from Future Chain Wizard to Future Planning Wizard while preserving Chain Wizard only as stale/source-lineage compatibility.
- Updated PLS-012 active audit terminology to Planning Wizard and added Plan Wizard compatibility/stale-retired disposition.
- Updated Bootstrap Planning Workflow intro to Planning Wizard.
- Cleared active candidate_compile_owner_docs from sealed ledger projections and preserved the list as source_lineage_pre_seal_candidate_compile_owner_docs.
- Aligned current.cursor with evt-0025 validated handoff before final repair ledger update.
- Added reusable validator coverage for sealed New Plan Authoring Profile owner docs and stale sealed-ledger candidate/cursor projections.

## Closure Accounting
- `repair_closure_matrix.jsonl`: 16 rows, {'repaired': 16}
- Registry rows written: 16
- Previously closed rows accounted: 7
- Ledger consistency rows closed: 2

## PlanUnits Changed
- 0PI-059, C-050, CW-009, CWF-152, F3-398, GRS-031, OP-025, PLS-012, PLS-014, PNC-006, PNC-014, PNC-015, POA-049, PRDB-001, PWIZ-001, PWIZ-010, UCC-097

## Ledger Records Changed
- `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/state/current.json`
- `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/state/compile_queue.json`
- `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/registry_entry.json`
- `Plans/ledgers/v2/ledger_registry.json`
- `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/events.jsonl`
- `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/state/handoff.json`
- `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/state/open_items.json`
- `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/validation/ledger_health.json`
- `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/manifest.json`

## Validators
- `pm_audit_closure_validate_with_matrix`: pass (side effects: False)
- `pm_bootstrap_ledger_validate`: pass (side effects: False)
- `pm_plan_index_validate`: pass (side effects: False)
- `pm_plan_migration_validate`: pass (side effects: False)
- `pm_plans_verify_run_gates`: pass (side effects: False)
- `pm_shard_plans_check`: pass (side effects: False)
- `pm_plans_verify_validate_auto_decisions`: pass (side effects: False)
- `pm_plans_verify_verify_spec_lock`: pass (side effects: False)
- `pm_plans_verify_validate_evidence`: pass (side effects: False)
- `pm_plans_verify_validate_plan_graph`: pass (side effects: False)
- `pm_plans_verify_audit_governance`: pass (side effects: False)
- `pm_plans_verify_validate_plans_to_code_handoff_schema`: pass (side effects: False)
- `git_diff_check`: pass (side effects: False)

## Governance And Forbidden Artifacts
- Governance is sealed and validator-clean after script-backed regeneration.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, GoalRuns, runtime dispatch, implementation files, or production build tasks were created.

## Next Safe Action
Review and commit the bounded repair. Do not start WorkNodes/NodeSeeds or runtime build work until an explicit build phase is requested and the compiler contract allows it.
