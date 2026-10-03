# V8-BIO-AMEND-C-L — Independent candidate flash critique

Stage: candidate-critic (fresh context, same candidate family/account). Object: frozen `inputs/PROPOSAL.md` (sha256 `71ec2358…`) assessed against `inputs/BRIEF.md`, `inputs/THIN_PLAN.md`, `inputs/METHOD.md`. No evaluator feedback, rulings, sibling cases, prior candidate reasoning or campaign grades were used. All checks below are from independent re-acquisition of the cited public sources on 2026-10-03 via this case's admitted fetches; capture SHA-256 prefixes are given so the host ledger can match them. Normative keywords (MUST/SHOULD/MAY) are preserved as written by each source.

Tag discipline of this critique:
- **[SRC-OK]** — claim re-verified against the cited locator and its surrounding context.
- **[INFER]** — engineering inference (mine or the proposal's, labeled).
- **[CHOICE]** — product decision that could be made differently.
- **[CORRECTION]** — correction of the proposal, supported by cited evidence.
- **[UNSUPPORTED]** / **[UNVERIFIED]** — claim not derivable from, or not checkable against, the cited source.
- No proposed test or fixture was executed in this stage. Nothing here is an execution receipt; all fixture commentary concerns how the proposed checks are specified.

---

## 1. Verdict summary

| Item | Verdict | Key findings |
|---|---|---|
| Q1 (two components) | Pass | napari v0.9.2 and stackview claims verified at cited locators; recommendation is a labeled choice with a real tradeoff. |
| Q2 (format/version interpretation) | Pass | Every normative quote in §3 of the proposal matches NGFF 0.4 as served/pinned; declaration-vs-alignment distinction is supported. |
| Q3 (issue → fix → test) | Pass | #403 → PR #590 → `test_writer.py` chain verified end-to-end at cited commits; "not re-run" honestly stated. |
| B1 | Pass (minor gap) | Contract/version checks verified; one spec MUST missing from the reader gate (C3). |
| B2 | Partial | Interpretation and fallbacks verified, but fixture V1's expected cursor value is unsupported (C1) — the load-bearing numeric witness is wrong as specified. |
| B3 | Pass | Overlay chain and refusal states consistent with verified MUSTs; V3 wording needs a translation-aware refinement (C4). |
| B4 | Pass | Two implementations compared; chain investigated; observed vs inferred vs chosen separated correctly. |
| B5 | Partial | Steps, limits, and no-execution disclaimer present; V1 must be re-specified (C1/C2) before it can discriminate anything. |

All five obligations are substantively addressed; none is missing. The corrections in §4 are repair-scale, not structural. The proposal's seven unresolved leads remain open (§6); per the brief, they are permitted only because they are identified — this critique does not close any of them.

---

## 2. Source-by-source verification (S1–S8)

**S1 — OME-NGFF 0.4 spec. [SRC-OK]** Verified at both layers of the cited locator:
- Served page `https://ngff.openmicroscopy.org/0.4/` (capture `ca4780a3…`, 163,120 bytes, 2026-10-03): rendered body matches every quoted requirement below; page revision meta is `a4c68004fdb8a8d822367205dc12f9574a32ddf8`, matching the claimed tree.
- Source `index.md` at `ome/ngff-spec` tree `a4c68004…` (capture `fc39309d…`; commit exists per API capture `139ab053…`, dated 2026-09-14, "Prepend anchors 0.4 (#207)"): front matter is exactly `status: w3c/CG-FINAL`, `level: 1`, `date: 2023-05-25`, `version: 0.4`. The proposal's front-matter citation is accurate. Condition worth preserving when citing "the spec's date": the *served* page displays a build date ("1 October 2026") while the *front matter* date remains 2023-05-25 — the proposal's practice of citing front matter + tree is the correct one.
- Normative content verified verbatim: §1.3 RFC-2119 conventions and "comments MUST NOT be included in JSON objects"; §2 "Arrays MUST be defined and stored … as defined by … version 2 of the Zarr specification … OME-NGFF metadata MUST be stored as attributes"; §3.1 axes (name MUST; type SHOULD; unit SHOULD, UDUNITS-2 values; axes length MUST equal array dimensionality); §3.3 "transformations … are applied sequentially and in order"; §3.4 datasets paths "MUST be ordered from largest (i.e. highest resolution) to smallest", exactly one `scale` MUST with the "scaling factor between the current resolution and the first resolution … defaulting to 1.0" clause, MAY exactly one `translation`, translation "MUST be listed after `scale`", lengths MUST equal `axes` length, multiscales-level `coordinateTransformations` MAY and "are applied after them", `version` SHOULD ("current version is 0.4"), axes ordered time → channel/custom → space; §3.6 "Unlisted groups MAY be labels"; §3.7 image-label "MUST also contain `multiscales` … and the two 'datasets' series MUST have the same number of entries", colors SHOULD / properties MAY / source MAY (default `"../../"`) / version SHOULD; §2.1 layout-diagram comment "should be either the same as the corresponding dimension of the image, or `1`" — lowercase "should" inside an informative `<pre>` diagram, correctly treated by the proposal as non-normative.
- **[UNVERIFIED]** sub-claim only: "pinned by the `specifications/0.4` entry of `ome/ngff@main`" — `raw.githubusercontent.com/ome/ngff/main/specifications/0.4` returned 404 on 2026-10-03 (captures `d5558cd4…`). The load-bearing locator (tree + front matter + served content) is independently confirmed, so this does not affect any downstream claim, but the pin mechanism should be re-located or dropped from the citation.

**S2 — ome/ome-zarr-py issue #403. [SRC-OK]** API capture `2a813b45…`: title "`coordinateTransformations` generated for 0.4 are scale-only"; opened by d-v-b 2024-11-06T14:04:14Z; closed 2026-06-17T15:55:03Z, `state_reason: completed`. Body contains the quoted "incorrect for almost all multiscale pyramids" sentence verbatim and links exactly `ome_zarr/format.py` at commit `56f72b06d4912ba5156fe54f913d19df895b9e9e`, lines 260–271, with "Suggested fix: generate translation transforms". All proposal §4 issue claims verified.

**S3 — PR #590. [SRC-OK]** API capture `2b797ae5…`: "Include translations in multiscales" by will-moore; created 2026-06-10; merged 2026-06-17T15:55:02Z by jo-mueller; head `db3d40e8f4596e39a38cabb355f871aa29bce3e2`; 3 changed files (+51/−9); body opens "Fixes #403." and contains "Need to add/update tests...". Diff capture `f0aa7ce9…` confirms:
- `ome_zarr/format.py`: `scale0 = [1.0] * len(data_shape)`; per level `scale = [full / level …]`; `trans = [s / 2 - s0 / 2 for s, s0 in zip(scale, scale0)]`; appends `{"type": "scale", …}, {"type": "translation", …}`.
- `ome_zarr/classes/image.py`: `translations = [{d: (scale[d] / 2) - (scales[0][d] / 2) for d in image.axes} …]` plus a `Translation(...)` appended per pyramid level.
- `tests/test_writer.py`: `len(cts) == 1` → `len(cts) == 2` in `test_image_class_writer`, `test_write_image_current`, `test_write_image_dask`, `verify_label_data` (with `cts[0]["type"] == "scale"` retained); explicit expected scale+translation pairs computed from **scale values** (`tl = [s / 2 - s0 / 2 …]` over `sc = transf["scale"][…]`) in `test_writer`, `test_write_multiscale_labels`, `test_write_multiscale_labels_storage_options`, `test_two_label_images`.
All four + four test names cited by the proposal match exactly. **[SRC-OK]**, with the arithmetic consequence developed in §4 C1.

**S4 — `ome_zarr/format.py` @ master. [SRC-OK]** Capture `82b61d30…` (2026-10-03): `FormatV04` (`version "0.4"`, zarr_format 2 by inheritance), `FormatV05` (`version "0.5"`, `zarr_format == 3`), `detect_format`, `_get_metadata_version` (reads `multiscales[0].version`), `validate_coordinate_transformations` raising `ValueError` for: count ≠ levels, not exactly one `scale`, first transform not `scale`, scale length ≠ ndim, more than one `translation`, translation length ≠ ndim (and `TypeError` for non-numeric values) — exactly the conditions the proposal §5(5) lists; `generate_coordinate_transformations` on master is identical to the PR version (translation included); `init_store` uses `LocalStore(path, read_only=read_only)` with default mode `"r"`. Additional observed fact the proposal did not mention: `CurrentFormat = FormatV05` on master — relevant to the §6 pinning lead.

**S5 — napari v0.9.2. [SRC-OK]** Release API capture `8a9a7d1e…`: tag `v0.9.2`, published 2026-09-29T22:18:39Z ("Tue, Sep 29, 2026"); notes contain the quoted "fast, interactive, multi-dimensional image viewer for Python … built on top of Qt … vispy" text and the EffVer "**Meso** release" statement; highlights include "Add multiscale level extraction as a `LayerList` action (#9495)" — confirming the reference used in the proposal's lead 1.

**S6 — napari `docs/howtos/layers/image.md` @ main. [SRC-OK]** Capture `2897310c…`: "napari can support any type of multiscale image as long as the shapes are getting smaller each time" (verbatim); automatic level selection from zoom/viewport in 2D; `locked_data_level` property with `0`/`None` example, "available on both `Image` and `Labels` layers", "automatically reset to `None` when the layer's data is replaced"; interpolation list containing "`nearest` - default"; transform tool "limited to 2D viewer display mode". All §2(A) claims verified. Also present in the docs (not cited by the proposal): a resolution dropdown in the layer controls as an alternative to the property — harmless, but the pin-check lead should include it.

**S7 — napari `docs/guides/units.md` @ main. [SRC-OK]** Capture `ef71dd31…`: scale "used to transform each layer from its data coordinates into rendered world coordinates" (verbatim); Pint units with `'micrometer'`/`'um'`/`'µm'` equating to `'µm'`; "If you do not set units, napari assumes pixels"; scale bar "If you do not provide units, napari falls back to pixels", and "If napari cannot infer a consistent layer-list unit, the scale bar becomes dimensionless". **Condition the proposal dropped (C5):** "the scale bar label corresponds to the last displayed axis. If the displayed axes do not all have the same dimensionality, napari will warn that only the last displayed axis unit is being used."

**S8 — stackview README @ main. [SRC-OK]** Capture `cf7b0d7e…`: "Interactive image stack viewing in jupyter notebooks based on ipycanvas and ipywidgets"; `picker`; `curtain` with label images; `blend(image, label_image)`; "all functions above with n-dimensional data (since stackview 0.10.0)". The README documents inputs as NumPy-like arrays (examples load TIFFs); it documents **no** Zarr/NGFF reader, **no** multiscale/pyramid handling, and **no** physical-unit/scale-bar support — the proposal correctly phrases the disqualifiers as absences of documentation, not proven absences of capability. (Minor fairness note: `stackview.switch` does document switching among a list of arrays, a weak analog of level switching; it does not change the recommendation.)

---

## 3. Question-by-question assessment

**Q1 — component precedents. [Pass]** Two components, both independently discovered and version-pinned; the napari behaviors relied on (list-of-arrays multiscale, auto + `locked_data_level` level modes, `scale`/`translate`/`units` → world coordinates, Pint units, pixel fallback, `nearest` default interpolation, 2D-only transform tool) are each verified at S5–S7. The doc-capture-vs-pin caveat is correctly escalated in lead 1. The rejection of stackview rests on documented absences (S8), which is the right evidentiary standard.

**Q2 — what 0.4 requires/permits. [Pass]** All §3 normative statements verified against S1 (§2 above), including the conditions the proposal preserves: units optional-but-recommended (SHOULD), translation optional (MAY) and order-constrained (MUST after scale), group-level transforms (MAY, applied after), level ordering (MUST largest→smallest), consumer level choice unconstrained, multiple-multiscales pseudocode informative, label association path-based (MAY/SHOULD/MAY mix) with the dataset-count MUST. The declaration-vs-alignment distinction is properly supported: the spec declares index→physical mappings and imposes no obligation that content sits where transforms claim; the #403 history shows a mainstream writer emitting incomplete declarations. The proposed cursor formula `physical = scale_L·idx + translation_L` (then group-level) matches the spec's ordered-transform semantics [SRC-OK S1 §3.3/§3.4] composed with napari's scale+translate+units world coordinates [SRC-OK S7].

**Q3 — issue → fix → test chain. [Pass]** Verified end-to-end at exact locators (S2, S3, S4): issue text and code pointer; PR opening with "Fixes #403."; the translation formula in two implementation sites; eight named test functions changed as described; merge metadata exact. The proposal explicitly states the upstream suite was not re-run — correct, and consistent with the no-execution-receipt rule. The scoped lesson (per-level calibration is scale + translation; validate presence/order/arity/types; encode expected values) follows from verified facts [INFER, reasonable].

---

## 4. Supported corrections and counterexamples

**C1 — Fixture V1's expected value (−16.0, −16.0) µm is [UNSUPPORTED] and contradicts the formula it cites. [CORRECTION]**
The proposal (§7 V1) specifies: level0 128×128 with scale (0.5, 0.5) µm; level1 64×64 with "the PR-#590-style translation `(scale1/2 − scale0/2)`"; check: "cursor at array index (0,0) of level1 reads (−16.0, −16.0) µm per the proposed arithmetic."
The cited code operates on **scale values, not array shapes**:
- `format.py` (PR head `db3d40e…`, identical on master): `scale0 = [1.0]*ndim`, `scale = full/level`, `trans = s/2 − s0/2`. For 128→64 this emits level-1 metadata `scale [2.0, 2.0]`, `translation [0.5, 0.5]` (relative units). The PR's own `tests/test_writer.py` hunks compute expected translations as `[s / 2 - s0 / 2 …]` over `transf["scale"][…]` — scale values again.
- `classes/image.py` (same PR): `translation[d] = scale[d]/2 − scales[0][d]/2`. With absolute scales 0.5 µm (level 0) and 1.0 µm (level 1): `1.0/2 − 0.5/2 = +0.25 µm`.
Correct expectation for the described file: physical at level-1 index (0,0) = `1.0·0 + 0.25 µm = +0.25 µm` (or `+0.5` in relative units under the `format.py` convention) — **positive and small**, not −16.0 µm.
Counter-derivation: −16.0 µm is obtainable only as `(shape1/2 − shape0/2) · 0.5 µm = (32 − 64) · 0.5`, i.e., by substituting array shapes (64, 128) into a formula whose bound variables are scale values — the exact class of mistake the proposal's own §4 lesson warns against. The sign is also wrong: for any coarser level (`scale > scale0`) the cited formula yields translation ≥ 0. As specified, V1 would fail against a file written by the fixed upstream code — a false alarm — or would force the fixture author to write metadata no upstream version produces.

**C2 — V1 does not discriminate its stated assumption. [CORRECTION]**
V1 is labeled "unequal+shifted", but 64 = 128/2 exactly: under scale-only (the #403 defect) metadata the origin reads (0,0) µm, and under the corrected PR convention it reads (+0.25, +0.25) µm. The discriminating case for "missing per-level translation misregisters coarse levels" is a non-integer-multiple shape (e.g., 127×127, as V5 sketches), where scale-only metadata misplaces content by roughly half a coarse pixel while the declared grid stays unshifted. Re-specify V1 with the corrected expected value (+0.25 µm, explicitly tied to the pixel-center convention the upstream formula embodies) and make V5's odd-shape geometry the primary translation-discriminating fixture. V5's "~half a coarse pixel" is qualitative ("~") and acceptable as motivation, but if it ever gains a numeric expectation it needs the same convention discipline as V1.

**C3 — Reader gate misses one spec MUST that S4 does not enforce. [CORRECTION]**
S1 §3.4 requires dataset `coordinateTransformations` to "MUST only be of type `translation` or `scale`". `FormatV04.validate_coordinate_transformations` (S4) checks exactly-one-scale, first-is-scale, arity, ≤1 translation, and numeric types — it does **not** reject an additional transform of another type (e.g., `identity`). The §5(5) gate should therefore add "no types outside {scale, translation}" as its own check, citing S1 §3.4 rather than S4 alone. (The "translation after scale" property the proposal attributes to the gate is effectively enforced by S4 given first-must-be-scale plus ≤1 translation; no change needed there.)

**C4 — V3's "displayed pixel index changes by the scale ratio" is exact only at zero translation. [CORRECTION]**
With per-level translations present (which V1's own file has under the corrected convention), the invariant is the inverse map `idx_L = (world − translation_L)/scale_L`, not an index ratio. The world-coordinate-invariance half of V3 is sound (S7: shared world space); refine the index half to the exact inverse-transform formula so the fixture does not encode a special case.

**C5 — Carry S7's scale-bar conditions forward. [CORRECTION]**
S7 adds two conditions the proposal's B2 scale-bar rule omits: the scale-bar label "corresponds to the last displayed axis", and napari warns when displayed axes differ in dimensionality (only the last axis unit is used). For a 2D-only prototype this is benign, but the fallback/withheld behavior must state the condition to preserve the source's force.

**C6 — Locator detail [UNVERIFIED] (no downstream effect).**
The `specifications/0.4` pin entry of `ome/ngff@main` 404'd on re-check (see §2 S1). Everything else about S1's locator verified. Re-locate or drop the sub-citation.

**C7 — Observation for lead 5 (not an error). [INFER]**
Lead 5 (pixel-center vs index-origin) is treated as fully open, but the verified upstream formula is itself evidence: `trans = (scale − scale0)/2` is exactly the half-pixel shift implied by treating indices as pixel centers when averaging coarse pixels. For files written by the fixed ome-zarr-py (≥ the release identified in lead 4), the convention is thereby pinned; it remains a product choice for arbitrary files, but the lead can be narrowed rather than left symmetric.

---

## 5. Remaining fixture spot-checks (V2–V8)

- **V2 (units absent → px readout, scale bar withheld/pixel-labeled):** consistent with S1 §3.1 (unit SHOULD) and S7 fallbacks. [SRC-OK]
- **V4 (label 1 level vs image 2 → withheld citing the MUST):** matches S1 §3.7 MUST. [SRC-OK]
- **V6 (label/image transform mismatch → withheld):** sound as [INFER]; the spec has no cross-check, so refusal is a product choice correctly labeled (§6-B3, lead 6's tolerance still open).
- **V7 (unsupported inputs → named refusals):** matches §5 checks verified against S1/S4 (v3/0.5 detection via `zarr.json`/`FormatV05.zarr_format == 3`; ndim/axes MUSTs). [SRC-OK]
- **V8 (no labels → disabled control with absence reason):** matches S1 §3.6. [SRC-OK]
- Fixture expected values are proposed, not executed; nothing in this critique asserts any test result.

---

## 6. Unresolved obligations and open leads (explicit)

No obligation is closed by a checklist — status of what remains consequential:
1. napari `locked_data_level` presence in the **pinned wheel** (lead 1) — Q1/B3 behavior and V3 depend on docs captured from `main`; unresolved until the pinned version is checked. (The v0.9.2 release notes confirm active multiscale work, #9495, but not this property's presence.)
2. Cursor world-coordinate accessor for the embedded viewer (lead 2) — B2's implementation surface still unpinned.
3. Group-level (multiscales-level) transform handling in the chosen viewer path (lead 3) — spec-verified as MAY + "applied after"; the proposal's plan to compose in its own layer is the right mitigation, fixture still to be added.
4. Release of ome-zarr-py first shipping PR #590 (lead 4) — still unidentified; the correction is only effective above it. New supporting fact from this critique: master's `CurrentFormat = FormatV05` (S4), so "master behavior" and "default writer version" must not be conflated when pinning.
5. Pixel-center vs index-origin convention (lead 5) — narrowed by C7 but still a required product decision.
6. Label-overlay tolerance and no-transform fallback constants (lead 6) — open; V5/V6 depend on them.
7. Packaging weight of the napari shell (lead 7) — open; feasibility risk for the B4 recommendation.
8. New from this critique: re-specify V1 (C1/C2), add the {scale, translation}-only gate check (C3), refine V3's index check (C4), carry the S7 scale-bar conditions (C5), and re-locate or drop the `specifications/0.4` pin citation (C6).

B5's requirement to identify unresolved consequential leads is met by the proposal's leads file; the leads are genuine and remain unresolved — they block a whole-case pass only if left unaddressed at the correction stage, as the brief specifies.

---

## 7. Claim-type separation (audit of the proposal's tagging)

- **[SRC] claims:** every checked quote and metadata assertion in §1–§6 verified verbatim or near-verbatim at its cited version, with conditions/exceptions preserved (units SHOULD, translation MAY + order MUST, group-level MAY "applied after", informative pseudocode and layout note correctly downgraded). One locator sub-claim unverified (C6); no misquoted normative text found.
- **[INFER] claims:** the declaration-vs-alignment distinction, per-level readout necessity, association-vs-registration gap, and the §4 lesson are all supported inferences from verified facts; none overstates a source.
- **[CHOICE] claims:** napari embedding, refusal-state wording, auto+manual level UX, overlay tolerance scheme — labeled as choices; the napari tradeoff (Qt+vispy+Pint weight vs tested behaviors) is concrete and fair.
- **[CORRECTION] claims (proposal vs thin plan):** per-level calibration replacing single-image calibration is supported by the verified chain (S1 §3.4 + S2/S3/S4).
- **Defects found:** one unsupported numeric witness (V1, C1) and the minor items C2–C6. Nothing found that overturns the recommendation, the format interpretation, or the issue→fix→test history.
