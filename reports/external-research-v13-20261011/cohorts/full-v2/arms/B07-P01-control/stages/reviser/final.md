# Final proposal: supplier spreadsheet reconciliation

**Run:** B07-P01-control  
**Stage:** reviser  
**Plan release:** 2026-10-12T00:47:06.251Z  
**Frozen discovery SHA-256:** 788582eb19f13c93d8e86ffd5c57a8bff06691d0e0127f06eed2e0b351830476  
**Released plan SHA-256:** 0bc254bf2a6a44977ac7037923782331552ecee5afdcc79df4264e6452b2c7fa  
**Sources:** [navigable source index below](#navigable-source-index) and [structured source map](source-map.json). The discovery file was not changed after the helper froze its hash.

This is the complete research-backed proposal for the original brief and the exact released plan. It is a proposal, not an implementation or deployment request. It distinguishes documented parser/database behavior, an upstream issue report, product hypotheses, and owner decisions. No actual supplier file or production stock database was used.

## Independent critique disposition and source recheck

The critic's findings are adjudicated against the released plan and the primary records, not accepted on agreement alone.

- **F1 — DuckDB sample unit: accept and correct.** The current DuckDB preview page labels itself 2.0-dev preview and its parameter table defines sample_size as a number of sample lines, with default 20480. It does not say rows. The comparison between 20,480 and the 80,000-row workload is therefore removed. Physical lines and logical CSV records can differ when quoted fields contain newlines. Keep the broader point that sample-based inference cannot certify the full file; require explicit structure and a full logical-record reconciliation. The page is moving preview documentation and is not a release pin.
- **F2 — DuckDB issue detail: accept and qualify.** On direct recheck, issue #25827 remained Open with the needs-triage label. Its author reports reproductions on main at commit 2bbfe6f236 / v2.1.0-dev84749, 1.6.0.dev214, 1.5.5, 1.4.2 and 1.1.3. In the reported wide.csv case, defaults returned 29,000 rather than 30,000 rows; null_padding=true retained 30,000 while changing the inferred columns; sample_size=-1 still returned 29,000. The author also reports zero rows for a three-line example. These are reporter claims, not this reviewer's measurements or universal release behavior. The issue page showed no linked branch or pull request when checked. Treat it as a consequential risk signal and require pinned-version regression tests if DuckDB is selected.
- **F3 — application repository and integration evidence: retain uncertainty.** The brief requests relevant product repository code, callers/tests and issue-to-fix or release history where consequential. The permitted inputs provided no application repository path, language, backend or caller/test files. No product code was inspected. This remains an outstanding prerequisite to any app-specific choice; Stage 0 below calls for that inventory. The existing proposal is conditional and does not claim compatibility. Public parser sources and the DuckDB issue are not substitutes for product integration evidence.
- **F4 — local rejected-row report versus separate file export: accept the ambiguity and make it explicit.** The released plan says rejected rows are “exported in a local review report”; the investigator draft guaranteed an on-device report while treating a separate file as optional. “Report” does not settle the artifact form. The final requires row-level local report details as a minimum and makes the in-app-versus-separate-local-file decision explicit for the owner. If the plan intended a separate file, it must be produced locally and intentionally; neither wording authorizes off-device export. Retention and any copy/export action remain explicit choices.
- The critic found no other material wrong claim. That assessment is consistent with this recheck but is not treated as primary authority. Proposed checks, benchmarks and rollout steps remain proposals, not executed work.

## Source identity and execution limits

S01–S13 keep the source IDs and URL bindings carried by the investigator and critic maps. The critic's later source records are carried forward; this final adds direct, timestamped recheck records for S08 and S09 without reassigning any ID. The full source conditions, access operations, locators, versions and limitations are in the companion source-map.json. The source index below is reproduced here so this final remains directly navigable.

## Clause-by-clause disposition of the released plan

### P01 — “The draft separates parsing, review and commit.”

**Disposition: retain and make each boundary explicit.** Use parse/profile match → local staging and validation → read-only reconciliation preview → explicit Apply → durable receipt and recovery. The parser must never write stock. Cancel before Apply leaves stock unchanged. The preview must show proposed changes before any stock mutation. This separation is a sound organization, but it does not choose the commit policy (see P12).

### P02 — “A saved mapping profile identifies headers, supplier identity and expected number conventions.”

**Disposition: retain; add structure/version fields (optional design improvement).** A profile should be scoped to a supplier and contain encoding, delimiter, quote/escape rules, header count, exact header labels and aliases, ordered structure, column targets, decimal/group marks, precision/scale, sign and blank/null rules, permitted update fields, a version, and the parser version. Preserve original header labels and a structural fingerprint. W3C CSVW shows a standardized way to represent dialect and column metadata (S02); it can inform a small local profile format, without adopting the full web-processing model.

A profile match is conditional, not a guarantee that a new file still has the same meaning. Compare the full new header and record shape with the saved profile. Missing, extra, duplicate, reordered or changed labels and changed dialect/width require review. A detector may suggest values; staff confirm the mapping. Never silently switch to positional columns or accept a partial match.

### P03 — “Parsed rows retain their source line and original field text.”

**Disposition: correct the source-location contract.** Retain original field text, logical record index, byte offset, file hash, profile version, and physical start line where verified. A physical line alone is insufficient: quoted CSV fields can contain line breaks (S01), Python explicitly distinguishes lines from records (S06), and Rust exposes byte, line, and record positions with different bases (S04). Use record index plus byte offset as the canonical locator; display the physical line as an aid after fixture validation. Preserve all fields for invalid rows, including the unparsed numeric text. Do not trim, normalize or overwrite the source evidence.

### P04 — “The preview classifies proposed inserts, updates, duplicates and errors before a transaction applies approved changes.”

**Disposition: retain and expand the preview (optional usability improvement).** Include unchanged rows, exact repeats, same-code conflicts, ambiguous/reused identities, profile drift, width errors, invalid values and protected/unmapped columns. For each update show current value, proposed value, target internal product, source column and record locator. Show whole-file counts and allow filtering/paging so an 80,000-row file is reviewable. “Approved” must mean explicit staff action on a clear outcome; duplicate/conflict rows cannot silently flow into Apply. Read current stock for the preview without writing it.

### P05 — “Staff notes are never mapped by default, and formula-like text is treated as data rather than executed.”

**Disposition: retain as a hard safety constraint.** The import path is a text parser, not a spreadsheet/formula engine. Formula-looking strings stay literal and are never evaluated. Unmapped columns have no write path. Keep an allowlist of supplier-owned target fields; staff-authored notes remain excluded unless an owner later approves an explicit, reviewed operation. Preserve raw values in local staging. If staff-requested diagnostics are exported later, treat that as a separate explicit action and keep the output local; export was not needed for this proposal.

### P06 — “Identity currently combines supplier identifier with product code.”

**Disposition: correct and qualify.** Supplier ID plus supplier code is a useful external alias candidate, not a canonical product primary key and not always unique across time. Resolve accepted rows to an immutable internal product ID. Preserve the supplier's raw code and record any normalization rule explicitly. Keep alias history/lifecycle so a code can be associated with a discontinued item in the past and reused later. The plan must not make supplier code a global unique key. Whether case folding, trimming, punctuation removal or leading-zero changes are valid is a supplier/business decision.

### P07 — “Discontinued items remain in the catalog, but the proposal assumes a matching code still refers to that item unless staff explicitly select a replacement.”

**Disposition: reject the default-match assumption; require an owner/staff resolution.** A reappearing code may revive the former product, designate a new internal product, or be an unresolved collision. Historical presence is evidence, not authority to update the old item. Keep the old mapping and show the candidate and lifecycle status, then require an explicit, auditable selection for each ambiguous reuse (or a previously approved supplier-specific lifecycle policy). This is safer than making “same code means same item” the default.

### P08 — “Quantities are interpreted as absolute stock values; whether suppliers actually send deltas is an open business question.”

**Disposition: retain only as a provisional hypothesis; do not implement it as the default. Owner decision required.** A full snapshot replaces an observed value; a delta adds/subtracts. Those are materially different operations, and parser evidence cannot answer which a supplier sends. Each supplier/profile needs an explicit operation mode and field semantics before Apply. If the mode is unknown, block stock application and ask. The correct replay and recovery behavior depends on this choice.

### P09 — “A file hash prevents a second commit of identical bytes, though equivalent resaved files and interrupted retries need further treatment.”

**Disposition: strengthen the mechanism and keep semantic equivalence open.** Persist a local batch receipt with supplier, file SHA-256, profile/version, parser version, operation mode, status, and committed result. A repeated exact hash should be identified before Apply and shown as already committed; a deliberate correction must use an explicit reversal or replacement flow. Store the batch receipt in the same atomic commit as stock changes so a crash or lost acknowledgement after commit cannot make the user apply the file again.

For resumable partial mode, use a stable source-record key within the batch and commit each record's stock change and applied marker together. Do not update stock and later write a separate “done” flag. Hash alone cannot recognize every resaved-but-equivalent file; a canonical-row fingerprint is a possible optional safeguard, but it can conflate distinct source intents. The owner must decide if semantic duplicate detection is desired and how intentional reprocessing works. Snapshot/delta mode remains part of the idempotency key/policy.

### P10 — “The parser chooses locale settings from the saved profile and flags values that do not match.”

**Disposition: retain, but add a separate ambiguity check.** Exact profile-based parsing prevents arbitrary locale guessing, but a value can be syntactically valid under the wrong convention. Preserve raw text, parse with explicit marks and domain precision, and distinguish invalid from ambiguous. For example, if both decimal-comma and grouping-comma interpretations are plausible, the value remains unresolved even if one parser accepts it. Flag overflow, extra precision, unexpected sign, blank/null mismatch and forbidden separators. Store both source string and proposed normalized result. Never treat a best-fit parser result as confirmation.

### P11 — “The draft has not established which apparently valid values remain ambiguous or how duplicate rows should be resolved.”

**Disposition: preserve the uncertainty and add concrete cases; owner decision required for duplicate policy.** Discovery identified ambiguous numeric forms, reused identifiers and duplicate source records as distinct unresolved cases. Mark exact duplicate rows, same-code/same-values, same-code/conflicting values, and duplicate identifiers across file/history separately. Preserve all source rows. A repeat may be a supplier export defect, a split quantity line, or a real second operation; available sources cannot say which. The owner must choose per supplier whether exact repeats are blocked, aggregated, ignored, or retained as separate lines. Conflicting rows require a human decision or a documented rule; no silent last-write-wins or dedupe.

### P12 — “Commit is all-or-nothing for approved rows, with rejected rows exported in a local review report.”

**Disposition: retain all-or-nothing as the safer provisional recommendation, conditional on the real backend; add a defined alternative.** Stage and validate all rows first, then apply accepted changes and the batch receipt in one database transaction. A transaction failure means zero stock changes and a retryable batch, not a success message. This is the clearest user promise if the current backend can handle an 80,000-row transaction without unacceptable lock time.

If repository constraints rule that out, offer resumable partial application only as an explicit product choice: report committed/rejected/pending rows; persist each stock change with its applied marker; resume without reapplying committed rows. It must be visibly partial until complete. A file that fails parsing or validation before Apply leaves stock unchanged under either policy. SQLite documents BEGIN IMMEDIATE may fail with SQLITE_BUSY when another writer is active (S11); SQLite UPSERT resolves configured uniqueness conflicts but is not an idempotency policy by itself (S12). PostgreSQL 18 COPY errors by default; its ignore behavior can discard conversion rows, so a private staging table and row-level diagnostics are needed if that path is selected (S13).

Keep rejected-row detail in a durable, accessible, on-device review report with an owner-approved retention rule; every rejected row needs its source locator and reason, not only an aggregate count. The released plan's phrase “exported in a local review report” does not settle whether that report is an in-app batch report or a separate local file. This proposal guarantees the local row-level report and leaves that output form explicit for the owner to resolve before implementation. If a separate file is intended, create it locally only through a deliberate action, with a retention rule; never infer permission to transmit supplier data off-device.

### P13 — “At eighty thousand rows, preview memory and transaction duration need investigation.”

**Disposition: retain and make measurable; correct the DuckDB sample unit (F1).** Use streaming parsing or bounded batches into local staging, not an unbounded in-memory collection by assumption; virtualize/page the preview. Benchmark on the actual app/database with synthetic 80,000-row fixtures. Record peak memory, parse/validation time, preview responsiveness, apply duration, database lock time, and crash-recovery duration. The parser docs show streaming/read-record APIs (S03/S05); no source proves target-app performance. DuckDB's current moving preview documentation specifies a default sample_size of 20,480 sample lines, not rows; because quoted records can span physical lines, that number must not be compared directly with the brief's 80,000 logical-row ceiling. Require whole-file record-count reconciliation if DuckDB is considered. A successful library benchmark does not decide database transaction size or staff review usability.

### P14 — “Proposed validation covers reused identifiers, header drift, locale ambiguity, duplicate rows, canceled previews and interrupted commits.”

**Disposition: retain as proposed, expand coverage, and do not report it as executed.** Add field-width changes at late rows; multiline quoted records and byte/record/physical-line locators; quote/escape and encoding variations; blank/duplicate/reordered headers; leading-zero codes and normalization collisions; exact and conflicting duplicate rows; notes/unmapped columns; formula-looking text; profile changes; file replay after complete commit and after interruption; repeated rows across chunk boundaries; cancel before and during Apply; disk full, database busy, constraints and process termination around every write/receipt boundary; offline/local-only operation; and retention/removal of local staging. Include success and rollback/partial-state assertions for each selected transaction policy.

All of these are validation proposals. No tests, benchmarks, fixtures, builds, database actions or supplier imports were run for this stage.

### P15 — “No supplier file has been processed.”

**Disposition: retain as an executed-work fact.** No actual supplier input was opened, parsed or imported. The research used public primary documentation, upstream source/tests and an upstream issue report only.

### P16 — “A recommendation should preserve original values and make replacement/delta decisions explicit rather than hiding them inside parsing.”

**Disposition: retain and broaden.** Keep original values and source positions, separate parsing from stock semantics, require an explicit snapshot/delta setting, and surface replacement targets—including reused codes—for confirmation. Parsing may normalize text under a profile but cannot make an inventory decision.

### P17 — “This is a provisional draft for review after the declared reveal, not an endorsed answer. Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources.”

**Disposition: retain.** Primary evidence establishes parser defaults, line/record distinctions, candidate database behavior, and a current DuckDB issue report. The report lists builds it says it tested, but this review did not reproduce it and does not generalize it to every release. Evidence does not settle supplier quantity semantics, duplicate policy, code reuse, precision, staff-field ownership, allowed partial commits, retention, or the target backend. Keep those as explicit owner questions; do not invent answers from parser or standards documentation. This final includes a navigable source index and a structured source-map.json with inherited source identity records and the reviser's direct rechecks.

### P18 — “No future product deployment is requested.”

**Disposition: retain.** This deliverable is a research proposal and proposed validation sequence only. It does not request production imports, database changes, or rollout.

## Recommended scoped approach

Use a versioned, supplier-scoped profile to configure a streaming parser. Preserve source text and row provenance; run a complete pass over the file; compare structure to the profile; and parse numeric data only under explicit locale and precision rules. Use sniffing to propose a profile for an unfamiliar layout, never to commit stock. Rust csv 1.4.0 is a strong candidate if the application is Rust; Python's stdlib is a simpler alternative if it matches the current runtime; DuckDB can support local profiling/staging if a pinned release passes regression tests for row count and drift. None is selected without the application repository, callers, database, and performance constraints.

Stage rows locally and keep preview read-only. Resolve product matches through internal IDs and supplier-scoped alias history. Require explicit rules for duplicates, code reuse, and snapshot-versus-delta semantics. Recognize a previously committed batch before any reapplication. Prefer atomic apply with a receipt in the same transaction where the real store supports it; otherwise make recoverable partial application visible and idempotent by source row. Restrict writes to mapped supplier-owned fields and protect notes. Keep source files, temporary rows and reports on-device under a decided retention policy.

## Evidence, assumptions and execution status

The only released product plan reviewed here is the stage's revealed-plan.md. The discovery was produced from the brief alone and frozen before release. Source findings are conditional on the documented versions/conditions; DuckDB issue #25827 is a user report that was open when accessed, not an independently reproduced defect. The target application repository, language, database, callers and tests were not among the permitted inputs. This proposal therefore identifies Stage 0 repository inspection as a prerequisite; it does not claim compatibility with an unknown stock system.

**Executed in this stage:** read the complete supplied brief, investigator discovery/draft/source map/revealed plan/reveal record, critic critique/source map, and listed source index; independently reopened the DuckDB preview documentation and DuckDB issue #25827 to resolve the critic's disputed claims; prepared this complete proposal and structured source map.  
**Not executed:** application-code/caller/test inspection (no target repository path was supplied), implementation, validation tests, performance measurements, executable reproductions, supplier-file access/import, or production database modification.  
**Open owner decisions:** snapshot/delta semantics; duplicate-row policy; reused-code lifecycle; locale/precision; update-field allowlist; atomic versus resumable commit; correction/replay behavior; local retention and report/export form; and actual repository/backend constraints.


## Navigable source index

This index carries S01–S13 with their established URL bindings. Earlier access observations and the reviser's direct rechecks of S08/S09 (at 2026-10-12T01:29:08Z) are recorded in the companion source-map.json. Sources are bounded to the brief's needs; no supplier file, production application repository, or private data was read.

## Format and profile

- **S01 — RFC 4180 (Informational, 2005).** [Open the RFC](https://www.rfc-editor.org/rfc/rfc4180.html) · §2: optional headers, commas, width expectation, spaces, quoted line breaks/commas/quotes. Use as common-format context, not a universal guarantee.
- **S02 — W3C CSVW metadata (Recommendation, 2015-12-17).** [Open the dated Recommendation](https://www.w3.org/TR/2015/REC-tabular-metadata-20151217/) · dialect description, defaults, schema column titles/types/constraints. A model for a documented profile subset.

## Parser alternatives and source code

- **S03 — Rust csv 1.4.0 ReaderBuilder.** [Versioned API](https://docs.rs/csv/1.4.0/csv/struct.ReaderBuilder.html) · explicit dialect/header settings; unequal-field default and flexible exception.
- **S04 — Rust csv 1.4.0 Position.** [Versioned API](https://docs.rs/csv/1.4.0/csv/struct.Position.html) · byte offset, line and record numbering.
- **S05 — Rust csv 1.4.0 source with inline tests.** [Tagged reader.rs](https://raw.githubusercontent.com/BurntSushi/rust-csv/1.4.0/src/reader.rs) · record iteration, unequal-width check, read_record_unequal_ok test.
- **S06 — Python 3.14.8 csv docs.** [Versioned docs](https://docs.python.org/3.14/library/csv.html) · string records, dialects, Sniffer, strict mode and line_num.
- **S07 — CPython 3.14.8 code/tests.** [Sniffer implementation](https://github.com/python/cpython/blob/v3.14.8/Lib/csv.py) · [CSV tests](https://github.com/python/cpython/blob/v3.14.8/Lib/test/test_csv.py) · sample-based dialect inference; tests for physical line counts, quoted newlines and large fields.
- **S08 — DuckDB CSV Import preview docs.** [Current preview docs](https://duckdb.org/docs/preview/data/csv/overview) · auto detection and sample_size default 20,480 sample lines (not rows), strict mode, explicit types and numeric separators. The current page identifies itself as 2.0-dev preview; this is moving documentation, not an immutable release.
- **S09 — DuckDB issue #25827.** [Open issue reported 2026-09-17](https://github.com/duckdb/duckdb/issues/25827) · report of silent early-row loss when the sniffed dialect changes; author reports main @ 2bbfe6f236 / v2.1.0-dev84749 and 1.6.0.dev214, 1.5.5, 1.4.2, 1.1.3; sample_size=-1 did not fix the reported wide.csv case, while null_padding=true kept 30,000 rows with changed inferred columns. Reported, not independently reproduced.
- **S10 — rust-csv Discussion #402.** [Maintainer answer](https://github.com/BurntSushi/rust-csv/discussions/402) · unequal field counts and the permissive-parser option; discussion, not release history.

## Persistence alternatives

- **S11 — SQLite transactions.** [Current transaction reference](https://www.sqlite.org/lang_transaction.html) · transaction lifecycle and BEGIN IMMEDIATE/SQLITE_BUSY.
- **S12 — SQLite UPSERT.** [UPSERT reference](https://www.sqlite.org/lang_upsert.html) · uniqueness conflicts, update behavior and version history (3.24.0 / 3.35.0).
- **S13 — PostgreSQL 18 COPY.** [Versioned reference](https://www.postgresql.org/docs/18/sql-copy.html) · default errors, ON_ERROR, reject limits and verbose diagnostics.

### Evidence handling

The DuckDB issue is an upstream report and was Open/needs-triage on direct recheck; its version matrix and option results are author-reported, not independently reproduced or guaranteed for all releases. The DuckDB preview docs are moving and say sample_size is measured in lines. These are risk signals, not verified behavior of the target product. The Rust discussion is maintainer guidance, not a fixed issue. The preview docs are moving and have no release pin in the page. No application repository or target database version was supplied. No tests or executable code were run.
