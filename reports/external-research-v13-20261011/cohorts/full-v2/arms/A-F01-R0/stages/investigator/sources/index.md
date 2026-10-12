# Bounded source index

Full source identity and notes are in [source-map.json](../source-map.json). IDs are stable; do not silently rebind.

## SQLite: local durability and export
- S01–S02: WAL sidecars, checkpoints, same-host boundary and durability settings.
- S03–S04: Session changeset assumptions and app-owned conflict callbacks.
- S05–S07: consistent snapshots, recovery cautions and upstream crash-test design.
- S08–S09: pinned 3.50.0 identity and crash regression source (read, not run).

## CouchDB: replication
- S10–S11: 3.5.3 conflict/revision model and replication/attachment protocol.
- S12–S15: release history, issue #6126, fix PR #6129 and tagged coordinator code.

## Automerge: local-first CRDT
- S16–S18: versioned conflict API, merge rules and storage/compaction model.
- S19–S21: pinned v3.4.1 implementation, conflict tests and release identity (read, not run).
