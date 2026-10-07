# D-M01-A — preliminary research proposal (control)

## Recommendation and dispositions

**Recommendation — accepted with conditions.** SQLite’s Online Backup API is a suitable nightly snapshot mechanism for this local, live database if the job uses a dedicated source connection, an exclusively owned disk staging destination, and a finite contention budget. Publish a candidate only after the step call reports `SQLITE_DONE`, finalization succeeds, and validation passes. Never overwrite the last known-good snapshot with an incomplete run.

### 1. Source and destination roles; legal usage — accepted

Call `sqlite3_backup_init(D, "main", S, "main")`: **D is the writable destination connection**, **S the source connection**; they must be different handles. A destination read or read-write transaction already open makes initialization fail. For each successful init, call finish exactly once. Keep the destination connection and target file private from all other API use for the entire interval from init through finish; in shared-cache mode, do not access the target file through another same-process connection either. Use a dedicated backup source handle rather than concurrently driving the writer’s handle. These conditions follow the API contract and 3.51.3 implementation. [sqlbackupapi]

### 2. Live-source consistency — amended

Incremental steps hold a source shared lock only while each step runs, allowing work between steps. A write to the source during a multi-step copy can restart the operation; a same-process write through the same source handle is a documented exception that updates copied pages. The completed destination is promised to be a consistent, up-to-date snapshot, but “snapshot” should not be read as necessarily the database exactly at the scheduled start time when writes occur. In 3.51.3, the code resets the page cursor after external source modification; it also returns BUSY immediately when the source pager is already in a write transaction. Continuous commits may repeatedly restart work and exhaust the job’s budget. [sqlbackup] [sqlbackupapi] [sqlbackupcode]

### 3. Completion, contention, fatal errors, and cleanup — accepted

Treat step results as follows: `SQLITE_DONE` is completion; `SQLITE_OK` means continue; `SQLITE_BUSY` and `SQLITE_LOCKED` are retryable; other errors, including `SQLITE_READONLY`, `SQLITE_NOMEM`, and `SQLITE_IOERR_*`, fail this run. If init returns NULL, record the destination connection’s error and fail setup rather than retrying blindly. Proposed bounded policy (not an SQLite-prescribed limit): use a short busy timeout (for example, 250 ms), step 128 pages at a time, pause about 100 ms between successful partial steps, and allow at most 60 seconds overall or 8 consecutive BUSY/LOCKED results, whichever comes first. Tune after measurements. On exhaustion or fatal error, call finish once, record both the last step result and finish result, close both connections, and delete only this run’s unique staging database and its SQLite sidecars. Retain the previous good snapshot; try a fresh staging file on the next scheduled run.

A finish result of `SQLITE_OK` alone does **not** prove completion: the API says it may be OK even if step never completed (and BUSY/LOCKED do not affect finish’s result). Count success only when a step returned DONE and finish returned OK. [sqlbackupapi] [sqlbackupcode]

### 4. Destination transaction and page-size constraints — accepted

Use a writable ordinary disk file, not an in-memory destination. Do not leave an explicit transaction open on the destination before init. For disk destinations, SQLite normally changes the destination page size during backup; however, a destination in WAL mode with a different page size from the source returns READONLY. Either keep the staging destination out of WAL mode or ensure its page size matches the source before stepping. A new private staging file in the default rollback-journal mode is the simpler proposal. Confirm actual journal mode and page size at runtime. [sqlbackup] [sqlbackupapi] [sqlbackupcode]

### 5. Progress counts — amended

`sqlite3_backup_remaining()` and `sqlite3_backup_pagecount()` are useful for progress estimates, not proof of a stable total or successful backup. They reflect the most recent step and are not refreshed for source-size changes until another step. Use the step return code, not a progress bar reaching zero, as the completion signal. Read these counters only when no other thread is stepping/finishing the same backup handle. [sqlbackupapi] [sqlbackupcode]

### 6. Minimal validation and alternative — proposed, not executed

Against the deployed SQLite 3.51.3 build, test (a) a multi-page database with committed writes deliberately placed between steps, checking `PRAGMA integrity_check` and transaction-level invariants in the output; (b) contention that produces BUSY/LOCKED, then clears, plus sustained writes that hit the deadline, confirming retry, finish, cleanup, and preservation of the prior snapshot; and (c) destination transaction-at-init and WAL/page-size mismatch cases, confirming they fail safely. Reopen and validate a completed staging copy before any same-filesystem atomic publication. These are proposals; no database code or runtime was executed in this research stage.

**Uncertainty / retained alternative.** The brief does not say whether the active writer uses the connection that would be passed as S, whether it holds long transactions, or whether the target is configured for WAL. Verify these facts on the target build; sustained source churn may make the 60-second policy miss a run. SQLite also lists `VACUUM INTO` as a safe live-database copy and describes it as producing a vacuumed copy; retain it as an alternative if a compacted output is desired, but its contention and timing behavior has not been evaluated here. [sqlbackup]

## Source identities and conditions

- **[sqlbackup]** https://www.sqlite.org/backup.html — SQLite documentation capture dated 2026-10-07; SHA-256 `306b6cca5c7c2f93b648040ae139f14d7d3221c0d16d79b5749e69d808382e04`.
- **[sqlbackupapi]** https://www.sqlite.org/c3ref/backup_finish.html — SQLite C API documentation capture dated 2026-10-07; SHA-256 `3beb8d98440837d57fe8841e13a0d90c4a71b7387ed8dbaf5b92c79f4247325b`.
- **[sqlbackupcode]** https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/backup.c — SQLite `version-3.51.3` source, capture dated 2026-10-07; SHA-256 `ee4cbfc7d8afb311d12cc106d645764a3e18266694f003438b410bfa33764ef7`.

The three supplied capture hashes were recomputed and matched. Documentation is capture-pinned; implementation claims above are reconciled to the supplied 3.51.3 source. No predecessor draft or critique was supplied.
