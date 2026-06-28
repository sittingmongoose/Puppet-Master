# Closed-World Semantic Audit - audit-20260628-002-feature-intake-post-repair-closed-world-semantic-fidelity

Status: PASS_WITH_WARNINGS

Ledger: `pldg-20260627-001-feature-intake`
Baseline ref: `909d47699`
Subject ref: `1ff67a1b0`
Observation ref: `HEAD`
Generated: `2026-06-28T15:10:23Z`

Scope rows: 9628. Classified rows: 9628. Coverage: 100.0% via `atom_fidelity_matrix.jsonl`.
Compiled atoms: 94. Compiled PlanUnits: 39. Changed live Plan docs: 17.

Actionable findings: 0. Repair required count: 0.

## Result

This audit is terminal as `PASS_WITH_WARNINGS`. The closed-world scope was generated before semantic review, all scope rows were classified in the classification matrix, and no row requires repair. No product canon, ledger state, index, shard, evidence, or governance files were edited by this audit; the write surface is this audit directory only.

## Non-Actionable Findings

1. `planunit_source_atom_ids_sparse` (warning): `sfk-2d0d5128335b39b25eafb726`
   Repair required: `false`
   PlanUnits: 0PI-063, ACD-177, ACD-414, ACD-427, ACD-428, ACD-429, ARC-036, ATS-015, ATS-016, ATS-017, ATS-018, CV-298, CV-299, CV-300, DP-063, DR-036, F3-132, F3-404, F3-405, F3-406, ISI-019, OSI-430, PP-057, PS-123, PS-124, RAP-037, RAP-038, SP-119, SP-221, SP-222, SP-223, UCC-060, UCC-103, UCC-104, UF-011, WM-019, WM-039, WM-040
   Evidence: Plans/.plan_index/plan_units.jsonl; Plans/.audits/audit-20260628-001-feature-intake-closed-world-semantic-fidelity/post_repair_audit_report.json
   Summary: 38 compiled PlanUnits rely on direct source_lineage rather than complete source_atom_ids; prior repair bundle classifies this as warning-only and reciprocal lineage remains supported.
2. `node_readiness_phase_boundary` (warning): `sfk-f3c5bd6c13f47fdd3d97a050`
   Repair required: `false`
   PlanUnits: none
   Evidence: Plans/.plan_index/node_readiness_report.json; Plans/.audits/audit-20260628-001-feature-intake-closed-world-semantic-fidelity/REPAIR_CERTIFICATION.md
   Summary: Node readiness remains blocked by compiler/runtime boundary by design; no executable node artifacts are authorized.
3. `audit_bundle_untracked_not_in_subject_ref` (info): `sfk-600af2985eb6947431507d29`
   Repair required: `false`
   PlanUnits: none
   Evidence: Plans/.audits/audit-20260628-002-feature-intake-post-repair-closed-world-semantic-fidelity/audit_scope_manifest.jsonl
   Summary: This audit bundle is intentionally written after subject_ref under the audit-only write boundary; observation_ref records HEAD.
4. `lineage_weak_row_atom_alignment` (warning): `sfk-1e9987ca0da5d7aa5e7b4df0`
   Repair required: `false`
   PlanUnits: ATS-015
   Evidence: Plans/Automated_Testing_System.md:1184; Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:302
   Summary: ATS-015 cites the inline visualizer automated-test matrix row while using a consolidated source atom; source_lineage remains present and this is non-actionable.
5. `lineage_weak_row_atom_alignment` (warning): `sfk-d02c96cd574c358c6d82fc5e`
   Repair required: `false`
   PlanUnits: PS-124
   Evidence: Plans/Permissions_System.md:8404; Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:538
   Summary: PS-124 cites a validation matrix row whose linked atoms are broader than the PlanUnit source atom list; source_lineage remains present and this is non-actionable.

## Closure Reuse

Five prior audit-001 repair closures remain closed at `subject_ref=1ff67a1b0` and `observation_ref=HEAD`. Reopened count: 0.

- `dependency_cycle`: `sfk-86db9520ada607519d81d553` via `closure-audit-20260628-001-feature-intake-closed-world-semantic-fidelity-repair-001`
- `notification_receipt_artifact_owner_gap`: `sfk-e19d99c878fe5bb3003d1896` via `closure-audit-20260628-001-feature-intake-closed-world-semantic-fidelity-repair-002`
- `closure_registry_currentness_failure`: `sfk-2c2724eecefb5f4a899ed133` via `closure-audit-20260628-001-feature-intake-closed-world-semantic-fidelity-repair-003`
- `diff_validator_failure`: `sfk-66961e9860756a5854b98333` via `closure-audit-20260628-001-feature-intake-closed-world-semantic-fidelity-repair-004`
- `ledger_projection_stale_readiness_ref`: `sfk-43dea7138d4c7af4469d8d25` via `closure-audit-20260628-001-feature-intake-closed-world-semantic-fidelity-repair-005`

## Ledger Consistency

Projection status: `pass`. Ledger registry/current-state projections still point at the prior repaired terminal bundle, which is expected because this audit-only observation does not restamp ledger projections.

Compiled PlanUnit count: `39`. Open blockers: `0`. Open questions: `0`.

## Validators

Validator status: pass. Results: 14/14 passed. Non-audit side effects: 0.

- `pm_bootstrap_ledger_validate`: pass (exit 0, side effects 0)
- `pm_plan_index_validate`: pass (exit 0, side effects 0)
- `pm_plan_migration_validate`: pass (exit 0, side effects 0)
- `pm_plans_verify_run_gates`: pass (exit 0, side effects 0)
- `pm_plans_verify_audit_governance`: pass (exit 0, side effects 0)
- `pm_shard_plans_check`: pass (exit 0, side effects 0)
- `pm_plans_verify_validate_auto_decisions`: pass (exit 0, side effects 0)
- `pm_plans_verify_verify_spec_lock`: pass (exit 0, side effects 0)
- `pm_plans_verify_validate_evidence`: pass (exit 0, side effects 0)
- `pm_plans_verify_validate_plan_graph`: pass (exit 0, side effects 0)
- `git_diff_check_worktree`: pass (exit 0, side effects 0)
- `git_diff_check_subject_range_plans`: pass (exit 0, side effects 0)
- `python_unittest_discover`: pass (exit 0, side effects 0)
- `pm_audit_closure_validate_completed_artifacts`: pass (exit 0, side effects 0)

The final `pm-audit-closure.py validate` pass accepts the completed audit artifacts with `repair_required_count=0`; no repair closure matrix is required for a zero-repair audit.

## Source Artifact Counts

- `audit_scope_manifest.jsonl`: 9628 rows
- `atom_fidelity_matrix.jsonl`: 9628 rows
- `planunit_source_claims.jsonl`: 3865 rows
- `owner_routing_findings.jsonl`: 39 rows
- `semantic_risks.jsonl`: 5 rows
- `closure_reuse.jsonl`: 5 rows
- `validator_results.json`: 14 results

## Next Action

`TERMINAL_NO_REPAIR_REQUIRED`: commit the completed audit bundle. No repair lane is opened by this audit.
