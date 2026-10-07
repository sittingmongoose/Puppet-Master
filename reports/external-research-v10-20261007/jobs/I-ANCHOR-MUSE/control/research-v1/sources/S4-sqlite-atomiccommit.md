# S4 evidence — SQLite "Atomic Commit In SQLite"

Provenance: https://www.sqlite.org/atomiccommit.html — versionless rolling doc. Retrieved 2026-10-07T18:30:29Z (HTTP 200, 77968 bytes fetched).

Bounded excerpts:

- S3 single-file commit: a write transaction acquires locks, creates a rollback journal containing original pages, mutates pages in user space, flushes journal to mass storage, writes changed pages, flushes, then deletes the journal and releases locks. Commit is atomic: either all changes land or none do.
- S4 rollback / hot journals: if a crash leaves a journal behind, the next accessor treats it as a HOT journal, rolls the database back to the pre-transaction state, deletes the journal, and continues "as if the uncompleted writes had never happened" (S4.6). This is the crash-recovery primitive the frozen plan's SQLite metadata store already gets for free — but ONLY for the .db file, not for sidecar files (originals, previews) written outside the transaction.
- S5 multi-file commit: cross-database atomicity needs a super-journal; ordinary deployments do not get atomicity across the database file AND the filesystem tree.
- S9 things that can go wrong (hidden-risk list): broken locking implementations (notably network filesystems), incomplete disk flushes, partial file deletions, garbage written into files, deleting/renaming a hot journal. Directly relevant: the frozen plan's "nightly copy to a second disk" can copy a database mid-transaction or a tree mid-ingest unless it uses the backup API/snapshot or quiesces writes; copying a live tree gives a corrupt or half-written replica.
