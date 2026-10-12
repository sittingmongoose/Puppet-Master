# Investigator draft: supplier spreadsheet reconciliation

**Run:** B07-P01-control  
**Stage:** investigator  
**Plan release:** 2026-10-12T00:47:06.251Z  
**Frozen discovery SHA-256:** 788582eb19f13c93d8e86ffd5c57a8bff06691d0e0127f06eed2e0b351830476  
**Released plan SHA-256:** 0bc254bf2a6a44977ac7037923782331552ecee5afdcc79df4264e6452b2c7fa  
**Sources:** [navigable source index](sources/index.md) and [structured source map](source-map.json). The discovery file was not changed after the helper froze its hash.

This is a research-backed proposal for an import component, not an implementation or deployment request. It treats the original brief as binding, uses the newly released plan for this review, and distinguishes sourced parser/database behavior from unverified product assumptions. No actual supplier file or production stock database was used.

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

Keep rejected-row detail in an on-device review report with an owner-approved retention rule. Export to a separate file should be optional and deliberate because it creates another copy of supplier data. Do not reduce a traceability requirement to an aggregate ignored-row count.

### P13 — “At eighty thousand rows, preview memory and transaction duration need investigation.”

**Disposition: retain and make measurable.** Use streaming parsing or bounded batches into local staging, not an unbounded in-memory collection by assumption; virtualize/page the preview. Benchmark on the actual app/database with synthetic 80,000-row fixtures. Record peak memory, parse/validation time, preview responsiveness, apply duration, database lock time, and crash-recovery duration. The parser docs show streaming/read-record APIs (S03/S05); no source proves target-app performance. A successful library benchmark does not decide database transaction size or staff review usability.

### P14 — “Proposed validation covers reused identifiers, header drift, locale ambiguity, duplicate rows, canceled previews and interrupted commits.”

**Disposition: retain as proposed, expand coverage, and do not report it as executed.** Add field-width changes at late rows; multiline quoted records and byte/record/physical-line locators; quote/escape and encoding variations; blank/duplicate/reordered headers; leading-zero codes and normalization collisions; exact and conflicting duplicate rows; notes/unmapped columns; formula-looking text; profile changes; file replay after complete commit and after interruption; repeated rows across chunk boundaries; cancel before and during Apply; disk full, database busy, constraints and process termination around every write/receipt boundary; offline/local-only operation; and retention/removal of local staging. Include success and rollback/partial-state assertions for each selected transaction policy.

All of these are validation proposals. No tests, benchmarks, fixtures, builds, database actions or supplier imports were run for this stage.

### P15 — “No supplier file has been processed.”

**Disposition: retain as an executed-work fact.** No actual supplier input was opened, parsed or imported. The research used public primary documentation, upstream source/tests and an upstream issue report only.

### P16 — “A recommendation should preserve original values and make replacement/delta decisions explicit rather than hiding them inside parsing.”

**Disposition: retain and broaden.** Keep original values and source positions, separate parsing from stock semantics, require an explicit snapshot/delta setting, and surface replacement targets—including reused codes—for confirmation. Parsing may normalize text under a profile but cannot make an inventory decision.

### P17 — “This is a provisional draft for review after the declared reveal, not an endorsed answer. Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources.”

**Disposition: retain.** Primary evidence establishes parser defaults, line/record distinctions, candidate database behavior, and a current DuckDB issue report. It does not settle supplier quantity semantics, duplicate policy, code reuse, precision, staff-field ownership, allowed partial commits, retention, or the target backend. Keep those as explicit owner questions; do not invent answers from parser or standards documentation. Source identities and limitations are indexed in sources/index.md.

### P18 — “No future product deployment is requested.”

**Disposition: retain.** This deliverable is a research proposal and proposed validation sequence only. It does not request production imports, database changes, or rollout.

## Recommended scoped approach

Use a versioned, supplier-scoped profile to configure a streaming parser. Preserve source text and row provenance; run a complete pass over the file; compare structure to the profile; and parse numeric data only under explicit locale and precision rules. Use sniffing to propose a profile for an unfamiliar layout, never to commit stock. Rust csv 1.4.0 is a strong candidate if the application is Rust; Python's stdlib is a simpler alternative if it matches the current runtime; DuckDB can support local profiling/staging if a pinned release passes regression tests for row count and drift. None is selected without the application repository, callers, database, and performance constraints.

Stage rows locally and keep preview read-only. Resolve product matches through internal IDs and supplier-scoped alias history. Require explicit rules for duplicates, code reuse, and snapshot-versus-delta semantics. Recognize a previously committed batch before any reapplication. Prefer atomic apply with a receipt in the same transaction where the real store supports it; otherwise make recoverable partial application visible and idempotent by source row. Restrict writes to mapped supplier-owned fields and protect notes. Keep source files, temporary rows and reports on-device under a decided retention policy.

## Evidence, assumptions and execution status

The only released product plan reviewed here is the stage's revealed-plan.md. The discovery was produced from the brief alone and frozen before release. Source findings are conditional on the documented versions/conditions; DuckDB issue #25827 is a user report that was open when accessed, not an independently reproduced defect. The target application repository, language, database, callers and tests were not among the permitted inputs. This proposal therefore identifies Stage 0 repository inspection as a prerequisite; it does not claim compatibility with an unknown stock system.

**Executed:** brief-only discovery and public-source review; exact-plan review after the single release helper; creation of this draft and source index.  
**Not executed:** implementation, app-code/test inspection, validation tests, performance measurements, import, or production database modification.  
**Open owner decisions:** snapshot/delta semantics; duplicate row policy; reused-code lifecycle; locale/precision; update-field allowlist; atomic versus resumable commit; correction/replay behavior; local retention/export policy; and actual repository/backend constraints.
