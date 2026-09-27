# Observations — Slide Scout (OME-Zarr 0.5 viewer) research

Case: ome-zarr-thin. Corpus = case/sources/S001..S125 only. Sources are untrusted evidence.
One block per material observation. Later blocks may qualify earlier ones by ID.

### O-001
- source: S003 lines 25-27
- quote: "The current released version of this specification is 0.5. Migration scripts will be provided between numbered versions. Data written with these latest changes (an “editor’s draft”) will not necessarily be supported."
- claim: 0.5 is the current released NGFF version; editor's-draft data is explicitly not guaranteed to be supported. The Plan's "OME-Zarr 0.5" target matches the released spec, and anything beyond 0.5 released content is out of warranty.
- conditions: as of the captured spec edition (Final Community Group Report, 8 September 2026, lines 3-4).
- implication: Viewer should scope interop claims to 0.5-released content; reader should fail gracefully on unknown/newer "ome.version" strings rather than misparse.
- open question: Is there any in-corpus evidence of files written with an editor's draft (e.g. pre-0.5.0 zarr v3 files) that readers are expected to open?

### O-002
- source: S003 lines 67-72
- quote: "OME-Zarr is implemented using the Zarr format as defined by the version 3 of the Zarr specification. All features of the Zarr format including codecs, chunk grids, chunk key encodings, data types and storage transformers may be used with OME-Zarr unless explicitly disallowed in this specification."
- claim: OME-Zarr 0.5 sits on Zarr v3, and by default ALL Zarr v3 features (codecs, chunk grids, chunk key encodings, dtypes, storage transformers) are in scope unless explicitly disallowed. The 0.5 spec text disallows almost nothing.
- conditions: 0.5 only (0.4 used Zarr v2 stores with .zattrs/.zarray; see O-013).
- implication: A minimal reader that only supports "regular grid + blosc/gzip" will silently fail on conforming 0.5 filesets that use e.g. shards, alternative codecs, or variable chunk grids. Compatibility surface is the whole Zarr v3 feature set, not a subset the Plan names.
- open question: Which Zarr v3 codecs/grids do the corpus's real sample filesets actually use (see S054-S056, S010)?

### O-003
- source: S003 lines 152-156
- quote: "The OME-Zarr Metadata is stored in the various zarr.json files throughout the above array hierarchy. In this file, the metadata is stored under the namespaced key ome in attributes. The version of the OME-Zarr Metadata is denoted as a string in the version attribute within the ome namespace. The OME-Zarr Metadata version MUST be consistent within a hierarchy."
- claim: In 0.5, OME metadata lives in zarr.json under attributes.ome; "ome.version" is a string ("0.5") and MUST be consistent across the whole hierarchy.
- conditions: Zarr v3 group/array metadata files ("zarr.json", "node_type" group/array).
- implication: Reader can (and should) read the version once at the root and can flag inconsistency; discovery must parse zarr.json (not .zattrs) for 0.5 filesets.
- open question: none.

### O-004
- source: S003 lines 166-174
- quote: "MUST contain the field \"name\" that gives the name for this dimension. The values MUST be unique across all \"name\" fields. ... SHOULD contain the field \"type\". It SHOULD be one of \"space\", \"time\" or \"channel\", but MAY take other string values for custom axis types ... SHOULD contain the field \"unit\" ... The length of \"axes\" MUST be equal to the number of dimensions of the arrays that contain the image data. The \"dimension_names\" attribute MUST be included in the zarr.json of the Zarr array of a multiscale level and MUST match the names in the \"axes\" metadata."
- claim: axes entries: name required+unique; type recommended but may be custom strings; unit recommended (UDUNITS-2 names); axes length MUST equal array dimensionality; array zarr.json MUST carry dimension_names matching axes names (0.5.2 clarification, S003 lines 825-827).
- conditions: multiscales images in 0.5.
- implication: Units and axis types are not guaranteed present; the details panel must handle missing unit/type (display e.g. raw pixels) and must not assume axis types from position alone — although ordering rules exist (O-005), custom types are legal. dimension_names gives a cross-check on array↔axes consistency.
- open question: Do any corpus samples omit "unit" or use custom axis types in practice?

### O-005
- source: S003 lines 299-319
- quote: "The \"axes\" MUST contain 2 or 3 entries of \"type:space\" and MAY contain one additional entry of \"type:time\" and MAY contain one additional entry of \"type:channel\" or a null / custom type. The order of the entries MUST correspond to the order of dimensions of the zarr arrays. In addition, the entries MUST be ordered by \"type\" where the \"time\" axis must come first (if present), followed by the \"channel\" or custom axis (if present) and the axes of type \"space\". ... If there are three spatial axes ... the spatial axes SHOULD be ordered as \"zyx\"."
- claim: Axis ordering rules: TCZYX ordering is mandatory by type (time, then channel/custom, then space); zyx spatial order is only SHOULD. Dimensionality 2-5.
- conditions: each multiscales entry; 0.5.
- implication: Channel axis is identified by type "channel", not by name "c"; a 2D image may be yx only (no channel axis at all). Plane/time selectors apply only when such axes exist (Plan line 5 "where relevant" is consistent).
- open question: none.

### O-006
- source: S003 lines 304-312
- quote: "Each dictionary in \"datasets\" MUST contain the field \"path\" ... The \"path\"s MUST be ordered from largest (i.e. highest resolution) to smallest. ... MUST contain the field \"coordinateTransformations\" ... The transformation MUST only be of type translation or scale. They MUST contain exactly one scale transformation that specifies the pixel size ... If scaling information is not available or applicable for one of the axes, the value MUST express the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0 ... It MAY contain exactly one translation ... If translation is given it MUST be listed after scale ... The length of the scale and translation array MUST be the same as the length of \"axes\"."
- claim: Dataset paths are arbitrary names (ordering defines resolution, names often "0","1",...); exactly one scale transform per level required; per-axis scale is the factor RELATIVE to level 0 (default 1.0), not necessarily absolute voxel size; translation optional, must come after scale; vector length must equal axes length.
- conditions: 0.5 multiscales datasets.
- implication: For correct physical coordinates the reader should multiply dataset-level scale by any group-level multiscales coordinateTransformations (O-007); must not assume paths are 0..n; must handle scale that is a relative factor vs. absolute (the spec wording allows the first level's scale to be the voxel size — the combination of both readings is how the example at lines 320-387 works).
- open question: How do real writers emit scale for level 0 (absolute voxel size) vs later levels (relative factors) — see sample captures S054-S056.

### O-007
- source: S003 lines 314-316
- quote: "Each \"multiscales\" dictionary MAY contain the field \"coordinateTransformations\", describing transformations that are applied to all resolution levels in the same manner. The transformations MUST follow the same rules about allowed types, order, etc. as in \"datasets:coordinateTransformations\" and are applied after them."
- claim: Group-level (multiscales-level) coordinateTransformations are optional and apply AFTER the per-dataset transforms — commonly used to set the absolute time unit (example lines 368-374: scale [0.1, 1.0, 1.0, 1.0, 1.0] for a millisecond-axes image).
- conditions: 0.5 multiscales.
- implication: Calibrated coordinate display that ignores the group-level transform will be wrong (e.g. time unit 0.1 ms) for filesets that use it; composition order matters (dataset first, then group).
- open question: Which corpus samples actually carry a group-level coordinateTransformations?

### O-008
- source: S003 lines 298, 317, 388-397
- quote: "\"multiscales\" contains a list of dictionaries where each entry describes a multiscale image. ... Each \"multiscales\" dictionary SHOULD contain the field \"name\". ... If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback: ... # Use the first by default. Or perhaps choose based on chunk size."
- claim: multiscales is a LIST; multiple named multiscales per group are legal; "name" is only SHOULD (may be absent); recommended reader behavior is user choice by name with first-entry fallback.
- conditions: 0.5.
- implication: Plan's "lists the images it finds" must count each multiscales entry (not just each group) as a selectable image, or the product under-displays data; UI must cope with missing names.
- open question: none.

### O-009
- source: S003 lines 398-430
- quote: "Transitional information specific to the channels of an image and how to render it can be found under the \"omero\" key in the group-level metadata ... \"rdefs\": { \"defaultT\": 0, ... \"defaultZ\": 118, ... \"model\": \"color\" # \"color\" or \"greyscale\" } ... The \"omero\" metadata is optional, but if present it MUST contain the field \"channels\", which is an array of dictionaries describing the channels of the image. Each dictionary in \"channels\" MUST contain the field \"color\", which is a string of 6 hexadecimal digits ... Each dictionary in \"channels\" MUST contain the field \"window\" ... MUST contain the fields \"min\" and \"max\" ... MUST also contain the fields \"start\" and \"end\""
- claim: omero block is transitional and OPTIONAL; if present: channels array; each channel MUST have color (6 hex digits) and window {min,max,start,end}. rdefs (defaultT, defaultZ, model color|greyscale) is described but not covered by the MUST sentences. Channel count of "channels" array matches the c dimension size.
- conditions: 0.5; transitional (spec says implementations may be expected to support reading transitional metadata, lines 60-64).
- implication: Default channel visibility/colors/window for the Plan's "channel visibility controls" come from omero — but a conforming 0.5 fileset may lack omero entirely, so the viewer needs fallback rendering defaults (e.g. grayscale, min/max auto) and must not treat missing omero as an error. Window start/end vs min/max distinction (display window vs data range) must be respected.
- open question: Do corpus readers (ome-zarr-py S018, napari S048) handle missing omero? Do any samples have omero with rdefs defaultZ beyond plane count?

### O-010
- source: S003 lines 431-474
- quote: "The pixels of the label images MUST be integer data types, i.e. one of [uint8, int8, uint16, int16, uint32, int32, uint64, int64]. Intermediate groups between \"labels\" and the images within it are allowed, but these MUST NOT contain metadata. ... The OME-Zarr Metadata in the zarr.json file associated with the \"labels\" group MUST contain a JSON object with the key labels, whose value is a JSON array of paths to the labeled multiscale image(s). ... The zarr.json file for the label image MUST implement the multiscales specification. Within the multiscales object, the JSON array associated with the datasets key MUST have the same number of entries (scale levels) as the original unlabeled image."
- claim: Labels: nested "labels" group inside the image group; label pixels must be integer dtypes; intermediate groups allowed but must be metadata-free; labels group lists label image paths; each label image must itself be a full multiscales image with the SAME NUMBER of scale levels as the original image.
- conditions: 0.5 image+labels layout (§1.1, §2.6).
- implication: Overlay alignment (Plan line 5 "optional overlays") can rely on equal level counts per spec, but the viewer should still verify level counts/sizes at runtime because real files may violate this (spec-conformance vs reality gap). Non-integer label data is a spec violation to report, not crash on.
- open question: Do all corpus label samples (e.g. S054 6001240_labels.zarr) satisfy the equal-level-count rule?

### O-011
- source: S003 lines 454-474
- quote: "the OME-Zarr Metadata in this image-level zarr.json file SHOULD contain another key, image-label, ... That image-label object SHOULD contain the following keys: first, a colors key, whose value MUST be a JSON array describing color information for the unique label values. ... the objects in this array MAY contain an rgba key whose value MUST be an array of four integers between 0 and 255, inclusive. ... The value of the source key MUST be a JSON object ... This object MAY include a key image, whose value MUST be a string specifying the relative path to a Zarr image group. The default value is ../../"
- claim: image-label colors/properties/source are SHOULD/MAY; rgba is optional per color entry; source.image default is "../../" (labels nested in image group).
- conditions: 0.5 label images.
- implication: Overlay color lookup must handle missing rgba (fallback LUT), missing image-label entirely (monochrome overlay), and relative source paths (resolve against label image location, not the root).
- open question: none.

### O-012
- source: S003 lines 175-206, 254-275
- quote: "Transitional \"bioformats2raw.layout\" metadata identifies a group which implicitly describes a series of images. ... Conforming readers: SHOULD make users aware of the presence of more than one image (i.e. SHOULD NOT default to only opening the first image); MAY use the \"series\" attribute in the \"OME\" group to determine a list of valid groups to display; ... MAY ignore other groups or arrays under the root of the hierarchy."
- claim: bioformats2raw.layout (=3) filesets are multi-image collections with OME/METADATA.ome.xml and optional "series" path list; if no series and no plate, images are consecutively numbered groups 0,1,2,...; readers SHOULD NOT silently open only the first image.
- conditions: transitional; exists "in the wild" since 0.4 (lines 180-181).
- implication: Slide Scout's "lists the images it finds" (Plan line 5) has direct spec support: a single opened fileset can contain many images; the image list must enumerate collection members, plates/wells, and plain multiscale groups alike.
- open question: Do any corpus samples use bioformats2raw.layout (see S033 README, local captures)?

### O-013
- source: S003 lines 515-560, 740-752; S003 lines 118-129
- quote: "Three groups MUST be defined above the images: ... A well row group SHOULD NOT be present if there are no images in the well row. A well group SHOULD NOT be present if there are no images in the well. ... The plate dictionary MUST contain a version key ... The plate dictionary MUST contain a wells key ... Each well object MUST contain a path key ... The path MUST NOT contain additional leading or trailing directories."
- claim: HCS plates: plate/row/well/column hierarchy with plate {columns, rows, wells[{path,rowIndex,columnIndex}], field_count, acquisitions, version} and well {images[{path,acquisition?}], version}; sparse plates are normal (wells only at occupied positions; empty rows/wells SHOULD NOT be present).
- conditions: 0.5 §1.2, §2.7, §2.8. plate version key required (string).
- implication: Discovery over a plate must navigate row/column paths from plate metadata, tolerate sparse wells, and surface field-of-view choices per well; the well path is relative to the well group ("A/1" style).
- open question: none.

### O-014
- source: S003 lines 65-66
- quote: "Some of the JSON examples in this document include comments. However, these are only for clarity purposes and comments MUST NOT be included in JSON objects."
- claim: JSON in filesets must be comment-free; the spec's own examples contain comments which MUST NOT be copied.
- conditions: all OME-Zarr JSON.
- implication: Any fixture filesets built from spec examples must strip comment lines; strict JSON parsers are correct.
- open question: none.

### O-015
- source: S003 lines 809-812
- quote: "Multi-word keys in this specification should use the camelCase style. NB: some parts of the specification don’t obey this convention as they were added before this was adopted, but they should be updated in due course."
- claim: Naming style is camelCase but the spec itself admits legacy keys violate it (e.g. "bioformats2raw.layout", "image-label", "label-value", "field_count" mixed with rowIndex/columnIndex).
- conditions: spec-wide.
- implication: Reader attribute lookups must match exact historical key spellings; no normalization.
- open question: none.

### O-016
- source: S053 lines 22-30, 67-73
- quote: "\"required\": [ \"multiscales\", \"version\" ] ... \"$defs\": { \"multiscales\": { ... \"minItems\": 1, \"uniqueItems\": true"
- claim: The official 0.5 image.schema makes ome.multiscales and ome.version REQUIRED on an image group; multiscales is an array with at least one item; datasets minItems 1; axes minItems 2 maxItems 5 with 2-3 space axes (minContains/maxContains, lines 126-149); coordinateTransformations must contain exactly one scale (maxContains: 1, lines 196-217) and scale/translation vectors have minItems 2.
- conditions: image.schema of NGFF 0.5 (schema for "The zarr.json attributes key").
- implication: Gives a concrete machine-checkable definition of a minimal valid image group; useful for validation-in-viewer ("explain data it cannot display") and for fixture generation. Note schema's scale minItems 2 conflicts with nothing but means a 1D scale array would be invalid.
- open question: The corpus does not include the _version.schema file itself (referenced at line 19); exact version-string pattern unknown.

### O-017
- source: S054 lines 1-119 (whole file; uri in catalog: idr0062A/6001240_labels.zarr/zarr.json)
- quote: "\"version\": \"0.5\", ... \"axes\": [ { \"name\": \"c\", \"type\": \"channel\" }, { \"name\": \"z\", \"type\": \"space\", \"unit\": \"micrometer\" }, ... ] ... \"omero\": { ... \"rdefs\": { \"defaultT\": 0, \"defaultZ\": 118, \"model\": \"color\" } }"
- claim: Real IDR 0.5 image metadata: CZYX axes (c has no unit; z/y/x micrometer); 3 levels ("0","1","2") with level-0 scale [1.0, 0.5002, 0.3604, 0.3604] (S054 lines 33-44); omero present with 2 channels, window end 1500 but max 65535, rdefs.defaultZ=118, model "color"; non-spec `_creator` key tolerated alongside ome keys (lines 5-7).
- conditions: captured from livingobjects.ebi.ac.uk IDR (0.5); axes order is czyx — channel first (allowed: time→channel→space).
- implication: (a) Window "end" (1500) is much smaller than data "max" (65535) — initial display must use start/end, not min/max, or the image renders nearly black/white wrongly. (b) rdefs.defaultZ=118 must be bounds-checked against the actual z size at runtime. (c) Extra keys like `_creator` appear in the wild; readers must ignore unknown keys.
- open question: Is `6001240_labels.zarr` an image or a labels container? It has multiscales+omero and no "labels"/"image-label" key here, suggesting a standalone image with a "_labels" naming convention — affects how discovery classifies sibling filesets.

### O-018
- source: S055 lines 1-74
- quote: "\"chunk_grid\": { \"configuration\": { \"chunk_shape\": [1, 10, 512, 512] }, \"name\": \"regular\" }, ... \"codecs\": [ { ... \"name\": \"sharding_indexed\" } ], \"data_type\": \"uint16\", \"dimension_names\": [ \"c\", \"z\", \"y\", \"x\" ], ... \"shape\": [2, 236, 275, 271]"
- claim: The real level-0 array of an IDR 0.5 dataset is SHARDED: chunk_grid regular with chunk_shape [1,10,512,512] (larger than the array's y/x extent 275/271), wrapped in a sharding_indexed codec (inner chunks 1,1,256,256; blosc/zstd; index bytes+crc32c). data_type "uint16"; dimension_names present and match axes (O-004 rule honored).
- conditions: ome2024/IDR sample; Zarr v3 array metadata.
- implication: Sharding is not exotic: a mainstream sample uses it. A reader without sharding support cannot open flagship 0.5 sample data. Also chunk shape exceeding array shape (partial edge chunks) is normal. Sharded-read performance on local disk is a known pain point in the ecosystem (S049 search listing points to zarr-python issue #1343 "Sharded array is very slow to load" — search listing only, not primary evidence).
- open question: none for the metadata itself; sharding-read latency on local disk needs measurement, not assertion.

### O-019
- source: S056 lines 1-320
- quote: "\"_creator\": { \"name\": \"ome2024-ngff-challenge\", \"version\": \"1.0.0\", \"notes\": null }, ... \"plate\": { \"columns\": [...11...], \"field_count\": 32, \"name\": \"190129\", \"rows\": [...6...], \"wells\": [ ...50 sparse wells... ] }"
- claim: A real ome2024-ngff-challenge 0.5 plate: 6 rows x 11 columns grid but only 50 wells defined (sparse), field_count 32; the plate object has NO "version" key and NO "acquisitions" key, although the spec says plate MUST contain version (S003 line 550).
- conditions: captured from livingobjects.ebi.ac.uk idr0090/190129.zarr/zarr.json (0.5).
- implication: Real writers violate spec MUSTs; a viewer that hard-fails plate metadata missing "version" would reject a real flagship dataset. Discovery must navigate sparse plates by the wells list, not by scanning every row/column path.
- open question: Does bioformats2raw or the challenge tool ever emit plate.version in other releases? (S033/S034 may say.)

### O-020
- source: catalog S068 (uri https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr/.zattrs); S068.txt line 1
- quote: "Binary source retained; this CLI cannot extract application/octet-stream"
- claim: The one captured 0.4-era .zattrs is retained as opaque binary in this corpus: no readable content, so it provides NO evidence about 0.4 attribute layout.
- conditions: corpus limitation.
- implication: Any 0.4-vs-0.5 claims must rest on other sources (e.g. S059 0.4 spec page); absence of readable 0.4 metadata here is not evidence about 0.4 itself.
- open question: What does S059 (0.4 spec) say differently from S003 (0.5)?

### O-021
- source: S001 lines 1-23; S012 lines 1-24; S021 lines 1-25; S032 lines 1-23; S036 lines 1-24; S049 lines 1-25; S060 lines 1-29; S069 lines 1-23; S071 lines 1-23
- quote: "Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims."
- claim: Nine handles (S001, S012, S021, S032, S036, S049, S060, S069, S071) are web-search result listings, explicitly marked "not primary evidence". They still name potentially relevant artifacts: ome-zarr-py PRs #404/#413 (Zarr v3, v0.5 read/write), napari-ome-zarr issue #139 (Zarr v3 compatibility and scale metadata reading in napari 0.6.6), vizarr issue #307 (rendering issues for images in OME-Zarr v0.5), bioformats2raw release v0.5.0, zarr-python issues #1343 (sharded load slow) and #2710 (performance regression in V3), qupath PR #1638 (remote ome-zarr), forum threads on reading OME-Zarr v0.5 with Python.
- conditions: capture artifacts of search providers (Exa); the pointed-to pages are mostly also captured separately in this corpus.
- implication: Treat these as an index of where ecosystem friction concentrated (zarr v3 support, v0.5 rendering, sharding performance), not as evidence of any claim's truth.
- open question: covered by reading the actual PR/issue captures: S004, S008, S011, S013, S014, S023, S027, S029, S044.

### O-022
- source: S002 (catalog entry; 0 bytes, view_lines 0); S005.txt line 1; S007.txt line 1; S030.txt line 1; S042.txt line 1; S045.txt line 1; S046.txt line 1; S077.txt line 1; S095.txt line 1; S096.txt line 1; S121.txt line 1
- quote: "ValueError: Clone exceeded 256 MiB or 120 second cap; partial clone retained, not admitted" / "HTTPError: HTTP Error 403: Forbidden" / "HTTPError: HTTP Error 404: Not Found" / "HTTPError: HTTP Error 422: Unprocessable Entity" / "ValueError: Incomplete clone is not a source" / "ValueError: Git metadata is not a document source" / "No literal matches. This does not establish semantic absence."
- claim: Handles S002 (0 bytes; ngff "latest"/"tools" pages), S005, S007, S030, S042, S045, S046, S077, S095, S096, S121 are failed/empty captures containing no substantive source content.
- conditions: corpus limitation; aliases show what they were meant to be (e.g. S002 = ngff latest + tools pages).
- implication: The NGFF official "tools" list and several intended pages are NOT in evidence; claims about the tool ecosystem must come from S037/S041/S043/S070 or specific project sources. These failures are not evidence of absence of any feature.
- open question: none (corpus is closed).

### O-023
- source: S120 lines 25-28
- quote: "renderlib/VolumeDimensions.cpp:288:  if (this->dtype == \"int32\") { ... 291: } else if (this->dtype == \"uint16\") { ... 294: } else if (this->dtype == \"uint8\") { ... 297: } else if (this->dtype == \"float32\") {"
- claim: AGAVE's zarr path (tensorstore-backed) recognizes exactly four data types: int32, uint16, uint8, float32 (grep extract of allen-cell-animated/agave at commit 9e7b47f).
- conditions: AGAVE source, partial grep view — other branches may exist outside the matched lines.
- implication: Even mature viewers restrict dtypes; an OME-Zarr viewer will meet int64/uint64/float64 label or float images in the wild and needs an explicit unsupported-dtype message (brief line 3: "clearly explain data it cannot display"). Also suggests checking label dtype coverage separately (labels may be int64 per O-010).
- open question: Full dtype handling in AGAVE may be wider; this is a grep view.

### O-024
- source: S121 lines 1-9
- quote: "renderlib/io/FileReaderZarr.cpp:161:FileReaderZarr::getOmero(nlohmann::json attrs) ... 175: omero = ome[\"omero\"]; ... 177: omero = attrs[\"omero\"];"
- claim: AGAVE's reader looks for omero first under the 0.5 namespace (attributes.ome.omero) and falls back to legacy top-level attrs["omero"] (0.4 layout) — a dual-version compatibility shim (grep extract).
- conditions: AGAVE source, partial view.
- implication: Supporting both layouts is a known compatibility requirement for viewers spanning 0.4/0.5 filesets; for a 0.5-only product it is an optional capability, but its cost is small and real corpora mix versions (this corpus has both 0.4 and 0.5 sample URLs).
- open question: none.

### O-025
- source: S016 lines 368-387
- quote: "class FormatV05(FormatV04): ... \"\"\" Changelog: added FormatV05 (May 2025): writing not supported yet \"\"\" ... @property def zarr_format(self) -> int: return 3 ... CurrentFormat = FormatV05"
- claim: ome-zarr-py (commit 94eaf20) implements 0.5 as zarr_format 3 with chunk_key_encoding {"name": "default", "separator": "/"}; a comment notes "this is default for Zarr v3. Could return None?"; 0.5 writing was "not supported yet" at that commit; CurrentFormat is 0.5.
- conditions: ome-zarr-py format.py; version string "0.5" matched literally (format_from_version raises ValueError otherwise, lines 13-21).
- implication: 0.5 read paths exist in mainstream tools from May 2025, but write-side lagged; interop testing should use tool versions that actually declare 0.5 support. "0.5" is an exact string match — "0.5.0"/floats must be normalized (float 0.1 → str "0.1" handled at lines 15-17).
- open question: Which ome-zarr-py release first shipped usable 0.5 reading (see S052 releases, S017 changelog)?

### O-026
- source: S016 lines 35-46, 81-96
- quote: "def detect_format(metadata: dict, default: \"Format\") -> \"Format\": ... if fmt.matches(metadata): return fmt ... def _get_metadata_version(self, metadata: dict) -> str | None: ... multiscales = metadata.get(\"multiscales\", []) if multiscales: dataset = multiscales[0] return dataset.get(\"version\", None) for name in [\"plate\", \"well\", \"image-label\"]: obj = metadata.get(name) if obj: return obj.get(\"version\", None)"
- claim: Format detection looks for the version string inside multiscales[0] or plate/well/image-label objects — the 0.4-and-earlier layout — not (here) at attributes.ome.version; the caller (S019 lines 87-90) strips the "ome" namespace first, so detection is fed ome-subset metadata.
- conditions: ome-zarr-py; metadata after namespace unwrap.
- implication: A 0.5 fileset whose ome block carries version only at attributes.ome.version would yield version None here and fall to the default (0.5) — benign for reading, but shows version detection in the ecosystem keys off MULTIPLE locations; a Slide Scout validator should check attributes.ome.version per O-003 but not reject files that also/instead carry legacy version placement.
- open question: none.

### O-027
- source: S016 lines 276-294
- quote: "scale = [full / level for full, level in zip(data_shape, shape)] trans = [s / 2 - s0 / 2 for s, s0 in zip(scale, scale0)] coordinate_transformations.append([ {\"type\": \"scale\", \"scale\": scale}, {\"type\": \"translation\", \"translation\": trans} ])"
- claim: When ome-zarr-py WRITES pyramids (0.4 path), it emits scale = full/level shape ratios AND a centering translation (s/2 - s0/2 per axis) so lower levels are centered on the full image.
- conditions: writer-side generation (FormatV04.generate_coordinate_transformations).
- implication: Reader-side coordinate math must handle translation-after-scale (centered pyramids): a viewer that ignores dataset translations will misalign lower pyramid levels by up to half an extent, visibly during zoom-out level switching.
- open question: none.

### O-028
- source: S016 lines 296-365
- quote: "if sum(t == \"scale\" for t in types) != 1: raise ValueError(\"Must supply 1 'scale' item in coordinate_transformations\") ... if types[0] != \"scale\": raise ValueError(\"First coordinate_transformations must be 'scale'\") ... if len(scale) != ndim: raise ValueError(...)"
- claim: ome-zarr-py validation enforces: exactly one scale; scale FIRST in the list; scale/translation vector length == image ndim; numeric values. Raises ValueError (not skip) on violation.
- conditions: reader-side validation helper.
- implication: Real-world files failing these checks cause hard errors in ome-zarr-py-based stacks; Slide Scout must decide per error whether to reject the image with explanation or salvage it (e.g. wrong-order translation) — strictness is a product choice.
- open question: none.

### O-029
- source: S018 lines 276-318
- quote: "multiscales = self.lookup(\"multiscales\", []) version = multiscales[0].get(\"version\", \"0.1\") # should this be matched with Format.version? datasets = multiscales[0][\"datasets\"] axes = multiscales[0].get(\"axes\") ... node.metadata[\"name\"] = multiscales[0].get(\"name\")"
- claim: ome-zarr-py reads ONLY multiscales[0] (datasets, axes, name); missing version defaults to "0.1"; the code itself carries a TODO questioning version matching.
- conditions: ome-zarr-py reader.py.
- implication: Confirms O-008's risk is real in practice: the reference Python reader ignores additional multiscales entries; Slide Scout listing each entry would exceed ome-zarr-py behavior (opportunity, but also risk of expecting fallback behavior that matches only the first entry's geometry).
- open question: none.

### O-030
- source: S018 lines 325-391
- quote: "model = rdefs.get(\"model\", \"unset\") ... if model == \"greyscale\": rgb = [1, 1, 1] ... visible = ch.get(\"active\", None) if visible is not None: visibles[idx] = visible and node.visible ... if start is None or end is None: # Disable contrast limits settings if one is missing contrast_limits = None ... except Exception: LOGGER.exception(\"Failed to parse metadata\")"
- claim: ome-zarr-py omero handling: rdefs.model "greyscale" forces all channel colors to white; channel "active" gates initial visibility; a channel window missing start OR end disables contrast limits ENTIRELY (all channels); any parsing exception is caught and logged — render defaults survive bad omero.
- conditions: ome-zarr-py OMERO spec.
- implication: Missing/partial omero or window data must degrade to computed limits (e.g. data-driven min/max), not error; greyscale model is a display-mode override, not per-channel color. Contrast-limits fallback behavior differs between implementations (napari's differs, see O-032).
- open question: none.

### O-031
- source: S018 lines 394-464, 468-567
- quote: "# Construct a 2D almost-square grid field_count = len(image_paths) column_count = math.ceil(math.sqrt(field_count)) ... if data is None: data = da.zeros(self.img_pyramid_shapes[level], dtype=self.numpy_type)"
- claim: ome-zarr-py renders plates/wells as STITCHED lazy dask grids: well fields tiled into an almost-square grid; missing fields and empty plate wells become zero-filled tiles; plate uses first well/first field's metadata and dtype for the whole stitched pyramid.
- conditions: ome-zarr-py Well/Plate specs.
- implication: One established product approach treats a plate as one big stitched image (with synthetic zeros); the alternative (spec-sanctioned) is browsing wells as separate images (S003 line 273-274). Stitching hides per-well identity and creates fake black regions; Slide Scout must pick deliberately (product choice) and, if stitching, disclose zero-filled substitutions.
- open question: none.

### O-032
- source: S048 lines 166-170, 215-258, 293-336
- quote: "@staticmethod def get_attrs(group: Group) -> dict: if \"ome\" in group.attrs: return group.attrs[\"ome\"] return group.attrs ... if \"coordinateSystems\" in attrs[\"multiscales\"][0]: axes = attrs[\"multiscales\"][0][\"coordinateSystems\"][0][\"axes\"] ... # napari treats a None entry as its default (pixel); keeping the spatial units means label and split-image layers stay unit-consistent, so the scale bar still renders (napari warns \"Inconsistent units across layers\" and hides units when one layer lacks them)."
- claim: napari-ome-zarr reader (file headed "# zarr v3"): version-agnostic attr access (0.5 "ome" namespace else flat 0.4); supports a "coordinateSystems" multiscales form it labels "v0.6+"; per-axis units are forwarded with None preserved because inconsistent units across layers make napari hide the scale bar.
- conditions: napari-ome-zarr ome_zarr_reader.py at captured commit; napari 0.6.x era.
- implication: (a) 0.5 metadata placement must be read from the ome namespace, 0.4 flat — dual support is the implemented norm. (b) Draft/next-version (0.6) metadata already appears in the wild via this reader's handling; unknown-future keys should be skipped, not fatal. (c) Display consequences cascade: a single layer missing units can hide the scale bar for the whole view — details-panel unit display and layer unit consistency interact.
- open question: Is there 0.6/scene content in this corpus beyond code references (S034 ome2024 challenge README may describe it)?

### O-033
- source: S048 lines 199-213, 237-244, 580-598, 652-656, 707-717
- quote: "paths = [ds[\"path\"] for ds in attrs[\"multiscales\"][0][\"datasets\"]] ... if \"channel\" in atypes and self._splits_channels(): channel_axis = atypes.index(\"channel\") ... def _splits_channels(self) -> bool: # A label is loaded as a single layer keeping all axes ... return False ... \"visible\": False, # labels not visible initially ... layer_type = \"labels\" ... if \"channel_axis\" in metadata: ... node_data[level] = da.squeeze(darray, axis=ch_axis)"
- claim: napari-ome-zarr splits image channels into separate layers (channel axis found by TYPE); label images stay single-layer keeping the channel axis; napari labels layers must not have channel_axis (squeezed out of data too); labels start NOT visible; only multiscales[0] is used (like ome-zarr-py).
- conditions: napari-ome-zarr reader.
- implication: Channel identity-by-type (not name) is the implemented norm (agrees with O-005); overlay defaults matter: established viewers hide label overlays initially — an initial-visibility default Slide Scout must choose explicitly. Multi-entry multiscales again unhandled — reinforcing O-029.
- open question: none.

### O-034
- source: S048 lines 341-368
- quote: "class Bioformats2raw(Spec): @staticmethod def matches(group: Group) -> bool: attrs = Spec.get_attrs(group) # Don't consider \"plate\" as a Bioformats2raw layout return \"bioformats2raw.layout\" in attrs and \"plate\" not in attrs ... for child in root: ... if child.tag.endswith(\"Image\") and node_id.startswith(\"Image:\"): image_path = node_id.replace(\"Image:\", \"\")"
- claim: napari's bioformats2raw handling: layout key without plate; child images discovered by parsing OME/METADATA.ome.xml and taking Image IDs "Image:N" → group paths "N" (NOT via the "series" attribute); plate+layout is treated as plate only.
- conditions: napari-ome-zarr reader.
- implication: Two discovery conventions coexist for collections (series attribute vs OME-XML IDs vs consecutive numbering, S003 lines 261-270). Slide Scout discovery should implement the consecutive-numbering + series fallback and treat OME-XML as optional metadata; disagreement between series and OME-XML should not crash discovery.
- open question: none.

### O-035
- source: S048 lines 664-699
- quote: "if Labels.matches(root_group): # Try starting at parent Image parent_path = root_group.store.root.parent ... elif Label.matches(root_group): # Try starting at parent Image - up 2 dirs ... elif Bioformats2raw.matches(root_group): ... elif Multiscales.matches(root_group): ... elif Plate.matches(root_group): ... elif Scene.matches(root_group): ... else: print(\"No matching spec\", root_group)"
- claim: Reader dispatch by node type with priority (labels→parent image; label→grandparent; b2r; multiscales; plate; scene); unmatchable groups are skipped with a console message only — no user-facing error object.
- conditions: napari-ome-zarr entry point.
- implication: Opening a labels group directly is an expected user action (file dialogs land inside hierarchies); Slide Scout discovery should classify nodes regardless of entry point. Silent "no matching spec" is the failure mode to avoid (brief: "clearly explain data it cannot display").
- open question: none.

### O-036
- source: S019 lines 52-66, 79-100, 213-233
- quote: "detected = detect_format(self.__metadata, loader) ... if detected != fmt: LOGGER.warning(\"version mismatch: detected: %s, requested: %s\", detected, fmt) self.__fmt = detected ... if \"ome\" in self.zgroup: self.zgroup = self.zgroup[\"ome\"] ... If mode is 'r', and the path does not exist returns None. If there is an error opening the path, also returns None."
- claim: ome-zarr-py io: opens with current format (0.5), auto-switches on detected mismatch (with warning); unwraps ome namespace for v3; parse_url collapses "not found" and "error" into the same None return.
- conditions: ome-zarr-py io.py.
- implication: Version auto-detection at open time is implemented behavior; but error collapsing means callers cannot distinguish missing vs broken — Slide Scout's failure UX (Plan line 7) needs richer error surfaces than parse_url-style APIs give.
- open question: none.

### O-037
- source: S009 lines 21-31, 56-72
- quote: "docs/source/advanced/sharding.ipynb ... docs/source/advanced/transforms/reading_scenes.ipynb ... ome_zarr/classes/scene.py ... ome_zarr/reader.py ... ome_zarr/writer.py"
- claim: ome-zarr-py repo tree (commit 94eaf20) includes first-class docs and classes for sharding and for "scene"/transforms (rotated multiscales, create/reading scenes), plus separate classes/image.py and classes/scene.py modules.
- conditions: repository listing only — file contents not in corpus (except reader.py/format.py/io.py captures S016/S018/S019).
- implication: Sharding and scene-style transforms are active mainstream concerns, consistent with O-018 and O-032; the corpus lacks the actual scene.py content, so ome-zarr-py's exact scene behavior is unresolved here.
- open question: What metadata schema does "scene" use (partially visible via napari's Scene spec, S048 lines 402-495)?

### O-038
- source: S004 lines 149-158, 405-406, 573-584
- quote: "This PR proposes to adopt the version 3 of the Zarr format for OME-Zarr. Main changes: Only Zarr v3 is allowed for upcoming versions of OME-Zarr. Zarr v3 stores its metadata in zarr.json files. ... The chunk_key_encoding of the Zarr arrays are respected instead of mandating the / dimension separator. Basically all Zarr features are available in OME-Zarr as they get approved through the ZEP process. Add a ome namespace within the zarr.json attributes. Move version fields from multiscale, plate, well etc. up into the ome object. Move the registration of labels from the labels group into the multiscale group. ... Closing this in favor of #227."
- claim: The Zarr v3 proposal (PR #206, closed Feb 15 2024 in favor of RFC-2 #227) introduced: zarr.json for groups+arrays, attributes object, ome namespace, version moved into ome, respecting array chunk_key_encoding, and ALL Zarr features via ZEP process. A proposed but NOT adopted change: moving label registration into the multiscale group — final 0.5 keeps labels registered in the labels group (S003 line 441). The PR also carried draft coordinateSystems/rotation/sequence/affine/displacement transform metadata that did NOT land in 0.5 (S003 line 309 allows only scale/translation).
- conditions: history of the 0.5 design; the draft transformation content resurfaced in later RFC work (see O-032).
- implication: Explains WHY 0.4→0.5 migration breaks readers (metadata moved into zarr.json + ome namespace; version key location moved) — the compatibility break is by design. Draft-only transform types (rotation etc.) appearing in files are out of 0.5 scope; a 0.5-targeted viewer may encounter them only from future-version writers and should report unsupported-transform rather than silently ignore geometry.
- open question: none.

### O-039
- source: S011 lines 141-177
- quote: "napari: 0.6.6 napari-ome-zarr: 0.6.1 bioio-ome-zarr: 3.2.0 zarr: 3.1.5 (upgraded from 2.18.7) ome-zarr: 0.10.3 ... napari-ome-zarr depends on ome-zarr, which is pinned to zarr<3. When loading OME-Zarr files in napari, I now get: RuntimeError: Failed to import command at 'napari_ome_zarr._reader:napari_get_reader': cannot import name 'FSStore' from 'zarr.storage' ... The default napari reader (without napari-ome-zarr plugin) does not correctly read OME-Zarr coordinate transformations/scale metadata, resulting in incorrect anisotropic volume rendering. The voxel scales from coordinateTransformations in the multiscales metadata are not applied."
- claim: As of Dec 2025 the Python OME-Zarr reading stack was split across zarr-python 2 vs 3 (FSStore import failure); installing the plugin stack could break entirely; napari's built-in reader ignores coordinateTransformations scale producing wrong anisotropic rendering. Remedy direction: PR #123 drops the ome-zarr dependency and uses zarr>=3.0.8 directly.
- conditions: napari-ome-zarr issue #139, opened Dec 11, 2025; Windows; versions as quoted.
- implication: (a) Calibrated scale application is exactly the class of bug real viewers shipped — Slide Scout's "read correctly calibrated coordinates" (brief line 3) needs a validation idea comparing displayed physical size to metadata values, not just "it renders". (b) Dependency-era matters: "napari-ome-zarr works" claims are version-specific; interop fixtures should record the reader version used.
- open question: none.

### O-040
- source: S014 lines 136-143
- quote: "Viewing a 3-channel image (unit16). No well definitions. Using group 0 in bioformats2raw Zarr layout. Vizarr works as expected for the image in OME-ZARR v0.4 format (written by NGFF-Converter): Vizarr renders chunks repetitively for image data converted into OME-ZARR v0.5 format, using the resave command of https://github.com/ome/ome2024-ngff-challenge"
- claim: vizarr (still Open as of capture) mis-renders OME-Zarr 0.5 data — "renders chunks repetitively" — for data converted by the ome2024-ngff-challenge resave tool, while the same image in 0.4 renders correctly.
- conditions: vizarr issue #307, opened Oct 8 2025; Firefox 143 and Chromium; 3-channel uint16; bioformats2raw layout, group 0.
- implication: A real, popular viewer failed on 0.5 layout/codec specifics (likely chunk-grid or sharding misread). "Interoperate with filesets from real OME-Zarr 0.5 tools" (Plan line 9) therefore requires concretely testing ome2024-challenge-converted data, not just ome-zarr-py-written data; repetitive-chunk rendering is the observed failure signature to test for.
- open question: Root cause in vizarr not stated in the capture (no comments captured).

### O-041
- source: S008 lines 149-163, 158
- quote: "This updates ome-zarr-py to use zarr-python v3 but doesn't include support for writing Zarr v3 (OME-Zarr v0.5). However, it does add support for reading OME-Zarr v0.5 (e.g. for use by napari-ome-zarr). ... NB: if the image is bioformats2raw layout, you'll need to add /0 to the zarr url. If in doubt, open in Validator first. Most of the IDR samples there are plates."
- claim: ome-zarr-py PR #404 (Nov 2024): zarr-python v3 migration added 0.5 READING first; writing came later (#413). Practical guidance from the author: bioformats2raw-layout URLs need a child path appended; many IDR samples are plates; the validator is the disambiguator.
- conditions: PR #404; zarr>=3.0.8; python 3.11+ (zarr v3 unsupported on 3.9/3.10, lines 207-214).
- implication: (a) Opening a collection root vs an image node are distinct entry points users will hit — discovery must classify the root type (image/plate/collection) and guide selection. (b) 0.5 write support in the Python ecosystem is younger than read support (merged Aug 2025, O-042), so the age of a producer tool predicts its 0.5 fidelity.
- open question: none.

### O-042
- source: S013 lines 126-131, 150-166, 182-193
- quote: "Merged joshmoore merged 91 commits ... Aug 7, 2025 ... This PR adds support for writing OME-Zarr v0.5, which becomes the default CurrentFormat(). ... Known issues: compressor option fails when writing dask arrays ... ValueError: compressor cannot be used for arrays with zarr_format 3. Use bytes-to-bytes codecs instead. ... Reading via napari-ome-zarr... images and plates, v0.1, 0.3, 0.4, 0.5..."
- claim: ome-zarr-py 0.5 writing merged Aug 7 2025 and became the default format; mixing v0.4/v0.5 formats in one write raises; zarr v3 removed the "compressor" kwarg (codecs instead), breaking older call patterns; test matrix included IDR v0.5 images and plates.
- conditions: PR #413.
- implication: Tooling that predates Aug 2025 may claim "OME-Zarr" support while being 0.4-only — version provenance of producer tools matters for fixture selection; codec configuration (not compressor) is the 0.5 way, reinforcing O-018 (blosc/bytes/crc2c codecs in real files).
- open question: none.

### O-043
- source: S023 lines 150-157
- quote: "$ ome_zarr finder path/to/my_data_folder/ This command will traverse your local filesystem, looking for zarr images (only .zattrs for now - can add zarr v3 support as a follow-up) and collect them into a CSV. This CSV is then served by the localhost python server and opened in BioFile Finder, allowing you to browse your local zarr images..."
- claim: ome-zarr-py's local collection-browsing CLI (merged Apr 15 2025) discovered images by .zattrs ONLY — zarr v3 (zarr.json) discovery was explicitly deferred as follow-up; it integrates with Allen Institute's BioFile Finder for browsing a folder of images with thumbnails.
- conditions: PR #436, merged Apr 2025.
- implication: (a) Local multi-image discovery for 0.5 was still a gap in mid-2025 — exactly Slide Scout's core "find images within a fileset" (brief line 3); it is a real unmet need, not gold-plating. (b) CSV/manifest + external browser is an alternative, simpler product shape the Plan implicitly rejects (built-in viewer) — worth noting as a considered alternative.
- open question: none.

### O-044
- source: S029 lines 141-206, 293-296, 334-336, 451-452
- quote: "Summary Table ... library [Metadata/Validation/Arrays/Graph/CLI] ome-zarr-py Yes Yes Yes Yes ... But only downsamples in 2D (x and y) ... Not easy to write pixel sizes. Scale starts at [1, 1, 1, 1, 1]. Axes created automatically: 'type' inferred by name. No units. ... OME-Zarr output v0.4 isn't valid due to axis order cxyz and dimension separator .. ... https://forum.image.sc/t/downsampling-data-in-z-axis-for-ome-zarr-creation/104143 (ome-zarr-py doesn't support Z downsampling)"
- claim: A maintainer's Nov 2024 comparison of OME-Zarr libraries documents that real writers commonly emit degenerate metadata: default scale [1,1,1,1,1], no units, axis type inferred from name; webknossos' 0.4 output was invalid (axis order cxyz, '.' separator); ome-zarr-py lacked Z downsampling. Lists the ecosystem: ome-zarr-py, pydantic-ome-ngff, ome-zarr-models, ngff-zarr, webknossos, ngio, EuBi-Bridge, acquire-zarr, iohub, ngff-writer.
- conditions: ome-zarr-py issue #407 (Nov 25, 2024); quotes are the issue author's assessments of each tool at that time.
- implication: Slide Scout cannot assume calibrated voxel sizes or units exist: the details panel needs an explicit "unknown/unspecified" state, and physical-size display must degrade to pixel units. Producer diversity means fixture sets should be drawn from MULTIPLE writers (challenge tool, IDR, ome-zarr-py, webknossos) — Plan line 11's "representative filesets" should say so explicitly (currently unspecified).
- open question: none.

### O-045
- source: S044 lines 126-146, 183-208, 239-246
- quote: "ome-zarr-py does not appear to work correctly with auto-sharding. ... zarr.create_array(store=store, shape=arr_np.shape, chunks=(1, 100, 100), shards=\"auto\", ...) ... ValueError: Could not interpret 'a' as a byte unit"
- claim: ome-zarr-py fails on zarr's "auto" sharding (issue #640, opened Aug 31 2026, Open): shards:"auto" crashes the writer path. Shows sharding is moving to default/automatic usage in zarr-python while OME-layer tools lag.
- conditions: ome-zarr (ome-zarr-py) writer path; zarr-python with shards="auto"; reproducer included.
- implication: Sharded 0.5 arrays will become MORE common (auto-sharding); read-side support cannot be deferred as exotic (agrees with O-018). If Slide Scout builds on a zarr library, its sharding coverage must be verified per version, not assumed.
- open question: Reader-side auto-shard support status in zarr-python 3.x is not evidenced in this corpus.

### O-046
- source: S010 lines 1026-1143
- quote: "0.5 76-45.ome.zarr 520 1 2 1 XYZCT 384 1 ... 0.5 190129.zarr 2048 2044 31 5 XYZC 49 32 ... 0.5 ExpD_chicken_embryo_MIP.ome.zarr 6510 8978 XY ... 0.5 ExpA_VIP_ASLM_on.zarr 2048 2048 1937 XYZ ... 0.5 BR00109990_C2.zarr 2080 1552 5 XYC bioformats2raw.layout (9 images)"
- claim: The IDR OME-NGFF samples catalog's 0.5 section (mostly added 2024-11-21) includes: plates with 384 wells/1 field and 49 wells/32 fields; a 2D XY-only image (6510x8978, no z/c/t); an XYZ volume with no channel axis; XYZC/XYZCT images; bioformats2raw.layout collections ("9 images"); and 9822152.zarr at 144384x93184 (single plane, 21.6 GB, S034 line 70). Page also offers "open this table in BioFile Finder" (lines 5-7).
- conditions: https://idr.github.io/ome-ngff-samples/ capture; axis strings as listed in the catalog table.
- implication: Real 0.5 data spans 2D-5D with arbitrary axis-type subsets, so channel/time/plane controls must appear only "where relevant" (Plan line 5) and level selection must cope with extreme sizes; representative acceptance fixtures (Plan line 11) can be chosen directly from this list to cover each shape class.
- open question: none.

### O-047
- source: S034 lines 40-46, 53-63, 150-168
- quote: "Data generated within the challenge will have: - all v2 arrays converted to v3, optionally sharding the data - all .zattrs metadata migrated to `zarr.json[\"attributes\"][\"ome\"]` - a top-level `ro-crate-metadata.json` file with minimal metadata (specimen and imaging modality) ... $ mc ls -r uk1anon ... 24MiB STANDARD 0/c/0/0/0/0 ... 1.2KiB STANDARD ro-crate-metadata.json ... The input data will **not be modified** in any way and a full copy of the data will be created"
- claim: The ome2024-ngff-challenge converter produces Zarr v3 arrays with optional sharding, migrates .zattrs into zarr.json attributes.ome, adds a top-level ro-crate-metadata.json, and stores chunks under keys like "0/c/0/0/0/0"; resave never modifies input.
- conditions: ome2024-ngff-challenge README (master capture).
- implication: Slide Scout will encounter non-OME files (ro-crate-metadata.json) inside 0.5 filesets that must not confuse discovery; chunk key path "c/..." is the v3 default encoding layout on local disk. Producer writes a full copy — but the Plan's "source files remain unchanged" (line 9) is a read-side obligation the toolchain also honors.
- open question: none.

### O-048
- source: S033 lines 107-119, 152-162, 213-226, 343-359
- quote: "By default, the resolutions will be set so that the smallest resolution is no greater than 256x256. A scaling factor of 2 is used between consecutive resolutions. ... | v3/0.5            | yes                 | yes   | yes  | no   | yes  | ... #### --ngff-version ... Current supported values are 0.4 and 0.5. ... Versions 0.5.0 and later write [OMERO rendering metadata] by default. This includes calculating the minimum and maximum pixel values for the entire image. ... can be omitted by using the `--no-minmax` option. ... A consequence of this change is that all data is now written as little-endian."
- claim: bioformats2raw (master): default pyramid smallest level ≤256x256, factor 2 per level; 0.5 codec support = null/blosc/gzip/zstd (zlib only for 0.4); default output follows 0.4 conventions including bioformats2raw.layout, --ngff-version 0.5 is opt-in; OMERO rendering metadata (with computed min/max) written by default since b2r 0.5.0, omittable via --no-minmax; b2r 0.12.0+ (zarr-java) writes all data little-endian.
- conditions: bioformats2raw master README.
- implication: (a) A dominant converter's 0.5 output is opt-in — much "real tool" 0.5 data comes from the challenge converter instead. (b) omero window data can legitimately be absent (--no-minmax), so missing-omero fallback (O-009) is a required path, not an edge case. (c) Codec matrix for a 0.5 reader at minimum: bytes+{blosc,gzip,zstd,null} (+sharding wrapper per O-018); endianness is explicitly little for b2r but must be read from the bytes codec generally.
- open question: Which b2r release first emitted 0.5 by default (README only says "current supported values")?

### O-049
- source: S033 lines 335-337, 462-502
- quote: "Version 0.3.0 and later uses the `TCZYX` order by default ... The `--dimension-order` option is considered deprecated ... as it results in invalid OME-NGFF data. ... Supports grouping multiple .nd2 files into a single HCS plate. Each file is assumed to represent one well, which may contain multiple fields."
- claim: Dimension order TCZYX is the writer default (deviation "results in invalid OME-NGFF data"); bioformats2raw can synthesize HCS plates from raw acquisition files (BioTek, ND2) that have no plate metadata.
- conditions: bioformats2raw master README.
- implication: TCZYX dominance in produced data is a safe default assumption for rendering, but custom axis names/types (S010 XYZ/XYC rows) are real; plate synthesis means plate filesets in the wild are common even outside IDR.
- open question: none.

### O-050
- source: S043 lines 1-36 (Z downsample), 80-108 (multiscales downsampling not=2), 207-238 (HCS plate), 240-275 (bioformats2raw.layout), 277-316 (multiple 'multiscales')
- quote: "Vizarr expects the same number of Z-sections for each pyramid resolution" ... "napari: notes: \"Image appears to load and display OK, but very quickly crashes on zooming etc.\"" ... "Can the viewer handle pyramids when the scale factor between levels is not equal to 2? ... vizarr: supported: no" ... "napari: supported: yes notes: \"Plate appears to load and display OK, but crashes on zooming in.\"" ... "multiple 'multiscales' ... avivator: supported: no opens: yes ... napari: supported: no opens: yes ... BigDataViewer: supported: no opens: no notes: \"Fails with: java.lang.RuntimeException: java.lang.ArrayIndexOutOfBoundsException: 3\""
- claim: The ome-ngff-tools viewer matrix documents recurring failure classes across 10+ viewers: (1) Z-downsampled pyramids break vizarr and crash napari on zoom; (2) non-2 scale factors between levels break vizarr; (3) plates render but napari crashes on zoom-in, vizarr shows only the lowest resolution; (4) bioformats2raw collections fail or need redirects in most viewers; (5) NO tested viewer supports multiple multiscales entries (some crash).
- conditions: ome-ngff-tools features.yml capture; tests were run against the versions listed in S041 lines 2-20 (napari 0.5.6 + napari-ome-zarr 0.6.1, vizarr April 2025, WEBKNOSSOS 24.11.0 etc.) and mostly v0.4 samples.
- implication: These are the documented ecosystem correctness traps Slide Scout's Plan implicitly takes on: pyramid levels with Z downsampling and non-uniform factors must drive LEVEL CHOICE GEOMETRY, not just texture resolution; zoom on large plate/stitched data is where viewers die (maps to Plan line 7 "must not freeze interaction"); the Plan's image list should not depend on multiple-multiscales support existing anywhere else.
- open question: Whether current viewer versions fixed these (matrix dated April 2025, pre-dating several zarr-v3 updates).

### O-051
- source: S043 lines 38-78, 318-350, 473-507
- quote: "Does the viewer use the 'omero' metadata to set channel colors, names and rendering levels? ... WEBKNOSSOS: supported: yes ... notes: \"rdefs are not supported\" ... Vol-E: supported: no opens: yes notes: \"The channel labels are read from 'omero' metadata, but the colors are ignored\"" ... "Does the viewer read the 'scale' transformation for each item in `multiscales` list? ... napari: supported: no opens: yes issue_url: .../issues/73"
- claim: Per the matrix: omero-driven channel colors/names/windows are NOT respected by several viewers (Vol-E ignores colors; WEBKNOSSOS ignores rdefs); group-level multiscales scale was NOT applied by napari-ome-zarr (issue #73) at test time; only some viewers (Vol-E no, napari yes) read dataset-level scale for a scalebar; multi-image overlay on one canvas is supported only by napari, WEBKNOSSOS, Microscopy Nodes.
- conditions: same test round as O-050.
- implication: (a) Honoring omero defaults AND rdefs model is a genuine differentiator, not table stakes. (b) Group-level multiscales transforms are the most-dropped metadata in the ecosystem — Slide Scout's calibrated display must explicitly cover them (validated against S003's example). (c) Label OVERLAY on the same canvas (Plan line 5) is a niche capability — the Plan is promising more than most viewers do; alignment math (scale+translation composition, O-027/O-007) is the hard part.
- open question: none.

### O-052
- source: S041 lines 2-20
- quote: "napari 0.5.6 with plugin napari-ome-zarr 0.6.1 and ome-zarr 0.10.3 ... vizarr using current viewer April 2025 ... webKnossos version 24.11.0 ... OMERO with BioFormats ZarrReader 0.2.0"
- claim: The viewer matrix results are pinned to specific tool versions (April 2025 era, pre-0.5-write ome-zarr-py 0.10.x), and labels workflows elsewhere require manual URL construction via the validator (S041 lines 11-14).
- conditions: ome-ngff-tools docs index.
- implication: Any comparison of Slide Scout against these tools should re-verify against current versions; also, established UX requires users to hand-assemble labels URLs — an in-product labels discovery flow (Plan: "optional overlays for associated label images") removes real user friction.
- open question: none.

### O-053
- source: S051 lines 87-121
- quote: "RFC-5: Coordinate Systems and Transformations ... RFC-5: Response 2 (2025-11-18 version) ... RFC-6: Flattening the multiscales array ... RFC-7: Channel provenance ... RFC-8: Collections and Extensibility ... v1 – RFC-8: Collections and Extensibility ... RFC-9: Zipped OME-Zarr ... RFC-3: more dimensions for thee ... RFC-4: Axis Orientation"
- claim: The NGFF RFC pipeline (index captured) shows active next-version work: RFC-3 (more than 5 dimensions), RFC-4 (axis orientation), RFC-5 (coordinate systems and transformations; response versions through 2025-11-18), RFC-6 (flattening multiscales), RFC-7 (channel provenance), RFC-8 (collections/extensibility), RFC-9 (zipped OME-Zarr). None are part of released 0.5 (O-001).
- conditions: RFC index page capture; RFC contents beyond titles are NOT in this capture.
- implication: These are awareness items, not obligations: a 0.5-scoped viewer may safely ignore them but should fail informatively if it meets >5D arrays, zipped stores, or scene/transform metadata early; also relevant to the "Additional capability choices require explicit review" clause (Plan line 9).
- open question: RFC-5's exact draft semantics are not in the corpus (only napari/ome-zarr-py code references, O-032/O-054).

### O-054
- source: S024 lines 17, 39 (body of PR "drop ome-zarr dependency")
- quote: "Investigating a lighter-weight alternative to ome-zarr-py. Uses zarrv3. ... The PR handles bioformats2raw, channels metadata, labels, plates and plates with labels. ... # Nine images in bioformats2raw layout, translated into a 3 x 3 grid ... # v0.5 plate (see screenshot) ... https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0090/190129.zarr ... TODO: - [x] handle labels colors - [x] coordinateTransformations - [x] pre v0.4 (missing/minimal axes etc)"
- claim: napari-ome-zarr PR #123 (merged for 0.8.0) re-implemented reading directly on zarr v3 ("lighter-weight alternative to ome-zarr-py"), explicitly to "more easily support additional complexity as in the RFC-5 spec"; it renders a 9-image bioformats2raw collection translated into a 3x3 grid; test set covers v0.5 2D image, v0.5 plate, b2r collections, plates with labels; handles pre-0.4 files with missing/minimal axes.
- conditions: PR #123 (merged 2026-05-20 per S065); test URLs as listed.
- implication: (a) Two viable architectures exist for the same job: library reuse (ome-zarr-py) vs direct zarr + own metadata mapping; the direct route was chosen to control transform/complexity handling — relevant to Slide Scout's stack choice. (b) A b2r collection can be presented as a GRID of translated images (product choice) rather than a list; Slide Scout's "lists the images it finds" should at least preserve per-image identity. (c) The PR's test URL list is a ready-made acceptance fixture list for Plan line 11.
- open question: none.

### O-055
- source: S065 lines 29-41
- quote: "\"tag_name\": \"0.8.0\" ... \"published_at\": \"2026-05-20T10:38:09Z\" ... * drop ome-zarr dependency by @will-moore in .../pull/123 ... * Handles `bioformats2raw.layout` specification: All images in the series are opened. ... * Fixes Plate labels"
- claim: napari-ome-zarr 0.8.0 (May 2026) dropped the ome-zarr dependency, opened ALL images in a b2r series (previously a failure class per O-050), and fixed plate labels.
- conditions: release capture.
- implication: The Plan's discovery-over-collections behavior was still being fixed in the reference Python viewer in 2026 — Slide Scout should treat b2r/plate enumeration as first-party acceptance tests, not as solved library behavior.
- open question: none.

### O-056
- source: S052 lines 116-128 (v0.19.0 body); S052 lines 416-429 (v0.13.0 body)
- quote: "* Introduce image class v06 by @jo-mueller ... * Ready for 06 ... * Ome zarr scene ... * find_multiscales() handles scenes ... * Be more permissive with version 0.5, allowing support for spatial-data ome zarrs ... * support plain-string codec attributes in zarr >= 3.3 ... * Spatialdata and zipstores"
- claim: ome-zarr-py v0.19.0 (2026-09-02) adds 0.6 "scene"/image-class support and loosens 0.5 version validation for SpatialData-produced OME-Zarr; v0.13.0 (2026-02-04) added Range-header HTTP serving and pinned dask for a breakage (#518).
- conditions: release captures (per_page=15, head = v0.19.2).
- implication: (a) "ome.version: 0.5" files produced by SpatialData may be deliberately accepted despite strict-schema deviations — permissiveness is an active choice in the reference reader (informs Slide Scout's strict-vs-lenient decision, cf. O-019). (b) 0.6 readiness is shipping in the same window Slide Scout targets; unknown-version handling (O-001) will be exercised in practice.
- open question: exact permissiveness of PR #594 unknown (body not in corpus beyond release note).

### O-057
- source: S017 lines 2-13, 21-29
- quote: "# 0.11.0 (April 2025) - Browse collection of local OME-Zarr in BioFile Finder (#436) ... # 0.10.2 (November 2024) ... * pin zarr at < 3"
- claim: ome-zarr-py's CHANGELOG (through 0.11.1, April 2025, at the captured commit) corroborates the timeline: zarr<3 pin until the v3 migration; local collection browsing landed 0.11.0 (April 2025).
- conditions: CHANGELOG.md at commit 94eaf20 (note: release list S052 extends to v0.19.2 — the changelog capture is older than the releases capture).
- implication: Version-provenance matters when citing "ome-zarr-py supports X": the captured repo snapshot (94eaf20) predates the 0.19.x series; claims should name the commit/release.
- open question: none.

### O-058
- source: S025 lines 19-27, 79-92
- quote: "**Vizarr** is a minimal, purely client-side program for viewing zarr-based images. ... Currently, Viv supports `int8`, `int16`, `int32`, `uint8`, `uint16`, `uint32`, `float32`, `float64` arrays ... **Vizarr** supports viewing 2D slices of n-Dimensional Zarr arrays, allowing users to choose a single channel or blended composites of multiple channels"
- claim: vizarr: client-side GPU rendering (Viv/zarrita.js); supports 8 dtypes (through float64); views 2D slices of nD arrays with channel composites; also accepts OME-TIFF-over-HTTP and kerchunk references via URL prefixes (lines 49-61).
- conditions: vizarr README (main).
- implication: A 2D-slice browser (Slide Scout's shape) is an established product class; the Viv lineage renders multiscale 2D efficiently. Dtype floor for Slide Scout should be at least this 8-dtype set (contrast O-023: AGAVE's 4).
- open question: none.

### O-059
- source: S062 lines 7-15; S115 lines 12-14
- quote: "Volume Explorer (Vol-E) is a browser based volume viewer built with React and WebGL (Three.js). ... a url to a OME-ZARR image ... AGAVE's core viewing engine uses a \"progressive path tracer\". ... GPU memory dictates the maximum size of the files AGAVE can load."
- claim: Vol-E (browser, WebGL) and AGAVE (desktop, OpenGL path tracer) are the Allen Institute viewer pair; both are GPU-bound with GPU memory as the load-size limit.
- conditions: README/docs captures.
- implication: Slide Scout's 2D canvas approach (Plan line 5) avoids the GPU-memory ceiling that vol/3D viewers hit; this is a deliberate simpler alternative worth stating in the product case — 2D slice viewing scales to the 1 TB plates (O-046) where volume rendering cannot.
- open question: none.

### O-060
- source: S072 lines 1-3; S117 lines 26-47, 98-134
- quote: "AGAVE is a desktop application for viewing multichannel volume data. Several formats are supported, including OME-ZARR 0.4 and 0.5, OME-TIFF and Zeiss .czi files. ... OME-Zarr data is not stored as single files - instead it is a directory. AGAVE can load OME-Zarr data either from a local directory or from a public cloud URL using https, s3, or gc protocols. ... The OME-Zarr format supports precomputed multiresolution data and will let you select the resolution level. The highest resolution is the default, so beware if you have a large dataset, you risk running out of memory. ... For OME-Zarr data, you may select a sub-region in X, Y, and Z. ... first load a very low resolution level and then select a sub-region of interest to then load at a higher resolution."
- claim: AGAVE (desktop, Qt+C++/tensorstore) reads OME-Zarr 0.4 AND 0.5 from local directory or public cloud URL; load dialog offers: resolution-level selection (defaults to HIGHEST with an out-of-memory warning), initial time point, channel exclusion (excluded channels need a reload to restore), and X/Y/Z sub-region selection with a documented low-res-first workflow.
- conditions: AGAVE README (main) + docs/agave.rst at commit 9e7b47f (v1.10.0 era per S071 search listing).
- implication: This is the closest desktop analog to Slide Scout and defines the current desktop UX baseline: the Plan's automatic "viewer chooses an available pyramid level appropriate for the current view" (line 5) goes BEYOND AGAVE's manual level choice — automatic choice needs level-geometry + viewport math plus backstop UI; a manual level picker with size feedback (O-063) is the simpler alternative if automatic selection proves unreliable.
- open question: none.

### O-061
- source: S117 lines 302-316, 518-537
- quote: "**HH:MM:SS**: the current time is converted to seconds ... **Time Units**: the current time is shown using the physical time units ... When you change the current time in the `Time Panel`, the transfer function is updated to keep your settings meaningful against the new timepoint's ... histogram ... This keeps the rendered image visually stable across timepoints."
- claim: AGAVE shows timestamp overlays in physical time units and adapts per-timepoint transfer functions (absolute vs percentile modes) so display remains stable when data range changes across time.
- conditions: AGAVE docs (agave.rst).
- implication: Time-axis handling has display consequences beyond a slider: calibrated time display (S003 time units) and per-timepoint window adaptation are implemented features in the desktop analog; the Plan's "time-point selection where relevant" can note these as adjacent product choices.
- open question: none.

### O-062
- source: S108 lines 10-17
- quote: "The viewer currently only supports .tif or .czi files containing z-stack data. Currently only 16-bit unsigned pixels are supported. ... Up to four channels can be displayed at a time."
- claim: Earlier AGAVE desktop docs state a 16-bit-unsigned-only limit and max four concurrent channels; the volume must fit GPU memory uncompressed; time sequences load only the first sample (older doc; S117 shows time slider later).
- conditions: AGAVE HELP.txt (bundled desktop doc, older generation).
- implication: Concrete precedent for explicit capability limits + "clearly explain data it cannot display" messaging in this product class; the 4-channel display cap is one answer to the channel-control design space (Plan's "channel visibility controls" does not promise unlimited concurrent channels).
- open question: none.

### O-063
- source: S125 lines 55 (PR #73 body)
- quote: "Once a url (http(s)) is provided, then Agave will attempt to load ome-zarr metadata. If such metadata is found, a dialog will pop up showing the multiresolution levels discovered. Users will be provided a memory estimate of the selected level. Users may also select a sub-region of interest in x,y,z. ... a VERY small number of pixel formats and dimension configurations are currently supported for zarr. Currently it's been tested with data from AIND and AICS that has TCZYX dimensions."
- claim: AGAVE's zarr load dialog (PR #73) shows discovered pyramid levels with a MEMORY ESTIMATE per level and ROI sub-selection; early zarr support was TCZYX-only with few pixel formats; tensorstore noted as a heavy build dependency.
- conditions: AGAVE PR #73 (early zarr feature).
- implication: Memory-estimate-per-level is a proven UI pattern for the "large dataset must not freeze" goal (Plan line 7) — it converts an opaque failure into an informed choice; Slide Scout could show per-level estimated bytes (shape x dtype) cheaply from metadata alone.
- open question: none.

### O-064
- source: S103 lines 11, 58; S104 lines 11, 58; S105 lines 11, 58; S119 lines 11, 68
- quote: "load data asynchronously and incrementally ... Data loading currently blocks the whole application and is not easy to cancel. This is most obvious during a time series render ... preload and cache whole time series ... see if cache hits can be faster ... make sure we are not double caching on disk thru tensorstore ... gpu memory leak when loading new image"
- claim: The closest desktop analog's issue tracker is dominated by exactly the Plan's non-functional targets: async/cancellable loading (#84), time-series caching (#323), disk-cache tuning (#402), GPU memory leaks across image loads (#276).
- conditions: AGAVE issues #84 (open at capture), #323, #402, #276 titles+bodies.
- implication: Plan line 7 (background reads + cancellation of superseded work) targets the documented #1 pain of the direct analog; a distinguishing validation idea is a cancel-mid-read test during time-series scrubbing, not just open-then-wait.
- open question: none.

### O-065
- source: S112 lines 15, 91, 167, 315, 785, 861, 1005, 1081, 622
- quote: "load channels from separate files into same session ... allow channel masking ... improve opacity for overlapping structures ... Add tooltips over labels - esp colorMap ... Would be very useful for biologists if channels could also be given a Look-Up Table (LUT) instead of a solid color ... Feature/color lut ... interpolation on/off ... Add option to interpolate volume sampling ... Feature/timestamp overlay"
- claim: AGAVE's issue/PR stream shows user-demanded display features around channels and labels: LUTs instead of solid colors, channel masking, opacity for overlaps, label colormaps/tooltips, interpolation toggles, timestamp overlays, loading channels from separate files into one session.
- conditions: search-results capture of agave issues (titles only; bodies not read).
- implication: A menu of validated product opportunities (not obligations) adjacent to the Plan's channel/label controls; "load channels from separate files into same session" would breach the current single-fileset boundary (Plan line 9) — an explicit review item if ever requested.
- open question: none (titles only; details unresolved).

### O-066
- source: S114 lines 15, 91-307, 393, 507
- quote: "downsample data at load time ... [volumecache 01/12] Add in-memory volume cache manager ... [volumecache 02/12] Route volume loads through memory cache ... Feature/unbold memory estimate ... loading settings unbold \"Memory Estimate\""
- claim: AGAVE shipped an in-memory volume cache manager series and a "Memory Estimate" UI element (plus load-time downsampling work).
- conditions: search-results capture (titles only).
- implication: Corroborates O-063/O-064: caching + memory estimation are the implemented answers to responsiveness in the analog product; the Plan's cancellation promise likely needs an accompanying cache policy decision (what to keep when work is cancelled).
- open question: none.

### O-067
- source: S082 lines 55 (PR #220 body); S081 lines 58 (#258 body); S083 line 31
- quote: "The big assumption I am making is that OME-NGFF 0.4 is always zarrv2 and if we find a zarrv3 zarr.json file, then I am assuming a OME-NGFF 0.5 json file. ... Anything outside this assumption will error out in some way. ... The zarr doesn't automatically load in agave, but it can be loaded by manually pasting the zarr url in the \"open from url\" dialog. ... seems fixed on BFF side."
- claim: AGAVE's 0.5 support (PR #220, merged 2025-03-22) infers NGFF version from zarr format version (zarrv2→0.4, zarr.json→0.5) and errors outside that assumption; a later integration bug (#258) had zarr failing to auto-load from BioFile Finder until fixed on the BFF side (2025-07-10).
- conditions: AGAVE PR/issue captures.
- implication: (a) Format sniffing by zarr version is a real implemented shortcut but diverges from the spec's ome.version field (O-003); Slide Scout should read ome.version and treat zarr-format sniffing as fallback. (b) Even "load from picker" integrations in mature desktop tools had discovery failures — discovery is a first-party risk area, matching Plan line 11's image-discovery acceptance focus.
- open question: none.

### O-068
- source: S058 lines 255-264, 309-311, 360
- quote: "WEBKNOSSOS works great with OME-Zarr datasets, sometimes called next-generation file format (NGFF). ... Zarr Folder Structure (v0.4) ... Zarr Folder Structure (v0.5) ... This example will create a sharded Zarr v3 dataset with a voxel size of (11.24, 11.24, 25) nm3 and a chunk size of (64,64,64) voxel."
- claim: WEBKNOSSOS documents both 0.4 and 0.5 folder structures and produces sharded Zarr v3 datasets itself (with nanometer voxel sizes).
- conditions: webknossos docs capture (data/zarr.html).
- implication: Another major producer of sharded v3 data (in addition to the challenge converter, O-047/O-018) — reinforcing O-045; nanometer units are common in the neuro data world (vs micrometer in IDM/light microscopy), so unit rendering must not assume a scale.
- open question: none.

### O-069
- source: S022 lines 1-19; S066 lines 24-26; S067 lines 4-15
- quote: "BioFile Finder is an application produced by the Allen Institute for Cell Science designed to simplify access and exploration of data ... it allows the application to be distributed both as a desktop application ... and as a web application ... Some features need to be developed across this codebase and the `file-explorer-service`."
- claim: BioFile Finder (Allen Institute) is a desktop+web data-browsing app backed by a separate local file-explorer service; ome-zarr-py integrates with it for local collection browsing (O-043).
- conditions: README/dev-docs captures.
- implication: A "browser + local service" split is an existing architectural alternative for local fileset discovery; Slide Scout's single desktop app (Plan line 5) is simpler to ship but should consciously reject/accept that pattern.
- open question: none.

### O-070
- source: S111 lines 11, 58; S113 lines 31, 78, 125
- quote: "Zarr3 C++ Read Subset Issue ... auto file = tensorstore::Open({{\"driver\", \"zarr3\"}, {\"kvstore\", {{\"driver\", \"file\"}, {\"path\", file_path}}}, {\"metadata\", ... {\"codecs\", {{{\"name\", \"blosc\"}, ..."
- claim: tensorstore (the C++ library AGAVE uses) exposes a zarr3 driver with explicit metadata/codec JSON for local reads; its issue tracker shows C++20-vs-23 friction; AGAVE vendors tensorstore v0.1.78 (S120 lines 9, 38).
- conditions: tensorstore issue #240 + comments; AGAVE build files.
- implication: For a C++ desktop implementation, tensorstore is the available zarr-v3 foundation (with build-weight cost, O-063); alternatives (zarr-python via embedded runtime, or a native minimal reader) trade off codec/shard coverage — a stack decision the thin Plan leaves open (unresolved).
- open question: none.

### O-071
- source: S028 lines 12-4596 (open-issue titles: 456, 1601-1686, 2320, 2396, 2548, 2776, 3840, 4444, 1004)
- quote: "`ome-zarr-py` does not work with auto-sharding ... What to do with consolidated metadata? ... download failing for RFC-5 CoordinateSystems group ... Improve error message of ome_zarr finder on read-only locations ... Could be useful if `io.parse_url` raises an Exception instead of returning `None` ... Using parse_url to create a store reads arrays with all zeros ... reader() is not idempotent ... Labels not loaded from cloud buckets ... Progress indication"
- claim: ome-zarr-py's open-issue list (100 most recent at capture) includes reader-side correctness/UX gaps: parse_url's None-collapse, non-idempotent reader, zero-filled reads via a creation path, consolidated-metadata uncertainty, RFC-5 group download failures, labels from buckets, finder error messages, and progress indication.
- conditions: open issues dump (state=open, per_page=100); titles only except where read earlier.
- implication: Reusing ome-zarr-py wholesale does not discharge the Plan's error-UX and discovery obligations (Plan lines 7, 11): the reference library's own tracker lists these as unsolved; Slide Scout needs its own error/discovery layer regardless of stack choice.
- open question: none.

### O-072
- source: S050 lines 1832, 1904, 1980, 2208, 2284, 2360, 2436, 2812, 3264
- quote: "Z downsampling ... Mixing channels ... Rendering issues for images in OME-ZARR v0.5 format ... Problem in reading contrast metadata ... Adding a dynamic scale bar ... 3D translation causes images to disappear ... Labels not loaded if \"omero\" block is missing ... Error changing z-plane ... Allow setting z/t plane"
- claim: vizarr's open-issue list includes: Z downsampling, v0.5 rendering (O-040), contrast-metadata reading problems, a requested dynamic scale bar (i.e., not shipped), 3D translation making images disappear, LABELS NOT LOADED when the omero block is missing, z-plane change errors, and z/t plane selection requests.
- conditions: vizarr open issues dump; titles only.
- implication: (a) "Labels not loaded if omero is missing" is a concrete counterexample proving O-009's fallback requirement — one real viewer couples label loading to unrelated omero metadata. (b) The scale bar remains unshipped in a major web viewer — Plan's calibrated display (lines 5, 11) is a real differentiator with a known failure history to test against.
- open question: none.

### O-073
- source: S035 lines 356, 1340, 2147, 2532, 2618, 2704, 3943, 432, 1903, 1989, 2799
- quote: "RFC-5 document needs updates for OME-Zarr 0.6rc0 ... 0.6rc0 schemas not served from homepage ... Do not allow `Identity` transformations in multiscale transformations ... [Issue]: semantics of a \"pixel\" ... explicitly define the original coordinate system of an array ... Label multiscales' reference to the `source.image` is broken; should label a coordinate system instead ... OMERO schema is inconsistent with description ... expand and constrain axis `unit` values (UDUNITS-2 controlled vocabulary, MUST) ... EPIC: rendering settings ... EPIC: `image-label` spec ... Should axes restrictions inside multsicales also apply to scene coordinate systems?"
- claim: The ngff repo's open issues show: 0.6rc1-era activity ("0.6rc0 schemas") is underway; identity transformations occur in real multiscales metadata (proposal to disallow); the label image-label source.image reference mechanism is considered BROKEN by spec contributors; the OMERO schema is acknowledged inconsistent with its description; axis units may become a MUST vocabulary; rendering settings and image-label are active EPICs.
- conditions: ome/ngff open issues dump; titles only.
- implication: (a) Slide Scout should tolerate identity transforms (no-op) explicitly. (b) Label overlay sourcing (Plan line 5) depends on a mechanism the spec community itself calls broken — the "../../"-default relative path (O-011) needs runtime verification with sibling/fallback search rather than trusting source.image. (c) omero display metadata is spec-internally inconsistent — another reason default-rendering fallbacks are required (O-009, O-030).
- open question: exact nature of the omero schema inconsistency (body not read).

### O-074
- source: S109 lines 15, 91, 167, 553, 1305
- quote: "Zarr3 chunking issues ... Zarr3 rectilinear chunk grid ... zarr3 shard user block / offset ... Zarr3: transpose codec followed by sharding codec error during writing ... C++ Zarr3 Resize() 3d dataset not working"
- claim: tensorstore's zarr3 driver issue history covers chunking problems, rectilinear chunk grids, shard offset handling, and codec-combination (transpose+sharding) write errors.
- conditions: search dump of tensorstore issues (zarr3 query); titles only.
- implication: Even the mature C++ zarr-v3 stack has had chunk-grid/shard edge cases; if Slide Scout builds on tensorstore, its version must be validated against sharded+codeccombination reads (O-018, O-070); "rectilinear chunk grid" appears as a real Zarr-v3-adjacent capability question.
- open question: whether rectilinear grids are legal in OME-Zarr 0.5 filesets in practice (no sample in corpus).

### O-075
- source: S070 lines 60-101, 107-159
- quote: "AGAVE Desktop application for viewing multichannel volume data powered by your GPU ... Kiln A WebGPU-native out-of-core rendering system for virtualized volumetric data ... Odon A spatial proteomics OME-Zarr viewer built in Rust. ... syGlass A VR desktop application ... with OME-Zarr streaming support. ... NGFF-Converter A desktop application for conversion of bioimage formats into OME-Zarr or OME-TIFF."
- claim: OME's own tools page lists a wide viewer ecosystem (AGAVE, FIJI family, ITKWidgets, Kiln, Microscopy Nodes, napari, Neuroglancer, Odon, QuPath, syGlass, Vitessce, Vizarr, Avivator, Vol-E, WEBKNOSSOS) plus converters (NGFF-Converter desktop app, bioformats2raw, nd2 native export, stack_to_multiscale_ngff for multi-TB stacks) and libraries.
- conditions: ngff.openmicroscopy.org/resources/tools capture.
- implication: The Plan's "interoperate with filesets from real OME-Zarr 0.5 tools" implies a producer set far wider than ome-zarr-py/bioformats2raw (NGFF-Converter is the desktop converter users actually touch, cf. O-040); fixture selection should sample it. Desktop-native 0.5 viewers exist (AGAVE, Odon, syGlass) — Slide Scout has direct comparables.
- open question: none.

### O-076
- source: S091 lines 30-44, 217-231
- quote: "\"tag_name\": \"v1.10.0\" ... agave-1.10.0-macos-arm64.dmg ... agave-1.10.0-win.exe"
- claim: AGAVE ships versioned desktop installers (macOS arm/x86, Windows) with releases at least through v1.10.0.
- conditions: agave releases dump (per_page=100).
- implication: Desktop-packaged OME-Zarr viewing is an established, maintained product category across the three major desktop platforms.
- open question: none.

### O-077
- source: S102 lines 1-6
- quote: "{ \"total_count\": 0, \"incomplete_results\": false, \"items\": [] ... }"
- claim: A search of the AGAVE tracker for "shard" returns ZERO items at capture — no issue or PR mentions sharding.
- conditions: GitHub search API dump; searches match text only.
- implication: Textual absence, not proof of capability: AGAVE either handles shards transparently via tensorstore or has not been exercised on them; no in-corpus evidence decides. Slide Scout cannot assume the desktop analog's sharding behavior is a tested reference point.
- open question: does AGAVE v1.10 open the sharded IDR 0.5 samples correctly? (untestable within this corpus.)

### O-078
- source: S057 (catalog: view_lines 1; aliases show vizarr releases, agave issue comments, tensorstore releases); S057.txt line 1
- quote: "[]"
- quote2: (entire view is an empty JSON array)
- claim: The vizarr releases list, AGAVE issue #220 comments, and tensorstore releases captures all resolved to an EMPTY JSON array — no release/comment content is in evidence for these.
- conditions: capture artifacts (empty results).
- implication: No claims may be made about vizarr release history or tensorstore release versions from this corpus; likewise AGAVE #220 had no captured comments.
- open question: none.

### O-079
- source: S015 lines 36-63
- quote: "\"name\": \"ome-zarr\" ... \"release_url\": \"https://pypi.org/project/ome-zarr/0.19.2/\" ... \"zarr>=3.0.0\" ... \"ome-zarr-models>=1.8.1\" ... \"requires_python\": \">=3.12\" ... \"version\": \"0.19.2\""
- claim: Current PyPI state: ome-zarr 0.19.2 requires zarr>=3.0.0 and ome-zarr-models>=1.8.1 on Python >=3.12 — the reference library is now zarr-v3-only and moved validation to ome-zarr-models.
- conditions: PyPI JSON API capture.
- implication: A Python-based Slide Scout on zarr v3 aligns with the ecosystem mainstream; Python version floors (3.12) and the models-library dependency are packaging constraints to plan for.
- open question: none.

### O-080
- source: S098 lines 72-77, 91-116
- quote: "+  // if it's a directory, and contains the string zarr anywhere, we assume it's a zarr ... else if (std::filesystem::is_directory(filepath)) { if (filepath.find(\"zarr\") != std::string::npos) { return new FileReaderZarr(filepath); ... FileReaderZarr::FileReaderZarr(const std::string& filepath) : m_zarrVersion(0) ... tryReadJson(const std::string& zarrurl, const std::string& jsonfile)"
- claim: AGAVE's file-type dispatch treats any directory whose PATH contains the substring "zarr" as a zarr store; its zarr reader tracks a version int and reads zarr.json via tensorstore's json driver.
- conditions: AGAVE PR #220 diff (0.5 support).
- implication: Substring-based format sniffing is a real shipped heuristic and a cautionary counterexample: a Slide Scout in a folder named ".../bizarre_images/" or a non-zarr dir containing "zarr" would be misclassified by such logic; Plan line 11's malformed-input acceptance should include misleading-name fixtures.
- open question: none.
