# Shard 011: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/PRD_Builder.md`

Source lines: L605-L650

Source SHA256: `e9769cb50487f832d0101abd9fea1326ce9b589a88ed94975e4f0665075de62a`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### PRDB-009 - PRD Builder Source Picker Discovery Consumer

```yaml
plan_unit_id: PRDB-009
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: >-
  PRD Builder source picker and source ingestion use DiscoveryService for project source discovery when building PRD source references. Requests use prd_builder_source_picker, project/worktree or remote/SSH identity, policy_context, and file or content_candidate target kinds. Selected candidates preserve provenance in PRD source refs and expose denied, stale, fallback, hidden-by-policy, and no-results states without leaking blocked paths. Raw Assistant Chat transcripts are not sufficient as sole source selection proof.
gui_related: true
gui_classification_reason: This is the PRD Builder source picker/source ingestion GUI and provenance behavior.
depends_on: [F3-399, T-161, SP-217, F2-191]
unblocks: [ATS-011, PWIZ-015]
acceptance_criteria:
  - PRD Builder source picking routes through DiscoveryService when discovering project files.
  - Selected candidate provenance is recorded in PRD source refs.
  - Denied/stale/fallback states are visible without leaking blocked path details.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future PRD Builder source picker local/SSH tests.
  - Future hidden-by-policy source no-leak tests.
risk_class: prd_source_provenance_drift
reasoning_tier: standard
context_scope: prd_builder_source_picker
implementation_surfaces: [Plans/PRD_Builder.md, future PRD Builder source picker]
node_compile_hint: {mode: prd_builder_discovery_consumer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0027
  - pldg-20260622-001-fff:atom-0038
  - pldg-20260622-001-fff:atom-0044
  - pldg-20260622-001-fff:atom-0045
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#prd_builder_source_picker
source_atom_ids: [atom-0027, atom-0038, atom-0044, atom-0045, atom-0059, atom-0087, atom-0088, atom-0090]
preserved_exact_tokens: ["PRD Builder", "prd_builder_source_picker", "source ingestion", "PRD source refs", "content_candidate", "raw Assistant Chat transcript", "hidden-by-policy"]
negative_constraints:
  - Do not use raw Assistant Chat transcript as the sole source selection proof.
  - Do not collapse PRD Builder into Planning Wizard.
  - Do not create implementation-ready Plans or runtime work from PRD source discovery alone.
owner_hints: [Plans/PRD_Builder.md, Plans/FinalGUISpec.md, Plans/Tools.md, Plans/storage-plan.md]
```
