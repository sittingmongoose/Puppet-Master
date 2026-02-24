# UI Wiring Rules (Canonical)

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

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand, Primitive:Gate

---

<a id="section-1"></a>
## 1. Rule 1 — UI Command Dispatch Only

The UI layer MUST dispatch only typed `UICommand` messages whose `command_id` values are stable IDs drawn from `Plans/UI_Command_Catalog.md`.

**Hard rules:**
- The UI MUST NOT call backend services, storage, or domain logic directly.
- All user-initiated interactions flow through the UI Command Dispatcher boundary (see [§3](#section-3)).
- No backend mutation may originate from the view layer; the view layer is a pure function of projected state plus outbound `UICommand` emissions.

ContractRef: ContractName:Contracts_V0.md#UICommand, ContractName:Architecture_Invariants.md#INV-004, ContractName:Architecture_Invariants.md#INV-011

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

ContractRef: ContractName:Contracts_V0.md#UICommand, ContractName:Contracts_V0.md#EventRecord, ContractName:Architecture_Invariants.md#INV-004

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
| `handler_location` | Rust module path to the handler function (e.g. `crate::core::handlers::auth`) |
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

---

<a id="section-5"></a>
## 5. Autonomous Verification Strategy

All wiring verification is scriptable and runs without paid UI tooling or manual inspection.

### 5.1 Verification checks

1. **Schema validation** — Wiring matrix JSON validates against `Plans/Wiring_Matrix.schema.json`.
2. **Element uniqueness check** — Every `entries` key is unique and each row's `ui_element_id` matches its key (`one element, one command`).
3. **Coverage check** — Every `UICommandID` in `Plans/UI_Command_Catalog.md` has at least one wiring matrix entry.
4. **Handler registration check** — Every wiring matrix entry's `handler_location` resolves to a real module and function in the Rust source tree.
5. **Event emission test** — Tests that exercise command dispatch verify the `expected_event_types` listed in the wiring matrix are emitted.
6. **Dead command detection** — `UICommandID` values found in source code but absent from `Plans/UI_Command_Catalog.md` are flagged as dead commands.

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
