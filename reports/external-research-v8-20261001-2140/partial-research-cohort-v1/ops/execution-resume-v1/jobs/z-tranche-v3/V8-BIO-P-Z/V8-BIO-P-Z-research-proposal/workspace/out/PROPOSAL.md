# PROPOSAL — V8-BIO-P-Z: research-backed revision of the thin plan
## Local, read-only, calibrated 2D OME-NGFF 0.4 image/label inspection prototype

Stage: research + proposal (Z2). This document is the revised plan; it is **not** an implementation
report. Every validation in §9 is **UNEXECUTED** in this stage (see §9.3). Scope is fixed by the
brief: one local OME-NGFF 0.4 dataset, exactly two 2D resolution levels, one optional categorical
label image; read-only; no 3D, time series, cloud stores, authoring, segmentation, registration
estimation, or format conversion.

**Evidence labels used throughout**
- `[SRC]` source fact (quote-anchored to a captured public primary source, with normative force).
- `[INF]` engineering inference from source facts.
- `[CHOICE]` explicit product choice (not claimed to be required by any source).
- `[CORRECTION]` supported correction of an earlier proposition (thin plan or a rejected alternative).
- `[UNEXECUTED]` proposed test/witness — no execution receipt exists in this stage.

---

## 1. Captured primary sources (discovered independently this stage; exact locators)

Capture tags are 12-char sha256 prefixes of the exact HTTP response bodies captured 2026-10-02 (host records full captures/hashes mechanically).

| # | Source & version locator | Used for |
|---|---|---|
| S1 | OME-NGFF **0.4** spec, https://ngff.openmicroscopy.org/0.4/ — "Final Community Group Report, 1 October 2026"; single-page document (section URLs like `/0.4/multiscales.html` return 404 — verified capture `0267a80deaa1`); normative locators: §1.3 `#document-conventions`, §2 `#on-disk`, §2.1 `#image-layout`, §3.1 `#axes-md`, §3.3 `#trafo-md`, §3.4 `#multiscale-md`, §3.6 `#labels-md`, §3.7 `#label-md`, §5 `#implementations`, §7 `#history`; capture `ca4780a33f95` | All format claims (RQ2, B1–B3) |
| S2 | napari release **v0.9.2**, GitHub `napari/napari` releases (published 2026-09-29), API capture `b762b942da36` | Component version pin (RQ1, B4) |
| S3 | napari `src/napari/components/cursor.py` **at tag v0.9.2**, raw.githubusercontent.com, capture `9713fd652a81` | Cursor world coordinates (RQ1, B2) |
| S4 | napari **PR #9065** "Fix half-voxel offset", `/repos/napari/napari/pulls/9065/files` — merge commit `2c7d1cf8fbbad61f6451446306a7ad6dc9d17901`, merged 2026-06-23, milestone 0.8.0, capture `2f37973c4ff6` | Issue→fix→test chain (RQ3, B4) |
| S5 | napari **issue #6320** "Multiscale layers have a shift due to handling of center vs corner of pixel/voxel" — filed 2023-10-09, **state: open** at capture (updated 2025-07-16), capture `b61597288227` | Same chain; unresolved lead |
| S6 | napari merged-PR search "multiscale translation" (incl. **#9142** level-0 bounding-box overlay, merged 2026-07-07; **#9495** multiscale level extraction with scale/translate corrections, merged 2026-09-25), capture `20c7f497d426` | Supporting version-specific behaviors |
| S7 | **itk-vtk-viewer 14.51.0**, npm registry `registry.npmjs.org/itk-vtk-viewer/latest` (version "14.51.0"; publish metadata timestamp 2024-06-21), capture `2f25c6723603` | Component comparison (RQ1, B4) |
| S8 | itk-vtk-viewer `README.md` @ `master` (browsers: Firefox/Chrome/Safari; Node 16+/npm 8+), capture `4387d35e510d` | Same |
| S9 | itk-vtk-viewer `src/index.d.ts` **at tag v14.51.0** (`ViewerOptions.image`, `ViewerOptions.labelImage`, `LoadableImage = URL | Image | Store | ndarray`; no axis/unit/calibration API), capture `51d71e0614a0` | Same |
| S10 | itk-vtk-viewer issue search "zarr multiscale" — **PR #391** "feat(toMultiscaleChunkedImage): Support passing a Zarr store", merged 2021-03-09, capture `f3f203d86249` | Same |

---

## 2. RQ1 + B4a — two existing viewer components, version-specific precedents

**(answers RQ1; feeds B4)**

Component A: **napari v0.9.2** (S2) — native Qt desktop viewer, NumPy/zarr-backed layers.
Version-specific, captured behaviors that matter for this prototype:
- Cursor position is exposed in **world coordinates** (`Cursor.position: "Position of the cursor in world coordinates"`, S3) — the substrate for B2's physical readout.
- The 0.9.x line is units-aware (0.9.2 notes: "Avoid redundant unit conversion when aggregating layer extents" #9411, S2; the captured test hunk in S4 references a units application registry, `get_application_registry().nm`).
- Multiscale handling is actively level-sensitive: 0.9.2 adds "multiscale level extraction as a `LayerList` action … with `scale` and `translate` corrections" (#9495, S6); #9142 (S6) fixed overlays to compute bounds from the level-0 extent rather than the displayed level; #9065 (S4) fixed a per-level offset bug (§4). These are precedents that level-indexed geometry must be handled per displayed level.
- Constraints: heavy stack (Qt + vispy + scientific Python); embedding means shipping that environment. `[SRC]` for capabilities; installation weight is common knowledge, treated as `[INF]`.

Component B: **itk-vtk-viewer v14.51.0** (S7–S10) — web (vtk.js) viewer.
Version-specific, captured behaviors:
- `index.d.ts` at v14.51.0 accepts `image` and `labelImage` as `LoadableImage = URL | Image | Store | ndarray` (S9) — a label-image channel and Zarr-store loading exist (Zarr-multiscale pipeline introduced by PR #391, merged 2021-03-09, S10).
- Constraint: the captured public API surface has **no axis/unit or physical-calibration API** (no units, spacing-from-metadata, or NGFF axis surface in S9); it targets browsers (S8), so a "desktop prototype" needs an embedded web view `[INF]`; NGFF-0.4-metadata conformance (axes units, per-level transforms, `image-label.source`) is not evidenced anywhere in the captured public surface.

**Recommendation `[CHOICE]` (B4c): napari v0.9.2 + a thin bespoke 0.4 metadata adapter**, because the prototype's differentiator is exactly what Component B does not expose in its captured v14.51.0 surface: physical, per-level, unit-bearing cursor/calibration semantics on a native desktop shell. **Concrete tradeoff**: napari costs a heavy runtime dependency footprint and more packaging effort; itk-vtk-viewer would be lighter and embeddable but would force us to build and maintain the calibration semantics ourselves outside its API, with no captured upstream precedent for units. If the product later mandates an embeddable web component, the decision flips to itk-vtk-viewer 14.51.0 **plus** an out-of-viewer calibration layer — recorded as a lead in `UNRESOLVED_LEADS.md`.

`[CORRECTION]` of thin-plan step 1 ("choose the minimal reader/viewer components"): an unversioned "minimal component" choice is unverifiable and was **rejected**; the supported correction is that the component choice must be pinned to exact versions with captured behavior (S2/S7), because version-specific behavior is where the relevant precedents and gaps live.

---

## 3. RQ2 — what OME-NGFF 0.4 actually requires/permits for this input

**(answers RQ2; grounds B1–B3)**. All references: S1, cited by section anchor. S1 §1.3 adopts RFC 2119; S1's conformance section states all text is normative "except sections explicitly marked as non-normative, examples, and notes."

**On-disk / input detection (B1).**
- OME-NGFF arrays MUST be Zarr **v2**; NGFF metadata MUST be stored as Zarr group attributes (§2, `#on-disk`). `[SRC-MUST]`
- A multiscales image is a group whose `.zattrs` has a `multiscales` list; each entry MUST contain `axes` and `datasets`; `axes` length 2–5 and MUST equal the dimensionality of the arrays (§3.4). `[SRC-MUST]`
- `axes` entries: `name` MUST be present and unique; `type` SHOULD be `space`/`time`/`channel` (custom MAY); `unit` SHOULD be present, SHOULD be a UDUNITS-2 string (§3.1). `[SRC-MUST]/[SRC-SHOULD]`
- `datasets[].path` MUST be ordered largest→smallest (highest resolution first); each dataset MUST contain `coordinateTransformations` containing exactly one `scale` and MAY contain exactly one `translation`, which MUST be listed **after** scale "to ensure that it is given in physical coordinates"; scale/translation lengths MUST equal the axes length (§3.4). `[SRC-MUST]/[SRC-MAY]`
- Exception (spec-internal): if scaling information is unavailable for an axis, the scale value MUST still be present and express the factor relative to the first resolution, defaulting to 1.0 (§3.4). `[SRC-MUST]`
- `multiscales[].version` SHOULD be present ("current version is 0.4") (§3.4). `[SRC-SHOULD]`
- Only `translation` and `scale` types are permitted at dataset level; transformations in a list "are applied sequentially and in order" (§3.3); a multiscales-level `coordinateTransformations` MAY exist and "are applied after" the per-dataset ones (§3.4). `[SRC-MUST]/[SRC-MAY]`

**Interpretation (declaration vs guarantee).**
- Per level *i*, the normative mapping is `phys = t_i + s_i · idx` (translation applied after scale; translation in physical units). A multiscales-level transform composes after it. This is a **metadata-declared mapping**, and 0.4 admits only axis-aligned scale/translation — there is no rotation/shear and **no separate "alignment guarantee" statement**: nothing in S1 asserts that two groups' declared transforms are mutually consistent. `[SRC]` + `[INF]` (the guarantee claim is an argument from the enumerated allowed types and the MUST rules, not from an explicit sentence).
- Physical cursor coordinates are therefore derivable but conditional: absolute units exist only when `axes[].unit` is declared (SHOULD, not MUST). With no unit, the spec still provides scale (at minimum a level-relative factor); the display can then only be unit-relative. This is the fallback in B2.
- **Resolution switching** is selection among `datasets[].path` in the declared order (largest→smallest, §3.4). `[SRC-MUST]` The spec assigns no switch-trigger; that is viewer product space. `[CHOICE]`
- **Image/label association (B3).**
  - A `labels` group under the image group lists label paths; "Unlisted groups MAY be labels" (§3.6). `[SRC-MAY]`
  - An `image-label` group MUST also contain `multiscales`, and "the two 'datasets' series MUST have the same number of entries" (§3.7). `[SRC-MUST]` — i.e., 0.4 requires equal level **count**; it does NOT require equal shapes, equal transforms, or pixel registration.
  - Association is **optional metadata**: `image-label.source` MAY exist; if present it MAY include `image`, whose value MUST be a relative path string; the documented default is `"../../"` "since most labels are stored under a subgroup named 'labels/'" (§3.7). `[SRC-MAY]/[SRC-MUST-on-shape-of-value]`
  - Non-normative color/properties detail: `colors[].label-value` MUST be unique integers; clients not throwing SHOULD honor the last duplicate entry (§3.7). `[SRC-SHOULD]`
  - Layout-era hint, **non-normative**: the §2.1 layout illustration comments that label dimensions "should be either the same as the corresponding dimension of the image, or 1". Being part of an example diagram, it has no RFC 2119 force. `[SRC-info]`

`[CORRECTION]` Rejected proposition: "the format guarantees the label aligns with the image" (implicit in thin-plan step 3). Supported correction: 0.4 guarantees only (i) equal dataset-series length (MUST) and (ii) an optional, path-valued `source` pointer (MAY). Everything else — shapes, transforms, registration — is undeclared, so overlay alignment must be *justified from the pair of declared transforms* or *withheld*.

---

## 4. RQ3 + B4b — real issue → fix → test chain

**(answers RQ3)** — napari (S4, S5), fully captured:

- **Issue** `napari/napari#6320` (S5, open bug, 2023-10-09): multiscale image/label layers **shift relative to each other** because of pixel/voxel *center vs corner* handling; "this effect occurs whenever `scale` is used and becomes noticeable when scale values approach the same order of magnitude as dimensions of a layer." The reproducer toggles 2D/3D on multiscale labels and observes the shift.
- **Fix** `napari/napari#9065` "Fix half-voxel offset" (S4, merged 2026-06-23, milestone 0.8.0): in `src/napari/_vispy/layers/base.py`, the 3D half-voxel translate was computed from `downsample_factors[-1]` (**coarsest** level) instead of the **rendered** level; the patch uses `downsample_factors[data_level]` and maps the data-space offset to world units: `translate += (displayed_downsample - 1) / 2 * layer_scale`.
- **Test**: the same PR adds `test_3d_multiscale_half_voxel_uses_rendered_level` to `src/napari/_vispy/_tests/test_vispy_image_layer.py` (+38 lines), asserting the rendered level-0 offset is `[0, 0, 0]` while the coarsest level (factor 4) yields `(4−1)/2 = 1.5` — i.e., the fix's discriminating regression test with explicit numbers.

**Scoped engineering lesson** `[INF]`: any quantity that is *level-indexed* (offsets, extents, half-voxel corrections, cursor probes) must be computed from the level actually displayed and then mapped through that layer's scale into world units; a wrong-level constant fails **silently** (the data still renders, just shifted) and is masked when only one level is ever shown. Corroborating chain: #9142 (S6) — the bounding-box overlay used the displayed level instead of level 0 (the mirror-image error), fixed with an updated test.

**Validation that follows** (proposed here, `T5` in §9, `[UNEXECUTED]`): a per-level regression test asserting that every level-indexed offset equals `(f_L − 1)/2 · s_L` with `f_L, s_L` taken from the *rendered* level, plus an overlay-consistency test that image and label level-*i* land on the same world coordinates (§9.2 W3).

`[CORRECTION]` Rejected proposition: "level selection is display-only and cannot corrupt geometry." Correction, supported by S4/S5: level-indexed geometry errors are real, merged-into-release class bugs with silent symptom (shift), so resolution switching requires its own discriminating tests, not just visual QA.

---

## 5. B1 — local input contract, version/support checks, read-only boundary

`[CHOICE]` contract, with `[SRC]` anchors:

Accepted input: one **local directory** forming a Zarr v2 group (`.zgroup` + `.zattrs`) whose `.zattrs` satisfies **all** of:
1. `multiscales` present, list; prototype uses the **first** entry and shows a visible notice if more than one exists (spec: multiple multiscales → user may choose by name, first as fallback — §3.4, non-normative guidance paragraph). `[SRC-info]` + `[CHOICE]`
2. Exactly **2** `datasets` entries (brief: exactly two resolutions). More/fewer → refusal state `E-LEVELS`. `[CHOICE]` (contract narrowing, not a spec claim)
3. `axes`: exactly 2 entries, both `type: "space"`, unique `name`s (§3.1 MUST); otherwise `E-AXES` (out of declared prototype scope). Units: used if present, else unitless fallback (§5/B2). `[SRC-MUST]` + `[CHOICE]`
4. `version` field: if present and ≠ "0.4", or absent → non-blocking warning banner `W-VERSION` (SHOULD-level, §3.4). `[SRC-SHOULD]` + `[CHOICE]`
5. Per dataset: `coordinateTransformations` with exactly one `scale`, optional one `translation` **after** scale, vector lengths == 2 (§3.4 MUSTs); violations → `E-TRANSFORM`. `[SRC-MUST]`
6. Arrays readable as Zarr v2 at each `path` (`.zarray` present; dimension separator honored as declared in `.zarray` — the 0.4 line ships the v0.2.0 change to nested `/` separators, §7 history). Compressor unsupported → `E-ZARR`. `[SRC]` + `[INF]`
7. Optional label: a group under `labels/` (§3.6) carrying `image-label` metadata (§3.7). Checks before any overlay: `image-label` group MUST contain `multiscales` and its `datasets` series MUST have the same number of entries as the image's (§3.7 MUST) — violation → **overlay withheld**, reason `R-LABEL-CONFORMANCE` (spec-non-conformant label, brief's "different level counts" condition). `[SRC-MUST]`

**Absent optional labels**: window opens normally with the overlay control visibly disabled and tooltip "no label image declared/found" (behavior for absence required by B1). `[CHOICE]`

**Unsupported input** (any `E-*`, or non-group directory, or 3D/4D/5D axes): a refusal screen naming the failed check — never a partial render. `[CHOICE]`, consistent with the brief's requirement of an understandable visible state.

**Read-only boundary** `[CHOICE]`: the process opens the store with read-only file access; the viewer exposes no editing actions (no label painting, no save); a proposed verification `T4` (§9) asserts input-file hashes are unchanged across a session.

---

## 6. B2 — physical cursor coordinates and calibrated display/scale indication

**Definition** `[SRC]`-grounded, `[CHOICE]`-assembled: for the displayed level *i* with scale `s_i`, translation `t_i` (dataset-level) and any multiscales-level transform `(S, T)` applied after (§3.4):
- display/world position of voxel: `phys = T + S · (t_i + s_i · idx)`; inverse for probing: `idx = (phys − T − t_i) / s_i` (element-wise, per axis order of `axes`).
- Unit for each axis = `axes[].unit` string (UDUNITS-2, §3.1). **Conditions**: only when declared; **units scope** is per-axis, no cross-axis unit conversion is performed. `[CHOICE]`
- **Version dependency**: implemented on napari v0.9.2 whose cursor reports world coordinates (S3) and whose extents pipeline is units-aware (S2); the widget reads `viewer.cursor.position` (world) and renders the physical readout. `[SRC]` for the substrate; the readout string itself is ours. `[CHOICE]`

**Calibrated display/scale indication** `[CHOICE]`: a status line per axis, e.g. `y: 2.0 micrometer/px · x: 2.0 micrometer/px (level 1)`, sourced from the selected level's own `scale`; plus a scale bar computed from `s_i` and canvas pixels-per-phys.

**Fallbacks / withheld behavior**:
- `unit` absent for an axis → readout switches to index-space with explicit tag `units not declared (NGFF 0.4 axes.unit optional)`; scale bar withheld with reason. `[SRC-SHOULD]`-grounded, `[CHOICE]` behavior.
- `scale` values equal across levels (relative-only calibration, §3.4 exception) → readout shows a `relative-scale only` tag instead of asserting physical size. `[SRC-MUST]`-aware `[CHOICE]`.
- Unequal axis scales and nonzero offsets (brief's calibration condition) are handled natively by the per-axis formula — nothing extra is needed; that this works is `[INF]` from §3.3/§3.4, and is discriminatingly checked by witness W (§9.2).

---

## 7. B3 — resolution switching and optional categorical label overlay

**Resolution switching** `[CHOICE]`: a two-entry control ordered by `datasets` (highest first, §3.4 `[SRC-MUST]`); switching changes the displayed array only; world coordinates, cursor readout and overlay mapping recompute with the selected level's own `(s_i, t_i)` — the exact hazard class of §4's upstream bugs. Level-0 remains the reference level for extents (precedent: #9142, S6).

**Label overlay** — shown only when the association/transform/sampling assumptions are established; otherwise an **actionable refusal state** (reason codes, next-step hint), per the brief:
1. **Association** (justification required by brief): strong — `image-label.source.image` present (MAY, §3.7) and resolves (path-join semantics; default `"../../"` when `source` exists without `image`) to this image group; weak — label found at the conventional `<image>/labels/<name>` without `source` (documented default convention, §3.7) but then the overlay carries a persistent `association by convention` badge. No association → overlay withheld, `R-ASSOC`. `[SRC-MAY]` + `[CHOICE]`
2. **Transform justification**: compute world extents of image level *i* and label level *i* from each one's own declared transforms; require (a) the label's mapping to be axis-aligned scale/translation (guaranteed by §3.3's allowed types `[SRC-MUST]`), and (b) the label's world extent to **cover** the image's world extent within one label voxel (covership tolerance) `[CHOICE]`. Different shapes are acceptable if (b) holds — that is exactly the case the spec leaves unguaranteed and the prototype must justify. Failure → `R-COVER` withheld.
3. **Sampling/alignment assumptions** `[CHOICE]`: categorical labels are sampled **nearest-neighbor** at the inverse-mapped voxel index (no interpolation of label values); alignment convention is **voxel-center** (`phys` of a voxel = its center). The center-vs-corner ambiguity is real and upstream-open (S5) — the prototype states its convention in the UI info line rather than leaving it implicit.
4. **Conformance gate**: label `datasets` series length ≠ image's → `R-LABEL-CONFORMANCE` (§3.7 `[SRC-MUST]`); this is the brief's "different level counts" condition resolved by refusal, not silent overlay.

Refusal states are visible, named, and actionable (e.g., `R-COVER: label world extent does not cover image extent; overlay withheld`).

---

## 8. METHOD — three propositions, conditions/exceptions/normative force

| # | Proposition | Selected source/version | Applicability condition | Relevant exception | Normative force | Evidence vs inference vs choice |
|---|---|---|---|---|---|---|
| P1 | Embed **napari v0.9.2** (not itk-vtk-viewer 14.51.0) as the viewer substrate | S2–S3, S7–S9 | Local read-only 2D, ≤2 levels, calibration semantics required | If an embeddable web component is mandated → choose itk-vtk-viewer 14.51.0 + external calibration layer | None — product decision | Capabilities `[SRC]`; weight/ergonomics `[INF]`; selection `[CHOICE]`. **Supported correction**: unversioned "minimal component" choice (thin plan) rejected — only pinned versions carry checkable behavior |
| P2 | Per-level mapping `phys = t_i + s_i·idx` (+ multiscales-level transform applied after); unit display only when `axes[].unit` declared | S1 §3.3 `#trafo-md`, §3.4 `#multiscale-md`, §3.1 `#axes-md` (0.4, report of 2026-10-01) | OME-NGFF **0.4** dataset-level `coordinateTransformations` | Scaling unavailable per axis → scale still REQUIRED as relative factor, default 1.0; identity is the default transform (§3.3 table) | Presence/order/length of scale(+translation): MUST; translation after scale: MUST; units: SHOULD; multiscales-level CT: MAY | Formula & forces `[SRC]`; extension to cursor probing `[INF]`; readout formatting `[CHOICE]`. **Supported correction**: "metadata fully guarantees physical calibration" rejected — absolute units are only SHOULD-likely, scale may be relative-only |
| P3 | Level-indexed geometry must be computed from the rendered level and mapped through that level's scale; regression-tested per level | S4 (PR #9065 patch+test, merge commit `2c7d1cf8`), S5, S6 (#9142) | Multiscale rendering with level-dependent factors/scales (our 2 levels included) | Single-level display paths mask the bug (as 3D showed only the coarsest level) | No format force — upstream observed behavior + our engineering rule | Patch/test text `[SRC]`; lesson generalization `[INF]`; mandatory-test policy `[CHOICE]`. **Supported correction**: "switching levels is display-only" rejected — silent level-indexed shifts are documented upstream |

### Numerical witness W `[UNEXECUTED]` — discriminates the spec mapping from two failure interpretations

Fixture (product fixture, values chosen by me): axes `[y(space, "micrometer"), x(space, "micrometer")]`;
level `"0"`: shape (64, 64), `coordinateTransformations: [scale(1.0, 1.0), translation(10.0, 5.0)]`;
level `"1"`: shape (32, 32), `[scale(2.0, 2.0), translation(10.0, 5.0)]` — same physical origin, per §3.4's per-level declaration style.
Probe the world point `W = (y=30, x=15) µm` on **level 1**.

- **A (spec-conformant, P2)**: `idx = (W − t)/s` → `idx_y = (30−10)/2.0 = 10`, `idx_x = (15−5)/2.0 = 5` → voxel (10, 5). Cross-level consistency: level-0 index `(30−10)/1.0 = 20`, `(15−5)/1.0 = 10` → (20, 10); its center maps back to `20·1+10 = 30`, `10·1+5 = 15` µm — same point as level-1 (10,5) center `10·2+10 = 30`, `5·2+5 = 15` µm. ✔ consistent.
- **B (composition-order error: translation treated as index-space, `phys = (idx+t)·s`)**: `idx_y = 30/2 − 10 = 5`, `idx_x = 15/2 − 5 = 2.5` → voxel (5, 2.5); center under spec semantics `(5·2+10, 2.5·2+5) = (20, 10)` µm → **10 µm y-shift, 5 µm x-shift** vs A. ✘ distinguished.
- **C (level-scale reuse error — the #9065 class: level-0 scale applied at level 1)**: `idx = (W − t)/s_0 = (20, 10)`; center `(20·2+10, 10·2+5) = (50, 25)` µm → **20 µm, 10 µm shift**; note (20,10) is still in-bounds (shape 32), so the failure is **silent**, exactly like the upstream shift. ✘ distinguished.

Discriminating content fixture: set level-0 voxels `[20:22, 10:12]` to constant 8, block `[10:12, 4:6]` to 3, block `[40:42, 20:22]` to 5; define level-1 as the 2×2 block mean. Proposed assertions: `value(L1[10,5]) == 8` (A), B's rounded voxel `L1[5,2]` sits in the 3-block, C's voxel `L1[20,10]` in the 5-block → three distinct probe outcomes discriminate the three interpretations. W also encodes the overlay rule of B3: a label aligned by A stays registered under level switching; B or C visibly slide it.

### §9.3 Execution status (binding)
No admitted tool in this stage executes arithmetic or tests, so **nothing above has been executed here**. Per METHOD.md, W and all tests below are a reasoned **UNEXECUTED** validation proposal; the implementation stage must run them under a deterministic receipt before any pass may be claimed.

---

## 9. B5 — revised implementation steps, discriminating validation, visible limits

**Revised steps** (replacing thin-plan steps 1–4):
1. Pin substrate: napari **v0.9.2**; implement `Ngff04LocalReader` (Zarr v2 directory scan → contract checks of §5; refusal codes `E-*`).
2. Calibration layer: per-level `(s_i, t_i)` extraction; cursor readout widget on `viewer.cursor.position` (S3) with unit fallbacks of §6; scale bar.
3. Level switcher (2 entries) that recomputes readout/probe/overlay per selected level (§7; lesson of §4).
4. Overlay module: association gate → conformance gate (`§3.7` MUST) → covership check → nearest-neighbor categorical overlay with `association by convention` badge where applicable; refusal codes `R-*`.
5. Fixture set + validation harness (below); read-only enforcement (§5).

**Discriminating validation cases** — all `[UNEXECUTED]`, proposed:
- **T1 contract**: minimal valid store opens; each of `E-LEVELS/E-AXES/E-TRANSFORM/E-ZARR/W-VERSION` triggered by a mutated fixture and produces the named visible state.
- **T2 cursor**: witness W assertions at both levels (A/B/C discrimination); unitless-axis fixture yields the `units not declared` readout.
- **T3 overlay**: (a) conformant 2-level label, different shapes, covering extent → overlay shown with correct registration at **both** levels; (b) 1-level label → `R-LABEL-CONFORMANCE`; (c) missing `source` at conventional path → badge shown; (d) non-covering label → `R-COVER`; (e) switch levels → overlay remains registered (W's consistency property).
- **T4 read-only**: hash all store files, run a full interactive session, re-hash → unchanged.
- **T5 regression port**: napari-#9065-style per-level offset check on our stack: rendered-level offset equals `(f_L−1)/2 · s_L` for each level.

**Visible limits** `[CHOICE]`/`[INF]`: no editing; no 3D/time/cloud; units displayed, never converted; voxel-center convention declared, not "correct" (upstream #6320 open); single multiscales entry auto-selected with notice; >2 levels refused by contract.

---

## 10. Unresolved consequential leads

See `UNRESOLVED_LEADS.md` (napari unit-formatting API at v0.9.2; itk-vtk-viewer calibration probe if the web-variant decision flips; upstream-open center-vs-corner convention; Zarr v2 compressor matrix pin). Each is consequential for implementation, none blocks the propositions above.
