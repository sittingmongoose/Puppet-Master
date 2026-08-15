# Shard 012: Case L Release Migration And Recovery Gate Propagation - 2026-07-17

Source: `Plans/Release_Supply_Chain.md`

Source lines: L707-L796

Source SHA256: `cceff122a79a89afe52631580df3de0a5913aea95a20d2bfe113e9ce88933a9a`

---

## Case L Release Migration And Recovery Gate Propagation - 2026-07-17

This section consumes the approved Case L owner contracts after owner-first repair. `Plans/storage-plan.md` owns version admission, `StorageMigrationCoordinator`, mandatory recovery snapshots, backup/restore, progress/preflight, retention/maintenance exclusion, and storage aftermath. `Plans/storage_value_registry.json` owns the machine recovery disposition and `pm.storage_value.migration_receipt.v1` row. `Plans/Contracts_V0.md` owns `StorageCompatibilityStatus` and `MigrationProgressSnapshot`. `Plans/Automated_Testing_System.md` owns fixture execution and receipts. Release owns only candidate admission and rollout refusal based on that evidence.

The release gate is fail-closed. A candidate cannot enter a user rollout ring when any required Case L fixture is missing, skipped, inconclusive, stale for the candidate's exact artifact/store-schema set, or produces an outcome other than the owner-defined oracle. A generic “downgrade/backup restore passed” label is not acceptable evidence.

Required release evidence is:

- compatibility/no-mutation: `FX-L001-REDB-AHEAD`, `FX-L001-SEGLOG-AHEAD`, `FX-L001-EVENT-AHEAD`, and `FX-L001-DOWNGRADE-WRITES`;
- migration crash/history/preflight: every `FX-L002-*`, `FX-L025-PREV-MAJOR-ALIAS`, `FX-L025-TOO-OLD`, `FX-L032-NOSPACE`, and `FX-L032-PROGRESS-INTERRUPT`;
- canonical redb recovery: every `FX-L003-*`, tied to the exact registry revision and affected canonical family IDs;
- shared-boundary backup/restore: `FX-L016-ACTIVE-WRITE`, `FX-L016-NEWER-BACKUP`, and `FX-L016-KILL-RESTORE`; and
- cross-contract envelope checks from `ATS-024`, including EventRecord 2.0/legacy compatibility and exact-replace restore/SCM/retention negative oracles when the candidate changes or consumes those surfaces.

The migration-progress fixture asserts the exact post-preflight interruption copy `Keep Puppet Master open. If interrupted, recovery will resume on the next launch.` and the absence of force-cancel/try-anyway after preflight. The startup action inventory asserts read-only metadata diagnostics and owner-routed recovery only; a generic live verify/repair/salvage command, Doctor mutation mode, in-place store editor, or bypass token fails the candidate.

The gate records candidate artifact hashes, app/store/EventRecord versions, registry revision, fixture IDs, linked `TestRunReceipt`/evidence refs, backup-manifest ref/hash, migration receipt ID, exact expected/observed terminal state, and freshness. It does not copy the storage journal or FileSafe restore algorithm into release metadata.

Negative release oracles are mandatory: no target mutation on incompatible/preflight refusal; no ordinary-open mixed migration/restore state; no “rebuildable projection” recovery claim for canonical redb; no compatible-backup downgrade without `data_loss_risk`; no success from `restore_failed`, `restore_recovery_required`, skipped/inconclusive tests, or missing receipt read-back; and no runtime/completeness claim from plan or schema validation.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Automated_Testing_System.md, DecisionID:PD-L-01, DecisionID:PD-L-02, DecisionID:PD-L-03, DecisionID:PD-L-04, DecisionID:PD-L-05, DecisionID:PD-L-06

### RSC-009 - Case L Release Migration Backup And Recovery Evidence Gate

```yaml
plan_unit_id: RSC-009
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  Release admission consumes, without redefining, the storage-owned newer-store refusal, forward migration,
  mandatory canonical-redb backup, whole-boundary restore-only downgrade, disk preflight, progress, recovery
  disposition, and migration-receipt contracts. A candidate advances only when every applicable named Case L
  fixture produces its exact positive and negative oracle with current artifact/schema/registry evidence.
gui_related: true
gui_classification_reason: Release-blocked compatibility, rollback loss, and recovery results have user-visible update and recovery consequences.
depends_on: [RSC-001, RSC-008, ATS-024, SP-235]
unblocks: []
acceptance_criteria:
  - One-version-ahead and unsupported-old fixtures refuse before mutation; before/after hashes are identical and no live newer-store viewer or try-anyway path exists.
  - Every migration crash cut converges from the durable journal to the expected committed, verified rollback, or blocked state with exactly one receipt and no ordinary-open mixed state.
  - Every canonical non-rebuildable family has registry-bound verified-backup/restore evidence; projection rebuild cannot satisfy the gate.
  - Active-write backup and kill-mid-restore fixtures prove one verified shared boundary or the verified original, while newer backups are refused before live mutation.
  - Startup and progress command inventory exposes only owner-approved diagnostics/recovery actions and no generic repair/salvage/Doctor mutation, bypass, post-preflight force-cancel, or try-anyway path.
  - RSC-008 fields round-trip from pm.storage_value.migration_receipt.v1 and each fixture's terminal_status matches its expected oracle.
  - Missing, stale, skipped, inconclusive, or merely schema-valid evidence blocks rollout and is never reported as runtime completion.
validation_surfaces:
  - Plans/Automated_Testing_System.md#ATS-024
  - FX-L001-*, FX-L002-*, FX-L003-*, FX-L016-*, FX-L025-*, and FX-L032-*
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_release_migration_recovery_false_admission
reasoning_tier: high
context_scope: case_l_release_migration_backup_recovery
implementation_surfaces:
  - Plans/Release_Supply_Chain.md
  - Plans/Automated_Testing_System.md
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: case_l_release_evidence_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-001
  - Case-L:L-002
  - Case-L:L-003
  - Case-L:L-016
  - Case-L:L-025
  - Case-L:L-031
  - Case-L:L-032
  - Case-L:PD-L-01..PD-L-06
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/CONSUMER_PROPAGATION_MAP.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
preserved_exact_tokens:
  - "blocked_newer_store"
  - "pm.storage_value.migration_receipt.v1"
  - "verification_result"
  - "terminal_status"
  - "data_loss_risk"
  - "FX-L016-KILL-RESTORE"
negative_constraints:
  - Do not define a peer migration receipt, state machine, backup manifest, restore algorithm, or compatibility enum.
  - Do not admit rollout from generic pass labels, schema validity, or missing/skipped/inconclusive fixture evidence.
  - Do not claim runtime execution, finding closure, buildability, certification, or Plans completeness from this contract.
owner_hints:
  - Plans/Release_Supply_Chain.md
  - Plans/storage-plan.md
  - Plans/Automated_Testing_System.md
```
