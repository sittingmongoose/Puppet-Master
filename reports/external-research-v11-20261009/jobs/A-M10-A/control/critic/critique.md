# ER11 scientific critique — A-M10-A/control/critic

## Scope and method

I reviewed the complete own-arm research draft, discovery, source map, and revealed P1–P6 plan, plus the S10 brief and every note in the declared research source root. I then checked the consequential product and implementation claims against public primary documentation and versioned repository records. The reviewed source IDs in this critique are C01–C16 in source-map.json; concise observations and limitations are indexed in sources/README.md and sources/primary-checks.md.

No parent, counterpart, evaluator, campaign-history, or unrelated experiment material was read. Browser use was read-only. No product, package, local dataset, benchmark, or validation fixture was run. There is no executed runtime witness, and no usage or billing observation. Recommendations below are critique only; they do not replace or repair the research draft.

## Overall assessment

The draft is broad, careful about most version and measurement limits, and substantially answers the brief. Its candidate paths are genuinely different (native Rust readers, DuckDB, a hybrid, and product or validation precedents); it supplies an issue-to-PR-to-release trail; it compares every P clause; and it marks its validation set as proposed. No new evidence justifies silently changing the user’s null, date, workbook, export, or memory policy.

The main concern is disposition calibration. Several thin but useful plan clauses are called Corrections even when the evidence supports keeping the clause and adding conditions or stronger optional checks. The draft should distinguish a wrong behavior from a behavior that is valid but incomplete. Two further claims need tighter units: P6’s mutually exclusive row accounting and P4’s stable logical identity for structurally unparseable input.

## Material findings

### M1 — Reclassify under-specification separately from an incorrect plan clause

The required categories include Optional enhancement and Already covered, but the draft labels P1, P4, P5, and P6 Correction based largely on risks that arise if the short clause is treated as a complete specification. The clauses themselves do not say to mutate data silently, discard diagnostics, promise exact replay, or treat row counts as proof of correctness.

- **P1 — “Infer column types from the first 1,000 rows.”** Keep the warning that a sample can miss later values. However, a fixed sample can be a legitimate preview tradeoff for a modest-memory desktop tool. Power Query itself documents sampled inference alongside entire-file and text-only choices; DuckDB’s current documentation uses a different default and different sampling for seekable and non-seekable inputs (C01, C04–C06). Recommend **Optional enhancement**, with a conditional **Correction** only if the sampled type is silently treated as whole-file truth or applied destructively. Keep the draft’s scope label and raw-value preservation recommendations. Do not require a full scan before ordinary preview; require it only before a whole-file claim.
- **P2 — “Parse date strings using the machine locale.”** The portability objection stands, conditionally. An OS locale is a valid chosen rule if the recipe records that exact locale and replay honors it. The defect is an implicit, unrecorded environment default. Keep **Correction** for implicit defaulting, and say so directly. The existing explicit-locale cross-OS validation is useful; 1/27/2025 is a useful MDY discriminator but is not itself ambiguous between MDY and DMY.
- **P3 — “Convert missing values to null.”** **User decision** remains correct. The source evidence supports preserving distinctions until policy is chosen, but it cannot choose the nonprofit’s null-token semantics.
- **P4 — “Keep failed rows in an error CSV.”** Retaining rejects is necessary and already matches the brief. A sufficiently specified CSV (for example, one row per issue, linked to source identity and raw value, with an explicit truncation state) can itself be durable and machine-readable; the brief does not require a separate issue database or in-memory audit model. DuckDB’s temporary reject tables describe an engine boundary, not a product requirement (C02). Recommend **Optional enhancement** for structured metadata, multiple issues, and completeness indicators. Use **Correction** only where the actual export loses rejected data or cannot explain its errors. A CSV should remain an acceptable delivery format.
- **P5 — “Save transformation settings.”** The core clause directly supports the monthly-repeat requirement. Versioning, explicit locale, operation order, drift review, and unsupported-operation handling are valuable **Optional enhancements**. Make a **Correction** only if a supposedly replayable recipe omits a setting that changes results or silently drops an operation. Separate a per-import source fingerprint from recipe compatibility checks: each month’s source is expected to differ, so a new file hash should identify/audit that run, not by itself block a replay whose schema and recorded assumptions remain compatible.
- **P6 — “Compare output row counts with inputs.”** This is a useful but limited integrity check. The plan does not claim counts prove value correctness. Recommend **Optional enhancement** for disposition reconciliation and stable identities; call it **Correction** only if counts are presented as sufficient proof or lack a defined population/stage.

This reclassification preserves the draft’s substantive safeguards while avoiding the inference that every omitted implementation detail makes the thin plan wrong.

### M2 — Define P6 accounting at a single unit and stage

The draft proposes input logical records = accepted + rejected + explicitly excluded + not-evaluated records, with row-level dispositions mutually exclusive. That invariant is sound only when all four terms refer to the same input population, processing stage, and whole-record disposition. The draft also correctly notes that projection may leave columns unevaluated. In that case a row can be emitted as accepted while one or more fields were not inspected; a row-level “not evaluated” bucket overlaps with accepted output. Transformations that split, duplicate, or aggregate records also change the counting unit.

Retain staged accounting, but specify:
1. the population and identity unit being counted at each stage;
2. mutually exclusive whole-record outcomes only where such outcomes are actually exclusive; and
3. field/column evaluation coverage and issue counts as separate measures.

For a pure, no-row-changing parse stage, the proposed reconciliation can be used after defining parser treatment of blanks and malformed encodings. For projected or transformed stages, report input/output and operation effects instead of forcing all states into one partition. DuckDB’s primary docs explicitly demonstrate that projection pushdown can avoid evaluating an unselected typed column (C02).

### M3 — Make stable logical row identity conditional on framing

P4 and its validation proposal imply that every malformed CSV record can be retained and assigned a stable logical row identity. A byte offset and parser-reported line are useful evidence, but a broken quote or invalid encoding can make record boundaries uncertain; physical lines also differ from logical CSV records when quoted newlines are valid. Engine reject locations do not establish a product-level, durable logical identity by themselves (C02, C16).

Keep source fingerprint plus logical ordinal where the parser has established record boundaries. Add an explicit “framing uncertain” or equivalent outcome when it cannot resynchronize reliably; retain the byte span/physical location and raw evidence available, and do not claim later-record IDs are stable if boundary recovery is ambiguous. Extend the proposed validation with a broken-quote record followed by a known sentinel record, and an invalid-encoding case. The expected result should allow a documented unresolved suffix rather than demand a false exact row mapping.

### M4 — Treat the Frictionless 1,000-error default as unverified/version-specific

The draft and discovery state that Frictionless has a default error cap of 1,000. The current public validation guide I inspected documents the optional limit_errors control and shows an explicitly configured limit of 1; the inspected section does not establish a default of 1,000 (C10). The source register links mutable current docs and a release context, but this access did not independently confirm that exact default in v5.20.0 code or tagged documentation.

Retain the general recommendation to expose any configured cap and truncation. Mark the number as **Uncertain** until checked against the exact pinned Frictionless version, or omit the default number from conclusions. This is an evidence gap, not proof that 1,000 is false.

### M5 — Gate the broad validation catalogue by selected product scope

The validation ideas are generally discriminating, but the entire list should not read as one mandatory first-release acceptance suite. XLS, XLSB, strict OOXML, formula recalculation, one-to-many transforms, nearly full disks, and broad usability/resource exercises depend on format, transformation, and platform decisions absent from the brief. The draft usually marks these as “if in scope”; preserve that condition in the summary and test plan. Separate a small baseline for the stated CSV/XLSX/monthly-replay workflow from conditional compatibility and stress cases after supported formats, target OS, file sizes, and memory floor are selected. No numerical performance threshold can be inferred from “modest laptop memory,” and none was measured.

## P-by-P evidence adjudication

| Plan clause | Critique disposition | Finding |
|---|---|---|
| P1: infer from first 1,000 rows | **Optional enhancement**; conditional correction if treated as full-file truth | Sampled inference is a valid preview mechanism. Label its scope, preserve original data, and separate proposal from conversion. Do not call the sample size universally unsafe. |
| P2: use machine locale | **Correction**, limited to an implicit/unrecorded default | Persisting a chosen machine locale can be deterministic. An invisible OS default is not a portable recipe rule. Date-only values, local datetimes, and offset-bearing instants need distinct semantics. |
| P3: convert missing values to null | **User decision** | Correctly identified. Empty, whitespace, sentinels, absent fields, workbook blanks, and formula results need a chosen policy. |
| P4: keep failed rows in error CSV | **Optional enhancement**; correction if the report is lossy | The CSV format is not inherently inadequate. Require enough schema and linkage to understand rejects, and disclose limits. A second internal issue store is an implementation option. |
| P5: save transformation settings | **Optional enhancement**; correction if replay determinants are omitted | The clause meets the basic monthly-repeat intent. Specify replay-critical settings and drift behavior without making a changed monthly file hash itself an error. |
| P6: compare output and input row counts | **Optional enhancement**; correction if treated as a correctness proof | Count comparison is valid but weak. Define count population/stage and supplement with values/issues; correct the overlapping row-versus-field accounting described in M2. |

The source/fix/release chain, DuckDB sample differences, locale risks, Excel representation caveats, and Calamine maintenance signal are supported by the inspected primary materials (C01–C09, C11–C16). The draft is appropriately cautious about not treating old reports or release notes as current defects. Its hybrid and custom-reader alternatives are framed as candidates rather than measured winners; preserve that qualification.

## Minor wording and evidence refinements

- Clarify that “original strings” for CSV means either decoded field values under a recorded encoding policy or preserved source bytes/record spans. The Rust CSV crate explicitly provides ByteRecord for raw, potentially non-UTF-8 records; StringRecord is not byte-preserving (C16). The draft already mentions ByteRecord, so this is a linkage/wording improvement.
- Keep “1/27/2025” as an MDY-only test value, not an ambiguous date. Pair it with a genuinely ambiguous value such as 01/02/2025.
- DuckDB /current/ documentation is a mutable 1.5-current alias. The draft states this and says to verify exact dependency behavior; preserve that condition.
- Calamine 0.36.1 release notes confirm specific fixes, including strict OOXML, empty XLS strings, and XLSB parsing; they do not establish a current defect or performance property (C14). The draft’s stated limit is appropriate.
- OpenRefine’s manual supports operation history extraction/reapplication but says some operations cannot be extracted; issue #6009 records user disagreement, not a normative timezone rule (C07–C09). The draft handles those limits appropriately.
- The Frictionless report examples demonstrate structured row/field errors and a configurable limit, which supports the report-design comparison. They do not alone show the default limit or prove that a separate application-side durable store is required (C10).

## Validation applicability and execution status

The existing validation proposals remain **proposed; none was executed**. Retain late anomalies beyond both sample windows, cross-locale replay, null distinctions, error multiplicity/truncation, workbook representation, schema drift, and measured memory/disk/cancellation checks. Add the malformed-record resynchronization probe from M3 and scope each conditional format/transformation case to an explicit product decision. Treat user observations and performance measurement as future empirical work with target hardware and thresholds selected first.

No required artifact from this critique authorizes a runtime test, dependency installation, or product implementation. Those are not claimed here.
