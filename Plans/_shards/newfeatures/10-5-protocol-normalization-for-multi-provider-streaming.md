## 5. Protocol Normalization for Multi-Provider Streaming

### 5.1 Concept

When multiple CLI platforms are used, **normalize their output** to a single internal format (e.g. a stream of "message delta" and "usage" events). That way:

- One parser and one UI pipeline handle all platforms.
- Features like "show thinking/reasoning", "show token usage live", and "streaming progress" work the same regardless of which CLI is running.
- Adding a new platform means implementing a small "adapter" from that CLI's output to our normalized format, rather than branching the whole UI.

### 5.2 Relevance to Puppet Master

We already support six providers with different CLI flags and output shapes. Today we may parse platform-specific output in each runner. Normalization would:

- **Centralize parsing:** One stream-parser that expects a single schema; each runner converts CLI stdout into that schema (or we run a small "shim" that does it).
- **Unify usage tracking:** Usage (tokens, cost) is one event type in the normalized protocol; we fill it from platform-specific data so the rest of the app only sees "usage updated".
- **Future "thinking" display:** If we ever show extended thinking/reasoning in the GUI, it would be "thinking" events in the normalized protocol; each platform adapter maps its own "thinking" or "reasoning" chunks into that.

### 5.3 Implementation Directions

- **Define a minimal "orchestrator stream" schema:** e.g. event types: `text_delta`, `thinking_delta`, `tool_use`, `tool_result`, `usage`, `done`, `error`. Document it in `docs/` and keep it stable.
- **Per-platform adapters:** In each runner (or in a thin layer above subprocess stdout), parse CLI output (e.g. JSONL, stream-json) and emit events in the normalized schema. For platforms that don't stream or don't expose thinking, emit what we can (e.g. single `text_delta` at end, no `thinking_delta`).
- **Single consumer:** The orchestrator and any future "live log" or "streaming" UI only consume the normalized stream. No platform checks in the UI.
- **Incremental:** We can introduce the schema and adapters one platform at a time; the rest of the app keeps working with the current behavior until all platforms are migrated.

---

