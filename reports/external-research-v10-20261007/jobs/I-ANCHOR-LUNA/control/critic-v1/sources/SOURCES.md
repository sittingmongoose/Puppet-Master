# Critic source register — I-ANCHOR-LUNA

Retrieved by direct primary-source opens in T3 web on 2026-10-07 (the browser reported “Crawled: today”; it did not expose exact fetch timestamps, HTTP headers/status, or response hashes). Ranges below are the line ranges shown by that browser. Pinned raw GitHub sources are immutable commit URLs. No source IDs from the researcher register were reassigned: S01–S19 retain the meanings and locators in `../research-v1/sources/README.md`; abbreviated predecessor list below is only an index.

## Critic’s direct inspections

| ID | Primary URL / exact version | Inspected range | Evidence used |
|---|---|---:|---|
| C01 | https://raw.githubusercontent.com/apache/couchdb/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/replication/conflicts.rst (CouchDB 3.5.2 commit) | 33–42, 81–95, 155–170, 176–226 | Both divergent revisions replicate; default read hides conflict leaves; conflict retrieval and compaction behavior. |
| C02 | https://raw.githubusercontent.com/apache/couchdb/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/intro/security.rst (same commit) | 468–485, 506–535 | Database member/admin read and write scope; membership is database-wide. |
| C03 | https://raw.githubusercontent.com/apache/couchdb/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/ddocs/ddocs.rst (same commit) | 61–68, 705–716 | `validate_doc_update` receives user/security context and can reject writes; it does not provide read filtering. |
| C04 | https://raw.githubusercontent.com/apache/couchdb/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/api/document/attachments.rst (same commit) | 196–218, 238–286 | Attachment removal is revision-bound; Range section concerns resumable downloads. |
| C05 | https://raw.githubusercontent.com/apache/pouchdb/b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1/dist/pouchdb.indexeddb.js (PouchDB 9.0.0 commit) | 3681–3687, 3861–3863 | Pinned IndexedDB code checks whether the specific revision body references the attachment digest. |
| C06 | https://raw.githubusercontent.com/apache/pouchdb/705b17bd761e06f3cb823616ce974dc2a863aff6/tests/integration/test.attachments.js (regression-test commit) | 3729–3795 | Exact #8456 test setup and expected 412; correct anchor is `#L3729`, not inherited `#L3899`. Inspected, not run. |
| C07 | https://github.com/apache/pouchdb/pull/8460 | 131–175, 190–216 | PR describes bug/fix, test and fix commits, approval and merge on 2022-03-29. |
| C08 | https://github.com/apache/couchdb/issues/5422 | 129–166, 231–289 | Issue marked closed; reproduction reports CouchDB 3.4.2; no branches or PR linked. Does not establish 3.5.2 applicability. |
| C09 | https://pouchdb.com/adapters.html (unversioned official guide, page retrieval 2026-10-07) | 5–8, 16–38, 123–130 | IndexedDB default, native SQLite as separate plugin, listed CouchDB 3.x support. No exact 3.5.2 pairing certification. |
| C10 | https://pouchdb.com/guides/replication.html (unversioned official guide, page retrieval 2026-10-07) | 68–97, 127–141 | `live`/`retry` and pause/active; replication tracks DB data and destroying a replicated DB can repopulate it. |
| C11 | https://automerge.org/docs/reference/documents/conflicts/ (current official docs, retrieved 2026-10-07) | 58–112 | Independent edits merge; same-property conflict has deterministic default and exposes alternatives via `getConflicts`. |
| C12 | https://docs.getodk.org/guide-end-of-form/ (current ODK docs, retrieved 2026-10-07) | Page opened; relevant workflow was also in predecessor S16 | Used only as a workflow analogy; not treated as shared-asset sync evidence. |
| C13 | https://www.postgresql.org/docs/18/sql-insert.html and https://www.postgresql.org/docs/18/tutorial-transactions.html (PostgreSQL 18 docs, retrieved 2026-10-07) | Pages opened; alternative mechanics also indexed by S18 | Supports only the custom relational API comparison; no offline-sync or attachment protocol implied. |
| C14 | https://github.com/apache/pouchdb/releases/tag/9.0.0 (tag commit `b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1`) | 131–169 | Tag/release identity, released 2024-06-21, page labels it Latest, and highlights IndexedDB stability work. |
| C15 | https://github.com/apache/pouchdb/releases/tag/8.0.0 (tag commit `6cebe42c659d7b9c9467567322a11be6cc065cb0`) | 131–167 | Visible page establishes release identity but did not show `#8460`; avoid claiming the displayed release notes list it without verifying the linked full changelog. |

## Predecessor ID continuity (unchanged)

These IDs are carried forward exactly; see the researcher register for its original hashes and detailed locators.

- S01 brief `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/I-ANCHOR-LUNA/brief.md`; S02 frozen plan at the corresponding `cases/I-ANCHOR-LUNA/plan.md`.
- S03 CouchDB replication docs at commit `5b4d92103e5088d0e23794ddb9c09a6b683f985d`; S04 conflicts, S05 security, S06 attachment API, S07 compaction, and S19 design-doc validation at the same commit and original file locators in the predecessor register.
- S08 PouchDB 9.0.0 IndexedDB bundle/tag at commit `b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1`; S09 issue #8456; S10 PR #8460 with fix commit `1a30d0525f7b778ac3a4c58d1bf0d03628533999` and test commit `705b17bd761e06f3cb823616ce974dc2a863aff6`; S11 that test source (correct line anchor in this critic is 3729); S12 PouchDB 8.0.0 release tag.
- S13 PouchDB replication guide; S14 PouchDB adapter guide; S15 CouchDB issue #5422; S16 ODK end-of-form guide; S17 Automerge conflict guide; S18 PostgreSQL 18 INSERT and transaction guides.

The critic’s source IDs C01–C15 are additional evidence identities. They do not replace or redefine S01–S19. Direct browser retrieval did not provide hashes, so none are claimed here.
