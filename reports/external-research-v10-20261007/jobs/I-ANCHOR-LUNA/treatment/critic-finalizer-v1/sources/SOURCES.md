# Sources — critic-finalizer-v1

## Identity and scope

S00–S21 retain their research-v1 identities and evidence-note mappings. No ID is reassigned to a different source. The locators below are sharpened where this finalizer directly checked a page. Research-v1’s source files and manifest remain unmodified.

- Original register: /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-ANCHOR-LUNA/treatment/research-v1/sources/manifest.json
- Required draft predecessor: /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-ANCHOR-LUNA/treatment/research-v1/draft.md
- Finalizer retrieval: listed public sources were reopened directly with web.run on 2026-10-07, with targeted page finds for the locators below. The web tool said “Crawled: today” but did not expose a per-page fetch time in seconds. Original retrieval windows are preserved from the predecessor manifest. The SHA-256 values below identify local predecessor evidence-note bytes, not live web content.

## Source register

### S00 — Authorized case inputs
- Predecessor: research-v1 S00; evidence note sources/S00.md; SHA-256 69629609d260097542493ffbd69529acf1620acffde3191993e356a3ef6a45f6.
- Identity: exact local INPUTS.md, brief.md, and plan.md named by the stage INPUTS.md.
- Locator: brief “Research obligations”; entire frozen plan.
- Retrieval: original researcher read after activation, 2026-10-07 18:26:49–18:29:40 UTC, exact per-file time not instrumented. Finalizer reread the same allowed inputs after Goal activation on 2026-10-07; per-file time not instrumented.
- Check: same permitted files only; no additional scientific input was read.

### S01 — SQLite transaction control
- Predecessor: research-v1 S01; evidence note sources/S01.md; SHA-256 2ed5a3913b34baa456d8241b1de7d71e8cbc3b05441ff5aa9d8b30ca0f7bb679.
- URL: https://www.sqlite.org/lang_transaction.html
- Version and locator: official living documentation, last updated 2026-02-18; §2 lines 32–37 and §§2.1–2.2 lines 38–58. Transactions, simultaneous readers/writer and SQLITE_BUSY behavior.
- Predecessor retrieval: 2026-10-07 18:31:05–18:31:07 UTC; direct open.
- Finalizer check: directly reopened; no specific SQLite engine or mobile binding is pinned.

### S02 — PostgreSQL 17 INSERT / ON CONFLICT
- Predecessor: research-v1 S02; evidence note sources/S02.md; SHA-256 d0662258ca70b7c751dd7a58add64efa9866b6e7a3fd44f021ab9f0d189648de.
- URL: https://www.postgresql.org/docs/17/sql-insert.html
- Version and locator: PostgreSQL 17 manual; ON CONFLICT lines 111–119, especially atomic INSERT/UPDATE at lines 112–116.
- Predecessor retrieval: 2026-10-07 18:31:05–18:31:07 UTC; direct open.
- Finalizer check: directly reopened. Patch is not pinned. SQL does not compare application hashes or implement the sync protocol.

### S03 — RFC 9110 HTTP Semantics
- Predecessor: research-v1 S03; evidence note sources/S03.md; SHA-256 4b3520cb769332388ade2e901403067174dd4c7d42e3521f16cb3c848f073767.
- URL: https://www.rfc-editor.org/rfc/rfc9110.html
- Version and locator: RFC 9110, June 2022; §9.2.2 lines 1984–1994 and §9.3.4 PUT.
- Predecessor retrieval: 2026-10-07 18:31:05–18:31:07 UTC; direct open.
- Finalizer check: directly reopened and checked idempotence/retry semantics. Resource behavior must match the intended effect.

### S04 — CouchDB replication and conflict model
- Predecessor: research-v1 S04; evidence note sources/S04.md; SHA-256 d140e70b2271a83ed700389d754034337ed87a0452bc54f72243285b43220bb7.
- URL: https://docs.couchdb.org/en/stable/replication/conflicts.html
- Version and locator: Apache CouchDB documentation family 3.5; rolling stable URL, no patch pin. §2.3.1 lines 54–57 deterministic winner; §2.3.3–2.3.4 lines 94–122 revision history and conflict retrieval.
- Predecessor retrieval: 2026-10-07 18:31:10–18:31:11 UTC; direct open.
- Finalizer check: directly reopened and checked winner/view and conflict-leaf behavior.

### S05 — CouchDB replication protocol
- Predecessor: research-v1 S05; evidence note sources/S05.md; SHA-256 5c84a0bd2476fe07ea13b7ff9ed7c86cf395660adfb28133eb197e9c4a7f9f4d.
- URL: https://docs.couchdb.org/en/stable/replication/protocol.html
- Version and locator: CouchDB docs family 3.5, rolling stable URL. §2.4.1–2.4.2 checkpoint/change-feed details; §2.4.3 lines 1420–1421 delays/loss/retry robustness.
- Predecessor retrieval: 2026-10-07 18:31:10–18:31:11 UTC; direct open.
- Finalizer check: directly reopened. Protocol guidance is not an implementation guarantee for the proposed API.

### S06 — CouchDB attachment API
- Predecessor: research-v1 S06; evidence note sources/S06.md; SHA-256 ef6d2e261b1f139a5302f17874f15c02eced0049b7468296d1239ac6ba897a6d.
- URL: https://docs.couchdb.org/en/stable/api/document/attachments.html
- Version and locator: CouchDB docs family 3.5, rolling stable URL; §1.4.2.1 lines 290–324, HTTP Range Requests.
- Predecessor retrieval: 2026-10-07 18:31:10–18:31:11 UTC; direct open.
- Finalizer check: directly reopened. Evidence concerns resumable downloads, not uploads.

### S07 — CouchDB database security API
- Predecessor: research-v1 S07; evidence note sources/S07.md; SHA-256 723bfd020bc5386569295e5c251acbf1514430c80d89867f9c1f9db3b068c99b.
- URL: https://docs.couchdb.org/en/stable/api/database/security.html
- Version and locator: CouchDB docs family 3.5, rolling stable URL; §1.3.19 lines 12–22, members/admins database permissions.
- Predecessor retrieval: 2026-10-07 18:31:10–18:31:11 UTC; direct open.
- Finalizer check: directly reopened. Database member scope is not asset-level crew authorization; this does not describe every CouchDB authorization capability.

### S08 — CouchDB purge semantics
- Predecessor: research-v1 S08; evidence note sources/S08.md; SHA-256 7bdbbc118ee060ec1807f8a6a86061adee91de2eca3953e3ea08f191613cb3b2.
- URL: https://docs.couchdb.org/en/stable/api/database/misc.html
- Version and locator: CouchDB docs family 3.5, rolling stable URL; §1.3.20.1–.2 lines 120–129, internal versus external purge replication.
- Predecessor retrieval: 2026-10-07 18:32:43–18:32:44 UTC; direct open.
- Finalizer check: directly reopened. External purge behavior is CouchDB-specific.

### S09 — PouchDB issue #8525
- Predecessor: research-v1 S09; evidence note sources/S09.md; SHA-256 c7993278852e61f06f72db8632081495f51f5c8b02ddea8f592146b97faa662f.
- URL: https://github.com/apache/pouchdb/issues/8525
- Version and locator: issue #8525, opened 2022-06-22; description lines 152–180, reporter’s compaction latency and 409 observations.
- Predecessor retrieval: 2026-10-07 18:31:10–18:31:11 UTC; direct open.
- Finalizer check: directly reopened; treated as one workload report, not a general failure rate.

### S10 — PouchDB compaction fix and regression test
- Predecessor: research-v1 S10; evidence note sources/S10.md; SHA-256 b1d062233b321a7b520e24f63eb670568e72adc6b47d7bcc6cf0c3cd12579130.
- URL: https://github.com/apache/pouchdb/commit/34cb69117931d4b520ee8d7a6208eb0f33da8ec7
- Version and locator: immutable full commit SHA; adapter.js diff lines 178–185 restores since=last_seq; test.compaction.js lines 203–219 adds checkpoint/regression test and skips remote targets.
- Predecessor retrieval: 2026-10-07 18:31:10–18:31:11 UTC; direct open; full SHA was resolved through public GitHub commit API.
- Finalizer check: directly reopened and checked code/test condition. No app or remote-target behavior is established.

### S11 — PouchDB 9.0.0 release
- Predecessor: research-v1 S11; evidence note sources/S11.md; SHA-256 1aa620a897cf4319e6eb51ab4d348145137732b05a29a0afbcc6b166a096336b.
- URL: https://github.com/apache/pouchdb/releases/tag/9.0.0
- Version and locator: PouchDB 9.0.0, release commit b2882c1, released 2024-06-21; release lines 131–164 and #8525 bugfix lines 236–243.
- Predecessor retrieval: 2026-10-07 18:31:10–18:31:11 UTC; direct open.
- Finalizer check: directly reopened 2026-10-07; page still marked 9.0.0 “Latest” at retrieval (line 133). This does not establish dependency health or adapter compatibility.

### S12 — React Native PouchDB SQLite adapter README
- Predecessor: research-v1 S12; evidence note sources/S12.md; SHA-256 98b40098b02b117d156bf183a19a6c1dce08b2aba99ac8254dca8eee51a8f3b9.
- URL: https://github.com/craftzdog/pouchdb-adapter-react-native-sqlite/blob/e269c4300926c16662560ccc1eb68be4f6bfc76b/README.md
- Version and locator: immutable commit e269c4300926c16662560ccc1eb68be4f6bfc76b; README describes v4.0.0. Metro/attachment discussion lines 228–247; setup example lines 248–263.
- Predecessor retrieval: 2026-10-07 18:33:40–18:33:41 UTC; direct open; ref was resolved with public git ls-remote.
- Finalizer check: directly reopened; confirmed README-reported binary attachment hang with default Metro browser bundle and documented Node-build workaround. Not independently reproduced.

### S13 — Automerge JavaScript getConflicts API
- Predecessor: research-v1 S13; evidence note sources/S13.md; SHA-256 0de76cf457bea1388f6f00c7be23fc61f462a3ce38f64a46b37b66dd0761c1ff.
- URL: https://automerge.org/automerge/api-docs/js/functions/getConflicts.html
- Version and locator: official @automerge/automerge v3.5.0 API; lines 5–12 conflict semantics and deterministic value; example lines 23–45.
- Predecessor retrieval: 2026-10-07 18:31:10–18:31:11 UTC; direct open.
- Finalizer check: directly reopened. Supports conflict inspection, not domain policy or app architecture.

### S14 — Automerge Rust sync protocol
- Predecessor: research-v1 S14; evidence note sources/S14.md; SHA-256 2bff15408b9d2fdfee30947d8f6531a55c918dc1f1cd43412cd9cb7a50c77ed7.
- URL: https://automerge.org/automerge/automerge/sync/index.html
- Version and locator: official generated Rust reference, exact crate version not visible; Sync Protocol lines 17–21, reliable in-order stream assumption.
- Predecessor retrieval: 2026-10-07 18:31:10–18:31:11 UTC; direct open.
- Finalizer check: directly reopened; version uncertainty preserved. Not used as a failure report.

### S15 — ODK Collect finalized-submission workflow
- Predecessor: research-v1 S15; evidence note sources/S15.md; SHA-256 c1cb23afd23c4d4da99e038efa613b4d514eab40fa07161ebe51093e2ef393a2.
- URL: https://docs.getodk.org/guide-end-of-form/
- Version and locator: current ODK docs, version notes include 2024.1 and 2025.2; Draft/Finalized/Sent lines 136–164.
- Predecessor retrieval: 2026-10-07 18:31:05–18:31:07 UTC; direct open.
- Finalizer check: directly reopened; used only as an offline submission workflow analogy.

### S16 — ODK Central submission review and media
- Predecessor: research-v1 S16; evidence note sources/S16.md; SHA-256 d45989470108522c2692855949ed3d893397722d0f240f190358edf41e712aed.
- URL: https://docs.getodk.org/central-submissions/
- Version and locator: current ODK Central docs; missing-media warning lines 187–188; submission detail/activity history lines 309–317.
- Predecessor retrieval: 2026-10-07 18:32:43–18:32:44 UTC; direct open.
- Finalizer check: directly reopened; used as review/media analogy, not evidence for this service.

### S17 — OWASP Authorization Cheat Sheet
- Predecessor: research-v1 S17; evidence note sources/S17.md; SHA-256 f88513b36d89e2b2d6a2a82e229f4a12d055f79e5e4b00d2ad081d56db034a7d.
- URL: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- Version and locator: current rolling cheat sheet, no release pin; least privilege lines 206–216; deny by default 217–222; per-request check 223–229; ABAC/ReBAC 244–262; object/static-resource/server-side checks 263–284.
- Predecessor retrieval: 2026-10-07 18:31:05–18:31:07 UTC; direct open.
- Finalizer check: directly reopened; added precise locators for relationship/attribute and object-level authorization guidance.

### S18 — SQLite copyright and public-domain status
- Predecessor: research-v1 S18; evidence note sources/S18.md; SHA-256 82d57b95b6f934cd6f56bd293c2fe73a93c0829a1989aea5cb8d70ad7b3b2e7d.
- URL: https://www.sqlite.org/copyright.html
- Version and locator: official SQLite copyright page, last updated 2026-01-12; public-domain status lines 20–29; legal-proof caveat lines 36–45.
- Predecessor retrieval: 2026-10-07 18:32:43–18:32:44 UTC; direct open.
- Finalizer check: directly reopened; does not apply to every adapter or build tool.

### S19 — PostgreSQL license
- Predecessor: research-v1 S19; evidence note sources/S19.md; SHA-256 24d2a8c3e5e033cbab36c168ad097099942fcce1580c0d38b7cd6c537d8d9073.
- URL: https://www.postgresql.org/about/licence/
- Version and locator: official PostgreSQL project license, grant lines 29–32.
- Predecessor retrieval: 2026-10-07 18:32:43–18:32:44 UTC; direct open.
- Finalizer check: directly reopened; license does not eliminate hosting, support, or operating cost.

### S20 — PostgreSQL 17 binary data types
- Predecessor: research-v1 S20; evidence note sources/S20.md; SHA-256 010dcca336fe004fb81ff9c6ecbec7c25c28831c143de07f8a77d654a8e1a75c.
- URL: https://www.postgresql.org/docs/17/datatype-binary.html
- Version and locator: PostgreSQL 17 manual, §8.4 lines 32–47 on bytea binary formats.
- Predecessor retrieval: 2026-10-07 18:39:01–18:39:02 UTC; predecessor manifest says prior web search; this finalizer directly opened the official page.
- Finalizer check: confirms a binary storage type only; no workload suitability/performance claim.

### S21 — RFC 8252 OAuth 2.0 for Native Apps
- Predecessor: research-v1 S21; evidence note sources/S21.md; SHA-256 f14ddb6eb46ab85461838ef6fc5f195e8e518b911788f17d873ec10ce78b9733.
- URL: https://datatracker.ietf.org/doc/html/rfc8252
- Version and locator: RFC 8252 / BCP 212, October 2017; §6 external user-agent lines 373–403; PKCE public-client requirement lines 388–395 and §8.1.
- Predecessor retrieval: 2026-10-07 18:31:05–18:31:07 UTC; direct open of IETF Datatracker text.
- Finalizer check: directly reopened; does not define offline authorization duration or revocation behavior.

## Limits

Local note hashes identify only the predecessor evidence-note bytes. The underlying sources are public and are identified by stable URLs, versions, sections/line ranges, and retrieval metadata. RFC numbers, immutable Git commits, issue/release IDs, versioned PostgreSQL manuals, or explicit rolling-page labels establish each source identity. No citation implies that the proposed system, component stack, or validation has been executed.
