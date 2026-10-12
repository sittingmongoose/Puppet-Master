# Final research proposal: search provenance for a local technical handbook

**Run/stage:** B10-P01-treatment / reviser  
**Status:** complete research proposal for owner review; not implementation approval  
**Basis:** original brief; complete investigator discovery, draft, source map, and revealed plan; complete critic critique and source map; both source indexes; and the independent primary-source rechecks recorded in the final map. Stable source IDs S01–S12 are preserved.  
**Limits:** no target handbook repository, product code, callers, local tests, crawler, build, validation suite, benchmark, or deployment was supplied or run. Source reads are research, not product validation.

## Proposed design

Use a local-first provenance model with immutable source editions and capture events, separate extracted-text states, explicit lineage, and note-to-passage evidence links. Keep three questions independent in storage and display: (1) which publisher/product revision or locally pinned edition is this; (2) does the retained artifact match its local digest and can a passage be opened in the pinned extraction state; and (3) what, if anything, did an optional upstream check observe? None proves that a version applies to a claim or that the claim is true.

A practical record split is:

- **Source family:** publisher/product/document-family identity. Groups related editions without asserting they mean the same thing.
- **Source edition:** a release, repository commit/path, selected representation variant, or local pinned edition where the upstream revision is unknown. Preserve publisher label and full resolved commit/object ID where available. Do not infer a version from URL or page date.
- **Stored payload:** exact artifact bytes retained for offline use. Compute a digest over the bytes actually persisted, name the algorithm, and specify whether the app stores content-decoded bytes or encoded representation bytes. This detects local mismatch only; it proves neither publisher nor applicability. Equal payload hashes may deduplicate bytes but must not merge provenance/version records.
- **Capture/import event:** append-only UTC time, method, actor or supplied-provenance flag, requested/final URIs, redirect status and Location chain, response status, and safe representation metadata. Record media type, language, content encoding, Vary fields and only safe request fields selecting a public representation. If Vary is * or the variant cannot be reproduced, mark variant identity uncertain. For imports, retain exact bytes, digest, import method/time, user-supplied source/version labels and explicit unknowns.
- **Extraction state:** parser/extractor and normalization versions plus a digest of normalized extracted text, linked to the payload. An unchanged artifact can produce a different extraction after parser changes; retain both states.
- **Lineage:** evidence-backed edges such as derived-from, revision-of, quoted-from, mirror-of, or candidate redirect/successor, with basis and actor/time. PROV-O can guide a small relational model without an RDF/OWL runtime. A new URL, release or archive capture is a candidate relation, not an identity merge or automatic semantic supersession.
- **Evidence link:** a manually selected claim/excerpt link to a stable edition ID and exact extraction state, with structural locator where available, normalized exact quote, optional prefix/suffix context, and a position hint. Allow separate links for multiple claims/excerpts. Do not infer claim boundaries or silently move a selector to another edition.
- **Check event:** append-only time, requested/final URLs, status, validator type/value, Vary/variant context, outcome and error class. Keep it separate from edition identity, local digest, selector resolution and product applicability.

Search stays local over retained edition text. Each result carries exact edition identity and a route to the stored passage. An explicit older-version query selects that edition even when a later release exists. Show platform, locale or product edition where publishers provide them; owners must define compatibility ranges. Search and passage navigation continue offline. Open the cached representation first; online navigation is separate.

### Optional checks and truthful status

Make checks user-started or subject to clear opt-in. Bound URL set, batch size, per-request and whole-job time/bytes/count, redirects and concurrency; support cancellation. Send only an approved public source URL and needed conditional headers. Never send note text, claims, excerpts, note-derived identifiers/hashes, credentials or cookies.

ETag is an opaque HTTP validator, not inherently a content digest. If-None-Match uses weak comparison for GET validation, so a weak match may be accepted even if representation data changed. Last-Modified is the origin's believed modification time for the selected representation, has timestamp-resolution and server-clock limits, and is usually weak. Vary changes which representation is selected. A 304 has no body and cannot rerun local extraction or passage resolution.

Distinguish these results:

- Weak ETag, date validator, missing validator, or incomplete variant context: “server validator accepted at [time]; current bytes and passage not verified.”
- Same strong ETag returned for the same selected representation and matching Vary context: under RFC 9110 strong-validator semantics this is useful evidence that the origin considers the representation data unchanged. It remains an origin assertion, not a local file re-hash; it does not test a changed extractor, resolve selectors, or establish claim applicability. Record tag strength/value and matched variant context. Missing or inconsistent expected metadata means uncertain.
- Local digest recomputed and equal: “stored artifact matches its saved digest.” This is local integrity, not publisher authentication.
- A 200 brings a changed payload: retain a new edition and prior bytes; compute artifact and extracted-text digests separately; compare affected links.
- Offline, timeout, denial, rate limit, malformed response, or no validator: state that outcome; keep the cached edition available.
- Redirect: retain original URI, status, Location chain and final URI. 301/308 indicate permanent URI reassignment; 302/307 are temporary; 303 directs to a different resource as an indirect response. These are protocol observations, not proof of identical content, edition, applicability or note support. Never merge editions or rewrite links. Seek owner review when identity/applicability remains uncertain, not mechanically for every redirect.

For a new edition, compare each evidence link against the exact old/new edition and extraction states. Resolve the saved selector in the old local state first, then evaluate it and bounded contextual search in the new state. Show both passages and a diff. Per-link states may be same in new extraction, changed, moved with one unambiguous candidate, missing, repeated/ambiguous, or not comparable because representation/extraction is unknown. A candidate is for human review only. Mark whole-document review only when passage-level comparison is unreliable. Never rewrite note text, original edition links or selectors. A changed source can affect one evidence link without invalidating every claim in a multi-claim note.

Suggested messages: “Release 4.2; captured [date]; excerpt matches this cached edition; no upstream check”; “strong validator unchanged for this selected representation; local digest not recomputed”; “new edition available; this linked passage changed/moved/missing; review”; “source unreachable; cached edition available”; “redirect observed; target relationship not confirmed”; and “local artifact does not match its saved digest.”

## Feasible alternatives

| Approach | Useful when | Limits and handling |
|---|---|---|
| Publisher release/path or full repository commit | Versioned manuals, API docs, code and deliberate older-version queries | Labels can float or be ambiguous. Keep repository identity, path, display label and resolved full commit/object ID. Does not establish claim applicability. |
| Immutable local copy plus digest | Exact offline reopening, moved/disappeared URLs, manual imports, local corruption detection | Digest identifies chosen bytes only, not publisher, version meaning or applicability. |
| Conditional HTTP validation | Low-transfer check of a known public URL | Server assertion tied to selected representation. Weak/date validators are weaker evidence; 304 has no body. Not an edition key or local anchor check. |
| Full re-fetch and diff | Missing/weak validators or explicit passage comparison | More bandwidth, parsing and operational cost. Use only within opt-in bounds; retain a new edition and never overwrite old bytes. |
| Memento/archive | Recovery after page move/disappearance | Uneven coverage; TimeGate selects a best-fit date and replay may rewrite bytes. Treat as another edition and hash locally. |
| Automatic semantic anchor migration | Finding likely passage candidates | False matches can change evidence meaning. Suggest with context for a person; never auto-bind. |
| SQLite FTS5 external content | Candidate local search if packaged runtime enables FTS5 and real-corpus benchmarks meet targets | Application owns consistency. Triggers do not backfill existing rows; add initial build/rebuild and integrity checks. Test actual package/schema. |
| SQLite FTS5 contentless-delete | Possible reduction in duplicated index content with SQLite 3.43.0+ | Does not retain the canonical source passage needed for display. |
| Existing/dedicated local engine | If already present or corpus/language/latency evidence justifies it | No target runtime or benchmark was supplied; no winner can be named. Compare on actual corpus and target hardware. |

FTS5 is a plausible candidate, not a decision. Its external-content mode reads a separate content table and leaves synchronization to the application; triggers cover later mutations, not existing rows. A pinned SQLite 3.53.2 upstream test covers setup, insert/update/delete, rebuild and integrity-check, but was only read. The reported SQLite issue is narrow: a normal external-content FTS sync AFTER UPDATE trigger plus a second AFTER UPDATE trigger that performs a nested UPDATE on the same content table. The reporter says the refined token-superset example reproduced on 3.45.1, 3.45.3 and bundled 3.53.2; the initial reproduction was corrected and the thread includes a maintainer discussion/workaround. This is not evidence that external-content FTS5 generally fails; no local reproduction or code-level fix trace was done. The 3.54.0 high-level release summary identifies no mapped fix, which does not prove fixed or unfixed status. Do not exclude FTS5 or require append-only storage solely from this report. If the actual schema has this topology, test it against the packaged release; otherwise this specific warning may not apply. FTS5 runtime availability also depends on build configuration.

## Exact released-plan clause dispositions

Each exact plan sentence is quoted in order; dispositions account for the full clause.

### Clause 01 — cache identity

> “The draft stores a source URL, retrieval time, supplied product version, byte hash and local document identifier for each cache entry.”

**Accept and refine.** Keep these fields and add source-family, edition, payload and capture-event IDs; supplied and resolved release/commit; requested/final URLs and redirect chain; acquisition/import provenance; safe representation metadata; extraction/normalization version; and distinct stored-artifact and extracted-text hashes. **C-04: accept.** Define whether the artifact hash covers the exact persisted content-decoded bytes or encoded representation bytes. Do not equate HTTP validators with app hashes. Equal payload hash must not merge distinct provenance/version records. A hash proves neither publisher nor applicability. [S01, S03, S05, S07]

### Clause 02 — note passage link

> “Notes can link to a document identifier plus a passage selector.”

**Accept with claim-level granularity.** Link each user-selected claim/excerpt to immutable edition and extraction-state IDs, structural locator, quote/context and optional position hint. Keep original link and selector after updates; do not infer claim divisions or move anchors. [S05]

### Clause 03 — revision and later copy

> “Search results display the source revision and whether a later copy has been observed.”

**Accept; keep statuses orthogonal.** Show publisher revision or unknown, captured edition/date, local integrity, and last upstream check/time separately. A later capture does not prove supersession or query applicability. [S01, S03, S07]

### Clause 04 — older versions and offline

> “Older versions remain available when a user filters by product version, and offline reading uses the retained copy.”

**Accept as required behavior.** Select the declared release/commit or an owner-defined compatibility range; never silently substitute newer. Unknown versions stay unknown; retain platform/locale/edition when available. Search and passage opening use retained artifacts offline. Owner must define the real product taxonomy and compatibility policy. [S05, S07]

### Clause 05 — optional conditional checker

> “An optional checker sends conditional requests for known public source URLs.”

**Accept with opt-in and bounds.** Use a selected set/bounded batch; impose time, byte, URL/count, redirect and cancellation limits. Send only public URL and needed validators. Keep note content, claims, excerpts, hashes, credentials/cookies out of requests. Record variant context; Vary:* or irreproducible variants are uncertain. [S01, S02]

### Clause 06 — 304 and changed hash

> “It initially treats a not-modified response as confirmation that all selectors remain valid, while a changed hash marks the document for review.”

**Reject the selector guarantee; refine the changed-hash response. C-01: accept with qualification.** A 304 has no body and If-None-Match uses weak comparison for GET, so weak/date validation does not establish unchanged bytes or selectors. A same strong ETag returned for the same selected representation and Vary context is useful evidence under strong-validator semantics that the origin asserts representation data unchanged. Record that separately; it is not a local digest check, selector re-resolution, extractor check, or applicability decision. Changed content creates a new edition and per-link review; it does not invalidate every note link. Keep artifact and extracted-text hashes separate. [S01, S03]

### Clause 07 — validator/content and extraction

> “The plan has not established how server validators relate to content or how selector behavior survives different extraction versions.”

**Resolve the general model; preserve implementation uncertainty.** ETags are opaque; dates are server claims; Vary selects a representation; 304 lacks a body. A same strong tag has the qualified evidential value above. None runs the saved extractor or resolves an anchor. Resolve selectors in the original extraction state. Preserve it; create a derived extraction after parser upgrades and classify changed, missing, repeated, ambiguous or incomparable anchors. Never auto-rebind. [S01, S05]

### Clause 08 — moved URL/history

> “A moved URL records its replacement but does not erase old retrieval history.”

**Accept; distinguish statuses. C-02: accept.** Preserve requested URI, status/Location chain, final URI, time, bytes and old edition. Describe 301/308 as permanent URI reassignment; 302/307 as temporary; 303 as an indirect response from a different resource. None proves same content or applicability. Store a candidate relation, not an automatic merge or rewritten link. Ask for owner review only when identity/applicability remains uncertain. Memento is optional recovery and another edition because selection/date/replay are not guaranteed byte-equivalent. [S01, S04]

### Clause 09 — private, unchanged notes

> “Notes are never rewritten automatically, and private note content is not sent to source servers.”

**Accept as hard constraint.** Append evidence/check state; never modify note text, source edition or selector. Verify outbound request fields. Hashes are not privacy protection. [S03]

### Clause 10 — affected links and diff

> “A changed document should identify affected links, although the proposed passage-diff method remains undecided.”

**Accept; propose per-link comparison.** Resolve old selector in old state, then same selector and bounded context search in new state. Present both exact passages/diff; classify same, changed, moved/unambiguous candidate, missing, ambiguous/repeated, or not comparable. Suggestions require human decision. Mark entire document for review only when passage-level comparison is unreliable; retain old/new IDs and reason.

### Clause 11 — manual imports

> “Manually imported documents retain their supplied provenance without pretending a network check was possible.”

**Accept with explicit unknowns.** Store exact bytes/digest, import method/time, user-supplied source/version/URL labels and unknown fields. Say “not checked” or “not checkable from import metadata,” never fresh/stale. A later URL is a reviewable relation, not proof of import origin.

### Clause 12 — validation coverage

> “Proposed validation covers unchanged response metadata with altered representations, moved URLs, unavailable sources, old-version searches, extraction changes and missing passages.”

**Accept and expand; proposals only.** Use deterministic local fixtures, not crawler: (1) weak accepted ETag with changed data; same strong ETag and matching variant; changed strong tag; Last-Modified unchanged with changed bytes; missing validators; changed ETag/same payload; locally corrupted payload. Separate HTTP, local digest and passage states. (2) Vary with language/another header, multiple representations, Vary:* and non-replayable variants. (3) 301/302/303/307/308 chains and changed destination; 403/404/410/429, timeout, TLS/DNS, malformed response and offline. Preserve status/history and cached copy. (4) explicit old release beside newer, unknown version, platform/locale mismatch. (5) exact selector, unrelated edit, target changed/moved/duplicated/missing, and extractor upgrade with unchanged bytes. Confirm only affected links need review and no ambiguous auto-binding. (6) manual import with full/partial/unknown provenance. (7) inspect request fields for privacy; exercise opt-in, allowlist, bounds and cancellation. (8) index result-to-exact-passage, old-edition search, FTS5 build availability, initial backfill, rebuild, insert/update/delete consistency, integrity-check and corpus latency/memory. (9) If actual schema matches the reported external-content plus nested-update trigger topology, test the reported token-superset case and controls on packaged SQLite; inspect later fix history. No fixture, request, benchmark or test was run.

### Clause 13 — no handbook/crawler run

> “No handbook or crawler has been run.”

**Accept and preserve.** No target handbook document/repository was identified or examined. Brief does not give product code paths, callers or test commands. Research covered candidate SQLite docs, a pinned upstream test (read only), a public issue/maintainer thread and release history. No source test execution, crawler, freshness request or handbook validation occurred. SQLite evidence is not handbook evidence. Product code/caller/test review remains an external prerequisite if integration is to be specified against a real target.

### Clause 14 — integration/action

> “The integration proposal should distinguish retained-document identity from optional network checks and state which failures require user action.”

**Accept and resolve at design level.** Import immutable artifacts; keep family/edition/payload/capture/extraction IDs distinct; link notes to exact states; index local text; append checks; preserve offline use. FTS5 external-content requires build verification, initial backfill, app-owned synchronization, rebuild/integrity checks and exact passage navigation; contentless-delete does not replace cached source bytes. Benchmark alternatives on real corpus before selecting. **C-03: accept and narrow.** The forum report is a risk only if the application has the stated normal FTS sync trigger plus another AFTER UPDATE trigger issuing a nested content-table UPDATE; token-superset change is a reported refined condition. The first example was corrected; maintainer discussion/workaround is not our reproduction. 3.54.0's high-level release page maps no fix but cannot establish fixed/unfixed status. Do not ban FTS5 or require append-only storage because of this report alone. Inspect actual schema/release and test if applicable. Action: none for offline/no-check; optional retry for temporary network errors; owner review for uncertain edition/redirect applicability or changed/missing/ambiguous evidence; restore/re-import for digest mismatch. A strong validator alone does not require passage adjudication. [S06, S08–S12]

### Clause 15 — provisional status

> “This is a provisional draft for review after the declared reveal, not an endorsed answer.”

**Accept.** This is owner-review research, not endorsement, implementation approval or release decision.

### Clause 16 — primary evidence/open data

> “Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources.”

**Accept with open owner questions.** Primary sources resolve general HTTP validator/Vary/304 behavior, annotation selectors/state, hash limits, archive caveats, Git object pins, PROV relations, and FTS5 build/synchronization concerns. They cannot supply: target repo/schema/search stack/callers/test commands; source formats/languages/version/platform/locale taxonomy and claim boundaries; compatibility policy; corpus/performance goals/hardware; retention/licensing rules; approved hosts/redirect policy/request caps; or who may assert successor identity and source applicability. These decisions precede implementation but do not block a generic design. Full exact source identity, access, condition and applicability records are in source-map.json. Stable S01–S12 IDs remain unchanged.

### Clause 17 — deployment boundary

> “No future product deployment is requested.”

**Accept and honor.** Research proposal only; no product code, account, service, handbook or deployment was changed.

## Research and validation record

**Executed research:** read the full brief, complete investigator and critic packages/maps and both source indexes. Independently opened/searched official RFC 9110 sections on strong/weak validators, If-None-Match, 304 and redirect statuses, plus SQLite FTS5 docs, the SQLite Fossil issue/maintainer thread and SQLite release history. These were source reads only.

**Not executed:** no handbook code/caller/test inspection (no target supplied), source test execution, local reproduction, HTTP request, crawler, fixture, build, benchmark, implementation or deployment. All validation above is proposed. The captured native Goal responses directly expose status, threadId, createdAt (1791767284), updatedAt (1791767659), tokensUsed (136555), and timeUsedSeconds (375); any additional Goal provenance or timing not returned by those responses remains UNKNOWN.
