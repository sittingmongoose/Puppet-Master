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

## Scheduler, Safe-Point, and Remediation Events Addendum (2026-03-08)

Add the following event families to the canonical contract set.

### 1. Scheduler analysis and readiness events

#### `scheduler.pass`

> **Migration note:** `run.scheduler_analysis` is a deprecated legacy alias for this event. New producers MUST emit `scheduler.pass`. Consumers SHOULD accept both during migration.

ContractRef: EventType:scheduler.pass, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `scheduler_pass_id` (canonical identity -- `analysis_id` is a legacy alias)
- `run_id`
- `thread_id`
- `replan_generation`
- `wake_reason`
- `available_slots`
- `ready_nodes[]`
- `selected_nodes[]` with per-node `{ node_id, score_tuple, lane }`
- `non_selected_nodes[]` with per-node `{ node_id, non_selected_reason }`
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `run.node_ready`
Minimum payload:
- `run_id`
- `node_id`
- `ready_since_utc`
- `wake_reason`
- `replan_generation`

#### `node.blocked`

> **Migration note:** `run.node_blocked` is a deprecated legacy alias for this event. New producers MUST emit `node.blocked`.

ContractRef: EventType:node.blocked, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `run_id`
- `node_id`
- `attempt_id?`
- `blocked_reason_code`
- `blocked_sequence`
- `allowed_action_ids[]`
- `preserved_local_work`
- `detail_ref?`
- `failure_class?` (only when the block originated from a classified outcome)
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `node.unblocked`

> **Migration note:** `run.node_unblocked` is a deprecated legacy alias for this event. New producers MUST emit `node.unblocked`.

Minimum payload:
- `run_id`
- `node_id`
- `attempt_id?`
- `blocked_sequence`
- `resolution` (the action that resolved the block)
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 2. Retry/backoff events

#### `run.node_backoff_started`
Minimum payload:
- `run_id`
- `node_id`
- `attempt_id`
- `failure_class`
- `backoff_until_utc`
- `retry_count`
- `ts`

#### `run.node_backoff_expired`
Minimum payload:
- `run_id`
- `node_id`
- `attempt_id`
- `failure_class`
- `ts`

#### `run.node_retry_scheduled`
Minimum payload:
- `run_id`
- `node_id`
- `prior_attempt_id`
- `retry_count`
- `failure_class`
- `safe_point_id?`
- `ts`

### 3. Safe-point events

#### `safe_point.created`
Minimum payload:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `worktree_path?`
- `baseline_ref`
- `replan_generation`
- `ts`

#### `safe_point.restored`
Minimum payload:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `restore_outcome`
- `ts`

#### `restore_outcome` enum

Canonical values for the `restore_outcome` field in `safe_point.restored` events:

| Value | Meaning |
|-------|---------|  
| `restored_clean` | All files and state restored to safe-point snapshot without conflicts. |
| `restored_with_conflicts` | Restore completed but one or more files had merge conflicts requiring resolution. |
| `restore_failed` | Restore could not be applied; original state preserved. |
| `restore_skipped` | Restore was requested but determined unnecessary (state already matches safe-point). |

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 4. Remediation lineage events

#### `remediation.spawned`

> **Migration note:** `run.remediation_started` is a deprecated legacy alias for this event. New producers MUST emit `remediation.spawned`.

ContractRef: EventType:remediation.spawned, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `run_id`
- `node_id`
- `remediation_root_id`
- `child_attempt_id`
- `remediation_generation`
- `parent_failure_class`
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `remediation.resolved`

> **Migration note:** `run.remediation_completed` is a deprecated legacy alias for this event. New producers MUST emit `remediation.resolved`.

Minimum payload:
- `run_id`
- `node_id`
- `remediation_root_id`
- `child_attempt_id`
- `resolution` (`success` | `failed` | `ceiling_exceeded`)
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 5. Degradation / integrity events

#### `plan.decomposition_degraded`
Minimum payload:
- `project_id`
- `source_stage`
- `reason_code`
- `original_shape`
- `degraded_shape`
- `evidence_ref`
- `ts`

#### `run.graph_integrity_failed`
Minimum payload:
- `run_id`
- `reason_code`
- `detail_ref`
- `replan_generation`
- `ts`

### 6. Wizard blocked escalation events

#### `wizard.blocked`
Minimum payload:
- `wizard_id`
- `thread_id?`
- `round_count`
- `report_ref`
- `resume_url`
- `ts`

#### `wizard.unblocked`
Minimum payload:
- `wizard_id`
- `thread_id?`
- `resolution_source`
- `ts`

### 7. Contract rules

- Events above are canonical ledger events, not debug-only instrumentation.
- All UI and storage projections added by this packet derive from these events or fields normatively referenced by them.
- `safe_point.*` events are runtime-internal recovery records and are distinct from user-facing `restore_point.*` / `rollback.*` contracts.
- `plan.decomposition_degraded` is allowed only before canonical graph lock.
## Runtime Scheduler / Attempt Lineage Contract Addendum (2026-03-09)

Add the following canonical runtime event families and required fields.

### `scheduler.pass`
Required fields:
- `run_id`
- `thread_id`
- `replan_generation`
- `wake_reason`
- `available_slots`
- `ready_nodes[]` with score breakdown terms
- `selected_nodes[]`
- `non_selected[]` with `non_selected_reason`
- capacity summary

### `attempt.started`
Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- `scheduler_lane`
- effective requested/effective model snapshot
- effective permission snapshot identifier
- `safe_point_id` when present
- `remediation_root_id` / `remediation_parent_attempt_id` when present
- `replan_generation`

### `attempt.completed`
Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- terminal state
- `failure_class` or success marker
- retry count and backoff metadata
- verification / reviewer result references when relevant
- resolved lineage identifiers

### `node.blocked`
Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id` if an attempt existed
- `blocked_reason_code`
- `failure_class` when the blocked state originated from a classified outcome
- `allowed_actions[]`
- `auth_realm`, `missing_scopes[]`, or side-effect metadata when relevant
- whether local work was preserved

### `safe_point.created` and `safe_point.restored`
Required fields:
- `safe_point_id`
- `run_id`, `node_id`, `attempt_id`
- workspace / worktree reference
- `replan_generation`
- reason for creation or restore
- restore result

### `remediation.spawned` and `remediation.resolved`
Required fields:
- `remediation_root_id`
- `remediation_parent_attempt_id`
- child `attempt_id`
- finding / issue references
- `remediation_generation`
- resolution enum (`fixed`, `superseded`, `abandoned`, `replan_required`)

### `tool.denied` alignment
`tool.denied` MUST carry canonical runtime mapping fields when the denial affects scheduler state:
ContractRef: EventType:tool.denied, ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md
- `blocked_reason_code`
- `failure_class`
- `allowed_actions[]`
- `headless_denied` boolean
- effective permission snapshot identifier

All of the above are canonical contract fields, not UI-only projection conveniences.
## Canonical Runtime Taxonomy and Event Precedence Reconciliation Addendum (2026-03-09)

This section is normative and supersedes earlier runtime packet wording wherever conflicting.

### Event-name precedence
| Canonical event | Legacy alias | Rule |
|---|---|---|
| `scheduler.pass` | `run.scheduler_analysis` | `scheduler.pass` is canonical. Legacy aliases MAY be emitted only for compatibility and MUST carry identical identity and meaning. |
| `node.blocked` | `run.node_blocked` | `node.blocked` is canonical. |
| `node.unblocked` | `run.node_unblocked` | `node.unblocked` is canonical. |
| `remediation.spawned` | `run.remediation_started` | `remediation.spawned` is canonical. |
| `remediation.resolved` | `run.remediation_completed` | `remediation.resolved` is canonical. |
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### Canonical enum families
#### `failure_class`
Use `failure_class` only for classified attempt outcomes that drive retry, remediation, escalation, or terminal failure policy.

Allowed values:
- `provider_transient`
- `structured_output_invalid`
- `verification_failed`
- `reviewer_findings`
- `storage_io`
- `graph_integrity`

#### `blocked_reason_code`
Use `blocked_reason_code` when execution cannot continue automatically until a prerequisite changes or a user/operator action occurs.

Allowed values:
- `permission_denied`
- `user_declined`
- `headless_ask_denied`
- `filesafe_blocked`
- `external_side_effect_blocked`
- `auth_expired`
- `replan_required`
- `waiting_approval`
- `clarification_blocked`
- `worktree_conflict`
- `dirty_worktree`
- `plugin_hook_blocked`

Rules:
- pure blocked outcomes MAY set `failure_class = null`
- blocked outcomes that originate from a classified failed attempt MAY retain both `failure_class` and `blocked_reason_code`
- blocked outcomes are not retryable by default; retryability comes from the shared matrix plus current prerequisites

Additional canonical values not yet in the enum above:

| Value | Meaning |
|-------|---------|  
| `validation_blocked` | Tool output failed post-execution validation (schema check, safety scan, or constraint check). Recovery: fix validation rule or tool output. |
| `remediation_ceiling_exceeded` | Remediation generation count has reached the configured ceiling. No further automatic remediation is permitted. Recovery: replan, manual fix, or abort node. |

#### `plugin_hook_blocked` definition

`plugin_hook_blocked` is triggered when a plugin hook returns `Block` for a hook that affects execution flow.

**Triggering hooks** (execution-affecting):
- `pre_tool_invoke`
- `pre_attempt_start`
- `pre_node_dispatch`

**Non-triggering hooks** (observation-only -- cannot block):
- `post_tool_invoke`
- `post_attempt_complete`
- All session/message/compaction/shell hooks

**Required metadata in blocked payload:**
- `plugin_id` -- which plugin issued the block
- `hook_name` -- which hook returned Block
- `block_reason` -- freetext reason string from the plugin

**Valid `allowed_action_ids[]` for plugin blocks:**
- `approve` -- override block for this attempt only
- `decline` -- accept block, node enters blocked state
- `retry_now` -- re-invoke the hook (plugin may have been updated)
- `skip_node` -- skip node if graph allows

Plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Executor_Protocol.md

#### `wake_reason`
Allowed values:
- `node_completed`
- `verification_completed`
- `approval_resolved`
- `clarification_resolved`
- `permission_changed`
- `auth_recovered`
- `backoff_expired`
- `remediation_completed`
- `restore_completed`
- `replan_applied`
- `capacity_changed`
- `manual_wakeup`
- `watchdog_recheck`

#### `non_selected_reason`
Allowed values:
- `lower_score`
- `lane_reservation`
- `capacity_deferred`
- `worktree_conflict`
- `already_running_in_pool`
- `generation_stale`
- `blocked_during_pass`

#### `allowed_action_id`
Allowed values:
- `approve`
- `decline`
- `retry_now`
- `resume_after_prerequisite`
- `restore_safe_point_then_retry`
- `start_fresh_attempt`
- `replan`
- `skip_node`
- `abort_run`
- `open_details`

#### `attempt_terminal_state`

Canonical values:

| Value | Meaning |
|-------|---------|  
| `completed_success` | Attempt finished and passed verification. |
| `completed_failed` | Attempt finished but failed verification or was rejected. |
| `interrupted_by_restart` | Attempt was in progress when the process restarted; classified on recovery. |
| `stale_historical` | Attempt belongs to a prior replan generation and has been superseded by newer attempts. |

An attempt record MUST transition to exactly one of these values and MUST NOT transition away from a terminal state.

`stale_historical` is applied when: (1) `replan_generation` increments and the attempt belongs to a prior generation, OR (2) the run session is re-opened after dormancy and the attempt was in a non-terminal state with no safe point to resume from.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `detail_ref` format

`detail_ref` is a structured string with format `{type}:{id}` where type is one of:

| Type | Meaning | Example |
|------|---------|---------|  
| `evidence` | Reference to an evidence record | `evidence:ev-abc123` |
| `artifact` | Reference to a build/output artifact | `artifact:art-def456` |
| `log_range` | Reference to a segment log range | `log_range:seg-789:100-200` |
| `storage_key` | Reference to a redb storage key | `storage_key:attempt.run1.node2.att3` |

The type prefix enables consumers to resolve the reference to the correct storage backend.

ContractRef: ContractName:Plans/storage-plan.md

### Identity rules
- `scheduler_pass_id` is the canonical identity for queue-analysis passes
- `analysis_id` is a legacy alias; when present it MUST equal `scheduler_pass_id`
- every dispatch attempt receives a new `attempt_id`
- retries, prerequisite-resumed work, and safe-point-restored reruns create new `attempt_id` values rather than mutating prior attempts in place
- previous attempt records remain immutable history
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Graph_View.md

### Required canonical events
#### `run.graph_canonical_locked`
Required fields:
- `run_id`
- `replan_generation`
- `ts`

#### `node.prerequisite_resolved`
Required fields:
- `run_id`
- `node_id`
- `attempt_id?`
- `resolution_kind` (`approval`, `clarification`, `permission`, `auth`, `replan`, `worktree`, `other`)
- `prior_blocked_reason_code`
- `ts`

### Blocking payload rule
Every canonical blocked event/path MUST expose:
- `blocked_reason_code`
- `allowed_action_ids[]`
- prerequisite metadata needed to bind domain-specific commands (for example `auth_realm`, `missing_scopes[]`, guard/rule identifiers, report refs)
- `preserved_local_work`
- `failure_class?`
- `detail_ref?`
ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md
## Canonical Runtime Event, Outcome, and Action Contract Reconciliation Addendum (2026-03-09)

### Canonical runtime names
New runtime producers MUST emit canonical names. Legacy aliases MAY be accepted only at compatibility boundaries.
ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

| Canonical event | Legacy alias | Canonical identity |
|---|---|---|
| `scheduler.pass` | `run.scheduler_analysis` | `scheduler_pass_id` |
| `node.blocked` | `run.node_blocked` | `run_id`, `node_id`, `attempt_id?`, `blocked_sequence` |
| `node.unblocked` | `run.node_unblocked` | `run_id`, `node_id`, `attempt_id?`, `blocked_sequence` |
| `remediation.spawned` | `run.remediation_started` | `remediation_root_id`, `child_attempt_id` |
| `remediation.resolved` | `run.remediation_completed` | `remediation_root_id`, `child_attempt_id` |

### Canonical outcome taxonomy
`failure_class` is for classified attempt outcomes only:
- `provider_transient`
- `structured_output_invalid`
- `verification_failed`
- `reviewer_findings`
- `storage_io`
- `graph_integrity`

`blocked_reason_code` is for unresolved prerequisites or intentionally prevented work:
- `permission_denied`
- `user_declined`
- `headless_ask_denied`
- `filesafe_blocked`
- `external_side_effect_blocked`
- `auth_expired`
- `replan_required`
- `waiting_approval`
- `clarification_blocked`
- `worktree_conflict`
- `dirty_worktree`
- `plugin_hook_blocked`

### Canonical blocked payload
Every runtime-facing blocked path MUST expose:
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/UI_Command_Catalog.md
- `blocked_reason_code`
- `allowed_action_ids[]`
- `preserved_local_work`
- `detail_ref?`
- prerequisite metadata needed to bind the specific recovery action
- `failure_class?` only when the blocked state originated from a classified attempt outcome

`recovery_options[]` and `allowed_actions[]` are deprecated shared-surface names and MUST NOT be introduced as new canonical runtime fields.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

### Canonical scheduler pass
`scheduler.pass` MUST carry:
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md
- `scheduler_pass_id`
- `run_id`
- `thread_id`
- `replan_generation`
- `wake_reason`
- `available_slots`
- `ready_nodes[]` with full score breakdown terms
- `selected_nodes[]`
- `non_selected[]` with canonical `non_selected_reason`
- capacity summary
- `analysis_id?` only as a legacy alias where `analysis_id = scheduler_pass_id`

### Canonical attempt contract
`attempt.started` MUST carry:
ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- `scheduler_pass_id`
- requested/effective model snapshot identifiers
- requested/effective permission snapshot identifiers
- `replan_generation`
- `mutation_capable`
- `safe_point_id?`
- remediation lineage identifiers when present

`attempt.completed` MUST carry:
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Project_Output_Artifacts.md
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- terminal state enum
- `failure_class?`
- all counter fields relevant to the canonical matrix
- verification/reviewer result refs when applicable
- resulting lineage/resolution refs when applicable

### Canonical prerequisite resolution order
When a prerequisite clears for previously blocked work:
1. emit `node.prerequisite_resolved`
2. update blocked projections
3. emit `node.unblocked` if a blocked episode ended
4. emit `scheduler.pass` for the resulting wake cycle

### Safe-point contract
`safe_point.created` MUST carry:
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileManager.md
- `safe_point_id`
- `source_attempt_id`
- `run_id`, `node_id`
- `replan_generation`
- baseline refs
- creation reason

`safe_point.restored` MUST carry:
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Project_Output_Artifacts.md
- `safe_point_id`
- `source_attempt_id`
- `resulting_attempt_id?`
- restore outcome enum
- restore detail ref when applicable

### Remediation contract
`remediation.spawned` MUST carry:
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Project_Output_Artifacts.md
- `remediation_root_id`
- `remediation_generation`
- `parent_attempt_id`
- `child_attempt_id`
- finding / issue refs
- active `replan_generation`

`remediation.resolved` MUST carry:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Project_Output_Artifacts.md
- `remediation_root_id`
- `remediation_generation`
- `child_attempt_id`
- resolution enum (`fixed`, `superseded`, `abandoned`, `replan_required`)
- resolution detail ref

### Canonical wake reasons
Required values:
- `run_started`
- `startup_recovered`
- `node_completed`
- `verification_completed`
- `approval_resolved`
- `clarification_resolved`
- `permission_changed`
- `auth_recovered`
- `backoff_expired`
- `remediation_completed`
- `restore_completed`
- `replan_applied`
- `capacity_changed`
- `manual_wakeup`
- `watchdog_recheck`
