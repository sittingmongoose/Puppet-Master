## 7. Enhancements

- **Compaction:** Specified in §2.2.1. Optional for MVP, but when enabled it MUST preserve `seq`, exclude the active segment, and keep replay/projector correctness intact.
- **Backup/restore:** Scheduled backups MUST snapshot canonical stores at one shared boundary, validate checksums before restore, and rebuild disposable projections (JSONL/Tantivy) after restore rather than treating them as authoritative.
- **Export:** Export thread or run history to JSONL/JSON for user (e.g. from seglog or JSONL mirror filtered by thread_id).
- **Read replicas:** Not applicable for embedded redb; if we move to a server-backed store later, read replicas can serve dashboard/Usage reads.
- **Per-project seglog:** Specified in §2.1.2; default remains app-global.
- **Event schema registry:** Required infrastructure for payload validation and doc generation; this plan owns payload registry/workflow while `Plans/Contracts_V0.md` owns the top-level envelope.
- **Streaming projector:** Optional richer UX path; correctness still depends on committed projector state and durable checkpoints.

---

