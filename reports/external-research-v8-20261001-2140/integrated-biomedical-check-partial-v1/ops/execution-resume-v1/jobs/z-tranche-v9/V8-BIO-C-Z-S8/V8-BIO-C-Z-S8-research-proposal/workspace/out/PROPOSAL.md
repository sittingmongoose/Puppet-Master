# V8-BIO-C-Z-S8 — Research-backed proposal: local read-only 2D OME-NGFF 0.4 image/label viewer

Status: **proposal** (research → plan). Nothing in §9 has been executed; tests are planned, not passed.

## 0. Scope

One local OME-NGFF (OME-Zarr) dataset: a 2D multiscale image with **exactly two resolution levels** and at most **one optional categorical label image**. The prototype is a read-only desktop inspection window: calibrated cursor readout, level switching, optional label overlay, explicit visible states when calibration or alignment cannot be established. Out of scope (per brief): 3D, time series, cloud stores, authoring/writing, segmentation, registration estimation, format conversion.

[verbatim excerpt omitted; original artifact/source locator retained], [verbatim excerpt omitted; original artifact/source locator retained] and [verbatim excerpt omitted; original artifact/source locator retained] are **synthetic product conditions of this brief**, not properties the format guarantees. The format permits 2–5 dimensions and any number of levels ([SPEC §3.4]); our product refuses anything outside the declared contract (§5).

## 1. Evidence basis and claim labels

Primary normative source: **OME-NGFF 0.4 specification**, https://ngff.openmicroscopy.org/0.4/ ([verbatim excerpt omitted; original artifact/source locator retained]; page revision meta `a4c68004fdb8a8d822367205dc12f9574a32ddf8`; spec version history: 0.4.0, 2022-02-08, [verbatim excerpt omitted; original artifact/source locator retained]). Section numbers below refer to this document.

Claim labels used throughout:
- **[SPEC]** — normative requirement/permission from the 0.4 spec (RFC-2119 keywords per its §1.3).
- **[SPEC-EX]** — example, optional or [verbatim excerpt omitted; original artifact/source locator retained] behavior in the spec (e.g., `omero`, per §1.3/§3.5).
- **[OBS]** — observed upstream behavior, pinned to a version/commit/issue.
- **[INFER]** — engineering inference by this proposal (not stated by any source).
- **[CHOICE]** — product decision of this prototype.
- **[FIX]** — correction applied during the review/correction stage of this pipeline.

Component sources used for Q1/Q3 (exact locators in §11): napari (release v0.9.2, 2026-09-29), ome-zarr-py (releases v0.18.0 2026-06-17 and v0.19.2 2026-09-08; issue #403; PRs #590, #652), vizarr (PR #261 merged 2025-03-06; issue #297 + PR #298 merge commit `ec7d738`, 2025-09-03; PR #299; open issue #271; latest git tag v0.3.0), napari PR #6633 (milestone 0.4.19), napari issue #8814 (2026-03).

## 2. Q1 — Two existing component precedents and the minimal choice

### 2.1 Precedent A: napari + ome-zarr-py (Python desktop stack)

The 0.4 spec itself lists ome-zarr-py as [verbatim excerpt omitted; original artifact/source locator retained] ([SPEC §5, Implementations]). Version-specific observed behaviors:

- **[OBS]** ome-zarr-py **v0.18.0 (2026-06-17)** is the release that first wrote per-level `translation` transforms for downsampled pyramids; before that, generated 0.4 metadata was **scale-only** and [verbatim excerpt omitted; original artifact/source locator retained] (issue #403, 2024-11-06, fixed by PR #590 — full chain in §4.1).
- **[OBS]** ome-zarr-py **v0.19.2 (2026-09-08)** fixed resolution-level **path normalization** (PR #652): resolution levels may be named `0,1,2` rather than `s0,s1,s2`, and a normalization bug left `coordinateTransformations.input.path` out of sync. Lesson: the level name is arbitrary ([SPEC §2.1]: [verbatim excerpt omitted; original artifact/source locator retained]); only `datasets[].path` order is normative ([SPEC §3.4]).
- **[OBS]** napari **PR #6633** (merged 2024-02-01, milestone **0.4.19**) fixed child-layer translate computation when a multiscale layer has a `scale=` set (`napari/_vispy/layers/base.py`, `_on_matrix_change`): the previous code composed translate and scale incorrectly. The merged diff changed rendering logic only (no test file in the diff).
- **[OBS]** napari **issue #8814** (2026-03-26, closed 2026-03-27): reported [verbatim excerpt omitted; original artifact/source locator retained] against napari 0.7.1.dev5 + napari-ome-zarr 0.7.2; maintainers and the reporter reproduced with plain numpy multiscale and a second viewer (ImageJ BigDataViewer) and localized the fault to the **ome-zarr-py writer** (downsampled levels were cropped), not napari. No napari code change; closed as writer-side.
- **[OBS]** napari **v0.9.2** (2026-09-29) release notes include "Add multiscale level extraction as a `LayerList` action (#9495)" — i.e., pinning/extracting a single resolution level is a current, supported operation.

Strengths for this prototype: true desktop (Qt/VisPy) window; native `Image`/`Labels` layer types (labels render categorical values, nearest by default); mature multiscale machinery. Weaknesses: heavy dependency tree; the plugin/reader path has repeatedly been where calibration metadata silently degrades ([OBS] #403 history; [OBS] #8814 writer-side failure surfacing in the viewer).

### 2.2 Precedent B: vizarr + Viv/zarrita (TypeScript web stack)

The 0.4 spec lists vizarr as [verbatim excerpt omitted; original artifact/source locator retained] ([SPEC §5]). Version-specific observed behaviors:

- **[OBS]** vizarr **ignored `coordinateTransformations` entirely** until PR #261 [verbatim excerpt omitted; original artifact/source locator retained] (merged 2025-03-06); issue #271 (2025-04-03, still open at capture) states "Previously, the `coordinateTransformations` within that sample were ignored, but with #261 they are implemented[verbatim excerpt omitted; original artifact/source locator retained]causes images to disappear" — a regression open as of capture.
- **[OBS]** vizarr **issue #297** (2025-09-02): for images **without an `omero` block**, scale/translation (including a negative-scale flip) were silently ignored, because the `isOmeMultiscales()` gate required `omero` metadata; `omero` is optional in 0.4 ([SPEC-EX §3.5]). Fixed by PR #298 [verbatim excerpt omitted; original artifact/source locator retained] (merged 2025-09-03, merge commit `ec7d738`, 2 files, +9/−3, **no tests in the diff**). A follow-up regression (contrast limits computed from the *largest* resolution, slowing/clogging loads) was fixed by PR #299 (issue closed 2025-09-12).
- **[OBS]** issue #271 also records that vizarr's `coordinateTransformations` handling [verbatim excerpt omitted; original artifact/source locator retained] — i.e., in practice label-overlay alignment depends on applying each label's own transforms.
- **[OBS]** vizarr's most recent git **tag is v0.3.0** (old); distribution is via `main`/deployments, so reproducibility means pinning a commit (e.g., `ec7d738`).

Strengths: very light, easy to embed in a browser; explicit NGFF parsing code (`src/ome.ts`, `src/utils.ts`) that is readable as a precedent. Weaknesses for this brief: it is a web app, not a local desktop window; its 2025 history shows calibration metadata being gated on optional metadata and an open transform regression.

### 2.3 Comparison and recommendation

| Criterion | napari + ome-zarr-py | vizarr + Viv |
|---|---|---|
| Desktop local window | Yes (Qt) [OBS] | No (browser) [OBS] |
| Calibration/transforms history | Reader/writer metadata gaps, fixed v0.18.0 (#590) [OBS] | Ignored pre-#261; gated on `omero` until `ec7d738`; open 3D regression #271 [OBS] |
| Labels overlay | Native Labels layer, nearest rendering [OBS] | Supported, alignment via transforms noted in #271 [OBS] |
| Version pinning | Tagged releases (v0.9.2, v0.19.2) [OBS] | Commit-only (last tag v0.3.0) [OBS] |

**[CHOICE]** Recommended bounded approach: **napari (pin v0.9.2) as the desktop host, with our own small metadata interpreter as the single source of calibration truth**, feeding explicit `scale=`/`translate=` values to layers; zarr arrays are read directly from the local store read-only (zarr v2). ome-zarr-py is used, if at all, only as a convenience for chunk IO at a pinned version — never as the calibration authority.

**[CHOICE]** Tradeoff, stated concretely: we give up vizarr's small footprint and simple embed, and we accept napari's heavy Qt/VisPy dependency tree, in exchange for a real desktop read-only window, a native categorical Labels layer, and a version-pinnable stack. We further give up napari's automatic multiscale level-of-detail switching (see §7) to avoid repeating the class of translate/scale composition bugs documented in [OBS] napari #6633 and napari #8814 — with two levels this loss is negligible.

## 3. Q2 — What OME-NGFF 0.4 actually requires or permits for this input

### 3.1 Container, multiscales, axes

- **[SPEC]** Data MUST be a Zarr **v2** hierarchy; OME-NGFF metadata MUST be stored as Zarr group attributes (§2). Image group `.zattrs` holds `multiscales` (§3.4).
- **[SPEC]** `multiscales` is a list; if several entries, users choose by name, first entry as fallback (§3.4). **[CHOICE]** we take the first entry; a name selector is out of scope.
- **[SPEC]** Each entry MUST contain `axes` (length 2–5, equal to array dimensionality; 2–3 entries of type `space`; ordering MUST match array dimensions; time first, then channel/custom, then space) and `datasets` (each with `path` relative to the group; paths ordered largest→smallest resolution) (§3.4).
- **[SPEC]** `axes[].name` MUST be present and unique; `type` SHOULD be one of `space`/`time`/`channel` (custom allowed); `unit` SHOULD be present with UDUNITS-2 strings (e.g., `micrometer`) (§3.1). Units and axis types are therefore **SHOULD-level, not guaranteed**.
- **[SPEC-EX]** `version` on a multiscales entry SHOULD be `"0.4"` (§3.4); 0.4.0 is the revision that added axes types/units/`coordinateTransformations` (§7). 0.3-era files may legally lack per-dataset transforms.

### 3.2 Calibration: scale, translation, units (B2 basis)

- **[SPEC]** In 0.4, **each `datasets[]` entry MUST contain `coordinateTransformations`**; the list MUST contain only `translation` and `scale`; **exactly one `scale`** (pixel size in physical units; where scaling is unknown for an axis, the scale value MUST express the factor vs level 0, default 1.0); **at most one `translation`** ([verbatim excerpt omitted; original artifact/source locator retained]), which MUST be listed **after** scale; both vectors' lengths MUST equal `len(axes)` (§3.4). Transform entries are [verbatim excerpt omitted; original artifact/source locator retained], and `identity` is the default transform (§3.3). A group-level `coordinateTransformations` MAY apply to all levels, applied after the per-dataset ones (§3.4).
- **[INFER]** Physical cursor coordinates therefore compose, per axis *a*, for the selected level ℓ (with G = group-level transform or identity):
  `physical_a(voxel_a) = G_scale_a × (T_{ℓ,a} + S_{ℓ,a} × voxel_a)` — i.e., per-level scale, then per-level translation in physical units, then the group-level transform. The spec fixes the order and units but does not write this formula; it is our reading of §3.3/§3.4.
- **[SPEC]** Unequal axis scales and nonzero offsets are ordinary per-axis vectors — supported by the format; there is no squareness/isotropy assumption anywhere in §3.1–§3.4.
- **[CHOICE]** Fallbacks: `unit` absent → display voxel indices with an explicit [verbatim excerpt omitted; original artifact/source locator retained] state and **withhold the calibrated scale bar** (§6); `translation` absent → 0 (identity default, [SPEC §3.3]); a 0.4-claiming file whose dataset lacks `coordinateTransformations` → treated as a spec violation → visible [verbatim excerpt omitted; original artifact/source locator retained] state (§5), never silently defaulted to 1.0 (silently defaulting is exactly the failure class of [OBS] vizarr #297).

### 3.3 Physical cursor readout and calibrated display (B2)

**[CHOICE]** The status bar shows, for the selected level, `x = <p.x> <unit>, y = <p.y> <unit>` computed by the §3.2 formula, plus a level line: `Level 1/2 — 0.50 µm/px (x), 0.25 µm/px (y)`. A scale bar is drawn by us (not a library feature) as `k × scale` screen pixels with the stored unit string displayed verbatim; **[CHOICE]** no unit conversion/UDUNITS dependency; unknown unit ⇒ scale bar withheld with the reason shown. **[INFER]** cursor physical values must be recomputed from the **selected level's own transforms** on every level switch — levels are independent arrays with independent transforms ([SPEC §3.4]), and real pyramids can differ in physical extent after cropping ([OBS] napari #8814; [OBS] PR #590's half-voxel translations).

### 3.4 Resolution switching

- **[SPEC]** Levels are the `datasets` list in order, largest→smallest; each has its own `path` (name arbitrary) and transforms (§3.4). Switching = selecting a list index, never name-matching `s0/s1`.
- **[CHOICE]** With exactly two levels we implement switching as two separately transformed layers with visibility toggling, keeping the physical view center fixed ([INFER] center preservation uses the §3.2 formula). This sidesteps library level-selection heuristics ([OBS] napari #8814 assumptions about level geometry; [OBS] napari #6633 transform composition).
- **[SPEC-EX]** `omero` rendering metadata is **transitional and optional**; if present it MUST contain `channels` with `color` and `window` (§3.5). **[CHOICE]** we use it only to seed default contrast when present; its absence never gates calibration or overlay behavior (anti-lesson from [OBS] vizarr #297).

### 3.5 Image/label association — declaration is not an alignment guarantee

- **[SPEC]** Association is declared by a `labels` subgroup whose `.zattrs` contains `{"labels": [<paths>...]}`; [verbatim excerpt omitted; original artifact/source locator retained] (§3.6). Each label group is a full multiscale image that MUST contain `image-label` metadata and **MUST have the same number of `datasets` entries as the image** (§3.7). `image-label.source.image` MAY name the associated image (default `"../../"`) (§3.7). Label arrays hold integer label values (§2.1, §3.7).
- **[SPEC-EX]** The layout section says each label dimension [verbatim excerpt omitted; original artifact/source locator retained] (§2.1 discussion) — lowercase *should* in a layout description, not a MUST, and it says nothing about axes, units or transforms.
- **[CONCLUSION — the crux for B3]** The format guarantees *level-count parity* ([SPEC §3.7]) and *declaration* ([SPEC §3.6]) but **no normative guarantee** that a label's axes, units or per-level `coordinateTransformations` equal the image's. Alignment is therefore **not derivable from metadata presence**; it must be verified numerically. **[INFER]** Verification procedure (per level ℓ): (1) axis `name`+`type` sequences equal; (2) label dtype integer; (3) compute each side's physical extent `extent_a = S_{ℓ,a} × shape_a` anchored at `T_{ℓ,a}`; (4) overlay permitted only if per-axis anchored extents agree within **tolerance = 0.5 × the coarser level's scale** (covers odd-size downsampling shifts documented in [OBS] napari #8814 and the half-voxel centering formula of [OBS] PR #590); else the overlay is **withheld** with a banner naming the failed check and both computed extents (e.g., [verbatim excerpt omitted; original artifact/source locator retained]). The image remains fully viewable in the refusal state.
- **[SPEC-EX]** Label colors: `image-label.colors` SHOULD exist (`label-value` + optional `rgba`); clients that do not error on duplicates SHOULD keep only the last entry per value (§3.7). **[CHOICE]** we honor `colors` when present and valid, else draw a generated palette; label rendering is nearest-neighbor (categorical) — **[CHOICE]** sampling decision, consistent with [OBS] napari Labels behavior.

## 4. Q3 — A real issue → fix → test chain, and the lesson taken

### 4.1 Primary chain: ome-zarr-py #403 → PR #590 → tests → release v0.18.0

- **Issue** ([OBS]) ome-zarr-py **#403**, opened 2024-11-06: "`coordinateTransformations` generated for 0.4 are scale-only[verbatim excerpt omitted; original artifact/source locator retained]The most common methods of image downsampling result in a translation of the downsampled image, but this code … only returns scale transformations, which will be incorrect for almost all multiscale pyramids" (pointing at `ome_zarr/format.py` `generate_coordinate_transformations`, then lines 260–271 at commit `56f72b0`).
- **Fix** ([OBS]) **PR #590** [verbatim excerpt omitted; original artifact/source locator retained] (merged 2026-06-17): `ome_zarr/format.py` now appends `{"type": "translation", "translation": [s/2 − s0/2 …]}` after each per-level scale; `ome_zarr/classes/image.py` adds a `Translation` per pyramid level with the same center-anchored formula.
- **Tests** ([OBS]) the same PR updates **eight** existing tests in `tests/test_writer.py` (`test_image_class_writer`, `test_writer`, `test_write_image_current`, `test_write_image_dask`, `verify_label_data`, `test_write_multiscale_labels`, `test_write_multiscale_labels_storage_options`, `test_two_label_images`) from asserting one transform per level to asserting a scale+translation pair with the computed translation values.
- **Release** ([OBS]) shipped in **v0.18.0** (2026-06-17, [verbatim excerpt omitted; original artifact/source locator retained]). The issue was open ~20 months before the fix — the scale-only behavior was in released writers the whole time.

**Scoped lesson for this prototype ([INFER]):**
1. Treat per-level `translation` as a first-class input: our fixtures must include nonzero translations, and the cursor/scale-bar math must apply them (fixtures F1, F9 in §9).
2. The pre-#590 test suite *encoded the bug* (asserting `len(cts) == 1`): tests that only check [verbatim excerpt omitted; original artifact/source locator retained] would not have caught it. Our discriminating tests assert computed physical values (§9), not just absence of errors.
3. Writer-side geometry mistakes surface as [verbatim excerpt omitted; original artifact/source locator retained] (napari #8814): when our validation fails, triangulate with a pure-numpy fixture and a second viewer before blaming our interpreter (test F10).

### 4.2 Secondary chain: vizarr #297 → PR #298 → PR #299 (fix without tests)

**[OBS]** `omero`-gated transform handling (2025-09-02) fixed at `ec7d738` with no tests in the diff; the follow-up contrast-limit regression needed a second PR (#299). **[INFER]** Lesson: gating required interpretation (calibration) on optional metadata (`omero`, [SPEC-EX §3.5]) silently disables it for conforming files; untested fixes regress. Our equivalents: F2 (units absent), F6 (transforms absent), F4/F5 (label mismatches) each exercise one optional-metadata branch.

### 4.3 Diagnostic precedent: napari #8814 (2026-03)

**[OBS]** A viewer-filed misalignment bug resolved, by plain-numpy reproduction plus a second viewer, as writer-side downsampling error. **[INFER]** Adopted as validation practice F10 (differential cross-check of our most calibrated fixture in a pinned second viewer), and as a triage rule: localize reader / metadata interpreter / renderer before changing code.

## 5. B1 — Local input contract, support checks, read-only boundary

**[CHOICE]** Input contract (all checks produce a visible, specific state; never a silent fallback):

1. Input is a single local **directory** containing Zarr v2 markers `.zgroup` and `.zattrs` ([SPEC §2]). Zarr v3 stores (`zarr.json`) → unsupported: [verbatim excerpt omitted; original artifact/source locator retained].
2. `.zattrs` must parse as JSON and contain a non-empty `multiscales` list; we use entry 0 ([SPEC §3.4] fallback rule + [CHOICE]).
3. `multiscales[0].version`, if present, MUST equal `"0.4"`; absent version → proceed but show [verbatim excerpt omitted; original artifact/source locator retained] ([SPEC-EX §3.4]; [CHOICE]). 0.3-style metadata (e.g., string `axes`) → unsupported state with the violation named.
4. `axes` must be exactly two `{name, type: "space"}` entries (channel/time axes out of scope) ([SPEC §3.4] permits more; [CHOICE] product restriction). Names unique ([SPEC §3.1]).
5. `datasets` must have **exactly two** entries ([CHOICE] per brief; [SPEC §3.4] permits any count — outside → unsupported state). Each entry: resolvable `path`; `coordinateTransformations` with exactly one `scale` (length 2, numeric) and at most one `translation` (length 2, listed after scale) ([SPEC §3.4]); violations → unsupported state.
6. **Labels optional**: no `labels` subgroup or empty list (§3.6) → overlay control disabled with tooltip [verbatim excerpt omitted; original artifact/source locator retained] — normal state, not an error ([CHOICE]). Multiple listed labels → selector, first selected ([CHOICE]).
7. Label contract: integer dtype; level count MUST equal image level count ([SPEC §3.7]); if the *file* violates that MUST (the brief explicitly allows such inputs), the label is treated as unverifiable → overlay refusal state per §3.5, image still viewable ([CHOICE]).
8. **Read-only boundary**: the store is opened read-only (`mode='r'`); the prototype writes nothing — no `.zmetadata`, no caches, no attribute updates. Validated by fixture F8 (byte-level tree check before/after a session). [CHOICE]

## 6. B2 — Physical cursor coordinates and calibrated display

Defined in §3.2/§3.3. Summary of the dependency chain: version/conditions = 0.4 per-dataset transforms ([SPEC §3.4]); metadata scope = per-level `scale`+`translation`, optional group-level transforms, `axes[].unit` ([SPEC §3.1/§3.4]); units = stored UDUNITS-2 string shown verbatim ([SPEC §3.1]; no conversion [CHOICE]); fallbacks = identity translation ([SPEC §3.3]), px-mode with withheld scale bar when unit is absent, spec-violation states otherwise ([CHOICE]).

## 7. B3 — Resolution switching and optional categorical label overlay

- Switching: exactly two levels exposed as [verbatim excerpt omitted; original artifact/source locator retained] / [verbatim excerpt omitted; original artifact/source locator retained]; implemented as two layers with per-layer `scale=`/`translate=` from that level's own transforms; visibility toggle keeps the physical center fixed ([CHOICE]; rationale in §3.4). Cursor readout and scale bar recompute on switch ([INFER], §3.3).
- Overlay: association via `labels/.zattrs` ([SPEC §3.6]); alignment verified numerically per §3.5 before display; nearest-neighbor sampling; colors per §3.7 with ignore-but-last rule; opacity fixed default 0.5 ([CHOICE]).
- Refusal state: banner lists the failed check with concrete numbers (axis mismatch / level-count violation of [SPEC §3.7] / extent mismatch beyond tolerance / non-integer dtype); overlay hidden; image remains usable ([CHOICE]; satisfies the brief's [verbatim excerpt omitted; original artifact/source locator retained]).

## 8. Revised implementation steps (replaces the thin plan's steps 1–4)

1. **Pin the stack**: Python 3.11; napari 0.9.2; zarr-python (v2-store reader) pinned; no other format libraries ([CHOICE]). Verify zarr v2 read support of the pinned zarr-python before building (lead L1).
2. **Metadata interpreter module** (pure, headless): `.zattrs` → validated model `{axes, units, per-level {scale, translation}, violations[]}` implementing §5 checks and the §3.2 composition. Unit tests over malformed inputs. This module is the calibration authority ([CHOICE], §2.3).
3. **Read-only reader**: open store `mode='r'`; expose both level arrays lazily. No writes of any kind (F8).
4. **Viewer window**: napari host; image levels added as two explicitly transformed layers; level toggle with fixed physical center (§7).
5. **Cursor + scale bar**: status readout per §3.3; self-drawn scale bar from selected level's scale+unit; withheld states per §5/§6.
6. **Labels path**: load label per §3.5; verification; napari Labels layer (nearest) with per-level transforms; refusal banner.
7. **Fixture generator**: small script writing Zarr v2 stores by hand (not via ome-zarr-py defaults) so F1–F7 control transforms exactly ([CHOICE]; avoids re-encoding [OBS] #403-style defaults).
8. **Validation run**: execute §9; record results separately. **No pass is claimed in this document** (B5).

## 9. Discriminating validation cases (planned — not executed)

| # | Fixture / action | Discriminates | Expected observable result |
|---|---|---|---|
| F1 | 2-level `yx`, `micrometer`, unequal axes scales, **nonzero translation on level 1** | translation handling ([OBS] #403 class) | cursor at voxel (0,0) level 1 shows `T1`; scale bar lengths differ per axis |
| F2 | units absent | SHOULD-level unit fallback | px readout, [verbatim excerpt omitted; original artifact/source locator retained], scale bar withheld, no crash ([OBS] vizarr #297 analog) |
| F3 | label with 2 levels, matching extents | happy-path overlay | overlay aligned at both levels; colors from `image-label.colors` |
| F4 | label with 1 level (violates [SPEC §3.7] MUST) | MUST-violation tolerance | refusal banner names §3.7 violation; image viewable |
| F5 | label extents off by > tolerance at level 1 | numeric verification vs declaration | refusal banner shows both computed extents |
| F6 | dataset missing `coordinateTransformations` | no silent defaulting | unsupported state naming the violation ([CHOICE] §5.5) |
| F7 | 1 or 3 levels | product contract | unsupported state ([verbatim excerpt omitted; original artifact/source locator retained]) |
| F8 | session over any fixture | read-only boundary | directory tree bytes identical before/after |
| F9 | same physical point queried at both levels (F1) | level-switch math | identical physical coordinates from both levels (±1e-6) |
| F10 | F1 opened in a second pinned viewer | differential triangulation ([OBS] #8814 method) | independent confirmation of calibration values; disagreements investigated before shipping |

## 10. Visible limits (stated in the product)

2D single-dataset only; no 3D/time/channel axes; exactly two levels; no unit conversion; no writing/authoring; label overlay withheld (with reason) whenever alignment cannot be established numerically; version other than 0.4 unsupported; Zarr v2 only.

## 11. Sources (exact locators)

1. OME-NGFF 0.4 spec — https://ngff.openmicroscopy.org/0.4/ (edition [verbatim excerpt omitted; original artifact/source locator retained]; §2, §3.1–§3.7, §5, §7 as cited).
2. ome-zarr-py — issue #403 (2024-11-06, closed 2026-06-17); PR #590 (merged 2026-06-17; diffs to `ome_zarr/format.py`, `ome_zarr/classes/image.py`, `tests/test_writer.py`); release v0.18.0 (2026-06-17); PR #652 + release v0.19.2 (2026-09-08) — https://github.com/ome/ome-zarr-py.
3. napari — release v0.9.2 (2026-09-29, incl. #9495); PR #6633 (merged 2024-02-01, milestone 0.4.19, `napari/_vispy/layers/base.py`); issue #8814 (2026-03-26/27) — https://github.com/napari/napari.
4. vizarr — PR #261 (merged 2025-03-06); issue #271 (open, 2025-04-03); issue #297 (2025-09-02); PR #298 (merged 2025-09-03, merge commit `ec7d738`); PR #299 (merged; issue closed 2025-09-12); tags (latest v0.3.0) — https://github.com/hms-dbmi/vizarr.
