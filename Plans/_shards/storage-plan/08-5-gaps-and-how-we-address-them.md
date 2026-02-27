## 5. Gaps and how we address them

| Gap | Addressed how |
|-----|----------------|
| **Event type set not closed** | Define a minimal set in §2.2; document extension process (add type + payload schema, update projectors/analytics if they care). |
| **Project vs app-global storage** | Default: app-global seglog/redb with `project_id` in keys. If we need per-project seglog (e.g. one log per repo), add a layout option and document in §2.1. |
| **Ordering across segments** | Use global **seq** (single writer) or per-segment seq + segment ordering by name/date so projectors and scans see a total order. |
| **Editor state key vs project path** | FileManager.md uses `project_id` or project root path. We use a stable **project_id** (hash of path or UUID) in redb keys so renames don't break. |
| **Recovery / unsaved buffers** | Optional: store in redb (e.g. `editor/unsaved.{project_id}.{path_hash}`) or temp files; document in FileManager.md; not required for MVP. |
| **Who writes seglog** | Single **seglog writer** in the app; all components (chat, orchestrator, usage tracker) call into it. No direct file I/O from multiple writers. |
| **Tantivy schema churn** | Version the index (e.g. schema v2); on upgrade, rebuild index from seglog or keep old index until rebuilt. Document rebuild procedure. |
| **Rollup key expiry** | Rollups are overwritten per window (e.g. 5h/7d); no expiry needed. Historical rollups (e.g. per-day) can be optional; if stored, add TTL or retention in §6. |
| **Implementation order and dependencies** | §8 defines phased order: seglog → redb + schema → projectors (checkpoints namespace first) → analytics scan (rollups namespace first). No projector or scan runs before its storage dependencies exist. |
| **Projectors when seglog is empty** | When checkpoint is missing and seglog has no segments (or empty dir), projector starts from position 0 and has no events to process; checkpoint remains unset or is set to "start of first segment" once the first segment exists. No special-case code beyond "read from 0; get 0 events." |

---

