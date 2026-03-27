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

### 1.1 Assistant worktree seglog events

Eleven events for assistant thread-level worktree binding, merge, PR, and pre-merge testing lifecycle.

| Event type | Fields | Seglog stream |
|---|---|---|
| `chat.thread_worktree_bound` | `thread_id`, `worktree_id`, `branch_name`, `worktree_path`, `binding_origin` (`manual`\|`auto_create`) | `chat` |
| `chat.thread_worktree_unbound` | `thread_id`, `worktree_id`, `reason` (`user_unbind`\|`user_remove`\|`thread_delete`\|`path_missing`) | `chat` |
| `chat.thread_worktree_renamed` | `thread_id`, `worktree_id`, `old_branch_name`, `new_branch_name` | `chat` |
| `chat.thread_worktree_create_failed` | `thread_id`, `error`, `binding_origin` | `chat` |
| `chat.thread_worktree_merged` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy` (`squash`\|`merge`\|`rebase`), `result_commit_sha` | `chat` |
| `chat.thread_worktree_merge_failed` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `error`, `has_conflicts` (bool) | `chat` |
| `chat.thread_worktree_pr_created` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `pr_url`, `pr_number` | `chat` |
| `chat.thread_worktree_pr_failed` | `thread_id`, `worktree_id`, `branch_name`, `error`, `phase` (`push`\|`api`) | `chat` |
| `chat.thread_worktree_pre_merge_test_started` | `thread_id`, `worktree_id`, `command`, `test_target` (`merged_result`\|`branch_only`\|`both`), `strategy` | `chat` |
| `chat.thread_worktree_pre_merge_test_passed` | `thread_id`, `worktree_id`, `command`, `duration_ms`, `strategy` | `chat` |
| `chat.thread_worktree_pre_merge_test_failed` | `thread_id`, `worktree_id`, `command`, `exit_code`, `duration_ms`, `strategy`, `user_override` (bool) | `chat` |

All events are append-only. Naming uses underscore-separated `chat.thread_worktree_*` to match existing `chat.thread_created` convention. All events include standard seglog envelope fields (event_id, timestamp_utc, etc.) per the base event contract.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-chat-design.md


<a id="1.1"></a>
<a id="EventRecord"></a>
### 1.1 EventRecord -- canonical persisted envelope (schema: `pm.event.v0`)
The canonical persisted runtime snapshot keeps the historical base field names stable while allowing additive disclosure fields for runtime family, runtime platform, billing/entity attribution, and server-profile routing.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md

```json
{
  "requested_platform": "copilot",
  "effective_platform": "copilot",
  "provider_family_id": "github_copilot",
  "requested_runtime_platform_id": "copilot_direct",
  "effective_runtime_platform_id": "copilot_direct",
  "requested_model": "openai/gpt-5-codex",
  "effective_model": "openai/gpt-5-codex",
  "requested_model_provider_id": "openai",
  "effective_model_provider_id": "openai",
  "requested_auth_mode": "oauth",
  "effective_auth_mode": "oauth",
  "effective_account_id": "acct-copilot-work",
  "effective_provider_identity": "user@example.com",
  "requested_billing_entity_id": "org-acme",
  "effective_billing_entity_id": "org-acme",
  "effective_billing_entity_label": "Acme Engineering",
  "effective_entitlement_class": "org_subscription",
  "connection_profile_id": null,
  "effective_project_id": null,
  "account_switch_reason": null,
  "requested_reasoning_effort": "medium",
  "effective_reasoning_effort": "medium"
}
```

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Provider_OpenCode.md

Rules:
- `requested_platform` and `effective_platform` remain the canonical persisted provider-entry fields.
- `provider_family_id`, `requested_runtime_platform_id`, `effective_runtime_platform_id`, `requested_model_provider_id`, and `effective_model_provider_id` are additive disclosure fields. They MUST NOT replace the canonical base field names.
- `effective_account_id` identifies the effective account record when the runtime subject is account-backed.
- `connection_profile_id` identifies the effective server profile when the runtime subject is server-bridged.
- `requested_billing_entity_id`, `effective_billing_entity_id`, `effective_billing_entity_label`, and `effective_entitlement_class` are optional additive fields used only when the provider's quota or policy semantics depend on a billing/entity bucket distinct from the auth identity.
- `effective_provider_identity` is provider-native descriptive metadata only and MUST NOT be treated as the stable internal account key.
- `selectable_unit_id` is diagnostic/runtime-debug data only. It MUST NOT be introduced as a parallel canonical base field on persisted EventRecord payloads.
- secrets, bearer tokens, API keys, refresh tokens, and raw credential payloads MUST NOT appear in EventRecord payloads.

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md#INV-002
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

### 3.5 Debug investigation events

Debug investigations use persisted `EventRecord` envelopes with the following stable `type` values.

| Event type | Minimum payload |
|---|---|
| `debug.investigation.started` | `investigation_id`, `project_id`, `thread_id?`, `run_id?`, `initiator_surface`, `target_kind`, bounded `target_locator_summary`, `requested_mode_overlay`, `effective_mode_overlay`, `runtime_mode` |
| `debug.investigation.state_changed` | `investigation_id`, `previous_phase?`, `phase`, `state`, `attention_reason_code?`, `blocked_reason_code?`, `verification_strength?` |
| `debug.investigation.target_bound` | `investigation_id`, `target_kind`, `target_bindings`, `binding_state` |
| `debug.investigation.context_item_added` | `investigation_id`, `item_id`, `item_kind`, `source_surface`, `state`, bounded `summary`, `artifact_ref?`, `redaction_state` |
| `debug.investigation.context_item_state_changed` | `investigation_id`, `item_id`, `previous_state`, `state`, `reason_code?` |
| `debug.investigation.instrumentation_state_changed` | `investigation_id`, `instrumentation_id`, `scope_kind`, `state`, `rollback_state`, `detail_ref?` |
| `debug.investigation.verification_recorded` | `investigation_id`, `verification_strength`, bounded `verification_summary`, `artifact_refs?` |
| `debug.investigation.exported` | `investigation_id`, `bundle_id`, `schema_id`, `item_count`, `artifact_count`, `redaction_profile` |
| `debug.investigation.imported` | `investigation_id`, `bundle_id`, `source_kind`, `schema_id`, `imported_target_kind` |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md

Event rules:
- raw secrets, raw log dumps, raw trace blobs, and raw binary artifact bytes MUST NOT be duplicated inside these payloads
- raw material is referenced through artifact or blob refs owned by the appropriate artifact system
- bounded summaries must preserve redaction and omission state so downstream readers can tell what was intentionally trimmed or withheld

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md

---

## 4. Auth contracts

<a id="AuthState"></a>
### 4.1 AuthState
AuthState is the canonical persisted and streamed view for provider account rows and server-profile rows shown in Setup, Health, Agent-Config, and Usage inspectors.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

```json
{
  "provider": "opencode",
  "subject_kind": "server_profile",
  "account_id": null,
  "connection_profile_id": "opencode-main",
  "auth_realm": null,
  "auth_surface": null,
  "provider_identity": "http://127.0.0.1:4096",
  "selected_billing_entity_id": null,
  "auth_job_state": "LoggedIn",
  "readiness_state": "Ready",
  "credential_state": "present",
  "configuration_state": "ready",
  "availability_state": "eligible",
  "updated_at": "2026-03-23T00:00:00Z"
}
```

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md

Rules:
- `subject_kind` is `account` for direct and CLI-backed account rows and `server_profile` for server-bridged rows such as OpenCode.
- `auth_job_state` is the canonical authentication chip state and remains distinct from readiness.
- `readiness_state` is the canonical execution-readiness state and MUST support at least `NeedsSetup`, `Validating`, `Ready`, `Degraded`, and `ExternalNotManaged`.
- `LoggedIn` is not the same as `Ready`. Billing-entity selection, entitlement validation, trust checks, project/location configuration, or server discovery may keep the row out of `Ready` after login succeeds.
- `selected_billing_entity_id` is optional and applies only where the effective quota bucket is not implied by the auth identity alone.
- provider-level summary cards MAY aggregate multiple AuthState rows, but the underlying row distinctions MUST remain visible whenever they affect routing, quota semantics, or recovery behavior.
- GitHub auth used for GitHub API operations and GitHub auth used for GitHub Copilot provider execution remain isolated auth realms.
- attached external OpenCode servers may surface `readiness_state = ExternalNotManaged`; PM may reflect their state but MUST NOT overstate configuration ownership.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/CLI_Bridged_Providers.md
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
Canonical enum families for setup, health, and readiness:

```text
InstallableComponent = CursorAgent | ClaudeCodeCli | GeminiCli | Playwright | Nanobanana | OpenCodeServer
InstallJobState = NotInstalled | Installing | Installed | Uninstalling | Failed
AuthJobState = LoggedOut | LoggingIn | LoggedIn | LoggingOut | AuthExpired | AuthFailed
ProviderReadinessState = NeedsSetup | Validating | Ready | Degraded | ExternalNotManaged
AuthRealm = github_api | copilot_github
AuthSurface = oauth | api_key | chatgpt | google_adc | service_account_json | vertex_api_key | cli_interactive | console_api | sso
CredentialState = missing | present | expired | invalid | revoked
ConfigurationState = ready | needs_configuration | validation_required
AvailabilityState = eligible | cooldown | hard_blocked | disabled
UsagePressureState = nominal | approaching_threshold | threshold_reached | exhausted | unknown
```

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md

Lifecycle rules:
- Setup and Health MUST expose both `AuthJobState` and `ProviderReadinessState` when a provider can be authenticated but still blocked on configuration, billing/entity selection, trust, discovery, or validation.
- `CursorAgent` is the canonical installable/runtime target for Cursor CLI integration.
- `Nanobanana` is an installable helper for Gemini CLI media paths only when media is enabled.
- `AuthSurface = chatgpt` is the canonical user-facing direct-login family for Codex plan-backed usage.
- `google_adc`, `service_account_json`, and `vertex_api_key` are separate validation branches for Gemini CLI Vertex/Google Cloud setups and MUST NOT be collapsed into a single unlabeled "Google credentials" setup path in user-facing flows.
- `UsagePressureState` is provider-agnostic and maps authoritative counters, authoritative blocks, monthly-plan exhaustion, or weaker inferred pressure into one normalized scheduler vocabulary.
- provider-reported cooldown windows remain facts; user actions such as `Temporary Pause`, `Resume Now`, and `Mark Needs Recheck` are PM-imposed overlays and MUST NOT overwrite the provider-reported cooldown metadata.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md
## 5. Context management (instruction scoping + attempt journaling + parent summary + `AGENTS.md` enforcement)

This section defines cross-cutting context assembly and enforcement behaviors for the finished Puppet Master product.

<a id="InstructionBundleAssembly"></a>
### 5.1 InstructionBundleAssembly
InstructionBundleAssembly deterministically composes shared instructions, provider-native advanced instructions, PM-native skills, and PM-owned tool/MCP context before the Work Bundle and Memory Bundle are attached.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md

Assembly order:
1. run-envelope and surface policy controls
2. shared instruction panes (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and Cursor Rules)
3. provider-native advanced instruction surfaces when the active provider has them enabled
4. PM-native skill bundle and skill manifest
5. PM-owned MCP/tool availability context
6. Work Bundle
7. Memory Bundle

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/MiscPlan.md, ContractName:Plans/OpenCode_Deep_Extraction.md

Rules:
- PM-native skills are the canonical runtime path. Provider-native skill formats are discovery/import/export/projection compatibility layers only.
- shared instruction panes remain the cross-provider baseline; GitHub Copilot advanced surfaces (`.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, `.github/agents/*.agent.md`) are additive provider-native advanced panes, not replacements for the shared panes.
- Cursor Rules project canon is `.cursor/rules/*.mdc`; `.cursorrules` remains legacy compatibility only.
- required and optional skill dependencies are validated from `SKILL.md` frontmatter via `required_tool_refs` and `optional_tool_refs` before prompt assembly. Missing required tool refs degrade skill readiness before the run starts.
- PM-owned MCP availability is resolved before bundle emission. CLI-facing MCP configs are derived artifacts generated from PM canon and MUST NOT become the canonical instruction source.
- projected or provider-native instruction files under PM control MUST carry drift state; PM must not silently overwrite a provider-modified target on the next refresh.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md
### 5.1A InvestigationContextAttachment

`InvestigationContextAttachment` is the structured prompt-facing representation of active Debug investigation state.

Required top-level fields are:
- `investigation_id`
- `debug_target_kind`
- bounded `primary_target_summary`
- `current_phase`
- `state`
- `verification_strength?`
- `attention_reason_code?`
- `blocked_reason_code?`
- bounded `items[]`

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md

Required item fields are:
- `item_id`
- `item_kind`
- `state`
- bounded `summary`
- `artifact_refs[]?`
- `redaction_state`
- `captured_at_utc`

Serialization rules:
- only items in `active` or `redacted` state may be serialized as successful prompt context
- `revoked`, `blocked`, `expired`, and `omitted` items remain visible for audit but are not serialized as successful prompt attachments
- item order is deterministic and budget-aware; raw artifacts stay outside the instruction bundle

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md

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

### 7.1 Assistant worktree command registrations

Six UICommand registrations for assistant worktree operations. All require `activeThreadExists && projectIsGitRepo && !projectIsRemoteNonSSH`.

| Command ID | Label | Icon | Category | Extra when clause |
|---|---|---|---|---|
| `cmd.chat.worktree.create` | Create Worktree | `worktree-add` | chat | `!activeThreadHasWorktree` |
| `cmd.chat.worktree.remove` | Remove Worktree | `worktree-remove` | chat | `activeThreadHasWorktree` |
| `cmd.chat.worktree.bind_existing` | Bind Existing Worktree | `worktree-link` | chat | `!activeThreadHasWorktree` |
| `cmd.chat.worktree.open_files` | Open Worktree Files | `folder-opened` | chat | `activeThreadHasWorktree` |
| `cmd.chat.worktree.merge` | Merge Worktree | `git-merge` | chat | `activeThreadHasWorktree` |
| `cmd.chat.worktree.create_pr` | Create PR | `git-pull-request-create` | chat | `activeThreadHasWorktree && projectHasGitHubRemote` |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/assistant-chat-design.md

`UICommand` is the canonical command envelope. Shared navigation and identity-open primitives sit underneath public wrapper commands rather than beside them.

### 7.2 UICommand envelope
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
- shell-facing commands may carry terminal-scoped identity args, but those identities still normalize through the canonical route and persistence model

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/Crosswalk.md

### 7.3 `route_target`
`route_target` is the canonical navigation-and-focus contract.

Required fields:
- `target_kind`
- `project_id`

Allowed focus fields:
- `focused_run_id`
- `thread_id`
- `tab_id`
- `browser_session_id`
- `terminal_section_id`
- `terminal_tab_id`
- `terminal_pane_id`
- `terminal_session_id`
- `dev_session_id`
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
- `detached_window`

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
- `browser_session`
- `terminal_section`
- `terminal_tab`
- `terminal_pane`
- `terminal_session`
- `dev_session`

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
- terminal routes prefer exact same-session reveal when `terminal_session_id` is supplied and still resolvable
- historical terminal routes may reveal a historical pane or receipt view, but they MUST NOT synthesize live PTY continuity
- `resume_url` is serialized transport only and decodes to `route_target`; it is not a stronger parallel primitive

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

### 7.4 `OpenSubject`
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
- terminal, dev-session, and browser-session reveals normalize through `route_target` rather than overloading `OpenSubject`

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

The canonical runtime event contract extends to child runs, crew coordination, and effective-context shaping. These contracts are part of the same runtime event and action family as parent execution. They are not an optional overlay and they do not define a separate event grammar.

### Child-run lifecycle and projection

PM child runs are canonical runtime entities with stable identity, lineage, and lifecycle. Command-launched subtasks, orchestrated child runs, delegated plan-mode research, and crew members all project into this same model. Disposable-by-default child lifecycle is the default product posture; long-lived or reopened child identity is the exception path.

Canonical child lifecycle states are: `queued`, `running`, `awaiting_parent`, `blocked`, `complete`, `failed`, `cancelled`. `superseded` remains a terminal reason used when replacement occurred, even if the user-facing terminal state is still presented as `cancelled` or `complete` in some consumers.
ContractRef: Canonical child lifecycle states MUST be preserved across runtime storage, event projection, chat projection, and recovery, and consumers MUST NOT invent incompatible parallel enums. [Source: Tools.md#event-model; storage-plan.md#canonical-child-run-records-and-batch-structure]

Child-to-parent signals are canonical runtime events, not ad hoc UI messages. At minimum the contract family includes: `progress`, `result`, `blocked`, `clarification_needed`, `context_expansion_requested`, `user_input_requested`, `failed`, `cancelled`. Parent orchestration may summarize, consolidate, or route these signals, but canonical event identity must remain intact.
ContractRef: Child-to-parent escalation and progress signals MUST remain canonical runtime events even when parent chat or crew UI projects them into higher-level summaries. [Source: Tools.md#event-model; assistant-chat-design.md#14-subagents--crew]

Chat-facing projection events may normalize child lifecycle into UI-specific projection envelopes, but they MUST preserve the underlying canonical child identity fields. Required fields remain `child_run_id`, `parent_run_id`, `thread_id`, timestamp, attempt identity when relevant, and requested/effective persona/runtime descriptors when the event semantics depend on them.
ContractRef: ContractName: child_projection_identity. Any projection event that feeds chat, cards, groups, or batch summaries MUST preserve canonical child identity fields and MUST NOT demote child runs into anonymous status text. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#14-subagents--crew]

### Retry, reroute, replacement, and resume

`retry`, `reroute`, `replacement`, and `resume` are distinct runtime concepts and must remain distinct in contracts, storage, and event history.

- `resume`: continue the same paused or interrupted child without semantically resetting the task.
- `retry`: a new attempt in the same child lineage after failure, blockage, or interruption.
- `reroute`: same logical child task, different effective runtime surface or capability path.
- `replacement`: a new child because the old role, task shape, or specialization was wrong.

ContractRef: Runtime and storage contracts MUST preserve the semantic distinction between resume, retry, reroute, and replacement; projections MAY summarize them but MUST NOT collapse them into one generic retry/restart bucket. [Source: Tools.md#retry-reroute-replacement-and-cancel; storage-plan.md#canonical-child-run-records-and-batch-structure]

Cancelled and superseded children are terminal by default. Resumption is primarily for in-flight interrupted or waiting children, not for re-opening completed disposable helpers. Crew mode may justify narrower persistence or re-entry behavior, but only as an explicit mode-level exception.
ContractRef: Disposable-by-default child lifecycle is canonical; resume/reopen behavior MUST be treated as an exception path, not the baseline continuity model. [Source: assistant-memory-subsystem.md#capability-boundary-assistant-only; assistant-chat-design.md#15-plan-mode--crew-mode]

### Crew-board coordination contracts

Crew coordination uses an explicit crew board. Child-to-child communication in crew mode occurs through board messages or other explicit crew-scoped coordination records, not hidden direct peer channels. Crew board messages are task-scoped, attributable, timestamped, and persisted as part of shared crew coordination state.
ContractRef: Crew-board coordination MUST remain attributable, inspectable, and task-scoped; hidden direct peer messaging is not a canonical runtime channel. [Source: assistant-chat-design.md#14-subagents--crew; storage-plan.md#canonical-child-run-records-and-batch-structure]

Crew members do not gain new authority through board traffic. Permissions, tools, skills, plugins, MCP access, and provider restrictions remain subject to the same requested/effective capability rules as any other child run.
ContractRef: Crew coordination messages MUST NOT widen authority, permissions, or capability availability beyond the child's effective runtime envelope. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; Skills_System.md#child-capability-subset-clarification]

### Dynamic context shrinking and effective-context projection

Dynamic context shrinking is a canonical effective-context mechanism distinct from compaction, retrieval injection, rotation, and Assistant memory. It operates during ordinary tool-driven work and may replace stale effective-context blocks with shorter summaries while preserving canonical source state and rehydration references.
ContractRef: Dynamic context shrinking MUST preserve canonical source state and MUST operate on effective context only, not rewrite source-of-truth history. [Source: Prompt_Pipeline.md#dynamic-context-shrinking; storage-plan.md#canonical-child-run-records-and-batch-structure]

The default automatic shrinking scope is tool results. Retrieved-context blocks and plan/report blocks remain user-configurable optional categories. Shrinking uses conservative automatic triggers based on staleness and context pressure, with current working set items protected from automatic shrinking.
ContractRef: Automatic shrinking MUST respect protected current-working-set items and MUST NOT rewrite static system/provider/persona/tool-definition content. [Source: Prompt_Pipeline.md#dynamic-context-shrinking]

Runtime projection may emit `subagent.context_shrunk` and `subagent.context_rehydrated` events where effective-context state changes need to be inspectable or replayable. These events supplement, but do not replace, canonical child history and source references.
ContractRef: Context-shrinking events MUST be additive effective-context projections and MUST NOT become the sole durable record of planning evidence or child outputs. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#17-context--truncation]

### Parent mediation and required-vs-optional dependency state

Parent orchestration retains final mediation responsibility for child escalations, user questioning, and crew synthesis. Children do not directly interrogate the user by default. Required versus optional child dependency classification is part of the canonical runtime contract because it determines whether unresolved child work blocks dependent parent completion.
ContractRef: Parent orchestration MUST preserve required-vs-optional child dependency semantics and MUST mediate child-to-user escalation by default. [Source: orchestrator-subagent-integration.md#plan-mode-strategy--defaults; assistant-chat-design.md#14-subagents--crew]

Blocked state means external or runtime constraints prevent progress. `awaiting_parent` means the child is paused pending parent decision, clarification, context expansion, or user response. These are not interchangeable.
ContractRef: `blocked` and `awaiting_parent` MUST remain distinct canonical runtime meanings across permissions, events, chat projection, and recovery. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; assistant-chat-design.md#14-subagents--crew]
