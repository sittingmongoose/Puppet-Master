# Criticism dispositions — B05-P02 control

Scope: independently review the supplied investigator draft against the plan/brief and CPython 3.13.9 primary sources. “Reject” rejects an original claim or design; “amend” retains a valid part with a correction; “keep” retains supported material; “accept” records a valid criticism as incorporated; “uncertain” marks a product decision that primary parser sources cannot settle. Locator IDs resolve in [source-map.json](source-map.json). The cited upstream test file was inspected only; no test suite or behavior witness was executed.

## C01 — Header inference called proof and automatic skip

**Disposition: reject the guarantee; amend to heuristic plus explicit user confirmation.** The draft says `has_header` proves a header and says to skip it automatically. CPython 3.13.9 says it estimates whether the first row “appears” to be headers from a sample and may produce false positives and negatives (CPY-DOC, CSV-HEADER, lines 261–276). Its source votes by testing sampled column types and string lengths (CPY-LIBCSV, SNIFFER-HEADER, lines 403–471). A valid SKU in row one can be lost by auto-skip. The final proposal keeps Sniffer as an optional suggestion and makes the first-row choice/mapping explicit.

## C02 — `QUOTE_NONNUMERIC` described as safe numeric recognition

**Disposition: reject this setting for exact-text import; accept the criticism and amend the type plan.** CPython's documentation says every non-quoted field is converted to `float`, not that fields are safely identified by their content or schema (CPY-DOC, QUOTE-MODES, lines 301–311). The 3.13.9 C source calls `PyNumber_Float` on such fields (CPY-C, QUOTE-CONVERSION, lines 606–640); its tests show quoted and unquoted values get different types (CPY-TEST, QUOTING, lines 392–418). This can erase leading zeroes and may round large integer identifiers. Read text first and convert only columns the user-selected schema declares numeric. Keep the draft's goal of explicit column mapping.

## C03 — Default reader said to recover writer `None`

**Disposition: reject the round-trip claim; amend with selected null semantics.** The writer serializes `None` as an empty string and documentation calls the transformation non-reversible (CPY-DOC, WRITER-NULL, lines 79–95). Default reading does not restore it. In CPython 3.13.9, `QUOTE_NOTNULL` can interpret an unquoted empty as `None` while a quoted empty remains text, but only when the input follows that convention (CPY-DOC, QUOTE-NULL, lines 323–342; CPY-TEST, QUOTING, lines 405–411). Preserve the draft's declared-marker/sidecar alternatives, add the quote-based option with version and format constraints, and represent a missing column separately from null.

## C04 — One-MiB limit called a byte cap for every complete row

**Disposition: reject both unit and scope; amend to per-field decoded-character cap plus independent resource ceilings.** The public API describes a maximum parser field size (CPY-DOC, FIELD-LIMIT, lines 129–133). The 3.13.9 implementation compares each field's character count as it appends a decoded `Py_UCS4` character (CPY-C, FIELD-COUNT, lines 658–671); upstream tests use a two-field row to demonstrate the per-field behavior (CPY-TEST, FIELD-TEST, lines 445–462). It is neither bytes nor row size. Add separate file bytes, preview bytes, fields per record, decoded record size, count, time/cancellation, and staging quota.

## C05 — Streaming claimed to bound memory independently of column count

**Disposition: amend.** Iterating with `csv.reader` avoids holding the whole file in memory and is a sensible base (CPY-DOC, READER, lines 51–64). However, a parsed row is returned as a list, and a field-size limit does not cap the number of fields. Streaming alone cannot bound a single pathological row. Retain streaming while setting per-record/column and total-file limits.

## C06 — Quoted newlines and newline handling

**Disposition: keep, with the exact file-opening requirement.** The draft correctly relies on `csv.reader` for quoted embedded newlines. CPython says file objects should be opened with `newline=''` and specifically warns that omitting it mishandles quoted newlines (CPY-DOC, READER and NEWLINE-FOOTNOTE, lines 51–64 and 579–583). CPython tests round-trip embedded CR/LF in quoted fields using `newline=''` (CPY-TEST, MULTILINE, lines 474–490).

## C07 — Logical record number versus line counter

**Disposition: keep.** This is correct and useful. The public contract says `reader.line_num` counts lines consumed and is not the number of records, because records can span multiple lines (CPY-DOC, LINE-NUM, lines 458–461). Preserve a separate logical record ordinal and the line interval.

## C08 — Ragged rows and `DictReader`

**Disposition: amend.** `restkey` and `restval` do expose extra and missing fields, as the draft says (CPY-DOC, DICTREADER, lines 138–160; CPY-LIBCSV, DICTREADER, lines 133–179). But CPython's implementation skips empty rows and constructs dictionaries from `dict(zip(fieldnames, row))`; duplicate field names therefore collapse to one dictionary key. Validate duplicate headers and blank-row policy before mapping, and do not let `restval=None` conflate a missing column with a null value.

## C09 — Sniffer suggestion and preview/import settings

**Disposition: keep the confirmed-profile principle; amend the confidence and source identity.** The library analyzes a sample and returns a suggested dialect (CPY-DOC, SNIFFER, lines 248–260), not a guarantee. Keep the same explicit settings in preview and import. The proposed fingerprint/re-confirmation mechanism is application architecture, not a CPython guarantee; validate its behavior with file-change fixtures. A metadata-only check can miss same-size content changes.

## C10 — Staging and failure atomicity

**Disposition: keep as a governing product requirement; mark storage guarantee uncertain until tested.** Staging, cancellation cleanup, and late-failure protection satisfy the brief and plan. They are not provided by the CSV API; the chosen database/storage layer must demonstrate transaction or atomic-version-switch semantics. The draft correctly retires direct writes during parsing.

## C11 — Malformed syntax policy

**Disposition: accept the criticism that the profile needs an explicit strictness choice; amend with strict parsing as the default proposal.** In the CSV dialect, `strict=True` raises `csv.Error` on bad input; default is `False` (CPY-DOC, STRICT, lines 432–435). CPython's tests include EOF/quote cases accepted by default and rejected under strict mode (CPY-TEST, STRICT-TEST, lines 363–370), and other malformed quoting tests (lines 342–347). Confirm whether supported vendor files require relaxed behavior; keep row-width policy separate from syntax strictness.

## C12 — Explicit decoding, source/profile reuse, privacy

**Disposition: keep and make operational.** The plan's explicit decoding and consistent settings are sound. CPython documents that ordinary `open` defaults to the system encoding and demonstrates passing an encoding explicitly (CPY-DOC, ENCODING, lines 550–557); input bytes can vary across vendors. Preserve user confirmation and no raw row contents in logs. A source fingerprint is a design recommendation to enforce the draft's stale-input requirement, not a CSV-library feature.

## C13 — Whole-file and inference alternatives

**Disposition: keep as conditional alternatives, with tradeoffs stated.** Whole-file tabular/dataframe loading can fit known-small files but has larger memory exposure and may coerce text; this is a general design comparison, not a fact established by CPython's CSV docs. Automatic dialect/header and CSV-quoting-based numeric behavior are alternatives only when the vendor contract is explicit. The final proposal compares them without making them the default.

## C14 — Test/evidence wording

**Disposition: keep the evidence boundary and state it more precisely.** Upstream docs, implementation, and tests were read at the 3.13.9 release commit. The upstream tests were not run and no application importer, vendor file, storage transaction, or failure-injection test was executed. No executable behavior witness was used, so no witness code/results are claimed. The final validation matrix is proposed future work only.
