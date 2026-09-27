# Slide Scout 0.5 research report (draft)

Scope: local read-only desktop browser for OME-Zarr 0.5 filesets (brief.md). This report assesses the thin Plan snapshot (plan/Viewer.md) against the fixed corpus case/sources/*.txt. A Plan passage marks specified coverage, not implemented or tested behavior. Nothing here is independently verified beyond the corpus; validation ideas are checks to run, not passed tests.

## 1. Supported propositions

### Format obligations (0.5 authority: S003 + S053)

- P1. 0.5 is Zarr v3 only, with metadata in `zarr.json` under `attributes.ome` and `version: "0.5"` consistent through the hierarchy [O-001, O-002]. All Zarr features are allowed unless disallowed, so arbitrary codecs, chunk grids, key encodings, dtypes and transformers are legal input.
- P2. Multiscales images are 2-5D with ordered axes (time, channel/custom, space), `dimension_names` on every level array matching axes names, datasets ordered largest-first with arbitrary path names, each dataset carrying exactly one scale plus optionally one translation after it, vectors matching axes length; an optional top-level multiscales transform applies after per-dataset ones [O-003, O-004, O-005, O-006, O-066].
- P3. `omero` is optional transitional render metadata; when present, `channels` with 6-hex `color` and `window {min,max,start,end}` are required, plus `rdefs {defaultT, defaultZ, model}` and per-channel `active/label` as display defaults [O-008, O-067].
- P4. Labels live under a `labels` group (not an image), allow metadata-free intermediate groups, require integer dtype from a fixed 8-member set, SHOULD all be listed in the labels-group `labels` array, are themselves multiscales images with the same level count as the source, and SHOULD carry `image-label` with `colors` (label-value + optional rgba), `version`, optional `properties`, and `source.image` default `../../` [O-009, O-010].
- P5. HCS layout is plate -> row groups -> well groups -> field images, with strict plate keys (rows, columns, wells with consistent path/rowIndex/columnIndex, version) and well keys (images with unique alphanumeric path, acquisition id when multi-acquisition) [O-011, O-012, O-013]. Sparse plates list full row/column extent but only present wells [O-023].
- P6. `bioformats2raw.layout: 3` is transitional multi-image packaging; plate takes precedence when present, else OME `series` list, else numbered groups `0,1,2...`; readers SHOULD surface all images, not just the first [O-014].
- P7. The 0.4->0.5 break is Zarr v2->v3 (`.zattrs/.zarray/.zgroup` vs `zarr.json`, flat vs `ome`-namespaced attrs); 0.5.1/0.5.2 clarified omero text and the `dimension_names` MUST [O-015, O-055-scope, O-060].

### Reader implementations (observed behavior, not spec)

- P8. Reference Python reading moved in stages: 0.5 read-only on zarr v3 (PR404, Nov 2024), then 0.5 write-by-default with mixed v04/v05 writes rejected (PR413, v0.12.0), then sharding (v0.16), then permissive-0.5/scene/plain-string-codec handling (v0.19); the S016 FormatV05 snapshot (May 2025, write unsupported) is stale relative to releases [O-016, O-046, O-054, O-061].
- P9. ome-zarr-py unwraps v3 attrs under `ome`, validates exactly-one-scale-first with <=1 translation and ndim-matched numeric vectors, reads only `multiscales[0]`, degrades omero/contrast silently on bad input, stitches wells/plates into lazy dask grids with zeros for missing tiles, and falls back to raw-array load or silent ignore [O-017, O-018, O-019, O-020, O-067, O-068].
- P10. napari-ome-zarr (post-PR123, direct zarr>=3.0.8, no ome-zarr dep) dispatches Multiscales/Plate/Bioformats2raw/Labels/Scene, splits image channels into layers while keeping label axes whole, squeezes label channel axes, hides labels by default, resolves arbitrary entry points by walking up, and tolerates rotation/affine/sequence transforms with warn-and-skip [O-026, O-027, O-049, O-062, O-063, O-064].
- P11. AGAVE (desktop, tensorstore v0.1.78) reads local 0.4+0.5 with explicit resolution/channel/sub-region choice, GPU-memory estimate, <=4 concurrent channels, time slider, and version-branched metadata lookup, but assumes T,C,Z,Y,X dimorder and documents a 4-dtype switch [O-051, O-052, O-053].
- P12. Bioformats2raw writes 0.4 and 0.5 with a v3/0.5 codec table (null, blosc, gzip, zstd; no zlib), TCZYX default order, ~256px smallest level with factor-2 steps by default, and options that can produce non-spec hierarchies or drop OME/root markers [O-037, O-038, O-039, O-055, O-056].
- P13. Real 0.5 filesets observed: IDR czyx image with physical per-level scales and micrometer space units [O-021]; sharded blosc/zstd uint16 array with `dimension_names` [O-022]; sparse 6x11 plate with ~50 wells and field_count 32 [O-023]; challenge conversions with heterogeneous sharding plus top-level RO-Crate sidecars [O-024]; sizes from 589 MB to 1 TB [O-025].

### Compatibility failures and contradictions (must-handle)

- P14. Rendering/decoding failures on valid-looking 0.5 data are attested: vizarr repetitive-chunk rendering of resave conversions [O-042]; neuroglancer no-metadata-found plus silent no-chunks on sharded v3 [O-048]; napari zarr<3 pin vs bioio zarr>=3 conflict [O-043]; v2 `compressor` kwarg rejected on v3 writes [O-047]; auto-sharding writer crash (S044 file, read; no separate O-block).
- P15. Calibration is unevenly implemented across viewers: dataset scale read by 7/11 surveyed, translation applied only by napari (vizarr image-disappears, WEBKNOSSOS fails to open), top-level scale read by 4/11, Z-downsampled and non-2-factor pyramids break vizarr/avivator, and the default napari reader ignores transforms producing wrong anisotropy [O-029, O-030, O-033, O-034, O-035, O-044].
- P16. Discovery ambiguities are real: no surveyed viewer opens beyond `multiscales[0]` and three crash on the multi-multiscales sample [O-032]; labels listings can be missing while label groups exist and the pre-0.5 spec under-defined labels objects [O-050]; bioformats2raw discovery has three competing rules (spec series/numbered-groups vs napari OME-XML parse) [O-027]; PR206's labels-registration-move proposal contradicts released spec text [O-060].
- P17. HCS at scale has exactly one proven low-risk pattern in the corpus: plate overview at low resolution plus drill-down per well/field (vizarr); full-resolution stitched canvases crash (napari zoom crash) or hide missing data as zeros (ome-zarr-py) [O-020, O-031].

### Opportunities and simpler alternatives

- P18. Directory traversal + served browsing (`ome_zarr finder` + BioFile Finder CSV with Folder tree, thumbnails, copy-URL) is a shipped simpler alternative to deep indexing; its 0.5 gap is precisely the zarr.json traversal the Apr-2025 version deferred [O-045].
- P19. The validator URL pattern plus IDR/challenge sample catalogs give a ready acceptance oracle: every representative fileset should first open in ome-ngff-validator [O-059, O-025, O-013-context S034/S010].
- P20. Bounded precedents exist for hard choices: Vizarr/Viv and AGAVE publish explicit dtype matrices [O-028, O-051]; AGAVE publishes an explicit memory-bounding load dialog [O-052]; WEBKNOSSOS publishes chunk/shard tuning guidance [O-041].

## 2. Plan fit

Plan citations use plan/Viewer.md line numbers. Each item carries one disposition, the exact constraint, product consequence, and a distinguishing validation idea (not a passed test).

### F1. "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan L5)
- Disposition: correction.
- Constraint: discovery must branch on store markers (0.5 `zarr.json` + `attributes.ome.version=="0.5"` vs 0.4 `.zattrs`; mixed hierarchies invalid), then follow plate->well->field lists, bioformats2raw.layout precedence (plate > OME series > numbered groups), labels-listing UNION directory probing, first-multiscales default with multi-multiscales choice, and arbitrary entry-point walk-up [O-001, O-002, O-006, O-007, O-011, O-012, O-013, O-014, O-015, O-040, O-046, O-050, O-063].
- Consequence: a flat image list is wrong for plates/collections; the finder must present hierarchy-aware navigation (fileset > plate/well/field or series > image > labels) and version-aware errors.
- Validation idea: open five fixtures (plain image; sparse plate S056-shape; bioformats2raw multi-series; labels-unlisted labels group; 0.4 fileset) and check the listed tree plus the 0.4 message, against validator results for the same fixtures.

### F2. "canvas with pan and zoom" + "chooses an available pyramid level appropriate for the current view" (Plan L5)
- Disposition: correction.
- Constraint: level order is datasets[] order (never numeric sort); per-level pixel size comes from that level's scale (never assumed factor 2); z-size may differ per level; arrays may be sharded with blosc/gzip/zstd codecs and 3D or 2D chunks [O-005, O-006, O-021, O-022, O-024, O-029, O-030, O-037, O-041, O-056].
- Consequence: the renderer needs scale-aware level selection, per-level plane counts, and a v3 codec/shard decode stack; assuming uniform 2x y/x-only pyramids breaks real data.
- Validation idea: render a Z-downsampled pyramid and a non-2-factor pyramid next to a known-good view and compare level shapes, displayed scale, and tile alignment at three zoom steps.

### F3. "channel visibility controls" (Plan L5)
- Disposition: covered, with correction on defaults.
- Constraint: visibility/label/color/window defaults come from omero channels when present (color hex, active, label, window start/end; greyscale model whitens; missing windows must not silently reset all channels); absent omero needs deterministic fallbacks; split-layer vs composite rendering is open [O-008, O-026, O-051, O-052, O-067].
- Consequence: controls work without omero but match omero when present; a single bad channel must degrade per-channel with notice, not wipe all contrast.
- Validation idea: open one image with full omero, one without, and one with a single broken window; record initial visibility, names, colors, and contrast limits per channel.

### F4. "time-point and plane selection where relevant" (Plan L5)
- Disposition: correction.
- Constraint: which selectors appear is driven by axes (2-5D, time/channel/space/custom order), not by fixed 5D tczyx; plane counts vary per pyramid level when Z is downsampled; rdefs defaultT/defaultZ give initial positions when present [O-003, O-008, O-029, O-053, O-055].
- Consequence: 2D/3D/4D and custom-axis images show only applicable selectors; switching pyramid level must remap plane indices through that level's shape.
- Validation idea: open 2D, 3D, 4D (no-t), 5D, and custom-axis fixtures; check selector presence, default positions vs rdefs, and plane-count changes across two pyramid levels.

### F5. "optional overlays for associated label images" (Plan L5)
- Disposition: correction.
- Constraint: discover labels by listing UNION probing; require integer dtype and same level count; align overlay level-to-level with the source image using each side's transforms; default hidden with explicit toggle; colors from image-label colors (invented colormap only when absent); channel axis removed for the overlay layer; plate labels derive per wells/fields [O-009, O-010, O-021-context, O-026, O-036, O-050, O-062].
- Consequence: overlay is a label-specific aligned layer (not general multi-image fusion); misaligned levels or missing colors must produce explicit notices, not silent offsets or invisible labels.
- Validation idea: overlay a labeled image at two pyramid levels and screenshot-diff label boundaries against the source; repeat with missing image-label colors and with a plate labels fixture.

### F6. "details panel shows dimensions, units and coordinates" (Plan L5)
- Disposition: correction.
- Constraint: coordinates combine per-dataset scale/translation with top-level multiscales transforms, in axes order with UDUNITS units (space/time lists; channel usually unitless); dimension_names must match axes names; translations must at minimum not break rendering; inconsistent/missing units need a stated display rule [O-003, O-004, O-005, O-021, O-033, O-034, O-035, O-044].
- Consequence: the panel shows per-axis pixel size, units, and calibrated cursor coordinates computed from the active level's combined transform; ignoring top-level transforms or translations repeats known viewer bugs.
- Validation idea: for fixtures with dataset-only scale, dataset+top-level scale, and translation, hand-compute three cursor positions from the JSON vectors and compare with panel readouts.

### F7. "Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed." (Plan L7)
- Disposition: covered, with product_choice on bounding strategy.
- Constraint: corpus proves both automatic background/cancel (Plan) and explicit pre-load bounding with memory estimate (AGAVE level/channel/sub-region dialog); TB-scale plates and 21-66 GB images make unbounded eager loads infeasible [O-020, O-025, O-031, O-052, O-057].
- Consequence: keep Plan's background/cancel behavior and add a bounding rule (auto low-res-first and/or explicit choice with estimate) so the large-dataset acceptance case cannot OOM.
- Validation idea: open the largest acceptance fileset while profiling interaction latency and peak memory during pan/zoom/channel flips; cancel must drop stale tile requests observably.

### F8. "Opening failures explain which image or data could not be displayed and allow the user to choose another item." (Plan L7)
- Disposition: correction.
- Constraint: attested failure taxonomy: 0.4-in-0.5-scope, mixed v04/v05, missing/inconsistent version, absent multiscales/plate/well keys, schema violations (counts, required keys, vector lengths), dimension_names mismatch, unsupported codec/shard, unsupported dtype, transform violations, missing wells/fields, unlisted-vs-unreadable labels, non-multiscale entry [O-002, O-015, O-040, O-042, O-046, O-047, O-048, O-060, O-063, O-066].
- Consequence: errors must name the failing node, the violated rule, and the recovery action (pick another item/level); silent ignores and silent no-chunks states are known bad behaviors.
- Validation idea: feed a malformed corpus (one fixture per taxonomy row) and check each message names node + rule + next action, with the browser still usable.

### F9. "should interoperate with filesets from real OME-Zarr 0.5 tools" (Plan L9)
- Disposition: correction.
- Constraint: interop means the observed decode matrices: sharding_indexed + blosc (cname/clevel/shuffle variants)/gzip/zstd/null codecs, arbitrary chunk grids, uint/int/float dtype coverage declared (spec labels need all 8 int types; renderers bound support), 2024-2026 behavior drift (permissive-0.5, plain-string codec attrs), and converter quirks (custom hierarchies, dropped OME/root markers) [O-022, O-024, O-028, O-037, O-039, O-041, O-047, O-051, O-054, O-056].
- Consequence: publish an explicit supported/unsupported matrix (codecs x dtypes x layouts) and test it; anything outside fails loudly with the matrix row cited.
- Validation idea: build a matrix fixture pack (one fileset per codec/dtype/layout cell claimed) and record open/render/explain outcomes per cell.

### F10. "Source files remain unchanged; display settings are local to the viewing session." (Plan L9)
- Disposition: covered.
- Constraint: local read-only opening; no sidecar writes into the fileset; challenge resave and validator flows confirm input-must-not-be-modified expectations [O-024, O-059-context].
- Consequence: no action beyond enforcing read-only file handles and session-scoped settings (avoid absolute-path settings portability trap [O-058]).
- Validation idea: hash the fileset tree before and after a scripted viewing session and diff; any delta fails.

### F11. "Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan." (Plan L9)
- Disposition: covered.
- Constraint: brief + Plan both exclude these; remote-read performance issues (QuPath) and pathology interpretation stay out of scope even where reading code overlaps [O-057].
- Consequence: decline remote URLs and interpretation requests with a scope message; do not partially implement them.
- Validation idea: attempt a remote-URL open and an export action; both must refuse with the scope message and leave local browsing intact.

### F12. "Acceptance uses representative filesets..." (Plan L11)
- Disposition: correction.
- Constraint: representative must span: plain image (2D..5D), sparse plate, bioformats2raw collection, labels (listed + unlisted + plate labels + missing colors), Z-downsampled + non-2 pyramids, translations present, top-level transforms present, multi-multiscales group, sharded + each claimed codec, 0.4 negative, malformed battery; each pre-checked in the validator; large case sized in GB/pixels/chunks [O-025, O-059, O-008-context samples].
- Consequence: acceptance is a fixture matrix with per-cell oracle (validator + known-good view), not a single happy-path fileset.
- Validation idea: publish the matrix and run it end-to-end; any cell without an oracle or threshold fails the acceptance definition itself.

### Optional capabilities (not required by brief/Plan; adopt only with review)

- O-C1. RO-Crate top-level metadata display (specimen/modality/name/description) [O-024]. Consequence: richer details panel for challenge data; validation: show RO-Crate fields for a challenge fileset vs absent-file fallback.
- O-C2. Raw-array fallback view for decodable-but-non-NGFF zarr with explicit notice [O-068]. Validation: open a bare v3 array and check pixels-plus-notice vs silent ignore.
- O-C3. Multi-multiscales choice UI (spec user-choice rule) despite zero surveyed viewers supporting it [O-007, O-032]. Validation: open the multi-multiscales sample without crashing and offer the choice.
- O-C4. Translation-aware alignment (napari-style) rather than ignore-safely [O-034]. Validation: overlay fixture with translation renders aligned, or documents ignore-with-notice.
- O-C5. Rotation/affine/sequence tolerance (warn-and-skip or compose) beyond 0.5 datasets allowance [O-064]. Validation: feed each richer transform and check no-crash + message.
- O-C6. Label properties on hover/inspect (index + arbitrary keys) [O-010, O-062-context]. Validation: hover shows properties table for the S003-example-style fixture.
- O-C7. Finder-style collection browsing (traversal + CSV/Folders tree + thumbnails + copy-URL) for multi-fileset directories [O-045]. Validation: point at a folder of filesets and browse without opening each.
- O-C8. Transfer-function channel rendering and ROI clipping (Vol-E/AGAVE-style) beyond visibility toggles [O-052, O-058]. Validation: reproduce a Pct-Min/exposure adjustment on a multichannel volume.

### Product choices (need explicit decisions; evidence informs but does not settle)

- P-C1. Plate navigation model: overview-plus-drill-down (vizarr pattern) vs stitched canvas vs flat field list [O-020, O-031]. Validation: usability pass on the sparse-plate fixture measuring time-to-first-field and zoom stability.
- P-C2. Channel rendering: split layers vs blended composite [O-026, O-052]. Validation: compare color fidelity and toggle behavior on a 3-channel uint16 fixture.
- P-C3. Pyramid UX: fully automatic level choice (Plan) vs explicit choice with memory estimate (AGAVE) vs hybrid low-res-first [O-052]. Validation: large-fileset open under a memory cap for each mode.
- P-C4. Strictness posture: strict schema rejection vs permissive-with-notice (v0.19 spatial-data precedent) [O-054, O-066]. Validation: open a spatial-data-style edge fixture under both postures and compare outcomes.
- P-C5. Overlay scope: labels-only (recommended) vs general multi-image overlay (only 3/11 viewers support) [O-036]. Validation: attempt a two-image overlay and confirm scoped refusal or supported path per decision.

### Unsupported (do not treat as required)

- U1. General multi-image overlay/fusion on one canvas: a minority viewer capability, not a format obligation [O-036].
- U2. Remote storage, export, editing, clinical interpretation: explicitly out of scope [Plan L9; O-057].
- U3. Scene/coordinateSystems graph traversal (v0.6-era): present in napari code paths but not a 0.5 obligation [O-064, S048 Scene].
- U4. zlib codec for 0.5: absent from the bioformats2raw v3 table (converter-specific, not a format promise) [O-037].

### Unresolved (evidence missing or contradictory)

- R1. Whether the labels-registration move (labels list into the multiscale group) was adopted or reverted before 0.5.0 [O-060 vs O-009].
- R2. What permissive-0.5 (PR594) accepts beyond strict 0.5 [O-054].
- R3. Whether read paths must accept both `compressor` and `codecs` spellings on v3 arrays [O-047].
- R4. Which transform combinations the fixed napari reader applies (dataset + top-level, translation handling) [O-044].
- R5. Real-world frequencies: translations, top-level transforms, multi-multiscales groups, custom hierarchies, non-bioformats2raw pyramid shapes, dtype histogram [O-005..O-007, O-021..O-023, O-027, O-028, O-039, O-056].
- R6. Status of deferred reader gaps: napari PR123 TODOs in releases, vizarr #307 root cause, neuroglancer v3/shard support, Vol-E 0.5 support, AGAVE out-of-switch dtypes [O-042, O-043, O-048, O-049, O-051, O-058].
- R7. Validator coverage: metadata-only vs codec/shard correctness [O-059].

## 3. Deferred items

- D1. Large issue-dump sources (S015, S028, S035, S050, S073, S078, S079, S080, S087, S089, S090, S091, S097, S100, S101, S109, S112, S114) were not read exhaustively; sampled only via targeted search or not at all. Reason: token budget vs marginal yield after core reader/spec/compat coverage; each remains available for follow-up on R5/R6.
- D2. Full 0.4 spec (S059) and RFC pages (S051) were sampled for version-contrast points only. Reason: 0.5 is the authority for this case; 0.4 detail matters only for the negative-message path.
- D3. Full sample catalog (S010), tensorstore/API dumps (S075, S084-S086, S107, S111, S113, S116, S122, S123), release lists (S026, S063, S064, S065), remaining PR/issue bodies (S008-rest, S013-rest, S023-rest, S027-rest, S029-rest), converter/webknossos remainders (S033-rest, S058-rest), and agave/hcs small captures were partially read or searched. Reason: bounded single-session pass; observations already cover their load-bearing facts, with R5-R7 marking the residue.
- D4. Empty/failed captures (O-065) contribute no facts and were treated as absence of evidence throughout.
- D5. No live fetching, rendering, or code execution was performed (case rules); all validation ideas are therefore unexecuted by design.

## 4. Coverage

- Sources read fully or near-fully: S003 (0.5 spec), S004-head (ngff PR206), S008-head (PR404), S009 (repo tree), S011 (napari issue 139), S013-head (PR413), S014 (vizarr issue 307), S016 (format.py), S017 (changelog), S018 (reader.py), S019 (io.py), S023-head (PR436), S025 (vizarr README), S027-part (napari PR123), S031, S033-part, S034 (challenge), S037, S038, S039, S041, S043 (features matrix), S044 (auto-shard issue), S048 (napari reader), S052-part (releases), S053 (image.schema), S054, S055, S056 (0.5 examples), S058-part, S061-part (QuPath), S062, S066, S067, S068, S072, S074-head, S096, S098-part (AGAVE diff), S099, S108, plus empty/stub captures S001, S002-catalog, S005, S006, S007, S012, S021, S030, S032, S036, S042, S045, S046, S049, S060, S069, S071, S077, S095.
- Sources partially read or searched: S010-head, S020-head, S027-rest, S029-part, S059-part (0.4 contrast), S098-rest, S117-part (AGAVE docs).
- Sources read fully (also): S070 (NGFF tools catalog).
- Sources not visited: S015, S024, S026, S028, S033-rest, S035, S040, S047, S050, S051, S057, S058-rest, S063, S064, S065, S073, S075, S076, S078, S079, S080, S081, S082, S083, S084, S085, S086, S087, S088, S089, S090, S091, S092, S093, S094, S097, S100, S101, S102, S103, S104, S105, S106, S107, S109, S110, S111, S112, S113, S114, S115, S116, S118, S119, S120, S121, S122, S123, S124, S125.
- Questions unvisited: per-codec performance tuning, exact validator rule list, spatial-data 0.5 deviations, scene-graph UX, thumbnail generation pipeline.
- Questions unresolved: R1-R7 above; all open questions attached to O-blocks persist as stated.

## 5. Reading guide for implementers

Build order implied by the evidence: (1) version-aware local discovery with the F1 hierarchy and F8 taxonomy; (2) v3 decode stack per the F9 matrix with validator-gated fixtures; (3) axes/transform-driven navigation and calibration (F2-F6); (4) responsiveness bounding (F7) sized by the acceptance matrix (F12); (5) optional capabilities only after review (O-C1..O-C8) and decided product choices (P-C1..P-C5).
