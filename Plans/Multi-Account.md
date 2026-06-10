# Multi-Account Specification


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Requested/effective account identity contract


- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
### Shared conversational/runtime boundary
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


**Status:** Single spec for implementation -- another agent may derive an implementation plan from this document.  
**Cross-references:** Plans/rewrite-tie-in-memo.md, Plans/storage-plan.md, Plans/usage-feature.md, AGENTS.md (Usage Tracking, Platform CLI Commands, Gemini auth exception).

---

## 1. Purpose and scope
- **Purpose:** Support multiple accounts per provider so users can sign into several identities for Claude Code, Codex, Gemini, GitHub Copilot, Cursor, and OpenCode, with conservative account stickiness, threshold-based switching when supported, and provider-specific recovery behavior.
- **Scope:** Multi-account routing is shared provider-runtime behavior for every provider-using role, including assistant, interviewer, requirements builder, PRD builder, package/seam overseers, node workers, and overseer-spawned workers. It is not an Orchestrator-only feature.
- **Provider/runtime scope:** Provider-touched `/web` work must map through the provider capability registry / adapter contract rather than a brittle provider-doc layout; shared runtime identity applies across Assistant, Interviewer, Requirements / PRD / document builders, package/seam workers, and `/governance/execution` actors while preserving their separate actor ontologies.
- **Gemini scope:** Gemini Direct (`gemini`) and Gemini CLI (`gemini_cli`) are separate provider entries. Gemini Direct is the direct API surface and is API-key-only. Gemini CLI is the CLI-wrapped surface and may use OAuth-backed, API-key, or Vertex/Google-credential account rows under its own policy.
- **Provider-entry count:** The current planning model contains 7 provider entries: Gemini Direct, Gemini CLI, Cursor CLI, Claude Code CLI, Codex, GitHub Copilot, and OpenCode.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md

- **Default behavior:** Multi-account auto-switching is ON by default for provider-using roles unless policy disables it.
- **Policy ownership:** Multi-account policy is primarily project-owned. Runs snapshot the effective policy space at run start, and each attempt/message records the effective account actually used.
- **Requested/effective identity:** Requested provider/model/effort/persona/auth mode/account policy and effective provider/model/effort/persona/auth mode/account MUST remain visible and queryable.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md#42-authpolicy, ContractName:Plans/storage-plan.md

- **Rewrite alignment:** Account selection and env/config wiring are part of the Provider contract. State lives in seglog + redb; secrets remain outside canonical storage. GUI requirements remain UX-only with no Iced/Slint lock-in inside this document.
- **Non-goal:** Same-provider accounts are not treated as an interchangeable bucket. Provider-aware, account-aware, and execution-role-aware policy is required.

- **Account-pool runtime shape:** account-pool routing includes `/code`, `/model`, `/config`, `/request`, `/failover`, `/namespace`, `/providers`, `/expiry`, `/OAuth-specific`, first-class account-scoped policy, per-request selection, max-attempt failover caps, async-local context, auto-relogin behavior, toast-centric recovery signals, active-account state, operator-visible history, and TUI surfaces.
- **Cross-owner recovery references:** `Plans/Executor_Protocol.md#5. Node execution fields`, `Plans/orchestrator-subagent-integration.md#Tier-Level Subagent Strategy`, `Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)`, and `Plans/UI_Command_Catalog.md#Canonical Runtime Recovery Command Consolidation (2026-03-09)` are consumer references for account recovery. `github_api:github.com/<login>`, `github_api`, `github.com`, `approve_continue`, `TierContext`, and the slash-path references `/Executor_Protocol.md`, `/UI_Command_Catalog.md`, `/GitHub_API_Auth_and_Flows.md`, and `/orchestrator-subagent-integration.md` must remain auditable in recovery records.
- **Provider product shape:** provider account modeling preserves `/OAuth-specific`, `/product-shape`, `/providers`, `/available`, `/exhaustion`, `/UI`, `/usage`, `/failover`, per-account state, first-class provider-specific records, core-architecture constraints, profile-file-based setup, log-watcher-driven recovery, filesystem-profile ownership, and automation-first recovery behavior.
- **Pool and fallback state:** account pools expose `/pool`, `/UI`, `/runtime`, `/account`, `/fallback`, retry-budget, multi-account, quota-pressure, and `effective_account_id` without treating account selection as a generic provider flag.
- **Settings-spec and GUI coverage:** multi-account support is both a runtime-policy seam and a settings-spec / GUI coverage requirement. `/runtime-side` behavior may exist at the `/concept` level before the settings `/GUI` is complete, but provider account selection, account pool policy, and switch thresholds must not stay under-specced or hidden from the account settings concept.
- **Usage-owned account pressure:** multi-account failover, account-threshold rules, and effective-account projection extend the existing Usage model; do not invent a second independent account pressure or quota subsystem beside Usage.
- **Actor/run kind coverage:** multi-account requested/effective account identity applies to assistant conversation turn/run, interview phase/document/review run, builder stage/review run, and orchestrator node/attempt/run kinds. `/attempt/run`, `/document/review`, `/run`, and `/review` records share account truth while preserving their distinct actor ontologies.
- **Recovering provider control:** `/recovering`, as-provider, `/control`, provider-backed, `/usage`, `/rotation`, browser-based, OpenCode, multi-account, and set active states remain account lifecycle states rather than separate provider identities.
- **Project/worktree account context:** `Plans/Multi-Account.md`, `Plans/GitHub_Integration.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `/Multi-Account.md`, `/GitHub_Integration.md`, `/GitHub_API_Auth_and_Flows.md`, `/project/worktree`, `/effective`, and multi-account state must stay joined when account selection affects a project or worktree.
- **GitHub auth disclosure:** GitHub_API_Auth_and_Flows, GitHub_API_Auth_and_Flows.md, login-derived, disclosure-only, `/storage`, account_id, and multi-account fields must make GitHub account identity visible without replacing the stable internal account identity.
- **Switch availability state:** `/switch`, switch-trigger, `/package/worktree`, availability-state, `/runtime`, `/pressure`, auth-state, stop-reason, bridged-provider, `/event`, usage, `Plans/CLI_Bridged_Providers.md`, and `/CLI_Bridged_Providers.md` fields describe why an account switch did or did not occur.
- **Serialization and persona account scope:** `/serialization`, `/account/persona`, `/runtime`, resume_url, and generated:// artifacts carry account/persona runtime identity rather than inventing feature-local account state.
- **Requested/effective account gap closure:** requested_account and effective_account must not remain under-specified; `/effective` records preserve both requested and effective account truth.
- **Role-scoped confidence:** `/confidence`, role-scoped policy, multi-account, direct-provider, and bridged-provider records preserve confidence and role scope for account routing.
- **Current effective account state:** current effective account displays include recent switch reason, `/account`, current-state, and signal_confidence so current health does not erase switch lineage.
- **Switch policy thresholds:** `/thresholds`, requirements-doc, `/policy`, real-world, auto-switch, multi-account, same-provider, provider-using, and user-configurable policy values govern when account switching is allowed.
- **Actor and target identity:** actor-role and external-target are separate from effective_provider_identity, provider-native identity, and provider_identity; runtime records must keep those fields joinable without treating provider-native labels as the actor.
- **Storage-facing audit identity:** `/storage-facing`, `/audit`, effective_provider_identity, provider_account_id, and effective_account_id expose storage/audit views while keeping provider_account_id subordinate to stable account identity.
- **Behavior-driving audit flags:** behavior-driving account facts are distinct from audit-only facts; bridged-provider origin metadata must disclose which fields can change runtime behavior.
- **Pre/post-send control loop:** pre-send, post-send, control-loop, requirements-doc, `/attempt`, multi-account, provider-using, and account-health records govern whether account state is checked before send, after send, or during retry.
- **GPT account fields:** requested_account, effective_account, GPT, first-class, and multi-account fields remain explicit for GPT-backed provider entries instead of hiding account truth inside a generic provider row.
- **Active versus historical identity:** active-vs-historical account state keeps live account context separate from historical switch records and prior attempt identity.
- **Shared runtime boundary:** shared-runtime account behavior consumed by CLI_Bridged_Providers, CLI_Bridged_Providers.md, and multi-account records does not make the CLI bridge the account owner.
- **Builder/runtime account scope:** /document-production, /interviewer/builders, shared-runtime, /account/runtime, and /seam/node scopes inherit the same requested/effective account contract as assistant and package/seam actors.
- **Rewrite-era decision references:** Decision_Log, Decision_Log.md, and rewrite-era entries are decision-history references for account routing, not substitutes for this live Multi-Account contract.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/FinalGUISpec.md
## 2. References

| Reference | Relevance |
|-----------|-----------|
| **Plans/rewrite-tie-in-memo.md** | UI/storage/provider alignment; Gemini API key exception; avoid coupling to current Iced/storage. |
| **Plans/storage-plan.md** | Where account registry, cooldowns, and usage cache live (redb); usage/rate-limit events in seglog. |
| **Plans/usage-feature.md** | Per-account usage visibility and 5h/7d; Usage view requirements. |
| **AGENTS.md** | Usage Tracking (endpoints, env vars, error parsing); Platform CLI Commands; Gemini auth exception. |
| **External:** claude-nonstop | Config-dir per account, session migrate, resume, exhaustion sleep; rate-limit regex on PTY. |
| **External:** OpenCode PR #11832 | Multi-record OAuth store (v2, ULID, active/order/records, health); rotating-fetch; AsyncLocalStorage-style context; credential-manager events; Anthropic browser relogin. |
| **External:** OpenCode PR #8536 | Codex: accounts[] + activeIndex; wham/usage; 429 → mark rate-limited, get next, retry; CLI list/switch/usage. |

---

## Canonical data-shape reconciliation

This section owns the canonical requested/effective account identity contract for all provider-using actors.

### Required data shape

Every runtime, bridged-provider, and permission-facing envelope that carries account identity must preserve:
- `requested_account_id`
- `requested_account_policy`
- `requested_account_binding`
- `effective_account_id`
- `effective_provider_identity`
- `execution_role`
- `operational_identity`

Rules:
- Add `requested_account_id` alongside `requested_account_policy`.
- Add `requested_account_binding` and govern `provider_account_id` as subordinate provider-native metadata.
- Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes.
- Retire `provider_account_id` from canonical account-identity naming; keep it only as provider-native metadata that shadows the effective provider handle.
- `requested_account_binding` remains the canonical selector for `none`, `preferred`, or `required` fallback behavior.

#### Shared actor/runtime boundary
- Assistant/chat/interview/builder actors share provider/runtime identity semantics with Orchestrator.
- They remain distinct actor/run kinds rather than package/seam/node execution objects.
- Cross-surface consumers may reuse the same requested/effective identity envelope, but they must preserve actor kind and execution context instead of collapsing everything into orchestration-only terms.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

## 3. Assessment: what we have and gaps (filled)


**Question:** Do we have what we need to reverse-engineer multi-account and apply it to Puppet Master for all covered providers?

**Answer:** Yes. Design and patterns are documented and backed by claude-nonstop and both OpenCode PRs. Remaining work is Rust port and provider-specific clients (usage APIs, rate-limit parsing).

### 3.1 Design sources

| Source | What it gives us |
|--------|-------------------|
| **claude-nonstop** | One config dir per account; account registry (JSON); usage API for pick-best; rate-limit regex on PTY; kill → migrate session → resume; exhaustion sleep; constants (buffer size, kill delay, swap limit). |
| **OpenCode PR #11832** | Multi-record OAuth store (v2, ULID, active/order/records, health/cooldown); rotating-fetch (429/401/403 → cooldown, moveToBack, notifyFailover); per-request credential context; Anthropic browser relogin. |
| **OpenCode PR #8536** | Codex: accounts[] + activeIndex; wham/usage; 429 → markCodexAccountRateLimited, getNextAvailableCodexAccount, retry; CLI list/switch/usage. |

### 3.2 Per-provider: what we have vs what we need

| Provider | What we have | What we still need |
|----------|--------------|--------------------|
| **Claude Code** | Config-dir per account (`CLAUDE_CONFIG_DIR`), Anthropic usage API, session paths, resume, rate-limit regex, migration (claude-nonstop). | Rust port; confirm session paths on target OS; optional browser relogin. |
| **Codex** | CodexMultiAccount shape, wham/usage, 429 → mark + get next + retry (PR #8536). | Rust port; for CLI-only: confirm Codex config-dir env; otherwise use native auth when it lands. |
| **Gemini** | Cloud Quotas API (`cloudquotas.googleapis.com`); env `GOOGLE_CLOUD_PROJECT`, `GOOGLE_APPLICATION_CREDENTIALS`; rate-limit message "Your quota will reset after 8h44m7s." (AGENTS.md). | Rust port; implement Cloud Quotas client; API key allowed per rewrite-tie-in. |
| **Copilot** | GitHub REST `/orgs/{org}/copilot/metrics`; env `GITHUB_TOKEN`/`GH_TOKEN`; plan from premium requests limit. | Rust port; multi-account = multiple GitHub OAuth tokens/orgs; metrics client and rate-limit detection. |
| **Cursor** | Config at `~/.cursor/config.json` or `~/.config/cursor/config.json`; no `CURSOR_CONFIG_DIR`. Multi-identity at invocation. | Rust port; multiple config paths or manual switch; no session migration. |

### 3.3 Gaps (resolved)

| Gap | Resolution |
|-----|------------|
| **Gemini usage API** | Cloud Quotas API; env above; 5h/7d from quota limits; rate-limit message in AGENTS.md; Gemini API key allowed. |
| **Copilot usage API** | GitHub REST `/orgs/{org}/copilot/metrics`; multi-account = multiple tokens/orgs. |
| **Cursor config-dir** | No CURSOR_CONFIG_DIR; multi-account = multiple config paths or manual switch; no session migration. |
| **Codex CLI multi-account** | PR #8536 uses in-process tokens + wham/usage; for CLI-only confirm config-dir env via Context7/Codex docs or use native auth when it lands. |
| **Rust idioms** | Use explicit context or thread-local for current account (no AsyncLocalStorage). |

Current-canon correction for this inventory: sections `3. Assessment` and `3.2/3.3` must not revive stale CLI-centric assumptions for Codex or GitHub Copilot. Codex and GitHub Copilot are direct providers in PM; Cursor account-isolation uses the runnable `cursor-agent` account boundary under PM-owned `HOME` / `XDG_*` roots; Gemini quota project-context can affect the effective quota identity even when the selected provider entry remains unchanged.

### 3.4 Rewrite alignment

- **Storage:** Account registry, active index, cooldowns, usage cache in **redb** (or single JSON under app data root until redb). Usage/rate-limit events in **seglog**. No SQLite.
- **Provider abstraction:** Account selection and env/config wiring are part of the **Provider** contract.
- **UI:** GUI and usage views are **UX requirements only**; no Iced/Slint commitment (future UI is Slint per rewrite-tie-in).

### 3.5 Current Puppet Master context

- **Stack:** Rust/Iced; planning model uses 7 provider entries (CLI-bridged: Cursor, Claude Code, Gemini CLI; Server-bridged: OpenCode; Direct: Codex, GitHub Copilot, Gemini Direct). CLI-only today for bridged surfaces (no in-process OAuth store). **PlatformConfig** per platform -- one identity per platform; no accounts[] or activeAccountId yet. **platform_specs.rs** is single source of truth for CLI/auth -- no multi-account data today.
- **Future:** When native auth for Codex, Copilot, Gemini lands, use OpenCode PR #11832 store + rotating-fetch + per-request context as the blueprint for in-process tokens and HTTP.

---

The multi-account system is built from provider entries, account records, entitlement contexts, server profiles, and the derived selectable units PM uses at runtime.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md

### 4.1 Provider entry (canonical)

Each provider entry represents one concrete runtime surface, not a loose vendor family label.

The current planning model contains exactly 7 provider entries.

Examples:
- `gemini` direct provider (`Gemini Direct`)
- `gemini_cli` (`Gemini CLI`)
- `cursor_cli`
- `claude_code_cli`
- `codex`
- `github_copilot`
- `opencode`

`provider_family_id` is additive grouping metadata only and MUST NOT replace the concrete provider entry id.

Each provider entry MUST also declare the allowed `auth_surface` values its runtime accepts so PM can validate account compatibility before scheduling and so the HTTP/client layer knows how credentials must be attached or delegated.

Provider-entry identity fields are part of Agent-Config/provider registry canon:
- `provider_entry_id`
- `provider_family_id`
- `transport_kind = direct_api | cli_runtime | server_bridge`

`provider_entry_id` identifies the concrete runtime surface, `provider_family_id` groups compatible entries for policy and pooling, and `transport_kind` records whether PM calls the provider through a `direct_api`, `cli_runtime`, or `server_bridge` path. These fields are additive; they do not rename requested/effective runtime handles owned by Orchestrator or Prompt Pipeline snapshots.

The same raw vendor model may be reachable through different runtime surfaces such as `gemini`, `gemini_cli`, or an `opencode` bridge. PM preserves that overlap with provider-entry and requested/effective runtime fields instead of collapsing the rows into one vendor-family account.

Account records may carry `provider_identity` for upstream identity display, but that value is descriptive `/provider-native` metadata only; the stable PM key remains the account/profile id.

Direct coding-plan provider entries keep their own provider-entry metadata. `MiniMax Coding Plan` links to `https://platform.minimax.io/docs/coding-plan/intro` and stores separate zero-cost model metadata under the coding-plan provider entry. `Z.AI Coding Plan` links to `https://docs.z.ai/devpack/overview` and likewise stores separate zero-cost model metadata under the coding-plan provider entry.

Coding-plan provider identity must preserve vendor-specific API boundaries instead of collapsing them into a generic OpenAI-compatible or pay-as-you-go bucket. `MiniMax Coding Plan (minimax.io)` uses `https://api.minimax.io/anthropic/v1`, `MiniMax Coding Plan (minimaxi.com)` uses `https://api.minimaxi.com/anthropic/v1`, `Z.AI Coding Plan` uses `https://api.z.ai/api/coding/paas/v4`, and `Zhipu AI Coding Plan` uses `https://open.bigmodel.cn/api/coding/paas/v4`. `Alibaba Coding Plan` uses dedicated Coding Plan keys such as `sk-sp-...` and dedicated coding-plan base URLs distinct from the pay-as-you-go DashScope base URLs.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/usage-feature.md

### 4.2 Account record (canonical)


Account-backed providers store ordered account rows with stable ids.

Locked `account-profile` schema minimum:
- `account_id`
- `label`
- `auth_surface` = `oauth | api_key` or the provider-specific canonical auth surface
- `enabled`
- `priority`
- `threshold_override?`
- `switch_mode_override?`
- `cooldown_policy?`
- `retry_budget?`
- `quota_profile_ref?`
- `allowed_roles?`
- `disallowed_roles?`
- `configured_project_id?` when project context affects quota or routing
- `display_identity?`
- `credential_locator` or `credential_ref` as the non-secret handle to OS credential storage

Minimum fields:
- `account_id`
- `provider_id`
- `label`
- `auth_surface`
- `enabled`
- `priority`
- `provider_identity?`
- `credential_ref`
- `configured_project_id?`
- `selected_billing_entity_id?`
- `threshold_override?`
- `retry_budget?`
- `cooldown_until?`
- `availability_state`
- `configuration_state`
- `credential_state`

Rules:
- `account_id` is the internal stable key.
- `provider_identity` is descriptive provider-native metadata only.
- secrets remain outside config/state stores; actual `/tokens/keys` remain only in OS credential storage.
- separate auth families that change quota semantics remain separate account rows.
- the canonical account-registration shape is `{ account_id: ulid, provider_id, display_name, auth_method, credential_ref, created_at, last_used_at, status }`; additive runtime/health fields may extend this shape without replacing the canonical keys.
- `status` is the user-facing lifecycle summary and closes to `active | expired | revoked | error`.

Field definitions:
- `credential_ref` is a pointer to where the credential lives, never the secret itself. Format: `{credential_store}:{key_path}`.
- supported `credential_ref` stores are:
  - `os_keychain` for OS-native secret stores (macOS Keychain, Windows Credential Manager, Linux Secret Service)
  - `env` for environment-variable indirection
  - `file` for encrypted file-backed credentials
  - `cli` for credentials delegated to an external CLI tool/runtime
- example `credential_ref` values:
  - `os_keychain:pm/openai/account_abc123`
  - `env:OPENAI_API_KEY`
  - `file:~/.config/pm/credentials/gemini_cli.json`
  - `cli:gemini/default`
- `auth_surface` is the enum describing where/how the credential is consumed at runtime.
- `auth_surface` values are:
  - `header_bearer` for `Authorization: Bearer <token>`
  - `header_api_key` for provider-specific API-key headers such as `x-api-key`
  - `query_param` for API key in query string; this path is deprecated and PM should warn before use
  - `cli_managed` when the CLI runtime performs auth internally and PM delegates execution
  - `oauth_token` for OAuth2 access tokens attached through the `Authorization` header
- each provider definition MUST specify its supported `auth_surface` values so the HTTP client knows how to attach credentials and so account validation can reject incompatible pairings early.

Examples:
- Codex `ChatGPT` and Codex `API key` rows are separate account rows.
- many ChatGPT-backed Codex accounts and many API-key-backed Codex accounts may coexist under the same Codex provider entry; switching, usage display, cooldown behavior, and preferred-account logic must preserve the auth-family identity.
- Gemini direct API-key accounts are separate rows from Gemini CLI auth-backed rows because they live on different provider entries.

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/usage-feature.md

### 4.5 Selectable unit and runtime resolution

ContractRef: Plans/Contracts_V0.md#4. Auth contracts, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules), Plans/GitHub_API_Auth_and_Flows.md#Credential store keying (canonical), Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/assistant-chat-design.md#Canonical navigation model

The canonical `account-profile` row schema includes `account_id`, `label`, `auth_surface`, `enabled`, `priority`, `threshold_override`, `switch_mode_override`, `cooldown_policy`, `retry_budget`, `quota_profile_ref`, `allowed_roles`, `disallowed_roles`, `configured_project_id`, `display_identity`, and `credential_locator` or `credential_ref` as the non-secret OS credential handle. Actual `/tokens/keys` never enter project config, redb state, or logs.

Required fields:
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- provider_account_id
- login
- auth_realm
- effective_provider_identity
- execution_role
- operational_identity
- selectable_unit_id
- resolution_outcome
- reason_codes[]
- requested_provider_family_id?
- effective_provider_family_id?
- requested_transport_kind?
- effective_transport_kind?
- requested_connection_profile_id?
- effective_connection_profile_id?
- effective_health_state?
- effective_pressure_state?
- instruction_projection_state?

Selectable-unit identity fields:
- `selectable_unit`
- `unit_id`
- `provider_entry_id`
- `provider_family_id`
- `unit_kind = direct_account | cli_account_root | server_profile`
- `root_path`
- `health_state`
- `pressure_state`
- `last_usage_snapshot`
- `last_cooldown_snapshot`

`selectable_unit` is the runtime candidate PM can actually choose for an attempt. `unit_id` is stable within the provider registry, `provider_entry_id` links the unit back to the concrete runtime surface, `provider_family_id` preserves family-pooling context, and `unit_kind` distinguishes `direct_account`, `cli_account_root`, and `server_profile` candidates without treating those shapes as interchangeable. Runtime state snapshots also preserve the unit's `root_path`, `health_state`, `pressure_state`, `last_usage_snapshot`, and `last_cooldown_snapshot`.

Provider-registry-only discovery timestamps and `/status` caches stay in provider-registry internals, not canonical run snapshots. Per-account shared-overlay advanced knobs may influence candidate preparation, but they remain provider-registry state unless copied into requested/effective runtime evidence.

Requested/effective resolver output must keep provider-family, transport, and connection-profile intent distinct from the selected unit. `requested_provider_family_id`, `requested_transport_kind`, and `requested_connection_profile_id` record the explicit or policy-derived request; `effective_provider_family_id`, `effective_transport_kind`, and `effective_connection_profile_id` record the provider family, transport, and profile that actually executed after fallback, substitution, pressure, health, or policy filtering. `effective_health_state`, `effective_pressure_state`, and `instruction_projection_state` are effective runtime states for the selected unit/projection at dispatch time, not replacements for account `status`, generic availability, or provider-native drift records.

Canonical terms and values:
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- provider_account_id
- login
- account_id is the internal stable key.
- provider_identity is descriptive metadata only.
- the canonical account-registration shape is { account_id: ulid, provider_id, display_name, auth_method, credential_ref, created_at, last_used_at, status }
- requested/effective execution identity
- effective_provider_identity
- execution_role
- operational_identity
- `reason_codes` is the persisted reason-code family; `reason_codes[]` records the ordered concrete reasons for the selected `selectable_unit_id` and `resolution_outcome`.

Labels:
- requested account
- effective account

Behavioral rules:
- Stable internal account identity outranks provider-native display metadata.
- Requested/effective account state remains explicit across runtime resolution.
- Stable internal account identity is separate from provider-native display metadata.
- Secrets remain outside config and state stores.
- Requested state must remain recoverable in historical snapshots.
- Binding distinguishes preference from requirement.
- Fallback behavior depends on binding rather than ad hoc UI or provider policy.

Permission carry-through:
- effective account identity must remain available to permission and approval consumers
## 5. Auto-rotation
- **Switch boundary:** Switching happens only at attempt/message boundaries. Never switch mid-attempt.
- **Soft-threshold boundary:** soft-threshold auto-switch behavior must not switch mid-turn; for soft-threshold pressure, PM waits until a turn/attempt boundary unless hard exhaustion, cooldown, unhealthy account, or another hard failover condition requires in-run retry.
- **Completed ownership rule:** A completed message/attempt always belongs to the account it actually used. The next message/attempt re-resolves and may switch immediately.
- **Sticky behavior:** Routing is conservative and sticky. A recovered higher-priority account does not immediately steal traffic back unless policy and health justify it.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md

Scheduler switch records MUST persist stable reason codes rather than UI-only text. The canonical account-selection reason set includes `soft_threshold_preemptive_switch`, `threshold_preemptive_switch`, `cooldown_preemptive_switch`, `preferred_recovered`, `hard_exhaustion_failover`, `cooldown_active`, `account_unhealthy`, `profile_unhealthy`, `credentials_expired`, `needs_configuration`, `provider_disconnected`, and `model_incompatible`. Provider adapters may surface raw provider conditions such as `unsupported-model`, `workspace-deactivated`, or `provider-unhealthy`, but the scheduler stores the normalized PM reason in the requested/effective runtime snapshot and keeps the raw condition as evidence.

GUI and `/runtime` projections MUST keep selectable-unit `health`, `cooldown`, `usage pressure`, and per-attempt `resolution outcome` as separate `/state` dimensions. A cooldown can be healthy evidence of a provider-reported block, usage pressure can exist without an auth failure, and resolution outcome records why the resolver chose or skipped a unit without overwriting account health.

Provider adapters surface raw health, `/pressure/usage`, and other runtime facts, but PM owns final selectable-unit resolution, requested `/effective` disclosure, and cross-provider switching policy.
Provider-auth account operations include `/set-active/delete/update` routes for selecting, deleting, or updating account records; these mutate provider-auth metadata and must preserve requested/effective history rather than silently rewriting past runs.

The `/hard` no-fallback rule is explicit: no-fallback applies when the request names an explicit `auth-mode`, when manual preferred-account override or `Set Preferred` is active as `/control`, when policy disallows fallback, when the current selectable unit is in cooldown or hard block, when account readiness is `needs_configuration` or `validation_required`, when credentials are invalid or missing, or when no eligible backup account exists. In those cases PM records the blocked/no-fallback reason instead of silently crossing to another auth surface, provider entry, or account family.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

Auto-switch is allowed when policy permits and one of these occurs:
- hard exhaustion
- projected remaining quota below threshold
- severe rate-limit pressure
- account temporarily unavailable or capacity-constrained

Signal weighting order:
1. hard runtime failure
2. direct provider/account telemetry
3. explicit structured runtime output
4. provider-specific heuristics
5. provider-doc/default expectations for that product/account class
6. log-derived heuristics or heuristic/inferred local pressure only

For authoritative remaining counters, PM drives `threshold_reached` at `<= configured switch threshold` and drives `exhausted` at `0 remaining` or explicit provider exhaustion. Provider `/accounts` may override these defaults, but the scheduler must not leave the state transition undefined when authoritative remaining quota is available.
Default threshold-aware policy uses warning threshold `20% remaining` and default auto-switch threshold `10% remaining` unless provider/account overrides say otherwise. Per-account observed `/provider-reported` effective limits outrank generic provider-doc defaults, while provider docs preserve documented/default expectations when effective observed state differs. Providers with named windows preserve provider window keys such as `fiveHour` and `weekly`, and authoritative Gemini quota or `/reset` data outranks runtime token stats when deciding whether to recover back to a primary account. For coding-plan direct providers, official `/reset` and `/remains` endpoints and documented windows are authoritative defaults until observed account-specific divergence wins. Runtime token stats alone can influence pressure, but they must not become a `hard_block` or exhausted state without explicit quota, refusal, cooldown, or equivalent authoritative evidence.
Default account routing prefers `sticky-primary`, `threshold-based-preemptive-switch`, and `reason-coded-failover`; naive `round-robin` may exist only as an advanced/debug strategy and is not PM's main provider-account routing policy.
Vertex/Gemini dynamic shared quota without a stable remaining counter stays in the softer `pattern_only_or_inferred` bucket until stronger provider evidence appears.
For softer provider/runtime evidence, one weak signal is informational, repeated soft signals move the account/profile to `approaching_threshold`, and explicit refusal, cooldown, or lockout moves it to `exhausted` or a blocked state.
PM must not auto-switch purely on one soft `plan-warning`; repeated `plan-pressure` signals can move the account/profile to `approaching_threshold` before stronger refusal or cooldown evidence marks exhaustion.
When a known provider `reset_at` passes, PM moves the affected account/profile to `validating` or `eligible_pending_recheck` rather than blindly marking it `ready`.
GUI copy for an account/profile in `exhausted` pressure may use the title `Usage exhausted` and the subtext `Puppet Master will use another eligible account until this one resets` when fallback is available and policy permits.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/storage-plan.md

Do NOT auto-switch when:
- no eligible backup account exists
- policy forbids it
- provider capability does not support it
- a hard requested constraint forbids fallback
- the current account is in `needs_configuration` / `validation_required` / invalid-credential state and policy requires explicit user recovery first

Cooldown / retry-budget rules:
- cooldown is first-class provider/account state
- retry budget is first-class provider/account state
- on exhaustion or severe rate limit, mark cooldown and avoid bouncing back immediately
- retry budget prevents thrashing the same account repeatedly
- an authoritative cooldown with `cooldown_until` sets `hard_block=true` and state `cooldown` until revalidation after expiry

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/FinalGUISpec.md

Manual controls:
- manual `set active` / preferred account exists as an override/debug control
- manual control does not redefine the default operating model
- manual control still records requested vs effective account identity and switch reason

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md#42-authpolicy
## 6. Provider-specific behavior
| Provider entry | Identity shape | Usage / health signals | Recovery and switching notes |
|---|---|---|---|
| **Gemini Direct** | Direct API-key account rows only | provider/runtime usage, quota APIs, project attribution, error hints | project context may affect effective quota identity; media capability follows the same requested/effective account model |
| **Gemini CLI** | CLI-backed account rows across OAuth, API-key, and Vertex/Google credential families | provider settings, CLI/runtime signals, trust-gated MCP visibility, softer or authoritative counters depending auth family | PM pre-creates account roots, validates auth/config separately, and may observe provider-side model rerouting |
| **Cursor CLI** | `cursor-agent` profile/account rows; browser login default, API key advanced/non-default | provider-reported, team-admin-reported, or inferred runtime/editor refusal signals | PM-owned `HOME`/`XDG_*` roots define account isolation; API-key path is advanced only |
| **Claude Code CLI** | CLI-backed account rows across subscriber, console/API, and SSO families | API-backed accounts can use stronger authoritative usage/cost `/token`; subscriber accounts may rely on softer `/stats/cooldown` inference plus PTY/runtime health signals | scope-aware config overlays and softer threshold behavior for subscriber paths |
| **Codex** | Direct-provider account rows separated by `ChatGPT` and `API key` auth families | plan-backed included usage vs API-billed usage are separate buckets | PM must not merge plan-backed and API-billed usage/cooldowns |
| **GitHub Copilot** | one GitHub-auth-backed account row with one or more billing/entity contexts | premium-request quotas, org policy blocks, entitlement validation, runtime errors | blocked states may be policy-based rather than timer-based; billing entity selection can gate readiness after login |
| **OpenCode** | server profiles only (`Managed Server` or `Attach to Existing Server`) | health, discovery, and server-managed provider/model state | PM owns lifecycle only for managed profiles; attached profiles remain partially reflect-only |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md

Provider rules:
- Claude Code CLI account probing may expose native subscriber/account shape directly. When `claude auth status` reports `loggedIn: true`, `authMethod: "claude.ai"`, `apiProvider: "firstParty"`, and `subscriptionType: "pro"`, PM records those values as account evidence for auth-family and account-type distinction instead of inferring them blindly.
- Claude Code profile switching is driven by `CLAUDE_CONFIG_DIR`; account-specific auth lives in profile-specific `.claude.json` / `claude.json` state, while shared config, plugins, MCP, and settings may be overlaid only when the account boundary remains explicit.
- The `clausona` pattern is allowed only as evidence for selective Claude Code sharing: PM may share supported mutable assets by `symlink` when the account boundary remains explicit, while `.claude.json` and usually `projects/` stay isolated account-local state.
- Claude Code import/probe may seed only `credentials.json` / `.credentials.json` into an isolated `CLAUDE_CONFIG_DIR`; `Import Existing Claude Auth` copies only the auth-bearing subset into the PM-managed `CLAUDE_CONFIG_DIR`, and a successful `claude auth status` plus authenticated headless execution prove the account root without importing unrelated Claude history or caches.
- Claude Code setup must expose the native login variants `--email`, `--sso`, `--claudeai`, and `--console` where supported, with user-facing setup actions including `Sign In to Claude`, `Sign In to Console/API`, `Use SSO`, and `Import Existing Claude Auth`. `claude auth login --help` is the canonical setup probe for those distinct login surfaces; `--claudeai` represents subscription login and `--console` represents Anthropic Console / API billing login. `Use SSO` maps to `claude auth login --sso`, and `claude auth login --console` keeps its product-label distinction in PM setup copy. A fresh isolated `CLAUDE_CONFIG_DIR` returning clean JSON auth status with `loggedIn: false` and `authMethod: "none"` is valid logged-out account evidence rather than a provider failure.
- Claude Code config-dir-per-account remains valid through `CLAUDE_CONFIG_DIR`, but earlier canon that treated it as sufficient for every provider is `/incomplete` for the newer Gemini/Cursor direction.
- Account-level rule variance is modeled explicitly in provider/account matrices. Current high-confidence integration shapes include Gemini CLI, OpenCode, Claude Code memory/hooks/subagents, and Cursor CLI rules/MCP/headless usage shape; medium- or lower-confidence direct-provider shapes remain partial until primary-source evidence promotes them.
- PM-owned provider account roots are keyed by `provider_entry_id`. Linux account data uses `$XDG_DATA_HOME/puppet-master/providers/<provider_entry_id>/`; macOS account data uses `~/Library/Application Support/Puppet Master/providers/<provider_entry_id>/`. Windows account data uses `%APPDATA%\\Puppet Master\\providers\\<provider_entry_id>\\`; the family root may also be displayed as `%APPDATA%\\Puppet Master\\providers\\`. The portable path family is `/puppet-master/providers/`, with `/Puppet` and `/providers/` path segments treated as exact platform spelling, not semantic provider-family labels. PM MUST keep account-isolation path ownership concrete for Linux/macOS/Windows and must not hand-wave filesystem ownership for CLI-backed providers.
- Each selectable account-like unit gets a stable PM-owned child root under that provider base: direct-account-like roots use `.../accounts/<account_id>/` and the `/accounts/<account_id>/` path family, while CLI account roots use `.../accounts/<account_id>/root/`, with `/root/` as the runnable CLI home segment under `/accounts/`.
- Gemini CLI account roots are created before first launch. A `fresh-home` probe showed the CLI can crash when `GEMINI_CLI_HOME` points to a missing directory, so PM MUST precreate the `GEMINI_CLI_HOME` home path and then seed managed auth/settings state rather than relying on pristine-home first run. Headless setup errors that name `/.gemini/settings.json`, `GEMINI_API_KEY`, `GOOGLE_GENAI_USE_VERTEXAI`, or `GOOGLE_GENAI_USE_GCA` are setup evidence for the active Gemini CLI account root. Gemini can work with a narrower auth/settings core than its full generated home, but its home remains state-heavy and coupled enough that PM treats it as a managed account root instead of a trivial credential file.
- A Gemini CLI `fresh-profile` with pristine `GEMINI_CLI_HOME` can hit a project-registry save error before returning the expected auth error; PM treats this first-run provider `/quirk` as managed provisioning and precreates the bootstrap directories/files before auth probing.
- Gemini CLI provider-native profile locations remain anchored under `GEMINI_CLI_HOME`: the profile-global durable base lives in `GEMINI_CLI_HOME` user settings, the user/profile settings path is `~/.gemini/settings.json` within that home, and workspace/project setup evidence may name `/.gemini/settings.json`. Gemini state under that home includes OAuth credentials, account records, history, temp/bin, policies, skills, commands, and other persistent state.
- Gemini CLI auth-bearing import/provisioning tracks `oauth_creds.json`, `oauth_creds`, `settings.json`, `state.json`, `installation_id`, and `projects.json` as provider-native state; PM imports only the minimum necessary subset into the managed account root, and uses per-account state roots to avoid CLI-home history, credential, settings, or project-state bleed-through.
- Gemini auth states are richer than a binary logged-in flag. `oauth_logged_out`, `oauth_logged_in`, `oauth_needs_project_context`, `oauth_needs_configuration`, and `api_key_configured` are distinct setup/readiness states. `oauth_needs_configuration` may be account-scoped when the selected account lacks project, billing, trust, or credential context; provider-scoped setup state is allowed only when every account under that provider entry shares the same missing configuration.
- Gemini OAuth project-context handling is tier-aware. Free-tier onboarding can proceed without a configured Google Cloud project id when the provider-managed project path is valid; non-free tiers can require an explicit configured Google Cloud project id before the account reaches `Ready`. `validation_required` is surfaced before onboarding continues when PM cannot prove the selected project/account context; provider-facing `validation-required` wording maps to that canonical state. A configured project id takes precedence over any previously persisted `managed-project` id from provider-native state.
- Gemini OAuth and API-key paths are different auth, billing, and `/quota` planes, not interchangeable labels over one key-centric `/bucket`. Gemini Direct remains API-key-only, while Gemini CLI can expose OAuth, API-key, or Vertex/Google credential families. OAuth uses browser auth, localhost callback, `PKCE`, refresh-token handling, and Code Assist-style endpoint plus `/project-context` logic; project context and effective project can differ from merely having an OAuth token.
- Claude Code account roots isolate generated `settings.json`, `projects/`, `plans/`, `plugins/blocklist.json`, and `mcp-needs-auth-cache.json`. These are account-local provider artifacts unless a later owner contract explicitly promotes one of them into a PM-managed overlay. PM treats generated `projects/`, `plans/`, `settings.json`, plugin state, and stats caches as account-local runtime state by default.
- Cursor Agent state isolation is tied to PM-owned `HOME` and `XDG_*` / `XDG_` roots, not the narrow `CURSOR_USER_DATA_DIR` knob by itself; home `/XDG` isolation must be treated as the runnable account boundary until an owner contract proves a narrower Cursor-specific root is sufficient.
- Cursor account design may include `browser-auth profile roots`, `API-key accounts`, or both, but PM must define the actual `/launch` contract against `cursor-agent` rather than only the editor-facing `cursor --user-data-dir` workaround.
- `cursor-agent login` is treated as a minimal browser-oriented login flow that may require `NO_OPEN_BROWSER`; PM records that as setup behavior and not as proof of a broad account-switch API.
- Cursor login probes MUST treat a fresh `HOME` and fresh `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, and `XDG_CACHE_HOME` as account-boundary inputs. If `cursor-agent status` reports `Not logged in` under those roots, PM records that as evidence for the isolated account row rather than as global Cursor state.
- Cursor executable control uses `cursor-agent` under PM-managed `HOME` / `XDG_*` roots in both desktop-launched and CLI-launch scenarios. PM should not rely on editor-oriented launch-time `cursor --user-data-dir=...`, `--user-data-dir`, `user-data-dir`, `CURSOR_USER_DATA_DIR`, or other editor-side assumptions as the core account-isolation mechanism for `cursor-agent`; those flags may be provider/desktop `/runtime` or `/config/data` profile detail only when explicitly supported, but they are not PM's multi-account isolation contract and Cursor isolation is not a config-path/manual switching model. `Import Existing Cursor Auth` copies only the minimum auth-bearing state into the PM-managed home `/XDG` profile root. Cursor auth-bearing state is narrow: seeding only `~/.config/cursor/auth.json` (`/.config/cursor/auth.json`, `config/cursor/auth.json`, or `/cursor/auth.json` under the isolated home/XDG root) can be enough for `cursor-agent status`, `models`, and authenticated CLI use; related provider-native files such as `~/.config/cursor/cli-config.json`, `/.config/cursor/cli-config.json`, `~/.config/cursor/statsig-cache.json`, `/.config/cursor/statsig-cache.json`, `~/.cursor/projects/`, and `/.cursor/projects/` remain Cursor-owned account/profile state unless explicitly promoted. Cursor ACP support is a real provider-protocol surface when available, but it is not an account-root boundary and does not replace PM-owned `HOME` / `XDG_*` isolation. Cursor profile-local/native state remains Cursor-owned and account-local unless a later PM owner contract explicitly promotes a file into a managed projection.
- Cursor `/its` CLI context is resolved by launching `cursor-agent` inside the selected PM-owned user-data/profile roots; PM does not model a clean in-process account switch contract for Cursor accounts.
- Projected instruction files live in the workspace, but provider `/account-local` config that points at, augments, or launches them remains `selectable-unit-local` account/profile state unless an owner contract promotes it.
- Codex account roots are isolated with `CODEX_HOME`. A fresh `CODEX_HOME` probe that reports `Not logged in` is clean account-sandbox evidence for that home root rather than global Codex state. Upstream Codex runtime artifacts such as `sessions/`, `models_cache`, `models_cache.json`, `logs_1.sqlite`, `state_5.sqlite`, `logs_1`, `state_5`, shell snapshots, generated system skills under `skills/.system/` / `/.system/`, sandbox helper binaries, and temp assets under `tmp/` are account-local provider state and MUST NOT be shared across PM account rows by default; their SQLite filenames are upstream-provider artifacts, not PM storage technology. A `fresh-home` probe may still reveal local install health issues such as `state-db` migration warnings, websocket fallback, or 401s; PM records those as provider/root health evidence rather than assuming Codex installs are pristine.
- Codex import/probe may seed only `auth.json` into an isolated `CODEX_HOME`; `codex login status` proves login state, and authenticated `codex exec --json` provides structured event output such as `thread.started`, `turn.started`, `error`, and `item.completed` for account/root validation.
- Codex account-model implication: many ChatGPT-backed Codex accounts and many API-key-backed Codex accounts may coexist under the same Codex provider entry; auth family remains material for switching, usage display, cooldown behavior, and preferred-account logic.
- same-provider rows are not interchangeable when auth family, billing/entity context, or profile mode changes quota or recovery behavior.
- Codex OAuth/subscription rows preserve the `/ChatGPT` auth-family marker separately from API-key rows so setup, quota, cooldown, and preferred-account policy do not collapse both families into one generic Codex account.
- In PM's provider-model, `Gemini` is not `direct-only`: `Gemini Direct` and `Gemini CLI` are separate provider entries and may still participate in one family pool when policy allows.
- Gemini CLI capability gating is provider + account + auth-family aware: OAuth-only, API-key, and Vertex-backed accounts may differ in media/tool capability, and internal model-routing /fallback behavior must be constrained or surfaced as requested/effective model-routing evidence.
- Gemini-specific capability declarations must fit the shared provider capability model in Plans/Models_System.md. Both `gemini` and `gemini_cli` provider entries MUST declare `supports_multi_account`, `account_identity_kind`, `quota_signal_sources`, `quota_signal_confidence`, `supports_threshold_switch`, `supports_hard_exhaustion_detection`, `supports_rate_limit_detection`, `supports_reset_countdown`, `supports_manual_set_active`, `supports_cooldown`, `supports_retry_budget`, and `supports_role_scoped_account_pools` rather than using Gemini-only capability flags.
- Gemini account and runtime records use requested/effective storage vocabulary, including `requested_auth_mode` and `effective_*` snapshots for auth, `/capability`, billing/quota plane, project context, and usage source. Non-secret preferences can live in project/account settings; OAuth/API credentials stay out of redb and `/seglog`.
- Codex and GitHub Copilot are direct providers, not CLI-backed execution surfaces in PM.
- GitHub API auth used for repository operations remains independent from GitHub Copilot provider auth.
- GitHub Copilot provider accounts have their own auth-realm; switching GitHub Copilot accounts for provider multi-account must not change Git transport, local Git/worktree state, git remotes, worktree ownership, repository transport state, or GitHub API account binding. Those are independent surfaces in storage, GUI, and runtime routing.
- GitHub Copilot usage rows stay billing-entity-aware: API-key-style accounts that are billed by request use `Usage Bucket: API billed`, while Copilot premium-request and organization policy states remain tied to the selected GitHub login and billing/entity context.
- GitHub Copilot entitlement state preserves `effective_entitlement_class = org_subscription | enterprise_subscription | individual_subscription` so organization, enterprise, and individual subscription buckets do not collapse into one generic Copilot account class.
- Copilot blocked and cooldown mapping preserves reason codes such as `billing_entity_required`, `included_premium_exhausted`, `paid_overage_disallowed`, `copilot_org_policy_blocked`, and `copilot_entitlement_missing`.
- `GitHub Copilot Advanced` is the provider-native instruction/agent surface for Copilot-specific configuration; it sits beside shared instruction panes and keeps `/agent` controls provider-native without absorbing GitHub API or Git transport identity.
- In Agent-Config, `GitHub Copilot Advanced` has managed target groups: `Repository Instructions` maps to `.github/copilot-instructions.md` / `/copilot-instructions.md` / `github/copilot-instructions.md`; `Path Instructions` maps to `.github/instructions/*.instructions.md` / `github/instructions/*.instructions.md`; and `Custom Agents` maps to `.github/agents/*.agent.md`. Each advanced target group carries its own `PM Controlled` / `Manual Override` state, drift state, last sync, and repair actions.
- Codex and GitHub Copilot provider config projections are `native_projected` when PM writes provider-native instruction/config artifacts; failure-behavior must be explicit, including whether PM blocks launch, falls back to bundled/shared PM instructions, or reports a projection repair action.
- OpenCode skills and MCP behavior sit above the provider list exposed by OpenCode; for Codex, GitHub Copilot, MiniMax Coding Plan, Z.AI Coding Plan, Alibaba-family providers, and other direct-provider entries, PM should not invent provider-specific skill plumbing inside the OpenCode server profile, because provider differences belong in auth, `/model/runtime`, and capability transforms rather than replacing PM-native skill delivery.
- OpenCode account/cooldown evidence is per-account when exposed; a `429` or equivalent provider refusal sets `rateLimitedUntil` on that account/server-profile candidate before failover, without converting OpenCode into a direct-provider account store.
- OpenCode-normalized pressure signals must retain whether the block was `OpenCode-observed` or `upstream-authoritative`; PM may use either as evidence, but the source authority stays visible in pressure and recovery records.
- Across all CLI-backed providers, `auth_state`, `history`, `mcp_oauth_tokens`, `extensions runtime state`, `project registry`, `temp chats`, `workspace_trust`, `runtime_cache`, `cooldown_residue`, and `telemetry_state` are denied from sharing by default. PM-managed overlays may be projected separately, but account-bearing state and residue from one profile must not leak into another account's runnable profile.
- Runtime sharing defaults allow PM-managed overlays for instructions, skills, selected `mcp_definitions`, and selected bridge config only when target-specific; auth_state, trust/workspace_trust, cooldown `/usage` state, transcripts `/history`, temp chats, provider-generated session DBs, sessions, state db, model cache, projects, plans, stats cache, and runtime caches remain account-local/provider-generated unless an owner contract explicitly promotes them.
- Provider account sharing policy records include `share_classes[]`, `deny_classes[]`, and `projection_mode = copy | symlink | generated | provider_api`; `deny_classes[]` wins for account-bearing state, and any `provider_api` projection must remain a provider adapter boundary rather than a filesystem sharing shortcut.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/FinalGUISpec.md
## 7. Runner / orchestration contract

The multi-account contract applies across assistant, interviewer, builders, overseers, and node workers.

Rules:
- multi-account auto-switching is on by default for provider-using actors
- provider selection is provider-aware, account-aware, and role-aware
- same-provider accounts are not interchangeable
- manual set-active is an override/debug control rather than the main execution model

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/usage-feature.md

### 4.6 Owner/consumer boundary alignment

Runtime-account consumers defer to this owner contract for requested/effective account selection. `requested_account_binding` and `operational_identity` stay shared runtime fields rather than feature-local aliases.

Required account-binding/runtime fields are:
- `requested_account_policy`
- `requested_account_id?`
- `requested_account_binding?`
- `effective_account_id?`
- `account_switch_reason?`
- `execution_role`

`requested_account_binding` is closed to:
- `none`
- `preferred`
- `required`

Rules:
- `requested_account_policy` alone is not enough to explain concrete account selection
- failed or blocked switch decisions remain historically material even when `effective_account_id` does not change
- durable switch and pressure history is persisted through `account_switch_event` and `account_pressure_episode`
- normalized pressure-state trigger tables include `nominal` as the healthy/available state for rows with capacity above threshold, no active cooldown, and no higher-confidence hard block.
- Authoritative account-specific `hard_block=true` or `hard_blocked` evidence makes that account ineligible for routing, even when provider docs say the reset window should have elapsed; PM must preserve the documented-vs-observed mismatch as diagnostic context and wait for successful revalidation before routing to that account again.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Models_System.md
## 8. Usage and pick-best
- Usage/account pressure plugs into the shared usage model; do not create a parallel quota system for multi-account routing.
- Every provider-using interaction may update account health.
- Pick-best uses the strongest available account-health signals plus configured policy; it does not treat all signals as equally authoritative.
- Any Gemini `/quota/status` projection that only reports provider-level state is incomplete: Gemini family summaries must preserve the account-level state that produced the current usage, pressure, cooldown, and source-confidence labels.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#42-authpolicy

Canonical Gemini usage/source expectations:
- show one shared Gemini-family usage surface rather than separate top-level Gemini Direct vs Gemini CLI pages
- label OAuth-backed views as `Gemini quota` when authoritative quota semantics are available
- label API-key/local-only views with source-qualified wording such as `Gemini (estimated)` when authoritative quota data is not available
- expose `signal_confidence` so users can tell whether quota pressure is authoritative, structured, heuristic, or local-only

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/rewrite-tie-in-memo.md

Priority, GUI ordering, and stickiness rules:
- lower numeric priority wins (`1` before `2` before `3`)
- prefer the current effective account if it remains healthy enough
- otherwise choose the highest-priority eligible account inside the highest-ranked viable auth surface
- do not bounce immediately back to a recovered higher-priority account unless policy and health justify it

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, PolicyRule:Decision_Policy.md§3
## 9. GUI requirements (UX only)
All of the following remain UX requirements independent of implementation stack.

### 9.1 Agent-Config structure

Agent-Config is the canonical management surface for provider defaults, accounts/profiles, models, instructions, skills, and advanced runtime controls.

Required section order:
1. `Overview`
2. `Defaults`
3. `Accounts / Profiles`
4. `Models`
5. `Instructions`
6. `Skills`
7. `Advanced Runtime`

A persistent `Effective Runtime` inspector remains visible in the provider detail flow and predicts the likely requested/effective runtime before launch.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md

The Agent-Config GUI includes a `Provider Pooling` / `Family Pooling` section wherever a provider entry can participate in family-level account or runtime pooling. `Provider Pooling` also surfaces add/import/login/bootstrap actions per provider-specific account type instead of forcing one generic account-setup flow across incompatible providers.

Gemini setup no longer uses a one-card mixed OAuth/API grouping. The `9. GUI requirements` owner direction is that Agent-Config presents Gemini Direct and Gemini CLI through the current provider-entry/account model, with direct API-key setup separated from CLI auth families and with requested/effective disclosure when family pooling selects a different backend.

Family-pool guardrails: PM may only auto-select a unit when its effective capabilities satisfy the requested model/media/effort/tooling needs, including `/media/effort/tooling` capability checks. The run record must preserve the requested provider entry and effective provider entry explicitly, and PM must never silently route a request that depends on Gemini CLI-only features to Gemini Direct or route a direct-only request into Gemini CLI without requested/effective disclosure.

The anti-duplication rule from the older one-card direction is preserved as a no-`pseudo-providers` rule: the GUI may group related Gemini rows under a family surface, but it MUST NOT mint fake OAuth/API-key pseudo-providers that compete with the real `gemini` and `gemini_cli` provider entries. Within each real entry or family grouping, account rows expose auth-surface badges and derived auth `/configuration/availability` state rather than hiding readiness inside a provider-level card.

Agent-Config field-placement and `/runtime` rules are frozen: provider detail exposes `Overview`, `Defaults`, `Accounts / Profiles`, `Models`, `Instructions`, `Skills`, and `Advanced Runtime`, while the `Effective Runtime` inspector remains persistently visible as a side or bottom inspector instead of being hidden in diagnostics.

### 9.2 Account and profile rows

Each row shows:
- label
- auth family or profile mode
- current state
- derived auth/configuration/availability state
- pressure/cooldown summary
- entitlement/billing secondary line when relevant
- last validation or health timestamp
- primary actions appropriate to the row type

Row rules:
- provider `/account/profile` list rows stay dense for scan-friendly `/layout`; detailed usage `/cooldown` and requested `/effective` explanation belongs in the persistent inspector rather than overloading the list row.
- Codex `ChatGPT` and `API key` rows remain separate top-level rows.
- GitHub Copilot shows one auth-backed account row and exposes available billing entities in the inspector rather than minting fake top-level accounts.
- OpenCode shows server-profile rows labeled as `Managed Server` or `Attach to Existing Server`, and the Agent-Config GUI exposes process `/connect` state on the OpenCode profile row or inspector rather than hiding connection readiness in logs.
- row actions include `Add Account`, `Add Profile`, `Set Preferred`, `Refresh Usage`, `Revalidate`, `Edit Threshold`, `Open Provider Settings`, and profile-specific repair/reconnect actions where applicable; `Add Account` / `Add Profile` opens a provider-specific setup drawer.
- The Agent-Config GUI keeps the row as the auth identity while the expanded inspector owns billing-entity selection, premium-request state, and `fallback-to-included-model` disclosure.
- provider-level `Enable/Disable Provider` changes future eligibility only and must not destroy account/profile rows or saved defaults.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

### 9.3 Setup and remediation UX

Provider/account setup flows must distinguish authentication from readiness.

Required states:
- `Logged out` / `Logged Out`
- `Logging in` / `Logging In`
- `Logged in`
- `Needs setup`
- `Validating`
- `Ready`
- `Auth expired`
- `Validation failed`
- `Logging out`
- `Disabled`

Rules:
- The account/profile GUI `/state-machine` must retain enough provider-specific state to render these labels plus provider-specific degraded states rather than collapsing them into one generic error chip.
- `Logged in` is not the same as `Ready`.
- setup-state labels MUST treat `Logged In` as distinct from `Ready`; a `Use API Key` path can save credentials but still requires auth/config/entitlement validation before the row reaches `Ready`, selected `/account/profile` readiness requires `/config/entitlement` validation for the active provider/account/profile type, and unresolved entitlement/billing context keeps direct-provider setup in a `partial-setup` / configuration state rather than treating auth alone as sufficient.
- Provider-specific entitlement or `/billing` resolution can keep an account in `Needs setup` after auth succeeds; PM must not collapse that state into `Ready`, `partial-setup`, or `Logging Out`.
- Copilot may require `Choose Billing Entity` before reaching `Ready`.
- Vertex/Google Cloud Gemini CLI setups may require credentials, project/location selection, and trust validation before reaching `Ready`.
- `Use Vertex AI` setup for Gemini CLI uses helper text `Best for Google Cloud project-based usage with ADC, service accounts, or Google Cloud API keys`; it branches into `Application Default Credentials (ADC)`, `Service Account JSON`, and Google Cloud API key credential paths before the row can be validated as `Ready`. Gemini CLI setup also exposes `Sign In with Google` and `Use Gemini API Key` as distinct account-auth choices; the Vertex branch is the `Vertex ADC/service-account/API-key` family and preserves the `/service-account/API-key` spelling in evidence.
- Gemini CLI validation runs after every setup path using the PM-owned `GEMINI_CLI_HOME`, then separately surfaces project context, workspace trust, and `/trust/MCP` readiness before declaring the account/profile fully ready.
- Cursor CLI browser login is the default path; API key is exposed as an advanced optional path only.
- Official/current Cursor docs direction treats Project Rules (`.cursor/rules/*.mdc`) as the primary/native rules path, so Cursor docs/rules projection generates `.cursor/rules/*.mdc` first; `Cursor Rules` is the user-facing label, while `.cursorrules` remains supported but legacy/deprecated and root compatibility files remain compatibility targets rather than the primary managed artifact.
- provider-reported cooldowns remain read-only facts with source `/confidence`; PM pause and recheck controls are separate overlays.

ContractRef: ContractName:Plans/Contracts_V0.md#Setup/Health-lifecycle-contracts, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md

### 9.3.1 Account registration flows

Provider settings MUST expose account lifecycle controls in a consistent location while still honoring provider-specific auth requirements.

Required flows:
- **Add account:** `Settings -> Providers -> [Provider] -> Add Account`.
- **Edit account:** allow `display_name` changes and credential rotation; rotating a credential MUST trigger the provider's re-auth or revalidation flow before the updated row returns to `Ready`.
- **Remove account/profile:** present a confirmation dialog with `Remove from PM only` and `Remove and archive PM-managed data` choices. Both choices remove the account/profile record and reassign any threads or defaults pointing at that account/profile; only the archive choice captures PM-managed artifacts first.
- **Default account:** each provider has exactly one default account. PM uses that default whenever no explicit account selection is made by policy, role, or manual override.

Registration rules:
- account creation mints a stable `account_id` as a ULID.
- new account rows use the canonical schema `{ account_id: ulid, provider_id, display_name, auth_method, credential_ref, created_at, last_used_at, status }`.
- `status` closes to `active | expired | revoked | error`.
- Codex add-account entry choices are `Sign in with ChatGPT` and `Use API Key`; setup copy must not revive the stale browser/device-code/API-key matrix as the primary Codex account model. The ChatGPT path helper text is `Uses Codex through your ChatGPT plan limits`; Codex account identity is auth-family-sensitive for `/quota`, because a `ChatGPT account` bucket and an API-key bucket remain separate entitlement pools even for the same human owner.
- `Switching to ChatGPT-backed access may require signing out first`: switching a Codex account from API-key-backed use to subscription-backed ChatGPT use may require `codex logout` and rerunning Codex to re-enter the ChatGPT-backed path.
- The baseline GUI account-add flow exposes the provider-by-provider availability matrix for setup methods that are actually available: `Fresh Login`, `Import Existing Auth`, and `Environment/API-Key Setup`. MVP implementations may hide unavailable methods per provider, but they MUST keep the baseline GUI/state transitions deterministic and provider-specific rather than collapsing every provider into one generic setup path.
- Provider-specific setup availability must remain explicit for root-backed providers: Cursor, Claude Code, Codex, and Gemini may expose both `Fresh Login` and `Import Existing Auth`; `Import Existing Auth` seeds only narrow `auth-bearing` state into the PM-owned root and is a first-class setup mode when the provider probe proves it works.
- Direct coding-plan provider entries use provider-specific setup rows: `Alibaba Coding Plan`, `MiniMax Coding Plan`, and `Z.AI Coding Plan` each expose `Use API Key` as their baseline setup mode. `MiniMax` and `Z.AI` product labels remain visible where a coding-plan entry resolves vendor identity, not collapsed into a generic OpenAI-compatible bucket.
- Common remediation actions are `Retry Sign-In`, `Edit Auth Settings`, `Repair Home`, and `Revalidate`; provider setup surfaces expose only the actions valid for the selected provider entry and account state.
- Claude Code CLI remediation actions include `Retry Login`, `Switch Login Method`, `Repair Config`, and `Revalidate` after auth validation records the effective account class (`subscriber` versus `api/org-backed`, with `/org-backed` as the display alias for organization-backed API usage).
- Codex and billing/entitlement recovery surfaces include `Retry Sign-In`, `Edit API Key`, `Repair MCP/Rules`, `Refresh Entitlements`, `Revalidate`, and `Disable` where applicable; providers that do not expose API-key, rules/MCP repair, entitlement refresh, or disable paths must hide the invalid actions rather than generalizing them.
- Billing-entity refresh cadence is explicit: refresh billing entities after login, after `Refresh Entitlements`, and after a Copilot entitlement/policy failure.
- Row-level setup actions use an explicit button-state contract: `Sign In` -> `Signing In...`, `Save Key` -> `Saving...`, `Import` -> `Importing...`, `Validate` -> `Validating...`, `Refresh Usage` -> `Refreshing...`, and `Log Out` -> `Logging Out...`; this applies equally to direct-provider actions and CLI/server providers. Successful `Sign In`, `Save Key`, or `Import` must auto-transition to `Validating...` when no further user input is required. Canonical terminal-label examples remain explicit: `Sign In` -> `Signing In...` -> `Logged In`, `Save Key` -> `Saving...` -> `Saved`, `Refresh Usage` -> `Refreshing...`, and `Log Out` -> `Logging Out...` -> `Logged Out`, with `Logged Out` as the `/post-success` state for `Log Out`.
- removing a non-default account MUST preserve requested/effective history for past runs even though the live row is deleted.
- removing the current default account MUST atomically promote another eligible account or leave the provider in an explicit no-default state that blocks new runs until resolved.
- disabling an account/profile MUST NOT delete its root.
- removal MUST avoid deleting non-PM-managed provider data outside the owned root; backups and archives are for PM-managed artifacts only, not whole provider-home snapshots by default.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### 9.3.2 Authentication flow walkthroughs

Authentication walkthroughs define the expected PM-side orchestration around provider-native auth mechanisms.

Every account setup/auth flow must surface its active auth path explicitly: OAuth browser flows show the redirect, verification URL, or localhost callback state; API-key flows show a secure API key entry step; token refresh is either PM-managed or delegated to the provider runtime with that delegation visible; and credential expiry produces a user-visible notification plus recovery action instead of silently degrading the account row.

#### API key flow
1. User opens `Settings -> Providers -> [Provider] -> Add Account`.
2. User selects `API Key` as the auth method.
3. User enters the API key into a secure input field.
4. PM validates the key with a lightweight test API call such as `list models` or the provider's nearest equivalent.
5. On success, PM stores the key in the OS credential store, writes the resulting `credential_ref`, and marks the account active.
6. On failure, PM shows a concrete reason such as `invalid key`, `expired`, or `quota exceeded`, and leaves the row recoverable for retry rather than pretending setup succeeded.

#### OAuth device-code flow
1. User clicks `Sign in with [Provider]`.
2. PM requests a device code from the provider.
3. The UI shows the device code, verification URL, and a QR code that points to the same authorization page.
4. User completes browser-based authorization outside PM.
5. PM polls for the token every 5 seconds with a total timeout of 5 minutes.
6. On success, PM stores the refresh token in the OS credential store and keeps the short-lived access token cached in memory only.
7. On failure or timeout, PM shows a clear error and an explicit retry option.

#### CLI token flow (Gemini CLI)
1. PM detects an installed Gemini CLI before presenting the CLI-token option as ready.
2. PM invokes the Gemini CLI auth command in the background.
3. The Gemini CLI performs its native OAuth/browser flow.
4. PM reads the resulting token or credential handle from the CLI credential cache and records it through the account row's `credential_ref`.
5. Ongoing token refresh remains delegated to the Gemini CLI runtime rather than reimplemented inside PM.
6. `Import Existing Gemini CLI Auth` copies only the minimum auth-bearing state into the PM-owned `GEMINI_CLI_HOME` root, after PM has precreated and validated that root.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md

### 9.4 Usage and runtime visibility

Usage and status surfaces MUST show:
- current effective account or server profile
- current effective auth mode
- current effective billing/entity context when relevant
- pressure/cooldown state
- source-confidence, stale, or estimated labels when data is not authoritative
- switch/failover reason when PM changed the selected unit

`Plans/usage-feature.md` (`/usage-feature.md`) consumes this account/provider owner contract for its `Cursor`, `Codex`, `Copilot`, `Gemini`, and summary-table sections; those Usage sections must not reintroduce stale provider buckets or flatten direct-provider quota context into one generic `account` label.

Usage rows should prefer plain-language statuses such as `Working` or a concrete failure reason instead of transport-internal terminology.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 9.5 Instructions, skills, and MCP in Agent-Config

Agent-Config must expose:
- shared instruction panes sourced from PM's `AGENTS` / AGENTS-layer intent (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `Cursor Rules`)
- provider-native advanced panes for GitHub Copilot
- PM-native skills with readiness/fix text/actions
- PM-native MCP servers with per-provider/runtime effective status in inspectors

Rules:
- provider-native files under PM control expose `In Sync`, `PM Outdated`, `Provider Modified`, `Projection Failed`, or `Unknown` drift states with `Repair`, `Detach`, and `View diff` actions.
- Provider-native rule/settings files, including `/settings` surfaces, are generated artifacts derived from one canonical instruction model; if users edit them directly, PM reports drift instead of treating the edited provider-native file as the new source of truth.
- Provider-native projection records carry `control_mode = pm_controlled | manual_override`, `drift_state = in_sync | pm_outdated | provider_modified | projection_failed | unknown`, `last_projected_at`, and `projection_targets` / `projection_targets[]`.
- Instruction projection records use `instruction_projection` with `canonical_revision`, `projection_target_kind = agents_md | claude_md | gemini_md | cursor_rules`, `target_path`, `preview_hash`, `requested_runtime_snapshot`, `last_projected_at`, and `last_drift_check_at` so PM can prove what source revision was projected to which provider-native target.
- Per-target projection GUI records expose `last_projected_at`, `last_drift_check_at`, visible last sync time, drift state, and effective rendered contents/preview; editing a provider-native pane directly while it is PM-controlled marks that target `Provider Modified` rather than silently overwriting it on the next refresh, then requires manual override or editing the canonical source and regenerating sibling projections.
- Projection conflict handling is explicit: `conflict_policy = pm_wins | manual_review | provider_wins`, and `drift_detection = hash | mtime | disabled` records how PM decides whether the provider target has diverged.
- Repair and `/drift` handling may `/overwrite` only the PM-managed portions of profile `/config` surfaces that PM owns; drift repair must preserve manual/provider-owned sections and never clobber an entire provider profile merely because one PM-controlled target diverged.
- user-edit rule in GUI: editing a `PM Controlled` provider-native target directly requires first flipping that target to `Manual Override`; editing the canonical source is the only path that keeps semantic sync across controlled targets.
- launch-time drift rule: `Provider Modified` must not auto-overwrite at launch; PM warns and requires explicit repair or manual override before claiming the target is in sync.
- Each instruction target GUI record carries `last_projected_at` and `last_drift_check_at` so projection freshness and drift checks remain inspectable instead of hidden behind a generic state label.
- Cursor rule projection is lossy compared with plain markdown instruction files: `.mdc` adds metadata and scope semantics, so PM must use a deliberate translation policy rather than naive file-copy sync.
- projection-path rule: workspace projections such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/*.mdc`, `cursor/rules/*.mdc`, `.mcp.json`, `.github/copilot-instructions.md`, `/copilot-instructions.md`, `github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, `github/instructions/*.instructions.md`, `.github/agents/*.agent.md`, `github/agents/*.agent.md`, `agent.md`, `instructions.md`, provider-local config files, and `/rules/`, `/instructions/`, and `/agents/` path families are tracked separately from provider account roots.
- skill rows use plain-language statuses, fix text, and a primary remediation action.
- MCP rows are server-centric at the top level; per-provider/runtime state appears in the inspector rather than pretending every provider has a literal install state.
- Separate user-visible provider entries are acceptable where runtime `/auth/control` differences are meaningful, even when PM keeps an internal shared vendor `/family` layer.
- Provider entries expose `display_name`, `enabled`, `supports_family_pooling`, and `default_model_id_raw` so family pooling and defaults can be inspected without deriving them from labels.
- OpenCode server profiles use a per-profile PM sidecar layout under the profile root: `pm/state.json`, `pm/logs/`, `pm/projections/`, and `pm/backups/`.
- `Import Existing Auth` copies or seeds only the minimum auth-bearing material needed into the PM-owned root; it must not wholesale clone unrelated provider history, caches, logs, projections, or backups by default.
- `/migration`, `/caches`, `/logs/`, and `/backups/` path families from an existing provider home are source-side context by default, not automatic wholesale imports.
- import metadata preserves the source path for audit/debug, but the imported account or server profile runs from the PM-owned root after import.
- `Import Existing Codex Auth` is optional/non-MVP and may import only the minimum auth-bearing Codex state into the PM-owned account root. The baseline Codex setup paths remain `Sign in with ChatGPT` and `Use API Key`.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md
## 10. Phase 2 (native auth) -- when available


When the new auth system for Codex, Copilot, Gemini (and optionally Claude) lands (in-process tokens, HTTP calls):

- **In-process token store:** OpenCode PR #11832 shape in Rust: `providers[platform_id]` with `active`, `order`, `records` (per-account tokens + health). File lock for writes; best-effort for health updates.
- **Rotating fetch:** Wrap HTTP calls: get candidates (active first, then order), filter by cooldown; on 429/401/403 apply cooldown, moveToBack, notify, retry with next account.
- **Current account:** Request-scoped "current account" via explicit context struct or thread-local (no AsyncLocalStorage in Rust).

---

## 11. Open points for implementer
- No design-open questions remain for the Gemini auth/account model in this document.
- Remaining implementation confirmations are limited to provider adapter details, migration sequencing, and exact UI copy polish.
- Such confirmations MUST NOT change the locked defaults, precedence order, requested/effective field names, or the rule that media follows the same Gemini auth/account model as normal provider usage.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD
## Operational Identity Addendum for GitHub Actions and Docker Manager (2026-03-12)


The current multi-account model must explicitly distinguish provider accounts from operational identities needed by this packet.

Required operational identity classes:
- `github_api` account identity used by GitHub Actions surface
- registry account identity / namespace identity used by Docker Manager
- Kubernetes context / cluster identity used by Docker Manager Kubernetes subview

Rules:
- operational identity state may be displayed alongside provider/account state, but it must not be implied to share the same ownership or token source unless the owning auth contract says so
- requested vs effective state remains visible when an identity exists but capability is partial

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Permissions_System.md
