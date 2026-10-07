# D-M07-A final — SQLite 3.51.3 on a network-mounted directory, reviewed in document order

Scope. Full-scope critic pass over the untrusted candidate draft
(`jobs/D-M07-A/common/fresh-untrusted-seed-v3/draft.md`), adjudicated in normal document order against
the frozen corpus. Every digest below was verified by executed `sha256sum` before use (paths under
`cases/D-M07-A/inputs/`):

- `sqlwal.html` — https://www.sqlite.org/wal.html, capture 2026-10-07, sha256 `f3467b530b883d4a00574fe1a898b3d121ed72764ae28cf66941080ac0badb9e`
- `sqlwalcode.c` — https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/wal.c, tag version-3.51.3, sha256 `100980ad092bcd2b722902b4b2f9927975cfa953d57eef521d7aed42918a39be`
- `sqlpragma.html` — https://www.sqlite.org/pragma.html, capture 2026-10-07, sha256 `b9bcb335ae818497f3fa05114a10492f64f35503f275da2264f2d5d436db3f5d`

Six obligations map onto eight findings: obligation 1 → Finding 1; obligation 2 → Findings 2–4;
obligation 3 → Findings 3 and 6; obligation 4 → Findings 5 and 7; obligation 5 → Finding 8; obligation
6 → the per-finding dispositions. Dispositions used: accepted / amended / rejected / unresolved.

### Finding 1 — WAL cannot be deployed on this topology (obligation 1; accepted)
wal.html §1 states verbatim: all processes using the database must be on the same host; "WAL does not
work over a network filesystem", because WAL requires shared memory. §2.2 repeats this for the
wal-index; §7 specifies its implementation as an mmap of the `-shm` file created beside the database;
wal.c L132–135 confirms at implementation level: "SQLite does not support journal_mode=WAL on a
network filesystem." **Governing condition:** the actual mount technology (NFS/SMB/other) is unrecorded;
no network filesystem is documented as supported, so all are treated as unsupported. This assumption
alone can invalidate the original recommendation.

### Finding 2 — single-writer enforcement exists only per host (obligation 2; accepted)
wal.html §2.2: one WAL file, one writer at a time. wal.c `sqlite3WalBeginWriteTransaction` (L3690)
takes the exclusive `WAL_WRITE_LOCK` and returns SQLITE_BUSY if held; L3727 returns
SQLITE_BUSY_SNAPSHOT when another connection committed since this connection's read snapshot. Across
two hosts there is no shared wal-index, so SQLite enforces nothing cross-host; retry loops cannot fix
what the platform does not enforce.

### Finding 3 — crash recovery is a single-host mechanism (obligations 2–3; accepted)
wal.html §9: after a crash, the first new connection runs recovery holding an exclusive lock; any other
connection that joins mid-recovery gets SQLITE_BUSY. wal.c `walIndexRecover` (L1384) rebuilds the
wal-index from the WAL file under that lock; the file header calls the wal-index transient and
reconstructible from the WAL. **Governing condition:** this presumes coherent shared memory; whether any
specific network mount provides it is untested here and cannot be assumed (unresolved).

### Finding 4 — the no-shared-memory escape hatch does not repair two-host access (obligation 2; amended)
wal.html §8: WAL without shared memory requires `locking_mode=EXCLUSIVE` before first access; the
connection stays EXCLUSIVE while in WAL, `PRAGMA locking_mode=NORMAL` is a no-op, and the only exit is
leaving WAL mode (pragma.html locking_mode concurs). **Amendment:** the draft says "single connection
only"; §8's guarantee is that one *process* has exclusive access to the database. Conclusion unchanged:
this cannot serve two hosts.

### Finding 5 — deployment shape, with one honestly unresolved item (obligation 4; accepted)
Keep all SQLite access on the host holding the files (WAL remains valid there); serve the second host
through an application-level access path instead of direct SQLite on the mount. **Unresolved:** the
corpus documents WAL's network exclusion but nothing about rollback-journal (DELETE) mode over network
mounts. This absence was checked, not assumed: a corpus-wide search for "network" hits only wal.c L132,
which is WAL-specific. Whether direct multi-host access in rollback mode is acceptable stays open and
is marked for a later primary-source check; do not assume it is safe.

### Finding 6 — version condition: ≥3.51.3 or a backport (obligation 3; amended)
wal.html §11: the WAL-reset corruption bug is *likely* present in 3.7.0–3.51.2, fixed in 3.51.3,
backported to 3.44.6 and 3.50.7; it needs two or more connections writing or checkpointing "at the same
instant". §11.2: wild occurrence ≤ SSD-malfunction/cosmic-ray rates; "not an emergency", but upgrade is
advised. **Amendments:** keep the corpus's "likely" hedge; add the 2026-08-24 update that an organic
reproducer (Phil Eaton) now exists, which slightly strengthens the upgrade case; state the alternative
as "3.51.3 or later *or* a patched 3.44.6/3.50.7".

### Finding 7 — durability is a product decision the corpus cannot make (obligation 4; accepted)
pragma.html synchronous: in WAL mode, NORMAL is corruption-safe and always consistent, but a committed
transaction may roll back after power loss; FULL is atomic, consistent, isolated, and durable (ACID) in
WAL. **Governing condition:** which level is required depends on the product's power-loss tolerance,
which the question does not state (unresolved). The draft's "per-commit WAL sync" phrasing is an
inference from FULL's durability guarantee, not corpus wording; substantively supported.

### Finding 8 — optional maintenance lead: bound WAL growth (obligation 5; amended, kept in scope)
Default auto-checkpoint runs at 1000 pages and is PASSIVE (wal.html §3.1, §3.2; pragma.html
wal_autocheckpoint). Continuously overlapping readers can starve checkpoints so the WAL grows without
bound, degrading reads and disk usage (wal.html §6). Remedies, all corpus-supported: schedule
`wal_checkpoint(RESTART)`/`(TRUNCATE)` during reader gaps and/or set `journal_size_limit` (the WAL is
otherwise not truncated on checkpoint), and set `busy_timeout` so BUSY contention retries.
**Governing condition the draft omitted:** §6 warns RESTART/TRUNCATE may block readers while running.
**Unresolved:** the workload's reader-overlap profile is unknown; thresholds need measurement before
adoption.

## Check ledger — proposed versus actually executed
Actually executed: sha256 verification of all three captures; full-text extraction of the cited wal.html
sections (§1, §2.2, §3.1–3.2, §6, §7, §8, §9, §11–11.2); wal.c symbol checks (L3690 writer lock, L3727
BUSY_SNAPSHOT, L1384 walIndexRecover, L132 network comment); extraction of the pragma.html sections for
synchronous, wal_autocheckpoint, wal_checkpoint, journal_size_limit, busy_timeout, locking_mode;
corpus-wide "network" absence grep. Proposed, not executed: identifying the product's mount type; the
later primary check on rollback-journal-over-network; obtaining the product's durability requirement;
measuring reader overlap before adopting checkpoint thresholds.

## Rejections, uncertainty, limitations
No draft claim warranted outright rejection; three were amended (Findings 4, 6, 8) and three items are
unresolved (Findings 3, 5, 7). Limitations: evidence is capture-pinned (docs 2026-10-07; wal.c tag
version-3.51.3), so release-history claims are trusted to the frozen bytes rather than re-fetched; no
additional primary sources were consulted beyond the corpus; no runtime reproduction was attempted, per
the no-execution rule for downloaded code.

## Delivery record
Stage T0 2026-10-07T22:36:18Z; final.md written 22:57Z; QA pass 22:58Z — inside the 30-minute stage
ceiling and the 23:26:18Z absolute deadline. Source operations: three sha256 verifications, one
full-text extraction pass per capture, wal.c line-range reads, one corpus-wide grep. Output: this file
was 7530 bytes before this section; simple timings and operation counts only. Billing unknown;
input/cache/generated counters null; raw cumulative counters kept separate.
