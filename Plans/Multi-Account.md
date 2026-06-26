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
- **Gemini scope:** Gemini Direct (`gemini`) remains the active direct API surface and is API-key-only. Gemini CLI (`gemini_cli`) is retired from active provider support and preserved only as stale/source-lineage vocabulary where compatibility or migration evidence requires the exact token. Antigravity CLI replaces Gemini CLI for the active CLI-wrapped Google-provider lane.
- **Provider-entry count:** The current planning model is an open-ended Provider -> models catalog rather than a fixed count. Active entries include direct, CLI-runtime, and server-bridge routes such as Gemini Direct, Antigravity CLI, Cursor, Claude Code CLI, Codex/OpenAI, GitHub Copilot, OpenCode server, Kimi For Coding, MiniMax Coding Plan, Z.AI/Zhipu coding-plan routes, Alibaba/Qwen Coding Plan, and other disabled/unverified coding-plan families as evidence permits.

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
- **Current effective account state:** current effective account displays include recent switch reason, `/account`, current-state, and `source_confidence` so current health does not erase switch lineage. Legacy `signal_confidence` spelling is compatibility/source-lineage only.
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
| **Plans/rewrite-tie-in-memo.md** | UI/storage/provider alignment; Gemini API key exception; avoid coupling to retired Rust/Iced lineage or legacy storage. |
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

- **Stack:** Rust + Slint target; the planning model uses an open-ended Provider -> models catalog with direct, CLI-runtime, and server-bridge routes. Gemini CLI is retired/source-lineage only; Antigravity CLI replaces it in active CLI-runtime coverage. Codex/OpenAI, GitHub Copilot, Cursor API/SDK routes, Kimi For Coding, MiniMax Coding Plan, and Z.AI/Zhipu coding-plan routes are direct-provider/account-profile entries where verified. CLI-only text in this section is stale compatibility lineage unless reasserted by a later PlanUnit. **PlatformConfig** and `platform_specs.rs` are legacy vocabulary and must not be treated as the final account/provider registry.
- **Future:** When native auth for Codex, Copilot, Gemini lands, use OpenCode PR #11832 store + rotating-fetch + per-request context as the blueprint for in-process tokens and HTTP.

---

The multi-account system is built from provider entries, account records, entitlement contexts, server profiles, and the derived selectable units PM uses at runtime.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md

### 4.1 Provider entry (canonical)

Each provider entry represents one concrete runtime surface, not a loose vendor family label.

The current planning model contains an open-ended Provider -> models catalog, not exactly 7 provider entries. Provider entries are concrete runtime/account/billing/transport routes; provider families only group those entries for policy and display.

Examples:
- `gemini` direct provider (`Gemini Direct`)
- `gemini_cli` (`Gemini CLI`) as retired/source-lineage vocabulary only
- `antigravity_cli` (`Antigravity CLI`)
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

The same raw vendor model may be reachable through different runtime surfaces such as `gemini`, `antigravity_cli`, or an `opencode` bridge. PM preserves that overlap with provider-entry and requested/effective runtime fields instead of collapsing the rows into one vendor-family account. Retired `gemini_cli` overlap examples are source-lineage only.

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
  - `file:~/.config/pm/credentials/antigravity_cli.json`
  - `cli:antigravity/default`
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
- Gemini Direct API-key accounts remain separate from Antigravity CLI account/profile rows because direct API and CLI-runtime routes live on different provider entries. Gemini CLI auth-backed rows are retired/source-lineage only.

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
| **Antigravity CLI** | CLI-runtime account/profile rows with Google OAuth/system-keyring, ADC, and local profile-root setup where verified | CLI/runtime signals, model-list/prompt-output probes, capability-gated output-format evidence | PM validates `agy` availability and account/profile readiness without reusing retired `GEMINI_CLI_HOME`; multi-model routing remains requested/effective |
| **Gemini CLI (retired)** | source-lineage vocabulary only | migration/currentness evidence only | not an active provider setup, routing, import, or switching target |
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
- Account-level rule variance is modeled explicitly in provider/account matrices. Current high-confidence integration shapes include Antigravity CLI, OpenCode, Claude Code memory/hooks/subagents, and Cursor CLI rules/MCP/headless usage shape; medium- or lower-confidence direct-provider shapes remain partial until primary-source evidence promotes them.
- PM-owned provider account roots are keyed by `provider_entry_id`. Linux account data uses `$XDG_DATA_HOME/puppet-master/providers/<provider_entry_id>/`; macOS account data uses `~/Library/Application Support/Puppet Master/providers/<provider_entry_id>/`. Windows account data uses `%APPDATA%\\Puppet Master\\providers\\<provider_entry_id>\\`; the family root may also be displayed as `%APPDATA%\\Puppet Master\\providers\\`. The portable path family is `/puppet-master/providers/`, with `/Puppet` and `/providers/` path segments treated as exact platform spelling, not semantic provider-family labels. PM MUST keep account-isolation path ownership concrete for Linux/macOS/Windows and must not hand-wave filesystem ownership for CLI-backed providers.
- Each selectable account-like unit gets a stable PM-owned child root under that provider base: direct-account-like roots use `.../accounts/<account_id>/` and the `/accounts/<account_id>/` path family, while CLI account roots use `.../accounts/<account_id>/root/`, with `/root/` as the runnable CLI home segment under `/accounts/`.
- Retired Gemini CLI root/provisioning evidence (`GEMINI_CLI_HOME`, `fresh-home`, `fresh-profile`, `/.gemini/settings.json`, `oauth_creds.json`, `state.json`, `installation_id`, and `projects.json`) is compatibility/source-lineage only. PM must not create active Gemini CLI account roots or import Gemini CLI auth. Antigravity CLI account/profile roots are owned by the `agy` setup contract and must not reuse `GEMINI_CLI_HOME`.
- Gemini auth states are richer than a binary logged-in flag. `oauth_logged_out`, `oauth_logged_in`, `oauth_needs_project_context`, `oauth_needs_configuration`, and `api_key_configured` are distinct setup/readiness states. `oauth_needs_configuration` may be account-scoped when the selected account lacks project, billing, trust, or credential context; provider-scoped setup state is allowed only when every account under that provider entry shares the same missing configuration.
- Gemini OAuth project-context handling is tier-aware. Free-tier onboarding can proceed without a configured Google Cloud project id when the provider-managed project path is valid; non-free tiers can require an explicit configured Google Cloud project id before the account reaches `Ready`. `validation_required` is surfaced before onboarding continues when PM cannot prove the selected project/account context; provider-facing `validation-required` wording maps to that canonical state. A configured project id takes precedence over any previously persisted `managed-project` id from provider-native state.
- Gemini Direct remains API-key-only. Active Google-owned CLI-runtime setup is Antigravity CLI and may expose Google OAuth/system-keyring, ADC, or local profile-root paths only where verified. Gemini CLI OAuth, API-key, and Vertex/Google credential families are retired/source-lineage only and must not appear as active setup rows.
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
- In PM's provider model, `gemini` is Gemini Direct and remains an active direct API provider entry. `gemini_cli` is retired/source-lineage only and must not be implemented as an active entry. Antigravity CLI is its own active CLI-runtime provider entry with multi-model support and requested/effective model-routing evidence.
- Active CLI-runtime capability gating for Antigravity is provider + account/profile + setup-state aware; Gemini CLI-only capability branches are retired and cannot be requested as active PM capabilities.
- Gemini Direct and Antigravity CLI capability declarations must fit the shared provider capability model in Plans/Models_System.md. Retired `gemini_cli` tokens remain auditable only as compatibility/source-lineage vocabulary.
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
- show one shared Gemini-family usage surface for active entries such as Gemini Direct and Antigravity CLI where they expose usage/account state; retired Gemini CLI terms may appear only as source-lineage or migration diagnostics, not as a top-level usage page
- label OAuth-backed views as `Gemini quota` when authoritative quota semantics are available
- label API-key/local-only views with source-qualified wording such as `Gemini (estimated)` when authoritative quota data is not available
- expose `source_confidence` so users can tell whether quota pressure is authoritative, structured, heuristic, or local-only; legacy `signal_confidence` is an import/display alias only

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

Gemini setup no longer uses a one-card mixed OAuth/API grouping. The `9. GUI requirements` owner direction is that Agent-Config presents Gemini Direct as a direct API-key provider and Antigravity CLI as the active Google-owned CLI-runtime provider. Retired Gemini CLI rows must not appear as active setup paths; if shown for migration diagnostics, they must be explicitly labeled source-lineage/retired.

Family-pool guardrails: PM may only auto-select a unit when its effective capabilities satisfy the requested model/media/effort/tooling needs, including `/media/effort/tooling` capability checks. The run record must preserve the requested provider entry and effective provider entry explicitly, and PM must never silently route a request into retired Gemini CLI-only features. Antigravity and Gemini Direct requested/effective transitions require explicit disclosure.

The anti-duplication rule from the older one-card direction is preserved as a no-`pseudo-providers` rule: the GUI may group related provider rows under a family surface, but it MUST NOT mint fake OAuth/API-key pseudo-providers that compete with real entries such as `gemini` and `antigravity_cli`. Retired `gemini_cli` may appear only as compatibility/source-lineage vocabulary. Within each real entry or family grouping, account rows expose auth-surface badges and derived auth `/configuration/availability` state rather than hiding readiness inside a provider-level card.

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
- Antigravity CLI setups may require Google OAuth/system-keyring, ADC, local profile-root validation, model-list probing, prompt-output proof, and trust/plugin validation before reaching `Ready`.
- Antigravity setup may expose `Sign In with Google`, `Use a Google Cloud project`, and `Application Default Credentials (ADC)` style paths only where locally verified. These setup paths must use the Antigravity `agy` contract and must not reuse retired Gemini CLI labels or `GEMINI_CLI_HOME`.
- Retired Gemini CLI setup copy such as `Use Vertex AI`, `Best for Google Cloud project-based usage with ADC, service accounts, or Google Cloud API keys`, `Sign In with Google`, `Use Gemini API Key`, `Vertex ADC/service-account/API-key`, and `GEMINI_CLI_HOME` remains source-lineage only unless reintroduced by a later active owner contract.
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

#### Retired CLI token flow (Gemini CLI lineage)
The old Gemini CLI token/import flow is not an active PM setup path. Exact tokens remain only for compatibility/source-lineage: `Gemini CLI`, `Import Existing Gemini CLI Auth`, native OAuth/browser flow, credential cache, `credential_ref`, and `GEMINI_CLI_HOME`. Active CLI-runtime setup for this lane belongs to Antigravity CLI and must be proven through the `agy` setup/probe contract.

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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Multi-Account.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### MA-002 - Owner Requirements And Vocabulary Boundary

```yaml
plan_unit_id: MA-002
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Plans/Multi-Account.md is canonical live specification text for product, runtime, storage, UI, and governance
  account behavior. Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology
  in this document. The shared conversational/runtime boundary preserves Puppet Master naming, DRY compliance,
  deterministic defaults, implementation status, and source cross-references.
gui_related: true
gui_classification_reason: The unit preserves a source span that explicitly includes UI among the owner-section requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Compatibility-only vocabulary is not treated as live canonical terminology.
- The shared conversational/runtime boundary remains visible to downstream consumers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_owner_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: multi_account_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0004
preserved_exact_tokens:
- Canonical owner-section requirements
- Requested/effective account identity contract
- Shared conversational/runtime boundary
- Compatibility-only source vocabulary
- Puppet Master
- Plans/DRY_Rules.md
- Plans/Contracts_V0.md
- Plans/Decision_Policy.md
negative_constraints: []
compatibility_only_notes:
- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Multi-Account.md owns the requested/effective account terminology used by this document.
- Cross-references remain source references and do not supersede owner documents.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: The covered spans are narrow owner/vocabulary scaffolding and do not require further splitting.
```

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into canonical provider account/profile requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### MA-062 - Provider Route Credential Profiles And Entitlement States

```yaml
plan_unit_id: MA-062
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Provider accounts are route-specific credential/profile records. PM must represent Gemini Direct, Antigravity CLI public `agy` text/coding rows, the separate Antigravity OAuth/internal `gemini-3.1-flash-image` generated-image route, Claude Code, Cursor session/API-key/SDK routes, Codex/OpenAI API and subscription-backed Codex image generation, GitHub Copilot direct hosted API, OpenCode server, Kimi For Coding, MiniMax global/CN, Z.AI/Zhipu standard/coding/Anthropic routes, Alibaba/Qwen global/CN coding-plan routes, and other coding-plan families as separate account/profile rows where their auth, billing, region, entitlement, quota, transport, support-state, or proof surface differs. Unpurchased or inaccessible plans compile as disabled, capability-gated, unverified, or separate-profile rows, not open purchase blockers.
gui_related: true
gui_classification_reason: Account/profile rows, setup states, entitlement badges, and provider picker availability are user-visible settings behavior.
depends_on: [MS-113, CV-292]
unblocks: [F3-400, F3-401, UF-075]
acceptance_criteria:
  - Account/profile rows preserve route-specific auth, billing, region, entitlement, quota, and transport differences.
  - OpenAI API-key image routes and OpenAI/Codex subscription-backed image-generation routes are separate account/profile surfaces.
  - Antigravity public `agy` CLI rows and Antigravity OAuth/internal generated-image rows are separate account/profile surfaces when auth, endpoint, support-state, or proof custody differs.
  - Cursor API key setup copy points users to the Cursor dashboard API keys section without storing the key in Plans or ledgers.
  - Lack of additional purchased plans does not leave compile blocked when a disabled/gated/unverified row is accepted.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: account_profile_route_collapse
reasoning_tier: high
context_scope: provider_route_credential_profiles
implementation_surfaces: [Plans/Multi-Account.md, Plans/Models_System.md, Plans/FinalGUISpec.md, Plans/usage-feature.md]
node_compile_hint: {mode: provider_route_credential_profiles, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0011
  - pldg-20260624-001-provider-updates:atom-0082
  - pldg-20260624-001-provider-updates:atom-0103
  - pldg-20260624-001-provider-updates:atom-0138
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
  - pldg-20260624-001-provider-updates:atom-0144
source_atom_ids: [atom-0011, atom-0022, atom-0034, atom-0048, atom-0049, atom-0064, atom-0068, atom-0070, atom-0071, atom-0082, atom-0084, atom-0097, atom-0100, atom-0103, atom-0104, atom-0116, atom-0118, atom-0119, atom-0124, atom-0125, atom-0127, atom-0128, atom-0129, atom-0131, atom-0132, atom-0137, atom-0138, atom-0142, atom-0143, atom-0144]
preserved_exact_tokens: ["Google OAuth", "Application Default Credentials (ADC)", "system keyring", "CURSOR_API_KEY", "--api-key", "cursor-agent login", "Cursor SDK", "Cloud Agents API", "https://cursor.com/dashboard/", "API keys section", "GitHub OAuth/PAT-style", "Team Plan keys are not interchangeable", "OpenAI/Codex subscription-backed", "Antigravity CLI", "agy", "gemini-3.1-flash-image", "v1internal:generateContent", "disabled", "capability-gated", "unverified", "separate-profile"]
negative_constraints:
  - Do not store user-supplied API keys, OAuth URLs, tokens, or account identifiers in Plans, ledgers, logs, or artifacts.
  - Do not collapse global and CN/regioned provider routes into one account/profile row.
  - Do not ask Jared to buy additional subscriptions to complete this planning lane.
  - Do not collapse Antigravity public `agy` CLI text/coding rows with the separate OAuth/internal `gemini-3.1-flash-image` generated-image route.
owner_hints: [Plans/Multi-Account.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md, Plans/usage-feature.md]
```

### MA-063 - Direct Provider Subscription And Usage Authority Boundaries

```yaml
plan_unit_id: MA-063
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Direct-provider subscription and usage authority is provider-specific. GitHub Copilot readiness comes from the direct hosted API and Copilot entitlement token, not `copilot` CLI bridging. Claude Code status-line `rate_limits` is the accepted usage source for Claude Code rather than OAuth usage polling. OpenAI/Codex subscription image generation uses the user's OpenAI/Codex subscription/account route and is separate from API-key billing. Z.AI/Zhipu plan, overload, balance, and resource-package states remain upstream/account states that PM surfaces accurately rather than treating as user-action blockers.
gui_related: true
gui_classification_reason: Subscription, usage, account setup, and blocked-state disclosures are visible provider settings behavior.
depends_on: [MA-062, CV-292]
unblocks: [UF-074, F3-400]
acceptance_criteria:
  - Direct-provider usage and entitlement checks are tied to the correct provider/account route.
  - GitHub Copilot direct hosted API is not blocked on optional CLI prompt flow.
  - Claude Code usage can consume status-line `rate_limits` fields.
  - Z.AI/Zhipu account/upstream failures surface as capability-gated or blocked states with concrete reasons.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_entitlement_source_drift
reasoning_tier: high
context_scope: provider_usage_entitlement_authority
implementation_surfaces: [Plans/Multi-Account.md, Plans/usage-feature.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: direct_provider_subscription_usage_boundaries, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0106
  - pldg-20260624-001-provider-updates:atom-0129
  - pldg-20260624-001-provider-updates:atom-0137
  - pldg-20260624-001-provider-updates:atom-0138
source_atom_ids: [atom-0068, atom-0094, atom-0106, atom-0122, atom-0129, atom-0131, atom-0132, atom-0137, atom-0138]
preserved_exact_tokens: ["rate_limits", "five_hour.used_percentage", "five_hour.resets_at", "seven_day.used_percentage", "seven_day.resets_at", "statusLine", "refreshInterval", "GitHub Copilot", "https://api.githubcopilot.com", "OpenAI/Codex subscription", "glm-5.1", "glm-5.2", "glm-5v-turbo", "plan-not-included", "balance/resource gating"]
negative_constraints:
  - Do not poll or store secrets where provider-owned status-line or direct API usage metadata is sufficient.
  - Do not treat optional CLI auth failures as blockers for direct hosted provider routes.
  - Do not hide upstream/account gating behind generic provider failure copy.
owner_hints: [Plans/Multi-Account.md, Plans/usage-feature.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md]
```

### MA-003 - Provider Runtime Scope And Entry Count

```yaml
plan_unit_id: MA-003
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Multi-account support covers an open-ended Provider -> models catalog across direct, CLI-runtime, and server-bridge
  routes including Claude Code, Codex/OpenAI, Gemini Direct, Antigravity CLI, GitHub Copilot, Cursor, OpenCode, and
  coding-plan providers where accepted. Routing is shared provider-runtime behavior for all provider-using roles, and
  provider-touched /web work maps through the provider capability registry or adapter contract. The old exactly-seven
  provider inventory and active Gemini CLI split are retired/source-lineage only.
gui_related: false
gui_classification_reason: The unit defines runtime/provider scope and account identity rather than GUI presentation.
split_recommended: true
depends_on:
- MA-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Multi-account routing remains shared provider-runtime behavior rather than Orchestrator-only behavior.
- Gemini Direct remains active and Gemini CLI is retired/source-lineage only.
- Antigravity CLI is a separate active CLI-runtime provider entry.
- The old exactly-seven provider-entry inventory remains traceable only as retired source-lineage.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_runtime_scope_currentness
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_runtime_scope_currentness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0005
preserved_exact_tokens:
- Purpose
- Scope
- Provider/runtime scope
- Gemini scope
- Provider-entry count
- Gemini Direct
- Gemini CLI
- Claude Code
- Codex
- GitHub Copilot
- Cursor
- OpenCode
negative_constraints:
- Multi-account routing is not an Orchestrator-only feature.
- Provider-touched /web work must not depend on a brittle provider-doc layout.
compatibility_only_notes:
- The exact phrase "Gemini Direct and Gemini CLI remain separate provider entries" is retained only as retired source-lineage; active entries are Gemini Direct and Antigravity CLI.
- The exact phrase "exactly seven provider entries" is retained only as retired source-lineage; the current catalog is open-ended Provider -> models.
stale_retired_dispositions:
- Active Gemini CLI provider-entry support is retired by pldg-20260624-001-provider-updates.
- The seven-provider inventory is retired by the open-ended provider catalog.
owner_boundary_notes:
- Provider-runtime identity applies across assistant, interviewer, builder, package/seam, and governance/execution actors while preserving separate actor ontologies.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Multi-Account-S0005 is intentionally split into provider scope, policy, pool, recovery, and actor identity units.
```

### MA-004 - Effective Policy Visibility And Storage Alignment

```yaml
plan_unit_id: MA-004
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Multi-account auto-switching is on by default for provider-using roles unless policy disables it. Policy is
  primarily project-owned, runs snapshot the effective policy space at run start, and each attempt or message records
  the effective account actually used. Requested provider/model/effort/persona/auth mode/account policy and effective
  provider/model/effort/persona/auth mode/account remain visible and queryable. Account selection and env/config
  wiring belong to the Provider contract, state lives in seglog and redb, secrets stay outside canonical storage, GUI
  requirements remain UX-only, and same-provider accounts are not interchangeable buckets.
gui_related: true
gui_classification_reason: The unit includes GUI requirements and user-visible requested/effective disclosure.
split_recommended: true
depends_on:
- MA-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Requested and effective provider/account identity remain visible and queryable.
- Account selection remains part of the Provider contract.
- Secrets remain outside canonical storage.
- Same-provider accounts are not flattened into interchangeable buckets.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: requested_effective_policy
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: requested_effective_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0005
preserved_exact_tokens:
- Default behavior
- Policy ownership
- Requested/effective identity
- Rewrite alignment
- Non-goal
- seglog
- redb
- no Iced/Slint lock-in
negative_constraints:
- Same-provider accounts are not treated as an interchangeable bucket.
- Secrets remain outside canonical storage.
- GUI requirements remain UX-only with no Iced/Slint lock-in inside this document.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider contract owns account selection and env/config wiring.
- Plans/storage-plan.md owns canonical storage mechanics referenced by this account contract.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md#42-authpolicy, ContractName:Plans/storage-plan.md'
split_recommendation_reason: Multi-Account-S0005 is split so GUI disclosure and backend routing concerns remain separately addressable.
```

### MA-005 - Account Pool Shape And Usage Pressure Ownership

```yaml
plan_unit_id: MA-005
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Account-pool routing preserves account-scoped policy, per-request selection, failover caps, async-local context,
  recovery signals, active-account state, operator-visible history, TUI surfaces, provider-specific records, pool and
  fallback state, settings-spec and GUI coverage, Usage-owned account pressure, requested/effective gap closure,
  current effective account displays, and switch policy thresholds without hiding provider account selection or
  inventing a second quota subsystem beside Usage.
gui_related: true
gui_classification_reason: The unit includes settings-spec, GUI coverage, TUI surfaces, and current account display requirements.
split_recommended: true
depends_on:
- MA-004
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Account-pool routing exposes account, fallback, pressure, and effective_account_id state.
- Settings and GUI coverage do not hide provider account selection or switch thresholds.
- Usage remains the owner for account pressure and quota-pressure projection.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_pool_usage_pressure
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_pool_usage_pressure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0005
preserved_exact_tokens:
- Account-pool runtime shape
- Provider product shape
- Pool and fallback state
- Settings-spec and GUI coverage
- Usage-owned account pressure
- Requested/effective account gap closure
- Current effective account state
- Switch policy thresholds
- effective_account_id
- signal_confidence
negative_constraints:
- Provider account selection, account pool policy, and switch thresholds must not stay under-specced or hidden.
- PM must not invent a second independent account pressure or quota subsystem beside Usage.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/usage-feature.md consumes account pressure and quota projection instead of being replaced by this document.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Multi-Account-S0005 is split so pool/runtime pressure and actor/audit boundaries can compile independently.
```

### MA-006 - Recovery Audit And Owner Boundary Records

```yaml
plan_unit_id: MA-006
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Multi-account recovery records preserve cross-owner references, recovering provider control states, project/worktree
  account context, GitHub auth disclosure, switch availability evidence, actor and target identity separation,
  storage-facing audit identity, behavior-driving audit flags, shared runtime boundaries, and rewrite-era decision
  references without making consumer docs or provider-native labels the account owner.
gui_related: false
gui_classification_reason: The unit defines audit, owner-boundary, and recovery records rather than direct GUI layout or controls.
split_recommended: true
depends_on:
- MA-005
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Cross-owner recovery references remain auditable in recovery records.
- Provider-native labels remain separate from actor and target identity.
- Behavior-driving facts remain distinct from audit-only facts.
- Shared-runtime account behavior does not make the CLI bridge the account owner.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: recovery_audit_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: recovery_audit_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0005
preserved_exact_tokens:
- Cross-owner recovery references
- Recovering provider control
- Project/worktree account context
- GitHub auth disclosure
- Switch availability state
- Actor and target identity
- Storage-facing audit identity
- Behavior-driving audit flags
- Shared runtime boundary
- Rewrite-era decision references
- github_api:github.com/<login>
- approve_continue
- TierContext
negative_constraints:
- Provider-native identity must not be treated as the actor.
- Shared-runtime account behavior consumed by CLI_Bridged_Providers does not make the CLI bridge the account owner.
- Rewrite-era decision references are not substitutes for the live Multi-Account contract.
compatibility_only_notes: []
stale_retired_dispositions:
- Rewrite-era Decision_Log entries are preserved as decision-history references, not live owner alternatives.
owner_boundary_notes:
- Executor, GitHub auth, UI command, and orchestrator integration docs are recovery consumers unless their ContractRefs say otherwise.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Recovery/audit ownership is split from GUI pressure and actor/run scope.
```

### MA-007 - Actor Run Persona And Control Loop Account Identity

```yaml
plan_unit_id: MA-007
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Requested/effective account identity applies across assistant turns, interviews, builders, orchestrator nodes,
  attempts, runs, documents, and reviews while preserving distinct actor ontologies. Serialization, account/persona
  runtime identity, role-scoped confidence, pre-send and post-send control loops, GPT account fields, active versus
  historical identity, and builder/runtime scopes inherit the same account contract without creating feature-local
  account state.
gui_related: false
gui_classification_reason: The unit covers runtime identity propagation and control loops rather than visual presentation.
split_recommended: true
depends_on:
- MA-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Distinct actor/run kinds share account truth without collapsing ontologies.
- Serialization carries account/persona runtime identity instead of feature-local account state.
- Active account context remains distinct from historical switch records and prior attempt identity.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: actor_account_identity
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: actor_account_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0005
preserved_exact_tokens:
- Actor/run kind coverage
- Serialization and persona account scope
- Role-scoped confidence
- Pre/post-send control loop
- GPT account fields
- Active versus historical identity
- Builder/runtime account scope
- requested_account
- effective_account
- generated://
negative_constraints:
- Runtime records must preserve distinct actor ontologies while sharing account truth.
- Feature-local account state must not replace account/persona runtime identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Assistant, interviewer, builder, and orchestrator surfaces consume the same requested/effective account contract.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Actor identity propagation is split from pool pressure and recovery audit records.
```

### MA-008 - Source Reference And Evidence Inventory

```yaml
plan_unit_id: MA-008
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  The multi-account references and assessment preserve the source inventory for Plans/rewrite-tie-in-memo.md,
  Plans/storage-plan.md, Plans/usage-feature.md, AGENTS.md, claude-nonstop, OpenCode PR #11832, and OpenCode PR #8536.
  The assessment records that the design evidence is sufficient to reverse-engineer multi-account behavior for covered
  providers, with remaining work in the Rust port and provider-specific clients.
gui_related: true
gui_classification_reason: The preserved reference inventory includes UI/storage alignment and Usage view requirements.
split_recommended: false
depends_on:
- MA-003
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Reference table rows remain traceable.
- External design-source rows remain traceable.
- The Q/A assessment remains preserved as source evidence, not as an executable task.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: source_evidence_inventory
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: source_evidence_inventory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0011
preserved_exact_tokens:
- Plans/rewrite-tie-in-memo.md
- Plans/storage-plan.md
- Plans/usage-feature.md
- AGENTS.md
- claude-nonstop
- OpenCode PR #11832
- OpenCode PR #8536
- Do we have what we need to reverse-engineer multi-account and apply it to Puppet Master for all covered providers?
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- External references are design evidence and do not become PM owner docs.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: The covered evidence spans are narrow enough for one source-inventory PlanUnit.
```

### MA-009 - Requested Effective Account Identity Envelope

```yaml
plan_unit_id: MA-009
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Runtime, bridged-provider, and permission-facing envelopes that carry account identity preserve requested_account_id,
  requested_account_policy, requested_account_binding, effective_account_id, effective_provider_identity,
  execution_role, and operational_identity. provider_account_id is retired from canonical account-identity naming and
  remains only subordinate provider-native metadata. Assistant, chat, interview, and builder actors share provider/runtime
  identity semantics with Orchestrator while preserving actor kind and execution context.
gui_related: false
gui_classification_reason: The unit defines runtime envelope fields and actor boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- MA-004
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- requested_account_id exists alongside requested_account_policy.
- requested_account_binding governs none, preferred, and required fallback behavior.
- provider_account_id remains provider-native metadata rather than canonical identity.
- Cross-surface consumers preserve actor kind and execution context.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_identity_envelope
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_identity_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0009
preserved_exact_tokens:
- requested_account_id
- requested_account_policy
- requested_account_binding
- effective_account_id
- effective_provider_identity
- execution_role
- operational_identity
- provider_account_id
- none
- preferred
- required
negative_constraints:
- Cross-surface consumers must not collapse actor kinds into orchestration-only terms.
compatibility_only_notes: []
stale_retired_dispositions:
- provider_account_id is retired from canonical account-identity naming and kept only as provider-native metadata.
owner_boundary_notes:
- This section owns the canonical requested/effective account identity contract for all provider-using actors.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md'
split_recommendation_reason: The covered envelope spans are focused on one account identity contract.
```

### MA-010 - Provider Capability Inventory And Canon Correction

```yaml
plan_unit_id: MA-010
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  The provider inventory preserves known capabilities and remaining Rust/client work for Claude Code, Codex, Gemini,
  Copilot, and Cursor, plus resolved gaps for Gemini usage, Copilot usage, Cursor config isolation, Codex multi-account,
  and Rust idioms. Current canon must not revive stale CLI-centric assumptions for Codex or GitHub Copilot; Codex and
  GitHub Copilot are direct providers, Cursor isolation uses runnable cursor-agent account boundaries under PM-owned
  HOME/XDG roots, and Gemini quota project-context can affect effective quota identity.
gui_related: false
gui_classification_reason: The unit covers provider capability inventory and stale-canon correction rather than GUI presentation.
split_recommended: false
depends_on:
- MA-008
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Provider capability and gap tables remain traceable.
- Stale CLI-centric assumptions for Codex and GitHub Copilot are not revived.
- Cursor account isolation remains tied to PM-owned HOME/XDG roots.
- Gemini quota project-context remains part of effective quota identity.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_inventory_correction
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_inventory_correction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0013
preserved_exact_tokens:
- Claude Code
- Codex
- Gemini
- Copilot
- Cursor
- Cloud Quotas API
- GOOGLE_CLOUD_PROJECT
- GOOGLE_APPLICATION_CREDENTIALS
- No CURSOR_CONFIG_DIR
- Current-canon correction
- cursor-agent
negative_constraints:
- Current canon must not revive stale CLI-centric assumptions for Codex or GitHub Copilot.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale CLI-centric Codex and GitHub Copilot assumptions are correction inputs only.
owner_boundary_notes:
- Provider capability inventory remains evidence for Multi-Account routing and does not replace provider-specific owner docs.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: Provider inventory and stale-canon correction are cohesive in this bounded window.
```

### MA-011 - Rewrite Alignment And Current PM Context

```yaml
plan_unit_id: MA-011
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Account registry, active index, cooldowns, and usage cache live in redb or a temporary app-data JSON until redb,
  while usage and rate-limit events live in seglog. Account selection and env/config wiring are part of the Provider
  contract. GUI and usage views are UX requirements only, with no Iced/Slint lock-in from this document. The historical
  Rust/Iced and platform_specs.rs context is preserved as source context, while future native auth for Codex, Copilot,
  and Gemini uses OpenCode PR #11832-style stores and per-request context.
gui_related: true
gui_classification_reason: The unit explicitly preserves GUI/usage UX requirements and no Iced/Slint lock-in language.
split_recommended: false
depends_on:
- MA-010
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Storage alignment remains redb plus seglog, with temporary JSON only as an interim app-data option.
- Provider abstraction owns account selection and env/config wiring.
- Historical Rust/Iced wording is preserved as source context and does not authorize legacy app recreation.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_alignment_context
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: rewrite_alignment_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0014
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0015
preserved_exact_tokens:
- Storage
- Provider abstraction
- UI
- Stack
- Future
- Rust/Iced
- PlatformConfig
- platform_specs.rs
- OpenCode PR #11832
negative_constraints:
- No Iced/Slint commitment in this document authorizes recreating the removed legacy Iced app.
compatibility_only_notes:
- Rust/Iced is preserved as historical source context only.
stale_retired_dispositions:
- The removed legacy Iced app remains retired unless explicitly requested elsewhere.
owner_boundary_notes:
- Plans/storage-plan.md owns storage mechanics; Plans/Multi-Account.md owns account-selection requirements.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: Rewrite alignment and current PM context are narrow enough for one PlanUnit.
```

### MA-012 - Provider Entry Identity And Coding Plan Boundaries

```yaml
plan_unit_id: MA-012
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Each provider entry represents one concrete runtime surface, not a loose vendor family label. provider_family_id is
  additive grouping metadata and must not replace provider_entry_id. Provider entries declare allowed auth_surface values,
  preserve provider_entry_id, provider_family_id, and transport_kind, keep provider_identity descriptive and provider-native,
  and preserve direct coding-plan provider boundaries for MiniMax, Z.AI, Zhipu AI, and Alibaba coding-plan endpoints and keys.
gui_related: false
gui_classification_reason: The unit defines provider registry identity and API boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- MA-011
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Concrete provider_entry_id is not replaced by provider_family_id.
- Provider entries declare supported auth_surface values.
- transport_kind remains direct_api, cli_runtime, or server_bridge.
- Coding-plan provider identities preserve vendor-specific API boundaries.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_entry_identity
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_entry_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0016
preserved_exact_tokens:
- provider_entry_id
- provider_family_id
- transport_kind = direct_api | cli_runtime | server_bridge
- gemini
- gemini_cli
- cursor_cli
- claude_code_cli
- github_copilot
- opencode
- MiniMax Coding Plan
- Z.AI Coding Plan
- Zhipu AI Coding Plan
- Alibaba Coding Plan
- sk-sp-...
negative_constraints:
- provider_family_id is additive grouping metadata only and MUST NOT replace the concrete provider entry id.
- Coding-plan provider identity must not collapse into a generic OpenAI-compatible or pay-as-you-go bucket.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider-entry identity fields are part of Agent-Config/provider registry canon.
- Requested/effective runtime handles owned by Orchestrator or Prompt Pipeline snapshots are not renamed by these provider-entry fields.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Provider-entry identity and coding-plan API boundaries are cohesive in this span.
```

### MA-013 - Account Profile Schema And Stable Account Identity

```yaml
plan_unit_id: MA-013
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Account-backed providers store ordered account rows with stable ids. The locked account-profile schema and minimum
  fields preserve account_id, provider_id, label, auth_surface, enabled, priority, provider_identity, credential_ref,
  configured_project_id, selected_billing_entity_id, threshold and retry controls, cooldown, availability, configuration,
  credential state, and user-facing status. account_id is the internal stable key, provider_identity is descriptive
  provider-native metadata only, secrets remain outside config/state stores, auth families that change quota semantics
  remain separate account rows, and Codex and Gemini account examples preserve auth-family separation.
gui_related: false
gui_classification_reason: The unit defines backend account schema and identity constraints rather than GUI presentation.
split_recommended: true
depends_on:
- MA-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- account_id remains the internal stable key.
- provider_identity remains descriptive provider-native metadata only.
- Secrets and tokens stay outside config and state stores.
- Auth families that change quota semantics remain separate account rows.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_profile_schema
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_profile_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0017
preserved_exact_tokens:
- account_id
- provider_id
- label
- auth_surface
- enabled
- priority
- provider_identity
- credential_ref
- configured_project_id
- selected_billing_entity_id
- availability_state
- configuration_state
- credential_state
- active | expired | revoked | error
- Codex `ChatGPT`
- Codex `API key`
- Gemini direct API-key accounts
- Gemini CLI auth-backed rows
negative_constraints:
- provider_identity is descriptive provider-native metadata only.
- Actual /tokens/keys remain only in OS credential storage.
- Separate auth families that change quota semantics remain separate account rows.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The canonical account-registration shape may be extended by additive runtime/health fields without replacing canonical keys.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Multi-Account-S0017 is split between account schema and credential/auth-surface validation.
```

### MA-014 - Credential Reference And Auth Surface Validation

```yaml
plan_unit_id: MA-014
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  credential_ref is a non-secret pointer to credential storage, formatted as credential_store:key_path, with supported
  stores os_keychain, env, file, and cli. auth_surface describes credential consumption through header_bearer,
  header_api_key, deprecated query_param, cli_managed, or oauth_token. Each provider definition specifies supported
  auth_surface values so the HTTP client can attach credentials correctly and account validation rejects incompatible
  pairings early.
gui_related: false
gui_classification_reason: The unit defines credential indirection and validation semantics rather than GUI presentation.
split_recommended: true
depends_on:
- MA-013
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- credential_ref remains a pointer and never the secret itself.
- Supported credential_ref stores remain auditable.
- query_param remains deprecated and warns before use.
- Provider definitions validate supported auth_surface values early.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: credential_auth_surface
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: credential_auth_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0017
preserved_exact_tokens:
- credential_ref
- credential_store
- key_path
- os_keychain
- env
- file
- cli
- os_keychain:pm/openai/account_abc123
- env:OPENAI_API_KEY
- file:~/.config/pm/credentials/gemini_cli.json
- cli:gemini/default
- header_bearer
- header_api_key
- query_param
- cli_managed
- oauth_token
negative_constraints:
- credential_ref is a pointer to where the credential lives, never the secret itself.
- query_param is deprecated and PM should warn before use.
compatibility_only_notes: []
stale_retired_dispositions:
- query_param is deprecated for API keys in query strings.
owner_boundary_notes:
- Credential attachment is validated through provider definitions and HTTP/client behavior.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Credential references are separated from account profile identity so secret handling remains independently addressable.
```

### MA-015 - Runtime Resolution Envelope And Non-Secret Handles

```yaml
plan_unit_id: MA-015
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Selectable unit and runtime resolution preserve the canonical account-profile row schema with non-secret credential
  handles and no /tokens/keys in project config, redb state, or logs. Runtime records preserve requested_account_id,
  requested_account_binding, requested_account_policy, effective_account_id, provider_account_id, login, auth_realm,
  effective_provider_identity, execution_role, operational_identity, selectable_unit_id, resolution_outcome,
  reason_codes[], provider family, transport, connection profile, health, pressure, and instruction projection state.
gui_related: false
gui_classification_reason: The unit defines runtime snapshot fields and non-secret account handles rather than GUI presentation.
split_recommended: true
depends_on:
- MA-014
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Required runtime fields remain present in requested/effective records.
- credential_locator or credential_ref remains the non-secret OS credential handle.
- /tokens/keys never enter project config, redb state, or logs.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_resolution_envelope
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: runtime_resolution_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0018
preserved_exact_tokens:
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
- instruction_projection_state?
- /tokens/keys
negative_constraints:
- Actual /tokens/keys never enter project config, redb state, or logs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime resolution consumes Auth, GitHub credential-store, Prompt Pipeline, and assistant navigation contracts through preserved ContractRefs.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#4. Auth contracts, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules), Plans/GitHub_API_Auth_and_Flows.md#Credential store keying (canonical), Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/assistant-chat-design.md#Canonical navigation model'
split_recommendation_reason: Multi-Account-S0018 is split between runtime envelope fields, selectable-unit identity, and permission-visible labels.
```

### MA-016 - Selectable Unit Identity And Registry Boundary

```yaml
plan_unit_id: MA-016
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  selectable_unit is the runtime candidate PM can choose for an attempt. unit_id is stable within the provider registry,
  provider_entry_id links the unit to the concrete runtime surface, provider_family_id preserves pooling context, and
  unit_kind distinguishes direct_account, cli_account_root, and server_profile. Runtime snapshots preserve root_path,
  health_state, pressure_state, last_usage_snapshot, and last_cooldown_snapshot. Provider-registry-only discovery
  timestamps, /status caches, and shared-overlay advanced knobs stay internal unless copied into requested/effective evidence.
gui_related: false
gui_classification_reason: The unit defines runtime candidate and registry boundaries rather than GUI presentation.
split_recommended: true
depends_on:
- MA-015
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- selectable_unit and unit_id remain stable runtime candidate identifiers.
- direct_account, cli_account_root, and server_profile stay distinct.
- Provider-registry-only discovery timestamps and /status caches do not become canonical run snapshots by default.
- Requested/effective resolver output keeps provider-family, transport, and connection-profile intent distinct from selected units.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: selectable_unit_registry_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: selectable_unit_registry_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0018
preserved_exact_tokens:
- selectable_unit
- unit_id
- provider_entry_id
- provider_family_id
- unit_kind = direct_account | cli_account_root | server_profile
- root_path
- health_state
- pressure_state
- last_usage_snapshot
- last_cooldown_snapshot
- /status
- requested_provider_family_id
- effective_provider_family_id
- requested_transport_kind
- effective_transport_kind
- requested_connection_profile_id
- effective_connection_profile_id
- effective_health_state
- effective_pressure_state
negative_constraints:
- Provider-registry-only discovery timestamps and /status caches stay in provider-registry internals, not canonical run snapshots.
- Effective runtime states are not replacements for account status, generic availability, or provider-native drift records.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider registry state may influence candidate preparation but only copied evidence enters requested/effective runtime records.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#4. Auth contracts, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules), Plans/GitHub_API_Auth_and_Flows.md#Credential store keying (canonical), Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/assistant-chat-design.md#Canonical navigation model'
split_recommendation_reason: Selectable-unit identity is split from runtime envelope fields and permission-visible labels.
```

### MA-017 - Canonical Terms Labels And Permission Carry-Through

```yaml
plan_unit_id: MA-017
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Runtime resolution preserves canonical terms and values for requested_account_id, requested_account_binding,
  requested_account_policy, effective_account_id, provider_account_id, login, account_id, provider_identity,
  canonical account-registration shape, requested/effective execution identity, effective_provider_identity,
  execution_role, operational_identity, and reason_codes[]. User-visible labels include requested account and effective
  account. Stable internal account identity outranks provider-native display metadata, requested/effective account state
  stays explicit, requested state remains recoverable in history, binding distinguishes preference from requirement,
  fallback follows binding, and effective account identity remains available to permission and approval consumers.
gui_related: true
gui_classification_reason: The unit preserves user-visible labels and permission/approval consumer disclosure.
split_recommended: true
depends_on:
- MA-016
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Canonical account terms and values remain addressable.
- requested account and effective account labels remain preserved.
- Stable internal account identity outranks provider-native display metadata.
- Binding governs fallback behavior rather than ad hoc UI or provider policy.
- Effective account identity remains available to permission and approval consumers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_label_permission_carrythrough
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_label_permission_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0018
preserved_exact_tokens:
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- provider_account_id
- account_id is the internal stable key.
- provider_identity is descriptive metadata only.
- requested/effective execution identity
- effective_provider_identity
- execution_role
- operational_identity
- reason_codes
- reason_codes[]
- requested account
- effective account
negative_constraints:
- Stable internal account identity is separate from provider-native display metadata.
- Fallback behavior depends on binding rather than ad hoc UI or provider policy.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Permission and approval consumers receive effective account identity as carry-through evidence.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#4. Auth contracts, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules), Plans/GitHub_API_Auth_and_Flows.md#Credential store keying (canonical), Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/assistant-chat-design.md#Canonical navigation model'
split_recommendation_reason: Permission-visible labels are split from the broader runtime envelope for GUI/consumer traceability.
```

### MA-018 - Auto-Rotation Attempt Boundary And Stickiness

```yaml
plan_unit_id: MA-018
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Multi-account switching happens only at attempt/message boundaries, never mid-attempt. Completed attempts
  belong to the account actually used, the next message or attempt re-resolves, and recovered higher-priority accounts
  do not immediately steal traffic back unless policy and health justify it.
gui_related: false
gui_classification_reason: The unit defines scheduler/runtime switching boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- MA-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Switching remains limited to attempt/message boundaries.
- Soft-threshold pressure does not switch mid-turn except under hard failover conditions.
- Completed attempts remain attributed to the account actually used.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_switch_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_switch_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0019
preserved_exact_tokens:
- Switch boundary
- Never switch mid-attempt
- Soft-threshold boundary
- Completed ownership rule
- Sticky behavior
negative_constraints:
- Soft-threshold auto-switch behavior must not switch mid-turn.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Scheduler account switching is resolved at attempt/message boundaries.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span is split across switch boundary, reason-code, no-fallback, threshold, and manual-control units.
```

### MA-019 - Switch Reason Codes And Runtime State Dimensions

```yaml
plan_unit_id: MA-019
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Scheduler switch records persist normalized PM reason codes rather than UI-only text, while GUI and runtime
  projections keep selectable-unit health, cooldown, usage pressure, and per-attempt resolution outcome as separate state
  dimensions that do not overwrite each other.
gui_related: true
gui_classification_reason: The unit preserves GUI/runtime projection requirements and user-visible switch-state dimensions.
split_recommended: false
depends_on:
- MA-018
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Stable switch reason codes remain persisted.
- Raw provider conditions remain evidence beside normalized PM reasons.
- GUI and runtime projections keep health, cooldown, usage pressure, and resolution outcome separate.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: switch_reason_projection
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: switch_reason_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0019
preserved_exact_tokens:
- soft_threshold_preemptive_switch
- threshold_preemptive_switch
- cooldown_preemptive_switch
- preferred_recovered
- hard_exhaustion_failover
- cooldown_active
- account_unhealthy
- profile_unhealthy
- credentials_expired
- needs_configuration
- provider_disconnected
- model_incompatible
- unsupported-model
- workspace-deactivated
- provider-unhealthy
- health
- cooldown
- usage pressure
- resolution outcome
negative_constraints:
- Runtime state dimensions must not overwrite one another.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider adapters may surface raw provider conditions; PM stores normalized switch reasons in requested/effective snapshots.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Reason-code and projection-state requirements are split from switch timing and threshold logic.
```

### MA-020 - Resolver Ownership And Hard No-Fallback Rule

```yaml
plan_unit_id: MA-020
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: PM owns final selectable-unit resolution, requested/effective disclosure, and cross-provider switching policy.
  Provider-auth account operations mutate metadata while preserving requested/effective history. The hard no-fallback rule
  records blocked reasons instead of silently crossing to another auth surface, provider entry, or account family.
gui_related: false
gui_classification_reason: The unit defines scheduler/resolver ownership and blocking semantics rather than GUI presentation.
split_recommended: false
depends_on:
- MA-019
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- PM owns final selectable-unit resolution and requested/effective disclosure.
- Provider-auth set-active/delete/update operations preserve historical requested/effective records.
- Hard no-fallback cases record blocked reasons instead of silently crossing account boundaries.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: resolver_no_fallback
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: resolver_no_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0019
preserved_exact_tokens:
- /set-active/delete/update
- requested /effective
- /hard
- auth-mode
- Set Preferred
- /control
- needs_configuration
- validation_required
negative_constraints:
- PM must not silently cross to another auth surface, provider entry, or account family when hard no-fallback applies.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider adapters expose facts; PM owns cross-provider switching policy and final selectable-unit resolution.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: Hard no-fallback is split from threshold and cooldown behavior.
```

### MA-021 - Switch Eligibility Signal Weighting And Threshold Evidence

```yaml
plan_unit_id: MA-021
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Auto-switching is allowed only when policy permits and the account has hard exhaustion, projected quota below
  threshold, severe rate-limit pressure, or temporary unavailability/capacity constraints. PM orders evidence from hard
  runtime failure through weaker heuristics, uses authoritative counters for threshold and exhausted states, preserves
  provider windows, and does not promote weak one-off plan warnings into automatic switching.
gui_related: false
gui_classification_reason: The unit covers runtime evidence weighting and threshold semantics rather than visual presentation.
split_recommended: false
depends_on:
- MA-020
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Signal weighting order remains preserved.
- Authoritative remaining counters drive threshold_reached and exhausted transitions.
- Runtime token stats alone do not become hard blocks without authoritative evidence.
- One soft plan-warning does not trigger auto-switch by itself.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: switch_signal_weighting
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: switch_signal_weighting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0019
preserved_exact_tokens:
- hard exhaustion
- projected remaining quota below threshold
- severe rate-limit pressure
- threshold_reached
- exhausted
- 20% remaining
- 10% remaining
- fiveHour
- weekly
- pattern_only_or_inferred
- plan-warning
- plan-pressure
- reset_at
negative_constraints:
- The scheduler must not leave threshold/exhausted transitions undefined when authoritative remaining quota is available.
- PM must not auto-switch purely on one soft plan-warning.
compatibility_only_notes:
- Authoritative threshold semantics are preserved from source for audit compatibility.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/usage-feature.md and provider adapters supply evidence; PM resolves switching policy.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: Threshold evidence is split from cooldown/no-switch and manual control requirements.
```

### MA-022 - No-Switch Cooldown Retry Budget Manual Override And Exhausted Copy

```yaml
plan_unit_id: MA-022
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: PM does not auto-switch when no eligible backup exists, policy forbids it, provider capability does not support
  switching, a hard requested constraint forbids fallback, or explicit recovery is required. Cooldown and retry budget are
  first-class account state, authoritative cooldown sets hard_block until revalidation, manual set-active remains an
  override/debug control, and exhausted account copy remains user-visible when fallback is available.
gui_related: true
gui_classification_reason: The unit preserves user-visible exhausted copy and manual account control behavior.
split_recommended: false
depends_on:
- MA-021
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- No-switch conditions remain explicit.
- cooldown and retry_budget remain first-class account state.
- cooldown_until sets hard_block=true until revalidation after expiry.
- Manual set-active/preferred account controls remain override/debug controls.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cooldown_manual_control
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: cooldown_manual_control
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0019
preserved_exact_tokens:
- cooldown_until
- hard_block=true
- cooldown
- retry budget
- manual set active
- preferred account
- Usage exhausted
- Puppet Master will use another eligible account until this one resets
negative_constraints:
- Manual control does not redefine the default operating model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Manual controls still record requested versus effective account identity and switch reason.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md#42-authpolicy'
split_recommendation_reason: No-switch, cooldown, manual override, and exhausted copy close the S0019 split.
```

### MA-023 - Provider Behavior Matrix

```yaml
plan_unit_id: MA-023
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Provider-specific behavior preserves the provider-entry matrix for Gemini Direct, Antigravity CLI public `agy` rows, separate Antigravity OAuth/internal generated-image route rows, retired Gemini CLI lineage, Cursor CLI, Claude Code CLI, Codex/OpenAI, GitHub Copilot, OpenCode, and accepted coding-plan rows, including identity shape, usage/health signals, recovery and switching notes, and the rule that Codex plan-backed and API-billed usage/cooldowns must not be merged.
gui_related: false
gui_classification_reason: The unit preserves provider behavior data and runtime identity, not direct GUI layout.
split_recommended: true
depends_on:
- MA-022
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- All provider matrix rows remain traceable.
- Antigravity public `agy` and internal generated-image behavior rows remain separate when proof/auth/endpoint differs.
- Codex ChatGPT and API key account families remain separate.
- OpenCode managed and attached server profiles remain distinct.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_behavior_matrix
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_behavior_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
- pldg-20260624-001-provider-updates:atom-0142
- pldg-20260624-001-provider-updates:atom-0143
source_atom_ids: [atom-0142, atom-0143]
preserved_exact_tokens:
- Gemini Direct
- Antigravity CLI
- agy
- gemini-3.1-flash-image
- Gemini CLI
- Cursor CLI
- Claude Code CLI
- Codex
- GitHub Copilot
- OpenCode
- ChatGPT
- API key
- Managed Server
- Attach to Existing Server
negative_constraints:
- PM must not merge plan-backed and API-billed usage/cooldowns.
- PM must not merge public Antigravity `agy` CLI rows and Antigravity OAuth/internal generated-image route rows.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider-specific rows route to their provider owners while Multi-Account owns account identity and switching semantics.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Multi-Account-S0020 is split by provider/root/auth/capability/sharing topics.
```

### MA-024 - Claude Code Account Roots Login Import And Sharing Boundaries

```yaml
plan_unit_id: MA-024
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Claude Code account handling preserves native auth evidence, CLAUDE_CONFIG_DIR profile switching, isolated
  account auth state, selective sharing evidence, narrow auth-bearing import, native login variants, user-facing setup
  actions, and clean logged-out account evidence for isolated roots.
gui_related: true
gui_classification_reason: The unit includes user-facing Claude setup actions and login labels.
split_recommended: false
depends_on:
- MA-023
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Claude account status evidence is recorded rather than inferred blindly.
- CLAUDE_CONFIG_DIR remains the Claude Code profile switching mechanism.
- Import Existing Claude Auth copies only auth-bearing state.
- Login variants and user-facing setup actions remain distinct.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: claude_code_account_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: claude_code_account_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- claude auth status
- 'loggedIn: true'
- 'authMethod: "claude.ai"'
- 'apiProvider: "firstParty"'
- 'subscriptionType: "pro"'
- CLAUDE_CONFIG_DIR
- .claude.json
- claude.json
- clausona
- symlink
- credentials.json
- .credentials.json
- Import Existing Claude Auth
- --email
- --sso
- --claudeai
- --console
- Sign In to Claude
- Sign In to Console/API
- Use SSO
negative_constraints:
- Claude Code config-dir-per-account must not be treated as sufficient for every provider.
compatibility_only_notes: []
stale_retired_dispositions:
- Earlier all-provider config-dir assumptions are incomplete for newer Gemini/Cursor direction.
owner_boundary_notes:
- Claude Code account-local files remain isolated unless a later owner contract promotes overlays.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Claude Code auth/root behavior is separable from Gemini/Cursor/Codex root behavior.
```

### MA-025 - Provider Account Root Layout And Retired Gemini CLI Root Lineage

```yaml
plan_unit_id: MA-025
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: PM-owned provider account roots are keyed by provider_entry_id with explicit Linux, macOS, Windows, and
  portable path families. Selectable account-like units get stable child roots, and CLI account roots use a runnable root
  segment. The old Gemini CLI root-provisioning details are retained only as source-lineage; active CLI-runtime account
  roots for this lane belong to Antigravity CLI and must not reuse GEMINI_CLI_HOME.
gui_related: false
gui_classification_reason: The unit defines filesystem/root provisioning and provider-native state boundaries.
split_recommended: false
depends_on:
- MA-024
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Account-isolation path ownership remains concrete for Linux, macOS, and Windows.
- GEMINI_CLI_HOME remains traceable only as retired Gemini CLI source-lineage.
- Active implementation does not precreate or import Gemini CLI roots.
- Antigravity CLI root/probe behavior is owned by the active Antigravity setup contract.
- Provider-native history, credential, settings, and project-state bleed-through is avoided.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: retired_gemini_cli_root_resurrection
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_root_layout_retired_gemini_cli_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- '$XDG_DATA_HOME/puppet-master/providers/<provider_entry_id>/'
- '~/Library/Application Support/Puppet Master/providers/<provider_entry_id>/'
- '%APPDATA%\\Puppet Master\\providers\\<provider_entry_id>\\'
- /puppet-master/providers/
- /Puppet
- /providers/
- '.../accounts/<account_id>/'
- '.../accounts/<account_id>/root/'
- GEMINI_CLI_HOME
- fresh-home
- fresh-profile
- /.gemini/settings.json
- GEMINI_API_KEY
- GOOGLE_GENAI_USE_VERTEXAI
- GOOGLE_GENAI_USE_GCA
- oauth_creds.json
- state.json
- installation_id
- projects.json
negative_constraints:
- PM must not hand-wave filesystem ownership for CLI-backed providers.
- Do not create active Gemini CLI account roots.
- Do not import Gemini CLI auth as an active setup mode.
- Do not reuse GEMINI_CLI_HOME for Antigravity.
compatibility_only_notes:
- Gemini CLI root/provisioning tokens are preserved only for migration/currentness lineage.
stale_retired_dispositions:
- Gemini CLI managed-root provisioning is retired by CBP-019/MA-062.
owner_boundary_notes:
- Gemini state under GEMINI_CLI_HOME is retired source-lineage only; Antigravity CLI root ownership is separate.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Provider root layout remains cohesive; Gemini CLI root provisioning is retained only as retired filesystem lineage.
```

### MA-026 - Gemini Auth Project Context And Quota Plane Readiness

```yaml
plan_unit_id: MA-026
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Gemini auth states are richer than a binary logged-in flag. OAuth, API-key, and Vertex/Google credential
  families remain distinct auth, billing, quota, project-context, capability, and readiness planes, with requested/effective
  storage vocabulary preserving auth, capability, billing/quota plane, project context, and usage source.
gui_related: true
gui_classification_reason: The unit includes Gemini setup/readiness states and user-visible validation behavior.
split_recommended: false
depends_on:
- MA-025
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini OAuth, API-key, and Vertex/Google credential families remain distinct.
- validation_required is surfaced before onboarding when project/account context cannot be proven.
- configured project id outranks persisted managed-project id.
- Credentials stay out of redb and seglog.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gemini_auth_quota_readiness
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: gemini_auth_quota_readiness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- oauth_logged_out
- oauth_logged_in
- oauth_needs_project_context
- oauth_needs_configuration
- api_key_configured
- validation_required
- managed-project
- PKCE
- /project-context
- requested_auth_mode
- effective_*
- /capability
- billing/quota plane
negative_constraints:
- Gemini OAuth and API-key paths are not interchangeable labels over one key-centric bucket.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Gemini account/runtime records use requested/effective storage vocabulary for auth, capability, billing/quota, project context, and usage source.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Gemini auth/project/quota readiness is split from root layout and capability declarations.
```

### MA-027 - Cursor Agent Home XDG Isolation And Import Boundary

```yaml
plan_unit_id: MA-027
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Cursor account isolation is tied to PM-owned HOME and XDG roots for cursor-agent execution, login, status,
  import, and launch behavior. Editor-oriented user-data flags and Cursor ACP do not replace the account-root boundary,
  and Cursor-owned profile/native state remains account-local unless a later owner contract promotes it.
gui_related: false
gui_classification_reason: The unit defines Cursor account-root and launch isolation rather than GUI presentation.
split_recommended: false
depends_on:
- MA-026
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Fresh HOME/XDG roots remain account-boundary inputs for Cursor probes.
- cursor-agent status under isolated roots is evidence for the isolated account row.
- Import Existing Cursor Auth copies only narrow auth-bearing state.
- Editor user-data flags do not become PM's core Cursor multi-account isolation mechanism.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cursor_account_isolation
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: cursor_account_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- HOME
- XDG_*
- XDG_CONFIG_HOME
- XDG_DATA_HOME
- XDG_CACHE_HOME
- CURSOR_USER_DATA_DIR
- cursor-agent
- cursor-agent login
- NO_OPEN_BROWSER
- cursor-agent status
- Not logged in
- cursor --user-data-dir
- Import Existing Cursor Auth
- ~/.config/cursor/auth.json
- statsig-cache.json
- ~/.cursor/projects/
- Cursor ACP
- /its
negative_constraints:
- Cursor isolation is not a config-path/manual switching model.
- Cursor ACP is not an account-root boundary.
compatibility_only_notes: []
stale_retired_dispositions:
- Editor-facing cursor --user-data-dir assumptions are provider/desktop details only, not the core account isolation contract.
owner_boundary_notes:
- Cursor profile-local/native state remains Cursor-owned and account-local unless promoted by a later owner contract.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Cursor isolation is split from Codex and Gemini provider-root behavior.
```

### MA-028 - Codex Account Roots And Auth Family Separation

```yaml
plan_unit_id: MA-028
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Codex account roots are isolated with CODEX_HOME. Auth probes and authenticated structured execution validate
  account/root state, upstream runtime artifacts remain account-local provider state, and ChatGPT-backed and API-key-backed
  Codex accounts stay separate for switching, usage display, cooldown behavior, and preferred-account policy.
gui_related: false
gui_classification_reason: The unit covers Codex account-root validation and auth-family semantics rather than GUI presentation.
split_recommended: false
depends_on:
- MA-027
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Fresh CODEX_HOME logged-out probes are account-sandbox evidence.
- Upstream Codex runtime artifacts are not shared across PM account rows by default.
- ChatGPT and API-key auth families remain distinct entitlement pools.
- Structured codex exec event output remains valid account/root validation evidence.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: codex_account_root_auth_family
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: codex_account_root_auth_family
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- CODEX_HOME
- auth.json
- codex login status
- codex exec --json
- thread.started
- turn.started
- error
- item.completed
- sessions/
- models_cache
- models_cache.json
- logs_1.sqlite
- state_5.sqlite
- skills/.system/
- /.system/
- tmp/
- ChatGPT-backed
- API-key-backed
negative_constraints:
- Codex plan-backed and API-billed usage/cooldowns must not collapse into one generic Codex account bucket.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Codex SQLite filenames are upstream-provider artifacts, not PM storage technology.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Codex account roots and auth-family separation are independently addressable.
```

### MA-029 - Gemini Copilot Direct Provider Identity And Capability Boundaries

```yaml
plan_unit_id: MA-029
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Gemini Direct is an active direct API provider entry, retired Gemini CLI vocabulary is source-lineage only,
  Antigravity CLI is the active Google-owned CLI-runtime entry, Codex and GitHub Copilot are direct providers in PM,
  GitHub API auth remains independent from GitHub Copilot provider auth, and Copilot account records preserve auth realm,
  billing/entity context, entitlement class, policy block, and cooldown reason codes.
gui_related: false
gui_classification_reason: The unit defines provider identity and capability boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- MA-028
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini Direct remains active, Gemini CLI is retired/source-lineage only, and Antigravity CLI is a separate active CLI-runtime entry.
- Gemini capability declarations use the shared provider capability model.
- GitHub Copilot account switching does not alter Git or GitHub API identity.
- Copilot entitlement and cooldown reason codes remain explicit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: direct_provider_capability_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: direct_provider_capability_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- direct-only
- supports_multi_account
- account_identity_kind
- quota_signal_sources
- supports_threshold_switch
- supports_reset_countdown
- supports_role_scoped_account_pools
- requested_auth_mode
- effective_*
- billing_entity_required
- included_premium_exhausted
- paid_overage_disallowed
- copilot_org_policy_blocked
- copilot_entitlement_missing
negative_constraints:
- Switching GitHub Copilot accounts must not change Git transport, local Git/worktree state, remotes, worktree ownership, repository transport state, or GitHub API account binding.
compatibility_only_notes:
- Retired "Gemini Direct and Gemini CLI remain separate provider entries" wording is kept only for source-lineage.
stale_retired_dispositions:
- Active Gemini CLI family pooling is retired; requested/effective pooling now applies to active provider entries only.
owner_boundary_notes:
- GitHub API auth for repository operations is independent from GitHub Copilot provider auth.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Direct-provider identity and capability declarations are split from OpenCode and sharing policy.
```

### MA-030 - Provider-Native Advanced Instructions OpenCode Evidence And Skill Boundary

```yaml
plan_unit_id: MA-030
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Provider-native advanced instruction surfaces, OpenCode evidence, and skill/MCP behavior remain bounded: Copilot advanced
  target groups carry PM control and drift state, native projections have explicit failure behavior, OpenCode pressure
  evidence preserves source authority, and PM does not invent provider-specific skill plumbing inside the OpenCode server
  profile for direct providers.
gui_related: true
gui_classification_reason: The unit includes user-visible advanced instruction panes, target groups, and drift controls.
split_recommended: false
depends_on:
- MA-029
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- GitHub Copilot Advanced target groups remain provider-native instruction surfaces.
- native_projected failure behavior remains explicit.
- OpenCode pressure records preserve observed versus upstream-authoritative source authority.
- Direct-provider differences remain in auth/model/runtime/capability transforms, not OpenCode skill plumbing.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_native_instruction_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_native_instruction_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- GitHub Copilot Advanced
- Repository Instructions
- .github/copilot-instructions.md
- Path Instructions
- .github/instructions/*.instructions.md
- Custom Agents
- .github/agents/*.agent.md
- PM Controlled
- Manual Override
- native_projected
- '429'
- rateLimitedUntil
- OpenCode-observed
- upstream-authoritative
negative_constraints:
- PM should not invent provider-specific skill plumbing inside the OpenCode server profile for direct-provider entries.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider differences belong in auth, model/runtime, and capability transforms rather than replacing PM-native skill delivery.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Advanced instruction and OpenCode evidence boundaries are split from sharing deny classes.
```

### MA-031 - CLI Provider Sharing Deny Classes And Overlay Policy

```yaml
plan_unit_id: MA-031
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: CLI-backed providers deny sharing for account-bearing state and runtime residue by default. PM-managed overlays
  may be projected only when target-specific, deny_classes wins for account-bearing state, and provider_api projection
  remains a provider adapter boundary rather than a filesystem sharing shortcut.
gui_related: false
gui_classification_reason: The unit defines provider account state sharing policy rather than GUI presentation.
split_recommended: false
depends_on:
- MA-030
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Account-bearing state and residue do not leak between runnable profiles.
- Runtime sharing defaults preserve account-local provider-generated state unless explicitly promoted.
- share_classes, deny_classes, and projection_mode remain recorded policy fields.
- provider_api projection remains a provider adapter boundary.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cli_provider_sharing_policy
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: cli_provider_sharing_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0020
preserved_exact_tokens:
- auth_state
- history
- mcp_oauth_tokens
- extensions runtime state
- project registry
- temp chats
- workspace_trust
- runtime_cache
- cooldown_residue
- telemetry_state
- share_classes[]
- deny_classes[]
- projection_mode = copy | symlink | generated | provider_api
negative_constraints:
- Account-bearing state and residue from one profile must not leak into another account's runnable profile.
- deny_classes[] wins for account-bearing state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- PM-managed overlays for instructions, skills, selected MCP definitions, and selected bridge config are allowed only when target-specific.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Sharing deny classes close the provider-specific S0020 split.
```

### MA-032 - Runner Orchestration Account Contract

```yaml
plan_unit_id: MA-032
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: The multi-account contract applies across assistant, interviewer, builders, overseers, and node workers.
  Auto-switching is on by default for provider-using actors, provider selection is provider-aware, account-aware, and
  role-aware, same-provider accounts are not interchangeable, and manual set-active remains an override/debug control.
gui_related: false
gui_classification_reason: The unit defines runtime actor coverage rather than GUI presentation.
split_recommended: false
depends_on:
- MA-031
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Multi-account applies across all listed provider-using actor classes.
- Provider selection remains provider-aware, account-aware, and role-aware.
- Same-provider accounts are not interchangeable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runner_orchestration_account_contract
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: runner_orchestration_account_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0021
preserved_exact_tokens:
- assistant
- interviewer
- builders
- overseers
- node workers
- provider-aware
- account-aware
- role-aware
- manual set-active
negative_constraints:
- Same-provider accounts are not interchangeable.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runner and orchestration consumers inherit the Multi-Account requested/effective account contract.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The source span is narrow enough for one runner/orchestration PlanUnit.
```

### MA-033 - Owner Consumer Account Binding And Pressure History

```yaml
plan_unit_id: MA-033
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Runtime-account consumers defer to Multi-Account for requested/effective account selection. requested_account_binding
  and operational_identity remain shared runtime fields, required account binding fields remain explicit, blocked switch
  decisions stay historically material, pressure history persists through account_switch_event and account_pressure_episode,
  and hard-blocked evidence keeps accounts ineligible until successful revalidation.
gui_related: false
gui_classification_reason: The unit defines runtime storage/history fields rather than GUI presentation.
split_recommended: false
depends_on:
- MA-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- requested_account_policy alone is not treated as sufficient account-selection evidence.
- requested_account_binding remains closed to none, preferred, and required.
- account_switch_event and account_pressure_episode preserve durable history.
- hard_blocked evidence waits for successful revalidation before routing resumes.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_binding_pressure_history
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_binding_pressure_history
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0022
preserved_exact_tokens:
- requested_account_policy
- requested_account_id?
- requested_account_binding?
- effective_account_id?
- account_switch_reason?
- execution_role
- none
- preferred
- required
- account_switch_event
- account_pressure_episode
- nominal
- hard_block=true
- hard_blocked
negative_constraints:
- requested_account_policy alone is not enough to explain concrete account selection.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime-account consumers defer to Plans/Multi-Account.md for requested/effective account selection.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Models_System.md'
split_recommendation_reason: The owner/consumer binding span is narrow enough for one PlanUnit.
```

### MA-034 - Usage Pressure Owner And Pick-Best Evidence

```yaml
plan_unit_id: MA-034
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Usage/account pressure plugs into the shared Usage model rather than creating a parallel quota system.
  Provider-using interactions may update account health, pick-best uses the strongest available account-health signals
  plus policy, and Gemini provider-level-only quota/status projections are incomplete when they omit account-level state.
gui_related: false
gui_classification_reason: The unit defines Usage-owned runtime pressure and pick-best behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MA-033
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- No parallel quota system is created for multi-account routing.
- Account health can update from every provider-using interaction.
- Pick-best does not treat all signals as equally authoritative.
- Gemini family summaries preserve account-level state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_pressure_owner
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: usage_pressure_owner
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0023
preserved_exact_tokens:
- Usage/account pressure
- shared usage model
- parallel quota system
- account-health signals
- /quota/status
- usage
- pressure
- cooldown
- source-confidence
negative_constraints:
- Do not create a parallel quota system for multi-account routing.
- Gemini provider-level-only /quota/status projection is incomplete without account-level state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/usage-feature.md remains the Usage owner consumed by Multi-Account routing.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#42-authpolicy'
split_recommendation_reason: Multi-Account-S0023 is split between Usage owner, Gemini labels, and priority rules.
```

### MA-035 - Gemini Usage Source Labels And Confidence

```yaml
plan_unit_id: MA-035
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Gemini Direct usage/source expectations preserve source-qualified labels. API-key/local-only views use
  source-qualified estimated wording, and source_confidence exposes whether quota pressure is authoritative, structured,
  heuristic, or local-only. Legacy Gemini CLI family-usage and signal_confidence wording is compatibility/source-lineage only.
gui_related: true
gui_classification_reason: The unit defines user-visible Gemini usage labels and confidence disclosure.
split_recommended: true
depends_on:
- MA-034
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini Direct usage remains source-qualified; retired Gemini CLI family aggregation is not an active UI requirement.
- Gemini quota and Gemini (estimated) labels remain source-qualified.
- source_confidence remains visible; legacy signal_confidence is an alias/source-lineage token only.
- Authoritative, structured, heuristic, and local-only confidence levels remain distinguishable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gemini_usage_labels
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: gemini_usage_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0023
preserved_exact_tokens:
- Gemini-family usage surface
- Gemini quota
- Gemini (estimated)
- signal_confidence
- source_confidence
- authoritative
- structured
- heuristic
- local-only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Usage labels consume Plans/usage-feature.md while preserving Multi-Account account context.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/rewrite-tie-in-memo.md'
split_recommendation_reason: Gemini labels are split from generic pick-best evidence and priority ordering.
```

### MA-036 - Priority Ordering And Sticky Selection

```yaml
plan_unit_id: MA-036
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Priority, GUI ordering, and stickiness rules use lower numeric priority first, prefer the current effective
  account when healthy enough, otherwise choose the highest-priority eligible account inside the highest-ranked viable
  auth surface, and avoid bouncing back to a recovered higher-priority account unless policy and health justify it.
gui_related: true
gui_classification_reason: The unit covers GUI ordering and user-visible account priority/stickiness behavior.
split_recommended: true
depends_on:
- MA-035
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Lower numeric priority wins.
- Current effective account remains preferred when healthy enough.
- Selection considers highest-ranked viable auth surface.
- Recovered higher-priority accounts do not immediately steal traffic back without policy and health support.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: priority_sticky_selection
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: priority_sticky_selection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0023
preserved_exact_tokens:
- lower numeric priority wins
- '1'
- '2'
- '3'
- current effective account
- highest-priority eligible account
- highest-ranked viable auth surface
negative_constraints:
- Do not bounce immediately back to a recovered higher-priority account unless policy and health justify it.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Priority and stickiness rules align GUI ordering with requested/effective runtime selection.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, PolicyRule:Decision_Policy.md§3'
split_recommendation_reason: Priority ordering closes the S0023 split.
```

### MA-037 - GUI UX-Only Boundary And Agent-Config Section Order

```yaml
plan_unit_id: MA-037
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Multi-account GUI requirements are UX requirements independent of implementation stack. Agent-Config is the
  canonical management surface for provider defaults, accounts/profiles, models, instructions, skills, and advanced
  runtime controls, with required section order and a persistent Effective Runtime inspector in the provider detail flow.
gui_related: true
gui_classification_reason: The unit defines GUI surface structure, navigation order, and persistent runtime inspector behavior.
split_recommended: true
depends_on:
- MA-036
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- GUI requirements remain implementation-stack independent.
- Agent-Config remains the canonical management surface.
- Required Agent-Config section order remains preserved.
- Effective Runtime inspector remains persistently visible in the provider detail flow.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agent_config_gui_structure
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: agent_config_gui_structure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0025
preserved_exact_tokens:
- GUI requirements (UX only)
- Agent-Config
- Overview
- Defaults
- Accounts / Profiles
- Models
- Instructions
- Skills
- Advanced Runtime
- Effective Runtime
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Agent-Config owns the provider/account management surface while runtime records own actual requested/effective execution.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: GUI structure is split from family pooling guardrails.
```

### MA-038 - Provider Pooling Family Guardrails And No Pseudo-Providers

```yaml
plan_unit_id: MA-038
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Agent-Config surfaces provider/family pooling where a provider entry participates in family-level pooling, preserves active Gemini Direct, Antigravity CLI public `agy` rows, and the separate Antigravity OAuth/internal `gemini-3.1-flash-image` generated-image route as real provider-entry/account rows where configured, treats Gemini CLI as retired source-lineage only, requires requested/effective disclosure when family pooling selects a different backend, capability-checks media/effort/tooling needs, and forbids fake OAuth/API-key pseudo-providers.
gui_related: true
gui_classification_reason: The unit defines GUI pooling controls, account row badges, and requested/effective disclosure.
split_recommended: true
depends_on:
- MA-037
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Provider Pooling and Family Pooling sections remain visible where applicable.
- Gemini Direct and Antigravity CLI remain real active provider entries; Gemini CLI is retired/source-lineage only.
- Antigravity internal generated-image route rows remain separate from public `agy` CLI rows in pooling, badges, and requested/effective disclosure.
- Family pooling preserves requested and effective provider entries in run records.
- GUI grouping does not mint fake pseudo-providers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: family_pooling_guardrails
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: family_pooling_guardrails
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0025
source_atom_ids: [atom-0142, atom-0143, atom-0144]
preserved_exact_tokens:
- Provider Pooling
- Family Pooling
- Gemini Direct
- Antigravity CLI
- agy
- gemini-3.1-flash-image
- Gemini CLI
- /media/effort/tooling
- requested provider entry
- effective provider entry
- pseudo-providers
- gemini
- gemini_cli
- auth-surface badges
- /configuration/availability
negative_constraints:
- The GUI must not mint fake OAuth/API-key pseudo-providers that compete with real active provider entries such as gemini and antigravity_cli.
- PM must never silently route into retired Gemini CLI-only capability boundaries.
- PM must not silently pool or fallback between public `agy`, Antigravity OAuth/internal image generation, Gemini Direct, or retired Gemini CLI lineage.
compatibility_only_notes:
- gemini_cli and Gemini CLI are preserved tokens only; they are not active setup/provider rows.
stale_retired_dispositions:
- The older one-card mixed OAuth/API grouping is preserved only as a retired direction.
- Active Gemini CLI provider grouping is retired.
owner_boundary_notes:
- Provider family grouping is a GUI/runtime policy surface, not a replacement for concrete provider entries.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: Family pooling is split from the Agent-Config section-order unit.
```

### MA-039 - Account Profile Row Content Actions And Inspector Boundaries

```yaml
plan_unit_id: MA-039
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Account/profile rows display dense scan-friendly identity, auth, configuration, availability, pressure,
  cooldown, entitlement, billing, health, and action state. Detailed usage/cooldown and requested/effective explanation
  belongs in the inspector, Codex and Copilot rows preserve their real account/entity shape, OpenCode server profiles
  expose connection readiness, and provider-level enable/disable changes future eligibility without destroying rows/defaults.
gui_related: true
gui_classification_reason: The unit defines GUI account/profile row content, actions, and inspector boundaries.
split_recommended: false
depends_on:
- MA-038
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Account/profile rows stay dense and scan-friendly.
- Codex ChatGPT and API key rows remain separate top-level rows.
- GitHub Copilot billing entities stay in the inspector rather than fake top-level accounts.
- Provider Enable/Disable does not destroy account/profile rows or saved defaults.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_row_inspector_boundary
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_row_inspector_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0026
preserved_exact_tokens:
- label
- auth family or profile mode
- current state
- derived auth/configuration/availability state
- pressure/cooldown summary
- entitlement/billing secondary line
- Add Account
- Add Profile
- Set Preferred
- Refresh Usage
- Revalidate
- Edit Threshold
- Open Provider Settings
- Enable/Disable Provider
negative_constraints:
- Provider-level Enable/Disable Provider changes future eligibility only and must not destroy account/profile rows or saved defaults.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The expanded inspector owns billing-entity selection, premium-request state, and fallback-to-included-model disclosure.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Account/profile row requirements are narrow enough for one PlanUnit.
```

### MA-040 - Setup Readiness State Machine And Labels

```yaml
plan_unit_id: MA-040
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider/account setup flows distinguish authentication from readiness. Account/profile GUI state machines
  retain provider-specific state for logged-out, logging-in, logged-in, needs-setup, validating, ready, expired, failed,
  logging-out, and disabled labels, and PM does not collapse logged-in, entitlement, billing, or partial setup states into Ready.
gui_related: true
gui_classification_reason: The unit defines user-visible setup/readiness states and GUI state machine labels.
split_recommended: true
depends_on:
- MA-039
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Authentication and readiness remain distinct.
- Logged in is not treated as Ready.
- Provider-specific entitlement/billing can keep an account in Needs setup after auth succeeds.
- The GUI state machine preserves provider-specific degraded states.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: setup_readiness_state_machine
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: setup_readiness_state_machine
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0027
preserved_exact_tokens:
- Logged out
- Logged Out
- Logging in
- Logging In
- Logged in
- Needs setup
- Validating
- Ready
- Auth expired
- Validation failed
- Logging out
- Disabled
- partial-setup
negative_constraints:
- Logged in is not the same as Ready.
- PM must not collapse provider-specific entitlement or billing setup into Ready, partial-setup, or Logging Out.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Setup readiness labels consume setup/health lifecycle contracts but Multi-Account owns account-specific readiness semantics.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#Setup/Health-lifecycle-contracts, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md'
split_recommendation_reason: Setup state labels are split from provider-specific readiness branches.
```

### MA-041 - Provider-Specific Readiness Branches And Cursor Rules Projection

```yaml
plan_unit_id: MA-041
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider-specific readiness branches preserve Copilot billing entity selection, Gemini Vertex/Google Cloud
  credential, project, location, trust, MCP, and account-auth choices, Cursor browser login and API-key availability, Cursor
  Rules projection to .cursor/rules/*.mdc as primary/native rules, and provider-reported cooldowns as read-only facts
  with source confidence.
gui_related: true
gui_classification_reason: The unit covers provider-specific setup GUI paths, helper text, and visible readiness labels.
split_recommended: true
depends_on:
- MA-040
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Copilot may require Choose Billing Entity before Ready.
- Gemini Vertex setup exposes ADC, service account JSON, and Google Cloud API key paths.
- Cursor CLI browser login is default and API key remains advanced optional.
- Cursor Rules labels and .cursorrules compatibility remain preserved.
- Provider-reported cooldowns remain read-only facts with source confidence.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_readiness_branches
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_readiness_branches
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0027
preserved_exact_tokens:
- Choose Billing Entity
- Use Vertex AI
- Application Default Credentials (ADC)
- Service Account JSON
- Sign In with Google
- Use Gemini API Key
- /trust/MCP
- .cursor/rules/*.mdc
- Cursor Rules
- .cursorrules
- /confidence
negative_constraints:
- Project Rules are primary/native for Cursor docs/rules projection; .cursorrules remains legacy/deprecated compatibility.
compatibility_only_notes:
- .cursorrules and root compatibility files remain compatibility targets, not the primary managed artifact.
stale_retired_dispositions:
- .cursorrules is legacy/deprecated relative to .cursor/rules/*.mdc.
owner_boundary_notes:
- Provider-specific setup surfaces expose only readiness branches valid for the selected provider entry/account state.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#Setup/Health-lifecycle-contracts, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md'
split_recommendation_reason: Provider-specific readiness branches close the S0027 split.
```

### MA-042 - Account Lifecycle Flows Registration Schema And Defaults

```yaml
plan_unit_id: MA-042
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider settings expose account lifecycle controls in a consistent location while honoring provider-specific
  auth. Add, edit, remove/archive, and default account flows preserve credential revalidation, stable ULID account_id,
  canonical registration schema, closed status values, and exactly one default account or explicit no-default handling.
gui_related: true
gui_classification_reason: The unit defines settings GUI account lifecycle flows and confirmation dialogs.
split_recommended: true
depends_on:
- MA-041
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Add account, edit account, remove account/profile, and default account flows remain present.
- Credential rotation triggers re-auth or revalidation before returning to Ready.
- account_id remains a ULID.
- Canonical registration schema and status enum remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_lifecycle_flow
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: account_lifecycle_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0028
preserved_exact_tokens:
- Settings -> Providers -> [Provider] -> Add Account
- display_name
- Remove from PM only
- Remove and archive PM-managed data
- account_id
- ULID
- '{ account_id: ulid, provider_id, display_name, auth_method, credential_ref, created_at, last_used_at, status }'
- active | expired | revoked | error
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Lifecycle controls are consistent but remain provider-specific where auth requirements differ.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Account registration is split from provider-specific setup choices and button/removal safety.
```

### MA-043 - Provider-Specific Setup Choices And Remediation Actions

```yaml
plan_unit_id: MA-043
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider-specific setup choices preserve Codex ChatGPT/API-key account entry labels and helper text, root-backed
  Fresh Login and Import Existing Auth modes, direct coding-plan provider API-key setup rows, remediation actions valid
  for the selected provider entry/account state, and explicit billing-entity refresh cadence.
gui_related: true
gui_classification_reason: The unit defines user-visible provider setup choices, helper text, and remediation actions.
split_recommended: true
depends_on:
- MA-042
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Codex add-account choices remain Sign in with ChatGPT and Use API Key.
- Generic stale browser/device-code/API-key matrix is not revived for Codex.
- Fresh Login, Import Existing Auth, and Environment/API-Key Setup remain provider-specific.
- Invalid remediation actions are hidden rather than generalized.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_setup_remediation
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_setup_remediation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0028
preserved_exact_tokens:
- Sign in with ChatGPT
- Use API Key
- Uses Codex through your ChatGPT plan limits
- Switching to ChatGPT-backed access may require signing out first
- Fresh Login
- Import Existing Auth
- Environment/API-Key Setup
- Alibaba Coding Plan
- MiniMax Coding Plan
- Z.AI Coding Plan
- Retry Sign-In
- Edit Auth Settings
- Repair Home
- Revalidate
- Refresh Entitlements
negative_constraints:
- Codex setup copy must not revive the stale browser/device-code/API-key matrix as the primary Codex account model.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale Codex browser/device-code/API-key matrix is retired as the primary Codex setup model.
owner_boundary_notes:
- Provider setup surfaces expose only actions valid for the selected provider entry and account state.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Provider-specific setup is split from registration schema and removal safety.
```

### MA-044 - Button State Contract And Removal Safety Rules

```yaml
plan_unit_id: MA-044
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Row-level setup actions use explicit in-progress and terminal label transitions. Account/profile removal preserves
  requested/effective history, default-account removal atomically promotes an eligible account or leaves explicit no-default
  state, disabling does not delete roots, and removal avoids deleting non-PM-managed provider data outside the owned root.
gui_related: true
gui_classification_reason: The unit defines user-visible button states, terminal labels, and removal confirmations.
split_recommended: true
depends_on:
- MA-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Button-state labels remain explicit for sign in, save key, import, validate, refresh usage, and log out.
- Non-default removal preserves requested/effective history for past runs.
- Current-default removal promotes another eligible account or creates explicit no-default blocking state.
- Disabling an account/profile does not delete its root.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: button_state_removal_safety
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: button_state_removal_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0028
preserved_exact_tokens:
- Sign In -> Signing In...
- Save Key -> Saving...
- Import -> Importing...
- Validate -> Validating...
- Refresh Usage -> Refreshing...
- Log Out -> Logging Out...
- Logged In
- Saved
- Logged Out
negative_constraints:
- Disabling an account/profile MUST NOT delete its root.
- Removal MUST avoid deleting non-PM-managed provider data outside the owned root.
compatibility_only_notes:
- Row-level setup actions use an explicit button-state contract.
stale_retired_dispositions: []
owner_boundary_notes:
- Backups and archives are for PM-managed artifacts only, not whole provider-home snapshots by default.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Button states and removal safety close the S0028 split.
```

### MA-045 - Auth Flow Disclosure And Recovery Boundary

```yaml
plan_unit_id: MA-045
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Authentication walkthroughs define PM-side orchestration around provider-native auth mechanisms. Every account
  setup/auth flow surfaces its active auth path, token refresh is either PM-managed or visibly delegated, and credential
  expiry produces user-visible notification and recovery action instead of silently degrading the account row.
gui_related: true
gui_classification_reason: The unit covers user-visible auth path disclosure, expiry notification, and recovery actions.
split_recommended: false
depends_on:
- MA-044
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- OAuth flows surface redirect, verification URL, or localhost callback state.
- API-key flows surface secure key entry.
- Token refresh ownership is visible.
- Credential expiry is visible and recoverable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: auth_flow_disclosure
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: auth_flow_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0029
preserved_exact_tokens:
- Authentication flow walkthroughs
- redirect
- verification URL
- localhost callback
- secure API key entry
- token refresh
- user-visible notification
- recovery action
negative_constraints:
- Credential expiry must not silently degrade the account row.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider-native auth mechanisms are orchestrated by PM setup flows without replacing provider auth ownership.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: The setup/auth flow disclosure span is narrow enough for one PlanUnit.
```

### MA-046 - API Key Setup Flow And Credential Storage

```yaml
plan_unit_id: MA-046
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: API-key setup lets the user select API Key, enter the key in a secure input, validate it with a lightweight
  provider call, store the key in the OS credential store on success, write the resulting credential_ref, mark the account
  active, and keep failed setup recoverable with a concrete reason.
gui_related: true
gui_classification_reason: The unit covers the visible API-key setup flow and secure input behavior.
split_recommended: false
depends_on:
- MA-045
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- API key entry uses a secure input field.
- PM validates the key before marking the account active.
- Secret material is stored in the OS credential store.
- Failure reasons are concrete and recoverable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: api_key_setup_flow
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: api_key_setup_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0030
preserved_exact_tokens:
- API Key
- secure input field
- list models
- OS credential store
- credential_ref
- invalid key
- expired
- quota exceeded
negative_constraints:
- Failed API-key setup must not pretend setup succeeded.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- credential_ref is the stored non-secret handle after OS credential storage succeeds.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: API-key setup is narrow enough for one PlanUnit.
```

### MA-047 - OAuth Device-Code Setup Flow

```yaml
plan_unit_id: MA-047
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: OAuth device-code setup requests a provider device code, shows the device code, verification URL, and QR code,
  lets the user complete authorization outside PM, polls for the token every five seconds for up to five minutes, stores
  refresh tokens in the OS credential store, keeps short-lived access tokens in memory only, and exposes clear retry on failure.
gui_related: true
gui_classification_reason: The unit covers visible device-code, URL, QR, timeout, and retry behavior.
split_recommended: false
depends_on:
- MA-046
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Device code, verification URL, and QR code are shown.
- Browser authorization happens outside PM.
- Token polling cadence and timeout remain explicit.
- Refresh tokens and access tokens use the specified storage/cache split.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: oauth_device_code_flow
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: oauth_device_code_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0031
preserved_exact_tokens:
- Sign in with [Provider]
- device code
- verification URL
- QR code
- 5 seconds
- 5 minutes
- refresh token
- short-lived access token
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- OAuth authorization remains provider/browser-native while PM orchestrates polling and credential storage.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: OAuth device-code setup is narrow enough for one PlanUnit.
```

### MA-048 - Retired Gemini CLI Token Flow And Import Boundary

```yaml
plan_unit_id: MA-048
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Gemini CLI token setup/import vocabulary is retired and retained only as source-lineage. Active PM setup
  must not present Gemini CLI token options, invoke Gemini CLI auth, import Gemini CLI credentials, or create a PM-owned
  GEMINI_CLI_HOME root. Active CLI-runtime setup for this lane belongs to Antigravity CLI.
gui_related: false
gui_classification_reason: The unit covers CLI auth orchestration and import boundaries rather than GUI layout.
split_recommended: false
depends_on:
- MA-047
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini CLI token/import tokens remain losslessly available for exact-text audit.
- Active setup does not present Gemini CLI token options.
- Active setup does not import Gemini CLI auth-bearing state.
- Antigravity CLI setup is separate and does not reuse GEMINI_CLI_HOME.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: retired_gemini_cli_token_flow_resurrection
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: retired_gemini_cli_token_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0032
preserved_exact_tokens:
- Gemini CLI
- credential_ref
- Import Existing Gemini CLI Auth
- GEMINI_CLI_HOME
- native OAuth/browser flow
negative_constraints:
- Do not invoke Gemini CLI auth commands.
- Do not import Existing Gemini CLI Auth as an active setup mode.
- Do not create a PM-owned GEMINI_CLI_HOME root.
compatibility_only_notes:
- Ongoing token refresh delegated to the Gemini CLI runtime is retained only as source-lineage vocabulary.
stale_retired_dispositions:
- Gemini CLI token flow and import boundary are retired by CBP-019/MA-062.
owner_boundary_notes:
- Gemini CLI token setup is retired; active CLI-runtime account evidence is owned by Antigravity setup/probe contracts.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Retired Gemini CLI token flow is narrow enough for one compatibility PlanUnit.
```

### MA-049 - Usage Runtime Visibility And Usage Consumer Boundary

```yaml
plan_unit_id: MA-049
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Usage and status surfaces show current effective account/profile, effective auth mode, billing/entity context,
  pressure/cooldown state, source-confidence/stale/estimated labels, and switch/failover reason. Plans/usage-feature.md
  consumes this account/provider owner contract and must not reintroduce stale buckets or flatten direct-provider quota
  context into one generic account label.
gui_related: true
gui_classification_reason: The unit defines user-visible usage/status surface fields and labels.
split_recommended: false
depends_on:
- MA-048
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Usage/status surfaces show account, auth, billing/entity, pressure/cooldown, confidence, and switch reason fields.
- Plans/usage-feature.md remains a consumer and does not flatten provider quota context.
- Usage rows prefer plain-language statuses or concrete failure reasons over transport-internal terminology.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_runtime_visibility
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: usage_runtime_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0033
preserved_exact_tokens:
- current effective account or server profile
- current effective auth mode
- current effective billing/entity context
- pressure/cooldown state
- source-confidence
- stale
- estimated labels
- switch/failover reason
- Plans/usage-feature.md
- Working
negative_constraints:
- Usage sections must not reintroduce stale provider buckets or flatten direct-provider quota context into one generic account label.
compatibility_only_notes: []
stale_retired_dispositions:
- source-confidence, stale, or estimated labels are retained when data is not authoritative.
owner_boundary_notes:
- Plans/usage-feature.md consumes the Multi-Account account/provider owner contract.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: Usage/runtime visibility is narrow enough for one PlanUnit.
```

### MA-050 - Instruction Skills And MCP Agent-Config Exposure

```yaml
plan_unit_id: MA-050
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Agent-Config exposes shared instruction panes sourced from PM AGENTS-layer intent, provider-native advanced
  panes for GitHub Copilot, PM-native skills with readiness/fix text/actions, and PM-native MCP servers with per-provider
  and per-runtime effective status in inspectors.
gui_related: true
gui_classification_reason: The unit defines Agent-Config instruction, skill, MCP, and inspector GUI exposure.
split_recommended: true
depends_on:
- MA-049
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Shared instruction panes remain sourced from PM AGENTS-layer intent.
- GitHub Copilot provider-native advanced panes remain visible.
- PM-native skills expose readiness/fix text/actions.
- PM-native MCP servers expose per-provider/runtime effective status in inspectors.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agent_config_instruction_skill_mcp
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: agent_config_instruction_skill_mcp
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0034
preserved_exact_tokens:
- AGENTS.md
- CLAUDE.md
- GEMINI.md
- Cursor Rules
- GitHub Copilot
- PM-native skills
- PM-native MCP servers
- per-provider/runtime effective status
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Skills and MCP are PM-native rows; provider/runtime state appears in inspectors.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Multi-Account-S0034 is split between exposure, projection schema, repair rules, and import/path scope.
```

### MA-051 - Projection Record Schema And Drift GUI Audit

```yaml
plan_unit_id: MA-051
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Provider-native files under PM control expose drift states and repair/detach/diff actions. Projection records
  preserve control_mode, drift_state, projection timestamps/targets, instruction_projection metadata, source revision,
  target kind/path, preview hash, requested runtime snapshot, and drift check timestamps so PM can prove what was projected.
gui_related: true
gui_classification_reason: The unit defines projection GUI records, drift states, and audit fields.
split_recommended: true
depends_on:
- MA-050
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Provider-native generated artifacts do not become source of truth when edited directly.
- Drift states and repair/detach/view diff actions remain visible.
- Projection records preserve canonical revision, target kind, target path, preview hash, and runtime snapshot.
- last_projected_at and last_drift_check_at remain inspectable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: projection_drift_audit
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: projection_drift_audit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0034
preserved_exact_tokens:
- In Sync
- PM Outdated
- Provider Modified
- Projection Failed
- Unknown
- Repair
- Detach
- View diff
- control_mode = pm_controlled | manual_override
- drift_state = in_sync | pm_outdated | provider_modified | projection_failed | unknown
- instruction_projection
- canonical_revision
- projection_target_kind = agents_md | claude_md | gemini_md | cursor_rules
- target_path
- preview_hash
- requested_runtime_snapshot
- last_projected_at
- last_drift_check_at
negative_constraints:
- Provider-native files edited directly are reported as drift rather than treated as the new source of truth.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider-native rule/settings files are generated artifacts derived from one canonical instruction model.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Projection record schema is split from conflict/repair rules.
```

### MA-052 - Conflict Manual Override And Repair Rules

```yaml
plan_unit_id: MA-052
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Projection conflict handling records conflict policy and drift detection mode. Repair may overwrite only
  PM-managed portions of profile/config surfaces PM owns, direct provider-native edits require Manual Override before
  editing, canonical-source edits keep semantic sync across controlled targets, and Provider Modified must not auto-overwrite
  at launch.
gui_related: true
gui_classification_reason: The unit preserves visible conflict, manual override, repair, and launch warning behavior.
split_recommended: true
depends_on:
- MA-051
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- conflict_policy and drift_detection fields remain explicit.
- Drift repair preserves manual/provider-owned sections.
- Editing PM Controlled provider-native targets requires Manual Override first.
- Provider Modified does not auto-overwrite at launch.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: projection_conflict_repair
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: projection_conflict_repair
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0034
preserved_exact_tokens:
- conflict_policy = pm_wins | manual_review | provider_wins
- drift_detection = hash | mtime | disabled
- /drift
- /overwrite
- PM Controlled
- Manual Override
- Provider Modified
negative_constraints:
- Provider Modified must not auto-overwrite at launch.
- Drift repair must never clobber an entire provider profile merely because one PM-controlled target diverged.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Editing the canonical source is the only path that keeps semantic sync across controlled targets.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Conflict/repair rules are split from projection path/import scope.
```

### MA-053 - Projection Paths Server Profiles And Minimal Import Scope

```yaml
plan_unit_id: MA-053
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Workspace projections, provider-local config, rules, instructions, agents, skill rows, MCP rows, provider entry
  metadata, OpenCode sidecar layout, and import metadata remain separate from provider account roots. Import Existing Auth
  copies only minimum auth-bearing material into the PM-owned root, source-side migration/cache/log/backup paths are not
  automatic wholesale imports, and Import Existing Codex Auth remains optional/non-MVP.
gui_related: true
gui_classification_reason: The unit preserves GUI-visible projection paths, skill/MCP rows, and import controls.
split_recommended: true
depends_on:
- MA-052
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Workspace projections remain tracked separately from provider account roots.
- Skill rows use plain-language statuses, fix text, and primary remediation actions.
- MCP rows are server-centric at the top level.
- Import Existing Auth copies only minimum auth-bearing material.
- Import Existing Codex Auth remains optional/non-MVP.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: projection_path_import_scope
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: projection_path_import_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0034
preserved_exact_tokens:
- AGENTS.md
- CLAUDE.md
- GEMINI.md
- .cursor/rules/*.mdc
- cursor/rules/*.mdc
- .mcp.json
- .github/copilot-instructions.md
- .github/instructions/*.instructions.md
- .github/agents/*.agent.md
- agent.md
- instructions.md
- /rules/
- /instructions/
- /agents/
- display_name
- enabled
- supports_family_pooling
- default_model_id_raw
- pm/state.json
- pm/logs/
- pm/projections/
- pm/backups/
- Import Existing Auth
- /migration
- /caches
- /logs/
- /backups/
- Import Existing Codex Auth
negative_constraints:
- Import Existing Auth must not wholesale clone unrelated provider history, caches, logs, projections, or backups by default.
compatibility_only_notes:
- Import Existing Codex Auth is optional/non-MVP.
stale_retired_dispositions: []
owner_boundary_notes:
- Imported account or server profile runs from the PM-owned root after import; source path remains audit/debug metadata.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: Projection path and import scope close the S0034 split.
```

### MA-054 - Native Auth In-Process Token Store

```yaml
plan_unit_id: MA-054
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Native auth for Codex, Copilot, Gemini, and optionally Claude uses an in-process Rust token store shaped after OpenCode
  PR #11832, with providers[platform_id], active, order, records for per-account tokens and health, file locking for
  writes, and best-effort health updates.
gui_related: false
gui_classification_reason: The unit covers native auth token storage and account health records rather than GUI presentation.
split_recommended: true
depends_on:
- MA-053
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Native auth token-store shape preserves providers[platform_id], active, order, and records.
- Per-account token and health records remain represented.
- File lock for writes and best-effort health updates remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_auth_token_store
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: native_auth_token_store
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0035
preserved_exact_tokens:
- Codex
- Copilot
- Gemini
- Claude
- OpenCode PR #11832
- providers[platform_id]
- active
- order
- records
- per-account tokens + health
- File lock for writes
- best-effort for health updates
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Native auth remains a future-phase account-store shape and does not create executable work in this PlanUnit.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: Multi-Account-S0035 is split into token store, rotating fetch, and current-account context.
```

### MA-055 - Native Auth Rotating Fetch And Cooldown Failover

```yaml
plan_unit_id: MA-055
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Native auth HTTP calls use rotating fetch: get candidates active first and then order, filter by cooldown, and on 429,
  401, or 403 apply cooldown, move the account to back, notify, and retry with the next account.
gui_related: false
gui_classification_reason: The unit covers HTTP failover and cooldown handling rather than GUI presentation.
split_recommended: true
depends_on:
- MA-054
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Candidate ordering remains active first, then order.
- Cooldown filtering occurs before HTTP calls.
- 429/401/403 responses apply cooldown, moveToBack, notify, and retry next account.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_auth_rotating_fetch
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: native_auth_rotating_fetch
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0035
preserved_exact_tokens:
- Rotating fetch
- active first, then order
- cooldown
- 429/401/403
- apply cooldown
- moveToBack
- notify
- retry with next account
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Rotating fetch is the native-auth HTTP failover shape for future in-process auth.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: Rotating fetch is split from token-store and current-account context.
```

### MA-056 - Request-Scoped Current Account Context

```yaml
plan_unit_id: MA-056
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Native auth current-account state is request-scoped through an explicit context struct or thread-local in
  Rust, preserving the negative constraint that Rust does not use AsyncLocalStorage for this account context.
gui_related: false
gui_classification_reason: The unit defines native runtime context propagation rather than GUI presentation.
split_recommended: true
depends_on:
- MA-055
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Current account state is request-scoped.
- Explicit context struct or thread-local approaches remain allowed.
- no AsyncLocalStorage in Rust remains preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_auth_current_account_context
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: native_auth_current_account_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0035
preserved_exact_tokens:
- Current account
- current account
- explicit context struct
- thread-local
- no AsyncLocalStorage in Rust
negative_constraints:
- Native auth current-account propagation does not use AsyncLocalStorage in Rust.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Current account context is scoped per request, not a global account bucket.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs: []
split_recommendation_reason: Current-account context closes the S0035 split.
```

### MA-057 - Implementer Confirmation Guardrails

```yaml
plan_unit_id: MA-057
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: The Multi-Account document has no remaining design-open questions for the Gemini auth/account model.
  Implementation confirmations are limited to provider adapter details, migration sequencing, and exact UI copy polish,
  and must not change locked defaults, precedence order, requested/effective field names, or the Gemini media account model.
gui_related: true
gui_classification_reason: The unit includes exact UI copy polish as an allowed implementer confirmation area.
split_recommended: false
depends_on:
- MA-056
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Gemini auth/account model has no design-open questions in this document.
- Allowed confirmations remain limited to provider adapter details, migration sequencing, and exact UI copy polish.
- Locked defaults, precedence order, requested/effective field names, and media account model remain unchanged by confirmations.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: implementer_confirmation_guardrail
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: implementer_confirmation_guardrail
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0036
preserved_exact_tokens:
- Gemini auth/account model
- provider adapter details
- migration sequencing
- exact UI copy polish
- MUST NOT change
- locked defaults
- precedence order
- requested/effective field names
- media follows the same Gemini auth/account model as normal provider usage
negative_constraints:
- Implementer confirmations MUST NOT change locked defaults, precedence order, requested/effective field names, or the Gemini media account model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Remaining implementation confirmations are bounded and cannot reopen product decisions.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
split_recommendation_reason: The implementer guardrail span is narrow enough for one PlanUnit.
```

### MA-058 - Operational Identity Class Inventory

```yaml
plan_unit_id: MA-058
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Multi-Account distinguishes provider accounts from operational identities needed by GitHub Actions and Docker
  Manager, including github_api account identity for GitHub Actions, registry account identity or namespace identity for
  Docker Manager, and Kubernetes context or cluster identity for the Docker Manager Kubernetes subview.
gui_related: false
gui_classification_reason: The unit defines backend/runtime identity classes rather than direct GUI presentation.
split_recommended: true
depends_on:
- MA-057
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Provider accounts remain distinct from operational identities.
- github_api identity remains tied to GitHub Actions.
- Registry account or namespace identity remains tied to Docker Manager.
- Kubernetes context or cluster identity remains tied to Docker Manager Kubernetes subview.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: operational_identity_inventory
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: operational_identity_inventory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0037
preserved_exact_tokens:
- Operational Identity Addendum for GitHub Actions and Docker Manager (2026-03-12)
- github_api
- GitHub Actions surface
- registry account identity
- namespace identity
- Docker Manager
- Kubernetes context
- cluster identity
- Docker Manager Kubernetes subview
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Operational identity classes are required by GitHub Actions and Docker Manager without replacing provider accounts.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Permissions_System.md'
split_recommendation_reason: Multi-Account-S0037 is split between identity inventory and visible boundary rules.
```

### MA-059 - Operational Identity Boundary And Partial-Capability Visibility

```yaml
plan_unit_id: MA-059
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Operational identity state may be displayed alongside provider/account state, but it must not imply shared
  ownership or token source unless the owning auth contract says so. Requested versus effective state remains visible when
  an operational identity exists but capability is partial.
gui_related: true
gui_classification_reason: The unit explicitly covers displayed operational identity state and visible requested/effective state.
split_recommended: true
depends_on:
- MA-058
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Operational identity display does not imply shared provider account ownership or token source.
- Owning auth contracts remain authoritative for operational identity token ownership.
- Requested versus effective state remains visible when capability is partial.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: operational_identity_visibility
reasoning_tier: standard
context_scope: multi_account_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: operational_identity_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0037
preserved_exact_tokens:
- operational identity state
- provider/account state
- ownership
- token source
- requested vs effective state
- capability is partial
negative_constraints:
- Operational identity state must not imply shared ownership or token source unless the owning auth contract says so.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Requested/effective state remains visible for partial operational identity capability.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Permissions_System.md'
split_recommendation_reason: Visibility and token-source guardrails close the S0037 split.
```

### MA-001 - Multi-Account Retired Source-Preserving Bridge

```yaml
plan_unit_id: MA-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  MA-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 102 because
  Multi-Account-S0001 through Multi-Account-S0041 are covered by MA-002 through MA-059 or explicit structural, retired,
  and migration-coverage dispositions. MA-001 no longer carries source_preserving_planunit compile mode and must not own
  product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is
  carried by fine-grained Multi-Account PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- MA-054
- MA-055
- MA-056
- MA-057
- MA-058
- MA-059
unblocks: []
acceptance_criteria:
- MA-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 102.
- Multi-Account-S0001 through Multi-Account-S0041 product coverage is owned by MA-002 through MA-059 or explicit structural, retired, and migration-coverage dispositions.
- MA-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/Multi-Account.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Multi-Account-S0040
preserved_exact_tokens:
- MA-001
- Multi-Account Specification Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- MA-001 must not re-own Multi-Account-S0001 through Multi-Account-S0041 after Phase 2B batch 102.
- MA-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- MA-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former MA-001 residual source-preserving bridge is retired by Phase 2B batch 102.
owner_boundary_notes:
- MA-002 through MA-059 and explicit coverage dispositions own Multi-Account product coverage after bridge retirement.
- Multi-Account-S0040 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/Multi-Account.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
split_recommendation_reason: The former source-preserving bridge has been atomized or structurally dispositioned and is now retired.
```

### MA-060 - Goal Runtime Account Identity Consumer

```yaml
plan_unit_id: MA-060
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Multi-Account owns requested/effective account identity for Goal Runtime worker, planner, evaluator, verifier, and adjudicator provider use. Goal Runtime consumes account identity and role scope, but does not redefine account stickiness, failover, quota pressure, or provider-account policy.
gui_related: false
gui_classification_reason: Requested/effective account identity and role-scoped provider-account policy are backend account-resolution behavior; F3-393 owns visible Settings placement.
depends_on:
  - MA-009
  - MA-015
  - MA-056
  - MS-108
unblocks: []
acceptance_criteria:
  - Goal Runtime role execution can carry requested and effective account identity for worker, planner, evaluator, verifier, and adjudicator provider use.
  - Multi-Account keeps ownership of account stickiness, failover, quota pressure, and provider-account policy.
  - Goal Runtime consumes role-scoped account identity without redefining provider-account behavior.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime account-identity resolver review
risk_class: goal_runtime_account_identity_drift
reasoning_tier: high
context_scope: goal_runtime_account_policy
implementation_surfaces:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: goal_runtime_account_identity_consumer
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0075
  - pldg-20260616-001-goal-runtime-system:atom-0076
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:dec-0018
  - pldg-20260616-001-goal-runtime-system:dec-0019
preserved_exact_tokens:
  - "requested/effective account identity"
  - "worker"
  - "planner"
  - "evaluator"
  - "verifier"
  - "adjudicator"
  - "account stickiness"
  - "failover"
  - "quota pressure"
negative_constraints:
  - Do not let Goal Runtime redefine account stickiness, failover, quota pressure, or provider-account policy.
  - Do not infer effective account identity from model role alone.
owner_hints:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Goal_Runtime_System.md
```

## Migration Coverage

Original hash: `c2870a9b8a7b054a162ad885aa75adee8c875452d0bdcbdc65a6211dd159dd75`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch `phase2b-100-multi-account-lines-1-400` atomized `Multi-Account-S0002` through `Multi-Account-S0018` into `MA-002` through `MA-017`, dispositioned `Multi-Account-S0001` as the structural title anchor, and left `Multi-Account-S0019` as the next residual source-preserving cursor because that span crossed the line-400 window. Phase 2B batch `phase2b-101-multi-account-lines-354-740` atomized `Multi-Account-S0019` through `Multi-Account-S0034` into `MA-018` through `MA-053` and left `Multi-Account-S0035` as the next residual source-preserving cursor because that span crossed the line-740 window. Phase 2B batch `phase2b-102-multi-account-lines-740-952` atomized `Multi-Account-S0035` through `Multi-Account-S0037` into `MA-054` through `MA-059`, dispositioned `Multi-Account-S0038`, `Multi-Account-S0039`, and `Multi-Account-S0041` as structural rows, and retired `MA-001` to `source_preserving_bridge_retired` migration-lineage compatibility for `Multi-Account-S0040`. `Plans/Multi-Account.md` now has no residual source-preserving product coverage. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### MA-061 - Testing Capability Policy Inheritance Consumer

```yaml
plan_unit_id: MA-061
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: 'Testing capability policy is configurable globally and per project, with project settings inheriting or overriding global values and the effective policy snapshot carried into Planning Wizard, Plan Compile, Executor, and Orchestrator.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Multi-Account.md
- Plans/Automated_Testing_System.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0089
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0089
decision_refs:
- dec-0018
correction_refs:
- corr-0015
preserved_exact_tokens:
- global settings
- per-project settings
- effective policy snapshot
negative_constraints: []
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/FinalGUISpec.md
- Plans/Multi-Account.md
```
