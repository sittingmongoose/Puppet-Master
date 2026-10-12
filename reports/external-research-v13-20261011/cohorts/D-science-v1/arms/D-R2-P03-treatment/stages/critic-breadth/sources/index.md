# Critic-breadth source index

Source IDs S01–S19 and their identity fields are preserved unchanged from the investigator source map. This critic added S20–S23. Full version/commit, locator, access UTC, observation, governing condition and applicability are in [`../source-map.json`](../source-map.json).

## Additional mechanisms reviewed

- S20 [How Replicache Works](https://doc.replicache.dev/concepts/how-it-works) — The Big Picture; Mutations; Local execution; Push; Rebase; Conflict Resolution.
- S21 [Push Endpoint Reference — Replicache Docs](https://doc.replicache.dev/reference/server-push) — § Mutation Status; § Mutations are Atomic and Ordered; § Error Handling; Push Launch Checklist.
- S22 [RxDB Realtime Sync Engine for Local-First Apps](https://rxdb.info/replication.html) — The Sync Engine on the document level; The Sync Engine on the transfer level; Checkpoint iteration; Conflict handling.
- S23 [Electric Sync](https://electric.ax/docs/sync/) — Overview lines 135-155: read-path sync definition, Shapes, and Writes guide linking app API write-back patterns.

## Preserved investigator evidence

- S01 [Handling Update Conflicts — PowerSync](https://docs.powersync.com/handling-writes/handling-update-conflicts)
- S02 [Custom Conflict Resolution — PowerSync](https://docs.powersync.com/handling-writes/custom-conflict-resolution)
- S03 [JavaScript Web Client SDK v2.4.2 release notes — PowerSync](https://releases.powersync.com/announcements/powersync-js-web-client-sdk)
- S04 [PowerSync JavaScript SDK monorepo release commit](https://github.com/powersync-ja/powersync-js/commit/ba6737ee9cc940fc0dd1f7adbb554f8185084dc9)
- S05 [DemoConnector.ts — PowerSync self-host demo](https://github.com/powersync-ja/self-host-demo/blob/main/demos/nodejs/demo-app/src/library/powersync/DemoConnector.ts)
- S06 [Issue #48: getNextCrudTransaction grouping writeTransaction operations — PowerSync JS](https://github.com/powersync-ja/powersync-js/issues/48)
- S07 [PowerSync Kotlin changelog](https://github.com/powersync-ja/powersync-kotlin/blob/main/CHANGELOG.md)
- S08 [Sync Streams Are Now Generally Available — PowerSync](https://releases.powersync.com/announcements/sync-streams-are-now-generally-available)
- S09 [PostgreSQL 18 constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- S10 [PostgreSQL 18 Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- S11 [PostgreSQL 18 SET TRANSACTION](https://www.postgresql.org/docs/current/sql-set-transaction.html)
- S12 [SQLite transaction control](https://www.sqlite.org/lang_transaction.html)
- S13 [SQLite Foreign Key Support](https://www.sqlite.org/foreignkeys.html)
- S14 [SQLite Write-Ahead Logging](https://www.sqlite.org/wal.html)
- S15 [Atomic Commit In SQLite](https://www.sqlite.org/atomiccommit.html)
- S16 [SQLite PRAGMA integrity_check](https://www.sqlite.org/pragma.html#pragma_integrity_check)
- S17 [Automerge getConflicts API v3.5.0](https://automerge.org/automerge/api-docs/js/functions/getConflicts.html)
- S18 [CouchDB replication and conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html)
- S19 [CouchDB document design considerations](https://docs.couchdb.org/en/stable/best-practices/documents.html)
