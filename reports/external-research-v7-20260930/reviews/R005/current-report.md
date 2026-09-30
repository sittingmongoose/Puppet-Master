# Slide Scout — Group 1 research report: opening, listing/selecting, multiscale navigation

- Case: `ome-normative-dev-v1`
- Assigned group: **1. Opening a fileset, listing/selecting images, and navigating multiresolution data** (other group independently assigned; this report is standalone for Group 1)
- Brief: `inputs/brief.md` (Slide Scout, local read-only OME-Zarr 0.5 browser)
- Assignment: `inputs/TASK.md` (whole-brief coverage within assigned source scope; exact line citations; obligations vs optional vs decisions; UNEXECUTED validation)
- Admitted source: `inputs/sources/S003.txt` (S003) only — frozen OME-Zarr 0.5 normative capture, `https://ngff.openmicroscopy.org/0.5/`, `capture-only:5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`, 36980 bytes / 896 lines, spec date 8 September 2026
- Admitted plan: `inputs/plan/Viewer.md` (deliberately thin fixture, 11 lines)
- Method boundary: does not require streaming delivery adapter; small/medium grouping only, not a large parameter sweep
- Source access: only admitted frozen capture; **no live external fetching was performed or claimed**
- Report status: standalone current report; all proposed validation is **UNEXECUTED** unless explicitly evidenced (none was executed)

## 1. Scope — what Group 1 owns and what it does not

This report covers, from the brief (`inputs/brief.md L1-5`):

- finding images within a fileset (discovery/listing/selecting);
- opening a local fileset and remaining responsive on large saved datasets;
- inspecting multiresolution images at the navigation level (pyramid structure, level choice, pan/zoom data access);
- clearly explaining data it cannot display (per-image/per-level failure isolation).

Group 2 (separately assigned) owns channel/time/plane display, calibrated-coordinate details, and label overlays. Where Group 1 touches the interface (axis names/types, transforms, labels discovery, `omero` defaults), this report records the **boundary and handoff** but does not expand Group 2 display semantics.

Out of scope for the case (brief L4; plan L9): image editing, export, remote services/storage, clinical interpretation. Source files must remain unchanged.

A failed search proves only that search result, not absence. This report makes no absence claim from failed live searches because no live searches were run. Coverage statements are scoped to S003 lines actually read (all 896 lines, in windows 1–500 and 500–896).

Task-card and assignment instructions are **not** treated as evidence about the format. All format claims cite S003 lines below.

## 2. How to read this report

- **Finding identities** `OPN-001…OPN-024` are independent to this report (Group 1 namespace). They do not depend on the other group's numbering. The host concatenates both control reports verbatim; there is no shared numbering.
- **Obligation language** follows S003's RFC 2119 rule (`S003 L57-59`, `L868-878`): MUST / MUST NOT / SHALL / SHALL NOT are requirements; SHOULD / SHOULD NOT / RECOMMENDED are strongly encouraged with defined exceptions; MAY / OPTIONAL are truly optional. Lowercase prose without a keyword is not a requirement by itself.
- **Normative vs informative:** all S003 text is normative except sections explicitly marked non-normative, examples, and notes (`S003 L877-888`). JSON examples introduced by “for example” and `Note,` callouts are informative. The multiscale-selection pseudocode at `S003 L388-397` is discussed in OPN-004 because its status is ambiguous.
- **Transitional metadata** (`S003 L60-64`): intended for future removal; readers may be expected (MUST) or encouraged (SHOULD) to support reading, while writing is usually optional (MAY). Both `bioformats2raw.layout` and `omero` are explicitly transitional.
- **Evidence locators** are `S003 L<start>-<end>` against the frozen capture above. Plan locators are `Viewer.md L<n>`. No evaluator keys, historical outputs, or other attempts were read.
- **Grouping:** per the method boundary, findings use small/medium grouping (A: fileset opening; B: listing/selecting; C: multiscale navigation; D: cross-cutting) and do **not** attempt a large parameter sweep over axis combinations, codec combinations, or plate sizes.

## 3. Source and plan inventory (versions preserved)

| Item | Version / identity | Lines read | Role |
|------|--------------------|------------|------|
| S003 frozen capture | `https://ngff.openmicroscopy.org/0.5/` / `capture-only:5d8b2408…8200` / spec 0.5 Final Community Group Report 8 Sept 2026 (`S003 L1-6`, `L25`) | 1–896 (all) | Sole format evidence |
| Catalog | `er7.candidate_case.v1`, `case_id ome-normative-dev-v1` (`inputs/catalog.json L1-4`) | 1–40 (all) | Identity/version only |
| Brief | Slide Scout product brief | 1–4 (all) | Scope/boundary only |
| Assignment | `inputs/TASK.md` fixed scope S003 only, no live fetching (`L5`) | 1–11 (all) | Scope/method only |
| Plan | `Viewer.md` thin synthetic fixture (`L3` self-declared) | 1–11 (all) | Disposition target only |

Spec version history relevant to Group 1 (`S003 L821-833`): 0.5.0 (2024-11-21) moved to Zarr v3 (RFC-2); 0.5.2 clarified that `dimension_names` MUST be included; 0.4.1 added transitional `bioformats2raw.layout`; 0.3.0 added `axes`; 0.2.0 changed chunk separator to `/`; 0.1.4 added HCS; 0.1.3 added labels. A 0.5 reader must therefore expect Zarr v3 layout (`zarr.json`), not Zarr v2 (`.zattrs`/`.zgroup`), and must enforce the `dimension_names` rule.

No source choice beyond S003 was available. The three `local-capture (origin URL not recorded)` aliases in `inputs/catalog.json L22-36` share the same bytes/sha and were not used as independent locators (see `out/acquisition.json`).

## Group A — Opening a fileset

### OPN-001 — Zarr v3 foundation; arbitrary Zarr features allowed (MUST-tolerant open)
**Statement.** An OME-Zarr fileset is a Zarr v3 hierarchy (`zarr.json` per group/array). All Zarr features — codecs, chunk grids, chunk key encodings, data types, storage transformers — MAY be used unless the OME-Zarr spec explicitly disallows them.

**Obligation:** established format permission/constraint. Reader MUST accept Zarr v3 and MUST NOT assume a fixed codec, chunking, dtype, or key encoding.

**Evidence:**

- `S003 L68-72`: “implemented using the Zarr format as defined by version 3 … All features … may be used … unless explicitly disallowed.”
- `S003 L87-100`: image group/array `zarr.json` roles; chunks “conforming to the Zarr array specification … as specified in the array's zarr.json.”
- `S003 L831-833`: 0.5.0 “use Zarr v3.”

**Conditions / qualifications:** S003 does not enumerate a disallowed list in the admitted lines; the operative rule is permissive. Chunk separator `/` history (`S003 L849-851`) confirms v3-style keys.

**Applicability / transfer limits:** applies to every Group 1 open path (single image, collection, plate). It does **not** transfer to Zarr v2 filesets — a v2 fileset is out of the 0.5 contract and must be reported as unsupported, not silently misread. Cloud vs local representation (`S003 L73-77`) transfers structurally, but this case's product boundary is local filesystem only; HTTP/S3/GCS access is explicitly out of scope and MUST NOT be required.

**Plan implication / disposition:** `Viewer.md L5` (“opens a local OME-Zarr 0.5 fileset”) and `L9` (“interoperate with filesets from real 0.5 tools”) **require** a Zarr v3 reader. Gap: the plan does not name Zarr v3, codecs, or chunking. Disposition: **extend plan** — add “open via Zarr v3 `zarr.json`; support arbitrary chunking/codecs or fail per-image with codec/chunk reason; never assume contiguous arrays.” Display settings stay session-local (`Viewer.md L9`); no fileset writes.

### OPN-002 — `ome.version` namespacing and hierarchy-wide consistency (MUST validate)
**Statement.** OME-Zarr metadata lives under `attributes.ome` in `zarr.json` files. `ome.version` is a string (`"0.5"` in examples) and MUST be consistent within a hierarchy.

**Obligation:** MUST-level open validation.

**Evidence:**

- `S003 L149-156`: metadata “stored under the namespaced key `ome` in attributes”; “version … denoted as a string … MUST be consistent within a hierarchy.”
- `S003 L157-165`: example `attributes.ome.version: "0.5"`.
- `S003 L25-27`: current released version is 0.5; editor's-draft data “will not necessarily be supported.”

**Conditions:** S003 does not define the reader action on mismatch (reject hierarchy vs warn vs per-group gate). Consistency is a writer MUST; reader behavior is a product decision constrained by the brief's “clearly explain data it cannot display.”

**Applicability / transfer limits:** applies at every `zarr.json` that carries `ome` metadata (root, plate/row/well, image, labels, OME group). Does not by itself prove conformance — a consistent `"0.5"` string with missing `multiscales`/`plate`/`well` keys is still not an openable image/plate (see OPN-004/009/014).

**Plan implication / disposition:** `Viewer.md L7,L11` (opening failures explain which data could not display; malformed input produces feedback not crash) **partially covers** this but does not name version checks. Disposition: **extend plan** — “on open, read `attributes.ome.version` along the traversed path; on missing/mismatched/unsupported version, block that subtree with `expected 0.5, found <x>/missing at <path>` and keep the rest of the listing usable.”

### OPN-003 — Single-image group shape and arbitrary level names (MUST follow metadata, not names)
**Statement.** A single image is a Zarr group (`123.zarr`, `456.zarr` in the layout figure) whose group `zarr.json` carries `multiscales` (and `omero`). Each pyramid level is a separate Zarr array (folder of chunks). Array names are arbitrary; ordering is defined by `multiscales` metadata, often but not necessarily `0…n`. Dimensionality varies 2–5 and axis names are arbitrary.

**Obligation:** MUST-level discovery rule (follow `datasets[].path` order; do not hardcode names).

**Evidence:**

- `S003 L78-95`: layout; “The name of the array is arbitrary with the ordering defined by … `multiscales` metadata, but is often a sequence starting at 0.”
- `S003 L81`: “number of dimensions is variable between 2 and 5 and … axis names are arbitrary.”
- `S003 L87-89`: group attributes include `multiscales` and `omero`.

**Conditions:** the `123.zarr` / `456.zarr` figure shows sibling images; S003 does not normatively define how a bare directory of sibling `.zarr` groups is enumerated (no root listing key for that shape). The normative multi-image shapes are `bioformats2raw.layout` (OPN-009) and plate/well (OPN-014). A lone `.zarr` group opened directly is the base case.

**Applicability / transfer limits:** transfers to label images too (each label is also a multiscale group, `S003 L112-117`), but labels MUST NOT be listed as primary images (OPN-018). Does not transfer to assuming `0` is highest resolution without reading metadata — `0` is conventionally highest (`S003 L336-366` example) but only `datasets` order is normative (`S003 L304-306`).

**Plan implication / disposition:** `Viewer.md L5` (“lists the images it finds … chooses an available pyramid level”) **assumes** this but does not state arbitrary-name handling. Disposition: **extend plan** — “resolve level arrays only via `datasets[].path` in listed order; support non-numeric names; treat a missing `multiscales` key as ‘not an image group’ with a specific message.”

### OPN-004 — `multiscales` is a list; multiple entries need selection with first-as-fallback (decision + SHOULD-grade fallback)
**Statement.** `multiscales` contains a list of dictionaries, each describing one multiscale image. If only one is provided, use it. Otherwise the user can choose by `name`, using the first multiscale as a fallback.

**Obligation:** mixed. The list shape is MUST-grade (`S003 L298-300`); the selection behavior is a **capability + product decision** (no RFC keyword; example-adjacent prose/pseudocode).

**Evidence:**

- `S003 L294-298`: “`multiscales` contains a list of dictionaries where each entry describes a multiscale image.”
- `S003 L317`: each entry SHOULD contain `name`.
- `S003 L388-397`: “If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback” + loop over `named["name"] == "3D"` else `multiscales[0]`.

**Conditions / uncertainty:** the L388-397 block sits immediately after a JSON example and before §2.5 without an explicit “for example” label, so its normative weight is uncertain. Treat the fallback as RECOMMENDED (SHOULD-grade) rather than MUST. Counterevidence against treating it as MUST: S003's own conformance rule makes labeled examples informative (`S003 L879-883`), and this block uses permissive “can,” not MUST/SHOULD.

**Applicability / transfer limits:** applies whenever an image group carries >1 multiscale entry (e.g., alternative pyramids such as `"3D"`). Does not override OPN-012/OPN-016 choice rules for multi-image filesets — this is intra-group selection, not fileset listing. If `name` is absent (it is only SHOULD), selection-by-name degrades to index/first.

**Plan implication / disposition:** `Viewer.md L5` (“lists the images it finds … Selecting an image opens a canvas”) does not distinguish fileset-level listing from intra-group multiscale choice. Disposition: **extend plan** — “when an image group has one multiscale, open it; when >1, offer a by-name choice defaulting to the first; surface the chosen `name` in the details panel. Log which entry was auto-chosen when the user did not choose.”

### OPN-005 — Axes shape, ordering, and `dimension_names` match (MUST validate; custom types allowed)
**Statement.** Each `multiscales` entry MUST carry `axes` (2–5 entries) equal in length/order to the array dimensionality: 2–3 `type:space` entries, optionally one `type:time` first and one `type:channel`/null/custom second, then space. `dimension_names` MUST be present in each level's array `zarr.json` and MUST match `axes` names. Axis `name`s MUST be unique; `type` SHOULD be space/time/channel but MAY be custom; `unit` SHOULD be a UDUNITS-2 string where given.

**Obligation:** MUST-grade validation for length/order/count/`dimension_names`; SHOULD-grade for `type`/`unit` vocabularies; explicit permission for custom axis types.

**Evidence:**

- `S003 L299-303`: axes length 2–5 = array dimensionality; composition and `time → channel/custom → space` order MUST.
- `S003 L303`: three spatial axes with plane `yx` + stacking `z` SHOULD be ordered `zyx`.
- `S003 L167-174`: `name` MUST unique; `type` SHOULD be space/time/channel but MAY be custom; `unit` SHOULD be UDUNITS-2; length MUST equal array ndim; `dimension_names` MUST be included and MUST match `axes` names.
- `S003 L170-172`: space/time unit vocabularies.
- `S003 L826-827`: version history confirms the `dimension_names` MUST.

**Conditions:** custom/null channel-like axes are conforming; unknown `type` or missing `unit` MUST NOT by itself reject the image. Missing `dimension_names`, length mismatch, or wrong type order are MUST violations and support a cannot-display finding for that image/level.

**Applicability / transfer limits:** Group 1 owns structural validation and navigation consequences (which axes are navigable as time/plane-like vs spatial). Calibrated unit interpretation and channel rendering are Group 2. The SHOULD-grade `zyx` ordering is a writer recommendation; readers MUST follow actual `axes` order, not assume `zyx`.

**Plan implication / disposition:** `Viewer.md L5` (dimensions, units, coordinates; time-point and plane selection “where relevant”) and `L11` (calibrated display) **need** this validation but do not name it. Disposition: **extend plan** — “validate axes vs `dimension_names` on open; derive plane/time controls from actual axis names/types (including custom); block with `axes/dimension_names mismatch at <path>` rather than guessing.”

### OPN-006 — `datasets[].path` ordering and dimensionality correspondence (MUST)
**Statement.** Each multiscale MUST list `datasets` (one dict per level) with `path` relative to the image group, ordered largest (highest resolution) to smallest. Every level MUST have the same ndim (≤5), matching `axes` count/order.

**Obligation:** MUST-grade navigation contract.

**Evidence:**

- `S003 L304-307`: `datasets` required; `path` relative; MUST be ordered largest→smallest; same ndim ≤5; count/order MUST correspond to `axes`.
- `S003 L96-98`: “All image arrays must be up to 5-dimensional with … time before … channel, before spatial axes.”

**Conditions:** S003 does not fix a downsampling factor or level count. “Largest→smallest” is a resolution ordering, not a byte-size ordering; level choice must use it together with scale vectors (OPN-007), not chunk/file sizes.

**Applicability / transfer limits:** applies to primary images and label images (labels MUST have the same number of levels as the source, `S003 L454-455` — Group 1 uses this only to avoid misaligned navigation; overlay alignment is Group 2). A level whose array is missing, unreadable, or has wrong ndim invalidates that level; whether the whole image is blocked or degraded to remaining levels is a product decision (recommend per-level degradation with explicit notice, per brief's “explain data it cannot display”).

**Plan implication / disposition:** `Viewer.md L5` (“chooses an available pyramid level appropriate for the current view”) directly depends on this ordering. Disposition: **clarify plan** — “level order is `datasets` order, not numeric filename order or file size; handle gaps/unreadable levels by degrading to the nearest usable level and naming the skipped `path`.”

### OPN-007 — Per-level and group-level coordinate transforms constrain level choice (MUST parse; path-form is a support decision)
**Statement.** Every `datasets` entry MUST carry `coordinateTransformations` mapping data to physical coordinates: only `scale`/`translation` types, exactly one `scale`, optionally exactly one `translation` listed after `scale`, each vector length = `axes` length. A multiscale MAY also carry group-level transforms applied after (on top of) the per-level ones. If scaling is unavailable/inapplicable for an axis, the value MUST express the inter-level scaling factor, defaulting to 1.0 when there is no downsampling along that axis. Transform vectors may be inline `List[float]` or binary `path` references.

**Obligation:** MUST-grade parse/validate for navigation; support for `path`-form vectors is an explicit product/implementation decision (spec permits both forms).

**Evidence:**

- `S003 L308-313`: per-level requirements (types, exactly one scale, optional translation after scale, lengths).
- `S003 L314-316`: group-level transforms “applied after them”; same type/order rules; e.g., constant scale shared across levels.
- `S003 L310-311`: 1.0 / inter-level-factor fallback rule.
- `S003 L276-293`: general transform list, sequential application; `translation`/`scale` each “one of: `<vec>:List[float], path:str`”; identity is default and typically implicit.
- `S003 L336-374`: example with per-level scales `[1,1,0.5…]→[1,1,1…]→[1,1,2…]` plus group-level time scale `[0.1,1,1,1,1]`.

**Conditions:** scale vectors compose multiplicatively across per-level and group-level entries (example: time 1.0 × 0.1). Readers MUST apply group-level transforms; ignoring them miscomputes level selection and pan/zoom mapping. Translation, when present, is in physical coordinates because it follows scale. S003 does not define a level-selection algorithm — “appropriate for the current view” is implementation-defined.

**Applicability / transfer limits:** Group 1 uses transforms for **level choice and view mapping** (which level matches the viewport, how far a pan/zoom step moves in data vs physical space). Calibrated readout formatting is Group 2. `path`-form vectors (binary data at a location in the container) are conforming; a viewer that only implements inline lists MUST report `path`-form levels as unsupported with the `path` value, not as malformed. No evidence in S003 was found for other transform types at multiscale levels — encountering one is a MUST violation for that level.

**Plan implication / disposition:** `Viewer.md L5` (“pan and zoom … chooses an available pyramid level”) and background/cancel behavior (`L7`) assume correct level math but do not name transforms. Disposition: **extend plan** — “compose per-level + group-level scale/translation for level choice; never assume uniform 2× downsampling; define and document the level-pick rule (e.g., nearest resolution ≥ screen resolution, preferring the listed order); treat `path`-form transforms as a named unsupported case until implemented.”

### OPN-008 — Multiscale `name` / `type` / `metadata` are SHOULD-grade hints (must not gate opening)
**Statement.** Each multiscale SHOULD carry `name`, SHOULD carry downscaling-method `type`, and SHOULD carry a `metadata` dict with method details. None is required to open or navigate.

**Obligation:** optional capability / display hint; MUST NOT gate opening.

**Evidence:**

- `S003 L317-319`: three SHOULD statements for `name`/`type`/`metadata`.
- `S003 L375-382`: example `type: gaussian` + `metadata` (`method`, `version`, `args`, `kwargs`).

**Conditions:** absence or unknown `type` values are conforming. `metadata` shape depends on the downscaling implementation.

**Applicability / transfer limits:** `name` transfers to Group 1 selection UI (OPN-004); `type`/`metadata` transfer only to an informational details field. They do not affect level ordering or transform math.

**Plan implication / disposition:** `Viewer.md L5` details panel (“dimensions, units and coordinates”) can show these when present. Disposition: **minor add** — “display `name`/`type` when present; never block on their absence; do not interpret `type` as a quality or compatibility signal.”

## Group B — Listing and selecting images

### OPN-009 — Multi-image `bioformats2raw.layout` fileset shape (transitional MUST/SHOULD read support)
**Statement.** A converted multi-image fileset (`series.ome.zarr`) carries top-level `bioformats2raw.layout: 3`, an `OME` group (`OME/METADATA.ome.xml` + optional `series` list), and image groups (`0`, `1`, …). This layout is transitional (added in v0.4 for filesets already in the wild; a future NGFF spec will replace it with explicit metadata).

**Obligation:** transitional read support — implementations are expected/encouraged to read it (MUST/SHOULD-grade per `S003 L60-64`), writing is MAY. For Slide Scout's “interoperate with real 0.5 tools” goal, treat read support as required.

**Evidence:**

- `S003 L175-181`: transitional rationale; “added to v0.4 … to specify filesets that already exist in the wild. An upcoming NGFF specification will replace this layout.”
- `S003 L183-191`: canonical layout figure.
- `S003 L193-203`: top-level `bioformats2raw.layout: 3` example.
- `S003 L256`: conforming groups MUST have value `"3"`.

**Conditions:** the value is the integer `3` in examples (`S003 L200`, `L213`) despite L256's quoted `"3"` prose — readers SHOULD accept numeric `3` and tolerate string `"3"` defensively; writer MUST emit the conforming value. The layout coexists with plates only via precedence (OPN-011), not mixing.

**Applicability / transfer limits:** applies when the opened root carries `bioformats2raw.layout`. It does not apply to bare single-image groups or pure plate hierarchies without that key. Because it is transitional, the viewer MUST isolate this discovery path so a future explicit-metadata replacement can supersede it without rewriting plate/single-image paths.

**Plan implication / disposition:** `Viewer.md L5,L9` (“lists the images it finds”; “interoperate with filesets from real tools”) silently require this path but do not name it. Disposition: **extend plan** — “detect `bioformats2raw.layout` at root; list via OPN-010 resolution order; keep the adapter transitional and version-gated.”

### OPN-010 — Bioformats2raw image-enumeration order: `series` then consecutive numbering (MUST/SHOULD/MAY)
**Statement.** Discovery follows: (a) if `plate` metadata is present, images MUST be located via plate (OPN-011); (b) else if the `OME` group has a `series` attribute, it MUST be a list of string paths to image groups in `OME-XML Image` order; matching `series` SHOULD be provided for plate-unaware tools; readers MAY use `series` to determine the display list; (c) else (no `series`, no `plate`), images MUST be consecutively numbered groups from `0` (`0/`, `1/`, …); every `multiscales` group MUST correspond to exactly one OME-XML `Image` in series/group-number order.

**Obligation:** mixed MUST (writer layout + correspondence) / SHOULD (provide `series`) / MAY (reader use of `series`).

**Evidence:**

- `S003 L261-270`: enumeration logic; `series` MUST be `List[str]` paths; order MUST match `Image` elements; fallback to consecutive numbering.
- `S003 L243-253`: `OME/series: ["0","1"]` example.
- `S003 L262-263`: plate-located images; SHOULD provide matching `series`.
- `S003 L273`: readers MAY use `series` for the display list.

**Conditions:** `series` paths are relative to the fileset root in examples; S003 does not explicitly state the base, but root-relative is the only consistent reading with `0/1/…` fallback. If `series` lists a path that is missing or not a `multiscales` group, that entry is unopenable but MUST NOT invalidate the whole listing (brief: explain per-image failures).

**Applicability / transfer limits:** transfers only within `bioformats2raw.layout` roots without plate precedence. It does not license scanning arbitrary subdirectories as images — the normative sources are `series` or consecutive numbering. `MAY ignore other groups or arrays under root` (`S003 L275`) explicitly permits ignoring extras.

**Plan implication / disposition:** `Viewer.md L5,L7` (list; per-image failure + choose another) align with this rule. Disposition: **extend plan** — “implement `plate → series → consecutive-scan` precedence; stop consecutive scan at the first missing number; list each resolvable entry with its `series`/number identity; on unresolvable entries show `series[<i>] → <path>: <reason>` and continue.”

### OPN-011 — Plate precedence over collection layout; no mixing (MUST)
**Statement.** If the top-level group represents a plate, `bioformats2raw.layout` will be present but the `plate` key MUST also be present, takes precedence, and parsing MUST follow plate metadata. Mixing collections of images with plates is not possible at present.

**Obligation:** MUST-grade precedence rule.

**Evidence:**

- `S003 L204-206`: plate key MUST also be present, takes precedence, follow plate; “not possible to mix.”
- `S003 L207-242`: combined `bioformats2raw.layout: 3` + `plate` example.
- `S003 L262`: “If `plate` metadata is present, images MUST be located at the defined location.”

**Conditions / uncertainty:** S003 does not define behavior when `plate` and `series`/numbered groups disagree (e.g., `series` lists paths outside wells). The only normative instruction is plate precedence. Recommended handling: follow plate; surface the disagreement as a warning naming both locators; do not merge the two lists.

**Applicability / transfer limits:** applies only when both keys are present at the root. A pure plate without `bioformats2raw.layout` follows plate rules directly (OPN-014–017) with no precedence question.

**Plan implication / disposition:** plan does not name plates vs collections. Disposition: **extend plan** — “if root has `plate`, enter plate mode regardless of `bioformats2raw.layout`; document that collection+plate mixing is unsupported and report mixed-layout filesets as plate-first with a visible precedence note.”

### OPN-012 — Multi-image reader choice duties: warn, offer choice, never silently open only the first (SHOULD NOT / MAY)
**Statement.** Conforming readers SHOULD make users aware of >1 image (SHOULD NOT default to only opening the first); MAY use `series` for the list; MAY show all images or offer a choice as with HCS plates; MAY ignore other root groups/arrays.

**Obligation:** SHOULD-grade user-awareness duty; MAY-grade presentation choice.

**Evidence:** `S003 L271-275` (all four reader rules in one block).

**Conditions:** SHOULD NOT means the viewer MUST offer multi-image awareness except with a documented justification and a visible alternative (e.g., explicit “open first only” user preference still shows the count and a switcher). MAY-ignored root extras SHOULD still be discoverable in a details/diagnostics view to satisfy “clearly explain data it cannot display,” even though ignoring them is conforming.

**Applicability / transfer limits:** written for `bioformats2raw.layout` collections but explicitly analogized to HCS plates (“as with HCS plates”), so the choice pattern transfers to plate/well/field selection (OPN-014–017). It does not require rendering thumbnails or preloading all images — listing + on-demand open satisfies the rule and preserves responsiveness (OPN-022).

**Plan implication / disposition:** `Viewer.md L5` (“lists the images … Selecting an image opens a canvas”) and `L7` (“allow the user to choose another item”) **satisfy** the SHOULD when implemented as a persistent list/switcher. Disposition: **confirm plan, add acceptance** — “acceptance MUST include a >1-image fileset asserting the viewer does not auto-lock to the first image and always shows count + switcher; ignoring root extras is allowed but MUST be diagnosable.”

### OPN-013 — `OME/METADATA.ome.xml` presence and `MetadataOnly` constraint (SHOULD/MUST on the file; reader parse is a decision)
**Statement.** Conforming `bioformats2raw.layout` groups SHOULD carry `OME/METADATA.ome.xml` for the whole collection. When present it MUST adhere to OME-XML, MUST use `<MetadataOnly/>` (not `<BinData/>`/`<BinaryOnly/>`/`<TiffData/>`), and MAY use the minimum specification.

**Obligation:** writer SHOULD/MUST; viewer parsing of OME-XML for Group 1 listing is a **product decision** (S003 provides `series`/numbered fallbacks that avoid parsing).

**Evidence:**

- `S003 L257-260`: SHOULD-have + MUST-adhere + MUST-`MetadataOnly` + MAY-minimum.
- `S003 L177-179`: Bio-Formats strict stable ordering rationale for the collection wrapper.
- `S003 L267,270`: `series`/group order MUST match `Image` element order “if provided” — implying OME-XML may be absent.

**Conditions:** “if provided” explicitly permits absence. A viewer that does not parse OME-XML still satisfies discovery via OPN-010(b–c). A viewer that does parse MUST expect `MetadataOnly` and MUST NOT require embedded binary payloads.

**Applicability / transfer limits:** does not transfer to plate-mode discovery (plate/well keys are authoritative there). OME-XML `Image` names, if parsed, transfer only to display labels, not to path resolution.

**Plan implication / disposition:** plan never mentions OME-XML. Disposition: **product decision required** — recommended: “Phase 1: do not parse OME-XML; list via `series`/numbering and label entries `Image <series-index> (<path>)`; show `OME/METADATA.ome.xml: present/absent` in details. Phase 2 (optional): parse `Image` names for labels only, still resolving paths via `series`/numbering. Never write or modify the XML (read-only boundary).”

### OPN-014 — HCS container chain: plate → row → well → field (MUST structure; SHOULD NOT create empties)
**Statement.** HCS datasets MUST define three groups above images: well (MUST implement well spec; images in a well are fields of view of that well), row-of-wells, plate (MUST implement plate spec; 2-D row×column collection). A row group SHOULD NOT be present when it has no images; a well group SHOULD NOT be present when it has no images.

**Obligation:** MUST-grade container semantics; SHOULD-NOT-grade sparseness hint.

**Evidence:**

- `S003 L119-127`: three-group MUST chain; well/plate MUST implement their specs.
- `S003 L128-129`: SHOULD-NOT presence rules for empty rows/wells.
- `S003 L131-148`: canonical `5966.zarr/A/1/0` layout with `zarr.json` per level, resolution levels + optional `labels` under each field.

**Conditions:** SHOULD NOT is about what writers store; readers MUST still handle violations gracefully (present-but-empty row/well; see OPN-015 sparse handling). Row groups carry no dedicated metadata key in the admitted lines (only `zarr.json` presence in the figure) — discovery enters rows via the plate `wells[].path` prefix, not via row metadata.

**Applicability / transfer limits:** applies to every plate-mode open. It does not license treating a field (`…/A/1/0`) as a standalone image outside its well/plate context for listing purposes — the field's display identity includes well + acquisition (OPN-016–017). Sibling `.zarr` files outside the plate hierarchy are not part of the plate.

**Plan implication / disposition:** `Viewer.md L5` (“lists the images it finds”) underspecifies HCS depth. Disposition: **extend plan** — “in plate mode, present a plate → well → field drill-down (not a flat image list); derive the tree from `plate.wells` + `well.images`, not from directory scans; tolerate present-but-empty rows/wells by showing them as empty with a SHOULD-NOT note rather than an error.”

### OPN-015 — Plate metadata: grid completeness vs sparse wells list; strict path/index linkage (MUST)
**Statement.** `plate` MUST list every physical row and column (even empty ones) with alphanumeric, case-sensitive, unique names; MUST list `wells` present in the fileset; MUST carry `version`; SHOULD carry `field_count` (max fields per view across wells) and `name`; MAY carry `acquisitions`. Each `wells[]` entry MUST give `path: "<row>/<column>"` with no extra leading/trailing directories, plus 0-based `rowIndex`/`columnIndex`; all three MUST agree. Filesystems are case-sensitive for these names; writers SHOULD avoid case-insensitive collisions.

**Obligation:** MUST-grade discovery/validation contract; SHOULD-grade hints for capacity planning and collision avoidance.

**Evidence:**

- `S003 L530-537`: `columns` MUST complete; name MUST alphanumeric/case-sensitive/unique; SHOULD avoid `Aa`/`aA` collisions.
- `S003 L542-549`: same MUST/SHOULD set for `rows`.
- `S003 L552-560`: `wells` MUST with strict `path` shape and 0-based consistent triple.
- `S003 L538-541`: SHOULD `field_count` (positive int) and SHOULD `name`.
- `S003 L518-529`: MAY `acquisitions` with MUST `id ≥ 0`, SHOULD `name`/`maximumfieldcount`, MAY `description`/`starttime`/`endtime` epoch ints.
- `S003 L561-640`: dense example (2×3, 6 wells, `field_count: 4`); `S003 L641-739`: sparse example (8×12 grid, 2 wells `C/5`,`D/7`, `field_count: 1`).

**Conditions:** `rows`/`columns` define the grid shape; `wells` defines existence. A dense UI MUST render the full grid (including empty cells) while only opening listed wells. `field_count` vs per-acquisition `maximumfieldcount` are capacity hints, not enumeration sources — enumeration is `well.images`. Index/path disagreement is a MUST violation for that well entry.

**Applicability / transfer limits:** local case-sensitivity matters: on case-insensitive local filesystems (macOS/Windows defaults), `Aa` vs `aA` rows/columns or well paths can collide on disk even when the metadata is conforming. The viewer MUST resolve paths case-sensitively and report collisions as filesystem-unsupported rather than silently merging wells. `version` values for plate/well specs are required strings but their vocabularies are not enumerated in S003 — accept any string, display it, and gate behavior only on `ome.version` (OPN-002).

**Plan implication / disposition:** plan has no plate-grid concept. Disposition: **extend plan** — “plate view = full row×column grid from `rows`/`columns` with only `wells[]` cells openable; validate `path`↔`rowIndex`↔`columnIndex` per well and quarantine mismatched entries with `well <path>: index/path mismatch`; surface `field_count`/`name`/`version` in details; document case-sensitivity behavior on macOS/Windows.”

### OPN-016 — Well metadata: field enumeration and acquisition linkage (MUST)
**Statement.** Each well group MUST carry `well.images[]` enumerating its fields of view. Each entry MUST have an alphanumeric, case-sensitive, unique `path` (relative to the well group); when the plate has multiple acquisitions it MUST also carry `acquisition` matching a plate acquisition `id`. `well` SHOULD carry `version`.

**Obligation:** MUST-grade field discovery.

**Evidence:**

- `S003 L740-752`: well key location; MUST `images[]`; MUST `path` constraints; MUST `acquisition` when multiple; SHOULD `version`.
- `S003 L753-784`: 4-field well split across acquisitions 1 and 2.
- `S003 L785-808`: 2-field well using acquisitions 0 and 3 of four — proving ids need not be contiguous or ordered.

**Conditions:** single-acquisition plates MAY omit `acquisition` per entry (the MUST is conditional on “multiple acquisitions”). `path` values in examples are `0…3` but any conforming alphanumeric string is allowed — readers MUST NOT assume numeric sequencing at well level (unlike the bioformats2raw no-`series` fallback, which does assume `0…n`).

**Applicability / transfer limits:** the well `path` + plate well `path` compose the field identity (`A/1/0`). Label groups under a field (`…/0/labels`, `S003 L145`) are not fields — see OPN-018. Acquisition ids are plate-scoped integers; Group 1 uses them for grouping/filtering, not for rendering.

**Plan implication / disposition:** `Viewer.md L5,L11` (list; representative filesets incl. navigation) require this enumeration. Disposition: **extend plan** — “list fields strictly from `well.images[].path` in listed order; require `acquisition` only when the plate declares >1 acquisition; on missing/non-image `path`, quarantine that field (`well <well-path> field <path>: <reason>`) and keep siblings openable; expose acquisition as a grouping/filter facet.”

### OPN-017 — Acquisitions are plate-scoped capacity/identity facets (MUST `id`; SHOULD/MAY rest)
**Statement.** Plate `acquisitions[]` (when present) defines acquisition identities referenced by well fields. Each entry MUST have a unique integer `id ≥ 0`; SHOULD have `name` and positive-int `maximumfieldcount`; MAY have `description` and integer epoch `starttime`/`endtime`.

**Obligation:** MUST for `id` linkage; SHOULD/MAY for the rest (display/capacity hints).

**Evidence:**

- `S003 L518-529`: full acquisition object contract.
- `S003 L748-750`: well entries MUST carry `acquisition` matching a plate object when multiple acquisitions exist.
- `S003 L570-583`, `L650-657`: examples with ids 1–2 and id 1; `S003 L795-803`: ids 0 and 3 proving non-contiguity.

**Conditions:** a plate MAY omit `acquisitions` entirely (the key is MAY). When omitted or singular, Group 1 MUST NOT require acquisition facets. `maximumfieldcount`/`field_count` disagreements are hint conflicts, not open blockers — enumeration always wins.

**Applicability / transfer limits:** Group 1 uses acquisitions only for listing/grouping/filtering and for validating well references. Acquisition timing semantics (`starttime`/`endtime` epoch millis in examples) and any temporal navigation are Group 2 / product decisions. Dangling `acquisition` references (no matching plate id) are MUST violations for that field entry.

**Plan implication / disposition:** plan has no acquisition concept. Disposition: **extend plan** — “when `acquisitions` is present, show it as a filter/group facet (`Acq <id>: <name>`); validate references; quarantine dangling references per-field; when absent, omit the facet without warning.”

### OPN-018 — `labels` groups are not primary images; intermediate nesting carries no metadata (MUST exclude from listing)
**Statement.** The `labels` group nested in an image group (at the same hierarchy level as resolution arrays) is not itself an image — it contains label images. Label pixels MUST be integer dtypes; intermediate groups between `labels` and a label image are allowed but MUST NOT contain metadata; label names are arbitrary; the `labels`-group `zarr.json` MUST carry `labels: [<path>,…]` and all label images SHOULD be listed there; each label image MUST implement `multiscales` with the same level count as its source image.

**Obligation:** MUST-grade exclusion rule for Group 1 listing (even though overlay rendering is Group 2).

**Evidence:**

- `S003 L102-117`: `labels` container figure; intermediate folders “permitted but not necessary and currently contain no extra metadata”; label arrays integer-only.
- `S003 L431-442`: `labels` group “is not itself an image; it contains images”; MUST integer dtypes (`uint8…int64`); intermediate groups MUST NOT contain metadata; `labels` key MUST list paths; SHOULD list all.
- `S003 L454-455`: label `multiscales` MUST have same number of `datasets` entries as the source image.
- `S003 L145`: `labels` under each HCS field (optional).

**Conditions:** arbitrary intermediate nesting means discovery MUST resolve label images via the `labels[]` path list, not via directory enumeration. A `labels`-group entry pointing at a missing/non-multiscale group is a label-discovery failure, not a primary-image failure.

**Applicability / transfer limits:** Group 1 owns: excluding `labels` (and `OME`, row containers) from the primary image/field count; resolving `labels[]` paths for handoff to Group 2. Group 2 owns: `image-label` colors/properties/source semantics (`S003 L456-514`), integer-value rendering, and alignment. The same-level-count MUST is the navigation-alignment contract between the groups.

**Plan implication / disposition:** `Viewer.md L5` (“optional overlays for associated label images”) requires Group 1 to discover without double-counting. Disposition: **extend plan** — “never list `labels`, `OME`, or intermediate label folders as openable images; resolve overlays only via `labels[]`; pass `label path + level count + source-image link` to the overlay layer; report unresolvable label entries in details, not as image-open failures.”

## Group C — Multiresolution navigation mechanics

### OPN-019 — Chunks are per-array Zarr storage; partial reads enable responsive navigation (Zarr-delegated)
**Statement.** Each pyramid level is a Zarr array (folder of chunk files) whose chunking is defined by that array's `zarr.json` per the Zarr array specification. S003 defines no Slide Scout loading algorithm; responsive navigation is achieved by reading only the chunks needed for the current view/level.

**Obligation:** implementation requirement delegated to Zarr (no OME-Zarr MUST on chunk shapes); product MUST (brief/plan) on responsiveness.

**Evidence:**

- `S003 L91-100`: levels as separate arrays; “Chunks are stored conforming to the Zarr array specification … as specified in the array's `zarr.json`.”
- `S003 L68-72`: chunk grids/key encodings/codecs are generic Zarr features.

**Conditions:** chunk shapes may differ per level; S003 does not promise uniform or aligned chunking. Level choice (OPN-006/007) and chunk-window reads are independent decisions that combine for pan/zoom performance.

**Applicability / transfer limits:** transfers to all levels of primary and label images. Does not transfer to requiring full-array reads — a viewer that loads whole levels to navigate violates the brief's responsiveness goal even if the output is pixel-correct. Codec support limits (OPN-001) surface here as per-chunk/per-level failures.

**Plan implication / disposition:** `Viewer.md L5,L7,L11` (“chooses an available pyramid level”; “large reads run in background … cancels stale work”; “large dataset must not freeze”) **cover** the requirement at the right level. Disposition: **confirm plan, add mechanism** — “implement view-driven chunk-window reads per selected level; never full-array load for navigation; cancel superseded chunk/level loads on view change; budget acceptance with a level whose full array exceeds memory.”

### OPN-020 — Level-selection and pan/zoom math must compose ordering + transforms; algorithm is implementation-defined
**Statement.** The spec fixes the inputs to navigation (ordered `datasets`, per-level + group-level scale/translation, chunked arrays) but does not fix the level-pick rule, pan/zoom interpolation, or prefetch policy. Those are implementation/product decisions constrained by correctness (right level for the view) and responsiveness.

**Obligation:** product/implementation decision within MUST-grade input contracts.

**Evidence:**

- Ordering MUST: `S003 L304-306` (OPN-006).
- Transform MUSTs + composition: `S003 L308-316`, `L293` sequential application (OPN-007).
- No level-pick algorithm in S003's 896 lines (the only selection pseudocode concerns multiscale-entry choice, `S003 L388-397`, not pyramid-level choice).
- Downscaling `type`/`metadata` are SHOULD-grade hints (`S003 L317-319`), not selection inputs.

**Conditions:** correct implementations MUST at minimum: (a) map viewport extent through composed transforms to pick a level whose resolution meets/exceeds display need per the documented rule; (b) keep the mapping stable across adjacent levels (no coordinate jumps beyond the transform-defined difference); (c) degrade gracefully when the ideal level is unreadable (OPN-006/023).

**Applicability / transfer limits:** Group 1 owns the rule definition and its Group 1 inputs. Translation offsets and anisotropic (`z` vs `yx`) handling feed both Group 1 (which data to fetch) and Group 2 (how to place/read out coordinates) — the two groups MUST share one transform-composition implementation. `omero` defaults (`defaultT`/`defaultZ`, `S003 L419-423`) are Group 2 initial-view hints, not Group 1 level inputs.

**Plan implication / disposition:** `Viewer.md L5` (“pan and zoom … chooses an available pyramid level appropriate for the current view”) states the decision without defining it. Disposition: **decision required + acceptance** — “document the level-pick rule (e.g., highest listed level whose effective voxel size ≤ screen pixel size at current zoom, clamped to readable levels); acceptance MUST assert rule conformance on a 3-level fixture with non-2× factors plus translation, not just a 2× fixture.”

## Group D — Cross-cutting open/list/navigate rules

### OPN-021 — Strict-JSON and naming-style limits on what the viewer can assume (MUST NOT write comments; reader tolerance is a decision)
**Statement.** JSON comments in examples are clarity-only and MUST NOT be included in JSON objects. Multi-word keys SHOULD use camelCase, but pre-existing keys are grandfathered and will be updated in due course. Examples/notes are informative.

**Obligation:** writer MUST NOT (comments); SHOULD with exceptions (naming); reader tolerance for comments is an **explicit product decision**.

**Evidence:**

- `S003 L65-66`: comments clarity-only; MUST NOT be included.
- `S003 L809-812`: camelCase SHOULD + grandfather clause (explains `field_count` vs `rowIndex` coexistence).
- `S003 L877-888`: normative/informative split; `S003 L57-59`, `L868-876`: RFC 2119 + readability (lowercase keywords still normative).

**Conditions:** a fileset containing JSON comments violates a writer MUST. S003 does not state whether readers MUST reject or MAY tolerate it. Strict parsing (reject with a clear `invalid JSON at <zarr.json path>: <reason>` message) is the conforming-safe default; lenient parsing risks masking corruption and MUST at least warn with the exact path.

**Applicability / transfer limits:** applies to every `zarr.json` read (root, OME, plate/row/well, image, labels, array). Naming-style tolerance cuts the other way: readers MUST accept both `field_count` (`S003 L538`, `L595`) and camelCase keys as written — MUST NOT normalize or alias keys when reading. `plate.version`/`well.version` strings MUST be accepted opaquely (OPN-015/016).

**Plan implication / disposition:** `Viewer.md L7,L11` (understandable feedback, no crash) require the strict-with-clear-message behavior but do not name JSON failure modes. Disposition: **extend plan** — “use strict JSON parsing for all `zarr.json`; report file path + parser reason; never guess at commented JSON; accept exact spec key spellings including `field_count`.”

### OPN-022 — Local read-only boundary; no streaming adapter required (product MUST; spec allows more)
**Statement.** The case boundary is local-filesystem, read-only browsing: source files remain unchanged; display settings are session-local; remote storage, editing, export, and interpretation are out of scope. The spec itself permits HTTP/S3/GCS storage and full Zarr write features, but this viewer MUST NOT require or implement them for Group 1.

**Obligation:** product MUST (brief/plan) overriding spec MAY (remote/write).

**Evidence (product boundary):**

- `inputs/brief.md L4`: “current product boundary is local filesystem reading. Source files must remain unchanged. Image editing, export, remote services and clinical interpretation are outside.”
- `Viewer.md L9`: “Source files remain unchanged; display settings are local … Image editing, export, remote storage and automated … interpretation are outside.”
- Task method boundary: “Does not require the streaming delivery adapter.”

**Evidence (spec permission, not requirement):**

- `S003 L73-77`: hierarchy “as it would appear locally but could equally be stored on a web server … or in object storage like S3 or GCS.”
- `S003 L60-64`: writing transitional metadata is usually MAY (reader-only suffices).

**Conditions:** read-only MUST hold even for diagnostics — no sidecar writes into the fileset, no `zarr.json` repairs, no thumbnail caches under the opened root. Session-local settings (selected image/level, window/level, overlay toggles) live outside the fileset.

**Applicability / transfer limits:** Group 1 discovery/navigation MUST be implementable with local directory + `zarr.json` + chunk reads only. Any design that requires a streaming adapter, server round-trip, or fileset mutation fails the method boundary even if it renders correctly. Conversely, MUST NOT treat a fileset's cloud-readiness (e.g., HTTP-friendly layout) as a defect — it is conforming permission.

**Plan implication / disposition:** `Viewer.md L7,L9` (background reads, cancel stale work; unchanged sources) already encode this. Disposition: **confirm plan** — “acceptance MUST verify no fileset writes (snapshot before/after open+navigate) and MUST NOT require network access; document that remote-URL opening is explicitly unsupported in this phase with a clear message.”

### OPN-023 — Failure isolation and message granularity: per-entry quarantine, never whole-list collapse (brief/plan MUST; spec defines the violation set)
**Statement.** S003 defines the MUST-violation set that justifies cannot-display (missing/inconsistent version, axes, `dimension_names`, `datasets`, transforms; bad plate/well linkage; missing level arrays; unsupported Zarr features). The brief/plan define the UX contract: remain responsive, explain which image/data failed, let the user choose another item, never crash. Combined, the viewer MUST quarantine failures at the finest entry granularity (level < image/field < well < plate/collection) and keep siblings usable.

**Obligation:** spec MUSTs supply the trigger set; brief/plan MUSTs supply the isolation + messaging contract.

**Evidence (trigger set):** OPN-001/002/005/006/007/010/011/015/016/021 each cite their MUSTs; representative: version consistency (`S003 L156`), axes/dims (`L173-174`, `L299-307`), transforms (`L308-313`), plate/well linkage (`L552-560`, `L744-750`), consecutive/series correspondence (`L266-270`).

**Evidence (contract):**

- `inputs/brief.md L3`: “remain responsive while opening large saved datasets and clearly explain data it cannot display.”
- `Viewer.md L7`: “Opening failures explain which image or data could not be displayed and allow the user to choose another item.”
- `Viewer.md L11`: “Malformed or unavailable input must produce understandable feedback rather than a crash.”

**Conditions:** SHOULD violations (e.g., missing `name`, missing `field_count`, present-but-empty row/well, absent OME-XML) SHOULD warn, not block. MUST violations block the affected entry only. Unavailable input (missing file, permission denied, corrupt chunk) is handled identically to MUST violations for isolation purposes. Every message MUST name the entry identity (`plate/well/field/series/multiscale/datasets[path]`), the locator (`zarr.json` path or array path), the expected-vs-found values, and the S003 rule id where feasible.

**Applicability / transfer limits:** applies across Groups A–C. It does not require the viewer to repair, skip-validate, or open MUST-violating entries in a degraded mode beyond the per-level degradation in OPN-006 — quarantine-with-reason is the compliant default. Error copy MUST NOT cite task-card or assignment text as format authority.

**Plan implication / disposition:** `Viewer.md L7,L11` state the contract but provide no violation taxonomy. Disposition: **extend plan with taxonomy** — “implement `quarantine(entry, rule, expected, found, locator)`; acceptance MUST cover: version mismatch, axes/`dimension_names` mismatch, missing level array, `series` dangling path, plate index/path mismatch, well dangling acquisition, invalid JSON, unsupported codec — each asserting siblings remain openable and the message names the entry + file.”

### OPN-024 — Transitional-read and forward-compat posture: read `bioformats2raw.layout` now, isolate it, never gate on `omero` for Group 1
**Statement.** Group 1 MUST read transitional `bioformats2raw.layout` for real-fileset interop (OPN-009) while isolating it as replaceable; Group 1 MUST NOT require transitional `omero` metadata to open, list, or navigate (it is Group 2 rendering hints). Editor's-draft data beyond released 0.5 need not be supported.

**Obligation:** SHOULD/MUST-grade transitional read posture; explicit non-dependency for Group 1 on `omero`.

**Evidence:**

- `S003 L60-64`: transitional read MUST/SHOULD, write MAY.
- `S003 L180-181`: `bioformats2raw.layout` transitional, to be replaced; `S003 L398-399`: `omero` transitional (“information … how to render”).
- `S003 L25-27`: released 0.5 vs unsupported editor's draft.
- `S003 L426-430`: `omero` optional, but when present MUST have `channels[].color`/`window.min/max/start/end` — a Group 2 validation rule Group 1 MUST NOT enforce as an open gate.

**Conditions:** presence of `omero` MUST NOT affect Group 1 listing/navigation outcomes (no open failure, no level reordering, no field filtering). Absence of `omero` is conforming and MUST open normally. `bioformats2raw.layout` handling MUST be version-gated so a future explicit-collection spec can take precedence when both are present (analogous to OPN-011 plate precedence).

**Applicability / transfer limits:** transfers to all Group 1 open paths. It does not permit Group 1 to validate-or-reject `omero` contents — malformed `omero` is a Group 2 rendering-hint failure (fall back to default rendering with notice), never a Group 1 open/list failure.

**Plan implication / disposition:** `Viewer.md L9` (“interoperate with filesets from real 0.5 tools”; “additional capability choices require explicit review”) supports this posture. Disposition: **confirm + guardrail** — “acceptance MUST include: (a) a `bioformats2raw.layout` fileset, (b) a fileset without `omero`, (c) a fileset with malformed `omero` — asserting (a) lists correctly, (b) opens/navigates normally, (c) still opens/navigates with rendering hints degraded, never blocked.”

## 4. Small/medium grouping summary (no large sweep performed)

Per the method boundary, Group 1 findings are grouped, not swept:

- **A. Fileset opening (OPN-001–004):** Zarr v3 + `ome.version` + single-image shape + intra-group multiscale choice.
- **B. Listing/selecting (OPN-009–018, with OPN-005/008 as validators):** collection vs plate precedence, enumeration orders, grid-vs-sparse, acquisition facets, labels exclusion.
- **C. Multiscale navigation (OPN-005–007, OPN-019–020):** ordering + transforms + chunk-window reads + documented level-pick rule.
- **D. Cross-cutting (OPN-021–024):** strict JSON, read-only local boundary, quarantine taxonomy, transitional posture.

No exhaustive sweep over axis-type combinations, codec/chunk-grid combinations, plate dimensions, or acquisition counts was attempted or required. Where combinatorial behavior matters (e.g., custom axis types, non-2× factors, sparse plates, non-contiguous acquisition ids), this report records the governing rule plus one small representative case from S003's own examples rather than a parameter matrix.

## 5. Plan disposition — what the thin plan keeps, extends, and must decide

`Viewer.md` is self-declared thin (`L3`) and therefore correctly omits most Group 1 mechanics. Nothing in the plan contradicts S003; every gap below is an underspecification to extend, not a conflict to resolve.

| Plan element | Verdict | Group 1 action |
|---|---|---|
| Open local 0.5 fileset; list images (`L5`) | Keep, extend | Add Zarr v3 + `ome.version` validation (OPN-001/002); three discovery modes: single / `bioformats2raw.layout` / plate (OPN-003/009/014); arbitrary names (OPN-003/006); intra-group choice (OPN-004) |
| Plate/well/field depth | Missing | Add plate→well→field drill-down, grid-vs-sparse, acquisition facet (OPN-014–017); plate precedence (OPN-011) |
| Multi-image awareness (`L5,L7` list + choose another) | Confirm | Assert SHOULD-NOT-first-only with count + switcher (OPN-012); per-entry quarantine (OPN-023) |
| Pan/zoom + level choice (`L5`) | Keep, define | Document level-pick rule over ordered `datasets` + composed transforms (OPN-006/007/020); chunk-window reads (OPN-019) |
| Background reads + cancel (`L7`); no-freeze (`L11`) | Confirm | Bind to chunk-window loads per selected level; budget acceptance beyond memory (OPN-019/020) |
| Failure explanations (`L7,L11`) | Keep, taxonomize | Implement quarantine taxonomy with entry + locator + expected/found + rule (OPN-023); strict-JSON messages (OPN-021) |
| Real-tools interop (`L9`) | Keep, scope | Require transitional `bioformats2raw.layout` read (OPN-009/024); OME-XML parse is Phase-2 optional (OPN-013) |
| Unchanged sources; session-local settings; no remote/edit/export (`L9`) | Confirm | Snapshot-verify read-only; network-independent acceptance (OPN-022) |
| Details panel dims/units/coords (`L5`) | Share with Group 2 | Group 1 supplies structural values + validation state (OPN-005/007/008/015–017); Group 2 owns calibrated formatting/rendering |
| Label overlays (`L5`) | Share with Group 2 | Group 1 discovers via `labels[]` and excludes from image count (OPN-018); Group 2 owns `image-label` rendering |
| `omero` handling | Missing guardrail | Group 1 MUST NOT gate on `omero` (OPN-024); malformed `omero` never blocks open/navigate |

**Explicit product decisions required** (no S003 MUST dictates the answer): OPN-004 fallback UX; OPN-006 per-level-degrade vs whole-image block; OPN-007 `path`-form transform support; OPN-010 `series`-base documentation; OPN-011 plate/series-conflict surfacing; OPN-013 OME-XML parse phasing; OPN-020 level-pick rule; OPN-021 strict-vs-lenient JSON (strict recommended); OPN-023 message copy and diagnostics depth.

## 6. Unresolved areas (Group 1 scope; no live fetching to resolve them)

1. **U-01 — `series` path base.** S003 never explicitly states that `series` paths are root-relative; root-relative is inferred from examples (`S003 L189-191`, `L243-253`) and the numbered fallback. Absolute vs nested-relative `series` entries are untested against S003. Proposed validation: UNEXECUTED — construct `series: ["0"]` vs `series: ["sub/0"]` vs absolute-path fixtures and record which resolve under a root-relative rule.
2. **U-02 — Plate/series disagreement.** Precedence is normative (OPN-011) but conflict surfacing is not. Proposed validation: UNEXECUTED — fixture with plate wells `{A/1}` plus `series: ["9"]`; assert plate-first listing with a named warning.
3. **U-03 — `path`-form scale/translation prevalence and encoding.** S003 permits binary `path` vectors (`L285-289`) without giving a Group 1 example, dtype, or shape. Proposed validation: UNEXECUTED — search admitted bytes only (no live fetch): no Group 1 `path`-form example exists in S003; record as unsupported-until-observed with a precise message.
4. **U-04 — Consecutive-scan termination with gaps.** The MUST says consecutively numbered from 0 but does not define gap handling (`0,1,3` with `2` missing). Recommended stop-at-first-gap is a decision. Proposed validation: UNEXECUTED — gapped fixture asserting stop-at-first-gap + quarantined `series`-style message for the gap.
5. **U-05 — Case-insensitive-filesystem collisions.** S003 warns writers (OPN-015) but defines no reader behavior. Proposed validation: UNEXECUTED — macOS/Windows fixture with `A/a` rows asserting case-sensitive resolution or explicit filesystem-unsupported message (no silent merge).
6. **U-06 — Multiscale-selection pseudocode normativity (OPN-004).** Prose placement leaves MUST vs guidance uncertain. Proposed validation: UNEXECUTED — treat as SHOULD-grade fallback; no S003-internal resolution available without live spec history (forbidden for this assignment).
7. **U-07 — Level-pick rule optimality.** Any rule satisfying OPN-020 is conforming; performance/quality tradeoffs are unmeasured. Proposed validation: UNEXECUTED — benchmark candidate rules on a 3-level non-2× + translation fixture; assert stability across levels and chunk-window counts.
8. **U-08 — Bare-directory-of-`.zarr` enumeration.** S003's figure shows sibling `123.zarr`/`456.zarr` (`L82-85`) with no root listing key. Whether opening a directory containing multiple `.zarr` groups should enumerate siblings is unspecified. Proposed validation: UNEXECUTED — fixture directory with two `.zarr` siblings; recommended behavior is to open the selected `.zarr` only and note siblings in details (not auto-merge), pending product decision.

## 7. Proposed validation (all UNEXECUTED — no execution was allowed or performed)

No validation below was executed. No fixtures were built, no code was run, no timing was measured, and no live sources were fetched. Each item is labeled UNEXECUTED and scoped to local fixtures only.

- **V-01 (UNEXECUTED):** Build minimal local fixtures — single 3-level image with non-numeric level names + translation; `bioformats2raw.layout` 2-image collection with/without `series`; sparse plate (2 wells in 96-grid) with 2 acquisitions; label-bearing image — and assert OPN-003/006/010/015/016/018 discovery outcomes.
- **V-02 (UNEXECUTED):** Negative fixtures for each OPN-023 taxonomy row (version mismatch, axes/`dimension_names` mismatch, missing level, dangling `series`, index/path mismatch, dangling acquisition, invalid JSON, unsupported codec, `path`-form transform) asserting per-entry quarantine + named message + sibling usability.
- **V-03 (UNEXECUTED):** Navigation fixture asserting the documented OPN-020 level-pick rule across zoom steps, including group-level transform composition and per-level degradation when the ideal level is unreadable.
- **V-04 (UNEXECUTED):** Responsiveness fixture with a level exceeding memory asserting chunk-window reads, background load, stale-cancel, and no-freeze interaction (OPN-019).
- **V-05 (UNEXECUTED):** Read-only fixture snapshotting the fileset before/after open+navigate asserting zero writes, plus an offline run asserting no network dependency (OPN-022).
- **V-06 (UNEXECUTED):** Transitional fixtures asserting `bioformats2raw.layout` lists correctly, `omero`-absent opens normally, and `omero`-malformed still opens/navigates with hints degraded (OPN-024).

## 8. Coverage statement, counterevidence, and handoff to Group 2

**Assigned-scope coverage.** All Group 1 brief elements were investigated against S003: fileset opening (§1, §2 header, §2.2 layout/attributes/details, version history), listing/selecting (bioformats2raw reader rules, plate/well specs, labels exclusion, multiscale-entry choice), and multiscale navigation (axes/datasets/transforms, chunk storage, level ordering). S003 lines outside Group 1 (notably §2.5 `omero` rendering fields `L398-430`, §2.6 `image-label` colors/properties/source `L456-514`, UDUNITS-2 display vocabularies `L170-172`, and HCS acquisition timing display `L526-529`) were read for boundary/interface and handed to Group 2 without independent Group 1 expansion. No assigned Group 1 S003 area was left unread; apparent “dead ends” are Group 2 interfaces, recorded here rather than dismissed.

**Counterevidence and uncertainty preserved.** (a) The `bioformats2raw.layout` value appears as integer `3` in examples but quoted `"3"` in MUST prose (OPN-009) — readers should tolerate both. (b) `field_count` (snake_case) coexists with `rowIndex`/`columnIndex` (camelCase) under the naming-style grandfather clause (OPN-021) — readers must accept exact spellings. (c) The multiscale-selection fallback's normativity is uncertain (OPN-004/U-06) — treated as SHOULD-grade. (d) Reader behavior on writer-SHOULD violations and on JSON comments is unspecified — warn/strict-reject respectively, as decided above. (e) Acquisition ids need not be contiguous (OPN-016/017) — any dense-index assumption is affirmatively counterevidenced by `S003 L795-803`.

**Unsupported assertions: none made.** Every format claim above cites S003 lines. Product recommendations are labeled as decisions, not format obligations. No claim rests on live-search absence, on task-card text as format evidence, or on execution that did not occur.

**Handoff.** Group 2 owns: axis-unit calibrated readout, `omero` channel/window/`defaultT`/`defaultZ` rendering, `image-label` overlay rendering and `source.image` resolution, time/plane display semantics, and acquisition-timing display. The shared contract is: Group 1 delivers validated `axes` + `dimension_names` + ordered `datasets` + composed transforms + resolved image/field/label identities; Group 2 consumes them without re-resolving paths.

## 9. Elapsed and usage costs (honest accounting)

- **Budget:** 450 elapsed seconds; 48 parent responses (per `TASK.md L27-28`). Retries/corrections consume the same budget.
- **Live fetching cost:** zero — no live queries were issued (forbidden for this assignment); no network, API, or external-write actions were taken.
- **Execution cost:** zero — no fixtures, code runs, or measurements were performed; all validation is UNEXECUTED.
- **Source usage:** one frozen capture (S003, 36980 bytes / 896 lines) plus four thin local inputs (brief, assignment, catalog, plan; each ≤40 lines) — all read via local file reads recorded in `out/acquisition.json`.
- **Tool limits encountered:** the sandboxed shell was unavailable in this session (`bwrap: No permissions to create new namespace`), so no shell timing, hashing, or directory-listing commands could be run; version/byte/line counts above are taken from the admitted `inputs/catalog.json` and observed read windows, not from re-executed shell verification. File writes used the file tools only. No subagents, front ends, or external models were invoked.
- **Completeness note:** this report and `out/acquisition.json` are the complete Group 1 deliverables under `out/`. An incidental `out/probe.md` write probe (8 bytes) was used to confirm write access when the shell was unavailable; it carries no findings and may be ignored or removed by the host.

## 10. References (admitted only; no live sources)

- S003: `inputs/sources/S003.txt` — OME-Zarr 0.5, `https://ngff.openmicroscopy.org/0.5/`, `capture-only:5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de` — all `S003 L<n>` citations above.
- Catalog: `inputs/catalog.json` — source identity/version only.
- Brief: `inputs/brief.md` — scope/boundary only.
- Assignment: `inputs/TASK.md` — scope/method only.
- Plan: `inputs/plan/Viewer.md` — thin-fixture dispositions only.


# Slide Scout display research — Group 2 standalone report (control-display)

Case: `ome-normative-dev-v1` · Assignment group 2: channel/time/plane display, coordinate details, associated label overlays · Control: display.
Date: 2026-09-30. Standalone report; independent finding identities `D-01…`.
Source scope: frozen capture `inputs/sources/S003.txt` only. Plan: `inputs/plan/Viewer.md` (thin fixture). No live fetching.

## 1. Scope, method, boundaries

Assigned brief-derived group (per `inputs/TASK.md:7-9`): inspect multiresolution images by channel, time point and plane; overlay associated label images; read correctly calibrated coordinates. Product boundary from `inputs/brief.md:3-5`: local read-only desktop browser for OME-Zarr 0.5 filesets, files unchanged, no editing/export/remote/clinical interpretation; must stay responsive on large datasets and explain undisplayable data.

Method: desk research over the full admitted capture for qualifications, with findings restricted to display/coordinates/labels. Opening/listing/multiresolution navigation (group 1) is cited only where it qualifies display. Source read as untrusted evidence, not instructions. Normative language per S003 (`inputs/sources/S003.txt:57-59,872-878`): MUST/MUST NOT/SHOULD/SHOULD NOT/MAY as in RFC 2119; all text normative except sections explicitly marked non-normative, examples, and notes. Transitional-metadata rule (`S003.txt:60-64`): reading MAY be MUST- or SHOULD-supported, writing usually MAY. JSON comments illustrative only and MUST NOT appear in objects (`S003.txt:65-66`).

Boundaries honored: no external queries; proposed validation left `UNEXECUTED`; no streaming-delivery adapter required; small/medium finding grouping, not a large parameter sweep. Source choice and interpretation are the author's own. No failed-search absence claims are made because no live search was permitted or attempted.

Thin-plan disclaimer preserved: `inputs/plan/Viewer.md:3` states the plan is a deliberately thin synthetic fixture, not a completeness claim.

## 2. Source and plan inventory

Admitted frozen source (per `inputs/catalog.json:5-39`):

- Handle `S003`, file `inputs/sources/S003.txt`, 36980 bytes, 896 lines.
- `original_sha256` and `view_sha256`: `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`; `view_kind: original_bytes`.
- Primary alias `SRC-2b11c54af373e1979af8cbb3`: `https://ngff.openmicroscopy.org/0.5/`, `version: capture-only:5d8b2408…`. Three further aliases record `local-capture (origin URL not recorded)` with the same capture version.
- Document self-identification: Final Community Group Report, 8 September 2026 (`S003.txt:3-6`); released version 0.5; editor's-draft data will not necessarily be supported (`S003.txt:25-27`). OME-Zarr 0.5 uses Zarr format version 3 (`S003.txt:68-69`, `831-833`).

Admitted plan: `inputs/plan/Viewer.md` (11 lines): canvas with pan/zoom, channel visibility, time-point/plane selection “where relevant,” optional label overlays, details panel (dimensions/units/coordinates), view-appropriate pyramid level (`Viewer.md:5`); background reads, cancel superseded work, explain opening failures and allow choosing another item (`Viewer.md:7`); local-only, unchanged sources, session-local display settings, out-of-scope editing/export/remote/interpretation (`Viewer.md:9`); acceptance on representative filesets, calibrated coordinates, aligned overlays, no freeze on large data, understandable malformed-input feedback (`Viewer.md:11`).

No evaluator keys, historical outputs, implementation captures, or live tools were admitted. `S003.txt:813-814` (“Implementations: See Tools”) has no captured target in this assignment and therefore supplies no implementation evidence.

## 3. Executive summary for display

A conforming OME-Zarr 0.5 image is 2–5D with explicit `axes` + per-level `coordinateTransformations`; display selectors and coordinate readouts MUST be driven by that metadata, not by assumed `t/c/z/y/x` positions. Time (if present) comes first, then channel/custom, then 2–3 space axes; `zyx` ordering for stacked planes is only SHOULD. Physical coordinates require composing per-level scale (+ optional translation) with an optional global transform; when physical size is unavailable the scale degrades to a relative downsampling factor, so the viewer cannot always show calibrated units. Channel rendering (`omero`) is optional and transitional: when present it mandates `channels[].color` + `window{min,max,start,end}` but leaves windowing/color-model behavior largely to an external OMERO WebGateway reference that is not admitted here. Label overlays are discoverable only through an explicit `labels` path list (SHOULD be complete), constrained to integer pixel types with the same level count as the source image, with SHOULD-grade display colors (`image-label.colors[]` + optional `rgba`/opacity) and optional properties/source metadata. The thin plan covers the control surfaces at a high level but omits axis-driven selector logic, transform composition and fallback, missing-`omero` defaults, unit handling, label discovery/filtering/compositing rules, and the specific undisplayable-data explanations the brief requires.

## 4. Findings

Identity scheme is independent to this report (`D-` prefix) so host concatenation with the opening group cannot collide.

### D-01 — Dimensionality and axis-type inventory drive which display selectors exist

Status: established obligation + product decision. S003 mandates 2–5 dimensions (`S003.txt:81,96,296-300`) with 2 or 3 `type:space` entries, at most one `type:time`, at most one `type:channel` or null/custom (`S003.txt:301`). “Where relevant” channel/time/plane controls therefore MUST be derived per image from `multiscales[].axes`, including the possibility of no time axis, no channel axis, 2D-only (no `z` plane), or a custom/null axis in the channel slot.

Evidence: `S003.txt:81,96-98,296-302`.

Conditions: axis names are arbitrary (`S003.txt:81`); `axes` length MUST equal array dimensionality (`S003.txt:173,300`); each dataset MUST NOT exceed 5D and MUST match `axes` count/order (`S003.txt:307`).

Transfer limits: applies per multiscale image, including each HCS field of view (each field implements `multiscales`/`omero`, `S003.txt:140-145`) and each label image (itself a multiscale, `S003.txt:454`). Does not license assuming a fixed 5D `t/c/z/y/x` cube.

Plan disposition: `Viewer.md:5` (“channel visibility… time-point and plane selection where relevant”) is consistent but incomplete. ADD: per-image axis inventory; hide/disable selectors for absent axes; decide custom/null-axis presentation (treated as channel-like selector vs hidden vs generic slider). No plan deletion.

### D-02 — Axis order is fixed (time → channel/custom → space); `zyx` plane order is only SHOULD

Status: established obligation (order classes) + recommendation (`zyx`). Entries MUST correspond to array dimension order and MUST be ordered time-first, then channel/custom, then space (`S003.txt:302`); image arrays MUST place time before channel before spatial axes (`S003.txt:96-98`). For three spatial axes with `yx` plane + anisotropic `z` stack, spatial axes SHOULD be `zyx` (`S003.txt:303`).

Evidence: `S003.txt:96-98,302-303`.

Conditions/counterevidence: SHOULD means a conforming fileset MAY order three space axes differently; the viewer MUST NOT hard-code `z` as `axes[2]`. Custom axis occupies the channel position (`S003.txt:302`) but its display semantics are unspecified.

Plan disposition: `Viewer.md:5` plane selection implicitly assumes a stack axis. ADD: locate plane axis/axes by `type:space` + name/unit, defaulting to the non-`yx` space axis when three exist but tolerating other orders; document the fallback. Acceptance (`Viewer.md:11`) SHOULD include a non-`zyx` three-space-axis fileset if one can be admitted later.

### D-03 — Axis names, types, units, and `dimension_names` obligations

Status: mixed MUST/SHOULD/MAY. Each axis MUST have a unique `name` (`S003.txt:168`); SHOULD have `type` (`space`/`time`/`channel`, MAY be other custom strings, `S003.txt:169`); SHOULD have `unit` from UDUNITS-2 lists (`S003.txt:170-172`); array `zarr.json` MUST include `dimension_names` matching `axes` names (`S003.txt:174`, clarified in 0.5.2 per `S003.txt:825-827`). Space units enumerated (`S003.txt:171`: angstrom…yottameter etc.); time units enumerated (`S003.txt:172`: attosecond…zettasecond etc.); no channel-unit vocabulary is given.

Evidence: `S003.txt:167-174,825-827`.

Conditions/uncertainty: missing `type`/`unit` is conforming (SHOULD, not MUST). Viewer MUST decide: label for typeless axes; coordinate display when `unit` is absent or a non-listed string (S003 says SHOULD be listed units, so other strings are not forbidden); behavior on `dimension_names` missing/mismatched (nonconforming, but S003 prescribes no reader recovery).

Transfer limits: unit lists are version-pinned to this 0.5 capture; do not transfer UDUNITS-2 semantics beyond the listed strings without the UDUNITS-2 source, which is not admitted.

Plan disposition: `Viewer.md:5` details panel (“dimensions, units and coordinates”) requires axis names/units. ADD: show per-axis name/type/unit (including “unit unknown/unspecified” state); surface `dimension_names` mismatch as undisplayable-data explanation per `Viewer.md:7,11` rather than crashing.

### D-04 — Per-level scale/translation composition for calibrated coordinates

Status: established obligation. Each dataset MUST carry `coordinateTransformations` mapping data to physical coordinates (`S003.txt:308`); MUST contain only scale/translation types (`S003.txt:309,313`); MUST contain exactly one scale for pixel size/duration (`S003.txt:310`); MAY contain exactly one translation for origin offset in physical units, which if present MUST follow scale (`S003.txt:311`); scale/translation vectors MUST match `axes` length (`S003.txt:312`); generic transforms apply sequentially in order (`S003.txt:293`).

Evidence: `S003.txt:276-293,308-313`; worked scales example `S003.txt:336-366`.

Conditions: translation is physical-offset-after-scale, not voxel offset. Generic §2.3 permits `translation`/`scale` each as `List[float]` or binary `path` (`S003.txt:284-289`); §2.4 restricts type/order/count but does not explicitly forbid the `path` form, so support for binary-stored vectors in multiscale transforms is ambiguous — see §7.

Plan disposition: `Viewer.md:5` (“calibrated coordinate display” via `Viewer.md:11`) cannot be met by reading one scale array. ADD: per-level transform reader + ordered composition; display physical position/extent per axis; explain when translation is absent (assume zero offset) vs present.

### D-05 — Global `multiscales` transforms apply after per-level transforms

Status: established obligation when present; presence is optional. `multiscales[]` MAY carry `coordinateTransformations` applied to all levels in the same manner, following the same type/order rules, applied after per-dataset transforms (`S003.txt:314-315`), e.g. a shared time scale (`S003.txt:316,368-374`).

Evidence: `S003.txt:314-316,368-374`.

Conditions: omission is conforming; viewer MUST apply global-after-local, not local-after-global. Example shows time scale 0.1 ms shared across levels while per-level space scales vary (`S003.txt:339-374`).

Plan disposition: `Viewer.md:5` details panel MUST incorporate global transforms where present; ADD explicit composition order to implementation notes. No plan deletion.

### D-06 — Scale fallback when physical calibration is unavailable

Status: established obligation with degraded display. If scaling info is unavailable/inapplicable for an axis, scale MUST express the relative factor vs the first resolution, defaulting to 1.0 without downsampling along that axis (`S003.txt:310`).

Evidence: `S003.txt:310-312`.

Conditions: a scale vector of `1.0`s therefore does NOT prove 1 physical unit per voxel — it may be a relative placeholder. Viewer MUST NOT label such axes calibrated without additional evidence; S003 supplies no flag distinguishing physical from relative scales beyond context. This directly bounds “correctly calibrated coordinates” (`brief.md:3`).

Plan disposition: `Viewer.md:5,11` calibrated-coordinate acceptance needs a two-state display: calibrated (physical + unit) vs uncalibrated/relative (level-relative factor only). ADD: rule for choosing the state (e.g. unit present + non-default scale history vs unit absent/all-`1.0`), surfaced as uncertainty, not as false precision.

### D-07 — `omero` channel rendering is optional and transitional; minimal MUSTs when present

Status: optional capability; transitional. `omero` holds channel/rendering info (`S003.txt:398-400`); example fields include `id`, `name`, `channels[active,coefficient,color,family,inverted,label,window]`, `rdefs{defaultT,defaultZ,model}` (`S003.txt:401-423`), with external OMERO WebGateway reference (`S003.txt:424-425`, not admitted). If present, MUST contain `channels` array (`S003.txt:426`); each entry MUST contain `color` (6 hex RGB, `S003.txt:427`) and `window` (`S003.txt:428`) with MUST `min/max/start/end` (`S003.txt:429-430`). Transitional-reading expectation is ambiguous (`S003.txt:60-64` says reading “may be expected (MUST) or encouraged (SHOULD)” without per-key assignment).

Evidence: `S003.txt:60-64,398-430,828-830` (0.5.1 re-added improved `omero` description).

Conditions/uncertainty: array length is described as “matching the c dimension size” only in an inline comment (`S003.txt:403`), which per `S003.txt:65-66,877-883` is non-normative illustration; strict length equality is therefore not established as MUST. Semantics of `active`, `coefficient`, `family`, `inverted`, `label`, `rdefs.model ∈ {color,greyscale}`, and `window` start/end vs min/max are shown but not normatively defined in the capture; the normative hook is the unadmitted WebGateway doc. `defaultT`/`defaultZ` are “first … to show” (`S003.txt:420-421`) but range/clamping behavior is unspecified. `model` values beyond the two shown are unspecified.

Transfer limits: do not transfer OMERO server semantics into this read-only local viewer beyond the captured MUSTs; transitional status means future versions may remove/replace `omero`.

Plan disposition: `Viewer.md:5` channel visibility controls + time/plane selection align with `active`/`defaultT`/`defaultZ`/`model`, and session-local display settings (`Viewer.md:9`) align with not writing `omero` back. ADD: defaults when `omero` is absent (which channel visible, which color/window, which T/Z selected); clamping for out-of-range `defaultT/defaultZ`; mapping of `window{min,max}` (data range?) vs `window{start,end}` (current stretch?) as a product decision with review per `Viewer.md:9`; validation of 6-hex `color`; behavior when `channels` length mismatches `c` size (error explanation, not crash, per `Viewer.md:7,11`).

### D-08 — Multiple `multiscales` entries: name selection with first-entry fallback

Status: uncertain normative force; treat as recommended capability. After the normative `name` SHOULD (`S003.txt:317`), the capture states “If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback,” with lookup pseudocode (`S003.txt:388-397`). The passage is not explicitly marked example/note, but its code-like form and “perhaps choose based on chunk size” comment make MUST-grade force doubtful.

Evidence: `S003.txt:317,388-397`.

Conditions: display MUST at minimum handle the single-entry case; multi-entry filesets require a product decision (auto-first vs user choice). `name` itself is only SHOULD (`S003.txt:317`), so chooser MUST tolerate missing/duplicate names.

Plan disposition: `Viewer.md:5` (“selecting an image opens a canvas”) assumes one image view. ADD: if a group carries multiple `multiscales`, offer named choice defaulting to first; record as capability choice for review (`Viewer.md:9`).

### D-09 — Label discovery: explicit `labels` path list, SHOULD-complete, arbitrary names

Status: established discovery obligation + SHOULD completeness. `labels` group sits alongside resolution levels, is a container not an image, holds images (`S003.txt:102-105,437`); its `zarr.json` MUST contain `{"labels": [<paths>]}` (`S003.txt:441-442`, example `S003.txt:443-453`); all label images SHOULD be listed (`S003.txt:442`); names/paths arbitrary (`S003.txt:440`); intermediate groups allowed but MUST NOT contain metadata (`S003.txt:439-440`); layout example `labels/original/0` (`S003.txt:102-114`).

Evidence: `S003.txt:102-114,437-453`.

Conditions: SHOULD-listed means unlisted label images may exist in the wild; MUST-NOT-metadata intermediates means the viewer MUST NOT require metadata there. Display MUST resolve listed relative paths; behavior for dangling paths is unspecified and MUST be an explained failure, not a crash.

Plan disposition: `Viewer.md:5` “optional overlays for associated label images” is consistent. ADD: overlay picker driven by the `labels` list; decide whether to scan for unlisted label-likes (product decision; default SHOULD be list-only to honor the discovery contract); surface missing/dangling entries per `Viewer.md:7`.

### D-10 — Label image data constraints affecting overlay alignment and decoding

Status: established obligations. Label pixels MUST be integer dtypes `uint8…int64` (`S003.txt:438-439`; also “only integer values are supported,” `S003.txt:116-117`); each label dimension SHOULD be same-as-image or `1` when irrelevant (`S003.txt:106-108`); label-image `zarr.json` MUST implement `multiscales` (`S003.txt:454`); its `datasets` MUST have the same entry/level count as the source image (`S003.txt:454-455`); label images are “usually” same dims/transforms (`S003.txt:432-433`, descriptive not MUST).

Evidence: `S003.txt:106-108,116-117,432-440,454-455`.

Conditions: SHOULD same-or-`1` permits (rarely) mismatched extents; viewer needs a broadcast/resample-or-refuse rule for `1`-sized label dims and an explained error for genuinely mismatched shapes. Same-level-count MUST enables level-locked overlay: overlay level `i` corresponds to image level `i`. Non-integer label arrays are nonconforming and MUST be reported as undisplayable. Zarr v3 codecs/chunking/dtypes/transformers generally MAY vary (`S003.txt:70-72`), so integer dtype alone does not guarantee a supported codec.

Plan disposition: `Viewer.md:5,11` “aligned label overlays” and “view-appropriate pyramid level” together imply level-locked, transform-aware compositing. ADD: lock overlay pyramid index to image pyramid index; verify/reproject using label vs image `axes`+transforms rather than assuming pixel congruence; explain dtype/shape/level-count violations.

### D-11 — `image-label` display semantics: SHOULD colors, MAY `rgba`/properties/source

Status: SHOULD-grade display contract with MUST-typed subfields. Label-image metadata SHOULD contain `image-label` (`S003.txt:456-457`); it SHOULD contain `colors` + `version` (`S003.txt:458-460`); `colors` MUST be an array, `version` MUST be a string (`S003.txt:459-460`); readers SHOULD display using `colors` (`S003.txt:461`); each entry MUST have integer `label-value` (`S003.txt:462-463`), MAY have `rgba` uint8×4 with alpha as opacity (`S003.txt:463-466`); extra `colors` keys allowed (`S003.txt:466`); MAY have `properties[]` (each MUST have integer `label-value`, MAY have arbitrary per-label KV with heterogeneous keys, `S003.txt:467-471`) and `source{image?}` (if `source` present it MUST be an object; `image` if present MUST be a relative-path string, default `../../`, `S003.txt:472-474`); worked 50%-opacity blue/green example (`S003.txt:475-514`).

Evidence: `S003.txt:454-514`.

Conditions/uncertainty: SHOULD-display means custom palettes remain conforming, but default SHOULD honor `colors`/`rgba`. Unspecified: compositing when `rgba` absent (opaque? default palette? hide?); blending of overlapping labels; handling of pixel values missing from `colors`/`properties`; whether `properties` is displayable vs tooltip-only; `source.image` resolution when labels are nested deeper than `labels/<name>`; `version` values beyond “a string.” `properties` heterogeneity forbids a fixed-column table assumption.

Plan disposition: `Viewer.md:5` optional overlays + session-local settings (`Viewer.md:9`) fit: honor `rgba`/opacity by default, allow local palette/opacity/visibility toggles without writing back. ADD: legend rendering from `colors`+`properties`; fallback palette + “color unspecified” explanation; source-link display (which image this label derives from); opacity slider mapping to alpha.

### D-12 — Version, envelope, and Zarr-layer preconditions for any display

Status: established obligations. `ome.version` string in `attributes.ome` (`S003.txt:155,157-165`); MUST be consistent within a hierarchy (`S003.txt:156`); groups carry `multiscales`+`omero` at group level (`S003.txt:87-90`); arrays carry chunks per array `zarr.json` (`S003.txt:99-100`); Zarr v3 with unrestricted codecs/chunk grids/key encodings/dtypes/transformers unless disallowed (`S003.txt:68-72`); hierarchy MAY be local or HTTP/S3/GCS-shaped (`S003.txt:73-77`), while the product boundary is local-only (`brief.md:5`, `Viewer.md:9`).

Evidence: `S003.txt:68-77,87-100,150-165`.

Conditions: S003 prescribes no reader behavior for version inconsistency, missing `ome` envelope, malformed JSON, or unsupported Zarr features. Viewer MUST convert each into the brief’s “clearly explain data it cannot display” (`brief.md:3`) and the plan’s “understandable feedback rather than a crash” (`Viewer.md:11`).

Plan disposition: KEEP `Viewer.md:7` failure-explanation + choose-another-item flow; ADD: version check (expect `0.5`, warn on other/mixed, refuse editor’s-draft data per `S003.txt:25-27` with explanation); unsupported-codec/dtype path; envelope-missing path.

### D-13 — Display-affecting qualifications from outside the display sections

Status: qualifications, not primary display obligations. Full-source scan performed; the following bound display without expanding group scope. Multi-image filesets: `bioformats2raw.layout==3` + `OME/METADATA.ome.xml` series conventions (`S003.txt:193-270`); readers SHOULD NOT default to only the first image and MAY offer choice (`S003.txt:271-275`); plate presence takes precedence over layout (`S003.txt:204-206`). HCS: plate/well/row groups (`S003.txt:120-129,132-148`); each field of view is a separately displayable multiscale image (`S003.txt:140-145`). Naming: multi-word keys SHOULD be camelCase but pre-existing keys need not obey (`S003.txt:810-812`), e.g. `field_count` (`S003.txt:228,538-539`) — display parsers MUST use exact keys, not normalized forms.

Evidence: `S003.txt:120-148,193-275,538-551,744-752,810-812`.

Plan disposition: display findings transfer per image/field/label; image-choice and plate/well navigation belong to group 1. ADD to display: per-field persistence of channel/T/Z/overlay state (product decision); no display dependency on `bioformats2raw`/`plate` beyond locating the already-selected image.

## 5. Consolidated plan implications (Viewer.md disposition)

- `Viewer.md:5` canvas + pan/zoom: KEEP; ADD level-locked label compositing (D-10) and transform-aware extent math (D-04–D-06). No S003 pan/zoom obligations; interaction design is a product decision.
- `Viewer.md:5` channel visibility: KEEP; IMPLEMENT via `axes` channel-slot discovery (D-01–D-02) + `omero.channels/active/color/window` when present with explicit absent-`omero` defaults (D-07); ADD mismatch/out-of-range explanations.
- `Viewer.md:5` time-point/plane selection: KEEP; IMPLEMENT via axis inventory (D-01–D-03) + `rdefs.defaultT/defaultZ` as initial indices with clamping (D-07); tolerate missing axes and non-`zyx` orders (D-02).
- `Viewer.md:5` optional label overlays: KEEP; IMPLEMENT discovery via `labels[]` (D-09), integer/level-count/shape gates (D-10), SHOULD-honor `colors/rgba` + legend/properties/source UI (D-11).
- `Viewer.md:5` details panel (dimensions/units/coordinates): KEEP; IMPLEMENT per-axis name/type/unit + composed physical coordinates + calibrated-vs-relative state (D-03–D-06).
- `Viewer.md:5` view-appropriate pyramid level: KEEP; ADD same-count label level locking (D-10); level-choice heuristic itself is unspecified and remains a product decision.
- `Viewer.md:7` background reads + cancel: KEEP; no S003 streaming obligations found — consistent with the “no streaming delivery adapter” boundary. ADD: cancel applies to image + locked label level fetches as one view.
- `Viewer.md:7,11` explained failures + no crash: KEEP and EXTEND with the enumerated display gates: version/envelope (D-12), `dimension_names` (D-03), transform shape/type/count (D-04), `omero` shape (D-07), label listing/shape/dtype/level-count (D-09–D-10), `image-label` shape (D-11).
- `Viewer.md:9` local-only/unchanged/session-local: KEEP; display settings (channel colors, windows, opacity, selected T/Z/level/label) MUST NOT write into the fileset; no S003 write obligations apply to this viewer.
- `Viewer.md:9` review-gated capabilities: the following display choices REQUIRE review: custom-axis presentation, absent-`omero` palette/window defaults, `window` start/end semantics, multi-`multiscales` chooser, unlisted-label scanning, label `1`-dim broadcast vs refuse, missing-`rgba`/missing-entry fallbacks, calibrated-vs-relative heuristic.
- `Viewer.md:11` acceptance: EXTEND representative filesets to cover 2D/3D/4D/5D, time-only, channel-only, custom-axis, missing-`omero`, non-`zyx`, translation-present, global-transform, relative-scale-only, multi-`multiscales`, multi-label, `rgba`-absent, properties-heterogeneous, and single-level label/image cases. Each currently `UNEXECUTED` (§8).

## 6. Applicability and transfer limits

- Single-source bound: all obligations derive from one frozen 0.5 capture; no implementation, tool, or live-spec evidence was admitted. Do not generalize to OME-Zarr 0.4/0.6+, OME-TIFF parity (`S003.txt:52-55` states design intent, not a display contract), or Zarr v2 behavior.
- Version-pinned: Zarr v3 (`S003.txt:68-69`); `dimension_names` MUST (0.5.2 clarification); `omero` description state (0.5.1); editor’s-draft exclusion (`S003.txt:25-27`).
- Transitional fragility: `omero` (D-07) and any `bioformats2raw.layout` qualification (D-13) may change or be removed; code MUST isolate them behind adapters.
- External references not transferred: OMERO WebGateway channel semantics (`S003.txt:424-425`), UDUNITS-2 beyond the listed unit strings (`S003.txt:170-172`), OME-XML/spec details (`S003.txt:257-260`), and “Tools” implementations (`S003.txt:813-814`) were not admitted and MUST NOT be assumed.
- Local-only product boundary: S003’s HTTP/S3/GCS-shaped hierarchies (`S003.txt:73-77`) do not obligate remote display; fileset layouts originating from remote-oriented writers still MUST render from local copies when the local hierarchy is intact.
- No absent-`omero`/absent-unit/ambiguous-`path`-transform behavior can be claimed as established; those are product decisions with uncertainty (§7).
- Group boundary: plate/well/series navigation obligations belong to group 1; this report transfers only their per-image display consequences (D-13).

## 7. Unresolved areas, uncertainty, and counterevidence

- U-01 `path`-form scale/translation in multiscale datasets: generic §2.3 allows `path` binaries (`S003.txt:284-289`); §2.4 restricts to scale/translation types with count/order rules but no explicit list-only rule (`S003.txt:309-312`). Unknown whether a conforming 0.5 reader MUST support binary vectors. Counterevidence: all multiscale examples use lists (`S003.txt:339-374`).
- U-02 Multi-`multiscales` chooser force: prose + pseudocode (`S003.txt:388-397`) vs SHOULD-grade `name` (`S003.txt:317`); unclear if auto-first is sufficient for conformance.
- U-03 `omero.channels` length vs `c` size: only an inline comment asserts matching (`S003.txt:403`); no MUST. Mismatch handling is a product decision.
- U-04 `window{min,max,start,end}` operational semantics, `family/coefficient/inverted` math, and `model: color|greyscale` compositing: shown (`S003.txt:404-423`) but not defined; normative definition points outside the admitted source (`S003.txt:424-425`).
- U-05 `defaultT/defaultZ` range, indexing base, and behavior when the axis is absent: “first to show” (`S003.txt:420-421`) only; zero-based analog in plate/well (`rowIndex/columnIndex MUST be 0-based`, `S003.txt:557-560`) does not transfer to `defaultT/Z` without evidence.
- U-06 Missing-`type`/missing-`unit`/custom-unit display: conforming inputs with unspecified rendering; no S003 default unit or “pixel” fallback is established.
- U-07 `dimension_names` mismatch recovery, `ome.version` inconsistency recovery, and malformed-JSON recovery: MUSTs exist (`S003.txt:156,174`) with no prescribed reader recovery.
- U-08 Label `1`-dim broadcasting, unlisted-label scanning, dangling `labels[]` paths, non-integer arrays, and level-count mismatch recovery: gates established (D-09–D-10) but recovery unspecified.
- U-09 Missing-`rgba`, missing `colors` entries for observed pixel values, missing `image-label` entirely, and `properties` presentation: SHOULD/MUST shapes established (D-11) but fallback palette/legend behavior unspecified.
- U-10 `source.image` resolution for labels nested deeper than one level and multi-source labels: default `../../` only (`S003.txt:472-474`).
- U-11 `version` string values for `image-label`/plate/well (`S003.txt:459-460,550-551,751-752`): MUST-be-string with no admitted enumeration; strict equality checks would be product decisions.
- U-12 Performance obligations: S003 imposes no frame-rate, tile-size, or background-loading rules; responsiveness requirements come solely from the brief/plan (`brief.md:3`, `Viewer.md:7,11`).
- No counterevidence was found that contradicts the MUST-grade display gates in D-01–D-12 within S003; uncertainties above reflect absence of specification, not conflicting specification.

## 8. Proposed validation (all UNEXECUTED)

No validation was executed in this frozen-source assignment; no filesets were opened and no code was run. Each item below is explicitly `UNEXECUTED` and would require admitted representative filesets plus permission to execute:

- V-01 `UNEXECUTED`: load admitted 2D/3D/4D/5D OME-Zarr 0.5 filesets covering time-only, channel-only, custom-axis, and non-`zyx` layouts; verify selector inventory/order against D-01–D-03.
- V-02 `UNEXECUTED`: verify physical-coordinate computation including per-level + global composition, translation-after-scale, and relative-scale fallback against D-04–D-06, including unit-present vs unit-absent display states.
- V-03 `UNEXECUTED`: verify channel rendering with present, absent, and malformed `omero` (bad hex, missing window keys, length mismatch, out-of-range defaults) against D-07; record chosen defaults.
- V-04 `UNEXECUTED`: verify multi-`multiscales` discovery/choice/fallback against D-08.
- V-05 `UNEXECUTED`: verify label discovery, integer/level-count/shape gates, level-locked alignment, `colors/rgba` opacity, legend/properties/source display, and fallback paths against D-09–D-11.
- V-06 `UNEXECUTED`: verify version/envelope/`dimension_names`/Zarr-feature failure explanations and no-crash behavior against D-12 and `Viewer.md:7,11`.
- V-07 `UNEXECUTED`: verify large-dataset responsiveness and view-change cancellation for image + locked label levels per `Viewer.md:7,11`; no S003 performance oracle exists, so criteria must come from product acceptance.

## 9. Dead ends and unvisited areas within assigned scope

- No live OME-Zarr tool docs, example filesets, or OMERO WebGateway semantics were visited: outside the admitted source scope (`inputs/TASK.md:5`: do not fetch live sources).
- No reader-implementation code was visited: `S003.txt:813-814` names “Tools” without an admitted capture.
- No plate/well acquisition-timestamp, row/column-name filesystem-collision, or bioformats2raw OME-XML display paths were pursued beyond D-13 qualification because chooser/navigation ownership belongs to group 1; per-image display transfer is complete.
- No Zarr v3 codec/chunk-grid/key-encoding enumeration was attempted beyond noting display must tolerate arbitrary allowed features (`S003.txt:70-72`): the Zarr specification itself was not admitted.
- These boundaries were not treated as negative evidence about the format.

## 10. Costs and completeness statement

- Coverage: all brief display clauses (channel/time/plane, calibrated coordinates, label overlays, responsiveness explanation duty, local/read-only boundary) are addressed by D-01–D-13 with plan disposition, transfer limits, unresolved items, and `UNEXECUTED` validation.
- Reads: six local files only — `TASK.md`, `inputs/brief.md`, `inputs/TASK.md`, `inputs/catalog.json`, `inputs/sources/S003.txt` (896 lines), `inputs/plan/Viewer.md`. Zero external queries, zero external writes, zero code executions.
- Elapsed/usage: frozen-source desk research within the 450-second / 48-response native Goal budget; no billable external calls and no validation runtime to report. Exact wall-clock is owned by the host harness, not estimated here.
- Completeness risk: single-source capture means obligations are version-pinned and implementation behavior is unobserved; §7–§9 preserve that uncertainty rather than filling it.

## 11. Citation index (exact locators)

- Identity/version: `S003.txt:3-8,25-27`; Zarr v3: `S003.txt:68-69,831-833`; Zarr features/remote shape: `S003.txt:70-77`.
- Conventions/transitional/comments/normativity: `S003.txt:57-66,872-888`.
- Image hierarchy/labels container: `S003.txt:79-117`.
- Envelope/version: `S003.txt:150-165`.
- Axes/units/`dimension_names`: `S003.txt:167-174,825-827`.
- Generic transforms: `S003.txt:276-293`.
- Multiscales incl. global + example + chooser: `S003.txt:294-397`.
- `omero`: `S003.txt:398-430,828-830`.
- Labels/`image-label`: `S003.txt:431-514`.
- HCS/plate/well names: `S003.txt:118-148,515-808,810-812`.
- Brief/plan: `inputs/brief.md:3-5`; `inputs/TASK.md:3-9`; `inputs/plan/Viewer.md:3-11`.
- Source versions: `inputs/catalog.json:8-26` (`5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`, `https://ngff.openmicroscopy.org/0.5/`).
