# Draft: Supplier spreadsheet reconciliation

**Stage:** Investigator, B07-P01-treatment  
**Basis:** Assigned brief, frozen brief-only discovery, and the exact released plan at [revealed-plan.md](revealed-plan.md). The discovery SHA-256 recorded at plan release is `b14835879ff97377c79c45b7b011532abe2d82dd6f621f84844f7eda16869ee7`. I did not edit [discovery.md](discovery.md) after that release. A later source check found an open CRLF fix proposal linked from SRC04; the correction and current status are recorded here and in [source-map.json](source-map.json) as SRC13.  
**Evidence index:** [sources/index.md](sources/index.md). No supplier file, stock database, application repository, or production account was accessed.

## Recommendation

Build the importer as a local, staged reconciliation flow. Parse the specified delimited text as a stream of raw fields, save the parsed/review state locally, map columns explicitly to a supplier profile, calculate proposed changes against a read-only inventory snapshot, then show a review screen before any inventory mutation. Require a second explicit confirmation to apply. Keep the raw source strings and source coordinates so staff can trace every validation issue. Store supplier product codes as scoped aliases to stable internal product IDs; do not use supplier code as a globally unique identity.

Do not apply until the product owner sets the supplier's quantity operation (set on-hand versus add/receive a delta), locale syntax, code normalization and duplicate policies. A reused code associated with a discontinued item must require staff resolution. Keep staff notes outside the import write set unless staff explicitly map a source column to them; an unmapped column is never a note update.

Record a unique import identity using supplier identity plus a digest of the exact source bytes. Write that identity and selected inventory updates in the same supported database transaction. An identical already-applied file must visibly resolve to an already-imported no-op/block. If the transaction aborts, none of the selected inventory changes are committed; staff can inspect/retry the saved local batch after the ledger is checked. A changed or re-saved file is not guaranteed to have the same exact-byte digest, so add a normalized-content duplicate warning only if it can be made safe and explainable.

For the stated 80,000-row ceiling, use streaming parse plus disk-backed local staging and a paged/virtualized review list. Benchmark the target database and machines before enabling writes. Keep an all-or-nothing transaction for the selected, valid rows if it meets the agreed time/locking limits. Only consider checkpointed chunks if the actual database cannot support that transaction, with explicit visible partial-import semantics and per-row recovery keys.

## Exact released-plan clause dispositions

| Released-plan clause | Disposition | Reason and evidence |
|---|---|---|
| “The draft separates parsing, review and commit.” | **Retain; make the boundaries enforceable.** Parsing and preview have no inventory writes. Only the explicit apply action starts the write transaction. Cancel before commit has no stock side effects. | Matches brief. Proposed cancel/apply-failure fixture coverage is in Validation. |
| “A saved mapping profile identifies headers, supplier identity and expected number conventions.” | **Retain and expand.** The local, versioned profile must also hold dialect (delimiter, quote/escape behavior, header row), encoding choice, original and normalized header vectors, positional source-to-target map, numeric grouping/decimal rules, quantity operation, and profile version. Record a header/dialect signature. Any added, missing, renamed, reordered, or duplicate-normalized headers stop reuse until staff review the difference. | csv 1.4.0 defaults to comma, headers on, and fixed-width records; use an explicit profile instead of defaults. Parser defaults and schema inference do not prove supplier schema compatibility. SRC01, SRC03, SRC08. |
| “Parsed rows retain their source line and original field text.” | **Correct.** Retain original field text, file digest, byte offset, and logical record index. Physical line can be shown only as a secondary hint. | csv Position exposes byte offset and record index (both zero-based), but issue #395 reports lagging line position on CRLF. PR #433 proposes a fix but remains open/unmerged; its patch is not part of the examined csv 1.4.0 release. Do not rely on the PR until a released/pinned version is confirmed. SRC02, SRC04, SRC13. |
| “The preview classifies proposed inserts, updates, duplicates and errors before a transaction applies approved changes.” | **Retain and make categories explicit.** Include new, update, unchanged/no-op, invalid, malformed-width, duplicate-row group, ambiguous identity, reimported file, mapping drift, and conflict from changed stock. Keep original row IDs on grouped records. | The brief requires distinction and traceability. Group duplicate rows for review; do not resolve by first/last row, summing, or dropping. |
| “Staff notes are never mapped by default.” | **Retain.** The importer may only update explicitly mapped business fields. An unmapped column is ignored and cannot become a notes update. If notes are ever offered as a target, it requires a deliberate staff mapping and diff review. | Directly preserves the brief. |
| “Formula-like text is treated as data rather than executed.” | **Retain and scope it.** Delimited text parsing and native preview treat formula-looking strings as inert text. Do not send raw values through a formula evaluator. Do not add spreadsheet export by default. If a CSV export is later added, define a separate safety policy because spreadsheet applications may execute formula-leading cells and available mitigations can modify data. | OWASP documents formula interpretation and the limitations/trade-offs of sanitization. SRC11. Actual XLSX import is outside this delimited-text stage. |
| “Identity currently combines supplier identifier with product code.” | **Correct.** Supplier ID plus supplier code is a scoped external alias, not the internal product identity and not a global key. The write target is a stable internal product ID selected through an approved, versioned alias or staff action. Preserve code as text; no automatic numeric conversion or trimming/case normalization without profile approval. | The brief explicitly warns supplier codes may be reused. The same value can also occur for different suppliers. |
| “Discontinued items remain in the catalog, but the proposal assumes a matching code still refers to that item unless staff explicitly select a replacement.” | **Reject the default assumption.** A supplier reusing a code after discontinuation is an ambiguity. Keep old alias history; mark the row as reused/ambiguous and require the staff member to choose new item, a particular existing item, or explicit reactivation if supported. Do not silently match to the discontinued product. | This is a known source condition in the brief, so the stale match cannot be the safe default. Mapping the code alone cannot distinguish two product lifecycles. |
| “Quantities are interpreted as absolute stock values; whether suppliers actually send deltas is an open business question.” | **Keep as an owner decision; remove absolute as any implicit default.** Each supplier profile must state whether the source means set supplier-reported on-hand quantity, add/receive quantity, or another explicit operation. The preview must display the operation and before/after result. No apply is allowed until selected and approved. | The brief says reimport must not add quantities twice but does not tell us the source semantics. Exact-file idempotency protects retries; it does not decide what a supplier's quantity means. |
| “A file hash prevents a second commit of identical bytes, though equivalent resaved files and interrupted retries need further treatment.” | **Retain and complete.** Use a stable supplier identity plus exact-byte digest as an idempotency key. Enforce uniqueness in a durable local import ledger and update that ledger in the same database transaction as inventory. Query it before preview/apply. Identical already-committed bytes show an already-imported no-op/block, even after restart. If commit outcome is unknown after interruption, query the ledger before any retry. A known pre-commit abort rolls back all selected writes; retry the reviewed batch only after verifying it is not committed. | Atomicity applies only where stock and ledger share the same transactional database. SQLite docs illustrate all-or-none transaction behavior and also document lock/busy/error details; the actual database remains unknown. SRC09–SRC10. |
| “Equivalent resaved files and interrupted retries need further treatment.” | **Clarify separately.** Exact-byte digest cannot catch a file re-saved with changed line endings, BOM or formatting. Optionally compute a second deterministic normalized-content signature for a warning, not silent dedupe, because changed values or row order can be meaningful. The retry rule is the atomic ledger above; never blindly repeat a write whose commit outcome is unknown. | Exact-byte guarantee has a deliberate boundary; a normalized key needs a policy and fixtures. |
| “The parser chooses locale settings from the saved profile and flags values that do not match.” | **Retain; do not let a matching profile auto-decide ambiguity.** Parse according to the explicitly approved decimal/grouping grammar and preserve raw text. Reject malformed values and any value with multiple plausible interpretations under the selected policy; show raw and interpretation. For example, if no locale is confirmed, `1,234` may mean decimal 1.234 or grouped integer 1,234. | rust_decimal exact parsing can detect unrepresentable scale after normalization, but it does not infer locale. Polars schema inference samples 100 rows by default; it is not authoritative for codes or quantities. SRC06, SRC08. |
| “The draft has not established which apparently valid values remain ambiguous or how duplicate rows should be resolved.” | **Resolve the principle; record the business choices.** A syntactically valid value remains ambiguous when the approved profile cannot uniquely parse it. Repeated exact rows and conflicting rows are grouped and reviewed without automatic sum/drop/last-wins behavior. Staff explicitly chooses the outcome or rejects the group. Duplicate source headers after normalization also require manual correction. | Upstream rust-csv issue #377 documents unresolved ambiguity for duplicate-field deserialization; positional field reading plus duplicate-header detection avoids relying on struct/map interpretation. SRC05. |
| “Commit is all-or-nothing for approved rows, with rejected rows exported in a local review report.” | **Retain transaction boundary; amend output.** Valid rows that staff selected are one transaction. Invalid/rejected rows are excluded before apply; a failed transaction commits none of the selected rows. Report counts, batch status, and failed reason in the local review UI. Do not export raw rows to CSV as a default: it creates a new formula-execution surface. Any later export is an owner decision and must have separate safe-export behavior and validation. | SQLite is only a conditional example; confirm actual DB support. OWASP notes CSV sanitization has client differences and can change cell data. SRC09–SRC11. |
| “At eighty thousand rows, preview memory and transaction duration need investigation.” | **Retain and propose an implementation shape.** Stream parsing into local disk-backed staging, keep review summaries/indexes in memory, and render rows with paging/virtualization. Benchmark parse, matching, review render and apply using synthetic 80,000-row files and target database. Agree latency/memory thresholds before judging. | No relevant application repository or performance environment was supplied. Polars is a possible dataframe alternative but default schema inference/error continuation needs explicit controls. SRC08. |
| “Proposed validation covers reused identifiers, header drift, locale ambiguity, duplicate rows, canceled previews and interrupted commits.” | **Retain and expand.** See the complete proposed matrix below, including encoding, source location, code preservation, unmapped notes, formula-like strings, same-file idempotency, concurrency and 80,000-row resource limits. | No validation was run in this investigator stage. |
| “No supplier file has been processed.” | **Retain as executed-work status.** | No supplier file or production database was accessed. |
| “A recommendation should preserve original values and make replacement/delta decisions explicit rather than hiding them inside parsing.” | **Retain and make operational.** Save raw fields; display parsed values separately; require a staff choice for reused/discontinued codes and for quantity operation. | Supported by the brief and source evidence above. |
| “No future product deployment is requested.” | **Retain.** Deliver a research-backed proposal and validation plan only. | No implementation, deployment, production import, or database modification was requested or performed. |

## Proposed architecture and behavior

### 1. Select file and profile

The user selects a local file and an explicit supplier. The importer computes the exact-byte digest locally and detects candidate delimiter/encoding only as suggestions. The file picker must not upload it. Show file name, supplier, detected delimiter/encoding, raw header row, row estimate and a small local sample. Require a chosen profile or a staff-confirmed new profile. Do not silently guess headers, decimal rules, source quantity semantics, or code identity.

Persist an approved profile locally with a stable profile ID and revision. It contains the supplier namespace, raw and normalized header labels with positions, delimiter/quote/escape/header-row settings, encoding, source-to-target mappings, number grammar, stock operation, code normalization and approved aliases. Keep raw labels and mapping diff when it changes. Duplicate headers after normalization, a missing required column, or any material structure difference moves the import to “profile needs review.”

### 2. Parse and validate without changing stock

Use a record-oriented streaming parser such as csv 1.4.0 with explicitly configured dialect. The library defaults are not the supplier contract. Keep source code and every unmapped field as text. If non-UTF-8 is allowed, ask for a specific encoding and use strict decoding; otherwise stop with a clear encoding error rather than replacing bytes. If flexible field length is used so the parser can report later errors, compare every record with the mapped header width and flag short/long rows as invalid. Do not use permissive parse success as proof that the row is safe to import.

Store local stage rows with raw fields, byte offset, logical record number, field-count status, profile revision, validation findings and the target stock record version observed during matching. Show physical line number only as a convenience, with parser-version-aware CRLF coverage. The issue #395 report remains connected to open PR #433; the PR proposes a change and tests but is not released, so the released parser version must be checked before promising line accuracy. SRC01–SRC04, SRC13.

Apply exact, approved aliases to stable internal IDs. If no exact alias exists, present a new-product proposal or possible matches for staff consideration. A discontinued-code collision always asks for a decision; no old item is selected by default. Description matching can suggest, never apply. Duplicate groups retain all source locations. A row with a bad number, unknown required field, reused code, conflicting same-file group or uncertain target stays outside the apply set until resolved or rejected.

### 3. Review a complete preview

Before any write, show:
- summary counts for new, update, unchanged/no-op, duplicate, invalid, ambiguous, unmapped, and prior-import rows;
- a searchable, sortable, paged or virtualized row list with original source record and raw text;
- current stock versus proposed value and the selected “set” or “add/receive” operation;
- resolved internal product identity and evidence for that choice;
- which mapped fields will change and why, including explicit proof that unmapped columns and staff notes are unchanged;
- a local list of ambiguous/rejected rows with their reasons and complete source locations.

Require explicit staff choice for ambiguous decimal values, discontinued/reused codes, duplicate rows, and any new-product/internal-product association. Save decisions to the local batch so closing and reopening the review cannot silently change them. If stock changed since the preview snapshot, mark the row as stale and require refresh/review rather than applying against old data.

Cancel/close before apply discards the local stage under the owner-approved retention policy and changes no stock. Keep a staged state only where local crash recovery requires it, disclose its retention and deletion behavior, and never log raw supplier values remotely.

### 4. Apply and recover

Before applying, reconfirm supplier, file identity, profile revision, quantity operation, counts, selected rows and resulting value summary. Recheck the import ledger and the stock versions. In one supported database transaction:
1. verify all current targets and write constraints;
2. apply the selected valid updates/creates;
3. write the import batch identity and committed status;
4. commit.

Any error before commit triggers explicit rollback and verification of transaction state. The UI reports “not applied; no selected stock changes committed” only after confirming rollback. If the process disappears or commit acknowledgement is uncertain, the next attempt looks up the unique batch key first; a recorded batch is a no-op, and an absent batch permits a reviewed retry. Do not write to the inventory in chunks while previewing.

“Success” means every selected, valid row and its import marker committed. Invalid/rejected/unselected rows remain out of that transaction and appear in the report counts. “Partial failure” means the batch failed before commit and none of the selected writes were applied; the local batch remains inspectable/retryable after its state is checked. A product owner may instead choose explicit partial success with checkpointed chunks, but that decision must define which rows become visible, how resume behaves, what rollback/undo means and how the UI reconciles a restart. Do not present a silently partial result as success.

SQLite documentation illustrates why the target adapter matters: transactions have lock/busy outcomes, default to DEFERRED, and some I/O/full/interruption errors do not imply one simple transaction state. This is conditional evidence, not an assertion that the current stock application uses SQLite. Inventory rows and the batch marker must share the real database's atomic boundary. A file-system ledger outside that boundary cannot by itself stop duplicate apply after a crash. SRC09–SRC10.

## Alternatives and scope

| Approach | Strength | Tradeoff / disposition |
|---|---|---|
| csv 1.4.0, raw record stream, explicit supplier profile, local disk staging | Small and direct fit for delimited text; configurable delimiter and record-by-record reads; leaves source values under application validation. | **Preferred candidate for prototype**, subject to pinning a released version, testing CRLF location behavior, encoding decisions and 80k performance. Validate record shape and every business field in the app. SRC01–SRC04, SRC13. |
| Polars CSV/dataframe | Columnar transformations and efficient aggregate analysis; schema can be forced and rows selected. | **Viable alternative, not presumed winner.** Default 100-row inference and error-continue option are not safe defaults for identifiers or auditable errors. Use all-text schema, preserve row/source mapping, and surface errors. May consume more memory when materializing an 80k-row frame. SRC08. |
| Calamine for actual XLSX/ODS | Handles spreadsheet workbooks; 0.36.0 release includes streaming XLSX cell/formula APIs. | **Out of current scope.** Brief describes delimited text. Workbook format introduces sheets, cached/formula values, links/macros, resource limits and format bugs; requires a separate threat and behavior review. SRC12. |
| Load parsed records entirely in memory | Simple prototype path. | **Reject for the proposed production shape** until measured; disk staging plus paged review gives clearer resource bounds. |
| Direct writes during parse/preview | Avoids staging. | **Reject.** Violates cancel-without-changes and review-before-apply. |
| Infer quantity locale from sample majority; coerce numbers immediately | Fast for clean uniform files. | **Reject.** Can silently reinterpret ambiguous numbers or alphanumeric/leading-zero identifiers. Locale and operation are profile/user decisions. |
| Apply in chunks without a durable ledger/checkpoint | Can shorten one transaction. | **Reject.** A stop can leave unexplained partial stock and a retry can duplicate it. Chunking is only an owner-approved alternate protocol with per-row idempotency and tested recovery. |
| Use supplier code as global key or fuzzy auto-match | Convenient happy path. | **Reject.** Code namespace and reuse make this unsafe; fuzzy match is suggestion only. |

Calamine's 0.36.0 release is recorded as an alternative/version history. A post-reveal review of the csv CRLF issue found PR #433, commit `815ddab`, opened against master on 2026-08-30. It proposes complete CRLF consumption and test cases for CRLF, split-buffer CRLF and high-level `Position` behavior. The PR was Open, unreviewed and not merged in the page accessed at 2026-10-12T00:44:31Z; its contributor-listed tests were not run here. Therefore SRC04's original discovery note that no PR was linked is superseded by SRC13; the operational conclusion remains: use byte offset/logical record as primary coordinates and verify the released dependency before relying on physical line numbers.

## Unavoidable owner decisions

1. Supplier list and first-release input formats: delimiter, quotes/escapes, headers, encoding, blank/comment rows, maximum file bytes and whether XLSX is intentionally excluded.
2. Required fields and permitted stock fields, plus how to display and handle optional/unmapped columns.
3. Whether quantity means set-on-hand, add/receive, or other; sign/negative quantity rules; integer versus fractional precision and rounding policy.
4. Supplier-code scope, case/space/leading-zero behavior, other authoritative identifiers, whether code reuse means new lifecycle or reactivation, and how retired aliases are stored.
5. Resolution for exact duplicate lines, conflicting duplicate codes, duplicate headers after normalization, repeated existing stock aliases, and whether users can override one row or a whole group.
6. Decimal mark, grouping mark, grouping grammar, ambiguous-input handling, and which encoding labels may be selected.
7. Whether changed header signatures may be amended inline or require a new profile revision; how saved profiles and raw stage rows are retained/deleted/backed up locally.
8. Actual database and its transaction, uniqueness, concurrency, offline/local storage and rollback behavior. Specifically determine whether the import ledger can commit atomically with inventory changes and whether 80,000 selected changes fit a transaction.
9. Whether a reviewed local report must be exportable; if so, which formats and whether formula-leading strings should be transformed for external spreadsheet viewing.
10. Target-machine time and peak-memory budgets for 80,000 rows. Agree thresholds before benchmarking.
11. Whether any batch checkpointing/partial success is acceptable. If it is, define what users see after a stopped run and how retry, resume, reverse and audit work.

## Validation proposals — not executed

All validations below are proposals. This investigator stage ran no test suite, importer, code, supplier file, database operation, local repository check, or performance benchmark.

### Parser and mapping fixtures

- Delimiters: comma, semicolon, tab; standard quotes, escaped quote, embedded delimiter and embedded newline.
- Line endings and location: LF, CRLF, final record without line ending, quoted embedded newline, parser-buffer split CRLF; check logical record, byte offset and any physical line shown against a raw fixture. Pin the parser version and include the SRC13 fix only after it is released/selected.
- Header/mapping: header row present/absent, reordered columns, added/missing/renamed headers, duplicate exact header, duplicate-after-normalization, empty header, BOM, unknown columns; verify drift stops silent reuse.
- Shape/errors: empty rows, short/long rows, invalid quote shape, invalid UTF-8, each explicitly supported encoding, malformed sequences; ensure every error preserves a traceable row.
- Identifiers: leading zero, letters plus digits, punctuation, whitespace and case variants; same code in two suppliers; active and discontinued aliases; reused code; missing code; fuzzy similarity without automatic target selection.
- Numeric data: each approved grouping/decimal combination; `1,234` under alternate locales and unknown locale; bad group sizes, signs, exponent, too many decimal places, unsupported fractional count and empty quantity; compare raw text with proposed value.
- Duplicates: byte-identical repeated line, same supplier code with same fields, same code with differing values, two codes resolving one internal item, and repeated values that may represent multiple locations; keep every source location and require a clear decision.
- Protection: formula-leading cells are shown as inert text; unmapped notes-like columns do not change staff notes; no value is evaluated; no supplier field appears in remote logs.

### Preview, apply, idempotency and recovery

- Cancel at every wizard/review step and close/reopen: inventory snapshot is unchanged; staged data follows retention rule.
- Save/reload a mapping profile; identical structure retains mapping; drift requires explicit confirmation and a new revision.
- Apply selected rows on an isolated synthetic database; prove unselected/invalid rows remain unchanged, notes remain unchanged, and all changed fields match the approved diff.
- Same supplier plus identical bytes after successful commit: restart, reimport and verify visible no-op/block, with no second addition. Do this for both set and delta operation profiles once those semantics are decided.
- Interrupt before first write, during update loop, at commit, after commit but before UI acknowledgement; inspect the same atomic ledger and database state, then retry only after checking the batch key.
- Trigger write conflict, concurrent staff edit, database busy/lock, disk full and I/O error; verify no unexplained partial result and no overwrite of a newer stock version.
- If partial/chunked application is selected, add kill/restart tests at every chunk boundary, per-row idempotency assertions, resume/reverse tests and audit checks before enabling it.

### Size, usability and staged rollout

- Generate synthetic 80,000-row files with typical and worst-case field widths. Measure parse time, staging throughput/storage, matching, filter/search, preview render, commit duration and peak memory on target machines. Gate on owner-approved limits.
- Walk through a staff task with new items, updates, a reused discontinued code, conflicting duplicates, a locale ambiguity, 1,234-style value and a changed profile. Confirm reasons and decisions are understandable before write.
- Stage 0: read-only review of product source/callers/database schema once the owner supplies repository access; resolve decisions above.
- Stage 1: parser/profile plus synthetic fixtures and local disk staging only.
- Stage 2: read-only inventory reconciliation and review, still no writes.
- Stage 3: write behind a disabled-by-default gate on synthetic/local copies; test atomic apply, retries, cancellation and crash recovery.
- Stage 4: one-supplier local pilot after local-only data handling, staff training, rollback and limits are approved; expand only after review of success/failure logs that do not contain raw supplier values.

## Evidence limits and checks actually completed

The input map listed this assigned stage as the only allowed write root and did not provide a stock-app repository path, product database schema, callers or test paths. Candidate crate source and upstream docs/issues were reviewed through the indexed URLs; local application compatibility, database engine, existing product code, callers, and tests remain unknown and must be checked before integration. The released plan was read only from [revealed-plan.md](revealed-plan.md), after discovery and the source map were saved and the single-use reveal helper returned its recorded SHA-256 values. No hidden plan source or supplier data was opened.
