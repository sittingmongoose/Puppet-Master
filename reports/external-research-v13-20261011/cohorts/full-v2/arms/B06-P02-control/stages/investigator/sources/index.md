# Source index — B06-P02-control investigator

This is a bounded, navigable index of primary evidence inspected during brief-only discovery. Source records with full identity, access time, locator, conditions and applicability are in [source-map.json](../source-map.json). Documentation URLs that say “stable” or “current” are live references; where no source release/commit is exposed, that is recorded as unknown instead of guessed.

## Offline-first and conflict alternatives

- [S01 — PouchDB 9.0.0 release](https://github.com/apache/pouchdb/releases/tag/9.0.0): release/version and IndexedDB adapter stability notes.
- [S02 — About PouchDB](https://pouchdb.apache.org/learn.html): local IndexedDB data and offline client sync.
- [S03 — PouchDB conflicts](https://pouchdb.apache.org/guides/conflicts.html): revision conflicts and disconnected replica behavior.
- [S04 — PouchDB API](https://pouchdb.apache.org/api.html): revs_limit default, removal/purge distinction and attachment API.
- [S05 — CouchDB replication](https://docs.couchdb.org/en/stable/replication/intro.html): directionality, checkpoints, deletes, filters and PouchDB clients.
- [S06 — CouchDB conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html): revision branches, winner visibility and app-specific resolution.
- [S07 — CouchDB changes feed](https://docs.couchdb.org/en/stable/api/database/changes.html): include_docs and attachment defaults, conflict projection and feed conditions.
- [S21 — Automerge introduction](https://automerge.org/docs/hello/): offline CRDT changes and optional central server.
- [S22 — Automerge conflict semantics](https://automerge.org/docs/reference/documents/conflicts/): same-field conflicts, retained alternatives and deterministic operation ordering.
- [S16 — PowerSync update-conflict handling](https://docs.powersync.com/handling-writes/handling-update-conflicts): upload queue, idempotency and backend-defined conflict policy.
- [S17 — PowerSync custom conflict resolution](https://docs.powersync.com/handling-writes/custom-conflict-resolution): server-side validation, versioning and recorded conflicts.
- [S18 — PowerSync Sync Streams](https://docs.powersync.com/sync/streams/overview): per-client row/column projection and local SQLite persistence.
- [S23 — PowerSync checkpoint requests](https://powersync.com/blog/checkpoint-requests-client-synced-now): connected checkpoint gate, Service version condition, alpha status.

## Privacy, attachments, and source history

- [S08 — CouchDB database security](https://docs.couchdb.org/en/stable/api/database/security.html): database member rights and default security object behavior.
- [S09 — CouchDB authentication](https://docs.couchdb.org/en/stable/api/server/authn.html): external proxy and JWT authentication conditions.
- [S10 — CouchDB attachment API](https://docs.couchdb.org/en/stable/api/document/attachments.html): revisioned upload/delete, type and range semantics.
- [S11 — CouchDB deleted documents](https://docs.couchdb.org/en/stable/maintenance/performance.html): replicated tombstone persistence and storage impact.
- [S12 — CouchDB 3.5 release notes](https://docs.couchdb.org/en/stable/whatsnew/3.5.html): 3.5.3 entry for the recreated-attachment fix.
- [S13 — CouchDB issue 6126](https://github.com/apache/couchdb/issues/6126): user report against 3.5.2 and reproduction condition.
- [S14 — CouchDB PR 6129 diff](https://github.com/apache/couchdb/pull/6129/files): source change and EUnit regression cases.
- [S15 — CouchDB merged fix commit](https://github.com/apache/couchdb/commit/83a487b754af09d271ce44a60fae6e4f4c24aa8b): immutable merge commit identity.
- [S19 — PowerSync self-hosting](https://docs.powersync.com/intro/self-hosting): Docker deployment route and dashboard limitation.
- [S20 — PowerSync licensing and terms](https://powersync.com/legal/licensing-terms): FSL, commercial editions and client SDK licensing.
- [S24 — Chrome storage persistence](https://developer.chrome.com/docs/web-platform/storage-buckets/): Chromium-specific storage persistence and eviction caveats.

## Inspection limit

The CouchDB EUnit regression names were inspected in the merged PR; no tests were executed. No raw page captures, downloads, application source changes, external account actions, or live volunteer data were created or used.
