# CSV inventory importer: final research proposal

**Status:** Source-grounded design proposal for the requested CPython 3.13.9 component. This is not production code, an executed importer, or vendor-file certification. The cached source snapshot is pinned to CPython commit 8183fa5e3f78ca6ab862de7fb8b14f3d929421e0; this review did not verify that commit against the v3.13.9 release tag. See the source map and source-inspection record.

## Decision

Build a confirmation-led, streaming importer that keeps CSV fields as text until a declared application schema converts selected columns. Use the standard csv reader with the chosen encoding and dialect, and open text streams with newline=''. Treat Sniffer output as a suggestion. Never use has_header as proof or silently discard the first row.

Keep three input states separate: an empty present cell, a structurally missing cell in a short row, and a logical null under a declared convention. The default CSV writer's None-to-empty serialization loses information. For files whose producer and consumer agree on Python's QUOTE_NOTNULL convention, that mode can distinguish a quoted empty string from an unquoted null; otherwise choose an escaped marker or a paired typed sidecar and specify its collision and compatibility rules.

Stream validated rows into isolated staging. Do not modify live inventory until the entire import validates and a final all-or-nothing transaction or atomic dataset swap succeeds. Bound bytes, decoded characters, fields, records, preview work, and staging storage separately. csv.field_size_limit is a per-field parser limit; it is not a byte limit or a row-memory limit.

## Scope and invariants

The product must handle large vendor CSVs, a bounded preview, explicit encoding and dialect confirmation, user-controlled header mapping, SKUs with leading zeroes, exact decoded field text, quoted newlines, ragged rows, useful diagnostics, cancellation, and bounded work. A failed or cancelled import must leave the prior inventory unchanged. The null interpretation is a visible import choice, not a silent inference.

Preserve source bytes only in a user-authorized archive. Keep row contents out of routine logs. The importer may retain a temporary immutable source snapshot for the preview-to-import consistency check; delete its owned temporary data after success, failure, or cancellation. A full-file hash or snapshot is O(file size), even though parsing the preview remains bounded, so show progress and apply a maximum input size and storage quota.

“Exact text” here means the decoded cell text returned by the selected decoding and CSV dialect. It does not mean that parsing and rewriting will preserve original byte encoding, line endings, quoting choices, or source layout. If byte-for-byte provenance is required, retain the original bytes separately with the user's authorization.

## Import flow

### 1. Select and identify the input

Apply a maximum file size before accepting work. Select an explicit encoding or a versioned vendor profile; a BOM may be shown as a clue, but should not silently decide the user's encoding or null policy. Decode strictly. An invalid sequence is an input error with a location, not a reason to drop or replace bytes.

For reliable preview-to-import consistency, create a temporary immutable snapshot while computing a cryptographic digest, or use an equally strong content verification scheme. Preview and import the same snapshot. If the source path changes and the user chooses the new bytes, take a new snapshot and repeat preview and confirmation. Size and modification time alone are advisory and can miss same-size edits. Hashing or snapshotting reads the full input, so it needs its own progress, cancellation and byte limit.

### 2. Preview and confirm

Read a bounded sample, but do not treat a truncated logical record as a completed row. The preview should stop at configured record and byte limits. If it reaches its limit inside a quoted multiline field or before it has enough complete records, mark the sample incomplete, suppress any header conclusion, and ask for a larger permitted sample or explicit settings. Do not silently parse a partial last row.

Run csv.Sniffer on decoded sample text only as a tentative delimiter/quote suggestion. Catch csv.Error and let the user proceed with explicit settings. Sniffer does not determine an encoding, and its implementation creates a dialect with QUOTE_MINIMAL and a CRLF writer line terminator; its reader still recognizes CR or LF as line endings. A guessed setting is neither a full vendor profile nor proof that the sample represents the whole file.

Show a separate header choice: “first row is headers,” “first row is data,” or “review mapping.” Sniffer.has_header is a rough heuristic with false positives and negatives. Do not automatically skip a first row. Show the first complete records under the current candidate settings, let the user assign columns to inventory fields, and preserve the first row if the user says it is data.

The confirmed profile records encoding, dialect settings (delimiter, quote character, doublequote, escape character, skipinitialspace, quoting mode and strictness), header decision, column mapping, null convention, resource limits, and source snapshot digest. Reconfirmation is required when the bytes or any of these settings change.

### 3. Parse, map, and validate

Use csv.reader for the first pass when preserving every row shape matters. By default it returns lists of strings and does not convert field types. Keep identifiers and other exact-text columns as strings. Convert a field to a numeric or date type only after mapping it to an explicitly typed inventory field and validating the complete value. Do not select QUOTE_NONNUMERIC for inventory imports: nonempty unquoted cells are converted to float, so an unquoted 001234 is no longer the exact SKU text and large identifiers may lose their original representation. Quoted cells remain text in that mode, which would make behavior depend on how a vendor happened to quote a value.

Validate header presence, duplicate names, required columns, row width, value constraints and any configured relationships before staging the row. Do not map duplicate headers straight into a dictionary: CPython's DictReader constructs dict(zip(fieldnames, row)), so duplicate keys collapse (later values replace earlier ones). If DictReader is used after duplicate checking, set a unique restkey for extra cells and a distinct sentinel restval for missing cells. Its implementation skips blank rows; use csv.reader instead if blank rows must be reported or assigned meaning. Do not silently drop extra fields or pad missing data without the user's declared policy.

Count logical records separately from physical source lines. csvreader.line_num is the number of lines read from the source iterator, not the number of records returned; one quoted record may span multiple lines. Diagnostics should include a stable logical record number and the physical line or line range. Avoid including sensitive cell content in logs.

Select and test a strictness policy. The Dialect.strict setting defaults to false; when true, the parser raises csv.Error on bad CSV input. Strictness is not a vendor-format specification and is not proof that every business rule is valid. Use parser errors for syntax problems and separate validation errors for headers, row shape and domain values. Test the chosen setting against each supported vendor format.

### 4. Distinguish empty, missing, and null

Keep the following meanings distinct until the user's declared policy maps them into the inventory model:

- **Present empty cell:** with the default reader, an empty CSV field is the empty string.
- **Missing field:** a short row has no cell at that column. Use a distinct sentinel or explicit “missing” state; do not conflate it with an empty string or a declared null.
- **Null:** only a declared file convention makes a cell null. The conventional writer writes Python None as an empty string and documents that as non-reversible. The default reader does not recover None from that output.

For a closed Python-compatible exchange, QUOTE_NOTNULL is a supported option: its writer quotes non-None fields and writes None as an unquoted empty field; its reader interprets an unquoted empty field as None and otherwise behaves like QUOTE_ALL. A quoted empty string therefore remains distinct. This constant was added in Python 3.12 according to the cached docs, but verify its behavior in the actual CPython 3.13.9 runtime and require every producer and consumer to follow the same convention. It cannot be assumed for arbitrary vendor CSVs: an unquoted blank from a vendor would be read as None even if the vendor meant empty text.

Alternatives are (a) a reserved null marker with documented quoting, escaping and collision rules; (b) a typed sidecar containing null metadata, tied to the source by digest and schema version; or (c) no null inference, leaving the user to map all empty cells as empty text. QUOTE_STRINGS is not the text-preserving alternative: the cached implementation also converts nonempty unquoted fields to float. Do not claim that conventional CSV alone can represent all distinctions without a shared convention.

### 5. Bound resources in the unit each limit controls

Set independently configurable limits and report their units:

| Limit | Unit and enforcement point | What it controls |
|---|---|---|
| Maximum input | bytes | Total accepted source size and full-file snapshot/hash work |
| Preview budget | bytes and complete logical records | Work and data shown before confirmation |
| Physical line cap | source bytes per line, enforced while reading | Prevents an unbounded physical-line allocation before the CSV parser sees it |
| Field cap | decoded Unicode code points per field, via csv.field_size_limit | One parsed field; not a row or file |
| Record cap | source bytes accumulated across physical lines until one logical record completes | Prevents one multiline record from consuming unbounded input |
| Column cap | fields per record | Schema and row-shape bound; the record-byte cap also limits the input needed to create many fields |
| Record-count cap | logical records | Total parse work |
| Staging cap | bytes or rows on staging storage | Temporary validated dataset growth |
| Cancellation checks | each physical line and each completed record | Bounds cancellation latency to the configured line/record limits |

The cached CPython implementation checks field_size_limit against the current field length as each Py_UCS4 is added. The upstream test text uses two 50,000-character fields in one row: a 50,000 limit succeeds and 49,999 fails. This is a per-field limit, not a one-megabyte byte cap on a row. A returned reader row is a complete list, so limits on one field alone do not bound row memory. Enforce physical-line and logical-record byte limits while the input iterator supplies text, before oversized lines or records have accumulated; checking len(row) only after csv.reader returns is too late to prevent the row allocation. Also bound file bytes, field code points, columns, records and staging storage. Choose each ceiling from supported vendor fixtures and the application's memory and disk budget rather than treating 1,048,576 as bytes.

### 6. Stage and commit atomically

Write validated rows to an isolated, versioned staging dataset. Include the confirmed profile, schema version, source digest, row count and validation summary. Check cancellation while reading physical lines and after each logical record. Do not mutate live inventory during preview, decoding, parsing, validation or staging.

Only after end-of-file, all row and domain checks, and a source-integrity check succeed should the importer enter the final commit. Commit through one database transaction or a versioned dataset swap with explicit concurrency control. If commit fails, roll it back and retain the old inventory. If the storage backend cannot provide this property, the no-partial-mutation requirement remains unresolved; a sequence of ordinary row writes is not an equivalent substitute. On error or cancellation, remove only the current import's owned temporary snapshot and staging data, and verify the prior inventory digest/state is unchanged.

The draft's earlier “write rows directly as they arrive” idea remains retired because it risks partial mutation when a later row fails. It is only reconsiderable if the actual backend can roll back the entire import and that behavior is demonstrated under late failure and cancellation.

## Alternatives and trade-offs

| Decision | Preferred path | Useful alternative and condition |
|---|---|---|
| Dialect | Explicit confirmed settings; vendor presets may prefill them | Sniffer suggestion for unfamiliar files, but user confirmation remains mandatory and failures fall back to explicit settings |
| Header | User-confirmed presence and mapping | has_header may be displayed as a nonbinding hint; never use it to discard a row |
| Types | Read strings, then validate and convert according to an explicit schema | Whole-file DataFrame or inference can be convenient for known-small files, but memory scales with the full dataset and inferred types can change identifiers; force strings or a declared schema if used |
| Loading | Stream rows into disk-backed staging | Whole-file loading simplifies some transformations but increases peak memory and postpones useful progress for large files |
| Nulls | Explicit per-profile convention; QUOTE_NOTNULL for compatible Python endpoints | Escaped marker or digest-bound sidecar when endpoint compatibility requires it; document collisions, escaping and lifecycle |
| Row mapping | csv.reader plus explicit checked mapping | DictReader is convenient only after duplicate-header checks and with unique restkey/restval settings |

A versioned vendor preset is more predictable than unconstrained inference, but it can become stale; display its source and revision and let the user inspect every active setting. A whole-file path is an optional small-input route, not the large-file default. A DataFrame type-inference pipeline is not acceptable for SKU or identifier columns unless the importer explicitly forces and verifies text values.

## Validation plan before production

No inventory component, vendor file, or proposed behavior test ran in this review. The source reader only extracted hash-checked source text. After implementation, run the following in the actual CPython 3.13.9 build and against representative, authorized vendor fixtures:

1. **Text and encoding:** UTF-8 and supported vendor encodings, BOM and no BOM, invalid byte sequences, a multibyte character at the preview boundary, strict failure behavior, leading-zero SKUs, quoted and unquoted large identifiers, and exact decoded text preservation.
2. **Dialect and records:** commas, tabs, semicolons and vendor presets; double quotes, escape characters, CR, LF and CRLF; quoted embedded newlines; empty file, one-column file, sample ending inside a quote, malformed quoting under each strictness policy, and sniff failures or conflicting guesses.
3. **Headers and row shapes:** true header, no header, plausible but false Sniffer header, duplicate header names, empty header names, missing required columns, ragged short and long rows, blank rows, and the selected policies for all of them.
4. **Value states:** empty present cell, missing field, null under each supported convention, QUOTE_NOTNULL quoted-empty/unquoted-empty pairs, mismatched producer convention, marker collisions and escapes, sidecar digest mismatch, and exact representation of SKU strings.
5. **Resource boundaries:** each byte, code-point, column, record, preview, row-count and staging limit exactly at and one unit beyond the boundary; many short columns; a single very long physical line; a multiline record near its limit; file and staging quota exhaustion; and measured peak memory under maximum accepted records.
6. **Operations and atomicity:** cancel during snapshot, preview, a multiline record, staging and final validation; late parse/domain failure after valid rows; source changed after preview; concurrent inventory update; commit failure; recovery and cleanup. Compare prior inventory digest and state before/after every failure and cancellation.
7. **Alternatives:** if a whole-file route remains, measure memory and compare every output value with the streaming path under an explicit schema. If it uses a DataFrame, test all-text SKU and identifier columns and null handling instead of assuming inference is safe.

The upstream CPython tests cited in the source map are test-code evidence only; they were inspected as text and were not run here. Passing these future tests would validate the implementation only for the covered runtime, settings and fixtures.

## Review provenance and limits

The requested route was Luna Max Standard. The native Goal receipt and subsequent goal lookup exposed no provider/model/tier identity or observed route options, so the actual route remains unknown. Do not infer it from this document.

Source files were read from the treatment cache at the pinned commit and hash-checked by the provided source reader. The source reader ran under Python 3.14.4; that is the inspection tool runtime, not the target importer runtime. This review did not execute CPython's reader/writer, test code, an inventory importer, or vendor fixtures. The cached commit-to-v3.13.9 release relationship and the application's database atomicity remain open validation items.
