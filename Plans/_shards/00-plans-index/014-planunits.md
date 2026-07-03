# Shard 014: PlanUnits

Source: `Plans/00-plans-index.md`

Source lines: L711-L4262

Source SHA256: `0874c6f5dec90701985009c004a2762946ca2df488ff19be8c81d84c9ea3d905`

---

## PlanUnits

### 0PI-001 - Plans Index Retired Source-Preserving Bridge

```yaml
plan_unit_id: 0PI-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 0PI-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 112 because 00-plans-index-S0001
  through S0027 are covered by 0PI-002 through 0PI-054 or explicit structural, retired, and migration-coverage dispositions.
  0PI-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried
  by fine-grained Plans index PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- 0PI-002
- 0PI-003
- 0PI-004
- 0PI-005
- 0PI-006
- 0PI-007
- 0PI-008
- 0PI-009
- 0PI-010
- 0PI-011
- 0PI-012
- 0PI-013
- 0PI-014
- 0PI-015
- 0PI-016
- 0PI-017
- 0PI-018
- 0PI-019
- 0PI-020
- 0PI-021
- 0PI-022
- 0PI-023
- 0PI-024
- 0PI-025
- 0PI-026
- 0PI-027
- 0PI-028
- 0PI-029
- 0PI-030
- 0PI-031
- 0PI-032
- 0PI-033
- 0PI-034
- 0PI-035
- 0PI-036
- 0PI-037
- 0PI-038
- 0PI-039
- 0PI-040
- 0PI-041
- 0PI-042
- 0PI-043
- 0PI-044
- 0PI-045
- 0PI-046
- 0PI-047
- 0PI-048
- 0PI-049
- 0PI-050
- 0PI-051
- 0PI-052
- 0PI-053
- 0PI-054
unblocks: []
acceptance_criteria:
- 0PI-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 112.
- 00-plans-index-S0001 through S0027 coverage is owned by 0PI-002 through 0PI-054 or explicit structural, retired, and migration-coverage
  dispositions.
- 0PI-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0026
preserved_exact_tokens:
- 0PI-001
- Plans Index (authoritative map) Source-Preserving PlanUnit
- Plans Index Residual Source-Preserving Bridge
- source_preserving_planunit
- source_preserving_bridge_retired
- PlanUnits
- Migration Coverage
negative_constraints:
- 0PI-001 must not re-own 00-plans-index-S0001 through S0027 after Phase 2B batch 112.
- 0PI-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- 0PI-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former 0PI-001 residual source-preserving bridge is retired by Phase 2B batch 112.
owner_boundary_notes:
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Progression_Gates.md'
```

### 0PI-002 - Index Authority And Compliance

```yaml
plan_unit_id: 0PI-002
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Plans index is the authoritative map and preserves the plans-index-authoritative-map alias, compliance with Plans/DRY_Rules.md and Plans/Contracts_V0.md, Puppet Master naming, no open questions, and deterministic defaults.
gui_related: false
gui_classification_reason: The unit records document authority and compliance metadata, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: index_authority_and_compliance
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: index_authority_and_compliance
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0001'
preserved_exact_tokens:
- 'Plans Index (authoritative map)'
- 'plans-index-authoritative-map'
- 'Plans/DRY_Rules.md'
- 'Plans/Contracts_V0.md'
- 'Puppet Master'
- 'Plans/Decision_Policy.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-003 - Change Summary And Index Role

```yaml
plan_unit_id: 0PI-003
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The change summary preserves dated registration entries including assistant-memory-subsystem, GitHub_Integration, PM Bootstrap Planning Ledger, Plan Document System, Plan-to-node compilation boundary, bootstrap migration owner docs, and ledger pldg-20260610-001-ledger-plan-system; the index is navigation and canonicalization aid only and does not override detail in any plan.
gui_related: false
gui_classification_reason: The unit records index metadata, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: change_summary_and_index_role
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: change_summary_and_index_role
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0002'
preserved_exact_tokens:
- '2026-02-26'
- 'Plans/assistant-memory-subsystem.md'
- '2026-02-25'
- 'Plans/GitHub_Integration.md'
- '2026-06-11'
- 'pldg-20260610-001-ledger-plan-system'
- 'navigation + canonicalization aid'
negative_constraints:
- 'It does not remove or override detail in any plan.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, PolicyRule:Decision_Policy.md§2'
```

### 0PI-004 - Anti Drift Reading Order

```yaml
plan_unit_id: 0PI-004
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The anti-drift layer preserves the required owner-doc reading order, primary consumer docs, and reconciliation rules that owner docs precede consumer docs, consumer docs must not preserve stale tier-era or request-era canon as peer alternatives, and summary/checklist mirrors reconcile after owners and primary consumers.
gui_related: false
gui_classification_reason: The unit records reading-order governance, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: anti_drift_reading_order
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: anti_drift_reading_order
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0003'
preserved_exact_tokens:
- 'rewrite-tie-in-memo.md'
- 'Decision_Log.md'
- 'DRY_Rules.md'
- 'Crosswalk.md'
- 'Contracts_V0.md'
- 'storage-plan.md'
- 'Prompt_Pipeline.md'
- 'Executor_Protocol.md'
- 'Decision_Policy.md'
- 'Progression_Gates.md'
negative_constraints:
- 'consumer docs must not preserve stale tier-era or request-era canon as peer alternatives'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Owner docs are reconciled before consumer docs.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md'
```

### 0PI-005 - Owner Map Guard And Initial Seams

```yaml
plan_unit_id: 0PI-005
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The owner-map guard records routing relationships only and does not re-own contract, storage, UI, chat, run-graph, HITL, executor, or usage behavior; initial seams route primary owners and adjacent consumers for contracts, crosswalk, storage, UI, Final GUI, file surfaces, usage, run graph, HITL, and mixed-era layering.
gui_related: true
gui_classification_reason: The unit maps GUI/UI owner seams and runtime consumers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_map_guard_and_initial_seams
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: owner_map_guard_and_initial_seams
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0004'
preserved_exact_tokens:
- 'does not re-own'
- 'Contracts/Crosswalk to UI/run seam'
- 'Contracts/Final GUI seam'
- 'Storage/command/UI/contract seam'
- 'mixed-era'
negative_constraints:
- 'Mixed-era layering must not preserve older framing as peer canon.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Primary owner entries carry owning canon; adjacent docs consume or align.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-006 - Owner Map Routing And Stale Consumer Seams

```yaml
plan_unit_id: 0PI-006
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The owner-map routing section preserves priority/routing docs, source-order equivalence, stale-consumer, owner-gap, shell-adoption strata, /inconsistent, /precedence, and repeated-owner-set notes so reconciliation follows the same owner sets regardless of source ordering.
gui_related: true
gui_classification_reason: The unit includes GUI/run/UI routing and stale-consumer owner-map facts.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_map_routing_and_stale_consumer_seams
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: owner_map_routing_and_stale_consumer_seams
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0004'
preserved_exact_tokens:
- 'Priority 3'
- 'source orderings'
- 'stale-consumer'
- 'owner-gap'
- '/inconsistent'
- '/precedence'
- 'repeated source orderings'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Stale consumer and owner-gap labels are routing facts, not new product owners.'
owner_boundary_notes:
- 'Plans/00-plans-index.md records routing; named docs retain canon.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-007 - Owner Map Runtime File Storage Seams

```yaml
plan_unit_id: 0PI-007
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The owner-map runtime/file/storage seams preserve terminology and routing for safe-point, restore-point, rollback, contamination, source-lineage exclusions, runtime/storage/policy/UI terminology, GATE-010 limitation, and owner/consumer boundaries for runtime, file, storage, policy, executor, and contracts.
gui_related: true
gui_classification_reason: The unit includes runtime and UI owner-map seams affecting visible recovery and command surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_map_runtime_file_storage_seams
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: owner_map_runtime_file_storage_seams
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0004'
preserved_exact_tokens:
- 'safe-point'
- 'restore-point'
- 'rollback'
- 'contamination'
- 'source-lineage only'
- 'GATE-010'
- 'command-normalization'
negative_constraints:
- 'GATE-010 cannot express the routing and command-normalization checks now needed.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Index routing points to owner docs; it does not replace them.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-008 - Owner Map GUI Widget Usage Final Pass Seams

```yaml
plan_unit_id: 0PI-008
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The owner-map GUI/widget/usage/final-pass seams preserve GUI widget and usage routing, usage_event_ref shape, page_tab, cost_usage, runtime-recovery duplicate-canon cleanup, blocked_sequence ownership, and /HITL/chat/storage compatibility-only bucket handling.
gui_related: true
gui_classification_reason: The unit directly covers GUI/widget/usage routing and user-visible command destinations.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_map_gui_widget_usage_final_pass_seams
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: owner_map_gui_widget_usage_final_pass_seams
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0004'
preserved_exact_tokens:
- 'usage_event_ref'
- 'page_tab'
- 'cost_usage'
- 'runtime-recovery'
- 'blocked_sequence'
- '/HITL/chat/storage'
- 'coordination-canon'
negative_constraints:
- 'usage-feature.md consumers must not rely on timestamp heuristics or a shape that lacks authoritative storage/runtime linkage.'
- 'UI/HITL/chat/storage docs must not re-own the blocked episode.'
compatibility_only_notes:
- 'Legacy /HITL/chat/storage bucket shorthand is a compatibility label, not an owner.'
stale_retired_dispositions: []
owner_boundary_notes:
- 'Executor_Protocol and Contracts_V0 own blocked_sequence runtime scheduler/executor semantics.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-009 - Rewrite Agent Loop Architecture Baseline

```yaml
plan_unit_id: 0PI-009
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The rewrite tie-in records adaptation of OpenCode-style architecture into a deterministic agent-loop core with unified event model, seglog to redb and Tantivy projections, central tool registry and policy engine, and patch/apply/verify/rollback pipeline.
gui_related: false
gui_classification_reason: This split unit records backend architecture and storage/tooling behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_agent_loop_architecture_baseline
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: rewrite_agent_loop_architecture_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0005'
preserved_exact_tokens:
- 'OpenCode-style architecture'
- 'deterministic agent-loop core'
- 'event model'
- 'seglog'
- 'redb'
- 'Tantivy'
- 'tool registry + policy engine'
- 'patch/apply/verify/rollback'
negative_constraints: []
compatibility_only_notes:
- 'OpenCode-style architecture is adaptation baseline, not ownership transfer.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-010 - Rewrite UI Auth Account Carry Through

```yaml
plan_unit_id: 0PI-010
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The rewrite tie-in preserves Rust + Slint UI rewrite, subscription-first auth, Gemini Direct as active direct API,
  Antigravity CLI as the active Google-owned CLI-runtime route, retired Gemini CLI split vocabulary as source-lineage
  only, key-exception lineage, and requested/effective auth, account identity, account/plan UI, quota, and usage labels
  carrying across storage, runtime, setup/health, media capabilities, and usage.
gui_related: true
gui_classification_reason: The unit covers Rust + Slint UI rewrite, account/plan UI, and visible auth/quota/usage labels.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_ui_auth_account_carry_through
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: rewrite_ui_auth_account_carry_through
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0005'
preserved_exact_tokens:
- 'Rust + Slint'
- 'subscription-first'
- 'Gemini Direct'
- 'gemini'
- 'Gemini CLI'
- 'gemini_cli'
- 'key-exception'
- 'requested/effective auth'
- 'account/plan UI'
negative_constraints:
- 'Do not treat Gemini CLI as an active provider entry.'
compatibility_only_notes:
- 'Gemini Direct and Gemini CLI split is retained only as source-lineage; current active split is Gemini Direct plus Antigravity CLI.'
stale_retired_dispositions:
- 'Gemini is modeled as two provider entries, not one stale-canon mixed-account provider.'
- 'Active Gemini CLI provider-entry support is retired by provider-update ledger pldg-20260624-001-provider-updates.'
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
```

### 0PI-011 - Provider Account Owner Split

```yaml
plan_unit_id: 0PI-011
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Provider/account reconciliation keeps Multi-Account and provider docs as requested/effective account, auth, quota, and provider-health owners; Section 15 owns the promoted shell; FinalGUISpec consumes shell placement and recovery UI; orchestrator, run modes, executor, and storage own runtime records; stale pre-promotion, /title-bar/recovery, and similar shell wording are lineage or mirror cleanup input.
gui_related: true
gui_classification_reason: The unit covers visible promoted shell, settings, title-bar, attention, recovery, and account UI consumers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_account_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: provider_account_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0006'
preserved_exact_tokens:
- 'Multi-Account.md'
- 'Section15_MVP_Promoted_Features_Spec.md'
- 'FinalGUISpec.md'
- 'pre-promotion'
- '/title-bar/recovery'
- 'lineage or mirror cleanup input'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Stale pre-promotion page, /title-bar/recovery, and feature-list/newfeatures shell wording are not live owner alternatives.'
owner_boundary_notes:
- 'Provider/account/promoted-shell routing stays split by owner surface.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md'
```

### 0PI-012 - PM Planning And Node Readiness Owner Split

```yaml
plan_unit_id: 0PI-012
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The PM Bootstrap Planning map preserves owner split for Planning_Ledger_System, Plan_Document_System, Plan_To_Node_Compilation, and Bootstrap_Planning_Migration; it preserves literal gui_related: true|false and states that ordinary ledger writing, plan drafting, conversion, indexing, and node-readiness reporting do not update governance artifacts or create WorkNodes, executable build tasks, or NodeSeed candidates.
gui_related: false
gui_classification_reason: This unit is plan/governance metadata rather than GUI behavior, while preserving the literal gui_related token.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pm_planning_and_node_readiness_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: pm_planning_and_node_readiness_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0008'
preserved_exact_tokens:
- 'Planning_Ledger_System.md'
- 'Plan_Document_System.md'
- 'Plan_To_Node_Compilation.md'
- 'Bootstrap_Planning_Migration.md'
- 'gui_related: true|false'
- 'Spec_Lock.json'
- 'WorkNodes'
- 'NodeSeed'
negative_constraints:
- 'It does not create WorkNodes, executable build tasks, or NodeSeed candidates until the compiler contract is complete and the PNC-019 executable lifecycle certification harness has passed with recorded evidence.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
```

### 0PI-013 - Instant Grep Live Canon Map

```yaml
plan_unit_id: 0PI-013
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Instant Grep note makes 00-plans-index.md the live canon-map and /index discoverability map for promoted Instant Grep canon, preserving owner boundaries for implementation-safe detail and clarification-gate routing to owner maps.
gui_related: true
gui_classification_reason: The unit covers user-visible /index discoverability and clarification flows.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instant_grep_live_canon_map
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: instant_grep_live_canon_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0009'
preserved_exact_tokens:
- '/00-plans-index.md'
- '/index'
- 'Instant Grep'
- 'ArcSwap'
- 'dirty-layer'
- 'clarification gate'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Storage, runtime contracts, FinalGUISpec, and Usage analytics retain their owner boundaries.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-014 - Instant Grep Owner Split

```yaml
plan_unit_id: 0PI-014
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Instant Grep packet owner split preserves Tools ownership for grep semantics, storage ownership for regex-index layout and dirty-layer lifecycle, FinalGUISpec ownership for indexing settings/status/Search UX, GitHub ownership for remote cache behavior, and named reconciliation consumers.
gui_related: true
gui_classification_reason: The unit includes FinalGUISpec settings, status-bar, Search ownership, and remote-cache administration surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instant_grep_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: instant_grep_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0009'
preserved_exact_tokens:
- 'Tools.md'
- 'storage-plan.md'
- 'FinalGUISpec.md'
- 'GitHub_Integration.md'
- 'sparse-n-gram'
- 'tool.invoked.index_used'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md'
```

### 0PI-015 - Browser Owner Split

```yaml
plan_unit_id: 0PI-015
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Browser owner split preserves Section 15 as browser behavior SSOT, rewrite-tie-in as browser-runtime baseline owner, FinalGUISpec/FileManager/UI_Command_Catalog as primary browser consumers, related reconciliation consumers, and signal_confidence values authoritative, structured, heuristic, and local_only.
gui_related: true
gui_classification_reason: The unit covers browser UI placement, preview/click-to-context, user-visible commands, DevTools, and evidence surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: browser_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0010'
preserved_exact_tokens:
- 'Section15_MVP_Promoted_Features_Spec.md'
- 'rewrite-tie-in-memo.md'
- 'FinalGUISpec.md'
- 'FileManager.md'
- 'UI_Command_Catalog.md'
- 'signal_confidence'
- 'authoritative'
- 'structured'
- 'heuristic'
- 'local_only'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/UI_Command_Catalog.md'
```

### 0PI-016 - Browser Stale Cleanup And Consumer Map

```yaml
plan_unit_id: 0PI-016
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Browser cleanup preserves newfeatures.md as historical/origin material only, retires stale cues such as /stale-canon, /WebView2/WebKitGTK, older trust-tier browser permission matrices, bottom-panel/browser panel wording, and maps Section 15, Final GUI, File Manager, UI Command Catalog, Wiring Matrix, and newtools consumer responsibilities.
gui_related: true
gui_classification_reason: The unit covers visible browser/session behavior, command routing, placement, and stale GUI terminology cleanup.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_stale_cleanup_and_consumer_map
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: browser_stale_cleanup_and_consumer_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0010'
preserved_exact_tokens:
- 'newfeatures.md'
- 'historical/origin material only'
- '/stale-canon'
- '/WebView2/WebKitGTK'
- 'trust-tier'
- 'bottom-panel'
- 'browser panel/window'
- 'preview_mode = browser_panel'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Browser stale-reference cues are retired origin/stale-canon cues, not live browser owners or implementation alternatives.'
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/newfeatures.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md'
```

### 0PI-017 - Slash Chat SSOT Boundary

```yaml
plan_unit_id: 0PI-017
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Slash-Command and Chat-Tools map preserves that 00-plans-index.md is index and ownership map only, not SSOT for slash-command schemas, tool permissions, GUI /presentation, or persisted event payloads; it locks phase A through D reconciliation order across chat, commands, tools, permissions, GUI behavior, and storage registration.
gui_related: true
gui_classification_reason: The unit covers chat tools, slash commands, GUI /presentation, and persisted payload routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: slash_chat_ssot_boundary
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: slash_chat_ssot_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0011'
preserved_exact_tokens:
- 'Slash-Command and Chat-Tools SSOT Map'
- 'not the SSOT'
- 'GUI `/presentation`'
- 'phase A'
- 'phase B'
- 'phase C'
- 'phase D'
negative_constraints:
- 'Avoid schema duplication here.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Runtime/event envelope stays in Contracts_V0 and concrete payload registration in storage-plan.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-018 - Slash Chat Scope And Drift Risks

```yaml
plan_unit_id: 0PI-018
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Slash/chat scope preserves ready-now /web command family, normalized operation set, distinct activity labels and tool keys, permission-key expansion, citation/provenance precedence, bounded operation defaults, additive web child payload recommendations, blocked provider-runtime scope, and highest drift-risk pairs.
gui_related: true
gui_classification_reason: The unit covers chat command UX, activity labels, permission behavior, and provider settings UX boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: slash_chat_scope_and_drift_risks
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: slash_chat_scope_and_drift_risks
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0011'
preserved_exact_tokens:
- '/web'
- 'permission-key expansion'
- 'citation/provenance precedence'
- 'bounded operation defaults'
- 'provider taxonomy'
- 'account-selection'
- 'provider settings rows/layout'
- 'global versus per-operation provider ordering UX'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Named owner docs resolve drift-risk pairs.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
```

### 0PI-019 - Artifact HITL Tool Owner Split

```yaml
plan_unit_id: 0PI-019
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Artifact, HITL, and tool approval canon preserves owner split across Runtime_Artifacts_Panel, storage-plan, Contracts_V0, Tools, human-in-the-loop, and Permissions_System for artifact presentation, durable projections, event envelope, tool policy, HITL approval UX, and permission snapshot semantics.
gui_related: true
gui_classification_reason: The unit includes runtime artifact presentation and approval UX surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: artifact_hitl_tool_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: artifact_hitl_tool_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0012'
preserved_exact_tokens:
- 'Runtime_Artifacts_Panel.md'
- 'storage-plan.md'
- 'Contracts_V0.md'
- 'Tools.md'
- 'human-in-the-loop.md'
- 'Permissions_System.md'
- 'approval UX'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Artifact, HITL, and tool approval canon uses owner split rather than a three-way SSOT.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Permissions_System.md'
```

### 0PI-020 - Approval Compatibility Boundary

```yaml
plan_unit_id: 0PI-020
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The approval compatibility boundary preserves request_id to blocked_sequence as lineage routing, canonical blocked episode resolution before runtime mutation, approval_scope_key, ordered allowed_action_ids[], and the negative constraint that allowed_actions is not revived as a peer field family or generic approval widener.
gui_related: false
gui_classification_reason: The unit records compatibility and runtime mutation boundary semantics rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: approval_compatibility_boundary
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: approval_compatibility_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0012'
preserved_exact_tokens:
- 'request_id <-> blocked_sequence'
- 'approval_scope_key'
- 'allowed_action_ids[]'
- 'allowed_actions'
negative_constraints:
- 'Do not revive allowed_actions as a peer field family.'
- 'Do not let a generic session approval widen beyond its explicit scope key.'
compatibility_only_notes:
- 'Surviving request_id values resolve to canonical blocked episode before runtime mutation.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-021 - Terminal Ownership Map

```yaml
plan_unit_id: 0PI-021
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The terminal ownership map preserves Section 15, FinalGUISpec, and storage-plan as terminal owners; assistant-chat-design and FileManager as primary consumers; UI_Command_Catalog, Contracts_V0, and Wiring_Matrix for commands/contracts/wiring; adjacent policy/runtime/terminology companions; anti-drift review order; non-buildable omission rule; and ContractRefs.
gui_related: true
gui_classification_reason: The unit covers terminal placement, settings UI, session identity, command cards, file workflows, and terminal/browser tabs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_ownership_map
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: terminal_ownership_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0013'
preserved_exact_tokens:
- 'Terminal Ownership Map'
- 'Section15_MVP_Promoted_Features_Spec.md'
- 'FinalGUISpec.md'
- 'storage-plan.md'
- 'assistant-chat-design.md'
- 'FileManager.md'
- 'UI_Command_Catalog.md'
- 'Wiring_Matrix.md'
- 'non-buildable'
negative_constraints:
- 'Terminal packets that omit UI_Command_Catalog.md, Contracts_V0.md, or Wiring_Matrix.md are non-buildable.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
```

### 0PI-022 - File Manager Editor Owner Posture

```yaml
plan_unit_id: 0PI-022
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The file manager/editor map preserves bounded reconciliation posture and owner boundaries for Crosswalk, GitHub_Integration SSH remote behavior, LSPSupport, FileManager file/editor behavior, Section15 plus storage terminal/runtime identity, and FinalGUISpec shell realization and banners.
gui_related: true
gui_classification_reason: The unit covers file manager/editor shell, inspectors, banners, remote mode, LSP, and terminal/runtime UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_editor_owner_posture
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: file_manager_editor_owner_posture
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0014'
preserved_exact_tokens:
- 'Crosswalk.md'
- 'GitHub_Integration.md §C'
- 'LSPSupport.md'
- 'FileManager.md'
- 'Section15_MVP_Promoted_Features_Spec.md'
- 'storage-plan.md'
- 'FinalGUISpec.md'
- 'one-bounded-auto-retry'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-023 - File Manager Editor Packetization Gates

```yaml
plan_unit_id: 0PI-023
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The file manager/editor packetization gates preserve stale cleanup order, Wiring_Matrix requirement for introduced command rows, MUST CHANGE/MUST RECONCILE/MUST VERIFY register, browser residue cleanup, remote/session storage promotion guard, and Contracts_V0 promotion when event-level host or freshness fields are canonized.
gui_related: true
gui_classification_reason: The unit covers GUI/file command wiring, stale browser cleanup, and remote/session visibility gates.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_editor_packetization_gates
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: file_manager_editor_packetization_gates
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0014'
preserved_exact_tokens:
- 'Wiring_Matrix.md'
- 'MUST CHANGE'
- 'MUST RECONCILE'
- 'MUST VERIFY'
- 'browser residue cleanup'
- 'host_id'
- 'root_identity'
- '/event-level'
- '/health/write-availability'
negative_constraints:
- 'Command routing is non-coherent without Wiring_Matrix when relevant commands are introduced.'
compatibility_only_notes: []
stale_retired_dispositions:
- 'Browser residue cleanup cues are retired markers, not peer canon.'
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-024 - GUI Worktree And Source Control Handoff

```yaml
plan_unit_id: 0PI-024
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  GUI worktree visibility is part of the seam: FinalGUISpec owns visible cross-surface behavior, FileManager may show compact repo/worktree context without owning commit history or worktree management, WorktreeGitImprovement owns worktree lifecycle/recovery, assistant-chat-design owns preview cards, and File Manager preserves repo_id and worktree_id when handing off to Source Control.
gui_related: true
gui_classification_reason: The unit covers visible worktree context, File Manager headers, Source Control handoff, editor status, and breadcrumbs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_worktree_and_source_control_handoff
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: gui_worktree_and_source_control_handoff
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0014'
preserved_exact_tokens:
- 'GUI worktree visibility'
- 'repo_id'
- 'worktree_id'
- 'Source Control'
- '/workspace'
- '/strip'
- '/tab'
- '/conflicted'
negative_constraints:
- 'Do not repeat a worktree symbol on every file row or tab by default.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'WorktreeGitImprovement owns worktree lifecycle and recovery.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/WorktreeGitImprovement.md'
```

### 0PI-025 - Debug Ownership And Packet Coupling

```yaml
plan_unit_id: 0PI-025
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Debug canon note preserves assistant-chat-design as Assistant Debug owner, Run_Modes/Permissions/storage as runtime posture owners, Section 15 as browser-target debug owner, Runtime_Artifacts/Contracts/Prompt/Tools as artifact/event/prompt/tool owners, primary consumers, reconciliation companions, and mandatory Commands/Glossary/Wiring plus Contracts/Prompt/GitHub packet coupling.
gui_related: true
gui_classification_reason: The unit covers Debug Mode UI, investigation context, thread lifecycle, visible browser evidence, automation, shell placement, command routing, and debug tooling discovery.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_ownership_and_packet_coupling
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: debug_ownership_and_packet_coupling
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0015'
preserved_exact_tokens:
- 'Debug Mode'
- 'Investigation Context'
- 'automation_session'
- 'attention_required'
- 'Commands_System.md'
- 'Glossary.md'
- 'Wiring_Matrix.md'
- 'Contracts_V0.md'
- 'Prompt_Pipeline.md'
- 'GitHub_Integration.md'
negative_constraints:
- 'Packets omitting required coupled docs leave drift.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
```

### 0PI-026 - Plan Map Table Core UX Owners

```yaml
plan_unit_id: 0PI-026
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Plan map table core UX owner rows preserve rewrite, promoted Section 15, agent rules, orchestrator subagents, interview subagents, assistant chat, assistant memory, FinalGUISpec, GitHub, FileManager, LSPSupport, and storage-plan scopes and canonical intent.
gui_related: true
gui_classification_reason: The table rows include GUI shell, chat UX, file manager, LSP editor behavior, Git panel, and storage-backed user-visible state.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_map_table_core_ux_owners
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: plan_map_table_core_ux_owners
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0015'
preserved_exact_tokens:
- 'rewrite-tie-in-memo.md'
- 'Section15_MVP_Promoted_Features_Spec.md'
- 'agent-rules-context.md'
- 'orchestrator-subagent-integration.md'
- 'assistant-chat-design.md'
- 'FinalGUISpec.md'
- 'GitHub_Integration.md'
- 'FileManager.md'
- 'LSPSupport.md'
- 'storage-plan.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-027 - Plan Map Table Planning Runtime Artifacts

```yaml
plan_unit_id: 0PI-027
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Plan map table planning/runtime/artifact rows preserve chain wizard, document packaging, planning ledger, Plan Document System, Plan-to-node compilation, Bootstrap migration, HITL, FileSafe, Prompt Pipeline, WorktreeGitImprovement, MiscPlan, newtools, Tools, OpenCode Deep Extraction, Decision Log, usage, runtime artifacts, project output, and newfeatures scopes.
gui_related: true
gui_classification_reason: The table rows include usage dashboards, runtime artifacts panel, project output artifacts, testing tools, and HITL user-visible behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_map_table_planning_runtime_artifacts
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: plan_map_table_planning_runtime_artifacts
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0015'
preserved_exact_tokens:
- 'chain-wizard-flexibility.md'
- 'Document_Packaging_Policy.md'
- 'Planning_Ledger_System.md'
- 'Plan_Document_System.md'
- 'Plan_To_Node_Compilation.md'
- 'Bootstrap_Planning_Migration.md'
- 'human-in-the-loop.md'
- 'FileSafe.md'
- 'Prompt_Pipeline.md'
- 'WorktreeGitImprovement.md'
- 'newtools.md'
- 'Tools.md'
- 'OpenCode_Deep_Extraction.md'
- 'usage-feature.md'
- 'Runtime_Artifacts_Panel.md'
- 'Project_Output_Artifacts.md'
- 'newfeatures.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-028 - Plan Map Table Widgets Config Media Wiring

```yaml
plan_unit_id: 0PI-028
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Plan map table widgets/config/media/wiring rows preserve Widget_System, Run_Graph_View, Orchestrator_Page, GUI checklist, Executor_Protocol, UI_Wiring_Rules, provider reference docs, BinaryLocator, Run_Modes, Personas, Permissions, Commands, Skills, Plugins, Formatters, Models, Media Generation, OpenCode Coverage Matrix, and Wiring Matrix scopes.
gui_related: true
gui_classification_reason: The table rows cover widgets, graph view, orchestrator tabs, GUI checklist, UI wiring, permissions/settings, commands, skills/plugins/formatters/models/media GUI, and wiring matrix.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_map_table_widgets_config_media_wiring
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: plan_map_table_widgets_config_media_wiring
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0015'
preserved_exact_tokens:
- 'Widget_System.md'
- 'Run_Graph_View.md'
- 'Orchestrator_Page.md'
- 'GUI_Rebuild_Requirements_Checklist.md'
- 'Executor_Protocol.md'
- 'UI_Wiring_Rules.md'
- 'Provider_OpenCode.md'
- 'BinaryLocator_Spec.md'
- 'Run_Modes.md'
- 'Personas.md'
- 'Permissions_System.md'
- 'Commands_System.md'
- 'Skills_System.md'
- 'Plugins_System.md'
- 'Formatters_System.md'
- 'Models_System.md'
- 'Media_Generation_and_Capabilities.md'
- 'OpenCode_Coverage_Matrix.md'
- 'Wiring_Matrix.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-029 - Instant Grep Sparse N Gram Owner Split

```yaml
plan_unit_id: 0PI-029
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Instant Grep sparse n-gram owner split preserves Tools ownership for grep semantics and analytics, storage ownership for regex index layout and file watchers, FinalGUISpec ownership for status bar/settings/Search panel UX, GitHub ownership for remote project search index cache, and reconciliation consumers including assistant chat, UI command catalog, Glossary, Architecture Invariants, BinaryLocator, usage, Wiring Matrix, and this index.
gui_related: true
gui_classification_reason: The unit covers indexing status bar, settings, Search panel UX, and remote-cache settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instant_grep_sparse_n_gram_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: instant_grep_sparse_n_gram_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0016'
preserved_exact_tokens:
- 'Instant Grep'
- 'sparse n-gram index'
- 'Tools.md'
- 'storage-plan.md'
- 'FinalGUISpec.md'
- 'GitHub_Integration.md'
- 'status bar Indexing indicator'
- 'Search panel index-acceleration UX'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md'
```


### 0PI-030 - Cross-Cutting Backend Duplication Hotspots

```yaml
plan_unit_id: 0PI-030
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Known cross-cutting duplication hotspots section preserves backend and runtime duplication risks for child-run
  canon versus provider-native subagent language, Persona selection versus subagent registry language, crew shared-state versus
  legacy memory-manager language, dynamic context shrinking versus compaction and Subcompact language, requested/effective
  runtime surface and effort language, and blocked/awaiting-parent versus older denial or recovery aliases.
gui_related: false
gui_classification_reason: The unit records backend/runtime owner-routing duplication risks rather than user-visible presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_cutting_backend_duplication_hotspots
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: cross_cutting_backend_duplication_hotspots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0017
preserved_exact_tokens:
- Known cross-cutting duplication hotspots
- child-run canon
- provider-native subagent language
- Persona selection
- subagent registry language
- crew shared-state
- legacy memory-manager language
- dynamic context shrinking
- Subcompact
- requested/effective runtime surface and effort language
- blocked/awaiting-parent
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Named owner docs carry the underlying canon; this index records the duplication hotspot map.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md'
```

### 0PI-031 - Context Lens UI Hotspot

```yaml
plan_unit_id: 0PI-031
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Known cross-cutting duplication hotspots section preserves Context Lens UI wording versus command and
  wiring ownership as a GUI-related owner-routing risk that must be reconciled through command and wiring owners rather than
  duplicated index prose.
gui_related: true
gui_classification_reason: The unit explicitly covers Context Lens UI wording and command/wiring ownership for a user-visible
  surface.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: context_lens_ui_hotspot
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: context_lens_ui_hotspot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0017
preserved_exact_tokens:
- Context Lens UI wording
- command and wiring ownership
- Known cross-cutting duplication hotspots
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Command and wiring owner docs must carry implementation canon for this UI hotspot.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md'
```

### 0PI-032 - Rewrite-Era Owner Guidance

```yaml
plan_unit_id: 0PI-032
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: Rewrite-era guidance preserves that owner docs define the canon, consumer docs should reference owner docs
  rather than re-describing the full model, and packetization and reconciliation should prefer rewrite-outright where stale
  canon would remain misleading if left in place.
gui_related: false
gui_classification_reason: The unit records governance and owner-doc routing guidance, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_era_owner_guidance
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: rewrite_era_owner_guidance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0017
preserved_exact_tokens:
- Rewrite-era guidance
- owner docs define the canon
- consumer docs should reference owner docs
- rewrite-outright
- stale canon
negative_constraints:
- Consumer docs must not re-describe a competing full model when owner docs carry the canon.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale canon should be rewritten outright when leaving it in place would remain misleading.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Progression_Gates.md'
```

### 0PI-033 - Shard Governance Boundaries

```yaml
plan_unit_id: 0PI-033
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The shard index governance text preserves regeneration and check commands, declares Plans/_shards/** and Plans/.evidence/**
  regen-only after canonical doc edits, forbids hand-editing them during packetization or transfer work, keeps post-edit validation
  required, validates Plans/Spec_Lock.json through verify-spec-lock, manages Plans/auto_decisions.jsonl as a deterministic
  log, and treats stale packet-decision references as source-lineage only.
gui_related: false
gui_classification_reason: The unit covers generated governance artifact handling rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shard_governance_boundaries
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: shard_governance_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0018
preserved_exact_tokens:
- Shard indexes
- python3 scripts/pm-shard-plans.py --generate
- python3 scripts/pm-shard-plans.py --check
- Plans/_shards/**
- Plans/.evidence/**
- do not hand-edit
- Plans/Spec_Lock.json
- python3 scripts/pm-plans-verify.py verify-spec-lock
- Plans/auto_decisions.jsonl
- packet-decision
- source-lineage only
negative_constraints:
- Plans/_shards/** and Plans/.evidence/** must not be hand-edited during packetization or transfer work.
compatibility_only_notes:
- Stale packet-decision references are source-lineage only, not live packet doc intents.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-034 - Shard Index Routing Table

```yaml
plan_unit_id: 0PI-034
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The shard index table preserves every Source doc to Plans/_shards/<doc-slug>/00-index.md mapping in the index, including
  orchestrator subagents, FinalGUISpec, bootstrap, prompt, wiring, GUI checklist, widget, and 00-plans-index.md shard entries.
gui_related: false
gui_classification_reason: The unit records document-to-shard routing metadata, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shard_index_routing_table
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: shard_index_routing_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0018
preserved_exact_tokens:
- Source doc
- Shard index
- orchestrator-subagent-integration.md
- FinalGUISpec.md
- Planning_Ledger_System.md
- Plan_Document_System.md
- Plan_To_Node_Compilation.md
- Bootstrap_Planning_Migration.md
- Prompt_Pipeline.md
- Wiring_Matrix.md
- GUI_Rebuild_Requirements_Checklist.md
- Widget_System.md
- 00-plans-index.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The table is an index routing aid and does not replace the listed source docs.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-035 - Containers Registry Unraid Owner Scope

```yaml
plan_unit_id: 0PI-035
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The 2026-03-07 containers, registry, and Unraid addendum registers Plans/Containers_Registry_and_Unraid.md
  as the canonical SSOT for first-class DockerHub image publishing, container runtime management, managed Unraid template
  repositories, ca_profile.xml behavior, protected repo creation, managed template-repo defaults, ca_profile.xml scope/editability,
  and maintainer-asset handling.
gui_related: false
gui_classification_reason: The unit records container/registry owner scope and operational canon rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: containers_registry_unraid_owner_scope
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: containers_registry_unraid_owner_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0019
preserved_exact_tokens:
- 2026-03-07 addendum — containers, registry, and Unraid
- Plans/Containers_Registry_and_Unraid.md
- canonical SSOT
- first-class DockerHub image publishing
- managed Unraid template repositories
- ca_profile.xml
- protected repo creation
- managed template-repo defaults
- maintainer-asset handling
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Containers_Registry_and_Unraid.md owns the canonical container, registry, and Unraid behavior.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-036 - Docker Manager Auth UX Routing

```yaml
plan_unit_id: 0PI-036
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The containers, registry, and Unraid addendum preserves contextual Docker management UI and Docker Manager
  UI routing, including DockerHub browser/PAT auth UX, requested vs effective auth capability, Publish / Unraid, project-focused
  Kubernetes placement, and contextual Docker Manager UI scope.
gui_related: true
gui_classification_reason: The unit covers Docker Manager UI, auth UX, and user-facing placement surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_manager_auth_ux_routing
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: docker_manager_auth_ux_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0019
preserved_exact_tokens:
- contextual Docker management UI
- Docker Manager UI
- DockerHub browser/PAT auth UX
- requested vs effective auth capability
- Publish / Unraid
- project-focused Kubernetes placement
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Containers_Registry_and_Unraid.md owns Docker Manager operational subviews and related UI canon.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-037 - Runtime Packet Owner Routing

```yaml
plan_unit_id: 0PI-037
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Runtime Packet Index Coverage Consolidation Addendum preserves owner routing for scheduler semantics and
  queue analysis, event/contracts and storage for attempts, safe points, and remediation lineage, provider/auth/permission
  mappings into runtime taxonomy, glossary ownership for runtime terms, canonical events/enums/identities/action fields, scheduler
  semantics, attempt lifecycle, graph-lock behavior, persistence, and restart rules.
gui_related: false
gui_classification_reason: The unit records runtime contract and owner routing rather than rendering or UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_packet_owner_routing
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: runtime_packet_owner_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0020
preserved_exact_tokens:
- Runtime Packet Index Coverage Consolidation Addendum (2026-03-09)
- scheduler semantics and queue analysis
- event/contracts and storage
- attempts, safe points, and remediation lineage
- provider/auth/permission mappings
- runtime taxonomy
- Glossary.md
- canonical events, enums, identities, and action fields
- graph-lock behavior
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime contracts, executor protocol, storage, and glossary docs own their respective details.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/Glossary.md'
```

### 0PI-038 - Runtime Rendering And Blocked UX

```yaml
plan_unit_id: 0PI-038
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Runtime Packet Index Coverage Consolidation Addendum preserves blocked-state UX and recovery actions plus
  rendering and interaction routing through Plans/Run_Graph_View.md, Plans/Orchestrator_Page.md, and Plans/FinalGUISpec.md,
  with planning-state semantics consumed by chain wizard, assistant chat, and interview subagent docs.
gui_related: true
gui_classification_reason: The unit covers blocked-state UX, recovery actions, rendering, and interaction surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_rendering_and_blocked_ux
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: runtime_rendering_and_blocked_ux
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0020
preserved_exact_tokens:
- blocked-state UX and recovery actions
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- rendering and interaction
- Plans/chain-wizard-flexibility.md
- Plans/assistant-chat-design.md
- Plans/interview-subagent-integration.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Rendering and blocked-state UX consumers must defer to runtime and GUI owner docs.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/Glossary.md'
```

### 0PI-039 - Source Control Actions Docker Owner Split

```yaml
plan_unit_id: 0PI-039
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The 2026-03-12 source control, GitHub Actions, and Docker Manager addendum preserves the owner split: Plans/GitHub_Integration.md
  owns Git-first Source Control and GitHub Actions, Plans/WorktreeGitImprovement.md owns worktree correctness and runtime
  alignment, Plans/Containers_Registry_and_Unraid.md owns Docker Manager, Plans/newtools.md owns Docker/Actions doctor and
  result minima, and Contracts, storage, Permissions, and usage are anti-drift companions.'
gui_related: false
gui_classification_reason: The unit records owner-doc routing and runtime/worktree/container responsibilities rather than
  visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: source_control_actions_docker_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: source_control_actions_docker_owner_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0021
preserved_exact_tokens:
- 2026-03-12 addendum — source control, GitHub Actions, and Docker Manager
- Git-first Source Control
- GitHub Actions
- Plans/WorktreeGitImprovement.md
- worktree correctness and runtime alignment
- Docker Manager
- Docker/Actions doctor and result minima
- anti-drift companions
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Feature-owner docs own their surfaces; anti-drift companions must be read alongside them.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md,
  ContractName:Plans/storage-plan.md'
```

### 0PI-040 - Visible Source-Control Surface Routing

```yaml
plan_unit_id: 0PI-040
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The source control, GitHub Actions, and Docker Manager restart-pass owner map preserves FinalGUISpec ownership
  of activity-bar and side-panel vocabulary, Source Control, GitHub Actions, Docker Manager, cross-surface deep links, blocked-state
  presentation, mirror/owner attention behavior, GitHub Actions Current Branch / Workflows / Settings, secrets, variables,
  /environments, rerun/cancel/pin, workflow authoring help, Docker Manager operational subviews, /auth/Unraid, Publish / Unraid,
  Kubernetes placement, Orchestrator receipts, and deep links into owner surfaces.
gui_related: true
gui_classification_reason: The unit covers visible source-control, actions, Docker Manager, side-panel, and deep-link UI surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visible_source_control_surface_routing
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: visible_source_control_surface_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0021
preserved_exact_tokens:
- activity-bar and side-panel vocabulary
- Source Control
- GitHub Actions
- Docker Manager
- Current Branch
- Workflows
- Settings
- secrets
- variables
- /environments
- rerun/cancel/pin
- workflow authoring help
- /auth/Unraid
- Publish / Unraid
- Kubernetes placement
- Orchestrator receipts
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FinalGUISpec and feature-owner docs own visible shell vocabulary and deep-link behavior.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md,
  ContractName:Plans/storage-plan.md'
```

### 0PI-041 - Retired Git Alias And Stale-Canon Risk

```yaml
plan_unit_id: 0PI-041
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The source-control/GitHub Actions/Docker Manager addendum preserves Git (GitHub) only as a retired migration
  alias and records the highest stale-canon replacement risk in rewrite-tie-in-memo.md, usage-feature.md, FinalGUISpec.md,
  and Media_Generation_and_Capabilities.md, which must be reconciled against feature owners before older wording is treated
  as authoritative.
gui_related: true
gui_classification_reason: The unit covers a user-facing retired Git label and stale GUI/usage/media consumer risk.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: retired_git_alias_and_stale_canon_risk
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: retired_git_alias_and_stale_canon_risk
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0021
preserved_exact_tokens:
- Git (GitHub)
- retired migration alias
- stale-canon
- Plans/rewrite-tie-in-memo.md
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
- Plans/Media_Generation_and_Capabilities.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Git (GitHub) is retained only as a retired migration alias.
- Older source-control/GitHub Actions/Docker Manager wording must not be treated as authoritative before reconciliation.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md,
  ContractName:Plans/storage-plan.md'
```

### 0PI-042 - Web Firecrawl Owner Set

```yaml
plan_unit_id: 0PI-042
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Web Tools + Firecrawl + Missing-Spec Owner Alignment Note preserves the reconciled owner and consumer
  set for web tools, Firecrawl, questions, planning/TODO, permissions, runtime identity, and MCP across Tools, assistant chat,
  FinalGUISpec, Permissions, storage, Commands, UI Command Catalog, Skills, Contracts, Run Modes, Section 15, MCP Integration,
  LSPSupport, CLI Bridged Providers, Provider OpenCode, and newfeatures.
gui_related: true
gui_classification_reason: The unit includes web/chat/widget/tool/provider owner routing with user-visible web and chat surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_firecrawl_owner_set
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: web_firecrawl_owner_set
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- Web Tools + Firecrawl + Missing-Spec Owner Alignment Note (2026-03-30)
- web tools
- Firecrawl
- questions
- planning/TODO
- permissions
- runtime identity
- MCP
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Skills_System.md
- Plans/Contracts_V0.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/MCP_Integration.md
- Plans/LSPSupport.md
- Plans/CLI_Bridged_Providers.md
- Plans/Provider_OpenCode.md
- Plans/newfeatures.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Consumer summaries defer to repaired owner sections rather than keeping competing canon.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/Provider_OpenCode.md'
```

### 0PI-043 - Firecrawl Consumer Deference And Anchors

```yaml
plan_unit_id: 0PI-043
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The Firecrawl alignment note preserves the consumer-deference rule, verify-only out-of-packet scope, exact
  anchor-level regeneration targets, and drift-risk heading labels including #4.1, #8.6, #13.1, #13.2, #13.3, #28.2, storage
  #4.1/#4.3/#4.4, Tools #3.6/#10.3/#10.7/## 11/## 12/## 13, Permissions #6/#10.4, Commands #7/#2.4, Skills #4/#6, Section15
  #1.3A, MCP owner sections after ## 4, and FinalGUISpec audit/replacement surfaces.'
gui_related: true
gui_classification_reason: The unit covers exact anchors for chat, storage, tool, permission, command, skill, browser, MCP,
  and GUI audit surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_consumer_deference_and_anchors
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: firecrawl_consumer_deference_and_anchors
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- Consumer summaries
- defer
- Verify-only docs
- out of packet scope
- '#4.1'
- '#8.6'
- '#13.1'
- '#13.2'
- '#13.3'
- '#28.2'
- '#4.3'
- '#4.4'
- '#3.6'
- '#10.3'
- '#10.7'
- '## 11'
- '## 12'
- '## 13'
- '## 6'
- '### 10.4'
- Plans/FinalGUISpec.md
- '### 7.19 Agent Activity'
- '## 15'
- drift-risk heading labels
negative_constraints:
- Verify-only docs are intentionally out of packet scope when no edits are required.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/Provider_OpenCode.md'
```

### 0PI-044 - Firecrawl Obligation Routing

```yaml
plan_unit_id: 0PI-044
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Firecrawl alignment note preserves explicit obligation routing for obl-013, obl-014, obl-053, obl-054,
  obl-066, obl-067, obl-044, obl-055, obl-056, obl-040, obl-059, obl-060, obl-036, obl-037, obl-042, obl-048, obl-035, obl-045,
  obl-046, obl-047, obl-051, obl-062, and obl-064, keeps ownership/index descriptions drift-sensitive, and keeps Plans/newfeatures.md
  as a summary rollup consumer for repaired web/question/MCP/LSP surfaces.
gui_related: false
gui_classification_reason: The unit records obligation-to-owner routing and index drift governance rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_obligation_routing
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: firecrawl_obligation_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- Obligation routing remains explicit
- obl-013
- obl-014
- obl-053
- obl-054
- obl-066
- obl-067
- obl-044
- obl-055
- obl-056
- obl-040
- obl-059
- obl-060
- obl-036
- obl-037
- obl-042
- obl-048
- obl-035
- obl-045
- obl-046
- obl-047
- obl-051
- obl-062
- obl-064
- drift-sensitive
- Plans/newfeatures.md
- /question/MCP/LSP
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Normative behavior remains in the owner docs, while newfeatures is a summary rollup consumer only.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-045 - Slash And Provider Drift Guards

```yaml
plan_unit_id: 0PI-045
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The Firecrawl alignment note preserves slash-command cleanup and provider drift guards: XV2 and XV-FIX are
  AUTHORITATIVE for the reserved-command family, /clear is LOCKED and REMOVED from the reserved set, native PM structured
  reading uses /detail-level with minimal, summary, and full and is not MCP-based, and web-provider drift checks must preserve
  /effective-state, cache-persistence, under-specification, Rerun in Terminal, /TODO/Plan/Deep, Provider_OpenCode, and CLI_Bridged_Providers.'
gui_related: true
gui_classification_reason: The unit covers slash commands, command labels, structured reading UX, terminal rerun, and provider/chat
  command surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: slash_and_provider_drift_guards
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: slash_and_provider_drift_guards
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- Slash-command cleanup is locked
- XV2
- XV-FIX
- AUTHORITATIVE
- /clear
- LOCKED
- REMOVED
- /detail-level
- minimal
- summary
- full
- not MCP-based
- /effective-state
- cache-persistence
- under-specification
- Rerun in Terminal
- /TODO/Plan/Deep
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
negative_constraints:
- Native PM structured reading uses /detail-level and is not MCP-based.
compatibility_only_notes: []
stale_retired_dispositions:
- /clear is locked and removed from the reserved-command family.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-046 - Firecrawl Packet-Conflict Reset Scope

```yaml
plan_unit_id: 0PI-046
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Firecrawl/missing-spec packet-conflict reset preserves the reset title RECONCILIATION / COVERAGE PASS
  — PACKET-CONFLICT RESET (2026-04-06), supersedes older three-bucket, 12-doc, 13-doc, 23-blocker, and coverage-consuming
  registers, covers the full Firecrawl gap analysis plus missing-spec owner-alignment surface, consumes 54 active obligations
  and 7 active coverage blockers into MUST CHANGE owner docs plus MUST RECONCILE consumers, and keeps WebAction/browser consumer
  routing exact.
gui_related: true
gui_classification_reason: The unit includes web/provider, feature/settings/chat, terminal/operation cards, visualizer, skills,
  LSP, MCP, permission, and browser consumer routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_packet_conflict_reset_scope
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: firecrawl_packet_conflict_reset_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- Firecrawl/missing-spec packet-conflict reset (2026-04-06)
- RECONCILIATION / COVERAGE PASS — PACKET-CONFLICT RESET (2026-04-06)
- three-bucket
- 12-doc
- 13-doc
- 23-blocker
- coverage-consuming registers
- full Firecrawl gap analysis
- missing-spec owner-alignment surface
- 54 active
- '7'
- MUST CHANGE
- MUST RECONCILE
- already_resolved
- verify_only
- MUST VERIFY
- WebAction/browser consumer
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Older three-bucket, 12-doc, 13-doc, 23-blocker, and coverage-consuming registers are superseded for this work-item scope.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-047 - Reset Operation Constraints

```yaml
plan_unit_id: 0PI-047
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The packet-conflict reset preserves operation constraints: packet operations must be re-packetized as replace_section
  where stale canon or packet-appended section families would survive, especially in Tools, FinalGUISpec, Commands, newtools,
  and storage-plan; weaker append, insert_after, or verify_only hints and weak obligation hints must not weaken owner-correction
  operations or active blocker repair for obl-060, obl-067, obl-044, obl-055, or obl-056; research_packet.json, packet-shape
  reports, verifier outputs, shards, and evidence exports are process artifacts, not live packet doc intents.'
gui_related: false
gui_classification_reason: The unit records packet operation and process-artifact constraints rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: reset_operation_constraints
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: reset_operation_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- replace_section
- stale canon
- packet-appended
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/Commands_System.md
- Plans/newtools.md
- Plans/storage-plan.md
- append
- insert_after
- verify_only
- weak obligation hints
- obl-060
- obl-067
- obl-044
- obl-055
- obl-056
- research_packet.json
- packet-shape reports
- verifier outputs
- shards
- evidence exports
negative_constraints:
- Weaker append, insert_after, or verify_only hints and weak obligation hints must not weaken owner-correction operations
  or active blocker repair.
- Process artifacts are not live packet doc intents.
compatibility_only_notes:
- Research packet, verifier, shard, and evidence outputs are process artifacts to regenerate or revalidate after canonical
  docs change.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-048 - Legacy Fidelity Traceability

```yaml
plan_unit_id: 0PI-048
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Firecrawl/missing-spec reset preserves legacy fidelity labels only as reset traceability for owner/consumer
  routing, including FIDELITY-LF-007, FIDELITY-LF-008, FIDELITY-LF-009, FIDELITY-LF-011, FIDELITY-LF-012, FIDELITY-LF-015,
  and FIDELITY-LF-017 mappings, retired packet-count summaries 13, 10 MUST CHANGE, 3 MUST RECONCILE, 12, 9 MUST CHANGE, 2
  MUST VERIFY, 1 MUST VERIFY-only packet extra, and 11 / 11, canonical_obligations audit vocabulary, path-level and anchor-exact
  GATE-014 validation, and /operation as packet content/operation verification work.
gui_related: false
gui_classification_reason: The unit records audit traceability and validation vocabulary rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: legacy_fidelity_traceability
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: legacy_fidelity_traceability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- FIDELITY-LF-007
- FIDELITY-LF-008
- FIDELITY-LF-009
- FIDELITY-LF-011
- FIDELITY-LF-012
- FIDELITY-LF-015
- FIDELITY-LF-017
- '13'
- 10 MUST CHANGE
- 3 MUST RECONCILE
- '12'
- 9 MUST CHANGE
- 2 MUST VERIFY
- 1 MUST VERIFY-only packet extra
- 11 / 11
- canonical_obligations
- canonical_obligations.json
- '32'
- doc-local
- verify_only
- already_resolved
- path-level
- anchor-exact
- GATE-014
- /operation
negative_constraints:
- Legacy fidelity labels do not create separate GitHub Integration canon or packet-shape artifacts.
compatibility_only_notes:
- Legacy labels remain live only as reset traceability for owner/consumer routing.
stale_retired_dispositions:
- Older packet-count summaries are retired by the reset.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-049 - Additional Fidelity And Webmap Guard

```yaml
plan_unit_id: 0PI-049
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'Additional Firecrawl/lost-spec fidelity routing remains traceability-only under the same reset for FIDELITY-01
  through FIDELITY-07 and FIDELITY-LF-003, FIDELITY-LF-004, FIDELITY-LF-006, FIDELITY-LF-010, FIDELITY-LF-013, FIDELITY-LF-014,
  FIDELITY-LF-018, and FIDELITY-LF-019; these mappings do not promote Plans/GitHub_Integration.md from adjacent consumer to
  owner. The index-only fidelity guard preserves webmap as a minimal url: string input returning site map + source refs, perspective
  precedence between chat/system UX and contracts, and the uppercase source term PERSPECTIVE as retired audit vocabulary rather
  than a live UI label.'
gui_related: true
gui_classification_reason: The unit covers webmap behavior, chat UX presentation, GUI/runtime/system perspective, and retired
  UI-label vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: additional_fidelity_and_webmap_guard
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: additional_fidelity_and_webmap_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- FIDELITY-01
- FIDELITY-02
- FIDELITY-03
- FIDELITY-04
- FIDELITY-05
- FIDELITY-06
- FIDELITY-07
- FIDELITY-LF-003
- FIDELITY-LF-004
- FIDELITY-LF-006
- FIDELITY-LF-010
- FIDELITY-LF-013
- FIDELITY-LF-014
- FIDELITY-LF-018
- FIDELITY-LF-019
- Plans/GitHub_Integration.md
- webmap
- 'url: string'
- site map + source refs
- chat-perspective
- system-perspective
- PERSPECTIVE
negative_constraints:
- These mappings do not promote Plans/GitHub_Integration.md from adjacent consumer to owner for web, chat, storage, command,
  skill, MCP, LSP, browser, or run-mode recovery canon.
compatibility_only_notes: []
stale_retired_dispositions:
- The uppercase source term PERSPECTIVE is retired as audit vocabulary rather than a live UI label.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-050 - A2A OpenCode Packet Boundary

```yaml
plan_unit_id: 0PI-050
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The A2A / OpenCode research packet map is an index and owner-map note only; live runtime, event, permission,
  usage, prompt, tool/provider, storage, and UI behavior remains in owner docs. Draft research-packet artifacts, verifier
  reports, and other pipeline files are process artifacts, not packet docs and not canonical evidence. The next packet missing
  owner/consumer docs are Executor_Protocol, Contracts_V0, and assistant-chat-design, while Prompt_Pipeline is resolved-only
  unless a fresh contradiction appears.
gui_related: true
gui_classification_reason: The unit references UI behavior and chat owner/consumer surfaces while preserving packet boundary
  governance.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: a2a_opencode_packet_boundary
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: a2a_opencode_packet_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0023
preserved_exact_tokens:
- A2A / OpenCode research packet map (2026-03-28)
- index and owner-map note only
- live runtime, event, permission, usage, prompt, tool/provider, storage, and UI behavior
- Draft research-packet artifacts
- verifier reports
- process artifacts
- not packet docs
- not canonical evidence
- Plans/Executor_Protocol.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/Prompt_Pipeline.md
- resolved-only
negative_constraints:
- Draft research-packet artifacts, verifier reports, and other pipeline files are process artifacts, not packet docs and not
  canonical evidence.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-051 - A2A Impacted-Doc Taxonomy

```yaml
plan_unit_id: 0PI-051
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The A2A/OpenCode packet map preserves the considered and narrowed doc taxonomy: 31 docs considered, final
  impacted-doc set of 27, 16 clearly implicated owner docs, 5 cross-doc reconciliation seams, 6 verification-only drift watchers,
  4 adjacent docs not bucketed, plus intermediate owner/consumer categories for runtime/orchestration, tool/provider/MCP,
  mutation/durability, usage/event/protocol, chat/auth/UI consumers, and resolved packet-only blockers.'
gui_related: true
gui_classification_reason: The taxonomy includes chat/auth/UI consumers and GUI-related FinalGUISpec/WorktreeGit surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: a2a_impacted_doc_taxonomy
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: a2a_impacted_doc_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0023
preserved_exact_tokens:
- '31'
- '27'
- '16'
- '5'
- '6'
- '4'
- Run_Modes.md
- Permissions_System.md
- Tools.md
- CLI_Bridged_Providers.md
- Models_System.md
- usage-feature.md
- Contracts_V0.md
- FileSafe.md
- storage-plan.md
- Prompt_Pipeline.md
- orchestrator-subagent-integration.md
- GitHub_API_Auth_and_Flows.md
- LSPSupport.md
- Executor_Protocol.md
- Architecture_Invariants.md
- Plugins_System.md
- Crosswalk.md
- OpenCode_Coverage_Matrix.md
- WorktreeGitImprovement.md
- FinalGUISpec.md
- Provider_OpenCode.md
- GitHub_Integration.md
- UI_Command_Catalog.md
- FileManager.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Docs not bucketed remain downstream consumers or already defer to actual owners unless a MUST VERIFY check fails.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-052 - A2A Cleanup And Final Narrowing

```yaml
plan_unit_id: 0PI-052
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The A2A/OpenCode packet map preserves packetization-ready cleanup and final narrowing: remove direct packet
  intents for Permissions_System and Provider_Stream_Mapping_External_Reference_A2A, demote Contracts_V0 to verify-only unless
  a fresh schema conflict appears, retarget stale packet anchors in orchestrator-subagent-integration, CLI_Bridged_Providers,
  storage-plan, and assistant-chat-design, keep verifier reports out of packet buckets, drop over-coverage for Run_Modes,
  storage-plan, Contracts_V0#Billing entity field contract, and FileSafe#9 unless fresh contradictions appear, and narrow
  the final remaining packet surface to the 4 owner-doc set Run_Modes, FileSafe, storage-plan, and Contracts_V0.'
gui_related: false
gui_classification_reason: The unit records packet cleanup, owner narrowing, and verification boundaries rather than UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: a2a_cleanup_and_final_narrowing
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: a2a_cleanup_and_final_narrowing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0023
preserved_exact_tokens:
- Packetization-ready cleanup
- remove direct packet intents
- Plans/Permissions_System.md
- Plans/Provider_Stream_Mapping_External_Reference_A2A.md
- verify-only
- fresh schema conflict
- retarget packet anchors
- orchestrator-subagent-integration.md
- CLI_Bridged_Providers.md
- storage-plan.md
- assistant-chat-design.md
- over-coverage cleanup
- Plans/Run_Modes.md
- Plans/Contracts_V0.md#Billing entity field contract
- Plans/FileSafe.md#9. Implementation Checklist
- '4'
- Plans/Run_Modes.md
- Plans/FileSafe.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
negative_constraints:
- Verifier reports stay out of packet buckets while preserving auditability.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The final narrowed remaining packet surface is the four owner-doc set Run_Modes, FileSafe, storage-plan, and Contracts_V0.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-053 - A2A Evidence And Anchor Exactness

```yaml
plan_unit_id: 0PI-053
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The A2A/OpenCode packet map preserves that all active fidelity blockers consumed by the reconciliation result
  must land as explicit owner-doc fixes in MUST CHANGE or dependent consumer /mirror alignment in MUST RECONCILE, none may
  remain implicit or MUST VERIFY-only, validation artifacts and packet-shape reports are process evidence rather than packet
  doc intents or Project Plan Package outputs, ledger_fidelity_report.txt ending <ledger_fidelity_blocked/> and fidelity_recovery_plan.txt
  ending <recovery_plan_ready/> are run-scoped process-readiness markers, LFA-001 is CONFIRMED RESOLVED by live Contracts_V0.md#4.1
  null-padding / omission semantics, and packet section coverage is anchor-exact rather than path-only.
gui_related: false
gui_classification_reason: The unit records evidence, validation, and anchor-exact governance rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: a2a_evidence_and_anchor_exactness
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: a2a_evidence_and_anchor_exactness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0023
preserved_exact_tokens:
- MUST CHANGE
- MUST RECONCILE
- MUST VERIFY-only
- Validation artifacts
- packet-shape reports
- process evidence
- Project Plan Package outputs
- ledger_fidelity_report.txt
- <ledger_fidelity_blocked/>
- fidelity_recovery_plan.txt
- <recovery_plan_ready/>
- ledger_fidelity_blocked
- recovery_plan_ready
- LFA-001
- CONFIRMED RESOLVED
- Contracts_V0.md#4.1
- null-padding / omission semantics
- anchor-exact
- not path-only
- '### HTTP/status to failure-class mapping'
- '### Stream cancellation and replay safety'
- '### Normalized usage event minimum fields'
- '### 15.12 Integration Checklist'
- lock-path
- storage-root
- '### 2.3 Post-filter integrity rules'
negative_constraints:
- All active fidelity blockers consumed by this reconciliation result must not remain implicit or MUST VERIFY-only.
- Validation artifacts and packet-shape reports are process evidence, not packet doc intents or Project Plan Package outputs.
- ledger_fidelity_blocked and recovery_plan_ready do not become permission states or UI labels.
- Packet section coverage is anchor-exact, not path-only.
compatibility_only_notes:
- Plans/.pipeline/ledger_fidelity_report.txt and /.pipeline/ledger_fidelity_report.txt are source-lineage paths only and do
  not become Plans/Personas.md persona schema canon.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-054 - Standardization Owner Consumer Boundary

```yaml
plan_unit_id: 0PI-054
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Owner / Consumer Map section preserves that source-preserving standardization keeps the owner and consumer
  boundaries stated in the original document body, keeps Plans/00-plans-index.md as owner for the behavior described by its
  preserved sections during the batch, and routes cross-doc ownership through the ContractRefs and boundary notes already
  present in the original text.
gui_related: false
gui_classification_reason: The unit records plan standardization owner/consumer boundaries rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: standardization_owner_consumer_boundary
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: standardization_owner_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0024
preserved_exact_tokens:
- Owner / Consumer Map
- source-preserving standardization
- owner and consumer boundaries
- Plans/00-plans-index.md
- ContractRefs
- boundary notes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/00-plans-index.md preserves index-body behavior while cross-doc ownership follows ContractRefs and boundary notes.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
```

### 0PI-055 - Goal Runtime System Owner Map

```yaml
plan_unit_id: 0PI-055
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Plans/00-plans-index.md registers the Native Goal Runtime owner split compiled from ledger pldg-20260616-001-goal-runtime-system. Plans/Goal_Runtime_System.md owns native Goal Mode runtime/control-plane behavior; assistant-chat-design owns visible Assistant Chat Goal UI and thread surfaces; FinalGUISpec owns Settings GUI placement for separate worker and verifier/adjudicator model selectors; Planning_Wizard owns current Planning Wizard flow semantics while chain-wizard-flexibility remains a legacy compatibility/source-lineage consumer; Contracts_V0, storage-plan, and Permissions_System own shared envelope, persistence, and approval-scope registration; Runtime_Artifacts_Panel consumes Goal Runtime evidence/receipt identities while Project_Output_Artifacts remains a project-output boundary reference only; Models_System and Multi-Account own concrete model/account resolution, while provider-specific docs such as Provider_OpenCode own existing provider capability/model discovery surfaces and do not define Goal Runtime provider-default tier mappings unless promoted by a later provider hook; Planning_Ledger_System, Plan_Document_System, and Plan_To_Node_Compilation retain ledger, PlanUnit, generated index, and readiness-only compiler boundaries.
gui_related: false
gui_classification_reason: This unit records index owner routing metadata; GUI owner docs are referenced but not implemented here.
depends_on:
  - GRS-001
unblocks: []
acceptance_criteria:
  - The Plan map names Plans/Goal_Runtime_System.md as the canonical Goal Runtime owner doc.
  - Assistant Chat and Final GUI are recorded as consumers for visible controls and settings placement.
  - Planning Wizard, legacy Chain Wizard compatibility, contract, storage, permission, runtime artifact, project-output boundary, model, account, and provider owner/consumer refs are recorded without moving Goal Runtime behavior out of Goal_Runtime_System.
  - The index preserves the no-WorkNode boundary and separates ledger compile, explicit PlanUnit indexing, and later explicit governance seal phases.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system
risk_class: owner_map_drift
reasoning_tier: standard
context_scope: plans_index_goal_runtime_map
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: goal_runtime_owner_map
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0080
  - pldg-20260616-001-goal-runtime-system:atom-0082
  - pldg-20260616-001-goal-runtime-system:atom-0083
  - pldg-20260616-001-goal-runtime-system:atom-0103
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:dec-0012
preserved_exact_tokens:
  - "Goal_Runtime_System.md"
  - "Native Goal Runtime Map"
  - "pldg-20260616-001-goal-runtime-system"
  - "worker model"
  - "verifier/adjudicator model"
  - "chain-wizard-flexibility.md"
  - "Contracts_V0.md"
  - "storage-plan.md"
  - "Permissions_System.md"
  - "Runtime_Artifacts_Panel.md"
  - "Project_Output_Artifacts.md"
  - "Models_System.md"
  - "Multi-Account.md"
  - "Provider_OpenCode.md"
  - "WorkNodes"
  - "NodeSeeds"
  - "Spec_Lock"
  - "evidence bundles"
negative_constraints:
  - Do not treat Plans/00-plans-index.md as the owner for Goal Runtime behavior.
  - Do not create WorkNodes, NodeSeeds, or governance seal artifacts during the pre-seal compile phase.
  - Do not conflate ledger compile, PlanUnit indexing, and governance seal phases.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
```

### 0PI-056 - Orchestrator Goal Runtime Flow Owner Map

```yaml
plan_unit_id: 0PI-056
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Plans/00-plans-index.md registers the Orchestrator Goal Runtime Flow owner split. Goal_Runtime_System owns the shared Goal Runtime engine and repair-loop policy; Orchestrator_Page owns GoalRun control and projection; Executor_Protocol owns WorkNode readiness, backoff, capacity, dispatch, retries, and classification; orchestrator-subagent-integration owns bounded SubagentWave and parent/child supervision; Plan_To_Node_Compilation owns runtime-object and compiler-boundary readiness without creating WorkNodes; Contracts_V0, storage-plan, Permissions_System, Models_System, Multi-Account, provider-specific docs, Planning_Ledger_System, and Plan_Document_System own their contract, persistence, approval, model/account/provider, ledger, and PlanUnit/index boundaries. Run_Graph_View, FinalGUISpec, Assistant Chat, Chain Wizard, Runtime Artifacts, WorktreeGitImprovement, UI_Command_Catalog, Wiring_Matrix, usage-feature, and Glossary consume or mirror the flow through their owner surfaces, and consumer mirrors may retain old fixed-hierarchy labels only as compatibility/search aliases while owner docs keep active terminology on GoalRun, WorkGraph, WorkNode, capability_lane, agent_role, SubagentWave, VerificationCycle, and Receipt. Compile-readiness records may state accepted recommendations, no remaining open design questions, and live repo backlink audit requirements for ledger-to-Plans compile, but not direct implementation readiness. The pre-seal compile phase may regenerate allowed Plans/.plan_index outputs only; a later explicit governance seal may refresh Spec_Lock, generated shards, evidence bundles, plan_graph, and auto_decisions without creating NodeSeeds, WorkNodes, executable queues, final node manifests, final build tasks, production build tasks, or final node queues.
gui_related: false
gui_classification_reason: This unit records canonical owner routing metadata; GUI docs are referenced as consumers but not implemented here.
depends_on:
  - 0PI-055
  - GRS-026
  - OP-022
  - EP-098
  - PNC-009
  - PDS-006
unblocks: []
acceptance_criteria:
  - The index names the Orchestrator Goal Runtime Flow owner docs and consumer docs.
  - Executor scheduler truth remains separate from Orchestrator projection/control truth.
  - Capability lane, model, account/provider, permission, storage, receipt, GUI, chat, chain-wizard, runtime-artifact, ledger, PlanUnit, and compiler-boundary owner docs are recorded without taking over Goal Runtime behavior.
  - Consumer mirrors may retain old fixed-hierarchy labels only as compatibility/search aliases; they do not preserve stale tier labels as active canonical runtime semantics.
  - Compile-readiness records can preserve accepted recommendations, no remaining open design questions, and live repo backlink audit requirements without authorizing direct code implementation.
  - The index preserves the no-WorkNode, no-NodeSeed, no-executable-queue, no-final-node-manifest, no-final-build-task, no-production-build-task boundary across compile, indexing, and governance seal phases.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow
risk_class: orchestrator_goal_owner_map_drift
reasoning_tier: high
context_scope: plans_index_orchestrator_goal_runtime_flow
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Goal_Runtime_System.md
  - Plans/Orchestrator_Page.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Run_Graph_View.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/usage-feature.md
  - Plans/Glossary.md
node_compile_hint:
  mode: orchestrator_goal_runtime_flow_owner_map
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0010
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0070
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0078
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0080
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0081
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0082
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0083
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0084
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0085
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0086
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0088
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0097
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0098
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0099
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0104
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0016
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0027
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0029
preserved_exact_tokens:
  - "Orchestrator Goal Runtime Flow"
  - "GoalRun"
  - "WorkGraph"
  - "SubagentWave"
  - "VerificationCycle"
  - "WorkNode"
  - "agent_role"
  - "Receipt"
  - "compatibility/search aliases"
  - "ledger-to-Plans compile"
  - "accepted"
  - "no remaining open design questions"
  - "live repo backlink audit"
  - "capability_lane"
  - "write_mode"
  - "pending governance seal"
  - "Spec_Lock"
  - "WorkNodes"
  - "NodeSeeds"
  - "final build tasks"
negative_constraints:
  - Do not treat Plans/00-plans-index.md as the owner for runtime behavior.
  - Do not keep stale tier labels as active canonical runtime semantics.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, final build tasks, or production build tasks during compile, indexing, or governance seal.
  - Do not conflate ledger compile, allowed PlanUnit indexing, and governance seal phases.
  - Do not treat plan-compile readiness as direct code implementation readiness.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Goal_Runtime_System.md
  - Plans/Orchestrator_Page.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Run_Graph_View.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/usage-feature.md
  - Plans/Glossary.md
```

### 0PI-057 - Semantic Audit Closure Owner Map

```yaml
plan_unit_id: 0PI-057
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Plans/00-plans-index.md records the semantic audit closure owner split
  without re-owning closure semantics. Planning_Ledger_System/PLS-012 owns the
  durable Plans/.audits/_semantic_closure_registry.jsonl row shape,
  audit_scope_manifest.jsonl, repair_impact_matrix.jsonl, previously_closed
  reuse, reopen policy, subject_ref/observation_ref, and latest_audit_*
  terminal-state rules. Plan_Document_System/PDS-014 owns deterministic
  finding_key and check_id construction, repair_required/finding_level,
  audit source artifact validation, cross-artifact ref checks,
  repair_closure_matrix.jsonl, scope/impact coverage, and validator-facing
  actionable-row coverage.
  Bootstrap_Planning_Workflow and
  Codex_Prompts consume those owner PlanUnits for workflow and reusable prompt
  text. scripts/pm-audit-closure.py, the global closure registry,
  audit_scope_manifest.jsonl, repair_impact_matrix.jsonl, and audit-scoped
  repair_closure_matrix.jsonl are support/governance surfaces, not product
  implementation files, WorkNodes, NodeSeeds, executable queues, final node
  manifests, or build tasks.
gui_related: false
gui_classification_reason: This unit records canonical owner routing for audit governance support; it does not implement user-visible GUI behavior.
depends_on:
  - PLS-012
  - PDS-014
unblocks: []
acceptance_criteria:
  - The index routes closure registry row shape and reopen policy to PLS-012.
  - The index routes audit_scope_manifest.jsonl and repair_impact_matrix.jsonl process behavior to PLS-012.
  - The index routes subject_ref, observation_ref, and latest_audit_* terminal-state rules to PLS-012.
  - The index routes deterministic finding_key/check_id, repair_required/finding_level, audit source validation, scope/impact coverage, and repair_closure_matrix validation to PDS-014.
  - Bootstrap workflow and prompt docs are recorded as consumers rather than schema owners.
  - Closure support artifacts and scripts are not product implementation, WorkNode, NodeSeed, executable queue, final node manifest, or build-task artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-audit-closure.py validate
risk_class: owner_routing
reasoning_tier: high
context_scope: bootstrap_audit_repair
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
  - Plans/bootstrap/Codex_Prompts.md
  - scripts/pm-audit-closure.py
  - Plans/.audits/_semantic_closure_registry.jsonl
  - Plans/.audits/audit-*/audit_scope_manifest.jsonl
  - Plans/.audits/audit-*/repair_impact_matrix.jsonl
  - Plans/.audits/audit-*/repair_closure_matrix.jsonl
node_compile_hint:
  mode: owner_routing_only
  create_worknodes: false
source_lineage:
  - source_ref:chat:2026-06-17-semantic-closure-registry-support
preserved_exact_tokens:
  - "Plans/.audits/_semantic_closure_registry.jsonl"
  - "repair_closure_matrix.jsonl"
  - "audit_scope_manifest.jsonl"
  - "repair_impact_matrix.jsonl"
  - "finding_key"
  - "check_id"
  - "previously_closed"
  - "repair_required"
  - "finding_level"
  - "subject_ref"
  - "observation_ref"
  - "scripts/pm-audit-closure.py"
  - "PLS-012"
  - "PDS-014"
negative_constraints:
  - Do not make Plans/00-plans-index.md the owner of closure registry schema or closure matrix validation.
  - Do not make Plans/00-plans-index.md the owner of scope-manifest or impact-matrix schema semantics.
  - Do not route repair_required=false warnings, previously_closed rows, audit-only observations, or hygiene-only runs into repair obligations.
  - Do not treat audit closure support scripts or audit JSONL artifacts as product implementation files.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or build tasks from closure registry state.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

ContractRef: ContractName:Plans/00-plans-index.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

### 0PI-058 - Plans-To-Code Handoff Owner Map

```yaml
plan_unit_id: 0PI-058
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Plans/00-plans-index.md records the Plans-to-code handoff owner split without re-owning behavior. Plan_To_Node_Compilation owns design-only PlanCompileRun, stage cards, NodeSeed candidate, WorkGraph draft, WorkNode request, handoff matrix, and schema boundary. Automated_Testing_System owns automated test discovery, harness, strategy, binding, receipts, oracles, adapters, and test-gap blockers. Executor_Protocol owns intake, dispatch boundary, preflights, loop breakers, PlanChangeDetected handling, and execution receipts. Goal_Runtime_System owns future Planning Wizard trigger semantics after explicit enablement, autonomy/HITL boundary consumption, and GoalCompletionReceipt certification. Models_System owns six model settings and model resolution receipts. Orchestrator_Page and FinalGUISpec own the seven-tab Orchestrator shell, visible Plan Compile tab, and Settings projection. WorktreeGitImprovement, FileSafe, and GitHub_Integration own source-control execution contracts. Project_Output_Artifacts and Runtime_Artifacts_Panel own packaged receipt artifacts and evidence projection. Contracts_V0 owns shared envelopes and the design-only schema draft. Planning_Ledger_System and Plan_Document_System own matrix compile inputs and reference-scan gates.
  The index records backlinks, index docs, UI command docs, and crosswalks as reference-scan consumers, and preserves the boundary: Do not update only the obvious owner docs while leaving stale references in consumer/index/UI docs. It also preserves: Do not do an uncontrolled whole-repo rename as part of this compile; do not leave direct contradictions in touched sections.
gui_related: false
gui_classification_reason: This unit records owner routing in the canonical index; it does not implement the visible UI.
depends_on:
  - PNC-010
  - PNC-014
  - ATS-001
  - EP-099
  - EP-103
  - GRS-028
  - GRS-030
  - MS-110
  - OP-023
  - F3-397
  - W-072
  - F2-189
  - GI-031
  - POA-048
  - RAP-029
  - CV-289
  - PLS-013
  - PDS-015
unblocks: []
acceptance_criteria:
  - The index names the primary owners and consumer boundaries for the Plans-to-code handoff compile.
  - The index records Automated_Testing_System and plans_to_code_handoff.schema.json as canonical docs/schema drafts.
  - The index explicitly preserves the no-build boundary: PlanCompile disabled, no WorkNodes, no NodeSeeds, no executable queues, no implementation files, no dispatched GoalRuns, and governance registration remains metadata-only.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
risk_class: owner_routing
reasoning_tier: high
context_scope: plans_to_code_handoff_index
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Goal_Runtime_System.md
  - Plans/Models_System.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FileSafe.md
  - Plans/GitHub_Integration.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
  - Plans/plans_to_code_handoff.schema.json
node_compile_hint:
  mode: owner_routing_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0058
  - pldg-20260617-001-plans-to-code-handoff:atom-0061
  - pldg-20260617-001-plans-to-code-handoff:atom-0062
  - pldg-20260617-001-plans-to-code-handoff:atom-0063
  - pldg-20260617-001-plans-to-code-handoff:atom-0064
  - pldg-20260617-001-plans-to-code-handoff:dec-0024
  - pldg-20260617-001-plans-to-code-handoff:dec-0026
  - pldg-20260617-001-plans-to-code-handoff:dec-0027
  - pldg-20260617-001-plans-to-code-handoff:dec-0028
preserved_exact_tokens:
  - "Plan_To_Node_Compilation"
  - "Goal_Runtime_System"
  - "Orchestrator_Page"
  - "Executor_Protocol"
  - "Automated_Testing_System"
  - "implementation_readiness_matrix"
  - "doc_impact_matrix"
  - "owner docs"
  - "consumer docs"
  - "reference docs"
  - "no-update evidence"
negative_constraints:
  - Do not run PlanCompile or build WorkNodes from this index entry.
  - Do not update generated governance artifacts during ordinary ledger compile; refresh them only in explicit governance registration/seal scope.
compatibility_only_notes:
  - Pre-rename Plan Wizard tokens may remain in source_lineage, preserved_exact_tokens, historical migration notes, and compatibility aliases only.
stale_retired_dispositions:
  - Plan Wizard is retired as active product/runtime/compile terminology; current prose, PlanUnits, commands, events, prompts, and index rows use Planning Wizard.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Goal_Runtime_System.md
```

ContractRef: ContractName:Plans/00-plans-index.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Goal_Runtime_System.md
