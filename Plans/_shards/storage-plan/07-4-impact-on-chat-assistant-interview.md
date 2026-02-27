## 4. Impact on chat (Assistant / Interview)

Chat persistence and search are implemented on top of this storage stack; the chat UX plan (assistant-chat-design.md) does not assume a specific backend, but implementation should align as follows.

| Chat requirement | Storage implementation |
|------------------|------------------------|
| **Thread list + per-thread metadata** (§11) | **redb** `sessions`: `thread.{thread_id}`, `thread_list.{project_id}`. |
| **Full thread content** (messages, thought streams, code blocks, plan/todo, queue state) (§11) | Canonical: **seglog** (`chat.message` and related events). Projectors can materialize thread state or slices into redb for fast load; full history replayable from seglog. |
| **Chat history search -- human** (§10) | **Tantivy** chat index; UI search queries Tantivy. |
| **Chat history search -- agent** (§10) | Same Tantivy index or API over it; context pipeline or MCP/tool queries the index. |
| **Resume / rewind** (§11) | **redb** `checkpoints`: `thread_checkpoint.{thread_id}`; replay or slice from seglog as needed. |
| **Virtualization / load older** (§24) | UI fetches slices; backend pages from redb projections or seglog-derived views. |
| **Context usage / rate limits** (§12) | **redb** rollups (analytics scan) for dashboard and chat header. |
| **Per-thread usage (context circle + thread Usage tab)** (§12, usage-feature.md §5) | **seglog** `usage.event` includes **`thread_id`** so per-thread usage can be aggregated (tokens, cost). Optional: projector materializes per-thread rollup into redb (e.g. `rollups.thread_usage.{thread_id}`) for fast context circle and thread Usage tab; or UI aggregates from seglog/JSONL filtered by thread_id. |

---

