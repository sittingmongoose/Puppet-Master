# D-M07-A final — SQLite 3.51.3 deployment review: two Linux hosts, one database on a network-mounted directory

Method: critical-first-protected-breadth-final. Recommendation-invalidating assumptions were verified FIRST against the frozen corpus; the protected lower-risk/breadth reserve ran SECOND; this is the full synthesis. The draft was an untrusted test input, not truth.

## Bottom line

ACCEPTED with governing conditions: keep all SQLite access on the host that holds the files, in WAL mode on 3.51.3+, and let the second host reach the data only through an application-level path. The reserve phase showed this is the only corpus-supported shape for the topology, not a workaround.

## Eight material findings

**MF1 — WAL is invalid on this topology. ACCEPTED.** wal.html §1: "All processes using a database must be on the same host computer; WAL does not work over a network filesystem"; §2.2 grounds this in the wal-index living in shared memory ("all readers must exist on the same machine"); §7: the only reliable shared memory is the `-shm` file mmapped beside the database. wal.c 3.51.3 states it flatly: "SQLite does not support journal_mode=WAL on a network filesystem." No mount technology gets an exemption in the corpus.

**MF2 — Single-writer is per-host only. ACCEPTED, one sub-claim flagged as inference.** wal.html §2.2: one WAL file means one writer at a time; wal.c returns SQLITE_BUSY when the writer lock is held and SQLITE_BUSY_SNAPSHOT when the read snapshot has moved (sqlite3WalBeginWriteTransaction). That a second host faces none of this enforcement is an inference from MF1's same-host premise, not a documented cross-host limitation — it must be stated as inferred.

**MF3 — Restart recovery is single-host. ACCEPTED.** wal.html §9: after a crash the first new connection recovers under an exclusive lock while others get SQLITE_BUSY; wal.c walIndexRecover confirms the locks and that the transient wal-index is rebuilt from the WAL. Two hosts would need coherent shared memory across the mount, which MF1 rules out.

**MF4 — The no-shared-memory escape hatch cannot repair two-host. ACCEPTED.** wal.html §8: WAL without shared memory requires locking_mode=EXCLUSIVE before first access and the process "guaranteed to be the only process accessing the database"; the connection stays in EXCLUSIVE until WAL mode is exited (locking_mode=NORMAL is a no-op). §7's custom-VFS heap wal-index likewise serves one process.

**MF5 — Deployment shape. ACCEPTED with governing conditions; AMENDED from the draft.** The draft left rollback-mode multi-host access "unresolved." The reserve resolved it: lockingv3.html (additional capture) reports POSIX advisory locking is "buggy or even unimplemented on many NFS implementations," fsync over network filesystems is unreliable, and SQLite's own advice is "not to use SQLite for files on a network filesystem." REJECTED as an option: direct multi-host access in any journal mode on the mount. Governing conditions (do not omit): (a) the second host never opens the database file directly; (b) the application path serializes writes before they reach the single-host SQLite instance, since SQLite enforces nothing cross-host (MF2, inferred); (c) after `PRAGMA journal_mode=WAL`, assert the returned string is "wal" — on a VFS without shared-memory primitives the conversion silently keeps the old mode (wal.html §3); (d) WAL mode is persistent and applies to all connections (§3.3), so un-deploying requires an explicit revert.

**MF6 — Version condition: stay on 3.51.3 or later. ACCEPTED, AMENDED.** wal.html §11: the WAL-reset corruption bug is "likely present" in 3.7.0–3.51.2, fixed in 3.51.3, backported to 3.44.6 and 3.50.7; it needs two or more connections writing or checkpointing at the same instant in WAL mode. Amendments: keep the doc's "likely" hedge, which the draft dropped; the draft also missed the 2026-08-24 update — an organic reproducer without test hooks now exists, raising practical salience but not the doc's "not an emergency" rating (wild occurrence at or below SSD-malfunction/cosmic-ray rates).

**MF7 — Durability condition. ACCEPTED.** pragma.html: in WAL mode synchronous=NORMAL is corruption-safe and always consistent, but a committed transaction "might roll back following a power loss"; synchronous=FULL is ACID in WAL and syncs the WAL on every commit (wal.html); EXTRA equals FULL in WAL mode. UNRESOLVED as a product decision, not a corpus gap: the required power-loss tolerance is unstated in the question. Supported default: NORMAL for a rebuildable job index; FULL if committed jobs must survive power loss.

**MF8 — Optional maintenance lead: bound WAL growth. ACCEPTED with conditions; lead preserved, not deleted.** Default auto-checkpoint is 1000 pages and PASSIVE; always-overlapping readers can starve checkpoints so the WAL grows without bound, costing disk and read speed (wal.html §6). The draft's proposed tools check out: wal_checkpoint(RESTART) and (TRUNCATE) are valid pragma forms (pragma.html; RESTART blocks until readers finish with the log, TRUNCATE also truncates to zero; both may block readers); journal_size_limit caps the WAL left on disk, which is not truncated after checkpoint by default; busy_timeout installs a busy handler so contention retries instead of failing fast. Uncertainty preserved: the reader-overlap profile is unknown, so thresholds are measurement-gated, not adopted. Doc note: pragma.html is operative for pragma forms; wal.html §3.2's three-subtype list is narrower.

## Dispositions summary

Accepted: MF1, MF2, MF3, MF4, MF7, MF8. Accepted with conditions or amendments: MF5, MF6. Rejected: direct multi-host SQLite access in any journal mode on the network mount; second-host reads via the immutable query parameter (uri.html: if a file asserted immutable changes anyway, SQLite "might return incorrect query results and/or SQLITE_CORRUPT errors" — incompatible with an active writer). Unresolved and carried: power-loss tolerance (MF7); reader-overlap profile (MF8); busy_timeout's default value (not claimed here; proposed check).

## Checks — executed versus proposed

Executed: hash-verified reads of the three frozen sources (network-filesystem, wal-index/shm, §7–§9, §11, synchronous, locking_mode, wal_checkpoint, journal_size_limit, busy_timeout material; wal.c writer-lock and recovery code); two additional primary captures (lockingv3.html, uri.html) with URLs, capture dates, SHA-256 hashes, and limitations recorded — both are live-site captures, not pinned to 3.51.3, and were used only where the frozen corpus is silent. Proposed, not executed: reader-overlap profiling of the real workload; RESTART/TRUNCATE blocking-cost measurement against the product's latency budget; busy_timeout default confirmation from the C-API reference; any live NFS/SMB experiment (out of scope — no execution of downloaded code, and the mount technology is unrecorded).

## Uncertainty summary

The corpus answers categorically for WAL over network filesystems and, via capture, for rollback-mode locking; three inputs remain product-side — power-loss tolerance, reader-overlap profile, and the mount technology. None reopens the recommendation; each parameterizes one governing condition.

## Sources

1. sqlwal — https://www.sqlite.org/wal.html (capture 2026-10-07) — sha256 f3467b530b883d4a00574fe1a898b3d121ed72764ae28cf66941080ac0badb9e
2. sqlwalcode — https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/wal.c (version-3.51.3) — sha256 100980ad092bcd2b722902b4b2f9927975cfa953d57eef521d7aed42918a39be
3. sqlpragma — https://www.sqlite.org/pragma.html (capture 2026-10-07) — sha256 b9bcb335ae818497f3fa05114a10492f64f35503f275da2264f2d5d436db3f5d
4. lockingv3 — https://www.sqlite.org/lockingv3.html (capture 2026-10-07, additional) — sha256 fa67031159fc0658b6e3fcfa4e446c140838c75cb813ff9fafd47fdae927936f
5. uri — https://www.sqlite.org/uri.html (capture 2026-10-07, additional) — sha256 9fba2ee18bc6cbf9167ffd02d40a0a38eb84fdde99eb998b0ad4d9543294e5c7

Working evidence: notes-critical-check.md (critical phase) and notes-reserve.md (reserve phase, captures under additional-captures/) in this directory. Output bytes and phase timings recorded there.
