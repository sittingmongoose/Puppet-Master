# Multi-Account Specification

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


**Status:** Single spec for implementation -- another agent may derive an implementation plan from this document.  
**Cross-references:** Plans/rewrite-tie-in-memo.md, Plans/storage-plan.md, Plans/usage-feature.md, AGENTS.md (Usage Tracking, Platform CLI Commands, Gemini auth exception).

---

## 1. Purpose and scope
- **Purpose:** Support multiple accounts per provider so users can sign into several identities for Claude Code, Codex, Gemini, GitHub Copilot, Cursor, and OpenCode, with conservative account stickiness, threshold-based switching when supported, and provider-specific recovery behavior.
- **Scope:** Multi-account routing is shared provider-runtime behavior for every provider-using role, including assistant, interviewer, requirements builder, PRD builder, package/seam overseers, node workers, and overseer-spawned workers. It is not an Orchestrator-only feature.
- **Gemini scope:** Gemini is one provider with mixed OAuth and API-key account pools under a single provider policy. Multiple OAuth accounts and multiple API-key accounts are supported simultaneously.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md

- **Default behavior:** Multi-account auto-switching is ON by default for provider-using roles unless policy disables it.
- **Policy ownership:** Multi-account policy is primarily project-owned. Runs snapshot the effective policy space at run start, and each attempt/message records the effective account actually used.
- **Requested/effective identity:** Requested provider/model/effort/persona/auth mode/account policy and effective provider/model/effort/persona/auth mode/account MUST remain visible and queryable.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md#AuthPolicy, ContractName:Plans/storage-plan.md

- **Rewrite alignment:** Account selection and env/config wiring are part of the Provider contract. State lives in seglog + redb; secrets remain outside canonical storage. GUI requirements remain UX-only with no Iced/Slint lock-in inside this document.
- **Non-goal:** Same-provider accounts are not treated as an interchangeable bucket. Provider-aware, account-aware, and execution-role-aware policy is required.

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

### 3.4 Rewrite alignment

- **Storage:** Account registry, active index, cooldowns, usage cache in **redb** (or single JSON under app data root until redb). Usage/rate-limit events in **seglog**. No SQLite.
- **Provider abstraction:** Account selection and env/config wiring are part of the **Provider** contract.
- **UI:** GUI and usage views are **UX requirements only**; no Iced/Slint commitment (future UI is Slint per rewrite-tie-in).

### 3.5 Current Puppet Master context

- **Stack:** Rust/Iced; 6 providers (CLI-bridged: Cursor, Claude Code; Server-bridged: OpenCode; Direct: Codex, GitHub Copilot, Gemini); CLI-only (no in-process OAuth store). **PlatformConfig** per platform -- one identity per platform; no accounts[] or activeAccountId yet. **platform_specs.rs** is single source of truth for CLI/auth -- no multi-account data today.
- **Future:** When native auth for Codex, Copilot, Gemini lands, use OpenCode PR #11832 store + rotating-fetch + per-request context as the blueprint for in-process tokens and HTTP.

---

## 4. Data model
### 4.1 Account profile (canonical)

Each provider registry entry contains ordered `accounts[]` with stable per-account records.

Minimum account fields:
- `account_id`
- `label`
- `auth_surface` = `oauth | api_key | google_credentials | device_code | cli_interactive` (provider-specific subset)
- `enabled`
- `priority` (integer; lower number = higher priority)
- `provider_identity?`
- `credential_ref`
- `configured_project_id?`
- `threshold_override?`
- `switch_mode_override?`
- `cooldown_until?`
- `retry_budget?`
- `allowed_roles?`
- `disallowed_roles?`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#AuthState, PolicyRule:no_secrets_in_storage

Rules:
- `account_id` is the stable internal identifier.
- `label` is user-facing and editable.
- `provider_identity` is provider-native identity metadata only and MUST NOT replace `account_id`.
- `credential_ref` is the canonical non-secret handle for OS-stored credentials.
- Secrets, API keys, bearer tokens, refresh tokens, and raw credential payloads MUST remain outside redb/seglog.

ContractRef: ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md#INV-002

### 4.2 Project policy and precedence

Project-owned provider policy supports:
- provider block (`enabled`, default switch mode, default threshold, selection mode, default auth-surface order, account list)
- role-by-provider overrides
- role-by-account overrides
- manual preferred-account override/debug control

Canonical precedence:
1. provider default
2. account override
3. role-by-provider override
4. role-by-account override
5. run snapshot freezes effective policy space
6. attempt/message selects effective account within that frozen space

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, PolicyRule:Decision_Policy.md§3

### 4.3 Account state model

Account state uses orthogonal account-scoped dimensions:
- `credential_state` = `missing | present | expired | invalid | revoked`
- `configuration_state` = `ready | needs_configuration | validation_required`
- `availability_state` = `eligible | cooldown | hard_blocked | disabled`

Rules:
- provider-level `AuthJobState` chips are derived from these dimensions; they are not a replacement for them.
- `needs_configuration` is the canonical user-facing partial-setup state for Gemini OAuth accounts.
- account-scoped state applies equally to Gemini OAuth and Gemini API-key profiles under the same provider.

ContractRef: ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/FinalGUISpec.md

### 4.4 Provider capability block

Each provider advertises the capability fields needed for account routing and recovery. Useful canonical fields include:
- `supports_multi_account`
- `account_identity_kind`
- `auth_recovery_methods`
- `switch_boundary`
- `quota_signal_sources`
- `quota_signal_confidence`
- `supports_threshold_switch`
- `supports_hard_exhaustion_detection`
- `supports_rate_limit_detection`
- `supports_reset_countdown`
- `supports_manual_set_active`
- `supports_cooldown`
- `supports_retry_budget`
- `supports_role_scoped_account_pools`

Gemini capability posture:
- `supports_multi_account = true`
- `switch_boundary = attempt_or_message`
- `supports_threshold_switch = true`
- `supports_hard_exhaustion_detection = true`
- `supports_rate_limit_detection = true`
- `supports_reset_countdown = true`
- `supports_manual_set_active = true`
- `supports_cooldown = true`
- `supports_retry_budget = true`
- `supports_role_scoped_account_pools = true`

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/usage-feature.md

### 4.5 Selection flow (canonical)

Selection flow for any new attempt/message:
1. determine execution role
2. determine requested provider/model/effort/persona/auth mode/account policy
3. load provider capability block
4. resolve allowed auth surfaces from requested auth mode
5. load eligible account pool for provider + role + allowed auth surfaces
6. filter out disabled, disallowed, cooldown, hard-blocked, or unusable accounts
7. prefer current account if still healthy enough
8. otherwise choose the highest-priority eligible account within the highest-ranked viable auth surface
9. record requested vs effective provider/model/effort/persona/auth/account and selection reason

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§3
## 5. Auto-rotation
- **Switch boundary:** Switching happens only at attempt/message boundaries. Never switch mid-attempt.
- **Completed ownership rule:** A completed message/attempt always belongs to the account it actually used. The next message/attempt re-resolves and may switch immediately.
- **Sticky behavior:** Routing is conservative and sticky. A recovered higher-priority account does not immediately steal traffic back unless policy and health justify it.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md

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
5. log-derived heuristics
6. local counters only

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

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/FinalGUISpec.md

Manual controls:
- manual `set active` / preferred account exists as an override/debug control
- manual control does not redefine the default operating model
- manual control still records requested vs effective account identity and switch reason

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md#AuthPolicy
## 6. Provider-specific behavior
| Provider | Account identity / auth surfaces | Usage / health signals | Recovery / switching notes |
|----------|----------------------------------|------------------------|----------------------------|
| **Claude Code** | One CLI profile/config per account; `CliInteractive` auth surface | Anthropic usage API + PTY/runtime signals | Optional session migrate/resume remains provider-specific; cooldown on auth/rate-limit failure |
| **Codex** | Mixed OAuth/device-code/API-key support depending transport/runtime | CLI/runtime usage + provider signals where available | 429/auth failure may move to the next eligible account at the next boundary |
| **Gemini** | One provider with mixed `oauth` and `api_key` account pools; `GoogleCredentials` is capability-gated execution support where applicable | Provider runtime usage, provider quota API, provider usage API, provider error hints, and project rollups with signal-confidence labeling | OAuth and API key are distinct auth surfaces/quota planes; multiple OAuth and API-key accounts may coexist; media follows the same requested/effective auth/account rules as standard Gemini usage |
| **GitHub Copilot** | Multiple GitHub identities / org-scoped account choices under direct-provider auth | GitHub metrics + runtime/error signals | Separate GitHub auth realm semantics remain isolated from generic GitHub API auth |
| **Cursor** | Multiple config-path identities; manual or profile-driven switching | Provider-specific local/runtime signals only | No session migration; manual path/config controls remain provider-specific |
| **OpenCode** | Server-managed provider identities exposed through server-bridged capabilities | Server/runtime signals | Server credentials remain distinct from provider-native auth managed behind the server bridge |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/usage-feature.md, ContractName:Plans/rewrite-tie-in-memo.md

Rules:
- Same-provider accounts are not interchangeable.
- Provider capability data determines whether threshold switching, reset countdown, cooldown, retry budget, and role-scoped pools are supported.
- Gemini copy and UI MUST NOT present OAuth and API-key accounts as the same plan/bucket.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md#AuthPolicy, ContractName:Plans/usage-feature.md
## 7. Runner / orchestration contract

The multi-account contract applies across assistant, interviewer, builders, overseers, and node workers.

Rules:
- multi-account auto-switching is on by default for provider-using actors
- provider selection is provider-aware, account-aware, and role-aware
- same-provider accounts are not interchangeable
- manual set-active is an override/debug control rather than the main execution model

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/usage-feature.md

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

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Models_System.md
## 8. Usage and pick-best
- Usage/account pressure plugs into the shared usage model; do not create a parallel quota system for multi-account routing.
- Every provider-using interaction may update account health.
- Pick-best uses the strongest available account-health signals plus configured policy; it does not treat all signals as equally authoritative.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#AuthPolicy

Canonical Gemini usage/source expectations:
- show one shared Gemini usage surface rather than separate top-level OAuth/API pages
- label OAuth-backed views as `Gemini quota` when authoritative quota semantics are available
- label API-key/local-only views with source-qualified wording such as `Gemini (estimated)` when authoritative quota data is not available
- expose `signal_confidence` so users can tell whether quota pressure is authoritative, structured, heuristic, or local-only

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/rewrite-tie-in-memo.md

Priority and stickiness rules:
- lower numeric priority wins (`1` before `2` before `3`)
- prefer the current effective account if it remains healthy enough
- otherwise choose the highest-priority eligible account inside the highest-ranked viable auth surface
- do not bounce immediately back to a recovered higher-priority account unless policy and health justify it

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, PolicyRule:Decision_Policy.md§3
## 9. GUI requirements (UX only)
All of the following are UX requirements only; implementation may use the future UI stack without changing these behavioral contracts.

### 9.1 Setup + Health / Doctor visibility

- Setup and Health / Doctor MUST show the same provider summary for multi-account providers: current effective account, current effective auth mode, account count, cooldown/rate-limit summary, and last auth/config validation timestamp when available.
- Providers with account-scoped configuration state MUST surface `needs_configuration` and `validation_required` explicitly.
- Gemini MUST appear as one provider card with grouped account lists for `OAuth` and `API key`, not as pseudo-providers.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/rewrite-tie-in-memo.md

### 9.2 Config / Authentication view

- List accounts with label, auth-surface badge, provider identity metadata, configured project id when present, auth/configuration/availability state, priority, threshold, cooldown, and retry-budget summary.
- The provider-level control shows `requested_auth_mode = auto | oauth | api_key` for Gemini.
- Default Gemini auth preference is OAuth first under `auto`.
- Users may add accounts, remove accounts, edit priority integers, and set a manual preferred account as an override/debug control.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/storage-plan.md

### 9.3 Usage view

- Usage shows one shared Gemini surface with explicit source/effective-mode labels and account attribution.
- Show current effective account, current effective auth mode, switch reason, cooldown state, and signal-confidence/source labeling where available.
- OAuth-backed and API-key/local-only usage MUST NOT be merged into one unlabeled bucket.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/rewrite-tie-in-memo.md

### 9.4 In-session / status surfaces

- Status bars, thread headers, and run/session context surfaces show the current effective account, current effective auth mode, and relevant cooldown/pressure state when supported.
- Approaching-limit warnings are account-specific where the provider exposes enough detail.
- Media actions follow the same effective-auth/effective-account resolution model as normal Gemini usage; they are not a separate account system.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/FinalGUISpec.md

### 9.5 Notifications

- Auto-switch notifications MUST identify the effective account selected and why (for example `threshold_preemptive_switch`, `hard_exhaustion`, `rate_limit_pressure`, `account_unavailable`, or `policy_disallowed_current_account`).
- Notifications MUST NOT pretend a switch succeeded when no eligible backup account exists.
- Manual override / preferred-account mode remains visible so the user can understand why automation did or did not switch.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md
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
