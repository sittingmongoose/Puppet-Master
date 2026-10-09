# ER11 research disposition — A-M10-A

## Comparison basis

This draft compares the full-discovery record and source map against the only plan revealed after the assignment gate: P1–P6 in revealed-plan.md. Discovery was saved before the reveal gate ran. No other plan-only file was read. The source IDs below resolve to source-map.json and notes under sources/.

Disposition labels are used exactly as categories: Correction, Optional enhancement, User decision, Already covered, Rejected, or Uncertain. This draft retains the research findings and alternatives beyond the six plan lines so they are available for a later design decision.

## Per-P disposition

### P1 — “Infer column types from the first 1,000 rows.”

**Disposition: Correction.**

A fixed first-1,000-row inference can miss rare values and later schema changes. It also risks converting identifiers, date strings, and source tokens before an analyst accepts the interpretation. The studied products use different defaults and controls: DuckDB documents a 20,480-row CSV sample, with different sampling behavior for seekable plain files versus gzip/stdin; Power Query uses a 200-row default for unstructured sources but offers full-file and Text choices. Neither sample size is universal evidence that a whole file conforms (S01, S22–S23).

Keep raw CSV fields as strings in the source layer. Present type inference as a suggestion and disclose whether it is based on a preview, a sample, or a full-file profile. Let users accept or override a proposed conversion. Keep leading-zero and long numeric-looking identifiers as text unless the analyst explicitly changes them. For compressed files, disclose beginning-only sample coverage if that path is used. A full-file scan is required before the UI claims full-file validity; if the product supports sample-only preview, its status must say that later rows remain unchecked.

**Condition / uncertainty:** The case does not specify a maximum file size or a latency budget, so this research cannot set the sample size or require a blocking full scan before every preview. The product owner should define the threshold for background/full profiling and export readiness.

**Discriminating validation:** Place a type-changing value, malformed row, and alternate date late in a file, beyond 1,000 rows and beyond the engine's default sample. Repeat in gzip input. Verify preview/sample scope is labeled, full-file findings include the late rows, raw strings are unchanged, and a sampled “valid” result is never reported as whole-file validation.

### P2 — “Parse date strings using the machine locale.”

**Disposition: Correction.**

Machine locale makes the same recipe produce different values on different analysts' computers. Power Query explicitly documents OS regional defaults and a “Using locale” conversion choice; OpenRefine documents UTC ISO-8601 normalization, while issue #6009 records disagreement about timezone-free date interpretation. A DuckDB discussion also reports a slash-separated date inference concern, without identifying an exact current version or a reproduction by this research (S10, S19, S21, S23).

Require an explicit date interpretation when conversion is applied: date pattern/culture and whether the source is date-only, local datetime, or offset-bearing instant. Store that choice in the recipe and output. Keep the source value visible beside the converted result and identify rows that do not match. Never attach a timezone to a date-only value merely because a library or product has a UTC normalization rule.

**Condition / uncertainty:** The supported locale catalog and policy for ambiguous dates are product decisions. The research does not establish one correct interpretation for 01/02/2025 or 1/27/2025 without source-specific context.

**Discriminating validation:** Convert ambiguous 01/02/2025 and 1/27/2025 plus ISO, DMY, mixed, invalid, date-only and offset-bearing examples under two different OS locales. With identical explicit recipe settings, outputs must match. Without an explicit format for an ambiguous value, require a visible ambiguity or failed-conversion result instead of a silent guess.

### P3 — “Convert missing values to null.”

**Disposition: User decision.**

“Missing” could mean an empty field, whitespace-only text, a configured token such as NA or NULL, a blank workbook cell, a formula that evaluates to an empty string, or a genuinely absent field. Collapsing these cases to null can destroy distinctions needed for audit and downstream work. DuckDB's Excel extension can type empty cells as DOUBLE and can replace failed cells with NULL when ignore_errors is used; Frictionless also documents schema coercion after stringification. Those defaults show why the source representation and schema interpretation must remain separate (S03, S28).

Recommended behavior is to preserve the raw representation and make null-token mapping an explicit, ordered transformation in the recipe. The analyst should be able to configure tokens and whether to trim before comparison. Keep empty, whitespace-only, and configured sentinel tokens distinct until the rule is approved. Retain the original value in the issue/audit record after mapping.

**Decision required:** Product owner must define defaults for empty cells, whitespace, common sentinels, absent columns, and formula results. The brief does not authorize choosing among these meanings.

**Discriminating validation:** Use a fixture containing empty CSV fields, empty quoted strings, spaces, tabs, literal NA/NULL/N/A, missing trailing fields, blank XLSX cells and formulas returning an empty string. Verify the preview preserves distinctions, the selected rule maps only its configured cases, and recipe replay applies the rule in the recorded order.

### P4 — “Keep failed rows in an error CSV.”

**Disposition: Correction.**

Retaining failed rows is necessary but an error CSV alone is not a sufficient canonical record. DuckDB's reject facility can report scanner settings, source positions, column, error type, original line and message; however it is off by default, temporary, can create several error entries for one source line, and projection can leave an unselected column unevaluated. Frictionless provides structured row/field/type/message errors but documents a default cap of 1,000. A CSV export can be offered as a portable view, but it must not erase status, source identity, issue multiplicity, truncation, or not-evaluated state (S02, S24, S27).

Create a durable structured issue/reject record linked to an immutable source row identity and raw row. Distinguish structural parsing/decoding failures from semantic conversion failures. Record stable issue codes, field/cell, raw value, message, parser/settings version and logical source location. Multiple issues may attach to one row. Make caps and truncated reports explicit. Preserve rejected rows by default; do not make ignore_errors the default. Mark columns or rows the chosen operation did not inspect as “not evaluated.”

**Condition / uncertainty:** Decide whether export may proceed with unresolved rejected rows and whether analysts can edit/correct raw rejects in place or only through explicit transformation steps. The brief does not specify that workflow.

**Discriminating validation:** Combine uneven-width rows, quote/decode errors, conversion failures, multiple errors in one row and an error in a projected-away column. Restart the application and confirm issues and raw rows persist, issue multiplicity and logical row identity remain stable, unevaluated data is not marked passed, and any report cap is surfaced.

### P5 — “Save transformation settings.”

**Disposition: Correction.**

The intent is sound but the statement is too broad to support reliable monthly replay. OpenRefine demonstrates JSON-replayable operation history with some coverage limits; Power Query's locale behavior shows that an implicit workstation setting can alter results. Frictionless demonstrates structured validation controls and an error cap. These products support recording operation history and exposing boundaries; they do not define this app's complete recipe contract (S17–S19, S23, S26–S29).

Persist a versioned, inspectable recipe with application and reader versions; source fingerprint; CSV encoding, dialect and header handling; workbook sheet/range and chosen cell representation; selected columns; accepted type conversions; explicit locale/date and number formats; null, trim and whitespace rules; ordered operations; error policy; output types; and expected schema fingerprint. Provide a human-readable summary and machine-readable form. When replay sees drift, show a difference and wait for analyst approval before changing meaning. Do not silently apply a best-effort recipe.

**Condition / uncertainty:** Decide which operations are guaranteed replayable and how recipes migrate when the application changes. Until that contract exists, label unsupported or version-incompatible recipe steps and stop replay rather than dropping them.

**Discriminating validation:** Save and replay an import with explicit date locale, null rules, column selection and ordered transformations on a second monthly file. Change, rename, reorder, add and remove columns; vary one date format and null token. Confirm deterministic replay when schema matches and a clear diff/approval gate when it does not.

### P6 — “Compare output row counts with inputs.”

**Disposition: Correction.**

A count comparison is useful but does not establish correctness. Equal counts can hide changed values, duplicate substitutions, row swaps, or a rejected row replaced by another. Unequal counts may be valid after an explicit filter, deduplication or split operation. DuckDB reject behavior can report more than one error for a physical source line and CSV quoted records can span physical lines, so counts need a defined unit and staged accounting (S02, S12).

Track source logical records, accepted records, rejected records, explicitly excluded records and not-evaluated records by stage. For a pure import with no row-changing transformation, require an explainable accounting invariant: input logical records = accepted + rejected + explicitly excluded + not-evaluated records, with these row-level dispositions mutually exclusive; count issue records separately so multiple issues on one row do not inflate record totals. For operations that filter, split, or deduplicate, report input/output counts and the operation's effect separately. Compare stable row identities and issue sets, not only totals.

**Condition / uncertainty:** Define how duplicate headers, blank lines, invalid encodings, workbook blank rows and multi-row transformations contribute to the input record count.

**Discriminating validation:** Use a fixture with quoted multiline records, one structural reject, one conversion reject, one explicit filter and a one-to-many transformation. Verify counts reconcile at each stage and the report identifies each record's disposition; separately alter a value without changing counts and ensure a value-level validation catches it.

## Retained findings and alternatives

### Implementation paths

- **Native Rust readers:** csv 1.4.0 plus Calamine 0.36.1 fit the Rust/Slint direction and allow a product-owned source row, issue model and recipe. The CSV crate is a low-level parser, not a profiler or import assistant; the team owns inference, full-file profiling and diagnostics. Use ByteRecord or a stated decoding policy where non-UTF-8 is possible. Calamine exposes typed cells and Excel date epochs but this research has no memory or compatibility benchmark (S11–S16).
- **DuckDB-backed profiling:** offers CSV detection, SQL profiling, documented memory/temp-directory controls and an XLSX extension. Keep strings and source identity at the application boundary; copy temporary rejects into durable records. XLSX is supported, legacy XLS is not, and extension installation/offline packaging and spill behavior remain untested (S01–S06).
- **Hybrid Rust UI plus DuckDB for profiling:** may combine native workflow and efficient analytical queries. It is a candidate, not proven superior. An internal stable source/issue/recipe contract must prevent engine output from silently defining product semantics.
- **OpenRefine:** useful analyst workflow and recipe benchmark with local operation history; its Java/local-server model is not a native library dependency for this app (S17–S21).
- **Power Query:** incumbent benchmark for preview, locale, cell errors and profiling scope, not a reusable app component (S22–S25).
- **Frictionless:** useful schema-validation and structured-report precedent. Python runtime boundary and error cap need explicit handling; a sidecar/library or a Rust implementation of only selected rules are alternatives (S26–S29).
- **Custom XLSX/XML reader:** not justified by current evidence. Consider only if a required fidelity case fails with available readers and the maintenance cost is accepted.

### Excel source representation

An XLSX cell can have stored value, formatting, formula, cached result and an address/sheet. The case does not determine whether “original” means stored value, displayed text, formula plus cached result, or a retained combination. Choose this explicitly before implementation; expose it in preview and preserve enough information for later audit. Calamine's date conversion supports 1900/1904 epochs and millisecond precision without timezone. Do not imply a timezone or precision beyond source data (S03, S13–S16).

Legacy XLS, formula recalculation, strict OOXML and XLSB support also require a scope decision. Calamine v0.36.1 release notes include fixes to strict OOXML, empty XLS strings and XLSB parsing; this is a regression signal, not an independently verified defect in that release (S15).

### Issue and release trail

DuckDB #13043 reports gzip tab-separated CSV sniffer trouble on DuckDB 1.0.0; PR #13083 merged a correction on 2024-07-20; v1.1.0 lists the PR. v1.5.6 (2026-09-28) is the inspected current release context. Keep the older public reproduction as a regression candidate and run it against the pinned implementation before relying on the fix. This work did not reproduce it (S06–S09). The 2026 slash-date discussion has no exact build and was not independently reproduced (S10). OpenRefine #6009 captures a timezone expectation disagreement; inspected 3.10.0 notes did not identify a matching correction, which is not proof none exists (S20–S21).

### Product decisions and operating conditions

The case does not specify target OSes, minimum memory, maximum file size, latency target, full-file validation policy, or permitted formats. The owner must choose these before resource and release claims are made. Define encoding replacement/fallback, duplicate-header handling, null defaults, workbook stored/display/formula behavior, XLS scope, unresolved-row export policy, schema-drift blocking, and replay compatibility.

DuckDB documents an 80%-of-RAM default memory limit and disk spill for some intermediates, but not a guarantee for every query or disk condition. Measure peak RSS, temporary disk, latency, cancellation and cleanup on the minimum supported laptop with representative large inputs. Rust implementation alone does not establish memory performance (S04, S11, S16).

## Discriminating validation set

All items below are proposed, not executed. None is a test result or observed runtime witness.

1. **Raw fidelity:** leading-zero and 20+ digit identifiers, Unicode, empty versus quoted empty, whitespace and sentinel tokens; compare raw preview, converted output and replay.
2. **CSV structure:** comma/semicolon/tab, quotes/escapes, BOM, multiline records, preamble, uneven field widths, invalid encoding and the #13043 gzip/tab reproduction.
3. **Inference scope:** anomaly beyond first 1,000 rows, beyond DuckDB's default sample, and late in gzip; compare sampled with full-file results and require scope labels.
4. **Date reproducibility:** ambiguous and invalid DMY/MDY, slash, ISO, mixed, date-only and timezone-bearing values under different OS locales and explicit recipe locale.
5. **Reject audit:** structural and semantic errors, multiple errors on a row, projected-away error, persistence after restart, logical row identity, cap/truncation and not-evaluated status.
6. **Workbook fidelity:** first/named sheets, blank initial rows, text/numeric IDs, styled and text dates, 1900/1904 epochs, formula and cached values, formula errors, blank strings, strict OOXML, XLSB and XLS if in scope.
7. **Monthly replay:** unchanged file and controlled changes to column names/order, added/removed fields, date format and null token; verify recipe diff, operation ordering and approval gate.
8. **Resource and usability:** minimum hardware, representative large file, low disk/memory, cancellation, temporary-file cleanup, and analyst tasks for inspecting proposals, diagnosing rejects and replaying the next month.

For each future run, record environment, exact binary and dependency versions, input fixture hashes, expectations, actual result, and whether execution completed. Do not convert this proposal list into claims of successful validation.

## Evidence and limitations

The full discovery record is discovery.md; source-map.json is the source register and per-source provenance; source notes are under sources/. Public sources were read with browser search/open/find only. No local example file, package, installer or executable was processed. Product builds, runtime behavior, performance, offline first-use, UI usability and all proposed validations remain unverified. usage_billing_observed remains null because no trustworthy usage/billing observation was made.

