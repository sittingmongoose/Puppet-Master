# Usage Feature -- App/GUI Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document:
- Defines the "Usage" feature as a first-class area in the app/GUI
- Describes scope, data sources, and UX goals
- References existing usage tracking and related plans
- Remains implementation-agnostic so it stays valid across tech stack changes

## Rewrite alignment (2026-02-21)

The rewrite described in `Plans/rewrite-tie-in-memo.md` reinforces this plan's intent: Usage should be implemented as **projections/rollups** over the canonical event ledger (seglog), with durable KV state in redb and fast search in Tantivy--without changing the UX requirements in this document. 5h/7d and dashboard numbers are served from **redb rollups** produced by **analytics scan jobs** that aggregate over the seglog (and any JSONL mirror); the Usage view reads these rollups rather than scanning the ledger on demand.

## Storage dependency (implementation)

Usage depends on a **complex storage solution**; the feature cannot deliver 5h/7d, dashboard, and analytics at scale without it. The canonical design is in **Plans/storage-plan.md** (validated by **Plans/storage-solution-research.md**). Implementers must have the following in place for Usage to read from rollups and optional search:

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

Until this stack exists, Usage can still provide **state-file-first** behavior (aggregate from `usage.jsonl` as in "Data Sources: State Files") for 5h/7d and Ledger; the storage plan is required for scalable dashboard numbers, consistent rollups, and optional Tantivy-backed search.

## Executive Summary

The app will expose a **Usage** section that gives users clear, persistent visibility into platform quota and consumption. Goals: show 5h/7d usage and plan type where available, surface event-level usage (ledger) and optional analytics, and warn when approaching limits so users can switch platform or pause. The feature builds on existing usage tracking and plan detection; the plan focuses on **what** the Usage area should do and **where** it fits in the GUI, not the current tech stack.

## Relationship to Existing Docs

| Doc | Relevance |
|-----|-----------|
| **AGENTS.md -- Usage Tracking & Plan Detection** | Canonical source for per-platform usage sources (Claude Admin API, Copilot metrics, Gemini quotas, Codex/Cursor error parsing), env vars, and error-message parsing. |
| **Plans/newfeatures.md §3** | Persistent rate limit and usage visibility: 5h/7d in dashboard/header, tier config usage, alerts; data layer + widget + background refresh. |
| **Plans/newfeatures.md §7** | Analytics view: aggregate usage over time and by dimension; reporting layer on top of usage/plan detection. |
| **Plans/assistant-chat-design.md §12** | Context/usage display: **context circle** (OpenCode-style) at top of chat -- hover shows tokens/usage %/cost; click opens **Usage tab for that thread** with detailed breakdown. Token or context-window usage, rate limits. |
| **orchestrator-subagent-integration.md** | Platform quota display and resource monitoring (e.g. quota usage in GUI, crew quota). |
| **Plans/newfeatures.md §19.2** | Technical mechanism for 5h/7d (session usage from stream, account-level via `claude --account` or Admin API); mid-stream usage and context % from stream-json. |
| **Plans/storage-plan.md** | Implementation checklist for seglog, redb, projectors, analytics scan; Usage reads rollups from redb produced by analytics scan jobs over seglog. |
| **Plans/storage-solution-research.md** | Validation of the storage stack (seglog + redb + Tantivy + projectors + analytics scan) and recommendations. |

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

Chat threads must expose **per-thread usage** in the same way as the OpenCode desktop app: a small **context indicator** at the top of chat, **hover tooltip** with summary, and **click** to open a **Usage tab (or panel) for that thread** with detailed breakdown. This gives users immediate visibility into how much context and cost each thread has consumed without leaving the chat.

**Reference implementation:** OpenCode desktop -- [anomalyco/opencode](https://github.com/anomalyco/opencode):

- **Context circle + tooltip:** `packages/app/src/components/session-context-usage.tsx` -- A small **ProgressCircle** (e.g. 16px) shows **context usage %** for the current session/thread. Wrapped in a **Tooltip**: on hover, the tooltip shows **total tokens**, **usage %** (of model context limit), and **cost** (USD). The circle is clickable.
- **Click → Usage tab:** Click opens the **"context" tab** in the session's review panel (or equivalent), which shows detailed usage for that thread. In OpenCode this is done by opening the review panel and switching to the `context` tab (`tabs.open("context")`, `tabs.setActive("context")`).
- **Metrics computation:** `packages/app/src/components/session/session-context-metrics.ts` -- Metrics are derived from **messages** in the thread: per assistant message, `tokens.input`, `tokens.output`, `tokens.reasoning`, `tokens.cache.read`, `tokens.cache.write`; `cost` per assistant message. **Total cost** = sum of assistant message costs. **Context usage %** = (total tokens / model context limit) × 100 when limit is known. Total tokens = input + output + reasoning + cache read + cache write (from last assistant message with tokens, or accumulated).

**Requirements for Puppet Master:**

| Element | Requirement |
|--------|-------------|
| **Context indicator** | Small circular progress (or gauge) in the **chat header** (e.g. next to platform/model dropdown) showing **context usage %** for the **current thread**. Visible at a glance. |
| **Hover tooltip** | On hover over the indicator: show **token count** (total), **usage %** (of model context limit if known), and **cost** (USD or equivalent) for that thread. Same data as in the thread Usage tab summary. |
| **Click** | Click opens a **Usage tab (or panel) for that chat thread**. Tab/panel shows: **summary** (total tokens, usage %, cost); **token breakdown** (input/output/reasoning/cache if available); **optional** per-turn table or over-time chart; **link** to the app-wide Usage view (Plans/usage-feature.md §1-§4). When cost is not available from the platform, show "--" or "N/A" and still show token counts. |
| **Data source** | Per-thread metrics come from **thread messages** (and normalized stream usage events): persist token/cost per assistant turn with the thread (§11 assistant-chat-design). When seglog/redb is in place, thread usage can be derived from event stream projections for that thread_id; until then, aggregate from thread message store or usage.jsonl filtered by thread/session id. |
| **Placement** | Indicator in chat header; thread Usage tab can be a tab in the chat side panel (e.g. "Context" or "Usage" next to the message list) or a slide-out panel, per assistant-chat-design §12. |
| **Empty state** | When the thread has **no messages yet** or **no token/cost data** (e.g. new thread, or platform did not report usage): show context indicator at **0%** (or a neutral "--"); tooltip shows "No usage yet" or "No token data for this thread." Thread Usage tab shows the same (0 tokens, $0.00, "No usage yet") and still offers link to app-wide Usage view. |
| **Accessibility** | Context indicator must be **focusable** (keyboard tab order). **aria-label** (e.g. "Context usage for this thread") so screen readers announce purpose. **Enter** or **Space** on the indicator opens the thread Usage tab (same as click). Tooltip must be available to keyboard users (e.g. focus shows tooltip, or visible label when space is limited). |
| **Interview threads** | The same behavior applies to **Interview** chat threads: context circle in the Interview chat header, hover tooltip, click opens Usage tab for that Interview thread. Data source: Interview thread messages and usage events keyed by that thread_id. |

**Thread Usage tab -- suggested contents (implementer detail):** (1) **Summary line:** Total tokens, context usage % (if model limit known), total cost (USD or "N/A"). (2) **Breakdown:** Input / output / reasoning / cache read / cache write (show only fields the platform provides). (3) **Per-turn table (optional):** Each assistant turn with tokens and cost for that turn; sort by time. (4) **Link:** "View all usage" or "Open Usage" that navigates to the app-wide Usage page. (5) **Empty state:** "No usage yet for this thread" when there are no messages or no token data.

**Data and event shape:** Per-thread aggregation requires **thread_id** (or equivalent) on usage data. **seglog:** `usage.event` payload must include **`thread_id`** (Plans/storage-plan.md §2.2) so projectors or UI can filter by thread. **usage.jsonl (interim):** If using file-based usage before seglog, each line should include a **thread_id** or **session_id** that maps 1:1 to the chat thread so the context circle and thread Usage tab can aggregate correctly. **Message-level:** When persisting with the thread (assistant-chat-design §11), each assistant message (or turn) should carry token/cost fields so the thread can compute totals without querying usage.jsonl.

**Cost when platform doesn't report:** Default is to show **"N/A"** or **"--"** for cost in the tooltip and thread Usage tab; token counts are still shown. **Optional enhancement:** When the platform does not report cost but does report token counts, the app can **estimate** cost using known model pricing (e.g. from AGENTS.md or a small internal table: $/1M input, $/1M output per model). If implemented: (1) show estimated cost with a **disclaimer** in the UI (e.g. "Est. $X.XX (approximate; pricing may change)" or a tooltip "Cost is estimated from token count and published model pricing"). (2) Use **published list prices** only; do not guess. (3) Prefer platform-reported cost when available; estimate only when the platform omits it. (4) Document the source of pricing (e.g. "Anthropic/OpenAI/Google list prices as of YYYY-MM") and consider a setting to hide estimated cost if the user prefers "N/A" only. This is optional for MVP; "N/A" is acceptable.

**Gaps and edge cases (implementer detail):** (1) **Model context limit unknown:** If the platform does not report a context limit, show **total tokens** and **cost** only; show usage % as "--" or hide the percentage in the circle (circle can show a neutral state or tokens count). (2) **Cost not available:** Show "N/A" or "--" for cost in tooltip and thread Usage tab; token counts still shown (see "Cost when platform doesn't report" above for optional estimation). (3) **Multiple models in same thread:** If the user switched model mid-thread, show **aggregate** tokens and cost for the thread; optional breakdown by model in the thread Usage tab. (4) **Streaming in progress:** Update the context circle and tooltip as new tokens/cost arrive (or show "Updating..." until turn completes). (5) **Interview vs Assistant:** Same UX; ensure Interview thread_id is distinct and usage events for Interview runs carry that thread_id.

**Cross-references:** assistant-chat-design.md §12 (Context usage display), §11 (thread persistence -- store token/cost with thread where applicable); storage-plan.md (thread usage from seglog projections, usage.event.thread_id); AGENTS.md (platform usage sources).

## Data Sources: State Files (JSON / JSONL)

**A lot of usage and tracking info comes from existing state JSON/JSONL** -- the Usage feature can lean on these before adding platform APIs.

| Source | What it provides | Usage feature use |
|--------|------------------|--------------------|
| **`.puppet-master/usage/usage.jsonl`** | Per-event log: `timestamp`, `platform`, `action`, `tier_id`, `session_id`, `tokens`, `duration_ms`, `model`, `cost` (when set). Written by orchestrator (and optionally interview) after each run. | **Primary source** for Ledger, 5h/7d aggregation (filter by time window), usage-by-platform, usage-by-tier, tokens/cost over time. No external API needed for baseline. |
| **`.puppet-master/usage/summary.json`** (STATE_FILES §5.3) | Optional summary: `by_platform` with `total_calls`, `total_tokens`, `calls_remaining_hour`/`calls_remaining_day`, `cooldown_until`. | If implemented, gives a ready-made "current usage" view for the GUI; otherwise derive same from usage.jsonl. |
| **`.puppet-master/state/active-subagents.json`** (orchestrator plan) | Which subagent ran at which tier: `tier_id`, `active_subagent`, `timestamp`. | Enriches Usage: "which subagent used what" -- e.g. show usage by subagent or "rust-engineer: 500 tokens at ST-001-001-001". Optional for v1. |
| **`.puppet-master/state/active-agents.json`** (orchestrator plan) | Real-time coordination: which agents are active, platform, files, status. | Can support "who is running now" in Usage or dashboard; less about historical totals. |

**Implication:** The Usage view can be **state-file-first**: read `usage.jsonl` (and optionally `summary.json`, active-subagents), aggregate by time window (5h, 7d) and by platform/tier, and show 5h/7d, ledger, and basic analytics without calling Claude Admin API or Copilot metrics. Platform APIs and SDKs then **augment** (e.g. official limits, plan label, reset countdown, per-request tokens) where available.

---

## Per-platform usage data (API / SDK)

Beyond state-file aggregation, each platform can augment Usage with API or SDK data. AGENTS.md currently summarizes usage sources; this section fleshes out what we can use to augment the Usage feature.

### Cursor -- API (usage/account only; not for model invocation)

- **Distinction:** The **Cursor API** is for **augmenting usage/account data only** -- usage, limits, plan, billing, etc. We **do not** use it to engage with the platform to run models. Model invocation stays **CLI + OAuth** (subscription auth only). AGENTS.md "No API available" refers to "no API for invoking models"; the Cursor API that exists is a different surface (usage/account/limits) and does not conflict with our "CLI-only for execution, OAuth for auth" policy.
- **Availability:** Cursor exposes an API we can call to get usage/limits/account info. Using it only augments the Usage view; we do not use it to send prompts or run agents.
- **Auth:** For API calls (usage/account): `CURSOR_API_KEY` for headless/CI or app auth where applicable. Model runs continue to use OAuth/subscription via the CLI.
- **What we can get:** Usage, limits, or plan info where the API exposes it. **Deterministic default:** Cursor API augmentation is **disabled** until a Spec Lock update pins the endpoint contract; local aggregation from `usage.jsonl` remains the primary source of truth for 5h/7d and ledger.
- **Usage feature:** When implemented, call the Cursor API only for usage/limits/account data (with rate limiting and fallback to local aggregation); show Cursor usage and limits in the Usage view. If the API does not expose 5h/7d, keep local aggregation from `usage.jsonl` as primary and use the API for any extra fields (e.g. plan, feature flags).

### Codex -- SDK

- **Availability:** **Codex SDK** (`@openai/codex-sdk`, TypeScript): wraps the `codex` CLI; thread-centric API (`startThread()`, `resumeThread(id)`, `thread.run()` / `thread.runStreamed()`). When we run Codex via the SDK (e.g. for programmatic or headless runs), we can get **a lot** from it.
- **What we can get:** Thread/session lifecycle events (start, completion, failure); streamed output (JSONL) often includes **usage/token** fields in completion or result events. SDK callbacks (e.g. `onTurnComplete`, `onSessionStart`) and response payloads may expose token counts, request/response usage, or cost. Exact fields to be confirmed from [Codex SDK docs](https://developers.openai.com/codex/sdk/) (e.g. `usage`, `input_tokens`, `output_tokens` in thread or run responses).
- **Usage feature:** When using Codex SDK: (1) persist per-request token/usage from SDK responses into `usage.jsonl` so we have accurate counts; (2) if the SDK or Codex backend exposes quota/limits (e.g. 5h remaining), surface that in the Usage view. CLI-only runs continue to rely on error parsing (5h message limit) and local aggregation.

### Copilot -- SDK

- **Availability:** **GitHub Copilot SDK** (`@github/copilot-sdk`, multi-language): talks to Copilot CLI (e.g. `copilot --headless --port N`); session-centric (`createSession()`, session lifecycle). We can get **a lot** from the SDK when we use it.
- **What we can get:** Session lifecycle (start, end, cancel); session-scoped MCP and config. SDK or CLI may expose **usage**, **token counts**, or **request limits** per session or per org (exact APIs to be confirmed from [Copilot SDK docs](https://github.com/github/copilot-sdk)). GitHub REST API (`/orgs/{org}/copilot/metrics`) already documented in AGENTS.md for org-level metrics and plan inference.
- **Usage feature:** When using Copilot SDK: (1) record per-session or per-request usage from SDK/CLI responses into `usage.jsonl`; (2) optionally call GitHub Copilot metrics API (with `GITHUB_TOKEN`/`GH_TOKEN`) for org-level usage and show in Usage view. Combine SDK-level detail with REST API for a full picture.

### Claude Code -- Admin API (existing)

- **Availability:** Anthropic **Admin API** (`/v1/organizations/usage_report/claude_code`); env: `ANTHROPIC_API_KEY`. Already documented in AGENTS.md.
- **What we get:** Organization-level usage and cost; `customer_type`, `subscription_type` for plan detection. Per-session usage also available from **stream-json** output when we use `--output-format stream-json` (usage events in the stream).
- **Usage feature:** Use Admin API for 5h/7d or org windows when key is set; use stream-json usage events for per-run tokens and optional mid-stream context %. No SDK required for CLI-based runs.

### Gemini -- APIs and CLI (mixed)

- **Availability:** **Cloud Quotas API** (`cloudquotas.googleapis.com`): quota limits, usage counts, reset times when `GOOGLE_CLOUD_PROJECT` and (optionally) `GOOGLE_APPLICATION_CREDENTIALS` are set. **Error parsing:** "Your quota will reset after 8h44m7s." from CLI errors. **CLI:** `gemini` CLI may expose usage or account info via a flag or subcommand -- **to be confirmed** (e.g. `gemini --account` or similar; not all platforms document this).
- **What we're not sure about:** Exact shape of Gemini's usage/limits from (1) CLI only (no SDK in our stack today), (2) Cloud Quotas API response (which metrics map to "5h" or "7d" or a single quota window). Plan detection is inferred from quota limits; no explicit "plan name" unless we derive it from limits.
- **Usage feature:** (1) Use Cloud Quotas API when credentials are set to get quota/usage and show in Usage view with a label like "Gemini quota". (2) Keep error-message parsing for reset countdown when a limit is hit. (3) Document in UI what "Gemini quota" means (e.g. "Quota window -- resets per API response or error message"). (4) If Gemini CLI adds an account/usage command, add a reader for it and document in this plan.

### Summary table (augmentation sources)

| Platform   | Primary augmentation              | Auth / env                    | Notes                                                                 |
|-----------|------------------------------------|-------------------------------|-----------------------------------------------------------------------|
| **Cursor**| API (usage/limits/account only; not for model invocation) | `CURSOR_API_KEY` / app auth  | OAuth + CLI for running models; Cursor API augmentation is disabled until Spec Lock pins an endpoint contract. |
| **Codex** | SDK (thread/session + usage)      | CLI login / `CODEX_API_KEY`   | Per-request tokens and optional quota from SDK/stream when using SDK.|
| **Copilot**| SDK (session) + REST metrics API  | `GITHUB_TOKEN` / `GH_TOKEN`  | Per-session from SDK; org-level from `/orgs/{org}/copilot/metrics`.   |
| **Claude**| Admin API + stream-json usage     | `ANTHROPIC_API_KEY`          | Org usage + plan; per-run tokens from stream.                          |
| **Gemini**| Cloud Quotas API + error parsing  | `GOOGLE_CLOUD_PROJECT`, creds| Quota/usage from API; reset time from errors; do not rely on a CLI account/usage subcommand. |

**Implementation order:** State-file aggregation first (works for all platforms). Then add augmentation per platform: Claude (Admin API + stream) and error parsing (Codex, Gemini) are already documented; next wire Cursor API, Codex SDK usage, Copilot SDK + metrics API, and Gemini Cloud Quotas (and any CLI usage when confirmed).

## Data and Backend (conceptual)

- **Data layer:** Reuse and extend existing usage/plan-detection logic. Expose a clear "current usage" contract (per platform) that the GUI can poll or subscribe to (e.g. 5h used/limit, 7d used/limit, plan label). **Primary input:** aggregate from `usage.jsonl` (and optional `summary.json`); secondary: platform APIs where configured.
- **Sources:** Prefer **state JSON/JSONL first** (usage.jsonl, summary.json, active-subagents.json); then **per-platform API/SDK** (see "Per-platform usage data (API / SDK)"): Cursor API (usage/account only -- we do not use it for model invocation; OAuth + CLI for that), Codex SDK (thread/session + usage from responses), Copilot SDK + GitHub Copilot metrics API, Claude Admin API + stream-json usage, Gemini Cloud Quotas API + error parsing. Document which platforms support live vs after-run stats. AGENTS.md "Cursor | No API available" refers to model invocation; Cursor has a separate API for usage/limits that we may use to augment the Usage view.
- **Persistence:** Current `usage.jsonl` (and any future redb) remains the source for event-level data; aggregated 5h/7d may be derived or cached from the same data or from platform APIs.

## GUI Placement Options

- **Option A -- Dedicated Usage page:** One top-level **Usage** page containing: quota/plan summary (5h/7d, plan), optional alerts, and tabs or sections for "Ledger" (event list) and optionally "Analytics."
- **Option B -- Dashboard + Ledger:** Keep Ledger as its own page; add a prominent quota/plan widget on the Dashboard (and optionally in header or tier config). Alerts on Dashboard. Analytics can be added later as a separate page or section.
- **Option C -- Header + page:** Small usage summary in header (e.g. for selected or primary platform); full detail (all platforms, ledger, analytics) on a dedicated Usage page.

The plan does not mandate A/B/C; the product can choose one and document it. Consistency with existing widgets (e.g. status badges, selectable labels, page header, refresh) is assumed.

## Gaps (Current State vs. Desired)

### Gap 1: 5h/7d not in GUI

- **Current state**
  - No 5h or 7d window is displayed anywhere in the app (Dashboard, Config, Ledger, or header).
  - **Data exists:** `usage.jsonl` has `timestamp`, `platform`, `tokens`, `tier_id`, `session_id` per event -- we can aggregate by 5h/7d from this file.
  - `platforms::UsageTracker` has `QuotaInfo`, `PlanInfo`, and error parsing (Codex 5h message limit, Gemini "quota will reset after..."); the GUI never calls these.
  - Doctor `usage_check` only counts ledger lines per platform; it does not compute 5h/7d or show limits.
- **Desired**
  - Always-visible 5h/7d (or platform-equivalent window) per platform in at least one of: Dashboard, header, or dedicated Usage page.
  - Plan label shown where available (from API or error-derived `PlanInfo`).
  - **Primary feed:** aggregate from `usage.jsonl` (filter by timestamp; sum tokens/requests per platform). **Optional:** platform APIs when env vars are set.
- **Acceptance**
  - User can see "Last 5h: X requests, Y tokens" (and, where applicable, "7d" or platform-specific label) per platform without running a CLI command.

### Gap 2: No live platform usage APIs in GUI path

- **Current state**
  - AGENTS.md documents Claude Admin API (`/v1/organizations/usage_report/claude_code`), Copilot metrics API, Gemini Cloud Quotas, Codex/Gemini error parsing.
  - No app code path calls these APIs and exposes results to the UI.
  - Quota is inferred from config (`platform_config.quota`) or from error parsing only after a run fails.
- **Desired**
  - Optional background fetch of platform/org usage APIs when the user has set the required env vars.
  - Results surfaced in Usage view and (optionally) in tier config when selecting a platform.
  - Clear "N/A" or "Set ANTHROPIC_API_KEY for live data" when APIs are not configured; local aggregation still shown.
- **Acceptance**
  - When env vars are set, Usage can show provider-reported 5h/7d (or equivalent) where the platform supports it; when not set, we still show usage from `usage.jsonl`.

### Gap 3: Ledger vs. usage_tracker split

- **Current state**
  - **Write path:** Orchestrator uses `state::UsageTracker` + `types::UsageRecord`; writes to `usage.jsonl` with fields: `action`, `duration_ms`, `tokens` (optional), `cost` (typically None), `tier_id`, `session_id`, `model`.
  - **Read path (Ledger):** Ledger view reads raw JSON and maps to `LedgerEntry` using different names: expects `operation` (we write `action`), `tokens_in`/`tokens_out` (we write `tokens` as a single number), `cost`.
  - **Unused:** `platforms::UsageTracker` has `UsageEvent`, `get_usage_summary(platform, time_range)` and `get_usage_summary_all_platforms`; the GUI does not use them.
- **Desired**
  - Single coherent schema for `usage.jsonl`: one write format (e.g. align `UsageRecord` with STATE_FILES §5.2 and Ledger expectations: `operation` or `action` consistently, `tokens_in`/`tokens_out` or a single `tokens` with documented meaning).
  - One code path for "current usage" that the GUI uses: either (a) aggregate from `usage.jsonl` in a shared module, or (b) use `platforms::UsageTracker::get_usage_summary` with time ranges, with events written in a format that tracker can read (or bridge from `UsageRecord` to `UsageEvent` on read).
- **Acceptance**
  - Ledger displays all fields we write; 5h/7d aggregation and Ledger both consume the same file/schema without ad-hoc field remapping.

### Gap 4: Quota/plan only from errors

- **Current state**
  - `QuotaInfo` and `PlanInfo` are derived only from parsing Codex/Gemini (and similar) error messages (e.g. "5-hour message limit", "quota will reset after 8h44m7s").
  - No proactive 5h/7d or plan display until a limit is hit and an error is returned.
- **Desired**
  - Proactive 5h/7d (and plan where available) from platform APIs when configured.
  - Error parsing retained as fallback for reset time and plan hints when API is unavailable or after a rate-limit error.
- **Acceptance**
  - User can see usage and reset countdown before hitting a limit; after a limit, we still show "Resets in X" from error parsing when available.

### Gap 5: Alert threshold not configurable

- **Current state**
  - "Approaching limit" (e.g. 80%) is mentioned in the plan only; there is no setting or UI for warning threshold.
  - No way to dismiss or quiet a warning for a period.
- **Desired**
  - Configurable warning threshold (e.g. 70%, 80%, 90%) in Settings or Usage/Config.
  - Optional dismiss or "quiet for N hours" so the same warning does not repeat until after cooldown.
- **Acceptance**
  - User can set "Warn when usage above X%" and optionally suppress repeat warnings for a chosen period.

### Gap 6: Analytics not implemented

- **Current state**
  - No analytics view. Metrics view shows run-level/platform execution stats (e.g. subtask metrics), not usage-by-date, usage-by-project, or cost-by-model.
  - No export of usage or analytics (Ledger has "Export Ledger" but no date-range or analytics export).
- **Desired**
  - Analytics section or page: aggregate usage by date range, platform, project (if multi-project later), and model; optional cost when available; export current view as CSV/JSON.
- **Acceptance**
  - User can see "Usage last 7d / 30d by platform" and "By model" (and optionally cost), and export the visible data.

### Gap 7: Interview vs. orchestrator usage policy

- **Current state**
  - Orchestrator records usage to project-level `.puppet-master/usage/usage.jsonl` via `state::UsageTracker`.
  - Interview runs may or may not write to the same file or in the same format; no single documented policy.
- **Desired**
  - Clear policy: all runs (orchestrator and interview) write usage in the same format to the same project-level `usage.jsonl` (or a documented alternative with a single aggregation path).
  - Usage view is global for the project (or workspace): one place for all platform usage regardless of flow.
- **Acceptance**
  - Opening Usage for a project shows combined usage from both orchestrator and interview runs, with consistent fields and no duplicate or conflicting schemas.

---

## Potential Problems

### Problem 1: Platform APIs require secrets

- **Risk**
  - Claude Admin API, Copilot metrics, Gemini quotas require `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`/`GH_TOKEN`, `GOOGLE_CLOUD_PROJECT` (and possibly `GOOGLE_APPLICATION_CREDENTIALS`). Many users will not set these; 5h/7d from APIs would be missing or "N/A" for those platforms.
- **Impact**
  - Users might assume "no data" means "no usage" instead of "API not configured"; or they may not know how to enable live data.
- **Mitigation**
  - In Usage view (or tooltip), document which env vars enable live data per platform (e.g. "Set ANTHROPIC_API_KEY for Claude 5h/7d").
  - **Always** show a fallback: aggregate from `usage.jsonl` (e.g. "Last 5h: X requests, Y tokens") so we display something even when no usage API secrets are configured.
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
  - Unify on one write path and one schema for `usage.jsonl` (e.g. `UsageRecord` extended to match STATE_FILES §5.2 and Ledger; or Ledger and aggregation both use `platforms::UsageTracker` with a single event format).
  - Document the schema in STATE_FILES and in code; use the same types for write and read where possible.
  - Prefer reusing `platforms::UsageTracker::get_usage_summary(platform, time_range)` for 5h/7d from local data if we can feed it from the same file we write.

### Problem 4: 5h/7d semantics differ by platform

- **Risk**
  - Codex: 5h message limit. Claude/Copilot: org-specific windows. Gemini: quota window (e.g. reset after 8h44m). Cursor: API available for augmentation but window semantics may differ. A single "5h: X/Y" column implies identical meaning across platforms when it is not.
- **Impact**
  - User misinterprets "5h" for Gemini as the same as Codex; or we show misleading comparisons.
- **Mitigation**
  - Per-platform labels in the UI (e.g. "Codex 5h", "Claude 7d", "Gemini quota") and a short tooltip or doc link explaining what each window means.
  - Avoid one generic "5h/7d" column when semantics differ; use platform-specific columns or clearly labeled sections.

### Problem 5: Ledger file size

- **Risk**
  - `usage.jsonl` grows unbounded; very large files slow Ledger load and 5h/7d aggregation (full scan).
- **Impact**
  - Slow UI, timeouts, or high memory when opening Ledger or refreshing Usage.
- **Mitigation**
  - Retention policy: e.g. keep last 90 days; archive or delete older lines (with optional export-first).
  - Optional rotation or compaction (e.g. daily summary + trim raw events older than N days).
  - Ledger: pagination or lazy load (e.g. load last N entries first); aggregation: incremental or windowed read instead of full file scan when possible.

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

### Enhancement 3: Per-tier usage in Config

- **Benefit**
  - In tier config, "This tier used X tokens / Y requests in last 7d" helps users see which tier burns the most and adjust platform or model.
- **Notes**
  - Aggregate from `usage.jsonl` by `tier_id`; orchestrator already writes `tier_id`. Requires shared aggregation API or module used by both Usage and Config.
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
| 2026-02-21 | Data sources: added "Data Sources: State Files (JSON/JSONL)" -- usage.jsonl is primary source for Ledger and 5h/7d aggregation; summary.json (STATE_FILES §5.3) and active-subagents.json can enrich. State-file-first approach so we get most Usage info from existing JSON/JSONL without platform APIs. |
| 2026-02-21 | Fleshed out Gaps, Potential Problems, Enhancements: each gap has Current state / Desired / Acceptance; each problem has Risk / Impact / Mitigation; each enhancement has Benefit / Notes / Phase. |
| 2026-02-21 | Per-platform usage data: added section on Cursor API (augment with usage/limits; CURSOR_API_KEY); Codex SDK (thread/session + usage/tokens from SDK responses); Copilot SDK (session + metrics API); Claude Admin API + stream-json (existing); Gemini (Cloud Quotas API + error parsing; CLI account/usage subcommand not required). Summary table and implementation order. |
| 2026-02-21 | Clarified Cursor API: usage/account/limits only -- we do not use it for model invocation; model engagement stays OAuth + CLI. AGENTS.md "No API available" refers to model invocation; Cursor has a separate API for augmenting the Usage view. |
| 2026-02-22 | Added "Storage dependency (implementation)": Usage depends on seglog + redb + projectors + analytics scan; embedded implementation checklist from storage-plan.md; clarified state-file-first fallback until stack exists; cross-referenced storage-plan.md and storage-solution-research.md in Relationship to Existing Docs. |
