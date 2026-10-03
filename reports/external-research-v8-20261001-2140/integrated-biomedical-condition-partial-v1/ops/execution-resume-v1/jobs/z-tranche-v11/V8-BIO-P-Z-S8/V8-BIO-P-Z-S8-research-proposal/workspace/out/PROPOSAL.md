# PROPOSAL — Research-backed plan: local read-only calibrated 2D OME-NGFF 0.4 viewer prototype

Case: V8-BIO-P-Z-S8 (research/proposal stage). Date of research: 2026-10-03.
Deliverable type: plan (no implementation, no executed validation). All arithmetic and all tests below are **UNEXECUTED** unless explicitly marked otherwise; no validation is claimed to have passed.

Evidence-class labels used throughout:
- **[SRC]** = source requirement (normative text of the cited spec/release, captured).
- **[OBS]** = observed upstream behavior (captured code, issue, PR, release note).
- **[INF]** = engineering inference (my reasoning from [SRC]/[OBS]).
- **[CHOICE]** = product choice for this prototype (could be decided differently).
- **[CORRECTION]** = supported correction of an earlier proposition.

---

## 0. Primary sources (self-selected, captured 2026-10-03)

| ID | Source | Exact locator |
|----|--------|---------------|
| S1 | OME-NGFF 0.4 specification | Published: `https://ngff.openmicroscopy.org/0.4/` (sections `#axes-md`, `#trafo-md`, `#multiscale-md`, `#omero-md`, `#labels-md`, `#label-md`). Source text: repo `ome/ngff-spec` @ commit `a4c68004fdb8a8d822367205dc12f9574a32ddf8` (tree pinned by `specifications/0.4` submodule of `ome/ngff@main`), file `index.bs` (41,115 B; sha256 `a5681c67…2f2d7`); line refs below are into that file. Status header (L19–21): [verbatim excerpt omitted; original artifact/source locator retained]; editor's drafts [verbatim excerpt omitted; original artifact/source locator retained]. |
| S2 | ome-zarr-py (format library) | Repo `ome/ome-zarr-py`, tag `v0.19.2` (latest release, published 2026-09-08). Files: `ome_zarr/reader.py` (610 L), `ome_zarr/format.py`, `ome_zarr/classes/image.py`, `tests/test_writer.py`. |
| S2i | ome-zarr-py issue #403 | `https://github.com/ome/ome-zarr-py/issues/403` — "`coordinateTransformations` generated for 0.4 are scale-only" (opened 2024-11-06, closed completed 2026-06-17). |
| S2p | ome-zarr-py PR #590 | `https://github.com/ome/ome-zarr-py/pull/652`-adjacent: PR #590 [verbatim excerpt omitted; original artifact/source locator retained], merged 2026-06-17T15:55:02Z, fixes #403; diff of `ome_zarr/format.py`, `ome_zarr/classes/image.py`, `tests/test_writer.py` captured. |
| S2q | ome-zarr-py PR #652 | [verbatim excerpt omitted; original artifact/source locator retained], merged 2026-09-08, shipped in v0.19.2; diff of `ome_zarr/classes/image.py` + regression test `tests/test_writer.py::test_normalize_resolution_level_paths` captured. |
| S3 | napari-ome-zarr plugin | Repo `ome/napari-ome-zarr`, tag `v0.10.0` (latest release, published 2026-08-12). `pyproject.toml`: `napari>=0.6.0`, `zarr>=3.1.5`, Python ≥3.11, BSD-3. v0.10.0 adds PR #149 [verbatim excerpt omitted; original artifact/source locator retained]. File `napari_ome_zarr/ome_zarr_reader.py` (722 L). |
| S4 | napari | Repo `napari/napari`, release `v0.9.2` (published 2026-09-29): Qt + vispy desktop viewer; notes include QtViewer attach fix (#9533) and multiscale level extraction action (#9495). |
| S5 | vizarr | Repo `hms-dbmi/vizarr`, branch `main`, `package.json` version `0.3.0` (no GitHub releases — `/releases/latest` returns 404; last push 2026-06-22). Dependencies: [inline excerpt omitted; original artifact pin retained], [inline excerpt omitted; original artifact pin retained], [inline excerpt omitted; original artifact pin retained]. Issues/PRs: #261 (coordinateTransformations support), #265 (open), #271 (open), #273 (merged 2026-03-17), #334 (merged 2026-03-17), #292 (open). |

---

## 1. RQ1 + B4 — component precedents, comparison, and minimal choice

### 1.1 The two compared implementations (independently discovered)

**A. napari + napari-ome-zarr plugin (Python/Qt desktop stack).**
Version-specific behaviors captured:
- Plugin v0.10.0 reads with `zarr>=3.1.5` (zarr v2 stores included) and is independent of ome-zarr-py [OBS, S3 pyproject].
- Axes handling is version-branched: v0.6 `coordinateSystems`; v0.1/v0.2 assume 5D `t,c,z,y,x` when `axes` missing; v0.3 string axes; v0.4 axis dicts (`ome_zarr_reader.py` L218–236) [OBS].
- v0.10.0 forwards per-axis `units`/`axis_labels` into napari layer metadata; its own comment records that napari *warns [verbatim excerpt omitted; original artifact/source locator retained] and hides units* when one layer lacks units (L249–258) [OBS].
- **Transform handling limitation (load-bearing):** `Multiscales.metadata()` (L260–286) uses **only `datasets[0].coordinateTransformations[0]`** (i.e. the scale) and applies it to the *whole pyramid*; the 0.4-mandated per-dataset `translation` (which 0.4 orders *after* scale, S1 L370) is never composed; lower levels' own transforms are not read. Multiscale-level transforms are appended via a filter designed for the 0.6 graph style (L276–283) [OBS].
- Labels: a label is accepted only if it also has `multiscales` (`Label.matches`), is made a child of the parent `Multiscales`, and **inherits the parent image's transform chain by assumption** ([verbatim excerpt omitted; original artifact/source locator retained]); when opened at the label path, the parent is found by going two directories up — layout convention, not `image-label.source.image` [OBS].

**B. vizarr 0.3.0 (TypeScript/Viv browser viewer).**
- `coordinateTransformations` were *ignored* until PR #261; support arrived late and its 3D translation path is still broken (issue #271, open: [verbatim excerpt omitted; original artifact/source locator retained]) [OBS].
- Labels were not loaded at all when the optional `omero` block was missing (issue #265, open) — an optional-metadata key is treated as load-bearing [OBS].
- Labels were only displayed when the parent image had multiple resolution levels; fixed in PR #273 (merged 2026-03-17) [OBS].
- Label rendering broke outright on newer Chrome via a WebGL sampler error (issue #292, open) — runtime-environment fragility of the JS/GL stack [OBS].
- No release artifacts; version only from `package.json` on `main` [OBS].

### 1.2 Recommendation [CHOICE, with concrete tradeoff]

Build the prototype as a **small Qt desktop app embedding napari v0.9.2** (`QtViewer`; #9533 fixed attaching it to a pre-populated `ViewerModel`), feed it dask pyramids and layers, and **do not rely on the plugin's transform handling for calibration**: a thin in-prototype **metadata gate** (Section 4) parses the 0.4 metadata itself, computes calibrated geometry, validates labels, and sets layer `scale`/`translate`/`units` itself (plugin used as data-access precedent and fallback). Tradeoff accepted: heavier install (Qt/vispy/numcodecs, napari≥0.6, zarr≥3.1.5) and we own the calibration math, in exchange for a native desktop surface, per-layer transforms that napari composes correctly in one world space, no browser/GL runtime risk (contrast vizarr #292), and no dependence on vizarr's open label/omero defects (#265, #273-class, #292).

vizarr remains the documented fallback renderer for a web-embed variant; its open issues are precisely the refusal-path cases this prototype must handle explicitly.

---

## 2. RQ2 — what NGFF 0.4 requires/permits for this input (metadata vs guarantee)

All [SRC] per S1 unless noted.

1. **Storage contract.** Arrays MUST be stored per Zarr v2 spec; NGFF metadata MUST live in Zarr group attributes (`.zattrs`) (L64–65). Axis *names* are arbitrary (L79–80); `axes` entries MUST have unique `name` (L241), SHOULD have `type` (space/time/channel; L242) and SHOULD have `unit` from the UDUNITS-2 list (L243–245). So **units and even types are optional**: calibration may legitimately be absent.
2. **Per-level transforms (calibration interpretation).** Each `datasets[]` MUST contain `coordinateTransformations` that [verbatim excerpt omitted; original artifact/source locator retained] (L367); only `scale`/`translation` types allowed (L368); **exactly one `scale`** — pixel size in physical units, or, [verbatim excerpt omitted; original artifact/source locator retained], the **relative factor vs the first resolution** defaulting to 1.0 (L369); **MAY contain exactly one `translation`** = offset from origin in physical units, which MUST be listed **after** scale (L370); lengths MUST equal `len(axes)` (L371). List entries are [verbatim excerpt omitted; original artifact/source locator retained] (L346). A multiscale-level `coordinateTransformations` MAY exist, applies to all levels and is applied **after** the dataset-level transforms (L374–376).
   → Cursor formula [SRC + INF]: [inline excerpt omitted; original artifact pin retained] for level *k*; unit = the axis's `unit` if present.
   → **Metadata declaration is not an alignment guarantee**: the spec defines the coordinate *mapping*; nothing certifies that level-1 data are actually sampled at the declared lattice points, nor that label levels are co-sampled with image levels. The overlay-alignment obligation (B3) therefore cannot rest on the format alone.
3. **Resolution switching.** `datasets[].path` MUST be ordered largest→smallest (L362–364); multiple `multiscales` entries: user chooses by name, fallback first (L389–401); `version` SHOULD be present ([verbatim excerpt omitted; original artifact/source locator retained]) (L378). [OBS] ome-zarr-py reader defaults a missing version to [verbatim excerpt omitted; original artifact/source locator retained] and validates axes against the claimed format (raises ValueError otherwise) — a precedent for strict version checks.
4. **Image/label association.** A `labels` sibling group lists label paths (L448–457); [verbatim excerpt omitted; original artifact/source locator retained] (L459). A label group MUST contain `multiscales` and **the two `datasets` series MUST have the same number of entries** (L466–467). Association to the image is by *convention*: `image-label.source.image` is only MAY, default `"../../"` (L487–491). **[SRC]** the only normative association constraints are: sibling listing + equal level count. **[INF]** per-level *scale equality* between image and label is **not** guaranteed by 0.4 text (the layout sketch's [verbatim excerpt omitted; original artifact/source locator retained] comment is informal, L98–101); it must be checked, not assumed — despite both compared viewers assuming it (S3 label-inherits-parent; S5 needed PR #273 and #271 notes CT handling [verbatim excerpt omitted; original artifact/source locator retained]).
5. **`omero`** is transitional, optional, display-only (L439–443). [OBS] vizarr's failure to show labels without `omero` (#265) is exactly the dependency this prototype must avoid.

---

## 3. RQ3 + B4 — real issue → fix → test chains and the engineering lesson

**Chain 1 (primary; calibration/resolution-switching, ome-zarr-py).**
- **Issue** #403 (2024-11-06): for 0.4, `generate_coordinate_transformations` emitted **scale-only** transforms per level: [verbatim excerpt omitted; original artifact/source locator retained] [OBS, S2i].
- **Fix** PR #590 (merged 2026-06-17, fixes #403): `format.py` now emits [inline excerpt omitted; original artifact pin retained] with [inline excerpt omitted; original artifact pin retained] per axis (half-pixel / sample-center convention); `classes/image.py` adds the `Translation`; merged as part of the v0.19 line (present in v0.19.2) [OBS, S2p].
- **Tests** `tests/test_writer.py`: assertions changed from [inline excerpt omitted; original artifact pin retained] to [inline excerpt omitted; original artifact pin retained] across image and **label** writer tests, with expected translations recomputed in-test using the same [inline excerpt omitted; original artifact pin retained] formula [OBS].
- **Chain 2 (secondary; level-path references, ome-zarr-py v0.19.2).** PR #652: rewriting level paths [inline excerpt omitted; original artifact pin retained] updated `datasets[].path` but not `datasets[].coordinateTransformations[].input.path`, desynchronizing metadata; fix raises on [inline excerpt omitted; original artifact pin retained] and rewrites the reference; regression test `test_normalize_resolution_level_paths` added; shipped in v0.19.2 [OBS, S2q].
- **Corroborating chain in the compared component (vizarr):** PR #273 (labels hidden for single-resolution parents, merged 2026-03-17) followed by PR #334 (fixture snapshot tests enriched with per-label name/resolution-level details [verbatim excerpt omitted; original artifact/source locator retained], merged 2026-03-17) — an issue→fix→test hardening in the *other* implementation [OBS, S5].

**Scoped lesson [INF]:** the fragile point of this format in practice is *derived per-level metadata*: writers under-generate it (#403), refactors desynchronize its internal references (#652), and viewers over-assume it (labels inherit parent transforms, S3; transform support lagging, S5). Therefore the prototype must (a) treat each level's transform chain as data to be **validated for self-consistency** (exactly-one-scale, order scale→translation, lengths, level-count parity for labels), and (b) never infer level-*k* geometry from level-0 geometry. **[CHOICE]** When a store's level-1 lacks a translation (pre-#590 writer style), the viewer shows the metadata-honest interpretation and displays a visible warning that cross-level alignment may be approximate (See T6).

---

## 4. METHOD three-proposition check (one per research question)

| # | Proposition | Source/version | Applicability condition | Exception | Normative force | Evidence class |
|---|---|---|---|---|---|---|
| P1 | Desktop stack = napari 0.9.2 (QtViewer embed) rendering dask pyramids, with an in-prototype 0.4 metadata gate owning calibration; napari-ome-zarr v0.10.0 = reference reader precedent; vizarr 0.3.0 = compared alternative, not chosen | S3 v0.10.0 `ome_zarr_reader.py` L260–286, L249–258; S4 v0.9.2 notes; S5 issues #265/#271/#292 | Local 2-level 2D zarr-v2 NGFF 0.4 store | If a future plugin release composes per-level [inline excerpt omitted; original artifact pin retained] fully, the gate can shrink to validation-only | Plugin limitations are *observed code*, not spec; choice is reversible | [OBS]+[CHOICE]; **[CORRECTION]**: earlier proposition [verbatim excerpt omitted; original artifact/source locator retained] is **rejected** — captured code drops the 0.4 per-dataset translation and applies dataset-0 transforms to all levels, which re-creates the #403/#271 misalignment class in-display |
| P2 | Physical cursor = per-level chain [inline excerpt omitted; original artifact pin retained] (translation after scale, physical units), then multiscale-level transform; unit display only if the axis has a `unit`; otherwise index-unit readout with µm display withheld | S1 L346, L367–376, L243–245; formula application [INF] | Level has exactly one scale (relative-only axes permitted per L369); optional translation | Absolute-µm readout additionally requires a `unit` on the axis; relative-factor axes are displayed as factors, never as µm | Normative for the mapping (MUST/SHOULD text); readout withholding is [CHOICE] implementing the brief's [verbatim excerpt omitted; original artifact/source locator retained] | [SRC] for mapping + optionality; [CHOICE] for fallback UI |
| P3 | Label overlay shown only if: label listed in sibling `labels` group (or `image-label.source.image` resolves), label is multiscales+`image-label`, level counts equal (normative), and per-level spatial scales match the image's within tolerance; else actionable refusal state | S1 L448–467, L487–491 (normative core); tolerance = [CHOICE]; mismatch-withholding = [INF] from S2p/S3/S5 failure history | Prototype scope: exactly 2 image levels | Spec fixes only level-count parity; scale-match is engineering inference; nearest-neighbor sampling for labels is [CHOICE] | MUST-level for level-count parity; prototype policy for the rest | [SRC]+[INF]+[CHOICE]; **[CORRECTION]**: earlier proposition "a label found under `labels/` can be overlaid directly on the image" is **rejected** — 0.4 gives no alignment guarantee (§2.4), and both compared viewers shipped bugs precisely from that assumption (#273/#271/#265; S3 inherits-by-assumption) |

---

## 5. Numerical witness (UNEXECUTED) — calibration & resolution interpretation

**Reasoned derivation; no deterministic arithmetic tool is admitted in this stage, so all values below are manually reasoned and labeled UNEXECUTED. Validation is proposed as T2 in §7.**

Fixture F1 [CHOICE values]: axes `[{name:"y",type:"space",unit:"micrometer"}, {name:"x",type:"space",unit:"micrometer"}]`;
- level `"0"`: shape (64, 64), CTs `[{"type":"scale","scale":[0.5,0.5]}, {"type":"translation","translation":[0.0,-10.0]}]` (µm; x-offset −10 µm);
- level `"1"`: shape (32, 32), CTs `[{"type":"scale","scale":[1.0,1.0]}]` — no translation.

Physical point **P = (y=20.0 µm, x=14.0 µm)**.

- **Interpretation A (proposed; per-level metadata, absent translation = 0):**
  level 0 index: y = 20.0/0.5 = **40**; x = (14.0 − (−10.0))/0.5 = 24.0/0.5 = **48** → sample (40, 48).
  level 1 index: y = 20.0/1.0 = **20**; x = 14.0/1.0 = **14** → sample (20, 14).
- **Interpretation B (competing; level-0 translation inherited by deeper levels — the assumption class seen in S3/S5):**
  level 1 index: y = 20; x = (14.0 + 10.0)/1.0 = **24** → sample (20, 24).
- **Discriminator:** the two interpretations place the same physical point at level-1 array x = 14 vs x = 24 — 10 array px = 10 µm apart (level-0 rendering identical at (40,48)). A viewer implementing B looks correct at level 0 and misplaces cursor/overlay by 10 µm after switching — the exact failure class of ome-zarr-py #403 and vizarr #271. The 0.4 text (per-dataset transforms map *that level's* data coordinates, L367; translation MAY be absent, L370) supports A.
- **Variant C (upstream product convention, not applicable to F1 but instructive):** PR #590's generator would write level-1 [inline excerpt omitted; original artifact pin retained], giving x index = (14.0 − 0.25)/1.0 = **13.75** → nearest sample 14 with a 0.75-px (0.75 µm) center-offset. Distinct from both A and B; shows the half-pixel convention is a *generator's* product choice, while a consumer must follow the stored metadata (A).

---

## 6. Revised plan (replaces thin-plan steps 1–4; B5)

1. **Input contract & support checks (B1).** Open local path read-only (zarr v2 via zarr-python; no writes, no sidecars). Gate checks, in order, each with a distinct refusal message: (i) `.zgroup` + `.zattrs` with `multiscales`; (ii) select one multiscale entry (name match else first, per S1 L389–401); (iii) `version` SHOULD be [verbatim excerpt omitted; original artifact/source locator retained] — accept [verbatim excerpt omitted; original artifact/source locator retained] with warning (string axes), **reject >0.4** as unsupported [CHOICE grounded in S1 L19–21 and the >0.4 churn observed in S2/S3]; (iv) exactly 2 axes, both `type:"space"`; axes length == array dims; unique names; (v) exactly 2 `datasets[]`, paths ordered largest→smallest, each with `coordinateTransformations`: exactly one scale, optional translation listed after, lengths == 2; (vi) unit check: present-and-UDUNITS → calibrated mode; absent → index mode. Missing optional labels ⇒ [verbatim excerpt omitted; original artifact/source locator retained] status, image still opens. Unsupported input ⇒ refusal screen listing the failed check number and observed value. [SRC for the checks' content; CHOICE for strictness]
2. **Calibrated inspection (B2).** Own transform module composes, per level: scale → translation (→ multiscale-level transform last). Cursor readout shows array index, physical x/y with unit, and current level's scale (unequal axis scales shown per-axis, e.g. [verbatim excerpt omitted; original artifact/source locator retained]); scale bar from level-0 scale; unit-less mode shows [verbatim excerpt omitted; original artifact/source locator retained]. Physical cursor computed by the gate (napari displays using gate-supplied layer `scale`/`translate`/`units`; gate sets identical units on image and label layers to avoid napari's inconsistent-units unit hiding [OBS S3 L249–258]).
3. **Resolution switching + label overlay (B3).** Two-level switcher (manual) + auto level pick by zoom; on switch, cursor/overlay geometry recomputed from *that level's* chain (witness §5). Overlay: discover labels via sibling group (accept `image-label.source.image` when present); apply P3 checks; label layer drawn **nearest-neighbor**, visible-off by default [CHOICE; matches plugin precedent]; refusal state names the failed condition ([verbatim excerpt omitted; original artifact/source locator retained] / [verbatim excerpt omitted; original artifact/source locator retained]).
4. **Validation & visible limits (B5).** Fixtures/tests in §7; visible limits panel: local files only; 2D; single selected multiscale entry; no plate/well/HCS, no time axes, no unit conversion between scales (native unit display only), no annotation/authoring.

## 7. Discriminating validation cases (all PROPOSED / UNEXECUTED)

- **T1 contract:** minimal valid 2-level store opens; delete `multiscales` → refusal (check i); add third dataset → refusal (check v).
- **T2 calibration math (witness):** gate on F1 returns level-0 (40,48) and level-1 (20,14) for P; assert **not** (20,24) (interp B) and not 13.75-mode (C). Executable as pure-function unit test once implemented.
- **T3 unit fallback:** F1 minus `unit` on both axes → readout [verbatim excerpt omitted; original artifact/source locator retained], µm text withheld, scale bar unit-less.
- **T4 switch invariance:** with P marked at level 0, switching to level 1 keeps the marker on the same physical feature (requires per-level transform application; fails if translation dropped — reproduces the S3 plugin behavior as the negative control).
- **T5 label gates:** (a) compliant label → overlay aligns (marker inside same labeled object at both levels); (b) label with 3 levels → refusal citing S1 L466–467; (c) label with 2 levels but level-1 scale 2× off → withheld with reason.
- **T6 legacy-writer warning:** store with pre-#590-style scale-only level-1 (the #403 shape) → metadata-honest display + visible [verbatim excerpt omitted; original artifact/source locator retained] warning [CHOICE].
- **T7 read-only:** sha256 of all store files before/after a session unchanged.

---

## 8. Obligation map

B1 → §6.1, §7-T1; B2 → §2.2, §6.2, §7-T2/T3/T4; B3 → §2.4, §6.3, §7-T5; B4 → §1, §3 (two components, one recommended tradeoff, two issue→fix→test chains); B5 → §6–§7, plus `out/UNRESOLVED_LEADS.md`. Remaining consequential dependencies are listed there and nowhere claimed as resolved.
