# Bounded primary-source evidence

These notes preserve only the passages needed for this role. No full page capture or downloaded code was retained. Retrieval used direct opens of official SQLite URLs; web results did not expose exact per-open seconds. All opens occurred in the 2026-10-10 04:02–04:04 UTC session window.

## S1 — Write-Ahead Logging

- URL: https://www.sqlite.org/wal.html
- Version: page last updated 2026-08-25 19:42:39Z. The target product version 3.51.3 comes from the assignment.
- Retrieved by direct URL open; relevant locators: §§1, 2.2, 2.3, 3.2, 4, 5, 6, 11.
- Evidence notes: the page limits WAL to processes on one host because the wal-index needs shared memory; it describes concurrent readers with a single writer. Reader end marks can limit checkpoint progress, and sustained overlapping reads can prevent reset and permit unbounded growth while writes continue. SQLite 3.22.0 and later permit read-only WAL access under the documented sidecar, directory-write, or immutable conditions. The WAL is part of persistent database state. Ordinary completed checkpoints recycle rather than normally truncate the WAL. The page gives workload-dependent performance guidance, not a catalog-specific latency prediction. Section 11 reports the WAL-reset bug through 3.51.2 and fixed in 3.51.3; the trigger requires separate connections with a concurrent write/checkpoint timing window.
- Applicability: directly informs claims 1–4 and 6; local behavior and performance remain untested.

## S2 — Checkpoint a database

- URL: https://www.sqlite.org/c3ref/wal_checkpoint_v2.html
- Version: live, unversioned C API reference, consulted for the assignment's SQLite 3.51.3 target.
- Retrieved by direct URL open; relevant locators: PASSIVE and TRUNCATE mode descriptions, output parameters, return conditions.
- Evidence notes: PASSIVE checkpoints as many frames as possible without waiting and may be incomplete with concurrent readers or writers. TRUNCATE truncates to zero bytes immediately before a successful return. `pnLog` and `pnCkpt` report log and checkpointed frame counts when requested.
- Applicability: supports claim 5; the application’s actual API use has not been inspected.

## S3 — URI filenames

- URL: https://www.sqlite.org/uri.html
- Version: live, unversioned reference.
- Retrieved by direct URL open; relevant locator: §3.3, `immutable=1`.
- Evidence notes: the immutable flag asserts that the database cannot change, opens it read-only, and skips locking and change detection. If the assertion is false, SQLite may return incorrect results or `SQLITE_CORRUPT`.
- Applicability: qualifies claim 4; the proposed snapshot’s immutability is unknown.

No source retrieval failed. No local database probe, target-binary inspection, or performance benchmark was run. Acceptance checks in `verification.md` are proposed, not executed.
