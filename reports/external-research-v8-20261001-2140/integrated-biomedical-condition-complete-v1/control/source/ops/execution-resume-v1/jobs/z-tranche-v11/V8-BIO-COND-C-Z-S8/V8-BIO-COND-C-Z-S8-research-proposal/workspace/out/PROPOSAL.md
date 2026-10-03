# Research proposal — V8-BIO-COND-C-Z-S8: local calibrated 2D OME-NGFF 0.4 image/label viewer

Research-backed revision of `inputs/THIN_PLAN.md` for a small, local, **read-only** desktop
prototype that inspects one OME-NGFF 0.4 two-dimensional multiscale image (exactly two
resolution levels, at most one optional categorical label image), shows calibrated cursor
information, switches levels, and admits or withholds the label overlay with stated reasons.
All validation below is **proposed and unexecuted**; nothing here claims a runtime pass.

Pipeline used (per `inputs/METHOD.md`): source capture/discovery → repository investigation →
thin-plan comparison (`out/PROPOSAL.draft.md`, superseded) → independent candidate critique
(`out/critique.md`, corrections C1–C10 applied below) → this final proposal.

## 0. Claim labels and source register

Labels: `[SPEC-MUST]`/`[SPEC-SHOULD]`/`[SPEC-MAY]` = normative 0.4 prose (S1); `[SCHEMA]` =
0.4 JSON Schema (S2); `[EXAMPLE]` = spec-repo examples, informative only; `[OBSERVED]` =
behavior read from captured upstream code/issues/releases at a pinned version; `[INFERENCE]`
= engineering inference; `[PRODUCT]` = prototype product choice; `[CORRECTION]` = supported
correction to the thin plan.

- **S1 — OME-NGFF 0.4 prose.** `ome/ngff` tag **0.4.0** (commit `0f03373888f3103978843d5d0a896521807f2637`), file `latest/index.bs` — the Bikeshed source of the published 0.4 spec (934 lines, blob sha `55976a60452f42b5194d21502443ffb3a334aec5764f8385fcb937db0aea5bf6`; capture `public_captures/55976a60….body`). Locators used: Zarr-v2 + `.zattrs` MUSTs L105–109; [third-party excerpt omitted] L117; array-name-arbitrary L135–136; label-dims advisory L151–154; axes L222–232 (`"unit"` wording L228; UDUNITS-2 lists L229–230); transformation types/order L235–252; multiscales L255–341 (paths L268–270; per-dataset transforms L273–278; multiscale-level transforms L280–282; name/version L284; `"unit"` in spec example L296; multi-entry selection algorithm L329–341); omero L343–377; labels L379–393; image-label L395–423 (equal dataset counts L400–401; `source.image` default `../../` L419–423).
- **S2 — 0.4 image JSON Schema.** tag 0.4.0, `0.4/schemas/image.schema` (sha `57b355b91e3ea30608268e58359d74c4842f9bb890b7b872de1dcab713ae37a7`; capture `public_captures/57b355b9….body`). `datasets[]` items require `path` + `coordinateTransformations`; exactly one `scale` per dataset; axes length 2–5 with 2–3 `space`; per-axis `units` optional string; `version` enum `["0.4"]`; `multiscales.coordinateTransformations` permitted.
- **S3 — 0.4 valid-schema examples.** Captured `valid/` tree listing (`public_captures/e36702a2….body`: `custom_type_axes`, `invalid_axis_units`, `mismatch_axes_units`, `missing_name`, `missing_version`, `untyped_axes` — all schema-valid edge cases) plus `0.4/examples/valid/mismatch_axes_units.json` (sha `fe1cec03…`; *time* axis carrying [third-party excerpt omitted]) and `0.4/examples/valid/invalid_axis_units.json` (sha `fab72ea3…`; y-axis [third-party excerpt omitted], schema-valid though not UDUNITS-canonical), both at tag 0.4.0.
- **S4 — ome-zarr-py v0.19.2** (tag, commit `94eaf20aa096b4a034fc0c636e31d5d64953d6ad`). `ome_zarr/reader.py` (sha `c46ba936…`): multiscale node = zarr group + `multiscales` attr; [third-party excerpt omitted] (silent default); reads **only dataset-level** `coordinateTransformations` ([third-party excerpt omitted]); `Labels`/`Label` specs yield separate child nodes, label node added `visibility=False`; label parent via `image-label.source.image`, warning when unresolved. `ome_zarr/axes.py` (sha `50583547…`): unknown unit strings → `warnings.warn`, not error; axes-type rules (time first, ≤1 channel, space last, ≤1 unknown type).
- **S5 — ome-zarr-py PR #652 + release v0.19.2.** PR merged 2026-09-08T15:31:11Z (diff sha `50b0c983…`; capture `public_captures/50b0c983….body`): `to_ome_zarr` in `ome_zarr/classes/image.py` now rewrites `coordinateTransformations[].input.path` together with `datasets[].path` (clear `ValueError` when `input` is `None`); new test `test_normalize_resolution_level_paths` in `tests/test_writer.py`. Release `v0.19.2` (published 2026-09-08T20:23:20Z) contains only this change.
- **S6 — issue ome/ome-zarr-py#172** (open, created 2022-03-02): multiscale-level `coordinateTransformations` unsupported; cites ome/ngff#85 for the one-level-up rule. Corroborated on the read path by S4.
- **S7 — napari v0.9.2** (release 2026-09-29, tag `v0.9.2`) with captured issues: #9121 (open, 2026-06-29: multiscale `.data` is per-level subscriptable while `.scale` holds only the highest-resolution level's scale); #6320 (open bug, 2023-10-09: multiscale image/label shift from the center-vs-corner pixel/voxel convention, [third-party excerpt omitted]; [third-party excerpt omitted]); #8814 (closed 2026-03-27, not-a-napari-bug: reporter's ome-zarr-py-written pyramid levels were cropped; same misalignment reported in ImageJ BigDataViewer; environment lists reader plugin `napari-ome-zarr 0.7.2` — third-party report).
- **S8 — Vitessce v4.0.10** (release 2026-09-30) with captured issues: #2199 (open, 2025-07-23: `image.ome-zarr` URL must point at a group whose root `.zattrs` has `multiscales`; `bioformats2raw.layout` nesting unsupported); #2343 (open, 2025-11-21: OME-NGFF 0.5-metadata support listed as a pending dependency — 0.4 is the supported baseline); #1818 (zipped-Zarr implemented for OME-Zarr).

## 1. Q1 — two independently discovered components and the minimal choice (B1, B4)

**Napari v0.9.2 `[OBSERVED S7]`** — native desktop viewer (Qt + vispy, Python). Multiscale layers accept a list of arrays with automatic level switching; layers carry affine `scale`/`translate` to world coordinates; cursor world position and labels layers are first-class; 0.9.2 adds a [third-party excerpt omitted] action (release notes). Version-specific constraints: layer `.scale` is **not** per level (#9121); the multiscale center-vs-corner overlay-shift bug #6320 is still open on this line; monthly EffVer releases force a pin. The observed common OME-Zarr integration path is the `napari-ome-zarr` reader plugin (observed at 0.7.2 in #8814, third-party report) `[OBSERVED]`.

**Vitessce v4.0.10 `[OBSERVED S8]`** — web/React viewer, embeddable on the desktop via QtWebEngine. Built-in OME-Zarr raster loading; zipped stores supported (#1818). Version-specific constraints: the loader assumes root `.zattrs` carries `multiscales` (#2199); 0.5-metadata support is an open dependency (#2343) so 0.4 is the practical baseline; embedding adds a JS toolchain; the label-overlay admission logic is internal, not a reusable API.

**Recommendation `[PRODUCT]`:** a small PySide6 application embedding **napari v0.9.2 (pinned)** as the render/interaction widget, plus a self-contained `ngff04` metadata module owning all 0.4 parsing, calibration and overlay-admission decisions, and `zarr` (storage access, read-only). **Concrete tradeoff:** reuse of a mature multiscale GPU renderer, zoom/cursor and labels machinery, at the cost of (a) pinning a fast-moving version and (b) *not* trusting napari's layer transform as the calibration source — napari exposes a single scale per multiscale layer (#9121) and the common reader passes through only dataset-level transforms (S4), so per-level 0.4 calibration must be computed in our own module regardless. Vitessce was rejected for this scope: heavier embed and loader assumptions (#2199) that conflict with arbitrary local layouts.

## 2. Q2 — what 0.4 requires or permits for this input (B2 core)

1. **Container.** Arrays MUST follow Zarr **v2**; OME-NGFF metadata MUST be `.zattrs` group attributes. `[SPEC-MUST]` (S1 L105–109)
2. **Axes.** `multiscales.axes` MUST exist; length 2–5 and equal to array dimensionality; 2–3 `space` axes; time first, channel second, space last `[SPEC-MUST]` (L262–266, S2). Each axis MUST have a unique `name`; `type` SHOULD be space/time/channel (custom allowed); units SHOULD be present and UDUNITS-2 `[SPEC-SHOULD]` (L225–230). **Prose and its example write `"unit"` (L228, L296); the schema and the shipped valid examples write `"units"` (S2, S3).** `[EXAMPLE]` is not normative; the schema validates `units`. The schema enforces neither UDUNITS conformance nor unit–type agreement (both S3 files are schema-valid). `[SCHEMA]`
3. **Resolution levels.** `datasets[].path` is an arbitrary relative path; entries MUST be ordered largest→smallest `[SPEC-MUST]` (L268–270; layout: [third-party excerpt omitted] L135–136; [third-party excerpt omitted] L117). `s0/s1` naming is convention only — the PR #652 fixture uses `0,1,2` `[OBSERVED]`.
4. **Per-dataset calibration.** Each dataset MUST carry `coordinateTransformations` mapping **that level's** data coordinates to physical coordinates; exactly one `scale` (use 1 where unavailable) `[SPEC-MUST]`; at most one `translation`, which MUST be listed **after** `scale` so it is in physical coordinates `[SPEC-MUST]` (L273–278). Lists apply **sequentially, in order** (L252). Only `scale`/`translation` types are permitted at this level; `identity` is the implicit default (L245, L274). The general table also allows `path`-referenced vectors (L246–247) — legal but out of the prototype's scope (§5).
5. **Multiscale-level transforms.** `multiscales.coordinateTransformations` MAY exist, apply to all levels, and are applied **after** the dataset-level transforms `[SPEC-MAY]` (L280–282).
6. **Version.** `multiscales[].version` SHOULD be `"0.4"` `[SPEC-SHOULD]` (L284; S2 enum). ome-zarr-py silently defaults a missing version to `"0.1"` (S4) `[OBSERVED]`.
7. **Multiple multiscales entries.** A list is allowed; the spec's own algorithm: use the requested `name`, else fall back to the first entry `[SPEC-SHOULD]` (L329–341).
8. **Labels association.** An optional `labels` group lists label paths in `.zattrs`; unlisted groups MAY still be labels `[SPEC-MAY]` (L379–393). A label group MUST itself contain `multiscales`, and image and label dataset series MUST have the same number of entries `[SPEC-MUST]` (L400–401). `image-label.source.image` MAY name the image; default `../../` `[SPEC-MAY]` (L419–423). [third-party excerpt omitted] is advisory only (L151–154) `[SPEC-SHOULD]`.
9. **Metadata declaration is not an alignment guarantee.** Nothing in 0.4 asserts image and label transforms describe the same physical space; extent equality is *checkable* but not guaranteed. `[INFERENCE from 1–8]` Upstream corroboration: ome-zarr-py returns labels as separate hidden layers with no computed alignment transform (S4) `[OBSERVED]`; napari's center-vs-corner overlay shift is still open (#6320) `[OBSERVED]`.

**Thin-plan comparison (step 2) `[CORRECTION]`:** the plan's single "metadata interpretation" step is replaced by per-level interpretation + optional multiscale-level composition + explicit version/units edge cases (§4–§5); its shape-based overlay intuition is replaced by a transform-based admission decision with enumerated refusals (§6).

## 3. Q3 — a real issue → fix → test chain (B4)

**Chain (merged, released, tested): ome-zarr-py resolution-level path normalization — PR #652 → v0.19.2 `[OBSERVED S5]`.**
- *Failure:* `OMEZarrMultiscale.to_ome_zarr` normalized non-canonical level paths (e.g. `0,1,2` written by other tools) to `s0,s1,s2` by rewriting `datasets[].path` — but not the matching `coordinateTransformations[].input.path`, leaving the written transform graph pointing at stale paths.
- *Fix:* `to_ome_zarr` rebuilds each dataset with `path` **and** `transform.input.path` updated; raises a clear `ValueError` when `transform.input` is `None`.
- *Test:* `tests/test_writer.py::test_normalize_resolution_level_paths` — writes a store with levels `0,1,2`, round-trips it, asserts [third-party excerpt omitted] **and** [third-party excerpt omitted].
- *Release:* the sole change in v0.19.2.

**Scoped engineering lesson `[INFERENCE]`:** resolution levels are referenced by arbitrary paths and annotated by transforms that reference those paths — a graph, not a naming convention. Any component that normalizes, renames or selects levels must update and validate the whole graph; readers must never derive level identity from names or index arithmetic (paths are arbitrary by spec, L268–270). Applied to this read-only prototype: accept any level path strings, verify each referenced array exists, and never synthesize transform/level associations.

**Corroborating history (not fix chains):** #172 — multiscale-level transforms unsupported since 2022, now also confirmed absent from the v0.19.2 read path (S4); napari #6320 — open center-vs-corner overlay shift; napari #8814 — closed as a writer-side defect (cropped levels), demonstrating how per-level metadata inconsistency surfaces as "viewer misalignment" and motivating per-level consistency checks.

## 4. B1 — local input contract, version/support checks, read-only boundary

`[PRODUCT]`, grounded as marked.

- **Input:** one local filesystem path to a Zarr v2 group (`.zgroup` present) whose `.zattrs` contains `multiscales` (S1 L105–109; S4 `Multiscales.matches`). Opened strictly read-only (store mode `r`); the prototype never writes attributes, arrays, caches or sidecars into the dataset directory.
- **Version gate:** `multiscales[0].version` must be present and equal `"0.4"` — refuse otherwise, naming the check. Rationale: SHOULD-level field (L284) whose absence is silently defaulted to `"0.1"` by ome-zarr-py (S4) `[OBSERVED]`, and later versions change the transform graph (0.6-style `input/output` coordinate systems in the PR #652 fixture `[OBSERVED]`; Vitessce's 0.5 support still open, S8).
- **Scope gate:** exactly 2 axes, both `space` (or untyped `y`/`x` names, mapped as in ome-zarr-py `KNOWN_AXES` — untyped axes are schema-valid, S3) `[INFERENCE]`; exactly 2 `datasets` entries (spec allows 1..n, S2); every path resolves to an existing 2-D array; each dataset has exactly one length-matching `scale` (mandatory, L273–275).
- **Multiple multiscales entries:** use the first entry (spec fallback algorithm, L329–341) and display its `name`; when more than one entry exists, show a visible note listing names. `[PRODUCT]`
- **Absent optional labels:** no `labels` key/group ⇒ overlay control rendered disabled with visible reason "no label image present"; discovery per L379–393 and S4 `Labels` spec.
- **Unsupported input:** every refusal produces one actionable visible state — what failed, which check, which metadata key, what a conforming input looks like. Refusal happens before any layer is rendered (no partial views).

## 5. B2 — physical cursor coordinates and calibrated display

- **Interpretation:** for displayed level ℓ and axis a, `p = i·s_ℓ,a + t_ℓ,a` from that level's own `datasets[ℓ].coordinateTransformations` `[SPEC-MUST]` (L273–277); then apply any `multiscales.coordinateTransformations` entries sequentially, in listed order `[SPEC-MAY]` (L252, L280–282). Translation is already physical because it MUST follow scale (L276). This is a **metadata declaration interpreted per level**, not a guarantee that levels were generated consistently — level-consistency is separately checkable (V4) `[INFERENCE]`.
- **Metadata scope:** per-level scale/translate plus the optional multiscale-level layer; nothing else in 0.4 (no rotation/affine at these levels, L274/L281). `path`-form transform vectors (L246–247) are refused with "unsupported transform encoding" `[PRODUCT]`.
- **Units:** per-axis scale shown with its unit string. UDUNITS-canonical values display normally ("µm"); schema-valid non-canonical strings (e.g. "micron", S3) display verbatim with a non-blocking "non-canonical unit" badge — mirroring ome-zarr-py's warn-don't-fail stance (S4) `[OBSERVED→PRODUCT]`. Units absent ⇒ readout switches to "px" with an explicit "units absent" indication; calibration is never silently unit-less.
- **Version/conditions this depends on:** 0.4 only (§4 gate); dataset-level transforms mandatory; multiscale-level layer optional and, when present, *not applied by ome-zarr-py* (#172, S4) — the prototype applies it itself and shows a visible note.
- **Fallback/withheld behavior:** missing/malformed transforms ⇒ physical readout replaced by "calibration withheld: ⟨reason⟩"; index readout continues. Napari's layer transform is deliberately not the calibration source (single-scale limitation, #9121 `[OBSERVED]`).

## 6. B3 — resolution switching and the optional categorical label overlay

- **Level model:** the two `datasets` entries in metadata order (largest→smallest, L270); paths may be any strings (PR #652 lesson). Switching levels never moves the physical point under the cursor: the cursor index is recomputed as `i = (p − t_ℓ)/s_ℓ` from the retained physical position. `[PRODUCT]`
- **Association — justification required before overlay.** Admit the overlay only if **all** hold:
  1. label discovered via `labels` metadata or the `labels/` group (L379–393) `[SPEC-MAY→PRODUCT]`;
  2. label group has `multiscales` (L400) `[SPEC-MUST→PRODUCT]`;
  3. both series carry complete transforms with matching axis names and comparable units `[INFERENCE]`;
  4. physical extents agree per axis within ε. 0.4 itself requires equal dataset-series counts (L400–401); for count-mismatched inputs — which the product brief explicitly allows — the prototype proceeds **only** through this extent test and displays a "non-conformant per 0.4 L400–401, extents justified" note. `[PRODUCT; CORRECTION C1]`
- **Extent test and tolerance.** Per axis, extent = half-open interval `[t, t + shape·s]`; tolerance `ε_a = 0.5·max(s_image,a, s_label,a)` (half the coarser level's pixel footprint); admit when `|t_img + shape_img·s_img − (t_lbl + shape_lbl·s_lbl)| ≤ ε_a` for both axes. `[PRODUCT; CORRECTION C2]`
- **Transform and sampling.** Overlay placement uses only the label's own per-level transforms mapped into the shared physical space; no registration/shift estimation (out of scope). Label values are categorical ⇒ nearest-neighbor sampling at the label's stored level, magnified by the display transform; never interpolated. `[PRODUCT]`
- **Refusal states (enumerated, actionable):** "no labels metadata"; "label group has no multiscales"; "label transforms missing/malformed"; "axis/unit mismatch"; "physical extents differ beyond tolerance ε". When withheld, the image view continues with an inline reason naming the failed predicate. The conservative gate is justified by upstream behavior: reference viewers do not guarantee image/label overlay alignment (S4 separate hidden nodes; #6320 open shift) `[OBSERVED→PRODUCT]`.

## 7. Discriminating numerical witness (self-derived; **UNEXECUTED**)

**Method note:** no arithmetic-executing deterministic tool is admitted in this environment, so per METHOD this witness is a reasoned derivation with a proposed runtime assertion; **no runtime result is claimed or implied.**

Fixture F1 `[PRODUCT]`: axes `y,x` (`type: space`, [third-party excerpt omitted]); level 0: shape 512×512, scale `[0.5, 0.4]`, translation `[10.0, 2.5]`; level 1: shape 256×256, scale `[1.0, 0.8]`, translation `[10.0, 2.5]` (coherent 2× pyramid). Cursor on the **displayed level 1** at index `(y=100, x=50)`.

Competing interpretations of 0.4 transform semantics, and what the readout discriminates:
- **H1 (spec: per-level scale, then translation):** `x = 50·0.8 + 2.5 = 42.5 µm`; `y = 100·1.0 + 10.0 = 110.0 µm`.
- **H2 (wrong composition order — translate before scale):** `x = (50 + 2.5)·0.8 = 42.0 µm` (y unchanged: 110.0).
- **H3 (level-0 scale misapplied to level-1 indices — the #9121/#8814 confusion pattern):** `x = 50·0.4 + 2.5 = 22.5 µm`.

One cursor readout separates all three: 42.5 vs 42.0 vs 22.5 µm. **Overlay extent discrimination:** image level-0 extent x ∈ [2.5, 2.5 + 512·0.4] = [2.5, 207.3], y ∈ [10.0, 10.0 + 512·0.5] = [10.0, 266.0]; a single-level label (256×256, scale `[1.0, 0.8]`, translation `[10.0, 2.5]`) has extent x ∈ [2.5, 2.5 + 256·0.8] = [2.5, 207.3], y ∈ [10.0, 266.0] — equal, so the overlay is admitted (with the L400–401 non-conformance note, since counts differ); the same label without transforms fails predicate (3) of §6 and must be withheld. Round-trip for level switching: physical x = 42.5 µm ⇒ level-0 index (42.5 − 2.5)/0.4 = 100.0 ⇒ forward 100.0·0.4 + 2.5 = 42.5 µm.

## 8. B5 — revised implementation steps and validation matrix

**Thin-plan mapping `[CORRECTION C8]`:** plan step 1 (input contract + components) → §4 + §1; step 2 (metadata/calibration/resolution design) → §2 + §5 + §6 level model; step 3 (overlay show/withhold decision) → §6 admission predicate and refusal states; step 4 (fixture set + end-to-end checks) → matrix below. All four thin steps are superseded by the evidence-backed versions here.

Steps:
1. `ngff04` metadata module: parse `.zattrs` (S1/S2); B1 support gate (version, scope, arrays, scale presence); unit spelling normalization (`units`/`unit`); non-canonical-unit warn list; multiscales-entry selection (L329–341).
2. Calibration engine: per-level forward/inverse transforms incl. optional multiscale-level composition (order L252/L280–282); cursor readout; level-switch index recompute; overlay admission predicate with ε test.
3. UI: PySide6 shell embedding napari v0.9.2 (pinned) for render/zoom/cursor; overlay control with the enumerated refusal states; calibrated scale bar and readout panel; visible notes for non-conformance and ignored-by-upstream transforms.
4. Fixture set + tests below, all read-only against local directories.

**Validation matrix (proposed; none executed):**
- **V1** F1 cursor readout `(110.0, 42.5) µm` — discriminates H1/H2/H3 (§7).
- **V2** level paths `("0","1")`, `("s0","s1")`, `("abc","xyz")`: all load and switch (paths arbitrary, L268–270; PR #652 lesson).
- **V3** no `labels` key: overlay disabled with reason; image renders.
- **V4** F1 + two-level label with matching transforms: overlay aligned; level switching keeps the cursor's physical point fixed (round-trip in §7).
- **V5** label without transforms: withheld, reason "label transforms missing/malformed".
- **V6** `multiscales.coordinateTransformations` present: applied after per-level transforms; visible note that upstream readers ignore them (#172, S4).
- **V7** unit variants: `units: micrometer` (schema spelling), `unit: micrometer` (prose spelling), `micron` (schema-valid non-canonical), absent — four distinct visible states, none fatal.
- **V8** anisotropic scale + nonzero offsets (F1): per-axis readout differs (0.5 vs 0.4 µm/px).
- **V9** `version: "0.5"`, or missing: refusal state naming the version check (contrast: ome-zarr-py would assume "0.1", S4).
- **V10** 1 or 3 levels: refusal state naming the two-level contract.
- **V11** F1's single-level label: admitted via the extent test with the L400–401 non-conformance note (C1/C10).
- **V12** count-mismatched label whose extents differ beyond ε: withheld, reason names the extent predicate.

**Visible limits (stated in the UI):** single dataset; exactly two levels; 2D only; no 3D/time-series/cloud stores/authoring/segmentation/registration/conversion; overlay admitted only under §6; calibration withheld when metadata is incomplete; all validation proposed, not executed.

## 9. Coverage map

Q1 → §1 (B1, B4). Q2 → §2, §5 (B2). Q3 → §3 (B4). B1 → §4. B2 → §5. B3 → §6. B4 → §1 + §3 (two implementations compared; observed vs inference vs product separated throughout; one issue→fix→test chain). B5 → §8 (+ §7 witness, §10 leads, thin-plan mapping).

## 10. Unresolved consequential leads

See `out/UNRESOLVED_LEADS.md`: pixel-center vs corner convention risk (#6320); napari v0.9.x per-level API surface; real-world prevalence of multiscale-level transforms and `unit`-spelling variants; Vitessce 0.5 status if the component choice is revisited; unexecuted arithmetic and proposed tests.
