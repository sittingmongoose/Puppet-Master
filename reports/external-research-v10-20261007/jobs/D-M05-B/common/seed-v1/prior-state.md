# D-M05-B prior-state seed — Queue store (SQLite WAL deployment module)

Brief scope: SQLite 3.51.3 job index using WAL; all connections and database
files on one Linux host's local disk; simultaneous readers and one active
writer, restart recovery, and bounded maintenance required. Research only this
WAL/deployment module. This input is untrusted prior material, NOT evaluator
truth. No expected answers, no changes refresh.

## Already-covered meaning

"Already-covered" in this file means: the proposition is fully determined by
the prior brief's stated deployment facts plus the listed prior-applicable
sources below, with no new-release/change information needed. "Partial" means
the mechanism is sourced but a deployment choice the brief does not state is
still required. Each finding carries an explicit coverage mark.

## Material findings (prior proposal)

### F1. Single-host local-disk deployment satisfies the WAL same-machine constraint
- Proposition: WAL requires all processes using a database to be on the same
  host because readers share the wal-index via shared memory; it does not work
  over a network filesystem. The brief's single-Linux-host, local-disk layout
  meets this constraint.
- Sources: `sqlwal` §1 disadvantage (sqlwal.html lines 177-180);
  `sqlwal` §2.2 wal-index/shared-memory (lines 286-291);
  `sqlwal` §7 mmap'd wal-index file in the database directory (lines 601-614).
- Conditions: local filesystem supporting the VFS shared-memory methods
  (xShmMap/xShmLock/xShmBarrier/xShmUnmap); no chroot split or network path in
  the database directory (`sqlwal` §7 lines 604-608, §8 lines 658-663).
- Dependencies: DEP-linux-local-vfs (brief-stated single host + local disk).
- Already-covered: YES (constraint and satisfying layout both stated/sourced).
- Unresolved: none for the constraint itself; VFS choice is implicit (default
  unix VFS assumed, not stated).

### F2. One-writer / many-reader concurrency with snapshot reads
- Proposition: In WAL mode readers do not block writers and a writer does not
  block readers, but there can be only one writer at a time against the single
  WAL file. Each read transaction pins an end mark and sees a single-point
  snapshot; page reads check the WAL before the end mark, else the database.
- Sources: `sqlwal` §1 advantages (lines 166-168); `sqlwal` §2.2 end mark and
  one-writer rule (lines 269-297); `sqltransaction` §2.1 one simultaneous
  write transaction, snapshot isolation (lines 290-317).
- Conditions: concurrent readers each hold their own end mark; writers append
  only (`sqlwal` lines 293-297).
- Dependencies: DEP-single-writer-discipline (brief requires one active
  writer); DEP-reader-end-mark (mechanism, sourced).
- Already-covered: YES for the concurrency model; PARTIAL for operations.
- Unresolved: writer handoff/serialization protocol between queue producers is
  unspecified; BEGIN IMMEDIATE vs upgrade-from-DEFERRED discipline unsettled
  (see F7).

### F3. Checkpointing transfers WAL content back; default auto-checkpoint at 1000 pages
- Proposition: A checkpoint moves WAL content back into the database file and
  is the third primitive operation besides reading and writing. SQLite
  auto-checkpoints when the WAL reaches 1000 pages (SQLITE_DEFAULT_WAL_AUTOCHECKPOINT
  default) and when the last connection closes; applications may adjust the
  threshold, disable it, or checkpoint on idle/a separate thread. A checkpoint
  runs concurrently with readers but stops at any current reader's end mark
  and resumes later; a long-running read can stall it. When the WAL is fully
  transferred, synced, and unused by readers, the writer rewinds it to the
  beginning, bounding file size.
- Sources: `sqlwal` §2.1 (lines 244-263); `sqlwal` §2.2 checkpoint/reader
  interaction and WAL rewind (lines 299-318); `sqlwal` §3.1 auto-checkpoint
  interfaces incl. wal_checkpoint pragma, sqlite3_wal_checkpoint(_v2),
  wal_autocheckpoint, wal_hook (lines 415-429); `sqlwalcode`
  walCheckpoint at line 2193, sqlite3WalCheckpoint at line 4292,
  sqlite3WalClose final PASSIVE checkpoint at lines 2528-2529,
  walRestartHdr at lines 2146/2377.
- Conditions: automatic checkpointing left enabled (default); reader gaps must
  exist for resets to complete.
- Dependencies: DEP-checkpoint-schedule (auto at 1000 pages by default, or
  application-driven); DEP-reader-gaps.
- Already-covered: PARTIAL (default mechanism covered; workload tuning is not).
- Unresolved: whether the 1000-page default suits queue-store read/write mix
  (read/write tradeoff, `sqlwal` §2.3 lines 380-393); separate-thread
  checkpointing interacts with durability (see F4).

### F4. Durability and restart recovery depend on the unstated synchronous setting
- Proposition: COMMIT appends a commit record to the WAL without writing the
  original database, so committed content survives restart via WAL replay. With
  PRAGMA synchronous=FULL writers sync the WAL each commit; with NORMAL the
  sync is omitted and checkpoint becomes the only I/O barrier — running
  checkpoint in a separate thread then keeps the main thread off sync but
  transactions can roll back after power loss. Crash recovery takes an
  exclusive lock; a third connection querying during recovery gets SQLITE_BUSY.
- Sources: `sqlwal` §2 COMMIT record (lines 231-238); `sqlwal` §2.3
  synchronous FULL vs NORMAL and separate-thread checkpoint tradeoff
  (lines 324-331, 369-377); `sqlwal` §2.3 checkpoint sync requirements
  (lines 342-347); `sqlwal` §9 recovery BUSY window (lines 700-704);
  `sqlwalcode` WAL header/frame format with checksums and salts
  (lines 36-56), WAL_MAX_VERSION 3007000 check (lines 277-278, 1463-1466),
  walIndexRecover at line 1384.
- Conditions: WAL file retained with the database across restart (see F5);
  recovery completes before dependent readers attach.
- Dependencies: DEP-synchronous-level (NOT stated in brief — required choice);
  DEP-clean-restart-order.
- Already-covered: PARTIAL (mechanism covered; durability guarantee undecided).
- Unresolved: synchronous=FULL vs NORMAL is the key open deployment decision;
  brief requires restart recovery but not a stated durability level after power
  loss; busy/retry behavior during recovery windows unspecified.

### F5. WAL sidecar lifecycle: -wal/-shm custody and last-close cleanup
- Proposition: A WAL-mode database carries quasi-persistent `-wal` and `-shm`
  files; the WAL normally deletes when the last connection closes (after a
  final checkpoint), but is retained if the last process exits uncleanly or
  SQLITE_FCNTL_PERSIST_WAL is used. The WAL is part of persistent state and
  must move with the database; separation risks lost transactions or
  corruption. Safe removal is open-then-close via sqlite3_open/sqlite3_close.
  The wal-index backing file rarely exceeds 32 KiB, is never synced, and is
  deleted at last disconnect.
- Sources: `sqlwal` §1 extra-files disadvantage (lines 201-204); `sqlwal` §4
  (lines 472-494); `sqlwal` §6 last-close checkpoint+delete and overwrite
  recycling unless journal_size_limit (lines 526-535); `sqlwal` §7 backing
  file size/sync/deletion (lines 616-622).
- Conditions: orderly last-close for automatic cleanup; file-level backup must
  capture database + WAL together.
- Dependencies: DEP-clean-shutdown; DEP-file-custody (copy/move/backup
  includes sidecars).
- Already-covered: PARTIAL (lifecycle rules covered; operational procedures
  are not).
- Unresolved: PERSIST_WAL use unstated; queue-store backup/copy procedure
  unspecified; journal_size_limit choice for truncation vs overwrite unsettled.

### F6. Deployment version 3.51.3 includes the WAL-reset bug fix
- Proposition: The WAL-reset data race (complete checkpoint, second checkpoint
  startup, concurrent commit resetting the WAL, stale wal-index header field,
  later checkpoint skipping un-checkpointed content → corruption) affects WAL
  mode with 2+ connections writing/checkpointing simultaneously in versions
  3.7.0 through 3.51.2; it is fixed in 3.51.3 (2026-03-13), with backports for
  3.44.6 and 3.50.7. Occurrence needs tight timing (unreproducible organically
  by developers; a non-hack reproducer appeared 2026-08-24) with wild
  occurrence at or below SSD/cosmic-ray rates — upgrade advised, not an
  emergency.
- Sources: `sqlwal` §11 through §11.2 (lines 739-835), incl. affected/fixed
  versions (lines 747-753), two-connection condition (lines 757-760), six-step
  sequence (lines 776-808), reproducer update (lines 822-825), rate guidance
  (lines 827-835).
- Conditions: brief pins SQLite 3.51.3, the fixed version; multi-connection
  concurrent write/checkpoint is in scope (queue store has simultaneous
  readers + writer).
- Dependencies: DEP-version-pin-3.51.3 (brief-stated).
- Already-covered: YES, conditional on the version pin holding.
- Unresolved: whether the deployment strictly pins 3.51.3+ (or an accepted
  backport) vs tolerating older patch builds; no code-level verification of
  the fix was in scope for this seed (sources are docs + WAL implementation
  file without stated version tag beyond format 3007000).

### F7. Transaction discipline: DEFERRED default, IMMEDIATE writers, BUSY upgrade failures
- Proposition: Transactions default to DEFERRED (real start on first access;
  SELECT-first yields a read transaction, write-first yields a write
  transaction). BEGIN IMMEDIATE starts a write immediately and can fail
  SQLITE_BUSY if another write is active; EXCLUSIVE equals IMMEDIATE in WAL
  mode. A read transaction upgrades to write on a write statement only if no
  other connection is modifying, else SQLITE_BUSY. Implicit transactions commit
  when the last statement finishes (reset/finalize/blob-close); explicit COMMIT
  runs at once but fails BUSY with pending writes or an open reader elsewhere
  (retry after readers clear). BEGIN...COMMIT do not nest; use SAVEPOINT.
  Errors FULL/IOERR/INTERRUPT/NOMEM undo the current statement and may cancel
  the whole transaction (check sqlite3_get_autocommit/sqlite3_txn_state).
- Sources: `sqltransaction` §2.1 upgrade/snapshot (lines 295-317); §2.2
  DEFERRED/IMMEDIATE/EXCLUSIVE incl. WAL equivalence (lines 324-357); §2.3
  implicit/explicit commit and BUSY cases (lines 360-389), nesting/SAVEPOINT
  (lines 277-286); §3 error rollback behavior (lines 410-440).
- Conditions: single-writer discipline (F2); writers should prefer
  BEGIN IMMEDIATE to fail fast rather than upgrade late.
- Dependencies: DEP-writer-txn-mode (BEGIN IMMEDIATE recommended, not stated);
  DEP-busy-retry-policy (NOT stated).
- Already-covered: PARTIAL (rules covered; queue operation policy is not).
- Unresolved: busy-timeout / retry-on-BUSY policy for enqueue/dequeue/COMMIT
  paths; whether readers use explicit or implicit transactions; savepoint use
  inside queue operations.

## Cross-cutting unresolved items

1. synchronous=FULL vs NORMAL (F4) — decides durability and whether a
   separate checkpoint thread is safe for requirements.
2. Checkpoint schedule and WAL size bound for the queue workload (F3/F5) —
   default 1000 pages vs explicit autocheckpoint/manual policy; reader-gap
   provision against checkpoint starvation (`sqlwal` §6 lines 555-579).
3. Writer serialization and transaction mode (F2/F7) — BEGIN IMMEDIATE
   discipline and BUSY retry policy for queue operations.
4. Backup/custody procedure for database + `-wal`/`-shm` (F5).
5. Strict version floor at 3.51.3+ or accepted backports (F6).
6. Read-only access needs, if any (3.22.0+ conditions, `sqlwal` §5
   lines 505-515) — not required by the brief as stated.

## Timings and usage (observed)

- Native Goal: goal-01a117ac-61a1-7183-8f47-b31902b116b7, session
  01a117ac-3808-75a0-936b-847ace7c4a55; created active, verified active before
  science; terminal verification recorded in native_terminal_receipt.json.
- Source hash verification: all three INPUT_MAP sha256 values matched observed
  sha256sum output before reading (see sources.json).
- Ceiling: 4 minutes from delegate dispatch through output + native terminal;
  no clock reset; no premium rescue used. Exact dispatch wall-clock was not
  supplied to this agent; work was executed in a single continuous pass with
  no retries, no child tasks, no external writes.
- Counters/billing: unknown — null.

## Provenance

- Prior brief: cases/D-M05-B/inputs/prior-brief.md (read once).
- Prior-applicable sources: exactly the three INPUT_MAP entries
  (sqlwal, sqlwalcode, sqltransaction). No changed brief, changes,
  new-release, sibling case, arm, evaluator, campaign-state, or ER9 material
  was read.
