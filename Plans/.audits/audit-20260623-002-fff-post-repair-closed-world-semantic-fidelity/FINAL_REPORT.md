# Final Report - audit-20260623-002-fff-post-repair-closed-world-semantic-fidelity

Status: BLOCKED

## Scope

- Ledger: `pldg-20260622-001-fff`
- Baseline ref: `b685c3d9a9098cf18374bab8ac4bff56dbecb534`
- Subject ref: `b8acd2ec8819dcf04c51e49ed5faf4eccd46a111`
- Observation ref: `HEAD` (`00f71b20f7c8807d4982654e521a7309f92ba5a5`)
- Scope rows: 552 / 552 classified
- Repair-required findings: 1
- Repair impact matrix rows: 1
- Closure reuse rows: 4

## Repair-Required Finding

- `sfk-2201fa3cba0d9f196f0a2fc4` `schema_contract_identity_drift`: The canonical Plans compile does not fully promote the exact DiscoveryService value registry required by atom-0076. CV-291 enumerates surface_type, target_kind, and receipt events, while T-161 depends on enum values from CV-291 and the precision contract; the full registry for intent, path_kind, match_type, freshness_state, fallback_state, policy_decision, error_code, and receipt_event remains only in ledger source-lineage with compile_permission false.
  Evidence: `atom-0076` requires the exact registry; `precision_contract.json` is `accepted_ledger_source_only` with `compile_permission: false`; `CV-291` and `T-161` do not fully promote the registry into canonical Plans.

## Closed Findings Reused

- `sfk-cc34ce26231d63bcfd452fdd` `worktree_currentness` reused `closure-audit-20260623-001-fff-ledger-to-plans-semantic-fidelity-repair-001`
- `sfk-e2d145fdce3e754060317dcd` `ledger_projection_drift` reused `closure-audit-20260623-001-fff-ledger-to-plans-semantic-fidelity-repair-002`
- `sfk-e1fcd45c960c7c2508038375` `closure_registry_currentness` reused `closure-audit-20260623-001-fff-ledger-to-plans-semantic-fidelity-repair-003`
- `sfk-003b63f2385d012c589fe4bf` `validator_failure` reused `closure-audit-20260623-001-fff-ledger-to-plans-semantic-fidelity-repair-004`

## Non-Actionable Warnings

- `sfk-85cf522fa090064f39a65a45` `planunit_source_lineage`: PlanUnit T-072 has reciprocal ledger source_lineage for atom-0063 and atom-0076, but unlike the new fff PlanUnits it lacks the helper source_atom_ids field; this is a legacy-shape warning, not missing lineage.
- `sfk-7e4042e67e547577f6552392` `planunit_lineage_shape_warning`: T-072 preserves reciprocal source_lineage to atom-0063 and atom-0076 but lacks the newer source_atom_ids helper field used by the other fff PlanUnits.
- `sfk-f8ae0fb08b393f85e37bfacc` `auto_decision_provenance_warning`: validate-auto-decisions passes structurally, but auto_decisions.jsonl has no specific pldg-20260622-001-fff or DiscoveryService governance decision row; this remains a provenance warning, not an open repair requirement.
- `sfk-049d55388a477d45e9ae7227` `manual_source_lineage_artifact_warning`: Ledger readiness/support artifacts such as precision_contract, doc_impact_matrix, consumer_conformance_matrix, implementation_gap_defaults, and deep_audit_report are explicit source-lineage/manual evidence and are not yet fully covered by the bootstrap ledger validator.

## Validators

- `target-ledger`: pass side_effects=0
- `plan-index`: pass side_effects=0
- `plan-migration`: pass side_effects=0
- `run-gates`: pass side_effects=0
- `audit-governance`: pass side_effects=0
- `shard-check`: pass side_effects=0
- `validate-auto-decisions`: pass side_effects=0
- `verify-spec-lock`: pass side_effects=0
- `validate-evidence`: pass side_effects=0
- `validate-plan-graph`: pass side_effects=0
- `json-syntax`: pass side_effects=0
- `prd-planning-runtime-contracts`: pass side_effects=0
- `plans-to-code-handoff-schema`: pass side_effects=0
- `closure-global`: pass side_effects=0
- `closure-audit`: pass side_effects=0
- `closure-refresh-dry-run`: pass side_effects=0
- `tests`: pass side_effects=0
- `git-diff-check`: pass side_effects=0

## Finalization Checks

- `closure-audit-final`: pass side_effects=0
- `closure-refresh-dry-run-final`: pass side_effects=0
- `json-syntax-final`: pass side_effects=0
- `git-diff-check-final`: pass side_effects=0

## Next Action

Terminal `BLOCKED`. Do not repair in this audit lane. The next bounded repair lane should promote the complete exact DiscoveryService value registry into canonical owner docs, then rerun semantic audit and closure validation.
