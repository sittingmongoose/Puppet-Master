# D-M04-A control critique

Draft identity: `research-v1/draft.md`, SHA-256 `972068136a0cd2b1853f28c8ffef21a9099724446c5781ef79f729e726c76c08`. I cold-read the four listed frozen originals into the critic's own cache and checked the relevant raw lines independently. No researcher extraction or cache was reused. Full source identities, read ranges, receipts, and operations are in `sources.json`.

## Findings and dispositions

1. **ACCEPTED — Verify the actual journal mode.** The PRAGMA capture says a failed journal-mode change returns the original mode; WAL requires all participating processes on the same host. The brief's local-disk setting is compatible with that boundary. Keep the WAL-specific behavior conditional on a returned `wal` value. (PRAGMA lines 1208–1227; WAL lines 160–177.)

2. **ACCEPTED — Choose transaction acquisition for the work.** The transaction capture confirms DEFERRED starts on first database access; a first SELECT begins a read transaction, and a later write attempts an upgrade. IMMEDIATE begins a write immediately and can return `SQLITE_BUSY` if another writer is active. WAL still has only one writer. Preserve the recommendation to use IMMEDIATE for known-write units and DEFERRED for read-only or genuinely optional writes. (Transactions lines 332–352; WAL lines 296–303.)

3. **AMENDED — Separate writer-lock busy from a stale snapshot.** A deferred reader keeps its historical snapshot. In the 3.51.3 WAL code, after obtaining the writer lock, a changed WAL-index header since that snapshot produces `SQLITE_BUSY_SNAPSHOT`. That case cannot be repaired by waiting inside the stale read transaction: roll back and retry the complete database-only operation from a new snapshot, if replay is safe. Do not imply that every ordinary writer-acquisition `SQLITE_BUSY` has the same cause. (Transactions lines 293–307, 332–342; `wal.c` lines 3688–3734.)

4. **ACCEPTED — WAL narrows contention but does not erase it.** WAL documents one writer at a time, concurrent readers/writer, and three exceptional `SQLITE_BUSY` cases: exclusive locking mode, last-connection cleanup, and recovery after a crash. Long readers can halt checkpoint progress at their end mark; this is checkpoint pressure, not ordinary reader blocking of a writer. Keep monitoring as optional operational advice. (WAL lines 266–312, 681–706.)

5. **REJECTED — Do not present reader-blocked COMMIT as a WAL expectation.** The transaction page documents a `SQLITE_BUSY` COMMIT case in which the transaction remains active and COMMIT can be retried after a reader clears. Read together with WAL's reader/writer concurrency, this should not be used to claim that a long WAL reader normally blocks COMMIT. Keep the safe rule conditional: if COMMIT returns busy, inspect transaction state and retry COMMIT only when that transaction remains active; never replay the body. (Transactions lines 378–390; WAL lines 166–169, 296–303.)

6. **AMENDED — Keep retry policy at the application boundary.** The PRAGMA capture says each connection has one busy handler and setting `busy_timeout` may overwrite an existing handler. Keep one coherent handler/timeout setup, plus an application request deadline and attempt cap. Treat backoff/jitter and replay safety as recommendations, not SQLite guarantees. Do not automatically retry an entire operation with non-idempotent external effects. (PRAGMA lines 576–588.)

7. **ACCEPTED — Clean up based on transaction state.** Manual transactions normally persist until COMMIT/ROLLBACK; some errors can cause automatic rollback. SQLite exposes autocommit/transaction-state checks. A failed IMMEDIATE begin must not run its body. Roll back before reusing a connection when state is still active, or retire it if state/cleanup is uncertain. Savepoints are the documented nested-transaction mechanism. (Transactions lines 248–288, 378–438.)

8. **UNRESOLVED — Keep `SQLITE_LOCKED` distinct.** The mapped transaction and WAL documentation did not define a `SQLITE_LOCKED` retry rule, and the inspected WAL code concerns `SQLITE_BUSY`/`SQLITE_BUSY_SNAPSHOT`. The draft correctly avoids equating every busy/locked result. Preserve exact primary/extended codes and diagnose LOCKED separately; a driver-specific policy remains unverified.

## Obligation coverage after amendments

All six requested obligations are represented: deferred/immediate acquisition (1–2), reader-to-writer transition (3), WAL and busy/locked conditions (1, 4, 8), application retry versus guarantees (6), cleanup (7), and one alternative plus discriminating proposed checks (final.md). The alternative and checks remain proposals and were not executed.

