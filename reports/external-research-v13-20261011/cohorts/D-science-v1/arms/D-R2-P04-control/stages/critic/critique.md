# Independent critic review — D-R2-P04-control

## Verdict

The investigator draft is a strong, substantially complete response to the released plan and the original brief. It correctly separates stable attachment identity, byte version, extraction/index profiles, and note membership; rejects stale data as current after failure or cancellation; treats deletion and late publication as membership/freshness races; distinguishes OCR, embedded text, and supplied transcripts; and reports the proposed checks separately from work actually run. I found no material wrong correction in the central design. The proposed FTS5/Tantivy tradeoff remains conditional and no engine, parser, OCR package, or deployment choice is established.

Two material incompletenesses remain before an implementation choice: (1) a timed supplied transcript is not explicitly bound to the exact audio revision whose timeline it describes; (2) the evidence base does not establish current maintenance/version applicability for all proposed alternatives. There is also a format-level unsupported edge in naming SRT as a candidate without SRT-specific primary documentation or parser evidence. These are follow-up design/evidence issues, not a request to reduce the brief's scope. No final design is written or repaired here.

## Review scope and method

I read the complete brief, discovery, draft, source map, released plan, plan-reveal record, and investigator source index named in the stage input map. I assessed each P1–P5 plan disposition against the original brief. I independently opened or retrieved the governing primary documentation, repository code/tests, and issue/fix pages in S01–S18 and S20. S04 and S17 were only partially independently checked; S19's exact changelog page could not be independently accessed. S21–S22 add official release-currentness checks. Exact URLs, versions/commits, locators, access intervals, observed operations, and limits are in [source-map.json](source-map.json); the navigable list is [sources/index.md](sources/index.md).

No attachment was uploaded. I did not run source code, parsers, SQLite/Tantivy, OCR, fixtures, or application checks. The source pages support only the behaviors and code/tests described in the map. I treat all future integration, multilingual relevance, recognition quality, and race results as proposed validation, not completed evidence.

## Plan-by-plan disposition

| Released-plan area | Critic disposition | Brief coverage and limits |
|---|---|---|
| P1 identity, duplicates, moves, profile changes, replacement failure | Substantially complete. The stable `attachment_id`, byte fingerprint, extractor profile, index profile, and separate note membership correct the digest-only ownership model. Retaining old rows only as stale/previous-version and gating promotion on the latest revision is directly responsive. The draft properly leaves move/copy identity to the owner. | Covers rename/move, replacement, duplicate bytes, re-extraction versus reindex, failed/cancelled replacement, and preserving older generations. The upstream Tantivy deletion test is correctly not presented as proof of application ownership or atomic metadata behavior [S02, S05, S16]. |
| P2 extraction scope, provenance, locations, original evidence, retrieval alternatives | Substantially complete, with the transcript-to-audio binding issue below. PDF text and OCR are separated; native PPTX is explicitly an optional, bounded OOXML scope; supplied transcripts remain optional; unknown/approximate locations and original opening are explicit. The badge is correctly only a summary of per-chunk provenance. | Meets privacy and source-trust constraints; does not require auto-transcription or claim recognition fidelity. FTS5, Tantivy, trigram, dictionary tokenization, and later semantic retrieval are compared with meaningful limitations [S01–S14]. SRT is not source-verified as noted below. |
| P3 bounded work, cancellation, deletion, shared ownership, late completion | Substantially complete and technically coherent as a proposal. One active worker per workspace is retained with a bounded/coalescing queue and resource limits; stale results are query-filtered or explicitly surfaced; membership/tombstone and token checks address shared attachments and late workers. | Correctly distinguishes preservation of old storage from current-result freshness. Exact queue/resource limits and retention policy remain owner/runtime decisions. FTS5 transaction and Tantivy manifest language is proposed architecture, not an executed guarantee [S02, S05, S16, S18]. |
| P4 required disposition areas | Complete at planning level. The summary table maps identity, extraction, provenance, freshness, deletion, and scheduling. | Evidence is bounded to the source versions and operations recorded in the map. |
| P5 required validation checks and executed-versus-proposed reporting | Substantially complete. It proposes mixed-script, replacement/failure, shared deletion, location, parser-bound, and race tests, and clearly reports no implementation/public-fixture check was executed. | This is an honest research result. It does not claim private-corpus relevance, OCR accuracy, or notebook integration. The brief says public/synthetic fixtures can support execution; it does not make such execution a prerequisite for this reference stage. |

## Issue classification summary

- **Material wrong:** none found in the central recommendation or plan dispositions.
- **Material incomplete:** two findings (transcript-to-audio revision binding; current maintenance/version applicability).
- **Unsupported:** one finding (SRT support/test example lacks SRT-specific source evidence).
- **Minor locator/wording:** none identified that changes the plan disposition.
- **Honestly unresolved external input:** one source-access finding (the cited lopdf changelog details); owner/runtime questions remain open by design.

## Findings by classification

### Material incomplete — timed transcript is not bound to the exact audio version

**Draft locators:** `draft.md` P2a at lines 46–46; provenance at lines 50–58; proposed checks at lines 104–107. **Plan locator:** `revealed-plan.md` P2, including transcript offsets and source-version identity. **Evidence:** the draft says VTT/SRT cues provide media-time locations and that the hit opens the clip, but its record describes one exact indexed fingerprint and one logical attachment without specifying whether a transcript is an independently versioned attachment, an audio-owned derivative, or a relation bound to a particular audio fingerprint. WebVTT gives cue offsets in the track timeline, but does not establish that a supplied transcript belongs to the current clip revision [S14].

If an audio attachment is replaced while an old timed transcript remains, the old cue can jump into the wrong recording while still carrying plausible time metadata. Preserve the supplied text and audio provenance separately, record the association to the exact audio content version, and invalidate or visibly mark cues when that association changes. Add a proposed check that replaces audio independently of the transcript, then replaces the transcript independently, and verifies that neither a stale transcript nor stale cue can present as current for the new clip. This finding does not require automatic transcription or corpus accuracy testing.

### Material incomplete — current maintenance/version applicability is not established for candidate choices

**Draft locators:** `draft.md` lines 5, 11, 62–65, 90, 109, and 151. **Evidence:** the draft uses Tantivy 0.26.2 tokenizer/index-writer sources and a 0.26.2 deletion test, while the official Tantivy changelog viewed in this critic pass lists 0.27.0 above 0.26.2 [S01–S02, S16, S21]. The OCRmyPDF sidecar evidence is specifically the v15.2.0 manual snapshot; the official releases page now lists v17.13.0 [S10, S22]. These observations do not disprove the cited version-scoped behaviors. They show that the draft has not evaluated whether newer maintained releases change APIs, sidecar semantics, support status, or packaging suitability, although the brief explicitly asks for maintained repositories.

Keep the comparison conditional, as the draft already does, and refresh the official release/support documentation plus governing code/tests for the version actually considered before any implementation selection. Do not silently transfer a 0.26.2 test or v15.2.0 behavior claim to a newer release. The draft does not itself select either older release, so this is a version-currentness gap rather than a false claim that those versions are current.

### Unsupported — SRT is named without SRT-specific source or parser evidence

**Draft locators:** `draft.md` lines 46 and 104–105. The checked timing source is the W3C WebVTT specification [S14]; it validates WebVTT cue timing, not SRT syntax, parser behavior, encoding variants, or robustness. The draft qualifies this as a supported transcript format, so it does not establish a false implementation claim, but its SRT fixture/support example is unsupported by the evidence package. Either retain SRT only as a future candidate pending a primary specification/parser review and fixtures, or leave its support status explicitly open. Do not let the VTT source ID stand in for SRT evidence.

### Honestly unresolved external input — lopdf changelog details

**Draft locators:** `draft.md` lines 44, 75, 90, 109, and 151; carried source-map entry S19. The direct docs.rs changelog page could not be retrieved in this review, so I could not independently confirm the specific 0.44/0.45 changelog entries in S19. The exact 0.45.0 API docs separately confirm per-page bounded text extraction and the over-limit error [S07]. Keep the changelog-specific regression/security history scoped as unresolved until its cited page or release source is accessible; it is not necessary to conclude that the bounded API exists, and it does not justify any claim that all PDF risks are eliminated.

### No material wrong issue found; material uncertainty is correctly disclosed

The key technical corrections are supported within their stated scope. Tantivy documents tokenizer selection and commit visibility/rollback; its pinned unit test concerns committed index deletion, not external metadata [S01–S02, S16]. SQLite documents unicode61 defaults and the trigram short-query condition; the Polish Ł example is a specific tokenizer boundary, not universal transliteration [S05–S06]. The Tesseract and OCRmyPDF histories are narrow regressions, not accuracy claims [S08–S10, S15, S20]. ECMA-376, quick-xml, zip, and WebVTT support the constrained-format claims in the draft [S11–S14]. SQLite's FTS5 test-source capability gate is described as a build condition and was not represented as a test run [S18].

The opener/retention question is appropriately left to the owner: if old source bytes are not retained, the UI cannot honestly promise a jump to that old version. Likewise, the actual database, shipped FTS5 availability, OCR packaging/language packs, PPTX subset, language analyzers, queue limits, and private-corpus quality remain external product/runtime decisions. Those are openly called unresolved in the draft rather than treated as settled facts.

## Proposed versus executed checks

**Actually performed in this critic stage:** document/plan review; direct inspection of cited official documentation, code/test-source pages, issue/fix history, and release listings as recorded per source. I did not execute their upstream tests or any application code.

**Not executed:** parser/OCR/index behavior, multilingual ranking, synthetic/public fixtures, cancellation/replacement/deletion races, exact-version opening, SRT support, or notebook integration. The investigator draft correctly labels its validation matrix as proposed and its observed research operations separately. No proposed test result should be read as a pass.

## Scope-preserving follow-up questions

1. What stable relation pairs a supplied transcript with an audio clip revision, and what happens to its time locators after the clip is replaced?
2. Which current supported release and platform packaging will be evaluated for each chosen parser/index? Recheck version-specific API and test evidence at that point.
3. Is SRT intended for the first supported transcript set, or should it remain a candidate until parser/spec and fixture evidence is added?
4. Which retention behavior preserves an exact source version for original opening, and how is an unavailable old version labeled?

This review does not choose among those options or write a replacement design.
