# C-P03 — Complete research-backed import proposal

Stage: investigator, run C-R2-P01-treatment. This draft uses only the assigned brief and the released copy at [revealed-plan.md](revealed-plan.md). The independent discovery was frozen before release at SHA-256 `d36b897f466633cc6c75e9b0d7b3b159adca7358dbe8e43c90ae20f06cf22294`; its evidence index is [sources/README.md](sources/README.md) and detailed source identity records are in [source-map.json](source-map.json). Source IDs below link to individual index entries.

## Proposed outcome

Build the import as four visible stages: profile, stream and stage, review, then atomic apply. Parse incrementally into local disk-backed staging with raw values and provenance. Inference may offer candidates, but user-confirmed configuration governs meaning. Read and validate to EOF before any accepted observation changes. Preview a paged row diff with counts and reasons. Apply an accepted set in one outer transaction, preserving earlier observations and writing an auditable decision/revision link. Cancel or fail before commit with no change to accepted data. No source-file edits, service upload, silent value coercion, filename identity or implicit library winner.

The choice between Rust csv and DuckDB for parsing, and between SQLite and DuckDB for persistence, remains open. The candidate reader in Rust csv offers reusable one-record streaming and source positions; defaults include first row as header and fixed row width. It is UTF-8 strict in string mode, with byte-record APIs available [S01](sources/README.md#s01), [S02](sources/README.md#s02). DuckDB offers sampling-based dialect/type detection; its default type sample is 20,480 rows, with whole-file sampling or all-string parsing as options [S06](sources/README.md#s06). DuckDB and SQLite both document transactions, with different concurrency behavior [S10](sources/README.md#s10), [S11](sources/README.md#s11), [S12](sources/README.md#s12). Benchmarks and compatibility against target desktop packages remain proposed work; no engine is nominated here.

## Exact released-plan clause disposition

| Released-plan clause | Disposition |
| --- | --- |
| Sample-based inference of delimiter/date/unit/missing values, confirmed in preview and then applied uniformly | **Revise the authority of inference.** Treat sample and metadata inspection as suggestions only. Use explicit or user-confirmed parser, timestamp, unit and null rules; run the chosen rules against every row through EOF. |
| Logger identifier plus timestamp as identity; second import is a revision; logger ID falls back to filename | **Revise identity and reject the filename fallback.** Keep a documented stable event ID when available, otherwise use a qualified semantic key as a candidate and compare alternatives. A match is not automatically a revision. Filename is display metadata, not identity. |
| Stage then publish in one transaction; cancellation deletes stage; interrupted import restarts; disk stage and transaction presumed sufficient | **Retain the stage/review/apply boundary; revise visibility, cleanup and recovery claims.** Disk staging controls memory only if reads and previews remain bounded. One outer transaction provides atomic apply only for writes inside it; it does not make prior parse errors harmless or itself guarantee every crash/power-loss durability property. |
| Compare identities and reconciliation, identify manual confirmation, propose tests, preserve lineage | **Retain and expand.** The proposal below supplies identity alternatives, manual decision points, a test matrix and explicit lineage. |
| Deadline and research-versus-test instructions | **Preserve as controls.** The 60-minute cap is not a product duration or validation result. No synthetic code test or benchmark was executed; tests listed below are proposals. |

### Clause 1 — discovery authority, schema, and contradictions

**Correction.** A small sample cannot silently decide file meaning. DuckDB's own defaults sample 20,480 rows for type inference; compressed/non-seekable inputs may sample only from the start, and the documented full-sample alternative scans the entire file [S06](sources/README.md#s06). Historical issue reports show why late or mixed date/string values and changes between releases need regression fixtures [S08](sources/README.md#s08), [S09](sources/README.md#s09). A parser accepting a row is also not sufficient evidence that its meaning is right: Rust csv has a documented case where invalid whitespace/quoting was salvaged into a different parse [S20](sources/README.md#s20).

**Disposition.** Show inferred delimiter, quote/escape, encoding, header status, column candidates, recognized unit-label candidates, date formats, and possible null tokens with the evidence/sample count and uncertainty. Do not claim unit recognition from numeric value distributions; units require an explicit label, a confirmed logger profile or a user choice. The screen should show several rows, including later examples and counts for each candidate. User confirmation creates an immutable profile revision bound to the import. Raw bytes/strings remain available. Full-file validation must check every record for row width, decoding, date/value parse, configured null marker and unit compatibility. A contradiction invalidates the current preview and identifies its first/all affected logical records; it cannot be silently coerced into a fallback type. A user may correct the profile and re-run.

RFC 4180 defines a common comma/quote profile and equal-width records but is informational and itself notes implementation variation [S04](sources/README.md#s04). W3C CSVW supplies a useful explicit vocabulary for dialect, schema, datatypes and per-column null markers; its empty-string null default is a convention, not evidence about logger semantics [S05](sources/README.md#s05). Therefore detect empty fields and common spellings as candidates, but never decide that empty, NA, N/A, -9999 or zero is missing without a per-column rule. Preserve source text and distinguish blank, configured missing, invalid, and numeric sentinel.

**Alternatives.** Offer either (a) no inference beyond displaying raw headers/rows, then require profile selection, or (b) suggested detection with a complete validation pass and explicit confirmation. A future logger template may prefill the same explicit profile. Neither path grants an auto-inferred value permission to override a late contradiction. A detected delimiter or date order that remains ambiguous stays unresolved.

### Clause 2 — overlap, duplicate and revision identity

**Correction.** Logger ID plus timestamp is insufficient as a universal key: two valid observations may share a coarse timestamp, one logger may report multiple properties/depths, clocks may change, and metadata corrections can alter a station, unit or zone. Row positions change when a file is reordered. A filename fallback merges renamed files and treats a new file with the same name as old; reject this rule. OGC SensorThings 1.1 provides a useful semantic vocabulary that classifies observations by event time, feature of interest, observed property and procedure/sensor, while also recognizing that sensor interfaces may be proprietary [S18](sources/README.md#s18).

Compare at least these strategies in design review:

1. **Stable event key:** a manufacturer/logger observation ID scoped by instrument/deployment (and source identity if IDs can repeat). Best for recognizing corrected values if the ID is documented as stable and unique. Missing, reused or reset IDs make it unusable; show collision counts rather than assume uniqueness.
2. **Semantic composite key:** site/feature + sensor/deployment + observed property + event instant or interval + applicable depth/location/method/sample context. Keep result value out of the key so a changed value can become a revision candidate. It can collide where required context is absent, where time is ambiguous, or where multiple readings legitimately occupy the same instant.
3. **Exact-content fingerprint:** hash the exact source bytes for file-level re-import idempotence; separately fingerprint a canonical observation including original or normalized timestamp, property, contextual fields, unit and value. A byte-identical file is an exact replay, but a changed file digest does not tell whether any row is new. Content equality cannot identify a changed-value correction, and identical readings can be distinct physical events.
4. **Tolerance candidate search:** after explicit station/parameter/timezone/unit mappings, rank likely overlaps by configured time tolerance and location/depth/method. This can find rounded clocks or resampled times, but is not identity. False matches can erase real close readings; return candidates for user action only.

**Disposition.** If a stable ID is documented and observed unique, propose it as the strongest identity. Otherwise compare the composite key and fingerprint; use a fuzzy candidate only as an aid. Show outcomes separately: exact replay, same-key/same-result, same-key/changed-result revision candidate, close-time candidate, collision/ambiguous, and new observation. Exact replay can be idempotently ignored in the accepted view while retaining the import-batch provenance. A changed result never automatically replaces the earlier accepted observation. The volunteer chooses keep both, append a proposed revision, or leave prior data intact; a “replace” choice must name its scope and version target while retaining historical rows.

**Timestamp correction.** Preserve original timestamp text and the applied format/zone. RFC 3339 full timestamps include Z or a numeric offset; its unqualified local time is not an unambiguous instant, and -00:00 conveys an unknown local offset [S19](sources/README.md#s19). When only wall time exists, ask for a source timezone or leave it unresolved. A named zone may map a wall time to Chrono Single, Ambiguous (two instants during a fold), or None (gap/error); never silently pick an offset/side of daylight change [S16](sources/README.md#s16). Compare mixed-clock imports only after these rules are confirmed.

**Unit correction.** Preserve the unit token exactly. If the unit is known, capture measured quantity, unit vocabulary/mapping version and conversion formula; only compare values after confirmed compatible conversions. UCUM v2.2 distinguishes case-sensitive terms and includes conversions that require a function, while its coverage is not a guarantee that an unknown logger label is valid UCUM [S17](sources/README.md#s17). If a later file changes units or a prior interpretation is corrected, rerun it under a new profile and preview raw old/new units and converted values side by side. Do not reinterpret or delete accepted history in place.

### Clause 3 — stage, preview, atomic apply, cancellation and restart

**Retain with a stricter boundary.** Stream one logical record at a time into a temporary, local, disk-backed staging store; hash the full source during the scan. Store a staging manifest with file digest, visible filename, size, parser/version, dialect, encoding, profile hash, row/byte counters and state. Store raw row/cell text, logical record number and byte position, typed candidate or error, normalized form only where confirmed, and match candidates. Because quoted cells can contain newlines, source locations use parser positions/logical records rather than treating physical line numbers as row IDs [S02](sources/README.md#s02), [S04](sources/README.md#s04). Do not load all rows into memory. Provide bounded progress and paged row details from staging; cap previews in the UI without capping the validation pass.

Staging rows are not observations and are invisible to normal notebook queries until apply. A malformed final record after millions of valid staged rows marks the batch invalid; no accepted data changes. Preview becomes a diff against the accepted data: counts and paged examples of additions, replays, unchanged observations, revision candidates, ambiguity, invalid rows, configured missing values, and conversions. It names each earlier batch/value that may be affected, and says which rows stay, supplement, or are proposed for revision. The selected source's digest is checked again before apply; a changed source or a changed database generation invalidates stale preview and requires a re-preview. Source file bytes are never rewritten or uploaded.

Apply the import-batch record, accepted observation versions, lineage links and active-view choice inside one outer database transaction, then commit only when the whole user-selected batch and its audit events succeed. Any apply constraint/error or cancellation before COMMIT rolls that outer transaction back. Do not commit row chunks independently; that would violate all-or-nothing. SQLite allows only one writer, so keep parsing and preview outside the write transaction and specify a busy/retry path [S12](sources/README.md#s12). SQLite savepoint RELEASE inside an outer transaction is not an independent commit [S13](sources/README.md#s13). Avoid IGNORE, FAIL and REPLACE import conflict modes: IGNORE skips rows, FAIL may retain earlier statement changes, and REPLACE deletes conflicting rows [S14](sources/README.md#s14). Use explicit unique constraints and conflict targets tied to the selected key, with append-only revision events.

DuckDB is a valid transaction/storage alternative: documented begin/commit/rollback and failed multi-statement rollback behavior support comparison, but concurrent updates to the same row can conflict and require a retry [S10](sources/README.md#s10), [S11](sources/README.md#s11). SQLite is a single-file embedded candidate with a one-writer limitation and savepoints; compare size, read/query workload, packaging, recovery, and expected transaction duration on the actual desktop environment rather than selecting from documentation alone. If SQLite WAL is selected, require SQLite 3.51.3 or later (or a documented patched backport) because the official history reports a WAL-reset corruption bug through 3.51.2 under concurrent write/checkpoint conditions [S15](sources/README.md#s15). The release note is a version floor for that defect, not a complete durability specification. Check actual journal/synchronous settings and local filesystem behavior.

**Cancellation/restart correction.** Cancellation before apply discards or marks the unaccepted staging batch abandoned, and cleans it later; it never removes prior data. During apply it requests full transaction rollback and confirms failure/cancel state. After commit it cannot erase history; a later explicit revision/compensation event is required. The plan's restart-from-beginning rule is the simplest safe parse-restart baseline. Add an optional resume checkpoint only if it records source digest, parser build, profile hash, verified record boundary and staging checksum; on any mismatch restart from byte zero. After an interrupted commit, verify transaction rollback and let the user retry apply from the still-verified staged input, or re-parse if it cannot be proven intact. Cleanup needs expiry/quota and an explicit recovery screen so interrupted staging is neither accidentally imported nor silently lost.

Disk staging addresses memory pressure only when parsing, preview aggregation and display paging are bounded. A whole-file transaction may have a long write window and require rollback-journal/WAL space; chunking writes to shorten it sacrifices atomicity. Expose progress, temporary disk estimate, cancel, retry and last error location. Crash/power-loss durability depends on engine/version/journal settings, storage and OS; transaction documentation alone cannot establish it. DuckDB's CSV documentation also exposes a finite default maximum record-line size and optional reject/skip paths, which must be configured and surfaced rather than confused with a valid partial import [S07](sources/README.md#s07).

### Clause 4 — complete product behavior, lineage and validation

Proposed lineage entities (names are conceptual, not a schema mandate):

- **Source version:** content digest, display name, size, observed metadata and scan time. Digest identifies exact bytes; filename is never a key.
- **Import batch:** stable local ID, source version, parser/library release, detected and selected dialect, profile ID/hash/version, user, status, preview generation, decision and commit/abort times.
- **Staged row:** batch ID, logical record/byte locator, raw row and cells, parse status, raw timestamp/value/unit, interpreted fields, warnings and candidate-match links.
- **Observation revision/event:** prior accepted version, candidate new version, the source row/batch, exact user decision, reason and active-view state. Preserve raw and normalized values and all interpretation metadata; do not overwrite source history.
- **Profile revision:** header mapping, encoding/dialect, type/date formats, timezone rule, per-column missing markers, unit mappings/conversion functions and identity components. Edits create a new revision and trigger a rerun.

Before apply, bind the preview to both source digest and database generation. On commit, compare against that generation inside the transaction; if another import changed the relevant data after preview, roll back and recompute the diff rather than applying a stale decision. Unique constraints depend on the confirmed identity policy; never make filename or result value a universal uniqueness key. Keep review outcomes local and explainable.

#### Original brief coverage

- **Different headers, labels, dates and missing-value conventions:** visible configurable profile and per-column rules; no unknown logger convention is assumed.
- **Incremental parsing and files larger than memory:** one-record streaming, bounded buffers, disk staging, paged preview and progress; memory remains to be measured.
- **Re-imported, overlapping, truncated and revised files:** digest/file-version separation; multiple identity strategies; full EOF validation; explicit replay/revision/supplement classification.
- **Show changes before commit:** preview includes row-level examples, counts, warnings, before/after raw and normalized values, selected action and affected history.
- **Volunteer corrections and reruns:** versioned mapping/profile and deterministic re-stage; a changed interpretation does not rewrite accepted history.
- **Previous import behavior:** explicit supplement, scoped revision, or leave intact. Any replacement of the active view is a named, reviewed action retaining old values and provenance; no same-name deletion.
- **Malformed late row and transaction:** finish parse/validation before applying; whole-file outer transaction; any late parse error leaves accepted state unchanged.
- **At least two overlap approaches:** stable event ID, semantic composite key, exact content fingerprint and optional fuzzy candidates are compared above with failure modes.
- **Time zones and units:** keep offset/zone/value/unit text, request explicit context for ambiguous local times or changed units, and do not invent missing values or conversions.
- **Local storage and source safety:** all staging/storage is local; no service transmission or source rewrite.
- **Alternatives without a winner:** Rust csv and DuckDB parser; SQLite and DuckDB storage/transactions; exact package/version and workload comparison still required.
- **Tests versus evidence:** this is a plan, not a deployment; source research and plan-reveal gate are the only executed steps. No synthetic parser/storage code test, benchmark or UI test was run.

#### Corrections, optional improvements, and owner decisions

**Corrections required by the stated safety goals**

1. Remove automatic semantic authority from a sample. Require explicit approval and full-file validation; no unresolved contradiction can silently flow into apply.
2. Remove filename-derived logger identity. Use a verified event identifier or a qualified composite key with collision review.
3. Do not equate duplicate identity with revision. Distinguish replay, unchanged, candidate correction and ambiguous proximity; preserve old accepted observations.
4. Stage privately and make all accepted writes/provenance atomic in an outer transaction. Errors/cancellation cannot create a partial accepted batch.
5. Preserve raw input plus exact interpretation and import lineage; never rewrite the input or upload it.

**Optional improvements**

- Offer saved logger profiles with date/encoding/dialect/unit signatures and a “profile changed” warning.
- Add preview filters for invalid rows, changed values, suspected overlap and configured missing markers.
- Add resumable scan checkpoints after verifying digest/profile/parser/checksum invariants.
- Add a batch queue for multiple local files while retaining a separate preview/decision per source.

**Owner decisions still needed**

1. Which logger families, stable IDs, sensor/site/deployment identities, measured-property names and interval context are in scope?
2. Should a user be able to accept a file while omitting explicitly listed invalid rows, or must every row be valid? Default proposal: no omission unless each excluded row is visibly approved and logged.
3. Which ambiguous-match outcome should be the default: keep both, leave unchanged, or require a decision before any apply? Default proposal: block only affected rows/batch from automatic merge, preserve earlier accepted data.
4. What does “replace” mean: replace an active selection/view or replace physical stored values? The proposal supports only a scoped active-view switch with historical values retained.
5. Which date formats/timezone rules are confirmed per logger, including DST folds/gaps and device clock resets?
6. Which unit vocabulary and mappings are validated for each measured property, including whether arbitrary/custom units are allowed?
7. Which exact blank strings and sentinels mean missing for each logger/column/version?
8. What are maximum file size/record length, temporary disk allowance, acceptable preview/apply time, and expected cancellation responsiveness?
9. Which parser/database versions and encodings must be shipped on supported desktop platforms, and what durability/journal policy is required?
10. Is restart-from-zero acceptable for very large files, or should verified staging checkpoints be in the first release?

#### Validation proposal and execution record

**Proposed, not run:** unit tests for each configured dialect/header/encoding; malformed quotes and unequal widths at the final record; mixed date formats and ambiguous date order; explicit null markers versus zeros/sentinels; timezone offsets, naive times, daylight fold/gap and clock reset; known/unknown/changed/incompatible units; repeated readings with same timestamp; changed values under stable IDs; reordered and renamed sources; exact replay; candidate matches within/outside configured tolerance. Integration tests should compare accepted row counts, batch lineage and active revision before/after a malformed late row, bad mapping, constraint failure, cancellation during staging/apply, and a source changed after preview. Restart tests should cover source/profile mismatch and verified checkpoint resume. Crash tests should terminate at staged, mid-transaction and post-commit boundaries, inspect rollback/recovery, simulate disk-full and corrupt files, and exercise WAL checkpoint/write concurrency for the exact SQLite version. Stress tests should exceed available memory, include huge records, high row counts and disk pressure while measuring peak memory, staging size, responsiveness and cancel latency. UI tests should ensure every affected row/action and unknown interpretation is visible before commit.

**Executed:** online primary-source research and the one-time plan-release helper only. No parser/storage implementation, synthetic executable witness, database, stress test, restart test, corruption test, benchmark or UI test was run. Proposed tests above must not be represented as completed evidence.


## Cross-cutting disposition inventory

**Already covered in the released plan and retained with qualifications:** incremental record parsing into staging; showing inferred mapping in preview for volunteer confirmation; preserving an earlier revision in an audit table; parsing before accepted writes; restart-from-zero after interrupted scan; cancellation of unaccepted staging; and a single transaction for final apply. These are sound design anchors, but the plan's assumptions about inference, visibility, idempotence, cleanup and crash durability need the revisions above.

**Rejected as written:** filename as a substitute logger identifier; automatic revision from an ID-plus-timestamp collision; sample inference as authority for units, null markers or ambiguous date meaning; silently accepting a row that contradicts the chosen profile; skip-errors as an unreported partial import; and destructive replacement or source-file rewriting. A same-name source with a new content digest is a new file version requiring a diff.

**Still uncertain:** actual per-logger IDs and their uniqueness/reuse rules; the semantic identity fields and tolerance; known encodings, dialects, header aliases, date orders and local clock zones; interval/depth/location semantics; valid units and conversion formulas; blank/null/sentinel meaning; input and line limits; expected transaction sizes and read concurrency; supported parser/database versions and durability mode; storage budget; and whether restart checkpoints or explicit row omission belong in the first release. Keep these visible as owner decisions; no logger convention is inferred from the evidence cited here.

