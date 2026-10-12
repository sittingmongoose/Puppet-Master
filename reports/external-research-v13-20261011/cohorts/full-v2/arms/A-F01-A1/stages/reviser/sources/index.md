# Evidence index — A-F01-A1 reviser

This index covers the assigned brief, released plan, frozen predecessor research, critic findings, and primary-source rechecks used in final.md. Stable IDs are preserved; the stage-root source-map.json contains exact versions/commits, locators, UTC access records, observed operations, governing conditions, applicability, and frozen local paths/hashes.

## Assigned inputs and prior-stage evidence

- **BRF-01** — Assigned survey brief.
- **INV-DISC-01** — Investigator’s brief-only discovery.
- **INV-DRAFT-01** — Investigator’s complete provisional proposal, plan dispositions, and proposed validation matrix.
- **PLAN-01** — Exact released draft plan, SHA-256 9415bac7a1feba432895879eaa283f75facac34896039a869facf5b620c1f8d4.
- **REVEAL-01** — One-time plan-release record binding discovery and plan hashes.
- **INV-SRCMAP-01** and **INV-INDEX-01** — Investigator’s identity map and source index.
- **CRIT-01** — Independent critic review with findings F-01 through F-09.
- **CRIT-SRCMAP-01** — Critic’s independent evidence map.

## Replication and conflicts

- **CDB-01** — [Apache CouchDB 3.5 conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html): concurrent branches, hidden default winner, conflict retrieval, compaction/pruning.
- **CDB-02** — [CouchDB replication protocol source](https://github.com/apache/couchdb/blob/main/src/docs/src/replication/protocol.rst): checkpoints and network behavior; not release-pinned.
- **PDB-01** — [PouchDB replication guide](https://pouchdb.com/guides/replication.html): local replication and retry after disconnection.
- **PDB-02** — [PouchDB conflict guide](https://pouchdb.com/guides/conflicts.html): offline branches and explicit conflict APIs.

## Photos and attachment history

- **PDB-03** — [PouchDB attachment guide](https://pouchdb.com/guides/attachments.html): metadata stub versus full payload.
- **PDB-04 → PDB-05 → PDB-06** — First-party issue [#8456](https://github.com/apache/pouchdb/issues/8456), [PR #8460 fix/diff](https://github.com/apache/pouchdb/pull/8460/files), pinned code and test URLs in the source map, then the [official release list](https://github.com/apache/pouchdb/releases) showing #8460 in 7.3.0. Test source was inspected, not executed.
- **PDB-07** — [PouchDB 8.0.0 deletion/purge release note](https://github.com/apache/pouchdb/releases/tag/8.0.0).

## Local transactions and crash recovery

- **SQL-01** — [SQLite Session Extension](https://www.sqlite.org/sessionintro.html): build, primary-key, schema, and coalescing conditions.
- **SQL-02** — [SQLite Session C API](https://www.sqlite.org/session.html): patchset conflict limits and experimental APIs.
- **SQL-03** — [SQLite atomic-commit documentation](https://sqlite.org/atomiccommit.html): simulated crash tests and platform flush assumptions.

## CRDT and custom replication alternatives

- **AM-01** — [Automerge conflict API](https://automerge.org/docs/reference/documents/conflicts/).
- **AM-02** — [Automerge merge rules](https://automerge.org/docs/reference/under-the-hood/merge-rules/).
- **AM-03** — [Automerge Repo storage and compaction](https://automerge.org/docs/reference/under-the-hood/storage/).
- **AM-04** — [Automerge JS 3.3.2 release tag](https://github.com/SmartBear/automerge/releases/tag/js/automerge-3.3.2), preserved from the investigator map and not reopened here.
- **RX-01** — [RxDB replication guide](https://rxdb.info/replication.html): custom backend and default conflict handler.

Direct reviser rechecks are recorded separately by stable ID in source-map.json. CDB-02 and AM-04 remain preserved lineage records but were not needed to resolve a disputed consequential claim.