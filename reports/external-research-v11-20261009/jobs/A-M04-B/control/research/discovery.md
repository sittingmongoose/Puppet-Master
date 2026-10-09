# S10 data-import — independent discovery (pre-reveal)

Block A-M04-B / arm control / stage research / case S10 / method M04 v1.
Brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S10/brief.md`
(sha256 `17322e03cfaa4aad42ef991cbf666e5ca646cca2439f71b748c8642761ccbbf2` per freeze.json).
Written from the brief alone. The case plan was NOT read before this file.
Obligations O1–O6 from the brief govern; O4 per-P comparison happens only in
`draft.md` after the declared reveal gate.

Scope restated from the brief: desktop import assistant for nonprofit analysts
combining large CSV files, occasional Excel workbooks, inconsistent
dates/identifiers; preview inference, preserve original strings, explain
rejected rows, repeat the same transformation next month; modest laptop memory;
investigate implementation tools, competing products, release/type/locale
behavior.

No runtime/sandbox was used. All checks below are proposed validations, not
executed runs, unless explicitly marked as observed page/code reads. Usage and
billing fields are unobserved (null / UNKNOWN).

Conventions: `[Snn]` are immutable source IDs defined in `source-map.json`.
No silent rebind: if a URL drifts, the ID keeps its recorded
URL/version/commit/locator/access timestamp. Mutable pages are marked drift-prone.
`-sources/` holds bounded excerpts; `sources/index.md` navigates them.

---

## 1. O1 — Unfamiliar tools, products, materially different approaches

### 1.1 What counts as unfamiliar here

The brief names no implementation. Anything beyond a thin "read CSV in Python,
read Excel, guess dates" plan is candidate discovery. I prioritized mechanisms
that change correctness, memory, repeatability, or auditability — not source counts.

### 1.2 Repeatable-recipe cleaners (closest product class)

**OpenRefine (open source, desktop-via-browser, Java) [S04].**
Load CSV/JSON/XML/Excel-ish inputs, explore with facets/filters/sorting, apply
column-wide transforms, cluster near-duplicates, reconcile against external
services, export. Every operation is recorded and can be extracted as a reusable
recipe and re-applied; transformations are transparent and reversible; original
data stays locally preserved. This directly matches "repeat the same
transformation next month" plus "understand rejected rows" (facets isolate the
failing slice). Memory: JVM heap preference; documented guidance treats the
memory limit as the scaling knob (large sorts/reconciliations spill or fail past
it). Applicability: strongest for analyst-driven, human-in-the-loop cleaning
with an audit trail; weakest as an embedded library (it is an app + HTTP API,
not a crate/pip import). Competing commercial analogues with the same
recipe/flow idea: Tableau Prep flows with scheduled reruns [S13], Power Query M
queries with applied steps and culture-aware type changes [S12][S14].

**Frictionless Data: Table Schema + Data Package + validation + pipelines [S03][S15].**
A declarative alternative to code-first cleaning: describe fields (name, type,
format, constraints, missingValues, primary/foreign keys) in JSON Table Schema
v1; bundle files + schemas as a Data Package; `validate` produces one unified
validation report; `transform`/`Pipeline`/`steps` express repeatable pipelines
(first transform then validate is an explicitly supported order [S15]).
CSV Dialect is its own spec (delimiter/quote/escape/header handling). This is
materially different from inference-first sniffing: declare-then-check rather
than guess-then-patch. Applicability: best for the "same transformation next
month" requirement where the contract can be versioned (schema + pipeline in
git); best for rejected-row explanations (per-row/field validation errors with
codes). Limitation: requires someone to author/maintain the schema; raw-string
preservation must be designed in (keep source column + typed column).

### 1.3 Streaming-first CSV engines for modest laptops

**qsv (Rust, xsv successor) [S09].** Most commands stream in constant memory and
handle arbitrarily large CSVs; commands that must load everything are marked
🤯 and get out-of-memory prevention, batch strategies, and `ext` disk-backed
variants. This is the honest laptop-memory story the brief asks for: default to
streaming verbs (slice/select/rename/clean/validate), isolate the few
memory-hungry verbs (sort/dedup/join/frequency) behind explicit spill/batch
paths. Applicability: candidate embedded engine or sidecar CLI for the large-CSV
path; also exposes workbook metadata including the Excel epoch flag (see §3).

**DuckDB in-process OLAP (`read_csv_auto`, Parquet-first spill) [S01][S06].**
`read_csv`/`read_csv_auto` plus `SUMMARIZE`/`DESCRIBE` gives preview + profile in
one engine; file-backed `.duckdb` + `temp_directory` spills sorts/joins/exports
past RAM while `:memory:` cannot spill and will OOM on GB-scale work [S06].
Material difference vs pandas-eager: SQL over files without loading everything,
with explicit CSV knobs (see §2). Desktop fit: embeddable (C/Python/Rust/WASM),
no server.

**Polars eager + lazy (`read_csv` vs `scan_csv`) [S02][S07].**
`read_csv` loads now; `scan_csv` builds a lazy plan (filter/select/projection
before `collect`), with larger `infer_schema_length` and `schema_overrides` as
correctness knobs and null/date handling at scan time. The documented large-file
guidance is explicit: if the process crashes on RAM, switch to `scan_csv`,
select fewer columns, or stream in chunks [S07]. Material difference:
columnar + predicate pushdown vs row-streaming (qsv) vs SQL-spill (DuckDB).

**CleverCSV (messy-dialect detection) [S10][S11].** Drop-in `csv`-module
replacement plus CLI that detects delimiter/quote/escape by row-length patterns
+ cell data-type consistency (normal forms, then data-consistency measure);
reported ~97% dialect accuracy with ~21-point gain on messy files vs the
standard sniffer [S10]. Material difference: dialect detection as a scored
search over candidate dialects rather than a head-sample heuristic. Limit: the
sniffer can slow to a crawl on large-ish files (e.g. FEC data) [S11] — so it
belongs on a bounded sample + user-confirmed preview, not on the full large-CSV
scan. A 2024 uniformity/type-inference method claims 99–100% on the same style
of benchmark vs CleverCSV 94.59% [S11], which keeps "best dialect detector" an
open choice rather than a settled pick.

### 1.4 Excel readers that respect epochs and formats

**calamine (Rust) + fastexcel/qsv-excel family [S08].**
calamine reads xls/xlsx/xlsb/ods, exposes `has_1904_epoch()` per workbook
(feature #629 → PR #630), models datetimes as `ExcelDateTime` serial + type +
epoch flag, and converts via `to_ymd_hms_milli()` handling both epochs and the
1900 leap-day quirk [S08]. qsv surfaces that flag in `--metadata` JSON so
consumers can tell which epoch anchored the dates [S08]. Material difference vs
"openpyxl and hope": epoch is first-class metadata, not an implicit 1900
assumption. Limits: Excel serials cannot represent pre-1900 dates as dates;
calendar caps at 9999-12-31; the displayed string lives in `styles.xml` number
formats while the cell stores a float — so preserve raw float + format code +
rendered string.

**openpyxl / LibreOffice path (noted, not primary).** Kept as an alternative for
styled round-trip writes; not investigated deeply because the brief centers on
import + inference + repeat, where calamine/qsv/DuckDB cover the read path with
clearer memory/epoch behavior. Recorded as an alternative, not a rejection.

### 1.5 Commercial / power-user analogues (behavioral benchmarks, not embeds)

**Power Query M (Excel/Power BI) [S12][S14].** Applied-steps query that replays
next month; `Change Type → Using Locale` / `DateTime.FromText` with locale and
the May-2025 `Table.TransformColumnTypes` record-based culture + missing-field
handling (`en-US` vs `en-GB`) are the governing locale mechanism for ambiguous
`01/02/2024`; default type conversion follows the author's locale, so the same
query can yield different dates on another machine [S12][S14]. Benchmark value:
per-column locale pinning + explicit missing-field policy is the bar for "repeat
the same transformation" across regions.

**Tableau Prep Builder/Conductor [S13].** Visual flow (connect → clean/shape →
union/join → output), automatic type detection on import, published flows rerun
on schedule via Conductor with success/last/next-run tracking. Benchmark value:
scheduled replay + flow-level data-freshness UX.

**Trifacta / EasyMorph / KNIME / Talend (surveyed, not deep-dived).**
Same flow/recipe family; noted as sales-led or heavyweight relative to a small
nonprofit desktop tool. Retained as "evaluate before building a fifth flow
editor" rather than investigated as embeds. No claim beyond existence and family
membership; evidence absent for their internals in this pass (stated per O3 rule).

### 1.6 Materially different architectures worth keeping

1. **Declare-then-check (Frictionless)** vs **guess-then-patch (sniffers).**
   Keep both: infer on first import, freeze the inferred contract as a schema +
   recipe, replay declaratively next month.
2. **Row-streaming (qsv)** vs **columnar-lazy (Polars)** vs **SQL-spill
   (DuckDB).** Keep the choice explicit per operation size; do not pick one
   engine for all verbs.
3. **Raw + typed dual columns.** Every typed field keeps its original string
   (and for Excel, the raw serial + number-format code). Rejected rows keep row
   number, raw line/cells, rule ID, and a one-line human reason. This is the
   only design that simultaneously satisfies "preserve original strings" and
   "understand rejected rows."
4. **Quarantine, not silent drop.** `ignore_errors`-style silent row drops are
   rejected as a default (DuckDB's own pitfall: projection pushdown can mask
   errors; strict vs lenient reads can disagree [S06]). Default: strict read →
   quarantine table + counts; lenient re-read only as an explicit, logged option.
5. **Local-first embedded store (DuckDB file / SQLite) as the replay log.**
   Import runs, inferred schemas, user overrides, and quarantine rows are
   queryable artifacts, not transient UI state.

---

## 2. O2 — Consequential code/default/type/limit/applicability behavior

All defaults below were observed in the cited primary pages/code refs during
this pass; page bodies are drift-prone where marked in `source-map.json`.

### 2.1 DuckDB CSV sniffer + read path [S01][S06]

- **What auto-detects:** dialect (delimiter, quoting rule, escape), per-column
  types, and header presence. Any option can be individually overridden; fixed
  options constrain what the sniffer still detects. `sniff_csv` accepts the same
  named parameters as `read_csv` (plus `force_match`); `auto_detect` must be
  true [S06].
- **Governing default — `sample_size = 20480`.** The sniffer samples ~20k rows
  (with multi-offset jumps on seekable files, not just the head). `sample_size=-1`
  scans the whole file. The single most common CSV bug is "type/dialect failed
  past the sample window": a bad or differently-typed value past row ~20k aborts
  a strict read; a quoted-comma field past the window can mis-detect quoting
  (issues #17599, #21000 [S06]). Mitigations in precedence order: widen sample
  (`-1`), pin `columns=`/`types=`, or set `all_varchar=1` and cast explicitly.
- **Lenient knobs and their trap:** `ignore_errors=true` drops erroring rows and
  returns the good ones — but projection pushdown means selecting a subset of
  columns can skip parsing (and therefore skip detecting) errors in unselected
  columns; strict and lenient runs can disagree on row counts (issue #19880
  cited in [S06]). `all_varchar`/`columns`/`nullstr`/`dateformat` are the
  deterministic alternatives.
- **Memory:** `memory_limit` + `temp_directory`; file-backed DB spills, `:memory:`
  does not. `SUMMARIZE SELECT * FROM 'f.csv'` is the cheap preview/profile
  primitive before committing to types.
- **Units/types:** CSV has no units; types are inferred (BOOLEAN/BIGINT/DOUBLE/
  DATE/TIMESTAMP/VARCHAR ladder with lowest-common-type demotion inside the
  sample). Dates/times parse under explicit `dateformat`/`timestampformat` when
  pinned; otherwise locale/format guessing applies — pin formats for replay.
- **Applicability to S10:** use as the preview + profile + spill engine; never
  as a silent truncator. Preview shows detected dialect/header/types + sample
  window size; replay pins every detected option explicitly.

### 2.2 Polars CSV inference + lazy execution [S02][S07]

- **Governing default — `infer_schema_length = 100` (`N_INFER_DEFAULT`).**
  Only 100 rows feed dtype inference by default. `None` scans the whole file
  (documented slow; loads into memory), `0` (or `infer_schema=False`) forces all
  `String`. Multi-file scans default `infer_schema_files=10` in v2 (was: all
  files) [S07]. Consequence: Polars is the most sample-fragile of the three
  engines out of the box — a type change at row 101 flips a column from `i64`
  to parse error (`could not parse '1e5' as dtype 'i64'`) unless the window was
  widened or the dtype pinned.
- **Scan-time correctness knobs:** `schema_overrides` (pin `zipcode: String`),
  `null_values` (map `N/A`, `NULL`, `""` to null at scan so downstream stays
  strict), `try_parse_dates` (ISO-like strings → temporal; default off — must be
  explicitly enabled), `raise_if_empty`, `comment_prefix`, `quote_char`,
  `separator`, `skip_rows/lines`. Dirty-data handling belongs at the scan, not
  as post-hoc casts.
- **Lazy vs eager:** `scan_csv` + `collect` (optionally streaming) with
  filter/select pushdown is the large-file path; `read_csv` is the small-file
  eager path. Documented OOM guidance: switch to `scan_csv`, fewer columns,
  chunked/streaming collect [S07].
- **Applicability to S10:** use `scan_csv` with an explicit, UI-visible
  `infer_schema_length` (default raised, e.g. 10k, with a "scan whole file"
  escape that warns about cost), `try_parse_dates` as a per-column opt-in, and
  `schema_overrides` persisted as the replay contract. Never rely on the bare
  100-row default for month-to-month replay.

### 2.3 Excel serial dates, epochs, and the 1900 leap-year bug [S05][S08]

- **1900 system (default):** serial 1 = 1900-01-01; serial 60 = fictitious
  1900-02-29 ( Lotus 1-2-3 compat; 1900 is not a leap year — divisible by 100,
  not 400). Every serial ≥61 is one greater than the true day count. Microsoft
  documents this as intentional and unfixable without breaking serial
  compatibility, weekday values, and existing sheets [S05]. Time is the
  fractional part. Displayed text is a `styles.xml` number-format code applied
  to the float — the file stores the float.
- **1904 system (old Mac default, still seen):** epoch 1904-01-01; every date is
  1462 days (4 years + 1 day) later in serial terms than the same calendar date
  in the 1900 system. The flag lives in `<workbookPr date1904="1"/>` (xlsx),
  equivalent flags in xls/xlsb; there is no ODS equivalent [S08].
- **Hard limits:** serials cannot represent dates before 1900-01-01 as dates
  (negative serials are not dates); calendar caps at 9999-12-31. Pre-1900
  nonprofit records (founding dates, archival donor data) MUST stay text +
  explicit ISO date, never Excel serial.
- **calamine behavior (observed API):** `has_1904_epoch()` on Xls/Xlsx/Xlsb;
  `ExcelDateTime::new(serial, type, is_1904)` + `to_ymd_hms_milli()` handling
  both epochs and the serial-60 quirk; serial 60 is refused/mapped rather than
  reported as 1 March by careful consumers [S08]. qsv exposes the flag in
  workbook `--metadata` JSON [S08].
- **Modern-Excel trap (issue #706, see §3):** current Excel writes
  `<x15:workbookPr/>` inside `<extLst>`; a naive parser lets it reset the
  already-read `date1904` flag to false, silently shifting every date 1462 days
  earlier. Any xlsx reader MUST be regression-tested against a 1904-system file
  saved by modern Excel, not just a hand-made fixture.
- **Applicability to S10:** import must surface epoch + serial + format code +
  rendered text per date column; preview must flag serial-60 and pre-1900 cells
  explicitly; replay pins epoch handling per workbook.

### 2.4 Locale-sensitive date/number parsing (the identifier/date trap) [S12][S14]

- **Power Query rule:** ambiguous `01/02/2024` resolves by explicit locale
  (`Change Type → Using Locale`, `DateTime.FromText(t, [Format=…, Culture=…])`,
  `Table.TransformColumnTypes` with record-based culture as of May 2025).
  Without an explicit culture, conversion follows the author's locale — the same
  query yields different dates on US vs UK machines [S12][S14]. Identifiers with
  leading zeros (`00123`), long numeric IDs (float rounding), and locale
  decimal separators (`,` vs `.`) fail the same way when inferred as numeric.
- **Design consequence:** the replay contract MUST pin per-column locale +
  format + type; identifiers default to String with preserved raw; numeric
  inference on identifier-like columns is a preview warning, not a default.
  Day-first vs month-first is a user decision surfaced in preview, never a
  silent default.

### 2.5 Delimiters, dialects, and encodings [S03][S10][S11]

- **Frictionless CSV Dialect spec** [S03]: delimiter/quote/escape/header/skip
  rows as declarable metadata — the replay-pinning target for whatever the
  sniffer found.
- **CleverCSV behavior:** scores candidate dialects by row-length regularity +
  cell-type coherence; exposes `Sniffer().sniff(sample)`, `reader`/`DictReader`,
  `read_csv` with auto-detected dialect, and a CLI. Strength: messy files.
  Limit: sniffer cost explodes on large inputs (FEC-scale crawl [S11]); correct
  use is bounded-sample detect + user confirm + streaming read with the pinned
  dialect.
- **Encodings:** real-world nonprofit CSVs arrive as UTF-8, UTF-16 (with BOM),
  Windows-1252, latin-1, Shift-JIS. Detection reads a bounded head window
  (e.g. 64 KiB) with UTF-8-`replace` fallback as the honest last resort [S06].
  Preview must show detected encoding + confidence + BOM presence; replay pins
  the encoding explicitly.

### 2.6 Validation and error taxonomy [S03][S15]

- **Frictionless validation report:** one report per table/resource/dataset with
  per-row/field error codes (type/cast, format, constraint, missing-value,
  key violations). This is the model for "understand rejected rows": row number,
  field, rule ID, raw value(s), expected type/format/constraint, and a human
  sentence. Pipeline order transform-then-validate is supported and matches the
  import flow (normalize → check → quarantine).
- **Quarantine design (derived):** three outputs per run — accepted rows (typed
  + raw), quarantined rows (raw + reasons), run manifest (dialect, encoding,
  epoch, schema, locales, engine + versions, sample windows, counts, hashes).
  Nothing is silently dropped; rerun diffs are computed on the manifest.

### 2.7 Memory architecture for a modest laptop

- **Default streaming:** qsv-style constant-memory verbs for filter/select/
  rename/clean/validate; DuckDB file-backed spill for sort/join/aggregate/
  export; Polars lazy with projection/predicate pushdown for columnar shaping.
- **Explicit heavier paths:** whole-file inference (`sample_size=-1`,
  `infer_schema_length=None`) and full loads are available but must show a cost
  warning (observed: ~2.2× read cost for whole-file CSV inference per statement
  on 100 MB [S06]; Polars whole-file inference documented slow [S07]).
- **Preview bounds:** dialect/type/encoding detection on bounded samples with
  multi-offset coverage where the engine supports it; full-file validation as a
  separate, progress-reporting pass that streams and quarantines.

---

## 3. O3 — Issue/fix/regression/release evolution chains

### 3.1 Primary chain (Excel epoch): calamine #629 → #630 → #706 → #708 (+ qsv #3905) [S08]

- **#629 (feature request):** expose which date epoch (1900 vs 1904) an
  xls/xlsx/xlsb workbook uses — without it every consumer silently assumes 1900.
- **#630 (PR, 2026-05-10):** adds `has_1904_epoch()` to Xls/Xlsx/Xlsb with tests
  for both epochs. Released in calamine 0.35 (observed via qsv commit message).
- **qsv #3905:** surfaces `has_1904_epoch` in workbook `--metadata` JSON (ODS
  omits the field — no equivalent concept), so downstream pipelines can branch
  on epoch explicitly.
- **#706 (regression report):** real-world 1904-system xlsx files saved by modern
  Excel (2013+) read on the 1900 epoch — every datetime comes back 1462 days
  early. Root cause: the xlsx reader correctly parses
  `<workbookPr date1904="1"/>` but then encounters `<x15:workbookPr/>` inside
  `<extLst>` (which modern Excel always writes) and resets the flag to false.
  The extension element carries no date attributes; treating its absence-of-flag
  as flag-false is the bug.
- **#708 (fix PR):** do not let `<x15:workbookPr>` reset the `date1904` flag
  (ignore the extension for epoch purposes). Tests cover both epochs plus the
  1900 leap-day quirk.
- **Why it matters for S10:** this is exactly the "occasional Excel workbook"
  hazard — a rare 1904-system file from an old Mac silently shifts every date by
  four years. The import assistant MUST (a) surface epoch in preview with a
  1904 warning, (b) regression-test with a modern-Excel-saved 1904 fixture, (c)
  preserve raw serial + epoch + format code so the shift is detectable and
  reversible. Status: fix observed as PR #708; release number carrying it was
  not confirmed in this pass (stated as unconfirmed, not assumed).

### 3.2 Secondary chain (CSV sampling): DuckDB sniffer issues [S06]

- **#6011:** sniffer errors when `header=false` — fixed behavior requires the
  user to either raise `SAMPLE_SIZE`/`-1` or set `ALL_VARCHAR=1`; established the
  "widen sample or pin types" recovery pattern still documented today.
- **#17599:** sniffer defaults to no-quote on a file whose quoting only appears
  past the sample; whole-file scan (`sample_size=-1`) resolves it. Shows dialect
  detection shares the sampling window with type detection.
- **#21000:** `read_csv` fails on a quoted-comma field beyond `sample_size`;
  maintainer reproduces and prescribes `sample_size=-1` as the workaround.
  Same root pattern as #17599 with a field-level trigger.
- **#14097:** formats sniffer error messages consistently (spaces/separators) so
  the `sample_size`/`ignore_errors`/`all_varchar` recovery hint reads uniformly.
- **webbed #102 → v2.3.0 (adjacent):** `sample_size` existed but was a dead
  option (sniffer hardcoded a 20-value window); v2.3.0 honors it with `-1` =
  every value, default window 50, and safe `VARCHAR` fallback / `ignore_errors`
  → NULL instead of aborting the scan. Included as a cautionary parallel: a
  sampling knob that is not wired through is worse than none.
- **Pattern for S10:** bounded sampling is a deliberate speed/correctness trade
  (DuckDB 20,480 + multi-offset jumps; Polars 100; CleverCSV bounded sample).
  The design must make the window visible, pin findings on replay, and treat
  "failed past the sample" as a first-class, explained quarantine reason — never
  a crash or silent misread.

### 3.3 Tertiary chain (inference-window evolution): Polars [S07]

- **PR #1674:** allows `infer_schema_length=None` in `read_csv` (whole-file
  inference escape hatch; slow).
- **v2 upgrade:** `infer_schema_files` default 10 for multi-file scans (was: all
  files) — a deliberate narrowing of the default inference scope for speed, with
  the same tail-risk trade as §3.2. Kept as a release-behavior data point for
  "defaults evolve toward speed; replay must pin."
- **Absent/inapplicable (stated honestly):** no S10-specific regression in
  OpenRefine operation-history replay, Frictionless validation codes, or
  Tableau/Power Query internals was traced in this pass; those products are
  cited for behavior/UX benchmarks, not for a traced code fix. No S10-owned
  prior release exists to regress.

---

## 4. Retained alternatives, conditions, and disagreements

- **Engine choice is per-verb, not per-app.** qsv-style streaming for row verbs,
  Polars-lazy for columnar shaping, DuckDB-spill for SQL/sort/join/export.
  Disagreement with any single-engine plan is intentional and retained.
- **Inference is a first-import convenience; replay is declarative.** First run
  may sniff; the saved recipe (dialect, encoding, epoch, schema, locales,
  formats, engine versions, sample windows) is what replays. Re-inference on
  replay is a user opt-in, never the default.
- **Identifiers are strings until the user says otherwise.** Leading zeros, long
  IDs, mixed alphanumeric codes: inferring numeric is a preview warning with a
  one-click "keep as text" that persists.
- **Dates are locale + format + epoch pinned.** Day/month ambiguity and 1900-vs-
  1904 epoch are blocking preview questions when detected, with safe defaults
  (keep raw, quarantine ambiguous) when the user defers.
- **Originals are never overwritten.** Raw strings (CSV), raw serials + format
  codes (Excel), source row numbers, and run manifests persist alongside typed
  outputs. Storage cost is accepted as the price of auditability.
- **Silent leniency is rejected.** `ignore_errors`-style drops and unlogged
  fallbacks are not defaults; every lenient path is explicit, counted, and
  reversible from quarantine.
- **Uncertainty retained:** best dialect detector (CleverCSV vs uniformity
  successors vs engine sniffers) is unranked without S10-representative fixtures;
  calamine #708 release vehicle unconfirmed; commercial internals (Prep/Trifacta/
  M engine) benchmarked on docs/UX only; exact laptop floor (4 GB? 8 GB?) unknown
  — design targets streaming-first so the floor matters less.

---

## 5. O6 — Discriminating validations (proposed; none executed — no runtime)

Executed checks in this pass: read-only page/code/doc observations listed in
`source-map.json` (fetch + search operations with timestamps). No parser,
sniffer, or engine was run; no fixture was built. Everything below is PROPOSED.

1. **V1 — Tail-type flip (DuckDB vs Polars vs pinned).** Fixture: 30k-row CSV,
   column numeric for 25k rows then `1e5`/text. Expect: DuckDB strict aborts past
   20,480 / succeeds with `-1` or pinned types; Polars default-100 mis-infers or
   parse-errors / succeeds with `infer_schema_length=30000` or override;
   quarantine path captures the flip row with rule ID. Discriminates sampling
   defaults and recovery UX.
2. **V2 — Late-quote dialect break.** Fixture: quoting with embedded commas first
   appearing at row 25k. Expect: default sniffers mis-detect; `-1`/full-sample
   or user-confirmed dialect succeeds. Discriminates dialect-window visibility.
3. **V3 — 1904-epoch modern-Excel file.** Fixture: 1904-system xlsx saved by
   Excel 2013+ (with `<x15:workbookPr/>`). Expect: epoch surfaced as 1904,
   dates correct to the day, raw serials preserved; a naive reader shifts −1462
   days (fails). Discriminates the #706 regression and preview surfacing.
4. **V4 — Serial-60 + pre-1900 + 9999-boundary sheet.** Cells: serial 60,
   1899-12-31 text, 9999-12-31, 10000-01-01. Expect: serial 60 flagged as
   fictitious; pre-1900 kept text + ISO; overflow rejected with reason.
   Discriminates Excel-limit handling.
5. **V5 — Locale trap.** Column `01/02/2024` ×2 runs with `en-US` vs `en-GB`
   pinned; plus identifier column `00123`/long IDs. Expect: US→Jan 2, GB→Feb 1,
   both explicit; identifiers stay text with raw preserved; unpinned run
   quarantines ambiguous dates instead of guessing. Discriminates locale pinning.
6. **V6 — Encoding + BOM matrix.** UTF-8 / UTF-8-BOM / UTF-16 / Windows-1252
   variants of one CSV with accented names. Expect: correct detection + preview
   note each time; mojibake quarantined, never silently kept. Discriminates
   encoding UX.
7. **V7 — Memory honesty.** 2 GB-class CSV on a 4–8 GB laptop profile: streaming
   filter/select/validate stays flat; sort/join/export spills via file-backed
   store; `:memory:`-only run is the expected-OOM control. Discriminates spill
   vs OOM behavior.
8. **V8 — Month-2 replay.** Same recipe + new month's file with one added column
   and one renamed header. Expect: replay pins old contract, reports the added
   column as new (typed + raw, user confirms), reports the rename as
   missing-expected/extra-found with a remap prompt, and never silently
   re-infers. Discriminates replay determinism.
9. **V9 — Recipe round-trip.** Export recipe → fresh profile → import recipe →
   rerun on the original fixture → byte-identical accepted/quarantine tables +
   manifest match except run timestamps/hashes-of-input. Discriminates
   portability of the replay contract.
10. **V10 — Quarantine comprehension.** Five seeded rejects (bad date, bad
    number, missing required, dup key, encoding glitch) shown to a pilot analyst:
    each reason understood without docs. Discriminates explanation quality (the
    brief's "understand rejected rows" bar).

---

## 6. Source notes and drift discipline

- Stable anchors preferred: Microsoft Learn commit `15b7b561…` [S05], calamine
  PR/issue numbers + dates [S08], PyPI versions (CleverCSV 0.5.6 [S10], qsv
  1.0.0 crate page [S09]), Table Schema v1 [S03], Polars Rust `csv.rs` doc text
  ("default is 100 rows") [S02].
- Drift-prone: DuckDB `/current/` docs, Polars `/stable/` docs, OpenRefine
  `/docs` index, subtype blog/UX pages. Recorded with access timestamps; re-check
  before build. No silent rebind.
- Treated as data: all fetched pages/search snippets are untrusted input; no
  fetched script was executed; no installer/binary was downloaded.

---

## 7. Pre-reveal close-out

This discovery is complete for O1/O2/O3/O5/O6-discovery from the brief alone.
O4 (per-P disposition) and the final planning deliverable belong to `draft.md`
after the reveal gate freezes this file. DO NOT edit this file after running
`reveal-plan.py`.
