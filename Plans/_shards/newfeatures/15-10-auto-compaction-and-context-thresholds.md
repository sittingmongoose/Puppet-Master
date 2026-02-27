## 10. Auto-Compaction and Context Thresholds

### 10.1 Concept

**Context usage** is the ratio of current token count to model context window. When usage crosses thresholds (e.g. 75% or 80% warning, 80-85% auto-compact, 90% force), the system can:

- **Warn:** Show a UI notice and optionally run a "context warning" hook.
- **Auto-compact:** Before the next user message (or next iteration), run a compaction step: **intelligently summarize** older messages or turns while **preserving what matters** (key decisions, open tasks, file references, errors to fix). Then continue with a shorter context so the agent doesn't "forget" or hit hard limits.
- **Force:** Same as auto but non-optional when usage is critical.

Compaction is **configurable** (enable/disable, thresholds, preservation rules) so users can turn it off or tune it. A **lower default threshold** (e.g. 75% auto-compact) keeps the buffer well below the model limit so the user effectively never hits context limits during long runs.

### 10.2 Why Compaction Matters

Long sessions (many iterations, long interviews, or many tool turns) fill the context window. Without compaction, the agent either hits the hard limit and fails or the CLI truncates history in an opaque way. **Explicit compaction** gives control: we choose when to summarize, what to preserve (e.g. "keep last N messages verbatim, summarize the rest" or "preserve all file paths and error messages"), and we surface the action in the UI ("Compacting...") so the user knows what's happening. Compaction is a first-class feature--design the prompt template, preservation rules, and UI feedback up front.

### 10.3 Relevance to Puppet Master

- **Long PRD runs:** Many iterations can fill the context window; compaction (or "summarize progress and continue") could let a single subtask or phase span more turns without hitting limits.
- **Interview:** Long interviews with many phases might benefit from summarizing earlier phases before continuing.
- **We stay CLI-only:** Compaction would be implemented by our side: we build a "compact" prompt (e.g. "Summarize the following conversation and list key decisions; preserve file paths and open tasks") and then replace or truncate history with that summary before the next run. We don't require the CLI to support compaction natively.

### 10.4 Implementation Directions

- **Token counting:** We need at least approximate token counts per message (or per run). **Preferred:** Use platform usage data from the stream when available (e.g. `usage` events in stream-json). **Fallback:** Simple tokenizer (e.g. tiktoken-equivalent in Rust or a rough 4-chars-per-token heuristic). Document which platforms expose exact counts in-stream vs final-only. Store "current context size" in state and update after each run or stream. **Complementary to FileSafe Part B:** FileSafe's context compiler and compaction-aware re-reads handle *context compilation*; this compaction is *conversation* compaction (summarize messages). Both layers apply; see §17.3-17.4.
- **Thresholds:** Config (e.g. `compaction.warning_at`, `compaction.auto_at`, `compaction.force_at` as fractions). Consider a **lower default** for auto (e.g. 0.75) so compaction runs earlier and "never hit context limits" is achievable; allow 0.8-0.9 for users who prefer fewer compactions.
- **Compaction step:** When auto or force triggers: (1) Build a compaction prompt that asks for a summary **and** instructs preservation of important items (files, decisions, open tasks, errors); (2) Run one short CLI call (or use the same runner with a special "compact" mode); (3) Replace "old" messages in our state with the summary; (4) Proceed with the next user message or iteration. Persist the compacted state so the next run sees the shorter context.
- **Preservation rules:** Allow user or skill-defined "preserve" hints (e.g. "always keep these file paths," "keep the last N user messages verbatim"). Document the preservation contract so plugin authors can rely on it.
- **UI:** Optional "context bar" or indicator showing usage (e.g. "Context: 78%"); when above warning, show "Compaction will run before next message" or "Compaction recommended". During compaction, show "Compacting..." and optional stream timers (§15.5). Settings for enable/disable and threshold sliders.
- **Hooks:** Emit `ContextWarning` and `CompactionTrigger` so plugins can log or modify behavior.

---

