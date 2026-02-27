## 12. Stream Event Visualization and "Thinking" Display

### 12.1 Concept

During a run, the UI shows **live stream events** in a compact form (e.g. a row of small indicators or "dots"): one icon per event type (e.g. read, edit, bash, tool call, thinking). This gives at-a-glance feedback that the agent is working and what kind of activity is happening. Optionally, **extended thinking/reasoning** content (if the platform streams it) is shown in a dedicated area (e.g. expandable section or secondary pane) so the user can watch reasoning in real time.

### 12.2 Relevance to Puppet Master

- **Orchestrator run view:** When a subtask is running, we could show "current activity" (e.g. read file, run test) instead of a single "Running..." spinner.
- **Trust and debugging:** Seeing "thinking" or "reasoning" chunks helps users understand why the agent is slow or what it's considering. Not all platforms expose this; where they do, we can surface it.
- **Protocol normalization:** If we adopt a normalized stream (see §5), "thinking" is just another event type; the UI renders it when present.

### 12.3 Implementation Directions

- **Dependency on §5:** Stream event visualization and thinking display apply **only when** we have a normalized stream (§5) and in-Rust stream parsing; defer until we have that pipeline. See §17.5.
- **Event types:** Align with normalized stream: e.g. `read`, `edit`, `bash`, `tool_call`, `tool_result`, `thinking`, `message`. Each has an icon and optional short label.
- **UI component:** Event strip: last **15 events** displayed. No sliding time window (event count is simpler and more predictable). Config: `ui.event_strip.max_events`, default `15`. Place it near the run status (e.g. in dashboard or run detail view). **Accessibility:** Provide alternative text or a short summary for the event strip (e.g. "Last activity: Bash, Read, Thinking") so screen reader users get the same information; see §23.11.
- **Thinking/reasoning:** If the normalized stream has `thinking_delta` or `reasoning` events, append to a buffer and display in a read-only area (e.g. collapsible "Thinking" section below the main log). Sanitize and limit length (e.g. last 4k chars) to avoid UI lag.
- **Platform support:** Document which platforms stream events and which expose thinking; for others, show "Running..." or only final result. No fake events.

---

