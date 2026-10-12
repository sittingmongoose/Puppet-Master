# Source index — D-R2-P03-treatment investigator

Access captured in two browser batches at **2026-10-12 04:23:38 UTC** and **04:23:44 UTC**. Full identity, locator, observed operation, governing condition/default/exception, applicability, version or commit, and exact URL are in [`source-map.json`](../source-map.json).

## Sync and conflict mechanisms

- S01 [PowerSync conflict handling](https://docs.powersync.com/handling-writes/handling-update-conflicts) — upload queue, backend ownership, defaults, idempotency.
- S02 [PowerSync custom conflict resolution](https://docs.powersync.com/handling-writes/custom-conflict-resolution) — sequence versions, field edits, human conflict records, status tracking.
- S03 [PowerSync Web SDK release notes](https://releases.powersync.com/announcements/powersync-js-web-client-sdk) — v2.4.2 current release observed; release repairs and regressions.
- S04 [PowerSync JS SDK release commit](https://github.com/powersync-ja/powersync-js/commit/ba6737ee9cc940fc0dd1f7adbb554f8185084dc9) — package/demos/test-repo context at 2026-10-01.
- S05 [PowerSync self-host demo connector](https://github.com/powersync-ja/self-host-demo/blob/main/demos/nodejs/demo-app/src/library/powersync/DemoConnector.ts) — caller example; rolling main branch, illustrative only.
- S06 [PowerSync JS issue #48](https://github.com/powersync-ja/powersync-js/issues/48) — reported grouped-write / upload transaction issue and maintainer fix statement.
- S07 [PowerSync Kotlin changelog](https://github.com/powersync-ja/powersync-kotlin/blob/main/CHANGELOG.md) — platform-specific queue and offline timing fixes.
- S08 [Sync Streams GA announcement](https://releases.powersync.com/announcements/sync-streams-are-now-generally-available) — user-filtered sync data and service/SDK requirements.

## Relational transaction and authorization basis

- S09 [PostgreSQL 18 constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) — foreign keys, exclusion constraints, and cross-row CHECK limits.
- S10 [PostgreSQL 18 row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — default-deny after enablement, role and owner bypass.
- S11 [PostgreSQL 18 transaction isolation](https://www.postgresql.org/docs/current/sql-set-transaction.html) — default READ COMMITTED and SERIALIZABLE abort/retry semantics.
- S12 [SQLite transaction control](https://www.sqlite.org/lang_transaction.html) — deferred/write locking and busy conditions.
- S13 [SQLite foreign keys](https://www.sqlite.org/foreignkeys.html) — per-connection enforcement is disabled by default.

## Local recovery and alternatives

- S14 [SQLite WAL](https://www.sqlite.org/wal.html) — same-host constraint, concurrency and checkpoint behavior.
- S15 [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html) — crash testing and OS/filesystem flush caveat.
- S16 [SQLite integrity checks](https://www.sqlite.org/pragma.html#pragma_integrity_check) — structural integrity and separate FK check.
- S17 [Automerge API v3.5.0](https://automerge.org/automerge/api-docs/js/functions/getConflicts.html) — same-key CRDT conflict inspection.
- S18 [CouchDB 3.5 conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html) — revision leaves, hidden losing values, explicit merge.
- S19 [CouchDB 3.5 document design](https://docs.couchdb.org/en/stable/best-practices/documents.html) — document boundaries and application versioning caveats.

No code or service was run. Observed external examples/issues are evidence only; the proposed test list is not an executed test report.
