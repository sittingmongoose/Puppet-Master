## 14. Database and Persistence (Structured State)

### 14.1 Concept

Structured state that benefits from querying and indexing (sessions/runs, messages or iterations, usage/analytics, checkpoints, restore points) is part of the rewrite design: seglog as canonical ledger, redb for durable KV state/projections/settings, Tantivy for full-text search (or equivalent). File-based state (e.g. prd.json, progress.txt, AGENTS.md) remains the source of truth for "work queue" and "memory"; the projections layer provides **queryable history**, **analytics**, and **recovery metadata** and is not optional.

### 14.2 Relevance to Puppet Master

- **Evidence and runs:** We already store evidence in directories; we could add a **redb** table (or equivalent in redb schema) that indexes run id, project, platform, timestamp, outcome, and path to evidence. Then "show all runs for this project" or "usage by platform" becomes a query.
- **Restore points and snapshots:** Store restore point metadata (and optionally file diffs) in **redb** for fast "list restore points" and "rollback to N".
- **Interview:** Store phase answers and metadata in **redb** for "resume interview" and "export interview report".
- **No requirement to move prd.json/progress.txt into redb:** Those stay as they are; redb complements them for reporting and recovery.

### 14.3 Implementation Directions

- **Schema:** Start small: e.g. `runs` (id, project_path, platform, model, started_at, ended_at, outcome, evidence_path), `restore_points` (id, run_id, created_at, file_snapshots_json), `usage_snapshots` (id, platform, 5h_used, 7d_used, recorded_at). Add tables as features (analytics, interview) need them. These live in **redb**; analytics aggregates (e.g. 5h/7d, tool latency, error rates) are produced by **analytics scan jobs** over seglog and stored as rollups in redb for the dashboard.
- **Rust:** Use **redb** for durable KV; one module (e.g. `db` or `persistence`) that opens the redb database, runs **migrations** (schema version tracked), and exposes functions to insert/query. Database path: e.g. under app data dir.
- **Migrations:** Versioned schema migrations applied on startup when stored schema version is less than the app's; keep migrations additive.
- **required:** Per rewrite-tie-in-memo, structured storage (seglog + redb + Tantivy) is required as part of the architecture, not optional; queryable history, analytics, and recovery metadata must be produced from this layer.


---

