# Investigator source index

Source IDs are stable within this stage and map to the identity/condition records in ../source-map.json. Access interval for this batch: 2026-10-12 00:35:52–00:35:53 UTC; individual page timestamps were unavailable. Links are primary project/vendor documentation, source, or issue/PR pages.

## SQLite
- [S01 — Session Extension introduction](https://www.sqlite.org/sessionintro.html): optional compile-time extension, tracked-table limitations, changeset concepts.
- [S02 — Session API](https://www.sqlite.org/session.html): changeset conflict callbacks and coalescing behavior.
- [S03 — WAL](https://www.sqlite.org/wal.html): FULL/NORMAL sync behavior, same-host constraint, sidecar state.
- [S04 — PRAGMA synchronous](https://www.sqlite.org/pragma.html): local durability policy conditions.
- [S05 — Online Backup API](https://www.sqlite.org/backup.html): consistent snapshot API for active databases.
- [S06 — Release history](https://www.sqlite.org/changes.html): version chronology; 3.54.0 dated 2026-10-09.

## Automerge
- [S07 — Document conflicts](https://automerge.org/docs/reference/documents/conflicts/): exposed conflicts versus deterministic ordinary read.
- [S08 — v3.4.1 implementation](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/javascript/src/implementation.ts): tagged getConflicts implementation.
- [S09 — v3.4.1 package metadata](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/javascript/package.json): release identity and test command; command not executed.
- [S10 — v3.4.1 README](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/README.md): Rust core and interface overview.
- [S11 — Autosurgeon](https://github.com/automerge/autosurgeon): Rust mapping candidate; repository version/commit not pinned.
- [S12 — Issue 526](https://github.com/automerge/automerge/issues/526): nested object/array conflict reassignment report; v3.4.1 applicability unverified.
- [S13 — Issue 889](https://github.com/automerge/automerge/issues/889): no-op conflict report specifically cites 2.1.11; v3.4.1 applicability unverified.

## CouchDB
- [S14 — Conflict handling](https://docs.couchdb.org/en/stable/replication/conflicts.html): revision leaves, deterministic winner, tombstones, retention limits.
- [S15 — Replication introduction](https://docs.couchdb.org/en/stable/replication/intro.html): push/pull, checkpoints, deletes and filtering conditions.
- [S16 — Attachment API](https://docs.couchdb.org/en/stable/api/document/common.html): metadata/stubs versus content-byte transfer.
- [S17 — Document best practices](https://docs.couchdb.org/en/stable/best-practices/documents.html): application history beyond revision tree.
- [S18 — PR 6129](https://github.com/apache/couchdb/pull/6129) and [S19 — changed files/tests](https://github.com/apache/couchdb/pull/6129/files): merged attachment revision fix and upstream regression coverage; upstream CI result was not run here.
- [S20 — 3.5 release notes](https://docs.couchdb.org/en/stable/whatsnew/3.5.html): fix lineage under 3.5.3; package inclusion must be verified.
- [S21 — PR 6025](https://github.com/apache/couchdb/pull/6025): datasync after file reset/truncate fix history.

See each source-map record for the inspected locator, behavior/exception, and applicability. No source record asserts that upstream CI, an application test, crash test, benchmark, or local executable witness ran in this stage.
