# D-M01-A — critic_and_final report

## Scope and method

Reviewed the declared research-v1 predecessor against the supplied brief and exact frozen primary-source captures. The predecessor SHA-256 matched its declared hash; each source file’s SHA-256 matched the manifest. This is a source review, not an evaluator judgment. Final text is in final.md.

## Critique dispositions

1. **Conditional recommendation and last-known-good handling — accepted.** The API is appropriate as a candidate for an incremental live backup, with completion and publication gates. Staging privately and retaining the prior good copy on failure are sound application policies, not guarantees supplied by SQLite. The final preserves that distinction.

2. **Connection roles and legal use — amended.** The distinct source/destination handles, no open destination transaction at init, and one finish for each successful init are supported. The predecessor’s “do not use destination connection through any other API” is correct; the shared-cache restriction applies specifically when shared-cache mode is in use. Source-handle use remains subject to thread-safety and write-transaction constraints. [S2, S3]

3. **Consistency during writes — amended.** The predecessor correctly distinguished same-handle writes (copied pages are updated) from changes through another connection/process (backup restarts at the next step and may fail to finish under frequent restarts). The final retains SQLite’s documented consistent, up-to-date completed snapshot and avoids promising a measured runtime or a timestamped cut. Whether the workload allows completion remains unresolved. [S1, S2, S3]

4. **Step results and retryability — amended.** SQLITE_OK is a successful partial step; SQLITE_DONE is completion. BUSY and LOCKED are retryable. The captured API documentation describes LOCKED for a source write transaction, but the 3.51.3 code returns BUSY when the source b-tree is already in a write transaction (src/backup.c 337–342). Handling both is justified. The proposed 64-page steps and backoff/deadline are policy choices, not source mandates. [S2, S3]

5. **Finish and failure cleanup — accepted with clarification.** The predecessor correctly required one finish after successful init, including abandon/error paths, and did not treat finish SQLITE_OK as proof of completion. The final distinguishes a failed init (no backup object to finish) and requires SQLITE_DONE plus successful finish before validation/publication. [S2, S3]

6. **Destination page-size restrictions — amended.** WAL destination/source page-size mismatch can produce SQLITE_READONLY; matching sizes is a sensible staging policy. The restriction is conditional on destination mode (the API capture also notes in-memory destinations), not a universal rule for all file destinations. Rollback-journal file destinations can change size during backup. [S1, S2, S3]

7. **Progress and validation — amended.** Counts are snapshots from the most recent step and can be stale after writes. They cannot prove completion or validity, and they do not provide an exact restart counter. The predecessor’s proposal to “record restarts” was narrowed: record results/timing/progress, and instrument a test if exact restart counts matter. Its integrity and workload-invariant checks remain proposed, not executed. [S1, S2, S3]

8. **Uncertainty, alternatives, and draft provenance — partly unresolved; one claim rejected.** Whether the writer handle can schedule steps between transactions and whether the workload fits five minutes are empirical unknowns. VACUUM INTO is retained as a documented lead without unsupported comparative claims; sqlite3_rsync is only relevant if a remote target is later needed. The predecessor’s sentence “No predecessor draft or claims were supplied” is rejected because the declared predecessor draft was present and reviewed. [S1, S2]

## Source identifiers

- **[S1]** https://www.sqlite.org/backup.html — SQLite documentation captured 2026-10-07; SHA-256 `306b6cca5c7c2f93b648040ae139f14d7d3221c0d16d79b5749e69d808382e04`.
- **[S2]** https://www.sqlite.org/c3ref/backup_finish.html — SQLite C API documentation captured 2026-10-07; SHA-256 `3beb8d98440837d57fe8841e13a0d90c4a71b7387ed8dbaf5b92c79f4247325b`.
- **[S3]** https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/backup.c — SQLite source tag `version-3.51.3`, captured 2026-10-07; SHA-256 `ee4cbfc7d8afb311d12cc106d645764a3e18266694f003438b410bfa33764ef7`.

## Executed versus proposed

Executed: read the declared brief, manifest, predecessor, and listed source captures; hash verification matched all declared values; static source review only. Proposed: retry policy, concurrency/fault scenarios, integrity checks, and application invariants. None of those runtime checks was run.

