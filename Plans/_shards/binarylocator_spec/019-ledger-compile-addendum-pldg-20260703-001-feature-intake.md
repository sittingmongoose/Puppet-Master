# Shard 019: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L1755-L1827

Source SHA256: `841eb411c76dcc294459641183432172fed5ee3515a566e23716c09b85ad1e6a`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### BS-027 - desktop_version_handshake

```yaml
plan_unit_id: BS-027
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  desktop_version_handshake (P0) is compiled as canonical Puppet Master intent for desktop_version_handshake: Add DesktopServerVersionHandshake and EmbeddedRuntimeLifecycle The preserved PM gap/delta is: No explicit DesktopServerVersionHandshake found The observed external-repo signal remains source-lineage evidence: OpenCode desktop/local server/session tab/version issues; recent release patches
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Desktop/server/CLI/schema mismatch tests
- LocalServer watchdog tests
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Desktop/server/CLI/schema mismatch tests
- LocalServer watchdog tests
risk_class: p0_cross_system_runtime_contracts_hardening
reasoning_tier: high
context_scope: cross_system_runtime_contracts
implementation_surfaces:
- Plans/BinaryLocator_Spec.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: desktop_version_handshake
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0110
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0110
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0106/desktop_version_handshake@line=106
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0106/desktop_version_handshake
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:8
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0110
external_atom_id: extrepo-20260703-0106
source_row_id: desktop_version_handshake
priority: P0
finding_family: desktop_version_handshake
target_docs:
- Plans/BinaryLocator_Spec.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
owner_hints:
- Plans/BinaryLocator_Spec.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
preserved_exact_tokens:
- extrepo-20260703-0106
- desktop_version_handshake
- P0
negative_constraints: []
observed_signal: OpenCode desktop/local server/session tab/version issues; recent release patches
pm_current_coverage: Setup/Health discovery and version-gated binary probes exist
pm_gap_or_delta: No explicit DesktopServerVersionHandshake found
proposal_or_recommendation: Add DesktopServerVersionHandshake and EmbeddedRuntimeLifecycle
compile_disposition: create_new_planunit
```
