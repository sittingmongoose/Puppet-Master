# D-M07-A critical dependency check — working notes (FIRST phase)

Mode: critical-first-protected-breadth-final v3. This phase verifies the assumptions that
could invalidate the draft's selected recommendation (draft point 5: keep all SQLite access
on the host holding the files, keep WAL there, serve the second host through an
application-level access path) BEFORE the protected lower-risk/breadth reserve.

Sources (all FROZEN_PUBLIC_PRIMARY_CORPUS, hashes verified against INPUT_MAP.json):
- sqlwal: https://www.sqlite.org/wal.html capture 2026-10-07, sha256 f3467b530b883d4a00574fe1a898b3d121ed72764ae28cf66941080ac0badb9e
- sqlwalcode: https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/wal.c (version-3.51.3), sha256 100980ad092bcd2b722902b4b2f9927975cfa953d57eef521d7aed42918a39be
- sqlpragma: https://www.sqlite.org/pragma.html capture 2026-10-07, sha256 b9bcb335ae818497f3fa05114a10492f64f35503f275da2264f2d5d436db3f5d

Executed checks (actually run against the frozen bytes; line numbers are from the captured files):
grep/section reads of sqlwal.html §1 (l.178), §2.2 (l.285–295), §7 (l.599–631), §8 (l.633–670),
§9 (l.672–707), §11 (l.739–835), sync passages (l.315–346, 369–374); wal.c header (l.125–140),
sqlite3WalBeginWriteTransaction (l.3690–3735), walIndexRecover comment (l.1376–1391);
sqlpragma.html synchronous (l.1856 ff) and locking_mode (l.1376 ff); corpus-wide grep for
"network filesystem" (sqlwal.html l.178, l.291 only; sqlpragma.html: none) and for
BUSY_SNAPSHOT in wal.html (none — it is a wal.c-level code path only).

## Assumption-by-assumption verdicts (draft points 1–7; point 8 is breadth, reserved)

A1. "WAL is invalid on this topology" — **ACCEPTED.**
wal.html §1: "All processes using a database must be on the same host computer; WAL does not
work over a network filesystem. This is because WAL requires all processes to share a small
amount of memory and processes on separate host machines obviously cannot share memory with
each other." §2.2: wal-index "maintained in shared memory… the use of shared memory means that
all readers must exist on the same machine. This is why the write-ahead log implementation
will not work on a network filesystem." §7: only reliable shared memory is "mmapping a file in
the same directory as the database itself" (the `-shm` file). wal.c l.129–137: "Because the
wal-index is shared memory, SQLite does not support journal_mode=WAL on a network filesystem.
All users of the database must be able to share memory." The draft's inference that no network
filesystem is documented as supported holds: the corpus states the restriction categorically
and unconditionally. Corroborating check: corpus grep shows the network-filesystem restriction
appears only as an unconditional statement (wal.html l.178, l.291; wal.c l.131–133), never with
a mount-type carve-out.

A2. "Single writer — native to WAL, but only per host" — **ACCEPTED** (one sub-claim is
inference, labeled). wal.html §2.2: "since there is only one WAL file, there can only be one
writer at a time." wal.c sqlite3WalBeginWriteTransaction (l.3714–3727): "Only one writer
allowed at a time. Get the write lock. Return SQLITE_BUSY if unable"; SQLITE_BUSY_SNAPSHOT
returned when the wal-index header changed since the reader's snapshot (l.3722–3727).
Note: BUSY_SNAPSHOT is not named in wal.html (grep: none); it is documented only in the
3.51.3 code — recorded as an executed supplementary check. The cross-host non-enforcement
claim ("SQLite enforces nothing cross-host") is NOT directly documented; it follows from A1
(no shared wal-index across hosts ⇒ no shared WRITER lock semantics). Accepted as a sound
inference, condition: it must be stated as inferred, not as a documented limitation.

A3. "Restart recovery — documented, single-host only" — **ACCEPTED.** wal.html §9 (third BUSY
case): "If the last connection to a database crashed, then the first new connection to open
the database will start a recovery process. An exclusive lock is held during recovery…" and a
third connection gets SQLITE_BUSY. wal.c walIndexRecover (l.1376–1391): exclusive locks, "If
unable to establish the necessary locks, this routine returns SQLITE_BUSY"; wal-index is
"transient… reconstructed from the original WAL file" (wal.c l.138–140). The two-host
coherence caveat is the same inference as A1/A2 — accepted as inference.

A4. "No-shared-memory escape hatch does not apply" — **ACCEPTED.** wal.html §8: WAL without
shared memory requires locking_mode=EXCLUSIVE "before the first attempted access" and works
only if the process "is guaranteed to be the only process accessing the database"; the
connection "remains in EXCLUSIVE mode as long as the journal mode is WAL"; PRAGMA
locking_mode=NORMAL is a no-op in that state; only exiting WAL mode releases EXCLUSIVE.
pragma.html locking_mode: "WAL databases can be accessed in EXCLUSIVE mode without the use of
shared memory." Single-connection scope confirmed ⇒ cannot repair a two-host recommendation.
Related: §7's custom-VFS alternative (wal-index in heap memory) applies only when the database
"is only accessed by threads within a single process" — also cannot repair two-host.

A5. Deployment shape (draft's selected recommendation) — **ACCEPTED, with governing
conditions.** Its load-bearing dependencies A1–A4 all verify. Conditions: (a) the second host
must reach the data only through the application-level path, never by opening the database
file directly from the mount in any journal mode; (b) the app-level path must serialize writes
before they reach the single-host SQLite instance, since no SQLite mechanism enforces
cross-host serialization (A2 inference); (c) the draft's own unresolved item — whether direct
multi-host access in rollback (DELETE) mode over a network mount is acceptable — is genuinely
unresolved IN CORPUS: neither wal.html nor pragma.html documents rollback-journal behavior on
network filesystems (grep: no network-filesystem mention in pragma.html; wal.html's only
network mentions are the WAL restriction). This stays open for the protected reserve phase;
the recommendation does not depend on resolving it because it routes around direct access.

A6. Version condition "remain on 3.51.3 or later" — **ACCEPTED with a small amendment.**
wal.html §11: WAL-reset bug "likely present in all version of SQLite from 3.7.0 (2010-07-21)
through 3.51.2 (2026-01-09). It is fixed in version 3.51.3 (2026-03-13) and later. Backports…
3.44.6 and 3.50.7." Affects WAL-mode databases with two or more connections "in separate
threads or processes… attempt[ing] to write or checkpoint at the same instant." §11.2: wild
occurrence rate "less than or equal to the expected occurrence rate of SSD malfunctions
and/or cosmic-ray hits"; "this is not an emergency." Amendment 1: the draft says the bug
"affects 3.7.0–3.51.2"; the doc says "likely present" — keep the hedge. Amendment 2 (new
evidence the draft missed): §11.2 UPDATE 2026-08-24 — Phil Eaton published an organic
reproducer without the test-control hook, which modestly raises practical salience but does
not change the not-an-emergency rating.

A7. Durability condition (synchronous NORMAL vs FULL in WAL) — **ACCEPTED.** pragma.html
synchronous: "WAL mode is safe from corruption with synchronous=NORMAL… WAL mode is always
consistent with synchronous=NORMAL, but WAL mode does lose durability. A transaction committed
in WAL mode with synchronous=NORMAL might roll back following a power loss or system crash."
"FULL is atomic, consistent, isolated, and durable (ACID) in WAL mode." wal.html l.329–331:
"Writers sync the WAL on every transaction commit if PRAGMA synchronous is set to FULL but
omit this sync if PRAGMA synchronous is set to NORMAL." Also confirmed: transactions durable
across application crashes regardless of setting; EXTRA is no different from FULL in WAL mode.
The product's power-loss tolerance is unstated in the question — condition stays open.

## Verdict tally
Accepted: A1, A2, A3, A4, A7. Accepted-with-conditions: A5. Accepted-with-amendment: A6.
Rejected: none. Unresolved (carried to protected reserve, not deletable): rollback-mode
behavior over network mounts (A5b); product power-loss tolerance (A7); reader-overlap profile
feeds the reserved breadth check (draft point 8).

Proposed-but-not-executed here: running sqlite3 3.51.3 on an actual NFS/SMB mount to observe
failure mode (out of scope: no execution of downloaded code; and corpus is capture-pinned).
No premium science key used; no sources outside the three pinned files consulted.

Timings: phase started ~22:47:10Z (after ticket 1), finished ~22:51:30Z — inside the 12-minute
critical phase ceiling. 6 source operations (4 section reads, 3 greps, 1 multi-grep), all
against frozen local bytes.
