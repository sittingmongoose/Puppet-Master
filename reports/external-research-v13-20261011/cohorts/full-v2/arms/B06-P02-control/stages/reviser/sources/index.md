# Source index — B06-P02-control reviser

This index preserves investigator (S), critic (C), and reviser (R) source IDs without rebinding. Full exact URLs, versions/commits, access times, locators, conditions and applicability are in [source-map.json](../source-map.json).

## Investigator sources (S01–S24)

- [S01 — PouchDB 9.0.0 release](https://github.com/apache/pouchdb/releases/tag/9.0.0): PouchDB 9.0.0; release tag; GitHub shows short commit b2882c1. Locator: Release title, version, commit, IndexedDB adapter stability and find() default limit.
- [S02 — About PouchDB](https://pouchdb.apache.org/learn.html): Live unversioned docs; no release/commit binding shown. Locator: Sections About PouchDB and Browser Support.
- [S03 — PouchDB conflicts guide](https://pouchdb.apache.org/guides/conflicts.html): Live unversioned docs; no release/commit binding shown. Locator: Immediate conflicts and Eventual conflicts sections.
- [S04 — PouchDB API reference](https://pouchdb.apache.org/api.html): Live unversioned docs; no release/commit binding shown. Locator: Constructor options revs_limit; remove/purge and attachment sections; local database options.
- [S05 — CouchDB replication introduction](https://docs.couchdb.org/en/stable/replication/intro.html): Current stable documentation for CouchDB 3.5; release notes identify 3.5.3. Locator: Transient/persistent replication; procedure; master-master; migrating data to clients.
- [S06 — CouchDB conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html): Current stable documentation for CouchDB 3.5; release notes identify 3.5.3. Locator: Sections conflict avoidance, revision trees, working with conflicting documents and views.
- [S07 — CouchDB changes-feed API](https://docs.couchdb.org/en/stable/api/database/changes.html): Current stable documentation for CouchDB 3.5; release notes identify 3.5.3. Locator: Query parameters include_docs, attachments, style; _changes defaults.
- [S08 — CouchDB database security API](https://docs.couchdb.org/en/stable/api/database/security.html): Current stable documentation for CouchDB 3.5; release notes identify 3.5.3. Locator: GET/PUT database security object; members and admins.
- [S09 — CouchDB authentication API](https://docs.couchdb.org/en/stable/api/server/authn.html): Current stable documentation for CouchDB 3.5; release notes identify 3.5.3. Locator: Proxy Authentication and JWT Authentication sections.
- [S10 — CouchDB attachment API](https://docs.couchdb.org/en/stable/api/document/attachments.html): Current stable documentation for CouchDB 3.5; release notes identify 3.5.3. Locator: PUT and DELETE attachment endpoints; revision conditions; range requests.
- [S11 — CouchDB performance and deleted documents](https://docs.couchdb.org/en/stable/maintenance/performance.html): Current stable documentation for CouchDB 3.5; release notes identify 3.5.3. Locator: Deleted documents section.
- [S12 — CouchDB 3.5 release notes](https://docs.couchdb.org/en/stable/whatsnew/3.5.html): 3.5.x branch; current release notes include 3.5.3. Locator: Version 3.5.3 bugfixes, entry for PR 6129.
- [S13 — CouchDB attachment replication bug report](https://github.com/apache/couchdb/issues/6126): Reporter states CouchDB 3.5.2; issue opened 2026-09-23 and closed by PR 6129. Locator: Description and reproduction steps for delete/recreate before intermediate delete replicates.
- [S14 — CouchDB PR 6129 diff](https://github.com/apache/couchdb/pull/6129/files): PR commit c885b36 (short SHA); merged 2026-09-25; merge commit 83a487b754af09d271ce44a60fae6e4f4c24aa8b. Locator: src/couch/src/couch_db_updater.erl; src/couch/src/couch_att.erl; test/eunit/couch_db_recreate_att_tests.erl.
- [S15 — CouchDB merged fix commit](https://github.com/apache/couchdb/commit/83a487b754af09d271ce44a60fae6e4f4c24aa8b): Merge commit SHA 83a487b754af09d271ce44a60fae6e4f4c24aa8b; fix branch commit shown as c885b36. Locator: Commit source files and regression test module couch_db_recreate_att_tests.
- [S16 — PowerSync update-conflict handling](https://docs.powersync.com/handling-writes/handling-update-conflicts): Live current docs; page does not expose a release or commit identifier. Locator: Handling Update Conflicts section.
- [S17 — PowerSync custom conflict resolution](https://docs.powersync.com/handling-writes/custom-conflict-resolution): Live current docs; page does not expose a release or commit identifier. Locator: Business-rule validation, change-level status, server-side conflict recording strategies.
- [S18 — PowerSync Sync Streams overview](https://docs.powersync.com/sync/streams/overview): Live current docs; page does not expose a release or commit identifier. Locator: Sync Streams definition, authenticated parameters, buckets and client SQLite persistence.
- [S19 — PowerSync self-hosting](https://docs.powersync.com/intro/self-hosting): Live current docs; page does not expose service version/commit. Locator: Self-hosted Docker path and enterprise edition.
- [S20 — PowerSync licensing and terms](https://powersync.com/legal/licensing-terms): Current terms accessed 2026-10-12; no release tag. Locator: Open Edition, Cloud, Enterprise Self-Hosted, client SDK sections.
- [S21 — Automerge introduction](https://automerge.org/docs/hello/): Live docs with 2026 copyright; no release/commit binding shown. Locator: Automatic merging and local-first overview.
- [S22 — Automerge conflict semantics](https://automerge.org/docs/reference/documents/conflicts/): Live docs with 2026 copyright; no release/commit binding shown. Locator: Same-property concurrent write, conflicts object, operation ordering.
- [S23 — PowerSync checkpoint requests article](https://powersync.com/blog/checkpoint-requests-client-synced-now): Article dated 2026-09-09; Checkpoint Request feature requires Service 1.24.0+ and is described as alpha. Locator: Background, consistency gates, connection requirement and request flow.
- [S24 — Chrome Storage Buckets and persistence](https://developer.chrome.com/docs/web-platform/storage-buckets/): Chromium 122+ for Storage Buckets per page; page last updated 2022-11-04 UTC. Locator: Storage persistence request, eviction behavior, bucket persisted and durability options.

## Independent critic sources (C01–C14)

- [C01 — Replication and conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html): Stable 3.5 docs; no patch commit bound. Locator: Replication directions, conflicts, winner, 409 behavior, application resolution.
- [C02 — Database security API](https://docs.couchdb.org/en/stable/api/database/security.html): Stable 3.5 docs. Locator: _security member/role conditions.
- [C03 — Authentication API](https://docs.couchdb.org/en/stable/api/server/authn.html): Stable 3.5 docs. Locator: Proxy and JWT authentication sections.
- [C04 — Replication introduction](https://docs.couchdb.org/en/stable/replication/intro.html): Stable 3.5 docs. Locator: Replication direction/configuration.
- [C05 — Document attachment API](https://docs.couchdb.org/en/stable/api/document/attachments.html): Stable 3.5 docs. Locator: PUT/DELETE attachment endpoints; current revision requirement.
- [C06 — Issue #6126: attachment recreation replication report](https://github.com/apache/couchdb/issues/6126): Opened 2026-09-23; reporter says 3.5.2; closed via PR #6129. Locator: Description/version/reproduction condition.
- [C07 — PR #6129 source and EUnit additions](https://github.com/apache/couchdb/pull/6129/files): Merged 2026-09-25; commit c885b36; current view displayed Checks 0. Locator: couch_att.erl; couch_db_updater.erl; couch_db_recreate_att_tests.erl.
- [C08 — CouchDB 3.5.x release notes](https://docs.couchdb.org/en/stable/whatsnew/3.5.html): 3.5.x branch lists 3.5.3. Locator: 3.5.3 fix entry linking PR #6129.
- [C09 — PowerSync custom conflict resolution](https://docs.powersync.com/handling-writes/custom-conflict-resolution): Live docs; no release/commit shown. Locator: Client/backend upload flow and duplicate operation guidance.
- [C10 — PowerSync Sync Streams overview](https://docs.powersync.com/sync/streams/overview): Live docs; no release/commit shown. Locator: Partial sync and local persistence.
- [C11 — PowerSync licensing/terms](https://powersync.com/legal/licensing-terms): Current page observed 2026-10-12; no tagged version. Locator: Open Edition, Cloud/Enterprise and SDK sections.
- [C12 — Automerge conflict semantics](https://automerge.org/docs/reference/documents/conflicts/): Live docs; 2026 copyright, no release/commit shown. Locator: Same-property writes, conflicts object, operation ordering.
- [C13 — Chrome storage persistence](https://developer.chrome.com/docs/web-platform/storage-buckets/): Page states Chromium 122+; last updated 2022-11-04 UTC. Locator: persist(), eviction, explicit-user-clear caveat.
- [C14 — CouchDB performance — deleted documents](https://docs.couchdb.org/en/stable/maintenance/performance.html): Stable 3.5 docs; no patch commit bound. Locator: Deleted documents section.

## Reviser direct rechecks (R01–R02)

- [R01 — CouchDB database security API — direct reviser recheck](https://docs.couchdb.org/en/stable/api/database/security.html): Stable CouchDB 3.5 documentation; no patch commit bound. Locator: Database member rights and defaults, especially passages saying members can read all document types and matching authenticated members may read documents.
- [R02 — CouchDB PR #6129 — direct reviser recheck](https://github.com/apache/couchdb/pull/6129): Merged 2026-09-25; fix commit c885b36; merge commit 83a487b754af09d271ce44a60fae6e4f4c24aa8b. Locator: Conversation merge event records 56 checks passed; page navigation shows a Checks 0 tab; Files view names couch_att.erl, couch_db_updater.erl and couch_db_recreate_att_tests.erl.
