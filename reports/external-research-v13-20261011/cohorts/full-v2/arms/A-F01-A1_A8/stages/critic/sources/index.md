# Critic source index

This is the critic’s navigable index for the carried source map and independently reopened primary evidence. IDs S01–S21 keep the investigator’s exact URL bindings; S22–S23 are additional sources. Full source identities, access windows, conditions, and critic-review notes are in ../source-map.json. Selected scope-bearing excerpts and applicability are in ../critique.md under SCW-01 through SCW-06.

## SQLite
- [S01 — Session Extension introduction](https://www.sqlite.org/sessionintro.html): optional build flags and primary-key/table limitations.
- [S02 — Session API](https://www.sqlite.org/session.html): carried API evidence; not used to claim app-specific history.
- [S03 — WAL](https://www.sqlite.org/wal.html): same-host limit, WAL sidecar and FULL/NORMAL sync behavior.
- [S04 — PRAGMA synchronous](https://www.sqlite.org/pragma.html): FULL versus NORMAL durability and consistency matrix.
- [S05 — Online Backup API](https://www.sqlite.org/backup.html): consistent snapshot semantics, distinct from replica merge.
- [S06 — Release history](https://www.sqlite.org/changes.html): 3.54.0 release entry dated 2026-10-09.
- [S23 — Atomic commit and hardware assumptions](https://www.sqlite.org/atomiccommit.html): sync/flush assumptions and failure caveat; critic addition.

## Automerge
- [S07 — Document conflicts](https://automerge.org/docs/reference/documents/conflicts/): deterministic winner and conflict retention.
- [S08 — JavaScript implementation at js/automerge-3.4.1](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/javascript/src/implementation.ts): tagged JS conflict API.
- [S09 — v3.4.1 package metadata](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/javascript/package.json): carried package identity/test command.
- [S10 — v3.4.1 README](https://github.com/automerge/automerge/blob/js/automerge-3.4.1/README.md): carried language implementation overview.
- [S11 — Autosurgeon](https://github.com/automerge/autosurgeon): Rust mapping candidate; version/commit remains unpinned.
- [S12 — Issue 526](https://github.com/automerge/automerge/issues/526): nested object/array conflict reassignment report; release applicability unverified.
- [S13 — Issue 889](https://github.com/automerge/automerge/issues/889): report names 2.1.11; status correction recorded in critic source-map.

## CouchDB
- [S14 — Conflict handling](https://docs.couchdb.org/en/stable/replication/conflicts.html): basic GET, conflict revision IDs/bodies, compaction and pruning.
- [S15 — Replication introduction](https://docs.couchdb.org/en/stable/replication/intro.html): push/pull, checkpoints, deletion, selectors, and media caveats.
- [S16 — Attachment API](https://docs.couchdb.org/en/stable/api/document/common.html): metadata/stubs versus requested attachment content.
- [S17 — Document best practices](https://docs.couchdb.org/en/stable/best-practices/documents.html): carried revision-history guidance.
- [S18 — PR 6129](https://github.com/apache/couchdb/pull/6129): merged attachment revision fix and issue context.
- [S19 — PR 6129 changes/tests](https://github.com/apache/couchdb/pull/6129/files): carried diff and upstream checks attribution.
- [S20 — 3.5 release notes](https://docs.couchdb.org/en/stable/whatsnew/3.5.html): fix appears under Version 3.5.3; local package still unidentified.
- [S21 — PR 6025](https://github.com/apache/couchdb/pull/6025): carried durability-related fix lineage; not independently rechecked in this stage.
- [S22 — Replication protocol](https://docs.couchdb.org/en/stable/replication/protocol.html): critic addition; protocol transfers document attachment bodies as data, and describes upload of documents with attachments.
