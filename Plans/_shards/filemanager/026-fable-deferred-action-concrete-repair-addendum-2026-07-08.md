# Shard 026: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/FileManager.md`

Source lines: L4613-L4630

Source SHA256: `0227a8fdd55ae734d38fb530cf21e00428a7dd4f36e95e3b04cb6bca10314d69`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime File Manager rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-dfd13953288650afdc87e4ad`: canonical file command IDs are the ones `Plans/UI_Command_Catalog.md` registers (§2.1B and the FileManager command contracts): create is `cmd.file.new_file` and `cmd.file.new_folder`; move is `cmd.file.cut_nodes` followed by `cmd.file.paste_nodes` with `mode: "move"`; and `cmd.file.rename`, `cmd.file.delete`, `cmd.file.copy_path`, `cmd.file.reveal`, `cmd.file.open`, and `cmd.file.refresh` keep their names. `cmd.file.create` and `cmd.file.move`, named here earlier, were never registered; they are retired aliases and no surface dispatches them.
- Repairs `sfk-727204593d5dec2cd6e647bc`: file watcher/LRU behavior is owned by named anchor `File watcher and LRU eviction`, the subsection below. It uses `watch_root_ref`, `event_kind`, `path_ref`, `debounce_ms=100`, `max_cached_entries=10000`, and eviction order least-recently-viewed then lexical path.
- Repairs `sfk-5d6a5537857b5a5be3432001`: Sections 5-8 and 13-14 are not considered present from pointer-only recovery prose. Their live coverage must be explicit owner sections or explicit source-lineage references; this row is repaired by this canonical negative constraint.
- Repairs `sfk-def5ee8b66e138410b66ee36`: peer references to nonexistent `§10.10.5-8` are retired aliases. LSP-adjacent File Manager behavior routes to `Plans/LSPSupport.md` plus the named File Manager command anchors above.

### File watcher and LRU eviction

This subsection is the target of §1.1.4 (tree refresh after drop) and §2.9 (Max editor tabs), which earlier pointed at a §10.7 that never existed.

**Tree watcher.** Each watched project or worktree root emits `FileWatchEvent { watch_root_ref, event_kind, path_ref, old_path_ref? }`. `watch_root_ref` (string) is the root's identity, not its path spelling; `path_ref` (string) is root-relative; `event_kind` is the closed enum `created`, `modified`, `removed`, `renamed`, and `overflow`; `old_path_ref` is present only for `renamed`. Events are debounced per root for `debounce_ms=100` and coalesced per `path_ref`, with the last event kind winning. `overflow`, or a watcher error, re-reads the whole watched root. After a drop, §1.1.4's explicit refresh of the target folder runs whenever no watcher is active for that root.

**Tree cache eviction.** The directory-listing cache holds at most `max_cached_entries=10000` entries per project. Past that, it evicts entries least-recently-viewed first, breaking ties by lexical path (ascending UTF-8 bytes). Entries of folders currently expanded and visible are not evicted. An evicted folder re-reads from disk when it is next expanded.

**Editor buffer eviction.** When open tab buffers exceed the Max editor tabs setting (§2.9; default 25), the least-recently-viewed buffer is released, with ties broken by lexical path. A dirty buffer, the active tab's buffer, and a buffer with a pending save or recovery are never released; if every candidate is excluded, the limit is exceeded until one becomes eligible, and nothing is discarded. A released buffer keeps its tab entry and persisted scroll and cursor (§2.9) and reloads from disk when activated; the LSP client sends `didClose` for it (LSPSupport §8, "Many open documents").
