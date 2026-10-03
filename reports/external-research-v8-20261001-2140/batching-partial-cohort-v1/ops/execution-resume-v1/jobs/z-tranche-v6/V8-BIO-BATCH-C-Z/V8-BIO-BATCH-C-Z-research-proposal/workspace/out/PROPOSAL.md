# Research proposal — local calibrated 2D OME-NGFF 0.4 image/label viewer
Case: V8-BIO-BATCH-C-Z (research-proposal stage). Deliverable: research-backed revision of `inputs/THIN_PLAN.md`. No implementation was performed; no test or arithmetic in this proposal has been executed. All proposed checks are labeled **UNEXECUTED**.

Labeling convention used throughout:
- **[SRC]** — fact read from a captured public primary source, with exact locator and its normative force (MUST/SHOULD/MAY/informational/silence).
- **[INFER]** — engineering inference drawn from sources (reasoning shown).
- **[CHOICE]** — explicit product decision for this prototype, not implied by any source.
- **[CORRECTION]** — a supported rejection of an earlier proposition (thin-plan assumption or naive reading), with the supporting evidence.

---

## 0. Scope and research-order note

Scope (from `inputs/BRIEF.md`): one local OME-NGFF 0.4 dataset, exactly two 2D resolution levels, one optional categorical label image; read-only; unequal axis scales and nonzero offsets possible; units/calibration possibly absent. Out of scope: 3D, time series, cloud stores, authoring, segmentation, registration estimation, conversion.

Research order (short note; host histories capture the actual operations): (1) discover and pin the normative spec identity/version, capture the full specification source; (2) discover candidate viewer/analogous components and pin exact versions (releases, package manifest, README); (3) search upstream trackers for calibration / resolution-switching / label-alignment failures; (4) verify one issue → fix → test chain down to the patched files and added test; (5) derive the discriminating numerical witness; (6) write this proposal. Progressive retrieval was used: the specification source was captured whole, then specific sections expanded from the capture; issue threads were expanded only where a consequential claim depended on them.

---

## 1. Sources discovered and pinned (exact locators)

| # | Source | Exact locator | Role |
|---|--------|---------------|------|
| S1 | OME-NGFF 0.4 specification | `ome/ngff` git tag **0.4.1** (commit `106c3010dcb4079eb0a69868a11cc5943f942fdf`), file `0.4/index.bs` (40,372 bytes, captured in full as two byte ranges). Rendered edition: `https://ngff.openmicroscopy.org/0.4/`; DOI `10.5281/zenodo.4282107`. Version history table (§ Version History {#history}): 0.4.0 (2022-02-08) "multiscales: add axes type, units and coordinateTransformations"; 0.4.1 (2022-09-26) transitional `bioformats2raw.layout`. Tag list confirms no 0.4.2/0.4.3 exists — 0.4.1 is the final 0.4 patch. | Normative basis (RQ2) |
| S2 | napari | GitHub release **v0.9.2** (published 2026-09-29), `napari/napari/releases/tag/v0.9.2`. Qt + vispy desktop viewer. Release notes include "Add multiscale level extraction as a `LayerList` action" (#9495). | Component A display engine |
| S3 | napari-ome-zarr | GitHub release **v0.10.0** (published 2026-07-21), `ome/napari-ome-zarr/releases/tag/v0.10.0`; sole release-note change: PR #149 "Forward NGFF axis names and units into napari layer metadata". Issues: #171 (open, filed 2026-10-01), #99 (open, filed 2024-01-24). | Component A reader plugin |
| S4 | ome-zarr-py | GitHub release **v0.19.2** (published 2026-09-08), `ome/ome-zarr-py/releases/tag/v0.19.2`; sole change: PR #652. Issue #172 (open since 2022-03-02) "Support multiscales coordinateTransformations". | Component A parser lineage; RQ3 chain |
| S5 | vizarr | `hms-dbmi/vizarr`, `package.json` on `main`: **version 0.3.0**; dependencies `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, `deck.gl ~9.1.0`; README on `main`: "minimal, purely client-side program for viewing zarr-based images", "2D slices of n-Dimensional Zarr arrays", anywidget Python API, § Limitations: "built to support the registration use case … Support for other Zarr arrays is supported but not as well tested." | Component B (compared, not chosen) |
| S6 | ome-zarr-py PR #652 (issue → fix → test) | `ome/ome-zarr-py/pull/652`, merged 2026-09-08T15:31:11Z; files receipt: `ome_zarr/classes/image.py` (fix) + `tests/test_writer.py` (test, +69 lines); shipped exactly in release v0.19.2. | RQ3 / B4 |

The NGFF 0.4 spec itself (S1, § Implementations {#implementations}) independently lists both component families: **ome-zarr-py** — "A napari plugin for reading ome-zarr files" — and **vizarr** — "A minimal, purely client-side program for viewing Zarr-based images with Viv & ImJoy" [SRC, informational section].

---

## 2. RQ1 — Component precedents and minimal choice (obligation B4, part 1)

**What the spec says about the field** [SRC, informational]: S1 § Implementations enumerates the implementation landscape; § Citing establishes the 0.4 edition identity. The Implementations list carries no normative force — it is informative; component claims below therefore rest on each component's own release/manifest/README receipts (S2–S5).

**Component A — napari 0.9.2 + napari-ome-zarr 0.10.0 (Python desktop stack).**
- Version-specific behaviors [SRC]: napari v0.9.2 is a Qt/vispy desktop application with multiscale layer support and a new per-level extraction action (#9495 in release notes) — i.e., level handling is first-class at this exact version. napari-ome-zarr v0.10.0's release notes state its only change is PR #149 "Forward NGFF axis names and units into napari layer metadata" — i.e., axis-name/unit forwarding (needed for B2 cursor units) exists only from 0.10.0 onward; pinning ≥0.10.0 is a version-specific requirement, not a generic one.
- Observed constraints [SRC]: issue #171 (open; environment napari 0.9.1, napari-ome-zarr 0.10.0, zarr 3.1.6) documents, with the reader source quoted, that opening a label store calls `zarr.open_group(parent_path)` without a mode, whose default is `"a"` — the **reader writes an empty `zarr.json` into the parent directory** on open. This is a live counterexample to the read-only boundary this prototype must guarantee. Issue #99 (open) documents that with more than one labels group only the first is loaded, and a labels-only store fails to read entirely.

**Component B — vizarr 0.3.0 (web client).**
- Version-specific behaviors [SRC]: package.json 0.3.0 pins `zarrita ~0.6.0` (client-side zarr access) and `@hms-dbmi/viv ~0.19.0` (GPU rendering); README: "view multiscale zarr images online and in notebooks", standalone web app + anywidget notebook API. README § Data types documents 2D-slice viewing of n-D arrays and integer/float dtype support; it documents **no label-overlay capability** (documentation silence — this is a fact about the documentation, not proof of absence in code). § Limitations states the tool was built for a registration use case and generic arrays are "not as well tested".
- Constraint [INFER]: a "small **desktop** prototype" would require embedding a browser runtime (or anywidget host) around vizarr, adding a process boundary between our metadata interpretation (Python, testable headlessly) and the rendering path (JS).

**Recommendation [CHOICE]** — a bounded split: use **napari 0.9.2 embedded** as the desktop display canvas, and implement a **thin, self-contained NGFF-0.4 interpretation module** (axes, coordinateTransformations composition, labels association, version/contract checks) owned by the prototype over raw `.zattrs`; treat napari-ome-zarr 0.10.0 as a reference implementation only, and do not depend on its reader for B1–B3 semantics.
- **Concrete tradeoff:** we accept writing and maintaining ~200 lines of interpretation logic (and a heavier Qt/vispy dependency than a pure-web viewer) in exchange for: (i) a demonstrable read-only boundary (avoids the observed #171 write-on-open class of defect); (ii) explicit control of per-level layer transforms so the calibration rule (P2 below) is exactly the spec rule and is unit-testable headlessly without a GUI; (iii) full control of the label-overlay justification and refusal states that B3 requires, which neither component documents as exposed behavior (vizarr README silence; napari-ome-zarr #99 open gaps).
- **[CORRECTION of the thin plan]** The thin plan's step 1 — "choose the minimal reader/viewer components" — implicitly assumed one off-the-shelf component could carry the semantics. That earlier proposition is rejected on observed evidence: wholesale reuse would import #171 (writes to disk), #99 (label association gaps), and the #172 class of incomplete transform support (below). Corrected proposition: *display machinery and format interpretation are sourced separately*; interpretation is owned, display is embedded.

---

## 3. RQ2 — What OME-NGFF 0.4 actually requires/permits (obligations B2, B3 source basis)

All statements [SRC] below are from S1 (`ome/ngff@0.4.1`, `0.4/index.bs`), RFC 2119 keywords per its Document conventions section. Section anchors refer to that file.

### 3.1 Axes and calibration metadata
- `axes` entries **MUST** contain `name` (unique across axes); **SHOULD** contain `type` (SHOULD be one of `space`/`time`/`channel`, MAY be a custom value); **SHOULD** contain `unit`, whose value SHOULD be one of the listed UDUNITS-2 strings (e.g. `micrometer`). § axes {#axes-md}.
- Normative consequence **[INFER]**: unit is only a SHOULD — **the format explicitly permits an axis with no declared unit**, and permits types outside the three known values. "Units or applicable calibration can be absent" (the brief) is therefore a format-permitted condition, not merely a synthetic one.
- In `multiscales`, the length of `axes` MUST equal the array dimensionality, MUST contain 2 or 3 space entries (MAY plus one time, MAY plus one channel/custom), and MUST be ordered to match the arrays, time-first, then channel/custom, then space [SRC, § multiscales {#multiscale-md}].

### 3.2 coordinateTransformations — the calibration rule
- Dataset level [SRC, § multiscales]: each dataset MUST contain `coordinateTransformations`; allowed types are only `translation` and `scale`; it MUST contain **exactly one `scale`**; "It MAY contain exactly one `translation` … If `translation` is given it MUST be listed after `scale` to ensure that it is given in physical coordinates." Scale/translation vector lengths MUST equal the axes length. The general rule in § coordinateTransformations {#trafo-md}: "The transformations in the list are applied sequentially and in order."
- **Multiscales level** [SRC]: a `multiscales` dictionary MAY contain its own `coordinateTransformations`, "applied to all resolution levels in the same manner … and are applied after them" (i.e., after each dataset's own transformations). Example use: a `scale` for a dimension that is the same for all resolutions.
- **Ordering of levels** [SRC]: dataset `path`s MUST be ordered "from largest (i.e. highest resolution) to smallest".
- **Exception — relative scaling** [SRC, same sentence family]: "If scaling information is not available or applicable for one of the axes, the value MUST express the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0". So a non-first level's `scale` value is *normally* the absolute pixel size, but the text permits a *relative-to-first* factor when absolute information is unavailable.
  - **[CORRECTION]** of the naive proposition "the `scale` array is always the absolute pixel size at every level": not guaranteed by the text. Consequence adopted [INFER→CHOICE]: the prototype normalizes every level against the first dataset (treat dataset 0 as the reference frame) and, when a level's scale cannot be resolved to absolute physical units under the documented rule, the physical cursor readout is **withheld** for that level (pixel indices remain) rather than guessed.
- **Version** [SRC]: the `version` field of a multiscales dictionary is SHOULD; "current version is 0.4". Absence of the field is spec-permitted; our contract treats it as a warned-lenient case, while values > "0.4" are refused (B1).

### 3.3 Physical cursor coordinates
- **[SRC basis + INFER]** The spec defines index→physical mapping only through the transformation clauses above; it does not define a "cursor". The prototype's rule is a direct composition of the spec sentences: for axis *a* of dataset *k*, `physical_a = index_a × scale_a(dataset k) + translation_a(dataset k)` (scale listed before translation, applied in order), then the multiscales-level transformations applied after, in list order. Because translations MUST follow scale, no translation may be multiplied by a scale.
- Metadata declaration vs. alignment guarantee: the spec *declares* how one image maps index→physical. It nowhere states that two groups (image and label) share a physical frame; § image-label says the label group MAY declare `source.image` (default `../../`). **[INFER]** Any overlay alignment is therefore a reader-established justification, not a format guarantee (see 3.5).

### 3.4 Resolution switching
- Levels are identified by `datasets[].path` (names arbitrary; the layout section notes the name is arbitrary with ordering defined by the metadata) and MUST be ordered highest→smallest resolution [SRC]. The prototype exposes exactly the two declared levels; switching re-renders the selected dataset with *its own* composed transform, so the **physical coordinate of a fixed scene point is invariant across levels** — this invariant is the discriminating property tested by the witness (§8).
- Version-specific observed pitfalls [SRC]: napari #8814 (closed 2026-03-27) reported multiscale misalignment when levels carry different Z sizes (3D; outside prototype scope but evidencing that level-dependent shape handling is a real failure surface), and napari #9121 (open) records that the plugin exposes `.data` per level but `.scale` only for level 0 — supporting the decision to compute per-level transforms in our own module rather than read them back from a viewer layer.

### 3.5 Image/label association
- Association structure [SRC, § labels {#labels-md} + § on-disk layout]: a special `labels` group under the image group contains a `labels` key listing paths to label objects; "Unlisted groups MAY be labels."
- Label metadata [SRC, § image-label {#label-md}]: `image-label` groups **MUST** also contain `multiscales`, and **"the two 'datasets' series MUST have the same number of entries"** (label level count = image level count — a hard checkable rule). `colors`/`properties` entries MUST contain `label-value`; `rgba` and extra key-value pairs are MAY; for duplicate `label-value`s, "Clients who choose to not throw an error should ignore all except the *last* entry." `source` is an optional dictionary that MAY include `image` (relative path, default `../../`).
- Shape expectation [SRC, low force]: the on-disk layout tree carries the comment that each label dimension "should be either the same as the corresponding dimension of the image, or `1`" — this is a prose comment in a layout figure, **not** an RFC 2119 requirement. Label arrays support "only integer values" per the same layout section.
- **Metadata declaration vs. alignment guarantee** [SRC silence + INFER]: no 0.4 clause requires the label and image to share axes, units, scale, or translation; each multiscale group declares its own mapping. Alignment of the overlay can therefore only be *justified by the reader* (compare axes names/types/units and composed transforms) or *withheld with a reason* — exactly the brief's requirement. This yields **[CORRECTION]** of the thin plan's step 3 ("decide when an optional label overlay can be shown"): the corrected rule is that the overlay is shown only when the association chain and the per-axis frame comparison succeed; otherwise a refusal state with the specific reason is displayed.

---

## 4. RQ3 — Real issue → fix → test chain (obligation B4, part 2)

**Chain [SRC]: ome-zarr-py PR #652 "bug: correctly normalize resolution level paths", merged 2026-09-08, shipped as release v0.19.2 the same day.**
- **Failure:** a remote OME-Zarr whose resolution levels are stored at paths `0`, `1`, `2` (rather than the `s0, s1, s2` convention) is loaded and re-saved; the writer path normalized only `datasets[].path` to `s0, s1, s2` and left `datasets[].coordinateTransformations[].input.path` pointing at the old names — the saved metadata went out of sync with the data (PR body; verified in the PR files receipt).
- **Fix (file receipt):** `ome_zarr/classes/image.py`, `to_ome_zarr`: rewrite each dataset's transform `input.path` together with the dataset path, raising a `ValueError` when a transform has no `input`, instead of silently leaving stale references.
- **Test (file receipt):** `tests/test_writer.py::TestWriter::test_normalize_resolution_level_paths` (+69 lines): builds a 2D three-level store at non-conventional paths `0/1/2` with per-level `scale = [2**level, 2**level]` and transform `input.path` references; reads it back, re-saves, and asserts that both the dataset paths **and** the `coordinateTransformations[0].input.path` values normalize consistently.
- **Relevance scoping (honest):** the direct failure fires in the save path and involves transform `input` references that exist in newer metadata shapes (0.5+/0.6-style); NGFF 0.4 datasets carry no such internal references. The chain is included because its *subject* is resolution-level path normalization — the exact layer a 2D resolution-switching viewer sits on — and because its lesson transfers to 0.4 reading directly.

**Scoped engineering lesson [INFER]:** never identify resolution levels by name convention or rewrite/assume any path reference independently of the dataset list it belongs to; level identity and every reference tied to it must be treated as one atomic metadata unit. The spec itself permits arbitrary level names and mandates ordering via metadata [SRC, § multiscales].

**Validation that follows (proposed for the prototype, UNEXECUTED):** fixture V9 in §7 — a store whose two levels are named `0` and `1` plus a decoy sibling array `aux`; the viewer must select levels strictly from `multiscales[0].datasets[].path` in declared order and ignore both the name pattern and the decoy. Regression-style assertion mirrors upstream: metadata-derived level descriptors, not name-derived ones.

---

## 5. B1 — Local input contract, version/support checks, read-only boundary

All [CHOICE] unless marked; each refusal condition cites its source basis where one exists.

**Accepted input (the only case the prototype opens fully):** a local directory containing a Zarr v2 group (`.zgroup`, arrays with `.zarray` [SRC: S1 § on-disk mandates Zarr spec v2]) whose `.zattrs` has `multiscales` where: `version` present and equal to `"0.4"` (absent → open with a visible warning banner [CHOICE]; value > `0.4` → refuse); exactly one multiscale entry taken (multiple → use the first and say so [SRC: the spec's own fallback example: "use the first multiscale as a fallback"]); exactly 2 axes, both `type: space` (t/c axes → refuse: prototype scope; the spec permits 2–5 axes [SRC]); exactly 2 datasets, ordered highest→lowest resolution [SRC MUST]; each dataset with exactly one `scale` and at most one `translation`, translation after scale, lengths = 2 [SRC MUSTs]; paths resolvable inside the store (spec-permitted arbitrary names).

**Refusal states (visible, with reason string), for:** zarr v3 stores (`zarr.json`/`.zarray` absent — format out of contract); plate / `bioformats2raw.layout` / well groups (out of scope; S1 provides their specs so refusal is principled, not ignorance); non-2D axes; wrong dataset count; malformed coordinateTransformations (missing scale, translation before scale, wrong vector length — each a [SRC] MUST violation); level scale not resolvable to absolute units (§3.2 exception) → open with physical readout withheld (degraded, not refused).

**Read-only boundary:** the store is opened with an explicit read-only mode; the prototype performs no writes, creates no files, and never persists view state into the dataset. Motivating upstream evidence [SRC]: napari-ome-zarr #171 shows a real reader creating `zarr.json` in a parent directory on open because of a default-mode group open. **[INFER]** Consequence: our module owns all group opening with explicit read-only intent, and an audit check (V11) asserts the input tree is byte-for-byte unchanged after a full browse session — UNEXECUTED proposal.

**Absent optional labels:** no `labels` group, or no entry listed → the overlay control renders as "No label image declared" and every other feature works [SRC basis: labels are optional; § labels: unlisted groups MAY be labels — unlisted groups are *not* auto-discovered by this prototype (CHOICE)].

**Unsupported input:** every refusal is a rendered state in the window (message + what failed + which contract clause), never a crash or a silent wrong display [BRIEF requirement].

---

## 6. B2 — Physical cursor coordinates and calibrated display

- **Rule (P2):** for the rendered level *k* and axes `(a0, a1)` in declared axis order: `physical_ai = index_ai × scale(dataset k, ai) [+ translation(dataset k, ai)]`, then multiscales-level transformations applied after, in order (§3.2–3.3). Displayed as `a0: value unit, a1: value unit` with the axis **name** from `axes` (napari-ome-zarr 0.10.0's PR #149 shows axis-name/unit forwarding is a recognized need [SRC]; we source names/units from our own module regardless [CHOICE]).
- **Version/conditions/metadata scope this depends on [SRC]:** S1 tag 0.4.1; `coordinateTransformations` present per dataset with exactly one `scale` (MUST); translation optional (MAY, after scale); multiscales-level transforms MAY exist and apply after dataset-level ones; transformation list application is "sequentially and in order" (§ trafo). If any MUST precondition fails, B1's refusal state applies.
- **Units:** the unit string displayed is the axis `unit` verbatim (UDUNITS-2 strings per S1). **No unit conversion is performed** [CHOICE — out of scope; unequal axis scales are still handled correctly because scale is per-axis].
- **Fallback/withheld behavior:** axis `unit` absent → cursor shows `index` plus the fixed string "(unit not declared)"; the scale-bar indication is withheld and a one-line reason ("physical unit not declared for axis 'x'") is shown. Level whose scale is only resolvable as a relative factor (§3.2 exception) → physical readout withheld for that level, pixel indices shown. Calibration present and absolute → scale bar drawn from the composed per-axis scale (its length computed from the same transform used for the cursor — one code path [CHOICE]).
- Nonzero offsets appear naturally through `translation`; unequal axis scales through per-axis scale entries [SRC semantics; INFER for display].

---

## 7. B3 — Resolution switching and optional categorical label overlay

**Switching:** UI toggle restricted to the two declared datasets; the selected level renders with its own composed transform (§6); the other level is never resampled to fake the switch. The physical-coordinate invariance across levels (same scene point → same physical readout) is the tested property (witness, §8; fixture V2).

**Overlay pipeline (all steps required, else refusal):**
1. **Association [SRC-based]:** image group → child group `labels` (the spec's special group) → its `.zattrs` `labels` list → each listed path must be a group with `image-label` + `multiscales` metadata [SRC MUST for multiscales co-presence]. `image-label.source.image`, if present, must resolve back to the image group (default `../../`) [SRC MAY] — checked when present; absence alone does not block the overlay (association via the `labels` listing is sufficient) [CHOICE].
2. **Structural check [SRC MUST]:** label `datasets` series length == image `datasets` series length (here: 2 == 2). Violation = invalid input → refusal with reason (this is one of the few hard cross-group MUSTs in the format).
3. **Alignment justification [INFER + CHOICE]:** the label level and image level are compared per axis by **name** (not position — a label stored `xy` against image `yx` still matches if names and units match): axis names, types, and units (when both declared) must agree, and both composed index→physical maps must place the level's extent on the same physical interval (within a small tolerance for float metadata). When label and image transforms are identical, the overlay is an identity alignment. When they differ but both are fully declared and frame-commensurable, the overlay is shown using the **label's own declared transform** as its layer mapping — justified because the spec defines each group's mapping to its (matching-named, matching-unit) physical axes [SRC basis + INFER]. Sampling for the categorical label is **nearest-neighbor** [CHOICE/INFER: linear interpolation would fabricate label values that exist in no segmentation].
4. **Refusal state (actionable, per B3):** overlay withheld with a specific reason string and which check failed, e.g. "overlay withheld: label axis 'x' unit 'meter' vs image axis 'x' unit 'micrometer' — frames not established commensurable by this prototype". Refusal causes: no `image-label`/`multiscales` in the label group; dataset-count mismatch; axis name/type/unit disagreement; non-integer label dtype [SRC basis: layout section — integer-only]; frame comparison failure; >0.4 metadata.
5. **Coloring:** if `image-label.colors` present, apply `rgba` per `label-value`; duplicate `label-value`s → obey the last entry [SRC: "should ignore all except the *last* entry"]; entries without `rgba` get a default colormap [CHOICE]. `properties` are ignored in v1 (optional metadata; no display obligation) [CHOICE].

**Visible limits:** no 3D/time/channel axes; no rotation/affine (0.4 restricts dataset transforms to scale/translation [SRC]); no unit conversion; no cross-store or remote sources; single image (plates/bf2raw refused); unlisted label groups not discovered.

**Revised plan steps (replacing thin plan steps 1–4):**
1. Interpretation module `ngff04.py`: contract check (B1) → parsed descriptor (axes, per-dataset transforms, multiscales-level transforms, labels association) — pure, headlessly testable [CHOICE].
2. Display shell: embed napari 0.9.2; drive per-level image layers and (when justified) the labels layer with explicit transforms from the module; own cursor readout widget and scale bar (§6) [CHOICE].
3. Overlay state machine: association ladder + refusal states (§7 steps 1–4).
4. Fixture suite and assertions (below) — all **proposed, UNEXECUTED**.

**Discriminating validation cases (proposed; none executed):**
- **V1 (witness fixture, §8):** nonzero multiscales-level translation + per-dataset scales; assert cursor equals rule A exactly (integer-valued floats). Discriminates interpretations A/B/C in one probe.
- **V2:** same physical point reached via level 0 voxel (14, 8) under V1's fixture → same readout (114.0 µm, 18.0 µm) — level-invariance.
- **V3:** unequal axis scales `[1.0, 0.5]` → cursor and scale bar anisotropic, no unit error.
- **V4:** axis unit absent → px fallback + withheld scale bar with reason.
- **V5:** perfectly aligned label (identical axes/scale/translation) → overlay shown, identity alignment.
- **V6:** translated-crop label (declare translation on the label only; cf. the real idr0101 crop-overlay scenario used to demonstrate napari-ome-zarr PR #32's translation support [SRC]) → overlay shown via label's declared transform.
- **V7:** label with 1 dataset vs image's 2 → refusal citing the datasets-count MUST.
- **V8:** label axes `xy` vs image `yx`, per-axis frames equal → overlay justified via name matching (not positional).
- **V9:** levels named `0`/`1` + decoy sibling array `aux` → levels chosen by metadata only (PR #652 lesson, §4).
- **V10:** `version: "0.5"` metadata / zarr-v3 store → visible unsupported state, no partial render.
- **V11 (read-only audit):** hash or stat the input tree, run a full browse including overlay, assert zero files created/modified (#171 counterexample class) — UNEXECUTED.

---

## 8. METHOD — three decision propositions and the numerical witness

### 8.1 Three consequential decision propositions (one per research question)

| | **P1 — component choice (RQ1)** | **P2 — calibration interpretation (RQ2)** | **P3 — level-identity lesson (RQ3)** |
|---|---|---|---|
| Selected source/version | S1 `ome/ngff@0.4.1` `0.4/index.bs` § Implementations (informational) + receipts: napari v0.9.2 release; napari-ome-zarr v0.10.0 release (PR #149 axis/unit forwarding); vizarr 0.3.0 `package.json` (`zarrita ~0.6.0`, `viv ~0.19.0`) + README limitations | S1 `ome/ngff@0.4.1` `0.4/index.bs` § multiscales {#multiscale-md} + § coordinateTransformations {#trafo-md} + § axes {#axes-md} | ome-zarr-py PR #652 (merged 2026-09-08; files receipt incl. test) + release v0.19.2 receipt; S1 § multiscales (path ordering MUST; arbitrary names) |
| Applicability condition | Local desktop, read-only, exactly-2D, single two-level image with optional label | Datasets carry exactly one `scale`; optional `translation` listed after scale; multiscales-level transforms, if any, apply after dataset-level ones | Store whose level directories deviate from the `s0..sN` naming convention (spec-permitted) |
| Relevant exception | vizarr: browser-only runtime, label capability undocumented; napari-ome-zarr: #171 writes on open, #99 label gaps; Implementations list is informational, not normative | Unit is only SHOULD (may be absent); non-first-level scale MAY be a relative-to-first factor when absolute scaling is unavailable; version field only SHOULD | 0.4 metadata carries no transform `input` refs — the literal failure class arises in newer metadata shapes; the lesson (atomic level/reference handling) generalizes |
| Normative force | None in S1 (informative list); component claims rest on own receipts (release/manifest facts) | MUST: exactly one scale; translation-after-scale; vector length = axes; ordering largest→smallest; transforms applied in order. SHOULD: unit, version. MAY: translation, multiscales-level transforms | MUST (spec): dataset order by metadata; observed-behavior facts from the PR/test receipts (no normative claim about upstream code) |
| SRC vs INFER vs CHOICE | SRC: versions + documented behaviors. INFER: desktop-fit and testability mapping. **CHOICE**: napari-embedded + owned interpretation module; vizarr rejected for this prototype | SRC: clause text. INFER: cursor composition rule; relative-vs-absolute resolution procedure. **CHOICE**: withhold physical readout when the rule cannot be resolved; no unit conversion | SRC: PR body/patch/test + release notes. INFER: scoped lesson. **CHOICE**: fixture V9 mirrors the failure mode read-only |
| Supported correction | **[CORRECTION]** rejects thin-plan step 1's single-component assumption (evidence: #171, #99, #172 class) → split display vs interpretation | **[CORRECTION]** rejects "scale is always absolute pixel size at every level" (S1 relative-factor sentence) → level-0-anchored normalization + withheld readout fallback | **[CORRECTION]** rejects "level names are conventional and ignorable" (PR #652 evidence) → identify levels by metadata only, remap references atomically |

### 8.2 Discriminating numerical witness (chosen and derived by this case; **UNEXECUTED**)

**Interpretation under test:** how a reader must compose per-dataset and multiscales-level `coordinateTransformations` for the on-screen cursor (a consequential 0.4 calibration interpretation; competing readings exist in the wild — cf. ome-zarr-py #172's open support gap and napari #139's report that default readers skip the scale metadata [SRC]).

**Fixture values (own choice, integers for exactness):** 2D image, axes `[y (space, micrometer), x (space, micrometer)]`.
- Dataset `0` (highest res): `coordinateTransformations: [{type: scale, scale: [1.0, 1.0]}]`.
- Dataset `1`: `coordinateTransformations: [{type: scale, scale: [2.0, 2.0]}]`.
- Multiscales-level: `coordinateTransformations: [{type: translation, translation: [100.0, 10.0]}]` (applied to all datasets, after each dataset's own transforms).
- Probe: cursor at voxel `(row=7, col=4)` of **level 1**; same scene point at level 0 is voxel `(row=14, col=8)`.

**Derivation (reasoned arithmetic — no runtime execution claimed):**
- **Interpretation A (spec rule: dataset scale→translation in order, then multiscales-level after):**
  y = 7×2.0 + 100.0 = **114.0 µm**; x = 4×2.0 + 10.0 = **18.0 µm**.
- **Interpretation B (naive: ignore multiscales-level translation):**
  y = 7×2.0 = **14.0 µm**; x = 4×2.0 = **8.0 µm**.
- **Interpretation C (wrong composition order: translation scaled, i.e. (index+translation)×scale):**
  y = (7+100)×2.0 = **214.0 µm**; x = (4+10)×2.0 = **28.0 µm**.
- **Discriminating property:** the three readings yield pairwise-distinct pairs at a single probe — {(114, 18), (14, 8), (214, 28)} — so one cursor assertion separates all of them; no second probe needed.
- **Level-invariance corroboration:** the same scene point at level 0 under A: y = 14×1.0 + 100.0 = 114.0; x = 8×1.0 + 10.0 = 18.0 — identical to the level-1 readout, as physical coordinates must be. Under B the level-0 readout would be (14.0, 8.0) and under C (228.0, 36.0) — both shifting with the level, which would make the cursor lie about the specimen when switching resolutions.
- **Why it matters here:** interpretation A is what the MUST/SHOULD clauses of S1 § multiscales + § trafo jointly require (translation listed after scale so it is already physical; multiscales-level applied after dataset-level). B silently drops declared calibration; C violates the scale-before-translation ordering rule.

**Execution status:** this witness and fixtures V1–V11 are **UNEXECUTED** — no arithmetic was run through any deterministic tool and no test was run in this stage; the proposal claims only their design and the hand reasoning shown. A proposed exact assertion for V1: `cursor(level=1, (7, 4)) == (114.0, 18.0)` (exact float equality is safe here as all values are integers in binary floating point).

---

## 9. Obligation coverage map

- **B1** — §5 (contract, version/support checks, read-only boundary, absent-labels and unsupported-input behaviors).
- **B2** — §6 (rule, version/conditions/metadata scope, units, fallback/withheld), grounded in §3.1–3.3 and P2.
- **B3** — §7 (switching, association ladder, transform/sampling/alignment justification, refusal state), grounded in §3.4–3.5.
- **B4** — §2 (two independently discovered components, versions, bounded recommendation + concrete tradeoff) and §4 (real issue → fix → test chain, lesson, validation), with observed-upstream vs inference vs prototype choices separated.
- **B5** — §7 revised steps + discriminating validation set + visible limits; unresolved consequential leads in `out/UNRESOLVED_LEADS.md`; nothing here asserts an executed test.
