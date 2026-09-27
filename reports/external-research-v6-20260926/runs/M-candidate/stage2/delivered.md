# Slide Scout 0.5 — verified findings (standalone)

Scope: local read-only desktop browser for OME-Zarr 0.5 filesets. Brief: find images, inspect multiresolution by channel/time/plane, overlay labels, read calibrated coordinates, stay responsive on large data, explain undisplayable data. Boundary: local filesystem reading; files unchanged; editing/export/remote/clinical out of scope.

Basis: admitted corpus only (`case/sources/*.txt`), thin Plan (`case/plan/Viewer.md`), investigator `stage1/observations.md` (O-001..O-040) and `stage1/draft.md` (P1..P12, F1..F15, D1..D5). Evidence-first via `stage1/evidence-bundle.md` plus direct source reads. A Plan passage means specified coverage, never implemented behavior. Validation ideas are distinguishing checks, not passed tests. Nothing here was live-fetched.

Dispositions: one per finding — correction | optional_capability | product_choice | covered | unsupported | unresolved.

## Findings

### V1 — Open-root discovery must branch by root kind (correction)
- Exact constraint: at open, distinguish multiscales image vs HCS plate (rows/cols/wells/fields/acquisitions) vs `bioformats2raw.layout==3` collection (series list or numbered `0,1,2…`, plate precedence) and expose every image; collections MUST-NOT default to first-only (SHOULD-NOT, S003).
- Conditions: 0.5 local hierarchy; layout value `3` (source text ambiguous string-vs-int, see non-findings); plate/well/series rules as cited.
- Evidence: S003 L120-129 three-groups-MUST + L530-560 plate + L744-750 well [O-010]; S003 L200-205 plate precedence + L254-275 layout/series/numbered/SHOULD-NOT-first-only [O-011]; all-series-open precedent S026 L257 0.8.0 [O-030]. Plan L5 "lists the images it finds" underspecifies plates/collections.
- Consequence: a flat image list misrepresents plates and multi-series collections; hierarchy-aware entry (plate/well/field/series pickers) plus explicit all-series expansion is required.
- Validation: validator-first (S031 L1-14 [O-032]), then open one 0.5 plate, one multi-series layout, one bare image; every listed image reachable and counts match plate/well/series metadata.

### V2 — Pyramid level choice follows listed order, arbitrary names, arbitrary factor (correction)
- Exact constraint: level order = datasets order largest-to-smallest; path names arbitrary; downsampling factor arbitrary (NOT 2); shapes/scales authoritative.
- Conditions: per multiscales image, all versions in scope.
- Evidence: S003 L305-306 order MUST + L93-94 names arbitrary [O-005]; non-2 sample with vizarr open-fail issue #101, others pass, S043 L80-89 [O-025]. Plan L5 "chooses an available pyramid level appropriate for the current view" omits these rules.
- Consequence: name- or factor-2-based pickers select wrong levels; choice must be shape/scale-driven.
- Validation: open non-2-downsampling class (S043 L80-89); each level's displayed scale matches its own coordinateTransformations, not 2^level.

### V3 — Channel/time/plane controls derive from axes; omero is optional input with divergent handling (correction)
- Exact constraint: control set from axes types/names/order — time-first, then channel/custom, then space; 2..5 dims; custom/null axis possible. omero (if present) MUST have channels[].color + window{min,max,start,end}; active/label/rdefs{defaultT,defaultZ,model} are example-only, not MUSTs; viewers diverge on colors/rdefs so documented fallbacks (palette, contrast, initial T/Z) are required.
- Conditions: per multiscales image; omero transitional/optional.
- Evidence: S003 L300-303 axes counts/order + L169 custom MAY + L96-97 t-c-space array order [O-004]; S003 L398-430 omero (normative L426-430, examples L401-423) [O-009]; divergence S043 L51/L78/L70 [O-035]. Plan L5 "where relevant" anticipates varying dims but gives no axes rule or fallbacks.
- Consequence: fixed-shape controls and assumed omero break on 2D/3D/4D, custom axes, and missing/partial omero.
- Validation: open 2D, 3D, 4D, custom-axis, and no-omero images; shown controls match axes and defaults are explained.

### V4 — Calibrated coordinates compose dataset THEN group transforms; dimension_names cross-check; units SHOULD with tolerant display (correction)
- Exact constraint: physical = (index × dataset-scale + dataset-translation) then group-scale/translation; each level array's dimension_names MUST match axes names; per-axis units are UDUNITS-2 SHOULD (not MUST) and missing units must not drop the whole display — None-tolerant forwarding with visible inconsistency explanation is the recommended pattern.
- Conditions: 0.5 multiscales; scale+translation only (affine/rotation are RFC-5 future).
- Evidence: S003 L308-315 composition/order/len==axes [O-006]; S003 L174 dimension_names MUST [O-003]; S003 L170-172 unit SHOULD lists; napari precedent S048 L247-258 axis_labels/units forwarding [O-037]; schema S053 L196-266 scale-uniqueness + L126-150 axes counts [O-040]. Plan L5 details panel + L11 calibrated-coords acceptance omit composition and checks.
- Consequence: dataset-only math silently miscalibrates group-scale files; dropping units on any-None hides scale bars; mismatches need visible errors.
- Validation: compare panel coordinates against schema/spec-derived values on one group-scale sample and one unitless-axis sample.

### V5 — Translations are legal and must be applied or explicitly explained (correction)
- Exact constraint: optional single translation-after-scale per dataset and optionally group-level; most viewers ignore or hard-fail; Slide Scout must apply the offset or show cannot-display-offset with the shown frame's offset.
- Conditions: 0.5 multiscales; prevalence in 0.5 wild unknown (matrix is v0.4) — does not weaken duty.
- Evidence: S003 L311 + L314-315 [O-006]; gaps S043 L352-392 dataset-translation (only napari yes; vizarr #271 disappear, WEBKNOSSOS #6600 fail) + L430-471 multiscales-translation all-no [O-026]. Plan silent; brief "correctly calibrated coordinates" governs.
- Consequence: silent ignore is a correctness failure, not a simplification.
- Validation: open translation-bearing class (S043 L352-392/L430-471); offset applied or explicit explanation shown.

### V6 — Label overlays: labels-list discovery, integer + level-count validation, transform-aware alignment, SHOULD-colors with fallback decision (correction)
- Exact constraint: discover via labels array including metadata-free intermediate groups; require integer dtype (uint8..int64 set) and equal level count, else explain non-conformance; align via axis/transform-aware composition honoring image-vs-label channel handling; colors SHOULD (label-value MUST, rgba MAY 0..255) with properties/source MAY (source.image default ../../); missing colors need an explicit hide-vs-fallback-palette decision.
- Conditions: per label image; display SHOULD, validation MUSTs as cited.
- Evidence: S003 L437-455 discovery/dtype/level-count [O-007]; S003 L456-474 image-label colors/properties/source [O-008]; channel asymmetry S048 L204-213 images-split vs L580-584 Label-keeps-axes + L586-598 parent-transform + L51-78 axis removal [O-034]; napari hide-on-no-colors L657-659. Plan L5 optional overlays + L11 aligned overlays omit these rules.
- Consequence: naive same-shape overlay breaks on channel/level mismatches; missing-colors behavior must be explicit, not accidental.
- Validation: open multi-level labels with colors+properties and one with missing colors; check alignment at two pyramid levels and properties visibility/behavior matches the documented decision.

### V7 — Large data: must bound I/O and never eager-load full resolution; cancel retained (correction)
- Exact constraint: GB-scale images and ~TB plates cannot be fully eager-loaded; background reads alone are insufficient — level/channel/subregion/lazy-chunked bounding is required with cancel-on-navigation retained.
- Conditions: desktop/local; challenge-scale inputs.
- Evidence: sizes S034 L67-83 (21.57GB, 66.04GB, 1.0TB/485GB/704GB) + resave L43-46/L154-156 [O-017/O-018]; chunk/shard guidance S058 L387-389 [O-027]; dask-lazy precedent S018 [O-039]. Plan L7 background+cancel + L11 must-not-freeze lack bounding.
- Consequence: without bounding, large opens exhaust memory/I/O despite backgrounding.
- Validation: open largest available image and plate level-0 metadata only; interaction stays responsive; no full-res eager fetch occurs.
- Note: the specific AGAVE UI bundle (resolution picker + GPU memory estimate + channel exclusion + XYZ subregion + sticky settings, S072 L3 + S117 L26-28/L97-134 [O-028]) proves sufficiency, not necessity — its form is product_choice (see Decisions D-UI). The required correction is bounding + responsiveness, not that exact dialog.

### V8 — Failure, version-mismatch, and ignored-transform explanation (correction — NOT covered)
- Exact constraint: per-image/per-level attribution; distinct explainable classes for Zarr-v2/0.4-vs-v3/0.5 and missing/mixed ome.version; missing-scale / dimension_names-mismatch / ignored-translation explanations. Schema gives machine-checkable MUSTs for scale presence/uniqueness and axes counts; len==axes is spec-only (schema requires only minItems 2).
- Conditions: all open/read paths; malformed or unavailable input.
- Evidence: schema S053 L54-70 required keys + L126-150 axes + L196-217 scale-uniqueness vs L208-256 minItems-2-only [O-040]; v3 S003 L68-72 vs v2 S059 L129-134 [O-001/O-014]; consistency MUST S003 L156 [O-002]. Plan L7/L11 generic feedback does not specify these classes — generic wording is not coverage (false-covered correction to draft F8).
- Consequence: generic "open failed" hides actionable version/shape/transform causes; users cannot pick another item or fix input.
- Validation: feed one Zarr-v2/0.4 fileset, one missing-scale fileset, one dimension_names-mismatch, one translation-bearing fileset; each yields a distinct understandable message, no crash.

### V9 — Interop acceptance must pin producers/versions/codecs/sharding/dtypes (correction, narrow)
- Exact constraint: pin a named matrix spanning bioformats2raw 0.4+0.5 outputs, challenge resaves (some sharded) + ro-crate sidecar, null/blosc/gzip/zstd with sharding_indexed+crc32c, and pre-#413 vs post-#413 writes; treat Viv's int8-32/uint8-32/float32-64 bound as incompleteness counterexample. Files unchanged + session-local display retained.
- Conditions: 0.5 tool outputs as observed; writer mix over time.
- Evidence: S033 L223-226 versions + L213-217 default-0.4 [O-016]; S034 L43-46 resave/shard/ro-crate [O-017]; S033 L159-162 + S055 full sharded array [O-015/O-019]; rollout S008 L149-163 + S013 L151-186 + S052 L300/L343/L558 [O-022/O-023/O-029]; Viv S025 L84-86 [O-021]; Plan L9 interop + unchanged + session-local. Correction is narrow: Plan L9 already requires interop — the missing constraint is the pinned matrix, not interop itself.
- Consequence: unpinned "works with real tools" is untestable across codec/shard/dtype/producer variation.
- Validation: build producer × codec × sharded × dtype matrix from S034/S055/S033 rows; record open/render per cell.

### V10 — Multiple multiscales entries (product_choice)
- Exact constraint: multiscales is a LIST; spec reader guidance is name-pick with first-as-fallback; no matrix viewer opens beyond [0], some crash. Slide Scout must choose first-only-with-notice vs named selector — silent first-only and crashes are both excluded.
- Conditions: any image group with len(multiscales)>1.
- Evidence: S003 L298 LIST + L388-397 name/first-fallback [O-006 context]; matrix S043 L277-316 all-beyond-first-no, BDV/MoBIE ArrayIndexOutOfBounds, WEBKNOSSOS mag-uniqueness, OMERO corrupted [O-025]. Plan silent.
- Consequence: undecided behavior repeats the known cross-viewer gap.
- Validation: open multi-multiscales sample (S043 L277-316); behavior matches the documented choice, no crash.

### V11 — Affine/rotation/scenes/mapAxis future transforms (optional_capability)
- Exact constraint: 0.5 dataset transforms are scale+translation ONLY; RFC-5 affine/rotation/mapAxis/scenes are draft/future; adopt only SHOULD-warn-and-explain for encountered-but-unsupported transforms; do not implement scenes for 0.5 acceptance.
- Conditions: 0.5 scope; RFC-5/scene-bearing inputs if encountered.
- Evidence: S003 L309 restriction [O-006]; RFC-5 S051 L515-523 parse/warn rules + L541-545 graph + L789-801 scene input/output [O-033]; novelty S026 L128 napari 0.9.0 scenes + S052 L128 ome-zarr scenes [O-029/O-030]. Plan silent.
- Consequence: implementing future transforms is out of 0.5 scope; silent misrender of them is still a defect — warn instead.
- Validation: open RFC-5/scene-bearing sample if present; clear unsupported-transform message, no silent misrender.

### V12 — Plate overview presentation (product_choice)
- Exact constraint: choose explicit per-well/field navigation (with lowest-res/overview + drill-in as one form) vs labeled derived overview; lazy stitched square-packing with zeros-for-missing is permitted only if labeled derived; missing wells must show as missing, never as black data; plate-zoom must not crash.
- Conditions: HCS plates, including sparse plates.
- Evidence: MoBIE HCS-open S041 L12-15 + vizarr lowest-res/click-well-new-window S043 L214-215 vs ome-zarr-py square-grid ceil(sqrt) + first-field/highest-res + zeros S018 L404-467/L537-567 [O-025/O-039]; napari crash-on-zoom S043 L219-220. Plan L5 list-images + L11 no-plate-UI leaves form open.
- Consequence: silent stitching with invented geometry misleads on sparse plates.
- Validation: open a sparse plate; missing wells shown as missing or derived-overview label visible; zoom stable.

### V13 — Multi-fileset local collection browsing (optional_capability)
- Exact constraint: Plan requires opening A fileset; browsing folders of filesets is NOT required. If added, 0.5 discovery means zarr.json traversal (not .zattrs scan) with version-labeled skips; BioFile Finder grouping + validator single-view are simpler precedents.
- Conditions: local directories with mixed 0.4/0.5/nested roots.
- Evidence: S023 L150-154 finder/view + .zattrs-only + v3-deferred + CSV/BioFile-Finder [O-031]; validator S031 L1-14 + samples S010 L8-23 [O-032]; zarr.json-vs-.zattrs C-P1a/c. Plan L5 singular; brief local boundary.
- Consequence: adding browsing without 0.5-aware traversal repeats the deferred v3 gap.
- Validation: point at mixed 0.4/0.5/nested folder; only valid 0.5 roots offered, others version-labeled skips.

### V14 — Minimal codec/shard/dtype reader floor (unsupported)
- Exact constraint: no minimal floor is established in-corpus. Spec allows everything; observed writer matrix is a writer limit; one sharded sample, one Viv bound, and one writer-scoped auto-shard issue do not generalize. Product must document its supported set and give per-array cannot-decode explanations.
- Conditions: per-array zarr.json; any 0.5 input.
- Evidence: S003 L70-72 "may be used" [O-001]; S033 L157-162 "being written" header [O-015]; S055 single sample [O-019]; S025 L84-86 Viv exclusions [O-021]; S044 writer-scoped [O-038]. Plan silent.
- Consequence: claiming a complete floor would be unsupported; transparency + explained failure is the verifiable behavior.
- Validation: open one array per codec (null/blosc/gzip/zstd) × sharded/unsharded plus one 64-bit dtype; record pass vs explained-fail per cell.

### V15 — RO-Crate top-level sidecar (unresolved)
- Exact constraint: challenge resaves add `./ro-crate-metadata.json` (specimen/modality minimal; organism/modality RECOMMENDED, name/description SUGGESTED). No in-corpus reader MUST to surface it. Safe minimum: ignore-but-don't-misclassify (never list as image, never error).
- Conditions: resaved filesets with sidecar present.
- Evidence: S034 L43-46 + L61 1.2KiB example + L193-198 RECOMMENDED/SUGGESTED [O-017]. Plan silent.
- Consequence: license/provenance surfacing is undecided; misclassification as image data is the avoidable defect.
- Validation: open resaved fileset with ro-crate present; not listed as image, no error.

## Correct non-findings (things NOT established — do not build as MUSTs)

- Labels-group-as-open-root entry point: rejected. S003 L438 labels group "is not itself an image." Labels discovery belongs to overlays (V6), not open-root branching (V1).
- Fixed-5D Plan assumption: Plan never states it (L5 says "where relevant"). Fixed-shape controls are an implementation anti-pattern, not a Plan contradiction (V3).
- omero active/label/rdefs/defaultT/defaultZ as MUSTs: example-only S003 L401-423; normative MUSTs end at L426-430. Channel-count-matches-c is example comment L403 (V3).
- UDUNITS-2 units as MUST: SHOULD S003 L170-172. None-tolerant forwarding is recommended precedent S048 L249-258, not 0.5 obligation (V4).
- Napari squeeze/pop channel_axis mechanics as Slide Scout MUST: napari-API-specific S048 L707-716. Underlying asymmetry (images split, labels keep) is real S048 L204-213/L580-584; mechanics are implementation notes (V6).
- Explicit AGAVE dialog bundle as required correction: sufficiency-only precedent S072/S117; required correction is bounding + responsiveness (V7).
- Schema enforces len(scale)==len(axes): false. Schema requires minItems 2 (S053 L208-256); equality is spec-only S003 L312 (V8).
- Failure explanation as "covered": false covered. Generic Plan L7/L11 wording does not cover version/scale/naming/transform classes; disposition is correction (V8).
- "AGAVE TensorStore-backed": overstates S072 L23-28 (build dependency, not proven runtime path).
- bioformats2raw.layout value type: S003 L256 `"3"` vs example L200 `3` — string-vs-int ambiguous; accept both, write per writer convention, do not hard-fail on type alone.
- FormatV05 "writing not supported yet" as current writer gap: version-pinned stale docstring S016 L370 vs CurrentFormat=V05 L387 + #413/v0.12.0 default-write S013/S052 — superseded for post-#413 filesets; retain only pre/post-#413 mix awareness (V9).

## Grouped product decisions for the user

Decide explicitly; defaults below are verifier-safe minima, not spec mandates.

- D-MULTI (V10): multiple multiscales — [A] first-only with visible "N multiscales, showing [name]; switcher" notice, or [B] named selector. Exclude silent first-only and crash. Input: S003 L388-397; matrix S043 L277-316.
- D-PLATE (V12): plate overview — [A] explicit navigation (plate → row/col → well → field/acquisition pickers; overview optional lowest-res + drill-in), or [B] labeled derived stitched overview. Exclude silent square-packing/zeros. Inputs: S041 L12-15; S043 L214-215/L219-220; S018 L404-567.
- D-CUSTOM (V3): custom/null axis presentation — label/order/behavior for non-space/time/channel axes (S003 L169/L301-302). No corpus standard; pick and document. Related: 2D/3D/4D control visibility.
- D-PALETTE (V6): missing image-label colors — [A] hide labels with explanation (napari precedent S048 L657-659), [B] fallback palette (state exact palette), or [C] per-label error. Spec SHOULD S003 L461-466 leaves this open. Also decide properties-panel surfacing (MAY S003 L467-471).
- D-MULTILABEL (V6): multi-channel label presentation — single layer vs per-channel split (asymmetry S048 L204-213 vs L580-584; spec "usually same" S003 L432-433). Pick and document.
- D-OMERO (V3): omero fallbacks — default palette, contrast/window when window absent or start/end outside min/max (validation rule unstated in corpus), initial T/Z when rdefs absent, model color-vs-greyscale (example-only S003 L422; divergence S043). Pick explicit defaults.
- D-UI (V7): large-data UX form — [A] pre-load dialog (AGAVE bundle S117 L97-134) vs [B] lazy/chunked auto-level with inline budget + subregion affordance (S058 L387-389). Either must satisfy V7 bounding + V8 explainability; cancel-on-navigation retained (Plan L7).
- D-ROCRATE (V15): surface ro-crate license/provenance or not. Minimum: V15 safe-minimum. Inputs: S034 L43-46/L193-198.
- D-BROWSE (V13): add multi-fileset browsing or stay single-fileset. If added: zarr.json traversal + version-labeled skips (S023 pattern, 0.5-corrected).
- D-BACKCOMPAT: 0.1..0.4 full reading — out of 0.5 brief; explanation required (V8), reading is a separate product decision. Inputs: S059 v2 layout; S033 default-0.4 L213-217 vs 0.4+0.5 support L223-226.
- D-STACK: desktop Zarr stack closure must avoid v2/v3 split-brain (napari precedent conflict S011 L151-157, FSStore L153-154, Dec 2025 pre-0.8.0). Not a Plan correction — implementation constraint + clean-room dependency validation.

## Unresolved and unchecked items

Carried open questions (missing/ambiguous/contradictory stays unresolved — no finding made):
O-001 codec floor in wild beyond bioformats2raw defaults; O-003 writer dimension_names compliance; O-005 unordered/missing-path fallback; O-006 group-transform/translation prevalence in 0.5; O-007 reader level-count enforcement behavior; O-009 window validation + greyscale-vs-color semantics; O-010 HCS UI preference (decided in D-PLATE, preference data absent); O-011 0.5 bioformats2raw OME/series structure in the wild; O-012/O-023 pre/post-#413 mix in acceptance set; O-013 missing/mixed-ome reader behavior (warning vs error vs tolerant); O-026 translation prevalence in 0.5; O-028 AGAVE default-resolution policy for GPU budget; O-029 first sharded-read-correct version (sharding landed v0.16.0 S052 L300; first-correct-read version unproven); O-032 0.5 equivalents for IDR sample rows (S010 shows 0.1 rows L24-56); validator dimension_names enforcement (S031 L1-14 gives no enforcement detail); auto-shard READ path (S044 writer-scoped only); 0.5-era viewer matrix existence (visited matrix is v0.3/v0.4: S041 L2-20, S043 v0.4 sample URLs).

Unchecked / not re-verified here: full "sources read" extent self-report and "unvisited" completeness (draft §4 — plausible, process-level, see checks C-COV1/C-COV2); unvisited handles beyond targeted windows (draft lists S015/S028/S035/S037-040/S047/S050/S057/S061/S063-067/S073-099 except targeted patterns/S102-116/S118-125 beyond catalog metadata; failed/empty S002/S005/S007/S030/S042/S045/S046/S068 per checks C-D4); search-output handles beyond S001/S006 spot-checks (same disclaimer pattern asserted in O-036, not all re-opened); S052/S026 release bodies beyond cited lines (cited lines verified; surrounding release text not exhaustively reviewed).

## Coverage and limitations

- Method: bundle-first for every O-001..O-040 citation, then direct reads for all mechanical not-found quotes (O-003/O-004/O-005/O-006/O-007/O-009/O-011/O-013/O-014/O-019/O-034/O-037/O-040 — all resolved as line-wrap/case/trivial-quote artifacts with text verified at cited lines), for too-narrow windows (S003 plate/well/layout/multiscales/labels/version-history; S043 group-level transforms L394-471; S048 channel logic; S051 scenes; S026 releases; S034 ro-crate), and for contrary/omitted evidence (labels-entry, schema len checks, layout type, TensorStore, stale FormatV05 docstring, packaging).
- Plan/brief/catalog/README read fully. S003 (896L spec), S053 schema, S055 sharded array, S059 v2 layout, S033 writer matrix, S034 challenge, S043 matrix, S041 versions, S048 reader, S051 RFC-5, S052/S026 releases, S008/S013/S027 rollout, S011/S014/S025 compat, S044 auto-shard, S058/WEBKNOSSOS, S072/S117 AGAVE, S023 finder, S031/S010 validator/samples, and failed/discovery-aid handles (S001/S005/S006/S007/S030/S042/S045/S046/S068) were inspected at cited extents plus context; see checks for exact lines.
- No live fetching, no web/network tools, no shell commands, no reads/writes outside the workspace. No 0.5-era matrix, auto-shard-read proof, validator-enforcement proof, or bioformats2raw-first-0.5-version proof was located in visited sources — each stays unresolved rather than claimed absent.
- Quote match proves existence at lines, not claim correctness; every consequential draft claim was separately compared for version, configuration, and scope against source text and its Plan passage (checks C-P1a..C-COV2). Two disposition errors were corrected (V1 clause rejected, V8 covered→correction) and four overstatements demoted to precedent/choice (V3/V4/V6/V7 notes + non-findings).

