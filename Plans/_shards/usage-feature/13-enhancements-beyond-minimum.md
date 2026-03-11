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

