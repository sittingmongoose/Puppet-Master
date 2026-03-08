# Contracts V0 (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- CANONICAL CONTRACTS

Purpose:
- This file is the single source of truth for core, cross-cutting **contracts** referenced by other plan documents.
- Keep it DRY: define only stable envelopes + type contracts; other plans reference these contracts instead of redefining.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- Use "Puppet Master" naming consistently throughout this document.
-->

## 0. Scope
This document defines the canonical contracts for:
- Persisted event envelopes (`EventRecord`, schema `pm.event.v0`)
- A minimal compatibility envelope (`EventEnvelopeV1`) used by early-phase writers/readers
- Provider normalized stream (CLI-bridged, server-bridged, and direct-provider transports)
- UI commands (`UICommand`)
- Auth state + events (`AuthState`, `AuthPolicy`, `AuthEvent`)

Other plans MUST reference these contracts rather than redefining them.

ContractRef: ContractName:Plans/Contracts_V0.md

---

## 1. Events (persisted)

<a id="1.1"></a>
<a id="EventRecord"></a>
### 1.1 EventRecord -- canonical persisted envelope (schema: `pm.event.v0`)
#### Persona/runtime snapshot payload contract

The following object is the canonical persisted payload fragment for any event that claims to expose requested/effective Persona or runtime-resolution state:

```json
{
  "requested_persona": "rust-engineer",
  "effective_persona": "rust-engineer",
  "persona_selection_source": "auto_surface_resolver",
  "selection_reason": "Auto: Rust repo + code task",
  "persona_override_scope": "none",
  "persona_override_owner_id": null,
  "requested_platform": "codex",
  "effective_platform": "codex",
  "requested_model": "openai/gpt-5.3",
  "effective_model": "openai/gpt-5.3",
  "requested_variant": "powerful",
  "effective_variant": "powerful",
  "effective_temperature": null,
  "effective_top_p": null,
  "effective_reasoning_effort": "high",
  "effective_talkativeness": "talk_more",
  "applied_persona_controls": [],
  "skipped_persona_controls": []
}
```

Rules:
- `requested_persona` and `effective_persona` are the canonical persisted field names across all surfaces. They store canonical Persona IDs.
- Persisted payloads MUST NOT introduce parallel canonical fields named `requested_persona_id` or `effective_persona_id`. Older readers may accept them only as migration aliases before normalization.
- `run.started` MUST include the full snapshot when a run reaches prompt/runtime assembly.
- `run.completed` MUST include the final effective snapshot used by the completed run.
- `chat.subagent_started`, `chat.subagent_completed`, `run.tier_started`, `run.tier_completed`, and `run.persona_stage_changed` MUST either inline these fields or carry them as a child object named `persona_runtime_snapshot`.
- If a run proceeds without Persona context, the snapshot MAY still be emitted with `requested_persona = null`, `effective_persona = null`, and a `selection_reason` that explicitly records the bare-context fallback.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

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

**Run-event minimums (canonical):**
- `run.started` persisted via `EventRecord` MUST include `mode`, `strategy`, and `strategy_resolution_reason` in `payload`.
- `run.completed` persisted via `EventRecord` MUST include `status` and canonical `outcome`, and SHOULD include `stop_reason`, `budget_key`, `budget_limit`, and `observed_value` when termination was budget- or policy-driven.

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

**Payload schema ownership:** `Contracts_V0.md` owns the canonical persisted envelope (`EventRecord`) and cross-cutting auth/event contracts. Concrete persisted event-type payload schemas are registered in `Plans/storage-plan.md` so writers, projectors, analytics, and generated docs share one payload SSOT.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord

---

## 2. Provider normalized stream (non-persisted contract)
Providers emit a normalized stream for live UI consumption. Persistent storage remains governed by `EventRecord` in §1.

**Normative:** See `Plans/CLI_Bridged_Providers.md` for the full schema (event envelope + event types). This contracts file only asserts the boundary: normalized provider stream events are transport-facing, while seglog events are persistence-facing.

**Provider architecture constraints (normative):**
- All providers (CLI-bridged, server-bridged, and direct-provider) MUST conform to the unified Provider facade/trait contract with capability flags and tool-policy inputs defined at the Provider boundary.
- UI and orchestrator consumers MUST NOT special-case provider transport or provider brand beyond provider configuration fields (enablement, connection/auth inputs, model selection).
- Provider-originated events and tool-call lifecycle signals MUST be normalized into the canonical provider event stream contract before reaching consumers or persistence mapping.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Tools.md

---

### 2.1 Provider transport taxonomy

Providers may use one of these transport classes. The normalized stream contract (§2) applies identically regardless of class:
- **CLI-bridged:** local CLI subprocess transport (`stream-json`/ACP). Cursor and Claude Code are CLI-bridged only.
- **Server-bridged:** HTTP REST + SSE to a local server process. OpenCode is server-bridged.
- **Direct-provider:** direct provider endpoint calls with provider-native auth. Codex, Copilot, and Gemini follow this class.

Canonical enum contract for implementation:
```text
ProviderTransport = CliBridge | DirectApi | ServerBridge
```

Mapping:
- `CliBridge` → CLI-bridged
- `DirectApi` → direct-provider
- `ServerBridge` → server-bridged

**Transport-specific notes:**
- Server-bridged providers communicate via HTTP REST endpoints and SSE event streams (e.g., OpenCode; see `Plans/Provider_OpenCode.md`).
- CLI-bridged providers communicate via CLI event outputs and adapter parsing (`Plans/CLI_Bridged_Providers.md`).
- Direct-provider integrations may use provider HTTP/gRPC endpoints directly, but they MUST still emit the same normalized event types (`text_delta`, `tool_use`, `tool_result`, `usage`, `done`, etc.).
- Consumers MUST NOT branch on transport class. All provider output is consumed through the unified normalized stream.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/CLI_Bridged_Providers.md

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

### 3.3 Requirements quality events

Requirements-quality workflow state MUST be represented in the persisted event stream with stable event types.

ContractRef: EventType:requirements.quality_report.generated, EventType:requirements.clarification_requested, EventType:requirements.clarification_resolved, SchemaID:pm.requirements_quality_report.schema.v1

#### `requirements.quality_report.generated`
Emitted when Pass 1 or Pass 2 writes the canonical quality report artifact.

Minimum payload:
```json
{
  "wizard_id": "WIZ-...",
  "report_path": ".puppet-master/project/traceability/requirements_quality_report.json",
  "verdict": "PASS",
  "needs_user_clarification_count": 0,
  "question_ids": []
}
```

#### `requirements.clarification_requested`
Emitted when the workflow enters `attention_required` or `blocked`.

Minimum payload:
```json
{
  "wizard_id": "WIZ-...",
  "wizard_step": "requirements",
  "report_path": ".puppet-master/project/traceability/requirements_quality_report.json",
  "thread_id": "TH-...",
  "question_ids": ["Q-0001"]
}
```

#### `requirements.clarification_resolved`
Emitted when user answers are accepted and a subsequent report clears all clarification items.

Minimum payload:
```json
{
  "wizard_id": "WIZ-...",
  "thread_id": "TH-...",
  "report_path": ".puppet-master/project/traceability/requirements_quality_report.json",
  "previous_question_ids": ["Q-0001"],
  "verdict": "PASS"
}
```

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md#15-requirements-quality-escalation-semantics

### 3.4 Tool-specific payload extensions

The minimum payloads in §§3.1–3.2 apply to all tools. Individual tool contracts MAY attach additional fields under `payload.meta` as long as the common fields remain present.

- **`capabilities.get`** (`tool.invoked`): MAY include `meta.capability_count`, `meta.enabled_count`, and `meta.disabled_count` so analytics and debugging can explain what snapshot was returned, but the authoritative capability list remains the tool result payload defined in `Plans/Media_Generation_and_Capabilities.md`.
- **`media.generate`** (`tool.invoked`): MAY include `meta.request_id`, `meta.kind`, `meta.backend`, `meta.artifacts_count`, and `meta.error_code` (when `success = false`) so telemetry can correlate generation runs with artifact directories and stable error codes. The canonical request/response contract remains in `Plans/Media_Generation_and_Capabilities.md`.

Any such extensions MUST remain additive and MUST NOT duplicate secrets or raw artifact bytes in persisted events.

ContractRef: ToolID:capabilities.get, ToolID:media.generate, PolicyRule:no_secrets_in_storage, ContractName:Plans/Media_Generation_and_Capabilities.md

---

## 4. Auth contracts

<a id="AuthState"></a>
### 4.1 AuthState
Represents the canonical authentication status for a single provider (e.g., GitHub API auth).

**Minimum fields:**
```json
{
  "provider": "github",
  "state": "LoggedIn",
  "account_label": "github.com/octocat",
  "updated_at": "2026-02-23T00:00:00Z"
}
```

Rules:
- `state` uses the canonical auth lifecycle set (`AuthJobState`): `LoggedOut` | `LoggingIn` | `LoggedIn` | `LoggingOut` | `AuthExpired` | `AuthFailed`.
- Secrets (tokens) MUST NOT be stored in `AuthState` when persisted; secrets live only in the OS credential store.

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

<a id="AuthPolicy"></a>
### 4.2 AuthPolicy
Defines deterministic defaults for auth method selection per provider.

Canonical enum contract for implementation:
```text
ProviderAuthMethod = OAuthBrowser | OAuthDeviceCode | ApiKey | GoogleCredentials | CliInteractive
```

Rules:
- Cursor and Claude Code use `CliInteractive` (CLI-bridged only).
- Codex supports `OAuthBrowser`, `OAuthDeviceCode`, and `ApiKey` for direct-provider auth/calls.
- GitHub Copilot uses `OAuthDeviceCode` for direct-provider auth/calls.
- Gemini uses direct-provider auth/calls with `OAuthBrowser` and `ApiKey`; `GoogleCredentials` is supported for Google credential-based execution.
- OpenCode uses server credentials for server access plus provider-native auth managed by OpenCode.
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

### 4.4 Setup/Health lifecycle contracts

Canonical enum contracts for implementation:
```text
InstallableComponent = CursorCli | ClaudeCli | Playwright
InstallJobState = NotInstalled | Installing | Installed | Uninstalling | Failed
AuthJobState = LoggedOut | LoggingIn | LoggedIn | LoggingOut | AuthExpired | AuthFailed
AuthRealm = github_api | copilot_github
```

Rules:
- `InstallableComponent` applies to Setup/Health install controls only.
- `InstallJobState` and `AuthJobState` are real-time UI/backend states and MUST be streamed deterministically.
- `AuthRealm` values MUST be isolated: tokens/state for `github_api` and `copilot_github` are separate and MUST NOT be cross-consumed.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md

---

## 5. Context management (instruction scoping + attempt journaling + parent summary + `AGENTS.md` enforcement)

This section defines cross-cutting context assembly and enforcement behaviors for the finished Puppet Master product.

<a id="InstructionBundleAssembly"></a>
### 5.1 InstructionBundleAssembly

**Definition:** Deterministic assembly rules for the **Instruction Bundle** used by Puppet Master agent runs at all tiers.

Rules:
- Puppet Master MUST assemble the run context as three explicit bundles in deterministic order: **Instruction Bundle**, then **Work Bundle**, then **Memory Bundle**.
- If scoped `AGENTS.md` is enabled, Puppet Master MUST include the applicable `AGENTS.md` chain from project root → the node scope directory.
- If scoped `AGENTS.md` is disabled, Puppet Master MUST include only the top-level `AGENTS.md` (if present).
- Precedence within the scoped `AGENTS.md` chain MUST be “closest wins” (deep overrides parent), and the chain MUST be de-duplicated deterministically.
- InstructionBundleAssembly owns Instruction/Work/Memory composition, scoped `AGENTS.md` precedence, and injected-context provenance metadata.
- Injected-context provenance metadata MUST record source kind, source path or stable ID, applied order, and whether redaction or summarization was applied before persistence or UI display.

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/Contracts_V0.md#ContextInjectionToggles

<a id="AttemptJournal"></a>
### 5.2 AttemptJournal

**Definition:** `attempt_journal` is the per-Subtask, per-Iteration ephemeral artifact used to prevent repeated failed attempts.

Rules:
- When Attempt Journal injection is enabled, Puppet Master MUST inject only the **most recent** attempt journal for the same Subtask into the next Iteration’s Memory Bundle.
- Puppet Master MUST NOT inject attempt-journal history by default (no multi-entry rollups in the Memory Bundle).

ContractRef: ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/Contracts_V0.md#ContextInjectionToggles

<a id="ParentSummary"></a>
### 5.3 ParentSummary

**Definition:** `parent_summary` is a short handoff summary injected into Iteration context to preserve intent without long history.

Rules:
- When Parent Summary injection is enabled, Puppet Master MUST inject `parent_summary` into the Iteration Memory Bundle.
- `parent_summary` MUST be capped to a short, deterministic budget (hard cap; see Decision Policy + defaults).

ContractRef: ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/Contracts_V0.md#ContextInjectionToggles, PolicyRule:Decision_Policy.md§2

<a id="PromotionRules"></a>
### 5.4 PromotionRules (journal → scoped `AGENTS.md` with anti-clutter gating)

Rules:
- Promotion MUST move only stable, non-obvious, scope-relevant learnings into the nearest appropriate `AGENTS.md`.
- Promotion MUST NOT add session-narrative or run-specific story text.
- Promotion MUST be budget-aware; if promotion would exceed budgets, promotion MUST require replacement/condense rather than growth.

ContractRef: ContractName:Plans/Contracts_V0.md#PromotionRules, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

<a id="AgentsMdLightEnforcement"></a>
### 5.5 `AGENTS.md` light enforcement (authoring-time lint + runtime budgets)

Rules:
- Puppet Master MUST lint `AGENTS.md` content at authoring time to discourage wiki-style bloat (directory trees, architecture tours, command encyclopedias, redundant discoverable info).
- Before a run, Puppet Master MUST enforce instruction budgets deterministically; when strict mode is enabled, Puppet Master MUST block the run until budgets are met.
- If runtime truncation is required, Puppet Master MUST NOT truncate Work Bundle acceptance criteria; truncation MUST prefer illustrative/examples content first and MUST be recorded in run metadata.

ContractRef: ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

<a id="ContextInjectionToggles"></a>
### 5.6 ContextInjectionToggles (GUI toggles + defaults + injected-context transparency)

Rules:
- Puppet Master MUST expose three per-project context injection toggles: Parent Summary, Scoped `AGENTS.md` beyond top-level, and Attempt Journal.
- Deterministic defaults for these toggles MUST be defined and recorded via the Decision Policy (no open questions).
- The GUI MUST show an “Injected Context” breakdown per run describing: included `AGENTS.md` paths + byte counts; parent summary and attempt journal inclusion + byte counts; and truncation (if any) with reason.

ContractRef: ContractName:Plans/Contracts_V0.md#ContextInjectionToggles, PolicyRule:Decision_Policy.md§2

---

## 6. HITLRequest

**Definition:** `HITLRequest` is the canonical persisted/requestable contract for a human-approval pause at an orchestrator boundary.

**Minimum fields:**
```json
{
  "request_id": "HITL-...",
  "run_id": "PM-...",
  "tier_id": "subtask-001",
  "tier_type": "subtask",
  "request_kind": "tier_boundary_approval",
  "message": "Subtask complete — approval required to continue.",
  "allowed_actions": ["approve_continue", "reject", "cancel_run"]
}
```

Rules:
- `request_kind` is `tier_boundary_approval` for V0.
- `allowed_actions` MUST be an ordered subset of `approve_continue | reject | cancel_run | skip`.
- `hitl.approval_requested`, `hitl.approved`, `hitl.rejected`, and `hitl.cancelled` events MUST carry a stable `request_id`.
- Rejections MAY add `reject_resolution` (`rerun | skip | abort`) and optional `rationale`.

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/storage-plan.md

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

## 8. UI Scaling

The application exposes a user-facing UI scale setting (Settings → General tab).
In the Slint rewrite this MUST be implemented via Slint's native window/global scale-factor mechanism.

ContractRef: ContractName:Plans/FinalGUISpec.md#7.4, ContractName:Plans/FinalGUISpec.md#16.2

**Contract fields:**

| Field | Value |
|-------|-------|
| `scale_range` | `[0.75, 1.5]` (clamped) |
| `presets` | `[0.75, 0.9, 1.0, 1.1]` |
| `default` | `1.0` |
| `mechanism` | Slint native scale factor (window-level) |
| `prohibited` | Per-token manual scaling / Iced-era `ScaledTokens` multiplication layers |

Rules:
- UI scale MUST use Slint's native global/window scale factor as the **only** scaling path.
- Per-token manual scaling (e.g. the legacy Iced `ScaledTokens` multiplication approach) MUST NOT be ported to Slint view code.
- The same four preset buttons (75 %, 90 %, 100 %, 110 %) MUST appear in Settings → General.
- Editor text zoom (Ctrl+= / Ctrl+−) is independent of app-level UI scale.

ContractRef: ContractName:Plans/FinalGUISpec.md#7.4, ContractName:Plans/FinalGUISpec.md#16.2, PolicyRule:Plans/rewrite-tie-in-memo.md#ui-scaling-migration

---

## References
- `Plans/storage-plan.md` (seglog envelope and persistence)
- `Plans/Tools.md` (tool permission semantics + payload definitions)
- `Plans/CLI_Bridged_Providers.md` (normalized provider stream schema)
- `Plans/GitHub_API_Auth_and_Flows.md` (GitHub auth event types and flows)
- `Plans/UI_Wiring_Rules.md` (wiring rules and verification strategy)
- `Plans/Wiring_Matrix.schema.json` (WiringEntry schema)
- `Plans/Provider_OpenCode.md` (OpenCode server-bridged provider integration)
