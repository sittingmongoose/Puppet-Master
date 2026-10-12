# Complementary breadth critique — C-P03 import component

Run: C-R2-P01-treatment  
Stage: critic-breadth  
Review basis: the full frozen investigator package, released plan, original brief, source index and source identity map. No implementation or synthetic test was run by this critic.

## Overall assessment

The draft is unusually complete for a planning proposal. It gives a disposition for every clause of the released plan, maps each original brief obligation, keeps parser and storage choices open, compares four overlap mechanisms, and distinguishes research from proposed validation. The source set spans parser behavior, CSV conventions, explicit metadata, dates, units, observation semantics, database transactions, conflicts and failure history. I found no reason to reverse its central safe-import boundary.

Two breadth gaps need explicit treatment in the reviser’s complete pass. The first is source-scope completeness when a revised file omits rows. The second is numeric interpretation beyond unit conversion. Both matter to the brief’s revised/partial-file, spreadsheet-editing and “what will change” requirements.

## Findings

### CB-01 — High: absence from a revised file has no defined meaning

The draft handles rows found in a new file well: exact replay, same-key change, nearby candidate, ambiguity and new observation each have separate dispositions. It also rejects filename identity and destructive replacement. It does not define what a row absent from a later file means for an earlier accepted observation. In particular, the brief explicitly includes partly overlapping, truncated and revised files, and asks volunteers to understand whether an earlier import is replaced, supplemented or left intact.

An absent row can mean deletion in a genuinely complete snapshot, an export-window change, an incremental logger export, a filtered spreadsheet, a truncation, or simply that the new file overlaps a different interval. The current proposal risks leaving that crucial decision implicit even though its default is conservative.

**Add a source-completeness mechanism:** let a versioned logger/import profile declare whether the input is append-only, a partial/overlapping extract, or a complete snapshot, and record the snapshot’s explicit scope (for example deployment and time/interval bounds). Treat absence as “not present in this file” by default. Only a user-confirmed complete snapshot with a declared matching scope may produce “no longer present” candidates; show the affected prior rows and source lineage, and require an explicit, auditable decision before changing the active view. A truncated or scope-mismatched file must never imply removals. Retain all prior accepted observations.

Add proposed cases for: a complete corrected snapshot with one removed row; a partial overlapping export with the same omission; a truncated snapshot; changed time bounds; and a same-name file whose digest changed. Record that these are proposals until executed. This is a disposition and scope gap, not a claim that such logger exports are known to be snapshots.

Relevant passages: released-plan paragraphs 2–4; draft “Clause 2,” “Clause 3,” “Original brief coverage,” and “Owner decisions.” Relevant source vocabulary includes OGC’s contextual observation fields [S18](../investigator/sources/README.md#s18); the necessary completeness policy remains an owner/input contract rather than something that standard supplies.

### CB-02 — Medium: numeric parsing semantics need their own profile fields

The proposal covers unit labels and conversions carefully, and it proposes checking inconsistent number formats, but it does not spell out the lexical-to-number rules that are independent of units. Spreadsheet-edited delimited data may use a decimal comma, grouping separators, exponent notation, locale-specific signs, leading zeros, or precision that a binary floating-point conversion cannot preserve. A delimiter/profile choice does not by itself resolve those choices.

Bind numeric grammar and representation per column/profile: decimal and grouping separators, accepted sign/exponent forms, whitespace policy, integer-versus-measurement role, overflow/non-finite handling, and precision/rounding. Preserve the raw cell text and make any normalized value/formula visible. Treat logger IDs and other identifiers as text unless their domain contract says otherwise. Add proposed cases for decimal-comma versus delimiter ambiguity, grouped digits, leading-zero IDs, values beyond the chosen integer range, exponent extremes, and precision-sensitive values. Keep unit conversion as a later explicit step; never let it repair an uncertain numeric parse.

This augments the draft’s full-file validation and owner questions. It does not pick a locale or assert any logger uses these forms.

### CB-03 — Low: tie durability claims to the selected journal/platform contract

The draft correctly warns that one transaction is not by itself proof of every crash or power-loss guarantee, and it proposes process/crash and corruption tests. Its SQLite WAL version note is conditional and appropriately specific. A small strengthening is to require that validation and user-facing guarantees name the pinned SQLite build, journal mode, synchronous setting, and supported filesystem/platform combination. SQLite’s official atomic-commit description is expressly about rollback mode, says WAL uses another mechanism, and states storage/flush assumptions [S21](sources/README.md#s21). The draft already says to check actual journal/synchronous settings and local filesystem behavior, so this is a precision addition rather than a new blocking defect.

## Coverage and source breadth

- **Incremental parse and late failures:** addressed with streaming, raw rows, record/byte locations, EOF validation and no apply before successful validation. Rust csv documentation also distinguishes recoverable record errors from parser success as a general validity guarantee [S01](../investigator/sources/README.md#s01), [S02](../investigator/sources/README.md#s02), [S20](../investigator/sources/README.md#s20).
- **Schema, headers, nulls and formats:** addressed through visible profiles, confirmation, contradictions, per-column markers, and no inferred authority. RFC 4180 is treated as a common informational profile; CSVW is used as vocabulary, not as logger truth [S04](../investigator/sources/README.md#s04), [S05](../investigator/sources/README.md#s05). DuckDB sampling, failure/skip controls, and versioned issue reports are used with appropriately narrow caveats [S06](../investigator/sources/README.md#s06), [S07](../investigator/sources/README.md#s07), [S08](../investigator/sources/README.md#s08), [S09](../investigator/sources/README.md#s09).
- **Overlap and revision:** exceeds the minimum two strategies: stable scoped event ID, semantic key, exact-content fingerprint and tolerance-ranked candidates. Each has a failure mode, and changed values are not automatic replacements.
- **Timezone and units:** retains source values and requires explicit interpretation for unknown offsets, folds/gaps and unknown/incompatible units [S16](../investigator/sources/README.md#s16), [S17](../investigator/sources/README.md#s17), [S19](../investigator/sources/README.md#s19). Numeric grammar is the independent gap described in CB-02.
- **Preview, lineage and local transaction:** stages outside accepted storage, binds the preview to source/database state, pages changes, applies with an outer transaction, and preserves revisions. SQLite conflict algorithms/savepoints/WAL and DuckDB transaction/concurrency behavior are compared with conditional claims [S10](../investigator/sources/README.md#s10), [S11](../investigator/sources/README.md#s11), [S12](../investigator/sources/README.md#s12), [S13](../investigator/sources/README.md#s13), [S14](../investigator/sources/README.md#s14), [S15](../investigator/sources/README.md#s15).
- **Tests/evidence:** the proposed matrix reaches late malformed data, changed units, ambiguity, cancellation, interruption, disk pressure and corruption. The draft explicitly claims no parser/storage tests or benchmarks were executed; the critic ran no application test.

## Guidance to the reviser

Preserve the existing clause-by-clause dispositions and all source IDs. Resolve CB-01 and CB-02 in the complete revised output and their validation proposals. Keep CB-03 as a precision note; do not broaden it into a claim that SQLite is unsafe. State unknown logger completeness and numeric conventions as owner/profile decisions. Do not select a winning parser or database, silently infer removals or numeric grammar, or report proposed checks as executed.
