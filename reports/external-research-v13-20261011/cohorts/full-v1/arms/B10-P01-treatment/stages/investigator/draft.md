# Investigator draft — search provenance for a local technical handbook

**Run/stage:** B10-P01-treatment / investigator  
**Status:** complete research proposal; not implementation approval  
**Released plan:** [revealed-plan.md](revealed-plan.md), released once at 2026-10-12T00:45:35.392Z; SHA-256 acb36080380afebc5669cf45ac5ffd78c7bf760d9593263537903df66dea0957.  
**Discovery freeze:** discovery.md SHA-256 2db9fc9fc6b37fac06cd0144501d3366d3b6cf224bbe471794db2a99e676b1f8.  
**Source catalog:** [source-map.json](source-map.json) with stable source IDs; [sources/README.md](sources/README.md) is the index.

## Assessment

The released plan has a sound local-first direction: retain older editions, use local passage links, keep notes private and unchanged, support manual imports, and make upstream checks optional. The key correction is that a conditional “not modified” response cannot confirm that every passage selector still resolves. It reports a server’s validator result for a selected HTTP representation; it has no body, may be based on a weak validator, and does not test the handbook’s current extractor or selector against a new representation. A selector belongs to the retained local edition and extraction state.

The proposal should distinguish source family, published edition, exact stored artifact, extraction revision, capture/check events, and the note-to-passage evidence link. Search results can then show a deliberately chosen older product release while separately reporting cached-copy integrity and online-check outcome. No single “fresh/stale” field should imply release applicability or claim truth.

## Exact clause-by-clause disposition of the released plan

### Clause 01 — cache identity fields

> “The draft stores a source URL, retrieval time, supplied product version, byte hash and local document identifier for each cache entry.”

**Disposition — retain and refine (required correction).** These are useful fields, but a URL and version label are not enough to distinguish representations or reproduce a displayed passage. Preserve the source’s logical family, supplied version/release and full commit when available, exact stored-artifact digest and algorithm, original/request URL, final URL, access/import method and UTC time, response media type/language/content encoding, HTTP Vary fields and safe representation-selection inputs, and parser/extractor plus normalization version. Keep the raw stored-artifact SHA-256 separate from a digest of normalized extracted text: unchanged bytes can parse differently after an extraction upgrade. RFC 9110 defines validators against a selected representation and says Vary records request fields that may select that representation; the Web Annotation model likewise has State for identifying a particular version or format. [RFC 9110 §§8.8, 12.5.5](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.5), [Web Annotation §§4.3.1–4.3.2](https://www.w3.org/TR/2017/REC-annotation-model-20170223/#time-state)

**Proposed identity split:** a source-family ID identifies publisher/product/document family; a source-edition ID identifies a specific upstream release/commit/variant or a locally pinned edition when no upstream revision exists; a payload ID can deduplicate identical stored bytes; and a capture-event ID records each observation. Equal payload hashes must not merge different supplied product versions or provenance. A local hash verifies bytes against the locally stored digest, not who published them or whether they apply. [RFC 6920 §§2–3](https://www.rfc-editor.org/rfc/rfc6920.html)

### Clause 02 — note-to-passage link

> “Notes can link to a document identifier plus a passage selector.”

**Disposition — retain, with claim-level granularity.** Bind each manually selected evidence link to an immutable source-edition ID plus a structural locator and selector state. Where the note has multiple claims or excerpts, the user should be able to attach evidence to the relevant excerpt/claim rather than one source to the whole note. A selector can store a normalized quote and optional prefix/suffix plus a position hint; store the extractor/normalizer revision and source representation state with it. Web Annotation defines exact quote/context and normalized code-point positions, and cautions that position selectors are brittle when a resource changes. Do not automatically split prose into machine-inferred claims or move an anchor to a different edition. [Web Annotation §§4.2.4–4.2.5, 4.3](https://www.w3.org/TR/2017/REC-annotation-model-20170223/#text-quote-selector)

### Clause 03 — result revision and later-copy state

> “Search results display the source revision and whether a later copy has been observed.”

**Disposition — retain; make the statuses orthogonal.** Display publisher version/commit (or “version unknown”), captured-edition ID/date, local artifact integrity, and a separate last-observed upstream-check result/time. “Later copy observed” means a newer capture event exists; it does not establish that the later document supersedes the old one or better supports the current query. A query may deliberately target an older product release. Keep publisher-version relations distinct from capture dates and check status.

### Clause 04 — older-version filtering and offline use

> “Older versions remain available when a user filters by product version, and offline reading uses the retained copy.”

**Disposition — retain (required behavior).** The filter must select the exact declared release/commit or a clearly explained owner-defined compatibility range; never silently substitute the newest document. Capture operating system/platform, locale and product edition when the publisher exposes them. A missing version is “unknown,” not inferred from page date or URL. Search and the link-to-passage view must read from local retained artifacts when offline. The Git data model gives commit object IDs a stronger pin than a tag name alone; preserve repository identity, tag/display label and full resolved object ID where relevant. [Git data model](https://git-scm.com/docs/gitdatamodel)

**Owner decision:** which product/version/platform/locale dimensions exist in the actual handbook, and whether compatibility ranges are editorially declared. Public protocol or annotation specifications cannot determine those product-specific semantics.

### Clause 05 — optional conditional checker

> “An optional checker sends conditional requests for known public source URLs.”

**Disposition — retain; add explicit bounds and representation capture.** Require user initiation or a clear opt-in policy, use a small selected set or bounded batch, set per-request and whole-job time/byte/count limits, honor cancellation, and keep browsing separate from note rendering. Request only the known public source URL and needed validators; send no note prose, excerpt, note-derived hash, credentials or cookies. Record final URL and every redirect as an observed event. If a response has Vary, retain the safe selection fields and representation metadata; Vary:* or non-reproducible selection means variant identity is uncertain. [RFC 9110 §12.5.5](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.5)

### Clause 06 — “not modified” and changed hash behavior

> “It initially treats a not-modified response as confirmation that all selectors remain valid, while a changed hash marks the document for review.”

**Disposition — reject the first half as written; refine the second half.** A 304 response contains no representation body and is intended to update cache metadata. If-None-Match uses weak comparison for GET validation, and weak validators can match even where representation data changed. Last-Modified is the origin’s believed timestamp for the selected representation, has limited timestamp precision, and is usually weak. Therefore 304 supports wording such as “server accepted the stored validator for this selected representation at time T”; it does not confirm all local selectors or byte identity. [RFC 9110 §§8.8.1–8.8.3, 13.1.2, 15.4.5](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.2), [RFC 9111 §§4.2.2, 4.3](https://www.rfc-editor.org/rfc/rfc9111.html#section-4.3)

A changed payload digest should create a new retained edition, preserve old bytes, and mark evidence links for comparison. Review should be scoped to affected links after comparing the old/new extracted content. A digest can change because response bytes changed, an encoding/representation variant changed, or the extractor pipeline changed; compare artifact digest and extracted-text digest separately. If the bytes are unchanged but extractor version changed, re-extract into a new derived state and test anchors without replacing the original. A changed document does not necessarily invalidate every linked claim.

### Clause 07 — unresolved validator/content and extraction questions

> “The plan has not established how server validators relate to content or how selector behavior survives different extraction versions.”

**Disposition — resolve with the following explicit limits.** ETag is an opaque validator for the selected representation, not inherently a hash; Last-Modified is a server timestamp. HTTP validator matching is an upstream observation, not a local digest check. Vary can make a URL serve multiple representations. A 304 has no content body. The client should store the selected media type/language, Vary fields and only safe variant values, and mark Vary:* or incomplete variant reproduction as uncertain. [RFC 9110 §§8.8, 12.5.5, 15.4.5](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.5)

For selectors, use the versioned extraction state that originally produced the anchor. Re-resolve only within that state first. When an extractor changes, preserve the original extracted text/recipe identity and record a separate derived extraction; compare candidate anchors across states and flag missing, changed, repeated or ambiguous results. Do not claim that a server response makes selectors valid. [Web Annotation §4.3](https://www.w3.org/TR/2017/REC-annotation-model-20170223/#time-state)

### Clause 08 — moved URL and history

> “A moved URL records its replacement but does not erase old retrieval history.”

**Disposition — retain; distinguish observation from editorial relationship.** Record the requested URI, redirect status/Location chain, final URI, access time and resulting bytes. Preserve the old source edition and capture events. A redirect is evidence that a request led elsewhere at one time; do not automatically assert the destination is the same document or that it semantically replaces the old one. Add an explicit “candidate successor/redirect target” relation, with confirmation source and actor if an owner establishes equivalence. Memento may help retrieve historical states when supported, but a TimeGate selects the best-fit archived date at its discretion and replay bytes may differ due to migration or archive rewriting. [RFC 7089 §§3.1, 4.5.6](https://www.rfc-editor.org/rfc/rfc7089.html)

### Clause 09 — notes remain private and unchanged

> “Notes are never rewritten automatically, and private note content is not sent to source servers.”

**Disposition — retain as a hard constraint.** Source changes append check/edition/evidence-status records. They do not modify note text, note selectors, or the note’s original source edition. The optional network request contains only a public source URL and necessary validators. Do not send note text, selected quote, claim text, identifiers that encode note content, or note-derived hashes. A hash cannot be treated as a privacy mechanism. [RFC 6920 §10](https://www.rfc-editor.org/rfc/rfc6920.html)

### Clause 10 — affected links and passage diff

> “A changed document should identify affected links, although the proposed passage-diff method remains undecided.”

**Disposition — resolve the method as a proposal; leave product-specific thresholds for review.** Run comparisons per evidence link against the exact old and new edition/extraction states. Resolve old quote/context and structural locator in the old local edition first, then evaluate the same selector and a bounded context search in the new edition. Show a passage diff and a status per link: same within the new extracted text; changed; moved with one unambiguous candidate; missing; repeated/ambiguous; or not comparable because extraction/variant is unknown. A candidate is a suggestion only; an owner decides whether it still supports the note. Mark the whole document for review only when no reliable passage-level comparison is possible.

**Optional improvement:** store why a link is affected and the old/new edition IDs so a reviewer can navigate both exact passages offline. This provides traceable partial invalidation without editing prose.

### Clause 11 — manually imported sources

> “Manually imported documents retain their supplied provenance without pretending a network check was possible.”

**Disposition — retain; make unknowns explicit.** Keep exact imported file bytes and digest, import time/method, supplied publisher/version/source URL and the fact that those values are user-supplied; record missing values as unknown. Mark upstream status “not checkable from import metadata” or “not checked,” rather than fresh/stale. If a later public URL is supplied, attach it as a reviewable relation and run a separate optional check; never retroactively claim it was the import’s proven source.

### Clause 12 — proposed validation coverage

> “Proposed validation covers unchanged response metadata with altered representations, moved URLs, unavailable sources, old-version searches, extraction changes and missing passages.”

**Disposition — retain and expand as proposals.** Use a local deterministic test server/fixture set, not a crawler or random production pages:

1. Same Last-Modified timestamp with changed bytes; weak ETag with a 304; strong ETag; missing ETag; same bytes with changed headers; changed ETag but identical stored payload. Assert each check event is recorded accurately and no 304 is labeled byte-identical or selector-valid.
2. Vary: Accept-Language and another selecting header; different media representations at one URL; Vary:* or a non-replayable variant. Assert the source-edition/variant identity is not silently reused.
3. 301/302 chain, redirected target with different bytes, 404/410, 403, 429, timeout, TLS/DNS failure and offline mode. Assert the original URL, check outcome and old local edition remain available; define a user action only when the user wants a current upstream copy or must adjudicate a possible replacement.
4. An explicit older product-version query while a newer release is present; version unknown; platform/locale mismatch. Assert the explicit target is honored and mismatches are visible.
5. Exact selector against pinned edition; source bytes changed but unrelated passage remains; target passage changed, moved, duplicated or missing; changed extractor with unchanged source bytes. Assert only affected evidence links need review, ambiguous suggestions never auto-bind, and original anchor/history remain.
6. Manual imports with complete, partial and unknown metadata. Assert they are searchable/offline and never display an invented upstream check.
7. Network privacy and bounds: inspect outgoing request fields; assert only approved public URL/validator fields leave the process, with no note/quote/hash. Assert opt-in, request/count/time/body caps, redirect handling and cancellation.
8. Search/index: result ID navigates to exact stored edition/passage, old editions remain searchable, initial FTS index backfill/rebuild and integrity checking work, and latency/memory are measured on the actual several-thousand-document corpus and target machines.

These are **proposed validation cases**. No test harness or production request was run in this investigator stage.

### Clause 13 — no handbook/crawler run

> “No handbook or crawler has been run.”

**Disposition — retain.** No actual handbook document, crawler, or network freshness check was run. This stage read the brief, primary standards/documentation, a pinned SQLite test source, SQLite release history, and one relevant SQLite forum thread. The SQLite test file was read, not executed. There is no named handbook repository in the released brief, so no target-handbook implementation, caller or test suite could be inspected. The pinned SQLite FTS5 test is candidate-library evidence, not the handbook’s test suite.

### Clause 14 — integration and actionable failures

> “The integration proposal should distinguish retained-document identity from optional network checks and state which failures require user action.”

**Disposition — resolve with a local-first integration.**

1. **Capture/import:** ingest a public technical document or manual file into an immutable stored artifact. Compute SHA-256 over the exact bytes persisted, record media/variant metadata and the acquisition method, and extract text with a named parser/normalizer revision. Save an extracted-text digest separately. Add a capture event even when the digest matches an earlier event.
2. **Identity/lineage:** source family and edition records are stable; payload digest can deduplicate bytes but cannot merge version/provenance records. Versioned releases and full Git commits anchor applicability when available. Unversioned imports remain pinned with unknown publisher revision. Add explicit derived/revision/redirect relations with evidence rather than implicit merges. PROV-O relation vocabulary may help, without requiring an RDF store. [PROV-O](https://www.w3.org/TR/2013/REC-prov-o-20130430/)
3. **Evidence:** each note excerpt/claim links to exact edition, structural locator, quote/context and extraction state. Search results use the same edition ID. Open the cached passage first; online navigation is a separate action.
4. **Index:** keep a local full-text index over edition text. If SQLite FTS5 is already available, external-content indexing can avoid treating the FTS table as source truth, but the application must keep it synchronized; triggers do not backfill preexisting rows. Rebuild/integrity checks and result-to-edition tests are required. [SQLite FTS5 docs](https://www.sqlite.org/fts5.html#external_content_tables), [pinned FTS5 source test S09](https://sqlite.org/src/raw/ext/fts5/test/fts5content.test?ci=version-3.53.2)
5. **Optional check:** append a check event with URL, UTC, status, validator kind/value and response variant metadata. A 304 means “validator accepted”; a 200 with different content adds a new edition and schedules comparison. Network failure never removes offline access. Use explicit messages: “not checked,” “validator accepted at …; bytes not verified,” “new copy available; linked passage review needed,” “source unreachable; cached copy available,” “redirect destination needs review,” or “local cached artifact failed its digest check.”
6. **User action:** none for unchecked/offline browsing; optional retry for a temporary network error; owner review for a new/redirected edition, changed/missing/ambiguous link, product-version applicability, or unverified manual provenance; restore/re-import for local digest mismatch. A 304 does not request passage adjudication by itself.

SQLite is a plausible local-index candidate for several thousand documents if already bundled and FTS5 is enabled; this is not a measured performance claim. The upstream docs show that external-content sync is application-owned, and the pinned test exercises insert/update/delete, rebuild and integrity-check. The issue forum discusses a nested-write edge case for multiple AFTER UPDATE triggers. Its first reproduction was corrected, a later refined report was discussed by a maintainer, and no trigger-specific fix mapping was identified in the release summary inspected. This is a risk to test rather than a blanket rejection of FTS5. Append-only source-edition text and no nested update trigger are the safer proposed schema; test actual packaged SQLite before adoption. FTS5 has been in the amalgamation since 3.9.0 subject to build enablement; contentless-delete is an optional index mode from 3.43.0 and still needs a separate retained artifact for passage display. [SQLite release 3.43.0](https://www.sqlite.org/releaselog/3_43_0.html), [forum discussion](https://sqlite.org/bugs/info/d3b14ada9b81056914d0e6f9a6d23b7a804008c82b3481fae225d8a514dbd180?t=c), [release history as accessed 2026-10-12](https://www.sqlite.org/changes.html)

### Clause 15 — provisional, not endorsed

> “This is a provisional draft for review after the declared reveal, not an endorsed answer.”

**Disposition — preserve.** This is a research proposal for review. It does not claim product-owner endorsement or request implementation/deployment.

### Clause 16 — primary evidence and open user-data questions

> “Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources.”

**Disposition — primary-source findings resolved where possible; preserve these owner questions.**

**Resolved from primary sources:** HTTP dates and ETags are validators with conditions, not global edition IDs; Vary affects the selected representation; a 304 contains no body; quote and position selectors attach to a particular resource state and position offsets are brittle; Memento is an optional historical bridge with best-fit/byte-rewrite caveats; Git object IDs give a stronger repository pin than a floating label; FTS5 external-content consistency and initialization are application responsibilities. The source map records exact versions, locators, access UTCs, observed operations, conditions and applicability. [S01–S12](source-map.json)

**Not answerable from this brief:** the actual handbook repository/schema/callers and test commands; source formats and product/version/platform/locale taxonomy; how existing notes indicate claim boundaries; the existing storage/search library and FTS5 build flags; corpus size/languages and performance targets; source retention/licensing rules; allowed public hosts, redirect policy and operational request caps; who may assert that a redirected/new source applies to a note. The product owner should decide these before implementation. They do not block the generic research proposal.

### Clause 17 — deployment boundary

> “No future product deployment is requested.”

**Disposition — honor.** This stage produces research and a software design proposal only. No product code or deployment was changed.

## Alternatives and trade-offs

- **Upstream release/commit identity:** best when the publisher gives a versioned documentation path or repository commit; preserves deliberate old-version choice. Gaps: non-versioned pages and unstable tags. Retain both the display label and resolved ID.
- **Local immutable copy with digest:** strongest way to reopen the exact stored passage offline and detect local corruption. Gaps: digest does not prove publisher, release meaning or applicability. Pair it with provenance metadata and explicit unknowns. RFC 6920 explains hash-based naming/name-data integrity and its limits. [RFC 6920](https://www.rfc-editor.org/rfc/rfc6920.html)
- **HTTP validator:** efficient optional signal for a known URL. Gaps: server-controlled/opaque values, weak comparison, date resolution, Vary, no response body on 304. It is a check event, never the source-edition key. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- **Memento/archive:** useful for a moved or vanished source if a compatible archive has a capture. Gaps: uneven coverage, date selection discretion and possible replay transformation. Keep as a separately identified edition. [RFC 7089](https://www.rfc-editor.org/rfc/rfc7089.html)
- **Automatic semantic anchor migration:** rejected for automatic use because a similar sentence in a different version can change the evidence relationship. Offer candidate matches with surrounding context for a human.
- **SQLite FTS5 external content:** candidate if already available and a benchmark confirms scale; it keeps indexed text in a canonical content table, but trigger synchronization and runtime enablement are explicit responsibilities. Contentless-delete is a versioned alternative, but does not supply source text for passage navigation. A dedicated search engine remains a viable alternative if the real corpus/language needs justify it; no comparative benchmark was available here.

## Executed versus proposed work

**Executed:** exact brief read; brief-only discovery; primary RFC/W3C/Git/SQLite sources read as indexed in [source-map.json](source-map.json); pinned SQLite test source read at its recorded ranges; one SQLite issue/maintainer thread and release history reviewed; one-time plan reveal completed with discovery hash 2db9fc9fc6b37fac06cd0144501d3366d3b6cf224bbe471794db2a99e676b1f8. No target handbook code, cases or sources were inspected.

**Not executed:** no live freshness request, crawler, software build, test suite, validation fixture, performance benchmark, implementation or deployment. All validation items above are proposals. Source/native provenance and timestamps not exposed by the native Goal response remain unknown beyond the binding guard.

**Deadline:** this stage’s absolute deadline is 2026-10-12T01:07:01.374Z. The work was completed before it; no waiting allowance was used.
