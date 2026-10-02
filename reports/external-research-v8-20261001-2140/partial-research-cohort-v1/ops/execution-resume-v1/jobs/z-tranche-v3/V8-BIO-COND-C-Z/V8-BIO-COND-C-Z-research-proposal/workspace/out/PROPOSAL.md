# PROPOSAL — Local calibrated 2D OME-NGFF 0.4 image/label viewer (read-only prototype)

Case: V8-BIO-COND-C-Z · Stage: research proposal · Date: 2026-10-02
Scope: one local, read-only, deliberately small 2D multiscale OME-NGFF 0.4 dataset with exactly two resolutions and one optional categorical label image. No 3D, time series, cloud stores, authoring, segmentation, registration estimation, or format conversion.

Labeling convention used throughout:
- **[SRC]** = fact quoted/paraphrased from a public primary source, with locator (includes observed upstream behavior).
- **[INF]** = engineering inference drawn from sources (reasoning shown).
- **[CHOICE]** = product decision for this prototype, not required by any source.
- **[CORRECTION]** = supported correction of an assumption in the supplied thin plan / brief.
- **[UNEXECUTED]** = proposed validation not executed in this stage; no runtime result is claimed.

Execution-status note (method requirement): this stage's admitted tool set contains no deterministic arithmetic/execution tool, so the discriminating numerical witness in §7 is a reasoned **UNEXECUTED** validation proposal. Derivation is shown step by step; no executed result is asserted anywhere in this document.

---

## 1. Q1 — Two existing components as precedents, and the minimal choice

### 1.1 Component A: napari (desktop, Python/Qt/vispy)

- **[SRC]** Current release **napari v0.9.2** (published 2026-09-29; locator: `https://github.com/napari/napari/releases/tag/v0.9.2`, API `releases/latest` captured 2026-10-02). Release notes: napari is "built on top of Qt (for the GUI), vispy (for performant GPU-based rendering), and the scientific Python stack"; the release adds "multiscale level extraction as a `LayerList` action" (#9495) — i.e., explicit per-level multiscale selection is a current, versioned behavior.
- **[SRC]** Version-specific label-sampling behavior: PR **#6596** (merged 2024-01-22, milestone 0.4.19) added `interpolation='nearest'` when constructing the vispy node for labels in `napari/_vispy/layers/labels.py` (head blob at commit `c3af4a7c07ac81a14fa71a11ba13318fea9910be`), closing issue **#6595**. Since 0.4.19, the 3D labels path is pinned to nearest-neighbor sampling (see §3 for the full chain). Issue **#4133** ("Nonsensical 'bicubic' interpolation for labels layer", 2022, closed 2024-03-03) records maintainer reasoning that interpolating categorical label values in data space is meaningless.
- **[SRC]** Constraint: napari is a full application stack (Qt + vispy + scientific Python), not a small embeddable canvas; adopting it imports that dependency surface (observed from the release assets: ~370 MB wheel, bundled installers).

### 1.2 Component B: vizarr (client-side, TypeScript/deck.gl/viv/zarrita)

- **[SRC]** **vizarr 0.3.0** (`package.json` on `main`, captured 2026-10-02): depends on `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, `deck.gl ~9.1.0`; test runner `vitest`. The NGFF 0.4 spec itself lists vizarr as "A minimal, purely client-side program for viewing Zarr-based images" (§5 Implementations, `https://ngff.openmicroscopy.org/0.4/#implementations`).
- **[SRC]** Version-specific calibration behavior: before PR **#261** (merged 2025-03-06), vizarr **ignored** NGFF `coordinateTransformations` entirely — issue **#271** (open, filed 2025-04-03 by will-moore) states "Previously, the `coordinateTransformations` within that sample were ignored, but with #261 they are implemented". The #261 diff (captured) adds `coordinateTransformationsToMatrix(multiscales)`, which reads **only `multiscales[0].datasets[0].coordinateTransformations`**, supports only `scale` and `translation`, maps them onto x/y/z, throws on axes-length mismatch, and applies the result as the deck.gl `modelMatrix`; `fitBounds` was replaced by `fitImageToViewport`, which transforms the image corners by that matrix to compute the initial view. The diff contains **no test changes**. It cites the NGFF 0.4 transform section in-code (`https://ngff.openmicroscopy.org/0.4/#trafo-md`).
- **[SRC]** Regression/limitation record around that feature: #271 (3D translation makes images disappear; open); #297 (negative scale / flipped dataset not rendered flipped; closed 2025-09-03); #288 (non-square dataset displayed with right side duplicated to make a square; closed 2025-09-12 **by the reporter**, no linked code fix); #262 (spec-conformant 0.4 image renders a blank canvas; open). #271 also records that transform handling "was needed for scaling Labels to match parent Images".

### 1.3 Comparison and recommendation (B4, part 1)

| Criterion | napari 0.9.2 | vizarr 0.3.0 |
|---|---|---|
| Runtime for a desktop prototype | Native Qt desktop widget [SRC: release notes] | Web stack; desktop use requires an embedded browser shell [INF] |
| Calibrated transforms | Per-layer data→world affine semantics; OME-Zarr reading via ome-zarr-py [SRC: §5 of spec lists ome-zarr-py as "A napari plugin for reading ome-zarr files"] | Applies only `datasets[0]` scale+translation since #261; level-level and multiscale-level transforms not handled in the captured code [SRC: #261 diff] |
| Categorical label sampling | Nearest enforced in rendering path since 0.4.19, with a screenshot-diff test [SRC: #6596 files] | No captured evidence of categorical sampling semantics; label support centers on transform-correct overlay [SRC: #271 commentary]; #261 added no tests [SRC: diff] |
| Traceability for calibration/sampling failures | Bisected, fixed, test-pinned chain (#6595→#6596, milestone 0.4.19) [SRC] | Regression chain documented but the pivot PR is untested; several open/closed-unfixed issues [SRC: #271/#288/#297/#262] |
| Dependency weight | Heavy (Qt+vispy+scientific stack) [SRC] | Light (JS bundle) [SRC] |

- **[CHOICE]** Recommend: build the prototype as a thin **napari 0.9.2 + ome-zarr-py 0.19.2 (both version-pinned)** desktop window, with all input-contract validation, calibration interpretation, and label-alignment gating implemented in our own layer on top. Concrete tradeoff: we accept the heavyweight Qt/vispy dependency surface and follow napari's coordinate conventions in exchange for (a) versioned, test-pinned categorical-sampling and multiscale behaviors and (b) a reader that is the spec's own reference plugin implementation. vizarr's minimal stack is the recorded alternative if dependency weight is disqualifying, but it would require rebuilding categorical-label semantics and completing transform handling that upstream itself hasn't finished (#271 open).
- **[INF]** The choice also de-risks B2/B3: the two known upstream transform traps (ignoring transforms — pre-#261 vizarr; handling only `datasets[0]` — post-#261 vizarr) are exactly the cases our validation layer must test regardless of component.

---

## 2. Q2 — What NGFF 0.4 actually requires/permits for this input

Spec locator used throughout: **OME-NGFF 0.4**, `https://ngff.openmicroscopy.org/0.4/` ("Final Community Group Report, 1 October 2026"; page states "This is the 0.4 release of this specification"; revision meta `a4c68004fdb8a8d822367205dc12f9574a32ddf8`). Per the Conformance section, all text is normative except examples and notes; RFC 2119 keywords carry normative force (§ Document conventions; § Conformance).

### 2.1 Axes and calibration

- **[SRC]** §3.1: each `axes` entry MUST contain `name` (unique across entries); SHOULD contain `type` (one of `space`/`time`/`channel`, MAY be custom) and SHOULD contain `unit` (SHOULD be a UDUNITS-2 string such as `micrometer`). Length of `axes` MUST equal the dimensionality of the image arrays.
- **[SRC]** §3.4: `axes` length must be 2–5; MUST contain 2–3 `type:space` entries; entries MUST be in storage order, ordered by type (time first, then channel/custom, then space).
- **[SRC]** §3.4: each `datasets` entry MUST contain `coordinateTransformations`; types restricted to `translation` and `scale`; **exactly one `scale` is mandatory** ("They MUST contain exactly one `scale` transformation that specifies the pixel size in physical units or time duration. If scaling information is not available or applicable for one of the axes, the value MUST express the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0"); **at most one `translation`, optional**, and "If `translation` is given it MUST be listed after `scale` to ensure that it is given in physical coordinates". Vector lengths MUST equal `len(axes)`. §3.3: transformations in a list "are applied sequentially and in order".
- **[SRC]** §3.4: each `multiscales` entry MAY also carry a `coordinateTransformations` "applied to all resolution levels in the same manner … and are applied after them" (the example uses it for a per-level-constant time scale).
- **[SRC]** §3.4: `version` is SHOULD-level ("SHOULD contain the field `version`, which indicates the version … current version is 0.4"). §7 Version History: 0.4.0 (2022-02-08) "multiscales: add axes type, units and coordinateTransformations"; 0.4.1 (2022-09-26) adds transitional `bioformats2raw.layout`; 0.3.0 first added the `axes` field; labels specification dates to 0.1.3.
- **[INF]** Consequences for this product: (1) a scale vector is *always present* for a 0.4-conformant image — what can be absent is the *unit* (SHOULD-level) and any *translation* (MAY-level), so "calibration absent" in the brief's product sense maps to unitless axes and/or scale values that are only relative downsample factors, not to missing metadata; (2) the composition per level is `p = S·i + t` per axis (translation after scale, in physical units), then any multiscales-level transformations applied after; (3) axis names are *not* normatively required to be `x`/`y` — only uniqueness and type/order rules are MUSTs (§3.1/§3.4), so keying display code on names instead of types is a bug.
- **[CORRECTION]** Thin-plan assumption "calibrated inspection" (implying physical units are generally available) is narrowed: unit presence is SHOULD-level only; the viewer must support a unitless calibrated state and must not fabricate units.

### 2.2 Physical cursor coordinates

- **[SRC]** §3.4 defines `coordinateTransformations` as mapping "the data coordinates to the physical coordinates … for this resolution level". The spec defines metadata, not a cursor; any cursor definition is product-level [INF].
- **[CHOICE]** Physical cursor coordinate = per-axis `p_a = s_a · i_a + t_a` from the *displayed level's own* dataset transform, plus any multiscales-level transforms; displayed with the axis unit if declared, otherwise a visible "unitless" badge. Rationale [INF]: translation is physical only because the spec forces it after scale; per-level transforms mean level switching must re-read transforms (see §7 witness).
- **[SRC]** Observed upstream divergence on exactly this point: vizarr pre-#261 displayed geometry with transforms ignored; post-#261 it applies only `datasets[0]` (#271 comments; #297 shows even sign handling differing). Napari keeps per-layer affine transforms, but its OME-Zarr plugin path is the reader under test in our fixtures [INF].

### 2.3 Resolution switching

- **[SRC]** §3.4: `datasets[].path`s "MUST be ordered from largest (i.e. highest resolution) to smallest"; the `scale` at coarser levels MUST express the factor **relative to the first resolution** (defaulting 1.0 when not downsampled on an axis).
- **[SRC]** §3.4 (informative example text): with multiple `multiscales` entries the user can choose by name, using the first as fallback. Our input has exactly two resolution *levels*; multiple multiscale entries are possible but out of product scope [CHOICE: use `multiscales[0]`, surface a notice if more exist].
- **[INF]** Because each level carries its own transform, "switching" is: swap array + re-derive the level affine; the discriminating invariant is that the same physical feature yields the same physical cursor readout on both levels *when the writer repeated the translation consistently* (§7 witness, Part 2).

### 2.4 Image/label association

- **[SRC]** §2.1: labels live in a `labels` group under the image group; its `.zattrs` lists label paths (e.g. `{"labels": ["original/0"]}`); "Unlisted groups MAY be labels" (§3.6). §2.1's layout comment says label dimensions "should" match the image dimension or be 1 — this is a non-normative layout note, not a MUST.
- **[SRC]** §3.7 `image-label`: label groups MUST also contain `multiscales` metadata and "the two 'datasets' series MUST have the same number of entries" — **the only normative cross-guarantee between image and label pyramids**. `colors` (SHOULD; `label-value` MUST be unique integers; clients not throwing "SHOULD ignore all except the last entry" on duplicates), `properties` (MAY), `source.image` (MAY; default "../../"), `version` (SHOULD).
- **[SRC]** Nothing in 0.4 declares an alignment guarantee between image and label geometry beyond the dataset-count MUST; per-level shape equality is only a layout "should" note (§2.1), and per-level transform agreement is not required at all.
- **[INF]** Therefore overlay alignment is an *assumption to verify at load time*, not a format promise: the prototype must derive the label's own per-level affine from the label group's `coordinateTransformations`, compare it with the image's, and gate the overlay on explicit checks. "Either justify the overlay or withhold it" (brief) is implementable because the format gives us the exact fields to compare.
- **[CORRECTION]** Thin-plan step 3 ("decide when an optional label overlay can be shown") is replaced by a decision *procedure* (count equality MUST → shape equality check → transform agreement check → sampling check), each step with a distinct refusal reason, rather than a single on/off decision.

### 2.5 Display hints

- **[SRC]** §3.5: `omero` metadata is optional/transitional; if present it MUST contain `channels`, each with `color` and `window` (`min`/`max`/`start`/`end`). Used only as a display hint [CHOICE].

---

## 3. Q3 — Real issue → fix → test chain, scoped lesson, validation

Chain (all locators captured 2026-10-02):

1. **Failure** [SRC]: napari issue **#6595** — "[main] 3D rendering of labels has wrong colors (mostly label 1, brown)" (filed 2024-01-17, labels `bug`, `priority:high`). Reproducer: a 3D labels layer rendered with wrong colors. The reporter **git-bisected** the regression to commit `ca2d186e1e908a19c5a34c932215ebc86afed88d`; 0.4.18 and 0.4.19rc3 were fine. Root cause: a rendering refactor changed the path that had forced nearest-neighbor sampling for labels, so categorical values were interpolated in data space and neighboring label IDs blended into wrong colors.
2. **Fix** [SRC]: PR **#6596** "Fix wrong working interpolation of labels in 3d" (merged 2024-01-22): adds a single line `interpolation='nearest'` to node construction in `napari/_vispy/layers/labels.py` (`_setup_nodes`), i.e., re-pins categorical sampling at the *renderer* level rather than relying on callers or defaults.
3. **Test** [SRC]: same PR adds `test_rendering_interpolation` to `napari/_qt/_tests/test_qt_viewer.py` (+16 lines): builds a 20³ labels array with interior value 5, sets `selected_label = 5`, `ndisplay = 3`, screenshots the canvas, samples the center pixel, and asserts `npt.assert_array_equal(pixel, layer.colormap.map(5)[0] * 255)` — an exact-color assertion that fails under any non-nearest sampling. Released in **napari 0.4.19** (milestone #38 closed 2024-03-02). Corroborating history: issue **#4133** (2022) had already flagged interpolation of label layers as nonsensical; the class of bug recurred when a refactor touched a *different* rendering path.

**Scoped engineering lesson** [INF]: sampling mode for categorical data is a per-rendering-path invariant, not a global property; any refactor that adds a path (here, the 3D path) can silently drop it, and the failure is visible only as wrong pixels. Two practices follow: (a) enforce the invariant where the node/texture is constructed; (b) pin it with a discriminating, screenshot-level test that asserts exact expected values at known locations, run for *every* rendering path the product ships.

**Validation that follows for this prototype** [UNEXECUTED, concrete]:
- V-1 (2D port of the upstream test): render a two-value label fixture (background 0, two squares 1 and 2), assert the canvas pixel at each square center exactly equals that label's mapped color, at **both** resolution levels and with the overlay toggled off/on. Any blended value at a boundary-adjacent center is a failure.
- V-2: a fixture where label and image have *different* per-level scales must still sample nearest (never bilinear) when the overlay is transformed — this is the case the upstream test does not cover (it used uniform 3D data) [INF].
- V-3 (calibration analogue of the same lesson): assert the *numeric* cursor/model-matrix values (§7 witness) rather than pixels only, so calibration regressions are caught independently of rendering.

---

## 4. B1 — Local input contract, version/support checks, read-only boundary

**[CHOICE] Contract** (all checks implemented in our validation layer before any display):

| # | Check | Source basis | Outcome on failure |
|---|---|---|---|
| C1 | Path is a readable Zarr v2 group (`.zgroup` present) | §2: "Arrays MUST be defined and stored … version 2 of the Zarr specification"; "OME-NGFF metadata MUST be stored as attributes in the corresponding Zarr groups" [SRC] | Refuse: "not a Zarr group" |
| C2 | Group `.zattrs` has `multiscales` (non-empty list) | §3.4 [SRC] | Refuse: "no multiscales metadata (unsupported input)" |
| C3 | `multiscales[0].version` — if present — equals `"0.4"` | §3.4: SHOULD-level [SRC] | Warn banner "declared version X; tested for 0.4", still open [CHOICE: SHOULD ≠ refuse] |
| C4 | Exactly 2 `datasets` entries, `axes` length 2 = array dimensionality, 2 space-type axes in storage order | §3.4 MUSTs [SRC] | Refuse: "unsupported shape (need exactly two 2-D levels)" |
| C5 | Per dataset: exactly one `scale`, optional one `translation`, listed after scale, lengths == 2; type ∈ {scale, translation} | §3.3/§3.4 MUSTs [SRC] | Refuse: "non-conforming coordinateTransformations" |
| C6 | Both level arrays loadable, read-only, dtype displayable | §2.1 [SRC for structure; display support is product] | Refuse: "unreadable/unsupported array" |
| C7 | `labels` group optional; if present, run B3 gate (§6) | §3.6/§3.7 [SRC] | See refusal states R1–R3 |

- **[CHOICE] Version/support policy**: 0.4 is the supported target; 0.1–0.3 inputs (no `axes` array form) are refused with a pointer message rather than silently upgraded. Observed upstream note: ome-zarr-py internally normalizes legacy 0.1–0.3 metadata to a 0.6 model (PR #582, merged 2026-07-01) [SRC] — convenient, but our contract keeps refusal explicit so the scientist always knows what was interpreted.
- **[CHOICE] Read-only boundary**: the store is opened read-only; no write path exists in the process (no writer imports); the UI exposes no mutating actions. Absent optional labels ⇒ the overlay controls render in a disabled state with text "no label image present" — not an error.
- **[INF]** C5 exists because both documented upstream failures in §1.2 are transform-shape violations; refusing early is cheaper than misdisplay.

## 5. B2 — Physical cursor coordinates and calibrated display

- **Formula** [INF from §3.3/§3.4 SRC]: for the displayed level L, per space axis a: `p_a(i) = s_{L,a} · i_a + t_{L,a}` with `t` absent ⇒ 0; then apply any `multiscales`-level transformations *after* the per-level ones (§3.4: "applied after them"). Axis order = storage order of the two space axes; axis names displayed as declared (names are not normatively x/y, §3.1 [SRC]).
- **Units**: per-axis `unit` shown when declared (e.g., `micrometer`); absent unit ⇒ value shown with a visible `unitless` badge; the µm symbol is never invented [CHOICE, per §3.1 SHOULD].
- **Scale indication**: status bar shows per-axis physical pixel size and, at the coarser level, the declared relative factor; when a scale value cannot be a physical size (unitless axes), the badge reads "relative scale only" — this is the brief's "absent applicable calibration" state [CHOICE].
- **Fallback/withheld behavior**: if C5 fails the image still opens (product lenience) but the cursor readout area shows "calibration withheld: non-conforming coordinateTransformations" instead of numbers [CHOICE]. Justification [INF]: displaying numbers derived from a rejected transform would manufacture precision.
- **[SRC] Version/conditions this depends on**: napari 0.9.2 per-layer affine; ome-zarr-py 0.19.2 (PyPI metadata: requires `zarr>=3.0.0`, Python ≥3.12) as reader; known gap — multiscales-level `coordinateTransformations` support in the ecosystem is incomplete: ome-zarr-py #172 (open since 2022-03-02) records no writer support ("The specification also allows this metadata to be defined one level up at the `multiscales` dictionary (see ome/ngff#85)"), and vizarr #261 reads only `datasets[0]`. Our reader-side application of level-level transforms is therefore a **[CHOICE]** implemented and tested by us, not a behavior we can assume from either component.

## 6. B3 — Resolution switching and optional categorical label overlay

**Switching** [CHOICE]: a two-entry level selector built from `datasets` order (largest→smallest, §3.4 MUST); switching swaps the array and rebuilds the level affine (§5 formula). Cursor continuity invariant: with a conforming writer (translation repeated per level), the same feature reads the same physical coordinate on both levels — checked by fixture F1b/§7 Part 2 [UNEXECUTED]. Levels carry *their own* transforms; the viewer never extrapolates level-0 transforms to level 1 (a wrong implementation of exactly this is discriminated in §7 Part 1).

**Label overlay gate** (ordered; each failure is a distinct visible refusal, per §2.4 [INF]):

- R1: no `labels` group ⇒ overlay disabled: "no label image present" (not an error).
- R2: `datasets` count of label ≠ image ⇒ **refuse overlay**: "not a conforming 0.4 image-label pair" — violates the §3.7 MUST [SRC]. (This is the brief's "different level counts" case.)
- R3: per-level array shape of label ≠ image at the displayed level ⇒ **withhold with reason**: "label geometry differs from image at this level (0.4 leaves this only as a layout recommendation)" — §2.1 note is non-normative [SRC].
- R4: label's per-level `coordinateTransformations` differ from the image's beyond tolerance ⇒ withhold: "label/image transforms disagree; alignment not guaranteed" [INF: 0.4 has no cross-group transform guarantee].
- R5: all pass ⇒ overlay shown; label affine used as declared; sampling forced to nearest at the node level (napari 0.9.2 does this for its own paths, §1.1 [SRC]); categorical colormap from `image-label.colors` when present, last-entry-wins on duplicate `label-value` (§3.7 SHOULD [SRC]); association path taken from `source.image` with default `"../../"` (§3.7 [SRC]).

**Refusal states are actionable**: each refusal names the violated check, the observed vs expected value, and the spec clause — so the scientist can fix the dataset or accept the limitation deliberately [CHOICE].

## 7. Discriminating numerical witness — transform composition (UNEXECUTED)

**Claim under test**: physical cursor readout must use the *displayed level's own* transform exactly as declared (`p = S·i + t`, `t` after `s`, absent `t` ⇒ 0). **Competing interpretation**: a plausible implementation carries level 0's translation into all levels ("the image has one origin"), i.e., `p = S·i + t₀` regardless of level. The two agree on level 0 and diverge elsewhere.

Fixture F1 (self-derived, two levels, unitless axes to also exercise the unitless path):

```
multiscales[0]:
  axes: [ {name:"y", type:"space"}, {name:"x", type:"space"} ]        # units absent (SHOULD-level omission)
  datasets:
    - path: "0", coordinateTransformations: [ {type:"scale",    scale:[2.0, 0.5]},
                                              {type:"translation", translation:[10.0, -4.0]} ]
    - path: "1", coordinateTransformations: [ {type:"scale",    scale:[4.0, 1.0]} ]   # translation omitted
```

Part 1 — cursor on **level 1** at voxel `(i_y, i_x) = (3, 1)`:
- Interpretation A (spec-literal): `p_y = 3 × 4.0 + 0 = 12.0`; `p_x = 1 × 1.0 + 0 = 1.0` → readout `y: 12.0 [unitless], x: 1.0 [unitless]`.
- Interpretation B (carried level-0 translation): `p_y = 3 × 4.0 + 10.0 = 22.0`; `p_x = 1 × 1.0 + (−4.0) = −3.0`.
- Discriminator: readouts differ by exactly the level-0 translation `(10.0, −4.0)`. A asserts A; observing `22.0 / −3.0` identifies B. A is the supported reading because §3.4 makes `translation` optional **per dataset** ("It MAY contain exactly one `translation`") and ties `coordinateTransformations` to "this resolution level" [SRC].

Part 2 — sanity invariant for a *conforming* writer (same fixture but level 1 repeats `translation:[10.0, -4.0]`): cursor on level 1 at `(3,1)` reads `p_y = 3 × 4.0 + 10.0 = 22.0`, `p_x = 1 × 1.0 − 4.0 = −3.0`. The same feature on level 0 must sit at voxel `(i_y, i_x)` with `2.0·i_y + 10.0 = 22.0 ⇒ i_y = 6` and `0.5·i_x − 4.0 = −3.0 ⇒ i_x = 2` (check: `6 × 2.0 + 10.0 = 22.0`; `2 × 0.5 − 4.0 = −3.0`). Invariant: switching levels while hovering the feature must not change the physical readout; the voxel indices relate by the exact scale ratios `4.0/2.0 = 2.0` and `1.0/0.5 = 2.0` (§3.4 requires coarser-level scales to be factors relative to level 0 [SRC]).

**Status: UNEXECUTED.** No admitted deterministic arithmetic/execution tool exists in this stage's tool set; the multiplications above are shown as derivation only. Proposed execution (later stage, with an execution receipt): implement `physical(i, level)` per §5, run Parts 1–2 against fixture F1/F1b, and assert V-1/V-3 from §3.

## 8. B5 — Revised concrete plan (replaces thin-plan steps 1–4)

1. **Pin and probe** — pin `napari==0.9.2`, `ome-zarr==0.19.2` (zarr v3 line, Python ≥3.12 [SRC: PyPI metadata]); record versions in an About box; smoke-test opening a two-level 0.4 fixture.
2. **Input contract** — implement C1–C7 (§4) as a pure, unit-testable gate producing either a validated descriptor (axes, per-level arrays, per-level transforms, units, label descriptor) or a typed refusal.
3. **Calibration & cursor** — implement §5 formula incl. multiscales-level transforms (our [CHOICE], §5); status-bar scale/unit display with unitless fallback; withheld-calibration state on C5 failure.
4. **Level switching** — selector + per-level affine rebuild; cursor-continuity check (§7 Part 2).
5. **Label overlay gate** — R1–R5 (§6); nearest sampling enforced at node construction (lesson §3); colormap from `image-label.colors` with last-entry-wins (§3.7).
6. **Fixture set** (discriminating, all [UNEXECUTED]):
   - F1/F1b: witness fixture (unitless axes; translation omitted at level 1; F1b repeats it) → §7 Parts 1–2.
   - F2: axes named `row`/`col` (type `space`) must still open with calibration — names are not normative [SRC §3.1/§3.4].
   - F3: units present (`micrometer`) → cursor shows units; contrast with F1.
   - F4: label with 1 dataset vs image's 2 → refusal R2 (violates §3.7 MUST).
   - F5: label shape mismatch at a level → withholding R3.
   - F6: two-value label render → exact-color assertions at both levels (V-1), and with differing label/image scales (V-2).
   - F7: `version: "0.3"` → warn banner, still opens (SHOULD-level [SRC]).
   - F8: multiscales-level `scale` present → cursor must include it after dataset transforms (our reader-side choice; upstream gaps documented §5).
7. **Visible limits** (shown in-app): read-only; single dataset; exactly two levels; no multiscale-entry picker beyond `multiscales[0]`; unitless-badge semantics; withheld states enumerated in §6.
8. **Validation harness** — run fixtures headless, assert numeric invariants (§7) and pixel invariants (§3 V-1/V-2); do not report any of it as passing until executed with an admitted receipt.

---

## 9. Source register (exact locators; all captured 2026-10-02 via admitted public HTTPS)

1. OME-NGFF 0.4 specification — `https://ngff.openmicroscopy.org/0.4/` (Final Community Group Report, 1 October 2026; "This is the 0.4 release"; sections cited: Document conventions; §2, §2.1; §3.1 `#axes-md`; §3.3 `#trafo-md`; §3.4 `#multiscale-md`; §3.5 `#omero-md`; §3.6 `#labels-md`; §3.7 `#label-md`; §5 Implementations; §7 Version History; Conformance).
2. ome-zarr (ome-zarr-py) — PyPI JSON API `https://pypi.org/pypi/ome-zarr/json`: version **0.19.2**, `release_url https://pypi.org/project/ome-zarr/0.19.2/`, `requires_python >=3.12`, `zarr>=3.0.0`. GitHub: issue **#172** (open, 2022-03-02, "Support multiscales coordinateTransformations"); PR **#582** (merged 2026-07-01, legacy 0.1–0.3 → 0.6 internal normalization); PR **#652** (merged 2026-09-08, "correctly normalize resolution level paths", writer-side fix **with test** — evidence that non-`s0` level path conventions exist in the wild).
3. napari — `https://github.com/napari/napari/releases/tag/v0.9.2` (2026-09-29; notes: multiscale level extraction #9495; vispy update #9499). Issue **#6595**; PR **#6596** (merged 2024-01-22) with file list: fix in `napari/_vispy/layers/labels.py` (`interpolation='nearest'`), test `test_rendering_interpolation` in `napari/_qt/_tests/test_qt_viewer.py`, head commit `c3af4a7c07ac81a14fa71a11ba13318fea9910be`, milestone **0.4.19** (closed 2024-03-02). Issue **#4133** (2022, closed 2024-03-03).
4. vizarr — `https://github.com/hms-dbmi/vizarr` `package.json` on `main`: version **0.3.0**, `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, `deck.gl ~9.1.0`, vitest. PR **#261** diff (merged 2025-03-06; `coordinateTransformationsToMatrix`, `datasets[0]` only, no tests). Issues **#271** (open), **#297** (closed 2025-09-03), **#288** (closed by reporter 2025-09-12, no code fix), **#262** (open).

*Claim-status audit*: every normative claim above is [SRC] with a locator; component behavior claims are [SRC] from captured releases/PR diffs/issues; arithmetic in §7 is [UNEXECUTED]; product decisions are [CHOICE]. No executed test result is asserted.
