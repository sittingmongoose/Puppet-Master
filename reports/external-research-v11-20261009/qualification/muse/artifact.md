# ER11 SQLite WAL route qualification (component evidence)

Scope: public primary SQLite documentation only. Distinguish concurrency from durability/checkpoint conditions, note current applicability, and propose one validation.

## 1. Concurrency

WAL readers take an "end mark" (last valid commit in the WAL) at read-transaction start and see that snapshot for the transaction lifetime. A page is served from the last WAL copy at or before the end mark, else from the database file. A shared-memory `wal-index` avoids full WAL scans (https://www.sqlite.org/wal.html §2.2).

Consequence: readers do not block writers and writers do not block readers. But there is only one WAL file, so only one writer at a time. A checkpoint can run with readers but must stop before any frame past any active reader's end mark, recording progress and resuming later; a long-running reader can therefore stall checkpoint completion. A writer rewinds the WAL to the beginning only when all frames are checkpointed and synced and no reader is using the WAL.

`SQLITE_BUSY` remains possible in WAL mode: exclusive `locking_mode`, last-connection close cleanup, and crash-recovery all take a brief exclusive lock (https://www.sqlite.org/wal.html §9).

## 2. Durability and checkpoint conditions

A checkpoint copies WAL frames back into the database. Default policy is automatic checkpoint when the WAL reaches 1000 pages (`SQLITE_DEFAULT_WAL_AUTOCHECKPOINT`), and when the last connection closes. `PRAGMA wal_autocheckpoint=N` changes this; `N<=0` disables it; all automatic checkpoints are `PASSIVE` (https://www.sqlite.org/pragma.html#pragma_wal_autocheckpoint; https://www.sqlite.org/wal.html §3.1).

`PRAGMA wal_checkpoint(PASSIVE|FULL|RESTART|TRUNCATE|NOOP)` maps to `sqlite3_wal_checkpoint_v2`: `PASSIVE` never waits and never invokes the busy handler; `FULL` waits for no writer and all readers on the latest snapshot, then checkpoints and syncs; `RESTART` additionally waits for readers to leave the log so the next write restarts at offset zero; `TRUNCATE` also truncates the WAL; `NOOP` returns status only. The pragma returns `(busy, log_frames, checkpointed_frames)`, or `(0|-1,-1)` when not in WAL (https://www.sqlite.org/pragma.html#pragma_wal_checkpoint).

Durability is governed by `PRAGMA synchronous`: with `FULL`, writers sync the WAL each commit; with `NORMAL`, they omit it and the checkpoint is the only sync, so WAL stays consistent but a committed transaction may roll back after power loss or OS crash. Application-crash durability holds regardless of setting. `FULL` is ACID in WAL; `EXTRA` equals `FULL` in WAL (https://www.sqlite.org/pragma.html#pragma_synchronous; https://www.sqlite.org/wal.html §2.3). A checkpoint must sync the WAL before copying and sync the database before resetting the WAL.

## 3. Current applicability

WAL exists since 3.7.0 (2010-07-21), sets header versions 1→2, and persists `journal_mode=WAL` across close/reopen for all connections; `page_size` cannot change in WAL mode. All processes must share memory on one host; WAL does not work over network filesystems (`-shm`/`-wal` beside the database). Single-process no-shared-memory use is allowed only if `locking_mode=EXCLUSIVE` before first WAL access (since 3.7.4). Read-only WAL open was relaxed in 3.22.0 (2018-01-22) when `-shm`/`-wal` exist/readable, the directory is writable, or `immutable=1`. Large-transaction WAL efficiency dates to 3.11.0. Multi-database `ATTACH` transactions are atomic per database, not across databases. The 2026-03 WAL-reset race (two connections writing/checkpointing simultaneously) is fixed in 3.51.3 (2026-03-13), backported to 3.44.6 and 3.50.7 (https://www.sqlite.org/wal.html §1, §4–§8, §10–§11).

## 4. Source-backed validation proposal

With `journal_mode=WAL` and `wal_autocheckpoint=0`: open reader R with an open read transaction, commit N pages on writer W, then run `PRAGMA wal_checkpoint(PASSIVE)` and record `(busy, log_frames, checkpointed_frames)`; run `PRAGMA wal_checkpoint(RESTART)` and record blocking behavior; close R and rerun checkpoint to completion. Expected per sources: `PASSIVE` makes partial progress without waiting, `RESTART` reports busy/completes only after R ends, and the post-R checkpoint advances `checkpointed_frames` to `log_frames`. This directly tests §2.2/§3 checkpoint-vs-reader conditions using only documented pragma outputs.
