# Draft — S10 data-import desktop assistant (complete planning deliverable)

Stage: A-M04-B / treatment / research. Method M04 v1 (amendment-preservation).
This draft was written AFTER plan reveal (see plan-reveal.json) and compares
every exact P clause against discovery evidence gathered from the brief alone
(discovery.md, frozen before reveal, never rewritten after). Source IDs
(S01–S11) annotate claims; the prose below is self-contained and does not
depend on resolving them. Evidence bundle: source-map.json + sources/.

## 1. Product definition (retained)

A local-first desktop import assistant for nonprofit analysts who combine
large CSV files and occasional Excel workbooks with inconsistent dates and
identifiers, on modest laptops. It must: (1) preview dialect/header/type/date
inference with alternatives before committing; (2) preserve every original
string alongside its parsed value and the rule that produced it;
(3) explain every rejected row in analyst terms with a path to fix and
re-run; (4) replay the identical transformation next month from a saved,
portable recipe, reporting drift instead of silently re-guessing.

## 2. Exact per-P disposition

Disposition vocabulary: correction (P clause is wrong/incomplete as stated;
amended form given), optional enhancement (P clause stands; improvement
proposed), user decision (analyst must choose; product must ask, not guess),
already-covered (discovery independently reached it), rejected (do not do),
uncertain (evidence insufficient).

### P1: "Infer column types from the first 1,000 rows." — CORRECTION

A fixed 1,000-row prefix window is arbitrary and weaker than the evidence.
Observed practice spans a 100-row window (Polars `infer_schema_length=100`
[S03]) to a 20,480-line sniff sample (DuckDB `sample_size` [S04]), and both
vendors document mis-inference when the decisive values appear after the
window (Polars' own remedy: raise the window or pin `schema_overrides`
[S03]). A prefix-only sample additionally misses late-file type flips,
trailing garbage rows, and monthly drift.

Amended requirement: ingest strings-first (all-text read, then explicit
ordered casts per column), infer from head rows PLUS a reservoir sample drawn
across the whole file (the xsv `sample` pattern: memory proportional to the
sample, not the file [S05]), present each inference as a hypothesis with
confidence and runners-up (dialect tie-breaks exist in every sniffer, e.g.
the stdlib's fixed preferred-delimiter order [S01]), and pin the
analyst-confirmed schema into the repeat recipe. The inference window and
sample plan are displayed, not silent. The retained finding is that
bounded-window inference is legitimate when its bounds are disclosed;
what is rejected is the magic number 1,000 applied silently to a prefix.

### P2: "Parse date strings using the machine locale." — CORRECTION (+ user decision)

Rejected as stated: the machine locale is non-portable (analyst laptop vs
colleague laptop vs next month's OS update), non-repeatable, and ambiguous
(DD/MM vs MM/DD is decided by US-default `dayfirst=False` in pandas [S09];
decimal comma vs decimal point changes numeric parsing [S03][S04][S09];
currency/percent-decorated numbers need an explicit `bareNumber`-style policy
[S07]). A transformation that depends on ambient machine settings cannot
satisfy "repeat the same transformation next month".

Amended requirement: capture an explicit per-source locale profile at import
time — date orders and accepted formats, decimal/thousands separators,
encoding, NA-token policy — preview its effect on real cells (showing
DD/MM-vs-MM/DD conflicts per column), and store it in the repeat recipe.
The machine locale may seed the INITIAL suggestion only (optional
enhancement), clearly labeled, and the analyst's confirmation or override is
a recorded user decision, after which the stored profile — never the ambient
locale — governs replays. Excel serials additionally follow the workbook's
own date system with the 1899-12-30 epoch default (openpyxl [S11]) and the
documented 1900 leap-year replication (Microsoft [S02]); serial 60 (the
fictitious 1900-02-29) is handled explicitly and documented in-product.

### P3: "Convert missing values to null." — CORRECTION (+ user decision)

Too blunt as stated. Evidence distinguishes the physical representation
(what tokens count as missing: `missingValues` [S07]) from the logical one
(what constraints apply after: `constraints` [S07]); real parsers expose
exactly this split (pandas' four-way `keep_default_na`/`na_values` matrix
[S09], Polars' `null_values` + `empty_string_is_null=True` default [S03],
DuckDB's `force_not_null`/`allow_quoted_nulls` [S04]). A global "convert
missing to null" silently destroys identifier-like strings that collide with
default NA tokens and conflates empty, whitespace-only, and quoted-empty
cells.

Amended requirement: per-column missing-value allowlists, previewed against
real values with collision warnings (values that WOULD be nulled are shown
before anything is nulled), originals always preserved, and ambiguous tokens
resolved by analyst choice (user decision) recorded in the recipe. Defaults
start strict (narrow, explicit token sets) and widen only by analyst action.

### P4: "Keep failed rows in an error CSV." — ALREADY-COVERED, with optional enhancement

Discovery independently required rejections-as-data (discovery §5.3) on the
DuckDB `store_rejects` model: faulty lines skipped into a queryable rejects
table (`reject_errors` default) with a configurable cap [S04]. An error CSV
is retained as a required EXPORT format, but the store itself should be the
queryable run table: original line number, original raw text, column-level
reason codes in analyst language, and the rule that failed — because "understand
rejected rows" needs reasons and provenance, not just the rows. Enhancement:
one-click error-CSV export plus re-import-after-fix loop (fix the CSV,
re-run the same recipe against it).

### P5: "Save transformation settings." — ALREADY-COVERED, with correction of form

Discovery independently required a repeat recipe as artifact (discovery §5.5)
with OpenRefine's operation-history replay ("replay your operation history on
a new version of it" [S08]) as the UX reference. The correction is to the
word "settings", which invites an opaque blob: the recipe MUST be a
versioned, human-readable, portable JSON document — Table Schema (fields,
types, formats, constraints), CSV Dialect, missing-values policy, locale
profile, ordered cast list, and engine versions/pins [S07] — so that next
month's run replays byte-identical decisions and reports drift (new values,
schema changes, count deltas) rather than re-guessing. Recipes are
diffable, emailable, and auditable; project-bound click-history alone is
rejected as the store (it may exist as a convenience layer above the recipe).

### P6: "Compare output row counts with inputs." — CORRECTION (expand, not remove)

Row-count comparison is necessary but insufficient: equal counts can hide
compensating drops and dupes, and counts say nothing about column-level
damage. Amended requirement: a full reconciliation report per run — input
rows = accepted + rejected + skipped (header/comments/blank), each bucket
explained; per-column acceptance/rejection rates; a stable hash over the
preserved originals so monthly replays can prove "same input, same
decisions"; and count/ratio drift alerts against the previous month's run.
The P6 count check is retained as the minimum row of that report.

## 3. Retained architecture (amended by §2)

1. Strings-first pipeline: read everything as text (DuckDB `all_varchar`
   [S04] / Polars `infer_schema=False` [S03] / pandas `dtype=str` + explicit
   NA policy [S09] class of modes), then apply a visible ordered cast list;
   every cell keeps original string + parsed value + producing rule.
2. Inference as disclosed hypotheses: dialect, header, types, date orders,
   NA sets — each with confidence, runners-up, and the sample that produced
   it (head + reservoir sample [S05]); nothing applied silently.
3. Rejections as queryable data with analyst-readable reasons (§2 P4);
   error-CSV export and fix-and-rerun loop included.
4. Memory discipline for modest laptops: index/sample/slice previews without
   loading [S05]; streaming Excel reads with dimension verification
   (`calculate_dimension`/`reset_dimensions` [S06]) and explicit workbook
   close; chunked/out-of-core full passes; full-file in-memory frames only
   as fallback. Note pandas builds the whole DataFrame "regardless" of
   `low_memory` [S09] — chunk via `chunksize`/`iterator` or choose another
   engine for big files.
5. Repeat recipe as portable versioned JSON (§2 P5; [S07]) with drift
   reporting on replay; OpenRefine-style replay UX [S08].
6. Per-source locale profile (§2 P2/P3): separators, date specs, encoding,
   NA policy — captured once, stored, never re-guessed.
7. Reconciliation report per run (§2 P6) with originals hash and drift
   alerts.

## 4. Conditions and constraints (must hold)

- C1 Excel-date correctness: honor the workbook's 1900/1904 date-system
  flag; default epoch 1899-12-30 [S11]; replicate (never "fix") the 1900
  leap-year bug per Microsoft's compatibility account [S02]; special-case
  serial 60; document pre-1900-03-01 behavior in-product.
- C2 Engine pins recorded: every recipe records engine name + version +
  non-default options (Polars' `use_pyarrow` changes date/type semantics
  [S03]; DuckDB "current"-doc defaults such as `sample_size`/`header` can
  drift [S04]); replay warns on engine change.
- C3 Encoding path: UTF-8/16/Latin-1 natively in the DuckDB class of engines
  [S04]; legacy nonprofit encodings go through explicit conversion
  (extension/`iconv` class of path) with a previewed mapping, never silent
  mojibake; pandas-class strict failures (`encoding_errors='strict'` [S09])
  surface as explained rejections.
- C4 Line/field caps disclosed: 2 MB DuckDB line cap class of limit [S04]
  and the stdlib field-size limit [S01] are surfaced when hit, with tuning
  guidance — long free-text rows must fail loudly, never truncate silently.
- C5 Local-first privacy posture per the OpenRefine reference ("cleaned on
  your machine" [S08]); no cloud round-trip required for any core flow.

## 5. Alternatives retained (not chosen as default, kept viable)

- A1 Strict-frame engine (Polars-class): fastest in-memory path, but strict
  RFC 4180 expectations ("malformed data... may lead to undefined
  behavior" [S03]) make it the wrong DEFAULT for messy files; retained for
  clean, validated, or post-rejection datasets and for the strict per-column
  mode.
- A2 pandas-based transport: justified only under the safe profile
  (`dtype=str`, explicit NA/date/chunk policy [S09]); retained for shops
  with existing pandas code to interoperate with, not as the inference
  engine.
- A3 CLI-first power flow (xsv-class streaming/index/compose [S05]):
  retained as the escape hatch for huge files and scriptable analysts;
  the GUI may embed the same pattern under the hood.
- A4 Project-bound history replay (OpenRefine-class [S08]) as a UX
  convenience layer above — never instead of — the portable recipe.

## 6. Optional capabilities (explicitly optional, not required)

- O-a Machine-locale seeding of the initial locale suggestion (§2 P2),
  labeled and overridable.
- O-b Clustering/merge-suggestion for near-duplicate identifier values
  (OpenRefine clustering class [S08]) — suggest only, analyst approves each
  merge; off by default.
- O-c Reconciliation against external reference data (OpenRefine
  reconciliation class [S08]) — a later phase, not this brief.
- O-d Faceted exploration of accepted/rejected partitions pre/post-run
  (OpenRefine facets class [S08]) — recommended for the rejection-review UI.

## 7. User decisions (the product must ask; never guess)

- D1 Header present/absent + dialect runner-up choice (cf. tie-breaks [S01],
  `header` defaults [S04][S09]).
- D2 Per-column type pins where confidence is low or samples conflict.
- D3 Locale profile confirmation: date orders/formats, separators, encoding
  (§2 P2).
- D4 Ambiguous missing-value tokens (§2 P3).
- D5 Monthly replay drift adjudication: accept-new-values vs quarantine
  (recipe replay, §2 P5).
- D6Engine/version upgrades affecting replay (C2).

## 8. Uncertainty (carried from discovery, unresolved)

- U1 stdlib `field_size_limit` numeric default and exact exception type —
  unverified in fetched window [S01].
- U2 pandas' exact default NA token list — only the interaction matrix
  observed [S09]; verify against the shipped build before final identifier
  guidance.
- U3 xsv maintenance status and version pin (fetch was repo HEAD, version
  UNKNOWN) [S05].
- U4 DuckDB "current"-doc drift on sniffer/rejects defaults [S04] —
  re-pin at build.
- U5 Excel 1904-date-system flag-reading path — only the 1900-system epoch
  default observed [S11].
- U6 No performance claims executed (no runtime in this stage); all
  speed/memory figures are sourced documentation claims.
- U7 Desktop packaging comparison (installer size, update, offline) not run;
  engines are local-first consistent with [S08], but packaging is open.

## 9. Validations: executed vs proposed (O6)

EXECUTED in this research stage: 11 primary-source fetches (HTTP 200) with
verbatim extraction into sources/ + navigable sources/index.md, 1 recorded
404 with documented replacement (source-map.json), frozen discovery before
plan reveal (plan-reveal.json), and this per-P comparison. No code executed;
no witness ran — no qualified sandbox was claimed in this stage, so nothing
below is presented as executed.

PROPOSED discriminating validations (each designed to fail a distinct wrong
design; to run with a runtime + pinned engines):

- V1 Late-flip inference: CSVs clean for the first 100 / 1,000 / 20,480 rows
  then introducing text in numeric columns and new date formats at rows 101,
  1,001, and 20,481. Discriminates: prefix-window inference (P1-as-stated,
  Polars-default) vs sampled inference (§2 P1). Pass = flip detected,
  hypothesis updated, analyst alerted; fail = silent mis-type or crash.
- V2 NA-collision identifiers: ID columns containing default-NA-colliding
  tokens and empty/whitespace/quoted-empty variants. Discriminates: global
  null coercion (P3-as-stated, pandas-default) vs per-column allowlists
  (§2 P3). Pass = zero silent nulls, collisions previewed.
- V3 Date-order grid: DD/MM vs MM/DD ambiguous columns (01/02/2025 class),
  mixed-format columns, Excel serials spanning serial 60, and a 1904-system
  workbook. Discriminates: machine-locale parsing (P2-as-stated) vs stored
  locale profile + workbook date system (§2 P2, C1). Pass = conflicts shown
  per column, serials convert per flag, 1900-bug behavior documented.
- V4 Rejection accountability: malformed rows (ragged, bad quotes, 2 MB+
  lines, legacy encoding, dimension-lying workbook). Discriminates: error
  CSV dump (P4-as-stated) vs queryable rejects with reasons (§2 P4, C3/C4).
  Pass = every dropped row accounted with reason + original text.
- V5 Monthly replay drift: run recipe month 1, then month-2 files with new
  values, a renamed column, and a changed row count. Discriminates: saved
  settings blob (P5-as-stated) vs versioned recipe + drift report (§2 P5).
  Pass = byte-identical decisions on unchanged parts, drift items queued
  for D5 adjudication.
- V6 Reconciliation trap: inputs engineered so output counts match while
  content differs (compensating drop/dupe). Discriminates: count-only check
  (P6-as-stated) vs full reconciliation + originals hash (§2 P6). Pass =
  trap caught by hash/bucket accounting.
- V7 Memory ceiling: largest-CSV + largest-workbook fixtures processed on a
  modest-RAM profile with previews first. Discriminates streaming/indexed
  path (§3.4) vs whole-file frames. Pass = preview without full load,
  bounded peak memory, explicit close/dispose.
- V8 Engine-drift replay: same recipe replayed under a bumped engine
  version. Pass = version mismatch warned (C2), results diffed, no silent
  semantic change.

## 10. Native lifecycle (actual calls, no handwritten receipts)

- Native route per input-map.json: `muse`.
- Actual fresh native Goal created in-session: objective referenced this
  assignment + input-map + deliverables + deadline; status `active` at
  creation (goal id `goal-01a12222-2c7d-78b0-9a5f-780b5ba42261`).
- Actual supported calls used/available in this harness: `create_goal`
  (used), `report_progress` (used), `update_goal(status=complete|blocked)`
  (to be called AFTER this draft and all artifacts are saved), `get_goal`
  (available for state reads). No receipt JSON was hand-written; lifecycle
  state lives in the harness.
- All required science (discovery.md, source-map.json, sources/, revealed
  plan comparison, this draft.md) is saved BEFORE terminal Goal completion,
  per the assignment. After terminal completion only mechanical delivery
  remains. Native and T3 completion are separate; unavailable fields are
  UNKNOWN.

## 11. Open-plan note for later stages (M04)

This draft is a complete planning deliverable for the research scope; later
M04 stages (critic/reviser) may correct it with targeted evidence-backed
amendments, re-checking every retained material finding and condition. Known
pressure points: U2/U4 version pins, U5 1904-flag path, and V-series results
once a runtime exists.
