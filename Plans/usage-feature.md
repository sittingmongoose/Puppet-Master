# Usage Feature -- App/GUI Plan


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Export taxonomy and manifest contract
### Projection trust and action gating
### Execution role and operational identity
### Account switch and pressure history


### Identity and blocked-policy transfer cluster
### Bridge-field precedence for attempt/provider/usage/receipt joins
### Blocked-owner eight-kind taxonomy and escalation ladder surfaces
### Artifact envelope routing preference
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document:
- Defines the "Usage" feature as a first-class area in the app/GUI
- Describes scope, data sources, and UX goals
- References existing usage tracking and related plans
- Remains implementation-agnostic so it stays valid across tech stack changes

## Rewrite alignment (2026-02-21)

The rewrite described in `Plans/rewrite-tie-in-memo.md` reinforces this plan's intent: Usage should be implemented as **projections/rollups** over the canonical event ledger (seglog), with durable KV state in redb and fast search in Tantivy--without changing the UX requirements in this document. 5h/7d and dashboard numbers are served from **redb rollups** produced by **analytics scan jobs** that aggregate over the seglog (and any JSONL mirror); the Usage view reads these rollups rather than scanning the ledger on demand.

**ELI5/Expert copy alignment:** Authored usage tooltip/help text in this plan (for example context-circle hover copy and explanatory hints) must provide both Expert and ELI5 variants and follow the authoritative checklist in `Plans/FinalGUISpec.md` §7.4.0.

## Storage dependency (implementation)

Usage depends on a **complex storage solution**; the feature cannot deliver 5h/7d, dashboard, and analytics at scale without it. The canonical design is in **Plans/storage-plan.md** (validated by deterministic verifier gates and SSOT evidence contracts). Implementers must have the following in place for Usage to read from rollups and optional search:

| Dependency | Purpose for Usage |
|------------|-------------------|
| **Seglog** (canonical event stream) | All usage-relevant events (tokens, requests, errors, platform, tier, session) are appended here; single source of truth for analytics. |
| **redb** (settings / sessions / runs / checkpoints) | Durable KV for app state; also stores **analytics rollups** (5h/7d counters, tool latency distributions, error rates) that the Usage view and dashboard query. |
| **Projector pipeline** | seglog → JSONL mirror (human-readable), seglog → Tantivy indices (chat/docs/log summaries if Usage includes search), projector checkpoints in redb. |
| **Analytics scan jobs** | Scan seglog (or JSONL mirror) for counters; compute tool latency distributions, error rates, usage-by-window; persist rollups in redb for fast dashboard/Usage queries. |

**Implementation checklist** (from Plans/storage-plan.md; complete before Usage can rely on redb rollups):

- [ ] Implement seglog writer for canonical event stream.
- [ ] Implement redb schema + migrations for settings/sessions/runs/checkpoints.
- [ ] Implement projector pipeline:
  - seglog → JSONL mirror (human-readable)
  - seglog → Tantivy indices (chat/docs/log summaries)
  - persist projector checkpoints in redb
- [ ] Implement "analytics scan" jobs:
  - scan seglog for counters (tool latency distributions, error rates)
  - store rollups in redb for fast dashboard queries

Until this stack exists, any temporary compatibility path MUST still preserve the canonical pipeline: 5h/7d and dashboard windows are owned by rollups, not by ad hoc `usage.jsonl` scans. `usage.jsonl` may still appear as a human-readable mirror or Ledger compatibility input during migration, but it is not the canonical rollup source.

### Usage storage and routing clarifications

- Usage storage-doc dependencies are `Plans/storage-plan.md` and `Plans/FinalGUISpec.md`: seglog owns the append-only event source, redb owns durable KV `/settings/state`, checkpoints, projections, and rollups, Tantivy owns search indices, and any JSONL or `usage.jsonl` output is a projector mirror rather than canonical truth.
- Usage `/runtime/storage` paths and artifacts are scoped per-project, per-run, per-package, and per-lane; old tier/workspace-only layouts remain migration inputs and must not replace canonical project/run/package/lane identity.
- Usage owns the cross-surface `/quota/alerts/analytics/product-shape`, usage-tracking, and `/runtime/event/GUI` product contract while storage and FinalGUISpec continue to own the persistence stack and shell presentation rules.
- Settings and help surfaces such as `/help/project-status`, `/event/alert`, blocked-sequence, startup-recovery, and DAE policy outcomes must preserve ownership, severity, persistence, and follow-through rather than becoming loose usage warnings.
- `thread_blocked_notice` and `wizard_runtime_state` may preserve `resume_url?` only as compatibility recovery data; Usage opens blocked and wizard subjects through shared route-target payloads rather than storage-plan special-casing.
- GUI deep-links no longer use `run_id/thread_id/timestamp`, `/thread_id/timestamp`, `usage_event_seq`, broad timestamp filters, or tier-based `usage.jsonl` rollups as canonical navigation. They resolve object-first pivots through `usage_event_ref`, UsageRecord identity, runtime object identity, and Ledger/Usage route targets.
- Usage and storage are attempt-centric for runtime attribution and preserve tier-centric labels only as compatibility vocabulary. Durable switch and pressure history uses actor-scoped snapshots plus first-class account-switch and pressure-episode records instead of only per-attempt `recent_switch_reason` or `account_switch_reason` fields.
- Usage export semantics stay distinct: record export returns exact `/records` with stable ids, canonical ids, `/refs`, metadata, and schema-aware payloads; bundle export packages records, Evidence items, attached `/blobs/files`, thread export/share payloads, selected-object bundles, `.pm-bundle` configuration manifests, JSONL/JSON run-history artifacts, and a manifest; view export produces user-facing filtered table/list/chart output, CSV/JSON summaries, search results, analytics views, and graph `/render` convenience output without becoming canonical record truth.
- `runtime-story` and audit surfaces consume append-only `account_switch_event` and `account_pressure_episode` history so Usage, History, Ledger, Orchestrator, Dashboard, and Account/Usage Pressure projections share the same durable facts; switch-history is an owned event family, not an under-owned view-only hint.
- Shared runtime identity and bridged-provider envelopes expose `requested_account_id?`, `effective_account_id?`, execution-scope fields, `actor_kind`, and `execution_role` so Usage can attribute account and actor context without duplicating provider ownership.
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` remains the version-governance dependency for `/account/trust` actor/account/trust categories before those semantics are added to stream fields.
- `Plans/Prompt_Pipeline.md` and `Plans/FinalGUISpec.md` consume Usage runtime details for History, Ledger, and Orchestrator views, including account-switch, pressure, execution-role, and route-target disclosure.
- Bridge-field precedence is explicit: `attempt_id` stays the local runtime anchor; `provider_attempt_ref?` appears on the `attempt_record` as the provider/runtime execution trace handle; `usage_event_ref` is the Usage bridge; and receipt refs remain external side-effect lineage. `opaque-but-real` provider continuity fields must have a legal bridged-provider schema slot so reconnect/replay semantics are not under-specified before account-switch history is joined.
- Tool traces that originate from a provider-backed attempt carry `provider_attempt_ref?` whenever that provider/runtime handle exists; Usage joins that trace through shared usage identity rather than feature-local cost or receipt notions.
- Usage consumes `Plans/Widget_System.md` and `/Widget_System.md` only for widget hostability, layout, and configuration persistence; Widget_System's broad pre-rewrite Orchestrator widget model is compatibility lineage, not Usage ownership.
- Usage follows graph-scale guidance across Seams, Evidence, History, and Ledger: filtered CSV is a view export rather than canonical history, JSON summaries are not record exports unless they preserve the exact record envelope, monolithic plan-graph export stays derived, and JSONL mirror export is projection-derived rather than a replacement for seglog ownership. `Orchestrator_Page.md` CSV/JSON exports and `/evidence/history/record-bundle` bundles must preserve the same record/bundle/view distinction.
- Orchestrator `Progress` widgets embedded or linked from Usage inherit `focused_run_id` and page trust state automatically; widget config is limited to local presentation such as collapsed sections, chart style, sort, density, visible columns, or safe subset filters that cannot escape page scope.
- `Plans/Executor_Protocol.md` and `/Executor_Protocol.md` own blocked/runtime recovery mint/ownership rules; Usage consumes those `/runtime` ownership outcomes without inventing a separate blocked or recovery authority.
- Usage follows `Plans/FinalGUISpec.md` and `/FinalGUISpec.md` appendix C.5 for backup-preserving dashboard widget layout migration: `dashboard_layout:v1` and `dashboard_layout` remain backup/migration reads, future reads use `widget_layout:v1:dashboard`, and the active `widget_layout` family takes precedence.
- Quota and pressure detection accept mixed signal sources: runtime outcomes, provider capabilities, heuristic `/log-derived` hints, and explicit `/pressure` evidence. Usage labels incomplete live-API availability rather than presenting inferred pressure as exact provider quota truth.
- project-card usage copy stays compact: one primary line carries current state, owner, and reason; one secondary line carries active/background/historical summary; detailed per-run usage remains in drill-down records rather than being dumped into the card.
- Quiet suppression only affects advisory resurfacing. Attention center and project badges must preserve canonical blocked and `/approval-wait` rows with precise owner and reason metadata, even when a quiet window is active.
- `tool_llm_trace` records carry `attempt_id?`, `provider_attempt_ref?`, and `execution_role?` so tool, runtime, and Usage projections can join the same execution identity without local argument guessing.
- Usage consumes `Project_Output_Artifacts.md` and `Project_Output_Artifacts` through a seglog-first / staging-second artifact model that aligns subject-open routing with canonical record identity before staging views become user-facing.
- `UI_Command_Catalog.md` and `UI_Command_Catalog` wrappers must normalize artifact actions, thread usage actions, panel switches, and Orchestrator pivots into shared route/subject payloads rather than preserving separate local arg sets.
- `storage-plan.md` and `storage-plan` thread/run history export to JSONL/JSON is a coarse export enhancement only; Usage treats it as projection output over canonical records rather than a replacement for the record/bundle/view taxonomy.
- Runtime recovery gate material with the `Runtime Recovery Canonicalization Gate Addendum` label, runtime-lineage checks, and free-floating notes must be integrated into numbered gate canon before Usage relies on it as a blocked/runtime authority.
- Usage freshness is a user-trust requirement: stale values must be visibly marked with `Last updated` and an explicit `Refresh` action so old numbers are never presented as current.
- Usage consumes `/package` and `/worktree` cleanup state only after owner records mark stale lanes or worktrees `cleanup_eligible`: lane/package completion, graph-patch supersession, revoked/reopened flow via `/reopened`, and completed recovery may make old backing removable only when no retention reason remains.
- `Provider_OpenCode.md`, `Provider_OpenCode`, `CLI_Bridged_Providers.md`, and `CLI_Bridged_Providers` must carry account identity and execution-scope attribution before Usage projections consume provider events, so account identity is not silently lost before rollups see the data.
- `cmd.nav.open_usage_subject` resolves canonical Usage/Ledger identity from `usage_event_ref` or an equivalent usage target; domain-specific usage commands are wrappers over the shared route/subject model, not independent argument families.
- `/multi-account` usage surfaces keep configurable thresholds, platform quota visibility, rate-limit/reset countdowns, project-scoped usage storage, dashboard widgets, runtime event persistence, and usage + ledger + analytics rollups in one Usage projection model.

## Executive Summary

The app will expose a **Usage** section that gives users clear, persistent visibility into platform quota and consumption. Goals: show 5h/7d usage and plan type where available, surface event-level usage (ledger) and optional analytics, and warn when approaching limits so users can switch platform or pause. The feature builds on existing usage tracking and plan detection; the plan focuses on **what** the Usage area should do and **where** it fits in the GUI, not the current tech stack.

## Relationship to Existing Docs

| Doc | Relevance |
|-----|-----------|
| **AGENTS.md -- Usage Tracking & Plan Detection** | Canonical source for per-platform usage sources (Claude Admin API, Copilot metrics, Gemini quotas, Codex/Cursor error parsing), env vars, and error-message parsing. |
| **Plans/newfeatures.md §3** | Persistent rate limit and usage visibility: 5h/7d in dashboard/header, tier config usage, alerts; data layer + widget + background refresh. |
| **Plans/newfeatures.md §7** | Analytics view: aggregate usage over time and by dimension; reporting layer on top of usage/plan detection. |
| **Plans/assistant-chat-design.md §12** | Context/usage display: **context circle** (OpenCode-style) at top of chat -- hover shows tokens/usage %/cost; thread-scoped detail opens the canonical Context Detail Pane/editor-tab surface. |
| **orchestrator-subagent-integration.md** | Platform quota display and resource monitoring (e.g. quota usage in GUI, crew quota). |
| **Plans/newfeatures.md §19.2** | Technical mechanism for 5h/7d (session usage from stream, account-level via `claude --account` or Admin API); mid-stream usage and context % from stream-json. |
| **Plans/storage-plan.md** | Implementation checklist for seglog, redb, projectors, analytics scan; Usage reads rollups from redb produced by analytics scan jobs over seglog. |
| **Plans/Progression_Gates.md + Plans/evidence.schema.json** | Validation contract for the storage stack (seglog + redb + Tantivy + projectors + analytics scan) through deterministic verifier gates and evidence requirements. |

**Current app state (for context):**
- **Ledger** page: Event-level log from `.puppet-master/usage/usage.jsonl` (platform, tokens in/out, cost per request). No 5h/7d quota view.
- **Metrics** page: Post-run execution metrics (platform/subtask stats).
- **Dashboard**: Budget/usage percent per platform (from budget config).
- **Backend**: `UsageTracker`, `QuotaManager`, `UsageRecord` persisted to `usage.jsonl`; orchestrator records usage; platform runners report token usage.

## External References (Competitive & Ecosystem)

| Source | Relevance to Usage feature |
|--------|----------------------------|
| **[OpenSync](https://www.opensync.dev/) -- [Dashboard overview](https://www.opensync.dev/docs#dashboard-overview)** | Beautiful dashboards for OpenCode and Claude Code sessions; reference for how usage/dashboards can be presented. |
| **[yume](https://github.com/aofp/yume) / [yume site](https://aofp.github.io/yume/)** | Native desktop UI for Claude Code. **Persistent rate limit visibility** -- 5h and 7d limits always visible (no `/usage` needed). **Analytics dashboard** -- usage by project/model/date, cost tracking, export; "know where your tokens go"; mid-stream context (live token count). Strong UX benchmark for always-visible limits and analytics. |
| **[openclaudecto](https://github.com/josharsh/openclaudecto)** | Open-source Claude Code dashboard (coming soon): analytics & cost tracking, token consumption, cost breakdowns by model, tool usage distribution, daily activity trends. Useful reference for analytics/cost UX and data shape. |
| **[OpenCode Monitor](https://ocmonitor.vercel.app/docs)** | CLI tool for monitoring and analyzing OpenCode AI coding sessions: live dashboard, daily usage breakdown, usage quotas, session/time/model/project analysis, export (CSV/JSON). **We provide equivalent usage visibility in the app GUI**, not via a separate terminal/CLI monitor -- one place for orchestration and usage. |
| **[OpenCode desktop](https://github.com/anomalyco/opencode) (packages/app)** | **Per-thread usage in chat:** Small **context circle** (ProgressCircle) at top of chat showing context usage %; **hover** shows tooltip (total tokens, usage %, cost USD); **click** opens "context" tab for that session with detailed usage. Reference: `packages/app/src/components/session-context-usage.tsx`, `session-context-metrics.ts`. We adopt this pattern in §5 "Per-thread usage in Chat (OpenCode-style)". |

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

### Gemini -- Direct and CLI usage (mode-dependent)
Gemini usage must distinguish the direct provider from Gemini CLI while still allowing family-level pooling when policy permits. Stale-canon wording that reduces Gemini to local counters, a single `mixed-account` provider, or a generic API-key `key-exception` is not sufficient for Usage.

The provider-doc reconciliation keeps `Plans/CLI_Bridged_Providers.md` as the owner for Gemini CLI runtime transport. Usage must not collapse Gemini into one direct provider with mixed OAuth/API-key pools and no CLI runtime.

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

#### Gemini CLI

`Gemini CLI` is a separate provider entry.

Rules:
- Gemini CLI may use OAuth, direct API key, or Vertex/Google credential families depending the configured account row.
- `Gemini CLI` OAuth/API/Vertex usage paths remain auth-family dependent, with runtime stats and provider quota signals treated as multi-source `/usage` evidence rather than one fixed reset shape.
- `/stats model` can expose current-session usage plus quota-associated limit information, but PM still treats those `/stats` values as auth-family-sensitive rather than one universal Gemini CLI counter.
- trust can affect runtime MCP visibility, so `Configured`, `Working`, and `Operational` must remain separate states.
- provider-side model routing may still override the explicitly requested model in some flows; PM must show requested/effective differences rather than assuming full determinism.
- usage/cooldown behavior depends on the active auth family and may range from authoritative remaining counters to softer or inferred pressure.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

#### Family-pooling rule

When policy pools Gemini direct and Gemini CLI together, the Usage surface must still show which concrete runtime surface actually handled the run and why.

Gemini account/plan UI and quota/usage tools are mode-dependent rather than API-key-only or OAuth-only. Direct key-backed rows, CLI OAuth rows, CLI API-key rows, and CLI Google/Vertex rows must each carry their own effective auth mode, account/profile, quota plane, source confidence, and label; family-level summaries may aggregate only after preserving those requested/effective disclosures.

Usage UI and `/settings` surfaces inherit the GUI requested-vs-effective pattern: per-platform labels remain visible because quota semantics differ by provider, and Gemini rows must expose the requested auth/account intent beside the effective mode, quota bucket, and source label.

Before saving family-pooling changes, Usage shows the preferred provider inside the family plus a capability-guardrail explanation.

Gemini shared-provider capability posture is locked for Usage and account-pressure interpretation:
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

Gemini `/quota` visibility is mode-aware. OAuth-backed rows may surface Gemini-plan / Code Assist-style quota semantics when authoritative evidence exists; API-key-backed rows remain a separate quota bucket and MUST NOT be mislabeled as the same quota bucket or plan path. Stale `/AI-Studio-oriented` copy is allowed only as historical context: live Usage UI and specs must label the resolved auth mode, usage source, source confidence, and quota bucket instead of implying that AI Studio API-key setup is the whole Gemini usage model.

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
| **Gemini CLI** | CLI/runtime signals, config/trust state, provider counters when available | OAuth, API-key, `ADC`, `gcloud`, service-account, or Vertex account rows | show concrete runtime surface and auth family |
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
## Data and Backend (conceptual)
### Cost_usage runtime artifact and Show in Ledger / Show in Usage


The `cost_usage` runtime artifact is an attribution record only. It uses the same canonical usage pipeline and schema as `usage.event`.

Required actions for `cost_usage` items are:
- `Show in Ledger` — navigate to the canonical Ledger surface with the matching usage identity in scope
- `Show in Usage` — navigate to app-wide Usage or to the thread-scoped Context Detail Pane depending on artifact scope, preserving the same thread/run filters

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

Rules:
- thread-scoped cost usage does not open a chat side-panel usage surface
- thread-scoped cost usage lands on the same Context Detail Pane used by the chat context circle `More Details` action
- app-wide cost usage lands on the app-wide Usage surface
- the artifact does not create a second token or cost model outside the canonical usage schema

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md
### OpenCode (product) usage pipeline reference

For implementers: the flow by which usage is collected and stored can be referenced from the OpenCode product (anomalyco/opencode repo). Conceptual flow: **provider response** → adapter → **LanguageModelV2Usage** (or equivalent) → **getUsage-style normalization** (e.g. Session.getUsage) → **processor** applies on finish-step to assistant message + step-finish part; **UI reads from messages** and/or usage.event. Key paths in that repo: session-context-metrics (UI metrics from messages), processor finish-step (where token/cost is applied to message), Session.getUsage (normalization). Puppet Master does not replicate this exactly; all providers (CLI-bridged, OpenCode provider, Codex, Gemini, Copilot) normalize to the same usage.event / message usage shape; collection mechanism differs per provider. OpenCode the **provider** (Plans/Provider_OpenCode.md) is one transport; OpenCode the **product** is the reference for "how message-level usage becomes stored usage."

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Provider_OpenCode.md, PolicyRule:Decision_Policy.md§2
### Backend implementation notes
- **Data layer:** Reuse and extend existing usage/plan-detection logic. Expose a clear current-usage contract per platform that the GUI can poll or subscribe to.
- **Primary input:** canonical usage projections and redb rollups derived from the seglog pipeline.
- **Secondary input:** platform APIs and structured provider/runtime outputs when configured and supported.
- **Compatibility input:** `usage.jsonl` may still be read as a human-readable mirror or migration input, but not as the canonical 5h/7d rollup source.
- **Retired subagent side files:** In `Plans/usage-feature.md` (`/usage-feature.md`), `active-subagents.json` and other active-subagents `side-file` / `live-state` mirrors are compatibility projections only; they must not be presented as canonical or endorsed usage enrichment sources after side-file retirement.
- Thread-scoped plan `/todo` state used by Usage and Context Detail views comes from storage-backed revision/status history, not from an ad hoc usage-side TODO store.
- Web change-tracking usage rows preserve `change_status: "new"` when no previous version exists and compare against the most recent cached version of the same normalized `URL`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FinalGUISpec.md

- Usage-linked planning widgets consume the sticky-card / execution-tracker contract from the planning UI: after approval, they show read-mostly status badges, item-focus navigation for the active or selected TODO item, and post-approval edit restrictions rather than becoming a second plan state owner.
- **Gemini source model:** Prefer the shared `UsageRecord` pipeline and carry explicit source attribution instead of hardcoding Gemini to local counters only.
- **Gemini signal weighting:** strong provider/account telemetry outranks structured runtime output; structured output outranks heuristics; heuristics outrank local-only counters.
- **Persistence:** event-level data and rollups remain canonical storage concerns; account-health and quota-pressure updates must feed the same control loop used by multi-account routing.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2
## GUI Placement Options
The GUI placement model is fixed.

Canonical placement:
- app-wide Usage is its own page or view
- compact usage visibility appears in shell and status surfaces where appropriate
- thread-scoped context detail lives in the chat flow as the context circle plus the editor-tab Context Detail Pane
- artifact deep-links and chat usage activation land on those same canonical surfaces based on scope

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

Non-canonical after this section:
- thread Usage in the chat shell or side panel as the primary detailed surface
- detached usage pop-out as the canonical thread detail model
- direct click on the context circle opening the detail pane without the hover/click split
- unresolved `tab or panel or pop-out` phrasing that leaves the implementation guessing

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md
## Gaps (Current State vs. Desired)

### Canonical usage pipeline
- Usage events are emitted by tool invocation and aggregated into usage records.
- UsageRecord is the canonical schema for all usage data (tokens, costs, tool calls, API calls).
- Usage records are immutable once committed; corrections require a new record with explicit versioning.
- Tool, helper, and `/helper/background` usage emission keeps lineage to the parent run/thread plus the concrete helper/tool invocation so background work can be attributed without flattening it into the foreground assistant message.

#### Debug investigation phase attribution
- Usage projections that summarize Debug Mode work may group usage by investigation lifecycle phase, including `instrumenting`, `reproducing`, `collecting_evidence`, `analyzing`, and `applying_fix`.
- These labels are usage and analytics attribution dimensions on records and rollups; they do not make Usage the owner of Debug runtime state-machine semantics.

### Billing identity, attribution, and pricing metadata
- Billing identity is derived from account context and subscription tier.
- Provider `/billing` and `/usage/billing` metadata remains attribution and pressure evidence; it does not replace the canonical usage_record, entitlement, or billing-entity contracts.

#### Shared runtime identity
- Carry execution_role plus requested/effective operational identity in shared runtime identity.
- Project them into effective-resolution, attempt, usage, and inspector surfaces.
- Role-scoped routing must appear in effective-resolution and usage schemas when policy/storage carries role scope; Usage must not rely on policy/storage-only role state for canonical usage attribution.
- Canonical Usage routing stays on shared usage identity, not feature-local cost or receipt notions.

#### Attribution family, anchors, and pricing metadata
- Attribution metadata links usage to project, run, node, and account for cost allocation.
- Share one attribution family across tool events, runtime artifacts, receipts, and usage records.
- Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields.
- Pricing metadata includes rate cards and surcharges that apply to each usage event.

#### export taxonomy
- Export taxonomy documents which usage metrics are surfaced in export manifests and accounting reports.
- Export taxonomy is versioned and stable across release boundaries.

##### Export classes
- Define record export, bundle export, and view export as distinct export classes.
- cov-016 exact item present: Define record export, bundle export, and view export as distinct export classes

##### Export manifest requirements
- Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure.
- cov-016 exact item present: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure

#### account history
##### Durable account-pressure and switch events
- Add append-only account_pressure_episode and account_switch_event families.
- Let Usage, History, Ledger, and Orchestrator consume the same durable event family.
- Usage consumes Multi-Account selection flow, pressure `/switch` history, and role-aware routing through the same requested/effective disclosure model, so usage projections show both requested account intent and effective account outcome.
- Usage switch explanations retain switch lineage in canonical records; rollups may explain selected/effective account outcomes only when the switch lineage remains reachable.
- cov-092 exact item present: Add append-only account_pressure_episode and account_switch_event families
- cov-092 exact item present: Let Usage, History, Ledger, and Orchestrator consume the same durable event family

##### Recovery and execution-role continuity
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.
- Carry usage switch-history and usage execution-role follow-through.
- cov-162 exact item present: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- cov-162 exact item present: Carry usage switch-history and usage execution-role follow-through

#### artifact drill-through section
##### Local keys and bridge fields
- Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge.
- None of those bridge fields replace the primary local key.
- Usage inspector routing uses `inspector_target = details | evidence | usage | lineage` so details, evidence, usage, and lineage pivots are explicit rather than inferred from timestamps or surrounding UI state.
- Prefer `usage_event_ref` rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger.
- Runtime artifacts summarizing external operations must carry receipt linkage.
- Usage pivots move away from `tier_id` filters toward object-first `usage_event` and runtime-object pivots.

##### Usage and receipt lineage routing

History inspector deref policy is on-demand only, never eager. History rows combine the canonical runtime snapshot fields, web-operation details from `payload.meta`, and ref/blob pointers; dereferenced refs load only when the user chooses click-to-expand, preserving responsive log browsing and the inline/ref storage split.

#### help surfaces
##### Notification routing policy
- Route notifications using severity, execution impact, blocked owner, persistence, and projection trust.

##### Quiet-window policy
- Allow quiet windows for advisory warnings but not for canonical blocked episodes.

#### projection-health-aware degrade behavior
##### Projection freshness and health states
- Use current/refreshing/stale/degraded/unavailable projection states.

##### Sensitive action gating and record-backed fallback
- Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded.

### Canonical UsageRecord fields
- For gap-001 lineage, this section is also the usage-side partial-transfer anchor for ``### Unified `UsageRecord` schema expectations`` and the queue-escaped alias ``### Unified \`UsageRecord\` schema expectations``; both resolve here rather than creating a second schema section.
- UsageRecord includes `usage_id`, `created_at_utc`, `account_id`, `run_id`, `node_id`, `tool_id`, `input_tokens`, `output_tokens`, `cost_usd`, and `metadata`.
- UsageRecord attribution fields also include `provider_id`, `model_id`, `thread_id?`, `parent_run_id?`, `effective_auth_mode?`, `usage_source_kind`, `billing_entity_id?`, `entitlement_class?`, `cache_hit?`, and `cache_strategy?` when known. `usage_source_kind` preserves source classes such as `provider_runtime_usage`, `provider_quota_api`, `provider_usage_api`, `provider_error_hint`, and `project_rollup`; provider-specific source detail such as `local-estimated`, `API-key-derived`, or `OAuth-quota-derived` remains visible through the shared usage attribution contract instead of being collapsed into one generic usage source.
- Usage field-name rules follow the storage naming contract: shared runtime and attribution fields keep stable meanings across usage aggregation, persistence, events, and Config consumers instead of reviving tier-era labels.
- Cost-integrity display rules are `/clamp/derived-field` rules: sub-cent and sub-dollar display precision is derived from `cost_microdollars` or exact provider minor-unit receipts when available; the canonical display tiers are `<$0.01 = 6dp`, `<$1 = 4dp`, and otherwise 2dp, while `cost_usd` remains display/migration material and must not be the only canonical precision source.
- `cost_usd = cost_microdollars / 1_000_000` is derived only at display/export boundaries or compatibility import/migration edges; it is not a persisted UsageRecord authority field.
- Raw-cost provider values are retained as provenance or debug evidence only after normalization to canonical token buckets and `cost_microdollars`; raw-cost fields must not become independent billing authority.

### Ownership and consumption
- Usage owns canonical UsageRecord aggregation and display semantics; History, Ledger, Orchestrator, and runtime-artifact consumers consume the same durable event family instead of defining parallel usage schemas.
- All usage events are coerced into UsageRecord format before aggregation.

### Blocked-state and escalation surfaces
#### Shared escalation ladder and attention semantics
#### blocked_notice contract and observability
#### Blocked-owner taxonomy and surface mapping

#### Acceptance carry-through
- Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Expand blocked_notice beyond blocked_family and allowed_action_ids[]
- Carry escalation_level, action_available ownership, and usage observability through blocked surfaces
- Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- cov-053 exact item present: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- cov-053 exact item present: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- cov-146 exact item present: Expand blocked_notice beyond blocked_family and allowed_action_ids[]
- cov-146 exact item present: Carry escalation_level, action_available ownership, and usage observability through blocked surfaces
- cov-146 stale token retired: allowed_action_ids[]
- cov-198 exact item present: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping

### Problem 1: Platform APIs require secrets

- **Risk**
  - Claude Admin API and Copilot metrics require `ANTHROPIC_API_KEY` and `GITHUB_TOKEN`/`GH_TOKEN`. Many users will not set these; 5h/7d from APIs would be missing or "N/A" for those platforms.
- **Impact**
  - Users might assume "no data" means "no usage" instead of "API not configured"; or they may not know how to enable live data.
- **Mitigation**
  - In Usage view (or tooltip), document which env vars enable live data per platform (e.g. "Set ANTHROPIC_API_KEY for Claude 5h/7d").
  - **Always** show a fallback: display the project-local canonical usage summary available from current rollups/projections even when provider API quota data is unavailable.
  - Clearly label source: "From this project's usage" vs "From Claude (API)" when both exist.

### Problem 2: Rate limits on usage APIs

- **Risk**
  - Polling Claude/Copilot/Gemini usage endpoints too frequently could hit rate limits or consume quota.
- **Impact**
  - API errors, blocked requests, or user quota consumed by the app itself.
- **Mitigation**
  - Background refresh at a reasonable interval (e.g. 5-15 min); cache last result; expose "Refresh" for on-demand update.
  - After each run, update usage from the run result (tokens/cost when available) without an extra API call.
  - Document recommended refresh interval per platform if limits are known.

### Problem 3: Two usage tracker types and ad-hoc Ledger parsing

- **Risk**
  - `state::UsageTracker` + `types::UsageRecord` vs. `platforms::UsageTracker` + `UsageEvent`/`UsageSummary`; Ledger parses raw JSON with different field names. Duplicate logic and schema drift: writers and readers can get out of sync.
- **Impact**
  - Ledger shows wrong or missing fields; 5h/7d aggregation might miss data or double-count if we add a second reader; bugs when we change one path and forget the other.
- **Mitigation**
  - Unify on one canonical write path and one `UsageRecord` schema. If `usage.jsonl` persists, it is a mirror / compatibility artifact rather than an independent canonical source.
  - Document the schema in STATE_FILES and in code; use the same types for write and read where possible.
  - Prefer one projector/reader path for local summaries so Ledger, rollups, and UI projections do not fork into separate attribution models.

### Problem 4: 5h/7d semantics differ by platform

- **Risk**
  - Codex: 5h message limit. Claude/Copilot: org-specific windows. Gemini: quota window (e.g. reset after 8h44m). Cursor: API available for augmentation but window semantics may differ. A single "5h: X/Y" column implies identical meaning across platforms when it is not.
- **Impact**
  - User misinterprets "5h" for Gemini as the same as Codex; or we show misleading comparisons.
- **Mitigation**
  - Per-platform labels in the UI (e.g. "Codex 5h", "Claude 7d", "Gemini (estimated)") and a short tooltip or doc link explaining what each window means.
  - Avoid one generic "5h/7d" column when semantics differ; use platform-specific columns or clearly labeled sections.

### Canonical usage-window model

Usage/cooldown semantics use a generic `usage-window` model rather than hardcoded `5h/7d` assumptions.

Fields:
- `window_kind: rolling | fixed_reset | billing_cycle | session_only | unknown`
- `window_label`
- `window_scope: provider | account | account+model | org | server_profile`

Rules:
- `rolling` means the remaining amount changes against a sliding lookback interval.
- `fixed_reset` means the provider reports a fixed reset boundary or countdown for the current window.
- `billing_cycle` means quota pressure is tied to the plan or billing period rather than a short cooldown.
- `session_only` means PM has authoritative session/tool stats from the local runtime but no durable provider quota window.
- `unknown` means the UI may show inferred/estimated usage only if it labels the evidence source and avoids pretending to know reset semantics.
- `MiniMax Coding Plan` is modeled as `MiniMax` direct-provider usage metadata with a fixed 5-hour window plus explicit remains endpoint from official docs. The Usage view must preserve that provider-specific `fixed_reset` evidence instead of flattening it into a generic 5h column.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

### Problem 5: Ledger file size

- **Risk**
  - Event storage (seglog) grows unbounded over long-running or high-throughput projects. Very large seglogs slow analytics scan jobs and increase startup recovery time.
- **Impact**
  - Slow UI refresh for 5h/7d windows, elevated memory during rollup recalculation, or degraded startup when the seglog requires extended CRC validation.
- **Mitigation**
  - Retention policy: keep raw seglog events for a configurable window (default 90 days); archive or compact older events with an optional export-first step.
  - Seglog compaction: periodic background job consolidates older fine-grained events into daily summary records, reducing scan time while preserving attribution fidelity.
  - Rollup freshness: 5h/7d windows are served from redb rollups, not from raw event scans. Background analytics jobs refresh rollups incrementally; UI shows the last committed rollup plus an explicit freshness cue when a refresh is in progress.
  - `usage.jsonl` is a human-readable mirror only and MUST NOT be used for aggregation, rollup computation, or 5h/7d window serving. If retained for debugging, it follows the same retention policy as seglog.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### Problem 6: Stale data

- **Risk**
  - User sees 5h/7d that was last updated 30 minutes ago; they hit a limit in the meantime and are surprised.
- **Impact**
  - Loss of trust in the Usage view; unnecessary failed runs.
- **Mitigation**
  - Show "Last updated: &lt;time&gt;" next to 5h/7d and provide a prominent "Refresh" action.
  - Optional: lightweight refresh when app gains focus or when starting a new run (with rate limiting to avoid thrash).

### Problem 7: Multi-project usage

- **Risk**
  - `usage.jsonl` is per-project (`.puppet-master/usage/`). Users with many projects may expect "total usage across my projects" or get confused whether the view is project-scoped.
- **Impact**
  - Confusion about scope; feature requests for cross-project aggregation before we are ready.
- **Mitigation**
  - Clarify in UI: "Usage for this project" (or "Current project") for v1.
  - If we later support "All projects", require an explicit scope selector and document where we read from (e.g. scan multiple `.puppet-master/usage/` dirs).

---

## Enhancements (Beyond Minimum)

### Enhancement 1: Time-window selector

- **Benefit**
  - Power users can match platform windows (5h, 7d, 24h) or choose a custom range; avoids one-size-fits-all.
- **Notes**
  - Especially useful once we have multiple window types per platform. Implement as dropdown or preset buttons (5h, 7d, 24h, custom date range).
- **Phase**
  - v1 optional; can ship with fixed 5h/7d first.

### Enhancement 2: Reset countdown

- **Benefit**
  - When we have reset time (from error parsing or API), showing "Resets in 2h 15m" next to 5h/7d reduces guesswork and supports planning.
- **Notes**
  - `QuotaInfo.resets_at` already exists in `platforms::usage_tracker`; surface in GUI and update when we have new error or API response.
- **Phase**
  - v1 if we already parse errors; low effort.

### Enhancement 3: Per-run and execution-scope usage in Config


- **Benefit**
  - In execution settings, "This run / node / package used X tokens / Y requests in last 7d" helps users see which execution scope burns the most and adjust platform or model.
- **Notes**
  - Aggregate from canonical usage identity (`usage_event_ref`, `run_id`, `node_id`, `attempt_id`, and related runtime attribution fields) rather than by `tier_id`. Requires a shared aggregation API or module used by both Usage and Config.
- **Phase**
  - Post-v1 once 5h/7d and Ledger are stable.

### Enhancement 4: Export from Usage page

- **Benefit**
  - Export current view (ledger filter, date range, or analytics table) as CSV/JSON for reporting or external tools.
- **Notes**
  - Aligns with OpenCode Monitor / yume. Ledger already has "Export Ledger"; unify under Usage and add date-range/analytics export.
- **Phase**
  - v1 for Ledger export; extend to analytics when analytics view exists.

### Enhancement 5: Usage in header (compact)


- **Benefit**
  - One line in app header (e.g. "Cursor 5h: 80% - Claude 7d: 45%") reduces need to open Usage page for a quick check.
- **Notes**
  - Option C in GUI placement. Keep compact to avoid clutter; link to full Usage page.
- **Phase**
  - v1 or post-v1 depending on placement choice.

### Enhancement 6: Doctor integration

- **Benefit**
  - Cross-links: "View in Usage" from Doctor when usage warning/error; "Run Doctor" for usage from Usage page. Keeps usage and health in one mental model.
- **Notes**
  - Doctor already has `usage_check`; add navigation message or button to Usage; from Usage add button to run Doctor (or open Doctor tab with usage checks).
- **Phase**
  - v1 optional; small UX improvement.

### Enhancement 7: Cost column when available

- **Benefit**
  - When platforms expose cost (e.g. in stream-json result), persist and show in Ledger and analytics; enables "cost by project/date".
- **Notes**
  - Orchestrator currently writes `cost: None`. Extend write path when runner or parser provides cost; add column to Ledger and to analytics aggregates.
- **Phase**
  - When at least one platform provides cost; then extend to others.

### Enhancement 8: Alerts history

- **Benefit**
  - Log when we showed "approaching limit" or "quota exhausted"; user can review "I was warned at 14:00" for debugging or awareness.
- **Notes**
  - Optional; store in a small log or append to a file under `.puppet-master/usage/` (e.g. `alerts.jsonl`). Display in Usage or Settings.
- **Phase**
  - Post-v1.

### Enhancement 9: Comparison with peers / benchmarks

- **Benefit**
  - e.g. "You use more tokens than 60% of users" could motivate optimization or reassure; would require anonymized opt-in data and a backend.
- **Notes**
  - Out of scope for current plan; possible future if we add opt-in telemetry and a comparison service.
- **Phase**
  - Future; not in scope.

## Out of Scope for This Plan

- Changes to platform CLI contracts or new platform-specific APIs beyond what AGENTS.md already describes.
- Token counting or context-window usage for chat/assistant (covered by assistant-chat-design §12 and newfeatures §10/§15).
- Implementation details of the current stack (Rust/Iced); the feature should be realizable in a future stack with the same data contracts and UX goals.

## Success Criteria


- Users can see 5h/7d usage (and plan, where available) without running a manual "usage" command.
- Users can open a dedicated Usage view (or equivalent) to see ledger and, if implemented, analytics.
- When approaching or hitting a limit, users see a clear warning or message and a path to Usage or tier config.
- Tier/config flows show current usage when choosing a platform.
- Usage section aligns with ecosystem norms: **always-visible** 5h/7d (and plan where available), plus optional analytics/cost view (yume/openclaudecto-style).

## Version History

| Date | Change |
|------|--------|
| 2026-02-21 | Initial plan: Usage as first-class app/GUI feature; quota visibility, ledger, optional analytics; alignment with AGENTS.md and newfeatures; external references (OpenSync, yume, openclaudecto, OpenCode Monitor). GUI-based usage (not CLI like OpenCode Monitor). |
| 2026-02-21 | Fleshed out: Gaps (5h/7d not in GUI, no live APIs in GUI path, Ledger vs usage_tracker split, quota only from errors, alert threshold, analytics, interview/orchestrator policy); Potential problems (API secrets, rate limits, two tracker types, platform semantics, file size, stale data, multi-project); Enhancements (time-window selector, reset countdown, per-tier usage, export, header compact, Doctor integration, cost column, alerts history). |
| 2026-02-21 | Data sources: added "Data Sources: State Files (JSON/JSONL)" as an early draft direction. That historical note is now superseded by canonical child-run/runtime accounting: `usage.jsonl` and similar state files may still appear as implementation artifacts, but `active-subagents.json` is not canonical usage truth. |
| 2026-02-21 | Fleshed out Gaps, Potential Problems, Enhancements: each gap has Current state / Desired / Acceptance; each problem has Risk / Impact / Mitigation; each enhancement has Benefit / Notes / Phase. |
| 2026-02-21 | Per-platform usage data: added section on Cursor API (augment with usage/limits; CURSOR_API_KEY); Codex CLI stream/provider data; Copilot CLI + metrics API; Claude Admin API + stream-json (existing); Gemini direct-provider local counters and estimated cost (now superseded by the mode-dependent Gemini Direct/Gemini CLI rules above). Summary table and implementation order. |
| 2026-02-21 | Clarified Cursor API: usage/account/limits only -- we do not use it for model invocation; model engagement stays OAuth + CLI. AGENTS.md "No API available" refers to model invocation; Cursor has a separate API for augmenting the Usage view. |
| 2026-02-22 | Added "Storage dependency (implementation)": Usage depends on seglog + redb + projectors + analytics scan; embedded implementation checklist from storage-plan.md; clarified state-file-first fallback until stack exists; cross-referenced storage-plan.md and deterministic verifier/evidence contracts in Relationship to Existing Docs. |
| 2026-02-23 | Added widget-composed page layout addendum (sections below): Usage page is fully widget-composed with grid-based resizing, per-widget config, Multi-Account widget as first-class catalog entry, and Dashboard reuse via add-widget flow. |

---

<a id="widget-composition"></a>
## Widget-Composed Page Layout (Addendum -- 2026-02-23)

### Scope of This Addendum

This section extends the Usage page from a static layout to a **fully widget-composed, grid-based page** using the Widget System defined in Plans/Widget_System.md. The Usage page is a required, dedicated top-level page. Every content area on the Usage page is a widget.

ContractRef: ContractName:Plans/Widget_System.md

### Usage Page is Widget-Composed

The Usage page MUST be composed entirely of widgets from the widget catalog (Plans/Widget_System.md section 2). There is no static/fixed content area -- every panel, chart, and table is a widget that can be moved, resized, and configured.

Users can:
- **Move** widgets within the grid (drag-and-drop).
- **Resize** widgets by grid spans (drag widget edge, grid-snapping per Plans/Widget_System.md section 3).
- **Configure** each widget individually (gear icon for time window, platform filter, chart type, etc.).
- **Add** new widgets from the catalog via the add-widget flow.
- **Remove** widgets they don't want to see.

ContractRef: ContractName:Plans/Widget_System.md#3, ContractName:Plans/Widget_System.md#4

### Default Widget Layout (4-column grid)

The Usage page ships with this default layout. No page starts empty. Users can customize after first load.

### Gap 6: Analytics not implemented

Usage analytics consumers interpret grep/Search acceleration through `tool.invoked.index_used`: `true` counts queries served by sparse-n-gram candidate narrowing, while `false` counts raw ripgrep fallback or another unindexed path.

| Col | Row | Widget ID | Size | What It Shows |
|-----|-----|-----------|------|---------------|
| 0 | 0 | `widget.quota_summary` | 2x1 | 5h/7d usage bars per platform with plan type |
| 2 | 0 | `widget.alert_thresholds` | 2x1 | Approaching-limit warnings and threshold status |
| 0 | 1 | `widget.analytics_chart` | 2x2 | Aggregate usage over time (bar/line/area chart) |
| 2 | 1 | `widget.budget_donuts` | 2x2 | Donut charts for budget consumption per platform |
| 0 | 3 | `widget.tool_usage` | 2x2 | Tool invocation count, latency (p50/p95), error rate, and grep/Search `index_used` fallback mix |
| 2 | 3 | `widget.multi_account` | 2x2 | Per-platform account list, active account, cooldown state |
| 0 | 5 | `widget.ledger_table` | 4x3 | Event-level usage/token/cost ledger with filtering |

### Grid-Based Resizing

- Uses the grid system from Plans/Widget_System.md section 3.
- Column count is responsive: 2 columns (<1200px), 3 columns (1200-1600px), 4 columns (>1600px) per Plans/FinalGUISpec.md section 12.3.
- Each widget can be independently resized within its declared min/max grid constraints.
- Resizing a widget can affect what data it shows: e.g., a wider `widget.analytics_chart` shows more time granularity, a taller `widget.ledger_table` shows more rows.

ContractRef: ContractName:Plans/Widget_System.md#3, ContractName:Plans/FinalGUISpec.md#12.3

### Per-Widget Configuration

Each Usage widget has a gear icon in its header for per-widget configuration. Examples:

| Widget | Config Options |
|--------|---------------|
| `widget.quota_summary` | Time window (5h/7d), platforms to display |
| `widget.analytics_chart` | Time window (5h/7d/24h/custom), chart type (bar/line/area), platforms to include |
| `widget.budget_donuts` | Time window, chart style (donut/bar) |
| `widget.tool_usage` | Time window, sort by (count/latency/errors/index_used fallback rate) |
| `widget.ledger_table` | Visible columns, page size, default sort, event type filter |
| `widget.multi_account` | Platforms to show, show cooldown timers (on/off) |

Configuration is persisted alongside the widget layout per Plans/Widget_System.md section 7.

ContractRef: ContractName:Plans/Widget_System.md#5

### Multi-Account Widget as First-Class Catalog Entry
The multi-account widget remains a first-class catalog entry, but it is now a status and observability widget rather than the canonical setup surface.

ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md

Required content:
- provider entry or server-profile row label
- active/effective marker
- plain-language status (`Working` or a concrete reason)
- internal readiness may still record an `Operational` layer, but the GUI keeps that layer separate from the user-facing status
- pressure/cooldown summary
- source-confidence / stale label where needed
- direct link/action into Agent-Config for setup, validation, or repair

Rules:
- the widget does not replace Agent-Config for account management, billing/entity selection, instruction control, skills, or MCP setup.
- one GitHub Copilot auth-backed row may show a selected organization/billing entity beneath it rather than rendering duplicate top-level rows.
- OpenCode server profiles appear alongside account-backed rows with explicit profile-mode labels.
- the widget must not imply that every provider row has literal installed-local-state semantics; some rows are account-backed, some are server-profile-backed.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md
### Reuse on Dashboard via Add-Widget Flow

All widgets that appear on the Usage page are **also hostable on the Dashboard**. Users can add any Usage widget to the Dashboard through the add-widget flow (Plans/Widget_System.md section 4):

1. On the Dashboard, click "Add Widget".
2. The catalog overlay shows all Dashboard-compatible widgets, including all Usage widgets.
3. Select a widget (e.g., `widget.quota_summary`) and click "Add".
4. The widget appears on the Dashboard grid with its default size.
5. Configure and resize as needed.

This means users can build a Dashboard that includes usage information alongside orchestrator status and other widgets, without needing to navigate to the Usage page.

ContractRef: ContractName:Plans/Widget_System.md#4

### Cross-References

- Plans/Widget_System.md -- grid system (section 3), widget catalog (section 2), add-widget flow (section 4), layout persistence (section 7)
- Plans/Multi-Account.md -- multi-account data model and GUI requirements
- Plans/FinalGUISpec.md -- responsive grid (section 12.3), existing Usage view (section 7.8)
- Plans/storage-plan.md -- redb rollup keys for usage data

## Runtime Scheduler / Recovery Observability Addendum (2026-03-09)

### Recommended counters / views
- blocked attempts by `blocked_reason_code`
- retries by `failure_class`
- remediation children spawned and resolved
- queue-analysis passes and wake reasons
- safe-point creates/restores
- blocked outcomes remain distinct from failures
- blocked counters also retain `escalation_level` and the shared blocked-action disclosure (`action_available`)

### Metrics integrity rule
- usage rollups may keep executed-tool metrics separate while blocked and remediation disclosure remains queryable
- blocked outcomes remain distinct from failures in user-visible statistics
## Source Control, GitHub Actions, and Docker Manager Cost Attribution Addendum (2026-03-12)

Cross-surface receipts from Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator must not create feature-local cost views.

Rules:
- when a receipt or artifact carries `usage_event_ref` or equivalent canonical usage identity, `Show in Ledger` and `Show in Usage` open the canonical Usage surfaces with that event in scope
- if a user reruns workflows, tails logs, performs repeated registry refreshes, or executes other cost-bearing remote actions, the resulting cost attribution still resolves through canonical usage records
- any feature-local summary is secondary presentation only and must not replace the canonical Usage/Ledger pipeline

Reversibility and undo disclosure is part of user-facing `/accounting` for cost-bearing actions. Receipts and confirmations classify each action as immediately undoable, reversible with a compensating action, non-reversible but confirmable, or destructive and `non-undoable`; user copy may also show `non-reversible` when no practical reversal exists. If `/undo` exists, the UI records the undo-window duration, whether the undo is `local-only` or `remote-compensating`, what invalidates it, and whether a background refresh, `/poll`, or subsequent mutation closes the window. Non-reversible and non-undoable actions must disclose that before execution rather than only in `/history`.

Bulk-operation receipts preserve the parent/child shape for usage and history. A parent bulk receipt carries aggregate counts for `/failed/blocked/skipped` plus completed targets; child receipts carry `per-target` result, usage_event_ref, rollback or `/undo` expectation, and any blocked reason. Orchestrator and history must not flatten a bulk action into one ambiguous line item.

Potentially `high-cost` or repeated remote actions show cost forecast and warning semantics when platform/provider data allows it. Examples include rerun-many-workflows, bulk log retrieval, repeated registry refreshes, many `/Kubernetes` refreshes, and user-requested long-lived observation. Usage history distinguishes `user-requested` actions from automatic refresh or `/poll` overhead so the Ledger does not make background maintenance look like explicit user intent.

Small-sweep owner precedence is explicit for these hidden cross-cutting contracts. `usage-feature.md` owns cost_usage routing and cost attribution; `newtools.md` owns Docker/Actions readiness and deprecated-alias doctor IDs; Crosswalk owns `/precedence` between feature-owner docs; Docker, GitHub Actions, and Orchestrator owners keep their operational IDs rather than duplicating cost rules here. References hidden in `Crosswalk.md`, `newtools.md`, or `usage-feature.md` are still canonical when they are the named owner, including `/Docker/Orchestrator` readiness/cost links and `deprecated-alias` handling. Legacy `allowed_actions[]` remains compatibility-only; blocked/recovery flows use ordered `allowed_action_ids[]` without accidental global find/replace.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md

## Cross-Surface Usage Routing Clarifications

- `manual_preferred_account_id` is a run-request field, not a project policy default. Usage must keep policy defaults separate from the per-run requested concrete account so the two meanings do not collapse.
- Account pressure and switching use an append-only event `/record` family. Usage, Ledger, History, and routing projections read account-pressure and account-switch records instead of inferring them from mutable view state.
- Gate-side usage contract changes must land with verifiable `/schema` evidence before prose expands; matrix/schema drift and gate-side drift are the same contract-risk pattern when prose runs ahead of enforceable fields.
- JSON export labels distinguish exact record payload, filtered table dump, and convenience summary. A JSON export that lacks the record envelope is a view export even when the file extension is the same.
- Runtime artifacts and receipts preserve canonical usage identity plus run `/thread/attempt/worktree` linkage; Usage must not invent feature-local routing semantics when a receipt or runtime artifact already carries the shared subject.
- Historical-only projects do not become degraded solely because they have completed unrelated historical runs. `no-active-run` is an absence of current execution, not a problem state by itself.
- A2A duplicate attempt-continuity addenda and the tier-boundary schema signal a version-governed consolidation requirement; Usage waits for that consolidated contract instead of scattering more annotations.
- `inspector_target = history` is used for chronological or `/detail-history` focus inside an already-selected object; Usage, details, evidence, and history targets change focus, not the selected subject identity.
- Quiet-window behavior applies to advisory pressure or `/threshold` warnings only. Blocked states and canonical `action-needed` episodes must not quietly disappear behind the same suppression rule.
- Usage exports include filtered ledger CSV, filtered concern `/table` CSV, and analytics chart/table export as view exports unless they carry the exact record envelope required for canonical record export.
- Source Control usage views stay compact around current `/live` worktree rows with `/toggles` for retained, cleanup-eligible, and archived `/removed` history instead of dumping all backing history into the narrow surface.
- The `effective-resolution` record carries blocked and `/degraded` reason fields plus confidence and `/source` hooks so Usage can display why resolution changed without owning provider or runtime truth.
- Usage history preserves graph generation history, safe-point and recovery history, promotion `/revocation` audit, and cleanup `/archive/remove` traceability as distinct history dimensions rather than flattening them into one cleanup note.
- Project run history remains chronological-first. If cross-run derivation or `/continuation` concepts are added later, they require explicit run-relationship metadata instead of reordering history around inferred relationships.
- Account switching and quota pressure share an append-only account-switch / pressure-episode family with shared projection consumers, so Usage, Ledger, History, and account-pressure views read one durable record family.
- OpenCode bridge limits, DAE enforcement, promoted-feature shell ownership, and runtime identity provenance remain explicit architectural edges before Usage presents those events as fully resolved provider/account facts.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/usage-feature.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### UF-001 - Usage Feature -- App/GUI Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: UF-001
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Plans/usage-feature.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- Usage Feature -- App/GUI Plan
- Canonical owner-section requirements
- Export taxonomy and manifest contract
- Projection trust and action gating
- Execution role and operational identity
- Account switch and pressure history
- Identity and blocked-policy transfer cluster
- Bridge-field precedence for attempt/provider/usage/receipt joins
- Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Artifact envelope routing preference
- Plan Document Status
- Rewrite alignment (2026-02-21)
- Storage dependency (implementation)
- Usage storage and routing clarifications
- Executive Summary
- Relationship to Existing Docs
- External References (Competitive & Ecosystem)
- Scope of the Usage Feature
- 1. Quota and plan visibility (primary)
- 2. Alerts and thresholds
- 3. Event ledger (existing concept, under Usage umbrella)
- 4. Optional analytics and reporting
- 5. Per-thread usage in Chat (OpenCode-style)
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md'
negative_constraints:
- '- Usage `/runtime/storage` paths and artifacts are scoped per-project, per-run, per-package, and per-lane; old tier/workspace-only layouts remain migration inputs and must not replace canonical project/run/package/lane identity.'
- '- provider-sensitive cache normalization caveats must remain visible in raw/debug paths and must not be hidden behind authoritative wording in the chat UI'
- '- PM must not invent a fake universal remaining-request counter when Cursor exposes only plan totals, team allotments, or runtime/editor refusal signals.'
- '- Cursor browser-auth accounts may provide strong local per-run usage, but `/limit` and account-row truth require provider or team API augmentation; PM must not treat inferred per-run data as a `remaining-requests` source.'
- '- PM MUST NOT merge those buckets into one shared pressure or cooldown pool, even when they belong to the same human owner.'
- '- premium-request exhaustion, paid-overage policy, org policy blocks, and entitlement-missing states are distinct conditions and must not all be flattened into a generic cooldown.'
- '- Team admin APIs such as `/metrics/spending` may inform Copilot pressure, but PM must not promise a simple per-account `remaining-requests` endpoint as account-row truth unless the provider exposes one.'
- '- PM must not reduce Copilot pressure to only `has premium requests left` vs `does not`; provider evidence must preserve whether the account has premium requests left, does not, or is blocked by billing/entity, organization, or runtime-side entitlement policy.'
- '- `usage-record` / `usage_record` fields contain only attribution-relevant additive fields needed for usage owner attribution; `bridge-visible` fields are the subset needed to prove the runtime surface that actually executed the call, while scheduler-internal IDs remain scheduler/effective-resolutio'
- '- API / Console / organization-backed Claude Code limits are org-level and may include monthly spend limits plus shorter-window rate limits such as `RPM` and `/TPM`; subscriber-backed rows must not reuse those hard limit semantics without provider evidence.'
- The provider-doc reconciliation keeps `Plans/CLI_Bridged_Providers.md` as the owner for Gemini CLI runtime transport. Usage must not collapse Gemini into one direct provider with mixed OAuth/API-key pools and no CLI runtime.
- Gemini `/quota` visibility is mode-aware. OAuth-backed rows may surface Gemini-plan / Code Assist-style quota semantics when authoritative evidence exists; API-key-backed rows remain a separate quota bucket and MUST NOT be mislabeled as the same quota bucket or plan path. Stale `/AI-Studio-oriented`
- '- **Retired subagent side files:** In `Plans/usage-feature.md` (`/usage-feature.md`), `active-subagents.json` and other active-subagents `side-file` / `live-state` mirrors are compatibility projections only; they must not be presented as canonical or endorsed usage enrichment sources after side-file'
- '- Role-scoped routing must appear in effective-resolution and usage schemas when policy/storage carries role scope; Usage must not rely on policy/storage-only role state for canonical usage attribution.'
- '- Cost-integrity display rules are `/clamp/derived-field` rules: sub-cent and sub-dollar display precision is derived from `cost_microdollars` or exact provider minor-unit receipts when available; the canonical display tiers are `<$0.01 = 6dp`, `<$1 = 4dp`, and otherwise 2dp, while `cost_usd` remain'
- '- Raw-cost provider values are retained as provenance or debug evidence only after normalization to canonical token buckets and `cost_microdollars`; raw-cost fields must not become independent billing authority.'
- '- `usage.jsonl` is a human-readable mirror only and MUST NOT be used for aggregation, rollup computation, or 5h/7d window serving. If retained for debugging, it follows the same retention policy as seglog.'
- '- the widget must not imply that every provider row has literal installed-local-state semantics; some rows are account-backed, some are server-profile-backed.'
- Cross-surface receipts from Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator must not create feature-local cost views.
- '- any feature-local summary is secondary presentation only and must not replace the canonical Usage/Ledger pipeline'
- Bulk-operation receipts preserve the parent/child shape for usage and history. A parent bulk receipt carries aggregate counts for `/failed/blocked/skipped` plus completed targets; child receipts carry `per-target` result, usage_event_ref, rollback or `/undo` expectation, and any blocked reason. Orch
- '- Runtime artifacts and receipts preserve canonical usage identity plus run `/thread/attempt/worktree` linkage; Usage must not invent feature-local routing semantics when a receipt or runtime artifact already carries the shared subject.'
- '- Quiet-window behavior applies to advisory pressure or `/threshold` warnings only. Blocked states and canonical `action-needed` episodes must not quietly disappear behind the same suppression rule.'
compatibility_only_notes:
- 'Until this stack exists, any temporary compatibility path MUST still preserve the canonical pipeline: 5h/7d and dashboard windows are owned by rollups, not by ad hoc `usage.jsonl` scans. `usage.jsonl` may still appear as a human-readable mirror or Ledger compatibility input during migration, but it '
- '- `thread_blocked_notice` and `wizard_runtime_state` may preserve `resume_url?` only as compatibility recovery data; Usage opens blocked and wizard subjects through shared route-target payloads rather than storage-plan special-casing.'
- '- Usage and storage are attempt-centric for runtime attribution and preserve tier-centric labels only as compatibility vocabulary. Durable switch and pressure history uses actor-scoped snapshots plus first-class account-switch and pressure-episode records instead of only per-attempt `recent_switch_r'
- '- Usage consumes `Plans/Widget_System.md` and `/Widget_System.md` only for widget hostability, layout, and configuration persistence; Widget_System''s broad pre-rewrite Orchestrator widget model is compatibility lineage, not Usage ownership.'
- '- Cursor instruction-sync status uses `Cursor Rules` as the user-facing label. PM generates `.cursor/rules/*.mdc` first, tracks compatibility projections such as `cursor/rules/*.mdc` under `/rules/`, and treats `.cursorrules` / `cursorrules` as `/deprecated` compatibility rather than the primary man'
- '- **Compatibility input:** `usage.jsonl` may still be read as a human-readable mirror or migration input, but not as the canonical 5h/7d rollup source.'
- '- **Retired subagent side files:** In `Plans/usage-feature.md` (`/usage-feature.md`), `active-subagents.json` and other active-subagents `side-file` / `live-state` mirrors are compatibility projections only; they must not be presented as canonical or endorsed usage enrichment sources after side-file'
- '- `cost_usd = cost_microdollars / 1_000_000` is derived only at display/export boundaries or compatibility import/migration edges; it is not a persisted UsageRecord authority field.'
- '- Unify on one canonical write path and one `UsageRecord` schema. If `usage.jsonl` persists, it is a mirror / compatibility artifact rather than an independent canonical source.'
- Small-sweep owner precedence is explicit for these hidden cross-cutting contracts. `usage-feature.md` owns cost_usage routing and cost attribution; `newtools.md` owns Docker/Actions readiness and deprecated-alias doctor IDs; Crosswalk owns `/precedence` between feature-owner docs; Docker, GitHub Act
stale_retired_dispositions:
- '- Usage freshness is a user-trust requirement: stale values must be visibly marked with `Last updated` and an explicit `Refresh` action so old numbers are never presented as current.'
- '- Usage consumes `/package` and `/worktree` cleanup state only after owner records mark stale lanes or worktrees `cleanup_eligible`: lane/package completion, graph-patch supersession, revoked/reopened flow via `/reopened`, and completed recovery may make old backing removable only when no retention '
- '- Cursor instruction-sync status uses `Cursor Rules` as the user-facing label. PM generates `.cursor/rules/*.mdc` first, tracks compatibility projections such as `cursor/rules/*.mdc` under `/rules/`, and treats `.cursorrules` / `cursorrules` as `/deprecated` compatibility rather than the primary man'
- '- Codex stale-vs-live provider/model labeling must distinguish last-known upstream provider/model data from the current direct-provider state, and Codex multi-account includes ChatGPT `/OAuth-style` auth and API-key auth side by side.'
- Gemini usage must distinguish the direct provider from Gemini CLI while still allowing family-level pooling when policy permits. Stale-canon wording that reduces Gemini to local counters, a single `mixed-account` provider, or a generic API-key `key-exception` is not sufficient for Usage.
- Gemini `/quota` visibility is mode-aware. OAuth-backed rows may surface Gemini-plan / Code Assist-style quota semantics when authoritative evidence exists; API-key-backed rows remain a separate quota bucket and MUST NOT be mislabeled as the same quota bucket or plan path. Stale `/AI-Studio-oriented`
- '- **Retired subagent side files:** In `Plans/usage-feature.md` (`/usage-feature.md`), `active-subagents.json` and other active-subagents `side-file` / `live-state` mirrors are compatibility projections only; they must not be presented as canonical or endorsed usage enrichment sources after side-file'
- '- Use current/refreshing/stale/degraded/unavailable projection states.'
- '- cov-146 stale token retired: allowed_action_ids[]'
- '### Problem 6: Stale data'
- '| 2026-02-21 | Fleshed out: Gaps (5h/7d not in GUI, no live APIs in GUI path, Ledger vs usage_tracker split, quota only from errors, alert threshold, analytics, interview/orchestrator policy); Potential problems (API secrets, rate limits, two tracker types, platform semantics, file size, stale data,'
- '- source-confidence / stale label where needed'
- Small-sweep owner precedence is explicit for these hidden cross-cutting contracts. `usage-feature.md` owns cost_usage routing and cost attribution; `newtools.md` owns Docker/Actions readiness and deprecated-alias doctor IDs; Crosswalk owns `/precedence` between feature-owner docs; Docker, GitHub Act
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Blocked-owner eight-kind taxonomy and escalation ladder surfaces'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- 'The rewrite described in `Plans/rewrite-tie-in-memo.md` reinforces this plan''s intent: Usage should be implemented as **projections/rollups** over the canonical event ledger (seglog), with durable KV state in redb and fast search in Tantivy--without changing the UX requirements in this document. 5h/'
- Usage depends on a **complex storage solution**; the feature cannot deliver 5h/7d, dashboard, and analytics at scale without it. The canonical design is in **Plans/storage-plan.md** (validated by deterministic verifier gates and SSOT evidence contracts). Implementers must have the following in place
- '| **Seglog** (canonical event stream) | All usage-relevant events (tokens, requests, errors, platform, tier, session) are appended here; single source of truth for analytics. |'
- '- [ ] Implement seglog writer for canonical event stream.'
- 'Until this stack exists, any temporary compatibility path MUST still preserve the canonical pipeline: 5h/7d and dashboard windows are owned by rollups, not by ad hoc `usage.jsonl` scans. `usage.jsonl` may still appear as a human-readable mirror or Ledger compatibility input during migration, but it '
- '- Usage storage-doc dependencies are `Plans/storage-plan.md` and `Plans/FinalGUISpec.md`: seglog owns the append-only event source, redb owns durable KV `/settings/state`, checkpoints, projections, and rollups, Tantivy owns search indices, and any JSONL or `usage.jsonl` output is a projector mirror '
- '- Usage `/runtime/storage` paths and artifacts are scoped per-project, per-run, per-package, and per-lane; old tier/workspace-only layouts remain migration inputs and must not replace canonical project/run/package/lane identity.'
- '- GUI deep-links no longer use `run_id/thread_id/timestamp`, `/thread_id/timestamp`, `usage_event_seq`, broad timestamp filters, or tier-based `usage.jsonl` rollups as canonical navigation. They resolve object-first pivots through `usage_event_ref`, UsageRecord identity, runtime object identity, and'
- '- Usage export semantics stay distinct: record export returns exact `/records` with stable ids, canonical ids, `/refs`, metadata, and schema-aware payloads; bundle export packages records, Evidence items, attached `/blobs/files`, thread export/share payloads, selected-object bundles, `.pm-bundle` co'
- '- Usage follows graph-scale guidance across Seams, Evidence, History, and Ledger: filtered CSV is a view export rather than canonical history, JSON summaries are not record exports unless they preserve the exact record envelope, monolithic plan-graph export stays derived, and JSONL mirror export is '
- '- project-card usage copy stays compact: one primary line carries current state, owner, and reason; one secondary line carries active/background/historical summary; detailed per-run usage remains in drill-down records rather than being dumped into the card.'
- '- Quiet suppression only affects advisory resurfacing. Attention center and project badges must preserve canonical blocked and `/approval-wait` rows with precise owner and reason metadata, even when a quiet window is active.'
- '- Usage consumes `Project_Output_Artifacts.md` and `Project_Output_Artifacts` through a seglog-first / staging-second artifact model that aligns subject-open routing with canonical record identity before staging views become user-facing.'
- '- `storage-plan.md` and `storage-plan` thread/run history export to JSONL/JSON is a coarse export enhancement only; Usage treats it as projection output over canonical records rather than a replacement for the record/bundle/view taxonomy.'
- '- Usage consumes `/package` and `/worktree` cleanup state only after owner records mark stale lanes or worktrees `cleanup_eligible`: lane/package completion, graph-patch supersession, revoked/reopened flow via `/reopened`, and completed recovery may make old backing removable only when no retention '
- '- `cmd.nav.open_usage_subject` resolves canonical Usage/Ledger identity from `usage_event_ref` or an equivalent usage target; domain-specific usage commands are wrappers over the shared route/subject model, not independent argument families.'
- '| **AGENTS.md -- Usage Tracking & Plan Detection** | Canonical source for per-platform usage sources (Claude Admin API, Copilot metrics, Gemini quotas, Codex/Cursor error parsing), env vars, and error-message parsing. |'
- '| **Plans/assistant-chat-design.md §12** | Context/usage display: **context circle** (OpenCode-style) at top of chat -- hover shows tokens/usage %/cost; thread-scoped detail opens the canonical Context Detail Pane/editor-tab surface. |'
- '- OpenCode message UI is a reference for hover-revealed icon actions and metadata rows on messages, but it does not satisfy PM''s richer per-message info popover requirement; PM keeps the curated inspection and raw payload requirements below as the canonical target.'
- '- selecting `Compact Now` dispatches the canonical compaction command for that thread'
owner_hints:
- Plans/usage-feature.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `0aa9f55786575dbd9e7fbc5e155e14e603ca5a56959c5fbdae4f8801628b259d`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `usage-feature-S0001` through `usage-feature-S0103` are preserved in place and mapped in `coverage_map.jsonl` to `UF-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
