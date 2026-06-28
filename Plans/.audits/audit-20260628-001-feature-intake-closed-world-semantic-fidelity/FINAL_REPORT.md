# Closed-World Semantic Audit - audit-20260628-001-feature-intake-closed-world-semantic-fidelity

Status: BLOCKED_REPAIR_REQUIRED

Ledger: `pldg-20260627-001-feature-intake`
Baseline ref: `909d47699`
Subject ref: `8f377b33a`
Observation ref: `HEAD`

Scope rows: 10495. Classified rows: 10495. Coverage: 100.0%.

Actionable findings: 5. Repair required count: 5.

## Repair-Required Findings

1. `dependency_cycle` (error): `sfk-96cfa9b6b3c29b4b1c6a8d86`
   PlanUnits: F3-405, UCC-103, WM-039, ATS-016
   Evidence: Plans/FinalGUISpec.md:25820; Plans/UI_Command_Catalog.md:7503; Plans/Wiring_Matrix.md:3208; Plans/Automated_Testing_System.md:1232
   Summary: Feature-intake introduced a new dependency cycle: F3-405 depends_on UCC-103 while UCC-103 depends_on F3-405; WM-039 and ATS-016 are blocked downstream.
2. `notification_receipt_artifact_owner_gap` (error): `sfk-4dc2cce8478d9641df95fe91`
   PlanUnits: CV-298, SP-222, PS-124, ATS-016
   Evidence: Plans/Contracts_V0.md:18497; Plans/storage-plan.md:15661; Plans/storage-plan.md:15668; Plans/Permissions_System.md:8376
   Summary: Notification delivery receipts are defined in contract/storage/permission owners, but no notification/sound Runtime Artifacts PlanUnit owns user-visible projection/export routing.
3. `closure_registry_currentness_failure` (error): `sfk-371b3e6a7061c8c73a3b3584`
   PlanUnits: PDS-014, PLS-012
   Evidence: python3 scripts/pm-audit-closure.py validate --registry Plans/.audits/_semantic_closure_registry.jsonl: exit 1; Plans/.audits/_semantic_closure_registry.jsonl:327; Plans/.audits/_semantic_closure_registry.jsonl:329; python3 scripts/pm-audit-closure.py refresh-hashes --dry-run: 220 touched rows, 241 owner hash updates, 326 closure hash updates
   Summary: Closure registry validation fails with stale owner/closure evidence hashes after the feature-intake cycle.
4. `diff_validator_failure` (error): `sfk-b3c5eadddc777d8c08689c55`
   PlanUnits: none
   Evidence: git diff --check 909d47699..8f377b33a -- Plans: exit 2; Plans/.audits/audit-20260627-002-feature-name-post-repair-closed-world-semantic-fidelity/FINAL_REPORT.md:5; Plans/.audits/audit-20260627-002-feature-name-post-repair-closed-world-semantic-fidelity/FINAL_REPORT.md:6; Plans/.audits/audit-20260627-002-feature-name-post-repair-closed-world-semantic-fidelity/FINAL_REPORT.md:7
   Summary: Working-tree git diff --check passes, but the subject range diff check fails on trailing whitespace introduced in a prior generated audit report included in the cycle.
5. `ledger_projection_stale_readiness_ref` (warning): `sfk-a431d10b9b34978abeec62c3`
   PlanUnits: none
   Evidence: Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compile_queue.json:1367-1375; Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/current.json:320-328; Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/implementation_readiness_fifth_recheck_20260628.json:12-14; Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/implementation_readiness_repair_20260628.json:4-11
   Summary: Ledger projections still point latest_audit_ref/source_readiness_recheck_ref at the pre-repair fifth readiness check while claiming sealed product readiness; operating_capsule also remains on compiled_pending_governance_seal after evt-0029 sealed governance.

## Non-Actionable Warnings

- `planunit_source_atom_ids_sparse`: direct `source_lineage` exists for affected PlanUnits, but some `source_atom_ids` arrays remain sparse.
- `node_readiness_phase_boundary`: `blocked_compiler_contract_incomplete` / `runtime_disabled` remains expected; no WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, or legacy Iced app files were created.
- `audit_bundle_untracked_not_in_subject_ref`: current audit files are untracked audit-only outputs and not part of `subject_ref`.

## Validators

Validator status: fail. Failed commands:
- `python3 scripts/pm-audit-closure.py validate --registry Plans/.audits/_semantic_closure_registry.jsonl` -> exit 1
- `git diff --check 909d47699..8f377b33a -- Plans :!Plans/.audits/audit-20260628-001-feature-intake-closed-world-semantic-fidelity/**` -> exit 2

All other recorded validators passed: target ledger, PlanUnit index, migration state, governance run-gates, audit-governance, shard check, auto decisions, Spec Lock, evidence, plan graph, and working-tree `git diff --check`.

Closure registry dry-run refresh evidence: 220 touched rows, 241 owner hash updates, 326 closure hash updates.

## Closure Reuse

Reopened: `closure-audit-20260627-001-feature-name-closed-world-semantic-fidelity-repair-003` and `repair-005`.
Reused as semantically closed: provider repair-001/002 and feature-name repair-001/004, though registry hashes are mechanically stale until an authorized repair phase.

## Next Action

Stop audit-only. Repair is required before terminal certification: break the `F3-405`/`UCC-103` cycle, add notification receipt Runtime Artifacts projection/export ownership, repair stale ledger projections, fix the subject-range whitespace issue, then refresh closure registry hashes in an authorized repair/seal lane and rerun this audit class.
