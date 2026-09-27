# Slide Scout 0.5 research draft (coherent report)

Scope: local read-only desktop browser for OME-Zarr 0.5 filesets (brief.md L1-5). Admitted corpus only: case/sources/*.txt. Plan cited is the thin snapshot at case/plan/Viewer.md; a Plan passage means specified coverage, not implemented or tested behavior. Nothing here is independently verified; validation ideas are distinguishing checks, not passed tests.

## 1. Supported propositions (with conditions)

P1. Storage and namespace (0.5-only). OME-Zarr 0.5 requires Zarr v3 with metadata under `attributes.ome` in `zarr.json` and a consistent `ome.version` in each hierarchy [O-001, O-002]. 0.4 instead requires Zarr v2 (`.zgroup/.zattrs/.zarray`) [O-014]. Conditions: version string exactly `0.5` (spec release 0.5.x; dimension_names MUST clarified in 0.5.2) [O-003]; scope every group/array in the opened hierarchy.

P2. Axes and dimension names. Axes length 2..5 with 2..3 space plus optional time/channel-or-custom, ordered time, channel/custom, space; `dimension_names` on each level array MUST match axes names [O-003, O-004, O-040]. Conditions: per multiscales image; custom/null axis allowed.

P3. Pyramids. Dataset `path`s are arbitrary relative names ordered largest-to-smallest; downsampling factor is NOT fixed at 2 [O-005, O-025]. Real viewers break when factor-2 is assumed (vizarr fails to open, issue #101) [O-025]. Conditions: per multiscales; level shapes/scales are authoritative, names are not.

P4. Calibrated coordinates. Per-dataset transforms MUST be exactly one scale plus optional one translation-after-scale, vector length = len(axes); optional group-level multiscales transforms follow the same rules and apply AFTER per-dataset ones [O-006, O-040]. Missing scale info defaults to inter-level factor / 1.0. Conditions: 0.5 multiscales; scale+translation only (affine/rotation are RFC-5, not 0.5) [O-033].

P5. Channels and rendering defaults. `omero` is optional/transitional; if present MUST carry channels[].color + window{min,max,start,end}, plus active/label/rdefs{defaultT,defaultZ,model} [O-009]. Viewers diverge: some ignore colors, some ignore rdefs [O-035]. Conditions: channel count matches c-size; model color|greyscale.

P6. Labels. Label images live under `labels`, enumerated in the `labels` array, implement multiscales with the SAME level count, use integer dtypes only, allow metadata-free intermediate groups; `image-label` SHOULD carry colors{label-value,rgba}+version and MAY carry properties + source.image (default `../../`) [O-007, O-008]. Conditions: per label image; SHOULD-level display.

P7. HCS. Plate -> row -> well -> field hierarchy with fully enumerated rows/columns, well path `Row/Column`, 0-based rowIndex/columnIndex consistent with path, well.images[{path[,acquisition]}] [O-010]. Conditions: plate/well scope; sparse plates allowed.

P8. Collections. `bioformats2raw.layout=3` marks transitional multi-image collections with OME/METADATA.ome.xml + optional series list; plate takes precedence when both present; readers SHOULD expose all images, not just the first [O-011]. Numbered groups `0,1,2...` map 1:1 in order to OME-XML Images when no series key [O-011]. Conditions: layout==3; local bioformats2raw output.

P9. Codecs and sharding. Spec permits all Zarr v3 codecs/chunk-grids unless disallowed [O-001]. Observed: bioformats2raw 0.5 writer matrix null/blosc/gzip/zstd = yes, zlib = no (writer limit, not reader exemption), default blosc/lz4/clevel5 [O-015]; real 0.5 array uses `sharding_indexed` + blosc(zstd) + crc32c with chunk_shape != inner-chunk shape [O-019]; WEBKNOSSOS defaults to sharded v3 and recommends 32..128-voxel chunks [O-027]; sharding/auto-sharding remains a live edge (open Aug 2026 writer issue) [O-038]. Conditions: per-array zarr.json; reader needs general codec + sharding_indexed support.

P10. Reader rollout history. ome-zarr-py added 0.5 READ in PR #404 without 0.5 write [O-022], then 0.5 read+write as default in #413/v0.12.0 with mixed-format-mix throws and zarr-v3 codec-API breakage [O-023]; sharding support landed ~v0.16.0; v01-v03 writes deprecated ~v0.15.0 [O-029]. napari-ome-zarr dropped ome-zarr for direct zarr v3 in #123/0.8.0 (all-series + plate-labels fixes), added scenes in 0.9.0 and axis/unit forwarding in 0.10.0 [O-024, O-030]. Conditions: version-pinned stacks; pre-v0.12-era stacks predate fixes [O-020].

P11. Scale/translation application gaps. Scale-on-datasets is widely honored; scale-on-multiscales (group-level) is ignored by napari/vizarr/Vol-E/WEBKNOSSOS/OMERO; any translation is honored almost nowhere except napari (with vizarr/WEBKNOSSOS hard failures on translation-bearing samples) [O-026]. Default napari without plugin ignores scale entirely, producing wrong anisotropic rendering [O-020]. Conditions: matrix circa Apr 2025 on v0.4 samples; 0.5-matrix not found in corpus [O-025].

P12. Large-data precedent. Challenge samples reach 21..66 GB images and 485 GB..1.0 TB plates [O-018]; resave never modifies input [O-017]. AGAVE (0.4+0.5 desktop, TensorStore-backed) answers scale with resolution picker + GPU memory estimate + per-channel exclusion + XYZ subregion + sticky settings [O-028]. ome_zarr finder/view (PR #436) answers local browsing with filesystem traversal + CSV + BioFile Finder + validator view, but was v2-only with v3 deferred [O-031]. Conditions: desktop/local scope.

## 2. Plan fit (one disposition each)

Plan L3 notes the Plan is a deliberately thin synthetic fixture, not a completeness claim.

F1. Image discovery at open root (Plan L5: opens a local 0.5 fileset and lists the images it finds).
- Disposition: correction.
- Exact constraint: discovery must branch on root kind: multiscales image vs plate (rows/cols/wells/fields) vs bioformats2raw.layout==3 collection (series or numbered groups, plate precedence) vs labels-only/label-child entry points; SHOULD-NOT-default-to-first-image for collections [O-010, O-011, O-030].
- Product consequence: a flat image list misrepresents plates and collections; need hierarchy-aware entry (plate/well/field/series pickers) plus explicit all-series expansion.
- Validation idea: open in validator first [O-032], then open one 0.5 plate (e.g. challenge 190129-style), one multi-series layout, and one bare image; check every listed image is reachable and counts match plate/well/series metadata. Not a passed test.

F2. Pyramid level choice (Plan L5: chooses an available pyramid level appropriate for the current view).
- Disposition: correction.
- Exact constraint: level order = listed datasets order largest-to-smallest with arbitrary path names [O-005]; scale factor between levels is arbitrary, not 2 [O-025]; shapes/scales authoritative.
- Product consequence: name- or factor-2-based pickers select wrong levels on real pyramids; need shape/scale-driven choice.
- Validation idea: open the non-2-downsampling sample class [O-025] and confirm each level's displayed scale matches its own coordinateTransformations, not 2^level. Not a passed test.

F3. Channel/time/plane controls (Plan L5: channel visibility, time-point and plane selection where relevant).
- Disposition: correction.
- Exact constraint: control set derives from axes types/names/order (time-first, channel/custom, space; custom axis possible; 2..5 dims) [O-004]; omero channel count/colors/windows/active and rdefs defaultT/defaultZ are optional inputs with viewer-divergent handling [O-009, O-035].
- Product consequence: fixed 5D (t,c,z,y,x) controls break on 2D/3D/4D, custom axes, and missing omero; need axes-driven controls + documented fallbacks (palette, contrast, initial T/Z).
- Validation idea: open 2D, 3D, 4D, and custom-axis images plus one without omero; check controls shown match axes and defaults are explained. Not a passed test.

F4. Calibrated coordinates panel (Plan L5: details panel shows dimensions, units and coordinates).
- Disposition: correction.
- Exact constraint: coordinates compose per-dataset scale/translation THEN group-level scale/translation [O-006]; dimension_names MUST match axes names [O-003]; per-axis units forwarded with None tolerated (inconsistent-units warning pattern) [O-037]; UDUNITS-2 unit strings [O-037].
- Product consequence: dataset-only math silently miscalibrates files using group-level scale; dropping units on any-None hides scale bars; mismatches need visible errors.
- Validation idea: compare Detail-panel physical coordinates against validator/schema-derived values on one sample with group-level scale and one with a unitless axis. Not a passed test.

F5. Translation handling (Plan L5/L11: navigation + calibrated display; silent on translations).
- Disposition: correction.
- Exact constraint: a single optional translation-after-scale per dataset (and optionally group-level) is legal 0.5 [O-006]; most viewers ignore or fail on translations [O-026].
- Product consequence: ignoring translation is a silent correctness failure; if Slide Scout cannot overlay translated frames, it must explain the shown frame's offset rather than pretend identity.
- Validation idea: open the translation-bearing sample class [O-026]; confirm offset is applied or an explicit cannot-display-offset explanation appears. Not a passed test.

F6. Label overlays (Plan L5/L11: optional overlays for associated label images; aligned overlays in acceptance).
- Disposition: correction.
- Exact constraint: discover via labels list incl. intermediate groups; require integer dtype + equal level count; align via axis-aware transforms with channel-axis asymmetry (image splits channels, label keeps them); colors/properties/source optional with SHOULD-display-colors [O-007, O-008, O-034].
- Product consequence: naive same-shape overlay breaks on channel-axis and level-count mismatches; missing colors need a fallback palette; napari-pattern squeeze/pop of channel_axis is required for labels layers [O-034].
- Validation idea: open an image with multi-level labels + colors + properties and one with missing colors; check alignment at two pyramid levels and properties visibility. Not a passed test.

F7. Responsiveness on large data (Plan L7/L11: background reads, cancel stale work, large dataset must not freeze).
- Disposition: correction.
- Exact constraint: samples reach tens of GB (images) and ~1 TB (plates) [O-018]; full-res eager load infeasible; established mitigations are resolution picker + memory estimate + channel subset + subregion + lazy/chunked reads [O-028, O-027].
- Product consequence: background reads alone do not bound memory/I/O; need explicit resolution/memory/subregion UI before/during load, with cancel-on-navigation retained.
- Validation idea: open the largest available local image and plate level-0 metadata only; confirm interaction stays responsive and no full-res eager fetch occurs. Not a passed test.

F8. Failure explanation (Plan L7/L11: opening failures explain which image/data could not display; malformed input -> feedback not crash).
- Disposition: covered.
- Exact constraint: schema/machine-checkable MUSTs exist (scale presence/uniqueness, vector lengths, axes counts) [O-040]; version/storage mismatch (Zarr v2 vs v3, missing/ mixed ome.version) is a distinct explainable class [O-001, O-002, O-014].
- Product consequence: keep and extend: per-image/per-level error attribution plus version-mismatch and transform-ignored explanations.
- Validation idea: feed one Zarr-v2/0.4 fileset, one missing-scale fileset, and one translation-bearing fileset; check each yields a distinct understandable message. Not a passed test.

F9. Interop with real 0.5 tools (Plan L9: should interoperate with filesets from real OME-Zarr 0.5 tools).
- Disposition: correction.
- Exact constraint: interop set spans bioformats2raw 0.4+0.5 outputs [O-016], challenge resaves (some sharded) + ro-crate sidecar [O-017], sharded/blosc/zstd/gzip arrays [O-015, O-019], and post-#413 vs pre-#413 writes [O-023]; Viv dtype bound int8-32/uint8-32/float32-64 is a counterexample of incomplete coverage [O-021].
- Product consequence: acceptance set must pin named producers/versions/codecs/sharding/dtypes; files-unchanged + session-local display retained [Plan L9].
- Validation idea: build the acceptance matrix from S034/S055/S033 rows (producer x codec x sharded x dtype) and record open/render per cell. Not a passed test.

F10. Multiple multiscales entries (Plan silent; spec allows a LIST of multiscales [O-006 context, S003 L298]).
- Disposition: product_choice.
- Exact constraint: no viewer in the matrix opens beyond multiscales[0]; some crash [O-025]; spec reader guidance is name-pick with first-as-fallback (S003 L388-397, via O-006 read).
- Product consequence: must decide: first-only with explicit notice vs named selector; silent first-only repeats the known gap.
- Validation idea: open the multi-multiscales sample [O-025]; check behavior is the documented choice with no crash. Not a passed test.

F11. Affine/rotation/scenes and future transforms (Plan silent).
- Disposition: optional_capability.
- Exact constraint: 0.5 datasets transforms are scale+translation ONLY [O-006]; RFC-5 affine/rotation/scenes/mapAxis are draft/future with SHOULD-warn-on-unsupported [O-033]; napari scenes landed in 0.9.0 [O-030].
- Product consequence: correctly OUT of 0.5 scope; adopt only the warn-and-explain pattern for encountered-but-unsupported transforms.
- Validation idea: open an RFC-5/scene-bearing sample if present; confirm a clear unsupported-transform message, not silent misrender. Not a passed test.

F12. Plate overview presentation (Plan L5/L11: list images; acceptance mentions overlays/coords but no plate UI).
- Disposition: product_choice.
- Exact constraint: established options are per-well/field navigation (MoBIE HCS open; vizarr lowest-res + click-well-new-window) vs lazy stitched grids with invented square packing + zeros-for-missing (ome-zarr-py) [O-025, O-039]; napari plate-zoom crash is a counterexample [O-025].
- Product consequence: must choose explicit navigation vs labeled-derived overview; silent stitching misleads on sparse plates.
- Validation idea: open a sparse plate; check missing wells are shown as missing (not black data) or the derived-overview label is visible. Not a passed test.

F13. Local collection browsing (Plan L5: opens A fileset; brief scope is local filesystem reading).
- Disposition: optional_capability.
- Exact constraint: ome_zarr finder precedent traverses local dirs but was .zattrs-only with v3 deferred [O-031]; BioFile Finder grouping + validator single-view are simpler alternatives [O-031, O-032].
- Product consequence: multi-fileset browsing is NOT required by the thin Plan; if added, 0.5 discovery means zarr.json traversal, not .zattrs scan.
- Validation idea: point at a folder with mixed 0.4/0.5/nested filesets; check only valid 0.5 roots are offered, with version-labeled skips. Not a passed test.

F14. Codec/shard/dtype floor (Plan silent).
- Disposition: unsupported.
- Exact constraint: corpus does not establish a minimal reader floor; spec allows everything [O-001], observed floor is null/blosc/gzip/zstd + sharding_indexed + crc32c [O-015, O-019], Viv bound excludes 64-bit/float16 [O-021], auto-sharding read behavior unproven [O-038].
- Product consequence: cannot claim a complete floor; must document supported set + per-array cannot-decode explanation.
- Validation idea: open one array per codec (null/blosc/gzip/zstd) x sharded/unsharded plus one 64-bit dtype; record pass vs explained-fail per cell. Not a passed test.

F15. RO-Crate sidecar (Plan silent).
- Disposition: unresolved.
- Exact constraint: challenge adds top-level ro-crate-metadata.json (specimen/modality; RECOMMENDED/SUGGESTED fields) [O-017]; no in-corpus reader obligation found.
- Product consequence: unknown whether Slide Scout should surface license/provenance; safe minimum is ignore-but-don't-misclassify.
- Validation idea: open a resaved fileset with ro-crate present; confirm it is not listed as an image and no error is raised. Not a passed test.

## 3. Deferred items (with reasons)

D1. Remote/HTTP/S3 reading, editing, export, clinical interpretation: out of case boundary per brief L5 and Plan L9; not researched as requirements.
D2. 0.6/scenes/RFC-5 implementation: draft-only in corpus [O-033]; tracked as optional, not acceptance-blocking.
D3. 0.1..0.4 back-compat reading: version-mismatch EXPLANATION is in scope [O-014], but full multi-version reading is a product decision beyond the 0.5 brief.
D4. Unread/failed handles (S005, S007, S030, S042, S045, S046, S068; discovery-aid search outputs): no evidence either way [O-036]; not used to support or deny any proposition.
D5. Large API/issue dumps only spot-checked via targeted search (e.g. S015, S028, S035, S050, S073, S078-080, S087, S089-091, S109, S112): volume exceeds a single pass; relied on spec + reader code + matrix + releases + targeted bodies instead. An unread source is not evidence of absence.

## 4. Coverage

Sources read (handle: extent): S001 (all), S003 (all 896), S004 (head+search), S005-007 (all), S008 (body 125-224), S009 (all), S010 (head 1-120), S011 (body 120-212), S012 (all), S013 (body 125-224), S014 (body 120-178), S016 (all), S017 (all), S018 (all 610), S019 (all), S020 (head 1-30), S021 (all), S023 (body 125-224), S025 (all), S026 (search), S027 (body 125-224), S029 (body 125-184), S030-032 (all), S033 (150-270 + search), S034 (1-280), S036 (all), S041 (1-120), S042 (all), S043 (40-440 + search), S044 (body 125-184), S045-046 (all), S048 (all 722), S049 (all), S051 (search), S052 (search), S053 (all 268), S054 (all), S055 (all), S056 (all 320), S058 (search + 300-398), S059 (1-150), S060 (all), S062 (all), S068-072 (all/head), S100-101 (search), S117 (search + 95-134). Plan/brief/catalog/README read fully.
Sources unvisited or unresolved: S015, S028, S035, S037-040, S047, S050, S057, S061, S063-067, S073-099 (except targeted S100-101 patterns), S102-116, S118-125 beyond catalog metadata; failed/empty S002, S005, S007, S030, S042, S045, S046, S068 per O-036; 0.5-era viewer matrix not found (matrix is v0.3/v0.4-era) [O-025]; auto-shard READ path unproven [O-038]; validator dimension_names enforcement unproven [O-040]; bioformats2raw 0.5-first-version unproven [O-016].
Open questions carried forward: O-001 codec floor; O-003 writer dimension_names compliance; O-004 custom-axis UI; O-005 unordered-path fallback; O-006 group-transform prevalence; O-007 level-count enforcement; O-008 fallback palette; O-009 window validation; O-010 HCS UI choice; O-011 0.5 bioformats2raw structure; O-012/O-023 pre/post-#413 mix; O-013 missing-ome behavior; O-026 translation prevalence; O-028 AGAVE default-resolution policy; O-029 first sharded-read version; O-032 0.5 sample equivalents.
