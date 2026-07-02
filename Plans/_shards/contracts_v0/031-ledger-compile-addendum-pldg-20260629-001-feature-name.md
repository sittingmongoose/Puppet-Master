# Shard 031: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/Contracts_V0.md`

Source lines: L18729-L18843

Source SHA256: `f6a4a615611bbacf111a5cc25bd31e2fec0bae38d78d5123f2bbf5ae05cb301e`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models contract boundaries. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### CV-301 - Free Models Trusted Import Material And Adapter Receipt Contract

```yaml
plan_unit_id: CV-301
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Free Models Auto Apply import and runtime-adapter material must use PM-recognized contracts carrying trusted source/channel/ref/hash, schema id, risk class, import disposition, adapter-boundary type, validation/test result refs, activation refs, quarantine refs, rollback refs, and rejection evidence. The contract must explicitly distinguish accepted declarative catalog/router/probe/normalizer/fallback material from rejected arbitrary commands, scripts, forks, URLs, local proxies, telemetry hooks, credential writers, endpoint installers, self-update logic, and config writers.
gui_related: false
gui_classification_reason: Defines backend contract envelopes and receipt fields, not a visual surface.
depends_on: []
unblocks: []
acceptance_criteria:
  - Import material cannot be activated without source/ref/hash, schema id, import disposition, validation evidence, and activation/quarantine/rollback refs.
  - Unsupported or unsafe material emits a structured rejection/quarantine result instead of being silently ignored or executed.
  - Runtime behavior adaptation records are scoped to the Free Models provider and cannot apply to non-Free-Models providers.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models adapter receipt schema fixtures
  - Free Models unsafe material rejection fixtures
risk_class: unsafe_upstream_adapter_contract
reasoning_tier: high
context_scope: free_models_import_adapter_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
node_compile_hint:
  mode: free_models_trusted_import_contract_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_upstream_inspection_20260629.json
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_temp_checkout_inspection_20260629.json
source_atom_ids: [atom-0010, atom-0011, atom-0012, atom-0017, atom-0018, atom-0019, atom-0020, atom-0025, atom-0026, atom-0033, atom-0034, atom-0060, atom-0061, atom-0063, atom-0064, atom-0193, atom-0196, atom-0197, atom-0200, atom-0277, atom-0278, atom-0289, atom-0290]
preserved_exact_tokens:
  - "Auto Apply"
  - "schema normalizers"
  - "router scoring"
  - "fallback sets"
  - "probes"
  - "update checks"
  - "PM-owned safe adapter schemas, tests, activation receipts, quarantine, and rollback"
negative_constraints:
  - Do not activate Auto Apply runtime behavior without PM-owned safe adapter schemas, tests, source hashes, activation receipts, quarantine, and rollback.
  - Do not execute arbitrary upstream commands/scripts, local proxies, telemetry hooks, credential writers, endpoint installers, self-update logic, or arbitrary config writers.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```

### CV-302 - Free Models Wrapper Identity And Route Eligibility Contract

```yaml
plan_unit_id: CV-302
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Free Models route and catalog contracts must preserve wrapper identity separately from underlying provider identity. Records must carry the user-facing `Free Models` grouping plus underlying `provider_entry_id`, `provider_family_id`, `model_provider_id`, account/profile, auth, billing/entitlement, transport, source refs, canonical provider/model ids, stable imported ids, alias/rename/provider-move lineage, catalog_state, and `usable_now`. `catalog_state` cannot imply `usable_now`, quota health, routing readiness, or capability support.
gui_related: false
gui_classification_reason: Defines contract fields consumed by GUI/runtime, but not GUI presentation itself.
depends_on: []
unblocks: []
acceptance_criteria:
  - Contracts preserve wrapper identity and underlying provider/model/account/source identity as separate fields.
  - Alias, rename, and provider-move lineage survives Auto Apply updates and Usage receipt expansion.
  - Saved unavailable slots and unsupported hidden imports remain distinguishable in contract state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models identity preservation schema fixtures
  - Catalog state versus usable_now fixtures
risk_class: route_identity_contract_drift
reasoning_tier: high
context_scope: free_models_identity_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: free_models_identity_route_contract_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0015, atom-0016, atom-0041, atom-0242, atom-0250, atom-0258, atom-0262, atom-0275, atom-0276, atom-0279, atom-0280, atom-0285, atom-0286, atom-0291, atom-0292, atom-0293, atom-0294]
preserved_exact_tokens:
  - "Free Models"
  - "provider_entry_id"
  - "provider_family_id"
  - "model_provider_id"
  - "catalog_state"
  - "usable_now"
  - "alias/rename/provider-move"
negative_constraints:
  - Do not rewrite canonical provider_id/model_id identifiers into `free_models/*`.
  - Do not treat catalog refresh as proof of `usable_now`, quota health, routing readiness, or capability support.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
```
