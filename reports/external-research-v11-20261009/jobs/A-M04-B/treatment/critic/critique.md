# Critique — S10 data-import draft (A-M04-B / treatment / critic)

Stage: A-M04-B / treatment / critic. Method M04 v1 (amendment-preservation).
Inputs independently inspected in full: original brief (`cases/S10/brief.md`),
revealed thin plan (`revealed-plan.md`, 6 P clauses), predecessor
`research/draft.md` (§§1–11), `research/discovery.md` (§§1–7),
`research/source-map.json` (S01–S11), and all 11 predecessor evidence files plus
`index.md` under the declared source root. Independent verification: 3 fresh
primary fetches (C01–C03) with bounded extracts in `sources/` + `index.md` and
`source-map.json` in this directory. No campaign/history/evaluator/counterpart
access; no repair of the candidate beyond this critique; no sandbox claimed, so
no witness runs — proposed checks are honestly marked proposed.

## Verdict summary

Directionally the draft is sound: all six P dispositions point the right way
(P1/P2/P3/P6 corrections stand; P4/P5 retentions stand in substance), the
strings-first + disclosed-hypothesis + queryable-rejects + portable-recipe
architecture follows the evidence, O6 honesty (executed vs proposed) is kept,
and uncertainties U1–U7 are carried rather than hidden. No P correction is
wholly false and no disposition needs full reversal.

But the draft overclaims evidence in four places that matter for the reviser
(OpenRefine portability, rejects-table schema, Excel flag/code path, recipe
citation scope), proposes two mechanisms that need redesign before they are
buildable (reservoir-only sampling, monthly-hash reconciliation), mislabels one
disposition, and leaves material discovery gaps (second competitor, encoding
detection, maintained CSV-engine fork). Details below as MATERIAL (reviser must
address) vs MINOR (fix opportunistically). Critic demands can be invalid; each
finding states the evidence and residual uncertainty so the reviser can
adjudicate.

## MATERIAL findings (M1–M10)

### M1 — P5/A4 overstates OpenRefine non-portability (partial false rejection)

- Location: draft §2 P5 ("project-bound click-history alone is rejected as the
  store"), §5 A4, §3.5.
- Predecessor evidence: S08 (predecessor) shows homepage "replay your operation
  history on a new version of it" but no extract/apply path; the 404'd manual
  page left portability unverified.
- Independent evidence: C02 (official manual, "Reusing operations") — "they
  will be encoded as JSON on the right. Copy that JSON"; "Move to the second
  project, go to the Undo/Redo tab, click Apply… and paste in that JSON";
  batch/CLI application of operations "saved in a JSON file"; limit: "Not all
  operations can be extracted. Edits to a single cell, for example, can't be
  replicated" (undone ops also excluded).
- Finding: operation history is portable JSON with stated limits, not
  project-locked. The rejection as drafted is too strong and factually
  vulnerable.
- Required direction: amend to "project-bound by default, JSON-extractable
  with limits (no single-cell edits, no undone ops, column-name coupling)"
  and re-ground the recipe preference on what operation lists lack:
  declarative schema/dialect (fields/types/formats/constraints), diffability,
  engine pins, locale profile — none of which C02 shows. P5 disposition
  (already-covered with correction of form) stands; its justification must be
  rewritten. Uncertainty: JSON schema stability across OpenRefine versions was
  not verified; do not assert forward-compat.

### M2 — P4/§3.3 rejects-table schema is asserted without evidence

- Location: draft §2 P4 ("original line number, original raw text,
  column-level reason codes"), §3.3, §4 V4 pass criteria.
- Predecessor evidence: S04 (predecessor) shows `store_rejects`,
  `rejects_table=reject_errors`, `rejects_limit` — but no table schema.
- Independent evidence: C01 re-fetch of the same overview page confirms the
  params and shows the schema lives elsewhere: `rejects_table` links to
  `reading_faulty_csv_files.html#reject-errors`, and no
  line-number/error-column text appears on the overview page.
- Finding: the draft's rejects-row contents (line numbers, raw text, reason
  codes) are design requirements presented as if on the DuckDB model. They may
  be right, but neither S04 nor C01 evidences them.
- Required direction: either fetch the faulty-CSV page and pin the real
  schema (file/row/error columns, what "raw" means, which errors are
  row- vs cell-level), or relabel the schema as a product requirement ("the
  store MUST record…") explicitly not claimed from DuckDB. V4 pass criteria
  ("every dropped row accounted with reason + original text") depend on this
  choice. Uncertainty: whether DuckDB rejects capture column-level reasons at
  all — if row-level only, the draft's "column-level reason codes" needs its
  own inference layer.

### M3 — P3 NULL-params evidence gap + missed `allow_quoted_nulls=true` interaction

- Location: draft §2 P3 (cites "[S04]" for `force_not_null`/`allow_quoted_nulls`).
- Predecessor evidence: S04 (predecessor) extract does not contain either
  parameter — the citation points at an evidence file that lacks the claim.
- Independent evidence: C01 CONFIRMS both exist: `allow_quoted_nulls` default
  `true` ("Allow the conversion of quoted values to NULL values"),
  `force_not_null` default `[]` ("empty values are read as zero-length strings
  instead of NULLs"), plus `nullstr` default (empty).
- Finding: two parts. (a) Evidence-locator defect: the claims are true but
  unverifiable from the predecessor bundle; the reviser must repair the
  locator (re-extract or cite C01-equivalent). (b) Substantive interaction the
  draft misses: DuckDB's default NULS quoted-empty cells
  (`allow_quoted_nulls=true`), which cuts against the draft's "strict narrow
  defaults" posture — adopting DuckDB as an engine means the strict default
  must explicitly flip this param (and set `nullstr`/`force_not_null` per
  column), otherwise the engine is less strict than the draft promises.
- Required direction: repair citation; add the DuckDB NULL-default row to the
  P3 amendment (per-column `nullstr` + `force_not_null` + `allow_quoted_nulls`
  policy, previewed). Uncertainty: none on existence/defaults (C01 verbatim);
  only on which strict profile the product finally picks (user decision D4).

### M4 — C1/V3 1904-flag code path, serial 60, and epoch remain unsourced-or-inferred

- Location: draft §2 P2 (Excel serials), §4 C1 (1900/1904 flag, epoch
  1899-12-30, serial 60, pre-1900-03-01), §8 U5, §9 V3.
- Predecessor evidence: S11 shows `from_excel`/`to_excel` epoch 1899-12-30;
  S02 shows Lotus→Excel compat rationale. Neither names serial 60, the
  1904 epoch, or any flag-reading API. U5 honestly admits the 1904 path gap.
- Independent evidence: C03 (live Microsoft Support article) confirms the
  systems-level premise — 1900 vs 1904 systems, Jan-1-1900 vs Jan-1-1904
  starts, 40729/39267 serial examples, 1462-day offset, per-workbook "Use 1904
  date system" flag, 1900 default on current platforms. It does NOT show
  serial 60, the 1899-12-30 epoch, or any code read path (no openpyxl
  `date1904`/workbook-properties path, no ECMA-376 reference).
- Finding: C1's core requirement (flag-aware conversion) is now
  independently supported at the product level, but its three buildable
  details (which serial is the fictitious leap day; which epoch constant;
  which API reads the flag) are still inference + one default constant. V3's
  1904-workbook test is therefore not executable as written — there is no
  pinned oracle for the flag read or the 1904 epoch conversion.
- Required direction: downgrade C1 to conditional ("IF the workbook flag
  reads 1904 THEN…") and pin the three details to a code primary before V3
  runs: openpyxl workbook-properties/`date1904` path (or the chosen Excel
  library's equivalent) + a serial-60 oracle (ECMA-376 §18.17.4 or library
  test vector). Keep U5 open until then. Uncertainty: whether the chosen
  Excel engine even exposes the flag in streaming (`read_only`) mode — C03 is
  silent, S06 is silent; verify on the target engine.

### M5 — P1 reservoir-only sampling loses the positional signal V1 needs

- Location: draft §2 P1 ("reservoir sample drawn across the whole file (the
  xsv `sample` pattern)"), §3.2, §9 V1.
- Evidence: S05 (predecessor) — xsv `sample` uses reservoir sampling, "memory
  proportional to the size of the sample". Reservoir draws are unordered
  random rows; S05 says nothing about preserving row order/position.
- Finding: V1's discriminating cases are positional (clean for N rows, then a
  flip at row 101/1001/20481; "late-file type flips, trailing garbage rows,
  monthly drift"). A pure reservoir sample detects mixture but not position:
  it cannot distinguish "5% text scattered throughout" (mixed column) from
  "text starts at row 20,481" (schema drift / garbage tail / monthly change),
  and it cannot power the draft's own drift alerting. The amendment as written
  undercuts its own validation.
- Required direction: replace "head + reservoir" with stratified disclosure:
  head window + systematic/tail windows (e.g. head + every-kth + tail, with
  positions recorded) + optional reservoir for mixture estimates. Present
  positional conflicts ("numeric until row R, then text") as a distinct
  hypothesis from mixture. V1 then tests stratification, not just sampling.
  Uncertainty: exact strata counts are a tuning choice (propose, don't pin);
  the structural point (positions required) is not uncertain.

### M6 — P6/V6 monthly-hash concept is confused and unspecifiable as written

- Location: draft §2 P6 ("stable hash over the preserved originals so monthly
  replays can prove 'same input, same decisions'"), §3.7, §9 V6.
- Finding: monthly replay input is different data by definition (next month's
  file). A hash over originals proves rerun idempotence ("same file, same
  decisions") and tamper/audit identity, not month-to-month sameness — the
  quoted purpose is conceptually wrong. Separately, the hash is unspecifiable
  as written: hash of what bytes (raw file bytes incl. BOM/line-endings vs
  normalized preserved-original cells)? which normalization (encoding,
  newline, quoting)? which algorithm? per-file vs per-column? Without these,
  V6's "trap caught by hash/bucket accounting" is not executable — the trap
  (compensating drop/dupe) is caught by bucket accounting alone, and the hash
  adds nothing testable.
- Required direction: split the requirement — (a) bucket accounting
  (input = accepted + rejected + skipped, per-column rates) catches V6's trap;
  (b) an idempotence/audit hash (algorithm + normalized form pinned, e.g.
  SHA-256 over stated normalization) proves rerun identity and is drift-input,
  not drift-proof. Rewrite V6 pass criteria accordingly (trap caught by (a);
  rerun-report verified by (b)). Uncertainty: normalization choice is genuinely
  open (record as user/builder decision); the conceptual split is not.

### M7 — P4 disposition label is wrong (inconsistent with P5)

- Location: draft §2 P4 ("ALREADY-COVERED, with optional enhancement") vs §2
  P5 ("ALREADY-COVERED, with correction of form").
- Finding: both P4 and P5 keep the P-clause's intent while changing its form
  (P4: CSV-as-store → queryable-table-as-store + CSV-as-export; P5:
  opaque-settings → versioned portable JSON recipe). The draft labels the same
  move differently in the two places. Under its own vocabulary (§2 preamble),
  a form change that says "P clause is wrong/incomplete as stated; amended
  form given" is a CORRECTION (of form), which is exactly what P5 says and P4
  omits. The P4 label understates the change and breaks the taxonomy the
  reviser must preserve.
- Required direction: relabel P4 to match P5 ("already-covered in intent,
  with correction of form") or to plain CORRECTION (form); keep the substance
  (queryable store + CSV export + fix-and-rerun). No evidence uncertainty.

### M8 — Material discovery gaps: second competitor, encoding detection, maintained engine fork

- Location: discovery §2 / draft §5 (alternatives), brief O1 ("competing
  products", "implementation tools", inconsistent inputs on modest laptops).
- Findings:
  - (a) Competitors: discovery covers exactly one competitor (OpenRefine).
    The brief's plural plus the Excel-heavy workflow make at least Power Query
    (M-language repeatable queries, Excel-native, monthly-refresh model) a
    material missing comparison; Tableau Prep / Trifacta are reasonable
    seconds. Without one, "differentiation space" (§2.7) is asserted against
    a single point.
  - (b) Encoding detection: C3/C4 require legacy-encoding handling via
    "extension/iconv class of path" with "previewed mapping", but no
    detection mechanism was investigated (charset detection, BOM handling,
    confidence/override UX). For "legacy nonprofit encodings" this is the
    difference between a real path and a named hope. C01 confirms DuckDB's
    supported set (UTF-8/16, Latin-1) and the iconv escape, but detection
    itself remains unevidenced.
  - (c) Maintained CSV fork: A3 retains xsv-class streaming while U3 admits
    version UNKNOWN and the S05 fetch saw no release. xsv's maintenance gap
    is precisely what a critic should have resolved via the releases page;
    the maintained community fork lineage (qsv and alternatives) plus
    csvkit/clevercsv dialect-detection research are unexamined. Retaining an
    unpinned, possibly unmaintained engine as the huge-file escape hatch is a
    material retention risk.
- Required direction: add one Excel-ecosystem competitor comparison (Power
  Query minimum: repeat model, portability, limits); add an encoding-detection
  decision (library + confidence + preview/override, or explicit "declare,
  don't detect" with consequences); resolve the xsv pin-or-fork question with
  a releases-page primary before A3 is relied upon. Uncertainty: which fork
  is not prescribed here — the gap is the missing investigation, not a
  mandated choice.

### M9 — A1 "fastest" is unsourced; A3 retention contradicts U3

- Location: draft §5 A1 ("fastest in-memory path"), §5 A3, §8 U3/U6.
- Evidence: U6 admits "No performance claims executed… all speed/memory
  figures are sourced documentation claims". No predecessor extract compares
  engine speeds (S05's xsv-vs-csvkit anecdote is the only perf number in the
  bundle, and it is not about Polars).
- Finding: "fastest" is a superlative with no comparison in evidence. It
  should read "fast/strict" unless a benchmark primary is added. Separately,
  A3's confident retention ("retained as the escape hatch… the GUI may embed
  the same pattern") sits uneasily with U3's honest UNKNOWN — the draft both
  relies on xsv and admits it never established what xsv is. One of the two
  must give (pin it or hedge it).
- Required direction: downgrade to "fast strict in-memory path"; make A3
  conditional on the M8(c) pin-or-fork resolution. Uncertainty: none on the
  overclaim; benchmark choice (if any) is future work.

### M10 — P5 cites [S07] for design the spec does not contain

- Location: draft §2 P5 ("versioned, human-readable, portable JSON document —
  Table Schema…, CSV Dialect, missing-values policy, locale profile, ordered
  cast list, and engine versions/pins [S07]").
- Evidence: S07 (predecessor) shows Table Schema (fields/types/formats/
  constraints/missingValues/bareNumber/keys) plus sibling-spec names (CSV
  Dialect, Data Resource/Package). It contains no engine pins, no ordered
  cast lists, no locale profiles, no versioning/drift-reporting scheme.
- Finding: [S07] supports the schema+dialect+missingValues portion only. The
  remaining recipe contents are sound product design, but citing the spec for
  them misattributes provenance and will mislead the V5/V8 implementer about
  what "Table Schema compliance" delivers.
- Required direction: split the citation — "[S07] for schema/dialect/
  missingValues shape; locale profile (§2 P2), cast list (§3.1), engine pins
  (C2) are product extensions defined here". V5's "versioned recipe + drift
  report" must be labeled product-defined, not spec-defined. Uncertainty: none.

## Per-P disposition verdicts (all six re-checked)

| P | Draft disposition | Critic verdict |
|---|---|---|
| P1 1000-row prefix inference | CORRECTION → strings-first + sampled disclosed hypotheses + pinned schema | STANDS in direction; mechanism needs M5 stratification fix. The 100-vs-20480 window contrast (S03/S04) and tie-break disclosure (S01) are correctly evidenced. "Magic 1000 silently" rejection is sound. |
| P2 machine-locale dates | CORRECTION (+ user decision); machine locale seeds initial suggestion only | STANDS. Non-portability reasoning is sound and strengthened by the unnoted point that no selected engine defaults to machine locale (all default US/ISO: S03/S04/S09) — the evidence actively contradicts P2-as-stated. Excel half needs M4 pinning. |
| P3 missing→null | CORRECTION (+ user decision); per-column allowlists, strict-first | STANDS in direction; needs M3 citation repair + DuckDB NULL-default interaction. The keep_default_na/null_values/empty_string split (S09/S03/C01) is correctly evidenced. |
| P4 error CSV | ALREADY-COVERED + enhancement | SUBSTANCE STANDS, LABEL WRONG — see M7; schema needs M2 sourcing. The store_rejects model (S04/C01) genuinely supports rejections-as-data. |
| P5 save settings | ALREADY-COVERED with correction of form (portable JSON recipe) | STANDS with M1 justification rewrite + M10 citation split. OpenRefine replay (S08/C02) genuinely supports repeatability-as-requirement. |
| P6 count check | CORRECTION (expand to reconciliation + hash + drift) | EXPANSION STANDS, HASH HALF CONFUSED — see M6. Count-insufficiency logic is valid; bucket accounting is the load-bearing part. |

No false correction requiring full reversal was found. No P clause was
ignored: O4 coverage is complete (6/6 with exact quotes).

## Discovery and alternatives (O1/O2/O3 spot-check)

- O1 breadth is good on engines (xsv/DuckDB/Polars/pandas/openpyxl/stdlib),
  the recipe primitive (Table Schema), and one competitor (OpenRefine), with
  genuine "materially different approaches" (streaming-index vs tolerant
  sniffer vs strict frames vs transport-wrapper). M8 lists what is
  materially missing (second competitor, encoding detection, fork/dialect
  research, date-parsing-library comparison for "inconsistent dates").
- O2 contract table (discovery §3, ~30 rows) re-verified on the load-bearing
  rows against predecessor extracts and C01: Polars 100-row window, DuckDB
  20480/header-false/2MB-cap/rejects/encodings, pandas keep_default_na matrix
  + low_memory whole-frame warning + dayfirst-false, openpyxl streaming +
  dimensions caveat, stdlib tie-break order — all correctly transcribed.
  Exceptions are M2/M3/M4/M10 (schema, NULL params, flag path, recipe scope).
- O3 three chains exceed the one-chain minimum. Chain A (25+ options →
  multi-hypothesis sniffer, S10) and Chain B (Lotus bug → permanent compat,
  S02+S11+C03) are well-evidenced. Chain C (pandas coercion hazards → opt-outs)
  is a "mature-state synthesis", not a versioned issue/fix chain — no issue
  number, changelog entry, or regression range is cited (see minor m4).
- Alternatives A1–A4 are genuinely retained (not silently dropped), satisfying
  O5's retention duty for non-defaults. A2's pandas safe-profile synthesis is
  the strongest of the four. A1/A3 need M9/M8(c) repairs.

## Omissions ledger (beyond M8)

- O-a Timezones/DST/two-digit years: P2 covers orders/separators/serials but
  never mentions tz-aware vs naive, DST folds, or 2-digit-year pivots — all
  live inside "inconsistent dates". At minimum record as open decision.
- O-b Identifier semantics: "inconsistent identifiers" is read as
  NA-collision + dedup-suggestion (O-b clustering). Leading-zero loss
  (ZIPs/IDs through numeric inference), whitespace/case normalization policy,
  and max-identifier-length are never named. Strings-first mostly saves this,
  but the recipe should name an identifier-hygiene rule.
- O-c Sheet/table selection for workbooks: no decision on multi-sheet
  workbooks (which sheet(s)? named tables? hidden sheets?) — D-series has no
  Excel-selection decision.
- O-d Rejection quarantine vs hard-fail policy: P4 covers storage/explanation
  but not the run-level policy (threshold aborts? warn-and-continue? per-type
  severity?). V4 needs it.
- O-e Desktop packaging (U7) is honestly punted; acceptable for this stage
  given the data-engine focus, but the brief's "desktop" + "modest laptop"
  words mean a later stage must scope installer/update/offline explicitly
  rather than re-punting.

## Validation applicability (V1–V8: can each run?)

- V1 late-flip (rows 101/1001/20481): well-targeted (Polars-100+1,
  P1-1000+1, DuckDB-20480+1). APPLICABLE after M5: add stratified-vs-reservoir
  discrimination and positional-alert assertions.
- V2 NA-collision identifiers: APPLICABLE as written; strengthen by adding
  the C01 DuckDB NULL-default cases (quoted-empty under
  allow_quoted_nulls=true vs false; force_not_null columns).
- V3 date-order grid + serial-60 + 1904 workbook: NOT YET EXECUTABLE —
  blocked on M4 (no pinned flag-read path, serial-60 oracle, or 1904-epoch
  oracle). The DD/MM-vs-MM/DD grid half can run now; gate the Excel half on
  M4 pins.
- V4 rejection accountability (ragged/quotes/2MB+/encoding/dimension-lie):
  APPLICABLE with two clarifications (minor m6): legacy-encoding expected
  behavior (reject vs convert?) and which engine's cap is under test per
  fixture. 2MB+ fixture must target the DuckDB path (C01 cap).
- V5 monthly replay drift: APPLICABLE after wording fix (minor m2:
  "decision-identical", not "byte-identical decisions"). Recipe fixture must
  be product-defined per M10, not assumed from S07 alone.
- V6 reconciliation trap: PARTIALLY EXECUTABLE — bucket-accounting half runs
  now and is the real trap test; hash half blocked on M6 spec (algorithm +
  normalization). Split per M6.
- V7 memory ceiling: APPLICABLE only after scoping (minor m7): define the
  modest-RAM profile (GB), peak-memory bound, fixture sizes, and close/dispose
  assertion per engine. As written it is a test sketch, not a runnable check.
- V8 engine-drift replay: APPLICABLE after scoping (minor m7): define the
  diff target (output bytes? decision log? per-cell values?) and warn-vs-fail
  policy per C2.

General O6 note (supporting the draft): the executed-vs-proposed separation
is honest throughout — 11 predecessor fetches + 1 recorded 404 are the only
executed checks claimed, no code execution is pretended, and every V-item is
labeled proposed with a discriminating design (each fails a distinct wrong
design). That honesty is preserved; the applicability notes above make the
proposals runnable rather than questioning their intent.

## Uncertainty handling (U1–U7 re-check)

- U1 (stdlib field_size_limit default): honestly carried; cheaply resolvable
  against the target interpreter/docs at build. No finding beyond "resolve at
  build" (minor m8).
- U2 (pandas default NA token list): honestly carried (matrix observed, list
  not fetched). Resolvable against the pinned pandas build/source. Note the
  blast radius: identifier-guidance wording depends on it — keep guidance
  conditional until resolved.
- U3 (xsv version/maintenance): honestly carried but materially load-bearing
  (M8(c)/M9) — this is the one uncertainty that should have been resolved
  before retention, not after.
- U4 (DuckDB current-doc drift): honestly carried and independently confirmed
  as a live risk (C01: stable→current redirect). Keep the re-pin-at-build
  requirement; C01's values are the critic-stage pins.
- U5 (1904 flag path): honestly carried and now M4 — C03 narrows but does not
  close it.
- U6 (no perf executed): honestly carried; contradicts only A1's "fastest"
  (M9), nothing else.
- U7 (packaging): honestly carried; see omission O-e.

## Minor findings (m1–m8)

- m1 Editorial: "D6Engine/version" (§7) missing space; "byte-identical
  decisions" (V5) should be "decision-identical replay" (same casts/policy on
  unchanged parts; outputs differ where inputs differ).
- m2 C2 drift framing: "DuckDB 'current'-doc defaults such as
  sample_size/header can drift" is a risk inference from the "current" label,
  not an observed drift event. Keep the re-pin requirement; label it risk,
  not fact. (C01 confirms the label, not a change.)
- m3 `bareNumber` default-true interaction: S07 shows `bareNumber` defaults
  true (strict numeric). The draft's locale-profile design should state the
  starting posture explicitly (strict-true default, per-column false with
  analyst approval) rather than leaving the default implicit.
- m4 Chain C hardening: add one concrete pandas issue/changelog anchor
  (silent-coercion report + the version that introduced the escape) so O3's
  third chain is versioned like the first two. Not blocking.
- m5 O-b clustering safety: "suggest only, analyst approves each merge; off
  by default" is right; add preview + undo + never-auto-apply-on-replay so a
  confirmed merge cannot silently re-fire on next month's new values.
- m6 V4 pass criteria: state per-fixture expected behavior for legacy
  encodings (explained rejection with conversion offer vs auto-convert?) and
  the severity policy (see O-d) before fixtures are built.
- m7 V7/V8 scoping: V7 needs RAM profile + byte bound + fixture sizes; V8
  needs diff target + warn/fail policy. Both are one-paragraph additions.
- m8 Cheap resolutions at build: U1 (interpreter/docs default + exception
  type), U2 (pinned-build NA list), max_line_size tunability (C01 shows the
  param; confirm runtime-settable on the chosen DuckDB binding). None blocks
  the critique.

## What the critic checked and did NOT dispute

- P1/P2/P3/P6 correction directions; P4/P5 retention substance; the
  strings-first pipeline; inference-as-disclosed-hypotheses; locale profiles
  in the recipe; reconciliation bucket accounting; drift-on-replay over
  silent re-guess; local-first posture (S08/C-wording verified in S08
  extract); O5 retention of alternatives/conditions/uncertainty in
  self-contained prose (no ID-only text); O6 executed/proposed honesty.
- Draft §10 (research-stage native lifecycle): describes the predecessor
  stage's own harness calls. Unverifiable from critic scope (no
  history/harness access by design) and out of the scientific brief — no
  finding for or against; the critic's own lifecycle is recorded separately
  per its assignment.
- No premium evaluator access was used; no candidate repair beyond this
  critique's demanded directions; all critic claims above trace to C01–C03 or
  to named predecessor extracts (S01–S11) inspected in place.

## Sources used by this critique

- Own primaries: C01 (DuckDB current CSV reference), C02 (OpenRefine manual
  reusing-operations), C03 (Microsoft date-systems article) — see
  `source-map.json` + `sources/index.md` + `sources/C0x-*.md`.
- Predecessor evidence inspected (not rebound): S01 (stdlib csv), S02 (1900
  bug), S03 (Polars read_csv), S04 (DuckDB CSV), S05 (xsv), S06 (openpyxl
  optimized), S07 (Table Schema), S08 (OpenRefine homepage), S09 (pandas
  read_csv), S10 (sniffer blog), S11 (openpyxl datetime) — citations above as
  `Sxx (predecessor)`.
- Usage/billing: unobserved, null (no account surface in this stage).
