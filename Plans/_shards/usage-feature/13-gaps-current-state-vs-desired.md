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

