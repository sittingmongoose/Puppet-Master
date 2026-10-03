# Research proposal — local calibrated 2D OME-NGFF 0.4 read-only viewer (revised thin plan)

Case: V8-BIO-RETR-C-M, research stage. Scope: one local OME-NGFF **0.4** image, 2D, exactly two
resolution levels, one optional categorical label image; read-only; no 3D, time series, cloud
stores, authoring, segmentation, registration estimation or conversion (per `inputs/BRIEF.md`).

Labels used throughout, as required by the brief:
**[S]** source fact (quoted or tightly paraphrased from a cited primary source, with its normative
force preserved) · **[I]** engineering inference from source facts · **[P]** product choice for this
prototype · **[C]** supported correction of an assumption in the thin plan or general practice.

## Research-order note (per METHOD.md)

Three coherent batches: (1) the OME-NGFF 0.4 specification (one capture, reused for Q2, B1–B3);
(2) two independent implementations — ome-zarr-py (reader/napari plugin) and vizarr (web viewer) —
READMEs, changelog, reader source, versions; (3) upstream issue → fix → test histories in both
repos plus the desktop shell (napari) release. Earlier captures were reused where they bear on
later obligations; no cross-case material was consulted.

## Evidence base (exact locators; all captured 2026-10-03)

- **NGFF spec**: *OME-NGFF specification, 0.4 release*, https://ngff.openmicroscopy.org/0.4/index.html
  (capture sha256 `ca4780a33f9561cfd2d983651fdcc745dce0d6089f5cf775744a54e8394a5269`). Sections cited
  below as §1.3 (RFC 2119 conventions; "This is the 0.4 release"), §2 (Zarr v2 layout, `.zattrs`),
  §2.1 (image/labels layout, informative label-dimension note), §3.1 (axes), §3.3
  (coordinateTransformations), §3.4 (multiscales), §3.5 (omero, transitional), §3.6 (labels), §3.7
  (image-label).
- **ome-zarr-py**: repo `ome/ome-zarr-py`, default branch `master` (GitHub API, sha256 `b301149c…`);
  `CHANGELOG.md@master` (sha256 `4015dace…`; latest release **0.11.1, April 2025**; 0.4 support added
  in 0.3.0 via PRs #124/#159/#162; 0.10.2 "pin zarr at < 3"); `ome_zarr/reader.py@master`
  (sha256 `c46ba936…`); issue **#172** "Support multiscales coordinateTransformations" (open, opened
  2022-03-02); PR **#652** "bug: correctly normalize resolution level paths" (bug-labeled, merged
  2026-09-08; diff sha256 `50b0c983…`).
- **vizarr**: repo `hms-dbmi/vizarr`, default branch `main` (GitHub API); `README.md` and
  `package.json` on branch `master`: **version 0.3.0**, deps `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`,
  test runner `vitest` (package.json sha256 `bddde203…`); **no GitHub releases exist** (releases API
  returned `[]`, sha256 `db217bf1…`); PR **#261** "Apply OME coordinate transformations" (merged
  2025-03-06; diff sha256 `22066be8…`); issue **#271** "3D translation causes images to disappear"
  (open, 2025-04-03); issue **#288** "Problem displaying non square datasets" (2025-07-24, closed
  2025-09-12; timeline sha256 `fad36471…`); issue **#297** (2025-09-02, timeline sha256 `9b5b1545…`);
  PR **#298** "Use defaultMeta in loadOmeMultiscales if no omero" (merged 2025-09-03; diff sha256
  `f7a8b462…`).
- **napari**: release **v0.9.2**, published 2026-09-29 (GitHub releases API, sha256 `ac2b91f2…`;
  notes include "Add multiscale level extraction as a `LayerList` action" #9495).

---

## Q1 — Two existing components, version-specific behaviors, minimal choice (B4)

### Component A: ome-zarr-py (reader + napari plugin), 0.11.1 / `master`

Observed behavior **[S]**:
- `ome_zarr/reader.py`, class `Multiscales.matches`: triggers on `"multiscales" in zarr.root_attrs`
  (does **not** require `omero` — correct per spec §3.5 "The 'omero' metadata is optional").
  `Multiscales.__init__` reads `multiscales[0]`, resolves the format via
  `format_from_version(version)` with fallback `"0.1"` when `version` is absent, validates axes
  (`Axes(axes, fmt=fmt)` — "Raises ValueError if not valid"), and surfaces
  `node.metadata["coordinateTransformations"]` **only from per-dataset
  `datasets[].coordinateTransformations`**; the multiscales-level (group) `coordinateTransformations`
  permitted by §3.4 is not surfaced by this code path.
- `Labels.matches` expands the `"labels"` attribute list into child nodes; `Label.matches` parses
  `image-label`, resolves `image-label.source.image` (parent image) and extracts `colors`/`properties`.
- Version/support timeline from `CHANGELOG.md`: NGFF 0.4 read/write since 0.3.0 (Feb 2022); current
  release 0.11.1 (Apr 2025); zarr pinned `< 3` since 0.10.2.

### Component B: vizarr 0.3.0 (`master`), a minimal client-side Zarr/OME viewer on Viv ~0.19

Observed behavior **[S]**:
- PR #261 (merged 2025-03-06) introduced `utils.coordinateTransformationsToMatrix(multiscales)`
  ("Apply each transformation sequentially and in order according to the OME-NGFF v0.4 spec") and
  wired it in `ome.ts loadOmeMultiscales` as the layer `model_matrix` when no URL matrix is given.
  The implementation reads the transformations of **`multiscales[0].datasets[0]` only** (first
  resolution level) and throws if a scale/translation length ≠ axes length.
- PR #261's `fitImageToViewport` computes `zoom` from `availableHeight / (maxY - minX)` — an apparent
  typo (`minY` expected) in the merged diff; noted as an observed code detail **[S]**, no runtime
  claim made.
- Issue #271 (open): after #261, for the IDR `v0.4 idr0101A/13457537.zarr` sample "3D translation
  causes images to disappear"; the same thread records that the transformations support "was needed
  for scaling Labels to match parent Images".
- Issue #288: a real ngff-zarr-produced dataset whose final level has an **anisotropic scale**
  (y=50752, x=25376; earlier level 25376/25376 — values from the maintainer's diagnosis comment)
  rendered with the right side duplicating the image; maintainer: "I don't think that vizarr is
  taking the `dataset/scale` into account."
- Issue #297 → PR #298: vizarr applied `coordinateTransformations` only inside
  `loadOmeMultiscales`, and `src/io.ts` gated that on `utils.isOmeMultiscales(attrs)`, which required
  the **optional** `omero` key (spec §3.5 makes it optional). Spec-valid inputs without `omero`
  therefore silently ignored scale/translation (a user's negative-scale flip had no effect while
  napari rendered it correctly). PR #298 (merged 2025-09-03) changed `io.ts` to `isMultiscales(attrs)`
  and fell back to `defaultMeta` when `omero` is absent. **Neither #261 nor #298 added automated
  tests in their diffs**; verification upstream was a deploy-preview URL.
- Distribution constraint **[S]**: no GitHub releases; `package.json` on `master` says 0.3.0. Web
  (browser/Jupyter anywidget) only — the README's interfaces are the standalone web app and a Python
  anywidget, not a desktop window.

### Recommendation **[P]** (with tradeoff)

Build the prototype as a **napari 0.9.2 desktop window (Qt/vispy) hosting a thin read-only widget,
using ome-zarr-py 0.11.x `Reader` for hierarchy/label discovery plus our own small
calibration/alignment module** for the two-level interpretation. Tradeoff: napari+ome-zarr-py is a
heavier install (Qt, vispy, zarr<3 pin) and its reader surfaces only datasets-level transforms, so
we must implement group-level composition, unit display and the alignment checks ourselves; the
alternative, embedding vizarr 0.3.x, is lighter but is web-embedded rather than desktop, is not
released as a versioned artifact, and carries two open/recent transformation defects (#271 open,
#288 closed-without-linked-fix, per the timelines above) in exactly the calibration area this
prototype must get right. napari also gives per-layer `scale`/`translate` (the calibrated cursor and
aspect) and a labels layer with nearest-neighbor rendering as first-class primitives, and 0.9.2 adds
explicit multiscale level extraction (#9495) useful for resolution switching **[S for release notes;
P for use]**.

This satisfies B4's "two independently discovered implementations" (ome-zarr-py discovered via the
spec's own tooling references and GitHub; vizarr discovered via its independent README/repository)
with the concrete tradeoff stated above; observed upstream behavior is separated from our choices.

---

## Q2 — What NGFF 0.4 requires/permits for this input (B1–B3 normative basis)

All **[S]**, normative force preserved (§1.3: RFC 2119 keywords):

- **Storage/versions**: arrays MUST be stored per **Zarr v2**; NGFF metadata MUST be in group
  `.zattrs` (§2). The document "is the 0.4 release"; editor's-draft data is not necessarily supported
  (front matter). `multiscales.version` SHOULD indicate "0.4" (§3.4).
- **Axes (§3.1)**: each axis MUST have unique `name`; SHOULD have `type` (one of space/time/channel,
  custom MAY); SHOULD have `unit` — for space axes a **UDUNITS-2** name from the spec's enumerated
  list (e.g. `micrometer`), for time axes similarly. Units are therefore **optional** (SHOULD), and
  custom axis types are permitted. `axes` length MUST equal array dimensionality; order MUST match
  the arrays; time first, then channel/custom, then space; `zyx` ordering is a SHOULD for 3D (§3.4).
- **Calibration (§3.3, §3.4)**: each `datasets[]` MUST contain `coordinateTransformations` with
  **exactly one `scale`**; scale values are "the pixel size in physical units" — *or*, "If scaling
  information is not available or applicable for one of the axes, the value MUST express the scaling
  factor between the current resolution and the first resolution … defaulting to 1.0" (an explicit
  ambiguity a viewer must surface, see B2). **Exactly one `translation` MAY** be present and "MUST be
  listed after `scale`"; lengths MUST equal `axes`. Transformations "are applied sequentially and in
  order" (§3.3); `identity` "is the default transformation and is typically not explicitly defined"
  (§3.3 table). A multiscales-level `coordinateTransformations` MAY exist, "applied after" the
  dataset-level ones (§3.4). **Every level declares its own scale** — per-level anisotropy is
  permitted (nothing constrains scale ratios between levels), and datasets MUST be ordered largest →
  smallest resolution (§3.4).
- **Multiple multiscales entries**: "If only one multiscale is provided, use it. Otherwise, the user
  can choose by name, using the first multiscale as a fallback" (§3.4).
- **omero (§3.5, transitional)**: optional; if present MUST contain `channels` with `color` and
  `window` (min/max/start/end). Display hints, not calibration.
- **Image/label association (§3.6, §3.7)**: an image may carry a `labels` group whose `labels` key
  lists paths; "Unlisted groups MAY be labels" (so the list is not exhaustive). A label group has
  `image-label` metadata, MUST also contain `multiscales`, and "the two 'datasets' series MUST have
  the same number of entries" (level-count equality). `image-label.source.image` MAY give the
  associated image path, default `"../../"`. `colors[].label-value` MUST be unique integers;
  `rgba` MAY; a client that does not error SHOULD ignore all but the last duplicate entry.
- **Declaration vs. alignment guarantee — the load-bearing distinction [C]**: the specification
  *declares* each series' data→physical mapping but **contains no requirement that the label
  series' axes, scales or translations equal or correspond to the image series'** beyond level
  count. The only shape guidance is an **informative** layout comment (§2.1): label dimensions
  "should be either the same as the corresponding dimension of the image, or 1" — lowercase
  "should", non-normative placement. Overlay alignment is therefore **never guaranteed by the
  format**; it must be established per input and otherwise withheld. This corrects the thin plan's
  implicit assumption that "the label overlay" is showable once a label exists, and corrects any
  assumption that level 1 is an isotropic 2× downsample (§3.4 permits arbitrary per-level scales;
  realized in the wild per vizarr #288 **[S]**).

---

## Q3 — Real issue → fix → test chain and the scoped lesson (B4)

**Primary chain (ome-zarr-py), verified in the merged diff [S]:**
- *Failure*: PR #652 "bug: correctly normalize resolution level paths" (merged 2026-09-08). When a
  remote OME-Zarr whose resolution levels use paths `0,1,2` (not `s0,s1,…`) is opened and re-saved,
  the writer normalized `datasets[].path` but **not** the matching
  `datasets[].coordinateTransformations[].input.path`, leaving the written calibration metadata
  pointing at nonexistent level paths.
- *Fix*: `ome_zarr/classes/image.py`, `to_ome_zarr` (~L394): now rewrites the transform's
  `input.path` alongside `path` (raising a `ValueError` if `transform.input is None`).
- *Test*: `tests/test_writer.py::TestWriter::test_normalize_resolution_level_paths` (new, ~70 lines):
  builds a 3-level pyramid at paths `0/1/2` with per-level scales `2**level`, round-trips through
  `OMEZarrMultiscale.from_ome_zarr` → `to_ome_zarr`, and asserts both `path` and
  `coordinateTransformations[0]["input"]["path"]` are normalized to `s{i}`.
- *Scope condition*: the test exercises the current 0.6-style class API (`input`/`output` transform
  objects), not the 0.4 dict form; the failure mode (per-level calibration metadata drifting out of
  sync with level paths during resolution-level handling) transfers to our 0.4 path, the code does
  not **[S for the diff; I for the transfer]**.

**Supporting upstream history (vizarr), relevant to calibration/label alignment [S]:**
#261 made vizarr apply `coordinateTransformations` (previously ignored) via a single `model_matrix`
from `datasets[0]`; #271 (open) then reported 3D translations making images disappear and noted the
feature existed to "scale Labels to match parent Images"; #297 showed the optional-`omero` detection
gate silently disabling transforms for spec-valid inputs, fixed by #298; #288 showed a per-level
anisotropic scale being ignored in rendering. None of the three fix diffs (#261, #298) added
automated tests — upstream verified by manual deploy-preview only, and a regression (#271) followed.

**Scoped engineering lesson [I]:** (1) gate format detection only on metadata the specification
makes required (`multiscales`), never on optional keys (`omero`) — otherwise spec-valid inputs are
silently misread; (2) resolution switching must honor **per-level** transforms (a single level-0
matrix misrenders anisotropic levels and misplaces overlays); (3) every change to transform
interpretation must ship unit tests on the composed matrix/coordinate math — manual visual checks
missed the #271 regression, while the one upstream fix that did ship a test (#652) pins its
behavior. **Validation adopted for the prototype:** the F-suite in B5 replicates the #297 detection
case, the #288 anisotropic case, and a #652-style round-trip integrity check on our own metadata
module. None of these have been executed in this stage; no pass is claimed.

---

## Revised plan (B1–B5)

### B1 — Local input contract, version/support checks, read-only boundary [P, on S basis]

- Accept exactly: a local directory containing a Zarr v2 group with `.zgroup` + `.zattrs`
  `multiscales[0]` at version "0.4" (SHOULD; if absent → accept with visible "version undeclared"
  warning [I: reader fallback "0.1" exists, we choose to warn]); exactly 2 `datasets[]` paths,
  resolvable as arrays; ≤5-D axes with 2 space axes for our 2D window.
- Reject/refuse visibly ("unsupported input" state with reason string): no `multiscales`; version
  the module cannot interpret (≥0.5 constructs: coordinate systems/`ome` key); a dataset missing its
  MUST `scale` (§3.4) — shown as "missing required per-level scale", with pixel-index fallback
  display only behind an explicit user acknowledgment [P]; arrays not readable.
- Read-only boundary: open the store `mode='r'` (zarr-python, pinned `<3` per ome-zarr-py 0.10.2
  changelog **[S]**); no writes, no sidecar creation; the label overlay is derived in memory only.
- Absent optional labels: overlay control disabled with reason "no label image declared" — correct
  because `labels` association is optional (§3.6 lists are discovery aids; unlisted groups MAY be
  labels, so we do **not** auto-attach unlisted groups [P]).

### B2 — Physical cursor coordinates and calibrated display [P, on S basis]

- Interpretation (version 0.4): for pixel index `(y_i, x_i)` at level L,
  `physical = translation_L + scale_L ∘ index`, then apply any multiscales-level transformations
  after the dataset-level ones (§3.3/§3.4 ordering). Axis units from `axes[].unit` (UDUNITS-2 names,
  §3.1); displayed verbatim (no unit conversion in this prototype — conversion is a lead).
- Display: cursor readout `x = … <unit>, y = … <unit>`; per-axis scale indication
  (`<unit>/px` per axis, since scales may be unequal); scale bar only when both space axes carry
  units **[P]**.
- Fallback/withheld states: missing `unit` → readout in "px (no unit declared)" and scale bar
  suppressed with reason; missing/invalid scale → B1 refusal path; ambiguous dual meaning of scale
  (absolute size vs. relative factor, §3.4) → if level 0's scale values equal the relative factors
  pattern (all 1.0 at level 0 but a `name`/`metadata` hints otherwise) show an explicit
  "calibration semantics unverified" badge **[I/P]** — the spec permits both readings and the
  prototype does not guess silently.
- Conditions of validity: exact for axis-aligned scale+translation inputs only; rotation/affine is
  out of scope (0.4 restricts datasets-level transforms to `scale`/`translation` §3.4) **[S]**.

### B3 — Resolution switching and optional categorical label overlay [P, on S basis]

- Resolution switching: levels offered in metadata order (MUST be largest→smallest, §3.4); switching
  re-reads that level's **own** scale/translation (per-level anisotropy supported — the #288 lesson);
  the displayed aspect uses the active level's y/x scale ratio; napari 0.9.2's multiscale level
  action (#9495) is used for the switching UI **[P]**.
- Overlay association (in priority order): (1) `labels` group list entries (§3.6); (2) a group with
  `image-label.source.image` resolving to this image (§3.7, default "../../"); (3) nothing —
  unlisted groups are listed in an "undeclared groups" info line but never auto-attached **[P]**.
- Association is shown, not assumed: display the resolved path and provenance (`labels` list vs.
  `source.image`) next to the overlay toggle **[P]**.
- Alignment justification gate (all must hold, else withhold): label is integer-valued (§2.1);
  label `multiscales` has the same level count (MUST, §3.7); label spatial axes match the image's
  spatial axes by name and type (I: meaningful overlay requires a shared physical space; the spec
  does not guarantee it); composed physical extents of image and label at the same level agree
  within tolerance = max(0.5 × min axis unit, 1 px at that level) **[P tolerance]**.
- Sampling: label rendered nearest-neighbor (napari labels layer default) **[P]**; no interpolation
  of categories. When levels' physical grids differ slightly (within tolerance) the label is sampled
  through its own transform, not snapped to the image grid **[P/I]**.
- Actionable refusal states (visible, each with reason and the failing check): `no label declared`;
  `declared label not found on disk`; `level count mismatch (spec MUST)`; `axis mismatch
  (y/x names or types)`; `physical extent mismatch beyond tolerance (Δ=… <unit>)`; `label not
  integer-valued`. Withholding the overlay is always available and always explains itself.

### B5 — Concrete steps, discriminating validation cases, visible limits

Steps: (1) contract/version gate (B1); (2) metadata interpretation module (axes → units; per-level
transform composition incl. optional group-level; both readings of relative-scale flagged) (B2);
(3) resolution switcher honoring per-level transforms (B3); (4) label association + alignment gate +
refusal states (B3); (5) napari 0.9.2 wiring: image pyramid with per-layer `scale`/`translate`,
labels layer nearest-neighbor, cursor readout, scale bar, refusal widgets (B2/B3); (6) fixture suite
below; (7) docs of visible limits.

Discriminating fixtures **(proposed only — none executed in this stage; no pass is claimed)**:
- **F1 conformant**: 2-level 2D `y,x`, `micrometer`, unequal base scales (y=0.5, x=0.25), nonzero
  translations on both levels; label with matching transforms. *Discriminates:* cursor physical
  values exact (±1e-9), per-axis scale bar, overlay aligned.
- **F2 unitless**: F1 minus `unit`. *Discriminates:* "px (no unit declared)" fallback, scale bar
  withheld with reason.
- **F3 negative scale flip** (spec-permitted; vizarr #297 scenario), no `omero` in `.zattrs`.
  *Discriminates:* detection does not depend on optional keys; rendered flip and decreasing-x cursor.
- **F4 anisotropic level 1** (y ×4, x ×2; the #288 shape class). *Discriminates:* level switch keeps
  aspect true; overlay still aligned through per-level transforms.
- **F5 label integrity**: (a) label with only one level → refusal `level count mismatch`;
  (b) label translation offset beyond tolerance → refusal with Δ; (c) declared path missing on disk
  → refusal; (d) undeclared sibling label-like group → listed, not attached.
- **F6 missing per-level `scale`** (violates §3.4 MUST) → unsupported-input state; pixel fallback
  only after explicit acknowledgment.
- **F7 round-trip integrity** (the #652 lesson): our metadata module reads F1, re-serializes the
  level table, and must reproduce identical composed extents per level.
- **F8 two `multiscales` entries** → user picker with first-entry fallback (§3.4).

Visible limits (shipped in the UI "About/limits" panel): no unit conversion; no rotation/affine;
no writer; relative-vs-absolute scale ambiguity flagged, not resolved; group-level transforms
composed but only scale/translation types accepted; alignment tolerance is a product choice.

### Obligation coverage map

B1 → §B1 (contract, version checks, read-only, absent-label and unsupported behavior). B2 → §B2 +
Q2 calibration facts. B3 → §B3 + Q2 association facts. B4 → Q1 (two components, versions, tradeoff)
+ Q3 (issue → fix → test, observed vs. inference vs. choice separated). B5 → §B5 steps, fixtures,
limits, and `out/UNRESOLVED_LEADS.md`.
