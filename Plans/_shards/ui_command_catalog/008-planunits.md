# Shard 008: PlanUnits

Source: `Plans/UI_Command_Catalog.md`

Source lines: L1227-L6828

Source SHA256: `02323e502a05915eddbfc088b3d61646eeb1129e70c380e966db31f8455ea7e1`

---

## PlanUnits

### UCC-002 - Command Catalog Owner Identity

```yaml
plan_unit_id: UCC-002
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: UI_Command_Catalog.md is the canonical owner document for stable UI command catalog requirements and preserves product, runtime, storage, UI, and governance details in owner-section form.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-002 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: ui_command_catalog_owner_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0002
preserved_exact_tokens:
- UI Command Catalog (Canonical)
- Canonical owner-section requirements
- stable UI command catalog
- owner-section requirements
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- cmd.project.chain_wizard_open_deferred remains a legacy command alias for deferred Planning Wizard intake; active product copy and affected surfaces use Planning Wizard terminology until a dedicated command-ID migration is accepted.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-003 - Compatibility Vocabulary Noncanon

```yaml
plan_unit_id: UCC-003
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Compatibility-only source vocabulary is noncanonical; live UI command wording uses the owner terminology preserved in this document.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-003 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: compatibility_vocabulary_noncanon
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0003
preserved_exact_tokens:
- Retire tier-era canon and shadow fields
- Compatibility-only source vocabulary
- noncanonical
- live wording
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Compatibility-only source vocabulary remains source lineage rather than live command canon.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-004 - Compliance Naming And SSOT Header

```yaml
plan_unit_id: UCC-004
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The catalog follows DRY and contract SSOT references, uses Puppet Master as the only platform name, treats older names only as legacy naming, and preserves the UI command SSOT header.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-004 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_catalog_compliance_and_naming
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0004
preserved_exact_tokens:
- Canonical route payload
- Puppet Master
- legacy naming
- PUPPET MASTER -- UI COMMAND SSOT
- ABSOLUTE NAMING RULE
negative_constraints:
- Older naming must be referred to only as legacy naming and must not be quoted as active canon.
preserved_contractrefs:
- 'ContractRef: Plans/DRY_Rules.md'
- 'ContractRef: Plans/Contracts_V0.md'
compatibility_only_notes:
- Older naming is compatibility-only source vocabulary.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-005 - Stable Command Id Scope

```yaml
plan_unit_id: UCC-005
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: UI command IDs are stable SSOT identifiers referenced by plans and tests; GUI labels may clean casing or spacing, but internal IDs remain stable, collision-safe, and preserve canonical command-id tokens.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-005 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: stable_command_id_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0005
preserved_exact_tokens:
- 0. Scope
- stable UI command IDs
- GUI labels
- internal IDs
- collision-safe
- hyphens
- canonical command-id tokens
negative_constraints:
- GUI label normalization must not destructively strip hyphens or other canonical command-id tokens.
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-006 - Command Id Naming Rules

```yaml
plan_unit_id: UCC-006
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: UI command IDs must be lowercase, dot-separated, and prefixed with cmd.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-006 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_id_naming_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0006
preserved_exact_tokens:
- 1. Naming rules
- lowercase
- dot-separated
- cmd.
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-007 - Canonical Command Family Container

```yaml
plan_unit_id: UCC-007
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The Canonical command IDs section contains normalized command families, including promoted Section 15 families organized around shared navigation, search routing, and runtime recovery ownership.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-007 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: canonical_command_family_container
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0008
preserved_exact_tokens:
- 2. Canonical command IDs
- 2.0A Promoted Section 15 command families
- shared navigation
- search routing
- runtime recovery ownership
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-008 - Command Entry Metadata Contract

```yaml
plan_unit_id: UCC-008
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Live command rows carry command_id, label, description, preconditions, command_kind, normalization.kind, normalizes_to_contract, and alias_of_command_id so consumers can classify actions without reading handlers.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-008 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_entry_metadata_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0009
preserved_exact_tokens:
- 2.0 Command entry contract (doc-level)
- command_id
- label
- description
- preconditions
- command_kind
- shell_view
- navigation_wrapper
- domain_action
- normalization.kind
- normalizes_to_contract
- alias_of_command_id
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-009 - Catalog Route Wiring Boundary

```yaml
plan_unit_id: UCC-009
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The command catalog owns command metadata and normalization intent, the route schema owns route-target structure, and wiring rows reference command IDs and handlers without restating full routing semantics.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-009 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: catalog_route_wiring_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0009
preserved_exact_tokens:
- command catalog / command contract layer
- route schema
- route-target structure
- wiring rows
- route_target
negative_constraints:
- Wiring and gate checks must not infer command metadata from handler names or row-local prose.
- Command metadata must not inline route payload shape, object kinds, or argument mapping rules.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-010 - Action Availability Gate Inputs

```yaml
plan_unit_id: UCC-010
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: UI action availability is scoped by user role, execution_role, active run mode, concern state, blocked_sequence, approval_scope_key, approval_id, and DAE jail posture, and side-effecting commands route through permissions and route/open contracts.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-010 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: action_availability_gate_inputs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0010
preserved_exact_tokens:
- 2.0B Action-surface policy
- User role
- execution_role
- active run mode
- blocked_sequence
- approval_scope_key
- approval_id
- DAE jail posture
- external side-effects
negative_constraints:
- The UI surfaces run mode changes, approval decisions, and blocked recovery but does not make those decisions locally.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-011 - Projection Freshness And Verification Lenses

```yaml
plan_unit_id: UCC-011
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Mutating domain_action commands must apply catalog-wide projection-freshness gating before dispatch, and catalog verification must cover UX flow, storage/audit, tools/permissions/provider/identity, and cross-doc routing semantics.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-011 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: projection_freshness_dispatch_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0010
preserved_exact_tokens:
- domain_action
- projection-freshness
- source projection freshness/health
- unavailable
- refresh/revalidation
- UX / flow / action-surface behavior
- state / storage / command / audit-trail behavior
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale, missing, or degraded projection health prevents mutation or forces revalidation before dispatch.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-012 - Route Open Required Fields And Audit Trail

```yaml
plan_unit_id: UCC-012
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Route/open UI commands preserve route_target, OpenSubject, execution_unit_context, approval_scope_key, and operational_identity, with file/provider mutations guarded and route completion refs immutable for audit.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-012 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: route_open_required_fields_and_audit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0011
preserved_exact_tokens:
- route_target
- OpenSubject
- execution_unit_context
- approval_scope_key
- operational_identity
- route completion refs
- audit trail
negative_constraints:
- If route_target becomes unreachable between command build and execution, the UI displays an error and does not attempt fallback mutation.
preserved_contractrefs:
- 'ContractRef: Primitive:RouteTarget, Primitive:OpenSubject, Primitive:ExecutionContext, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-013 - Panel Context And Tab Route Identity

```yaml
plan_unit_id: UCC-013
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Wrapper commands may carry shared panel-context vocabulary for deep-link and cross-surface focus; tab_id is stable page-tab focus, and route-shaped payloads keep route_target, OpenSubject, and panel-context identity distinct from shell/view-state hints.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-013 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: panel_context_and_tab_route_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0011
preserved_exact_tokens:
- panel-context
- project_id
- repo_id?
- worktree_id?
- workflow_ref?
- run_id?
- attempt_id?
- subview?
- tab_id
- /view-state
- /switch_subview
negative_constraints:
- Panel-context is shared wrapper vocabulary only and is not a new cmd.nav family or replacement for route_target or OpenSubject.
- View-state and selected-subview hints must not be used as runtime-local mutation payloads.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-014 - Navigation Wrapper Alias Discipline

```yaml
plan_unit_id: UCC-014
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Object-targeting behavior must use route-consuming wrapper commands or normalized route_target arguments; compact cmd.nav aliases remain optional migration aliases that normalize to route_target and OpenSubject without replacing owner command IDs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-014 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: navigation_wrapper_alias_discipline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0011
preserved_exact_tokens:
- cmd.panel.switch
- navigation_wrapper
- cmd.project.open
- cmd.artifacts.show_in_*
- cmd.nav.open_subject
- cmd.nav.open_usage_subject
- cmd.nav.focus_route
- route_target
- OpenSubject
- legacy names
negative_constraints:
- Do not promote a broad public cmd.nav or cmd.nav.* family merely to avoid owner-specific wrappers.
- Domain wrappers must not invent private route args.
preserved_contractrefs: []
compatibility_only_notes:
- Public cmd.nav / cmd.nav.* IDs are optional migration aliases, not a replacement target language.
- Navigation compatibility is not a winner/loser or /loser alias table.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-015 - Normalized Command Record Envelope

```yaml
plan_unit_id: UCC-015
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Button, keyboard, menu, context, CLI, and API commands normalize to a standard record preserving command_id, command_type, source_surface, target scope/identity, parameters, route/open fields, approval scope, operational identity, and created time.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-015 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: normalized_command_record_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0012
preserved_exact_tokens:
- command_id
- command_type
- source_surface
- target_scope
- target_id
- action_intent
- parameters
- route_target?
- open_subject?
- approval_scope_key
- operational_identity
- created_utc
negative_constraints:
- Command normalization preserves user intent without rewriting route_target or OpenSubject.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md §route_target and OpenSubject, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-016 - Tier Era Compatibility Retirement

```yaml
plan_unit_id: UCC-016
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: TierContext, tier_id, TierType, Tiers, allowed_actions[], reason_code, recovery_options[], approve_continue, and tier-era event examples are compatibility-only and current runtime approvals resolve through package/seam/lane identity and blocked-state contracts.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-016 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: tier_era_compatibility_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0013
preserved_exact_tokens:
- TierContext
- tier_id
- TierType
- Tiers
- allowed_actions[]
- reason_code
- recovery_options[]
- approve_continue
- run.started
- usage.event
- hitl.approval_requested
- package/seam/lane
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Legacy tier-era event and approval examples are compatibility-only.
stale_retired_dispositions:
- Tier-era runtime canon is retired from live command catalog semantics.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-017 - Stale Command Family Retirement Guard

```yaml
plan_unit_id: UCC-017
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Highest-risk stale command, environment/config, question, persona/runtime, blocked recovery, web error, and web action enum tokens remain explicit retirement evidence rather than active command IDs or payload fields.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-017 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: stale_command_family_retirement_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0014
preserved_exact_tokens:
- cmd.chat.delete_message
- Bare /web
- cmd.web.search
- cmd.web.fetch
- cmd.web.extract
- cmd.web.research
- cmd.chat.web.search
- OPENCODE_DISABLE_LSP_DOWNLOAD
- OPENCODE_LSP_TIMEOUT
- QuestionInput
- QuestionAnswer
- requested_persona_id
- effective_persona_id
- unblock_action_ids
- invalid_url
- fetch_failed
- provider_unavailable
- credit_cap_exceeded
- wait | screenshot | select | hover | evaluate | press | focus
negative_constraints:
- cmd.chat.delete_message is not an active catalog command.
- cmd.web.search is not the implicit destination for bare /web.
- Open in Terminal and Show Terminal must not both normalize to cmd.terminal.show.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy grouped cmd.web.* names are compatibility-only retirement evidence.
stale_retired_dispositions:
- The stale web-action enum string is not the canonical WebAction enum.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-018 - Artifact Drill Through Gap Guard

```yaml
plan_unit_id: UCC-018
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: gap-003 artifact drill-through commands route through Usage and the shared route/open contract; old tool-summary payloads such as tool_name, invocation_summary, options, and No remaining gaps remain source-lineage only.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-018 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: artifact_drill_through_gap_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- gap-003
- artifact drill-through
- '{ tool_name, invocation_summary, options }'
- tool_name
- invocation_summary
- No remaining gaps
negative_constraints:
- Old tool-summary tuples are not active command-catalog payload canon.
preserved_contractrefs: []
compatibility_only_notes:
- Tool summary payload tokens remain source-lineage only unless owner contracts bind current route/open behavior.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-019 - Gui Readiness Command Coverage Gaps

```yaml
plan_unit_id: UCC-019
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Later-model GUI readiness requires projection-trust, gating, MVP, GUI, IDs, promoted-feature, multi-project-tab, attention-center, runtime cmd.runtime.* ownership, and cross-doc command-family gaps to resolve to catalog rows or owner retirements.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-019 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_readiness_command_coverage_gaps
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- /projection-trust
- /gating
- MVP
- GUI
- IDs
- later-model
- promoted-feature
- multi-project-tab
- attention-center
- cmd.runtime.*
- FinalGUISpec.md
- Orchestrator_Page.md
- cmd.orchestrator.switch_tab
- cmd.chat.run_user_command
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Cross-doc command ownership gaps are machine-breaking gaps, not editorial cleanup.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-020 - Readiness Blocker Owner Defects

```yaml
plan_unit_id: UCC-020
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Audit survivors, wiring/template drift, uncataloged IDs, stable action IDs, stale references, packaging authority splits, and naming-rule claims remain command-readiness blockers until resolved through catalog IDs, wiring rows, and owner-documented retirement.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-020 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: readiness_blocker_owner_defects
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- Audit-survivor command gaps
- /wiring/template
- uncataloged command IDs
- stable action IDs
- Plans/Commands_System.md
- missing anchors
- stale section references
- /packaging
- naming-rule
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Command readiness blockers are gate-breaking owner defects, not summary cleanup.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-021 - Uncataloged Signal And Extraction Hazard Guard

```yaml
plan_unit_id: UCC-021
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Uncataloged owner signals and extraction hazards remain registration or retirement obligations; prose, filenames, examples, indexes, deprecated-ID markers, and cmd.*.json/schema.json names do not become command IDs merely by appearing in source text.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-021 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: uncataloged_signal_extraction_hazard_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- cmd.orchestrator.preview_
- cmd.orchestrator.preview_*
- cmd.orchestrator.push_image
- /build/open-artifact
- CustomHeadlessTool
- ToolID
- /tool/permission
- memory.gist
- live.*
- auto-trigger
- /project-switch
- /handoff
- /deprecated-ID
- owner-doc-to-catalog
- Wiring_Matrix.schema.json
- cmd.*.json
- schema.json
- workspace-tab
negative_constraints:
- Extraction hazards are not valid command IDs merely because they appear in prose, filenames, examples, or index summaries.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-022 - Lean Wiring Schema And Usage Drift Boundary

```yaml
plan_unit_id: UCC-022
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Wiring_Matrix.schema.json stays lean by pointing to catalog and route/open contracts, while usage and artifact summary drift remains a consumer/owner gap rather than a command payload shape.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-022 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: lean_wiring_usage_drift_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- Wiring_Matrix.schema.json
- row-local metadata
- route/open contracts
- gap-008
- result_id
- account-history
- projection-health
- missing_data_shape
- restore points
- artifact_kind
- task_id
negative_constraints:
- Wiring rows must not repeat route payload or command-normalization rules in every row.
preserved_contractrefs: []
compatibility_only_notes:
- Usage/artifact drift tokens remain stale or consumer-side lineage unless owner contracts bind current projections.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-023 - Hitl Runtime Governance Binding

```yaml
plan_unit_id: UCC-023
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Legacy HITL and runtime-governance terms resolve through permission, route/open, DAE, and blocked-runtime owners; high-consequence runtime actions bind to canonical blocked-state and HITL command contracts rather than ad hoc UI confirmations.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-023 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: hitl_runtime_governance_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- HITLRequest
- allowed_actions
- allowed_actions[]
- approve_continue
- blocked_owner
- GPT
- DAE
- branch-ownership
- /resume/restart
- external_publish_side_effect
- pre-dispatch
- non-bypassable
- yolo
- high-consequence
negative_constraints:
- Runtime governance must not leave blocked_owner, GPT, DAE, branch ownership, isolated substrate, resume/restart, external publish side effects, pre-dispatch, counter-family, non-bypassable, or yolo as unowned command behavior.
preserved_contractrefs: []
compatibility_only_notes:
- HITLRequest and allowed_actions vocabulary is compatibility-only once cmd.runtime.* and blocked_sequence own recovery.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-024 - Run Graph Template And Crosswalk Boundaries

```yaml
plan_unit_id: UCC-024
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Run Graph consumers, command template examples, execution_unit_context, Crosswalk route primitives, thread-search identities, and wrapper metadata must consume cataloged command IDs and route/open boundaries without minting conflicting payloads.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-024 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: run_graph_template_crosswalk_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- Run_Graph_View.md
- UI_Command_Catalog
- /template/example
- execution_unit_context
- Crosswalk.md
- Primitive:RouteTarget
- Primitive:OpenSubject
- object_kind = message
- object_id = <message_id>
- thread_id
- wrapper-vs-alias
negative_constraints:
- Graph-local specs must not mint conflicting HITL payloads or recovery IDs.
- Thread search object_kind/object_id/message_id must not be replaced by page-local search result identifiers.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-025 - Object Route Subject Open And Resume Url Discipline

```yaml
plan_unit_id: UCC-025
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Object routes use canonical domain IDs, compatibility widgets remain display-only, History deletion needs durable audit and disposition semantics, OpenFile preserves placement as target_group only, subject-open wrappers cover route/focus pivots, and resume_url is route transport.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-025 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: object_route_subject_open_resume_url_discipline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- object_kind
- object_id
- tier_id
- widget.tier_tree
- widget.progress_bars
- Delete Run
- OpenFile { path, line?, range?, target_group? }
- subject-open
- /route
- /navigation
- /focus/show
- message_id
- workflow_run_id
- scheduler_pass_id
- safe_point_id
- remediation_root_id
- resume_url
negative_constraints:
- tier, tier_id, raw widget ids, panel ids, and serialization tokens do not belong in object_kind.
- resume_url is serialized route transport, not an independent route primitive.
preserved_contractrefs: []
compatibility_only_notes:
- Tiers-tab widgets are compatibility-only display widgets.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-026 - Operational Identity Schema Owner And Envelope Boundary

```yaml
plan_unit_id: UCC-026
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Ledger export, show-in commands, operational identity displays, runtime-artifact/worktree/account owner schemas, route ID discipline, blocked runtime identity tuples, UICommand args, and Crosswalk primitives preserve owner boundaries rather than local schema ownership.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-026 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: operational_identity_schema_owner_envelope_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- CSV
- JSON
- JSONL
- operational_identity
- GitHub
- /registry/Kubernetes
- runtime-artifact
- /record
- /projections
- object_kind/object_id
- subject_id
- inspector_target
- run_id + node_id + attempt_id? + blocked_sequence?
- UICommand.args
- UICommand envelope
- DocumentPane
- DocumentCheckpoint
negative_constraints:
- Operational identity displays must not overload account provider fields or become one-off surface widgets.
- inspector_target does not replace tab_id.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-027 - Shell View Source Lineage And Command Backfill Guard

```yaml
plan_unit_id: UCC-027
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Orchestrator shell-view commands bind to upstream data-source owners, source-lineage packet names stay noncanonical, Run Graph and page conflicts resolve toward runtime and route primitives, command-system ghost IDs resolve through catalog aliases/retirements, and widget shell navigation stays route-aware.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-027 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: shell_view_source_lineage_backfill_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0015
preserved_exact_tokens:
- /history/evidence
- Ledger
- exact_items
- meta.json
- pm.work_item_meta.v2
- current_state
- canon_inventory
- open_gaps
- Audit Mode
- /action-gating
- cmd.graph
- cmd.graph.*
- /wiring
- /superseded
- override_builtin
- cmd.chat.branch_from_restore
- cmd.panel.switch
- panel_id
negative_constraints:
- Source-lineage packet names and process inventory files remain noncanonical.
- Command-system backfill must not create a second command system.
- cmd.panel.switch must not become a hidden object-targeting command when a stable route command exists.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-028 - Wiring Acceptance Hooks Contract

```yaml
plan_unit_id: UCC-028
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Every catalog command must be verifiable through the Wiring Matrix with handler registration, event-emission tests when events are declared, UI element binding, and testable acceptance_checks; commands with no persisted domain event remain subject to handler and UI binding checks.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-028 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: wiring_acceptance_hooks_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0016
preserved_exact_tokens:
- 2.0.1 Acceptance hooks contract (wiring verification)
- Handler registration
- Event emission verification
- UI element binding
- Acceptance checks
- no persisted domain event
- expected_event_types
- acceptance_checks
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Wiring_Rules.md, SchemaID:Wiring_Matrix.schema.json, Gate:GATE-010, Invariant:INV-011, Invariant:INV-012'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-029 - Github Auth Command Family Anchor

```yaml
plan_unit_id: UCC-029
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The GitHub auth command family is the GitHub HTTPS API-only catalog section for GitHub connection and disconnection command rows.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-029 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: github_auth_command_family_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0017
preserved_exact_tokens:
- 2.1 GitHub auth (GitHub HTTPS API only)
- GitHub HTTPS API only
- cmd.github.connect
- cmd.github.disconnect
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-030 - Github Connect Command Contract

```yaml
plan_unit_id: UCC-030
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: cmd.github.connect starts a fresh GitHub OAuth device-code flow with empty args locked by Spec Lock, emits device-code/polling/authenticated-or-failed events, affects GitHub/Auth setup surfaces, and uses recovery wrappers with keyed context for deferred reconnect.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-030 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: github_connect_command_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0018
preserved_exact_tokens:
- cmd.github.connect
- arg-less
- device-code
- project_id
- auth_realm
- effective-account snapshot/ref
- source /ref
- auth.github.device_code.issued
- auth.github.token.polling
- auth.github.authenticated
- auth.github.failed
negative_constraints:
- Deferred reconnect and recovery wrappers must not stay arg-less, under-keyed, or split-brain.
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, SchemaID:Spec_Lock.json#locked_decisions.auth_model'
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md'
- 'ContractRef: UICommand:cmd.github.connect'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-031 - Github Disconnect Command Contract

```yaml
plan_unit_id: UCC-031
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: cmd.github.disconnect uses empty args, deletes the GitHub token from credential storage, emits auth.github.disconnected, and affects Settings > GitHub/Auth and Dashboard auth status.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-031 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: github_disconnect_command_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0019
preserved_exact_tokens:
- cmd.github.disconnect
- delete token
- credential store
- auth.github.disconnected
- Settings > GitHub/Auth
- Dashboard auth status
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Contracts_V0.md#AuthState'
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md'
- 'ContractRef: UICommand:cmd.github.disconnect'
- 'ContractRef: UICommand:cmd.github.connect, UICommand:cmd.github.disconnect'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-032 - Project Management Deferred Wizard Commands

```yaml
plan_unit_id: UCC-032
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Project management and deferred wizard command IDs cover adding/opening projects, creating local or GitHub-backed projects, and opening deferred chain wizard payloads with the required args, events, and affected surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-032 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: project_management_deferred_wizard_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0020
preserved_exact_tokens:
- cmd.project.add_existing
- cmd.project.new_local
- cmd.project.new_github_repo
- cmd.project.open
- cmd.project.chain_wizard_open_deferred
- project.added
- project.created
- git.clone.completed
- wizard.opened
- wizard.deferred_payload.loaded
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md#d-project-management-flows-no-chain-wizard-required, ContractName:Plans/chain-wizard-flexibility.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-033 - File Manager Command Rows And Target Enum

```yaml
plan_unit_id: UCC-033
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: File Manager command rows define stable file/folder operations, clipboard intent, paste/copy/move/export behavior, PM-native open_with targets, valid target scope, and exclude system_default from the MVP canonical target enum.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-033 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: file_manager_command_rows_target_enum
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0021
preserved_exact_tokens:
- cmd.file.new_file
- cmd.file.new_folder
- cmd.file.rename
- cmd.file.delete
- cmd.file.copy_path
- cmd.file.copy_nodes
- cmd.file.cut_nodes
- cmd.file.paste_nodes
- cmd.file.open_with
- cmd.file.save_local_copy
- source_editor
- image_viewer
- workspace_preview
- detached_preview
- diff_review
- system_default
negative_constraints:
- system_default is not part of cmd.file.open_with canonical MVP target enum.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md#114-open-with-and-save-local-copy, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-034 - Lsp Common Args Events And Surfaces

```yaml
plan_unit_id: UCC-034
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: LSP minimum commands share path/position args where applicable, emit tool.invoked or tool.denied events, and affect File editor, Problems panel, and Chat when LSP-in-chat is enabled.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-034 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: lsp_common_args_events_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0022
preserved_exact_tokens:
- 2.2 LSP (minimum required)
- path
- position
- line
- character
- tool.invoked
- tool.denied
- File editor
- Problems panel
- Chat
- LSP-in-chat
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md'
- 'ContractRef: ContractName:Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-035 - Lsp Command Id List

```yaml
plan_unit_id: UCC-035
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The minimum LSP command ID list includes goto definition, find references, rename symbol, format document/selection, code action, goto symbol, open problems, and restart server commands with their args.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-035 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: lsp_command_id_list
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0023
preserved_exact_tokens:
- cmd.lsp.goto_definition
- cmd.lsp.find_references
- cmd.lsp.rename_symbol
- cmd.lsp.format_document
- cmd.lsp.format_selection
- cmd.lsp.code_action
- cmd.lsp.goto_symbol
- cmd.lsp.open_problems
- cmd.lsp.restart_server
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/LSPSupport.md#13'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-036 - Widget Layout Command Rows

```yaml
plan_unit_id: UCC-036
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Widget layout command rows define add, remove, resize, configure, move, and reset_layout commands with widget-hostability limited to Dashboard, Usage page, and actual Orchestrator widget-tab surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-036 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_188
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: widget_layout_command_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0024
preserved_exact_tokens:
- cmd.widget.add
- cmd.widget.remove
- cmd.widget.resize
- cmd.widget.configure
- cmd.widget.move
- cmd.widget.reset_layout
- Dashboard
- Usage page
- Orchestrator widget tabs
- widget-hosted
negative_constraints:
- cmd.widget.* rows do not imply that every Orchestrator tab is widget-composed.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md#11, ContractName:Plans/Contracts_V0.md#7-uicommand'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-037 - Run Graph Runtime Recovery Wrapper Normalization

```yaml
plan_unit_id: UCC-037
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Run Graph approval and recovery commands target blocked/runtime identity, graph-facing wrappers normalize to runtime command families and route_target semantics, and cmd.graph.approve_hitl/cmd.graph.deny_hitl are not canonical command IDs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-037 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: run_graph_runtime_recovery_wrapper_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0025
preserved_exact_tokens:
- 2.4 Run Graph commands
- Canonical Runtime Recovery Command Consolidation (2026-03-09)
- blocked/runtime identity
- request_id
- cmd.graph.approve_hitl
- cmd.graph.deny_hitl
- cmd.runtime.*
- route_target
negative_constraints:
- cmd.graph.approve_hitl and cmd.graph.deny_hitl do not remain canonical command IDs.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Run_Graph_View.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-038 - Orchestrator Route Wrapper And Preview Build Rows

```yaml
plan_unit_id: UCC-038
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Canonical Orchestrator object, review, receipt, source-control, GitHub Actions, Docker/Kubernetes, conflict, preview, build, artifact, and image-push command rows are route-consuming wrappers or approved side-effect commands with preserved route/open semantics.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-038 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: orchestrator_route_wrapper_preview_build_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0025
preserved_exact_tokens:
- cmd.orchestrator.focus_object
- cmd.orchestrator.open_graph_generation
- cmd.orchestrator.open_source_control
- cmd.orchestrator.open_github_actions
- cmd.orchestrator.open_docker_manager
- cmd.orchestrator.open_kubernetes
- cmd.orchestrator.preview_open
- cmd.orchestrator.build_run
- cmd.orchestrator.push_image
- preview_target_resolvable
- build_profile_resolvable
- permission_allowed
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes:
- cmd.orchestrator.open_* pivots are compatibility aliases for owner-surface route opens.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-039 - Orchestrator Metadata And Permission Carry Through

```yaml
plan_unit_id: UCC-039
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Orchestrator command metadata preserves action_type, target scope/kind, palette and shortcut eligibility, confirmation strength, reversibility, route identity, labels, and mutation confirmation/safety-class carry-through.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-039 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: orchestrator_metadata_permission_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0025
preserved_exact_tokens:
- action_type
- target_scope
- palette_visible
- shortcut_eligible
- confirmation_strength
- reversibility
- target_kind
- subject_id
- object_kind
- object_id
- tab_id
- inspector_target
- navigation vs mutation
- confirmation
- route_target
- Open
- Review
- Resolve
- Export
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Orchestrator_Page.md#10. Search, routing, and action policy, Plans/Contracts_V0.md#7.3 `route_target`'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-040 - Operational External System Family Boundary

```yaml
plan_unit_id: UCC-040
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Source Control, GitHub Actions, and Docker Manager command families manage live external system boundaries and keep stable canonical IDs even when hosting panels or toolbars evolve.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-040 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: operational_external_system_family_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0026
preserved_exact_tokens:
- 2.5A Operational external-system command families
- cmd.source_control.*
- cmd.actions.*
- cmd.docker.*
- repository state
- remote CI workflows
- local container runtime
- purely local layout toggle
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-041 - Operational Namespace Reservations And Alias Rules

```yaml
plan_unit_id: UCC-041
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Operational namespaces reserve Source Control, git worktree, GitHub Actions, Docker, Docker Kubernetes, Kubernetes compatibility aliases, and core first-party prefixes against plugin/custom override while preserving explicit extension verbs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-041 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: operational_namespace_reservation_alias_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0027
preserved_exact_tokens:
- cmd.source_control.*
- cmd.git.worktree.*
- cmd.github.actions
- cmd.github.actions.*
- cmd.actions.*
- cmd.docker.container.*
- cmd.docker.image
- cmd.docker.compose.*
- cmd.docker.k8s
- cmd.k8s.*
- source_control
- github_actions
- docker
- k8s
- kubernetes
- registry
negative_constraints:
- Custom/plugin commands may compose with reserved first-party families only by using explicit extension verbs that do not replace canonical meaning.
preserved_contractrefs: []
compatibility_only_notes:
- Existing cmd.actions.* rows are compatibility aliases until migrated.
- Existing cmd.k8s.* rows are compatibility aliases unless updated to cmd.docker.k8s.*.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-042 - Operational Coverage Breadth And Disabled State Requirements

```yaml
plan_unit_id: UCC-042
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Operational command coverage must include Source Control navigation/history/graph/worktrees/git operations, GitHub Actions rerun/cancel/pin/admin/current-branch/log pivots, Docker Manager images/compose/bake/context/network/volume/Kubernetes/auth/publish/remediation families, and deterministic disabled-state/help behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-042 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: operational_coverage_breadth_disabled_states
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0027
preserved_exact_tokens:
- /history/graph/worktrees
- /conflict/graph
- /unstage/discard/diff/commit/push/pull/sync/fetch/branch/stash
- /cancel/pin/admin/current-branch
- /detail/logs
- /detail/job-expand/view-logs/download-log
- /images/compose/build-bake/contexts/networks/volumes/runtime
- /auth/Unraid
- /publish/template
- /underdefined
- /admin/help
negative_constraints:
- The command catalog must not remain publish-centric or underdefined.
- Any underdefined command family must resolve to a first-class owner command or documented compatibility alias.
preserved_contractrefs: []
compatibility_only_notes:
- Existing Git basics, Actions list/detail/logs, and Docker publish/auth/template flows are well-covered but no longer sufficient.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-043 - Operational Route Wiring Persistence And Owner Boundaries

```yaml
plan_unit_id: UCC-043
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Operational wiring uses first-class route commands and per-project persistence for Source Control, GitHub Actions, and Docker Manager, while GitHub API remains backend plumbing and owner boundaries stay explicit across catalog consumers.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-043 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: operational_route_wiring_persistence_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0027
preserved_exact_tokens:
- Open in Source Control
- SCM
- repo
- worktree
- compare target
- baseline
- run/attempt lineage
- restore-before-rerun
- baseline_target
- source_control.project_state.{project_id}
- github_actions.project_state.{project_id}
- Docker Manager
- GitHub API
- backend plumbing
- Plans/00-plans-index.md
- Plans/Crosswalk.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-044 - Source Control Review Diff Conflict Command Rows

```yaml
plan_unit_id: UCC-044
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Source Control review, conflict, merge editor, git diff, hunk staging, discard, and conflict resolution command rows define stable command IDs, payloads, confirmations, and preconditions for review and conflict workflows.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-044 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: source_control_review_diff_conflict_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0028
preserved_exact_tokens:
- cmd.source_control.open_review
- cmd.source_control.review.open
- cmd.source_control.review.swap
- cmd.source_control.set_compare_target
- cmd.source_control.open_conflict
- cmd.source_control.open_merge_editor
- cmd.git.diff_open
- cmd.git.diff_toggle_mode
- cmd.git.diff_set_compare_target
- cmd.git.stage_hunks
- cmd.git.unstage_hunks
- cmd.git.discard_hunks
- cmd.git.conflict_apply_resolution
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- cmd.source_control.review.open is a compatibility alias for cmd.source_control.open_review.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-045 - Source Control Graph History Stash And Commit Assistance Rows

```yaml
plan_unit_id: UCC-045
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Source Control graph focus/filter/layout, history open, tab selection, stash controls, AI commit batching, accepted commit groups, and generated commit-message rows preserve graph/history/stash and advisory commit-assistance behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-045 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: source_control_graph_history_stash_commit_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0028
preserved_exact_tokens:
- cmd.source_control.graph.focus
- cmd.source_control.graph.filter
- cmd.source_control.graph.layout
- cmd.source_control.graph.focus/filter/layout
- cmd.source_control.graph_focus
- cmd.source_control.graph_filter
- cmd.source_control.history_open_commit
- cmd.source_control.select_tab
- cmd.source_control.stash
- cmd.source_control.stash.*
- cmd.source_control.suggest_commit_batches
- cmd.source_control.suggest_commit_groups
- cmd.source_control.accept_commit_group
- cmd.source_control.generate_commit_message
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Graph focus/filter/layout grouped names and suggest_commit_groups are compatibility alias families.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-046 - Source Control Compare Persistence And Disabled Boundary

```yaml
plan_unit_id: UCC-046
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Compare-open identity is repository-scoped, review state persists per project, conflict assistant records events and blocked handoffs without persisting conflicted file content, disabled states explain concrete blockers, and route/view ownership remains Source Control-owned.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-046 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: source_control_compare_persistence_disabled_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0028
preserved_exact_tokens:
- compare_open
- project_id
- repo_id
- repo_relative_path
- worktree_id
- side_by_side
- unified
- stage_hunk
- unstage_hunk
- discard_hunk
- /open-resolution
- Review mode state
- per-project persistence
- /event/storage
- /disabled
- stale-target
- Source Control > Changes
negative_constraints:
- No consumer surface may create ad hoc compare, /diff, /compare, or /compare/stage state from path strings alone.
- Conflict assistant commands do not persist conflicted file content.
preserved_contractrefs: []
compatibility_only_notes:
- compare_open maps to cmd.source_control.open_review or cmd.git.diff_open.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-047 - Github Actions Run Job Log Browser Rows

```yaml
plan_unit_id: UCC-047
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: GitHub Actions command rows cover show/switch/rerun/cancel, workflow pin/unpin/settings, open current branch, open related diff, logs, workflow/job detail, retry, copy URL, copy logs, open in GitHub, branch-to-diff, and run-to-browser pivots.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-047 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: github_actions_run_job_log_browser_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0029
preserved_exact_tokens:
- cmd.actions.show
- cmd.actions.switch_subview
- cmd.actions.rerun
- cmd.actions.cancel
- cmd.github.actions.pin
- cmd.github.actions.unpin
- cmd.github.actions.settings.open
- cmd.github.actions.open_current_branch
- cmd.github.actions.open_related_diff
- cmd.actions.view_logs
- cmd.github.actions.open_step_logs
- cmd.github.actions.open_in_github
- cmd.github.actions.open_run_diff
- cmd.github.actions.open_run_in_browser
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-048 - Github Actions Correlation And Legacy Alias Rules

```yaml
plan_unit_id: UCC-048
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: GitHub Actions commands carry workflow/run/job/step/check/log identity for route-open pivots, preserve source-control correlation, and treat legacy cmd.github_actions.* and cmd.actions pin/unpin names as compatibility aliases rather than a second namespace.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-048 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: github_actions_correlation_legacy_alias_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0029
preserved_exact_tokens:
- workflow_id
- run_id
- job_id
- step_id
- check_suite_id
- log_cursor
- source_control_ref
- route_open
- cmd.github_actions.show
- cmd.github_actions.switch_subview
- cmd.github_actions.rerun_workflow
- cmd.github_actions.cancel_workflow
- cmd.github_actions.pin_workflow
- cmd.github_actions.open_run_log
- cmd.github_actions.open_run_diff
- none
- —
negative_constraints:
- cmd.github_actions.* must not become a second primary namespace.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy underscore commands normalize to current GitHub Actions route/show, switch_subview, rerun, cancel, pin, logs, and diff commands.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-049 - Docker Build Bake Container Rows

```yaml
plan_unit_id: UCC-049
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Docker Manager command rows define build, bake, container inspect/logs/shell/restart/stop/delete, image inspect/delete/tag/open Dockerfile, context select, and compatibility aliases for build/logs/exec/inspect.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-049 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: docker_build_bake_container_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0030
preserved_exact_tokens:
- cmd.docker.build.image
- cmd.docker.build.compose
- cmd.docker.build.bake
- cmd.docker.build
- cmd.docker.container.inspect
- cmd.docker.container.view_logs
- cmd.docker.container.attach_shell
- cmd.docker.container.restart
- cmd.docker.container.stop
- cmd.docker.container.delete
- cmd.docker.image.inspect
- cmd.docker.image.delete
- cmd.docker.image.tag
- cmd.docker.open_dockerfile
- cmd.docker.context.select
- cmd.docker.logs
- cmd.docker.exec
- cmd.docker.inspect
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- cmd.docker.build/logs/exec/inspect are compatibility aliases for selected canonical Docker paths.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-050 - Docker Compose Scenario Rows And Alias Boundary

```yaml
plan_unit_id: UCC-050
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Docker compose command rows define compose up/down subset, scenario save/run/edit/delete, and shell/view-state wrappers while grouped scenario tokens and legacy Docker rows normalize to concrete canonical Docker Manager rows without new payload shapes.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-050 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: docker_compose_scenario_alias_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0030
preserved_exact_tokens:
- cmd.docker.compose_up
- cmd.docker.compose_down
- cmd.docker.compose.up_subset
- cmd.docker.compose.down_subset
- cmd.docker.compose.scenario.save
- cmd.docker.compose.scenario.run
- cmd.docker.compose.scenario.edit
- cmd.docker.compose.scenario.delete
- cmd.docker.compose.scenario.save/run/edit/delete
- cmd.docker.show
- cmd.docker.switch_subview
negative_constraints:
- Legacy Docker rows MUST NOT introduce new payload shapes.
- cmd.docker.show and cmd.docker.switch_subview do not replace concrete Docker Manager domain-action rows.
preserved_contractrefs: []
compatibility_only_notes:
- Grouped scenario command token denotes the scenario command family; payloads use concrete IDs.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-051 - Docker Registry Publish Drift Cleanup Authority Split

```yaml
plan_unit_id: UCC-051
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Docker registry publish, repository creation confirmation, artifact promotion, tag push, image push, drift comparison, cleanup scan, and prune commands preserve the Orchestrator after-build versus Docker Manager registry authority split and shared permission/account/receipt/lineage checks.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-051 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: docker_registry_publish_drift_cleanup_authority_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0030
preserved_exact_tokens:
- cmd.docker.create_repository
- cmd.docker.create_repository.confirm
- cmd.docker.create_repository.cancel
- cmd.docker.registry.promote
- cmd.docker.registry.tag_push
- cmd.docker.image.push
- cmd.docker.drift.compare
- cmd.docker.cleanup.scan
- cmd.docker.cleanup.prune
- cmd.orchestrator.push_image
- permission
- account
- receipt
- lineage
negative_constraints:
- Docker Manager registry publish commands must share permission, account, receipt, and lineage checks rather than claiming a separate event family.
preserved_contractrefs: []
compatibility_only_notes:
- cmd.docker.image.push is a compatibility alias for approved image push through Docker Manager registry authority.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-052 - Docker Kubernetes Rows And Namespace Alias Boundary

```yaml
plan_unit_id: UCC-052
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Docker Manager Kubernetes command rows define apply, diff, logs, exec, port-forward, context/namespace selection, Helm preview/install, and canonical grouped cmd.docker.k8s.* namespace behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-052 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: docker_kubernetes_rows_namespace_alias_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0031
preserved_exact_tokens:
- cmd.docker.k8s.apply
- cmd.docker.k8s.diff
- cmd.docker.k8s.logs
- cmd.docker.k8s.exec
- cmd.docker.k8s.port_forward
- cmd.docker.k8s.select_context
- cmd.docker.k8s.select_namespace
- cmd.docker.k8s.helm_preview
- cmd.docker.k8s.helm_install
- cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace
- cmd.k8s.*
- set_context
- set_namespace
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Tools.md'
compatibility_only_notes:
- Existing cmd.k8s.*, set_context, and set_namespace rows are compatibility aliases until migrated.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-053 - Docker Kubernetes Disabled State Approval Receipt Lineage

```yaml
plan_unit_id: UCC-053
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Docker/Kubernetes availability copy uses shared disabled-state taxonomy from runtime projection state, side effects use domain-bound approval scoping, receipts retain docker_refs and kubernetes_refs lineage, and drift/trust blockers refresh effective capability before mutation.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-053 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: docker_kubernetes_disabled_approval_receipts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0031
preserved_exact_tokens:
- Unsupported
- Not configured
- Unauthorized
- Unreachable
- Degraded
- Partial capability
- /UX-state
- cmd.container.*
- registry/namespace/repository
- digest/tag target
- selected context
- namespace
- workload/resource
- docker_refs
- kubernetes_refs
- /trust/proxy
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Legacy cmd.container.* references are retired to active cmd.docker.* and cmd.docker.k8s.* namespaces.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-054 - Project Scope Worktree Command Set And Thread Boundary

```yaml
plan_unit_id: UCC-054
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Project-scope git worktree commands own repository-level inventory, selection, open/focus, compare, create/remove/prune/reuse/recover, lineage focus, release, lock/unlock, and switch aliases while complementing but not replacing assistant thread-scoped worktree wrappers.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-054 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: project_scope_worktree_command_set_thread_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0032
preserved_exact_tokens:
- cmd.git.worktree.list
- cmd.git.worktree.select
- cmd.git.worktree.open
- cmd.git.worktree.open_files
- cmd.git.worktree.compare
- cmd.git.worktree.create
- cmd.git.worktree.remove
- cmd.git.worktree.prune
- cmd.git.worktree.request_prune
- cmd.git.worktree.reuse
- cmd.git.worktree.recover
- cmd.git.worktree.focus_lineage
- cmd.git.worktree.release
- cmd.git.worktree.lock
- cmd.git.worktree.unlock
- cmd.git.worktree.switch
- cmd.chat.worktree.*
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes:
- cmd.git.worktree.open_files, request_prune, and switch are compatibility aliases.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-055 - Safe Worktree Lifecycle Gates And Expert Visibility Constraints

```yaml
plan_unit_id: UCC-055
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Safe worktree lifecycle commands preserve lineage, safe-point, blocked-state, cleanup, reuse, recovery, repo/worktree IDs, lane/run/package refs, blocked reasons, show-unsafe-actions visibility, and destructive confirmation constraints.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-055 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: safe_worktree_lifecycle_gates_expert_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0032
preserved_exact_tokens:
- active
- blocked_preserved
- override policy
- repo_id
- worktree_id
- safe_point_id
- lane/run/package refs
- blocked/recovery lineage
- show-unsafe-actions
- active run
- safe-point
- lineage gates
- remove
- prune
- reuse
negative_constraints:
- Manual prune/remove/reuse is forbidden while the worktree is active or blocked_preserved unless explicit override policy allows it and records the override.
- show-unsafe-actions expert mode must not make unsafe actions executable while active run, blocked, safe-point, or lineage gates fail.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-056 - Chat Thread Lifecycle And Discovery Commands

```yaml
plan_unit_id: UCC-056
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Chat thread lifecycle and discovery commands create, archive, delete, rename, pin, export, and search threads while preserving transcript, lineage, citations, attachments, audit metadata, stable thread_id, and message focus behavior.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-056 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: chat_thread_lifecycle_discovery_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0034
preserved_exact_tokens:
- cmd.chat.{new,archive,delete,rename,pin,export,search}
- cmd.chat.new
- cmd.chat.archive
- cmd.chat.delete
- cmd.chat.rename
- cmd.chat.pin
- cmd.chat.export
- cmd.chat.search
- thread_id
- transcript
- lineage
- citations
- attachments
- audit metadata
negative_constraints:
- Grouped chat lifecycle token does not denote message-level delete or file-restore behavior.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-057 - Context Lens Placement And Mode Controls

```yaml
plan_unit_id: UCC-057
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Context Lens command IDs control dropdown placement, active modes, turn-off behavior, message selection, clear selection, Subcompact apply/revert, confirmation, and canonical source-ref rehydration in lockstep with chat, wiring, prompt, and GUI owner docs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-057 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: context_lens_placement_mode_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0035
preserved_exact_tokens:
- cmd.chat.context_lens.toggle
- cmd.chat.context_lens.set_mode
- mute
- focus
- subcompact
- cmd.chat.context_lens.turn_off
- Turn Off
- cmd.chat.context_lens.toggle_message_selection
- cmd.chat.context_lens.clear_selection
- cmd.chat.context_lens.apply_subcompact
- cmd.chat.context_lens.revert_subcompact
- Subcompact
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-058 - Assistant Thread Worktree Rows And Mvp Negative Constraints

```yaml
plan_unit_id: UCC-058
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Assistant thread-level worktree commands create, unbind, remove, merge, create PR, and show info for active-thread worktree bindings with slash commands, visibility/enabled clauses, merge guards, and MVP exclusions.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-058 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: assistant_thread_worktree_rows_mvp_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0036
preserved_exact_tokens:
- cmd.chat.worktree.create
- /worktree create
- cmd.chat.worktree.unbind
- /worktree unbind
- cmd.chat.worktree.remove
- /worktree remove
- cmd.chat.worktree.merge
- /worktree merge [--squash|--rebase]
- cmd.chat.worktree.pr
- /worktree pr
- cmd.chat.worktree.info
- /worktree
- Open Files
- cmd.git.worktree.open
- cmd.chat.worktree.bind_existing
negative_constraints:
- Arbitrary Bind Existing remains outside the Assistant thread-worktree MVP and must not be exposed as cmd.chat.worktree.bind_existing.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Commands_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-059 - Assistant Worktree Context Guard Variables

```yaml
plan_unit_id: UCC-059
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Assistant worktree commands use projection-backed guard variables for active thread, worktree binding, active run, git repo, remote non-SSH mode, GitHub remote, dirty/conflict/detached-head status, and merge lock state.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-059 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: assistant_worktree_context_guard_variables
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0036
preserved_exact_tokens:
- activeThreadExists
- activeThreadHasWorktree
- activeThreadHasActiveRun
- projectIsGitRepo
- projectIsRemoteNonSSH
- projectHasGitHubRemote
- worktreeDirty
- worktreeHasConflicts
- worktreeDetachedHead
- mergeLockHeld
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-060 - Chat Context Detail Routing And Superseded Usage Ids

```yaml
plan_unit_id: UCC-060
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Chat context commands compact, open/focus/close thread context details, preserve hover summary as passive UI, dispatch Compact Now only after explicit choice, and supersede thread Usage command IDs through route/open Usage normalization.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-060 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_189
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: chat_context_detail_routing_superseded_usage_ids
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0036
preserved_exact_tokens:
- cmd.chat.compact_context
- cmd.chat.open_thread_context_details
- cmd.chat.focus_thread_context_details
- cmd.chat.close_thread_context_details
- context.compaction.started
- context.compaction.completed
- More Details
- Compact Now
- cmd.chat.open_thread_usage
- cmd.chat.focus_thread_usage
- cmd.chat.close_thread_usage
- route/open Usage context
negative_constraints:
- Hover-summary disclosure is passive UI and does not require its own stable command ID.
- cmd.chat.open_thread_usage, cmd.chat.focus_thread_usage, and cmd.chat.close_thread_usage are superseded and must not remain canonical IDs.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
compatibility_only_notes:
- Legacy callers that cite open/focus thread usage normalize to route/open Usage context and are not pure shell/layout toggles.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-061 - Render Browser Terminal Dev Owner Boundaries

```yaml
plan_unit_id: UCC-061
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Browser, terminal, and dev-session commands share a shell/runtime interaction family while browser commands own browser-session behavior, terminal commands own section/tab/pane/session behavior, and dev commands own dev-workflow behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-061 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: render_browser_terminal_dev_owner_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0037
preserved_exact_tokens:
- 2.6A Render / browser preview commands
- Browser
- terminal
- dev-session commands
- shell/runtime interaction family
- browser-session behavior
- terminal commands
- dev-workflow behavior
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-062 - Browser Packetization Permission And Stale Label Guard

```yaml
plan_unit_id: UCC-062
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Browser command catalog coverage is packetizable only through concrete cmd.browser.* IDs, payloads, emitted events, behavior owner links, normalized domain/session identity, parent web-tool permission gating, and stale aggregate-label retirement.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-062 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: browser_packetization_permission_stale_label_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0038
preserved_exact_tokens:
- Browser preview and browsing commands
- slice-based
- Debug investigations
- chosen URL
- /domain/session
- cmd.browser.*
- Research_session
- webfetch
- stale aggregate browser labels
- /focus/detach/share/revoke
- /screenshot/devtools/automation
negative_constraints:
- Consumers must reference concrete cmd.browser.* command IDs, payloads, and emitted events rather than stale aggregate browser labels.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Older /focus/detach/share/revoke shorthand maps only to concrete rows.
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-063 - Browser Open Focus Detach Devtools Rows

```yaml
plan_unit_id: UCC-063
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Browser open, focus, detach, DevTools, and DevTools dock command rows preserve workspace/detached preview session creation, browser session focus, detach, and layout/UI state behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-063 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: browser_open_focus_detach_devtools_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0038
preserved_exact_tokens:
- cmd.browser.open_workspace_preview
- cmd.browser.open_detached_preview
- cmd.browser.focus_browser_tab
- cmd.browser.detach_browser_tab
- cmd.browser.open_devtools
- cmd.browser.toggle_devtools_dock
- browser.session.created
- browser.session.state_changed
- browser_session_id
- workspace_tab_id
- source_workspace_tab_id
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-064 - Browser Capture Share Revoke Event Rules

```yaml
plan_unit_id: UCC-064
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Browser element, selection, screenshot, share, and revoke commands preserve browser.context_captured, runtime artifact creation, browser share state, and distinct attachment/provenance fields without serializing context unless an explicit capture command runs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-064 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: browser_capture_share_revoke_event_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0038
preserved_exact_tokens:
- cmd.browser.pick_element_for_chat
- cmd.browser.add_selection_to_chat
- cmd.browser.add_selection_screenshot_to_chat
- cmd.browser.add_selection_full_screenshot_to_chat
- cmd.browser.add_screenshot_to_chat
- cmd.browser.add_full_screenshot_to_chat
- cmd.browser.share_with_agent
- cmd.browser.revoke_share_with_agent
- browser.context_captured
- runtime_artifact.created
- browser.context_shared
- browser.context_share_revoked
- attachment_type
- browser_element_context
- browser_selection_context
- chip_id
- capture status
negative_constraints:
- share_with_agent and revoke_share_with_agent do not create browser.context_captured events and do not serialize page, selection, or element context without a separate explicit capture command.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-065 - Browser Takeover Promote Recovery Rows

```yaml
plan_unit_id: UCC-065
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Browser takeover, pause, continue, stop-keep-browser, promote, reopen, retry, and keep-closed rows preserve takeover choices, automation banner behavior, promotion, recovery, and browser session state events.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-065 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: browser_takeover_promote_recovery_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0038
preserved_exact_tokens:
- cmd.browser.take_over
- takeover_choice
- pause_agent
- let_agent_continue
- stop_agent_keep_browser
- cmd.browser.pause_agent
- cmd.browser.let_agent_continue
- cmd.browser.stop_agent_keep_browser
- cmd.browser.promote_to_normal_browsing
- cmd.browser.reopen
- cmd.browser.retry
- cmd.browser.keep_closed
- browser.session.takeover_state_changed
- browser.session.promoted
- browser.session.closed
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-066 - Terminal Promotion Handoff And Pty Boundary

```yaml
plan_unit_id: UCC-066
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Terminal promotion and handoff bind interactive or long-running work to stable terminal sessions while chat retains bounded preview and audit ownership; shell-like automation defaults to PTY terminal execution when user-inspectable or intervention-prone.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-066 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: terminal_promotion_handoff_pty_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0039
preserved_exact_tokens:
- Terminal session and layout commands
- Terminal promotion and handoff
- stable terminal session
- chat retains only bounded preview and audit ownership
- Terminal-handoff routing
- chat/tool cards
- chat-callable one-shot tools
- bash
- grep
- codesearch
- chatsearch
- logsearch
- logread
- PTY-backed terminal execution
- live-terminal
negative_constraints:
- Terminal handoff must not re-own the terminal session under an individual tool.
- Agent-originated Output and inline summaries must not impersonate a pseudo-console.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-067 - Terminal Command Rows And Labels

```yaml
plan_unit_id: UCC-067
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Terminal command rows preserve open, show, rerun, detach, focus, split/move/close pane, restart/replace, stable terminal session/pane/tab identities, labels, payloads, events, and UI surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-067 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: terminal_command_rows_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0039
preserved_exact_tokens:
- cmd.terminal.open
- Open in Terminal
- cmd.terminal.show
- Show Terminal
- cmd.terminal.rerun
- Rerun in Terminal
- cmd.terminal.detach
- Detach/Pop-Out
- cmd.terminal.focus
- cmd.terminal.split_pane
- cmd.terminal.move_pane
- cmd.terminal.close_pane
- cmd.terminal.restart_replace
- terminal_session_id
- terminal_pane_id
- terminal_tab_id
- Domain event(s)
- UI surface(s)
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-068 - Terminal Focus Reuse Layout Identity

```yaml
plan_unit_id: UCC-068
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Terminal focus, reuse, moving, detaching, reattaching, follow-up actions, exited-session reveal, and same-session continuity preserve exact terminal_session_id or pane/session precedence and must not silently fall back to a fresh shell.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-068 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: terminal_focus_reuse_layout_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0039
preserved_exact_tokens:
- terminal_session_id
- /pane/session
- /thread/tool
- dev-session binding
- workspace-bound most-recent terminal context
- Show Terminal
- /moving/detaching/reattaching
- /tab/pane/session
- same bound session
- /exited
- /restart/replace
negative_constraints:
- Commands that imply same-session continuity must not fall back to a fresh shell silently.
- Moving/detaching/reattaching terminal UI must preserve tab/pane/session identity unless explicitly asking for a new terminal.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-069 - Terminal Cards Output Audit Persistence Rules

```yaml
plan_unit_id: UCC-069
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Terminal command cards preserve output/copy affordances, large output refs/blobs, one-shot inline defaults, historical permission/runtime snapshots, concise transparency, persistent inline cards, promotion behavior, and distinct terminal actions.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-069 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: terminal_cards_output_audit_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0039
preserved_exact_tokens:
- 'Ran: <command>'
- 'Running: <command>'
- '<operation>: <query/url> — N sources'
- /output
- refs/blobs
- /Problems/Ports
- /Ports/Output
- /port/output
- /linkback
- /filter/drill-down
- /changes
- /summaries
- /transparency
- /logging/subagents
- /copy/paste
- TUI capture guidance
- /collapse
- /background
negative_constraints:
- Current Settings state must not replace historical policy/mode/project evidence.
- Open in Terminal and Show Terminal must focus the same live session.
- Distinct terminal actions must keep owned command-table rows and must not collapse into one normalized target.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-070 - Dev Session Lifecycle Reveal Commands

```yaml
plan_unit_id: UCC-070
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Dev-session commands start, stop, restart, and reveal output, problems, and ports for a dev_session_id across Toolbar, Chat, Ports, Terminal, Problems, and Output surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-070 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: dev_session_lifecycle_reveal_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0040
preserved_exact_tokens:
- cmd.dev.start_session
- cmd.dev.stop_session
- cmd.dev.restart_session
- cmd.dev.show_output
- cmd.dev.show_problems
- cmd.dev.show_ports
- dev.session.started
- dev.session.stopping
- dev.session.stopped
- dev.session.restarting
- dev_session_id
- Toolbar
- Chat
- Ports
- Terminal
- Output
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-071 - Catalog Lifecycle Rows And Missing Command Rule

```yaml
plan_unit_id: UCC-071
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Catalog lifecycle commands install, update, and remove catalog items with item type, id, and version payloads, while missing referenced commands must become concrete catalog rows or explicit compatibility/retirement notes.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-071 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: catalog_lifecycle_rows_missing_command_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0041
preserved_exact_tokens:
- Catalog lifecycle commands
- cmd.catalog.install_item
- cmd.catalog.update_item
- cmd.catalog.remove_item
- item_type
- item_id
- version?
- catalog.install.started
- catalog.install.completed
- catalog.update.started
- catalog.update.completed
- catalog.remove.started
- catalog.remove.completed
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- Missing referenced commands must become concrete catalog rows or explicit compatibility/retirement notes.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-072 - Terminal Dev Recovery And Wiring Completeness Gate

```yaml
plan_unit_id: UCC-072
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Terminal clear, close, and dev reveal commands preserve runtime identity and dev_session_id ownership; debug recovery/rerun degrades to attention_required when no canonical rerun exists or local/device/manual/flaky conditions prevent classification, and catalog updates require Wiring Matrix rows.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-072 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: terminal_dev_recovery_wiring_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0041
preserved_exact_tokens:
- cmd.terminal.clear_scrollback
- termination_policy
- cmd.dev.show_output
- cmd.dev.show_problems
- cmd.dev.show_ports
- dev_session_id
- attention_required
- /device/manual
- Plans/Wiring_Matrix.md
- handlers
- UI surfaces
- acceptance checks
negative_constraints:
- Command catalog updates alone are not complete until corresponding Wiring Matrix rows bind stable command IDs to handlers, UI surfaces, and acceptance checks.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-073 - Chat Message Rows And File Reference Signature

```yaml
plan_unit_id: UCC-073
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Chat message action rows preserve copy, retry, rewind, revert, add_file_reference behavior and the canonical cmd.chat.add_file_reference signature lock for visible file reference chips.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-073 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: chat_message_rows_file_reference_signature
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0042
preserved_exact_tokens:
- cmd.chat.copy_message
- cmd.chat.retry_message
- cmd.chat.rewind
- cmd.chat.revert
- cmd.chat.add_file_reference
- thread_id
- message_id
- target_message_id
- project_id
- path
- line_range?
- visible file reference chip
- Canonical signature lock
negative_constraints:
- File references are file-only in MVP; folder references are out of scope.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-074 - Message Availability And Code Block Rows

```yaml
plan_unit_id: UCC-074
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Message-level availability and code-block rows preserve edit/resend/copy, code-block copy/insert/apply, details toggling, selected message/code-block/editor preconditions, and distinct resend versus retry behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-074 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: message_availability_code_block_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0042
preserved_exact_tokens:
- cmd.chat.edit_last_user_message
- cmd.chat.resend_last_user_message
- cmd.chat.copy_code_block
- cmd.chat.insert_code_block
- cmd.chat.apply_code_block
- cmd.chat.toggle_message_details
- chat_active
- has_user_messages
- message_selected
- code_block_selected
- editor_active
negative_constraints:
- cmd.chat.resend_last_user_message is distinct from cmd.chat.retry_message.
- Code-block commands operate on a resolved code-block sub-selection rather than the entire message body.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-075 - Rewind Revert FileSafe Semantics

```yaml
plan_unit_id: UCC-075
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: cmd.chat.rewind remains conversation-only, while cmd.chat.revert restores persisted file mutations through the canonical FileSafe pipeline using recorded absolute paths and refreshes affected editors through the mutation pipeline.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-075 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: rewind_revert_filesafe_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0042
preserved_exact_tokens:
- cmd.chat.rewind
- conversation-only
- cmd.chat.revert
- persisted file mutations
- canonical FileSafe file-restore pipeline
- absolute file paths
- assistant turn file mutation log
- working_directory
- affected editors
- canonical mutation pipeline
negative_constraints:
- cmd.chat.rewind MUST NOT be used as a file-restore alias.
- cmd.chat.revert must not reinterpret relative paths through the current working_directory.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-076 - Edit Delete Shorthand Questions Activity Dimensions

```yaml
plan_unit_id: UCC-076
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Stop/edit/delete availability is represented through existing stop, edit/resend, rewind/revert, and retention surfaces; GUI question surfaces support multiple-choice, multi-choice, and freeform Other paths, while logging/activity metadata remains sliceable by agent/tool/model/persona/subagent/token.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-076 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: edit_delete_shorthand_questions_activity_dimensions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0042
preserved_exact_tokens:
- /edit/delete
- delete-message command ID
- multiple-choice
- multi-choice
- Other
- /agent/tool/model/persona/subagent/token
negative_constraints:
- /edit/delete is an availability shorthand and not a new delete-message command ID.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-077 - Debug Mode Internal Uicommand Bridge

```yaml
plan_unit_id: UCC-077
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Debug Mode uses the internal cmd.debug.* UICommand family owned by Commands_System.md, preserves concrete debug IDs, and leaves investigation lifecycle semantics, preconditions, and evidence behavior in Commands_System.md.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-077 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: debug_mode_internal_uicommand_bridge
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0043
preserved_exact_tokens:
- cmd.debug.*
- User Commands
- cmd.debug.start
- cmd.debug.stop
- cmd.debug.pause
- cmd.debug.resume
- cmd.debug.add_breakpoint
- cmd.debug.remove_breakpoint
- cmd.debug.clear_breakpoints
- cmd.debug.view_evidence
- cmd.debug.step
- cmd.debug.collect_snapshot
- Commands_System.md
negative_constraints:
- Debug Mode UICommand IDs are internal wiring IDs, not User Commands.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Commands_System.md#5.2.8-debug-mode-uicommand-family'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-078 - Reserved Slash Web Skill Dispatcher Invariants

```yaml
plan_unit_id: UCC-078
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Reserved slash commands keep /web as one stable subcommand-required family, route natural-language web intents through the same dispatcher, map reading to webfetch, and lock /skill GUI, slash, and natural-language invocation paths to the same invoke_skill contract.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-078 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: reserved_slash_web_skill_dispatcher_invariants
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- /web
- /web search <query>
- /web extract <url>
- /web research <task-or-question>
- /web crawl <url>
- /web map <url>
- cmd.chat.web.help
- /skill
- /skill <skill_name> [args]
- invoke_skill
- Skills panel
- Natural language
- webfetch
- websearch
- webextract
- webresearch
negative_constraints:
- Do not flatten /web into separate slash families.
- Reading intents MUST resolve to webfetch, not websearch.
- /skill use, /skill list, and /skill show are not MVP subcommands.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Commands_System.md#7. Reserved built-in slash commands, ContractName:Plans/assistant-chat-design.md#5.2 `/web` and `/skill`, ContractName:Plans/Tools.md#12. Web tool routing algorithm'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-079 - Web Activity Provenance And Locked Labels

```yaml
plan_unit_id: UCC-079
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Web operation cards/history preserve requested/effective runtime snapshot fields, child payload refs/blobs, sources/source counts, read/extract-backed provenance preference, and six locked operation labels including Reading Site for PM-native Site Reader.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-079 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: web_activity_provenance_locked_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- /activity
- requested/effective runtime snapshot
- sources_ref
- content_ref
- map_ref
- /blob
- /sources
- 'Web search: {query}'
- 'Searching Web: <query>'
- 'Extracting Site: <url>'
- 'Researching Web: <task>'
- 'Crawling Site: <url>'
- 'Mapping Site: <root_url>'
- 'Reading Site: <url>'
- /extract-backed
- read-backed provenance
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-080 - Reserved Override Alias Retirement Policy

```yaml
plan_unit_id: UCC-080
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Reserved built-in slash commands are non-overridable, user commands use custom namespaces, legacy reconciliation and tool-name aliases stay compatibility/process lineage, deprecated aliases are shown distinctly, reserved commands are non-editable, and /clear/thread-clear must not return as a live command.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-080 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: reserved_override_alias_retirement_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- /x-...
- reserved built-ins
- /webfetch
- /webresearch
- compatibility/tool-key lineage
- /reconciliation
- /cancel
- /rewind
- /revert
- /share
- /settings
- /doctor
- /help
- /clear
- thread-clear
- /de-duplication
- /research-focused
- /risky
- deprecated aliases
- non-editable
negative_constraints:
- Legacy /reconciliation references are process-only and must not become user-facing command IDs.
- /clear stays removed and must not return as a thread-clear command.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy top-level tool-name spellings are compatibility/tool-key lineage, not active slash-command prototypes.
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-081 - Web Provider Help Options And Category Filters

```yaml
plan_unit_id: UCC-081
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Web command help and settings expose provider support tier, health, fallback, credit/pay-as-you-go warnings, advanced search/raw/summarization/chunk controls, concise query guidance, two-step search/read flow, and optional provider categories.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-081 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: web_provider_help_options_categories
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- support-tier
- provider health
- fallback disclosure
- /credit
- pay-as-you-go
- search_depth
- max_results
- include_domains
- exclude_domains
- time_range
- start_date
- end_date
- include_images
- include_raw_content
- /summarization
- chunks_per_source
- ultra-fast
- fast
- basic
- advanced
- 'categories?: string[]'
- github
- research
- pdf
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-082 - Web Do Not Overfit Approval And Help Boundaries

```yaml
plan_unit_id: UCC-082
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Web help avoids plugin/MCP/container/xeditor baseline nouns, uses operation-specific approval scope wording and URL normalization, and may show result-shape hints while leaving crawl limits, dedup/filtering, and extraction payload validation to tool contracts.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-082 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: web_do_not_overfit_approval_help_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- /catalog/import
- preview-safe visual-module contracts
- /MCP/container-specific
- xeditor-specific
- search
- research
- '* wildcard'
- host-scoped
- https://host.example/*
- //host.example/
- query_preview
- content_format
- task_preview
- crawl results + traversed refs
- links
- Array<{ url, text?, rel? }>
- images
- Array<{ url, alt?, dimensions? }>
negative_constraints:
- Command help must not inherit plugin-specific, MCP/container-specific, xeditor-specific, or external baseline implementation nouns as user-visible command language.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-083 - Slash Labels Dispatcher Parity And Route Mapping

```yaml
plan_unit_id: UCC-083
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Reserved slash labels, web command IDs, natural-language intent examples, dispatcher parity, URL normalization, parse failure, /cancel stop mapping, /rewind conversation-only behavior, /revert file-restore behavior, and catalog discoverability remain aligned with routing docs.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-083 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: slash_labels_dispatcher_parity_route_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0044
preserved_exact_tokens:
- /new
- /model
- /effort
- /mode
- /export
- /compact
- /stop
- /resume
- /rewind
- /revert
- /share
- /settings
- /doctor
- /help
- /web
- /skill
- /cancel
- cmd.chat.web.search
- cmd.chat.web.extract
- cmd.chat.web.research
- cmd.chat.web.fetch
- cmd.chat.web.crawl
- cmd.chat.web.map
- search the web for X
- extract this page
- read this URL
- research topic
- cmd.chat.stop
negative_constraints:
- Site/page reading is not search.
- /rewind remains conversation-only.
- /revert remains file-mutation restore, not conversation rewind.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-084 - Gist Review Verification Edit Pin Commands

```yaml
plan_unit_id: UCC-084
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Assistant memory Gist Review commands verify, edit, pin/unpin, discard, toggle auto-save unverified, and preview capsules with required project/gist/thread payloads, events, and Assistant chat Gist Review panel surface.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-084 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gist_review_verification_edit_pin_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0045
preserved_exact_tokens:
- cmd.chat.memory.verify
- cmd.chat.memory.edit
- cmd.chat.memory.pin
- cmd.chat.memory.discard
- cmd.chat.memory.toggle_auto_save_unverified
- cmd.chat.memory.preview_capsule
- memory.gist.verification_requested
- memory.gist.verified
- memory.gist.verification_failed
- memory.gist.updated
- memory.gist.pinned
- memory.gist.unpinned
- memory.gist.discarded
- settings.updated
- Assistant chat Gist Review panel
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/Contracts_V0.md#7-uicommand'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-085 - Memory Maintenance Command Rows

```yaml
plan_unit_id: UCC-085
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Assistant memory maintenance commands rebuild lexical and semantic indexes, run verification and dedup sweeps, summarize monthly memory, and prune archives with project/month/policy payloads and lifecycle events.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-085 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: memory_maintenance_command_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0045
preserved_exact_tokens:
- cmd.chat.memory.rebuild_lexical_index
- cmd.chat.memory.rebuild_semantic_index
- cmd.chat.memory.verification_sweep
- cmd.chat.memory.dedup_sweep
- cmd.chat.memory.summarize_monthly
- cmd.chat.memory.prune_archive
- memory.index.lexical.rebuild.started
- memory.index.lexical.rebuild.completed
- memory.index.semantic.rebuild.started
- memory.index.semantic.rebuild.completed
- memory.verification_sweep.started
- memory.verification_sweep.completed
- memory.dedup_sweep.started
- memory.dedup_sweep.completed
- memory.monthly_summary.started
- memory.prune_archive.completed
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/Contracts_V0.md#7-uicommand'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-086 - Artifact Side Panel Navigation Commands

```yaml
plan_unit_id: UCC-086
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Artifact side-panel navigation commands show artifacts in Usage or Ledger with project, route_target, open_subject, artifact/usage/ledger/run/thread refs, and shared route/open identity.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-086 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: artifact_side_panel_navigation_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0046
preserved_exact_tokens:
- 2.8A Side-panel and artifacts navigation commands
- cmd.artifacts.show_in_usage
- cmd.artifacts.show_in_ledger
- project_id
- route_target
- open_subject
- artifact_id?
- usage_event_ref?
- ledger_ref?
- run_id?
- thread_id?
- artifact drill-through
- shared route/open identity
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-087 - Search Panel Command Rows

```yaml
plan_unit_id: UCC-087
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Search panel commands reveal/focus Search, find/replace in files, open results through route_target, replace selected/all, rebuild indexes, and evict remote cache with project/query/session/subject/disposition payloads.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-087 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: search_panel_command_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0048
preserved_exact_tokens:
- cmd.search.show
- cmd.search.find_in_files
- cmd.search.replace_in_files
- cmd.search.open_result
- cmd.search.replace_selected
- cmd.search.replace_all
- cmd.search.rebuild_index
- cmd.search.evict_remote_cache
- query_session_id
- subject_id
- disposition?
- route_target
- remote_cache_id?
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-088 - Search Routing Query Session Owner Policy

```yaml
plan_unit_id: UCC-088
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Search commands remain side-panel scoped, preserve run-aware search scope, query-session state, open disposition, replacement payload core, Search-owner snapshot validation, and Orchestrator search routing/action policy ownership.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI command, command-palette, routing, wiring, or surface behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-088 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: search_routing_query_session_owner_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0048
preserved_exact_tokens:
- Search command routing
- route_target
- side-panel scoped
- run-aware search scope
- query-session state
- open-disposition / reuse policy
- cmd.search.replace_all { query_session_id, replacement }
- project_id
- Plans/Orchestrator_Page.md#search-routing-and-action-policy
negative_constraints:
- Search replacement applies only after the Search owner validates the current result snapshot and mutation path.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-089 - Runtime Recovery Namespace And Allowed Action Mapping

```yaml
plan_unit_id: UCC-089
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Runtime recovery uses the shared cmd.runtime.* namespace, treats legacy recovery namespaces as deprecated aliases, and maps allowed_action_id values to canonical runtime command IDs with minimum args including run, node, attempt, and blocked_sequence identity.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-089 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: runtime_recovery_namespace_allowed_action_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0049
preserved_exact_tokens:
- References
- cmd.runtime.*
- Legacy recovery command namespaces
- deprecated aliases
- allowed_action_id
- approve
- decline
- retry_now
- resume_after_prerequisite
- restore_safe_point_then_retry
- start_fresh_attempt
- replan
- skip_node
- abort_run
- open_details
- cmd.runtime.approve
- cmd.runtime.decline
- cmd.runtime.retry_now
- cmd.runtime.open_attempt_details
- blocked_sequence
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Legacy recovery command namespaces are deprecated aliases only.
stale_retired_dispositions:
- 'Canonical recovery commands use one shared namespace: cmd.runtime.*.'
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-090 - Runtime Recovery Worktree Baseline Validation

```yaml
plan_unit_id: UCC-090
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: SCM-targeted retry and fresh-attempt recovery commands support the same worktree reuse policy as restore; baseline_target is the closed safe_point/historical_commit/worktree_head enum and runtime dispatch must validate repo, worktree, and baseline exactly.
gui_related: false
gui_classification_reason: This unit preserves backend/governance command identity, metadata, compatibility, or owner-boundary rules without primary visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-090 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_190
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: runtime_recovery_worktree_baseline_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0049
preserved_exact_tokens:
- SCM-targeted retry
- /fresh-attempt
- worktree reuse policy
- restore
- baseline_target
- safe_point | historical_commit | worktree_head
- repo_id
- worktree_id
- worktree
- baseline
negative_constraints:
- Runtime dispatch must reject recovery commands rather than silently substitute another worktree or baseline.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-091 - Runtime Navigation Route Identity Commands

```yaml
plan_unit_id: UCC-091
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The runtime navigation commands `cmd.runtime.open_queue_analysis`, `cmd.runtime.open_remediation_lineage`, and `cmd.runtime.open_safe_point_history` are registered route identity examples owned by the catalog and shared route contract, with payloads `{ run_id, scheduler_pass_id }`, `{ run_id, remediation_root_id }`, and `{ run_id, safe_point_id? }`; they must not be treated as local graph shortcuts with implied unregistered route identities.
gui_related: false
gui_classification_reason: Span preserves route identity registration and command payload ownership, not GUI layout or visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-091 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: runtime_navigation_route_identity_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0050
preserved_exact_tokens:
- Navigation commands
- cmd.runtime.open_queue_analysis
- cmd.runtime.open_remediation_lineage
- cmd.runtime.open_safe_point_history
- '{ run_id, scheduler_pass_id }'
- '{ run_id, remediation_root_id }'
- '{ run_id, safe_point_id? }'
- local graph shortcuts
- route identities are implied but unregistered
negative_constraints:
- Runtime navigation commands must not be treated as local graph shortcuts whose route identities are implied but unregistered.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-092 - Pre Attempt Blocked Sequence Identity

```yaml
plan_unit_id: UCC-092
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: When a blocked episode exists before any attempt is created, the recovery target is `blocked_sequence` and recovery handling MUST NOT fabricate an `attempt_id`.
gui_related: false
gui_classification_reason: Span preserves runtime blocked-episode identity and scheduler contract behavior, not GUI layout or visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UCC-092 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: pre_attempt_blocked_sequence_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0051
preserved_exact_tokens:
- Pre-attempt blocked rule
- blocked_sequence
- MUST NOT fabricate an `attempt_id`
- attempt_id
negative_constraints:
- When a blocked episode exists before any attempt is created, the recovery target is `blocked_sequence` and MUST NOT fabricate an `attempt_id`.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-093 - Recovery Verb Copy Semantics

```yaml
plan_unit_id: UCC-093
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: '`Retry`, `Resume`, `Recover`, and `Restore` have canonical recovery command copy: Retry repeats the resolved target and parameters under current validation rules, Resume continues an existing blocked/paused/waiting episode after the prerequisite or condition, Recover invokes a canonical remediation flow advertised by `allowed_action_ids[]` without implying a full rerun, and Restore applies an explicit restore point or preserved state while disclosing target state before mutation.'
gui_related: true
gui_classification_reason: The unit owns user-visible recovery command labels and button/menu copy semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-089
unblocks: []
acceptance_criteria:
- UCC-093 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: recovery_verb_copy_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0052
preserved_exact_tokens:
- Recovery command definitions
- Recovery verb semantics are canonical command copy
- Retry
- Resume
- Recover
- Restore
- allowed_action_ids[]
- full rerun
- target state before mutation
- Approve
- Decline
- Resume after prerequisite
- Blocked
- Review
- Resolve
negative_constraints:
- Surfaces may add context qualifiers, but they must not use these verbs interchangeably across worktrees, GitHub Actions, Docker publish, Kubernetes, `/Unraid`, or Orchestrator recovery flows.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields), ContractName:Plans/Wiring_Matrix.md#UI command handler rule'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-094 - Allowed Action Runtime Recovery Mapping

```yaml
plan_unit_id: UCC-094
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: All blocked-state recovery buttons and menu entries in GUI, chat, graph, and orchestrator surfaces MUST map from `allowed_action_ids[]` to the canonical `cmd.runtime.*` recovery commands, and no surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics.
gui_related: true
gui_classification_reason: The unit constrains user-facing recovery buttons and menu entries across GUI/chat/graph/orchestrator surfaces.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-089
- UCC-093
unblocks: []
acceptance_criteria:
- UCC-094 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: allowed_action_runtime_recovery_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0052
preserved_exact_tokens:
- blocked-state recovery buttons and menu entries
- GUI, chat, graph, and orchestrator surfaces
- allowed_action_ids[]
- canonical runtime commands
- cmd.runtime.*
- thread-local
- graph-local
- provider-local recovery command family
negative_constraints:
- No surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields), ContractName:Plans/Wiring_Matrix.md#UI command handler rule'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

### UCC-095 - Recovery Metadata Resolver And Permission Carry Through

```yaml
plan_unit_id: UCC-095
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Recovery commands carry required metadata fields `command_kind`, `normalization.kind`, `normalizes_to_contract`, `alias_of_command_id`, `approval_scope_key`, `allowed_action_ids[]`, `route_target`, `open_subject?`, and `ref_family?`; command behavior preserves blocked-episode identity, wrapper/deprecated-alias normalization metadata, selector precedence, scoped resolver route payload rules, compatibility-only timestamp/run/thread fallback, and ordered `allowed_action_ids[]` permission carry-through.
gui_related: false
gui_classification_reason: The unit preserves command metadata, resolver behavior, compatibility fallback, and permission carry-through rather than GUI visual presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-091
- UCC-092
- UCC-094
unblocks: []
acceptance_criteria:
- UCC-095 remains addressable as a fine-grained UI Command Catalog PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: ui_command_catalog_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: recovery_metadata_resolver_and_permission_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0052
preserved_exact_tokens:
- Required command metadata
- command_kind
- normalization.kind
- normalizes_to_contract
- alias_of_command_id
- approval_scope_key
- allowed_action_ids[]
- route_target
- open_subject?
- ref_family?
- Canonical terms and values
- selector precedence
- scoped resolver
- timestamp/run/thread fallback
- Permission carry-through
- ordered `allowed_action_ids[]`
negative_constraints:
- Recovery commands must bind to blocked-episode identity rather than request-level surrogates.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields), ContractName:Plans/Wiring_Matrix.md#UI command handler rule'
compatibility_only_notes:
- timestamp/run/thread fallback is compatibility-only when stronger route identity is unavailable.
stale_retired_dispositions:
- normalization metadata must survive for wrappers and deprecated aliases.
owner_hints:
- Plans/UI_Command_Catalog.md
split_recommendation_reason: UI_Command_Catalog-S0052 safely splits visible recovery copy and button/menu mapping from backend metadata, resolver, and permission carry-through behavior.
```

### UCC-096 - Assistant Chat Goal Slash Commands

```yaml
plan_unit_id: UCC-096
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  UI_Command_Catalog registers the Assistant Chat Goal Mode command family. `/goal`, Goal button/chip/icon activation, and natural-language Goal Mode activation dispatch `cmd.chat.goal.start`; `/goal again`, natural-language update requests, and the small update icon beside Goal status dispatch `cmd.chat.goal.update`. These command IDs route to Goal Runtime without defining concrete Goal event payload schemas.
gui_related: true
gui_classification_reason: This unit defines user-visible Assistant Chat slash commands, Goal chip/icon activation, and status-update command surfaces.
depends_on:
  - ACD-416
  - GRS-002
unblocks: []
acceptance_criteria:
  - "`/goal` is registered as a reserved Assistant Chat Goal activation slash command."
  - "`/goal again` is registered as the active-goal update slash command."
  - "Button/chip/icon and natural-language activation normalize to `cmd.chat.goal.start`."
  - "Natural-language updates and the Goal status update icon normalize to `cmd.chat.goal.update`."
  - Command registration does not invent concrete Goal event payload schemas.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future command catalog/wiring review
risk_class: goal_command_owner_gap
reasoning_tier: standard
context_scope: assistant_chat_goal_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: assistant_chat_goal_command_registration
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0017
  - pldg-20260616-001-goal-runtime-system:atom-0024
  - pldg-20260616-001-goal-runtime-system:atom-0025
  - pldg-20260616-001-goal-runtime-system:atom-0030
  - pldg-20260616-001-goal-runtime-system:dec-0008
  - source_ref:audit-20260616-006-goal-runtime-system:SR-018
preserved_exact_tokens:
  - "/goal"
  - "/goal again"
  - "button/chip/icon"
  - "natural-language activation"
  - "cmd.chat.goal.start"
  - "cmd.chat.goal.update"
  - "clicking a little icon next to the goal status"
negative_constraints:
  - Do not let `/goal` or `/goal again` remain unregistered local Assistant Chat prose.
  - Do not invent concrete Goal event payload schemas in the command catalog.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/assistant-chat-design.md
```

### UCC-001 - UI Command Catalog Generated Artifact Residual

```yaml
plan_unit_id: UCC-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: UCC-001 is retired after Phase 2B batch 191 as active source-preserving product coverage. UI_Command_Catalog-S0001 through S0052 are covered by fine-grained UCC-002 through UCC-095 or explicit structural/reference dispositions, and later command repairs such as UCC-096 carry post-migration command canon; UI_Command_Catalog-S0053 through S0056 are generated owner/consumer map, PlanUnits heading, retired bridge, and Migration Coverage tail material. UCC-001 remains migration lineage only and must not override implementation-facing UI Command Catalog PlanUnits.
gui_related: true
gui_classification_reason: The retired bridge preserves GUI-bearing UI Command Catalog source history, but no longer provides product implementation coverage.
split_recommended: false
depends_on:
- UCC-002
- UCC-003
- UCC-004
- UCC-005
- UCC-006
- UCC-007
- UCC-008
- UCC-009
- UCC-010
- UCC-011
- UCC-012
- UCC-013
- UCC-014
- UCC-015
- UCC-016
- UCC-017
- UCC-018
- UCC-019
- UCC-020
- UCC-021
- UCC-022
- UCC-023
- UCC-024
- UCC-025
- UCC-026
- UCC-027
- UCC-028
- UCC-029
- UCC-030
- UCC-031
- UCC-032
- UCC-033
- UCC-034
- UCC-035
- UCC-036
- UCC-037
- UCC-038
- UCC-039
- UCC-040
- UCC-041
- UCC-042
- UCC-043
- UCC-044
- UCC-045
- UCC-046
- UCC-047
- UCC-048
- UCC-049
- UCC-050
- UCC-051
- UCC-052
- UCC-053
- UCC-054
- UCC-055
- UCC-056
- UCC-057
- UCC-058
- UCC-059
- UCC-060
- UCC-061
- UCC-062
- UCC-063
- UCC-064
- UCC-065
- UCC-066
- UCC-067
- UCC-068
- UCC-069
- UCC-070
- UCC-071
- UCC-072
- UCC-073
- UCC-074
- UCC-075
- UCC-076
- UCC-077
- UCC-078
- UCC-079
- UCC-080
- UCC-081
- UCC-082
- UCC-083
- UCC-084
- UCC-085
- UCC-086
- UCC-087
- UCC-088
- UCC-089
- UCC-090
- UCC-091
- UCC-092
- UCC-093
- UCC-094
- UCC-095
unblocks: []
acceptance_criteria:
- Plans/UI_Command_Catalog.md has no active node_compile_hint.mode=source_preserving_planunit coverage after Phase 2B batch 191.
- UI_Command_Catalog-S0053, S0054, and S0056 are structural generated-tail dispositions, while UI_Command_Catalog-S0055 is retired bridge lineage through UCC-001.
- UCC-001 remains migration lineage only and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: ui_command_catalog_generated_tail_after_batch_191
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: generated_artifact_residual
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0053
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0054
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0055
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:UI_Command_Catalog-S0056
preserved_exact_tokens:
- source_preserving_planunit
- generated_artifact_residual
- Migration Coverage
- PlanUnits
- UI_Command_Catalog-S0053
- UI_Command_Catalog-S0056
- UCC-001 - UI Command Catalog (Canonical) Source-Preserving PlanUnit
- Owner / Consumer Map
negative_constraints:
- UCC-001 must not provide product implementation coverage for UI_Command_Catalog-S0001 through S0052 after Phase 2B batch 191.
- UCC-001 must not override UCC-002 through UCC-095 or later fine-grained UI Command Catalog PlanUnits.
- Do not rely on one coarse source_preserving_planunit as the final implementation standard for UI_Command_Catalog.md.
preserved_contractrefs:
- Residual generated-tail ContractRefs, anchors, aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and exact tokens remain preserved by span_map and coverage_map.
compatibility_only_notes:
- The exact token source_preserving_planunit is retained only as historical migration vocabulary; UCC-001 is no longer active product coverage.
stale_retired_dispositions:
- UCC-001 - UI Command Catalog (Canonical) Source-Preserving PlanUnit is retired as a bridge and remains migration lineage only.
owner_hints:
- Plans/UI_Command_Catalog.md
```
