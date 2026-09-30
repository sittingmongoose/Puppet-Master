# Slide Scout — OME-Zarr 0.5 normative viewer requirements (combined groups 1+2)

- Case: `ome-normative-dev-v1`
- Task card: `t01-m-ome-batching-screen-v1-treatment`
- Brief groups covered (single coherent task): (1) Opening a fileset, listing/selecting images, navigating multiresolution data; (2) Channel/time/plane display, coordinate details, associated label overlays.
- Source scope: ONLY frozen capture `inputs/sources/S003.txt` (S003). No live fetching.
- Plan scope: thin fixture `inputs/plan/Viewer.md` only.
- Status: standalone current research report. All proposed validation is `UNEXECUTED` unless explicitly evidenced (none was executed).
- Method boundary: streaming delivery adapter out of scope; small/medium grouping only (18 findings), no large parameter sweep.

## 1. Sources and versions (exact locators)

Primary normative capture:

- Handle: `S003`, file `sources/S003.txt` per `inputs/catalog.json:6-9`.
- Bytes/lines: `36980` bytes, `896` lines, `view_kind: original_bytes` per `inputs/catalog.json:10-15`.
- Integrity: `original_sha256` = `view_sha256` = `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de` per `inputs/catalog.json:9-13`.
- Admitted URI/version: `https://ngff.openmicroscopy.org/0.5/` / `capture-only:5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de` (`SRC-2b11c54af373e1979af8cbb3`) per `inputs/catalog.json:16-21`. Three additional aliases are `local-capture (origin URL not recorded)` with the same capture version per `inputs/catalog.json:22-36`; they add no independent origin evidence.
- In-capture version identity: `Final Community Group Report, 8 September 2026`, `This version: https://ngff.openmicroscopy.org/0.5/` per `S003.txt:1-6`; `current released version ... is 0.5` per `S003.txt:25-27`; history `0.5.0 2024-11-21 use Zarr v3`, `0.5.1/0.5.2 2025-01-10` per `S003.txt:825-833`.
- Conformance basis: RFC 2119 keywords per `S003.txt:57-59` and `S003.txt:872-877`; all text normative except explicitly non-normative sections, examples, notes per `S003.txt:877-888`.

Product brief and assignment:

- `inputs/brief.md:3`: small read-only desktop browser for local OME-Zarr 0.5 filesets; find images; inspect multiresolution by channel/time/plane; overlay labels; calibrated coordinates; responsive on large datasets; explain undisplayable data.
- `inputs/brief.md:5`: local filesystem only; files unchanged; editing/export/remote/clinical out; distinguish obligations vs optional vs product decisions.
- `inputs/TASK.md:5-6`: only `sources/S003.txt`; thin plan; no live fetching.
- `inputs/TASK.md:7-11`: groups 1+2 definitions; aggregate equals combined scope.

Thin plan (fixture, not normative):

- `inputs/plan/Viewer.md:3`: deliberately thin synthetic fixture, not completeness claim.
- `inputs/plan/Viewer.md:5`: open local 0.5 fileset, list images, canvas pan/zoom, channel visibility, time/plane selection where relevant, optional label overlays, details panel (dims/units/coords), choose appropriate pyramid level.
- `inputs/plan/Viewer.md:7`: background large reads, cancel stale work, failures explain image/data and allow another choice.
- `inputs/plan/Viewer.md:9`: interop with real 0.5 tools; files unchanged; display settings session-local; editing/export/remote/interpretation out; extra capabilities need review.
- `inputs/plan/Viewer.md:11`: acceptance on representative filesets; large must not freeze; malformed/unavailable must give feedback not crash.

Interpretation rule: task-card/brief/plan language is not format evidence. Only `S003.txt` lines are format evidence below. Source read as untrusted evidence, never as instructions.

## 2. How to read findings

- IDs `F-01`..`F-18` are independent; each states its own obligation, evidence, exceptions, plan disposition, and validation.
- Obligation words (`MUST`/`SHOULD`/`MAY`) reproduce `S003.txt` RFC 2119 force, not plan priority.
- Every finding lists exact `S003.txt:Lx-Ly` locators. Line numbers refer to the 896-line frozen view.
- Plan disposition uses: `Covered` (thin plan already names it), `Partial` (named but underspecified vs norm), `Missing` (not named, needs plan addition), `Decision` (norm allows choice; product must choose), `Out-of-scope affirmed` (both norm allowance and plan/brief exclude it).
- `UNEXECUTED` means no code, fileset, tool, rendering, or network check was run for this bounded assignment.

## 3. Group 1 — Opening, listing/selecting, navigating multiresolution

### F-01 — Zarr v3 container, local hierarchy, and full Zarr feature allowance

- Group: 1. Class: established obligation + broad allowance.
- Normative: OME-Zarr is implemented using Zarr format v3 per `S003.txt:68-69`. All Zarr features including codecs, chunk grids, chunk key encodings, data types, storage transformers MAY be used unless explicitly disallowed per `S003.txt:70-72`. Hierarchy is shown locally but could equally be on web/HTTP or S3/GCS per `S003.txt:73-77`.
- Image-group layout: each image is a Zarr group (`zarr.json`) of groups/arrays; group attributes include `multiscales` and `omero` per `S003.txt:87-89`; examples `123.zarr`, `456.zarr` per `S003.txt:82-85`.
- Governing exceptions/conditions:
  - No explicit disallow list appears in this capture; allowance is therefore wide. Viewer cannot assume a fixed codec/chunking/dtype.
  - Remote/HTTP/S3/GCS layouts are format-possible but brief/plan restrict Slide Scout to local filesystem (`inputs/brief.md:5`, `inputs/plan/Viewer.md:9`). Do not treat remote support as required.
- Plan disposition: `Partial`. Plan says “opens a local OME-Zarr 0.5 fileset” and “interoperate with filesets from real tools” (`Viewer.md:5,9`) but names no Zarr v3 reader, no codec/chunk-grid fallback, and no version gate.
- Implication: plan must add Zarr v3 group/array/`zarr.json` opening, local-path only, plus explicit “cannot decode this Zarr feature” feedback (see F-09/F-18). Do not add remote support.
- Uncertainty/counterevidence: none within S003 on v3 basis; `0.5.0 ... use Zarr v3 ... see RFC-2` at `S003.txt:831-833` confirms. RFC-2 itself is not in capture.
- Proposed validation: `UNEXECUTED` — open representative local Zarr v3 groups with varied codecs/chunks; verify unsupported-feature message, no crash, files unchanged.

### F-02 — `ome.version` namespacing and hierarchy consistency + JSON hygiene

- Group: 1. Class: established obligation.
- Normative: OME-Zarr metadata is stored under namespaced `ome` key in `attributes` in `zarr.json` files per `S003.txt:150-154`. Version string in `ome.version` (example `"0.5"`) per `S003.txt:155-165`. Version MUST be consistent within a hierarchy per `S003.txt:156`.
- JSON comments MUST NOT be included in JSON objects though examples show comments for clarity per `S003.txt:65-66`.
- Governing exceptions: none; consistency is absolute. Capture does not define repair/override when inconsistent.
- Plan disposition: `Missing`. Plan has no version check, namespace check, or malformed-JSON handling beyond generic “understandable feedback” (`Viewer.md:11`).
- Implication: plan must require: read `ome.version`; reject/mixed-version warn when inconsistent or not `0.5`; strict JSON parse (comments invalid); surface which `zarr.json` failed.
- Uncertainty: interaction of `ome.version` with `plate.version`/`well.version`/`image-label.version` (each separately MUST string, see F-06/F-07/F-17) is not defined as equality; treat as independent schema versions.
- Proposed validation: `UNEXECUTED` — fixtures with missing `ome`, wrong version, mixed versions in hierarchy, JSON with comments; check gating + messages.

### F-03 — Single-image levels: arbitrary names, ordered `datasets`, relative paths

- Group: 1. Class: established obligation.
- Normative: each multiscale level is a separate Zarr array (folder of chunks) per `S003.txt:91-92`; array name arbitrary with ordering defined by `multiscales`, often `0..n` per `S003.txt:93-95`. Each `multiscales` dict MUST contain `datasets` list per `S003.txt:304`; each entry MUST contain `path` relative to current group per `S003.txt:305-306`; `path`s MUST be ordered largest (highest resolution) to smallest per `S003.txt:306`. Each entry MUST have same dims, ≤5, number/order MUST correspond to `axes` per `S003.txt:307`.
- Chunks stored per Zarr array spec/metadata in array `zarr.json` per `S003.txt:99-100`.
- Governing exceptions: name sequence `0..n` is convention, not requirement; viewer MUST follow `datasets[].path` order, not lexical/numeric sort. Relative-path base is current image group.
- Plan disposition: `Partial`. Plan says “chooses an available pyramid level appropriate for current view” (`Viewer.md:5`) but does not say order is metadata-defined or that names are arbitrary.
- Implication: plan must navigate strictly via `datasets` order; never assume `0` is full resolution without checking order (though S003 orders largest-first, so `datasets[0]` is largest by norm); handle non-numeric paths; handle per-level array `zarr.json` read failure per-image.
- Proposed validation: `UNEXECUTED` — fixtures with shuffled/non-numeric level names, missing level directory, mismatched dims; verify order-following and per-level error.

### F-04 — Multiple `multiscales` entries: name selection with first-entry fallback

- Group: 1. Class: established capability + informative selection pattern.
- Normative/container: `multiscales` contains a list of dicts each describing a multiscale image per `S003.txt:298`; each SHOULD contain `name` per `S003.txt:317`, SHOULD contain `type` (downscaling method) per `S003.txt:318`, SHOULD contain `metadata` dict per `S003.txt:319`; example `type: gaussian` + `metadata{description,method,version,args,kwargs}` per `S003.txt:375-382`.
- Selection: “If only one multiscale is provided, use it. Otherwise, user can choose by name, using first as fallback” plus pseudocode selecting `name=="3D"` else `multiscales[0]` (or chunk-size choice) per `S003.txt:388-397`.
- Governing exceptions: selection pseudocode is informative (“Or perhaps choose based on chunk size”). No MUST to offer choice; fallback to first is permitted. `type`/`metadata` values are implementation-defined.
- Plan disposition: `Missing` (needs `Decision`). Plan says “lists images” and selects an image (`Viewer.md:5`) but never addresses multiple `multiscales` within one image group.
- Implication: product decision required: expose named-multiscale choice when `len>1` vs auto-first with disclosure. At minimum do not silently misrender: show `name`/`type` in details and allow switching or document first-only limit.
- Proposed validation: `UNEXECUTED` — fixture with 2 `multiscales` (e.g., `3D` + other); verify listing/selection/fallback and displayed identity.

### F-05 — Multi-image collections: `bioformats2raw.layout` (transitional) discovery

- Group: 1. Class: transitional obligation set (read support expected/encouraged; write optional).
- Basis: transitional metadata read MAY be MUST/SHOULD, write usually MAY per `S003.txt:60-64`; this layout added v0.4 transitional for existing filesets, to be replaced per `S003.txt:180-181`; multi-image-file ordering rationale per `S003.txt:176-179`.
- Layout: `series.ome.zarr/{zarr.json with layout, OME/{zarr.json series, METADATA.ome.xml}, 0,1,...}` per `S003.txt:183-191`.
- Conforming groups: MUST value `3` for `bioformats2raw.layout` at hierarchy top per `S003.txt:256` and `S003.txt:193-203`; SHOULD have `OME/METADATA.ome.xml` representing collection per `S003.txt:257`; that XML MUST adhere OME-XML but MUST use `<MetadataOnly/>` not `<BinData/>`/`<BinaryOnly/>`/`<TiffData/>` per `S003.txt:258-259`; MAY use minimum spec per `S003.txt:260`.
- Discovery logic: if `plate` present, images MUST be at defined location; matching `series` SHOULD be provided for unaware tools per `S003.txt:262-263`; if `plate` present `plate` takes precedence and parsing follows plate spec; cannot mix image collections with plates per `S003.txt:204-206`. If `OME` group exists it MAY contain `series`; if so `series` MUST be list of string paths, order MUST match `Image` order in XML if provided per `S003.txt:264-267` (example `["0","1"]` per `S003.txt:243-253`). If no `series` and no `plate`, separate `multiscales` images MUST be in consecutively numbered groups from `0` per `S003.txt:268-269`. Every `multiscales` group MUST represent exactly one OME-XML `Image` in series/group-number order per `S003.txt:270`.
- Conforming readers: SHOULD be aware of >1 image (SHOULD NOT default to only first) per `S003.txt:272`; MAY use `series` to list groups per `S003.txt:273`; MAY show all or offer choice as with plates per `S003.txt:274`; MAY ignore other groups/arrays under root per `S003.txt:275`.
- Governing exceptions: plate precedence overrides collection logic; `series` optional; numbered fallback only when both `series` and `plate` absent; ignoring unknown root children explicitly allowed.
- Plan disposition: `Partial` + `Decision`. Plan “lists images” and “allow user to choose another item” (`Viewer.md:5,7`) aligns with SHOULD-NOT-first-only, but names no layout value, no `OME/series`/numbered logic, no plate precedence.
- Implication: plan must implement the three-branch discovery (plate → series → numbered `0..n`) and multi-image listing/selection; surface `METADATA.ome.xml` absence/invalid as non-fatal unless needed; decide show-all vs chooser (both allowed).
- Uncertainty: OME-XML parsing scope for viewer is unclear (minimum spec allowed); S003 does not require viewer to parse XML, only order correspondence when provided.
- Proposed validation: `UNEXECUTED` — fixtures: layout+series, layout+plate, layout numbered-only, missing XML, mismatched series/XML order; verify listing, precedence, first-only avoidance, ignore-unknown handling.

### F-06 — HCS plate discovery: full/empty rows+columns, wells, acquisitions

- Group: 1. Class: established obligations.
- Location: plate layout under `plate` key in plate-group metadata per `S003.txt:516-517`.
- Acquisitions (optional container): plate dict MAY contain `acquisitions` MUST be list; each MUST contain unique int `id >=0` for field references per `S003.txt:518-522`; each SHOULD contain `name` MUST string per `S003.txt:523-524`; SHOULD contain `maximumfieldcount` MUST positive int per `S003.txt:524-526`; MAY contain `description` MUST string, MAY `starttime`/`endtime` MUST int epoch per `S003.txt:526-529`.
- Columns/rows (required, dense definitions): MUST contain `columns`/`rows` lists; each physical column/row MUST be defined even if no wells in it per `S003.txt:530-533` and `S003.txt:542-545`; each object MUST contain `name` string; MUST alphanumeric, case-sensitive, unique within list per `S003.txt:533-536` and `S003.txt:545-548`; SHOULD avoid case-insensitive collisions (e.g., `Aa` vs `aA`) per `S003.txt:536-537` and `S003.txt:548-549`.
- `field_count` SHOULD be positive int = max fields/view across wells per `S003.txt:538-539`; `name` SHOULD be string plate name per `S003.txt:540-541`; `version` MUST be string plate-spec version per `S003.txt:550-551`.
- Wells (required, sparse list): MUST contain `wells` list; each MUST contain `path` = `{row}/{column}` with `/` separator, no extra leading/trailing dirs per `S003.txt:552-556`; MUST contain 0-based `rowIndex`+`columnIndex`; all three MUST refer to same pair per `S003.txt:557-560`.
- Examples: dense 2×3/2-acq plate per `S003.txt:561-640`; sparse 96-well (H×12) with 2 wells `C/5`,`D/7` per `S003.txt:641-739`.
- Governing exceptions: sparse `wells` over dense `rows`×`columns` is normal; acquisitions optional but referenced IDs must exist (see F-07); version is plate-spec version, not necessarily `ome.version`.
- Plan disposition: `Missing`. Plan “lists images” with no plate/row/column/well/acquisition model (`Viewer.md:5`).
- Implication: plan must add plate browser (plate name, rows×columns grid with empty wells shown as empty, wells list via `path`+indices consistency check, acquisitions filter, `field_count` as max hint not exact count). Validate path/index/name rules and report mismatch with well identity.
- Proposed validation: `UNEXECUTED` — dense + sparse plate fixtures, duplicate/non-alphanumeric names, path/index mismatch, missing rows/columns; verify grid, filtering, errors.

### F-07 — HCS well fields + hierarchy placement + empty-group pruning

- Group: 1. Class: established obligations.
- Well metadata under `well` key per `S003.txt:741-743`; MUST contain `images` list; each MUST contain `path` string: MUST alphanumeric, case-sensitive, unique in list per `S003.txt:744-748`; if multiple acquisitions in plate it MUST contain `acquisition` int MUST match plate acquisition object per `S003.txt:748-750`; SHOULD contain `version` MUST string per `S003.txt:751-752`. Examples: 4 fields across acq 1+2 per `S003.txt:753-784`; 2 fields across acq 0+3 of 4 per `S003.txt:785-808`.
- Hierarchy: three groups MUST be above images: well (MUST implement well spec; images are fields of same well), row, plate (MUST implement plate spec) per `S003.txt:118-127`; layout `plate/A/1/0` with `multiscales,omero`+levels+labels per `S003.txt:131-148`.
- Pruning: well-row SHOULD NOT be present if no images in row; well SHOULD NOT be present if no images in well per `S003.txt:128-129`.
- Governing exceptions: `acquisition` required only when plate has multiple acquisitions; `images[].path` is well-relative (e.g., `0`), distinct from plate `wells[].path` (`A/1`); absent empty groups are expected, not errors.
- Plan disposition: `Missing`. No well/field/acquisition concept in thin plan.
- Implication: resolve each field as `platePath/wellPath/images[].path`; group fields by well; filter/badge by acquisition; do not fabricate empty rows/wells; treat missing-but-listed field as per-field open failure.
- Proposed validation: `UNEXECUTED` — multi-acquisition wells, missing acquisition link, duplicate field paths, pruned empty rows/wells; verify grouping, filtering, missing-field message.

### F-08 — Dimensionality and axis-order constraints for navigation UI

- Group: 1. Class: established obligations.
- Image dims: 2–5 variable per `S003.txt:81` and `S003.txt:296-300`; arrays up to 5D with time before channel before spatial per `S003.txt:96-98`; `axes` length 2–5 MUST equal array dims per `S003.txt:300`; datasets dims MUST NOT exceed 5 and MUST match `axes` per `S003.txt:307`.
- Axis count/order: MUST contain 2–3 `type:space`, MAY one `time`, MAY one `channel`/null/custom per `S003.txt:301`; order MUST correspond to array dims and MUST be time-first (if present), then channel/custom (if present), then space per `S003.txt:302`; if 3 spatial with `yx` plane + stacked `z`, SHOULD order `zyx` per `S003.txt:303`.
- `dimension_names` MUST be in array `zarr.json` and MUST match `axes` names per `S003.txt:174` (clarified `0.5.2` per `S003.txt:825-827`).
- Governing exceptions: axis names arbitrary (see F-10); custom/null channel-like axis allowed; `zyx` is SHOULD not MUST.
- Plan disposition: `Partial`. Plan promises time/plane selection “where relevant” and dims/coords panel (`Viewer.md:5`) but encodes no 2–5D gate, no order rule, no `dimension_names` check.
- Implication: gate opening on dims/order/`dimension_names`; derive selectors from actual `axes` (not assumed `tczyx`); hide/disable time/plane/channel controls when axis absent; explain non-conforming order/dims per image.
- Proposed validation: `UNEXECUTED` — 2D/3D/4D/5D fixtures, custom axis, `zyx` vs other space order, `dimension_names` mismatch; verify gating, selector presence, messages.

### F-09 — Level choice, responsiveness, and open-failure explanation (norm silence + plan duty)

- Group: 1. Class: product decision under norm silence + plan obligation.
- Norm silence: S003 defines level ordering (largest→smallest, F-03) and per-level calibration (F-12) but no normative pan/zoom algorithm, no viewport→level rule, no chunk-prefetch, threading, or latency norm. Reader MAY choices (show-all vs chooser, ignore unknown children) at `S003.txt:273-275` are the only navigation-behavior norms. Examples/notes are informative per `S003.txt:877-888`.
- Plan/brief duties: choose appropriate level for view (`Viewer.md:5`); background large reads, cancel stale work (`Viewer.md:7`); explain which image/data failed and allow another choice (`Viewer.md:7`); large must not freeze, malformed/unavailable must feedback not crash (`Viewer.md:11`); responsive + explain undisplayable data (`brief.md:3`).
- Governing exceptions: ignoring unknown root children is allowed (F-05); empty HCS groups absent is allowed (F-07); editor’s-draft data “will not necessarily be supported” per `S003.txt:25-27`.
- Plan disposition: `Covered` as intent, `Missing` as testable rule. No level heuristic, no cancellation unit, no message content/identity standard.
- Implication: product decisions required: define viewport-scale→`datasets` heuristic (e.g., nearest downsampled ≥ screen resolution; never upscale-selection as success criterion without validation); define background chunk/level load + cancellation on selection/view change; define failure identity (`fileset/image/well/field/level/array path` + `zarr.json` key + expected vs found) and next-action (choose another item). All are plan-level, not format-derived.
- Proposed validation: `UNEXECUTED` — large multilevel fixture; measure interaction freeze, stale-load cancellation, level appropriateness, and failure-message specificity.

## 4. Group 2 — Channel/time/plane display, coordinates, label overlays

### F-10 — `axes`: names, types, and UDUNITS-2 units

- Group: 2. Class: mixed MUST/SHOULD/MAY.
- Normative: `axes` is list of dicts describing physical coordinate space per `S003.txt:167`; each MUST contain `name`, values MUST be unique per `S003.txt:168`; each SHOULD contain `type`, SHOULD be `space`/`time`/`channel` but MAY be other custom strings per `S003.txt:169`; each SHOULD contain `unit`, SHOULD be UDUNITS-2 string per `S003.txt:170`.
- Allowed unit vocabularies: space list (`angstrom`..`zettameter`, 25 values) per `S003.txt:171`; time list (`attosecond`..`zettasecond`, 19 values) per `S003.txt:172`. No channel-unit list is given.
- `axes` used in `multiscales`; length MUST equal image-array dims per `S003.txt:173`.
- Governing exceptions: names arbitrary; custom axis types allowed; `type`/`unit` omissions allowed (SHOULD, not MUST); unknown/custom units allowed by MAY-custom-type logic but SHOULD-vocabulary compliance is then unmet — viewer must not crash, must display raw name/unit.
- Plan disposition: `Partial`. Details panel promises dims/units/coords (`Viewer.md:5`) but no uniqueness check, no custom-type/unit handling.
- Implication: display `name (type, unit)` exactly; validate uniqueness; accept missing/custom with explicit “uncalibrated/custom” labeling; never assume `t/c/z/y/x` names.
- Proposed validation: `UNEXECUTED` — custom names/types, duplicate names, missing/unknown units; verify display + gating.

### F-11 — General `coordinateTransformations`: types, fields, order

- Group: 2. Class: established obligation (general), narrowed for multiscales (F-12).
- Normative: list of dicts mapping between `axes` spaces (e.g., array→physical) per `S003.txt:277-278`; each MUST contain `type` per `S003.txt:279`; `type` MUST be table value per `S003.txt:280-281`; additional fields depend on type per `S003.txt:281`.
- Types: `identity` (default, typically implicit) per `S003.txt:282-283`; `translation` with one of `translation:List[float]` or `path:str`, length defines dims per `S003.txt:284-286`; `scale` with one of `scale:List[float]` or `path:str`, length defines dims per `S003.txt:287-289`. List applied sequentially in order per `S003.txt:293`.
- Governing exceptions: `path` (binary data at container location) form is allowed generally; multiscales narrows allowed types (F-12) but does not explicitly forbid `path` encoding there — treat `path` in multiscales as unresolved (see §6).
- Plan disposition: `Missing`. No transform model in thin plan beyond “calibrated coordinate display” acceptance (`Viewer.md:11`).
- Implication: implement ordered application; support inline lists at minimum; decide `path`-encoded vectors (support vs explicit unsupported message — do not silently treat as identity).
- Proposed validation: `UNEXECUTED` — identity/translation/scale sequences, `path` vectors, out-of-order application check.

### F-12 — Multiscales calibration: per-level + global scale/translation rules

- Group: 2. Class: established obligations with fallback semantics.
- Per-dataset: each MUST contain `coordinateTransformations` mapping data→physical for that level per `S003.txt:308`; MUST only be `translation`/`scale` per `S003.txt:309`; MUST contain exactly one scale specifying pixel size/duration per `S003.txt:310`; if scaling unavailable/inapplicable for an axis, value MUST express inter-level scaling factor, defaulting `1.0` if no downsampling per `S003.txt:310`; MAY contain exactly one translation (origin offset in physical units); if given MUST be after scale per `S003.txt:311`; scale/translation length MUST equal `axes` length per `S003.txt:312`; rationale (simple mapping, compatible with general spec) per `S003.txt:313`.
- Global: `multiscales` dict MAY contain `coordinateTransformations` applied to all levels identically per `S003.txt:314`; MUST follow same type/order rules and are applied after per-dataset transforms per `S003.txt:315`; e.g., constant time scale per `S003.txt:316`.
- Worked example: `t/c/z/y/x` ms/µm, per-level scales `[1,1,0.5,0.5,0.5]→[1,1,1,1,1]→[1,1,2,2,2]` with global `[0.1,1,1,1,1]` per `S003.txt:320-374`.
- Governing exceptions: translation optional; `1.0` fallback is conforming, not an error; global applied after per-level (order matters); only scale+translation allowed here (identity/general-table extension not allowed in multiscales context).
- Plan disposition: `Partial`. “Correctly calibrated coordinates” (`brief.md:3`) and dims/units/coords panel (`Viewer.md:5`) require this, but plan has no scale/translation composition rule.
- Implication: compute `physical = global(scale,translation) ∘ per-level(scale,translation) ∘ index`; display per-axis scale+offset+unit and level identity; when fallback `1.0` used, label axis as relative/downsample-factor not physical where applicable; reject multi-scale/multi-translation or wrong-length vectors with level identity.
- Proposed validation: `UNEXECUTED` — per-level-only, global+per-level, translation-after-scale, fallback-1.0, wrong-length/extra-transform fixtures; verify numeric mapping + labels.

### F-13 — Channel/time/plane selectors derived from axes (not fixed `tczyx`)

- Group: 2. Class: established structure + product decisions.
- Normative structure: 2–3 space + optional time + optional channel/null/custom (F-08) per `S003.txt:301-302`; space `zyx` SHOULD (F-08) per `S003.txt:303`. Array dims ≤5 ordered time→channel/custom→space per `S003.txt:96-98` and `S003.txt:302`.
- Rendering defaults (transitional example, not MUST): `rdefs{defaultT:0, defaultZ:118, model:color|greyscale}` per `S003.txt:419-423`; `channels[]` entries with `active` flag per `S003.txt:403-417`; see F-14 for MUSTs.
- Governing exceptions: any of time/channel/z may be absent (2D `yx` is conforming); custom/null channel-like axis allowed; `defaultT/defaultZ`/`active` are example keys without MUST force in this capture (only `channels/color/window` have MUSTs, F-14); `model` values shown are `color`/`greyscale` but no MUST enumerating them.
- Plan disposition: `Partial` + `Decision`. Plan has channel visibility + time/plane selection “where relevant” (`Viewer.md:5`) — correct conditionality — but no axis→control mapping, no defaults, no custom-axis policy.
- Implication: derive controls from `axes`: channel control iff channel/custom axis present; time slider iff time axis; plane (z) selector iff 3 space axes (or 2 with explicit decision); initial indices from `rdefs.defaultT/defaultZ` and `channels[].active` when present, else documented fallback (e.g., 0/middle) disclosed as viewer choice; custom-axis selector needs product decision (treat as channel vs generic slider).
- Proposed validation: `UNEXECUTED` — 2D, 3D `zyx`, 4D/5D with/without `rdefs`/`active`, custom-axis fixtures; verify control presence, initial index, labels.

### F-14 — `omero` channel rendering (transitional, optional-if-present MUSTs)

- Group: 2. Class: transitional; optional container with MUSTs when present.
- Normative: info under `omero` key per `S003.txt:399-400`; example `id/name/channels[rdefs]` with `active/coefficient/color/family/inverted/label/window{end,max,min,start}` per `S003.txt:401-423`; external detail pointer `OMERO WebGateway documentation` per `S003.txt:424-425` (not in capture).
- MUSTs: optional, but if present MUST contain `channels` array per `S003.txt:426`; each MUST contain `color` 6-hex-digit RGB string per `S003.txt:427`; each MUST contain `window` dict per `S003.txt:428`; `window` MUST contain `min/max` per `S003.txt:429` and `start/end` per `S003.txt:430`.
- Governing exceptions: read support expected/encouraged, write usually optional per transitional rule `S003.txt:60-64`; `re-added improved omero description in PR-191` per `S003.txt:828-830` signals recent churn; non-MUST keys (`family/coefficient/inverted/label/active/rdefs/model/id/name`) are informative in this capture — viewer MAY honor but MUST NOT require.
- Plan disposition: `Partial`. Channel visibility controls (`Viewer.md:5`) overlap `active`/`color`/`window` but plan never names `omero`, `window`, or color model.
- Implication: when `omero` present: validate `channels/color/window` MUSTs; apply `color` + `window[start,end]` within `[min,max]` as initial rendering; honor `active`/`rdefs`/`model` as initial-view hints with local override; when absent: product-decided defaults (e.g., autoscale/grayscale) disclosed as viewer choice; session-local storage per `Viewer.md:9`.
- Uncertainty: `window` semantics beyond min/max/start/end, `family:linear`, `coefficient/inverted` math, and `model` behavior are not normed in S003 — do not present viewer choices as spec-required.
- Proposed validation: `UNEXECUTED` — with/without `omero`, invalid `color`/`window`, `start/end` outside `min/max`; verify initial rendering, overrides, messages.

### F-15 — Labels container: placement, dtypes, listing contract

- Group: 2. Class: established obligations.
- Placement/nature: pixel-annotation arrays in group `labels` per `S003.txt:432`; same coordinate system as source (usually same dims/transforms) per `S003.txt:432-433`; integer label semantics (e.g., 1/0 cell/intercellular) per `S003.txt:434-436`; `labels` nested within image group at same level as resolution levels per `S003.txt:437`; `labels` group is not itself an image; it contains images per `S003.txt:438`.
- Dtypes/intermediates/names: pixels MUST be one of `[uint8,int8,uint16,int16,uint32,int32,uint64,int64]` per `S003.txt:438-439`; intermediate groups between `labels` and images allowed but MUST NOT contain metadata per `S003.txt:439-440`; image names arbitrary per `S003.txt:440`.
- Listing: `labels/zarr.json` MUST contain `labels` array of paths per `S003.txt:441-442`; all label images SHOULD be listed per `S003.txt:442` (example `["cell_space_segmentation"]` per `S003.txt:443-453`; layout example `{"labels":["original/0"]}` per `S003.txt:104-105`; per-dim same-as-image or `1` if irrelevant per `S003.txt:106-108`; intermediates permitted no extra metadata per `S003.txt:110`).
- Governing exceptions: SHOULD-listed (not MUST-all) means unlisted label images are possible; per-dim `1` allowed for irrelevant dims; intermediate metadata absence is MUST-NOT.
- Plan disposition: `Partial`. Optional overlays for associated labels (`Viewer.md:5`) match, but no container path, dtype gate, listing rule, or unlisted-label policy.
- Implication: discover via `labels` array; gate dtypes; allow `1`-sized irrelevant dims; decide unlisted-label scan (allowed but not required); surface non-integer dtype or missing `labels` key as per-label unsupported message.
- Proposed validation: `UNEXECUTED` — each integer dtype + float (reject), intermediates with/without metadata, unlisted image, `1`-dim labels; verify discovery + messages.

### F-16 — Label image structure: multiscales conformance + level-count parity

- Group: 2. Class: established obligations.
- Normative: label-image `zarr.json` MUST implement multiscales spec per `S003.txt:454`; `datasets` MUST have same number of entries (scale levels) as original unlabeled image per `S003.txt:454-455`. Label `zarr.json` is both multiscaled image and labeled image; related-image + display under `image-label` per `S003.txt:113-114`; levels are arrays with only integer values per `S003.txt:116-117`.
- Governing exceptions: name unimportant but registered in `labels` group per `S003.txt:112`; same-count rule is absolute (no sparse-label-pyramid allowance).
- Plan disposition: `Partial`. “Aligned label overlays” acceptance (`Viewer.md:11`) requires this, but plan has no parity/transform-alignment check.
- Implication: enforce same level count; pair label level `i` with image level `i` by `datasets` order (not name); verify same dims/transforms where S003 says “usually” same (treat mismatch as overlay-misalignment risk, warn and offer view without overlay); never resample silently as if conforming.
- Proposed validation: `UNEXECUTED` — parity match/mismatch, transform-mismatched label, non-integer label level; verify pairing, alignment warning, fallback.

### F-17 — `image-label`: colors, properties, source link

- Group: 2. Class: SHOULD-container with MUSTs inside; reader SHOULD-display rule.
- Container: in addition to `multiscales`, SHOULD contain `image-label` object (display colors, source, arbitrary props) per `S003.txt:456-458`; SHOULD contain `colors` (MUST be array for unique values) + `version` (MUST be string schema version) per `S003.txt:458-460`.
- Colors/display: readers SHOULD display using `colors` array per `S003.txt:461`; each entry MUST contain `label-value` MUST integer per `S003.txt:462-463`; MAY contain `rgba` MUST be 4 ints `0..255` (R,G,B + alpha opacity) per `S003.txt:463-466`; additional keys under `colors` allowed per `S003.txt:466`.
- Properties/source: MAY contain `properties` + `source` per `S003.txt:467`; `properties` MUST be array; each MUST contain integer `label-value` + MAY arbitrary kv (keys need not match across values) per `S003.txt:468-471`; `source` MUST be object; MAY include `image` MUST be string relative path to source group, default `../../` per `S003.txt:472-474`.
- Example: 0→`[0,0,128,128]`, 1→`[0,128,0,128]` with `properties[{area,class}...]` + `source{image:../../}` per `S003.txt:475-512`; rendered as 50% color + 50% opacity per `S003.txt:513-514`.
- Governing exceptions: `image-label` SHOULD (absent is conforming); `rgba` MAY (absent needs viewer fallback); `properties`/`source.image` MAY; default source path only a default.
- Plan disposition: `Partial` + `Decision`. Optional overlays (`Viewer.md:5`) + aligned-overlays acceptance (`Viewer.md:11`) cover intent, but no color/opacity/properties/source policy.
- Implication: when present, SHOULD-follow `colors`/`rgba` compositing with alpha; expose `properties` kv in details (do not assume fixed keys); resolve `source.image` (default `../../`) and flag mismatch; when absent, product-decided palette + disclosure; never invent `label-value` meanings (cell vs background is example-only).
- Proposed validation: `UNEXECUTED` — with/without `image-label`/`rgba`, unknown `label-value`, custom property keys, non-default `source.image`; verify colors, opacity, property display, source check.

### F-18 — Read-only session, local display state, and unsupported-data explanation

- Group: 2. Class: brief/plan obligation under norm permissions.
- Norm permissions: transitional write usually optional (MAY) per `S003.txt:60-64`; wide Zarr feature allowance (F-01); reader MAY ignore unknown root children (F-05); SHOULD-listed labels (F-15); SHOULD-display colors (F-17); editor’s draft not necessarily supported per `S003.txt:25-27`.
- Brief/plan duties: files MUST remain unchanged; display settings session-local; editing/export/remote/interpretation out (`brief.md:5`, `Viewer.md:9`); failures explain image/data + allow another choice (`Viewer.md:7`); malformed/unavailable → feedback not crash (`Viewer.md:11`); clearly explain undisplayable data (`brief.md:3`).
- Governing exceptions: read-only is product boundary, not a format prohibition on writing; local settings satisfy transitional “write optional”; ignoring unknown data is allowed but silently dropping listed images/labels/levels is not — explanation required by plan/brief.
- Plan disposition: `Covered` as intent, `Missing` as message standard.
- Implication: enforce read-only open (no `zarr.json`/chunk writes); keep channel/window/level/overlay/position state in session only; standardize unsupported message: identity + reason (norm key + expected vs found) + scope (level/label/image/fileset) + next action. Automated scientific/clinical interpretation stays out even when `properties` suggest classes.
- Proposed validation: `UNEXECUTED` — verify no filesystem modification (hash before/after), session-local persistence only, and message coverage for every MUST-failure in F-01..F-17.

## 5. Applicability and transfer limits

- Single-source bound: all format claims derive from S003 frozen bytes (`sha256:5d8b...`, 36980 B, 896 lines, `https://ngff.openmicroscopy.org/0.5/`). No live spec, no Tools/implementation code (`See Tools` at `S003.txt:814` is a pointer only), no RFC-2, no OMERO WebGateway docs (`S003.txt:424-425` pointer only), no UDUNITS-2 text, no OME-XML text beyond `MetadataOnly` rule.
- Version bound: OME-Zarr `0.5` (Final Report 8 Sept 2026 in-capture; history through `0.5.2`). Do not transfer MUST/SHOULD judgments to `0.4`/`0.3`/editor’s drafts; migration scripts are promised (`S003.txt:25-26`) but not in capture. `bioformats2raw.layout` and `omero` are explicitly transitional and slated for replacement/removal (`S003.txt:60-64,180-181`).
- Layout bound: local-filesystem reading only per brief/plan. S003 HTTP/S3/GCS possibility (`S003.txt:73-77`) does not transfer into a Slide Scout requirement.
- Rendering bound: `omero` non-MUST keys, `model`, `family/coefficient/inverted`, `window` mapping math, multiscale `type`/`metadata` downscaling semantics, and label compositing beyond `rgba` are example/informative — viewer choices there are product decisions, not spec compliance.
- No streaming adapter: per method boundary, chunk-streaming/prefetch design was not researched; F-09 level/responsiveness guidance is plan-duty only.

## 6. Unresolved areas, dead ends, and unvisited scope

All items below are unresolved within the admitted scope. No live search was permitted, so absence of evidence is not evidence of format absence.

- U-01 `path`-encoded scale/translation vectors in multiscales: general spec allows `path:str` (`S003.txt:284-289`); multiscales narrowing (`S003.txt:309-312`) does not explicitly re-allow or forbid it. Viewer support vs explicit-unsupported decision is unresolved. Validation `UNEXECUTED`.
- U-02 OME-XML parsing depth: `MetadataOnly` + minimum-spec allowance (`S003.txt:257-260`) and series↔Image order rule (`S003.txt:267,270`) are clear, but viewer’s required XML coverage (names? pixel sizes? conflict with `multiscales`?) is unresolved. Validation `UNEXECUTED`.
- U-03 `dimension_names` failure mode: MUST-match rule (`S003.txt:174`) lacks a defined repair; strict-reject vs warn-and-proceed is a product decision. Validation `UNEXECUTED`.
- U-04 Unit semantics: SHOULD-vocabulary lists (`S003.txt:171-172`) lack conversion/compound-unit/display-precision rules; UDUNITS-2 text not in capture. No conversion claims made. Validation `UNEXECUTED`.
- U-05 `omero` rendering math: `family/coefficient/inverted/model` and `window`→pixel mapping are not normed in S003; any formula would be unsupported. Validation `UNEXECUTED`.
- U-06 Multiscale `type`/`metadata` downscaling trust: SHOULD-only (`S003.txt:318-319`); no conformance test for `gaussian` example. Viewer must not gate on it. Validation `UNEXECUTED`.
- U-07 Label `1`-sized dims + transform-mismatch overlay: “usually same dims/transforms” (`S003.txt:432-433`) vs per-dim `1` allowance (`S003.txt:106-108`) leaves exact alignment math unresolved. Validation `UNEXECUTED`.
- U-08 Missing-`rgba`/missing-`image-label` palette: fallback colors are product choice (F-17); no normative palette. Validation `UNEXECUTED`.
- U-09 Plate/well `version` vs `ome.version` interaction: independent MUST-strings (F-02/F-06/F-07) with no equality rule; mixed-version handling unresolved. Validation `UNEXECUTED`.
- U-10 CamelCase drift: `maximumfieldcount`/`field_count`/`starttime`/`endtime` predate camelCase SHOULD (`S003.txt:809-812`); exact future renames unknown — implement current spellings exactly. Validation `UNEXECUTED`.
- U-11 Tools/real-fileset interop: `See Tools` (`S003.txt:814`) and “representative filesets” acceptance (`Viewer.md:11`) name no fixture; no implementation was inspected. All interop claims would be unsupported. Validation `UNEXECUTED`.
- U-12 Performance envelope: S003 has no latency/chunk/cache norms; “appropriate level” + “must not freeze” have no numeric acceptance in admitted inputs. Validation `UNEXECUTED`.
- Dead-end/unvisited (within assigned scope, not omitted): none omitted — both brief groups fully traced to S003 sections 1–2.8. Remote/storage-transformer tuning, Zarr codec internals, and clinical interpretation were deliberately unvisited as brief/plan out-of-scope, not as oversights.

## 7. Evaluation-obligation accounting

- Material claims: every MUST/SHOULD/MAY above cites `S003.txt` lines; brief/plan claims cite `inputs/brief.md`, `inputs/TASK.md`, `inputs/plan/Viewer.md`; catalog claims cite `inputs/catalog.json`.
- Full scope incl. dead ends: §3 covers group 1 (`Storage`, `multiscales/datasets`, `bioformats2raw.layout`, `plate`/`well`, dims/order, responsiveness); §4 covers group 2 (`axes`, transforms, channel/time/plane, `omero`, `labels`/`image-label`, read-only/explanation); §6 lists unresolved/dead-end/unvisited explicitly.
- Unsupported assertions: none asserted as fact — §§5–6 mark pointers-only (`Tools`, RFC-2, WebGateway, UDUNITS-2, OME-XML), informative examples, and product decisions. Any rendering formula, performance number, or real-fileset compatibility claim would be unsupported and is not made.
- False dismissals avoided: remote layouts noted as format-possible but product-excluded (not dismissed as nonexistent); `series`/numbered/plate branches all preserved; SHOULD-listed/SHOULD-display treated as allowed-absent, not rejected; custom axes/units treated as displayable-with-disclosure.
- Conditions/source fit: each finding preserves MUST/SHOULD/MAY force, plate precedence, fallback `1.0`, order-after-scale, 0-based indices, alphanumeric/case-sensitive/uniqueness, dtype allowlist, `rgba 0..255`, `../../` default, and transitional read-vs-write asymmetry.
- Novelty: no novel format claim; selection heuristics, palettes, level choice, message strings, and defaults are labeled product decisions. Novelty if any is only in viewer-policy synthesis, not in normative interpretation.
- Costs: no live queries, no code execution, no external writes. Local reads only (see `out/acquisition.json`). All validation `UNEXECUTED`, hence zero validation cost. Elapsed/parent-response consumption is bounded by the 900 s / 96-response Goal budget; this report does not fabricate a measured elapsed time. No streaming-adapter work performed per method boundary.

## 8. Plan-implication summary (thin-plan disposition)

- Add: Zarr v3 open + `ome.version` gate + strict JSON (F-01/F-02); metadata-ordered level navigation (F-03); named-multiscale policy (F-04, Decision); 3-branch collection discovery with plate precedence + first-only avoidance (F-05); plate grid + acquisitions (F-06); well/field grouping + pruning (F-07); dims/order/`dimension_names` gate + conditional selectors (F-08/F-13); ordered transform engine + fallback labeling (F-10/F-11/F-12); `omero` initial rendering + local override (F-14); label dtype/listing/parity/`image-label` pipeline (F-15/F-16/F-17); read-only enforcement + standardized unsupported messages (F-18); testable level heuristic + background/cancel contract (F-09).
- Decide (norm allows either): show-all vs chooser for collections; named-multiscale exposure; `path`-vector support; OME-XML depth; `dimension_names`-mismatch strictness; custom-axis control; absent-`omero`/absent-`image-label` defaults; unlisted-label scan; numeric responsiveness/level rule.
- Keep out: remote storage, editing/export, automated interpretation, streaming adapter (brief/plan/method boundaries).

## 9. Finding-to-evidence index

- F-01: `S003:68-77,82-89,831-833` + `brief:5` + `Viewer:5,9`
- F-02: `S003:65-66,150-165` + `Viewer:11`
- F-03: `S003:91-100,304-307` + `Viewer:5`
- F-04: `S003:298,317-319,375-382,388-397` + `Viewer:5`
- F-05: `S003:60-64,176-181,183-191,193-206,243-275` + `Viewer:5,7`
- F-06: `S003:516-560,561-640,641-739` + `Viewer:5`
- F-07: `S003:118-148,740-808` + `Viewer:5`
- F-08: `S003:81,96-98,300-303,307,174,825-827` + `Viewer:5`
- F-09: `S003:25-27,273-275,306,308-313,877-888` + `brief:3` + `Viewer:5,7,11`
- F-10: `S003:167-173` + `Viewer:5`
- F-11: `S003:277-293` + `Viewer:11`
- F-12: `S003:308-316,320-374` + `brief:3` + `Viewer:5`
- F-13: `S003:96-98,301-303,403-423` + `Viewer:5`
- F-14: `S003:60-64,399-430,828-830` + `Viewer:5,9`
- F-15: `S003:102-108,110,432-453` + `Viewer:5`
- F-16: `S003:112-117,454-455` + `Viewer:11`
- F-17: `S003:456-474,475-514` + `Viewer:5,11`
- F-18: `S003:25-27,60-64,70-72,275,442,461` + `brief:3,5` + `Viewer:7,9,11`

