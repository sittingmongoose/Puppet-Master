# Repair Report

- audit_id: `audit-20260701-001-containerized-hosts-closed-world-semantic-fidelity`
- ledger_id: `pldg-20260630-001-feature-intake`
- status: `PASS_CERTIFIED`
- original repair_required_count: `3`
- post-repair repair_required_count: `0`
- closure rows: `3`
- impact rows: `3`

## Closures

- `sfk-bd12e603e3d781b949823e2e` `closure_registry_currentness_failure` -> `repaired`
  - PlanUnits: `PDS-014, PLS-012`
  - Owners: `Plans/.audits/_semantic_closure_registry.jsonl, scripts/pm-audit-closure.py`
  - Detail keys: `pm-audit-closure.py validate, owner_evidence_hashes, closure_evidence_hashes, stale_hash_error_count`
- `sfk-b6d8491bd5d8509b3345f13a` `ledger_projection_governance_status_drift` -> `repaired`
  - PlanUnits: `none`
  - Owners: `Plans/ledgers/v2/pldg-20260630-001-feature-intake/state/current.json, Plans/ledgers/v2/pldg-20260630-001-feature-intake/state/handoff.json, Plans/ledgers/v2/pldg-20260630-001-feature-intake/state/compile_queue.json`
  - Detail keys: `post_compile_pending_items[1], notes, validation_state.governance_status, validation_state.pm_plans_verify_run_gates, validation_state.pm_shard_plans_check`
- `sfk-b4f324ee79a3f93b1b370ef7` `reciprocal_source_lineage_atom_qualification` -> `repaired`
  - PlanUnits: `0PI-065`
  - Owners: `Plans/00-plans-index.md, Plans/.plan_index/plan_units.jsonl`
  - Detail keys: `source_atom_ids, source_lineage`

## Changed Surfaces

- `0PI-065` source_lineage now includes eight atom-qualified design atom refs and regenerated PlanUnit index mirrors.
- Sealed ledger projections no longer carry pending-governance tokens in current, handoff, or compile_queue state.
- Closure registry hashes were refreshed and three registry closure rows were added.
- Generated plan index, migration hash metadata, shards, Spec Lock, sharding evidence, and evidence hashes were regenerated through repo scripts.

## Validators

- `16/16` passed.
- `closure_registry_validate`: `pass`
- `closure_matrix_validate`: `pass`
- `target_ledger_validate`: `pass`
- `plan_index_validate`: `pass`
- `migration_validate`: `pass`
- `audit_governance`: `pass`
- `run_gates`: `pass`
- `shard_check`: `pass`
- `validate_auto_decisions`: `pass`
- `verify_spec_lock`: `pass`
- `validate_evidence`: `pass`
- `validate_plan_graph`: `pass`
- `check_project_artifacts`: `pass`
- `audit_closure_unittests`: `pass`
- `all_unittests`: `pass`
- `git_diff_check`: `pass`

## User Decisions

- None blocked repair certification.

## Closure Validation Modes

- Default closure validation also passes.
- Semantic-risk scoped closure validation also passes.
