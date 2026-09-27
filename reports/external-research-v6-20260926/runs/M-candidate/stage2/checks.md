# Verification checks (independent, admitted corpus only)

Scope: every consequential claim in `stage1/draft.md` plus deferred/omitted observations.
Plan: `case/plan/Viewer.md`. Brief: `case/brief.md`.
Verdicts: confirm | qualify | reject | unresolved.
Quote-match status from `stage1/evidence-bundle.md` is noted where relevant; match proves existence, not correctness.

## Propositions (draft §1)

### C-P1a — 0.5 requires Zarr v3, attributes.ome in zarr.json, consistent ome.version
- Verdict: confirm
- Reason: S003 L68-72 requires Zarr v3 and permits all Zarr features unless disallowed; S003 L152-156 stores OME metadata under `attributes.ome` with `version` string and MUST-be-consistent hierarchy. Bundle exact matches for O-001/O-002.

### C-P1b — "version string exactly 0.5" and "scope every group/array"
- Verdict: qualify
- Reason: S003 examples show `"version": "0.5"` (L161, L199, L325, L447, L481, L568, etc.) and spec is 0.5.x, but normative text (L155-156) only says version string within ome namespace and MUST be consistent — no exact-equality rule or patch-version rule cited. "Every group/array" overstates: normative rule is consistency within hierarchy where ome metadata is present, not that every zarr.json must carry ome.version. 0.5.2 dimension_names clarification confirmed at S003 L825-827.

### C-P1c — 0.4 requires Zarr v2 (.zgroup/.zattrs/.zarray)
- Verdict: confirm
- Reason: S059 L129-134 requires Zarr v2 hierarchical organization; S059 L147-148, L157 show `.zgroup/.zattrs/.zarray` layout. O-014 quote not-found mechanically only due to line-wrapping; text verified at cited lines.

### C-P2 — Axes 2..5, 2..3 space + optional time/channel-or-custom, ordered t,c,space; dimension_names MUST match
- Verdict: confirm
- Reason: S003 L300-303 normative axes counts/order; L174 dimension_names MUST match axes names; S053 L126-150 schema min2/max5, 2..3 space via min/maxContains. O-003/O-004 mechanical not-found is line-wrap artifact; text verified.

### C-P3 — Pyramid paths arbitrary, ordered largest-to-smallest; factor NOT fixed at 2; vizarr non-2 failure
- Verdict: confirm
- Reason: S003 L93-94 names arbitrary with order from multiscales; L305-306 paths MUST be ordered largest-to-smallest. Factor 2 appears only in examples (S003 L351-364), not normative. S043 L80-89: non-2 sample, vizarr supported:no opens:no issue #101; Vol-E/BDV/MoBIE/napari pass.

### C-P4 — Per-dataset exactly one scale + optional one translation-after-scale, len==axes; group-level same rules applied after; missing-scale default; scale+translation only
- Verdict: confirm
- Reason: S003 L308-312 per-dataset rules including len==axes and translation-after-scale; L314-315 group-level same rules applied after; L310 missing-scale MUST express inter-level factor defaulting 1.0. S053 L196-266 schema exactly-one-scale (maxContains 1), oneOf scale/translation. RFC-5 vs 0.5 separation confirmed via S051 L516-523 (RFC allows sequences/identity; 0.5 in S003 L309 restricts to scale/translation).

### C-P5a — omero optional/transitional; if present MUST have channels[].color + window{min,max,start,end}
- Verdict: confirm
- Reason: S003 L398-400 transitional; L426-430 optional but MUST contain channels, color 6-hex, window with min/max/start/end. O-009 not-found is line-wrap artifact; verified.

### C-P5b — "plus active/label/rdefs{defaultT,defaultZ,model}" and "channel count matches c-size", model color|greyscale
- Verdict: qualify
- Reason: active/label/rdefs/defaultT/defaultZ/model appear only in S003 example block L401-423 (comments), not in normative MUSTs L426-430. "Array matching c dimension size" is example comment L403, not normative MUST. Model values color|greyscale from example L422 only. Viewer divergence part confirmed separately (C-P5c).

### C-P5c — Viewers diverge on omero colors/rdefs
- Verdict: confirm
- Reason: S043 L51 Vol-E ignores colors; L78 Microscopy Nodes ignores colors; L70 WEBKNOSSOS rdefs not supported. Bundle exact match for O-035.

### C-P6a — Labels under labels, labels array, integer dtypes, metadata-free intermediates, same level count
- Verdict: confirm
- Reason: S003 L437-442 labels group contains images, integer MUST list, intermediates allowed but MUST NOT contain metadata, labels array MUST with SHOULD-list-all; L454-455 label image MUST implement multiscales with same datasets count. O-007 not-found is wrap artifact; verified.

### C-P6b — image-label SHOULD colors+version, MAY properties+source.image default ../../; rgba 0..255
- Verdict: qualify
- Reason: S003 L456-460 image-label SHOULD contain colors+version (MUST inside); L461-466 colors objects MUST label-value, MAY rgba 0..255; L467-474 properties/source MAY, source.image path string default ../../. Draft "SHOULD carry colors{label-value,rgba}+version" conflates SHOULD container with MAY rgba — rgba is optional per label, not required.

### C-P7 — HCS plate/row/well/field, fully enumerated rows/cols, path Row/Column, 0-based indexes, well.images path+acquisition
- Verdict: confirm
- Reason: S003 L120-129 three groups MUST above images; L530-560 plate rows/cols MUST defined even if empty, path row/col, rowIndex/columnIndex 0-based consistent; L744-750 well MUST images[{path, acquisition-if-multiple}].

### C-P8 — bioformats2raw.layout=3 collections, OME-XML+series, plate precedence, SHOULD-not-first-only, numbered groups 1:1
- Verdict: qualify
- Reason: S003 L256-275 confirms layout value, SHOULD OME/METADATA.ome.xml, series list/order, numbered 0,1,2 fallback, every group exactly one OME-XML Image in order, readers SHOULD make aware / SHOULD NOT default first-only, MAY show all or choice. Qualify only on type: L256 says value "3" (quoted) while example L200 shows integer `3` — string-vs-int ambiguous in source text. Plate precedence confirmed L204-205 and L262.

### C-P9a — Spec permits all Zarr v3 codecs/grids; bioformats2raw 0.5 matrix null/blosc/gzip/zstd yes, zlib no, default blosc/lz4/clevel5
- Verdict: confirm
- Reason: S003 L70-72 all-features-may-be-used. S033 L159-162 table v3/0.5 row as claimed; L155 default Blosc lz4 clevel5; L169-174 blosc cname/clevel/blocksize/shuffle variants. Bundle exact matches O-015.

### C-P9b — Real 0.5 sharding_indexed example chunk!=inner, blosc(zstd)+crc32c, uint16, [c,z,y,x], shape
- Verdict: confirm
- Reason: S055 full file verified: outer chunk_shape [1,10,512,512] (L4-9), inner [1,1,256,256] (L19-24), bytes(little)+blosc(cname zstd clevel5 shuffle typesize2) (L25-42), index bytes+crc32c (L43-53), sharding_indexed (L55), uint16 (L58), dimension_names c,z,y,x (L59-64), shape [2,236,275,271] (L67-72). O-019 not-found is JSON-line-wrap artifact.

### C-P9c — WEBKNOSSOS sharded-v3 default, 32..128 chunks; auto-sharding live edge Aug 2026 writer issue
- Verdict: confirm
- Reason: S058 L360-362 sharded v3 example, --data-format zarr gives unsharded v2; L387-388 32-128 voxels^3, sharding Zarr3+-only. S044 L139 writer auto-sharding failure, L137 dated Aug 31 2026, L155-181 raw-zarr-succeeds vs ome-zarr write_image with shards=auto — writer-scoped as draft states.

### C-P9d — "reader needs general codec + sharding_indexed support"
- Verdict: qualify
- Reason: Follows from C-P9a/b only conditionally: to open those observed filesets. Spec "may be used" (S003 L70-72) does not impose universal reader MUST; minimal floor is unestablished (see F14). Draft condition "per-array zarr.json" is correct scope.

### C-P10a — ome-zarr-py #404 read-0.5-without-write, #413 write-0.5-default with mix-throws and codec-API break
- Verdict: confirm
- Reason: S008 L149-150 read-0.5 without writing v0.5; L153 specify v0.4 for writes; L163 #413 follow-up for writes. S013 L151-156 write-0.5 default CurrentFormat, fmt selection; L157-164 mix v04/v05 throws; L182-186 dask ValueError compressor-vs-bytes-to-bytes for zarr_format 3. Bundle exact matches O-022/O-023.

### C-P10b — Releases v0.12.0 read+write #413, v0.15.0 download-fix + deprecate v01-v03, v0.16.0 sharding, v0.19.x scenes + plain-string codec tolerance
- Verdict: confirm
- Reason: S052 L558 v0.12.0 via #413; L343 v0.15.0 download-fix #562 + deprecate v01-v03 #557; L300 v0.16.0 sharding #534 + docs #569; L128 v0.19.0 image-class-v06, plain-string codecs zarr>=3.3 #609, scene #612, find_multiscales scenes #637. Verified via bundle windows + direct regex search.

### C-P10c — napari-ome-zarr #123/0.8.0 direct-zarr-v3 + all-series + plate-labels; 0.8.1 dep swap; 0.9.0 scenes; 0.10.0 axis/unit forwarding
- Verdict: confirm
- Reason: S027 L150-159 lighter-weight direct zarrv3, bioformats2raw/channels/labels/plates coverage; L127-131 merged May 8 2026. S026 L257 0.8.0 drop-ome-zarr #123 + plate-labels fix + all-series open; L214 0.8.1 replace ome-zarr with zarr #152; L128 0.9.0 V0.6 scenes #157; L42 0.10.0 forward axis names+units #149.

### C-P11a — Scale-on-datasets honored widely; scale-on-multiscales only BDV/MoBIE/neuroglancer/vtk-itk; translation only napari; vizarr/WEBKNOSSOS hard fails
- Verdict: confirm
- Reason: S043 L318-350 scale-on-datasets yes except avivator/vizarr/OMERO/Microscopy-Nodes; L394-428 scale-on-multiscales yes only BDV/MoBIE/neuroglancer/vtk-itk, napari no issue #73; L352-392 translation-on-datasets only napari yes, vizarr opens:no #271 disappear, WEBKNOSSOS opens:no #6600; L430-471 translation-on-multiscales all no. Bundle + direct read L318-392, L394-471.

### C-P11b — Default napari without plugin ignores scale, wrong anisotropic rendering
- Verdict: confirm
- Reason: S011 L158-159 exact bundle match; env L144-149 napari 0.6.6 / napari-ome-zarr 0.6.1 / ome-zarr 0.10.3 / zarr 3.1.5 / Windows.

### C-P11c — Matrix circa Apr 2025 on v0.4 samples; 0.5-matrix not found
- Verdict: qualify
- Reason: Date/version part confirmed: S041 L2-20 (napari 0.5.6/plugin 0.6.1/ome-zarr 0.10.3, vizarr Apr 2025, etc.); S043 sample_urls v0.4 (L320, L354, L396, L432) and v0.3/v0.4 mix. "Not found in corpus" is a negative/unproven claim: consistent with draft coverage but not provable from cited windows alone — stays unresolved as absence; no 0.5-era matrix located in visited sources.

### C-P12a — Challenge sizes 21..66GB images, 485GB..1TB plates; resave never modifies input
- Verdict: confirm
- Reason: S034 L67-83 shapes/sizes 589MB, 21.57GB, 66.04GB, plates 1.0TB/485GB/704GB; L154-156 input will not be modified; L43-46 v2->v3 + optional sharding + ro-crate.

### C-P12b — AGAVE 0.4+0.5 desktop, 4 channels + time slider, resolution picker + GPU estimate + channel exclusion + subregion + sticky settings
- Verdict: confirm
- Reason: S072 L3 desktop 0.4+0.5; S117 L26-28 up to 4 channels + time slider; L97-134 subsets, OME-Zarr all selections, memory/GPU estimate, resolution default-highest OOM risk, per-channel exclusion reload-to-restore, XYZ subregion, keep-settings. Bundle exact matches O-028.

### C-P12c — "AGAVE TensorStore-backed"
- Verdict: qualify
- Reason: S072 L23-28 only proves build requires tensorstore (Python/CMake/Perl/NASM deps), not runtime read path. Backing claim is inference beyond cited lines.

### C-P12d — ome_zarr finder/view local browsing, CSV + BioFile Finder + validator, v2-only with v3 deferred
- Verdict: confirm
- Reason: S023 L150-154 view single image/plate in validator via local server; finder traverses local filesystem only .zattrs with v3 follow-up, CSV served in BioFile Finder Group-By Folders. Bundle exact match O-031.

## Plan fit (draft §2; Plan L5/L7/L9/L11 inspected)

Plan anchor (case/plan/Viewer.md): L5 open+list+canvas+channels/t/z+overlays+details+level choice; L7 background reads + cancel + per-image failure explanation; L9 0.5-tool interop + files-unchanged + session-local display + out-of-scope edits; L11 acceptance discovery/navigation/coords/overlays/responsiveness/feedback. L3 thin-fixture disclaimer.

### C-F1a — Discovery must branch: multiscales image vs plate vs layout==3 collection; SHOULD-NOT-first-only; all-series expansion
- Verdict: confirm
- Reason: Plate/rows/cols/wells/fields/acquisitions: S003 L120-129, L530-560, L744-750. Layout==3 + series/numbered-groups + plate-precedence + SHOULD-NOT-first-only: S003 L200-205, L254-275. All-series-open established: S026 L257 0.8.0. Flat-list Plan L5 ("lists the images it finds") underspecifies plates/collections; correction justified. Brief "find images within a fileset" + "explain data it cannot display" supports hierarchy-aware entry.

### C-F1b — "...vs labels-only/label-child entry points" as required branch
- Verdict: reject
- Reason: No cited spec/reader line establishes labels-group-as-entry obligation. S003 L438 says labels group "is not itself an image; it contains images"; L441-442 requires labels list for discovery within an image group. Labels discovery belongs under F6 overlay discovery, not open-root branching. Keep F1 correction without this clause.

### C-F2 — Level choice: listed order largest-to-smallest, arbitrary names, arbitrary factor, shapes/scales authoritative
- Verdict: confirm
- Reason: S003 L305-306 order MUST; L93-94 names arbitrary; C-P3 for non-2 + vizarr #101. Plan L5 "chooses an available pyramid level appropriate for the current view" does not state order/name/factor rules, so exact constraints are a valid correction (missing constraint, not contradiction). Disposition correction stands.

### C-F3a — Controls derive from axes types/names/order (t,c/custom,space; custom possible; 2..5D)
- Verdict: confirm
- Reason: S003 L300-303 + L169 custom-axis MAY; S003 L96-97 array order t-before-c-before-space. Plan L5 "where relevant" anticipates varying dims but gives no axes-driven rule or custom-axis handling; correction stands.

### C-F3b — omero channel count/colors/windows/active + rdefs defaultT/Z as optional inputs with divergent handling; "fixed 5D controls break"
- Verdict: qualify
- Reason: Optional-input framing is correct (C-P5a/b), divergence confirmed (C-P5c), fallback need follows. Qualify: Plan never states fixed 5D — "where relevant" already denies it — so "fixed 5D breaks" is a strawman implementation warning, not a Plan contradiction. Active/rdefs are example-only (C-P5b), so they cannot be "exact constraints."

### C-F4a — Coordinates compose per-dataset THEN group-level; dimension_names MUST match
- Verdict: confirm
- Reason: S003 L308-315 composition order; L174 dimension_names match. Plan L5 details panel (dims/units/coords) + L11 calibrated-coords acceptance omit composition and cross-check; dataset-only math miscalibrates group-scale files per S043 C-P11a. Correction stands.

### C-F4b — Per-axis None-tolerant units forwarding + inconsistent-units warning as exact constraint; UDUNITS-2 strings
- Verdict: qualify
- Reason: S048 L249-258 proves napari-ome-zarr precedent (None for unitless retained channel, axis_labels only-if-all-names, warn-and-hide on inconsistency), not a 0.5 MUST. Spec: S003 L170 unit SHOULD with UDUNITS-2 SHOULD lists L171-172 — SHOULD, not MUST. Adopt as recommended pattern/product choice, not required correction. O-037 mechanical not-found is comment-wrap artifact; text verified.

### C-F5 — Translation-after-scale legal (dataset + group); most viewers ignore/fail; must apply or explicitly explain offset
- Verdict: confirm
- Reason: Legality S003 L311 + L314-315; gaps S043 L352-392 + L430-471 (only napari dataset-translation yes; vizarr #271 / WEBKNOSSOS #6600 hard fails). Plan silent on translations but brief requires "correctly calibrated coordinates" and Plan L5/L11 requires calibrated display; silent ignore is correctness failure. Correction stands. Prevalence in 0.5 wild remains open (matrix is v0.4) — does not weaken must-handle-or-explain.

### C-F6a — Overlay discovery via labels list + intermediates; integer dtype + equal level count; SHOULD-colors + MAY properties/source
- Verdict: confirm
- Reason: C-P6a/b. Plan L5 optional overlays + L11 aligned-overlays acceptance omit discovery/validation/display rules; correction stands. Fallback-palette need follows from SHOULD (not MUST) colors.

### C-F6b — "napari-pattern squeeze/pop of channel_axis is required"; axis-aware alignment with channel asymmetry
- Verdict: qualify
- Reason: S048 L707-716 napari labels-layer MUST-not-have channel_axis + pop/squeeze is napari-API-specific, not a Slide Scout MUST. Asymmetry itself confirmed: images split per-channel (S048 L204-213) vs Label keeps all axes (L580-584), parent-transform axis removal L586-598 + remove_axis helper L51-78. Spec says labels in same coordinate system, "usually" same dims/transforms (S003 L432-433) — alignment via transforms is sound, but exact napari mechanics are precedent, not 0.5 obligation. Keep correction for discovery/validation/alignment; demote napari mechanics to implementation note.

### C-F7a — Full-res eager load infeasible at GB..TB scale; background-only does not bound memory/I-O; must not eager-fetch, must stay responsive with cancel retained
- Verdict: confirm
- Reason: Sizes C-P12a; full copy of 21-66GB images / 485GB-1TB plates cannot be eager-loaded on desktop. Plan L7 background + cancel + L11 must-not-freeze is necessary but insufficient without bounding (level/channel/subregion/lazy-chunked). Correction stands.

### C-F7b — "Need explicit resolution/memory/subregion UI" (picker + GPU estimate + channel subset + subregion) as required correction
- Verdict: qualify
- Reason: AGAVE precedent C-P12b proves sufficiency, not necessity. Lazy/chunked + level-appropriate reads (S058 L387-389 chunk/shard guidance; S018 dask-lazy precedent) could also satisfy responsiveness without pre-load dialog. Specific UI bundle is product_choice/optional_capability; required correction is only bounding + responsiveness + cancel. Disposition for F7 as a whole stays correction via C-F7a, with UI form demoted.

### C-F8a — Schema/machine-checkable MUSTs: scale presence/uniqueness, vector lengths, axes counts
- Verdict: qualify
- Reason: S053 confirms scale presence + uniqueness (L196-217 contains/maxContains 1), axes 2..5 + 2..3 space (L126-150), datasets+axes required (L67-70), paths+transforms required (L54-57). Overstatement: schema scale/translation arrays require only minItems 2 (L208-213, L229-234, L251-256), NOT len==axes — len==axes is spec-only (S003 L312). O-040 mechanical not-found is trivial-quote artifact (`"type": "object"`); cited schema windows verified.

### C-F8b — Version/storage mismatch (Zarr v2 vs v3, missing/mixed ome.version) as distinct explainable class
- Verdict: confirm
- Reason: v3-vs-v2 C-P1a/c; consistency MUST S003 L156. Missing/mixed-ome behavior is unspecified (O-002 open question stands) — still a distinct failure class under brief "clearly explain data it cannot display" + Plan L7/L11 feedback. Per-image/per-level attribution + version-mismatch explanation follows.

### C-F8c — Disposition "covered" for failure explanation
- Verdict: reject
- Reason: False covered. Plan L7/L11 generic feedback ("explain which image/data", "understandable feedback rather than crash") does not specify version-mismatch, missing-scale, dimension_names-mismatch, or transform-ignored explanations. Draft itself says "keep and extend" with new classes — extension beyond Plan is correction, not coverage. Covered-in-Plan is not implemented; generic wording does not cover specific MUST-derived classes. Correct disposition: correction.

### C-F9a — Interop set: bioformats2raw 0.4+0.5, challenge resaves + ro-crate, sharded/blosc/zstd/gzip, pre/post-#413 writes; Viv dtype bound as incompleteness counterexample
- Verdict: confirm
- Reason: bioformats2raw versions S033 L223-226 + default-0.4 L213-217; resave+shard+ro-crate S034 L43-46; codecs/shard C-P9a/b; pre/post-#413 C-P10a/b; Viv bound S025 L84-86 (int8-32/uint8-32/float32-64, excludes 64-bit/float16/complex). Files-unchanged + session-local retained matches Plan L9 verbatim.

### C-F9b — Disposition "correction" for interop (Plan L9 already says interoperate with real 0.5 tools)
- Verdict: qualify
- Reason: Evidence for pinned acceptance matrix is sound, but Plan L9 already requires 0.5-tool interop — this is elaboration/acceptance-detail, not a Plan contradiction. Correction is defensible as missing-constraint (unnamed producers/versions/codecs/sharding/dtypes), but borderline covered+extend. Keep correction only for the pinning requirement; do not imply Plan denies interop.

### C-F10 — Multiple multiscales entries: LIST allowed, no viewer opens beyond [0], some crash, name-pick with first-fallback; product_choice
- Verdict: confirm
- Reason: LIST S003 L298; name-pick/first-fallback S003 L388-397 verified by direct read. Matrix S043 L277-316 all supported:no, BDV/MoBIE ArrayIndexOutOfBounds, WEBKNOSSOS mag-uniqueness, OMERO corrupted. Plan silent. Product_choice (first-only-with-notice vs named selector; no silent first-only, no crash) is correct — not a 0.5 MUST beyond list-shape.

### C-F11 — Affine/rotation/scenes/mapAxis are RFC-5 future, 0.5 scale+translation only, SHOULD-warn adopted; scenes in 0.9.0; optional_capability
- Verdict: confirm
- Reason: 0.5 restriction S003 L309; RFC-5 MUST-parse scale/translation + SHOULD-parse affine/rotation/mapAxis + SHOULD-warn S051 L515-520; datasets restriction S051 L522-523; scene MUST/MAY + input/output rules S051 L789-801 (direct read); graph-connectedness S051 L541-545. napari scenes S026 L128 0.9.0 + S052 L128 ome-zarr scene handling. Plan silent. Optional_capability + warn-and-explain-only is correct; 0.5 scope exclusion stands.

### C-F12 — Plate overview: per-well/field navigation vs lazy stitched square-packing + zeros; napari zoom crash; product_choice, no silent stitching
- Verdict: confirm
- Reason: MoBIE HCS-open S041 L12-15; vizarr lowest-res + click-well-new-window S043 L214-215; ome-zarr-py Well square-grid ceil(sqrt) + first-field/highest-res + zeros-for-missing S018 L404-467 + Plate stitched grid + empty-well zeros S018 L537-567; napari crash-on-zoom S043 L219-220. Plan L5 list-images + L11 no-plate-UI leaves presentation open. Product_choice with anti-misleading constraint (missing-as-missing or labeled-derived) is correct.

### C-F13 — Multi-fileset local browsing beyond single-fileset Plan; .zattrs-only precedent with v3 deferred; zarr.json traversal if added; optional_capability
- Verdict: confirm
- Reason: Plan L5 opens A fileset (singular); brief boundary local reading. Precedent + v2-gap + BioFile-Finder/validator alternatives C-P12d. 0.5 discovery via zarr.json follows C-P1a/c. Optional_capability (NOT required) is correct.

### C-F14 — Codec/shard/dtype floor unestablished; spec-allows-everything, observed floor, Viv exclusion, auto-shard-read unproven; unsupported; must document + per-array explain
- Verdict: confirm
- Reason: No minimal-reader MUST in S003 L70-72 ("may be used"); observed writer matrix is writer limit (S033 L157-162 header "being written"), one sharded sample S055, one Viv bound S025, writer-scoped auto-shard issue S044 — insufficient for universal floor. Unsupported is correct; must-document + cannot-decode explanation follows from brief/Plan feedback duties, not from a floor claim. Validation matrix (codec x sharded x 64-bit) is sound distinguishing check.

### C-F15 — RO-Crate sidecar present (specimen/modality; RECOMMENDED/SUGGESTED), no reader obligation; unresolved; ignore-but-don't-misclassify
- Verdict: confirm
- Reason: S034 L43-46 top-level ro-crate + specimen/modality; L193-198 organism/modality RECOMMENDED, name/description SUGGESTED, stored at ./ro-crate-metadata.json; L61 1.2KiB example. No MUST-to-surface in visited sources. Unresolved + safe-minimum (not-an-image, no error) is correct. License/provenance surfacing stays product decision.

## Deferred items (draft §3)

### C-D1 — Remote/HTTP/S3, editing, export, clinical interpretation out of boundary per brief L5 + Plan L9
- Verdict: confirm
- Reason: Brief L5 (read from case/brief.md): local-filesystem boundary; editing/export/remote-services/clinical-interpretation outside case. Plan L9: editing/export/remote-storage/automated-interpretation outside plan. Deferral correct; S003 L75-77 / S059 L126-128 remote-possible storage notes do not override product boundary.

### C-D2 — 0.6/scenes/RFC-5 implementation draft-only, optional not acceptance-blocking
- Verdict: confirm
- Reason: S051 is RFC-5 (catalog URI .../rfc/5/), not frozen 0.5 (S003). C-F11 confirms future status + scenes novelty (S026 L128, S052 L128). Optional tracking correct.

### C-D3 — 0.1..0.4 back-compat reading beyond 0.5 brief; version-mismatch EXPLANATION in scope
- Verdict: confirm
- Reason: Brief scope 0.5 filesets; full multi-version reading is product decision beyond brief. Explanation duty follows brief "clearly explain data it cannot display" + Plan L7/L11 + version/storage difference C-P1a/c. Split (explain yes, read no) is correct.

### C-D4 — Unread/failed handles + discovery-aid search outputs carry no evidence either way; unused for support/deny
- Verdict: confirm
- Reason: Direct reads: S005 clone-cap (bundle L286), S007 HTTP 403, S030 FileNotFound, S042 HTTP 404, S045 FileNotFound, S046 incomplete-clone, S068 octet-stream unextractable; S001 L1 + S006 L1 discovery-aid disclaimers (spot-checked; O-036 lists S012/S021/S032/S036/S049/S060/S069/S071 same pattern — not all re-opened, but pattern holds for checked pair). Draft cites none of these for positive/negative support outside D4/O-036. Correct.

### C-D5 — Large API/issue dumps only spot-checked; spec+code+matrix+releases+targeted bodies instead; unread != absence
- Verdict: qualify
- Reason: Process claim, not corpus-checkable as stated. Partially corroborated: catalog shows large views (e.g. S015 3164 lines per catalog L292; S052 647 lines; S051 1195 lines), and draft coverage lists targeted extents. "Volume exceeds single pass" and "relied on X instead" are investigator assertions — unresolved as process. Methodological guardrail (unread != absence) is correct and matches O-036.

## Deferred / omitted / unsupported observations (at least three)

### C-O012 — FormatV05 (zarr_format 3, default//, CurrentFormat=V05; "writing not supported yet" May 2025) — draft omits except open question
- Verdict: qualify
- Reason: S016 L368-387 verifies class, docstring "added FormatV05 (May 2025): writing not supported yet", version 0.5, zarr_format 3, chunk_key default//, CurrentFormat=V05. Bundle exact match. Qualify: at captured commit the docstring is stale against CurrentFormat=V05 + #413/v0.12.0 default-write (C-P10a/b, Aug 2025) — writer-uncertainty inference was version-pinned and is superseded for post-#413 filesets. Draft correctly avoids a finding here; loss is immaterial except pre/post-#413 mix note already in F9.

### C-O013 — ZarrLocation unwraps v3 ome namespace; format detection; "version mismatch warning + re-init" — draft defers to open question
- Verdict: qualify
- Reason: Unwrap confirmed: S019 L87-90 `if "ome" in zgroup: zgroup=zgroup["ome"]` (mechanical not-found is case/line-wrap artifact; verified by direct read L79-90). "Detects format from metadata" and "mismatch triggers warning + re-init" NOT in cited L87-90 nor surrounding L70-101 (open_group, exists-flag, fmt/store accessors only) — unresolved without wider read; no warning/re-init text located in visited window. Missing/mixed-ome behavior stays unresolved (matches O-002/O-013 open questions). No finding lost: F8-version-class already covers explain-duty.

### C-O036 — Failed/empty + discovery-aid guardrail — draft defers to D4
- Verdict: confirm
- Reason: See C-D4. O-036 quote exact at S005 L1; S001 L1 discovery-aid exact. Draft use (list as unvisited/failed, not as negative support) is the correct handling. No material loss.

### C-O020-packaging — zarr v2/v3 split-brain (bioio>=3 vs ome-zarr<3, FSStore import fail) + scale-ignored-without-plugin — draft mentions in P10/P11 conditions only, no finding
- Verdict: qualify
- Reason: S011 L151-157 dependency conflict + L153-154 FSStore import error + L158-159 scale ignored confirmed (C-P11b). Draft correctly uses scale part (F5/P11) but loses the packaging implication for Slide Scout's own Zarr stack choice (must avoid v2/v3 split-brain in its desktop dependency closure; suggested paths downgrade/PR-#123/wait are napari-specific, Dec 2025, pre-0.8.0). Materiality: medium for implementation (stack selection), low for Plan text — should appear as implementation note / validation idea (clean-room dependency close), not a Plan correction. Flagged as lost nuance, not a missing correction.

### C-O008-palette — Fallback palette when image-label colors/properties absent — draft states need but gives no palette/product decision
- Verdict: qualify
- Reason: SHOULD-not-MUST colors confirmed (C-P6b); S048 L657-659 napari precedent "no colors -> don't set colormap (no labels shown)" shows one behavior (hide), not a palette. No corpus palette standard located in visited sources; O-008 open question stands. Draft F6 "missing colors need fallback palette" is correct direction but leaves the decision open — correctly unresolved as to which palette. Loss: should be grouped as explicit product decision (hide vs fallback palette vs error), not just consequence text. Surfaced in delivered.md decisions.

### C-O004-custom — Custom/null axis labeling/ordering UI — draft requires axes-driven controls but leaves custom-axis UI open
- Verdict: qualify
- Reason: Custom-axis MAY confirmed S003 L169/L301-302; 2..5D + order confirmed C-P2. No corpus UI standard for custom-axis label/order located; O-004 open question stands. F3 correction (axes-driven) is correct; specific custom-axis presentation is product_choice left implicit. Surfaced in delivered.md decisions. Same pattern applies to O-009 window validation (start/end inside min/max) and model greyscale-vs-color (S003 example-only L422; S043 divergence) — validation rule unstated in corpus, stays product_choice.

## Coverage and negative claims (draft §4)

### C-COV1 — "Sources read" extent list and "unvisited or unresolved" list
- Verdict: unresolved
- Reason: Process/coverage assertion, not independently checkable from corpus text alone in this pass. Spot-checks pass (visited windows exist as cited; S002 empty per catalog L32-38; failed handles per C-D4; S015/S052/S051 large per catalog/bundle). But completeness of "all 896" / "head+search" / "search" extents cannot be verified without replaying the investigator session. Treat as investigator self-report: plausible, unverified.

### C-COV2 — "0.5-era viewer matrix not found", "auto-shard READ unproven", "validator dimension_names enforcement unproven", "bioformats2raw 0.5-first-version unproven"
- Verdict: unresolved
- Reason: All are absence/unproven claims. Consistent with visited evidence (matrix samples v0.3/v0.4 per C-P11c; S044 writer-scoped per C-P9c; validator page S031 L1-14 gives no enforcement detail; S033 gives current 0.4+0.5 support L223-226 with default-0.4 L213-217 but no first-0.5-version). Absence cannot be confirmed without exhaustive corpus search (forbidden to overclaim); each stays unresolved per task rule. Draft correctly carries them as open/unproven rather than findings.

### Summary of disposition corrections
- F1: correction stands, minus labels-entry clause (C-F1b reject).
- F2/F3a/F4a/F5/F6a/F7a: corrections stand (with F3b/F4b/F6b/F7b qualifications demoting strawman/napari-specific/UI-form parts).
- F8: covered -> correction (C-F8c reject false covered).
- F9: correction stands narrowly (pinning requirement; C-F9b qualify).
- F10/F12: product_choice confirmed. F11/F13: optional_capability confirmed. F14 unsupported confirmed. F15 unresolved confirmed.
- Lost-but-immaterial: O-012/O-013 version-pinned details (covered by F9/F8). Lost-and-should-surface: packaging note (O-020), fallback-palette choice (O-008), custom-axis UI (O-004), window/model policy (O-009), multi-channel label presentation (O-034 open question, S048 asymmetry only).


