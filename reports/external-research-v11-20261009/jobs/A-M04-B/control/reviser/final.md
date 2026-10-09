# S10 data-import — complete final (M04 amendment-preservation rewrite)

Block A-M04-B / arm control / stage reviser / case S10 / method M04 v1
(amendment-preservation: fresh reviser rewrites the complete final after
critique, preserving supported findings).
Brief: `cases/S10/brief.md` (frozen sha256
`17322e03cfaa4aad42ef991cbf666e5ca646cca2439f71b748c8642761ccbbf2`).
Discovery: `research/discovery.md` frozen BEFORE reveal (sha256
`4e514241aee4a4fa133f281ece91ca2399338c9778aeca65343f1a46e9347df7`,
30093 bytes, 491 lines); reveal receipt `plan-reveal.json` at
2026-10-09T19:31:27Z; plan sha256
`3f5acb86924c2981486d394c7e57a6578fdafd05ad7345800fda856c84dbf6bf`.
Discovery was NOT rewritten after reveal.
Draft: `research/draft.md` (381 lines) read complete, every line.
Critique: `critic/critique.md` (569 lines: 12 material M1–M12, 14 minor
m1–m14, per-P audit, validations audit, §8 refused demands) read complete,
every line, with `critic/source-map.json` (C01–C06) and
`critic/sources/critic-evidence.md`.
Research evidence read complete: `research/source-map.json` (S01–S15) and all
four research `sources/*.md` notes plus `sources/index.md`.
Reviser evidence: `source-map.json` (R01–R04, web_search snippet observations
2026-10-09T19:47–19:48Z) and `sources/reviser-evidence.md`. No runtime, no
witness, no qualified sandbox claimed. Usage/billing: unobserved (null/UNKNOWN).

This file is self-contained and is the ONE coherent complete final: every
retained finding is stated in prose. `[Snn]` / `[Cnn]` / `[Rnn]` IDs supplement
(research / critic / reviser source maps) but no section is replaced by an ID.
Obligations O1–O6 from the brief govern equally. §8 explicitly accepts, amends,
rejects, or retains uncertainty for every criticism; nothing there is handled by
silent obedience.

Product: desktop import assistant for nonprofit analysts. Inputs: large CSVs,
occasional Excel workbooks, inconsistent dates/identifiers. Must: preview
inference, preserve original strings, explain rejected rows, replay the same
transformation next month, respect modest laptop memory.

---

## 1. O1 — Tools, products, materially different approaches (discovery retained)

The brief names no implementation. Discovery, written plan-blind, surfaced the
following, all preserved here (critic §5: breadth genuinely met; m12: honest
non-dives preserved, neither inflated nor dropped).

### 1.1 Repeatable-recipe cleaners (closest product class)

**OpenRefine (open source, desktop-via-browser, Java) [S04].** Loads
CSV/JSON/XML/Excel-ish inputs; explores with facets/filters/sorting; applies
column-wide transforms; clusters near-duplicates; reconciles against external
services; exports. Every operation is recorded and extractable as a reusable
recipe that re-applies; transformations are transparent and reversible;
original data stays preserved locally. Directly matches "repeat the same
transformation next month" plus "understand rejected rows" (facets isolate the
failing slice). Memory: JVM heap preference is the scaling knob (large
sorts/reconciliations spill or fail past it). Strongest for analyst-driven,
human-in-the-loop cleaning with an audit trail; weakest as an embedded library
(app + HTTP API, not a crate/pip import). Commercial analogues with the same
recipe/flow idea: Tableau Prep flows with scheduled reruns [S13], Power Query M
queries with applied steps and culture-aware type changes [S12][S14].

**Frictionless Data: Table Schema + Data Package + validation + pipelines
[S03][S15].** Declarative alternative to code-first cleaning: describe fields
(name, type, format, constraints, missingValues, primary/foreign keys) in JSON
Table Schema v1; bundle files + schemas as a Data Package; `validate` produces
one unified validation report; `transform`/`Pipeline`/`steps` express repeatable
pipelines (transform-then-validate is an explicitly supported order [S15]). CSV
Dialect is its own spec (delimiter/quote/escape/header handling). Materially
different from inference-first sniffing: declare-then-check rather than
guess-then-patch. Best for the month-2 replay requirement where the contract is
versioned (schema + pipeline), and for rejected-row explanations (per-row/field
validation errors with codes). Requires authoring/maintaining the schema;
raw-string preservation must be designed in (source column + typed column).

### 1.2 Streaming-first CSV engines for modest laptops

**qsv (Rust, xsv successor) [S09].** Most commands stream in constant memory
over arbitrarily large CSVs; commands that must load everything are marked with
the project's full-load marker and get out-of-memory prevention, batch
strategies, and disk-backed variants. The honest laptop-memory story: default to
streaming verbs (slice/select/rename/clean/validate), isolate memory-hungry
verbs (sort/dedup/join/frequency) behind explicit spill/batch paths. Candidate
embedded engine or sidecar CLI for the large-CSV path; also surfaces workbook
metadata including the Excel epoch flag (see §3).

**DuckDB in-process OLAP (`read_csv_auto`, spill) [S01][S06][C01][R01].**
`read_csv`/`read_csv_auto` plus `SUMMARIZE`/`DESCRIBE` give preview + profile in
one engine; file-backed database plus `temp_directory` spills sorts/joins/exports
past RAM while an in-memory-only database cannot spill and will exhaust memory
on GB-scale work [S06]. Material difference vs eager frames: SQL over files
without loading everything, with explicit CSV knobs (§2). Desktop fit:
embeddable, no server.

**Polars eager + lazy (`read_csv` vs `scan_csv`) [S02][S07][C02].** `read_csv`
loads now; `scan_csv` builds a lazy plan (filter/select/projection before
`collect`), with larger `infer_schema_length` and `schema_overrides` as
correctness knobs and null/date handling at scan time. Documented large-file
guidance: on memory exhaustion switch to `scan_csv`, select fewer columns, or
stream in chunks [S07]. Material difference: columnar + predicate pushdown vs
row-streaming (qsv) vs SQL-spill (DuckDB). Polars is the most sample-fragile
engine out of the box (100-row default, §2) — a deliberate speed default, not a
defect, but replay must never rely on it bare.

**Why not pandas-eager for the large-CSV path (O-a, added per critique).**
pandas infers whole-column (costly on large files) and its chunked-typing
behavior under low-memory-style reads is a known pitfall class; it is the
analysts' likely incumbent, so the preview should say so in one line. No
benchmark is claimed here; the engine-per-verb design (§6) is the substantive
answer.

**CleverCSV (messy-dialect detection) [S10][S11].** Drop-in `csv`-module
replacement plus CLI detecting delimiter/quote/escape by row-length patterns +
cell data-type consistency; reported ~97% dialect accuracy with ~21-point gain
on messy files vs the standard sniffer [S10] (reported figures, not S10 facts —
m4). Material difference: dialect detection as scored search over candidates
rather than head-sample heuristic. Limit: the sniffer can slow to a crawl on
large-ish files (e.g. FEC data) [S11] — belongs on a bounded sample +
user-confirmed preview, never on the full large-CSV scan. A 2024
uniformity/type-inference method claims 99–100% on the same style of benchmark
vs CleverCSV 94.59% [S11] (reported figures, m4) — "best dialect detector" stays
an open choice (U1), not a settled pick.

### 1.3 Excel readers that respect epochs and formats

**calamine (Rust) + fastexcel/qsv-excel family [S08][C03].** Reads
xls/xlsx/xlsb/ods; exposes the 1904-epoch flag per workbook (feature #629, PR
#630, shipped in calamine 0.35); models datetimes as serial + type + epoch
flag; qsv surfaces the flag in workbook `--metadata` JSON (qsv-side body not
fetched — verify at build, m5). Material difference vs naive readers: epoch is
first-class metadata, not an implicit 1900 assumption. Limits: serials cannot
represent pre-1900 dates; calendar caps at 9999-12-31; displayed strings live in
`styles.xml` number formats while cells store floats — preserve raw float +
format code + rendered string. Serial-60 conversion output of the reader was not
observed in any pass (M4; reviser search R03 corroborates the gap) — flag
serial 60 from the preserved raw value, not from converted output.

**openpyxl / LibreOffice styled-write path (noted, not primary).** Retained as
an alternative for styled round-trip writes; not investigated as the read path
(m12). Recorded as an alternative, not a rejection.

### 1.4 Commercial / power-user analogues (behavioral benchmarks, not embeds)

**Power Query M [S12][S14][C06].** Applied-steps queries replay next month;
per-column locale pinning (`Change Type → Using Locale`,
`DateTime.FromText`/`Date.FromText` with Culture, `Table.TransformColumnTypes`
with culture and missing-field handling, including a record form observed in
current docs) is the governing locale mechanism for ambiguous `01/02/2024`
[C06]. Without explicit culture, conversion follows the author's locale — the
same query yields different dates on another machine. The record form's dating
("May-2025 update") rests on secondary pages only (M5): confirm the minimum
host version at build, with the positional-culture form as fallback. Benchmark
value: per-column locale pinning + explicit missing-field policy is the bar for
cross-region replay.

**Tableau Prep Builder/Conductor [S13].** Visual flow (connect → clean/shape →
union/join → output), automatic type detection on import, published flows rerun
on schedule with success/last/next-run tracking. Benchmark value: scheduled
replay + flow-level data-freshness UX.

**Trifacta / EasyMorph / KNIME / Talend (surveyed, not deep-dived).** Same
flow/recipe family; sales-led or heavyweight relative to a small nonprofit
desktop tool. Retained as "evaluate before building" (m12); no internals
claimed; evidence absent, honestly stated.

### 1.5 Materially different architectures (all kept; none collapsed)

1. **Declare-then-check (Frictionless)** vs **guess-then-patch (sniffers):**
   complementary phases — infer on first import, freeze as schema + recipe,
   replay declaratively.
2. **Row-streaming (qsv)** vs **columnar-lazy (Polars)** vs **SQL-spill
   (DuckDB):** explicit per-operation choice. A single-engine plan is a REJECTED
   simplification.
3. **Raw + typed dual columns.** Every typed field keeps its original string
   (Excel: raw serial + number-format code + rendered text + epoch). Rejected
   rows keep row number, raw line/cells, rule ID, human reason. The only design
   satisfying "preserve original strings" and "understand rejected rows" at once.
4. **Quarantine, not silent drop.** `ignore_errors`-style silent drops are
   rejected as a default (strict vs lenient reads can disagree [S06]). Default:
   strict read → quarantine table + counts; lenient re-read only as an explicit,
   logged, reversible option.
5. **Local-first embedded store as the replay log.** Runs, schemas, overrides,
   quarantine rows are queryable artifacts, not transient UI state.

---

## 2. O2 — Consequential behavior, defaults, limits, applicability

### 2.1 DuckDB CSV sniffer + read path [S01][S06][C01][R01]

- **What auto-detects:** dialect (delimiter, quoting rule, escape),
  per-column types, header presence. Any option individually overridable; fixed
  options constrain remaining detection. `sniff_csv` accepts the same named
  parameters as `read_csv` (plus `force_match`); `auto_detect` must be true.
- **Governing default — `sample_size = 20480`, `-1` = whole file [C01][R01].**
  The official 2023 sniffer post states detection runs "only executed on a
  sequential sample", 20,480 tuples = 10 execution chunks, configurable, `-1`
  sniffs the complete file [R01]. The single most common CSV bug class is
  "type/dialect failed past the sample window": a differently-typed value or a
  quoting pattern appearing past the window risks aborting or misreading a
  strict read; the cited issues #17599/#21000 are dialect/quote analogues past
  the sample (m1) — a type-flip abort past the window is plausible but to be
  confirmed by the V1 ladder, not asserted from those issues.
- **Multi-offset sampling: UNCONFIRMED single-source claim (M1).** Only the
  third-party tallyman notes assert multi-offset jumps on seekable files; the
  official post says sequential sample. The two descriptions are in tension for
  the same reader unless behavior changed across versions (2023 post vs 2026
  notes) or "jumps" misdescribes buffer traversal. This final asserts NO
  multi-offset behavior and promises NO offset coverage in preview: the honest
  display triple is window size + engine + head-vs-full (m14). A version-pinned
  source read during build may reinstate multi-offset with a version qualifier;
  until then the negation is likewise not asserted — only the downgrade.
- **Lenient knobs and their trap:** `ignore_errors=true` drops erroring rows,
  but projection pushdown can skip parsing (hence skip detecting) errors in
  unselected columns; strict and lenient runs can disagree on row counts
  (snippet-observed via notes, M12). `all_varchar`/`columns`/`nullstr`/
  `dateformat` are the deterministic alternatives.
- **Memory (M8):** file-backed spill is the DEFAULT for large runs
  (`memory_limit` + `temp_directory`); in-memory-only execution is an explicit
  override capped to small runs, not a prohibited-then-ignored absolute. Spill
  and limit behavior must be pinned to the chosen engine versions at build and
  V7 re-run on upgrade (drift across releases). `SUMMARIZE SELECT * FROM 'f.csv'`
  is the cheap preview/profile primitive before committing to types.
- **Units/types:** CSV has no units; types are inferred
  (BOOLEAN/BIGINT/DOUBLE/DATE/TIMESTAMP/VARCHAR ladder with lowest-common-type
  demotion inside the sample). Dates/times parse under explicit `dateformat`/
  `timestampformat` when pinned; otherwise locale/format guessing applies — pin
  formats for replay.
- **Applicability:** preview + profile + spill engine; never a silent
  truncator. Preview shows window size + engine + head-vs-full; replay pins
  every detected option explicitly.

### 2.2 Polars CSV inference + lazy execution [S02][S07][C02]

- **Governing default — `infer_schema_length = 100`.** Only 100 rows feed dtype
  inference by default [C02]. `None` scans the whole file (documented slow;
  loads into memory), `0` (or `infer_schema=False`) forces all `String`.
  Multi-file scans default `infer_schema_files=10` in v2 (was: all files).
  Characteristic past-window failure: a type change at row 101 flips a column
  from `i64` to parse error unless widened or pinned.
- **Scan-time correctness knobs:** `schema_overrides` (pin `zipcode: String`),
  `null_values` (map missing-like tokens to null at scan so downstream stays
  strict), `try_parse_dates` — a Polars knob (m2), default off, ISO-like strings
  to temporal, per-column opt-in only — plus `raise_if_empty`,
  `comment_prefix`, `quote_char`, `separator`, `skip_rows/lines`. The
  `null_values` dict form and the `empty_string_is_null` parameter name were not
  in the observed signature text: verify parameter names against the pinned
  Polars version at build (m3). Dirty-data handling belongs at the scan, not as
  post-hoc casts.
- **Lazy vs eager:** `scan_csv` + `collect` (optionally streaming) with
  filter/select pushdown is the large-file path; `read_csv` is the small-file
  eager path. Documented OOM guidance: switch to `scan_csv`, fewer columns,
  chunked/streaming collect.
- **Applicability:** `scan_csv` with an explicit, UI-visible inference window
  (default unpinned pending the V1b/V2 sizing ladders — any "10k" in this
  document is an illustrative placeholder, never a decision, M2), per-column
  opt-in date parsing, `schema_overrides` persisted as the replay contract.
- **Escape cost (M3):** Polars `None` = full scan, documented slow,
  memory-loaded; NO numeric factor is claimed for it. It must never share the
  DuckDB-only ~2.2× figure (§2.6).

### 2.3 Excel serial dates, epochs, and the 1900 leap-year fiction [S05][S08][C03][C05]

- **1900 system (default):** serial 1 = 1900-01-01; serial 60 = fictitious
  1900-02-29 (Lotus 1-2-3 compat; 1900 is not a leap year — divisible by 100,
  not 400). Every serial ≥61 is one greater than the true day count. Microsoft
  documents this as intentional and unfixable without breaking serial
  compatibility, weekday values, and existing sheets [S05][C05]. Time is the
  fractional part. Displayed text is a `styles.xml` number-format code applied
  to the float — the file stores the float.
- **1904 system (old Mac default, still seen):** epoch 1904-01-01; every date
  is 1462 days (4 years + 1 day — the +1 day is the 1900 fiction; preserved
  verbatim, m11) later in serial terms than the same calendar date in the 1900
  system. The flag lives in `<workbookPr date1904="1"/>` (xlsx), equivalent
  flags in xls/xlsb; there is no ODS equivalent [S08].
- **Hard limits:** serials cannot represent dates before 1900-01-01 as dates;
  calendar caps at 9999-12-31. Pre-1900 nonprofit records MUST stay text +
  explicit ISO date, never Excel serial.
- **Excel numeric precision (M10, new):** Excel stores and calculates with 15
  significant digits of precision (Microsoft Support primary [R02]). Long
  numeric IDs are therefore already rounded in-file (IEEE-754 doubles) before
  any import tool sees them: no import-time raw-string preservation can recover
  lost digits, and the rendered text shows the rounded value. Identifier-like
  Excel columns with more than 15-digit numerics get a preview warning
  ("precision may already be lost in-file; confirm against source system") and
  a quarantine/reconciliation rule; exact merge/rounding edge behavior is
  fixture-verified at build (V5 xlsx-ID arm), while the documented 15-digit
  figure itself is primary-sourced, not uncertain.
- **calamine behavior:** epoch flag exposure and `ExcelDateTime` serial + type
  + epoch modelling observed [S08]; the reader is reported to handle the
  serial-60 quirk, but exact output for input serial 60 was not observed in any
  pass (M4; reviser search R03 found only generic serial-60 explainers, no
  calamine-specific conversion output) — verify before pinning a reader
  version. qsv's surfacing of the flag in `--metadata` JSON is cited without an
  observed qsv-side body (m5) — verify at build.
- **Modern-Excel trap (issue #706, §3):** current Excel writes
  `<x15:workbookPr/>` inside `<extLst>`; a naive parser lets it reset the
  already-read `date1904` flag to false, silently shifting every date 1462 days
  earlier. Any xlsx reader MUST be regression-tested against a 1904-system file
  saved by modern Excel, not just a hand-made fixture.
- **Applicability:** import surfaces epoch + serial + format code + rendered
  text per date column; preview flags serial-60 (from the raw serial == 60,
  M4), pre-1900 cells, and >15-digit numeric IDs explicitly; replay pins epoch
  handling per workbook.

### 2.4 Locale-sensitive date/number parsing [S12][S14][C06]

- Ambiguous `01/02/2024` resolves ONLY by explicit per-column locale + format
  (model: `Change Type → Using Locale`, `DateTime.FromText`/`Date.FromText`
  with Culture, `Table.TransformColumnTypes` with culture + missing-field
  handling incl. the record form in current docs [C06]; host-version floor
  confirmed at build per M5). Without explicit culture, conversion follows the
  author's locale — identical queries yield different dates on US vs UK machines.
- Identifiers with leading zeros (`00123`), long numeric IDs (float rounding,
  §2.3), and locale decimal separators (`,` vs `.`) fail the same way when
  inferred numeric.
- Design consequence: the replay contract pins per-column locale + format +
  type; identifiers default to String with preserved raw; numeric inference on
  identifier-like columns is a preview warning, not a default. Day-first vs
  month-first is a user decision in preview, never a silent default.
- **Date-format guessers (O-b, added per critique).** The preview needs a
  proposer to confirm: candidate approaches are locale-aware date-guessing
  libraries (the dateutil/chrono-class guesser family) vs proposals driven by
  the engine's own parser errors. No guesser was evaluated in any pass; the
  choice stays open at build with no claimed benchmark. One paragraph is the
  whole of this item by design.

### 2.5 Delimiters, dialects, and encodings [S03][S10][S11][R04]

- **Frictionless CSV Dialect spec** [S03]: delimiter/quote/escape/header/skip
  rows as declarable metadata — the replay-pinning target for whatever the
  sniffer found.
- **CleverCSV behavior:** scores candidate dialects by row-length regularity +
  cell-type coherence; exposes sniffer/reader/CLI. Strength: messy files.
  Limit: sniffer cost explodes on large inputs (FEC-scale crawl [S11]); correct
  use is bounded-sample detect + user confirm + streaming read with the pinned
  dialect. Full-file scored search is prohibited by default (unbounded/crawl
  cost shape, M3).
- **Encodings (M9):** the detector choice is explicitly OPEN (U1 companion).
  Confirmed-existing candidates observed in this pass [R04]: `chardet`
  (`chardet.detect()` over a bounded head window, the documented CSV-detection
  recipe) and `charset-normalizer` (universal charset detector + CLI). Engine-
  native or further detectors may join the candidate list at build; no detector
  benchmark is claimed. The V6 encoding matrix selects the detector; the
  "bounded head window (e.g. 64 KiB) with UTF-8-`replace` fallback" line is a
  candidate approach, not a decision. Preview shows detected encoding +
  confidence + BOM presence; replay pins the encoding explicitly.

### 2.6 Validation, error taxonomy, and cost shapes [S03][S15][S06][S07]

- **Frictionless validation report:** one report per table/resource/dataset with
  per-row/field error codes (type/cast, format, constraint, missing-value, key
  violations). The model for "understand rejected rows": row number, field,
  rule ID, raw value(s), expected type/format/constraint, human sentence.
  Pipeline order transform-then-validate matches the import flow (normalize →
  check → quarantine).
- **Missing-value semantics (C04):** `missingValues` are pre-cast strings; the
  default for non-string fields is `""`; field-level `missingValues` overwrite
  schema-level (datapackage PR #24). Footgun that must be stated: setting
  `missingValues: ["NA"]` without `""` excludes the empty default and can newly
  invalidate empty cells (frictionless-py #1599 pattern) — every proposed
  per-column set must explicitly decide `""`.
- **Quarantine design:** three outputs per run — accepted rows (typed + raw),
  quarantined rows (raw + reasons), run manifest (dialect, encoding, epoch,
  schema, locales, engine + versions, sample windows, counts, hashes). Nothing
  silently dropped; rerun diffs computed on the manifest.
- **Escape-cost shapes, kept separate (M3):** DuckDB whole-file inference
  (`sample_size=-1`) ≈ 2.2× read cost per statement on 100 MB — a third-party
  estimate, re-measured on S10 fixtures; Polars whole-file inference
  (`infer_schema_length=None`) = full scan, documented slow, memory-loaded, no
  numeric factor claimed; CleverCSV-style full-file scored search =
  unbounded/crawl, prohibited by default. The preview shows the engine-specific
  warning, never a generic "escape cost".
- **Memory architecture:** qsv-style constant-memory verbs for
  filter/select/rename/clean/validate; file-backed spill (default, M8) for
  sort/join/aggregate/export; Polars lazy with projection/predicate pushdown
  for columnar shaping. Preview bounds: dialect/type/encoding detection on
  bounded samples (head-vs-full stated honestly, m14); full-file validation as
  a separate, progress-reporting, streaming quarantine pass.

---

## 3. O3 — Issue/fix/regression/release evolution chains

Evidence-gradient honesty (M12): the primary chain rests on fetched bodies and
a fix commit; the secondary and tertiary chains rest on search snippets plus
third-party research notes — issue/PR bodies were not fetched in any pass.
"Maintainer reproduces and prescribes" below therefore reads as
"snippet reports maintainer prescribing" wherever no body was observed. O3 stays
met: the brief requires at least one chain, and the primary is genuinely traced.

### 3.1 Primary chain (Excel epoch): calamine #629 → #630 → #706 → #708 (+ qsv surfacing) [S08][C03]

- **#629 (feature request):** expose which date epoch (1900 vs 1904) an
  xls/xlsx/xlsb workbook uses — without it every consumer silently assumes 1900.
- **#630 (PR, 2026-05-10):** adds epoch-flag exposure to Xls/Xlsx/Xlsb with
  tests for both epochs. Released in calamine 0.35 (observed via qsv commit
  message).
- **qsv surfacing:** workbook `--metadata` JSON carries the epoch flag (ODS
  omits the field — no equivalent concept), so downstream pipelines branch on
  epoch explicitly (qsv-side body not fetched, m5).
- **#706 (regression report, body observed):** real-world 1904-system xlsx
  files saved by modern Excel (2013+) read on the 1900 epoch — every datetime
  comes back 1462 days early. Root cause: the xlsx reader correctly parses
  `<workbookPr date1904="1"/>` but then encounters `<x15:workbookPr/>` inside
  `<extLst>` (which modern Excel always writes) and resets the flag to false.
  The extension element carries no date attributes; treating its
  absence-of-flag as flag-false is the bug. Reported tested on calamine 0.36.1
  [C03].
- **#708 (fix):** do not let `<x15:workbookPr>` reset the `date1904` flag.
  UPGRADED since the draft: the fix commit now exists (`71af96a5`, 2026-08-27,
  3 files including `tests/date_1904_extlst.xlsx`) [C03]. The release vehicle
  carrying the fix is still unconfirmed (U3 stands — re-check before pinning an
  Excel-reader version).
- **Why it matters for S10:** exactly the "occasional Excel workbook" hazard —
  a rare 1904-system file silently shifts every date by four years. The import
  assistant MUST (a) surface epoch in preview with a 1904 warning, (b)
  regression-test with a modern-Excel-saved 1904 fixture, (c) preserve raw
  serial + epoch + format code so the shift is detectable and reversible. This
  is core correctness for archival nonprofit data, not edge-case gold-plating
  (§8 agreement).

### 3.2 Secondary chain (CSV sampling): DuckDB sniffer issues [S06][C01] (snippet-level)

- **#6011:** sniffer errors when `header=false` — recovery pattern "raise
  sample size / `-1` or set all-varchar" established and still documented.
- **#17599:** sniffer defaults to no-quote on a file whose quoting only appears
  past the sample; whole-file scan resolves it. Dialect detection shares the
  sampling window with type detection.
- **#21000:** `read_csv` fails on a quoted-comma field beyond `sample_size`;
  snippet reports maintainer prescribing `sample_size=-1` (m1/M12 wording).
  Same root pattern as #17599 with a field-level trigger.
- **#14097:** formats sniffer error messages consistently so the
  sample-size/leniency recovery hint reads uniformly.
- **webbed #102 → v2.3.0 (adjacent cautionary parallel):** `sample_size`
  existed but was a dead option (hardcoded 20-value window); v2.3.0 honors it
  with `-1` = every value, default window 50, safe `VARCHAR` fallback. A
  sampling knob not wired through is worse than none.
- **Pattern for S10:** bounded sampling is a deliberate speed/correctness trade.
  The design makes the window visible, pins findings on replay, and treats
  "failed past the sample" as a first-class explained quarantine reason — never
  a crash or silent misread.

### 3.3 Tertiary chain (inference-window evolution): Polars [S07][C02] (snippet-level)

- **PR #1674:** allows `infer_schema_length=None` in `read_csv`
  (whole-file inference escape hatch; slow).
- **v2 upgrade:** `infer_schema_files` default 10 for multi-file scans (was:
  all files) — deliberate narrowing of default inference scope for speed, with
  the same tail-risk trade as §3.2. Release-behavior data point for "defaults
  evolve toward speed; replay must pin."

### 3.4 Absent / inapplicable (stated honestly, O-c agreement)

No S10-specific regression in OpenRefine operation-history replay,
Frictionless validation codes, or Tableau/Power Query internals was traced;
those products are cited for behavior/UX benchmarks, not for traced code fixes.
No S10-owned prior release exists to regress. The reviser adds nothing here —
filling these with invented behavior would violate O3 honesty.

---

## 4. O4 — Exact per-P disposition (every clause compared)

Disposition vocabulary: CORRECTION (plan text is wrong/incomplete and must
change), ALREADY-COVERED (discovery already requires the intent),
OPTIONAL ENHANCEMENT (beyond the brief's bar, shippable later),
USER DECISION (analyst must choose; no safe silent default), REJECTED
(considered and refused with reason), UNCERTAIN (evidence insufficient).

### P1 — Exact clause: "Infer column types from the first 1,000 rows."
**Disposition: CORRECTION + USER DECISION.** (Critic: agree; M1–M3 hedges
applied.)

Why the clause fails as written: a head-only 1,000-row window is an arbitrary
point between two documented engine defaults — Polars infers from 100 rows by
default, DuckDB from a 20,480-tuple sequential sample (official sniffer post
[C01][R01]) — and head-only sampling covers less than a wider or full window.
The characteristic failure is the tail flip: a column numeric for thousands of
rows then carrying `1e5`/text, or quoting with embedded commas appearing late,
risks aborting or misreading a strict read past the window (cf. the dialect
analogues #17599/#21000; a type-flip abort past the window is plausible but
will be confirmed by the V1 ladder, m1 — the cited issues show the dialect
case, not the type case). A 1,000-row head window keeps all of that risk while
looking diligent.

Correction (replaces P1): inference runs on a bounded, VISIBLE sample; the
preview shows window size + engine + head-vs-full (m14) and the
engine-specific escape cost (M3); the user confirms or widens (bounded raise or
whole-file with cost warning); the confirmed window + detected dialect/header/
types become pinned replay metadata, not re-guessed next month.
Identifier-like columns (leading zeros, long numeric IDs, mixed alphanumeric)
default to String with a preview warning when numeric inference would destroy
information; numeric override is one click and persists. Polars
`try_parse_dates`-style temporal guessing (m2: a Polars knob, default off) is
per-column opt-in, never global. NO multi-offset coverage is promised (M1):
the correction's strength comes from visibility + confirm/widen + pinned replay,
all of which survive without it.

User decisions inside P1: accept/widen the sample (D1); confirm each inferred
type, especially identifier-vs-number and text-vs-date (D2); opt into
whole-file inference knowing the engine-specific cost (D1/D7).
Uncertain (retained): the exact default window number is UNPINNED pending the
V1b/V2 sizing ladders (U2); "10k" anywhere in this document is an illustrative
placeholder, never a decision (M2). 1,000 is not defended and not kept.

### P2 — Exact clause: "Parse date strings using the machine locale."
**Disposition: CORRECTION (blocking) + USER DECISION.** (Critic: agree; the
strongest correction in the draft. M4/M5 hedges and M10 addition applied.)

Why the clause fails as written: machine locale makes replay nondeterministic.
The same transformation run on a US laptop vs a UK laptop parses `01/02/2024`
as Jan 2 vs Feb 1. Power Query's documented behavior is the warning and the
model: unpinned conversion follows the author's locale, so identical queries
yield different dates on different machines; the fix is explicit per-column
locale + format (record form observed in current docs; minimum host version
confirmed at build with positional-culture fallback, M5). Excel adds a second
trap P2 ignores entirely: the 1900-vs-1904 epoch. Serial 1 = 1900-01-01 in the
1900 system while the 1904 system anchors at 1904-01-01 (1462-day offset); the
flag lives in `<workbookPr date1904="1"/>`; modern Excel writes
`<x15:workbookPr/>` in `<extLst>`, which reset the flag in calamine (#706,
−1462 days on every date; fix #708, commit `71af96a5` [C03]). And the 1900
system contains the intentional Lotus-compat fiction serial 60 = 1900-02-29
(Microsoft Learn, pinned commit), with pre-1900 dates unrepresentable as
serials and the calendar capped at 9999-12-31. A third trap is Excel numeric
precision (M10): Excel stores and calculates with 15 significant digits of
precision [R02], so long numeric IDs are already rounded in-file before import.

Correction (replaces P2): every date column pins locale + format + (for Excel)
epoch in the replay contract. Day/month ambiguity, detected 1904 epoch, and
>15-digit numeric Excel IDs are blocking preview questions with safe defaults
(keep raw, quarantine ambiguous) when the user defers. Machine locale may appear
ONLY as a displayed, editable default ("detected OS locale: en-GB — confirm per
column"), never as pinned truth. Raw strings (CSV) and raw serial +
number-format code + rendered text (Excel) persist alongside typed values;
serial 60 (flagged from the raw serial == 60, M4), pre-1900 cells, and
>15-digit numeric IDs are explicitly flagged.

User decisions inside P2: per-column locale/format (D3); day-first vs
month-first where ambiguous (D3); epoch confirmation for 1904-detected
workbooks (D5); long-ID precision confirmation against the source system (D10,
new per M10). Rejected: machine-locale-as-truth; silent re-inference of locale
on replay.

### P3 — Exact clause: "Convert missing values to null."
**Disposition: CORRECTION + USER DECISION.** (Critic: agree; C04 footgun added.)

Why the clause fails as written: it does not say which strings count as
missing, and the answer is per-column. Empty fields, `N/A`, `NULL`, `-`,
`9999`, and zero are missing in some columns and meaningful data in others
(`N/A` as a survey answer, `NULL` as a donor ID, 0 as a gift count). The
governing mechanisms are per-column missing-value sets: Frictionless
`missingValues` in Table Schema (field-level overwrites schema-level; values
are pre-cast strings; the default for non-string fields is `""` [C04]), Polars
`null_values` plus an explicit empty-string policy, applied AT SCAN so
downstream stays strict (Polars parameter names verified against the pinned
version at build, m3). A global "convert missing to null" also hides the
empty-string question: CSV `""` vs truly-absent are different facts an analyst
may need to distinguish. Stated footgun (C04): setting `missingValues: ["NA"]`
without `""` excludes the empty default and can newly invalidate empty cells —
every proposed set must explicitly decide `""`.

Correction (replaces P3): preview proposes per-column missing-value sets
(including the empty-string policy) from the sample + schema; the analyst
edits; the sets persist in the recipe; validation reports missing-vs-present
per field with rule IDs. Nothing missing-like is nulled without a declared set.

User decisions inside P3: the token set per column (D4); empty-string-is-null
per column (D4); whether `0`/sentinel numbers count as missing (D4).
Uncertain (retained): no universal token list is proposed — it must come from
the nonprofit's actual files during pilot. Demands for a universal list are
correctly refused (§8 agreement).

### P4 — Exact clause: "Keep failed rows in an error CSV."
**Disposition: ALREADY-COVERED (intent) + CORRECTION (substance: reject store
must carry row number, raw values, rule ID, expected-vs-found, human reason,
run ID, and accepted+quarantined=input accounting, whether the v1 container is
a table or a rich CSV).** (Critic M6: relabelled from OPTIONAL ENHANCEMENT;
content kept.)

Agreement: discovery already requires quarantine-not-drop and explicitly
rejects `ignore_errors`-style silent row drops as a default, because lenient
reads can disagree with strict reads on row counts (projection pushdown masks
errors in unselected columns; strict vs lenient runs diverge). Keeping every
failed row with its reason is the brief's "understand rejected rows" bar, and
P4's intent matches it.

Correction: a flat error CSV is one export view, not the store. The quarantine
record per row is: source row number, raw line/cells, failing field(s), rule
ID, expected type/format/constraint vs found value, one-line human reason, and
run ID linking to the manifest. The store is queryable, countable, and
reversible (re-import after fix); CSV export is offered from it. Accepted +
quarantined row counts must equal input rows (see P6). Calling this substance
"optional" while its semantics are mandatory hands the builder a contradiction
under schedule pressure — and "optional" is what gets cut. The semantics are
mandatory; only the container phasing (CSV-columns-first v1 with the richer
fields present as columns) is optional (E4).

No user decision is required to keep rejects; user decisions enter in how
rejects are resolved (fix-and-requeue, accept-as-text, waive-with-reason: D9).

### P5 — Exact clause: "Save transformation settings."
**Disposition: ALREADY-COVERED (intent) + CORRECTION (scope).** (Critic: agree.)

Agreement: discovery already requires a versioned, portable replay contract —
the mechanism behind "repeat the same transformation next month," modelled on
OpenRefine operation histories, Frictionless schema + pipeline bundles, Power
Query applied steps, and Tableau scheduled flows.

Correction: "settings" underspecifies what must be saved. The recipe pins: CSV
dialect (delimiter/quote/escape/header/skip rows per the CSV-Dialect-style
record), encoding + BOM, Excel epoch per workbook, field schema (types, formats,
constraints, missing-value sets, key declarations), per-column locale + format,
engine + component versions, inference sample windows, every user override, and
run manifests (counts, hashes, timestamps). Export → fresh profile → import →
rerun reproduces accepted/quarantine tables with logical equality plus manifest
match except run timestamps/input hashes (V9; byte-identity aspirational, m8;
"fresh profile" = no cache, no prior recipe, pinned engine versions installed,
m13). Re-inference on replay is a USER DECISION (opt-in "re-detect and diff",
D7), never the default; month-2 schema drift (added column, renamed header)
surfaces as new-expected/extra-found with a remap prompt (V8, D6).

### P6 — Exact clause: "Compare output row counts with inputs."
**Disposition: ALREADY-COVERED (intent) + CORRECTION (substance).** (Critic:
agree, with M7 provenance sentence added.)

Agreement: row-count reconciliation is necessary and discovery requires
accepted + quarantined = input with per-run manifests.

Correction: counts alone are insufficient and would pass the worst silent
corruptions. A 1904-epoch misread preserves every row while shifting all dates
−1462 days; a locale flip preserves every row while swapping day/month; a
dialect misdetect can preserve row counts while scrambling columns. P6's check
must therefore be the first of a reconciliation suite: row counts (accepted,
quarantined, total), per-column type distribution + null rate, key-uniqueness
and required-field rates, date/numeric range checks, and manifest diff (input
hashes, pinned contract version, engine versions). Any suite failure blocks
silent replay and routes to preview diff, not to auto-accept. Provenance (M7):
the blocking-suite composition (distributions, key/range rates, manifest diff
as replay gate) is introduced here as part of the correction; discovery
supplied counts, manifests, and per-field errors.

---

## 5. Consolidated build plan (retained findings, self-contained)

### 5.1 Import flow (first run)
1. Connect: pick CSV(s)/workbook(s). Detect encoding over a bounded window
   with confidence shown; the detector is an explicitly open choice (M9:
   `chardet` / `charset-normalizer` confirmed-existing candidates [R04], pick
   by the V6 matrix) and UTF-8-with-replacement is a candidate last resort,
   labelled as such — neither is a decision yet.
2. Detect dialect + header on a bounded sample (CleverCSV-style scored search
   or engine sniffer on the sample — detector choice stays open per U1); show
   candidates + scores; user confirms. NEVER full-file dialect search by
   default (large-file crawl hazard; full-file scored search is
   unbounded/crawl by cost shape, M3).
3. Detect types on a visible sample window (window size + engine + head-vs-full
   shown, m14; default unpinned pending V1b/V2 ladders, M2/U2); identifiers
   default String; dates require per-column locale+format confirmation (D3);
   Excel path surfaces epoch + serial + format code + rendered text per date
   column and flags raw-serial-60 (M4), pre-1900/overflow cells, and >15-digit
   numeric IDs (M10/D10).
4. Declare missing-value sets per column (proposed from sample, edited by
   analyst, persisted), each explicitly deciding `""` (C04 footgun).
5. Preview: inferred contract + sample rows (raw vs typed side by side) +
   warnings (identifier-numeric, ambiguous dates, epoch, encoding confidence,
   long-ID precision, late-sample risk) + cost-noted escapes (widen sample,
   whole-file scan with the engine-specific warning, M3). Date-format proposals
   come from an open guesser choice (O-b): a locale-aware guessing library
   family or the engine's own parser errors — unevaluated, no benchmark claimed.
6. Run: streaming validate-and-split into ACCEPTED (typed + raw) and
   QUARANTINE (raw + reasons, P4 record shape) with a run manifest (contract
   version, engine versions, windows, counts, hashes). Progress-reporting
   full-file pass; strict by default; lenient re-read only as explicit, logged,
   reversible option (D8).
7. Reconcile (P6 suite): counts + distributions + keys + ranges + manifest
   diff. Failures route to preview, not to silent accept.

### 5.2 Replay flow (next month)
1. Load recipe (P5 contract). Check input drift: added/renamed/missing columns,
   encoding/epoch changes, row-count anomalies.
2. Apply pinned contract WITHOUT re-inference (default). Report drift as
   new/extra/missing with remap prompts (D6); quarantine drift-affected rows.
3. Optional, explicit "re-detect and diff" (D7): runs detection fresh and shows
   a contract diff for the analyst to accept field-by-field; never auto-applies.
4. Write accepted + quarantine + new manifest; V8/V9 govern acceptance.

### 5.3 Memory architecture (modest-laptop constraint, M8)
- Row verbs (filter/select/rename/clean/validate/split) stream in constant
  memory (qsv-style); full-load verbs (sort/dedup/join/frequency) are marked
  heavy with batch/disk-backed paths and OOM prevention.
- SQL/sort/join/export spill through a file-backed embedded store
  (DuckDB-file + temp_directory paradigm) as the DEFAULT for large runs;
  in-memory-only execution is an explicit override capped to small runs (M8 —
  no unenforceable prohibition, no missing threshold). Spill/memory-limit
  behavior is pinned to the chosen engine versions at build; V7 re-runs on
  upgrade.
- Columnar shaping uses lazy plans with projection/predicate pushdown
  (scan-then-collect paradigm) with fewer-columns / chunked fallbacks.
- Whole-file inference is cost-warned (engine-specific, M3) and
  progress-reporting, never silent. pandas-eager is not the large-CSV path
  (O-a).

### 5.4 Preservation and auditability (non-negotiable)
- Dual columns: every typed field keeps its original string; Excel keeps raw
  serial + format code + rendered text + epoch.
- Run manifests persist per run and diff across months.
- Silent leniency is REJECTED as a default: every lenient path is explicit,
  counted, and reversible from quarantine. Demands to simplify this away are
  correctly refused (§8 agreement).

---

## 6. Alternatives, capabilities, decisions, uncertainty (O5 — all retained)

### 6.1 Alternatives retained (not collapsed)
- Engine-per-verb: row-streaming vs columnar-lazy vs SQL-spill kept as an
  explicit per-operation choice. A single-engine plan is a REJECTED simplification.
- Declare-then-check (Frictionless-style schema + validation report + pipeline)
  vs guess-then-patch (sniffers): kept as complementary phases (infer once,
  freeze, replay declaratively).
- Dialect detectors: engine sniffers vs CleverCSV-style scored search vs 2024
  uniformity successors — UNRANKED pending fixtures (V2 ladder). All three
  remain live (U1).
- Encoding detectors: `chardet` / `charset-normalizer` (+ engine-native or
  further candidates at build) — UNRANKED pending the V6 matrix (U7, new per
  M9). Candidate approach (bounded head window + replacement fallback) is not a
  decision.
- Date-format guessers: locale-aware guesser family vs engine-parser-driven
  proposals — OPEN, unevaluated (O-b). Named, not chosen.
- Excel readers: calamine-style epoch-first readers preferred (serial-60
  output verify-before-pinning, M4/U8); openpyxl/LibreOffice styled-write path
  retained as an alternative for round-trip writes, not investigated as the
  read path (m12).
- Commercial benchmarks (Power Query locale pinning with M5 host-floor hedge,
  Tableau scheduled flows) retained as UX bars; Trifacta/EasyMorph/KNIME/Talent
  noted as evaluate-before-building, not deep-dived (evidence absent, honestly
  stated, m12).

### 6.2 Optional capabilities vs user decisions (explicit split)
Optional capabilities (beyond the brief's bar; ship when cheap, never block v1):
E1 scheduled unattended reruns with success/last/next tracking; E2
near-duplicate clustering; E3 reconciliation against external ID services; E4
richer quarantine store views (group-by-rule, fix-and-requeue) incl. P4's
CSV-columns-first container phasing; E5 styled Excel round-trip write; E6
multi-file union/schema-merge preview.

User decisions (no safe silent default; the UI MUST ask or show-and-confirm):
D1 sample-window accept/widen per import (incl. whole-file opt-in knowing the
engine-specific cost); D2 per-column type confirm (esp. identifier-vs-number);
D3 per-column locale + date format + day/month where ambiguous; D4 per-column
missing-value sets + empty-string policy; D5 epoch confirmation for
1904-detected workbooks; D6 drift remap on replay (rename/new/missing columns);
D7 opt-in to re-detect-and-diff; D8 opt-in to any lenient re-read; D9
waive-with-reason for quarantined rows; D10 (new per M10) long-ID precision
confirmation for >15-digit numeric Excel IDs against the source system.

### 6.3 Uncertainty and disagreement (retained, not smoothed)
- U1 best dialect detector unranked (V2 ladder discriminates).
- U2 exact default inference-window numbers unpinned (V1b/V2 sizing ladders
  discriminate; "10k" illustrative only, M2).
- U3 calamine #708 release vehicle unconfirmed (fix commit `71af96a5` exists
  per C03 — upgraded; re-check before pinning an Excel-reader version).
- U4 commercial internals benchmarked on docs/UX only; no traced code fix
  claimed for OpenRefine replay, Frictionless codes, or Prep/M engines.
- U5 laptop floor unknown (4 GB? 8 GB?); streaming-first design makes the exact
  floor less decisive, but V7 must run at the stated floor before release.
- U6 universal missing-token list deliberately not proposed (P3).
- U7 (new, M9) encoding detector unranked (V6 matrix discriminates).
- U8 (new, M4) exact calamine serial-60 conversion output unverified in any
  pass (R03 corroborates the gap); V4 checks the raw serial, reader output
  verified before pinning.
- U9 (new, M10) exact in-file merge/rounding edge behavior for >15-digit Excel
  IDs fixture-verified at build (V5 xlsx-ID arm); the documented 15-significant-
  digit figure itself is primary-sourced [R02], not uncertain.
- U10 (new, M1) DuckDB sampling geometry beyond the documented sequential
  20,480-tuple sample is unconfirmed; a version-pinned source read at build may
  qualify it. Neither multi-offset nor its negation is asserted.
- Disagreement retained: this final disagrees with any thin-plan reading that
  P1/P2/P3 are acceptable as one-line behaviors; the corrections above stand
  even if they enlarge scope, because the one-liners corrupt data silently.

---

## 7. O6 — Validations: executed vs proposed (honestly separated)

### 7.1 EXECUTED in the research pass (read-only observations; no runtime)
Inherited from the draft (E-read-1…8): page fetches with byte counts and
timestamps for DuckDB/Polars/Frictionless/OpenRefine/Microsoft/calamine
evidence (see research source-map for exact operations). Two wording repairs
per the critique's validations audit: items resting on search snippets and
third-party notes (sampling recovery pattern, spill-vs-OOM specifics) are
SNIPPET-OBSERVED, not body-observed (M12); no parser, sniffer, engine, or
fixture was executed; no witness ran (no qualified sandbox claimed in any
stage). Usage/billing: unobserved (null/UNKNOWN).

### 7.2 EXECUTED in this reviser pass (read-only snippet observations; no runtime)
- R-read-1 [R01]: web_search for the DuckDB sniffer post 2026-10-09T19:47Z —
  independently observed the official wording "only executed on a sequential
  sample … 20,480 tuples … 10 DuckDB execution chunks … -1 … sniff the
  complete file" (M1 downgrade corroborated; multi-offset still single-sourced
  to tallyman notes).
- R-read-2 [R02]: web_search for Excel precision 2026-10-09T19:47Z —
  independently observed the Microsoft Support primary: "Excel stores and
  calculates with 15 significant digits of precision" (M10 threshold grounded).
- R-read-3 [R03]: web_search for calamine serial-60 conversion output
  2026-10-09T19:47Z — NEGATIVE result: only generic serial-60 explainers
  returned, no calamine-specific conversion output (M4 "verify before pinning"
  corroborated; V4 checks the raw serial).
- R-read-4 [R04]: web_search for encoding detectors 2026-10-09T19:48Z —
  independently observed `chardet.detect()` as the documented CSV-detection
  recipe and `charset-normalizer` as an existing universal detector + CLI (M9
  candidate list grounded; no benchmark claimed; pick left to V6).
- No page script executed; no installer/binary downloaded; no witness ran.

### 7.3 PROPOSED discriminating validations (none executed; build/run next)
Each maps to its P disposition and states pass/fail crisply.

- V1a tail-type recovery → P1. 30k-row CSV, column numeric 25k rows then
  `1e5`/text. PASS: default-window run quarantines the flip row with rule ID
  (no crash, no silent mistype); widened/pinned rerun types correctly. FAIL:
  abort, silent mistype, or silent drop. (Keeps the draft's recovery half.)
- V1b window-sizing ladder → P1/U2 (new per M11). Flips at rows ~500 / 5k /
  15k / 25k × candidate defaults (100 / 1k / illustrative 10k / 20480),
  headless; record which windows catch which flips with what quarantine
  quality. THAT ladder selects the default number (U2) — or shows no bounded
  default suffices, forcing pinned-replay harder. It also tests sampling
  geometry (M1d): run the DuckDB arm at `sample_size` boundaries and record
  whether beyond-window flips are caught, without asserting offset behavior in
  advance.
- V2 dialect-break ladder → P1/U1 (M11). Quoting with embedded commas first at
  rows ~500 / 5k / 15k / 25k × candidate detectors (engine sniffers,
  CleverCSV-style, 2024 successor). PASS: preview flags dialect uncertainty
  with candidates/scores; confirmed dialect parses all rows. FAIL: silent
  column scramble. Selects U1; ladder form mirrors V1b.
- V3 1904-epoch modern-Excel file → P2/O3-primary. 1904-system xlsx saved by
  Excel 2013+ (contains `<x15:workbookPr/>`). Construction (m6): hand-edit the
  flag + x15 element into a fixture, or mirror the upstream regression style
  (`tests/date_1904_extlst.xlsx`, C03) — otherwise V3 is unbuildable as
  specified. PASS: epoch shown as 1904, dates day-correct, raw serials
  preserved. FAIL: −1462-day shift (the #706 symptom).
- V4 serial-60 + pre-1900 + overflow → P2 (M4, m10). Sheet uses one cell of
  EACH representation (text vs serial vs ISO, m10): serial 60, 1899-12-31 text,
  9999-12-31, 10000-01-01. PASS: raw serial == 60 flagged fictitious (checked
  against the preserved raw value, never the reader's converted output, M4);
  pre-1900 kept text+ISO; overflow rejected with reason. FAIL: any silent wrong
  date.
- V5 locale trap + xlsx long-ID precision → P2/P3 (M10 arm added). `01/02/2024`
  under pinned `en-US` vs `en-GB` + ID column `00123`/long IDs + an 18-digit
  xlsx-ID case. PASS: US→Jan 2, GB→Feb 1, both explicit; IDs stay text with raw
  kept; unpinned run quarantines ambiguous dates; >15-digit xlsx IDs raise the
  precision warning with a quarantine/reconciliation rule entry. FAIL: any
  silent locale guess or any silent ID merge.
- V6 encoding + BOM matrix → §5.1/M9/U7. UTF-8/UTF-8-BOM/UTF-16/Windows-1252
  variants × candidate detectors. PASS: correct detection + preview note each
  time; mojibake quarantined; detector pick recorded with per-variant quality.
  FAIL: silent mojibake kept as data. V6 SELECTS the M9 detector choice — say
  so at build.
- V7 memory honesty → laptop constraint (m7). 2 GB-class CSV at the stated
  laptop floor. PASS: streaming verbs flat RSS; heavy verbs spill with progress
  and complete under a memory cap. The `:memory:` variant is NOT a deliberate
  CI OOM: assert it fails fast with a clear error, or document it as a
  manual-only check (m7). FAIL: OOM on the designed path. Re-run on engine
  upgrade (M8).
- V8 month-2 replay with drift → P5/P6. Same recipe + new file (one added, one
  renamed column). PASS: pinned contract applied; added→new (typed+raw,
  confirm); renamed→missing-expected/extra-found + remap; no silent
  re-inference. FAIL: silent re-inference or silent column drop.
- V9 recipe round-trip → P5 (m8, m13). Export → fresh profile (no cache, no
  prior recipe, pinned engine versions installed) → import → rerun. PASS:
  logical equality (row multiset + cell values + rule IDs + counts; manifest
  match except run timestamps/input hashes). Byte-identity is aspirational, not
  required. FAIL: any semantic divergence.
- V10 quarantine comprehension → P4/brief bar (m9). Mini-protocol: n ≥ 3 pilot
  analysts; script = 5 seeded rejects, no prompting; scoring = all 5 reasons
  paraphrased correctly. PASS/FAIL per scoring, not per vibe.

---

## 8. Critique disposition (every criticism: accept / amend / reject / uncertain)

Verdict on the verdict: AGREE. The draft's three blocking corrections stand;
the critique's repairs are evidence-backed, not taste. No disposition is
reversed by this reviser; every repair below is applied in §§1–7 (section
cited). "Accept" = applied as demanded; "amend" = applied with stated
modification; "reject" = refused with evidence; "uncertain" = retained openly.

### 8.1 Material findings M1–M12
- M1 multi-offset single-sourced: ACCEPT. Downgraded to UNCONFIRMED (U10, §2.1);
  offset promises removed from P1 (§4) and preview (§5.1); honest display triple
  (m14); offset behavior tested, not asserted, via the V1b ladder at
  `sample_size` boundaries (§7.3). P1 disposition unchanged. Reviser R01
  independently corroborates the official "sequential sample" wording.
- M2 unevidenced 10k: ACCEPT. Single rule kept in P1 and §5.1: default window
  UNPINNED pending V1b/V2 ladders (U2); every "10k" tagged illustrative
  placeholder. No other "raised" phrasing survives as a decision.
- M3 fused escape cost: ACCEPT. Per-engine cost shapes split in §2.6 and
  applied in P1/P5/§5: DuckDB `-1` ≈ 2.2× per statement on 100 MB
  (third-party estimate, re-measure); Polars `None` = slow full scan,
  memory-loaded, no factor; scored full-file search = unbounded/crawl,
  prohibited by default. Preview shows the engine-specific warning.
- M4 serial-60 reader output unobserved: ACCEPT. Calamine sentence softened to
  "reported to handle; exact output for serial 60 not observed — verify before
  pinning" (§§1.3, 2.3); V4 checks raw serial == 60 (U8). Dual-column design
  (already preserving the raw float) is what makes this fix small. R03
  independently corroborates the observation gap (negative result).
- M5 May-2025 dating secondary-only: ACCEPT. Mechanism kept as benchmark;
  dating hedged to "record form observed in current docs; confirm minimum host
  version at build, positional-culture fallback otherwise" (§§1.4, 2.4, P2).
  P2 disposition unchanged.
- M6 P4 label contradiction: ACCEPT. Relabelled ALREADY-COVERED (intent) +
  CORRECTION (substance) with the full record-shape + accounting requirement in
  the disposition line (§4, P4); CSV-columns-first phasing moved to E4 (§6.2).
  No content lost; the cut-line is unambiguous.
- M7 P6 provenance: ACCEPT. Blocking-suite-introduced-here sentence added to
  P6 (§4); disposition unchanged; post-reveal addition identifiable (M04
  provenance duty).
- M8 memory prohibitions overstated: ACCEPT. Rewritten as default + override
  with a size cap (§2.1, §5.3); "pin spill/memory-limit behavior to chosen
  engine versions at build; re-run V7 on upgrade" added. V7 stays the
  enforcement mechanism.
- M9 encoding-detector gap: ACCEPT. Detector choice explicitly opened (U7, §2.5,
  §5.1, §6.1): `chardet` / `charset-normalizer` confirmed-existing candidates
  [R04], engine-native/further candidates joinable at build, pick by the V6
  matrix; 64 KiB/`replace` demoted to candidate approach. No benchmark numbers
  invented.
- M10 Excel numeric-ID precision loss: ACCEPT and STRENGTHEN. Preview warning
  + quarantine/reconciliation rule + V5 xlsx-ID arm + D10 added (§§2.3, 4/P2,
  5.1, 6.2, 7.3). Threshold: Microsoft Support primary documents 15 significant
  digits [R02] — asserted as documented, not uncertain; only the exact in-file
  merge/rounding edge behavior stays fixture-verified (U9). This goes one step
  beyond the critique's "verify-at-build" because a primary was found in-pass.
- M11 V1 cannot size windows: ACCEPT. V1 split into V1a (recovery, kept) +
  V1b (sizing ladder, new); V2 laddered identically (§7.3). U2 can now close;
  without this it never could.
- M12 secondary/tertiary snippet-level: ACCEPT. Honesty-gradient sentence added
  to §3 intro; "maintainer reproduces" demoted to snippet-reported (m1/M12
  wording, §§2.1, 3.2). O3 stays met on the genuinely traced primary chain.

### 8.2 Minor findings m1–m14
- m1 over-cited abort issues: ACCEPT. Softened to "risks aborting or misreading
  past the window (cf. dialect analogues; type-flip abort confirmed by V1)" in
  §2.1 and P1.
- m2 `try_parse_dates` attribution: ACCEPT. Polars attribution kept attached
  everywhere the knob is named (§§2.2, 4/P1).
- m3 Polars null/empty-string parameter names: ACCEPT (hedge). One-line
  verify-against-pinned-version hedge in §2.2 and P3; no new evidence claimed.
- m4 CleverCSV numbers: ACCEPT (no change). All benchmark figures stay
  qualified as reported (§§1.2, 6.1); the reviser promotes none to S10 facts.
- m5 qsv epoch surfacing: ACCEPT. "qsv-side body not fetched — verify at build"
  hedge in §§1.3, 2.3, 3.1.
- m6 V3 construction: ACCEPT. Construction note added to V3 (hand-edit flag +
  x15, or mirror upstream `tests/date_1904_extlst.xlsx` style, §7.3).
- m7 V7 OOM control hazard: ACCEPT. Capped-spill assertions replace deliberate
  OOM; `:memory:` arm fails-fast or manual-only (§7.3).
- m8 V9 byte-identical too strict: ACCEPT. Relaxed to logical equality +
  manifest match; byte-identity aspirational (§§4/P5, 7.3).
- m9 V10 not a protocol: ACCEPT. Mini-protocol specified (n ≥ 3, script,
  scoring, §7.3).
- m10 V4 representation coverage: ACCEPT. One cell per representation required
  (§7.3).
- m11 "1462 days (4 years + 1 day)": ACCEPT (preserve verbatim). Kept exact in
  §2.3; verified per C05; no change.
- m12 honest non-dives: ACCEPT (preserve). Trifacta/EasyMorph/KNIME/Talent and
  openpyxl-write stay noted-not-dived (§§1.3, 1.4, 6.1); neither inflated nor
  dropped (O5 retention duty).
- m13 fresh-profile definition: ACCEPT. Defined in P5 and V9 (no cache, no
  prior recipe, pinned engines installed).
- m14 sample-window display: ACCEPT. "Offsets" dropped; honest triple window
  size + engine + head-vs-full in §2.1, P1, §5.1.

### 8.3 Omissions O-a / O-b / O-c
- O-a pandas sentence: ACCEPT. One sentence added (§1.2); no benchmarks
  manufactured.
- O-b date-format guessers: ACCEPT. One paragraph added (§2.4): guesser class
  named as open (locale-aware guesser family vs engine-parser-driven
  proposals), unevaluated, no deep dive.
- O-c correctly out of scope: AGREE (no action). Commercial internals,
  S10-owned prior releases, styled-write read path stay honestly
  absent/inapplicable (§3.4); the reviser invents nothing there.

### 8.4 Refused demands (§8) and audits — agreement recorded
- All five §8 refusals AGREED (no runtime execution here; no commercial deep
  dives; no single-engine/universal-token simplification; 1904/x15 handling kept
  as core; CSV-first phasing sound). None re-litigated.
- Per-P audit AGREED: P1/P2/P3/P5/P6 dispositions kept (with the hedges above);
  P4 relabelled per M6. No false correction found by the critic; no REJECTED
  item overturned by this reviser.
- Validations audit AGREED: executed/proposed split kept; E-read snippet
  wording repaired (M12); V-repairs applied (M11, M4, M10, m6–m10); V6
  additionally selects M9; V8 stands; no-runtime honesty preserved — no V-item
  converted to past tense without a run.

### 8.5 Uncertainty retained (not resolved by fiat)
U1, U2, U3 (upgraded: fix commit exists, vehicle unconfirmed), U4, U5, U6 kept;
U7–U10 added (encoding detector, serial-60 output, ID-merge edges, sampling
geometry). Each names the validation that closes it. Nothing uncertain is
presented as decided anywhere in §§1–7.

---

## 9. Close-out and handoff

- O1 met: unfamiliar tools/products/approaches discovered from the brief alone
  and retained complete in §1 (recipe cleaners, declarative contracts,
  three engine families, scored dialect detection + open successor, epoch-aware
  Excel readers, commercial UX benchmarks, five architectural alternatives).
- O2 met: consequential defaults/limits recorded with governing numbers in §2
  (DuckDB 20480 sequential sample + `-1`, Polars 100 + None/0 + files-10,
  Excel serial-60/1462/pre-1900/9999 caps + 15-digit precision, locale/culture
  pinning with host-floor hedge, per-column missing-value sets with the `""`
  footgun, open encoding/dialect/guesser choices, default+override spill).
- O3 met: primary calamine epoch chain genuinely traced incl. fix commit (§3.1);
  secondary/tertiary chains honestly graded snippet-level (M12); absent
  evidence explicitly stated (§3.4).
- O4 met: all six exact P clauses disposed in §4 (correction / already-covered /
  user decision / rejected / uncertain distinguished; P4 relabelled per M6;
  M7 provenance kept).
- O5 met: this file is the one self-contained coherent final; alternatives,
  conditions, constraints, D1–D10/E1–E6/U1–U10 registers, disagreement, and
  uncertainty retained in prose (§6); no section replaced by IDs.
- O6 met: executed read-only checks (research E-reads + reviser R-reads,
  §7.1–7.2) separated from eleven proposed discriminating validations
  (V1a/V1b–V10, §7.3); no runtime claimed; no witness pretended.
- M04 duty met: every supported finding the critique listed (§6 items 1–12:
  P1/P2/P3 corrections + decision splits, P5/P6 scopes, dual preservation +
  manifests, quarantine + accounting, pinned replay + drift UX, engine-per-verb,
  identifier/date defaults + blocking questions, per-column missing sets,
  Excel facts + fix commit, engine defaults minus multi-offset, D/E/U registers
  + disagreement paragraph, O6 honesty) is preserved above or strengthened with
  cited evidence; every criticism is disposed in §8 with evidence, not obedience.
- Build handoff: pin engine/reader/detector versions, then run the V-ladder in
  §7.3 order (V1b/V2 size the windows, V6 picks the encoding detector, V3/V4/V5
  gate Excel/locale correctness, V7 gates the laptop floor, V8/V9 gate replay,
  V10 gates explanation quality). "Verify at build" items: M1 sampling geometry
  (version-pinned source read), M4 serial-60 output, M5 M-engine host floor, M8
  spill pins, m3 Polars parameter names, m5 qsv metadata body, U9 ID-merge
  edges, O-b guesser pick.

