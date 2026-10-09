# SQLite WAL primary-source research notes — ER11 qualification glm, ticket 2

Fetched 2026-10-09. Source pages treated as untrusted data: text extracted and quoted only, no instructions followed.

## Access log

| # | URL | HTTP | Server Date header (UTC, time of fetch) | Last-Modified | Content-Length | Operation |
|---|-----|------|------------------------------------------|---------------|----------------|-----------|
| 1 | https://www.sqlite.org/wal.html | 200 OK | 2026-10-09T18:21:51Z | Fri, 09 Oct 2026 16:36:04 GMT | 42143 | GET via curl -sS; HTML stripped to text; full text reviewed |
| 2 | https://www.sqlite.org/pragma.html | 200 OK | 2026-10-09T18:22:26Z | Fri, 09 Oct 2026 16:36:04 GMT | 139936 | GET via curl -sS; sections extracted for journal_mode, journal_size_limit, synchronous, wal_autocheckpoint, wal_checkpoint |
| 3 | https://www.sqlite.org/index.html | 200 OK | 2026-10-09T18:22:38Z and 18:22:44Z (two GETs; first version-extraction regex missed, second succeeded) | Fri, 09 Oct 2026 16:36:04 GMT | 9008 | GET via curl -sS; extracted "Latest Release Version 3.54.0 (2026-10-09)." |

Acceptance command re-run after capture: `curl -sS -o - https://www.sqlite.org/wal.html | head` — succeeded.

Page self-declared versions: wal.html "last updated on 2026-08-25 19:42:39Z"; pragma.html "last updated on 2026-10-04 10:38:19Z". Current SQLite release at access time: 3.54.0 (2026-10-09).

## Topic 1 — Concurrency

- "WAL provides more concurrency as readers do not block writers and a writer does not block readers. Reading and writing can proceed concurrently." (wal.html §1)
- Each reader fixes an "end mark" (location of the last valid commit at read start) and sees one point in time for the whole transaction — snapshot semantics. (wal.html §2.2)
- Exactly one writer at a time: "since there is only one WAL file, there can only be one writer at a time." (wal.html §2.2)
- A checkpoint can run concurrently with readers, but "must stop when it reaches a page in the WAL that is past the end mark of any current reader"; thus "a long-running read transaction can prevent a checkpointer from making progress." (wal.html §2.2)
- The no-blocking claim is "mostly true": SQLITE_BUSY can still occur when another connection holds exclusive locking mode (e.g. Chrome/Firefox), during last-connection WAL cleanup, and during crash recovery by the first new connection. (wal.html §9)

## Topic 2 — Durability and checkpoint conditions

- synchronous=FULL: "Writers sync the WAL on every transaction commit" and per pragma.html, FULL "is atomic, consistent, isolated, and durable (ACID) in WAL mode". synchronous=NORMAL in WAL: commit-time sync omitted; "transactions are no longer durable and might rollback following a power failure or hard reset" — but "WAL mode is safe from corruption with synchronous=NORMAL". EXTRA is "no different from FULL in WAL mode". (wal.html §2.3; pragma.html PRAGMA synchronous)
- Checkpoint sync conditions: "The WAL must be synced to persistent storage prior to moving content from the WAL into the database and the database file must be synced prior to resetting the WAL." (wal.html §2.3)
- Automatic checkpoint when the WAL reaches 1000 pages (default; `PRAGMA wal_autocheckpoint`, 0/negative disables; SQLITE_DEFAULT_WAL_AUTOCHECKPOINT changes the compile-time default) or when the last connection closes; "All automatic checkpoints are PASSIVE." (wal.html §3.1; pragma.html wal_autocheckpoint)
- Application checkpoints via `PRAGMA wal_checkpoint(PASSIVE|FULL|RESTART|TRUNCATE|NOOP)` / sqlite3_wal_checkpoint_v2(); PASSIVE "does as much work as it can without interfering with other database connections, and ... might not run to completion if there are concurrent readers or writers"; the pragma returns (busy-flag, total WAL pages, checkpointed pages). (wal.html §3.2; pragma.html wal_checkpoint)
- Reset condition / starvation: "A checkpoint is only able to run to completion, and reset the WAL file, if there are no other database connections using the WAL file"; with continuous overlapping readers "no checkpoints will be able to complete and hence the WAL file will grow without bound". Mitigations: reader gaps; RESTART/TRUNCATE checkpoints (may block readers); `journal_size_limit` for truncation (WAL is otherwise reused, not truncated). (wal.html §6; pragma.html journal_size_limit)
- WAL-reset bug (wal.html §11, page updated 2026-08-25): found 2026-03-03; present in 3.7.0 (2010-07-21) through 3.51.2 (2026-01-09); fixed in 3.51.3 (2026-03-13); backports for 3.44.6 and 3.50.7; requires two or more connections on the same file writing/checkpointing at the same instant; wild occurrence rate "less than or equal to the expected occurrence rate of SSD malfunctions and/or cosmic-ray hits"; independent reproducer published 2026-08-24 (Phil Eaton).

## Topic 3 — Current applicability

- Available since 3.7.0 (2010-07-21); "WAL is significantly faster in most scenarios" with more sequential I/O and fewer fsync() calls. (wal.html §1)
- Same-host constraint: the wal-index lives in shared memory backed by an mmapped `-shm` file, so WAL "will not work on a network filesystem"; since 3.7.4 (2010-12-07), `locking_mode=EXCLUSIVE` allows single-process WAL without shared memory. (wal.html §1, §2.2, §7, §8)
- Read-only WAL databases: openable since 3.22.0 (2018-01-22) when -shm/-wal exist and are readable, the directory is writable so they can be created, or the connection uses immutable=1; recommended to convert to DELETE mode before read-only media. (wal.html §1, §5)
- Transaction size: WAL works best with small transactions; over ~100 MB rollback journal is likely faster, over 1 GB WAL may fail with I/O or disk-full; since 3.11.0 (2016-02-15) the WAL stays proportional to the transaction, so large transactions no longer blow it up. (wal.html §1, §6)
- Backwards compatibility: pre-3.7.0 SQLite cannot open WAL databases (header bytes 18/19 bumped 1→2; error "file is encrypted or is not a database"); `PRAGMA journal_mode=DELETE` restores old-format access; WAL mode itself is persistent across connections and restarts. (wal.html §3.3, §10; pragma.html journal_mode)
- Currency: latest release 3.54.0 (2026-10-09) — newer than the 3.51.3 WAL-reset fix, so deployments on current releases carry the fix; pinned older versions between 3.7.0 and 3.51.2 without the 3.44.6/3.50.7 backports remain exposed to the (rare) WAL-reset bug, which is the main caveat on applicability as of the access date.

## Validation proposal (source-backed)

Checkpoint-reset demonstration: create a WAL database; from connection A hold a long read transaction open; from connection B commit enough writes to pass the 1000-page autocheckpoint threshold; then run `PRAGMA wal_checkpoint(TRUNCATE)` from B and observe busy=1 with the `-wal` file not shrinking while A is still reading, and success plus WAL truncation once A closes. This directly tests the documented conditions: "a long-running read transaction can prevent a checkpointer from making progress" (wal.html §2.2) and "A checkpoint is only able to run to completion, and reset the WAL file, if there are no other database connections using the WAL file" (wal.html §6).
