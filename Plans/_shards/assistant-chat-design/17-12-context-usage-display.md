## 12. Context usage display

### 12.1 Auto Retrieval indicator (thread override) — live state + animation

In addition to the context circle, the chat header/footer MUST expose a small **Auto Retrieval** control for the current thread:

- **Control:** A compact **chip** labeled **“Auto Retrieval”** with an On/Off state.
- **Scope:** Thread-local override only (does not mutate project Settings defaults).
- **States:**
  - **On:** chip is lit/colored.
  - **Off:** chip is muted/neutral.
  - **Searching (in-flight):** chip animates (spinner/pulse) while any retrieval query is running.
- **Source indicators (optional but recommended):** When searching, tiny glyphs for **Chat / Code / Logs** may light up as each source runs.
- **Popover:** Clicking the chip opens a small popover showing:
  - current thread override (On/Off),
  - which sources are enabled for auto retrieval (chat/code/logs),
  - last retrieval time and a “view last retrieval details” link (navigates to the latest audit entry per §13).
- **Accessibility:** chip is focusable; tooltip/aria-label communicates state (“Auto Retrieval on”, “Auto Retrieval searching”, etc.).

ContractRef: ContractName:Plans/assistant-chat-design.md#13-activity-transparency-search-bash-and-file-activity, ContractName:Plans/FinalGUISpec.md#7-16-chat-panel-new
- **Streaming:** When the platform supports it, the assistant's **response streams** (text appears as it arrives rather than all at once). The UI consumes the normalized stream (Plans/newfeatures.md §5, §19.3); fallback to batch when the platform does not stream.
- **Visible context and usage info:** The chat UI should show **context usage and related information** in a way similar to **OpenCode's desktop application** -- e.g. token or context-window usage, current model, rate limits, or other usage/limits that help the user understand how much context is in use and when limits might be hit.
- **Context circle (OpenCode-style):** At the **top of the chat** (e.g. in the chat header next to platform/model), show a **small context indicator** -- a circular progress or gauge showing **context usage %** for the current thread. **Hover:** Tooltip shows **token count**, **usage %**, and **cost** (USD or equivalent) for that thread. **Click:** Opens a **Usage tab (or panel) for that chat thread** with detailed breakdown: tokens (input/output/reasoning/cache if available), cost, usage over time or per turn, and link to the app-wide Usage view. Reference: OpenCode -- `packages/app/src/components/session-context-usage.tsx` (ProgressCircle + Tooltip, click opens "context" tab), `session-context-metrics.ts` (metrics from messages). Full spec: Plans/usage-feature.md "Per-thread usage in Chat (OpenCode-style)".
- **Empty state:** When the thread has **no usage data yet** (new thread or no token/cost reported): show the indicator at **0%** (or neutral "--"); tooltip "No usage yet." Click still opens the thread Usage tab (showing 0 tokens, $0.00, and link to app-wide Usage).
- **Keyboard and accessibility:** The context indicator is **focusable** (in tab order). **Enter** or **Space** opens the thread Usage tab (same as click). Use an **accessible-label** (e.g. "Context usage for this thread") so screen readers announce its purpose. See Plans/usage-feature.md §5.
- **Interview:** The same context circle and thread Usage tab behavior applies to **Interview** chat threads (context circle in Interview header, hover, click → Usage tab for that Interview thread).
- **Context Usage Display Placement (Resolved):** **Tab in the chat side panel** labeled **"Usage"**. Not a slide-out panel. The Usage tab sits alongside the thread list in the sidebar. Consistent with the thread list sidebar pattern — no new UI paradigm needed. Contains: token breakdown (input/output), cost estimate, context window fill percentage, and per-turn usage history.
- **Purpose:** Helps users manage long sessions, avoid truncation surprises, and understand cost/limits when running multiple threads or heavy plans. Data for this display is supplied by analytics scan rollups (seglog → counters/rollups → redb) per Plans/storage-plan.md and by **per-thread usage** derived from the thread's messages (tokens, cost per assistant turn); the same rollups feed dashboard and usage widgets (Plans/usage-feature.md, Plans/feature-list.md).
- **Rate limit hit:** When the platform returns a rate-limit or quota error (e.g. 5h window full), the thread shows a clear message and, where appropriate, the option to **switch platform or model** so the user can continue without waiting.

---

