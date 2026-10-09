# S10 data-import — critic report (M04 amendment-preservation)

Block A-M04-B / arm control / stage critic / case S10 / method M04 v1.
Brief: `cases/S10/brief.md` (frozen sha256
`17322e03cfaa4aad42ef991cbf666e5ca646cca2439f71b748c8642761ccbbf2`).
Revealed plan sha256 `3f5acb86924c2981486d394c7e57a6578fdafd05ad7345800fda856c84dbf6bf`:
P1–P6 as quoted in §4 below (source: `revealed-plan.md`, read in full).
Predecessors inspected COMPLETE (every line): `research/draft.md` (381 lines),
`research/discovery.md` (491 lines), `research/source-map.json` (S01–S15),
`research/revealed-plan.md`, and all four research `sources/*.md` evidence
notes plus `sources/index.md`. This critique was written before native Goal
terminal completion; no campaign/history/evaluator/counterpart was read, no
nested agents, no repo edits, no runtime execution (no qualified sandbox
claimed — §7).

Role: challenge consequential facts/defaults/conditions, discovery breadth and
alternatives, every P disposition, omissions, false corrections/rejections, and
validation applicability. Under M04 the fresh reviser rewrites the complete
final after this critique and preserves supported findings; §6 lists exactly
what is supported and must survive, §2–§5 list what must change. Critic demands
below are each tied to evidence or explicitly marked uncertain; §8 lists
demands I considered and refused as invalid.

Verdict: the draft is substantially correct and its three blocking corrections
(P1 head-window, P2 machine-locale, P3 undeclared missing set) stand. But it
overclaims one engine behavior (DuckDB multi-offset sampling), bakes an
unevidenced replacement number (10k) into the build plan while calling it
uncertain, applies a DuckDB-only cost estimate to the Polars escape path,
under-labels the P4 substance gap as optional, and proposes one validation (V1)
that cannot do the job it claims (discriminate window numbers). None of these
is fatal; all are fixable by the reviser without new research. Details below.

---

## 1. What was independently verified (and how)

Critic source IDs `C01–C06` (see `source-map.json`, `sources/`) are fresh
public-primary observations made in this stage on 2026-10-09T19:37–19:39Z,
independent of the research stage's S01–S15. Method: targeted search with
verbatim snippets from primary or near-primary pages; no page script executed,
no installer/binary downloaded. Findings:

- **C01 DuckDB `sample_size` default 20480, `-1` = whole file: CONFIRMED**
  (archived official docs, current option table, 2023 CSV-sniffer blog post).
  But the same official blog post says detection runs on "a sequential sample",
  which contradicts the draft's "multi-offset jumps on seekable files"
  (sourced only to third-party tallyman notes). See M1.
- **C02 Polars `infer_schema_length` default 100, `None` = whole file,
  `0` = all String, `infer_schema_files` = 10: CONFIRMED** (stable `read_csv`
  reference signature plus independent issue/ADR citations of the 100-row
  default). The draft's "most sample-fragile engine out of the box" follows.
- **C03 calamine #706 (-1462 days, `<x15:workbookPr/>` reset) and #708 fix:
  CONFIRMED and UPGRADED.** #706 body and #708 title/summary match the draft;
  additionally the fix commit (`71af96a5`, 2026-08-27, 3 files incl.
  `tests/date_1904_extlst.xlsx`) now exists, and #706 reports testing on
  calamine 0.36.1. Release vehicle carrying the fix is still unconfirmed —
  the draft's U3 hedge remains correct.
- **C04 Frictionless `missingValues`: CONFIRMED with a footgun the draft
  should state.** `missingValues` are pre-cast strings; default for non-string
  fields is `""`; field-level `missingValues` overwrite schema-level; setting
  `missingValues: ["NA"]` without `""` excludes the empty default and can newly
  invalidate empty cells (frictionless-py #1599 pattern). The draft's
  per-column-sets design is right; it should warn that proposed sets must
  explicitly decide `""` (it does require an empty-string policy — keep that,
  add the footgun sentence).
- **C05 Excel serial 60 = fictitious 1900-02-29, 1462-day epoch offset,
  pre-1900 unrepresentable, cap 9999-12-31: CONFIRMED** across independent
  secondary sources consistent with the pinned Microsoft Learn commit (S05).
  No challenge.
- **C06 Power Query locale pinning mechanism: CONFIRMED as mechanism,
  version-date NOT confirmed as primary.** Microsoft Learn confirms
  `Table.TransformColumnTypes` culture/`MissingField` handling (incl. record
  form `[Culture="fr-FR", MissingField=...]`), `Date.FromText`/`DateTime.FromText`
  with Culture, and the Change-type → Using-locale UX. The "May-2025 update"
  dating rests on secondary pages only (geeky-gadgets). See M5.

Usage/billing: unobserved (null / UNKNOWN). No witness ran.

---

## 2. Material findings (reviser must address)

### M1 — DuckDB "multi-offset jumps" is single-sourced and contradicted by the official sniffer post (P1, §2.1, §2.3)

Draft claims (P1, §2.1.3, §2.7, discovery §2.1): DuckDB samples ~20,480 rows
"with multi-offset jumps on seekable files, not just the head", and the P1
correction promises "multi-offset coverage where the engine supports it" as a
superiority over head-only windows.

Evidence: the `sample_size=20480` / `-1` defaults are confirmed (C01). The
multi-offset behavior is cited only to tallyman third-party notes (S06), and
DuckDB's own 2023 CSV-sniffer post (C01) states automatic detection "is only
executed on a sequential sample of the CSV file". Those two descriptions are in
tension at best: sequential-sample vs multi-offset-jumps cannot both describe
the same reader version. Possibilities: behavior changed across versions (blog
2023 vs tallyman HEAD 2026), or "jumps" describes buffer/batch traversal misread
as file offsets, or tallyman is wrong.

Why consequential: the P1 correction's central technical claim — head-only is
"strictly weaker than multi-offset coverage" and the product will provide the
latter — rests on an engine capability that may not exist. Preview UX promising
"offsets" it cannot produce is a false-precision defect.

Demand: (a) downgrade multi-offset to UNCONFIRMED single-source claim; (b) do
not promise offset coverage in the P1 correction or §2.1 until verified against
versioned DuckDB source/docs for the pinned engine version; (c) reframe the P1
correction around what is solid: bounded VISIBLE window + user confirm/widen +
pinned replay (all of which survive without multi-offset); (d) add a validation
that actually tests offset behavior (e.g. flip at row 25k with `sample_size`
boundaries) rather than asserting it. This does not weaken the P1 disposition
(CORRECTION stands — head-only 1,000 is still indefensible); it removes an
unearned superiority claim inside the correction.

Uncertainty: I did not read DuckDB source for the sniffer in this pass; a
version-pinned source read during build could reinstate multi-offset with a
version qualifier. The demand is to stop asserting it now, not to assert its
negation.

### M2 — The "10k" replacement default is unevidenced and contradicts the draft's own uncertainty (P1, §2.1)

Draft P1 says the exact default window "awaits S10-representative fixtures
(V1/V2)" and "1,000 is not defended and not kept" — then §2.1.3 instructs
"(default raised well above 100, exact number set by V1/V2 fixtures)" while
discovery §2.2 and the P1 text float "e.g. 10k" as the concrete raised value,
and V1's fixture design assumes a default the test never varies.

10k is as arbitrary as 1,000 today: no fixture, no benchmark, no engine default
(engines say 100 / 20,480) produces it. A reviser or builder reading §2.1 will
ship 10k as decided while §5 calls it unpinned. That is exactly the
thin-plan sin (magic number without evidence) repeated inside the correction.

Demand: keep ONE statement — "default window unpinned pending V-ladder
results; 10k is a placeholder example, not a decision" — in both P1 and §2.1;
delete or clearly tag every other "10k"/"raised" phrasing as illustrative.
Pair with M11 (V1 must become a ladder that can actually select the number).

### M3 — The ~2.2× whole-file cost is DuckDB-only evidence applied to a generic escape (P1, §2.7)

Draft P1: "Whole-file inference exists as an escape (`sample_size=-1`,
`infer_schema_length=None`) but costs ~2.2× a read on 100 MB CSV per statement
(third-party measurement)". The 2.2× figure comes from tallyman/DuckDB-context
notes (S06); Polars `None` is separately "documented slow; loads into memory"
(S07). The sentence fuses them into one cost for both escapes, and the P1
correction then promises the preview "shows the window size, offsets, and the
escape cost" as if one known cost exists.

Why consequential: cost warnings with wrong numbers train analysts to ignore
cost warnings. Polars-`None` (documented slow + memory load) and DuckDB-`-1`
(~2.2×, third-party, 100 MB, per statement) are different cost shapes; presenting
one number for "the escape" is false precision.

Demand: separate per-engine escape costs in P1 and §2.7: DuckDB `-1` ≈ 2.2×
per statement on 100 MB (third-party estimate, re-measure on S10 fixtures);
Polars `None` = full scan, documented slow, memory-loaded (no numeric factor
claimed); CleverCSV full-file = unbounded/crawl (prohibited by default, per
S11). Preview shows the engine-specific warning, not a generic "escape cost".

### M4 — calamine serial-60 handling is asserted without observed behavior (P2, §2.1, V4)

Draft states calamine models datetimes with epoch flag and converts "handling
both epochs and the 1900 leap-day quirk", with serial 60 "refused/mapped rather
than reported as 1 March by careful consumers" (discovery §2.3), and V4
requires "serial 60 flagged fictitious". The cited S08 locator mentions a
"compatibility note on 1900 leap-day quirk" but records no observed conversion
output, API signature text, or test assertion for input serial 60 — unlike the
epoch flag, for which API names and issue bodies were observed.

Why consequential: V4's PASS criterion ("serial 60 flagged fictitious")
presupposes the reader surfaces serial 60 distinctly. If calamine maps 60 →
1900-02-28/03-01 silently, V4 as written fails for reasons the plan never
anticipated, and the "explicitly flagged" promise in P2 is unbuildable on the
chosen reader without extra raw-serial inspection (which the dual-column design
does retain — the raw float is preserved — so the fix is small: flag from the
raw serial, not from the converted date).

Demand: soften the calamine-quirk sentence to "reported to handle the quirk;
exact output for serial 60 not observed in this pass — verify before pinning"
and define V4's serial-60 check against the preserved raw serial (== 60 →
flag), not against the reader's converted value. Preserve the dual-column
design (it already saves this); do not claim reader behavior not yet observed.

### M5 — "May-2025 update" for record-based culture is secondary-only (P2)

Draft P2 correction cites "`Table.TransformColumnTypes` record-based culture
with `en-US`/`en-GB` as of the May-2025 update" as the model for locale
pinning. C06 confirms the mechanism (culture + missing-field handling, record
form) in Microsoft Learn primaries but the May-2025 dating appears only in
secondary pages (geeky-gadgets, fastercapital). Research S12/S14 are correctly
labelled `mutable-secondary`.

Why consequential (moderately): P2's correction does not logically depend on
the date, but a plan that pins "as of May-2025" without a primary invites a
build agent to treat the record form as universally available. Older
M-engine hosts accept only the positional `culture as nullable text` form
(C06 shows that signature on one Learn locale page).

Demand: keep the mechanism as the benchmark; change "as of the May-2025
update" to "record form observed in current docs; confirm minimum host version
at build, positional-culture fallback otherwise". One sentence; P2 disposition
unchanged.

### M6 — P4's disposition label contradicts its own substance (P4, §2.4)

Draft P4: "ALREADY-COVERED (intent) + OPTIONAL ENHANCEMENT (substance)" with the
hedge that "quarantine semantics (nothing silently dropped, every reject
explained) are mandatory, not optional" and v1 "may ship CSV-first with the
richer fields present as columns".

The label is the problem. Discovery requires quarantine-not-drop with rule IDs
and counts; P4-as-written ("error CSV") undershoots that on store semantics
(queryable, countable, reversible, run-linked). Calling the delta "optional
enhancement" while simultaneously declaring its semantics "mandatory" hands the
reviser/builder a direct contradiction to resolve under schedule pressure —
and "optional" is what gets cut. CSV-with-columns is in fact an acceptable v1
of the store (the draft is right about that), but rule ID + reason + counts +
reversibility are the brief's "understand rejected rows" bar, not an
enhancement.

Demand: relabel P4 as ALREADY-COVERED (intent) + CORRECTION (substance:
reject store must carry row number, raw values, rule ID, expected-vs-found,
human reason, run ID, and accepted+quarantined=input accounting, whether the
v1 container is a table or a rich CSV). Move "CSV-columns-first phasing" to
§4 optional capabilities where it already lives (E4/P4-note). No content is
lost; the cut-line becomes unambiguous.

### M7 — P6's reconciliation suite is new substance, not already-covered (P6)

Draft P6: "ALREADY-COVERED (intent) + CORRECTION (substance)" — agreement that
discovery requires accepted+quarantined=input with manifests, correction that
counts alone are insufficient, adding per-column type distribution + null rate,
key-uniqueness and required-field rates, date/numeric ranges, manifest diff as
a blocking suite.

The disposition label is right; the accounting is slightly off. Discovery
requires manifests, counts, hashes, and Frictionless-style per-field validation
errors, but it never specifies a blocking post-run suite with distributions,
key rates, and range checks gating silent replay. That suite is genuine new
design introduced at draft stage (post-reveal), i.e. part of the CORRECTION,
not part of the ALREADY-COVERED agreement. As written, a reader could infer the
whole suite was pre-reveal discovery.

Demand: one clarifying sentence in P6: "the blocking-suite composition
(distributions, key/range rates, manifest diff as replay gate) is introduced
here as part of the correction; discovery supplied counts, manifests, and
per-field errors." Disposition unchanged. This matters for M04 provenance:
post-reveal additions must be identifiable as such.

### M8 — Memory "prohibitions" overstate version-dependent engine behavior (§2.3, discovery §2.7)

Two overstatements: (a) "in-memory-only execution is prohibited for large
runs (documented OOM control)"; (b) the DuckDB `temp_directory` +
`memory_limit` spill story and Polars OOM guidance cited to skill/blog notes
(S06/S07 locators) rather than versioned engine docs.

(a) A prohibition with no threshold ("large"), no override path, and no
versioned citation is unenforceable; builders will either ignore it or
re-litigate it. The honest rule is a default + guardrail: file-backed spill is
the default for large runs, `:memory:`-only requires explicit override with a
size cap, per V7. (b) Spill-vs-OOM specifics (what spills, what still OOMs,
which version) drift across DuckDB/Polars releases; the draft correctly pins
nothing here but also never says "pin at build".

Demand: rewrite the prohibition as default+override ("default file-backed
spill; `:memory:`-only is an explicit override capped to small runs"), and add
"pin spill/memory-limit behavior to the chosen engine versions at build;
re-run V7 on upgrade" to §2.3. V7 stays the enforcement mechanism.

### M9 — Encoding-detector choice is uninvestigated although dialect choice got a full survey (O1 gap, §2.1)

Discovery surveys dialect detectors thoroughly (engine sniffers vs CleverCSV
vs 2024 uniformity successor, explicitly unranked pending V2) but encoding
detection gets one line: "bounded head window (e.g. 64 KiB) with
UTF-8-`replace` fallback as the honest last resort [S06]" — citing DuckDB
sampling evidence for an encoding claim it does not support. No detector
(chardet / charset-normalizer / encoding_rs / ICU / engine-native) is named,
compared, or left explicitly open; §2.1 then instructs "detect encoding on a
bounded head window (UTF-8/UTF-16+BOM/Windows-1252/latin-1 candidates) with
confidence shown" as if the mechanism were settled.

Why consequential: nonprofit CSVs in Windows-1252 vs UTF-8 with accented donor
names are exactly where silent mojibake happens, and V6 (encoding matrix)
needs a detector under test. The draft holds dialect choice open (U1) but
smuggles encoding choice closed with weaker evidence.

Demand: add encoding detector to the explicitly-open list (U1 companion):
name 2–3 candidate detectors, leave the pick to V6 fixtures, and move the 64
KiB/`replace` line to "candidate approach, not decision". Do not invent
benchmark numbers for detectors not read; stating the gap openly (as U1 does
for dialects) fully satisfies O1/O2 honesty.

### M10 — Excel numeric-ID precision loss is missing (P2/P3 omission)

Draft P2/P3 handle identifier-vs-number inference (default String, preview
warning) and Excel serial/format preservation. Neither draft nor discovery
mentions that Excel physically stores long numeric IDs as IEEE-754 doubles:
donor IDs longer than ~15–16 significant digits are already rounded in the
file before any import tool sees them — no raw-string preservation at import
time can recover the lost digits (the "rendered text" shows the rounded
value). This is the identifier analogue of the 1904 shift: silent, total,
downstream-invisible.

Why consequential: the brief centers "inconsistent identifiers"; a nonprofit
analyst importing 18-digit donor IDs from xlsx will get distinct donors merged
with zero quarantine signal under the current plan (the values parse cleanly
as numbers; nothing "fails").

Demand: add to P2/§2.1: Excel-sourced identifier-like columns with >15-digit
numeric cells get a preview warning ("precision may already be lost in-file;
confirm against source system") and the quarantine/reconciliation design gains
a rule for it (V5 identifier arm extended with an 18-digit xlsx-ID case, or a
V4b). Mark the exact digit threshold as verify-at-build (15 vs 16 vs 17) —
do not assert without a primary.

### M11 — V1 cannot discriminate window numbers although U2 claims it does (O6 methodology)

Draft U2: "exact default inference-window numbers unpinned (V1/V2
discriminate)". V1 fixture: 30k-row CSV, column numeric 25k rows then
`1e5`/text; PASS = default-window run quarantines the flip row, widened/pinned
rerun types correctly.

A flip at row 25,001 exceeds EVERY candidate bounded default (100, 1,000,
10k, 20,480). V1 therefore fails all bounded defaults identically and passes
only whole-file/pinned runs — it discriminates strict-vs-quarantine recovery
(valuable) but cannot select between 1k/10k/20480 (its claimed U2 job). Same
for V2 (break at row 25k vs any bounded dialect window). The draft's fixture
design contradicts its uncertainty bookkeeping.

Demand: convert V1/V2 into ladders: flips/breaks at rows ~500 / 5k / 15k /
25k, run each candidate default (100 / 1k / 10k / 20480) headlessly, and record
which windows catch which flips with what quarantine quality. THAT ladder
selects the default number (or shows no bounded default suffices, forcing
pinned-replay harder). Keep the current V1 PASS/FAIL as the recovery half
(V1a) and add the ladder as the sizing half (V1b). Small change, large
methodological payoff; without it U2 can never close.

### M12 — Secondary/tertiary O3 chains are snippet-corroborated, not body-observed (O3 honesty)

Draft §7 claims "O3 met: primary calamine epoch chain, secondary DuckDB
sampling chain, tertiary Polars window evolution". Primary chain: strong
(#706 page fetched, 436,919 bytes; bodies observed; fix now commit-confirmed
per C03). Secondary/tertiary: S06/S07 `observed_operations` list only
`web_search` calls — no issue-body fetches for DuckDB #6011/#17599/#21000,
PR #14097/#1674, or the v2 upgrade doc. The draft presents all three chains in
parallel prose that implies parallel evidence depth.

Demand: add one honesty sentence to O3 (draft §7 / discovery §3 intro):
"secondary and tertiary chains rest on search snippets plus third-party
research notes; issue/PR bodies were not fetched in this pass." Downgrade any
"maintainer reproduces and prescribes" phrasing to "snippet reports maintainer
prescribing" unless the body is fetched at build. O3 stays met (the brief
requires at least one chain, and the primary is genuinely traced); the demand
is only that the evidence gradient be visible.

---

## 3. Minor findings (fix in passing; none blocks)

- **m1 — P1 "aborts a strict DuckDB read past row ~20k (issues #17599/#21000)"
  over-cites.** Those issues (per S06/C01 context) concern dialect/quote
  mis-detection past the sample, not a type-flip abort. A type flip past the
  window plausibly aborts a strict read, but the cited issues do not show it.
  Soften to "risks aborting or misreading past the window (cf. dialect
  analogues #17599/#21000; type-flip abort to be confirmed by V1)".
- **m2 — `try_parse_dates` attribution.** Draft presents
  "`try_parse_dates`-style temporal guessing" neutrally; it is a Polars knob
  (S07, default off). Fine as written, but the reviser should keep the
  Polars attribution attached so a DuckDB-path builder does not go looking
  for the same knob name.
- **m3 — Polars `empty_string_is_null` / `null_values` dict form.** Stated as
  governing P3 mechanism; S07 locator supports `null_values` but the dict
  form and `empty_string_is_null` parameter name were not in the observed
  signature text quoted. Likely correct, but verify parameter names against
  the pinned Polars version at build (one-line hedge).
- **m4 — CleverCSV numbers.** "~97%", "+21 pts", "94.59% vs 100%" are all
  qualified as reported benchmarks (PyPI text, 2024 paper) — correctly
  handled. No change; do not let the reviser promote them to facts about
  S10 data.
- **m5 — qsv epoch surfacing (qsv #3905 / commit b5d4479).** Cited via S08
  without an observed qsv-side body. Plausible and correctly narrow (metadata
  JSON field); add "qsv-side body not fetched" hedge or verify at build.
- **m6 — V3 fixture construction.** A 1904-system xlsx saved by modern Excel
  (with `<x15:workbookPr/>`) is the right fixture and now matches a real
  regression test added upstream (`tests/date_1904_extlst.xlsx`, C03). Note
  the construction method in V3 (hand-edit flag + x15 element, or reuse the
  upstream fixture style) — otherwise V3 is unbuildable as specified.
- **m7 — V7 `:memory:`-only OOM control.** Deliberately OOMing a test run is
  a hazardous control (OOM-killer nondeterminism, CI destabilization).
  Replace with: run the designed path under a memory cap and assert spill +
  completion + flat streaming-verb RSS; assert the `:memory:` variant fails
  fast with a clear error OR document it as a manual-only check, not CI.
- **m8 — V9 "byte-identical" too strict.** Row order, float rendering, and
  manifest key order can differ without semantic divergence. Relax to
  logical equality (row multiset + cell values + rule IDs + counts; manifest
  match except run timestamps/input hashes), with byte-identity as
  aspirational.
- **m9 — V10 is a usability protocol, not a discriminating technical check.**
  Keep it, but specify n (≥3 pilot analysts), script (5 seeded rejects, no
  prompting), and scoring (all 5 reasons paraphrased correctly) — otherwise
  PASS/FAIL ("any 'what does this mean?'") is not repeatable.
- **m10 — V4 overflow case (`10000-01-01`).** Good boundary; note that the
  input representation matters (text vs serial vs ISO): specify the V4 sheet
  uses one cell of each representation so the test cannot pass by accident
  of representation.
- **m11 — "1462 days (4 years + 1 day)".** Correct as stated (the +1 day is
  the 1900 fiction). Verified (C05); preserve verbatim.
- **m12 — Trifacta/EasyMorph/KNIME/Talent and openpyxl-write handled
  honestly** ("noted, not deep-dived", "evidence absent, honestly stated").
  Preserve; do not let the reviser inflate into claims or silently drop the
  alternatives (O5 retention duty).
- **m13 — P5 "Export → fresh profile → import → rerun" (V9).** Good
  portability bar; ensure "fresh profile" is defined (no cache, no prior
  recipe, pinned engine versions installed) when V9 is operationalized.
- **m14 — Sample-window display ("window size, offsets").** After M1, drop
  "offsets" from the display spec unless engine-verified; "window size +
  engine + head-vs-full" is the honest display triple.

---

## 4. Per-P disposition audit (every clause)

Exact plan text (from `revealed-plan.md`): P1: "Infer column types from the
first 1,000 rows." P2: "Parse date strings using the machine locale." P3:
"Convert missing values to null." P4: "Keep failed rows in an error CSV." P5:
"Save transformation settings." P6: "Compare output row counts with inputs."

| P | Draft disposition | Critic verdict |
|---|---|---|
| P1 | CORRECTION + USER DECISION | **Agree.** Head-only 1,000 sits between documented engine defaults (100/20480, C01–C02) with the weaknesses of both. Correction direction (visible window, confirm/widen, pin on replay, identifiers-String, opt-in date guessing) is right. Subtract multi-offset (M1), subtract 10k-as-decision (M2), split escape costs (M3). |
| P2 | CORRECTION (blocking) + USER DECISION | **Agree, strongest correction in the draft.** Machine locale is nondeterministic across machines (C06 mechanism confirmed); epoch trap (C03/C05) is real and P2-orthogonal. Keep blocking-preview + pin-locale/format/epoch + dual preservation. Hedge May-2025 date (M5), verify serial-60 behavior (M4), add numeric-ID precision loss (M10). Rejections (machine-locale-as-truth, silent re-inference) correctly rejected. |
| P3 | CORRECTION + USER DECISION | **Agree.** Undeclared global nulling is unsafe; per-column sets + empty-string policy is the right correction and matches the spec's field-level `missingValues` (C04). Add the `""`-exclusion footgun sentence (C04). "No universal token list" uncertainty correctly retained. |
| P4 | ALREADY-COVERED (intent) + OPTIONAL ENHANCEMENT (substance) | **Challenge label, keep content.** Intent agreement is genuine (discovery requires quarantine-not-drop). The substance delta (rule IDs, counts, reversibility, run linkage) is mandatory brief-bar, not optional — relabel CORRECTION per M6. CSV-first phasing stays optional. |
| P5 | ALREADY-COVERED (intent) + CORRECTION (scope) | **Agree.** Discovery genuinely requires a versioned portable replay contract; "settings" genuinely underspecifies it. The pinned-field list (dialect, encoding+BOM, epoch, schema, locale+format, versions, windows, overrides, manifests) is complete and each item traces to an O2 finding. Keep re-inference-opt-in and drift-remap (V8). |
| P6 | ALREADY-COVERED (intent) + CORRECTION (substance) | **Agree with provenance fix.** Counts-necessary-but-insufficient is demonstrated by three row-preserving corruptions (epoch shift, locale flip, dialect scramble) that all survive a count check — the draft's best single paragraph of adversarial reasoning. Add the M7 sentence marking the blocking suite as introduced-here. |

No P disposition is reversed. No false correction found: every CORRECTION
targets a genuine defect in the thin plan, and every REJECTED item (silent
leniency, single-engine simplification, machine-locale-as-truth, silent
re-inference) is rejected for stated evidence, not taste. The one
false-precision risk is inside corrections (M1–M3), not in the dispositions.

---

## 5. Discovery, alternatives, and omissions (O1/O2/O5)

**Discovery breadth (O1): genuinely met.** From a plan-blind brief the research
stage surfaced three engine families with distinct memory stories, a scored
dialect-detection literature with an open successor benchmark, an epoch-aware
Excel reader family, a declarative contract/validation family, a recipe-based
cleaner, and two commercial UX benchmarks — each tied to a brief requirement
(memory, replay, rejected-rows, inference preview). The "evaluate before
building" retention of un-dived tools satisfies O1 without padding.

**Alternatives retained (O5): well kept.** Engine-per-verb, declare-then-check
vs guess-then-patch phasing, unranked dialect detectors, calamine-first with
openpyxl-write alternative, commercial-benchmarks-as-UX-bars, and the explicit
D1–D9/E1–E6/U1–U6 registers are exactly what O5 asks for. The reviser must
preserve all three registers (decisions, capabilities, uncertainties) and the
"disagreement retained" paragraph — see §6.

**Omissions (beyond M9/M10):**

- **O-a (minor): pandas `low_memory` whole-column inference** appears only
  inside a cited comparison table. Given the audience (nonprofit analysts
  likely arriving from pandas/Excel), one sentence on why pandas-eager is not
  the large-CSV path (whole-column inference cost, `low_memory` chunked-type
  pitfalls) would close the "why not just pandas?" question. Optional; do not
  manufacture benchmarks.
- **O-b (minor): date-format detection libraries** (dateutil, arrow,
  chrono/dateparse guessing) are never named although per-column format
  confirmation is a D3 user decision — the preview needs a guesser to confirm.
  Name the candidate guesser class as open (same treatment as M9), or state
  that format proposals come from the engine's own parser errors. One
  paragraph; no deep dive required.
- **O-c (not an omission — explicitly out of scope, correctly):** commercial
  internals, S10-owned prior releases, styled-write read path. The draft's
  "evidence absent/inapplicable" statements here are honest and O3-compliant.
  The reviser must not fill these with invented behavior.

---

## 6. Supported findings the reviser must preserve (M04 amendment duty)

Under amendment-preservation the rewrite keeps every supported finding below
or shows the evidence overturning it. All are supported by C01–C06 and/or
correctly-cited S-sources:

1. P1/P2/P3 corrections and their user-decision splits (minus M1–M3 hedges).
2. P5/P6 intent-agreements and correction scopes (plus M7 sentence).
3. Dual preservation (typed + raw; Excel serial + format code + rendered text
   + epoch) and run manifests with drift diffing.
4. Quarantine-not-drop with rule IDs, counts, accepted+quarantined=input, and
   explicit/logged/reversible leniency only.
5. Pinned replay without silent re-inference; drift surfaced as
   new/extra/missing with remap; re-detect-and-diff as explicit opt-in.
6. Engine-per-verb; single-engine simplification stays rejected.
7. Identifiers default String; dates require pinned locale+format (+epoch);
   day/month ambiguity and 1904 detection are blocking preview questions.
8. Per-column missing-value sets with explicit empty-string policy; no
   universal token list.
9. Excel facts: serial 60 fiction, 1462-day offset, flag location, x15 reset
   hazard, pre-1900/9999 limits (plus C03 upgrade: fix commit exists).
10. Engine defaults: DuckDB 20480/`-1`, Polars 100/`None`/0,
    `infer_schema_files`=10 (minus multi-offset until verified).
11. D1–D9 / E1–E6 / U1–U6 registers and the retained-disagreement paragraph.
12. O6 honesty: executed = read-only observations only; V1–V10 proposed, none
    run; usage/billing null.

---

## 7. Validations audit (O6): executed vs proposed

**Executed (E-read-1…8): fairly separated, one overstatement.** The draft
honestly states no parser/sniffer/engine/fixture ran and no witness ran. The
fetch/byte-count/timestamp accounting is precise. Overstatement: E-read-7/8
"observed sampling defaults, recovery pattern, ignore_errors trap,
spill-vs-OOM" via *search* are presented with the same "observed" verb as
fetched page bodies — see M12; the recovery-pattern and spill-vs-OOM items
rest on snippets/notes, not bodies. One-word fix ("snippet-observed").

**Proposed (V1–V10): strong set, three repairs needed:** V1/V2 → ladders
(M11, required); V7 control → capped-spill not deliberate-OOM (m7); V9 →
logical equality (m8); V10 → mini-protocol (m9); V3 → construction note (m6);
V4 → raw-serial serial-60 check (M4) + representation coverage (m10); V5 →
add xlsx long-ID precision case (M10). V6/V8 stand as written (V6 additionally
selects the M9 detector choice — say so).

**No-runtime honesty: exemplary.** "No runtime available is honest; do not
pretend proposals ran" (O6) is fully honored. The reviser must keep the
executed/proposed split and must not convert any V-item to past tense without
an actual run.

---

## 8. Demands considered and refused (invalid-critic prevention)

- **Demanding runtime execution of V1–V10 here.** Refused: no qualified
  sandbox exists in this stage; the assignment explicitly permits proposing
  checks honestly. Execution belongs to build, not critique.
- **Demanding commercial-internals deep dives (Prep/M-engine/Trifacta).**
  Refused: the brief asks for behavior benchmarks at modest scope, and the
  draft's docs/UX-level treatment with stated limits is proportionate. O6
  scope ("this small product brief, not unlimited production guarantees")
  forbids this escalation.
- **Demanding a single-engine simplification or a universal missing-token
  list.** Refused: the draft's rejections/non-proposals here are
  evidence-backed (per-verb memory shapes; per-column missing semantics).
  A critic demand for simplicity would be the false correction.
- **Demanding removal of the 1904/x15 handling as edge-case gold-plating.**
  Refused: C03 confirms a real-world, silent, 4-year shift fixed only in
  2026-08; for archival nonprofit data this is core correctness, not an edge.
- **Demanding P4's quarantine table as day-one mandatory store.** Refused:
  the draft's CSV-columns-first phasing with mandatory semantics is a sound
  cut-line; M6 only fixes the label so the semantics survive the cut.

---

## 9. Close-out

- Critic stage complete: all of §2 (12 material) and §3 (14 minor) findings
  are actionable by the reviser without new research except where "verify at
  build" is marked (M1 engine version, M4 serial-60 output, M5 host floor,
  M8 spill pins, M9/M10 thresholds, O-b guesser naming).
- No P disposition reversed; three blocking corrections confirmed; supported
  findings enumerated in §6 for preservation.
- Evidence: `source-map.json` (C01–C06, immutable, no silent rebind),
  `sources/critic-evidence.md` (bounded excerpts), `sources/index.md`.
- Native Goal terminal completion follows artifact save (this file plus
  source-map plus sources index were saved before completion per assignment
  §2). Usage/billing unobserved null.
