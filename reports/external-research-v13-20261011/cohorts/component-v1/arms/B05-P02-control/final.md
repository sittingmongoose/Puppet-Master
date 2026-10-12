# CSV inventory importer — finalized research proposal

**Scope.** A proposed CPython 3.13.9 component for a desktop inventory editor. This is a design and validation plan, not an implemented importer, a live spreadsheet, or a claim that inventory data was imported. Python's CSV documentation itself warns that CSV is not defined by one stable standard and that applications differ in dialect details [CPY-DOC, lines 15–30]. The importer therefore makes file-specific settings visible and requires confirmation.

## 1. User flow and confirmed import profile

1. **Select a source and establish its version.** Open the chosen file read-only. Record a full-content fingerprint (for example, SHA-256) while reading the file in bounded chunks; this is a streaming I/O pass and does not parse or retain the whole file. The preview is tied to this fingerprint. If the selected source's fingerprint differs before import, discard the preview and request confirmation again. A size/modified-time tuple alone is only a heuristic, not proof that bytes stayed the same. A full hash costs I/O for large files, so show progress and cancellation.
2. **Preview a bounded sample.** Read a configurable maximum number of raw bytes and decode strictly using explicit candidate encodings. Present candidate encodings (including BOM-aware options such as UTF-8 with BOM handling) as suggestions [CPY-CODECS, lines 1540-1549]. A decoding error is visible; do not replace or drop undecodable bytes silently. Keep a separate sample byte budget. If the byte boundary lands inside a multibyte sequence or a quoted logical record, mark the sample incomplete/ambiguous and extend only to a configured bound or ask the user to choose settings. A dialect guess on a cut record is not evidence that the full file parses.
3. **Suggest, then confirm, format.** A known-vendor profile can prefill encoding and dialect. For an unfamiliar file, `csv.Sniffer.sniff` may suggest delimiter/quote settings; constrain its delimiter candidates when the user or profile supplies them. `Sniffer.has_header` is only a heuristic: CPython documents false positives and false negatives. Never call it proof and never silently drop the first row from a positive guess. Let the user choose “first row is header” or “first row is data,” then confirm the mapping explicitly.
4. **Validate the mapping before dictionary conversion.** Show sample rows beside the proposed column mapping. Reject duplicate header names before constructing dictionaries, since CPython's `DictReader` forms each row with `dict(zip(fieldnames, row))`, so duplicate keys can overwrite earlier columns. Let the user map, ignore, or deliberately leave columns unused; validate required fields and mapping collisions.
5. **Freeze the profile used for both preview and import.** Store encoding and decode error policy, delimiter, quote character, double-quote and escape behavior, initial-space rule, quoting mode, header decision, column mapping, null convention, ragged-row policy, schema conversions, source fingerprint, and resource limits. Apply that profile unchanged while parsing. If any file bytes or profile setting changes, show the changed source/settings and ask for confirmation again.

## 2. Parse as text first; convert by an explicit inventory schema

Use CPython's standard `csv.reader` with an explicitly selected text encoding, `newline=''`, and the confirmed dialect. With the default `QUOTE_MINIMAL` reader mode, rows are returned as strings; no automatic type conversion is performed. This is the safe base for exact text. In particular, keep SKU, barcode, account-like identifiers, and other identifier columns as strings so leading zeros and spelling survive. Do not strip whitespace, normalize case, or parse numeric-looking columns unless the selected schema says to do so.

**Do not use `QUOTE_NONNUMERIC` as “type inference.”** CPython 3.13.9's reader converts every non-quoted field to `float`; it does not inspect column meaning. An unquoted SKU such as `00127` becomes a number and loses its source spelling; large numeric identifiers can also lose integer precision through floating-point conversion. The C implementation calls `PyNumber_Float` for those fields, and CPython's own tests demonstrate quoted text staying text while unquoted fields become numeric. Parse selected numeric columns after CSV tokenization using explicit per-column rules, range checks, and a declared decimal convention. Keep the original parsed text available for diagnostics and review.

Open text files with `newline=''`. CPython documents that this is needed for correct quoted embedded newlines. Use a separate monotonically increasing logical data-record number for the import UI; `reader.line_num` counts input lines consumed and can advance by multiple lines for one CSV record. For each record, retain the line count before reading and after reading so a diagnostic can show the physical line interval, plus the logical record number. A syntax error should identify the record/line context available from the reader, not claim a column position the parser did not provide. Consider `strict=True` for syntax errors, with a clear diagnostic and a separately defined policy for variable row widths. CPython's default `strict=False` is permissive for some malformed quoting; the upstream tests show cases accepted by default but rejected in strict mode.

Parse rows to lists first. Compare each row's field count with the confirmed mapping/schema before creating mapped records. Report extra and missing cells, including row/line context. The user must choose whether a ragged row is rejected, corrected in preview, or accepted under a field-specific default; do not silently discard extras or use `None` padding that could mean something else. Define a deliberate policy for blank records too. `DictReader` is an optional convenience after header validation, not a way to infer correctness: its documented `restkey` captures extra fields and `restval` fills short rows, and its implementation skips empty rows.

## 3. Make empty text, null, and a missing column distinct

The ordinary reader returns empty fields as strings and performs no automatic type conversion. The ordinary writer serializes `None` as an empty string, which CPython documents as non-reversible. The draft's claim that the default reader can reconstruct that distinction is incorrect.

Represent at least these states separately in the import model:

- **Empty text:** an actual present cell containing `""`.
- **Null:** a present cell the user-selected source convention says means null.
- **Missing:** a cell position absent because the row is short; represent this with a dedicated `MISSING` sentinel or a ragged-row diagnostic, not the same `None` used for null.

Make null interpretation an explicit import-profile choice. Options include: treat blanks as text; treat a documented vendor blank convention as null; or, when the source format explicitly defines quoted versus unquoted empty fields, use CPython 3.12+'s `QUOTE_NOTNULL` reader mode, which maps an unquoted empty field to `None` and leaves a quoted empty field as an empty string. This mode is not a general CSV null detector and must only be selected when the vendor's convention is confirmed. `QUOTE_STRINGS` also maps an unquoted empty value to `None`, but otherwise behaves like `QUOTE_NONNUMERIC` and converts unquoted values to floats, so it is unsuitable for an all-text import. Alternatives are a user-declared null marker with a documented escaping/collision rule or a typed sidecar/schema. If a source convention does not encode null distinctly, do not invent a distinction: tell the user what cannot be recovered and require a chosen policy.

## 4. Bound resources in the units the parser actually limits

`csv.field_size_limit(1048576)` sets a maximum of 1,048,576 parser characters for **each individual field** in CPython 3.13.9. It is not a one-MiB byte limit and not a whole-row limit. The C parser counts decoded Unicode code points in its field buffer. A row with many fields can therefore exceed the memory budget even when every field is below this setting. The parser also materializes the current row as a list; streaming does not bound the memory for one pathological record.

Set independent, configurable limits with units and visible error messages:

- maximum source file bytes (enforced while reading, not only by a preflight stat);
- maximum preview sample bytes;
- maximum decoded characters per field using `csv.field_size_limit`;
- maximum fields/columns and maximum total decoded characters per logical record;
- maximum records and total staging bytes, with a disk quota;
- optional elapsed-time/throughput thresholds and a cancellation check between logical records.

A hard source-byte ceiling is the pre-parse backstop for one pathological record: csv.reader returns a fully materialized row before application code can count all its cells. A post-row column/record-size check remains useful for diagnostics and policy, but by itself does not prevent that row allocation. If product requirements need a tighter pre-allocation per-record ceiling, use a bounded parser-aware input layer and test it with quoted multiline fields; do not split on physical newlines.

Choose production values after measuring representative vendor files on target machines; the draft's one-MiB number is only a candidate field-character ceiling, not a justified product-wide resource budget. The `field_size_limit` setting is on the CSV module state and affects readers using that module instance, so set a consistent application limit or serialize changes rather than letting concurrent jobs change it under one another.

## 5. Stage first, publish only after full validation

Stream parsed and converted records into an isolated staging dataset, not into the currently visible inventory. Validate every selected record, field conversion, required value, duplicate/unique constraint, row policy, and source/profile fingerprint before making any staged row visible. Check cancellation between records and during long validation/batch writes. On parse error, validation error, source change, resource-limit breach, or cancellation, close readers and remove only this import's owned staging data. Preserve the pre-import inventory.

The final publish operation must be atomic in the chosen persistence layer: one transaction covering the full staged batch, or a versioned dataset plus an atomic pointer/version switch when the store cannot transact the batch directly. Do not claim that the Python CSV API provides this guarantee. Inject failures at late validation, stage write, cancellation, and final publish to prove that no partial inventory becomes visible and that cleanup does not remove another job's state. If the existing storage layer cannot provide an atomic publish, the component is not ready to import into live inventory.

Keep the source archive optional and explicitly user-authorized. Do not log raw row contents by default; diagnostics should identify row/column and error category without copying sensitive values into logs.

## 6. Alternatives and choices

| Decision | Recommended path | Alternative and when it may fit |
|---|---|---|
| Delimiter/header handling | Explicit vendor preset or a Sniffer suggestion followed by user confirmation; header/no-header and mapping are user choices. | Fully automatic inference only as a reversible suggestion on low-risk data. It cannot prove header meaning. |
| Data types | Read text, then apply explicit per-column schema conversion. | `QUOTE_NONNUMERIC` or `QUOTE_STRINGS` only when the vendor format deliberately encodes all nonnumeric/string fields as quoted and numeric fields as unquoted; identifiers make that unsafe as a default. |
| Loading strategy | Stream records into bounded staging. | Whole-file dataframe/table loading can simplify small known files, but increases peak memory and encourages unwanted type inference. Use only below an explicit size limit with exact-text settings and the same atomic publish rule. |
| Null representation | User-selected convention; preserve missing separately. Prefer `QUOTE_NOTNULL` only for a confirmed quote-based source convention. | Escaped null marker or typed sidecar when the vendor controls a documented round-trip format. Both require collision and versioning rules. |
| Row-shape policy | Diagnose ragged rows and apply a confirmed reject/correct/default policy. | `DictReader(restkey, restval)` is convenient after header normalization when its extra/missing-field behavior is the chosen policy. |
| Failure handling | Isolated staging and one atomic publish. | Direct writes as rows arrive are rejected because late failure or cancellation can partially mutate inventory. |

## 7. History retained and open decisions

The earlier direct-write-as-rows-arrive idea was retired because it violates failure atomicity. Keep that history as a rejected alternative, not as a fallback implementation. The useful starting choices remain `csv.reader`, explicit decoding, streaming, user confirmation, and staging. This review corrects unsafe claims without dropping those supported mechanisms.

Product decisions still needed before implementation: the accepted vendor encodings/dialects; whether header detection is shown at all or only a vendor preset is offered; policies for duplicate/blank headers and ragged rows; per-column data types and required fields; the exact null convention for each supported vendor; and target-device limits for file bytes, fields/record, record count, staging quota, and timing. Those choices are not inferable from CPython's parser behavior.

## 8. Validation plan (future work, not executed here)

Build fixture-driven tests for: leading-zero SKUs and long digit identifiers; quoted and unquoted numeric-looking text; UTF-8, BOMs, and each supported legacy encoding; invalid decode sequences; CRLF/LF/CR and quoted embedded newlines; header/no-header cases that cause false Sniffer guesses; user override and repeated/blank header names; extra/missing cells and blank records; chosen empty/null/missing policies including marker collisions; fields just below/above the character limit; too many columns and an oversized record; total input and staging quotas; source changed after preview; strict and permissive malformed-quote fixtures; cancellation at first, middle, and last record; late validation/stage/publish failures; and two concurrent imports.

Assertions must cover exact resulting field values (including spelling, zeros, whitespace, and null state), the diagnostic record and physical line range, preview/import profile identity, bounded resource behavior, cancellation cleanup, and byte-for-byte or version-level preservation of the prior inventory on every non-success path. CPython's upstream tests are evidence of the standard-library behaviors described here; they are not product tests, were inspected but not executed during this review, and do not certify this component.
