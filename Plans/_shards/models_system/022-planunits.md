# Shard 022: PlanUnits

Source: `Plans/Models_System.md`

Source lines: L1244-L7219

Source SHA256: `aa8e2ab976e7c17077a11efc6a335a097a478bcddacedac78e4839b1bbc63956`

---

## PlanUnits

### MS-002 - Models SSOT And DRY Compliance Boundary

```yaml
plan_unit_id: MS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Models_System.md is the SSOT for model selection, configuration, and variants. Consumers reference anchors
  such as Plans/Models_System.md#MODEL-ID instead of restating model selection rules or variant definitions.
gui_related: false
gui_classification_reason: The unit covers SSOT scope and governance references rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: models_ssot_dry_boundary
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: models_ssot_dry_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0004
preserved_exact_tokens:
- Models System (Canonical SSOT)
- Puppet Master
- Plans/Models_System.md#MODEL-ID
- single canonical source of truth
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md is the single canonical source for model selection, configuration, and variant rules.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-003 - Owner Section Requirements And Reference Inventory

```yaml
plan_unit_id: MS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Canonical owner-section requirements preserve product, runtime, storage, UI, and governance details, while
  SSOT references remain exact inventory pointers and do not replace their owner docs.
gui_related: true
gui_classification_reason: The unit preserves UI/governance reference posture and references Plans/FinalGUISpec.md.
split_recommended: false
depends_on:
- MS-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_section_reference_inventory
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: owner_section_reference_inventory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0005
preserved_exact_tokens:
- Canonical owner-section requirements
- SSOT references (DRY)
- Plans/Spec_Lock.json
- Plans/auto_decisions.jsonl
- Plans/FinalGUISpec.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This unit preserves reference inventory only; referenced owner docs keep their own contracts.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-004 - Provider Model Precedence Owner Boundary

```yaml
plan_unit_id: MS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Models_System.md owns provider/model precedence across run, seam, package, node, overseer, delegated-subagent,
  and worktree-narrowed surfaces without replacing requested/effective resolver records.
gui_related: false
gui_classification_reason: The unit covers backend/runtime owner boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- MS-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_model_precedence_owner_boundary
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_model_precedence_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0007
preserved_exact_tokens:
- Provider/model precedence and settings resolution
- Scope and owner boundaries
- run
- seam
- package
- node
- overseer
- delegated-subagent
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Adjacent docs consume this owner section and must not replace its provider/model precedence policy.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-005 - Three Axis Settings And Deterministic Precedence

```yaml
plan_unit_id: MS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Settings resolve on source, request, and execution axes. Deterministic precedence is explicit override, scoped
  policy, Persona preference, surface or stage default, project or global default, last-used when permitted, and provider
  default.
gui_related: false
gui_classification_reason: The unit covers resolver policy and precedence rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-004
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: three_axis_settings_precedence
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: three_axis_settings_precedence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0009
preserved_exact_tokens:
- manual_override
- persona_preference
- scope_policy
- provider_default
- last-used
- requested/effective
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Ownership transitions between overseer and delegated-subagent levels MUST emit a fresh resolver record instead of silently
  inheriting stale effective state.
owner_boundary_notes:
- Policy remains in the Models owner section and produces requested/effective resolver state.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-006 - Resolver Input And Emit Shape

```yaml
plan_unit_id: MS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The resolver accepts overrides, defaults, policy, capability, account, worktree, and permission context, then
  emits requested and effective platform, model, variant, auth, account, execution_role, selection_reason, resolver_matrix_entry,
  worker_policy_display, and skipped_persona_controls.
gui_related: false
gui_classification_reason: The unit covers backend resolver input and output shape rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-005
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: resolver_input_emit_shape
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: resolver_input_emit_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- requested_platform
- effective_model
- skipped_persona_controls[]
- selection_reason
- resolver_matrix_entry
- worker_policy_display
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime snapshots, inspectors, and owner transitions consume the emit shape; later sections elaborate but do not replace
  it.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-007 - Concern Lifecycle And Consumer Boundaries

```yaml
plan_unit_id: MS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider/model concerns use active, acknowledged, resolved, dismissed, resolution_kind, and accepted_risk.
  Consumers may disclose proceed, block, retry, and confirmation semantics but do not own selection policy.
gui_related: true
gui_classification_reason: The unit includes user confirmation and concern disclosure behavior that can surface in GUI flows.
split_recommended: false
depends_on:
- MS-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: concern_lifecycle_consumer_boundaries
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: concern_lifecycle_consumer_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- active
- acknowledged
- resolved
- dismissed
- accepted_risk
- DispatchContext.provider_id
- Provider / Model
- worker_provider
negative_constraints:
- Consumers may disclose concern state but must not replace Models_System.md as provider/model selection owner.
compatibility_only_notes:
- DispatchContext and Run Graph provider/model labels are compatibility labels over the canonical requested/effective snapshot.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md, Executor, Worktree, Run Graph, and Crosswalk consume this policy.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-008 - Requested Effective Identity And Storage Account Continuity

```yaml
plan_unit_id: MS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Requested/effective persona, provider, model, account, runtime, execution-role, and operational identities
  remain distinct, durable, and explicit across storage, contracts, project account context, and provider snapshots.
gui_related: false
gui_classification_reason: The unit covers storage/account/runtime identity fields rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: requested_effective_identity_account_continuity
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: requested_effective_identity_account_continuity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- requested_persona
- effective_persona
- _id
- 'provider_id: cursor'
- selected_repo_id
- requested_*
- effective_*
negative_constraints:
- Compatibility _id fields must not collapse requested, effective, account, provider, model, execution role, or operational
  identity into one value.
- Runtime/storage account fallback fields must not disappear from requested/effective disclosure.
compatibility_only_notes:
- _id variants and legacy path references are compatibility labels, not replacement canonical IDs.
stale_retired_dispositions: []
owner_boundary_notes:
- Contracts, storage, GitHub, project-account, and orchestrator docs consume this identity model without re-owning it.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-009 - Execution Unit Defaults Worker Policy And Delegation

```yaml
plan_unit_id: MS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Run, seam, package, node, overseer, and delegated-subagent settings resolve through requested/effective snapshots.
  Easiest, lane-aware, worktree, node-worker, and delegation policies are explicit resolver inputs.
gui_related: false
gui_classification_reason: The unit covers execution-unit settings and delegation policy rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: execution_unit_defaults_worker_delegation
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: execution_unit_defaults_worker_delegation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- /model/effort/persona
- /package/node
- /easiest
- node-effective
- overseer-effective
- lane-aware
negative_constraints:
- Provider/model defaults must not become ad hoc per-node manual model names outside the resolver record.
compatibility_only_notes:
- Lifecycle events carry the execution-unit provider/model snapshot that made each transition valid.
stale_retired_dispositions: []
owner_boundary_notes:
- Execution settings remain model-owner inputs while package, lane, and worktree docs consume the resolved snapshot.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-010 - Compatibility Cleanup And Stale Tier Routing

```yaml
plan_unit_id: MS-010
unit_type: constraint
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Legacy tier, event, four-tier, TierContext, tier-native, and active-agent vocabulary maps to current execution-unit,
  package/lane, and requested/effective resolver semantics.
gui_related: false
gui_classification_reason: The unit covers compatibility vocabulary and cleanup constraints rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: compatibility_cleanup_stale_tier_routing
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: compatibility_cleanup_stale_tier_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- TierChanged
- GateStart
- four-tier
- node-graph
- TierContext
- tier-native
negative_constraints:
- Old and new provider/model models cannot remain peer canon in the same surface.
- Owner-of-owners cleanup must not amplify provider/model drift.
compatibility_only_notes:
- Legacy tier, executor, and active-agent terms are compatibility inputs only.
stale_retired_dispositions:
- Legacy tier semantics remain compatibility-only and do not revive tier-native execution semantics.
owner_boundary_notes:
- Models_System.md resolves provider/model wording contradictions into one requested/effective resolver statement.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-011 - GUI Help Labels Receipts And Subject Open Presentation

```yaml
plan_unit_id: MS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Visible labels, help text, receipts, and subject-open presentation may simplify display but remain views over
  canonical requested/effective model state and shared cost, ledger, and artifact-opening identity.
gui_related: true
gui_classification_reason: The unit covers GUI labels, help copy, receipts, tabs, and user-visible subject-open behavior.
split_recommended: false
depends_on:
- MS-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_help_receipts_subject_open_presentation
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: gui_help_receipts_subject_open_presentation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- Workers
- Providers & Models
- Execution Identity
- HITL
- 'Temperature: 0.2 -> Honored'
- Show in Usage
- tab_id
negative_constraints:
- Execution copies are not loose GUI hints.
- tab_id must not be reused for side-panel subviews, browser tab IDs, workspace tab IDs, widget slots, or compare-target variants.
- Planning and /output surfaces must not replace the shared subject-open resolver.
compatibility_only_notes:
- UI aliases and simplified labels are presentation compatibility only.
stale_retired_dispositions: []
owner_boundary_notes:
- GUI surfaces consume the model contract and do not create alternate object names.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-012 - Canonical Model ID Grammar And Persistence Boundary

```yaml
plan_unit_id: MS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Stored and runtime model IDs use provider_id/model_id, split only on the first slash, and cannot be rewritten
  by labels, grouping, pooling, or runtime-platform grouping.
gui_related: false
gui_classification_reason: The unit covers stored/runtime identifier grammar rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: canonical_model_id_grammar
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: canonical_model_id_grammar
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0012
preserved_exact_tokens:
- MODEL-ID
- provider_id/model_id
- /collision-safe
- split on the first /
negative_constraints:
- Canonical model identifiers must never be rewritten by labels, grouping, family pooling, or runtime-platform grouping.
compatibility_only_notes:
- Contracts may cite the model provider namespace but do not redefine this identifier grammar.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-013 - Collision Safe GUI Indexing And Display Name Policy

```yaml
plan_unit_id: MS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: GUI may clean labels and use normalized collision-safe internal keys, but meaningful tokens and stored IDs
  remain intact. Duplicate runtime availability is disambiguated with runtime, auth, and billing context.
gui_related: true
gui_classification_reason: The unit covers model picker and display-name behavior.
split_recommended: false
depends_on:
- MS-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: collision_safe_gui_display_names
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: collision_safe_gui_display_names
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0014
preserved_exact_tokens:
- mini
- pro
- flash
- thinking
- cleaned-label
- /runtime/auth-family/billing
negative_constraints:
- GUI disambiguation must not mutate the stored provider_id/model_id.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FinalGUISpec consumes display policy while Models_System.md owns identifier meaning.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-014 - Runtime Platform Distinction And Usage Evidence Fields

```yaml
plan_unit_id: MS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Model identity and runtime-platform identity are separate. Requested/effective runtime platform, model provider,
  usage source kind, signal confidence, raw model ID, effort, auth family, pool scope, and snapshots remain inspectable.
gui_related: false
gui_classification_reason: The unit covers runtime/platform identity and usage evidence fields rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_platform_usage_evidence_fields
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: runtime_platform_usage_evidence_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0013
preserved_exact_tokens:
- requested_runtime_platform_id
- provider_usage_source_kind?
- /API-backed
- gemini_direct
- gemini_cli
- model_id_raw
- effective_runtime_snapshot
negative_constraints: []
compatibility_only_notes:
- model_id_raw, effort, compact_threshold, auth_family, pool_scope, effective_runtime, and effective_runtime_snapshot remain
  inspectable when they affect selection or disclosure.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-015 - Selection Priority And Gemini CLI Evidence

```yaml
plan_unit_id: MS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Selection follows the deterministic requested/effective pipeline and priority table. Concrete provider entries
  resolve before provider families, while Gemini CLI precedence and general.plan.modelRouting are recorded as evidence.
gui_related: false
gui_classification_reason: The unit covers resolver selection priority rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-005
- MS-014
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: selection_priority_gemini_cli_evidence
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: selection_priority_gemini_cli_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0015
preserved_exact_tokens:
- SELECTION-PRIORITY
- --model
- GEMINI_MODEL
- settings.json
- general.plan.modelRouting
negative_constraints:
- Provider family cannot replace a concrete provider entry when the concrete provider is specified.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-016 - Provider And Model Option Scopes

```yaml
plan_unit_id: MS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider options live under config.provider.<provider_id>.options. Model options override provider defaults,
  and the standard option field section remains canonical for shared model option metadata.
gui_related: false
gui_classification_reason: The unit covers configuration schema rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_model_option_scopes
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_model_option_scopes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0017
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0019
preserved_exact_tokens:
- MODEL-OPTIONS
- '[provider.anthropic.options]'
- '[provider.anthropic.models."claude-sonnet-4"]'
- max_output_tokens
- temperature
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Models_System.md owns provider and model option scope.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-017 - Capability Matrix Fields And Data Driven Checks

```yaml
plan_unit_id: MS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Capability metadata covers transport, tool, cache, payload, pricing, billing, and source fields. Checks are
  data-driven, Gemini Direct and Gemini CLI remain distinct, and disableCache maps through cache capability fields.
gui_related: false
gui_classification_reason: The unit covers capability metadata and runtime checks rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-016
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: capability_matrix_data_driven_checks
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: capability_matrix_data_driven_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0020
preserved_exact_tokens:
- system_role_name
- streaming
- tool_use
- cache_control
- billing_entity
- billing_source
- disableCache
negative_constraints:
- Capability checks must not devolve into scattered if-else branches.
compatibility_only_notes:
- Gemini disableCache compatibility evidence maps through cache_control or cache_with_oauth rather than a hidden provider
  flag.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-018 - Dynamic Catalog Discovery And Selectable Unit Snapshots

```yaml
plan_unit_id: MS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: OpenCode models.dev, provider catalog, and cursor-agent models supply model-scoped capability metadata. Snapshots
  preserve requested_default and effective_capabilities for UI, default, and runtime explanation.
gui_related: true
gui_classification_reason: The unit includes selectable-unit snapshots that explain UI defaults and user-visible runtime choices.
split_recommended: false
depends_on:
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dynamic_catalog_selectable_snapshots
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: dynamic_catalog_selectable_snapshots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0020
preserved_exact_tokens:
- models.dev
- /catalog
- requested_default
- effective_capabilities
- cursor-agent models
negative_constraints:
- Provider defaults and variants must not be hardcoded when returned IDs and catalog metadata are available.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Models_System.md owns catalog-derived capability interpretation.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-019 - System Role Name Mapping

```yaml
plan_unit_id: MS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: system_role_name role mapping is data-driven. OpenAI reasoning uses developer, other listed families use system,
  and bridged adapters align with CLI_Bridged_Providers.
gui_related: false
gui_classification_reason: The unit covers provider adapter role mapping rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: system_role_name_mapping
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: system_role_name_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0021
preserved_exact_tokens:
- system_role_name
- developer
- Anthropic
- OpenAI reasoning family
- Gemini CLI
negative_constraints:
- Adapters must not invent local role names outside model capability metadata.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-020 - Compaction Threshold Metadata

```yaml
plan_unit_id: MS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Per-model metadata may set pressure_start_pct, pressure_aggressive_pct, large_block_threshold, and compact-threshold.
  Unknown capability state is represented explicitly instead of guessed.
gui_related: false
gui_classification_reason: The unit covers model metadata used by prompt/runtime systems rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: compaction_threshold_metadata
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: compaction_threshold_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0022
preserved_exact_tokens:
- pressure_start_pct = 70
- pressure_aggressive_pct = 85
- large_block_threshold = 1200
- compact-threshold
negative_constraints:
- Unknown threshold or capability state must not be guessed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-021 - Provider Transform And Cache Capability Semantics

```yaml
plan_unit_id: MS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider transform handles normalization and option injection. Provider-side cache and native cache marker
  semantics are capability and request metadata, not PM web-content-cache behavior or generic user settings.
gui_related: false
gui_classification_reason: The unit covers provider transform and cache capability semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_transform_cache_semantics
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_transform_cache_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0023
preserved_exact_tokens:
- cache-key
- cache-TTL
- setCacheKey
- /automatic
- cacheControl
- cachePoint
- cachedContent
- metadata.user_id
negative_constraints:
- Provider cache wire fields must not be treated as identical across runtimes.
- Provider-cache controls must not be exposed as general MVP user settings.
compatibility_only_notes:
- cachePoint gap evidence remains a cache_control or cachedContent capability issue.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-022 - Runtime Specific Request Shaping And API Family Evidence

```yaml
plan_unit_id: MS-022
unit_type: constraint
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider-specific request shaping, 1M-context support, reasoning or effort controls, and OpenAI/Azure API-family
  routing are per runtime surface and preserved in capability and request metadata.
gui_related: false
gui_classification_reason: The unit covers provider request shaping and route evidence rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-021
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_request_shaping_api_family_evidence
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: runtime_request_shaping_api_family_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0023
preserved_exact_tokens:
- enable_thinking=true
- '#14003'
- '#17494'
- '#14055'
- useCompletionUrls
- responses()
- chat()
- '#15016'
- '#7793'
negative_constraints:
- PM must not hardcode a universal 1M-context signal.
- Non-OpenAI Azure-hosted models must not be forced down the wrong OpenAI API path.
- PM must not assume one universal OpenAI/Azure route.
compatibility_only_notes:
- OpenCode prefers Responses API for OpenAI while Chat-Completions-only proxies have known compatibility issues.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-023 - Availability Lifecycle And Finish Reason Handling

```yaml
plan_unit_id: MS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Model availability requires registered, authenticated, reachable, and compatible runtime surface. Lifecycle
  state controls dispatch eligibility, and finish_reason stop is insufficient when tool calls require continuation.
gui_related: false
gui_classification_reason: The unit covers runtime dispatch eligibility and tool-loop control flow rather than direct GUI
  presentation.
split_recommended: false
depends_on:
- MS-015
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: availability_lifecycle_finish_reason_handling
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: availability_lifecycle_finish_reason_handling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0025
preserved_exact_tokens:
- active | deprecated | sunset_pending | sunset | removed
- deprecation_notice_ref?
- sunset_at_utc?
- finish_reason = stop
- /control-flow
- '#14972'
negative_constraints:
- finish_reason stop alone cannot be treated as final completion evidence when tool calls require continuation.
compatibility_only_notes:
- Deprecated, sunset, and removed lifecycle states retain only the allowed history and compatibility behavior.
stale_retired_dispositions:
- Model lifecycle state text remains stale/retired-sensitive for deprecated, sunset, and removed dispatch eligibility.
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-024 - Pricing Metadata Versioning

```yaml
plan_unit_id: MS-024
unit_type: pricing_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Pricing metadata is versioned by pricing_version; user-supplied overrides apply before stale-pricing warnings,
  and Doctor warns when stored pricing metadata is stale relative to the current provider metadata snapshot.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pricing_metadata_versioning
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: pricing_metadata_versioning
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- pricing_version
- user-supplied overrides
- Doctor integration
- stale relative to the current provider metadata snapshot
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Pricing metadata and stale-pricing behavior remain explicit; stale warnings must use the provider metadata snapshot.
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-025 - Billing Entity Cost Attribution

```yaml
plan_unit_id: MS-025
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Cost attribution is keyed by model_id, provider_id, and billing_entity when quota semantics depend on billing
  entity; billing_entity remains canonical even when persisted records expose billing_entity_id or aliases.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-024
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: billing_entity_cost_attribution
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: billing_entity_cost_attribution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- (model_id, provider_id, billing_entity)
- billing_entity_id
- billing_entity
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Models_System.md owns the cost attribution dimension; usage and contracts consume the pricing identity.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-026 - Free Tier Billing Provenance Display

```yaml
plan_unit_id: MS-026
unit_type: display_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Free-tier rows display zero-cost pricing with a billing_source label so cost displays preserve provider/runtime
  billing provenance instead of flattening it.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-025
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: free_tier_billing_provenance_display
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: free_tier_billing_provenance_display
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- $0
- billing_source
- cost displays
- provider/runtime billing provenance
negative_constraints:
- Cost displays must not flatten provider/runtime billing provenance.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-027 - OpenCode Reference Pricing Formula

```yaml
plan_unit_id: MS-027
unit_type: reference_formula
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: OpenCode product pricing is a reference formula only, not an authoritative PM cost source; baseline explanations
  may cite getUsage and the normalized token bucket formula while preserving provider caveats.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-024
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: opencode_reference_pricing_formula
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: opencode_reference_pricing_formula
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- OpenCode product pricing is a reference formula
- not an authoritative PM cost source
- packages/opencode/src/session/index.ts:getUsage
- /opencode/src/session/index.ts:getUsage
- /input
- /output/reasoning/cache
- input_rate
- output_rate
- cache_read_rate
- cache_write_rate
- over-200k
- OpenRouter
negative_constraints: []
compatibility_only_notes:
- OpenCode pricing references are explanatory baseline evidence, not PM cost authority.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-028 - Provider Sensitive Token Counting

```yaml
plan_unit_id: MS-028
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider-sensitive token counting uses token_counting_adapter_id and token_counting_basis before cost or budget
  enforcement reads canonical token buckets; raw provider counts may be retained for audit.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-025
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_sensitive_token_counting
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_sensitive_token_counting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- token_counting_adapter_id
- token_counting_basis
- input_tokens
- output_tokens
- cache_read_input_tokens
- cache_creation_input_tokens
- reasoning_tokens
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider raw counts may be preserved for audit, but adapter results feed canonical cost and budget token buckets.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-029 - Context Breakdown Usage View

```yaml
plan_unit_id: MS-029
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Context-detail Breakdown views that consume model/runtime usage metadata show the context usage bar, token
  buckets, and grouped breakdowns by role, tools, and provider/model when available.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-028
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: context_breakdown_usage_view
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: context_breakdown_usage_view
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- Context-detail
- Breakdown
- context usage bar
- token buckets
- role
- tools
- provider/model
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-030 - Bedrock Region Prefix Lookup

```yaml
plan_unit_id: MS-030
unit_type: provider_compatibility
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Bedrock region-prefix mapping uses an explicit lookup table, not string slicing; PM may add required regional
  prefixes only through the table and must honor no-rewrite exemptions for ARNs and provider-native canonical IDs.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: bedrock_region_prefix_lookup
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: bedrock_region_prefix_lookup
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0027
preserved_exact_tokens:
- Region-prefix mapping MUST use an explicit lookup table
- rather than string slicing
- /model-id
- ARNs
- provider-native ids
- us
- eu
- ap
- sa
- unknown/new region
negative_constraints:
- Unknown or new Bedrock regions receive no implicit prefix and require an explicit mapping update.
compatibility_only_notes:
- Bedrock region and model-id rewrite rules are deterministic provider-runtime compatibility facts.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-031 - Two Gemini Providers Structural Anchor

```yaml
plan_unit_id: MS-031
unit_type: structural_anchor
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The Two Gemini providers heading and alias remain preserved as a structural anchor; no product body text is
  introduced by this span.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: two_gemini_providers_structural_anchor
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: two_gemini_providers_structural_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0028
preserved_exact_tokens:
- 4.4 Two Gemini providers
- 4.4-two-gemini-providers
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This is a structural anchor disposition only.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-032 - Web Capability Mirror And Site Reader Routing

```yaml
plan_unit_id: MS-032
unit_type: consumer_alignment
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Models_System mirrors web provider capability routing while preserving Site Reader as the default and primary
  path and keeping Firecrawl, Tavily, Exa, and other providers as explicit fallback, alternative, or override routes.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_capability_mirror_site_reader_routing
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: web_capability_mirror_site_reader_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- This consumer-capability section mirrors the linked owner contract
- Site Reader is the DEFAULT and PRIMARY webfetch routing path
- Firecrawl
- Tavily
- Exa
- fallback/alternative paths
negative_constraints:
- Firecrawl, Tavily, and Exa webfetch capability must not be flattened to fallback-only merely because Site Reader is preferred.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This section mirrors linked owner contracts and stays aligned without owning payload validation.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-033 - Model Native Websearch Classification

```yaml
plan_unit_id: MS-033
unit_type: provider_taxonomy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: 'Web capability disclosure preserves the two-class provider model: Anthropic and OpenAI websearch are native/model-native,
  while backend/API and PM-composed routes remain distinct.'
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: model_native_websearch_classification
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: model_native_websearch_classification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- native (model)
- model-native
- pm-composed
- backend/API
- two-class provider model
negative_constraints:
- Anthropic and OpenAI websearch support must not be relabeled as pm-composed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-034 - DuckDuckGo And Google Adapter Semantics

```yaml
plan_unit_id: MS-034
unit_type: provider_compatibility
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: DuckDuckGo/DDG remains enabled-by-default best-effort no-key fallback with native-ish search and PM-composed
  or partial fetch/extract/crawl semantics; Google remains a pluggable adapter slot with display label Google.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duckduckgo_google_adapter_semantics
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: duckduckgo_google_adapter_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- DuckDuckGo
- DDG
- enabled-by-default
- /no-key
- native-ish
- partial crawl
- Google
- display label `Google`
- pluggable adapter slot
negative_constraints:
- DuckDuckGo partial crawl behavior must not disappear.
- Google ledger support semantics must not be collapsed away.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-035 - Firecrawl Identity And Config Registry

```yaml
plan_unit_id: MS-035
unit_type: provider_config
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Firecrawl provider identity preserves provider ID firecrawl, display name Firecrawl, priority below Exa and
  Tavily and above DDG, default-disabled state until API key or self-hosted URL, and base configuration fields.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_identity_config_registry
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: firecrawl_identity_config_registry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- proxy_mode
- basic
- enhanced
- auto
- Fire Engine
- enabled
- api_key
- base_url
- timeout_ms
- cache_enabled
- firecrawl
- Firecrawl
- below Exa, Tavily; above DDG
- disabled (requires API key or self-hosted URL)
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Retire exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.
owner_boundary_notes:
- The Firecrawl owner section preserves base configuration fields and default-disabled state.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-036 - Firecrawl Deployment Disclosure Boundary

```yaml
plan_unit_id: MS-036
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: PM must disclose deployment mode, requested/effective adapter identity, and capability differences before
  fallback or recovery and must not silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-035
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_deployment_disclosure_boundary
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: firecrawl_deployment_disclosure_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- self-hosted Firecrawl
- hosted/cloud Firecrawl
- deployment mode
- requested/effective adapter identity
- fallback or recovery
negative_constraints:
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-037 - Tavily Heavy Mode Non Default Policy

```yaml
plan_unit_id: MS-037
unit_type: runtime_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Tavily heavy-mode settings are reserved for precision needs, fallback scenarios, or explicit user requests;
  default runtime behavior uses lighter modes and PM search-then-read depth handling.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tavily_heavy_mode_non_default_policy
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: tavily_heavy_mode_non_default_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- 'search_depth: "advanced"'
- 'include_raw_content: true'
- chunks_per_source
- 'search_depth: "basic"'
- 'search_depth: "fast"'
- precision needs
- fallback scenarios
- explicit user request
negative_constraints:
- Tavily heavy-mode settings are never defaults.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-038 - Web Operation Input Surface Mirror

```yaml
plan_unit_id: MS-038
unit_type: schema_mirror
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: 'Models_System mirrors web-operation inputs and capability surfaces without owning payload validation: websearch
  sources/categories, webfetch pdf_mode, webextract JSON Schema limits, and webfetch/webcrawl diff status remain explicit.'
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_operation_input_surface_mirror
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: web_operation_input_surface_mirror
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- websearch
- sources
- categories
- webfetch
- 'pdf_mode: fast|auto|ocr'
- webextract
- JSON Schema draft-07
- schema
- 50KB maximum
- no external `$id` references
- webcrawl
- diff status
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Models_System mirrors input/capability surface; payload validation remains with the linked tool/owner contracts.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-039 - Webresearch Tiering And Automation Session Boundary

```yaml
plan_unit_id: MS-039
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: webresearch defaults autonomous to false and exposes PM-composed default, enhanced PM recipe, and provider-native
  agent tiers; research automation_session follows browser capability and permission models.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: webresearch_tiering_automation_session_boundary
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: webresearch_tiering_automation_session_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- webresearch
- autonomous
- 'false'
- PM-composed default
- enhanced PM recipe
- provider-native agent
- automation_session
- three-tier permission model
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-040 - Persona Runtime Preference Schema

```yaml
plan_unit_id: MS-040
unit_type: schema_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Persona runtime preferences may define default_platform, default_model, default_variant, temperature, top_p,
  and reasoning_effort in PERSONA.md frontmatter using the canonical provider_id/model_id model format.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_runtime_preference_schema
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_runtime_preference_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0030
preserved_exact_tokens:
- PERSONA-MODEL-OVERRIDES
- rust-engineer
- anthropic/claude-sonnet-4
- powerful
- 'temperature: 0.2'
- 'top_p: null'
- 'reasoning_effort: "high"'
- default_platform
- default_model
- default_variant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, PolicyRule:Decision_Policy.md§2, ContractName:Plans/Prompt_Pipeline.md#PROVIDER-CAPABILITY-FILTERING'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-041 - Persona Preference Priority And Fallback

```yaml
plan_unit_id: MS-041
unit_type: selection_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Persona runtime preferences participate at priority 2, are overridden by explicit run-envelope or surface-level
  overrides, override lower defaults, and log warnings plus fall through when preferred runtime choices are unavailable.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-040
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_preference_priority_fallback
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_preference_priority_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0030
preserved_exact_tokens:
- priority 2
- priority 1
- logs a warning
- falls through to the next priority level
- run is NOT blocked
negative_constraints:
- Unavailable Persona preferred platform/model/variant must not block the run.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, PolicyRule:Decision_Policy.md§2, ContractName:Plans/Prompt_Pipeline.md#PROVIDER-CAPABILITY-FILTERING'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-042 - Unsupported Runtime Controls Skipped State

```yaml
plan_unit_id: MS-042
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Unsupported Persona runtime controls such as temperature, top_p, or reasoning_effort are recorded as skipped
  and excluded from effective runtime state instead of silently ignored.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-040
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unsupported_runtime_controls_skipped_state
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: unsupported_runtime_controls_skipped_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0030
preserved_exact_tokens:
- temperature
- top_p
- reasoning_effort
- recorded as skipped
- excluded from the effective runtime state
- silently ignored
negative_constraints:
- Unsupported runtime controls must not be silently ignored.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, PolicyRule:Decision_Policy.md§2, ContractName:Plans/Prompt_Pipeline.md#PROVIDER-CAPABILITY-FILTERING'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-043 - Variants Section Anchor

```yaml
plan_unit_id: MS-043
unit_type: structural_anchor
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The Variants section and VARIANTS anchor are preserved as the owner location for named model presets and related
  variant behavior.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: variants_section_anchor
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: variants_section_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0031
preserved_exact_tokens:
- VARIANTS
- 6. Variants system
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This structural PlanUnit preserves the section anchor that subsequent variant units elaborate.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-044 - Variant Definition

```yaml
plan_unit_id: MS-044
unit_type: variant_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: A Variant is a named model preset that users can quickly switch between to cycle through models without editing
  config.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: variant_definition
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: variant_definition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0032
preserved_exact_tokens:
- Variant
- named model preset
- quickly switch
- cycle through models
- without editing config
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-045 - Built In Variant Resolution

```yaml
plan_unit_id: MS-045
unit_type: variant_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Built-in variants default, fast, and powerful resolve dynamically from available providers; unavailable target
  models fall back to default.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-044
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: built_in_variant_resolution
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: built_in_variant_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0033
preserved_exact_tokens:
- default
- fast
- powerful
- Smallest/cheapest available model
- Largest/most capable available model
- resolved dynamically
- falls back to the `default` variant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-046 - Custom Variant Config Schema

```yaml
plan_unit_id: MS-046
unit_type: schema_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Custom variants are defined in config with unique validated names, canonical model IDs, and optional descriptions
  capped at 200 characters.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-044
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: custom_variant_config_schema
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: custom_variant_config_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0034
preserved_exact_tokens:
- '[[variants]]'
- my-variant
- cheap
- anthropic/claude-sonnet-4
- openai/gpt-5-mini
- ^[a-z][a-z0-9-]{0,30}[a-z0-9]$
- Max 200 characters
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-047 - Disabled Variants Visibility

```yaml
plan_unit_id: MS-047
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Built-in and custom variants can be disabled through variants_disabled entries; disabled variants do not appear
  in the model picker or variant cycling UI.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: disabled_variants_visibility
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: disabled_variants_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0035
preserved_exact_tokens:
- '[variants_disabled]'
- '"fast" = true'
- Disabled variants
- model picker
- variant cycling UI
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-048 - Variant Cycling Surfaces

```yaml
plan_unit_id: MS-048
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Users can cycle enabled variants through a configurable keybind, the Chat panel model picker dropdown, and
  the command palette.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: variant_cycling_surfaces
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: variant_cycling_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0036
preserved_exact_tokens:
- keybind
- configurable
- default unbound
- model picker dropdown
- Chat panel
- command palette
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-049 - Active Variant Priority And Persistence

```yaml
plan_unit_id: MS-049
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: When a variant is selected, its model becomes the active model at priority 3 for subsequent runs and persists
  per session unless config.default_variant sets cross-session default behavior.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-048
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: active_variant_priority_persistence
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: active_variant_priority_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0036
preserved_exact_tokens:
- priority 3
- subsequent runs
- persisted per session
- not across restarts
- config.default_variant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-050 - Persona Default Variant Schema

```yaml
plan_unit_id: MS-050
unit_type: schema_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: A Persona may specify a preferred variant with default_variant in PERSONA.md frontmatter.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-040
- MS-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_default_variant_schema
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_default_variant_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0037
preserved_exact_tokens:
- default_variant
- PERSONA.md frontmatter
- 'default_variant: "powerful"'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-051 - Persona Variant Preselection

```yaml
plan_unit_id: MS-051
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: When a Persona default_variant is set, that variant is pre-selected while the Persona is active, and the user
  can still cycle to another variant during the session.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-050
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_variant_preselection
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_variant_preselection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0037
preserved_exact_tokens:
- pre-selected
- Persona is active
- user can still cycle
- during the session
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-052 - Model Alias Resolution

```yaml
plan_unit_id: MS-052
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Model aliases are optional friendly names that resolve to canonical provider_id/model_id identifiers for model
  override parsing; keys normalize lowercase and spaces/underscores/hyphens, and resolution order is alias, exact model id,
  exact display name.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: model_alias_resolution
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: model_alias_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0038
preserved_exact_tokens:
- provider_id/model_id
- model_override
- lowercasing
- spaces/underscores/hyphens
- alias → exact model id → exact display name
- model-unavailable
- aliases are lookup keys
- variants are named model presets
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-053 - Canonical Media Alias Registry

```yaml
plan_unit_id: MS-053
unit_type: alias_registry
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The default media alias registry includes canonical image, video, and TTS aliases that resolve per the alias
  normalization rules and may be extended or overridden by users.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-052
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: canonical_media_alias_registry
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: canonical_media_alias_registry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0039
preserved_exact_tokens:
- MEDIA-ALIASES
- nano banana
- nano banana pro
- veo fast
- tts flash
- tts pro
- gemini-2.5-flash-image
- gemini-3-pro-image-preview
- veo-3.1-fast-generate-preview
- gemini-2.5-flash-preview-tts
- gemini-2.5-pro-preview-tts
- default alias registry
- users MAY add or override aliases
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE, PolicyRule:Decision_Policy.md§2'
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-054 - GUI Model Label ID Separation

```yaml
plan_unit_id: MS-054
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Model selection surfaces distinguish human-friendly labels from canonical stored IDs and remain views over
  the model contract.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_model_label_id_separation
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: gui_model_label_id_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0040
preserved_exact_tokens:
- GUI-MODELS
- human-friendly labels
- canonical stored ids
- Model selection surfaces
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-055 - Chat Model Picker Display Contract

```yaml
plan_unit_id: MS-055
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The Chat panel model picker displays cleaned primary labels, runtime-platform secondary labels when needed,
  capability indicators, and the exact raw canonical model ID in the detailed inspector.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-054
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: chat_model_picker_display_contract
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: chat_model_picker_display_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0041
preserved_exact_tokens:
- primary label
- cleaned model name
- secondary label
- runtime platform
- capability indicators
- exact raw canonical model id
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-056 - Picker Selection Requested Override

```yaml
plan_unit_id: MS-056
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Selecting a model in the picker creates a priority-1 requested override and duplicate runtime surfaces for
  the same canonical ID are disambiguated with concrete runtime surface state.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-055
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: picker_selection_requested_override
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: picker_selection_requested_override
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0041
preserved_exact_tokens:
- selecting a model
- priority-1 requested override
- two runtime surfaces
- same canonical model id
- concrete runtime surface
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-057 - Settings Models Availability Display

```yaml
plan_unit_id: MS-057
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Settings > Models shows provider/runtime grouping, concrete runtime surface availability, current defaults
  and sources, and stale/silent/partial discovery state without inferring unsupported when discovery is silent or stale.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-054
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: settings_models_availability_display
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: settings_models_availability_display
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0042
preserved_exact_tokens:
- Settings > Models
- provider/runtime grouping
- concrete runtime surface availability
- current defaults and their source
- availability or capability gaps
- silent or stale
- model discovery `/state`
- stale cached models
- partial or complete
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale cached model visibility and silent discovery must be displayed as state, not converted into unsupported claims.
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-058 - Model Refresh And Threshold Actions

```yaml
plan_unit_id: MS-058
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Settings exposes scoped user-triggered Refresh Models and Refresh Providers actions, may refresh automatically
  on connect/reconnect/boot/profile activation, and opens Edit Threshold at the most-local applicable override with default-source
  disclosure.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-057
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: model_refresh_threshold_actions
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: model_refresh_threshold_actions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0042
preserved_exact_tokens:
- Refresh Models
- Refresh Providers
- initial connect
- reconnect
- app boot/profile activation
- Edit Threshold
- most-local applicable override
- provider default
- model default
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-059 - Runtime Qualified Effort Capability

```yaml
plan_unit_id: MS-059
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Variant and effort controls remain runtime-qualified capability data; effort support is not inferred from
  model-name similarity, and provider features may expose provider-specific thinking controls rather than a universal effort
  enum.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_qualified_effort_capability
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: runtime_qualified_effort_capability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0043
preserved_exact_tokens:
- effort support
- model-name similarity
- /features
- thinkingLevel
- thinkingBudget
- Gemini CLI
- Gemini 3-style
- 2.5-style
- runtime-qualified capability data
- universal effort enum
negative_constraints:
- Effort support is never inferred solely from model-name similarity.
- PM must not hardcode a universal effort enum for provider-specific thinking controls.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-060 - Effort GUI Requested Effective Disclosure

```yaml
plan_unit_id: MS-060
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The GUI displays unavailable, silent, or stale discovery as Unknown rather than Unsupported and keeps requested
  and effective reasoning/effort selections distinct when runtimes clamp or ignore values.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-059
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: effort_gui_requested_effective_disclosure
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: effort_gui_requested_effective_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0043
preserved_exact_tokens:
- Unknown
- Unsupported
- requested
- effective
- reasoning/effort
- runtime clamps or ignores
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Unavailable, silent, or stale discovery should display Unknown instead of asserting Unsupported.
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-061 - Legacy Effort Wording Supersession

```yaml
plan_unit_id: MS-061
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Legacy consumer wording that treats Gemini or Cursor effort as universally unsupported is superseded by the
  runtime-qualified capability rule.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-059
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: legacy_effort_wording_supersession
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: legacy_effort_wording_supersession
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0043
preserved_exact_tokens:
- Plans/assistant-chat-design.md
- /assistant-chat-design.md
- Gemini effort
- Cursor effort
- universally unsupported
- superseded
negative_constraints: []
compatibility_only_notes:
- Legacy assistant-chat effort-support wording is compatibility-only and superseded by runtime-qualified capability data.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-062 - Detailed Inspector Runtime Identity

```yaml
plan_unit_id: MS-062
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Detailed inspectors show the exact raw canonical model ID, concrete runtime surface, and any effective reroute
  or clamp the provider performed.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-054
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: detailed_inspector_runtime_identity
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: detailed_inspector_runtime_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0044
preserved_exact_tokens:
- Detailed inspectors
- exact raw canonical model id
- concrete runtime surface
- effective reroute
- clamp
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-063 - OpenCode Baseline Deltas Anchor

```yaml
plan_unit_id: MS-063
unit_type: structural_anchor
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The OpenCode baseline and Puppet Master deltas section anchor is preserved as a reference baseline location.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: opencode_baseline_deltas_anchor
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: opencode_baseline_deltas_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0045
preserved_exact_tokens:
- BASELINE-DELTAS
- OpenCode baseline and Puppet Master deltas
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-064 - OpenCode Model Baseline

```yaml
plan_unit_id: MS-064
unit_type: baseline_reference
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: OpenCode baseline behavior uses provider_id/model_id parsing, first-slash splitting, config model then model.json
  last-used then internal priority sort, provider options, per-agent overrides, provider transforms, and regex overflow detection.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-063
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: opencode_model_baseline
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: opencode_model_baseline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0046
preserved_exact_tokens:
- provider_id/model_id
- parseModel()
- first `/`
- config `model` field
- last used (`model.json`)
- internal priority sort
- config.provider.<id>.options
- agent.<name>.model
- regex patterns
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-065 - Puppet Master Non GUI Model Deltas

```yaml
plan_unit_id: MS-065
unit_type: delta_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Puppet Master keeps OpenCode identifier format while adding configurable model priority, Persona file default_model
  overrides, config.default_variant, Rust provider facade normalization, and Rust auto-compaction integration.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-064
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: puppet_master_non_gui_model_deltas
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: puppet_master_non_gui_model_deltas
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0047
preserved_exact_tokens:
- config.model_priority
- default_model
- PERSONA.md frontmatter
- config.default_variant
- Rust provider facade
- auto-compaction
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-066 - Puppet Master GUI Model Deltas

```yaml
plan_unit_id: MS-066
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Puppet Master adds a full Chat model picker dropdown, dedicated Models settings tab, and per-Persona override
  editing beyond the OpenCode TUI baseline.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-064
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: puppet_master_gui_model_deltas
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: puppet_master_gui_model_deltas
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0047
preserved_exact_tokens:
- GUI model picker
- full model picker dropdown in Chat
- dedicated Models settings tab
- per-Persona override editing
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-067 - Acceptance Model Identity And Selection

```yaml
plan_unit_id: MS-067
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Acceptance criteria require provider_id/model_id identifiers, parseModel first-slash splitting, and deterministic
  model selection for identical inputs.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-012
- MS-015
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: acceptance_model_identity_selection
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: acceptance_model_identity_selection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0048
preserved_exact_tokens:
- ACCEPTANCE
- AC-MOD01
- AC-MOD02
- provider_id/model_id
- parseModel()
- split on the first `/` only
- deterministically
- same model MUST be selected
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Progression_Gates.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-068 - Acceptance Persona Fallback

```yaml
plan_unit_id: MS-068
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Acceptance criteria require Persona default_model to override lower-priority defaults but yield to explicit
  run-envelope or tier-config settings, and unavailable Persona models must warn and fall through without blocking the run.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-041
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: acceptance_persona_fallback
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: acceptance_persona_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0048
preserved_exact_tokens:
- AC-MOD03
- AC-MOD04
- Per-Persona `default_model`
- explicit run-envelope
- tier-config model settings
- log a warning
- fall through
- run MUST NOT be blocked
negative_constraints:
- If a Persona specifies an unavailable model, the run MUST NOT be blocked.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Progression_Gates.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-069 - Acceptance Variant Resolution And Validation

```yaml
plan_unit_id: MS-069
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Acceptance criteria require built-in variants to resolve dynamically and fall back to default when unavailable,
  and custom variants to validate unique name and model availability or log warnings.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-045
- MS-046
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: acceptance_variant_resolution_validation
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: acceptance_variant_resolution_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0048
preserved_exact_tokens:
- AC-MOD05
- AC-MOD06
- Built-in variants
- resolve dynamically
- fall back to `default`
- Custom variants
- unique name
- valid model identifier
- warning logged
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Progression_Gates.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-070 - Acceptance Model Picker And Settings UI

```yaml
plan_unit_id: MS-070
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Acceptance criteria require the Chat model picker to display available models grouped by provider with variant
  quick-switch and Settings Models to support per-model option editing and variant management.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-055
- MS-057
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: acceptance_model_picker_settings_ui
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: acceptance_model_picker_settings_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0048
preserved_exact_tokens:
- AC-MOD07
- AC-MOD08
- Chat panel model picker
- grouped by provider
- variant quick-switch
- Settings Models tab
- per-model option editing
- variant management
- add/edit/disable/remove
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Progression_Gates.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-071 - Persona Runtime Controls Addendum Header

```yaml
plan_unit_id: MS-071
unit_type: structural_anchor
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The Persona Runtime Controls and Provider Capability Matrix addendum heading is preserved as the owner location
  for expanded Persona-driven runtime control behavior.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_runtime_controls_addendum_header
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_runtime_controls_addendum_header
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0049
preserved_exact_tokens:
- 10. Persona Runtime Controls and Provider Capability Matrix (2026-03-06)
- Persona-driven runtime control
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-072 - Persona Runtime Request Set

```yaml
plan_unit_id: MS-072
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: A Persona may request platform/provider, model, variant, temperature, top_p, reasoning_effort, and provider-specific
  runtime options.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-040
- MS-071
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_runtime_request_set
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_runtime_request_set
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0050
preserved_exact_tokens:
- platform/provider
- model
- variant
- temperature
- top_p
- reasoning_effort
- provider-specific runtime options
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-073 - Provider Capability Matrix Application Gate

```yaml
plan_unit_id: MS-073
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Persona preferences participate in effective run assembly only after passing through the provider capability
  matrix.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-072
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_capability_matrix_application_gate
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_capability_matrix_application_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0050
preserved_exact_tokens:
- effective run assembly
- MUST pass through a provider capability matrix
- before being applied
negative_constraints:
- Persona runtime controls must not be applied before provider capability matrix evaluation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```
### MS-074 - Effective Selection Identity Fields

```yaml
plan_unit_id: MS-074
unit_type: data_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Effective model/runtime selection is part of the shared requested/effective identity contract and preserves
  distinct requested/effective platform, model, variant, auth, account, runtime, execution role, and selection reason fields.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: effective_selection_identity_fields
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: effective_selection_identity_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0051
preserved_exact_tokens:
- requested_platform
- effective_platform
- requested_model
- effective_model
- model_id_raw
- requested_variant
- effective_variant
- effort
- requested_auth_mode
- effective_auth_mode
- auth_family
- compact_threshold
- pool_scope
- effective_runtime
- effective_runtime_snapshot
- requested_account_policy
- requested_account_id?
- requested_account_binding?
- effective_account_id?
- effective_provider_identity?
- account_switch_reason?
- execution_role
- selection_reason
negative_constraints:
- Model selection must not collapse provider/account identity, execution role, and operational identity into one field.
- Same-provider accounts are not interchangeable for selection or history purposes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Support and disclosure must show whether a requested control was honored, skipped, or clamped.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-075 - Effective Selection Precedence Chain

```yaml
plan_unit_id: MS-075
unit_type: selection_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Effective model/runtime selection resolves deterministically through explicit run-envelope override, Persona
  preference, surface/tier/phase defaults, global/project config defaults, supported last-used state, and internal/provider
  defaults.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: effective_selection_precedence_chain
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: effective_selection_precedence_chain
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0052
preserved_exact_tokens:
- Explicit run-envelope override
- Persona preference
- Surface/tier/phase defaults
- Global/project config defaults
- Last-used state
- Internal/provider defaults
- effective selection MUST be deterministic
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-076 - Direct Coding Plan Runtime Surfaces

```yaml
plan_unit_id: MS-076
unit_type: provider_surface_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Alibaba Coding Plan, MiniMax Coding Plan, and Z.AI Coding Plan are direct-provider architectural surfaces
  that resolve through requested/effective runtime, model, effort, account, and capability disclosure while OpenCode remains
  implementation-reference evidence.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: direct_coding_plan_runtime_surfaces
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: direct_coding_plan_runtime_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0053
preserved_exact_tokens:
- Alibaba Coding Plan
- MiniMax Coding Plan
- Z.AI Coding Plan
- OpenCode
- requested/effective runtime
- model
- effort
- account
- capability disclosure
- /usage/quota
- /model-discovery
negative_constraints: []
compatibility_only_notes:
- Implementation-reference status does not make OpenCode session identity, provider discovery, or provider-specific request
  shaping the PM canonical runtime identity.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-077 - Coding Plan Product Labels In Picker Recommendation Surfaces

```yaml
plan_unit_id: MS-077
unit_type: gui_surface_rule
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: GUI recommendation and picker surfaces keep coding-plan branded products and pay-as-you-go products visible
  as separate selectable/runtime-facing account or provider entries.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-076
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: coding_plan_product_labels_picker_recommendation
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: coding_plan_product_labels_picker_recommendation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0053
preserved_exact_tokens:
- coding-plan-branded products
- selectable/runtime-facing surface
- pay-as-you-go products
- GUI recommendation
- picker surfaces
- separate selectable/runtime-facing account or provider entries
negative_constraints:
- Coding-plan products must not be collapsed into an unbranded vendor family or smoothed into one vendor label.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-078 - Interview GUI UX Gemini Stage Default

```yaml
plan_unit_id: MS-078
unit_type: surface_default_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Interview GUI/UI/UX Gemini preference is a surface/stage default at precedence level 3 when trigger conditions
  match, no explicit override wins, Gemini is configured and capable, and validation stages do not auto-switch without user
  or stage override.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-075
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_gui_ux_gemini_stage_default
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: interview_gui_ux_gemini_stage_default
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0054
preserved_exact_tokens:
- Interview GUI/UI/UX Gemini preference
- surface/stage default
- active surface = `interview`
- product_ux
- has_gui = true
- questioning
- research
- drafting
- review
- validation stages
- 'Interview GUI stage default: Gemini'
- Gemini unavailable
- explicit user override
negative_constraints:
- Validation stages do not auto-switch to Gemini unless the user or a stage override explicitly requests it.
- Gemini unavailability falls back to the normal precedence chain with no special-case retry loop.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-079 - Provider Persona Capability Matrix Baseline

```yaml
plan_unit_id: MS-079
unit_type: capability_matrix
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The Provider Persona Capability Matrix evaluates capability and effort per runtime surface, preserves day-one
  direct, server-bridged, and CLI-bridged surfaces, and keeps provider-native agent/session files outside PM runtime canon.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_persona_capability_matrix_baseline
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_persona_capability_matrix_baseline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0054
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0055
preserved_exact_tokens:
- PERSONA-CAPABILITY-MATRIX
- Provider Persona Capability Matrix
- codex
- copilot
- opencode
- alibaba-coding-plan
- zai-coding-plan
- zai_coding_plan
- minimax-coding-plan
- gemini
- gemini-cli
- claude-code-cli
- cursor-cli
- Copilot-native subagent routing
negative_constraints:
- Capability and effort evaluation must be performed per runtime surface, not by loose provider-family assumptions.
- Provider-native agent or session files are not PM runtime canon.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Run_Modes.md'
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Commands_System.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-080 - Capability Support Granularity And Adapter Routing

```yaml
plan_unit_id: MS-080
unit_type: adapter_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Effective Persona-control support is the intersection of transport, model metadata, and runtime-path constraints,
  and adapter policy remains explicit for API-family routing, schema normalization, upstream identity, and provider-side router
  observation.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-079
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: capability_support_granularity_adapter_routing
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: capability_support_granularity_adapter_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0056
preserved_exact_tokens:
- transport support
- model-level support
- runtime constraint support
- responses
- chat
- model-language
- plain language model primitive selection
- Gemini/Vertex
- tool-schema
- anyOf
- numeric enums
- '#14788'
- '#12908'
- '#12827'
- '#12911'
- /observe
negative_constraints:
- PM must keep adapter policy explicit and must not assume one generic direct-provider loop is sufficient for all model families.
- Silent provider-side model changes are not allowed without requested/effective model disclosure.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-081 - Direct Coding Plan Adapter Identity Facts

```yaml
plan_unit_id: MS-081
unit_type: provider_adapter_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Direct coding-plan provider identities remain direct-provider runtime bucket entries with explicit SDK, env,
  API base, quota/reset, and family-mapping facts.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-076
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: direct_coding_plan_adapter_identity_facts
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: direct_coding_plan_adapter_identity_facts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0056
preserved_exact_tokens:
- MINIMAX_API_KEY
- ZHIPU_API_KEY
- '@ai-sdk/anthropic'
- '@ai-sdk/openai-compatible'
- https://api.z.ai/api/coding/paas/v4
- //api.z.ai/api/coding/paas/v4
- /reset
- zai_coding_plan
- zai-coding-plan
- direct_api
- alibaba_coding_plan
- minimax_coding_plan
- https://platform.minimaxi.com/docs/coding-plan/intro
negative_constraints:
- Alibaba Coding Plan, MiniMax Coding Plan, and Z.AI Coding Plan are not CLI-bridged surfaces merely because they use provider
  SDK adapters.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-082 - Talkativeness Derived Persona Control

```yaml
plan_unit_id: MS-082
unit_type: derived_control_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: talkativeness is a Persona instruction-layer control with a 1-5 user-visible scale, default balanced value
  3, mode overlays, and explicit per-thread override ordering; it does not require a transport matrix row.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: talkativeness_derived_persona_control
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: talkativeness_derived_persona_control
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0057
preserved_exact_tokens:
- talkativeness
- '1'
- '2'
- '3'
- '4'
- '5'
- balanced
- plan mode
- ask mode
- agent mode
- persona_talkativeness
- instruction layer
- not through provider-native temperature/top-p semantics
negative_constraints:
- talkativeness is not a transport sampling knob and does not require its own transport matrix row.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-083 - Canonical Capability Snapshot Resolver Contract

```yaml
plan_unit_id: MS-083
unit_type: data_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: GUI disclosure and runtime filtering resolve support state from one canonical machine-readable capability
  snapshot produced by the shared capability resolver and provider/model metadata inputs.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-079
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: canonical_capability_snapshot_resolver_contract
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: canonical_capability_snapshot_resolver_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0058
preserved_exact_tokens:
- canonical machine-readable snapshot contract
- provider_id
- transport
- model_id
- variant
- controls
- persona_prompt_body
- persona_reasoning_effort
- documented
- empirical
- inferred
- resolved_capability_deltas[]
- pool_scope
- provider_entry
- cache is derivative
- no ad hoc UI-only logic
negative_constraints:
- Every control disclosure shown to the user must be derivable from the snapshot without ad hoc UI-only logic.
compatibility_only_notes: []
stale_retired_dispositions:
- Provider/model catalog snapshots carry boot_refresh_enabled, model_catalog_status, last_model_refresh_at, and selectable_unit_ids
  so boot-time refresh and stale catalog state remain inspectable.
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-084 - Account Routing Capability Metadata Snapshot

```yaml
plan_unit_id: MS-084
unit_type: data_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Account-routing capability fields are part of the canonical snapshot when provider paths participate in multi-account
  selection, switching, or pressure routing, and unsupported or opaque facts remain explicitly disclosed.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-083
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_routing_capability_metadata_snapshot
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: account_routing_capability_metadata_snapshot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0058
preserved_exact_tokens:
- supports_multi_account
- account_identity_kind
- quota_signal_sources[]
- quota_signal_confidence
- supports_threshold_switch
- supports_hard_exhaustion_detection
- supports_rate_limit_detection
- supports_reset_countdown
- supports_manual_set_active
- supports_cooldown
- supports_retry_budget
- supports_role_scoped_account_pools
- switch_boundary
- provider_limit_notes?
- signal_source_kinds[]
- signal_confidence
- retry_budget?
- cooldown_until?
- reset_at?
- unsupported
- opaque
- inferred
- stale
negative_constraints:
- Providers lacking cooldown, retry-budget, or reset countdown support must not pretend the provider account pool is safely
  switchable.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-085 - Talkativeness Snapshot Bridge And GUI Gating Rule

```yaml
plan_unit_id: MS-085
unit_type: runtime_disclosure
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: talkativeness appears in the snapshot only when prompt-construction policy records the effective value, derives
  from persona_prompt_body support, and uses the same skipped disclosure and GUI/runtime gating source as other Persona controls.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-082
- MS-083
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: talkativeness_snapshot_bridge_gui_gating
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: talkativeness_snapshot_bridge_gui_gating
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0058
preserved_exact_tokens:
- persona_prompt_body
- skipped
- GUI gating
- runtime disclosure
- second inconsistent source
negative_constraints:
- GUI gating and runtime disclosure must not invent a second inconsistent source for talkativeness.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-086 - Unsupported Persona Control Skip Disclosure

```yaml
plan_unit_id: MS-086
unit_type: runtime_disclosure
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Unsupported requested Persona controls are not silently ignored or shown as applied; they are recorded in
  skipped_persona_controls with reason and provider and exposed in UI.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-083
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unsupported_persona_control_skip_disclosure
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: unsupported_persona_control_skip_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0059
preserved_exact_tokens:
- do not silently ignore it
- do not show it as applied
- skipped_persona_controls[]
- reason and provider
- expose that status in UI
- temperature
- top_p
- reasoning_effort
- unsupported by Claude Code transport
- unsupported by Cursor CLI transport
- provider does not expose effort knob
negative_constraints:
- Unsupported Persona controls must not be silently ignored or shown as applied.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-087 - Persona Control GUI Support States

```yaml
plan_unit_id: MS-087
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Persona-related model/runtime controls in GUI reflect provider support states as supported, partially_supported
  with warning badge and tooltip, or unsupported with explanatory disabled text.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-086
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_control_gui_support_states
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_control_gui_support_states
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0060
preserved_exact_tokens:
- supported
- partially_supported
- unsupported
- warning badge
- explanatory tooltip
- disabled with explanatory text
- Reasoning effort
- Cursor CLI
- Temperature
- Claude Code
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-088 - Runtime Surface Effective Choice Display

```yaml
plan_unit_id: MS-088
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Run surfaces display effective runtime choices and skipped controls, including Persona name, selection reason,
  effective platform/model/variant/effort, and provider-support status examples.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_surface_effective_choice_display
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: runtime_surface_effective_choice_display
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0061
preserved_exact_tokens:
- Persona name
- selection reason
- effective platform
- effective model
- effective variant/effort
- skipped controls
- 'Persona: Rust Engineer (Auto: Rust repo + code task)'
- 'Model: Codex GPT-5.3 (Persona preferred)'
- 'Platform: Codex (Available)'
- 'Skipped controls: temperature unsupported by provider'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-089 - OpenCode Role Baseline And Persona Canonicalization

```yaml
plan_unit_id: MS-089
unit_type: implementation_reference
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: OpenCode role object runtime shape is implementation-reference evidence; Puppet Master uses Persona as the
  canonical stored contract and adds provider capability disclosure instead of assuming all backends honor all knobs.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: opencode_role_baseline_persona_canonicalization
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: opencode_role_baseline_persona_canonicalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0062
preserved_exact_tokens:
- OpenCode
- role object
- prompt
- model
- variant
- temperature
- topP
- permission
- options
- Persona as the canonical stored contract
- provider capability disclosure
negative_constraints: []
compatibility_only_notes:
- OpenCode demonstrates integrated runtime shape conceptually but is not PM canonical storage.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-090 - Effective Runtime Acceptance Criteria

```yaml
plan_unit_id: MS-090
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Acceptance criteria require effective runtime state to distinguish requested, effective, and skipped Persona
  controls, preserve requested_runtime and runtime outcomes, expose unsupported controls in editor/runtime UI, and show effective
  Persona/model/platform in history/event views.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-074
- MS-086
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: effective_runtime_acceptance_criteria
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: effective_runtime_acceptance_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0063
preserved_exact_tokens:
- requested vs effective vs skipped Persona controls
- requested_runtime
- substituted
- clamped
- blocked
- retried_on_fallback
- editor UI
- runtime UI
- Provider capability matrix
- Chat/Interview/Builder/Orchestrator history/event views
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-091 - Provider Failure Class Versus Model Fallback

```yaml
plan_unit_id: MS-091
unit_type: runtime_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Model/provider selection fallback remains separate from runtime retry classification; unavailable Persona-preferred
  models fall through selection, while provider execution failures map to runtime taxonomy such as provider_transient.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-041
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_failure_class_versus_model_fallback
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_failure_class_versus_model_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0064
preserved_exact_tokens:
- Provider Failure-Class Alignment Addendum
- provider_transient
- unavailable Persona-preferred models
- normal selection chain
- shared runtime taxonomy
- provider-level retry defaults
negative_constraints:
- Provider-level retry defaults must not silently override the shared runtime retry/backoff matrix.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-092 - Runtime Retry Fallback Ownership Split And Attempt Snapshots

```yaml
plan_unit_id: MS-092
unit_type: runtime_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: 'Model fallback and runtime retry are separate: selection decides requested/effective provider/model before
  execution, runtime policy decides retry/remediation/block/escalation after classified outcome, and each attempt retains
  requested/effective identifiers.'
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-091
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_retry_fallback_ownership_attempt_snapshots
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: runtime_retry_fallback_ownership_attempt_snapshots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0065
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0066
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0067
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0068
preserved_exact_tokens:
- Runtime Retry / Fallback Ownership Addendum
- Ownership split
- Required attempt snapshots
- Fallback rule
- retried
- remediated
- blocked
- escalated
- requested and effective model/provider identifiers
negative_constraints:
- Providers and adapters may not invent model-local retry loops that bypass runtime policy.
- Model fallback may change the effective model only through the shared model-selection contract.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-093 - Requested Effective Model Retry Canonical Alignment

```yaml
plan_unit_id: MS-093
unit_type: runtime_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Requested/effective model resolution stays separate from runtime retry policy; retries, remediation, and prerequisite-resumed
  work are new attempts with new attempt snapshots and no hidden model-local retry loops.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-092
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: requested_effective_model_retry_canonical_alignment
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: requested_effective_model_retry_canonical_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0069
preserved_exact_tokens:
- Requested/Effective Model and Retry Ownership Canonical Alignment
- new attempts
- new attempt snapshots
- prerequisite-resumed work
negative_constraints:
- Providers/adapters must not hide model-local retry loops inside an already-running attempt.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Requested/effective model resolution remains separate from runtime retry policy.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-094 - Attempt Snapshot Identity Stability Across Retries

```yaml
plan_unit_id: MS-094
unit_type: runtime_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Attempt start persists stable requested/effective model snapshot identifiers, and retries/resumes cannot silently
  change model identity unless canonical runtime policy creates a new attempt with new snapshot IDs.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-093
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: attempt_snapshot_identity_stability_retries
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: attempt_snapshot_identity_stability_retries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0070
preserved_exact_tokens:
- attempt start
- stable requested/effective model snapshot identifiers
- retries and resumes
- new attempt
- new snapshot IDs
- blocked reason
- retry classification semantics
negative_constraints:
- Model fallback behavior MUST NOT rewrite blocked reason or retry classification semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-095 - UI Artifact Snapshot ID Consumption

```yaml
plan_unit_id: MS-095
unit_type: gui_consumer_rule
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: UI and artifact surfaces read model snapshot IDs from attempt records rather than inferring model identity
  from provider names alone.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-094
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_artifact_snapshot_id_consumption
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: ui_artifact_snapshot_id_consumption
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0070
preserved_exact_tokens:
- UI and artifact surfaces
- model snapshot IDs
- attempt records
- provider names alone
negative_constraints:
- UI and artifact surfaces must not infer model identity from provider names alone.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-096 - Child Run Runtime Snapshot Visibility And Effort Resolution

```yaml
plan_unit_id: MS-096
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Child runs, crew members, and planning/runtime decisions keep requested/effective model/runtime fields visible,
  resolve effort intent before translating per target surface, and do not silently fallback explicit runtime requests.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: child_run_runtime_snapshot_visibility_effort_resolution
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: child_run_runtime_snapshot_visibility_effort_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0071
preserved_exact_tokens:
- child runs
- crew members
- requested and effective model/runtime fields
- explicit child effort request
- child Persona or task preference
- weak parent hint
- target-surface default
- remapped effort values
- explicit runtime surface requests do not silently fallback
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-097 - Default Crew Runtime Settings And Copilot Normalization

```yaml
plan_unit_id: MS-097
unit_type: settings_model
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Default Crew configuration belongs under model/runtime settings and includes enablement, ordered crew members,
  per-member model/runtime selectors, and immediate whole-crew Copilot normalization because Copilot is a crew-level provider
  constraint.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-096
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: default_crew_runtime_settings_copilot_normalization
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: default_crew_runtime_settings_copilot_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0071
preserved_exact_tokens:
- Default Crew
- enable or disable Default Crew
- ordered list of crew members
- per-member model selector
- per-member provider/runtime surface selector
- immediate normalization
- Copilot
- crew-level provider selection constraint
- not a per-member freely mixed provider
negative_constraints:
- Copilot is not a per-member freely mixed provider in the default crew editor.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/CLI_Bridged_Providers.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-098 - Provider Model Policy Inputs And Audit Scope

```yaml
plan_unit_id: MS-098
unit_type: audit_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The provider/model selection policy and audit addendum surfaces canonical provider/model precedence through
  user-facing policy, capability gating, audit trail details, Persona axis, execution-unit type axis, and worktree/project/global
  scope axis.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-075
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_model_policy_inputs_audit_scope
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_model_policy_inputs_audit_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0072
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0073
preserved_exact_tokens:
- Provider/model selection policy and audit addendum
- user-facing policy
- capability gating
- audit trail details
- Persona axis
- Code Analyzer
- Documentation Writer
- Execution Unit Type axis
- run
- node
- delegated_subagent
- Scope axis
- worktree
- project
- global
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This addendum elaborates the canonical provider/model precedence owner section rather than replacing it.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```
### MS-099 - Provider Model Selection Precedence Chain

```yaml
plan_unit_id: MS-099
unit_type: selection_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider/model selection resolves through the ordered 1-7 precedence chain from explicit run-envelope override
  through provider default, preserving scoped owner policy, Persona, surface/stage, project/global, and last-used semantics.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime selection, UI surface defaults, or inspector/audit presentation
  behavior.
split_recommended: false
depends_on:
- MS-075
- MS-098
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_model_selection_precedence_chain
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_model_selection_precedence_chain
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0074
preserved_exact_tokens:
- --provider=X --model=Y
- Scoped owner policy
- execution_unit_type
- node-type uses Copilot
- Persona preference
- Surface or stage default
- code review prefers GPT-4
- Project or global config default
- Last-used state
- Provider default
- provider's canonical default model
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-100 - Settings Resolution Policy Modes

```yaml
plan_unit_id: MS-100
unit_type: settings_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Settings resolution supports Conservative, Standard, and Aggressive policies with explicit tier inclusion
  rules and default Standard behavior.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-099
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: settings_resolution_policy_modes
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: settings_resolution_policy_modes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0075
preserved_exact_tokens:
- Conservative policy
- Standard policy
- default
- Aggressive policy
- settings tier 1
- tier 3+
- tiers 1-5
- tiers 1-7
- cheapest or fastest model
negative_constraints:
- Conservative policy must not apply stage defaults or persona preferences.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-101 - Provider Capability And Multi Account Selection Gate

```yaml
plan_unit_id: MS-101
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider selection checks required model and inference capabilities plus multi-account capability facts before
  any provider/account pool can be selected or switched.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-079
- MS-084
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_capability_multi_account_selection_gate
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_capability_multi_account_selection_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0076
preserved_exact_tokens:
- Capability check
- Multi-account capability check
- supports_multi_account
- signal sources/confidence
- cooldown/retry-budget support
- reset countdown support
- provider-specific limits
- account pressure interpretation
- rotation safety
- context length
- output length
- reasoning mode
negative_constraints:
- Provider/account pools must not be selected or switched before required multi-account capability modeling is available.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-102 - Cost Budget Fallback Concern

```yaml
plan_unit_id: MS-102
unit_type: audit_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Cost gating skips models that exceed the active Persona cost budget and falls through; if all preferred models
  exceed budget or are unavailable, PM emits a concern and suggests cheaper alternatives or escalation rather than failing
  silently.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-101
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cost_budget_fallback_concern
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: cost_budget_fallback_concern
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0076
preserved_exact_tokens:
- Cost gating
- active Persona's cost budget
- skip it and move to the next in the precedence chain
- Fallback
- emit a concern (not a silent failure)
- cheaper alternatives
- escalation
negative_constraints:
- Fallback must emit a concern and must not be a silent failure.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-103 - Clamp Substitution Reason Code Taxonomy

```yaml
plan_unit_id: MS-103
unit_type: data_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Requested/effective clamp and substitution decisions use the clamp/substitution reason-code family with exact
  reason codes for unavailable, routed, substituted, unsupported, clamped, unknown, and partial projection states.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: clamp_substitution_reason_code_taxonomy
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: clamp_substitution_reason_code_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0076
preserved_exact_tokens:
- clamp/substitution
- model_unavailable
- model_routed_by_provider
- model_substituted
- effort_unsupported
- effort_clamped
- auth_family_capability_clamped
- capability_unknown
- instruction_projection_partial
- skill_projection_partial
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-104 - Clamp Substitution Semantics And Partial Evidence Disclosure

```yaml
plan_unit_id: MS-104
unit_type: audit_requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Clamp/substitution semantics distinguish PM inability from provider-side rerouting, unsupported effort from
  accepted-but-narrowed effort, and partial/unknown evidence from fully honored model, capability, or instruction state.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime selection, UI surface defaults, or inspector/audit presentation
  behavior.
split_recommended: false
depends_on:
- MS-103
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: clamp_substitution_semantics_partial_evidence_disclosure
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: clamp_substitution_semantics_partial_evidence_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0076
preserved_exact_tokens:
- /substitution
- PM inability
- provider-side rerouting
- unsupported effort controls
- accepted-but-narrowed effort controls
- partial or unknown evidence
- fully honored model/capability/instruction state
negative_constraints:
- UI must not present a fully honored model, capability, or instruction state when PM has only partial or unknown evidence.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-105 - Selection Reason Payload Contract

```yaml
plan_unit_id: MS-105
unit_type: data_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider/model selection emits a selection_reason object carrying selected provider/model, precedence tier,
  optional fallback reason, alternatives considered, selection timestamp, and execution unit identity.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-099
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: selection_reason_payload_contract
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: selection_reason_payload_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0077
preserved_exact_tokens:
- selection_reason
- selected_provider
- selected_model
- precedence_tier
- fallback_reason?
- 'alternatives: Array'
- selection_time_utc
- execution_unit_id
- '''openai'''
- '''anthropic'''
- '''github'''
- '''gpt-4'''
- '''claude-3-opus'''
- 1-7
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: Primitive:Persona, Primitive:ExecutionUnitContext, ContractName:Plans/Executor_Protocol.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-106 - Selection Reason Audit Trail Traceability

```yaml
plan_unit_id: MS-106
unit_type: audit_requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Selection metadata is logged so inspectors and auditors can trace why a model was chosen and what constraints
  were active.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-105
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: selection_reason_audit_trail_traceability
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: selection_reason_audit_trail_traceability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0077
preserved_exact_tokens:
- inspectors
- auditors
- trace why a particular model was chosen
- constraints were active
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Selection reason metadata supports inspector and auditor traceability without creating WorkNodes.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: Primitive:Persona, Primitive:ExecutionUnitContext, ContractName:Plans/Executor_Protocol.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```
### MS-001 - Models System Retired Source-Preserving Bridge

```yaml
plan_unit_id: MS-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: MS-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 099 because Models_System-S0001
  through Models_System-S0081 are covered by MS-002 through MS-106 or explicit structural, retired, and migration-coverage
  dispositions. MS-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried
  by fine-grained Models_System PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- MS-099
- MS-100
- MS-101
- MS-102
- MS-103
- MS-104
- MS-105
- MS-106
unblocks: []
acceptance_criteria:
- MS-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 099.
- Models_System-S0001 through Models_System-S0081 product coverage is owned by MS-002 through MS-106 or explicit structural,
  retired, and migration-coverage dispositions.
- MS-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0080
preserved_exact_tokens:
- MS-001
- Models System Residual Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- MS-001 must not re-own Models_System-S0001 through Models_System-S0081 after Phase 2B batch 099.
- MS-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- MS-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former MS-001 residual source-preserving bridge is retired by Phase 2B batch 099.
owner_boundary_notes:
- MS-002 through MS-106 and explicit coverage dispositions own Models_System product coverage after bridge retirement.
- Models_System-S0080 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- 'ContractRef: Primitive:Persona, Primitive:ExecutionUnitContext, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
split_recommendation_reason: No split remains for the retired bridge; product coverage has been atomized or structurally dispositioned.
```
