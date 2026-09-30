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
