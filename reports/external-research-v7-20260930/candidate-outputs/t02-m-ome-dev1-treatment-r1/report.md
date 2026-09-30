# Slide Scout — OME-Zarr 0.5 format obligations research report

Standalone report for the whole product brief within fixed normative capture S003.
Source scope: `inputs/sources/S003.txt` only (frozen OME-Zarr 0.5 capture, 896 lines).
No live fetch performed. Plan fixture: `inputs/plan/Viewer.md`.
Brief: `inputs/brief.md`. Assignment: `inputs/TASK.md`.

All S003 line citations below are `inputs/sources/S003.txt:L<start>-L<end>`.
Normative words (MUST / SHOULD / MAY) are per S003's RFC 2119 declaration.
S003 states all text is normative except explicitly non-normative sections,
examples, and notes (L877-L888), and that keywords may appear lowercase
for readability (L872-L876). JSON examples may show `//` comments for clarity
only; comments MUST NOT appear in real JSON objects (L65-L66).

Status of proposed validation in this report: **UNEXECUTED** throughout.
No execution was authorized or performed; no execution evidence exists.

---

## 1. Scope, method, and version pinning

### 1.1 Assignment coverage

This report covers the whole brief in one combined scope, equal to the two
brief-derived groups together:

1. Opening a fileset, listing/selecting images, navigating multiresolution data.
2. Channel / time / plane display, coordinate details, associated label overlays.

Cross-cutting brief requirements also covered: local-filesystem read-only
reading, source files unchanged, responsiveness on large datasets, and clear
explanation of non-displayable data. Image editing, export, remote services,
and clinical interpretation are out of scope per brief and plan.

### 1.2 Source identity and limits

- Admitted evidence is only S003, described by `inputs/catalog.json` as
  `sources/S003.txt`, original/view SHA256
  `5d8b240877...2ae82de`, 36980 bytes, 896 lines, `view_kind: original_bytes`.
- S003 self-identifies as "OME-Zarr specification", "Final Community Group
  Report, 8 September 2026", "current released version ... is 0.5"
  (L1-L6, L25-L26).
- Data written against an "editor's draft" will not necessarily be supported
  (L25-L27). Migration scripts "will be provided between numbered versions"
  (L25-L26), but S003 contains no migration content.
- Version history records: 0.5.0 "use Zarr v3 ... see RFC-2" (L831-L833);
  0.5.1 "Re-add the improved omero description in PR-191" (L828-L830);
  0.5.2 "Clarify that the dimension_names field in axes MUST be included"
  (L825-L827).
- S003 references but does **not** include: Zarr v3 specification text
  (L68-L72), UDUNITS-2 unit definitions beyond the name lists (L170-L173),
  OME-XML specification (L257-L260), OME-TIFF (L52-L55), OMERO WebGateway
  rendering docs (L424-L425), "Tools" implementations page (L813-L814),
  RFC 2119 text (L57-L59, L895-L896), and any future replacement for
  `bioformats2raw.layout` (L180-L181). Findings about those systems are
  therefore limited to what S003 normatively states.
- No reader-implementation behavior beyond S003 was in scope and none is
  claimed. The brief asks for "actual reader implementations broadly"; under
  the fixed S003-only scope that part is **untested** (see §8–§10).

### 1.3 Obligation vocabulary used here

- **Obligation:** S003 MUST / MUST NOT / REQUIRED / SHALL.
- **Recommended / optional capability:** S003 SHOULD / RECOMMENDED / MAY /
  OPTIONAL, including transitional metadata where reading MAY be
  MUST/SHOULD but writing is usually MAY (L60-L64).
- **Product decision:** behavior S003 leaves to the reader (MAY show all vs.
  offer choice, selection among multiscales, rendering defaults, error UX,
  performance design, handling of custom axes or unknown keys), or behavior
  S003 does not specify at all.

---

## 2. Storage and hierarchy obligations (both groups)

### 2.1 Zarr v3 foundation — obligation

- OME-Zarr "is implemented using the Zarr format as defined by ... version 3
  of the Zarr specification" (L68-L69).
- "All features of the Zarr format including codecs, chunk grids, chunk key
  encodings, data types and storage transformers may be used with OME-Zarr
  unless explicitly disallowed in this specification" (L70-L72).
- Implication: Slide Scout MUST be prepared for arbitrary Zarr v3 array
  encodings unless S003 explicitly disallows them. S003's only explicit
  array-value restriction in capture is that label arrays MUST use integer
  types from `[uint8,int8,uint16,int16,uint32,int32,uint64,int64]`
  (L438-L439) and label pyramid levels support "only integer values"
  (L116-L117). No general image dtype restriction is stated in S003.
- Chunks "are stored conforming to the Zarr array specification and metadata
  as specified in the array's zarr.json" (L99-L100).
- S003 illustrates the hierarchy "as it would appear locally but could
  equally be stored on a web server ... or in object storage like S3 or GCS"
  (L73-L77). Local-filesystem-only support is a brief/plan boundary, not a
  format exclusion; remote layouts are conforming inputs the viewer will
  deliberately decline.

### 2.2 `zarr.json`, `ome` namespace, version consistency — obligation

- OME-Zarr metadata is stored "in the various zarr.json files" under
  namespaced key `ome` in `attributes` (L149-L154).
- `ome.version` is a string denoting metadata version (L155); example
  `"version": "0.5"` (L157-L164).
- "The OME-Zarr Metadata version MUST be consistent within a hierarchy"
  (L156).
- Group-level `zarr.json` carries `multiscales` and `omero` for images
  (L87-L90); array-level `zarr.json` carries Zarr array metadata (L96-L100).
- Product decisions: what "consistent" violation means for UX (refuse
  fileset vs. refuse subtree vs. warn-and-continue), and how to handle a
  missing or non-`0.5` `ome.version`, are unspecified in S003. The plan's
  "explain which image or data could not be displayed" must cover these
  cases by product choice, not by a spec-mandated message.

### 2.3 Image hierarchy shape

- Layout covers "images with multiple levels of resolutions and optionally
  associated labels" (L79-L80).
- "The number of dimensions is variable between 2 and 5 and ... axis names
  are arbitrary" (L81).
- Each image is "a Zarr group of other groups and arrays" (L87).
- Each multiscale level is "a separate Zarr array" in a folder of chunks
  (L91-L92).
- Array names are "arbitrary with the ordering defined by the `multiscales`
  metadata, but ... often a sequence starting at 0" (L93-L94).
  Counterevidence against assuming `0..n`: names MUST be read from
  `datasets[].path`, not inferred.
- All image arrays "must be up to 5-dimensional with the axis of type time
  before type channel, before spatial axes" (L96-L98); the fuller ordering
  rule is in §4.1.
- Labels container shape is fixed only as: image group → `labels/` →
  optional intermediate folders → label multiscales (L102-L117); see §6.

### 2.4 High-content screening (HCS) hierarchy — conditional obligation

Applies when the fileset is an HCS dataset (L118-L148):

- "Three groups MUST be defined above the images": well group MUST implement
  well spec; above it a row group; above that a plate group MUST implement
  plate spec (L120-L127).
- Contained images in a well are fields of view of the same well
  (L122-L123).
- "A well row group SHOULD NOT be present if there are no images in the well
  row" and "A well group SHOULD NOT be present if there are no images in the
  well" (L128-L129). These are SHOULD NOT, so empty-row/empty-well groups
  may still exist in the wild and MUST NOT crash discovery.
- Canonical shape: `plate.zarr/zarr.json` (plate) → `A/zarr.json` (row) →
  `A/1/zarr.json` (well) → `0/zarr.json` (multiscales+omero) → `0...`,
  `labels/` (L132-L148).

### 2.5 Transitional metadata handling

- Transitional metadata "is added ... with the intention of removing it in
  the future. Implementations may be expected (MUST) or encouraged (SHOULD)
  to support the reading of the data, but writing will usually be optional
  (MAY)" (L60-L64).
- In S003 the transitional keys are `bioformats2raw.layout` (§2.2) and
  `omero` (§2.5). Slide Scout is read-only, so only the read side matters;
  write rules are irrelevant except to reinforce "source files remain
  unchanged."

---

## 3. Group 1 findings: open, list/select, navigate pyramids

### 3.1 Opening entry points — obligations and gaps

S003 defines at least four legitimate entry shapes; a viewer that only opens
"one image group" is incomplete:

| Entry shape | S003 locator | Required discovery |
|---|---|---|
| Single / standalone image group | L82-L100, L294-L316 | Read group `zarr.json` → `ome.multiscales[]`. |
| HCS plate group | L118-L148, L516-L739 | Read `ome.plate`, then row/column/well paths, then `ome.well`, then field-of-view image groups. |
| `bioformats2raw` collection (`series.ome.zarr`) | L183-L275 | Read top-level `ome.bioformats2raw.layout==3`; then plate path if `plate` present, else `OME/series`, else consecutively numbered groups. |
| Label image subgroup | L102-L117, L431-L460 | Intended as overlay of its parent image (same coordinate system, L432-L433). Labels group "is not itself an image; it contains images" (L437-L438). Whether to also allow standalone browsing of a label image is a product decision; S003 does not forbid it. |

Detailed collection rules (`bioformats2raw.layout`, transitional):

- Typical layout: `series.ome.zarr/zarr.json` with layout key, `OME/zarr.json`
  with `series`, `OME/METADATA.ome.xml`, then `0/`, `1/`, ... (L183-L191).
- Top-level `ome.bioformats2raw.layout` MUST have value `"3"` (string form in
  L256; JSON example shows numeric `3` at L200/L213 — see uncertainty §9.4).
- If the top group represents a plate, `bioformats2raw.layout` will be
  present but `plate` "MUST also be present, takes precedence and parsing ...
  should follow" plate metadata; "It is not possible to mix collections of
  images with plates at present" (L204-L206).
- `OME` group MAY contain `series`: if so it MUST be a list of strings each a
  path to an image group, and order MUST match `Image` element order in
  `METADATA.ome.xml` if provided (L264-L267). Example `["0","1"]`
  (L243-L253).
- If no `series` and no `plate`: separate multiscales images MUST be in
  consecutively numbered groups `"0/","1/",...` (L268-L269), each MUST
  represent exactly one OME-XML `Image` in series/group-number order
  (L270).
- Readers: SHOULD make users aware of >1 image and SHOULD NOT default to
  only opening the first image (L272); MAY use `OME/series` to list valid
  groups (L273); MAY show all images or offer a choice "as with HCS plates"
  (L274); MAY ignore other groups/arrays under root (L275).
- `OME/METADATA.ome.xml` SHOULD exist for the whole collection; if so it MUST
  adhere to OME-XML, MUST use `<MetadataOnly/>` not `<BinData/>` /
  `<BinaryOnly/>` / `<TiffData/>`, and MAY use the minimum spec
  (L257-L260). S003 does not define the minimum spec or how a viewer renders
  OME-XML; that is a product decision / unresolved area.

Plate discovery obligations (when `plate` present):

- `plate.columns` MUST list every physical column even if no wells defined
  (L530-L533); each MUST have alphanumeric, case-sensitive, non-duplicate
  `name` (L533-L536); avoid case-insensitive collisions such as `Aa`/`aA`
  (L536-L537).
- `plate.rows` with identical MUST/SHOULD rules for rows (L542-L549).
- `plate.wells` MUST list wells; each MUST have `path` exactly
  `{row}/{column}` with `/` separator and no extra leading/trailing
  directories, plus 0-based `rowIndex`/`columnIndex`; all three MUST agree
  (L552-L560).
- `plate.version` MUST be a string plate-spec version (L550-L551).
- `plate.acquisitions` MAY be present; if so each MUST have unique integer
  `id >= 0` (L518-L522); SHOULD have `name`, SHOULD have positive-integer
  `maximumfieldcount`, MAY have `description`/`starttime`/`endtime` epoch
  ints (L523-L529).
- `plate.field_count` SHOULD be a positive int max fields per view
  (L538-L539); `plate.name` SHOULD be a string (L540-L541).
- Plates may be sparse: S003's 96-well example defines all 12 columns + 8
  rows but only wells `C/5` and `D/7` (L641-L739). Listing MUST follow
  `wells[]`, not row×column expansion.
- Matching `series` metadata SHOULD also be provided for plate datasets for
  tools unaware of plate spec (L263).

Well discovery obligations:

- `well.images` MUST list all fields of view (L744-L745); each MUST have
  alphanumeric, case-sensitive, non-duplicate `path` (L745-L748).
- If multiple acquisitions were performed in the plate, each image MUST carry
  integer `acquisition` matching a plate acquisition id (L748-L750).
- `well.version` SHOULD be a string well-spec version (L751-L752).
- Examples show 4-field wells split across acquisitions 1/2 (L753-L784) and
  2-field wells across acquisitions 0/3 in a 4-acquisition plate
  (L785-L808).

Product decisions for listing/selecting (S003 does not fix UX):

- Display order for plates/wells/fields, acquisitions grouping, sparse-plate
  presentation, and whether to auto-open a single image vs. always list.
- Whether to surface `plate.name`, acquisition names/times, `field_count`
  vs. actual counts, and row/column names.
- How to expose multiple `multiscales[]` entries within one image group
  (see §3.2) alongside multiple images in a collection/plate.
- S003 only constrains one UX point here: do not silently open only the
  first image of a multi-image collection (L272).

### 3.2 Multiscale (`multiscales`) navigation — obligations

- Image metadata is under group-level `ome.multiscales` (L295); "image"
  means 2–5D image/volumetric data with optional time/channel axes in a
  multi-resolution representation (L296-L297).
- `multiscales` is a list of dicts, each one multiscale image (L298).
- Each entry MUST contain `axes` (L299); length 2–5 and MUST equal Zarr array
  dimensionality (`datasets:path` arrays) (L300).
- Each entry MUST contain `datasets`, a list describing each resolution level
  (L304).
- Each `datasets[]` MUST contain `path` to that level's array relative to
  the image group; paths MUST be ordered largest (highest resolution) to
  smallest (L305-L306).
- Each `datasets[]` MUST have same ndim, ≤5 dims, number/order MUST match
  `axes` (L307).
- Each `datasets[]` MUST contain `coordinateTransformations` mapping data to
  physical coordinates per level (L308); see §5.
- Each entry MAY contain top-level `coordinateTransformations` applied to all
  levels, applied after per-dataset transforms (L314-L316).
- Each entry SHOULD contain `name` (L317); SHOULD contain downscaling-method
  `type` (L318); SHOULD contain `metadata` dict about the method (L319).
  Example method `gaussian` with `skimage.transform.pyramid_gaussian`
  parameters (L375-L382) is informative, not an obligation to implement that
  filter.
- Multiple multiscales per group are allowed. Selection guidance is
  pseudocode, not MUST: "If only one multiscale is provided, use it.
  Otherwise, the user can choose by name, using the first multiscale as a
  fallback" (L388-L397, code L390-L397). The example chooses `name=="3D"`.
  Whether to offer a chooser, remember a default, or pick by chunk size (the
  code comment's "Or perhaps choose based on chunk size," L396) is a product
  decision.
- Pyramid-level choice "appropriate for the current view" (plan) has no
  normative algorithm in S003. Obligations are only: honor `datasets[]`
  largest→smallest order, resolve each `path` relative to the group, apply
  that level's transforms, and do not assume numeric names or uniform
  downsampling. Everything else (visible-region math, prefetch, interpolation,
  over-zoom behavior) is implementation/product choice.

### 3.3 `axes` and `dimension_names` — obligations

- `axes` is a list of dicts describing the physical coordinate space
  (L167).
- Each MUST contain unique `name` (L168).
- Each SHOULD contain `type`, SHOULD be `space`/`time`/`channel` but MAY be
  other strings for custom types not yet specified (L169).
- Each SHOULD contain `unit` from the UDUNITS-2 string lists (L170-L173);
  see §5.3.
- `axes` length MUST equal number of array dimensions (L173, L300).
- Zarr array `zarr.json` MUST include `dimension_names` and it MUST match
  `axes[].name` (L174). This is the 0.5.2 clarification (L825-L827).
- Failure modes the viewer MUST handle as "cannot display" candidates:
  missing/duplicate axis names, `axes`/array ndim mismatch,
  missing/mismatched `dimension_names`, unknown custom `type`, missing unit.

### 3.4 What the thin plan omits in Group 1 (gaps)

- No plate/well/row traversal, sparse plates, acquisitions, or field-of-view
  identity.
- No `bioformats2raw.layout` collection handling or `plate`-takes-precedence
  rule.
- No multiple-`multiscales` selection or `name`-based choice with first-entry
  fallback.
- No `ome.version` consistency check or non-`0.5`/missing-version policy.
- No `dimension_names` check.
- No arbitrary-`path` resolution or largest→smallest ordering guarantee.
- No stated behavior for empty row/well groups, extra root groups/arrays
  (which readers MAY ignore, L275), or intermediate label folders.
- No Zarr v3 codec/chunk-grid/data-type generality beyond "may be used"
  (L70-L72); large-file responsiveness cannot assume a fixed chunking.

---

## 4. Group 2 findings, part 1: channel / time / plane controls

### 4.1 Axis composition and order — obligations

- `axes` MUST contain 2 or 3 `type:space` entries and MAY contain one
  `type:time` and MAY contain one `type:channel` or null/custom-type entry
  (L301).
- Entry order MUST correspond to Zarr array dimension order; in addition,
  entries MUST be ordered by type with `time` first if present, then
  `channel`/custom if present, then `space` axes (L302). The image-layout
  section states the same order more briefly (L96-L98).
- If three spatial axes exist with two in-plane (`yx`) plus one stacking
  (`z`) anisotropic axis, they SHOULD be ordered `zyx` (L303). This is SHOULD,
  so `xyz` or other orders may occur; do not hard-code `zyx`.
- Total ndim 2–5 (L81, L96, L300, L307).
- Axis names are arbitrary (L81); the 5D example uses `t/c/z/y/x` (L329-L335)
  but names MUST NOT be used as type proxies. Type comes from `axes[].type`,
  with custom/null types allowed (L169, L301-L302).

Implied control matrix (product must derive controls from `axes`, not from
assumed `tczyx`):

- No `time` axis → no time control; single timepoint is implicit.
- No `channel`/custom axis → no channel control; single channel implicit.
- 2 spatial axes → 2D plane; 3 spatial axes → z-plane/stack control.
- Custom/null axis in channel position → unspecified display semantics;
  needs a product decision (treat as channel-like selector vs. refuse with
  explanation). S003 does not define its slider/compositing behavior.

### 4.2 `omero` channel rendering (transitional) — conditional obligations

- `omero` holds channel-specific and rendering info under group metadata
  (L398-L400). It is transitional (heading L398; transitional rules
  L60-L64) and "optional, but if present it MUST contain ... `channels`"
  (L426).
- `channels` array matches the `c` dimension size (example comment L403).
- Each `channels[]` MUST contain `color` as 6 hex digits RGB (L427) and MUST
  contain `window` dict (L428); `window` MUST contain `min`, `max`, `start`,
  `end` (L429-L430).
- Example-only keys with no stated MUST in capture: `active`, `coefficient`,
  `family`, `inverted`, `label` (L405-L410); `rdefs.defaultT`,
  `rdefs.defaultZ`, `rdefs.model` (`color`/`greyscale`) (L419-L423);
  group `id`/`name` (L401-L402). "See the OMERO WebGateway documentation for
  more information" (L424-L425), which is outside S003 scope.
- Disposition: honor `color` + `window.{min,max,start,end}` when `omero` is
  present; treat `active`/`window.start/end` as initial visibility/contrast
  hints and `rdefs.defaultT/defaultZ/model` as initial view hints unless the
  product explicitly decides otherwise. S003 does not normatively bind those
  hint keys, so a viewer that ignores them still satisfies S003 but may
  surprise users of OMERO-produced filesets. Missing `omero` requires
  product-chosen defaults (contrast, color, initial T/Z, compositing).
- `channels` length vs. actual `c` extent mismatch, malformed `color`, or
  `window.start/end` outside `min/max` are unspecified; handle as
  degraded-display or explain-and-continue by product policy.

### 4.3 Time-point and plane selection — what S003 does and does not fix

- S003 fixes index-space facts: axis order, per-level array shapes (via Zarr
  arrays), and data→physical mapping (via transforms). It does not fix:
  playback, animation, interpolation between timepoints, maximum-intensity
  projection, or how a z-slider maps to anisotropic `z` spacing.
- Initial-plane hints exist only as `rdefs.defaultT/defaultZ` in optional
  `omero` (L419-L422). Without `omero`, the initial T/Z is a product decision
  (commonly 0, but S003 does not require it).
- Per-level array extents may differ due to downsampling; the viewer needs to
  keep T/C/Z selection coherent when switching pyramid levels (same logical
  index, not same pixel offset) to remain consistent with shared `axes` plus
  per-level transforms (L304-L316). S003 does not state this coherence rule
  explicitly, and the index-clamping policy at coarse levels is implementation
  choice.

---

## 5. Group 2 findings, part 2: calibrated coordinates

### 5.1 Transformation model — obligations

- `coordinateTransformations` is a list of dicts mapping between coordinate
  spaces defined by `axes`, e.g. array data space → physical space
  (L277-L278).
- Each entry MUST contain `type` (L279); value MUST be one of the table's
  type column (L280-L281): `identity` (default, typically implicit,
  L282-L283), `translation` (L284-L286), `scale` (L287-L289).
- `translation`/`scale` carry either a float list (`translation`/`scale`) or
  binary `path` in the container; vector length defines ndim (L285-L289).
- Table header order in capture is transposed (`type/fields/description`
  appear after the rows, L290-L292); normative content is the three type
  definitions plus sequential application "in order" (L293).

Per-dataset and image-level restrictions for `multiscales` (stricter than
the general model):

- `datasets[].coordinateTransformations` MUST contain only `translation` or
  `scale` (L309).
- MUST contain exactly one `scale` specifying pixel size / time duration in
  physical units (L310).
- If scaling is unavailable/inapplicable for an axis, the value MUST express
  the scaling factor vs. the first resolution for that axis, defaulting to
  1.0 if no downsampling along it (L310).
- MAY contain exactly one `translation` for origin offset in physical units;
  if present it MUST be listed after `scale` so it is in physical
  coordinates (L311).
- `scale` and `translation` array lengths MUST equal `axes` length (L312).
- Stated rationale: simple data→physical mapping compatible with the general
  spec (L313).
- Image-level `coordinateTransformations` MAY exist, MUST follow the same
  type/order rules, and are applied after per-dataset transforms
  (L314-L315); e.g. a time scale common to all levels (L316, example
  L368-L374 with `[0.1,1.0,1.0,1.0,1.0]`).
- Worked example: 5D `t/c/z/y/x`, per-level scales `[1,1,0.5,0.5,0.5]`,
  `[1,1,1,1,1]`, `[1,1,2,2,2]` for levels 0/1/2 (L336-L366), showing
  downsampling factors 1×/2×/4× in space with `t`/`c` held at 1.0 at dataset
  level and true time scale applied once at image level.

### 5.2 Coordinate computation the viewer MUST implement

For a displayed pixel index `i_d` at level `L` on axis `d`:

1. Apply that level's dataset `scale[L][d]` (obligation, L308-L310).
2. Apply that level's dataset `translation[L][d]` if present (optional, L311).
3. Apply image-level transforms in order if present (optional, L314-L316).
4. Attach `axes[d].unit` if present (SHOULD-present, L170).

The viewer MUST NOT assume uniform downsampling, power-of-two steps,
isotropic space, origin-at-zero, or identical translations across levels.
Each level carries its own mapping. `scale` values that are relative
factors (1.0-style) vs. physical sizes are distinguished only by the L310
condition and the presence of an image-level physical scale; when neither
carries physical meaning, coordinates are in "pixels relative to level 0"
and MUST be labeled as such rather than presented as calibrated units.

Binary `path` form for scale/translation vectors (L285-L289) is allowed by
S003 but has no resolution rule in capture (relative to what group? dtype?
shape?). Support-or-decline is a product decision; declining MUST produce
the plan's understandable-feedback behavior.

### 5.3 Units — recommended, not strictly obligatory

- `unit` SHOULD be one of the UDUNITS-2 strings (L170):
  - space: angstrom, attometer, centimeter, decimeter, exameter, femtometer,
    foot, gigameter, hectometer, inch, kilometer, megameter, meter,
    micrometer, mile, millimeter, nanometer, parsec, petameter, picometer,
    terameter, yard, yoctometer, yottameter, zeptometer, zettameter (L171);
  - time: attosecond, centisecond, day, decisecond, exasecond, femtosecond,
    gigasecond, hectosecond, hour, kilosecond, megasecond, microsecond,
    millisecond, minute, nanosecond, petasecond, picosecond, second,
    terasecond, yoctosecond, yottasecond, zeptosecond, zettasecond (L172).
- No channel-axis units are listed; the 5D example omits `unit` for `c`
  (L331).
- Because this is SHOULD, unknown/missing units may occur. The details panel
  MUST show "unit unknown / not provided" rather than inventing a unit, and
  MUST NOT silently convert between units without provenance. Unit conversion
  (e.g. nm→µm) is a product decision; S003 does not specify display
  precision, rounding, or axis-label formatting.

### 5.4 Details-panel requirements derived from S003

To satisfy "dimensions, units and coordinates" honestly, the panel needs at
minimum: `axes[]` names/types/units, per-axis array extent at current level,
`dimension_names` match status, active level `path` and its scale/translation
vectors, image-level transforms if any, and the computed physical position of
the cursor/plane. S003 does not name the panel or its layout; completeness
here is a product choice constrained by the no-fabrication rule above.

---

## 6. Group 2 findings, part 3: label overlays

### 6.1 Label storage — obligations

- Label pixel data lives in a group called `labels` nested within the image
  group "at the same level ... as the resolution levels for the original
  image" (L437; layout L102-L117).
- The `labels` group "is not itself an image; it contains images" (L437-L438).
- Label pixels MUST be integer dtypes in
  `[uint8,int8,uint16,int16,uint32,int32,uint64,int64]` (L438-L439); pyramid
  levels support "only integer values" (L116-L117).
- Label images share the parent's coordinate system, "usually having the same
  dimensions and coordinate transformations" (L432-L433). Each label dim
  SHOULD be "either the same as the corresponding dimension of the image, or
  1 if that dimension ... is irrelevant" (L106-L108; note SHOULD-form
  "should be" in the layout section vs. the stricter multiscales rules that
  still apply to each label image, L454-L455).
- Intermediate groups between `labels/` and label images are allowed, but
  "MUST NOT contain metadata" (L439-L440); layout section says they are
  "permitted but not necessary and currently contain no extra metadata"
  (L110). Names of label images are arbitrary (L440).
- `labels/zarr.json` MUST contain `ome.labels`, an array of paths to the
  labeled multiscale image(s); all label images SHOULD be listed (L441-L442).
  Example: `{"labels":["cell_space_segmentation"]}` (L443-L453); layout
  example: `{"labels":["original/0"]}` (L104-L105).

### 6.2 Label image metadata — obligations

- Each label image's `zarr.json` MUST implement the multiscales spec
  (L454).
- Its `datasets[]` MUST have the same number of entries (scale levels) as
  the parent image (L454-L455). Per-level shapes/paths/transforms follow
  §3.2–§5.1; alignment across levels MUST use the label's own transforms,
  not an assumption that they equal the parent's.
- `ome.image-label` SHOULD also be present (L456-L457); it stores display
  colors, source image, and optional properties (L457-L458).
- `image-label` SHOULD contain `colors` and `version`: `colors` MUST be an
  array describing unique label values; `version` MUST be a string
  image-label schema version (L458-L460).
- Readers SHOULD display labels using `colors[]` (L461). Each entry MUST
  contain integer `label-value` (L462-L463); MAY contain `rgba` as four ints
  0–255 (RGB + alpha/opacity) (L463-L466). "Additional keys under colors are
  allowed" (L466). Example: 0→`[0,0,128,128]`, 1→`[0,128,0,128]`, described
  as 50% blue/green at 50% opacity (L483-L492, L513-L514).
- `image-label` MAY contain `properties` and `source` (L467).
  `properties` MUST be an array of objects each MUST have integer
  `label-value` plus arbitrary extra key-values; entries need not share keys
  (L468-L471). Example adds `area (pixels)`, `class`, `cell type`
  (L493-L505).
- `source` value MUST be an object; it MAY include `image` as a string
  relative path to the parent image group; default is `../../` for the
  normal `labels/` nesting (L472-L474). Example `"image":"../../"`
  (L506-L508).

### 6.3 Overlay behavior — recommended vs. product decision

- Conformant overlay MUST: honor `ome.labels` paths (MUST-exist, L441) and
  resolve each label level through that label image's own `multiscales`
  (L454); enforce integer dtype (L438-L439) and equal level counts (L455);
  map label indices to physical space with the label's own transforms before
  compositing. Directory guessing alone is insufficient because listing is
  SHOULD-exhaustive (L442), so unlisted-but-present labels are possible.
- Conformant overlay SHOULD: use `colors[]/rgba` when present (L461).
- Product decisions (S003 silent): overlay toggle/opacity UI, handling of
  label values missing from `colors[]`, blending when parent has no `omero`
  colors, whether to show `properties[]` in UI, how to expose multiple label
  images (`original/0` vs. named siblings), resampling rule for label data
  on zoom (nearest-neighbor is image-segmentation convention but unstated in
  S003 — do not claim it as obligation), and behavior when label dims are 1
  along `t`/`c`/`z` (broadcast vs. per-plane).
- Dimension mismatch beyond the §6.1 SHOULD (e.g. label cropped or padded
  vs. parent) is unspecified; refuse-with-explanation vs. best-effort
  alignment is a product choice.

---

## 7. Thin-plan disposition (Viewer.md sentence by sentence)

Viewer.md is a deliberately thin synthetic fixture, "not a ... specification-
completeness claim" (Viewer.md:3). Disposition uses S003 only.

1. "Opens a local OME-Zarr 0.5 fileset and lists the images it finds"
   (Viewer.md:5) — **Partially specified; gaps material.** S003 supports
   single-image, plate/row/well, and `bioformats2raw` collection discovery
   with distinct traversal rules (§3.1). The plan names none of them. Action:
   implement all three traversals, sparse-plate handling, `plate`-precedence,
   `series`/numbered-group fallback, multi-`multiscales` listing, and the
   >1-image awareness rule (L272). Fileset-open failure taxonomy must include
   missing/inconsistent `ome.version`, missing `multiscales`, bad
   `plate`/`well` links, and non-image entry points.
2. "Selecting an image opens a canvas with pan and zoom" (Viewer.md:5) —
   **Product/implementation choice; no S003 algorithm.** S003 constrains only
   level ordering, relative paths, and per-level transforms (§3.2, §5.1).
   Pan/zoom math, interpolation, tile prefetch, and over-zoom are unspecified.
3. "Channel visibility controls" (Viewer.md:5-6) — **Under-specified.**
   Derive channel existence from `axes` (§4.1); honor `omero.channels`
   `color`+`window` when present (§4.2); choose defaults when absent. Custom/
   null channel-position axes need an explicit product rule.
4. "Time-point and plane selection where relevant" (Viewer.md:6) —
   **Under-specified but derivable.** Relevance = presence of `time` axis /
   3rd spatial axis (§4.1). Initial T/Z defaults to `rdefs` hints only when
   `omero` exists; otherwise product-chosen. Keep selection coherent across
   pyramid levels.
5. "Optional overlays for associated label images" (Viewer.md:6) —
   **Under-specified.** Implement §6 discovery, integer/level-count checks,
   per-level label transforms, and SHOULD-honor `colors/rgba`. Overlay UI,
   unlisted labels, missing-`image-label`, missing-`rgba`, and dim-1
   broadcast are product decisions.
6. "Details panel shows dimensions, units and coordinates" (Viewer.md:6) —
   **Under-specified.** Minimum honest content is §5.4. Never fabricate units
   or physical sizes when S003 allows them to be missing/relative (§5.2–§5.3).
7. "Chooses an available pyramid level appropriate for the current view"
   (Viewer.md:6) — **Product algorithm over S003 ordering.** MUST respect
   largest→smallest `datasets[]` order and per-level transforms; selection
   heuristic itself is unspecified.
8. "Large image reads run in the background ... remains responsive" +
   "Changing the selected view cancels work no longer needed" (Viewer.md:7) —
   **No S003 basis; pure implementation requirement.** S003 says nothing about
   threads, cancellation, chunk scheduling, or caching. Brief's "large saved
   datasets" responsiveness must be validated against Zarr v3 generality
   (§2.1), not a fixed chunk assumption.
9. "Opening failures explain which image or data could not be displayed and
   allow the user to choose another item" (Viewer.md:7-8) — **Consistent with
   S003 reader guidance** (L272-L275) but message taxonomy is product work.
   S003 never defines error strings. Every MUST/SHOULD violation in
   §3–§6 needs a mapped message (see §8).
10. "Interoperate with filesets from real OME-Zarr 0.5 tools" (Viewer.md:9) —
    **Unverifiable from S003 alone.** S003's implementation pointer is only
    "See Tools" (L814) with no captured tool behaviors. Under S003-only scope
    this acceptance goal is aspirational; conformance can only be claimed
    against S003 text, not against wild filesets.
11. "Source files remain unchanged; display settings are local to the viewing
    session" (Viewer.md:9) — **Consistent.** S003 transitional write optionality
    (L60-L64) and read-only brief boundary support never writing into the
    fileset. Session-local settings have no S003 representation; do not persist
    them as new `ome` keys.
12. "Image editing, export, remote storage and automated ... interpretation
    are outside this plan" + "Additional capability choices require explicit
    review" (Viewer.md:9) — **Consistent.** Remote layouts are conforming but
    correctly declined per product boundary (§2.1). Cap-gating should at least
    cover: custom axes, binary-`path` transforms, missing-`omero` rendering,
    missing-`image-label`, unlisted labels, mixed-version hierarchies.
13. "Acceptance uses representative filesets ... calibrated coordinate display
    and aligned label overlays. A large dataset must not freeze interaction.
    Malformed or unavailable input must produce understandable feedback rather
    than a crash" (Viewer.md:11) — **Testable only with fixtures outside S003.**
    S003 supplies the oracle for coordinates/alignment but no fixtures, no
    performance budget, and no crash-freedom oracle beyond the reader MAY/SHOULD
    guidance. All proposed acceptance checks below are UNEXECUTED.

---

## 8. Unsupported-input limitations (must explain, not display)

Per the brief/plan "clearly explain data it cannot display" requirement, the
viewer should treat the following as expected "cannot display" cases with
targeted messages, because S003 either forbids them, allows writers to emit
them optionally, or leaves them undefined. S003 itself defines no message
taxonomy. None implies a crash.

- Non-Zarr-v3 or unreadable Zarr (`zarr.json` missing/invalid); S003 mandates
  Zarr v3 (L68-L69) but defines no viewer fallback.
- Missing `ome` namespace or `ome.version`; inconsistent `ome.version` within
  one hierarchy (violates L156); `version != "0.5"` (only 0.5 released,
  L25-L26; editor's drafts unsupported, L27).
- JSON with `//` comments (MUST NOT exist, L65-L66) — strict parsers will
  reject files that copied S003 examples literally.
- Image group without `multiscales`, or `multiscales[]` empty.
- `axes` violations: missing/duplicated `name` (L168), length ≠ array ndim
  (L173/L300), ndim outside 2–5 (L300), zero/one/>3 space axes or >1 time or
  >1 channel-position axis (L301), or type order violating
  time→channel→space (L302).
- Missing `dimension_names` or mismatch with `axes[].name` (L174 / L825-L827).
- `datasets[]` violations: missing/empty, missing `path` (L305), assumed order
  violated (MUST be largest→smallest, L306), ndim mismatch or >5D (L307),
  missing `coordinateTransformations` (L308), non-scale/translation types
  (L309), missing/multiple `scale` (L310), mistranslation order (L311), vector
  length ≠ `axes` length (L312).
- Binary-`path` scale/translation vectors (allowed, L285-L289) if the product
  declines to implement path resolution (no resolution rule in S003).
- `bioformats2raw.layout` value other than 3 (L256), mixed plate+collection
  beyond the precedence rule (L204-L206), `series` paths dangling or order
  mismatching OME-XML (L266-L267), numbered groups non-consecutive (L268-L269).
- Missing `OME/METADATA.ome.xml` when needed for Image identity (SHOULD exist,
  L257); OME-XML using forbidden `<BinData/>`/`<BinaryOnly/>`/`<TiffData/>`
  (L259); minimum-spec OME-XML the viewer cannot interpret (L260).
- Plate/well violations: incomplete row/column lists (L530-L545), illegal or
  duplicate names (L533-L547), missing `plate.version` (L550), well `path`
  not exactly `{row}/{col}` or indices disagreeing (L552-L560), missing
  `well.images[]` (L744), illegal/duplicate field paths (L745-L748), missing
  or dangling `acquisition` when multiple acquisitions exist (L748-L750).
- Empty row/well groups (SHOULD NOT present but MAY exist, L128-L129) — list
  as empty, not as error, unless traversal metadata is missing.
- Extra root groups/arrays the reader MAY ignore (L275) — ignoring is allowed,
  but silently hiding user data needs UX care.
- Custom/null axis types (allowed, L169/L301) and unknown `ome` keys — no
  rendering rule; needs decline-or-genericize decision.
- Unknown/missing `unit` (SHOULD-provided, L170) and channel axes without units
  (L331 example) — show uncalibrated/relative coordinates, never invented units.
- Relative-only scales (1.0 factors, L310) with no physical image-level scale
  (L314-L316) — label as pixels/relative, not physical.
- Missing `omero` (optional, L426) — product defaults required; malformed
  `omero` (missing `channels`/`color`/`window`/`min`/`max`/`start`/`end`,
  L426-L430) or `channels` length ≠ `c` extent — degraded rendering message.
- Unknown `rdefs.model` beyond `color`/`greyscale` (L419-L423), unknown
  `family`/`coefficient`/`inverted` semantics (L404-L410; only WebGateway docs
  define them, L424-L425, outside scope).
- Labels: missing `ome.labels` (MUST, L441), unlisted label images (SHOULD-listed,
  L442), non-integer label dtype (MUST integer, L438-L439), level-count mismatch
  with parent (MUST equal, L455), label `multiscales` violations (same list as
  images), metadata in intermediate folders (MUST NOT, L439-L440).
- Missing `image-label` (SHOULD, L456), missing `colors`/`version` when the
  object claims them (MUST when those keys used, L458-L460), missing
  `label-value` (L462/L469), `rgba` outside 0–255 or wrong length (L463-L466),
  label values absent from `colors[]`/`properties[]`, unknown `source.image`
  targets (L472-L474).
- Zarr v3 codec/chunk-grid/transformer combinations the local reader cannot
  decode (allowed by L70-L72); remote-only (HTTP/S3/GCS) layouts (conforming
  per L73-L77 but outside local-only boundary); filesets exceeding memory/time
  budgets (no S003 budget exists).
- Multi-word-key style drift: S003 says camelCase "should" be used but admits
  legacy keys predate it (L809-L812, e.g. `field_count`, `rowIndex`,
  `columnIndex`, `label-value`). Do not normalize keys; match exact spellings.

---

## 9. Counterevidence and uncertainty

### 9.1 Counterevidence to thin-plan assumptions (all from S003)

- "One fileset = one image": refuted by plate/row/well nesting (L118-L148),
  `bioformats2raw` multi-image collections (L175-L191), and readers SHOULD NOT
  open only the first image (L272).
- "Levels are `0..n`": refuted; names are arbitrary, order comes from
  `datasets[].path` largest→smallest (L93-L94, L305-L306).
- "Axes are always `tczyx`": refuted; 2–5 dims (L81/L300), arbitrary names
  (L81), custom/null types allowed (L169/L301), order constrained by type not
  name (L302), `zyx` only SHOULD (L303).
- "Downsampling is uniform / power-of-two": refuted; each level has its own
  scale vector (L308-L312), example shows per-axis factors (L336-L366).
- "Origin is zero / translation absent": refuted; optional per-level + global
  translations in physical units (L311, L314-L316).
- "Units always present and metric": refuted; units are SHOULD from a fixed
  list including imperial/astronomical units (L170-L172), channel unit absent
  in example (L331).
- "`omero` always present": refuted; optional (L426). Rendering without it is
  product-defined.
- "Labels parallel the parent exactly": partly refuted; same count of levels
  MUST hold (L455) but label dims MAY be 1 where irrelevant (L106-L108),
  transforms are per-image (L454), and `image-label` is SHOULD (L456).
- "Plates are dense grids": refuted by sparse-plate example (L641-L739) and
  row/column-vs-wells separation (L530-L560).
- "Discovery can ignore acquisitions": refuted when multiple acquisitions
  exist; `well.images[].acquisition` MUST match plate ids (L748-L750).

### 9.2 Uncertainty from missing normative detail (S003-silent)

- Level-selection algorithm, tile/chunk scheduling, interpolation, blending,
  compositing order, and cancellation semantics: unspecified.
- Error-message taxonomy and severity mapping: unspecified.
- OME-XML minimum spec, `<MetadataOnly/>` interpretation, and Bio-Formats
  ordering beyond "strict, stable" (L177-L178): unspecified in capture.
- `bioformats2raw.layout` replacement spec: explicitly future work (L180-L181).
- Binary-`path` vector encoding/resolution (L285-L289): allowed but undefined.
- `dimension_names` location nuance ("in the zarr.json of the Zarr array,"
  L174) vs. group metadata: no conflict stated, but array-vs-group placement
  must be implemented exactly as written.
- `plate.version` / `well.version` / `image-label.version` values: required
  strings (L460, L550-L551, L751-L752) but no version literals given in S003.
- `multiscales[].type`/`metadata` downscaling semantics: SHOULD-provided
  (L318-L319) with one `gaussian`/`skimage` example (L375-L382); no registry
  of legal `type` values.
- `properties[]` arbitrary keys (L468-L471) and extra `colors[]` keys (L466):
  display-or-ignore is product choice.

### 9.3 Non-normative vs. normative boundaries

- Layout diagrams, JSON samples, and "for example" blocks are informative
  (L877-L883); only the surrounding MUST/SHOULD/MAY sentences bind.
  In particular, `t/c/z/y/x` names, `0/1/2` paths, `../../` source default,
  `50%` color prose, and the `name=="3D"` chooser are examples, not mandates.
- The `bioformats2raw` plate JSON at L207-L242 omits `plate.version` (required
  by L550-L551) and uses `field_count`/`rows`/`columns`/`wells`/`acquisitions`
  shapes that otherwise match §2.7; treat the omission as example
  incompleteness, not as evidence that `version` is optional.

### 9.4 Capture-internal inconsistencies / ambiguities (preserved, not resolved)

- `bioformats2raw.layout` value is JSON `3` (number) in examples (L200, L213)
  but quoted `"3"` (string) in the conformance sentence "MUST have the value
  "3"" (L256). A strict reader must decide whether to accept number, string,
  or both; S003 does not resolve it. Recommendation is a product decision to
  accept both on read while writing nothing (read-only product).
- `coordinateTransformations` table rows (L282-L289) precede their header
  (L290-L292) in capture order; no semantic conflict, only reading order.
- "All labels will be listed in zarr.json e.g. ..." (L104-L105) vs. "All label
  images SHOULD be listed" (L442): the MUST is only that `ome.labels` exist as
  an array of paths (L441); exhaustiveness is SHOULD. Unlisted labels are
  therefore possible.
- "Each dimension of the label should be either the same ... or 1" (L106-L108,
  SHOULD-form) coexists with "usually having the same dimensions" (L432-L433)
  and the MUST that each label image implement multiscales (L454). Exact-match
  enforcement would exceed S003; broadcast-or-refuse for dim-1 axes is product
  policy.

---

## 10. Unresolved areas (whole brief)

1. Real-tool interoperability matrix: S003 points only to "Tools" (L814) with
   no captured behaviors. Wild-fileset compatibility, version drift (0.4 vs.
   0.5, Zarr v2 vs. v3), and converter quirks (`bioformats2raw`, transitional
   `omero`) cannot be resolved from S003 alone.
2. Zarr v3 read substrate: codecs, chunk grids/key encodings, transformers,
   and `dimension_names`/dtype handling are delegated to the Zarr spec
   (L68-L72, L99-L100, L174), which is not in capture. A conformant reader
   still depends on a correct Zarr v3 implementation plus its own limits.
3. OME-XML / OME-TIFF / WebGateway / UDUNITS-2 semantics beyond S003's
   citations: unresolved within this source scope.
4. Performance acceptance ("large saved datasets," "must not freeze"):
   no S003 budget, fixture, or profiling oracle. Requires product-owned
   fixtures and budgets.
5. Accessibility, color-vision safety of `omero`/`rgba` defaults, and print/
   export-free guarantees: outside S003; product decisions.
6. Security/safety of local reads (symlinks, path traversal via `path`/
   `series`/`labels` strings, huge-chunk decompression, XML parsing): S003
   imposes path-shape rules (L305, L552-L560, L745-L748) but no hardening
   requirements. Needs product-owned threat handling consistent with
   read-only, no-external-write boundaries.
7. Anything the brief calls "clearly explain data it cannot display" beyond
   S003's one UX rule (L272) and MAY-ignore/MAY-choose allowances
   (L273-L275): message wording, grouping, persistence, and telemetry are
   product decisions.

---

## 11. Proposed validation — ALL UNEXECUTED

No checks below were run. They are proposed only. Each maps to S003
obligations and thin-plan gaps.

- V1 (UNEXECUTED): Schema-shape fixtures for single image, HCS plate
  (dense + sparse from L561-L739), `bioformats2raw` collection with
  `series` and with numbered-group fallback, and multi-`multiscales` group;
  assert discovery paths, `plate`-precedence, >1-image awareness, and
  fallback-to-first-multiscale behavior.
- V2 (UNEXECUTED): Negative fixtures for every §8 violation class; assert
  targeted "which image or data" messages and offer-another-item recovery,
  never a crash. Include `"3"` vs. `3` layout values and `//`-comment JSON.
- V3 (UNEXECUTED): Coordinate oracle fixtures using S003's 5D example scales
  (L336-L374): assert per-level data→physical math with and without
  image-level transforms, translation-after-scale ordering, relative-1.0
  labeling, and unit display/unknown-unit handling.
- V4 (UNEXECUTED): Channel/time/plane matrix over 2D, 2D+t, 2D+c, 3D, 3D+t+c,
  custom-axis, missing-`omero`, and malformed-`omero` fixtures; assert control
  derivation, `color`+`window` honoring, `rdefs` initial-view hints, and
  coherent T/C/Z across levels.
- V5 (UNEXECUTED): Label fixtures covering `labels[]` discovery, integer-dtype
  enforcement, level-count equality, intermediate folders, missing/unlisted
  labels, missing `image-label`/`rgba`, dim-1 broadcast, and `source.image`
  default-vs-explicit; assert alignment via label transforms and SHOULD-use of
  `colors/rgba`.
- V6 (UNEXECUTED): Large-dataset responsiveness probe with Zarr v3 chunk/codec
  variety; assert background reads, stale-work cancellation, and no UI freeze.
  Requires product-owned budget/fixtures; S003 provides no oracle.
- V7 (UNEXECUTED): Read-only guarantee probe: open every fixture, attempt all
  view operations, assert fileset bytes unchanged and settings kept
  session-local.

---

## 12. Source locator index (principal claims)

- Released 0.5; drafts unsupported; migrations promised: L25-L27.
- RFC 2119 keywords; transitional read/write; no JSON comments: L57-L66.
- Zarr v3; all Zarr features allowed unless disallowed: L68-L72.
- Local vs. HTTP/S3/GCS equivalence: L73-L77.
- Image layout; 2–5 dims; arbitrary axis names: L78-L81.
- Group `zarr.json` multiscales+omero; levels as arrays; arbitrary names
  ordered by metadata: L87-L94.
- ≤5D; time→channel→space; Zarr chunk conformance: L96-L100.
- Labels container, `labels[]` example, dim-same-or-1: L102-L108.
- Intermediate label folders; label multiscale + `image-label`; integer-only
  levels: L110-L117.
- HCS three-group MUSTs; row/well SHOULD NOT when empty: L120-L129.
- Plate/row/well/field/label example tree: L132-L148.
- `ome` namespace; string `version`; consistency MUST: L149-L164.
- `axes` names MUST unique; types SHOULD + custom MAY; units SHOULD lists;
  length MUST equal ndim; `dimension_names` MUST match: L166-L174.
- `bioformats2raw.layout` transitional rationale; layout; top-level key;
  plate precedence; `series` example: L175-L253.
- Layout value MUST; OME-XML SHOULD/MUST/MAY; discovery logic; reader
  SHOULD/MAY rules: L254-L275.
- Transform list; MUST `type`; identity/translation/scale; sequential order:
  L276-L293.
- `multiscales` list; MUST `axes`/`datasets`; composition/order rules; `zyx`
  SHOULD; path + largest→smallest MUSTs; ndim MUSTs; per-level + global
  transform MUST/MAY rules; SHOULD `name`/`type`/`metadata`; 5D example;
  multi-entry selection fallback: L294-L397.
- `omero` transitional; example channels/`rdefs`; optional-but-MUST
  `channels`/`color`/`window`/`min`/`max`/`start`/`end`: L398-L430.
- Label same-coordinate/integer semantics; nesting; dtype MUST; intermediate
  MUST NOT metadata; `labels[]` MUST + SHOULD-listed; multiscales + level-count
  MUSTs; `image-label` SHOULD with MUST `colors`/`version`; SHOULD-display +
  MUST `label-value` + MAY `rgba`; MAY `properties`/`source` rules; worked
  color example: L431-L514.
- Plate acquisitions/columns/`field_count`/name/rows/`version`/wells MUST/
  SHOULD/MAY rules; dense + sparse examples: L515-L739.
- Well `images[]` MUSTs; acquisition linkage; SHOULD `version`; examples:
  L740-L808.
- camelCase SHOULD + legacy note: L809-L812.
- Implementations pointer; citing; full version history incl. Zarr v3,
  `omero`, `dimension_names` changes: L813-L866.
- Conformance; lowercase readability; normative-vs-example/note boundary:
  L867-L888.

---

*End of report. Evidence: S003 only. Validation: UNEXECUTED. Product decisions
above are explicitly marked and require review per Viewer.md:9.*
