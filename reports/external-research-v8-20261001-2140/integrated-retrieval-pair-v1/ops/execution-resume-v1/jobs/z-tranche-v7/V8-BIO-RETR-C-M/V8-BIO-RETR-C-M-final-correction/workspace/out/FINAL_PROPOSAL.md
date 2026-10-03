# FINAL PROPOSAL — local calibrated 2D OME-NGFF 0.4 read-only viewer (corrected after independent candidate critique)

Case **V8-BIO-RETR-C-M**, final-correction stage, 2026-10-03. Scope (unchanged, per `inputs/BRIEF.md`):
one local OME-NGFF **0.4** image, 2D, exactly two resolution levels, one optional categorical label
image; read-only; no 3D, time series, cloud stores, authoring, segmentation, registration estimation
or conversion. This is the complete corrected research-to-plan artifact; it supersedes the frozen
`inputs/PROPOSAL.md` and incorporates the critique in `inputs/CRITIQUE.md`. **No proposed test,
fixture or validation arithmetic has been executed in this or any prior stage of this case; no pass
is claimed for any of them.**

Labels used throughout (required by the brief): **[S]** source fact quoted or tightly paraphrased
from a cited primary source, with normative force preserved · **[I]** engineering inference from
source facts · **[P]** product choice for this prototype · **[C]** supported correction of the thin
plan, the frozen proposal, or general practice (traceable to a critique point C1–C9).

## 0. Correction-stage provenance and research-order note (per METHOD.md)

Two coherent batches in this stage, reusing frozen-stage captures wherever they bear on an
obligation; no cross-case material was consulted:

- **Batch 1 (spec, resolves C1/C3/C4/C7):** re-captured the NGFF 0.4 specification and read the
  exact normative bytes for the front matter, §1.3, §2, §2.1, §3.1, §3.3, §3.4, §3.5, §3.6, §3.7.
- **Batch 2 (implementations, resolves C2/C5/C6):** re-captured `ome_zarr/reader.py@master`, the
  vizarr releases API, and the vizarr issue #288 comment thread.
- Frozen research-stage captures (ome-zarr-py CHANGELOG/PR #652 diff, vizarr package.json/README/
  PR #261/#298 diffs, issues #271/#297, napari v0.9.2 release) were **not** re-fetched here; the
  independent critique states it re-derived their hashes and found every re-derivable one matching
  except C2 (corrected below). They are cited as inherited evidence.

Fresh captures this stage (host-recorded receipts, all 2026-10-03 UTC, exact response-body sha256):

- NGFF 0.4 spec, https://ngff.openmicroscopy.org/0.4/index.html — sha256
  `ca4780a33f9561cfd2d983651fdcc745dce0d6089f5cf775744a54e8394a5269`, **byte-identical** to the
  research-stage capture cited by the frozen proposal, so proposal and critique quotes were
  verifiable against the same bytes. Page self-identifies as "Final Community Group Report,
  1 October 2026", canonical URL `https://ngff.openmicroscopy.org/0.4/` ("This version").
- `ome/ome-zarr-py`, `ome_zarr/reader.py@master` — sha256
  `c46ba936598885a0119bb23452d9ed74f87258a5169daee615d028373c6a88f4` (matches the frozen citation).
- vizarr releases API `https://api.github.com/repos/hms-dbmi/vizarr/releases` — body `[]`, sha256
  `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` (see C2: this **replaces** the
  frozen proposal's broken locator `db217bf1…`).
- vizarr issue #288 comments
  `https://api.github.com/repos/hms-dbmi/vizarr/issues/288/comments` — sha256
  `6a6eb50e974e80f8b93df2de3273547fa8a0553e87cacca46504924abab3485b` (7 comments, 2025-07-24 to
  2025-07-28).

### Which critique points changed the plan, and why

| Pt | Critique finding | Resolution basis | Plan effect |
|----|------------------|------------------|-------------|
| C1 | "This is the 0.4 release…" is in the front-matter **"Status of this document"** block (`<h2 id="sotd">`), not §1.3 | **Verified fresh**: the sentence was read at the `sotd` block in this stage's spec capture; §1.3 ("Document conventions") holds the RFC 2119 paragraph and the "Transitional" definition | Evidence base re-locators in §Q2; supported fact (0.4 is the release; editor's-draft data not necessarily supported) unchanged [S] |
| C2 | Frozen locator `db217bf1…` cannot be the hash of the 2-byte releases body `[]` | **Verified fresh**: re-captured body `[]`, sha256 `4f53cda1…` (full value above) | Evidence-base locator corrected; fact "no GitHub releases" stands [S] |
| C3 | §3.4 relative-scale quote was truncated, dropping "for the given axis" and "defaulting to 1.0 **if there is no downsampling along the axis**" | **Verified fresh**: full sentence present in the §3.4 capture (quoted in Q2 below) | B2's ambiguity badge rationale now quotes the full conditional; F9 added (C8) to test the badge |
| C4 | §3.3 permits `scale`/`translation` vectors as `"path":str` ("binary data at a location in this container"); B1/B2 presupposed inline arrays, leaving spec-conformant `path`-form inputs outside every defined state | **Verified fresh**: §3.3 table rows read `one of: "translation":List[float], "path":str` and `one of: "scale":List[float], "path":str` | **B1 gains an explicit refusal state** ("transform vectors stored externally (`path` form) not supported") and **F6b fixture**; B2 formula now conditioned on inline form. Chose refusal over loading [P] to keep scope bounded; loading is a new lead |
| C5 | F4 claimed to replicate "#288 shape class", but the actual #288 final-level anisotropy is y ×2 / x ×1 on 3-length (3D) vectors | **Verified fresh**: #288 comments capture quotes `.zattrs` `scale5` `[793, 25376, 25376]` → `scale6` `[793, 50752, 25376]` (y doubles, x unchanged; z scale 793 constant) | F4 relabeled "**inspired by #288** (stronger anisotropy, 2D)"; it remains a valid — stronger — discriminator |
| C6 | `Multiscales.matches` is `bool(zarr.zgroup) and "multiscales" in zarr.root_attrs`; frozen proposal dropped the `zgroup` conjunct | **Verified fresh**: the exact line is in the `reader.py` capture | Q1 wording corrected; **B1's own detection gate now requires a Zarr v2 group** in addition to the `multiscales` key |
| C7 | F3 called negative scale "spec-permitted"; §3.4 nowhere authorizes it | **Verified fresh**: §3.4 constrains type/order/length only; no positivity constraint present — absence of constraint is an inference | F3 relabeled "**not forbidden by 0.4** [I]" (fixture unchanged; napari rendered #297's negative scale correctly [S]) |
| C8 | No fixture exercised B2's "calibration semantics unverified" badge | Plan change (no source needed) | **New fixture F9** (level-0 scale `[1.0, 1.0]`, level-1 `[2.0, 2.0]`) discriminating the badge state and reason string |
| C9 | F7 is not a replication of #652 (0.4 dict form has no `input.path` to drift; F7 checks composed extents) | Accepted as already adequately caveated | F7 kept as a **self-consistency check on our metadata module**, with the #652 caveat attached verbatim |

The recommendation (napari 0.9.2 + ome-zarr-py 0.11.x + own calibration module) is **unchanged** —
the critique confirmed every version/behavior fact supporting it and found no substantive factual
error in the frozen proposal.

---

## Q1 — Two existing components, version-specific behaviors, minimal choice (B4)

### Component A: ome-zarr-py (reader + napari plugin), 0.11.1 / `master`

Observed behavior **[S]** (reader.py fresh capture `c46ba936…` unless noted):

- `Multiscales.matches`: `return bool(zarr.zgroup) and "multiscales" in zarr.root_attrs` — the full
  detection condition (C6). It does **not** require `omero`, consistent with spec §3.5 "The 'omero'
  metadata is optional".
- `Multiscales.__init__` reads `multiscales[0]` only; `version = multiscales[0].get("version", "0.1")`
  (silent fallback to format 0.1 when `version` is absent); `fmt = format_from_version(version)`;
  `Axes(axes, fmt=fmt)` — comment in source: "Raises ValueError if not valid".
- `node.metadata["coordinateTransformations"]` is built as
  `[d.get("coordinateTransformations") for d in datasets]` — **only per-dataset transforms are
  surfaced; the multiscales-level (group) `coordinateTransformations` permitted by §3.4 is never
  read by this code path** (re-confirmed 2026-10-03; the open lead is unchanged).
- `Labels.matches` triggers on `"labels" in zarr.root_attrs` and expands the list into child nodes;
  `Label.matches` triggers on `"image-label"`, resolves `image-label.source.image` (parent image)
  and parses `colors` (int/bool `label-value`, optional `rgba`/255) and `properties`. Note for our
  design: upstream auto-descends into the `labels` child group (added invisible); we keep our own
  attach policy below [P].
- Version/support timeline (inherited capture, `CHANGELOG.md@master` sha256 `4015dace…`): NGFF 0.4
  read/write since **0.3.0 (Feb 2022)** via PRs #124/#159/#162; latest release **0.11.1 (April
  2025)**; **0.10.2 (Nov 2024)** "pin zarr at < 3"; no later entry unpins zarr, so "pinned < 3" as a
  current constraint is a fair inference [I].
- Issue **#172** "Support multiscales coordinateTransformations" (open since 2022-03-02) documents
  the transform-surfacing gap (inherited capture).

### Component B: vizarr 0.3.0 (`master`), a minimal client-side Zarr/OME viewer on Viv ~0.19

Observed behavior **[S]** (inherited captures, hashes re-derived by the critique):

- PR #261 (merged 2025-03-06; diff sha256 `22066be8…`) introduced
  `utils.coordinateTransformationsToMatrix(multiscales)` — comment: "Apply each transformation
  sequentially and in order according to the OME-NGFF v0.4 spec" — wired in `ome.ts
  loadOmeMultiscales` as the layer `model_matrix` when no URL matrix is given. It reads the
  transformations of **`multiscales[0].datasets[0]` only** and throws if a scale/translation length
  ≠ axes length. The same diff's `fitImageToViewport` computes `zoom` from
  `availableHeight / (maxY - minX)` — an apparent `minY`-expected typo, present verbatim in the
  merged diff; **no runtime claim is made** [S for the diff text].
- Issue #271 (open, created 2025-04-03): after #261, 3D translation makes images disappear for the
  IDR `v0.4 idr0101A/13457537.zarr` sample; the thread records the transformations support "was
  needed for scaling Labels to match parent Images".
- Issue #288 (created 2025-07-24; closed 2025-09-12 by the reporter per critique timeline check;
  no fix PR cross-referenced): a ngff-zarr-converted dataset whose final level has anisotropic scale
  (y 25376→50752, x unchanged 25376; 3-length vectors with constant z scale 793 — values from the
  maintainer's quoted `.zattrs`, re-verified in this stage's comments capture) rendered with the
  right side duplicating the image; maintainer (will-moore): "I don't think that vizarr is taking
  the `dataset/scale` into account", adding "The output that it generates is not incorrect, it's
  just that it's not handled correctly by vizarr (and possibly other tools…)" and that deleting the
  last level from the JSON fixed viewing. The ome-ngff-validator thumbnail showed the same square
  distortion — independent evidence that per-level anisotropy is broadly mishandled.
- Issue #297 → PR #298 (merged 2025-09-03; diff sha256 `f7a8b462…`): vizarr gated transform
  application on `utils.isOmeMultiscales(attrs)`, which required the **optional** `omero` key, so
  spec-valid inputs without `omero` silently ignored scale/translation (a user's negative-scale flip
  had no effect while napari rendered it correctly). #298 changed `io.ts` to
  `utils.isMultiscales(attrs)` and added a `defaultMeta` fallback. **Neither #261 nor #298 added
  automated tests in their diffs**; verification was a deploy-preview URL — and a regression (#271)
  followed the untested change.
- Distribution constraint **[S]**: **no GitHub releases** (releases API body `[]`, corrected locator
  sha256 `4f53cda1…`, C2); `package.json@master` sha256 `bddde203…` says version **0.3.0**, deps
  `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, test runner `vitest`; README interfaces are the
  standalone web app and a Python anywidget — web-embedded, not a desktop window. Default branch is
  `main`; the cited files were read on branch `master`.

### Recommendation [P] (with tradeoff)

Build the prototype as a **napari 0.9.2 desktop window (Qt GUI + vispy rendering) hosting a thin
read-only widget, using ome-zarr-py 0.11.x `Reader` for hierarchy/label discovery plus our own small
calibration/alignment module** for the two-level interpretation. **Tradeoff:** the napari+
ome-zarr-py stack is a heavier install (Qt, vispy, zarr<3 pin) and its reader surfaces only
datasets-level transforms, so group-level composition, unit display and the alignment checks are
ours to implement; the alternative, embedding vizarr 0.3.x, is lighter but web-embedded rather than
desktop, is not released as a versioned artifact (pin only by merge commit), and carries two
open/recent defects in exactly the calibration area this prototype must get right (#271 open;
#288 closed without a linked fix). napari provides per-layer `scale`/`translate`, a labels layer
with nearest-neighbor rendering, cursor readout and scale bar as first-class primitives, and
v0.9.2 (released 2026-09-29; inherited release capture sha256 `f5bae88a…`) adds "Add multiscale
level extraction as a `LayerList` action" (#9495), used for the resolution-switching UI [S for the
release notes; P for the use].

This satisfies B4's two independently discovered implementations (ome-zarr-py via the spec's own
tooling references; vizarr via its independent README/repository), with observed upstream behavior
separated from inference and product choices as labeled above.

---

## Q2 — What NGFF 0.4 requires/permits for this input (B1–B3 normative basis)

All **[S]** from this stage's spec capture (`ca4780a3…`); RFC 2119 keywords per §1.3 "Document
conventions" ("The key words 'MUST', 'MUST NOT', … 'MAY', and 'OPTIONAL' are to be interpreted as
described in RFC 2119"; the "Transitional" definition is also in §1.3). **Locator correction (C1)**:
"This is the 0.4 release of this specification. Migration scripts will be provided between numbered
versions. Data written with the latest version (an 'editor's draft') will not necessarily be
supported." stands in the unnumbered front-matter **"Status of this document"** block, before §1 —
not in §1.3.

- **Storage/versions (§2, §3.4)**: "Arrays MUST be defined and stored in a hierarchical organization
  as defined by the version 2 of the Zarr specification. OME-NGFF metadata MUST be stored as
  attributes in the corresponding Zarr groups." `multiscales.version` SHOULD indicate the version
  ("current version is 0.4") — SHOULD, so absence is conformant (B1 warns rather than refuses).
- **Axes (§3.1, §3.4)**: each axis MUST contain unique `name`; SHOULD contain `type` ("space",
  "time", "channel", custom MAY); SHOULD contain `unit`, "valid units according to UDUNITS-2"
  (enumerated lists include `micrometer` for space). Units are therefore **optional** (SHOULD).
  `axes` length MUST be 2–5 and equal the array dimensionality; order MUST match the arrays and MUST
  be ordered by type — time first, then channel/custom, then space; `zyx` ordering is a SHOULD for
  three spatial axes.
- **Calibration (§3.3, §3.4)**: each `datasets[]` MUST contain `coordinateTransformations`; "The
  transformation MUST only be of type `translation` or `scale`. They MUST contain exactly one
  `scale` transformation that specifies the pixel size in physical units **or time duration**. If
  scaling information is not available or applicable for one of the axes, the value MUST express the
  scaling factor between the current resolution and the first resolution **for the given axis,
  defaulting to 1.0 if there is no downsampling along the axis**." (Full conditional per C3 — the
  relative-scale reading is per-axis and its 1.0 default is conditional.) "It MAY contain exactly one
  `translation` that specifies the offset from the origin in physical units. If `translation` is
  given it MUST be listed after `scale`"; scale/translation array length MUST equal `axes`.
  Transformations "are applied sequentially and in order" (§3.3); `identity` "is the default
  transformation and is typically not explicitly defined" (§3.3 table). A multiscales-level
  `coordinateTransformations` MAY exist, MUST follow the same type/order rules and "are applied
  after" the dataset-level ones (§3.4). **Every level declares its own scale**; nothing constrains
  scale ratios between levels (per-level anisotropy is permitted — realized in the wild per vizarr
  #288 [S]); `datasets[].path`s "MUST be ordered from largest (i.e. highest resolution) to
  smallest".
- **Permitted vector forms (§3.3) — C4 [C]**: both `translation` and `scale` entries carry their
  vector as `one of: "…":List[float], "path":str` — "stored either as a list of floats … or as
  binary data at a location in this container (`path`)". A spec-conformant input may therefore
  satisfy §3.4's "exactly one `scale`" while storing the vector externally. Our prototype reads
  inline form only and refuses `path` form with an explicit reason (B1); this preserves the spec's
  permitted forms without expanding scope [P].
- **Negative scale values (C7)**: §3.4 constrains the type, count, order and length of transforms
  but states **no positivity constraint** on scale values. Status for our fixture design: negative
  scale is *not forbidden by 0.4* — an inference from the absence of a constraint **[I]**, not a
  positive permission.
- **Multiple multiscales entries (§3.4)**: "If only one multiscale is provided, use it. Otherwise,
  the user can choose by name, using the first multiscale as a fallback" — guidance accompanied by
  example code, **not** an RFC-2119 sentence; quoted without upgraded force.
- **omero (§3.5, transitional)**: "The 'omero' metadata is optional, but if present it MUST contain
  the field 'channels'"; each channel MUST contain `color` (6 hex digits) and `window`, which MUST
  contain `min`/`max`/`start`/`end`. Display hints, not calibration.
- **Image/label association (§3.6, §3.7)**: an image group may carry a `labels` group whose
  `labels` key lists paths; "Unlisted groups MAY be labels" (the list is not exhaustive). A label
  group's `image-label` metadata: groups "MUST also contain `multiscales` metadata and the two
  'datasets' series MUST have the same number of entries" (level-count equality is the only
  cross-series MUST); `colors` SHOULD be present, `label-value` MUST be an integer and all values
  MUST be unique; "Clients who choose to not throw an error SHOULD ignore all except the _last_
  entry"; `rgba` MAY; `source` MAY, `image` MUST be a string if included, default `"../../"`;
  `version` SHOULD be present.
- **Declaration vs. alignment guarantee — the load-bearing distinction [C, preserved]**: the spec
  *declares* each series' data→physical mapping but contains **no requirement** that the label
  series' axes, scales or translations equal or correspond to the image series' beyond level count.
  The only shape guidance is the **informative** §2.1 layout comment: "Each dimension of the label
  `(t, c, z, y, x)` should be either the same as the corresponding dimension of the image, or `1`
  if that dimension of the label is irrelevant" — lowercase "should" inside the ASCII layout block,
  non-normative. Overlay alignment is therefore **never guaranteed by the format**; it must be
  established per input and otherwise withheld. This corrects the thin plan's implicit assumption
  that a label overlay is showable once a label exists, and any assumption that level 1 is an
  isotropic 2× downsample (§3.4 permits arbitrary per-level scales).

---

## Q3 — Real issue → fix → test chain and the scoped lesson (B4)

**Primary chain (ome-zarr-py), verified in the merged diff [S]** (inherited diff capture, sha256
`50b0c983…`, re-derived by the critique):

- *Failure*: PR #652 "bug: correctly normalize resolution level paths" (bug-labeled, merged
  2026-09-08). When a remote OME-Zarr whose resolution levels use paths `0,1,2` (not `s0,s1,…`) is
  opened and re-saved, the writer normalized `datasets[].path` but **not** the matching
  `datasets[].coordinateTransformations[].input.path`, leaving written calibration metadata pointing
  at nonexistent level paths.
- *Fix*: `ome_zarr/classes/image.py`, `to_ome_zarr` (~L394): now rewrites the transform's
  `input.path` alongside `path`, raising a `ValueError` if `transform.input is None`.
- *Test*: `tests/test_writer.py::TestWriter::test_normalize_resolution_level_paths` (~68 added
  lines): builds a 3-level pyramid at paths `0/1/2` with per-level scales `2**level`, round-trips
  `OMEZarrMultiscale.from_ome_zarr` → `to_ome_zarr`, asserts both `path` **and**
  `coordinateTransformations[0]["input"]["path"]` normalize to `s{i}`.
- *Scope condition (load-bearing)*: the test exercises the current 0.6-style class API
  (`input`/`output` transform objects, `zarr_format=3`, `"ome"` key) — not the 0.4 dict form. The
  *failure mode* (per-level calibration metadata drifting out of sync with level paths during
  resolution-level handling) transfers to our 0.4 path; the *code* does not **[S for the diff; I for
  the transfer]**.

**Supporting upstream history (vizarr) [S]**: #261 made vizarr apply `coordinateTransformations`
(previously ignored) via a single `model_matrix` from `datasets[0]`; #271 (open) then reported 3D
translations making images disappear and noted the feature existed to "scale Labels to match parent
Images"; #297 showed the optional-`omero` detection gate silently disabling transforms for
spec-valid inputs, fixed by #298; #288 showed a per-level anisotropic scale ignored in rendering
(re-verified this stage; closed without a linked fix). The #261/#298 fix diffs added **no automated
tests** — upstream verified by manual deploy-preview only — and a regression (#271) followed the
untested change, while the one upstream fix that did ship a test (#652) pins its behavior.

**Scoped engineering lesson [I]**: (1) gate format detection only on metadata the specification
makes required (`multiscales`, and a Zarr group per C6), never on optional keys (`omero`) —
otherwise spec-valid inputs are silently misread; (2) resolution switching must honor **per-level**
transforms (a single level-0 matrix misrenders anisotropic levels and misplaces overlays); (3) every
change to transform interpretation must ship unit tests on the composed matrix/coordinate math —
manual visual checks missed the #271 regression. **Validation adopted for the prototype:** the
F-suite in B5 replicates the #297 detection case, the #288-inspired anisotropic case, and a
#652-style round-trip integrity check on our own metadata module. **None of these have been
executed in this stage; no pass is claimed.**

---

## Revised plan (B1–B5)

### B1 — Local input contract, version/support checks, read-only boundary [P, on S basis]

- **Detection gate (C6-corrected)**: accept only a local directory that is a **Zarr v2 group**
  (`.zgroup` present — the conjunct upstream also requires) whose `.zattrs` contains a
  `multiscales` key. Detection never keys on optional metadata such as `omero` (§3.5; the #297
  lesson).
- Accept exactly: `multiscales[0]` at version "0.4" (SHOULD; if absent → accept with a visible
  "version undeclared" warning [I: upstream silently falls back to format "0.1"; we choose to
  warn]); exactly 2 `datasets[]` paths resolvable as arrays; ≤5-D axes with exactly 2 entries of
  `type:"space"` for our 2D window; **inline** scale/translation vectors (see refusal below).
- **Reject/refuse visibly ("unsupported input" state with reason string)**: no `multiscales` key;
  not a Zarr group (missing `.zgroup`); version the module cannot interpret (≥0.5 constructs:
  coordinate systems/`ome` key); a dataset missing its MUST `scale` (§3.4) → "missing required
  per-level scale"; **`coordinateTransformations` entries using the `path` (externally stored
  vector) form → "transform vectors stored externally (`path` form) not supported" (C4)** — refused
  even though §3.3 permits them [P: loading binary-vector indirection is out of scope; see leads];
  arrays not readable. Pixel-index fallback display for the missing-scale case only behind an
  explicit user acknowledgment [P].
- **Read-only boundary**: open the store `mode='r'` (zarr-python pinned `<3` per the 0.10.2
  changelog [S]); no writes, no sidecar creation; the label overlay is derived in memory only.
- **Absent optional labels**: overlay control disabled with reason "no label image declared" —
  `labels` association is optional (§3.6 lists are discovery aids; "Unlisted groups MAY be labels",
  so we do **not** auto-attach unlisted groups [P]).

### B2 — Physical cursor coordinates and calibrated display [P, on S basis]

- **Interpretation (version 0.4, inline vector form only — C4)**: for pixel index `(y_i, x_i)` at
  level L, `physical = translation_L + scale_L ∘ index`, then apply any multiscales-level
  transformations **after** the dataset-level ones (§3.3 "applied sequentially and in order"; §3.4
  "applied after"). Validity conditions: axis-aligned scale+translation inputs only; rotation/affine
  is out of scope ("The transformation MUST only be of type `translation` or `scale`", §3.4) [S].
- **Display**: cursor readout `x = … <unit>, y = … <unit>`; per-axis scale indication
  (`<unit>/px` per axis, since scales may be unequal); scale bar only when both space axes carry
  units [P]. Units are the `axes[].unit` UDUNITS-2 names (§3.1, SHOULD — optional), displayed
  verbatim; no unit conversion in this prototype (lead #6).
- **Fallback/withheld states**: missing `unit` → readout in "px (no unit declared)" and scale bar
  suppressed with reason; missing/invalid scale or `path`-form transforms → B1 refusal path;
  **ambiguous scale semantics badge [I/P]** — §3.4 permits both an absolute physical-size reading
  and a relative-factor reading ("If scaling information is not available or applicable for one of
  the axes, the value MUST express the scaling factor between the current resolution and the first
  resolution **for the given axis, defaulting to 1.0 if there is no downsampling along the axis**"
  — full conditional quoted per C3). The badge "calibration semantics unverified" is shown when the
  all-1.0-at-level-0 relative-factor pattern is present and no `name`/`metadata` disambiguates; the
  prototype does not guess silently. The badge fires only on that pattern; F1 (absolute 0.5/0.25)
  must not trigger it and F9 must [P].

### B3 — Resolution switching and optional categorical label overlay [P, on S basis]

- **Resolution switching**: levels offered in metadata order (MUST be largest→smallest, §3.4);
  switching re-reads that level's **own** scale/translation (per-level anisotropy supported — the
  #288 lesson); the displayed aspect uses the active level's y/x scale ratio; napari 0.9.2's
  multiscale level extraction action (#9495) is used for the switching UI [P].
- **Overlay association (priority order)**: (1) `labels` group list entries (§3.6); (2) a group
  with `image-label.source.image` resolving to this image (§3.7, default `"../../"`); (3) nothing —
  unlisted groups appear in an "undeclared groups" info line but are never auto-attached [P].
  Provenance (resolved path and whether it came from the `labels` list or `source.image`) is
  displayed next to the overlay toggle [P].
- **Alignment justification gate (all must hold, else withhold)**: label is integer-valued (§2.1
  note: "only integer values are supported" in the layout comments); label `multiscales` has the
  same level count (MUST, §3.7); label spatial axes match the image's spatial axes by name and type
  [I: a meaningful overlay requires a shared physical space; the spec does not guarantee it]; the
  composed physical extents of image and label at the same level agree within tolerance
  `max(0.5 × min axis unit, 1 px at that level)` [P tolerance].
- **Sampling**: label rendered nearest-neighbor (napari labels-layer default) [P]; categories are
  never interpolated. Where levels' physical grids differ within tolerance, the label is sampled
  through **its own** transform, not snapped to the image grid [P/I].
- **Actionable refusal states (visible, each with reason and failing check)**: `no label declared`;
  `declared label not found on disk`; `level count mismatch (spec MUST)`; `axis mismatch (y/x names
  or types)`; `physical extent mismatch beyond tolerance (Δ=… <unit>)`; `label not integer-valued`.
  Withholding the overlay is always available and always explains itself.

### B5 — Concrete steps, discriminating validation cases, visible limits

Steps: (1) contract/version gate incl. Zarr-group check and `path`-form detection (B1, C4/C6);
(2) metadata interpretation module — axes→units; per-level transform composition incl. optional
group-level transforms; inline-form precondition; relative-scale ambiguity flag (B2); (3) resolution
switcher honoring per-level transforms (B3); (4) label association + alignment gate + refusal states
(B3); (5) napari 0.9.2 wiring: image pyramid with per-layer `scale`/`translate`, labels layer
nearest-neighbor, cursor readout, scale bar, refusal widgets (B2/B3); (6) fixture suite below;
(7) "About/limits" panel.

Discriminating fixtures (**proposed only — none executed in this stage; no pass is claimed**):

- **F1 conformant**: 2-level 2D `y,x`, `micrometer`, unequal base scales (y=0.5, x=0.25), nonzero
  translations on both levels; label with matching transforms. *Discriminates:* cursor physical
  values exact (±1e-9), per-axis scale indication, overlay aligned; badge must NOT fire.
- **F2 unitless**: F1 minus `unit`. *Discriminates:* "px (no unit declared)" fallback, scale bar
  withheld with reason.
- **F3 negative x-scale flip, no `omero` in `.zattrs`** — negative scale is *not forbidden by 0.4*
  [I, C7 relabel]. *Discriminates:* detection does not depend on optional keys (the #297 lesson);
  rendered flip and decreasing-x cursor ordering.
- **F4 anisotropic level 1 (y ×4, x ×2) — *inspired by* vizarr #288 (stronger anisotropy, 2D)**
  [C5 relabel; the upstream case was y ×2 / x ×1 on 3-length vectors]. *Discriminates:* level
  switch keeps aspect true; overlay still aligned through per-level transforms.
- **F5 label integrity**: (a) label with only one level → refusal `level count mismatch (spec
  MUST, §3.7)`; (b) label translation offset beyond tolerance → refusal with Δ; (c) declared path
  missing on disk → refusal; (d) undeclared sibling label-like group → listed, not attached
  (§3.6 "Unlisted groups MAY be labels").
- **F6 unsupported calibration**: (a) missing per-level `scale` (violates the §3.4 MUST) →
  unsupported-input state, pixel fallback only after explicit acknowledgment; **(b, C4) per-level
  `scale` in `"path"` form** (§3.3-permitted) → explicit refusal "transform vectors stored
  externally (`path` form) not supported".
- **F7 round-trip integrity (self-consistency; C9 caveat attached)**: our metadata module reads F1,
  re-serializes the level table, and must reproduce identical composed extents per level. This
  tests **our module's serialization fidelity** — in the 0.4 dict form there is no `input.path` to
  drift, so it is *not* a replication of #652; only the failure-mode lesson transfers [I].
- **F8 two `multiscales` entries** → user picker with first-entry fallback (§3.4 guidance, not a
  MUST).
- **F9 (new, C8) ambiguity badge**: level-0 scale `[1.0, 1.0]`, level-1 `[2.0, 2.0]` — both §3.4
  readings consistent, metadata ambiguous. *Discriminates:* the "calibration semantics unverified"
  badge state and its reason string appear (and do not appear on F1).

Visible limits (shipped in the UI): no unit conversion; no rotation/affine; no writer;
`path`-form transform vectors refused, not loaded; relative-vs-absolute scale ambiguity flagged,
not resolved; group-level transforms composed but only scale/translation types accepted; alignment
tolerance is a product choice.

---

## Self-derived witness status (per TASK.md; none executed)

- **Mechanical capture witnesses (exist, host-recorded)**: this stage's four fetch receipts with
  exact response-body sha256 values (§0) — including byte-identity of the spec and `reader.py`
  captures to the frozen citations, and the corrected `4f53cda1…` releases hash. These are the only
  receipts produced in this stage.
- **Proposed fixture witnesses (do NOT exist yet)**: each fixture's stated expectation is
  specification, not result — e.g. F1 asserts cursor `physical = translation + scale ∘ index` to
  ±1e-9 and F9 asserts the badge reason string. No fixture, build, or runtime check has been run in
  this case; no execution receipt exists for any of them; no pass is claimed anywhere in this
  artifact.

## Obligation coverage map

- **B1** → §B1 (detection gate with Zarr-group conjunct [C6]; version checks; read-only boundary;
  absent-label state; unsupported-input states incl. `path`-form refusal [C4]).
- **B2** → §B2 + Q2 calibration facts (full conditional quoted [C3]; negative-scale status [C7]).
- **B3** → §B3 + Q2 association facts (association priority, provenance display, alignment gate,
  nearest-neighbor sampling, refusal states).
- **B4** → §Q1 (two independently discovered components, versions, concrete tradeoff) + §Q3
  (issue → fix → test chain with scope condition; observed vs. inference vs. choice separated).
- **B5** → §B5 steps, fixtures F1–F9 (F4 relabeled [C5], F6b added [C4], F9 added [C8], F7 caveat
  kept [C9]), visible limits, and `out/UNRESOLVED_LEADS.md`.

Unresolved consequential dependencies remain visible in `out/UNRESOLVED_LEADS.md` (eight leads;
none asserted resolved). A JSON status or a bare "plan corrected" claim would not satisfy the
stage; this document is the artifact.
