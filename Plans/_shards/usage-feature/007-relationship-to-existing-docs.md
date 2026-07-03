# Shard 007: Relationship to Existing Docs

Source: `Plans/usage-feature.md`

Source lines: L99-L116

Source SHA256: `9b49295727b1e147cc907984b4ff41890a6015f8710c760a60f5a6a0bda18db5`

---

## Relationship to Existing Docs

| Doc | Relevance |
|-----|-----------|
| **AGENTS.md -- Usage Tracking & Plan Detection** | Canonical source for per-platform usage sources (Claude Admin API, Copilot metrics, Gemini quotas, Codex/Cursor error parsing), env vars, and error-message parsing. |
| **Plans/newfeatures.md §3** | Persistent rate limit and usage visibility: 5h/7d in dashboard/header, tier config usage, alerts; data layer + widget + background refresh. |
| **Plans/newfeatures.md §7** | Analytics view: aggregate usage over time and by dimension; reporting layer on top of usage/plan detection. |
| **Plans/assistant-chat-design.md §12** | Context/usage display: **context circle** (OpenCode-style) at top of chat -- hover shows tokens/usage %/cost; thread-scoped detail opens the canonical Context Detail Pane/editor-tab surface. |
| **orchestrator-subagent-integration.md** | Platform quota display and resource monitoring (e.g. quota usage in GUI, crew quota). |
| **Plans/newfeatures.md §19.2** | Technical mechanism for 5h/7d (session usage from stream, account-level via `claude --account` or Admin API); mid-stream usage and context % from stream-json. |
| **Plans/storage-plan.md** | Implementation checklist for seglog, redb, projectors, analytics scan; Usage reads rollups from redb produced by analytics scan jobs over seglog. |
| **Plans/Progression_Gates.md + Plans/evidence.schema.json** | Validation contract for the storage stack (seglog + redb + Tantivy + projectors + analytics scan) through deterministic verifier gates and evidence requirements. |

**Current app state (for context):**
- **Ledger** page: Event-level log from `.puppet-master/usage/usage.jsonl` (platform, tokens in/out, cost per request). No 5h/7d quota view.
- **Metrics** page: Post-run execution metrics (platform/subtask stats).
- **Dashboard**: Budget/usage percent per platform (from budget config).
- **Backend**: `UsageTracker`, `QuotaManager`, `UsageRecord` persisted to `usage.jsonl`; orchestrator records usage; platform runners report token usage.
