# S1 evidence — SQLite Write-Ahead Logging (https://www.sqlite.org/wal.html)

Retrieval: provider web_fetch on 2026-10-10 between 04:03:00Z and 04:03:59Z (UTC day-session;
exact per-fetch second not recorded). Corpus base source S1; page footer carries its own
last-updated stamp. Excerpts below are verbatim quotes captured in this session.

## Concurrency (sec. 2.2) — single writer
> "Writers merely append new content to the end of the WAL file. Because writers do
> nothing that would interfere with the actions of readers, writers and readers can run
> at the same time. However, since there is only one WAL file, there can only be one
> writer at a time."

## Checkpoint vs readers (sec. 2.2)
> "A checkpoint operation takes content from the WAL file and transfers it back into the
> original database file. A checkpoint can run concurrently with readers, however the
> checkpoint must stop when it reaches a page in the WAL that is past the end mark of
> any current reader."
> "Thus a long-running read transaction can prevent a checkpointer from making progress.
> But presumably every read transaction will eventually end and the checkpointer will be
> able to continue."
> "Whenever a write operation occurs, the writer checks how much progress the
> checkpointer has made, and if the entire WAL has been transferred into the database
> and synced and if no readers are making use of the WAL, then the writer will rewind
> the WAL back to the beginning ... This mechanism prevents a WAL file from growing
> without bound."

## Same-host / network filesystem (Overview disadvantage 1; sec. 2.2)
> "All processes using a database must be on the same host computer; WAL does not work
> over a network filesystem."
> "the use of shared memory means that all readers must exist on the same machine. This
> is why the write-ahead log implementation will not work on a network filesystem."

## Application-initiated checkpoints (sec. 3.2)
> "The default checkpoint style is PASSIVE, which does as much work as it can without
> interfering with other database connections, and which might not run to completion if
> there are concurrent readers or writers."

## Read-only databases (sec. 5)
> "On newer versions of SQLite, a WAL-mode database on read-only media, or a WAL-mode
> database that lacks write permission, can still be read as long as one or more of the
> following conditions are met: 1. The -shm and -wal files already exist and are
> readable. 2. There is write permission on the directory containing the database so
> that the -shm and -wal files can be created. 3. The database connection is opened
> using the immutable query parameter."
Relaxation "beginning with SQLite version 3.22.0 (2018-01-22)". Good practice note:
convert to journal_mode=DELETE before burning an image onto read-only media.

## WAL growth (sec. 6)
> "The checkpoint does not normally truncate the WAL file (unless the journal_size_limit
> pragma is set). Instead, it merely causes SQLite to start overwriting the WAL file
> from the beginning."
> "A checkpoint is only able to run to completion, and reset the WAL file, if there are
> no other database connections using the WAL file."
> "if a database has many concurrent overlapping readers and there is always at least
> one active reader, then no checkpoints will be able to complete and hence the WAL
> file will grow without bound."

## Performance (sec. 2.3; Overview)
> "WAL is significantly faster in most scenarios." BUT read performance "deteriorates as
> the WAL file grows"; checkpoint tradeoffs "may therefore vary from one application to
> another"; default 1000-page strategy "seems to work well in test applications on
> workstations, but other strategies might work better on different platforms or for
> different workloads."
No p95 metric and no 40% figure appear on this page.
