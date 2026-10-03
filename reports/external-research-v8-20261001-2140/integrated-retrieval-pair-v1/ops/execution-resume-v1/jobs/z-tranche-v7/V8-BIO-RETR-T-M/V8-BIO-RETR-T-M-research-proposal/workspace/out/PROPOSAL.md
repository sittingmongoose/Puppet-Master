# V8-BIO-RETR-T-M — Research proposal: local calibrated 2D OME-NGFF 0.4 image/label viewer (read-only prototype)

Case stage: research-proposal. Date: 2026-10-03. Method: `ordinary-complete-plus-coherent-batching-progressive-retrieval` (METHOD.md).
This document is a research-backed revision of `inputs/THIN_PLAN.md`. **It is a plan only: nothing here has been implemented, and no test, check, or arithmetic described below has been executed. No execution receipt exists for any proposed validation.**

Claim labels:

- **[S]** — source fact: normative requirement or observed upstream behavior, cited to an exact locator; normative force (MUST / SHOULD / MAY / non-normative) is preserved verbatim where consequential.
- **[E]** — example or explicitly optional behavior from the sources (not a requirement).
- **[I]** — engineering inference drawn by this proposal from source facts.
- **[P]** — product choice made for this prototype (not dictated by any source).
- **[C]** — supported correction (between spec patch versions, of upstream behavior, or of a thin-plan assumption), justified by captured evidence.

## 0. Research-order note

Three coherent batches: (1) format identity/version — NGFF site → `ome/ngff` tags → full text of 0.4.0 and 0.4.1 spec sources; (2) component identity/version — napari release stream, vizarr tags/package manifest, ome-zarr-py release + reader internals; (3) issue → fix → test retrieval — repo issue searches, PR diffs, in-repo test files, expanding surrounding context for each consequential claim, exception, and regression. Spec captures were reused across Q2/B1–B3; the vizarr chain was reused across Q1/Q3/B4. No cross-case cache or discoveries.

## 1. Captured primary sources (exact locators)

| ID | Locator (version pinned) | sha256 (body) |
|----|--------------------------|---------------|
| S1 | OME-NGFF 0.4.0 spec source: `https://raw.githubusercontent.com/ome/ngff/0.4.0/latest/index.bs` (tag `0.4.0`, commit `0f03373`), sections `#axes-md`, `#trafo-md`, `#multiscale-md`, `#omero-md`, `#labels-md`, `#label-md`, `#image-layout`, `#history` | `55976a60452f42b5194d21502443ffb3a334aec5764f8385fcb937db0aea5bf6` |
| S2 | OME-NGFF 0.4.1 spec source: `https://raw.githubusercontent.com/ome/ngff/0.4.1/latest/index.bs` (tag `0.4.1`, commit `106c301`), same sections + "Document conventions" + `#bf2raw` | `c01aeed8b58b3bac7b63cee6950b65b352a155748970382e1d6f167624eee75c` |
| S3 | napari latest release metadata: `https://api.github.com/repos/napari/napari/releases/latest` → `v0.9.2` (published 2026-09-29) incl. release notes body | `f5bae88a5c65a0fe3987f1cf264025e0edbcda8d89cdfd0ceef342c367b4aeb2` |
| S4 | vizarr git tags: `https://api.github.com/repos/hms-dbmi/vizarr/tags` → newest tag `v0.3.0` (commit `749f7bd`) | `51edcab9c1b8f2dd16fed9dfdce1ddbe538bfec5680b493a352f379156d0f9b7` |
| S5 | vizarr `package.json` @ `main`: name `@hms-dbmi/vizarr`, version `0.3.0`; deps `@hms-dbmi/viv ~0.19.0`, `deck.gl ~9.1.0`, `zarrita ~0.6.0`, `math.gl ^4.1.0`; `"test": "vitest run"` | `bddde203696567259721c7f04f6ca8ff0bed44d30203106346efc42fdd7d2cb5` |
| S6 | vizarr PR #261 diff ("Apply OME coordinate transformations", merged 2025-03-06): `https://github.com/hms-dbmi/vizarr/pull/261.diff` | `22066be87be786e81fdde59143924d71c5eda932cbd57c3887b2949efc9ab9ee` |
| S7 | vizarr PR #298 diff ("Use defaultMeta in loadOmeMultiscales if no omero", fixes #297, merged 2025-09-03): `https://github.com/hms-dbmi/vizarr/pull/298.diff` | `f7a8b4620ef658d657af86c398040800660965b98516f5ce3c978182c7090752` |
| S8 | vizarr `__tests__/fixtures.test.ts` @ `main`: `https://raw.githubusercontent.com/hms-dbmi/vizarr/main/__tests__/fixtures.test.ts` | `d92a0db293cec4ec0bdc4d4f722dc2fc42518dcc225208142686818d8be9f7d3` |
| S9 | vizarr `src/utils.ts` @ `main`: `https://raw.githubusercontent.com/hms-dbmi/vizarr/main/src/utils.ts` (contains `coordinateTransformationsToMatrix`, `fitImageToViewport`, in-file vitest suites) | `8bc32cfe032fa3b0a334992284496dd49b0cd7b30d892a315530f5d4a098bf70` |
| S10 | ome-zarr-py latest release metadata: `https://api.github.com/repos/ome/ome-zarr-py/releases/latest` → `v0.19.2` (2026-09-08), sole change "bug: correctly normalize resolution level paths" (PR #652) | `1085265c47e71e3e0cb90cfda90877fbdfdf516774a7060eac5fbee2efe6549e` |
| S11 | ome-zarr-py PR #652 diff: `https://github.com/ome/ome-zarr-py/pull/652.diff` (fix in `ome_zarr/classes/image.py`; test in `tests/test_writer.py`) | `50b0c9834aa58e06195d4e10f236e71adeac89e87aee2f4a38cf83b14ae9cc4f` |
| S12 | ome-zarr-py `ome_zarr/reader.py` @ tag `v0.19.2`: `https://raw.githubusercontent.com/ome/ome-zarr-py/v0.19.2/ome_zarr/reader.py` | `c46ba936598885a0119bb23452d9ed74f87258a5169daee615d028373c6a88f4` |
| S13 | vizarr issue-search capture (`repo:hms-dbmi/vizarr coordinateTransformations`): issues #271, #297, #288; PRs #242, #259, #261, #298 | `aea44bf1e3195e14c449fc62ad232899caf9e096ad7fc77ebc40a24571822caf` |
| S14 | napari issue-search capture (`repo:napari/napari labels scale in:title`): issues #1419, #2368, #3389, #6981; PR #8098 | `570b0e4681f2265a2c020cd4503927c7bf6c34a41c3bd851b91724a76a2df1f1` |

Both spec patch versions are normative for "0.4" inputs (0.4.1, dated 2022-09-26, is the current 0.4 release; S2 `#history`). Where they differ, both texts are quoted ([C] in §3.6).

## 2. Q1 — Two existing components providing useful precedents, and the minimal choice

### 2.1 Component A: napari v0.9.2 with the ome-zarr-py v0.19.2 reader [S]

- napari v0.9.2 (S3) is a desktop (Qt + vispy) "fast, interactive, multi-dimensional image viewer for Python", released 2026-09-29 under a monthly release policy (EffVer). Version-specific behaviors captured in the 0.9.2 notes: multiscale level extraction is now a `LayerList` action (PR #9495), and layer-extent aggregation avoids "redundant unit conversion" (PR #9411) — i.e., extents/units are part of the 0.9.x layer model.
- ome-zarr-py v0.19.2 (S10) is listed by the 0.4 spec itself as "A napari plugin for reading ome-zarr files" (S1/S2 `#implementations`). Its reader (S12) keys a multiscales node on `zgroup` + `"multiscales" in root_attrs`, reads `multiscales[0]` only, defaults a missing `version` to `"0.1"` (with an in-code TODO questioning that), and surfaces per-dataset `coordinateTransformations` in `node.metadata` only "if any" dataset has them [S, observed behavior]. Its `Labels` spec matches `"labels" in root_attrs` and expands the listed children; its `Label` spec matches `"image-label"`, resolves the parent image via `image-label.source.image`, and logs `"no parent found"` when resolution fails [S12].
- Constraint [S]: napari is a general viewer, not read-only by construction; the read-only boundary must be enforced by this prototype's shell (§5 B1) [P].

### 2.2 Component B: vizarr (@hms-dbmi/vizarr)

- The 0.4 spec lists vizarr as "A minimal, purely client-side program for viewing Zarr-based images with Viv & ImJoy" (S1 `#implementations`) [S].
- Version constraint [S]: the newest git tag is `v0.3.0` (S4); `package.json` on `main` is still version `0.3.0` (S5). All calibration-relevant behavior analyzed in §4 (coordinateTransformations application, PR #261, 2025-03-06; no-`omero` path, PR #298, 2025-09-03; label display, PR #242, merged 2025-03-08; `LabelLayer` imported in `src/utils.ts` @ `main`) exists only on untagged `main` commits [S4–S9, S13].
- Behavior constraints observed upstream [S13]: a `coordinateTransformations`-in-3D regression is open (issue #271); `MAX_CHANNELS = 6` caps displayed channels (`src/utils.ts`, S9); rendering settings depend on `omero` unless the post-#298 fallback applies (§4).

### 2.3 Recommendation and concrete tradeoff [P]

Recommendation: build the prototype as a small Python desktop shell around **napari v0.9.2 + ome-zarr-py v0.19.2**, exposing only read-only interactions (open one local dataset, switch the two resolution levels, move the cursor, toggle the optional label overlay), with a thin controller that owns calibration interpretation and overlay justification (§3, §5).

Concrete tradeoff accepted: napari's dependency footprint (Qt, vispy) and its editing surface are heavier than vizarr's "minimal, purely client-side" design; that weight is accepted because (i) napari/ome-zarr-py are released, version-pinned artifacts (S3, S10), while every vizarr calibration fix is only on untagged master (S4); (ii) vizarr's own history shows exactly the failure class this prototype must not repeat — calibration silently ignored until 2025, an open 3D-translation regression, and a gating bug where a missing optional `omero` block silently disabled calibration and labels (§4). Fallback if a webview-based minimal viewer is later required: embed vizarr at a pinned `main` commit ≥ PR #298, vendored; not chosen for this case because refusal states and calibrated readouts must be testable headlessly and independent of browser tooling [P].

Precedent value of each component (Q1 answer): napari demonstrates the desktop multiscale + per-layer scale/translate + labels layering model; vizarr demonstrates the minimal read-only interpretation pipeline (fixture-snapshot-tested) and provides the tested transform algebra this proposal reuses as a specification of behavior, not as a dependency.

## 3. Q2 — What OME-NGFF 0.4 requires/permits for this input

### 3.1 Axes and units [S]

- Each axes entry MUST contain `"name"` (unique across entries); SHOULD contain `"type"` (SHOULD be `space`/`time`/`channel`, MAY be other custom values); SHOULD contain `"unit"`, whose value SHOULD be one of the listed UDUNITS-2-valid strings (space list includes `micrometer`, `nanometer`, `millimeter`, `meter`, …) (S1 `#axes-md`). Axes length MUST equal the arrays' dimensionality (S1 `#axes-md`).
- For this prototype's 2D input: `axes` MUST contain 2–3 `space` entries for the general spec, but our contract (B1) restricts to exactly the two planar space axes plus at most one `channel` axis [P]; axis order MUST match array dimension order, time first then channel/custom then space, and `zyx` ordering is only a SHOULD for 3D (S1 `#multiscale-md`) — for yx/cyx inputs the space axes are the trailing two [I].
- Conditions/exceptions preserved: units are only SHOULD-level. A conformant 0.4 file may carry no units at all, or custom axis types; unit presence, absence, or a value outside the UDUNITS-2 list must all be handled visibly (§5 B2) [I].

### 3.2 coordinateTransformations [S]

- Transform lists map "between two coordinate spaces"; each entry MUST have `"type"` ∈ {`identity`, `translation`, `scale`} (per the type table); "The transformations in the list are applied sequentially and in order." (S1 `#trafo-md`).
- Dataset-level (per resolution level): MUST be present; "The transformation MUST only be of type `translation` or `scale`."; "They MUST contain exactly one `scale` transformation that specifies the pixel size in physical units or time duration."; "It MAY contain exactly one `translation` … If `translation` is given it MUST be listed after `scale` to ensure that it is given in physical coordinates."; "The length of the `scale` and `translation` array MUST be the same as the length of \"axes\"." (S1 `#multiscale-md`).
- Multiscale-level `coordinateTransformations` MAY exist, follow the same type/order rules, and "are applied after them" (after the dataset-level transforms) — e.g., to carry a scale common to all levels (S1 `#multiscale-md`).

### 3.3 Physical cursor coordinates (interpretation this prototype will implement) [I]

For level `L` with dataset transforms `[scale s, translation t]` (required order) and optional multiscale-level transforms `T_M` applied after:

- `p_axis = s_axis · index_axis + t_axis` per axis, then `T_M` composed afterward; per 0.4.1 wording, per-level `scale` values along downsampled axes are "the scaling factor between the current resolution and the first resolution" (S2 `#multiscale-md`) — so level-`L` pixel size in physical units is `s_axis(L) · s_axis(0)` semantics only if level 0's scale is the absolute pixel size; the two patch texts differ here and §3.6 records both [C]. The prototype therefore computes readouts from the composed transform of the *displayed* level and never assumes level scales are absolute [I].
- Cursor readout displays `p_y, p_x` with each axis's `unit` string verbatim (no unit conversion in scope, §5 B2). Unequal axis scales and nonzero translations are ordinary per-axis values, fully supported by the MUST-level transform rules above (this is declaration, not a guarantee about data content: §3.5) [I].

### 3.4 Resolution switching [S/I]

- `"datasets"` paths MUST be "ordered from largest (i.e. highest resolution) to smallest" (S1 `#multiscale-md`) — the two-entry list is the switching order; the level list is what ome-zarr-py exposes as the pyramid (S12) and what vizarr opens level-by-level via `loadMultiscales` (S9) [S].
- If multiple `multiscales` entries exist: "use it" when single, else "the user can choose by name, using the first multiscale as a fallback" — this guidance is attached to an informative Python snippet [E], and ome-zarr-py implements the first-entry behavior (S12) [S]. Product choice: read `multiscales[0]`, matching the reference reader [P].
- Exceptions preserved: a dataset scale value "1" is the required stand-in when "scaling information is not available or applicable for one of the axes" (S1; S2 tightens this, §3.6). A level whose transform is missing entirely violates the MUST — unsupported input (B1 refusal), not a silent fallback [I].

### 3.5 Image/label association — declarations vs alignment guarantee [S/C]

- Association is structural: the special `labels` group under the image group holds key `labels` listing paths to label objects; "Unlisted groups MAY be labels." (S1 `#labels-md`). Each label group carries `image-label` metadata and MUST also contain `multiscales`; "the two `datasets` series MUST have the same number of entries" (S1 `#label-md`). `image-label.source.image` MAY name the associated image; "The default value is `\"../../\"` since most labels are stored under a subgroup named `labels/`" (S1 `#label-md`). ome-zarr-py additionally resolves the parent through `source.image` and warns when it cannot (S12) [S].
- Non-normative shape guidance exists only as a comment in the layout diagram: label dimensions "should be either the same as the corresponding dimension of the image, or `1`" (S1 `#image-layout`, lowercase, inside an ASCII figure — no RFC-2119 force) [E].
- **There is no normative alignment guarantee between image and label**: 0.4 declares each series' transforms independently and constrains association structurally; nothing states that label and image spatial transforms are equal, or that pixel `(i, j)` of a label level lands on pixel `(i, j)` of the matching image level, beyond the shared-axes convention above [C]. Overlay alignment must therefore be *justified per file* by the prototype (compare axis names/types and composed per-level transforms), and withheld with a visible reason otherwise (§5 B3) — exactly the brief's "metadata declarations vs alignment guarantee" distinction.
- Label rendering details are optional/implementation-defined: `colors[].rgba` MAY be present; for duplicated `label-value`s "Clients who choose to not throw an error should ignore all except the *last* entry" (S1 `#label-md`) [E]; integer-only label values ("only integer values are supported", S1 `#image-layout` comment) [E]; sampling/interpolation for label display is unspecified in 0.4 — nearest-neighbor is this prototype's choice (B3) [P].

### 3.6 Differences between 0.4.0 and 0.4.1 that matter here [C]

1. Scale-value semantics: 0.4.0 says "If scaling information is not available or applicable for one of the axes set it to 1." (S1 `#multiscale-md`); 0.4.1 replaces this with "the value MUST express the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0 if there is no downsampling along the axis." (S2). Correction applied: the prototype treats per-level scales as relative-to-first-resolution factors along downsampled axes (0.4.1), while still accepting files that only satisfy the older wording when the values coincide (the usual case) [C].
2. 0.4.1 adds the "Document conventions" section: MUST/SHOULD/… are RFC 2119 keywords (S2). 0.4.0 used the same words without that section; normative reading for 0.4.0 files follows the 0.4.0 text itself [C].
3. 0.4.1 marks `omero` "(transitional)" and adds the `bioformats2raw.layout` transitional collection key (S2 `#omero-md`, `#bf2raw`; history row "0.4.1 | 2022-09-26"). Consequence adopted: **calibration and label handling must not depend on the presence of `omero`** [C] — upstream vizarr violated exactly this until PR #298 (§4), and the brief's "units or applicable calibration can be absent" condition makes `omero`-independence mandatory for B1/B2 [I].
4. Version-history entries: 0.4.0 (2022-02-08) "multiscales: add axes type, units and coordinateTransformations" (S1 `#history`); 0.4.1 as above (S2 `#history`). These justify treating per-level transforms as the 0.4 novelty to validate hardest [I].

## 4. Q3 — Real issue → fix → test chains, scoped lessons, and validation

### 4.1 Primary chain (vizarr): NGFF 0.4 coordinateTransformations ignored → applied (#261) → snapshot-tested; regression #271; omero-gating #297 → #298

- **Failure (observed upstream)** [S13]: vizarr did not apply `coordinateTransformations`; issue #271 (2025-04-03, still open) states: "Previously, the `coordinateTransformations` within that sample were ignored, but with https://github.com/hms-dbmi/vizarr/pull/261 they are implemented in 3D", and notes the handling "was needed for scaling Labels to match parent Images". Effect class: files with calibration rendered at unit scale; label overlays could not be scaled to match the parent image — precisely this case's B2/B3 subject matter.
- **Fix (observed upstream)** [S6]: PR #261 (merged 2025-03-06) adds `coordinateTransformationsToMatrix(multiscales)` in `src/utils.ts`, whose comment requires applying each transform "sequentially and in order according to the OME-NGFF v0.4 spec" (citing `https://ngff.openmicroscopy.org/0.4/#trafo-md`), maps axes to x/y/z with scale-default 1 and translation-default 0, throws on length mismatch with `"Length of scale array was expected to match length of axes."`, and wires the result into `loadOmeMultiscales` as the layer `model_matrix` when no URL matrix is given (S6 `src/ome.ts` hunk). Scope limits preserved: it reads only `multiscales[0].datasets[0]?.coordinateTransformations` (first multiscale, first dataset) and only x/y/z space axes — non-space axes get identity [S6, S9].
- **Test (observed upstream)** [S8]: `__tests__/fixtures.test.ts` (vitest, run via `"test": "vitest run"` S5) asserts the derived matrix in snapshots: "v0.4 idr0050 with physical scale transforms" expects `matrix: scale=[0.1020,0.1020,0.5920]`; "v0.4 idr0062 single-resolution with labels" expects `matrix: scale=[0.3604,0.3604,0.5002]` and constructs the label layer with `modelMatrix: source.model_matrix` (label inherits the image transform; that test cites PR #273 for the single-resolution-labels case). Additional in-file vitest suites in `src/utils.ts` cover `getNgffAxes` for v0.1 defaults and v0.3/v0.4 axes forms (S9).
- **Regression after the fix (observed upstream)** [S13]: issue #271 — the fix applied 3D translations and "causes images to disappear" for a 3D sample. Lesson: the fix over-scoped to 3D; a 2D-only prototype must apply transforms on the two displayed space axes only and test the 3D file as an explicit refusal/limit case, not as a crash [I].
- **Second fix in the same subsystem** [S7, S13]: issue #297 (2025-09-02) — a user's flipped dataset (negative y scale in `coordinateTransformations`) rendered unflipped; root cause identified in PR #298: `loadOmeMultiscales()` — which "handl[es] labels and coordinateTransformations" — "is currently skipped if the `omero` block isn't found". PR #298 (merged 2025-09-03) changes the gate in `src/io.ts` from `isOmeMultiscales` (requires `omero`) to `isMultiscales`, with a `defaultMeta` fallback when `omero` is absent. This is a direct upstream confirmation of the §3.6(3) rule: optional render metadata must never gate calibration [C].
- **Latent defect in the fix itself, later repaired** [S6 → S9, C]: the PR #261 diff of `fitImageToViewport` computed the vertical fit as `availableHeight / (maxY - minX)` — `minX` where `minY` is required; `src/utils.ts` @ `main` now reads `availableHeight / (maxY - minY)` (S9). Observation: even a well-tested transform fix shipped with an anisotropic-fit typo; the specific repairing commit was not identified (lead L6). Prototype consequence: the view-fit math gets its own discriminating test with unequal axis scales (F2) rather than being trusted as scaffolding [I].

### 4.2 Secondary chain (ome-zarr-py): resolution-level path normalization

[S10, S11] Release v0.19.2 (2026-09-08) contains exactly one change, PR #652 "bug: correctly normalize resolution level paths": `to_ome_zarr` rewrote dataset `path`s to `s0…sn` but left the coordinateTransformations' `input.path` stale; the fix rewrites `input.path` together with the dataset path and raises `ValueError` if `input` is `None`. Test: `tests/test_writer.py::TestWriter::test_normalize_resolution_level_paths` builds a 3-level pyramid at paths `0,1,2` with per-level scales `[2**level, 2**level]`, writes 0.6-style metadata directly, reads back, rewrites, and asserts `s0/s1/s2` paths and matching transform `input.path`s. Scope caveat preserved: this test exercises the current class API with `"version": "0.6"` metadata (0.5/0.6-style transforms with `input`/`output`), not the 0.4 reader path; the *lesson* transfers to 0.4 (level identity and its transform must move together when levels are re-indexed), and it is used as a secondary chain only [C].

### 4.3 Scoped engineering lesson and validation that follow

Lesson [I]: in a calibrated viewer, the highest-risk code is the silent *absence* of interpretation (transforms ignored, optional metadata gating interpretation, per-level bookkeeping drifting) — and the fix history shows defects re-entering through scope creep (3D handling) and through fit/geometry helpers. Validation follows the upstream pattern but scoped to 2D: metadata-in → expected transform/matrix unit tests with fixture snapshots (like S8), plus refusal-state tests (F4/F5/F6 below), plus one anisotropic view-fit test (F2) guarding the `minX`/`minY` class of defect. All of it is proposed, not executed.

## 5. Obligations B1–B4 (B5 = §6)

### B1 — Local input contract, version/support checks, read-only boundary [P unless noted]

- Accepted input: one local directory tree that is a Zarr v2 group — "Arrays MUST be defined and stored … as defined by the version 2 of the Zarr specification" and "OME-NGFF metadata MUST be stored as attributes in the corresponding Zarr groups" (S1 `#on-disk`) [S]. Zarr v3 input → refusal `UNSUPPORTED_ZARR_VERSION` [P].
- `multiscales[0].version` SHOULD be "0.4" (S1/S2 `#multiscale-md`) [S]. Policy: `0.4` → accepted; absent → accepted with persistent banner "version metadata absent; interpreting as 0.4" (diverges deliberately from ome-zarr-py's observed default of `"0.1"`, S12; rationale: the brief's calibration behavior should not hinge on an optional field) [P]; `0.5`/`0.6`/other → refusal `OUT_OF_SCOPE_VERSION` [P].
- Shape contract: exactly two space axes (y, x) plus at most one channel axis; time/z/custom axes → refusal `OUT_OF_SCOPE_DIMENSIONS` with the axis list shown [P].
- Plate/well/HCS and `bioformats2raw.layout` collections → refusal `OUT_OF_SCOPE_LAYOUT` (they are separate 0.4/0.4.1 specifications, S1 `#plate-md`/`#well-md`, S2 `#bf2raw`) [P].
- Missing `.zattrs`/`multiscales` → refusal `NOT_MULTISCALES_IMAGE` [P]. Per-level `coordinateTransformations` missing → refusal `MISSING_DATASET_TRANSFORM` (0.4 MUST, §3.2) [I]. Units absent → *not* a refusal; unitless readout mode (B2) [P].
- Absent optional labels: the `labels` group is optional — the layout presents labels as optional ("optionally associated labels", S1 `#image-layout`) [S]; the overlay panel shows a stable "No labels in dataset" state, not an error [P].
- Read-only boundary: the store is opened read-only (ome-zarr-py `parse_url(..., mode="r")` semantics, S12 family), no writer imports, no editing tools registered; the napari window is driven only through viewer APIs that do not mutate layer data; label layers must be created non-editable (exact API to be confirmed at implementation time — lead L1) [P/I].

### B2 — Physical cursor coordinates and calibrated display/scale indication

- Interpretation: per §3.3 — `p = T_M ∘ (s·index + t)` on the displayed level's y/x axes, units taken verbatim from `axes[].unit` [I]. Dependencies stated per the brief: version (0.4 transform rules, §3.2/§3.6), conditions (exactly one scale per dataset; translation only after scale; lengths MUST equal axes length, §3.2), metadata scope (per-axis `unit` SHOULD-level; multiscale-level transforms MAY exist and compose after dataset-level ones), units (UDUNITS-2-valid strings, §3.1).
- Display: readout `y = <p_y> <unit_y>, x = <p_x> <unit_x>`; per-axis pixel-size indication for the displayed level (`s_axis · s_axis(0)` under the 0.4.1 reading, §3.6(1)); unequal axis scales shown as two per-axis values (no isotropic scale-bar assumption) [P].
- Fallback/withheld behavior: unit absent or unrecognized → readout switches to "index units (no calibration unit)" and the pixel-size indicator is shown dimensionless; a malformed transform (length mismatch, scale missing, translation before scale) → calibration mode withheld with reason `INVALID_TRANSFORM` and raw index readout only (the file still views) [P/I].

### B3 — Resolution switching and optional categorical label overlay

- Switching: the two `datasets` entries in spec order (largest → smallest, §3.4) become the level list; switching re-derives the cursor readout from the displayed level's composed transform and re-anchors the viewport through the transform pair so the same physical point stays under the cursor [I/P].
- Overlay association — shown only when ALL of (justify steps, evaluated per file): (1) the label is listed in the `labels` group (or, for unlisted groups, treated as a lead, never auto-shown — "Unlisted groups MAY be labels", §3.5); (2) `image-label.source.image`, if present, resolves to the displayed image group; absent → default `"../../"` assumed per §3.5 [S]; (3) label axes match the image's y/x axes by name and type, in order; (4) for the *pair of displayed levels*, composed label and image transforms map label pixels onto image pixels by an explicitly computed mapping (identity indices are *not* assumed); (5) level counts equal — a mismatch violates the 0.4 MUST that the two datasets series "MUST have the same number of entries" (§3.5), so it is a refusal `LABEL_LEVEL_COUNT_MISMATCH` naming both counts [I]. The brief's synthetic conditions (different shapes / level counts / metadata) are product conditions beyond the format's guarantees: unequal shapes at equal counts fall to step (4) — overlay proceeds only if the computed mapping is exact and unit-compatible; differing units on matched axes → withheld `LABEL_UNIT_MISMATCH` (no unit conversion in scope) [P].
- Sampling: nearest-neighbor for the label overlay (categorical integrity); image rendering bilinear; both are choices, 0.4 is silent on sampling [P].
- Refusal state (actionable): overlay panel shows reason code + which justify step failed + the observed vs expected values (e.g., "label has 1 level, image has 2 (NGFF 0.4 requires equal counts)"), while the image remains fully viewable [P].

### B4 — Comparison, recommendation, issue chain; separation of knowledge kinds

- Comparison and recommendation: §2 (napari v0.9.2 + ome-zarr-py v0.19.2 vs vizarr @main, with the release-discipline tradeoff). Observed upstream behavior: napari facts §2.1 [S3/S10/S12]; vizarr facts §2.2 and issue chain §4.1 [S4–S9/S13]. Inference: §3.3 interpretation, §4.3 lessons. Prototype choices: §2.3 recommendation, B1–B3 policies. Supported corrections: §3.6 (0.4.0→0.4.1), §4.1 (omero-gating correction adopted as a design rule; `fitImageToViewport` typo observed in #261 diff vs main). The thin plan's assumption that "metadata interpretation" is one step is corrected into the split of §3 (format rules) vs B1–B3 (policies) [C].

## 6. Revised implementation plan (B5) — concrete steps replacing the thin plan

1. **Contract gate** (B1): implement the accepted/refused input matrix of §5-B1 with reason codes; every refusal renders in the window with observed values. No display before the gate passes.
2. **Reader binding** (B1): load via ome-zarr-py v0.19.2 in read-only mode; assert the node exposes ≥2 pyramid levels and per-level `coordinateTransformations`; verify `multiscales[0]` selection matches §3.4.
3. **Calibration interpreter** (B2): pure function `interpret(level) → {scale_yx, translation_yx, units_yx, composed_with_T_M}` implementing §3.2/§3.3; unit tests over synthetic `.zattrs` fixtures asserting the composed values (fixture snapshots, pattern of S8).
4. **Cursor + scale indication** (B2): wire the interpreter to the live cursor and the level indicator; unitless mode and `INVALID_TRANSFORM` withholding per §5-B2.
5. **Level switcher** (B3): two-entry level list from `datasets` order; physical re-anchoring on switch; per-level pixel-size readout.
6. **Label overlay justify-then-show** (B3): implement the five §5-B3 steps; render only on pass; otherwise the refusal panel with the failing step's observed/expected values; nearest-neighbor sampling.
7. **Fixture battery** (all; proposed only — none executed): F1 minimal yx, two levels, scale-only → calibrated µm readout, overlay shown. F2 unequal axis scales + nonzero translations → per-axis readout correct; **view-fit stays inside the image bounds** (guards the S6→S9 defect class). F3 no units → unitless mode, no crash. F4 labels, equal counts, identical transforms → overlay aligned at both levels after switching. F5 label level-count 1 vs image 2 → `LABEL_LEVEL_COUNT_MISMATCH` panel, image viewable. F6 valid file without `omero` → calibration + labels still applied (guards the #297/#298 failure class; §3.6(3)). F7 version absent/"0.5" → banner vs `OUT_OF_SCOPE_VERSION`. F8 multiscale-level `coordinateTransformations` → composed after dataset-level per §3.2. F9 negative scale (flip) → treated as a declared transform; rendering correctness explicitly *not assumed* (lead L5).
8. **Visible limits** (shown in-app): single image per window; 2D (y/x, optional channel) only; no 3D/time/HCS/plate; no unit conversion or unit normalization; no editing/annotation; no segmentation metrics; no authoring/conversion; labels beyond listed paths not auto-discovered; sampling choices as in §5-B3.

Discriminating power: F1–F9 separate the failure classes the research exposed — absent interpretation (F6), transform algebra (F1/F2/F8), association bookkeeping (F4/F5), scope refusals (F7, B1 matrix), and format-permissiveness (F3, F9). Each fixture names the obligation it discriminates (B1/B2/B3) and the upstream incident it guards (§4).

## 7. Unresolved consequential leads

See `out/UNRESOLVED_LEADS.md` (L1–L7). None of them blocks the plan above; each is a dependency that must be closed with evidence before the corresponding claim is promoted from proposed to verified.
