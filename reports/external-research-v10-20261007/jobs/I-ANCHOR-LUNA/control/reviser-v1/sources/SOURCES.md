# Source register — I-ANCHOR-LUNA final reviser

Retrieved 2026-10-07 UTC. S01–S19 predecessor researcher identities and C01–C15 critic identities/locators are retained without reassignment. New reviser primary captures are F01–F15. Evidence excerpts and hashes are in sources/evidence/. F01–F14 retrieval start/end, HTTP status, response hash and excerpt hash are in [capture-manifest.json](evidence/capture-manifest.json). Fetched source text was inspected, not executed.

## Predecessor source IDs S01–S19 (unchanged)

| ID | Exact identity / primary URL and version | Original locator and evidence |
|---|---|---|
| S01 | Authorized brief at /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/I-ANCHOR-LUNA/brief.md; SHA-256 0600bd0661196df8f728a2d861530f352251dc42008e9fd71ce532a6e30a0874 | Case and integrated obligations |
| S02 | Frozen plan at matching cases/I-ANCHOR-LUNA/plan.md; SHA-256 ac49eea7607c8db0cc0664cb0921100ee651c6d4cf3887dc8bd1b05e2e0d93fd | Mutable asset record, timestamp winner, POST/retry, CSV; auth/delete/conflict/attachment retry/audit open |
| S03 | [CouchDB replication intro](https://github.com/apache/couchdb/blob/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/replication/intro.rst), 3.5.2 commit 5b4d92103e5088d0e23794ddb9c09a6b683f985d, tag object 8a992056a7e1e1c487ccf7a6248c6ab2c05f517a | §§2.1.3, 2.1.6; raw SHA c81877aaccc47db716167f61aca712f1694558bf6b46aecd988aa46d55a1d412 |
| S04 | [CouchDB conflicts](https://github.com/apache/couchdb/blob/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/replication/conflicts.rst), same commit | §§2.3.1–2.3.4, 2.3.7; raw SHA 46bc10a9ccd9ad1f4314f333e993dc96bcf869768470756bd72a9d355e053cae |
| S05 | [CouchDB security](https://github.com/apache/couchdb/blob/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/intro/security.rst), same commit | §1.5.3; raw SHA 59b6fe67b84d9022b1a667e2d920726dc89a25c948331f9dc2df71f0b83ac18d |
| S06 | [CouchDB attachment API](https://github.com/apache/couchdb/blob/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/api/document/attachments.rst), same commit | Revision-bound attachment changes; ranges are reads; raw SHA 59e95e0d42d6740d3f18ba3727bb1b1e2c954e4c0047098fe46a264c337a0d49 |
| S07 | [CouchDB compaction](https://github.com/apache/couchdb/blob/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/maintenance/compaction.rst), same commit | Space reclamation, not retention/erasure; raw SHA 662b4cdcead33569b2281ad4cee5a45ad29071a16803dc17ce81a26e745c069e |
| S08 | [PouchDB 9.0.0 bundle](https://github.com/apache/pouchdb/blob/b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1/dist/pouchdb.indexeddb.js#L3922), tag/commit b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1 | Original #L3922; raw SHA 41d5fad6ba0d96922d8794aec0869cd59323b0772a2b1f9009f772afec7b80b9 |
| S09 | [PouchDB issue #8456](https://github.com/apache/pouchdb/issues/8456) | Opened 2022-02-23; page SHA 7520ee5f7d9d289f3de43536eb0132bd996e24be5ec90ef03503b272f80b65e7 |
| S10 | [PouchDB PR #8460](https://github.com/apache/pouchdb/pull/8460) | Merged 2022-03-29; fix 1a30d0525f7b778ac3a4c58d1bf0d03628533999; test 705b17bd761e06f3cb823616ce974dc2a863aff6; page SHA bf2a598041310746d65d3566181c7dd6ee3645268e241536396306836b70d451 |
| S11 | [Pinned regression test](https://github.com/apache/pouchdb/blob/705b17bd761e06f3cb823616ce974dc2a863aff6/tests/integration/test.attachments.js#L3899), exact commit 705b17bd761e06f3cb823616ce974dc2a863aff6 | Original #L3899, full raw SHA 696848045d5622891179d4e04d8fd56f3263f4ebfa5141d59434e10834c164fe; inspected, not run |
| S12 | [PouchDB 8.0.0 release notes](https://github.com/apache/pouchdb/releases/tag/8.0.0), release commit 6cebe42c659d7b9c9467567322a11be6cc065cb0 | Preserve original identity/locator. Its original claim that the visible notes list #8460 is corrected; visible body does not list it. Page SHA fd123777236bf8514a5791ecf0a13b196766bfb58105df27b98a79df724645a1 |
| S13 | [PouchDB replication guide](https://pouchdb.com/guides/replication.html), unversioned guide retrieved 2026-10-07 | live/retry pause/reconnect; response hash in predecessor manifest |
| S14 | [PouchDB adapter guide](https://pouchdb.com/adapters.html), unversioned guide retrieved 2026-10-07 | IndexedDB browser default, separate SQLite plugin, general CouchDB 3.x; response hash in predecessor manifest |
| S15 | [CouchDB issue #5422](https://github.com/apache/couchdb/issues/5422) | 3.4.2, approx 1 MB → 2 MB report; no 3.5.2 inference; page SHA c190e35260c83ee51588f952f837c3d0194fc3020a5740c1f5c5a76dd63f1ea7 |
| S16 | [ODK form-state guide](https://docs.getodk.org/guide-end-of-form/), current page retrieved 2026-10-07 | Draft/finalized/sent workflow analogy; response hash in predecessor manifest |
| S17 | [Automerge conflicts](https://automerge.org/docs/reference/documents/conflicts/), current docs retrieved 2026-10-07 | Independent edit merge; same-property alternatives; response hash in predecessor manifest |
| S18 | [PostgreSQL 18 INSERT](https://www.postgresql.org/docs/18/sql-insert.html) and [transactions](https://www.postgresql.org/docs/18/tutorial-transactions.html) | Custom idempotent insert/receipt only; response hashes in predecessor manifest |
| S19 | [CouchDB validation docs](https://github.com/apache/couchdb/blob/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/ddocs/ddocs.rst), same commit | §3.1.7; raw SHA 1830d25f8ea2d24b9246fbf29e6083863572d6d08a7593b10ba381d6ebb53b8a |

## Critic source IDs C01–C15 (unchanged)

Critic direct inspections were retrieved 2026-10-07. Its IDs and browser locators remain as given.

| ID | Primary URL / exact version | Critic locator |
|---|---|---|
| C01 | CouchDB conflicts.rst at commit 5b4d92103e5088d0e23794ddb9c09a6b683f985d | 33–42, 81–95, 155–170, 176–226 |
| C02 | CouchDB security.rst, same commit | 468–485, 506–535 |
| C03 | CouchDB ddocs.rst, same commit | 61–68, 705–716 |
| C04 | CouchDB attachment API, same commit | 196–218, 238–286 |
| C05 | PouchDB 9.0.0 bundle at b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1 | 3681–3687, 3861–3863 |
| C06 | PouchDB regression test at 705b17bd761e06f3cb823616ce974dc2a863aff6 | Critic locator 3729–3795; conflicts with F15 raw lines |
| C07 | PouchDB PR #8460 | 131–175, 190–216 |
| C08 | CouchDB issue #5422 | 129–166, 231–289 |
| C09 | https://pouchdb.com/adapters.html | 5–8, 16–38, 123–130 |
| C10 | https://pouchdb.com/guides/replication.html | 68–97, 127–141 |
| C11 | https://automerge.org/docs/reference/documents/conflicts/ | 58–112 |
| C12 | https://docs.getodk.org/guide-end-of-form/ | Page opened; workflow also S16 |
| C13 | PostgreSQL 18 INSERT and transaction docs | Pages opened; comparison also S18 |
| C14 | PouchDB 9.0.0 release tag b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1 | 131–169 |
| C15 | PouchDB 8.0.0 release tag 6cebe42c659d7b9c9467567322a11be6cc065cb0 | 131–167; visible body did not show #8460 |

## New reviser captures F01–F15

F01–F14 were fetched by bounded standard-library GETs on 2026-10-07 19:03:54–19:03:57 UTC. Exact retrieval start/end, HTTP status, response SHA-256, excerpt ranges and excerpt hashes are in evidence/capture-manifest.json. F15 was re-fetched at the exact time below. Evidence files contain bounded text/selected JSON fields only.

| ID | Primary URL and version | Precise range, retrieval and evidence |
|---|---|---|
| F01 | https://raw.githubusercontent.com/apache/couchdb/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/replication/conflicts.rst; CouchDB commit 5b4d92103e5088d0e23794ddb9c09a6b683f985d | Raw lines 42–49, 182–189; evidence/f01.txt; full SHA matches S04; retrieval data in manifest. |
| F02 | https://raw.githubusercontent.com/apache/couchdb/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/intro/security.rst; same commit | Raw lines 589–592; evidence/f02.txt; full SHA matches S05. |
| F03 | https://raw.githubusercontent.com/apache/couchdb/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/ddocs/ddocs.rst; same commit | Raw lines 28–35, 63–70, 612–619, 683–690, 759–777, 805–812; evidence/f03.txt; full SHA matches S19. |
| F04 | https://raw.githubusercontent.com/apache/couchdb/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/api/document/attachments.rst; same commit | Raw lines 259–266, 313–319; evidence/f04.txt; full SHA matches S06. |
| F05 | https://raw.githubusercontent.com/apache/couchdb/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/maintenance/compaction.rst; same commit | Raw lines 13–38; evidence/f05.txt; full SHA matches S07. |
| F06 | https://raw.githubusercontent.com/apache/pouchdb/b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1/dist/pouchdb.indexeddb.js; PouchDB 9.0.0 exact commit | Raw lines 3919–3926 and 4113–4120; evidence/f06.txt; full SHA matches S08. |
| F07 | https://raw.githubusercontent.com/apache/pouchdb/705b17bd761e06f3cb823616ce974dc2a863aff6/tests/integration/test.attachments.js; test commit | Initial raw lines 3896–3903; evidence/f07.txt; full SHA matches S11. |
| F08 | https://pouchdb.com/adapters.html; official unversioned guide | Captured ranges in manifest; IndexedDB default, SQLite plugin, general CouchDB 3.x support; response SHA f9d0412f01a9c88da79ed42fc891ef6ec440eea56a2e77647a669264180f1bf1. |
| F09 | https://pouchdb.com/guides/replication.html; official unversioned guide | Captured ranges in manifest; live/retry and pause/active; response SHA c70b775396e48e21d7028a05dfaf170ef4e7c054dd6ffb322b54c1c4670ff59f. |
| F10 | https://api.github.com/repos/apache/couchdb/issues/5422; current API record | Selected fields state, closed_at, title, body; evidence/f10.txt; 3.4.2 reproduction; response SHA 8e2fcfdf65267d3f686b5429a28cdfc76be1932e8de8786b63e8f1fc65fd662d. |
| F11 | https://api.github.com/repos/apache/pouchdb/issues/8456; current API record | Selected title/state/dates/body; evidence/f11.txt; response SHA c5cfe7d877dafc4a24a3567807deb6572616e0d5769fc7f69f5c131f8a72d3d9. |
| F12 | https://api.github.com/repos/apache/pouchdb/pulls/8460; current API record | Selected body, merge time, head/base; evidence/f12.txt; response SHA 06ba5075b4974e66e26aea2298327a64576c2a380d22f70f0d22d08b4423fb9c. |
| F13 | https://api.github.com/repos/apache/pouchdb/pulls/8460/commits; PR commits API | SHA/message/author/date fields; evidence/f13.txt; response SHA b9d00430ec58eb5b61d752e39d777fe8d293030d7cccec1cc4d3089629abd167. |
| F14 | https://api.github.com/repos/apache/pouchdb/releases/tags/8.0.0; release tag 8.0.0 | Published date/body; evidence/f14.txt; body does not mention #8460; response SHA 94e0488a406f0f21b94f8816508ab564b5684aeeb212f5d575262af43ea3798d. |
| F15 | https://raw.githubusercontent.com/apache/pouchdb/705b17bd761e06f3cb823616ce974dc2a863aff6/tests/integration/test.attachments.js; exact test commit | Re-fetch captured 2026-10-07T19:05:17.161747Z. Raw lines 3899–3969 in evidence/f15.txt; full source SHA 696848045d5622891179d4e04d8fd56f3263f4ebfa5141d59434e10834c164fe; excerpt SHA adcd2bb2942409fe732caca20f36a593c0e0d9c44c8d28b9883d937e5bbbc1fc. Test begins 3899, ends 3967, expects status 412. Inspected, not run. |

## Errata and source boundary

S11's predecessor #L3899 locator is confirmed by its matching full-file hash and F15. Critic C06's 3729–3795 range is preserved but conflicts with direct raw bytes; final uses line 3899. The visible 8.0.0 release body does not list #8460; the pinned 9.0.0 bundle is release-applicability evidence. No source IDs were reassigned.

Only the named brief, plan, researcher draft/register/manifest, critic critique/register, and listed public primary material were consulted. No other arm, review key, evaluator, historical/parent analysis, cost record, account, purchase, provider change, or implementation environment was used.
