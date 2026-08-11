# Shard 034: PlanUnits

Source: `Plans/Architecture_Invariants.md`

Source lines: L445-L4530

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## PlanUnits

### AI-001 - Architecture Invariants Retired Source-Preserving Bridge

```yaml
plan_unit_id: AI-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: AI-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 116 because Architecture_Invariants-S0001
  through S0040 are covered by AI-002 through AI-067 or explicit structural and migration-coverage dispositions. AI-001 no
  longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried
  by fine-grained Architecture_Invariants PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- AI-002
- AI-003
- AI-004
- AI-005
- AI-006
- AI-007
- AI-008
- AI-009
- AI-010
- AI-011
- AI-012
- AI-013
- AI-014
- AI-015
- AI-016
- AI-017
- AI-018
- AI-019
- AI-020
- AI-021
- AI-022
- AI-023
- AI-024
- AI-025
- AI-026
- AI-027
- AI-028
- AI-029
- AI-030
- AI-031
- AI-032
- AI-033
- AI-034
- AI-035
- AI-036
- AI-037
- AI-038
- AI-039
- AI-040
- AI-041
- AI-042
- AI-043
- AI-044
- AI-045
- AI-046
- AI-047
- AI-048
- AI-049
- AI-050
- AI-051
- AI-052
- AI-053
- AI-054
- AI-055
- AI-056
- AI-057
- AI-058
- AI-059
- AI-060
- AI-061
- AI-062
- AI-063
- AI-064
- AI-065
- AI-066
- AI-067
unblocks: []
acceptance_criteria:
- AI-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 116.
- Architecture_Invariants-S0001 through S0043 coverage is owned by AI-002 through AI-067 or explicit structural, retired,
  and migration-coverage dispositions.
- AI-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0042
preserved_exact_tokens:
- AI-001
- Architecture Invariants Residual Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- PlanUnits
- Migration Coverage
- Original hash
negative_constraints:
- AI-001 must not re-own Architecture_Invariants-S0001 through S0040 after Phase 2B batch 116.
- AI-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- AI-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former AI-001 residual source-preserving bridge is retired by Phase 2B batch 116.
owner_boundary_notes:
- Fine-grained PlanUnits AI-002 through AI-067 carry product/source coverage for Architecture_Invariants-S0001 through S0040;
  S0041 and S0043 are structural/metadata dispositions.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs: []
```

### AI-002 - Document Governance And Invariant Scope

```yaml
plan_unit_id: AI-002
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: The document preserves compliance with DRY and Contracts references, Puppet Master naming, legacy-naming compatibility,
  deterministic-default policy, and the scope that architecture invariants MUST hold across all plans and implementations.
gui_related: false
gui_classification_reason: This unit covers document governance, naming, and invariant scope, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_governance_and_invariant_scope
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: document_governance_and_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0002
preserved_exact_tokens:
- Architecture Invariants (Canonical)
- Compliance
- Puppet Master
- legacy naming
- No open questions
- deterministic defaults
- 0. Scope
- Invariants are cross-cutting rules
- MUST hold across all plans and implementations
negative_constraints: []
compatibility_only_notes:
- If older naming exists, refer to it only as "legacy naming" and do not quote the older name.
stale_retired_dispositions: []
owner_boundary_notes:
- Architecture_Invariants.md owns cross-cutting invariant declarations while cited SSOT docs own their own contracts.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§1'
```

### AI-003 - Normalized Provider Tool Correlation

```yaml
plan_unit_id: AI-003
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Normalized provider streams require every tool_use to have exactly one matching tool_result by tool_use_id,
  with a versioned bridged-provider correlation block carrying actor, thread, attempt, and lineage references.
gui_related: false
gui_classification_reason: This unit covers provider stream correlation and event identity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: normalized_provider_tool_correlation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: normalized_provider_tool_correlation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0003
preserved_exact_tokens:
- INV-001 -- Tool correlation integrity (normalized streams + persisted events)
- tool_use
- tool_result
- tool_use_id
- versioned correlation block
- actor/thread/attempt/lineage refs
- bridged-provider normalized events
negative_constraints:
- Every tool_use MUST have exactly one matching tool_result with the same tool_use_id; orphan tool events are prohibited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- CLI_Bridged_Providers owns provider stream mapping while Architecture_Invariants owns the cross-cutting invariant.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, Primitive:RuntimeIdentity'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md'
```

### AI-004 - Runtime And Route Identity Normalization

```yaml
plan_unit_id: AI-004
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Runtime identity demotes tier_id from canonical execution correlation, preserves thread_id and correlation_id
  tracing, migrates raw local IDs to subject_id or object_kind/object_id, normalizes usage_event_ref as object_kind = usage_event,
  and keeps resume_url? as transport rather than canonical identity.
gui_related: false
gui_classification_reason: This unit covers runtime and route identity normalization, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_and_route_identity_normalization
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: runtime_route_identity_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0003
preserved_exact_tokens:
- tier_id
- thread_id
- correlation_id
- subject_id
- object_kind/object_id
- usage_event_ref
- object_kind = usage_event
- resume_url?
- Route-aware schema/gate/evidence extensions
negative_constraints:
- MUST NOT reuse persisted state when doing so would violate normalized subject, route, or destination identity constraints.
compatibility_only_notes:
- tier_id may survive as a human-readable grouping label or derived display/grouping compatibility metadata, not as canonical
  execution correlation.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime and route identity reconcile through Contracts_V0 RouteTarget/OpenSubject and owner-doc integrity, not isolated
  consumer pockets.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, Primitive:RuntimeIdentity'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject'
```

### AI-005 - Persisted Canonical Tool Events

```yaml
plan_unit_id: AI-005
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Persisted event streams represent tool activity with canonical tool event types tool.invoked and tool.denied
  and include stable run_id plus thread_id correlation.
gui_related: false
gui_classification_reason: This unit covers persisted event stream identity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persisted_canonical_tool_events
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: persisted_canonical_tool_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0003
preserved_exact_tokens:
- persisted event streams
- tool.invoked
- tool.denied
- run_id
- thread_id
negative_constraints:
- Persisted tool activity must not be represented by non-canonical event aliases that lose run_id and thread_id correlation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Contracts_V0.md'
```

### AI-006 - No Secrets In Persistent Storage

```yaml
plan_unit_id: AI-006
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Secrets, tokens, credentials, and private keys MUST NOT be written to seglog, redb, Tantivy, sparse n-gram
  artifacts except scrubbed derived content and project-relative paths, plaintext logs, evidence bundles, or state files;
  OS credential store is the only allowed persistence.
gui_related: false
gui_classification_reason: This unit covers storage security and persistence policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: no_secrets_in_persistent_storage
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: no_secrets_in_persistent_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0004
preserved_exact_tokens:
- INV-002 -- No secrets in persistent storage
- seglog event stream
- redb projections
- Tantivy indexes
- frequency_table.bin
- postings.bin
- lookup.bin
- file_map.bin
- index_meta.json
- OS credential store only
negative_constraints:
- Secrets (tokens, credentials, private keys) MUST NOT be written to persistent storage, logs, evidence bundles, or state
  files.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, SchemaID:evidence.schema.json, PolicyRule:no_secrets_in_storage,
  ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md'
```

### AI-007 - UI SSOT Behavior Boundary

```yaml
plan_unit_id: AI-007
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: UI copy, buttons, and view behavior MUST be specified in canonical UI SSOT docs and the typed command layer;
  plan docs may reserve IDs but must not invent ad-hoc UI behaviors.
gui_related: true
gui_classification_reason: This unit governs UI copy, buttons, view behavior, and typed command layer ownership.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_ssot_behavior_boundary
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: ui_ssot_behavior_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0005
preserved_exact_tokens:
- INV-003 -- UI SSOT (no bespoke UI behavior)
- UI copy
- buttons
- view behavior
- canonical UI SSOT docs
- typed command layer
- ad-hoc UI behaviors
negative_constraints:
- Plan docs may reserve IDs but must not invent ad-hoc UI behaviors.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Canonical UI SSOT docs and the typed command layer own UI behavior; Architecture_Invariants records the invariant.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand'
```

### AI-008 - UI Command Business Logic Boundary

```yaml
plan_unit_id: AI-008
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: The UI layer dispatches stable UICommand IDs and MUST NOT execute business logic directly.
gui_related: true
gui_classification_reason: This unit governs UI command dispatch and the UI/business-logic boundary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_business_logic_boundary
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: ui_command_business_logic_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0006
preserved_exact_tokens:
- INV-004 -- UI command boundary (no business logic in UI)
- UICommand
- stable UICommand IDs
- business logic directly
negative_constraints:
- The UI layer MUST NOT execute business logic directly.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md'
```

### AI-009 - Deterministic SSOT Ordering

```yaml
plan_unit_id: AI-009
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: When multiple candidates exist, tie-break ordering comes from the relevant domain SSOT list and no heuristic
  reordering is allowed.
gui_related: false
gui_classification_reason: This unit covers deterministic ordering policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: deterministic_ssot_ordering
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: deterministic_ssot_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0007
preserved_exact_tokens:
- INV-005 -- Deterministic ordering from SSOT lists
- paths
- names
- servers
- single SSOT list
- no heuristic reordering
negative_constraints:
- Heuristic reordering is prohibited when a relevant domain SSOT list owns tie-break order.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md'
```

### AI-010 - Provider Storage Isolation

```yaml
plan_unit_id: AI-010
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Providers and provider adapters emit normalized events or tool results and MUST NOT write directly to seglog,
  redb, Tantivy, sparse n-gram index files, or remote-cache state; PM-owned storage writers, projectors, and cache managers
  own persistence.
gui_related: false
gui_classification_reason: This unit covers provider/storage ownership boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_storage_isolation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: provider_storage_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0008
preserved_exact_tokens:
- INV-006 -- Providers are storage-isolated
- seglog
- redb
- Tantivy
- sparse n-gram index files
- remote-cache state
- normalized events
- tool results
- PM-owned storage writers
negative_constraints:
- Providers and provider adapters MUST NOT write directly to persistent storage.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider adapters own normalized emissions; PM-owned storage writers, projectors, and cache managers own persistence.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:Provider, Primitive:SessionStore, ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md'
```

### AI-011 - No Stringly Typed IDs Outside SSOT

```yaml
plan_unit_id: AI-011
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Stable IDs such as Tool IDs, UICommand IDs, ConfigKey names, and schema IDs are defined once in their SSOT
  and referenced everywhere else instead of being reinvented as ad-hoc string literals.
gui_related: false
gui_classification_reason: This unit covers identifier governance and DRY ownership, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: no_stringly_typed_ids_outside_ssot
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: no_stringly_typed_ids_outside_ssot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0009
preserved_exact_tokens:
- INV-007 -- No stringly-typed IDs outside SSOT
- Tool IDs
- UICommand IDs
- ConfigKey names
- schema IDs
- ad-hoc string literals
- defined once
- SSOT
negative_constraints:
- Stable IDs MUST NOT be re-invented as ad-hoc string literals in multiple places.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
```

### AI-012 - GitHub Operations Are API Only

```yaml
plan_unit_id: AI-012
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: GitHub hosting, auth, repo, fork, and PR operations use the GitHub HTTPS API only; the GitHub CLI gh MUST
  NOT be used for these operations.
gui_related: false
gui_classification_reason: This unit covers GitHub API integration policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_operations_are_api_only
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: github_operations_api_only
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0010
preserved_exact_tokens:
- INV-008 -- GitHub operations are API-only
- GitHub hosting/auth/repo/fork/PR operations
- GitHub HTTPS API
- GitHub CLI
- gh
negative_constraints:
- The GitHub CLI (`gh`) MUST NOT be used for GitHub hosting/auth/repo/fork/PR operations.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-013 - Cursor Transport Provider Facade

```yaml
plan_unit_id: AI-013
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Cursor supports stream-json and ACP transports behind one Provider facade, and consumers MUST NOT branch on
  transport type.
gui_related: false
gui_classification_reason: This unit covers provider transport abstraction, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cursor_transport_provider_facade
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: cursor_transport_provider_facade
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0011
preserved_exact_tokens:
- INV-009 -- Cursor transport is invisible to consumers
- stream-json
- ACP
- Provider facade
- transport type
negative_constraints:
- Consumers MUST NOT branch on transport type.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/CLI_Bridged_Providers.md'
```

### AI-014 - Platform Naming Compliance

```yaml
plan_unit_id: AI-014
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: The platform name is Puppet Master only, and older naming is referenced only as legacy naming without quoting
  the older name.
gui_related: false
gui_classification_reason: This unit covers platform naming policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: platform_naming_compliance
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: platform_naming_compliance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0012
preserved_exact_tokens:
- INV-010 -- Platform naming compliance
- Puppet Master
- legacy naming
- without quoting the older name
negative_constraints: []
compatibility_only_notes:
- Any older naming must be referred to only as legacy naming without quoting the older name.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:Glossary'
```

### AI-015 - UI Command Dispatch Rule One

```yaml
plan_unit_id: AI-015
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Command ownership follows mutation domain rather than menu location, and the UI layer dispatches only typed
  UICommand envelopes for non-trivial behavior without calling backend services, storage, domain logic, or provider integrations
  directly.
gui_related: true
gui_classification_reason: This unit governs interactive UI command dispatch and user-initiated interaction routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_dispatch_rule_one
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: ui_command_dispatch_rule_one
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0013
preserved_exact_tokens:
- INV-011 -- UI command dispatch only (Rule 1)
- Add to Assistant Chat
- cmd.chat.add_file_reference { project_id, thread_id?, path, line_range? }
- cmd.file
- cmd.terminal.open
- cmd.terminal.show
- typed UICommand envelopes
- UI Command Dispatcher boundary
negative_constraints:
- The UI MUST NOT call backend services, storage, domain logic, or provider integrations directly.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Command ownership follows mutation domain, not menu location.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-1, ContractName:Plans/Contracts_V0.md#7-uicommand,
  ContractName:Plans/UI_Command_Catalog.md'
```

### AI-016 - Wiring Matrix Rule Two Coverage

```yaml
plan_unit_id: AI-016
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: UI command coverage keeps the command catalog, wiring matrix, examples, and templates mechanically consistent
  so catalog examples, command templates, and wiring rows cannot drift into miswired surfaces.
gui_related: true
gui_classification_reason: This unit governs UI command catalog and wiring matrix consistency for interactive surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_rule_two_coverage
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: wiring_matrix_rule_two_coverage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0014
preserved_exact_tokens:
- INV-012 -- Wiring matrix coverage (Rule 2)
- Plans/UI_Command_Catalog.md
- command/catalog/template/example integrity
- catalog examples
- command templates
- wiring rows
- miswired
negative_constraints:
- Command catalog, wiring matrix, examples, and templates must not drift from each other.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs: []
```

### AI-017 - Pre Dispatch Tool Validation

```yaml
plan_unit_id: AI-017
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: policy.may_execute_tool() is required for every tool dispatch at every nesting depth, regardless of child-run,
  plugin path, provider surface, or shell bridge; direct calls to tool implementations without this permission gate are prohibited.
gui_related: false
gui_classification_reason: This unit covers permission/tool dispatch enforcement, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pre_dispatch_tool_validation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: pre_dispatch_tool_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0015
preserved_exact_tokens:
- INV-013 -- Pre-dispatch tool validation
- policy.may_execute_tool()
- every tool dispatch
- every nesting depth
- child-run
- plugin path
- provider surface
- shell bridge
- direct calls
negative_constraints:
- No child-run, plugin path, provider surface, or shell bridge may bypass policy.may_execute_tool().
- Direct calls to tool implementations without this permission gate are prohibited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md'
- 'ContractRef: Invariant:INV-013, ContractName:Plans/Architecture_Invariants.md'
```

### AI-018 - Shared Mutable State Lock Invariant

```yaml
plan_unit_id: AI-018
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Any mutable data structure shared across threads or async tasks requires RwLock, RWMutex, or equivalent protection;
  lock-free approaches require formal justification, and silent data races are prohibited, including permission state mutations
  in Permissions_System EXEC paths.
gui_related: false
gui_classification_reason: This unit covers concurrency and mutable state safety, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shared_mutable_state_lock_invariant
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: shared_mutable_state_lock_invariant
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0017
preserved_exact_tokens:
- INV-014 -- Shared mutable state requires RWMutex
- RwLock
- RWMutex
- lock-free
- formally justified
- Silent data races
- Permission state mutations
- Permissions_System
negative_constraints:
- Silent data races are prohibited.
- Lock-free approaches are allowed only when formally justified.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: Invariant:INV-014'
```

### AI-019 - Monetary Values Are Microdollars

```yaml
plan_unit_id: AI-019
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Persisted and in-memory monetary cost values are stored and accumulated as integer microdollars u64; float
  storage is forbidden, cost_usd is display-derived only, and linting rejects f64/f32 fields named cost*, price*, or amount*
  in persisted structs.
gui_related: false
gui_classification_reason: This unit covers usage/cost data representation, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: monetary_values_are_microdollars
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: monetary_values_are_microdollars
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0019
preserved_exact_tokens:
- INV-015 -- Monetary values are integer microdollars
- integer microdollars
- u64
- Float types
- cost_usd
- cost_microdollars / 1_000_000
- clippy
- cost*
- price*
- amount*
negative_constraints:
- Float types MUST NOT be used for cost storage or accumulation at any layer.
- cost_usd is derived display copy only and never a persisted billing field.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: Invariant:INV-015'
```

### AI-020 - Token Buckets Are Not Storage Aggregated

```yaml
plan_unit_id: AI-020
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Usage records store or explicitly represent UF-085 buckets input_total, input_non_cached, cache_read,
  cache_write, cache_write_1h/cache_write_ttl where exposed, output_total, output_visible, reasoning/thoughts,
  provider_total, and context_estimate individually, derive total_tokens without losing bucket detail or double-counting
  provider-inclusive fields, treat legacy input_tokens/output_tokens/cache_read_input_tokens/cache_creation_input_tokens/
  reasoning_tokens as compatibility aliases, and prohibit pre-aggregation or collapsing at the storage or event layer.
gui_related: false
gui_classification_reason: This unit covers usage event/storage schema, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: token_buckets_are_not_storage_aggregated
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: token_buckets_not_storage_aggregated
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0021
preserved_exact_tokens:
- INV-016 -- Token fields are never aggregated at storage layer
- input_tokens
- output_tokens
- cache_read_input_tokens
- cache_creation_input_tokens
- reasoning_tokens
- total_tokens
- token-bucket
- AGGREGATES
negative_constraints:
- Pre-aggregation or collapsing at the storage or event layer is prohibited.
- Provider records that AGGREGATES into fewer persisted DB fields are non-canonical.
- Legacy token names must not be presented as canonical UsageRecord fields.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: Invariant:INV-016'
```

### AI-021 - Durable Atomic Replacement And Exact-replace Recovery

```yaml
plan_unit_id: AI-021
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: >-
  Durable atomic replacement stages in the target directory, fsyncs content, renames or replaces, and fsyncs the affected parent directory before success; managed rewrites re-check read_revision and abort concurrent_edit_conflict on drift, while FileSafe exact-replace recovery remains a journaled logical transaction with verified rollback and restart reconciliation rather than a claimed whole-tree atomic rename.
gui_related: false
gui_classification_reason: This unit covers FileSafe mutation safety, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- Durable success is impossible before staged-content fsync, rename or replace, and affected-parent-directory fsync complete.
- Safe-point and Chat-revert exact replacement uses the FileSafe-owned journal, rollback equality, and restart reconciliation without claiming portable whole-tree rename atomicity.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: filesafe_atomic_mutation_pattern
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: filesafe_atomic_mutation_pattern
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0022
- Case-L:L-029
- Case-L:PD-RSP-01
preserved_exact_tokens:
- INV-017 -- Durable atomic replacement and exact-replace recovery
- temp file
- fsync
- rename
- parent directory
- exact-replace
- restore_recovery_required
- os.WriteFile
- read_revision
- concurrent_edit_conflict
- MUST CHANGE
negative_constraints:
- Direct os.WriteFile or equivalent non-atomic write calls MUST NOT be used for managed files.
- Any missing path is a MUST CHANGE item, not an implementation preference.
- Do not report durable success before the affected parent directory is synchronized.
- Do not describe a multi-path FileSafe restore as a portable whole-tree atomic rename.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: Invariant:INV-017'
```

### AI-022 - SeglogFrameV2 Integrity And Deterministic Recovery

```yaml
plan_unit_id: AI-022
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: >-
  SeglogFrameV2 independently validates prefix, bounded header metadata, and payload; recovery resynchronizes only through a completely validated boundary, distinguishes active-tail truncation, active non-tail corruption, and immutable closed-segment corruption, preserves exact or bounded loss units, and rebuilds derived projections from the deterministic survivor set without calling acknowledged canonical loss clean.
gui_related: false
gui_classification_reason: This unit covers storage/seglog integrity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- Bit-flip and partial-frame fixtures distinguish one validated bad frame, active-tail truncation, active non-tail corruption, and closed-segment corruption without rewriting closed source bytes.
- Acknowledged canonical loss retains degraded health and blocks mutation when its extent is unknown or mutation-authorizing.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: seglog_crc32_recovery
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: seglog_crc32_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0024
- Case-L:L-004
- Case-L:L-026
preserved_exact_tokens:
- INV-018 -- Seglog frame integrity and deterministic recovery are mandatory
- SeglogFrameV2
- CRC32 checksum
- prefix_crc32
- active tail
- closed-segment corruption
- survivor set
- projection_health
negative_constraints:
- Silently processing a corrupt record is prohibited.
- Do not treat every checksum failure as one skippable record.
- Do not rewrite a damaged closed segment in place or promote a projection to recovery authority.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: Invariant:INV-018'
```

### AI-023 - Interactive Element Command Mapping

```yaml
plan_unit_id: AI-023
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Every interactive UI element maps to exactly one UICommandID, the mapping is recorded in the wiring matrix,
  every catalog UICommandID has a registered handler, and missing wiring entries or handlers are prohibited.
gui_related: true
gui_classification_reason: This unit governs interactive UI element mapping, wiring matrix coverage, and handlers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interactive_element_command_mapping
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: interactive_element_command_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0024
preserved_exact_tokens:
- Every interactive UI element
- exactly one UICommandID
- wiring matrix
- Plans/Wiring_Matrix.schema.json
- registered handler
- No interactive element
- no catalog command
negative_constraints:
- No interactive element may exist without a wiring matrix entry; no catalog command may lack a handler.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-2, SchemaID:Wiring_Matrix.schema.json,
  Gate:GATE-010'
```

### AI-024 - Contract Driven Code Generation

```yaml
plan_unit_id: AI-024
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Plans/*.schema.json files are canonical sources for validation and optional code generation, and generated
  Rust code lives under one generated/ boundary that is not hand-edited.
gui_related: false
gui_classification_reason: This unit covers schema/codegen DRY policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: contract_driven_code_generation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: contract_driven_code_generation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0025
preserved_exact_tokens:
- Contract-driven code generation (lightweight; DRY)
- Plans/*.schema.json
- canonical source
- validation
- code generation
- generated/
- MUST NOT be hand-edited
negative_constraints:
- Generated Rust code MUST live under a single generated/ boundary and MUST NOT be hand-edited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- 'ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§2'
```

### AI-025 - GATE 003 Non UI Invariant Checks

```yaml
plan_unit_id: AI-025
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: GATE-003 validates schemas and enforces INV-008 GitHub API-only operations and INV-010 naming compliance in
  Plans and relevant implementation surfaces.
gui_related: false
gui_classification_reason: This unit covers non-UI automated governance checks, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gate_003_non_ui_invariant_checks
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: gate_003_non_ui_invariant_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0026
preserved_exact_tokens:
- Validation (gated; autonomous)
- GATE-003
- Validate schemas
- plan graph
- evidence
- change budget
- auto decisions
- INV-008
- GitHub CLI usage
- INV-010
- naming compliance
negative_constraints:
- GitHub CLI usage must be enforced out of build-governing docs and implementation surfaces where INV-008 applies.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Gate:GATE-001'
- 'ContractRef: Invariant:INV-008'
- 'ContractRef: Invariant:INV-010'
- 'ContractRef: Gate:GATE-003'
```

### AI-026 - GATE 003 UI Invariant Checks

```yaml
plan_unit_id: AI-026
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: GATE-003 enforces INV-011 by verifying no UI code directly calls backend, storage, or provider modules, and
  enforces INV-012 plus GATE-010 wiring coverage for UICommandID handlers and interactive element wiring entries.
gui_related: true
gui_classification_reason: This unit governs UI static analysis/import-graph checks and wiring coverage gates.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gate_003_ui_invariant_checks
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: gate_003_ui_invariant_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0026
preserved_exact_tokens:
- INV-011
- no UI code directly calls backend/storage/provider modules
- static analysis
- import-graph check
- INV-012
- wiring matrix coverage
- every UICommandID
- handler entry
- every interactive element
- GATE-010
negative_constraints:
- UI code must not directly call backend/storage/provider modules when enforcing INV-011.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-011'
- 'ContractRef: Invariant:INV-012, Gate:GATE-010'
- 'ContractRef: Gate:GATE-003'
```

### AI-027 - Debug Overlay Is Not Runtime Mode

```yaml
plan_unit_id: AI-027
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: The Debug addendum preserves that debug exists only in overlay identity and UI label state; the canonical
  runtime-mode enum remains ask, plan, regular, and yolo.
gui_related: true
gui_classification_reason: This unit covers UI label state and debug overlay presentation semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_overlay_is_not_runtime_mode
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: debug_overlay_not_runtime_mode
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0028
preserved_exact_tokens:
- Debug investigation invariants addendum (2026-03-23)
- Invariant A -- Debug overlay is not a runtime mode
- debug
- overlay identity
- UI label state
- ask | plan | regular | yolo
negative_constraints:
- debug MUST exist only in overlay identity and UI label state; it must not become a runtime-mode enum value.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md'
```

### AI-028 - Visible Evidence Ingress Only

```yaml
plan_unit_id: AI-028
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Automatically collected Debug evidence becomes visible Investigation Context or Runtime Artifacts state, and
  PM MUST NOT rely on hidden prompt-only evidence injection for browser or debug payloads.
gui_related: false
gui_classification_reason: This unit covers evidence ingress and prompt/storage boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visible_evidence_ingress_only
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: visible_evidence_ingress_only
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0029
preserved_exact_tokens:
- Invariant B -- Visible evidence ingress only
- Automatically collected Debug evidence
- Investigation Context
- Runtime Artifacts state
- hidden prompt-only evidence injection
- browser/debug payloads
negative_constraints:
- PM MUST NOT rely on hidden prompt-only evidence injection for browser/debug payloads.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md'
```

### AI-029 - Cross Surface Investigation Identity

```yaml
plan_unit_id: AI-029
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Any surface that participates in debugging preserves investigation_id and optional instrumentation_id instead
  of minting uncorrelatable surface-local debug identities.
gui_related: false
gui_classification_reason: This unit covers investigation identity correlation, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_surface_investigation_identity
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: cross_surface_investigation_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0030
preserved_exact_tokens:
- Invariant C -- Cross-surface investigation identity
- investigation_id
- instrumentation_id
- surface-local debug identities
- correlated later
negative_constraints:
- Participating debug surfaces must not mint surface-local debug identities that cannot be correlated later.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/orchestrator-subagent-integration.md'
```

### AI-030 - Runtime Identity Packet Continuity

```yaml
plan_unit_id: AI-030
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Canonical runtime identity and blocked-state policy survive dispatch, restart recovery, approval, and usage
  attribution; execution_role, requested_account_id, requested/effective operational identity, account-switch lineage, blocked_sequence,
  DAE jail posture, approval posture, usage switch-history, and execution-role follow-through remain continuous across retries,
  resumes, restores, and recovered attempts.
gui_related: false
gui_classification_reason: This unit covers runtime identity packet continuity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_packet_continuity
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: runtime_identity_packet_continuity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0031
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- INV-019 -- Runtime identity and blocked-policy continuity
- execution_role
- requested_account_id
- requested/effective operational identity
- account-switch lineage
- blocked_sequence
- DAE jail posture
- approval posture
- usage switch-history
- execution-role follow-through
negative_constraints:
- Canonical runtime identity and blocked-state policy MUST survive dispatch, restart recovery, approval, and usage attribution
  without being reminted or collapsed into provider-native aliases.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-031 - Frozen Runtime State Summary Consumers

```yaml
plan_unit_id: AI-031
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Cross-surface consumers reuse frozen runtime state-summary fields effective_health_state, effective_pressure_state,
  and effective_resolution_outcome with scheduler vocabulary instead of inventing local phrasing.
gui_related: true
gui_classification_reason: This unit governs user-visible cross-surface state phrasing and status display fields.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: frozen_runtime_state_summary_consumers
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: frozen_runtime_state_summary_consumers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- state-summary
- effective_health_state
- effective_pressure_state
- effective_resolution_outcome
- scheduler vocabulary
- Agent-Config
- Health
- Usage
- live current values
negative_constraints:
- Cross-surface consumers must not invent local phrasing for frozen runtime state-summary fields.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-032 - Recovery Safe Points And Owner Constraints

```yaml
plan_unit_id: AI-032
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: >-
  Runtime recovery preserves safe-point versus restore-point boundaries, attempt and restore identity, projection authority, and owner separation; a restore-required blocked episode publishes its safe point, snapshot refs, and recovery anchor as one durability unit, cleanup follows live reference holds, release is limited to the three owner terminal dispositions, and missing or corrupt recovery material remains recovery_unavailable, blocked, anchored, and locally preserved.
gui_related: false
gui_classification_reason: This unit covers recovery and owner-contract invariants, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- A live active-attempt, blocked-episode, restore-transaction, preserved-run, or legal-hold ref makes the safe point and every custody dependency cleanup-ineligible.
- Anchor release occurs only for resolved, superseded_with_verified_successor, or explicit abandoned_by_user, and missing/corrupt recovery material never releases by age or cleanup.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: recovery_safe_points_and_owner_constraints
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: recovery_safe_points_owner_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
- Case-L:L-010
- Case-L:PD-L010-01..PD-L010-03
- Case-L:PD-RSP-06
preserved_exact_tokens:
- safe-point vs restore-point
- graph-lock
- classification-before-policy
- checkpoint-derived
- attempt-boundary
- Plans/FileSafe.md
- context_files
- fail-open
- recovery_options[]
- allowed_action_ids[]
- mtime-based
- attempt-lineage
- provider-pool
- recovery_anchor_record
- recovery_unavailable
- superseded_with_verified_successor
- abandoned_by_user
negative_constraints:
- Owner docs must not keep same-doc contradictions around attempt reuse, DAE/FileSafe authority, cleanup-vs-safe-point validity,
  or blocked-recovery payload fields.
- Age, archive, process exit, run completion, or worktree unbinding MUST NOT release the last legal recovery path.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FileSafe remains the DAE enforcement owner for post-approval arg mutation, context_files write-scope widening, fail-open
  initialization paths, and recovery_options[] vs allowed_action_ids[] schema drift.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-033 - Runtime Governance Layer And Gate Visibility

```yaml
plan_unit_id: AI-033
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Runtime governance is a governance-layer invariant with Decision_Policy, Permissions_System, Contracts_V0,
  scheduler lane ordering, and mutation-safe-point ownership, and runtime /governance verification must be visible to numbered
  gates and script-enforcement tables.
gui_related: false
gui_classification_reason: This unit covers governance and validation surfaces, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_governance_layer_and_gate_visibility
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: runtime_governance_layer_gate_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- governance-layer
- Plans/Decision_Policy.md
- corroboration
- promotion
- Plans/Permissions_System.md
- requested/effective identity model
- scheduler lane ordering
- mutation-safe-point
- Runtime /governance
- numbered gates
- script-enforcement tables
negative_constraints:
- Mandatory runtime governance checks cannot remain real only in addendum prose while invisible to gate registries.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Decision_Policy owns concern, corroboration, promotion, authority, and lifecycle rules consumed by runtime governance.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-034 - Route Consuming Command Wrappers

```yaml
plan_unit_id: AI-034
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Cross-surface UI command wrappers such as artifact, orchestrator, and panel-switch commands remain navigation-like
  route consumers only when they normalize through canonical route/runtime objects rather than publishing local runtime semantics.
gui_related: true
gui_classification_reason: This unit governs UI command wrappers and navigation-like route consumers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: route_consuming_command_wrappers
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: route_consuming_command_wrappers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- cmd.artifacts.show_in_ledger
- cmd.artifacts.show_in_usage
- cmd.orchestrator.open_in_source_control
- cmd.orchestrator.open_in_github_actions
- cmd.orchestrator.open_in_docker_manager
- cmd.panel.switch
- navigation-like
- canonical route/runtime objects
negative_constraints:
- Local pages must not publish independent Orchestrator or runtime semantics before route consumers reconcile through canonical
  route/runtime objects.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-035 - Graph Artifact Stale Consumer Reconciliation

```yaml
plan_unit_id: AI-035
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Run Graph and Runtime Artifacts remain required consumers for receipt/usage identity, projection-trust hooks,
  producer identity, trust/provenance, and cross-surface linkage, while stale tier-era mirrors in Run_Graph_View and Orchestrator_Page
  must reconcile before surfacing runtime truth.
gui_related: true
gui_classification_reason: This unit covers user-visible graph/artifact consumers and stale runtime display reconciliation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: graph_artifact_stale_consumer_reconciliation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: graph_artifact_stale_consumer_reconciliation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- Plans/Run_Graph_View.md
- Plans/Runtime_Artifacts_Panel.md
- receipt/usage identity
- projection-trust
- producer identity
- trust/provenance
- cross-surface linkage
- Plans/Orchestrator_Page.md
- stale tier-era aggregation
negative_constraints:
- Runtime artifact or graph consumers must not replace receipt/usage identity, projection-trust, producer identity, trust/provenance,
  or cross-surface hooks with local pivots.
compatibility_only_notes: []
stale_retired_dispositions:
- Strong stale consumers for this runtime identity cluster are Plans/Run_Graph_View.md and Plans/Orchestrator_Page.md; their
  mirrors must reconcile to these invariants.
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-036 - Route Transport And Object Kind Identity

```yaml
plan_unit_id: AI-036
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: resume_url remains serialized deep-link transport only; attention flows, search, command routing, CtA restoration,
  and route-target recovery resolve through canonical route_target or subject identity first, tier_id is only derived compatibility
  metadata, and object_kind carries most cross-surface identity work.
gui_related: true
gui_classification_reason: This unit affects user-visible navigation, search, attention, CtA, and route restoration behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: route_transport_and_object_kind_identity
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: route_transport_object_kind_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- resume_url
- deep-link
- route_target
- subject identity
- /CtA
- route-target
- highest-value focus recovery
- tier_id
- object_kind
- cross-surface identity
negative_constraints:
- A URL may carry a target but must not be stronger or more exact than the owner route contract.
- New route consumers must prefer owner-defined object kinds over ad hoc route fields.
compatibility_only_notes:
- tier_id may survive only as derived display/grouping compatibility metadata.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-037 - Bridged Provider And Content Identity Contracts

```yaml
plan_unit_id: AI-037
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Bridged-provider normalized events require a versioned correlation block with actor, thread, attempt, and
  lineage refs; subject_id remains frozen to canonical families until a new cross-surface content identity is proven, and
  orchestrator.receipt remains a bridge record rather than an identity substitute.
gui_related: false
gui_classification_reason: This unit covers provider/content identity contracts, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: bridged_provider_and_content_identity_contracts
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: bridged_provider_content_identity_contracts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- bridged-provider
- versioned correlation block
- actor/thread/attempt/lineage refs
- /thread/attempt/lineage
- subject_id
- cross-surface content identity
- orchestrator.receipt
- bridge record
negative_constraints:
- orchestrator.receipt must not substitute for canonical cross-surface identity families.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-038 - Worktree Source Control Runtime Visibility

```yaml
plan_unit_id: AI-038
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: WorktreeGitImprovement already owns the source-control product boundary, and worktree plus Source Control
  surfaces retarget stale identity anchors to runtime route identity while PM-managed worktree roots appear through Source
  Control / Orchestrator visibility contracts instead of hidden side roots.
gui_related: true
gui_classification_reason: This unit governs Source Control and Orchestrator user-visible worktree visibility.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_source_control_runtime_visibility
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: worktree_source_control_runtime_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- Plans/WorktreeGitImprovement.md
- WorktreeGitImprovement.md
- source-control surface boundary
- identity anchor
- runtime route identity
- PM-managed worktree visibility
- managed Unraid template repos
- live-run artifact directories
- Source Control / Orchestrator
negative_constraints:
- PM-owned git or /file roots must not remain hidden side roots outside Source Control / Orchestrator worktree visibility
  contracts.
compatibility_only_notes: []
stale_retired_dispositions:
- The stale part of WorktreeGitImprovement is the identity anchor, not the product boundary.
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-039 - Legacy Tier Event And Usage Evidence Demotion

```yaml
plan_unit_id: AI-039
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Consumers must not mix canonical blocked, scheduler, remediation lineage, or /scheduler/remediation lineage
  with legacy tier-event push streams, and usage/evidence families move away from tier-first correlation toward usage-event
  or node/attempt identity as primary.
gui_related: true
gui_classification_reason: This unit affects user-visible status, usage, ledger, runtime, and graph inspection surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: legacy_tier_event_and_usage_evidence_demotion
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: legacy_tier_event_usage_evidence_demotion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- legacy `tier-event`
- blocked
- scheduler
- remediation
- /scheduler/remediation
- tier-first
- Usage/Ledger navigation
- usage-event identity
- runtime and graph inspectors
- node/attempt identity
negative_constraints:
- Consumer docs must not mix canonical blocked/scheduler/remediation lineage with legacy tier-event push streams.
compatibility_only_notes:
- Usage/evidence families must demote tier-first cross-surface correlation in favor of usage-event or node/attempt identity.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-040 - Runtime Chat Boundary And Owner First Repair

```yaml
plan_unit_id: AI-040
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Runtime/chat boundaries avoid over-unify and under-unify behavior, unresolved owner gaps remain owner obligations,
  and owner docs plus rewrite-root routing are repaired before primary stale consumers or checklist mirrors update.
gui_related: false
gui_classification_reason: This unit covers owner-first repair and runtime/chat boundary policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_chat_boundary_and_owner_first_repair
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: runtime_chat_boundary_owner_first_repair
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- over-unify
- under-unify
- builder/interview/chat
- /interview/chat
- /account/runtime
- /session
- safe-point cleanup ordering
- OpenCode server/session limits
- project/session browser ownership
- attention-center ownership
- runtime-recovery
- plugin `/skill/formatter`
- rewrite-root
- /checklist
negative_constraints:
- Runtime/chat boundaries must avoid over-unify and under-unify behavior.
- Cross-cutting owner gaps must not be republished as local consumer behavior.
compatibility_only_notes: []
stale_retired_dispositions:
- Owner docs and rewrite-root routing are repaired before primary stale consumers, and mirror /checklist followers update
  only after owners settle.
owner_boundary_notes:
- Owner gaps remain invariant obligations until resolved by their owner docs.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-041 - Project Activation Import And Visible Ambiguity

```yaml
plan_unit_id: AI-041
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: 'Puppet Master remains one extensible platform with project-driven capability activation: project-open detection/import
  runs before activation, project signals drive language/framework/build/review/remote/LSP/search/source-control capability
  packs, and ambiguous interpretations are visible, recorded, and overridable.'
gui_related: true
gui_classification_reason: This unit affects user-visible project activation, alternatives, defaults, and override behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_activation_import_and_visible_ambiguity
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: project_activation_import_visible_ambiguity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0033
preserved_exact_tokens:
- INV-020 -- Project-driven capability activation
- bench-03
- one extensible platform
- Project-open detection/import
- language markers
- framework files
- build/run metadata
- hosted-repository state
- remote-host state
- capability packs/modules
- Ambiguity MUST be visible and overridable
negative_constraints:
- Puppet Master MUST remain one extensible platform, not separate hard-forked products or rigid personalities.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md,
  ContractName:Plans/storage-plan.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/BinaryLocator_Spec.md'
```

### AI-042 - Index Sync Degraded State And Shared Shell Workflow

```yaml
plan_unit_id: AI-042
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Indexing and external-model sync are first-class bounded background subsystems that disclose reduced-capability/degraded-mode
  state while warming, and diff/review/hosted-repository workflows compose inside the shared IDE shell rather than becoming
  separate ad hoc tools.
gui_related: true
gui_classification_reason: This unit affects user-visible readiness, degraded-mode disclosure, and IDE shell workflow composition.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: index_sync_degraded_state_and_shared_shell_workflow
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: index_sync_degraded_state_shared_shell
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0033
preserved_exact_tokens:
- Indexing
- external-model sync
- reduced-capability/degraded-mode state
- bounded/reused
- startup
- large-workspace responsiveness
- diff/review/hosted-repository workflows
- same shell
- Source Control
- Problems
- Search
negative_constraints:
- Affected features must not pretend full readiness while indexes or external model/capability reports are still synchronizing.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md,
  ContractName:Plans/storage-plan.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/BinaryLocator_Spec.md'
```

### AI-043 - Remote Attachment And Lazy Module Activation

```yaml
plan_unit_id: AI-043
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Remote projects use a thin local client/launcher with backend attachment and version management, while plugins/modules
  load lazily and stay scoped to activated capabilities without unbounded startup work, hidden dependency chains, or duplicate
  project-detection logic.
gui_related: false
gui_classification_reason: This unit covers remote/module architecture and startup dependency policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: remote_attachment_and_lazy_module_activation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: remote_attachment_lazy_module_activation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0033
preserved_exact_tokens:
- Remote architecture
- thin local client/launcher
- backend attachment/version management
- host identity
- helper-binary version
- connection health
- requested/effective capability state
- Plugin/module breadth
- dynamic-loading dependency debt
- loaded lazily
- unbounded startup work
- duplicate project-detection logic
negative_constraints:
- Module activation must not create unbounded startup work, hidden dependency chains, or duplicate project-detection logic.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md,
  ContractName:Plans/storage-plan.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/BinaryLocator_Spec.md'
```

### AI-044 - Dependency Driven Seam Reconciliation Order

```yaml
plan_unit_id: AI-044
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Reconciliation work converts research into implementation-ready decisions seam-by-seam in dependency-driven
  order, preserving canonical seam labels, owner mapping, shell/identity/routing first, explicit owner docs, consumer docs,
  unresolved risk, acceptance guidance, and package/seam/node/lane/attempt addressing instead of rigid phase/task/subtask
  paths.
gui_related: false
gui_classification_reason: This unit covers planning/reconciliation order and addressing, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dependency_driven_seam_reconciliation_order
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: dependency_driven_seam_reconciliation_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0034
preserved_exact_tokens:
- INV-021 -- Dependency-driven seam reconciliation order
- seam-shell-identity-routing
- seam-editor-core
- seam-diff-review-source-control
- seam-file-manager
- seam-search
- seam-preview-browser
- seam-lsp-indexing-autodetect
- seam-ssh-remote
- seam-terminal-runtime-environment
- seam-cross-cutting
- seam-reconciliation-synthesis
- <phase>/<task>/<subtask>
- package, seam, node, lane, and attempt identity
negative_constraints:
- Addressing cannot assume rigid <phase>/<task>/<subtask> paths when package/seam architecture is active.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Each seam must leave explicit owner docs, consumer docs, unresolved risk if any, and implementation-ready acceptance guidance
  before moving out of reconciliation.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-045 - Native Workbench Service Bound Evidence

```yaml
plan_unit_id: AI-045
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Puppet Master keeps a PM-native Rust plus Slint service-bound workbench architecture, preserving benchmark/research
  lineage for service boundaries, collaborative room constraints, degraded/indexing/remote/offline/requested-vs-effective
  state visibility, and the anti-delegated-core rule from implementation-reference synthesis.
gui_related: true
gui_classification_reason: This unit covers native workbench product architecture and Slint shell/workbench UI constraints.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_workbench_service_bound_evidence
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: native_workbench_service_bound_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- INV-022 -- Service-bound native workbench architecture
- bench-01
- bench-04
- bench-09
- bench-17
- bench-21
- bench-29
- bench-32
- bench-10
- bench-30
- Rust/Tauri
- Slint shell/workbench UI
- fleet-synthesis
- research_summaries
- implementation_ref_findings
- implementation_ref_summaries
- 32-target implementation-reference fleet
- hidden delegated-backend ownership
negative_constraints:
- Puppet Master must avoid hidden delegated-backend ownership of core workbench state.
compatibility_only_notes: []
stale_retired_dispositions:
- Thin-editor/wrapper and IDE-shell lessons are bounded implementation tactics inside PM-native Rust + Slint architecture,
  not direct architecture foundations.
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-046 - UI Responsiveness And Background Service Projections

```yaml
plan_unit_id: AI-046
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Editor/view responsiveness stays separate from heavier file walking, git, indexing, remote RPC, PTY/runtime,
  and provider services; Git/SCM subprocess work is never an editor or UI hot-path dependency, and editor/file surfaces consume
  coalesced background projections with explicit revalidation before mutation.
gui_related: true
gui_classification_reason: This unit governs UI/editor responsiveness, source-control projections, and user-visible file/editor
  surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_responsiveness_and_background_service_projections
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: ui_responsiveness_background_service_projections
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- Editor/view responsiveness
- latency-sensitive
- file walking
- git
- indexing
- remote RPC
- PTY/runtime
- provider-dispatched services
- background worker/proxy
- Git/SCM subprocess
- UI hot-path dependency
- coalesce
- budget
- explicit revalidation
negative_constraints:
- Git/SCM subprocess work is never an editor or UI hot-path dependency.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Source Control and worktree services own SCM refresh projections; editor/file surfaces consume projections and request explicit
  revalidation before mutation.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-047 - Platform Adapter Seam

```yaml
plan_unit_id: AI-047
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: OS-facing behavior is an explicit platform adapter seam for open/reveal, dialogs, drag/drop, file watching,
  URL handoff, path normalization, process/PTY integration, native dialogs, trash behavior, keychain/credential access, symlink/case
  sensitivity, clipboard, IME, accessibility bridges, and browser/webview embedding.
gui_related: true
gui_classification_reason: This unit affects user-visible native OS integration, dialogs, drag/drop, clipboard, accessibility,
  and embedded browser/webview behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: platform_adapter_seam
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: platform_adapter_seam
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- OS-facing behavior
- Open/reveal
- dialogs
- drag/drop
- file watching
- URL handoff
- path normalization
- process/PTY integration
- platform adapters
- native dialogs
- trash behavior
- keychain/credential access
- symlink
- case-sensitivity
- clipboard/IME/accessibility
- browser/webview embedding
negative_constraints:
- OS-facing behavior must not be implemented as scattered per-view shortcuts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-048 - Shared Rust Core Ownership

```yaml
plan_unit_id: AI-048
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: The shared Rust core owns typed resource identity, buffer/text model, save/recovery/on-disk transactions,
  watcher/invalidation normalization, ignore policy, search/indexing/autodetection, LSP brokering, diff/review engine, preview
  session state, terminal/runtime state, remote/session state machine, command routing, and persistence schemas.
gui_related: false
gui_classification_reason: This unit covers core service ownership, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shared_rust_core_ownership
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: shared_rust_core_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- Resource identity
- workspace file
- scratch/history/generated/remote/session-bound resource
- provider-owned runtime object identity
- shared Rust core
- buffer/text model
- save/recovery/on-disk change transactions
- watcher/invalidation normalization
- ignore policy
- search/indexing/autodetection
- LSP brokering
- diff/review engine
- preview session state
- terminal/runtime state
- remote/session state machine
- command routing
- persistence schemas
negative_constraints:
- Resource identity must not be inferred from view placement or path strings alone.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The shared Rust core owns cross-surface core services while platform adapters own OS specifics.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-049 - Ignore Search Index Invalidation And Storage Isolation

```yaml
plan_unit_id: AI-049
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Ignore handling, search/index walks, and tree visibility share one deliberate policy layer; watchers, remote
  notifications, and provider streams are invalidation signals only; search/index storage follows storage-isolation and no-secrets-in-storage
  with remote-build, local-query, and remote-verify for remote non-Git Instant Grep.
gui_related: false
gui_classification_reason: This unit covers search/index/storage policy and invalidation semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ignore_search_index_invalidation_and_storage_isolation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: ignore_search_index_invalidation_storage_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- Ignore handling
- search/index walks
- tree visibility
- File Manager
- Search
- LSP/indexing
- Source Control
- preview surfaces
- invalidation signals
- bounded reconciliation
- storage-isolation
- no-secrets-in-storage
- regex index
- sparse n-gram postings
- dirty layer
- remote/local cache projections
- remote-build
- local-query
- remote-verify
negative_constraints:
- File Manager, Search, LSP/indexing, Source Control, and preview surfaces cannot diverge silently on ignore/search/index
  visibility.
- File watchers, remote file-change notifications, and provider update streams are invalidation signals, not authoritative
  state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-050 - Service Routing External Adapters And Anti DOM Constraints

```yaml
plan_unit_id: AI-050
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: File/open/search/undo/terminal/diff/preview routing resolves through service-registered/provider seams and
  owner contracts; external engines and CLIs are adapters only; requested-vs-effective state remains explicit; browser-specific
  assumptions such as DOM roots, service-worker persistence, hidden file inputs, Blob downloads, localStorage identity, query-string
  routing, and browser-only clipboard/selection hacks must not shape PM architecture.
gui_related: false
gui_classification_reason: This unit covers service routing, adapter boundaries, and architecture constraints rather than
  GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: service_routing_external_adapters_and_anti_dom_constraints
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: service_routing_external_adapters_anti_dom_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- service-registered/provider-based seams
- owner contract
- External engines and CLIs
- adapters only
- requested-vs-effective state
- /bootstrap/runtime/indexing
- DOM roots
- service-worker persistence
- hidden file inputs
- Blob downloads
- localStorage identity
- query-string routing
- browser-only clipboard/selection hacks
- thin-wrapper
- Electron
- DOM-first
negative_constraints:
- External engines and CLIs may be reused only as adapters inside PM-owned boundaries.
- Browser-specific implementation assumptions must not shape Puppet Master architecture.
- Puppet Master must avoid direct adoption of thin-wrapper, Electron, or DOM-first implementation assumptions as native workbench
  foundations.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-051 - Typed Investigation Budget Exhaustion

```yaml
plan_unit_id: AI-051
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Debug/investigation flows MUST record typed budget exhaustion instead of collapsing every stop into generic
  failed, failed_cleanup, attention_required, failure, or blocked state; lifecycle records may carry budget_kind?, and retry,
  resume, and cleanup surfaces preserve the exact budget_kind? that tripped.
gui_related: false
gui_classification_reason: This unit covers investigation lifecycle state semantics and budget accounting, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: typed_investigation_budget_exhaustion
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: typed_investigation_budget_exhaustion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0036
preserved_exact_tokens:
- INV-023 -- Investigation lifecycle budgets are typed
- typed budget exhaustion
- generic failure
- blocked state
- budget_kind?
- failed
- failed_cleanup
- attention_required
- retry
- resume
- cleanup surfaces
negative_constraints:
- Debug/investigation flows MUST record typed budget exhaustion rather than collapsing every stop into a generic failure or
  blocked state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/FinalGUISpec.md'
```

### AI-052 - Investigation Budget Kinds And Defaults

```yaml
plan_unit_id: AI-052
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Allowed budget_kind? values are target_discovery_attempts, prepare_attempts, instrumentation_passes, invasive_instrumentation_passes,
  fix_candidates, repro_attempts, verification_attempts, package_or_tool_installs, browser_scenario_branches, no_new_evidence_loops,
  active_temporary_instrumentation_lanes, cleanup_retries, attention_required_resume_cycles, and elapsed_wall_time; MVP ceilings
  are max_verification_attempts_per_fix_candidate = 2 and max_package_or_tool_installs = 2, with named keys persisted or exported
  when they affect stop/retry decisions.
gui_related: false
gui_classification_reason: This unit covers investigation budget enumeration and defaults, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: investigation_budget_kinds_and_defaults
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: investigation_budget_kinds_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0036
preserved_exact_tokens:
- target_discovery_attempts
- prepare_attempts
- instrumentation_passes
- invasive_instrumentation_passes
- fix_candidates
- repro_attempts
- verification_attempts
- package_or_tool_installs
- browser_scenario_branches
- no_new_evidence_loops
- active_temporary_instrumentation_lanes
- cleanup_retries
- attention_required_resume_cycles
- elapsed_wall_time
- max_verification_attempts_per_fix_candidate = 2
- max_package_or_tool_installs = 2
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/FinalGUISpec.md'
```

### AI-053 - Package Install Budget Accounting

```yaml
plan_unit_id: AI-053
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Only package or tool installs that persist beyond a single process lifetime count against max_package_or_tool_installs;
  ephemeral per-process installs may be logged as investigation context but do not consume the install budget.
gui_related: false
gui_classification_reason: This unit covers investigation package/tool install budget accounting, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: package_install_budget_accounting
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: package_install_budget_accounting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0036
preserved_exact_tokens:
- package or tool installs
- persist beyond a single process lifetime
- max_package_or_tool_installs
- ephemeral per-process installs
- investigation context
- install budget
negative_constraints:
- Ephemeral per-process installs do not consume max_package_or_tool_installs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/FinalGUISpec.md'
```

### AI-054 - Debug Evidence Plane Separation

```yaml
plan_unit_id: AI-054
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Debug Mode MUST preserve local ephemeral investigation, hosted runtime verification, production/data-plane
  observability, assistant-session diagnostics, terminal/test observe loops, and DAP-grade interactive inspection as distinct
  evidence planes; Devin, Replit, OpenHands, SWE-agent / mini-swe-agent, Cline, Roo Code, Continue, Aider, InspectCoder /
  InspectWare, snooper-ai, and PySnooper remain examples and not collapsed owner models.
gui_related: false
gui_classification_reason: This unit covers debug evidence plane ownership and examples, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_evidence_plane_separation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: debug_evidence_plane_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0037
preserved_exact_tokens:
- INV-024 -- Debug Mode evidence planes stay explicit
- local ephemeral investigation
- hosted runtime verification
- production/data-plane observability
- assistant-session diagnostics
- terminal/test observe loops
- DAP-grade interactive inspection
- Devin
- Replit
- OpenHands
- SWE-agent / mini-swe-agent
- Cline
- Roo Code
- Continue
- Aider
- InspectCoder / InspectWare
- snooper-ai
- PySnooper
negative_constraints:
- Debug Mode MUST preserve evidence planes instead of collapsing them into one owner model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md,
  ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md'
```

### AI-055 - Debug And Deep Plan Overlay Boundaries

```yaml
plan_unit_id: AI-055
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Debug Mode is a chat/workflow overlay and not a new execution-posture enum; assistant-chat-design may expose
  Debug alongside Ask, Agent, Plan, and Deep Plan while Run_Modes keeps runtime posture separate. Deep Plan is single-threaded
  read-only planning and does not create sub-task inheritance or widen child authority.
gui_related: true
gui_classification_reason: This unit covers user-visible Assistant mode labels and overlay behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_and_deep_plan_overlay_boundaries
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: debug_deep_plan_overlay_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0037
preserved_exact_tokens:
- Debug Mode
- chat/workflow overlay
- execution-posture enum
- Plans/assistant-chat-design.md
- Ask
- Agent
- Plan
- Deep Plan
- Plans/Run_Modes.md
- single-threaded read-only planning
- sub-task inheritance
- child authority
negative_constraints:
- Debug Mode must not become a new execution-posture enum.
- Deep Plan does not create a sub-task inheritance path or widen child authority.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- assistant-chat-design owns Debug exposure as a chat/workflow overlay; Run_Modes owns runtime posture.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md,
  ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md'
```

### AI-056 - Debug MVP Authority Seams

```yaml
plan_unit_id: AI-056
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Debug Mode is MVP only when remote targets keep /no-local-fallback, requested /effective capability /state
  stays visible, and seams for investigation_id, instrumentation_id, storage, /contracts/prompt, permissions, and browser
  evidence are explicitly owned rather than inferred from a debug label.
gui_related: false
gui_classification_reason: This unit covers authority seams and target/capability state, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_mvp_authority_seams
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: debug_mvp_authority_seams
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0037
preserved_exact_tokens:
- /no-local-fallback
- requested /effective capability /state
- investigation_id
- instrumentation_id
- storage
- /contracts/prompt
- permissions
- browser evidence
- debug label
negative_constraints:
- Debug authority seams must not be inferred from a debug label.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Remote target, capability, storage, prompt, permission, and browser evidence seams require explicit owners.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md,
  ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md'
```

### AI-057 - Visible Browser Evidence Attachment

```yaml
plan_unit_id: AI-057
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Browser evidence auto-feed must be a visible attach /bundle contract and must not contradict the no hidden
  browser-to-chat injection rule; bounded auto-feed is allowed only through visible Investigation Context state, consented
  attach/revoke affordances, and owner-routed browser capture events.
gui_related: true
gui_classification_reason: This unit governs user-visible browser evidence attach/revoke affordances and Investigation Context
  state.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visible_browser_evidence_attachment
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: visible_browser_evidence_attachment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0037
preserved_exact_tokens:
- browser evidence auto-feed
- visible attach `/bundle` contract
- no hidden browser-to-chat injection rule
- visible Investigation Context state
- consented attach/revoke affordances
- owner-routed browser capture events
negative_constraints:
- Browser evidence auto-feed must not contradict the no hidden browser-to-chat injection rule.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Browser-backed investigation evidence enters through visible owner-routed attach/bundle state, not hidden prompt injection.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md,
  ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md'
```

### AI-058 - Investigation Evidence State And Replay Heuristics

```yaml
plan_unit_id: AI-058
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: In-scope tool-emitted evidence for an active investigation enters Investigation Context as active unless redaction,
  trust, or /truncation policy narrows it; out-of-scope evidence remains referenced or rejected instead of silently injected.
  Exported or replayed Debug verification evidence carries heuristic_version = debug_verify.v1, and future debug_verify tuning
  increments or preserves heuristic_version.
gui_related: false
gui_classification_reason: This unit covers evidence state, redaction/trust/truncation policy, and replay metadata, not GUI
  behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: investigation_evidence_state_and_replay_heuristics
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: investigation_evidence_state_replay_heuristics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0037
preserved_exact_tokens:
- tool-emitted evidence
- Investigation Context
- active
- redaction
- trust
- /truncation
- referenced or rejected
- silently injected
- heuristic_version = debug_verify.v1
- debug_verify
- exported or replayed
negative_constraints:
- Out-of-scope evidence remains referenced or rejected instead of being silently injected.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md,
  ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md'
```

### AI-059 - Provider Profiles Are Runtime Isolated

```yaml
plan_unit_id: AI-059
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: CLI/provider profile mechanisms used for account separation MUST be treated as isolated runtime profiles;
  Cursor --user-data-dir and user-data-dir separation do not authorize sharing auth, cooldown, usage, session history, runtime
  cache, or telemetry state between accounts.
gui_related: false
gui_classification_reason: This unit covers provider/runtime profile isolation, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_profiles_are_runtime_isolated
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: provider_profiles_runtime_isolated
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0038
preserved_exact_tokens:
- INV-025 -- Provider profile isolation is not shared mutable state
- CLI/provider profile mechanisms
- isolated runtime profiles
- Cursor
- --user-data-dir
- user-data-dir
- auth
- cooldown
- usage
- session history
- runtime cache
- telemetry state
negative_constraints:
- user-data-dir profile separation does not authorize sharing auth, cooldown, usage, session history, runtime cache, or telemetry
  state between accounts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/BinaryLocator_Spec.md,
  ContractName:Plans/Permissions_System.md'
```

### AI-060 - Provider Overlay Sharing Requires Owner Contract

```yaml
plan_unit_id: AI-060
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: PM-managed overlays such as instructions, projected PM skills, selected MCP/tool definitions, and selected
  plugins/extensions may be shared only when the provider/runtime contract explicitly allows safe projection and drift handling.
gui_related: false
gui_classification_reason: This unit covers provider/runtime overlay sharing contracts, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_overlay_sharing_requires_owner_contract
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: provider_overlay_sharing_owner_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0038
preserved_exact_tokens:
- PM-managed overlays
- instructions
- projected PM skills
- selected MCP/tool definitions
- selected plugins/extensions
- provider/runtime contract
- safe projection
- drift handling
negative_constraints:
- PM-managed overlays may be shared only when the provider/runtime contract explicitly allows safe projection and drift handling.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider/runtime contracts own safe overlay projection and drift handling.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/BinaryLocator_Spec.md,
  ContractName:Plans/Permissions_System.md'
```

### AI-061 - File Browser Recovery Consumer Routing

```yaml
plan_unit_id: AI-061
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: FileManager consumes file/browser/rendering repairs and MUST NOT keep stale inline visualizer or terminal-action
  assumptions; /browser/rendering behavior stays routed through browser/rendering owners, and terminal-action surfaces remain
  consumers of terminal/runtime contracts.
gui_related: true
gui_classification_reason: This unit affects FileManager, browser/rendering, and terminal-action user-visible surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_browser_recovery_consumer_routing
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: file_browser_recovery_consumer_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- Plans/FileManager.md
- file/browser/rendering repairs
- stale inline visualizer
- terminal-action assumptions
- /browser/rendering
- browser/rendering owners
- terminal-action surface
- terminal/runtime contracts
negative_constraints:
- Plans/FileManager.md MUST NOT keep stale inline visualizer or terminal-action assumptions.
compatibility_only_notes: []
stale_retired_dispositions:
- File/browser/rendering and terminal-action assumptions are stale if they bypass owner routing.
owner_boundary_notes:
- FileManager consumes browser/rendering and terminal/runtime owners instead of re-owning them.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-062 - Firecrawl Billing And Audit UI Ownership

```yaml
plan_unit_id: AI-062
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: FinalGUISpec consumes Firecrawl billing and audit disclosure, and credit-warning plus audit-surface UI copy
  MUST defer to Tools for thresholds, provider billing exceptions, cache/routing disclosure, and web-operation audit payload
  ownership.
gui_related: true
gui_classification_reason: This unit governs Firecrawl credit-warning, audit-surface UI copy, and user-visible disclosure
  ownership.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_billing_and_audit_ui_ownership
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: firecrawl_billing_audit_ui_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- Plans/FinalGUISpec.md
- Firecrawl billing
- audit disclosure
- credit-warning
- audit-surface UI copy
- Plans/Tools.md
- thresholds
- provider billing exceptions
- cache/routing disclosure
- web-operation audit payload ownership
negative_constraints:
- Firecrawl credit-warning and audit-surface UI copy MUST defer to Plans/Tools.md for provider/billing/audit payload ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FinalGUISpec consumes Firecrawl UI disclosure while Tools owns thresholds, billing exceptions, cache/routing disclosure,
  and audit payload semantics.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-063 - Web Provider Non GUI Consumer Map

```yaml
plan_unit_id: AI-063
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Wiring_Matrix carries research_session and web-tool wiring, usage-feature tracks Firecrawl credit model and
  /billing, assistant-memory-subsystem persists web research session context without owning provider semantics, Architecture
  Invariants records provider architecture changes, and DRY_Rules owns external reference policy including Part Q-style external-reference
  constraints.
gui_related: false
gui_classification_reason: This unit records non-GUI web/provider consumer ownership boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_non_gui_consumer_map
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: web_provider_non_gui_consumer_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- Plans/Wiring_Matrix.md
- research_session
- web-tool wiring
- Plans/usage-feature.md
- Firecrawl credit model
- /billing
- Plans/assistant-memory-subsystem.md
- web research session context
- provider semantics
- Plans/Architecture_Invariants.md
- provider architecture changes
- Plans/DRY_Rules.md
- external reference policy
- Part Q-style external-reference constraints
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Consumer docs remain consumers and do not own provider semantics unless their owner contract says so.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-064 - HITL And Widget Recovery Consumers

```yaml
plan_unit_id: AI-064
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: HITL patterns consume the shared approval ladder and batch permission UX, while Widget_System adds only owner-approved
  card widget types.
gui_related: true
gui_classification_reason: This unit affects HITL permission UX and user-visible widget card types.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_and_widget_recovery_consumers
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: hitl_widget_recovery_consumers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- HITL patterns
- shared approval ladder
- batch permission UX
- Plans/Widget_System.md
- owner-approved card widget types
negative_constraints:
- Widget_System adds only owner-approved card widget types.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- HITL and Widget_System are consumers in the web/provider recovery map.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-065 - Owner First Consumer Drift Blocking

```yaml
plan_unit_id: AI-065
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: 'Consumer drift remains blocking even when owner docs exist: slash-command consumers, questionnaire consumers,
  and provider /multi-account/runtime-identity consumers MUST be reconciled in the same packet as repaired owner docs so stale
  local assumptions do not mislead implementation.'
gui_related: false
gui_classification_reason: This unit covers consumer drift and owner-first repair policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_first_consumer_drift_blocking
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: owner_first_consumer_drift_blocking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- Consumer drift remains blocking
- owner docs
- slash-command consumers
- questionnaire consumers
- provider `/multi-account/runtime-identity` consumers
- same packet
- repaired owner docs
- stale local assumptions
- mislead implementation
negative_constraints:
- Consumer drift remains blocking even when owner docs exist.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale local assumptions in slash-command, questionnaire, and provider runtime-identity consumers must be reconciled with
  owner docs.
owner_boundary_notes:
- Consumer repair happens in the same packet as repaired owner docs.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-066 - Log Audit GUI Drift Blocking

```yaml
plan_unit_id: AI-066
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Log/audit GUI consumers MUST be reconciled in the same packet as repaired owner docs so stale local assumptions
  do not mislead implementation.
gui_related: true
gui_classification_reason: This unit governs GUI log/audit consumer drift and visible audit surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: log_audit_gui_drift_blocking
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: log_audit_gui_drift_blocking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- log/audit GUI consumers
- same packet
- repaired owner docs
- stale local assumptions
- mislead implementation
negative_constraints:
- Log/audit GUI consumers MUST be reconciled in the same packet as repaired owner docs.
compatibility_only_notes: []
stale_retired_dispositions:
- Log/audit GUI stale assumptions are blocking until reconciled with repaired owner docs.
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-067 - Architecture Owner Consumer Boundary Map

```yaml
plan_unit_id: AI-067
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Architecture_Invariants.md remains the owner doc for behavior described by its preserved sections, and cross-doc
  ownership follows the ContractRefs and boundary notes already present in the original text.
gui_related: false
gui_classification_reason: This unit records owner/consumer map boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: architecture_owner_consumer_boundary_map
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: architecture_owner_consumer_boundary_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0040
preserved_exact_tokens:
- Owner / Consumer Map
- source-preserving standardization
- owner and consumer boundaries
- Plans/Architecture_Invariants.md
- ContractRefs
- boundary notes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Architecture_Invariants.md remains the owner doc for behavior described by its preserved sections while cross-doc ownership
  follows ContractRefs and boundary notes.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
```

### AI-068 - Case L Durable State Authority Scope And Recovery

```yaml
plan_unit_id: AI-068
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: >-
  Durable-state consumers preserve registry-declared canonical-versus-derived authority, EventRecord application/project scope and app-root-lifetime identity, side-effect-free projector replay, distinct safe-point/restore-point/backup/migration meanings, FileSafe exact-replace and snapshot custody, exact Worktree baseline effects, live recovery holds, and separate freshness, health, failure, degraded, unavailable, and unknown semantics without redefining their owner contracts.
gui_related: false
gui_classification_reason: This unit defines cross-cutting storage, event, replay, restore, worktree, and recovery invariants rather than GUI presentation.
split_recommended: false
depends_on: [SP-235, SP-241, SP-242, CV-317, F2-200, EP-072, W-063]
unblocks: []
acceptance_criteria:
- Canonical non-rebuildable redb rows are never described or recovered as generic projections, and derived rebuilds require a materialized retained source.
- Application EventRecords carry null project_id, project EventRecords carry a non-empty project_id, and no fake project identity is invented.
- Global event_id, scoped idempotency identity, dedupe_unavailable, and projector_replay_only preserve the Contracts and storage owner rules without side-effect widening.
- Safe points, Assistant Chat restore points, storage backups, and migration journals retain distinct scope, custody, mutation, and lifecycle meanings.
- Safe-point, historical_commit, and worktree_head preserve their exact Worktree/Source Control effects and never substitute moving refs or inferred current state.
- Restore failure and recovery states remain truthful, live holds block cleanup, and unknown input never becomes healthy, available, or mutation-authorizing by default.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, runtime implementation, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- targeted Case L token and owner-reference checks
risk_class: case_l_durable_state_authority_drift
reasoning_tier: high
context_scope: case_l_durable_state_consumers
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: case_l_durable_state_authority_scope_recovery
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Case-L:L-003
- Case-L:L-004
- Case-L:L-010
- Case-L:L-029
- Case-L:PD-L-01..PD-L-06
- Case-L:EVT-01..EVT-07
- Case-L:PD-RSP-01..PD-RSP-09
preserved_exact_tokens:
- canonical_non_rebuildable
- derived_rebuildable
- scope_kind
- scope_partition
- projector_replay_only
- dedupe_unavailable
- exact-replace
- recovery_anchor_record
- recovery_unavailable
- restore_recovery_required
- historical_commit
- worktree_head
- projection_freshness
- projection_health
negative_constraints:
- Do not treat canonical redb rows as generic rebuildable projections.
- Do not invent a fake project, append replay-only compatibility input, or buffer append when dedupe authority is unavailable.
- Do not collapse safe points, restore points, storage backups, and migration journals into one restore object.
- Do not release recovery custody by age, archive, exit, run completion, or worktree unbinding while a live ref remains.
- Do not claim runtime execution, whole-Case-L closure, buildability, or completeness from this plan-only consumer propagation.
compatibility_only_notes:
- EventRecord 1.0 and EventEnvelopeV1 remain compatibility-reader inputs; they are not rewritten or appended as current EventRecord 2.0 values during ordinary replay.
- restored_with_conflicts remains compatibility-only for a future explicitly merge-capable owner and is invalid for exact safe-point restore and Chat revert.
stale_retired_dispositions:
- Universal CRC-failure skip wording is retired; SeglogFrameV2 recovery distinguishes tail, active non-tail, closed-segment, and unproven-boundary outcomes.
- Fresh, warm, expired, blocked, and unknown are retired as projection_freshness or projection_health enum substitutes.
owner_boundary_notes:
- Plans/storage-plan.md owns persistence, recovery dispositions, replay mechanics, retention, holds, and maintenance.
- Plans/Contracts_V0.md and Plans/event_record.schema.json own EventRecord and closed restore outcome contracts.
- Plans/FileSafe.md owns manifest equality, exact-replace mechanics, rollback, restart reconciliation, and snapshot custody behavior.
- Plans/WorktreeGitImprovement.md owns baseline and worktree effects; Plans/Executor_Protocol.md owns admission, attempt lineage, and dispatch gating.
owner_hints:
- Plans/Architecture_Invariants.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/FileSafe.md
- Plans/Executor_Protocol.md
- Plans/WorktreeGitImprovement.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/event_record.schema.json, ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md'
```
