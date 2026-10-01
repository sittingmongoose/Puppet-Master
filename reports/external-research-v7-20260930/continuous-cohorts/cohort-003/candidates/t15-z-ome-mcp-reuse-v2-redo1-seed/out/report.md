# Slide Scout — OME-Zarr 0.5 format obligations and viewer-plan research report

**Status:** standalone current research report (final). **Prepared:** 2026-10-01.
**Assignment:** inputs/TASK.md — investigate the format obligations and implementation requirements that the admitted thin viewer plan (inputs/plan/Viewer.md) needs, over the whole brief (inputs/brief.md), with source scope limited to the frozen normative capture `sources/S003.txt` (OME-Zarr 0.5). No live fetching was performed or permitted.
**Proposed validation: UNEXECUTED** (see §10). No execution evidence exists in this corpus.

---

## 1. Method and acquisition summary

- All admitted inputs were read in full with the bounded read tool, expanding until every governing source byte was inspected: inputs/brief.md (5 lines), inputs/TASK.md (11 lines), inputs/catalog.json (40 lines), inputs/sources/S003.txt (896 lines, complete), inputs/plan/Viewer.md (21 lines), plus the task card TASK.md (9 lines).
- The S003 capture read back with sha256 `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`, byte-identical to the catalog's `original_sha256`/`view_sha256` (36,980 bytes, 896 lines), so all line locators below are pinned to that verified version.
- No external queries, searches, or fetches were executed (the assignment forbids live sources for this bounded case); consequently no claim of absence in the wild is drawn from any search, and none is asserted.
- Findings were compiled as F01–F14 (full standalone bodies in `findings.json`); each maps to exact S003 line ranges recorded in `acquisition.json`. False-dismissal checks are in §7.

## 2. Source register

| Handle | Content | Version pin | Locators |
|---|---|---|---|
| S003 | OME-Zarr 0.5 normative capture (Final Community Group Report, 8 September 2026; editor Josh Moore; OME, U. Dundee) | `capture-only:5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`; alias URI `https://ngff.openmicroscopy.org/0.5/` (catalog alias `SRC-2b11c54af373e1979af8cbb3`) | lines 1–896; section map: §1 Storage 67–117; §1.2 HCS 118–148; §2 Metadata 149–808; §3 naming 809–812; §4 Implementations 813–814; §5 Citing 815–820; §6 Version history 821–866; Conformance 867–878 |

Only S003 is admitted (catalog: “Fixed admitted source S003 only”). The Zarr v3 specification, OME-XML, UDUNITS-2, and the OMERO WebGateway documentation are referenced by S003 but not included; statements that rest on them are flagged as transfer limits (§8) rather than treated as verified.

## 3. Findings (summary; full bodies in findings.json)

**Group A — opening a fileset, listing/selecting images, navigating multiresolution data**

- **F01 Zarr v3 basis.** OME-Zarr 0.5 is implemented on Zarr specification v3; all Zarr features (codecs, chunk grids, chunk key encodings, data types, storage transformers) may appear unless explicitly disallowed (S003 67–72, 99–100). Reader codec breadth is a compatibility risk; chunk-aligned partial reads underpin responsiveness.
- **F02 Image hierarchy.** Each image is a Zarr group with `multiscales`/`omero` in `zarr.json` (87–89); pyramid levels are separate arrays whose names are arbitrary — ordering is defined by `multiscales` metadata (91–94); arrays are up to 5-D with time before channel before spatial axes (96–97); optional `labels` group sits beside the levels (102–108, 110–117).
- **F03 HCS hierarchy.** Plate/row/well grouping with MUST-level well and plate implementations (119–127); empty rows/wells SHOULD NOT be present, so sparseness is normal (128–129).
- **F04 `ome` namespace and version.** All OME metadata lives under `attributes.ome`; the version string MUST be consistent within a hierarchy (152–156).
- **F06 bioformats2raw.layout collections.** Transitional multi-image layout (`OME/METADATA.ome.xml`, `series`, numbered groups). MUSTs: layout value `3` (256); `series` is a string list whose order matches OME-XML Images (265–267); consecutive-numbered fallback (268–270); `plate` key takes precedence when present (204–206, 262). Readers SHOULD make users aware of more than one image and SHOULD NOT default to only the first (271–275).
- **F11 plate metadata.** MUST fields `columns`, `rows`, `version`, `wells` (with 0-based `rowIndex`/`columnIndex`, path = row + / + column) and acquisition `id` uniqueness; SHOULD `field_count`, plate `name` (518–560); dense and sparse examples (561–739).
- **F12 well metadata.** MUST `images` list of fields of view with unique alphanumeric case-sensitive paths; `acquisition` id required when the plate has multiple acquisitions (744–750).
- **F13 JSON strictness.** Comments MUST NOT appear in JSON objects (65–66); transitional metadata may be MUST/SHOULD to read (60–64); camelCase convention with legacy exceptions (809–812).
- **F14 Conformance and currency.** RFC 2119 keywords; all non-example text normative (56–59, 867–878); edition pinned to 0.5 (8 Sep 2026); editor’s drafts not necessarily supported (24–27); 0.5.0 moved to Zarr v3 (831–833), so 0.4-era (v2) filesets are outside a pure v3 reader; Implementations section is only a pointer (813–814).

**Group B — channel/time/plane display, coordinate details, label overlays**

- **F05 axes.** `name` MUST exist and be unique; `type` and `unit` are SHOULD-level (types `space`/`time`/`channel`, custom allowed; UDUNITS-2 strings enumerated at 171–172); axes length MUST equal array dimensionality; `dimension_names` MUST be included in each level array’s `zarr.json` and match (167–174).
- **F07 coordinateTransformations.** Entries MUST have `type` ∈ {`identity` (default), `translation`, `scale`}; translation/scale vectors may be inline or binary via `path`; applied sequentially in list order (276–293).
- **F08 multiscales.** MUSTs: `axes` (2–5 dims, time→channel/custom→space order, 299–302); `datasets` ordered largest-to-smallest resolution (304–306); per-dataset transforms with exactly one `scale` (default 1.0 per axis when no downsampling), optional single `translation` after `scale`, vector lengths equal to axes (308–312); SHOULDs: `zyx` spatial order (303), `name`/`type`/`metadata` (317–319); MAY: group-level transforms applied after dataset-level ones (314–316); multiple named multiscales: user chooses by name, first is fallback (388–397).
- **F09 omero (transitional).** Optional; if present MUST contain `channels`, each with 6-hex-digit `color` and `window` (`min`/`max`/`start`/`end`) (426–430); `rdefs` defaults (`defaultT`, `defaultZ`, `model`) appear in the informative example only (401–425).
- **F10 labels/image-label.** Label pixels MUST be integer dtypes (438–439); the `labels` group MUST list member paths in `zarr.json` (441–443, listing all is SHOULD; cf. prose at 104–105); label images MUST implement multiscales with the same number of levels as the source image (454–455); `image-label` SHOULD with `colors` (MUST array; per-object integer `label-value`; MAY `rgba` 0–255 with alpha) — readers SHOULD display with those colors (456–466); optional `properties` and `source` (default `../../`) (467–474); label dims equal image dims or 1 (106–108).

## 4. Obligation vs optional vs product decision

| Class | Items (source lines) |
|---|---|
| Established obligations (MUST) | Zarr v3 basis for 0.5 (68–69); `ome` version consistency (156); axes unique `name`, length = dims, `dimension_names` present/matching (168, 173–174); multiscales axes/datasets presence, 2–5 dims, type order (299–302); dataset path order largest→smallest (305–306); exactly one scale per dataset, translation after scale, vector lengths (308–312); transform types restricted in multiscales context (309); transform entry `type` field (279–280); sequential application (293); labels integer dtypes (438–439), `labels` key listing (441–443), label multiscales with equal level count (454–455), intermediate label groups carry no metadata (439–440); b2fr layout value `3` (256), series string list + order rules (265–267), numbered-group fallback (268–270), plate precedence (204–206); plate `columns`/`rows`/`version`/`wells` constraints (530–560); well `images` constraints and conditional `acquisition` (744–750); conditional omero `channels`/`color`/`window` fields (426–430); no JSON comments (65–66) |
| Optional capabilities (SHOULD/MAY in the format) | axes `type`/`unit` present (169–170); `zyx` ordering (303); multiscales `name`/`type`/`metadata` (317–319); group-level coordinateTransformations (314–316); translation at all (311); omero presence (426); image-label and rgba colors (456–466); label listing completeness (442); plate `field_count`/`name`, acquisition names (523–541); well `version` (751–752); binary `path` form of transforms (285–289); reader MAY show all images or offer a choice, MAY use `series`, MAY ignore unrelated groups (273–275); multiple named multiscales chooser with first-as-fallback (388–397) |
| Product decisions (format silent or open) | Codec support breadth (F01); HTTP/S3 backends — out of product scope (73–77); presentation of multi-image collections (274); default rendering when `omero` absent (F09); label color fallback when `image-label` absent (F10); unit display formatting and any conversion (F05); rejection vs best-effort on version inconsistency (F04); handling of non-conforming inputs and error-message design (format defines validity, not reader behavior); whether to attempt 0.4/Zarr-v2 filesets (F14); acquisition filtering UI in HCS (F11/F12); supplementing the `labels` list with tree scanning (F10) |

## 5. Plan implications and disposition (inputs/plan/Viewer.md, slices 01–05)

- **Slice 01** (fixture disclaimer): no format obligations; research does not alter it.
- **Slice 02** (open local fileset, list images; canvas pan/zoom; channel visibility; time/plane selection; label overlays; details panel with dimensions/units/coordinates; automatic pyramid-level choice):
  - *Listing images* is normatively reinforced: readers SHOULD NOT default to only the first image in a bioformats2raw collection (272). Listing must be metadata-driven across three layouts: plain multiscale groups (F02), b2fr collections via `series` or numbered groups (F06), and plate→well→field traversal (F03, F11, F12). Disposition: keep the slice, add collection/HCS awareness the thin plan lacks.
  - *Pyramid-level choice* must read `datasets` order (largest first, 305–306) rather than array names (arbitrary, 93–94); with multiple named multiscales, follow the choose-by-name/first-fallback pattern (388–397).
  - *Channel/time/plane controls* classify axes by `type` with time→channel→space order (301–302), tolerating custom types (169) and absent units (170); `omero` channels/windows supply defaults when present (426–430) but fallbacks are needed (product decision).
  - *Calibrated coordinates* compose dataset-level then group-level transforms in order (293, 308–316): physical position from mandatory `scale` (default 1.0) plus optional `translation`; identity default (283). A `path`-form transform reader is needed for full conformance (F07) or a documented limitation.
  - *Label overlays*: discover via `labels` list (441–443), guarantee of level-count parity enables level-aligned overlay (454–455), color per `colors[].rgba` with alpha (461–466); note unlisted-label risk (SHOULD-level listing).
- **Slice 03** (background reads; cancel stale work; explainable failures): format-neutral for threading/cancellation; the chunk-file model (99–100) supports chunk-aligned partial reads that keep navigation responsive. The format defines validity but no reader error behavior, so “understandable feedback” is product work — detectable non-conformances include JSON comments (65–66), version inconsistency (156), `dimension_names` mismatch (174), wrong vector lengths (312), non-integer labels (438–439), duplicate well paths (745–747), bad well path shape (553–556).
- **Slice 04** (interoperate with real tools’ 0.5 filesets; read-only; extras out of scope): requires reading transitional metadata — b2fr layout and `omero` — because those capture real tool output “in the wild” (180–181, 60–64). Version envelope: 0.5 implies Zarr v3 (831–833); 0.4 filesets are a deliberate scope decision (F14). Read-only behavior conflicts with no reader obligation (the spec imposes reading duties only).
- **Slice 05** (acceptance on representative filesets; large dataset must not freeze; malformed input feedback): the representative set should include the layouts and negative cases enumerated in §10 (UNEXECUTED).

## 6. Brief coverage map

| Brief requirement | Covered by |
|---|---|
| Find images within a fileset | F02, F06, F11, F12 (§5 Slice 02) |
| Inspect multiresolution images by channel, time point, plane | F05, F08, F09 |
| Overlay associated label images | F02, F10 |
| Read correctly calibrated coordinates | F05, F07, F08 |
| Stay responsive on large datasets | F01 (chunk model); Slice 03 product design |
| Clearly explain data it cannot display | F13/F14 (detectable violations); error behavior itself is product (§4) |
| Read-only; source files unchanged | Consistent with spec reader obligations; no write duty triggered |
| Editing/export/remote/clinical out of scope | Scope note; HTTP/S3 statements (73–77) transfer only conceptually |
| Distinguish obligations vs optional vs product decisions | §4 table |

Assignment groups: Group 1 (opening/listing/navigation) ↔ F01–F04, F06, F11–F14; Group 2 (display/coordinates/overlays) ↔ F05, F07–F10. Aggregate scope equals the full brief; both groups are covered above.

## 7. False-dismissal checks

- Every S003 section was mapped to findings: TOC items 1–6 and Conformance (28–49) ↔ F01–F14; the Implementations pointer (813–814) is reported as an unresolved area rather than silently dropped (§9).
- All eight metadata keys in §2 (axes, bioformats2raw.layout, coordinateTransformations, multiscales, omero, labels, plate, well) received dedicated findings (F05, F06, F07, F08, F09, F10, F11, F12).
- All MUST/SHOULD/MAY clusters re-scanned in the capture while drafting; each is either cited in §3–§4 or explicitly listed as product-scope in §4.
- Prose-vs-normative tension checked: “All labels will be listed” (104–105) is layout commentary, while the normative rule is SHOULD (442) — governed by SHOULD, with the unlisted-label risk carried into §9/§10 instead of dismissed.
- Example-only fields (e.g., `rdefs`, 419–423) are classified as conventions, not MUSTs (F09), and `maximumfieldcount` naming follows the capture text verbatim (524–525) rather than a camelCase assumption (F13).
- Plan slices 01–05 and every brief sentence mapped in §5–§6; no slice or brief clause was left unmapped.

## 8. Applicability and transfer limits

- Findings bind to the frozen 0.5 edition (8 Sep 2026) at sha256 `5d8b2408…82de`; the spec states editor’s-draft data is not necessarily supported and migration scripts are promised between numbered versions (24–27) — later changes transfer at unknown terms.
- Statements about HTTP/S3 storage (73–77) and cloud access transfer only conceptually: the product boundary is local reading.
- Claims that depend on documents outside the capture (Zarr v3 chunk/codec semantics; OME-XML rules for `METADATA.ome.xml`, 257–260; UDUNITS-2 conversion; OMERO WebGateway window semantics, 424–425) are referenced, not verified, here.
- No live implementation behavior was researched (see §9); interop claims about real tools rest on the normative text only.

## 9. Unresolved areas and unvisited areas

1. **Actual reader implementations.** S003 §4 is only “See Tools” (813–814); the brief asks for research into actual reader implementations, which this source scope cannot satisfy. Not dismissed — flagged as the principal open item; needs a future source round within an expanded scope.
2. **Binary `path`-form transforms** (285–289): storage layout (array name, dtype, byte order) is unspecified in the capture; implementation would need assumptions or further sources.
3. **UDUNITS-2 handling**: unit strings are enumerated (171–172) but parsing, display formatting, and conversion factors are not in the corpus.
4. **OME-XML details** for collections (257–260) and the external OMERO docs for `rdefs`/window semantics (424–425) are outside the capture.
5. **Well-group internals**: whether field paths may traverse intermediate groups; field display ordering; behavior for missing `well.version` — unspecified.
6. **Error/edge semantics**: reader behavior for version inconsistency (156), duplicate multiscale names, label/image level-count mismatch, or wells whose paths do not exist — undefined; product must decide.
7. **Post-capture spec changes**: anything after 8 September 2026 (errata, 0.5.x revisions, the promised replacement for b2fr layout, 181) is unvisited by design of the frozen corpus.

## 10. Proposed validation — UNEXECUTED

The following is proposed only; none of it has been run, and no execution evidence exists in this corpus.

1. **Fixture matrix** (synthetic, read-only): minimal 2-D image; 5-D t/c/z/y/x; labels + `image-label` colors; a `labels` group with an unlisted member (SHOULD violation); b2fr collection with `series`; b2fr without `series` (numbered groups); b2fr + `plate` precedence case; dense plate; sparse plate; multi-acquisition well; missing units; missing `omero`; multiple named multiscales; group-level transforms; translation after scale; `path`-form transform; negative cases — `dimension_names` mismatch (expect rejection per 174), float label dtype (438–439), JSON with comments (65–66), inconsistent `ome.version` (156).
2. **Property checks**: level extents monotone non-increasing along `datasets` order; scale/translation lengths equal axes length; exactly one scale per dataset; label level count equals source image level count; overlay pixel alignment at equal level index.
3. **Responsiveness probe**: chunk-aligned random-access reads on a large synthetic pyramid during pan/zoom, asserting interaction stays live (plan Slice 03/05).
4. **Failure-message audit**: corrupt `zarr.json`, missing level array, version-inconsistent hierarchy — each produces a message naming the affected image/node and offering another item (plan Slice 03, spec reader guidance 272–274).

---

**Deliverable set:** this report (`report.md`), `findings.json` (F01–F14 standalone bodies), `acquisition.json` (source selection, reads, finding-to-source links). All locators cite the verified capture; proposed validation remains UNEXECUTED.
