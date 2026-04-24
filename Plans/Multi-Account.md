# Multi-Account Specification

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


**Status:** Single spec for implementation -- another agent may derive an implementation plan from this document.  
**Cross-references:** Plans/rewrite-tie-in-memo.md, Plans/storage-plan.md, Plans/usage-feature.md, AGENTS.md (Usage Tracking, Platform CLI Commands, Gemini auth exception).

---

## 1. Purpose and scope
- **Purpose:** Support multiple accounts per provider so users can sign into several identities for Claude Code, Codex, Gemini, GitHub Copilot, Cursor, and OpenCode, with conservative account stickiness, threshold-based switching when supported, and provider-specific recovery behavior.
- **Scope:** Multi-account routing is shared provider-runtime behavior for every provider-using role, including assistant, interviewer, requirements builder, PRD builder, package/seam overseers, node workers, and overseer-spawned workers. It is not an Orchestrator-only feature.
- **Gemini scope:** Gemini Direct (`gemini`) and Gemini CLI (`gemini_cli`) are separate provider entries. Gemini Direct is the direct API surface and is API-key only. Gemini CLI is the CLI-wrapped surface and may use OAuth-backed, API-key, or Vertex/Google-credential account rows under its own policy.
- **Provider-entry count:** The current planning model contains 7 provider entries: Gemini Direct, Gemini CLI, Cursor CLI, Claude Code CLI, Codex, GitHub Copilot, and OpenCode.

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

## Canonical data-shape reconciliation

This section owns the canonical requested/effective account identity contract for all provider-using actors.

### Required data shape

Every runtime, bridged-provider, and permission-facing envelope that carries account identity MUST preserve:
- `requested_account_id`
- `requested_account_policy`
- `requested_account_binding`
- `effective_account_id`
- `effective_provider_identity`
- `execution_role`
- `operational_identity`

Rules:
- `account_id` is the stable durable identity.
- `provider_account_id`, `login`, and other provider-native handles are subordinate provider metadata only; they MUST NOT replace stable canonical identity.
- requested/effective account identity MUST remain visible through runtime resolution, bridged-provider envelopes, historical snapshots, and permission or approval consumers.
- `requested_account_binding` is the canonical selector for `none`, `preferred`, or `required`; fallback behavior keys from binding rather than ad hoc provider heuristics.
- same-provider rows are not interchangeable when auth family, billing context, or runtime surface differs.

Shared actor/runtime boundary:
- assistant, chat, interview, builder, and other conversational actors share the same provider/runtime identity semantics as Orchestrator-managed execution.
- those actors remain distinct actor/run kinds; they are not renamed into package, seam, or node execution objects.
- cross-surface consumers may reuse the same requested/effective identity envelope, but they MUST preserve actor kind and execution context instead of collapsing them into orchestration-only terms.

This owner section governs later account-resolution detail in §§4.5 and 7.

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

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/usage-feature.md

### 4.2 Account record (canonical)

Account-backed providers store ordered account rows with stable ids.

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
- `provider_identity` is descriptive metadata only.
- secrets remain outside config/state stores.
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
- Gemini direct API-key accounts are separate rows from Gemini CLI auth-backed rows because they live on different provider entries.

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/usage-feature.md

### 4.5 Selectable unit and runtime resolution

ContractRef: Plans/Contracts_V0.md#4. Auth contracts, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules), Plans/GitHub_API_Auth_and_Flows.md#Credential store keying (canonical), Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/assistant-chat-design.md#Canonical navigation model

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
| Provider entry | Identity shape | Usage / health signals | Recovery and switching notes |
|---|---|---|---|
| **Gemini** | Direct API-key account rows only | provider/runtime usage, quota APIs, project attribution, error hints | project context may affect effective quota identity; media capability follows the same requested/effective account model |
| **Gemini CLI** | CLI-backed account rows across OAuth, API-key, and Vertex/Google credential families | provider settings, CLI/runtime signals, trust-gated MCP visibility, softer or authoritative counters depending auth family | PM pre-creates account roots, validates auth/config separately, and may observe provider-side model rerouting |
| **Cursor CLI** | `cursor-agent` profile/account rows; browser login default, API key advanced/non-default | provider-reported, team-admin-reported, or inferred runtime/editor refusal signals | PM-owned `HOME`/`XDG_*` roots define account isolation; API-key path is advanced only |
| **Claude Code CLI** | CLI-backed account rows across subscriber, console/API, and SSO families | API-backed accounts can use stronger authoritative usage; subscriber accounts may rely on softer or inferred pressure | scope-aware config overlays and softer threshold behavior for subscriber paths |
| **Codex** | Direct-provider account rows separated by `ChatGPT` and `API key` auth families | plan-backed included usage vs API-billed usage are separate buckets | PM must not merge plan-backed and API-billed usage/cooldowns |
| **GitHub Copilot** | one GitHub-auth-backed account row with one or more billing/entity contexts | premium-request quotas, org policy blocks, entitlement validation, runtime errors | blocked states may be policy-based rather than timer-based; billing entity selection can gate readiness after login |
| **OpenCode** | server profiles only (`Managed Server` or `Attach to Existing Server`) | health, discovery, and server-managed provider/model state | PM owns lifecycle only for managed profiles; attached profiles remain partially reflect-only |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md

Provider rules:
- same-provider rows are not interchangeable when auth family, billing/entity context, or profile mode changes quota or recovery behavior.
- `Gemini` direct and `Gemini CLI` are separate provider entries and may still participate in one family pool when policy allows.
- Codex and GitHub Copilot are direct providers, not CLI-backed execution surfaces in PM.
- GitHub API auth used for repository operations remains independent from GitHub Copilot provider auth.
- OpenCode skills and MCP behavior sit above the provider list exposed by OpenCode; PM should not invent Codex- or Copilot-specific skill plumbing inside the OpenCode server profile.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/FinalGUISpec.md
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
- show one shared Gemini-family usage surface rather than separate top-level Gemini Direct vs Gemini CLI pages
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

### 9.2 Account and profile rows

Each row shows:
- label
- auth family or profile mode
- current state
- pressure/cooldown summary
- entitlement/billing secondary line when relevant
- last validation or health timestamp
- primary actions appropriate to the row type

Row rules:
- Codex `ChatGPT` and `API key` rows remain separate top-level rows.
- GitHub Copilot shows one auth-backed account row and exposes available billing entities in the inspector rather than minting fake top-level accounts.
- OpenCode shows server-profile rows labeled as `Managed Server` or `Attach to Existing Server`.
- row actions include `Add Account`, `Add Profile`, `Set Preferred`, `Refresh Usage`, `Revalidate`, and profile-specific repair/reconnect actions where applicable.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

### 9.3 Setup and remediation UX

Provider/account setup flows must distinguish authentication from readiness.

Required states:
- `Logged out`
- `Logging in`
- `Logged in`
- `Needs setup`
- `Validating`
- `Ready`
- `Auth expired`
- `Validation failed`
- `Logging out`

Rules:
- `Logged in` is not the same as `Ready`.
- Copilot may require `Choose Billing Entity` before reaching `Ready`.
- Vertex/Google Cloud Gemini CLI setups may require credentials, project/location selection, and trust validation before reaching `Ready`.
- Cursor CLI browser login is the default path; API key is exposed as an advanced optional path only.
- provider-reported cooldowns remain read-only facts; PM pause and recheck controls are separate overlays.

ContractRef: ContractName:Plans/Contracts_V0.md#Setup/Health-lifecycle-contracts, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md

### 9.3.1 Account registration flows

Provider settings MUST expose account lifecycle controls in a consistent location while still honoring provider-specific auth requirements.

Required flows:
- **Add account:** `Settings -> Providers -> [Provider] -> Add Account`.
- **Edit account:** allow `display_name` changes and credential rotation; rotating a credential MUST trigger the provider's re-auth or revalidation flow before the updated row returns to `Ready`.
- **Remove account:** present a confirmation dialog, remove the credential from the OS/store indicated by `credential_ref`, remove the account record, then reassign any threads or defaults pointing at that account to the provider's default account.
- **Default account:** each provider has exactly one default account. PM uses that default whenever no explicit account selection is made by policy, role, or manual override.

Registration rules:
- account creation mints a stable `account_id` as a ULID.
- new account rows use the canonical schema `{ account_id: ulid, provider_id, display_name, auth_method, credential_ref, created_at, last_used_at, status }`.
- `status` closes to `active | expired | revoked | error`.
- removing a non-default account MUST preserve requested/effective history for past runs even though the live row is deleted.
- removing the current default account MUST atomically promote another eligible account or leave the provider in an explicit no-default state that blocks new runs until resolved.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### 9.3.2 Authentication flow walkthroughs

Authentication walkthroughs define the expected PM-side orchestration around provider-native auth mechanisms.

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

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md

### 9.4 Usage and runtime visibility

Usage and status surfaces MUST show:
- current effective account or server profile
- current effective auth mode
- current effective billing/entity context when relevant
- pressure/cooldown state
- source-confidence, stale, or estimated labels when data is not authoritative
- switch/failover reason when PM changed the selected unit

Usage rows should prefer plain-language statuses such as `Working` or a concrete failure reason instead of transport-internal terminology.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 9.5 Instructions, skills, and MCP in Agent-Config

Agent-Config must expose:
- shared instruction panes (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `Cursor Rules`)
- provider-native advanced panes for GitHub Copilot
- PM-native skills with readiness/fix text/actions
- PM-native MCP servers with per-provider/runtime effective status in inspectors

Rules:
- provider-native files under PM control expose `In Sync`, `PM Outdated`, `Provider Modified`, `Projection Failed`, or `Unknown` drift states with `Repair`, `Detach`, and `View diff` actions.
- skill rows use plain-language statuses, fix text, and a primary remediation action.
- MCP rows are server-centric at the top level; per-provider/runtime state appears in the inspector rather than pretending every provider has a literal install state.

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
