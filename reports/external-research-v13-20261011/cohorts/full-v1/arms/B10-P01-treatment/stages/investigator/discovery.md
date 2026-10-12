# Brief-only discovery — B10-P01-treatment investigator

**Stage:** investigator  
**Run:** B10-P01-treatment  
**Input boundary:** discovered from the released brief alone. The comparison plan has not yet been released or read.  
**Research window:** 2026-10-12 00:37–00:44 UTC. Stable source IDs are in [sources/README.md](sources/README.md) and [source-map.json](source-map.json).

## Problem model

A result must let a reader answer four separate questions without network access: what publisher/product/document family is this; which upstream version or repository revision was captured; which exact cached representation and passage support this result; and how was that source checked, if at all, since capture. A URL, a version label, an HTTP date, or a search-index row is not the whole identity.

Model each family with immutable editions. Retain the publisher’s release/version and full repository commit when available, requested and final URLs, capture/import time and method, media type/language, byte count, SHA-256 of captured bytes, parser/extractor version, and digest of normalized text. A commit or explicit versioned document path expresses upstream identity; a local digest distinguishes exact bytes. Neither alone proves publisher authenticity or that a version applies to a claim. Resolve a Git tag or human version label to the full commit/object ID where available, while retaining the label for display. If material is unversioned, say so and pin the local edition instead of guessing. [S03, S07]

Keep lineage as explicit edges between editions/entities: derived-from, revision-of, quoted-from, redirect/successor-candidate, or mirror-of. Record the basis and actor/time. PROV-O offers useful vocabulary, but a small relational subset is enough; do not make RDF/OWL a runtime dependency. A redirect or new version creates a candidate relationship, not an identity merge or automatic semantic supersession. [S06]

## Claim evidence and excerpt recovery

Link each note claim or scoped excerpt to one or more specific edition IDs and passage selectors. Keep note ownership and source evidence separate: a source change may call one evidence link into question without invalidating every claim in a multi-claim note. Use a structural locator when reliable (heading, page/section, code symbol, PDF page), plus a normalized text quote with prefix/suffix context and a position hint. The Web Annotation model supports quote and position selectors; positions are brittle across edits and should be interpreted only against the pinned edition/state. Never search a new edition and automatically bind an old note to the first similar sentence. If the passage is changed, missing, repeated or ambiguous, preserve the old link and show the comparison for human review. [S05]

The source pane should open the stored edition, not the current URL, and take the reader to the captured passage. If extraction failed, the text no longer matches, or the cached artifact is unavailable, say so and show the available locator and check history; do not present a current web page as if it were the captured evidence.

## Revision identity and change-detection alternatives

| Approach | Good fit | Limit / handling |
|---|---|---|
| Publisher version, release path, or full repository commit | Deliberately versioned product docs/code; preserves older-version intent | Some sources have no stable release. Keep the literal publisher label plus full resolved commit/object ID and repository identity where possible; do not infer compatibility from “newer.” |
| Immutable local copy plus SHA-256 | Exact reproduction when URLs move/disappear and for manual imports | Identifies bytes, not publisher, semantic version, applicability, or future availability. Store metadata and lineage separately. Hash only public source artifacts; a digest is not a privacy shield for private note text. [S03, S07] |
| HTTP conditional validation | Bounded, low-transfer optional check of a known public URL | ETag is an opaque server validator, not necessarily a content hash; If-None-Match uses weak comparison for GET validation, so 304 is not byte-equality evidence. Last-Modified has server-clock/date precision limits and is usually weak. Cache heuristics are not claim validity. Keep “last checked” separate from version applicability and local digest. [S01, S02] |
| Memento or publisher version-history service | Recovery candidate when an original URL moved/disappeared | Availability/history are uneven. A TimeGate selects a best-fit date at the archive’s discretion and a replay may be rewritten, so it may not be byte-identical. Record archive URI/date and original URI as another source, then hash the local artifact. It is optional assistance, never an online reading dependency. [S04] |
| Re-fetch and diff full content | Detect changed passages where validators are absent, weak or changed | More bandwidth and parsing work; only on explicit user request or a bounded batch. Save as a new edition, preserve the old bytes, diff extracted text, and recompute linked-passage states. |
| Automated semantic remapping of old anchors | Could suggest candidates | False matches can change what a note appears to support. Keep suggestions for review with context; never silently rebind. |

An optional HTTP check should request only a public source URL and relevant conditional headers, never note text, claim prose, excerpt text, or a note-derived hash. Prefer If-None-Match when a validator exists; retain validator type/value and response status. Use Last-Modified only as a weaker fallback. A 304 means the server accepted its validator under HTTP semantics at that time, not that local and current bytes are proven identical. A 200 produces a possible new edition: hash it, preserve the old copy, and compare. Redirects preserve both request and final URLs; changed destination needs review. Timeout, offline, rate limit, access denial, 404/410, malformed response, and “no validator” should be distinct outcomes rather than one “stale” flag. [S01, S02]

For a manual import with no trustworthy upstream URL/version, record the imported bytes, digest, time, method, supplied label/source, and which values are unknown. It remains usable offline; upstream freshness is unknown/uncheckable. A later URL or release label can be attached only as a sourced, reviewable relation.

## Search and integration candidates

A local store with immutable source-edition records, claim-to-edition links, selectors and append-only check events is a clean baseline. If SQLite is already present and FTS5 is enabled, an FTS5 index over edition text permits local search without transmitting documents or notes. FTS5 can read from an external content table, but synchronization is the application’s responsibility; triggers do not backfill existing rows, so initial build/rebuild and consistency checks matter. Keep searchable text immutable and changing status/metadata in separate tables. The FTS5 docs and its 3.53.2 source tests show trigger-based insert/update/delete sync, rebuild and integrity-check. A current forum report/maintainer discussion raises a caveat for nested writes in multiple AFTER UPDATE triggers. The report’s first reproduction was corrected, later reproductions were discussed by a maintainer, and the 3.54.0 release summary reviewed here does not identify a trigger-specific fix. This is a design/test risk, not a confirmed universal FTS failure. Append-only edition rows avoid updates to evidence text; if mutable rows remain, test the exact packaged SQLite build and trigger order. [S08–S12]

Contentless-delete FTS5 indexes can reduce duplicated index content but arrived in SQLite 3.43.0 and still do not replace the source snapshot needed to display a passage. They are an alternative only if runtime availability and separate source storage are verified. External-content has a clearer route from a result row to cached text. If another local search engine is already installed, compare it with FTS5 using the real corpus and queries; the brief supplies no benchmark or runtime evidence, so no performance winner is established. [S08, S11]

## Proposed flow and result presentation

1. Import/fetch a public technical document into a new immutable edition; capture original/final URL, upstream version/commit if supplied, capture time/method, raw digest, media type/language, parser version and extracted-text digest. Manual import follows the same path with explicit unknowns.
2. Index edition text locally. A result carries exact edition ID and product/version metadata; a query can explicitly target an older version. Do not rank “newest” above an exact requested-version match just because its date is later.
3. Attach note claims to evidence links and selectors. Open the saved edition and display its version/capture identity beside the passage.
4. On user request, revalidate one public URL or a bounded set. Append a check event. Preserve offline search/open behavior and prior editions if the check fails or content changes.
5. When a changed edition arrives, show the old passage, new passage or absence, digest change, validator result and affected claim-evidence links. Do not edit staff notes or selectors automatically.

Keep applicability, local passage integrity, and online check outcome as separate dimensions. Example: “Release 4.2; captured 2024-08-19; excerpt matches this cached edition; upstream not checked; view captured passage.” If a check returned 304 through a weak ETag, say “validator accepted at [time]; byte identity not verified.” If bytes differ, say “new edition available; this linked passage changed/moved/missing; review,” not “the whole note is invalid.” If offline/unreachable, the cache remains usable and the UI says no current upstream observation was obtained.

## Validation proposals (none executed)

- Identity fixtures: same URL with two release labels/commits and two payloads creates separate editions; identical bytes can share a blob digest without collapsing publisher/version metadata; moved URL retains original/final values.
- Version selection: an older-version query returns its pinned edition even when a newer release exists; unknown-version results are marked unknown; “latest” never overrides an explicit target.
- Anchor fixtures: exact quote resolves in the pinned edition; positions use its normalized text; changed, missing, repeated or ambiguous quote never auto-selects an edition-2 match; a multi-claim note can mark only the affected evidence link for review.
- HTTP harness: exercise 304/weak ETag, strong ETag, changed 200 with same Last-Modified, changed 200 and digest, same bytes with changed headers, missing validators, redirect, 404/410, timeout, 429 and offline. Assert prior bytes and search remain available, new bytes are append-only, and 304 does not set byte-identical.
- Privacy/bounds: record outbound request fields and prove they contain only an approved public URL and conditional headers; assert no note text, quote, excerpt or note-derived digest leaves the process. Check opt-in, request/host/time/body caps, redirect policy and cancellation.
- Search/index: verify FTS5 is enabled at startup, result-to-passage navigation uses exact edition, initial backfill/rebuild works, insert/delete consistency and integrity checks work, and measure latency/memory on several thousand docs on target hardware. Define a no-FTS fallback. If mutable external-content rows remain, test nested-trigger cases against the packaged SQLite build and keep a deterministic rebuild path.

**Work executed:** read the brief and public primary standards/documentation, a pinned SQLite test source, SQLite release history, and one SQLite forum thread. The brief named no target-handbook repository, caller or test suite, and no actual handbook source document was examined. No code was run; no validation test or HTTP check was executed. The design and validation list are proposals, not results.
