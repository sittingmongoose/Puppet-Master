# Shard 031: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/Models_System.md`

Source lines: L8095-L8285

Source SHA256: `b090e5c05e26340ac11f6a4cd5bc3f5c52506bfe61005111f6e564c087207ba1`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles the Free Models ledger into Models_System ownership. It preserves the ledger as source lineage only, keeps Provider_OpenCode adjacent/reference-only, and does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### MS-118 - Free Models Wrapper Catalog And Route Readiness Identity

```yaml
plan_unit_id: MS-118
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  PM exposes a single direct-provider grouping named `Free Models` for supported active free/free-limited upstream entries, while preserving the underlying provider, model, account/profile, auth surface, billing/entitlement, transport, quota, and source identity. The wrapper must not rewrite canonical stored provider/model ids into `free_models/*`; it must retain `provider_entry_id`, `provider_family_id`, `model_provider_id`, canonical provider/model ids, stable PM imported ids, hidden subprovider/auth/quota metadata, source refs, and alias/rename/provider-move mappings. Catalog presence or freshness does not prove `usable_now`, quota health, routing readiness, capability support, or policy eligibility.
gui_related: true
gui_classification_reason: Defines the user-visible `Free Models` provider grouping, catalog rows, badges, and model-selector eligibility states.
depends_on: []
unblocks: []
acceptance_criteria:
  - "`Free Models` appears as one PM direct-provider grouping while underlying provider/model/account/source identity remains traceable."
  - Every active supported free/free-limited entry can be listed with badges, but unsupported upstream additions are hidden from normal catalog/detail/search/top-10/setup/routing surfaces.
  - Saved top-10 or section-specific choices that disappear or become ineligible remain saved as `No longer available`, are skipped automatically, and are not silently deleted or replaced.
  - Catalog freshness is represented separately from `usable_now`, quota health, routing readiness, and capability support.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models catalog identity and alias/rename fixture coverage
  - Free Models catalog-vs-usable routing readiness fixtures
risk_class: provider_identity_drift
reasoning_tier: high
context_scope: free_models_catalog_identity
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: free_models_catalog_identity_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_upstream_inspection_20260629.json
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_temp_checkout_inspection_20260629.json
  - https://github.com/vava-nessa/free-coding-models
source_atom_ids: [atom-0007, atom-0008, atom-0009, atom-0013, atom-0015, atom-0016, atom-0027, atom-0068, atom-0069, atom-0072, atom-0073, atom-0075, atom-0079, atom-0092, atom-0096, atom-0123, atom-0127, atom-0130, atom-0134, atom-0138, atom-0139, atom-0142, atom-0143, atom-0185, atom-0189, atom-0194, atom-0198, atom-0275, atom-0276, atom-0279, atom-0280, atom-0291, atom-0292, atom-0293, atom-0294]
preserved_exact_tokens:
  - "Free Models"
  - "every active free/free-limited with badges"
  - "provider_entry_id"
  - "provider_family_id"
  - "model_provider_id"
  - "No longer available"
  - "unsupported"
  - "If they arent supported, they just should show up at all."
  - "usable_now"
negative_constraints:
  - Do not rewrite canonical provider_id/model_id identifiers into `free_models/*`.
  - Do not treat catalog refresh as proof of `usable_now`, quota health, routing readiness, or capability support.
  - Do not show unsupported upstream additions in normal Free Models catalog, detail, search, top-10, routing, or setup surfaces.
  - Do not silently delete saved top-10 or section-specific model choices when upstream removes or invalidates them.
owner_hints:
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
```

### MS-119 - Free Models Auto Apply Source Resolver And Runtime Adapter Boundary

```yaml
plan_unit_id: MS-119
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Free Models Auto Apply tracks the configured upstream source/channel for `vava-nessa/free-coding-models`, imports trusted catalog/settings/runtime-behavior material through PM-owned schemas, and applies validated Free Models changes automatically on checks. PM checks on app launch plus daily background by default, with configurable cadence, but launch checks run after startup in the background and keep last known-good active until validation completes. Runtime behavior changes are automatic only for the Free Models provider and must enter PM through PM-owned declarative router, probe, normalizer, fallback, source-resolver, test, activation, quarantine, and rollback records.
gui_related: true
gui_classification_reason: Includes model-settings cadence controls and user-visible refresh/update status hooks.
depends_on: []
unblocks: []
acceptance_criteria:
  - Auto Apply accepts only configured trusted source/channel material with source refs, hashes, schema ids, import disposition, and activation/quarantine/rollback receipts.
  - App launch checks never block PM startup or active work for routine checks.
  - Manual all-provider model refresh triggers the Free Models Auto Apply check only for Free Models; non-Free-Models providers remain catalog/model-refresh-only.
  - Runtime behavior adaptation is PM-owned and Free-Models-scoped; upstream commands, local proxies, telemetry hooks, credential writers, endpoint installers, self-update logic, and arbitrary config writers are rejected.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models source resolver and hash mismatch quarantine fixtures
  - Free Models runtime adapter schema and rollback fixtures
risk_class: upstream_runtime_adaptation_drift
reasoning_tier: high
context_scope: free_models_auto_apply
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: free_models_auto_apply_source_resolver_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_upstream_inspection_20260629.json
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_temp_checkout_inspection_20260629.json
  - source-lineage snapshot observed tag v0.5.39 and commit 874842d49010591cd28200af9e68c8b365843c67 on 2026-06-29
source_atom_ids: [atom-0010, atom-0011, atom-0012, atom-0017, atom-0018, atom-0019, atom-0020, atom-0025, atom-0026, atom-0028, atom-0033, atom-0034, atom-0051, atom-0052, atom-0053, atom-0055, atom-0056, atom-0057, atom-0058, atom-0059, atom-0060, atom-0061, atom-0063, atom-0064, atom-0066, atom-0067, atom-0070, atom-0071, atom-0076, atom-0080, atom-0131, atom-0135, atom-0193, atom-0195, atom-0196, atom-0197, atom-0199, atom-0200, atom-0201, atom-0203, atom-0204, atom-0205, atom-0207, atom-0208, atom-0277, atom-0278, atom-0287, atom-0288, atom-0289, atom-0290, atom-0295, atom-0296]
preserved_exact_tokens:
  - "Auto Apply"
  - "app launch plus a daily background check by default, then be configurable"
  - "inluding direct and cli(not just free)"
  - "Runtime behavior changes should be automatic too, but only for the free model provider."
  - "As long as it adapts to the PM structure."
  - "there is no staging"
  - "no, just update"
  - "native"
negative_constraints:
  - Do not run Free Models through Docker as the PM feature implementation.
  - Do not inherit the upstream local daemon as PM's execution model without PM-native adaptation.
  - Do not execute arbitrary upstream commands/scripts, local proxies, telemetry hooks, credential writers, endpoint installers, self-update logic, or arbitrary config writers.
  - Do not auto-apply upstream runtime behavior changes for non-Free-Models direct providers or CLI-backed providers.
  - Do not block PM startup or active work for routine launch Auto Apply checks.
owner_hints:
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```

### MS-120 - Free Models Top-10 Precedence And Deterministic Fallback Eligibility

```yaml
plan_unit_id: MS-120
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  The Free Models priority setting is a PM-wide top-10 provider/model list across all providers and models. The default setup stays global and paid-first: paid providers/models are preferred over Free Models unless the user ranks Free Models above them. Section, surface, and role-specific PM model settings override the global top-10 and must disclose requested/effective behavior. Outside-top-10 fallback is deterministic by eligibility, policy, setup, cost, pressure, provider availability, and saved user ordering; it must not use recommendation, quality-rank, coding-strength, online-review, local-learning, or benchmark/probe-calibration language in this version.
gui_related: true
gui_classification_reason: Governs the user-visible top-10 list, section override disclosure, selector behavior, and fallback labels.
depends_on: []
unblocks: []
acceptance_criteria:
  - The top-10 list spans all providers/models, not just Free Models.
  - Paid-first is the default initialization, but explicit user ordering can place Free Models above paid providers/models.
  - Section/surface/role overrides remain authoritative over the global top-10 and show requested/effective state in the GUI.
  - New Ready Free Models entries may become deterministic outside-top-10 fallback candidates immediately, but never insert into or reorder saved top-10 entries without explicit user action.
  - Current scope contains no recommended models, coding-strength scoring, online review lookup, local recommendation learning, or in-PM benchmark/probe calibration.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models top-10 precedence fixtures
  - Section override requested/effective model disclosure fixtures
risk_class: model_precedence_drift
reasoning_tier: high
context_scope: free_models_priority_and_fallback
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: free_models_priority_precedence_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0022, atom-0023, atom-0029, atom-0035, atom-0036, atom-0037, atom-0038, atom-0039, atom-0040, atom-0041, atom-0074, atom-0078, atom-0094, atom-0098, atom-0099, atom-0100, atom-0102, atom-0103, atom-0104, atom-0105, atom-0109, atom-0113, atom-0117, atom-0118, atom-0122, atom-0124, atom-0126, atom-0128, atom-0150, atom-0152, atom-0154, atom-0155, atom-0156, atom-0158, atom-0159, atom-0160, atom-0164, atom-0168, atom-0171, atom-0172, atom-0175, atom-0176, atom-0202, atom-0206, atom-0235, atom-0239, atom-0243, atom-0247, atom-0281, atom-0282]
preserved_exact_tokens:
  - "top 10"
  - "across all the providers/models"
  - "Default to globally"
  - "paid providers should be preferred over the free models unless the user configured the free models above the paid ones in the top 10 list"
  - "those configurable settings override the top 10 and the gui should state that"
  - "No to all, don’t do recommended models."
  - "coding strength"
  - "benchmark"
negative_constraints:
  - Do not silently insert newly imported Ready Free Models entries into the user's saved top-10 list.
  - Do not silently reorder the user's saved top-10 list when Auto Apply imports validated Free Models entries.
  - Do not include recommended models, `Recommended for this section`, recommendation sorting/highlighting, recommendation confidence labels, local recommendation learning, online review lookup, or benchmark/probe calibration in the current Free Models version.
  - Do not hide requested/effective model differences when section settings override the global top-10.
owner_hints:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
```
