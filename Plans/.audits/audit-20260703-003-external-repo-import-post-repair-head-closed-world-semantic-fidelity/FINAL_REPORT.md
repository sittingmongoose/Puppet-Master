# audit-20260703-003-external-repo-import-post-repair-head-closed-world-semantic-fidelity

Status: BLOCKED

repair_required_count = 5

- Ledger: `pldg-20260703-001-feature-intake`
- Observation ref: `8014c28ab438dac579de762620bd46dbaa36d447`
- Subject ref: `8014c28ab438dac579de762620bd46dbaa36d447`
- Baseline ref: `298894101e433e2ada6e12c06c309369fa361c1b`
- Scope rows: 2563 / 2563 covered (100%)
- Classification counts: {"equivalent_with_evidence": 3, "exact_present": 1937, "missing_or_drift": 5, "observation": 1, "previously_closed": 4, "source_lineage_only": 613}
- Validator result: 10 passed, 4 failed, 0 timed out
- Validator side effects: 0

## Actionable Findings

- `sfk-3db3a56417fc036747569df3` `compiled_atom_exact_token_fidelity` level=error
  - atoms: atom-0001
  - PlanUnits: PLS-009
  - owner docs: Plans/Planning_Ledger_System.md
  - detail keys: exact_tokens[0]
  - exact tokens: ["Use the PM Bootstrap Planning Ledger for this feature."]

- `sfk-71f0d753522c3d2442585b3c` `compiled_atom_negative_constraint_fidelity` level=error
  - atoms: atom-0002
  - PlanUnits: PLS-001, PLS-011, PNC-001
  - owner docs: Plans/Plan_To_Node_Compilation.md, Plans/Planning_Ledger_System.md
  - detail keys: negative_constraints[4]
  - exact tokens: ["Do not recreate the removed legacy Iced app."]

- `sfk-93d36dec4b1be6eae38ad7c9` `compiled_atom_exact_token_fidelity` level=error
  - atoms: atom-0003
  - PlanUnits: PLS-006
  - owner docs: Plans/Planning_Ledger_System.md
  - detail keys: exact_tokens[3]
  - exact tokens: ["state/current.json"]

- `sfk-89a0e702ea90e4c677f33a4f` `compiled_atom_exact_token_fidelity` level=error
  - atoms: atom-0003
  - PlanUnits: PLS-006
  - owner docs: Plans/Planning_Ledger_System.md
  - detail keys: exact_tokens[5]
  - exact tokens: ["state/open_items.json"]

- `sfk-efbbba780463ca02322cbd85` `compiled_atom_exact_token_fidelity` level=error
  - atoms: atom-0003
  - PlanUnits: PLS-006
  - owner docs: Plans/Planning_Ledger_System.md
  - detail keys: exact_tokens[6]
  - exact tokens: ["state/compile_queue.json"]

## Validator Failures

- `audit_governance`: stale audit-status index after adding this new audit bundle; index refresh is outside audit-only scope

- `closure_current_audit`: current blocked audit has 5 open semantic rows and no post-repair impact matrix, as expected for audit-only

- `audit_status_index_validate`: stale audit-status index after adding this new audit bundle; index refresh is outside audit-only scope

- `run_gates`: stale audit-status index after adding this new audit bundle; index refresh is outside audit-only scope

## Validator Passes

`target_ledger_validate`, `bootstrap_ledger_sweep`, `plan_index_validate`, `migration_validate`, `shard_check`, `auto_decision_validate`, `spec_lock_verify`, `evidence_validate`, `closure_latest_related_audit`, `diff_check`.

## Closure Reuse

Four previous post-repair closure rows were reused as previously closed; none were reopened.

## Next Action

Repair the five PlanUnit fidelity gaps, then run a separate repair/governance refresh for post-repair closure evidence and audit-status index artifacts.
