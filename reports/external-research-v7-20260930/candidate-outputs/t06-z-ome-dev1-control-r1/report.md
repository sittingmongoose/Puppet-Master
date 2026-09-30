# Slide Scout — OME-Zarr 0.5 normative research report

**Case:** t06-z-ome-dev1-control-r1 (ome-normative-dev-v1) · **Deliverable:** standalone research report · **Date:** 2026-09-30

This report investigates the format obligations and implementation requirements that the thin Slide Scout viewer plan (`inputs/plan/Viewer.md`) needs, against the single admitted source: the frozen OME-Zarr 0.5 normative capture `inputs/sources/S003.txt`. It covers the whole product brief (`inputs/brief.md`) under both brief-derived assignment groups:

- **Group 1 —** opening a fileset, listing/selecting images, and navigating multiresolution data (§4).
- **Group 2 —** channel/time/plane display, coordinate details, and associated label overlays (§5).

---

## 1. Scope, method and source identity

- **Admitted primary source.** `inputs/sources/S003.txt`: the OME-Zarr specification, "Final Community Group Report, 8 September 2026", version 0.5 (S003:3-6). `inputs/catalog.json` records it as an `original_bytes` view of 36,980 bytes / 896 lines, sha256 `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`, aliased to `https://ngff.openmicroscopy.org/0.5/`. No live fetch was performed and no source outside the admitted paths was consulted.
- **Citation convention.** `S003:L` or `S003:L-L` refers to line numbers of `inputs/sources/S003.txt`. `Viewer.md:L` and `brief.md:L` refer to the plan and brief.
- **Requirement language.** The spec adopts RFC 2119 keywords (S003:57-59) and states that all of its text is normative except sections explicitly marked non-normative, examples, and notes (S003:867-878). Findings below are classified as **Obligation** (MUST / MUST NOT / SHOULD), **Optional capability** (MAY), or **Product decision** (no normative constraint either way). Conditional obligations ("optional, but if present … MUST") are always reported with their governing condition intact.
- **Method boundary.** This is analytic synthesis with pinpoint citations, not a passage bundle or index. Task-card instructions are not treated as evidence about the format.
- **Validation status.** All proposed validation in §10 is **UNEXECUTED**. Execution was not authorized in this case and none was performed; nothing in this report should be read as a test result.

---

## 2. Executive summary

1. **Container.** OME-Zarr 0.5 is implemented on Zarr format version 3 (S003:67-72); all Zarr features (codecs, chunk grids, chunk key encodings, data types, storage transformers) remain available "unless explicitly disallowed" (S003:70-72). All OME metadata lives under the namespaced key `ome` inside group-level `zarr.json` attributes (S003:152-154), and the `ome.version` string **MUST** be consistent within a hierarchy (S003:155-156) — a cheap, well-defined malformed-input check for Slide Scout.
2. **A "fileset" is not one shape.** A conforming fileset can be a single multiscale image group (S003:78-117), a transitional `bioformats2raw.layout` multi-image collection (S003:175-275), or an HCS plate → row → well → field-of-view hierarchy (S003:118-129, 515-560, 740-752). Discovery obligations on readers are conditional and mostly SHOULD/MAY; the clearest one — readers **SHOULD** make users aware of more than one image and **SHOULD NOT** default to only the first (S003:272) — directly supports the plan's "lists the images it finds" (Viewer.md:5).
3. **Multiresolution navigation is metadata-driven.** Level array names are arbitrary and carry no ordering meaning (S003:93-94); order comes solely from `datasets[].path` ordered largest → smallest (S003:304-306). Axes must number 2–5, equal the array dimensionality, and be ordered time → channel/custom → space (S003:300-302); every multiscale-level array **MUST** carry `dimension_names` matching `axes` (S003:174).
4. **Calibration has guaranteed structure but not guaranteed units.** Each level **MUST** carry exactly one `scale` transformation whose vector length equals the axis count (S003:308-312); group-level transformations **MAY** be present and are applied after the per-level ones (S003:314-316, with sequential application at S003:293). But axis `unit` is only SHOULD (S003:169-170), so "correctly calibrated coordinates" (brief.md:3) cannot always be displayed in physical units; the UI needs an explicit uncalibrated state.
5. **Channel/time/plane rendering hooks are transitional and optional.** The `omero` block (S003:398-425) is optional; if present, only `channels` (with per-channel `color` as 6 hex digits and `window` with `min`/`max`/`start`/`end`) are MUST (S003:426-430). Convenient defaults such as `rdefs.defaultT`/`defaultZ`/`model` appear only in the example, not in normative text (S003:401-423).
6. **Label overlays have exactly one hard alignment guarantee.** A label image **MUST** implement multiscales and **MUST** have the same number of scale levels as its parent image (S003:454-455); label pixels **MUST** be integer dtypes (S003:438-439); label dimensions may be 1 where irrelevant (S003:106-108). Display via `image-label.colors` is a reader SHOULD (S003:461-466). Spatial co-registration is described only as "usually" (S003:433) — the viewer must verify per-level transforms, not assume them.
7. **No normative basis exists** for responsiveness, cancellation, background reads, or error UX — those are engineering requirements to be validated by measurement, not from S003. The spec's Implementations section is a stub ("See Tools.", S003:813-814), so the brief's request to research "actual reader implementations" (brief.md:5) **cannot be satisfied inside the admitted scope** (§8).
8. **The spec contradicts its own examples in places** (e.g., plate examples omit the mandatory `version` key: S003:550-551 vs. 563-639 and 641-739). Parsers should follow the normative sentences, not the examples (§9).

---

## 3. Format foundation the plan builds on

**Storage format.** OME-Zarr is "implemented using the Zarr format as defined by version 3 of the Zarr specification" (S003:67-69). The hierarchy "could equally be stored on a web server … or in object storage like S3 or GCS" (S003:73-77): storage-agnosticism is a format property, so Slide Scout's local-filesystem-only boundary (brief.md:3, Viewer.md:9) is a **product decision**, not a format constraint. Consequence: local files must be read through the same metadata logic that remote readers use, and nothing in the spec obliges a reader to handle only local paths.

**Metadata location and versioning.** OME-Zarr metadata is stored in the various `zarr.json` files under `attributes.ome` (S003:149-154); the version is a string in that namespace (S003:155) and **MUST** be "consistent within a hierarchy" (S003:156). Group-level attributes for an image include `multiscales` and `omero` (S003:87-89).

**Transitional metadata policy.** Transitional metadata is included with the intention of removing it later; "Implementations may be expected (MUST) or encouraged (SHOULD) to support the reading of the data, but writing will usually be optional (MAY)" (S003:60-64). Two features Slide Scout will meet in the wild are transitional: `bioformats2raw.layout` (S003:175-181) and `omero` (S003:398-400). This makes read-support for transitional metadata a first-class interop concern, while writing it is not required — compatible with the read-only product boundary.

**JSON hygiene.** JSON comments appear in the spec's examples "only for clarity" and **MUST NOT** be included in JSON objects (S003:65-66). A strict JSON parser is sufficient; lenient comment-tolerant parsing is a choice, not an obligation.

**Editor's-draft caveat.** The released version is 0.5; "Data written with these latest changes (an 'editor's draft') will not necessarily be supported" (S003:25-27). Version skew is a real interop risk when meeting "filesets from real OME-Zarr 0.5 tools" (Viewer.md:9); the capture's version history runs to 0.5.2 (S003:823-827, `dimension_names` clarification dated 2025-01-10).

---

## 4. Group 1 — Opening a fileset, listing/selecting images, multiresolution navigation

### 4.1 The three layout families a fileset can present

**Family A — one or more standalone multiscale images (§1.1).** Each image is a Zarr group whose `zarr.json` carries `multiscales` (and optionally `omero`) (S003:87-89). Each resolution level is a separate array; level names are arbitrary (often `0…n`), with ordering defined by the `multiscales` metadata (S003:91-94). Arrays are up to 5-dimensional with the time axis before channel before spatial axes (S003:96-97, normatively at S003:302). Dimensionality is variable between 2 and 5 and **axis names are arbitrary** (S003:79-81) — axis *type*, not name, is the semantic handle.

**Family B — `bioformats2raw.layout` collections (§2.2, transitional).** For the common "multi-image file" scenario, a wrapping group carries `bioformats2raw.layout` in its top-level `zarr.json` (S003:175-193); conforming groups **MUST** have value `"3"` for that key (S003:256). An `OME` group **SHOULD** contain `OME/METADATA.ome.xml`, which **MUST** adhere to the OME-XML specification and **MUST** use `<MetadataOnly/>` rather than `<BinData/>`, `<BinaryOnly/>` or `<TiffData/>` (S003:257-260). Image location follows a fixed logic (S003:261-270):
- If `plate` metadata is present, images **MUST** be at the plate-defined locations, and `plate` takes precedence over `bioformats2raw.layout`; mixing image collections with plates is not possible (S003:204-206, 262).
- The `OME` group **MAY** contain a `series` attribute, which **MUST** be a list of strings (paths to image groups) whose order **MUST** match the order of `Image` elements in the OME-XML if provided (S003:265-267).
- With no `series` and no `plate`, multiscale images **MUST** be in consecutively numbered groups starting from `0`, and every multiscales group **MUST** represent exactly one OME-XML `Image`, in the same order (S003:268-270).

**Family C — HCS plates (§1.2, §2.7, §2.8).** Three groups **MUST** be defined above the images: the well (which **MUST** implement the well specification), the row, and the plate (which **MUST** implement the plate specification); all images in a well are fields of view of that well (S003:118-127). Empty well rows and empty wells **SHOULD NOT** be present (S003:128-129). Plate metadata **MUST** contain `columns`, `rows`, `version`, and `wells` (S003:530-531, 542-543, 550-551, 552-553); all rows/columns **MUST** be defined even where no wells exist (S003:532-533, 544-545); row/column names **MUST** be alphanumeric, case-sensitive, unique strings (S003:534-537, 546-548). Each well **MUST** have `path` (exactly `row/column`, no extra leading/trailing directories), plus 0-based `rowIndex`/`columnIndex`, and all three **MUST** agree (S003:553-560). Wells **MAY** refer to acquisitions whose `id` **MUST** be a unique integer ≥ 0 (S003:518-522). Well metadata **MUST** contain an `images` list of fields of view with unique alphanumeric `path`s; if the plate has multiple acquisitions, each image **MUST** carry an `acquisition` key matching a plate acquisition (S003:744-750). The well spec `version` key is SHOULD (S003:751-752).

### 4.2 Discovery and selection: what is obliged, what is optional

The only paragraph addressing readers' discovery behavior is S003:271-275:

- **SHOULD** make users aware of the presence of more than one image, i.e. **SHOULD NOT** default to only opening the first (S003:272).
- **MAY** use the `series` attribute to determine valid display groups (S003:273); **MAY** show all images or offer a choice, as with HCS plates (S003:274); **MAY** ignore other groups or arrays under the root (S003:275).

Everything else about listing/selection UX is a **product decision**. Note the asymmetry: the *format* obligations here are about not hiding images and about interpreting collection metadata correctly; they do not prescribe a UI. Also note that completeness of the `labels` listing is only SHOULD (S003:442) — see §5.3 — so an exhaustive "list everything" mode needs directory walking in addition to metadata reading.

### 4.3 Multiresolution navigation obligations

`multiscales` is a list of dictionaries, each describing one multiscale image (S003:295-298). Per entry:

- **MUST** contain `axes` (S003:299); axis count 2–5, equal to the dimensionality of the data arrays (S003:300). The axes **MUST** contain 2 or 3 `space` entries and **MAY** additionally contain one `time` and one `channel`-or-custom entry (S003:301). Order **MUST** match array dimension order and **MUST** be time first, then channel/custom, then space (S003:302). For 3-D stacks the `zyx` order is SHOULD (S003:303).
- **MUST** contain `datasets`, each with a `path` relative to the current group; paths **MUST** be ordered from largest (highest resolution) to smallest (S003:304-306). All datasets **MUST** share dimensionality, **MUST NOT** exceed 5 dimensions, and **MUST** correspond to `axes` (S003:307).
- Each dataset **MUST** contain `coordinateTransformations` restricted to `translation`/`scale`, with exactly one `scale` (S003:308-310; see §5.1); a `translation` is MAY and **MUST** come after `scale` (S003:311). Vector lengths **MUST** equal the axes count (S003:312).
- **MAY** contain a group-level `coordinateTransformations` applied to all levels, after the per-level transforms, under the same type/order rules (S003:314-316; sequential application, S003:293).
- **SHOULD** contain `name`, `type` (downscaling method) and `metadata` (S003:317-319).

**Multiple named multiscales.** "If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback" (S003:388-389, with informative pseudocode at S003:390-397). This paragraph is guidance, not an RFC-2119 requirement on readers; exposing a named-multiscale chooser is a **product decision**, with "use the first" as the spec-suggested fallback.

**Navigation implications.** (a) Never infer level order or axis roles from array/axis names — use `datasets` order and `axes` types (S003:93-94, 79-81, 302). (b) Level selection for the current view is unconstrained by the spec beyond the ordering rule; the only hint (choose by chunk size) lives in an informative comment (S003:396). (c) Pure 2-D data (no t, no c) is valid, matching the plan's "where relevant" phrasing for time/plane controls (Viewer.md:5).

### 4.4 Plan implications and dispositions — Group 1

| Plan claim (Viewer.md) | Source basis | Disposition |
|---|---|---|
| "opens a local OME-Zarr 0.5 fileset" (L5) | Zarr v3 container, storage-agnostic (S003:67-77) | Confirm boundary, but record that local-only is a **product decision**; validate `zarr_format`/`node_type` and `ome.version` on open (S003:155-156). |
| "lists the images it finds" (L5) | Three layout families; reader SHOULD at S003:272; conditional MUSTs at S003:261-270, 530-560, 744-752 | **Extend the plan** with an explicit discovery algorithm: detect `plate` (takes precedence, S003:204-206) → enumerate wells/fields via `plate.wells` + `well.images`; else `bioformats2raw.layout` → use `series` if present, else consecutive groups `0…`; else standalone multiscale groups. Acceptance fixtures need all three families (plan L11 currently lists none). |
| "Selecting an image opens a canvas with pan and zoom" (L5) | Level ordering from metadata only (S003:304-306) | Confirm; **decision needed** on level-selection heuristic (spec offers no rule; chunk-size hint is informative only, S003:396). |
| "Large image reads run in the background … Changing the selected view cancels work" (L7) | No normative basis; chunking exists in Zarr v3 but is outside the capture (S003:70-72) | Engineering requirement, unverifiable from S003. Keep as product/engineering acceptance (plan L11 "must not freeze interaction"); mark as **unsupported-input limitation** (§8). |
| "Opening failures explain which image or data could not be displayed" (L7) | Spec defines detectable violations but no required reader behavior on them (§6) | **Decision needed** on per-violation messaging; the §6 list supplies the detectable conditions. |
| "interoperate with filesets from real OME-Zarr 0.5 tools" (L9) | Transitional layouts exist for in-the-wild data (S003:60-64, 175-181); editor's-draft caveat (S003:25-27); Implementations stub (S003:813-814) | **Unresolved in scope**: which real tools produce what cannot be established from S003 (§8); transitional read-support is the spec-visible interop surface. |
| "Source files remain unchanged; display settings are local" (L9) | Reading transitional metadata may be MUST/SHOULD, writing usually MAY (S003:60-64) | Confirm compatible: no normative duty to write anything; persisting display settings outside the fileset satisfies read-only. |
| "Image editing, export, remote storage … outside this plan" (L9) | Format is storage-agnostic (S003:73-77); nothing mandates export/editing | Confirm as **product decision**; excluding remote does not conflict with the format. |

### 4.5 Malformed-input conditions detectable at the Group 1 stage

Version inconsistency across the hierarchy (S003:156); missing/mismatched `dimension_names` in level arrays (S003:174); axes count ≠ array dimensionality (S003:173, 300, 307); axes order violating time→channel→space (S003:302); dataset paths not ordered largest→smallest (S003:306); transforms violating the scale/translation rules (S003:309-312); `series` not a string list or misordered vs. OME-XML (S003:266-267); plate `wells[].path`/`rowIndex`/`columnIndex` disagreement (S003:557-560); duplicate or non-alphanumeric row/column/well names (S003:534-537, 746-747); JSON comments (S003:65-66). The spec does **not** specify what a reader must do when it meets these; user-facing behavior is a product decision.

---

## 5. Group 2 — Channel/time/plane display, coordinate details, and label overlays

### 5.1 Axes, units, and the calibration pipeline

**Axes metadata (§2.1).** Each axis dictionary **MUST** contain `name`, unique across the list (S003:168); **SHOULD** contain `type`, normally one of `space`/`time`/`channel` but **MAY** be any custom string (S003:169); **SHOULD** contain `unit`, drawn from UDUNITS-2 strings for space (S003:171) and time (S003:172). Axes length **MUST** equal array dimensionality (S003:173). Separately, the array-level `zarr.json` **MUST** include `dimension_names` matching `axes` (S003:174) — this is the 0.5.2 clarification (S003:825-827) and the strongest cross-check that a level array matches the declared axes.

**Calibration composition.** Data→physical mapping is assembled from: (1) each dataset's `coordinateTransformations`, which **MUST** contain exactly one `scale` giving "the pixel size in physical units or time duration" — and where scaling information is unavailable for an axis, that axis' value **MUST** express the factor relative to the first resolution, defaulting to 1.0 (S003:310); (2) an optional per-dataset `translation`, which **MUST** follow `scale` (S003:311); (3) an optional group-level `coordinateTransformations` applied after all per-level transforms (S003:314-316). All transforms in a list apply **sequentially and in order** (S003:293). Vector lengths **MUST** equal the axes count — so channel and time axes carry scale values too (S003:312).

Consequences for the details panel and any coordinate readout:
- Effective voxel size at level *i* for axis *a* = compose(dataset scale, group-level scale) in order; origin offset = compose(scale, translation). Implementing only the dataset-level transforms while ignoring group-level ones is a silent calibration bug the spec's structure explicitly permits datasets to trigger (S003:314-316).
- **Units are only SHOULD** (S003:169-170). A fileset may be structurally valid yet carry no unit strings; "correctly calibrated coordinates" (brief.md:3) is therefore achievable in *structure* always, in *physical units* only when units are present. The UI needs an explicit "uncalibrated / no unit" state — a **product decision** the thin plan does not yet make.
- **Known ambiguity (unresolved, §11):** S003:310 mixes absolute sizes ("pixel size in physical units") with first-level-relative factors on an axis-by-axis fallback basis. How a reader should interpret a scale vector that mixes both semantics for one axis is not derivable from the capture.
- Plane navigation should treat the z axis as possibly anisotropic: the `zyx` spatial ordering is only SHOULD (S003:303) and physical spacing comes from the scale values, never from array indices.

### 5.2 Channel/time/plane rendering: the transitional `omero` block

Status: transitional render hints "specific to the channels of an image and how to render it" (S003:398-400), governed by the transitional policy (S003:60-64) — read support may be expected/encouraged, writing is not required.

Governing conditions:
- The block is **optional**; if present it **MUST** contain `channels`, an array of dictionaries (S003:426).
- Each channel **MUST** contain `color` — a 6-hex-digit RGB string (S003:427) — and `window`, which **MUST** contain `min`/`max` (data range) and `start`/`end` (display window) (S003:428-430).
- Everything else in the example — `id`, `name`, `active`, `coefficient`, `family`, `inverted`, `label`, and `rdefs` (`defaultT`, `defaultZ`, `model`) — is example material only (S003:401-423); relying on `rdefs` for initial timepoint/plane (the natural default for the plan's time/plane selectors) is a **product decision with a required fallback** when absent. Semantics beyond the capture are delegated to "the OMERO WebGateway documentation" (S003:424-425), which is not admitted input (§8).
- The comment that `channels` matches "the c dimension size" (S003:403) is not normative; a length mismatch between `omero.channels` and the channel axis is undefined behavior — a robustness check Slide Scout should own.

Because `omero` is optional, channel count and identity must always be derivable from `axes` (S003:301-302) alone; colors/windows are enhancements. A **decision needed**: default channel rendering (e.g., grayscale or a fixed palette) when `omero` is absent — the spec offers no fallback.

### 5.3 Associated label images: discovery, guarantees, limits

**Structure and discovery.** Label images live in a `labels` group nested inside the image group, at the same level as the resolution arrays (S003:102-105, 437); intermediate folders are permitted but currently carry no extra metadata, and such intermediate groups **MUST NOT** contain metadata (S003:110, 439-440). The `labels` group's `zarr.json` **MUST** contain the `labels` key — a JSON array of paths to the labeled multiscale images — and **all** label images are only SHOULD-listed (S003:441-442). Discovery therefore has a metadata path and a (complementary) directory-walk path; using both is a **product decision**. In HCS filesets labels are explicitly optional (S003:145).

**Hard obligations (MUST).**
- Label pixels **MUST** be one of the integer dtypes `[uint8, int8, uint16, int16, uint32, int32, uint64, int64]` (S003:438-439).
- The label image `zarr.json` **MUST** implement the multiscales specification, and its `datasets` **MUST** have the **same number of scale levels** as the original unlabeled image (S003:454-455).
- Each label dimension must equal the image's corresponding dimension, or be 1 where irrelevant (S003:106-108) — overlay code must broadcast size-1 axes.
- `image-label.colors[].label-value` **MUST** be the integer pixel value; `rgba`, if present, **MUST** be four integers 0–255 (R,G,B,alpha/opacity); `image-label.version` **MUST** be a string (S003:459-460, 462-466); `source` **MUST** be an object whose optional `image` is a relative path string, defaulting to `../../` (S003:472-474).

**Soft obligations (SHOULD) and options.**
- `image-label` itself, and its `colors`/`version` keys, are SHOULD (S003:456-460).
- Readers **SHOULD** display labels using the specified colors (S003:461); values without an `rgba` entry have no specified color → **decision needed** on a fallback palette. The worked example renders rgba alpha as 50% opacity blending (S003:513-514).
- `properties` (arbitrary per-label key-value metadata) and `source` are MAY (S003:467-471) — a natural hook for a label-inspection readout (e.g., "class: cell / cell type: neuron", S003:493-505); **decision needed** whether Slide Scout surfaces it.

**Alignment limits (counterevidence to a naive "overlays are co-registered" assumption).** The spec says label images are produced in the same coordinate system, "*usually* having the same dimensions and coordinate transformations" (S003:433) — descriptive, not normative. The only enforced alignment guarantee is scale-level parity (S003:454-455). "Aligned label overlays" (Viewer.md:5, brief.md:3) therefore require the viewer to verify each label level's own `coordinateTransformations` and dimensions rather than assume identity with the parent; mismatch handling is unspecified → **product decision**.

### 5.4 Plan implications and dispositions — Group 2

| Plan claim (Viewer.md) | Source basis | Disposition |
|---|---|---|
| "channel visibility controls" (L5) | Channel axis from `axes` (S003:301-302); `omero` optional; only `color`/`window` MUST when present (S003:426-430) | Confirm the control; **extend** with: derive channel count from `axes`, not `omero`; add a no-`omero` default-rendering decision; treat `omero` as transitional (may disappear in future NGFF, S003:60-64, 398-400). |
| "time-point and plane selection where relevant" (L5) | Presence of t/z determined by `axes` (S003:301); `rdefs.defaultT/defaultZ` example-only (S003:419-421) | Confirm "where relevant" = axis presence by type; **decision needed** on initial t/z defaults without `omero`. Plane spacing must come from scale, not index (S003:310, 303). |
| "A details panel shows dimensions, units and coordinates" (L5) | Dims: `axes`/`datasets`/`dimension_names` (S003:299-307, 174). Units: SHOULD only (S003:170). Coordinates: compose dataset- then group-level transforms in order (S003:293, 310-316) | **Extend the plan**: state the transform-composition rule and the missing-unit display state; otherwise the panel can show silently wrong coordinates on files using group-level transforms, or claim calibration when units are absent. |
| "optional overlays for associated label images" (L5) | Discovery S003:441-442 (completeness SHOULD); parity MUST S003:454-455; dims broadcast S003:106-108; colors SHOULD S003:461-466; co-registration "usually" S003:433 | **Extend**: per-level alignment verification + integer-dtype check + fallback color decision; verify rather than assume alignment (the MUST covers level count only). |
| "aligned label overlays" acceptance (L11) | S003:433, 454-455 | Keep, but define "aligned" as verified equality of per-level transforms/dims; add a negative fixture (label level transforms differing) — **UNEXECUTED** proposal (§10). |
| "read correctly calibrated coordinates" (brief.md:3) | S003:308-316, 169-170 | Conditional guarantee; see §5.1. Disposition: implement composition + uncalibrated state. |

---

## 6. Failure surface: what the spec lets the viewer detect and explain

The plan requires that "malformed or unavailable input must produce understandable feedback rather than a crash" (Viewer.md:7, brief.md:3). S003 defines the *conditions* (conformance violations), not the reader behavior. A completeness checklist of detectable conditions, usable to drive error messages:

- **Container/metadata:** not Zarr v3 / missing `zarr.json` (S003:67-69, 152-154); JSON with comments (S003:65-66); `ome.version` missing or inconsistent within the hierarchy (S003:155-156).
- **Axes:** missing `name`; duplicate names (S003:168); axes length ≠ array dimensionality (S003:173, 300); space entries not 2–3 or extra t/c axes (S003:301); wrong axis ordering (S003:302); array `dimension_names` missing or ≠ `axes` (S003:174).
- **Levels:** `datasets` empty/misordered (largest→smallest, S003:306); dimensionality mismatch across levels or vs. axes (S003:307); per-dataset transforms absent or containing types other than scale/translation; missing or multiple `scale`; translation before scale; vector length ≠ axes count (S003:308-312).
- **Collections:** `bioformats2raw.layout` ≠ "3" (S003:256); `series` not a string list or inconsistent with OME-XML order (S003:266-267); image groups not consecutively numbered when required (S003:269); plate precedence violated / mixed with image collections (S003:204-206).
- **HCS:** missing plate `columns`/`rows`/`wells`/`version` (S003:530-531, 542-543, 550-551, 552-553); duplicate/non-alphanumeric row/column names (S003:534-537, 546-548); `wells[].path` not `row/column`, extra directories, or index/path disagreement (S003:553-560); well `images` missing or duplicate paths (S003:744-747); missing `acquisition` under multiple acquisitions or non-matching id (S003:748-750).
- **Labels:** non-integer dtype (S003:438-439); metadata on intermediate groups (S003:439-440); missing `labels` key (S003:441-442); label level count ≠ parent (S003:454-455); `label-value` non-integer or `rgba` out of range (S003:462-466).
- **Availability:** missing level arrays behind declared `datasets[].path`; missing `OME/METADATA.ome.xml` (only SHOULD, S003:257); missing `omero`/`image-label` (optional, S003:426, 456) — these are *absences to degrade gracefully on*, not violations.

Two governing caveats: (1) the spec does not say a reader MUST reject violators — rejection vs. best-effort display is a product decision per condition; (2) editor's-draft data "will not necessarily be supported" (S003:25-27), so some failures are version-skew, not malformation, and messaging can say so.

---

## 7. Obligations vs. optional capabilities vs. product decisions

**Established obligations (reader-relevant MUST/SHOULD).** Zarr v3 container (S003:67-69); consistent `ome.version` (S003:156); axes `name` unique (S003:168); axes count/dimensionality equality (S003:173, 300, 307); axis type ordering (S003:302); array `dimension_names` present and matching (S003:174); `datasets` with ordered `path`s and exactly one `scale` each, lengths = axes (S003:304-312); label integer dtypes (S003:438-439); no metadata on intermediate label groups (S003:439-440); `labels` key present (S003:441-442); label multiscales implementation with level parity (S003:454-455); HCS hierarchy MUSTs and well/plate field rules (S003:118-127, 530-560, 744-750); `bioformats2raw.layout` value and image-location logic (S003:256, 261-270); conditional `omero` MUSTs (S003:426-430); conditional `image-label` MUSTs (S003:459-460, 462-466, 472-473). SHOULDs include: aware-of-multiple-images (S003:272), `zyx` ordering (S003:303), axes `type`/`unit` (S003:169-170), multiscales `name`/`type`/`metadata` (S003:317-319), OME-XML sidecar (S003:257), full `labels` listing (S003:442), `image-label` keys (S003:456-460), label color display (S003:461), plate/well `name`/`field_count`/`version` (S003:523-541, 751-752).

**Optional capabilities (MAY).** Group-level `coordinateTransformations` (S003:314); `translation` transforms (S003:311); custom axis types (S003:169); `series` attribute use by readers; showing all images vs. offering choice; ignoring non-image groups (S003:273-275); `omero` and `image-label` blocks and their sub-options (`rgba`, `properties`, `source`, additional keys) (S003:426, 464-471); plate `acquisitions`/`description`/`starttime`/`endtime` (S003:518-529); multiple named multiscales with user choice (S003:388-397, informative).

**Product decisions (no normative constraint).** Local-only reading (format is storage-agnostic, S003:73-77); read-only operation (no write duty; transitional writing is MAY, S003:60-64); discovery UI (list vs. chooser, S003:274); level-selection heuristic (S003:396 informative only); named-multiscale chooser and fallback (S003:388-397); default channel rendering and label fallback colors; initial t/z without `rdefs`; uncalibrated-coordinate display state; per-violation error policy and messaging (Viewer.md:7); background reads/cancellation (no spec basis); label `properties` UI; whether v1 supports HCS plates, `bioformats2raw` collections, or both (brief's "find images within a fileset" plus S003:272 argue for at least detection and explanation of all three families).

---

## 8. Unsupported-input limitations (what S003 cannot answer)

- **Reader/writer implementations.** Brief.md:5 asks for research into "actual reader implementations broadly". S003 §4 is a stub: "See Tools." (S003:813-814), and the Tools page is not in the capture. No implementation-compatibility finding is possible within scope; this remains an open work item for a source set that admits it.
- **Zarr v3 specification.** Referenced normatively (S003:67-72) but not included: chunk grids, chunk key encoding, codecs, data types, storage transformers, array-metadata details, and the `zarr_format`/`node_type` grammar (seen only in examples, e.g. S003:195-197). Level-selection and I/O behavior depend on these; they must be sourced separately before implementation.
- **OMERO WebGateway semantics** for `omero` fields (S003:424-425) — not in capture; window `min/max/start/end` semantics beyond the local text are unverified.
- **OME-XML schema** — only the MetadataOnly constraints are captured (S003:257-260); validating `METADATA.ome.xml` contents is out of scope.
- **UDUNITS-2 registry and conversions** — unit strings are enumerated (S003:171-172) but unit parsing/conversion rules are not in the capture.
- **Performance.** Nothing in S003 addresses read performance, chunk-size guidance (beyond an informative comment, S003:396), memory, or responsiveness; plan claims at Viewer.md:7 are engineering-only.
- **Remote/HTTP reading semantics** — mentioned as possible storage (S003:73-77) with no normative access rules captured.
- **Post-0.5.2 or editor's-draft variations** — the capture fixes one edition (8 September 2026; history to 0.5.2, S003:823-827); behavior of other editions is out of scope.

---

## 9. Counterevidence, spec-internal inconsistencies, and uncertainty

1. **Plate examples omit a mandatory field.** `plate` **MUST** contain `version` (S003:550-551), yet neither plate example includes it (S003:563-639, 641-739). Well examples likewise omit the SHOULD `version` (S003:751-752 vs. 756-808). Implication: treat normative sentences as authoritative and expect real files to inherit example omissions; a validator keyed to the examples would under-detect.
2. **Naming style is knowingly inconsistent.** §3 says multi-word keys should be camelCase but "some parts … don't obey" (S003:809-812). In force: `field_count` (S003:538) vs. `maximumfieldcount` (S003:524-525) vs. `rowIndex`/`columnIndex` (S003:557). Parsers must match keys exactly as specified per section — no case normalization.
3. **Conformance boilerplate contradicts the body.** S003:875-876 says the keywords "do not appear in all uppercase letters in this specification", while the body uses uppercase MUST/SHOULD throughout (e.g., S003:156, 174, 310). The operative interpretation is the RFC 2119 one at S003:57-59 and 869-874; the boilerplate sentence is captured noise. (Body prose itself occasionally mixes case, e.g. lowercase "must" inside S003:302 — same practical reading.)
4. **`omero` normative content is narrower than its example.** Only `channels`/`color`/`window{min,max,start,end}` are MUST (S003:426-430); `label`, `active`, `rdefs` etc. are example-only (S003:401-423). UI code that treats example fields as guaranteed will break on conforming files.
5. **Label co-registration is "usually", not "MUST"** (S003:433) — the only hard guarantee is level-count parity (S003:454-455). Counterevidence to assuming aligned overlays; per-level verification required (§5.3).
6. **Scale semantics ambiguity.** S003:310 mixes absolute physical sizes with relative-to-first-level factors as a per-axis fallback; the capture gives no rule for interpreting a mixed vector, and no worked example resolves it (the example uses plain absolute sizes, S003:336-366). Genuine uncertainty affecting calibration display.
7. **Index quirk.** The index places "HCS, in § 2.2.3" (S003:891) although HCS is specified in §1.2 (S003:118-129); 2.2.3 only mentions HCS plates (S003:274). Navigation-by-index is unreliable in this capture.
8. **Version skew.** 0.5.0 switched OME-Zarr to Zarr v3 (S003:831-833); older 0.3/0.4 tooling writes Zarr v2 layouts that this spec's container rules do not describe. Meeting "real OME-Zarr 0.5 tools" (Viewer.md:9) therefore carries a detectable failure mode (non-v3 containers) whose prevalence cannot be assessed from S003.

---

## 10. Proposed validation — **UNEXECUTED**

No execution was authorized or performed in this case. The following validation plan is proposed for later execution; every item below is currently **UNEXECUTED** and must not be reported as a result.

**Fixtures (minimal synthetic filesets, each exercising one rule):**
1. Single 2-D and 5-D multiscale images (t,c,z,y,x and y,x), valid per S003:294-319 — parse, list, open.
2. `bioformats2raw.layout` collection: (a) with `series`; (b) without `series` (consecutive groups, S003:269); (c) plate-plus-b2raw precedence case (S003:204-206).
3. Dense and sparse plates with wells, empty rows/columns, and multi-acquisition wells (S003:518-560, 641-739, 744-808).
4. Label overlay set: parity-compliant labels (S003:454-455); label with size-1 broadcast axes (S003:106-108); label missing `image-label` (degrade path, S003:456); label colors with and without `rgba` (S003:464-466); negative fixture with label level-count mismatch (expect detection).
5. Calibration set: group-level + dataset-level transforms to compose (S003:314-316); missing `unit` (uncalibrated state, S003:170); translation-after-scale (S003:311).
6. Malformed set, one violation each from §6 (version mismatch S003:156; unordered `datasets` S003:306; `dimension_names` mismatch S003:174; non-integer label dtype S003:438-439; well path/index disagreement S003:557-560) — expect understandable error naming the image/cause (Viewer.md:7), not a crash.
7. Large synthetic pyramid for the responsiveness/cancellation acceptance (Viewer.md:7, 11) — measurable only as engineering performance; no S003 basis.

**Checks mapped to acceptance (Viewer.md:11):** discovery counts per family; navigation across levels by metadata order; channel/plane controls driven by `axes` types; coordinate readout equals hand-composed transform values; overlays verify per-level alignment before rendering; no interaction freeze on fixture 7; per-violation feedback on fixture 6.

---

## 11. Unresolved areas

1. **Real-tool interop matrix** (Viewer.md:9, brief.md:5) — blocked by the Implementations stub (S003:813-814) and the S003-only scope; requires a later, differently-scoped research pass.
2. **Interpretation of mixed absolute/relative scale vectors** (S003:310) — needs either a spec clarification or an adopted convention, recorded as a Slide Scout decision.
3. **Reader behavior on nonconforming input** — the spec never says reject vs. tolerate; each §6 condition needs a product ruling.
4. **Channel count vs. `omero.channels` length mismatch** (S003:403 comment vs. 426) — undefined; needs a robustness policy.
5. **Named-multiscale UX** — the spec's user-choice guidance is informative only (S003:388-397); Slide Scout must decide.
6. **Fallback rendering decisions** — default channel colors/windows and label colors absent `omero`/`rgba` (S003:426-430, 461-466).
7. **Version-skew policy** — how to message editor's-draft or future-0.5.x files (S003:25-27) pending knowledge of real writers.
8. **HCS scope for v1** — plate/well navigation is fully specified (S003:118-129, 515-560, 740-752) but the thin plan never mentions it; supporting, detecting, or deferring it is an explicit review decision (Viewer.md:9).

---

*Source: `inputs/sources/S003.txt` (OME-Zarr specification, Final Community Group Report, 8 September 2026; 896 lines; sha256 `5d8b2408…2ae82de` per `inputs/catalog.json`). All proposed validation UNEXECUTED. No live fetches, no external writes, no sources outside the admitted paths.*
