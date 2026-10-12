# Supplier spreadsheet reconciliation — complete revised proposal

**Run/stage:** B07-P01-treatment / reviser  
**Scope:** Research-backed software proposal for the assigned brief and the exact released plan. This is not an implementation or deployment request.  
**Evidence index:** [sources/index.md](sources/index.md); full source identities and review notes: [source-map.json](source-map.json).

## Recommendation

Design a local, staged reconciliation workflow for delimited text. It must preserve source values, make mappings and interpretations visible, resolve product identity through supplier-scoped aliases to stable internal product IDs, and show a complete preview before any stock write. Staff explicitly choose quantity semantics and resolve ambiguous numbers, duplicate rows, and reused discontinued codes. Preview, cancellation, and file parsing have no stock side effects.

Use a durable import ledger to prevent a repeated file or retry from applying a quantity change twice. A supplier ID plus the exact-byte file digest identifies a file, but a single “already imported” flag is not enough: a partially reviewed file can have applied, rejected, and still-pending rows. The ledger must preserve row/group state and make completed rows visible as no-ops when the same bytes are reopened. Inventory writes and their applied-state markers must share the target database’s atomic boundary. If the real store cannot support that, keep writes disabled until a recoverable design is chosen and validated.

Treat “supplier data stays local” as an end-to-end boundary. Local parsing does not meet it if source-derived codes, quantities, descriptions, file contents, or decision records leave the device through a remote write API, sync, logs, telemetry, backups, or crash reports. The stock database and write path were not identified. Until a local write path is confirmed, a remote target is a release blocker for this brief’s local-only requirement; do not describe a remote transfer as compliant without a product decision that changes the requirement.

A record-stream parser such as Rust csv 1.4.0 is a reasonable prototype candidate, not a chosen winner. Polars remains a viable alternative if its schema and error behavior are configured for auditable raw fields. Benchmark both against the actual application and 80,000-row constraints before selecting. A true XLSX reader is outside the current delimited-text scope.

No supplier data, stock database, target application repository, or production account was provided. No code, test suite, validation fixture, or benchmark was run in this reviser stage. The validations below are proposals only.

## Critique dispositions

Each criticism is disposed of by its substance and evidence. Critic agreement is not treated as product authority.

| Criticism | Disposition | Revised treatment |
|---|---|---|
| **C-01: whole-file deduplication can strand unapplied rows.** | **Accept.** This is a real state-model gap in the draft. | Keep an exact-file identity, but do not make a committed subset turn the whole file into a permanent no-op. Track applied, unchanged/no-op, explicitly rejected, and pending source rows or duplicate groups. Atomically commit each selected subset’s inventory changes together with those rows’ applied markers. Reopening the same bytes shows prior outcomes and permits only pending rows to be resolved or retried. Mark the file complete only when every source row is applied, unchanged, or explicitly rejected. Add a same-bytes/reopen-after-subset test. |
| **C-02: local-only behavior is incomplete if the stock target is remote.** | **Accept as a hard acceptance gate.** The input map does not reveal whether the stock store is local or remote, so applicability remains unresolved. | Define the boundary to include source bytes, parsed values, product identifiers, quantities, mappings, decisions, import digests, logs, backups, sync, telemetry, and crash reports. Under the brief as written, none of these supplier-derived records may leave the device. A remote inventory write carrying supplier-derived data fails that requirement; leave import writes disabled until a local path is confirmed or the product owner changes the requirement explicitly. Validate the whole path, not just file selection and parsing. |
| **C-03: stored parser index and staff-facing row numbering are not distinguished.** | **Accept.** The exact-version Position API defines byte and record indices as zero-based, and line as one-based. | Persist the parser’s raw byte offset and record index exactly. Retain the header record in that index. In the UI, number the first data row as 1 after subtracting the configured header record count; embedded newlines do not change the logical record number. Show physical lines only as a secondary hint and test the pinned parser on CRLF files. |
| **C-04: target application code, callers, tests, schema, and database are absent.** | **Retain as an unresolved external input.** The input map supplies no product repository path or local caller/test paths, and the allowed source scope does not identify one. | Make read-only target-code, caller, test, schema, database, and write-path review a prerequisite to integration. Do not infer compatibility or claim the importer fits the existing app. The upstream library and issue/release history in the source index do not replace that application-specific review. |
| **C-05: no unsupported category was found in the critic’s bounded source review.** | **Accept with scope limit.** The critic’s primary-source checks support the scoped library and security statements it reviewed; this is not validation of an implementation. | The reviser independently rechecked the consequential disputed parser-position and transaction claims against the versioned API and upstream issue/PR pages. All application behavior and proposed validation remain unverified. |
| **Non-blocking opportunity: maximum field size and preview memory need concrete bounds.** | **Accept.** | Ask the owner to set file-byte, field-size, staging-storage, and preview-memory limits before testing. Do not invent thresholds in this proposal. |

## Disposition of every released-plan clause

| Exact released-plan clause | Disposition | Complete proposal |
|---|---|---|
| “The draft separates parsing, review and commit.” | **Retain and make enforceable.** | Parse and preview are read-only with respect to stock. Only a deliberate Apply action starts the write transaction. Cancel before apply changes no stock. The import ledger records separately whether a file is staged, partially committed, complete, or failed. |
| “A saved mapping profile identifies headers, supplier identity and expected number conventions.” | **Retain and expand.** | Store a local, versioned supplier profile containing supplier namespace, header row, delimiter, quoting/escaping, encoding, original and normalized header vectors with positions, source-to-target mappings, required fields, decimal/group separators and grammar, quantity operation, code-normalization rules, and profile revision. A changed, reordered, missing, added, renamed, or duplicate-normalized header stops silent profile reuse and displays the difference for staff review. |
| “Parsed rows retain their source line and original field text.” | **Correct the trace anchor.** | Keep original text/bytes, exact file digest, raw parser byte offset, and raw zero-based record index. Preserve the header index. Display data-row numbering from 1, excluding configured header records; embedded newlines do not increment data-record numbers. Physical line numbers are supplementary only because issue #395 reports a CRLF position problem in the examined release evidence; PR #433 is a proposal, not a released fix. |
| “The preview classifies proposed inserts, updates, duplicates and errors before a transaction applies approved changes.” | **Retain and make categories explicit.** | Review new, update, unchanged/no-op, malformed-width, invalid value, duplicate group, ambiguous identity, mapping drift, already-applied row, pending row, and concurrent-stock conflict. Preserve every source record ID when grouping rows. No conflict or unresolved group enters the apply set. |
| “Staff notes are never mapped by default.” | **Retain.** | Only fields explicitly mapped to allowed business targets can be written. An unmapped column is visibly ignored and can never become a notes update. If staff notes are offered as a target later, require deliberate mapping and a before/after diff. |
| “Formula-like text is treated as data rather than executed.” | **Retain and scope.** | Parse and display source strings as inert text; never pass them to a formula evaluator. Do not export raw rows to CSV by default. Any future spreadsheet-facing export is a separate feature with its own threat review because spreadsheet programs may interpret formula-leading cells and mitigations can vary or change cell data. |
| “Identity currently combines supplier identifier with product code.” | **Correct.** | Supplier ID plus supplier code is a scoped external alias, not a globally unique product key. Map only an approved alias to a stable internal product ID. Preserve source codes as text, including leading zeros and punctuation; do not normalize case, spaces, or zeros without an owner-approved supplier rule. |
| “Discontinued items remain in the catalog, but the proposal assumes a matching code still refers to that item unless staff explicitly select a replacement.” | **Reject the default match.** | Preserve the old alias history, but present a reused code as ambiguous. Staff must choose a new product, a specific existing product, or explicit reactivation if supported. Do not reactivate, overwrite, or update the discontinued product based only on the reused code. Similar descriptions can suggest candidates only. |
| “Quantities are interpreted as absolute stock values; whether suppliers actually send deltas is an open business question.” | **Retain the open business question and remove any implicit default.** | Each supplier profile explicitly says whether quantity means set supplier-reported on-hand, add/receive a delta, or another approved operation. Show the operation and before/after result in review. No write is allowed until chosen. Exact-file idempotency prevents replay; it does not answer what a supplier’s quantity represents. |
| “A file hash prevents a second commit of identical bytes, though equivalent resaved files and interrupted retries need further treatment.” | **Retain and complete.** | Use supplier identity plus exact source-byte digest as the file identity and enforce it durably. Preserve per-row or per-group apply state in the same database transaction as its selected stock change. On an uncertain commit, query that state before retrying; rows already applied are no-ops, and only pending rows may be resumed. A file is complete only when no row remains pending. |
| “Equivalent resaved files and interrupted retries need further treatment.” | **Clarify separately.** | A changed BOM, line ending, formatting, ordering, or value may change the exact-byte digest. A normalized-content signature may warn about a possible equivalent file, but must not silently block or merge it because order and content differences can be meaningful. Never retry an unknown commit blindly; inspect ledger state first. |
| “The parser chooses locale settings from the saved profile and flags values that do not match.” | **Retain, with an ambiguity stop.** | Preserve raw text and apply only a confirmed decimal/grouping grammar. Reject malformed groupings and values that have more than one plausible interpretation under the approved profile. For example, “1,234” can denote 1.234 or 1,234 under different conventions. Show raw and interpreted values together. Exact decimal conversion detects representability after normalization; it does not infer locale. |
| “The draft has not established which apparently valid values remain ambiguous or how duplicate rows should be resolved.” | **Resolve the safety principle; keep policy choices with the owner.** | A value is still ambiguous if the approved profile cannot uniquely interpret it. Group identical and conflicting repeated rows; do not silently drop, sum, first-win, or last-win. Staff must resolve or explicitly reject the group. Detect duplicate source headers by positional column and the chosen normalization; require correction or deliberate remapping before apply. |
| “Commit is all-or-nothing for approved rows, with rejected rows exported in a local review report.” | **Retain transaction atomicity for each apply subset; amend the state and report.** | Within an apply subset, stock writes and the rows’ applied markers commit together or not at all in the verified database. Earlier successful subsets remain visible if the import is later interrupted; do not claim that the entire file rolled back. Invalid, rejected, and pending rows are outside that subset. Report status/counts in the local review UI. Do not export raw data by default; a later export requires a separate safe-export decision and validation. |
| “At eighty thousand rows, preview memory and transaction duration need investigation.” | **Retain as a proposed architecture and benchmark.** | Stream records into bounded local disk staging, keep only summaries and needed indexes in memory, and render through paging or virtualization. Benchmark parsing, matching, search/filter, rendering, and selected-row writes on target machines and the real database. Agree time, field-size, storage, file-byte, and memory thresholds first. No performance result is claimed. |
| “Proposed validation covers reused identifiers, header drift, locale ambiguity, duplicate rows, canceled previews and interrupted commits.” | **Retain and expand.** | The validation matrix below adds partial-subset resume, already-applied row protection, local-only network boundaries, row numbering, encoding/field caps, notes, formula-like values, concurrent changes, target-database errors, and realistic 80,000-row limits. Every check is proposed and not run. |
| “No supplier file has been processed.” | **Retain as executed-work status.** | No supplier file or real supplier data was read or imported in this stage. |
| “A recommendation should preserve original values and make replacement/delta decisions explicit rather than hiding them inside parsing.” | **Retain and operationalize.** | Persist source values separately from normalized values, show both in review, and require a staff choice for reused/discontinued codes and quantity operation. |
| “No future product deployment is requested.” | **Retain.** | This is a research proposal. No implementation, production import, database change, or deployment is requested or claimed. |

## Proposed design

### 1. Keep file handling and profiles local

The staff member selects a local file and supplier. Compute the exact-byte digest locally. Delimiter and encoding detection may offer suggestions, but staff confirms them. Show the filename, supplier, candidate dialect, encoding, raw header row, row estimate, and a small local sample. Nothing uploads during selection or preview.

Save an approved profile locally with a stable ID and revision. Preserve raw header labels and positions alongside normalized labels. Its structural signature includes the header row, delimiter/quote/escape behavior, encoding, ordered columns, and approved mappings. Added, missing, renamed, reordered, empty, or duplicate-normalized headers trigger a visible drift review and revised profile; they never silently inherit old mappings. Unknown fields stay ignored.

The owner must set maximum file bytes, field size, number of columns, staged-storage use, and preview memory. The brief sets 80,000 rows, but not these other limits.

### 2. Parse raw records and preserve traceability

A record-oriented parser with explicit profile settings is a feasible direction. Rust csv 1.4.0 has comma, header, and fixed-width defaults; defaults are not a supplier contract. Read fields as raw text or bytes rather than direct numeric/code types. If flexible record widths are enabled to continue collecting row-level errors, compare each record’s field count with the selected header and mark short or long records invalid. Do not treat parser success as business-data validity.

For non-UTF-8, either reject with a clear error or offer an explicit encoding choice and strict decoding. Never replace malformed bytes silently. Retain original byte/text values, byte offset, logical record index, file digest, profile revision, field-count status, and validation findings. Parser record indices are zero-based and include the header; display data rows from 1 after the header. Embedded newlines stay within their logical record. Physical line is a secondary display hint pending version-pinned CRLF verification.

### 3. Resolve identity, numbers, and duplicates before apply

Supplier codes are text aliases scoped to a supplier. Exact lookup may select a target only when the approved alias points to one active internal product and the profile has no unresolved drift. If no such alias exists, show a proposed new product or possible candidates for staff decision. A reused code that has historical association with a discontinued item requires explicit staff selection of the lifecycle and target. Do not silently reactivate. Fuzzy description/brand/packaging comparison may rank suggestions but never authorize a write.

Require the supplier profile’s exact number grammar before interpreting quantities. Validate separators, grouping, sign, integer/fractional units, and scale before converting to a canonical exact decimal. If the profile is missing or the value remains ambiguous, stop that row and ask staff; do not sample the file to infer a locale. Keep the raw and interpreted value side by side.

Detect repeated source headers after the chosen normalization. Detect repeated supplier-code groups in the file and retain every source location. Identical rows may be accidental copies or intentional separate lines; conflicting rows may represent separate locations or a disagreement. Group them for review and require a choice to apply one, apply a justified set, or reject. Never silently discard, sum, or select first/last. Keep ambiguous rows outside the apply set.

### 4. Show the complete preview before any write

Present searchable, filterable, paged or virtualized row differences with raw source record, data-row number, current stock, proposed value, quantity operation, chosen internal product, and mapped fields to change. Include counts for new, update, unchanged/no-op, duplicate, invalid, ambiguous, mapping-drift, already-applied, pending, rejected, and conflict rows. Show why each identity and mapping was chosen. Explicitly show that unmapped columns and staff notes are unchanged.

Require decisions for ambiguous numbers, duplicate groups, reused/discontinued codes, and new-product associations. Save decisions to the local batch. If inventory changed since preview, mark the row stale and require refresh/review against the new version. A cancel at any preview step discards or retains only disclosed local staging according to a product-approved retention rule and changes no stock.

### 5. Apply and resume with row-aware state

Use a batch record keyed by supplier identity and exact-byte digest. Assign each source record an identity based on supplier, exact file digest, and record-start byte offset; retain the raw zero-based parser record index too. Grouped duplicates retain every member identity. A selected apply subset includes only valid, resolved rows. Recheck the batch and current target versions immediately before apply. In one supported database transaction, verify constraints/current versions, write the selected stock changes, and mark those row identities applied with the profile revision and approved operation. Commit. A failure before commit must roll back that subset’s writes and markers; verify the actual database state before displaying that result.

The batch state is not a single boolean:

- **Staged/pending:** parsed and reviewable; no inventory write has occurred.
- **In progress:** one or more subsets have committed, while rows remain pending or decisions remain open.
- **Complete:** every source row is applied, unchanged/no-op, or explicitly rejected; none is pending.
- **Failed/unknown:** show whether the current subset rolled back or whether commit is uncertain. Query the durable row ledger before any retry.

When the same bytes are reopened, show its existing rows and outcomes. Already-applied rows are no-ops; pending rows may be reviewed and resumed; rejected rows remain rejected unless staff explicitly revises that decision. A changed mapping cannot replay already-applied rows. If a parser/dialect revision changes record boundaries, reconcile stored start-byte offsets to the new parse and stop for manual review where the match is not unambiguous. Correcting an already-applied decision needs a separate explicit adjustment/reversal path. If an exact file was fully committed, reopening it is a visible no-op/block.

**Success** means every selected row in the current subset and its state marker committed, and the UI reports counts. **Complete success** means no source row remains pending. **Partial failure** means previously committed subsets remain applied, the failed current subset is either verified rolled back or shown as unknown, and remaining rows stay pending; the UI reports exact applied, unchanged, rejected, invalid, and pending counts. It is not represented as a complete import. Retry resumes pending rows only after querying durable state. If the actual database cannot atomically commit a subset and its markers, leave writes disabled until the owner selects and validates another recovery protocol.

A one-transaction all-or-nothing batch is a simpler alternative if the real database can handle it and staff resolves/rejects all non-applicable rows before commit. Checkpointed chunks are another alternative only with owner-approved semantics, durable per-row idempotency, restart/resume and reversal behavior, and tests at every boundary. Do not write while parsing or previewing. Do not keep an idempotency ledger solely in a local file if stock is committed to a different database; the two writes would not share an atomic boundary.

SQLite documentation is only a conditional example: its default transaction is DEFERRED and a read-to-write upgrade can fail with SQLITE_BUSY; error paths can require explicit rollback/state checks. SQLite atomic commit is scoped to its database transaction/journal mode. The current application database is unknown, so no SQLite behavior is attributed to the product.

### 6. Protect the local-only boundary

No supplier file, parsed supplier-derived identifier/value, review decision, or import log may leave the device. Check file transfer, network parsing, write APIs, telemetry, crash reports, logs, backups, background sync, and staged-data retention. Keep supplier values out of remote diagnostics. If the inventory target is remote and must receive supplier-derived writes, that conflicts with the brief; do not enable the import until the owner provides a local path or requests an explicit change in scope. Cancel/expiry cleanup and local backup/retention duration need an owner-set policy.

Formula-like values stay inert in the import and preview. Do not evaluate formulas. The requested format is delimited text, not XLSX. A future workbook path needs separate decisions about worksheet selection, formula versus cached values, external links/macros, file-size/resource limits, and display semantics. A future CSV report/export is separate because spreadsheet programs may execute formula-leading fields and sanitization can alter values or vary by application.

## Feasible alternatives

| Approach | Benefits | Limits and current disposition |
|---|---|---|
| Record-stream parser, raw fields, explicit profile, disk staging (for example csv 1.4.0) | Close fit for delimited text; configurable dialect, record-by-record iteration, and application-owned validation. | Prototype candidate only. Pin a released version, test widths/encoding/CRLF locations, enforce size limits, and benchmark on the target. Parser defaults and permissive recovery are not the business schema. |
| Polars CSV/dataframe, version 0.55.2 evidence | Useful for columnar transformations and aggregate analysis; schema can be forced. | Remains viable, not ruled out. Its documented inference default samples 100 rows and its ignore-errors option can continue after ParserError. Use an all-text schema and account for every error; measure memory/materialization for 80,000 rows. |
| Calamine 0.36.0 for actual XLSX | Future true-workbook path; release notes include streaming XLSX cell/formula-record APIs. | Out of this brief’s delimited-text scope. Adds workbook semantics and version/MSRV considerations, so assess separately rather than treating XLSX as CSV. |
| Fully in-memory record set | Simple prototype. | Do not assume it meets 80,000-row memory limits; compare in a benchmark. |
| Direct stock writes during parse/preview | Reduces staging work. | Reject: breaks cancel-without-stock-changes and review-before-apply requirements. |
| Immediate numeric/code coercion or locale sampled from row majority | Convenient on clean files. | Reject: risks ambiguous numbers and loss of leading zeros/alphanumeric identifiers. |
| Exact-byte digest plus one whole-file completion flag | Simple duplicate prevention. | Insufficient where only a subset was committed or rows remain pending. Preserve exact-byte identity but add row/group state; optional normalized signature is warning-only. |
| One large all-or-nothing transaction | Simple recovery semantics; no file-level half state if the real database supports it. | Benchmark transaction/lock limits on the actual store and 80,000-row workload. |
| Checkpointed subsets/chunks | Shorter transactions and resumable work. | Only with explicit partial-import UI, per-row atomic markers, owner-defined rejection/resume/reversal policy, and crash tests. |

## Unavoidable product-owner decisions

1. Which suppliers and dialects are in the first release; header-row policy, delimiters, quoting/escaping, line endings, encoding options, blank/comment rows, and whether XLSX is excluded.
2. Required columns, permitted inventory targets, fields that must never be mapped, and whether staff notes are ever eligible for deliberate mapping.
3. Quantity meaning per supplier: set-on-hand, add/receive, or another operation; signs/negative values; integer or fractional units; precision, rounding, and valid ranges.
4. Supplier-code namespace and normalization (case, whitespace, leading zeros, punctuation), other authoritative identifiers, alias history, discontinued lifecycle and reactivation rules.
5. Duplicate policies for identical rows, conflicting same-code rows, repeated stock aliases, duplicate normalized headers, and whether staff may override a row or group.
6. Exact decimal/grouping syntax, ambiguity handling, and supported encoding labels.
7. What constitutes a material profile drift, whether staff may revise inline, and how profile versions relate to already-reviewed/applied rows.
8. Local retention/deletion/backup rules for raw staging, fingerprints, row decisions, and reports; maximum file bytes, field size, number of columns, local storage, and preview-memory budgets.
9. The target database, local/remote status, write ownership, uniqueness constraints, concurrent edit detection, atomic transaction support, transaction size/time/locking limits, offline behavior, and rollback/error recovery.
10. The exact local-only network boundary, including whether any supplier-derived values can sync. Under the brief as written, remote transfer is not the default permitted path.
11. Whether partial subset application is permitted. Define how pending, rejected, already-applied, unknown-commit, retry, resume, and reversal states are shown. Define what counts as complete.
12. Agreed latency and memory limits for 80,000 rows before performance validation.
13. Whether a local review report must be exportable. If yes, choose format and separately decide safe behavior for external spreadsheet viewing.

## Proposed validation plan — none of these checks was run

### Parser, profile, and trace fixtures

- Comma, semicolon, and tab delimiters; configured quote and escape behavior; quoted delimiters; embedded newlines; LF, CRLF, final record without terminator, and CRLF split across parser buffers.
- Compare raw byte offsets, parser record indices, display data-row numbers, and any shown physical line against fixture ground truth. Include a header, no-header file, and quoted embedded newline.
- UTF-8, BOM, every owner-approved alternate encoding, malformed byte sequences, and strict-decoding rejection. No replacement characters may silently change source values.
- Exact/duplicate-after-normalization/empty headers; added, missing, renamed and reordered headers; changed dialect; saved profile reload and revision.
- Empty, short, and long records; malformed quote shapes; maximum allowed columns, field sizes, file bytes and staging storage.
- Leading-zero, alphanumeric, punctuated, whitespace/case-variant identifiers. Same code under two suppliers; active alias; discontinued/reused alias; fuzzy candidate without automatic target.
- Every approved number grammar, valid group sizes, signs, decimals, unsupported precision, malformed values, and “1,234” under alternate and unconfirmed conventions.

### Duplicate, preview, and protection tests

- Identical repeated source lines; same supplier code with equal/different values; repeated code across locations; two aliases mapping to one internal product. Preserve every source location and require an explicit decision.
- Formula-leading and formula-like text remains inert. An unmapped note-like source field never changes staff notes. No raw CSV export by default.
- Cancel, close, parse failure, profile drift, and opening/closing/reopening preview never change stock. Staged-row retention follows policy.
- Change inventory after preview; apply must detect a stale version and ask for review rather than overwrite.
- Confirm every displayed new/update/no-op identity, raw-to-normalized number, field diff, ignored column, and count matches a synthetic fixture.

### Ledger, transactions, locality, and recovery

- Apply a subset from a file while another row/group remains pending; reopen the same bytes; already-applied rows remain no-ops and the resolved pending row can be applied once.
- Explicitly reject some rows, resume others, and verify completion only after no rows remain pending. Repeat a complete file after restart and verify visible no-op/block.
- Interrupt before first write, during a selected subset, at commit, and after commit before UI acknowledgement. Verify stock changes and row markers agree in the actual target store; query ledger before retry.
- Simulate unknown commit outcome; verify no blind retry and no double addition. Repeat for each quantity operation once selected.
- Exercise database busy/lock, disk full, I/O failure, concurrent staff update, uniqueness conflict, and cancellation. Report exact durable subset state; do not claim whole-file rollback if earlier subsets committed.
- Confirm local-only behavior across source selection, parsing, preview, write, telemetry, logs, crash reports, backup, sync, and retention. Run under an environment that can observe/deny network; no supplier-derived value may escape under the brief’s current requirement.
- If the target DB cannot atomically store stock and row markers, keep import write-gated and test the separately owner-approved recovery design before enabling it.

### Capacity, usability, and rollout

- Generate synthetic files up to 80,000 rows at typical and worst-case permitted widths. Measure parse, staging, matching, preview search/filter/render, selected-subset apply time, disk staging, and peak memory on target machines against owner-approved thresholds.
- Staff walkthrough: first profile, profile drift, new product, update, reused discontinued code, repeated/conflicting rows, locale ambiguity, already-applied and pending rows, cancellation, and resume. Confirm reasons and decision consequences are clear before writes.
- Proposed staged integration: (0) owner supplies the actual repository/schema and local write path; read source, callers, and tests without writes; (1) parser/profile and synthetic fixtures with local staging only; (2) read-only reconciliation preview; (3) disabled-by-default writes against isolated synthetic/local copies with crash/idempotency tests; (4) local pilot for one supplier only after local-data, rollback, retention, limits, staff process, and audit requirements are approved. Expand only after evidence shows the acceptance criteria pass.

## Evidence and execution limits

The source index preserves IDs SRC01–SRC13 without rebinding. Version-specific claims are tied to the versions shown there; current upstream issue/PR status is time-stamped and may change. The reviser directly rechecked the zero-/one-based Position definitions, the open CRLF report and unmerged PR, duplicate-header discussion, exact-decimal scope, Polars inference/error option, SQLite transaction behavior, OWASP formula/export trade-offs, and Calamine release notes. These checks validate cited source statements only.

The input map contains no stock application repository, schema, callers, tests, or database path. No local product-code compatibility, transaction support, UI behavior, local-only property, performance, or crash recovery has been established. No supplier input, production database, importer, code, or validation fixture was run. Every item in the validation plan is proposed work; nothing there is reported as executed.

