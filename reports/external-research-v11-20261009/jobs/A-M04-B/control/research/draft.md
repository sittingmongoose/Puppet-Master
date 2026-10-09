# S10 data-import — complete draft (post-reveal planning deliverable)

Block A-M04-B / arm control / stage research / case S10 / method M04 v1
(amendment-preservation: fresh reviser rewrites complete final after critique,
preserving supported findings — this draft is the complete deliverable later
stages may correct).
Brief: `cases/S10/brief.md` (frozen sha256
`17322e03cfaa4aad42ef991cbf666e5ca646cca2439f71b748c8642761ccbbf2`).
Discovery: `discovery.md` frozen BEFORE reveal (sha256
`4e514241aee4a4fa133f281ece91ca2399338c9778aeca65343f1a46e9347df7`,
30093 bytes); reveal receipt `plan-reveal.json` at 2026-10-09T19:31:27Z;
plan sha256 `3f5acb86924c2981486d394c7e57a6578fdafd05ad7345800fda856c84dbf6bf`.
Discovery was NOT rewritten after reveal.

This file is self-contained: every retained finding is stated in prose.
`[Snn]` IDs supplement (see `source-map.json`, `sources/index.md`) but no
section is replaced by an ID. Obligations O1–O6 from the brief govern equally.

Product: desktop import assistant for nonprofit analysts. Inputs: large CSVs,
occasional Excel workbooks, inconsistent dates/identifiers. Must: preview
inference, preserve original strings, explain rejected rows, replay the same
transformation next month, respect modest laptop memory.

---

## 1. O4 — Exact per-P disposition (every clause compared)

Disposition vocabulary: CORRECTION (plan text is wrong/incomplete and must
change), ALREADY-COVERED (discovery already requires the intent),
OPTIONAL ENHANCEMENT (beyond the brief's bar, shippable later),
USER DECISION (analyst must choose; no safe silent default), REJECTED
(considered and refused with reason), UNCERTAIN (evidence insufficient).

### P1 — Exact clause: "Infer column types from the first 1,000 rows."
**Disposition: CORRECTION + USER DECISION.**

Why the clause fails as written: a head-only 1,000-row window is an arbitrary
point between two documented engine defaults — Polars infers from 100 rows by
default, DuckDB from ~20,480 rows with multi-offset jumps on seekable files —
and head-only sampling is strictly weaker than multi-offset coverage. The
characteristic failure is the tail flip: a column numeric for thousands of rows
then carrying `1e5`/text, or quoting with embedded commas appearing late,
aborts a strict DuckDB read past row ~20k (issues #17599/#21000) and
parse-errors a Polars default-100 read at row 101. A 1,000-row head window keeps
all of that risk while looking diligent. Whole-file inference exists as an
escape (`sample_size=-1`, `infer_schema_length=None`) but costs ~2.2× a read on
100 MB CSV per statement (third-party measurement) and, for Polars, loads into
memory and is documented slow — so it cannot be the silent default either.

Correction (replaces P1): inference runs on a bounded, VISIBLE sample with
multi-offset coverage where the engine supports it; the preview shows the
window size, offsets, and the escape cost; the user confirms or widens (bounded
raise, e.g. 10k, or whole-file with cost warning); the confirmed window +
detected dialect/header/types become pinned replay metadata, not re-guessed
next month. Identifier-like columns (leading zeros, long numeric IDs, mixed
alphanumeric) default to String with a preview warning when numeric inference
would destroy information; numeric override is one click and persists.
`try_parse_dates`-style temporal guessing is per-column opt-in, never global.

User decisions inside P1: accept/widen the sample; confirm each inferred type,
especially identifier-vs-number and text-vs-date; opt into whole-file inference
knowing the cost. Uncertain (retained): the exact default window number awaits
S10-representative fixtures (V1/V2 below discriminate it); 1,000 is not
defended and not kept.

### P2 — Exact clause: "Parse date strings using the machine locale."
**Disposition: CORRECTION (blocking) + USER DECISION.**

Why the clause fails as written: machine locale makes replay nondeterministic.
The same transformation run on a US laptop vs a UK laptop parses `01/02/2024`
as Jan 2 vs Feb 1. Power Query's documented behavior is the warning and the
model: unpinned conversion follows the author's locale, so identical queries
yield different dates on different machines; the fix is explicit per-column
locale + format (`Change Type → Using Locale`, `DateTime.FromText` with
culture, `Table.TransformColumnTypes` record-based culture with `en-US`/`en-GB`
as of the May-2025 update). Excel adds a second trap P2 ignores entirely: the
1900-vs-1904 epoch. Serial 1 = 1900-01-01 in the 1900 system while the 1904
system anchors at 1904-01-01 (1462-day offset); the flag lives in
`<workbookPr date1904="1"/>`; modern Excel writes `<x15:workbookPr/>` in
`<extLst>`, which reset the flag in calamine (#706, −1462 days on every date;
fix #708). And the 1900 system contains the intentional Lotus-compat fiction
serial 60 = 1900-02-29 (Microsoft Learn, pinned commit), with pre-1900 dates
unrepresentable as serials and the calendar capped at 9999-12-31.

Correction (replaces P2): every date column pins locale + format + (for Excel)
epoch in the replay contract. Day/month ambiguity and detected 1904 epoch are
blocking preview questions with safe defaults (keep raw, quarantine ambiguous)
when the user defers. Machine locale may appear ONLY as a displayed, editable
default ("detected OS locale: en-GB — confirm per column"), never as pinned
truth. Raw strings (CSV) and raw serial + number-format code + rendered text
(Excel) persist alongside typed values; serial 60 and pre-1900 cells are
explicitly flagged.

User decisions inside P2: per-column locale/format; day-first vs month-first
where ambiguous; epoch confirmation for 1904-detected workbooks. Rejected:
machine-locale-as-truth; silent re-inference of locale on replay.

### P3 — Exact clause: "Convert missing values to null."
**Disposition: CORRECTION + USER DECISION.**

Why the clause fails as written: it does not say which strings count as
missing, and the answer is per-column. Empty fields, `N/A`, `NULL`, `-`,
`9999`, and zero are missing in some columns and meaningful data in others
(`N/A` as a survey answer, `NULL` as a donor ID, 0 as a gift count). The
governing mechanisms are per-column missing-value sets: Frictionless
`missingValues` in Table Schema, Polars `null_values` (including dict form) plus
explicit `empty_string_is_null`, applied AT SCAN so downstream stays strict.
A global "convert missing to null" also hides the empty-string question: CSV
`""` vs truly-absent are different facts an analyst may need to distinguish.

Correction (replaces P3): preview proposes per-column missing-value sets
(including the empty-string policy) from the sample + schema; the analyst
edits; the sets persist in the recipe; validation reports missing-vs-present
per field with rule IDs. Nothing missing-like is nulled without a declared set.

User decisions inside P3: the token set per column; empty-string-is-null per
column; whether `0`/sentinel numbers count as missing. Uncertain (retained):
no universal token list is proposed — it must come from the nonprofit's actual
files during pilot.

### P4 — Exact clause: "Keep failed rows in an error CSV."
**Disposition: ALREADY-COVERED (intent) + OPTIONAL ENHANCEMENT (substance).**

Agreement: discovery already requires quarantine-not-drop and explicitly
rejects `ignore_errors`-style silent row drops as a default, because lenient
reads can disagree with strict reads on row counts (projection pushdown masks
errors in unselected columns; strict vs lenient runs diverge). Keeping every
failed row with its reason is the brief's "understand rejected rows" bar, and
P4's intent matches it.

Enhancement (P4 as specified undershoots): a flat error CSV is one export view,
not the store. The quarantine record per row is: source row number, raw
line/cells, failing field(s), rule ID, expected type/format/constraint vs found
value, one-line human reason, and run ID linking to the manifest. The store is
queryable (embedded file-backed table), countable, and reversible (re-import
after fix); CSV export is offered from it. Accepted + quarantined row counts
must equal input rows (see P6). This enhancement is OPTIONAL only in the sense
that a v1 may ship CSV-first with the richer fields present as columns; the
quarantine semantics (nothing silently dropped, every reject explained) are
mandatory, not optional.

No user decision is required to keep rejects; user decisions enter in how
rejects are resolved (fix-and-requeue, accept-as-text, waive-with-reason).

### P5 — Exact clause: "Save transformation settings."
**Disposition: ALREADY-COVERED (intent) + CORRECTION (scope).**

Agreement: discovery already requires a versioned, portable replay contract —
it is the mechanism behind "repeat the same transformation next month,"
modelled on OpenRefine operation histories, Frictionless schema + pipeline
bundles, Power Query applied steps, and Tableau scheduled flows.

Correction: "settings" underspecifies what must be saved. The recipe pins:
CSV dialect (delimiter/quote/escape/header/skip rows per the CSV-Dialect-style
record), encoding + BOM, Excel epoch per workbook, field schema (types, formats,
constraints, missing-value sets, key declarations), per-column locale + format,
engine + component versions, inference sample windows, every user override, and
run manifests (counts, hashes, timestamps). Export → fresh profile → import →
rerun reproduces accepted/quarantine tables byte-identically except
run timestamps/input hashes (V9). Re-inference on replay is a USER DECISION
(opt-in "re-detect and diff"), never the default; month-2 schema drift (added
column, renamed header) surfaces as new-expected/extra-found with a remap
prompt (V8).

### P6 — Exact clause: "Compare output row counts with inputs."
**Disposition: ALREADY-COVERED (intent) + CORRECTION (substance).**

Agreement: row-count reconciliation is necessary and discovery requires
accepted + quarantined = input with per-run manifests.

Correction: counts alone are insufficient and would pass the worst silent
corruptions. A 1904-epoch misread preserves every row while shifting all dates
−1462 days; a locale flip preserves every row while swapping day/month; a
dialect misdetect can preserve row counts while scrambling columns. P6's check
must therefore be the first of a reconciliation suite: row counts (accepted,
quarantined, total), per-column type distribution + null rate, key-uniqueness
and required-field rates, date/numeric range checks, and manifest diff
(input hashes, pinned contract version, engine versions). Any suite failure
blocks silent replay and routes to preview diff, not to auto-accept.

---

## 2. Consolidated build plan (retained findings, self-contained)

### 2.1 Import flow (first run)
1. Connect: pick CSV(s)/workbook(s). Detect encoding on a bounded head window
   (UTF-8/UTF-16+BOM/Windows-1252/latin-1 candidates) with confidence shown;
   UTF-8-with-replacement is the honest last resort and is labelled as such.
2. Detect dialect + header on a bounded, multi-offset sample (CleverCSV-style
   scored search or engine sniffer on the sample — detector choice stays open
   per §5); show candidates + scores; user confirms. NEVER full-file dialect
   search by default (large-file crawl hazard).
3. Detect types on a visible sample window (multi-offset; default raised well
   above 100, exact number set by V1/V2 fixtures); identifiers default String;
   dates require per-column locale+format confirmation; Excel path surfaces
   epoch + serial + format code + rendered text per date column and flags
   serial-60/pre-1900/overflow cells.
4. Declare missing-value sets per column (proposed from sample, edited by
   analyst, persisted).
5. Preview: inferred contract + sample rows (raw vs typed side by side) +
   warnings (identifier-numeric, ambiguous dates, epoch, encoding confidence,
   late-sample risk) + cost-noted escapes (widen sample, whole-file scan).
6. Run: streaming validate-and-split into ACCEPTED (typed + raw) and
   QUARANTINE (raw + reasons) with a run manifest (contract version, engine
   versions, windows, counts, hashes). Progress-reporting full-file pass;
   strict by default; lenient re-read only as explicit, logged, reversible
   option.
7. Reconcile (P6 suite): counts + distributions + keys + ranges + manifest
   diff. Failures route to preview, not to silent accept.

### 2.2 Replay flow (next month)
1. Load recipe (P5 contract). Check input drift: added/renamed/missing columns,
   encoding/epoch changes, row-count anomalies.
2. Apply pinned contract WITHOUT re-inference (default). Report drift as
   new/extra/missing with remap prompts; quarantine drift-affected rows.
3. Optional, explicit "re-detect and diff": runs detection fresh and shows a
   contract diff for the analyst to accept field-by-field; never auto-applies.
4. Write accepted + quarantine + new manifest; V8/V9 govern acceptance.

### 2.3 Memory architecture (modest-laptop constraint)
- Row verbs (filter/select/rename/clean/validate/split) stream in constant
  memory (qsv-style); full-load verbs (sort/dedup/join/frequency) are marked
  heavy with batch/disk-backed paths and OOM prevention.
- SQL/sort/join/export spill through a file-backed embedded store
  (DuckDB-file + temp_directory paradigm); in-memory-only execution is
  prohibited for large runs (documented OOM control).
- Columnar shaping uses lazy plans with projection/predicate pushdown
  (scan-then-collect paradigm) with fewer-columns / chunked fallbacks.
- Whole-file inference is cost-warned and progress-reporting, never silent.

### 2.4 Preservation and auditability (non-negotiable)
- Dual columns: every typed field keeps its original string; Excel keeps raw
  serial + format code + rendered text + epoch.
- Run manifests persist per run and diff across months.
- Silent leniency is REJECTED as a default: every lenient path is explicit,
  counted, and reversible from quarantine.

---

## 3. Alternatives retained (not collapsed)

- Engine-per-verb: row-streaming vs columnar-lazy vs SQL-spill kept as an
  explicit per-operation choice. A single-engine plan is a REJECTED simplification.
- Declare-then-check (Frictionless-style schema + validation report + pipeline)
  vs guess-then-patch (sniffers): kept as complementary phases (infer once,
  freeze, replay declaratively).
- Dialect detectors: engine sniffers vs CleverCSV-style scored search vs 2024
  uniformity successors — UNRANKED pending fixtures (V2). All three remain live.
- Excel readers: calamine-style epoch-first readers preferred; openpyxl/
  LibreOffice styled-write path retained as an alternative for round-trip
  writes, not investigated as the read path.
- Commercial benchmarks (Power Query locale pinning, Tableau scheduled flows)
  retained as UX bars; Trifacta/EasyMorph/KNIME/Talent noted as
  evaluate-before-building, not deep-dived (evidence absent, honestly stated).

## 4. Optional capabilities vs user decisions (explicit split)

Optional capabilities (beyond the brief's bar; ship when cheap, never block v1):
E1 scheduled unattended reruns with success/last/next tracking; E2
near-duplicate clustering; E3 reconciliation against external ID services;
E4 richer quarantine store views (group-by-rule, fix-and-requeue);
E5 styled Excel round-trip write; E6 multi-file union/schema-merge preview.
P4's quarantine-table substance may phase as CSV-columns-first.

User decisions (no safe silent default; the UI MUST ask or show-and-confirm):
D1 sample-window accept/widen per import; D2 per-column type confirm
(esp. identifier-vs-number); D3 per-column locale + date format + day/month
where ambiguous; D4 per-column missing-value sets + empty-string policy;
D5 epoch confirmation for 1904-detected workbooks; D6 drift remap on replay
(rename/new/missing columns); D7 opt-in to re-detect-and-diff; D8 opt-in to
any lenient re-read; D9 waive-with-reason for quarantined rows.

## 5. Uncertainty and disagreement (retained, not smoothed)

- U1 best dialect detector unranked (V2 discriminates).
- U2 exact default inference-window numbers unpinned (V1/V2 discriminate).
- U3 calamine #708 release vehicle unconfirmed (observed as PR; re-check before
  pinning an Excel-reader version).
- U4 commercial internals benchmarked on docs/UX only; no traced code fix
  claimed for OpenRefine replay, Frictionless codes, or Prep/M engines.
- U5 laptop floor unknown (4 GB? 8 GB?); streaming-first design makes the exact
  floor less decisive, but V7 must run at the stated floor before release.
- U6 universal missing-token list deliberately not proposed (U-panel in P3).
- Disagreement retained: this draft disagrees with any thin-plan reading that
  P1/P2/P3 are acceptable as one-line behaviors; the corrections above stand
  even if they enlarge scope, because the one-liners corrupt data silently.

---

## 6. O6 — Validations: executed vs proposed (honestly separated)

### 6.1 EXECUTED in this research pass (read-only observations; no runtime)
- E-read-1: fetched DuckDB `/stable/` (119-byte redirect notice) and
  `/current/` CSV auto-detection page (truncated render; full bytes in harness
  output) 2026-10-09T19:27:40Z — observed dialect/type/header detection,
  per-option override, sniff_csv parameter parity.
- E-read-2: fetched Polars `read_csv` stable reference (truncated render)
  2026-10-09T19:27:45Z + Rust `csv.rs` doc text via search — observed
  separator/quote/schema/null/date knobs and the 100-row default / None / 0
  semantics.
- E-read-3: fetched Frictionless Table Schema v1 (70938 bytes)
  2026-10-09T19:27:35Z — observed descriptor/field/constraint/missing/key model
  + CSV-Dialect/Data-Package relations; plus PyPI frictionless 3.27.0 usage.
- E-read-4: fetched OpenRefine manual index (23058 bytes)
  2026-10-09T19:27:38Z (page last-updated 2022-12-29) — observed
  install/run/import/explore/transform/reconcile/export spine.
- E-read-5: fetched Microsoft 1900-leap-year article (4750 bytes, pinned commit
  15b7b561, ms.date 2026-03-30) 2026-10-09T19:27:33Z — observed Lotus origin,
  compat rationale, correction consequences.
- E-read-6: searched + (for #706) fetched calamine epoch chain (#706 page
  436919 bytes w/ chrome; #630/#708/qsv-#3905/docs.rs via snippets/API text)
  2026-10-09T19:28:10Z — observed x15 reset root cause, −1462-day effect,
  has_1904_epoch API, metadata surfacing.
- E-read-7: searched DuckDB sampling issues (#6011/#17599/#21000/#14097,
  webbed #102/v2.3.0) + tallyman/skill research notes 2026-10-09T19:28:05Z —
  observed sampling defaults, recovery pattern, ignore_errors trap, spill-vs-OOM.
- E-read-8: searched qsv/CleverCSV/Power Query/Prep evidence 2026-10-09T19:28:02Z–
  19:28:16Z — observed streaming claims, 97%/94.59%-vs-100% benchmarks, FEC-scale
  crawl limit, locale/culture pinning, scheduled-flow UX.
- No parser, sniffer, engine, or fixture was executed. No witness ran (no
  qualified sandbox claimed). Usage/billing: unobserved (null/UNKNOWN).

### 6.2 PROPOSED discriminating validations (none executed; build/run next)
Each maps to its P disposition and states pass/fail crisply.

- V1 tail-type flip → P1. 30k-row CSV, column numeric 25k rows then `1e5`/text.
  PASS: default-window run quarantines the flip row with rule ID (no crash, no
  silent mistype); widened/pinned rerun types correctly. FAIL: abort, silent
  mistype, or silent drop.
- V2 late-quote dialect break → P1. Quoting with embedded commas first at row
  25k. PASS: preview flags dialect uncertainty with candidates/scores; confirmed
  dialect parses all rows. FAIL: silent column scramble.
- V3 1904-epoch modern-Excel file → P2/O3-primary. 1904-system xlsx saved by
  Excel 2013+ (contains `<x15:workbookPr/>`). PASS: epoch shown as 1904, dates
  day-correct, raw serials preserved. FAIL: −1462-day shift (the #706 symptom).
- V4 serial-60 + pre-1900 + overflow → P2. Cells: serial 60, 1899-12-31 text,
  9999-12-31, 10000-01-01. PASS: serial 60 flagged fictitious; pre-1900 kept
  text+ISO; overflow rejected with reason. FAIL: any silent wrong date.
- V5 locale trap → P2/P3. `01/02/2024` under pinned `en-US` vs `en-GB` + ID
  column `00123`/long IDs. PASS: US→Jan 2, GB→Feb 1, both explicit; IDs stay
  text with raw kept; unpinned run quarantines ambiguous dates. FAIL: any silent
  locale guess.
- V6 encoding + BOM matrix → §2.1. UTF-8/UTF-8-BOM/UTF-16/Windows-1252 variants.
  PASS: correct detection + preview note each time; mojibake quarantined.
  FAIL: silent mojibake kept as data.
- V7 memory honesty → laptop constraint. 2 GB-class CSV at the stated laptop
  floor. PASS: streaming verbs flat; heavy verbs spill with progress; OOM only
  in the deliberate `:memory:`-only control. FAIL: OOM on the designed path.
- V8 month-2 replay with drift → P5/P6. Same recipe + new file (one added, one
  renamed column). PASS: pinned contract applied; added→new (typed+raw, confirm);
  renamed→missing-expected/extra-found + remap; no silent re-inference.
  FAIL: silent re-inference or silent column drop.
- V9 recipe round-trip → P5. Export → fresh profile → import → rerun.
  PASS: byte-identical accepted/quarantine tables + manifest match except
  run timestamps/input hashes. FAIL: any divergence.
- V10 quarantine comprehension → P4/brief bar. Five seeded rejects shown to a
  pilot analyst. PASS: each reason understood without docs. FAIL: any
  "what does this mean?" reject.

---

## 7. Close-out and handoff

- O1 met: unfamiliar tools/products/approaches discovered from the brief alone
  (OpenRefine recipes, Frictionless contracts, qsv/DuckDB/Polars engines,
  CleverCSV + successor, calamine epoch handling, Power Query/Prep benchmarks).
- O2 met: consequential defaults/limits recorded with governing numbers
  (DuckDB 20480 + `-1`, Polars 100 + None/0 + files-10, Excel serial-60/1462/
  pre-1900/9999 caps, locale/culture pinning, missing-value sets, spill-vs-OOM).
- O3 met: primary calamine epoch chain (#629→#630→#706→#708 + qsv #3905),
  secondary DuckDB sampling chain, tertiary Polars window evolution; absent
  evidence (commercial internals, S10-owned prior releases) explicitly stated.
- O4 met: all six exact P clauses disposed above (correction / already-covered /
  optional enhancement / user decision / rejected / uncertain distinguished).
- O5 met: this file is the one self-contained coherent final; alternatives,
  conditions, constraints, disagreement, and uncertainty retained in prose.
- O6 met: executed read-only checks separated from ten proposed discriminating
  validations; no runtime claimed.
- Later stages may correct this draft (M04 amendment-preservation); any
  amendment must preserve the supported findings above or show the evidence
  that overturns them.
