# D-M07-A v3 — document-order working notes (ticket 2)

Reviewer pass over `common/fresh-untrusted-seed-v3/draft.md` in normal document order (¶1→¶8),
adjudicated against the three verified frozen sources:
- `sources/sqlwal.html` — SQLite WAL docs capture 2026-10-07, page updated 2026-08-25 (sha256 f3467b53…)
- `sources/sqlwalcode.c` — sqlite/sqlite tag version-3.51.3 src/wal.c (sha256 100980ad…)
- `sources/sqlpragma.html` — SQLite PRAGMA docs capture 2026-10-07 (sha256 b9bcb335…)

Actually-executed checks this pass: sha256 verification of all three captures (ticket 1); full-text
extraction of wal.html §1, §2.2, §3.1, §3.2, §6, §7, §8, §9, §11, §11.1, §11.2; wal.c symbol/line
checks (network-fs comment ~L132, `walIndexRecover` L1384, `sqlite3WalBeginWriteTransaction` L3690,
`SQLITE_BUSY_SNAPSHOT` L3727); pragma.html sections synchronous / wal_autocheckpoint / wal_checkpoint /
journal_size_limit / busy_timeout / locking_mode; corpus-wide `grep -i network` across all three files.
No external fetches, no code execution. Proposed-but-not-executed checks are marked per item below.

## Obligation 1 — deployment assumptions that can invalidate the recommendation (draft ¶1)
VERDICT: **accepted** (with citation confirmation).
- wal.html §1 verbatim: "All processes using a database must be on the same host computer; WAL does
  not work over a network filesystem." §2.2: shared-memory wal-index means "all readers must exist on
  the same machine. This is why the write-ahead log implementation will not work on a network
  filesystem." §7: wal-index is an mmap'd file beside the database (the `-shm` file).
- wal.c L132–135: "SQLite does not support journal_mode=WAL on a network filesystem. All users of the
  database must be able to share memory." Implementation-level confirmation, stronger than docs alone.
- Draft's uncertainty (mount technology unrecorded; all network filesystems treated as unsupported) is
  honest and matches the corpus. [proposed, not executed: identifying the actual mount type on the
  product hosts]

## Obligation 2 — locking/shared-memory and host-location (draft ¶2, ¶4)
VERDICT: ¶2 **accepted**; ¶4 **accepted with a minor amendment**.
- ¶2: wal.html §2.2 "there can only be one writer at a time"; wal.c L3690+ "Only one writer allowed at
  a time. Get the write lock. Return SQLITE_BUSY if unable"; L3727 `SQLITE_BUSY_SNAPSHOT` when the
  wal-index header changed since the reader's snapshot — exactly as drafted. Cross-host enforcement
  gap follows from the shared-memory requirement; corpus concurs.
- ¶4: wal.html §8 — WAL without shared memory requires `locking_mode=EXCLUSIVE` before first access,
  connection remains EXCLUSIVE while WAL, `PRAGMA locking_mode=NORMAL` is a no-op, exit only via
  leaving WAL mode; pragma.html locking_mode confirms ("WAL databases can be accessed in EXCLUSIVE
  mode without the use of shared memory"). Amendment: the draft says this "serves a single connection
  only"; §8's guarantee is "that process is guaranteed to be the only process accessing the database"
  (single exclusive process, not literally one connection). Conclusion unchanged: cannot repair a
  two-host recommendation.

## Obligation 3 — recovery and checkpoint claims (draft ¶3, ¶6)
VERDICT: ¶3 **accepted**; ¶6 **accepted with a minor amendment**.
- ¶3: wal.html §9 — after a crash the first new connection runs recovery holding an exclusive lock;
  connections jumping in during recovery get SQLITE_BUSY. wal.c `walIndexRecover` (L1384) doc:
  "Recover the wal-index by reading the write-ahead log file… exclusive lock… If unable… returns
  SQLITE_BUSY"; header comment: "The wal-index is transient. After a crash, the wal-index can (and
  should be) reconstructed from the original WAL file."
- ¶6: wal.html §11 — bug "likely present" 3.7.0–3.51.2, fixed in 3.51.3, backports for 3.44.6 and
  3.50.7; affects WAL mode with two or more connections attempting write/checkpoint "at the same
  instant"; §11.2 occurrence "less than or equal to the expected occurrence rate of SSD malfunctions
  and/or cosmic-ray hits", "not an emergency" but "should upgrade". Amendments: (a) preserve the
  corpus's "likely present" hedge; (b) the draft omits §11.2's 2026-08-24 update that an organic
  reproducer (Phil Eaton) now exists — mildly strengthens the upgrade case; (c) "3.51.3 or later"
  should read "3.51.3+, or a backported 3.44.6/3.50.7".

## Obligation 4 — preserve lower-risk operational advice that is supported (draft ¶5, ¶7)
VERDICT: ¶5 **accepted** (deployment shape + honest unresolved item); ¶7 **accepted**.
- ¶5 one-host shape follows directly from §1/§2.2/§7 + wal.c L132. The unresolved item (rollback
  journal over network mounts) was checked, not assumed: corpus-wide `grep -i network` finds only
  wal.c L132 (WAL-specific). Neither pragma.html journal_mode nor wal.html documents DELETE-mode
  behavior over network mounts. "Unresolved, marked for a later primary-source check" is the correct
  disposition. [proposed, not executed: that later check against sqlite.org fileformat/lockingv3 docs]
- ¶7: pragma.html synchronous — "WAL mode is safe from corruption with synchronous=NORMAL… always
  consistent… but WAL mode does lose durability. A transaction committed in WAL mode with
  synchronous=NORMAL might roll back following a power loss or system crash"; FULL "is atomic,
  consistent, isolated, and durable (ACID) in WAL mode". Draft's "per-commit WAL sync" mechanism
  phrasing is an inference from FULL's durability guarantee (corpus says FULL syncs "prior to
  continuing"); substantively supported. Unresolved power-loss tolerance is a product requirement
  outside the corpus. [proposed, not executed: obtaining the product's durability requirement]

## Obligation 5 — optional maintenance lead, kept in scope (draft ¶8)
VERDICT: **accepted with a minor amendment**.
- wal.html §3.1 default auto-checkpoint at 1000 pages; §3.2 default/all-automatic checkpoints PASSIVE;
  §6 checkpoint starvation ("if a database has many concurrent overlapping readers and there is always
  at least one active reader, then no checkpoints will be able to complete and hence the WAL file will
  grow without bound"), reader-gaps advice, RESTART/TRUNCATE run to completion, §6 notes WAL is not
  normally truncated "unless the journal_size_limit pragma is set".
- pragma.html: wal_autocheckpoint "All automatic checkpoints are PASSIVE… default… interval of 1000";
  wal_checkpoint PASSIVE/FULL/RESTART/TRUNCATE modes all present; journal_size_limit limits
  rollback-journal/WAL file size after transactions/checkpoints; busy_timeout sets the busy handler.
- Amendment: draft omits §6's stated disadvantage that RESTART/TRUNCATE may block readers while
  running — a governing condition for scheduling them "during reader gaps". Keep both in final.
- Draft's measurement caveat is honest. [proposed, not executed: workload reader-overlap measurement]

## Obligation 6 — complete dispositions with sources
Dispositions table for final.md (accepted/amended/rejected/unresolved across all eight paragraphs;
nothing in the draft warrants outright rejection):
| Draft ¶ | Topic | Disposition |
|---|---|---|
| 1 | WAL invalid over network filesystem | accepted |
| 2 | single writer, per-host only; BUSY/BUSY_SNAPSHOT | accepted |
| 3 | crash recovery rebuilds wal-index, BUSY during | accepted |
| 4 | no-shared-memory escape hatch inapplicable | amended (single exclusive process, not "single connection") |
| 5 | keep access on file host; serve second host via app path | accepted (rollback-over-network unresolved) |
| 6 | stay ≥3.51.3, backports 3.44.6/3.50.7; low wild rate | amended (keep "likely"; add organic-reproducer update; add backport alternative) |
| 7 | synchronous NORMAL vs FULL durability in WAL | accepted |
| 8 | bound WAL growth (starvation, RESTART/TRUNCATE, journal_size_limit, busy_timeout) | amended (add readers-may-block condition) |

Check-status ledger: executed = hash verification, full-text source extraction, wal.c symbol checks,
corpus network-absence grep; proposed = mount-type identification, rollback-over-network primary
check, product durability requirement, reader-overlap measurement.

Limitations: evidence is capture-pinned (wal.html/pragma.html 2026-10-07; wal.c tag version-3.51.3);
no runtime reproduction attempted (corpus forbids executing downloaded code); version statements about
3.51.x are trusted to the frozen capture, not independently re-fetched.
