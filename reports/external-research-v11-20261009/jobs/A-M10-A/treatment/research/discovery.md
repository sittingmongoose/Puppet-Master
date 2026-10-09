# ER11 research discovery — A-M10-A / treatment / S10 data-import

Stage: research discovery, written before own-case plan reveal. Method: M10 v1, question-relevance-reformulation. Brief: /home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S10/brief.md. Provenance and retained bounded evidence: source-map.json and sources/. This is the pre-plan record and must not be edited after reveal. Scope is this small nonprofit import-assistant brief: large CSV, occasional Excel, inconsistent dates/identifiers, inference preview, source-string preservation, explainable rejects and repeatable monthly transforms. No unlimited production guarantee.

## Discovery position

Use a streaming, source-aware import pipeline that treats inferred types as reviewable proposals. Keep the original file immutable by reference and checksum, parsed values separate from typed/normalized output, and a row/cell issue ledger for failures. Save dialect, column mapping, locale, null rules and transformations in a versioned recipe. A later month has a new input hash; check its schema and pause when drift changes meaning.

For the Rust desktop direction, prototype Rust csv 1.4.0 for CSV records plus Calamine 0.36.1 for workbook cells. This is a candidate, not a benchmark result. Arrow CSV is an optional typed batch path. DuckDB is a useful embedded SQL alternative with inference, workbook import and rejects. OpenRefine and Power Query are analyst-facing competitors with relevant cleanup, recipe and locale patterns.

Distinguish original bytes, decoded fields/cells, inferred types and user-approved normalized values. CSV quoting syntax disappears in parsed StringRecord; retaining decoded text does not retain byte-exact quoting or line endings. In Excel, a numeric cell with a display format that adds leading zeroes differs from a literal text cell. Keep source reference and row/cell coordinate. Show source and normalized values separately.

## M10 retrieval queues

Obligations were enumerated from the brief before plan reveal. The three working cards per question heuristic prioritized context only; it never limited searches, evidence or output. Unanswered conditions triggered reformulation and further reading.

| Obligation | Candidate queue → reformulation | Pre-reveal result |
|---|---|---|
| O1 tools/products | stream parser, typed batches, workbook reader, SQL engine, analyst tools → which protects identifiers and offers reject/reuse behavior? | Rust readers, Arrow, DuckDB, OpenRefine and Power Query compared. |
| O2 primary behavior | sampling, dates, workbook types, rejects → what defaults change meaning and what survives casts? | Key defaults/limits traced; peak memory and display fidelity remain empirical. |
| O3 evolution chain | nearby product issue → regression, diagnosis, test-backed fix and version boundary? | OpenRefine #1908 → #2909/fix commit → 3.5 milestone/tag. |
| O4 exact plan | withheld until freeze → which precise clauses are covered, missing, optional or uncertain? | Deferred; no plan read before discovery. |
| O5 preserve nuance | tool facts versus product requirement → which findings are version-dependent? | Conditions, alternatives, conflict and unknowns retained below. |
| O6 validations | boundary cases → what would distinguish loss, locale error, sample miss, resource risk and recipe drift? | Proposed tests below; no runtime tests executed. |

Emergent question queues: seekable versus compressed sampling; locale as ambient state; workbook storage versus display, epoch and formula cache; structural parse versus cast failure; recipe reuse versus undo history; memory setting versus total RSS and temp disk; project archive versus privacy.

## O1 — useful unfamiliar tools and alternatives

Rust csv 1.4.0 provides delimiter/quote/escape/comment configuration, reusable records, row positions, and string/byte record forms. Defaults matter: header=true, ragged rows error unless flexibility is enabled, and fields are not trimmed. Make each setting explicit. Preserve original bytes separately; treat identifiers as text until approved. [S06]

Calamine 0.36.1 distinguishes integer, float, text, boolean, Excel date/time, ISO date/time, duration, error and empty. Xlsx::has_1904_epoch reports the workbook epoch. XlsxCellReader streams used cells and can expose formula details, unlike materializing a Range. This is a candidate for occasional workbooks and differs from DuckDB's narrower workbook support. The iterator does not bound all memory because workbook metadata/styles/shared strings may still be needed. [S08, S09]

Apache Arrow Rust arrow_csv is a typed columnar alternative: explicit schema, batches defaulting to 1024 rows, projection and header validation; example inference covers first 100 rows or all rows. It does not by itself preserve raw spelling or choose locale. [S07]

DuckDB is an embedded analytical SQL engine with CSV detection, xlsx import and reject tables. sniff_csv provides a useful suggest-then-freeze pattern; however, auto-detection is not user-approved schema. [S01–S05]

OpenRefine is a local data-cleaning product with facets and undo/redo; operations can be extracted/reapplied as JSON, but individual cell edits are not extractable. Project archives retain earlier/raw values, creating a confidentiality risk. It is a strong manual cleanup competitor and UI reference. [S11]

Power Query makes the inference tradeoff explicit: first 200 rows, whole-file inference, or all columns as Text. Its unstructured input type detection defaults on, and Desktop uses machine regional settings until Using locale is chosen. It is a product competitor and UX reference, not an embeddable Rust dependency. [S10]

Polars current Rust API exposes inference length, low-memory, thread, schema and override controls. It is a future DataFrame-engine benchmark option; those controls do not establish hard memory bounds or source preservation. [polars-io 0.55.2 API search only]

## O2 — behavior, defaults, types and limits

### CSV and inference
DuckDB 1.5 current samples 20,480 rows by default. Seekable disk files can be sampled at different positions; gzip/stdin sampling begins at the front. sample_size=-1 asks for whole-file inference. Thus the sample is not universally the first 20,480 rows and does not guarantee a late rare date/ID will be detected. DuckDB also documents ambiguity such as 01-02-2000 and manual dateformat/timestampformat. Power Query independently offers first-200, all-data or no-inference modes. [S01, S10]

DuckDB candidate types fall back to VARCHAR; all_varchar disables inference. All-string files are ambiguous for header detection and DuckDB assumes a header. Rust csv defaults to a header but allows explicit choice; it errors on ragged rows by default. Show header/no-header, blank/duplicate headers, sample coverage and conflicts. Keep an all-text option. Do not convert a value such as 000184 into a quantity because it parses numerically.

Dialect, encoding and null handling affect data before typing. A European decimal comma, semicolon delimiter, quote/escape or encoding choice can change field boundaries. DuckDB supports UTF-8, UTF-16 and Latin-1. Rust StringRecord is UTF-8-oriented; other encodings need deliberate transcoding with source bytes retained. DuckDB's 2,097,152-byte max-line default is a tool-specific limit, not a product target. Report bad/long lines with position and remedy. [S02, S03, S06]

### Rejected rows
DuckDB can retain scan settings and line/byte positions, column name/index, error type, original line and message when store_rejects=true. That feature is opt-in, and rejects_limit=0 means no limit. ignore_errors can hide failure as skipped data; for Excel, DuckDB states cast failures may silently become NULL. Borrow diagnostic structure but do not use silent null/drop behavior.

Separate structural parse failures from cell cast failures. Preserve offending source and coordinates. Show accepted/rejected/header/blank/skipped counts that reconcile input. For a malformed row that cannot be parsed, preserve source bytes and best offset instead of inventing a normal row. [S03, S04]

### Excel
DuckDB workbook import defaults to first sheet; inferred rectangle can stop at an empty row. Range and stop_at_empty alter behavior. Header detection uses first-row nonempty strings. Type inference may use number format; empty cells default to DOUBLE unless overridden. It supports modern xlsx, not legacy binary workbook format. ignore_errors can turn failed casts into NULL. Useful if constraints fit, not a lossless semantic authority. [S04]

Calamine exposes workbook epoch and typed cell kinds. Numeric storage plus display format can appear as a date; a literal text cell is different. Preserve sheet/cell coordinate, cell kind, error/empty state and available format/formula metadata. Do not convert long/zero-padded identifiers automatically. Formula APIs expose cached/literal value and formula information, not recalculation. A missing/stale cache remains uncertainty. [S08, S09]

### Dates and locale
Power Query demonstrates locale is governing input: UK day/month text fails under US month/day; Using locale resolves it. Store locale on the operation, not only ambient workstation state. Preview ambiguous values and keep them as text until user decides. Keep original strings next to parsed values. Date, local DateTime and zoned timestamp are different choices. Do not invent timezone for an Excel date-only value. [S10, S13, S14]

### Memory
DuckDB memory_limit defaults to 80% RAM but only controls its buffer manager; some operations exceed it. OOM guidance suggests 50–60% in constrained environments and spill uses temporary disk. It is not total GUI RSS. Arrow batches and Calamine iterator are plausible bounded shapes, not guarantees. OpenRefine installing docs say 1 GiB default and >1 million cells/>50 MB is large; v4 architecture docs describe lazy local disk reads. These are different generations: identify exact release before comparison. [S05, S07, S09, S11, S12]

## O3 — evolution chain

OpenRefine issue #1908 says Excel dates appeared as text in 3.1 and its date transform failed; reporter says workbook worked in 2.8. Maintainer diagnosis traces this to Java 8 date API migration changing expected product date type while Excel importer remained unchanged. PR #2909 added a regression test and changed the importer to OffsetDateTime; merged 2020-07-09. Issue assigned to 3.5; maintainer said fix would ship in 3.5, not 3.4. The 3.5.0 release tag is dated 2020-11-07. This is a concrete issue → diagnosis → test/fix → merge/release-boundary chain. It does not prove all workbook epochs, formats, formulas or timezone behavior. [S13–S15]
Secondary clue: OpenRefine #7042 reports quote-option behavior changed between importer versions 3.7 and 3.8, later linked to closed PR #7703 / 3.10.2. Keep compatibility fixtures. [S16]

## Candidate product shape

1. Per-run manifest: source hash/size/name, encoding, dialect, header, worksheet/range, locale, null/date/number rules, library versions and errors. Each month has its own input hash; recipe is reusable across hashes.
2. Source values: preserve original CSV bytes or controlled source copy plus hash; keep decoded strings and positions separately. For workbook keep source, cell address/kind and available formula/cache/format. Label exact source versus rendered interpretation.
3. Two-phase typing: show sample coverage/conflicts and proposal. Keep original and typed/normalized values side by side. IDs remain text unless approved; locale/date explicit.
4. Issue ledger: position, structural/cast kind, message, offending value and chosen rule. User chooses keep, repair, null, skip or reject. Show counts/examples. No silent null/drop.
5. Versioned recipe: named ordered operations, locale/null/schema/header/ID policy. On next file, map by header plus disambiguator; show drift and pause where semantics change.
6. Bounded execution: stream records/batches, bound UI cache, cancellation, file-backed staging. Benchmark representative rows, string width, workbook metadata, spill and temp disk.

This is an inference from docs and the brief, not implementation or measured performance. DuckDB could be optional SQL staging/query; OpenRefine informs manual cleanup; Power Query informs locale UX.

## Proposed discriminating validations — not run

No representative nonprofit files or runtime/test harness were available. These are proposals only.

| ID | Fixture/action | Distinction |
|---|---|---|
| V1 | UTF-8 accents/emoji, BOM, quoted delimiter/quote/newline, CRLF/LF, leading-zero ID, whitespace, empty vs null; preview/transform/export | Bytes, decoded value, null/trim rule and output remain distinguishable; ID not coerced without approval. |
| V2 | Seekable CSV and gzip with rare date/ID after row 20,480 | UI reports mode/coverage; no silent late recast/drop; measure full-scan cost. |
| V3 | Delimiter/decimal variants, no-header, blank/duplicate headers, ambiguous dates under two locales | User can override header/dialect/locale; ambiguity visible. |
| V4 | Missing/extra fields, bad quote/encoding, cast error, max-line boundary | Structural vs cast issue; offsets/source retained; counts reconcile. |
| V5 | Both Excel epochs, text/numeric zero-padded ID, date formats, formula fresh/stale/missing cache, error/empty cells, blank row, sheets/ranges | Value/epoch/cache visible, no zone invented, measure materialized Range vs iterator. |
| V6 | Monthly recipe with reordered rows and schema drift | Stable replay works; semantic drift pauses; per-run hash/count; prior hash not a condition. |
| V7 | Large/wide/long-line workbook workloads on lowest target laptop | Measure RSS/time/temp/cancel/recovery; preview bounded; disk failure visible; compare readers on same corpus. |
| V8 | Inspect recipe JSON vs project archive after anonymization | Recipe excludes source data; archive warns about retained history/raw values. |

## Uncertainty / boundaries

No target RAM/CPU/disk, row/cell distribution, accepted workbook formats, or export target was specified. Decide support envelope rather than invent it. Original strings may mean bytes, parsed field or rendered cell; state behavior per adapter. Workbook serial/epoch/format and formula cache differ; test real files. Sampling trades speed against rare late values. DuckDB configured memory is not total RSS and spill uses disk. OpenRefine memory docs refer to different generations. No issue/fix thread proves every workbook/date semantic.

O4 requires exact plan comparison after freeze; no plan was read early. O5 is supported by retaining alternatives, conditions and uncertainty. O6 proposals are explicitly not run.

## Executed vs proposed
Executed: exact assignment/input map and declared brief read; source pages researched; source-map JSON parsed; mandatory reveal control run; revealed-plan.md read. Discovery was saved before reveal and was not edited afterward.
Not executed: product installs, parser/workbook runtime, benchmarks, or V1–V8. No proposal is a result.

## Completeness
This small-scope draft gives exact P1–P6 dispositions, retained conditions/alternatives, optional capability/user-decision and uncertainty, and discriminating proposed checks separate from executed work. Later stages may correct it with new evidence.
