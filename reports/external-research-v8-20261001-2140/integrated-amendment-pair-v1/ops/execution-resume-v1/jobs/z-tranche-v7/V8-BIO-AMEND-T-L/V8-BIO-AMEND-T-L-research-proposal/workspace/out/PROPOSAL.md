# PROPOSAL — V8-BIO-AMEND-T-L (research stage)

Revised, research-backed plan for a **read-only local desktop prototype** that inspects **one** local OME-NGFF **0.4** dataset: exactly two 2D resolution levels, plus at most one optional categorical label image. This document is a proposal. **No proposed test, fixture or arithmetic in §7 has been executed in this stage; there is no execution receipt.** Out-of-scope per brief: 3D, time series, cloud stores, authoring, segmentation, registration estimation, format conversion.

Labeling convention used throughout:
- **[SRC]** = fact quoted/captured from a public primary source (locator + capture SHA-256 given in §1).
- **[INFER]** = engineering inference by this proposal (my reasoning, not a source claim).
- **[CHOICE]** = synthetic product decision for this prototype.
- **[FIX]** = supported correction of the thin plan (replace thin-plan assumption with the cited evidence).

---

## 1. Source register (independently discovered; exact locators)

All captures are exact HTTP response bodies taken 2026-10-03 by this case's admitted public-capture tool; `sha256:` values are the capture source versions.

| ID | Source & version locator | Capture sha256 |
|----|--------------------------|----------------|
| S1 | OME-NGFF spec **0.4**, `https://ngff.openmicroscopy.org/0.4/` — single page incl. §2 `#on-disk`, §2.1 `#image-layout`, §3.1 `#axes-md`, §3.3 `#trafo-md`, §3.4 `#multiscale-md`, §3.5 `#omero-md`, §3.6 `#labels-md`, §3.7 `#label-md`, §5 implementations, §7 version history (0.4.0 2022-02-08 "multiscales: add axes type, units and coordinateTransformations"; 0.4.1 2022-09-26). Page dated "Final Community Group Report, 1 October 2026"; status: "This is the 0.4 release of this specification." | `ca4780a33f9561cfd2d983651fdcc745dce0d6089f5cf775744a54e8394a5269` |
| S2 | ome-zarr-py **issue #403** "`coordinateTransformations` generated for 0.4 are scale-only" (opened 2024-11-06, closed 2026-06-17, state completed), `https://github.com/ome/ome-zarr-py/issues/403`; cites `ome_zarr/format.py#L260-L271` at commit `56f72b0` | `2a813b45c4038f1a31ea1687bcfca92631a23f9630b9e6c9a036d7212f624c99` |
| S3 | ome-zarr-py **PR #590** "Include translations in multiscales" (merged 2026-06-17T15:55:02Z; head commit `db3d40e8f4596e39a38cabb355f871aa29bce3e2`), files `ome_zarr/format.py`, `ome_zarr/classes/image.py`, `tests/test_writer.py`, `https://github.com/ome/ome-zarr-py/pull/590/files` | `7598661acaad16b624a71e81c0f81b28cdd8c7ed658373a22c7edc36748307f7` |
| S4 | vizarr **PR #261** "Apply OME coordinate transformations" (merged 2025-03-06T17:05:28Z), files incl. `src/utils.ts` (`coordinateTransformationsToMatrix`), `src/ome.ts` (`loadOmeMultiscales`), `https://github.com/hms-dbmi/vizarr/pull/261/files`; code comment: "Apply each transformation sequentially and in order according to the OME-NGFF v0.4 spec. Reference: https://ngff.openmicroscopy.org/0.4/#trafo-md" | `aa41af494bd1fab074ad5581c0941343360f9c4269d99ce49f7093e805b094d6` |
| S5 | vizarr issues/PRs (search capture): **issue #271** "3D translation causes images to disappear" (open, 2025-04-03; states transformations "previously … ignored" before PR #261; notes coordinateTransformations needed "for scaling Labels to match parent Images"); **issue #297** "`isOmeMultiscales()` shouldn't check for `omero` metadata" (closed 2025-09-03); **issue #288** non-square dataset rendering | `cdcd72035059fb6485b9e9f30aa1f015bb19c6dbb01995e65612b122a49c0d25` |
| S6 | vizarr `package.json` @ **main**: `"@hms-dbmi/vizarr"` version **0.3.0**; deps `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, `deck.gl ~9.1.0`; `test: vitest run`; no GitHub releases (releases/latest → 404, capture `d9e37600…`) | `bddde203696567259721c7f04f6ca8ff0bed44d30203106346efc42fdd7d2cb5` |
| S7 | napari-ome-zarr **release v0.10.0** (published 2026-08-12; change: PR #149 "Forward NGFF axis names and units into napari layer metadata"), `https://github.com/ome/napari-ome-zarr/releases/tag/v0.10.0` | `4ba4287cfc69f7c92cd439331b1bc4b2ac9e969e8c8afb4b9bea94e632bced8d` |
| S8 | napari-ome-zarr **v0.10.0** `napari_ome_zarr/ome_zarr_reader.py` (blob `26a37fb902322380620cb02102172833986d0199`), `https://raw.githubusercontent.com/ome/napari-ome-zarr/v0.10.0/napari_ome_zarr/ome_zarr_reader.py` | `255ca2c58e4f52ca4ce2bafd9bdfc0db56a0827d86c592c9c786f430a57ea98e` |

Conformance convention **[SRC S1 §Conformance]**: "All of the text of this specification is normative except sections explicitly marked as non-normative, examples, and notes." RFC 2119 keywords apply (§1.3). Layout-ASCII comments such as the label-dimension note in §2.1 are part of the page but read as illustrative layout description, not testable MUST-level rules — see U4.

---

## 2. Q1 — Two precedent components and a minimal choice (B4 comparison)

**Component A: vizarr (`@hms-dbmi/vizarr` 0.3.0, main)** [SRC S6]
- Browser-side (React/deck.gl/Viv/Zarrita) OME-Zarr viewer; it is listed by the spec itself among implementations [SRC S1 §5].
- Version-specific behavior: dataset `coordinateTransformations` were **ignored before PR #261** and first applied 2025-03-06 via `coordinateTransformationsToMatrix()` producing a deck.gl `modelMatrix` [SRC S4, S5 #271]. Even after the fix it composes only `multiscales[0].datasets[0]`'s transformations [SRC S4, `src/ome.ts`/`src/utils.ts` diff], i.e. one transform per layer, not per level.
- Version-specific constraints: `isOmeMultiscales()` requires the **`omero` key** in addition to `multiscales` [SRC S4/S5 #297] — a 0.4-conformant image without optional `omero` metadata is not routed through the OME path (detection bug, closed 2025-09-03; fix state in a released artifact unverified — U3). Open regression **#271**: 3D translation can make images disappear. PR #261's file list contains **no test changes** [SRC S4].
- It targets a browser canvas, not a desktop window [SRC S6 build tooling; S1 §5 "purely client-side"].

**Component B: napari + napari-ome-zarr v0.10.0 (reader reference)**
- Desktop-native (Qt) Python viewer; napari-ome-zarr is OME's napari reader plugin (the spec lists ome-zarr-py as "a napari plugin for reading ome-zarr files" [SRC S1 §5]; napari-ome-zarr is its current plugin home, release v0.10.0 2026-08-12 [SRC S7]).
- Version-specific behavior (v0.10.0 `ome_zarr_reader.py`) [SRC S8]:
  - Builds **one napari affine per layer** from `multiscales[0].datasets[0].coordinateTransformations[0]` (first transform of the **first dataset only**), splitting off `scale` into layer metadata and keeping the rest as layer `affine`; per-level translations of coarser levels are not representable in that metadata.
  - Discovers labels via the image's `labels` group (`labels` list → `image-label` groups that must also be multiscales) and gives each label layer the **parent image transforms** ("Label inherits parent transforms … to transform it to same space as parent image").
  - v0.10.0 forwards per-axis **names and units** into layer metadata (PR #149 [SRC S7]); code comment records the observed napari condition: napari treats a `None` unit as default (pixel) and **warns "Inconsistent units across layers" and hides units when one layer lacks them** — so the scale bar's unit display depends on cross-layer unit consistency [SRC S8 comment;napari behavior as observed upstream].
  - Header comment `# zarr v3` — reader runs on zarr-python's v3 API (which can read v2-format stores); not itself a spec statement.

**Recommendation [CHOICE]**: build the prototype as a small desktop Python app on **napari**, using **napari-ome-zarr v0.10.0 as the reader precedent**, but **do not rely on it for calibration**: implement a thin strict-0.4 metadata layer of our own that (a) validates the input contract (B1), (b) computes **per-level** physical mappings for cursor readout and level-switch anchoring (B2/B3) — which napari layer metadata and vizarr's `modelMatrix` both cannot express (both are level-0/layer-only [SRC S4, S8]) — and (c) drives the optional label overlay with explicit refusal states (B3).
**Concrete tradeoff**: accept napari's heavy dependency stack (Qt, dask, zarr-python) for desktop-native multiscale interaction and a maintained reader precedent; in exchange we must work around the single-affine-per-layer limitation by doing per-level math in our code and anchoring the view ourselves, instead of using vizarr's lighter browser deploy — which we reject because it is not desktop, gates OME detection on optional `omero` metadata (issue #297), uses only level-0 transforms, and has an open 3D translation regression (#271). [INFER from S4–S8]

---

## 3. Q2 — What OME-NGFF 0.4 requires/permits for this input (B1, B2, B3 source basis)

All §-numbers refer to S1 (0.4, capture `ca4780a3…`).

**On-disk & version** [SRC]
- Arrays MUST be stored per **Zarr specification v2**; OME-NGFF metadata MUST be Zarr group attributes (§2). "This is the 0.4 release" (status). Version history: coordinateTransformations/axes types/units entered at 0.4.0 (2022-02-08).

**Axes & units (§3.1)** [SRC]
- Each axis MUST have `name` (unique); SHOULD have `type` — SHOULD be `space|time|channel` but **MAY be another custom string**; SHOULD have `unit` — SHOULD be a UDUNITS-2-valid string (space examples include `micrometer`, `nanometer`, `meter`, …). `axes` length MUST equal array dimensionality; in multiscales: 2–5 entries, exactly 2–3 of type space, at most one time and one channel/custom, **ordered time → channel/custom → space**; for 3D, `zyx` ordering is SHOULD (out of scope here — we take 2D).
- **Consequence for absent calibration** [INFER]: `type` and `unit` are only SHOULD — a conformant file may omit units entirely, and a custom axis type is legal; the prototype cannot assume units exist (handled in B2 fallback).

**coordinateTransformations (§3.3)** [SRC]
- A list; each entry MUST have `type`; in general use types are `identity` (default, usually implicit), `translation`, `scale` (each inline `List[float]` or binary `path`). "**The transformations in the list are applied sequentially and in order.**"

**multiscales (§3.4)** [SRC]
- `datasets` list MUST be ordered **largest (highest resolution) → smallest**; each dataset MUST contain `coordinateTransformations`; transformations MUST only be `translation` or `scale`; **MUST contain exactly one `scale`** that "specifies the pixel size in physical units or time duration. If scaling information is not available or applicable for one of the axes, the value MUST express the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0"; **MAY contain exactly one `translation`** "that specifies the offset from the origin in physical units. If `translation` is given it MUST be listed after `scale` to ensure that it is given in physical coordinates"; scale/translation length MUST equal `axes` length.
- The multiscales group MAY itself carry `coordinateTransformations` "applied to all resolution levels in the same manner … and are applied **after** them."
- `version` SHOULD be present ("current version is 0.4"); `name`, `type`, `metadata` SHOULD.
- **Physical cursor semantics** [INFER, following the listed order]: for a level with scale `s` and translation `t` listed in that order, array index `i` maps to physical coordinate `p = s·i + t`; multiscales-level transforms compose after dataset transforms. Unequal per-axis scales and nonzero offsets are first-class (per-axis vectors). **Units, where present, are declared per axis** (§3.1).
- **Declaration ≠ alignment guarantee** [INFER from S1]: 0.4 declares index→physical mappings only. It has **no orientation/direction metadata** (no direction cosines; rotation appears only in later-version coordinate systems, out of scope), so the screen direction of `y` (down vs up), axis handedness, and the claim that two datasets "line up" are **not guaranteed by the format** — they are viewer conventions or, for image/label pairs, inferences from their respective declared transforms. The brief's demand to "either justify the overlay alignment or withhold it" is therefore correctly aimed: justification can only ever be *metadata-derived*, never spec-guaranteed.

**Labels (§3.6, §3.7)** [SRC]
- `labels` group lists label paths in `.zattrs` `{"labels": [...]}`; "**Unlisted groups MAY be labels**" (the list is discoverability, not exclusivity).
- `image-label` groups MUST also contain `multiscales`, and "**the two `datasets` series MUST have the same number of entries**" (image pyramid and label pyramid levels match in count — a MUST, hence a checkable alignment precondition).
- `colors` SHOULD (objects MUST have integer `label-value`, unique; `rgba` MAY, uint8×4; duplicate `label-value`s: clients SHOULD ignore all except the last); `properties` MAY; **`source` MAY** with `image` MUST be a **relative path** to the image Zarr group, default `"../../"`; `version` SHOULD `"0.4"`.
- §2.1's layout illustration adds (illustrative): each label dimension "should be either the same as the corresponding dimension of the image, or 1".
- **Association is metadata, not geometry** [INFER]: `source.image`/`labels` discovery tells us *which* label belongs to *which* image; nothing asserts their transforms match. Alignment must be computed by mapping **both** pyramids' level transforms into physical space and comparing — with refusal when that fails (B3).

**omero (§3.5, transitional)** [SRC]: optional rendering hints; if present MUST contain `channels` with `color` and `window` (`min`, `max`, `start`, `end`). Useful for default contrast, never for calibration. vizarr's reliance on it for *detection* (S5 #297) is an implementation choice, not a spec requirement [INFER].

**Resolution switching** [SRC+INFER]: the spec fixes only the ordering of levels and each level's declared mapping; it does **not** mandate a display level, switching policy, or that level content be registered. The writer-side history (§4) shows a conformant-looking scale-only pyramid whose levels are mutually misregistered by half-pixel/origin terms — i.e., even spec-valid metadata can encode per-level offsets that a naive level-switching viewer ignores.

---

## 4. Q3 — Real issue → fix → test chain, scoped lesson and validation (B4)

**Primary chain (writer side; resolution switching × calibration):**
1. **Issue**: ome-zarr-py #403 (2024-11-06) [SRC S2]: `Format.generate_coordinate_transformations` wrote **scale-only** `coordinateTransformations` for 0.4 pyramids ("will be incorrect for almost all multiscale pyramids"), because common downsampling shifts the downsampled image (origin/center changes), which requires a translation.
2. **Fix**: PR #590 (merged 2026-06-17, commit `db3d40e`) [SRC S3]: `ome_zarr/format.py` now emits per level `translation = s/2 − s0/2` (per axis, `s` level scale, `s0` level-0 scale) after the scale entry; `ome_zarr/classes/image.py` mirrors this in the class-based writer.
3. **Tests**: `tests/test_writer.py` updated in the same PR — assertions changed from `len(cts) == 1` to `len(cts) == 2` with the exact translation formula encoded (scale + translation) across image, dask, and label-writing tests [SRC S3].
4. **Scoped lesson** [INFER]: level-`k` metadata is *not* just level-0 scaling; correct level switching needs the **pair (scale, translation)** applied in list order, and the pixel-center convention `t_k = s_k/2 − s_0/2` keeps coarser levels concentric with level 0. A viewer that switches levels using scale alone silently misregisters content whenever the pyramid carries (or should have carried) per-level translations. Read side: viewers that keep **one transform per layer** (vizarr `modelMatrix` from `datasets[0]` [S4]; napari layer affine from `datasets[0]` [S8]) cannot honor per-level translations at all — the same failure mode seen from the reader side.
5. **Validation that follows** (proposed, not executed — §7 fixtures F2/F3): per-level bbox containment with inset `(s_k − s_0)/2`; cross-level cursor identity for the same physical point; a discriminating pair of fixtures (scale-only vs scale+translation metadata) that flips the assertion.

**Corroborating viewer-side chain**: vizarr #271 documents that before PR #261 dataset `coordinateTransformations` were ignored, and that PR #261's 3D application regressed 3D samples (open issue, 2025-04-03), while the same mechanism is what scales labels to match parent images [SRC S5]. Lesson: apply transformations per spec order **and scope them to the view dimensionality** — our prototype is strictly 2D, sidestepping the documented 3D regression. Also note upstream process contrast: ome-zarr-py fixed #403 **with** test updates; vizarr's #261 diff contains **no test changes** [SRC S3 vs S4] — our fixture set must cover what upstream did not.

---

## 5. Obligation mapping B1–B4 (summary; details above and in §7)

- **B1** input contract: §3 on-disk, §3.4, §3.5; product hardening [CHOICE] in §7 S2.
- **B2** physical cursor & calibrated display: §3.1 units (SHOULD, UDUNITS-2), §3.4 scale/translation order semantics; fallback when units absent; napari unit-consistency condition observed upstream [S8]. §7 F1/F2/F6.
- **B3** resolution switching + label overlay: §3.4 datasets ordering, exactly-one-scale, translation-after-scale; §3.6/3.7 association; MUST same-level-count; refusal states. §7 F3/F4/F5/F8.
- **B4** two discovered components compared with recommendation + tradeoff (§2); one real issue→fix→test chain with separated observation/inference/choice (§4).

---

## 6. Corrections to the thin plan [FIX]

1. Thin plan step 1 ("choose the minimal reader/viewer components") assumed a component can simply be adopted. Evidence says otherwise: **both** candidate components normalize calibration to a single per-layer transform (S4, S8), so the plan gains an explicit per-level calibration module owned by the prototype (§7 S3).
2. Thin plan step 2 ("design metadata interpretation") had no order semantics. Fixed: transformations apply **sequentially and in listed order**, translation must follow scale (S1 §3.3/§3.4).
3. Thin plan step 3 ("decide when an overlay can be shown") lacked refusal criteria. Fixed with MUST-derived preconditions (same dataset count; association path resolvable; physical-space mapping computable) and visible refusal states (§7 S5).
4. Thin plan step 4 ("tiny discriminating fixture set") is kept, but fixtures must include the **scale-only vs scale+translation** discriminating pair motivated by issue #403→PR #590 (§7 F2/F3), and a units-absent fixture (F1), and a units-inconsistent pair (F6).

---

## 7. B5 — Revised implementation steps and discriminating validation (all proposed; nothing executed)

**Steps**
- **S1 Store access (read-only)**: open the local Zarr **v2** store read-only (§2 MUST) [CHOICE: reject v3-only stores with "unsupported: OME-NGFF 0.4 targets Zarr v2"]. Never write; no sidecar files; no metadata patching. Visible "read-only" badge.
- **S2 Contract validation (B1)**: accept exactly: one image group with `multiscales[0]` having `version` `"0.4"` (SHOULD — absence ⇒ visible warning + treat as unversioned; any other version ⇒ unsupported state) [CHOICE]; `axes` 2 entries of type space (time/channel/custom axes in a 2D file: accept only if exactly one extra non-space axis, and slice it at index 0/0 — [CHOICE], consistent with §3.4 axis rules); `datasets` of length exactly 2, paths largest→smallest (§3.4 MUST; violation ⇒ unsupported state listing the violated rule); each dataset's `coordinateTransformations` = exactly one `scale` + optional `translation` after it, lengths = 2 (violations ⇒ unsupported state). Unsupported input ⇒ single clear state with the first violated requirement; no partial render [CHOICE].
- **S3 Per-level calibration module (B2)**: for each level k, compose `M_k` from dataset transforms in listed order, then any multiscales-level transforms after (§3.4). Cursor readout: physical = `M_k·i`, displayed as `x=<v><unit>, y=<v><unit>`; units absent ⇒ display "pixel" and omit unit-bearing scale bar text [CHOICE fallback; §3.1 makes unit optional]. Calibrated scale indication = on-screen bar computed from `M_k` and the canvas transform [CHOICE]; do **not** delegate unit consistency to the viewer (napari hides units when layers disagree — observed upstream S8). Declaration vs guarantee: the status bar states "declared calibration" and the overlay justification text states that orientation follows the array-down convention [CHOICE; INFER that 0.4 cannot express orientation].
- **S4 Resolution switching (B3)**: level choice by fit-to-viewport (largest first, per §3.4 ordering); switching keeps the **physical** center point fixed by mapping through `M_0` and inverting `M_k` (pixel-center convention; see F3). Per-level transforms are kept inside S3's module; napari gets a per-switch level array + view anchor, not per-level layer metadata [INFER work-around; see U2].
- **S5 Label overlay with refusal states (B3)**: discover labels via `labels` group list and/or `image-label` (§3.6/3.7; unlisted label groups not auto-loaded [CHOICE]). Association justification shown on screen: association path (default `"../../"`), and per-level physical bbox comparison of image vs label from their own transforms. **Refuse to overlay** (visible reason, image stays interactive) when: (a) label pyramid dataset count ≠ image count (§3.7 MUST); (b) label axes ≠ 2 space dims or names mismatch; (c) no computable physical mapping (missing scale — violates §3.4 MUST) or bboxes disjoint beyond declared translations [CHOICE thresholds in F5]. Sampling: labels drawn **nearest-neighbor**, images trilinear/default [CHOICE: categorical values must not be invented by interpolation]. Colors from `image-label.colors` (ignore duplicates except last, §3.7); properties in hover tooltip when present [CHOICE].
- **S6 Status/limits surface**: one status strip: input path+sha, detected version, per-axis units, current level, overlay state (shown/justified/refused+reason), read-only. This is the "understandable visible state" required by the brief.

**Fixture set (proposed; discriminating checks; none executed)**
- **F1 minimal**: 2D yx, 2 levels, scale-only, no units, no labels. Expect: renders; cursor shows pixel values, unit fallback active; no warning-free unit claim. *Discriminates* B2 fallback.
- **F2 anisotropic + offsets**: `s0=(0.5, 0.2) µm`, `t0=(10, 0) µm`, level1 `s1=(1.0, 0.4)`, `t1=(10.25, 0.1)`. Expect cursor at level1 index (i,j) = `(s1·(i,j)+t1)` exactly; scale bar aspect matches s ratio. *Discriminates* unequal-scale + nonzero-offset cursor math (B2).
- **F3 level-switch registration pair** (the #403/#590 discriminator): level0 (1000,1000), `s0=(0.5,0.5)`; level1 (500,500), `s1=(1.0,1.0)`; variant A metadata scale-only (pre-fix style), variant B adds `t1=(0.25,0.25)` (`= s1/2 − s0/2`, PR #590 formula). Proposed assertions: in B, level1 center index (250,250) reads (250.25, 250.25) µm and equals level0 physical point (250.25, 250.25); level1 center bbox is inset from level0 bbox by exactly 0.25 µm per side; a marker painted at level0 index (501,300) (physical (250.5,150.0) µm) is displayed at level1 index ⌊(p−t)/s⌋=(250,149). In A the same marker maps to (250.5,150.0) index space ⇒ displayed one-half-to-one coarse pixel off. Expected values hand-derived from S1 §3.3/§3.4 semantics + S3 formula; **execution pending**.
- **F4 label overlay, aligned**: image + `labels/0` with `image-label.version 0.4`, `source.image "../../"`, 2-level label pyramid, own scales equal to image's, colors for values {1,4}. Expect overlay registered; hover shows `properties` when present.
- **F5 label refusal, spec-violating**: label pyramid with 1 dataset vs image 2 (violates §3.7 MUST). Expect refusal state citing the rule; image still viewable.
- **F6 units inconsistency**: image has `micrometer` axes; label axes lack `unit`. Expect: overlay still allowed (association independent of units), unit display computed only from image layer; explicit note that viewer-side unit hiding was observed upstream (S8) — prototype does not depend on it.
- **F7 unsupported inputs**: 3-space-axis (3D) file; `version "0.3"` with string axes; datasets misordered. Expect: single unsupported state naming the violated 0.4 rule (B1).
- **F8 missing scale entry** on a dataset (violates §3.4 MUST). Expect: unsupported state; cursor withheld rather than silently unitless [CHOICE].

**Visible limits of the prototype**: no unit conversion (UDUNITS-2 strings displayed as declared); no orientation/registration estimation; no assertion that any two datasets align beyond declared transforms; single-image, single-label, 2-level only; no network access at runtime.

**Validation status**: every check in §7 is a proposal. No test, script or fixture has been run in this stage and no execution receipt exists; do not represent F1–F8 as passed.

---

## 8. Handoff

Remaining consequential uncertainties are in `out/UNRESOLVED_LEADS.md` (release pinning for ome-zarr-py PR #590, napari per-layer transform limitation, vizarr release-state of the `omero`-gating fix, normative status of label-dimension note, Zarr v2/v3 interop check, untested upstream vizarr fix).
