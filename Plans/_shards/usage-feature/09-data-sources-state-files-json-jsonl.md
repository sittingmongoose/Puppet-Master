## Data Sources: State Files (JSON / JSONL)

**A lot of usage and tracking info comes from existing state JSON/JSONL** -- the Usage feature can lean on these before adding platform APIs.

| Source | What it provides | Usage feature use |
|--------|------------------|--------------------|
| **`.puppet-master/usage/usage.jsonl`** | Per-event log: `timestamp`, `platform`, `action`, `tier_id`, `session_id`, `tokens`, `duration_ms`, `model`, `cost` (when set). Written by orchestrator (and optionally interview) after each run. | **Primary source** for Ledger, 5h/7d aggregation (filter by time window), usage-by-platform, usage-by-tier, tokens/cost over time. No external API needed for baseline. |
| **`.puppet-master/usage/summary.json`** (STATE_FILES §5.3) | Optional summary: `by_platform` with `total_calls`, `total_tokens`, `calls_remaining_hour`/`calls_remaining_day`, `cooldown_until`. | If implemented, gives a ready-made "current usage" view for the GUI; otherwise derive same from usage.jsonl. |
| **`.puppet-master/state/active-subagents.json`** (orchestrator plan) | Which subagent ran at which tier: `tier_id`, `active_subagent`, `timestamp`. | Enriches Usage: "which subagent used what" -- e.g. show usage by subagent or "rust-engineer: 500 tokens at ST-001-001-001". Optional for v1. |
| **`.puppet-master/state/active-agents.json`** (orchestrator plan) | Real-time coordination: which agents are active, platform, files, status. | Can support "who is running now" in Usage or dashboard; less about historical totals. |

**Implication:** The Usage view can be **state-file-first**: read `usage.jsonl` (and optionally `summary.json`, active-subagents), aggregate by time window (5h, 7d) and by platform/tier, and show 5h/7d, ledger, and basic analytics without calling Claude Admin API or Copilot metrics. Platform APIs and CLI output parsing then **augment** (e.g. official limits, plan label, reset countdown, per-request tokens) where available.

---

