# Evidence index — A-F01-A1

Stable IDs below refer to full identity records in the stage-root source-map.json. IDs are never rebound. That JSON carries each URL/path, version or commit status, locator, access UTC, observed operation, governing condition/default/exception, and applicability.

## Assigned input
- BRF-01 — assigned local survey brief; sole case input before exact plan release.

## Replication and revision history
- CDB-01 — [CouchDB 3.5 conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html): revision trees, hidden default winner, conflict enumeration, compaction/pruning.
- CDB-02 — [CouchDB replication protocol source](https://github.com/apache/couchdb/blob/main/src/docs/src/replication/protocol.rst): peer protocol, 409 conflicts, checkpoints.
- PDB-01 — [PouchDB replication guide](https://pouchdb.com/guides/replication.html): local peers, multi-master sync and retry.
- PDB-02 — [PouchDB conflict guide](https://pouchdb.com/guides/conflicts.html): concurrent offline branches and conflict APIs.
- PDB-07 — [PouchDB 8.0.0 release](https://github.com/apache/pouchdb/releases/tag/8.0.0): tombstones versus administrative purge.

## Attachments and project history
- PDB-03 — [PouchDB attachments guide](https://pouchdb.com/guides/attachments.html): default stub versus full binary payload.
- PDB-04 → PDB-05 → PDB-06 — issue [#8456](https://github.com/apache/pouchdb/issues/8456), merged fix and integration regression [#8460](https://github.com/apache/pouchdb/pull/8460/files), and shipped [7.3.0](https://github.com/apache/pouchdb/releases/tag/7.3.0).

## Local storage and recovery
- SQL-01 — [SQLite Session Extension](https://www.sqlite.org/sessionintro.html): manual changeset exchange and limitations.
- SQL-02 — [Session C API](https://www.sqlite.org/session.html): conflict callback choices and patchset limits.
- SQL-03 — [SQLite Atomic Commit](https://sqlite.org/atomiccommit.html): crash-test VFS and filesystem/flush caveats.

## CRDT and custom replication alternatives
- AM-01 — [Automerge conflicts](https://automerge.org/docs/reference/documents/conflicts/): multi-value conflicts and deterministic operation order.
- AM-02 — [Automerge merge rules](https://automerge.org/docs/reference/under-the-hood/merge-rules/): concurrent delete versus set.
- AM-03 — [Automerge storage](https://automerge.org/docs/reference/under-the-hood/storage/): stored changes and compaction case.
- AM-04 — [Automerge JS 3.3.2 release](https://github.com/SmartBear/automerge/releases/tag/js/automerge-3.3.2): concrete package tag to pin.
- RX-01 — [RxDB replication](https://rxdb.info/replication.html): checkpoint protocol and master-wins default.
