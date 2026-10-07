# C3 evidence — SQLite "Atomic Commit In SQLite", independent re-read

Provenance: https://www.sqlite.org/atomiccommit.html (versionless rolling doc).
Retrieved: 2026-10-07T18:38:47Z (HTTP 200, 77968 bytes; matches predecessor S4 byte count).
Range: S3 (single-file commit), S4 (hot journals/rollback), S5 (multi-file), S9 (failure modes).

Independent observations:
- Single-file atomic commit confirmed: journal-before-mutation protocol; commit is all-or-nothing FOR THE
  .db FILE ONLY.
- Hot-journal recovery confirmed: crash leftovers roll back automatically on next access ("as if the
  uncompleted writes had never happened" phrasing present) — free crash primitive for metadata rows, but
  sidecar/tree writes outside the transaction get no such guarantee.
- Multi-file (S5): cross-file atomicity needs extra machinery; ordinary deployments do NOT get atomicity
  across the database file AND the filesystem tree — confirms the draft's F4 premise.
- S9 failure list confirmed present: broken locking (network filesystems), incomplete flushes, partial
  deletions, garbage writes, hot-journal deletion/rename hazards — confirms the frozen plan's live-copy
  risk. The word "backup" does NOT appear in this doc: the "use the backup API/snapshot" alternative in
  the predecessor S4 note is researcher reasoning, not a claim of this page. Final must label it as such.

Raw page excerpted here; raw file removed to keep evidence bounded.
