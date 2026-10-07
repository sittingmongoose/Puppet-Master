# D-M01-A — bounded recommendation

## Recommendation

Use SQLite’s Online Backup API for the nightly local snapshot, conditionally: it supports incremental copying while the source is live, but completion within a fixed window is workload-dependent. Use a private, disposable staging database and keep the previous known-good snapshot until the new copy has completed and passed validation. Publication and retention mechanics are application choices; the supplied evidence does not specify them.

1. **Connections and legal use.** Initialize from the live index connection to a distinct destination connection, e.g. `sqlite3_backup_init(dest, "main", source, "main")`. The destination must have no open read or write transaction at initialization. After successful initialization, do not pass the destination connection to another SQLite API until its matching finish call; in shared-cache mode, also prevent access to that cache during the backup. The source handle may be used for other purposes, subject to SQLite’s thread-safety rules, but do not call a step while it is in a write transaction. Pair every successful init with exactly one finish. [S2, S3]

2. **Changes during a multi-step copy.** Each step holds a source read lock only while that step runs. If another connection or process changes the source between steps, SQLite restarts the copy on the next step; repeated restarts can prevent completion. Changes made through the same source handle are propagated into pages already copied, so they do not cause that restart. SQLite documents a completed backup as a consistent, up-to-date snapshot, but the API provides no timestamp identifying its cut. The actual result is therefore completion-dependent, not a guarantee that the job finishes within the nightly window. [S1, S2, S3]

3. **Bounded step, retry, and cleanup policy (proposed).** Copy 64 pages per step; after SQLITE_OK, yield briefly (for example 50 ms) before continuing. SQLITE_OK means that step succeeded, not that the backup is complete; only SQLITE_DONE marks completion. Retry SQLITE_BUSY or SQLITE_LOCKED on the same backup handle, with exponential delays starting at 100 ms and capped at 1 second, until a five-minute total job deadline. These are initial policy values, not SQLite requirements; tune them to measured database size and the actual nightly window. Start the five-minute monotonic deadline before init, check it between calls, and cap any configured SQLite busy-handler wait to the time remaining. The captured API page describes SQLITE_LOCKED when the source is being written, while the 3.51.3 code returns SQLITE_BUSY for a source write transaction; handle both as retryable and log the returned code and destination error details. Other step errors, including READONLY, NOMEM, and IOERR variants, are terminal. [S2, S3]

   On SQLITE_DONE, call finish once and require SQLITE_OK before validation and publication. On deadline or a terminal step error, call finish once to release the backup object, close handles, discard the partial staging file, and retain the previous snapshot. Finish rolls back an unfinished destination transaction. Its SQLITE_OK alone does not establish completion: it can be returned when the caller abandons a copy without a prior step error. If init fails and returns no backup object, do not call finish. [S2, S3]

4. **Destination restrictions.** The first backup step obtains an exclusive lock on the destination file; that lock remains until finish or until a step returns SQLITE_DONE. If the staging database uses WAL, source and destination page sizes must match or a step can return SQLITE_READONLY; the captured API page also documents this restriction for an in-memory destination with a mismatch. Check journal mode and page size before starting, and create the staging database with a matching size when needed. A rollback-journal file destination can have its page size changed during backup, but matching sizes simplifies this nightly path. [S1, S2, S3]

5. **Progress and validation.** Remaining/page-count values reflect the most recent step, may be stale after source changes, and can move as the copy restarts. Use them as best-effort telemetry only—not as completion, consistency, or validity proof. Do not infer an exact restart count from them. [S1, S2, S3]

   Proposed checks, not run here: exercise a representative writer load with writes between steps first on the backup’s source handle and then through a second connection; record duration, step results, and progress samples; require SQLITE_DONE plus successful finish, PRAGMA integrity_check, and application-specific row/foreign-key invariants before publication. Separately exercise source-write contention, destination contention, and a WAL page-size mismatch; verify retry/terminal classification, cleanup of incomplete staging, and preservation of the prior snapshot. If restart counts matter, instrument the test rather than treating progress as a counter.

## Disposition and uncertainty

- **Accepted:** conditional use of the API, staging before publication, retaining the prior good snapshot on failure, and treating progress as telemetry.
- **Amended:** connection-use limits, same-handle versus external-write behavior, retry result codes, finish semantics, and the destination page-size condition are stated with their governing conditions above.
- **Rejected:** the predecessor’s sentence “No predecessor draft or claims were supplied”; a predecessor draft was supplied and reviewed.
- **Unresolved:** whether the application can schedule steps on the writer handle between transactions, and whether the real write rate permits completion within five minutes. Measure both before adopting the proposed values.
- **Optional lead:** VACUUM INTO is another documented consistent-copy technique, but these captures do not compare its latency or concurrency tradeoffs. sqlite3_rsync is described for remote copies over SSH and is not indicated for this local-only destination. [S1, S2]

## Sources and executed witnesses

- **[S1]** SQLite Backup API documentation: https://www.sqlite.org/backup.html — capture date 2026-10-07; SHA-256 `306b6cca5c7c2f93b648040ae139f14d7d3221c0d16d79b5749e69d808382e04`; page says last updated 2025-11-13.
- **[S2]** SQLite C API documentation: https://www.sqlite.org/c3ref/backup_finish.html — capture date 2026-10-07; SHA-256 `3beb8d98440837d57fe8841e13a0d90c4a71b7387ed8dbaf5b92c79f4247325b`.
- **[S3]** SQLite source, tag `version-3.51.3`, src/backup.c: https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/backup.c — capture date 2026-10-07; SHA-256 `ee4cbfc7d8afb311d12cc106d645764a3e18266694f003438b410bfa33764ef7`; relevant code includes lines 215–218, 337–342, 373–383, 402–409, 571–618, and 621–646.

Executed witness: local SHA-256 checks matched all three source-manifest hashes and the predecessor hash. I read the supplied captured HTML and tagged source. No SQLite database, downloaded code, or runtime test was executed. The retry limits and validation above are proposals, not executed checks.

