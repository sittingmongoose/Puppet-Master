# Observations (incremental, append-only; qualify via later blocks)

### O-001
- source: S003 lines 68-72
- quote: "OME-Zarr is implemented using the Zarr format as defined by the version 3 of the Zarr specification."
- claim: OME-Zarr 0.5 requires Zarr format version 3; all Zarr features (codecs, chunk grids, chunk key encodings, data types, storage transformers) may be used unless explicitly disallowed.
- conditions: version 0.5; scope: all 0.5 filesets
- implication: Viewer must read Zarr v3 groups/arrays (zarr.json), not v2 .zattrs/.zarray/.zgroup, and must tolerate arbitrary codecs/chunking unless spec disallows.
- open question: Which Zarr v3 codecs/chunk grids appear in real 0.5 filesets and must the viewer decode?

### O-002
- source: S003 lines 150-156
- quote: "The OME-Zarr Metadata is stored in the various zarr.json files throughout the above array hierarchy. In this file, the metadata is stored under the namespaced key ome in attributes."
- claim: 0.5 metadata lives in zarr.json attributes under namespaced key "ome" with string "version" "0.5"; version MUST be consistent within a hierarchy.
- conditions: version 0.5; scope: every zarr.json in hierarchy
- implication: Discovery must parse zarr.json attributes.ome.version and handle mixed-version hierarchies as invalid/uncertain.
- open question: How should viewer report version inconsistency within one fileset?

### O-003
- source: S003 lines 299-303
- quote: "The order of the entries MUST correspond to the order of dimensions of the zarr arrays. In addition, the entries MUST be ordered by type where the time axis must come first (if present), followed by the channel or custom axis (if present) and the axes of type space."
- claim: Axes order is constrained: time first, then channel/custom, then space; length 2-5 and equal to array ndim.
- conditions: version 0.5 multiscales; scope: each multiscale image
- implication: Navigation (channel/time/plane selection) and array-index mapping must follow axes order, not assume fixed 5D tczyx.
- open question: How common are custom/null axis types and 2D/3D/4D images in 0.5 filesets?

### O-004
- source: S003 lines 173-174
- quote: "The dimension_names attribute MUST be included in the zarr.json of the Zarr array of a multiscale level and MUST match the names in the axes metadata."
- claim: Each multiscale level array zarr.json MUST include dimension_names matching axes names (clarified in 0.5.2).
- conditions: version 0.5 (0.5.2 clarification); scope: every multiscale level array
- implication: Viewer can cross-check dimension_names vs axes names to detect malformed levels; must decide behavior on mismatch.
- open question: Do existing 0.5 writers always emit dimension_names?

### O-005
- source: S003 lines 308-312
- quote: "Each dictionary in datasets MUST contain the field coordinateTransformations, which contains a list of transformations that map the data coordinates to the physical coordinates (as specified by axes) for this resolution level."
- claim: Each dataset level MUST have coordinateTransformations with exactly one scale (MUST) and optionally exactly one translation listed after scale; lengths MUST equal len(axes); only scale/translation allowed here.
- conditions: version 0.5 multiscales.datasets
- implication: Calibrated coordinates require combining per-dataset scale/translation with optional top-level multiscales scale/translation; missing/extra transform types are malformed.
- open question: Do real 0.5 filesets use top-level multiscales coordinateTransformations and translations, or scale-only?

### O-006
- source: S003 lines 305-306
- quote: "The paths MUST be ordered from largest (i.e. highest resolution) to smallest."
- claim: datasets path order defines resolution order largest-first; array names are arbitrary though often 0..n.
- conditions: version 0.5
- implication: Pyramid-level choice must use datasets order, not numeric path sorting.
- open question: Do any filesets use non-numeric dataset paths?

### O-007
- source: S003 lines 388-397
- quote: "If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback:"
- claim: multiscales is a list; multiple multiscales per group are allowed and user may choose by name with first as fallback.
- conditions: version 0.5; scope: image groups with >1 multiscale entry
- implication: Plan's "lists images / selects an image" must decide how to present multiple multiscales in one group (e.g. 2D vs 3D variants).
- open question: How frequent are multi-multiscale groups in 0.5 data?

### O-008
- source: S003 lines 426-430
- quote: "The omero metadata is optional, but if present it MUST contain the field channels, which is an array of dictionaries describing the channels of the image."
- claim: omero is optional transitional render metadata; if present, channels array required with per-channel color (6 hex RGB) and window {min,max,start,end}.
- conditions: version 0.5; scope: image groups with omero key
- implication: Channel colors, visibility (active), labels, contrast windows, rdefs defaultT/defaultZ and model color/greyscale are available display defaults when present; viewer needs fallbacks when absent.
- open question: Do 0.5 filesets reliably carry omero channels matching the c-dimension size?

### O-009
- source: S003 lines 437-440
- quote: "The pixels of the label images MUST be integer data types, i.e. one of [uint8, int8, uint16, int16, uint32, int32, uint64, int64]. Intermediate groups between labels and the images within it are allowed, but these MUST NOT contain metadata."
- claim: Label images live under "labels" group (not itself an image), allow intermediate path segments without metadata, must use integer dtype, and SHOULD all be listed in labels-group zarr.json "labels" array.
- conditions: version 0.5 labels
- implication: Label discovery must follow the "labels" list plus tolerate unlisted label images; overlay rendering must handle integer dtypes and label pyramids.
- open question: What fraction of 0.5 labels use intermediate groups or omit listing?

### O-010
- source: S003 lines 454-456
- quote: "The zarr.json file for the label image MUST implement the multiscales specification. Within the multiscales object, the JSON array associated with the datasets key MUST have the same number of entries (scale levels) as the original unlabeled image."
- claim: Each label image is itself a multiscales image with the same number of scale levels as its source image; image-label key SHOULD be present with colors (label-value + optional rgba) and MUST have version string.
- conditions: version 0.5 label images
- implication: Aligned overlay requires matching label pyramid levels to image levels; colors/properties/source.image (default ../../) drive display and linkage.
- open question: Do all 0.5 labels carry image-label colors/version, or must viewer invent colormaps?

### O-011
- source: S003 lines 120-127
- quote: "Three groups MUST be defined above the images: the group above the images defines the well and MUST implement the well specification."
- claim: HCS layout is plate group -> row groups -> well groups -> field-of-view images; plate and well groups MUST implement plate/well specs; empty row/well groups SHOULD NOT be present.
- conditions: version 0.5 HCS
- implication: Image discovery must traverse plate rows/columns/wells and well images (with acquisition ids), including sparse plates; row Group has no metadata of its own in quoted spec.
- open question: Must Slide Scout expose plate/well/acquisition navigation, or flatten fields of view?

### O-012
- source: S003 lines 552-560
- quote: "The plate dictionary MUST contain a wells key whose value MUST be a list of JSON objects defining the wells of the plate."
- claim: Plate requires rows, columns, wells (path=row/col, rowIndex, columnIndex 0-based, all consistent), version string; field_count/name/acquisitions optional with strict types.
- conditions: version 0.5 plate
- implication: Viewer must validate/follow wells list rather than scanning directories; sparse plates list only present wells while rows/columns list full plate extent.
- open question: Do real plates ever disagree between path and rowIndex/columnIndex?

### O-013
- source: S003 lines 744-750
- quote: "The well dictionary MUST contain an images key whose value MUST be a list of JSON objects specifying all fields of views for a given well."
- claim: Well requires images list with path (alphanumeric, case-sensitive, unique) and acquisition integer when the plate has multiple acquisitions; well SHOULD carry version.
- conditions: version 0.5 well
- implication: Field-of-view enumeration must use well images list; acquisition disambiguation needed for multi-acquisition plates.
- open question: How should viewer group/filter fields by acquisition?

### O-014
- source: S003 lines 256-270
- quote: "MUST have the value 3 for the bioformats2raw.layout key in their OME-Zarr Metadata in the zarr.json at the top of the hierarchy;"
- claim: bioformats2raw.layout transitional collection uses value 3 at top level; if plate present, plate takes precedence; image discovery follows plate locations, else OME series list, else consecutively numbered groups 0,1,2...
- conditions: version 0.5 transitional; scope: multi-image filesets converted by bioformats2raw
- implication: Viewer must not default to only first image (readers SHOULD make users aware of >1 image) and must resolve series/plate/numbered-group discovery paths.
- open question: How many 0.5 filesets still use bioformats2raw.layout vs plain multiscales/plate?

### O-015
- source: S003 lines 832-833
- quote: "0.5.0 2024-11-21 use Zarr v3 in OME-Zarr, see RFC-2."
- claim: The 0.4->0.5 break is the move to Zarr v3; 0.5.1 re-added improved omero text; 0.5.2 clarified dimension_names MUST.
- conditions: versions 0.4 vs 0.5.x
- implication: 0.4 filesets (Zarr v2 .zattrs) are out of stated 0.5 scope and need an explicit incompatibility message, not silent misread.
- open question: Should Slide Scout detect and explain 0.4 layouts, or treat any non-0.5 as generic malformed input?

### O-016
- source: S016 lines 368-384
- quote: "Changelog: added FormatV05 (May 2025): writing not supported yet"
- claim: ome-zarr-py reference FormatV05 (0.5, zarr_format 3, chunk key default//) existed by May 2025 but writing was not supported yet.
- conditions: ome-zarr-py at commit 94eaf20; version 0.5
- implication: Early 0.5 readers may be read-path only and stricter/looser than spec; Slide Scout cannot assume writer-side validation exists in the wild.
- open question: What does current ome-zarr-py support for 0.5 read vs write?

### O-017
- source: S016 lines 296-330
- quote: "if sum(t == scale for t in types) != 1: raise ValueError( Must supply 1 scale item in coordinate_transformations )"
- claim: ome-zarr-py validates exactly one scale per level, first transform must be scale, at most one translation, numeric vectors matching ndim, and levels count match.
- conditions: ome-zarr-py FormatV04 validation inherited by FormatV05
- implication: A compatible viewer should apply the same strictness for coordinate math (exactly-one-scale-first) while deciding whether to reject or degrade on violations.
- open question: Does ome-zarr-py validate top-level multiscales coordinateTransformations the same way?

### O-018
- source: S019 lines 87-90
- quote: "For zarr v3, everything is under the ome namespace if ome in self.zgroup: self.zgroup = self.zgroup[ome]"
- claim: ome-zarr-py ZarrLocation unwraps zarr v3 group attrs under "ome" namespace before format detection and root_attrs access.
- conditions: ome-zarr-py io.py at 94eaf20; Zarr v3
- implication: Viewer must implement the same namespacing rule (v3 attrs.ome vs v2 flat attrs) to find multiscales/plate/well/labels/omero keys.
- open question: How do readers handle groups that mix namespaced and legacy flat keys?

### O-019
- source: S018 lines 279-288
- quote: "multiscales = self.lookup(multiscales, []) version = multiscales[0].get( version, 0.1 )"
- claim: ome-zarr-py Multiscales reader uses only multiscales[0] (first entry), reads datasets paths, axes, per-dataset coordinateTransformations, and loads every resolution as dask arrays.
- conditions: ome-zarr-py reader.py at 94eaf20
- implication: Multiple multiscales per group are effectively ignored beyond the first by this reader; Slide Scout must decide whether to match that or expose choice per spec.
- open question: Does any 0.5 tool expose non-first multiscales?

### O-020
- source: S018 lines 404-439
- quote: "image_paths = [image[path] for image in self.well_data.get(images)]"
- claim: ome-zarr-py Well reader builds a lazy almost-square stitched grid of fields (ceil(sqrt(n)) columns), substituting zeros for missing/failed fields, and Plate reader stitches full plate grid with zeros for missing wells.
- conditions: ome-zarr-py reader.py at 94eaf20; HCS wells/plates
- implication: Naive plate/well "single canvas" stitching hides missing data as black tiles and can explode memory/compute; Slide Scout needs per-well/per-field navigation instead of or in addition to stitching.
- open question: What navigation model do real HCS viewers use for 0.5 plates (grid vs list vs separate canvases)?

### O-021
- source: S054 lines 31-44
- quote: "coordinateTransformations: [ { scale: [ 1.0, 0.5002025531914894, 0.3603981534640209, 0.3603981534640209 ], type: scale } ]"
- claim: Real 0.5 IDR image (6001240_labels, czyx) uses per-level physical scale vectors (e.g. z 0.5002 um, y/x 0.3604 um at level 0 doubling in y/x per level) with no translation and no channel unit.
- conditions: OME-Zarr 0.5; axes c,z,y,x; units micrometer on space axes only
- implication: Calibrated display must use per-level scale values directly (not derive from shapes), handle anisotropic/no-channel-unit cases, and show micrometer units.
- open question: Are translations ever present in IDR 0.5 levels?

### O-022
- source: S055 lines 16-58
- quote: "name: sharding_indexed"
- claim: Real 0.5 array uses Zarr v3 sharding_indexed codec (outer chunk 1,10,512,512; inner chunks 1,1,256,256; bytes+blosc/zstd inner, bytes+crc32c index), dtype uint16, dimension_names c,z,y,x.
- conditions: OME-Zarr 0.5 array zarr.json; shape 2,236,275,271
- implication: Viewer decode stack MUST support Zarr v3 sharding plus blosc/zstd/crc32c to open such filesets; chunk shapes differ per level and per array.
- open question: Which other codecs appear in 0.5 arrays in the wild (e.g. gzip, zstd-only, no shard)?

### O-023
- source: S056 lines 68-73
- quote: "wells: [ { columnIndex: 6, path: B/7, rowIndex: 1 }, ..."
- claim: Real 0.5 plate 190129 lists 6 rows x 11 columns extent but only ~50 sparse well paths (e.g. B/7 at rowIndex 1 columnIndex 6), field_count 32.
- conditions: OME-Zarr 0.5 plate; challenge conversion
- implication: Plate navigation must render sparse occupancy (not a dense grid scan) and scale to dozens of wells x up to 32 fields each.
- open question: How large (wells x fields x pyramid) is the largest 0.5 plate Slide Scout must open responsively?

### O-024
- source: S034 lines 43-46
- quote: "all v2 arrays converted to v3, optionally sharding the data - all .zattrs metadata migrated to zarr.json[attributes][ome]"
- claim: 2024 challenge 0.5 data are v2->v3 conversions with optional sharding, metadata moved to zarr.json attributes.ome, plus top-level ro-crate-metadata.json (specimen/modality).
- conditions: challenge conversions; OME-Zarr 0.5 development data
- implication: Viewer will encounter converted filesets with heterogeneous sharding/chunking and extra top-level files to ignore; RO-Crate is discovery metadata, not image data.
- open question: Should Slide Scout surface RO-Crate name/description/organism/modality in the details panel?

### O-025
- source: S034 lines 70-83
- quote: "Shape 1,1,1,93184,144384, Size 21.57 GB, from idr0083."
- claim: Challenge samples include very large images (21.57 GB single image; 66 GB; plates 485 GB-1.0 TB) alongside small ones (589 MB), plus plate samples.
- conditions: 0.5 challenge corpus
- implication: Viewer MUST use lazy/pyramidal reads and background loading; opening highest resolution eagerly will freeze or OOM on TB-scale plates.
- open question: What is the acceptance large-dataset threshold (GB, pixels, chunks)?

### O-026
- source: S048 lines 204-213
- quote: "Images split into one layer per channel via channel_axis, so the channel axis is dropped from the per-axis metadata"
- claim: napari-ome-zarr splits image channels into separate layers (dropping channel axis from scale/translate/units) while labels keep every axis in a single layer.
- conditions: napari-ome-zarr reader; images vs labels
- implication: Channel visibility controls map to per-channel layers; label overlay must preserve channel axis and stay unit-consistent (napari hides units on inconsistency).
- open question: Should Slide Scout follow split-channel layers or composite rendering with visibility toggles?

### O-027
- source: S048 lines 341-365
- quote: "lookup children from series of OME/METADATA.xml ... node_id.replace(Image:, )"
- claim: napari-ome-zarr Bioformats2raw handler (non-plate) enumerates child images by parsing OME/METADATA.ome.xml Image IDs, not the OME group series attribute or numbered-group fallback.
- conditions: napari-ome-zarr; bioformats2raw.layout without plate
- implication: bioformats2raw discovery has at least three competing rules (spec series/numbered groups vs napari XML parse); viewer must choose a robust union and handle missing XML.
- open question: What does napari do when OME/METADATA.ome.xml is missing or Image IDs are non-numeric?

### O-028
- source: S025 lines 81-86
- quote: "Currently, Viv supports int8, int16, int32, uint8, uint16, uint32, float32, float64 arrays, but contributions are welcome to support more np.dtypes!"
- claim: Vizarr/Viv rendering supports a bounded dtype set (int8/16/32, uint8/16/32, float32/64); notably excludes uint64/int64 and float16 among others at capture time.
- conditions: vizarr README capture; Viv renderer
- implication: Slide Scout must define its dtype coverage explicitly and explain unsupported dtypes instead of crashing; label uint64/int64 (spec-legal) may exceed renderer support.
- open question: Which dtypes do real 0.5 images/labels actually use?

### O-029
- source: S043 lines 2-13
- quote: "Vizarr expects the same number of Z-sections for each pyramid resolution"
- claim: Some viewers (vizarr/avivator at capture) fail on pyramids downsampled in Z (different Z sizes per level); others (Vol-E, BDV, MoBIE, neuroglancer, WEBKNOSSOS) handle it.
- conditions: OME-Zarr pyramids with Z downsampling; viewer-dependent
- implication: Slide Scout pyramid selection and plane navigation must handle levels whose z-size differs (not just y/x downsampling); assuming constant z breaks zoom.
- open question: Do 0.5 filesets commonly downsample Z?

### O-030
- source: S043 lines 80-89
- quote: "Can the viewer handle pyramids when the scale factor between levels is not equal to 2?"
- claim: Non-2 downsampling factors break some viewers (vizarr/avivator fail; sample 9846318.zarr/0); Vol-E/BDV/MoBIE/napari/WEBKNOSSOS handle them.
- conditions: multiscales with arbitrary scale ratios
- implication: Viewer must compute per-level scale from coordinateTransformations, never assume factor-2 pyramids.
- open question: What scale factors appear in 0.5 pyramids?

### O-031
- source: S043 lines 214-215
- quote: "Only the lowest resolution of a Plate is shown. Clicking a Well loads it in a new window"
- claim: Vizarr plate strategy shows only lowest-resolution plate overview; well loads separately. Napari plate loads but crashes on zoom (capture note); MoBIE supports plates; most others do not.
- conditions: HCS plates; viewer-dependent
- implication: Plate overview + drill-down per well/field is an established product pattern for TB-scale plates; full-resolution stitched plate canvas is risky.
- open question: Which plate navigation pattern should Slide Scout adopt for local files?

### O-032
- source: S043 lines 277-286
- quote: "Does the viewer open any images beyond the first item in the multiscales list?"
- claim: No surveyed viewer opens beyond multiscales[0] (all supported:no); BDV/MoBIE/WEBKNOSSOS even fail to open the sample (ArrayIndexOutOfBounds, non-unique mags).
- conditions: groups with multiple multiscales entries; sample 4995115.zarr
- implication: Supporting only first multiscale matches current viewer practice but contradicts spec's user-choice rule; multi-multiscale groups are also a crash vector to handle gracefully.
- open question: Are multi-multiscale groups present in 0.5 data?

### O-033
- source: S043 lines 318-329
- quote: "Vizarr doesn't display a scalebar or support scaling info."
- claim: Dataset-level scale support is uneven: Vol-E/napari/BDV/MoBIE/neuroglancer/vtk/WEBKNOSSOS read dataset scale; avivator/vizarr/OMERO/Microscopy Nodes do not.
- conditions: coordinateTransformations scale on datasets
- implication: Calibrated coordinates/scalebar is a differentiator; Slide Scout brief explicitly requires it, so it must read dataset scale where competitors do not.
- open question: What scalebar/coordinate display do scientists expect (per-axis units, pixel size)?

### O-034
- source: S043 lines 362-365
- quote: "3D translation causes image to disappear"
- claim: Dataset-level translation is supported only by napari; vizarr fails badly (image disappears), WEBKNOSSOS fails to open; others ignore it.
- conditions: datasets coordinateTransformations with translation
- implication: Slide Scout must decide: apply translation for alignment (napari-like) vs ignore safely without disappearing; must at least not break rendering when translation present.
- open question: Do 0.5 filesets use translations for label/image alignment?

### O-035
- source: S043 lines 394-411
- quote: "Does the viewer read the scale transformation for each item in multiscales list?"
- claim: Top-level multiscales scale is read only by BDV/MoBIE/neuroglancer/vtk; napari explicitly not (issue #73); avivator/vizarr/Vol-E/WEBKNOSSOS/OMERO ignore it.
- conditions: multiscales-level coordinateTransformations
- implication: Correct calibration requires combining dataset transforms with top-level transforms, but most viewers ignore the latter; Slide Scout must combine both to be correct where others are wrong.
- open question: How often do 0.5 files use top-level scale (e.g. time-axis scale)?

### O-036
- source: S043 lines 473-487
- quote: "Is it possible to open more than 1 OME-NGFF image on the same canvas, to overlay them?"
- claim: Only napari/WEBKNOSSOS/Microscopy Nodes support multi-image overlay on one canvas; vizarr/Vol-E/BDV/MoBIE/neuroglancer/vtk/avivator/OMERO do not.
- conditions: viewer capability, not format obligation
- implication: Label overlay (brief requirement) is narrower than general multi-image overlay; Slide Scout should scope overlay to labels + source image alignment, not arbitrary image fusion.
- open question: Should label overlay reuse image pyramid levels or independent label levels?

### O-037
- source: S033 lines 157-162
- quote: "Supported types depend upon the Zarr/NGFF version being written: | v3/0.5 | yes | yes | yes | no | yes |"
- claim: bioformats2raw for v3/0.5 supports null, blosc, gzip, zstd but NOT zlib; for v2/0.4 supports null, blosc, zlib but NOT gzip/zstd.
- conditions: bioformats2raw converter; NGFF 0.5 / Zarr v3
- implication: Viewer decode matrix for 0.5 must include blosc (cname lz4/zstd/zlib/blosclz/lz4hc, clevel 0-9, shuffle variants), gzip levels 0-9, zstd levels -7..22 + checksum flag, and uncompressed; zlib absence is converter-specific, not a format guarantee.
- open question: Do other 0.5 writers emit zlib or other codecs beyond this table?

### O-038
- source: S033 lines 223-226
- quote: "Specifies the version of the OME-Zarr specification that should be used while writing Zarr. Current supported values are 0.4 and 0.5."
- claim: bioformats2raw supports writing both 0.4 and 0.5 (--ngff-version); default output historically 0.4 with bioformats2raw.layout.
- conditions: bioformats2raw converter versions covered by README capture
- implication: 0.5 filesets in the wild include bioformats2raw conversions with layout value 3, OME/METADATA.ome.xml group, and series structure; viewer must handle that lineage.
- open question: Which bioformats2raw version first wrote 0.5, and does its layout differ?

### O-039
- source: S033 lines 251-256
- quote: "A Java format string that defines how series and resolutions should be described in the output directory hierarchy. The default value is %d/%d"
- claim: bioformats2raw allows customizing series/resolution hierarchy (--scale-format-string, --pyramid-name, --additional-scale-format-string-args), producing non-spec hierarchies incompatible with raw2ometiff.
- conditions: bioformats2raw with non-default formatting options
- implication: Viewer must follow multiscales datasets paths and plate/well/series metadata, never assume fixed %d/%d numeric hierarchy; custom hierarchies may be unreadable and need clear errors.
- open question: How often do real filesets use non-default scale-format-string layouts?

### O-040
- source: S058 lines 309-329
- quote: "For OME-Zarr (v0.5) datasets, the structure is slightly different (See OME-Zarr 0.5 spec)"
- claim: WEBKNOSSOS documents 0.5 folder structure with zarr.json (vs 0.4 .zgroup/.zattrs/.zarray) and otherwise parallel image/labels layout; chunks follow array zarr.json.
- conditions: OME-Zarr 0.5 as consumed by WEBKNOSSOS
- implication: Local reader must branch file discovery on 0.5 (zarr.json) vs 0.4 (.zgroup/.zattrs/.zarray) markers to explain version mismatches.
- open question: Does WEBKNOSSOS read local 0.5 filesets or only streamed/remote ones?

### O-041
- source: S058 lines 385-389
- quote: "Use chunk sizes of 32 - 128 voxels^3 Enable sharding (only available in Zarr 3+) Use 3D downsampling"
- claim: WEBKNOSSOS recommends 32-128^3 chunks, sharding (Zarr 3+ only), 3D downsampling for streaming performance; CLI creates sharded Zarr v3 by default.
- conditions: Zarr v3 performance guidance
- implication: Viewer will encounter sharded v3 arrays as the norm for performance-tuned 0.5 data; unsharded or 2D-chunked data are valid but slower paths.
- open question: What chunk/shard shapes do local 0.5 filesets actually use?

### O-042
- source: S014 lines 139-142
- quote: "Vizarr renders chunks repetitively for image data converted into OME-ZARR v0.5 format, using the resave command of https://github.com/ome/ome2024-ngff-challenge"
- claim: Vizarr (Oct 2025, Firefox 143/Chromium) rendered 0.5 resave-converted 3-channel uint16 bioformats2raw-group-0 image with repetitive chunks, while the 0.4 original rendered correctly.
- conditions: 0.5 conversion via ome2024-ngff-challenge resave; vizarr at issue #307
- implication: 0.5 chunk/shard decoding or chunk-grid interpretation had a real rendering-correctness bug in a major viewer; Slide Scout must validate chunk rendering against known-good views, especially for converted data.
- open question: Was the root cause sharding, chunk-grid, or metadata interpretation?

### O-043
- source: S011 lines 151-157
- quote: "napari-ome-zarr depends on ome-zarr, which is pinned to zarr<3."
- claim: As of Dec 2025 (napari-ome-zarr 0.6.1 + ome-zarr 0.10.3), the napari plugin required zarr<3 (FSStore import failure on zarr 3.1.5), conflicting with bioio-ome-zarr 3.x which requires zarr>=3; PR #123 drops ome-zarr dep for zarr>=3.0.8.
- conditions: napari-ome-zarr 0.6.1; ome-zarr-py 0.10.3; zarr 3.1.5; Windows
- implication: 0.5 local reading in Python was in dependency transition; Slide Scout's Zarr library choice must support v3 + sharding + 0.5 metadata without such conflicts.
- open question: Did napari-ome-zarr 0.7+/0.8 resolve zarr v3 support stably?

### O-044
- source: S011 lines 158-159
- quote: "The default napari reader (without napari-ome-zarr plugin) does not correctly read OME-Zarr coordinate transformations/scale metadata, resulting in incorrect anisotropic volume rendering."
- claim: Without the plugin, napari ignores coordinateTransformations scale, producing incorrect anisotropic rendering.
- conditions: napari default reader vs napari-ome-zarr plugin
- implication: Correctness requires explicit scale application; silently ignoring transforms is a known failure mode producing wrong aspect ratios.
- open question: Which scale combinations (dataset + top-level) does the fixed reader apply?

### O-045
- source: S023 lines 150-154
- quote: "This command will traverse your local filesystem, looking for zarr images (only .zattrs for now - can add zarr v3 support as a follow-up) and collect them into a CSV."
- claim: ome-zarr-py PR436 added `ome_zarr finder path/` which traverses local filesystem for zarr images, writes a CSV (File Path, File Name, Folders) served on localhost, and opens it in BioFile Finder with Group By Folders tree, thumbnails, copy-URL; at merge it found only .zattrs (v2), v3 support deferred.
- conditions: ome-zarr-py ~0.11 (Apr 2025); local filesystem; Zarr v2 only at capture
- implication: Established simpler alternative for Slide Scout discovery: directory traversal + served-file browsing instead of deep metadata indexing; 0.5 needs the zarr.json equivalent traversal.
- open question: Does current ome-zarr-py finder support zarr.json traversal?

### O-046
- source: S013 lines 150-157
- quote: "This PR adds support for writing OME-Zarr v0.5, which becomes the default CurrentFormat()."
- claim: From PR413 (merged Aug 2025, released v0.12.0), ome-zarr-py writes 0.5 by default; write_image fmt defaults to None so the group store (v2 vs v3) picks v0.4 vs v0.5; mixing v04 group with v05 fmt (or vice versa) throws an Exception.
- conditions: ome-zarr-py >=0.12; write path
- implication: Reader must never assume writer version from content alone without checking store type; mixed-format filesets are explicitly invalid and deserve a clear version-mismatch error.
- open question: What exact exception/message does a mixed-format open produce on the read path?

### O-047
- source: S013 lines 186-186
- quote: "ValueError: compressor cannot be used for arrays with zarr_format 3. Use bytes-to-bytes codecs instead."
- claim: Writing dask arrays to zarr_format 3 with a legacy `compressor` option fails; v3 requires bytes-to-bytes codecs (blosc/gzip/zstd array codecs, not the v2 compressor kwarg).
- conditions: zarr-python v3 + dask da.to_zarr path; OME-Zarr 0.5 writes
- implication: Slide Scout's Zarr library must use the v3 codec pipeline (array codecs + sharding codecs); v2-style compressor settings are a known failure mode.
- open question: Does the read path need to handle both `compressor` and `codecs` spellings in array metadata?

### O-048
- source: S038 lines 58-58
- quote: "If I enter the OME-Zarr URL: https://uk1s3.embassy.ebi.ac.uk/idr/share/ome2024-ngff-challenge/0.0.5/6001240.zarr/ I get: Neithre array nor OME multiscale metadata found"
- claim: Neuroglancer (issue #651) could not open a challenge 0.5 fileset (no multiscale metadata found); a vanilla v3 array URL exposed dimensions but loaded no chunks; the image had a single shard with no failed requests.
- conditions: 0.5 challenge data 0.0.5; neuroglancer at capture; sharded v3 array
- implication: 0.5 support requires both namespaced metadata discovery AND sharded-chunk decoding; silent no-chunks behavior is a known bad failure mode to avoid (must explain instead).
- open question: Did neuroglancer later add 0.5/shard support?

### O-049
- source: S027 lines 150-160
- quote: "Investigating a lighter-weight alternative to ome-zarr-py. Uses zarrv3."
- claim: napari-ome-zarr PR123 (merged, 33 commits) dropped the ome-zarr dependency for direct zarr v3, handling bioformats2raw, channels metadata, labels, plates and plates-with-labels; tested against v0.5 images (6001240_labels.zarr, ExpD_chicken_embryo_MIP.ome.zarr), v0.5 plate 190129.zarr, v0.5 9-image bioformats2raw grid BR00109990_C2.zarr; TODO at capture: labels colors, coordinateTransformations, pre-v0.4.
- conditions: napari-ome-zarr post-#123 (2025); zarr>=3.0.8
- implication: Direct-zarr-v3 reading without ome-zarr-py is a proven architecture for a desktop viewer; Slide Scout can follow the same dispatch (Multiscales/Plate/Bioformats2raw/Labels/Scene).
- open question: Which PR123 TODOs remain in the released 0.7/0.8 versions?

### O-050
- source: S027 lines 269-270
- quote: "You can get the list of labels paths from Image.attributes.labels. But the labels part of the spec just says these point to labels objects, which I don't think are more specifically defined anywhere else?"
- claim: There is a real traversal ambiguity: models expose labels paths but the spec text does not prescriptively define what a labels object must be (group with image-label metadata?); in practice a dataset with a labels group but missing top-level labels metadata yields .labels None, so readers that rely only on the listing miss existing labels.
- conditions: labels discovery; ome-zarr-models-py discussion Dec 2024; 0.5 labels section noted much improved over 0.4
- implication: Slide Scout must union the labels listing with directory probing (labels/* groups implementing multiscales+image-label), and tolerate missing listings Listings in either direction.
- open question: Does 0.5 fully resolve what a labels object must contain?

### O-051
- source: S072 lines 1-3
- quote: "AGAVE is a desktop application for viewing multichannel volume data. Several formats are supported, including OME-ZARR 0.4 and 0.5, OME-TIFF and Zeiss .czi files."
- claim: AGAVE desktop (GPU volume explorer, Qt + tensorstore v0.1.78 backend per S096 lines 8-10) reads local OME-Zarr 0.4 and 0.5; its VolumeDimensions dtype switch handles int32/uint16/uint8/float32 (S096 lines 25-28).
- conditions: AGAVE at commit 9e7b47f; desktop local reading
- implication: Tensorstore-backed local 0.5 reading with a bounded dtype set is a working precedent closest to Slide Scout's product shape; dtype coverage must be declared explicitly.
- open question: How does AGAVE render dtypes outside its four handled cases?

### O-052
- source: S117 lines 108-109
- quote: "The OME-Zarr format supports precomputed multiresolution data and will let you select the resolution level. The highest resolution is the default, so beware if you have a large dataset, you risk running out of memory."
- claim: AGAVE load model: resolution level selectable (highest default, OOM risk), channels excludable (reload to recover), X/Y/Z sub-region selectable, GPU-memory estimate shown, appearance settings optionally kept across loads; presents up to 4 channels concurrently + time slider; older docs add 16-bit-unsigned-only, first-time-sample-only, few-GB GPU limits (S108 lines 4-17).
- conditions: AGAVE OME-Zarr loading; GPU-memory-bound rendering
- implication: Proven responsiveness pattern for large data: explicit level/channel/sub-region choice BEFORE full load + memory estimate; Slide Scout's automatic level choice + background reads is a different valid pattern but must still bound memory.
- open question: Which pattern do Slide Scout acceptance datasets require (auto vs explicit choice)?

### O-053
- source: S098 lines 204-219
- quote: "nlohmann::json multiscales; if (m_zarrVersion == 3) { ... multiscales = ome[multiscales]; } else { multiscales = attrs[multiscales]; }"
- claim: AGAVE FileReaderZarr branches on zarr version: v3 reads multiscales from zarr.json attributes.ome (erroring No attributes.ome found if absent), v2 from flat attrs; driver name zarr3 vs zarr; scenes = multiscales.size(); dimorder assumed T,C,Z,Y,X.
- conditions: AGAVE PR #220 diff; Zarr v2 vs v3
- implication: Version branching on store metadata location is required in every reader; AGAVE's fixed T,C,Z,Y,X dimorder assumption is a correctness risk for 2D/3D/4D or custom-axis 0.5 data.
- open question: Does AGAVE validate axes names/order against dimorder or assume it?

### O-054
- source: S052 lines 558-558
- quote: "Ome zarr v0.5 reading and writing by @will-moore in https://github.com/ome/ome-zarr-py/pull/413"
- claim: Release timeline: v0.12.0 = 0.5 reading+writing (PR413); v0.15 deprecates writing v01-v03 + fixes downloading 0.5; v0.16 adds sharding support + docs; v0.19 is permissive with 0.5 for spatial-data + scene support + plain-string codec attrs for zarr>=3.3.
- conditions: ome-zarr-py releases v0.12-v0.19
- implication: 0.5 reader behavior moved over 2025-2026 (strictness, sharding, scenes, codec spellings); Slide Scout must target the current behavior, not the May-2025 FormatV05 snapshot in S016.
- open question: What does be more permissive with version 0.5 (PR594) accept that strict 0.5 rejects?

### O-055
- source: S033 lines 333-337
- quote: "Version 0.3.0 and later uses the TCZYX order by default, for compatibility with https://ngff.openmicroscopy.org/0.4/#image-layout. The --dimension-order option is considered deprecated and may be removed in a future release, as it results in invalid OME-NGFF data."
- claim: bioformats2raw writes TCZYX dimension order by default (0.4 image layout compat); non-default --dimension-order produces invalid OME-NGFF and is deprecated.
- conditions: bioformats2raw >=0.3; converter output
- implication: Real filesets should be TCZYX-ordered (time, channel, space), matching spec axis ordering; viewers may still defensively follow axes metadata rather than assuming fixed order.
- open question: Do any 0.5 filesets in the wild violate TCZYX/axes-order rules?

### O-056
- source: S033 lines 107-109
- quote: "By default, the resolutions will be set so that the smallest resolution is no greater than 256x256. A scaling factor of 2 is used between consecutive resolutions."
- claim: bioformats2raw defaults: smallest level <=256x256 (--target-min-size), factor-2 steps, or explicit --resolutions N; tile size via --tile-width/--tile-height; --no-ome-meta-export drops OME dir; --no-root-group drops top-level group marker.
- conditions: bioformats2raw conversion defaults; options override
- implication: Real pyramids usually (not always) bottom out near 256px with factor-2 steps, but any of levels/factors/tiles/OME-group/root-marker can differ; viewer must read actual datasets/chunks, not defaults.
- open question: What pyramid shapes do non-bioformats2raw 0.5 writers produce?

### O-057
- source: S061 lines 39-39
- quote: "This currently 'works' for https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0073A/9798462.zarr but is too slow to be very usable."
- claim: QuPath remote OME-Zarr support (PR #1638, v0.6.0 milestone) first worked only for a v0.4 URL and was too slow to be usable.
- conditions: QuPath remote reads; v0.4 sample; pathology use case (out of Slide Scout scope for interpretation, relevant for reading)
- implication: Chunk-count and request-count dominate viewer performance; even correct readers fail without caching/prefetching/pyramid discipline. Local reads avoid network latency but not chunk-count costs.
- open question: Is QuPath slowness from per-chunk requests, missing pyramid use, or decompression?

### O-058
- source: S062 lines 11-15
- quote: "Volume data is provided to the core 3d viewer via one of the following file formats: - a url to a OME-ZARR image"
- claim: Vol-E is a browser volume viewer (React/WebGL/Three.js) that loads an OME-ZARR image by URL (or OME-TIFF, or prebuilt texture-atlas JSON+PNG); older AGAVE docs describe transfer-function channel controls, ROI clipping, saved-settings JSON with absolute path (S108 lines 13-30).
- conditions: Vol-E web app; AGAVE desktop docs at capture
- implication: URL/ID-based opening plus channel transfer functions and ROI clipping are established viewer features Slide Scout may borrow; absolute-path settings files are a portability trap to avoid.
- open question: Does Vol-E support 0.5/zarr v3 URLs or only v2?

### O-059
- source: S031 lines 4-6
- quote: "Deployed at https://ome.github.io/ome-ngff-validator See https://idr.github.io/ome-ngff-samples/ for samples to try."
- claim: ome-ngff-validator is a web page for validating OME-NGFF files (?source= URL pattern, custom ?schemas= branch override); challenge/reader PRs routinely link validator URLs as acceptance evidence for specific filesets.
- conditions: validation tooling; applies to 0.4 and 0.5 samples
- implication: Cheapest validation oracle for Slide Scout acceptance: every representative fileset should first open cleanly in the validator; validator failures predict viewer failures.
- open question: Does the validator cover 0.5 sharding/codec correctness or only metadata?

### O-060
- source: S004 lines 149-157
- quote: "This PR proposes to adopt the version 3 of the Zarr format for OME-Zarr. Main changes: Only Zarr v3 is allowed for upcoming versions of OME-Zarr."
- claim: ngff PR206 (draft from Jul 2023) proposed: only Zarr v3; metadata in zarr.json attributes object; chunk_key_encoding respected (no mandated / separator); ome namespace; version fields moved from multiscale/plate/well into ome object; labels registration moved from labels group into multiscale group; document renamed OME-Zarr specification.
- conditions: proposal state Jul 2023; precursor to released 0.5
- implication: Most proposal items match released 0.5 (O-001, O-002), but the labels-registration-move claim contradicts released spec text (labels list still in labels-group zarr.json per S003 lines 441-450); treat PR206 as intent, S003 as authority.
- open question: Was the labels-registration move adopted, reverted, or superseded before 0.5.0?

### O-061
- source: S008 lines 149-150
- quote: "This updates ome-zarr-py to use zarr-python v3 but doesn't include support for writing Zarr v3 (OME-Zarr v0.5). However, it does add support for reading OME-Zarr v0.5 (e.g. for use by napari-ome-zarr)."
- claim: ome-zarr-py PR404 (Nov 2024) moved to zarr-python v3 with 0.5 READ support only (for napari-ome-zarr); 0.5 writing came later in PR413.
- conditions: ome-zarr-py late 2024; read-before-write rollout
- implication: Early-0.5-era readers were validated against a small set of challenge conversions; read-path edge cases (codecs, sharding, translations, multi-multiscales) may be under-tested even in reference code.
- open question: Which 0.5 filesets validated PR404 reads?

### O-062
- source: S048 lines 707-716
- quote: "napari labels layer MUST not have channel_axis ... for level in range(len(node_data)): darray = node_data[level] if darray.ndim > ch_axis: node_data[level] = da.squeeze(darray, axis=ch_axis)"
- claim: napari-ome-zarr plate/image labels: Plate.children derives PlateLabels per labels_path from first well/first field; PlateLabels metadata keeps only scale/axis_labels/units; Label layers start invisible; any channel_axis is popped and the dask data squeezed per level.
- conditions: napari-ome-zarr reader; image and plate labels
- implication: Label overlay display rules: single-layer labels, channel axis removed, hidden by default, colors from image-label colors; Slide Scout overlay defaults should match (hidden-by-default + explicit toggle).
- open question: What happens to multi-channel label data after squeeze (which channel survives)?

### O-063
- source: S048 lines 672-680
- quote: "if Labels.matches(root_group): # Try starting at parent Image parent_path = root_group.store.root.parent"
- claim: napari-ome-zarr read_ome_zarr handles arbitrary entry points: Labels/Label roots walk up to parent image (1-2 dirs); Bioformats2raw/Multiscales/Plate/Scene dispatch by attrs; no match prints No matching spec and returns nothing.
- conditions: napari-ome-zarr reader entry
- implication: Slide Scout local opener must accept drops/clicks on any subpath (image, labels subgroup, well, plate) and resolve to the right root; silent empty results are a known weak behavior to improve with explicit errors.
- open question: Does the walk-up logic work for zarr v3 stores where store.root differs?

### O-064
- source: S048 lines 119-122
- quote: "trans_aff = single_transform_to_affine(transf) if trans_aff is None: warnings.warn(fUnsupported transform type: {transf[type]}) continue"
- claim: napari-ome-zarr supports scale/translation/rotation/affine/sequence transforms (beyond the 0.5 datasets restriction to scale+translation), composing them into one Affine; unknown types warn and skip; Scene graphs traverse coordinateSystems across images.
- conditions: napari-ome-zarr transforms; v0.6/scene-era forward compat
- implication: 0.5 datasets legally contain only scale/translation, but a robust viewer must tolerate and either apply or safely skip richer transforms (rotation/affine/sequence) without crashing.
- open question: Do any 0.5 filesets contain rotation/affine/sequence transforms?

### O-065
- source: S002 lines 0-0
- quote: "original_bytes: 0, view_lines: 0"
- claim: Several catalog entries carry no usable evidence: S002 empty (0 bytes, ngff latest/tools pages); S005 clone cap; S007 403; S030 FileNotFound; S042 404; S045 git pack FileNotFound; S046 incomplete clone; S068 binary octet-stream unextractable; S077 422; S095 git metadata not source; plus search-output stubs (S001, S006, S012, S021, S032, S036, S049, S060, S069, S071) which are discovery aids by their own header, not primary evidence.
- conditions: corpus capture gaps; applies wherever these handles would be cited
- implication: Questions answerable only from these handles (live spec latest/tools pages, IDR .zattrs binary, failed clones) stay unresolved; an unread/empty source is not evidence of absence.
- open question: None; records absence of evidence, not evidence of absence.

### O-066
- source: S053 lines 196-217
- quote: "coordinateTransformations: type array, minItems 1, contains { type scale }, maxContains 1"
- claim: 0.5 image.schema tightens transforms: coordinateTransformations array minItems 1 containing exactly one scale (maxContains 1), items oneOf scale|translation with numeric vectors minItems 2; axes 2-5 items with 2-3 space (minContains 2, maxContains 3), typed channel/time/space or custom; multiscales minItems 1 uniqueItems; datasets minItems 1 with required path+coordinateTransformations; ome requires multiscales+version.
- conditions: JSON schema https://ngff.openmicroscopy.org/0.5/schemas/image.schema (normative validation artifact)
- implication: Schema validation gives exact acceptance gates (counts, uniqueness, required keys, numeric vectors); viewer error messages should cite the violated schema rule.
- open question: Does the validator enforce this schema plus the prose MUSTs (ordering, dimension_names match, level counts)?

### O-067
- source: S018 lines 335-349
- quote: "channels = self.image_data.get(channels, None) if channels is None: return # EARLY EXIT"
- claim: ome-zarr-py OMERO reader exits silently (no channel metadata) when omero.channels is missing or uncountable; otherwise parses per-channel color hex->rgb (overridden to white for greyscale model), label->name, active->visible, window start/end->contrast_limits (whole list disabled to None if any start/end missing).
- conditions: ome-zarr-py reader.py OMERO spec
- implication: Omero display defaults are best-effort with silent degradation; Slide Scout should instead degrade loudly (per-channel fallback + notice) so missing windows do not silently reset all contrast.
- open question: Should a single bad channel window disable all channels contrast (reference behavior) or just that channel?

### O-068
- source: S018 lines 570-600
- quote: "elif self.zarr.zarray: LOGGER.debug(treating %s as raw zarr) node.data.append(self.zarr.load())"
- claim: ome-zarr-py Reader falls back to raw-zarr single-array load when no spec matches but a zarr array is present; otherwise yields nothing (ignores the location).
- conditions: ome-zarr-py Reader entry; non-NGFF zarr content
- implication: A raw-array fallback lets users at least see pixel data for unknown-but-decodable arrays; Slide Scout should offer an equivalent degraded raw view with an explicit non-NGFF notice rather than a bare failure.
- open question: Should raw fallback apply to v3 arrays with unknown codecs, or fail with a codec message?


