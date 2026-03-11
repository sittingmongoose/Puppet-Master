## Potential Problems

### Problem 1: Platform APIs require secrets

- **Risk**
  - Claude Admin API and Copilot metrics require `ANTHROPIC_API_KEY` and `GITHUB_TOKEN`/`GH_TOKEN`. Many users will not set these; 5h/7d from APIs would be missing or "N/A" for those platforms.
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
  - Per-platform labels in the UI (e.g. "Codex 5h", "Claude 7d", "Gemini (estimated)") and a short tooltip or doc link explaining what each window means.
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

