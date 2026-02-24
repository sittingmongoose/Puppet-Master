# Contracts V0 (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- CANONICAL CONTRACTS

Purpose:
- This file is the single source of truth for core, cross-cutting **contracts** referenced by other plan documents.
- Keep it DRY: define only stable envelopes + type contracts; other plans reference these contracts instead of redefining.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This document defines the canonical contracts for:
- Persisted event envelopes (`EventRecord`, schema `pm.event.v0`)
- A minimal compatibility envelope (`EventEnvelopeV1`) used by early-phase writers/readers
- UI commands (`UICommand`)
- Auth state + events (`AuthState`, `AuthPolicy`, `AuthEvent`)

Other plans MUST reference these contracts rather than redefining them.

ContractRef: ContractName:Plans/Contracts_V0.md

---

## 1. Events (persisted)

<a id="1.1"></a>
<a id="EventRecord"></a>
### 1.1 EventRecord -- canonical persisted envelope (schema: `pm.event.v0`)
**Definition:** `EventRecord` is the canonical event envelope persisted to seglog (and mirrored to JSONL and projections).

**Required fields:**
```json
{
  "schema": "pm.event.v0",
  "ts": "2026-02-23T00:00:00Z",
  "seq": 1,
  "type": "tool.invoked",
  "run_id": "PM-...",
  "thread_id": "TH-...",
  "payload": {}
}
```

**Field semantics:**
- `schema` (string, required): MUST be exactly `pm.event.v0`.
- `ts` (string, required): ISO-8601 UTC timestamp.
- `seq` (integer, required): monotonically increasing per seglog writer (or per run) to support checkpointing.
- `type` (string, required): event type (e.g., `chat.message`, `run.started`, `tool.invoked`).
- `run_id` (string, required): stable correlation for a provider run / orchestrator run.
- `thread_id` (string, required): stable correlation for a user-visible chat thread / session.
- `payload` (object, required): event-specific payload.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:Spec_Lock.json#schema_versions.event_record

**Compatibility:** Readers MAY accept `EventEnvelopeV1` during transition; writers MUST emit `EventRecord` for persisted seglog. (See §1.2.)

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, PolicyRule:Decision_Policy.md§1

---

<a id="EventEnvelopeV1"></a>
### 1.2 EventEnvelopeV1 -- minimal compatibility envelope
`EventEnvelopeV1` is the minimal event envelope used by some plans as an intermediate format.

```json
{
  "ts": "2026-02-23T00:00:00Z",
  "seq": 1,
  "type": "run.started",
  "payload": {}
}
```

Rules:
- Writers SHOULD include `run_id` and `thread_id` whenever available, but `EventEnvelopeV1` does not require them.
- Readers MUST tolerate both envelopes; projectors SHOULD upgrade in-memory to `EventRecord` form.

ContractRef: ContractName:Plans/Contracts_V0.md#EventEnvelopeV1, PolicyRule:Decision_Policy.md§2

---

## 2. Provider normalized stream (non-persisted contract)
Providers emit a normalized stream for live UI consumption. Persistent storage remains governed by `EventRecord` in §1.

**Normative:** See `Plans/CLI_Bridged_Providers.md` for the full schema (event envelope + event types). This contracts file only asserts the boundary: normalized provider stream events are transport-facing, while seglog events are persistence-facing.

---

## 3. Tool events (persisted)
Tool activity MUST be represented in the persisted event stream using the following `type` values.

ContractRef: EventType:tool.invoked, EventType:tool.denied, ContractName:Plans/Contracts_V0.md

### 3.1 `tool.invoked`
Emitted when a tool call is allowed and execution completes.

**Payload (minimum):**
```json
{
  "tool_name": "bash",
  "run_id": "PM-...",
  "thread_id": "TH-...",
  "latency_ms": 120,
  "success": true,
  "error": null
}
```

### 3.2 `tool.denied`
Emitted when policy blocks (deny) or the user declines an ask.

**Payload (minimum):**
```json
{
  "tool_name": "bash",
  "run_id": "PM-...",
  "thread_id": "TH-...",
  "reason": "permission_denied"
}
```

**SSOT tie-in:** Payload fields and semantics are SSOT in `Plans/Tools.md` (§8.0) and `Plans/storage-plan.md` (§2.2). This file defines the event-type names as a contract.

---

## 4. Auth contracts

<a id="AuthState"></a>
### 4.1 AuthState
Represents the canonical authentication status for a single provider (e.g., GitHub API auth).

**Minimum fields:**
```json
{
  "provider": "github",
  "state": "authenticated",
  "account_label": "github.com/octocat",
  "updated_at": "2026-02-23T00:00:00Z"
}
```

Rules:
- `state` is one of: `unauthenticated` | `pending` | `authenticated` | `failed`.
- Secrets (tokens) MUST NOT be stored in `AuthState` when persisted; secrets live only in the OS credential store.

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

<a id="AuthPolicy"></a>
### 4.2 AuthPolicy
Defines deterministic defaults for auth method selection per provider.

Rules:
- For GitHub, default interactive auth MUST be OAuth device-code flow (see `Plans/GitHub_API_Auth_and_Flows.md`).

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, SchemaID:Spec_Lock.json#locked_decisions.auth_model

<a id="AuthEvent"></a>
### 4.3 AuthEvent
Auth flows MUST emit persisted events using `EventRecord` (§1.1), with stable `type` strings owned by the provider's plan.

Example (GitHub):
- `auth.github.device_code.issued`
- `auth.github.token.polling`
- `auth.github.authenticated`
- `auth.github.failed`
- `auth.github.disconnected`

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Contracts_V0.md#EventRecord

---

<a id="7"></a>
<a id="UICommand"></a>
## 7. UICommand
UI actions that trigger non-trivial logic MUST be expressed as UI commands with stable IDs.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md#UICommand

### 7.1 UICommand envelope
```json
{
  "command_id": "cmd.github.connect",
  "issued_at": "2026-02-23T00:00:00Z",
  "origin": "ui",
  "correlation_id": "UI-...",
  "args": {}
}
```

Rules:
- `command_id` MUST be a stable string ID (e.g., `cmd.github.connect`, `cmd.lsp.goto_definition`).
- The UI MUST dispatch commands; it MUST NOT implement business logic directly.
- Implementations MUST record command dispatch as events (event type is implementation-defined, but MUST be persisted in seglog using `EventRecord`).

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md#EventRecord

<a id="WiringEntry"></a>
### 7.2 WiringEntry -- wiring matrix row contract
**Definition:** `WiringEntry` is the canonical shape of a wiring matrix row that binds a UI element to a UICommand handler with expected events and acceptance checks.

**Required fields:**
```json
{
  "ui_element_id": "btn.github.connect",
  "ui_location": "Settings > GitHub/Auth",
  "ui_command_id": "cmd.github.connect",
  "handler_location": "handlers::github_auth::connect",
  "expected_event_types": ["auth.github.device_code.issued", "auth.github.authenticated"],
  "acceptance_checks": ["Handler registered in dispatcher", "Dispatch emits expected events"],
  "evidence_required": "Test exercising cmd.github.connect dispatch returns expected events"
}
```

Rules:
- `ui_command_id` MUST reference a stable ID from `Plans/UI_Command_Catalog.md`.
- `expected_event_types` MUST match the command's declared expected events in the catalog.
- `acceptance_checks` MUST contain at least one testable assertion.
- In machine-readable matrix artifacts, each row is stored under `entries.<ui_element_id>` and the row's `ui_element_id` value MUST match that key.
- Full schema: `Plans/Wiring_Matrix.schema.json`.

ContractRef: ContractName:Plans/UI_Wiring_Rules.md, SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/UI_Command_Catalog.md, Invariant:INV-011, Invariant:INV-012

---

## References
- `Plans/storage-plan.md` (seglog envelope and persistence)
- `Plans/Tools.md` (tool permission semantics + payload definitions)
- `Plans/CLI_Bridged_Providers.md` (normalized provider stream schema)
- `Plans/GitHub_API_Auth_and_Flows.md` (GitHub auth event types and flows)
- `Plans/UI_Wiring_Rules.md` (wiring rules and verification strategy)
- `Plans/Wiring_Matrix.schema.json` (WiringEntry schema)
