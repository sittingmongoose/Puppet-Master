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

**Data and event shape:** Per-thread aggregation requires **thread_id** on usage data. **seglog:** `usage.event` payload must include **`thread_id`** (Plans/storage-plan.md §2.2) so projectors or UI can filter by thread. **usage.jsonl (interim):** If using file-based usage before seglog, each line should include either (a) **thread_id**, or (b) **session_id** that is explicitly mapped 1:1 to thread_id in persisted state. **Message-level:** When persisting with the thread (assistant-chat-design §11), each assistant message (or turn) should carry token/cost fields so the thread can compute totals without querying usage.jsonl.

**Cost when platform doesn't report:** Default is to show **"N/A"** or **"--"** for cost in the tooltip and thread Usage tab; token counts are still shown. **Optional enhancement:** When the platform does not report cost but does report token counts, the app can **estimate** cost using known model pricing (e.g. from AGENTS.md or a small internal table: $/1M input, $/1M output per model). If implemented: (1) show estimated cost with a **disclaimer** in the UI (e.g. "Est. $X.XX (approximate; pricing may change)" or a tooltip "Cost is estimated from token count and published model pricing"). (2) Use **published list prices** only; do not guess. (3) Prefer platform-reported cost when available; estimate only when the platform omits it. (4) Document the source of pricing (e.g. "Anthropic/OpenAI/Google list prices as of YYYY-MM") and consider a setting to hide estimated cost if the user prefers "N/A" only. This is optional for MVP; "N/A" is acceptable.

**Gaps and edge cases (implementer detail):** (1) **Model context limit unknown:** If the platform does not report a context limit, show **total tokens** and **cost** only; show usage % as "--" or hide the percentage in the circle (circle can show a neutral state or tokens count). (2) **Cost not available:** Show "N/A" or "--" for cost in tooltip and thread Usage tab; token counts still shown (see "Cost when platform doesn't report" above for optional estimation). (3) **Multiple models in same thread:** If the user switched model mid-thread, show **aggregate** tokens and cost for the thread; optional breakdown by model in the thread Usage tab. (4) **Streaming in progress:** Update the context circle and tooltip as new tokens/cost arrive (or show "Updating..." until turn completes). (5) **Interview vs Assistant:** Same UX; ensure Interview thread_id is distinct and usage events for Interview runs carry that thread_id.

**Cross-references:** assistant-chat-design.md §12 (Context usage display), §11 (thread persistence -- store token/cost with thread where applicable); storage-plan.md (thread usage from seglog projections, usage.event.thread_id); AGENTS.md (platform usage sources).

