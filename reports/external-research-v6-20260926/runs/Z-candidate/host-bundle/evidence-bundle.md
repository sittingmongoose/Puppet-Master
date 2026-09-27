# Host-built evidence bundle (mechanical, TEST_ONLY_NEVER_PROMOTE)
Cited windows from stage1/observations.md, grouped by source, +/-8 lines of context, windows capped at 160 lines. A quote match proves only that the text exists there.
Observations parsed: 80; with no parseable citation: 0; unknown handles: none.

## S001 — sources/S001.txt (23 lines; local-capture (origin URL not recorded))

### S001 lines 1-24 — cited by O-021

```text
     1| Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims.
     2| ╭─── ⌕ Web Search: Exa 5 sources ──────────────────────────────────────────────────────────────────╮
     3| │ Query: OME-Zarr 0.5 specification zarr v3 changes multiscales coordinate                         │
     4| ├─── Answer ───────────────────────────────────────────────────────────────────────────────────────┤
     5| │ [1] N/A                                                                                          │
     6| │     https://ngff.openmicroscopy.org/specifications/0.5/index.html                                │
     7| │ [2] N/A                                                                                          │
     8| │     https://ngff.openmicroscopy.org/rfc/5/index.html                                             │
     9| │ [3] OME-Zarr specification                                                                       │
    10| │     https://ngff.openmicroscopy.org/0.5/                                                         │
    11| │ [4] Zarr v3 · Issue #206 · ome/ngff                                                              │
    12| │     https://github.com/ome/ngff/issues/206                                                       │
    13| │ [5] N/A                                                                                          │
    14| │     https://raw.githubusercontent.com/ome/ngff/v0.5/schemas/image.schema                         │
    15| ├─── Sources ──────────────────────────────────────────────────────────────────────────────────────┤
    16| │ ├─ N/A (ngff.openmicroscopy.org)                                                                 │
    17| │ ├─ N/A (ngff.openmicroscopy.org)                                                                 │
    18| │ ├─ OME-Zarr specification (ngff.openmicroscopy.org)                                              │
    19| │ ├─ Zarr v3 · Issue #206 · ome/ngff (github.com)                                                  │
    20| │ └─ N/A (raw.githubusercontent.com)                                                               │
    21| ├─── Metadata ─────────────────────────────────────────────────────────────────────────────────────┤
    22| │ Provider: Exa                                                                                    │
    23| ╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
    24| 
```

## S003 — sources/S003.txt (896 lines; https://ngff.openmicroscopy.org/0.5/; local-capture (origin URL not recorded))

### S003 lines 1-13 — cited by O-051

```text
     1| OME-Zarr specification
     2| OME-Zarr specification
     3| Final Community Group Report,
     4| 8 September 2026
     5| This version:
     6| https://ngff.openmicroscopy.org/0.5/
     7| Latest published version:
     8| https://ngff.openmicroscopy.org/0.5/
     9| Editor's Draft:
    10| https://ngff.openmicroscopy.org/0.5/
    11| Feedback:
    12| Forums
    13| GitHub
```

### S003 lines 17-35 — cited by O-001

```text
    17| OME®
    18| (U. Dundee).
    19| OME trademark rules apply.
    20| Abstract
    21| This document contains next-generation file format (NGFF)
    22| specifications for storing bioimaging data in the cloud.
    23| All specifications are submitted to the https://image.sc community for review.
    24| Status of this document
    25| The current released version of this specification is 0.5. Migration scripts
    26| will be provided between numbered versions. Data written with these latest changes
    27| (an "editor’s draft") will not necessarily be supported.
    28| Table of Contents
    29| 1 Storage format
    30| 1.1 Images
    31| 1.2 High-content screening
    32| 2 OME-Zarr Metadata
    33| 2.1 "axes" metadata
    34| 2.2 "bioformats2raw.layout" (transitional)
    35| 2.3 "coordinateTransformations" metadata
```

### S003 lines 57-80 — cited by O-002, O-014

```text
    57| The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”,
    58| “RECOMMENDED”, “MAY”, and “OPTIONAL” are to be interpreted as described in
    59| RFC 2119.
    60| Transitional metadata is added to the specification with the
    61| intention of removing it in the future. Implementations may be expected (MUST) or
    62| encouraged (SHOULD) to support the reading of the data, but writing will usually
    63| be optional (MAY). Examples of transitional metadata include custom additions by
    64| implementations that are later submitted as a formal specification. (See § 2.2 "bioformats2raw.layout" (transitional))
    65| Some of the JSON examples in this document include comments. However, these are only for
    66| clarity purposes and comments MUST NOT be included in JSON objects.
    67| 1. Storage format
    68| OME-Zarr is implemented using the Zarr format as defined by the
    69| version 3 of the Zarr specification.
    70| All features of the Zarr format including codecs, chunk grids, chunk
    71| key encodings, data types and storage transformers may be used with
    72| OME-Zarr unless explicitly disallowed in this specification.
    73| An overview of the layout of an OME-Zarr fileset should make
    74| understanding the following metadata sections easier. The hierarchy
    75| is represented here as it would appear locally but could equally
    76| be stored on a web server to be accessed via HTTP or in object storage
    77| like S3 or GCS.
    78| 1.1. Images
    79| The following layout describes the expected Zarr hierarchy for images with
    80| multiple levels of resolutions and optionally associated labels.
```

### S003 lines 110-137 — cited by O-013

```text
   110| └── original          # Intermediate folders are permitted but not necessary and currently contain no extra metadata.
   111| │
   112| └── 0             # Multiscale, labeled image. The name is unimportant but is registered in the "labels" group above.
   113| ├── zarr.json # Zarr Group which is both a multiscaled image as well as a labeled image.
   114| │             # Metadata of the related image and as well as display information under the "image-label" key.
   115| │
   116| ├── 0         # Each multiscale level is stored as a separate Zarr array, as above, but only integer values
   117| └── ...       # are supported.
   118| 1.2. High-content screening
   119| The following specification defines the hierarchy for a high-content screening
   120| dataset. Three groups MUST be defined above the images:
   121| the group above the images defines the well and MUST implement the
   122| well specification. All images contained in a well are fields
   123| of view of the same well
   124| the group above the well defines a row of wells
   125| the group above the well row defines an entire plate i.e. a two-dimensional
   126| collection of wells organized in rows and columns. It MUST implement the
   127| plate specification
   128| A well row group SHOULD NOT be present if there are no images in the well row.
   129| A well group SHOULD NOT be present if there are no images in the well.
   130| .
   131| │
   132| └── 5966.zarr                 # One OME-Zarr plate (id=5966)
   133| ├── zarr.json             # Implements "plate" specification
   134| ├── A                     # First row of the plate
   135| │   ├── zarr.json
   136| │   │
   137| │   ├── 1                 # First column of row A
```

### S003 lines 144-214 — cited by O-003, O-004, O-012

```text
   144| │   │   │   ├── ...
   145| │   │   │   └── labels    # Labels (optional)
   146| │   │   └── ...           # Other fields of view
   147| │   └── ...               # Other columns
   148| └── ...                   # Other rows
   149| 2. OME-Zarr Metadata
   150| The "OME-Zarr Metadata" contains metadata keys as specified below
   151| for discovering certain types of data, especially images.
   152| The OME-Zarr Metadata is stored in the various zarr.json files throughout the above array
   153| hierarchy. In this file, the metadata is stored under the namespaced key
   154| ome in attributes.
   155| The version of the OME-Zarr Metadata is denoted as a string in the version attribute within the ome namespace.
   156| The OME-Zarr Metadata version MUST be consistent within a hierarchy.
   157| {
   158| ...
   159| "attributes": {
   160| "ome": {
   161| "version": "0.5",
   162| ...
   163| }
   164| }
   165| }
   166| 2.1. "axes" metadata
   167| "axes" describes the dimensions of a physical coordinate space. It is a list of dictionaries, where each dictionary describes a dimension (axis) and:
   168| MUST contain the field "name" that gives the name for this dimension. The values MUST be unique across all "name" fields.
   169| SHOULD contain the field "type". It SHOULD be one of "space", "time" or "channel", but MAY take other string values for custom axis types that are not part of this specification yet.
   170| SHOULD contain the field "unit" to specify the physical unit of this dimension. The value SHOULD be one of the following strings, which are valid units according to UDUNITS-2.
   171| Units for "space" axes: angstrom, attometer, centimeter, decimeter, exameter, femtometer, foot, gigameter, hectometer, inch, kilometer, megameter, meter, micrometer, mile, millimeter, nanometer, parsec, petameter, picometer, terameter, yard, yoctometer, yottameter, zeptometer, zettameter
   172| Units for "time" axes: attosecond, centisecond, day, decisecond, exasecond, femtosecond, gigasecond, hectosecond, hour, kilosecond, megasecond, microsecond, millisecond, minute, nanosecond, petasecond, picosecond, second, terasecond, yoctosecond, yottasecond, zeptosecond, zettasecond
   173| The "axes" are used as part of § 2.4 "multiscales" metadata. The length of "axes" MUST be equal to the number of dimensions of the arrays that contain the image data.
   174| The "dimension_names" attribute MUST be included in the zarr.json of the Zarr array of a multiscale level and MUST match the names in the "axes" metadata.
   175| 2.2. "bioformats2raw.layout" (transitional)
   176| Transitional "bioformats2raw.layout" metadata identifies a group which implicitly describes a series of images.
   177| The need for the collection stems from the common "multi-image file" scenario in microscopy. Parsers like Bio-Formats
   178| define a strict, stable ordering of the images in a single container that can be used to refer to them by other tools.
   179| In order to capture that information within an OME-Zarr dataset, bioformats2raw internally introduced a wrapping layer.
   180| The bioformats2raw layout has been added to v0.4 as a transitional specification to specify filesets that already exist
   181| in the wild. An upcoming NGFF specification will replace this layout with explicit metadata.
   182| 2.2.1. Layout
   183| Typical Zarr layout produced by running bioformats2raw on a fileset that contains more than one image (series > 1):
   184| series.ome.zarr               # One converted fileset from bioformats2raw
   185| ├── zarr.json             # Contains "bioformats2raw.layout" metadata
   186| ├── OME                   # Special group for containing OME metadata
   187| │   ├── zarr.json         # Contains "series" metadata
   188| │   └── METADATA.ome.xml  # OME-XML file stored within the Zarr fileset
   189| ├── 0                     # First image in the collection
   190| ├── 1                     # Second image in the collection
   191| └── ...
   192| 2.2.2. Attributes
   193| The OME-Zarr Metadata in the top-level zarr.json file must contain the bioformats2raw.layout key:
   194| {
   195| "zarr_format": 3,
   196| "node_type": "group",
   197| "attributes": {
   198| "ome": {
   199| "version": "0.5",
   200| "bioformats2raw.layout": 3
   201| }
   202| }
   203| }
   204| If the top-level group represents a plate, the bioformats2raw.layout metadata will be present but
   205| the "plate" key MUST also be present, takes precedence and parsing of such datasets should follow § 2.7 "plate" metadata. It is not
   206| possible to mix collections of images with plates at present.
   207| {
   208| "zarr_format": 3,
   209| "node_type": "group",
   210| "attributes": {
   211| "ome": {
   212| "version": "0.5",
   213| "bioformats2raw.layout": 3,
   214| "plate": {
```

### S003 lines 253-282 — cited by O-031, O-034

```text
   253| }
   254| 2.2.3. Details
   255| Conforming groups:
   256| MUST have the value "3" for the "bioformats2raw.layout" key in their OME-Zarr Metadata in the zarr.json at the top of the hierarchy;
   257| SHOULD have OME metadata representing the entire collection of images in a file named "OME/METADATA.ome.xml" which:
   258| MUST adhere to the OME-XML specification but
   259| MUST use <MetadataOnly/> elements as opposed to <BinData/>, <BinaryOnly/> or <TiffData/>;
   260| MAY make use of the minimum specification.
   261| Additionally, the logic for finding the Zarr group for each image follows the following logic:
   262| If "plate" metadata is present, images MUST be located at the defined location.
   263| Matching "series" metadata (as described next) SHOULD be provided for tools that are unaware of the "plate" specification.
   264| If the "OME" Zarr group exists, it:
   265| MAY contain a "series" attribute. If so:
   266| "series" MUST be a list of string objects, each of which is a path to an image group.
   267| The order of the paths MUST match the order of the "Image" elements in "OME/METADATA.ome.xml" if provided.
   268| If the "series" attribute does not exist and no "plate" is present:
   269| separate "multiscales" images MUST be stored in consecutively numbered groups starting from 0 (i.e. "0/", "1/", "2/", "3/", ...).
   270| Every "multiscales" group MUST represent exactly one OME-XML "Image" in the same order as either the series index or the group numbers.
   271| Conforming readers:
   272| SHOULD make users aware of the presence of more than one image (i.e. SHOULD NOT default to only opening the first image);
   273| MAY use the "series" attribute in the "OME" group to determine a list of valid groups to display;
   274| MAY choose to show all images within the collection or offer the user a choice of images, as with HCS plates;
   275| MAY ignore other groups or arrays under the root of the hierarchy.
   276| 2.3. "coordinateTransformations" metadata
   277| "coordinateTransformations" describe a series of transformations that map between two coordinate spaces (defined by "axes").
   278| For example, to map a discrete data space of an array to the corresponding physical space.
   279| It is a list of dictionaries. Each entry describes a single transformation and MUST contain the field "type".
   280| The value of "type" MUST be one of the elements of the type column in the table below.
   281| Additional fields for the entry depend on "type" and are defined by the column fields.
   282| identity
```

### S003 lines 290-327 — cited by O-005, O-006, O-007, O-008, O-038

```text
   290| type
   291| fields
   292| description
   293| The transformations in the list are applied sequentially and in order.
   294| 2.4. "multiscales" metadata
   295| Metadata about an image can be found under the "multiscales" key in the group-level OME-Zarr Metadata.
   296| Here, image refers to 2 to 5 dimensional data representing image or volumetric data with optional time or channel axes.
   297| It is stored in a multiple resolution representation.
   298| "multiscales" contains a list of dictionaries where each entry describes a multiscale image.
   299| Each "multiscales" dictionary MUST contain the field "axes", see § 2.1 "axes" metadata.
   300| The length of "axes" must be between 2 and 5 and MUST be equal to the dimensionality of the zarr arrays storing the image data (see "datasets:path").
   301| The "axes" MUST contain 2 or 3 entries of "type:space" and MAY contain one additional entry of "type:time" and MAY contain one additional entry of "type:channel" or a null / custom type.
   302| The order of the entries MUST correspond to the order of dimensions of the zarr arrays. In addition, the entries MUST be ordered by "type" where the "time" axis must come first (if present), followed by the  "channel" or custom axis (if present) and the axes of type "space".
   303| If there are three spatial axes where two correspond to the image plane ("yx") and images are stacked along the other (anisotropic) axis ("z"), the spatial axes SHOULD be ordered as "zyx".
   304| Each "multiscales" dictionary MUST contain the field "datasets", which is a list of dictionaries describing the arrays storing the individual resolution levels.
   305| Each dictionary in "datasets" MUST contain the field "path", whose value contains the path to the array for this resolution relative
   306| to the current zarr group. The "path"s MUST be ordered from largest (i.e. highest resolution) to smallest.
   307| Each "datasets" dictionary MUST have the same number of dimensions and MUST NOT have more than 5 dimensions. The number of dimensions and order MUST correspond to number and order of "axes".
   308| Each dictionary in "datasets" MUST contain the field "coordinateTransformations", which contains a list of transformations that map the data coordinates to the physical coordinates (as specified by "axes") for this resolution level.
   309| The transformations are defined according to § 2.3 "coordinateTransformations" metadata. The transformation MUST only be of type translation or scale.
   310| They MUST contain exactly one scale transformation that specifies the pixel size in physical units or time duration. If scaling information is not available or applicable for one of the axes, the value MUST express the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0 if there is no downsampling along the axis.
   311| It MAY contain exactly one translation that specifies the offset from the origin in physical units. If translation is given it MUST be listed after scale to ensure that it is given in physical coordinates.
   312| The length of the scale and translation array MUST be the same as the length of "axes".
   313| The requirements (only scale and translation, restrictions on order) are in place to provide a simple mapping from data coordinates to physical coordinates while being compatible with the general transformation spec.
   314| Each "multiscales" dictionary MAY contain the field "coordinateTransformations", describing transformations that are applied to all resolution levels in the same manner.
   315| The transformations MUST follow the same rules about allowed types, order, etc. as in "datasets:coordinateTransformations" and are applied after them.
   316| They can for example be used to specify the scale for a dimension that is the same for all resolutions.
   317| Each "multiscales" dictionary SHOULD contain the field "name".
   318| Each "multiscales" dictionary SHOULD contain the field "type", which gives the type of downscaling method used to generate the multiscale image pyramid.
   319| It SHOULD contain the field "metadata", which contains a dictionary with additional information about the downscaling method.
   320| {
   321| "zarr_format": 3,
   322| "node_type": "group",
   323| "attributes": {
   324| "ome": {
   325| "version": "0.5",
   326| "multiscales": [
   327| {
```

### S003 lines 390-482 — cited by O-009, O-010, O-011, O-038

```text
   390| datasets = []
   391| for named in multiscales:
   392| if named["name"] == "3D":
   393| datasets = [x["path"] for x in named["datasets"]]
   394| break
   395| if not datasets:
   396| # Use the first by default. Or perhaps choose based on chunk size.
   397| datasets = [x["path"] for x in multiscales[0]["datasets"]]
   398| 2.5. "omero" metadata (transitional)
   399| Transitional information specific to the channels of an image and how to render it
   400| can be found under the "omero" key in the group-level metadata:
   401| "id": 1,                              # ID in OMERO
   402| "name": "example.tif",                # Name as shown in the UI
   403| "channels": [                         # Array matching the c dimension size
   404| {
   405| "active": true,
   406| "coefficient": 1,
   407| "color": "0000FF",
   408| "family": "linear",
   409| "inverted": false,
   410| "label": "LaminB1",
   411| "window": {
   412| "end": 1500,
   413| "max": 65535,
   414| "min": 0,
   415| "start": 0
   416| }
   417| }
   418| ],
   419| "rdefs": {
   420| "defaultT": 0,                    # First timepoint to show the user
   421| "defaultZ": 118,                  # First Z section to show the user
   422| "model": "color"                  # "color" or "greyscale"
   423| }
   424| See the OMERO WebGateway documentation
   425| for more information.
   426| The "omero" metadata is optional, but if present it MUST contain the field "channels", which is an array of dictionaries describing the channels of the image.
   427| Each dictionary in "channels" MUST contain the field "color", which is a string of 6 hexadecimal digits specifying the color of the channel in RGB format.
   428| Each dictionary in "channels" MUST contain the field "window", which is a dictionary describing the windowing of the channel.
   429| The field "window" MUST contain the fields "min" and "max", which are the minimum and maximum values of the window, respectively.
   430| It MUST also contain the fields "start" and "end", which are the start and end values of the window, respectively.
   431| 2.6. "labels" metadata
   432| In OME-Zarr, Zarr arrays representing pixel-annotation data are stored in a group called "labels". Some applications--notably image segmentation--produce
   433| a new image that is in the same coordinate system as a corresponding multiscale image (usually having the same dimensions and coordinate transformations).
   434| This new image is composed of integer values corresponding to certain labels with custom meanings. For example, pixels take the value 1 or 0
   435| if the corresponding pixel in the original image represents cellular space or intercellular space, respectively.
   436| Such an image is referred to in this specification as a 'label image'.
   437| The "labels" group is nested within an image group, at the same level of the Zarr hierarchy as the resolution levels for the original image.
   438| The "labels" group is not itself an image; it contains images. The pixels of the label images MUST be integer data types, i.e. one of
   439| [uint8, int8, uint16, int16, uint32, int32, uint64, int64]. Intermediate groups between "labels" and the images within it are allowed,
   440| but these MUST NOT contain metadata. Names of the images in the "labels" group are arbitrary.
   441| The OME-Zarr Metadata in the zarr.json file associated with the "labels" group MUST contain a JSON object with the key labels, whose value is a JSON array of paths to the
   442| labeled multiscale image(s). All label images SHOULD be listed within this metadata file. For example:
   443| {
   444| ...
   445| "attributes": {
   446| "ome": {
   447| "version": "0.5",
   448| "labels": [
   449| "cell_space_segmentation"
   450| ]
   451| }
   452| }
   453| }
   454| The zarr.json file for the label image MUST implement the multiscales specification. Within the multiscales object, the JSON array
   455| associated with the datasets key MUST have the same number of entries (scale levels) as the original unlabeled image.
   456| In addition to the multiscales key, the OME-Zarr Metadata in this image-level zarr.json file SHOULD contain another key, image-label,
   457| whose value is also a JSON object. The image-label object stores information about the display colors, source image, and optionally,
   458| further arbitrary properties of the label image. That image-label object SHOULD contain the following keys: first, a colors key,
   459| whose value MUST be a JSON array describing color information for the unique label values. Second, a version key, whose value MUST be a
   460| string specifying the version of the OME-Zarr image-label schema.
   461| Conforming readers SHOULD display labels using the colors specified by the colors JSON array, as follows. This array contains one
   462| JSON object for each unique custom label. Each of these objects MUST contain the label-value key, whose value MUST be the integer
   463| corresponding to a particular label. In addition to the label-value key, the objects in this array MAY contain an rgba key whose
   464| value MUST be an array of four integers between 0 and 255, inclusive. These integers represent the uint8 values of red, green, and
   465| blue that comprise the final color to be displayed at the pixels with this label. The fourth integer in the rgba array represents alpha,
   466| or the opacity of the color. Additional keys under colors are allowed.
   467| Next, the image-label object MAY contain the following keys: a properties key, and a source key.
   468| Like the colors key, the value of the properties key MUST be an array of JSON objects describing the set of unique possible pixel values.
   469| Each object in the properties array MUST contain the label-value key, whose value again MUST be an integer specifying the pixel value for that label.
   470| Additionally, an arbitrary number of key-value pairs MAY be present for each label value, denoting arbitrary metadata associated with that label.
   471| Label-value objects within the properties array do not need to have the same keys.
   472| The value of the source key MUST be a JSON object containing information about the original image from which the label image derives.
   473| This object MAY include a key image, whose value MUST be a string specifying the relative path to a Zarr image group.
   474| The default value is ../../ since most labeled images are stored in a "labels" group that is nested within the original image group.
   475| Here is an example of a simple image-label object for a label image in which 0s and 1s represent intercellular and cellular space, respectively:
   476| {
   477| "zarr_format": 3,
   478| "node_type": "group",
   479| "attributes": {
   480| "ome": {
   481| "version": "0.5",
   482| "image-label": {
```

### S003 lines 507-568 — cited by O-013, O-019

```text
   507| "image": "../../"
   508| }
   509| }
   510| }
   511| }
   512| }
   513| In this case, the pixels consisting of a 0 in the Zarr array will be displayed as 50% blue and 50% opacity. Pixels with a 1 in the Zarr array,
   514| which correspond to cellular space, will be displayed as 50% green and 50% opacity.
   515| 2.7. "plate" metadata
   516| For high-content screening datasets, the plate layout can be found under the
   517| custom attributes of the plate group under the plate key in the group-level metadata.
   518| The plate dictionary MAY contain an acquisitions key whose value MUST be a list of
   519| JSON objects defining the acquisitions for a given plate to which wells can refer to. Each
   520| acquisition object MUST contain an id key whose value MUST be an unique integer identifier
   521| greater than or equal to 0 within the context of the plate to which fields of view can refer
   522| to (see #well-md).
   523| Each acquisition object SHOULD contain a name key whose value MUST be a string identifying
   524| the name of the acquisition. Each acquisition object SHOULD contain a maximumfieldcount
   525| key whose value MUST be a positive integer indicating the maximum number of fields of view for the
   526| acquisition. Each acquisition object MAY contain a description key whose value MUST be a
   527| string specifying a description for the acquisition. Each acquisition object MAY contain
   528| a starttime and/or endtime key whose values MUST be integer epoch timestamps specifying
   529| the start and/or end timestamp of the acquisition.
   530| The plate dictionary MUST contain a columns key whose value MUST be a list of JSON objects
   531| defining the columns of the plate. Each column object defines the properties of
   532| the column at the index of the object in the list. Each column in the physical plate
   533| MUST be defined, even if no wells in the column are defined. Each column object MUST
   534| contain a name key whose value is a string specifying the column name. The name MUST
   535| contain only alphanumeric characters, MUST be case-sensitive, and MUST NOT be a duplicate of any
   536| other name in the columns list. Care SHOULD be taken to avoid collisions on
   537| case-insensitive filesystems (e.g. avoid using both Aa and aA).
   538| The plate dictionary SHOULD contain a field_count key whose value MUST be a positive integer
   539| defining the maximum number of fields per view across all wells.
   540| The plate dictionary SHOULD contain a name key whose value MUST be a string defining the
   541| name of the plate.
   542| The plate dictionary MUST contain a rows key whose value MUST be a list of JSON objects
   543| defining the rows of the plate. Each row object defines the properties of
   544| the row at the index of the object in the list. Each row in the physical plate
   545| MUST be defined, even if no wells in the row are defined. Each defined row MUST
   546| contain a name key whose value MUST be a string defining the row name. The name MUST
   547| contain only alphanumeric characters, MUST be case-sensitive, and MUST NOT be a duplicate of any
   548| other name in the rows list. Care SHOULD be taken to avoid collisions on
   549| case-insensitive filesystems (e.g. avoid using both Aa and aA).
   550| The plate dictionary MUST contain a version key whose value MUST be a string specifying the
   551| version of the plate specification.
   552| The plate dictionary MUST contain a wells key whose value MUST be a list of JSON objects
   553| defining the wells of the plate. Each well object MUST contain a path key whose value MUST
   554| be a string specifying the path to the well subgroup. The path MUST consist of a name in
   555| the rows list, a file separator (/), and a name from the columns list, in that order.
   556| The path MUST NOT contain additional leading or trailing directories.
   557| Each well object MUST contain both a rowIndex key whose value MUST be an integer identifying
   558| the index into the rows list and a columnIndex key whose value MUST be an integer identifying
   559| the index into the columns list. rowIndex and columnIndex MUST be 0-based. The
   560| rowIndex, columnIndex, and path MUST all refer to the same row/column pair.
   561| For example the following JSON object defines a plate with two acquisitions and
   562| 6 wells (2 rows and 3 columns), containing up to 2 fields of view per acquisition.
   563| {
   564| "zarr_format": 3,
   565| "node_type": "group",
   566| "attributes": {
   567| "ome": {
   568| "version": "0.5",
```

### S003 lines 801-835 — cited by O-004, O-015

```text
   801| "acquisition": 3,
   802| "path": "1"
   803| }
   804| ]
   805| }
   806| }
   807| }
   808| }
   809| 3. Specification naming style
   810| Multi-word keys in this specification should use the camelCase style.
   811| NB: some parts of the specification don’t obey this convention as they
   812| were added before this was adopted, but they should be updated in due course.
   813| 4. Implementations
   814| See Tools.
   815| 5. Citing
   816| Next-generation file format (NGFF) specifications for storing bioimaging data in the cloud.
   817| J. Moore, et al. Open Microscopy Environment Consortium, 8 February 2022.
   818| This edition of the specification is https://ngff.openmicroscopy.org/0.5/.
   819| The latest edition is available at https://ngff.openmicroscopy.org/latest/.
   820| (doi:10.5281/zenodo.4282107)
   821| 6. Version History
   822| Revision
   823| Date
   824| Description
   825| 0.5.2
   826| 2025-01-10
   827| Clarify that the dimension_names field in axes MUST be included.
   828| 0.5.1
   829| 2025-01-10
   830| Re-add the improved omero description in PR-191.
   831| 0.5.0
   832| 2024-11-21
   833| use Zarr v3 in OME-Zarr, see RFC-2.
   834| 0.4.1
   835| 2023-02-09
```

## S004 — sources/S004.txt (630 lines; https://github.com/ome/ngff/issues/206)

### S004 lines 141-166 — cited by O-038

```text
   141| •
   142| edited
   143| Loading
   144| Uh oh!
   145| There was an error while loading. Please reload this page.
   146| Copy link
   147| Copy Markdown
   148| Contributor
   149| This PR proposes to adopt the version 3 of the Zarr format for OME-Zarr.
   150| Main changes:
   151| Only Zarr v3 is allowed for upcoming versions of OME-Zarr.
   152| Zarr v3 stores its metadata in zarr.json files. This is the same for arrays and groups. Attributes are now stored in a attributes object within the zarr.json files.
   153| The chunk_key_encoding of the Zarr arrays are respected instead of mandating the / dimension separator. Basically all Zarr features are available in OME-Zarr as they get approved through the ZEP process.
   154| Add a ome namespace within the zarr.json attributes.
   155| Move version fields from multiscale, plate, well etc. up into the ome object.
   156| Move the registration of labels from the labels group into the multiscale group.
   157| Rename the document to OME-Zarr specification
   158| This PR is currently in a draft status and builds upon the #138 PR by @bogovicj.
   159| Check this link for a more convenient review: https://github.com/ome/ngff/pull/206/files/b92f540dc95440f2d6b7012185b09c2b862aa744..HEAD
   160| Sorry, something went wrong.
   161| Uh oh!
   162| There was an error while loading. Please reload this page.
   163| 🚀
   164| 4
   165| bogovicj, jluethi, jstriebel, and aliddell reacted with rocket emoji
   166| All reactions
```

## S005 — sources/S005.txt (1 lines; local-capture (origin URL not recorded))

### S005 lines 1-1 — cited by O-022

```text
     1| ValueError: Clone exceeded 256 MiB or 120 second cap; partial clone retained, not admitted
```

## S007 — sources/S007.txt (1 lines; local-capture (origin URL not recorded))

### S007 lines 1-1 — cited by O-022

```text
     1| HTTPError: HTTP Error 403: Forbidden
```

## S008 — sources/S008.txt (588 lines; https://github.com/ome/ome-zarr-py/pull/404)

### S008 lines 141-171 — cited by O-041

```text
   141| •
   142| edited
   143| Loading
   144| Uh oh!
   145| There was an error while loading. Please reload this page.
   146| Copy link
   147| Copy Markdown
   148| Member
   149| This updates ome-zarr-py to use zarr-python v3 but doesn't include support for writing Zarr v3 (OME-Zarr v0.5).
   150| However, it does add support for reading OME-Zarr v0.5 (e.g. for use by napari-ome-zarr).
   151| To test:
   152| Install from this branch: $ cd ome-zarr-py && pip install -e .  and update zarr to v3.0.8 $ pip install -U zarr.
   153| See the changes in docs/source/python.rst for changes needed for writing methods (need to specify v0.4 since we don't support writing the latest OME-Zarr v0.5 version).
   154| Try reading v0.5 data in napari:
   155| install napari
   156| $ pip install napari-ome-zarr
   157| Install this branch and update zarr as above if necessary
   158| Then try various v0.5 examples from e.g. https://idr.github.io/ome-ngff-samples/ or https://ome.github.io/ome2024-ngff-challenge/ (click on thumbnail and copy the url field in the popup. NB: if the image is bioformats2raw layout, you'll need to add /0 to the zarr url. If in doubt, open in Validator first.
   159| Most of the IDR samples there are plates. E.g:
   160| $ napari --plugin napari-ome-zarr https://uk1s3.embassy.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0011/Plate4-TS-Blue-B.ome.zarr
   161| In several places I've hard-coded zarr_version=2. This works because you can do zarr.open_group(store=self.__store, path="/", zarr_version=2) in parse_url() to create a group to write into, or find a group to read from without specifying whether you expect the group to already exist.
   162| Without the zarr_version=2, zarr will create zarr.json if the mode of the store is w.
   163| NB: I have another PR (in progress) to add support for writing OME-Zarr v0.5 at #413
   164| Sorry, something went wrong.
   165| Uh oh!
   166| There was an error while loading. Please reload this page.
   167| All reactions
   168| will-moore
   169| and others
   170| added 11 commits
   171| October 26, 2024 23:03
```

## S009 — sources/S009.txt (97 lines; ome/ome-zarr-py:)

### S009 lines 13-39 — cited by O-037

```text
    13| LICENSE
    14| MANIFEST.in
    15| README.rst
    16| codecov.yml
    17| docs/Makefile
    18| docs/make.bat
    19| docs/requirements.txt
    20| docs/source/_toc.yml
    21| docs/source/advanced/build_custom_pyramid.ipynb
    22| docs/source/advanced/labels/adding_labels.ipynb
    23| docs/source/advanced/labels/index.md
    24| docs/source/advanced/labels/labels_metadata.ipynb
    25| docs/source/advanced/sharding.ipynb
    26| docs/source/advanced/transforms/add_transforms_to_multiscales.ipynb
    27| docs/source/advanced/transforms/create_scenes.ipynb
    28| docs/source/advanced/transforms/imgs/rotated_multiscales.png
    29| docs/source/advanced/transforms/index.md
    30| docs/source/advanced/transforms/reading_scenes.ipynb
    31| docs/source/advanced/transforms/scene_2d_to_3d.ipynb
    32| docs/source/advanced/write_hcs_plate.ipynb
    33| docs/source/api.md
    34| docs/source/api/classes.rst
    35| docs/source/api/cli.rst
    36| docs/source/api/csv.rst
    37| docs/source/api/data.rst
    38| docs/source/api/format.rst
    39| docs/source/api/io.rst
```

## S010 — sources/S010.txt (1160 lines; https://idr.github.io/ome-ngff-samples/)

### S010 lines 1018-1151 — cited by O-046

```text
  1018| MMStack_Pos9.ome.zarr
  1019| 2048
  1020| 2048
  1021| 6
  1022| 4
  1023| XYZC
  1024| CC BY 4.0
  1025| idr0138
  1026| 2026-05-12
  1027| 0.5
  1028| 76-45.ome.zarr
  1029| 520
  1030| 1
  1031| 2
  1032| 1
  1033| XYZCT
  1034| 384
  1035| 1
  1036| CC BY 4.0
  1037| idr0010
  1038| 2024-11-21
  1039| 0.5
  1040| 190129.zarr
  1041| 2048
  1042| 2044
  1043| 31
  1044| 5
  1045| XYZC
  1046| 49
  1047| 32
  1048| CC BY 4.0
  1049| idr0090
  1050| 2024-11-21
  1051| 0.5
  1052| ExpD_chicken_embryo_MIP.ome.zarr
  1053| 6510
  1054| 8978
  1055| XY
  1056| CC BY 4.0
  1057| idr0066
  1058| 2024-11-21
  1059| 0.5
  1060| ExpA_VIP_ASLM_on.zarr
  1061| 2048
  1062| 2048
  1063| 1937
  1064| XYZ
  1065| CC BY 4.0
  1066| idr0066
  1067| 2024-11-21
  1068| 0.5
  1069| 6001240_labels.zarr
  1070| 271
  1071| 275
  1072| 236
  1073| 2
  1074| XYZC
  1075| CC BY 4.0
  1076| idr0062
  1077| 2024-11-21
  1078| 0.5
  1079| IMG_1033-1112 Asterella gracilis (Mannia gracilis) stature.ome.zarr
  1080| 8192
  1081| 5464
  1082| 80
  1083| 3
  1084| 1
  1085| XYZCT
  1086| CC BY 4.0
  1087| idr0157
  1088| 2024-11-21
  1089| 0.5
  1090| 180712_H2B_22ss_Courtney1_20180712-163837_p00_c00_preview.zarr
  1091| 333
  1092| 333
  1093| 201
  1094| 1
  1095| 79
  1096| XYZCT
  1097| bioformats2raw.layout
  1098| CC BY 4.0
  1099| idr0051
  1100| 2024-11-21
  1101| 0.5
  1102| 3.66.9-6.141020_15-41-29.00.ome.zarr
  1103| 507
  1104| 507
  1105| 21
  1106| 3
  1107| 47
  1108| XYZCT
  1109| bioformats2raw.layout
  1110| CC BY 4.0
  1111| idr0026
  1112| 2024-11-21
  1113| 0.5
  1114| 9822152.zarr
  1115| 144384
  1116| 93184
  1117| 1
  1118| 1
  1119| 1
  1120| XYZCT
  1121| CC BY 4.0
  1122| idr0083
  1123| 2024-11-21
  1124| 0.5
  1125| BR00109990_C2.zarr
  1126| 2080
  1127| 1552
  1128| 5
  1129| XYC
  1130| bioformats2raw.layout (9 images)
  1131| CC BY 4.0
  1132| idr0033
  1133| 2025-09-22
  1134| 0.4
  1135| idr0079_images.zarr
  1136| 1584
  1137| 788
  1138| 142
  1139| 2
  1140| bioformats2raw.layout labels (0)
  1141| CC BY 4.0
  1142| idr0079
  1143| 2025-09-22
  1144| Download Options
  1145| ×
  1146| HTTPS URL:
  1147| Copy
  1148| ome-zarr CLI Command:
  1149| Copy
  1150| AWS CLI Command:
  1151| Copy
```

## S011 — sources/S011.txt (212 lines; https://github.com/ome/napari-ome-zarr/issues/139)

### S011 lines 133-185 — cited by O-039

```text
   133| Closed
   134| Zarr v3 compatibility and scale metadata reading in napari 0.6.6#139
   135| #141
   136| Copy link
   137| Description
   138| derekthirstrup
   139| opened on Dec 11, 2025
   140| Issue body actions
   141| Summary
   142| I'm facing a dependency conflict between napari-ome-zarr, bioio-ome-zarr, and zarr versions, and I'm looking for guidance on the best path forward.
   143| Environment
   144| napari: 0.6.6
   145| napari-ome-zarr: 0.6.1
   146| bioio-ome-zarr: 3.2.0
   147| zarr: 3.1.5 (upgraded from 2.18.7)
   148| ome-zarr: 0.10.3
   149| Platform: Windows
   150| The Problem
   151| I upgraded to bioio-ome-zarr==3.2.0 to get support for both reading and writing OME-Zarr v2 (NGFF 0.4) and v3 (NGFF 0.5) formats. This required upgrading to zarr>=3.0.
   152| However, napari-ome-zarr depends on ome-zarr, which is pinned to zarr<3. When loading OME-Zarr files in napari, I now get:
   153| RuntimeError: Failed to import command at 'napari_ome_zarr._reader:napari_get_reader':
   154| cannot import name 'FSStore' from 'zarr.storage'
   155| This creates an unsolvable dependency conflict:
   156| bioio-ome-zarr 3.x requires zarr >= 3.0
   157| napari-ome-zarr → ome-zarr requires zarr < 3.0
   158| Additional Issue: Scale Metadata
   159| The default napari reader (without napari-ome-zarr plugin) does not correctly read OME-Zarr coordinate transformations/scale metadata, resulting in incorrect anisotropic volume rendering. The voxel scales from coordinateTransformations in the multiscales metadata are not applied.
   160| Questions
   161| What is the recommended path forward?
   162| Revert to zarr==2.18.7 and bioio-ome-zarr==2.3.0 (losing zarr v3 write support)
   163| Install from PR #123 which drops the ome-zarr dependency and uses zarr v3 directly
   164| Wait for an official release with zarr v3 support
   165| Is PR #123 stable enough for production use? It looks like exactly what's needed - removes the ome-zarr dependency and uses zarr>=3.0.8 directly.
   166| Timeline for zarr v3 support? Is there a planned release that will include PR #123 or similar zarr v3 compatibility?
   167| Writer compatibility: I'm using a custom OME-Zarr writer (based on raw zarr + manual NGFF metadata).
   168| Is there a recommended writer that:
   169| Supports both zarr v2 and v3 output formats
   170| Produces files that work correctly with napari-ome-zarr (proper scale/voxel size handling)
   171| Works with zarr-python 3.x
   172| Current Workaround Options:
   173| Option	                                Pros	                                                                                                        Cons
   174| Downgrade to zarr 2.x	        Stable, napari-ome-zarr works	                                                        Lose bioio-ome-zarr 3.x features
   175| Install PR #123	                Zarr v3 support, no ome-zarr dep	                                                        Unreleased, may have issues
   176| Uninstall napari-ome-zarr	bioio-ome-zarr 3.x works for file I/O but not napari reading	                Lose proper scale metadata in napari
   177| Any guidance on optimal solution would be appreciated.
   178| Reactions are currently unavailable
   179| Activity
   180| Sign up for free to join this conversation on GitHub. Already have an account? Sign in to comment
   181| Metadata
   182| Metadata
   183| Assignees
   184| No one assigned
   185| Labels
```

## S012 — sources/S012.txt (24 lines; local-capture (origin URL not recorded))

### S012 lines 1-25 — cited by O-021

```text
     1| Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims.
     2| ╭─── ⌕ Web Search: Exa 5 sources ──────────────────────────────────────────────────────────────────╮
     3| │ Query: vizarr OME-Zarr 0.5 zarr v3 support                                                       │
     4| ├─── Answer ───────────────────────────────────────────────────────────────────────────────────────┤
     5| │ [1] hms-dbmi/vizarr                                                                              │
     6| │     https://github.com/hms-dbmi/vizarr/                                                          │
     7| │ [2] Rendering issues for images in OME-ZARR v0.5 format · Issue #307 · hms-dbmi/vizarr           │
     8| │     https://github.com/hms-dbmi/vizarr/issues/307                                                │
     9| │ [3] README.md at main · hms-dbmi/vizarr                                                          │
    10| │     https://github.com/hms-dbmi/vizarr/blob/main/README.md                                       │
    11| │ [4] Zarr v3                                                                                      │
    12| │     https://github.com/ome/ome-zarr-py/pull/404                                                  │
    13| │ [5] RFC-2: Zarr v3 — NGFF documentation                                                          │
    14| │     https://ngff.openmicroscopy.org/rfc/2/                                                       │
    15| ├─── Sources ──────────────────────────────────────────────────────────────────────────────────────┤
    16| │ ├─ hms-dbmi/vizarr (github.com)                                                                  │
    17| │ ├─ Rendering issues for images in OME-ZARR v0.5 format · Issue #307 · hms-dbmi/viza…             │
    18| │ (github.com)                                                                                     │
    19| │ ├─ README.md at main · hms-dbmi/vizarr (github.com)                                              │
    20| │ ├─ Zarr v3 (github.com)                                                                          │
    21| │ └─ RFC-2: Zarr v3 — NGFF documentation (ngff.openmicroscopy.org)                                 │
    22| ├─── Metadata ─────────────────────────────────────────────────────────────────────────────────────┤
    23| │ Provider: Exa                                                                                    │
    24| ╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
    25| 
```

## S013 — sources/S013.txt (613 lines; https://github.com/ome/ome-zarr-py/pull/413)

### S013 lines 118-139 — cited by O-042

```text
   118| Additional navigation options
   119| Code
   120| Issues
   121| Pull requests
   122| Actions
   123| Projects
   124| Security and quality
   125| Insights
   126| Ome zarr v0.5 reading and writing - #413#413
   127| Merged
   128| joshmoore merged 91 commits into
   129| ome:masterome/ome-zarr-py:masterfrom
   130| will-moore:ome-zarr-v0.5_writingwill-moore/ome-zarr-py:ome-zarr-v0.5_writingCopy head branch name to clipboard
   131| Aug 7, 2025
   132| ConversationCommits91 (91)ChecksFiles changed
   133| Merged
   134| Ome zarr v0.5 reading and writing#413
   135| joshmoore merged 91 commits into
   136| ome:masterome/ome-zarr-py:masterfrom
   137| will-moore:ome-zarr-v0.5_writingwill-moore/ome-zarr-py:ome-zarr-v0.5_writingCopy head branch name to clipboard
   138| Conversation
   139| will-moore
```

## S014 — sources/S014.txt (178 lines; https://github.com/hms-dbmi/vizarr/issues/307)

### S014 lines 128-151 — cited by O-040

```text
   128| Copy link
   129| New issue
   130| Copy link
   131| Open
   132| Open
   133| Rendering issues for images in OME-ZARR v0.5 format#307
   134| Copy link
   135| Description
   136| ralfox
   137| opened on Oct 8, 2025
   138| Issue body actions
   139| Viewing a 3-channel image (unit16). No well definitions. Using group 0 in bioformats2raw Zarr layout.
   140| Vizarr works as expected for the image in OME-ZARR v0.4 format (written by NGFF-Converter):
   141| Vizarr renders chunks repetitively for image data converted into OME-ZARR v0.5 format, using the resave command of https://github.com/ome/ome2024-ngff-challenge
   142| Browser: Firefox 143.0.4
   143| Same behaviour with Chromium
   144| Reactions are currently unavailable
   145| Activity
   146| Sign up for free to join this conversation on GitHub. Already have an account? Sign in to comment
   147| Metadata
   148| Metadata
   149| Assignees
   150| No one assigned
   151| Labels
```

## S015 — sources/S015.txt (3164 lines; https://pypi.org/pypi/ome-zarr/json)

### S015 lines 28-71 — cited by O-079

```text
    28|   "keywords": null,
    29|   "license": null,
    30|   "license_expression": "BSD-2-Clause",
    31|   "license_files": [
    32|    "LICENSE"
    33|   ],
    34|   "maintainer": null,
    35|   "maintainer_email": null,
    36|   "name": "ome-zarr",
    37|   "package_url": "https://pypi.org/project/ome-zarr/",
    38|   "platform": null,
    39|   "project_url": "https://pypi.org/project/ome-zarr/",
    40|   "project_urls": {
    41|    "Changelog": "https://github.com/ome/ome-zarr-py/blob/master/CHANGELOG.md",
    42|    "Documentation": "https://ome-zarr.readthedocs.io",
    43|    "Repository": "https://github.com/ome/ome-zarr-py"
    44|   },
    45|   "provides_extra": null,
    46|   "release_url": "https://pypi.org/project/ome-zarr/0.19.2/",
    47|   "requires_dist": [
    48|    "numpy",
    49|    "dask!=2025.12.*,!=2026.1.*,!=2026.2.*,>=2025.2.0",
    50|    "zarr>=3.0.0",
    51|    "fsspec[s3]!=2021.07.0,!=2023.9.0,>=0.8",
    52|    "aiohttp",
    53|    "requests",
    54|    "scikit-image>=0.19.0",
    55|    "toolz",
    56|    "rangehttpserver",
    57|    "transformnd<0.8.0,>=0.6.0",
    58|    "ome-zarr-models>=1.8.1",
    59|    "Deprecated"
    60|   ],
    61|   "requires_python": ">=3.12",
    62|   "summary": "Implementation of images in Zarr files.",
    63|   "version": "0.19.2",
    64|   "yanked": false,
    65|   "yanked_reason": null
    66|  },
    67|  "last_serial": 40869015,
    68|  "ownership": {
    69|   "organization": null,
    70|   "roles": [
    71|    {
```

## S016 — sources/S016.txt (387 lines; ome/ome-zarr-py:ome_zarr/format.py)

### S016 lines 27-54 — cited by O-026

```text
    27|     """
    28|     yield FormatV05()
    29|     yield FormatV04()
    30|     yield FormatV03()
    31|     yield FormatV02()
    32|     yield FormatV01()
    33| 
    34| 
    35| def detect_format(metadata: dict, default: "Format") -> "Format":
    36|     """
    37|     Give each format implementation a chance to take ownership of the
    38|     given metadata. If none matches, the default value will be returned.
    39|     """
    40| 
    41|     if metadata:
    42|         for fmt in format_implementations():
    43|             if fmt.matches(metadata):
    44|                 return fmt
    45| 
    46|     return default
    47| 
    48| 
    49| class Format(ABC):
    50|     """
    51|     Abstract base class for format implementations.
    52|     """
    53| 
    54|     @property
```

### S016 lines 268-388 — cited by O-025, O-027, O-028

```text
   268|             raise ValueError("%s is not defined in the plate rows", row)
   269|         if well["rowIndex"] != rows.index(row):
   270|             raise ValueError("Mismatching row index for %s", well)
   271|         if column not in columns:
   272|             raise ValueError("%s is not defined in the plate columns", column)
   273|         if well["columnIndex"] != columns.index(column):
   274|             raise ValueError("Mismatching column index for %s", well)
   275| 
   276|     def generate_coordinate_transformations(
   277|         self, shapes: list[tuple]
   278|     ) -> list[list[dict[str, Any]]] | None:
   279|         data_shape = shapes[0]
   280|         scale0 = [1.0] * len(data_shape)
   281|         coordinate_transformations: list[list[dict[str, Any]]] = []
   282|         # calculate minimal 'scale' transform based on pyramid dims
   283|         for shape in shapes:
   284|             assert len(shape) == len(data_shape)
   285|             scale = [full / level for full, level in zip(data_shape, shape)]
   286|             trans = [s / 2 - s0 / 2 for s, s0 in zip(scale, scale0)]
   287|             coordinate_transformations.append(
   288|                 [
   289|                     {"type": "scale", "scale": scale},
   290|                     {"type": "translation", "translation": trans},
   291|                 ]
   292|             )
   293| 
   294|         return coordinate_transformations
   295| 
   296|     def validate_coordinate_transformations(
   297|         self,
   298|         ndim: int,
   299|         nlevels: int,
   300|         coordinate_transformations: list[list[dict[str, Any]]] | None = None,
   301|     ) -> None:
   302|         """
   303|         Validates that a list of dicts contains a 'scale' transformation
   304| 
   305|         Raises ValueError if no 'scale' found or doesn't match ndim.
   306| 
   307|         :param ndim: Number of image dimensions.
   308|         """
   309| 
   310|         if coordinate_transformations is None:
   311|             raise ValueError("coordinate_transformations must be provided")
   312|         ct_count = len(coordinate_transformations)
   313|         if ct_count != nlevels:
   314|             raise ValueError(
   315|                 f"coordinate_transformations count: {ct_count} must match "
   316|                 f"datasets {nlevels}"
   317|             )
   318|         for transformations in coordinate_transformations:
   319|             assert isinstance(transformations, list)
   320|             types = [t.get("type", None) for t in transformations]
   321|             if any(t is None for t in types):
   322|                 raise ValueError(f"Missing type in: {transformations}")
   323|             # validate scales...
   324|             if sum(t == "scale" for t in types) != 1:
   325|                 raise ValueError(
   326|                     "Must supply 1 'scale' item in coordinate_transformations"
   327|                 )
   328|             # first transformation must be scale
   329|             if types[0] != "scale":
   330|                 raise ValueError("First coordinate_transformations must be 'scale'")
   331|             first = transformations[0]
   332|             if "scale" not in transformations[0]:
   333|                 raise ValueError(f"Missing scale argument in: {first}")
   334|             scale = first["scale"]
   335|             if len(scale) != ndim:
   336|                 raise ValueError(
   337|                     f"'scale' list {scale} must match "
   338|                     f"number of image dimensions: {ndim}"
   339|                 )
   340|             for value in scale:
   341|                 if not isinstance(value, (float, int)):
   342|                     raise TypeError(f"'scale' values must all be numbers: {scale}")
   343| 
   344|             # validate translations...
   345|             translation_types = [t == "translation" for t in types]
   346|             if sum(translation_types) > 1:
   347|                 raise ValueError(
   348|                     "Must supply 0 or 1 'translation' item in"
   349|                     "coordinate_transformations"
   350|                 )
   351|             elif sum(translation_types) == 1:
   352|                 transformation = transformations[types.index("translation")]
   353|                 if "translation" not in transformation:
   354|                     raise ValueError(f"Missing scale argument in: {first}")
   355|                 translation = transformation["translation"]
   356|                 if len(translation) != ndim:
   357|                     raise ValueError(
   358|                         f"'translation' list {translation} must match "
   359|                         f"image dimensions count: {ndim}"
   360|                     )
   361|                 for value in translation:
   362|                     if not isinstance(value, (float, int)):
   363|                         raise TypeError(
   364|                             f"'translation' values must all be numbers: {translation}"
   365|                         )
   366| 
   367| 
   368| class FormatV05(FormatV04):
   369|     """
   370|     Changelog: added FormatV05 (May 2025): writing not supported yet
   371|     """
   372| 
   373|     @property
   374|     def version(self) -> str:
   375|         return "0.5"
   376| 
   377|     @property
   378|     def zarr_format(self) -> int:
   379|         return 3
   380| 
   381|     @property
   382|     def chunk_key_encoding(self) -> dict[str, str]:
   383|         # this is default for Zarr v3. Could return None?
   384|         return {"name": "default", "separator": "/"}
   385| 
   386| 
   387| CurrentFormat = FormatV05
   388| 
```

## S017 — sources/S017.txt (145 lines; ome/ome-zarr-py:CHANGELOG.md)

### S017 lines 1-21 — cited by O-057

```text
     1| 
     2| # 0.11.1 (April 2025)
     3| 
     4| - Use release/v1 PyPA action branch for publishing to PyPI ([#449](https://github.com/ome/ome-zarr-py/pull/449))
     5| 
     6| # 0.11.0 (April 2025)
     7| 
     8| - Browse collection of local OME-Zarr in BioFile Finder ([#436](https://github.com/ome/ome-zarr-py/pull/436))
     9| - Remove unused `distributed` from dependencies. Thanks to [Marvin Albert](https://github.com/m-albert) ([#441](https://github.com/ome/ome-zarr-py/pull/441))
    10| - Simplify `_create_mip()`. Thanks to [David Stansby](https://github.com/dstansby) ([#438](https://github.com/ome/ome-zarr-py/pull/438))
    11| - Add parameters to `info` documentation. Thanks to [David Stansby](https://github.com/dstansby) ([#437](https://github.com/ome/ome-zarr-py/pull/437))
    12| - Apply `ruff flake8` rules and other fixes. Thanks to [Dimitri Papadopoulos Orfanos](https://github.com/DimitriPapadopoulos) ([#423](https://github.com/ome/ome-zarr-py/pull/423) - [#434](https://github.com/ome/ome-zarr-py/pull/434))
    13| 
    14| 
    15| # 0.10.3 (January 2025)
    16| 
    17| - Document Scaler attributes ([#418](https://github.com/ome/ome-zarr-py/pull/418))
    18| - Fix dimension separator when downloading files ([#419](https://github.com/ome/ome-zarr-py/pull/419))
    19| - Exclude bad version of fsspec in deps ([#420](https://github.com/ome/ome-zarr-py/pull/420))
    20| 
    21| # 0.10.2 (November 2024)
```

## S018 — sources/S018.txt (610 lines; ome/ome-zarr-py:ome_zarr/reader.py)

### S018 lines 268-427 (truncated from 472) — cited by O-029, O-030, O-031

```text
   268| 
   269| 
   270| class Multiscales(Spec):
   271|     @staticmethod
   272|     def matches(zarr: ZarrLocation) -> bool:
   273|         """is multiscales metadata present?"""
   274|         return bool(zarr.zgroup) and "multiscales" in zarr.root_attrs
   275| 
   276|     def __init__(self, node: Node) -> None:
   277|         super().__init__(node)
   278| 
   279|         multiscales = self.lookup("multiscales", [])
   280|         version = multiscales[0].get(
   281|             "version", "0.1"
   282|         )  # should this be matched with Format.version?
   283|         datasets = multiscales[0]["datasets"]
   284|         axes = multiscales[0].get("axes")
   285|         fmt = format_from_version(version)
   286|         # Raises ValueError if not valid
   287|         axes_obj = Axes(axes, fmt=fmt)
   288|         node.metadata["axes"] = axes_obj.to_list()
   289|         # This will get overwritten by 'omero' metadata if present
   290|         node.metadata["name"] = multiscales[0].get("name")
   291|         paths = [d["path"] for d in datasets]
   292|         self.datasets: list[str] = paths
   293|         transformations = [d.get("coordinateTransformations") for d in datasets]
   294|         if any(trans is not None for trans in transformations):
   295|             node.metadata["coordinateTransformations"] = transformations
   296|         LOGGER.info("datasets %s", datasets)
   297| 
   298|         for resolution in self.datasets:
   299|             data: da.core.Array = self.array(resolution)
   300|             chunk_sizes = [
   301|                 str(c[0]) + (f" (+ {c[-1]})" if c[-1] != c[0] else "")
   302|                 for c in data.chunks
   303|             ]
   304|             LOGGER.info("resolution: %s", resolution)
   305|             axes_names = None
   306|             if axes is not None:
   307|                 axes_names = tuple(
   308|                     axis if isinstance(axis, str) else axis["name"] for axis in axes
   309|                 )
   310|             LOGGER.info(" - shape %s = %s", axes_names, data.shape)
   311|             LOGGER.info(" - chunks =  %s", chunk_sizes)
   312|             LOGGER.info(" - dtype = %s", data.dtype)
   313|             node.data.append(data)
   314| 
   315|         # Load possible node data
   316|         child_zarr = self.zarr.create("labels")
   317|         if child_zarr.exists():
   318|             node.add(child_zarr, visibility=False)
   319| 
   320|     def array(self, resolution: str) -> da.core.Array:
   321|         # data.shape is (t, c, z, y, x) by convention
   322|         return self.zarr.load(resolution)
   323| 
   324| 
   325| class OMERO(Spec):
   326|     @staticmethod
   327|     def matches(zarr: ZarrLocation) -> bool:
   328|         return bool("omero" in zarr.root_attrs)
   329| 
   330|     def __init__(self, node: Node) -> None:
   331|         super().__init__(node)
   332|         # TODO: start checking metadata version
   333|         self.image_data = self.lookup("omero", {})
   334| 
   335|         try:
   336|             model = "unknown"
   337|             rdefs = self.image_data.get("rdefs", {})
   338|             if rdefs:
   339|                 model = rdefs.get("model", "unset")
   340| 
   341|             channels = self.image_data.get("channels", None)
   342|             if channels is None:
   343|                 return  # EARLY EXIT
   344| 
   345|             try:
   346|                 len(channels)
   347|             except TypeError:
   348|                 LOGGER.warning("error counting channels: %s", channels)
   349|                 return  # EARLY EXIT
   350| 
   351|             colormaps = []
   352|             contrast_limits: list[Any | None] | None = [None for x in channels]
   353|             names: list[str] = [f"channel_{idx}" for idx, ch in enumerate(channels)]
   354|             visibles: list[bool] = [True for x in channels]
   355| 
   356|             for idx, ch in enumerate(channels):
   357|                 # 'FF0000' -> [1, 0, 0]
   358| 
   359|                 color = ch.get("color", None)
   360|                 if color is not None:
   361|                     rgb = [(int(color[i : i + 2], 16) / 255) for i in range(0, 6, 2)]
   362|                     # TODO: make this value an enumeration
   363|                     if model == "greyscale":
   364|                         rgb = [1, 1, 1]
   365|                     colormaps.append([[0, 0, 0], rgb])
   366| 
   367|                 label = ch.get("label", None)
   368|                 if label is not None:
   369|                     names[idx] = label
   370| 
   371|                 visible = ch.get("active", None)
   372|                 if visible is not None:
   373|                     visibles[idx] = visible and node.visible
   374| 
   375|                 window = ch.get("window", None)
   376|                 if window is not None:
   377|                     start = window.get("start", None)
   378|                     end = window.get("end", None)
   379|                     if start is None or end is None:
   380|                         # Disable contrast limits settings if one is missing
   381|                         contrast_limits = None
   382|                     elif contrast_limits is not None:
   383|                         contrast_limits[idx] = [start, end]
   384| 
   385|             node.metadata["channel_names"] = names
   386|             node.metadata["visible"] = visibles
   387|             node.metadata["contrast_limits"] = contrast_limits
   388|             node.metadata["colormap"] = colormaps
   389| 
   390|         except Exception:
   391|             LOGGER.exception("Failed to parse metadata")
   392| 
   393| 
   394| class Well(Spec):
   395|     @staticmethod
   396|     def matches(zarr: ZarrLocation) -> bool:
   397|         return bool("well" in zarr.root_attrs)
   398| 
   399|     def __init__(self, node: Node) -> None:
   400|         super().__init__(node)
   401|         self.well_data = self.lookup("well", {})
   402|         LOGGER.info("well_data: %s", self.well_data)
   403| 
   404|         image_paths = [image["path"] for image in self.well_data.get("images")]
   405| 
   406|         # Construct a 2D almost-square grid
   407|         field_count = len(image_paths)
   408|         column_count = math.ceil(math.sqrt(field_count))
   409|         row_count = math.ceil(field_count / column_count)
   410| 
   411|         # Use first Field and highest-resolution level for rendering settings,
   412|         # shapes etc.
   413|         image_zarr = self.zarr.create(image_paths[0])
   414|         image_node = Node(image_zarr, node)
   415|         self.ds_paths = [
   416|             d["path"] for d in image_zarr.root_attrs["multiscales"][0]["datasets"]
   417|         ]
   418|         x_index = len(image_node.metadata["axes"]) - 1
   419|         y_index = len(image_node.metadata["axes"]) - 2
   420|         self.numpy_type = image_node.data[0].dtype
   421|         self.img_shape = image_node.data[0].shape
   422|         self.img_metadata = image_node.metadata
   423|         self.img_pyramid_shapes = [d.shape for d in image_node.data]
   424| 
   425|         def get_field(row: int, col: int, level: int) -> da.core.Array:
   426|             """tile_name is 'row,col'"""
   427|             field_index = (column_count * row) + col
```

## S019 — sources/S019.txt (233 lines; ome/ome-zarr-py:ome_zarr/io.py)

### S019 lines 44-74 — cited by O-036

```text
    44|         elif isinstance(path, LocalStore):
    45|             self.__path = str(path.root)
    46|         else:
    47|             raise TypeError(f"not expecting: {type(path)}")
    48| 
    49|         loader = fmt
    50|         if loader is None:
    51|             loader = CurrentFormat()
    52|         self.__store: FsspecStore = (
    53|             path
    54|             if isinstance(path, (FsspecStore, LocalStore))
    55|             else loader.init_store(self.__path, mode)
    56|         )
    57|         self.__init_metadata()
    58|         detected = detect_format(self.__metadata, loader)
    59|         LOGGER.debug("ZarrLocation.__init__ %s detected: %s", path, detected)
    60|         if detected != fmt:
    61|             LOGGER.warning(
    62|                 "version mismatch: detected: %s, requested: %s", detected, fmt
    63|             )
    64|             self.__fmt = detected
    65|             self.__store = detected.init_store(self.__path, mode)
    66|             self.__init_metadata()
    67| 
    68|     def __init_metadata(self) -> None:
    69|         """
    70|         Load the Zarr metadata files for the given location.
    71|         """
    72|         self.zgroup: JSONDict = {}
    73|         self.zarray: JSONDict = {}
    74|         self.__metadata: JSONDict = {}
```

### S019 lines 79-98 — cited by O-026

```text
    79|         try:
    80|             # this group is used to get zgroup metadata
    81|             # used for info, download, Spec.match() via root_attrs() etc.
    82|             # and to check if the group exists for reading. Only need "r" mode for this.
    83|             group = zarr.open_group(
    84|                 store=self.__store, path="/", mode="r", zarr_format=zarr_format
    85|             )
    86|             self.zgroup = group.attrs.asdict()
    87|             # For zarr v3, everything is under the "ome" namespace
    88|             if "ome" in self.zgroup:
    89|                 self.zgroup = self.zgroup["ome"]
    90|             self.__metadata = self.zgroup
    91|         except (ValueError, FileNotFoundError):
    92|             # group doesn't exist. If we are in "w" mode, we need to create it.
    93|             if self.__mode == "w":
    94|                 # If we are creating a new group, we need to specify the zarr_format.
    95|                 zarr_format = self.__fmt.zarr_format
    96|                 group = zarr.open_group(
    97|                     store=self.__store, path="/", mode="w", zarr_format=zarr_format
    98|                 )
```

## S021 — sources/S021.txt (25 lines; local-capture (origin URL not recorded))

### S021 lines 1-26 — cited by O-021

```text
     1| Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims.
     2| ╭─── ⌕ Web Search: Exa 5 sources ──────────────────────────────────────────────────────────────────╮
     3| │ Query: BioFile Finder local OME-Zarr browser github                                              │
     4| ├─── Answer ───────────────────────────────────────────────────────────────────────────────────────┤
     5| │ [1] AllenInstitute/biofile-finder                                                                │
     6| │     https://github.com/AllenInstitute/biofile-finder                                             │
     7| │ [2] Command-line tool — ome-zarr-py  documentation                                               │
     8| │     https://ome-zarr.readthedocs.io/en/stable/basic/cli_basics.html                              │
     9| │ [3] JaneliaSciComp/zarrcade: Create web-based OME-Zarr ...                                       │
    10| │     https://github.com/JaneliaSciComp/zarrcade                                                   │
    11| │ [4] GitHub - bsse-scf/ome-zarr-portal: Drag & drop OME-Zarrs here:                               │
    12| │ https://bsse-scf.github.io/ome-zarr-portal/ · GitHub                                             │
    13| │     https://p.rst.im/q/Github.com/bsse-scf/ome-zarr-portal                                       │
    14| │ [5] ome/omero-biofilefinder                                                                      │
    15| │     https://github.com/ome/omero-biofilefinder/                                                  │
    16| ├─── Sources ──────────────────────────────────────────────────────────────────────────────────────┤
    17| │ ├─ AllenInstitute/biofile-finder (github.com)                                                    │
    18| │ ├─ Command-line tool — ome-zarr-py  documentation (ome-zarr.readthedocs.io)                      │
    19| │ ├─ JaneliaSciComp/zarrcade: Create web-based OME-Zarr ... (github.com)                           │
    20| │ ├─ GitHub - bsse-scf/ome-zarr-portal: Drag & drop OME-Zarrs here: https://bsse-scf.gi…           │
    21| │ (p.rst.im)                                                                                       │
    22| │ └─ ome/omero-biofilefinder (github.com)                                                          │
    23| ├─── Metadata ─────────────────────────────────────────────────────────────────────────────────────┤
    24| │ Provider: Exa                                                                                    │
    25| ╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
    26| 
```

## S022 — sources/S022.txt (19 lines; https://raw.githubusercontent.com/AllenInstitute/biofile-finder/main/README.md)

### S022 lines 1-20 — cited by O-069

```text
     1| BioFile Finder
     2| =================
     3| 
     4| BioFile Finder is an application produced by the Allen
     5| Institute for Cell Science designed to simplify access and exploration of data, provide an intuitive mechanism for organizing that data, and provide simple hooks for
     6| incorporating that data into both programmatic and non-programmatic workflows.
     7| 
     8| 
     9| ### Homepage
    10| https://biofile-finder.allencell.org/
    11| 
    12| 
    13| ### Developer documentation
    14| 1. [Project layout](dev-docs/01-project-layout.md)
    15| 2. [Setup and workflow](dev-docs/02-setup-and-workflow.md)
    16| 3. [Using a local `file-explorer-service`](dev-docs/03-using-localhost-datasource.md)
    17| 4. [Versioning and deployment](dev-docs/04-versioning-and-deployment.md)
    18| 5. [Code signing](dev-docs/05-code-signing.md)
    19| 6. [Observing use of the application in the wild](dev-docs/06-monitoring-metrics-tracking.md)
    20| 
```

## S023 — sources/S023.txt (493 lines; https://github.com/ome/ome-zarr-py/pull/436)

### S023 lines 142-165 — cited by O-043

```text
   142| •
   143| edited
   144| Loading
   145| Uh oh!
   146| There was an error while loading. Please reload this page.
   147| Copy link
   148| Copy Markdown
   149| Member
   150| With $ ome_zarr view my_image.zarr we can view a single zarr image (or plate etc) in the ome-ngff-validator by serving the image from a local python server.
   151| But this PR allows you to browse a collection of images in your local filesystem with:
   152| $ ome_zarr finder path/to/my_data_folder/
   153| This command will traverse your local filesystem, looking for zarr images (only .zattrs for now - can add zarr v3 support as a follow-up) and collect them into a CSV. This CSV is then served by the localhost python server and opened in BioFile Finder, allowing you to browse your local zarr images which are also served in the same way (and see thumbnails, copy URL etc).
   154| Then in Bio-File Finder, you can "Group By" > "Folders" and you'll get a "tree" of all your folders containing images.
   155| Sorry, something went wrong.
   156| Uh oh!
   157| There was an error while loading. Please reload this page.
   158| 🚀
   159| 2
   160| joshmoore and aswallace reacted with rocket emoji
   161| All reactions
   162| 🚀
   163| 2 reactions
   164| will-moore
   165| added 2 commits
```

## S024 — sources/S024.txt (388 lines; https://api.github.com/repos/ome/napari-ome-zarr/pulls/123)

### S024 lines 9-25 — cited by O-054

```text
     9|  "commits_url": "https://api.github.com/repos/ome/napari-ome-zarr/pulls/123/commits",
    10|  "review_comments_url": "https://api.github.com/repos/ome/napari-ome-zarr/pulls/123/comments",
    11|  "review_comment_url": "https://api.github.com/repos/ome/napari-ome-zarr/pulls/comments{/number}",
    12|  "comments_url": "https://api.github.com/repos/ome/napari-ome-zarr/issues/123/comments",
    13|  "statuses_url": "https://api.github.com/repos/ome/napari-ome-zarr/statuses/3ba4f8d45356b6cd721296d600e13ef7c3f2108a",
    14|  "number": 123,
    15|  "state": "closed",
    16|  "locked": false,
    17|  "title": "drop ome-zarr dependency",
    18|  "user": {
    19|   "login": "will-moore",
    20|   "id": 900055,
    21|   "node_id": "MDQ6VXNlcjkwMDA1NQ==",
    22|   "avatar_url": "https://avatars.githubusercontent.com/u/900055?v=4",
    23|   "gravatar_id": "",
    24|   "url": "https://api.github.com/users/will-moore",
    25|   "html_url": "https://github.com/will-moore",
```

## S025 — sources/S025.txt (105 lines; https://raw.githubusercontent.com/hms-dbmi/vizarr/main/README.md)

### S025 lines 11-35 — cited by O-058

```text
    11|       <a href="./python/notebooks/getting_started.ipynb">python api</a> .
    12|       <a href="https://colab.research.google.com/github/hms-dbmi/vizarr/blob/main/python/notebooks/mandelbrot.ipynb">open in colab</a>
    13|   </p>
    14| </samp>
    15| </p>
    16| 
    17| ## About 
    18| 
    19| **Vizarr** is a minimal, purely client-side program for viewing zarr-based images.
    20| 
    21| - ⚡ **GPU accelerated rendering** with [Viv](https://github.com/hms-dbmi/viv)
    22| - 💻 Purely **client-side** zarr access with [zarrita.js](https://github.com/manzt/zarrita.js)
    23| - 🌎 A **standalone [web app](https://hms-dbmi/vizarr)** for viewing entirely in the browser.
    24| - 🐍 An [anywidget](https://github.com/manzt/anywidget) **Python API** for
    25|   programmatic control in notebooks.
    26| - 📦 Supports any `zarr-python` [store](https://zarr.readthedocs.io/en/stable/api/storage.html)
    27|   as a backend.
    28| 
    29| <p align="center">
    30|   <img src="./assets/screenshot.png" alt="Multiscale OME-Zarr in Jupyter Notebook with Vizarr" width="500">
    31| </p>
    32| 
    33| ## Getting started
    34| 
    35| **Vizarr**  provides two primary interfaces for interacting with the core viewer:
```

## S028 — sources/S028.txt (6395 lines; https://api.github.com/repos/ome/ome-zarr-py/issues?state=open&per_page=100)

### S028 lines 4-163 (truncated from 4604) — cited by O-071

```text
     4|   "repository_url": "https://api.github.com/repos/ome/ome-zarr-py",
     5|   "labels_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/654/labels{/name}",
     6|   "comments_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/654/comments",
     7|   "events_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/654/events",
     8|   "html_url": "https://github.com/ome/ome-zarr-py/issues/654",
     9|   "id": 5388758927,
    10|   "node_id": "I_kwDOD5lzwM8AAAABQTHvjw",
    11|   "number": 654,
    12|   "title": "Test suite failure for commit ",
    13|   "user": {
    14|    "login": "snoopycrimecop",
    15|    "id": 2544838,
    16|    "node_id": "MDQ6VXNlcjI1NDQ4Mzg=",
    17|    "avatar_url": "https://avatars.githubusercontent.com/u/2544838?v=4",
    18|    "gravatar_id": "",
    19|    "url": "https://api.github.com/users/snoopycrimecop",
    20|    "html_url": "https://github.com/snoopycrimecop",
    21|    "followers_url": "https://api.github.com/users/snoopycrimecop/followers",
    22|    "following_url": "https://api.github.com/users/snoopycrimecop/following{/other_user}",
    23|    "gists_url": "https://api.github.com/users/snoopycrimecop/gists{/gist_id}",
    24|    "starred_url": "https://api.github.com/users/snoopycrimecop/starred{/owner}{/repo}",
    25|    "subscriptions_url": "https://api.github.com/users/snoopycrimecop/subscriptions",
    26|    "organizations_url": "https://api.github.com/users/snoopycrimecop/orgs",
    27|    "repos_url": "https://api.github.com/users/snoopycrimecop/repos",
    28|    "events_url": "https://api.github.com/users/snoopycrimecop/events{/privacy}",
    29|    "received_events_url": "https://api.github.com/users/snoopycrimecop/received_events",
    30|    "type": "User",
    31|    "user_view_type": "public",
    32|    "site_admin": false
    33|   },
    34|   "labels": [],
    35|   "state": "open",
    36|   "locked": false,
    37|   "assignees": [],
    38|   "milestone": null,
    39|   "comments": 0,
    40|   "created_at": "2026-09-08T15:35:47Z",
    41|   "updated_at": "2026-09-08T15:35:47Z",
    42|   "closed_at": null,
    43|   "assignee": null,
    44|   "author_association": "MEMBER",
    45|   "issue_field_values": [],
    46|   "type": null,
    47|   "active_lock_reason": null,
    48|   "sub_issues_summary": {
    49|    "total": 0,
    50|    "completed": 0,
    51|    "percent_completed": 0
    52|   },
    53|   "issue_dependencies_summary": {
    54|    "blocked_by": 0,
    55|    "total_blocked_by": 0,
    56|    "blocking": 0,
    57|    "total_blocking": 0
    58|   },
    59|   "body": "Test suite status: failure see https://github.com/ome/ome_zarr_test_suite/actions/runs/34245289668",
    60|   "closed_by": null,
    61|   "reactions": {
    62|    "url": "https://api.github.com/repos/ome/ome-zarr-py/issues/654/reactions",
    63|    "total_count": 0,
    64|    "+1": 0,
    65|    "-1": 0,
    66|    "laugh": 0,
    67|    "hooray": 0,
    68|    "confused": 0,
    69|    "heart": 0,
    70|    "rocket": 0,
    71|    "eyes": 0
    72|   },
    73|   "timeline_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/654/timeline",
    74|   "performed_via_github_app": null,
    75|   "state_reason": null,
    76|   "pinned_comment": null
    77|  },
    78|  {
    79|   "url": "https://api.github.com/repos/ome/ome-zarr-py/issues/653",
    80|   "repository_url": "https://api.github.com/repos/ome/ome-zarr-py",
    81|   "labels_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/653/labels{/name}",
    82|   "comments_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/653/comments",
    83|   "events_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/653/events",
    84|   "html_url": "https://github.com/ome/ome-zarr-py/pull/653",
    85|   "id": 5387928784,
    86|   "node_id": "PR_kwDOD5lzwM8AAAABCr625Q",
    87|   "number": 653,
    88|   "title": "Dont create image-label in image-label",
    89|   "user": {
    90|    "login": "alanocallaghan",
    91|    "id": 10779688,
    92|    "node_id": "MDQ6VXNlcjEwNzc5Njg4",
    93|    "avatar_url": "https://avatars.githubusercontent.com/u/10779688?v=4",
    94|    "gravatar_id": "",
    95|    "url": "https://api.github.com/users/alanocallaghan",
    96|    "html_url": "https://github.com/alanocallaghan",
    97|    "followers_url": "https://api.github.com/users/alanocallaghan/followers",
    98|    "following_url": "https://api.github.com/users/alanocallaghan/following{/other_user}",
    99|    "gists_url": "https://api.github.com/users/alanocallaghan/gists{/gist_id}",
   100|    "starred_url": "https://api.github.com/users/alanocallaghan/starred{/owner}{/repo}",
   101|    "subscriptions_url": "https://api.github.com/users/alanocallaghan/subscriptions",
   102|    "organizations_url": "https://api.github.com/users/alanocallaghan/orgs",
   103|    "repos_url": "https://api.github.com/users/alanocallaghan/repos",
   104|    "events_url": "https://api.github.com/users/alanocallaghan/events{/privacy}",
   105|    "received_events_url": "https://api.github.com/users/alanocallaghan/received_events",
   106|    "type": "User",
   107|    "user_view_type": "public",
   108|    "site_admin": false
   109|   },
   110|   "labels": [],
   111|   "state": "open",
   112|   "locked": false,
   113|   "assignees": [],
   114|   "milestone": null,
   115|   "comments": 2,
   116|   "created_at": "2026-09-08T14:22:29Z",
   117|   "updated_at": "2026-09-08T20:26:46Z",
   118|   "closed_at": null,
   119|   "assignee": null,
   120|   "author_association": "NONE",
   121|   "issue_field_values": [],
   122|   "type": null,
   123|   "active_lock_reason": null,
   124|   "draft": false,
   125|   "pull_request": {
   126|    "url": "https://api.github.com/repos/ome/ome-zarr-py/pulls/653",
   127|    "html_url": "https://github.com/ome/ome-zarr-py/pull/653",
   128|    "diff_url": "https://github.com/ome/ome-zarr-py/pull/653.diff",
   129|    "patch_url": "https://github.com/ome/ome-zarr-py/pull/653.patch",
   130|    "merged_at": null
   131|   },
   132|   "body": "The previous formulation results in:\r\n\r\n```json\r\n\"image-label\": {\"image-label\" : { [...]}}\r\n```\r\nwhich is obviously unintentional and contrary to [the spec](https://ngff.openmicroscopy.org/0.5/#labels-md)",
   133|   "closed_by": null,
   134|   "reactions": {
   135|    "url": "https://api.github.com/repos/ome/ome-zarr-py/issues/653/reactions",
   136|    "total_count": 0,
   137|    "+1": 0,
   138|    "-1": 0,
   139|    "laugh": 0,
   140|    "hooray": 0,
   141|    "confused": 0,
   142|    "heart": 0,
   143|    "rocket": 0,
   144|    "eyes": 0
   145|   },
   146|   "timeline_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/653/timeline",
   147|   "performed_via_github_app": null,
   148|   "state_reason": null
   149|  },
   150|  {
   151|   "url": "https://api.github.com/repos/ome/ome-zarr-py/issues/651",
   152|   "repository_url": "https://api.github.com/repos/ome/ome-zarr-py",
   153|   "labels_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/651/labels{/name}",
   154|   "comments_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/651/comments",
   155|   "events_url": "https://api.github.com/repos/ome/ome-zarr-py/issues/651/events",
   156|   "html_url": "https://github.com/ome/ome-zarr-py/pull/651",
   157|   "id": 5379010527,
   158|   "node_id": "PR_kwDOD5lzwM8AAAABCkw4TA",
   159|   "number": 651,
   160|   "title": "[pre-commit.ci] pre-commit autoupdate",
   161|   "user": {
   162|    "login": "pre-commit-ci[bot]",
   163|    "id": 66853113,
```

## S029 — sources/S029.txt (490 lines; https://github.com/ome/ome-zarr-py/issues/407)

### S029 lines 133-214 — cited by O-044

```text
   133| Comparison of OME-Zarr libs#407
   134| Copy link
   135| Description
   136| will-moore
   137| opened on Nov 25, 2024
   138| Issue body actions
   139| Some discussion about potential changes to ome-zarr-py at #402 inspired me to check out other OME-Zarr libs to understand alternative ways of structuring things...
   140| Also see prior work by others at https://github.com/jwindhager/ome-ngff-readers-writers
   141| Summary Table
   142| “Yes” means the library aims to support this feature (not necessarily fully supported)
   143| Table Key:
   144| Metadata writing (e.g. generating ‘multiscales’ metadata).
   145| Validation of existing data
   146| Array manipulation (mostly downsampling for now) with dask support for larger-than-memory arrays
   147| Graph traversal (e.g. get all the images and labels from bioformats2raw.layout or a plate)
   148| CLI Command-line utils
   149| library
   150| Metadata
   151| Validation
   152| Arrays
   153| Graph
   154| CLI
   155| ome-zarr-py
   156| Yes
   157| Yes
   158| Yes
   159| Yes
   160| pydantic-ome-ngff
   161| Yes
   162| Yes
   163| ome-zarr-models
   164| Yes
   165| Yes
   166| Yes
   167| ngff-zarr
   168| Yes
   169| Yes
   170| Yes
   171| Webknossos
   172| Yes
   173| Yes
   174| Yes
   175| ngio
   176| Yes
   177| Yes
   178| Yes
   179| Yes
   180| EuBi-Bridge
   181| Yes
   182| Yes
   183| Yes
   184| acquire-zarr
   185| Yes
   186| Yes
   187| Yes
   188| iohub
   189| Yes
   190| Yes
   191| ngff-zarr
   192| https://github.com/thewtex/ngff-zarr
   193| # ngff-zarr==0.18.0
   194| import zarr
   195| import ngff_zarr as nz
   196| url = "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr/0"
   197| data = zarr.open_array(url)
   198| image = nz.to_ngff_image(data, dims=['c', 'z', 'y', 'x'], scale={'z': 0.5, 'y': 0.36, 'x': 0.36},
   199| axes_units={'z': 'micrometer', 'y': 'micrometer', 'x': 'micrometer'})
   200| multiscales = nz.to_multiscales(image, scale_factors=[2,4,8], chunks=64)
   201| nz.to_ngff_zarr('6001240_ngff-zarr.ome.zarr', multiscales)
   202| View the output 6001240_ngff-zarr.ome.zarr in ome-ngff-validator (NB: omero metadata was added to this sample manually after creation.
   203| Pyramid generation is separate from writing to zarr 👍
   204| 1 line to generate pyramid, 1 line to write to zarr
   205| We get array at 6001240_ngff-zarr.ome.zarr/scale0/image/.zarray with 6001240_ngff-zarr.ome.zarr/scale0/.zattrs for xarray _ARRAY_DIMENSIONS
   206| nz.to_multiscales(image, scale_factors=[2,4,8], chunks=64) generates a Multiscales data object with data as dask delayed pyramid.
   207| pydantic-ome-ngff
   208| https://github.com/janeliascicomp/pydantic-ome-ngff
   209| from pydantic_ome_ngff.v04.multiscale import MultiscaleGroup
   210| from pydantic_ome_ngff.v04.axis import Axis
   211| import numpy as np
   212| import zarr
   213| axes = [
   214| Axis(name='y', unit='nanometer', type='space'),
```

## S030 — sources/S030.txt (1 lines; local-capture (origin URL not recorded))

### S030 lines 1-1 — cited by O-022

```text
     1| FileNotFoundError: [Errno 2] No such file or directory: '/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/runs/ome-zarr05-thin-live-20260909/jobs/J0001-discovery/workspace/research-evidence/sources/S00038/text.txt'
```

## S032 — sources/S032.txt (23 lines; local-capture (origin URL not recorded))

### S032 lines 1-24 — cited by O-021

```text
     1| Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims.
     2| ╭─── ⌕ Web Search: Exa 5 sources ──────────────────────────────────────────────────────────────────╮
     3| │ Query: bioformats2raw OME-Zarr 0.5 zarr v3 support release                                       │
     4| ├─── Answer ───────────────────────────────────────────────────────────────────────────────────────┤
     5| │ [1] 0.5.0                                                                                        │
     6| │     https://github.com/glencoesoftware/bioformats2raw/releases/tag/v0.5.0                        │
     7| │ [2] GitHub - glencoesoftware/bioformats2raw: Bio-Formats image file ...                          │
     8| │     https://github.com/glencoesoftware/bioformats2raw                                            │
     9| │ [3] glencoesoftware/bioformats2raw                                                               │
    10| │     https://github.com/glencoesoftware/bioformats2raw?tab=readme-ov-file                         │
    11| │ [4] README.md at master · glencoesoftware/bioformats2raw                                         │
    12| │     https://github.com/glencoesoftware/bioformats2raw/blob/master/README.md                      │
    13| │ [5] OME-Zarr specification                                                                       │
    14| │     https://ngff.openmicroscopy.org/0.5/                                                         │
    15| ├─── Sources ──────────────────────────────────────────────────────────────────────────────────────┤
    16| │ ├─ 0.5.0 (github.com)                                                                            │
    17| │ ├─ GitHub - glencoesoftware/bioformats2raw: Bio-Formats image file ... (github.com)              │
    18| │ ├─ glencoesoftware/bioformats2raw (github.com)                                                   │
    19| │ ├─ README.md at master · glencoesoftware/bioformats2raw (github.com)                             │
    20| │ └─ OME-Zarr specification (ngff.openmicroscopy.org)                                              │
    21| ├─── Metadata ─────────────────────────────────────────────────────────────────────────────────────┤
    22| │ Provider: Exa                                                                                    │
    23| ╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
    24| 
```

## S033 — sources/S033.txt (518 lines; https://raw.githubusercontent.com/glencoesoftware/bioformats2raw/master/README.md; local-capture (origin URL not recorded))

### S033 lines 99-127 — cited by O-048

```text
    99| Usage
   100| =====
   101| 
   102| Run the conversion:
   103| 
   104|     bioformats2raw /path/to/file.mrxs /path/to/zarr-pyramid
   105|     bioformats2raw /path/to/file.svs /path/to/zarr-pyramid
   106| 
   107| By default, the resolutions will be set so that the smallest resolution is no greater than 256x256.
   108| A scaling factor of 2 is used between consecutive resolutions.
   109| The target of the smallest resolution can be configured with `--target-min-size` e.g. to ensure
   110| that the smallest resolution is no greater than 128x128
   111| 
   112|     bioformats2raw /path/to/file.mrxs /path/to/zarr-pyramid --target-min-size 128
   113|     bioformats2raw /path/to/file.svs /path/to/zarr-pyramid --target-min-size 128
   114| 
   115| 
   116| Alternatively, the `--resolutions` options can be passed to specify the exact number of resolution levels:
   117| 
   118|     bioformats2raw /path/to/file.mrxs /path/to/zarr-pyramid --resolutions 6
   119|     bioformats2raw /path/to/file.svs /path/to/zarr-pyramid --resolutions 6
   120| 
   121| 
   122| Maximum tile dimensions can be configured with the `--tile-width` and `--tile-height` options.  Defaults can be viewed with
   123| `bioformats2raw --help`. Be mindful of the downstream workflow when selecting a tile size other than the default.
   124| A smaller than default tile size is rarely recommended.
   125| 
   126| If the input file has multiple series, a subset of the series can be converted by specifying a comma-separated list of indexes:
   127| 
```

### S033 lines 327-345 — cited by O-049

```text
   327| Usage Changes
   328| =============
   329| 
   330| Versions 0.2.6 and prior supported both N5 and Zarr output using the `--file_type` option.
   331| This option is not present in 0.3.0 and later, as only Zarr output is supported.
   332| 
   333| Versions 0.2.6 and prior used the input file's dimension order to determine the output
   334| dimension order, unless `--dimension-order` was specified.
   335| Version 0.3.0 and later uses the `TCZYX` order by default, for compatibility with https://ngff.openmicroscopy.org/0.4/#image-layout.
   336| The `--dimension-order` option is considered deprecated and may be removed in a future release,
   337| as it results in invalid OME-NGFF data.
   338| 
   339| Prior to version 0.3.0, N5/Zarr output was placed in a subdirectory (`data.[n5|zarr]`) with a `METADATA.ome.xml` file
   340| at the same level.  As of 0.3.0 the desired output directory is now a Zarr group and the `METADATA.ome.xml` file is
   341| placed in a `OME` directory within.  These changes reflect layout version 3.
   342| 
   343| Prior to version 0.5.0, the plate and series Zarr groups followed the metadata defined in
   344| the [0.2 version of the OME-NGFF specification](https://ngff.openmicroscopy.org/0.2). As of
   345| 0.5.0, these groups now follow the metadata conventions defined in the
```

## S034 — sources/S034.txt (366 lines; https://raw.githubusercontent.com/ome/ome2024-ngff-challenge/master/README.md)

### S034 lines 32-54 — cited by O-047

```text
    32| [https://ome.github.io/ome2024-ngff-challenge/](https://ome.github.io/ome2024-ngff-challenge/).
    33| 
    34| ## Challenge overview
    35| 
    36| The high-level goal of the challenge is to generate OME-Zarr data according to a
    37| development version of the specification to drive forward the implementation
    38| work and establish a baseline for the conversion costs that members of the
    39| community can expect to incur.
    40| 
    41| Data generated within the challenge will have:
    42| 
    43| - all v2 arrays converted to v3, optionally sharding the data
    44| - all .zattrs metadata migrated to `zarr.json["attributes"]["ome"]`
    45| - a top-level `ro-crate-metadata.json` file with minimal metadata (specimen and
    46|   imaging modality)
    47| 
    48| You can example the contents of a sample dataset by using
    49| [the minio client](https://github.com/minio/mc):
    50| 
    51| ```
    52| $ mc alias set uk1anon https://livingobjects.ebi.ac.uk "" ""
    53| Added `uk1anon` successfully.
    54| $ mc ls -r uk1anon/idr/share/ome2024-ngff-challenge/0.0.5/6001240.zarr/
```

### S034 lines 62-78 — cited by O-046

```text
    62| [2024-08-01 14:24:28 CEST] 2.7KiB STANDARD zarr.json
    63| ```
    64| 
    65| Other samples:
    66| 
    67| - [4496763.zarr](https://ome.github.io/ome-ngff-validator/?source=https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/4496763.zarr)
    68|   Shape `4,25,2048,2048`, Size `589.81 MB`, from idr0047.
    69| - [9822152.zarr](https://ome.github.io/ome-ngff-validator/?source=https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0083/9822152.zarr)
    70|   Shape `1,1,1,93184,144384`, Size `21.57 GB`, from idr0083.
    71| - [9846151.zarr](https://ome.github.io/ome-ngff-validator/?source=https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0048/9846151.zarr)
    72|   Shape `1,3,1402,5192,2947`, Size `66.04 GB`, from idr0048.
    73| - [Week9_090907.zarr](https://ome.github.io/ome-ngff-validator/?source=https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0035/Week9_090907.zarr)
    74|   plate from idr0035.
    75| - [l4_sample/color](https://ome.github.io/ome-ngff-validator/?source=https://data-humerus.webknossos.org/data/zarr3_experimental/scalable_minds/l4_sample/color)
    76|   from WebKnossos.
    77| - Plates from idr0090:
    78|   [190129.zarr](https://ome.github.io/ome-ngff-validator/?source=https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0090/190129.zarr)
```

## S035 — sources/S035.txt (8929 lines; https://api.github.com/repos/ome/ngff/issues?state=open&per_page=100)

### S035 lines 348-364 — cited by O-073

```text
   348|   "repository_url": "https://api.github.com/repos/ome/ngff",
   349|   "labels_url": "https://api.github.com/repos/ome/ngff/issues/594/labels{/name}",
   350|   "comments_url": "https://api.github.com/repos/ome/ngff/issues/594/comments",
   351|   "events_url": "https://api.github.com/repos/ome/ngff/issues/594/events",
   352|   "html_url": "https://github.com/ome/ngff/issues/594",
   353|   "id": 5268934301,
   354|   "node_id": "I_kwDOErH06M8AAAABOg2OnQ",
   355|   "number": 594,
   356|   "title": "RFC-5 document needs updates for OME-Zarr 0.6rc0",
   357|   "user": {
   358|    "login": "thewtex",
   359|    "id": 25432,
   360|    "node_id": "MDQ6VXNlcjI1NDMy",
   361|    "avatar_url": "https://avatars.githubusercontent.com/u/25432?v=4",
   362|    "gravatar_id": "",
   363|    "url": "https://api.github.com/users/thewtex",
   364|    "html_url": "https://github.com/thewtex",
```

## S036 — sources/S036.txt (24 lines; local-capture (origin URL not recorded))

### S036 lines 1-25 — cited by O-021

```text
     1| Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims.
     2| ╭─── ⌕ Web Search: Exa 5 sources ──────────────────────────────────────────────────────────────────╮
     3| │ Query: MoBIE WebKnossos neuroglancer OME-Zarr 0.5 zarr v3 support viewers 2026                   │
     4| ├─── Answer ───────────────────────────────────────────────────────────────────────────────────────┤
     5| │ [1] zarr - Neuroglancer                                                                          │
     6| │     https://neuroglancer-docs.web.app/datasource/zarr/index.html                                 │
     7| │ [2] Changelog - WEBKNOSSOS Documentation                                                         │
     8| │     https://docs.webknossos.org/webknossos/CHANGELOG.released.html                               │
     9| │ [3] viewing Zarr v3 and OME-Zarr #651 - google/neuroglancer                                      │
    10| │     https://github.com/google/neuroglancer/issues/651                                            │
    11| │ [4] ome-ngff-tools | Document available viewers and other tools for the OME-NGFF image format    │
    12| │     https://ome.github.io/ome-ngff-tools/                                                        │
    13| │ [5] OME-Zarr & NGFF - WEBKNOSSOS Documentation                                                   │
    14| │     https://docs.webknossos.org/webknossos/data/zarr.html                                        │
    15| ├─── Sources ──────────────────────────────────────────────────────────────────────────────────────┤
    16| │ ├─ zarr - Neuroglancer (neuroglancer-docs.web.app)                                               │
    17| │ ├─ Changelog - WEBKNOSSOS Documentation (docs.webknossos.org)                                    │
    18| │ ├─ viewing Zarr v3 and OME-Zarr #651 - google/neuroglancer (github.com)                          │
    19| │ ├─ ome-ngff-tools | Document available viewers and other tools for the OME-NGFF …                │
    20| │ (ome.github.io)                                                                                  │
    21| │ └─ OME-Zarr & NGFF - WEBKNOSSOS Documentation (docs.webknossos.org)                              │
    22| ├─── Metadata ─────────────────────────────────────────────────────────────────────────────────────┤
    23| │ Provider: Exa                                                                                    │
    24| ╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
    25| 
```

## S041 — sources/S041.txt (194 lines; https://raw.githubusercontent.com/ome/ome-ngff-tools/main/docs/index.md)

### S041 lines 1-28 — cited by O-050, O-052

```text
     1| 
     2| The following versions of each viewer were used in testing:
     3| 
     4| - <a href="https://napari.org">napari</a> 0.5.6 with plugin <a href="https://github.com/ome/napari-ome-zarr/">napari-ome-zarr</a> 0.6.1 and <a href="https://github.com/ome/ome-zarr-py/">ome-zarr</a> 0.10.3.
     5|   - Open via command line: `napari https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr`
     6|   - Use napari console to open additional image: `viewer.open("https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0101A/13457537.zarr", plugin="napari-ome-zarr")`
     7| - <a href="https://github.com/hms-dbmi/vizarr/">vizarr</a> using <a href="https://hms-dbmi.github.io/vizarr">current viewer</a> April 2025. Open via URL - see <a href="https://hms-dbmi.github.io/vizarr/?source=https://livingobjects.ebi.ac.uk/idr/zarr/v0.3/idr0079A/9836998.zarr">example</a>.
     8| - [Vol-E](https://github.com/allen-cell-animated/vole-app)
     9| - <a href="https://imagej.net/plugins/bdv/">BigDataViewer</a> comes with Fiji. Jar versions include bigdataviewer_fiji-6.4.1.jar, bigdataviewer-core-10.6.4, bigdataviewer-image-loaders-0.9.0, bigdataviewer-n5-1.0.2.jar.
    10|   - Open with: `Plugins > BigDataViewer > HDF5/N5/Zarr/OME-NGFF Viewer`. In the dialog, enter the URL and click `OK`.
    11|   - To include labels, enter the image URL in the dialog, then click `Detect datasets`. Expand the tree and select an image under `labels` AND use Cmd-click to also select the top-level parent image. With both selected, click `OK`.
    12| - <a href="https://github.com/mobie/mobie-viewer-fiji/">MoBIE</a> plugin for ImageJ/Fiji (mobie-viewer-fiji v6.3.1, mobie-io v4.0.3).
    13|   - See <a href="https://omero-guides.readthedocs.io/en/latest/fiji/docs/view_mobie_zarr.html">MoBIE  guide</a> for installation instructions. Hint: Press ``p`` to bring the rendering settings controls.
    14|   - To open images: `Plugins > MoBIE > Open > Open OME ZARR` then enter image `URL.zarr`. If you want to include labels, also fill the labels field with `URL.zarr/labels/<name>` (Open the image in ome-ngff-validator first (OME icon in table below) and browse to labels to get the correct URL).
    15|   - To open Plates: `Plugins > MoBIE > Open > Open HCS Dataset`.
    16| - <a href="https://itkwidgets.readthedocs.io/en/latest">itkwidgets</a>. Use in a python notebook, or open via URL: See <a href="https://kitware.github.io/itk-vtk-viewer/app/?rotate=false&fileToLoad=https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr">example</a>.
    17| - <a href="https://github.com/google/neuroglancer">neuroglancer</a>.
    18| - <a href="https://webknossos.org">webKnossos</a> version 24.11.0.
    19| - <a href="https://www.openmicroscopy.org/omero/">OMERO</a> with BioFormats <a href="https://github.com/ome/ZarrReader">ZarrReader</a> 0.2.0.
    20| - <a href="https://extensions.blender.org/add-ons/microscopynodes/">Microscopy Nodes</a> plugin to load microscopy data in <a href="https://www.blender.org">Blender</a>. Tested with Blender 4.4.1 and Microscopy Nodes 2.2.0.
    21| 
    22| NB: the <a href="https://github.com/saalfeldlab/n5-viewer">N5-viewer</a>, a Fiji plugin based on BigDataViewer, will also support OME-NGFF soon.
    23| 
    24| 
    25| <style>
    26|   .supported {
    27|     background: #8BC34A;
    28|   }
```

## S042 — sources/S042.txt (1 lines; local-capture (origin URL not recorded))

### S042 lines 1-1 — cited by O-022

```text
     1| HTTPError: HTTP Error 404: Not Found
```

## S043 — sources/S043.txt (566 lines; https://raw.githubusercontent.com/ome/ome-ngff-tools/main/docs/_data/features.yml)

### S043 lines 1-86 — cited by O-050, O-051

```text
     1| 
     2| - name: Z downsample
     3|   description: Does the viewer handle image pyramids which have been down-sampled in the Z axis?
     4|   sample_url: https://minio-dev.openmicroscopy.org/idr/v0.4/idr0077/9836832_z_dtype_fix.zarr
     5|   sample_name: 9836832.zarr
     6|   avivator:
     7|     supported: no
     8|     opens: no
     9|   vizarr:
    10|     opens: no
    11|     supported: no
    12|     notes: "Vizarr expects the same number of Z-sections for each pyramid resolution"
    13|     issue_url: https://github.com/hms-dbmi/vizarr/issues/60
    14|   Vol-E:
    15|     supported: yes
    16|   napari:
    17|     notes: "Image appears to load and display OK, but very quickly crashes on zooming etc."
    18|   BigDataViewer:
    19|     supported: yes
    20|   MoBIE:
    21|     supported: yes
    22|   vtk-itk-viewer:
    23|     supported: yes
    24|   neuroglancer:
    25|     supported: yes
    26|   WEBKNOSSOS:
    27|     supported: yes
    28|     viewer_url: https://webknossos.org/datasets/308ffc5547d41748/9836832_z_dtype_fix.zarr/view?token=vO-L4B5wwTea_SCWegbylQ
    29|   OMERO:
    30|     supported: no
    31|     opens: no
    32|   Microscopy Nodes:
    33|     supported: no
    34|     opens: yes
    35|     notes: "Z-pixel size is read without the downsampling. Can be adjusted to the downsampled value with the UI"
    36| 
    37| 
    38| - name: omero info
    39|   description: Does the viewer use the 'omero' metadata to set channel colors, names and rendering levels?
    40|   sample_url: https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr
    41|   sample_name: 6001240.zarr
    42|   avivator:
    43|     supported: no
    44|     opens: yes
    45|   vizarr:
    46|     opens: yes
    47|     supported: yes
    48|   Vol-E:
    49|     supported: no
    50|     opens: yes
    51|     notes: "The channel labels are read from 'omero' metadata, but the colors are ignored"
    52|   napari:
    53|     opens: yes
    54|     supported: yes
    55|   BigDataViewer:
    56|     supported: no
    57|     opens: yes
    58|   MoBIE:
    59|     supported: no
    60|     opens: yes
    61|   neuroglancer:
    62|     supported: no
    63|     opens: yes
    64|     vtk-itk-viewer:
    65|       supported: no
    66|     opens: yes
    67|   WEBKNOSSOS:
    68|     supported: yes
    69|     opens: yes
    70|     notes: "rdefs are not supported"
    71|     viewer_url: https://webknossos.org/datasets/308ffc5547d41748/6001240_20240314.zarr?token=equ22C3ELBC6y9aS4pW3cw
    72|   OMERO:
    73|     supported: no
    74|     opens: yes
    75|   Microscopy Nodes:
    76|     supported: no
    77|     opens: yes
    78|     notes: "The channel labels are read from 'omero' metadata, but the colors are ignored"
    79| 
    80| - name: multiscales downsampling not=2
    81|   description: Can the viewer handle pyramids when the scale factor between levels is not equal to 2?
    82|   sample_url: https://minio-dev.openmicroscopy.org/idr/v0.4/idr0082/9846318.zarr/0
    83|   sample_name: 9846318.zarr/0
    84|   avivator:
    85|     supported: no
    86|   vizarr:
```

## S044 — sources/S044.txt (311 lines; https://github.com/ome/ome-zarr-py/issues/640)

### S044 lines 118-154 — cited by O-045

```text
   118| Additional navigation options
   119| Code
   120| Issues
   121| Pull requests
   122| Actions
   123| Projects
   124| Security and quality
   125| Insights
   126| ome-zarr-py does not work with auto-sharding #640
   127| New issue
   128| Copy link
   129| New issue
   130| Copy link
   131| Open
   132| Open
   133| ome-zarr-py does not work with auto-sharding#640
   134| Copy link
   135| Description
   136| JeppeKlitgaard
   137| opened on Aug 31, 2026
   138| Issue body actions
   139| ome-zarr-py does not appear to work correctly with auto-sharding.
   140| Reproducer
   141| import importlib.metadata
   142| import shutil
   143| import sys
   144| import numpy as np
   145| import ome_zarr.writer
   146| import zarr
   147| import zarr.storage
   148| print("Python version:", sys.version)
   149| print("OME-Zarr version:", importlib.metadata.version("ome-zarr"))
   150| print("Zarr version:", importlib.metadata.version("zarr"))
   151| # Set up some test data
   152| arr_np = np.random.randint(0, 256, size=(100, 100, 100), dtype=np.uint8)
   153| # Test that it works with regular zarr
   154| store = zarr.storage.MemoryStore()
```

## S045 — sources/S045.txt (1 lines; local-capture (origin URL not recorded))

### S045 lines 1-1 — cited by O-022

```text
     1| FileNotFoundError: [Errno 2] No such file or directory: '/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/cache/v3/repos/ome--napari-ome-zarr/.git/objects/pack/tmp_rev_H5nF8K'
```

## S046 — sources/S046.txt (1 lines; local-capture (origin URL not recorded))

### S046 lines 1-1 — cited by O-022

```text
     1| ValueError: Incomplete clone is not a source
```

## S048 — sources/S048.txt (722 lines; https://raw.githubusercontent.com/ome/napari-ome-zarr/main/napari_ome_zarr/ome_zarr_reader.py)

### S048 lines 158-178 — cited by O-032

```text
   158|             yield from child.iter_nodes()
   159| 
   160|     def iter_data(self) -> Iterable[da.core.Array]:
   161|         for node in self.iter_nodes():
   162|             data = node.data()
   163|             if data:
   164|                 yield data
   165| 
   166|     @staticmethod
   167|     def get_attrs(group: Group) -> dict:
   168|         if "ome" in group.attrs:
   169|             return group.attrs["ome"]
   170|         return group.attrs
   171| 
   172| 
   173| class Multiscales(Spec):
   174|     @staticmethod
   175|     def matches(group: Group) -> bool:
   176|         return "multiscales" in Spec.get_attrs(group)
   177| 
   178|     def children(self) -> list[Spec]:
```

### S048 lines 191-221 — cited by O-033

```text
   191|                         for transf in self.parent_transforms:
   192|                             # ...to transform it to same space as parent image
   193|                             label_image.add_parent_transform(transf, ch_axis)
   194|                         ch.append(label_image)
   195|         except KeyError:
   196|             pass
   197|         return ch
   198| 
   199|     def data(self) -> list[da.core.Array]:
   200|         attrs = Spec.get_attrs(self.group)
   201|         paths = [ds["path"] for ds in attrs["multiscales"][0]["datasets"]]
   202|         return [da.from_zarr(self.group[path]) for path in paths]
   203| 
   204|     def _splits_channels(self) -> bool:
   205|         """Whether a channel axis is turned into separate napari layers.
   206| 
   207|         Images split into one layer per channel via ``channel_axis``, so the
   208|         channel axis is dropped from the per-axis metadata (axis_labels, units,
   209|         scale, translate) to match each split layer's reduced ndim. Labels keep
   210|         every axis in a single layer and so must keep the channel axis (see
   211|         ``Label._splits_channels``).
   212|         """
   213|         return True
   214| 
   215|     def metadata(self) -> Dict[str, Any]:
   216|         rsp: dict = {}
   217|         attrs = Spec.get_attrs(self.group)
   218|         # For v0.6+ simply use first coordinateSystem axes...
   219|         if "coordinateSystems" in attrs["multiscales"][0]:
   220|             axes = attrs["multiscales"][0]["coordinateSystems"][0]["axes"]
   221|         else:
```

### S048 lines 333-376 — cited by O-034

```text
   333|                 rsp["name"] = ch_names[0]
   334|                 if len(contrast_limits) > 0:
   335|                     rsp["contrast_limits"] = contrast_limits[0]
   336|                 rsp["visible"] = visibles[0]
   337| 
   338|         return rsp
   339| 
   340| 
   341| class Bioformats2raw(Spec):
   342|     @staticmethod
   343|     def matches(group: Group) -> bool:
   344|         attrs = Spec.get_attrs(group)
   345|         # Don't consider "plate" as a Bioformats2raw layout
   346|         return "bioformats2raw.layout" in attrs and "plate" not in attrs
   347| 
   348|     def children(self) -> list[Spec]:
   349|         # lookup children from series of OME/METADATA.xml
   350|         xml_data = SyncMixin()._sync(
   351|             self.group.store.get(
   352|                 "OME/METADATA.ome.xml", prototype=default_buffer_prototype()
   353|             )
   354|         )
   355|         root = ET.fromstring(xml_data.to_bytes())
   356|         rv: list[Spec] = []
   357|         for child in root:
   358|             # {http://www.openmicroscopy.org/Schemas/OME/2016-06}Image
   359|             node_id = child.attrib.get("ID", "")
   360|             if child.tag.endswith("Image") and node_id.startswith("Image:"):
   361|                 image_path = node_id.replace("Image:", "")
   362|                 g = self.group[image_path]
   363|                 if Multiscales.matches(g):
   364|                     rv.append(Multiscales(g))
   365|         return rv
   366| 
   367|     # override to NOT yield self since node has no data
   368|     def iter_nodes(self) -> Iterable[Spec]:
   369|         for child in self.children():
   370|             yield from child.iter_nodes()
   371| 
   372| 
   373| def cs_path_name(in_out: dict) -> str:
   374|     # helper to get [path/]name from 'input' or 'output' dict
   375|     name = in_out["name"]
   376|     if "path" in in_out:
```

### S048 lines 394-503 — cited by O-037

```text
   394|         for transf in node_transfs:
   395|             parents_copy = parent_trans[:]
   396|             parents_copy.append(transf)
   397|             yield from iter_graph(
   398|                 transf.get("input_full_path"), parents_copy, transforms
   399|             )
   400| 
   401| 
   402| class Scene(Spec):
   403|     @staticmethod
   404|     def matches(group: Group) -> bool:
   405|         attrs = Spec.get_attrs(group)
   406|         return "scene" in attrs
   407| 
   408|     def add_transforms_from_image(self, image_path: str, transforms: dict) -> None:
   409|         image_attrs = Spec.get_attrs(self.group[image_path])
   410|         # need to add child transforms to our graph
   411|         for ms in image_attrs.get("multiscales", []):
   412|             for child_transf in ms.get("coordinateTransformations", []):
   413|                 # TODO: assert output doesn't have 'path'?
   414|                 out_path_name = image_path + "/" + child_transf["output"]["name"]
   415|                 child_transf["input_full_path"] = (
   416|                     image_path + "/" + child_transf["input"]["name"]
   417|                 )
   418|                 transforms[out_path_name].append(child_transf)
   419|             # and the datasets... - find 'output' (just use first one)
   420|             for ds in ms.get("datasets", [])[:1]:
   421|                 # only expect single transform...
   422|                 for ds_transf in ds.get("coordinateTransformations", []):
   423|                     # TODO: assert output doesn't have 'path'?
   424|                     out_path_name = image_path + "/" + ds_transf["output"]["name"]
   425|                     # We ASSUME that ds_transf["input"]["path"] is same as ds path
   426|                     # Don't set 'input_full_path' as we are at child node of graph
   427|                     # Use this to create the Multiscales object below...
   428|                     ds_transf["multiscale_path"] = image_path
   429|                     transforms[out_path_name].append(ds_transf)
   430| 
   431|     def iter_nodes(self) -> Iterable[Spec]:
   432| 
   433|         # transforms key is each transform output "path.zarr/name"
   434|         # (where name is name of coordinateSystem)
   435|         # we build a LIST of child transforms that output to each coordinateSystem...
   436|         transforms = defaultdict(list)  # type: Dict[str, List[Dict[str, Any]]]
   437|         # track unique coordinateSystems by "path.zarr/name"
   438| 
   439|         # FIRST, go through all transforms in this scene,
   440|         # AND any child transforms we find at 'input' or 'output' paths...
   441|         scene_attrs = Spec.get_attrs(self.group).get("scene", {})
   442|         visited_paths = set()
   443|         for transf in scene_attrs.get("coordinateTransformations", []):
   444|             output = transf["output"]
   445|             transf["input_full_path"] = cs_path_name(transf["input"])
   446|             transforms[cs_path_name(output)].append(transf)
   447|             # traverse to input/output coordinateSystem paths...
   448|             for io in ("input", "output"):
   449|                 image_path = transf[io].get("path", None)
   450|                 if image_path is not None and image_path not in visited_paths:
   451|                     self.add_transforms_from_image(image_path, transforms)
   452|                     visited_paths.add(image_path)
   453| 
   454|         # Useful debug out to see the graph of transforms...
   455|         # print("Scene.iter_nodes...transforms")
   456|         # for key, transfs in transforms.items():
   457|         #     print(f"  {key}: ", [t["input_full_path"] for t in transfs])
   458|         #   translated_x_and_y:  ['4995115_full.zarr/physical', 'translated_x50']
   459|         #   4995115_full.zarr/physical:  ['4995115_full.zarr/s0']
   460|         #   translated_x50:  ['rot10.zarr/rotated', 'rot45.zarr/rotated']
   461|         #   rot10.zarr/rotated:  ['rot10.zarr/physical']
   462|         #   rot10.zarr/physical:  ['rot10.zarr/s0']
   463|         #   rot45.zarr/rotated:  ['rot45.zarr/physical']
   464|         #   rot45.zarr/physical:  ['rot45.zarr/s0']
   465| 
   466|         # find the unique coordinateSystems (outputs) that are NOT also inputs
   467|         outputs = set(transforms.keys())
   468|         for transf_list in transforms.values():
   469|             outputs -= {t.get("input_full_path") for t in transf_list}
   470| 
   471|         # if more than 1 output, pick the one with most child inputs
   472|         chosen_output = None
   473|         if len(outputs) > 1:
   474|             max_inputs = 0
   475|             for output in outputs:
   476|                 num_inputs = len(list(iter_graph(output, [], transforms)))
   477|                 if num_inputs > max_inputs:
   478|                     max_inputs = num_inputs
   479|                     chosen_output = output
   480|         else:
   481|             chosen_output = outputs.pop()
   482| 
   483|         # now iterate through the graph starting at the chosen output...
   484|         inputs = list(iter_graph(chosen_output, [], transforms))
   485|         # Ignore any transform lists that don't lead to a multiscale image...
   486|         multiscale_inputs = [inp for inp in inputs if "multiscale_path" in inp[-1]]
   487| 
   488|         for trans_list in multiscale_inputs:
   489|             # the last transform should have "multiscale_path" key...
   490|             ms_image = Multiscales(self.group[trans_list[-1]["multiscale_path"]])
   491|             # transforms list was created from [output,...,input]
   492|             # we reverse to get [input,...,output] to apply transforms in correct order
   493|             trans_list.reverse()
   494|             ms_image.parent_transforms = trans_list
   495|             yield ms_image
   496| 
   497| 
   498| class Plate(Spec):
   499|     @staticmethod
   500|     def matches(group: Group) -> bool:
   501|         return "plate" in Spec.get_attrs(group)
   502| 
   503|     def data(self) -> list[da.core.Array]:
```

### S048 lines 656-707 — cited by O-035

```text
   656|         }
   657|         # in case no colors, don't set colormap (no labels will be shown)
   658|         if len(colors) > 0:
   659|             rsp["colormap"] = colors
   660| 
   661|         return rsp
   662| 
   663| 
   664| def read_ome_zarr(root_group: Group) -> Callable:
   665|     def f(*args: Any, **kwargs: Any) -> List[LayerData]:
   666|         results: List[LayerData] = list()
   667| 
   668|         print("Root group", root_group.attrs.asdict())
   669| 
   670|         spec: Spec | None = None
   671| 
   672|         if Labels.matches(root_group):
   673|             # Try starting at parent Image
   674|             parent_path = root_group.store.root.parent
   675|             parent_group = zarr.open_group(parent_path)
   676|             if Multiscales.matches(parent_group):
   677|                 spec = Multiscales(parent_group)
   678|             else:
   679|                 # not sure how to handle this?
   680|                 spec = Labels(root_group)
   681|         elif Label.matches(root_group):
   682|             # Try starting at parent Image - up 2 dirs
   683|             parent_path = root_group.store.root.parent.parent
   684|             parent_group = zarr.open_group(parent_path)
   685|             if Multiscales.matches(parent_group):
   686|                 spec = Multiscales(parent_group)
   687|             else:
   688|                 # not sure how to handle this?
   689|                 spec = Label(root_group)
   690|         elif Bioformats2raw.matches(root_group):
   691|             spec = Bioformats2raw(root_group)
   692|         elif Multiscales.matches(root_group):
   693|             spec = Multiscales(root_group)
   694|         elif Plate.matches(root_group):
   695|             spec = Plate(root_group)
   696|         elif Scene.matches(root_group):
   697|             spec = Scene(root_group)
   698|         else:
   699|             print("No matching spec", root_group)
   700| 
   701|         if spec:
   702|             nodes = list(spec.iter_nodes())
   703|             for node in nodes:
   704|                 node_data = node.data()
   705|                 metadata = node.metadata()
   706|                 layer_type = "image"
   707|                 if Label.matches(node.group) or isinstance(node, PlateLabels):
```

## S049 — sources/S049.txt (25 lines; local-capture (origin URL not recorded))

### S049 lines 1-26 — cited by O-021

```text
     1| Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims.
     2| ╭─── ⌕ Web Search: Exa 5 sources ──────────────────────────────────────────────────────────────────╮
     3| │ Query: zarr-python v3 read performance many chunk files local disk chunk cache slow op…          │
     4| ├─── Answer ───────────────────────────────────────────────────────────────────────────────────────┤
     5| │ [1] Optimizing performance - zarr-python                                                         │
     6| │     https://zarr.readthedocs.io/en/latest/user-guide/performance/                                │
     7| │ [2] Sharded array is very slow to load · Issue #1343 · zarr-developers/zarr-python               │
     8| │     https://github.com/zarr-developers/zarr-python/issues/1343                                   │
     9| │ [3] Intel VTune results for Zarr-Python reading entire array · zarr-developers/zarr-benchmark ·  │
    10| │ Discussion #22 · GitHub                                                                          │
    11| │     https://github.com/zarr-developers/zarr-benchmark/discussions/22                             │
    12| │ [4] Performance regression in V3                                                                 │
    13| │     https://github.com/zarr-developers/zarr-python/issues/2710                                   │
    14| │ [5] Experimental features - zarr-python                                                          │
    15| │     https://zarr.readthedocs.io/en/v3.1.4/user-guide/experimental/                               │
    16| ├─── Sources ──────────────────────────────────────────────────────────────────────────────────────┤
    17| │ ├─ Optimizing performance - zarr-python (zarr.readthedocs.io)                                    │
    18| │ ├─ Sharded array is very slow to load · Issue #1343 · zarr-developers/zarr-python (github.com)   │
    19| │ ├─ Intel VTune results for Zarr-Python reading entire array · zarr-developers/zarr-…             │
    20| │ (github.com)                                                                                     │
    21| │ ├─ Performance regression in V3 (github.com)                                                     │
    22| │ └─ Experimental features - zarr-python (zarr.readthedocs.io)                                     │
    23| ├─── Metadata ─────────────────────────────────────────────────────────────────────────────────────┤
    24| │ Provider: Exa                                                                                    │
    25| ╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
    26| 
```

## S050 — sources/S050.txt (4024 lines; https://api.github.com/repos/hms-dbmi/vizarr/issues?state=open&per_page=100)

### S050 lines 1824-1840 — cited by O-072

```text
  1824|   "repository_url": "https://api.github.com/repos/hms-dbmi/vizarr",
  1825|   "labels_url": "https://api.github.com/repos/hms-dbmi/vizarr/issues/311/labels{/name}",
  1826|   "comments_url": "https://api.github.com/repos/hms-dbmi/vizarr/issues/311/comments",
  1827|   "events_url": "https://api.github.com/repos/hms-dbmi/vizarr/issues/311/events",
  1828|   "html_url": "https://github.com/hms-dbmi/vizarr/pull/311",
  1829|   "id": 3642949356,
  1830|   "node_id": "PR_kwDOEGbTuc60Xbt4",
  1831|   "number": 311,
  1832|   "title": "Z downsampling",
  1833|   "user": {
  1834|    "login": "will-moore",
  1835|    "id": 900055,
  1836|    "node_id": "MDQ6VXNlcjkwMDA1NQ==",
  1837|    "avatar_url": "https://avatars.githubusercontent.com/u/900055?v=4",
  1838|    "gravatar_id": "",
  1839|    "url": "https://api.github.com/users/will-moore",
  1840|    "html_url": "https://github.com/will-moore",
```

## S051 — sources/S051.txt (1195 lines; https://ngff.openmicroscopy.org/rfc/5/)

### S051 lines 79-129 — cited by O-053

```text
    79| Comments
    80| RFC-4 comment
    81| RFC-4: Comment 2
    82| Responses
    83| RFC-4: Response 1
    84| Versions
    85| RFC-4: Axis Anatomical Orientation
    86| RFC-4: Axis Orientation
    87| RFC-5: Coordinate Systems and Transformations
    88| Reviews
    89| RFC-5: Review 1
    90| RFC-5: Review 1b
    91| RFC-5: Review 2
    92| RFC-5: Review 2b
    93| Comments
    94| RFC-5: Comment 1
    95| RFC-5: Comment 2
    96| RFC-5: Comment 3
    97| RFC-5: Comment 4
    98| Responses
    99| RFC-5: Response 1 (2025-10-07 version)
   100| RFC-5: Response 2 (2025-11-18 version)
   101| Versions
   102| RFC-5 Coordinate systems and transformations (2024-07-30 version)
   103| RFC-5: Coordinate Systems and Transformations (2025-10-31 version)
   104| RFC-6: Flattening the multiscales array
   105| Comments
   106| RFC-6: Comment 1
   107| RFC-7: Channel provenance
   108| RFC-8: Collections and Extensibility
   109| Versions
   110| v0 – RFC-8: Collections
   111| v1 – RFC-8: Collections and Extensibility
   112| RFC-9: Zipped OME-Zarr
   113| Reviews
   114| RFC-9: Review 1
   115| RFC-9: Review 2
   116| RFC-9: Review 3
   117| Comments
   118| RFC-9: Comment 1
   119| RFC-9: Comment 2
   120| RFC-9: Comment 3
   121| RFC-9: Comment 4
   122| RFC-9: Comment 5
   123| RFC-9: Comment 6
   124| RFC-10: NGFF Governance and the Editorial Board
   125| RFCs
   126| RFC-5: Coordinate Systems and Transformations
   127| RFC-5: Coordinate Systems and Transformations#
   128| Add named coordinate systems and expand and clarify coordinate transformations. This document represents the updated proposal following the original RFC5 proposal and incorporates feedback from reviewers and implementers.
   129| Status#
```

## S052 — sources/S052.txt (647 lines; https://api.github.com/repos/ome/ome-zarr-py/releases?per_page=15)

### S052 lines 108-136 — cited by O-056

```text
   108|    "repos_url": "https://api.github.com/users/will-moore/repos",
   109|    "events_url": "https://api.github.com/users/will-moore/events{/privacy}",
   110|    "received_events_url": "https://api.github.com/users/will-moore/received_events",
   111|    "type": "User",
   112|    "user_view_type": "public",
   113|    "site_admin": false
   114|   },
   115|   "node_id": "RE_kwDOD5lzwM4Wt0hM",
   116|   "tag_name": "v0.19.0",
   117|   "target_commitish": "master",
   118|   "name": "v0.19.0",
   119|   "draft": false,
   120|   "immutable": false,
   121|   "prerelease": false,
   122|   "created_at": "2026-09-02T08:57:41Z",
   123|   "updated_at": "2026-09-02T09:06:03Z",
   124|   "published_at": "2026-09-02T09:06:03Z",
   125|   "assets": [],
   126|   "tarball_url": "https://api.github.com/repos/ome/ome-zarr-py/tarball/v0.19.0",
   127|   "zipball_url": "https://api.github.com/repos/ome/ome-zarr-py/zipball/v0.19.0",
   128|   "body": "## What's Changed\r\n* [pre-commit.ci] pre-commit autoupdate by @pre-commit-ci[bot] in https://github.com/ome/ome-zarr-py/pull/576\r\n* Introduce image class v06 by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/582\r\n* fix(tests): support plain-string codec attributes in zarr >= 3.3 by @d-v-b in https://github.com/ome/ome-zarr-py/pull/609\r\n* feat: set scaler to not supersede `scale_factors` arguments by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/611\r\n* Tightens type hint on Node.load so return type is that of spec_type arg by @Tomaz-Vieira in https://github.com/ome/ome-zarr-py/pull/601\r\n* Spatialdata and zipstores by @will-moore in https://github.com/ome/ome-zarr-py/pull/619\r\n* Be more permissive with version 0.5, allowing support for spatial-data ome zarrs by @pennycuda in https://github.com/ome/ome-zarr-py/pull/594\r\n* Ready for 06 by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/605\r\n* Ome zarr scene by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/612\r\n* deps: bump ome-zarr-models dependency by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/629\r\n* Fix failing pre-release test on main by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/631\r\n* No validation in init by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/623\r\n* deps: pin transformnd by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/635\r\n* allow python 3.12 by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/639\r\n* [pre-commit.ci] pre-commit autoupdate by @pre-commit-ci[bot] in https://github.com/ome/ome-zarr-py/pull/599\r\n* chore: precommit fixes by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/644\r\n* refactor: class-based API in sample data creator by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/622\r\n* find_multiscales() handles scenes by @will-moore in https://github.com/ome/ome-zarr-py/pull/637\r\n\r\n## New Contributors\r\n* @d-v-b made their first contribution in http [line truncated at 2000 chars; open the source]
   129|   "mentions_count": 6
   130|  },
   131|  {
   132|   "url": "https://api.github.com/repos/ome/ome-zarr-py/releases/372320968",
   133|   "assets_url": "https://api.github.com/repos/ome/ome-zarr-py/releases/372320968/assets",
   134|   "upload_url": "https://uploads.github.com/repos/ome/ome-zarr-py/releases/372320968/assets{?name,label}",
   135|   "html_url": "https://github.com/ome/ome-zarr-py/releases/tag/v0.19.0a0",
   136|   "id": 372320968,
```

### S052 lines 408-437 — cited by O-056

```text
   408|    "organizations_url": "https://api.github.com/users/will-moore/orgs",
   409|    "repos_url": "https://api.github.com/users/will-moore/repos",
   410|    "events_url": "https://api.github.com/users/will-moore/events{/privacy}",
   411|    "received_events_url": "https://api.github.com/users/will-moore/received_events",
   412|    "type": "User",
   413|    "user_view_type": "public",
   414|    "site_admin": false
   415|   },
   416|   "node_id": "RE_kwDOD5lzwM4Q6eeW",
   417|   "tag_name": "v0.13.0",
   418|   "target_commitish": "master",
   419|   "name": "v0.13.0",
   420|   "draft": false,
   421|   "immutable": false,
   422|   "prerelease": false,
   423|   "created_at": "2026-02-04T09:09:11Z",
   424|   "updated_at": "2026-02-06T14:03:54Z",
   425|   "published_at": "2026-02-06T14:03:54Z",
   426|   "assets": [],
   427|   "tarball_url": "https://api.github.com/repos/ome/ome-zarr-py/tarball/v0.13.0",
   428|   "zipball_url": "https://api.github.com/repos/ome/ome-zarr-py/zipball/v0.13.0",
   429|   "body": "## What's Changed\r\n* Fix zarr.group() to zarr.open_group() in test_read_v05 by @will-moore in https://github.com/ome/ome-zarr-py/pull/488\r\n* Use consistent version string for zarr lower bound by @jdblischak in https://github.com/ome/ome-zarr-py/pull/487\r\n* [pre-commit.ci] pre-commit autoupdate by @pre-commit-ci[bot] in https://github.com/ome/ome-zarr-py/pull/483\r\n* [pre-commit.ci] pre-commit autoupdate by @pre-commit-ci[bot] in https://github.com/ome/ome-zarr-py/pull/490\r\n* Tests ome zarr models py by @will-moore in https://github.com/ome/ome-zarr-py/pull/461\r\n* Default write_labels() uses nearest_neighbour to scale by @will-moore in https://github.com/ome/ome-zarr-py/pull/489\r\n* [pre-commit.ci] pre-commit autoupdate by @pre-commit-ci[bot] in https://github.com/ome/ome-zarr-py/pull/493\r\n* ome_zarr view doesn't try to check for images by @will-moore in https://github.com/ome/ome-zarr-py/pull/499\r\n* Handle Range headers in http server by @will-moore in https://github.com/ome/ome-zarr-py/pull/500\r\n* Change docstring for coordinate_transformations in write_image to match type annotation by @keller-mark in https://github.com/ome/ome-zarr-py/pull/506\r\n* fix recursion error if __store.fs.protocol is a tuple by @will-moore in https://github.com/ome/ome-zarr-py/pull/511\r\n* parse_url_deprecation by @will-moore in https://github.com/ome/ome-zarr-py/pull/476\r\n* Pin dask to 2026.1.1, fixes #518 by @will-moore in https://github.com/ome/ome-zarr-py/pull/520\r\n* Fix ruff warning by @DimitriPapadopoulos in https://github.com/ome/ome-zarr-py/pull/503\r\n* Expose __version__ and ignore generated _version.py by @Nirkan in https://github.com/ome/ome-zarr-py/pull/504\r\n* Ensure that laplacian and gaussian scaling preserves dtype by @will-moore in https://github.com/ome/ome-zarr-py/pull/496\r\n* [pre-commit.ci] pre-commit autoupdate by @pre-commit-ci[bot] in https://github.com/ome/ome-zarr-py/pull/497\r\n* release dask version requirements by @jo-mue [line truncated at 2000 chars; open the source]
   430|   "mentions_count": 7
   431|  },
   432|  {
   433|   "url": "https://api.github.com/repos/ome/ome-zarr-py/releases/241761109",
   434|   "assets_url": "https://api.github.com/repos/ome/ome-zarr-py/releases/241761109/assets",
   435|   "upload_url": "https://uploads.github.com/repos/ome/ome-zarr-py/releases/241761109/assets{?name,label}",
   436|   "html_url": "https://github.com/ome/ome-zarr-py/releases/tag/v0.12.2",
   437|   "id": 241761109,
```

## S053 — sources/S053.txt (268 lines; https://raw.githubusercontent.com/ome/ngff/v0.5/schemas/image.schema)

### S053 lines 14-38 — cited by O-016

```text
    14|     },
    15|     "omero": {
    16|      "$ref": "#/$defs/omero"
    17|     },
    18|     "version": {
    19|      "$ref": "https://ngff.openmicroscopy.org/0.5/schemas/_version.schema"
    20|     }
    21|    },
    22|    "required": [
    23|     "multiscales",
    24|     "version"
    25|    ]
    26|   }
    27|  },
    28|  "required": [
    29|   "ome"
    30|  ],
    31|  "$defs": {
    32|   "multiscales": {
    33|    "description": "The multiscale datasets for this image",
    34|    "type": "array",
    35|    "items": {
    36|     "type": "object",
    37|     "properties": {
    38|      "name": {
```

## S054 — sources/S054.txt (119 lines; https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr/zarr.json)

### S054 lines 1-120 — cited by O-017

```text
     1| {
     2|  "attributes": {
     3|   "ome": {
     4|    "version": "0.5",
     5|    "_creator": {
     6|     "name": "omero-zarr"
     7|    },
     8|    "multiscales": [
     9|     {
    10|      "axes": [
    11|       {
    12|        "name": "c",
    13|        "type": "channel"
    14|       },
    15|       {
    16|        "name": "z",
    17|        "type": "space",
    18|        "unit": "micrometer"
    19|       },
    20|       {
    21|        "name": "y",
    22|        "type": "space",
    23|        "unit": "micrometer"
    24|       },
    25|       {
    26|        "name": "x",
    27|        "type": "space",
    28|        "unit": "micrometer"
    29|       }
    30|      ],
    31|      "datasets": [
    32|       {
    33|        "coordinateTransformations": [
    34|         {
    35|          "scale": [
    36|           1.0,
    37|           0.5002025531914894,
    38|           0.3603981534640209,
    39|           0.3603981534640209
    40|          ],
    41|          "type": "scale"
    42|         }
    43|        ],
    44|        "path": "0"
    45|       },
    46|       {
    47|        "coordinateTransformations": [
    48|         {
    49|          "scale": [
    50|           1.0,
    51|           0.5002025531914894,
    52|           0.7207963069280418,
    53|           0.7207963069280418
    54|          ],
    55|          "type": "scale"
    56|         }
    57|        ],
    58|        "path": "1"
    59|       },
    60|       {
    61|        "coordinateTransformations": [
    62|         {
    63|          "scale": [
    64|           1.0,
    65|           0.5002025531914894,
    66|           1.4415926138560835,
    67|           1.4415926138560835
    68|          ],
    69|          "type": "scale"
    70|         }
    71|        ],
    72|        "path": "2"
    73|       }
    74|      ]
    75|     }
    76|    ],
    77|    "omero": {
    78|     "channels": [
    79|      {
    80|       "active": true,
    81|       "coefficient": 1.0,
    82|       "color": "0000FF",
    83|       "family": "linear",
    84|       "inverted": false,
    85|       "label": "LaminB1",
    86|       "window": {
    87|        "end": 1500.0,
    88|        "max": 65535.0,
    89|        "min": 0.0,
    90|        "start": 0.0
    91|       }
    92|      },
    93|      {
    94|       "active": true,
    95|       "coefficient": 1.0,
    96|       "color": "FFFF00",
    97|       "family": "linear",
    98|       "inverted": false,
    99|       "label": "Dapi",
   100|       "window": {
   101|        "end": 1500.0,
   102|        "max": 65535.0,
   103|        "min": 0.0,
   104|        "start": 0.0
   105|       }
   106|      }
   107|     ],
   108|     "id": 1,
   109|     "rdefs": {
   110|      "defaultT": 0,
   111|      "defaultZ": 118,
   112|      "model": "color"
   113|     }
   114|    }
   115|   }
   116|  },
   117|  "zarr_format": 3,
   118|  "node_type": "group"
   119| }
   120| 
```

## S055 — sources/S055.txt (74 lines; https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr/0/zarr.json)

### S055 lines 1-75 — cited by O-018

```text
     1| {
     2|  "chunk_grid": {
     3|   "configuration": {
     4|    "chunk_shape": [
     5|     1,
     6|     10,
     7|     512,
     8|     512
     9|    ]
    10|   },
    11|   "name": "regular"
    12|  },
    13|  "chunk_key_encoding": {
    14|   "name": "default"
    15|  },
    16|  "codecs": [
    17|   {
    18|    "configuration": {
    19|     "chunk_shape": [
    20|      1,
    21|      1,
    22|      256,
    23|      256
    24|     ],
    25|     "codecs": [
    26|      {
    27|       "configuration": {
    28|        "endian": "little"
    29|       },
    30|       "name": "bytes"
    31|      },
    32|      {
    33|       "configuration": {
    34|        "blocksize": 0,
    35|        "clevel": 5,
    36|        "cname": "zstd",
    37|        "shuffle": "shuffle",
    38|        "typesize": 2
    39|       },
    40|       "name": "blosc"
    41|      }
    42|     ],
    43|     "index_codecs": [
    44|      {
    45|       "configuration": {
    46|        "endian": "little"
    47|       },
    48|       "name": "bytes"
    49|      },
    50|      {
    51|       "name": "crc32c"
    52|      }
    53|     ]
    54|    },
    55|    "name": "sharding_indexed"
    56|   }
    57|  ],
    58|  "data_type": "uint16",
    59|  "dimension_names": [
    60|   "c",
    61|   "z",
    62|   "y",
    63|   "x"
    64|  ],
    65|  "fill_value": 0,
    66|  "node_type": "array",
    67|  "shape": [
    68|   2,
    69|   236,
    70|   275,
    71|   271
    72|  ],
    73|  "zarr_format": 3
    74| }
    75| 
```

## S056 — sources/S056.txt (320 lines; https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0090/190129.zarr/zarr.json)

### S056 lines 1-160 (truncated from 321) — cited by O-019

```text
     1| {
     2|  "attributes": {
     3|   "ome": {
     4|    "version": "0.5",
     5|    "_creator": {
     6|     "name": "ome2024-ngff-challenge",
     7|     "version": "1.0.0",
     8|     "notes": null
     9|    },
    10|    "plate": {
    11|     "columns": [
    12|      {
    13|       "name": "1"
    14|      },
    15|      {
    16|       "name": "2"
    17|      },
    18|      {
    19|       "name": "3"
    20|      },
    21|      {
    22|       "name": "4"
    23|      },
    24|      {
    25|       "name": "5"
    26|      },
    27|      {
    28|       "name": "6"
    29|      },
    30|      {
    31|       "name": "7"
    32|      },
    33|      {
    34|       "name": "8"
    35|      },
    36|      {
    37|       "name": "9"
    38|      },
    39|      {
    40|       "name": "10"
    41|      },
    42|      {
    43|       "name": "11"
    44|      }
    45|     ],
    46|     "field_count": 32,
    47|     "name": "190129",
    48|     "rows": [
    49|      {
    50|       "name": "A"
    51|      },
    52|      {
    53|       "name": "B"
    54|      },
    55|      {
    56|       "name": "C"
    57|      },
    58|      {
    59|       "name": "D"
    60|      },
    61|      {
    62|       "name": "E"
    63|      },
    64|      {
    65|       "name": "F"
    66|      }
    67|     ],
    68|     "wells": [
    69|      {
    70|       "columnIndex": 6,
    71|       "path": "B/7",
    72|       "rowIndex": 1
    73|      },
    74|      {
    75|       "columnIndex": 8,
    76|       "path": "D/9",
    77|       "rowIndex": 3
    78|      },
    79|      {
    80|       "columnIndex": 2,
    81|       "path": "E/3",
    82|       "rowIndex": 4
    83|      },
    84|      {
    85|       "columnIndex": 4,
    86|       "path": "F/5",
    87|       "rowIndex": 5
    88|      },
    89|      {
    90|       "columnIndex": 10,
    91|       "path": "B/11",
    92|       "rowIndex": 1
    93|      },
    94|      {
    95|       "columnIndex": 10,
    96|       "path": "F/11",
    97|       "rowIndex": 5
    98|      },
    99|      {
   100|       "columnIndex": 6,
   101|       "path": "C/7",
   102|       "rowIndex": 2
   103|      },
   104|      {
   105|       "columnIndex": 2,
   106|       "path": "B/3",
   107|       "rowIndex": 1
   108|      },
   109|      {
   110|       "columnIndex": 6,
   111|       "path": "F/7",
   112|       "rowIndex": 5
   113|      },
   114|      {
   115|       "columnIndex": 2,
   116|       "path": "D/3",
   117|       "rowIndex": 3
   118|      },
   119|      {
   120|       "columnIndex": 3,
   121|       "path": "B/4",
   122|       "rowIndex": 1
   123|      },
   124|      {
   125|       "columnIndex": 3,
   126|       "path": "C/4",
   127|       "rowIndex": 2
   128|      },
   129|      {
   130|       "columnIndex": 9,
   131|       "path": "C/10",
   132|       "rowIndex": 2
   133|      },
   134|      {
   135|       "columnIndex": 7,
   136|       "path": "C/8",
   137|       "rowIndex": 2
   138|      },
   139|      {
   140|       "columnIndex": 4,
   141|       "path": "D/5",
   142|       "rowIndex": 3
   143|      },
   144|      {
   145|       "columnIndex": 10,
   146|       "path": "E/11",
   147|       "rowIndex": 4
   148|      },
   149|      {
   150|       "columnIndex": 4,
   151|       "path": "C/5",
   152|       "rowIndex": 2
   153|      },
   154|      {
   155|       "columnIndex": 8,
   156|       "path": "F/9",
   157|       "rowIndex": 5
   158|      },
   159|      {
   160|       "columnIndex": 1,
```

## S057 — sources/S057.txt (1 lines; https://api.github.com/repos/AllenCell/agave/issues/220/comments?per_page=100; https://api.github.com/repos/google/tensorstore/releases?per_page=100; https://api.github.com/repos/hms-dbmi/vizarr/releases?per_page=10)

### S057 lines 1-2 — cited by O-078

```text
     1| []
     2| 
```

## S058 — sources/S058.txt (398 lines; https://docs.webknossos.org/webknossos/data/zarr.html; local-capture (origin URL not recorded))

### S058 lines 247-272 — cited by O-068

```text
   247| ON THIS PAGE
   248| Examples
   249| Zarr Folder Structure (v0.4)
   250| Zarr Folder Structure (v0.5)
   251| Conversion to Zarr
   252| Conversion with Python
   253| Time-Series and N-Dimensional Datasets
   254| Performance Considerations
   255| OME-Zarr & NGFF¶
   256| WEBKNOSSOS works great with OME-Zarr datasets, sometimes called next-generation file format (NGFF).
   257| We strongly believe in this community-driven, cloud-native data format for n-dimensional datasets. Therefore, Zarr is the new default data format in WEBKNOSSOS and replaced the previous WKW format.
   258| Zarr datasets can both be uploaded to WEBKNOSSOS through the web uploader or streamed from a remote server or the cloud. When streaming and using several layers, import the first Zarr group and then use the UI to add more URIs/groups.
   259| Examples¶
   260| You can try the OME-Zarr support with the following datasets. Load them in WEBKNOSSOS as a remote dataset:
   261| Mouse Cortex Layer 4 EM Cutout over HTTPs
   262| https://static.webknossos.org/data/l4_sample/
   263| Source: Dense connectomic reconstruction in layer 4 of the somatosensory cortex. Motta et al. Science 2019. 10.1126/science.aay3134
   264| Zarr Folder Structure (v0.4)¶
   265| WEBKNOSSOS expects the following file structure for OME-Zarr (v0.4) datasets:
   266| .                             # Root folder,
   267| │                             # with a flat list of images by image ID.
   268| │
   269| └── 456.zarr                  # Another image (id=456) converted to Zarr.
   270| │
   271| ├── .zgroup               # Each image is a Zarr group, or a folder, of other groups and arrays.
   272| ├── .zattrs               # Group level attributes are stored in the .zattrs file and include
```

## S060 — sources/S060.txt (29 lines; local-capture (origin URL not recorded))

### S060 lines 1-30 — cited by O-021

```text
     1| Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims.
     2| ╭─── ⌕ Web Search: Exa 5 sources ──────────────────────────────────────────────────────────────────╮
     3| │ Query: QuPath OME-Zarr read support zarr ngff pathology                                          │
     4| ├─── Answer ───────────────────────────────────────────────────────────────────────────────────────┤
     5| │ [1] Support remote ome-zarr · Pull Request #1638 · qupath/qupath                                 │
     6| │     https://github.com/qupath/qupath/pull/1638                                                   │
     7| │ [2] dimi-lab/qupath-extension-cloud-omezarr                                                      │
     8| │     https://github.com/dimi-lab/qupath-extension-cloud-omezarr                                   │
     9| │ [3] [QuPath 0.6.0rc1] Unable to read remote OME-Zarr by URL - Usage & Issues - Image.sc Forum    │
    10| │     https://forum.image.sc/t/qupath-0-6-0rc1-unable-to-read-remote-ome-zarr-by-url/101605        │
    11| │ [4] QuPath: loading OME-Zarr data from private S3 bucket (CESNET) - Image Analysis - Image.sc    │
    12| │ Forum                                                                                            │
    13| │     https://forum.image.sc/t/qupath-loading-ome-zarr-data-from-private-s3-bucket-cesnet/121674   │
    14| │ [5] Valid remote OME ZARR (v0.4) failing with Bio-Formats on windows - Usage & Issues - Image.sc │
    15| │ Forum                                                                                            │
    16| │                                                                                                  │
    17| │ https://forum.image.sc/t/valid-remote-ome-zarr-v0-4-failing-with-bio-formats-on-windows/116456   │
    18| ├─── Sources ──────────────────────────────────────────────────────────────────────────────────────┤
    19| │ ├─ Support remote ome-zarr · Pull Request #1638 · qupath/qupath (github.com)                     │
    20| │ ├─ dimi-lab/qupath-extension-cloud-omezarr (github.com)                                          │
    21| │ ├─ [QuPath 0.6.0rc1] Unable to read remote OME-Zarr by URL - Usage & Issues - I…                 │
    22| │ (forum.image.sc)                                                                                 │
    23| │ ├─ QuPath: loading OME-Zarr data from private S3 bucket (CESNET) - Image Analys…                 │
    24| │ (forum.image.sc)                                                                                 │
    25| │ └─ Valid remote OME ZARR (v0.4) failing with Bio-Formats on windows - Usage & I…                 │
    26| │ (forum.image.sc)                                                                                 │
    27| ├─── Metadata ─────────────────────────────────────────────────────────────────────────────────────┤
    28| │ Provider: Exa                                                                                    │
    29| ╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
    30| 
```

## S062 — sources/S062.txt (49 lines; https://raw.githubusercontent.com/allen-cell-animated/vole-app/main/README.md)

### S062 lines 1-23 — cited by O-059

```text
     1| # Vol-E App
     2| 
     3| <p>
     4|   <a href="https://www.npmjs.com/package/@aics/vole-app"><img src="https://img.shields.io/npm/v/%40aics%2Fvole-app" alt="npm package"></a>
     5| </p>
     6| 
     7| Volume Explorer (Vol-E) is a browser based volume viewer built with React and WebGL (Three.js). This package wraps the [vole-core](https://github.com/allen-cell-animated/vole-core) library.
     8| 
     9| For the latest stable release, please visit [https://vole.allencell.org](https://vole.allencell.org)
    10| 
    11| Volume data is provided to the core 3d viewer via one of the following file formats:
    12| 
    13| - a url to a OME-ZARR image
    14| - a url to a OME-TIFF file
    15| - a json file containing dimensions and other metadata, and texture atlases (png files containing volume slices tiled across the 2d image). These texture atlases must be prepared in advance before loading into this viewer.
    16| 
    17| The volume shader itself is a heavily modified version of one that has distant origins in [Bisque](http://bioimage.ucsb.edu/bisque).
    18| 
    19| ## to use
    20| 
    21| - `https://vole.allencell.org/?url=path/to/ZARR`
    22| - for more url parameters, see [`URL_SPEC.md`](documentation/URL_SPEC.md)
    23| 
```

## S065 — sources/S065.txt (43 lines; https://api.github.com/repos/ome/napari-ome-zarr/releases/tags/0.8.0)

### S065 lines 21-44 — cited by O-055

```text
    21|   "repos_url": "https://api.github.com/users/will-moore/repos",
    22|   "events_url": "https://api.github.com/users/will-moore/events{/privacy}",
    23|   "received_events_url": "https://api.github.com/users/will-moore/received_events",
    24|   "type": "User",
    25|   "user_view_type": "public",
    26|   "site_admin": false
    27|  },
    28|  "node_id": "RE_kwDOFiHkb84TbDXF",
    29|  "tag_name": "0.8.0",
    30|  "target_commitish": "main",
    31|  "name": "v0.8.0",
    32|  "draft": false,
    33|  "immutable": false,
    34|  "prerelease": false,
    35|  "created_at": "2026-05-08T08:20:07Z",
    36|  "updated_at": "2026-05-20T10:38:09Z",
    37|  "published_at": "2026-05-20T10:38:09Z",
    38|  "assets": [],
    39|  "tarball_url": "https://api.github.com/repos/ome/napari-ome-zarr/tarball/0.8.0",
    40|  "zipball_url": "https://api.github.com/repos/ome/napari-ome-zarr/zipball/0.8.0",
    41|  "body": "## What's Changed\r\n* drop ome-zarr dependency by @will-moore in https://github.com/ome/napari-ome-zarr/pull/123\r\n  * This moves some napari-specific logic out of ome-zarr-py and into napari-ome-zarr\r\n  *  Fixes Plate labels\r\n  *  Handles `bioformats2raw.layout` specification: All images in the series are opened. \r\n* livingobjects by @pwalczysko in https://github.com/ome/napari-ome-zarr/pull/148\r\n* remove old metadata files by @jo-mueller in https://github.com/ome/napari-ome-zarr/pull/150\r\n\r\n\r\n## New Contributors\r\n* @jo-mueller made their first contribution in https://github.com/ome/napari-ome-zarr/pull/150\r\n\r\n**Full Changelog**: https://github.com/ome/napari-ome-zarr/compare/v0.7.3...0.8.0",
    42|  "mentions_count": 3
    43| }
    44| 
```

## S066 — sources/S066.txt (26 lines; https://raw.githubusercontent.com/AllenInstitute/biofile-finder/main/dev-docs/01-project-layout.md)

### S066 lines 16-27 — cited by O-069

```text
    16| Both `desktop` and `web` depend on `core`. They are responsible for rendering the React component exported by `core` and wiring it together 
    17| with its Redux store. They may optionally define services that implement interfaces defined within `core`. These select interfaces are made 
    18| available for implementation outside of `core` because they are identified as being "platform-dependent," meaning we may accomplish 
    19| implementing the interfaces differently within Electron than within a traditional web browser--or we may opt to not implement a service within 
    20| one of those platforms altogether.
    21| 
    22| 
    23| ### Why the split
    24| The reasoning behind the split in packages is simple: it allows the application to be distributed both as a desktop
    25| application (internal-facing, more richly featured), which is the published artifact of `desktop`, and as a web application (external-facing, 
    26| feature-limited), which is the published artifact of `web`.
    27| 
```

## S067 — sources/S067.txt (15 lines; https://raw.githubusercontent.com/AllenInstitute/biofile-finder/main/dev-docs/03-using-localhost-datasource.md)

### S067 lines 1-16 — cited by O-069

```text
     1| Using a local `file-explorer-service`
     2| =====================================
     3| 
     4| Some features need to be developed across this codebase and the `file-explorer-service`. And in some other cases, it can
     5| be helpful to do manual testing via the frontend of a feature or bugfix done within `file-explorer-service`. In each of
     6| these situations, there is a mechanism built into the BioFile Finder for using a locally running version of the
     7| `file-explorer-service`.
     8| 
     9| Instructions:
    10| 1. Run `file-explorer-service` in your favorite way such that it is accessible from
    11| `http://localhost:9081/file-explorer-service`. Note that it must be running without SSL, accessible through `localhost`,
    12| and running on port `9081`. If you run `file-explorer-service` on one computer (e.g., an in-office workstation) but have
    13| the frontend running on another computer (e.g., your laptop), you can make the service available through `localhost` by
    14| making use of port forwarding (e.g.: `ssh -L 9081:localhost:9081 dev-aics-gmp-001.corp.alleninstitute.org -N -f`).
    15| 2. From within the running Electron application, under the "Data Source" menu bar option, select "Localhost."
    16| 
```

## S068 — sources/S068.txt (1 lines; https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr/.zattrs)

### S068 lines 1-1 — cited by O-020

```text
     1| Binary source retained; this CLI cannot extract application/octet-stream
```

## S069 — sources/S069.txt (23 lines; local-capture (origin URL not recorded))

### S069 lines 1-24 — cited by O-021

```text
     1| Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims.
     2| ╭─── ⌕ Web Search: Exa 5 sources ──────────────────────────────────────────────────────────────────╮
     3| │ Query: ome-ngff-tools viewer matrix 0.5 zarr v3 update 2026                                      │
     4| ├─── Answer ───────────────────────────────────────────────────────────────────────────────────────┤
     5| │ [1] ome-ngff-tools - GitHub Pages                                                                │
     6| │     https://ome.github.io/ome-ngff-tools/                                                        │
     7| │ [2] N/A                                                                                          │
     8| │     https://ngff.openmicroscopy.org/resources/tools/                                             │
     9| │ [3] ome/ome-ngff-tools                                                                           │
    10| │     https://github.com/ome/ome-ngff-tools                                                        │
    11| │ [4] NGFF weekly dev update thread - Page 5 - Development - Image.sc Forum                        │
    12| │     https://forum.image.sc/t/ngff-weekly-dev-update-thread/110810?page=5                         │
    13| │ [5] N/A                                                                                          │
    14| │     https://ngff.openmicroscopy.org/specifications/0.5/index.html                                │
    15| ├─── Sources ──────────────────────────────────────────────────────────────────────────────────────┤
    16| │ ├─ ome-ngff-tools - GitHub Pages (ome.github.io)                                                 │
    17| │ ├─ N/A (ngff.openmicroscopy.org)                                                                 │
    18| │ ├─ ome/ome-ngff-tools (github.com)                                                               │
    19| │ ├─ NGFF weekly dev update thread - Page 5 - Development - Image.sc Forum (forum.image.sc)        │
    20| │ └─ N/A (ngff.openmicroscopy.org)                                                                 │
    21| ├─── Metadata ─────────────────────────────────────────────────────────────────────────────────────┤
    22| │ Provider: Exa                                                                                    │
    23| ╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
    24| 
```

## S070 — sources/S070.txt (212 lines; https://ngff.openmicroscopy.org/resources/tools/)

### S070 lines 52-109 — cited by O-075

```text
    52| Tools for the programmatically inclined
    53| Zarr converters
    54| Zarr readers & writers
    55| Zarr validation
    56| Rendering libraries
    57| Tools with a graphical interface#
    58| Zarr viewers#
    59| Want to view a Zarr? Use one of these.
    60| Check this out to see viewer compatibility with various OME-Zarr features & versions.
    61| Name
    62| Link
    63| Description
    64| AGAVE
    65| Desktop application for viewing multichannel volume data powered by your GPU
    66| FIJI (MoBIE)
    67| MoBIE is a FIJI plug-in for exploring and sharing big multi-modal image and associated tabular data
    68| FIJI (BigDataViewer)
    69| BigDataViewer ships with FIJI and opens local or remote OME-Zarr via its HDF5/N5/Zarr/OME-NGFF Viewer, with support for multiscale pyramids and labels
    70| FIJI (BigVolumeBrowser)
    71| FIJI plugin for 3D vieweing and rendering of multiple (local and remote) multiscale datasets and labels, via n5-viewer and ome-zarr-fiji backends.
    72| FIJI (n5-ij)
    73| n5-ij is a FIJI plug-in for loading and saving image data to OME-Zarr and other formats supported by the N5 API
    74| FIJI (ome-zarr-fiji)
    75| ome-zarr-fiji is a FIJI plug-in offering drag & drop / copy & paste handlers for OME-Zarrs data.
    76| ITKWidgets
    77| Python tool for interactively viewing images (ex. in Jupyter)
    78| Kiln
    79| A WebGPU-native out-of-core rendering system for virtualized volumetric data
    80| Microscopy Nodes
    81| Blender add-on for visualizing high-dimensional microscopy data
    82| napari
    83| napari plug-in for viewing Zarr
    84| Neuroglancer
    85| A browser-based volume viewer
    86| Odon
    87| A spatial proteomics OME-Zarr viewer built in Rust.
    88| QuPath
    89| Open source software for digital pathology image analysis
    90| syGlass
    91| A VR desktop application for visualizing and segmenting 3D image data, with OME-Zarr streaming support.
    92| Vitessce
    93| Framework for visualization of spatial single-cell data, built using Viv.
    94| Vizarr
    95| Web app for viewing multi-scale, multiplexed OME-Zarr images (incl. HCS), built using Viv.
    96| Avivator
    97| Demo website that showcases the Viv rendering library.
    98| Vol-E
    99| A browser-based volume viewer
   100| WEBKNOSSOS
   101| An open-source tool for annotating and exploring large 3D image datasets
   102| Zarr converters (with a UI)#
   103| Want to convert your file to Zarr? Use one of these tools that has a user interface.
   104| Name
   105| Link
   106| Description
   107| NGFF-Converter
   108| A desktop application for conversion of bioimage formats into OME-Zarr or OME-TIFF.
   109| Tools for the programmatically inclined#
```

## S071 — sources/S071.txt (23 lines; local-capture (origin URL not recorded))

### S071 lines 1-24 — cited by O-021

```text
     1| Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims.
     2| ╭─── ⌕ Web Search: Exa 5 sources ──────────────────────────────────────────────────────────────────╮
     3| │ Query: AGAVE desktop viewer multichannel volume OME-Zarr GPU github                              │
     4| ├─── Answer ───────────────────────────────────────────────────────────────────────────────────────┤
     5| │ [1] AllenCell/agave: High quality visualization for volumetric ...                               │
     6| │     https://github.com/allen-cell-animated/agave                                                 │
     7| │ [2] AllenCell/agave                                                                              │
     8| │     https://github.com/AllenCell/agave                                                           │
     9| │ [3] User Interface Overview — AGAVE 1.10.0 documentation                                         │
    10| │     https://allen-cell-animated.github.io/agave/agave.html                                       │
    11| │ [4] AGAVE — AGAVE 1.9.0-rc.3 documentation                                                       │
    12| │     https://allen-cell-animated.github.io/agave/                                                 │
    13| │ [5] AGAVE 3D pathtrace image viewer                                                              │
    14| │     https://www.allencell.org/pathtrace-rendering.html                                           │
    15| ├─── Sources ──────────────────────────────────────────────────────────────────────────────────────┤
    16| │ ├─ AllenCell/agave: High quality visualization for volumetric ... (github.com)                   │
    17| │ ├─ AllenCell/agave (github.com)                                                                  │
    18| │ ├─ User Interface Overview — AGAVE 1.10.0 documentation (allen-cell-animated.github.io)          │
    19| │ ├─ AGAVE — AGAVE 1.9.0-rc.3 documentation (allen-cell-animated.github.io)                        │
    20| │ └─ AGAVE 3D pathtrace image viewer (allencell.org)                                               │
    21| ├─── Metadata ─────────────────────────────────────────────────────────────────────────────────────┤
    22| │ Provider: Exa                                                                                    │
    23| ╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
    24| 
```

## S072 — sources/S072.txt (147 lines; allen-cell-animated/agave:README.md; https://raw.githubusercontent.com/allen-cell-animated/agave/main/README.md)

### S072 lines 1-11 — cited by O-060

```text
     1| # AGAVE : Advanced GPU Accelerated Volume Explorer
     2| 
     3| AGAVE is a desktop application for viewing multichannel volume data. Several formats are supported, including OME-ZARR 0.4 and 0.5, OME-TIFF and Zeiss .czi files.
     4| 
     5| ![screenshot](https://github.com/user-attachments/assets/b96618f2-7020-4b93-936e-9b32b795ea83)
     6| 
     7| ## To install AGAVE:
     8| 
     9| [Install instructions](INSTALL.md)
    10| 
    11| ## How to build from source:
```

## S077 — sources/S077.txt (1 lines; local-capture (origin URL not recorded))

### S077 lines 1-1 — cited by O-022

```text
     1| HTTPError: HTTP Error 422: Unprocessable Entity
```

## S081 — sources/S081.txt (96 lines; https://api.github.com/repos/AllenCell/agave/issues/258; https://api.github.com/repos/allen-cell-animated/agave/issues/258)

### S081 lines 50-66 — cited by O-067

```text
    50|   "percent_completed": 0
    51|  },
    52|  "issue_dependencies_summary": {
    53|   "blocked_by": 0,
    54|   "total_blocked_by": 0,
    55|   "blocking": 0,
    56|   "total_blocking": 0
    57|  },
    58|  "body": "## Description\n\nThe zarr doesn't automatically load in agave, but it can be loaded by manually pasting the zarr url in the \"open from url\" dialog.\nhttps://github.com/AllenInstitute/biofile-finder/issues/503\nThis bug may be exclusively on the BFF side, but just adding here in case agave is doing something wrong.\n\n## Expected Behavior\n\nexpect zarr to automatically load \n\n## Reproduction\n\nhttps://github.com/AllenInstitute/biofile-finder/issues/503\n",
    59|  "closed_by": {
    60|   "login": "toloudis",
    61|   "id": 2193409,
    62|   "node_id": "MDQ6VXNlcjIxOTM0MDk=",
    63|   "avatar_url": "https://avatars.githubusercontent.com/u/2193409?v=4",
    64|   "gravatar_id": "",
    65|   "url": "https://api.github.com/users/toloudis",
    66|   "html_url": "https://github.com/toloudis",
```

## S082 — sources/S082.txt (92 lines; https://api.github.com/repos/AllenCell/agave/issues/220; https://api.github.com/repos/allen-cell-animated/agave/issues/220)

### S082 lines 47-63 — cited by O-067

```text
    47|  "draft": false,
    48|  "pull_request": {
    49|   "url": "https://api.github.com/repos/AllenCell/agave/pulls/220",
    50|   "html_url": "https://github.com/AllenCell/agave/pull/220",
    51|   "diff_url": "https://github.com/AllenCell/agave/pull/220.diff",
    52|   "patch_url": "https://github.com/AllenCell/agave/pull/220.patch",
    53|   "merged_at": "2025-03-22T23:13:29Z"
    54|  },
    55|  "body": "Add the ability to load from the latest OME-NGFF conversion test datasets. \r\nExample data is here:  https://samples-viewer--ome2024-ngff-challenge.netlify.app/?csv=https://raw.githubusercontent.com/will-moore/ome2024-ngff-challenge/samples_viewer/samples/ngff_samples.csv\r\n\r\nThis is a very barebones first try but it seems to load basically all of the files.  It doesn't try to load any extra metadata yet.  Thankfully the `axes` and `datasets` follow basically the same schema.  If that schema diverges then this code has to be refactored again. \r\n\r\nThe big assumption I am making is that OME-NGFF 0.4 is always zarrv2 and if we find a zarrv3 zarr.json file, then I am assuming a OME-NGFF 0.5 json file.   A further PR can add some extra logic and validation around this but for now things seem to be working.  Anything outside this assumption will error out in some way.\r\n",
    56|  "closed_by": {
    57|   "login": "toloudis",
    58|   "id": 2193409,
    59|   "node_id": "MDQ6VXNlcjIxOTM0MDk=",
    60|   "avatar_url": "https://avatars.githubusercontent.com/u/2193409?v=4",
    61|   "gravatar_id": "",
    62|   "url": "https://api.github.com/users/toloudis",
    63|   "html_url": "https://github.com/toloudis",
```

## S083 — sources/S083.txt (49 lines; https://api.github.com/repos/AllenCell/agave/issues/258/comments?per_page=100; https://api.github.com/repos/allen-cell-animated/agave/issues/258/comments)

### S083 lines 23-39 — cited by O-067

```text
    23|    "events_url": "https://api.github.com/users/toloudis/events{/privacy}",
    24|    "received_events_url": "https://api.github.com/users/toloudis/received_events",
    25|    "type": "User",
    26|    "user_view_type": "public",
    27|    "site_admin": false
    28|   },
    29|   "created_at": "2025-07-10T18:14:43Z",
    30|   "updated_at": "2025-07-10T18:14:43Z",
    31|   "body": "seems fixed on BFF side.",
    32|   "author_association": "CONTRIBUTOR",
    33|   "pin": null,
    34|   "reactions": {
    35|    "url": "https://api.github.com/repos/AllenCell/agave/issues/comments/3058453074/reactions",
    36|    "total_count": 0,
    37|    "+1": 0,
    38|    "-1": 0,
    39|    "laugh": 0,
```

## S091 — sources/S091.txt (3398 lines; https://api.github.com/repos/AllenCell/agave/releases?per_page=100)

### S091 lines 22-52 — cited by O-076

```text
    22|    "repos_url": "https://api.github.com/users/github-actions%5Bbot%5D/repos",
    23|    "events_url": "https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}",
    24|    "received_events_url": "https://api.github.com/users/github-actions%5Bbot%5D/received_events",
    25|    "type": "Bot",
    26|    "user_view_type": "public",
    27|    "site_admin": false
    28|   },
    29|   "node_id": "RE_kwDODyJwMs4VEbtp",
    30|   "tag_name": "v1.10.0",
    31|   "target_commitish": "main",
    32|   "name": "v1.10.0",
    33|   "draft": false,
    34|   "immutable": false,
    35|   "prerelease": false,
    36|   "created_at": "2026-07-13T21:35:07Z",
    37|   "updated_at": "2026-07-13T23:35:41Z",
    38|   "published_at": "2026-07-13T23:35:41Z",
    39|   "assets": [
    40|    {
    41|     "url": "https://api.github.com/repos/AllenCell/agave/releases/assets/476004194",
    42|     "id": 476004194,
    43|     "node_id": "RA_kwDODyJwMs4cXz9i",
    44|     "name": "agave-1.10.0-macos-arm64.dmg",
    45|     "label": "",
    46|     "uploader": {
    47|      "login": "github-actions[bot]",
    48|      "id": 41898282,
    49|      "node_id": "MDM6Qm90NDE4OTgyODI=",
    50|      "avatar_url": "https://avatars.githubusercontent.com/in/15368?v=4",
    51|      "gravatar_id": "",
    52|      "url": "https://api.github.com/users/github-actions%5Bbot%5D",
```

## S095 — sources/S095.txt (1 lines; allen-cell-animated/agave:)

### S095 lines 1-1 — cited by O-022

```text
     1| ValueError: Git metadata is not a document source
```

## S096 — sources/S096.txt (28 lines; allen-cell-animated/agave:)

### S096 lines 1-9 — cited by O-022

```text
     1| README.md:23:**tensorstore** requires:
     2| README.md:27:- Perl, for building libaom from source (default). Must be in PATH. Not required if -DTENSORSTORE_USE_SYSTEM_LIBAOM=ON is specified.
     3| README.md:28:- NASM, for building libjpeg-turbo, libaom, and dav1d from source (default). Must be in PATH.Not required if -DTENSORSTORE*USE_SYSTEM*{JPEG,LIBAOM,DAV1D}=ON is specified.
     4| renderlib/io/CMakeLists.txt:32:# Use these system/vcpkg-provided dependencies instead of tensorstore's bundled ones.
     5| renderlib/io/CMakeLists.txt:33:set(TENSORSTORE_USE_SYSTEM_TIFF ON)
     6| renderlib/io/CMakeLists.txt:34:set(TENSORSTORE_USE_SYSTEM_ZLIB ON)
     7| renderlib/io/CMakeLists.txt:35:set(TENSORSTORE_USE_SYSTEM_CURL ON)
     8| renderlib/io/CMakeLists.txt:37:	tensorstore
     9| renderlib/io/CMakeLists.txt:38:        URL "https://github.com/google/tensorstore/archive/refs/tags/v0.1.78.tar.gz"
```

## S098 — sources/S098.txt (302 lines; https://github.com/AllenCell/agave/pull/220.diff)

### S098 lines 64-85 — cited by O-080

```text
    64| diff --git a/renderlib/io/FileReader.cpp b/renderlib/io/FileReader.cpp
    65| index 89a7ceb70..a55c528ae 100644
    66| --- a/renderlib/io/FileReader.cpp
    67| +++ b/renderlib/io/FileReader.cpp
    68| @@ -55,6 +55,13 @@ FileReader::getReader(const std::string& filepath, bool isImageSequence)
    69|    } else if (extstr == ".zarr") {
    70|      return new FileReaderZarr(filepath);
    71|    }
    72| +  // if it's a directory, and contains the string zarr anywhere, we assume it's a zarr
    73| +  else if (std::filesystem::is_directory(filepath)) {
    74| +    if (filepath.find("zarr") != std::string::npos) {
    75| +      return new FileReaderZarr(filepath);
    76| +    }
    77| +  }
    78| +  
    79|    return nullptr;
    80|  }
    81|  
    82| diff --git a/renderlib/io/FileReaderZarr.cpp b/renderlib/io/FileReaderZarr.cpp
    83| index 3a896a478..b87f69493 100644
    84| --- a/renderlib/io/FileReaderZarr.cpp
    85| +++ b/renderlib/io/FileReaderZarr.cpp
```

## S102 — sources/S102.txt (6 lines; https://api.github.com/search/issues?q=repo%3AAllenCell%2Fagave+shard&per_page=100)

### S102 lines 1-7 — cited by O-077

```text
     1| {
     2|  "total_count": 0,
     3|  "incomplete_results": false,
     4|  "items": [],
     5|  "search_type": "lexical"
     6| }
     7| 
```

## S103 — sources/S103.txt (76 lines; https://api.github.com/repos/AllenCell/agave/issues/84)

### S103 lines 3-19 — cited by O-064

```text
     3|  "repository_url": "https://api.github.com/repos/AllenCell/agave",
     4|  "labels_url": "https://api.github.com/repos/AllenCell/agave/issues/84/labels{/name}",
     5|  "comments_url": "https://api.github.com/repos/AllenCell/agave/issues/84/comments",
     6|  "events_url": "https://api.github.com/repos/AllenCell/agave/issues/84/events",
     7|  "html_url": "https://github.com/AllenCell/agave/issues/84",
     8|  "id": 1578271934,
     9|  "node_id": "I_kwDODyJwMs5eEoS-",
    10|  "number": 84,
    11|  "title": "load data asynchronously and incrementally",
    12|  "user": {
    13|   "login": "toloudis",
    14|   "id": 2193409,
    15|   "node_id": "MDQ6VXNlcjIxOTM0MDk=",
    16|   "avatar_url": "https://avatars.githubusercontent.com/u/2193409?v=4",
    17|   "gravatar_id": "",
    18|   "url": "https://api.github.com/users/toloudis",
    19|   "html_url": "https://github.com/toloudis",
```

## S104 — sources/S104.txt (76 lines; https://api.github.com/repos/AllenCell/agave/issues/323)

### S104 lines 3-19 — cited by O-064

```text
     3|  "repository_url": "https://api.github.com/repos/AllenCell/agave",
     4|  "labels_url": "https://api.github.com/repos/AllenCell/agave/issues/323/labels{/name}",
     5|  "comments_url": "https://api.github.com/repos/AllenCell/agave/issues/323/comments",
     6|  "events_url": "https://api.github.com/repos/AllenCell/agave/issues/323/events",
     7|  "html_url": "https://github.com/AllenCell/agave/issues/323",
     8|  "id": 3929385376,
     9|  "node_id": "I_kwDODyJwMs7qNamg",
    10|  "number": 323,
    11|  "title": "preload and cache whole time series",
    12|  "user": {
    13|   "login": "toloudis",
    14|   "id": 2193409,
    15|   "node_id": "MDQ6VXNlcjIxOTM0MDk=",
    16|   "avatar_url": "https://avatars.githubusercontent.com/u/2193409?v=4",
    17|   "gravatar_id": "",
    18|   "url": "https://api.github.com/users/toloudis",
    19|   "html_url": "https://github.com/toloudis",
```

## S105 — sources/S105.txt (96 lines; https://api.github.com/repos/AllenCell/agave/issues/402)

### S105 lines 3-19 — cited by O-064

```text
     3|  "repository_url": "https://api.github.com/repos/AllenCell/agave",
     4|  "labels_url": "https://api.github.com/repos/AllenCell/agave/issues/402/labels{/name}",
     5|  "comments_url": "https://api.github.com/repos/AllenCell/agave/issues/402/comments",
     6|  "events_url": "https://api.github.com/repos/AllenCell/agave/issues/402/events",
     7|  "html_url": "https://github.com/AllenCell/agave/issues/402",
     8|  "id": 4951030481,
     9|  "node_id": "I_kwDODyJwMs8AAAABJxq60Q",
    10|  "number": 402,
    11|  "title": "see if cache hits can be faster",
    12|  "user": {
    13|   "login": "toloudis",
    14|   "id": 2193409,
    15|   "node_id": "MDQ6VXNlcjIxOTM0MDk=",
    16|   "avatar_url": "https://avatars.githubusercontent.com/u/2193409?v=4",
    17|   "gravatar_id": "",
    18|   "url": "https://api.github.com/users/toloudis",
    19|   "html_url": "https://github.com/toloudis",
```

## S108 — sources/S108.txt (43 lines; allen-cell-animated/agave:HELP.txt)

### S108 lines 2-25 — cited by O-062

```text
     2| DESKTOP VIEWER DOCUMENTATION
     3| 
     4| The volume viewer is designed and optimized for display of multi-channel 16-bit unsigned OME TIFF and CZI files.
     5| 
     6| 1. This viewer requires a current OpenGL driver.  A discrete GPU is preferred for best performance. (start at https://www.nvidia.com/drivers).
     7| 
     8| 2. Unzip the zip file and run the AGAVE app.  A GUI window will open. If initialization fails for some reason, a logfile.log file will be produced in the same directory as the app.
     9| 
    10| 3. File-->Open volume...  The viewer currently only supports .tif or .czi files containing z-stack data.  Currently only 16-bit unsigned pixels are supported.  
    11| The volume data must fit in GPU memory uncompressed, so please try loading no more than a few GB.  Files containing time sequences will only load the first time sample.  The test data set for the development of this viewer was data from the Allen Institute’s Cell Science accelerator.  Images from that data set are found at https://www.allencell.org/3d-cell-viewer.html and https://www.allencell.org/cell-feature-explorer.html where you can load a cell into the 3D viewer in your browser and click the Download button to get the full resolution OME TIFF file. Those images should load correctly into this viewer.
    12| 
    13| 4. Initially, it is likely that your volume data will appear as a solid brick.  The Appearance panel is the one to focus on first.  Note that you can "tear away" the tab to place it anywhere on your desktop and resize it. (Drag and drop from the "Appearance" title area.)
    14| 
    15| 5. At the bottom of the Appearance tab (after the Lighting section) will be the controls for each channel in your volume data. The first adjustment to make is typically to drag the "Pct Min" slider to the right.   Moving the sliders will control the relative intensities of the volume data in the rendering.
    16| 
    17| 5a. Up to four channels can be displayed at a time. Hide or show channels by clicking the checkbox at the top right of each channel's section in the panel. 
    18| 
    19| 6. Rotate in the 3D view with left-click dragging.  Zoom in and out with right-click drag up/down.  Pan the volume with middle-click drag.
    20| 
    21| 7. Once you can see the expected structure in your volume data, you can start exploring the other controls. The most coarse grained controls for overall image appearance are:  Exposure (Camera panel) and Scattering Density (Appearance panel).  Use Camera Aperture Size and Camera Focal Distance to control depth of field blurring.  
    22| 
    23| 8. The Lighting section lets you control two light sources:  one square-shaped area light, and one spherical environment light that has a three color gradient from north pole to south pole.
    24| 
    25| 9. The Appearance panel has a ROI section to enable you to clip the volume along its axes.
```

## S109 — sources/S109.txt (2741 lines; https://api.github.com/search/issues?q=repo%3Agoogle%2Ftensorstore+zarr3&per_page=100)

### S109 lines 7-23 — cited by O-074

```text
     7|    "repository_url": "https://api.github.com/repos/google/tensorstore",
     8|    "labels_url": "https://api.github.com/repos/google/tensorstore/issues/280/labels{/name}",
     9|    "comments_url": "https://api.github.com/repos/google/tensorstore/issues/280/comments",
    10|    "events_url": "https://api.github.com/repos/google/tensorstore/issues/280/events",
    11|    "html_url": "https://github.com/google/tensorstore/issues/280",
    12|    "id": 3903497431,
    13|    "node_id": "I_kwDODvq4Ss7oqqTX",
    14|    "number": 280,
    15|    "title": "Zarr3 chunking issues",
    16|    "user": {
    17|     "login": "Empyreus",
    18|     "id": 11038099,
    19|     "node_id": "MDQ6VXNlcjExMDM4MDk5",
    20|     "avatar_url": "https://avatars.githubusercontent.com/u/11038099?v=4",
    21|     "gravatar_id": "",
    22|     "url": "https://api.github.com/users/Empyreus",
    23|     "html_url": "https://github.com/Empyreus",
```

## S111 — sources/S111.txt (96 lines; https://api.github.com/repos/google/tensorstore/issues/240)

### S111 lines 3-19 — cited by O-070

```text
     3|  "repository_url": "https://api.github.com/repos/google/tensorstore",
     4|  "labels_url": "https://api.github.com/repos/google/tensorstore/issues/240/labels{/name}",
     5|  "comments_url": "https://api.github.com/repos/google/tensorstore/issues/240/comments",
     6|  "events_url": "https://api.github.com/repos/google/tensorstore/issues/240/events",
     7|  "html_url": "https://github.com/google/tensorstore/issues/240",
     8|  "id": 3233223683,
     9|  "node_id": "I_kwDODvq4Ss7AtxQD",
    10|  "number": 240,
    11|  "title": "Zarr3 C++ Read Subset Issue",
    12|  "user": {
    13|   "login": "Empyreus",
    14|   "id": 11038099,
    15|   "node_id": "MDQ6VXNlcjExMDM4MDk5",
    16|   "avatar_url": "https://avatars.githubusercontent.com/u/11038099?v=4",
    17|   "gravatar_id": "",
    18|   "url": "https://api.github.com/users/Empyreus",
    19|   "html_url": "https://github.com/Empyreus",
```

## S112 — sources/S112.txt (1984 lines; https://api.github.com/search/issues?q=repo%3AAllenCell%2Fagave+label+OR+segmentation&per_page=100)

### S112 lines 7-23 — cited by O-065

```text
     7|    "repository_url": "https://api.github.com/repos/AllenCell/agave",
     8|    "labels_url": "https://api.github.com/repos/AllenCell/agave/issues/42/labels{/name}",
     9|    "comments_url": "https://api.github.com/repos/AllenCell/agave/issues/42/comments",
    10|    "events_url": "https://api.github.com/repos/AllenCell/agave/issues/42/events",
    11|    "html_url": "https://github.com/AllenCell/agave/issues/42",
    12|    "id": 1258475489,
    13|    "node_id": "I_kwDODyJwMs5LAs_h",
    14|    "number": 42,
    15|    "title": "load channels from separate files into same session",
    16|    "user": {
    17|     "login": "toloudis",
    18|     "id": 2193409,
    19|     "node_id": "MDQ6VXNlcjIxOTM0MDk=",
    20|     "avatar_url": "https://avatars.githubusercontent.com/u/2193409?v=4",
    21|     "gravatar_id": "",
    22|     "url": "https://api.github.com/users/toloudis",
    23|     "html_url": "https://github.com/toloudis",
```

## S113 — sources/S113.txt (190 lines; https://api.github.com/repos/google/tensorstore/issues/240/comments?per_page=100)

### S113 lines 23-39 — cited by O-070

```text
    23|    "events_url": "https://api.github.com/users/laramiel/events{/privacy}",
    24|    "received_events_url": "https://api.github.com/users/laramiel/received_events",
    25|    "type": "User",
    26|    "user_view_type": "public",
    27|    "site_admin": false
    28|   },
    29|   "created_at": "2025-07-15T19:32:33Z",
    30|   "updated_at": "2025-07-15T19:34:35Z",
    31|   "body": "Since this example is incomplete it's actually hard to say what you are doing. This is my working example, so you'll need to look at what's different. Or better yet, provide an actual reproduction repository with BUILD files and everything.\n\n```\n#include <stddef.h>\n\n#include <nlohmann/json.hpp>\n\n#include \"absl/flags/flag.h\"\n#include \"absl/log/absl_log.h\"\n#include \"tensorstore/context.h\"\n#include \"tensorstore/index_space/dim_expression.h\"\n#include \"tensorstore/open.h\"\n#include \"tensorstore/open_mode.h\"\n#include \"tensorstore/tensorstore.h\"\n#include \"tensorstore/util/future.h\"\n#include \"tensorstore/util/result.h\"\n\nint main(int argc, char** argv) {\n  absl::ParseCommandLine(argc, argv);\n\n  auto context = tensorstore::Context::Default();\n  auto file = tensorstore::Open({{\"driver\", \"zarr3\"},\n                                 {\"kvstore\", \"file:///tmp/example/\"},\n                                 {\"metadata\",\n                                  {\n                                      {\"data_type\", \"float64\"},\n                                      {\"shape\", {100, 100, 100}},\n                                      {\"codecs\",\n                                       {{{\"name\", \"blosc\"},\n                                         {\"configuration\",\n                                          {{\"cname\", \"blosclz\"},\n                                           {\"clevel\", 3},\n                                           {\"shuffle\", \"noshuffle\"}}}}}},\n                                  }}},\n                                context, tensorstore::OpenMode::open_or_create);\n  auto read_future =\n      tensorstore::Read(file.result() | tensorstore::Dims(0).IndexSlice(0));\n\n  ABSL_LOG(INFO) << read_future.status();\n}\n```\n\nFor what it's worth, the error you are seeing is as C++ syntax error which likely indicates that you are trying to take a reference to a temporary object.\n\n",
    32|   "author_association": "COLLABORATOR",
    33|   "pin": null,
    34|   "reactions": {
    35|    "url": "https://api.github.com/repos/google/tensorstore/issues/comments/3075226024/reactions",
    36|    "total_count": 0,
    37|    "+1": 0,
    38|    "-1": 0,
    39|    "laugh": 0,
```

## S114 — sources/S114.txt (597 lines; https://api.github.com/search/issues?q=repo%3AAllenCell%2Fagave+%22memory%22+OR+%22downsample%22+in%3Atitle&per_page=100)

### S114 lines 7-23 — cited by O-066

```text
     7|    "repository_url": "https://api.github.com/repos/AllenCell/agave",
     8|    "labels_url": "https://api.github.com/repos/AllenCell/agave/issues/54/labels{/name}",
     9|    "comments_url": "https://api.github.com/repos/AllenCell/agave/issues/54/comments",
    10|    "events_url": "https://api.github.com/repos/AllenCell/agave/issues/54/events",
    11|    "html_url": "https://github.com/AllenCell/agave/issues/54",
    12|    "id": 1258545406,
    13|    "node_id": "I_kwDODyJwMs5LA-D-",
    14|    "number": 54,
    15|    "title": "downsample data at load time",
    16|    "user": {
    17|     "login": "toloudis",
    18|     "id": 2193409,
    19|     "node_id": "MDQ6VXNlcjIxOTM0MDk=",
    20|     "avatar_url": "https://avatars.githubusercontent.com/u/2193409?v=4",
    21|     "gravatar_id": "",
    22|     "url": "https://api.github.com/users/toloudis",
    23|     "html_url": "https://github.com/toloudis",
```

## S115 — sources/S115.txt (24 lines; allen-cell-animated/agave:docs/index.rst)

### S115 lines 4-22 — cited by O-059

```text
     4|    contain the root `toctree` directive.
     5| 
     6| =====
     7| AGAVE
     8| =====
     9| Advanced GPU Accelerated Volume Explorer
    10| ========================================
    11| 
    12| AGAVE is a desktop application for viewing multichannel volume data.
    13| 
    14| AGAVE's core viewing engine uses a "progressive path tracer". During interactive use, your image will appear grainy at first, but will refine over time as the rendering system builds up more and more render passes. The speed of refinement depends on your hardware, the size and complexity of the image, and the AGAVE parameters you set, i.e., the faster your GPU, the quicker a rendering will resolve. GPU memory dictates the maximum size of the files AGAVE can load. As soon as you change any viewing parameter, including your camera angle, the rendering will start over.
    15| 
    16| If you use AGAVE in your research, please :ref:`cite <Citation>` it.
    17| 
    18| .. toctree::
    19|    :includehidden:
    20|    :maxdepth: 2
    21|    :caption: Contents
    22| 
```

## S117 — sources/S117.txt (904 lines; allen-cell-animated/agave:docs/agave.rst)

### S117 lines 18-55 — cited by O-060

```text
    18| to move the horizontal sliders. In that case, it can help to un-dock the
    19| panel and stretch it wider.
    20| 
    21| If you close any panels, you can always reopen them from the View menu.
    22| 
    23| Loading volume data
    24| -------------------
    25| 
    26| AGAVE can load multi-scene, multi-time, and multi-channel files. It can
    27| present up to 4 channels concurrently and offers a time slider when time
    28| channels are detected.
    29| 
    30| Metadata embedded in the file is important for AGAVE to display the
    31| volume properly. AGAVE can decode OME metadata (OME-TIFF files), ImageJ
    32| metadata (TIFF files exported from ImageJ/FIJI), Zeiss CZI metadata, and OME-Zarr metadata.
    33| 
    34| We recommend preparing or converting your volumetric files to OME-TIFF or OME-Zarr
    35| (see `Preparing an AGAVE Compatible ome-tiff file with
    36| Fiji <#preparing-an-agave-compatible-ome-tiff-file-with-fiji>`__ to
    37| ensure the expected data structure, channel order, etc.)
    38| 
    39| AGAVE currently supports the following file formats:
    40| * .zarr (OME-Zarr only - https://ngff.openmicroscopy.org/latest/)
    41| * .ome.tiff (see https://docs.openmicroscopy.org/ome-model/latest/)
    42| * .tiff
    43| * .czi (Produced by Zeiss microscopes. See https://www.zeiss.com/microscopy/en/products/software/zeiss-zen/czi-image-file-format.html)
    44| * .map/.mrc (Typically used in electron cryo-microscopy. See https://www.ccpem.ac.uk/mrc_format/mrc_format.php)
    45| AGAVE can read 8-bit, 16-bit unsigned, or 32-bit float pixel intensities.
    46| 
    47| OME-Zarr data is not stored as single files - instead it is a directory.  AGAVE can load OME-Zarr data either from a local directory or from a public cloud URL using https, s3, or gc protocols.
    48| 
    49| Open file, directory or URL
    50| ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    51| 
    52| File-->Open file or \[Open file\] toolbar button
    53| File-->Open directory or \[Open directory\] toolbar button
    54| File-->Open from URL or \[Open from URL\] toolbar button
    55| 
```

### S117 lines 294-324 — cited by O-061

```text
   294| scale bar will represent the distance between tickmarks shown on the
   295| bounding box of the volume.  You will have to have the bounding box turned on
   296| in order to see it.  The scale bar will use physical units if available
   297| in the loaded volume data.
   298| 
   299| Timestamps
   300| ^^^^^^^^^^
   301| 
   302| For time-series data, you can display the current timepoint as an overlay
   303| in the top-right corner of the viewport.  Check the "Timestamps"
   304| checkbox to turn the overlay on or off.
   305| 
   306| The "Timestamp Format" dropdown selects how the time is displayed:
   307| 
   308| - **HH:MM:SS**: the current time is converted to seconds and shown as a
   309|   clock-style value.  Fractional seconds are added automatically when the
   310|   spacing between timepoints requires them for the value to change visibly.
   311| - **Time Units**: the current time is shown using the physical time units
   312|   read from the file metadata (for example seconds, minutes, or whatever
   313|   the data records).  The numeric precision adapts to the magnitude of the
   314|   value so the display stays readable.
   315| 
   316| If the loaded data has only a single timepoint, the timestamp overlay has
   317| nothing to display.
   318| 
   319| Volume Scale
   320| ~~~~~~~~~~~~
   321| 
   322| These X, Y, and Z values describe the physical dimensions of the volume
   323| data relative to the number of pixels. Often microscopes do not have the
   324| same physical dimensions in Z that they do in X and Y. Usually these
```

## S119 — sources/S119.txt (86 lines; https://api.github.com/repos/AllenCell/agave/issues/276)

### S119 lines 3-19 — cited by O-064

```text
     3|  "repository_url": "https://api.github.com/repos/AllenCell/agave",
     4|  "labels_url": "https://api.github.com/repos/AllenCell/agave/issues/276/labels{/name}",
     5|  "comments_url": "https://api.github.com/repos/AllenCell/agave/issues/276/comments",
     6|  "events_url": "https://api.github.com/repos/AllenCell/agave/issues/276/events",
     7|  "html_url": "https://github.com/AllenCell/agave/issues/276",
     8|  "id": 3240985432,
     9|  "node_id": "I_kwDODyJwMs7BLYNY",
    10|  "number": 276,
    11|  "title": "gpu memory leak when loading new image",
    12|  "user": {
    13|   "login": "toloudis",
    14|   "id": 2193409,
    15|   "node_id": "MDQ6VXNlcjIxOTM0MDk=",
    16|   "avatar_url": "https://avatars.githubusercontent.com/u/2193409?v=4",
    17|   "gravatar_id": "",
    18|   "url": "https://api.github.com/users/toloudis",
    19|   "html_url": "https://github.com/toloudis",
```

## S120 — sources/S120.txt (1 lines; allen-cell-animated/agave:)

### S120 lines 1-1 — cited by O-070

```text
     1| No literal matches. This does not establish semantic absence.
```

### S120 lines 17-1 — cited by O-023

```text
```

## S121 — sources/S121.txt (9 lines; allen-cell-animated/agave:)

### S121 lines 1-10 — cited by O-022, O-024

```text
     1| renderlib/io/FileReaderZarr.cpp:161:FileReaderZarr::getOmero(nlohmann::json attrs)
     2| renderlib/io/FileReaderZarr.cpp:163:  nlohmann::json omero;
     3| renderlib/io/FileReaderZarr.cpp:168:      return omero;
     4| renderlib/io/FileReaderZarr.cpp:173:      return omero;
     5| renderlib/io/FileReaderZarr.cpp:175:    omero = ome["omero"];
     6| renderlib/io/FileReaderZarr.cpp:177:    omero = attrs["omero"];
     7| renderlib/io/FileReaderZarr.cpp:180:  return omero;
     8| renderlib/io/FileReaderZarr.cpp:188:  auto omero = getOmero(m_zattrs);
     9| renderlib/io/FileReaderZarr.h:35:  nlohmann::json getOmero(nlohmann::json attrs);
    10| 
```

## S125 — sources/S125.txt (92 lines; https://api.github.com/repos/AllenCell/agave/issues/73)

### S125 lines 47-63 — cited by O-063

```text
    47|  "draft": false,
    48|  "pull_request": {
    49|   "url": "https://api.github.com/repos/AllenCell/agave/pulls/73",
    50|   "html_url": "https://github.com/AllenCell/agave/pull/73",
    51|   "diff_url": "https://github.com/AllenCell/agave/pull/73.diff",
    52|   "patch_url": "https://github.com/AllenCell/agave/pull/73.patch",
    53|   "merged_at": "2023-02-01T00:52:10Z"
    54|  },
    55|  "body": "Allow loading data from cloud if it is in OME-zarr format. \r\n\r\nThis is a somewhat unpolished user experience but implements some of the most important functionality.\r\n\r\nI add a \"open from url\" command.  Once a url (http(s)) is provided, then Agave will attempt to load ome-zarr metadata.  If such metadata is found, a dialog will pop up showing the multiresolution levels discovered.  Users will be provided a memory estimate of the selected level.  Users may also select a sub-region of interest in x,y,z.\r\n<img width=\"408\" alt=\"Load Settings 2023-01-13 16-09-26\" src=\"https://user-images.githubusercontent.com/2193409/212439959-037d4599-5618-4a6c-afe9-b7cfb9160911.png\">\r\n\r\nOnce the selection is accepted, data will be downloaded and loaded into Agave.\r\n\r\nImplementation notes:\r\n* a new LoadSpec structure is introduced and it now replaces anywhere that an old file path and scene index was specified before. \r\n* new data structure and functions are introduced to load multiresolution data\r\n* the LoadDialog is responsible for completely populating a LoadSpec which can then be passed to the FileReaders that do the data loading\r\n* the old FileReaders are modified to use the new LoadSpec but do not handle multiresolution yet\r\n* tensorstore is a google library that provides the underlying zarr loading support.  it's pretty heavy in that it adds a lot to the build time of agave\r\n* a VERY small number of pixel formats and dimension configurations are currently supported for zarr.  Currently it's been tested with data from AIND and AICS that has TCZYX dimensions.\r\n",
    56|  "closed_by": {
    57|   "login": "toloudis",
    58|   "id": 2193409,
    59|   "node_id": "MDQ6VXNlcjIxOTM0MDk=",
    60|   "avatar_url": "https://avatars.githubusercontent.com/u/2193409?v=4",
    61|   "gravatar_id": "",
    62|   "url": "https://api.github.com/users/toloudis",
    63|   "html_url": "https://github.com/toloudis",
```

## Mechanical quote checks

- O-001: not_found_in_cited_sources — "The current released version of this specification is 0.5. Migration scripts will be provided between numbered versions. Data written with these latest changes (an “editor’s draft”) will not necessari"
- O-002: exact_at_cited_lines ['S003', 67, 72] — "OME-Zarr is implemented using the Zarr format as defined by the version 3 of the Zarr specification. All features of the Zarr format including codecs, chunk grids, chunk key encodings, data types and "
- O-003: exact_at_cited_lines ['S003', 152, 156] — "The OME-Zarr Metadata is stored in the various zarr.json files throughout the above array hierarchy. In this file, the metadata is stored under the namespaced key ome in attributes. The version of the"
- O-004: not_found_in_cited_sources — "MUST contain the field \"name\" that gives the name for this dimension. The values MUST be unique across all \"name\" fields. ... SHOULD contain the field \"type\". It SHOULD be one of \"space\", \"ti"
- O-005: not_found_in_cited_sources — "The \"axes\" MUST contain 2 or 3 entries of \"type:space\" and MAY contain one additional entry of \"type:time\" and MAY contain one additional entry of \"type:channel\" or a null / custom type. The o"
- O-006: not_found_in_cited_sources — "Each dictionary in \"datasets\" MUST contain the field \"path\" ... The \"path\"s MUST be ordered from largest (i.e. highest resolution) to smallest. ... MUST contain the field \"coordinateTransformat"
- O-007: not_found_in_cited_sources — "Each \"multiscales\" dictionary MAY contain the field \"coordinateTransformations\", describing transformations that are applied to all resolution levels in the same manner. The transformations MUST f"
- O-008: not_found_in_cited_sources — "\"multiscales\" contains a list of dictionaries where each entry describes a multiscale image. ... Each \"multiscales\" dictionary SHOULD contain the field \"name\". ... If only one multiscale is prov"
- O-009: not_found_in_cited_sources — "Transitional information specific to the channels of an image and how to render it can be found under the \"omero\" key in the group-level metadata ... \"rdefs\": { \"defaultT\": 0, ... \"defaultZ\": "
- O-010: not_found_in_cited_sources — "The pixels of the label images MUST be integer data types, i.e. one of [uint8, int8, uint16, int16, uint32, int32, uint64, int64]. Intermediate groups between \"labels\" and the images within it are a"
- O-011: not_found_in_cited_sources — "the OME-Zarr Metadata in this image-level zarr.json file SHOULD contain another key, image-label, ... That image-label object SHOULD contain the following keys: first, a colors key, whose value MUST b"
- O-012: not_found_in_cited_sources — "Transitional \"bioformats2raw.layout\" metadata identifies a group which implicitly describes a series of images. ... Conforming readers: SHOULD make users aware of the presence of more than one image"
- O-013: not_found_in_cited_sources — "Three groups MUST be defined above the images: ... A well row group SHOULD NOT be present if there are no images in the well row. A well group SHOULD NOT be present if there are no images in the well."
- O-014: exact_at_cited_lines ['S003', 65, 66] — "Some of the JSON examples in this document include comments. However, these are only for clarity purposes and comments MUST NOT be included in JSON objects."
- O-015: exact_at_cited_lines ['S003', 809, 812] — "Multi-word keys in this specification should use the camelCase style. NB: some parts of the specification don’t obey this convention as they were added before this was adopted, but they should be upda"
- O-016: not_found_in_cited_sources — "\"required\": [ \"multiscales\", \"version\" ] ... \"$defs\": { \"multiscales\": { ... \"minItems\": 1, \"uniqueItems\": true"
- O-017: not_found_in_cited_sources — "\"version\": \"0.5\", ... \"axes\": [ { \"name\": \"c\", \"type\": \"channel\" }, { \"name\": \"z\", \"type\": \"space\", \"unit\": \"micrometer\" }, ... ] ... \"omero\": { ... \"rdefs\": { \"defaultT"
- O-018: not_found_in_cited_sources — "\"chunk_grid\": { \"configuration\": { \"chunk_shape\": [1, 10, 512, 512] }, \"name\": \"regular\" }, ... \"codecs\": [ { ... \"name\": \"sharding_indexed\" } ], \"data_type\": \"uint16\", \"dimension"
- O-019: not_found_in_cited_sources — "\"_creator\": { \"name\": \"ome2024-ngff-challenge\", \"version\": \"1.0.0\", \"notes\": null }, ... \"plate\": { \"columns\": [...11...], \"field_count\": 32, \"name\": \"190129\", \"rows\": [...6..."
- O-020: exact_at_cited_lines ['S068', 1, 1] — "Binary source retained; this CLI cannot extract application/octet-stream"
- O-021: exact_at_cited_lines ['S001', 1, 23] — "Search output is a discovery aid, not primary evidence. Fetch source URLs before relying on claims."
- O-022: not_found_in_cited_sources — "ValueError: Clone exceeded 256 MiB or 120 second cap; partial clone retained, not admitted" / "HTTPError: HTTP Error 403: Forbidden" / "HTTPError: HTTP Error 404: Not Found" / "HTTPError: HTTP Error 4"
- O-023: not_found_in_cited_sources — "renderlib/VolumeDimensions.cpp:288:  if (this->dtype == \"int32\") { ... 291: } else if (this->dtype == \"uint16\") { ... 294: } else if (this->dtype == \"uint8\") { ... 297: } else if (this->dtype =="
- O-024: not_found_in_cited_sources — "renderlib/io/FileReaderZarr.cpp:161:FileReaderZarr::getOmero(nlohmann::json attrs) ... 175: omero = ome[\"omero\"]; ... 177: omero = attrs[\"omero\"];"
- O-025: not_found_in_cited_sources — "class FormatV05(FormatV04): ... \"\"\" Changelog: added FormatV05 (May 2025): writing not supported yet \"\"\" ... @property def zarr_format(self) -> int: return 3 ... CurrentFormat = FormatV05"
- O-026: not_found_in_cited_sources — "def detect_format(metadata: dict, default: \"Format\") -> \"Format\": ... if fmt.matches(metadata): return fmt ... def _get_metadata_version(self, metadata: dict) -> str | None: ... multiscales = meta"
- O-027: not_found_in_cited_sources — "scale = [full / level for full, level in zip(data_shape, shape)] trans = [s / 2 - s0 / 2 for s, s0 in zip(scale, scale0)] coordinate_transformations.append([ {\"type\": \"scale\", \"scale\": scale}, {"
- O-028: not_found_in_cited_sources — "if sum(t == \"scale\" for t in types) != 1: raise ValueError(\"Must supply 1 'scale' item in coordinate_transformations\") ... if types[0] != \"scale\": raise ValueError(\"First coordinate_transformat"
- O-029: not_found_in_cited_sources — "multiscales = self.lookup(\"multiscales\", []) version = multiscales[0].get(\"version\", \"0.1\") # should this be matched with Format.version? datasets = multiscales[0][\"datasets\"] axes = multiscal"
- O-030: not_found_in_cited_sources — "model = rdefs.get(\"model\", \"unset\") ... if model == \"greyscale\": rgb = [1, 1, 1] ... visible = ch.get(\"active\", None) if visible is not None: visibles[idx] = visible and node.visible ... if st"
- O-031: not_found_in_cited_sources — "# Construct a 2D almost-square grid field_count = len(image_paths) column_count = math.ceil(math.sqrt(field_count)) ... if data is None: data = da.zeros(self.img_pyramid_shapes[level], dtype=self.nump"
- O-032: not_found_in_cited_sources — "@staticmethod def get_attrs(group: Group) -> dict: if \"ome\" in group.attrs: return group.attrs[\"ome\"] return group.attrs ... if \"coordinateSystems\" in attrs[\"multiscales\"][0]: axes = attrs[\"m"
- O-033: not_found_in_cited_sources — "paths = [ds[\"path\"] for ds in attrs[\"multiscales\"][0][\"datasets\"]] ... if \"channel\" in atypes and self._splits_channels(): channel_axis = atypes.index(\"channel\") ... def _splits_channels(sel"
- O-034: not_found_in_cited_sources — "class Bioformats2raw(Spec): @staticmethod def matches(group: Group) -> bool: attrs = Spec.get_attrs(group) # Don't consider \"plate\" as a Bioformats2raw layout return \"bioformats2raw.layout\" in att"
- O-035: not_found_in_cited_sources — "if Labels.matches(root_group): # Try starting at parent Image parent_path = root_group.store.root.parent ... elif Label.matches(root_group): # Try starting at parent Image - up 2 dirs ... elif Bioform"
- O-036: not_found_in_cited_sources — "detected = detect_format(self.__metadata, loader) ... if detected != fmt: LOGGER.warning(\"version mismatch: detected: %s, requested: %s\", detected, fmt) self.__fmt = detected ... if \"ome\" in self."
- O-037: not_found_in_cited_sources — "docs/source/advanced/sharding.ipynb ... docs/source/advanced/transforms/reading_scenes.ipynb ... ome_zarr/classes/scene.py ... ome_zarr/reader.py ... ome_zarr/writer.py"
- O-038: not_found_in_cited_sources — "This PR proposes to adopt the version 3 of the Zarr format for OME-Zarr. Main changes: Only Zarr v3 is allowed for upcoming versions of OME-Zarr. Zarr v3 stores its metadata in zarr.json files. ... Th"
- O-039: not_found_in_cited_sources — "napari: 0.6.6 napari-ome-zarr: 0.6.1 bioio-ome-zarr: 3.2.0 zarr: 3.1.5 (upgraded from 2.18.7) ome-zarr: 0.10.3 ... napari-ome-zarr depends on ome-zarr, which is pinned to zarr<3. When loading OME-Zarr"
- O-040: exact_at_cited_lines ['S014', 136, 143] — "Viewing a 3-channel image (unit16). No well definitions. Using group 0 in bioformats2raw Zarr layout. Vizarr works as expected for the image in OME-ZARR v0.4 format (written by NGFF-Converter): Vizarr"
- O-041: not_found_in_cited_sources — "This updates ome-zarr-py to use zarr-python v3 but doesn't include support for writing Zarr v3 (OME-Zarr v0.5). However, it does add support for reading OME-Zarr v0.5 (e.g. for use by napari-ome-zarr)"
- O-042: not_found_in_cited_sources — "Merged joshmoore merged 91 commits ... Aug 7, 2025 ... This PR adds support for writing OME-Zarr v0.5, which becomes the default CurrentFormat(). ... Known issues: compressor option fails when writing"
- O-043: not_found_in_cited_sources — "$ ome_zarr finder path/to/my_data_folder/ This command will traverse your local filesystem, looking for zarr images (only .zattrs for now - can add zarr v3 support as a follow-up) and collect them int"
- O-044: not_found_in_cited_sources — "Summary Table ... library [Metadata/Validation/Arrays/Graph/CLI] ome-zarr-py Yes Yes Yes Yes ... But only downsamples in 2D (x and y) ... Not easy to write pixel sizes. Scale starts at [1, 1, 1, 1, 1]"
- O-045: not_found_in_cited_sources — "ome-zarr-py does not appear to work correctly with auto-sharding. ... zarr.create_array(store=store, shape=arr_np.shape, chunks=(1, 100, 100), shards=\"auto\", ...) ... ValueError: Could not interpret"
- O-046: not_found_in_cited_sources — "0.5 76-45.ome.zarr 520 1 2 1 XYZCT 384 1 ... 0.5 190129.zarr 2048 2044 31 5 XYZC 49 32 ... 0.5 ExpD_chicken_embryo_MIP.ome.zarr 6510 8978 XY ... 0.5 ExpA_VIP_ASLM_on.zarr 2048 2048 1937 XYZ ... 0.5 BR"
- O-047: not_found_in_cited_sources — "Data generated within the challenge will have: - all v2 arrays converted to v3, optionally sharding the data - all .zattrs metadata migrated to `zarr.json[\"attributes\"][\"ome\"]` - a top-level `ro-c"
- O-048: not_found_in_cited_sources — "By default, the resolutions will be set so that the smallest resolution is no greater than 256x256. A scaling factor of 2 is used between consecutive resolutions. ... | v3/0.5            | yes        "
- O-049: not_found_in_cited_sources — "Version 0.3.0 and later uses the `TCZYX` order by default ... The `--dimension-order` option is considered deprecated ... as it results in invalid OME-NGFF data. ... Supports grouping multiple .nd2 fi"
- O-050: not_found_in_cited_sources — "Vizarr expects the same number of Z-sections for each pyramid resolution" ... "napari: notes: \"Image appears to load and display OK, but very quickly crashes on zooming etc.\"" ... "Can the viewer ha"
- O-051: not_found_in_cited_sources — "Does the viewer use the 'omero' metadata to set channel colors, names and rendering levels? ... WEBKNOSSOS: supported: yes ... notes: \"rdefs are not supported\" ... Vol-E: supported: no opens: yes no"
- O-052: not_found_in_cited_sources — "napari 0.5.6 with plugin napari-ome-zarr 0.6.1 and ome-zarr 0.10.3 ... vizarr using current viewer April 2025 ... webKnossos version 24.11.0 ... OMERO with BioFormats ZarrReader 0.2.0"
- O-053: not_found_in_cited_sources — "RFC-5: Coordinate Systems and Transformations ... RFC-5: Response 2 (2025-11-18 version) ... RFC-6: Flattening the multiscales array ... RFC-7: Channel provenance ... RFC-8: Collections and Extensibil"
- O-054: not_found_in_cited_sources — "Investigating a lighter-weight alternative to ome-zarr-py. Uses zarrv3. ... The PR handles bioformats2raw, channels metadata, labels, plates and plates with labels. ... # Nine images in bioformats2raw"
- O-055: not_found_in_cited_sources — "\"tag_name\": \"0.8.0\" ... \"published_at\": \"2026-05-20T10:38:09Z\" ... * drop ome-zarr dependency by @will-moore in .../pull/123 ... * Handles `bioformats2raw.layout` specification: All images in "
- O-056: not_found_in_cited_sources — "* Introduce image class v06 by @jo-mueller ... * Ready for 06 ... * Ome zarr scene ... * find_multiscales() handles scenes ... * Be more permissive with version 0.5, allowing support for spatial-data "
- O-057: not_found_in_cited_sources — "# 0.11.0 (April 2025) - Browse collection of local OME-Zarr in BioFile Finder (#436) ... # 0.10.2 (November 2024) ... * pin zarr at < 3"
- O-058: not_found_in_cited_sources — "**Vizarr** is a minimal, purely client-side program for viewing zarr-based images. ... Currently, Viv supports `int8`, `int16`, `int32`, `uint8`, `uint16`, `uint32`, `float32`, `float64` arrays ... **"
- O-059: not_found_in_cited_sources — "Volume Explorer (Vol-E) is a browser based volume viewer built with React and WebGL (Three.js). ... a url to a OME-ZARR image ... AGAVE's core viewing engine uses a \"progressive path tracer\". ... GP"
- O-060: not_found_in_cited_sources — "AGAVE is a desktop application for viewing multichannel volume data. Several formats are supported, including OME-ZARR 0.4 and 0.5, OME-TIFF and Zeiss .czi files. ... OME-Zarr data is not stored as si"
- O-061: not_found_in_cited_sources — "**HH:MM:SS**: the current time is converted to seconds ... **Time Units**: the current time is shown using the physical time units ... When you change the current time in the `Time Panel`, the transfe"
- O-062: not_found_in_cited_sources — "The viewer currently only supports .tif or .czi files containing z-stack data. Currently only 16-bit unsigned pixels are supported. ... Up to four channels can be displayed at a time."
- O-063: not_found_in_cited_sources — "Once a url (http(s)) is provided, then Agave will attempt to load ome-zarr metadata. If such metadata is found, a dialog will pop up showing the multiresolution levels discovered. Users will be provid"
- O-064: not_found_in_cited_sources — "load data asynchronously and incrementally ... Data loading currently blocks the whole application and is not easy to cancel. This is most obvious during a time series render ... preload and cache who"
- O-065: not_found_in_cited_sources — "load channels from separate files into same session ... allow channel masking ... improve opacity for overlapping structures ... Add tooltips over labels - esp colorMap ... Would be very useful for bi"
- O-066: not_found_in_cited_sources — "downsample data at load time ... [volumecache 01/12] Add in-memory volume cache manager ... [volumecache 02/12] Route volume loads through memory cache ... Feature/unbold memory estimate ... loading s"
- O-067: not_found_in_cited_sources — "The big assumption I am making is that OME-NGFF 0.4 is always zarrv2 and if we find a zarrv3 zarr.json file, then I am assuming a OME-NGFF 0.5 json file. ... Anything outside this assumption will erro"
- O-068: not_found_in_cited_sources — "WEBKNOSSOS works great with OME-Zarr datasets, sometimes called next-generation file format (NGFF). ... Zarr Folder Structure (v0.4) ... Zarr Folder Structure (v0.5) ... This example will create a sha"
- O-069: not_found_in_cited_sources — "BioFile Finder is an application produced by the Allen Institute for Cell Science designed to simplify access and exploration of data ... it allows the application to be distributed both as a desktop "
- O-070: not_found_in_cited_sources — "Zarr3 C++ Read Subset Issue ... auto file = tensorstore::Open({{\"driver\", \"zarr3\"}, {\"kvstore\", {{\"driver\", \"file\"}, {\"path\", file_path}}}, {\"metadata\", ... {\"codecs\", {{{\"name\", \"b"
- O-071: not_found_in_cited_sources — "ome-zarr-py` does not work with auto-sharding ... What to do with consolidated metadata? ... download failing for RFC-5 CoordinateSystems group ... Improve error message of ome_zarr finder on read-onl"
- O-072: not_found_in_cited_sources — "Z downsampling ... Mixing channels ... Rendering issues for images in OME-ZARR v0.5 format ... Problem in reading contrast metadata ... Adding a dynamic scale bar ... 3D translation causes images to d"
- O-073: not_found_in_cited_sources — "RFC-5 document needs updates for OME-Zarr 0.6rc0 ... 0.6rc0 schemas not served from homepage ... Do not allow `Identity` transformations in multiscale transformations ... [Issue]: semantics of a \"pix"
- O-074: not_found_in_cited_sources — "Zarr3 chunking issues ... Zarr3 rectilinear chunk grid ... zarr3 shard user block / offset ... Zarr3: transpose codec followed by sharding codec error during writing ... C++ Zarr3 Resize() 3d dataset "
- O-075: not_found_in_cited_sources — "AGAVE Desktop application for viewing multichannel volume data powered by your GPU ... Kiln A WebGPU-native out-of-core rendering system for virtualized volumetric data ... Odon A spatial proteomics O"
- O-076: not_found_in_cited_sources — "\"tag_name\": \"v1.10.0\" ... agave-1.10.0-macos-arm64.dmg ... agave-1.10.0-win.exe"
- O-077: not_found_in_cited_sources — "{ \"total_count\": 0, \"incomplete_results\": false, \"items\": [] ... }"
- O-079: not_found_in_cited_sources — "\"name\": \"ome-zarr\" ... \"release_url\": \"https://pypi.org/project/ome-zarr/0.19.2/\" ... \"zarr>=3.0.0\" ... \"ome-zarr-models>=1.8.1\" ... \"requires_python\": \">=3.12\" ... \"version\": \"0.19"
- O-080: not_found_in_cited_sources — "+  // if it's a directory, and contains the string zarr anywhere, we assume it's a zarr ... else if (std::filesystem::is_directory(filepath)) { if (filepath.find(\"zarr\") != std::string::npos) { retu"
