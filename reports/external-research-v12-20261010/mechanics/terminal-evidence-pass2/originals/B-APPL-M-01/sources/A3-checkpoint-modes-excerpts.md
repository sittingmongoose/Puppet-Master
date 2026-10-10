# A3 evidence — checkpoint mode constants (additional primary 3 of 3)
URL: https://www.sqlite.org/c3ref/c_checkpoint_full.html

Retrieval: provider web_fetch on 2026-10-10 between 04:03:59Z and 04:05:30Z (UTC day-session;
exact per-fetch second not recorded). Within the 8-additional-page allowance.

## Verbatim
> "#define SQLITE_CHECKPOINT_NOOP    -1  /* Do no work at all */"
> "#define SQLITE_CHECKPOINT_PASSIVE  0  /* Do as much as possible w/o blocking */"
> "#define SQLITE_CHECKPOINT_FULL     1  /* Wait for writers, then checkpoint */"
> "#define SQLITE_CHECKPOINT_RESTART  2  /* Like FULL but wait for readers */"
> "#define SQLITE_CHECKPOINT_TRUNCATE 3  /* Like RESTART but also truncate WAL */"

Relevance: only TRUNCATE truncates; PASSIVE is defined as best-effort without blocking.
Defers to S2 for full mode semantics.
