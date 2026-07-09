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
- per-thread chat cost consumes canonical UsageRecord projections first
- OpenCode-style normalization is a display fallback only when the UsageRecord marks the value `pricing_estimated` or otherwise non-authoritative
- reasoning/thoughts, cache read, cache write, cache_write_1h/TTL, output_visible, provider_total, and context_estimate display only under the provider mapper's inclusive/exclusive `counting_semantics`
- provider-sensitive cache normalization caveats, source_class, source_confidence, settlement_status, freshness, and redaction state remain visible in raw/debug paths and must not be hidden behind authoritative wording in the chat UI

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
- UF-085 is the implementation-ready UsageRecord contract. Older field names in this section are compatibility, import, export, or display aliases unless they are repeated by UF-085.
- `usage_id` resolves to `usage_record_id` or `usage_event_ref` according to the importing source; UI routes prefer `usage_event_ref` normalized through `object_kind = usage_event` and `object_id`.
- `input_tokens` resolves to `input_total`; `output_tokens` resolves to `output_total`; older `cache_read_tokens`, `cached_input_tokens`, and `cache_creation_input_tokens` aliases resolve to `cache_read`, `cache_write`, `cache_write_1h`, or `cache_write_ttl` only when the provider mapper states the TTL and inclusive/exclusive semantics.
- `cost_usd` is display or migration material only. Canonical cost authority uses `cost_microdollars`, provider minor units, currency, cost_status, pricing_snapshot_id/version/date/source, and custom-provider price row refs where applicable.
- `usage_source_kind` remains source-lineage vocabulary and maps to UF-085 `source_class`, `source_confidence`, and `source_authority`; it does not replace the closed source classes `provider_reported`, `provider_header`, `cli_reported`, `local_estimated`, `pricing_estimated`, and `unknown`.
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

### Analytics signal contract

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

### UF-002 - Usage Feature Envelope

```yaml
plan_unit_id: UF-002
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: The Usage feature is a first-class app/GUI area that remains a plan-only, implementation-agnostic specification for quota visibility, plan type, ledger inspection, analytics, and alerts, including 5h/7d usage and plan type where available.
gui_related: true
gui_classification_reason: This unit defines the user-visible Usage app/GUI feature envelope.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-002 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_feature_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0018
preserved_exact_tokens:
- PLAN DOCUMENT ONLY
- first-class area in the app/GUI
- Usage
- 5h/7d
- plan type
- ledger
- analytics
- alerts
- implementation-agnostic
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-003 - Rollup Backed Storage Dependency

```yaml
plan_unit_id: UF-003
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage reads 5h/7d, dashboard, and analytics values from redb rollups produced by analytics scan jobs over the canonical seglog pipeline, with Tantivy search/projector support where applicable; usage.jsonl remains a human-readable mirror or compatibility input, not the canonical rollup source.
gui_related: true
gui_classification_reason: The unit supports user-visible Usage numbers but primarily preserves storage-backed projection requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-003 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: rollup_backed_storage_dependency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0013
preserved_exact_tokens:
- seglog
- redb
- Tantivy
- analytics scan jobs
- 5h/7d
- dashboard
- usage.jsonl
- canonical rollup source
- Projector pipeline
negative_constraints:
- 5h/7d and dashboard windows are owned by rollups, not by ad hoc `usage.jsonl` scans.
preserved_contractrefs: []
compatibility_only_notes:
- usage.jsonl may still appear as a human-readable mirror or Ledger compatibility input during migration, but it is not the canonical rollup source.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-004 - Usage Storage Routing Identity

```yaml
plan_unit_id: UF-004
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage storage and routing are scoped by canonical project, run, package, lane, UsageRecord, runtime object identity, usage_event_ref, and Ledger/Usage route targets rather than legacy timestamp/thread/tier shortcuts.
gui_related: true
gui_classification_reason: The unit governs user-visible deep-links and route targets in Usage surfaces.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-004 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_storage_routing_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0014
preserved_exact_tokens:
- project
- run
- package
- lane
- usage_event_ref
- UsageRecord
- Ledger/Usage route targets
- run_id/thread_id/timestamp
- usage_event_seq
negative_constraints:
- Usage `/runtime/storage` paths and artifacts are scoped per-project, per-run, per-package, and per-lane; old tier/workspace-only layouts remain migration inputs and must not replace canonical project/run/package/lane identity.
- GUI deep-links no longer use `run_id/thread_id/timestamp`, `/thread_id/timestamp`, `usage_event_seq`, broad timestamp filters, or tier-based `usage.jsonl` rollups as canonical navigation.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-005 - Usage Export Taxonomy

```yaml
plan_unit_id: UF-005
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage export semantics stay distinct: record export returns exact record envelopes with stable ids, canonical ids, refs, metadata, and schema-aware payloads; bundle export packages records, Evidence, blobs/files, selected-object bundles, manifests, and run-history artifacts; view export produces filtered tables, charts, CSV/JSON summaries, search results, analytics views, and graph renders without becoming canonical record truth.'
gui_related: true
gui_classification_reason: Export is user-facing Usage behavior and file output presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-005 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_export_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0014
preserved_exact_tokens:
- Export taxonomy and manifest contract
- record export
- bundle export
- view export
- /records
- /refs
- .pm-bundle
- CSV/JSON
- graph `/render`
- JSONL mirror
negative_constraints:
- Filtered CSV and JSON summaries are view exports unless they preserve the exact record envelope.
preserved_contractrefs: []
compatibility_only_notes:
- JSONL mirror export is projection-derived rather than a replacement for seglog ownership.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-006 - Projection Trust Blocking And Freshness

```yaml
plan_unit_id: UF-006
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage must preserve projection trust, action gating, blocked/runtime recovery ownership, attention-center rows, freshness labeling, and advisory quiet-window behavior without hiding canonical blocked or approval-wait episodes.
gui_related: true
gui_classification_reason: The unit governs user-visible freshness, attention, blocked, and recovery presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-006 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: projection_trust_blocking_and_freshness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0014
preserved_exact_tokens:
- Projection trust and action gating
- Identity and blocked-policy transfer cluster
- Blocked-owner eight-kind taxonomy
- Last updated
- Refresh
- quiet suppression
- /approval-wait
- blocked/runtime authority
negative_constraints:
- Quiet suppression only affects advisory resurfacing; canonical blocked and `/approval-wait` rows must preserve precise owner and reason metadata.
- Usage consumes Executor_Protocol blocked/runtime recovery ownership outcomes without inventing a separate authority.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Usage freshness is a user-trust requirement: stale values must be visibly marked with `Last updated` and an explicit `Refresh` action.'
owner_hints:
- Plans/usage-feature.md
```

### UF-007 - Account Switch Pressure And Bridge Identity

```yaml
plan_unit_id: UF-007
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage attribution preserves account switch and pressure history through actor-scoped snapshots, account_switch_event and account_pressure_episode records, and explicit bridge precedence where attempt_id is the local runtime anchor, provider_attempt_ref? is provider/runtime trace, usage_event_ref is the Usage bridge, and receipt refs are external side-effect lineage.
gui_related: false
gui_classification_reason: The unit preserves backend/runtime identity and attribution rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-007 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: account_switch_pressure_and_bridge_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0014
preserved_exact_tokens:
- Execution role and operational identity
- Account switch and pressure history
- attempt_id
- provider_attempt_ref?
- usage_event_ref
- receipt refs
- actor_kind
- execution_role
- account_switch_event
- account_pressure_episode
negative_constraints:
- Scheduler-internal IDs remain scheduler/effective-resolution evidence and must not be inserted into usage_record by default.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-008 - Widget Shell And Project Card Usage Consumers

```yaml
plan_unit_id: UF-008
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage consumes widget and shell presentation contracts without re-owning them: Widget_System broad pre-rewrite Orchestrator widget material is compatibility lineage, dashboard_layout migration reads yield to widget_layout:v1:dashboard, and project-card usage copy stays compact with one primary and one secondary line.'
gui_related: true
gui_classification_reason: The unit constrains user-visible widget, shell, and project-card presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-008 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: widget_shell_and_project_card_usage_consumers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0014
preserved_exact_tokens:
- Widget_System
- compatibility lineage
- dashboard_layout:v1
- dashboard_layout
- widget_layout:v1:dashboard
- project-card usage copy
- one primary line
- one secondary line
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Widget_System broad pre-rewrite Orchestrator widget model is compatibility lineage, not Usage ownership.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-009 - Quota Visibility And Alerts

```yaml
plan_unit_id: UF-009
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage surfaces show quota and plan visibility with 5h and 7d windows, detected/configured plan type, always-visible limits, background refresh, live vs after-run source disclosure, approaching-limit warnings such as 80%, and rate-limit-hit actions to switch platform or pause.
gui_related: true
gui_classification_reason: The unit defines visible quota/alert UI behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-009 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: quota_visibility_and_alerts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0019
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0020
preserved_exact_tokens:
- '5h: X / Y'
- '7d: X / Y'
- Plan type
- Background refresh
- live
- after-run
- 80%
- Switch platform
- pause
- Always-visible limits
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-010 - Ledger Analytics Reporting And Retention

```yaml
plan_unit_id: UF-010
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage keeps event-level usage ledger inspection, filtering/export, optional analytics by time/platform/project/tier, cost tracking/attribution, retention/privacy controls, and drill-down without turning filtered exports into canonical history.
gui_related: true
gui_classification_reason: The unit defines visible ledger, analytics, reporting, and export surfaces.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-010 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: ledger_analytics_reporting_and_retention
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0021
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0022
preserved_exact_tokens:
- Event-level log
- platform
- operation
- tokens in/out
- cost
- filtering
- export
- JSON
- Aggregated view
- Cost tracking
- Retention policy
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-011 - Chat Context Circle Affordance

```yaml
plan_unit_id: UF-011
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Thread-scoped Usage appears as the chat context circle with hover-revealed Usage, Tokens, Cost, and More Details actions plus explicit click-to-Compact Now behavior; More Details opens the editor-tab Context Detail Pane, Compact Now dispatches only after explicit choice and exposes failure/degraded feedback, and app-wide Usage remains a separate surface.
gui_related: true
gui_classification_reason: The unit defines user-visible chat Usage controls.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-011 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: chat_context_circle_affordance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0023
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-automated-testing-acceptance
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0094
preserved_exact_tokens:
- context circle
- Usage
- Tokens
- Cost
- More Details
- Compact Now
- context.compaction.failed
- Context Detail Pane
- app-wide Usage
- OpenCode
negative_constraints:
- Compact Now must not dispatch from hover alone.
- Compact Now failure must not be silent or logs-only.
- OpenCode references are non-binding UX references and do not replace Puppet Master canonical behavior.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-012 - Context Detail Pane Inspection

```yaml
plan_unit_id: UF-012
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: The Context Detail Pane provides curated overview cards, grouped usage breakdowns, per-message inspection, raw payload toggles, provider/model/mode/persona drill-downs, and side-by-side Expert/ELI5 help copy for thread-scoped usage.
gui_related: true
gui_classification_reason: The unit defines visible Context Detail Pane inspection behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-012 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: context_detail_pane_inspection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0023
preserved_exact_tokens:
- Context Detail Pane
- curated overview
- grouped breakdowns
- per-message inspection
- raw payload
- provider
- model
- mode
- persona
- Expert
- ELI5
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-013 - Per Thread Estimated Cost Rule

```yaml
plan_unit_id: UF-013
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Per-thread estimated cost and context usage preserve provider-sensitive caveats: reasoning tokens may be charged at output-token estimate when needed, cache read/write buckets remain visible, and raw/debug paths disclose normalization limits instead of claiming exact billing truth.'
gui_related: true
gui_classification_reason: The unit governs visible per-thread cost/usage copy and caveat presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-013 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: per_thread_estimated_cost_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0023
preserved_exact_tokens:
- estimated cost
- reasoning tokens
- output-token estimate
- cache read/write
- provider-sensitive cache normalization caveats
- raw/debug paths
negative_constraints:
- Provider-sensitive cache normalization caveats must remain visible in raw/debug paths and must not be hidden behind authoritative wording in the chat UI.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-014 - Cursor Usage Account Augmentation

```yaml
plan_unit_id: UF-014
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Cursor Usage rows treat CURSOR_API_KEY as an advanced usage/account augmentation path, keep cursor-agent login as the default local account path, classify usage source confidence honestly, and avoid fake universal remaining-request counters or inferred remaining-requests; .cursorrules remains deprecated compatibility projection.
gui_related: true
gui_classification_reason: The unit governs visible Cursor usage/account rows and source-confidence presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-014 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: cursor_usage_account_augmentation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0024
preserved_exact_tokens:
- CURSOR_API_KEY
- cursor-agent
- source classes
- remaining-requests
- .cursorrules
- Cursor Rules
negative_constraints:
- PM must not invent a fake universal remaining-request counter when Cursor exposes only plan totals, team allotments, or runtime/editor refusal signals.
- Cursor browser-auth accounts may provide strong local per-run usage, but `/limit` and account-row truth require provider or team API augmentation.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- .cursorrules / cursorrules are deprecated compatibility rather than the primary managed format.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-015 - Codex Direct Provider Buckets

```yaml
plan_unit_id: UF-015
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Codex direct provider Usage must keep ChatGPT sign-in and API-key rows as distinct buckets with requested/effective auth labels, plan-backed vs API-billed usage separation, and setup/status probes such as codex login status treated as setup evidence only.
gui_related: true
gui_classification_reason: The unit governs visible Codex account/usage rows and labels.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-015 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: codex_direct_provider_buckets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0025
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0026
preserved_exact_tokens:
- Sign in with ChatGPT
- Use API Key
- MUST NOT merge those buckets
- 'Plan: ChatGPT <tier>'
- 'Usage Bucket: API billed'
- codex login status
negative_constraints:
- PM MUST NOT merge those buckets into one shared pressure or cooldown pool, even when they belong to the same human owner.
- codex login status is setup/status evidence only; it does not become usage quantity, quota, or remaining-window evidence.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Codex stale-vs-live provider/model labeling must distinguish last-known upstream data from current direct-provider state.
owner_hints:
- Plans/usage-feature.md
```

### UF-016 - Copilot Billing Pressure Evidence

```yaml
plan_unit_id: UF-016
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: GitHub Copilot pressure preserves premium exhaustion, paid-overage policy, org policy, entitlement-missing, billing/entity, runtime-side entitlement, and bridge-visible usage-record evidence as distinct conditions and must not promise a simple per-account remaining-requests endpoint without provider support.
gui_related: false
gui_classification_reason: The unit preserves provider/account evidence rules rather than GUI presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-016 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: copilot_billing_pressure_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0027
preserved_exact_tokens:
- premium-request exhaustion
- paid-overage policy
- org policy
- entitlement-missing
- remaining-requests
- bridge-visible
- usage-record
- usage_record
negative_constraints:
- premium-request exhaustion, paid-overage policy, org policy blocks, and entitlement-missing states are distinct conditions and must not all be flattened into a generic cooldown.
- Team admin APIs such as `/metrics/spending` may inform Copilot pressure, but PM must not promise a simple per-account `remaining-requests` endpoint unless the provider exposes one.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-017 - Copilot Status Disclosure

```yaml
plan_unit_id: UF-017
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Copilot Usage and status surfaces disclose selected billing/entity context and explicit status copy such as Premium requests exhausted, with subtext and included-model eligibility notes when they explain the active quota bucket.
gui_related: true
gui_classification_reason: The unit owns user-visible Copilot status and explanatory copy.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-017 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: copilot_status_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0027
preserved_exact_tokens:
- Premium requests exhausted
- Premium-request-backed features are unavailable until reset or policy change
- Included models may still be available
- selected billing/entity context
- active quota bucket
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-018 - Claude Code Admin Api Usage

```yaml
plan_unit_id: UF-018
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Claude Code Usage can consume Anthropic Admin API and stream-json usage evidence, but must distinguish subscriber-backed, API-backed, Console, and organization-backed limits and must not reuse org/API hard limit semantics without provider evidence.
gui_related: false
gui_classification_reason: The unit preserves provider usage evidence and account semantics rather than GUI layout.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-018 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: claude_code_admin_api_usage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0028
preserved_exact_tokens:
- Admin API
- /v1/organizations/usage_report/claude_code
- ANTHROPIC_API_KEY
- stream-json
- subscriber-backed
- API-backed
- RPM
- /TPM
negative_constraints:
- Subscriber-backed rows must not reuse API / Console / organization-backed hard limit semantics without provider evidence.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-019 - Gemini Direct Cli Separation

```yaml
plan_unit_id: UF-019
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Gemini Usage must distinguish Gemini direct from Gemini CLI and retire stale-canon wording that collapses Gemini into local counters, one mixed-account provider, or a generic API-key key-exception; CLI runtime transport remains owned by CLI_Bridged_Providers.
gui_related: false
gui_classification_reason: The unit preserves provider mode and owner-boundary semantics rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-019 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: gemini_direct_cli_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0029
preserved_exact_tokens:
- Gemini
- Gemini CLI
- mixed-account
- key-exception
- local counters
- CLI_Bridged_Providers.md
negative_constraints:
- Usage must not collapse Gemini into one direct provider with mixed OAuth/API-key pools and no CLI runtime.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale-canon wording that reduces Gemini to local counters, a single `mixed-account` provider, or a generic API-key `key-exception` is not live Usage canon.
owner_hints:
- Plans/usage-feature.md
```

### UF-020 - Gemini Direct Setup Usage

```yaml
plan_unit_id: UF-020
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Gemini direct rows are API-key-backed provider entries using GEMINI_API_KEY and Use API Key as the canonical setup path, with project/quota attribution and estimated or unknown wording when authoritative remaining quota cannot be proven.
gui_related: true
gui_classification_reason: The unit governs visible Gemini direct setup and quota labels.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-020 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: gemini_direct_setup_usage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0030
preserved_exact_tokens:
- GEMINI_API_KEY
- Use API Key
- estimated
- /unknown
- API-key-backed
- quota bucket
- Code Assist
negative_constraints:
- API-key-backed rows must not be mislabeled as the same quota bucket or plan path as OAuth-backed Code Assist-style quota semantics.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Media_Generation_and_Capabilities.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-021 - Retired Gemini CLI Usage Evidence

```yaml
plan_unit_id: UF-021
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Gemini CLI usage evidence vocabulary is retired/source-lineage only. OAuth, direct API key, Vertex/Google
  credentials, ADC, gcloud, service-account, /stats model, Configured, Working, Operational, and requested/effective model
  difference tokens remain auditable, but PM must not create active Gemini CLI usage rows or scheduler pressure signals.
gui_related: false
gui_classification_reason: The unit preserves runtime/provider evidence rather than GUI presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-021 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: retired_gemini_cli_usage_resurrection
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: retired_gemini_cli_usage_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0031
preserved_exact_tokens:
- OAuth
- direct API key
- Vertex
- Google credential
- ADC
- gcloud
- service-account
- /stats model
- Configured
- Working
- Operational
- requested/effective
negative_constraints:
- Do not create active Gemini CLI usage rows.
- Do not use retired Gemini CLI stats as scheduler pressure signals.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes:
- Gemini CLI usage tokens are retained only for migration/currentness lineage.
stale_retired_dispositions:
- Active Gemini CLI usage evidence is retired by provider-update ledger pldg-20260624-001-provider-updates.
owner_hints:
- Plans/usage-feature.md
```

### UF-022 - Active Provider Family Pooling Capability Posture

```yaml
plan_unit_id: UF-022
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: When policy pools active provider entries, Usage still shows the concrete runtime surface, requested/effective
  auth/account intent, quota bucket, source confidence, capability posture supports_* flags, auth recovery methods, and quota
  signal sources. Gemini Direct and Antigravity may pool only when their effective capabilities satisfy the request; retired
  Gemini CLI cannot be selected as an active pool member. API-key buckets must not be mislabeled as OAuth/Code Assist quota paths.
gui_related: true
gui_classification_reason: The unit governs visible pooled Gemini usage and capability disclosure.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-022 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: active_provider_family_pooling_capability_posture
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0032
preserved_exact_tokens:
- supports_multi_account
- supports_threshold_switch
- supports_hard_exhaustion_detection
- supports_rate_limit_detection
- supports_reset_countdown
- supports_manual_set_active
- supports_cooldown
- supports_retry_budget
- supports_role_scoped_account_pools
- auth_recovery_methods
- quota_signal_sources
negative_constraints:
- Gemini API-key-backed rows remain a separate quota bucket and MUST NOT be mislabeled as the same quota bucket or plan path.
- Retired Gemini CLI must not participate as an active pool member.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md'
compatibility_only_notes:
- The exact phrase "Gemini direct and Gemini CLI" pooling wording is retained only as source-lineage.
stale_retired_dispositions:
- Stale `/AI-Studio-oriented` copy is historical context only.
- Active Gemini CLI usage pooling is retired.
owner_hints:
- Plans/usage-feature.md
```

### UF-023 - Provider Source Confidence Augmentation

```yaml
plan_unit_id: UF-023
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Provider/backend usage normalization distinguishes authoritative native quota, authoritative session/tool stats, and inferred or estimated usage, with visible source-confidence, row-type, secondary labels, cooldown/reset handling, coding-plan reset semantics, and documented/default versus effective observed state separation.
gui_related: true
gui_classification_reason: The unit defines visible provider usage rows, tables, badges, and source labels.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-023 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: provider_source_confidence_augmentation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0033
preserved_exact_tokens:
- authoritative native usage
- authoritative session `/tool` stats
- inferred `/estimated` usage
- row-type
- /secondary
- authoritative_rate_limit_or_cooldown
- Unknown reset
- Unknown cooldown end
- Alibaba Coding Plan
- MiniMax Coding Plan
- documented/default expectation
- effective observed state
negative_constraints:
- Known reset/cooldown times tick live; unknown values render `Unknown reset` or `Unknown cooldown end`, never a fabricated countdown.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-024 - Direct Provider Status Probes

```yaml
plan_unit_id: UF-024
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Direct-provider status probes such as codex login status may record account login setup/status evidence but must not be converted into usage quantity, quota, or remaining-window evidence.
gui_related: false
gui_classification_reason: The unit preserves provider setup evidence semantics rather than GUI presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-024 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: direct_provider_status_probes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0034
preserved_exact_tokens:
- Direct-provider status probes
- codex login status
- setup/status evidence
- usage quantity
- quota
- remaining-window evidence
negative_constraints:
- codex login status does not convert the probe into usage quantity, quota, or remaining-window evidence.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-025 - Cost Usage Artifact Routing

```yaml
plan_unit_id: UF-025
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: The cost_usage runtime artifact is an attribution record that uses the canonical usage pipeline, with Show in Ledger and Show in Usage actions routing to Ledger, app-wide Usage, or the thread-scoped Context Detail Pane by scope and without creating a second token or cost model.
gui_related: true
gui_classification_reason: The unit defines user-visible artifact actions and routing.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-025 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: cost_usage_artifact_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0036
preserved_exact_tokens:
- cost_usage
- Show in Ledger
- Show in Usage
- Context Detail Pane
- app-wide Usage
- thread-scoped
- canonical usage schema
- second token or cost model
negative_constraints:
- thread-scoped cost usage does not open a chat side-panel usage surface.
- the artifact does not create a second token or cost model outside the canonical usage schema.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-026 - OpenCode Product Pipeline Reference

```yaml
plan_unit_id: UF-026
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: OpenCode product usage flow is a non-binding reference for provider response to usage normalization to message and usage.event storage; Puppet Master does not replicate it exactly and instead normalizes all providers and transports to the same usage.event/message usage shape.
gui_related: true
gui_classification_reason: The unit preserves user-visible usage-message reference behavior and storage normalization boundary.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-026 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: opencode_product_pipeline_reference
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0037
preserved_exact_tokens:
- provider response
- LanguageModelV2Usage
- getUsage
- Session.getUsage
- finish-step
- message
- usage.event
- Puppet Master does not replicate this exactly
- all providers
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Provider_OpenCode.md, PolicyRule:Decision_Policy.md\xA72"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-027 - Backend Input Hierarchy

```yaml
plan_unit_id: UF-027
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage backend inputs follow a hierarchy of canonical usage projections and redb rollups over seglog first, supported provider/runtime outputs second, and compatibility mirrors such as usage.jsonl or retired side files only as noncanonical migration/debug inputs.
gui_related: false
gui_classification_reason: The unit preserves backend storage/input hierarchy and source attribution rather than visual presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-027 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: backend_input_hierarchy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0038
preserved_exact_tokens:
- canonical usage projections
- redb rollups
- seglog
- usage.jsonl
- active-subagents.json
- side-file
- live-state
- 'change_status: "new"'
- URL
- UsageRecord
- signal weighting
negative_constraints:
- active-subagents.json and other side-file/live-state mirrors must not be presented as canonical or endorsed usage enrichment sources after side-file retirement.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FinalGUISpec.md'
- "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md\xA72"
compatibility_only_notes:
- usage.jsonl may still be read as a human-readable mirror or migration input, but not as the canonical 5h/7d rollup source.
stale_retired_dispositions:
- Retired subagent side files remain compatibility projections only.
owner_hints:
- Plans/usage-feature.md
```

### UF-028 - Usage Linked Planning Widget Consumer Boundary

```yaml
plan_unit_id: UF-028
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage-linked planning widgets consume sticky-card and execution-tracker contracts after approval with read-mostly status badges, item-focus navigation, and post-approval edit restrictions, without becoming a second plan state owner.
gui_related: true
gui_classification_reason: The unit governs user-visible planning widget status badges and navigation in Usage-linked surfaces.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-028 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_linked_planning_widget_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0038
preserved_exact_tokens:
- sticky-card
- execution-tracker
- read-mostly status badges
- item-focus navigation
- post-approval edit restrictions
- second plan state owner
negative_constraints:
- Usage-linked planning widgets must not become a second plan state owner.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FinalGUISpec.md'
- "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md\xA72"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-029 - Canonical Usage Placement And Exclusions

```yaml
plan_unit_id: UF-029
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage placement is fixed: app-wide Usage is its own page or view, compact usage appears in shell/status surfaces, thread-scoped context detail lives in chat via the context circle plus editor-tab Context Detail Pane, and artifact/chat deep-links land on canonical surfaces by scope.'
gui_related: true
gui_classification_reason: The unit defines user-visible Usage placement and excludes competing detailed surfaces.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-029 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: canonical_usage_placement_and_exclusions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0039
preserved_exact_tokens:
- app-wide Usage
- shell and status surfaces
- context circle
- editor-tab Context Detail Pane
- artifact deep-links
- chat usage activation
- thread Usage
- detached usage pop-out
- tab or panel or pop-out
negative_constraints:
- Thread Usage in the chat shell or side panel is not the primary detailed surface.
- Detached usage pop-out is not the canonical thread detail model.
- Direct click on the context circle must not open the detail pane without the hover/click split.
- Unresolved `tab or panel or pop-out` phrasing must not leave implementation guessing.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-030 - Canonical Usage Event Pipeline

```yaml
plan_unit_id: UF-030
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage events flow into immutable UsageRecord data for tokens, costs, tool calls, API calls, helper/background usage, and parent run/thread plus concrete invocation attribution.
gui_related: false
gui_classification_reason: The unit preserves backend UsageRecord event pipeline behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-030 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: canonical_usage_event_pipeline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0041
preserved_exact_tokens:
- Usage events
- UsageRecord
- tokens
- costs
- tool calls
- API calls
- immutable
- explicit versioning
- helper/background
- parent run/thread
negative_constraints:
- Usage records are immutable once committed; corrections require a new record with explicit versioning.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-031 - Debug Investigation Phase Attribution

```yaml
plan_unit_id: UF-031
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage analytics may group Debug Mode work by investigation lifecycle phase labels such as instrumenting, reproducing, collecting_evidence, analyzing, and applying_fix without making Usage the owner of Debug runtime state-machine semantics.
gui_related: false
gui_classification_reason: The unit preserves analytics attribution dimensions rather than GUI presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-031 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: debug_investigation_phase_attribution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0042
preserved_exact_tokens:
- instrumenting
- reproducing
- collecting_evidence
- analyzing
- applying_fix
- Debug runtime state-machine
negative_constraints:
- Usage does not own Debug runtime state-machine semantics.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-032 - Billing Attribution Family And Pricing Metadata

```yaml
plan_unit_id: UF-032
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage preserves billing identity, provider usage billing evidence, shared attribution family, run/attempt/thread/node/artifact/provider/usage anchors, rate cards, and surcharges as attribution and pressure evidence without replacing canonical usage_record, entitlement, or billing-entity contracts.
gui_related: false
gui_classification_reason: The unit preserves backend billing and attribution metadata semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-032 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: billing_attribution_family_and_pricing_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0043
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0045
preserved_exact_tokens:
- /billing
- /usage/billing
- usage_record
- entitlement
- billing entity
- run/attempt/thread/node/artifact/provider/usage anchors
- rate cards
- surcharges
negative_constraints:
- Provider `/billing` and `/usage/billing` metadata remains attribution and pressure evidence; it does not replace canonical contracts.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-033 - Artifact Bridge And Inspector Routing

```yaml
plan_unit_id: UF-033
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Artifact drill-through and receipt lineage use attempt_id, provider_attempt_ref, usage_event_ref, receipt refs, and explicit inspector_target values for details/evidence/usage/lineage, avoiding timestamp heuristics, tier_id pivots, eager deref, and feature-local routing semantics.
gui_related: true
gui_classification_reason: The unit governs user-visible inspector routing and artifact drill-through behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-033 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: artifact_bridge_and_inspector_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0053
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0054
preserved_exact_tokens:
- attempt_id
- provider_attempt_ref
- usage_event_ref
- receipt refs
- inspector_target = details | evidence | usage | lineage
- timestamp heuristics
- tier_id
- on-demand
- payload.meta
- ref/blob pointers
- click-to-expand
negative_constraints:
- None of those bridge fields replace the primary local key.
- Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger.
- History inspector deref policy is on-demand only, never eager.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-034 - Notification Projection Health Gating

```yaml
plan_unit_id: UF-034
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage help, notification, quiet-window, projection-health, and sensitive-action behavior routes notifications by severity, execution impact, blocked owner, persistence, and projection trust; quiet windows apply only to advisory warnings; degraded projections expose current/refreshing/stale/degraded/unavailable states and record-backed fallback.
gui_related: true
gui_classification_reason: The unit governs user-visible notification, projection-health, and degraded-state behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-034 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: notification_projection_health_gating
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0056
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0057
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0058
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0059
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0060
preserved_exact_tokens:
- severity
- execution impact
- blocked owner
- persistence
- projection trust
- quiet windows
- current/refreshing/stale/degraded/unavailable
- record-backed fallback
negative_constraints:
- Quiet windows are allowed for advisory warnings but not for canonical blocked episodes.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-035 - UsageRecord Schema Source Attribution

```yaml
plan_unit_id: UF-035
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: UsageRecord schema expectations preserve unified schema aliases, usage_id, created_at_utc, account_id, provider_id, model_id, usage_source_kind, provider_runtime_usage, provider_quota_api, provider_usage_api, provider_error_hint, project_rollup, local-estimated, API-key-derived, and OAuth-quota-derived source detail.
gui_related: false
gui_classification_reason: The unit preserves backend UsageRecord schema and attribution fields.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-035 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usagerecord_schema_source_attribution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0061
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0062
preserved_exact_tokens:
- UsageRecord
- usage_id
- created_at_utc
- account_id
- provider_id
- model_id
- usage_source_kind
- provider_runtime_usage
- provider_quota_api
- local-estimated
- API-key-derived
- OAuth-quota-derived
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-036 - Cost Precision Display Boundary

```yaml
plan_unit_id: UF-036
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage cost display uses clamp/derived-field precision rules derived from cost_microdollars or exact provider minor-unit receipts, including <$0.01 = 6dp, <$1 = 4dp, otherwise 2dp, while cost_usd is display/migration material and raw provider cost values remain provenance/debug evidence only.
gui_related: true
gui_classification_reason: The unit defines visible cost precision and display boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-036 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: cost_precision_display_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0061
preserved_exact_tokens:
- /clamp/derived-field
- cost_microdollars
- <$0.01 = 6dp
- <$1 = 4dp
- cost_usd = cost_microdollars / 1_000_000
- raw-cost provider values
negative_constraints:
- Raw-cost provider values must not become independent billing authority.
- cost_usd is not a persisted UsageRecord authority field.
preserved_contractrefs: []
compatibility_only_notes:
- cost_usd = cost_microdollars / 1_000_000 is derived only at display/export boundaries or compatibility import/migration edges.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-037 - Blocked Escalation Observability

```yaml
plan_unit_id: UF-037
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage blocked-state observability preserves attention_required, blocked_notice, blocked_family, allowed_action_ids[] stale-token retirement, escalation_level, action_available ownership, an 8-kind blocked-owner taxonomy, and a 5-level escalation ladder across Orchestrator, Dashboard, thread badges, and notifications.
gui_related: true
gui_classification_reason: The unit governs user-visible blocked/escalation rows and badges.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-037 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: blocked_escalation_observability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0063
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0064
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0065
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0066
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0067
preserved_exact_tokens:
- attention_required
- blocked_notice
- blocked_family
- allowed_action_ids[]
- escalation_level
- action_available
- 8-kind taxonomy
- 5-level escalation ladder
- Dashboard
- thread badges
- notifications
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- allowed_action_ids[] is preserved as a stale-token disposition in this usage-side carry-through span.
owner_hints:
- Plans/usage-feature.md
```

### UF-038 - Usage Secrets Fallback Source Labeling

```yaml
plan_unit_id: UF-038
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: When platform APIs require secrets such as ANTHROPIC_API_KEY or GITHUB_TOKEN/GH_TOKEN, Usage must label missing live data honestly and always show project-local canonical usage summaries from rollups/projections as fallback.
gui_related: true
gui_classification_reason: The unit defines user-visible source labels, env-var help, and fallback messages.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-038 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_secrets_fallback_source_labeling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0068
preserved_exact_tokens:
- ANTHROPIC_API_KEY
- GITHUB_TOKEN
- GH_TOKEN
- N/A
- Set ANTHROPIC_API_KEY
- From this project's usage
- From Claude (API)
negative_constraints:
- Users must not be led to assume no data means no usage.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-039 - Usage Api Refresh Rate Limiting

```yaml
plan_unit_id: UF-039
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage refreshes provider API data at reasonable cached intervals, supports explicit Refresh, updates from run results when available, and avoids excessive polling that could hit rate limits or consume quota.
gui_related: false
gui_classification_reason: The unit preserves backend/provider refresh policy with limited visible Refresh behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-039 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_api_refresh_rate_limiting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0069
preserved_exact_tokens:
- 5-15 min
- cache last result
- Refresh
- After each run
- rate limits
- API errors
negative_constraints:
- Polling usage endpoints too frequently must not consume user quota or cause blocked requests.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-040 - Canonical UsageRecord Write Path

```yaml
plan_unit_id: UF-040
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage must unify around one canonical write path and one UsageRecord schema so Ledger, rollups, and UI projections read the same attribution model rather than parsing ad hoc JSON or duplicate tracker types.
gui_related: true
gui_classification_reason: The unit affects user-visible correctness in Ledger/rollup/UI projections and shared backend schema.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-040 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: canonical_usagerecord_write_path
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0070
preserved_exact_tokens:
- state::UsageTracker
- types::UsageRecord
- platforms::UsageTracker
- UsageEvent
- UsageSummary
- one canonical write path
- one `UsageRecord` schema
- usage.jsonl
negative_constraints:
- Ledger, rollups, and UI projections must not fork into separate attribution models.
preserved_contractrefs: []
compatibility_only_notes:
- If usage.jsonl persists, it is a mirror / compatibility artifact rather than an independent canonical source.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-041 - Usage Window Model And Platform Semantics

```yaml
plan_unit_id: UF-041
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage/cooldown semantics use a generic usage-window model with window_kind, window_label, window_scope, rolling, fixed_reset, billing_cycle, session_only, and unknown semantics so platform-specific windows such as Codex, Claude, Gemini, Cursor, MiniMax, and provider estimates are labeled rather than flattened into one 5h/7d column.
gui_related: true
gui_classification_reason: The unit defines user-visible platform-specific window labels and tooltips.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-041 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_window_model_and_platform_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0071
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0072
preserved_exact_tokens:
- 5h/7d
- usage-window
- window_kind
- rolling
- fixed_reset
- billing_cycle
- session_only
- unknown
- window_scope
- MiniMax Coding Plan
negative_constraints:
- Avoid one generic `5h/7d` column when semantics differ.
- The UI may show inferred/estimated usage only if it labels the evidence source and avoids pretending to know reset semantics.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-042 - Seglog Retention Rollup Freshness

```yaml
plan_unit_id: UF-042
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage event storage uses retention, optional export-first archival/compaction, daily summary records, incremental redb rollup refresh, and explicit freshness cues; usage.jsonl is a human-readable mirror only and MUST NOT serve aggregation or 5h/7d windows.
gui_related: true
gui_classification_reason: The unit defines visible rollup freshness and backend retention behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-042 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: seglog_retention_rollup_freshness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0073
preserved_exact_tokens:
- 90 days
- archive
- compact
- daily summary records
- redb rollups
- freshness cue
- usage.jsonl
- MUST NOT be used for aggregation
negative_constraints:
- usage.jsonl is a human-readable mirror only and MUST NOT be used for aggregation, rollup computation, or 5h/7d window serving.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes:
- usage.jsonl follows the same retention policy as seglog if retained for debugging.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-043 - Stale Data And Project Scope Disclosure

```yaml
plan_unit_id: UF-043
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage must show Last updated and Refresh for stale values, may refresh on focus/run start with rate limiting, and must distinguish current-project Usage from future all-project aggregation through explicit scope labels/selectors.
gui_related: true
gui_classification_reason: The unit defines user-visible freshness and project-scope disclosure.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-043 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: stale_data_and_project_scope_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0074
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0075
preserved_exact_tokens:
- Last updated
- Refresh
- 5h/7d
- Usage for this project
- Current project
- All projects
- scope selector
negative_constraints:
- Old numbers must not be presented as current.
- All-project aggregation requires an explicit scope selector and documented read path.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-044 - Deferred Time Window Selector

```yaml
plan_unit_id: UF-044
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage may later add a time-window selector with 5h, 7d, 24h, and custom date range presets; the phase label is v1 optional and fixed 5h/7d can ship first.
gui_related: false
gui_classification_reason: The unit is a deferred option-set control requirement rather than current visual layout.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-044 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_time_window_selector
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0077
preserved_exact_tokens:
- 5h
- 7d
- 24h
- custom date range
- dropdown
- preset buttons
- v1 optional
- fixed 5h/7d first
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-045 - Deferred Reset Countdown

```yaml
plan_unit_id: UF-045
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage may show reset countdowns such as Resets in 2h 15m from QuotaInfo.resets_at or parsed error/API responses; phase label is v1 if already parsed, low effort.
gui_related: true
gui_classification_reason: The unit defines visible reset countdown copy.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-045 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_reset_countdown
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0078
preserved_exact_tokens:
- Reset countdown
- Resets in 2h 15m
- QuotaInfo.resets_at
- v1
- low effort
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-046 - Deferred Per Run Config Usage

```yaml
plan_unit_id: UF-046
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Execution settings may show per-run, node, package, or execution-scope usage aggregated from usage_event_ref, run_id, node_id, attempt_id, and runtime attribution fields rather than tier_id; phase label is Post-v1.
gui_related: false
gui_classification_reason: The unit preserves backend aggregation scope for future Config consumers.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-046 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_per_run_config_usage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0079
preserved_exact_tokens:
- This run / node / package
- usage_event_ref
- run_id
- node_id
- attempt_id
- tier_id
- Post-v1
negative_constraints:
- Aggregate from canonical usage identity rather than by `tier_id`.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-047 - Deferred Usage Page Export

```yaml
plan_unit_id: UF-047
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage page export may export the current ledger filter, date range, or analytics table as CSV/JSON, unifying Ledger export under Usage; phase label is v1 for Ledger export and later analytics extension.
gui_related: true
gui_classification_reason: The unit defines visible Usage export actions.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-047 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_usage_page_export
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0080
preserved_exact_tokens:
- Export from Usage page
- CSV/JSON
- Ledger export
- date-range/analytics export
- v1
- analytics
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-048 - Deferred Compact Header Usage

```yaml
plan_unit_id: UF-048
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage may expose compact header text such as Cursor 5h and Claude 7d percentages linked to full Usage; phase label is v1 or post-v1 depending on placement.
gui_related: true
gui_classification_reason: The unit defines visible header usage presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-048 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_compact_header_usage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0081
preserved_exact_tokens:
- Usage in header
- 'Cursor 5h: 80%'
- 'Claude 7d: 45%'
- compact
- full Usage page
- v1 or post-v1
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-049 - Deferred Doctor Usage Integration

```yaml
plan_unit_id: UF-049
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage and Doctor may cross-link through usage_check, View in Usage, Run Doctor, and Doctor-tab navigation for warning/error triage; phase label is v1 optional.
gui_related: true
gui_classification_reason: The unit defines visible Doctor/Usage navigation affordances.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-049 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_doctor_usage_integration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0082
preserved_exact_tokens:
- Doctor integration
- View in Usage
- Run Doctor
- Doctor tab
- usage_check
- v1 optional
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-050 - Deferred Cost Column

```yaml
plan_unit_id: UF-050
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage may add a cost column when platform runners or parsers provide cost, replacing current cost: None values with persisted cost shown in Ledger and analytics; phase label is when at least one platform provides cost.'
gui_related: false
gui_classification_reason: The unit preserves future cost data availability and persistence behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-050 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_cost_column
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0083
preserved_exact_tokens:
- Cost column
- 'cost: None'
- Ledger
- analytics
- cost by project/date
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-051 - Deferred Alerts History

```yaml
plan_unit_id: UF-051
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage may log approaching-limit or quota-exhausted alerts in a small log such as alerts.jsonl and display them in Usage or Settings; phase label is Post-v1.
gui_related: false
gui_classification_reason: The unit preserves future alert history persistence rather than current GUI layout.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-051 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_alerts_history
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0084
preserved_exact_tokens:
- Alerts history
- approaching limit
- quota exhausted
- alerts.jsonl
- Usage or Settings
- Post-v1
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-052 - Out Of Scope Peer Benchmarks

```yaml
plan_unit_id: UF-052
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Peer/benchmark comparison requires anonymized opt-in telemetry and a backend and is future work, not in current scope.
gui_related: false
gui_classification_reason: The unit records out-of-scope future analytics rather than GUI implementation work.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-052 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: out_of_scope_peer_benchmarks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0085
preserved_exact_tokens:
- Comparison with peers / benchmarks
- anonymized opt-in data
- backend
- Future
- not in scope
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-053 - Usage Plan Out Of Scope Constraints

```yaml
plan_unit_id: UF-053
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: This Usage plan excludes platform CLI contract changes, new platform-specific APIs beyond AGENTS.md, chat/context-window token counting, and current-stack Rust/Iced implementation details as live authority.
gui_related: false
gui_classification_reason: The unit preserves scope boundaries and retired implementation-stack references.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-053 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_plan_out_of_scope_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0086
preserved_exact_tokens:
- platform CLI contracts
- new platform-specific APIs
- AGENTS.md
- Token counting
- context-window usage
- assistant-chat-design
- Rust/Iced
negative_constraints:
- Do not treat the current Rust/Iced stack reference as canonical implementation authority for the rebuilt Rust + Slint direction.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Rust/Iced is retained here as historical implementation context only.
owner_hints:
- Plans/usage-feature.md
```

### UF-054 - Usage Success Criteria

```yaml
plan_unit_id: UF-054
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage success requires 5h/7d usage and plan visibility without a manual usage command, a dedicated Usage view or equivalent ledger/analytics access, clear warnings with path to Usage or tier config, current usage in tier/config flows, and always-visible limits plus optional analytics/cost views.
gui_related: true
gui_classification_reason: The unit defines user-visible acceptance criteria for Usage.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-054 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_success_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0087
preserved_exact_tokens:
- 5h/7d
- manual "usage" command
- dedicated Usage view
- warning
- Usage or tier config
- current usage
- always-visible
- analytics/cost
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-055 - Widget Composed Usage Page Scope

```yaml
plan_unit_id: UF-055
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: The Usage page is a required dedicated top-level page composed entirely of widgets from Widget_System, with no static/fixed content area and user support for move, resize, configure, add, and remove widget operations.
gui_related: true
gui_classification_reason: The unit defines visible widget-composed Usage page layout behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-055 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: widget_composed_usage_page_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0090
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0091
preserved_exact_tokens:
- Widget-Composed Page Layout
- required, dedicated top-level page
- Every content area
- widget
- no static/fixed content area
- Move
- Resize
- Configure
- Add
- Remove
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md'
- 'ContractRef: ContractName:Plans/Widget_System.md#3, ContractName:Plans/Widget_System.md#4'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-056 - Default Usage Layout Non Empty Seed

```yaml
plan_unit_id: UF-056
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: The widget-composed Usage page ships with a default 4-column layout, starts non-empty, and allows customization after first load; the detailed table continues in usage-feature-S0093.
gui_related: true
gui_classification_reason: The unit defines visible default Usage layout seed behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-056 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: default_usage_layout_non_empty_seed
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0092
preserved_exact_tokens:
- Default Widget Layout (4-column grid)
- ships with this default layout
- No page starts empty
- customize after first load
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-057 - Search Acceleration Analytics Signal

```yaml
plan_unit_id: UF-057
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage analytics consumes `tool.invoked.index_used`: `true` means sparse-n-gram candidate narrowing; `false` means raw ripgrep fallback or another unindexed path.'
gui_related: false
gui_classification_reason: 'The unit defines analytics event semantics rather than GUI layout or visual presentation.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-010
unblocks: []
acceptance_criteria:
- UF-057 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: search_acceleration_usage_signal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0093
preserved_exact_tokens:
- 'Analytics signal contract'
- 'tool.invoked.index_used'
- 'true'
- 'false'
- 'sparse-n-gram candidate narrowing'
- 'raw ripgrep fallback'
- 'another unindexed path'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Tools.md'
- 'Plans/storage-plan.md'
split_recommendation_reason: 'The source span mixes backend analytics signal semantics with the visible default widget table.'
```

### UF-058 - Default Usage Widget Layout Table

```yaml
plan_unit_id: UF-058
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'The non-empty default Usage layout preserves the source Col/Row/Size table for `widget.quota_summary`, `widget.alert_thresholds`, `widget.analytics_chart`, `widget.budget_donuts`, `widget.tool_usage`, `widget.multi_account`, and `widget.ledger_table`.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Usage widget layout and default placement.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-056
unblocks: []
acceptance_criteria:
- UF-058 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: default_usage_widget_layout_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0093
preserved_exact_tokens:
- 'Default Widget Layout (4-column grid)'
- 'No page starts empty'
- 'Col'
- 'Row'
- 'Widget ID'
- 'Size'
- 'What It Shows'
- 'widget.quota_summary'
- 'widget.alert_thresholds'
- 'widget.analytics_chart'
- 'widget.budget_donuts'
- 'widget.tool_usage'
- 'grep/Search `index_used` fallback mix'
- 'widget.multi_account'
- 'widget.ledger_table'
- '2x1'
- '2x2'
- '4x3'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Widget_System.md'
- 'Plans/FinalGUISpec.md'
split_recommendation_reason: 'The source span mixes backend analytics signal semantics with the visible default widget table.'
```

### UF-059 - Usage Widget Responsive Grid Resizing

```yaml
plan_unit_id: UF-059
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage widgets use the Widget_System grid system with responsive 2, 3, and 4 column counts, independent min/max grid constraints, and resize-dependent data density such as more chart granularity or more ledger rows.'
gui_related: true
gui_classification_reason: 'The unit defines visible widget grid resizing and responsive layout behavior.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-055
unblocks: []
acceptance_criteria:
- UF-059 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_widget_responsive_grid_resizing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0094
preserved_exact_tokens:
- 'Grid-Based Resizing'
- '2 columns (<1200px)'
- '3 columns (1200-1600px)'
- '4 columns (>1600px)'
- 'min/max grid constraints'
- 'widget.analytics_chart'
- 'widget.ledger_table'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md#3, ContractName:Plans/FinalGUISpec.md#12.3'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Widget_System.md'
- 'Plans/FinalGUISpec.md'
```

### UF-060 - Usage Widget Configuration And Persistence

```yaml
plan_unit_id: UF-060
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Each Usage widget has a gear icon for per-widget configuration of windows, filters, chart type, sort, columns, page size, and cooldown timers, and that configuration persists alongside the widget layout.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible per-widget configuration controls and persistence behavior.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-055
unblocks: []
acceptance_criteria:
- UF-060 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_widget_configuration_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0095
preserved_exact_tokens:
- 'Per-Widget Configuration'
- 'gear icon'
- 'Time window (5h/7d)'
- 'chart type (bar/line/area)'
- 'sort by (count/latency/errors/index_used fallback rate)'
- 'Visible columns'
- 'page size'
- 'show cooldown timers (on/off)'
- 'persisted alongside the widget layout'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md#5'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Widget_System.md'
- 'Plans/storage-plan.md'
```

### UF-061 - Multi Account Widget Observability Boundary

```yaml
plan_unit_id: UF-061
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: '`widget.multi_account` is a first-class catalog entry for status and observability, not the canonical setup surface; it shows provider or server-profile rows, active/effective status, Working or concrete reason text, pressure/cooldown, stale/source-confidence labels, and Agent-Config repair links.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible multi-account widget content and boundaries.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-061 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: multi_account_widget_observability_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0096
preserved_exact_tokens:
- 'Multi-Account Widget as First-Class Catalog Entry'
- 'status and observability widget'
- 'canonical setup surface'
- 'provider entry or server-profile row label'
- 'active/effective marker'
- 'Working'
- 'Operational'
- 'pressure/cooldown summary'
- 'source-confidence / stale label'
- 'Agent-Config'
- 'one GitHub Copilot auth-backed row'
- 'OpenCode server profiles'
- 'profile-mode labels'
negative_constraints:
- 'The widget does not replace Agent-Config for account management, billing/entity selection, instruction control, skills, or MCP setup.'
- 'The widget must not imply that every provider row has literal installed-local-state semantics; some rows are account-backed, some are server-profile-backed.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions:
- 'source-confidence / stale label where needed'
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Widget_System.md'
- 'Plans/Multi-Account.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/Provider_OpenCode.md'
- 'Plans/storage-plan.md'
```

### UF-062 - Dashboard Add Widget Reuse For Usage Widgets

```yaml
plan_unit_id: UF-062
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'All Usage widgets are also Dashboard-hostable through the add-widget flow: Add Widget opens a catalog overlay, selecting and adding a Usage widget places it on the Dashboard grid at its default size, and the user can then configure and resize it.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Dashboard add-widget reuse for Usage widgets.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-062 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: dashboard_add_widget_reuse_for_usage_widgets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0097
preserved_exact_tokens:
- 'Reuse on Dashboard via Add-Widget Flow'
- 'Add Widget'
- 'catalog overlay'
- 'Dashboard-compatible widgets'
- 'widget.quota_summary'
- 'default size'
- 'Configure and resize as needed'
- 'usage information alongside orchestrator status'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md#4'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Widget_System.md'
- 'Plans/FinalGUISpec.md'
```

### UF-063 - Runtime Recovery Counters And Metrics Integrity

```yaml
plan_unit_id: UF-063
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage rollups keep runtime recovery observability queryable with blocked attempts by `blocked_reason_code`, retries by `failure_class`, remediation child activity, queue-analysis passes, safe-point creates/restores, `escalation_level`, `action_available`, and blocked outcomes distinct from failures.'
gui_related: false
gui_classification_reason: 'The unit defines runtime observability and rollup metrics semantics rather than GUI implementation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-006
unblocks: []
acceptance_criteria:
- UF-063 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: runtime_recovery_usage_counters
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0100
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0101
preserved_exact_tokens:
- 'Runtime Scheduler / Recovery Observability Addendum'
- 'blocked_reason_code'
- 'failure_class'
- 'remediation children spawned and resolved'
- 'queue-analysis passes and wake reasons'
- 'safe-point creates/restores'
- 'blocked outcomes remain distinct from failures'
- 'escalation_level'
- 'action_available'
- 'usage rollups'
- 'executed-tool metrics separate'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Executor_Protocol.md'
- 'Plans/Contracts_V0.md'
- 'Plans/storage-plan.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/Run_Graph_View.md'
```

### UF-064 - Cross Surface Cost Routing And View Ban

```yaml
plan_unit_id: UF-064
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator receipts do not create feature-local cost views; `usage_event_ref` or equivalent canonical usage identity routes `Show in Ledger` and `Show in Usage` to canonical Usage surfaces, with feature-local summaries only secondary.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible routing from receipts into canonical Usage/Ledger surfaces.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-025
- UF-033
unblocks: []
acceptance_criteria:
- UF-064 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: cross_surface_cost_usage_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0102
preserved_exact_tokens:
- 'Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator'
- 'must not create feature-local cost views'
- 'usage_event_ref'
- 'Show in Ledger'
- 'Show in Usage'
- 'canonical Usage surfaces'
- 'canonical usage records'
- 'feature-local summary is secondary presentation only'
negative_constraints:
- 'Cross-surface receipts from Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator must not create feature-local cost views.'
- 'Any feature-local summary is secondary presentation only and must not replace the canonical Usage/Ledger pipeline.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/storage-plan.md'
- 'Plans/GitHub_Integration.md'
split_recommendation_reason: 'The source span mixes cost routing, undo disclosure, bulk receipt shape, high-cost warnings, and owner-precedence compatibility constraints.'
```

### UF-065 - Reversibility Undo And High Cost Disclosure

```yaml
plan_unit_id: UF-065
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Cost-bearing actions disclose reversibility and undo/accounting before execution, including undo-window duration, `local-only` versus `remote-compensating`, invalidators, and high-cost warning semantics for repeated or long-lived remote actions when platform/provider data allows it.'
gui_related: true
gui_classification_reason: 'The unit defines user-facing receipts, confirmations, and warning disclosures.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-065 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: cost_action_accounting_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0102
preserved_exact_tokens:
- 'Reversibility and undo disclosure'
- '/accounting'
- 'immediately undoable'
- 'reversible with a compensating action'
- 'non-reversible but confirmable'
- 'destructive and `non-undoable`'
- 'non-reversible'
- 'undo-window duration'
- 'local-only'
- 'remote-compensating'
- 'background refresh'
- '/poll'
- 'high-cost'
- 'rerun-many-workflows'
- 'bulk log retrieval'
- 'repeated registry refreshes'
- 'many `/Kubernetes` refreshes'
- 'user-requested long-lived observation'
negative_constraints:
- 'Non-reversible and non-undoable actions must disclose that before execution rather than only in `/history`.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/GitHub_Integration.md'
- 'Plans/Containers_Registry_and_Unraid.md'
- 'Plans/Orchestrator_Page.md'
split_recommendation_reason: 'The source span mixes cost routing, undo disclosure, bulk receipt shape, high-cost warnings, and owner-precedence compatibility constraints.'
```

### UF-066 - Bulk Receipt Shape And Owner Precedence

```yaml
plan_unit_id: UF-066
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Bulk-operation receipts preserve parent aggregate `/failed/blocked/skipped` counts and child `per-target` result, `usage_event_ref`, rollback or `/undo` expectation, and blocked reason; owner precedence keeps `usage-feature.md` on cost_usage routing while legacy `allowed_actions[]` remains compatibility-only and ordered `allowed_action_ids[]` stays live.'
gui_related: false
gui_classification_reason: 'The unit defines receipt data shape and cross-doc owner precedence rather than visual presentation.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-066 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: bulk_receipt_shape_owner_precedence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0102
preserved_exact_tokens:
- 'Bulk-operation receipts'
- 'parent/child shape'
- '/failed/blocked/skipped'
- 'per-target'
- 'usage_event_ref'
- 'rollback'
- '/undo'
- 'Orchestrator and history must not flatten'
- 'Small-sweep owner precedence'
- 'cost_usage routing'
- 'deprecated-alias doctor IDs'
- '/precedence'
- '/Docker/Orchestrator'
- 'deprecated-alias'
- 'allowed_actions[]'
- 'compatibility-only'
- 'allowed_action_ids[]'
- 'without accidental global find/replace'
negative_constraints:
- 'Bulk-operation receipts preserve the parent/child shape for usage and history.'
- 'Orchestrator and history must not flatten a bulk action into one ambiguous line item.'
preserved_contractrefs: []
compatibility_only_notes:
- 'Legacy `allowed_actions[]` remains compatibility-only; blocked/recovery flows use ordered `allowed_action_ids[]` without accidental global find/replace.'
stale_retired_dispositions:
- 'deprecated-alias handling is preserved as owner-precedence compatibility lineage.'
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/newtools.md'
- 'Plans/Crosswalk.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/storage-plan.md'
split_recommendation_reason: 'The source span mixes cost routing, undo disclosure, bulk receipt shape, high-cost warnings, and owner-precedence compatibility constraints.'
```

### UF-067 - Requested Account And Pressure Record Boundary

```yaml
plan_unit_id: UF-067
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: '`manual_preferred_account_id` is a run-request field, not a project policy default; account pressure and switching are append-only account-switch and pressure-episode `/record` families consumed by Usage, Ledger, History, routing, and account-pressure projections.'
gui_related: false
gui_classification_reason: 'The unit defines durable routing/projection record boundaries rather than GUI presentation.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-007
unblocks: []
acceptance_criteria:
- UF-067 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: requested_account_pressure_record_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'manual_preferred_account_id'
- 'run-request field'
- 'project policy default'
- 'append-only event `/record` family'
- 'account-pressure'
- 'account-switch records'
- 'Usage, Ledger, History, and routing projections'
- 'account-switch / pressure-episode family'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Multi-Account.md'
- 'Plans/storage-plan.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-068 - Usage Contract Evidence And Consolidation Gate

```yaml
plan_unit_id: UF-068
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Gate-side Usage contract changes require verifiable `/schema` evidence before prose expands; matrix/schema drift and gate-side drift are one contract-risk pattern, and A2A duplicate attempt-continuity plus tier-boundary schema signals wait for version-governed consolidation.'
gui_related: false
gui_classification_reason: 'The unit defines governance and schema evidence constraints rather than GUI presentation.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-068 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_contract_evidence_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'Gate-side usage contract changes'
- '/schema'
- 'matrix/schema drift'
- 'gate-side drift'
- 'same contract-risk pattern'
- 'A2A duplicate attempt-continuity addenda'
- 'tier-boundary schema signal'
- 'version-governed consolidation requirement'
- 'Usage waits'
negative_constraints:
- 'Gate-side usage contract changes must land with verifiable `/schema` evidence before prose expands.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Wiring_Matrix.md'
- 'Plans/Progression_Gates.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-069 - Subject Routing And Inspector History Focus

```yaml
plan_unit_id: UF-069
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Runtime artifacts and receipts preserve canonical usage identity plus run `/thread/attempt/worktree` linkage, and `inspector_target = history` changes chronological or detail-history focus inside the already-selected object rather than the selected subject identity.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible routing and inspector/history focus behavior.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-004
- UF-033
unblocks: []
acceptance_criteria:
- UF-069 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: subject_routing_inspector_history_focus
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'Runtime artifacts and receipts'
- 'canonical usage identity'
- '/thread/attempt/worktree'
- 'Usage must not invent feature-local routing semantics'
- 'inspector_target = history'
- 'chronological'
- '/detail-history'
- 'selected object'
- 'selected subject identity'
negative_constraints:
- 'Runtime artifacts and receipts preserve canonical usage identity plus run `/thread/attempt/worktree` linkage; Usage must not invent feature-local routing semantics when a receipt or runtime artifact already carries the shared subject.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/FinalGUISpec.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-070 - Export Labels And View Export Boundary

```yaml
plan_unit_id: UF-070
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage export labels distinguish exact record payload, filtered table dump, and convenience summary; filtered ledger CSV, filtered concern `/table` CSV, and analytics chart/table export are view exports unless they carry the exact record envelope required for canonical record export.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible export labels and export surface boundaries.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-005
unblocks: []
acceptance_criteria:
- UF-070 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_export_view_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'JSON export labels'
- 'exact record payload'
- 'filtered table dump'
- 'convenience summary'
- 'record envelope'
- 'view export'
- 'filtered ledger CSV'
- 'filtered concern `/table` CSV'
- 'analytics chart/table export'
- 'canonical record export'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/storage-plan.md'
- 'Plans/Runtime_Artifacts_Panel.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-071 - Source Control Views And History Dimensions

```yaml
plan_unit_id: UF-071
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Historical-only projects are not degraded solely because of unrelated completed historical runs; Source Control usage views stay compact around current `/live` worktree rows with toggles for retained, cleanup-eligible, and archived `/removed` history, while Usage history preserves distinct chronological-first dimensions.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Source Control usage view and history presentation constraints.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-071 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: source_control_usage_history_dimensions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'Historical-only projects'
- 'no-active-run'
- 'absence of current execution'
- 'not a problem state'
- 'Source Control usage views'
- 'current `/live` worktree rows'
- '/toggles'
- 'retained'
- 'cleanup-eligible'
- 'archived `/removed` history'
- 'graph generation history'
- 'safe-point and recovery history'
- 'promotion `/revocation` audit'
- 'cleanup `/archive/remove` traceability'
- 'chronological-first'
- '/continuation'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/WorktreeGitImprovement.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/storage-plan.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-072 - Effective Resolution Display Boundary

```yaml
plan_unit_id: UF-072
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'The `effective-resolution` record carries blocked and `/degraded` reason fields plus confidence and `/source` hooks so Usage can display why resolution changed without owning provider or runtime truth.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible explanation of effective-resolution changes while preserving owner boundaries.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-072 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: effective_resolution_display_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'effective-resolution'
- 'blocked'
- '/degraded'
- 'reason fields'
- 'confidence'
- '/source'
- 'display why resolution changed'
- 'without owning provider or runtime truth'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Executor_Protocol.md'
- 'Plans/FinalGUISpec.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-073 - Provider Provenance Before Resolved Facts

```yaml
plan_unit_id: UF-073
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'OpenCode bridge limits, DAE enforcement, promoted-feature shell ownership, and runtime identity provenance remain explicit architectural edges before Usage presents those events as fully resolved provider/account facts.'
gui_related: false
gui_classification_reason: 'The unit defines architectural provenance constraints before Usage may treat provider/account facts as resolved.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-073 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: provider_provenance_before_resolved_facts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'OpenCode bridge limits'
- 'DAE enforcement'
- 'promoted-feature shell ownership'
- 'runtime identity provenance'
- 'architectural edges'
- 'fully resolved provider/account facts'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Provider_OpenCode.md'
- 'Plans/Executor_Protocol.md'
- 'Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'Plans/Contracts_V0.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```
### UF-001 - Usage Feature Source-Preserving Bridge Retired

```yaml
plan_unit_id: UF-001
unit_type: generated_artifact_residual
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'UF-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 197 because usage-feature-S0104 through S0107 are generated standardization tail material: Owner / Consumer Map, PlanUnits heading, former generated UF-001 bridge, and Migration Coverage. usage-feature-S0001 through S0103 are covered by UF-002 through UF-073 or explicit structural/reference dispositions. UF-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.'
gui_related: false
gui_classification_reason: 'The retired bridge is generated migration lineage rather than implementation-facing GUI behavior, even though the retired source lineage preserved earlier GUI-related product tokens.'
split_recommended: false
depends_on:
- UF-002
- UF-003
- UF-004
- UF-005
- UF-006
- UF-007
- UF-008
- UF-009
- UF-010
- UF-011
- UF-012
- UF-013
- UF-014
- UF-015
- UF-016
- UF-017
- UF-018
- UF-019
- UF-020
- UF-021
- UF-022
- UF-023
- UF-024
- UF-025
- UF-026
- UF-027
- UF-028
- UF-029
- UF-030
- UF-031
- UF-032
- UF-033
- UF-034
- UF-035
- UF-036
- UF-037
- UF-038
- UF-039
- UF-040
- UF-041
- UF-042
- UF-043
- UF-044
- UF-045
- UF-046
- UF-047
- UF-048
- UF-049
- UF-050
- UF-051
- UF-052
- UF-053
- UF-054
- UF-055
- UF-056
- UF-057
- UF-058
- UF-059
- UF-060
- UF-061
- UF-062
- UF-063
- UF-064
- UF-065
- UF-066
- UF-067
- UF-068
- UF-069
- UF-070
- UF-071
- UF-072
- UF-073
unblocks: []
acceptance_criteria:
- usage-feature-S0001 through S0103 remain mapped to fine-grained Usage Feature PlanUnits or structural dispositions rather than UF-001.
- usage-feature-S0104 through S0107 are generated standardization tail material or retired bridge lineage, not product implementation coverage.
- UF-001 no longer uses source_preserving_planunit mode and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: usage_feature_generated_tail_batch_197
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0104
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0105
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0106
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0107
preserved_exact_tokens:
- source_preserving_planunit
- Usage Feature -- App/GUI Plan
- usage-feature-S0104
- usage-feature-S0107
- Migration Coverage
- PlanUnits
- Owner / Consumer Map
negative_constraints:
- UF-001 must not provide product implementation coverage for usage-feature-S0001 through S0107 after Phase 2B batch 197.
- UF-001 must not override UF-002 through UF-073 or later fine-grained Usage Feature PlanUnits.
- Do not rely on one coarse source_preserving_planunit as the final implementation standard for usage-feature.md.
preserved_contractrefs:
- 'ContractRef lineage remains preserved in span_map and coverage_map; the malformed trailing apostrophe from usage-feature-S0106 is lineage only and is not promoted as an active ContractRef.'
compatibility_only_notes:
- The retired bridge is compatibility lineage for generated Owner / Consumer Map, generated PlanUnits, former UF-001 bridge, and Migration Coverage tail spans only.
stale_retired_dispositions:
- Former generated source-preserving bridge material is retired as migration lineage only.
owner_hints:
- Plans/usage-feature.md
```

## Migration Coverage

Original hash: `0aa9f55786575dbd9e7fbc5e155e14e603ca5a56959c5fbdae4f8801628b259d`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B batch 194 atomized `usage-feature-S0011` through `usage-feature-S0037` plus semantic anchor headings `usage-feature-S0003` through `usage-feature-S0010` into fine-grained PlanUnits `UF-002` through `UF-026`, while structurally dispositioning the title/preface, source-lineage/reference tables, parent headings, and migration-only material in `usage-feature-S0001`, `usage-feature-S0002`, `usage-feature-S0016`, `usage-feature-S0017`, `usage-feature-S0018`, and `usage-feature-S0035`. `UF-001` is narrowed to residual source-preserving coverage for `usage-feature-S0038` through `usage-feature-S0103` only and must not override the fine-grained units. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code. Phase 2B batch 195 atomized `usage-feature-S0038` through `usage-feature-S0092` into fine-grained PlanUnits `UF-027` through `UF-056` or mapped spans to existing fine-grained `UF-005` and `UF-007`, while structurally dispositioning parent headings, Version History, and widget-addendum heading material. `UF-001` is narrowed to residual source-preserving coverage for `usage-feature-S0093` through `usage-feature-S0103` only and must not override the fine-grained units. Batch 195 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code. Phase 2B batch 196 atomized `usage-feature-S0093` through `usage-feature-S0103` into fine-grained PlanUnits `UF-057` through `UF-073` or mapped cross-cutting clauses to existing fine-grained `UF-005`, `UF-006`, and `UF-007`, while structurally dispositioning the cross-reference list and runtime observability parent heading. `UF-001` is narrowed to generated-tail source-preserving coverage for `usage-feature-S0104` through `usage-feature-S0107` only and must not override the fine-grained units. Batch 196 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code. Phase 2B batch 197 structurally dispositioned generated Owner / Consumer Map, PlanUnits heading, and Migration Coverage tail spans `usage-feature-S0104`, `usage-feature-S0105`, and `usage-feature-S0107`, and retired generated bridge span `usage-feature-S0106` through `UF-001` as migration-lineage-only compatibility residue. `UF-001` no longer uses `source_preserving_planunit` mode and must not own product coverage. Batch 197 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into canonical usage and quota presentation requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### UF-074 - Provider Usage Source Confidence And Missing-Vs-Zero Contract

```yaml
plan_unit_id: UF-074
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Provider usage displays must carry source_confidence and distinguish missing, unavailable, unsupported, blocked, stale, estimated, provider-reported, and zero. Usage rows consume requested/effective provider, model, account, route, media, and artifact identity from Contracts/Models rather than inventing a feature-local provider schema. Media generation and coding-plan usage must disclose whether usage comes from provider status-line fields, direct provider API metadata, artifact receipts, local estimates, or unavailable source state. Antigravity public `agy` rows and Antigravity OAuth/internal `gemini-3.1-flash-image` generated-image routes keep separate usage/source-confidence rows where usage evidence differs; missing private/internal usage metadata is displayed as missing/unavailable, not zero.
gui_related: true
gui_classification_reason: Usage/quota/status rows are user-visible presentation and recovery behavior.
depends_on: [CV-292, CV-293, MA-063]
unblocks: [F3-400, F3-401, RAP-032]
acceptance_criteria:
  - Missing or unavailable provider usage is not displayed as zero.
  - Usage rows carry source confidence and route/account/model identity.
  - Media-generation artifacts can contribute usage/receipt metadata by reference.
  - Provider-specific source types are disclosed without exposing secrets.
  - Antigravity internal route usage and public `agy` catalog usage do not collapse into Gemini Direct or retired Gemini CLI usage buckets.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: usage_source_confidence_drift
reasoning_tier: high
context_scope: provider_usage_source_confidence
implementation_surfaces: [Plans/usage-feature.md, Plans/Contracts_V0.md, Plans/Multi-Account.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: provider_usage_source_confidence, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0122
  - pldg-20260624-001-provider-updates:atom-0129
  - pldg-20260624-001-provider-updates:atom-0130
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
source_atom_ids: [atom-0031, atom-0034, atom-0074, atom-0106, atom-0122, atom-0129, atom-0130, atom-0131, atom-0132, atom-0137, atom-0138, atom-0142, atom-0143]
preserved_exact_tokens: ["source_confidence", "missing-vs-zero", "rate_limits", "five_hour.used_percentage", "seven_day.used_percentage", "provider-reported", "estimated", "blocked", "unsupported", "unavailable", "zero", "agy", "gemini-3.1-flash-image"]
negative_constraints:
  - Do not display missing usage as zero.
  - Do not infer usage source confidence from provider family alone.
  - Do not expose secret material in usage diagnostics or receipts.
  - Do not collapse Antigravity public `agy`, Antigravity OAuth/internal image generation, Gemini Direct, or retired Gemini CLI lineage into one usage row.
owner_hints: [Plans/usage-feature.md, Plans/Contracts_V0.md, Plans/Runtime_Artifacts_Panel.md, Plans/FinalGUISpec.md]
```

### UF-075 - Provider Plan Gating And Quota Pressure Presentation

```yaml
plan_unit_id: UF-075
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Provider usage and quota pressure must surface provider-specific plan, subscription, region, balance, resource-package, private/internal endpoint, and entitlement gates without converting them into purchase blockers. Kimi For Coding, MiniMax, Z.AI/Zhipu, GitHub Copilot, OpenAI/Codex subscription image generation, Antigravity public `agy` rows, Antigravity OAuth/internal `gemini-3.1-flash-image`, Alibaba/Qwen, Tencent, KUAE, and Umans rows may show disabled/capability-gated/unverified states until directly proven. Z.AI `glm-5.1`/`glm-5.2` overload, `glm-5v-turbo` plan-not-included, and image-generation balance/resource gating are accepted upstream/account states.
gui_related: true
gui_classification_reason: Quota, plan, entitlement, and recovery states are user-visible usage/settings behavior.
depends_on: [UF-074, MS-114, MA-063]
unblocks: [F3-400, F3-401]
acceptance_criteria:
  - Usage view distinguishes entitlement gaps, plan-not-included, balance/resource gating, regional profile mismatch, overload, and unsupported routes.
  - Rows that cannot be tested because no additional subscription is purchased are not compile blockers.
  - Provider media and coding-plan rows inherit the same support-state vocabulary as Models/Contracts.
  - Recovery copy points to concrete setup or account facts when available.
  - Antigravity internal/private endpoint states can appear as capability-gated/unverified without being presented as user purchase blockers.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_plan_gate_ui_drift
reasoning_tier: high
context_scope: provider_plan_usage_presentation
implementation_surfaces: [Plans/usage-feature.md, Plans/FinalGUISpec.md, Plans/Multi-Account.md, Plans/Models_System.md]
node_compile_hint: {mode: provider_plan_gate_usage_presentation, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0124
  - pldg-20260624-001-provider-updates:atom-0128
  - pldg-20260624-001-provider-updates:atom-0138
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
source_atom_ids: [atom-0107, atom-0108, atom-0110, atom-0111, atom-0124, atom-0125, atom-0126, atom-0127, atom-0128, atom-0129, atom-0131, atom-0132, atom-0135, atom-0138, atom-0139, atom-0140, atom-0142, atom-0143]
preserved_exact_tokens: ["Kimi For Coding", "MiniMax", "Z.AI", "Zhipu", "GitHub Copilot", "OpenAI/Codex", "Antigravity", "agy", "gemini-3.1-flash-image", "private/internal endpoint", "Alibaba/Qwen", "Tencent", "KUAE", "Umans", "glm-5.1", "glm-5.2", "glm-5v-turbo", "plan-not-included", "balance/resource gating", "overload", "capability-gated", "unverified"]
negative_constraints:
  - Do not ask Jared to buy additional subscription plans to complete this planning lane.
  - Do not hide entitlement, region, balance, resource-package, or overload states behind generic provider failure.
  - Do not mark untested rows green from Models.dev or OpenCode config alone.
  - Do not hide Antigravity private/internal endpoint or artifact-proof caveats behind generic provider failure.
owner_hints: [Plans/usage-feature.md, Plans/FinalGUISpec.md, Plans/Models_System.md, Plans/Multi-Account.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### UF-076 - Vision Bridge Usage Attribution

```yaml
plan_unit_id: UF-076
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: When the vision bridge uses a separate provider/model/account, PM records usage/cost refs when available
  and links them to the derived vision-description artifact and VisionBridgeResult. Usage attribution must reflect
  requested/effective provider/model/account, bounded retry/fallback behavior, and policy-permitted reroutes without
  inventing bridge-specific cost fields separate from the existing usage_event_ref pattern.
gui_related: false
gui_classification_reason: Usage and cost attribution are accounting/telemetry behavior; GUI consumers render elsewhere.
depends_on:
- MS-116
- RAP-035
unblocks:
- CV-296
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_usage_attribution_gap
reasoning_tier: standard
context_scope: vision_bridge_usage
implementation_surfaces:
- Plans/usage-feature.md
- future usage events
node_compile_hint:
  mode: vision_bridge_usage_event_ref
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0076
- pldg-20260626-001-feature-name:atom-0087
- Plans/Runtime_Artifacts_Panel.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
source_atom_ids:
- atom-0076
- atom-0087
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- runtime artifact
- tool/LLM trace
- source image ref/hash
- prompt/question
- provider/model/account
- cost/usage
- cached
- newly generated
- 4. Yes
- requested/effective provider/model/account
- usage/cost refs
- bounded transient failures
- falls back
- policy permits
- disclosure permission covers the destination
- 'yes'
negative_constraints:
- Do not make the derived description invisible or unauditable.
- Do not lose source lineage between the image and the generated text description.
- Do not reuse a cached description when the source image, question, or bridge model changed without marking freshness.
- Do not silently reroute an image to a different provider/account than the user allowed.
- Do not treat provider catalog visibility as proof that a route can currently process image input.
- Do not hide usage/cost attribution when the bridge uses a separate model route.
owner_hints:
- Plans/Runtime_Artifacts_Panel.md
- Plans/Tools.md
- Plans/usage-feature.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Permissions_System.md
```

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models usage, cost, and provenance behavior into Usage ownership. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### UF-077 - Free Models Paid Costed Fallback Gates And Budget Evidence

```yaml
plan_unit_id: UF-077
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Paid-overage, metered, credit-consuming, API-billed, entitlement-bound, org-policy-bound, and other non-free entries in the PM-wide top-10 may route only after PM resolves budget ceilings/thresholds, billing entity, entitlement class, org policy, account identity, and Usage attribution before dispatch. Optional budget controls and notifications coexist with always-on Usage visibility. The default budget preset levels are exactly `50, 80, 90, 95, 100`.
gui_related: true
gui_classification_reason: Includes user-visible budget settings, threshold visibility, and receipt disclosure for paid/costed fallback.
depends_on: []
unblocks: []
acceptance_criteria:
  - Costed or paid fallback cannot dispatch until budget, billing, entitlement, org policy, account identity, and Usage attribution are resolved.
  - Default budget presets remain exactly `50, 80, 90, 95, 100`.
  - Costed skipped/attempted entries remain visible in Usage/fallback receipts.
  - Budget controls do not flatten or erase provider/account pressure or charged-attempt attribution.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Paid fallback budget gate fixtures
  - Usage attribution and budget receipt fixtures
risk_class: surprise_spend
reasoning_tier: high
context_scope: free_models_costed_fallback_usage
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: free_models_costed_fallback_usage_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0042, atom-0043, atom-0044, atom-0045, atom-0046, atom-0047, atom-0048, atom-0049, atom-0050, atom-0283, atom-0284]
preserved_exact_tokens:
  - "paid providers should be preferred"
  - "costed"
  - "50, 80, 90, 95, 100"
  - "May cost money"
  - "budget"
negative_constraints:
  - Do not allow surprise spend through automatic Free Models fallback.
  - Do not hide attempted charged or failed calls from Usage/fallback receipt evidence.
  - Do not let budget controls erase usage/cost attribution.
owner_hints:
  - Plans/usage-feature.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Contracts_V0.md
```

### UF-078 - Free Models Fallback Receipts And Immutable Request Provenance

```yaml
plan_unit_id: UF-078
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage and fallback receipts for Free Models include every actually attempted model with outcome, skipped entries with reasons, and the final selected/stopped result, collapsed by default and expandable for detail. Partial streaming failures show partial/failure state and retry/switch action instead of silently retrying or splicing a different model. In-flight requests record the exact model/provider/account/source snapshot they started with; Auto Apply and model refresh changes affect only new routing decisions and never rewrite prior attribution.
gui_related: true
gui_classification_reason: Usage receipts are user-visible and include collapsed/expanded receipt presentation behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Receipts distinguish attempted models, skipped entries, final selected/stopped result, and skipped reasons.
  - Partial streaming failures are visible and never silently spliced into a different model output.
  - In-flight request attribution is immutable across Auto Apply/model refresh updates.
  - Normal Usage receipts show friendly model/provider names; exact snapshot IDs, source hashes, upstream refs, and alias/rename/provider-move chains live in expanded details or Advanced/Support.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Fallback receipt completeness fixtures
  - In-flight provenance immutability fixtures
risk_class: usage_attribution_drift
reasoning_tier: high
context_scope: free_models_usage_receipts
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Executor_Protocol.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: free_models_usage_receipt_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0107, atom-0111, atom-0212, atom-0216, atom-0220, atom-0224, atom-0226, atom-0230, atom-0234, atom-0238, atom-0242, atom-0246, atom-0250, atom-0254, atom-0258, atom-0262, atom-0276, atom-0284, atom-0286]
preserved_exact_tokens:
  - "normal Usage receipts"
  - "friendly model/provider names"
  - "exact snapshot IDs"
  - "source hashes"
  - "upstream refs"
  - "attempted model"
  - "skipped entries"
  - "partial streaming"
negative_constraints:
  - Do not silently retry/splice a different model after partial streaming output.
  - Do not let later Auto Apply/model refresh changes rewrite in-flight request Usage/provenance attribution.
  - Do not show snapshot IDs, source hashes, or upstream refs as primary normal Usage receipt content.
  - Do not rewrite normal Usage receipt names after upstream rename/provider move.
owner_hints:
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Executor_Protocol.md
  - Plans/Models_System.md
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### UF-079 - P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE

```yaml
plan_unit_id: UF-079
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE (P1) is compiled as canonical Puppet Master intent for Context budget receipts by source family: Imported external-repo finding extrepo-20260703-0027 / P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE (P1). The preserved PM gap/delta is: Add ContextBudgetReceipt per source family: tool descriptions, MCP schemas, skill summaries/bodies, retrieved docs, terminal/tool outputs, provider-native replay metadata. The observed external-repo signal remains source-lineage evidence: Tool schemas, skills, git instructions, memory/docs, and MCP schemas are all separate token tax sources; Codex skills use progressive disclosure.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- GUI shows budget by source family
- Omitted/deferred catalog entries have reason receipts
- Compaction triggers use source-specific budgets
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- GUI shows budget by source family
- Omitted/deferred catalog entries have reason receipts
- Compaction triggers use source-specific budgets
risk_class: p1_context_cache_hardening
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/usage-feature.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/MCP_Integration.md
node_compile_hint:
  mode: p1_context_budget_receipts_by_source
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0031
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0031
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0027/P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE@line=27
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0027/P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:7
source_atom_ids:
- atom-0031
external_atom_id: extrepo-20260703-0027
source_row_id: P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE
priority: P1
finding_family: Context budget receipts by source family
source_repos:
- anomalyco/opencode
- agent0ai/agent-zero
- openai/codex
target_docs:
- Plans/usage-feature.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/MCP_Integration.md
owner_hints:
- Plans/usage-feature.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/MCP_Integration.md
preserved_exact_tokens:
- extrepo-20260703-0027
- P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE
- P1
- Context budget receipts by source family
- anomalyco/opencode
- agent0ai/agent-zero
- openai/codex
negative_constraints: []
observed_signal: Tool schemas, skills, git instructions, memory/docs, and MCP schemas are all separate token tax sources; Codex skills use progressive disclosure.
pm_current_coverage: PM has usage/context/tool/skill planning and prior skill budget recommendation.
pm_gap_or_delta: 'Add ContextBudgetReceipt per source family: tool descriptions, MCP schemas, skill summaries/bodies, retrieved docs, terminal/tool outputs, provider-native replay metadata.'
compile_disposition: create_new_planunit
```

## Usage GUI Propagation Addendum - 2026-07-09

This addendum propagates UF-085 and UF-086 into GUI-facing Usage consumers. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### UF-087 - UsageRecord GUI Projection And Alias Contract

```yaml
plan_unit_id: UF-087
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage GUI surfaces consume normalized UsageRecord and context projection records. They do not compute a chat-local, dashboard-local, widget-local, or artifact-local cost model. Every visible token, context, cost, quota, credit, cache, reasoning, provider-total, or context-estimate value carries value_state, source_class, source_confidence, source_authority, settlement_status, projection_freshness, projection_health, observed_at_utc or last_updated, and reason when degraded, estimated, unknown, disabled, not_exposed, hidden_byok, or hidden_subscription. Compatibility aliases such as usage_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_input_tokens, cost_usd, usage_source_kind, UnifiedUsageRecord, estimated_cost_microdollars, and final_cost_microdollars are import/display aliases only and must reconcile to UF-085 fields before GUI aggregation. Thread_id, tier_id, timestamp, and run_id may narrow or filter views, but UsageRecord identity and usage_event_ref remain primary for accounting and drill-through.
gui_related: true
gui_classification_reason: Usage, Ledger, chat context, dashboard widgets, runtime artifacts, settings, graph, and orchestrator all display usage/accounting state.
depends_on: [UF-085, UF-086, CBP-027, RAP-043]
unblocks: []
acceptance_criteria:
  - Usage page, Ledger, Context Detail Pane, dashboard-hosted usage widgets, Runtime Artifacts drill-through, Run Graph, Orchestrator, Multi-Account, and Models rows render disabled, not_exposed, unknown, stale, estimated, hidden_byok, and hidden_subscription as explicit states, not as zero.
  - GUI projections display cache_read, cache_write, cache_write_1h or cache_write_ttl, output_visible, reasoning/thoughts, provider_total, context_estimate, and counting_semantics when present, and hide or label unavailable buckets as not_exposed rather than unsupported zero.
  - GUI fixtures prove provider-reported zero is distinct from missing usage, null usage, disabled quota, unsupported cache, and unknown cost.
  - Retry, escalation, partial stream, aborted stream, failed attempt, and adjusted settlement fixtures preserve forensic records while rollups count each deduped usage_event_ref only once.
  - BYOK and subscription/provider-plan records preserve usage refs while suppressing misleading token-cost display according to cost_status and provider policy.
  - Antigravity CLI rows use provider_id `antigravity_cli` and route `agy`; missing or broken `/stats` renders stats unavailable, missing `/usage` renders usage unknown, missing `/quota` renders quota not exposed, missing `/credits` renders credits not exposed, disabled buckets render disabled, and G1 credits never render as tokens, cost, quota, or provider_total.
  - No UI path fabricates reset countdowns, remaining quota, price snapshots, or raw provider payload content from status/login probes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py run-gates
  - future GUI usage projection fixture suite
risk_class: usage_gui_projection_false_pass
reasoning_tier: high
context_scope: usage_gui_projection
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/UI_Command_Catalog.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: usage_gui_projection_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/usage-feature.md:5412-5605"
  - "Plans/CLI_Bridged_Providers.md:1429-1510"
  - "Plans/Runtime_Artifacts_Panel.md:262-316"
  - "Plans/runtime_artifact_cost_usage.schema.json:47-510"
  - "Plans/runtime_artifact_tool_llm_trace.schema.json:122-225"
  - "uploaded:opencode-dev/packages/llm/src/schema/events.ts:7-69"
  - "uploaded:cline-main/sdk/packages/llms/fixtures/usage.json:1-56"
  - "uploaded:pi-main/packages/ai/test/anthropic-cache-write-1h-cost.test.ts:18-86"
  - "uploaded:antigravity-cli-main/examples/statusline/README.md:8-14"
  - "https://github.com/anomalyco/opencode/issues/30649"
  - "https://github.com/anomalyco/opencode/issues/28494"
  - "https://github.com/cline/cline/issues/11037"
  - "https://github.com/earendil-works/pi/issues/4477"
  - "https://github.com/google-antigravity/antigravity-cli/issues/46"
preserved_exact_tokens:
  - UsageRecord
  - usage_event_ref
  - provider_attempt_ref
  - source_class
  - source_confidence
  - settlement_status
  - projection_freshness
  - cache_write_1h
  - output_visible
  - reasoning/thoughts
  - provider_total
  - context_estimate
  - counting_semantics
  - hidden_byok
  - hidden_subscription
  - antigravity_cli
  - agy
  - missing /stats
  - G1 credits
negative_constraints:
  - Do not let GUI surfaces aggregate from compatibility aliases before coercing to UF-085 fields.
  - Do not render unknown, not exposed, hidden, disabled, stale, estimated, failed, partial, or unsupported values as zero.
  - Do not add cache buckets to input totals or reasoning/thoughts to output totals when provider counting_semantics says the provider total is already inclusive.
  - Do not use thread_id, tier_id, timestamp, or run_id as the primary usage accounting identity when usage_event_ref is available.
  - Do not expose unredacted raw provider payloads, credentials, account identifiers, or local paths in GUI Raw views.
owner_hints:
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### UF-088 - GUI Usage Acceptance Fixture Matrix

```yaml
plan_unit_id: UF-088
unit_type: acceptance_contract
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage implementation is not GUI-complete until cross-surface fixtures prove that normalized UsageRecord values render correctly in Usage, Ledger, Context Detail Pane, Runtime Artifacts, Run Graph, Orchestrator, provider/settings rows, model rows, and Dashboard-hosted Usage widgets. The fixture suite is closed at minimum over GUI-USG-001 missing usage, GUI-USG-002 provider-reported zero, GUI-USG-003 unknown cost, GUI-USG-004 BYOK/subscription hidden cost, GUI-USG-005 disabled quota bucket, GUI-USG-006 cache zero versus unsupported, GUI-USG-007 inclusive/exclusive no-double-count, GUI-USG-008 partial/aborted stream, GUI-CBP-001 Antigravity missing commands, GUI-CBP-002 Antigravity G1 credits, GUI-ROUTE-001 object-first usage route, GUI-RAW-001 Raw/Curated redaction, and GUI-RAP-001 envelope plus per-type validation.
gui_related: true
gui_classification_reason: The fixture matrix proves user-visible Usage behavior across GUI surfaces.
depends_on: [UF-085, UF-086, UF-087, CBP-027, RAP-043]
unblocks: []
acceptance_criteria:
  - GUI-USG-001 missing usage carries source_class unknown and usage reporting state unknown or unavailable, with absent or redacted raw payload refs, and never renders zero tokens, zero cost, or no-usage success.
  - GUI-USG-002 provider-reported zero carries source_class provider_reported, settlement_status settled or adjusted, zero buckets, and raw ref/hash evidence, and is not confused with missing or null usage.
  - GUI-USG-003 unknown cost carries cost_status unknown with null cost fields and visible unknown/estimated copy, not `$0.00` or provider-authoritative copy.
  - GUI-USG-004 BYOK/subscription hidden preserves usage_event_ref and UsageRecord identity while rendering hidden_byok or hidden_subscription cost state instead of fake per-token price.
  - GUI-USG-005 disabled quota bucket renders quota_status disabled without zero remaining, exhausted, success, reset countdown, or fabricated progress.
  - GUI-USG-006 cache zero versus unsupported proves reported cache_read = 0 is distinct from cache unsupported, not_exposed, or unknown.
  - GUI-USG-007 inclusive/exclusive no-double-count proves cache and reasoning buckets are not added to provider-inclusive totals and are added only when mapper counting_semantics proves exclusivity.
  - GUI-USG-008 partial/aborted stream preserves streaming_partial or failed settlement, trace lifecycle partial or aborted, dedupe_key, and accepted partial rollup once without showing final/settled copy.
  - GUI-CBP-001 Antigravity missing commands covers missing or broken `/stats`, `/usage`, `/quota`, and `/credits` as stats unavailable, usage unknown, quota not exposed, and credits not exposed.
  - GUI-CBP-002 Antigravity G1 credits carries provider_id antigravity_cli, route agy, credits status/remaining, and UseG1Credits without populating token, cost, quota, or provider_total fields.
  - GUI-ROUTE-001 object-first usage route asserts route_target.object_kind = usage_event and object_id from usage_event_ref plus attempt/provider refs, and fails timestamp/run/thread/tier primary routing.
  - GUI-RAW-001 Raw/Curated redaction shows normalized Curated fields and Raw redacted refs, hashes, omitted counts, and permission state with no credentials, account ids, local paths, or raw provider secrets.
  - GUI-RAP-001 envelope plus per-type validation rejects envelope-only or arbitrary non-empty type_payload artifacts for cost_usage and tool_llm_trace.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py run-gates
  - future GUI Usage fixture suite
  - future runtime artifact JSON Schema negative fixture suite
risk_class: gui_usage_acceptance_false_pass
reasoning_tier: high
context_scope: usage_gui_acceptance_fixtures
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/UI_Command_Catalog.md
  - Plans/Widget_System.md
node_compile_hint:
  mode: usage_gui_acceptance_fixture_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/usage-feature.md:5425-5440"
  - "Plans/usage-feature.md:5535-5550"
  - "Plans/assistant-chat-design.md:1222-1255"
  - "Plans/Runtime_Artifacts_Panel.md:269-294"
  - "Plans/runtime_artifact_envelope.schema.json:1"
  - "Plans/runtime_artifact_cost_usage.schema.json:202-340"
  - "Plans/Contracts_V0.md:5665-5676"
  - "Plans/storage-plan.md:109"
  - "Plans/UI_Command_Catalog.md:1121"
preserved_exact_tokens:
  - GUI-USG-001
  - GUI-USG-002
  - GUI-USG-003
  - GUI-USG-004
  - GUI-USG-005
  - GUI-USG-006
  - GUI-USG-007
  - GUI-USG-008
  - GUI-CBP-001
  - GUI-CBP-002
  - GUI-ROUTE-001
  - GUI-RAW-001
  - GUI-RAP-001
  - missing usage
  - provider-reported zero
  - unknown cost
  - disabled quota
  - BYOK
  - subscription-hidden
  - cache zero vs unsupported
  - no-double-count
  - partial/aborted stream
  - G1 credits
negative_constraints:
  - Do not call GUI Usage complete from provider parser fixtures alone.
  - Do not call runtime artifact schema strictness complete from envelope-only validation.
  - Do not let any fixture pass if unknown, hidden, disabled, not exposed, or missing values render as zero.
  - Do not let Raw views expose secrets, unredacted provider payloads, account identifiers, or local paths.
owner_hints:
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

## Usage Implementation-Ready Evidence Addendum - 2026-07-09

This addendum promotes the uploaded local Usage evidence and live issue recheck into canonical Usage implementation contracts. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated governance artifacts, production build tasks, final manifests, or PNC-019 receipts.

### UF-085 - Implementation Ready Usage Accounting Contract

```yaml
plan_unit_id: UF-085
unit_type: schema_contract
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  UsageRecord is the single normalized accounting record for provider, CLI, local, estimated, and unknown usage signals. Every record carries idempotent correlation through usage_record_id, usage_event_ref, provider_attempt_ref, attempt_id, run_id, thread_id?, node_id?, tool_call_id?, parent_usage_record_id?, and dedupe_key so retries, escalations, resumed streams, and receipt/artifact drill-through cannot double-count or fork attribution. Provider identity is normalized through provider_id, provider_route_kind, provider_account_ref?, model_id, model_variant?, reasoning_tier?, and context_window_tokens?. Authority is explicit through source_class = provider_reported | provider_header | cli_reported | local_estimated | pricing_estimated | unknown, source_confidence, source_authority, raw_payload_ref, redaction_status, and provider_payload_hash. Settlement is explicit through settlement_status = observed | streaming_partial | settled | adjusted | failed | unknown plus observed_at_utc, settled_at_utc?, adjusted_at_utc?, failure_class?, and partial_reason?. Token buckets are first-class and present even when unknown: input_total, input_non_cached, cache_read, cache_write, cache_write_1h, cache_write_ttl?, output_total, output_visible, reasoning/thoughts, provider_total, and context_estimate. Provider mappers state counting_semantics for whether cache is a subset of input and whether reasoning/thoughts are a subset of output; PM never adds subset fields back onto inclusive provider totals. Costs use cost_microdollars and/or provider minor units, currency, cost_status, pricing_snapshot_id, pricing_source, pricing_effective_at, pricing_version, per-bucket costs, and unknown-cost fail-closed behavior. BYOK and subscription/provider-plan routes preserve accounting refs while suppressing misleading per-token cost display when provider policy requires it. Usage windows and quotas are normalized as rolling, fixed, billing, session, or unknown with reset/cooldown evidence; missing reset signals, disabled buckets, missing cost, and missing quota render unknown/not exposed/disabled rather than guessed countdowns or zeroes. Raw provider payloads are retained by reference with redaction before persistence, while normalized fields remain queryable.
gui_related: true
gui_classification_reason: Usage totals, quota/cost display, drill-through, and fail-closed unknown states directly affect user-visible Usage and Ledger behavior.
depends_on: [UF-023, UF-035, UF-036, UF-040, UF-041, UF-074, UF-080]
unblocks: [RAP-043, CBP-027]
acceptance_criteria:
  - A canonical UsageRecord fixture validates identity/correlation fields for usage_event_ref, provider_attempt_ref, attempt_id, parent_usage_record_id, and dedupe_key.
  - Provider mapper fixtures prove source_class, source_confidence, settlement_status, raw_payload_ref, redaction_status, provider_payload_hash, and counting_semantics are present for provider-reported, header-reported, CLI-reported, local-estimated, pricing-estimated, and unknown signals.
  - Retry, escalation, resumed stream, failed attempt, and aborted/partial stream fixtures preserve forensic records while rollups count only the idempotent settled or accepted partial usage once.
  - No-double-count fixtures prove reasoning/thoughts are not added to output when the provider says output is inclusive and cache buckets are not added to input when the provider says input is inclusive.
  - Cost fixtures cover cost_microdollars, provider minor units, price snapshot id/version/date/source, custom-provider price rows, unknown-cost fail-closed policy, BYOK suppression, and subscription cost-display suppression.
  - Quota/window fixtures cover rolling, fixed, billing, session, disabled, not exposed, and unknown windows with reset/cooldown evidence and no fabricated countdowns.
  - Raw provider payload retention is tested through redacted payload refs and hashes without storing secrets in UsageRecord fields.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, production build tasks, generated governance artifacts, final manifests, or PNC-019 receipts are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 -m json.tool Plans/runtime_artifact_cost_usage.schema.json
  - python3 -m json.tool Plans/runtime_artifact_tool_llm_trace.schema.json
  - future UsageRecord provider-mapper fixture suite
risk_class: usage_accounting_false_pass
reasoning_tier: high
context_scope: usage_accounting_contract
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
node_compile_hint:
  mode: usage_accounting_schema_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "uploaded:opencode-dev/packages/llm/src/schema/events.ts:7-69"
  - "uploaded:opencode-dev/packages/llm/src/protocols/anthropic-messages.ts:566-615"
  - "uploaded:opencode-dev/packages/llm/src/protocols/openai-responses.ts:503-520"
  - "uploaded:opencode-dev/packages/llm/src/protocols/gemini.ts:338-360"
  - "uploaded:zero-main/internal/modelregistry/cost.go:38-119"
  - "uploaded:zero-main/internal/agent/context_measurement.go:9-47"
  - "uploaded:pi-main/packages/ai/src/models.ts:385-394"
  - "uploaded:pi-main/packages/ai/test/anthropic-cache-write-1h-cost.test.ts:18-86"
  - "uploaded:cline-main/sdk/packages/core/src/services/usage.ts:4-87"
  - "uploaded:cline-main/sdk/packages/core/src/services/usage.test.ts:19-64"
  - "uploaded:cline-main/sdk/packages/llms/fixtures/usage.json:1-56"
  - "https://github.com/anomalyco/opencode/issues/28494"
  - "https://github.com/anomalyco/opencode/issues/30649"
  - "https://github.com/earendil-works/pi/issues/2709"
  - "https://github.com/earendil-works/pi/issues/4477"
  - "https://github.com/cline/cline/issues/11037"
  - "https://github.com/cline/cline/issues/4346"
preserved_exact_tokens:
  - UsageRecord
  - usage_record_id
  - usage_event_ref
  - provider_attempt_ref
  - provider_reported
  - provider_header
  - cli_reported
  - local_estimated
  - pricing_estimated
  - unknown
  - observed
  - streaming_partial
  - settled
  - adjusted
  - failed
  - input_total
  - input_non_cached
  - cache_read
  - cache_write
  - cache_write_1h
  - output_total
  - output_visible
  - reasoning/thoughts
  - provider_total
  - context_estimate
  - counting_semantics
  - cost_microdollars
  - cost_minor_units
  - pricing_snapshot_id
  - BYOK
  - subscription
  - rolling
  - fixed
  - billing
  - session
negative_constraints:
  - Do not let Ledger, rollups, Runtime Artifacts, or UI projections parse ad hoc JSON instead of the canonical UsageRecord contract.
  - Do not add cache_read/cache_write/cache_write_1h to input_total when the provider says input_total is already inclusive.
  - Do not add reasoning/thoughts to output_total when the provider says output_total is already inclusive.
  - Do not turn context_estimate into billing, cost, quota, or provider authority.
  - Do not display missing, disabled, unsupported, blocked, stale, or unknown cost/quota as zero.
  - Do not fabricate reset countdowns, remaining quota, or cost from status/login probes.
  - Do not expose raw provider payloads, credentials, account identifiers, or local machine paths in persisted UsageRecord fields.
owner_hints:
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```

### UF-086 - Provider Parser Fixture And Acceptance Contract

```yaml
plan_unit_id: UF-086
unit_type: acceptance_contract
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage implementation is not complete until provider parser fixtures prove normalized UsageRecord behavior for OpenAI Chat/Responses, Anthropic Messages, Gemini, Bedrock, OpenRouter, LiteLLM/OpenAI-compatible routes, local/llama routes, custom providers, and Antigravity CLI. Fixtures must include raw provider payload refs plus normalized fields for token buckets, inclusive/exclusive counting semantics, settlement lifecycle, cost status, quota/window evidence, BYOK/subscription cost-display policy, retry/escalation de-duplication, and partial/aborted stream preservation. Each parser fixture states whether cache is a subset of input, reasoning/thoughts are a subset of output, provider_total is authoritative or derived, and context_estimate is local-only. The fixture suite must include negative tests for missing usage, null usage, unknown cost, disabled quotas, missing reset, missing /stats, provider-reported zero, malformed negative/subset-overflow values, and custom-provider price rows.
gui_related: false
gui_classification_reason: Parser fixtures and acceptance contracts are backend validation requirements; GUI consumes the resulting projections.
depends_on: [UF-085]
unblocks: []
acceptance_criteria:
  - OpenAI fixtures cover cached tokens and reasoning tokens for Chat/Responses, with output_total already inclusive when provider payload says so.
  - Anthropic fixtures cover cache_read, cache_write, cache_write_1h or TTL-specific cache creation, message_start plus final message_delta settlement, and fallback when TTL breakdown is not exposed.
  - Gemini fixtures cover cachedContentTokenCount and thoughtsTokenCount where candidates output is visible-only and inclusive output is candidates plus thoughts only when both semantics are proven.
  - Bedrock fixtures cover cache-aware input and provider/header source authority where exposed.
  - OpenRouter fixtures cover BYOK, upstream cost details, raw provider cost payload refs, and hidden/suppressed display cost when appropriate.
  - LiteLLM/OpenAI-compatible fixtures cover missing, partial, null, provider-specific cached token fields and OpenAI-compatible cache-inclusive prompt_tokens.
  - Local/llama fixtures cover context overflow evidence, request-size/server-log disagreement, local_estimated context_estimate, and no billing authority.
  - Custom-provider fixtures cover price rows for input/output/cacheRead/cacheWrite/cacheWrite1h, context window, max tokens, reasoning/thinking compatibility flags, and cache control format.
  - Antigravity fixtures cover /usage, /quota, /credits, Models & Quota, statusline context/quota signals, G1 credits, disabled buckets, and missing /stats as unknown/not exposed.
  - JSON schema negative tests reject cost_usage or tool_llm_trace artifacts whose type_payload lacks normalized provider, usage, cost or quota, authority, refs, and flags where required.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - future provider parser fixture suite
  - future runtime artifact JSON schema positive and negative fixture suite
risk_class: usage_parser_fixture_gap
reasoning_tier: high
context_scope: usage_provider_parser_acceptance
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
node_compile_hint:
  mode: usage_provider_parser_fixture_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "uploaded:opencode-dev/packages/llm/src/schema/events.ts:7-69"
  - "uploaded:opencode-dev/packages/opencode/test/server/negative-tokens-regression.test.ts:1-84"
  - "uploaded:zero-main/internal/cli/usage.go:23-151"
  - "uploaded:zero-main/internal/modelregistry/cost.go:38-119"
  - "uploaded:pi-main/packages/coding-agent/docs/custom-provider.md:164-233"
  - "uploaded:cline-main/sdk/packages/core/src/services/usage.test.ts:19-64"
  - "uploaded:cline-main/sdk/packages/llms/fixtures/usage.json:1-56"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:122-136"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:197-200"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:222-233"
  - "uploaded:antigravity-cli-main/examples/statusline/README.md:8-14"
  - "https://github.com/google-antigravity/antigravity-cli/issues/46"
  - "https://github.com/google-antigravity/antigravity-cli/issues/74"
  - "https://github.com/google-antigravity/antigravity-cli/issues/23"
  - "https://github.com/google-antigravity/antigravity-cli/issues/397"
preserved_exact_tokens:
  - OpenAI
  - Anthropic
  - Gemini
  - Bedrock
  - OpenRouter
  - LiteLLM
  - OpenAI-compatible
  - local/llama
  - custom providers
  - Antigravity
  - no-double-count
  - missing /stats
  - G1 credits
  - disabled buckets
  - provider parser fixtures
negative_constraints:
  - Do not call Usage implementation-ready from schemas that accept arbitrary non-empty type_payload.
  - Do not accept provider parser fixtures that lack raw-payload lineage and normalized field expectations.
  - Do not treat missing usage, null usage, unknown cost, disabled quota, or broken /stats as zero.
  - Do not let provider compatibility flags silently change cache/reasoning semantics without a fixture.
owner_hints:
  - Plans/usage-feature.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Runtime_Artifacts_Panel.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime usage rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f5e4f21174c14fb661692c70`: `UnifiedUsageRecord` fields are `usage_record_id`, `project_id`, `run_id?`, `thread_id?`, `provider_id`, `model_id`, `account_id?`, `input_tokens`, `output_tokens`, `cache_read_tokens?`, `cache_write_tokens?`, `estimated_cost_microdollars`, `final_cost_microdollars?`, `currency`, `usage_source`, `created_at_utc`, and `schema_version`.
- Repairs `sfk-08907092c21fff88a8b7c871`: `UsageAnomalyGuard` computes `current_window_cost / max(median_previous_7_windows_cost, 1)` over a default 1-hour window. Default spike ratio threshold is `3.0`; confidence is `min(1.0, observed_samples / 7.0)`.
- Repairs `sfk-829f3e79121c4f7c6355204a`: refresh config key is `usage.refresh_interval_seconds` with default `300`; retention config key is `usage.retention_days` with default `90`. Enforcement occurs during usage projection compaction, not at event ingestion.

### UF-080 - P0-CACHE-USAGE-ENVELOPE

```yaml
plan_unit_id: UF-080
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P0-CACHE-USAGE-ENVELOPE (P0) is compiled as canonical Puppet Master intent for Normalize cache usage/read/write metrics: Usage records expose cached_input_tokens/cache_write/cache_read/cache_reporting_state/cache_miss_reason; UI does not show zero cache as unsupported or vice versa.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Usage records expose cached_input_tokens/cache_write/cache_read/cache_reporting_state/cache_miss_reason
- UI does not show zero cache as unsupported or vice versa.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Usage records expose cached_input_tokens/cache_write/cache_read/cache_reporting_state/cache_miss_reason
- UI does not show zero cache as unsupported or vice versa.
risk_class: p0_context_cache_hardening
reasoning_tier: high
context_scope: context_cache
implementation_surfaces:
- Plans/usage-feature.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_cache_usage_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0043
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0043
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0039/P0-CACHE-USAGE-ENVELOPE@line=39
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0039/P0-CACHE-USAGE-ENVELOPE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:3
source_atom_ids:
- atom-0043
external_atom_id: extrepo-20260703-0039
source_row_id: P0-CACHE-USAGE-ENVELOPE
priority: P0
finding_family: Normalize cache usage/read/write metrics
target_docs:
- Plans/usage-feature.md
- Plans/storage-plan.md
owner_hints:
- Plans/usage-feature.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0039
- P0-CACHE-USAGE-ENVELOPE
- P0
- Normalize cache usage/read/write metrics
negative_constraints: []
proposal_or_recommendation: Usage records expose cached_input_tokens/cache_write/cache_read/cache_reporting_state/cache_miss_reason; UI does not show zero cache as unsupported or vice versa.
compile_disposition: create_new_planunit
```

### UF-081 - P2-CACHE-OBSERVABILITY-DASHBOARD

```yaml
plan_unit_id: UF-081
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P2-CACHE-OBSERVABILITY-DASHBOARD (P2) is compiled as canonical Puppet Master intent for Add cache observability dashboard and rollups: Per-provider/model/account cache hit/miss/cost savings views expose measured vs estimated vs unsupported states.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Per-provider/model/account cache hit/miss/cost savings views expose measured vs estimated vs unsupported states.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Per-provider/model/account cache hit/miss/cost savings views expose measured vs estimated vs unsupported states.
risk_class: p2_context_cache_coverage
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p2_cache_observability_dashboard
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0055
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0055
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0051/P2-CACHE-OBSERVABILITY-DASHBOARD@line=51
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0051/P2-CACHE-OBSERVABILITY-DASHBOARD
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:15
source_atom_ids:
- atom-0055
external_atom_id: extrepo-20260703-0051
source_row_id: P2-CACHE-OBSERVABILITY-DASHBOARD
priority: P2
finding_family: Add cache observability dashboard and rollups
target_docs:
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0051
- P2-CACHE-OBSERVABILITY-DASHBOARD
- P2
- Add cache observability dashboard and rollups
negative_constraints: []
proposal_or_recommendation: Per-provider/model/account cache hit/miss/cost savings views expose measured vs estimated vs unsupported states.
compile_disposition: create_new_planunit
```

### UF-082 - P2-CACHE-PRIVACY-POLICY

```yaml
plan_unit_id: UF-082
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P2-CACHE-PRIVACY-POLICY (P2) is compiled as canonical Puppet Master intent for Expose provider cache retention/privacy boundaries: Cache retention policy and org/account boundary shown when available; no unsupported manual cache clearing is promised.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Cache retention policy and org/account boundary shown when available
- no unsupported manual cache clearing is promised.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Cache retention policy and org/account boundary shown when available
- no unsupported manual cache clearing is promised.
risk_class: p2_context_cache_coverage
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/usage-feature.md
- Plans/Models_System.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: p2_cache_privacy_policy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0058
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0058
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0054/P2-CACHE-PRIVACY-POLICY@line=54
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0054/P2-CACHE-PRIVACY-POLICY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:18
source_atom_ids:
- atom-0058
external_atom_id: extrepo-20260703-0054
source_row_id: P2-CACHE-PRIVACY-POLICY
priority: P2
finding_family: Expose provider cache retention/privacy boundaries
target_docs:
- Plans/Models_System.md
- Plans/usage-feature.md
- Plans/Permissions_System.md
owner_hints:
- Plans/Models_System.md
- Plans/usage-feature.md
- Plans/Permissions_System.md
preserved_exact_tokens:
- extrepo-20260703-0054
- P2-CACHE-PRIVACY-POLICY
- P2
- Expose provider cache retention/privacy boundaries
negative_constraints: []
proposal_or_recommendation: Cache retention policy and org/account boundary shown when available; no unsupported manual cache clearing is promised.
compile_disposition: create_new_planunit
```

### UF-083 - P1-USAGE-ANOMALY-QUOTA-GUARD

```yaml
plan_unit_id: UF-083
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P1-USAGE-ANOMALY-QUOTA-GUARD (P1) is compiled as canonical Puppet Master intent for Token/cost anomalies and quota protection: Add UsageAnomalyGuard: provider_usage_null, cached_tokens_unknown, token_spike, output_spike, tool_result_spike, cache_miss_churn, spend_rate_exceeded, repeated_no_progress_cost, and budget_source attribution. The preserved PM gap/delta is: PM needs anomaly detection separate from ordinary usage collection. The observed external-repo signal remains source-lineage evidence: OpenCode had token accounting loss with multi-step tool calls; Cline reports usage null and huge token spikes; Codex reports quota/budget anomalies; Agent Zero warns of unbounded loops/tool arguments and memory/history bloat.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Provider usage null uses estimator and marks confidence.
- Sudden token/cost jump pauses or confirms under policy.
- User sees why cost was blocked/allowed.
- Cache-miss churn on stable tasks is reported as optimization warning.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Provider usage null uses estimator and marks confidence.
- Sudden token/cost jump pauses or confirms under policy.
- User sees why cost was blocked/allowed.
- Cache-miss churn on stable tasks is reported as optimization warning.
risk_class: p1_provider_capability_and_metadata_hardening
reasoning_tier: standard
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/usage-feature.md
- Plans/Models_System.md
- Plans/Goal_Runtime_System.md
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: p1_usage_anomaly_quota_guard
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0069
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0069
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0065/P1-USAGE-ANOMALY-QUOTA-GUARD@line=65
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0065/P1-USAGE-ANOMALY-QUOTA-GUARD
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:11
source_atom_ids:
- atom-0069
external_atom_id: extrepo-20260703-0065
source_row_id: P1-USAGE-ANOMALY-QUOTA-GUARD
priority: P1
finding_family: Token/cost anomalies and quota protection
source_repos:
- OpenCode
- Cline
- Codex
- Agent Zero
target_docs:
- Plans/usage-feature.md
- Plans/Models_System.md
- Plans/Goal_Runtime_System.md
- Plans/Provider_OpenCode.md
owner_hints:
- Plans/usage-feature.md
- Plans/Models_System.md
- Plans/Goal_Runtime_System.md
- Plans/Provider_OpenCode.md
preserved_exact_tokens:
- extrepo-20260703-0065
- P1-USAGE-ANOMALY-QUOTA-GUARD
- P1
- Token/cost anomalies and quota protection
- OpenCode
- Cline
- Codex
- Agent Zero
negative_constraints: []
observed_signal: OpenCode had token accounting loss with multi-step tool calls; Cline reports usage null and huge token spikes; Codex reports quota/budget anomalies; Agent Zero warns of unbounded loops/tool arguments and memory/history bloat.
pm_current_coverage: usage-feature has UsageRecord and context breakdown surfaces; Provider_OpenCode maps usage_update into normalized usage events; Goal Runtime exposes max_tokens and usage_limited.
pm_gap_or_delta: PM needs anomaly detection separate from ordinary usage collection.
proposal_or_recommendation: 'Add UsageAnomalyGuard: provider_usage_null, cached_tokens_unknown, token_spike, output_spike, tool_result_spike, cache_miss_churn, spend_rate_exceeded, repeated_no_progress_cost, and budget_source attribution.'
compile_disposition: create_new_planunit
```

### UF-084 - P2-OTEL-EXPORT-OPTIONAL-ADAPTER

```yaml
plan_unit_id: UF-084
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P2-OTEL-EXPORT-OPTIONAL-ADAPTER (P2) is compiled as canonical Puppet Master intent for Observability export interoperability: Add OptionalObservabilityExporter: OTLP/Helicone-style adapters consume redacted seglog projections, not raw canonical logs. Export backpressure, retry, and failure never block PM execution unless policy says so. The preserved PM gap/delta is: External observability should be supported without making OTLP canonical or leaking sensitive content. The observed external-repo signal remains source-lineage evidence: Pi discussion points to OpenTelemetry event streaming; OpenCode docs support external logging/analytics integrations; Codex logs/issues show trace handling problems.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Exporter can be disabled globally/project.
- Export failure produces degraded status only.
- Redacted projection schema is documented and validated.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Exporter can be disabled globally/project.
- Export failure produces degraded status only.
- Redacted projection schema is documented and validated.
risk_class: p2_cross_system_runtime_contracts_coverage
reasoning_tier: standard
context_scope: cross_system_runtime_contracts
implementation_surfaces:
- Plans/usage-feature.md
- Plans/storage-plan.md
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: p2_otel_export_optional_adapter
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0076
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0076
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0072/P2-OTEL-EXPORT-OPTIONAL-ADAPTER@line=72
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0072/P2-OTEL-EXPORT-OPTIONAL-ADAPTER
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:18
source_atom_ids:
- atom-0076
external_atom_id: extrepo-20260703-0072
source_row_id: P2-OTEL-EXPORT-OPTIONAL-ADAPTER
priority: P2
finding_family: Observability export interoperability
source_repos:
- Pi
- OpenCode
- Codex
target_docs:
- Plans/storage-plan.md
- Plans/usage-feature.md
- Plans/Provider_OpenCode.md
owner_hints:
- Plans/storage-plan.md
- Plans/usage-feature.md
- Plans/Provider_OpenCode.md
preserved_exact_tokens:
- extrepo-20260703-0072
- P2-OTEL-EXPORT-OPTIONAL-ADAPTER
- P2
- Observability export interoperability
- Pi
- OpenCode
- Codex
negative_constraints: []
observed_signal: Pi discussion points to OpenTelemetry event streaming; OpenCode docs support external logging/analytics integrations; Codex logs/issues show trace handling problems.
pm_current_coverage: "Seglog is PM\u2019s canonical source; usage/analytics rollups exist."
pm_gap_or_delta: External observability should be supported without making OTLP canonical or leaking sensitive content.
proposal_or_recommendation: 'Add OptionalObservabilityExporter: OTLP/Helicone-style adapters consume redacted seglog projections, not raw canonical logs. Export backpressure, retry, and failure never block PM execution unless policy says so.'
compile_disposition: create_new_planunit
```
