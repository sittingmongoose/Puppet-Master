# Final — S10 data-import desktop assistant (complete planning deliverable)

Stage: A-M04-B / treatment / reviser. Method M04 v1 (amendment-preservation).
Case S10 brief: desktop import assistant for nonprofit analysts combining large
CSVs, occasional Excel workbooks, inconsistent dates/identifiers; preview
inference, preserve originals, explain rejections, repeat monthly.

This file is the complete self-contained final. It applies targeted
evidence-backed amendments to the research draft in light of the full critique,
re-checks every retained material finding and condition, and covers brief
obligations O1–O6 and every exact P clause. Source IDs annotate claims
(R01–R07 reviser-owned in `source-map.json` + `sources/`; S01–S11 predecessor
and C01–C03 critic evidence inspected in place, cited as such); the prose below
is self-contained and does not depend on resolving them.

Disposition vocabulary (retained from draft): correction (P clause is
wrong/incomplete as stated; amended form given), optional enhancement (P clause
stands; improvement proposed), user decision (analyst must choose; product must
ask, not guess), already-covered (discovery independently reached it), rejected
(do not do), uncertain (evidence insufficient).

## 1. Product definition (retained, amended)

A local-first desktop import assistant for nonprofit analysts who combine
large CSV files and occasional Excel workbooks with inconsistent dates and
identifiers, on modest laptops. It must: (1) preview dialect/header/type/date
inference as disclosed hypotheses with alternatives before committing;
(2) preserve every original string alongside its parsed value and the rule
that produced it; (3) explain every rejected row in analyst terms with a path
to fix and re-run, under an explicit run-level policy; (4) replay the
identical transformation next month from a saved, portable, versioned recipe,
reporting drift instead of silently re-guessing.

## 2. Exact per-P disposition (O4)

### P1: "Infer column types from the first 1,000 rows." — CORRECTION

A fixed 1,000-row prefix window is arbitrary and weaker than the evidence.
Observed practice spans a 100-row window (Polars `infer_schema_length=100`
[S03 predecessor]) to a 20,480-line sniff sample (DuckDB `sample_size` [S04
predecessor, R02]), and both vendors document mis-inference when the decisive
values appear after the window (Polars' own remedy: raise the window or pin
`schema_overrides` [S03 predecessor]). A prefix-only sample additionally
misses late-file type flips, trailing garbage rows, and monthly drift.

Amended requirement: ingest strings-first (all-text read, then explicit
ordered casts per column), infer from a STRATIFIED disclosed sample — head
window PLUS systematic (every-kth) and tail windows with row positions
recorded, plus an optional reservoir draw for mixture estimates (the xsv
`sample` pattern: memory proportional to the sample, not the file [S05
predecessor]) — present each inference as a hypothesis with confidence and
runners-up (dialect tie-breaks exist in every sniffer, e.g. the stdlib's
fixed preferred-delimiter order [S01 predecessor]), surface positional
conflicts ("numeric until row R, then text") as a distinct hypothesis from
mixture, and pin the analyst-confirmed schema into the repeat recipe. The
inference window and sample plan are displayed, not silent. The retained
finding is that bounded-window inference is legitimate when its bounds are
disclosed; what is rejected is the magic number 1,000 applied silently to a
prefix. (Amendment AM-P1: reservoir-only replaced by stratified disclosure
per critic M5, accepted.)

### P2: "Parse date strings using the machine locale." — CORRECTION (+ user decision)

Rejected as stated: the machine locale is non-portable (analyst laptop vs
colleague laptop vs next month's OS update), non-repeatable, and ambiguous
(DD/MM vs MM/DD is decided by US-default `dayfirst=False` in pandas [S09
predecessor]; decimal comma vs decimal point changes numeric parsing [S03/S04/S09
predecessor]; currency/percent-decorated numbers need an explicit
`bareNumber`-style policy [S07 predecessor]). No selected engine defaults to
the machine locale (all default US/ISO [S03/S04/S09 predecessor]) — the
evidence actively contradicts P2-as-stated. A transformation that depends on
ambient machine settings cannot satisfy "repeat the same transformation next
month".

Amended requirement: capture an explicit per-source locale profile at import
time — date orders and accepted formats, decimal/thousands separators,
encoding declaration, NA-token policy, timezone policy and two-digit-year
pivot (see D8) — preview its effect on real cells (showing DD/MM-vs-MM/DD
conflicts per column), and store it in the repeat recipe. The machine locale
may seed the INITIAL suggestion only (optional enhancement), clearly labeled,
and the analyst's confirmation or override is a recorded user decision, after
which the stored profile — never the ambient locale — governs replays. Excel
serials follow the workbook's own date system: the 1904 flag is read from
`workbookPr`/`date1904` into `Workbook.epoch` (exactly `WINDOWS_EPOCH` or
`MAC_EPOCH`, else `ValueError`) [R04]; conversion uses epoch 1899-12-30
(1900 system) or `MAC_EPOCH` 1904-01-01 (1904 system) [R05]; serial 60 (the fictitious 1900-02-29) is the pinned boundary value —
`from_excel(60)` takes no +1 branch and collapses to 1900-02-28, so a literal
60 in a 1900-system workbook is flagged explicitly, never converted silently
[R05]; the documented 1900 leap-year replication is preserved per Microsoft's
compatibility account [S02 predecessor, C03 critic]. Pre-1900-03-01 behavior
is documented in-product (condition C1).

### P3: "Convert missing values to null." — CORRECTION (+ user decision)

Too blunt as stated. Evidence distinguishes the physical representation
(what tokens count as missing: `missingValues` [S07 predecessor]) from the
logical one (what constraints apply after: `constraints` [S07 predecessor]);
real parsers expose exactly this split (pandas' four-way `keep_default_na`/
`na_values` matrix [S09 predecessor], Polars' `null_values` +
`empty_string_is_null=True` default [S03 predecessor], DuckDB's `nullstr` +
`force_not_null` + `allow_quoted_nulls` [R02]). A global "convert missing to
null" silently destroys identifier-like strings that collide with default NA
tokens and conflates empty, whitespace-only, and quoted-empty cells. In
particular, DuckDB's default NULLS quoted-empty cells
(`allow_quoted_nulls=true` [R02]), so adopting a DuckDB-class engine without
flipping this parameter is LESS strict than this amendment promises.

Amended requirement: per-column missing-value allowlists, previewed against
real values with collision warnings (values that WOULD be nulled are shown
before anything is nulled), originals always preserved, and ambiguous tokens
resolved by analyst choice (user decision) recorded in the recipe. Defaults
start strict (narrow, explicit token sets; `bareNumber` strict-true posture
[S07 predecessor] unless the analyst approves per-column false; DuckDB-class
strict profile explicitly sets per-column `nullstr` + `force_not_null` +
`allow_quoted_nulls=false`) and widen only by analyst action.
Identifier-hygiene rules ride with this amendment (condition C6): ID-typed
columns are never numeric-cast (leading zeros preserved), with per-column
whitespace/case policy and max-length checks. (Amendments AM-P3a/AM-P3b:
citation repaired to R02 and NULL-default interaction added per critic M3,
accepted; `bareNumber` posture per minor m3, accepted.)

### P4: "Keep failed rows in an error CSV." — ALREADY-COVERED IN INTENT, WITH CORRECTION OF FORM (+ optional enhancement)

Discovery independently required rejections-as-data on the DuckDB
`store_rejects` model [S04 predecessor, R01]. The store is now pinned: two
temporary tables, `reject_scans` (scanner parameters) and `reject_errors`
(one row per error: `scan_id`, `file_id`, `line` number, `line_byte_position`,
`byte_position`, `column_idx`/`column_name` when column-specific,
`error_type`, `csv_line` original line text, `error_message`) [R01]. An error
CSV is retained as a required EXPORT format, but the store itself is the
queryable run table — because "understand rejected rows" needs reasons and
provenance, not just the rows. The product MUST map engine `error_type`/
`error_message` wording to analyst-language reason text (R01's messages are
engine wording, e.g. CAST failures) and record original line number + raw
text + column-level reasons per row. Enhancement: one-click error-CSV export
plus re-import-after-fix loop (fix the CSV, re-run the same recipe against
it). Run-level behavior (thresholds, warn-vs-abort) is condition C7.
(Amendments AM-P4a/AM-P4b: label corrected to match P5's taxonomy and schema
pinned to R01 per critic M7/M2, both accepted.)

### P5: "Save transformation settings." — ALREADY-COVERED, WITH CORRECTION OF FORM

Discovery independently required a repeat recipe as artifact with OpenRefine's
operation-history replay ("replay your operation history on a new version of
it" [S08 predecessor]) as the UX reference. The correction is to the word
"settings", which invites an opaque blob: the recipe MUST be a versioned,
human-readable, portable JSON document — Table Schema fields/types/formats/
constraints plus CSV Dialect plus missing-values policy [S07 predecessor for
THIS portion only] AND product-defined extensions specified here (not in the
spec): the locale profile (§2 P2), the ordered cast list (§3.1), and engine
versions/pins (condition C2) — so that next month's run replays
decision-identical transformations and reports drift (new values, schema
changes, count deltas) rather than re-guessing. Recipes are diffable,
emailable, and auditable. OpenRefine operation history is project-bound BY
DEFAULT but JSON-extractable with limits (Extract/Apply JSON; undone
operations excluded; single-cell edits not replicable) [R03] — so it is
retained as a convenience layer ABOVE the recipe (alternative A4), never
instead of it: what operation lists lack is declarative schema/dialect,
diffability, engine pins, and a locale profile. (Amendments AM-P5a/AM-P5b:
justification rewritten per critic M1 and citation split per critic M10,
both accepted; "decision-identical" wording per minor m1/m2, accepted.)

### P6: "Compare output row counts with inputs." — CORRECTION (expand, not remove)

Row-count comparison is necessary but insufficient: equal counts can hide
compensating drops and dupes, and counts say nothing about column-level
damage. Amended requirement: a full reconciliation report per run — (a)
BUCKET ACCOUNTING: input rows = accepted + rejected + skipped
(header/comments/blank), each bucket explained, plus per-column
acceptance/rejection rates and count/ratio drift alerts against the previous
month's run; and (b) an IDEMPOTENCE/AUDIT HASH proving rerun identity ("same
file, same decisions", tamper/audit identity, drift-report input) — SHA-256
over a stated normalized form (normalization choice recorded as an explicit
builder decision: raw bytes vs preserved-original cells, encoding/newline/
quoting rules, per-file vs per-column scope). Monthly replay input is
different data by definition, so the hash proves rerun idempotence, NOT
month-to-month sameness. The P6 count check is retained as the minimum row of
that report. (Amendment AM-P6: hash concept split per critic M6, accepted.)

## 3. Retained architecture (amended by §2)

1. Strings-first pipeline: read everything as text (DuckDB `all_varchar`
   [S04 predecessor] / Polars `infer_schema=False` [S03 predecessor] /
   pandas `dtype=str` + explicit NA policy [S09 predecessor] class of
   modes), then apply a visible ordered cast list; every cell keeps original
   string + parsed value + producing rule.
2. Inference as disclosed hypotheses: dialect, header, types, date orders,
   NA sets — each with confidence, runners-up, positional-conflict flags,
   and the stratified sample that produced it (head + systematic + tail
   with positions, optional reservoir for mixture [S05 predecessor, AM-P1]);
   nothing applied silently.
3. Rejections as queryable data with analyst-readable reasons (§2 P4; store
   schema pinned [R01]); error-CSV export and fix-and-rerun loop included;
   run-level policy per C7.
4. Memory discipline for modest laptops: index/sample/slice previews without
   loading (qsv-class maintained fork lineage [R06] or in-product
   reimplementation of the pattern); streaming Excel reads with dimension
   verification (`calculate_dimension`/`reset_dimensions` [S06 predecessor])
   and explicit workbook close; chunked/out-of-core full passes; full-file
   in-memory frames only as fallback. Note pandas builds the whole
   DataFrame "regardless" of `low_memory` [S09 predecessor] — chunk via
   `chunksize`/`iterator` or choose another engine for big files.
5. Repeat recipe as portable versioned JSON (§2 P5; Table Schema shape [S07
   predecessor] + product extensions defined here) with drift reporting on
   replay; OpenRefine-style replay UX [S08 predecessor] and JSON
   Extract/Apply convenience [R03].
6. Per-source locale profile (§2 P2/P3 + D8): separators, date specs,
   encoding declaration, NA policy, timezone/two-digit-year policy —
   captured once, stored, never re-guessed.
7. Reconciliation report per run (§2 P6): bucket accounting + per-column
   rates + idempotence/audit hash + drift alerts.

## 4. Conditions and constraints (must hold)

- C1 Excel-date correctness: honor the workbook's 1900/1904 date-system
  flag via the `workbookPr`/`date1904` → `Workbook.epoch` path (exactly
  `WINDOWS_EPOCH`/`MAC_EPOCH`, else error) [R04]; epochs 1899-12-30 /
  1904-01-01 [R05]; replicate (never "fix") the 1900 leap-year bug per
  Microsoft's compatibility account [S02 predecessor]; serial 60 is the
  pinned boundary (collapses to 1900-02-28 on naive conversion) and is
  flagged explicitly [R05]; pre-1900-03-01 behavior documented in-product.
  (Pinned per critic M4 — accepted and resolved with code oracles.)
- C2 Engine pins recorded: every recipe records engine name + version +
  non-default options (Polars' `use_pyarrow` changes date/type semantics
  [S03 predecessor]; DuckDB "current"-doc defaults such as `sample_size`/
  `header` carry drift RISK [R02] — labeled risk, not observed fact per
  minor m2); replay warns on engine change.
- C3 Encoding path: UTF-8/16/Latin-1 natively in the DuckDB class of engines
  [S04 predecessor, R02]; legacy nonprofit encodings go through explicit
  conversion (extension/`iconv` class of path) with a previewed mapping,
  never silent mojibake; pandas-class strict failures
  (`encoding_errors='strict'` [S09 predecessor]) surface as explained
  rejections. Detection decision (per critic M8(b), accepted in
  decide-don't-defer form): DECLARE, DON'T DETECT — the analyst declares
  the encoding per source (seeded by BOM sniffing for UTF variants only),
  previewed on real cells with a conversion offer; a detection library
  (charset guesser + confidence + override UX) is explicitly deferred to a
  later stage, not silently assumed.
- C4 Line/field caps disclosed: 2 MB DuckDB line cap class of limit [R02]
  and the stdlib field-size limit [S01 predecessor] are surfaced when hit,
  with tuning guidance — long free-text rows must fail loudly, never
  truncate silently.
- C5 Local-first privacy posture per the OpenRefine reference ("cleaned on
  your machine" [S08 predecessor]); no cloud round-trip required for any
  core flow.
- C6 Identifier hygiene (new, per omission O-b — accepted): ID-typed
  columns are never numeric-cast (leading zeros in ZIPs/IDs preserved by
  strings-first plus an explicit no-cast rule); per-column whitespace-trim
  and case-normalization policy (default: preserve, normalize only by
  analyst rule); max-identifier-length check with overflow routed to
  rejects; NA-collision preview mandatory before any nulling in ID columns
  (§2 P3).
- C7 Run-level rejection policy (new, per omission O-d — accepted):
  per-type severity (structural errors abort-or-quarantine by default;
  cell-level cast failures quarantine by default); a configurable reject
  threshold (default proposed: abort the run for analyst review when
  rejects exceed 5% of input rows OR any structural error appears in the
  first 100 rows — tunable, recorded in the recipe); every abort/quarantine
  decision appears in the reconciliation report (§2 P6). V4 fixtures gate
  on this policy.

## 5. Alternatives retained (not chosen as default, kept viable)

- A1 Strict-frame engine (Polars-class): a fast strict in-memory path, but
  strict RFC 4180 expectations ("malformed data... may lead to undefined
  behavior" [S03 predecessor]) make it the wrong DEFAULT for messy files;
  retained for clean, validated, or post-rejection datasets and for the
  strict per-column mode. ("Fastest" superlative removed per critic M9 —
  accepted; no benchmark primary in evidence.)
- A2 pandas-based transport: justified only under the safe profile
  (`dtype=str`, explicit NA/date/chunk policy [S09 predecessor]); retained
  for shops with existing pandas code to interoperate with, not as the
  inference engine.
- A3 Streaming/indexed power flow (qsv-class maintained fork [R06]):
  xsv proper is archived/read-only since Apr 24, 2025 and is NOT retained
  as an engine; retained instead is the streaming/index/compose PATTERN via
  the maintained qsv fork lineage (forked Sept 2021, ships prebuilt
  binaries with index/sample/slice/stats) pinned to a qsv release at
  build, or reimplemented in-product. Escape hatch for huge files and
  scriptable analysts; the GUI may embed the same pattern under the hood.
  (Re-based per critic M8(c)/M9 — accepted; closes U3.)
- A4 Project-bound history replay with JSON extract/apply (OpenRefine-class
  [S08 predecessor, R03]) as a UX convenience layer above — never instead
  of — the portable recipe. Portable by explicit Extract/Apply action with
  stated limits (no single-cell edits, no undone ops); JSON schema
  stability across OpenRefine versions unverified (new uncertainty U8).
  (Rewritten per critic M1 — accepted.)

## 6. Optional capabilities (explicitly optional, not required)

- O-a Machine-locale seeding of the initial locale suggestion (§2 P2),
  labeled and overridable.
- O-b Clustering/merge-suggestion for near-duplicate identifier values
  (OpenRefine clustering class [S08 predecessor]) — suggest only, analyst
  approves each merge; off by default; every merge previewed and undoable,
  and confirmed merges NEVER auto-apply on replay (re-suggested against
  new values instead). (Safety additions per minor m5 — accepted.)
- O-c Reconciliation against external reference data (OpenRefine
  reconciliation class [S08 predecessor]) — a later phase, not this brief.
- O-d Faceted exploration of accepted/rejected partitions pre/post-run
  (OpenRefine facets class [S08 predecessor]) — recommended for the
  rejection-review UI.

## 7. User decisions (the product must ask; never guess)

- D1 Header present/absent + dialect runner-up choice (cf. tie-breaks [S01
  predecessor], `header` defaults [S04/S09 predecessor]).
- D2 Per-column type pins where confidence is low or samples conflict.
- D3 Locale profile confirmation: date orders/formats, separators, encoding
  declaration (§2 P2, C3).
- D4 Ambiguous missing-value tokens (§2 P3), including the DuckDB-class
  `nullstr`/`force_not_null`/`allow_quoted_nulls` strict profile choice.
- D5 Monthly replay drift adjudication: accept-new-values vs quarantine
  (recipe replay, §2 P5).
- D6 Engine/version upgrades affecting replay (C2).
- D7 Workbook sheet/table selection (new, per omission O-c — accepted):
  which sheet(s) of a multi-sheet workbook, named tables vs used-range,
  hidden-sheet policy — chosen at import, stored in the recipe, re-asked on
  drift (renamed/missing sheets).
- D8 Date extras policy (new, per omission O-a — accepted): timezone-aware
  vs naive handling (default proposed: preserve naive, tag tz-aware with
  offset, never silently convert zones), DST fold/ambiguity handling, and
  the two-digit-year pivot (no pivot guessed — analyst sets it per source,
  previewed; the product suggests documenting the choice, not the value).

## 8. Criticism dispositions (every finding adjudicated on evidence)

Verdict scale: ACCEPT (change made as directed), AMEND (change made in
modified form), REJECT (finding rebutted with evidence), RETAIN UNCERTAINTY
(kept open with reason). No finding was obeyed automatically; each was
checked against predecessor evidence, critic evidence, or a fresh reviser
primary (R01–R07).

### Material findings

- M1 OpenRefine non-portability overstatement — ACCEPT. Fresh primary R03
  confirms portable JSON Extract/Apply with limits (no single-cell edits, no
  undone ops). P5 disposition (already-covered with correction of form)
  STANDS; its justification is rewritten (§2 P5, §5 A4) and re-grounded on
  what operation lists lack. New uncertainty U8 (JSON schema stability)
  recorded; no forward-compat asserted.
- M2 Rejects-table schema asserted without evidence — ACCEPT, and the
  fetched page vindicates the substance. Fresh primary R01 pins the schema:
  `line`, `csv_line` (original raw text), `column_idx`/`column_name`,
  `error_type` + `error_message`, byte positions, one row per error. §2 P4
  and §3.3 are now grounded in R01; the added product requirement is the
  analyst-language mapping over engine `error_message` wording. V4 pass
  criteria (§10) updated to match.
- M3 P3 NULL-params gap + `allow_quoted_nulls` interaction — ACCEPT on
  both parts. (a) Citation repaired: the params are now evidenced by R02,
  not the S04 extract that lacked them. (b) The DuckDB default
  (`allow_quoted_nulls=true` NULLS quoted-empty) is added to the P3
  amendment with an explicit per-column strict profile
  (`nullstr`/`force_not_null`/`allow_quoted_nulls=false`). No uncertainty
  on existence/defaults (verbatim in R02).
- M4 1904-flag path / serial 60 / epoch unsourced-or-inferred — ACCEPT in
  direction, then RESOLVED with code oracles rather than merely downgraded.
  R04 pins the flag path (`workbookPr`/`date1904` → `Workbook.epoch`, two
  allowed values); R05 pins both epochs and the serial-60 pivot code with a
  checked oracle (literal 60 in a 1900-system workbook denotes the
  fictitious date and collapses to Feb 28 — flag, don't silently convert).
  C1 is therefore fully pinned for openpyxl-class engines (not conditional),
  and V3's Excel half is specifiable, gated only on the final engine
  choice. U5 is narrowed to that choice plus `read_only`-mode flag
  exposure (unverified on any page; checked at build).
- M5 Reservoir-only sampling loses positional signal — ACCEPT. §2 P1 and
  §3.2 now require stratified disclosure (head + systematic + tail with
  positions, optional reservoir for mixture) with positional conflicts as a
  distinct hypothesis. V1 tests stratification. Strata counts remain a
  tuning choice (proposed, not pinned).
- M6 Monthly-hash concept confused/unspecifiable — ACCEPT. §2 P6, §3.7 and
  V6 are split: (a) bucket accounting catches the compensating drop/dupe
  trap; (b) a SHA-256 idempotence/audit hash over a stated normalized form
  proves rerun identity. Normalization choice is a recorded builder
  decision; the conceptual split is fixed.
- M7 P4 disposition label wrong — ACCEPT. P4 is relabeled "already-covered
  in intent, with correction of form", matching P5; substance unchanged.
  No evidence uncertainty.
- M8 Material discovery gaps — ACCEPT on all three, with (b) in
  decide-don't-defer form: (a) Power Query comparison added (repeatable
  M-script queries + host-owned refresh [R07]; differentiation §11);
  (b) encoding decision made — declare-don't-detect with BOM seeding and
  previewed conversion (C3); a detection library is explicitly deferred,
  not assumed; (c) xsv pin-or-fork RESOLVED — xsv is archived/read-only,
  A3 re-based on the maintained qsv fork lineage or in-product
  reimplementation [R06]; U3 closed.
- M9 "Fastest" unsourced; A3/U3 tension — ACCEPT. A1 now reads "fast
  strict in-memory path" with the superlative removed and the reason
  stated; A3's tension is resolved by R06 (no reliance on unpinned xsv).
- M10 P5 cites [S07] for design the spec lacks — ACCEPT. §2 P5 splits the
  citation: [S07 predecessor] for schema/dialect/missingValues shape only;
  locale profile, cast list, engine pins labeled product extensions defined
  here; V5's recipe labeled product-defined.

### Per-P verdicts

All six critic per-P verdicts are concurred with: P1/P2/P3 correction
directions stand (with M5/M4/M3 repairs applied); P4 substance stands with
M7 relabel + M2 sourcing; P5 stands with M1/M10 repairs; P6 expansion
stands with M6 split. No disposition required full reversal; O4 coverage is
6/6 with exact quotes (§2).

### Omissions O-a–O-e

- O-a Timezones/DST/two-digit years — ACCEPT as new user decision D8 (no
  pivot or zone conversion guessed).
- O-b Identifier semantics — ACCEPT as new condition C6 (no-cast rule for
  ID columns, whitespace/case policy, max-length checks).
- O-c Sheet/table selection — ACCEPT as new user decision D7.
- O-d Quarantine vs hard-fail policy — ACCEPT as new condition C7 with a
  proposed default threshold; V4 gates on it.
- O-e Desktop packaging — ACCEPT as scoped later-stage work: U7 now states
  the explicit scope (installer size, auto-update, offline use) instead of
  re-punting it vaguely.

### Minors m1–m8

- m1 ACCEPT: "D6 Engine/version" spacing fixed (§7); V5 reads
  "decision-identical replay".
- m2 ACCEPT: C2 drift labeled risk, not observed fact.
- m3 ACCEPT: strict-true `bareNumber` starting posture stated in §2 P3.
- m4 RETAIN UNCERTAINTY (deferred, not rejected): Chain C remains a
  mature-state synthesis; no pandas issue/changelog primary was fetched in
  this stage's time budget, so the versioned anchor is recorded as
  explicitly deferred hardening in §11 rather than asserted. Not blocking.
- m5 ACCEPT: O-b gains preview + undo + never-auto-apply-on-replay.
- m6 ACCEPT: V4 states per-fixture expectations (legacy encodings =
  explained rejection with conversion offer, never silent auto-convert)
  and severity policy via C7.
- m7 ACCEPT: V7 and V8 each gain a one-paragraph scope (RAM profile/byte
  bound/fixtures/close-assertions; diff target + warn/fail policy).
- m8 ACCEPT: build-time resolutions listed (U1 interpreter/docs check, U2
  pinned-build NA list, `max_line_size` runtime-settability on the chosen
  DuckDB binding).

### What was not disputed — preserved

P1/P2/P3/P6 correction directions; P4/P5 retention substance;
strings-first pipeline; inference-as-disclosed-hypotheses; locale profiles
in the recipe; reconciliation bucket accounting; drift-on-replay over
silent re-guess; local-first posture; O5 retention of
alternatives/conditions/uncertainty in self-contained prose; O6
executed/proposed honesty. All are preserved above with their amendments.

## 9. Uncertainty (carried, narrowed, or closed)

- U1 stdlib `field_size_limit` numeric default/exception type — CARRIED
  (unchanged): verify against the target interpreter/docs at build [S01
  predecessor]. Cheap; not blocking.
- U2 pandas default NA token list — CARRIED (unchanged): matrix observed
  [S09 predecessor], list not fetched; verify against the pinned build
  before final identifier guidance; identifier wording stays conditional.
- U3 xsv maintenance/version — CLOSED by R06: xsv archived Apr 24, 2025
  (read-only), latest 0.13.0; retention re-based on qsv lineage. No
  residual uncertainty on the decision; qsv release pin chosen at build.
- U4 DuckDB "current"-doc drift — CARRIED with fresh pins: R01/R02 values
  are the reviser-stage pins; re-pin at build. Labeled risk (m2).
- U5 1904 flag path — NARROWED by R04/R05 to: (a) final Excel engine
  choice, (b) flag exposure in that engine's streaming mode. Everything
  else (flag location, epochs, serial pivot) is now pinned.
- U6 No performance claims executed — CARRIED (unchanged): all speed/memory
  figures remain sourced documentation claims; A1 superlative removed (M9)
  so nothing else contradicts it.
- U7 Desktop packaging — CARRIED with explicit scope (O-e): engines are
  local-first consistent with [S08 predecessor]; a later stage MUST scope
  installer size, auto-update, and offline use.
- U8 OpenRefine JSON schema stability (new, per M1) — CARRIED: Extract/Apply
  JSON verified [R03]; cross-version stability unverified; A4 makes no
  forward-compat claim.

## 10. Validations: executed vs proposed (O6)

EXECUTED in this reviser stage: 7 fresh primary-source fetches (HTTP 200)
with verbatim extraction into sources/ + navigable sources/index.md,
1 recorded 403 (GitHub API latest-release endpoint; replaced by the releases
HTML page + repo README primaries), independent re-verification of the
load-bearing predecessor/critic rows touched by amendments (rejects schema,
NULL params, OpenRefine reuse, openpyxl flag/epochs, xsv/qsv maintenance,
Power Query model), and this per-criticism adjudication. No code executed;
no witness ran — no qualified sandbox was claimed in this stage, so nothing
below is presented as executed. Prior stages' executed checks (11
predecessor fetches + 1 recorded 404; 3 critic fetches) are preserved as
reported, not re-claimed.

PROPOSED discriminating validations (each fails a distinct wrong design; to
run with a runtime + pinned engines):

- V1 Late-flip inference: CSVs clean for the first 100 / 1,000 / 20,480 rows
  then introducing text in numeric columns and new date formats at rows 101,
  1,001, and 20,481. Discriminates: prefix-window inference (P1-as-stated,
  Polars-default) vs STRATIFIED inference (§2 P1). Pass = flip detected with
  positional alert ("numeric until row R, then text"), mixture-vs-drift
  distinguished, analyst alerted; fail = silent mis-type or crash.
  (Applicability: stratified-vs-reservoir discrimination added per M5.)
- V2 NA-collision identifiers: ID columns containing default-NA-colliding
  tokens and empty/whitespace/quoted-empty variants, PLUS the DuckDB-class
  NULL-default cases (quoted-empty under `allow_quoted_nulls=true` vs
  false; `force_not_null` columns; custom `nullstr`) [R02]. Discriminates:
  global null coercion (P3-as-stated, pandas-default) vs per-column
  allowlists (§2 P3). Pass = zero silent nulls, collisions previewed.
- V3 Date-order grid + Excel serials: DD/MM vs MM/DD ambiguous columns
  (01/02/2025 class), mixed-format columns, Excel serials spanning serial
  60, and a 1904-system workbook. Discriminates: machine-locale parsing
  (P2-as-stated) vs stored locale profile + workbook date system (§2 P2,
  C1). Oracles now pinned: flag read via `workbookPr`/`date1904` [R04],
  epochs and serial-60 boundary [R05], 1462-day offset [C03 critic]. Pass =
  conflicts shown per column, serials convert per flag, serial 60 flagged,
  1900-bug behavior documented. APPLICABLE once the Excel engine is pinned
  (M4 gate lifted from "not executable" to "engine-pin precondition").
- V4 Rejection accountability: malformed rows (ragged, bad quotes, 2 MB+
  lines, legacy encoding, dimension-lying workbook). Discriminates: error
  CSV dump (P4-as-stated) vs queryable rejects with reasons (§2 P4, C3/C4/
  C7). Per-fixture expectations: legacy encodings = explained rejection
  with conversion offer (never silent auto-convert); 2 MB+ fixture targets
  the DuckDB-class path [R02]; severity/threshold behavior follows C7.
  Pass = every dropped row accounted with analyst-language reason +
  original text + line number (store schema [R01]).
- V5 Monthly replay drift: run recipe month 1, then month-2 files with new
  values, a renamed column, and a changed row count. Discriminates: saved
  settings blob (P5-as-stated) vs versioned PRODUCT-DEFINED recipe + drift
  report (§2 P5, M10). Pass = decision-identical replay on unchanged parts,
  drift items queued for D5 adjudication. (Wording fixed per m1.)
- V6 Reconciliation trap: inputs engineered so output counts match while
  content differs (compensating drop/dupe). Split per M6: (a) trap caught
  by bucket accounting + per-column rates (§2 P6a) — this half runs now and
  is the real trap test; (b) rerun-report verified by the SHA-256
  idempotence/audit hash over the stated normalized form (§2 P6b).
- V7 Memory ceiling: largest-CSV + largest-workbook fixtures processed on
  a modest-RAM profile with previews first. Scope (per m7): proposed
  profile = 8 GB laptop, no single preview over 512 MB resident, full pass
  streams or chunks with bounded peak (bound recorded at build per engine);
  fixtures sized above RAM-comfortable in-memory frames (e.g. CSV larger
  than available RAM after OS); close/dispose asserted per engine
  (workbook close, index handle release). Discriminates streaming/indexed
  path (§3.4) vs whole-file frames. Pass = preview without full load,
  bounded peak memory, explicit close/dispose.
- V8 Engine-drift replay: same recipe replayed under a bumped engine
  version. Scope (per m7): diff target = decision log + per-cell values +
  output bytes, in that priority; policy = warn on any engine change (C2),
  fail the replay-compare step on decision-log divergence, warn-only on
  byte-identical outputs. Pass = version mismatch warned, results diffed,
  no silent semantic change.

## 11. Discovery record (O1/O2/O3 preserved, amended)

O1 unfamiliar tools, products, and approaches (beyond the thin plan):
streaming + indexed CSV processing (xsv PATTERN re-based on the maintained
qsv fork lineage [R06]); in-process SQL over files with sniffer + rejects
tables (DuckDB [S04 predecessor, R01/R02]); strict fast frames with a
100-row inference window (Polars [S03 predecessor]); the analysts' default
with hostile defaults (pandas [S09 predecessor]); streaming Excel reads with
dimension verification (openpyxl [S06 predecessor]); flag-aware Excel date
conversion with pinned epochs/pivot (openpyxl [R04/R05]); the portable
repeat recipe (Table Schema [S07 predecessor] + product extensions);
closest competitor OpenRefine (local, faceting, clustering, operation
history with JSON Extract/Apply [S08 predecessor, R03]); second competitor
Power Query (repeatable M-script queries + host-owned refresh in
Excel/Power BI/dataflows [R07] — new in this stage); stdlib csv baseline
semantics and tie-break order [S01 predecessor]. Differentiation space now
rests on two competitor points: host-independence + original-string
provenance + first-class rejection explanations (vs both), and declarative
portable recipes (vs operation lists and host-bound queries).

O2 consequential behavior/defaults (amended contract deltas; undisputed
rows preserved as in the draft's §3/discovery table): DuckDB `sample_size`
20480 / `header` false / 2 MB line cap / rejects params re-pinned [R02];
NULL trio `allow_quoted_nulls=true`, `force_not_null=[]`, `nullstr` empty
added [R02]; rejects schema fully pinned (10 columns incl. `csv_line`,
`error_type`, `error_message`) [R01]; openpyxl epochs + `date1904` flag
path + serial-60 pivot pinned [R04/R05]; qsv fork lineage replaces the xsv
pin [R06]. Rows BEYOND these deltas (Polars 100-row window,
pandas NA/low_memory/dayfirst matrix, openpyxl streaming/dimensions,
stdlib tie-breaks) were re-verified undisputed by the critic and stand.

O3 issue/fix/evolution chains (three, exceeding the one-chain minimum):
Chain A — CSV auto-detection (25+ manual options → multi-hypothesis
sniffer [S10 predecessor]); Chain B — Excel 1900 leap-year bug
(Lotus decision → permanent compat [S02 predecessor] → openpyxl default
epoch [S11 predecessor] → workbook date-system flag [C03 critic] → pinned
flag/epoch/pivot code path [R04/R05]); Chain C — pandas silent-coercion
hazards → documented escapes [S09 predecessor], retained as a
mature-state synthesis with explicitly deferred versioned-anchor hardening
(m4). No runtime reproduction in any stage; each chain is documentation-
evidenced with reproduction checks proposed in §10.

## 12. Native lifecycle (actual calls, no handwritten receipts)

- Native route per input-map.json: `muse`.
- Actual fresh native Goal created in-session: objective referenced this
  assignment + input-map + deliverables + deadline; status `active` at
  creation (goal id `goal-01a12232-cb31-7182-8c96-15f800150fdb`).
- Actual supported calls used/available in this harness: `create_goal`
  (used), `report_progress` (used), `update_goal(status=complete|blocked)`
  (called AFTER this final and all artifacts are saved), `get_goal`
  (available for state reads). No receipt JSON was hand-written; lifecycle
  state lives in the harness.
- All required science (final.md, source-map.json, sources/, per-P
  comparison, per-criticism adjudication) is saved BEFORE terminal Goal
  completion, per the assignment. After terminal completion only mechanical
  delivery remains. Native and T3 completion are separate; unavailable
  fields are UNKNOWN.

## 13. Amendment log (targeted amendments applied)

AM-P1 stratified sampling (M5) · AM-P3a P3 citation repair (M3a) ·
AM-P3b NULL-default interaction (M3b) + `bareNumber` posture (m3) ·
AM-P4a P4 relabel (M7) · AM-P4b rejects schema pin (M2) · AM-P5a P5/A4
justification rewrite (M1) · AM-P5b recipe citation split (M10) · AM-P6
hash split (M6) · C1 pin to code oracles (M4) · A1 superlative removal
(M9) · A3 re-base on qsv lineage (M8c) · Power Query competitor (M8a) ·
encoding declare-don't-detect (M8b) · C6 identifier hygiene (O-b) ·
C7 run policy (O-d) · D7 sheet selection (O-c) · D8 date extras (O-a) ·
U7 scoping (O-e) · V1–V8 applicability repairs (§10) · m1/m2/m5/m6/m7/m8
applied · m4 explicitly deferred (retained uncertainty, §8/§11).
U3 closed; U5 narrowed; U8 opened.
