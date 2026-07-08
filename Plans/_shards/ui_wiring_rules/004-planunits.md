# Shard 004: PlanUnits

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L72-L421

Source SHA256: `d1d6d0343f82e9cd9686268804603ddba875295ca1e70c2ca3ce4cc4126724c4`

---

## PlanUnits

### UIW-001 - UI Wiring Scope And Authority

```yaml
plan_unit_id: UIW-001
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Plans/UI_Wiring_Rules.md is the canonical SSOT for UI wiring rules that prove Puppet Master GUI interactions are wired to backend behavior through typed commands, deterministic lints, schema validation, and scriptable checks.
gui_related: true
gui_classification_reason: The unit governs GUI interaction wiring and user-visible control coverage.
depends_on: []
unblocks: [UIW-002, UIW-003, UIW-004, UIW-006, UIW-007]
acceptance_criteria:
  - UI wiring canon is maintained in this document rather than consumer docs.
  - Verification remains autonomous and does not require paid UI tooling.
  - Product layout, command catalog membership, runtime event schemas, storage projections, and evidence schemas remain with their owner docs.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
risk_class: owner_drift
reasoning_tier: standard
context_scope: ui_wiring
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.schema.json]
node_compile_hint: {mode: doc_standardized_planunit, create_worknodes: false}
source_lineage:
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0001
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0002
preserved_exact_tokens: ["Puppet Master", "UI wiring rules", "autonomously verifiable", "schema validation", "deterministic lints", "scriptable checks"]
negative_constraints:
  - Do not make UI wiring the owner for product layout, command catalog membership, runtime event schemas, route semantics, storage projections, or evidence bundle schemas.
owner_hints: [Plans/UI_Wiring_Rules.md]
consumer_docs: [Plans/FinalGUISpec.md, Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md]
```

### UIW-002 - Typed UICommand Dispatch Only

```yaml
plan_unit_id: UIW-002
unit_type: constraint
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: The UI layer MUST dispatch only typed UICommand messages with stable command_id values from Plans/UI_Command_Catalog.md. The view layer is a pure function of projected state plus outbound UICommand emissions and MUST NOT call backend services, storage, domain logic, handlers, or services directly.
gui_related: true
gui_classification_reason: The unit constrains GUI/view-layer interaction behavior.
depends_on: [UIW-001]
unblocks: [UIW-004, UIW-007]
acceptance_criteria:
  - User-initiated UI interactions emit typed UICommand envelopes.
  - Backend mutations originate through the dispatcher boundary, not the view layer.
  - Direct UI references to backend services, storage, domain logic, handlers, or services are gate failures.
validation_surfaces:
  - GATE-010 wiring checks
  - UI purity lints
  - Dispatcher tests for unknown-command rejection
risk_class: ui_backend_bypass
reasoning_tier: high
context_scope: ui_dispatch
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/UI_Command_Catalog.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: command_dispatch_constraint, create_worknodes: false}
source_lineage:
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0004
preserved_exact_tokens: ["UICommand", "command_id", "UI Command Dispatcher", "MUST NOT call backend services", "pure function of projected state"]
negative_constraints:
  - The UI MUST NOT call backend services, storage, or domain logic directly.
  - No backend mutation may originate from the view layer.
owner_hints: [Plans/UI_Wiring_Rules.md]
consumer_docs: [Plans/FinalGUISpec.md]
```

### UIW-003 - One Interactive Element Maps To One Command

```yaml
plan_unit_id: UIW-003
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Every interactive UI element, including buttons, menu items, links, toggles, sliders, and form submits, MUST map to exactly one UICommandID recorded in the Wiring Matrix. Orphan elements and orphan commands are gate failures.
gui_related: true
gui_classification_reason: The unit governs interactive GUI elements and command coverage.
depends_on: [UIW-001]
unblocks: [UIW-006, UIW-007]
acceptance_criteria:
  - Every interactive element has exactly one Wiring Matrix entry.
  - Every UICommandID has a handler registration.
  - Orphan elements and orphan commands fail verification.
validation_surfaces:
  - Plans/Wiring_Matrix.schema.json
  - GATE-010 element-command coverage checks
risk_class: unwired_gui
reasoning_tier: standard
context_scope: ui_elements
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: wiring_coverage_requirement, create_worknodes: false}
source_lineage:
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0005
preserved_exact_tokens: ["one element, one command", "UICommandID", "orphan elements", "orphan commands"]
negative_constraints:
  - No interactive element may exist without a corresponding wiring matrix entry.
  - No UICommandID in Plans/UI_Command_Catalog.md may lack a handler registration.
owner_hints: [Plans/UI_Wiring_Rules.md]
consumer_docs: [Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md]
```

### UIW-004 - UI Command Dispatcher Flow

```yaml
plan_unit_id: UIW-004
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: UI command dispatch flows from UI Element to UICommand envelope to Dispatcher to Handler to EventRecord to Projection to UI State. The dispatcher rejects unknown command_id values with structured errors, handlers remain UI-stateless, and UI/view code observes projected state rather than mutating domain state.
gui_related: true
gui_classification_reason: The flow begins and ends at GUI state and constrains user interaction dispatch; backend portions are inseparable from the GUI wiring contract.
split_recommended: false
depends_on: [UIW-002]
unblocks: [UIW-006, UIW-007]
acceptance_criteria:
  - UI command flow preserves command_id, args, and correlation_id through dispatch.
  - Unknown command_id values return structured errors and emit no domain events.
  - Handler modules do not import UI widget/view namespaces or keep UI object references.
validation_surfaces:
  - Dispatcher tests
  - Handler statelessness lint
  - UI purity check
risk_class: dispatcher_integrity
reasoning_tier: high
context_scope: ui_to_runtime_flow
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: dispatcher_flow_requirement, create_worknodes: false}
source_lineage:
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0006
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0007
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0008
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0009
preserved_exact_tokens: ["UI Element", "UICommand envelope", "Dispatcher", "Handler", "EventRecord", "Projection", "UI State", "schema_mode", "strict", "/lenient"]
negative_constraints:
  - The UI MUST NOT hold a reference to any handler or service.
  - Browser scenario acceptance rows must not turn UI wiring into the browser product owner.
owner_hints: [Plans/UI_Wiring_Rules.md]
consumer_docs: [Plans/Contracts_V0.md, Plans/FinalGUISpec.md]
```

### UIW-005 - Route-Aware And Cross-Surface Wiring Boundaries

```yaml
plan_unit_id: UIW-005
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Route-aware and cross-surface wiring verification extends element-to-command proof with metadata such as command_arg_contract_ref, route_target_kind, subject_kind, deprecated_alias_for, preconditions, arg_passthrough_requirements, and correlation_passthrough, while keeping route, runtime, product semantics, and GUI layout in their owner docs.
gui_related: true
gui_classification_reason: The unit governs GUI wiring verification for routed controls, overlays, attachments, and cross-surface interactions.
split_recommended: false
depends_on: [UIW-001, UIW-002]
unblocks: [UIW-006, UIW-007]
acceptance_criteria:
  - Wiring rows may carry route-aware metadata without becoming route owners.
  - Concept artifacts are treated as evidence lineage, not live Plans owner paths.
  - Runtime action wiring normalizes stale graph recovery actions to canonical runtime command contracts.
validation_surfaces:
  - GATE-010 route-aware checks
  - ContractRef lint
  - Migration coverage map for retained anchors and aliases
risk_class: route_owner_drift
reasoning_tier: high
context_scope: cross_surface_gui_wiring
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: route_aware_wiring_metadata, create_worknodes: false}
source_lineage:
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0003
preserved_exact_tokens: ["Concepts/PuppetMasterDashComp.html", "/PuppetMasterDashComp.html", "Concepts/PMConcept.html", "/PMConcept.html", "command_arg_contract_ref", "route_target_kind", "subject_kind", "deprecated_alias_for", "preconditions", "arg_passthrough_requirements", "correlation_passthrough", "GATE-010", "cmd.runtime"]
negative_constraints:
  - Concept artifacts MUST NOT be copied verbatim into canon or treated as live owner paths.
  - WiringEntry consumes route/open semantics and cannot become the route owner.
  - Stale Tiers vocabulary must not be reintroduced as live route, object, or navigation vocabulary.
owner_hints: [Plans/UI_Wiring_Rules.md]
consumer_docs: [Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md, Plans/Runtime_Artifacts_Panel.md]
```

### UIW-006 - Wiring Matrix Artifact Contract

```yaml
plan_unit_id: UIW-006
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: The Wiring Matrix binds every interactive UI element to command handler and expected outcome evidence. Rows include ui_element_id, ui_location, ui_command_id, handler_location, expected_event_types, acceptance_checks, and evidence_required, with machine-readable entries keyed by ui_element_id.
gui_related: true
gui_classification_reason: The matrix proves interactive GUI element command coverage.
depends_on: [UIW-003, UIW-004, UIW-005]
unblocks: [UIW-007]
acceptance_criteria:
  - Wiring Matrix JSON stores rows under entries as a map keyed by ui_element_id.
  - Row schema preserves handler, expected event, acceptance, and evidence requirements.
  - Instant Grep and similar wiring addenda point back to owner docs for lifecycle, storage, and runtime canon.
validation_surfaces:
  - Plans/Wiring_Matrix.schema.json
  - GATE-010 schema validation
  - python3 scripts/pm-plans-verify.py lint-contractrefs
risk_class: matrix_schema_drift
reasoning_tier: standard
context_scope: wiring_matrix
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.schema.json]
node_compile_hint: {mode: wiring_matrix_artifact_contract, create_worknodes: false}
source_lineage:
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0010
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0011
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0012
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0013
preserved_exact_tokens: ["ui_element_id", "ui_location", "ui_command_id", "handler_location", "expected_event_types", "acceptance_checks", "evidence_required", "entries", "Instant Grep"]
negative_constraints:
  - Wiring rows and reconciliation checks must point back to owner docs for lifecycle, publish/storage, and runtime canon.
owner_hints: [Plans/UI_Wiring_Rules.md]
consumer_docs: [Plans/Wiring_Matrix.md, Plans/Tools.md, Plans/storage-plan.md]
```

### UIW-007 - Autonomous Verification Strategy

```yaml
plan_unit_id: UIW-007
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: UI wiring verification is scriptable and includes schema validation, element uniqueness, command coverage, handler registration, event emission tests, unknown-command rejection tests, handler statelessness lint, UI purity checks, and dead command detection. GATE-010 failures block progression with no manual override.
gui_related: true
gui_classification_reason: The unit verifies GUI controls, command dispatch, and user-visible workflow wiring.
depends_on: [UIW-002, UIW-003, UIW-004, UIW-006]
unblocks: []
acceptance_criteria:
  - Verification runs without paid UI tooling or manual inspection.
  - GATE-010 failures block progression.
  - Evidence bundles produced by checks conform to Plans/evidence.schema.json.
validation_surfaces:
  - GATE-010
  - Plans/evidence.schema.json
  - Future UI wiring verifier scripts
risk_class: false_wiring_completion
reasoning_tier: high
context_scope: ui_wiring_validation
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Progression_Gates.md, Plans/evidence.schema.json]
node_compile_hint: {mode: verification_strategy, create_worknodes: false}
source_lineage:
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0014
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0015
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0016
preserved_exact_tokens: ["schema validation", "Element uniqueness check", "Coverage check", "Handler registration check", "Event emission test", "Unknown-command rejection test", "Handler statelessness lint", "UI purity check", "Dead command detection", "GATE-010"]
negative_constraints:
  - No manual override is permitted for gate failure.
owner_hints: [Plans/UI_Wiring_Rules.md]
consumer_docs: [Plans/Progression_Gates.md]
```

### UIW-008 - Reference Boundary Preservation

```yaml
plan_unit_id: UIW-008
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: UI wiring references Contracts_V0, UI_Command_Catalog, Architecture_Invariants, Progression_Gates, Wiring_Matrix, Wiring_Matrix.schema.json, evidence.schema.json, DRY_Rules, and Decision_Policy while preserving their owner boundaries.
gui_related: true
gui_classification_reason: The referenced boundaries exist to verify GUI wiring and interactive UI behavior.
depends_on: [UIW-001]
unblocks: []
acceptance_criteria:
  - Reference rows remain exact enough for ContractRef lint and migration coverage.
  - UI wiring does not restate owner-doc contracts beyond what is needed for wiring verification.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json
risk_class: reference_drift
reasoning_tier: standard
context_scope: ui_wiring_references
implementation_surfaces: [Plans/UI_Wiring_Rules.md]
node_compile_hint: {mode: reference_boundary, create_worknodes: false}
source_lineage:
  - Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Wiring_Rules-S0017
preserved_exact_tokens: ["Plans/Contracts_V0.md", "Plans/UI_Command_Catalog.md", "Plans/Architecture_Invariants.md", "Plans/Progression_Gates.md", "Plans/Wiring_Matrix.md", "Plans/Wiring_Matrix.schema.json", "Plans/evidence.schema.json", "Plans/DRY_Rules.md", "Plans/Decision_Policy.md"]
negative_constraints:
  - Do not convert reference rows into competing owner prose.
owner_hints: [Plans/UI_Wiring_Rules.md]
consumer_docs: []
```

### UIW-009 - Approve And Build Disabled Reason Projection

```yaml
plan_unit_id: UIW-009
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  The Planning Wizard final-review control for `cmd.planning_wizard.approve_and_build` must derive its enabled state
  from `Plans/.implementation_readiness/buildability_gate_report.json`. When `buildability_gate_passed=false`, the UI
  projection keeps the control disabled and fills `state.planning_wizard.final_review.approve_and_build.disabled_reason`
  from the report's currently open blocker families, blocker IDs, exact owner_docs, and hard disabled reasons that are
  present. The view layer must not infer enablement from Wiring Matrix row existence, command catalog presence, schema
  validation, semantic closure, source preservation, or other validators passing. Disabled controls must not dispatch
  PlanApproved, create or bind PlanCompileRun, or start runtime/build surfaces. PNC-019 bootstrap authority for the
  compiler/harness/certifier path remains a disabled-state reason boundary, not a UI enablement source for ordinary
  product work.
gui_related: true
gui_classification_reason: Defines user-visible Approve And Build disabled state and command-dispatch blocking behavior.
depends_on: [UIW-002, UIW-003, UIW-006, UIW-007, PWIZ-018, PNC-022]
unblocks: [PG-060]
acceptance_criteria:
  - The Approve And Build UI state consumes buildability_gate_report.json.
  - The disabled reason projection lists currently open blocker families, blocker IDs, exact owner_docs, and PNC-019 hard disabled reason only when present.
  - Disabled Approve And Build cannot dispatch PlanApproved or create/bind PlanCompileRun.
  - Bootstrap authority for PNC-019 certification does not enable the control while buildability_gate_passed=false.
  - Wiring Matrix presence and schema validation are not enough to enable the command.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: disabled_command_false_enablement
reasoning_tier: high
context_scope: approve_and_build_ui_wiring
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/Planning_Wizard.md
  - Plans/.implementation_readiness/buildability_gate_report.json
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: approve_and_build_disabled_reason_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_ref:chat:2026-07-05-implementation-readiness-buildability-gate
  - Plans/Planning_Wizard.md#PWIZ-018
preserved_exact_tokens:
  - "cmd.planning_wizard.approve_and_build"
  - "disabled_reason"
  - "blocker families"
  - "exact owner_docs"
  - "PNC-019"
negative_constraints:
  - Do not infer Approve And Build enablement from Wiring Matrix row existence, command catalog presence, schema validation, semantic closure, source preservation, or validators passing.
  - Do not let a disabled Approve And Build control emit PlanApproved, create or bind PlanCompileRun, or start runtime/build surfaces.
owner_hints:
  - Plans/UI_Wiring_Rules.md
  - Plans/Planning_Wizard.md
  - Plans/Wiring_Matrix.production.json
```

---

<a id="section-1"></a>
