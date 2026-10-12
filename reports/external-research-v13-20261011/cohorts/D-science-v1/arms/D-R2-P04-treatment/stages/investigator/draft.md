# Draft — investigator disposition

**Scope.** This covers the complete D-P08 brief and every clause in the released provisional plan. Discovery and source-map were saved before release and are frozen/indexed by stable source IDs. Evidence means documented library behavior or upstream issue history; recommendations and unverified product assumptions are identified. No local parser, database, downloaded code, or public fixture was executed. Checks below are proposals.

## Clause dispositions

### 1. Identity and location

> “The provisional index maps an attachment digest to extracted chunks and associates each chunk with a note ID and a location hint.”

**Disposition: correct the identity model; keep digest as version.** A digest answers which bytes, not which attachment occurrence. Give each attachment occurrence a stable attachment_id, each byte state a source_version (for example SHA-256), and each parse/index attempt an extraction_revision/generation ID that includes parser version/build, config, OCR engine/model/language, and normalization/tokenizer profile. Keep ownership in a separate many-to-many note-to-attachment link. Search hits join chunk → generation/source version → live owner links; do not make note_id intrinsic to an extracted chunk.

Two identical attachments in different notes may reuse one immutable extraction artifact keyed by (digest, extraction_revision), but retain separate attachment links and open targets. A move or rename changes owner/locator/display label, not the bytes or extraction. If a note move changes its ID, update links atomically; actual note identity semantics are unknown. Whether duplicate hits are collapsed or shown per attachment is an owner choice.

Each chunk should carry evidence kind, source version, extracted-text offsets, and a typed locator: page, page+region, slide, time_span, or unknown. Record precision separately as exact, approximate, or unavailable. A transcript character offset is not an audio timestamp. PDF reading order may differ from visual order; OCR boxes refer to rendered page geometry. Promise page/region navigation only after the selected adapter supplies and passes tests. [S03–S05]

**Evidence/inference:** digest/ID separation and association ownership are design recommendations inferred from duplicate/shared ownership requirements; no application schema was inspected.

### 2. Scope, provenance, retrieval, original access

> “Text PDFs and slide exports would use direct extraction where possible; scanned pages would use recognition, and audio would use supplied transcripts only. All chunks would enter the same text index, with a source-type field used for a small badge. Location hints would be page numbers or transcript offsets. Compare provenance representations and retrieval approaches, checking whether a badge and offset convey the requested uncertainty and open-original behavior.”

**Disposition: retain the modest scope and one search surface; strengthen provenance and location semantics.** Index PDF text, slide text, and supplied transcripts in one lexical interface, but keep source type/version on each segment:
- embedded_text: extracted from a PDF/slide text layer. This does not prove human authorship; an existing PDF layer may itself be OCR with unknown provenance.
- app_ocr: OCR run by this notebook, with engine/version, language/model, source page, render dimensions/DPI/rotation/crop transform, and raw confidence when emitted.
- user_transcript: supplied text with its own version and a link to audio where relevant.

A small badge helps but is not enough. Show origin, freshness, and locator certainty in readable form, e.g. “Embedded text — origin unverified,” “OCR — approximate region,” or “Provided transcript — no audio timestamp.” “Open original” must resolve the attachment ID and verify its digest matches the hit. If bytes changed or the old source is unavailable, mark the hit stale; do not silently open a replacement as the same evidence. If location is unavailable, say so and open at the normal start, without inventing a page/time.

Initial support: text PDFs and slide text; optional local OCR for scanned PDF pages; supplied audio transcripts only. Store a slide number when the adapter produces and tests it; otherwise location is unknown. Transcript offsets can highlight transcript text, not seek audio. A time span is valid only when supplied with the transcript or produced by a separately supported alignment step. No automatic-transcription requirement. Tesseract can emit word boxes/confidence in TSV/hOCR, but they are tied to a rendered input and do not establish accuracy. [S02–S05]

**Retrieval recommendation:** use SQLite FTS5 lexical ranking as baseline if the shipped SQLite includes FTS5. Keep text, chunk IDs, ownership/version metadata in one DB and swap generations atomically. Use phrase/BM25 and limited prefix matching; no global multilingual stemming. unicode61 has documented Unicode 6.1/diacritic behavior; Porter is English-specific; trigram offers substring matches with a minimum-three-character caveat. Tantivy 0.26.2 is a Rust-native lexical alternative, but a separate index needs a cross-store commit/version protocol. Semantic/vector search may later find paraphrases but needs a pinned local model, rebuild/delete rules, and provenance joins; remote embedding uploads are out of scope. sqlite-vec is pre-v1 and recent release history includes a DELETE fix, so it should not be in the first correctness path. [S06–S09]

### 3. Freshness, cancellation, deletion, worker bounds

> “Background work would be limited to one extraction per workspace. Cancelled jobs would leave the previous index unchanged, and deletion would remove chunks by note ID. Investigate whether this is a safe freshness rule and prevents dangling content; inspect ownership when attachments are shared across notes or a job completes after deletion.”

**Disposition: one active CPU-heavy job is a conservative initial cap, with a bounded/coalescing queue and version-fenced commits. Correct the previous-generation and deletion rules.** One worker limits simultaneous parse/OCR load but a hung/large file can block all others. Keep note editing independent; coalesce repeated edits to latest version; bound queue, wall time, pages, pixels, output, and worker count. Track actionable typed states: queued, running, ready, partial, failed, cancelled, unsupported, password_required, OCR_unavailable, stale. Tika documents page/pixel limits; the app should set its own job deadline and queue policy. Its security guide says output limits do not bound work and recommends process isolation with heap and timeout bounds for untrusted files. [S03, S12, S13]

“Cancelled jobs leave the previous index unchanged” is unsafe after bytes or extraction revision change. Retain old rows for recovery if useful, but immediately mark them stale and exclude them from ordinary current search; an explicit stale view must label them. A failed/cancelled attempt cannot leave old content current for the new source/revision. Stage new rows and atomically move the active-generation pointer only after parse succeeds and the input digest is rechecked. Before commit, verify attachment still exists, bytes/revision still match, and job was not cancelled or superseded. This fences late completion after a newer edit.

Deletion by note ID alone is unsafe for shared attachments. Remove that note-to-attachment link so that note no longer shows the hit, but retain content while another live owner link remains. Deleting the final link tombstones the attachment and immediately excludes it from ordinary search; physical cleanup can follow. A worker completing after delete must fail its tombstone/ownership/job-token checks and cannot recreate searchable rows. Join results only through live owner links. Stale retention and shared-blob policy remain owner decisions.

**Evidence/inference:** FTS5 makes external-content synchronization caller-owned and warns of unintuitive results when indexes diverge. Tika’s OCR fix also uses conditional replacement/fallback. Atomic swaps, queue policy, tombstone fencing, and ownership joins are recommendations, not observed application behavior. [S03, S06, S10–S12]

### 4. Required dispositions and validation

> “Return evidence-backed dispositions for identity, extraction scope, provenance, freshness, deletion, and bounded scheduling. Propose checks for mixed writing systems, replacement after failed extraction, shared attachments, approximate locations, cancellation, and delayed completion after deletion. Label any executed public-fixture checks and their exact coverage, without claiming measured accuracy on the user's unknown corpus.”

**Disposition: addressed above; all requested checks are proposals, none is claimed executed.** TIKA-4883 is issue-to-fix/regression history: AUTO OCR holds questionable text and replaces it only after a configured recognizer writes text; the merged PR lists PDFParserTest and ContentEnrichersTest. This does not prove this app’s behavior. sqlite-vec’s DELETE fix is additional history relevant to stale vector cleanup. [S08–S11]

## Recommended state contract

| Record | Required behavior |
|---|---|
| Attachment | Stable attachment_id, mutable locator/name, tombstone, live owner links. Digest is never identity. |
| Owner link | note_id ↔ attachment_id. Move/delete updates one link; shared owners survive. |
| Source version | Digest of exact bytes; size/mtime are scan hints, not proof. Recheck after parse. |
| Extraction revision | Parser/build/config, OCR model/language, normalization/tokenizer. A revision change requires new generation. |
| Job/generation | Expected digest/revision, status, timestamps, error, cancel/supersede token, limits and coverage. |
| Segment | Generation, immutable extracted text offsets, evidence kind, typed locator/precision, OCR confidence/transform if provided. |
| Active pointer | Only generation matching current digest and requested revision is current. Failed jobs cannot advance it. |

Reuse a parse artifact across byte-identical duplicate files only if parsing is content-deterministic; include filename/MIME hints when they affect parser behavior. Grouping duplicate hits is optional, but original opening must resolve a live owner and verify its source version. This is an inference to validate.

## Coverage and unresolved decisions

- **Already covered by the plan:** one search surface; direct PDF/slide extraction; scan recognition; transcript-only audio; a source badge; location hints; one-job cap; tests for mixed writing systems, failed replacement, shared ownership, approximate locations, cancellation, and late completion.
- **Corrections:** digest is version, not identity; include parser/model/tokenizer revision; separate ownership; transcript offsets never imply times; old rows go stale on source/revision change; failure/cancel cannot leave old rows current; delete one owner link, not all shared data; fence late commits; verify source version when opening; use typed locator and precision.
- **Optional:** OCR boxes/confidence; language-specific analyzers; trigram; local vectors; duplicate-hit grouping; stale-history view; format-specific adapters if broad parser lacks locators.
- **Rejected:** label OCR as faithful original; treat transcript offset as timestamp; require transcription; send private text to remote services; silently keep old content current after failed replacement; delete all shared content by note ID.
- **Owner decisions:** OCR default/opt-in; Tika/JVM acceptability; move semantics for note IDs; stale retention; supported language statement; visibility of partial extraction; worker queue length/fairness; duplicate grouping; source byte retention versus current-path references.
- **Uncertain:** shipped SQLite FTS5; actual PDF/slide/region output; origin of pre-existing PDF text layers; attachment sharing/storage semantics; transcript timing; runtime/memory on representative files. No app schema or private corpus was inspected.

## Validation matrix — proposed, not run

| Proposed action | Assertion | Status |
|---|---|---|
| Synthetic Latin with/without diacritics, Cyrillic, CJK, Thai, mixed-script identifiers | Record exact/phrase/substring behavior per tokenizer; no broad relevance/accuracy claim. | Not executed |
| Index v1, replace with v2, force v2 failure/cancel | v1 hidden or explicitly stale, never current for v2; partial output cannot advance pointer. | Not executed |
| Same bytes in two notes, then move/delete one owner | Links resolve; deleting one owner does not orphan the other; final deletion removes ordinary hits. | Not executed |
| Change parser/OCR/tokenizer revision with same bytes | New generation is queued; old revision is not current for the requested revision. | Not executed |
| Approximate/unknown PDF, slide, transcript locator | UI states exact/page-only/approximate/unavailable; transcript offset highlights transcript only; no invented coordinates/time. | Not executed |
| Cancel job, delete final owner link, let old worker finish | Commit fencing rejects late output; no resurrection in lexical or optional vector index. | Not executed |
| Timeout, malformed/password file, missing OCR engine/language, partial read | Typed status/retry; editing responsive; no stale content presented as current. | Not executed |
| TIKA-4883-style poor text with OCR success/no engine/page cap/timeout/error | Correct label; no bad concatenation or premature discard; fallback is not a replacement. | Upstream tests reviewed; app fixture not run |
| Delete/replace/rebuild; run FTS integrity check | No deleted/stale term in normal results; metadata/index join consistent. | Not executed |
| Local-only parser on private fixture; inspect network activity | No attachment bytes/text leave local process. | Not executed |

**Executed checks:** plan-release helper froze discovery SHA-256 c78b1d8f91f3dfba9769c168d73885cab6454333251fe7d0dbf4db3b51acbf8d and revealed plan SHA-256 6aff429d38b8870908fba9fe1990d233f83a48e95a464aecfa78d8dd0ad169a6. The required discovery/source-map format check passed. No public fixture, parser, search, accuracy, notebook integration, or race check ran. No measured accuracy is claimed for the unknown corpus.
