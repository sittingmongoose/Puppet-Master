# Shard 026: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/FileManager.md`

Source lines: L4484-L4491

Source SHA256: `eba865c52fd3ce123ed9ec45af477b915c42c6acafd17b83da4c7e8725b0bf80`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime File Manager rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-dfd13953288650afdc87e4ad`: canonical file command IDs are `cmd.file.create`, `cmd.file.rename`, `cmd.file.move`, `cmd.file.delete`, `cmd.file.copy_path`, `cmd.file.reveal`, `cmd.file.open`, and `cmd.file.refresh`.
- Repairs `sfk-727204593d5dec2cd6e647bc`: file watcher/LRU behavior is owned by named anchor `File watcher and LRU eviction`. It uses `watch_root_ref`, `event_kind`, `path_ref`, `debounce_ms=100`, `max_cached_entries=10000`, and eviction order least-recently-viewed then lexical path.
- Repairs `sfk-5d6a5537857b5a5be3432001`: Sections 5-8 and 13-14 are not considered present from pointer-only recovery prose. Their live coverage must be explicit owner sections or explicit source-lineage references; this row is repaired by this canonical negative constraint.
- Repairs `sfk-def5ee8b66e138410b66ee36`: peer references to nonexistent `§10.10.5-8` are retired aliases. LSP-adjacent File Manager behavior routes to `Plans/LSPSupport.md` plus the named File Manager command anchors above.
