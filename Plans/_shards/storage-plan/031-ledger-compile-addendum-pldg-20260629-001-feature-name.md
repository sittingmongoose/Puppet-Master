# Shard 031: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/storage-plan.md`

Source lines: L15913-L16022

Source SHA256: `8fd6656a5b7ad0b356227c3bc8452bf130b89dcf340992fdf465cd7d051abbc0`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models storage requirements for import snapshots, currentness, activation/quarantine/rollback, and redacted diagnostics. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### SP-224 - Free Models Import Snapshot Alias And Currentness Storage

```yaml
plan_unit_id: SP-224
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  PM persists Free Models trusted source state, source resolver outcomes, source refs, release/tag/commit/npm/changelog/source hashes, current and previous imported catalog snapshots, import disposition, check cadence/timestamps, stable internal imported ids, and alias/rename/provider-move mappings. Storage keeps underlying provider/account/model/source identity intact and stores secret material only as credential references, never raw secrets.
gui_related: false
gui_classification_reason: Defines persistence records, not user-visible visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Import snapshots preserve current and previous source state with hashes and source refs.
  - Alias/rename/provider-move mappings keep top-10 lists, section settings, Usage history, and diagnostics stable across upstream churn.
  - Secrets are represented only by refs and never raw secret/token values.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models import snapshot persistence fixtures
  - Alias/rename/provider-move persistence fixtures
risk_class: import_snapshot_storage_drift
reasoning_tier: high
context_scope: free_models_import_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
node_compile_hint:
  mode: free_models_import_snapshot_storage_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_upstream_inspection_20260629.json
source_atom_ids: [atom-0011, atom-0017, atom-0020, atom-0025, atom-0051, atom-0052, atom-0057, atom-0071, atom-0129, atom-0193, atom-0194, atom-0197, atom-0198, atom-0242, atom-0250, atom-0258, atom-0262, atom-0289, atom-0290]
preserved_exact_tokens:
  - "source/ref/version"
  - "source/ref/hash"
  - "Last checked"
  - "Last updated"
  - "stable PM internal IDs"
  - "upstream alias/rename mappings"
negative_constraints:
  - Do not store raw secret material in Free Models import snapshots.
  - Do not lose alias/rename/provider-move history during Auto Apply updates.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
```

### SP-225 - Free Models Activation Quarantine Rollback And Diagnostics Storage

```yaml
plan_unit_id: SP-225
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  PM persists Free Models activation receipts, last-known-good refs, quarantine state, rollback evidence, failed-check state, route impact, affected provider/model ids, redaction profile, redaction summary, and support export manifests. Failed or quarantined updates keep the current known-good state active. Diagnostics/export may preserve source/ref/hash and route impact while raw secrets, tokens, provider error payloads, and sensitive provider responses remain redacted or Advanced/Support-only.
gui_related: false
gui_classification_reason: Defines stored receipts and export manifests; GUI projection is owned elsewhere.
depends_on: []
unblocks: []
acceptance_criteria:
  - Failed/quarantined updates preserve last-known-good active state and write quarantine/rollback evidence.
  - Support exports include redaction profile and redaction summary.
  - Raw secrets/tokens and raw provider error payloads are never stored or exported in unredacted normal records.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models quarantine and rollback storage fixtures
  - Redacted diagnostics export fixtures
risk_class: rollback_diagnostics_storage_drift
reasoning_tier: high
context_scope: free_models_activation_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: free_models_activation_diagnostics_storage_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0034, atom-0061, atom-0064, atom-0066, atom-0070, atom-0083, atom-0087, atom-0178, atom-0182, atom-0225, atom-0229, atom-0233, atom-0237, atom-0241, atom-0245, atom-0249, atom-0252, atom-0253, atom-0256, atom-0260, atom-0264, atom-0277, atom-0278, atom-0287, atom-0288, atom-0291, atom-0292]
preserved_exact_tokens:
  - "current known-good state active"
  - "Free Models update needs attention"
  - "Retry check"
  - "View details"
  - "redacted copy/export"
  - "redaction summary"
  - "secrets/tokens always redacted"
  - "The user can’t fix this"
negative_constraints:
  - Do not expose secrets or tokens in Advanced/Support diagnostics.
  - Do not export raw secrets or tokens in diagnostics copy/export.
  - Do not expose raw provider error payloads in normal expanded availability rows.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Permissions_System.md
```
