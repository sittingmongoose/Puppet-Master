# ER11 research discovery — A-M10-A

## Scope and question

This is the full-discovery record for ER11 stage A-M10-A, control arm, S10 data-import case, M10 conventional question-relevance-reformulation method. The question is how to build a desktop import assistant for nonprofit analysts who combine large CSVs and occasional Excel workbooks, face inconsistent dates and identifiers, need to understand rejected rows, and repeat transformations monthly on modest-memory laptops.

The work looked for useful implementation approaches and products, then followed primary-source documentation, versioned source, release and issue/fix evidence for consequences to correctness, reproducibility, and resource use. The plan comparison remains sealed until this discovery and source map are saved. Source identifiers S01–S29 resolve through source-map.json and the linked notes under sources/. Current documentation aliases are mutable and are distinguished from tagged releases.

## Findings

### Preserve source values before proposing types

For CSV, DuckDB's sniffer is useful for previewing dialect, header and candidate types, but its documented default sample is 20,480 rows and compressed input is sampled from the beginning. It supports all_varchar to bypass inference. Power Query supplies a familiar comparison: its default unstructured CSV path inspects 200 rows, promotes headers and adds type conversion, while allowing whole-file or Text choices (S01, S22–S23). Both reinforce that type inference is a convenience with a scope, not a safe basis for silently rewriting identifiers or dates.

The proposed data path keeps each CSV field as its original decoded string through preview and profiling. Show sampled and whole-file scope explicitly. Suggest types with counts and representative values, but make parsing a separate, reviewable operation with a chosen locale/format and an affected-row summary. Preserve raw value, source identity, logical record ordinal and byte/record position. Keep identifiers as text by default, including leading zeros and long digit strings. Make trim, null-token, empty-string and whitespace handling explicit transformations, never hidden parser cleanup.

### Separate structural rejects from semantic conversion failures

A malformed CSV record (quotes, inconsistent width, decoding) is different from a valid text cell that fails a proposed date or number conversion. DuckDB can retain scanner settings, original line, positions, column, error type and message through reject capture, but capture is off by default, temporary, may emit several error entries for one source line, and can be bypassed for unselected columns due to projection pushdown. Silent ignore_errors is unsuitable as the default for an assistant that must explain rejected rows (S02). The application should immediately persist captured diagnostics and the untouched source row, and should label columns or rows not evaluated by the chosen query.

A stable row model should use a file fingerprint plus logical record index and retain enough byte/source-location information to point back to the input. Physical line numbers alone are unsafe because quoted CSV fields can span lines (S12). A report should distinguish accepted, rejected, warning, and not-evaluated states; each issue should contain a stable code, raw value, proposed conversion, location and concise explanation. Keep multiple issues attached to one source record without duplicating or losing its raw values.

### Use separate readers for CSV and workbook semantics

Two credible implementation paths emerged:

1. A native-first path uses Rust csv 1.4.0 for record parsing and Calamine 0.36.1 for workbooks, with application-owned profiling, conversion, issue model and UX. csv ReaderBuilder offers the needed low-level delimiter/quote/header/width controls and preserves record fields, but leaves schema inference and reject semantics to the application. ByteRecord is needed when invalid UTF-8 input must be retained without premature decoding (S11–S12). Calamine exposes typed workbook cells and multiple Excel formats; its date representation has 1900/1904 epochs, millisecond precision and no timezone. Recent release fixes show worksheet/string and format edge cases deserve targeted regression coverage (S13–S16). This is the cleanest fit if a small desktop binary and explicit product behavior are priorities, but it carries substantial responsibility for dialect detection, type profiling, error reporting and full-file scaling.

2. A DuckDB-backed path uses its CSV reader/sniffer and reject facilities for large-file staging/profiling and potentially uses its XLSX extension, while the UI owns confirmation, source preservation and recipe semantics (S01–S06). It offers broader analytical operations and documented disk spill controls. Risks include inference/sample behavior, reject persistence/projection behavior, Excel extension first-run packaging, XLS-only gap, and query memory/disk behavior that must be measured. Do not assume its temporary rejects or inferred schema are an audit record. The XLSX extension's first-row/range/format inference and NULL-producing ignore mode make preview fidelity and row retention explicit acceptance criteria (S03–S05).

A hybrid deserves evaluation: native Slint/Rust for application flow and retained records, with DuckDB as an optional engine for profiling/query operations after original strings and source coordinates are staged. Keep engine output behind a stable internal schema so engine choice does not change recipe semantics or audit records. Avoid adding DuckDB solely for CSV decoding unless benchmarks or implementation cost justify it; avoid adding Python/Frictionless solely because its validation report model is convenient.

### Workbook import has a different source-of-truth decision

An XLSX value may have stored cell data, number formatting, formula text and a cached result. Calamine exposes typed values and errors, while DuckDB's extension infers based on workbook ranges and formatting. Neither inspected source alone settles what a nonprofit analyst expects to preserve or display (S03, S13–S16). Product owners should choose whether the source record means stored value, displayed formatted value, formula plus cached result, or a retained combination. The preview should show the chosen representation and mark formula/error/empty cells, sheet and cell address. Do not silently treat Excel serials as timezone-aware dates or treat a displayed identifier as equivalent to its underlying number.

DuckDB's inspected extension supports XLSX, not legacy XLS, and is loaded as an extension; clean offline first-use behavior was not exercised (S03, S05). Calamine is a native reader option, but no memory profile or compatibility matrix was run (S15–S16). Decide whether XLS and formula recalculation are in scope before choosing the reader and packaging model.

### Make recipes portable and honest about drift

OpenRefine demonstrates local/offline-oriented analysis, configurable Java heap, project history, and JSON-replayable operation history, with coverage limits for one-off actions (S17–S20). Power Query's OS-locale defaults and “Using locale” controls show why locale belongs in the recipe rather than machine state (S23). Frictionless gives a structured validation-report model, custom checks and Excel controls, but has a Python runtime boundary and a default error limit of 1,000; a complete report must expose that cap (S26–S29).

A monthly recipe should store: application and reader versions; encoding/decoding and CSV dialect; header/range and sheet; selected columns; type suggestions the analyst accepted; exact date/number formats and locale; null, trim and whitespace rules; ordered transformations; conversion/error policy; output types; and a schema fingerprint. On replay, compare expected names/types and representative constraints with the new file. If headers, field widths, date interpretation or required values drift, pause and show a diff for approval. Never silently “best effort” apply a stale recipe. Export a human-readable summary beside the machine-readable recipe and an accepted/rejected/issues report.

### Resource policy requires measurement

DuckDB documents an 80%-of-RAM default memory limit, configurable limits and temporary spilling for some large intermediates; these settings do not guarantee every operator will spill or that disk space is sufficient (S04). CSV itself can be streamed with Rust's reader, but whether the complete assistant can profile, preview, retain rejects and apply recipes within modest memory depends on product design and workload. Use bounded preview/profile buffers, disk-backed staging when justified, clear temporary-file cleanup, and early free-space checks. Do not infer low resource use from “Rust” or spill safety from a configuration setting.

## Alternatives and tradeoffs

- Native Rust readers (csv + Calamine): best integration with Rust/Slint and direct control over record/source model; widest need to implement and maintain inference, diagnostics, profiling, and format edge cases.
- DuckDB engine: strongest inspected option for SQL-based large-file profiling and configurable spill; adds a native dependency and extension distribution concerns, and requires careful control over inference, temporary rejects and workbook semantics.
- OpenRefine as a benchmark or optional handoff: strong analyst-facing operation history and local workflow; its web-server/Java model is a product comparison, not a drop-in library.
- Power Query as incumbent benchmark: useful expectations for preview, locale choice, errors and profiling; it is not a distributable implementation component.
- Frictionless as schema/report precedent or optional validation sidecar: structured and multi-format validation; Python runtime and report cap add deployment/behavior questions.
- Full custom XLSX/XML reader: not justified by this research. Consider only if native-reader output fails an explicit fidelity requirement and compatibility work is budgeted.

No numeric performance claim is made. No executable, local sample file or product build was run. All performance, offline-install, format-fidelity and usability statements needing measurement remain open.

## Issue, fix and release evidence

The DuckDB chain is concrete: #13043 documents a gzip/tab-delimited sniffer failure against 1.0.0; PR #13083 merged a sniffer correction on 2024-07-20; release v1.1.0 lists it. Current release context inspected is v1.5.6 (S06–S09). Use the report as a regression fixture, while verifying behavior on the exact chosen version; this research did not reproduce it. A 2026 discussion reports a slash-date inference concern without an exact version and was not reproduced (S10).

The Calamine v0.36.1 release fixed strict OOXML, empty XLS strings and XLSB parsing problems (S15). This is a maintenance signal for explicit workbook fixtures; it does not establish a current open defect. OpenRefine issue #6009 captures a user-expectation disagreement around UTC treatment of timezone-free dates; inspected 3.10.0 notes did not identify a matching correction (S20–S21). These are correctness and product-semantics signals, not proof that any inspected current release fails the proposed fixtures.

## Proposed discriminating validations

These are proposed validations only; none was executed in this research.

1. **String fidelity and null semantics:** Import CSV rows with leading-zero IDs, 20+ digit identifiers, empty cells, whitespace-only cells, literal NA/NULL, and Unicode. Compare raw preview, accepted output, recipe replay and issue report byte/value-for-value. This distinguishes source retention from convenient but destructive coercion.
2. **Dialect and structure:** Test comma/semicolon/tab, quoted delimiters, escaped quotes, UTF-8 BOM, multiline quoted fields, metadata preamble and uneven row width. Include #13043's public fixture or a faithful reproduction. Verify inferred settings can be overridden and each malformed logical record is located once with its raw source.
3. **Sampling and scope:** Put a rare type/date/width anomaly after the documented default sample, including inside compressed input. Compare preview/sample findings to a full-file scan. Require the UI to label both scopes and never claim full-file validity from sample-only inspection.
4. **Date/locale:** Include ISO, DMY, MDY, ambiguous 01/02/2025, 1/27/2025, mixed formats, invalid values, date-only values and datetimes with/without offsets. Run under different OS locales, then replay a recipe with an explicit locale. Expected outcomes must be deterministic and explain ambiguous/failing rows; no implicit timezone should appear for date-only input.
5. **Reject completeness:** Include short and long records, quote/decode failures, semantic conversion failures, and an error in a projected-away column. Verify raw row preservation, multiple issue aggregation, not-evaluated labeling, reject persistence across session restart, and explicit truncation if any cap applies.
6. **Workbook fidelity:** Use XLSX files with first and named sheets, blank first rows, hidden-looking formatted blanks, text and numeric IDs, styled dates, 1900 and 1904 epoch workbooks, date-formatted formula cells with cached values, formula errors, and empty strings. Compare stored/displayed/formula representations and cell locations. Add legacy XLS and strict OOXML/XLSB cases if those formats are in scope.
7. **Recipe drift:** Replay against renamed/reordered columns, added columns, changed date format, extra/missing fields and changed null sentinels. It should show a diff and wait for approval when a meaning can change. Verify operation ordering and versioned recipe export.
8. **Resource and usability:** On the minimum supported laptop and a representative large file, record peak RSS, temp-disk peak, elapsed time, cancellation responsiveness and cleanup on success/failure. Test an almost-full disk and low-memory conditions. Observe analysts identifying raw values, accepting types, understanding rejects, and replaying next month without facilitator explanation.

A validation report should include environment, exact reader/engine version, fixture hashes, expected and observed results, and state whether it was run or remains proposed. Performance targets require product-owner thresholds and hardware definition.

## Limitations and unresolved decisions

- Exact target OSes, memory floor, maximum file size, latency budget, and accepted formats were not specified in the case brief; no threshold can be recommended as measured.
- Choose the workbook source-of-truth representation and decide whether legacy XLS, formulas/cached values, strict OOXML, and XLSB are supported.
- Decide whether full-file validation is mandatory before export, or whether analysts may export with visibly unresolved rows.
- Define encoding fallback/replacement policy, duplicate-header behavior, blank-vs-null rules, and when schema drift requires blocking approval.
- DuckDB docs are mutable aliases; cross-check configurations against the pinned release before implementation. Extension prebundling/offline behavior is unverified.
- No performance, install, UI usability, or runtime checks were performed. None of the proposals should be represented as experimentally validated.

