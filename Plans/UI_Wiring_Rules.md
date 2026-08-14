# UI Wiring Rules (Canonical)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- UI WIRING RULES

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

<a id="section-0"></a>
## 0. Scope
This file is the canonical SSOT for UI wiring rules that guarantee the Puppet Master GUI is fully wired to backend behavior.
All rules in this document are autonomously verifiable without paid UI tooling; verification relies exclusively on schema validation, deterministic lints, and scriptable checks.

ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, Primitive:Gate

### 0.1 GUI concept reconciliation input

When a GUI concept artifact is included in a reconciliation packet, `Concepts/PMConcept7.html` (PMConcept7 demo rev 9.2 lineage, built by `Concepts/pm7-tools/build_pm7.py` from `Concepts/pm6-build` parts) is the primary concept input for wiring review, with `Concepts/ChatGuiUpdates2.md` as its concept change ledger, until superseded by a newer explicit concept artifact in the same packet. As of 2026-08-12 the artifact carries the direct-manipulation Home movement model (grab handle plus keyboard, no target-picker rail), the repaired resize/collapse/open-in-panel paths, and the contact-aware editor tab silhouette. As of 2026-08-13 it additionally carries the explicit-float-only movement rebuild (window exit is invalid_target, boot never restores floating), adjacent-pair pixel resize with fair-share minimums and the no-dead-space invariant, the top-left corner triangle grip, the dual-surface Reset Layout row in the four-row top-bar Home menu, the single in-canvas chat float system (the base full-screen overlay is retired), all-pane editor tab reorder persistence with the portal-family overflow chip, and the frosted-rail silhouette; the title-bar notification stack sits between the page tabs and the search field again (the 2026-08-12 after-search placement is retired per F3-460). The same-day tweak wave further carries the top-right lines-only grip (the corner triangle is retired), the toggling top-bar Collapse/Expand Bottom Terminal row, the full-height dock_right grid, target-geometry drop previews with the pickup-band and preview-capture guards, the row-dock cross_basis_px track handle, the progress-driven silhouette redesign extended to the dashboard tab strip, the retired pane-close glyph, the removed app status bar, and the move-workgroup source reseed. Wave 3 (2026-08-13) additionally carries the right-edge vertical-dots kebab below the grip (out of the head rows), two-frame drop-target hysteresis with mid-FLIP hit-test exclusion and the proportional-width placeholder, the live-fitting overflow chip beside the actions cluster with animated tab reorder, the theme-token silhouette skins with the minimap as the only code-pane scrollbar, 2 px vertical workspace padding, and the truth-gated terminal empty state. Wave 4 (2026-08-13) additionally carries latch-based geometric drop targeting (elementsFromPoint retired from resolution), the pointer-capture tab reorder (HTML5 DnD retired), and model-first browser-in-panel deactivation. The path tokens `/PMConcept7.html` and `/ChatGuiUpdates2.md` are evidence lineage, not live Plans owner paths; UI wiring canon remains in this document, GUI product/layout canon remains in `Plans/FinalGUISpec.md`, and command canon remains in `Plans/UI_Command_Catalog.md`.

`Concepts/PuppetMasterDashComp.html` and `Concepts/PMConcept.html` are prior concept inputs retained as historical concept lineage when cited by a transfer source; the path tokens `/PuppetMasterDashComp.html` and `/PMConcept.html` remain evidence lineage for reconciliation targeting of their own packets and MUST NOT be copied verbatim into canon or treated as live owner paths.

For the 2026-07-02 GUI/PMConcept readiness repair, `Plans/PMConcept_Control_Reconciliation.json` is the machine-readable concept reconciliation artifact and `Plans/Wiring_Matrix.production.json` is the schema-validated production wiring artifact. PMConcept controls without production command/state/handler/receipt/test coverage remain concept lineage only. PMConcept local/demo/mock data is `concept_fixture_only` unless a canonical owner doc replaces it with a real projected state contract.

Production wiring evidence MUST include accessibility and interaction readiness: every retained actionable control has an accessible name, semantic role, keyboard activation contract, focus behavior, state attributes (`aria-selected`, `aria-expanded`, `aria-checked`, or equivalent native state where applicable), disabled reason projection, UICommand binding, handler target, receipt/event effect, and test evidence. Icon-only controls without names, custom clickable elements without keyboard parity, tab/menu/disclosure controls without state semantics, and disabled controls without user-visible reasons are GATE-010 failures.

Annotation and targeted-revision work is a cross-surface GUI feature, not just a backend `note-schema` tweak. Wiring must cover the reusable GUI components in `Plans/FinalGUISpec.md` (`AnnotationActionMenu`, `AnnotationDrawer`, `ContextChipStrip`), their commands, projected state, status/live-region updates, and separate send-to-chat chip behavior across Assistant Deep Plan, Wizard/PRD review, Interview embedded document pane, and document viewer review surfaces.

Cross-surface wiring reviews for Debug Mode and similar features must verify command IDs, overlays, attachments, and route/open wiring against non-derived owner-doc clusters, including `/runtime/permissions/storage/browser/artifacts/tools/UI`, `/prompt/command`, and `/index/terminology`, while keeping product semantics in the owner docs rather than in wiring rows.

Route-aware wiring verification extends the simple `ui_element_id -> ui_command_id -> handler_location -> expected_event_types` proof with optional metadata fields: `command_arg_contract_ref?`, `route_target_kind?`, `subject_kind?`, `deprecated_alias_for?`, `preconditions?`, `arg_passthrough_requirements?`, `correlation_passthrough?`, and `route_contract?`. For Usage route/open rows, `route_contract` is a validation proof packet: it requires `route_target`, `OpenSubject`, `route_target.object_kind = usage_event` when `usage_event_ref` exists, and passthrough for UsageRecord/runtime/provider refs. These fields are verification hints only; `WiringEntry` consumes route/open semantics and cannot become the route owner.

The wiring layer remains deliberately small: rows key off `ui_command_id`, handler location, expected events, and evidence, while gate logic understands command-normalization metadata and keeps `wiring-schema` expansion minimal instead of duplicating command-owner contracts.

`GATE-010` route-aware verification includes schema validation, command coverage, handler resolution, `expected-event` emission, unknown-command rejection, architectural lints, wrapper normalization, argument passthrough, correlation passthrough, and route target kind checks.

Runtime action wiring reconciles old `cmd.graph` / `cmd.graph.*` recovery actions to canonical `cmd.runtime` / `cmd.runtime.*` command contracts. Package, lane, and `/package/lane` promotion controls must dispatch through cataloged command IDs rather than ad hoc UI confirms or untyped wiring shortcuts.

Reserved slash-command override policy must resolve into one command-catalog rule: real `cmd.chat`, `cmd.chat.*`, `cmd.orchestrator`, and `cmd.orchestrator.*` IDs must be cataloged before UI wiring lands. Ghost-command validation is derived fresh from current normative `cmd.*` references, current catalog membership, and current production handler/reverse coverage on every check; any referenced-but-uncataloged, multiply registered, or handlerless ID fails closed. This document does not maintain an example list whose status can become stale.

Runtime-artifact wiring consumes `Plans/Runtime_Artifacts_Panel.md` and `/Runtime_Artifacts_Panel.md` for envelope ownership; per-family behavior and bridge-governance semantics are verified by owner references, not by copying runtime-artifact payload rules into wiring rows.

Weak-integration verification tracks dead-end GUI and end-to-end workflow risks when backend `/runtime` or `/governance` behavior exists but is not exposed in the operator control surface. Category labels include `wiring`, `workflow`, `state_contract`, `gui_alignment`, `design_architecture`, `quality`, `evidence_gap`, `corroboration`, `recovery`, `account_usage_pressure`, and `projection_trust`.

Element-centric and command-centric wiring remains the baseline proof: `ui_element_id -> ui_command_id -> handler_location -> expected_event_types` proves dispatch coverage, while route-aware gates add navigation, subject, and `/consumer/runtime-trace` checks without replacing the row shape. The machine-readable wiring schema remains a set of `interactive-element` dispatch rows; producer/consumer trace evidence is layered above that schema rather than used as a substitute for it.

The UI command envelope evidence keeps `command_id`, `issued_at`, `origin`, `correlation_id`, and `args` visible and references `Contracts_V0.md`; wiring rows may verify envelope passthrough but do not redefine the command contract.

A broad public `cmd.nav` / `cmd.nav.*` family is optional alias surface, not the mandatory answer for every route. Wrapper commands can normalize to shared route contracts, and any `cmd.nav` prototype must carry alias `/deprecation`, handler-registration, and gate-maintenance consequences through `GATE-010`.

`GATE-010` must verify that wrapper command IDs normalize to shared route primitives instead of treating every public command ID as independent. Generalized route `/subject` navigation cannot be reduced to one-off handler/event coverage; the gate evidence must prove argument passthrough, subject kind, route target kind, and wrapper normalization.

Stale `Tiers` vocabulary from `FinalGUISpec.md` is compatibility lineage only; wiring rules do not reintroduce `Tiers` as a live route, object, or navigation vocabulary.

Wiring SSOT / SSOTs integrity includes stale or `/degraded` action preconditions, owner-doc `/runtime` gating, dispatcher/runtime gating, and command registration. These are owner-doc blocking issues when they affect action availability; they are not cosmetic drift in wiring prose.

Adjacent `GUI` usage controls such as `auth-mode` and `/effective-account` filtering remain consumer requirements until usage/account owners guarantee them. UI wiring may expose the `/UI` control only when the command and effective-account contract exists.

## Owner / Consumer Map

This document owns UI wiring rules, dispatcher boundary requirements from the UI side, wiring matrix row expectations, and autonomous verification strategy for interactive GUI command coverage. It consumes command identifiers from `Plans/UI_Command_Catalog.md`, command and event envelope contracts from `Plans/Contracts_V0.md`, GUI placement and visible behavior from `Plans/FinalGUISpec.md`, and gate definitions from `Plans/Progression_Gates.md`.

This document does not own product layout, command catalog membership, runtime event schemas, route semantics, storage projections, or evidence bundle schemas. Those remain with their owner docs and are referenced here for wiring verification.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Progression_Gates.md

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
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
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
canonical_text: Route-aware and cross-surface wiring verification extends element-to-command proof with metadata such as command_arg_contract_ref, route_target_kind, subject_kind, deprecated_alias_for, preconditions, arg_passthrough_requirements, correlation_passthrough, and route_contract, while keeping route, runtime, product semantics, and GUI layout in their owner docs; Usage route/open rows use route_contract to prove route_target/OpenSubject and UsageRecord correlation passthrough.
gui_related: true
gui_classification_reason: The unit governs GUI wiring verification for routed controls, overlays, attachments, and cross-surface interactions.
split_recommended: false
depends_on: [UIW-001, UIW-002]
unblocks: [UIW-006, UIW-007]
acceptance_criteria:
  - Wiring rows may carry route-aware metadata without becoming route owners.
  - Usage route/open rows carry route_contract proof for route_target, OpenSubject, usage_event object identity, and UsageRecord correlation passthrough.
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
preserved_exact_tokens: ["Concepts/PuppetMasterDashComp.html", "/PuppetMasterDashComp.html", "Concepts/PMConcept.html", "/PMConcept.html", "command_arg_contract_ref", "route_target_kind", "subject_kind", "deprecated_alias_for", "preconditions", "arg_passthrough_requirements", "correlation_passthrough", "route_contract", "GATE-010", "cmd.runtime"]
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
  - Ghost-command findings are derived from current normative command references, catalog rows, and production handler/reverse coverage; no hand-maintained example list can override the live result.
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
## 1. Rule 1 — UI Command Dispatch Only

The UI layer MUST dispatch only typed `UICommand` messages whose `command_id` values are stable IDs drawn from `Plans/UI_Command_Catalog.md`.

**Hard rules:**
- The UI MUST NOT call backend services, storage, or domain logic directly.
- All user-initiated interactions flow through the UI Command Dispatcher boundary (see [§3](#section-3)).
- No backend mutation may originate from the view layer; the view layer is a pure function of projected state plus outbound `UICommand` emissions.

ContractRef: ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Architecture_Invariants.md#INV-004, ContractName:Architecture_Invariants.md#INV-011

---

<a id="section-2"></a>
## 2. Rule 2 — One Element, One Command

Every interactive UI element (button, menu item, link, toggle, slider, form submit) MUST map to exactly one `UICommandID`.

**Hard rules:**
- The mapping is recorded in the Wiring Matrix (`Plans/Wiring_Matrix.md`, validated by `Plans/Wiring_Matrix.schema.json`).
- No interactive element may exist without a corresponding wiring matrix entry.
- No `UICommandID` in `Plans/UI_Command_Catalog.md` may lack a handler registration.
- Orphan elements (interactive elements with no wiring entry) and orphan commands (catalog entries with no handler) are both gate failures.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Architecture_Invariants.md#INV-012

---

<a id="section-3"></a>
## 3. UI Command Dispatcher Boundary

The **UI Command Dispatcher** is the architectural boundary between the UI layer and backend domain logic.

### 3.1 Data flow

1. **UI Element** — user interaction produces a `UICommand` envelope.
2. **UICommand envelope** — contains `command_id` (stable ID from catalog), `args` (typed key-value map), and `correlation_id` (unique per invocation).
3. **Dispatcher** — routes the envelope to the registered handler by `command_id`.
4. **Handler** — executes domain logic; MUST NOT be called directly by the UI.
5. **EventRecord** — handler emits one or more `EventRecord` events (persisted to seglog).
6. **Projection** — event projections update derived state.
7. **UI State** — the view layer observes projected state; never mutates state directly.

### 3.2 Flow diagram

```
UI Element ──► UICommand ──► Dispatcher ──► Handler ──► EventRecord ──► Projection ──► UI State
   │            (envelope)      (route)      (domain)    (persist)       (derive)       (observe)
   └────────────────────────────────────────────────────────────────────────────────────────┘
                                        feedback via projected state
```

### 3.3 Invariants

- The UI MUST NOT hold a reference to any handler or service; it holds only a dispatch channel.
- Handlers MUST be stateless with respect to UI concerns; they receive a command envelope and emit events.
- The dispatcher MUST reject unknown `command_id` values with a structured error (not a silent no-op).
- Webextract wiring rows must preserve the typed extraction controls: `schema` accepts JSON Schema `draft-07`, `schema_mode` is `strict` or `/lenient`, and `actions` plus `prompt` remain explicit command payload fields rather than UI-only hints.
- Browser scenario `/acceptance` matrix rows MUST include `scenario_id`, `session_class`, `preconditions`, `user_or_agent_action`, `expected_visible_behavior`, `expected_artifacts_or_context`, `recovery_expectation`, and `platform_notes` so wiring gates can verify visible behavior, artifact/context output, recovery, and platform variance without turning UI wiring into the browser product owner.

ContractRef: ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Contracts_V0.md#EventRecord, ContractName:Architecture_Invariants.md#INV-004

---

<a id="section-4"></a>
## 4. Wiring Matrix Concept


The **Wiring Matrix** is a verification artifact that binds every interactive UI element to its command handler and expected outcomes.

### 4.1 Row schema

Each row maps:

| Field | Description |
|-------|-------------|
| `ui_element_id` | Stable identifier for the interactive element |
| `ui_location` | Screen / panel / section where the element appears |
| `ui_command_id` | Stable `UICommandID` from `Plans/UI_Command_Catalog.md` |
| `handler_location` | Canonical Rust module/function path for the dispatcher target (e.g. `handlers::github_auth::connect` or `crate::core::handlers::auth::connect`) |
| `expected_event_types` | List of `EventRecord` event types the handler MUST emit |
| `acceptance_checks` | Deterministic checks that verify correct behavior |
| `evidence_required` | Artifacts that MUST be produced for gate evidence |

Machine-readable shape:
- The wiring matrix JSON stores rows under `entries` as a map keyed by `ui_element_id`.
- This keying enforces uniqueness of interactive element IDs as part of schema validation.

### 4.2 Artifacts

- **Schema:** `Plans/Wiring_Matrix.schema.json` — JSON Schema that the matrix MUST validate against.
- **Template + examples:** `Plans/Wiring_Matrix.md` — human-readable matrix with inline examples.
- The matrix is both documentation and testable specification; GATE-010 defines the verifier checks.

ContractRef: SchemaID:Wiring_Matrix.schema.json, Gate:GATE-010

### Search Index Acceleration Wiring Addendum

`Plans/Wiring_Matrix.md` / `/Wiring_Matrix.md` keeps consumer wiring edges for Instant Grep current across `grep`, dirty-layer freshness indicators, build-pipeline status, Search panel controls, and command IDs, but it consumes rather than owns product semantics. Wiring rows and `/reconciliation` checks MUST point back to owner docs for lifecycle, `/publish/storage`, and `/runtime` canon: `Plans/Tools.md` owns grep and index-acceleration behavior, `Plans/storage-plan.md` owns dirty-layer storage and snapshot publication, and `Plans/UI_Command_Catalog.md` owns stable command payloads.

---

<a id="section-5"></a>
## 5. Autonomous Verification Strategy

All wiring verification is scriptable and runs without paid UI tooling or manual inspection.

### 5.1 Verification checks

1. **Schema validation** — Wiring matrix JSON validates against `Plans/Wiring_Matrix.schema.json`.
2. **Element uniqueness check** — Every `entries` key is unique and each row's `ui_element_id` matches its key (`one element, one command`).
3. **Coverage check** — Every `UICommandID` in `Plans/UI_Command_Catalog.md` has at least one wiring matrix entry.
4. **Handler registration check** — Every wiring matrix entry's `handler_location` resolves to a real module and function in the Rust source tree, and failures produce a deterministic report containing `ui_element_id`, `ui_command_id`, unresolved `handler_location`, and candidate source files inspected.
5. **Event emission test** — Tests that exercise command dispatch verify the `expected_event_types` listed in the wiring matrix are emitted.
6. **Unknown-command rejection test** — Dispatcher tests verify unrecognized `command_id` values return a structured error object and emit no domain events.
7. **Handler statelessness lint** — Handler modules may depend on command envelopes, domain services, and event types, but MUST NOT import UI widget/view namespaces or keep UI object references.
8. **UI purity check** — UI/view-layer code may dispatch commands and observe projected state, but direct mutation of domain/projected state outside dispatcher/projection/store modules is a gate failure.
9. **Dead command detection** — `UICommandID` values found in source code but absent from `Plans/UI_Command_Catalog.md` are flagged as dead commands.

### 5.2 Execution

- GATE-010 checks are deterministic and scriptable.
- Current automation status is tracked in `Plans/Progression_Gates.md#GATE-010`.
- Gate failure blocks progression; no manual override is permitted.
- Evidence bundles produced by the checks conform to `Plans/evidence.schema.json`.

ContractRef: Gate:GATE-010, ContractName:Progression_Gates.md, SchemaID:evidence.schema.json

---

<a id="section-6"></a>
## 6. References

| Document | Purpose |
|----------|---------|
| `Plans/Contracts_V0.md` | Canonical contracts: `UICommand`, `EventRecord`, `AuthState` |
| `Plans/UI_Command_Catalog.md` | SSOT list of stable `UICommandID` values |
| `Plans/Architecture_Invariants.md` | Cross-cutting invariants (INV-004, INV-011, INV-012) |
| `Plans/Progression_Gates.md` | Gate definitions and verifier role (GATE-010) |
| `Plans/Wiring_Matrix.md` | Wiring matrix template and examples |
| `Plans/Wiring_Matrix.schema.json` | JSON Schema for wiring matrix validation |
| `Plans/evidence.schema.json` | Evidence bundle schema |
| `Plans/DRY_Rules.md` | Anti-drift and SSOT reference rules |
| `Plans/Decision_Policy.md` | Decision escalation and policy rules |

## Migration Coverage

Original pilot hash: `aae0e662365537fbf58be77eb52a9848401db204e7521288c2e2d75375f268f1`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

| Original spans | Standardized disposition |
| --- | --- |
| `UI_Wiring_Rules-S0001` - `UI_Wiring_Rules-S0002` | Scope and authority preserved; covered by `UIW-001`. |
| `UI_Wiring_Rules-S0003` | GUI concept lineage, route-aware metadata, stale/retired vocabulary, and owner boundaries preserved; covered by `UIW-005`. |
| `UI_Wiring_Rules-S0004` | Rule 1 hard constraints preserved; covered by `UIW-002`. |
| `UI_Wiring_Rules-S0005` | Rule 2 hard constraints preserved; covered by `UIW-003`. |
| `UI_Wiring_Rules-S0006` - `UI_Wiring_Rules-S0009` | Dispatcher boundary, data flow, diagram, and invariants preserved; covered by `UIW-004`. |
| `UI_Wiring_Rules-S0010` - `UI_Wiring_Rules-S0013` | Wiring Matrix concept, row schema, artifacts, and Instant Grep consumer addendum preserved; covered by `UIW-006`. |
| `UI_Wiring_Rules-S0014` - `UI_Wiring_Rules-S0016` | Autonomous verification strategy and execution requirements preserved; covered by `UIW-007`. |
| `UI_Wiring_Rules-S0017` | Reference table preserved; covered by `UIW-008`. |

No WorkNodes, NodeSeeds, executable build tasks, Spec Lock refresh, shard regeneration, evidence refresh, or plan_graph update was performed during this pilot conversion.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime UI wiring rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-58d6d13ed1139428d3f6a692`: `handler_location` grammar is `{crate_root}::{module_path}::{function_name}`. Pre-implementation rows use `handler_status = planned` with `owner_doc_ref`; implementation-ready rows require `handler_status = resolved` and a real module path. Missing handler fallback is `handler_status = missing` and blocks buildability rather than inventing a source path.

## PMConcept7 Home Workspace wiring rules — 2026-08-04

Home Workspace is a reconciliation input for UI wiring. Every visible menu item,
grab handle, Browser action, File Manager Open-in-Panel action, drop target, and
semantic resize endpoint has exactly one production wiring row. Preview movement
and resize are local projection updates; only semantic drop/resize end dispatches
the typed command and persists the committed layout once.

Popup/flyout disclosure controls are explicitly view-local and are recorded in the
control census with a `view_only` disposition rather than fabricated command rows.
The compact Home popup has exactly four top-level rows (amended 2026-08-13: Open
Panel, Open Browser in Panel, Collapse Bottom Terminal, and Reset Layout); its
Panel 1 through Panel 4
leaf targets, each surface menu leaf, File Manager target leaf, terminal add/split
leaf, drop endpoint, and committed resizer endpoint resolve to one typed production
row and one executable test. Disabled rows project the owner-provided reason and
dispatch zero commands.

Rows must prove the command ID, typed payload, expected layout/terminal revision,
correlation and idempotency values, projected availability, disabled reason,
effect/event or no-persist disposition, explicit invocation path, focus return,
keyboard access, and no unexpected event. The production matrix is the concrete
coverage artifact; this document does not re-own layout or event field schemas.
Home rows cite `Plans/FinalGUISpec.md`, `Plans/FileManager.md`,
`Plans/Section15_MVP_Promoted_Features_Spec.md`, and
`Plans/home_workspace_layout.schema.json` as appropriate.

### UIW-010 - Home Control Census And Semantic Commit Wiring

```yaml
plan_unit_id: UIW-010
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Every Home control, submenu leaf, grab handle, drop target, resizer, and disabled state
  is source-hashed and resolves to a selector, state selector, canonical command or
  view-only disposition, event/receipt, handler, production row, and executable test with
  zero omissions. Amended 2026-08-13 - the census additionally covers the top-bar Reset
  Layout row, the Chat and Dashboard Pop Out rows, and the floating bottom-right corner
  resize endpoint. Amended 2026-08-13 (tweak wave) - the grab-handle rows describe the
  top-right lines-only grip (the corner-triangle wording is retired), the drop-target
  rows carry the target-geometry change-gated hover-preview acceptance (the
  pickup-footprint wording is retired), and the census adds the row-dock track-handle
  resize endpoint (home.resizer.dock_track).
gui_related: true
gui_classification_reason: This unit owns concrete UI-to-command wiring completeness for the Home workspace.
split_recommended: false
depends_on: [UIW-009, F3-501, UCC-144, CV-323]
unblocks: []
acceptance_criteria:
- Disclosure-only menu/flyout actions are view_only; each selected leaf maps to exactly one command and exact result/event family.
- Pointermove and live resize preview have no command/event/persistence mapping; one changed pointer-up/drop has one semantic mapping.
- Disabled terminal cap and Collapse states carry exact accessible reasons and zero dispatch.
- The source-hashed control census reports unresolved_count=0 and every production row names an executable test, not declarative prose alone.
validation_surfaces:
- python3 scripts/pm-validate-wiring-matrix.py
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 scripts/pm-plan-index.py validate
risk_class: home_wiring_orphan
reasoning_tier: standard
context_scope: home_control_wiring
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json, Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json]
node_compile_hint:
  mode: home_control_wiring
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/04_COMMAND_EVENT_STORAGE_WIRING.md
preserved_exact_tokens: [view_only, unresolved_count, pointermove, disabled reason]
negative_constraints:
- Do not count a declarative wiring row as executable test proof.
- Do not fabricate commands for disclosure-only controls.
compatibility_only_notes: []
stale_retired_dispositions:
- The prior non-census Home reconciliation summary is superseded by the source-hashed control census.
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json]
```

## PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

§0.1 update: `Concepts/PMConcept7.html` remains the primary concept input for wiring review, now carrying the integrated Cozy Shelves rail panels (File Manager, Search, Source Control, GitHub Actions, Docker, Testing, Agents, Runtime Artifacts per `Plans/FinalGUISpec.md` F3-497) and the Debug & Run panel with its fleshed bottom Debug tab (Run & Debug Revival, F3-482..F3-496). `Plans/CozyShelves_PM7_Control_Reconciliation.json` preserves the historical 2026-07-29 integrated-panel census, but it is not currentness evidence after the PM6/PM7 rebaseline; a true re-census is required before restoring any 100% command-coverage claim. `Plans/CozyShelves_Control_Reconciliation.json` remains the concept-phase census of the source-lineage `Concepts/rail-concepts/**` files and is current at its relocated `QwenRailConcepts/**` paths. Independently of the deferred PM7 census, the catalog and wiring rows retain the named command dispositions: the `cmd.run_debug.*` family is registered in the Run & Debug Revival Addendum and wired in `Plans/Wiring_Matrix.production.json` (rows `catalog.run_debug_*`), and `cmd.chat.open` is recorded as a compatibility alias of `cmd.chat.open_thread` (exclusions-registered, no second primary row). This note creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

## Shared Runtime receipt/projection wiring addendum - 2026-08-13

The 26 canonical shared-runtime command IDs owned by `Plans/Commands_System.md` CS-066 and registered by `Plans/UI_Command_Catalog.md` UCC-145 each have one production wiring row. Each row binds the exact sole handler, typed request/result pair, owner state selector, closed disabled-reason set, accessible pending/outcome behavior, and a receipt/projection-only effect. While Event Authority remains `UNKNOWN_OPEN`, every row has `expected_event_types: []`, carries `missing_event_registration`, and proves that no unregistered `EventRecord` is emitted. A command acknowledgement or accepted result is admission only, never terminal domain success.

The compatibility tokens `cmd.lsp.server.restart`, `cmd.lsp.server.diagnose`, `cmd.debug.session.start`, `cmd.debug.session.stop`, `cmd.worktree.provision`, `cmd.worktree.release`, and `cmd.context.receipt.open` have exclusions only; their canonical targets retain their production rows. `cmd.debug.session.action` is rejected and also has no production row. `cmd.remote.reconnect` remains a production wrapper: it resolves an exact `ExecutionEnvironmentId`, calls `cmd.environment.reconnect` through `EnvironmentConnectionCommandRequest`, returns `EnvironmentConnectionCommandResult`, and owns neither a second connection lifecycle nor an event family. The former `remote.reconnect.requested` claim is retired because that family is not registered.

ContractRef: ContractName:Plans/Commands_System.md#CS-066, ContractName:Plans/UI_Command_Catalog.md#UCC-145, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/DRY_Rules.md#DR-037, SchemaID:pm.shared_runtime.contracts.v1

### UIW-011 - Shared Runtime Production Wiring Without Event Fabrication

```yaml
plan_unit_id: UIW-011
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Exactly 26 new shared-runtime commands have production rows with exact handlers,
  typed request and result contracts, projection selectors, closed disabled reasons,
  accessibility and regression evidence, and receipt/projection-only effects carrying
  missing_event_registration until individual Event Authority admission; compatibility
  candidates do not become primary rows, and cmd.remote.reconnect remains an exact-
  environment wrapper over cmd.environment.reconnect.
gui_related: true
gui_classification_reason: This unit owns visible command availability, disabled state, dispatch, progress, outcome, and accessibility wiring.
split_recommended: false
depends_on: [CS-066, UCC-145, DR-037, SIR-004, SIR-005, SIR-008, SIR-010]
unblocks: []
acceptance_criteria:
  - Exactly 26 new canonical command IDs have one production row each and every row binds the CS-066 sole handler, typed request/result, selector, and closed disabled-reason set.
  - Every new row has expected_event_types empty, effect_kind receipt, missing_event_registration evidence, and a test that rejects unexpected persisted events while Event Authority is UNKNOWN_OPEN.
  - Seven compatibility candidate tokens and rejected cmd.debug.session.action have exclusions but no production rows; canonical target commands are not excluded.
  - cmd.remote.reconnect resolves exact ExecutionEnvironmentId and delegates to cmd.environment.reconnect without remote.reconnect.requested or a second lifecycle.
  - Keyboard and pointer activation are identical, focus remains deterministic, and disabled, pending, recovery, and terminal outcomes are announced without secret or raw-output disclosure.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
  - shared-runtime command row census, alias exclusion, exact-handler, receipt/projection, accessibility, restart, race, and no-unregistered-event fixtures
risk_class: shared_runtime_wiring_or_event_authority_drift
reasoning_tier: high
context_scope: shared_runtime_ui_wiring
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json]
node_compile_hint: {mode: shared_runtime_ui_wiring, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/CANDIDATE_COMMAND_ID_REGISTER.json
  - Plans/Shared_Integration_Runtime.md#15.3
preserved_exact_tokens: [missing_event_registration, UNKNOWN_OPEN, cmd.remote.reconnect, cmd.environment.reconnect, ExecutionEnvironmentId, none_pending_event_authority]
negative_constraints:
  - Do not name or emit a new EventRecord family before individual Event Authority admission.
  - Do not register compatibility candidates, the generic debug action, or surface-local command clones as primary production rows.
  - Do not treat accepted dispatch or UI acknowledgement as terminal domain success.
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Shared_Integration_Runtime.md]
```
