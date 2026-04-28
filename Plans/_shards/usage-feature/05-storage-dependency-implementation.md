## Storage dependency (implementation)

Usage depends on a **complex storage solution**; the feature cannot deliver 5h/7d, dashboard, and analytics at scale without it. The canonical design is in **Plans/storage-plan.md** (validated by deterministic verifier gates and SSOT evidence contracts). Implementers must have the following in place for Usage to read from rollups and optional search:

| Dependency | Purpose for Usage |
|------------|-------------------|
| **Seglog** (canonical event stream) | All usage-relevant events (tokens, requests, errors, platform, tier, session) are appended here; single source of truth for analytics. |
| **redb** (settings / sessions / runs / checkpoints) | Durable KV for app state; also stores **analytics rollups** (5h/7d counters, tool latency distributions, error rates) that the Usage view and dashboard query. |
| **Projector pipeline** | seglog → JSONL mirror (human-readable), seglog → Tantivy indices (chat/docs/log summaries if Usage includes search), projector checkpoints in redb. |
| **Analytics scan jobs** | Scan seglog (or JSONL mirror) for counters; compute tool latency distributions, error rates, usage-by-window; persist rollups in redb for fast dashboard/Usage queries. |

**Implementation checklist** (from Plans/storage-plan.md; complete before Usage can rely on redb rollups):

- [ ] Implement seglog writer for canonical event stream.
- [ ] Implement redb schema + migrations for settings/sessions/runs/checkpoints.
- [ ] Implement projector pipeline:
  - seglog → JSONL mirror (human-readable)
  - seglog → Tantivy indices (chat/docs/log summaries)
  - persist projector checkpoints in redb
- [ ] Implement "analytics scan" jobs:
  - scan seglog for counters (tool latency distributions, error rates)
  - store rollups in redb for fast dashboard queries

Until this stack exists, any temporary compatibility path MUST still preserve the canonical pipeline: 5h/7d and dashboard windows are owned by rollups, not by ad hoc `usage.jsonl` scans. `usage.jsonl` may still appear as a human-readable mirror or Ledger compatibility input during migration, but it is not the canonical rollup source.

