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
The following object is the canonical persisted payload fragment for any event that claims to expose requested/effective Persona, runtime-resolution, workflow-overlay, or provider auth/account identity state:

```json
{
  "requested_mode_overlay": "deep_plan",
  "effective_mode_overlay": "deep_plan",
  "requested_runtime_mode": "plan",
  "effective_runtime_mode": "plan",
  "requested_persona": "rust-engineer",
  "effective_persona": "rust-engineer",
  "persona_selection_source": "auto_surface_resolver",
  "selection_reason": "Auto: Rust repo + code task",
  "persona_override_scope": "none",
  "persona_override_owner_id": null,
  "requested_platform": "gemini",
  "effective_platform": "gemini",
  "requested_model": "google/gemini-2.5-pro",
  "effective_model": "google/gemini-2.5-pro",
  "requested_variant": "powerful",
  "effective_variant": "powerful",
  "requested_auth_mode": "auto",
  "effective_auth_mode": "oauth",
  "requested_account_policy": "project_default",
  "effective_account_id": "acct-gemini-oauth-main",
  "effective_account_label": "Primary Gemini",
  "effective_provider_identity": "user@example.com",
  "effective_project_id": "proj-123",
  "account_switch_reason": null,
  "effective_temperature": null,
  "effective_top_p": null,
  "effective_reasoning_effort": null,
  "effective_talkativeness": "talk_more",
  "applied_persona_controls": [],
  "skipped_persona_controls": []
}
```

Rules:
- `requested_mode_overlay`, `effective_mode_overlay`, `requested_runtime_mode`, and `effective_runtime_mode` are canonical persisted field names for chat/runtime workflow and posture identity
- `requested_persona` and `effective_persona` remain the canonical persisted persona field names across all surfaces
- persisted payloads MUST NOT introduce parallel canonical fields named `requested_persona_id` or `effective_persona_id`
- `requested_auth_mode` and `effective_auth_mode` are the canonical persisted auth-surface fields for provider-using runs

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Models_System.md

Additional rules:
- `deep_plan` MUST survive the overlay fields and MUST NOT disappear from persisted records solely because the runtime posture is planning
- `requested_account_policy` stores the requested routing/control policy while `effective_account_id` identifies the provider account actually used
- `effective_account_label`, `effective_provider_identity`, and `effective_project_id` are optional non-secret disclosure fields for audit/UI correlation only
- `effective_provider_identity` is provider-native identity metadata only and MUST NOT replace the canonical internal `account_id`
- `run.started` and `run.completed` MUST include the full snapshot when the run reaches prompt/runtime assembly and when it completes

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, PolicyRule:no_secrets_in_storage
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
Represents the canonical authentication status for a provider summary or a single provider account visible in Settings / Setup / Health.

**Minimum fields:**
```json
{
  "provider": "gemini",
  "auth_surface": "oauth",
  "account_id": "acct-gemini-oauth-main",
  "account_label": "Primary Gemini",
  "provider_identity": "user@example.com",
  "state": "LoggedIn",
  "credential_state": "present",
  "configuration_state": "ready",
  "availability_state": "eligible",
  "effective_project_id": "proj-123",
  "updated_at": "2026-02-23T00:00:00Z"
}
```

Rules:
- `state` uses the canonical auth lifecycle set (`AuthJobState`): `LoggedOut` | `LoggingIn` | `LoggedIn` | `LoggingOut` | `AuthExpired` | `AuthFailed`.
- `account_id` is the stable internal key.
- `account_label` is the user-facing editable label.
- `provider_identity` is provider-native identity metadata only (email, subject, or provider descriptor) and MUST NOT be treated as the canonical internal key.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

- `credential_state` uses the canonical account-scoped values `missing | present | expired | invalid | revoked`.
- `configuration_state` uses the canonical account-scoped values `ready | needs_configuration | validation_required`.
- `availability_state` uses the canonical account-scoped values `eligible | cooldown | hard_blocked | disabled`.
- Provider-level cards MAY aggregate multiple account records, but aggregated display MUST preserve auth-surface and account distinctions whenever they change routing, quota semantics, or recovery behavior.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/FinalGUISpec.md

- Gemini OAuth and API-key profiles MUST be represented as separate account records under one provider rather than as pseudo-providers.
- Secrets (tokens, API keys, refresh tokens, bearer credentials) MUST NOT be stored in `AuthState` when persisted; secrets live only in the OS credential store.

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002, ContractName:Plans/rewrite-tie-in-memo.md
### 4.2 AuthPolicy
Defines deterministic defaults for auth method selection per provider.

Canonical enum contracts for implementation:
```text
ProviderAuthMethod = OAuthBrowser | OAuthDeviceCode | ApiKey | GoogleCredentials | CliInteractive
RequestedAuthMode = auto | oauth | api_key | device_code | google_credentials | cli_interactive
```

Rules:
- Cursor and Claude Code use `CliInteractive` (CLI-bridged only).
- Codex supports `OAuthBrowser`, `OAuthDeviceCode`, and `ApiKey` for direct-provider auth/calls.
- GitHub Copilot uses `OAuthDeviceCode` for direct-provider auth/calls.
- Gemini uses direct-provider auth/calls with `OAuthBrowser`, `ApiKey`, and `GoogleCredentials` where the provider/runtime capability matrix supports them.
- OpenCode uses server credentials for server access plus provider-native auth managed by OpenCode.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/CLI_Bridged_Providers.md, SchemaID:Spec_Lock.json#locked_decisions.auth_model

- Gemini is one provider with mixed OAuth and API-key account pools.
- Gemini's default `requested_auth_mode` is `auto`, and the provider-default auth-surface preference is OAuth first, then API key, unless project/run policy overrides it.
- Explicit `oauth` requests MUST filter to OAuth-eligible accounts only.
- Explicit `api_key` requests MUST filter to API-key-eligible accounts only.
- There is no silent cross-surface fallback between explicit `oauth` and explicit `api_key` requests.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

- `auto` resolves auth-surface preference before account selection and then chooses an eligible account inside the first viable surface.
- Same-provider accounts are not interchangeable. Policy precedence is: provider default -> account override -> role-by-provider override -> role-by-account override -> run snapshot -> attempt/message resolution.
- Manual `set active` / preferred-account selection is an override/debug control, not the default operating model.
- For GitHub, default interactive auth MUST be OAuth device-code flow.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md
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
AuthSurface = oauth | api_key | google_credentials | device_code | cli_interactive
CredentialState = missing | present | expired | invalid | revoked
ConfigurationState = ready | needs_configuration | validation_required
AvailabilityState = eligible | cooldown | hard_blocked | disabled
```

Rules:
- `InstallableComponent` applies to Setup/Health install controls only.
- `InstallJobState` and `AuthJobState` are real-time UI/backend states and MUST be streamed deterministically.
- `AuthJobState` is the user-facing derived chip. Backend state machines MUST derive it from auth-surface, credential, configuration, and availability state rather than inventing provider-specific ad-hoc enums.
- Setup and Health MUST be able to show both provider summary state and account-scoped state when a provider supports multiple accounts.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md

- `AuthRealm` values MUST be isolated: tokens/state for `github_api` and `copilot_github` are separate and MUST NOT be cross-consumed.
- `credential_state`, `configuration_state`, and `availability_state` are canonical account-scoped dimensions and MUST NOT be collapsed into provider-global booleans when they alter routing, quota, or recovery semantics.
- `needs_configuration` is the canonical user-facing partial-setup status for Gemini OAuth accounts; do not use provider-specific `needs_project` as the canonical persisted/display state name.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/rewrite-tie-in-memo.md
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

Approval and recovery are anchored to runtime blocked episodes rather than to tier-boundary request objects.

### 6.1 Canonical blocked-episode approval anchor
Required runtime-facing fields are:
- `run_id`
- `node_id`
- `blocked_sequence`
- `attempt_id?`
- `blocked_reason_code`
- `allowed_action_ids[]`
- `approval_scope_key`
- `approver_identity?`
- `detail_ref?`

Rules:
- `waiting_approval` is a blocked runtime state, not a separate orchestration ontology.
- `blocked_sequence` is the canonical approval anchor for resume, approve, decline, skip, abort, and retry flows.
- `allowed_action_ids[]` is canonical. `allowed_actions[]` is not canonical.
- `request_id` is compatibility lineage only and MUST NOT be the primary approval target.

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 6.2 Scope and persistence rules
Rules:
- approvals bind to canonical runtime identity first: `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`
- a blocked-episode approval does not imply a broader policy approval unless the `approval_scope_key` says so explicitly
- unresolved blocked episodes survive restart and are rehydrated rather than reminted opportunistically
- a failed approval attempt or failed switch of recovery action remains historically material and must persist in records/history

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md

### 6.3 Compatibility boundary
Older request-centric payloads may continue to carry `request_id` for lineage and migration, but any consumer that mutates runtime state must resolve through the blocked-episode identity model.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md
## 7. UICommand

`UICommand` is the canonical command envelope. Shared navigation and identity-open primitives sit underneath public wrapper commands rather than beside them.

### 7.1 UICommand envelope
Required envelope fields are:
- `command_id`
- `command_kind`
- `args`
- `context?`
- `normalization?`

`command_kind` is closed to:
- `shell_view`
- `navigation_wrapper`
- `domain_action`

`normalization` is closed to:
- `wrapper`
- `deprecated_alias`

Rules:
- deprecated aliases point at `alias_of_command_id`
- stable wrapper commands point at `normalizes_to_contract`
- wrapper commands remain user-facing command IDs; they do not disappear behind a public `cmd.nav.*` family

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/Crosswalk.md

### 7.2 `route_target`
`route_target` is the canonical navigation-and-focus contract.

Required fields:
- `target_kind`
- `project_id`

Allowed focus fields:
- `focused_run_id`
- `thread_id`
- `tab_id`
- `inspector_target`

Exactly one selector is required:
- `subject_id`
- or `object_kind` + `object_id`

`target_kind` is closed to:
- `primary_view`
- `side_panel`
- `bottom_panel`
- `embedded_surface`
- `page_tab`

`subject_id` is closed to:
- `doc:<document_id>`
- `artifact:<artifact_id>`

`object_kind` is closed to:
- `thread`
- `message`
- `wizard`
- `usage_event`
- `run`
- `node`
- `attempt`
- `scheduler_pass`
- `blocked_episode`
- `safe_point`
- `remediation`
- `feature_seam`
- `work_package`
- `lane`
- `worktree`
- `concern`
- `promotion`
- `graph_patch`
- `graph_generation`

`inspector_target` is closed to:
- `summary`
- `evidence`
- `artifacts`
- `history`
- `reviews`
- `usage`
- `lineage`
- `details`

Rules:
- `project_id` is required
- route activation must override remembered shell state when needed to reveal the requested object, scope, and destination surface
- route activation may reuse remembered shell state when that state still reveals the requested object cleanly
- `resume_url` is serialized transport only and decodes to `route_target`; it is not a stronger parallel primitive

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

### 7.3 `OpenSubject`
`OpenSubject` is the canonical identity-native source-open contract.

Required fields:
- `subject_id`
- `open_intent`

`open_intent` is closed to:
- `open_source`
- `open_preview`
- `open_review`

Rules:
- `OpenSubject` resolves canonical identity to the best source realization
- `OpenSubject` may resolve to `OpenFile` or to a transient `generated://<artifact_id>` buffer
- transport details do not belong in the `OpenSubject` contract itself

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md
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

### `scheduler.pass` (minimum addendum fields)
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
- ordered `allowed_action_ids[]`
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
- ordered `allowed_action_ids[]`
- `headless_denied` boolean
- effective permission snapshot identifier

All of the above are canonical contract fields, not UI-only projection conveniences.
## Canonical Runtime Taxonomy and Event Precedence Reconciliation Addendum (2026-03-09)
This section is an exact compatibility mirror of the later canonical runtime contract so readers do not stop at stale transitional enum lists.

### Event-name precedence
| Canonical event | Legacy alias | Rule |
|---|---|---|
| `scheduler.pass` | `run.scheduler_analysis` | `scheduler.pass` is canonical. |
| `node.blocked` | `run.node_blocked` | `node.blocked` is canonical. |
| `node.unblocked` | `run.node_unblocked` | `node.unblocked` is canonical. |
| `remediation.spawned` | `run.remediation_started` | `remediation.spawned` is canonical. |
| `remediation.resolved` | `run.remediation_completed` | `remediation.resolved` is canonical. |

### Canonical enum families
`failure_class`:
- `provider_transient`
- `structured_output_invalid`
- `verification_failed`
- `reviewer_findings`
- `storage_io`
- `graph_integrity`

`blocked_reason_code`:
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
- `validation_blocked`
- `remediation_ceiling_exceeded`

`allowed_action_id`:
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

### Blocking payload rule
Every runtime-facing blocked event or projection MUST expose:
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Executor_Protocol.md
- `blocked_reason_code`
- ordered `allowed_action_ids[]`
- prerequisite metadata needed to bind the recovery command
- `preserved_local_work`
- `requires_safe_point_restore?`
- `failure_class?`
- `detail_ref?`

No section in this file may present an earlier shorter enum set as the canonical value family.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Executor_Protocol.md
## Canonical Runtime Event, Outcome, and Action Contract Reconciliation Addendum (2026-03-09)

This section supersedes packet-era naming and field drift wherever conflicts remain.

### `scheduler.pass` (canonicalized)
Required fields:
- `scheduler_pass_id`
- `run_id`
- `thread_id?`
- `replan_generation`
- `wake_reason`
- `secondary_wake_reasons[]`
- `available_slots`
- `ready_nodes[]`
- `selected_nodes[]` including `selected_at_utc`
- `non_selected[]`
- `newly_ready_nodes[]`
- `capacity_summary`
- `analysis_id?` only as a legacy alias where `analysis_id = scheduler_pass_id`

Each `newly_ready_nodes[]` entry SHOULD include `source_node_id?` and `source_dependency_ref?` when known.

### Safe points and remediation
`safe_point.created` carries `safe_point_id`, `source_attempt_id`, `run_id`, `node_id`, `replan_generation`, `baseline_ref`, and `creation_reason`.

`safe_point.restored` carries `safe_point_id`, `source_attempt_id`, `resulting_attempt_id?`, `restore_sequence`, `restore_outcome`, and `detail_ref?`.

`remediation.spawned` carries `remediation_root_id`, `remediation_generation`, `parent_attempt_id`, `child_attempt_id`, `finding_refs[]`, and `replan_generation`.

`remediation.resolved` carries `remediation_root_id`, `remediation_generation`, `child_attempt_id`, `resolution` (`fixed`, `superseded`, `abandoned`, `replan_required`), and `detail_ref?`.

### Wizard clarification and blocked contracts
`wizard.blocked` MUST carry `wizard_id`, `wizard_step`, `thread_id?`, `blocked_reason_code`, `clarification_round_count`, `report_ref`, `resume_url?`, `decomposition_degraded`, `degradation_reason?`, `replan_generation?`, `attempted_recovery_action_ids[]`, and `ts`.

`requirements.clarification_requested` MUST carry `wizard_id`, `wizard_step`, `thread_id`, `question_ids[]`, `report_ref`, and `state_transition_target` with value `attention_required` or `blocked`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/storage-plan.md


**runtime_artifact.* events:** Payload schemas for runtime_artifact.* events are defined in Plans/storage-plan.md and Plans/Runtime_Artifacts_Panel.md; this document does not define the 19 payloads. For task_id: present in payload when the run has task/subtask granularity; otherwise omit (deterministic rule).
