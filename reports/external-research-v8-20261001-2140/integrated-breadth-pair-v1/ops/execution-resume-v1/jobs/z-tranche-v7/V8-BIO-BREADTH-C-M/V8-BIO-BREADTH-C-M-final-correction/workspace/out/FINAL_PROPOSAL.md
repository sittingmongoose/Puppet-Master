# FINAL_PROPOSAL — Local calibrated 2D OME-NGFF 0.4 read-only viewer (complete corrected artifact)

Case V8-BIO-BREADTH-C-M, final-correction stage. This document is the **complete usable corrected
research-to-plan artifact**. It supersedes the frozen `inputs/PROPOSAL.md` by applying the six
supported corrections (C1–C6) of `inputs/CRITIQUE.md`, preserving every finding the critique
verified, and keeping unresolved consequential dependencies visible in `out/UNRESOLVED_LEADS.md`.
It answers the brief's three questions (Q1–Q3) and five obligations (B1–B5).

**No execution is claimed.** Implementation and test execution are out of scope for this stage; the
§8 validation fixtures are **planned, not executed**, and this correction stage executed no tests
and no arithmetic either — all work here is source capture, source-text comparison, and shown
inference. There is no execution receipt because no execution occurred.

Prototype scope (unchanged, per `inputs/BRIEF.md`): one local OME-NGFF **0.4** dataset, 2-D,
exactly two resolution levels, at most one optional categorical label image, read-only desktop
inspection with calibrated cursor readout, resolution switching, and an overlay that is either
justified or withheld with a reason. Out of scope: 3D, time series, cloud stores, authoring,
segmentation, registration estimation, format conversion.

---

## 0. Evidence basis and labeling convention

All primary sources were captured as exact HTTP response bodies (sha256 of exact bytes given).
Verification basis per source: **[R-stage]** captured in the research stage and re-verified
byte-identical by the independent critic; **[C-stage]** captured by the critic; **[F-stage]**
captured fresh in this final-correction stage by me.

| ID | Source / version locator | Capture sha256 (exact response bytes) | Basis |
|----|--------------------------|----------------------------------------|-------|
| S1 | OME-NGFF **Version 0.4** spec: `raw.githubusercontent.com/ome/ngff-spec` @ tree `a4c68004fdb8a8d822367205dc12f9574a32ddf8`, `index.md` (front matter `version: 0.4`, `date: 2023-05-25`, `status: w3c/CG-FINAL`); reached via `ome/ngff` `specifications/0.4` submodule (GitHub contents API capture `9999a8b7…`, C-stage) | `fc39309d1ea85bfcebd469008e3111951a605870cc8292301c0de165767b0211` | [R-stage]; **re-fetched this stage, byte-identical** [F-stage] |
| S2 | vizarr `hms-dbmi/vizarr`, branch `master`, `README.md` | `e2b6135a8d325b7db4eb76dd2d3ca4e92d2d25d215045a6351d8264c8110cb03` | [R-stage], critic-identical |
| S3 | vizarr `package.json` @ `master` — `"version": "0.3.0"`; deps `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, `deck.gl ~9.1.0` | `bddde203696567259721c7f04f6ca8ff0bed44d30203106346efc42fdd7d2cb5` | [R-stage], critic-identical |
| S4 | vizarr `src/ome.ts` @ branch **`master`** [CORRECTION C2: branch is `master`, not `main`] | `bb228cc5e442b1446ef8ec0e8aa8d6fe4557c6fb9d6a07935ad4b5748382cb86` | [R-stage]; **re-fetched from `master` this stage, byte-identical** [F-stage] |
| S5 | napari issue **#7962** (`api.github.com/repos/napari/napari/issues/7962`; created 2025-05-23, closed 2025-09-24, `state_reason: completed`) | `eb82e8d95342e89e638a324ac4db8d428a16bb1737f274a26a358d50da028d2e` | [R-stage], critic-identical |
| S6 | napari PR **#8098** files+patch (`…/pulls/8098/files`; `_layer_actions.py` + `_tests/test_layer_actions.py`; merged 2025-09-24, milestone 0.6.5); PR description capture `ba020697…` [C-stage] | `7dabd78b0c839d1298c73fb4fa73f3fbfd7dc63c23d79bbda2d8bd8088067b48` | [R-stage], critic-identical |
| S7 | napari release **v0.6.5** (`…/releases/tags/v0.6.5`; published 2025-10-02, notes dated Wed, Oct 1, 2025; Bug Fixes: "Fix effect of scaling when converting shapes to labels (#8098)") | `5265faad007283ead9a033b7b24c7c70e38f00592ea6d4f9ac04e51eff2eb875` | [R-stage], critic-identical |
| S7′ | napari release **v0.7.1** (`…/releases/tags/v0.7.1`; published 2026-06-15T23:33:58Z, notes dated Tue, Jun 16, 2026; Highlights include "Scalebar with units" and "Selection of the rendered level for multiscale layers"; Improvements list #8900, #8907, #9007, #8917) | `8016c43e30cc87132fad2962d1cb3d3e7cc0f62db64596222c07052714d53fc8` | **[F-stage, this stage]**; same-prefix capture independently by critic [C-stage] |
| S8 | napari `src/napari/layers/labels/labels.py` @ tag **v0.6.5** (61,353 B) | `e10bf6b4f7e13ad73fc9adb5e15225a792f9fef52b3a00391d41a23da75808f6` | [R-stage], critic-identical (docstrings re-checked; see C4) |
| S9 | napari PR **#8917** "Add multiscale level lock for scalar field layers" (merged 2026-05-13, milestone 0.7.1, closes #6418). [NOTE] the original capture hash `935fd152…` was a search-endpoint capture not reproducible by direct fetch; the PR claims are verified at direct PR JSON (critic capture `2b264cb0…`, C-stage) **and** independently by S7′ (v0.7.1 Improvements list #8917) | `935fd152…` (orig.), `2b264cb0…` (C-stage) | [R-stage]+[C-stage]+[F-stage via S7′] |
| S10 | napari PR **#9495** "Add multiscale level extraction as a `LayerList` action" (merged 2026-09-25, milestone 0.9.2; extraction applies "`scale` and `translate` corrections so they align with the original full resolution image"); direct PR JSON critic capture `3df623b1…` [C-stage]; a v0.9.2 **release object** was not captured (see leads) | `3df623b1…` | [C-stage] |
| S11 | ome-zarr-py latest release **v0.19.2** (`…/ome/ome-zarr-py/releases/tags/v0.19.2`; published 2026-09-08; sole change PR #652 "bug: correctly normalize resolution level paths"; `target_commitish: master`) | `1085265c47e71e3e0cb90cfda90877fbdfdf516774a7060eac5fbee2efe6549e` | [R-stage], critic-identical |
| S12 | S1 §Implementations (`version0.4:implementations`), contained in S1: ome-zarr-py — "A napari plugin for reading ome-zarr files." (exact); vizarr — "A minimal, purely client-side program for viewing Zarr-based images **with Viv & ImJoy**." [CORRECTION C3: full quote restored] | same capture as S1 | [F-stage verified in S1 tail this stage] |

S1 declares RFC 2119 keywords normative (§Document conventions: "The key words "MUST", …
"OPTIONAL" are to be interpreted as described in RFC 2119"). Lowercase "should"/"must" in S1 prose
is **not** normative; quotations below preserve the exact modal verbs and case.

Labels used throughout:
- **[SRC]** — fact stated by a cited source, normative force preserved (MUST/SHOULD/MAY per RFC 2119; lowercase forms flagged as non-normative).
- **[INF]** — engineering inference from source facts (reasoning shown).
- **[PRODUCT]** — explicit product choice for this prototype (not dictated by sources).
- **[CORRECTION C#]** — correction adopted from `inputs/CRITIQUE.md`, with its source support.
- **[NOTE]** — observation requiring no change.

---

## 1. Resolution of the candidate critique (C1–C6)

Every critique point was resolved against allowed public primary sources; none was rejected.

| # | Critique point | Disposition | Changed the plan? | Verification basis |
|---|----------------|-------------|-------------------|--------------------|
| C1 | B2's units-aware scale bar is a **napari ≥ 0.7.1** feature, not 0.6.5; #8226 in 0.6.5 is an internal register refactor. Source condition: units appear on the scale bar only when layer units are set **and logically consistent across layers**. | **Adopted** | **Yes — substantive.** B2's calibrated-indication pin moves from "napari 0.6.x scale_bar overlay (S7)" to "napari ≥ 0.7.1 (S7′)", carrying the cross-layer-units-consistency condition; F3's expected outcome sharpened (see §8). The B3 pin (≥ 0.7.1 for `locked_data_level`) and the B2 pin now coincide, simplifying the recommendation. | [SRC] My fresh capture S7′ [F-stage], sha256 `8016c43e…`: highlight "Scalebar with units" states verbatim: "In previous versions of napari, if you added a scale bar using **View > Scale Bar > Scale Bar visible**, it was shown with no units. In napari 0.7.1 we now set default unit to `pixel` in #8900 and also add calculation of units for scale bar based on currently added layers in #8907 and #9007, **if they have units set and are logically consistent across layers**." The v0.6.5 release (S7) lists #8226 "Use global register for units in ScaleBar" only among other PRs — consistent with an internal refactor. |
| C2 | S4 locator: `src/ome.ts` is at branch **`master`**, not `main`. | **Adopted** | Citation fix only (evidence table above); no behavioral change. | [SRC] I fetched `raw.githubusercontent.com/hms-dbmi/vizarr/master/src/ome.ts` [F-stage]; sha256 `bb228cc5…` reproduced **byte-for-byte**, matching the original capture; content re-inspected (see Q1/Q2 notes on the confirmed vizarr gap). |
| C3 | S12 quote elision: S1 §Implementations describes vizarr as "A minimal, purely client-side program for viewing Zarr-based images **with Viv & ImJoy**." — the frozen proposal dropped the trailing clause without an ellipsis. | **Adopted** | Quote restored in S12 and Q1; no behavioral change. | [SRC] Verified in the tail of my byte-identical S1 re-fetch [F-stage] (§`version0.4:implementations`). The ome-zarr-py quote was already exact. |
| C4 | The "more than 1024 distinct colors" caveat (S8) sits in the docstring of the **deprecated** `color` dict attribute, not a general statement about all label rendering. The conservative risk statement may stay but must be attributed to the deprecated-mapping caveat and tied to unresolved lead 5 (modern `DirectLabelColormap` path at the cap is unverified). | **Adopted** | Attribution fix in §8 Visible limits; unresolved lead 5 widened. No behavioral change. | [SRC] S8 (case-admitted v0.6.5 `labels.py` capture `e10bf6b4…`, critic-identical; docstring scope re-checked by the critic against that capture). I did not re-fetch S8 this stage; the disposition rests on the admitted capture and the critic's byte-identical confirmation. |
| C5 | B1 check 2 was labeled [SRC] but "root MUST contain `multiscales`" is **not** an explicit S1 MUST sentence — S1 §`version0.4:multiscale-md` says metadata "can be found" under the key; the MUSTs govern the contents of each multiscales entry. The root-key gate is the right product rule and must be relabeled. | **Adopted** | **Yes — labeling/normative-force change in B1 check 2** (now [PRODUCT input contract keyed to S1's image definition]); the field-level MUSTs cited there all stand. | [SRC] Verified verbatim in my S1 re-fetch [F-stage]: "Metadata about an image can be found under the "multiscales" key in the group-level metadata." — no MUST on key presence; the MUSTs attach to `axes`, `datasets`, per-dataset `coordinateTransformations`, etc. |
| C6 | (a) The 2–5 bound on axes length is lowercase non-normative "must" in S1 ("The length of 'axes' must be between 2 and 5 and MUST be equal to the dimensionality…"); the RFC 2119 MUST attaches to the equality and to "MUST contain 2 or 3 entries of 'type:space'". (b) "Multiple `multiscales` entries MAY exist" has no stand-alone MAY sentence; multiplicity is [INF] from the list structure plus the explicitly informative pseudocode. | **Adopted (both)** | Normative-force precision in Q2 and B1; no check's outcome changes. | [SRC] Both verified verbatim in my S1 re-fetch [F-stage]: "The length of "axes" must be between 2 and 5 and MUST be equal to the dimensionality of the zarr arrays…" and "If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback:" (prose + informative pseudocode). |

Critic-identified residual unknowns (critique §7) are folded into `out/UNRESOLVED_LEADS.md`
(vizarr `src/utils.ts` composition order; ome-zarr-py behavior on refusal cases; ε tolerance;
the 1024-color cap on the modern colormap path; napari v0.9.2 release-object status for S10).

---

## Q1. Two existing components, version-specific behaviors, minimal choice (serves B4)

### napari (desktop, Python/Qt) — recommended component

Observed, version-pinned behavior:

- **[SRC]** At v0.6.5 (S7, S8), every `Layer` carries per-axis `scale` and `translate` and a
  `units` parameter ("Units of the layer data in world coordinates. If not provided, the default
  units are assumed to be pixels", S8 docstring); `affine` is applied "as an extra transform on
  top of the provided scale, rotate, and shear values" (S8). This maps 1:1 onto S1's
  scale+translation model (Q2), including unequal axis scales and nonzero offsets.
- **[SRC]** `Labels` layers accept "array or multiscale. Must be integer type or bools"
  (floating data raises `TypeError`; bools are viewed as uint8) and — version-specific —
  "multiscale rendering is only supported in 2D. In 3D, only the lowest resolution scale is
  displayed" (S8). 2-D-only is exactly this product's scope.
- **[SRC]** A multiscale Labels layer is forced non-editable: `self.editable = not self.multiscale`
  (S8) — the read-only boundary is partially enforced by the toolkit itself.
- **[SRC]** Resolution-level choice: automatic canvas-size-based level selection until
  `locked_data_level` (manual level lock) was added by PR #8917, merged 2026-05-13 into milestone
  **0.7.1** (S9) and **shipped in the v0.7.1 release** (S7′ Highlights: "Selection of the rendered
  level for multiscale layers" — "for 2D display, you can fix the resolution level"). Level
  extraction was later added with explicit "`scale` and `translate` corrections so they align with
  the original full resolution image" (PR #9495, milestone 0.9.2, S10) — upstream evidence that
  **level switching must re-derive transforms**.
- **[SRC]** Units-aware scale bar: shipped in **v0.7.1** (S7′ highlight "Scalebar with units";
  #8900 default unit `pixel`; #8907/#9007 unit calculation from layers, "if they have units set and
  are logically consistent across layers"). **[CORRECTION C1]** — this is a ≥ 0.7.1 feature; at
  0.6.x the scale bar shows no units (S7′) and #8226 in 0.6.5 is an internal register refactor.
- Reader precedent: S1 §Implementations (S12) lists ome-zarr-py — "A napari plugin for reading
  ome-zarr files."; latest release v0.19.2 (2026-09-08) fixes resolution-level path normalization
  (S11) — resolution-switching defects exist in real readers.

### vizarr (browser, TypeScript/deck.gl) — compared, not chosen

Observed, version-pinned behavior (locator corrected to `master`, C2):

- **[SRC]** Self-description (S1 §Implementations, full quote): "A minimal, purely client-side
  program for viewing Zarr-based images **with Viv & ImJoy**." [CORRECTION C3] Its README (S2)
  says support for generic Zarr "is supported but not as well tested". Pinned at `package.json`
  version **0.3.0** with `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, `deck.gl ~9.1.0` (S3).
- **[SRC]** It does read optional labels: `loadOmeMultiscales` in `src/ome.ts` (S4, branch
  `master`) resolves the `labels` group (`resolveOmeLabelsFromMultiscales`, returning `[]` when the
  group is absent), opens each named label group, asserts `image-label` metadata
  (`utils.assert(utils.isOmeImageLabel(attrs), "No 'image-label' metadata.")` — an exception, not a
  graceful refusal), loads the label multiscale, maps `colors` (`label-value`, `rgba`), and returns
  `modelMatrix: utils.coordinateTransformationsToMatrix(attrs.multiscales)` for both image and
  label sources.
- **[SRC]** Observed gap (re-confirmed by inspection of the full S4 file this stage): image and
  label model matrices are built **independently** from each source's own metadata; there is no
  cross-check that label levels physically align with image levels and no refusal state when they
  do not.
- **[PRODUCT relevance]** It is a browser app (standalone web app / anywidget notebook), not a
  desktop application (S2).

### Comparison and recommendation

- Both components read OME-NGFF multiscale images and (vizarr at 0.3.0 directly; napari via its
  ecosystem, cf. S12) the optional 0.4 label image. **[SRC]** Both are listed in the 0.4 spec's
  Implementations section (S12).
- **[PRODUCT]** Recommend **napari as the viewer toolkit** for the desktop prototype, pinned
  **napari ≥ 0.7.1**: that single floor supplies both version-specific capabilities the product
  needs — `locked_data_level` for explicit two-level switching (S9, shipped in v0.7.1 per S7′) and
  the units-aware scale bar for B2's calibrated indication (S7′) — while per-layer
  scale/translate/units semantics, Labels constraints, and categorical-safe rendering exist at
  v0.6.5 (S8). vizarr would additionally require a desktop shell to satisfy the desktop condition
  and provides no cross-source alignment verification to reuse.
- **[PRODUCT] Concrete tradeoff accepted:** napari is a heavy dependency (Qt/vispy/Python runtime)
  and, on older versions, its multiscale level selection is automatic. Cost: larger install;
  benefit: exact calibrated world-space model, unit-aware scale bar, categorical-safe rendering,
  and a visible refusal path vizarr lacks. **Fallback [PRODUCT]:** if deployment must pin
  napari < 0.7.1, manage the two levels as two Image layers with explicit per-level
  scale/translate (level-switch = visibility swap) and render the scale indication as a
  product-owned readout instead of the toolkit scale bar (which shows no units below 0.7.1, S7′).
  This fallback is consequential — see `out/UNRESOLVED_LEADS.md` lead 1.

---

## Q2. What OME-NGFF 0.4 requires/permits for axis/calibration, cursor, resolution switching, label association (serves B2, B3)

All [SRC] items below are from S1 (Version 0.4, `date: 2023-05-25`, status w3c/CG-FINAL), at the
pinned tree; normative force preserved.

### Axes and calibration
- `axes` entries **MUST** contain `name` ("The values MUST be unique across all "name" fields");
  **SHOULD** contain `type` (one of `space`, `time`, `channel`, **MAY** be other custom strings);
  **SHOULD** contain `unit` (space/time units from the UDUNITS-2 lists) — §`version0.4:axes-md`.
- In a multiscales context: **[CORRECTION C6(a)]** S1 states "The length of "axes" must be between
  2 and 5 and MUST be equal to the dimensionality of the zarr arrays" — the 2–5 bound is
  **lowercase, non-normative**; the RFC 2119 MUST attaches to the equality with array
  dimensionality and to "The "axes" MUST contain 2 or 3 entries of "type:space"" (**MAY** add one
  `time` and one `channel`/custom axis). Order **MUST** match array dimension order and the type
  ordering (time, then channel/custom, then space) — §`version0.4:multiscale-md`.
- **[SRC] Consequence:** *units may be absent* (SHOULD, not MUST). Calibration scale factors are
  still **MUST**-present per level (below), so relative calibration (aspect/anisotropy, level
  ratios) is always declared, but the absolute physical unit is not guaranteed. **[CORRECTION —
  carried from the proposal and confirmed by the critique, X2]** Per-axis mixing is conforming:
  where unit/scaling info is unavailable for an axis, its scale value is a *relative* level factor
  ("the value MUST express the scaling factor between the current resolution and the first
  resolution … defaulting to 1.0"), so one file can mix absolute pixel sizes (unit present) and
  relative factors (unit absent) **per axis**. "Calibrated inspection" is therefore conditional,
  not automatic.

### coordinateTransformations (calibration math)
- Transform types: `identity` ("is the default transformation"), `translation`, `scale`; "The
  transformations in the list are applied sequentially and in order." `translation`/`scale` may be
  inline lists **or** a binary `path` reference — §`version0.4:trafo-md`.
- Each `datasets` entry **MUST** contain `coordinateTransformations`; "The transformation MUST only
  be of type `translation` or `scale`"; they **MUST** contain "exactly one `scale` transformation
  that specifies the pixel size in physical units or time duration"; if scaling is unavailable for
  an axis, the value **MUST** express the factor between the current and first resolution,
  "defaulting to 1.0"; it **MAY** contain exactly one `translation`, which, if given, "MUST be
  listed after `scale` to ensure that it is given in physical coordinates"; "The length of the
  `scale` and `translation` array MUST be the same as the length of "axes"" —
  §`version0.4:multiscale-md`.
- A multiscales-level `coordinateTransformations` **MAY** exist, "applied after" the dataset-level
  ones, e.g. for scale shared by all levels — same section.
- **[INF] Physical cursor formula.** For displayed level *d*, pixel index `i_a` on axis `a`:
  `p_a = S_a · ( s_{d,a} · i_a + t_{d,a} ) + T_a`, where `{s,t}` are the dataset-level scale and
  translation and `{S,T}` the multiscales-level ones (both optional). This follows only from the
  stated application order (dataset list first, "sequentially and in order", then multiscales-level
  "applied after them"); the spec provides this mapping of data→physical coordinates as *metadata*,
  nothing more. A dataset MUST contain exactly one `scale`, so a translation-only level is
  impossible, and `identity` is the declared default, so an absent translation ≡ 0.
- **[NOTE]** The formula makes "physical" coordinates only as absolute as the per-axis scale
  semantics allow: on an axis without unit/applicable calibration, the scale is a relative factor
  (counterexample X2) — the readout must mark the unit unknown rather than invent one.

### Resolution switching
- `datasets` paths "MUST be ordered from largest (i.e. highest resolution) to smallest"; each level
  carries its **own** scale (and optional translation) — §`version0.4:multiscale-md`.
- **[CORRECTION C6(b)]** Multiple `multiscales` entries: there is no stand-alone MAY sentence;
  multiplicity is **[INF]** from the list structure plus the explicitly informative pseudocode
  ("If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the
  first multiscale as a fallback").
- **[SRC] No alignment guarantee.** The spec declares per-level transforms; it nowhere requires
  level origins to coincide, translations to be zero, or downsampling factors to be exact integers.
  **[INF]** Level consistency is a producer convention, not a format guarantee: a viewer that
  assumes level *k* is exactly level 0 downsampled by an integer factor is inventing a constraint.
  The thin plan's "resolution selection" was revised to *verify then switch*, not assume.

### Image/label association
- Storage association: an optional `labels` group under the image group lists label object paths in
  `.zattrs`, e.g. `{"labels": ["original/0"]}`; "Unlisted groups MAY be labels" —
  §`version0.4:labels-md` and §`version0.4:image-layout` (layout). The `image-label` dict **MAY**
  contain a `source` key whose `image` value defaults to `"../../"` — §`version0.4:label-md`.
- **[SRC]** "`image-label` groups MUST also contain `multiscales` metadata and the two "datasets"
  series MUST have the same number of entries" — §`version0.4:label-md`.
- **[SRC]** Layout note (non-normative lowercase "should"): each label dimension "should be either
  the same as the corresponding dimension of the image, or `1`" — §`version0.4:image-layout`.
- **[SRC]** `image-label` display metadata: `colors` **SHOULD** be present; each color object
  **MUST** have integer `label-value`; `rgba` if present **MUST** be four uint8; "All the values
  under the `label-value` key MUST be unique. Clients who choose to not throw an error SHOULD
  ignore all except the *last* entry"; `properties` **MAY**; `version` **SHOULD** —
  §`version0.4:label-md`.
- **[INF]** The spec *associates* label to image by path and constrains the label pyramid's level
  **count** (MUST), but does **not** guarantee the label's levels are shaped, transformed, or
  aligned to the image's levels (critique counterexample X1: a conforming file whose label level-1
  translation differs from the image's displaces the overlay while satisfying every MUST). The
  viewer must detect both spec violations (level count) and unconstrained misalignment (extent)
  and act on each.

---

## Q3. Real issue → fix → test chain, and the scoped lesson (serves B3, B4)

**Failure (observed):** napari **#7962** (S5, opened 2025-05-23): the layer-list context-menu
*Shapes → Labels* conversion used `Shapes.extent`, producing "a Labels layer that does not match
the size of the image layer"; the user "can't paint in certain areas and when you save the layer
… it doesn't match what you expect".

**Fix (observed):** PR **#8098** (S6, merged 2025-09-24T09:07:55Z, milestone 0.6.5, closes #7962):
`_convert` in `src/napari/layers/_layer_actions.py` now derives the label array shape from the
**layer-list world extent** (`ll._extent_world_augmented[1] - ll._extent_world_augmented[0]`)
mapped back through `lay.world_to_data(...)` (`to_labels(labels_shape=lay.world_to_data(ll_shape))`),
instead of the source layer's own data extent.

**Tests (observed):** `src/napari/layers/_tests/test_layer_actions.py` gained parametrized
`test_make_label_from_shape_param` over `(scale, translate)`: default `(1,1)/(0,0)` passes;
scaled `(5,5)/(0,0)` passes; translated `(1,1)/(30,30)` is marked
`pytest.xfail('Converting layers with translations does not work')`; the test asserts
`ll[-1].extent.world == ll.extent.world`. Released in napari **v0.6.5** (S7, Bug Fixes).

**Residual limitation, documented by the fix author (critique-strengthened evidence):** **[SRC]**
PR #8098's own description (C-stage capture `ba020697…`, "New issues for consideration") states
that `to_layers`/`to_labels` "assumes that the minimum world x and y values are zero … When this
occurs, regions of the canvas with a negative x or y value are not accessible in the label. Fully
resolving the intent of issue 7962 would require applying both the minimum and maximum coordinates
of the canvas to the label." The translation path is thus confirmed fragile **twice**: by the
fix's own xfail and by the fix author's residual-limitation note.

**Scoped engineering lesson:** **[INF]** Deriving a label array's extent in *world* coordinates and
mapping back through the world→data transform is the correct pattern; fixing only the scale path is
insufficient — calibration bugs cluster exactly where one of {scale, offset} is handled and the
other assumed. For this prototype (nonzero offsets and unequal axis scales are in-scope product
conditions), any label-extent/overlay geometry must compose **both** per-axis scale and
translation (Q2 formula), and the validation set must include offset-only cases, which is where
the upstream chain still fails. Process lesson: the failing behavior, fix, parametrized tests
(including the known-unfixed case), and release are separately traceable (S5→S6→S7); the
prototype's fixtures preserve that traceability (fixture name ↔ obligation ↔ source).

**Corroborating resolution-switching defect:** ome-zarr-py v0.19.2 (2026-09-08) exists solely to
fix "correctly normalize resolution level paths" (PR #652, S11) — level-selection defects also
occur in the canonical reader. Napari's own level-lock and level-extraction features (S9/S7′/S10)
additionally document that correct level switching requires re-applying scale and translate
corrections.

---

## B1. Local input contract, version/support checks, read-only boundary

**[PRODUCT]** Input is exactly one local OME-NGFF **0.4** dataset directory (Zarr v2 store),
opened read-only. Checks at open time, each with a visible outcome:

1. **[SRC]** Arrays **MUST** be Zarr v2 ("defined and stored … as defined by the version 2 of the
   Zarr specification") and "OME-NGFF metadata MUST be stored as attributes in the corresponding
   Zarr groups" (S1 §`version0.4:on-disk`). Check `.zgroup`/`.zarray` v2 markers. Fail → refusal
   state **R1** ("unsupported container").
2. **[CORRECTION C5 — relabeled]** **[PRODUCT input contract keyed to S1's image definition]** The
   root group `.zattrs` must contain a `multiscales` key. S1 does not state this presence as a
   MUST sentence — §`version0.4:multiscale-md` says metadata about an image "can be found" under
   the key, and its MUSTs govern the *contents* of each entry; requiring the key at the root is
   this prototype's gate for "the input is an image". Fail → **R1**. The field-level requirements
   checked next are [SRC] MUSTs: per multiscales entry, `axes` **MUST** be present with length
   **MUST** equal to array dimensionality and **MUST** contain 2 or 3 `space` entries; `datasets`
   **MUST** be present with per-level `coordinateTransformations` containing exactly one `scale`;
   translation, if present, **MUST** be listed after scale; scale/translation array lengths
   **MUST** equal axes length. (The 2–5 axes bound is S1 lowercase "must", non-normative — C6(a).)
3. **[PRODUCT]** Exactly **two** `datasets` entries required (product scope). `len != 2` →
   refusal **R2** ("input must contain exactly two resolution levels; found N"). This is a product
   restriction on top of S1 (which sets no level count).
4. **[SRC/PRODUCT]** `multiscales[].version` is **SHOULD** `"0.4"` (S1: "It SHOULD contain the
   field "version""): absent/mismatched → warn banner ("metadata version declared: X; interpreting
   per 0.4"), not refusal (normative force: SHOULD). Multiple `multiscales` entries ([INF] C6(b)):
   choose by `name`, fallback first (S1 informative pseudocode); **[PRODUCT]** expose the choice
   in the title bar.
5. **[SRC]** Units: `unit` is **SHOULD** per axis (S1 §`version0.4:axes-md`). Absent → proceed
   with unitless fallback (B2); do not invent units.
6. **[SRC]** Transform `path` (binary) variants are legal per S1 §`version0.4:trafo-md`;
   **[PRODUCT]** the prototype supports inline `scale`/`translation` lists only; `path`-based
   transforms → **R3** ("binary transform reference unsupported") for the affected
   readout/overlay; image display continues at pixel scale.
7. **Labels:** absent `labels` group or empty list → overlay UI disabled with state **R6** ("no
   label image present"). More than one listed label → **[PRODUCT]** overlay withheld, **R4** ("N
   label images present; prototype supports at most one"). Label group lacking `image-label` or
   `multiscales` (the latter is MUST, S1 §`version0.4:label-md`) → **R4** with the reason made
   specific.
8. **Read-only boundary:** **[PRODUCT]** the prototype never writes; additionally, napari marks
   multiscale layers non-editable (`editable = not self.multiscale`, S8), and the app sets layer
   `editable=False`; unsupported input (R1/R2) yields an error screen, never a partial view
   presented as valid.

## B2. Physical cursor coordinates and calibrated display

- **[INF]** Cursor physical position per axis: `p_a = S_a·(s_{d,a}·i_a + t_{d,a}) + T_a`
  (Q2 formula; order justified by S1 §`version0.4:trafo-md` "applied sequentially and in order" +
  multiscales-level transforms "applied after them").
- **[SRC]** Unit interpretation: axis `unit` values are UDUNITS-2 strings (space/time lists, S1
  §`version0.4:axes-md`). **[PRODUCT]** Display `p_a` with the axis unit when present; when absent
  display `p_a` unitless with an explicit "units: unknown (axis has no unit)" marker, and mark the
  scale indication "(units unknown)". No unit conversion is attempted (none is required by S1).
- **[CORRECTION C1 — substantive]** **[PRODUCT]** Calibrated indication: fixed readout line
  `x = <p_x> [unit], y = <p_y> [unit]; pixel size: (s_x, s_y) [unit/px] at level <k>` plus the
  toolkit's units-aware scale bar, pinned to **napari ≥ 0.7.1** (S7′). Conditions preserved from
  S7′: below 0.7.1 the scale bar shows **no units**; from 0.7.1 the default unit is `pixel` and
  layer-derived units are shown only **if layers "have units set and are logically consistent
  across layers"** — exactly the F3 situation (units absent), where the expected outcome is a
  `pixel`-default scale bar plus the "units: unknown" cursor marker, not a refusal. Anisotropy is
  visible via distinct per-axis pixel sizes in the readout.
- **[PRODUCT]** Fallbacks: any axis lacking `scale` (spec violation — exactly one is MUST) →
  **R1**-class refusal for that axis' readout with reason; `path`-based transform → **R3** as in
  B1; translation absent → treated as 0 (`identity` is the declared default, S1 §`version0.4:trafo-md`).
- **[SRC]** Version/conditions dependence: formula and unit behavior pinned to napari ≥ 0.7.1
  layer `scale`/`translate`/`units` semantics (S8 base semantics at 0.6.5; units scale bar S7′)
  and S1 transforms; re-verify on any toolkit upgrade (napari PR #9495, S10, shows level-related
  transform corrections continue to evolve).

## B3. Resolution switching and optional categorical label overlay

- **[PRODUCT]** Level switching: a two-state control (Level 0 = highest resolution, Level 1).
  With napari ≥ 0.7.1 use `locked_data_level` (S9; shipped in v0.7.1 per S7′ Highlights — "for 2D
  display, you can fix the resolution level"); otherwise two Image layers with per-level
  `scale`/`translate` and visibility swap. **[INF]** Switching re-derives B2 readouts from the
  selected level's own transforms — never assume levels share a grid (Q2 "no alignment
  guarantee"; upstream lesson Q3).
- **[PRODUCT]** Overlay admission test (all must pass, else withhold with reason):
  1. Exactly one label listed (else **R4**, B1).
  2. Label group has `image-label` + `multiscales` (MUST, S1 §`version0.4:label-md`) — else **R4**.
  3. **[SRC]** Label `datasets` series length **MUST** equal image's (2) — violation → **R5**
     ("label pyramid has N levels; 0.4 requires the same number as the image").
  4. **[INF/PRODUCT]** Physical-extent agreement per level: composed physical extents of label
     level *k* and image level *k* must coincide within tolerance ε = half a level-0 pixel
     (product choice; the format specifies no tolerance) — failure → **R5** with the per-level
     extent diff shown. Counterexample X1 (conforming misaligned label level) shows this test
     must exist: path association and the level-count MUST do not prevent displacement.
- **Association:** **[SRC]** by path (`labels` listing; `source.image` default `"../../"`), S1
  §`version0.4:labels-md`/§`version0.4:label-md`. **[PRODUCT]** We additionally require the
  admission test above; path association alone is not treated as an alignment guarantee.
- **Transform:** label layer gets its own composed `scale`/`translate` (+ units) from its own
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

Covered by Q1 (napari vs vizarr comparison at pinned versions, both listed in S1 §Implementations
with the full vizarr quote restored) and Q3 (#7962 → #8098 → `test_make_label_from_shape_param` →
v0.6.5, with the fix author's residual-limitation note as strengthening evidence). **[SRC]**
observed upstream behavior and **[PRODUCT]/[INF]** are separated throughout; no upstream behavior
is asserted beyond the cited captures.

## B5. Revised plan, discriminating validation, visible limits

**Revised steps (replace thin-plan steps 1–4):**

1. **Reader/contract** — implement B1 checks as a small pure function over the `.zattrs`/`.zgroup`
   tree returning either a typed `Dataset` model (axes, units, per-level transforms, label
   descriptor) or an `R-state`. No format conversion, no network.
2. **Calibration model** — implement the Q2 composition (dataset-level then multiscales-level),
   axis-ordered, with unit presence flags; wire to napari layer `scale`/`translate`/`units`
   (≥ 0.6.5 semantics, S8) and to the cursor readout plus the **napari ≥ 0.7.1** units-aware
   scale bar (S7′, C1), honoring the cross-layer units-consistency condition (B2).
3. **Level switching** — two-level control; per-level readout recomputation; ≥ 0.7.1
   `locked_data_level` or two-layer swap fallback (B3).
4. **Label overlay** — admission pipeline (B3) and categorical rendering with per-label colors
   from `image-label.colors` when present (S1 §`version0.4:label-md`; duplicate `label-value`:
   keep last, per the spec's "SHOULD ignore all except the *last* entry" — throwing is equally
   compliant; keep-last is the [PRODUCT] choice among compliant options).
5. **Refusal states** — R1–R6 UI states as specified in B1/B3.
6. **Validation** — the fixture matrix below (planned; **not executed in this stage**).

**Discriminating fixture set (planned; each fixture discriminates one behavior; none executed):**

| # | Fixture | Expected outcome (discriminates) |
|---|---------|----------------------------------|
| F1 | 2 levels, isotropic scale, no offsets, units present | overlay shown; cursor = s·i; scale bar unitful |
| F2 | anisotropic (sx≠sy) + nonzero translations, both levels | cursor matches composed formula; overlay passes extent check (offset handling — the case upstream xfails and the fix author's note flags) |
| F3 | units absent | unitless cursor readout + "units: unknown" markers; scale bar falls back to `pixel` default (S7′: units shown only when layers have units set and are logically consistent — C1) |
| F4 | label with 1 level vs image's 2 | R5: MUST level-count violation reported with clause (§`version0.4:label-md`) |
| F5 | label with 2 levels, extent mismatch > ε at level 1 | R5 with per-level diff (no alignment guarantee → verify; cf. X1) |
| F6 | no `labels` group | R6 disabled state, image fine |
| F7 | Zarr v3 store / missing `multiscales` | R1 unsupported input (F7b exercises the C5 relabeled product gate) |
| F8 | `path`-based scale transform | R3 limited state, image at pixel scale |
| F9 | 3 levels | R2 product-contract refusal |
| F10 | two `multiscales` entries with names | name-choice honored, fallback first (S1 informative pseudocode) |

**Visible limits (product):** 2-D only; one dataset; no unit conversion; inline transforms only;
no 3-D, time, cloud stores, authoring, segmentation, registration estimation or conversion (brief
scope). **[CORRECTION C4]** Rendering above ~1023 distinct label values: the documented
incorrect-rendering caveat is attached to the **deprecated** `color` dict mapping in napari v0.6.5
("…will render incorrectly if they map to more than 1024 distinct colors", S8 docstring, marked
DEPRECATED in favor of `napari.utils.colormaps.DirectLabelColormap`); behavior of the modern
`DirectLabelColormap` path at/above the cap is **not** verified — treated as a conservative risk
limit and tracked in lead 5.

**Unresolved consequential dependencies:** see `out/UNRESOLVED_LEADS.md` (companion artifact of
this stage).

---

## Self-check against the brief

- **Three questions answered:** Q1 (components, version-pinned behaviors, minimal choice), Q2
  (axis/calibration interpretation, physical cursor formula, resolution switching, label
  association; metadata declarations distinguished from alignment guarantees), Q3 (traceable
  #7962 → #8098 → parametrized test → v0.6.5 chain, scoped lesson, corroborating ome-zarr-py
  v0.19.2 fix).
- **Five obligations covered:** B1 (§B1), B2 (§B2, corrected per C1), B3 (§B3), B4 (Q1+Q3, §B4),
  B5 (§B5 with discriminating fixtures and visible limits).
- **Critique disposition:** all six points C1–C6 adopted and applied; C1 changed the plan
  substantively (B2 pin + condition + F3 outcome); C5 changed a normative-force label; C2/C3/C4/C6
  are locator/quote/attribution/force precision fixes; none rejected. Supported findings of the
  frozen proposal (spec quotes, issue→fix→test chain, component behaviors, fixture design) are
  preserved; no supported finding was dropped.
- **No execution claimed:** every fixture and formula outcome above is *planned/derived*; no test
  or arithmetic was executed in this stage and no execution receipt exists.
- **Unresolved consequential leads remain visible** in `out/UNRESOLVED_LEADS.md`: napari floor vs
  deployment, vizarr `src/utils.ts` composition order, ome-zarr-py refusal-case behavior,
  ε tolerance, 1024-color cap on the modern colormap path, and napari v0.9.2 release-object status
  for S10.
