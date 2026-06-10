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

When a GUI concept artifact is included in a reconciliation packet, `Concepts/PuppetMasterDashComp.html` is the primary concept input for wiring review until superseded by a newer explicit concept artifact in the same packet. The path token `/PuppetMasterDashComp.html` is evidence lineage, not a live Plans owner path; UI wiring canon remains in this document, GUI product/layout canon remains in `Plans/FinalGUISpec.md`, and command canon remains in `Plans/UI_Command_Catalog.md`.

`Concepts/PMConcept.html` is likewise a GUI concept-lineage input when cited by a transfer source; `/PMConcept.html` drives reconciliation targeting and wiring review but MUST NOT be copied verbatim into canon or treated as a live owner path.

Annotation and targeted-revision work is a cross-surface GUI feature, not just a backend `note-schema` tweak. Wiring must cover the reusable GUI components in `Plans/FinalGUISpec.md` (`AnnotationActionMenu`, `AnnotationDrawer`, `ContextChipStrip`), their commands, projected state, status/live-region updates, and separate send-to-chat chip behavior across Assistant Deep Plan, Wizard/PRD review, Interview embedded document pane, and document viewer review surfaces.

Cross-surface wiring reviews for Debug Mode and similar features must verify command IDs, overlays, attachments, and route/open wiring against non-derived owner-doc clusters, including `/runtime/permissions/storage/browser/artifacts/tools/UI`, `/prompt/command`, and `/index/terminology`, while keeping product semantics in the owner docs rather than in wiring rows.

Route-aware wiring verification extends the simple `ui_element_id -> ui_command_id -> handler_location -> expected_event_types` proof with optional metadata fields: `command_arg_contract_ref?`, `route_target_kind?`, `subject_kind?`, `deprecated_alias_for?`, `preconditions?`, `arg_passthrough_requirements?`, and `correlation_passthrough?`. These fields are verification hints only; `WiringEntry` consumes route/open semantics and cannot become the route owner.

The wiring layer remains deliberately small: rows key off `ui_command_id`, handler location, expected events, and evidence, while gate logic understands command-normalization metadata and keeps `wiring-schema` expansion minimal instead of duplicating command-owner contracts.

`GATE-010` route-aware verification includes schema validation, command coverage, handler resolution, `expected-event` emission, unknown-command rejection, architectural lints, wrapper normalization, argument passthrough, correlation passthrough, and route target kind checks.

Runtime action wiring reconciles old `cmd.graph` / `cmd.graph.*` recovery actions to canonical `cmd.runtime` / `cmd.runtime.*` command contracts. Package, lane, and `/package/lane` promotion controls must dispatch through cataloged command IDs rather than ad hoc UI confirms or untyped wiring shortcuts.

Reserved slash-command override policy must resolve into one command-catalog rule: real `cmd.chat`, `cmd.chat.*`, `cmd.orchestrator`, and `cmd.orchestrator.*` IDs must be cataloged before UI wiring lands, and referenced-but-uncataloged IDs such as `cmd.chat.run_user_command`, `cmd.orchestrator.switch_tab`, and `cmd.chat.branch_from_restore` remain gate failures until cataloged, aliased, or retired.

Runtime-artifact wiring consumes `Plans/Runtime_Artifacts_Panel.md` and `/Runtime_Artifacts_Panel.md` for envelope ownership; per-family behavior and bridge-governance semantics are verified by owner references, not by copying runtime-artifact payload rules into wiring rows.

Weak-integration verification tracks dead-end GUI and end-to-end workflow risks when backend `/runtime` or `/governance` behavior exists but is not exposed in the operator control surface. Category labels include `wiring`, `workflow`, `state_contract`, `gui_alignment`, `design_architecture`, `quality`, `evidence_gap`, `corroboration`, `recovery`, `account_usage_pressure`, and `projection_trust`.

Element-centric and command-centric wiring remains the baseline proof: `ui_element_id -> ui_command_id -> handler_location -> expected_event_types` proves dispatch coverage, while route-aware gates add navigation, subject, and `/consumer/runtime-trace` checks without replacing the row shape. The machine-readable wiring schema remains a set of `interactive-element` dispatch rows; producer/consumer trace evidence is layered above that schema rather than used as a substitute for it.

The UI command envelope evidence keeps `command_id`, `issued_at`, `origin`, `correlation_id`, and `args` visible and references `Contracts_V0.md`; wiring rows may verify envelope passthrough but do not redefine the command contract.

A broad public `cmd.nav` / `cmd.nav.*` family is optional alias surface, not the mandatory answer for every route. Wrapper commands can normalize to shared route contracts, and any `cmd.nav` prototype must carry alias `/deprecation`, handler-registration, and gate-maintenance consequences through `GATE-010`.

`GATE-010` must verify that wrapper command IDs normalize to shared route primitives instead of treating every public command ID as independent. Generalized route `/subject` navigation cannot be reduced to one-off handler/event coverage; the gate evidence must prove argument passthrough, subject kind, route target kind, and wrapper normalization.

Stale `Tiers` vocabulary from `FinalGUISpec.md` is compatibility lineage only; wiring rules do not reintroduce `Tiers` as a live route, object, or navigation vocabulary.

Wiring SSOT / SSOTs integrity includes stale or `/degraded` action preconditions, owner-doc `/runtime` gating, dispatcher/runtime gating, and command registration. These are owner-doc blocking issues when they affect action availability; they are not cosmetic drift in wiring prose.

Adjacent `GUI` usage controls such as `auth-mode` and `/effective-account` filtering remain consumer requirements until usage/account owners guarantee them. UI wiring may expose the `/UI` control only when the command and effective-account contract exists.

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
