# Observations (incremental, never delete; qualify via later block)

### O-001
- source: S003 lines 68-72
- quote: "OME-Zarr is implemented using the Zarr format as defined by the version 3 of the Zarr specification."
- claim: OME-Zarr 0.5 requires Zarr format version 3; all Zarr features may be used unless explicitly disallowed.
- conditions: version 0.5; scope all OME-Zarr filesets
- implication: Slide Scout must read Zarr v3 groups/arrays (zarr.json), not Zarr v2 (.zattrs/.zgroup/.zarray); codec/chunk-grid handling must be general.
- open question: Which Zarr v3 codecs/chunk grids do real 0.5 filesets use, and which must a minimal reader support?

### O-002
- source: S003 lines 153-156
- quote: "The OME-Zarr Metadata is stored in the various zarr.json files throughout the above array hierarchy. In this file, the metadata is stored under the namespaced key ome in attributes."
- claim: In 0.5 all OME metadata lives under attributes.ome in zarr.json, with ome.version string, and version MUST be consistent within a hierarchy.
- conditions: version 0.5; scope every zarr.json in hierarchy
- implication: Discovery must parse zarr.json attributes.ome.version; inconsistent versions are malformed and need understandable error.
- open question: How do readers behave on missing or mixed ome.version?

### O-003
- source: S003 lines 173-174
- quote: "The \"dimension_names\" attribute MUST be included in the zarr.json of the Zarr array of a multiscale level and MUST match the names in the \"axes\" metadata."
- claim: Each multiscale level array MUST carry dimension_names matching axes names.
- conditions: version 0.5 (clarified 0.5.2 per S003 lines 825-827)
- implication: Reader can cross-check axes vs dimension_names; mismatch is a compatibility failure to report.
- open question: Do existing writers always emit dimension_names?

### O-004
- source: S003 lines 299-303
- quote: "The \"axes\" MUST contain 2 or 3 entries of \"type:space\" and MAY contain one additional entry of \"type:time\" and MAY contain one additional entry of \"type:channel\" or a null / custom type."
- claim: Axes length 2..5; ordering MUST be time, then channel/custom, then space; spatial SHOULD be zyx when 3 spatial axes.
- conditions: version 0.5; scope multiscales image; 2-5D
- implication: Navigation (t/c/z selectors) must derive from axes types/names, not fixed positions; custom/null axis possible.
- open question: How should viewer label/order custom axes?

### O-005
- source: S003 lines 304-306
- quote: "Each dictionary in \"datasets\" MUST contain the field \"path\", whose value contains the path to the array for this resolution relative to the current zarr group. The \"path\"s MUST be ordered from largest (i.e. highest resolution) to smallest."
- claim: Dataset paths are arbitrary relative names ordered largest-to-smallest; commonly "0","1",... but name is arbitrary.
- conditions: version 0.5; scope multiscales.datasets
- implication: Pyramid level choice must follow listed order, not assume numeric names; level-appropriate selection needs shape/scale comparison.
- open question: What fallback if paths are unordered or missing?

### O-006
- source: S003 lines 308-312
- quote: "The transformations are defined according to § 2.3 \"coordinateTransformations\" metadata. The transformation MUST only be of type translation or scale."
- claim: Per-dataset transforms MUST be only scale (exactly one) plus optional single translation after scale; group-level multiscales transforms follow same rules and apply after per-dataset ones; vector length MUST equal len(axes).
- conditions: version 0.5; scope multiscales datasets + optional group-level
- implication: Calibrated coordinates = (index * dataset scale + dataset translation) then group scale/translation; reader must compose both levels and handle missing scale info defaulting to 1.0 / inter-level factor.
- open question: How common are group-level transforms and translations in the wild?

### O-007
- source: S003 lines 438-440
- quote: "The pixels of the label images MUST be integer data types, i.e. one of [uint8, int8, uint16, int16, uint32, int32, uint64, int64]. Intermediate groups between \"labels\" and the images within it are allowed, but these MUST NOT contain metadata."
- claim: Label images live under "labels" group, listed in labels array; label arrays MUST be integer types; intermediate groups allowed but MUST NOT carry metadata; label image MUST implement multiscales with same number of scale levels as source image.
- conditions: version 0.5; scope labels
- implication: Overlay discovery must read labels list, traverse intermediates, validate integer dtype and level-count match; non-integer label data is non-conforming.
- open question: Do readers enforce level-count equality?

### O-008
- source: S003 lines 461-466
- quote: "Conforming readers SHOULD display labels using the colors specified by the colors JSON array, as follows."
- claim: image-label SHOULD contain colors (with label-value + optional rgba 0..255) and version; MAY contain properties (per label-value arbitrary metadata) and source.image (default "../../").
- conditions: version 0.5; scope image-label; SHOULD-level display
- implication: Label overlay colors/opacity and properties panel are SHOULD, not MUST; missing colors needs fallback palette decision.
- open question: What fallback palette do readers use when colors/properties absent?

### O-009
- source: S003 lines 426-431
- quote: "The \"omero\" metadata is optional, but if present it MUST contain the field \"channels\", which is an array of dictionaries describing the channels of the image."
- claim: omero is optional transitional channel rendering metadata; if present MUST have channels[].color (6 hex RGB) and channels[].window {min,max,start,end}; includes active/label/rdefs{defaultT,defaultZ,model color|greyscale}.
- conditions: version 0.5; scope omero transitional; channel count matches c size
- implication: Channel visibility/colors/contrast and initial T/Z can default from omero; missing omero needs viewer defaults.
- open question: How do readers validate window (start/end inside min/max) and handle model greyscale vs color?

### O-010
- source: S003 lines 120-129
- quote: "Three groups MUST be defined above the images: the group above the images defines the well and MUST implement the well specification."
- claim: HCS layout is plate -> row -> well -> field images; plate and well MUST implement their specs; rows/cols fully enumerated even if empty; well path is Row/Column; images listed in well.images with path + optional acquisition id.
- conditions: version 0.5; scope HCS plates/wells
- implication: Image discovery must support plate/well navigation (rows/cols/wells/fields/acquisitions), sparse plates, and field_count/maximumfieldcount; thin plan listing images misses HCS hierarchy.
- open question: What UI do readers use for plate/well/field/acquisition navigation?

### O-011
- source: S003 lines 256-270
- quote: "MUST have the value \"3\" for the \"bioformats2raw.layout\" key in their OME-Zarr Metadata in the zarr.json at the top of the hierarchy"
- claim: Multi-image collections use transitional bioformats2raw.layout=3 at top, with OME/METADATA.ome.xml + optional OME series list; if plate present, plate takes precedence; otherwise numbered groups 0,1,2... each exactly one OME-XML Image in order; readers SHOULD make users aware of more than one image and SHOULD NOT default to only first.
- conditions: version 0.5 transitional; scope collections; bioformats2raw.layout==3
- implication: Opener must not silently open only first series; needs series/plate disambiguation and OME-XML ordering awareness.
- open question: How do local 0.5 filesets from bioformats2raw actually structure OME group and series?

### O-012
- source: S016 lines 368-384
- quote: "Changelog: added FormatV05 (May 2025): writing not supported yet"
- claim: ome-zarr-py FormatV05 (zarr_format 3, chunk key default//) exists alongside V01..V04; V05 writing not supported yet at captured version.
- conditions: ome/ome-zarr-py @94eaf20; FormatV05
- implication: Interop baseline for reading 0.5 may be read-focused; writer behavior for 0.5 is uncertain.
- open question: Which 0.5 read paths are covered by ome-zarr-py at this commit?

### O-013
- source: S019 lines 87-90
- quote: "For zarr v3, everything is under the \"ome\" namespace"
- claim: ome-zarr-py ZarrLocation unwraps zarr v3 group attrs ome namespace into root_attrs and detects format from metadata.
- conditions: ome/ome-zarr-py @94eaf20; ZarrLocation
- implication: Reader code can treat root_attrs as already-unwrapped ome dict in v3; version mismatch triggers warning + re-init path.
- open question: What happens on missing ome key or mixed-namespace filesets?

### O-014
- source: S059 lines 129-134
- quote: "OME-Zarr is an implementation of the OME-NGFF specification using the Zarr format. Arrays MUST be defined and stored in a hierarchical organization as defined by the version 2 of the Zarr specification."
- claim: OME-Zarr 0.4 REQUIRES Zarr v2 (.zgroup/.zattrs/.zarray); 0.5 requires Zarr v3 (zarr.json). The storage identifiers and metadata files differ by version.
- conditions: version 0.4 vs 0.5; scope storage layer
- implication: A 0.5-only local reader must not assume .zattrs exists; encountering Zarr v2 layout means out-of-scope version needing a clear version-mismatch message, not silent failure.
- open question: Should Slide Scout detect and explain 0.4 filesets, or treat any non-0.5 layout identically?

### O-015
- source: S033 lines 159-162
- quote: "| v3/0.5            | yes                 | yes   | yes  | no   | yes  |"
- claim: bioformats2raw documents per-version compression support: for v3/0.5, null=yes, blosc=yes, gzip=yes, zlib=no, zstd=yes (vs v2/0.4 where gzip=no, zlib=yes, zstd=no). Defaults are Blosc lz4 clevel 5 (S033 lines 155, 202).
- conditions: bioformats2raw writer config; Zarr/NGFF version v3/0.5
- implication: 0.5 reader must handle at least null, blosc (with cname/clevel/blocksize/shuffle variants), gzip, and zstd codecs; zlib absence in table is a writer limit, not a reader exemption since spec allows all Zarr features.
- open question: Which codecs appear in real 0.5 filesets beyond bioformats2raw defaults?

### O-016
- source: S033 lines 225-226
- quote: "that should be used while writing Zarr. Current supported values are 0.4 and 0.5."
- claim: bioformats2raw --ngff-version supports writing both 0.4 and 0.5; default output follows 0.4 conventions including bioformats2raw.layout (S033 lines 213-217).
- conditions: bioformats2raw converter; writer option --ngff-version
- implication: Real local 0.5 filesets from bioformats2raw exist alongside 0.4; reader interop target includes bioformats2raw 0.5 layout with OME/METADATA.ome.xml.
- open question: What bioformats2raw version first wrote stable 0.5, and does its 0.5 layout differ from 0.4 beyond storage?

### O-017
- source: S034 lines 43-46
- quote: "- all v2 arrays converted to v3, optionally sharding the data"
- claim: ome2024-ngff-challenge conversion migrates v2 arrays to v3 with optional sharding, moves .zattrs metadata to zarr.json attributes.ome, and adds top-level ro-crate-metadata.json (specimen/modality).
- conditions: challenge resave tool; 0.4 Zarr v2 input -> 0.5 Zarr v3 output; input NOT modified (S034 lines 154-156)
- implication: Representative 0.5 test data includes resaved challenge filesets, some sharded; ro-crate file is extra top-level metadata a reader may ignore but must not confuse with image data.
- open question: Which challenge samples are sharded vs unsharded, and at which levels?

### O-018
- source: S034 lines 78-83
- quote: "[190129.zarr](https://ome.github.io/ome-ngff-validator/?source=https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0090/190129.zarr)"
- claim: Challenge samples span Size 589.81 MB (4,25,2048,2048), 21.57 GB (1,1,1,93184,144384), 66.04 GB, and plates of 1.0 TB / 485 GB / 704 GB (S034 lines 67-83).
- conditions: sample datasets; image and plate scope
- implication: Responsiveness requirement is quantitative: viewer must open multi-GB images and TB-scale plates without freezing; full-resolution eager load is infeasible.
- open question: What chunk counts/shapes do the largest samples use at level 0?

### O-019
- source: S055 lines 16-56
- quote: "\"name\": \"sharding_indexed\""
- claim: Real 0.5 array zarr.json uses chunk_grid regular (chunk_shape [1,10,512,512]) with sharding_indexed codec: inner chunks [1,1,256,256], bytes(little)+blosc(cname zstd, clevel 5, shuffle, typesize 2), index codecs bytes+crc32c; dtype uint16, dimension_names [c,z,y,x], shape [2,236,275,271].
- conditions: version 0.5; example labels array S055; Zarr v3 sharding
- implication: Reader's Zarr v3 stack MUST support sharding_indexed + blosc/zstd + crc32c to open such filesets; chunk shape != shard shape.
- open question: Do all 0.5 readers handle sharding_indexed, or do some fail (cf. vizarr O-021)?

### O-020
- source: S011 lines 151-159
- quote: "The default napari reader (without napari-ome-zarr plugin) does not correctly read OME-Zarr coordinate transformations/scale metadata, resulting in incorrect anisotropic volume rendering."
- claim: Reporter environment (napari 0.6.6, napari-ome-zarr 0.6.1, bioio-ome-zarr 3.2.0, zarr 3.1.5, ome-zarr 0.10.3, Windows) hits dependency conflict: bioio needs zarr>=3 while napari-ome-zarr->ome-zarr pinned zarr<3, breaking import (FSStore); and scale metadata is ignored without the plugin.
- conditions: Dec 2025 issue; napari-ome-zarr 0.6.1 + ome-zarr 0.10.3 (pre-v0.12); Windows
- implication: Correctness depends on applying coordinateTransformations scale; packaging must avoid zarr v2/v3 split-brain; suggested paths were downgrade, install PR #123, or wait for release.
- open question: Which release resolved the pin (see O-028/O-029)?

### O-021
- source: S014 lines 141-142
- quote: "Vizarr renders chunks repetitively for image data converted into OME-ZARR v0.5 format, using the resave command of https://github.com/ome/ome2024-ngff-challenge"
- claim: Vizarr rendered a 3-channel uint16 0.5 image (bioformats2raw group 0, no wells) with repetitively repeated chunks, while the 0.4 version from NGFF-Converter worked; same in Firefox 143 and Chromium. Separately, Viv supports int8/16/32, uint8/16/32, float32/64 (S025 lines 84-86).
- conditions: vizarr issue Oct 2025; 0.5 resaved data; 3-channel uint16
- implication: 0.5 chunk/shard decoding had a real rendering compatibility failure in at least one viewer; dtype coverage is bounded (no uint64/int64/float16/complex) in Viv-based viewers.
- open question: Was the repetitive-chunk bug in sharding, chunk grid, or dimension order handling?

### O-022
- source: S008 lines 149-150
- quote: "This updates ome-zarr-py to use zarr-python v3 but doesn't include support for writing Zarr v3 (OME-Zarr v0.5)."
- claim: ome-zarr-py PR #404 (Nov 2024) moved to zarr-python v3 and added READING OME-Zarr v0.5 (for napari-ome-zarr) without WRITING v0.5; writing methods needed explicit v0.4 during transition.
- conditions: ome-zarr-py PR #404; zarr 3.0.8 test setup; Nov 2024
- implication: Establishes a read-before-write rollout: readers could interoperate with 0.5 before writers stabilized; version-explicit write paths matter.
- open question: What v0.5 read gaps remained after #404 (labels? plates? see S008 line 158,182)?

### O-023
- source: S013 lines 151-156
- quote: "This PR adds support for writing OME-Zarr v0.5, which becomes the default CurrentFormat()."
- claim: PR #413 (merged Aug 2025) made v0.5 the default write format with explicit fmt selection via parse_url(fmt=FormatV04/V05); mixing detected store format with a different fmt throws; known failure: dask path raised ValueError compressor cannot be used for zarr_format 3, use bytes-to-bytes codecs (S013 lines 182-186).
- conditions: ome-zarr-py PR #413 on top of #404; v0.12 era
- implication: Writer interop filesets vary by explicit format choice; reader must tolerate both; codec API differs by zarr_format (compressor vs codecs).
- open question: Do Slide Scout's representative filesets include both pre-#413 and post-#413 writes?

### O-024
- source: S027 lines 150-159
- quote: "Investigating a lighter-weight alternative to ome-zarr-py."
- claim: napari-ome-zarr PR #123 (merged May 2026 per S027 lines 127-131) dropped the ome-zarr dependency for direct zarr v3, folding napari mapping into one step to support RFC-5 complexity; covered bioformats2raw, channels, labels, plates, plates-with-labels; TODOs included labels colors, coordinateTransformations, pre-v0.4.
- conditions: napari-ome-zarr PR #123; Dec 2024-May 2026; zarr>=3.0.8
- implication: Independent reader implementation exists that bypasses ome-zarr-py graph traversal; simpler-alternative precedent for Slide Scout (direct zarr v3 + focused traversal).
- open question: Which TODOs were finished before merge (see release O-029)?

### O-025
- source: S043 lines 80-89
- quote: "Can the viewer handle pyramids when the scale factor between levels is not equal to 2?"
- claim: Viewer matrix records: non-2 downsampling breaks vizarr (opens:no, issue #101) but napari/BigDataViewer/MoBIE/Vol-E pass; multiple multiscales beyond first item unsupported by all listed viewers (S043 lines 277-316, some crash e.g. BigDataViewer ArrayIndexOutOfBounds, WEBKNOSSOS mag-uniqueness error); HCS plate only vizarr/napari/MoBIE supported with caveats (vizarr lowest-res-only + click-well-new-window; napari crashes on zoom) (S043 lines 207-220); bioformats2raw.layout mostly unsupported except vizarr redirect / BigDataViewer Detect-Datasets-as-single-res / OMERO (S043 lines 240-274).
- conditions: ome-ngff-tools matrix; circa April 2025 viewer versions (S041 lines 2-20); samples v0.3/v0.4 (0.5 coverage unclear)
- implication: Thin plan assumptions (single image, any pyramid, plate-as-images) contradict observed viewer gaps: level-scale arithmetic must not assume factor 2; multiscales[1..] needs explicit product decision; HCS and layout wrappers need dedicated navigation, not generic image listing.
- open question: Does an equivalent 0.5/Zarr-v3 matrix exist in-corpus? (Not found; S041/S043 versions predate 0.5 rollout.)

### O-026
- source: S043 lines 394-411
- quote: "Does the viewer read the 'scale' transformation for each item in `multiscales` list?"
- claim: Scale-on-datasets is widely read (except avivator/vizarr no-scalebar, OMERO/Microscopy-Nodes no) (S043 lines 318-351), but scale-on-multiscales (group-level) is read only by BigDataViewer/MoBIE/neuroglancer/vtk-itk-viewer, NOT by napari (issue #73), vizarr, Vol-E, WEBKNOSSOS, OMERO; translation-on-datasets read only by napari (vizarr 3D-translation-makes-image-disappear #271; WEBKNOSSOS fails #6600; others cannot overlay) (S043 lines 352-392); translation-on-multiscales likewise near-universally unsupported.
- conditions: matrix circa April 2025; v0.4 samples; per-level vs group-level transforms
- implication: Correctness failure mode: group-level scale and any translation are silently ignored by most viewers; Slide Scout must decide to compose both levels (spec-correct) vs match common behavior, and must visibly explain translations it cannot display.
- open question: How many real 0.5 filesets use group-level scale or translations?

### O-027
- source: S058 lines 387-388
- quote: "Enable sharding (only available in Zarr 3+)"
- claim: WEBKNOSSOS recommends chunk sizes 32-128 voxels^3, sharding on (Zarr 3+ only), 3D downsampling; its CLI default creates sharded Zarr v3 while --data-format zarr produces unsharded Zarr v2 (S058 lines 360-362); also supports nD/time-series only for Zarr (S058 lines 383-384).
- conditions: WEBKNOSSOS docs; performance guidance; Zarr v3 vs v2
- implication: Performance opportunity: sharded reads + 3D-chunk-friendly access patterns; chunk-shape-aware level/region selection reduces I/O.
- open question: What chunk/shard shapes do bioformats2raw and challenge resave emit by default?

### O-028
- source: S072 lines 1-4
- quote: "AGAVE is a desktop application for viewing multichannel volume data. Several formats are supported, including OME-ZARR 0.4 and 0.5, OME-TIFF and Zeiss .czi files."
- claim: AGAVE desktop viewer supports both 0.4 and 0.5, up to 4 concurrent channels + time slider (S117 lines 26-28); load dialog offers memory estimate (GPU), resolution-level choice (default highest = OOM risk), per-channel exclusion (reload to restore), XYZ subregion, keep-settings-across-loads (S117 lines 97-134); OME-Zarr supports all subset selections (S117 line 101).
- conditions: AGAVE docs v1.10.0-era; desktop GPU volume rendering; TensorStore-backed (build requires tensorstore per S072 lines 23-28)
- implication: Direct product precedent for Slide Scout: resolution picker + memory estimate + channel subset + subregion + sticky display settings solve the large-dataset responsiveness requirement without full eager load.
- open question: How does AGAVE pick/explain default resolution for a given GPU budget?

### O-029
- source: S052 lines 300-300
- quote: "## What's Changed\r\n* Support sharding by @melonora in https://github.com/ome/ome-zarr-py/pull/534"
- claim: ome-zarr-py releases: v0.12.0 shipped v0.5 read+write via #413 (S052 line 558); v0.15.0 fixed downloading 0.5 and deprecated writing v01-v03 (S052 line 343); v0.16.0 added sharding support+docs (S052 line 300); v0.19.x added image-class/scene handling and plain-string codec tolerance for zarr>=3.3 (S052 line 128).
- conditions: release notes capture; versions v0.12.0..v0.19.2
- implication: Interop baseline moved over time: sharding-aware and codec-tolerant readers are newer; older pinned stacks (O-020) predate fixes.
- open question: Which ome-zarr-py version first read sharded 0.5 arrays correctly?

### O-030
- source: S026 lines 257-257
- quote: "## What's Changed\r\n* drop ome-zarr dependency by @will-moore in https://github.com/ome/napari-ome-zarr/pull/123"
- claim: napari-ome-zarr 0.8.0 dropped ome-zarr dep via #123, fixing plate labels and opening all bioformats2raw series images; 0.8.1 replaced dep with zarr; 0.9.0 added v0.6 scenes; 0.10.0 forwarded NGFF axis names+units into napari layer metadata (S026 lines 42,128,214,257).
- conditions: release notes capture; versions 0.8.0..0.10.0
- implication: Series-expansion (open all images, not first only) and axis/unit forwarding are established reader behaviors Slide Scout should mirror; scenes support is newer/out-of-scope signal.
- open question: Did 0.8.x fully resolve the zarr<3 pin conflict from O-020?

### O-031
- source: S023 lines 150-154
- quote: "This command will traverse your local filesystem, looking for zarr images (only .zattrs for now - can add zarr v3 support as a follow-up)"
- claim: ome_zarr finder (PR #436, Apr 2025) browses local collections via CSV + BioFile Finder + local server, but discovery initially handles only .zattrs (Zarr v2), with v3 as follow-up; separate ome_zarr view serves single image/plate in validator.
- conditions: ome-zarr-py PR #436; local filesystem; Apr 2025
- implication: Local-discovery precedent with explicit v2-only gap: Slide Scout's local 0.5 discovery (zarr.json traversal) is the missing piece this PR deferred; BioFile Finder grouping and validator-view are simpler alternatives to custom browsing.
- open question: Was zarr-v3 finder support ever added in-corpus? (Not found.)

### O-032
- source: S031 lines 1-6
- quote: "Web page for validating OME-NGFF files"
- claim: ome-ngff-validator (deployed page) validates OME-Zarr files with custom-schema query param; IDR samples catalog (S010) lists version/thumbnail/S3 key/dims/axes/wells/fields/license/study for representative filesets.
- conditions: validation + samples infra; web-based
- implication: Cheapest validation idea source: open representative local filesets in validator first (cf. S008 line 158), then compare Slide Scout behavior; samples table gives acceptance-set candidates.
- open question: Which cataloged samples have 0.5 equivalents (S010 shows 0.1 rows at lines 24-34)?

### O-033
- source: S051 lines 516-520
- quote: "MUST parse identity, scale, translation transformations;"
- claim: RFC-5 (coordinate systems/transformations, 2024-2025 versions) proposes: MUST parse identity/scale/translation, SHOULD parse mapAxis/affine/rotation, SHOULD warn on unparsable/undisplayable transforms, SHOULD apply to points/images; scene graphs MUST be connected with explicit input/output systems (S051 lines 544-545, 789-794). This is RFC, NOT the frozen 0.5 spec (S003 restricts datasets transforms to scale+translation, O-006).
- conditions: RFC-5 draft scope; future/0.6 direction; non-normative for 0.5
- implication: Product boundary: affine/rotation/scenes are optional capabilities, not 0.5 obligations; but SHOULD-warn-on-unsupported is a good display requirement to adopt for any skipped transform.
- open question: Do any in-corpus 0.5 samples already carry RFC-5-style inputs/outputs?

### O-034
- source: S048 lines 707-716
- quote: "napari \"labels\" layer MUST not have \"channel_axis\""
- claim: napari-ome-zarr reader maps Label/PlateLabels nodes to napari labels layers, popping channel_axis and squeezing that axis per level; labels default visible False with name labels+group path (S048 lines 652-656); Label keeps channel axis in metadata (no per-channel split) unlike image layers (S048 lines 580-584, 204-213).
- conditions: napari-ome-zarr reader code capture; labels scope
- implication: Overlay correctness: label/image channel-axis handling differs; aligned overlay needs axis-aware transform composition (cf. S048 remove_axis_from_transform lines 51-78, add_parent_transform 586-598).
- open question: How should Slide Scout display multi-channel labels (single layer vs per-channel)?

### O-035
- source: S043 lines 51-51
- quote: "The channel labels are read from 'omero' metadata, but the colors are ignored"
- claim: Matrix notes Vol-E and Microscopy Nodes read omero channel labels but ignore colors; WEBKNOSSOS supports omero but rdefs are not supported (S043 lines 70, 78).
- conditions: viewer matrix; omero rendering scope
- implication: omero color/rdefs/defaultT-defaultZ handling is inconsistent across viewers: Slide Scout needs explicit fallback palette + initial T/Z policy when omero is absent or partially honored.
- open question: What contrast/window defaults do viewers use without omero.window?

### O-036
- source: S005 lines 1-1
- quote: "ValueError: Clone exceeded 256 MiB or 120 second cap; partial clone retained, not admitted"
- claim: Several handles are NOT readable evidence: S005 (clone cap), S007 (HTTP 403), S030/S045/S046 (missing/incomplete clone), S042 (HTTP 404), S068 (binary octet-stream unextractable). Search-output handles (S001, S006, S012, S021, S032, S036, S049, S060, S069, S071) explicitly state Search output is a discovery aid, not primary evidence (e.g. S001 line 1).
- conditions: capture-level; all versions
- implication: These sources contribute zero format obligations; an unread/failed source is not evidence of absence. Draft coverage must list them as unvisited/failed, not as negative support.
- open question: None; methodological guardrail.

### O-037
- source: S048 lines 249-258
- quote: "napari treats a None entry as its default (pixel); keeping the spatial units means label and split-image layers stay unit-consistent, so the scale bar still renders (napari warns \"Inconsistent units across layers\" and hides units when one layer lacks them)."
- claim: napari-ome-zarr forwards per-axis units, preserving None for unitless axes (e.g. retained channel on labels) so spatial units stay consistent and scale bar renders; axis_labels only set when all names are non-empty strings (S048 lines 247-258).
- conditions: napari-ome-zarr reader; units/axis_labels forwarding
- implication: Calibrated-coordinate display requirement: propagate axes names+units per layer, tolerate missing units without dropping the whole tuple, and warn/explain inconsistent-unit states.
- open question: Which UDUNITS-2 units (S003 lines 171-172) do real filesets use, and are there non-list units in the wild?

### O-038
- source: S044 lines 139-139
- quote: "ome-zarr-py does not appear to work correctly with auto-sharding."
- claim: Open Aug 2026 issue: ome-zarr-py writer path fails with shards=auto + target_shard_size_bytes while raw zarr succeeds (S044 lines 155-181); writer storage_options chunk/shard/config plumbing is implicated.
- conditions: ome-zarr-py writer; auto-sharding; Aug 2026
- implication: Sharding remains a live compatibility edge: even if Slide Scout is read-only, files written with newer sharding options must still open; reader must not assume writer-tested shard shapes.
- open question: Does the read path handle auto-sharded arrays (issue is writer-scoped)?

### O-039
- source: S018 lines 540-558
- quote: "check whether the Well exists at this row/column"
- claim: ome-zarr-py Plate/Well readers build lazy dask stitched grids (well fields tiled ~square via ceil(sqrt), plate rows x cols), substituting zeros for missing wells/failed tiles (S018 lines 404-467, 537-567); Well uses first field + highest-res for shapes/metadata.
- conditions: ome-zarr-py reader.py capture; HCS scope; dask-lazy
- implication: Simpler alternative to per-well navigation (stitched overview) exists but invents geometry (square packing, zeros for missing) that can mislead; Slide Scout should prefer explicit plate/well/field navigation over silent stitching, or clearly label stitched views as derived.
- open question: What do users expect: stitched plate overview, well grid, or field list?

### O-040
- source: S053 lines 200-217
- quote: "\"type\": \"object\","
- claim: image.schema constrains coordinateTransformations to minItems 1, containing exactly one scale (maxContains 1) with scale array minItems 2 of numbers, plus items oneOf scale{type,scale} or translation{type,translation} (S053 lines 196-266); multiscales requires datasets+axes, minItems 1, uniqueItems; axes 2..5 items with 2..3 space entries (S053 lines 31-74, 126-150).
- conditions: JSON schema v0.5 image.schema; validation scope
- implication: Machine-checkable MUSTs back O-003..O-006: validator/schema can be the oracle for malformed-input feedback (missing scale, wrong vector length, bad axes counts).
- open question: Does the validator enforce dimension_names match (spec MUST, O-003) or only schema-level keys?
- open question: None beyond O-001..O-013 questions; see draft coverage.
