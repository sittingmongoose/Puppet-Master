# S2 evidence — sqlite3_wal_checkpoint_v2 C reference
URL: https://www.sqlite.org/c3ref/wal_checkpoint_v2.html

Retrieval: provider web_fetch on 2026-10-10 between 04:03:00Z and 04:03:59Z (UTC day-session;
exact per-fetch second not recorded). Corpus base source S2; unversioned live C API URL.

## PASSIVE (verbatim)
> "Checkpoint as many frames as possible without waiting for any database readers or
> writers to finish, then sync the database file if all frames in the log were
> checkpointed. The busy-handler callback is never invoked in the
> SQLITE_CHECKPOINT_PASSIVE mode. On the other hand, passive mode might leave the
> checkpoint unfinished if there are concurrent readers or writers."

## TRUNCATE (verbatim)
> "This mode works the same way as SQLITE_CHECKPOINT_RESTART with the addition that it
> also truncates the log file to zero bytes just prior to a successful return."
> "Note that upon successful completion of an SQLITE_CHECKPOINT_TRUNCATE, the log file
> will have been truncated to zero bytes and so both *pnLog and *pnCkpt will be set
> to zero."

## Output parameters (verbatim, condensed)
pnLog = total frames in log, or -1 if checkpoint could not run (error / not WAL mode).
pnCkpt = total checkpointed frames (including previously checkpointed), or -1 likewise.
For attached-database NULL/empty zDb, values written to *pnLog/*pnCkpt are undefined.

## Busy degradation (verbatim, condensed)
FULL/RESTART/TRUNCATE obtain the exclusive writer lock and invoke the busy handler while
waiting; if the handler returns 0 before lock/readers clear, "the checkpoint operation
proceeds from that point in the same way as SQLITE_CHECKPOINT_PASSIVE" and SQLITE_BUSY
is returned. A concurrent checkpoint in another process returns SQLITE_BUSY without
invoking any busy handler.
