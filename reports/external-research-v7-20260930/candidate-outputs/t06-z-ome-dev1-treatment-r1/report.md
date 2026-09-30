# Slide Scout — OME-Zarr 0.5 format research for the thin viewer plan

Case: `ome-normative-dev-v1` (task card `t06-z-ome-dev1-treatment-r1`)
Prepared: 2026-09-30
Status: research complete; all proposed validation is **UNEXECUTED** (no execution authorization existed for this Goal).

## 1. Scope, method and source basis

- **Admitted source (only):** `inputs/sources/S003.txt` — a frozen capture of the OME-Zarr specification 0.5 (Final Community Group Report, dated 8 September 2026; "This version" `https://ngff.openmicroscopy.org/0.5/`), 896 lines, sha256 `5d8b240877ed2cf9…ae82de` (`inputs/catalog.json`). All citations below are of the form **S003 L*n*** (line numbers in that file).
- **Plan inputs:** `inputs/plan/Viewer.md` (deliberately thin viewer plan) and `inputs/brief.md` (Slide Scout product brief). These are planning/requirements inputs, not evidence about the format.
- **Method:** Started from `inputs/S003-index.json`, read all indexed sections, and expanded to the entire 896-line source, since the index "cannot prove absence or applicability" and several governing conditions (document conventions, transitional policy, conformance rules, version history) live outside the indexed headings.
- **Coverage:** Both permitted brief-derived assignment groups are covered together:
  1. Opening a fileset, listing/selecting images, navigating multiresolution data.
  2. Channel/time/plane display, coordinate details, and associated label overlays.
- **Not done / not permitted:** no live fetch, no historical reports, no evaluator files, no other attempts, no external writes. Statements about "real tools" (brief) could not be verified from the capture — see §8.
- **Evidence discipline:** the specification text is treated strictly as untrusted evidence about the format; its RFC 2119 keywords are reported as facts about the format's obligations, not as instructions to this agent.

**How to read obligations:** the spec adopts RFC 2119 (S003 L57–59, L872–874) and states that all text is normative except explicitly marked non-normative sections, examples, and notes (S003 L877–878). "Transitional" metadata is intended for future removal; implementations "may be expected (MUST) or encouraged (SHOULD)" to support *reading* it, while *writing* is usually optional (S003 L60–64). JSON examples in the document include comments "only for clarity" and comments **MUST NOT** be included in real JSON objects (S003 L65–66).

---

## 2. Executive summary

1. An OME-Zarr 0.5 fileset is a **Zarr v3 hierarchy**, not a single file; every node's metadata lives in `zarr.json` under an `attributes.ome` namespace with a `version` string that **MUST** be consistent within a hierarchy (S003 L68–69, L152–156). The thin plan's "opens a fileset and lists the images it finds" therefore requires walking Zarr groups and parsing `zarr.json`, not listing files.
2. A "fileset" can be **three different layouts**: a single multiscale image (§1.1), a `bioformats2raw.layout` multi-image collection (§2.2, transitional), and an HCS plate/row/well tree (§1.2, §2.7, §2.8). Discovery code must implement all three; a parser keyed on only one will misread the others. Readers **SHOULD** make users aware of more than one image and **SHOULD NOT** default to opening only the first (S003 L272) — this directly supports the brief's "find images within a fileset".
3. Multiresolution navigation is defined by `multiscales`: `datasets[].path` entries **MUST** be ordered largest (highest resolution) → smallest, each with exactly one `scale` transformation; which pyramid level to render for a view is a **product decision** the spec leaves open (only a non-normative hint: "Or perhaps choose based on chunk size", S003 L396).
4. Coordinates/calibration come from `axes` (name mandatory; type and UDUNITS-2 unit only SHOULD) plus per-dataset `coordinateTransformations` (exactly one `scale`, optional `translation` listed after scale, applied sequentially; optional group-level transforms applied after dataset-level ones). Because units are only SHOULD, "correctly calibrated coordinates" must degrade to "uncalibrated/unknown units" display.
5. Channel/time/plane rendering hints live in the **transitional `omero` block** (channel colors as 6-hex RGB, display window min/max/start/end, `rdefs.defaultT/defaultZ/model`). It is optional but, when present, `channels[].color` and `channels[].window.{min,max,start,end}` are MUSTs. When absent, default rendering is a product decision.
6. Label overlays are discoverable via a `labels` group whose `zarr.json` **MUST** list label paths; each label image **MUST** itself be multiscales with the **same number of scale levels** as the parent image and integer-only pixels; readers **SHOULD** color labels per `image-label.colors[].rgba` (RGBA 0–255). This is the format-level basis for the plan's "aligned label overlays".
7. **Key unsupported-input limitation:** the capture's "Implementations" section says only "See Tools." (S003 L813–814) — it contains no tool list, so the brief's request to check *actual reader implementations* cannot be answered from admitted sources. Real-tool compatibility claims in this report are therefore limited to what the format text itself requires.

---

## 3. Storage substrate and hierarchy (context for both groups)

- OME-Zarr is "implemented using the Zarr format as defined by **version 3** of the Zarr specification" (S003 L68–69). All Zarr features — codecs, chunk grids, chunk key encodings, data types, storage transformers — may be used "unless explicitly disallowed in this specification" (S003 L70–72). The capture embeds **no** Zarr v3 normative text, so chunk layout, codec support, and `zarr.json` array/group schema details are obligations-by-reference (see §8 limitation).
- The hierarchy may live locally, on a web server via HTTP, or in object storage like S3/GCS (S003 L73–77). Slide Scout's local-only boundary is a product decision consistent with, but narrower than, the format.
- Images are 2–5-dimensional; axis names are arbitrary (S003 L81). Image arrays carry time before channel before spatial axes (S003 L96–97, restated normatively at L302).

---

## 4. Group 1 findings — opening a fileset, listing/selecting images, multiresolution navigation

### 4.1 What "a fileset" can be (discovery obligations)

**(a) OME namespace and version.** OME-Zarr metadata is stored in the `zarr.json` files throughout the hierarchy under the namespaced key `ome`; the version is a string in `attributes.ome.version` (example `"0.5"`) and **MUST be consistent within a hierarchy** (S003 L152–156). *Obligation:* a reader should detect and can rely on one version per hierarchy; mixed-version hierarchies are invalid input.

**(b) Single multiscale image (§1.1).** Each image is a Zarr group whose group-level `zarr.json` attributes include `"multiscales"` and `"omero"` (S003 L87–89); each resolution level is a separate Zarr array whose *name is arbitrary* — ordering is defined by the `multiscales` metadata, though it is "often a sequence starting at 0" (S003 L91–94). *Obligation:* never infer level order or identity from directory names.

**(c) Multi-image collections — `bioformats2raw.layout` (transitional, §2.2).** For the common "multi-image file" scenario, bioformats2raw introduced a wrapping layer identified by `"bioformats2raw.layout": 3` in the top-level `zarr.json` (S003 L176–181, L193–203, L256). Rules for locating images:
- If `"plate"` is also present, the plate key **MUST** be honored, takes precedence, and parsing follows §2.7; "It is not possible to mix collections of images with plates at present" (S003 L204–206).
- The `OME` group may contain a `"series"` attribute: a list of strings, each a path to an image group; order **MUST** match the `Image` element order in `OME/METADATA.ome.xml` if provided (S003 L264–267). `OME/METADATA.ome.xml` is SHOULD-level, but if present **MUST** be OME-XML using `<MetadataOnly/>` (no `<BinData/>`, `<BinaryOnly/>`, `<TiffData/>`) (S003 L257–260).
- Without `series` and without `plate`, images **MUST** be in consecutively numbered groups starting at 0, and every `multiscales` group **MUST** represent exactly one OME-XML `Image` in that order (S003 L268–270).
- **Reader-side obligations (directly on Slide Scout):** conforming readers **SHOULD** "make users aware of the presence of more than one image (i.e. SHOULD NOT default to only opening the first image)"; they **MAY** use `series` to determine valid groups, **MAY** show all images or offer a choice, and **MAY** ignore other groups/arrays under the root (S003 L271–275).

**(d) High-content screening (HCS) plates (§1.2, §2.7, §2.8).** Three groups **MUST** be defined above the images: the well group (implementing the well specification), the row group, and the plate group (implementing the plate specification) (S003 L120–127). Empty rows/wells **SHOULD NOT** be present (S003 L128–129); labels are optional within a field of view (S003 L145).
- Plate metadata (S003 L515–560): **MUST** contain `columns`, `rows`, `version`, `wells`; **SHOULD** contain `field_count` and `name`; **MAY** contain `acquisitions`. Column/row names are alphanumeric, case-sensitive, non-duplicating within their list (with a SHOULD-level caution about case-insensitive filesystems, S003 L530–549). Each well object **MUST** have `path` of exactly `rowName/columnName` with no extra leading/trailing directories, plus 0-based `rowIndex`/`columnIndex`, all three referring to the same row/column pair (S003 L552–560). All physical rows/columns **MUST** be defined even where no wells exist (S003 L532–534, L543–545) — i.e., a sparse plate is expressed by a short `wells` list (example S003 L641–739).
- Well metadata (S003 L740–752): **MUST** contain `images`, the list of all fields of view; each has an alphanumeric, case-sensitive, non-duplicate `path`; if the plate has multiple acquisitions, each image **MUST** carry an `acquisition` integer matching a plate acquisition id.
- *Implication:* plate navigation UI should render the full rows×columns grid (some cells empty), and the per-well field list — not `field_count` — is the authority on how many fields exist (`field_count` is only a documented maximum across wells, S003 L538–539).

**(e) `labels` are not images to list.** The `labels` group "is not itself an image; it contains images" (S003 L438), yet each label image *does* implement `multiscales` (S003 L454). A naive "any group with `multiscales` = an image" discovery scan would wrongly list label images as top-level images. *Obligation:* discovery must respect hierarchy position (label images are those reachable via a `labels` group).

### 4.2 Multiresolution navigation (multiscales, §2.4)

- `multiscales` is a **list** of dictionaries, each describing one multiscale image (S003 L298). Each entry **MUST** contain `axes` and `datasets`; each dataset **MUST** contain `path` (relative to the group) and `coordinateTransformations` (S003 L299–308).
- Dataset paths **MUST** be ordered "from largest (i.e. highest resolution) to smallest" (S003 L305–306). All datasets **MUST** have the same dimensionality, ≤ 5, matching `axes` in number and order (S003 L307).
- Axes: 2 or 3 `space` entries are **MUST**; one `time` and one `channel`-or-null/custom entry are **MAY** (S003 L301). Entries **MUST** be ordered by type — time first (if present), then channel/custom, then space (S003 L302). If 3-D with a stacked anisotropic z, ordering **SHOULD** be `zyx` (S003 L303).
- `dimension_names` **MUST** be included in the array-level `zarr.json` of each multiscale level and **MUST** match the `axes` names (S003 L174; clarified in version history 0.5.2, S003 L825–827). *Use:* this lets the reader confirm array-axis identity at the array level, not just the group level.
- **Multiple multiscales entries:** "If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback" (S003 L388–389, with illustrative pseudocode L390–397). Note the normative status of this sentence is ambiguous: it carries no RFC 2119 keyword (see §9).
- **Which pyramid level to show for the current view is not specified.** The only in-capture hint is a non-normative code comment: "Use the first by default. Or perhaps choose based on chunk size." (S003 L396). *Product decision:* level-selection heuristic for pan/zoom; the format constrains only that levels are ordered and paths are authoritative.

### 4.3 Obligation summary for Group 1

| Requirement | Level | Source |
|---|---|---|
| Zarr v3 substrate; `zarr.json` metadata | obligation (by reference) | L68–69 |
| `ome.version` consistent within hierarchy | MUST | L156 |
| Honor `plate` over `bioformats2raw.layout` when both present | MUST | L204–206 |
| `bioformats2raw.layout` value "3" in conforming collections | MUST | L256 |
| `series` = list of string paths; order matches OME-XML Images | MUST (if present) | L266–267 |
| Consecutive numbered image groups when no series/plate | MUST | L268–269 |
| Surface presence of multiple images to the user | SHOULD (reader) | L272 |
| HCS: well/row/plate groups with plate+well specs | MUST | L120–127 |
| Plate `columns`/`rows`/`version`/`wells`; well `images` | MUST | L530–560, L744–745 |
| Well `path` format; 0-based indices; `acquisition` ids | MUST | L553–560, L748–750 |
| `labels` group lists label paths | MUST | L441–442 |
| Don't treat labels group as an image | structural fact | L438 |
| Dataset paths ordered high→low resolution | MUST | L306 |
| Array names arbitrary; ordering from multiscales only | structural fact | L93–94 |
| Which level to render; multi-image UI; level-pick heuristic | product decision | L274, L396 |

---

## 5. Group 2 findings — channel/time/plane display, coordinates, label overlays

### 5.1 Axes, units, and dimension semantics (§2.1)

- Each axis dictionary **MUST** contain `name`, with names **MUST**-unique across the list (S003 L168). `type` is SHOULD, normally `space`/`time`/`channel`, but **MAY** be any custom string (S003 L169). `unit` is SHOULD, normally a UDUNITS-2 string from the enumerated space/time unit lists (S003 L170–172).
- `axes` length **MUST** equal the arrays' dimensionality (S003 L173).
- *Consequence for the plan's details panel:* "dimensions, units and coordinates" can always show names and sizes, but **type may be custom and units may be absent** — the UI must distinguish "unit: micrometer" from "unit: unspecified" rather than assuming calibration exists.

### 5.2 Rendering: channels, time, planes — the transitional `omero` block (§2.5)

- Transitional per-image rendering info sits under the `omero` key: image `name` "as shown in the UI", a `channels` array "matching the c dimension size" with per-channel `active`, `color`, `label`, `window`, and `rdefs` with `defaultT` ("first timepoint to show the user"), `defaultZ` ("first Z section to show the user"), and `model` `"color"` or `"greyscale"` (S003 L398–423).
- Normative floor: `omero` is **optional**; if present it **MUST** contain `channels`; each channel **MUST** contain `color` (exactly 6 hexadecimal digits, RGB) and `window`; the window **MUST** contain `min`, `max`, `start`, `end` (S003 L426–430). Everything else in the block (`active`, `label`, `family`, `inverted`, `coefficient`, `rdefs`) appears only in the example (S003 L401–423) and is not stated as a MUST — treat their presence as likely but not guaranteed.
- Transitional status: reading transitional data "may be expected (MUST) or encouraged (SHOULD)" depending on the key; the omero section itself imposes no explicit reader MUST, and version history shows the omero description was removed and re-added at 0.5.1 (S003 L828–830) — evidence that omero support should be coded as *optional enrichment with graceful fallback*, not a hard dependency.
- *Product decisions:* default channel color/window/lookup-table when `omero` is absent; whether to honor `rdefs.defaultT/defaultZ` as initial time/plane; composite ("color") vs greyscale display; handling of a `channel`-typed axis absent entirely (e.g., 3-D t/z/y/x data) — the format permits images with no channel axis (S003 L301).

### 5.3 Coordinates and calibration (§2.3 + §2.4)

- `coordinateTransformations` map the array's discrete data space to physical space (S003 L277–278). Each entry **MUST** have `type`; in the multiscales context only `scale` and `translation` are allowed (S003 L279–281, L309). `identity` is the default and "typically not explicitly defined" (S003 L282–283). Transformations apply **sequentially, in order** (S003 L293).
- Per dataset (resolution level): **exactly one `scale`** is a MUST, specifying "the pixel size in physical units or time duration"; where scaling information is unavailable for an axis, the value **MUST** express the factor versus the first resolution, defaulting to 1.0 with no downsampling (S003 L310). A `translation` **MAY** appear, exactly once, and **MUST** be listed after scale so it is expressed in physical coordinates (S003 L311). Scale/translation array lengths **MUST** equal `axes` length (S003 L312).
- Group-level `coordinateTransformations` **MAY** exist, apply to all resolution levels, follow the same type/order rules, and are applied **after** the dataset-level transforms (S003 L314–315). The spec's own example uses this to carry a time-axis scale (0.1 ms) shared by all levels (S003 L368–374).
- The capture's worked example treats per-level `scale` as the **absolute voxel size at that level** (level 0: 0.5 µm; level 1: 1.0 µm; level 2: 2.0 µm, S003 L336–366), with the factor-vs-first-level reading reserved for axes whose scaling info is unavailable (S003 L310). A reader should implement the composition (group-level after dataset-level, sequential within each list) rather than assume all values are absolute.
- *Consequence for "correctly calibrated coordinates":* a correct readout requires composing dataset scale + optional dataset translation + optional group-level transforms, per axis, honoring order; and it must handle (a) missing units, (b) factor-not-absolute axes, (c) time axes calibrated via scale, and (d) translations shifting the origin.

### 5.4 Associated label overlays (§1.1 labels + §2.6)

- Discovery: the `labels` group is nested within the image group, at the same level as the resolution arrays; its `zarr.json` **MUST** contain `"labels"`, a JSON array of paths to the labeled multiscale images; all label images **SHOULD** be listed (S003 L437, L441–442). Intermediate groups between `labels` and the label images are allowed but **MUST NOT** contain metadata (S003 L439–440); label image names are arbitrary (S003 L440).
- Shape/alignment guarantees a viewer can rely on:
  - Each dimension of a label image is either the same as the corresponding image dimension **or 1** if irrelevant (S003 L106–108).
  - The label image's `zarr.json` **MUST** implement `multiscales`, and its `datasets` **MUST** have the **same number of scale levels** as the original unlabeled image (S003 L454–455). This is the format-level basis for per-level overlay alignment promised in the plan.
  - Label pixels **MUST** be integer types among `[uint8, int8, uint16, int16, uint32, int32, uint64, int64]` (S003 L438–439); non-integer label data is invalid input the viewer should report.
- Display metadata (`image-label`, SHOULD-level as a whole, S003 L456–460): if present it **SHOULD** contain `colors` (**MUST** be an array) and `version` (**MUST** be a string). Colors entries **MUST** contain `label-value` (an integer) and **MAY** contain `rgba` — four integers 0–255 (R,G,B, alpha/opacity); conforming readers **SHOULD display labels using the colors specified** (S003 L461–466). Optional `properties` (per-label-value arbitrary key/value metadata; entries need not share keys, S003 L467–471) and `source` (**MUST** be an object; **MAY** include `image`, a relative path to the source image group, default `"../../"`, S003 L472–474). Worked example: label 0 → rgba [0,0,128,128] (50 % blue, 50 % opacity), label 1 → [0,128,0,128] (S003 L475–514).
- *Gaps the plan must decide on:* when `image-label` or a given `rgba` is missing, no display color is specified (unlabeled colormap is a product decision); `properties` is displayable metadata for a details/tooltip panel but is optional; the `source.image` link lets the viewer confirm which primary image a label belongs to (default parent), worth using when labels are opened out of context.

### 5.5 Obligation summary for Group 2

| Requirement | Level | Source |
|---|---|---|
| `axes[].name` present and unique | MUST | L168 |
| `axes` length = array dimensionality | MUST | L173, L300 |
| Axis type ∈ {space,time,channel} or custom; unit UDUNITS-2 | SHOULD | L169–170 |
| `dimension_names` in array `zarr.json`, matching axes | MUST | L174 |
| omero present ⇒ `channels`; color 6-hex; window min/max/start/end | MUST (conditional) | L426–430 |
| omero itself optional (transitional) | optional | L398–400, L426 |
| Dataset transforms: exactly one `scale`; ≤1 `translation` after scale | MUST / MAY | L309–311 |
| Scale/translation length = axes length | MUST | L312 |
| Group-level transforms applied after dataset-level | MUST (ordering rule) | L314–315 |
| Sequential application, in order | MUST | L293 |
| `labels` array in labels-group `zarr.json` | MUST | L441–442 |
| Label images are multiscales with same level count as parent | MUST | L454–455 |
| Label pixels integer-only | MUST | L438–439 |
| Intermediate labels sub-groups metadata-free | MUST NOT | L439–440 |
| Color labels per `image-label.colors[].rgba` | SHOULD (reader) | L461–466 |
| `label-value` integer in colors/properties entries | MUST | L462, L469 |
| Rendering defaults absent omero; missing rgba; rdefs honoring; LUTs | product decision | — |

---

## 6. Plan implications and dispositions (Viewer.md mapped to the format)

| Plan / brief element | Format findings | Disposition |
|---|---|---|
| "opens a local OME-Zarr 0.5 fileset and lists the images it finds" | Three layout families (§1.1 image, §2.2 collection, §1.2/§2.7/§2.8 plate); discovery via `ome` attributes in `zarr.json`; version consistency MUST (L152–156, L176, L120–127) | **Adopt with addition:** plan must name all three layouts as first-class discovery targets; plates need grid navigation (rows/columns/wells/fields), not a flat list |
| "lists the images it finds" | Reader SHOULD surface multiple images, SHOULD NOT default to first (L272); MAY show all or offer choice (L274) | **Adopt:** list + user selection satisfies the SHOULD; showing only image 0 would violate it |
| "canvas with pan and zoom… pyramid level appropriate for the current view" | Levels ordered high→low (L306); level-choice algorithm unspecified; chunk-size hint non-normative (L396); chunked random access from Zarr v3 (L70–72) | **Product decision documented:** choose level by on-screen pixels vs level shape (and optionally chunk size); format imposes only ordering + path authority |
| "channel visibility controls" | omero channels optional; color/window MUSTs when present (L426–430); absent ⇒ no colors specified | **Adopt + decision:** default gray/LUT + data-range window when omero missing; honor colors/window when present |
| "time-point and plane selection where relevant" | Time/channel axes optional (L301); rdefs.defaultT/defaultZ transitional hints (L420–421) | **Adopt:** controls appear only for present axes; initial selection = rdefs if present, else index 0 (decision) |
| "optional overlays for associated label images" | labels list MUST (L441–442); same level count MUST (L454–455); dims same-or-1 (L106–108); colors SHOULD be used (L461–466) | **Adopt:** per-level overlay alignment is supported by format guarantees; overlay color = rgba when available; decision for missing rgba |
| "details panel shows dimensions, units and coordinates" | axes name/type/unit (L168–170); unit SHOULD ⇒ may be absent; transforms composition (L293, L308–316) | **Adopt + guard:** render "unit unknown" state; implement full transform composition for coordinate readout |
| "Large image reads run in the background… cancels work" | No format content; chunk-based partial reads enabled by Zarr v3 (L68–72); arbitrary codecs/grids allowed (L70–72) | **Holds:** plan concern, not format obligation; must not assume specific chunking or codecs |
| "Opening failures explain which image or data could not be displayed" | Validity surface: version mismatch (L156), dims ≠ 2–5 (L300, L307), missing `dimension_names` (L174), non-integer labels (L438–439), JSON comments (L65–66), plate/well path rules (L553–560, L746–747), duplicate axis names (L168) | **Adopt:** build error taxonomy from these rules; message content is a product decision (format is silent on UX) |
| "interoperate with filesets from real OME-Zarr 0.5 tools" | Capture §4 = "See Tools." only (L813–814); no tool data admitted | **Blocked / limitation:** cannot verify real-tool behavior from this capture; see §8 and validation proposal |
| "Source files remain unchanged; display settings local" | Writing usually optional MAY for transitional (L62–63); spec imposes no write on readers | **Consistent:** read-only viewer writes nothing; local session settings are outside format scope |
| Acceptance "representative filesets" | Need: single image; b2r multi-image collection; sparse + dense plates; labels with/without image-label; malformed variants of L156/L174/L300/L438 | **UNEXECUTED validation plan** (§10) |
| Brief: "Image editing, export, remote services… outside" | Format's HTTP/object-storage capability (L73–77) explicitly unused | **Consistent boundary** |

---

## 7. Governing conditions, counterevidence and internal tensions in the source

1. **Capitalization is not a normativity signal here.** The conformance boilerplate says the RFC 2119 words "do not appear in all uppercase letters in this specification" (S003 L875–876), yet the body uses uppercase MUST extensively (e.g., L156, L168, L174) *and* lowercase "must" in normative statements (e.g., "All image arrays must be up to 5-dimensional", L96–97; "must contain the bioformats2raw.layout key", L193; "must be between 2 and 5", L300). Reading implication: treat both cases as normative RFC 2119 usage (per L872–878) and never weaken a requirement because it is lowercase — and do not invent a requirement from capitalization alone.
2. **Examples are not obligations.** The multiscales and omero blocks contain the only worked examples, with JSON comments (S003 L341, L351, L370, L401–423); comments **MUST NOT** appear in real files (L65–66). Any fixture copied from the spec must be comment-stripped, and a strict JSON parser is required for reading (rejecting comments is format-correct, not an extra).
3. **Transitional ≠ skippable.** `bioformats2raw.layout` and `omero` are slated for future removal (L60–64, L180–181), yet b2r filesets "already exist in the wild" (L180–181) and the transitional preamble explicitly contemplates MUST-level reading expectations (L61–62). Counterweight: 0.5.1 re-added the omero description (L828–830), showing churn. Net: a 0.5 reader should support both transitional keys, degrading gracefully.
4. **Directory names lie.** Level names are arbitrary (L93–94), axis names arbitrary (L81), label image names arbitrary (L440), while intermediate label folders must be metadata-free (L439–440) and b2r images without `series` are positional (consecutive from 0, L268–269). Any code keyed on names/ordering of the filesystem rather than metadata is a correctness defect.
5. **Precedence conflict rule.** When `bioformats2raw.layout` and `plate` coexist, plate wins and mixing is impossible at present (L204–206). A parser that treats b2r as a flat image list would misread HCS plates converted by bioformats2raw.
6. **Labels double-counting risk.** Label images implement `multiscales` (L454) yet are not top-level images (L438) — counterevidence against the naive discovery rule "multiscales ⇒ image" noted in §4.1(e).
7. **`field_count` is a bound, not a census.** "maximum number of fields per view across all wells" (L538–539) vs. the well `images` list as the actual field inventory (L744–745). UIs that paginate by `field_count` may show phantom fields or miss nothing but will not know actual fields without reading the well.
8. **Doc-date oddity (capture-level).** The cover dates the report 8 September 2026 (L3–4) while version history's last entry is 0.5.2, 2025-01-10 (L825–827), and "This version", "Latest published" and "Editor's Draft" are the same URL (L5–10). The catalog marks the capture `capture-only` with the origin URL unrecorded for some aliases (`inputs/catalog.json`). Treat the capture as the authoritative admitted text, but flag that currency beyond it is unverifiable here.

---

## 8. Unsupported-input limitations (what this admitted capture cannot answer)

1. **Real implementations:** §4 "Implementations — See Tools." (L813–814) is a dangling pointer; the capture contains no tool list. The brief's "research… actual reader implementations broadly enough to uncover compatibility… requirements" cannot be satisfied from S003; compatibility findings above are format-obligation findings only. (Listed because the brief demands it; not fillable within source scope.)
2. **Zarr v3 normative text:** array/group `zarr.json` schemas, chunk key encodings, sharding, codecs, and storage transformers are incorporated by reference (L68–72) but not restated; the reader's exact Zarr-level obligations and the full set of legal data types for *image* (non-label) arrays rest on the external Zarr spec.
3. **OME-XML content rules** for `OME/METADATA.ome.xml` (L257–260) and **UDUNITS-2** validity (L170) are likewise by-reference.
4. **"More information" for omero** lives in the OMERO WebGateway documentation (L424–425), not admitted.
5. **Prevalence data:** nothing in a normative capture shows what real writers actually emit (e.g., whether `dimension_names` is present in older-but-in-the-wild 0.5 files, whether `omero` is ubiquitous, absolute-vs-factor scale conventions in practice). The example-vs-clause scale semantics of §5.3 is internally consistent here, but field-file variance is a known risk the capture cannot quantify — targeted at validation, not answerable from this source.
6. **Performance:** the capture has no chunking-size, sharding, or performance guidance relevant to "large dataset must not freeze interaction"; that is engineering, not format, content.

---

## 9. Uncertainty and unresolved areas

1. **Normative status of multi-multiscales selection** (L388–389): no RFC 2119 keyword; it reads as guidance ("the user can choose by name, using the first multiscale as a fallback"). Slide Scout can adopt it as convention, but this report cannot assert it as a MUST/SHOULD. *(Unresolved within capture.)*
2. **Reader MUST-level obligations for transitional metadata:** the preamble permits MUST-or-SHOULD reading expectations per key (L60–64) but neither §2.2 nor §2.5 states a reader MUST. Whether omero support is "expected" of a conforming 0.5 reader is therefore judgment, not established obligation. *(Unresolved; plan treats it as SHOULD-level enrichment.)*
3. **Missing `rgba` for some label values, or missing `image-label` entirely:** reader display is unspecified (only "SHOULD display using colors specified" when colors exist, L461). Fallback coloring is a product decision.
4. **Custom/null axis types** (L169, L301): how to present a `null`/custom axis in time/plane controls is unspecified.
5. **Scale semantics in wild files** (absolute vs factor per level): the capture's clause (L310) plus example (L336–366) are consistent with absolute sizes, but the capture cannot show writer behavior; flagged for validation with real filesets (§10), decision rule needed in code either way.
6. **Error-behavior expectations:** the format defines validity, not reader behavior on invalid input; the plan's "understandable feedback rather than a crash" is entirely a product requirement with no format counterparty.
7. **`model` ("color" vs "greyscale") rendering math** and window application (contrast mapping between `start`/`end` within `min`/`max`) are named but not algorithmically defined in the capture (L411–422).

---

## 10. Proposed validation — **UNEXECUTED**

No execution was authorized in this Goal; the following is proposed only, mapped to the plan's acceptance line (Viewer.md) and the format rules above. None of it has been run.

1. **Discovery matrix (acceptance: "image discovery"):** representative filesets — (a) single 5-D multiscale image; (b) `bioformats2raw.layout` collection with `OME/series`; (c) same without `series` (positional 0..n); (d) dense plate; (e) sparse plate (empty rows/columns present, per L532–534); (f) image with `labels` group incl. nested intermediate folder (metadata-free, L439–440). Check: all images listed; labels not listed as images; empty plate cells rendered.
2. **Navigation (acceptance: navigation):** verify level ordering taken from `datasets` (not names), per-level `dimension_names` matches `axes` (L174), and multi-multiscales name-selection with first-fallback (L388–389).
3. **Calibration (acceptance: "calibrated coordinate display"):** filesets with (i) full units + per-level absolute scales; (ii) group-level time scale (composition order, L314–315); (iii) missing units (expect explicit "unknown units" state); (iv) translation-after-scale offset origin.
4. **Display (acceptance: channel/plane controls):** with and without `omero`; honor color/window when present; defined fallbacks when absent; `rdefs.defaultT/defaultZ` as initial selection.
5. **Overlays (acceptance: "aligned label overlays"):** label image with same level count as parent (L454–455); rgba colors incl. alpha < 255; missing-rgba fallback; non-integer label file → reported as invalid (L438–439).
6. **Robustness (acceptance: "malformed or unavailable input"):** version mismatch across hierarchy (L156); JSON-with-comments file (L65–66); >5-D or axes/dims mismatch (L300/L307); duplicate axis names (L168); plate well path not `row/column` (L553–556); missing well `acquisition` id in multi-acquisition plate (L748–750). Expected: explanatory failure naming the offending image/node, no crash.
7. **Real-tool interop (brief):** acquire filesets written by current bioformats2raw / ome-zarr-py / ngff tools and rerun 1–6 — **requires sources or filesets outside this Goal's admitted scope**; flagged as the open follow-up, since the capture's Implementations section is empty (L813–814).

---

## 11. Source line-citation index (S003.txt)

- Document identity/versions: L1–6, L24–27; conformance rules L57–66, L867–888; RFC 2119 ref L893–896.
- Storage format: L67–77; images hierarchy L78–117; HCS hierarchy L118–148.
- Metadata namespace/version: L149–165; axes L166–174; bioformats2raw.layout L175–275; coordinateTransformations L276–293; multiscales L294–397; omero L398–430; labels L431–514; plate L515–739; well L740–808.
- Naming style L809–812; Implementations L813–814; Citing L815–820; Version History L821–866.

*All line numbers reference `inputs/sources/S003.txt` (frozen capture, sha256 `5d8b2408…ae82de`, 896 lines) as admitted by `inputs/catalog.json`. Findings above are confined to that capture plus the brief/plan inputs; no live, historical, or evaluator sources were consulted; no external writes were made; proposed validation in §10 is UNEXECUTED.*
