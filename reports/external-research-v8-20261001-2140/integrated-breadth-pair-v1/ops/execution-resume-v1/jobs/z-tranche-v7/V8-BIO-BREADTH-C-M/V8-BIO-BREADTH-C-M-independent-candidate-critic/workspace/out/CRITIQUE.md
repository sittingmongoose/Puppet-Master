# CRITIQUE — independent candidate review of frozen `inputs/PROPOSAL.md`

Case V8-BIO-BREADTH-C-M, candidate-critic stage. This is a fresh same-family critique, not
independent evaluator feedback. No evaluator rulings, sibling cases, or prior candidate reasoning
were used. Every consequential claim in the proposal was re-checked against public primary sources
that I retrieved independently at the cited locators (admitted `public_https_get`; sha256 of exact
response bytes recorded per claim). Labeling: **[SRC]** = source fact at a cited locator;
**[INF]** = my inference (reasoning shown); **[PRODUCT]** = product choice; **[CORRECTION]** =
supported correction to the proposal; **[NOTE]** = observation requiring no change.

Verdict up front: **the proposal is substantively sound and stands.** All its spec quotations and
the issue→fix→test chain verified exactly. Six corrections follow — one substantive (the units-aware
scale bar arrives in napari 0.7.1, not 0.6.5), one locator error, one quote-elision, and three
normative-force/attribution precision fixes. No fabricated claims, no overclaimed execution: the
proposal correctly marks Section 8 fixtures as planned and unexecuted, and this critique likewise
executed no tests or arithmetic — all checks below are source-text comparisons and shown inference.

---

## 1. Independent verification of the evidence base

My captures (exact HTTP response bodies, sha256) vs the proposal's cited hashes:

| Src | Locator I fetched | My sha256 (prefix) | vs proposal |
|-----|-------------------|--------------------|-------------|
| S1 | `raw.githubusercontent.com/ome/ngff-spec/a4c68004fdb8a8d822367205dc12f9574a32ddf8/index.md` (36,817 B) | `fc39309d…` | **identical** — front matter `version: 0.4`, `date: 2023-05-25`, `status: w3c/CG-FINAL` confirmed; RFC 2119 clause confirmed in §Document conventions |
| S1 pointer | `api.github.com/repos/ome/ngff/contents/specifications/0.4` | `9999a8b7…` | **[SRC]** `type: "submodule"`, `submodule_git_url: ome/ngff-spec`, sha `a4c68004fdb8a8d822367205dc12f9574a32ddf8` — the proposal's S1 submodule locator is exact |
| S2 | vizarr `README.md` @ `master` | `e2b6135a…` | **identical** — "minimal, purely client-side program for viewing zarr-based images"; web app + anywidget; Limitations: generic Zarr "supported but not as well tested" |
| S3 | vizarr `package.json` @ `master` | `bddde203…` | **identical** — version 0.3.0; `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, `deck.gl ~9.1.0` |
| S4 | vizarr `src/ome.ts` @ **`master`** | `bb228cc5…` | bytes **identical**, but see CORRECTION C2 (branch mislabeled `main`) |
| S5 | `api.github.com/repos/napari/napari/issues/7962` | `eb82e8d9…` | **identical** — created 2025-05-23, closed 2025-09-24, `state_reason: completed`; body matches the quoted failure |
| S6 | `…/pulls/8098/files` | `7dabd78b…` | **identical** — patch matches the described fix and test verbatim |
| S6+ | `…/pulls/8098` (my addition) | `ba020697…` | merged 2025-09-24T09:07:55Z, milestone 0.6.5, closes #7962 — as cited |
| S7 | `…/releases/tags/v0.6.5` | `5265faad…` | **identical** — published 2025-10-02, notes dated Wed, Oct 1, 2025; Bug Fixes: "Fix effect of scaling when converting shapes to labels (#8098)" |
| S8 | `labels.py` @ tag `v0.6.5` (61,353 B; key docstrings in delivered range) | `e10bf6b4…` | **identical** — all quoted docstrings verified (see §3) |
| S9 | `…/pulls/8917` (direct PR JSON) | `2b264cb0…` | claims verified: title, merged 2026-05-13, milestone 0.7.1, closes #6418, `layer.locked_data_level = int` API. [NOTE] the proposal's cited S9 hash `935fd152…` is a search-endpoint capture not reproducible by direct fetch; claims, not the hash, were checked |
| S10 | `…/pulls/9495` | `3df623b1…` | title, merged 2026-09-25, milestone 0.9.2, body: extract "with `scale` and `translate` corrections so they align with the original full resolution image" — as quoted |
| S11 | `…/ome/ome-zarr-py/releases/tags/v0.19.2` | `1085265c…` | **identical** — published 2026-09-08; sole change PR #652 "bug: correctly normalize resolution level paths"; `target_commitish: master` |
| new | `…/napari/releases/tags/v0.7.1` | `8016c43e…` | released 2026-06-15; Improvements lists #8917; highlight "Scalebar with units" — basis of CORRECTION C1 |
| new | `…/pulls/8098` PR description | `ba020697…` | residual-limitations note — basis of §4 W2 |

Seven of the proposal's eleven cited capture hashes reproduced byte-for-byte; the four that did not
(S9, S10 search-JSON captures; two repo-metadata hashes) had every claim independently confirmed at
the primary locator. S12 is contained in S1 (§Implementations) and is confirmed: ome-zarr-py —
"A napari plugin for reading ome-zarr files." (exact); vizarr listed (see C3 for the quote).

## 2. Supported corrections

**C1 — [CORRECTION] B2's units-aware scale bar is a napari ≥ 0.7.1 feature, not 0.6.5 (cite S7′).**
Proposal (B2): "the toolkit's units-aware scale bar (napari 0.6.x scale_bar overlay, S7)" with S7's
Other-PRs entry "Use global register for units in ScaleBar (#8226)". [SRC] napari **v0.7.1** release
notes (my capture `8016c43e…`, highlight "Scalebar with units"): "In previous versions of napari, if
you added a scale bar using **View > Scale Bar > Scale Bar visible**, it was shown with **no units**.
In napari 0.7.1 we now set default unit to `pixel` in #8900 and also add calculation of units for
scale bar based on currently added layers in #8907 and #9007, **if they have units set and are
logically consistent across layers**." So #8226 in 0.6.5 is an internal register refactor; the
user-visible units display lands in 0.7.1. Fix: pin the B2 scale indication to napari ≥ 0.7.1 (the
same floor B3 already requires for `locked_data_level` — the recommendation survives unchanged) and
preserve the source condition: units appear on the scale bar only when layer units are set **and
logically consistent across layers** — exactly the situation of fixture F3 (units absent), where the
proposal's "units: unknown" fallback remains necessary and correct.

**C2 — [CORRECTION] S4 locator: `src/ome.ts` is at branch `master`, not `main`.** Fetching from
`master` reproduces the proposal's cited sha256 `bb228cc5…` byte-for-byte; S2/S3 themselves cite
`master`. Content claims are all verified (see §3); only the branch label in the citation is wrong.

**C3 — [CORRECTION] S12 quote elision.** S1 §Implementations describes vizarr as "A minimal, purely
client-side program for viewing Zarr-based images **with Viv & ImJoy**." The proposal drops the
trailing clause without an ellipsis. Meaning is unaffected; restore the full quote or mark the
elision. The ome-zarr-py quote is exact.

**C4 — [CORRECTION] Scope of the 1024-color caveat (S8).** The sentence "the layer will render
incorrectly if they map to more than 1024 distinct colors" is in the docstring of the **deprecated**
`color` dict attribute ("Custom label to color mapping … DEPRECATED: set ``colormap`` directly,
using `napari.utils.colormaps.DirectLabelColormap`"), not a general statement about all label
rendering. The proposal's B5 "Visible limits" line (">1023 distinct label values risk degraded
rendering") remains a fair, conservative risk statement, but should attribute the cap to the
documented deprecated-mapping caveat and tie it to its own unresolved lead 5 (DirectLabelColormap at
the cap). No behavioral change.

**C5 — [CORRECTION] B1 check 2 is labeled [SRC] but the "root MUST contain `multiscales`" is not an
explicit S1 MUST sentence.** S1 §multiscale-md says "Metadata about an image **can be found** under
the `multiscales` key"; the MUSTs govern the *contents* of each multiscales entry (axes, datasets,
per-dataset `coordinateTransformations`), and those I verified verbatim. Requiring the key at the
root is the right product gate for an image-only viewer, but relabel it [PRODUCT input contract
keyed to S1's image definition] rather than [SRC MUST]. Field-level MUSTs cited there (axes length
equal to array dimensionality; 2–3 `space` axes; exactly one `scale` per dataset; translation after
scale; array lengths equal to axes length) are all exact S1 text and stand.

**C6 — [CORRECTION, minor] Two normative-force precisations.** (a) The 2–5 bound on axes length is
stated in S1 with lowercase "must" ("The length of 'axes' must be between 2 and 5 and MUST be equal
to the dimensionality…"); the RFC 2119 MUST attaches to the equality and to "MUST contain 2 or 3
entries of 'type:space'". (b) "Multiple `multiscales` entries MAY exist" is [INF] from the list
structure plus the explicitly informative pseudocode ("If only one multiscale is provided, use it.
Otherwise, the user can choose by name, using the first multiscale as a fallback") — there is no
stand-alone MAY sentence; the proposal already labels the pseudocode informative and should label
the multiplicity inference [INF]. Neither changes any proposed check's outcome.

## 3. Verified source claims (spot-check results, quotes confirmed exact)

- **S1, all quoted clauses verified verbatim** at the pinned tree: `name` MUST + uniqueness; `type`
  SHOULD (space/time/channel, MAY custom); `unit` SHOULD, UDUNITS-2 lists; in multiscales context
  axes length MUST equal array dimensionality; type ordering (time → channel/custom → space) MUST;
  dataset `path`s "MUST be ordered from largest (i.e. highest resolution) to smallest"; transforms
  "applied sequentially and in order"; only `translation`/`scale` types; "exactly one `scale` …
  pixel size in physical units", per-axis fallback "MUST express the scaling factor between the
  current resolution and the first resolution … defaulting to 1.0"; translation "MAY … MUST be
  listed after `scale` to ensure that it is given in physical coordinates"; multiscales-level
  transforms "applied after them"; `name`/`version` SHOULD; arrays MUST be Zarr **v2** and NGFF
  metadata MUST be in group attributes; `{"labels": [...]}` and "Unlisted groups MAY be labels";
  `image-label` "MUST also contain `multiscales`" + "the two 'datasets' series MUST have the same
  number of entries"; `colors` SHOULD with integer `label-value` MUST, rgba MUST be four uint8,
  uniqueness MUST with client remedy "SHOULD ignore all except the *last* entry"; `properties` MAY;
  `source.image` default `"../../"`; `version` SHOULD; label dimension sizes stated only with
  non-normative lowercase "should". The proposal preserved these conditions and modal forces
  accurately.
- **S8 (napari v0.6.5 `labels.py`) verified**: "Must be integer type or bools"; floating data raises
  `TypeError`, bools viewed as uint8 (`_ensure_int_labels`); "multiscale rendering is only supported
  in 2D. In 3D, only the lowest resolution scale is displayed"; `_reset_editable` sets
  `self.editable = not self.multiscale`; `units` docstring "…default units are assumed to be pixels";
  `affine` "Applied as an extra transform on top of the provided scale, rotate, and shear values";
  1024-color caveat (see C4 for its scope).
- **S4 (vizarr `ome.ts`) verified**: `loadOmeMultiscales` resolves the `labels` group
  (`resolveOmeLabelsFromMultiscales`), opens each listed label, asserts `image-label` metadata
  (`utils.assert(utils.isOmeImageLabel(attrs), "No 'image-label' metadata.")`), loads the label
  multiscale, maps `colors` (`label-value`, `rgba`), and returns `modelMatrix:
  utils.coordinateTransformationsToMatrix(attrs.multiscales)` for image and labels independently.
  **[SRC]** Confirmed by inspection of the whole file: there is no cross-check between the image and
  label model matrices and no refusal state on misalignment — the proposal's "observed gap" is
  accurate. **[NOTE]** the assert throws on a label group lacking `image-label` (an error, not a
  graceful skip), consistent with the proposal's choice not to reuse vizarr's admission logic.
- **Q3 chain fully verified**: S5 failure text and dates; S6 patch — `_convert` now derives
  `ll_shape = ll._extent_world_augmented[1] - ll._extent_world_augmented[0]` and calls
  `lay.to_labels(labels_shape=lay.world_to_data(ll_shape))`; `test_make_label_from_shape_param`
  parametrized ((1,1)/(0,0) pass; (5,5)/(0,0) pass; (1,1)/(30,30) `pytest.xfail('Converting layers
  with translations does not work')`), asserting `ll[-1].extent.world == ll.extent.world`; merged
  2025-09-24 into milestone 0.6.5; shipped in v0.6.5 Bug Fixes. Corroborator ome-zarr-py v0.19.2
  verified (see §1).
- **B3 pin feasibility**: napari v0.7.1 exists (released 2026-06-15) and lists #8917, so "pin
  napari ≥ 0.7.1 for `locked_data_level`" is executable today, not just merged-on-main.

## 4. Witness recipes: candidate's own values and discrimination

- **Cursor formula `p_a = S_a·(s_{d,a}·i_a + t_{d,a}) + T_a` — [INF] derivation checks out.** From
  S1: the dataset-level list is applied "sequentially and in order", and translation, if present,
  "MUST be listed after `scale` … in physical coordinates", so dataset-level maps index →
  `s·i + t`; the multiscales-level list "MUST follow the same rules about allowed types, order" and
  "are applied after them", giving `S·(s·i + t) + T` with per-axis components. Since a dataset MUST
  contain exactly one `scale`, a translation-only level is impossible; `identity` is "the default
  transformation", so absent translation ≡ 0 as B2 states. F1's expected `cursor = s·i` and F2's
  composed expectations are consistent with the formula. **[NOTE]** the formula, and the spec, make
  "physical" coordinates only as absolute as the per-axis scale semantics allow: where unit/scaling
  info is unavailable for an axis, the scale value is a *relative* level factor — see counterexample
  X2.
- **Upstream test discriminates the stated assumption.** The proposal's lesson is that translation
  handling remained broken post-fix. The parametrization isolates exactly that: scale-only and
  default pass, translation xfails; the asserted property (world-extent equality) is the one the
  fix targets. **[SRC]** Strengthening evidence the proposal did not cite: PR #8098's own
  description (my capture `ba020697…`, "New issues for consideration") states that
  `to_layers`/`to_labels` "assumes that the minimum world x and y values are zero … When this
  occurs, regions of the canvas with a negative x or y value are not accessible in the label.
  Fully resolving the intent of issue 7962 would require applying both the minimum and maximum
  coordinates of the canvas to the label." The proposal's scoped lesson (compose both scale and
  translation; include offset-only fixtures because that is where upstream still fails) is thus
  confirmed twice, by the xfail and by the fix author's residual-limitation note. F2 (nonzero
  translations, both levels) is the right discriminating fixture.
- **Tolerance ε and admission test 4 are load-bearing [PRODUCT]** — correctly flagged as
  format-unspecified (see X1 for why the test must exist at all).

## 5. Counterexamples (spec-conforming inputs the design must survive)

- **X1 — conforming, misaligned label levels.** Image with two levels; level-1 dataset transforms
  `scale [1,1,0.5,0.5]`, `translation [1,0,0,0]`; label group with two levels (level count MUST
  satisfied) whose level-1 translation is `[0,0,0,0]`. S1 constrains the label pyramid's *count*
  only; association is by path; the size "should" note is non-normative. Nothing in the format
  forbids this file, and the overlay would be displaced by one physical unit at level 1. Validates
  B3's admission test 4 and R5, and the refusal to treat path association as an alignment
  guarantee.
- **X2 — per-axis mixed absolute/relative calibration.** Axis `x` carries `unit: "micrometer"` and
  level-1 scale 0.5 (absolute pixel size); axis `y` has no `unit`, so its level-1 scale is a
  relative factor (e.g. 2.0) per the S1 fallback rule. One conforming file thus mixes absolute and
  relative semantics *per axis*; the cursor readout must show `y` unitless with the unknown-units
  marker exactly as B2 specifies, and no unit conversion may be attempted. Supports the proposal's
  correction that "calibrated inspection" is conditional.
- **X3 — duplicate `label-value`.** Uniqueness is MUST; the client remedy "SHOULD ignore all except
  the *last* entry" is the spec's own sanctioned behavior. B5's keep-last rule preserves the modal
  force correctly (throwing is equally compliant; keeping last is the [PRODUCT] choice among
  compliant options).

## 6. Obligation and question audit

- **Q1 / B4 — pass.** Two independently discovered, version-pinned components (napari v0.6.5/v0.7.1
  behaviors; vizarr 0.3.0 + `ome.ts`), both listed in S1 §Implementations; recommendation is a
  labeled [PRODUCT] with a concrete, honest tradeoff (heavy Qt/vispy stack, automatic level
  selection pre-0.7.1). The vizarr no-cross-check gap is [SRC]-verified by inspection. Observed vs
  inferred vs chosen are separated throughout.
- **Q2 — pass.** Every normative quote verified verbatim at the pinned 0.4 tree; the
  metadata-declaration vs alignment-guarantee distinction is explicit and correct.
- **Q3 — pass.** The #7962 → #8098 → parametrized-test → v0.6.5 chain is fully traceable at primary
  locators; the scoped lesson is correct and, if anything, understated (§4). The ome-zarr-py
  v0.19.2 corroborator is exact.
- **B1 — pass with C5 relabeling.** Contract, version/support checks, read-only boundary
  (napari-enforced `editable = not self.multiscale` + product-level read-only), absent-label R6,
  unsupported-input R1/R2 all specified.
- **B2 — pass with C1 correction** (pin units-aware scale bar to ≥ 0.7.1; carry the
  cross-layer-units-consistency condition into F3's expected outcome).
- **B3 — pass.** Two-state switching, admission pipeline, per-level transform re-derivation,
  nearest-neighbor categorical sampling, actionable R-states. ≥ 0.7.1 pin confirmed released.
- **B5 — pass.** Revised steps cover B1–B4; F1–F10 each discriminate one behavior; visible limits
  stated; unresolved leads separated; **no execution is claimed** (and none occurred). [NOTE] the
  proposal points to `out/UNRESOLVED_LEADS.md`; the packaged copy reviewed here is
  `inputs/UNRESOLVED_LEADS.md` — ensure the final artifact set actually contains the `out/` copy
  the proposal references.

## 7. Remaining unresolved items (explicitly not established)

1. vizarr `src/utils.ts` transform-composition order — still uncaptured; correctly not relied upon
   by the recommended path (lead 2 stands).
2. ome-zarr-py behavior on the proposal's refusal cases — only release notes were captured (lead 3
   stands).
3. ε tolerance vs producer conventions — product choice awaiting user input (lead 4 stands).
4. Rendering behavior at/above the 1024-color cap on the modern `DirectLabelColormap` path — now
   sharpened by C4: the documented caveat is on the deprecated `color` mapping, so the modern-path
   cap is genuinely unverified (lead 5 stands, slightly widened).
5. [INF] PR #9495 (milestone 0.9.2) postdates v0.9.2's release status verification — the PR is
   verified merged into closed milestone 0.9.2, but I did not fetch a v0.9.2 release object; the
   proposal cites the PR only as evidence that level-switch transforms must be re-derived, which
   stands on the merge record alone.

## 8. Bottom line

Adopt the proposal with C1–C6 applied: re-cite the units-aware scale bar to napari ≥ 0.7.1
(release `v0.7.1`, capture `8016c43e…`) preserving the cross-layer units-consistency condition; fix
the S4 branch locator to `master`; restore the elided S12 quote; scope the 1024-color caveat to its
deprecated-API docstring; relabel B1 check 2's key-presence gate as product contract; and soften
the two normative-force nuances in C6. All three questions and all five obligations are otherwise
met at their cited versions; no unsupported source claim, no unflagged assumption, and no claimed
execution was found.
