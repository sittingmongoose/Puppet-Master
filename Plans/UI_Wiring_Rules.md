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

When a GUI concept artifact is included in a reconciliation packet, `Concepts/PMConcept7.html` is the generated PM7 concept input for wiring review and `Concepts/ChatGuiUpdates2.md` remains historical change lineage. The active source chain is the current pinned PM7 base through source-owned T33-T43 transforms in `Concepts/pm7-tools/build_pm7.py`; generated HTML is never an authored owner, and terminal artifact hashes remain audit-owned. As of 2026-08-12 the artifact carries the direct-manipulation Home movement model (grab handle plus keyboard, no target-picker rail), the repaired resize/collapse/open-in-panel paths, and the contact-aware editor tab silhouette. As of 2026-08-13 it additionally carries the explicit-float-only movement rebuild (window exit is invalid_target, boot never restores floating), adjacent-pair pixel resize with fair-share minimums and the no-dead-space invariant, the top-left corner triangle grip, the dual-surface Reset Layout row in the four-row top-bar Home menu, the single in-canvas chat float system (the base full-screen overlay is retired), all-pane editor tab reorder persistence with the portal-family overflow chip, and the frosted-rail silhouette; the title-bar notification stack sits between the page tabs and the search field again (the 2026-08-12 after-search placement is retired per F3-460). The same-day tweak wave further carries the top-right lines-only grip (the corner triangle is retired), the toggling top-bar Collapse/Expand Bottom Terminal row, the full-height dock_right grid, target-geometry drop previews with the pickup-band and preview-capture guards, the row-dock cross_basis_px track handle, the progress-driven silhouette redesign extended to the dashboard tab strip, the retired pane-close glyph, and the move-workgroup source reseed. Its app-status-bar removal is superseded on 2026-08-27 by the full-width F3-448 no-bell status bar. Wave 3 (2026-08-13) additionally carries the right-edge vertical-dots kebab below the grip (out of the head rows), two-frame drop-target hysteresis with mid-FLIP hit-test exclusion and the proportional-width placeholder, the live-fitting overflow chip beside the actions cluster with animated tab reorder, the theme-token silhouette skins with the minimap as the only code-pane scrollbar, 2 px vertical workspace padding, and the truth-gated terminal empty state. Wave 4 (2026-08-13) additionally carries latch-based geometric drop targeting (elementsFromPoint retired from resolution), the pointer-capture tab reorder (HTML5 DnD retired), and model-first browser-in-panel deactivation. The path tokens `/PMConcept7.html` and `/ChatGuiUpdates2.md` are evidence lineage, not live Plans owner paths; UI wiring canon remains in this document, GUI product/layout canon remains in `Plans/FinalGUISpec.md`, and command canon remains in `Plans/UI_Command_Catalog.md`. Current repo-local successor status is owned by `Plans/.audits/audit-20260830-001-pmconcept7-live-resize-preview/audit_report.json`; incomplete or failed rows remain `verification_pending` and this paragraph is not a verdict.

`Concepts/PuppetMasterDashComp.html` and `Concepts/PMConcept.html` are prior concept inputs retained as historical concept lineage when cited by a transfer source; the path tokens `/PuppetMasterDashComp.html` and `/PMConcept.html` remain evidence lineage for reconciliation targeting of their own packets and MUST NOT be copied verbatim into canon or treated as live owner paths.

For the 2026-07-02 GUI/PMConcept readiness repair, `Plans/PMConcept_Control_Reconciliation.json` is the machine-readable concept reconciliation artifact and `Plans/Wiring_Matrix.production.json` is the schema-validated production wiring artifact. PMConcept controls without production command/state/handler/receipt/test coverage remain concept lineage only. PMConcept local/demo/mock data is `concept_fixture_only` unless a canonical owner doc replaces it with a real projected state contract.

Production wiring evidence MUST include accessibility and interaction readiness: every retained actionable control has an accessible name, semantic role, keyboard activation contract, focus behavior, state attributes (`aria-selected`, `aria-expanded`, `aria-checked`, or equivalent native state where applicable), disabled reason projection, UICommand binding, handler target, receipt/event effect, and test evidence. Icon-only controls without names, custom clickable elements without keyboard parity, tab/menu/disclosure controls without state semantics, and disabled controls without user-visible reasons are GATE-010 failures.

Annotation and targeted-revision work is a cross-surface GUI feature, not just a backend `note-schema` tweak. Wiring must cover the reusable GUI components in `Plans/FinalGUISpec.md` (`AnnotationActionMenu`, `AnnotationDrawer`, `ContextChipStrip`), their commands, projected state, status/live-region updates, and separate send-to-chat chip behavior across Assistant Deep Plan, Wizard/PRD review, Interview embedded document pane, and document viewer review surfaces.

Cross-surface wiring reviews for Debug Mode and similar features must verify command IDs, overlays, attachments, and route/open wiring against non-derived owner-doc clusters, including `/runtime/permissions/storage/browser/artifacts/tools/UI`, `/prompt/command`, and `/index/terminology`, while keeping product semantics in the owner docs rather than in wiring rows.

Route-aware wiring verification extends the simple `ui_element_id -> ui_command_id -> handler_location -> expected_event_types` proof with optional metadata fields: `command_arg_contract_ref?`, `route_target_kind?`, `subject_kind?`, `deprecated_alias_for?`, `preconditions?`, `arg_passthrough_requirements?`, `correlation_passthrough?`, and `route_contract?`. Usage route proof is selector-variant aware: event-primary rows require `usage_event`/`usage_event_ref`; a PMConcept7 Ledger attempt row requires `usage_attempt`/`attempt_id` and retains `usage_event_ref` as correlation. Both carry no `OpenSubject` and preserve applicable UsageRecord/runtime/provider/account refs. Current PMConcept7 aggregate provider/account/panel cards are local inspectors and have no route-contract row. These fields are verification hints only; `WiringEntry` consumes route/open semantics and cannot become the route owner.

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
canonical_text: Route-aware and cross-surface wiring verification extends element-to-command proof with metadata such as command_arg_contract_ref, route_target_kind, subject_kind, deprecated_alias_for, preconditions, arg_passthrough_requirements, correlation_passthrough, and route_contract, while keeping route, runtime, product semantics, and GUI layout in their owner docs; cmd.nav.open_usage_subject route-contract rows prove the applicable event-primary usage_event/usage_event_ref or PMConcept7 attempt-primary usage_attempt/attempt_id selector, no OpenSubject, and correlation passthrough, while the pre-existing artifact route/open rows retain their owner-declared OpenSubject bridge and current aggregate cards remain local inspectors.
gui_related: true
gui_classification_reason: The unit governs GUI wiring verification for routed controls, overlays, attachments, and cross-surface interactions.
split_recommended: false
depends_on: [UIW-001, UIW-002]
unblocks: [UIW-006, UIW-007]
acceptance_criteria:
  - Wiring rows may carry route-aware metadata without becoming route owners.
  - Usage drill-through rows carry route_contract proof for the applicable selector and UsageRecord/runtime/provider/account correlation passthrough; cmd.nav.open_usage_subject branches prove absence of OpenSubject, while the pre-existing artifact-wrapper event-primary rows preserve their artifact source-realization bridge and current aggregate cards remain local inspector wiring with no command, receipt, event, or route object id.
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
  - Wiring MUST NOT attach OpenSubject to either cmd.nav.open_usage_subject selector branch, remove the separately owned artifact OpenSubject bridge, or substitute a correlation identity for the object_id required by the chosen selector branch.
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

## PMConcept7 transactional interaction and shared-seat wiring addendum - 2026-08-27

The recovered PMConcept7 direct-manipulation controls use one transactional UI sequence:

1. Snapshot the owner projection and acquire pointer capture or the equivalent keyboard transaction.
2. Render fixed/portal preview geometry, ghost, placeholder, target, and motion state locally; Usage pointer resize advances its real target footprint and repacks only obstructed peers, Usage reorder displaces affected peers, and Dashboard resize keeps peers frozen.
3. Resolve the final pointer/keyboard coordinate and committed semantic target on release.
4. Dispatch exactly one existing command only when the semantic result changed.
5. Reconcile owner result/event/receipt, persist settled state once, then release capture and clear every preview class, portal, placeholder, ghost, pending animation frame, and transient listener.
6. On Escape, `pointercancel`, invalid target, stale revision, or no-change result, restore the snapshot and clean up without a command, receipt, persisted event, or storage write.

Home preset buttons are not a reason to add `cmd.workspace_layout.size_surface`: the UI resolves the
semantic `preset_id` to committed dimensions and dispatches `cmd.workspace_layout.resize_surface`.
Usage room/scope/range/disclosure/filter and popup state remain local projection; explicit refresh,
object-backed Usage/Ledger drill-through, widget commit, Context `Compact Now`, and Context `More Details`
actions use the existing catalog rows. Event-primary callers normalize to usage_event/usage_event_ref; a
PMConcept7 Ledger attempt row normalizes to usage_attempt/attempt_id without `OpenSubject` and retains
usage_event_ref plus provider/account/runtime refs as correlation.
Current PMConcept7 aggregate provider/account/panel cards open local inspectors with no command, receipt, event, or
invented route kind.

The shared Assistant has one DOM/native component identity and one thread/context store. Shell wiring may
re-seat that same node between its saved Home host and the right-side global host for other primary pages.
`cmd.panel.switch` controls visibility; re-parenting is local shell projection and must preserve node
identity, active thread, draft, transcript, attachments, context state, Context Detail Pane state, and
focus-return target. A second `chatPanel`, `chatResizer`, Assistant controller, transcript store, or context
store is a wiring failure.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/assistant-chat-design.md

### UIW-012 - Transactional Preview Commit Cancel Cleanup And Shared Assistant Re-Seating

```yaml
plan_unit_id: UIW-012
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  PMConcept7 pointer and keyboard interactions snapshot owner state, project preview
  locally, resolve the final semantic target, dispatch exactly one existing command only
  for a changed commit, reconcile the owner result, persist once, and clear all capture,
  ghost, placeholder, portal, animation-frame, and listener state. Escape, pointercancel,
  invalid, stale, and no-change paths roll back and dispatch nothing. Usage view choices,
  popup state, and current PMConcept7 aggregate provider/account/panel inspectors remain local; event-primary
  callers use usage_event/usage_event_ref, while a PMConcept7 Ledger attempt row dispatches
  cmd.nav.open_usage_subject as a usage_attempt/attempt_id object route without OpenSubject and retains the
  event ref as correlation. Home preset sizing normalizes to resize_surface, and shell
  wiring re-seats one shared Assistant node/store between Home and global hosts without
  cloning or losing thread/context continuity. Usage card body magnetism remains active, but
  move/resize acquisition uses the controls' measured base-coordinate zones, continuous
  translation attenuation, and at most one pointer-id/time/bounds-scoped document-capture
  handoff to the existing controller. Direct and rescued activation clear that lease before
  pointer capture. Rescue additionally requires the current top hit to remain inside the
  remembered card, so an intervening overlay owns its pointerdown and clears the stale lease.
  Concurrent resize/reorder entry is rejected before mutation; unrelated interactives, expired
  or foreign-pointer leases, cancellation, no-op, and settlement cannot leave a latent activation path.
  Usage pointer-resize preview uses the shared target-first slot projection to advance the real placeholder
  footprint and visibly repack only occupied neighbors while retaining peer node identity, paint, DOM order,
  and effect-spy silence. An accepted release retains the exact last-painted topology once; rollback restores
  the snapshot. Dashboard resize retains frozen peers.
gui_related: true
gui_classification_reason: The unit governs direct manipulation, cleanup, cross-page Assistant seating, and visible state continuity.
split_recommended: false
depends_on: [UIW-010, UIW-011, CS-068, UCC-147, WM-045]
unblocks: [DR-039, ACD-448]
acceptance_criteria:
  - Pointer and keyboard preview state remains local; Usage pointer resize advances the target footprint and visibly repacks only obstructed peers, Usage reorder displaces affected peers, and Dashboard resize peers remain frozen. Every preview preserves mounted peer identity, paint, DOM order, and effect-spy silence; Usage move/resize acquisition preserves body magnetism, neutralizes translation continuously only around measured control zones, uses no synthetic pointerdown or second controller, requires rescued pointerdown top-hit ownership by the remembered card, lets an intervening overlay receive the event while clearing that stale lease, excludes unrelated interactive targets, rejects every concurrent operation before mutation, and clears the short pointer-specific acquisition lease on every direct/rescued activation and terminal path.
  - A changed pointer release dispatches exactly one canonical command after final-coordinate resolution, a changed keyboard reorder drop dispatches one move command for its selected insertion intent, and each supported keyboard-resize activation settles atomically through one resize command; no-change and cancel paths dispatch nothing. Event-primary Usage callers use usage_event/usage_event_ref, while a PMConcept7 Ledger attempt row uses cmd.nav.open_usage_subject with usage_attempt/attempt_id, retains usage_event_ref plus provider/account/runtime refs as correlation, and carries no OpenSubject. Current aggregate cards remain local with no command, receipt, event, or route identity.
  - Commit and cancel both release capture and remove ghost, placeholder, portal, preview, animation-frame, and transient-listener state.
  - Home preset sizing uses cmd.workspace_layout.resize_surface after preset resolution and does not register cmd.workspace_layout.size_surface.
  - Re-seating preserves one Assistant node/store, active thread, draft, transcript, attachment, context, detail-pane, and focus identity across primary pages and back to the saved Home dock.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: pm7_preview_cleanup_or_shared_assistant_identity_drift
reasoning_tier: high
context_scope: pm7_commands_wiring_dry_assistant
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.production.json
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: pm7_transactional_wiring_and_shared_seat
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
preserved_exact_tokens:
  - pointercancel
  - cmd.workspace_layout.resize_surface
  - cmd.panel.switch
  - chatPanel
  - chatResizer
negative_constraints:
  - Do not dispatch or persist pointer-preview frames.
  - Do not leave pointer capture, pending animation frames, portals, ghosts, placeholders, or transient listeners after commit or cancel.
  - Do not let magnet translation move a Usage handle away during acquisition or let an occluded, stale, expired, foreign-pointer, or other-interactive lease start a widget transaction; do not allow two widget-operation controllers to coexist.
  - Do not clone the Assistant node, controller, transcript store, or context store.
  - Do not route aggregate Usage cards, attach OpenSubject to either cmd.nav.open_usage_subject selector branch, or use usage_event_ref as the PMConcept7 Ledger attempt object_id.
owner_hints:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.md
  - Plans/assistant-chat-design.md
```

## Typed controls, exact owner routes, and shared hover-overlay addendum - 2026-08-31

Every actionable or focusable control on a touched surface carries exactly one canonical `data-command-id` or typed local `data-ui-action-id`. It also exposes current availability, a machine-readable disabled reason when unavailable, one owner/handler destination, and a deterministic result/error/return route. A command-required control cannot degrade into page-local mutation. A presentation-only control cannot manufacture a domain command. PMConcept7 controls remain simulation-marked until the native dispatcher and owner handler are observed.

`PMHoverTag`/`HoverTagController` is one shared Final GUI overlay consumer. It binds actionable/focusable elements, truncated values, technical identifiers, statuses, badges, chart marks, disabled controls, and dynamic pin/unpin state; static body copy and purely decorative nodes are the default exemptions. It preserves the accessible name, supplies stable `aria-describedby` text and `role="tooltip"`, replaces user-facing native `title`, and makes disabled controls keyboard-reachable without allowing activation. `general.interaction.show-tooltips` hides visual paint only; accessibility descriptions remain. Positioning centers above, flips below, clamps to the viewport, and uses the shared overlay root without changing document layout.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/touch_closure.json, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json

### UIW-013 - Typed control, owner route, and accessible hover binding

```yaml
plan_unit_id: UIW-013
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Every touched actionable or focusable control has exactly one canonical command ID or typed local UI action, one availability and disabled-reason contract, one owner route, one tested response and exact return, and a Touch Closure reverse-consumer row. The shared PMHoverTag overlay supplies stable accessible descriptions and theme-native pointer/focus presentation without changing accessible names, enabling disabled actions, dispatching domain work, or changing layout. Native title-only behavior, orphan controls, duplicate keys, missing bindings, inaccessible disabled controls, clipping, stale text, and undocumented exemptions fail the generated census.
gui_related: true
gui_classification_reason: Defines visible control activation, disabled behavior, hover tags, keyboard access, and exact return.
split_recommended: false
depends_on: [UIW-012, DR-040, F3-523]
unblocks: [WM-046]
acceptance_criteria:
  - Every touched control has exactly one command or typed local action and one owner route or explicit view-only presentation disposition.
  - Guided Tour page/focus presentation uses `ui.guided_tour.focus_route` with `route_target.page_id`; it never dispatches or promotes `cmd.nav.focus_route`.
  - Disabled controls expose a stable reason, remain accessible to focus/description, and cannot activate.
  - Pointer and keyboard-focus hover opening, Escape, 160 ms departure grace, edge flip/clamp, theme changes, glass transparency, Retro 140 ms, standard 240 ms, and reduced-motion immediate behavior are tested.
  - A generated census rejects missing bindings, duplicate keys, stale text, native-title-only behavior, clipping, inaccessible disabled controls, and undocumented exemptions.
  - PMConcept7 remains simulation-only until native dispatcher and handler evidence exists.
validation_surfaces:
  - node Concepts/pm7-tools/verify/hover_tags.mjs
  - node Concepts/pm7-tools/verify/accessibility_visual_matrix.mjs
  - python3 scripts/pm-touch-closure-verify.py
risk_class: orphan_control_or_inaccessible_hover_overlay
reasoning_tier: high
context_scope: typed_controls_and_hover_overlay
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/FinalGUISpec.md, Plans/touch_closure.json, Concepts/pm7-tools/global_hover_tags_source.py]
node_compile_hint: {mode: typed_control_and_hover_binding, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
preserved_exact_tokens: [PMHoverTag, HoverTagController, aria-describedby, role=tooltip, general.interaction.show-tooltips]
negative_constraints:
  - Do not rely on native title as the user-facing tooltip.
  - Do not enable a disabled control merely to make it focusable.
  - Do not create commands for hover open, close, positioning, or paint.
  - Do not claim native accessibility or Slint runtime proof from browser checks.
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/FinalGUISpec.md, Plans/Wiring_Matrix.md]
```

## Settings command and route-only action wiring addendum - 2026-08-31

Settings wiring has exactly five canonical commands and five specialized route-only UI actions. `Plans/Settings_System.md` owns target, mutation, export, and exact-return semantics; `Plans/Commands_System.md` owns central command-family registration; this document owns the UI action-to-command boundary. A handler-location string is a required sole destination, not evidence that the dispatcher or handler exists. Until native executable evidence observes that path, the action remains unavailable with `handler_unavailable` or another exact Settings-owned disabled reason.

| canonical command | Settings semantic owner | UI action boundary | result/return boundary |
|---|---|---|---|
| `cmd.settings.open` | `Plans/Settings_System.md` SSYS-018/SSYS-019 | Dispatch exactly once for one stable `setting_id` or one `manager_id` plus optional `detail_id`; never route by label, search text, or presentation selector. | `pm.settings_route_request.v1` -> `pm.settings_route_return.v1`; restores the opener only when route, continuation, context, and generations remain current; writes no setting value. |
| `cmd.settings.transaction.preview` | `Plans/Settings_System.md` SSYS-007/SSYS-009/SSYS-018 | Resolve one immutable exact-ID proposal. Preview/cancel is not apply and dispatches no owner mutation. | `pm.settings_transaction_preview_request.v1` -> `pm.settings_transaction_preview.v1`; no write and no domain event. |
| `cmd.settings.transaction.apply` | `Plans/Settings_System.md` SSYS-009/SSYS-018 | Dispatch only from the matching current preview with expected Project revision, preview generation/hash, permission, and idempotency identity. | `pm.settings_transaction_apply_request.v1` -> `pm.settings_transaction_result.v1`; terminal UI requires owner readback/receipt, not acknowledgement. |
| `cmd.settings.transaction.rollback` | `Plans/Settings_System.md` SSYS-009/SSYS-018 | Dispatch only for one eligible transaction and rollback token after required confirmation; stale, expired, or already-used recovery dispatches nothing. | `pm.settings_transaction_rollback_request.v1` -> `pm.settings_transaction_result.v1`; failed readback remains failed or recovery-required. |
| `cmd.settings.export` | `Plans/Settings_System.md` SSYS-008/SSYS-018/SSYS-021 | Dispatch one detached exact-ID export under FileSafe/permission policy; credential and protected-session bytes are excluded. | `pm.settings_export_request.v1` -> `pm.settings_export_manifest.v1`; changes no setting value and returns only non-secret artifact/receipt identity. |

| route-only ui_action_id | exact `cmd.settings.open` target | retained owner/action boundary | exact return boundary |
|---|---|---|---|
| `settings.onboarding.open` | `manager_id=onboarding-guided-tour`, `detail_id=overview` | Opens the Settings dependency/entry projection. Product Onboarding remains owned by Planning Wizard/its retained owners; this action starts no onboarding run. | `pm.settings_route_return.v1`; current origin context/focus only. |
| `settings.onboarding.run_again` | `manager_id=onboarding-guided-tour`, `detail_id=run-onboarding-again` | Opens the owner-routed run-again choice. It does not itself restart, reset, or mutate Onboarding. | `pm.settings_route_return.v1`; current origin context/focus only. |
| `settings.guided_tour.replay` | `manager_id=onboarding-guided-tour`, `detail_id=replay-guided-tour` | Opens the retained Guided Tour owner route. It does not itself replay or persist tour state. | `pm.settings_route_return.v1`; current origin context/focus only. |
| `settings.doctor.open` | `manager_id=doctor`, `detail_id=overview` | Opens the cached/currentness-labelled Doctor projection. Doctor and domain owners retain checks; no probe runs. | `pm.settings_route_return.v1`; current origin context/focus only. |
| `settings.doctor.remediation.open` | `manager_id=doctor`, `detail_id=check:{check_id}` | Opens one exact owner remediation route. It does not execute a probe, repair, permission change, install, or mutation. | `pm.settings_route_return.v1`; current origin context/focus only. |

Each route-only action carries `effect=route_only` and `owner_operation_authorized=false`. All ten rows require stable role/name, keyboard and pointer parity, current availability and disabled-reason projection, one dispatch at most, deterministic focus return, stale-generation rejection, and a bounded receipt/result assertion with no unexpected persisted EventRecord. A disabled action dispatches zero commands. Concept simulation remains simulation and earns no handler or native-wiring credit.

ContractRef: ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/Settings_System.md#SSYS-019, ContractName:Plans/Commands_System.md#CS-069, ContractName:Plans/settings_system_contract_fixtures.json, ContractName:Plans/Wiring_Matrix.production.json

### UIW-014 - Complete Settings Command And Route-Only Wiring Family

```yaml
plan_unit_id: UIW-014
unit_type: wiring_contract
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  The Settings UI exposes exactly five canonical command boundaries and five route-only Onboarding, Guided Tour,
  and Doctor actions. Every row binds one Settings-owned target, one central command, one request/result or exact-return
  contract, one availability/disabled projection, deterministic focus return, and no fabricated owner operation,
  EventRecord, dispatcher, or handler claim.
gui_related: true
gui_classification_reason: The unit governs visible Settings activation, disabled state, route destinations, transaction outcomes, accessibility, and exact focus return.
depends_on: [CS-069, SSYS-018, SSYS-019, SSYS-022, UIW-013]
unblocks: []
acceptance_criteria:
  - The command census is exactly cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback, and cmd.settings.export with their Settings-owned request/result pairs.
  - The route-only census is exactly settings.onboarding.open, settings.onboarding.run_again, settings.guided_tour.replay, settings.doctor.open, and settings.doctor.remediation.open, each dispatching cmd.settings.open with its frozen manager/detail target.
  - All open and specialized route actions return through the one canonical pm.settings_route_return.v1 contract.
  - Route-only actions authorize no Onboarding run, Guided Tour replay, Doctor probe, or remediation operation; disabled actions dispatch nothing.
  - Declared handler destinations, schemas, production-intent rows, and concept simulation do not prove executable handlers or native wiring.
  - Pointer/keyboard parity, accessibility, focus return, stale rejection, exact dispatch count, receipt/result, and no-unregistered-event behavior are required before production credit.
validation_surfaces: [Plans/settings_system_contract_fixtures.json, Plans/Wiring_Matrix.production.json, future Settings ten-row command/action census, handler-absence, stale-return, accessibility, and no-unregistered-event fixtures]
risk_class: settings_ui_action_owner_or_return_drift
reasoning_tier: high
context_scope: settings_commands_and_route_only_actions
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Commands_System.md, Plans/Settings_System.md, Plans/settings_system_contract_fixtures.json, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: settings_command_and_route_only_wiring, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Settings_System.md#SSYS-018
  - Plans/Settings_System.md#SSYS-019
  - Plans/Settings_System.md#SSYS-022
  - source_ref:chat:settings-reference-review-canon-closure-2026-08-31
preserved_exact_tokens: [cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback, cmd.settings.export, settings.onboarding.open, settings.onboarding.run_again, settings.guided_tour.replay, settings.doctor.open, settings.doctor.remediation.open, pm.settings_route_return.v1, owner_operation_authorized=false]
negative_constraints:
  - Do not mint a command or alias for a route-only UI action.
  - Do not execute Onboarding, Guided Tour, Doctor probe, or remediation work from a Settings route action.
  - Do not claim a runtime handler from a declared handler path, schema, static wiring row, or concept simulation.
  - Do not emit or infer an unregistered EventRecord.
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/Commands_System.md, Plans/Settings_System.md, Plans/Wiring_Matrix.production.json]
```

## Product Onboarding typed-local action wiring addendum - 2026-09-01

Product Onboarding remains one bounded modal over the visible, input-blocked application. It does not become a routed page,
nested modal, substitute application frame, or browser-history surface. No browser/route Back or breadcrumb chrome is added;
the existing typed `ui.onboarding.back` control changes only the modal's bounded stage or owner-branch presentation.

The exact current typed-local action census is thirteen:
`ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`,
`ui.onboarding.defer`, `ui.onboarding.open_details`, `ui.onboarding.more_ways`,
`ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`,
`ui.onboarding.run_automatic_preparation`, `ui.onboarding.choose_first_project`, and `ui.onboarding.finish`.
Every actionable control emits exactly one of these IDs. They are not `UICommand`s, catalog aliases, handler names,
EventRecords, or production-wiring rows.

Each action emits one closed `pm.product_onboarding.action_request.v1` carrying the action/session/stage identity,
expected revision, continuation generation, bounded choice, required `local_context`, optional owner route, actor,
idempotency key, source surface, and exact return-focus identity. `local_context` contains only normalized, secret-free
`intent`, optional `review_confirmation`, `scope`, `branch_kind`, `branch_step`, `selection_ref`, `target_ref`, `owner_operation_ref`,
`owner_branch_ref`, `expanded`, `start_tour`, and `recovery_condition`. It has `additionalProperties=false` semantics:
arbitrary keys, raw payload copies, free-form control payloads, and secret-bearing values are rejected and never logged or
persisted. It resolves to one `pm.product_onboarding.action_result.v1` carrying
`status=applied|disabled|rejected`, before/after stage, resulting session status, closed local effect, session-write flag,
optional continuation snapshot, ephemeral Details state, optional owner route/operation refs,
`production_receipt_ref=null` for local choreography, `owner_mutation_claimed=false`, exact error/disabled reason, focus
return, revision, and continuation generation. Disabled or rejected actions have `local_effect=none`, write no session or
continuation, dispatch no owner route, carry no production receipt, and remain keyboard/focus describable without
activating.

| Typed local action | Required local result boundary |
|---|---|
| `ui.onboarding.defer` | Before modal dismissal, durably write one resumable continuation snapshot preserving exact stage, selected path, active branch, bounded history, revision, continuation generation, initiating Client, and return-focus identity. It does not complete or skip the session and claims no owner mutation. |
| `ui.onboarding.close` | Dismiss the modal and restore initiating focus without marking the session completed, skipped, deferred, or any owner Ready. It does not silently cancel owner work. |
| `ui.onboarding.skip` | Record the explicit `skipped` session outcome without implying Onboarding-path completion or owner readiness. |
| `ui.onboarding.open_details` | Toggle one bounded same-stage Details disclosure ephemerally; write no `OnboardingSession`, launch no owner route/command, and return focus to the Details toggle. |
| `ui.onboarding.more_ways` | A stage disclosure uses `intent=toggle_setup_options`, `choice=other_setup_options|other_project_options`, matching `scope=setup_options|project_options`, and `branch_kind=null`. A branch-local disclosure/step/selection/consent update uses `intent=update_branch_state`, `choice=null`, a canonical non-null `branch_kind`, and only relevant normalized branch/selection/disclosure fields; its result is `disclosure_opened|disclosure_closed|branch_state_updated`. |
| `ui.onboarding.skip` | Whole-session Skip uses `intent=skip_product_onboarding`, `scope=product_onboarding`, `choice=null`, and returns `session_skipped` with skipped session status. Optional Project or Remote Access Skip uses `intent=skip_optional_scope`, `choice=skip_project|skip_remote_access`, matching `scope=first_project|remote_access` and `branch_kind=project|remote-access`, and returns `optional_scope_skipped` while the session stays active. |

When `ui.onboarding.open_owner_flow` or another owner-launch action is available, its typed route/intent dispatches only
the target owner's existing canonical command and sole handler and returns through the revisioned continuation. Product
Onboarding receives no generic mutation handler. The packet candidate tokens `cmd.onboarding.back`,
`cmd.onboarding.cancel`, `cmd.onboarding.continue`, `cmd.onboarding.defer`, `cmd.onboarding.finish`,
`cmd.onboarding.open_details`, `cmd.onboarding.resume`, and `cmd.onboarding.skip` are source-lineage candidate tokens only
and are rejected as commands, aliases, handlers, and production rows because the typed local `ui.onboarding.*` actions
own those semantics. This is separate from UCC-106's eleven retained provider-first command-era tokens, whose count and
lineage remain unchanged.

Schema/fixture validation, transform assertions, the generated-artifact static gate, and
`Concepts/pm7-tools/verify/onboarding_cinematic.mjs` cover vocabulary, markup, request/result, required closed
secret-free `local_context`, ambiguous/missing/additional/raw/secret-bearing-context rejection, both `more_ways`
variants, both global/optional `skip` variants, disabled/rejected, modal/focus, durable defer, explicit Skip,
non-completing Close, and ephemeral Details behavior at their declared
evidence layers. They do not prove a native Slint controller, native Storage binding, dispatcher/handler execution,
production persistence, runtime behavior, accessibility certification, motion quality, or visual acceptance.

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-021, ContractName:Plans/Planning_Wizard.md#PWIZ-022, ContractName:Plans/UI_Command_Catalog.md#UCC-106, ContractName:Plans/Wiring_Matrix.md#WM-041, SchemaID:pm.product_onboarding.action_request.v1, SchemaID:pm.product_onboarding.action_result.v1

### UIW-015 - Product Onboarding typed-local request/result closure

```yaml
plan_unit_id: UIW-015
unit_type: wiring_contract
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Product Onboarding exposes exactly thirteen typed local ui.onboarding.* actions through the closed action-request and
  action-result envelopes. Every control has one action, accessible availability/disabled behavior, deterministic local
  result and focus return, and an owner route only where the action explicitly launches the existing owner command.
  Every request includes closed normalized secret-free local_context, and more_ways/skip variants are disambiguated by
  exact intent, scope, choice, branch, and result-effect combinations rather than arbitrary control payload.
  Defer durably preserves exact continuation, Close is a non-completion dismissal, Skip records a skipped session, and
  Details is ephemeral/same-stage/non-persistent/owner-command-free. No cmd.onboarding.* command, alias, handler,
  EventRecord, production row, full-page route, or breadcrumb chrome is created.
gui_related: true
gui_classification_reason: Defines the visible modal controls, activation/result behavior, disabled presentation, focus return, and Details disclosure.
split_recommended: false
depends_on: [PWIZ-021, PWIZ-022, UCC-106, WM-041, UIW-013]
unblocks: []
acceptance_criteria:
  - The exact action census is the thirteen named ui.onboarding.* IDs, and every authored control carries exactly one typed local action.
  - Every request/result validates against pm.product_onboarding.action_request.v1 and pm.product_onboarding.action_result.v1 with closed applied, disabled, and rejected outcomes.
  - local_context is required and closed to intent, scope, branch_kind, branch_step, selection_ref, target_ref, owner_operation_ref, owner_branch_ref, expanded, start_tour, and recovery_condition; missing/additional/arbitrary/raw/secret-bearing context is rejected.
  - more_ways stage disclosure and branch-local state updates cannot normalize into each other, and whole-session Skip cannot normalize into optional Project/Remote-Access Skip; exact request fields and result effects/statuses prove the selected variant.
  - Disabled/rejected results have no local effect, write, continuation, owner route, owner operation, or production receipt and expose exact accessible reasons.
  - Defer persists exact stage/path/branch/history/revision/continuation/initiating-Client/focus return before dismissal; Close does not complete; Skip is explicitly skipped; Details remains same-stage and ephemeral.
  - The eight named packet candidate cmd.onboarding.* tokens are source-lineage only and receive no command, alias, handler, or production row; UCC-106's eleven retired command-era tokens retain their separate lineage count.
  - The flow stays a bounded modal with no route-history or breadcrumb chrome, and no static/browser evidence is treated as native or runtime proof.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Concepts/pm7-tools/onboarding_cinematic_source.py, Concepts/pm7-tools/verify/onboarding_cinematic.mjs, future native Product Onboarding request/result and accessibility fixtures]
risk_class: onboarding_local_action_or_result_wiring_drift
reasoning_tier: high
context_scope: product_onboarding_typed_local_request_result
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Planning_Wizard.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/product_onboarding_contracts.schema.json, Concepts/pm7-tools/onboarding_cinematic_source.py]
node_compile_hint: {mode: product_onboarding_local_action_wiring, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved current Product Onboarding source/schema reconciliation
  - Plans/Planning_Wizard.md#PWIZ-021
  - Plans/product_onboarding_contracts.schema.json
preserved_exact_tokens: [ui.onboarding.start, ui.onboarding.next, ui.onboarding.back, ui.onboarding.close, ui.onboarding.skip, ui.onboarding.defer, ui.onboarding.open_details, ui.onboarding.more_ways, ui.onboarding.choose_simple_path, ui.onboarding.open_owner_flow, ui.onboarding.run_automatic_preparation, ui.onboarding.choose_first_project, ui.onboarding.finish, pm.product_onboarding.action_request.v1, pm.product_onboarding.action_result.v1, local_context, skip_product_onboarding, skip_optional_scope, toggle_setup_options, update_branch_state, session_skipped, optional_scope_skipped, cmd.onboarding.back, cmd.onboarding.cancel, cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish, cmd.onboarding.open_details, cmd.onboarding.resume, cmd.onboarding.skip]
negative_constraints:
  - Do not register, alias, normalize, wire, or assign handlers to packet candidate cmd.onboarding.* tokens.
  - Do not fabricate an owner mutation, production receipt, EventRecord, or durable write from local Details or a disabled/rejected result.
  - Do not conflate Close, Skip, Defer, Finish, or Ready state.
  - Do not accept open-ended local_context, arbitrary/raw payload copies, secret-bearing values, or ambiguous more_ways/skip combinations.
  - Do not turn Product Onboarding into a page, nested modal, route-history surface, or breadcrumb flow.
  - Do not claim native Slint, Storage, dispatcher, handler, runtime, accessibility, motion, or visual proof from schemas, fixtures, static assertions, or browser checks.
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/Planning_Wizard.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```
## Server/Egolite Alias, Local-Action, And Handler-Truth Rules - 2026-09-01

The 171-row command-gap adjudication and six retained Egolite rows obey four closed UI rules:

1. A primary UI command resolves through one canonical owner, exact typed request/result/error/availability/permission contract, and one sole planned handler target. The control stays disabled with an accessible `handler_unavailable` reason until native evidence exists.
2. A compatibility spelling normalizes to its exact target before availability, permission, policy, or dispatch. The source has no registration, handler, state projection, production row, persistence, or EventRecord. Only compatibility/source receipt identity may preserve the invoked spelling.
3. A presentation-only packet spelling is replaced by an exact typed `ui.*` action. It preserves currentness, focus, keyboard/accessibility, viewport, and exact return state but receives no semantic-domain command or production UICommand row.
4. A rejected spelling is inert. Its reason and safe exact replacement guidance remain visible to maintainers and audits, but it cannot dispatch.

Every intended GUI consumer uses owner data and the same command/action identity. Settings, Product Onboarding, and Doctor remain consumers/routers; they cannot privately authenticate, install, update, move, back up, restore, browse, test, or operate source control. Static concept JavaScript remains simulation only.

### UIW-016 - Server And Egolite Exact Dispatch Boundary

```yaml
plan_unit_id: UIW-016
unit_type: ui_wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Server/Egolite controls use one exact primary dispatch route or one typed local UI action; aliases normalize before permission and dispatch, rejected spellings remain inert, and every route preserves availability, disabled reason, accessibility, exact return, reverse consumers, and static-versus-native truth.
gui_related: true
depends_on: [CS-073, UCC-151, WM-050]
unblocks: []
acceptance_criteria:
  - No visible control dispatches an alias, local predecessor, rejected spelling, or unregistered family root.
  - Every primary control and intended consumer uses the same exact target availability and accessible disabled reason.
  - Every typed local action has owner-local currentness/focus/return behavior and no domain mutation or EventRecord.
  - Concept simulation, schema validation, catalog presence, and planned target strings never claim native runtime readiness.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json, Concepts/pm7-tools/systems_integration_source.py, Concepts/pm7-tools/onboarding_cinematic_source.py, scripts/pm-touch-closure-verify.py]
risk_class: ui_alias_bypass_or_phantom_runtime_claim
reasoning_tier: high
context_scope: server_egolite_ui_dispatch_boundary
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Concepts/pm7-tools/]
node_compile_hint: {mode: ui_wiring_rule_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-1-171, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#92-command-denominator]
negative_constraints: [No alias dispatch., No local domain command., No Doctor/Settings private owner., No fake native proof.]
```

## Central Touch Command/GUI Closure Rule Addendum - 2026-09-01

For every non-blocked Touch primary command, the closure gate resolves the primary row through its Touch profile and production entries, requires at least one entry, and requires all entries for that command to name one identical handler. An alias must normalize before permission and dispatch and must have no peer production entry. A blocked false-inventory token must have neither a handler nor a production entry. GUI coverage means an exact intended route, typed availability/disabled reason, accessible action semantics, result/error settlement, and deterministic return; it does not require inventing a synthetic visible control where no user route is intended.

The September 1 closure preserves the same dispatch rule while changing the machine census to 425 primaries (424 actionable plus one blocked false inventory), 55 aliases, 101 typed local actions, seven presentation rows, 588 Touch rows, 87 profiles, and 1065 production entries. Forge adds nine event-silent primaries, Backup/Restore adds sixteen, and Remote Access replaces four component/Serve primaries with three built-in-connector primaries plus four compatibility-only aliases. Those aliases have no peer control, state selector, handler, production row, persistence, or EventRecord.

### UIW-017 - Exact Touch Command/GUI/Handler Closure

```yaml
plan_unit_id: UIW-017
unit_type: gui_wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Every actionable Touch primary command must have production wiring and exactly one handler identity across all GUI consumers; aliases and blocked false inventory must have no peer wiring, and reverse coverage must not create synthetic controls.
gui_related: true
gui_classification_reason: The rule closes bidirectional command-to-GUI reachability, accessibility, disabled behavior, and focus return.
depends_on: [UIW-016, CS-074, UCC-152, WM-051]
unblocks: []
acceptance_criteria:
- The Touch verifier fails on missing production coverage, competing handler identities, alias peer rows, blocked-token wiring, missing GUI routes, or stale profile refs.
- Rebinding uses exact semantic equivalence and never relabels a nearby non-equivalent action.
- Static, concept-simulated, and native-runtime claims remain separate.
validation_surfaces: [python3 scripts/pm-touch-closure-verify.py --json]
risk_class: gui_command_reverse_coverage
reasoning_tier: high
context_scope: touch_command_gui_closure
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/touch_closure.json, scripts/pm-touch-closure-verify.py]
node_compile_hint: {mode: exact_touch_gui_closure, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Wiring_Matrix.md#WM-051]
negative_constraints: [Do not mint false domain commands for ephemeral presentation., Do not invent synthetic controls solely to satisfy a census.]
compile_disposition: extend_existing_owner
```

## Puppet Master Assistant Redesign Wiring Rules - 2026-09-03

The Assistant redesign adds fifty-five production-intent wiring rows under the `assistant_redesign.*` element namespace. The following rules govern them and any later row in the same families.

**One producer, one command, one handler.** Every mutating Assistant control names exactly one registered command ID and exactly one sole future target handler. A control that cannot name a registered command renders disabled with `command_not_registered`. A page-local action ID, an alias, a fixture, a client timer, or a toast may never stand in for an unregistered command, and a successful-looking receipt may never be produced by the surface itself.

**View-local intents are declared, not disguised.** Three rows carry a view-local or owner-internal effect rather than a user-facing command: composer text entry updating the `ComposerBuffer`, parent To-Do expansion, and Plan view switching between Rich Text and Markdown. Each is declared explicitly as `(view-local intent)` in its wiring row. A view-local intent must not emit a domain event, must not write a `TodoTransition`, and must not be presented in the catalog as a command.

**Availability and disabled reason come from the owner.** Every row reads `state.assistant_redesign.<selector>.availability` and `state.assistant_redesign.<selector>.disabled_reason` from its semantic owner before dispatch. A surface that cannot read the owner projection renders the control disabled rather than optimistic, and it announces the exact owner reason rather than a generic one.

**Negative paths are part of the wiring row.** Each row declares the specific thing it must not do — no Draft UI, no direct Plan edit, no bulk To-Do completion, no unrelated composer text on a component send, no auto-resume after a manual stop, no provider-native state read back as canonical. A wiring row whose negative path is not asserted by a test is not closed.

**Manual stop outranks every automatic producer.** Any row whose producer is a schedule, an execution window, a quota resume, Crew Auto, Goal continuation, or a provider retry must re-check the latched `user_stop_epoch` immediately before dispatch and abort with the exact failed clause when it has moved.

**Read-only advisors are never in the mutation path.** Back Seat Driver rows produce advice records and projections only. No BSD row may be a precondition of a primary-flow row, and no primary-flow row may read BSD health to decide whether it may proceed.

**Exact-version targets revalidate.** Any row that dispatches against a Plan, a message snapshot, or a frozen review target carries the exact version and hash, revalidates immediately before dispatch, and aborts rather than rebinding to a newer target.

### UIW-018 - Assistant Redesign Row Discipline And Declared View-Local Intents

```yaml
plan_unit_id: UIW-018
unit_type: wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Every Assistant redesign wiring row names one producer, one registered command ID, and one sole future target handler, reads its owner availability and exact disabled reason from the declared state selectors before dispatch, and renders disabled with command_not_registered when no registered command exists. A row carrying a view-local or owner-internal effect rather than a user-facing command is declared explicitly as a view-local intent, emits no domain event, writes no transition record, and receives no catalog command row. Each row declares its specific negative path and is not closed until a test asserts it. A row whose producer is a schedule, window, quota resume, Crew Auto, Goal continuation, or provider retry re-checks the latched user_stop_epoch immediately before dispatch and aborts with the exact failed clause when it has moved. Back Seat Driver rows produce advice records and projections only and may never be a precondition of a primary-flow row. Rows dispatching against a Plan, message snapshot, or frozen review target carry the exact version and hash, revalidate immediately before dispatch, and abort rather than rebinding.
gui_related: true
gui_classification_reason: These rules govern how every Assistant control resolves availability, dispatch, and disabled state.
depends_on: [UIW-017]
unblocks: []
acceptance_criteria:
  - Every row names one command or is declared a view-local intent.
  - No page-local action, alias, fixture, timer, or toast simulates a registered command.
  - Every declared negative path has an asserting test.
  - Automatic producers re-check the stop epoch immediately before dispatch.
  - No primary-flow row depends on BSD health.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: simulated_command_success_or_undeclared_local_action
reasoning_tier: high
context_scope: assistant_redesign_wiring_rules
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.production.json
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: static_wiring_rule_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:machine/wiring.json
  - pm-assistant-implementation-2026-09-02-recovered:05_GUI_WIRING_MATRIX.md
  - pm-assistant-implementation-2026-09-02-recovered:DRY-004
preserved_exact_tokens:
  - "command_not_registered"
  - "handler_unavailable"
  - "user_stop_epoch"
negative_constraints:
  - Do not let a view-local intent emit a domain event or a transition record.
  - Do not make a primary-flow row depend on Back Seat Driver.
  - Do not rebind an exact-version dispatch to a newer target.
owner_hints:
  - Plans/UI_Wiring_Rules.md
```

## Assistant redesign: what belongs in the production wiring matrix (2026-09-03)

`Plans/Wiring_Matrix.production.json` is the register of **registered
GUI → command → handler** wiring. Its schema requires every row to name a
`ui_command_id` matching `^cmd\.…`, and that requirement is load-bearing: a row
in this file asserts that a real command identity exists for the element.

A **view-local or owner-internal effect is therefore not a row here.** The
Assistant redesign initially carried sixteen such rows, each named
`(view-local intent) …` and each marked `proposed_census_required` in the source
packet — that is, explicitly *not* registered. They have been removed from the
production matrix. Their behaviour remains specified in their owner documents;
what they never had was a command identity, and inventing one to satisfy the
schema would have made this file claim a registration that does not exist.

The removed rows, with their owners:

| Packet row | Effect | Owner |
|---|---|---|
| W-001 | local ComposerBuffer update | `Plans/storage-plan.md` |
| W-012 | internal continuation evaluation | `Plans/Goal_Runtime_System.md` |
| W-021 | To-Do work binding | `Plans/ToDo_Runtime.md` |
| W-022 | To-Do transition | `Plans/ToDo_Runtime.md` |
| W-026 | existing questionnaire submit | `Plans/PRD_Builder.md` |
| W-027 | research capability request | `Plans/Collaborative_Workflows.md` |
| W-028 | BrainStorm vote action | `Plans/Collaborative_Workflows.md` |
| W-031 | Review internal result | `Plans/Collaborative_Workflows.md` |
| W-032 | Review vote action | `Plans/Collaborative_Workflows.md` |
| W-033 | Review finalize action | `Plans/Collaborative_Workflows.md` |
| W-037 | BSD internal trigger evaluator | `Plans/Back_Seat_Driver.md` |
| W-038 | BSD internal hold | `Plans/Back_Seat_Driver.md` |
| W-039 | BSD internal reconfirm | `Plans/Back_Seat_Driver.md` |
| W-048 | scheduling internal eligibility | `Plans/Scheduling_and_Quota_Resume.md` |
| W-050 | internal memory policy | `Plans/Assistant_Memory.md` |
| W-053 | internal title admission | `Plans/Assistant_Plan_Runtime.md` |

Two further corrections were made at the same time, and the rules behind them
apply to every future row:

- **A wiring row names one command, never a family.** `cmd.chat_room.promote_to_*`
  was expanded into the three commands the catalog actually carries:
  `promote_to_goal`, `promote_to_plan`, `promote_to_todo`.
- **`ui_element_id`'s first segment carries no underscore** (`^[a-z][a-z0-9]*`),
  so the redesign namespace is `assistant.redesign.…`, not `assistant_redesign.…`.
  The entry keys are unchanged; only the element identity is.

### Denominator note for `scripts/pm-touch-closure-verify.py`

That verifier pins `production_wiring_entry_count` to an exact expected value so
an unnoticed change to this file is caught. The redesign deliberately adds 41
rows, taking the file from 1066 to **1107** entries. The pin has **not** been
moved here: quietly editing a drift detector's expected value is the opposite of
what it is for. Updating it from 1066 to 1107 is a one-line owner decision that
should be made deliberately, and `validate_touch_closure` will keep reporting the
drift until it is.

### Handler-identity census (2026-09-03)

Every one of the redesign's 84 commands was censused against the handler identity
declared in `Plans/UI_Command_Catalog.md` and `Plans/Commands_System.md`. The two
catalogs agreed with each other on all 84; the wiring matrix did not, and now does.
**Result: 0 commands bound to more than one handler identity.**

What the census corrected:

- **43 wiring rows named a handler that the catalog does not declare.** They had
  been derived from the command's own namespace (`cmd.chat.todos.open` →
  `handlers::chat::todos_open`) rather than read from the catalog, which binds that
  command to its owner (`handlers::todo_runtime::todos_open`). Deriving a handler
  name from a command name is not a census; the catalog is the register and the
  rows now read it.
- **Two pre-Goal-V2 rows** (`catalog.chat_goal_start`, `catalog.chat_goal_update`)
  still pointed at `handlers::chat::goal_*` while the catalog had moved the binding
  to `handlers::goal_runtime::goal_*` under the simplified Goal runtime. Aligned.
- **`cmd.bsd.set`** was bound to both `handlers::back_seat_driver::set_mode` and the
  alias `handlers::bsd::set`, with a parallel `BSDModeSetRequest` contract family.
  `Plans/Back_Seat_Driver.md` §17 already said in prose that the alias must not be
  admitted and the existing binding wins; the catalog rows now match its own rule.
- **`cmd.settings.open`** carried the prose placeholder `existing Settings handler`,
  which is not an identity. Bound to `handlers::settings::open_route`.

One binding is **new and wants an owner's confirmation**: `cmd.chat.revert` had no
handler identity declared anywhere in either catalog, only prose saying it "routes
through the canonical FileSafe file-restore pipeline". Its wiring row carried the
placeholder `existing FileSafe handler`, which fails the handler pattern. It is now
`handlers::filesafe::restore_turn_manifest` — a name chosen to match the convention
and the command's documented behaviour, not one read from a register. If FileSafe's
owner spells it differently, this is the one place to change.

## Additive Correction v4: wiring coverage and the internal-producer register (2026-09-03)

`PM_Assistant_v2_Additive_Correction_v4` supplies 51 wiring rows (`CW-001..CW-051`). They split
along the rule already established in the section above: **a production wiring row names one
registered command.** The schema enforces `ui_command_id` against `^cmd\.…`, and inventing a
command identity to satisfy that pattern would make this register assert a registration that
does not exist.

### Command-bearing rows — revised in place

Twenty-seven existing production entries carry the correction. None is new: the branch-current
census found every command the correction touches already registered, so the correction adds
acceptance checks and correction-specific test rows rather than rows.

| Packet rows | Production entry |
|---|---|
| CW-004, CW-009 | `assistant.redesign.w_016.chat_plan_build` |
| CW-022 | `assistant.redesign.w_017.chat_plan_build_with_crew` |
| CW-008, CW-010 | `assistant.redesign.w_018.chat_plan_schedule_build` |
| CW-011 | `assistant.redesign.w_020.chat_plan_export` |
| CW-012 | `assistant.redesign.cmd.chat_plan_open_details` |
| CW-013, CW-048 | `assistant.redesign.cmd.chat_plan_view_set` |
| CW-005 / CW-006 / CW-007 / CW-047 | `…w_007.chat_goal_pause` / `…w_008.chat_goal_resume` / `…w_009.chat_goal_cancel` / `…w_010.chat_goal_update` |
| CW-014, CW-015 | `assistant.redesign.cmd.collaboration_configure` |
| CW-016, CW-019 | the four `…collaboration_start` entries (w_023, w_025, w_030, w_034) |
| CW-024 | `assistant.redesign.cmd.collaboration_reconfigure` |
| CW-018 | `assistant.redesign.w_024.chat_crew_auto_set` |
| CW-029 / CW-030 / CW-031 | the three `chat_schedule_message*` entries |
| CW-033 | `assistant.redesign.w_002.chat_attachment_add` |
| CW-034 | `catalog.chat_add_file_reference` |
| CW-035 / CW-036+CW-049 / CW-050 / CW-037 | the four `browser_component_*` entries |
| CW-051 | `assistant.redesign.cmd.chat_todos_toggle_parent` |

Each revised entry gained the correction's acceptance checks and correction test rows under the
`wiring.correction_v4.*` prefix, covering the negative, race, restart, stale-target, and
provider-degradation paths the correction requires. Their `evidence_required` text now names the
`CW-` rows that produced them and repeats that a production-intent row proves no runtime fact.

### Internal-producer rows — owner-documented, not matrix rows

The remaining twenty-four `CW-` rows have **no command identity**. They are owner-internal
producers, projectors, and reducers. They stay out of this register for the same reason the
sixteen view-local rows did, and their behaviour is specified — with the same
producer → handler → durable effect → consumer → failure shape — in their owner documents:

| Packet rows | Internal producer | Owner |
|---|---|---|
| CW-001 | question admission and budget projection | `Plans/Assistant_Plan_Runtime.md` (QMAX-005..016) |
| CW-002, CW-045 | Settings transaction and question-limit migration | `Plans/Settings_System.md`, `Plans/storage-plan.md` (MIG-001..003) |
| CW-003 | `AssistantPlanProgressProjector` recompute | `Plans/Assistant_Plan_Runtime.md` (PPROG-002, CDRY-002) |
| CW-010 | scheduler plan dispatch | `Plans/Scheduling_and_Quota_Resume.md` (PSCHED-004, PSCHED-013) |
| CW-017 | modal close / draft discard | `Plans/Collaborative_Workflows.md` (MODAL-004) |
| CW-020, CW-021 | ComposerBuffer BrainStorm config and held request | `Plans/Collaborative_Workflows.md` (MODAL-011..012) |
| CW-023 | participant failure and timeout dispositions | `Plans/Collaborative_Workflows.md` (PART-001..006) |
| CW-025, CW-026, CW-027, CW-028 | Review, BrainStorm, Crew and Chat Room reducers | `Plans/Collaborative_Workflows.md` (PART-007..019) |
| CW-032 | `internal.scheduler.dispatch_scheduled_message` | `Plans/Scheduling_and_Quota_Resume.md` (SMSG-006, SMSG-010..011) |
| CW-038, CW-039, CW-040 | To-Do graph mutation, list replacement, late-event gate | `Plans/ToDo_Runtime.md` (TDG-001..012) |
| CW-041, CW-042 | embed render and artifact retention | `Plans/Runtime_Artifacts_Panel.md` (PDET-008..012, PDET-006) |
| CW-043, CW-044 | Goal completion predicate and replay | `Plans/Goal_Runtime_System.md` (GREPLAY-003..010) |
| CW-046 | concept two-build byte check | `Concepts/chat-assistant-concepts/5.6 Pro/build.py` (CONCEPT-017) |

### CDRY-012 — What a complete row covers

Production wiring covers the whole path for every correction surface: GUI or internal
producer → command or intent → sole handler → owner record, event or receipt →
projector → every GUI consumer, including the failure and recovery paths. Reverse
coverage is mandatory, because it is the only thing that detects an orphan control or
an invisible effect; validating command-to-handler rows alone is not sufficient
coverage and never closes this requirement.

### Reverse coverage for the correction

Reverse coverage is what detects an orphan control or an invisible effect, so the correction's
new projections each name their consumers explicitly in the owner document and in the revised
`acceptance_checks`:

- `PlanProgressProjection` → Rich status markers, the Markdown gutter, the Plan card summary, and
  Plan Details. Every consumer reads the same projection; none keeps a private copy, and a stale
  projection is disclosed rather than rendered as current.
- `PlanExecutionAttentionProjection` → the Build control's secondary line and its allowed
  actions.
- `PlanningQuestionBudgetProjection` → the questionnaire host, Plan and Deep Plan Details, and
  the BrainStorm modal.
- `ScheduledMessageProjection` → the thread schedule card and its Details.
- `ParticipantDisposition` and `CollaborationCompletionProjection` → the workflow card,
  participant rows, the full panel, Activity, and Usage.
- `ToDoListReplacementDisposition` → the To-Dos Activity list and, through the projector, Plan
  progress.

### Accessibility

`CONCEPT-020` puts accessibility outside this correction. The `accessibility_contract` block
remains a schema requirement on every entry and is untouched; no correction failure is raised for
accessibility, and no pre-existing accessibility behaviour is removed.

### Additive Correction v4: five tokens that must stay unregistered (2026-09-03)

`validate_wiring_matrix` scrapes `cmd.*` tokens out of `Plans/UI_Command_Catalog.md`
and requires a production row for each. The correction's catalog section ends with an
explicit list of command ids it **forbids creating** — and the scraper read that list
as five new registrations.

Giving them rows would have made this register assert exactly the identities the
correction exists to prevent. They are recorded in
`Plans/Wiring_Matrix.production.exclusions.json` instead, each with its reason:

| Token | Why it must not exist |
|---|---|
| `cmd.chat.plan.build_as_goal` | Build as Goal is `cmd.chat.plan.build` with `execution_topology: goal_driven` (PGOAL-002, CDRY-004). |
| `cmd.chat.plan.export_report` | The execution report is `cmd.chat.plan.export` with `content_kind: execution_report` (CDRY-005). |
| `cmd.chat.plan.progress.set` | Progress is a derived projection; `internal.plan_progress.recompute` is an owner action, not a command (PPROG-018, CDRY-002). |
| `cmd.chat.add_folder_reference` | A folder is added through `cmd.chat.attachment.add` with `semantic_kind: folder` (FOLDER-003). |
| `cmd.browser.component.recapture` | Recapture reuses `cmd.browser.component.pick` so one flow owns identity creation (BSTALE-004). |

This is a fifth exclusion class beside the four the file already recorded: **a token
that appears in the catalog only inside an explicit "deliberately NOT registered"
list.** A future correction that names forbidden ids in prose should add them here at
the same time.
