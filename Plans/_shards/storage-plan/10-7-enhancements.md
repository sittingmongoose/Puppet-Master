## 7. Enhancements

- **Compaction:** Periodically merge seglog segments into fewer, larger files (with re-read-only pass) to reduce file count; update projectors to read compacted segments. Optional for MVP.
- **Backup/restore:** Scheduled backup of redb and seglog (e.g. to `storage/backups/`); restore UI or CLI to restore from backup.
- **Export:** Export thread or run history to JSONL/JSON for user (e.g. from seglog or JSONL mirror filtered by thread_id).
- **Read replicas:** Not applicable for embedded redb; if we move to a server-backed store later, read replicas can serve dashboard/Usage reads.
- **Per-project seglog:** Option to store seglog under `.puppet-master/` per project for isolation (e.g. enterprise or multi-tenant); default remains app-global.
- **Event schema registry:** Central registry (code or config) of event types and payload schemas; generate docs or validation from it.
- **Streaming projector:** Projector pushes updates to UI (e.g. new message indexed → invalidate search cache or notify chat view) instead of only tail polling; optional for richer UX.

---

