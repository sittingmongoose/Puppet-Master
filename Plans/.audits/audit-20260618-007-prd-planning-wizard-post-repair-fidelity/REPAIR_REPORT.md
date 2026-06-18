# Repair Report - audit-20260618-007-prd-planning-wizard-post-repair-fidelity

Ledger: `pldg-20260618-001-prd-planning-wizard`

Status: `PASS_CERTIFIED`

## Summary

- Closure rows written: 94
- Status counts: {'not_for_plan': 14, 'repaired': 72, 'source_lineage_only': 2, 'stale_retired': 6}
- Source artifact coverage: {'atom_fidelity_matrix.jsonl': 7, 'ledger_consistency.json': 2, 'owner_routing_findings.jsonl': 4, 'planunit_source_claims.jsonl': 61, 'semantic_risks.jsonl': 6, 'validator_results.json': 14}
- WorkNodes/NodeSeeds/executable queues/runtime dispatch: not created

## Semantic Dispositions

- `SR-0C6C690A8AA9` / `legacy_owner_routing_and_semantic_migration`: `stale_retired` - Legacy Chain Wizard owner/workflow prose was demoted to compatibility/source-lineage, with active authority routed to PRD Builder, Planning Wizard, GUI, command, PlanCompile, Executor, and Orchestrator owners.
- `SR-10539228E648` / `stale_active_terminology`: `stale_retired` - Active owner/index PlanUnits now use Planning Wizard as current terminology; Plan Wizard and Chain Wizard remain only explicit historical compatibility/source-lineage terms.
- `SR-3781DB578801` / `schema_owner_routing_and_field_fidelity`: `repaired` - The plans-to-code handoff schema now carries contract_mode, launch_policy, runtime_adapter, runtime_enablement_ref, and runtime_policy_snapshot_ref while preserving disabled launch gates.
- `SR-C07297837B8B` / `ledger_projection_consistency`: `repaired` - Ledger projections, registry entry, and handoff state were reconciled so the post-audit repair state and governance-seal summary agree.
- `SR-AF18A2EF342D` / `ledger_projection_consistency`: `source_lineage_only` - Accepted non-atom decision and correction records were reclassified as source_lineage_only so the sealed ledger has no non-atom ready_for_plan_compile records.
- `SR-B2E2E06B9A03` / `canonical_text_source_lineage_boundary`: `repaired` - Atom labels were removed from new PlanUnit canonical_text while source_lineage/source_atom_ids continue to preserve the reciprocal ledger lineage.

## Durable Closure

- `repair_closure_matrix.jsonl` covers semantic risks, actionable atom drift rows, owner-routing findings, ledger consistency details, all 61 PlanUnit source-claim atom-label rows, each validator result row, and validator context.
- `_semantic_closure_registry.jsonl` has one registry row per closure matrix row with deterministic finding keys, evidence refs, and reopen conditions.
- Final validator results will be filled after the closing validation run.

## Final Validation

- `pm_audit_closure_validate_with_matrix`: `pass` - 94 repair closure rows, no missing coverage, registry valid
- `pm_bootstrap_ledger_validate`: `pass` - 168 atoms, 61 compile queue items, 30 decisions, 15 corrections, 23 events, 0 questions
- `pm_plan_index_validate`: `pass` - 5166 PlanUnits, 18423 acceptance units, node readiness blocked_compiler_contract_incomplete
- `pm_plan_migration_validate`: `pass` - pds-20260611-002-atomize-planunits
- `pm_plans_verify_run_gates`: `pass` - run-gates after evidence refresh
- `pm_shard_plans_check`: `pass` - 52 docs, 965 shards
- `pm_plans_verify_validate_auto_decisions`: `pass` - no failures
- `pm_plans_verify_verify_spec_lock`: `pass` - no failures
- `pm_plans_verify_validate_evidence`: `pass` - no failures
- `pm_plans_verify_validate_plan_graph`: `pass` - no failures
- `pm_plans_verify_audit_governance`: `pass` - no failures
- `pm_plans_verify_validate_plans_to_code_handoff_schema`: `pass` - no failures
- `pm_install_prd_planning_wizard_ledger_dry_run`: `pass` - dry_run_already_sealed_noop
- `git_diff_check`: `pass` - no whitespace errors
- `focused_canonical_text_atom_label_check`: `pass` - 61 audited PlanUnits checked; no atom labels in canonical_text
- `focused_runtime_schema_field_check`: `pass` - contract_mode, launch_policy, runtime_adapter, runtime_enablement_ref, runtime_policy_snapshot_ref required/properties present; launch gates const false
- `focused_nonatom_disposition_check`: `pass` - 30 decisions and 15 corrections source_lineage_only

## Final State

- Ledger remains sealed; repair closure did not unseal or recompile the ledger.
- Node readiness remains `blocked_compiler_contract_incomplete` by design.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, GoalRuns, runtime dispatch, implementation files, or production build tasks were created.
