# Shard 032: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/storage-plan.md`

Source lines: L16024-L16113

Source SHA256: `89caadf9b7ade780790d06048c5ca8e4d86fb6e93b55d865b8a99716e372f5b9`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host persistence, projection, cleanup, and retention records. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### SP-226 - Containerized Host Persistence Projection And Cleanup Records

```yaml
plan_unit_id: SP-226
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  PM persists containerized-host profiles, instances, assignments, build artifacts, port access records, capability
  states, preflight receipts, execution receipts, TestRunReceipt host proof refs, cleanup_retention_receipt records,
  blocker payloads, and projection indexes under PM-owned identity. Host records preserve host_capability_ref,
  host_profile_id, host_instance_id, host_assignment_id, runtime_family, runtime_context_ref, permission_snapshot_id,
  filesafe_scope_ref, redaction_profile, retention_state, cleanup_policy, cleanup receipt refs, stale_window_expires_at_utc,
  confidence, health_state, source, and blocked_reason_code. Instances are ephemeral by default, retain-on-failure is
  explicit, and stale/orphaned resources reconcile through retained_for_debug, cleanup_pending, cleaned, orphaned, or
  historical states rather than inference from missing runtime resources.
gui_related: false
gui_classification_reason: Persistence, projection, and cleanup records are storage/data behavior, not GUI presentation.
depends_on: [CV-303, CRAU-091, PS-126, F2-194]
unblocks: [RAP-042, ATS-019, EP-109, F3-410]
acceptance_criteria:
  - Stored host profiles, instances, assignments, artifacts, access records, receipts, and blockers use PM-owned ids and preserve backend facts separately.
  - Dynamic port/access discoveries persist with source, confidence, health, staleness, redaction, and manual override state rather than becoming unqualified canon.
  - Failed or retained instances cannot disappear without cleanup_retention_receipt or explicit orphan reconciliation state.
  - Raw secrets, decrypted env values, registry credentials, and secret-bearing outputs are absent from persisted records and exports.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future containerized host storage schema fixtures
  - future cleanup/orphan reconciliation fixtures
risk_class: containerized_host_storage_drift
reasoning_tier: high
context_scope: containerized_host_persistence
implementation_surfaces:
  - Plans/storage-plan.md
  - future redb host profile, instance, assignment, access, receipt, and projection stores
node_compile_hint:
  mode: containerized_host_persistence_projection_records
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0012
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0016
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0020
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0039
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0048
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0058
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0063
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0066
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0067
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0072
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0078
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#core_contracts
source_atom_ids: [atom-0012, atom-0015, atom-0016, atom-0020, atom-0039, atom-0048, atom-0058, atom-0063, atom-0066, atom-0067, atom-0072, atom-0075, atom-0078, atom-0079]
decision_refs: [dec-0012, dec-0013, dec-0020]
preserved_exact_tokens:
  - "ephemeral instances by default"
  - "retain-on-failure"
  - "cleanup/retention"
  - "cleanup_retention_receipt"
  - "stale_window_expires_at_utc?"
  - "redaction_profile"
  - "retained_for_debug"
  - "cleanup_pending"
  - "orphaned"
  - "port_access_ref"
  - "dynamic URLs remain visible"
  - "canonical ports/URLs"
  - "confidence"
  - "health_state"
  - "source"
negative_constraints:
  - Do not persist transient port discoveries as canonical state without source/confidence/staleness.
  - Do not infer cleanup from missing runtime resources; use reference_state and cleanup receipts.
  - Do not silently discard failed host instances before receipts/artifacts are available.
  - Do not store raw secrets, decrypted env values, or unredacted registry credentials.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```
