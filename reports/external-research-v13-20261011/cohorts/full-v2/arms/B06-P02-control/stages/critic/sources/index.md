# Critic source index — B06-P02-control

Independent observations are recorded in [source-map.json](../source-map.json), IDs C01–C14. They do not rebind the investigator’s S01–S24.

## Governing workflow and privacy

- [C01 — CouchDB replication/conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html): directions, stale revisions and application-level conflict handling.
- [C02 — CouchDB database security](https://docs.couchdb.org/en/stable/api/database/security.html): database member read boundary; relevant to F-01.
- [C03 — CouchDB authentication](https://docs.couchdb.org/en/stable/api/server/authn.html): proxy/JWT configuration conditions.
- [C04 — CouchDB replication introduction](https://docs.couchdb.org/en/stable/replication/intro.html): replication conditions.
- [C05 — CouchDB attachment API](https://docs.couchdb.org/en/stable/api/document/attachments.html): parent revision requirements.
- [C14 — CouchDB deleted documents](https://docs.couchdb.org/en/stable/maintenance/performance.html): replicated tombstone retention; relevant to P13.
- [C06 — Issue #6126](https://github.com/apache/couchdb/issues/6126), [C07 — PR #6129 diff/tests](https://github.com/apache/couchdb/pull/6129/files), [C08 — 3.5 release notes](https://docs.couchdb.org/en/stable/whatsnew/3.5.html): bounded report, merged source/tests and release entry; see F-02 for the check-count discrepancy.

## Alternatives and device storage

- [C09 — PowerSync custom conflicts](https://docs.powersync.com/handling-writes/custom-conflict-resolution): backend queue and deduplication.
- [C10 — PowerSync Sync Streams](https://docs.powersync.com/sync/streams/overview): partial sync and local SQLite persistence.
- [C11 — PowerSync licensing](https://powersync.com/legal/licensing-terms): service editions, not individual volunteer identity pricing.
- [C12 — Automerge conflicts](https://automerge.org/docs/reference/documents/conflicts/): same-property alternatives and deterministic operation ordering.
- [C13 — Chrome storage persistence](https://developer.chrome.com/docs/web-platform/storage-buckets/): Chromium eviction/persistence caveats.

Access observations are recorded at 2026-10-12T01:10:02Z in the source map. No product or repository tests were run.
