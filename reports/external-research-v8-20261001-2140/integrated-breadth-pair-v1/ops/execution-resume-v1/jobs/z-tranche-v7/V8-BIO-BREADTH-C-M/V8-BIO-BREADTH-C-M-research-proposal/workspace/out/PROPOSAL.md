# PROPOSAL — Local calibrated 2D OME-NGFF 0.4 read-only viewer (revision of thin plan)

Case: V8-BIO-BREADTH-C-M, research-proposal stage. This document revises `inputs/THIN_PLAN.md`
into a research-backed plan for a small **desktop, read-only** prototype that opens **one local
OME-NGFF 0.4 dataset** consisting of a **2-D multiscale image with exactly two resolution levels**
and **at most one optional categorical label image**. It answers the brief's three questions (Q1–Q3)
and five obligations (B1–B5). Implementation and test execution are out of scope for this stage;
Section 8 validation cases are **planned, not executed**.

## 0. Evidence basis and labeling convention

All primary sources were discovered and captured during this stage (public HTTP captures; sha256 of
exact response bytes given). Labels used throughout:

- **[SRC]** — fact stated by a cited source (with normative force preserved: MUST/SHOULD/MAY per RFC 2119).
- **[INF]** — engineering inference from source facts (reasoning shown).
- **[PRODUCT]** — explicit product choice for this prototype (not dictated by sources).
- **[CORRECTION]** — a thin-plan assumption replaced by evidence.

Key sources (capture locators):

| ID | Source / version locator | Capture sha256 (exact bytes) |
|----|--------------------------|------------------------------|
| S1 | OME-NGFF **Version 0.4** specification, `ome/ngff` main branch `specifications/0.4` git submodule → `ome/ngff-spec` @ tree `a4c68004fdb8a8d822367205dc12f9574a32ddf8`, file `index.md` (front matter: `version: 0.4`, `date: 2023-05-25`, `status: w3c/CG-FINAL`); section anchors cited as `(version0.4:*)` | `fc39309d1ea85bfcebd469008e3111951a605870cc8292301c0de165767b0211` |
| S2 | vizarr `hms-dbmi/vizarr`, branch `master`, `README.md` | `e2b6135a8d325b7db4eb76dd2d3ca4e92d2d25d215045a6351d8264c8110cb03` |
| S3 | vizarr `package.json` @ `master` — `"version": "0.3.0"`; deps `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, `deck.gl ~9.1.0` | `bddde203696567259721c7f04f6ca8ff0bed44d30203106346efc42fdd7d2cb5` |
| S4 | vizarr `src/ome.ts` @ `main` | `bb228cc5e442b1446ef8ec0e8aa8d6fe4557c6fb9d6a07935ad4b5748382cb86` |
| S5 | napari issue **#7962** (GitHub API JSON; created 2025-05-23, closed 2025-09-24, `state_reason: completed`) | `eb82e8d95342e89e638a324ac4db8d428a16bb1737f274a26a358d50da028d2e` |
| S6 | napari PR **#8098** files+patch (`src/napari/layers/_layer_actions.py`, `src/napari/layers/_tests/test_layer_actions.py`; merged 2025-09-24; milestone 0.6.5) | `7dabd78b0c839d1298c73fb4fa73f3fbfd7dc63c23d79bbda2d8bd8088067b48` |
| S7 | napari release **v0.6.5** (published 2025-10-02; notes dated Wed, Oct 1, 2025; Bug Fixes lists “Fix effect of scaling when converting shapes to labels (#8098)”) | `5265faad007283ead9a033b7b24c7c70e38f00592ea6d4f9ac04e51eff2eb875` |
| S8 | napari `src/napari/layers/labels/labels.py` @ tag **v0.6.5** | `e10bf6b4f7e13ad73fc9adb5e15225a792f9fef52b3a00391d41a23da75808f6` |
| S9 | napari PR **#8917** “Add multiscale level lock for scalar field layers” (merged 2026-05-13; milestone 0.7.1; closes #6418) — captured in issue-search JSON | `935fd152a73ada6653b2bd3512b22810986952feece9440f3576d242680ffdb5` |
| S10 | napari PR **#9495** “Add multiscale level extraction as a `LayerList` action” (merged 2026-09-25; milestone 0.9.2; extraction applies “`scale` and `translate` corrections so they align with the original full resolution image”) | same capture as S9 |
| S11 | ome-zarr-py repo metadata (default branch `master`) and latest release **v0.19.2** (published 2026-09-08; sole change: PR #652 “bug: correctly normalize resolution level paths”) | `b301149c86811b42142d0923d28ebc8553e6d04a9af07e4048870f604b30fe19`, `1085265c47e71e3e0cb90cfda90877fbdfdf516774a7060eac5fbee2efe6549e` |
| S12 | S1 §Implementations (`version0.4:implementations`): “ome-zarr-py — A napari plugin for reading ome-zarr files”; “vizarr — A minimal, purely client-side program for viewing Zarr-based images” | same capture as S1 |

S1 declares RFC 2119 keywords normative (“The key words “MUST”, … “OPTIONAL” are to be interpreted
as described in RFC 2119”, S1 §Document conventions). Lowercase “should” in S1 prose (e.g., the
on-disk layout comments) is **not** normative. Quotations below preserve the modal verbs.

---

## Q1. Two existing components, version-specific behaviors, minimal choice (serves B4)

### napari (desktop, Python/Qt) — recommended component
Observed, version-pinned behavior:

- **[SRC]** At v0.6.5 (S7, S8), every `Layer` carries per-axis `scale` and `translate` and a
  `units` parameter (“Units of the layer data in world coordinates. If not provided, the default
  units are assumed to be pixels”, S8 docstring); `affine` is applied “as an extra transform on
  top of the provided scale, rotate, and shear values” (S8). This maps 1:1 onto S1's
  scale+translation model (Q2), including unequal axis scales and nonzero offsets.
- **[SRC]** `Labels` layers accept “array or multiscale. Must be integer type or bools”
  (non-integer data raises `TypeError`; bools are viewed as uint8) and — version-specific —
  “multiscale rendering is only supported in 2D. In 3D, only the lowest resolution scale is
  displayed” (S8). 2-D-only is exactly our product scope.
- **[SRC]** A multiscale Labels layer is forced non-editable: `self.editable = not self.multiscale`
  (S8) — the read-only boundary is partially enforced by the toolkit itself.
- **[SRC]** Label rendering color mapping “will render incorrectly if they map to more than 1024
  distinct colors” (S8 docstring) — a concrete cap relevant to pathological label values.
- **[SRC]** Resolution-level choice: automatic canvas-size-based level selection only, until
  `locked_data_level` (manual level lock) was added by PR #8917, merged 2026-05-13 into milestone
  **0.7.1** (S9). Level extraction was later added with explicit “`scale` and `translate`
  corrections so they align with the original full resolution image” (PR #9495, milestone 0.9.2,
  merged 2026-09-25, S10) — upstream evidence that **level switching must re-derive transforms**.
- **[SRC]** v0.6.5 ships a units-aware `scale_bar` canvas overlay (release notes S7; “Use global
  register for units in ScaleBar” #8226) — building block for B2's calibrated scale indication.
- Reader precedent: the 0.4 spec itself lists ome-zarr-py as “A napari plugin for reading
  ome-zarr files” (S12); latest release v0.19.2 (2026-09-08) fixes resolution-level path
  normalization (S11) — resolution-switching defects exist in real readers.

### vizarr (browser, TypeScript/deck.gl) — compared, not chosen
Observed, version-pinned behavior:

- **[SRC]** Self-description: “a minimal, purely client-side program for viewing zarr-based images”,
  GPU rendering via Viv, client-side zarr via zarrita.js; “special support for the developing
  OME-NGFF format”; the Limitations section says support for generic Zarr “is supported but not as
  well tested” (S2). Pinned at `package.json` version **0.3.0** with `@hms-dbmi/viv ~0.19.0`,
  `zarrita ~0.6.0`, `deck.gl ~9.1.0` (S3).
- **[SRC]** It **does** read optional labels: `loadOmeMultiscales` resolves the `labels` group,
  opens each named label group, asserts `image-label` metadata, loads the label multiscale, reads
  `colors` (`label-value`, `rgba`), and returns `modelMatrix:
  utils.coordinateTransformationsToMatrix(attrs.multiscales)` for both image and label sources
  (S4, `src/ome.ts`).
- **[SRC]** Observed gap: image and label model matrices are built **independently** from each
  source's own metadata; there is no cross-check that label levels physically align with image
  levels, and no refusal state when they do not (S4, absence of any such check between
  `loadOmeMultiscales` and `loadOmeImageLabel`).
- **[PRODUCT relevance]** It is a browser app (standalone web app / anywidget notebook), not a
  desktop application (S2).

### Comparison and recommendation
- Both components read OME-NGFF multiscale images and (vizarr at 0.3.0; napari via its ecosystem,
  cf. S12) the optional 0.4 label image. **[SRC]** S12 lists both projects in the 0.4 spec's
  Implementations section.
- **[PRODUCT]** Recommend **napari as the viewer toolkit** for the desktop prototype: the product
  conditions (desktop, physical cursor readout with units, categorical overlay with explicit
  refusal states, read-only) are all directly supported by pinned v0.6.5+ behaviors (per-layer
  scale/translate/units, Labels constraints, scale-bar overlay), while vizarr would additionally
  require a desktop shell to satisfy the desktop condition and provides no cross-source alignment
  verification to reuse.
- **[PRODUCT] Concrete tradeoff accepted:** napari is a heavy dependency (Qt/vispy/Python runtime)
  and its multiscale level selection is automatic; pin **napari ≥ 0.7.1** to obtain
  `locked_data_level` for explicit two-level switching (S9), or — fallback — manage the two levels
  as two Image layers with explicit scale/translate (level-switch = swap visible layer). Cost:
  larger install and manual level logic; benefit: exact calibrated world-space model and
  categorical-safe rendering with a visible refusal path vizarr lacks.

---

## Q2. What OME-NGFF 0.4 requires/permits for axis/calibration, cursor, resolution switching, label association (serves B2, B3)

All [SRC] items below are from S1 (Version 0.4, 2023-05-25), normative force preserved.

### Axes and calibration
- `axes` entries **MUST** contain `name` (“The values MUST be unique across all “name” fields”);
  **SHOULD** contain `type` (one of `space`, `time`, `channel`, **MAY** be other custom strings);
  **SHOULD** contain `unit` (space/time units from the UDUNITS-2 lists) — §`version0.4:axes-md`.
- In a multiscales context, `axes` length **MUST** equal array dimensionality; **MUST** contain 2–3
  `space` axes; **MAY** add one `time` and one `channel`/custom axis; order **MUST** match array
  dimension order and the type ordering (time, then channel/custom, then space) — §`version0.4:multiscale-md`.
- **[SRC] Consequence:** *units may be absent* (SHOULD, not MUST). Calibration scale factors are
  still **MUST**-present per level (below), so relative calibration (aspect/anisotropy, level
  ratios) is always declared, but the absolute physical unit is not guaranteed. **[CORRECTION]**
  The thin plan's implied “calibrated inspection” is therefore conditional, not automatic.

### coordinateTransformations (calibration math)
- Transform types: `identity` (default), `translation`, `scale`; “The transformations in the list
  are applied sequentially and in order.” `translation`/`scale` may be inline lists **or** a
  binary `path` reference — §`version0.4:trafo-md`.
- Each `datasets` entry **MUST** contain `coordinateTransformations`; “The transformation MUST only
  be of type `translation` or `scale`”; they **MUST** contain “exactly one `scale` transformation
  that specifies the pixel size in physical units”; if scaling is unavailable for an axis, the
  value **MUST** express the factor vs the first resolution, “defaulting to 1.0”; it **MAY**
  contain exactly one `translation`, which, if given, “MUST be listed after `scale` to ensure that
  it is given in physical coordinates”; array lengths **MUST** equal `axes` length —
  §`version0.4:multiscale-md`.
- A multiscales-level `coordinateTransformations` **MAY** exist, “applied after” the dataset-level
  ones, e.g. for scale shared by all levels — same section.
- **[INF] Physical cursor formula.** For displayed level *d*, pixel index `i_a` on axis `a`:
  `p_a = S_a · ( s_{d,a} · i_a + t_{d,a} ) + T_a`, where `{s,t}` are the dataset-level scale and
  translation and `{S,T}` the multiscales-level ones (both optional). This follows only from the
  stated application order (dataset list first, in order, then multiscales-level); the spec
  provides this mapping of data→physical coordinates as metadata, nothing more.

### Resolution switching
- `datasets` paths “MUST be ordered from largest (i.e. highest resolution) to smallest”;
  each level carries its **own** scale (and optional translation) — §`version0.4:multiscale-md`.
- Multiple `multiscales` entries **MAY** exist; informative pseudocode in S1: choose by `name`,
  fallback to the first entry.
- **[SRC] No alignment guarantee.** The spec declares per-level transforms; it nowhere requires
  level origins to coincide, translations to be zero, or downsampling factors to be exact integers.
  **[INF]** Level consistency is a producer convention, not a format guarantee: a viewer that
  assumes level *k* is exactly level 0 downsampled by an integer factor is inventing a constraint.
  **[CORRECTION]** Thin plan step 2 (“resolution selection”) must be revised to *verify then
  switch*, not assume.

### Image/label association
- Storage association: an optional `labels` group under the image group lists label object paths in
  `.zattrs`, e.g. `{"labels": ["original/0"]}`; “Unlisted groups MAY be labels” — §`version0.4:labels-md`
  and §`version0.4:image-layout` (layout). The `image-label` dict **MAY** contain a `source` key
  whose `image` value defaults to `"../../"` — §`version0.4:label-md`.
- **[SRC]** “`image-label` groups MUST also contain `multiscales` metadata and the two “datasets”
  series MUST have the same number of entries” — §`version0.4:label-md`.
- **[SRC]** Layout note (non-normative “should”): each label dimension “should be either the same as
  the corresponding dimension of the image, or `1`” — §`version0.4:image-layout`.
- **[SRC]** `image-label` display metadata: `colors` **SHOULD** be present; each color object
  **MUST** have integer `label-value`; `rgba` if present **MUST** be four uint8; duplicate
  `label-value` entries — “Clients who choose to not throw an error SHOULD ignore all except the
  *last* entry”; `properties` **MAY**; `version` **SHOULD** — §`version0.4:label-md`.
- **[INF]** The spec *associates* label to image by path, and constrains the label pyramid's level
  **count** (MUST), but does **not** guarantee the label's levels are shaped, transformed, or
  aligned to the image's levels. “Image and label arrays may have different shapes, level counts or
  metadata” (product brief) is therefore representable within a *conforming* file only up to the
  MUST above; a mismatched level **count** is a spec violation, and any other mismatch is simply
  unconstrained — the viewer must detect both and act.

---

## Q3. Real issue → fix → test chain, and the scoped lesson (serves B3, B4)

**Failure (observed):** napari **#7962** (S5, opened 2025-05-23): the layer-list context-menu
*Shapes → Labels* conversion used `Shapes.extent`, producing “a Labels layer that does not match
the size of the image layer”; the user “can't paint in certain areas and when you save the layer
… it doesn't match what you expect”.

**Fix (observed):** PR **#8098** (S6, merged 2025-09-24, milestone 0.6.5): `_convert` in
`src/napari/layers/_layer_actions.py` now derives the label array shape from the **layer-list world
extent** (`ll._extent_world_augmented`) mapped back through `lay.world_to_data(...)`, instead of the
source layer's own data extent.

**Tests (observed):** `src/napari/layers/_tests/test_layer_actions.py` gained parametrized
`test_make_label_from_shape_param` over `(scale, translate)`: default `(1,1)/(0,0)` pass; scaled
`(5,5)/(0,0)` passes; translated `(1,1)/(30,30)` is marked
`pytest.xfail('Converting layers with translations does not work')`. Released in napari **v0.6.5**
(S7, Bug Fixes).

**Scoped engineering lesson:** **[INF]** Deriving a label array's extent in *world* coordinates and
mapping back through the world→data transform is the correct pattern; fixing only the scale path is
insufficient — the fix's own test suite documents that nonzero **translations** remained broken
(xfail). Calibration bugs cluster exactly where one of {scale, offset} is handled and the other
assumed. For this prototype (nonzero offsets and unequal axis scales are in-scope product
conditions), any label-extent/overlay geometry must compose **both** per-axis scale and
translation (Q2 formula), and the validation set must include offset-only cases, which is where
the upstream chain still fails. The chain also demonstrates the process lesson: the failing
behavior, the fix, the parametrized tests including the known-unfixed case, and the release are all
separately traceable (S5→S6→S7); the prototype's fixtures should preserve that traceability
(fixture name ↔ obligation ↔ source).

**Corroborating resolution-switching defect:** ome-zarr-py v0.19.2 (2026-09-08) exists solely to
fix “correctly normalize resolution level paths” (PR #652, S11) — level-selection defects also
occur in the canonical reader. (Napari's own level-lock and level-extraction features, S9/S10,
additionally document that correct level switching requires re-applying scale and translate
corrections.)

---

## B1. Local input contract, version/support checks, read-only boundary

**[PRODUCT]** Input is exactly one local OME-NGFF **0.4** dataset directory (Zarr v2 store),
opened read-only. Checks at open time, each with a visible outcome:

1. **[SRC]** Arrays **MUST** be Zarr v2 and NGFF metadata **MUST** be in Zarr group attributes
   (S1 §On-disk layout). Check `.zgroup`/`.zarray` v2 markers. Fail → refusal state **R1**
   (“unsupported container”).
2. **[SRC]** Root group `.zattrs` **MUST** have `multiscales` (S1 §multiscale-md context);
   `axes` length 2–5 with 2–3 space axes; `datasets` with per-level `coordinateTransformations`
   containing exactly one `scale` (identity default otherwise); translation, if present, after
   scale. Fail → **R1**.
3. **[PRODUCT]** Exactly **two** `datasets` entries required (product scope). `len != 2` →
   refusal **R2** (“input must contain exactly two resolution levels; found N”). This is a product
   restriction on top of the spec's 2–5 (SRC).
4. **[SRC/PRODUCT]** `multiscales[].version` is **SHOULD** `"0.4"`: absent/mismatched → warn banner
   (“metadata version declared: X; interpreting per 0.4”), not refusal (normative force: SHOULD).
   Multiple `multiscales` entries: choose by `name`, fallback first (S1 informative pseudocode;
   [PRODUCT] expose the choice in the title bar).
5. **[SRC]** Units: `unit` is SHOULD per axis (S1 §axes-md). Absent → proceed with unitless
   fallback (B2); do not invent units.
6. **[SRC]** Transform `path` (binary) variants are legal per S1 §trafo-md; **[PRODUCT]** the
   prototype supports inline `scale`/`translation` lists only; `path`-based transforms →
   **R3** (“binary transform reference unsupported”) for the affected readout/overlay, image
   display continues at pixel scale.
7. **Labels:** absent `labels` group or empty list → overlay UI disabled with state **R6**
   (“no label image present”). More than one listed label → **[PRODUCT]** overlay withheld,
   **R4** (“N label images present; prototype supports at most one”). Label group lacking
   `image-label` or `multiscales` (the latter is MUST, S1 §label-md) → **R4** with the reason
   made specific.
8. **Read-only boundary:** **[PRODUCT]** the prototype never writes; additionally, napari marks
   multiscale layers non-editable (`editable = not self.multiscale`, S8), and the app sets
   layer `editable=False`; unsupported input (R1/R2) yields an error screen, never a partial view
   presented as valid.

## B2. Physical cursor coordinates and calibrated display

- **[INF]** Cursor physical position per axis: `p_a = S_a·(s_{d,a}·i_a + t_{d,a}) + T_a`
  (Q2 formula; order justified by S1 §trafo-md “applied sequentially and in order” + multiscales
  level transforms “applied after” dataset-level ones).
- **[SRC]** Unit interpretation: axis `unit` values are UDUNITS-2 strings (space/time lists, S1
  §axes-md). **[PRODUCT]** Display `p_a` with the axis unit when present; when absent display
  `p_a` unitless with an explicit “units: unknown (axis has no unit)” marker, and mark the scale
  bar “(units unknown)”. No unit conversion is attempted (none is required by S1).
- **[PRODUCT]** Calibrated indication: fixed readout line `x = <p_x> [unit], y = <p_y> [unit];
  pixel size: (s_x, s_y) [unit/px] at level <k>` plus the toolkit's units-aware scale bar
  (napari 0.6.x scale_bar overlay, S7). Anisotropy visible via distinct per-axis pixel sizes.
- **[PRODUCT]** Fallbacks: any axis lacking `scale` (spec violation — exactly one is MUST) →
  **R1**-class refusal for that axis' readout with reason; `path`-based transform → **R3** as in
  B1; translation absent → treated as 0 (identity is the declared default, S1 §trafo-md).
- **[SRC]** Version/conditions dependence: formula and unit behavior pinned to napari ≥ 0.6.5
  layer `scale`/`translate`/`units` semantics (S8) and S1 transforms; re-verify on any toolkit
  upgrade (napari PR #9495, S10, shows level-related transform corrections continue to evolve).

## B3. Resolution switching and optional categorical label overlay

- **[PRODUCT]** Level switching: a two-state control (Level 0 = highest resolution, Level 1).
  With napari ≥ 0.7.1 use `locked_data_level` (S9); otherwise two Image layers with per-level
  `scale`/`translate` and visibility swap. **[INF]** Switching re-derives B2 readouts from the
  selected level's own transforms — never assume levels share a grid (Q2 “no alignment
  guarantee”; upstream lesson Q3).
- **[PRODUCT]** Overlay admission test (all must pass, else withhold with reason):
  1. Exactly one label listed (else **R4**, B1).
  2. Label group has `image-label` + `multiscales` (MUST, S1 §label-md) — else **R4**.
  3. **[SRC]** Label `datasets` series length **MUST** equal image's (2) — violation → **R5**
     (“label pyramid has N levels; 0.4 requires the same number as the image”).
  4. **[INF/PRODUCT]** Physical-extent agreement per level: composed physical extents of label
     level *k* and image level *k* must coincide within tolerance ε = half a level-0 pixel
     (product choice; tolerance is not specified by the format) — failure → **R5** with the
     per-level extent diff shown.
- **Association:** **[SRC]** by path (`labels` listing; `source.image` default `"../../"`), S1
  §labels-md/§label-md. **[PRODUCT]** We additionally require the admission test above; path
  association alone is not treated as an alignment guarantee.
- **Transform:** label layer gets its own composed `scale`/`translate` (+ units) from its
  metadata, *not* a copy of the image's — the brief allows differing metadata, and Q3's lesson
  forbids assumption. **[INF]** If both compose to the same physical mapping, the overlay
  registers correctly; if not, admission test 4 fails first.
- **Sampling:** **[PRODUCT]** nearest-neighbor for the categorical overlay (no interpolation of
  label ids); napari `Labels` rendering is integer-id-based by construction (S8). Displayed on
  the selected level only; no resampling across levels.
- **Refusal states are actionable:** each R-state names the violated check, the observed vs
  expected values, and the spec clause or product rule; the image remains viewable in every
  R-state except R1/R2 (unsupported input).

## B4. Component comparison, tradeoff, issue→fix→test

Covered by Q1 (napari vs vizarr comparison, pinned versions, observed behaviors) and Q3 (#7962 →
#8098 → `test_make_label_from_shape_param` → v0.6.5). **[SRC]** observed upstream behavior and
**[PRODUCT]/[INF]** are separated throughout; no upstream behavior is asserted beyond the cited
captures.

## B5. Revised plan, discriminating validation, visible limits

**Revised steps (replace thin-plan steps 1–4):**

1. **Reader/contract** — implement B1 checks as a small pure function over the `.zattrs`/`.zgroup`
   tree returning either a typed `Dataset` model (axes, units, per-level transforms, label
   descriptor) or an `R-state`. No format conversion, no network.
2. **Calibration model** — implement the Q2 composition (dataset-level then multiscales-level),
   axis-ordered, with unit presence flags; wire to napari layer `scale`/`translate`/`units` (≥0.6.5)
   and to the cursor readout + scale bar (B2).
3. **Level switching** — two-level control; per-level readout recomputation; ≥0.7.1
   `locked_data_level` or two-layer swap (B3).
4. **Label overlay** — admission pipeline (B3) and categorical rendering with per-label colors
   from `image-label.colors` when present (S1 §label-md; duplicate `label-value`: keep last,
   per SHOULD).
5. **Refusal states** — R1–R6 UI states as specified in B1/B3.
6. **Validation** — the fixture matrix below (planned; **not executed in this stage**).

**Discriminating fixture set (planned; each fixture discriminates one behavior):**

| # | Fixture | Expected outcome (discriminates) |
|---|---------|----------------------------------|
| F1 | 2 levels, isotropic scale, no offsets, units present | overlay shown; cursor = s·i; scale bar unitful |
| F2 | anisotropic (sx≠sy) + nonzero translations, both levels | cursor matches composed formula; overlay passes extent check (offset handling — the case upstream xfail shows is fragile) |
| F3 | units absent | unitless readout + “units: unknown” markers (SHOULD-only `unit`) |
| F4 | label with 1 level vs image's 2 | R5: MUST level-count violation reported with clause |
| F5 | label with 2 levels, extent mismatch > ε at level 1 | R5 with per-level diff (no alignment guarantee → verify) |
| F6 | no `labels` group | R6 disabled state, image fine |
| F7 | Zarr v3 store / missing `multiscales` | R1 unsupported input |
| F8 | `path`-based scale transform | R3 limited state, image at pixel scale |
| F9 | 3 levels | R2 product-contract refusal |
| F10 | two `multiscales` entries with names | name-choice honored, fallback first |

**Visible limits (product):** 2-D only; one dataset; no unit conversion; inline transforms only;
no 3-D, time, cloud stores, authoring, segmentation, registration estimation or conversion (brief
scope); >1023 distinct label values risk degraded rendering (napari 1024-color note, S8).

**Unresolved consequential leads:** see `out/UNRESOLVED_LEADS.md`.

---

## Self-check against the brief

Three questions answered (Q1 §2, Q2 §3, Q3 §4); five obligations B1–B4 in §§5–7 and B5 in §8;
two components compared with version-pinned behavior (napari v0.6.5/v0.7.1/v0.9.2 items, vizarr
0.3.0 + `src/ome.ts`); one traceable issue→fix→test chain (napari #7962→#8098→test→v0.6.5) plus a
corroborating reader fix (ome-zarr-py v0.19.2); exact locators and normative force preserved
(SRC quotes); source facts, inferences, product choices, and corrections to the thin plan are
labeled. No test or arithmetic in Section 8 has been executed; no execution is claimed.
