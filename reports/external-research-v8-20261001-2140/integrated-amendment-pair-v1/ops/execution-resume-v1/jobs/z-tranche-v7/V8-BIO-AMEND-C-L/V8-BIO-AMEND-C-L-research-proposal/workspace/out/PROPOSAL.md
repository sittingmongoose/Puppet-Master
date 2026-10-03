# V8-BIO-AMEND-C-L — Research-backed proposal
## Local, read-only inspector for one 2D OME-NGFF 0.4 dataset (two resolution levels, optional categorical label overlay)

**Deliverable type:** research-backed revision of `inputs/THIN_PLAN.md` (no implementation).
**Claim discipline:** every consequential statement is tagged:
- **[SRC]** — fact asserted by a cited public primary source (locator given; normative keyword MUST/SHOULD/MAY preserved as written).
- **[INFER]** — engineering inference from source facts, not stated by any source.
- **[CHOICE]** — product decision of this proposal (could be made differently).
- **[CORRECTION]** — supported correction of an assumption in the thin plan, backed by the traced issue→fix→test history (§4).
**Validation status:** all tests in §7 are *proposed and not executed*. No execution receipt exists for this stage; nothing here asserts that a proposed test passed.

---

## 1. Primary sources discovered for this case (no evaluator list was supplied)

| ID | Source & exact locator | Used for |
|----|------------------------|----------|
| S1 | OME-NGFF specification **version 0.4** (front matter: `version: 0.4`, `date: 2023-05-25`, `status: w3c/CG-FINAL`), source file `index.md` at git tree `a4c68004fdb8a8d822367205dc12f9574a32ddf8` of repo `ome/ngff-spec` (pinned by the `specifications/0.4` entry of `ome/ngff@main`); published at https://ngff.openmicroscopy.org/0.4/ . All §-references below are section titles inside that file. | Q2, B1–B3 normative content |
| S2 | `ome/ome-zarr-py` **issue #403** — “`coordinateTransformations` generated for 0.4 are scale-only” (opened 2024-11-06 by d-v-b; state closed/completed 2026-06-17), https://github.com/ome/ome-zarr-py/issues/403 | Q3, B4 |
| S3 | `ome/ome-zarr-py` **PR #590** — “Include translations in multiscales” (will-moore; merged 2026-06-17T15:55:02Z; head commit `db3d40e8f4596e39a38cabb355f871aa29bce3e2`; file list `ome_zarr/format.py`, `ome_zarr/classes/image.py`, `tests/test_writer.py`), https://github.com/ome/ome-zarr-py/pull/590 | Q3, B4 |
| S4 | `ome/ome-zarr-py`, file `ome_zarr/format.py` at branch `master` (repo default branch, captured 2026-10-03): `FormatV04` (`version == "0.4"`, `zarr_format == 2`), `detect_format`, `_get_metadata_version`, `validate_coordinate_transformations`, post-fix `generate_coordinate_transformations` | B1, B3 |
| S5 | `napari/napari` **release v0.9.2**, published 2026-09-29 (release notes: “napari is a fast, interactive, multi-dimensional image viewer for Python … built on top of Qt … and vispy”; EffVer “Meso” release) | Q1, B4 |
| S6 | napari documentation, repo `napari/docs@main`, file `docs/howtos/layers/image.md` (captured 2026-10-03): multiscale images; automatic level selection; `locked_data_level`; interpolation list (“`nearest` - default”); 2D-only transform tool note | Q1, B3 |
| S7 | napari documentation, repo `napari/docs@main`, file `docs/guides/units.md` (captured 2026-10-03): scale/translate/units → world coordinates; Pint units; pixel fallback when units absent; scale-bar unit behavior | B2 |
| S8 | `haesleinhuepf/stackview`, `README.md` at branch `main` (captured 2026-10-03): Jupyter (`ipycanvas`/`ipywidgets`)-based viewing, `picker`, `curtain`/`blend` overlays, nD support “since stackview 0.10.0” | Q1, B4 |

---

## 2. Q1 — Which two existing components, and why (B4, part 1)

**Candidates compared (both discovered independently for this case):**

**(A) napari v0.9.2, embedded read-only in a small desktop (Qt) shell. [SRC S5,S6,S7]**
Version-specific behaviors: an image layer accepts a *list of arrays* as a multiscale pyramid; “napari can support any type of multiscale image as long as the shapes are getting smaller each time” (S6). Level choice is automatic from zoom in 2D, and `locked_data_level` can force one level (“available on both `Image` and `Labels` layers”), resetting to automatic when data is replaced (S6). Every layer carries `scale`, `translate` and `units`; scale “is used to transform each layer from its data coordinates into rendered world coordinates”; units are any valid Pint unit; without units napari “assumes pixels”, and the scale bar falls back to pixels or becomes dimensionless if no consistent unit exists (S7). Image-layer interpolation choices include `nearest` as the documented default (S6). Constraint: the layer *transform* GUI tool “is limited to 2D viewer display mode” (S6) — irrelevant here since the prototype is 2D-only. Constraint: pin-check `locked_data_level` against the exact installed version at implementation (docs captured from `main`; see leads).

**(B) stackview (Jupyter-based interactive viewer). [SRC S8]**
Gives intensity `picker`, image/label `curtain` and `blend` overlays, and n-D sliders “since stackview 0.10.0” (S8). Version-specific constraints that disqualify it here: it renders NumPy-like arrays supplied by the caller — the README documents **no** Zarr/NGFF reader, **no** multiscale/pyramid handling, **no** physical-unit or scale-bar support, and its widgets are notebook (`ipywidgets`) components rather than an embeddable desktop window (S8). [INFER] Every one of the thin plan's four functions (reader, calibration, level switching, overlay) would have to be built around it.

**Recommendation [CHOICE]:** napari v0.9.2 embedded as a read-only Qt widget, driven by our own thin NGFF-0.4 interpretation layer (not napari's plugin reader), with stackview rejected for the reasons above. **Concrete tradeoff:** napari pulls in Qt + vispy + Pint (heavy for a “small” prototype) but supplies exactly the three risky behaviors this product needs — per-level world transforms with units, two-mode level switching, and a same-world-space labels overlay — whereas a hand-rolled matplotlib/Qt canvas would be lighter but would require re-implementing calibrated overlays and level management with no upstream test history behind them (S6–S8). Mitigation: embed only `Viewer` + two layers, no plugin manager, no editing paths.

---

## 3. Q2 — What OME-NGFF 0.4 actually requires/permits for this input

All keywords below are the spec's own RFC-2119 usage (S1 §“Document conventions”; JSON comments are forbidden in files, S1, informative note).

**(a) Axes & calibration.**
- A multiscales dictionary **MUST** contain `axes`; `axes` length **MUST** equal the arrays' dimensionality; entries **MUST** be ordered t → channel/custom → space (S1 §“multiscales”).
- Each axis **MUST** contain `name`; **SHOULD** contain `type`; **SHOULD** contain `unit`, with values drawn from a UDUNITS-2 list (S1 §“axes”). **[SRC]** Units are therefore *optional but recommended*; a conforming file may carry no units at all. **[CHOICE]** Absent `unit` ⇒ display pixel units (“px”), withhold the physical scale bar, and say why.
- Each `datasets` entry **MUST** contain `coordinateTransformations` with **exactly one `scale`**; “If scaling information is not available or applicable for one of the axes, the value MUST express the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0”; it **MAY** contain **exactly one `translation`**, and “If `translation` is given it MUST be listed after `scale` to ensure that it is given in physical coordinates”; `scale`/`translation` lengths **MUST** equal `axes` length; a multiscales-level `coordinateTransformations` **MAY** exist and is “applied after” the per-dataset ones (S1 §“multiscales”, §“coordinateTransformations”: transformations “are applied sequentially and in order”).
- **Metadata declaration vs. alignment guarantee [SRC→INFER]:** the spec *declares* a mapping from data indices to physical coordinates; it contains no statement that pixel content actually sits where the transforms claim, and — decisively — it does not force writers to *emit* a translation when downsampling shifts content. The traced history in §4 shows a mainstream writer produced scale-only metadata “incorrect for almost all multiscale pyramids” (S2). So: transforms are per-file declarations to be *read and cross-checked*, never an alignment guarantee. **[CORRECTION]** The thin plan implicitly treated calibration as a single per-image property; corrected view: calibration is per-level (scale+translation), plus optional group-level transforms, ordered.

**(b) Physical cursor coordinates.**
- [SRC] Physical coordinate of a cursor over level *L* on axis *i*: apply, in order, the dataset's `scale` then `translation` (and then any multiscales-level transform): `physical = scale_L[i] · index_i + translation_L[i]` (+ group-level effect), using the `unit` of axis *i* when present (S1 §“coordinateTransformations”, §“multiscales”; S7: napari composes layer `scale`+`translate`+`units` into world coordinates).
- [CHOICE] Cursor readout shows world coordinates with the axis unit; if units are absent the readout shows “px” and the scale bar is either pixel-labeled or hidden with a visible reason (napari's own fallback is pixels / dimensionless scale bar, S7). [INFER] Because S2/S3 show translations are frequently absent, the readout must be computed per displayed level, not from level 0 alone. Pixel-center vs. index-origin convention is **not** fixed by the spec — flagged as a product decision in leads.

**(c) Resolution switching.**
- [SRC] `datasets[].path` “MUST be ordered from largest (i.e. highest resolution) to smallest” (S1 §“multiscales”); how a *consumer* picks a level is unconstrained by the spec. The informative pseudocode for multiple `multiscales` entries (choose by name, fall back to the first) is an **example**, not a MUST (S1, example block).
- [SRC] napari automatically selects the level from zoom/viewport in 2D and offers `locked_data_level` to force a level (S6). **[CHOICE]** Prototype exposes both: an “auto (zoom)” toggle and an explicit two-button level selector backed by `locked_data_level`, so inspection is deterministic and testable.

**(d) Image/label association.**
- [SRC] An image group may contain a `labels` group whose `.zattrs` lists label paths; “Unlisted groups MAY be labels” (S1 §“labels”).
- [SRC] `image-label` groups “MUST also contain `multiscales` metadata and the two ‘datasets’ series MUST have the same number of entries”; `colors` **SHOULD**, `properties` **MAY**, `source.image` **MAY** (default `"../../"`), `version` **SHOULD** (S1 §“image-label”).
- [SRC] The informative layout diagram notes label dimensions “should be either the same as the corresponding dimension of the image, or `1`” — that is diagram commentary, not a MUST (S1 §“Images”, layout comment).
- **Association vs. alignment [INFER]:** the spec gives a *path-based association* and a level-count equality MUST, but no cross-check that the label's per-level `coordinateTransformations` equal the image's, and no guarantee the label grid is registered to the image grid. Overlay justification must therefore be *earned per file* (§6 checks), matching the brief's requirement to either justify the overlay or withhold it.

---

## 4. Q3 — Real issue → fix → test chain (B4, part 2)

**Issue [SRC S2]:** `ome/ome-zarr-py` #403, “`coordinateTransformations` generated for 0.4 are scale-only” (2024-11-06). Reporter: “The most common methods of image downsampling result in a translation of the downsampled image, but this code for generating `coordinateTransformations` metadata only returns scale transformations, which will be incorrect for almost all multiscale pyramids,” pointing at `ome_zarr/format.py` (commit `56f72b0`, lines 260–271). Suggested fix: “generate translation transforms.”

**Fix [SRC S3]:** PR #590 “Include translations in multiscales” (opens with “Fixes #403”), merged 2026-06-17. The diff (head `db3d40e`):
- `ome_zarr/format.py`, `generate_coordinate_transformations`: now appends per level `{"type": "scale", "scale": scale}, {"type": "translation", "translation": trans}` with `trans = [s / 2 - s0 / 2 for s, s0 in zip(scale, scale0)]`;
- `ome_zarr/classes/image.py`: adds a `Translation(...)` per pyramid level using the same formula;
- the same translation convention is what ships in `format.py` on `master` today (S4, `FormatV04.generate_coordinate_transformations`).

**Tests [SRC S3]:** `tests/test_writer.py` in the same PR — assertions tightened from `len(cts) == 1` to `len(cts) == 2` (with `cts[0]["type"] == "scale"`) in `test_image_class_writer`, `test_write_image_current`, `test_write_image_dask`, and `verify_label_data`; explicit expected `scale`+`translation` pairs added in `test_writer`, `test_write_multiscale_labels`, `test_write_multiscale_labels_storage_options`, `test_two_label_images`. The PR was merged with these test changes; **this stage did not re-run the upstream suite** (no execution receipt), and the PR's own TODO text shows tests were finalized inside the PR.

**Scoped lesson [INFER]:** pyramid-level *calibration* is two-part (scale **and** per-level translation); assuming scale-only silently misregisters coarser levels whose shapes are not exact integer multiples. **Validation consequence:** conformance checks must assert the *presence, order (scale before translation), arity (== ndim) and numeric types* of both transform kinds — exactly the checks in `FormatV04.validate_coordinate_transformations` (S4) — and regression tests must encode expected per-level transform *values*, not just “metadata present”. **[CORRECTION]** Thin-plan step 2 (“Design metadata interpretation, calibrated inspection …”) is revised accordingly: interpretation is per-level, and the reader must not synthesize an alignment it cannot justify from the file.

---

## 5. B1 — Local input contract, version/support checks, read-only boundary

**Input contract [CHOICE, built on SRC S1,S4]:** exactly one local path to a Zarr **v2** group (`.zgroup` + `.zattrs` present; “Arrays MUST be defined and stored … as defined by version 2 of the Zarr specification; OME-NGFF metadata MUST be stored as attributes in the corresponding Zarr groups”, S1 §“On-disk layout”). Accepted shape: `multiscales[0].datasets` with **exactly two** entries (brief condition; more/fewer ⇒ unsupported state, not an error dialog storm). Store opened with explicit read-only mode, mirroring `Format.init_store`/`LocalStore(path, read_only=True)` (S4). No write, rename, or edit call anywhere in the process; the viewer's editing affordances are not constructed.

**Version/support checks [SRC S4 + CHOICE]:**
1. Detect declared version via `multiscales[0].version` (S1: each multiscales **SHOULD** contain `version`, “current version is 0.4”; S4 `_get_metadata_version`).
2. `version == "0.4"` → full support (the designed path).
3. Version key absent → **[CHOICE]** warn visibly and interpret as 0.4 (the spec makes `version` a SHOULD, so absence is conforming), labeling the window “version undeclared; interpreted as 0.4”.
4. Zarr v3 storage (no `.zgroup`, `zarr.json` present; NGFF 0.5, S4 `FormatV05.zarr_format == 3`) → refusal state “unsupported input: Zarr v3 / NGFF 0.5 not in prototype scope”, with the observed version string shown.
5. Per-dataset transform validation before display: exactly one `scale`, first position, `len == ndim`, optional single `translation` after it, all numeric — violations render the file non-conforming and trigger the refusal state (S1 §“multiscales”; S4 `validate_coordinate_transformations` raises `ValueError` on these exact conditions).
6. Dimensionality outside 2–5 or `axes` length ≠ array ndim → unsupported state (S1 MUSTs).

**Absent optional labels:** if no `labels` group/list exists (or the list is empty), the overlay control renders disabled with reason “this dataset declares no labels” — an absence, not an error (S1 §“labels”: labels are optional; “Unlisted groups MAY be labels”).

---

## 6. B2/B3 — Calibrated cursor & scale indication; resolution switching & label overlay

**B2 — physical cursor + calibrated display [SRC S1,S7 + INFER]:**
- Per displayed level L, axis i: `world_i = scale_L[i]·idx_i + translation_L[i]`, then any multiscales-level transform applied after (order is normative, S1). Readout: `y=…, x=… <unit>`; `unit` from `axes[i].unit` mapped to Pint names (napari accepts e.g. `micrometer`/`um`, S7).
- Conditions/exceptions carried through: translation exists only **MAY**-wise; group-level transforms **MAY** exist; units **SHOULD**-wise present. Fallback/withheld: no `unit` ⇒ “px” readout, scale bar hidden or pixel-labeled with tooltip “no axis units declared in .zattrs” (napari fallback: pixels/dimensionless, S7). Missing/non-conforming `coordinateTransformations` ⇒ level not displayed; refusal state per §5(5).
- Scale indication: napari scale bar is unit-aware only when the layer unit is consistent (S7) — [CHOICE] show it only under the same condition as the µm readout.

**B3 — level switching + optional categorical overlay [SRC S1,S6 + CHOICE]:**
- Switching: two buttons (level 0 / level 1) + “auto (zoom)” toggle; auto mode = napari default selection, manual = `locked_data_level` (S6). A level switch never changes cursor *world* coordinates (world is shared; S7), so the cursor readout is continuous across switches — this is the discriminating behavior of test V3 (§7).
- Overlay justification chain, checked in order; every failed check names itself in the UI:
  1. `labels` group lists a path; target group has `image-label` + `multiscales` (MUST, S1).
  2. `source.image`, if present, resolves to the displayed image (default `../../`, MAY, S1).
  3. Label `datasets` count == image `datasets` count (**MUST**, S1 §“image-label”).
  4. Label `axes` order/length compatible with image `axes` ([INFER] from S1 axes rules).
  5. **[CHOICE]** Per level: if the label level declares `coordinateTransformations`, they must match the image level's scale/translation within a tight tolerance; if the label declares none, fall back to the shared-pixel-grid assumption permitted by the spec's layout note (dims equal or 1) and label the assumption in the UI.
- Sampling: nearest-neighbor for the label overlay (categorical integrity; napari documents `nearest` as the default image interpolation, S6); the overlay is never resampled with smoothing.
- **Actionable refusal state [CHOICE]:** overlay panel shows “OVERLAY WITHHELD — <check id + one-line reason>”, overlay layer not added; the image remains inspectable. Examples: “WITHHELD: label has 1 dataset level, image has 2 (spec MUST: same number of entries)” or “WITHHELD: label level-1 translation ≠ image level-1 translation; alignment unverifiable”. This implements the brief's requirement to justify the overlay or withhold it with an understandable reason.

---

## 7. B5 — Revised concrete steps (replacing the thin plan) and discriminating validation

**Revised steps**
1. **Contract & version gate (B1):** implement the §5 checks; refusal states render in-window with machine-readable reason codes.
2. **Per-level interpretation (B2):** parse per-dataset + multiscales-level transforms in normative order; expose per-level scale/translation/unit to the viewer (§6-B2), replacing the thin plan's single “calibration” notion (**[CORRECTION]** per §4).
3. **Level switching (B3):** auto + locked modes (S6), shared world coordinates across levels.
4. **Overlay gate (B3):** the five-check chain of §6-B3 with refusal states; nearest-neighbor sampling only.
5. **Validation & visible limits (below).** All fixtures are synthetic, local, ≤ two levels; every proposed test asserts *world-coordinate invariants*, not pixels.

**Discriminating fixtures & proposed checks (NOT executed; no execution receipt exists)**
- **V1 “unequal+shifted, units present”:** level0 128×128 scale (0.5, 0.5) µm; level1 64×64 with the PR-#590-style translation `(scale1/2 − scale0/2)`; units µm. *Check:* cursor at array index (0,0) of level1 reads (−16.0, −16.0) µm per the proposed arithmetic; scale bar shows µm.
- **V2 “units absent”:** same geometry, no `unit` fields. *Check:* readout in px; physical scale bar withheld with the stated reason (S1 SHOULD; S7 fallback).
- **V3 “switch continuity”:** with V1 input, hover a fixed physical point, switch level 0↔1. *Check:* reported world coordinates invariant; displayed pixel index changes by the scale ratio.
- **V4 “label level-count MUST”:** image 2 levels, label 1 level. *Check:* overlay withheld, reason cites the MUST (S1 §“image-label”); no overlay layer added.
- **V5 “scale-only pyramid (#403 scenario)”:** level1 odd-sized (e.g., 127×127 ⇒ true FOV shift of ~half a coarse pixel) but metadata scale-only. *Check:* viewer renders level1 with its declared (shifted) extent — i.e., does **not** silently assume alignment — and surfaces a “coarse-level origin undeclared” advisory. This encodes the §4 lesson; upstream's own fix/registry (S3) demonstrates the failure class.
- **V6 “label transform mismatch”:** label level-1 translation differs from image's by > tolerance. *Check:* withheld with “alignment unverifiable”.
- **V7 “unsupported inputs”:** Zarr-v3 group; 3-level pyramid; `axes`/ndim mismatch. *Check:* each lands in its named refusal state; no partial display.
- **V8 “absent labels”:** no `labels/`. *Check:* overlay control disabled with absence reason (not an error).

**Visible limits (to be shown in the product, not just docs):** undeclared version; unit-less data; withheld-overlay reasons; advisory when a coarse level lacks translation; version pin of napari/ome-zarr-py in the About box (because behavior in §2/§4 is version-specific).

**Obligation coverage:** Q1→§2; Q2→§3; Q3→§4; B1→§5; B2→§6-B2; B3→§6-B3; B4→§2+§4; B5→§7 (+ `out/UNRESOLVED_LEADS.md` for the remaining consequential leads).
