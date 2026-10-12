# Brief-only discovery: supplier spreadsheet reconciliation

**Stage:** investigator · **Run:** B07-P01-control  
**Research boundary:** the original brief only. The withheld plan was not sought, inferred, or opened. This is a research proposal, not an implementation. No supplier data was imported and no production database was changed.

## Brief-derived problem frame

The import is a local, reviewable reconciliation workflow for delimited text that may have inconsistent headers, separators, decimal conventions, product codes, repeated rows, and mid-batch failure. The brief fixes several safety constraints: preview/cancel must not change stock; formulas are inert input; supplier codes are not globally unique; ambiguous numbers are not silently coerced; unmapped fields cannot overwrite staff notes; repeated imports cannot add quantities twice; every invalid row remains traceable; mapping reuse must detect structure drift; and data stays local. These are design requirements, not claims about an existing application.

## Parsing and mapping approaches

A reusable supplier profile is a stronger authority than re-sniffing every file. A profile can hold supplier identity; encoding; delimiter, quote/escape and record rules; header-row count; exact header aliases and ordered structure; selected columns; numeric locale/scale and blank/null rules; per-column target and update permissions; version; and a structural fingerprint. Store the original header strings and parser/profile versions. A matching profile may propose a mapping, but changed, missing, duplicated, reordered or unknown headers, changed field count, or a changed dialect should move the file to review before apply. Never silently fall back to old column positions.

W3C CSVW metadata (S02) is a useful vocabulary for describing dialect and columns. A small documented local subset is enough; adopting the full web metadata processing model is not required. CSV is not one uniform dialect: RFC 4180 (S01) describes an informational common format, but real producers vary. It also allows quoted fields to contain commas and line breaks, so one physical line is not always one record. A parser must return logical records and source positions rather than splitting text on newline.

**Feasible parser alternatives:**

1. **Explicit-profile streaming parser.** Rust csv 1.4.0 can be configured for delimiter, headers, quoting and escaping, yields records as strings, and can reuse a record buffer (S03–S05). Its default equal-field-count check catches width drift; enabling flexible records removes that check, so a product must then classify the discrepancy itself. This is a candidate where Rust is already a fit, not a selected dependency.
2. **Standard-library parser.** Python 3.14's csv reader returns strings unless a special conversion mode is requested; its dialect configuration is explicit, and reader line_num counts physical lines rather than returned records (S06). CPython's tagged implementation shows Sniffer infers from a sample and resolves equal fits using a preferred delimiter order; tests cover line counting, quoted newlines and very large fields (S07). This is a compact implementation/test baseline if Python is already used, but a guess from a sample must not authorize an import.
3. **Local query-engine staging.** DuckDB can sniff delimiter/header/types and offers explicit column types, decimal/grouping settings, strict parsing, and reject collection (S08). Its preview docs set a 20,480-row sample default, below the 80,000-row ceiling. A recent open upstream issue reports a specific changing-dialect input where early rows disappear without an error; the issue's author says increasing sample_size does not address that case (S09). This is an unverified issue report, not proof that every release behaves that way. If DuckDB is considered, pin a release and make the sniffer a suggestion only; reconcile expected and parsed record counts across the entire file.
4. **Database bulk load.** If the existing backend is PostgreSQL, COPY into a private staging table may help throughput. PostgreSQL 18 fails on processing errors by default; ON_ERROR ignore can discard conversion failures, with optional line/column messages only at verbose logging (S13). Do not equate an aggregate rejected count with traceable row diagnostics. If the store is SQLite, its transaction and UPSERT features offer a different integration shape (S11–S12). The backend, transaction duration, contention and 80,000-row latency are unknown, so this remains conditional.

For a new or mismatched layout, a detector may present likely delimiter/header/encoding choices, but staff must see the entire header and representative rows and confirm the profile. Read text fields first. Parse numeric values only under a selected profile with a declared decimal mark, optional grouping mark, precision/scale, sign and blank/null interpretation. Values such as 1,234 can mean different things; if more than one interpretation remains, flag the row and require a choice. Keep the original string beside the normalized value. Use an exact decimal/integer domain type that matches stock units, not binary floating point; the app's unit precision and rounding rule need owner input.

The plain-text parser should never invoke a spreadsheet or formula engine. Formula-looking content remains literal text and is shown as such. An unmapped column is visible in the preview but has no write path. Treat field updates as an allowlist: supplier-owned attributes may update only after mapping, and staff-authored notes are excluded unless an explicit, reviewed rule is added.

## Identity, duplicates, and replay

A supplier code is an external alias, not a global product primary key. Reconcile against an immutable internal product ID and a supplier-scoped alias record. Preserve the raw supplier code and use only an explicitly chosen normalization policy. A reused code after discontinuation is inherently ambiguous: retain its historical association and require staff to decide whether the row revives the old product, identifies a new internal product, or needs more evidence. Do not resolve that case by code alone or by last-write-wins.

Classify repeated source rows separately from repeated codes across historical batches. The preview should group exact repeated rows, same-code/same-attribute rows, and same-code/conflicting rows; preserve every source record. A repeat may be a supplier export defect, separate quantity lines, or a real split. The product owner must choose per supplier whether exact repeats are blocked, aggregated, or retained as separate operations. Conflicting rows should require a choice. No policy should silently discard, sum, or overwrite.

Record each import locally with supplier, file SHA-256, selected profile/version, parser version, operation mode, start/end status and per-record results. A completed file/profile/mode should be recognized on reimport and shown as already applied before any new stock changes. Provide a deliberate correction/reversal flow; “import again” must not be an implicit replay. If the product supports resumable chunks, give each source record a stable key within the batch and write that row's stock mutation and applied marker in the same database transaction. A hash key alone does not answer whether a file is a stock snapshot (replace quantity) or a delta (add quantity); that business meaning is unavoidable.

## Review and application flow

1. Select a local file and supplier/profile. Verify file access stays on-device and keep any staging/cache under an explicit local retention policy.
2. Parse to local staging as raw values, stream records, and compute total/valid/invalid counts; record byte offset, logical record index, profile version and (when verified) physical start line. Record index plus byte offset is the canonical locator. Embedded line breaks mean line number and record number differ (S01, S04, S06).
3. Show profile match/drift, unrecognized or duplicate headers, parser settings, numeric interpretations, row-width errors and duplicate groups. Offer an explicit re-map path for drift; do not silently reuse a profile.
4. Preview outcomes by category: new, update, unchanged, duplicate, ambiguous identity/code reuse, invalid, and conflict. For update rows show current value, proposed value, mapped source column and source location. Show counts and filters; use pagination/virtualization for 80,000 rows. Make staff notes and ignored columns visibly protected.
5. Only an explicit Apply starts stock writes. Define its transaction policy before implementation. A canceled preview has no stock or production mutation.

Two transaction policies are viable. In **all-or-nothing mode**, stage and validate first, then apply all accepted operations plus the batch receipt in one database transaction; any commit failure rolls back stock effects. This is easiest to explain, but a long 80,000-row transaction may contend with normal stock work and must be measured on the actual backend. In **resumable partial mode**, apply bounded units and record each applied source row atomically with its stock mutation; a crash leaves a visible Partial state and resume skips only rows already committed. This scales recovery differently but knowingly leaves partial inventory changes. The owner must select the policy and define cancellation after Apply begins. Do not simulate resume with a separate status write that can disagree with stock.

For SQLite specifically, BEGIN IMMEDIATE may fail with SQLITE_BUSY if another writer is active (S11); report that as a recoverable apply conflict before claiming success. SQLite UPSERT resolves defined uniqueness conflicts but does not by itself make inventory updates idempotent or decide whether quantities add or replace (S12). The PostgreSQL COPY path likewise requires explicit reject-row retention rather than relying on its ignore option (S13).

## Unavoidable owner decisions

- Are supplier quantities full snapshots, adjustments, or deltas? Which fields may replace stock values, and which are additive?
- What should an exact repeated source row mean: block, ignore, aggregate, or separate line? How should conflicting duplicate-code rows be resolved?
- When a discontinued supplier code reappears, can staff revive the prior internal product, create a new one, or must they resolve it manually? Which raw-code normalization rules are allowed?
- What locale, decimal/grouping marks, sign/negative rules, units, precision, rounding and blank/null semantics apply per supplier and field?
- Which supplier fields are allowed to update, and which staff-authored attributes (especially notes) are permanently protected?
- Is Apply atomic for all accepted rows, or may it commit partially and resume? What happens if staff cancel, the app closes, or storage fails during apply?
- How long may raw source files, rejected values, local staging and audit details remain on-device, and may staff export diagnostics?
- Which application repository, language, database and current stock callers/tests define integration constraints? None were supplied in the allowed stage inputs; inspect these before choosing a parser or transaction path.

## Staged integration and validation proposal

**Stage 0 — repository/domain inventory (proposed):** inspect the actual stock schema and write paths, current product identity rules, notes ownership, persistence backend/transaction APIs, import callers and tests. Confirm data residency and user decisions above. No source data or production writes.

**Stage 1 — isolated preview prototype (proposed):** implement one parser adapter behind a profile contract. Keep fields as raw strings; parse incrementally into local staging; compare current stock read-only; never apply from auto-detection. Add profile version/fingerprint and explicit drift handling. No actual supplier data.

**Stage 2 — reconciliation policy (proposed):** specify stable product identity/alias lifecycle, exact and conflicting duplicate rules, snapshot-vs-delta operation, replay ledger, status model and error vocabulary. Simulate these with synthetic fixtures only.

**Stage 3 — application/recovery (proposed):** select atomic or resumable behavior, use the real database transaction boundary, persist receipt and row application atomically, and implement recovery with clear batch states: Preview, Ready, Applying, Completed, Partial/Failed, Canceled. Apply writes only mapped allowlisted fields; never auto-map notes. Keep local files and temporary data within an owner-approved retention period.

**Stage 4 — bounded pilot (proposed):** test synthetic/deidentified 80,000-row fixtures and measure total time, peak memory, preview responsiveness, database lock time and recovery. Then review security/privacy and user comprehension before any production rollout. The brief explicitly does not request actual supplier imports or production database modifications.

Proposed checks (none run): varied delimiter/quote/escape/encoding and BOM; multiline quoted values, CRLF/LF and exact record locators; duplicate/blank/reordered headers; row widths and late-file dialect changes; ambiguous decimal/grouping and overflow; leading zeros and code reuse; exact/conflicting repeated rows; mapped/unmapped note columns; formula-looking text treated literally; 80,000 rows; file/profile replay; preview cancel; failure/cancel at each apply boundary; database busy/full/constraint error; crash between row write and status update; resume/replay with no double stock effect; and offline operation/local file/diagnostic retention.

**Success definition:** every accepted source row produces the reviewed intended change exactly once; errors and duplicates remain attributable to source records; repeated import is recognized before applying quantities again; drift and ambiguous values stop for review; notes and unmapped fields remain untouched; preview/cancel has no stock effect; all source data remains local; and the UI makes counts, old/new values, status and recovery action clear.

**Partial-failure definition:** under all-or-nothing policy, any failed apply leaves zero stock changes and a retryable failure receipt. Under resumable partial policy, the UI reports applied, rejected and pending counts and exact rows, exposes a stable Partial state, and can resume without applying any committed record twice. A file parse/validation failure before Apply leaves stock unchanged in either policy.

## Executed versus proposed work

Executed: read the supplied brief; reviewed primary standards, versioned parser documentation/source/tests, database documentation and upstream issue/discussion evidence listed in [sources/index.md](sources/index.md); created this brief-only discovery.  
Not executed: application code inspection (the target repository/path was not provided), any software build or test, performance benchmark, supplier-data access, database operation, or user study. The listed validation is proposed only.
