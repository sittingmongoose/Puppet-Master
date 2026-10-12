# Critique — B05-P02 treatment

## Overall finding

The draft has a sound product frame: confirm settings before importing, keep the existing inventory unchanged until validation succeeds, stream large files, preserve row diagnostics, and test cancellation and late failure. Its central value and resource claims would nevertheless cause silent data corruption or false safety if implemented as written.

## Material findings

1. **Header inference is not proof.** The draft says Sniffer.has_header proves the first row is a header and tells the importer to skip it automatically. CPython documents the method as a rough heuristic with false positives and negatives. The implementation classifies columns from up to roughly twenty rows and votes against the first row; the pinned loop appears to examine 21 regular-width rows despite the docs saying 20. The result must be a nonbinding hint. The user must choose whether the first row is headers or data.

2. **QUOTE_NONNUMERIC breaks exact text.** The draft says the mode converts only “clearly numeric” values and keeps leading-zero SKUs and large identifiers exact. CPython documents conversion of unquoted fields to float; the pinned implementation converts every nonempty unquoted field using PyNumber_Float. An unquoted numeric-looking SKU therefore changes type/value representation, and large identifiers can no longer be treated as exact text. Use default string fields and explicit, schema-driven conversion after validation.

3. **Default CSV does not preserve None versus empty.** The writer serializes None as an empty string and documents that transformation as non-reversible; the default reader returns strings. The claimed automatic null recovery is false. Keep missing fields separate from empty cells, then select a null convention. QUOTE_NOTNULL can preserve quoted-empty versus unquoted-null under a shared Python-compatible contract; markers and typed sidecars remain alternatives with collision and compatibility rules.

4. **The proposed resource cap has the wrong unit and scope.** field_size_limit caps the current field's decoded character count. It does not cap bytes, total rows, or record memory. Upstream test text constructs a row with two 50,000-character fields and succeeds when the limit is 50,000. Use distinct byte, code-point, column, record, preview, row-count and staging limits; enforce physical-line and logical-record bounds before oversized inputs have accumulated.

5. **Some good controls need precise policies.** newline='' is correct for quoted newlines. Reader line_num counts source lines, not logical records. DictReader can expose ragged rows with restkey/restval, but its implementation skips blank rows and maps with dict(zip(...)), so duplicate header names collapse. Check duplicates before dictionary mapping; use unique sentinels and decide blank-row behavior.

6. **Atomicity and identity are requirements, not evidence of a storage guarantee.** Staging and late commit are appropriate, but “commit only after validation” alone does not prove the live database remains unchanged if commit partially fails. The backend is unspecified. Require a single rollback-capable transaction or atomic dataset swap, test late failure/cancellation, and identify the previewed bytes with a strong digest or immutable snapshot rather than only path metadata.

7. **The evidence status is appropriately limited.** The draft says upstream tests were inspected and no importer/vendor test ran; preserve that distinction. This review likewise did not execute the standard library behavior or importer. The target runtime is CPython 3.13.9 per the brief, while the cached source is at commit 8183fa5e3f78ca6ab862de7fb8b14f3d929421e0; their release-tag relationship was not verified. The source reader ran on Python 3.14.4.

## Recommendation

Use the final proposal's explicit text-preserving parse, confirmed header and dialect, three-state value model, correctly dimensioned resource budgets, and isolated staging. Treat all product guarantees—especially memory limits, snapshot consistency, and all-or-nothing commit—as implementation obligations for future tests against the actual CPython 3.13.9 build and storage backend.
