## 7. Analytics and Usage Dashboard

### 7.1 Concept

An **analytics view** that aggregates usage over time and by dimension:

- **By project (working directory):** Sessions/runs, token count, cost (if available), last used.
- **By model/platform:** Which platform and model were used, token/cost per model.
- **By date:** Daily (or weekly) totals for tokens and cost to see trends.

Data is stored locally: rollups in **redb** (populated by analytics scan jobs over seglog/usage mirror); no telemetry. Optional export (CSV/JSON) for user's own reporting.

### 7.2 Relevance to Puppet Master

- **Usage tracking:** We already have or plan usage/plan detection; this is the reporting layer on top.
- **Evidence and runs:** We store runs and evidence; we can add a thin "analytics" layer that aggregates run metadata (project, platform, model, timestamp, token/usage if we have it) and serves the dashboard.
- **Tier config:** Helps users see which platforms they use most and how close they are to limits, reinforcing the "persistent rate limit" feature.

### 7.3 Implementation Directions

- **Storage:** Prefer reusing existing state (e.g. run logs, evidence metadata). If we need more structure, use **redb** for analytics rollups (schema + migrations per rewrite; analytics scan jobs write rollups from seglog/usage mirror). **Align with usage-feature.md:** Use the same schema as `usage.jsonl` (or a single coherent schema) so analytics and 5h/7d/ledger share one data model; see §3 and Plans/usage-feature.md. No PII; only paths and aggregate numbers.
- **"Know where your tokens go":** Frame the analytics view as **§15.12** -- emphasize breakdown by project, model, and date; optional "top N projects by tokens" or "top N models by cost" in the header. Reuse §7 data and UI.
- **Aggregation:** Under the rewrite design, aggregation is implemented as **analytics scan jobs** that read seglog (or usage mirror), compute 5h/7d and dashboard rollups, and persist them in **redb** for the Usage/dashboard views. Alternatively, on-demand scan of evidence/run logs when opening the dashboard with a small cache.
- **GUI:** New view "Analytics" or "Usage" with: time range selector (7d, 14d, 30d, all), optional project filter, cards for total runs/tokens/cost, and tables or simple charts (e.g. by project, by platform). Use existing widgets and theme.
- **Export:** Button to export current view as CSV or JSON; no server, just local file write.
- **Privacy:** All data stays on device; no external analytics or tracking.

---

