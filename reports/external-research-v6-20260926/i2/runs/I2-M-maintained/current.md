# Current investigator findings

Status: **UNVERIFIED**. This first-view report contains the current typed findings only.
Source citations are investigator leads. Validation proposals are UNEXECUTED; no test result is asserted.

## F0001 — Axes, dimension_names, types, order, and units are calibrated-display obligations

### F0001_ASSERTION · assertion
> Slide Scout must validate and display each image's axes (2-5 dimensions, 2-3 spatial, optional one time and one channel/custom, ordered time-then-channel/custom-then-space with spatial SHOULD zyx), must require the Zarr array dimension_names to match the axes names, and must read per-axis units where present instead of assuming 5D tczyx or unitless pixels.
> 

### F0001_SOURCE_FIT · source_fit
> Spec (S003): L166-174 axes metadata: list of dicts; each MUST contain unique name; SHOULD contain type (one of space/time/channel, MAY be custom); SHOULD contain unit from stated UDUNITS-2 lists (space list L171; time list L172); length MUST equal array dimensionality; "The dimension_names attribute MUST be included in the zarr.json of the Zarr array ... and MUST match the names in the axes metadata." Version history L825-827 confirms 0.5.2 clarified that dimension_names MUST. Multiscales rules L299-303: axes length 2-5 equal to array dimensionality; MUST contain 2-3 type:space; MAY contain one type:time and one type:channel or null/custom; order MUST correspond to array dimension order AND "MUST be ordered by type where the time axis must come first (if present), followed by the channel or custom axis (if present) and the axes of type space"; L303: three spatial axes SHOULD order zyx. Array rule L96-97: up to 5D "with the axis of type time before type channel, before spatial axes". Schema fit (S053 L126-195): axes minItems 2 maxItems 5 uniqueItems true, contains space minContains 2 maxContains 3; each item oneOf typed (name+type required, type in channel/time/space) or custom (name required, type not in that enum). Sample fit (S055 L59-64): dimension_names ["c","z","y","x"] matching S054 axes names c/z/y/x with micrometer on z/y/x and no unit on c (S054 L10-30). Implementation fit: napari-ome-zarr S048 L215-258 derives per-axis types/names/units, tolerates v0.1/v0.2 (assumed 5D AXES_5D) and v0.3 string axes, splits channel into layers, forwards units with None for unitless axes; ome-zarr-py S018 L284-288 validates axes via Axes(axes, fmt). Compatibility fit: S043 rows "axes (v0.3)" L110-141 and "axes (v0.4)" L143-170 show uneven ecosystem handling of names/types/units (v0.4 samples; leads, not 0.5 proof).
> 

### F0001_CONDITION · condition
> Applies per multiscales entry and per level: axis count/order/names are MUST-level and shared across an entry's levels; type and unit are SHOULD-level and may be absent or custom; dimension_names match is MUST-level per array. Channel/custom axes need not exist; time need not exist; 2D images are legal. Custom axis types are explicitly permitted and must not be rejected as malformed.
> 

### F0001_IMPLICATION · implication
> The details panel (dimensions, units, coordinates) must be driven by axes+dimension_names+units, not by position-based guessing: channel/time/plane controls appear only when the corresponding axis type exists; coordinates render in the axis unit where given; mismatched dimension_names or illegal ordering/count is a conformance failure to explain, while missing units or custom types are normal variability to display gracefully (e.g. unitless). Assuming tczyx breaks 2D/3D/4D images, swapped orders, and custom axes.
> 

### F0001_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Fixtures: 2D yx, 3D zyx, 4D czyx (mirror S054/S055), 5D tczyx, one entry with a custom fourth axis type, one array with dimension_names out of order vs axes, one axis without unit. Assert: controls match axis types; units shown per axis with unitless axes labeled as pixels/default; mismatch fixture produces an understandable conformance message naming the axis. None run; proposal only.
> 

### F0001_UNCERTAINTY · uncertainty
> Unresolved: exact UDUNITS-2 matching strictness (spec says SHOULD be one of listed strings; unknown units must be tolerated but display wording is a product choice). napari's v0.1-v0.3 fallbacks (S048 L222-236) are legacy-compat behavior, not 0.5 obligations, and are cited only to show the reader must branch on axes shape. The S043 axes rows use v0.3/v0.4 samples; their per-viewer verdicts do not transfer to 0.5 inputs. No bounded-absence claim is made about additional axis rules beyond the searched S003 L166-174, L299-303 and S053 axes block.
> 

### F0001_PLAN_FIT · plan_fit
> Relevant Plan lines: L5 "channel visibility controls, time-point and plane selection where relevant" and "details panel shows dimensions, units and coordinates"; L11 acceptance "channel and plane controls, calibrated coordinate display". Disposition: COVERED in intent, UNDERSPECIFIED on the driving metadata. The Plan never names axes, dimension_names, axis ordering/count/type rules, or unit vocabularies. Proposed addition: bind controls and calibrated display to validated axes+dimension_names+units with explicit handling of missing units and custom types. No replacement Plan prose is offered.

## F0002 — Bioformats2raw.layout collections need explicit multi-image discovery, not first-only

### F0002_ASSERTION · assertion
> Slide Scout must recognize the transitional bioformats2raw.layout wrapper (top-level layout value 3 with numbered image groups and an OME companion group), must surface every image in the collection rather than silently opening the first, must give plate metadata precedence when both are present, and must treat OME/METADATA.ome.xml as read-only provenance rather than pixel data.
> 

### F0002_SOURCE_FIT · source_fit
> Spec (S003 L175-275, transitional): the layout captures Bio-Formats multi-image (series) ordering for filesets already in the wild; a future spec will replace it with explicit metadata. Layout L183-191: series.ome.zarr with top zarr.json carrying bioformats2raw.layout, an OME group with zarr.json series list plus METADATA.ome.xml, and numbered image groups 0/1/.... Attributes L193-253: top-level ome.bioformats2raw.layout example value 3; when the top group is a plate, bioformats2raw.layout is present but "the plate key MUST also be present, takes precedence and parsing ... should follow plate metadata"; OME-group series example ["0","1"]. Group rules L255-270: conforming groups MUST have value "3"; SHOULD carry OME/METADATA.ome.xml adhering to OME-XML but using MetadataOnly (not BinData/BinaryOnly/TiffData), MAY use the minimum spec; image location logic: plate present means plate locations win (with SHOULD-provided matching series for unaware tools); OME group MAY carry series (MUST be string paths in OME-XML Image order when present); without series or plate, multiscales images MUST live in consecutive groups from "0"; every multiscales group MUST equal exactly one OME-XML Image in series/group order. Reader rules L271-275: readers SHOULD make users aware of more than one image (SHOULD NOT default to only the first); MAY use OME-group series for the display list; MAY show all images or offer a choice as with plates; MAY ignore other root groups/arrays. Reader-mechanism fit: napari-ome-zarr Bioformats2raw (S048 L341-371) matches layout-without-plate, parses OME/METADATA.ome.xml Image IDs into child paths, and yields children without yielding itself. Bounded-absence fit: case-insensitive regex search for bioformats2raw, word-boundary series, and METADATA.ome.xml over S016+S018+S019 returned only S048 hits plus "metadata" substring hits for METADATA, i.e. no bioformats2raw/series handling was located in the captured ome-zarr-py format/reader/io files (evidence limits: string search over those three files only; proves neither absence of behavior nor truth of any implementation claim). Compatibility fit: S043 bioformats2raw.layout row L240-275 (sample_files.zarr): vizarr redirects to the validator with per-image links; napari unsupported lead #71; BigDataViewer detects single-resolution arrays only; OMERO supported; most others unsupported. Scope: wrapper rules are 0.5 spec text; matrix verdicts are single-sample leads.
> 

### F0002_CONDITION · condition
> Value "3", series-in-Image-order, consecutive numbering, one-group-per-Image, and plate precedence are MUST-level; OME-XML presence and multi-image awareness are SHOULD-level; series use, show-all-or-choice, and ignoring siblings are MAY-level. The wrapper is explicitly transitional and may be superseded; the viewer must therefore isolate this discovery path. Plate+layout coexistence resolves to plate parsing, never to layout parsing.
> 

### F0002_IMPLICATION · implication
> "Lists the images it finds" must include layout collections as a first-class discovery case: detect layout 3, prefer plate parsing when plate exists, else resolve the image list from OME-group series when present (validating Image-order correspondence where the XML is readable) or from consecutive numbering, present the collection (list or choice UI), and never silently display only "0". OME/METADATA.ome.xml must be opened read-only for provenance/series order; its MetadataOnly form carries no pixels. Unrecognized root siblings may be ignored but should be mentioned when they look like images, to avoid hiding data.
> 

### F0002_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Fixtures: layout-3 collection with OME series ["0","1"] plus METADATA.ome.xml (assert both images listed, order matches); layout-3 without series (assert consecutive-number discovery); layout-3 plus plate key (assert plate parsing wins); collection whose XML is missing (assert numbered fallback with an explanatory note). None run; proposal only.
> 

### F0002_UNCERTAINTY · uncertainty
> Unresolved: exact collection UI (list vs choice dialog vs show-all), how deep to validate OME-XML Image correspondence, and wording when numbered groups are non-consecutive. The transitional status means future spec text may obsolete this path; applicability of the quoted rules is pinned to the captured 0.5 report. The S043 row and napari#71 lead are single-sample allegations. The bounded absence result for S016/S018/S019 is evidence-limited string-search output ("not located in the specified search"), not proof that ome-zarr-py lacks the behavior.
> 

### F0002_PLAN_FIT · plan_fit
> Relevant Plan lines: L5 "lists the images it finds"; L7 "allow the user to choose another item"; L11 acceptance "image discovery". Disposition: COVERED in intent, MISSING for collections. The Plan never names bioformats2raw.layout, series, OME/METADATA.ome.xml, plate precedence, or the SHOULD-NOT-first-only rule. Proposed addition: define collection discovery with explicit multi-image surfacing and plate precedence. No replacement Plan prose is offered.

## F0003 — Coordinate transformations: per-level scale required, translation placed, readers diverge

### F0003_ASSERTION · assertion
> Slide Scout must compute physical coordinates from each dataset level's own coordinateTransformations (exactly one scale, optionally one translation listed after scale, vector lengths equal to axis count), composed with any entry-level transformations applied afterwards, and must not assume uniform downsampling, zero origin, or level-independent scales; ecosystem readers demonstrably diverge here, so the composition rule must be implemented deliberately rather than copied from any one reader.
> 

### F0003_SOURCE_FIT · source_fit
> Transform vocabulary (S003 L276-293): list of dicts each with type; only scale and translation are admitted for multiscales use; each stores a vector as a float list or binary path; list applied sequentially in order. Dataset rules (S003 L308-313): each datasets entry MUST contain coordinateTransformations mapping data to physical coordinates; MUST be only scale/translation; MUST contain exactly one scale giving pixel size/duration, or where unavailable the factor versus level 0 defaulting to 1.0 on non-downsampled axes; MAY contain exactly one translation giving origin offset, which MUST be listed after scale so it is in physical coordinates; scale and translation lengths MUST equal axes length. Entry rules (S003 L314-316): a multiscales-level coordinateTransformations MAY exist, follows the same type/order rules, and "are applied after" the per-dataset ones (example L368-374 puts shared time scale 0.1 there). Example (L336-366): level scales [1,1,0.5,0.5,0.5], [1,1,1,1,1], [1,1,2,2,2] showing per-level physical sizes. Writer-validator fit (S016 FormatV04 L296-366, inherited by FormatV05): requires per-level lists matching level count, exactly one scale, scale first, scale/translation lengths equal ndim, numeric values, at most one translation; generate (L276-294) synthesizes scale from shape ratios plus a centering translation. Schema fit (S053 L196-266): minItems 1, contains exactly one scale (maxContains 1), items oneOf scale/translation with minItems 2 vectors. Sample fit (S054 L31-74): three czyx levels with x/y doubling per level while c/z stay constant. Divergence evidence (compatibility leads, v0.4 samples): S043 L318-351 dataset-scale row (avivator/vizarr unsupported, no scalebar), L352-393 dataset-translation row (only napari supported; vizarr 3D-translation-disappears lead vizarr#271; WEBKNOSSOS unsupported lead #6600), L394-472 entry-level scale/translation rows (napari unsupported lead napari-ome-zarr#73; BigDataViewer/MoBIE/neuroglancer/vtk vary). Reader-mechanism fit: napari-ome-zarr S048 L260-292 compiles only datasets[0]'s first transform plus at most one matching entry transform into one Affine, then splits scale from affine; ome-zarr-py S018 L293-295 merely stores per-level lists without composing. Scope: MUST/SHOULD rules are 0.5 spec text; matrix verdicts and issue leads are single-sample allegations about other products, not 0.5 proof.
> 

### F0003_CONDITION · condition
> Per-level scale is MUST; translation is optional-but-placed (after scale); entry-level transforms are optional and apply after per-level ones. Scale vectors without physical meaning (relative factors with 1.0 defaults) are legal and must still be honored for level-to-level alignment. Binary-path vectors (path form) are permitted by the vocabulary and must at minimum fail explainably if unsupported. The spec constrains multiscales transforms to scale/translation; rotation/affine/sequence handling in S048 (L51-133) targets other metadata generations and is not a 0.5 multiscales obligation.
> 

### F0003_IMPLICATION · implication
> Calibrated coordinates, scale bars, plane/time readouts, and label-to-image alignment must all flow from composed per-level transforms; level switching must recompute the mapping rather than reuse level 0. Ignoring translation misplaces origins; ignoring entry-level transforms drops shared calibration (e.g. time scale); assuming factor-2 or z-constant pyramids breaks Z-downsampled data (S043 L1-35 lead: vizarr expects equal Z per level, issue #60). Because captured readers disagree (compose-first-only vs store-only vs ignore), Slide Scout must specify its own composition order explicitly.
> 

### F0003_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Fixtures: levels with non-2 and Z-varying scales; a level with a nonzero translation; an entry-level scale combined with per-level scales (mirror S003 L336-374 numbers); a translation-before-scale ordering violation; a path-form vector. Assert: displayed physical coordinates equal composed mapping per level; violation fixture yields a conformance message; path-form yields an explicit unsupported message if not implemented. None run; proposal only.
> 

### F0003_UNCERTAINTY · uncertainty
> Unresolved: numeric tolerance for scale/translation composition, display rounding, and behavior when scale is relative-only (no units) versus physical. The S043 per-viewer verdicts and all issue leads (vizarr#60/#101/#271, napari-ome-zarr#73, webknossos#6600) are unresolved single-sample leads, not consensus and not transferable to 0.5 inputs. Absence note: within the bounded domain of S003 L276-316 plus S053 coordinateTransformations block, no rotation/affine/sequence type is admitted for multiscales datasets (evidence: exact quoted type enumerations; limit: section-scoped reading, not a whole-corpus proof).
> 

### F0003_PLAN_FIT · plan_fit
> Relevant Plan lines: L5 "details panel shows dimensions, units and coordinates" and "chooses an available pyramid level appropriate for the current view"; L11 acceptance "calibrated coordinate display". Disposition: COVERED in intent, UNDERSPECIFIED on the transform pipeline. The Plan never names coordinateTransformations, per-level composition, translation, or entry-level transforms. Proposed addition: require per-level scale+translation composition with entry-level transforms for all calibrated display and overlays. No replacement Plan prose is offered.

## F0004 — Failures must be attributed per item with validator-backed, read-only recovery

### F0004_ASSERTION · assertion
> Slide Scout must convert every open/read failure (missing, malformed, partial, or unsupported data) into an understandable per-image/per-level/per-overlay message with recovery to another item, must never crash or silently misrender, must keep sources unchanged, and should use the captured validator/issue patterns to word and triage failures; captured readers show exactly which failure seams need deliberate handling.
> 

### F0004_SOURCE_FIT · source_fit
> Boundary (brief L5; Plan L9): local filesystem reading; source files unchanged; editing/export/remote/clinical out of scope. Plan failure rules (L7/L11): "opening failures explain which image or data could not be displayed and allow the user to choose another item"; "malformed or unavailable input must produce understandable feedback rather than a crash". Reader failure seams: S019 parse_url returns None for missing/unopenable read paths (L213-233); S019 version-mismatch re-init warns (L58-66); S018 Label warns "no parent found" (L226-227) and logs invalid colors (L245-246); OMERO parse degrades (early exits, warning, try/except "Failed to parse metadata", L330-392); Well/Plate first-field/first-well assumptions raise or zero-fill (L405-439 missing-field zeros, L500-501 "Could not find first well", L553-557 load-exception zeros); S048 warns on unsupported transform types (L120-122), silently skips bad label colors (L624-626), and re-roots labels-path opens to parents (L672-689). Validator fit: S034 samples link every dataset to ome-ngff-validator URLs (L67-83); S043 bioformats2raw row (L240-275) records vizarr redirecting collections to the validator with per-image links; S031 captures the validator README (6-line scope per catalog). Empty-input fit: S002 aliases the NGFF latest/tools captures as zero-byte (catalog: 0 bytes, 0 lines), proving empty/unavailable captures exist in-corpus and readers must handle vacuous inputs. Scope: failure behaviors are implementation/capture evidence; validator remedy is an observed pattern, not a spec duty.
> 

### F0004_CONDITION · condition
> Attribution granularity is per item the user can act on: fileset, plate, well, field, multiscales entry, level, overlay, or storage feature. "Unsupported" (legal but unimplemented: exotic codec/transformer, path-form vectors, future keys) must be distinguished from "malformed" (MUST violation: bad ordering, mismatched dimension_names, non-integer labels, inconsistent well indexes) and "unavailable" (missing files, empty reads). Read-only duty holds during failure handling too: no repair writes, no in-place migration, no memo files inside sources. Validator use is OPTIONAL product choice; remote validator links would cross the local boundary and need review.
> 

### F0004_IMPLICATION · implication
> Each failure needs: what was attempted (path + item), which contract or capability failed (named rule or feature), what still works (siblings/levels), and the next action (choose another item, open at lower resolution, disable overlay, check storage support, validate externally). Silent degradation (skip colors, drop limits, first-only, zero-filled tiles) must be surfaced where it changes interpretation; zeros for missing HCS tiles (both captured readers) are placeholder rendering that Slide Scout must label as missing rather than present as data. Crash-equivalent outcomes (unhandled raise on first-well absence, squeeze/axis mismatches, OOM on eager reads) must be converted to messages.
> 

### F0004_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Failure-injection battery over local fixtures: missing level directory; listed-but-missing label path; malformed omero window; inconsistent well rowIndex; unsupported codec marker; empty (0-byte) zarr.json; first-well-absent plate. Assert per case: no crash, message names item+rule+feature, siblings still navigable, source tree byte-identical afterwards, and (where offered) validator hand-off preserves the failing path. None run; proposal only.
> 

### F0004_UNCERTAINTY · uncertainty
> Unresolved: message catalog wording, whether to bundle offline validation rules versus link a (possibly remote) validator, and how to present zero-filled versus unattempted tiles. S002's emptiness is a capture artifact (fetch produced zero bytes), not proof about live endpoints; it only motivates vacuous-input handling. Validator README content beyond its catalog scope was not read in this session; no claim is made about validator coverage. All crash/redirect notes are single-sample leads.
> 

### F0004_PLAN_FIT · plan_fit
> Relevant Plan lines: L7 failure-explanation plus choose-another-item recovery; L9 read-only boundary and explicit-review gate; L11 "understandable feedback rather than a crash" acceptance. Disposition: COVERED in intent, UNDERSPECIFIED in taxonomy and seams. The Plan gives no failure categories (malformed/unsupported/unavailable), no attribution granularity, no validator role, and no read-only-during-failure rule. Proposed addition: a per-item failure taxonomy with named-rule messages, labeled degradation, and reviewed validator hand-off. No replacement Plan prose is offered.
> 

## F0005 — Labels are integer multiscales with listed paths, colors, properties, and source

### F0005_ASSERTION · assertion
> Slide Scout label overlays must follow the labels contract: a labels group listing label-image paths, each label image an integer-typed multiscales pyramid with the same level count as its image, display driven by the image-label colors/properties/source metadata (source defaulting to the parent image), intermediate groups carrying no metadata, and labels hidden until the user enables them.
> 

### F0005_SOURCE_FIT · source_fit
> Spec (S003 L431-466): labels group nested in the image group beside resolution levels; "The labels group is not itself an image; it contains images." Label pixels MUST be integer dtypes [uint8,int8,uint16,int16,uint32,int32,uint64,int64]. Intermediate groups between labels and images are allowed but "MUST NOT contain metadata"; label-image names are arbitrary. The labels zarr.json MUST contain labels=[paths]; all label images SHOULD be listed (example L443-453 lists ["cell_space_segmentation"]). The label zarr.json MUST implement multiscales, and its datasets array MUST have the same number of entries (scale levels) as the unlabeled image. It SHOULD also carry image-label with colors (each entry MUST have label-value int; MAY have rgba [0-255 x4] with alpha) and version (MUST be a string); readers SHOULD display labels using colors. Further (L467-514): properties MAY exist as per-label-value objects with arbitrary extra keys (keys may differ per value); source MAY exist with image path default "../../"; worked example maps 0 to half-blue and 1 to half-green. Layout note (L102-117): each label dimension equals the image dimension or is 1 when irrelevant. Reader fit: ome-zarr-py Labels (S018 L183-200) loads only listed names that exist; Label (L202-268) resolves source.image to a hidden prepended parent (warns "no parent found" otherwise), normalizes rgba /255, keeps bool|int label-values else logs invalid, stashes properties minus label-value. Multiscales auto-loads labels/ as invisible (S018 L315-318). napari-ome-zarr: Multiscales.children (S048 L178-197) attaches Label children inheriting parent transforms with channel-axis adjustment; Label keeps all axes unsplit (L580-584); metadata (L600-661) builds colormap+properties, defaults visible False; read_ome_zarr (L707-717) emits layer_type labels, pops channel_axis and squeezes it, since napari labels layers MUST NOT have channel_axis. Opening from a labels path re-roots to the parent image (L672-689). Compatibility fit: S043 "labels" row L171-206 (v0.4 sample): vizarr/napari/BigDataViewer/MoBIE/WEBKNOSSOS supported; others open-but-unsupported. Scope: contract rules are 0.5 spec text; matrix verdicts are v0.4-sample leads.
> 

### F0005_CONDITION · condition
> Integer dtype, labels listing, multiscales conformance, and equal level counts are MUST-level; listing completeness, image-label presence, and color-driven display are SHOULD-level; colors entries beyond label-value, properties keys, and source.image are MAY-level with the stated defaults. A label dimension of 1 means that dimension is irrelevant, not an error. Intermediate groups must be traversed for discovery but never read for metadata.
> 

### F0005_IMPLICATION · implication
> Overlay discovery must enumerate labels[] paths (tolerating unlisted-but-present versus listed-but-missing with an explained gap), verify integer dtype and level-count parity per overlay, align each overlay level with the same-level image transforms (never level-0-only), render through image-label rgba with alpha, expose properties per label value, resolve source.image (default parent) for attribution, and keep overlays off by default. Non-integer label data or level-count mismatch is a conformance failure to explain per overlay while the base image still displays.
> 

### F0005_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Fixtures: labels group with two listed overlays (one with colors+properties+source, one bare); an overlay with float dtype; an overlay with fewer levels than the image; a listed path missing on disk; an intermediate grouping folder. Assert: listed overlays discoverable and hidden by default; colors/alpha/properties shown; source resolved; each defect yields a per-overlay message naming the overlay while the base image renders. None run; proposal only.
> 

### F0005_UNCERTAINTY · uncertainty
> Unresolved: rendering when colors is absent (both readers still load; napari omits colormap when empty, S048 L657-659); whether bool label-values are genuinely legal beyond both readers accepting bool|int; how 1-sized label dimensions interact with per-level transforms; exact overlay opacity/compositing UI. The S043 labels verdicts are v0.4-sample leads about other products. No claim is made about label authoring, which is outside the read-only boundary.
> 

### F0005_PLAN_FIT · plan_fit
> Relevant Plan lines: L5 "optional overlays for associated label images"; L11 acceptance "aligned label overlays". Disposition: COVERED in intent, UNDERSPECIFIED on every mechanism: listing, integer dtype, level parity, colors/properties/source, 1-sized dimensions, hidden-by-default, and per-overlay failure. Proposed addition: define overlay discovery, alignment, styling, and degradation per the labels contract. No replacement Plan prose is offered.

## F0006 — Large-data responsiveness must be lazy, leveled, cancellable, and chunk-aware

### F0006_ASSERTION · assertion
> Slide Scout must keep interaction responsive on large filesets by loading lazily per pyramid level, chunk, well, and field (never whole arrays or whole plates), by choosing levels from the current view against true per-level shapes, and by cancelling superseded work on navigation; captured dataset scales (tens of GB to ~1 TB) make eager or level-0-first loading a correctness-grade failure.
> 

### F0006_SOURCE_FIT · source_fit
> Scale evidence (S034 challenge README): 4496763.zarr 589.81 MB shape 4,25,2048,2048 (L67-68); 9822152.zarr 21.57 GB shape 1,1,1,93184,144384 (L69-70); 9846151.zarr 66.04 GB shape 1,3,1402,5192,2947 (L71-72); plates 190129 1.0 TB, 190206 485 GB, 190211 704 GB (L77-83); conversions taking 34 minutes to 9 hours (L125-137) and plate guidance to shard whole images (L141-146). Reader-mechanism fit: all captured readers are lazy via dask/zarr (S019 L143-145 da.from_zarr; S018 L298-313 appends per-level dask arrays with shape/chunks/dtype logging; S048 L199-202 per-path dask arrays; plate/well stitching builds concatenated lazy graphs with zero-fill for missing tiles, S018 L425-466/L537-567, S048 L503-511). Pyramid-shape fit: bioformats2raw defaults smallest level to at most 256x256 with factor-2 steps, configurable via --target-min-size/--resolutions/--tile-width/--tile-height (S033 L107-124); challenge per-resolution chunk/shard tables (S034 L99-129) show level-specific tuning. Chunk/shard performance fit: S034 L292-308 (shard defaults, 100M-pixel rule, per-resolution JSON); S058 L360-362 sharded-Zarr-v3 compress with parallel jobs; S055 chunk [1,10,512,512] vs inner [1,1,256,256] shows fetch granularity differs from logical chunks. Compatibility caution: S043 HCS row (L207-238) notes vizarr shows only the lowest plate resolution and napari crashes on zoom (single-sample leads); Z-downsample row (L1-35) notes napari crash-on-zoom and vizarr equal-Z assumptions. Scope: sizes and mechanisms are capture-pinned; crash notes are leads, not Slide Scout predictions.
> 

### F0006_CONDITION · condition
> Responsiveness applies to every large-read path: initial open, level switch, pan/zoom, channel/time/plane change, well/field change, overlay toggle, and plate overview. "Appropriate level" is view-dependent and must be recomputed from viewport, downsampling, and true per-level shapes/transforms, never from level index arithmetic. Cancellation applies to superseded selections; completed tiles may be cached within the session (display settings are session-local per Plan L9). Source files must remain unchanged (brief L5; Plan L9), so no memo/cache may be written into the fileset.
> 

### F0006_IMPLICATION · implication
> The viewer needs: progressive level-of-detail selection starting from a small level; windowed chunk/shard fetching with prefetch around the viewport; per-well/per-field/per-overlay lazy materialization (plate overviews at low resolution with drill-down, following vizarr's captured pattern as one option, not a duty); background scheduling with cancellation tokens; memory bounds tied to chunk/shard sizes; and visible loading states per view. Eager full-resolution reads, whole-plate materialization, or blocking the UI thread will hang or exhaust memory on captured-scale inputs.
> 

### F0006_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Fixtures: multi-GB shaped metadata fixtures (real payloads stubbed at the chunk layer if needed) plus the S034 shape table as sizing oracles (21 GB, 66 GB, 1 TB cases). Assert: initial paint completes without fetching level 0; rapid navigation cancels prior fetches (no stale tiles win); memory stays within a stated bound; plate overview resolves at low resolution with per-well drill-down; every long read shows progress/cancel. None run; proposal only.
> 

### F0006_UNCERTAINTY · uncertainty
> Unresolved engineering choices: exact level-selection heuristic, prefetch radius, cache sizes/eviction, thread counts (S034 default 16 chunks, tunable to 128, is converter guidance, not viewer prescription), and progress UX. The S043 crash-on-zoom notes are unresolved single-sample leads about other products. No captured source gives a viewer-side latency/throughput SLO, so "responsive" needs a product-defined bound. Cache placement must respect read-only sources; session-cache location is undecided.
> 

### F0006_PLAN_FIT · plan_fit
> Relevant Plan lines: L5 "chooses an available pyramid level appropriate for the current view"; L7 "large image reads run in the background", "changing the selected view cancels work that is no longer needed"; L11 "a large dataset must not freeze interaction". Disposition: COVERED in intent, UNDERSPECIFIED in mechanism. The Plan states background/cancel/level-choice without laziness granularity (chunk/well/field/overlay), level-selection inputs, memory bounds, progressive states, or plate-overview strategy. Proposed addition: specify lazy leveled chunk-aware loading with cancellation and named bounds. No replacement Plan prose is offered.
> 

## F0007 — Multiscales discovery must handle many entries, names, paths, and ordering

### F0007_ASSERTION · assertion
> Slide Scout image discovery must treat multiscales as a list of one or more named multiscale images with arbitrary per-level dataset paths ordered largest-to-smallest, must not assume a single image, numeric "0..n" level names, or a fixed pyramid factor, and must define which multiscales entry it shows when several exist.
> 

### F0007_SOURCE_FIT · source_fit
> Spec (S003 0.5 report): L294-298, multiscales metadata under the group key holds "a list of dictionaries where each entry describes a multiscale image" of 2-5 dimensional data in a multi-resolution representation. L299-303: each entry MUST contain axes (length 2-5, equal to array dimensionality); L304-307: each entry MUST contain datasets, each with path "relative to the current zarr group", and "The paths MUST be ordered from largest (i.e. highest resolution) to smallest". L91-96: array names are "arbitrary with the ordering defined by the multiscales metadata, but ... often a sequence starting at 0". L317-319: each entry SHOULD contain name and SHOULD contain type plus metadata describing the downscaling method. Selection rule L388-397: "If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback", with example code matching name "3D" then multiscales[0]. Schema fit (S053 image.schema): multiscales minItems 1, uniqueItems true; each item requires datasets and axes; each dataset requires path and coordinateTransformations; datasets minItems 1. Implementation fit, both captured readers use only the first entry: ome-zarr-py S018 L279-283 (multiscales[0], datasets, version default "0.1") and napari-ome-zarr S048 L201 (paths from multiscales[0]) and L237 (dataset_0). Compatibility evidence: S043 features matrix row "multiple 'multiscales'" (L277-316) records all surveyed viewers "supported: no" for opening beyond the first item (BigDataViewer/MoBIE crash, WEBKNOSSOS extraction error, OMERO "sample image is corrupted" per linked issue lead). Non-2 pyramid evidence: S043 L80-108 "multiscales downsampling not=2" records vizarr/avivator unsupported with issue lead vizarr#101. Scope: obligations quoted are 0.5 spec text; viewer-matrix rows cite v0.4 samples and older behavior, so they are compatibility leads, not 0.5 failure proof.
> 

### F0007_CONDITION · condition
> Applies whenever a group carries multiscales: single images, label images (which MUST implement multiscales, S003 L454), fields of view under wells, and bioformats2raw numbered groups. Ordering largest-to-smallest and path relativity are MUST-level writer rules. The name-selection-plus-first-fallback rule is the spec's stated reader behavior. Downscaling type/metadata are SHOULD-level. The compatibility matrix describes other products at capture time; existence of a gap elsewhere does not create a Slide Scout requirement, but the underlying format variability (many entries, arbitrary paths, non-2 factors) does.
> 

### F0007_IMPLICATION · implication
> "Lists the images it finds" must be defined over three distinct multiplicities: multiscales entries within one group, dataset levels within one entry, and image groups within a fileset/plate/collection. The viewer must resolve level order from datasets order (never lexical path order), must read each level's own shape and transforms (never derive factor 2), and must decide explicitly: show first entry only, offer a name choice, or show all. Silent first-only behavior repeats the documented ecosystem gap and contradicts the spec's user-choice rule.
> 

### F0007_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Build local fixtures: (a) group with two multiscales entries named "3D" and "2D" with different level counts; (b) one entry whose dataset paths are non-numeric ("full","half") in largest-first order; (c) levels with non-2 factors (use S043's 9846318.zarr/0 shape pattern as inspiration, not as a fetched source). Assert the viewer lists entries by name, defaults to the first when no choice is made, orders levels by datasets order, and renders each level at its true shape. None run; proposal only.
> 

### F0007_UNCERTAINTY · uncertainty
> Unresolved product choice: whether Slide Scout offers entry choice UI, auto-picks by name, or documents first-only as a limitation. The S043 crash/corruption notes are uncorroborated single-sample leads (issue titles and matrix notes are allegations, not consensus or shipped-behavior proof). Level-name arbitrariness is specified, but no captured source bounds which characters may appear; filesystem-hostile names remain an open edge. This finding does not assert any 0.5 fileset in the wild contains multiple entries, only that the format permits them.
> 

### F0007_PLAN_FIT · plan_fit
> Relevant Plan lines: L5 "lists the images it finds" and "chooses an available pyramid level appropriate for the current view"; L11 acceptance "image discovery, navigation". Disposition: COVERED in intent, UNDERSPECIFIED on all three multiplicities and on the selection rule. The Plan's "appropriate level" language assumes one pyramid without defining entry choice, path resolution, or non-2 factors. Proposed addition: define discovery over multiscales entries/datasets/groups with the spec's name-choice-plus-first-fallback rule. No replacement Plan prose is offered.
> 

## F0008 — Omero rendering metadata is optional but strictly shaped when present

### F0008_ASSERTION · assertion
> Slide Scout must treat omero metadata as optional, but when present must honor its strictly shaped channel rendering (channels array with 6-hex-digit color and window min/max/start/end per channel) plus visibility labels, defaults (rdefs defaultT/defaultZ, model color or greyscale), and graceful handling of the wider transitional fields; invented defaults must not override author intent.
> 

### F0008_SOURCE_FIT · source_fit
> Spec (S003 L398-430, transitional): omero holds "information specific to the channels of an image and how to render it"; example L401-423 shows id, name, channels[] with active/coefficient/color/family/inverted/label/window(end/max/min/start), and rdefs with defaultT 0, defaultZ 118, model "color", pointing to OMERO WebGateway docs. Rules L426-430: optional, but if present MUST contain channels; each entry MUST contain color (6 hex digits RGB) and window; window MUST contain min, max, start, end. Schema fit (S053 L75-125): omero requires channels; window requires start/min/end/max numbers; label/family/color/active optional. Sample fit (S054 L77-114): two channels (LaminB1 0000FF, Dapi FFFF00), windows end 1500 max 65535 min 0 start 0, rdefs defaultT 0 defaultZ 118 model color. Reader fit: ome-zarr-py S018 L325-392 parses rdefs model (greyscale forces white [1,1,1]), per-channel color to black-to-rgb colormap, label to name (fallback channel_idx), active to visibility ANDed with node visibility, window start/end to contrast limits (any missing start/end disables all limits); malformed channels (missing/uncountable) exit early with warning; whole parse wrapped in try/except with "Failed to parse metadata". napari-ome-zarr S048 L293-337 matches colormaps to napari built-ins, prefixes names with image name, skips None windows while preserving index alignment, and splits or collapses rendering by channel_axis presence. Compatibility fit: S043 "omero info" row L38-78 (v0.4 sample 6001240.zarr): vizarr/napari/WEBKNOSSOS supported (WEBKNOSSOS "rdefs are not supported"), Vol-E and Microscopy Nodes read labels but ignore colors, others open-but-ignore. Scope: shape rules are 0.5 spec+schema text; matrix verdicts are v0.4-sample leads about other products.
> 

### F0008_CONDITION · condition
> Omero is OPTIONAL at the format level; absence must yield viewer-chosen rendering, never an error. When present, channels/color/window/min/max/start/end are MUST-level shape; active, label, family, coefficient, inverted, id, name, rdefs are carried fields with defined meaning (defaults and model) but no captured MUST on readers to apply each one. Window start/end are the display limits; min/max are the data bounds. Model is "color" or "greyscale" in the example; other values are unspecified in the searched text.
> 

### F0008_IMPLICATION · implication
> Channel visibility controls, initial channel on/off, colors, contrast limits, initial timepoint and Z plane, and color-vs-greyscale mode should initialize from omero when present, with local session overrides (Plan L9: display settings local, source files unchanged). Missing omero, partial windows, or unparseable entries must degrade to sensible local defaults with the image still displayed; a malformed omero block must never block image display (both captured readers degrade rather than raise). Greyscale model must collapse channel colors to white per both readers' behavior.
> 

### F0008_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Fixtures: S054-faithful two-channel omero (assert colors/names/limits/visible/defaultT/defaultZ/model applied); omero absent (assert local defaults); window missing start (assert documented degradation, image still shown); color malformed (assert fallback color, no crash); model greyscale (assert white rendering). Record which fields were applied versus defaulted in the details panel. None run; proposal only.
> 

### F0008_UNCERTAINTY · uncertainty
> Unresolved product choices: exact fallback palette/limits when omero is absent or partial; whether coefficient/family/inverted/id/name affect rendering or are display-only; how to surface that rendering came from omero versus local defaults. The S043 per-viewer omero verdicts are v0.4-sample leads, not 0.5 requirements. Absence note: within the bounded domain of S003 L398-430 plus S053 omero block, no reader MUST to apply rdefs or active was located (evidence: exact quoted rule sentences; limit: section-scoped reading).
> 

### F0008_PLAN_FIT · plan_fit
> Relevant Plan lines: L5 "channel visibility controls, time-point and plane selection where relevant"; L9 "display settings are local to the viewing session"; L11 acceptance "channel and plane controls". Disposition: COVERED in intent, UNDERSPECIFIED on the metadata source. The Plan never names omero, window/color/active, rdefs defaults, or the color/greyscale model. Proposed addition: initialize channel rendering and default T/Z from omero when present with specified degradation when absent or malformed. No replacement Plan prose is offered.
> 

## F0009 — Plates, wells, and acquisitions define HCS navigation, sparsity, and stitching limits

### F0009_ASSERTION · assertion
> Slide Scout must navigate plates and wells through their metadata (plate rows/columns/wells/version with 0-based consistent rowIndex/columnIndex/path; well images[] with paths and per-acquisition links), must support sparse plates and multi-acquisition wells, and must not assume dense grids, first-field-only content, or uniform field shapes; whole-plate stitched views are a product choice with documented reader pitfalls, not a format duty.
> 

### F0009_SOURCE_FIT · source_fit
> Hierarchy (S003 L118-148): three groups above fields: well (MUST implement well spec; images in a well are fields of view of the same well), row, plate (MUST implement plate spec); row/well groups SHOULD NOT exist when empty. Plate (L515-560): acquisitions MAY exist (each MUST have unique id >= 0; SHOULD have name and maximumfieldcount positive int; MAY have description/starttime/endtime epoch ints); columns MUST list every physical column (each MUST have alphanumeric case-sensitive unique name; avoid case-insensitive collisions); rows likewise MUST list every row; field_count SHOULD give max fields per view; name SHOULD name the plate; version MUST be a string; wells MUST list objects each with path "row/column" (no extra leading/trailing directories), rowIndex and columnIndex 0-based, all three mutually consistent. Examples: dense 2x3 plate L561-640; sparse 96-well plate with 2 wells L641-739. Well (L740-808): images MUST list every field of view (path alphanumeric case-sensitive unique; acquisition int required when the plate has multiple acquisitions, matching a plate acquisition id); version SHOULD be a string; examples cover 4-field/2-acquisition and 2-field/first-and-last-acquisition wells. Sample fit (S056): 6 rows x 11 columns with 48 wells in non-sorted order, field_count 32, no acquisitions key (sparse, single-acquisition shape). Reader fit, ome-zarr-py Well (S018 L394-466): builds an almost-square dask grid (ceil-sqrt columns), reuses the FIRST field's metadata/shapes/dtype for all, substitutes zeros for missing/out-of-range fields, concatenates along y/x; Plate (L468-567): sorts well paths, also first-well/first-field driven (raises "Could not find first well" when absent, L500-501), renders missing wells as zeros, stitches the full row x column grid per level. napari-ome-zarr Plate (S048 L498-556): lazy dask pyramid from helpers, metadata from first well's first field, PlateLabels children only when the first field carries labels. Compatibility fit: S043 "HCS plate" row L207-238 (v0.4 sample): vizarr shows only lowest plate resolution and opens wells in new windows; napari loads but crashes on zoom (lead); MoBIE supported; most others unsupported. Changelog fit: S017 records HCS fixes (missing wells #111, 5D assumptions #148, compute-on-grid #299, Well-exists check #296, hardcoded "0" field #300). Scope: navigation rules are 0.5 spec text; reader behaviors and matrix verdicts are implementation/capture-time evidence, not duties.
> 

### F0009_CONDITION · condition
> Plate rows/columns/wells/version and well images/path are MUST-level; row/column name character rules and index consistency are MUST-level; field_count, plate name, well version, acquisition names/counts are SHOULD-level; acquisitions/description/timestamps are MAY-level. Empty rows/wells SHOULD NOT be materialized. Acquisition links are REQUIRED on well images only when the plate defines multiple acquisitions. Nothing in the searched spec text requires a viewer to stitch a whole-plate canvas.
> 

### F0009_IMPLICATION · implication
> "Find images within a fileset" for HCS means plate picker, row/column/well navigation honoring sparse wells lists, field-of-view selection within a well, and acquisition filtering where present; well paths must be resolved from metadata (never globbed), indexes validated for consistency, and missing wells/fields shown as explicitly empty rather than silently dropped or fabricated. Whole-plate overviews, if offered, must be lazy per level, must tolerate heterogeneous field shapes, and must attribute load failures per well/field; first-field metadata reuse (both captured readers) is a known simplification to document, not a correctness rule.
> 

### F0009_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Fixtures: sparse plate mirroring S056 (assert only listed wells navigable, unlisted cells explicitly empty); multi-acquisition well (assert acquisition filter matches plate ids); well with an inconsistent rowIndex/path pair (assert conformance message naming the well); well with a missing field directory (assert per-field message, siblings render). Record overview-vs-drill-down behavior per fixture. None run; proposal only.
> 

### F0009_UNCERTAINTY · uncertainty
> Unresolved product choices: overview canvas versus well/field drill-down as the primary HCS UX; whether acquisition starttime/endtime and maximumfieldcount are displayed or ignored; tolerance for heterogeneous field shapes in one well. The S043 HCS verdicts and napari-crash note are v0.4-sample single-sample leads. Absence note: within the bounded domain of S003 L118-148 plus L515-560 plus L740-808, no whole-plate stitching duty was located (evidence: quoted MUST/SHOULD sentences; limit: section-scoped reading).
> 

### F0009_PLAN_FIT · plan_fit
> Relevant Plan lines: L5 "lists the images it finds" and "selecting an image opens a canvas"; L7 "opening failures explain which image or data could not be displayed and allow the user to choose another item"; L11 acceptance "image discovery, navigation". Disposition: COVERED in intent for flat filesets, MISSING for HCS structure. The Plan never names plates, wells, rows, columns, fields of view, acquisitions, or sparsity. Proposed addition: define HCS navigation over plate/well/acquisition metadata with explicit sparse and multi-acquisition behavior. No replacement Plan prose is offered.
> 

## F0010 — Zarr v3 storage variability: codecs, chunks, shards, dtypes must be honored or explained

### F0010_ASSERTION · assertion
> Slide Scout must read 0.5 pixel data through per-array Zarr v3 storage metadata (data_type, chunk grid and shape, codecs including sharding, fill value, byte order) rather than assuming one codec, chunking, or dtype, and must explain unsupported storage instead of misrendering; the captured ecosystem shows real codec/chunk/shard/dtype diversity that a fixed-assumption reader will mishandle.
> 

### F0010_SOURCE_FIT · source_fit
> Format permission (S003 L70-72): all Zarr features "including codecs, chunk grids, chunk key encodings, data types and storage transformers may be used with OME-Zarr unless explicitly disallowed". Converter evidence (S033 bioformats2raw README): default output is Blosc lz4 clevel 5 (L155); per-version codec table (L157-163) gives v3/0.5 support for null, blosc, gzip, zstd but NOT zlib (v2/0.4 instead supports zlib, not gzip/zstd); blosc options cname/clevel/blocksize/shuffle (L167-175), gzip level (L177-182), zstd level/checksum (L191-198); guidance to benchmark choices per dataset (L202-208). Shard evidence: S034 L292-308 (Zarr v3 shards contain multiple chunks; shard shape must be a multiple of chunk shape; resave defaults the shard to the full array shape; shards over 100M pixels require explicit --output-shards; per-resolution JSON tuning via output-write/read-details); worked conversions (S034 L99-146) show per-resolution shard/chunk tables and a whole-image shard for plates. Array sample (S055): uint16 czyx array with regular chunk grid [1,10,512,512], sharding_indexed codec with inner chunk [1,1,256,256], bytes little-endian + blosc(cname zstd, clevel 5, shuffle) + crc32c index codecs, fill_value 0. WEBKNOSSOS fit (S058, case-insensitive regex hits): L310 v0.5 structure section; L360-362 compress example creating "a sharded Zarr v3 dataset" while "--data-format zarr" yields "unsharded Zarr v2"; L388 "Enable sharding (only available in Zarr 3+)". Dtype evidence: S025 (vizarr README L84-86) Viv supports int8/16/32, uint8/16/32, float32/64, inviting contributions for more; S043 L99 records a neuroglancer failure "Unsupported numpy data type: >u1" (big-endian, single-sample lead). Reader fit: captured readers delegate storage to dask/zarr (S019 L143-145 da.from_zarr; S018 L298-313 logs shape/chunks/dtype per level; S048 L199-202 da.from_zarr per path), i.e. they inherit backend codec support rather than implementing codecs. Scope: S003 permission plus S033/S034/S055/S058 capture-time behaviors; matrix/issue dtype notes are leads.
> 

### F0010_CONDITION · condition
> Any Zarr v3 codec, chunk grid, transformer, dtype, or sharding the NGFF text does not disallow is legal input; no captured source narrows this for 0.5. Bioformats2raw's table and defaults describe one converter's --compression/--ngff-version 0.4-or-0.5 output (S033 L157-163, L223-226), not reader obligations. Dtype restrictions in S025 describe Viv/vizarr support, not format legality; label-integer rules (uint8..int64) are the only dtype MUST located, scoped to labels (S003 L438-439).
> 

### F0010_IMPLICATION · implication
> The viewer needs a storage-capability matrix (dtypes, codecs, sharding, transformers, endianness) driven by its actual Zarr backend, per-array capability checks before render, and per-image/per-level explainable failures naming the unsupported feature (codec, dtype, transformer) with the affected path. Chunk/shard shapes also drive the responsiveness design (prefetch windows, tile sizes) and must be read per array; assuming 256x256 tiles or full-plane chunks breaks converters' varied outputs (S033 tile options L122-124; S034 per-resolution tables).
> 

### F0010_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Fixtures: blosc/zstd-sharded array mirroring S055; gzip and uncompressed (null) variants; big-endian dtype; an exotic transformer if the backend admits one. Assert: supported fixtures render identically; unsupported ones produce messages naming path plus feature (e.g. codec "zstd" vs dtype ">u1"); chunk shapes reported in details match array metadata. None run; proposal only.
> 

### F0010_UNCERTAINTY · uncertainty
> Unresolved: the exact backend Slide Scout will use and hence its real codec/dtype/shard support; behavior on storage transformers (permitted by S003, unobserved in samples); whether to bundle fallback decoders or defer to the validator. The neuroglancer >u1 note and Viv dtype list are capture-time single-source leads, not conformance verdicts. Absence note: within the bounded domain of S003 L67-72, no 0.5 codec/dtype restriction was located beyond the labels integer list (evidence: quoted permission sentence; limit: section-scoped reading).
> 

### F0010_PLAN_FIT · plan_fit
> Relevant Plan lines: L5 "chooses an available pyramid level appropriate for the current view"; L7/L11 "opening failures explain which image or data could not be displayed" and "malformed or unavailable input must produce understandable feedback". Disposition: COVERED in intent for failure messaging, MISSING for storage variability. The Plan never names codecs, chunks, shards, dtypes, fill values, or backend capability. Proposed addition: require per-array storage-capability checks with named-feature failure messages. No replacement Plan prose is offered.

## F0011 — Version interop: 0.5-only scope must be explicit against 0.4/Zarr-v2 reality

### F0011_ASSERTION · assertion
> Slide Scout must make an explicit product decision about non-0.5 inputs (0.4 on Zarr v2, mixed-version hierarchies, draft 0.5.x/0.6 shapes) because the captured ecosystem is mid-migration: the reference Python stack cannot yet write 0.5 and is pinned below Zarr v3 at capture time, converters emit both 0.4 and 0.5, and most compatibility evidence predates 0.5.
> 

### F0011_SOURCE_FIT · source_fit
> Spec lineage (S003 L821-833): 0.4.0 specified axes types/units/transforms and rowIndex/columnIndex; 0.5.0 (2024-11-21) moved to Zarr v3; 0.5.1 re-added omero text; 0.5.2 clarified dimension_names MUST. Captured 0.4 spec (S059, ngff 0.4 capture) exists as a separate source, confirming a distinct prior contract. Implementation fit: S016 FormatV05 docstring "added FormatV05 (May 2025): writing not supported yet" (L368-371) with zarr_format 3 versus V01-V04 zarr_format 2; S017 changelog (0.10.2, Nov 2024, L21-29) "pin zarr at < 3"; S011 (napari-ome-zarr issue #139, Dec 2025) reports the resulting conflict: bioio-ome-zarr 3.x needs zarr>=3 while napari-ome-zarr via ome-zarr needs zarr<3, failing with "cannot import name 'FSStore' from 'zarr.storage'", and points at unreleased PR #123 (zarr v3 direct, drops ome-zarr) as the possible path; the same issue alleges the default napari reader ignores coordinateTransformations scales. Format detection (S016 L35-46; S019 L58-66) auto-detects per-location format and re-inits store on mismatch with a warning. Converter fit: S033 --ngff-version supports 0.4 and 0.5 (L223-226) with version-dependent codec tables (L157-163); S034 challenge converts 0.4/Zarr-v2 inputs to 0.5/Zarr-v3 outputs without modifying inputs (L152-156). Reader forward-compat hints (not duties): S048 tolerates coordinateSystems/v0.6 shapes (L219-220, L274-283), rotation/affine/sequence transforms (L51-133), and Scene graphs (L402-496). Compatibility-matrix scope: every S043 sample_url inspected cites v0.3/v0.4 paths, so no matrix verdict transfers directly to 0.5 inputs. Scope: migration facts are capture-pinned; issue text is a user report plus maintainer-absent thread, i.e. a lead, not consensus.
> 

### F0011_CONDITION · condition
> The brief and Plan scope Slide Scout to local OME-Zarr 0.5 filesets (brief L3; Plan L5/L9). 0.4, mixed-version, and post-0.5 shapes are therefore out-of-scope inputs requiring a deliberate accept/reject/explain policy, not silent best-effort. The spec's version-consistency MUST (S003 L156) binds hierarchies, not readers. Forward-compat constructs (coordinateSystems, Scene, rotation/affine/sequence) appear only in reader-tolerance code and tools-matrix-adjacent sources, never as 0.5 multiscales obligations in the searched spec text.
> 

### F0011_IMPLICATION · implication
> Opening must detect the input generation (zarr.json+ome/0.5 vs .zattrs/0.4 vs unknown/draft) before dispatch, and each non-0.5 outcome needs a defined message and recovery (choose another item, convert externally, or documented partial read). Claiming 0.4 compatibility would import the whole v2 storage stack (chunk encodings, .zattrs, v0.4 codec table) and the v0.4-indexed compatibility evidence; claiming 0.5-only keeps the floor clean but must still explain 0.4 filesets helpfully since converters and archives still emit them. Either choice must be recorded; "best effort, undefined" repeats the ecosystem's mid-migration confusion.
> 

### F0011_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Fixtures: conforming 0.5 fileset; 0.4/Zarr-v2 fileset (S059-era shape); mixed hierarchy (0.5 plate over 0.4-style metadata); unknown-future key carrier. Assert: generation detected and reported; each non-0.5 input yields the specified accept/reject/explain outcome; no silent misread (e.g. ignored scales as alleged in S011). None run; proposal only.
> 

### F0011_UNCERTAINTY · uncertainty
> Unresolved product decision: 0.5-only versus dual-generation support, and the exact message/recovery per generation. S011's timeline/stability questions (PR #123 production-readiness, release plans) are unanswered in the captured thread; PR contents beyond the issue's description were not in the bounded read set. S048's v0.6/Scene tolerance is forward-looking reader behavior whose spec basis is outside this case's admitted 0.5 corpus reading; it must not be treated as a 0.5 requirement. Version-pinned behaviors (zarr<3, no 0.5 writing) may already be stale relative to newer releases.
> 

### F0011_PLAN_FIT · plan_fit
> Relevant Plan lines: L5/L9 "local OME-Zarr 0.5 fileset" scope with "additional capability choices require explicit review"; L7/L11 failure-feedback acceptance. Disposition: COVERED as scope, MISSING as interop policy. The Plan names 0.5 but never addresses 0.4, mixed versions, or draft shapes, and "interoperate with filesets from real OME-Zarr 0.5 tools" (L9) assumes a settled 0.5 ecosystem the captures contradict. Proposed addition: an explicit generation-detection and non-0.5 policy plus review gate for any dual-generation claim. No replacement Plan prose is offered.
> 

## F0012 — OME-Zarr 0.5 means Zarr v3, zarr.json, ome namespace, consistent version

### F0012_ASSERTION · assertion
> Slide Scout must open OME-Zarr 0.5 as Zarr format version 3 hierarchies whose OME metadata lives in each group's zarr.json under attributes.ome with ome.version "0.5" kept consistent through the hierarchy. Zarr v2 layout (.zattrs/.zgroup/.zarray, v2 chunk-key encodings) must not be assumed on the 0.5 path.
> 

### F0012_SOURCE_FIT · source_fit
> Authority is the captured 0.5 specification report (S003, "Final Community Group Report, 8 September 2026", version history L821-833: 0.5.0 2024-11-21 "use Zarr v3 in OME-Zarr"; 0.5.2 clarifies dimension_names MUST). Storage floor, S003 L68-72: OME-Zarr "is implemented using the Zarr format as defined by version 3 of the Zarr specification" and "All features of the Zarr format including codecs, chunk grids, chunk key encodings, data types and storage transformers may be used with OME-Zarr unless explicitly disallowed in this specification." Metadata placement, S003 L150-156: "The OME-Zarr Metadata is stored in the various zarr.json files", "stored under the namespaced key ome in attributes", "The version ... is denoted as a string in the version attribute within the ome namespace", "The OME-Zarr Metadata version MUST be consistent within a hierarchy", with the L157-165 example showing attributes.ome.version "0.5". Implementation fit: ome-zarr-py at 94eaf20 (S016) defines FormatV05 version "0.5", zarr_format 3, chunk_key_encoding default separator "/", versus FormatV01-V04 zarr_format 2; S019 (io.py L87-90) unwraps the "ome" namespace for zarr v3 groups. Migration fit: S034 (ome2024-ngff-challenge README) states challenge data has "all v2 arrays converted to v3" and "all .zattrs metadata migrated to zarr.json[attributes][ome]". Sample fit: S054 (image group), S055 (array), S056 (plate) all show zarr_format 3 with attributes.ome.version "0.5". Scope: this is the operative 0.5 floor; 0.4/Zarr-v2 behavior is addressed in the version-interop finding, not here.
> 

### F0012_CONDITION · condition
> Applies to every 0.5 open path: single image, labels subgroup, plate, well, and bioformats2raw.layout wrapper. The version-consistency MUST is a writer/hierarchy obligation; the searched spec text states no explicit reader duty (reject, warn, or best-effort) for mixed-version hierarchies. Zarr v3's full feature set (codecs, chunk grids, transformers) is permitted unless the NGFF text disallows it, so the viewer cannot assume one codec or chunking.
> 

### F0012_IMPLICATION · implication
> Local open must parse zarr.json (not .zattrs), read attributes.ome, and dispatch on keys multiscales, plate, well, labels, image-label, omero, bioformats2raw.layout. Chunk-key handling must follow the v3 default (separator "/") and per-array metadata rather than hard-coded v2 "." separators (FormatV01 vs V02/V05 contrast in S016). A fileset that lacks zarr.json or the ome namespace is not a conforming 0.5 input and must take the explainable-failure path, not a crash or silent misread.
> 

### F0012_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED. Locally open captured fixtures S056 (plate zarr.json), S054 (multiscales+omero image group), S055 (sharded array zarr.json) with a Zarr v3 reader and assert: group open reads ome.version "0.5"; dispatch keys are found; array dimension_names/shape/codecs parse. Negative probes: a hierarchy mixing ome.version "0.4" and "0.5" (record warn/reject/read behavior); a Zarr v2 0.4 fileset (record message quality). None of these probes has been run; this proposal is substantive content, not a passing test.
> 

### F0012_UNCERTAINTY · uncertainty
> Unresolved: exact reader duty on version inconsistency within one hierarchy (spec states the writer MUST only). ome-zarr-py auto-switches store and format on detected mismatch with a warning (S019 L58-66), but that is one implementation's choice, not a specification rule, and must not be copied as an obligation. Separate 0.5.1/0.5.2 patch texts were not captured; the quoted 0.5 report is treated as the operative rule with that qualification. No claim is made about Zarr v3 spec details beyond what the NGFF captures state.
> 

### F0012_PLAN_FIT · plan_fit
> Relevant Plan lines (case/plan/Viewer.md): L5 "opens a local OME-Zarr 0.5 fileset and lists the images it finds"; L9 local-filesystem boundary, source files unchanged; L11 acceptance "image discovery". Disposition: COVERED in intent, UNDERSPECIFIED in mechanism. The Plan names 0.5 but states no Zarr v3 / zarr.json / ome-namespace / version-consistency floor. Proposed addition: require the 0.5 open path to parse zarr.json attributes.ome with version "0.5" and to route non-conforming inputs to the explainable-failure path. No replacement Plan prose is offered.

## Structural delivery status

INCOMPLETE

Unresolved structural/chronology errors; inspect structural status and separate audit.
