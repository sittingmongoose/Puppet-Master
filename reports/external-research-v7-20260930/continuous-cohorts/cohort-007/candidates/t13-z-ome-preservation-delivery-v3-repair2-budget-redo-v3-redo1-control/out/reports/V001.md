# Slide Scout viewer — OME-Zarr 0.5 format obligations research report

- Case: `ome-normative-dev-v1`
- Artifact: `out/reports/V001.md` (prepared 2026-10-01)
- Method: bounded offline research using only admitted workspace inputs; no Bash, no arbitrary code, no live fetching. Every claim below was checked against a complete read of the source.
- Source scope: the only source file present and read is `inputs/sources/S003.txt` (frozen OME-Zarr 0.5 normative capture, 896 lines, `https://ngff.openmicroscopy.org/0.5/`, sha256 `5d8b2408…2ae82de`). Probes for other sources and for a separate assignment file returned file-not-found; per method rules this is recorded as a coverage limit in the acquisition record, **not** as proof of corpus-wide absence.
- Plan under review: `inputs/plan/Viewer.md` (deliberately thin synthetic fixture).
- Brief: `inputs/brief.md` (Slide Scout: small read-only desktop browser for local OME-Zarr 0.5 filesets).
- Seed status: `inputs/candidate_seed.json` is an unverified reused candidate report (sections U001–U012). Every seed section was independently checked against the full source, plan and brief; outcomes are recorded in §R12 and in `out/verification/V001.json`. This report is a fresh standalone document: it preserves seed material that verification supported, states qualifications where the seed overstated, and rejects no seed finding as unsupported.
- Coverage: the whole brief, organized as two assignment groups —
  (1) opening a fileset, listing/selecting images, navigating multiresolution data (§R4);
  (2) channel/time/plane display, coordinate details, associated label overlays (§R5).
- Citation convention: `S003 Lx` / `S003 Lx–y` = exact line(s) in `inputs/sources/S003.txt`; `brief Lx` = line in `inputs/brief.md`; `Viewer.md Lx` = line in `inputs/plan/Viewer.md`. All RFC 2119 keywords are the source's own; conformance rules at S003 L57–59 and L868–888. Note S003 L875–876: "for readability, these words do not appear in all uppercase letters in this specification" — lowercase imperative text (e.g. S003 L96 "must be up to 5-dimensional", L300, L388–397 "use it") can still carry RFC 2119 force.
- Status vocabulary: **Obligation** (source MUST / MUST NOT, including lowercase imperatives read under the L875–876 caveat), **Recommendation** (source SHOULD), **Option** (source MAY / explicitly optional), **Product decision** (brief/plan choice the source does not settle), **Unsupported input** (in-scope-shaped data this viewer cannot display and must explain).

---

## R1 — Executive summary

The S003 capture fully determines the on-disk contract Slide Scout must read: Zarr v3 groups/arrays described by `zarr.json` files (S003 L68–72, L87–100), an `ome`-namespaced metadata block with a hierarchy-consistent `version: "0.5"` (S003 L150–165), and typed metadata keys (`multiscales`, `axes`, `coordinateTransformations`, `omero`, `labels`/`image-label`, `plate`, `well`, transitional `bioformats2raw.layout` + `series`).

The thin plan's core shape — open fileset → list images → canvas with pan/zoom, channel/time/plane controls, label overlays, details panel, responsive background reads, understandable failure messages, read-only local sessions (Viewer.md L5–11) — is directionally compatible with the source, but the source adds a large set of discovery, correctness, navigation, and display obligations the plan does not name: plate/well acquisition-aware discovery, multi-image-collection discovery, arbitrary dataset paths ordered largest→smallest, axis-order and `dimension_names` validation, composed per-level + global scale/translation transforms, unit handling, `omero` channel/window defaults, integer-only same-level-count labels with `image-label` colors, and version/metadata consistency checks.

The largest unsupported-input surface comes from S003 L70–72 ("all features of the Zarr format … may be used … unless explicitly disallowed", with no disallowance stated anywhere in the capture): codecs, chunk grids, data types, and storage transformers are unbounded by this source, so the viewer must fail gracefully on whatever its Zarr library cannot decode.

Reader-implementation behavior ("Tools", S003 L813–814) is only a pointer, so interoperability with real filesets is asserted by the plan but not evidenced by this source — the brief's "actual reader implementations" research goal (brief L5) is unresolvable inside S003 alone (see §R10). All proposed validation in §R13 is UNEXECUTED.

---

## R2 — Corpus read and acquisition bounds (complete list)

Artifacts read in full during this pass:

| Artifact | Role | Size / lines | sha256 (prefix) |
|---|---|---|---|
| `TASK.md` | task assignment / instructions | 2,662 B / 5 lines | `cd689452…` |
| `inputs/brief.md` | product brief | 905 B / 5 lines | `f4f88fae…` |
| `inputs/plan/Viewer.md` | thin plan under review | 1,498 B / 11 lines | `5f4d4db8…` |
| `inputs/sources/S003.txt` | primary normative source (OME-Zarr 0.5) | 36,980 B / 896 lines | `5d8b2408…` |
| `inputs/candidate_seed.json` | unverified reused candidate report | 49,549 B / 58 lines | `3628b059…` |

S003 was read end-to-end in three ranges (L1–100, L101–500, L501–896); the seed was read completely (first read display-truncated inside its final section; the remainder re-read at L50–58). Probes that returned file-not-found: `inputs/sources/S001.txt`, `inputs/sources/S002.txt`, `inputs/sources/S003.md`, `inputs/assignment.md`, `inputs/assignment/assignment.md`, `inputs/case/assignment.md`, `inputs/assignment_groups.md`, `inputs/groups.md`, `inputs/index.json`, `inputs/manifest.json`, `inputs/case.json`, `inputs/README.md`. A workspace-root probe (`assignment.md`) and all absolute-path reads were rejected by the tool boundary (ValueError), so root-level corpus content beyond `TASK.md` and `inputs/` could not be enumerated with the permitted tools. These failed searches are recorded as coverage limits only; no corpus-wide-absence claim is built on them. Full details: `out/acquisition/V001.json`.

---

## R3 — Governing conditions and reading rules (apply to every finding)

1. **Zarr v3 foundation.** "OME-Zarr is implemented using the Zarr format as defined by … version 3" (S003 L68–69). All Zarr features "may be used … unless explicitly disallowed" (S003 L70–72); this capture states no disallowance. Consequence: every Zarr-level generality (codecs, chunk grids, chunk key encodings, data types, storage transformers) is a potential input unless the product explicitly bounds it (§R8).
2. **Local layout generalizes.** The hierarchy "is represented here as it would appear locally but could equally be stored on a web server … or in object storage" (S003 L73–77). The brief/plan boundary is local-filesystem reading only (brief L5, Viewer.md L9), which is a **product-decision narrowing** of a location-agnostic format.
3. **Metadata placement and versioning.** OME-Zarr metadata lives in `zarr.json` files "under the namespaced key `ome` in attributes", with `ome.version` as a string (S003 L150–155); **the version MUST be consistent within a hierarchy** (S003 L156; example `"version": "0.5"` at S003 L157–165). A hierarchy mixing versions is non-conforming input; how (or whether) to open it is a product decision (§R7).
4. **RFC 2119 + transitional + non-normative text.** Keywords per RFC 2119 (S003 L57–59, L872–876; lowercase occurrences retain force per L875–876). Transitional metadata "is added … with the intention of removing it in the future"; implementations "may be expected (MUST) or encouraged (SHOULD)" to support reading it, but "writing will usually be optional (MAY)" (S003 L60–64) — directly relevant to `bioformats2raw.layout` and `omero`. "All of the text … is normative except sections explicitly marked as non-normative, examples, and notes" (S003 L877–878); examples/notes are fenced by "for example" / `class="example"` / "Note" (S003 L879–888). JSON comments "MUST NOT be included in JSON objects" (S003 L65–66).
5. **Release status.** "The current released version … is 0.5. Migration scripts will be provided between numbered versions. Data written with … an 'editor's draft' … will not necessarily be supported" (S003 L25–27). Only `0.5`-stamped hierarchies are in-contract; anything else is best-effort or rejected (§R8).
6. **Specification naming.** "Multi-word keys … should use … camelCase", with acknowledged pre-existing exceptions "to be updated in due course" (S003 L810–812). Do not "correct" non-conforming key spellings on read: `field_count` (S003 L538, L595), `rowIndex`/`columnIndex` (S003 L557–560), `label-value` (S003 L462), `starttime`/`endtime` (S003 L528), `maximumfieldcount` (S003 L524), the `field_count` vs `maximumfieldcount` spelling drift, and `bioformats2raw.layout` (S003 L200) must be matched literally. (This rule governs the specification's own keys; extending camelCase to the viewer's private session store is a product convention inspired by L810–812, not a source recommendation — see §R12, correction C3.)

---

## R4 — Group 1 — Opening a fileset, listing/selecting images, navigating multiresolution data

### 4.1 What "opening" means on disk (established obligations)

- An **image is a Zarr group** of groups/arrays; group attributes (incl. `multiscales`, `omero`) live in its `zarr.json` (S003 L87–89). Each pyramid level is a **separate Zarr array** (folder of chunks) whose own `zarr.json` governs decoding (S003 L91–100). Opening = parse Zarr v3 nodes + `ome` metadata; chunks decode "conforming to the Zarr array specification" (S003 L99–100). **Zarr v3 parsing is therefore a hard dependency of every plan feature.**
- **Fileset shapes are plural.** S003 defines three top-level shapes the opener must distinguish:
  1. Single/multi-image plain layout (`123.zarr`, `456.zarr` image groups, S003 L82–100);
  2. HCS plate layout `plate → row → well → field-of-view images` (S003 L118–148; §2.7–2.8);
  3. Transitional `bioformats2raw` collection (`series.ome.zarr` with `bioformats2raw.layout`, `OME/` group, numbered image groups, S003 L175–275).
  The thin plan says only "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Viewer.md L5) — it names none of these shapes. **Disposition: extend (required).** The opener must sniff, in order: `plate` (takes precedence where present, S003 L204–206, L262), else `bioformats2raw.layout`, else `multiscales` (single image), and report shape ambiguity rather than guessing (§4.2–4.3).
- **Read-only + session-local settings** (Viewer.md L9) is compatible with the source: nothing in S003 requires writing. The source never blesses mutating `zarr.json`/chunks during viewing; keeping display settings out-of-fileset satisfies "source files must remain unchanged" (brief L5).

### 4.2 Image discovery and listing (the plan's biggest gap)

| Fileset shape | Source rule for finding images | Plan status |
|---|---|---|
| Single image group | `multiscales` list in group `ome` metadata; "if only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback" with name-match-then-first pseudocode (S003 L388–397). Under L875–876 the imperative reading has RFC 2119 force even though the rule sits beside an example. | **Gap.** Plan has no multi-`multiscales` concept. First-as-fallback is the only stated deterministic rule; exposing a by-name choice is the source's own UX sketch. |
| HCS plate | Plate group implements `plate` (S003 L125–127); wells enumerated by `plate.wells[].path = "<row>/<column>"` with 0-based `rowIndex`/`columnIndex` all referring to the same pair (S003 L552–560); each well lists fields of view in `well.images[].path` (+ `acquisition` when multiple acquisitions exist, S003 L744–750). Rows/columns MUST list every physical row/column even if empty (S003 L532–533, L544–545); sparse plates enumerate only present wells (example S003 L641–739). Empty row/well groups SHOULD NOT be present (S003 L128–129). | **Gap.** Plan's flat "lists the images it finds" cannot express plate → well → field/acquisition identity. Product decision needed on listing chrome (tree vs flat with well/acquisition qualifiers), but the underlying enumeration is obligatory. |
| `bioformats2raw` collection | Top-level `ome.bioformats2raw.layout` MUST equal `"3"` (S003 L193–203, L256); images at `series` paths if given (`series` MUST be path strings in OME-XML `Image` order, S003 L264–267), else consecutively numbered groups from `0` (S003 L268–270); each group = exactly one OME-XML `Image` in order (S003 L270). `OME/METADATA.ome.xml` SHOULD exist, MUST be OME-XML with `<MetadataOnly/>` (S003 L257–260). If `plate` is also present it takes precedence and parsing follows §2.7 (S003 L204–206, L262–263); mixing collections with plates is impossible "at present" (S003 L206). | **Gap.** Plan is silent. Readers SHOULD NOT default to only the first image when several exist (S003 L272); MAY use `series`, MAY show all or offer a choice as with plates, MAY ignore other root groups/arrays (S003 L273–275). Minimum conforming behavior: make multiplicity visible and never silently open only image 0 of N. |
| Labels-as-images | `labels` group "is not itself an image; it contains images" (S003 L437–438). Label contents MUST NOT be listed as primary images. | **Gap.** Plan says "lists the images it finds" without excluding label subtrees. Disposition: exclude `labels/` subtrees from the image list; surface them only as overlays (§5.4). |

Additional discovery obligations and conditions:

- **Reader multiplicity rule (Recommendation, treated as required).** "SHOULD make users aware of the presence of more than one image (i.e. SHOULD NOT default to only opening the first image)" (S003 L272). A viewer that opens `0` and hides the rest violates a SHOULD. Because the plan's acceptance is "image discovery" (Viewer.md L11), this is treated as required.
- **Name constraints affect listing correctness.** Column/row names: alphanumeric only, case-sensitive, unique within their list; avoid case-insensitive-filesystem collisions (S003 L533–537, L546–549). Well image paths: alphanumeric, case-sensitive, unique within the well (S003 L746–748). The viewer MUST NOT case-fold or renormalize these identifiers when resolving paths.
- **Version/namespace checks gate everything.** Missing `ome` namespace or `ome.version`, or inconsistent versions across the hierarchy, violates S003 L150–156. Product decision: hard error vs best-effort open with a visible caveat; either way the plan's "opening failures explain which image or data could not be displayed" (Viewer.md L7) applies.
- **Counterevidence / uncertainty (discovery).** The value `"3"` of `bioformats2raw.layout` is unexplained (S003 L200, L256) — accept only `3`, reject/flag anything else. The multi-`multiscales` rule (S003 L388–397) carries no explicit RFC keyword and sits beside an example; its normative force is uncertain on its face but supported by the L875–876 keyword-case caveat; it is the only stated rule, so implement it and document the assumption. Row groups have **no metadata section** — rows are discoverable only via `plate.rows` + `plate.wells[].path` (S003 L542–560), never by scanning directories alone; directory enumeration without metadata is non-conforming discovery.

### 4.3 Selecting images, fields of view, and acquisitions

- Well fields enumerate as `{path, acquisition?}` (S003 L763–780, L795–803). `acquisition` is REQUIRED per image "if multiple acquisitions were performed in the plate" and MUST match a `plate.acquisitions[].id` (S003 L748–750); acquisition ids are unique integers ≥ 0 (S003 L520–522) with SHOULD-name, SHOULD-`maximumfieldcount` (positive int), MAY-description/starttime/endtime (integer epoch, S003 L523–529). Selection UI must key fields by **(well path, acquisition id, field path)** where acquisitions exist, not by bare index. The plan's "selecting an image" (Viewer.md L5) underspecifies this; **disposition: extend.**
- `plate.field_count` (SHOULD, positive int, "maximum number of fields per view across all wells", S003 L538–539) and `plate.name` (SHOULD string, S003 L540–541) are display hints, not discovery keys. `acquisitions[].name` SHOULD be shown where present (S003 L523–524).
- Uncertainty: the trigger "if multiple acquisitions were performed" (S003 L748–749) is ambiguous (length of `plate.acquisitions`? distinct acquisition ids actually referenced?). Implement lenient reading: honor `acquisition` wherever present; require it only when `plate.acquisitions` has > 1 entry; flag dangling ids as malformed input with an explanatory message.

### 4.4 Multiresolution navigation (pyramid levels, pan/zoom)

Established obligations (all §2.4, S003 L295–319):

- `multiscales[]` MUST contain `axes` (S003 L299) and `datasets[]` (S003 L304). Each `datasets[]` entry MUST contain `path` (relative to the image group) and `coordinateTransformations` (S003 L305–308).
- **`datasets[].path`s MUST be ordered "from largest (i.e. highest resolution) to smallest"** (S003 L305–306). The source's own gloss equates "largest" with *highest resolution*; it does not further define "resolution" (pixel count vs extent remains ambiguous for anisotropic data — see §R9 item 3). Array folder names are otherwise **arbitrary** ("the name of the array is arbitrary with the ordering defined by the `multiscales` metadata … often a sequence starting at 0", S003 L93–94). The viewer MUST navigate by metadata order, never by assuming `0` = full resolution or that names are numeric — even though the layout sketches show `0…n` (S003 L91–94) and label sketches show `0…` (S003 L116–117).
- All levels MUST share dimensionality (≤ 5) matching `axes` count and order (S003 L307).
- `axes` length MUST equal array dimensionality (S003 L173); `dimension_names` MUST be present in each level's array `zarr.json` and MUST match `axes[].name` (S003 L174). Mismatches are malformed levels: skip-with-message or refuse the image; do not silently remap axes.
- SHOULD-level pyramid metadata: `multiscales[].name` (S003 L317), `type` = downscaling method (S003 L318), `metadata` dict of method details (S003 L319; example `gaussian` + skimage params, S003 L375–382). The plan's "chooses an available pyramid level appropriate for the current view" (Viewer.md L5) is compatible but thin: the source adds that the viewer SHOULD surface `name`/`type` when choosing between pyramids or explaining quality, and MUST respect metadata order rather than folder sort.

What the plan gets right and what must be added:

- Right: level-per-view selection, pan/zoom canvas, background reads, cancelling superseded work, per-image failure messages with fallback selection (Viewer.md L5–7). None of this contradicts S003.
- Missing (required additions): metadata-order traversal; `dimension_names`⇔`axes` validation; per-level transform application (§5.3) so that "appropriate level" means *correctly registered*, not just fast; multi-`multiscales` choice with first-as-fallback (S003 L388–397); handling levels whose chunks/codecs the Zarr backend cannot decode as per-level unsupported input (§R8), not a whole-image crash.
- Uncertainty: "largest … to smallest" is glossed as "highest resolution" but never operationally defined. Implement total voxel count (product of array shape) as the ordering *sanity check* and flag violations without reordering — reordering would contradict "ordering defined by the `multiscales` metadata" (S003 L93–94).

### 4.5 Responsiveness, cancellation, failure feedback (plan §2 mapping)

- The source imposes no threading model, but it creates the performance obligation indirectly: images are chunked multi-GB-capable arrays (S003 L91–100) with unbounded Zarr features (S003 L70–72), and HCS/collection shapes multiply the node count. The plan's background reads + cancellation + no-freeze acceptance (Viewer.md L7, L11) is therefore **necessary architecture, not optional polish** — a product decision on mechanism (threads/tasks, tile cache, prefetch), but the *outcome* (navigation stays responsive; stale work cancels) is required to meet the brief's "remain responsive while opening large saved datasets" (brief L3).
- "Opening failures explain which image or data could not be displayed and allow the user to choose another item" (Viewer.md L7) and "malformed or unavailable input must produce understandable feedback rather than a crash" (Viewer.md L11) map to a long source-derived failure taxonomy the plan does not enumerate: missing / unparsable `zarr.json`; missing `ome`/`version`; version inconsistency (S003 L156); `axes`↔shape↔`dimension_names` mismatch (S003 L173–174, L307); missing/ill-ordered `datasets[].path`; missing scale transform (S003 L310); bad `plate.wells` paths/indices (S003 L553–560); dangling `acquisition` refs (S003 L748–750); non-`3` `bioformats2raw.layout` (S003 L256); non-integer label dtypes or level-count mismatch (S003 L438–439, L454–455); undecodable Zarr codecs/chunks (§R8). Each needs an item-scoped message (plate / well / field / level / label path), never a crash, never silent skip. **Disposition: extend (required).**

---

## R5 — Group 2 — Channel/time/plane display, coordinate details, label overlays

### 5.1 Axes: dimensionality, order, names, types (correctness core)

- **Rank and composition (Obligation).** `axes` length 2–5, equal to array rank (S003 L173, L299–300); MUST contain 2–3 `type: space` entries, MAY add one `type: time` and one `type: channel` **or** null/custom type (S003 L301). Image arrays "must be up to 5-dimensional with the axis of type time before type channel, before spatial axes" (S003 L96–97).
- **Order (Obligation).** Entries MUST parallel array dimension order AND MUST be type-ordered time → channel/custom → space (S003 L302). Three spatial axes with planar `yx` + stacking `z` SHOULD order `zyx` (S003 L303). The viewer MUST derive its t/c/z sliders from `axes` order + `type`, never from assumed `tczyx` positions: axis **names are arbitrary** (S003 L81), and 2-D (`yx`), 3-D, 4-D, and 5-D images are all conforming (S003 L296, L301). The plan's "time-point and plane selection where relevant" (Viewer.md L5) is correct in spirit but must be axis-driven: hide the t-slider when no `time` axis exists, hide channel controls when no `channel`/custom axis exists, and treat "plane" as the two innermost spatial axes per `axes`.
- **`name` uniqueness (Obligation).** Every `axes[].name` MUST be unique (S003 L168); `dimension_names` MUST match (S003 L174). Duplicate names or mismatches are malformed input.
- **`type`/`unit` (Recommendation with teeth).** `type` SHOULD be `space`/`time`/`channel`, MAY be other strings for custom axes (S003 L169); `unit` SHOULD be a UDUNITS-2 string from the enumerated space/time lists (S003 L170–172). Space units: angstrom … yottameter etc. (S003 L171); time units: attosecond … zettasecond (S003 L172). No channel-unit vocabulary is given. The viewer SHOULD honor units for calibrated display (§5.3) and MUST tolerate missing/unknown `type`/`unit` (they are SHOULD/MAY, not MUST): unknown units display literally with an "uncalibrated/unknown unit" caveat rather than erroring; missing `type` falls back to positional inference only as a labeled best-effort.
- **Uncertainty.** S003 L301 allows "a null / custom type" while L169 says `type` SHOULD be a string and MAY be "other string values" — null-typed axes are half-admitted. Implement: accept missing/null/unknown `type`, classify by position-between-known-axes only to place sliders, and label the axis frankly (e.g. "axis 1 (untyped)"). The version history's "dimension_names field **in axes** MUST be included" (S003 L827) conflicts in locator with the normative "MUST be included in the **zarr.json of the Zarr array**" (S003 L174); follow L174 (normative section beats history one-liner) and read `dimension_names` from each level's array `zarr.json`.

### 5.2 Channel / time / plane display and `omero` rendering defaults

- **Channel identity comes from `axes`; rendering defaults (transitional) from `omero`.** The `omero` block is "optional, but if present it MUST contain … `channels`" (S003 L426). Each entry MUST contain `color` (6 hex RGB digits, S003 L427) and `window` with `min`/`max`/`start`/`end` (S003 L428–430). The example additionally shows per-channel `active`, `coefficient`, `family`, `inverted`, `label`, `window{end,max,min,start}` plus `rdefs{defaultT, defaultZ, model: "color"|"greyscale"}` (S003 L401–423).
- **Semantics of the MUSTs (qualification preserved from verification).** S003's MUSTs at L426–430 bind the *content of conforming files* (a present `omero` block must carry `channels[].color` and `window{min,max,start,end}`); they do not, on their face, impose reader rendering behavior. §2.5 is transitional, and L60–64 says implementations "may be expected (MUST) or encouraged (SHOULD)" to support reading transitional data. The viewer's policy — apply `window.start/end` as initial contrast limits within `min/max`, and `color` as initial channel color — is therefore a **strongly motivated product decision implementing transitional read support**, not a source-imposed rendering MUST. Everything confined to the example (`active`, `coefficient`, `family`, `inverted`, `label`, all of `rdefs`) is **example-only** (non-normative per S003 L877–883): honor `active`/`label`/`rdefs.defaultT/defaultZ/model` as best-effort initial state, never require them. The plan's "channel visibility controls" and "time-point and plane selection" (Viewer.md L5) need this `omero`-aware initialization: initial visibility ← `active`, initial t/z ← `defaultT`/`defaultZ`, initial compositing ← `model`. **Disposition: extend.**
- **Counterevidence / gaps the viewer must handle frankly:**
  - "Array matching the c dimension size" appears only as an example comment (S003 L403) — length correspondence between `omero.channels` and the channel-axis extent is **not** a stated MUST. If lengths differ, degrade explicitly (apply by index to the overlap, default the rest, note the mismatch) rather than assuming either side is authoritative.
  - There is no normative color/window semantics beyond field presence (no gamma/family registry, no out-of-range rule). `window` values outside the dtype range, `start > end`, or malformed `color` are malformed-input messages, not crashes.
  - Absent `omero`, all rendering state (visibility, color, contrast, initial t/z) is a **product decision** (sensible defaults + session-local persistence, Viewer.md L9). The details panel should state "no embedded display defaults" in that case.
- **"Plane selection where relevant" (Viewer.md L5).** With a `z` space axis present, z-selection applies; with only 2 space axes, the "plane" is the whole level and no z-slider exists. Time selection exists only with a `time` axis. This relevance rule is axis-derived (§5.1), not dtype- or shape-guessed.

### 5.3 Coordinates: transforms, units, and the details panel

This is the brief's "read correctly calibrated coordinates" requirement (brief L3) and the plan's "details panel shows dimensions, units and coordinates" (Viewer.md L5). The source makes it a precise computation:

- **Transform vocabulary (Obligation).** `coordinateTransformations` is an ordered list applied sequentially and in order (S003 L279–293): `identity` (default, usually implicit, S003 L282–283); `translation` (`translation: float[]` or binary `path`, S003 L284–286); `scale` (`scale: float[]` or binary `path`, S003 L287–289). Each entry MUST contain `type` (S003 L279–280).
- **Per-level image transforms (Obligation).** Each `datasets[]` entry's list MUST contain only `translation`/`scale` (S003 L309); MUST contain **exactly one scale** expressing "pixel size in physical units or time duration" or — where scaling is unavailable/inapplicable for an axis — "the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0 if there is no downsampling along the axis" (S003 L310); MAY contain **exactly one translation** = offset from origin in physical units, which MUST follow scale so it is expressed in physical coordinates (S003 L311); scale/translation vectors MUST match `axes` length (S003 L312).
- **Global image transforms (Option with composition rule).** `multiscales[].coordinateTransformations` MAY exist, follows the same type/order rules, and is "applied after" the per-level transforms — e.g. a shared time scale (example S003 L368–374 scales `t` by 0.1 uniformly, within the worked example L320–387). Physical coordinate = `global(scale∘translate) ∘ perLevel(scale∘translate)` applied to integer data indices, in listed order (S003 L293, L314–316). The viewer MUST compose both levels; applying only per-level transforms miscalibrates every axis the global transform touches (notably time in the worked example).
- **Worked calibration (normative-section example, S003 L320–387).** 5-D `tczyx`, t-unit millisecond, xyz-unit micrometer; level 0 scale `[1,1,0.5,0.5,0.5]`, level 1 `[1,1,1,1,1]`, level 2 `[1,1,2,2,2]`; global `[0.1,1,1,1,1]`. Physical voxel at level 0: Δt = 0.1 ms, Δc dimensionless ×1, Δxyz = 0.5 µm. The details panel must show per-axis `name / type / unit / per-level scale / global scale / composed physical extent`, and the cursor readout must convert hover indices through the composed transform of the *currently displayed level*.
- **Details-panel content (derived requirements).** Dimensions (rank + per-axis array extents per level + `axes[].name`), units (per-axis `unit` or "none/unknown"), coordinates (composed physical position of cursor / view center + voxel size at current level), plus pyramid identity (`multiscales[].name/type`, level path, downscaling note). The plan names "dimensions, units and coordinates" but not the two-level composition, per-level voxel sizes, or unit caveats. **Disposition: extend (required for "correctly calibrated").**
- **Uncertainty and edge cases (preserved, not papered over):**
  - Scale-fallback reading (S003 L310): for axes without physical scaling the value is a *relative* factor vs level 0 (default 1.0). The viewer cannot know from the number alone whether a `1.0` is "1 physical unit" or "no downsampling" — it MUST pair every scale with its axis's `unit` presence: no `unit` ⇒ report "uncalibrated (relative scale N)" rather than inventing units. Channel axes never have meaningful physical scale; display channel index, not converted coordinates.
  - "Offset from the origin" (S003 L311) never defines the origin; treat translations as relative to the image-group frame and say so.
  - Binary `path` form for scale/translation (S003 L285–289) has no dtype/shape/endianness rule in this capture: **unsupported input** unless the Zarr backend resolves it; message must name the transform and level.
  - Missing scale transform, wrong vector length, non-scale/translation types in image transforms, or translation-before-scale all violate S003 L309–312: malformed-level handling (§4.5), never silent reinterpretation.

### 5.4 Label overlays (associated label images)

- **Location and discovery (Obligation).** The `labels` group nests inside the image group beside the resolution arrays (S003 L102–108, L437); its `zarr.json` MUST carry `ome.labels[]` = paths to labeled multiscale images, and all label images SHOULD be listed there (S003 L441–453; examples `{"labels": ["original/0"]}` at S003 L104–105 and `["cell_space_segmentation"]` at S003 L444–453). Intermediate folders between `labels/` and the image are allowed but MUST NOT contain metadata (S003 L110, L439–440); label image names are arbitrary (S003 L112, L440). The viewer MUST discover overlays via `ome.labels[]`, MUST resolve through metadata-less intermediate folders, and MUST NOT require fixed names. Unlisted-but-present label images (SHOULD-listed, so possibly absent) are a product decision: ignore (conforming) vs scan-and-offer (helpful); document the choice.
- **Label image contract (Obligation).** Each label image's `zarr.json` MUST implement `multiscales` (S003 L454); its `datasets[]` MUST have the **same number of entries (scale levels)** as the source image (S003 L454–455); pixel dtype MUST be an integer in `[uint8,int8,uint16,int16,uint32,int32,uint64,int64]` (S003 L438–439; layout restatement "only integer values are supported", S003 L116–117). Violations are per-overlay errors with the label path named.
- **Alignment (near-obligation with a documented gap).** Labels are "in the same coordinate system … (usually having the same dimensions and coordinate transformations)" (S003 L432–433); the layout overview adds "each dimension … either the same as the corresponding dimension … or 1 if … irrelevant" (S003 L106–108). "Usually" + overview-only broadcast rule = uncertain normative force. Implement: render the label level corresponding to the current image level (same index, counts being equal), broadcast length-1 label axes, verify composed transforms match where present, and **warn visibly on any mismatch** (different extents beyond broadcastable 1s, different scales) rather than silently stretching. Never resample labels with interpolating filters as if they were intensity data — values are categorical (`0`/`1` cellular example, S003 L434–435, L513–514); overlay rendering is nearest-neighbor by semantic necessity (product decision on the record, justified by the integer-label contract).
- **`image-label` display metadata (Recommendation/Option).** SHOULD be present alongside `multiscales` (S003 L456–458). When present: `colors[]` (each entry MUST have integer `label-value`, MAY have `rgba` uint8×4 with alpha-as-opacity, S003 L458–466; extra keys allowed); `version` string MUST be present (value vocabulary unspecified, S003 L459–460); `properties[]` MAY add per-`label-value` arbitrary key-values (S003 L467–471); `source` MAY give `{"image": <relative path>}`, default `"../../"` (S003 L472–474). Conforming readers SHOULD display labels using `colors[]` (S003 L461). Worked example: value 0 → `[0,0,128,128]` (50% blue), value 1 → `[0,128,0,128]` (50% green), with `properties` areas/classes and `source.image "../../"` (S003 L476–514). Viewer rules: honor `rgba` incl. alpha compositing; entries without `rgba` need a deterministic fallback palette (**product decision**, documented); surface `properties` in the details panel / legend; follow `source.image` only to *annotate* provenance (default `"../../"`), not to relocate the overlay.
- **Plan mapping.** "Optional overlays for associated label images" + "aligned label overlays" acceptance (Viewer.md L5, L11) is the right shape but omits: `ome.labels[]`-driven discovery, integer-dtype and level-count validation, level-locked + broadcast-aware alignment with mismatch warnings, `image-label` color/legend/properties rendering, and per-overlay failure messages. **Disposition: extend (required).**
- **Uncertainty.** `image-label.version` values are unspecified — accept any string, display it, never gate on it. Whether a label image's own `axes`/`coordinateTransformations` or the parent's govern alignment when both exist is unstated; implement "label's own transforms, verified against parent's, warn on divergence" and record the assumption.

---

## R6 — Obligations vs recommendations vs options vs product decisions (whole brief)

### 6.1 Established obligations (MUST — viewer must implement or explicitly reject-with-message)

1. Parse Zarr v3 groups/arrays via `zarr.json` (S003 L68–72, L87–100).
2. Read `ome`-namespaced metadata; require hierarchy-consistent `ome.version` (S003 L150–156); reject JSON comments (S003 L65–66).
3. `axes` rank 2–5 = array rank; 2–3 space + ≤1 time + ≤1 channel/custom; time→channel→space order paralleling array order; unique names; `dimension_names` in each level's array `zarr.json` matching names (S003 L96–97, L168, L173–174, L299–302).
4. Traverse `datasets[]` by metadata order largest→smallest with arbitrary paths (S003 L93–94, L305–306).
5. Apply per-level exactly-one-scale (+optional one translation-after-scale) composed with optional global transforms, vectors matching `axes` length (S003 L308–316).
6. Discover HCS via `plate` → `wells[].path/rowIndex/columnIndex` → `well.images[]` with full row/column enumeration and acquisition matching (S003 L552–560, L744–750); respect precedence of `plate` over `bioformats2raw.layout` (S003 L204–206).
7. Read transitional collections: `bioformats2raw.layout == "3"`, `series`-or-numbered-groups discovery, OME-XML order correspondence (S003 L256–270).
8. When `omero` is present, read `channels[].color + window{min,max,start,end}` as the transitional rendering defaults the source requires files to carry (S003 L426–430; reader-side use is motivated product implementation of transitional read support — §5.2).
9. Discover labels via `ome.labels[]`; enforce integer dtype + equal level count + `multiscales` on label images (S003 L438–455).
10. Never write to the fileset; keep display state session-local (brief/Viewer.md boundary consistent with S003's read-side silence).

### 6.2 Recommendations (SHOULD — implement or record a reasoned exception)

- Surface multiplicity; don't default to first-only (S003 L272). · `zyx` spatial order (S003 L303). · UDUNITS-2 units (S003 L170–172). · `multiscales[].name/type/metadata` surfaced (S003 L317–319). · `OME/METADATA.ome.xml` presence tolerated/used (S003 L257–260). · Label `image-label` colors for display (S003 L461). · `plate`/acquisition/well SHOULD fields displayed (`field_count`, names, `maximumfieldcount`, well `version`; S003 L523–525, L538–541, L751–752). · Omit-presence of empty row/well groups assumed (S003 L128–129). · (Product convention inspired by, not mandated by, S003 L810–812: camelCase keys in the viewer's own session store.)

### 6.3 Options (MAY / explicitly optional — product decides, then documents)

- `omero` block as a whole; `bioformats2raw` `series` use; show-all-vs-choose-one collection UX; ignoring non-image root children (S003 L273–275). · Global `multiscales` transforms; `properties`/`source` label keys; extra `colors` keys (S003 L314–316, L466–474). · `acquisitions` block; `description`/timestamps (S003 L518–529). · Custom axis types/units (S003 L169–170). · Any Zarr v3 feature the backend supports (S003 L70–72).

### 6.4 Product decisions the source does not settle (need explicit review per Viewer.md L9)

Listing chrome for plate/well/acquisition/field identity; multi-`multiscales` picker design; "appropriate level" heuristic (viewport coverage vs bandwidth vs quality); tile cache/prefetch/cancellation mechanics; default rendering absent `omero`; fallback label palette; unlisted-label scan policy; version-mismatch and mixed-hierarchy policy; binary-`path` transform support; uncalibrated-axis presentation; message catalog wording; performance budgets behind "must not freeze" (Viewer.md L11).

---

## R7 — Plan disposition (sentence-by-sentence, Viewer.md)

- L5 "opens a local OME-Zarr 0.5 fileset and lists the images it finds" — **EXTEND (required).** Add shape-sniffing (single image / plate / collection, §4.1), metadata-driven enumeration (§4.2), acquisition-aware identity (§4.3), exclusion of `labels/` subtrees from the image list (§5.4), and version/namespace gating (§R3 item 3).
- L5 "canvas with pan and zoom" — **KEEP**, conditioned on level-locked calibrated rendering (§4.4, §5.3).
- L5 "channel visibility controls, time-point and plane selection where relevant" — **EXTEND (required).** Drive control presence from `axes` types (§5.1); initialize from `omero`/`rdefs` best-effort (§5.2).
- L5 "optional overlays for associated label images" — **EXTEND (required)** per §5.4 (discovery, validation, alignment, `image-label` rendering, legends).
- L5 "details panel shows dimensions, units and coordinates" — **EXTEND (required)** per §5.3 (composed transforms, per-level voxel sizes, unit caveats, pyramid/label identity).
- L5 "chooses an available pyramid level appropriate for the current view" — **KEEP + CONSTRAIN.** Metadata order only; document the "appropriate" heuristic as a product decision (§4.4, §6.4).
- L7 "background reads … responsive … cancels superseded work" — **KEEP (architecturally required).** No source mechanism; outcome required by data scale (§4.5).
- L7 "failures explain which image or data … allow … another item" — **EXTEND (required).** Adopt the §4.5 item-scoped failure taxonomy; every MUST-violation needs a named, non-crash message.
- L9 "interoperate with filesets from real OME-Zarr 0.5 tools" — **FLAG: unevidenced in S003.** No implementation data in scope (§R10); acceptance needs real filesets the source cannot supply.
- L9 "source files unchanged; display settings session-local" — **KEEP.** Consistent with S003.
- L9 "editing, export, remote storage, automated/clinical interpretation out of scope" — **KEEP.** Source location-agnosticism (S003 L73–77) is narrowed by explicit boundary (§R3 item 2); "additional capability choices require explicit review" aligns with §6.4. (Brief L5 words the boundary as "remote services"; the plan narrows to "remote storage".)
- L11 acceptance (discovery, navigation, channel/plane, coordinates, overlays, no-freeze, malformed-input feedback) — **KEEP, with the acceptance bar raised** to the extended behaviors above; each maps to a source-derived checklist in §R13.

---

## R8 — Unsupported-input limitations (must all produce clear, item-scoped explanations)

- **In-contract-but-undisplayable (viewer_limitation — message + continue):** Zarr v3 features the backend cannot decode (codecs, chunk grids, chunk key encodings, dtypes, storage transformers — S003 L70–72 explicitly unbounded); binary-`path` scale/translation (S003 L285–289, underspecified); unlisted label images if scan policy is off; custom axis types/units beyond display vocabulary (S003 L169–170).
- **Out-of-contract (malformed-input — message + fallback selection, Viewer.md L7/L11):** bad/missing `zarr.json`/`ome`/`version`; version inconsistency (S003 L156); rank/axis/order/`dimension_names` violations (S003 L173–174, L299–307); path-order violations (S003 L306); transform violations (S003 L309–312); bad well paths/indices or dangling acquisitions (S003 L553–560, L748–750); non-`3` layout (S003 L256); non-integer or level-mismatched labels (S003 L438–455); malformed `omero`/color/window (S003 L426–430).
- **Out-of-scope by product boundary (brief L5, Viewer.md L9):** remote stores (despite S003 L73–77), editing/export, pre/post-0.5 versions and editor's drafts (S003 L25–27), OME-XML beyond MetadataOnly correspondence (S003 L257–260), clinical interpretation.

No silent skips, no crashes, no invented calibration — every case names the item (plate/well/field/level/label path) and offers another selection.

---

## R9 — Counterevidence, uncertainty, and unresolved areas

1. `dimension_names` locator conflict: normative array-`zarr.json` (S003 L174) vs history "in axes" (S003 L827). Follow L174; unresolved whether validators enforce both.
2. Null axis type half-admitted (S003 L301 "null / custom" vs L169 strings-only). Lenient read adopted (§5.1).
3. "Largest→smallest" (S003 L306) is glossed by the source itself as "i.e. highest resolution" — a partial metric — but "resolution" is never operationally defined (pixel count? extent?). Voxel-count sanity check adopted without reordering (§4.4). *(This corrects the seed's stronger "no metric" wording.)*
4. Scale `1.0` ambiguity: physical unit vs relative no-downsampling factor (S003 L310); unit-paired display adopted (§5.3). Translation origin undefined (S003 L311); image-group frame assumed.
5. Global-vs-per-level composition "applied after" (S003 L315) implemented as outer∘inner; no worked multi-axis example beyond time (S003 L368–374).
6. Multi-`multiscales` name/fallback rule (S003 L388–397) lacks explicit RFC keywords; with L875–876 the imperative reading gains force; implemented as the only stated rule either way.
7. `omero.channels` length correspondence is comment-only (S003 L403); overlap-degrade adopted (§5.2). `rdefs`/ siblings are example-only (S003 L419–423); best-effort adopted. No window-semantics/out-of-range rule.
8. Label alignment "usually" (S003 L433) + overview-only broadcast rule (S003 L106–108); warn-on-divergence adopted (§5.4). Label-vs-parent transform precedence unstated.
9. `image-label.version`, `plate.version`, `well.version` vocabularies unspecified (S003 L459–460, L550–551, L751–752); accept-and-display adopted.
10. `bioformats2raw.layout == "3"` unexplained (S003 L200, L256); accept-only-`3` adopted. "Multiple acquisitions" trigger ambiguous (S003 L748–749); >1-entry rule adopted (§4.3).
11. Binary-`path` transforms lack dtype/shape rules (S003 L285–289); unsupported-input adopted.
12. `field_count` ("fields per view" sic, S003 L538–539) vs `maximumfieldcount` (S003 L524–525) semantics overlap; display-hints-only adopted. Editorial duplicate "by the by the" (S003 L93–94) has no semantic effect.
13. Keyword-case caveat (S003 L875–876: RFC 2119 words "do not appear in all uppercase letters") means lowercase imperatives (L96 "must", L300, L388–397) were read as potentially normative; where force remains genuinely indeterminate it is labeled above.
14. Whole-format risk: S003 L70–72 admits all of Zarr v3 by reference without pinning a profile; S003 L813–814 ("Tools") and §5 Citing (L815–820) carry no implementation requirements. Real-world codec/chunk/dtype distributions and reader-tolerance behaviors are **unresolved inside this source** (see §R10).

---

## R10 — Reader-implementation research: what this source cannot supply (brief L5 caveat)

The brief asks to "research the format and actual reader implementations broadly enough to uncover compatibility, correctness, navigation and display requirements" (brief L5). Within the fixed S003-only scope, implementation evidence is absent: §4 "Implementations — See Tools" (S003 L813–814) is an unresolvable pointer in a no-fetch assignment, and no reader-tolerance, performance, caching, or error-handling behavior is specified anywhere in the capture. Consequently: (a) the plan's "interoperate with filesets from real OME-Zarr 0.5 tools" (Viewer.md L9) is a **product requirement without source evidence** — satisfying it needs out-of-scope real filesets and reader code the evaluator must supply or authorize; (b) all compatibility claims above rest on conformance text alone and are labeled accordingly; (c) no implementation-derived requirement has been invented to fill the gap. This is a scope limitation, not a finding of incompatibility.

---

## R11 — Seed verification outcomes (independent check of `inputs/candidate_seed.json`)

Method: every seed section (U001–U012) and every S003 line citation in it was checked against a complete fresh read of S003 (all 896 lines), the plan, and the brief. Full notes: `out/verification/V001.json`.

- **Supported (preserved herein):** U001 header facts (896-line capture, source URL, brief/plan descriptions); U002 executive summary; U003 all six governing conditions with citations; U004 Group 1 findings and all cited lines; U006 obligation/option split; U007 plan dispositions (Viewer.md L5/L7/L9/L11 verified); U008 unsupported-input classes; U010 reader-evidence gap; U011 UNEXECUTED validation labels; U012 source-line index (every locator spot-checked).
- **Qualified (corrections applied in this report):**
  - **C1 (seed U009 item 3):** "Largest→smallest metric undefined" overstated — S003 L306 itself glosses "largest (i.e. highest resolution)"; residual ambiguity is in defining "resolution", not in total absence of a metric (§R9 item 3, §4.4).
  - **C2 (seed U005 §4.2):** the seed frames applying `omero` window/color as MUST-level viewer obligations. The source MUSTs (L426–430) bind file content; reader-side rendering use is a motivated product implementation of transitional read support (L60–64), labeled accordingly (§5.2, §6.1 item 8).
  - **C3 (seed U006 §5.2):** camelCase for the viewer's own session-store keys is a product convention *inspired by* S003 L810–812, which governs the specification's keys — reclassified out of source-backed recommendations (§R3 item 6, §6.2).
  - **C4 (framing):** the seed's "both assignment groups" structure is its own organization of the brief's capability list (brief L3); no separate assignment artifact is present in `inputs/` (probes recorded in §R2 / acquisition record — a coverage limit, not an absence claim).
- **Rejected as unsupported: none.** No seed finding failed verification; the four items above are qualifications of strength or framing, not reversals.

---

## R12 — Plan implications carried forward

The accepted plan core (Viewer.md L5–11) survives verification unchanged in intent; every extension above is additive and source-cited. The two plan assertions that cannot be closed inside this corpus are (a) interoperability with real tool output (§R10) and (b) performance adequacy on real large datasets (mechanism unspecified in both plan and source). Both remain product risks pending the out-of-scope validation V9 (§R13). Capability choices beyond the accepted core require explicit review per Viewer.md L9 and §6.4.

---

## R13 — Proposed validation (all UNEXECUTED — no execution was authorized or performed)

No filesets were opened, no code was run, no live source was fetched; every check below is a proposal only.

- V1 (UNEXECUTED): Open a single-image fileset; assert `ome.version` consistent, `axes`⇔shape⇔`dimension_names` agreement, metadata-order level traversal, and composed physical voxel sizes against the §5.3 worked values.
- V2 (UNEXECUTED): Open sparse + dense HCS plates; assert well/field/acquisition enumeration, index↔path consistency, and acquisition-qualified selection.
- V3 (UNEXECUTED): Open `bioformats2raw` collections with/without `series` and with/without `plate`; assert precedence, order correspondence, and first-image-not-defaulted behavior.
- V4 (UNEXECUTED): Drive channel/time/plane controls from `axes` across 2/3/4/5-D images incl. untyped axes; assert slider presence/absence and `omero` initialization incl. length-mismatch degradation.
- V5 (UNEXECUTED): Verify cursor/view-center coordinates through composed per-level+global transforms at every level, incl. uncalibrated-axis labeling and translation handling.
- V6 (UNEXECUTED): Overlay labels incl. intermediate folders, broadcastable length-1 axes, `rgba`/alpha compositing, fallback palette, properties legend, and mismatch warnings; assert integer-dtype and level-count gating.
- V7 (UNEXECUTED): Inject each §R8 malformed case; assert item-scoped messages, no crash, and fallback selection.
- V8 (UNEXECUTED): Load a large dataset; assert responsive navigation, superseded-work cancellation, and session-local settings with byte-identical source files.
- V9 (UNEXECUTED, out-of-scope unless authorized later): Cross-check against real OME-Zarr 0.5 tool outputs and reader implementations to close §R10.

---

## R14 — Source-line index (primary locators)

Storage/Zarr v3: S003 L68–72 · local/remote layout: L73–77 · image layout: L79–100 · arbitrary names, metadata order: L93–94 · ≤5-D, t<c<space: L96–97 · chunks: L99–100 · labels overview: L102–117 · label dims same-or-1: L106–108 · HCS hierarchy: L118–148 · empty-row/well SHOULD NOT: L128–129 · `ome` namespace + consistent `version`: L150–165 · `axes`: L167–174 · transitional rules: L60–64 · JSON comments MUST NOT: L65–66 · `bioformats2raw.layout`: L175–275 (layout L183–191, top key L193–203, plate precedence L204–206/L262–263, `series` L243–253/L264–267, numbered fallback L268–270, readers L271–275) · transforms: L277–293 (sequential L293) · `multiscales`: L295–319 (order L305–306, scale L310, translation L311, global L314–316, name/type/metadata L317–319; example L320–387; multi-choice L388–397) · `omero`: L399–430 (MUSTs L426–430) · `labels`/`image-label`: L432–514 (dtypes L438–439, listing L441–453, level-count L454–455, colors L461–466, properties/source L467–474, example L476–514) · `plate`: L516–739 (acquisitions L518–529, columns L530–537, field_count/name L538–541, rows L542–549, version L550–551, wells L552–560, examples L561–739) · `well`: L741–808 (images L744–750, version L751–752, examples L753–808) · naming L810–812 · implementations pointer L813–814 · version history L822–866 (`dimension_names` L827, Zarr v3 L833) · conformance L868–888 · release status L25–27.

*End of report. All findings are S003-supported as cited; §R9–§R10 record what the source does not settle; §R13 validation is UNEXECUTED. Seed verification outcomes: §R11; immutable notes at `out/verification/V001.json`; acquisition record at `out/acquisition/V001.json`.*
