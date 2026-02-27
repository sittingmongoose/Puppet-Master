## 6. Event Logging

**Contract:** FileSafe emits a structured event for every block (command blocklist, write scope, security filter). Two phases:

- **Pre-rewrite / current:** Log to `.puppet-master/logs/filesafe-events.jsonl` (append-only, one JSON object per line). Schema below.
- **Post-rewrite (`Plans/storage-plan.md` §2.5 "Analytics scan jobs"):** Emit FileSafe events into the **unified event stream (seglog)** so analytics scan jobs can aggregate (e.g. tool-block rate, error rate by guard type, latency of blocked vs allowed). Event payload **must** include: `guard_type`, `pattern_id` (or pattern name), `timestamp`, and enough structure for analytics rollups (see rewrite alignment in header). Rollups stored in redb support dashboard widgets (e.g. "FileSafe blocks this week", "top blocked patterns").

**FileSafeEvent schema (minimum):**

```rust
pub struct FileSafeEvent {
    pub event_type: String,       // "bash_guard_block" | "file_guard_block" | "security_filter_block"
    pub guard_type: String,       // "bash_guard" | "file_guard" | "security_filter" (for analytics)
    pub pattern_matched: String,  // Pattern or rule that triggered (for analytics aggregation)
    pub command_preview: String,  // First 40 chars (or path for file guards)
    pub agent: Option<String>,   // If available from ExecutionRequest
    pub timestamp: DateTime<Utc>,
    pub allowed: bool,            // True if override/approval was applied (e.g. verification gate, "Approve once")
}
```

**Logging call:** From `BaseRunner` (or platform runner when prompt is blocked): on any guard block, build `FileSafeEvent`, then either (a) append to `filesafe-events.jsonl` or (b) emit to seglog writer, depending on which storage path is active. Do not block execution path on log write (fire-and-forget or bounded queue).

---

