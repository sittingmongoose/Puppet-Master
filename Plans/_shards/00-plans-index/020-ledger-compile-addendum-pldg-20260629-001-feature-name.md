# Shard 020: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/00-plans-index.md`

Source lines: L4880-L4941

Source SHA256: `e0358f4d0c5cdce2cbbac0fdef1e70a80ba910ff84c72d999f77c9fc01893eb2`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum registers the Free Models compile owner map. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### 0PI-064 - Free Models Compile Owner Map

```yaml
plan_unit_id: 0PI-064
unit_type: owner_map
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Free Models ledger compiles into existing owner docs rather than a new Free Models plan doc. Models_System owns provider/model wrapper identity, Auto Apply source/cadence/runtime-adapter policy, top-10 precedence, and availability reason semantics. Multi-Account owns underlying provider/account setup and shared pressure/cooldown. usage-feature owns paid/costed fallback gates, Usage receipts, and immutable request provenance. Contracts_V0 owns import, adapter, identity, and route eligibility contracts. storage-plan owns import snapshots, aliases, currentness, activation/quarantine/rollback, and diagnostics storage. Permissions_System owns source trust, credential custody, probe, and live-call authority. FileSafe owns upstream side-effect blocking. FinalGUISpec owns visible catalog/settings/top-10/setup/update UX. Runtime_Artifacts_Panel owns diagnostic and provenance projections. Executor_Protocol owns dispatch fallback, in-flight isolation, and adapter activation. Prompt_Pipeline owns requested/effective route snapshot handoff. Provider_OpenCode remains adjacent/reference-only unless a concrete OpenCode-specific Free Models hook is later accepted.
gui_related: false
gui_classification_reason: This index entry records owner routing and compile lineage; GUI behavior is owned by referenced GUI PlanUnits.
depends_on: []
unblocks: []
acceptance_criteria:
  - The index records the canonical owner-doc set for Free Models.
  - Provider_OpenCode is explicitly adjacent/reference-only for this compile.
  - No new Free Models owner doc, WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files are created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - git diff --check
risk_class: owner_map_drift
reasoning_tier: standard
context_scope: free_models_compile_owner_map
implementation_surfaces:
  - Plans/00-plans-index.md
node_compile_hint:
  mode: free_models_owner_map
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/state/current.json
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/state/handoff.json
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_upstream_inspection_20260629.json
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_temp_checkout_inspection_20260629.json
source_atom_ids: [atom-0268, atom-0272, atom-0273, atom-0274, atom-0297, atom-0298]
preserved_exact_tokens:
  - "Free Models"
  - "Provider_OpenCode adjacent/reference-only"
  - "Do not compile Free Models ownership into Provider_OpenCode by default"
  - "No canonical Plans, PlanUnit index, governance, WorkNode, NodeSeed, executable queue, runtime/build, or implementation artifacts were touched"
negative_constraints:
  - Do not compile Free Models ownership into Provider_OpenCode by default; keep Provider_OpenCode adjacent/reference-only unless a concrete hook is later accepted.
  - Do not call this compile governance sealed until an explicit governance seal phase refreshes generated governance artifacts.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/FinalGUISpec.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Executor_Protocol.md
  - Plans/Prompt_Pipeline.md
  - Plans/FileSafe.md
```
