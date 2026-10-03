# Independent candidate critique — V8-BIO-COND-C-Z-S8

Fresh same-family candidate critique of the frozen `inputs/PROPOSAL.md` against
`inputs/BRIEF.md`, `inputs/THIN_PLAN.md`, `inputs/METHOD.md`, `inputs/UNRESOLVED_LEADS.md`,
and this case's raw public-source captures. Written as critique only — not a host ledger,
not a replacement proposal.

**Method.** I re-read the packaged captures and independently re-retrieved the cited public
sources at their pinned versions (ome/ngff tag 0.4.0 prose + image schema + two valid
examples; ome-zarr-py v0.19.2 `reader.py`/`axes.py`, PR #652 JSON + `.diff`, release v0.19.2;
napari issues #9121/#6320/#8814, release v0.9.2; vitessce issues #2199/#2343; ome-zarr-py
issue #172). I checked every normative claim against the cited locator and surrounding
context. Like the candidate, I have no arithmetic-executing deterministic tool in this
environment; all witness arithmetic below was recomputed by inspection (simple decimal
products/quotients) and agrees everywhere it is claimed. Nothing here claims a runtime test.

---

## 1. Source verification results

Verified correct at the pinned version (capture or independent re-retrieval):

- **S1** (`55976a60…`, 934 lines — count and sha match): Zarr-v2/`.zattrs` MUSTs L105–110;
  [third-party excerpt omitted] L117; array-name-arbitrary L135–136; label-dims advisory
  ("should", L152–154); axes rules L226–232, including the prose spelling **`"unit"`** at
  L228 and [third-party excerpt omitted] in the example L296; transform table incl. `path` forms
  L244–247 and identity-as-default L245; sequential-in-order application L252; datasets
  ordered largest→smallest MUST L270; exactly-one-`scale` MUST + set-to-1 L275; translation
  after scale L276; vector lengths equal to axes L277; multiscale-level transforms MAY +
  applied after L280–282; name/version SHOULD L284; multi-multiscales selection L329–341;
  labels L382–393 incl. [third-party excerpt omitted] L393; `image-label` MUST
  multiscales + equal dataset-series counts L400–401; `source.image` default `../../`
  L419–423. All locators accurate.
- **S2** (`57b355b9…`): datasets require `path`+`coordinateTransformations`; exactly one
  `scale` enforced by `contains`+`maxContains: 1`; `version` enum `["0.4"]`; axes 2–5 with
  2–3 `space` via `minContains`/`maxContains`; per-axis `units` optional string; items
  `oneOf` scale|translation **only** (no `path` form, no explicit `identity`);
  multiscale-level `coordinateTransformations` permitted. All as claimed.
- **S3**: `mismatch_axes_units.json` (`fe1cec03…`, time axis with [third-party excerpt omitted])
  and `invalid_axis_units.json` (`fab72ea3…`, y [third-party excerpt omitted]) — both schema-valid,
  both as described. Additional observation the candidate missed: `mismatch_axes_units`
  also has a 2-element `scale` against 3 axes, violating prose L277 while passing the
  schema (which only requires `minItems: 2`) — direct evidence that the prototype's §4
  length-matching gate checks something the schema does not.
- **S4**: `reader.py` (`c46ba936…`) — [third-party excerpt omitted]
  silent default; [third-party excerpt omitted]
  (dataset-level only; no multiscale-level handling anywhere); labels child node added
  `visibility=False`; `Label` spec warns when `image-label.source.image` unresolved.
  `axes.py` (`50583547…`) — axes-type rules exactly as claimed (time first, ≤1 channel,
  space after channel, ≤1 unknown type; `ValueError`s), and unit warning code exists.
- **S5**: PR #652 merged 2026-09-08T15:31:11Z, merge commit `94eaf20…` = v0.19.2 tag
  commit; diff (`50b0c983…`) rewrites `transform.input.path` with `datasets[].path`, raises
  `ValueError` when `input is None`; new test `test_normalize_resolution_level_paths`
  asserts both [third-party excerpt omitted] and `coordinateTransformations[0].input.path ==
  "s{i}"`; fixture uses levels `0,1,2` with 0.6-style `input`/`output` transforms. Release
  v0.19.2 (2026-09-08T20:23:20Z) lists PR #652 as its only change. The complete
  issue → fix → test → release chain is genuine.
- **S6**: #172 open, created 2022-03-02, cites ome/ngff PR #85; read-path absence
  independently corroborated by `reader.py`.
- **S7**: #9121 (open, 2026-06-29; `.data` per-level subscriptable, `.scale` single-level —
  verbatim consistent); #6320 (open bug, 2023-10-09; both quoted phrases appear verbatim);
  #8814 (created 2026-03-26, closed 2026-03-27 by the reporter, `napari-ome-zarr 0.7.2` in
  the environment, BigDataViewer same-symptom report — all verified; see §6 R3 for the
  one detail I could not re-check).
- **S8**: #2199 (open, 2025-07-23; [third-party excerpt omitted]; `bioformats2raw.layout` nesting unsupported) and #2343 (open,
  2025-11-21; [third-party excerpt omitted]; zipped ome-zarr already
  supported per #1818) — both as characterized.
- **napari v0.9.2** release (2026-09-29): [third-party excerpt omitted]; EffVer monthly release policy — both support §1's constraints.

No fabricated or misattributed source was found. Quotes are verbatim; conditions and
exceptions are preserved (e.g., #6320's [third-party excerpt omitted] is kept with its condition; #9121 is correctly treated as observed behavior,
not a napari admission of a bug).

---

## 2. Assessment of the three questions

- **Q1 — met.** Two genuinely independently discovered components (napari, Vitessce) with
  version-specific, verified constraints; the napari-embed recommendation comes with a
  concrete tradeoff, and the Vitessce rejection rests on verified loader assumptions
  (#2199, #2343). Minor: a few general napari capability claims in §1 (affine
  scale/translate to world coordinates, first-class cursor/labels) rest on general product
  knowledge rather than a pinned source; they are uncontroversial, and all *load-bearing*
  version-specific claims are evidenced.
- **Q2 — met.** All nine §2 sub-claims verified at their cited lines (see §1). The
  declaration-vs-guarantee distinction is explicit (§2.9) and corroborated upstream
  (separate hidden label nodes; open #6320). Two labeling defects: CR-2 and CR-3 below.
- **Q3 — met.** The chosen chain is real, merged, released, and tested, with the test
  asserting exactly what the proposal says it asserts. The scoped lesson (path-graph, not
  naming convention) is a fair inference, clearly labeled. Corroborating history is
  correctly labeled "not fix chains".

## 3. Assessment of the five obligations

- **B1 — met.** Contract, version gate (with the observed silent-`"0.1"` justification),
  scope gates, read-only boundary, absent-label and unsupported-input visible states are
  all specified, and refusal-before-render is stated.
- **B2 — met, one grounding correction.** Per-level `p = i·s + t` with optional
  multiscale-level composition matches the verified normative text; version, conditions,
  metadata scope, units (incl. the verified prose `unit` vs schema `units` split), and
  fallback behavior are all explained. CR-2 fixes the upstream-mirroring claim.
- **B3 — met, one substantive correction.** Level model, cursor-stationary switching, and
  categorical nearest-neighbor sampling are sound; refusal states are enumerated and
  actionable. But the §6 extent predicate (C2) has a real defect: CR-1. Two gaps: CR-6
  (count-mismatch comparison rule unspecified) and CR-7 (sub-region labels absent from
  visible limits).
- **B4 — met.** Two implementations compared with observed/inference/product separation;
  one verified issue → fix → test chain.
- **B5 — met.** Thin-plan mapping is complete; V1–V12 are discriminating in the ways
  claimed (V1 separates H1/H2/H3); visible limits are stated; unresolved leads each name
  the decision they affect and a next step; nothing claims an executed test. CR-5 adds a
  tolerance-boundary case the matrix lacks.

**Unresolved obligations: none blocking.** Every brief obligation is addressed by the
actual proposal; the corrections below are precision/strengthening fixes plus one
predicate defect (CR-1) that must be corrected before implementation, not before pass.

---

## 4. Findings and corrections

### CR-1 — §6/C2 extent predicate tests only the far endpoint (substantive; supported correction)

§6 defines extent as the half-open interval `[t, t + shape·s]` and admits when

`|t_img + shape_img·s_img − (t_lbl + shape_lbl·s_lbl)| ≤ ε_a`.

Only the *far* endpoint is compared; the start `t` is never tested, so the formula does not
implement its own stated intent ("physical extents agree per axis").

**Counterexample (derived from F1):** image level-0 x extent `[2.5, 2.5 + 512·0.4] =
[2.5, 207.3]`. A count-mismatched single-level label, shape 131×256 (y,x), scale
`[1.0, 0.8]`, translation `[10.0, 102.5]`, has x extent `[102.5, 102.5 + 131·0.8] =
[102.5, 207.3]`. Far endpoints are equal exactly, so `0 ≤ ε_x = 0.5·max(0.4, 0.8) = 0.4`
and the overlay is **admitted** (with only the L400–401 note), although the label physically
starts 100 µm into the image and covers roughly half of it. This is exactly the unjustified
alignment the predicate exists to refuse.

**Fix:** require both endpoints within ε per axis, i.e. `|t_img − t_lbl| ≤ ε_a` **and**
`|end_img − end_lbl| ≤ ε_a` (or, equivalently, interval distance
`max(start-gap, end-gap)`). F1 itself remains valid under the fixed rule (both endpoints
match exactly); V11/V12 expectations are unchanged; add the counterexample above as a
withhold case.

### CR-2 — "warn-don't-fail" is not the v0.19.2 read path's unit behavior (grounding precision)

§5 grounds the non-canonical-unit badge in "ome-zarr-py's warn-don't-fail stance (S4)".
In v0.19.2, `Multiscales.__init__` calls [third-party excerpt omitted] **without** `axes_units`;
`axes.py` warns on unknown units only when they arrive via that separate `axes_units` dict.
Inline 0.4 `"units"` values are therefore neither warned about nor rejected on the actual
read path — they are silently carried. What is defensibly `[OBSERVED]`: units never cause
errors, and a warn capability exists in `Axes.__init__`. The badge remains a `[PRODUCT]`
choice — in fact it is *more* informative than upstream, which ignores inline units
entirely. Re-word the grounding accordingly.

### CR-3 — `[SPEC-SHOULD]` overstates the normative force of the multiscale-selection text

§2.7 labels L329–341 `[SPEC-SHOULD]`. The passage is informative prose plus pseudocode
([third-party excerpt omitted]; comment [third-party excerpt omitted]) with no RFC-2119 keyword. Label it informative; the §4 `[PRODUCT]` behavior (use
the first, visible note) is unaffected and matches the example's default.

### CR-4 — path-form and explicit `identity` transforms are also schema-invalid (strengthening)

§5 refuses `path`-form transform vectors as out of scope `[PRODUCT]`. Stronger: the 0.4
image schema (S2) permits only `scale`|`translation` items, so `path`-form and explicit
`{"type":"identity"}` entries at dataset level are schema-invalid even though the prose
table (L245–247) allows them. Citing schema non-conformance in the refusal message makes
it more actionable. Related enrichment for the B1 rationale: the shipped schema-valid
example `mismatch_axes_units.json` has a 2-element scale against 3 axes, violating prose
L277 — concrete proof that §4's length-matching gate excludes inputs the schema alone
would admit.

### CR-5 — ε tolerance is never exercised by the witness or validation matrix (test gap)

F1's single-level label matches the image extent exactly at both endpoints (difference 0),
so *any* ε ≥ 0 admits it: the tolerance semantics are untested. The cursor readout does
discriminate its stated assumptions (H1 42.5 vs H2 42.0 vs H3 22.5 µm on x — all three
values recomputed and confirmed; H2's y-degeneracy at scale 1.0 is honestly noted). Add
boundary cases: label translation x = 2.8 → endpoint difference 0.3 ≤ ε_x = 0.4 → admit;
x = 3.0 → difference 0.5 > 0.4 → withhold. Add CR-1's start-offset case as a withhold case
once the two-endpoint rule is in.

### CR-6 — count-mismatch comparison rule is unspecified (specification gap)

For a 1-entry label series against a 2-entry image series (the brief explicitly allows
this), §6/V11 never state which image level's extent and transform the single label level
is compared against. V11's expected outcome is ambiguous until the rule is fixed (e.g.,
compare against the image level with the closest scale, or against every level and admit
on agreement with any). State the rule in §6 and make V11 assert under that rule.

### CR-7 — sub-region labels are withheld but not listed as a visible limit

A label with self-consistent transforms covering a strictly smaller physical region —
e.g. 128×128 at translation `[10.0, 2.5]`, scale `[0.5, 0.4]`: x extent `[2.5, 53.7]`
vs image `[2.5, 207.3]` — is refused by predicate 4 even though its placement would be
correct. Conservative withholding is a defensible `[PRODUCT]` choice (0.4 only *advises*
[third-party excerpt omitted], L152–154), but the brief explicitly permits differing shapes, so this
belongs in §8's "Visible limits" and ideally as its own refusal string distinct from
"extents differ beyond tolerance".

---

## 5. Residual items I could not independently verify (marked, not asserted)

1. **napari #8814's resolution detail.** Verified: dates, closed-by-reporter,
   `napari-ome-zarr 0.7.2`, BigDataViewer same-symptom report. The specific claim that the
   levels were writer-side cropped lives in the issue comments, which I did not retrieve;
   it is used only as labeled third-party corroborating history, so nothing load-bearing
   depends on it.
2. **Tag→commit mappings.** The ome/ngff 0.4.0 → `0f033738…` attribution was not
   independently re-checked, but the captured blob's content, line count (934), sha, and
   every cited locator verify, and the text matches the published 0.4 specification.
3. **Vitessce v4.0.10 release metadata** (date/version) was not re-retrieved; both S8
   claims that affect decisions rest on issues #2199/#2343, which verify. Consistent with
   UNRESOLVED_LEADS item 4.

These correspond to, and do not weaken, the proposal's own unresolved leads (which are
genuine, decision-linked, and correctly marked as unexecuted/unmeasured).

## 6. Bottom line

The proposal is well-sourced: every checked consequential claim verifies at its cited
version with conditions and normative force intact, the Q3 chain is genuine end-to-end,
the witness arithmetic is correct and its readout discriminates the three stated
interpretations, and observed/inference/product separation is maintained throughout.
Required corrections before implementation: **CR-1** (two-endpoint extent predicate),
**CR-6** (count-mismatch comparison rule). Corrections for grounding precision:
**CR-2, CR-3**. Strengthenings: **CR-4, CR-5, CR-7**. No obligation is unmet; no
consequential source dependency is silently unresolved.
