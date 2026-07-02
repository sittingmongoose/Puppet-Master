# Shard 017: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/Prompt_Pipeline.md`

Source lines: L3956-L4014

Source SHA256: `64ca8a48110fb45fad82aaad2f36be148997d8ca316fb63df789ced7855666e3`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles the Free Models prompt-route consumer contract. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### PP-058 - Free Models Requested Effective Route Snapshot Handoff

```yaml
plan_unit_id: PP-058
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline consumes a requested/effective route snapshot for Free Models that includes the user-facing wrapper, underlying provider/model/account/source identity, section policy source, fallback reason, cost/usage refs, capability/support state, and source snapshot refs before provider handoff. Prompt assembly must not infer route identity from friendly model names alone and must preserve section/surface/role override provenance.
gui_related: false
gui_classification_reason: Defines prompt assembly and provider handoff metadata, not GUI presentation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Prompt handoff snapshots include requested and effective provider/model/account/source identity.
  - Section/surface/role override source is carried through prompt assembly.
  - Friendly names do not replace canonical provider/model/account/source ids.
  - Fallback reason and cost/usage refs are available for Usage and Runtime Artifacts projection.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models requested/effective route snapshot fixtures
  - Prompt handoff provenance fixtures
risk_class: prompt_route_identity_drift
reasoning_tier: high
context_scope: free_models_prompt_pipeline_handoff
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
  - Plans/Models_System.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: free_models_prompt_route_snapshot_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0012, atom-0026, atom-0113, atom-0117, atom-0118, atom-0122, atom-0126, atom-0234, atom-0238, atom-0242, atom-0246, atom-0276, atom-0281, atom-0282, atom-0297, atom-0298]
preserved_exact_tokens:
  - "requested/effective"
  - "section/surface/role"
  - "fallback reason"
  - "provider/model/account/source"
  - "source snapshot"
  - "Provider_OpenCode adjacent/reference-only"
negative_constraints:
  - Do not infer provider/model/account/source identity from model display names alone.
  - Do not hide requested/effective model differences when section settings override the global top-10.
  - Do not compile Free Models ownership into Provider_OpenCode by default.
owner_hints:
  - Plans/Prompt_Pipeline.md
  - Plans/Models_System.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
```
