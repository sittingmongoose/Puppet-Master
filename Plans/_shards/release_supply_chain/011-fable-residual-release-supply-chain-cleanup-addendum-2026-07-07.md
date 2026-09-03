# Shard 011: FABLE Residual Release Supply Chain Cleanup Addendum - 2026-07-07

Source: `Plans/Release_Supply_Chain.md`

Source lines: L616-L705

Source SHA256: `118be1d006503d8868bd2c1f8a80b1ca1c2c3f80417be9090296bb82770d777c`

---

## FABLE Residual Release Supply Chain Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High release supply-chain rows for signing, SBOM, updates, and migration minima. It does not create package builds, production release jobs, implementation files, or runtime certification evidence.

### RSC-008 - Signing, SBOM, Update, And Migration Minimum Contract

```yaml
plan_unit_id: RSC-008
unit_type: schema_contract
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  A release candidate is not supply-chain complete until it carries signed artifact provenance, SBOM identity,
  update-channel metadata, rollback metadata, and migration receipts. Signing records algorithm, key_id,
  trust_root_ref, signature_ref, notarization_ref?, artifact_sha256, and verifier_result. SBOM records SPDX or
  CycloneDX format, component count, dependency hashes, license summary, generator, and generation time. Updates
  record channel, version, minimum_supported_version, migration_plan_ref, rollback_ref, and user-visible failure state.
  Migration receipt authority is the storage-registry pm.storage_value.migration_receipt.v1 row produced by
  StorageMigrationCoordinator; Release consumes that row and its journal/backup evidence rather than defining a peer receipt.
gui_related: false
gui_classification_reason: Release signing, SBOM, update, and migration contracts are supply-chain governance, not GUI implementation.
depends_on: [RSC-001, RSC-002, RSC-003, RSC-004, RSC-005, RSC-006, RSC-007]
unblocks: []
acceptance_criteria:
  - ReleaseArtifactReceipt includes artifact_name, platform, artifact_sha256, size_bytes, signature_ref, key_id, trust_root_ref, notarization_ref?, sbom_ref, and provenance_ref.
  - SBOM receipt uses SPDX JSON or CycloneDX JSON, records generator identity, component_count, dependency_hashes_present, license_summary_ref, and reproducibility_notes_ref.
  - UpdateMetadata records channel, version, previous_version, minimum_supported_version, rollout_percentage, migration_plan_ref, rollback_ref, release_notes_ref, and failure_state_copy_ref.
  - MigrationReceipt round-trips schema_id, schema_version, receipt_id, migration_id, from_version, to_version, schema_ids[], store_transitions[], family_transitions[], preflight_result, backup_ref, applied_steps[], verification_result, rollback_available, rollback_result, data_loss_risk, terminal_status, started_at_utc, completed_at_utc, app_version, journal_ref, and redaction_profile from pm.storage_value.migration_receipt.v1; rollback_result is required-present on every receipt and its value may be null only as allowed by that registered schema.
  - terminal_status is storage-owned and closed to committed, rolled_back, or blocked; each release fixture must match its expected terminal state, and committed is not accepted without verification_result plus receipt read-back.
  - preflight_result carries exact required and available space evidence; insufficient space fails before backup or mutation and preserves before/after target equality.
  - backup_ref resolves to one verified shared-boundary manifest with relative file hashes/sizes, store/app versions, root identity, backup kind, and durable seglog boundary; JSON/JSONL export is not accepted as an MVP backup.
  - rollback_available, required-present but nullable rollback_result, and data_loss_risk bind to the storage-owned whole-boundary restore-only downgrade policy and disclose post-backup writes or unknown corruption risk before confirmation.
  - Install/update validation fails closed when signature, SBOM, artifact hash, migration, or rollback receipt is missing or stale.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - Plans/Automated_Testing_System.md#ATS-024
  - FX-L002-RECEIPT-ROUNDTRIP
  - FX-L016-ACTIVE-WRITE
  - FX-L016-NEWER-BACKUP
  - FX-L016-KILL-RESTORE
  - FX-L032-NOSPACE
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_release_supply_chain_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Release_Supply_Chain.md
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Contracts_V0.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: release_supply_chain_residual_minimum_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-001
  - Case-L:L-002
  - Case-L:L-003
  - Case-L:L-016
  - Case-L:L-032
  - Case-L:PD-L-01..PD-L-06
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - fablereport.md:1264
  - fablereport.md:1265
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "pm.storage_value.migration_receipt.v1"
  - "StorageMigrationCoordinator"
  - "verification_result"
  - "terminal_status"
  - "data_loss_risk"
  - "signing"
  - "SBOM"
  - "update"
  - "migration"
  - "rollback"
  - "notarization"
negative_constraints:
  - Do not create package artifacts, installer jobs, production build tasks, implementation files, WorkNodes, NodeSeeds, executable queues, or runtime certification evidence.
  - Do not treat release notes or checksums alone as signing, SBOM, update, or migration proof.
  - Do not redefine the storage migration state machine, receipt, backup manifest, restore algorithm, or compatibility enum in Release.
  - Do not count fixture registration or a schema-valid receipt as executed migration, backup, restore, rollback, or crash-convergence proof.
owner_hints:
  - Plans/Release_Supply_Chain.md
  - Plans/BinaryLocator_Spec.md
  - Plans/Project_Output_Artifacts.md
```
