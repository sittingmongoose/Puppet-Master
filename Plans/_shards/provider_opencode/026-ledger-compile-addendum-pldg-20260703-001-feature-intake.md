# Shard 026: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Provider_OpenCode.md`

Source lines: L3575-L3714

Source SHA256: `a12b718a45753bcde5cdc746dc48c75778ab92be98949edde5a9adb07c9849c9`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PO-050 - opencode_v2_delta

```yaml
plan_unit_id: PO-050
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  opencode_v2_delta (P0) is compiled as canonical Puppet Master intent for opencode_v2_delta: Add OPEN-CODE-V2-DELTA-MATRIX The preserved PM gap/delta is: Older OpenCode limitations may remain treated as hard assumptions without v2 review The observed external-repo signal remains source-lineage evidence: OpenCode beta/specs/v2 config/provider/session/tools/API are major redesign
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Research-mode import
- plan index
- audit closure registry
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Research-mode import
- plan index
- audit closure registry
risk_class: p0_opencode_v2_delta_hardening
reasoning_tier: high
context_scope: opencode_v2_delta
implementation_surfaces:
- Plans/Provider_OpenCode.md
- Plans/OpenCode_Deep_Extraction.md
- Plans/OpenCode_Coverage_Matrix.md
node_compile_hint:
  mode: opencode_v2_delta
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0111
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0111
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0107/opencode_v2_delta@line=107
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0107/opencode_v2_delta
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:9
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0111
external_atom_id: extrepo-20260703-0107
source_row_id: opencode_v2_delta
priority: P0
finding_family: opencode_v2_delta
target_docs:
- Plans/Provider_OpenCode.md
- Plans/OpenCode_Deep_Extraction.md
- Plans/OpenCode_Coverage_Matrix.md
owner_hints:
- Plans/Provider_OpenCode.md
- Plans/OpenCode_Deep_Extraction.md
- Plans/OpenCode_Coverage_Matrix.md
preserved_exact_tokens:
- extrepo-20260703-0107
- opencode_v2_delta
- P0
negative_constraints: []
observed_signal: OpenCode beta/specs/v2 config/provider/session/tools/API are major redesign
pm_current_coverage: Existing OpenCode docs and source-lineage boundaries exist
pm_gap_or_delta: Older OpenCode limitations may remain treated as hard assumptions without v2 review
proposal_or_recommendation: Add OPEN-CODE-V2-DELTA-MATRIX
compile_disposition: create_new_planunit
```

### PO-051 - v2_sdk_stability

```yaml
plan_unit_id: PO-051
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  v2_sdk_stability (P2) is compiled as canonical Puppet Master intent for v2_sdk_stability: Add V2 SDK compatibility watchlist/status gate The preserved PM gap/delta is: Need explicit unstable SDK dependency gate The observed external-repo signal remains source-lineage evidence: OpenCode issues ask whether v2 client export/sdk is stable
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Build blocks on unstable SDK without adopted compatibility proof
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Build blocks on unstable SDK without adopted compatibility proof
risk_class: p2_provider_capability_and_metadata_coverage
reasoning_tier: standard
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: v2_sdk_stability
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0117
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0117
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0113/v2_sdk_stability@line=113
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0113/v2_sdk_stability
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:15
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0117
external_atom_id: extrepo-20260703-0113
source_row_id: v2_sdk_stability
priority: P2
finding_family: v2_sdk_stability
target_docs:
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
owner_hints:
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
preserved_exact_tokens:
- extrepo-20260703-0113
- v2_sdk_stability
- P2
negative_constraints: []
observed_signal: OpenCode issues ask whether v2 client export/sdk is stable
pm_current_coverage: Provider source-lineage boundaries already warn against overclaiming
pm_gap_or_delta: Need explicit unstable SDK dependency gate
proposal_or_recommendation: Add V2 SDK compatibility watchlist/status gate
compile_disposition: create_new_planunit
```
