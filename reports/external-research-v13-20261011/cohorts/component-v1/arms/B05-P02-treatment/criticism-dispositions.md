# Criticism dispositions — B05-P02 treatment

Each disposition below addresses a material claim, omission, or recommendation in the investigator draft. “Accept” retains a correct point; “amend” preserves it with a necessary boundary or addition; “reject” removes an incorrect assertion; “keep” retains a sound proposal; “uncertain” marks a fact that the available evidence does not settle.

## C01 — Bounded byte preview and selected encoding — Amend

**Draft position:** Read a bounded byte sample and decode it with an explicit candidate encoding; decoding errors should fail visibly.

**Disposition:** Amend. Keep explicit encoding, strict decoding, bounded preview work, and visible failure. The CSV reader consumes an iterable of strings, not source bytes (S1, lines 56–74), so decoding belongs before CSV parsing. A byte sample can stop inside a multibyte character or quoted multiline record; an incomplete sample must be labeled incomplete and cannot yield a definitive dialect or header decision. A maximum input byte budget and any full-file snapshot/hash are separate from the bounded parse preview. Do not silently ignore or replace invalid bytes.

## C02 — Sniffer delimiter/quote guess — Amend

**Draft position:** Use Sniffer to suggest a delimiter.

**Disposition:** Amend. Keep it only as a tentative suggestion on decoded sample text. The API analyzes a sample and accepts optional candidate delimiter characters (S1, lines 275–284); the pinned implementation may raise csv.Error when it cannot determine a delimiter and constructs a dialect with QUOTE_MINIMAL and CRLF writer terminator (S2, lines 244–270). It does not select a source encoding or certify a complete vendor dialect. Catch failure and let the user choose explicit settings.

## C03 — has_header proves a header; automatically skip it — Reject

**Draft position:** has_header proves the first row is a header, so the result is definitive for valid CSV and the importer may auto-skip.

**Disposition:** Reject. CPython documents this as a rough heuristic with both false positives and negatives, using sample column types or string lengths (S1, lines 287–304). The implementation takes the first parsed row as the putative header and votes using following rows; it skips rows with a different field count (S2, lines 452–513). The docs say twenty rows after the first, while the pinned loop tests checked > 20 and appears to examine 21 regular-width rows; the exact count is an implementation detail and does not change the heuristic status. Require an explicit user header choice and mapping; never discard a first row based solely on this result.

## C04 — Persist mapping/profile and react to changed bytes — Keep and amend

**Draft position:** Persist the confirmed profile and file identity so the bulk parser uses preview settings; reconfirm if the file changes.

**Disposition:** Keep the consistency goal; amend identity. Save encoding, dialect, header policy, mapping, null policy and source digest together. Size and modification time alone do not prove content identity. Use a temporary immutable snapshot or strong content verification, parse the same bytes shown in preview, and repeat confirmation if the bytes or settings differ. A full digest/snapshot entails full input I/O and storage and needs cancellation and limits. This is a product design requirement, not a guarantee established by the CPython sources.

## C05 — newline='' and quoted embedded newlines — Accept

**Draft position:** Open text input with newline='' and use csv.reader, which supports quoted embedded newlines.

**Disposition:** Accept. The reader documentation says file objects should use newline='' (S1, lines 56–74); the footnote warns that otherwise embedded newlines in quoted fields are not interpreted correctly (S1, lines 640–644). The upstream test source constructs and round-trips quoted newline values (S4, lines 515–531), but that test source was not executed in this review.

## C06 — Streaming rows and default value types — Amend

**Draft position:** Iterate rows rather than loading the whole file; keep text.

**Disposition:** Amend. Streaming the row iterator is appropriate for large inputs. By default csv.reader returns lists of strings and performs no automatic type conversion (S1, lines 56–74). It still returns a complete row list; streaming alone does not bound a huge individual field or a record with many columns. Use explicit multi-dimensional limits and stage to disk. Keep identifiers and exact-text columns as strings, converting only under an explicit schema.

## C07 — QUOTE_NONNUMERIC preserves numeric-looking identifiers — Reject

**Draft position:** Use QUOTE_NONNUMERIC to type ordinary numbers while retaining leading-zero SKUs and large identifiers because only clearly numeric values convert.

**Disposition:** Reject. The docs say unquoted fields become floats and writer quoting is based on numeric status (S1, lines 331–342). The pinned parser converts each nonempty unquoted field through PyNumber_Float for QUOTE_NONNUMERIC or QUOTE_STRINGS; quoted fields stay text, while an empty unquoted field is exempt from float conversion (S3, lines 653–675). Thus correctness depends on vendor quoting, and an unquoted SKU such as 001234 does not stay exact text. Keep the default string mode and perform schema-validated conversion after mapping.

## C08 — Explicit mapping, duplicate headers, and ragged rows — Amend

**Draft position:** Map columns explicitly; validate required headers, duplicates and ragged rows; optionally use DictReader restkey/restval.

**Disposition:** Amend. These controls are useful. DictReader places extra values under restkey and pads short rows with restval (S1, lines 151–172). Its implementation skips blank rows, builds dict(zip(fieldnames, row)), puts excess values under restkey and fills missing fields with restval (S2, lines 145–194). Because duplicate field names become duplicate dict keys, mapping loses earlier values; this is an inference from the dictionary construction. Validate duplicate headers before constructing dictionaries, use a unique extra-field key and a unique missing sentinel, and choose whether blank rows are skipped, rejected, or surfaced. Use csv.reader if row shape itself must be preserved.

## C09 — Logical record and physical-line diagnostics — Accept

**Draft position:** Track a logical record number and reader line counter because a quoted newline means they differ.

**Disposition:** Accept. The documented line_num is the number of lines read from the source iterator, not records returned; records may span multiple lines (S1, lines 503–506). Report both a logical record number and physical line or line range; do not label line_num as a record count.

## C10 — Default None/empty round-trip — Reject

**Draft position:** The default reader can distinguish a writer's None from an intentional empty string without schema or marker.

**Disposition:** Reject. The conventional writer writes None as an empty string and the docs call this transformation non-reversible (S1, lines 87–104). The default reader returns strings without automatic conversion (S1, lines 56–74). It cannot reconstruct which empty field was formerly None. Keep empty, structurally missing, and null as separate states until an explicit convention maps them.

## C11 — QUOTE_NOTNULL, marker, and sidecar alternatives — Amend

**Draft position:** A declared marker, quoting convention, or typed sidecar may preserve null distinctions, with collision rules for markers.

**Disposition:** Amend. Keep these as alternatives and add QUOTE_NOTNULL for compatible Python endpoints. The docs say its writer quotes non-None fields and emits None as unquoted empty; the reader maps an empty unquoted field to None, and it was added in Python 3.12 (S1, lines 356–376). The C implementation contains both QUOTE_NOTNULL and QUOTE_STRINGS modes (S3, lines 83–106); its parser implements the empty-field distinction (S3, lines 653–675). Require the producer and reader to share the convention; arbitrary vendor blanks cannot be assumed to mean null. QUOTE_STRINGS also converts other nonempty unquoted fields to float, so it is not the safe all-text alternative. A sidecar must be schema-versioned and tied to the source digest; a marker needs quoting, escape and collision rules.

## C12 — Optional source archive and privacy — Keep

**Draft position:** Preserve original bytes only in an optional user-authorized archive and do not log sensitive row contents by default.

**Disposition:** Keep. This is a privacy-conscious product requirement. It is distinct from temporary internal snapshotting for consistent preview/import; the latter should have bounded lifecycle, ownership and cleanup. No CPython source claim is needed.

## C13 — One MiB byte cap on each complete row — Reject

**Draft position:** Set field_size_limit(1048576) as a one-MiB byte cap on every complete row and thereby bound parser memory independently of column count.

**Disposition:** Reject. The public API says field_size_limit controls the parser's maximum field size (S1, lines 142–147). The implementation checks current field_len while adding a Py_UCS4 into the field buffer (S3, lines 703–716); its setting is returned/set through the module API (S3, lines 1634–1663). This is a field-character limit, not bytes, total row, or total memory. Upstream test text builds two 50,000-character fields in one record: limit 50,000 succeeds and 49,999 raises (S4, lines 484–501), illustrating per-field behavior; the test was inspected, not run. Replace the claim with separate byte, code-point, line, logical-record, column, record-count, preview and staging bounds. Enforce line and record budgets while reading, since post-row checks occur after row allocation.

## C14 — Sample cap and quoted-record boundary — Keep and strengthen

**Draft position:** A preview sample cap is separate, and cutting a quoted multiline record can make a dialect guess uncertain.

**Disposition:** Keep and strengthen. An unfinished final sample fragment must not be shown as a complete row or used as an authoritative sniff/header result. Bound physical lines and records while reading, stop only at a complete logical-record boundary where possible, and surface “incomplete sample” when limits are reached mid-record. Do not claim that a byte cap by itself bounds parser memory.

## C15 — Staging, cancellation, and no partial mutation — Keep and amend

**Draft position:** Stage records, check cancellation, commit after the full file passes, delete owned staging on failure/cancel.

**Disposition:** Keep the architecture; amend the commit guarantee. Only a single rollback-capable transaction or atomic versioned dataset swap with concurrency control establishes all-or-nothing mutation. A successful validation followed by a partially failing sequence of inventory writes does not. Test late parse/validation failure, cancellation, disk full, commit failure and concurrent update; compare inventory state before and after and verify owned temporary cleanup. The backend is not specified, so its actual atomicity is unresolved.

## C16 — Whole-file loading, inference, and explicit configuration alternatives — Keep and amend

**Draft position:** A whole-file DataFrame may be convenient but memory-heavy and can obscure exact-text policy; presets are more predictable; user-confirmed suggestions help unfamiliar files.

**Disposition:** Keep and amend. These are useful architecture trade-offs. Whole-file loading scales resident memory with the dataset and may coerce values; if retained for known-small inputs, force text or an explicit schema and compare every output with streaming. Vendor presets should be versioned and displayed because they can become stale. Sniffer suggestions still require confirmation. These are design comparisons, not empirically measured results in this review.

## C17 — Existing history and validation status — Keep and expand

**Draft position:** Direct writes as rows arrive were retired due failure atomicity; source/test text was inspected; no importer/vendor test ran; test fixtures are proposed.

**Disposition:** Keep the history and evidence qualification. Direct writes remain retired unless the actual backend can roll back the entire import. Keep the statement that test source was inspected but not executed. Expand validation to include encoding/BOMs, false header guesses, duplicate/empty headers, blank and ragged rows, null convention mismatch/collision, field and record boundaries, many columns, long physical lines, resource exhaustion, source changes, cancellation and failed commit. Include SKU exactness and unchanged prior data, not only imported row counts.

## C18 — Strictness and dialect details — Amend

**Draft position:** The proposal names quoting, dialect and malformed-row validation but gives no explicit strictness behavior.

**Disposition:** Amend. The cached docs say strict=True raises csv.Error on bad CSV and that the default is false (S1, lines 475–478). Make strictness explicit in the confirmed profile. For integrity-oriented imports, test strict mode against each supported vendor format; do not present it as a complete vendor grammar or business validator. Also capture quote, escape, doublequote and skipinitialspace because these alter parsing (S1, lines 403–478).

## C19 — Target release versus cached source pin — Uncertain

**Draft/brief context:** The product target is CPython 3.13.9; source references are from pinned commit 8183fa5e3f78ca6ab862de7fb8b14f3d929421e0.

**Disposition:** Uncertain. The source index gives the exact commit and file hashes, while the docs mark QUOTE_NOTNULL/QUOTE_STRINGS as added in 3.12 (S1, lines 356–376). This review did not establish that the cached commit equals the v3.13.9 release source or execute the behavior under 3.13.9. Keep version claims scoped to the pinned snapshot and verify the target build and behavior before shipping.
