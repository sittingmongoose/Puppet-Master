# A2 evidence — SQLite over a network, caveats (additional primary 2 of 3)
URL: https://www.sqlite.org/useovernet.html

Retrieval: provider web_fetch on 2026-10-10 between 04:03:00Z and 04:04:30Z (UTC day-session;
exact per-fetch second not recorded). Within the 8-additional-page allowance.
Page footer: last updated 2022-06-22 (page's own stamp; older than S1/S2).

## Verbatim
> "This simple, 'remote database' approach is usually not the best way to use a single
> SQLite database from multiple systems, (even if it appears to 'work'), as it often
> leads to various kinds of trouble and grief."
> "SQLite relies on exclusive locks for write operations, and those have been known to
> operate incorrectly for some network filesystems. This has led to database
> corruption."
> "The bottom line is that network filesystem sync and locking reliability vary among
> implementations and installations."
> "Hence, use of a remote database is done at the user's risk."
> "Network filesystems do not support the ability to do simultaneous reads and writes
> while at the same time keeping the database consistent."
> Choice 2: "Host an SQLite database in WAL mode, but do all reads and writes from
> processes on the same machine that stores the database file. Implement a proxy that
> runs on the database machine that relays read/write requests from remote machines."

Relevance: corroborates S1 that unchanged multi-process WAL design must not move to a
multi-host NFS mount; supported remote patterns are different deployments (proxy /
client-server), not the same design on NFS.
