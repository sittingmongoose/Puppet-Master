# FINAL PROPOSAL (corrected) — Research-backed plan: local read-only calibrated 2D OME-NGFF 0.4 viewer prototype

Case: V8-BIO-P-Z-S8 — **final-correction stage** (fresh context, same candidate family/account). Date of correction: 2026-10-03.
Input chain: `inputs/BRIEF.md` → `inputs/THIN_PLAN.md` → frozen `inputs/PROPOSAL.md` (research/proposal stage) → `inputs/CRITIQUE.md` (independent candidate critic; verdict: **the proposal survives**, corrections C1–C5 minor) → this file.

This is the **complete usable corrected artifact**: it restates the whole research-to-plan, not a diff. All three research questions and all five product obligations (B1–B5) are addressed. Every proposed test and every arithmetic step below is **UNEXECUTED / reasoned** — none has been run; no runtime result is claimed.

Evidence-class labels:
- **[SRC]** = normative text of the cited spec/documentation (captured).
- **[OBS]** = observed upstream behavior (captured code, issue, PR diff, release note).
- **[DOC]** = descriptive upstream documentation of implemented behavior (captured; not normative for NGFF).
- **[INF]** = engineering inference (my reasoning from [SRC]/[OBS]/[DOC]).
- **[CHOICE]** = product choice for this prototype (could be decided differently).
- **[CORRECTION]** = supported correction of an earlier proposition.
- **[UNCHANGED-VERIFIED]** = carried from the frozen proposal; independently re-verified by the critic against the cited versions; not modified by any critique point.

Stage-tool note (METHOD): no deterministic arithmetic tool is admitted in this stage (the mechanical tool exposes only line-map/render/cache operations), so all arithmetic in §5 is shown as hand-reasoned derivation and labeled UNEXECUTED; validation is proposed as T2/T4/T8 in §7 and is not claimed to have run.

---

## 0. Primary sources (self-selected; captured 2026-10-03)

| ID | Source | Exact locator | Status in this correction |
|----|--------|---------------|---------------------------|
| S1 | OME-NGFF 0.4 specification | Published `https://ngff.openmicroscopy.org/0.4/` (anchors `#axes-md`, `#trafo-md`, `#multiscale-md`, `#omero-md`, `#labels-md`, `#label-md`); repo `ome/ngff-spec` @ commit `a4c68004fdb8a8d822367205dc12f9574a32ddf8`, file `index.bs`; line refs below are into that file. Status header (L19–21): [verbatim excerpt omitted; original artifact/source locator retained]; editor's drafts [verbatim excerpt omitted; original artifact/source locator retained]. | [UNCHANGED-VERIFIED] critic matched the published page's `revision` meta to the claimed pin and verified all normative quotes verbatim. |
| S2 | ome-zarr-py | Repo `ome/ome-zarr-py`, tag `v0.19.2` (latest release, published 2026-09-08). Files: `ome_zarr/reader.py`, `ome_zarr/format.py`, `ome_zarr/classes/image.py`, `tests/test_writer.py`. | [UNCHANGED-VERIFIED] |
| S2i | ome-zarr-py issue #403 | `https://github.com/ome/ome-zarr-py/issues/403` — "`coordinateTransformations` generated for 0.4 are scale-only" (opened 2024-11-06, closed completed 2026-06-17). | [UNCHANGED-VERIFIED] |
| S2p | ome-zarr-py PR #590 | [verbatim excerpt omitted; original artifact/source locator retained], merged 2026-06-17T15:55:02Z, body opens [verbatim excerpt omitted; original artifact/source locator retained]; diff of `ome_zarr/format.py`, `ome_zarr/classes/image.py`, `tests/test_writer.py` captured. | [UNCHANGED-VERIFIED]; formula attribution **split per file** (C2, §3.1). |
| S2q | ome-zarr-py PR #652 | [verbatim excerpt omitted; original artifact/source locator retained], merged 2026-09-08T15:31:11Z, shipped in v0.19.2 (listed in v0.19.2 release notes); diff of `ome_zarr/classes/image.py` + regression test captured. | [UNCHANGED-VERIFIED]; **#590 release claim weakened** (C3): #590 (merged 2026-06-17) is in the v0.19 line, but the v0.19.2 notes list only #652 and the first release carrying #590 was **not evidenced** — §3.1 now says [verbatim excerpt omitted; original artifact/source locator retained], not [verbatim excerpt omitted; original artifact/source locator retained]. |
| S3 | napari-ome-zarr plugin | Repo `ome/napari-ome-zarr`, tag `v0.10.0` (latest release, published 2026-08-12). `pyproject.toml`: `napari>=0.6.0`, `zarr>=3.1.5`, Python ≥3.11, BSD-3-Clause, **no ome-zarr-py dependency**. File `napari_ome_zarr/ome_zarr_reader.py` (correct filename verified; `reader.py` returns 404). | [UNCHANGED-VERIFIED]; §1.1 gains the critic's **C5** pass-through observation. |
| S4 | napari | Repo `napari/napari`, tag `v0.9.2` exists at commit `595639295a153c84bcb127a9e07d801355440a35` (tag ref re-verified this stage); release published 2026-09-29 with notes: [verbatim excerpt omitted; original artifact/source locator retained], "Add multiscale level extraction as a `LayerList` action (#9495)", formal monthly release policy. | [UNCHANGED-VERIFIED] |
| S5 | vizarr | Repo `hms-dbmi/vizarr`, branch `main`, `package.json` version `0.3.0`; **no GitHub releases** (`/releases/latest` → 404); last push 2026-06-22. Deps: [inline excerpt omitted; original artifact pin retained], [inline excerpt omitted; original artifact pin retained], [inline excerpt omitted; original artifact pin retained] ([inline excerpt omitted; original artifact pin retained]). Issues/PRs: #261 (CT support), #265 open (labels need `omero`), #271 open (3D translation breaks display), #273 merged 2026-03-17 (single-level-parent labels), #292 open (Chrome WebGL label rendering). | [UNCHANGED-VERIFIED] |
| S6 | napari documentation — [verbatim excerpt omitted; original artifact/source locator retained] | `napari/docs` repo, `docs/guides/units.md` on `main`, raw file captured this stage (4,294 B, sha256 `ef71dd31…5a11`, fetched 2026-10-03). **Version caveat:** docs `main` tracks the current release line (napari v0.9.x; v0.9.2 published 2026-09-29), not a pinned tag; statements are treated as [DOC] and re-verified against the pinned v0.9.2 at implementation time (T2/T3). | **NEW this stage** — captured to narrow former lead 1 (napari coordinate semantics for B2). |

Attempts made and abandoned this stage (recorded for honesty): `napari.org/stable/deep-dives/coordinates.html` (404), `napari/events.py` and `napari/utils/interactions.py` at `v0.9.2`/`main` (404 — the tag exists per S4, so those module paths have moved), and the GitHub contents listing for `napari/napari` (repeated 404). Consequence: the `MouseEvent` payload coordinate space remains a narrow open dependency (§8, lead 1), while the world/data transform **model** is now sourced via S6.

---

## 1. RQ1 + B4 — component precedents, comparison, minimal choice [largely UNCHANGED-VERIFIED]

### 1.1 The two compared implementations (independently discovered)

**A. napari + napari-ome-zarr plugin (Python/Qt desktop stack).** Version-specific captured behaviors:
- Plugin v0.10.0 reads with `zarr>=3.1.5` (zarr v2 stores included) and is independent of ome-zarr-py [OBS, S3 pyproject].
- Axes handling is version-branched: 0.6 `coordinateSystems`; 0.1/0.2 assume 5D `t,c,z,y,x` when `axes` missing; 0.3 string axes; 0.4 axis dicts (`ome_zarr_reader.py` L218–236) [OBS].
- v0.10.0 forwards per-axis `units`/`axis_labels` into napari layer metadata; its own comment records that napari *warns [verbatim excerpt omitted; original artifact/source locator retained] and hides units* when one layer lacks units (L249–258) [OBS]. S6 independently documents the same scale-bar/units fallback behavior from the docs side: if units are unset napari falls back to pixels, and if no consistent layer-list unit can be inferred the scale bar becomes dimensionless [DOC, S6].
- **Transform handling limitation (load-bearing):** `Multiscales.metadata()` (L260–286) uses **only `datasets[0].coordinateTransformations[0]`** (the scale), applies it to the *whole pyramid*, never composes the 0.4-mandated per-dataset `translation` (which 0.4 orders *after* scale, S1 L370), and never reads lower levels' own transforms. Multiscale-level transforms pass through a filter keyed on `input.name` designed for the 0.6 graph style; **[OBS, added per C5]** for 0.4-style multiscale-level transforms that lack `input`/`output` keys the comparison [inline excerpt omitted; original artifact pin retained] matches and the first such transform is appended — an accidental pass-through alongside the intended 0.6 path. Not plan-affecting: the gate does not delegate transforms to the plugin.
- Labels: accepted only if they also have `multiscales` (`Label.matches`), attached as children of the parent `Multiscales`, and **inherit the parent image's transform chain by assumption** (code comment: [verbatim excerpt omitted; original artifact/source locator retained]); the parent is found two directories up from the label path — layout convention, not `image-label.source.image` [OBS].

**B. vizarr 0.3.0 (TypeScript/Viv browser viewer).** `coordinateTransformations` were ignored until PR #261; its 3D translation path is still broken (issue #271, open: [verbatim excerpt omitted; original artifact/source locator retained]); labels were not loaded at all when the optional `omero` block was missing (issue #265, open — optional metadata treated as load-bearing); labels only displayed for multi-level parents until PR #273 (merged 2026-03-17); label rendering breaks on newer Chrome via a WebGL sampler error (issue #292, open). No release artifacts; version only from `package.json` [OBS].

### 1.2 Recommendation [CHOICE, with concrete tradeoff] [UNCHANGED-VERIFIED]

Build the prototype as a **small Qt desktop app embedding napari v0.9.2** (`QtViewer`; #9533 fixed attaching it to a pre-populated `ViewerModel`), feed it dask pyramids and layers, and **do not rely on the plugin's transform handling for calibration**: a thin in-prototype **metadata gate** (§6) parses the 0.4 metadata itself, computes calibrated geometry, validates labels, and sets layer `scale`/`translate`/`units` itself (plugin used as data-access precedent and fallback reader).

**Chosen component tradeoff [CHOICE]:** heavier install (Qt/vispy/numcodecs, napari ≥0.6, zarr ≥3.1.5, Python ≥3.11) and we own the calibration math, **in exchange for**: a native desktop surface; per-layer transforms that napari composes correctly in one world space ([DOC, S6]: layer `scale`/`translate` transform data coordinates into rendered world coordinates, so image and label layers align in world space when both carry correct transforms); no browser/GL runtime risk (contrast vizarr #292); and no inheritance of vizarr's open label/omero defects (#265, #273-class, #271). vizarr remains the documented fallback renderer for a possible web-embed variant; its open issues are precisely the refusal-path classes this prototype must handle explicitly.

---

## 2. RQ2 — what NGFF 0.4 requires/permits for this input [UNCHANGED-VERIFIED]

All [SRC] per S1 unless noted. The critic verified every normative statement below verbatim against the captured 0.4 text, with conditions and exceptions preserved.

1. **Storage contract.** Arrays MUST be stored per Zarr v2 spec; NGFF metadata MUST live in Zarr group attributes (`.zattrs`) (L64–65). Axis *names* are arbitrary (L79–80); `axes` entries MUST have unique `name` (L241), SHOULD have `type` (space/time/channel; L242) and SHOULD have `unit` from the UDUNITS-2 list (L243–245). **Units and even types are optional — calibration may legitimately be absent.**
2. **Per-level transforms (calibration interpretation).** Each `datasets[]` MUST contain `coordinateTransformations` that [verbatim excerpt omitted; original artifact/source locator retained] (L367); only `scale`/`translation` types allowed (L368); **exactly one `scale`** — pixel size in physical units, or, [verbatim excerpt omitted; original artifact/source locator retained], the **relative factor vs the first resolution**, defaulting to 1.0 (L369; per-axis exception); **MAY contain exactly one `translation`** = offset from origin in physical units, which MUST be listed **after** scale (L370; conditional on presence); lengths MUST equal `len(axes)` (L371). List entries are [verbatim excerpt omitted; original artifact/source locator retained] (L346). A multiscale-level `coordinateTransformations` MAY exist, applies to all levels, and is applied **after** the dataset-level transforms (L374–376).
   → Cursor formula [SRC mapping + INF application]: [inline excerpt omitted; original artifact pin retained] for level *k*; unit = the axis's `unit` if present. **Per-level, mixed absolute/relative scale semantics on one axis are permitted by L369** — fixture F2 (§7, added this stage per former lead 7) exercises this.
   → **Metadata declaration is not an alignment guarantee**: the spec defines the coordinate *mapping*; nothing certifies that level-1 data are actually sampled at the declared lattice points, nor that label levels are co-sampled with image levels. The overlay obligation (B3) therefore cannot rest on the format alone. The only normative cross-constraints are structural (level-count parity; the layout sketch's [verbatim excerpt omitted; original artifact/source locator retained] is an informal figure comment, L98–101).
3. **Resolution switching.** `datasets[].path` MUST be ordered largest→smallest (L362–364); multiple `multiscales` entries: user chooses by name, fallback first (L389–401); `version` SHOULD be present ([verbatim excerpt omitted; original artifact/source locator retained]) (L378). [OBS] ome-zarr-py reader at v0.19.2 defaults a missing version to `"0.1"` and validates axes against the claimed format (`format_from_version` / `Axes(...)`, [verbatim excerpt omitted; original artifact/source locator retained]) — a precedent for strict version checks.
4. **Image/label association.** A `labels` sibling group lists label paths (L448–457); [verbatim excerpt omitted; original artifact/source locator retained] (L459). A label group MUST contain `multiscales` and the image and label `datasets` series MUST have **the same number of entries** (L466–467). Association to the image is by *convention*: `image-label.source.image` is only MAY, default `"../../"` (L487–491). [INF] per-level *scale equality* is **not** guaranteed by 0.4 text and must be checked, not assumed — despite both compared viewers assuming it (S3 label-inherits-parent; S5 needed #273, and #271 notes CT handling [verbatim excerpt omitted; original artifact/source locator retained]).
5. **`omero`** is transitional, optional, display-only (L439–443). [OBS] vizarr's failure to show labels without `omero` (#265) is exactly the dependency this prototype avoids.

---

## 3. RQ3 + B4 — real issue → fix → test chains and the engineering lesson

### 3.1 Chains [UNCHANGED-VERIFIED with C2/C3 precision corrections]

**Chain 1 (primary; calibration/resolution-switching, ome-zarr-py).**
- **Issue** #403 (2024-11-06): for 0.4, `generate_coordinate_transformations` emitted **scale-only** per-level transforms: [verbatim excerpt omitted; original artifact/source locator retained] [OBS, S2i].
- **Fix** PR #590 (merged 2026-06-17T15:55:02Z, [verbatim excerpt omitted; original artifact/source locator retained], in the **v0.19 line**; first release carrying it not evidenced — C3). **Formula attribution split per file [CORRECTION per C2]:**
  - `ome_zarr/classes/image.py` computes per axis [inline excerpt omitted; original artifact pin retained] (reference = level-0 scale).
  - `ome_zarr/format.py::generate_coordinate_transformations` hardcodes the reference to `[1.0]*ndim`, i.e. [inline excerpt omitted; original artifact pin retained] in its dimension-ratio convention — **coinciding with the `image.py` path only when level-0 scale is 1.0**.
  - Both paths emit [inline excerpt omitted; original artifact pin retained] with `classes/image.py` adding the `Translation`; a future fixture must pin which writer path it emulates and must not assume the two agree.
- **Tests** `tests/test_writer.py`: assertions changed from [inline excerpt omitted; original artifact pin retained] to [inline excerpt omitted; original artifact pin retained] across image and **label** writer tests, with expected translations recomputed in-test [OBS].
- **Release status:** v0.19.2 (2026-09-08) is the latest release and lists #652; #590 is in the v0.19 line [OBS, C3-weakened].

**Chain 2 (secondary; level-path references, ome-zarr-py v0.19.2).** PR #652: rewriting level paths [inline excerpt omitted; original artifact pin retained] updated `datasets[].path` but not `datasets[].coordinateTransformations[].input.path`, desynchronizing metadata; fix raises on [inline excerpt omitted; original artifact pin retained] and rewrites the reference; regression test `test_normalize_resolution_level_paths`; shipped in v0.19.2 [OBS, S2q].

**Corroborating chain in the compared component (vizarr):** PR #273 (labels hidden for single-resolution parents, merged 2026-03-17) followed by test-fixture hardening (per-label name/resolution-level details in snapshot tests, PR #334, merged 2026-03-17) [OBS, S5; #334 details per critic's note not individually re-pulled this stage].

**Scoped lesson [INF — unchanged, critic-supported]:** the fragile point of this format in practice is *derived per-level metadata*: writers under-generate it (#403), refactors desynchronize its internal references (#652), and viewers over-assume it (labels inherit parent transforms, S3; transform support lagging, S5). Therefore the prototype must (a) treat each level's transform chain as data to be **validated for self-consistency** (exactly-one-scale, order scale→translation, lengths, level-count parity for labels), and (b) **never infer level-*k* geometry from level-0 geometry**. [CHOICE] When a store's level-1 lacks a translation (pre-#590 writer style), the viewer shows the metadata-honest interpretation plus a visible warning that cross-level alignment may be approximate (T6).

---

## 4. METHOD three-proposition check (one per research question)

| # | Proposition | Source/version | Applicability condition | Exception | Normative force | Evidence class |
|---|---|---|---|---|---|---|
| P1 | Desktop stack = napari 0.9.2 (QtViewer embed) rendering dask pyramids, with an in-prototype 0.4 metadata gate owning calibration; napari-ome-zarr v0.10.0 = reference reader precedent; vizarr 0.3.0 = compared alternative, not chosen | S3 v0.10.0 `ome_zarr_reader.py` L249–258, L260–286; S4 v0.9.2 (tag `5956392`) notes; S5 issues #265/#271/#292; S6 units guide | Local 2-level 2D zarr-v2 NGFF 0.4 store | If a future plugin release composes per-level [inline excerpt omitted; original artifact pin retained] fully, the gate can shrink to validation-only | Plugin limitations are *observed code*, not spec; choice is reversible; S6 is descriptive [DOC] of the world/data transform model, to be re-verified on the pinned version at implementation time | [OBS]+[DOC]+[CHOICE]; **[CORRECTION, kept from proposal]**: [verbatim excerpt omitted; original artifact/source locator retained] is **rejected** — captured code drops the 0.4 per-dataset translation and applies dataset-0 transforms to all levels, re-creating the #403/#271 misalignment class in-display |
| P2 | Physical cursor = per-level chain [inline excerpt omitted; original artifact pin retained] (translation after scale, physical units), then multiscale-level transform; unit display only if the axis has a `unit`; otherwise index-unit readout with µm display withheld | S1 L346, L367–376, L243–245; S6 (napari renders layer `scale`/`translate` data→world; scale-bar pixels/dimensionless fallback) | Level has exactly one scale (relative-only axes permitted per L369, per-axis); optional translation | Absolute-µm readout additionally requires a `unit`; relative-factor axes are displayed as factors, never as µm; napari units are Pint-valid strings (`micrometer`/`um`/`µm` equate, S6) | Normative [SRC] for the mapping; S6 is [DOC] for the rendering semantics; readout withholding is [CHOICE] implementing the brief's [verbatim excerpt omitted; original artifact/source locator retained] | [SRC]+[DOC]+[CHOICE] |
| P3 | Label overlay policy (revised this stage — two tiers): overlay shown when (normative core) label is listed in sibling `labels` group or `image-label.source.image` resolves, label is `multiscales`+`image-label`, and level counts are equal (S1 L448–467, L487–491) **and** (tier 1 [CHOICE]) per-level spatial scales match the image within tolerance → direct overlay; **(tier 2, new)** scales differ but the label's own per-level chain is complete and self-consistent → metadata-honest overlay in world space with a visible warning naming the per-level factor; refusal only when the normative core fails or the label's chain is missing/malformed | S1 L446–467, L487–491; S2p/S3/S5 failure history for why checking is needed | Prototype scope: exactly 2 image levels | Spec fixes only level-count parity (MUST); scale-match is engineering caution, not spec; nearest-neighbor label sampling is [CHOICE] | MUST-level for level-count parity and label structure; tier-1/tier-2 policy is [CHOICE]+[INF]; refusal state implements the brief's [verbatim excerpt omitted; original artifact/source locator retained] | [SRC]+[INF]+[CHOICE]; **[CORRECTION, kept and strengthened]**: "a label found under `labels/` can be overlaid directly on the image" is **rejected** — 0.4 gives no alignment guarantee (§2.4), and both compared viewers shipped bugs from that assumption (#273/#271/#265; S3 inherits-by-assumption) |

**P3 revision rationale (critique-driven):** the critic flagged (§5, item 3) that the proposal's hard 1e-6 refusal had a [verbatim excerpt omitted; original artifact/source locator retained]: anisotropic stores or non-2^k pyramids can produce *legitimate* per-level scale divergence that 1e-6 would refuse. With a complete, self-consistent per-level label chain, the 0.4 mapping fully determines world-space placement, so a warned metadata-honest overlay is justifiable; refusal stays reserved for the case where the alignment assumptions genuinely *cannot be established* (missing/malformed chain, level-count mismatch, unresolvable association) — matching the brief's wording.

---

## 5. Numerical witness (UNEXECUTED) — calibration & resolution interpretation [corrected per C1, C2, C4]

**Fixture F1 [CHOICE values; pixel-content semantics added per C4]:** axes `[{name:"y",type:"space",unit:"micrometer"},{name:"x",type:"space",unit:"micrometer"}]`;
- level `"0"`: shape (64, 64), CTs `[{"type":"scale","scale":[0.5,0.5]},{"type":"translation","translation":[0.0,-10.0]}]` (µm; x-offset −10 µm);
- level `"1"`: shape (32, 32), CTs `[{"type":"scale","scale":[1.0,1.0]}]` — no translation.
- **Pixel-content semantics [CHOICE, C4]:** the two arrays depict the *same scene* co-sampled at the declared lattices: every level-1 pixel (y, x) shows the region covered by the level-0 pixels whose declared level-0 lattice maps into it, and the level-0 x-axis starts at −10 µm per its stored translation. Without this data semantics, a marker test (T4) would be vacuous — it would pass on metadata alone while proving nothing about display.

Physical point **P = (y = 20.0 µm, x = 14.0 µm)** (chosen because it separates all interpretations).

Hand-reasoned index computations (all UNEXECUTED; no arithmetic tool admitted in this stage):

- **Interpretation A (proposed; stored per-level metadata; absent translation = 0):**
  level 0: y = 20.0 / 0.5 = **40**; x = (14.0 − (−10.0)) / 0.5 = 24.0 / 0.5 = **48** → sample **(40, 48)**.
  level 1: y = 20.0 / 1.0 = **20**; x = 14.0 / 1.0 = **14** → sample **(20, 14)**.
- **Interpretation B — *constructed competing interpretation* (re-labeled per C1; no upstream source produces exactly this):** level-1's own scale with level-0's translation inherited:
  level 1: y = 20.0; x = (14.0 + 10.0) / 1.0 = **24** → sample **(20, 24)**.
- **Interpretation B′ — *plugin-exact inheritance* [added per C1]:** the captured S3 code inherits dataset-0's **scale** (0.5) to all levels and drops translations entirely:
  level 1: y = 20.0 / 0.5 = **40**; x = 14.0 / 0.5 = **28** → sample **(40, 28)**.
- **Variant C — generator product choices, pinned per file [C2]:** a *writer* (not a consumer) following PR #590 would store a level-1 translation:
  - `classes/image.py` path: 1.0/2 − 0.5/2 = 0.5 − 0.25 = **0.25** → consumer index x = (14.0 − 0.25)/1.0 = **13.75** → nearest sample 14 with a 0.75 px (0.75 µm) center-offset.
  - `format.py` path: 1.0/2 − 0.5 = **0.0** → index x = **14.0** exactly.
  The two writer paths disagree on this fixture (0.25 vs 0.0); C-`format.py` coincides with A's nearest sample only accidentally. This is why T6 pins the emulated writer path.

**Discrimination:** at level 0 all consumer interpretations render identically ((40,48)); at level 1, A = x-index 14, B = 24, B′ = (40,28) — **distinct array indices, 10 array px = 10 µm apart**, so a viewer implementing B or B′ looks correct at level 0 and misplaces cursor/overlay after switching: exactly the #403/S3/#271 failure class. The C variants differ from A only at sub-pixel float precision (13.75 vs 14.0), i.e., they are discriminated by the float index, not by nearest sample. The 0.4 text supports A: per-dataset transforms map *that level's* data coordinates (L367) and translation MAY be absent (L370), so nothing licenses inheriting level-0 geometry. T2 asserts A against **not-B, not-B′, and not-C-values**; T4 shows the same discrimination physically on screen (marker stays on the same feature only under A, given F1's declared pixel-content semantics).

---

## 6. Revised implementation plan (replaces thin-plan steps 1–4; B1–B4)

1. **Input contract & support checks (B1).** Open the local path read-only (zarr v2 via zarr-python; no writes, no sidecar files). The gate runs ordered checks, each with a distinct refusal message: (i) `.zgroup` + `.zattrs` with `multiscales`; (ii) select one multiscale entry (name match else first, per S1 L389–401); (iii) `version` SHOULD be [verbatim excerpt omitted; original artifact/source locator retained] — accept [verbatim excerpt omitted; original artifact/source locator retained] with warning (string axes), **reject >0.4** as unsupported [CHOICE grounded in S1 L19–21 and the >0.4 churn observed in S2/S3]; (iv) exactly 2 axes, both `type:"space"`; axes length == array dims; unique names; (v) exactly 2 `datasets[]`, paths ordered largest→smallest, each with `coordinateTransformations`: exactly one scale, optional translation listed after, lengths == 2; (vi) unit check: present-and-UDUNITS-named → calibrated mode (values passed to napari as Pint-valid strings, e.g. `micrometer`, per S6); absent → index mode. Missing optional labels ⇒ [verbatim excerpt omitted; original artifact/source locator retained] status; image still opens. Unsupported input ⇒ refusal screen listing failed check number and observed value. [SRC for check content; CHOICE for strictness]
2. **Calibrated inspection (B2).** The gate's own transform module composes, per level: scale → translation (→ multiscale-level transform last). Cursor readout shows array index, physical x/y with unit, and the current level's scale (unequal axis scales shown per-axis, e.g. [verbatim excerpt omitted; original artifact/source locator retained]); scale bar from level-0 scale; unit-less mode shows [verbatim excerpt omitted; original artifact/source locator retained]. The gate sets layer `scale`/`translate`/`units` itself; napari renders data→world through these ([DOC, S6]), so the gate's physical coordinates and the displayed geometry share one model. Image and label layers receive **identical units** to avoid napari's inconsistent-units unit hiding ([OBS, S3 L249–258]; corroborated by S6's scale-bar dimensionless fallback). **Event wiring (narrow open lead 1):** the cursor hook's coordinate payload (world vs canvas) is verified at implementation time by T2/T4 — assert the displayed/gate-predicted index agreement at both levels; the gate recomputes per level from *that level's* chain regardless of payload space, which contains the risk to a single conversion constant.
3. **Resolution switching + label overlay (B3).** Two-level switcher (manual) + auto level pick by zoom; on switch, cursor/overlay geometry is recomputed from *that level's* chain (§5, never from level-0). Overlay discovery: sibling `labels` group (accept `image-label.source.image` when present); then the P3 two-tier policy: normative core (association, `multiscales`+`image-label`, level-count parity) must hold — else actionable refusal naming the failed condition ([verbatim excerpt omitted; original artifact/source locator retained]); tier 1: per-level scales match within tolerance → direct overlay; tier 2: scales differ but the label chain is complete/self-consistent → overlay in world space with visible warning naming the per-level factor ([verbatim excerpt omitted; original artifact/source locator retained]); label layer drawn **nearest-neighbor**, visible-off by default [CHOICE; matches plugin precedent].
4. **Validation & visible limits (B5).** Fixtures/tests in §7 (F2 added). Visible limits panel: local files only; 2D; single selected multiscale entry; no plate/well/HCS, no time axes, no unit conversion between scales (native unit display only), no annotation/authoring.

---

## 7. Discriminating validation cases (all PROPOSED / UNEXECUTED)

- **T1 contract:** minimal valid 2-level store opens; delete `multiscales` → refusal (check i); add third dataset → refusal (check v).
- **T2 calibration math (witness):** gate on F1 returns level-0 **(40,48)** and level-1 **(20,14)** for P; assert **not** (20,24) (B), **not** (40,28) (B′), and float index ≠ 13.75 / ≠ 14.0-with-0.25-offset (C-values). Pure-function unit test once implemented.
- **T3 unit fallback:** F1 minus `unit` on both axes → readout [verbatim excerpt omitted; original artifact/source locator retained], µm text withheld, scale bar unit-less ([DOC, S6] predicts napari falls back to pixels — asserted here, verified at implementation).
- **T4 switch invariance (grounded per C4):** relies on F1's declared pixel-content semantics (§5): the marker marks a *scene feature*, present in both levels' arrays at the declared lattices. With P marked at level 0, switching to level 1 must keep the marker on that feature (requires per-level transform application). Negative control: a plugin-class viewer that drops per-dataset translations is *not* self-consistent across F1's levels (level-0 display shifted +10 µm relative to level 1), so the marker visibly jumps — reproducing the S3 behavior as the failure demo.
- **T5 label gates:** (a) compliant label → overlay aligns (marker inside same labeled object at both levels); (b) label with 3 levels → refusal citing S1 L466–467; (c) label with 2 levels, level-1 scale 2× off, chain complete → tier-2 warned overlay naming the factor (revised from hard refusal); (d) label with missing level-1 transforms → refusal ([verbatim excerpt omitted; original artifact/source locator retained]).
- **T6 legacy-writer warning (writer-path pinned per C2):** two variants — scale-only level-1 (#403 shape) and `format.py`-convention [inline excerpt omitted; original artifact pin retained] with trans = s/2 − 0.5 — both get the metadata-honest display; the first additionally shows [verbatim excerpt omitted; original artifact/source locator retained]. The variants are asserted to produce *different* stored level-1 geometry, demonstrating the two writer paths must not be conflated.
- **T7 read-only:** sha256 of all store files before/after a session unchanged.
- **T8 mixed scale semantics (new, per former lead 7):** fixture **F2** — level 0: scale [inline excerpt omitted; original artifact pin retained] µm + translation; level 1: scale [inline excerpt omitted; original artifact pin retained] with the y entry as a *relative factor* (no y unit applicability) and the x entry as absolute µm, translation present. Gate must (i) accept the mixed vector per S1 L369, (ii) display y as factor and x in µm on the same readout line, (iii) cursor formula applies per-axis semantics (y factor relative to level-0 y scale). UNEXECUTED.

---

## 8. Critique response — which points changed the plan and why

| Critique point | Disposition | Change made |
|---|---|---|
| **C1** (witness B provenance) | **Changed the plan.** B was mislabeled as [verbatim excerpt omitted; original artifact/source locator retained]; the plugin-exact value differs. | §5 re-labels B as a *constructed* competing interpretation (legitimate per METHOD) and adds **B′ = (40,28)** as the plugin-exact inheritance result; T2 now asserts against both. T4's attribution to the plugin survives unchanged (it drops per-dataset translations on image and label alike). |
| **C2** (#590 formula attribution) | **Changed the plan.** One formula was attributed to PR #590 as a whole; the two writer files differ. | §3.1 splits the attribution (`classes/image.py` vs `format.py` hardcoded `[1.0]` reference; coincide only when level-0 scale is 1.0); §5 splits C into C-`image.py` (0.25) and C-`format.py` (0.0); T6 pins the emulated writer path. |
| **C3** ([verbatim excerpt omitted; original artifact/source locator retained]) | **Changed the plan.** Not evidenced that v0.19.2 is the first release carrying #590. | §3.1 and S2q now say [verbatim excerpt omitted; original artifact/source locator retained]. |
| **C4** (T4 fixture grounding) | **Changed the plan.** T4 was vacuous without pixel-content semantics. | §5 F1 now declares scene co-sampling semantics and the level-0 x-origin; T4 states the feature-based criterion and why the negative control bites (level-0 display shifted +10 µm). |
| **C5** (`from_intrinsic` None==None pass-through) | **Recorded, no plan change.** | §1.1 adds the observation; noted as not plan-affecting since the gate owns transforms. |
| Critic §5 item 3 (1e-6 tolerance counterexample) | **Changed the plan.** Hard refusal could reject legitimate stores. | P3/§6.3 restructured into the two-tier policy (match → overlay; differ-with-complete-chain → warned metadata-honest overlay; missing/malformed chain or normative failure → refusal). T5(c)/(d) updated accordingly. |
| Critic §5 item 1 (napari event coordinate space) | **Partially resolved; remainder stays open.** | Captured S6 (napari docs, units/world-space model): layer `scale`/`translate` map data→world; scale-bar pixel/dimensionless fallbacks. This grounds B2's transform model; the `MouseEvent` payload space itself could not be pinned to v0.9.2 this stage (§0 abandoned attempts) and remains lead 1, verified by T2/T4. |
| Critic §5 item 7 (mixed scale semantics unexercised) | **Changed the plan.** | Fixture F2 + T8 added (§7). |
| Critic §5 items 2, 4, 5, 6 (zarr layouts; vizarr 2D; mixed-writer corpora; version churn) | **Unchanged — remain open.** | Kept visible in `out/UNRESOLVED_LEADS.md`; none is claimed resolved. |

**Preserved as verified-correct (critic confirmed, no change):** all S1 normative readings and the declaration-vs-guarantee separation; the two component comparisons and the recommendation/tradeoff; both issue→fix→test chains and the scoped lesson; the P1/P2 propositions; the witness's arithmetic (all values re-derived identically by the critic) — its *labels and attributions* are what this correction fixed.

---

## 9. Obligation map

- **B1** → §6.1 (input contract, ordered gate checks, version policy, absent-label status, refusal screen, read-only boundary) + §7-T1/T7.
- **B2** → §2.2 + P2 (§4) + §6.2 (physical cursor formula, units, fallback/withheld behavior, [DOC] grounding) + §7-T2/T3/T4.
- **B3** → §2.4 + P3 (§4) + §6.3 (association, transform, nearest-neighbor sampling [CHOICE], two-tier alignment policy, actionable refusal states) + §7-T5.
- **B4** → §1 (two independently discovered implementations, recommendation + concrete tradeoff) + §3 (two issue→fix→test chains + corroborating chain), with [OBS] vs [INF] vs [CHOICE] separated throughout.
- **B5** → §6–§7 (concrete revised steps, discriminating validations, visible limits, nothing claimed executed) + `out/UNRESOLVED_LEADS.md` (open consequential dependencies).
- **RQ1** → §1; **RQ2** → §2 (+ §4-P2); **RQ3** → §3 (+ witness §5).
- **METHOD** → §4 (three propositions with source/version, condition, exception, normative force, evidence class; two supported [CORRECTION]s) + §5 (self-derived discriminating witness with intermediate reasoning and competing interpretations; arithmetic reasoned, UNEXECUTED).

## 10. Visible limits

Plan only — no implementation, no executed tests. All arithmetic hand-reasoned. Sources captured at their cited versions on 2026-10-03; S6 carries a docs-`main` version caveat. Version churn (napari monthly cadence; plugin/zarr triangle) means pins must be re-validated on upgrade (lead 5). The prototype's honesty features (unit withholding, warned overlay, refusal screens) are product consequences of the documented gap between *declared* metadata and *guaranteed* alignment, which is the case's central finding.
