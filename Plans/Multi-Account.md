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
The multi-account system is built from provider entries, account records, entitlement contexts, server profiles, and the derived selectable units PM uses at runtime.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md

### 4.1 Provider entry (canonical)

Each provider entry represents one concrete runtime surface, not a loose vendor family label.

Examples:
- `gemini` direct provider
- `gemini_cli`
- `cursor_cli`
- `claude_code_cli`
- `codex`
- `github_copilot`
- `opencode`

`provider_family_id` is additive grouping metadata only and MUST NOT replace the concrete provider entry id.

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

Examples:
- Codex `ChatGPT` and Codex `API key` rows are separate account rows.
- Gemini direct API-key accounts are separate rows from Gemini CLI auth-backed rows because they live on different provider entries.

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/usage-feature.md

### 4.3 Entitlement and billing context

Some account-backed providers resolve an additional quota or policy bucket beneath the auth identity.

Required behavior:
- GitHub Copilot keeps one auth-backed account row and one or more billing/entity contexts beneath it.
- billing/entity selection is cached per account row.
- changing billing/entity selection affects subsequent runs only; it does not mutate an in-flight attempt.
- entitlement context is surfaced in requested/effective runtime records through additive fields only.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

### 4.4 Server profile (canonical)

Server-bridged providers use server profiles instead of account rows.

Minimum fields:
- `connection_profile_id`
- `provider_id`
- `label`
- `profile_mode = managed | attached`
- endpoint/config summary
- health state
- discovery state
- PM ownership mode
- last discovery snapshot metadata

`connection_profile_id` is the stable internal key for OpenCode runtime selection.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### 4.5 Selectable unit and runtime resolution

The scheduler resolves one selectable unit per attempt boundary.

Selectable-unit rules:
- account-backed providers select one effective account row and, when required, one effective billing/entity context.
- server-bridged providers select one effective server profile.
- the selected unit freezes into requested/effective runtime disclosure before provider handoff.
- the same auth identity with multiple billing/entity contexts does not become multiple fake top-level accounts.
- account rows and server-profile rows share one runtime ontology in Agent-Config and Usage, but their stored identities remain distinct.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md
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
