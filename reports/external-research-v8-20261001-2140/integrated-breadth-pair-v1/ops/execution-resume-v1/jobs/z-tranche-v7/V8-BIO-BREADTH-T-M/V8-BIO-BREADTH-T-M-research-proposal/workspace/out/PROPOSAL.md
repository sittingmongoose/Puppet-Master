# PROPOSAL — Local calibrated 2D OME-NGFF 0.4 image/label viewer (read-only prototype)

Case: V8-BIO-BREADTH-T-M — research-backed revision of `inputs/THIN_PLAN.md` (no implementation, no format survey).
Labels used throughout: **[SRC]** source requirement/quote (with exact locator and normative force), **[EX]** example/optional behavior in a source, **[INFER]** engineering inference from sources, **[CHOICE]** product decision for this prototype, **[CORR]** supported correction to the thin plan or an upstream assumption. Proposed tests are **not executed** in this stage; nothing below claims an execution receipt.

---

## 0. Sources independently discovered and cited (no evaluator list was supplied)

| ID | Locator | What was captured |
|---|---|---|
| S1 | OME-NGFF 0.4 specification, rendered: `https://ngff.openmicroscopy.org/0.4/` ("This is the 0.4 release of this specification"; page dated 1 Oct 2026). Normative source: GitHub `ome/ngff` tag **0.4.1**, commit `106c3010dcb4079eb0a69868a11cc5943f942fdf`, file `0.4/index.bs` (40,372 bytes; capture sha256 `592413727ee8d42916bd98007262f48c6139273cb373839c6d285a0ba20b6406`, captured 2026-10-03) | Full 0.4.1 normative text: layout, axes, coordinateTransformations, multiscales, labels, image-label, omero, implementations, version history (0.4.0 = 2022-02-08 "multiscales: add axes type, units and coordinateTransformations"; 0.4.1 = 2022-09-26) |
| S2 | `ome/ngff` tag 0.4.1, `0.4/examples/multiscales_strict/multiscales_example.json` (capture sha256 `983ccd363c1ca812d9127e9a96f19f822099b5289ab2b729a31f577816199534`) | Strict 0.4 example: axes `t,c,z,y,x` with UDUNITS-2 units, per-dataset `scale`, group-level `coordinateTransformations`, level paths `"0","1","2"` |
| S3 | GitHub API `ome/ome-zarr-py/releases/latest` → **v0.19.2** (published 2026-09-08; body: "bug: correctly normalize resolution level paths" = PR #652) | Reader/writer component version + latest bugfix |
| S4 | `ome/ome-zarr-py` **issue #403** "coordinateTransformations generated for 0.4 are scale-only" (opened 2024-11-06 by d-v-b; closed 2026-06-17, state "completed") + member comment `issuecomment-2501254366` (will-moore, 2024-11-26) | Real calibration failure history + per-level translation formula |
| S5 | `ome/ome-zarr-py` **PR #652** "bug: correctly normalize resolution level paths" (merged 2026-09-08; merge commit `94eaf20aa096b4a034fc0c636e31d5d64953d6ad`, head `ad8e3250ce7fe310927b0173f680306281c1409a`; files API capture sha256 `66900c97b442e2f804930a499c941c9fc2d56cafa52705a05d2b284e7e4c2f88`) | Issue→fix→test chain: `ome_zarr/classes/image.py` (+17/−4) and regression test `tests/test_writer.py::TestWriter::test_normalize_resolution_level_paths` (+69/−1) |
| S6 | GitHub API `napari/napari/releases/latest` → **v0.9.2** (2026-09-29): "Add multiscale level extraction as a LayerList action (#9495)"; "Avoid redundant unit conversion when aggregating layer extents (#9411)"; built on Qt + vispy | Viewer component version + multiscale/units capabilities |
| S7 | GitHub API `hms-dbmi/viv/releases/latest` → **@hms-dbmi/viv@0.16.1** (2024-03-13) | JS multiscale viewer library version |
| S8 | `hms-dbmi/vizarr` `main` branch `package.json` (capture sha256 `bddde203696567259721c7f04f6ca8ff0bed44d30203106346efc42fdd7d2cb5`): `@hms-dbmi/vizarr` version **0.3.0**, depends `"@hms-dbmi/viv": "~0.19.0"`, `zarrita ~0.6.0`, `deck.gl ~9.1.0`; repo has no GitHub `/releases/latest` (404) | Client-side viewer component + version-drift evidence |
| S9 | GitHub API `openseadragon/openseadragon/releases/latest` → **v6.1.1** (2026-09-09) | Analogous component from whole-slide imaging |
| S10 | S1 §"Implementations" list (normative doc's own implementation registry): `ome-zarr-py` — "A napari plugin for reading ome-zarr files"; `vizarr` — "A minimal, purely client-side program for viewing Zarr-based images with Viv & ImJoy"; `bigdataviewer-ome-zarr` — "Fiji-plugin for reading OME-Zarr" | Bounds the shortlist to spec-acknowledged implementations |

Discovery method: spec landing page → `ome/ngff` git tags (0.4.1 found) → repo tree → normative `index.bs` → GitHub API releases/search for components and the failure history. Sub-page URLs such as `ngff.openmicroscopy.org/0.4/multiscales.html` now 404; the whole 0.4 document is the single `index` page / `index.bs` source.

---

## 1. Question 1 — Component precedents and minimal choice (obligations B1, B4)

### 1.1 Shortlist discovered (METHOD requirement: 3–4 options incl. one analogy)

1. **napari v0.9.2 + ome-zarr-py v0.19.2 (reader)** [SRC S6, S3, S10] — desktop Python viewer; napari is built on Qt + vispy (S6 release notes); ome-zarr-py is the spec's own listed napari reader plugin (S10). Release notes evidence multiscale handling and physical-unit awareness in the layer model ("Avoid redundant unit conversion when aggregating layer extents", #9411) [SRC S6].
2. **vizarr 0.3.0 / Viv (@hms-dbmi/viv)** [SRC S7, S8, S10] — "minimal, purely client-side" Zarr image viewer built on Viv, per the spec's implementation registry (S10). **Version-specific constraint [SRC S8]:** vizarr's `main` package.json pins `@hms-dbmi/viv ~0.19.0` while viv's latest *GitHub release* is `0.16.1` [SRC S7] — the viv version delivered through vizarr's dependency graph is not identifiable from GitHub releases alone. Pinning this stack for a reproducible prototype requires resolving npm-side provenance (unresolved lead L2).
3. **bigdataviewer-ome-zarr (Fiji plugin)** [SRC S10] — spec-listed reader; Java/Fiji runtime. **Rejected [CHOICE]:** heaviest runtime for a "small desktop prototype", and BigDataViewer's display model is centered on volumetric navigation rather than 2D calibrated readouts.
4. **OpenSeadragon v6.1.1 — the analogy (neighboring use case: whole-slide/deep-zoom imaging)** [SRC S9] — mature multi-resolution pyramid viewing, tiling and zoom UX. **Retained only as an interaction-design reference, rejected as a core component [CHOICE].** What transfers [INFER]: level-selection UX and smooth pyramid switching for a two-level stack. What does not transfer [INFER, supported by absence in S9 release notes/docs of any axis/unit/labels metadata model]: physical axis calibration, unit display, and label-image association semantics — OpenSeadragon's model is pixel/viewport based. The analogy does not guarantee NGFF behavior (METHOD warning), and this is recorded explicitly.

### 1.2 Comparison and recommendation (≥2 options, concrete tradeoff) — B4

Compared in depth: **(a)** napari + ome-zarr-py vs **(b)** vizarr/Viv.

| Criterion | napari + ome-zarr-py | vizarr / Viv |
|---|---|---|
| Runtime for desktop prototype | Native Python desktop app (Qt/vispy) [SRC S6] | Web component; desktop use needs an embedded webview [INFER] |
| Calibrated physical coordinates | Units supported in layer model [SRC S6, "unit conversion" wording]; world-vs-data coordinate handling is core to the layer API [INFER — not re-verified from napari docs in this stage] | Not verified in captured sources [INFER: unknown; lead L1] |
| Multiscale + labels layers | Native image + labels layer types; multiscale level extraction action shipped in v0.9.2 [SRC S6 #9495] | Multiscale viewing is the primary use case [SRC S10] |
| Version pinning risk | Releases are cut from `ome/ome-zarr-py` tags (v0.19.2, 2026-09-08) [SRC S3] | **viv dependency drift: GitHub release 0.16.1 vs vizarr pin `~0.19.0`** [SRC S7, S8] |
| Issue→fix→test transparency | Public issue/PR/test chain available and verified (§3) [SRC S4, S5] | Not investigated in this stage (time-boxed) |
| Conformance coverage | Reader for 0.1–0.5 style inputs [SRC S3, S4 cross-refs] — needs narrowing (B1 gate below) | NGFF-focused but subset behaviors unverified here |

**Recommendation [CHOICE]:** napari **v0.9.2** + ome-zarr-py **v0.19.2** (reader path only), wrapped by a thin conformance/withholding gate specified in §4 (B1/B3). **Concrete tradeoff:** accept a heavier dependency chain (Qt + vispy + zarr-python) and napari-plugin version coupling in exchange for (i) a viewer whose coordinate model is unit-aware and multiscale-native, (ii) exact, pinned, version-locatable behavior, and (iii) a public failure-history trail to design regression tests against. The Viv/vizarr stack would minimize code size but shifts unverified calibration behavior and a version-provenance risk into the prototype's critical path. This recommendation is bounded to the 2D/one-dataset/0.4 scope; it is not a claim that napari is better in general.

---

## 2. Question 2 — What OME-NGFF 0.4 requires and permits (obligations B1, B2, B3)

All locators: S1 = `ome/ngff` 0.4.1 `0.4/index.bs`, section names as in the source; S2 = strict example. RFC 2119 keywords are used with their defined force (S1 §"Document conventions").

### 2.1 Axis / calibration interpretation

- **[SRC]** `"axes"`: each entry **MUST** contain `"name"` (unique across entries); **SHOULD** contain `"type"` (one of `space`/`time`/`channel`, **MAY** be a custom value); **SHOULD** contain `"unit"` from the listed UDUNITS-2 strings (space: e.g. `micrometer`, `nanometer`; time: e.g. `millisecond`, `second`). If part of `"multiscales"`, the length of `"axes"` **MUST** equal the number of array dimensions (S1 §"axes" metadata). ⇒ *Units are optional in 0.4: absence is conformant* [SRC], so the prototype cannot require units.
- **[SRC]** Axis order **MUST** correspond to array dimension order; entries **MUST** be ordered time → channel/custom → space; 2–5 axes total with 2–3 of type `space`; anisotropic z **SHOULD** be ordered `zyx` (S1 §"multiscales" metadata).
- **[SRC]** Per-resolution `datasets[].coordinateTransformations`: **MUST** contain **exactly one** `scale`; **MAY** contain exactly one `translation`, and "If `translation` is given it **MUST** be listed after `scale` to ensure that it is given in physical coordinates." Length of `scale`/`translation` arrays **MUST** equal the number of axes. Only `translation`/`scale` types are allowed here (S1 §"multiscales" metadata; transformation types defined in §"coordinateTransformations" metadata, "applied sequentially and in order").
- **[SRC]** Scale fallback semantics: "If scaling information is not available or applicable for one of the axes, the value **MUST** express the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0 if there is no downsampling along the axis." (S1 §"multiscales" metadata). ⇒ Per-level `scale` is a *requirement on the metadata*, not a guarantee the author knew absolute sizes — level-1 scale `2.0` may mean "unknown absolute size, 2× coarser than level 0" [INFER].
- **[SRC]** A multiscales-level `coordinateTransformations` **MAY** exist, applies to **all** levels, uses the same rules, and is applied **after** the per-dataset transformations (S1 §"multiscales" metadata). S2 demonstrates exactly this with a group-level time scale `[0.1, 1.0, 1.0, 1.0, 1.0]` [EX].
- **[SRC]** `datasets[].path` values "MUST be ordered from largest (i.e. highest resolution) to smallest" (S1 §"multiscales" metadata). **[SRC]** Level directory names are arbitrary (S1 §"Images": "The name of the array is arbitrary with the ordering defined by the 'multiscales' metadata"); **[EX]** S2 itself uses `"0","1","2"` while ome-zarr-py writes `s0,s1,…` (S5 PR description). **[CORR]** to the thin plan/implementation habit: never infer level meaning from directory names; resolve ordering and geometry only via `datasets[]`.

### 2.2 Physical cursor coordinates

- **[SRC]** Physical coordinate derivation permitted by 0.4: per dataset, `physical = translation + scale × index` (translation listed after scale ⇒ already physical), then multiscale-level transformations applied after (S1, quoted above). With the default absent transformations being identity (S1 §"coordinateTransformations" metadata table: "identity … is the default transformation and is typically not explicitly defined") [EX].
- **[INFER]** Cursor readout for level *L*, axis *a*: `world(a) = (t_L(a) + s_L(a)·i_a)`, then group-level scale multiplied in (`× g_s(a)`), then group-level translation added if present. This composition is the only arithmetic 0.4 licenses; any resampling by the display is a viewer-internal quantity that must not leak into the readout.
- **[SRC→INFER]** Per-level anchoring: downsampling shifts content by `(pixelSize_N − pixelSize_0)/2` per axis (anchor = center of pixel `[0,0]`); well-formed writers therefore emit a distinct `translation` per level (S4, will-moore comment, 2024-11-26, which also notes ngff-zarr does this). **[CORR]** Cursor and overlay code **MUST** use each level's own translation; reusing level-0's translation on level 1 is the classic misalignment error this history documents.
- **Units display [CHOICE]:** show `value + unit-string` verbatim when `unit` is present; when absent show `<axis name> (unitless)`. No unit conversion in the prototype (UDUNITS-2 conversion is out of scope); this is a *visible limit*, not silent behavior. Unequal axis scales and nonzero offsets fall out of the per-axis formula with no special casing [INFER].
- **Withheld state:** if any spatial axis lacks `scale` (violates the 0.4 **MUST**) or transforms are structurally invalid, physical readout is withheld and the raw index readout is shown with reason code `CALIBRATION_INVALID` [CHOICE, B2].

### 2.3 Resolution switching

- **[SRC]** Exactly two levels exist by product contract [CHOICE]; they are the first two entries of `datasets[]`, whose order is largest→smallest resolution (**MUST**, S1). Selection = choosing an entry of `datasets[]` and loading its `path`; switching must recompute cursor composition from *that entry's* transforms (§2.2) [INFER].
- **[SRC]** If multiple `multiscales` entries exist: the spec's own guidance is to let the user choose by `name`, falling back to the first (S1 code sample at the end of §"multiscales" metadata) [EX]. **[CHOICE]** prototype: accept only single-entry `multiscales`, else refuse with `MULTIPLE_MULTISCALES` (keeps the prototype minimal; refusal is understandable per brief).
- **[CORR]** The thin plan's "switch between two resolutions" is supported by the format only as *metadata selection*; the format promises nothing about visual continuity of content across levels (downsampling method is only a `SHOULD`-report `type`/`metadata` field, S1) [SRC]. Level switching therefore must not claim "same field of view" — it claims "same world coordinates window", which is exactly what per-level scale/translation preserve [INFER].

### 2.4 Image / label association — declaration vs. alignment guarantee

- **[SRC]** Association: the image group may contain a `labels` group whose `.zattrs` lists label paths under the key `"labels"`; "Unlisted groups **MAY** be labels" (S1 §"labels" metadata). Each label group carries `"image-label"` metadata; its optional `"source"` dict **MAY** include `"image"` = relative path to the image group, default `"../../"` (S1 §"image-label" metadata).
- **[SRC]** Structural constraint: "`image-label` groups **MUST** also contain `multiscales` metadata and the two `datasets` series **MUST** have the same number of entries." (S1 §"image-label" metadata) ⇒ label level count must equal image level count.
- **[SRC]** Dimension guidance is *advisory only*: the layout commentary says each label dimension "should be either the same as the corresponding dimension of the image, or `1`" (S1 §"Images" layout note; lowercase "should", descriptive). ⇒ **There is no normative alignment guarantee**: 0.4 declares association (a path) and level-count equality, but does not require the label's per-level `scale`/`translation` to equal the image's, and defines no geometric registration. **[CORR]** The thin plan's implied assumption "a 0.4-conformant label overlays correctly" is not supported; overlay display must be *justified per dataset*, exactly as the brief requires.
- **[SRC]** Label rendering metadata is permissive: `colors[]` entries **MUST** have `"label-value"`, `rgba` **MAY**; duplicate label-values — "Clients who choose to not throw an error should ignore all except the *last* entry" (S1 §"image-label" metadata) [EX]. `properties[]` keys beyond `label-value` are arbitrary and need not be shared across labels [SRC]. Categorical values are integers only (layout: "only integer values are supported", S1 §"Images") [SRC]. Overlap may be encoded by a sentinel value ("for example the highest integer available") [EX].

### 2.5 Distinguishing declaration from guarantee (Q2 conclusion)

0.4 *requires* per-level scale (+optional translation) metadata, axis naming/order, level ordering, label level-count equality, and *permits* units, translations, group-level transforms, and label association by path. It *guarantees* none of: absolute-size correctness (scale may encode relative factors only), cross-level visual anchoring (only metadata convention), or label/image geometric alignment (only a path + advisory dimension note). The prototype's withholding logic (§4 B3) exists precisely because of this asymmetry.

---

## 3. Question 3 — Real issue → fix → test chain (obligation B4, part 2)

**Chain used (fully verified): ome-zarr-py resolution-level path normalization — S3/S5.**

- **Failure:** an OME-Zarr store read from a remote location used level paths `0,1,2` (conformant — names are arbitrary, §2.1). ome-zarr-py's write-back path normalized the stored paths to `s0,s1,s2` but updated **only** `datasets[].path`, leaving `datasets[].coordinateTransformations[…].input.path` pointing at the old names — i.e. the per-level transform metadata referenced levels that no longer existed under those names. Reported 2026-09-08 in PR #652's description ("Bug I encountered… the writer only updates the `path` field in the `datasets` field, but not the `datasets > coordinateTransformations > input > path` field"), labeled `bug` [SRC S5].
- **Fix:** `ome_zarr/classes/image.py` (`to_ome_zarr`), +17/−4: rewrite both `dataset.path` **and** `transform.input.path` per level, raising `ValueError` if `transform.input` is `None`; merged 2026-09-08 (merge commit `94eaf20a…`), shipped in release **v0.19.2** (S3) [SRC S5].
- **Test:** regression test `tests/test_writer.py::TestWriter::test_normalize_resolution_level_paths` (+69/−1): builds a 3-level store with paths `0,1,2` and per-level transforms `scale [2^level, 2^level]` with explicit `input.path`/`output.name`, writes back, then asserts `s{i}` present for all i and that `datasets[i].path == s{i}` **and** `coordinateTransformations[0].input.path == s{i}` [SRC S5].
- **Relevance to this prototype:** resolution switching consumes exactly this metadata unit — `datasets[].path` plus its `coordinateTransformations`. The failure shows third-party stores *will* use non-canonical level names (0.4's own strict example S2 uses `0,1,2`), and that a component can desynchronize the two halves of the level record.
- **Corroborating calibration history (same class, writer-side):** issue **#403** "coordinateTransformations generated for 0.4 are scale-only" (opened 2024-11-06; closed 2026-06-17 "completed"): the generator emitted scale-only transforms although common downsampling shifts content, "which will be incorrect for almost all multiscale pyramids" (S4). An OME member's working note derives the per-level translation `(pixelSize_N − pixelSize_0)/2` and cites the 0.4 rule that translation must follow scale (S4 comment). Cross-referenced PRs include #413 "Ome zarr v0.5 reading and writing" (merged 2025-08-07) and later #652. **Scoping honesty:** I verified the closing PR *references* for #403 but did not locate a dedicated regression test for #403 itself in this time box; the test-verified member of this failure class is PR #652.

**Scoped engineering lesson [INFER]:** treat `datasets[i].path` + `datasets[i].coordinateTransformations` as one atomic record per level. Any code that renames, moves, or re-levels a store must rewrite every reference inside that record; any reader must resolve levels via metadata, never by assuming directory names; and geometry consistency (scale/translation per level, transform input paths) must be validated before use, not assumed from the version string `"0.4"`.
**Validation that follows [CHOICE, not executed]:** the F7 fixture pair in §5 (identical dataset expressed with `0,1` vs `s0,s1` level paths must produce identical rendering, cursor values, and overlay decisions), plus a metadata round-trip check mirroring `test_normalize_resolution_level_paths`.

---

## 4. Product obligations → concrete design

### B1 — Local input contract, support checks, read-only boundary

**Contract [CHOICE]:** input is a local filesystem path to one Zarr v2 group directory. **[SRC]** 0.4 mandates Zarr v2 ("OME-Zarr is an implementation … using the Zarr format. Arrays MUST be defined and stored … as defined by version 2 of the Zarr specification"; metadata in group `.zattrs`, S1 §"On-disk layout"). Open with read-only mode; the prototype writes nothing (contrast: the S5 bug lived in the write-back path).

Version/support gate (visible refusal states, each with a reason code and a one-line human explanation) [CHOICE]:

| Check | Basis | Failure behavior |
|---|---|---|
| `multiscales` present, exactly 1 entry | S1 §multiscales | refuse `NO_MULTISCALES` / `MULTIPLE_MULTISCALES` |
| `axes` length == array ndim; 2 `space` axes for this 2D scope (t/c axes, if present, fixed to first slice) | S1 §axes/§multiscales; brief scope | refuse `AXES_UNSUPPORTED` |
| `multiscales[].version` string | S1: version is a **SHOULD** field | warn-and-continue if absent; refuse if not `"0.4"` → `VERSION_UNSUPPORTED` (0.5+ stores may use coordinateSystems not covered here) |
| every dataset has exactly one `scale` (+≤1 `translation` after it) | S1 **MUST**s | refuse `TRANSFORM_INVALID` |
| exactly 2 entries in `datasets[]`, ordered largest→smallest | brief scope; S1 **MUST** order | refuse `LEVEL_COUNT_UNSUPPORTED` |
| labels optional: `labels` key present? each listed label resolvable with `image-label` + `multiscales` + same dataset-entry count | S1 §labels/§image-label **MUST** | no labels → overlay control disabled with reason "no labels group"; malformed label → overlay withheld `LABEL_INVALID` (image still shown) |

Absence of optional labels is a **normal state** [SRC — labels are optional in the layout], not an error. Unsupported input never renders partially without an explanation [CHOICE, brief B1].

### B2 — Physical cursor coordinates and calibrated scale indication

- Readout (per §2.2 composition): `x,y` world values at cursor + unit string per axis (`"(unitless)"` marker when `unit` absent); a fixed scale indicator showing the current level's per-axis pixel size `s_L(a) (unit)` and the level's translation when nonzero [CHOICE].
- Conditions it depends on [SRC]: 0.4 axes/units semantics (units **SHOULD**, absence allowed); per-level `scale` **MUST**, `translation` **MAY** after scale; group-level transforms **MAY**, applied after per-dataset ones. Fallback: if `unit` absent → unitless marker; if any required `scale` invalid → `CALIBRATION_INVALID`, raw-index readout only (§2.2). No unit conversion; UDUNITS-2 strings are displayed verbatim [CHOICE, visible limit].
- **[INFER]** This composition is implemented in the gate layer, not taken on faith from the viewer, so it can be unit-tested independently of rendering (§5 C2/C3).

### B3 — Resolution switching and optional categorical label overlay

- Switching: two-level selector (coarse/fine) = `datasets[1]` / `datasets[0]`; each switch recomputes cursor composition from that level's transforms (Q3 lesson). Level names never parsed for meaning [SRC+INFER, §2.1/§3].
- Overlay pipeline when the user requests it: (1) resolve `labels` list → candidate label groups; (2) keep those whose `image-label.source.image` (default `"../../"`) resolves to the open image group [SRC]; (3) verify label level count == image level count (**MUST**, S1) else `LABEL_LEVEL_MISMATCH` withhold; (4) compare per-level `scale` and `translation` of label vs image: identical ⇒ overlay shown; different ⇒ **withhold with `LABEL_GEOMETRY_MISMATCH`** — this is the actionable refusal state, because 0.4 does *not* guarantee alignment even for conformant pairs (§2.4). Tolerance: exact match at 0.4 metadata precision (floats compared after normalize) [CHOICE].
- Sampling: categorical label rendered nearest-neighbor (label pixel values are object identities; interpolation would fabricate categories) [CHOICE]. No registration, resampling, or transform estimation is attempted — out of scope per brief [CHOICE]. Label colors: use `image-label.colors` rgba when present, else a default palette; duplicate `label-value`s → keep last entry (the spec's stated non-throwing client behavior) [SRC S1, EX].

### B4 — summary

Comparison and recommendation: §1.2. Issue→fix→test: §3. Observed upstream behavior (S4/S5 quotes, versions) is separated above from inference ([INFER]) and prototype choices ([CHOICE]) throughout.

---

## 5. B5 — Revised concrete steps (replacing thin plan steps 1–4), discriminating validation, visible limits

**Steps (research-backed revisions of the thin plan):**

- **S1 — Reader+gate (thin-plan 1, revised):** implement the B1 gate (pure metadata validation, no rendering) on zarr-python v2 groups; select components per §1.2; pin `napari==0.9.2`, `ome-zarr-py==0.19.2`. Acceptance: every refusal state in the B1 table reachable from a fixture.
- **S2 — Calibrated model (thin-plan 2, revised):** implement the §2.2 world-coordinate composition as a standalone function over `(axes, datasets[i], group-transforms)`; wire to cursor and to the fixed scale indicator. Acceptance: C2 below.
- **S3 — Level switching (thin-plan 2):** two-entry selector bound to `datasets[]` order; cursor/overlay recompute per switch; no name-based level logic. Acceptance: C3 + F7.
- **S4 — Overlay decision (thin-plan 3, revised):** implement the B3 four-step association/verification pipeline with the two withhold reasons; nearest-neighbor categorical rendering. Acceptance: C4/C5.
- **S5 — Fixtures + checks (thin-plan 4, revised):** fixture set F1–F9 below, all synthetic, all conformant to 0.4.1 schemas except where the test *is* nonconformity.
- **S6 — Visible limits in UI:** "unitless" markers, withheld-overlay reason banner, refusal dialogs with reason codes, and a help panel stating the five limits in §5.3.

**Fixture set (discriminating; none executed in this stage):**

- **F1 canonical 2-level:** axes `y,x` (`micrometer`), scales `[0.5,0.5]`→`[1.0,1.0]`, no labels ⇒ overlay disabled with "no labels group" reason (B1).
- **F2 offset+anisotropic:** translation `[7.5, 3.25]`, y-scale 0.4 ≠ x-scale 0.65 ⇒ cursor readout must equal the §2.2 composition at chosen indices (B2).
- **F3 unitless:** axes without `unit` ⇒ `"(unitless)"` markers, still calibrated (B2 fallback).
- **F4 aligned labels:** label group, level count 2, per-level scale/translation identical to image ⇒ overlay shown (B3).
- **F5 shifted labels:** label level-1 translation ≠ image's ⇒ overlay withheld `LABEL_GEOMETRY_MISMATCH`, image still readable (B3).
- **F6 label level-count 1 vs image 2 ⇒** withhold `LABEL_LEVEL_MISMATCH`, citing the spec MUST (B3).
- **F7 name discrimination pair:** same store expressed with level paths `0,1` (S2 style) vs `s0,s1` (ome-zarr-py style) ⇒ identical rendering, cursor values, overlay decisions (Q3 lesson; mirrors S5's test logic on the read path).
- **F8 group-level transform:** multiscales-level `coordinateTransformations` scale on a time axis (S2 pattern) ⇒ composed after per-dataset transforms, image readout unchanged (2D) (§2.1).
- **F9 refusals:** missing `scale` on a dataset; 3 levels; 2 multiscales entries; missing axes ⇒ reason codes `TRANSFORM_INVALID`, `LEVEL_COUNT_UNSUPPORTED`, `MULTIPLE_MULTISCALES`, `AXES_UNSUPPORTED` (B1).

**Proposed checks:** C1 gate unit tests per refusal row; C2 cursor-composition arithmetic vs hand-computed values for F2 (e.g. index (10,20) → world (11.5, 3.65)); C3 switch invariance — world coordinates of the same screen point identical across levels for F2 (requires per-level translation, the S4/S5 lesson); C4 overlay decision matrix over F4–F6; C5 read-only assertion (no store writes during a session, watched via filesystem mtimes) over all fixtures; C6 F7 pair equivalence. **None of C1–C6 has been executed in this stage**; they are the prototype's discriminating acceptance criteria.

**Visible limits (shown to the user and true of this design):** (1) no unit conversion (UDUNITS-2 strings displayed verbatim); (2) physical readout is only as good as the file's declared scale — a file may legally encode relative-only factors (§2.1) and the viewer cannot detect that; (3) overlay alignment is verified only as *declared-geometry equality*, not content registration; (4) single 2D slice; no 3D, time navigation, cloud stores, authoring, or conversion; (5) nearest-neighbor labels only.

---

## 6. Unresolved consequential leads

See `out/UNRESOLVED_LEADS.md` (L1–L5). None blocks the proposal; L1/L2 are the consequential ones for the component choice and are confined to the *rejected-or-secondary* JS path except as noted there.

---

## 7. Supported corrections register (explicit)

1. **[CORR]** Thin plan assumes switching resolutions is sufficient for correct inspection: corrected — each level carries its own scale/translation, and cursor/overlay state must be recomputed per level (S1 + S4/S5 history).
2. **[CORR]** Thin plan implies an aligned label overlay is generally available: corrected — 0.4 provides association and level-count MUSTs but no geometric alignment guarantee; per-dataset justification + refusal state required (S1 §image-label/§Images).
3. **[CORR]** Implicit assumption that level directories are named predictably: corrected — names are arbitrary (S1 layout; S2 example `0,1,2`; S5 `s0,s1,s2`); resolve only via `datasets[].path`.
4. **[CORR]** Brief-internal clarification (no upstream error found): "two resolutions" is a *product* condition; the format permits 1–n levels and does not special-case two (S1).
5. **[CORR]** Units: "calibration can be absent" (brief) is consistent with the format — units are SHOULD-level in 0.4; the prototype must treat unitless calibration as normal input, not corruption (S1 §axes).
