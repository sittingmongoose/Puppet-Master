# Shard 009: Scope of the Usage Feature

Source: `Plans/usage-feature.md`

Source lines: L128-L372

Source SHA256: `72bdae3668eee969c2de469ca4d8ce227c67636de732ddbee56c90f385d2122e`

---

## Scope of the Usage Feature


### 1. Quota and plan visibility (primary)

- **5h and 7d windows:** Show current usage vs limit (e.g. "5h: X / Y", "7d: X / Y") per platform where the platform or org API provides it.
- **Plan type:** Show detected or configured plan (e.g. Pro, Team) where available (see AGENTS.md plan detection).
- **Placement:** Always visible in at least one of: dashboard, header, or a dedicated **Usage** page. Tier config / setup should show current usage when selecting a platform so users can avoid platforms near limit.
- **Refresh:** Background refresh (e.g. periodic or after runs) so numbers stay up to date without blocking the UI. Document which platforms support "live" vs "after-run" stats.
- **Always-visible limits:** Match UX expectations set by tools like [yume](https://aofp.github.io/yume/) -- 5h and 7d usage always visible so users don't need a manual "usage" command.

### 2. Alerts and thresholds

- **Approaching limit:** Optional warning when usage is near limit (e.g. 80% of 5h window) so the user can switch tier or pause.
- **Rate limit hit:** When a run hits quota/rate limit, surface a clear message and, where possible, suggested action (e.g. "Try again after X" or "Switch platform"); link to the Usage view.

### 3. Event ledger (existing concept, under Usage umbrella)


- **Event-level log:** Keep the existing concept of an event ledger (platform, operation, tokens in/out, cost, tier/session) so users can inspect per-request usage. This may remain the current "Ledger" page or be presented as a tab/section under a unified **Usage** area.
- **Filtering and export:** Retain filtering (e.g. by type, tier, session) and export (e.g. JSON) as part of the Usage feature.

### 4. Optional analytics and reporting

- **Aggregated view:** Over time, support an analytics view that aggregates usage by time window, platform, project, or tier (as in newfeatures §7). Can be a separate page or a section under Usage.
- **Cost tracking and attribution:** Where data is available (from platform APIs), show cost breakdowns by model, project, and date (see [openclaudecto](https://github.com/josharsh/openclaudecto), [yume analytics](https://aofp.github.io/yume/)).
- **Retention:** Policy for how long to keep usage/ledger data (e.g. file-based or redb-backed) to bound disk use while supporting 5h/7d and historical views.

### 5. Per-thread usage in Chat (OpenCode-style)

OpenCode Desktop implementation reference (non-binding):
- `packages/app/src/components/session-context-usage.tsx` is only a behavioral reference for the chat header context circle/button: hover shows total tokens, usage %, and total USD cost; click opens a `context` tab rather than replacing app-wide Usage.
- `packages/app/src/pages/session/session-side-panel.tsx` is the reference for opening that `context` tab in the side/review panel, not the main editor.
- `packages/app/src/components/session/session-context-tab.tsx` is the reference for the detail payload: session title, message counts, provider, model, context limit, total/input/output/reasoning/cache tokens, total cost, created/last-activity times, coarse context breakdown bar, system prompt, and raw per-message accordions with JSON.
- OpenCode message UI is a reference for hover-revealed icon actions and metadata rows on messages, but it does not satisfy PM's richer per-message info popover requirement; PM keeps the curated inspection and raw payload requirements below as the canonical target.

Per-thread context/usage in chat is a split inspect/action affordance rather than a direct jump to a chat-shell usage panel.

Rules:
- the chat header context circle is always the entrypoint for per-thread context state
- hover opens a lightweight status module showing `Usage`, `Tokens`, estimated `Cost`, and `More Details`
- click reveals the `Compact Now` action instead of immediately opening the detail surface
- selecting `Compact Now` dispatches the canonical compaction command for that thread
- selecting `More Details` opens or focuses the thread-scoped Context Detail Pane in an editor tab
- app-wide Usage remains the canonical aggregated platform view and is not replaced by this thread-scoped pane
- mid-stream updates are allowed but must use explicit in-progress states until final usage totals are known

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

The Context Detail Pane must support both curated inspection and raw payload inspection.

Required content:
- curated overview of thread counts, provider/model/mode/persona, and headline tokens/context/estimated cost
- grouped context and token breakdowns
- per-message inspection with human-readable fields first
- raw payload toggles for the full thread and for individual messages
- drill-downs by mode, provider, model, and other shared runtime identity dimensions when available

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md

Estimated-cost rule:
- per-thread chat cost uses the OpenCode-style normalization formula as the baseline approximation
- reasoning tokens are charged at the output-token rate for the estimate
- cache read and cache write buckets are included when pricing metadata exists
- provider-sensitive cache normalization caveats must remain visible in raw/debug paths and must not be hidden behind authoritative wording in the chat UI

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md
### Cursor -- API (usage/account only; not for model invocation)
Cursor usage is account and plan augmentation only. PM does not use a Cursor API for model invocation.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md

Canonical usage-source classes for Cursor are:
- `provider-reported`
- `team-admin-reported`
- `inferred_from_runtime_refusal`
- `inferred-from-runtime/editor-refusal`
- `/editor-refusal`

Rules:
- PM must not invent a fake universal remaining-request counter when Cursor exposes only plan totals, team allotments, or runtime/editor refusal signals.
- Cursor browser-auth accounts may provide strong local per-run usage, but `/limit` and account-row truth require provider or team API augmentation; PM must not treat inferred per-run data as a `remaining-requests` source.
- Cursor headless/runtime evidence may include structured per-run token usage, account identity, version, active model, available models, MCP status, and session/request IDs; until official account-limit data is stronger, Cursor CLI pressure remains `/inferred` from runtime/API augmentation or editor/runtime refusal rather than a precise remaining balance.
- The `cursor` binary may be an editor/remote CLI surface, so Usage treats `cursor-agent` as the account/runtime evidence target when attributing `/remote` execution.
- monthly included usage or request-allotment semantics are shown honestly as plan-cycle data rather than forced into a short rolling-window countdown.
- `cursor-agent` remains the runtime target for execution and account validation.
- `CURSOR_API_KEY` is an advanced/non-default setup path and does not change the CLI runtime ownership model.
- Usage UI must disclose whether the data comes from provider-reported plan data, team-admin data, inferred-from-runtime evidence, or editor-refusal evidence.
- Cursor instruction-sync status uses `Cursor Rules` as the user-facing label. PM generates `.cursor/rules/*.mdc` first, tracks compatibility projections such as `cursor/rules/*.mdc` under `/rules/`, and treats `.cursorrules` / `cursorrules` as `/deprecated` compatibility rather than the primary managed artifact.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md
### Codex -- Direct provider


### Codex direct-provider usage buckets

Codex is a direct provider in PM and supports multiple accounts across two distinct auth families:
- `Sign in with ChatGPT`
- `Use API Key`

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Usage rules:
- ChatGPT-backed Codex usage and API-key-backed Codex usage are distinct entitlement buckets.
- PM MUST NOT merge those buckets into one shared pressure or cooldown pool, even when they belong to the same human owner.
- plan-backed Codex accounts may expose included-usage windows and provider refusals.
- API-key-backed Codex accounts behave as API-billed usage and may not have the same reset semantics.
- Codex stale-vs-live provider/model labeling must distinguish last-known upstream provider/model data from the current direct-provider state, and Codex multi-account includes ChatGPT `/OAuth-style` auth and API-key auth side by side.
- Usage rows must label the bucket plainly, for example `Plan: ChatGPT Pro` or `Usage Bucket: API billed`.
- The API-key path displays `Uses API-billed Codex access and separate API usage limits` when explaining a switch between API-key-backed Codex usage and ChatGPT-plan usage.
- Codex GUI labeling may use the template `Plan: ChatGPT <tier>` when the plan tier is known; `/chatgpt` denotes the browser/ChatGPT-plan-backed bucket rather than the API-key billing bucket.
- `codex login status` is an allowed local probe for direct Codex login state and reports whether the account is logged-in. PM records that as setup/status evidence, not as usage quantity or quota evidence.
- Codex ChatGPT `/browser` accounts may expose strong local `/runtime` stats, but provider/runtime rate-limit hints must be parsed separately from token statistics so a row does not confuse token usage with quota or rate-limit pressure.
- For API-key-backed Codex, `Use API Key` is the canonical setup path; optional import from existing key or auth material is future/secondary and is not required for the core usage model.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md
### GitHub Copilot -- Direct provider
GitHub Copilot is a direct provider in PM.

PM keeps one auth-backed account row per GitHub login and may resolve one effective billing/entity context beneath that row when premium-request semantics require it.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Usage and blocked-state rules:
- if the user exhausts premium requests, Copilot can still fall back to included models for the rest of the month, but premium-request-backed behavior is subject to explicit block `/rate-limit/policy` state.
- premium-request exhaustion, paid-overage policy, org policy blocks, and entitlement-missing states are distinct conditions and must not all be flattened into a generic cooldown.
- blocked reasons should remain explicit, including `billing_entity_required`, `included_premium_exhausted`, `paid_overage_disallowed`, `copilot_entitlement_missing`, and `copilot_org_policy_blocked`.
- The default plain-language mapping for `included_premium_exhausted` is status `Premium requests exhausted`, subtext `Premium-request-backed features are unavailable until reset or policy change`, and secondary note `Included models may still be available` when included-model usage remains eligible.
- if multiple billing entities are available, the account may be `Logged in` but still `Needs setup` until the user chooses the effective billing entity.
- Usage and status surfaces must show the selected billing/entity context whenever it explains the active quota bucket.
- org/account metrics may strongly inform pressure, but exact hard-block semantics require explicit Copilot entitlement, policy, or runtime refusal evidence rather than inference from metrics alone.
- Team admin APIs such as `/metrics/spending` may inform Copilot pressure, but PM must not promise a simple per-account `remaining-requests` endpoint as account-row truth unless the provider exposes one.
- Team/enterprise request allotments, usage-based pricing controls, and admin `/dashboard/API` reporting are team-level augmentation surfaces; PM must keep `/enterprise` policy and billing context separate from per-account remaining-request truth.
- PM must not reduce Copilot pressure to only `has premium requests left` vs `does not`; provider evidence must preserve whether the account has premium requests left, does not, or is blocked by billing/entity, organization, or runtime-side entitlement policy.
- Paid overage disallowed by the selected organization `/enterprise` policy and provider `/runtime-side` auth or entitlement failures are distinct blocked/pressure causes.
- GitHub repository auth and local git/worktree behavior remain independent from GitHub Copilot account switching.
- `usage-record` / `usage_record` fields contain only attribution-relevant additive fields needed for usage owner attribution; `bridge-visible` fields are the subset needed to prove the runtime surface that actually executed the call, while scheduler-internal IDs remain scheduler/effective-resolution evidence and must not be inserted into `usage_record` by default.
- `usage-record` / `usage_record` extensions may include `effective_provider_family_id?`, `effective_transport_kind?`, `effective_connection_profile_id?`, and `effective_runtime_platform_id?` when those fields are required to attribute usage to the runtime surface that actually executed the call.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md
### Claude Code -- Admin API (existing)

- **Availability:** Anthropic **Admin API** (`/v1/organizations/usage_report/claude_code`); env: `ANTHROPIC_API_KEY`. Already documented in AGENTS.md.
- **What we get:** Organization-level usage and cost; `customer_type`, `subscription_type` for plan detection. Per-session usage also available from **stream-json** output when we use `--output-format stream-json` (usage events in the stream).
- **Usage feature:** Use Admin API for 5h/7d or org windows when key is set; use stream-json usage events for per-run tokens and optional mid-stream context %. No SDK required for CLI-based runs.
- API-backed Claude Code accounts can use authoritative cost and `/rate-limit` data to drive stronger `approaching_threshold`, `threshold_reached`, and `exhausted` pressure states.
- API-backed Claude Code accounts are the stronger path for precise cost `/token` reporting; subscriber-backed usage relies more on `/patterns`, runtime signals, and provider-reported limits that are not identical to API billing data.
- Claude Code subscriber-vs-API usage distinction is explicit: subscriber-backed Claude Code accounts, including Pro/Max style `/Max` sign-in, and API-backed or `/organization-backed` usage do not expose the same authoritative surfaces.
- Claude Code CLI subscription `/stats` visibility generally informs pressure; PM records `/exhaustion` only when the runtime or provider explicitly signals a hard block or exhausted state.
- API / Console / organization-backed Claude Code limits are org-level and may include monthly spend limits plus shorter-window rate limits such as `RPM` and `/TPM`; subscriber-backed rows must not reuse those hard limit semantics without provider evidence.

### Gemini Direct, Antigravity, and retired Gemini CLI usage
Gemini Direct usage must stay route-specific, and Antigravity CLI usage must be modeled as its own active CLI-runtime route where verified. Gemini CLI usage is retired/source-lineage only. Stale-canon wording that reduces Gemini to local counters, a single `mixed-account` provider, or a generic API-key `key-exception` is not sufficient for Usage.

The provider-doc reconciliation keeps `Plans/CLI_Bridged_Providers.md` as the owner for active CLI-runtime transport. Usage must not revive Gemini CLI as a live provider row; active Google-owned CLI-runtime evidence belongs to Antigravity.

#### Gemini direct

`Gemini` is the direct key-only, API-key-backed provider entry.

Rules:
- direct Gemini account rows are API-key-backed only.
- quota identity may depend on effective Google project context as well as the key itself.
- Gemini direct API-key setup uses `GEMINI_API_KEY`; Vertex-family quota evidence may come through `ADC`, `gcloud`, service-account JSON, or a Google Cloud API key only when the selected provider entry and auth family support it.
- For direct Gemini setup, `Use API Key` is the canonical setup path; optional future import of existing key material is not required for the core model.
- when PM cannot prove authoritative remaining `/quota`, the UI must show `estimated`, `/unknown`, or equivalent source-qualified wording rather than pretending the numbers are definitive.
- Gemini API key paths are pay-as-you-go with tier/model-based rate limits instead of fixed Code Assist daily `/minute` counters.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Media_Generation_and_Capabilities.md

#### Retired Gemini CLI usage lineage

`Gemini CLI` is not an active provider entry. The following tokens remain only as retired/source-lineage evidence.

Rules:
- Do not create active Gemini CLI usage rows.
- Do not aggregate Gemini CLI OAuth/API/Vertex usage paths into live Gemini family usage.
- Preserve exact lineage tokens such as OAuth, direct API key, Vertex/Google credentials, `/stats model`, `Configured`, `Working`, `Operational`, and requested/effective model differences for audit only.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

#### Family-pooling rule

When policy pools active provider entries, the Usage surface must show which concrete runtime surface actually handled the run and why. Gemini Direct and Antigravity can participate only when their effective capabilities satisfy the request. Retired Gemini CLI cannot be selected as an active pool member.

Gemini Direct account/plan UI and quota/usage tools are API-key/direct-route specific. Antigravity CLI usage rows carry their own effective model, account/profile/setup state, source confidence, and label. Family-level summaries may aggregate only after preserving requested/effective disclosures.

Usage UI and `/settings` surfaces inherit the GUI requested-vs-effective pattern: per-platform labels remain visible because quota semantics differ by provider, and Gemini rows must expose the requested auth/account intent beside the effective mode, quota bucket, and source label.

Before saving family-pooling changes, Usage shows the preferred provider inside the family plus a capability-guardrail explanation.

Active shared-provider capability posture is locked for Usage and account-pressure interpretation:
- `supports_multi_account = true`
- `supports_threshold_switch = true`
- `supports_hard_exhaustion_detection = true`
- `supports_rate_limit_detection = true`
- `supports_reset_countdown = true`
- `supports_manual_set_active = true`
- `supports_cooldown = true`
- `supports_retry_budget = true`
- `supports_role_scoped_account_pools = true`
- `auth_recovery_methods` include browser relogin `/re-auth` for OAuth and key replacement/update for API-key accounts.
- `quota_signal_sources` include direct provider quota signals when available, structured runtime output, provider heuristics, error hints, and local rollups.

Gemini Direct `/quota` visibility is API-key/direct-route aware. Antigravity usage visibility depends on the verified CLI/runtime signals available for the selected account/profile/model. Stale `/AI-Studio-oriented` and Gemini CLI Code Assist-style copy is allowed only as historical context: live Usage UI and specs must label the resolved provider route, auth mode, usage source, source confidence, and quota bucket.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md
### Summary table (augmentation sources)
Provider/backend usage normalization distinguishes authoritative native usage `/quota`, authoritative session `/tool` stats from local runtime, and inferred `/estimated` usage. UI copy must label which evidence class is shown instead of presenting every provider row as equally authoritative.

| Provider entry | Primary usage sources | Auth / setup context | UI disclosure rule |
|---|---|---|---|
| **Cursor CLI** | provider-reported plan data, team-admin reporting, inferred runtime refusal | `cursor-agent` login default; API key advanced/non-default | show source-confidence; do not fake precise remaining counters |
| **Codex** | direct provider usage, plan windows, provider refusals, API-billed usage | `ChatGPT` or `API key` account rows | keep plan-backed and API-billed buckets separate |
| **GitHub Copilot** | provider quotas, premium-request semantics, runtime refusals, policy blocks | GitHub login plus selected billing/entity context when required | show billing/entity and blocked reason explicitly |
| **Claude Code CLI** | API/admin usage where available, runtime signals, softer subscriber stats | subscriber, console/API, or SSO account rows | show whether data is authoritative or inferred |
| **Gemini** | provider usage, quota APIs, project attribution, error hints | direct API-key account rows | show project attribution and estimated-vs-authoritative status honestly |
| **Antigravity CLI** | CLI/runtime signals, model-list/prompt-output evidence, provider counters when available | Google OAuth/system-keyring, ADC, and local profile-root setup where verified | show concrete runtime surface, model, account/profile, and source confidence |
| **Gemini CLI (retired)** | source-lineage only | OAuth, API-key, `ADC`, `gcloud`, service-account, or Vertex account rows are not active setup paths | do not show as an active usage row |
| **OpenCode** | server health/discovery plus upstream provider usage where exposed through the server | managed or attached server profiles; provider-scoped OAuth record pools may expose an active record and ordered account lists | separate connected/discovery status from actual provider availability |

`Server Profiles` render inside the same runtime ontology as account-backed selectable units: they use a `row-type` badge and `/secondary` label instead of becoming a separate configuration system.

Cooldown/reset display rule: `authoritative_rate_limit_or_cooldown` and explicit provider `/reset` or `/cooldown` values outrank local counters. Known reset/cooldown times tick live; unknown values render `Unknown reset` or `Unknown cooldown end`, never a fabricated countdown.

Recovery reason codes include `cooldown_expired`, `health_recovered`, `credentials_revalidated`, and `provider_reconnected`; they restore eligibility only after the matching pressure, health, credential, or connection evidence is current.

Per-profile usage reconstruction may inspect account-specific config/session data, but history isolation or merge decisions, auth/session state, trust, chat `/project` history, runtime caches, and provider-native ephemeral state remain provider/runtime facts rather than usage-ledger truth.

Direct providers with coding-plan-branded products keep provider-specific reset semantics. `Alibaba Coding Plan` has fixed reset windows at 5-hour, weekly, and monthly boundaries from official docs; PM must preserve those window labels and evidence instead of flattening them into a generic quota bucket. `MiniMax Coding Plan` exposes dedicated remains and `/quota` state with 5-hour resets, so PM preserves the MiniMax reset label and source evidence.

`Z.AI Coding Plan` usage remains `Z.AI` provider usage with plan-dependent quota/reset semantics on the coding-plan endpoint. Until the active plan proves exact windows, PM labels the reset evidence as plan-dependent instead of presenting a fixed reset countdown.

Gemini CLI structured session stats from `gemini -p ... --output-format json` may include `usage`, `modelUsage`, `permission_denials`, and `fast_mode_state`; PM records these as provider/runtime evidence rather than as a universal quota counter.

Usage evidence must keep the `documented/default expectation` separate from the `effective observed state` whenever provider docs, runtime output, or account-specific behavior disagree.

Provider and `/account` setup is intentionally spread across Settings `/Auth/Health/Usage` surfaces; Usage consumes readiness and pressure facts without collapsing setup into one Agent-Config page.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/FinalGUISpec.md
### Direct-provider status probes

Codex direct-provider setup may use `codex login status` as a local probe for account login state. When it reports logged-in state, PM records that as setup/status evidence only; it does not convert the probe into usage quantity, quota, or remaining-window evidence.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
