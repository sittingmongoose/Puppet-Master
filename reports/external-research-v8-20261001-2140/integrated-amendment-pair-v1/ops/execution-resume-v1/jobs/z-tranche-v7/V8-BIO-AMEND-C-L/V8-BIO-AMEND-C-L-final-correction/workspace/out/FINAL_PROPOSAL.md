# V8-BIO-AMEND-C-L — FINAL_PROPOSAL (final correction stage)

**Case stage:** V8-BIO-AMEND-C-L-final-correction (fresh context, same case/candidate family/account). Pipeline: research → proposal → independent candidate critique → this final correction.
**Supersedes:** frozen `inputs/PROPOSAL.md` (sha256 `71ec2358…`). It resolves every critique point in `inputs/CRITIQUE.md` (sha256 `0d4b43c1…`, C1–C7). This document is the complete usable corrected research-to-plan artifact; no content is incorporated by reference from the frozen proposal without restatement.
**Method:** `inputs/METHOD.md` (simple-complete-control). No evaluator rulings, sibling discoveries, earlier reasoning histories, or prior campaign outputs were used. Sources used to resolve the critique: this case's prior raw public captures plus fresh allowed public primary-source fetches made in this stage (§2, each with SHA-256).

**Claim tags used throughout:**
- **[SRC]** — fact asserted by a cited public primary source, with exact version/locator; RFC-2119 keywords (MUST/SHOULD/MAY) preserved as written, conditions and exceptions carried with them.
- **[INFER]** — engineering inference from source facts; not stated by any source.
- **[CHOICE]** — product decision of this proposal; could be made differently.
- **[CORRECTION]** — supported correction of the earlier proposal or the thin plan, backed by cited evidence (§1).

**Validation status:** every test/fixture in §8 is *proposed and not executed*. No execution receipt exists for this or any prior stage of this case; nothing here asserts that a proposed test ran or passed. Arithmetic shown in fixtures is *proposed expected values derived on paper* from captured source text, not computed results of a run. The host records captures/histories/hashes/cost mechanically.

---

## 1. Correction ledger — every critique point, its disposition, and why

The independent critique found one unsupported numeric witness and six smaller items. All are accepted; none is rejected. Dispositions and the evidence that supports each:

| # | Critique finding | Disposition | Supporting evidence (locator + capture) |
|---|---|---|---|
| C1 | Fixture V1's expected cursor value (−16.0, −16.0) µm was [UNSUPPORTED]: the cited upstream formula binds **scale values**, not array shapes; correct expectation is **+0.25 µm**. | **ACCEPTED — fixture re-specified (§8 V1).** Error source identified: `−16.0 = (shape1/2 − shape0/2)·s0 = (32−64)·0.5`, i.e. shapes substituted into a formula whose variables are scales — the exact mistake class the proposal's own §4 lesson warns against. | PR #590 diff, head `db3d40e8…` (this-stage capture sha256 `f0aa7ce9…`): `format.py` uses `scale0 = [1.0]*ndim`, `scale = full/level` (**scale values**), `trans = s/2 − s0/2`; `classes/image.py` uses `(scale[d]/2) − (scales[0][d]/2)` over absolute scales; `tests/test_writer.py` computes expected translations as `tl = [s/2 − s0/2 …]` over `transf["scale"]`. Also identical on `master` (this-stage capture `82b61d30…`). With absolute scales 0.5 µm (level 0) and 1.0 µm (level 1): `1.0/2 − 0.5/2 = +0.25 µm`. |
| C2 | V1 (64 = 128/2 exactly) does not discriminate the stated geometric assumption; the odd-shape case is the real translation discriminator. | **ACCEPTED — V1 re-scoped** to what it genuinely discriminates (corrected metadata +0.25 µm vs scale-only metadata 0 µm at the same index), and **V5 promoted to primary discriminator** for the undeclared-origin failure class, now with a convention-disciplined expected value (§8 V5). | Same captures as C1; arithmetic in §8 V5. |
| C3 | Reader gate missed one spec MUST: dataset `coordinateTransformations` "MUST only be of type `translation` or `scale`"; `FormatV04.validate_coordinate_transformations` does **not** reject foreign types (e.g. an extra `identity`). | **ACCEPTED — §6 gate extended** with the foreign-type check, cited to S1 §"multiscales" directly (not to S4 alone). | S1 source `index.md` @ tree `a4c68004…`, capture `fc39309d…` (this stage): "The transformation MUST only be of type `translation` or `scale`." S1 §"coordinateTransformations" table shows the general transform vocabulary also contains `identity` (and `path` forms), which the multiscales restriction excludes. `ome_zarr/format.py@master`, capture `82b61d30…` (this stage): `validate_coordinate_transformations` checks count, exactly-one-`scale`, first-is-`scale`, arity, ≤1 `translation`, numeric types — and nothing about foreign types, so an additional `identity` entry passes upstream validation. The gate must enforce the MUST itself. |
| C4 | V3's "displayed pixel index changes by the scale ratio" holds only at zero translation; the exact invariant is the inverse map. | **ACCEPTED — V3 index check replaced** with `idx_L = (world − translation_L)/scale_L`, plus a worked example showing the ratio form fails when translations are present (§8 V3). | Follows from S1 §"coordinateTransformations" (transforms "are applied sequentially and in order"; scale then translation) and S7 world-coordinate composition — captured this stage (`fc39309d…`, `ef71dd31…`). |
| C5 | S7's scale-bar conditions were dropped: the label "corresponds to the last displayed axis", and napari warns when displayed axes differ in dimensionality. | **ACCEPTED — conditions carried verbatim into §7 B2** fallback/withheld behavior. | `napari/docs@main` `docs/guides/units.md`, this-stage capture `ef71dd31…` (identical SHA-256 to the critique's capture): both conditions verified verbatim. |
| C6 | The `specifications/0.4` pin sub-citation 404'd on re-check; re-locate or drop. | **RESOLVED by re-location (not dropped) with new primary evidence.** `ome/ngff@main` pins the 0.4 spec via a **git submodule**: the GitHub contents API lists `specifications/0.4` (type file/gitlink, sha `a4c68004fdb8a8d822367205dc12f9574a32ddf8`, capture `dcd3b313…`), and `.gitmodules` declares submodule path `specifications/0.4` → `https://github.com/ome/ngff-spec`, branch `0.4` (capture `55a2e54c…`). The gitlink tree sha is exactly the tree whose `index.md` carries front matter `version: 0.4`, `date: 2023-05-25`, `status: w3c/CG-FINAL` (capture `fc39309d…`). The critic's 404 is explained: a raw-content URL over a gitlink path has no raw file to serve. Corrected citation form in §2/S1. | This-stage captures `dcd3b313…` (contents API), `55a2e54c…` (`.gitmodules`), `fc39309d…` (`index.md`), `ca4780a3…` (served page, revision meta `a4c68004…`). |
| C7 | Lead 5 (pixel-center vs index-origin) can be narrowed: the verified upstream formula `trans = (scale − scale0)/2` is itself evidence of the pixel-center convention. | **ACCEPTED (narrowing) — product decision made:** this prototype **adopts the pixel-center convention** (index *i* denotes the center of pixel *i*) as a [CHOICE], consistent with fixed upstream writers; lead 5 is narrowed accordingly (§9, lead 5). | Inference [INFER] from verified code (`f0aa7ce9…`, `82b61d30…`): for a 2× pyramid the offset `(s1−s0)/2` equals exactly the mean-of-fine-pixel-centers shift of area-averaged blocks, e.g. 0.5 µm→1.0 µm gives +0.25 µm. The convention remains a product choice for arbitrary files; the narrowing is that files written by fixed ome-zarr-py embed it. |

Also preserved from the critique (no plan change): S1's informative layout note "should be either the same as the corresponding dimension of the image, or `1`" stays downgraded (lowercase "should" inside an informative `<pre>` diagram — non-normative); `stackview.switch` (switching among a list of arrays, S8 capture `cf7b0d7e…`) is acknowledged as a weak analog of level switching — it does not change the component recommendation.

---

## 2. Primary sources — exact locators and correction-stage captures

All eight sources were (re-)captured in this stage on 2026-10-03 via this case's admitted public fetches; SHA-256 prefixes are given so the host ledger can match them. `…` marks the full hash recorded by the host.

| ID | Source & exact locator | Correction-stage capture (sha256) | Used for |
|----|------------------------|-----------------------------------|----------|
| S1 | OME-NGFF specification **version 0.4**. Source `index.md` at git tree `a4c68004fdb8a8d822367205dc12f9574a32ddf8` of `ome/ngff-spec` (front matter: `status: w3c/CG-FINAL`, `level: 1`, `date: 2023-05-25`, `version: 0.4`); published at https://ngff.openmicroscopy.org/0.4/ (served page revision meta `a4c68004…`; the served page displays a later build date, so citations use front matter + tree, not the build date). **Pin (corrected per C6):** `ome/ngff@main` path `specifications/0.4` is a git submodule of `ome/ngff-spec` (branch `0.4`), gitlink tree `a4c68004…`. | `index.md`: `fc39309d…`; served page: `ca4780a3…`; contents API (gitlink): `dcd3b313…`; `.gitmodules`: `55a2e54c…` | Q2, B1–B3 normative content |
| S2 | `ome/ome-zarr-py` **issue #403** — "`coordinateTransformations` generated for 0.4 are scale-only", opened by d-v-b 2024-11-06T14:04:14Z, closed 2026-06-17T15:55:03Z, `state_reason: completed`; body links `ome_zarr/format.py` at commit `56f72b06d4912ba5156fe54f913d19df895b9e9e` lines 260–271 and says "Suggested fix: generate translation transforms". | API JSON: `2a813b45…` | Q3, B4 |
| S3 | `ome/ome-zarr-py` **PR #590** — "Include translations in multiscales" (will-moore), opens "Fixes #403.", merged 2026-06-17T15:55:02Z, head `db3d40e8f4596e39a38cabb355f871aa29bce3e2`, files `ome_zarr/format.py`, `ome_zarr/classes/image.py`, `tests/test_writer.py`. | diff: `f0aa7ce9…` | Q3, B4 |
| S4 | `ome/ome-zarr-py`, `ome_zarr/format.py` @ `master`, captured 2026-10-03: `FormatV04` (`version "0.4"`, `zarr_format 2`), `FormatV05` (`version "0.5"`, `zarr_format == 3`), **`CurrentFormat = FormatV05`**, `detect_format`, `_get_metadata_version` (reads `multiscales[0].version`), `validate_coordinate_transformations` (conditions enumerated under C3), post-fix `generate_coordinate_transformations` (identical to S3's), `init_store(path, mode="r") → LocalStore(path, read_only=read_only)`. | `82b61d30…` | B1, B3, §1 C3 |
| S5 | `napari/napari` **release v0.9.2**, published 2026-09-29T22:18:39Z: "napari is a fast, interactive, multi-dimensional image viewer for Python … built on top of Qt … vispy …"; EffVer "**Meso**" release; highlight "Add multiscale level extraction as a `LayerList` action (#9495)". Wheel asset `napari-0.9.2-py3-none-any.whl` (3,715,060 bytes, sha256 `a67f7add…`) exists — the pin-check object for §9 lead 1. | API JSON: `852916a1…` | Q1, B4 |
| S6 | napari documentation, `napari/docs@main`, `docs/howtos/layers/image.md` (captured 2026-10-03): multiscale = list of arrays, "napari can support any type of multiscale image as long as the shapes are getting smaller each time"; automatic level selection from zoom/viewport in 2D; `locked_data_level` property (`0`/`None` example) **or the resolution dropdown in the layer controls**; lock "automatically reset to `None` when the layer's data is replaced"; "available on both `Image` and `Labels` layers"; interpolation dropdown lists "`nearest` - default"; transform tool "limited to 2D viewer display mode". | `2897310c…` | Q1, B3 |
| S7 | napari documentation, `napari/docs@main`, `docs/guides/units.md` (captured 2026-10-03): scale "is used to transform each layer from its data coordinates into rendered world coordinates"; Pint units (`'micrometer'`/`'um'`/`'µm'` equate); "If you do not set units, napari assumes pixels"; scale bar falls back to pixels; "If napari cannot infer a consistent layer-list unit, the scale bar becomes dimensionless"; **and (per C5) "the scale bar label corresponds to the last displayed axis. If the displayed axes do not all have the same dimensionality, napari will warn that only the last displayed axis unit is being used."** | `ef71dd31…` | B2 |
| S8 | `haesleinhuepf/stackview`, `README.md` @ `main` (captured 2026-10-03): "Interactive image stack viewing in jupyter notebooks based on ipycanvas and ipywidgets"; `picker`; `curtain` (works with label images); `blend(image, label_image)`; n-D "since stackview 0.10.0"; `switch` over a list/dict of images. Inputs documented as NumPy-like arrays (examples load TIFFs); **no** documented Zarr/NGFF reader, **no** multiscale/pyramid handling, **no** physical-unit/scale-bar support. | `cf7b0d7e…` | Q1, B4 |

Evidence standard for S8's disqualifiers: documented absences in the README, not proven absences of capability [SRC, absence-of-documentation].

---

## 3. Q1 — Two existing components and the version-specific justification (B4 part 1)

**Compared candidates (both discovered for this case, no evaluator list):**

**(A) napari v0.9.2, embedded read-only in a small desktop Qt shell. [SRC S5,S6,S7]**
- Image layer accepts a *list of arrays* as a multiscale pyramid; any downsampling scheme works as long as shapes shrink (S6).
- Level choice in 2D is automatic from zoom/viewport; `locked_data_level` (property or layer-controls resolution dropdown) forces one level, is available on `Image` and `Labels`, and resets to automatic when data is replaced (S6). *Condition:* docs captured from `docs@main`, so presence in the pinned v0.9.2 wheel must be checked before implementation (§9 lead 1).
- Every layer carries `scale`, `translate`, `units`; scale transforms data coordinates into rendered world coordinates; units are Pint units; without units napari assumes pixels; scale-bar fallbacks as in S7 including the C5 conditions (S7).
- Image interpolation choices include `nearest` as the documented default (S6). Constraint: the interactive transform tool is 2D-only (S6) — irrelevant to this 2D-only prototype.

**(B) stackview (Jupyter-based interactive viewer). [SRC S8]**
- Provides intensity `picker`, image/label `curtain`, `blend(image, label_image)`, n-D sliders since 0.10.0, and `switch` over a list of arrays (a weak analog of level switching) (S8).
- Disqualifying documented absences: no Zarr/NGFF reader, no pyramid handling, no physical-unit/scale-bar support, and its widgets are notebook (`ipywidgets`) components rather than an embeddable desktop window (S8). [INFER] All four thin-plan functions (reader, calibration, level switching, overlay) would have to be built around it.

**Recommendation [CHOICE]:** napari v0.9.2 embedded as a read-only Qt widget, driven by this prototype's own thin NGFF-0.4 interpretation layer (not napari's reader plugins); stackview rejected for the documented absences above.

**Concrete tradeoff [CHOICE]:** napari pulls in Qt + vispy + Pint — heavy for a "small" prototype — but supplies exactly the three risky behaviors the product needs: per-level world transforms with units, two-mode level switching (auto + lock), and a same-world-space labels overlay with documented `nearest` interpolation. A hand-rolled matplotlib/Qt canvas is lighter but would re-implement calibrated overlays and level management with no upstream test history behind them (S6–S8). Mitigation: embed only `Viewer` + the image layer + optional labels layer; no plugin manager; no editing affordances constructed; packaging feasibility checked first (§9 lead 7).

---

## 4. Q2 — What OME-NGFF 0.4 requires/permits for this input

All keywords are the spec's own RFC-2119 usage (S1 §"Document conventions"; JSON comments "MUST NOT be included in JSON objects"). Section names refer to S1.

**(a) Axes and calibration.**
- A `multiscales` dictionary MUST contain `axes`; axes length MUST equal the arrays' dimensionality (between 2 and 5); entries MUST be ordered time → channel/custom → space (S1 §"multiscales").
- Each axis MUST contain `name` (values MUST be unique across `name` fields); SHOULD contain `type`; SHOULD contain `unit`, value SHOULD be a UDUNITS-2 string (S1 §"axes"). **Units are optional but recommended: a conforming file may carry no units at all. [CHOICE]** Absent `unit` ⇒ pixel-unit display ("px") and withheld/labeled scale bar (§7).
- Each `datasets` entry MUST contain `coordinateTransformations`; they "MUST only be of type `translation` or `scale`"; they MUST contain exactly one `scale` ("If scaling information is not available or applicable for one of the axes, the value MUST express the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0…" — S1's wording continues "…if there is no downsampling along the axis"); MAY contain exactly one `translation`; "If `translation` is given it MUST be listed after `scale` to ensure that it is given in physical coordinates"; `scale`/`translation` lengths MUST equal the `axes` length (S1 §"multiscales"). The spec states its rationale: "The requirements (only `scale` and `translation`, restrictions on order) are in place to provide a simple mapping from data coordinates to physical coordinates while being compatible with the general transformation spec" (S1 §"multiscales") — the general §"coordinateTransformations" vocabulary is larger (`identity`, `path`-based forms), which is exactly why the foreign-type gate check (§6, C3) is needed.
- A multiscales-level `coordinateTransformations` MAY exist, "MUST follow the same rules about allowed types, order, etc." and "are applied after them" (S1 §"multiscales").
- **Metadata declaration vs. alignment guarantee [SRC→INFER]:** the spec *declares* an ordered mapping from data indices to physical coordinates; it contains no statement that pixel content sits where the transforms claim, and it does not force writers to emit per-level translations when downsampling shifts content. The traced history (§5) shows a mainstream writer emitted scale-only metadata that its reporter called "incorrect for almost all multiscale pyramids" (S2). So transforms are per-file declarations to be read, validated, and cross-checked — never an alignment guarantee. **[CORRECTION]** The thin plan treated calibration as a single per-image property; corrected: calibration is per-level (scale + optional translation, ordered), plus optional multiscales-level transforms applied after.

**(b) Physical cursor coordinates.**
- [SRC] For a cursor over level *L*, axis *i*: apply the dataset's `scale` then `translation` (then any multiscales-level transform): `physical_i = scale_L[i]·index_i + translation_L[i]` (+ group-level effect), using axis *i*'s `unit` when present (S1; S7 for napari's composition of layer `scale`+`translate`+`units` into world coordinates).
- [CHOICE] The readout shows world coordinates with the axis unit; absent units ⇒ "px" readout and the scale bar is pixel-labeled or hidden with a visible reason (napari's own fallback: pixels / dimensionless scale bar, S7).
- [INFER] Because translations are frequently absent in the wild (S2/S3 history), the readout must be computed per displayed level from that level's transforms, never from level 0 alone.
- **Convention [CHOICE, narrowed per C7]:** index *i* denotes the **center of pixel *i*** (pixel-center convention), consistent with the fixed upstream writer's formula (§5). Surfaced in a tooltip; kept in one code path. Files written by other tools may use a different convention — see §9 lead 5.

**(c) Resolution switching.**
- [SRC] `datasets[].path`s "MUST be ordered from largest (i.e. highest resolution) to smallest" (S1 §"multiscales"). How a *consumer* picks a level is unconstrained by the spec. The Python pseudocode for choosing among multiple `multiscales` entries (by name, first as fallback) is an informative example, not a MUST (S1).
- [SRC] napari auto-selects the level from zoom/viewport in 2D and supports `locked_data_level` (or the layer-controls resolution dropdown) to force a level (S6). **[CHOICE]** The prototype exposes both: an "auto (zoom)" toggle and an explicit two-button level selector backed by `locked_data_level`, so inspection is deterministic and testable.

**(d) Image/label association.**
- [SRC] An image group may contain a `labels` group whose `.zattrs` lists label paths; "Unlisted groups MAY be labels" (S1 §"labels").
- [SRC] `image-label` groups "MUST also contain `multiscales` metadata and the two 'datasets' series MUST have the same number of entries"; `colors` SHOULD (with strict MUSTs on the color-object fields it contains), `properties` MAY, `source` MAY (inner `image` MAY, default `"../../"`), `version` SHOULD (S1 §"image-label").
- [SRC] The informative layout diagram notes label dimensions "should be either the same as the corresponding dimension of the image, or `1`" — lowercase "should" inside an informative `<pre>` diagram: non-normative commentary (S1 §"Images"), correctly downgraded.
- **Association vs. alignment [INFER]:** the spec gives path-based association and a level-count equality MUST, but no cross-check that the label's per-level `coordinateTransformations` equal the image's, and no registration guarantee between the label grid and the image grid. Overlay justification must therefore be earned per file (§7 checks), matching the brief's justify-or-withhold requirement.

---

## 5. Q3 — Real issue → fix → test chain (B4 part 2)

**Issue [SRC S2]:** `ome/ome-zarr-py` #403, "`coordinateTransformations` generated for 0.4 are scale-only" (opened 2024-11-06 by d-v-b; closed 2026-06-17, `state_reason: completed`). Reporter: "The most common methods of image downsampling result in a translation of the downsampled image, but this code for generating `coordinateTransformations` metadata only returns scale transformations, which will be incorrect for almost all multiscale pyramids," linking `ome_zarr/format.py` at commit `56f72b06d4912ba5156fe54f913d19df895b9e9e`, lines 260–271. "Suggested fix: generate translation transforms."

**Fix [SRC S3]:** PR #590 "Include translations in multiscales" (will-moore), body opens "Fixes #403.", merged 2026-06-17T15:55:02Z, head `db3d40e8…`. The diff (capture `f0aa7ce9…`):
- `ome_zarr/format.py` · `generate_coordinate_transformations`: per level appends `{"type": "scale", "scale": scale}` **and** `{"type": "translation", "translation": trans}` with `scale = [full/level for full, level in zip(data_shape, shape)]`, `scale0 = [1.0]*ndim`, `trans = [s/2 − s0/2 for s, s0 in zip(scale, scale0)]` — i.e. **relative-scale convention** (`scale0 = 1.0`).
- `ome_zarr/classes/image.py`: computes `translations = [{d: (scale[d]/2) − (scales[0][d]/2) for d in image.axes} for scale in scales]` and appends a `Translation` per pyramid level — the **absolute-scale convention**, same formula shape.
- The same translation-emitting `generate_coordinate_transformations` ships on `master` today, inside `FormatV04` (S4, capture `82b61d30…`).

**Tests [SRC S3]:** `tests/test_writer.py` in the same PR: assertions tightened from `len(cts) == 1` to `len(cts) == 2` (with `cts[0]["type"] == "scale"` retained) in `test_image_class_writer`, `test_write_image_current`, `test_write_image_dask`, `verify_label_data`; explicit expected `scale`+`translation` pairs computed from **scale values** (`tl = [s/2 − s0/2 …]` over `sc = transf["scale"][…]`, against `scale0` from level 0's scale) in `test_writer`, `test_write_multiscale_labels`, `test_write_multiscale_labels_storage_options`, `test_two_label_images`. The PR merged with these test changes. **This stage did not re-run the upstream suite** — no execution receipt; the statement is limited to what the merged diff contains.

**Scoped lesson [INFER]:** pyramid-level calibration is two-part (scale **and** per-level translation); assuming scale-only silently misplaces coarser levels relative to how area-averaging writers actually positioned their content. Consequence: conformance checks must assert presence, order (scale first), arity (== ndim), allowed types (only `scale`/`translation` — §6), and numeric types of both transform kinds; regression fixtures must encode expected per-level transform *values*, not mere presence (§8). **[CORRECTION]** Thin-plan step 2 is revised: interpretation is per-level, and the reader must not synthesize an alignment it cannot justify from the file.

---

## 6. B1 — Local input contract, version/support checks, read-only boundary

**Input contract [CHOICE, built on SRC S1,S4]:** exactly one local path to a Zarr **v2** group (`.zgroup` + `.zattrs`; "Arrays MUST be defined and stored … as defined by version 2 of the Zarr specification … OME-NGFF metadata MUST be stored as attributes in the corresponding Zarr groups", S1 §"On-disk layout"). Accepted shape: `multiscales[0].datasets` with **exactly two** entries (brief condition); more/fewer ⇒ named unsupported state, not an error-dialog storm. Store opened read-only, mirroring `Format.init_store`'s default mode `"r"` → `LocalStore(path, read_only=read_only)` (S4). No write/rename/edit call anywhere in the process; editing affordances are not constructed.

**Version/support checks, each naming its refusal state:**
1. Declared version read from `multiscales[0].version` (S1 §"multiscales": `version` SHOULD, "current version is 0.4"; S4 `_get_metadata_version`).
2. `version == "0.4"` ⇒ full support (designed path).
3. Version key absent ⇒ visible warning; interpreted as 0.4 (absence of a SHOULD field is conforming); window labeled "version undeclared; interpreted as 0.4". [CHOICE]
4. Zarr v3 storage (`zarr.json` present, no `.zgroup`; NGFF 0.5, S4 `FormatV05.zarr_format == 3`) ⇒ refusal "unsupported input: Zarr v3 / NGFF 0.5 not in prototype scope", observed version shown.
5. Per-dataset transform validation **before display**, implementing the S1 MUSTs (S1 §"multiscales"), of which S4's `validate_coordinate_transformations` enforces all but the last two (capture `82b61d30…`):
   - count of transform lists == number of levels (S4 raises `ValueError`);
   - exactly one `scale`, and it is first (S4; S1 "MUST be listed after `scale`" for translation);
   - `scale` length == ndim; at most one `translation`, length == ndim (S4; S1 length MUSTs);
   - all `scale`/`translation` values numeric (S4 raises `TypeError`);
   - **every transform entry's `type` ∈ {`scale`, `translation`}** — the C3 addition, cited to S1 §"multiscales" ("The transformation MUST only be of type `translation` or `scale`"); S4's validator does **not** enforce this, so the gate implements the MUST itself. Any violation ⇒ the file is non-conforming ⇒ named refusal state; the level is not displayed.
6. Dimensionality outside 2–5, or `axes` length ≠ array ndim, or axes-order/type violations ⇒ unsupported state (S1 MUSTs).

**Absent optional labels:** no `labels` group/list (or empty list) ⇒ the overlay control renders **disabled** with reason "this dataset declares no labels" — an absence, not an error (S1 §"labels"; "Unlisted groups MAY be labels").

---

## 7. B2/B3 — Calibrated cursor & scale indication; resolution switching & optional label overlay

**B2 — physical cursor + calibrated display [SRC S1,S7 + INFER]:**
- Per displayed level *L*, axis *i*: `world_i = scale_L[i]·idx_i + translation_L[i]`, then any multiscales-level transform applied after (order normative, S1). Readout: `y=…, x=… <unit>`, unit from `axes[i].unit` mapped to Pint names (napari accepts `micrometer`/`um`/`µm`, S7).
- Conditions/exceptions preserved: `translation` exists only MAY-wise; group-level transforms MAY exist and apply after; `unit` is SHOULD-wise present. Fallbacks/withheld behavior: no `unit` ⇒ "px" readout; scale bar pixel-labeled **or** hidden with tooltip "no axis units declared in .zattrs" (S7 fallback: pixels; dimensionless when no consistent layer-list unit). **Carried per C5 [SRC S7]:** the scale-bar label corresponds to the **last displayed axis**, and napari warns when displayed axes differ in dimensionality (only the last axis unit used) — benign in this 2D-only prototype but stated to preserve the source's force. Missing/non-conforming `coordinateTransformations` ⇒ level not displayed; refusal state per §6(5).
- Scale indication [CHOICE]: the unit-aware napari scale bar is shown only under the same condition as the unit readout (S7: unit-aware only with consistent layer units).
- Convention [CHOICE, C7]: pixel-center convention (§4b), documented in a tooltip.

**B3 — level switching + optional categorical overlay [SRC S1,S6 + CHOICE]:**
- Switching: two buttons (level 0 / level 1) plus "auto (zoom)" toggle; auto = napari default selection; manual = `locked_data_level` (S6). A level switch never changes cursor *world* coordinates (world is shared across layers, S7), so the readout is continuous across switches — the discriminating behavior of V3 (§8).
- Overlay justification chain, checked in order; each failed check names itself in the UI:
  1. `labels` group lists a path; target group has `image-label` + `multiscales` (MUST, S1 §"image-label").
  2. `source.image`, if present, resolves to the displayed image (MAY, default `"../../"`, S1).
  3. Label `datasets` count == image `datasets` count (MUST, S1 §"image-label").
  4. Label `axes` order/length compatible with the image's [INFER from S1 axes MUSTs].
  5. **[CHOICE]** Per level: if the label level declares `coordinateTransformations`, they must match the image level's scale/translation within a fixed product tolerance; if the label declares none, fall back to the shared-pixel-grid assumption the spec's informative layout note permits (dims equal or `1` — non-normative) and label the assumption in the UI. Tolerance and fallback constants: §9 lead 6.
- Sampling: nearest-neighbor only for the label overlay (categorical integrity; `nearest` is the documented default interpolation, S6); never resampled with smoothing.
- **Actionable refusal state [CHOICE]:** the overlay panel shows "OVERLAY WITHHELD — <check id + one-line reason>", the overlay layer is not added, and the image stays inspectable. Examples: "WITHHELD: label has 1 dataset level, image has 2 (spec MUST: same number of entries)"; "WITHHELD: label level-1 translation ≠ image level-1 translation; alignment unverifiable". This implements the brief's justify-or-withhold requirement.

---

## 8. B5 — Revised concrete steps (replacing the thin plan) and discriminating validation

**Revised steps**
1. **Contract & version gate (B1):** implement §6 checks 1–6 including the C3 foreign-type check; refusal states render in-window with machine-readable reason codes.
2. **Per-level interpretation (B2):** parse per-dataset + multiscales-level transforms in normative order; expose per-level scale/translation/unit to the viewer (§7 B2), replacing the thin plan's single "calibration" notion **[CORRECTION per §5]**.
3. **Level switching (B3):** auto + locked modes (S6), shared world coordinates across levels.
4. **Overlay gate (B3):** the five-check chain of §7 B3 with named refusal states; nearest-neighbor sampling only.
5. **Validation & visible limits** (below). All fixtures synthetic, local, ≤ two levels; every proposed test asserts world-coordinate invariants, not pixels.

**Discriminating fixtures & proposed checks — all PROPOSED, NONE EXECUTED (no execution receipt exists anywhere in this case):**

- **V1 "shifted, exact 2×, units present" (corrected per C1/C2):** level0 128×128, scale (0.5, 0.5) µm/px, translation (0, 0); level1 64×64, scale (1.0, 1.0) µm/px, translation (+0.25, +0.25) µm (the upstream `classes/image.py` convention: `(s1−s0)/2 = (1.0−0.5)/2`); units µm. *Check:* cursor at level-1 array index (0,0) reads **(+0.25, +0.25) µm** under the pixel-center convention; scale bar shows µm. Discriminates corrected-writer metadata (+0.25 µm) from pre-fix scale-only metadata (0 µm) at the same index. *The earlier −16.0 µm expectation was withdrawn (C1): it substituted array shapes into a formula whose bound variables are scale values.*
- **V2 "units absent":** V1's geometry, no `unit` fields. *Check:* readout in px; physical scale bar withheld or pixel-labeled with the stated reason (S1 SHOULD; S7 fallbacks).
- **V3 "switch continuity" (corrected per C4):** with V1's input, hover a fixed physical point, switch level 0↔1. *Checks:* (i) reported world coordinates invariant; (ii) displayed pixel index follows the **inverse transform** `idx_L = (world − translation_L)/scale_L`. Worked example: world x = 16.25 µm ⇒ level0 idx = (16.25 − 0)/0.5 = **32.5**; level1 idx = (16.25 − 0.25)/1.0 = **16.0** — the naive ratio 32.5/2 = 16.25 ≠ 16.0, which is exactly why the ratio form was replaced.
- **V4 "label level-count MUST":** image 2 levels, label 1 level. *Check:* overlay withheld, reason cites the MUST (S1 §"image-label"); no overlay layer added.
- **V5 "odd shape, undeclared origin" — primary translation discriminator (promoted per C2):** level0 128×128 at 0.5 µm/px; level1 **127×127**, scale `s1 = 0.5·128/127 = 64/127 ≈ 0.503937` µm/px. Two sub-variants: (a) written fixed-writer-style with translation `(s1−s0)/2 = 1/508 ≈ +0.001969 µm ≈ +1.97 nm` (pixel-center convention): *check* cursor at level-1 index (0,0) reads +1/508 µm; (b) written scale-only (the #403 defect): *check* the viewer renders the level's **declared** extent — it does not silently assume content alignment — and surfaces the "coarse-level origin undeclared" advisory. Motivation, qualitative: a scale-only declaration omits the ~half-pixel-scale offset that area-averaging introduces ((s1−s0)/2 near the origin; +0.25 µm in the exact-2× case); for non-integer ratios the true shift is position-dependent, which is why the viewer trusts declared metadata instead of an assumed alignment.
- **V6 "label transform mismatch":** label level-1 translation differs from the image's by more than the product tolerance (§9 lead 6). *Check:* withheld with "alignment unverifiable".
- **V7 "unsupported inputs":** Zarr-v3 group; 3-level pyramid; `axes`/ndim mismatch; a foreign transform type (e.g. extra `identity`) in a dataset's `coordinateTransformations`. *Check:* each lands in its named refusal state, including the C3-type refusal; no partial display.
- **V8 "absent labels":** no `labels/`. *Check:* overlay control disabled with the absence reason (not an error).

**Visible limits (shown in the product, not just docs):** undeclared version; unit-less data; withheld-overlay reasons; advisory when a coarse level lacks a declared translation; the pixel-center convention; version pins of napari/ome-zarr-py in the About box (behaviors in §3/§5 are version-specific).

---

## 9. Unresolved consequential dependencies

Remaining leads, each with consequence and next step (full detail in `out/UNRESOLVED_LEADS.md`):
1. `locked_data_level` presence in the **pinned v0.9.2 wheel** (docs captured from `docs@main`). Next: inspect the identified wheel asset (`napari-0.9.2-py3-none-any.whl`, sha256 `a67f7add…`, S5) before implementation. Affects B3/V3.
2. Cursor world-coordinate accessor for the embedded viewer — unpinned; affects B2's implementation surface.
3. Group-level (multiscales-level) transform handling in the chosen viewer path — spec-verified MAY + "applied after" (S1); mitigation: compose in our own interpretation layer; fixture still to be added.
4. ome-zarr-py **release** first shipping PR #590 — unidentified; the §5 correction is only effective above it. New supporting fact (S4, this stage): `CurrentFormat = FormatV05` on master, so "master behavior" ≠ "default writer version" when pinning.
5. Pixel-center vs index-origin — **narrowed per C7**: the product decision is made (pixel-center, upstream-compatible); residual risk: third-party files may assume edge-origin; single code path + tooltip remain.
6. Label-overlay match tolerance and no-transform fallback constants — open product constants; V5(b)/V6 depend on them.
7. Desktop-shell packaging weight (Qt+vispy+Pint) — open feasibility risk for the B4 recommendation; smoke-package first.

---

## 10. Obligation coverage and status

| Obligation/Question | Where addressed |
|---|---|
| Q1 (two components, version-specific justification) | §3 |
| Q2 (format/version interpretation; declaration vs guarantee) | §4 |
| Q3 (real issue → fix → test; scoped lesson) | §5 |
| B1 (input contract, version checks, read-only, absent labels) | §6 |
| B2 (physical cursor, calibrated display, fallbacks/withheld) | §7 B2 (+ C5 conditions) |
| B3 (resolution switching, overlay, refusal states) | §7 B3, §8 V3–V6, V8 |
| B4 (two implementations, tradeoff, issue→fix→test, tag separation) | §3 + §5, tags throughout |
| B5 (revised steps, discriminating validations, visible limits, unresolved leads) | §8 + §9 + `out/UNRESOLVED_LEADS.md` |

**Critique resolution:** C1–C5, C7 accepted and applied (§1, §6–§8, §9); C6 resolved by re-location with new primary evidence (§1, §2/S1). No critique point was rejected; no supported finding from the research stage was lost (source table §2; format interpretation §4; issue chain §5; overlay chain §7 all preserved, with corrections applied in place).

**Execution disclaimer:** every check in §8 is a proposed fixture specification. No proposed arithmetic was executed against a real file, no upstream suite was re-run, and no execution receipt exists for this stage; expected values in V1/V3/V5 are derived by hand from captured source text and are themselves subject to the very tests they define.
