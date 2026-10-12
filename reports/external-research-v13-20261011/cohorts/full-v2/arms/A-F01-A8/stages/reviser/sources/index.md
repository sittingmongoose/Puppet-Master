# Reviser source index — A-F01-A8

This navigable index links all inherited IDs without rebinding them. Exact release/commit identity, locator, original and critic access records, conditions, applicability, and this stage's independent SCW rechecks are in [source-map.json](../source-map.json). The six SCW rechecks use a captured pre-fetch UTC time of 2026-10-12T01:13:06Z; the retrieval tool shows “crawled today” and does not expose an independent server fetch timestamp or docs build pin.

## SQLite local persistence, WAL and backup

- [S01 — SQLite Write-Ahead Logging](https://www.sqlite.org/wal.html): WAL shared-host limit, one writer, persistent `-wal`, reader end marks, checkpoint delay/starvation, durability settings, and WAL-reset release context. Independently rechecked for SCW-01 and SCW-06.
- [S02 — Atomic Commit In SQLite](https://www.sqlite.org/atomiccommit.html): one DB transaction and documented platform assumptions; no cross-file atomicity.
- [S03 — SQLite Online Backup API](https://www.sqlite.org/backup.html): coherent database snapshot and external-copy limitations. Independently rechecked for SCW-01.
- [S04 — SQLite 3.54.0 release](https://www.sqlite.org/releaselog/3_54_0.html): official release/source ID context; not an adoption mandate.
- [S05 — SQLite rollback-journal crash tests](https://github.com/sqlite/sqlite/blob/version-3.54.0/test/crash.test) and [S06 — SQLite WAL crash tests](https://github.com/sqlite/sqlite/blob/version-3.54.0/test/walcrash.test): scenario references; not run as this product's tests.
- [S07 — SQLite WAL implementation](https://github.com/sqlite/sqlite/blob/version-3.54.0/src/wal.c): release-tagged upstream mirror; code-level WAL context.

## Multi-master document replication, conflicts, deletion and attachments

- [S08 — CouchDB 3.5 replication/conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html): deterministic ordinary-read winner, conflict branch retrieval, compaction/pruning. Independently rechecked for SCW-03.
- [S09 — CouchDB 3.5 replication introduction](https://docs.couchdb.org/en/stable/replication/intro.html): tombstone revision propagation; content-dependent-filter deleted-body condition and workaround. Independently rechecked for SCW-02.
- [S10 — CouchDB document attachments API](https://docs.couchdb.org/en/stable/api/document/common.html): metadata vs explicit attachment bytes; replication behavior still needs validation.
- [S11 — PouchDB replication guide](https://pouchdb.com/guides/replication.html): local/remote sync and retry conditions; moving guide.
- [S12 — PouchDB conflict guide](https://pouchdb.com/guides/conflicts.html): offline eventual conflict and conflict-aware read behavior; moving guide. Independently rechecked for SCW-03.
- [S13 — PouchDB attachment guide](https://pouchdb.com/guides/attachments.html): metadata/stub versus bytes; moving guide.
- [S14 — PouchDB integration conflict tests](https://github.com/apache/pouchdb/blob/master/tests/integration/test.conflicts.js): moving `master` source, no commit exposed; explicit re-put-after-delete test. Independently rechecked for SCW-04; test not executed.
- [S15 — PouchDB issue #9085](https://github.com/apache/pouchdb/issues/9085): open, scoped low-`revs_limit` user report; not a confirmed general defect. Independently rechecked for SCW-04.
- [S21 — PouchDB release history](https://github.com/apache/pouchdb/releases): recorded 9.0.0 release identity context; does not pin moving docs/tests.

## Local-first CRDT, identity and file integrity

- [S16 — Automerge conflict semantics](https://automerge.org/docs/reference/documents/conflicts/): deterministic visible value and conflict metadata; moving docs, JS release context only.
- [S17 — Automerge merge rules](https://automerge.org/docs/reference/under-the-hood/merge-rules/): map-key delete/set rule; moving docs, not an observation tombstone policy. Independently rechecked for SCW-05.
- [S18 — Automerge releases](https://github.com/automerge/automerge/releases): JS v3.4.1 context; Rust crate/binding is not inferred.
- [S19 — RFC 9562 UUIDs](https://www.rfc-editor.org/rfc/rfc9562.html): UUIDv4 random identity and UUIDv7 timestamp field; uniqueness is probabilistic.
- [S20 — NIST FIPS 180-4](https://csrc.nist.gov/files/pubs/fips/180-4/final/docs/fips180-4.pdf): SHA-256 integrity; does not authenticate or encrypt.

## Recheck disposition

All six frozen SCW records are adjudicated in [final.md](../final.md#independent-adjudication-of-all-six-selected-scw-records). S01/S03, S08/S09/S12/S14/S15/S17 carry direct reviser records in the source map. Other inherited sources remain identified by their original investigator/critic records; they were not silently recast as independently reopened in this stage.
