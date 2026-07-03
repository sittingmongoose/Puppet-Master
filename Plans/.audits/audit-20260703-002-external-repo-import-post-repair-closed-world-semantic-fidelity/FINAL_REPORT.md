# audit-20260703-002-external-repo-import-post-repair-closed-world-semantic-fidelity

Status: `BLOCKED`

## Scope
- ledger_id: `pldg-20260703-001-feature-intake`
- baseline_ref: `298894101e433e2ada6e12c06c309369fa361c1b`
- subject_ref / observation_ref: `7bf804a6f8302c0f0c1bbf1b7cc3ae10a81e1b91`
- scope rows: `4476`; classified: `4476`; coverage: `100%`; sampling: `none`
- compiled atoms: `122`; compiled PlanUnits: `127`; owner docs: `28`

## Result
- repair_required_count = 4
- warning_count = 2
- validators: `13` pass, `3` fail; side effects outside audit dir: `0`
- The previous audit-001 repair closure remains valid for its six original findings; this audit found new/unclosed current-cycle issues.

## Actionable Findings
1. `reciprocal_source_atom_ids_mismatch` / `sfk-f2071824da7401e6ca59eb43`
   Evidence: Plans/.plan_index/plan_units.jsonl:66; Plans/00-plans-index.md:5009; Plans/ledgers/v2/pldg-20260703-001-feature-intake/state/compile_queue.json:73; Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl
   Summary: 0PI-066 claims all 122 ledger atoms through source_atom_ids and is listed in the compile queue, but no design atom reciprocally lists 0PI-066 in compiled_output_plan_unit_ids or plan_compile_targets.
2. `existing_planunit_exact_token_and_source_atom_ids_gap` / `sfk-ff7c947dff249da73ad63a1a`
   Evidence: Plans/.plan_index/plan_units.jsonl; Plans/Planning_Ledger_System.md:28; Plans/Plan_Document_System.md:138; Plans/Plan_To_Node_Compilation.md:25
   Summary: Atoms atom-0001 through atom-0004 compile to existing PlanUnits that carry pldg-20260703 source_lineage but omit source_atom_ids and do not preserve several exact ledger-init tokens in the indexed PlanUnit blocks.
3. `generated_governance_auto_decision_provenance_gap` / `sfk-7ac4b10c5ce4296b24691da1`
   Evidence: Plans/Spec_Lock.json; Plans/auto_decisions.jsonl; Plans/ledgers/v2/pldg-20260703-001-feature-intake/validation/governance_seal_recheck_20260703T210110Z.json:8
   Summary: The governance seal changed Spec_Lock state while Spec_Lock declares auto decisions required; the seal recheck says auto_decisions.jsonl was validated but not changed, and no July 3 ledger/HEAD auto-decision row exists.
4. `planunit_owner_map_governance_seal_state_stale` / `sfk-13f7d62e51d043854a69f648`
   Evidence: Plans/.plan_index/plan_units.jsonl:66; Plans/00-plans-index.md:5009; Plans/ledgers/v2/pldg-20260703-001-feature-intake/manifest.json
   Summary: 0PI-066 is the cycle owner-map PlanUnit and still carries acceptance/prose tokens that say governance seal remains pending and no governance seal artifacts are created, while the ledger cycle is now sealed at HEAD.

## Validator Failures
- `target_audit_closure_validate` exit `1`: closure validator requires repair_impact_matrix coverage for the four open semantic_risks rows; no repair evidence was invented in this audit-only run.
- `audit_governance` exit `1`: new audit directory makes Plans/.audits/_audit_status_index.json stale; refreshing it is outside this audit-only write surface.
- `run_gates` exit `1`: new audit directory makes Plans/.audits/_audit_status_index.json stale; refreshing it is outside this audit-only write surface.

## Non-Actionable Warnings
1. `stale_root_shard_report_sibling` / `sfk-425924aa52fd680385e1578b`: A stale root-level shard_report.json sibling remains beside the current reports/shard_report.json; configured shard validation uses the current reports path, so this is non-actionable for this audit.
2. `compile_summary_last_event_id_projection_lag` / `sfk-fc4aba0503d409b7ffa48dd6`: compile_summary_20260703.json retains last_event_id=evt-0011 while sealed ledger projections are evt-0012; status and validation fields are updated, so this is a non-actionable projection nuance.

## Next Action
BLOCKED: repair authorization is required for the four semantic findings; afterward refresh/validate audit closure/status-index governance through the explicit governance lane.

No repairs were made in this audit run.
