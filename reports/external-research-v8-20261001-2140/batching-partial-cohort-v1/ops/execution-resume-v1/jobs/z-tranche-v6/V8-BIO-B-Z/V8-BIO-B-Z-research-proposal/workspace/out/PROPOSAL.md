# Research proposal — local calibrated 2D OME-NGFF 0.4 image/label viewer (V8-BIO-B-Z)

Research-backed revision of `inputs/THIN_PLAN.md` for the synthetic brief in `inputs/BRIEF.md`.
Scope is deliberately narrow: one local OME-NGFF 0.4 dataset, exactly two 2D resolution levels,
one optional categorical label image, read-only inspection window, calibrated cursor, resolution
switching, overlay show/withhold. No 3D, time series, cloud stores, authoring, segmentation,
registration estimation, or conversion. Labels in this document: **[SRC]** = source fact (normative
text or observed upstream behavior, with locator), **[INFER]** = engineering inference,
**[CHOICE]** = product choice, **[CORRECTION]** = supported correction of an earlier proposition,
**[UNEXECUTED]** = proposed validation, not run in this stage.

---

## 0. Research-order note

Three coherent batches, progressively retrieved (identity/version first, then surrounding
sections; sources reused across obligations). Batch 1: OME-NGFF 0.4 specification — located the
rendered site `https://ngff.openmicroscopy.org/0.4/index.html`, resolved it to its source
submodule `ome/ngff-spec` pinned at commit `a4c68004fdb8a8d822367205dc12f9574a32ddf8`
(`ome/ngff` → `specifications/0.4`), and captured `index.md` (36,817 bytes; front matter:
`version: 0.4`, `date: 2023-05-25`, `status: w3c/CG-FINAL`). Batch 2: component comparison —
`ome/ome-zarr-py` (repo metadata, release v0.19.2, `ome_zarr/reader.py` at that tag) and
`hms-dbmi/vizarr` (README, `package.json`, no GitHub releases). Batch 3: issue → fix → test chain —
ome-zarr-py issue #403 → PR #590 (file-level patch and test diff) → release v0.18.0 notes; plus
vizarr transform-handling PR #261 and issues #271/#262/#288/#259 as observed upstream behavior.
Roughly twenty public captures; the 0.4 spec capture is reused for B1, B2 and B3.

---

## 1. Primary sources (exact locators)

| ID | Source / version locator | Used for |
|----|--------------------------|----------|
| S1 | OME-NGFF **0.4** specification, `ome/ngff-spec@a4c68004fdb8a8d822367205dc12f9574a32ddf8`, file `index.md` (sha256 `fc39309d…`, captured 2026-10-03); rendered at `https://ngff.openmicroscopy.org/0.4/` | Q2, B1, B2, B3 |
| S2 | `ome/ome-zarr-py` tag **v0.19.2** (release published 2026-09-08; repo default branch `master`), file `ome_zarr/reader.py` (sha256 `c46ba936…`) | Q1, B1, B3, B4 |
| S3 | `ome/ome-zarr-py` issue **#403** "`coordinateTransformations` generated for 0.4 are scale-only" (opened 2024-11-06, closed completed 2026-06-17; cites `ome_zarr/format.py` L260–271 at commit `56f72b06`) | Q3 |
| S4 | `ome/ome-zarr-py` PR **#590** "Include translations in multiscales" (merged 2026-06-17T15:55:02Z; fixes #403), file-level patch over `ome_zarr/format.py`, `ome_zarr/classes/image.py`, `tests/test_writer.py` | Q3, B4 |
| S5 | `ome/ome-zarr-py` release **v0.18.0** (published 2026-06-17T16:21:34Z; notes list "Include translations in multiscales … #590"); latest release **v0.19.2** | Q3 |
| S6 | `hms-dbmi/vizarr` branch `main`: `README.md` (sha256 `e2b6135a…`), `package.json` `"version": "0.3.0"` (sha256 `bddde203…`, deps `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, `deck.gl ~9.1.0`); GitHub "latest release" endpoint returns 404 (no published releases) | Q1, B4 |
| S7 | `hms-dbmi/vizarr` PR **#261** "Apply OME coordinate transformations" (merged 2025-03-06T17:05:28Z) | Q1, B2, B4 |
| S8 | `hms-dbmi/vizarr` issue **#271** "3D translation causes images to disappear" (open, 2025-04-03; records that `coordinateTransformations` were previously *ignored*, references `coordinateTransformationsToMatrix()` in `src/utils.ts` at commit `e80201f`) | Q1, B4 |
| S9 | `hms-dbmi/vizarr` issue **#262** "Blank canvas" (open, 2025-03-07; spec-conformant 0.4 renders black in vizarr but fine in napari-ome-zarr / neuroglancer) | Q1, B4 |
| S10 | `hms-dbmi/vizarr` issue **#288** "Problem displaying non square datasets" (closed completed 2025-09-12) | Q1, B4 |
| S11 | `hms-dbmi/vizarr` PR **#259** "Multi sources with transforms" (draft, closed unmerged 2026-09-09; records nondeterministic overlay ordering and ignored Z translation/scale in transform parsing) | B3, B4 |
| S12 | S1 `index.md` § "Implementations": lists `ome-zarr-py` ("A napari plugin for reading ome-zarr files") and `vizarr` ("A minimal, purely client-side program for viewing Zarr-based images with Viv & ImJoy") | Q1 |

Throughout: "MUST/SHOULD/MAY" below quote S1's own RFC 2119 keywords (S1 § Document conventions).
Lowercase guidance inside S1's layout example is treated as informative, per S1's conventions.

---

## 2. Answers to the three research questions

### Q1 — Component precedents and minimal choice (B4 comparison)

Two independently discovered, spec-listed implementations (S12) were compared:

**A. ome-zarr-py v0.19.2 reader (+ napari as the windowing layer).** [SRC] The v0.19.2 reader
discovers nodes by matching `.zattrs` keys: `Multiscales.matches` requires a Zarr group with
`multiscales`; `Labels.matches` matches a group with a `labels` attribute and loads the listed
children; `Label.matches` matches `image-label`, resolves the parent image via
`image-label.source.image` and prepends it (hidden by default), warning "no parent found" when
resolvable-parent is missing. The multiscales spec reads only `multiscales[0]`, takes
`version = multiscales[0].get("version", "0.1")` (default "0.1" when absent) and constructs
`Axes(axes, fmt=fmt)` which "Raises ValueError if not valid"; dataset-level
`coordinateTransformations` are surfaced in node metadata, but **multiscales-level
`coordinateTransformations` are not parsed** (observed at S2 `Multiscales.__init__`).
Strengths for this prototype: native desktop/Python, local-store first, labels hierarchy
handling, testable in-process. Weaknesses: reader parses only the first multiscale entry and
ignores multiscales-level transforms (we must add that ourselves); napari is a heavyweight
dependency.

**B. vizarr 0.3.0 (`main`, package.json; no tagged releases).** [SRC] Minimal purely client-side
viewer on Viv ~0.19/zarrita ~0.6 (S6). Version-specific behavior: dataset
`coordinateTransformations` were *ignored* until PR #261 (merged 2025-03-06, S7/S8); afterwards,
open issues document a 3D-translation regression (#271) and a blank canvas on spec-conformant
0.4 data viewable in napari-ome-zarr (#262); a non-square-dataset display defect was fixed
(#288, closed 2025-09-12); multi-source overlay with relative transforms exists only as an
unmerged draft recording nondeterministic layer order and ignored Z translation (#259, S11).
Strengths: zero-install browser viewing. Weaknesses for this brief: its own README limits the
well-tested path to "pyramidal OME-Zarr images … within a Jupyter Notebook" and says generic
Zarr support "is not as well tested" (S6 § Limitations); the observed 0.4 calibration defects
above directly hit our B2/B3 obligations.

**Recommendation [CHOICE]:** Component A — reuse `ome-zarr-py` v0.19.2 as the reader only, plus
napari as canvas, with our own thin transform/state layer. **Concrete tradeoff:** we accept
napari's heavy Qt/vispy dependency footprint and write ~200 lines of transform-resolution and
precondition-checking code ourselves, in exchange for a desktop read-only path whose reader and
issue history are inspectable and testable in-process (S2–S5), and we avoid vizarr's currently
open 0.4 rendering/transform defects (#262, #271) and absent overlay-with-transform support
(#259) [SRC observed] that would put B2/B3 behavior outside our control. [INFER] If the product
later needs browser or notebook embedding, vizarr becomes the better base; that condition does
not hold for this brief.

### Q2 — What OME-NGFF 0.4 requires/permits for axis/calibration, cursor, switching, labels

All [SRC] unless marked otherwise; locators are sections of S1.

- **Axes** (§ "axes" metadata): each axis dict MUST contain unique `"name"`; SHOULD contain
  `"type"` (one of `space`/`time`/`channel`, MAY be custom); SHOULD contain `"unit"` from a
  UDUNITS-2 enumeration (e.g. `micrometer`); axes length MUST equal array dimensionality;
  multiscales axes MUST contain 2–3 `space` entries, MAY add one `time` and one
  `channel`/custom, ordered time → channel/custom → space. **So units and even axis type are
  permitted to be absent** (SHOULD-level) — a prototype cannot assume units exist.
- **coordinateTransformations** (§ "coordinateTransformations" metadata): a list applied
  **sequentially and in order**; each entry MUST have `type` ∈ {`identity`, `translation`,
  `scale`}; `identity` is the default and "typically not explicitly defined".
- **Multiscales datasets** (§ "multiscales" metadata): each dataset MUST have `path` and
  `coordinateTransformations`; paths MUST be ordered largest → smallest (this defines resolution
  order — the basis for level switching); transformations MUST be only `scale`/`translation`;
  **exactly one `scale` is mandatory** — "If scaling information is not available or applicable
  for one of the axes, the value MUST express the scaling factor between the current resolution
  and the first resolution …, defaulting to 1.0" — and **one `translation` is optional (MAY)**;
  if present it MUST come after `scale` (so it is expressed in physical coordinates); scale and
  translation vector lengths MUST equal the axes count. The multiscales dict MAY additionally
  carry dataset-independent `coordinateTransformations`, applied **after** the per-dataset ones.
  SHOULD-level: `name`, `version` ("current version is 0.4"), `type`, `metadata`.
- **Interpretation (metadata vs guarantee):** these declarations *define* a mapping from array
  index to physical coordinate per level; nothing in S1 asserts that image and label series are
  mutually aligned. [SRC] The only label-to-image structural requirement is: an `image-label`
  group MUST also contain `multiscales` and "the two 'datasets' series MUST have the same number
  of entries" (§ "image-label" metadata); `image-label.source.image` MAY name the associated
  image with default `"../../"`; the informative layout comment says label dimensions should
  equal the image's or be 1 (informative per S1 conventions, and lowercase). **[INFER]** Equal
  dataset *counts* do not constrain shapes or transforms, so overlay alignment is a declaration
  to be verified, not a guarantee.
- **Physical cursor formula** [INFER from SRC]: for level L, index `i`, apply that level's
  transform list in order to `i` (scale, then translation if present), then any multiscales-level
  transforms in order; report physical coordinates in the axes' units, or in axis-native
  "pixel units" with an explicit unitless flag when `unit` is absent. [SRC observed] ome-zarr-py
  v0.19.2 exposes dataset transforms but not multiscales-level ones (S2), so our prototype parses
  both itself [CHOICE].
- **Version/support:** `multiscales[0].version` SHOULD be present ("0.4"); ome-zarr-py defaults
  missing version to "0.1" (S2) [SRC observed].

### Q3 — Real issue → fix → test chain, lesson, validation

**Issue.** [SRC] ome-zarr-py **#403** (opened 2024-11-06): "`coordinateTransformations` generated
for 0.4 are scale-only". Body: "The most common methods of image downsampling result in a
translation of the downsampled image, but this code … only returns scale transformations, which
will be incorrect for almost all multiscale pyramids," citing `generate_coordinate_transformations`
in `ome_zarr/format.py` L260–271 at commit `56f72b06`; suggested fix: "generate translation
transforms".

**Fix.** [SRC] PR **#590** "Include translations in multiscales" (merged 2026-06-17; fixes #403).
File-level patch: `ome_zarr/format.py` now emits per level
`[{"type":"scale","scale":scale}, {"type":"translation","translation":trans}]` with
`trans = [s/2 − s0/2 for s, s0 in zip(scale, scale0)]` and `scale0 = [1.0]*ndim`;
`ome_zarr/classes/image.py` adds the same translation after each dataset `Scale`;
`tests/test_writer.py` assertions change from `len(cts) == 1` to `len(cts) == 2` (scale +
translation) across image, dask, and **label** writer paths, and label fixtures construct the
same expected translations. **Shipped in release v0.18.0** (published 2026-06-17T16:21:34Z,
release notes list #590); latest release is v0.19.2 (2026-09-08) (S5).

**Scoped lesson.** [INFER] Writer-side calibration metadata has been demonstrably incomplete in
a mainstream tool within this format's own ecosystem; hence a *viewer* must not assume that
declared level transforms imply cross-level or image↔label alignment, and must be able to
explain refusal. The upstream test change (`len(cts) == 2`) is the discriminating assertion
pattern we adopt for our own fixtures. The lesson is scoped to: metadata generation for
multiscales in ome-zarr-py ≤ v0.17.0; it is not a claim about the 0.4 spec, which already
permitted translations.

**Validation that follows** (all [UNEXECUTED], see § 5): recompute the declared level-1 physical
position of a known pixel and compare against the aggregation-consistent value (witness in § 4);
assert per-level transform pairs (scale, optional translation) parse for every level; assert
image/label transform consistency precondition before overlay.

---

## 3. Obligations B1–B5

### B1 — Local input contract, version/support checks, read-only boundary [CHOICE unless cited]

- **Input:** a local directory containing a Zarr v2 group with `.zgroup`/`.zattrs` and array
  subgroups (S1 § on-disk layout: OME-Zarr arrays MUST be stored per Zarr v2, metadata in Zarr
  group attributes). Accept exactly: one image group with `multiscales`; axes 2D (`y`,`x` type
  `space`), optionally `c`; **exactly two** datasets (brief constraint; the spec permits 2–5
  levels and 2–5 dimensions — we reject the rest as out-of-scope, visibly). [INFER] Refuse
  (visible state, reason shown) datasets carrying `plate`/`well`/`bioformats2raw.layout` keys
  (S1 marks HCS/bf2raw as out of this prototype's scope) and non-2D axes.
- **Version check:** require `multiscales[0].version == "0.4"` when present; if absent, accept
  only if the metadata is otherwise 0.4-shaped and show a "version not declared" notice — this
  mirrors the reader's observed default-to-"0.1" behavior (S2) without silently blessing other
  versions. Other versions → "unsupported version: <value>" state.
- **Read-only boundary:** open the store read-only; the prototype exposes no mutation path; any
  attempt to persist state writes only to the application's own settings, never the dataset.
- **Absent labels:** no `labels` group, or an empty `labels` list, or a listed label that fails
  to load → the image window operates normally with overlay withheld; reason surfaced in the
  overlay control (B3). This matches the spec making labels optional (S1 layout) and the reader
  tolerating missing parents with a warning (S2).
- **Unsupported input:** a group without matching specs is not an OME-NGFF image (observed S2:
  reader yields a raw-array node with no specs) → "not an OME-NGFF 0.4 image" state.

### B2 — Physical cursor coordinates and calibrated display

- **Derivation [CHOICE on top of SRC]:** cursor at array index `i` on level L →
  `p = M_ms ∘ T_L ∘ S_L (i)` where `S_L`, `T_L` are that dataset's scale/translation (in list
  order, translation last per S1) and `M_ms` any multiscales-level transforms applied after
  (per S1; note ome-zarr-py v0.19.2 does not parse `M_ms` — S2 — so we parse it ourselves).
- **Units and fallbacks:** display `micrometer`-style unit strings from `axes[].unit` (UDUNITS-2
  names, S1). If `unit` absent (permitted, SHOULD-level) → show coordinates with suffix
  "px·axis-units (unit not declared)"; if transforms are unparseable or the mandatory scale is
  missing (an invalid 0.4 file) → withhold calibrated readout with reason "calibration
  unavailable: <which metadata failed>" and fall back to raw index readout [CHOICE].
- **Calibrated scale indication:** scale bar computed from current view zoom × per-axis scale;
  anisotropy (unequal y/x scales) and nonzero offsets are displayed explicitly, since S1 permits
  any per-axis scale values and offsets [SRC permits; display is CHOICE].
- **Dependency statement:** this interpretation depends on S1 § multiscales/trafo/axes as cited
  in Q2, on version 0.4 only (0.5+ redefines coordinate systems — out of scope), and on
  ome-zarr-py v0.19.2 only as a convenience reader (our readout does not trust its transform
  surface for `M_ms`, per S2 observed behavior).

### B3 — Resolution switching and optional categorical label overlay

- **Switching:** present the two dataset paths in file order (S1: MUST be ordered largest →
  smallest; level 0 = highest resolution). [CHOICE] Default to the level whose array best fits
  the viewport; switching re-renders with that level's own transform so the physical cursor and
  scale bar stay continuous. The #403 history (Q3) is exactly why per-level transforms must be
  applied per level rather than assuming a common origin [INFER].
- **Association:** discover label candidates via the image group's `labels` group listing
  (S1 § "labels" metadata; "Unlisted groups MAY be labels" — we do not auto-discover unlisted
  groups [CHOICE]); resolve each label's `image-label.source.image` (default `"../../"`, S1) and
  require it to resolve to the displayed image group.
- **Preconditions to show overlay (all must hold; otherwise actionable refusal):**
  1. label `multiscales.datasets` count == image `multiscales.datasets` count (S1 MUST);
  2. label axes names/types match the image axes per level [CHOICE, from S1 axes rules];
  3. per level, both series' transforms resolve to the same physical space within a tolerance
     (max |Δ origin| ≤ ½ coarse pixel) — the check motivated by Q3 [INFER];
  4. label arrays are integer-valued (S1 layout: "only integer values are supported" —
     informative but load-bearing for categorical rendering).
  Refusal state shows which precondition failed, the inspected metadata paths, and the value
  mismatch; the image remains viewable. [SRC] Nothing in S1 forces refusal — this is our
  interpreted safeguard grounded in the #403 lesson.
- **Sampling [CHOICE/INFER]:** image rendered with linear sampling; label overlay rendered
  nearest-neighbor so no new categorical values are invented; overlay drawn in the image's level
  transform space after precondition checks pass.

### B4 — Component comparison, bounded approach, issue chain

Comparison and recommendation are in Q1; the issue → fix → test chain is in Q3. Bounded approach:
**reuse ome-zarr-py v0.19.2 strictly as a reader; add our own transform resolver, precondition
checker, and UI states; use napari only as the canvas.** Separation maintained: upstream observed
behavior is quoted with locators (S2–S11); consequences we draw are [INFER]; UI and defaults are
[CHOICE]. A supported correction to the thin plan's implicit assumption that "opening one local
image" is trivial: the ecosystem's own history (#403/#590; vizarr #261–#288) shows calibration
and transform handling is the failure-prone part, so it gets dedicated fixtures and a refusal
state rather than being an unstated side effect of a viewer widget [CORRECTION, evidence cited].

### B5 — Revised implementation steps, discriminating validation, visible limits

Steps (replacing thin-plan steps 1–4):
1. **Reader/contract module** (B1): local Zarr-v2 open (read-only), `multiscales` discovery,
   version check, 2D/two-level/axis-shape gate, out-of-scope-key gate; states: ok /
   not-ome-ngff / unsupported-version / out-of-scope-shape.
2. **Transform resolver** (B2, Q2): parse per-dataset transforms (ordered scale→translation),
   multiscales-level transforms, axes types/units; produce per-level index→physical mapping and
   unit state (declared / unitless).
3. **Canvas** (B2/B3): two-level display, viewport-driven level choice, physical cursor readout,
   anisotropy-aware scale bar, withheld-calibration state.
4. **Overlay manager** (B3): label discovery, source resolution, four preconditions, refusal
   state with reasons; nearest-neighbor categorical rendering.
5. **Fixture suite** (below) run headlessly against the reader/resolver/overlay-manager modules.

Discriminating fixtures and checks (all **[UNEXECUTED]** — proposed, not run in this stage; no
execution receipt exists for them):
- **F1 witness fixture:** 2048×2048 level 0, 512×512 level 1 (factor 4), scale [1,1]/[4,4],
  translation [0,0]/[1.5,1.5] µm (PR #590 formula). Check: cursor at level-1 index (0,0) reads
  (1.5, 1.5) µm; at level-0 index (0,0) reads (0,0) µm; and a marked physical point survives a
  level switch within ½ coarse-pixel tolerance.
- **F2 anisotropy/offset:** scales y=0.5, x=0.25 µm, translation y=10, x=5; check cursor
  formula per axis and scale bar showing two different physical lengths per screen axis.
- **F3 no units:** axes without `unit` (S1-permitted); check unitless readout + flag.
- **F4 well-formed label:** counts match, transforms consistent → overlay shown.
- **F5 misaligned label:** label level-1 translation differs by > ½ coarse pixel → refusal
  naming precondition 3 with both transform values.
- **F6 count-mismatch label:** 1 label dataset vs 2 image datasets → refusal naming the S1
  MUST clause (§ "image-label").
- **F7 no labels group:** image view normal, overlay control shows "no label image present".
- **F8/F9 version and shape:** version "0.3" file → unsupported-version state; 3D `zyx` →
  out-of-scope state.
- **F10 invalid transforms:** dataset without the mandatory scale → invalid-metadata state,
  calibration withheld (B2 fallback).
Visible limits stated in the UI: prototype supports exactly one 2D dataset, two levels, one
label; no HCS plates/wells, no 0.5+ coordinate systems, no remote stores; performance
characteristics unmeasured.

---

## 4. Condition/witness check — three consequential propositions

| # | Proposition (one per question) | Source/version | Applicability condition | Relevant exception | Normative force | Kind | Supported correction |
|---|--------------------------------|----------------|--------------------------|--------------------|-----------------|------|----------------------|
| P1 | Python desktop stack (ome-zarr-py v0.19.2 reader + napari canvas) is the minimal-fit component base; vizarr 0.3.0 is the rejected alternative | S2, S6, S7–S11, S12 | local file, desktop, read-only, 2D, two levels | If browser/notebook embedding were required, vizarr would be preferred (its niche per its own README) | None from the spec — engineering/product choice | [CHOICE]+[SRC] observed upstream | Rejects thin-plan assumption that viewer choice is incidental: version-specific observed defects (vizarr #262 blank canvas on conformant 0.4; #271 transform regression; #259 unmerged overlay) make the choice consequential |
| P2 | Per-level dataset `coordinateTransformations` define index→physical mapping: exactly one `scale` (MUST, level-relative factor defaulting to 1.0 when no scaling info), optional `translation` (MAY) that MUST follow `scale`, applied sequentially in order; axes `type`/`unit` are SHOULD and may be absent; units may therefore be legitimately missing | S1 `index.md` § "coordinateTransformations", § "multiscales", § "axes" (0.4, commit `a4c68004`) | OME-NGFF 0.4 `multiscales` metadata as stored in `.zattrs` | `identity` default; translation may be absent entirely; unit absent → unitless readout; multiscales-level transforms optional and applied after dataset-level ones (and not parsed by ome-zarr-py v0.19.2 — S2) | RFC 2119 MUST/MAY/SHOULD as quoted | [SRC], formula assembly [INFER], unitless UI [CHOICE] | Rejects "axis metadata always carries units": S1 makes `type`/`unit` SHOULD-level, so B2 defines a unitless fallback instead of erroring |
| P3 | Alignment of levels and of image↔label series is declared but not guaranteed in practice; the viewer must verify consistency and refuse with reasons | S3 (issue #403), S4 (PR #590 patch+tests), S5 (v0.18.0), S1 § "image-label" (equal dataset-count MUST only) | files written by ome-zarr-py ≤ v0.17.0, and any file whose label series transforms disagree | Files written by v0.18.0+ carry the centering translation; the spec itself was never violated (scale-only files were 0.4-legal) | Spec-level: MUSTs on presence/order; upstream behavior level: observed defect + fix + tests | [SRC] chain + [INFER] lesson | Supported correction of the earlier proposition "0.4-conformant files have mutually consistent level alignment by construction": false for ome-zarr-py ≤ v0.17.0 output per #403; fixed for its writer in v0.18.0 per #590/v0.18.0; old files persist |

### Discriminating numerical witness (reasoned; **UNEXECUTED**)

Chosen values (F1): level-0 shape 2048×2048, level-1 shape 512×512 (factor 4), axes `y,x` in
micrometer; per the PR #590 formula (`trans = s/2 − s0/2`, `s0 = 1`): level-1 `scale = [4.0,
4.0]`, `translation = [4/2 − 1/2, 4/2 − 1/2] = [1.5, 1.5]`. Intermediate reasoning, one axis:

- **Interpretation A** (apply declared transforms in order, per S1 "applied sequentially and in
  order"): physical position of level-1 pixel (0) = scale step `0 × 4.0 = 0.0`, then translation
  step `0.0 + 1.5 = 1.5` µm.
- **Interpretation B** (pre-#403-fix style scale-only metadata, origin assumed common): `0 × 4.0
  = 0.0` µm.
- Area-average consistency argument: level-1 pixel 0 aggregates level-0 pixels 0–3, whose centers
  lie at 0,1,2,3 µm with mean `(0+1+2+3)/4 = 1.5` µm — matching A and contradicting B by
  **1.5 µm per axis** (half the aggregation block).
- The witness therefore discriminates "display the file's declared per-level physical frame"
  (A) from "assume levels share the level-0 origin" (B); a viewer implementing B misstates every
  coarse-level cursor readout by `scale/2 − 1/2` per axis, and misaligns a mixed-level overlay by
  the same amount — the exact failure class of ome-zarr-py #403.

This arithmetic is presented as hand reasoning. This case admits no arithmetic-executing tool, so
per METHOD.md the witness and fixtures F1–F10 are a reasoned **UNEXECUTED** validation proposal;
no runtime result is claimed.

---

## 5. Assumption register (kept current; superseded propositions live only as corrections above)

- The prototype targets OME-NGFF **0.4 only**; 0.5+ coordinate-system machinery (seen referenced
  in upstream PRs S4/S11 context) is out of scope.
- ome-zarr-py is used only for reading; the observed limitation that it surfaces dataset-level
  but not multiscales-level transforms (S2) is compensated in our resolver, not patched upstream.
- napari is treated as an unversioned canvas dependency in this proposal; pinning its version is
  an implementation-stage task (`out/UNRESOLVED_LEADS.md`).
