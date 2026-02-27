## 1. Definitions and concepts

| Term | Meaning |
|------|--------|
| **seglog** | Single append-only event log (file or segment files). Every run, message, tool use, and usage event is appended here. Canonical source of truth; replay and projections are derived from it. |
| **redb** | Embedded key-value store (Rust `redb` crate). Durable; used for settings, session/thread metadata, checkpoints, editor state, and analytics rollups. Not the source of truth for event history -- that is seglog. |
| **Tantivy** | Full-text search engine (Rust). Indices are built by projectors from seglog (e.g. chat messages, docs, log summaries). Queries serve human and agent search. |
| **Projector** | A process or pipeline that **reads** seglog (tail or full) and **writes** derived state: e.g. seglog → JSONL mirror, seglog → Tantivy index, seglog → redb checkpoints/snapshots. Projectors are **deterministic**: same seglog input ⇒ same output. |
| **Analytics scan** | A job that scans seglog (or the JSONL mirror) over a time range and computes **aggregates** (e.g. 5h/7d usage, tool latency percentiles, error rates). Results are written to redb for fast dashboard/Usage reads. |
| **Checkpoint** | A position in seglog (e.g. byte offset or event sequence number) that a projector or scan has processed up to; stored in redb so we can resume without reprocessing from the start. |
| **project_id** | A stable identifier for a project (repo root). Format: either (a) a UUID (e.g. v4) assigned when the project is first opened, or (b) a deterministic hash of the project root path (e.g. SHA256 truncated to 16 bytes, encoded as hex or base64url). Max length for redb key: e.g. 64 chars. |
| **path_hash** | A stable, short identifier for a file path within a project. Format: e.g. SHA256(path) truncated to 8 bytes and encoded as hex (16 chars), or a numeric hash encoded for key safety. Used in redb keys where full path would be long (e.g. scroll_cursor, unsaved buffers). |
| **window** | For rollup keys: literal string `5h`, `7d`, or `24h`. Analytics scan writes one key per (window, platform) for usage and one per window for tool_latency and tool_usage (e.g. `tool_usage.5h`, `tool_usage.7d`). Allowed window values are fixed for MVP. |

---

