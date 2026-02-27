## Data and Backend (conceptual)

- **Data layer:** Reuse and extend existing usage/plan-detection logic. Expose a clear "current usage" contract (per platform) that the GUI can poll or subscribe to (e.g. 5h used/limit, 7d used/limit, plan label). **Primary input:** aggregate from `usage.jsonl` (and optional `summary.json`); secondary: platform APIs where configured.
- **Sources:** Prefer **state JSON/JSONL first** (usage.jsonl, summary.json, active-subagents.json); then **per-platform API/CLI** (see "Per-platform usage data (API / CLI)"): Cursor API (usage/account only -- we do not use it for model invocation; OAuth + CLI for that), Codex CLI stream + provider data, Copilot CLI + GitHub Copilot metrics API, Claude Admin API + stream-json usage, Gemini Cloud Quotas API + error parsing. Document which platforms support live vs after-run stats. AGENTS.md "Cursor | No API available" refers to model invocation; Cursor has a separate API for usage/limits that we may use to augment the Usage view.
- **Persistence:** Current `usage.jsonl` (and any future redb) remains the source for event-level data; aggregated 5h/7d may be derived or cached from the same data or from platform APIs.

