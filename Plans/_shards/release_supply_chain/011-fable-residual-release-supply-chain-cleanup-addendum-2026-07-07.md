# Shard 011: FABLE Residual Release Supply Chain Cleanup Addendum - 2026-07-07

Source: `Plans/Release_Supply_Chain.md`

Source lines: L589-L648

Source SHA256: `2f435c22a3df5b5db45df514a0dfcd9646733e01f7dfc50b12e48fe9b1081def`

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
gui_related: false
gui_classification_reason: Release signing, SBOM, update, and migration contracts are supply-chain governance, not GUI implementation.
depends_on: [RSC-001, RSC-002, RSC-003, RSC-004, RSC-005, RSC-006, RSC-007]
unblocks: []
acceptance_criteria:
  - ReleaseArtifactReceipt includes artifact_name, platform, artifact_sha256, size_bytes, signature_ref, key_id, trust_root_ref, notarization_ref?, sbom_ref, and provenance_ref.
  - SBOM receipt uses SPDX JSON or CycloneDX JSON, records generator identity, component_count, dependency_hashes_present, license_summary_ref, and reproducibility_notes_ref.
  - UpdateMetadata records channel, version, previous_version, minimum_supported_version, rollout_percentage, migration_plan_ref, rollback_ref, release_notes_ref, and failure_state_copy_ref.
  - MigrationReceipt records from_version, to_version, schema_ids[], preflight_result, backup_ref, applied_steps[], rollback_available, rollback_result?, and data_loss_risk.
  - Install/update validation fails closed when signature, SBOM, artifact hash, migration, or rollback receipt is missing or stale.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_release_supply_chain_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Release_Supply_Chain.md
node_compile_hint:
  mode: release_supply_chain_residual_minimum_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1264
  - fablereport.md:1265
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "signing"
  - "SBOM"
  - "update"
  - "migration"
  - "rollback"
  - "notarization"
negative_constraints:
  - Do not create package artifacts, installer jobs, production build tasks, implementation files, WorkNodes, NodeSeeds, executable queues, or runtime certification evidence.
  - Do not treat release notes or checksums alone as signing, SBOM, update, or migration proof.
owner_hints:
  - Plans/Release_Supply_Chain.md
  - Plans/BinaryLocator_Spec.md
  - Plans/Project_Output_Artifacts.md
```
