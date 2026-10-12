# Investigator draft — D-P08

## Scope and evidence basis

This draft dispositions the exact released plan at `revealed-plan.md` (SHA-256 `6aff429d38b8870908fba9fe1990d233f83a48e95a464aecfa78d8dd0ad169a6`, 2,187 bytes). Discovery was frozen before release: `discovery.md` SHA-256 `0c76a92415d251c7472995238fb437e89ad1f0d5e0f9744428a760e7b350c75b`, 10,999 bytes. Source IDs below are fixed in `source-map.json`; [sources/index.md](sources/index.md) provides a navigable source list. The access window and version/commit scope are recorded per source. Primary documentation, repository implementation/tests, and project issue/fix history were read; no attachment was uploaded, no downloaded code was run, and no parser/index/OCR implementation or public-fixture check was executed.

### Overall disposition

**Revise the identity, provenance, freshness, and deletion rules before implementation.** Keep the plan’s local extraction, supplied-transcript-only audio scope, one active extraction per workspace, and preservation of prior chunks as a recoverable generation. Do not treat an attachment digest as the only identity; do not treat a source-type value and small badge as the complete provenance; and do not regard unchanged old rows after cancellation or deletion-by-note-ID as proof of freshness or safe ownership. Use a versioned materialization and attachment-to-note membership model, atomically publish only a completed extraction for the still-current attachment, and report old results as stale/previous-version or suppress them by default.

A reasonable first lexical implementation is SQLite FTS5 when it can share a transaction with attachment metadata, or Tantivy with an explicit cross-store generation/manifest protocol otherwise. SQLite upstream tests explicitly gate on FTS5 build support; Tantivy 0.26.2 has a delete/commit/reload unit test, but neither source test covers this application’s membership or cross-store publication races. This is a conditional recommendation, not a finding about the notebook’s current storage. Neither engine automatically provides good relevance for every writing system. Preserve lexical search as the baseline; measure multilingual behavior separately before adding language-specific dictionaries or semantic retrieval. Use page/slide/cue-level chunks and only the location precision each extractor can defend. [S01–S07]

## Exact per-clause disposition

### P1 — Identity and stale replacement

**P1a. “The provisional index maps an attachment digest to extracted chunks and associates each chunk with a note ID and a location hint.”**

**Disposition: correct the identity model; keep the digest as a content-version key.** Store at least four distinct values:

1. `attachment_id`: stable logical attachment record, independent of its path and bytes.
2. `content_version`: cryptographic fingerprint of the exact bytes (compute from bytes, not filename or modified time).
3. `extractor_profile_id`: parser/OCR engine version plus relevant extraction configuration and model/language-pack identity.
4. `index_profile_id`: analyzer/tokenizer and schema version used to construct search terms.

A derived materialization is keyed by content version and both profiles. Extractor changes require re-extraction; analyzer changes require a rebuild/reindex even if extraction text is reusable. Equal bytes may share one local parsed/materialized payload, but each logical attachment and every note membership stays distinct. This permits duplicate attachments without merging their ownership, deletion, display, or access behavior. A digest by itself cannot establish whether a source is current, who owns it, which parser made its chunks, or which notes still reference it. Keep an explicit `attachment_id` to note-membership relation rather than treating note ID as the attachment’s identity. The pinned Tantivy deletion test verifies committed term deletion and reader reload, but is not evidence that application ownership or metadata updates are atomic. [S01–S02, S05, S16]

**P1b. “Renaming a file would update its display label without re-extraction.”**

**Disposition: accept conditionally.** A rename or move updates the display label/path and membership only if the resolved attachment still has the same content version. Recheck the content fingerprint when the platform’s rename/move operation does not itself guarantee unchanged bytes. Do not rerun parsing solely for a path change. A note move changes the membership relationship but need not change content identity. Whether moving an attachment transfers one logical record or creates a new record is an owner decision; preserve both possibilities without tying identity to the note path.

**P1c. “Replacing its bytes would enqueue a new job while old chunks remain available with a pending badge.”**

**Disposition: accept retaining old chunks, but change their state and search presentation.** Replacement increments the desired content revision and enqueues that version. Old rows remain tied to their old fingerprint and can support recovery, but a result must say “previous version” or “stale” and identify the indexed fingerprint. During work, show `pending` and keep current and indexed versions explicit. If the replacement fails or is cancelled, transition to `failed`/`cancelled` with the previous fingerprint marked stale; do not leave an indefinite pending badge, or imply those rows match the replacement. Recommended default: exclude stale rows from ordinary current-version results and offer an explicit previous-version view. If the product instead includes stale results inline, the stale/version status must be prominent on each hit and distinguishable from a current result. [S02, S05, S07]

**P1d. “Investigate whether these identities cover duplicate attachments, note movement, extractor-version changes, and stale results during failed replacement.”**

**Disposition: resolved with the preceding model; keep these cases as acceptance checks.** Duplicate bytes may reuse storage but not logical membership. Note moves update relations. Parser/profile and tokenizer/schema changes generate new materializations. Failed replacement never promotes the target fingerprint and never relabels the prior materialization as current. Reuse a known-good materialization only when content fingerprint and all applicable profile versions match.

### P2 — Extraction scope, modality, locations, and original evidence

**P2a. “Text PDFs and slide exports would use direct extraction where possible; scanned pages would use recognition, and audio would use supplied transcripts only.”**

**Disposition: accept the boundaries, make “where possible” explicit per format, and keep audio transcription optional.** For PDF, use bounded per-page text-layer extraction where it exists; an empty text layer is not evidence that a scan contains no text. A scan may be OCR-eligible, and any recognized text is OCR-derived. A PDF slide export follows this PDF path and can offer page/slide number. Native PPTX text is a separate optional parser scope: a ZIP/OOXML reader must follow package relationships and namespaces and declare which text parts it supports. It can initially report slide and shape ID/name; do not claim a screen-space region unless coordinate transforms are validated. A qualified office-to-PDF converter is an alternative only if its external runtime is accepted and pinned. Malformed, encrypted, unsupported, oversized, or partially unreadable inputs need a typed unavailable/partial result, not silent omission. [S07–S13]

For short audio, index a supplied VTT/SRT or other supported transcript only. Use cue start/end as media time where the transcript supplies valid cues; if a transcript has no timing, its locator is unknown and the clip opens at the beginning. An audio item with no transcript can still be listed and opened but contributes no transcript text. Automatic speech recognition is not required and should remain a later, explicit opt-in. This preserves the original brief’s privacy and avoids a false transcription-accuracy obligation. [S14]

**P2b. “All chunks would enter the same text index, with a source-type field used for a small badge.”**

**Disposition: keep a common lexical index if useful, but make modality per chunk and use a structured provenance record.** A single PDF may have native text on some pages and OCR on others, so an attachment-wide type is insufficient. Use modality values such as `embedded_text`, `ocr`, and `provided_transcript` for each chunk. A compact badge is useful, but it must link to or expose the version and source detail. At minimum each hit resolves to: logical attachment ID; exact indexed content fingerprint; modality; extractor/profile version; locator and its coordinate frame; location-quality enum (`source_offset`, `page_only`, `region`, `media_time`, `approximate`, or `unknown` as applicable); and any partial/error status. Keep source text and normalized/index text separate. If extraction or normalization changes offsets, do not display those offsets as original-source positions without a mapping. Tesseract TSV boxes are image-canvas coordinates; page-region navigation requires validated conversion across rotation/crop/scale. Until then label OCR results page-only. [S07–S09, S12, S14]

**P2c. “Location hints would be page numbers or transcript offsets.”**

**Disposition: broaden and type the locator, not all locators are offsets.** Use a one-based page for page-only PDF text; a region only for a parser/OCR output whose coordinate system can be mapped and opened correctly; a slide plus shape reference for supported PPTX text; and start/end time for cue-based transcripts. Preserve unknown or approximate as explicit values and display them honestly. Do not turn a byte/character offset in an extracted string into a page position. An unsupported location still allows opening the exact original attachment without claiming a jump location. [S07–S08, S11–S14]

**P2d. “Compare provenance representations and retrieval approaches, checking whether a badge and offset convey the requested uncertainty and open-original behavior.”**

**Disposition: badge plus untyped offset is inadequate; use the structured record above and keep open-original as a first-class hit action.** The opener should resolve the exact indexed attachment version from a local immutable/versioned source when available. Verify the currently accessible source against the result fingerprint before a jump. If only a changed current path is available, identify the mismatch and do not silently imply it is the source the result describes. Snippets are derivative text, not original evidence; the user must be able to open the original without trusting the snippet or OCR. A region jump is optional and follows only when its coordinate frame is known.

Retrieval alternatives:

- **SQLite FTS5**: compact lexical candidate and, when metadata is in that database, the simplest candidate for atomically replacing chunks and status together. `unicode61` is case-insensitive and uses Unicode 6.1 categories; by default it removes Latin diacritics, but this is not universal transliteration (for example, Ł/ł does not fold to L/l through that option). `porter` is English-specific. `trigram` supports substring search but full-text queries under three Unicode characters do not match. Confirm the embedded SQLite build has FTS5. [S05–S06]
- **Tantivy**: Rust-native lexical search with field-specific/default/custom tokenizers and explicit commits/rollback. A common default is not enough for all scripts, and the mixed-language indexing issue is an observed open question. Lindera provides a dictionary-backed tokenizer integration candidate; selecting it adds dictionary size, license, build, upgrade, and per-language fixture work. Avoid presenting any of these as measured relevance results. [S01–S04]
- **Character/trigram retrieval**: useful supplemental exact-substring route for text without whitespace boundaries; expected to broaden matches and consume more index space. Test short-query behavior and ranking.
- **Semantic/vector retrieval**: optional later comparison, not a substitute for lexical matching or version provenance. It needs a local model/runtime decision and representative relevance fixtures; the private corpus is unavailable.

### P3 — Bounded work, cancellation, and deletion

**P3a. “Background work would be limited to one extraction per workspace.”**

**Disposition: accept as the active concurrency ceiling, and specify queue/backpressure behavior.** Run at most one extraction per workspace, with a bounded queue and at most one coalesced queued request per logical attachment for its newest desired revision. Bound file bytes, expanded archive bytes/entries, page/slide count, OCR duration, memory/temp storage, and overall job time. Cancel obsolete queued work; check cancellation between pages and before publication. Surface `queued`, `running`, `partial`, `failed`, and `cancelled` states with stage-specific messages and retryability. These are proposed controls; specific limits and packaging are owner decisions. [S07–S09, S13]

**P3b. “Cancelled jobs would leave the previous index unchanged.”**

**Disposition: reject as a complete freshness rule; accept only as a storage-preservation rule.** A cancelled job may leave the old bytes/rows intact for rollback, but the attachment’s current version must be marked `cancelled`/`stale` and never portrayed as indexed for the new fingerprint. Extraction runs into a staging generation. Immediately before promotion, confirm the job is uncancelled, its target revision is still current, and the attachment still has an eligible membership. Only a complete, acceptable result is promoted. With FTS5 metadata/chunks can be switched in one database transaction. With Tantivy, commit a complete generation and atomically advance a manifest/metadata state; account for the fact that Tantivy deletes and additions become visible at commit, and rollback restores the last committed state. Tantivy 0.26.2 upstream tests exercise term deletion and reload over committed segments, while SQLite upstream tests show that the FTS5 test file is skipped when the build lacks the FTS5 capability. Neither upstream suite substitutes for application race tests. [S02, S05, S16, S18]

**P3c. “Deletion would remove chunks by note ID.”**

**Disposition: reject note-ID-only deletion as unsafe for shared attachments.** Model attachment-to-note membership separately. Removing an attachment from one note removes that membership; results remain available to another note only through its still-valid membership. Query results must join/filter through current membership (or an equivalent authorization/tombstone gate), even if physical index cleanup is deferred. Remove the shared materialization only after no memberships remain and the product’s retention rule allows it. A workspace-wide attachment deletion tombstones every membership and prevents both search and an in-flight job from restoring rows. This prevents a stale Tantivy segment or queued extractor from resurrecting deleted content. Physical cleanup can be asynchronous only after the query gate makes deleted rows unavailable. [S02]

**P3d. “The draft assumes this is a safe freshness rule and prevents dangling content; inspect ownership when attachments are shared across notes or a job completes after deletion.”**

**Disposition: the assumption is not supported; the identified inspection is required and now has a concrete rule.** A worker captures `attachment_id`, target content revision, profile IDs, and an operation token. At completion it checks that token and revision remain current and that membership still exists. If note deletion, workspace deletion, replacement, or cancellation invalidated the token, discard staging output and do not publish. When one membership is deleted but another remains, retain only the surviving membership’s access. Tests must cover both branches.

### P4 — Required disposition areas

| Area named by the released plan | Disposition | Evidence basis |
|---|---|---|
| Identity | Separate stable logical ID, content fingerprint, extractor profile, and index profile; digest identifies bytes/materialization input, not ownership. | Tantivy field/tokenizer and update model [S01–S02]; SQLite index options [S05]. |
| Extraction scope | Bounded PDF text layer; optional/explicit local OCR; slide PDF via PDF; native PPTX only with defined OOXML support; supplied transcripts only. | PDF limit [S07], Tesseract outputs/history [S08–S09], OCRmyPDF sidecar limitations/regression [S10, S15], OOXML/ZIP/XML [S11–S13], WebVTT timing [S14]. |
| Provenance | Per-chunk modality plus exact source version, engine/profile, typed locator and quality; small badge is a summary. | Extractor location/output format behavior and issue evidence [S07–S10, S14–S15]. |
| Freshness | Stage, verify target revision/cancel token, then atomic promote; failed/cancelled results leave prior rows explicitly stale, not current. | Tantivy commit/rollback/delete semantics [S02]; FTS5 candidate [S05]. This is a proposed architecture, not a check executed. |
| Deletion | Remove membership first; suppress via membership/tombstone; only purge shared materialization after last membership; reject late worker publication. | Directly follows ownership case in released plan; project index update semantics inform cleanup [S02, S16]. Requires product validation. |
| Bounded scheduling | One active worker/workspace plus bounded, coalescing queue and per-input resource/time caps; typed progress/errors. | Per-page decompression bound [S07], OCR behavior/history [S08–S10], ZIP member risks [S13]. Exact limits remain unselected. |

### P5 — Proposed checks versus executed checks

**Proposed validation plan (not executed):**

1. **Identity, duplicate and movement:** use two note memberships for identical bytes; assert byte materialization can be reused while both logical IDs and memberships remain independent. Rename/move unchanged bytes and confirm no re-extraction; replace bytes at the same path and confirm the new fingerprint queues work; move a note and verify membership/search scope.
2. **Extractor/analyzer updates:** change extractor/profile version without changing source bytes and verify re-extraction/materialization invalidation; change only analyzer/tokenizer schema and verify reindexing is required. Do not let an old profile pass as current.
3. **Freshness and failure:** delay extraction, edit the note or replace the source, cancel/fail partway, and allow a prior job to complete late. Assert no stale target publishes as current; prior hits are hidden from current results or carry unmistakable previous-version status and fingerprint. Verify failed/cancelled state is not a permanent `pending` badge.
4. **Shared deletion and races:** delete one of two note memberships during a job and ensure only the remaining note can retrieve it; then delete the last membership while a worker is in flight and ensure query filtering hides old chunks immediately and the worker cannot recreate them. Verify reattachment is a new/current membership action rather than accidental resurrection.
5. **Provenance and locations:** fixtures for embedded-text PDF, scan, mixed native/OCR pages, slide PDF, a minimal supported PPTX, timed VTT/SRT, and transcript without timestamps. Assert per-chunk modality; exact page/slide/time locators where supported; unknown/approximate status otherwise; transformed OCR box mapping across rotation/crop/scale; original-open exact version check; no false precise jumps.
6. **Parser/error bounds:** public and synthetic malformed/oversized PDF and OOXML ZIP fixtures, encrypted/unsupported inputs, archive expansion limits, invalid transcript cues, partial unreadable pages, timeout, cancellation, and retry. Check that an unsuccessful parser does not silently delete the last good generation and that deleted material is not query-visible.
7. **Retrieval/relevance:** proposed multilingual test set spanning English, accented Latin (including Polish Ł), Arabic, CJK, and mixed scripts, with exact names, short queries, punctuation, and expected passages. Compare FTS5 unicode61, trigram, Tantivy defaults, and a dictionary analyzer only where available. Report coverage/query outcomes, not an ungrounded universal quality claim.
8. **Separate evaluations:** public/synthetic OCR checks validate output shape and locator plumbing only; a recognition-quality evaluation needs representative labelled samples. Future notebook integration and private-corpus multilingual relevance are separate proposed tests because the corpus/runtime is unavailable here.

**Executed checks and observed coverage:** No implementation, parser, OCR engine, index, multilingual relevance fixture, or notebook integration check was run. The research actions were reading the supplied brief and released plan, one helper release operation, and primary documentation, source-code, test-source, and repository-history inspection linked by source ID. Upstream test source was inspected but not executed. Thus there is no measured accuracy, ranking, replacement-race result, security result, or package compatibility result to report. [S08–S10, S15–S20] document scoped prior regression cases; they are not tests executed for this proposal.

## Corrections, optional improvements, owner decisions

### Required corrections

- Replace “digest maps chunks to note ID” with separate attachment ID, membership, content fingerprint, extraction profile, and index profile.
- Make provenance per chunk; a source-type badge alone cannot identify source version, extraction method, location precision, or partial status.
- Treat the open-original control and version verification as part of each result’s provenance contract; snippets do not stand in for the original.
- Retain prior chunks only as a named prior generation. Failure/cancellation must set stale/failed/cancelled against the new revision, not leave old results apparently current.
- Make promotion conditional on latest-revision, cancellation, and live-membership checks; publish extraction and freshness metadata atomically or through a generation manifest.
- Replace note-ID deletion with membership removal, query-time suppression/tombstones, last-owner cleanup, and late-worker rejection.
- Bound queue size and work resources in addition to limiting active extraction to one/workspace.

### Optional improvements

- Begin with page/slide/cue chunks; add positioned PDF/OCR regions only after coordinate mapping fixtures pass.
- Try a custom/Lindera analyzer or a trigram lane for scripts poorly served by word splitting after a multilingual fixture comparison.
- Add local OCR only as an explicit supported dependency with a tested language-pack matrix. Do not upload attachments.
- Consider native PPTX extraction or qualified PDF conversion after deciding whether PDF slide exports meet the first scope.
- Consider semantic retrieval later, with a local model/privacy choice and separate relevance evaluation.
- Preserve partial parse summaries and user-actionable errors (unsupported, password required, corrupt page, timeout, language data missing) rather than an undifferentiated failure.

### Owner decisions still open

1. Is native PPTX text required now, or are PDF slide exports sufficient for v1? Which slide tables, charts, notes, or embedded objects are in scope?
2. Is OCR an installed/local opt-in for v1? Which OS packaging, language packs, max page count, and timeout are acceptable?
3. Is SQLite already the metadata store and does the shipped build include FTS5, or should Tantivy be evaluated as the standalone index? This research does not infer the existing persistence layer.
4. Which languages receive dedicated morphology dictionaries at launch, and who approves their size, licensing, versioning, and upgrade behavior?
5. Should stale previous-version matches be hidden from ordinary search by default? Recommended yes, with an explicit recovery view.
6. What does an attachment move/copy mean for stable logical identity and note membership? Is a workspace-shared attachment an intended model?
7. What privacy-preserving local retention policy lets “open the exact original version” work after replacement? If older bytes are not retained, how should a version mismatch be presented?
8. Choose actual bounds for input bytes, ZIP member count/expanded bytes, PDF pages, OCR wall time, temporary disk, queue depth, and partial-result behavior.

### Already covered, rejected, and uncertain

- **Already covered and retained:** content digest; rename without extraction when bytes stay the same; enqueue replacement; separate recognition for scans; supplied transcript-only audio; one active extractor per workspace; prior chunks retained during work; user-requested coverage for mixed scripts, replacement failure, location uncertainty, cancellation, and delayed deletion.
- **Rejected or narrowed:** digest alone as complete attachment identity; note ID as unique ownership key; tiny source-type badge as complete provenance; unchanged old rows as a sufficient cancellation/freshness rule; delete-by-note-ID for shared attachments; page/character offsets represented as precise source regions; unqualified claims of OCR fidelity or multilingual relevance.
- **Uncertain pending owner/runtime evidence:** duplicate-record semantics; exact attachment-move/copy lifecycle; selected index engine; whether FTS5 is enabled; OCR packaging/language support; native PPTX requirement and supported content; coordinate mapping quality; exact resource limits; older-source retention. The source records do not establish this product’s storage/runtime or private-corpus performance.

## Source and scope notes

See [source-map.json](source-map.json) for URL, observed version/commit, locator, access UTC, governing default/condition, and applicability for [S01–S20](sources/index.md). Important limitations: Tantivy issue #2619 is a project question rather than a formal support matrix [S03]; the SQLite Unicode61 example is a tokenizer-specific boundary, not a claim about all Unicode search [S05–S06]; OCRmyPDF/Tesseract issue histories concern specific bugs and versions [S09–S10, S15]; and all proposed location transformations require implementation fixtures [S08, S11–S14]. Upstream Tantivy and SQLite tests cover only the cases named in their source records; they were inspected but not executed here [S16, S18].
