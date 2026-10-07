# D-M04-A fresh critic

## Dispositions

1. **Accepted — acquisition mode.** The draft correctly recommends short `BEGIN IMMEDIATE` transactions for paths that will write, and `DEFERRED` where a path may remain read-only. Keep database work inside the transaction and avoid external waits while holding the writer slot. (sqltransaction, raw lines 322–357)

2. **Accepted, with a condition — read-to-write promotion.** A deferred transaction whose first access is a SELECT holds a snapshot; a later write must promote it. The 3.51.3 WAL implementation returns `SQLITE_BUSY_SNAPSHOT` when that snapshot has gone stale and starts no write transaction. Affected work must roll back and restart from fresh reads if safe to replay. Preserve the draft’s binding/extended-code uncertainty. (sqltransaction 330–342; sqlwalcode 3681–3737; supplemental sqlresultcodes 915–935)

3. **Amended — WAL and contention.** The draft correctly says WAL permits readers and a writer to proceed concurrently, still permits only one writer, and long readers can stall checkpoints. Keep the condition that all processes use the database on one host; query `PRAGMA main.journal_mode` on the opened database and treat the returned mode as authoritative. Local-disk placement alone does not establish that WAL is active. (sqlwal 166–180, 293–318, 555–579, 672–705; sqlpragma 1214–1224)

4. **Amended — busy versus locked.** The draft leaves `SQLITE_LOCKED` unhandled despite the brief’s explicit busy/locked obligation. Separate-connection contention is `SQLITE_BUSY`; `SQLITE_LOCKED` identifies a same-connection or shared-cache conflict. Do not send LOCKED through the ordinary BUSY timeout/retry loop: release/reset/finalize the conflicting statement/cursor or resolve the shared-cache conflict, then decide whether the operation can restart. Extended result codes may require binding configuration. (supplemental sqlresultcodes 171–184, 399–453)

5. **Unresolved — COMMIT BUSY scope.** The mapped transaction page says a reader-related `COMMIT` BUSY leaves the transaction active and permits retrying COMMIT (378–389). The WAL page says WAL readers do not block writers (166–168, 293–297). The additional live result-code page broadly says successful `BEGIN IMMEDIATE` guarantees no later BUSY through COMMIT (416–424). These statements may describe different journal-mode conditions, but the live page is not pinned to 3.51.3. Preserve a phase-specific policy; resolve against the selected build with the proposed test, not by assuming either sentence applies universally.

6. **Accepted — application policy and cleanup.** The proposed 100 ms timeout, four total acquisition/commit calls, capped 25/50/100 ms pauses with jitter, and 1 s monotonic deadline are application starting values, not SQLite guarantees. Count SQLite-call time against the deadline. On COMMIT BUSY, retry only COMMIT while the transaction remains active; on a stale deferred snapshot, rollback and restart only a safe, idempotent logical unit. On body failure, reset/finalize outstanding statements, explicitly roll back if still active, and do not reuse a connection whose transaction state is uncertain. The PRAGMA installs the connection’s single busy handler and may replace one already configured. (sqlpragma 576–588; sqltransaction 378–395; sqlwalcode 3721–3737)

7. **Rejected for the final policy — blanket retry.** Retrying every BUSY or LOCKED by replaying the whole body is unsupported: the safe action depends on the phase and result code. The draft’s caution against replaying external side effects is retained.

8. **Accepted — alternative and proposed checks.** Retain DEFERRED for conditional paths that often remain read-only. Keep the draft’s proposed writer-contention, stale-snapshot/replay, long-reader/checkpoint, and WAL-disabled checks. They were not executed and are not witnesses.

## Remaining uncertainty

Confirm the deployed runtime is SQLite 3.51.3, the actual journal mode, and whether the binding exposes extended result codes. The extra result-code page is a live official capture with a hash, not a version-pinned 3.51.3 manual. The timing values remain unmeasured operational defaults.
