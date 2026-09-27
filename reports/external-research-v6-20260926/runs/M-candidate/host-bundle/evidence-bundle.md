# Host-built evidence bundle (mechanical, TEST_ONLY_NEVER_PROMOTE)
Cited windows from stage1/observations.md, grouped by source, +/-8 lines of context, windows capped at 160 lines. A quote match proves only that the text exists there.
Observations parsed: 40; with no parseable citation: 0; unknown handles: none.

## S001 — sources/S001.txt (23 lines; local-capture (origin URL not recorded))

### S001 lines 1-9 — cited by O-036

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
```

## S003 — sources/S003.txt (896 lines; https://ngff.openmicroscopy.org/0.5/; local-capture (origin URL not recorded))

### S003 lines 60-80 — cited by O-001

```text
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

### S003 lines 112-137 — cited by O-010

```text
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

### S003 lines 145-182 — cited by O-002, O-003, O-037

```text
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
```

### S003 lines 248-278 — cited by O-011

```text
   248| "ome": {
   249| "version": "0.5",
   250| "series": ["0", "1"]
   251| }
   252| }
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
```

### S003 lines 291-320 — cited by O-004, O-005, O-006

```text
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
```

### S003 lines 418-448 — cited by O-007, O-009

```text
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
```

### S003 lines 453-474 — cited by O-008

```text
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
```

### S003 lines 817-835 — cited by O-003

```text
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

## S005 — sources/S005.txt (1 lines; local-capture (origin URL not recorded))

### S005 lines 1-1 — cited by O-036

```text
     1| ValueError: Clone exceeded 256 MiB or 120 second cap; partial clone retained, not admitted
```

## S008 — sources/S008.txt (588 lines; https://github.com/ome/ome-zarr-py/pull/404)

### S008 lines 141-166 — cited by O-022, O-032

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
```

## S010 — sources/S010.txt (1160 lines; https://idr.github.io/ome-ngff-samples/)

### S010 lines 16-42 — cited by O-032

```text
    16| Axes
    17| Wells
    18| Fields
    19| Keywords
    20| License
    21| Study
    22| DOI
    23| Date added
    24| 0.1
    25| 12689244.zarr
    26| 4992
    27| 4255
    28| 401
    29| 3
    30| 1
    31| XYZCT
    32| CC BY 4.0
    33| idr0106
    34| 2020-11-04
    35| 0.1
    36| 179706.zarr
    37| 1344
    38| 1024
    39| 1
    40| 2
    41| 329
    42| XYZCT
```

## S011 — sources/S011.txt (212 lines; https://github.com/ome/napari-ome-zarr/issues/139)

### S011 lines 143-167 — cited by O-020

```text
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
```

## S013 — sources/S013.txt (613 lines; https://github.com/ome/ome-zarr-py/pull/413)

### S013 lines 143-164 — cited by O-023

```text
   143| edited
   144| Loading
   145| Uh oh!
   146| There was an error while loading. Please reload this page.
   147| Copy link
   148| Copy Markdown
   149| Member
   150| NB: this is on top of #404 (reading OME-Zarr v0.5), which needs to be reviewed & merged first
   151| This PR adds support for writing OME-Zarr v0.5, which becomes the default CurrentFormat().
   152| If you want to choose e.g. v0.4, this is specified in parse_url():
   153| store = parse_url(path, mode="w", fmt=FormatV04()).store
   154| root = zarr.group(store=store)
   155| write_image(image=data, group=root)
   156| This creates a zarr v2 store and group. So when we write_image() with that group, we know that we want to use v0.4 rather than v0.5. The default fmt for write_image() and other write... methods is now None rather than CurrentFormat(), so that we can detect when a user hasn't specified a format and pick the right one.
   157| if you try to use a mix of formats, e.g. v04 and v05, this will throw an Exception:
   158| store = parse_url(path, mode="w", fmt=FormatV04()).store
   159| root = zarr.group(store=store)
   160| write_image(image=data, group=root, fmt=FormatV05())
   161| Same with this, since parse_url() will use CurrentFormat():
   162| store = parse_url(path, mode="w").store
   163| root = zarr.group(store=store)
   164| write_image(image=data, group=root, fmt=FormatV04())
```

### S013 lines 174-194 — cited by O-023

```text
   174| sync(
   175| ../../../../opt/anaconda3/envs/omeroweb_zarrv3/lib/python3.12/site-packages/zarr/core/sync.py:163: in sync
   176| raise return_result
   177| ../../../../opt/anaconda3/envs/omeroweb_zarrv3/lib/python3.12/site-packages/zarr/core/sync.py:119: in _runner
   178| return await coro
   179| ../../../../opt/anaconda3/envs/omeroweb_zarrv3/lib/python3.12/site-packages/zarr/api/asynchronous.py:1055: in create
   180| return await AsyncArray._create(
   181| ...
   182| if compressor != "auto":
   183| >               raise ValueError(
   184| "compressor cannot be used for arrays with zarr_format 3. Use bytes-to-bytes codecs instead."
   185| )
   186| E               ValueError: compressor cannot be used for arrays with zarr_format 3. Use bytes-to-bytes codecs instead.
   187| Testing:
   188| Reading via napari-ome-zarr... images and plates, v0.1, 0.3, 0.4, 0.5...
   189| $ napari --plugin napari-ome-zarr https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/9836844.zarr
   190| $ napari --plugin napari-ome-zarr https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.3/idr0079A/9836998.zarr
   191| $ napari --plugin napari-ome-zarr https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0072B/9512.zarr
   192| $ napari --plugin napari-ome-zarr https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.5/idr0083/9822152.zarr
   193| $ napari --plugin napari-ome-zarr https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.5/idr0010/76-45.ome.zarr
   194| See the changes in docs/source/python.rst and test the various code samples. By default, the examples will write OME-Zarr v0.5. Also try writing v0.4 as described.
```

## S014 — sources/S014.txt (178 lines; https://github.com/hms-dbmi/vizarr/issues/307)

### S014 lines 133-150 — cited by O-021

```text
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
```

## S016 — sources/S016.txt (387 lines; ome/ome-zarr-py:ome_zarr/format.py)

### S016 lines 360-388 — cited by O-012

```text
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

## S018 — sources/S018.txt (610 lines; ome/ome-zarr-py:ome_zarr/reader.py)

### S018 lines 396-475 — cited by O-039

```text
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
   428|             data = None
   429|             try:
   430|                 # handle e.g. 2x2 grid with only 3 images/fields
   431|                 if field_index < len(image_paths):
   432|                     image_path = image_paths[field_index]
   433|                     path = f"{image_path}/{self.ds_paths[level]}"
   434|                     data = self.zarr.load(path)
   435|             except ValueError:
   436|                 LOGGER.error("Failed to load %s", path)
   437|             if data is None:
   438|                 data = da.zeros(self.img_pyramid_shapes[level], dtype=self.numpy_type)
   439|             return data
   440| 
   441|         def get_lazy_well(level: int, tile_shape: tuple) -> da.Array:
   442|             lazy_rows = []
   443|             for row in range(row_count):
   444|                 lazy_row: list[da.Array] = []
   445|                 for col in range(column_count):
   446|                     LOGGER.debug(
   447|                         "creating lazy_reader. row: %s col: %s level: %s",
   448|                         row,
   449|                         col,
   450|                         level,
   451|                     )
   452|                     lazy_tile = get_field(row, col, level)
   453|                     lazy_row.append(lazy_tile)
   454|                 lazy_rows.append(da.concatenate(lazy_row, axis=x_index))
   455|             return da.concatenate(lazy_rows, axis=y_index)
   456| 
   457|         # Create a pyramid of layers at different resolutions
   458|         pyramid = []
   459|         for level, tile_shape in enumerate(self.img_pyramid_shapes):
   460|             lazy_well = get_lazy_well(level, tile_shape)
   461|             pyramid.append(lazy_well)
   462| 
   463|         # Set the node.data to be pyramid view of the plate
   464|         node.data = pyramid
   465|         node.metadata = image_node.metadata
   466| 
   467| 
   468| class Plate(Spec):
   469|     @staticmethod
   470|     def matches(zarr: ZarrLocation) -> bool:
   471|         return bool("plate" in zarr.root_attrs)
   472| 
   473|     def __init__(self, node: Node) -> None:
   474|         super().__init__(node)
   475|         LOGGER.debug("Plate created with ZarrLocation fmt: %s", self.zarr.fmt)
```

### S018 lines 532-566 — cited by O-039

```text
   532|         return (
   533|             f"{self.row_names[row]}/"
   534|             f"{self.col_names[col]}/{self.first_field_path}/{self.img_paths[level]}"
   535|         )
   536| 
   537|     def get_stitched_grid(self, level: int, tile_shape: tuple) -> da.core.Array:
   538|         LOGGER.debug("get_stitched_grid() level: %s, tile_shape: %s", level, tile_shape)
   539| 
   540|         def get_tile(row: int, col: int) -> da.core.Array:
   541|             """tile_name is 'level,z,c,t,row,col'"""
   542| 
   543|             # check whether the Well exists at this row/column
   544|             well_path = f"{self.row_names[row]}/{self.col_names[col]}"
   545|             if well_path not in self.well_paths:
   546|                 LOGGER.debug("empty well: %s", well_path)
   547|                 return np.zeros(tile_shape, dtype=self.numpy_type)
   548| 
   549|             path = self.get_tile_path(level, row, col)
   550|             LOGGER.debug("creating tile... %s with shape: %s", path, tile_shape)
   551| 
   552|             try:
   553|                 # this is a dask array - data not loaded from source yet
   554|                 data = self.zarr.load(path)
   555|             except ValueError:
   556|                 LOGGER.exception("Failed to load %s", path)
   557|                 data = da.zeros(tile_shape, dtype=self.numpy_type)
   558|             return data
   559| 
   560|         lazy_rows = []
   561|         # For level 0, return whole image for each tile
   562|         for row in range(self.row_count):
   563|             lazy_row: list[da.Array] = [
   564|                 get_tile(row, col) for col in range(self.column_count)
   565|             ]
   566|             lazy_rows.append(da.concatenate(lazy_row, axis=len(self.axes) - 1))
```

## S019 — sources/S019.txt (233 lines; ome/ome-zarr-py:ome_zarr/io.py)

### S019 lines 79-98 — cited by O-013

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

## S023 — sources/S023.txt (493 lines; https://github.com/ome/ome-zarr-py/pull/436)

### S023 lines 142-162 — cited by O-031

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
```

## S025 — sources/S025.txt (105 lines; https://raw.githubusercontent.com/hms-dbmi/vizarr/main/README.md)

### S025 lines 76-94 — cited by O-021

```text
    76| 
    77| To learn more, see the [getting started](./python/notebooks/getting_started.ipynb) notebook.
    78| 
    79| ## Data types
    80| 
    81| **Vizarr** supports viewing 2D slices of n-Dimensional Zarr arrays, allowing
    82| users to choose a single channel or blended composites of multiple channels
    83| during analysis. It has special support for the developing OME-NGFF format for
    84| multiscale and multimodal images. Currently, Viv supports `int8`, `int16`,
    85| `int32`, `uint8`, `uint16`, `uint32`, `float32`, `float64` arrays, but
    86| contributions are welcome to support more np.dtypes!
    87| 
    88| ## Limitations
    89| 
    90| `vizarr` was built to support the registration use case above where multiple, pyramidal OME-Zarr images
    91| are viewed within a Jupyter Notebook. Support for other Zarr arrays is supported but not as well tested. 
    92| More information regarding the viewing of generic Zarr arrays can be found in the example notebooks.
    93| 
    94| ## Citation
```

## S026 — sources/S026.txt (346 lines; https://api.github.com/repos/ome/napari-ome-zarr/releases?per_page=8)

### S026 lines 34-50 — cited by O-030

```text
    34|   "immutable": false,
    35|   "prerelease": false,
    36|   "created_at": "2026-07-21T11:09:20Z",
    37|   "updated_at": "2026-08-12T12:08:23Z",
    38|   "published_at": "2026-08-12T12:08:23Z",
    39|   "assets": [],
    40|   "tarball_url": "https://api.github.com/repos/ome/napari-ome-zarr/tarball/v0.10.0",
    41|   "zipball_url": "https://api.github.com/repos/ome/napari-ome-zarr/zipball/v0.10.0",
    42|   "body": "## What's Changed\r\n* Forward NGFF axis names and units into napari layer metadata by @hinderling in https://github.com/ome/napari-ome-zarr/pull/149\r\n\r\n## New Contributors\r\n* @hinderling made their first contribution in https://github.com/ome/napari-ome-zarr/pull/149\r\n\r\n**Full Changelog**: https://github.com/ome/napari-ome-zarr/compare/0.9.1...0.10.0",
    43|   "mentions_count": 1
    44|  },
    45|  {
    46|   "url": "https://api.github.com/repos/ome/napari-ome-zarr/releases/347998504",
    47|   "assets_url": "https://api.github.com/repos/ome/napari-ome-zarr/releases/347998504/assets",
    48|   "upload_url": "https://uploads.github.com/repos/ome/napari-ome-zarr/releases/347998504/assets{?name,label}",
    49|   "html_url": "https://github.com/ome/napari-ome-zarr/releases/tag/0.9.1",
    50|   "id": 347998504,
```

### S026 lines 249-265 — cited by O-030

```text
   249|   "immutable": false,
   250|   "prerelease": false,
   251|   "created_at": "2026-05-08T08:20:07Z",
   252|   "updated_at": "2026-05-20T10:38:09Z",
   253|   "published_at": "2026-05-20T10:38:09Z",
   254|   "assets": [],
   255|   "tarball_url": "https://api.github.com/repos/ome/napari-ome-zarr/tarball/0.8.0",
   256|   "zipball_url": "https://api.github.com/repos/ome/napari-ome-zarr/zipball/0.8.0",
   257|   "body": "## What's Changed\r\n* drop ome-zarr dependency by @will-moore in https://github.com/ome/napari-ome-zarr/pull/123\r\n  * This moves some napari-specific logic out of ome-zarr-py and into napari-ome-zarr\r\n  *  Fixes Plate labels\r\n  *  Handles `bioformats2raw.layout` specification: All images in the series are opened. \r\n* livingobjects by @pwalczysko in https://github.com/ome/napari-ome-zarr/pull/148\r\n* remove old metadata files by @jo-mueller in https://github.com/ome/napari-ome-zarr/pull/150\r\n\r\n\r\n## New Contributors\r\n* @jo-mueller made their first contribution in https://github.com/ome/napari-ome-zarr/pull/150\r\n\r\n**Full Changelog**: https://github.com/ome/napari-ome-zarr/compare/v0.7.3...0.8.0",
   258|   "mentions_count": 3
   259|  },
   260|  {
   261|   "url": "https://api.github.com/repos/ome/napari-ome-zarr/releases/301116434",
   262|   "assets_url": "https://api.github.com/repos/ome/napari-ome-zarr/releases/301116434/assets",
   263|   "upload_url": "https://uploads.github.com/repos/ome/napari-ome-zarr/releases/301116434/assets{?name,label}",
   264|   "html_url": "https://github.com/ome/napari-ome-zarr/releases/tag/v0.7.3",
   265|   "id": 301116434,
```

## S027 — sources/S027.txt (1099 lines; https://github.com/ome/napari-ome-zarr/pull/123)

### S027 lines 119-139 — cited by O-024

```text
   119| Code
   120| Issues
   121| Pull requests
   122| Actions
   123| Projects
   124| Security and quality
   125| Insights
   126| drop ome-zarr dependency - #123#123
   127| Merged
   128| will-moore merged 33 commits into
   129| ome:mainome/napari-ome-zarr:mainfrom
   130| will-moore:investigate_ome_zarr_py_alternativewill-moore/napari-ome-zarr:investigate_ome_zarr_py_alternativeCopy head branch name to clipboard
   131| May 8, 2026
   132| ConversationCommits33 (33)ChecksFiles changed
   133| Merged
   134| drop ome-zarr dependency#123
   135| will-moore merged 33 commits into
   136| ome:mainome/napari-ome-zarr:mainfrom
   137| will-moore:investigate_ome_zarr_py_alternativewill-moore/napari-ome-zarr:investigate_ome_zarr_py_alternativeCopy head branch name to clipboard
   138| Conversation
   139| will-moore
```

### S027 lines 142-167 — cited by O-024

```text
   142| •
   143| edited
   144| Loading
   145| Uh oh!
   146| There was an error while loading. Please reload this page.
   147| Copy link
   148| Copy Markdown
   149| Member
   150| Investigating a lighter-weight alternative to ome-zarr-py.
   151| Uses zarrv3.
   152| This includes the functionality from un-merged Plate Labels Fix (ome/ome-zarr-py#207 with #54).
   153| Also includes the handling of bioformats2raw, similar to behaviour from un-merged ome/ome-zarr-py#174
   154| Pros:
   155| Mapping from OME-Zarr metadata to napari data happens in one step, instead of being split between ome-zarr-py and napari-ome-zarr.
   156| This allows us to more easily support additional complexity as in the RFC-5 spec.
   157| Cons:
   158| Some small duplication of logic between napari-ome-zarr and ome-zarr-py
   159| The PR handles bioformats2raw, channels metadata, labels, plates and plates with labels. Testing with:
   160| $ napari --plugin napari-ome-zarr https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr
   161| $ napari --plugin napari-ome-zarr https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0066/ExpD_chicken_embryo_MIP.ome.zarr
   162| $ napari --plugin napari-ome-zarr https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0048A/9846152.zarr
   163| # bioformats2raw.layout (single image)
   164| $ napari --plugin napari-ome-zarr https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0048A/9846151.zarr
   165| # bioformats2raw.layout (3 images in series)
   166| $ napari --plugin napari-ome-zarr https://storage.googleapis.com/jax-public-ngff/public/397.zarr
   167| # v0.5 plate (see screenshot)
```

## S031 — sources/S031.txt (15 lines; https://raw.githubusercontent.com/ome/ome-ngff-validator/main/README.md)

### S031 lines 1-14 — cited by O-032

```text
     1| # ome-ngff-validator
     2| Web page for validating OME-NGFF files
     3| 
     4| Deployed at https://ome.github.io/ome-ngff-validator
     5| 
     6| See https://idr.github.io/ome-ngff-samples/ for samples to try.
     7| 
     8| ## Custom schemas
     9| 
    10| To specify a location to load schemas from, use the `schemas` query parameter.
    11| For example, this will load schemas from a specified branch of the ngff-spec repo:
    12| 
    13| ```
    14| &schemas=https://raw.githubusercontent.com/will-moore/ngff-spec/refs/heads/scene_coordinateTransformations_input_path_optional/schemas/
```

## S033 — sources/S033.txt (518 lines; https://raw.githubusercontent.com/glencoesoftware/bioformats2raw/master/README.md; local-capture (origin URL not recorded))

### S033 lines 147-170 — cited by O-015

```text
   147| 
   148| The output in `/path/to/zarr-pyramid` can be passed to `raw2ometiff` to produce
   149| an OME-TIFF that can be opened in ImageJ, imported into OMERO, etc. See
   150| https://github.com/glencoesoftware/raw2ometiff for more information.
   151| 
   152| Compression Options
   153| ===================
   154| 
   155| By default, output is compressed with the Blosc codec using the `lz4` compression algorithm with `clevel` set to `5`.
   156| 
   157| To change the overall compression type, use `--compression <type>`. Supported types depend upon the Zarr/NGFF version being written:
   158| 
   159| | Zarr/NGFF version | null (uncompressed) | blosc | gzip | zlib | zstd |
   160| |-------------------|---------------------|-------|------|------|------|
   161| | v2/0.4            | yes                 | yes   | no   | yes  | no   |
   162| | v3/0.5            | yes                 | yes   | yes  | no   | yes  |
   163| 
   164| 
   165| To change type-specific options, use `--compression-properties <key=value>`.
   166| 
   167| Supported options for `blosc` are:
   168| 
   169| * `cname=<codec>`, where the default is `cname=lz4`. `zstd`, `zlib`, `blosclz`, and `lz4hc` are also valid values of `cname`.
   170| * `clevel=<level>`, where the default is `clevel=5`. Valid values are integers from 0 to 9 inclusive, where 0 generally
```

### S033 lines 205-234 — cited by O-016

```text
   205| benchmark several different options with the real input data being used. See also the [Performance](#performance) section below.
   206| 
   207| In some tests, we have found that `--compression blosc --compression-properties cname=zstd --compression-properties clevel=3`
   208| may be a reasonable choice if compressed size is more important than conversion or decompression times.
   209| 
   210| Output Formatting Options
   211| =========================
   212| 
   213| By default, the output of `bioformats2raw` will be a
   214| [Zarr dataset](https://zarr-specs.readthedocs.io/en/latest/specs.html) which follows the
   215| metadata conventions defined by the
   216| [version 0.4](https://ngff.openmicroscopy.org/specifications/0.4/) of the OME-Zarr specification including the
   217| [bioformats2raw.layout specification](https://ngff.openmicroscopy.org/specifications/0.4/#bioformats2raw-layout-transitional).
   218| 
   219| Several formatting options can be passed to the converter and will result in a Zarr dataset
   220| that is not compatible with raw2ometiff and does not strictly follow the OME-NGFF
   221| specification but may be suitable for other applications.
   222| 
   223| #### --ngff-version
   224| 
   225| Specifies the version of the [OME-Zarr specification](https://ngff.openmicroscopy.org/specifications/index.html)
   226| that should be used while writing Zarr. Current supported values are 0.4 and 0.5.
   227| 
   228| #### --pyramid-name
   229| 
   230| Specifies a subdirectory of the output directory where Zarr data should be written.
   231| Using this option will insert another level into the output hierarchy, for example:
   232| 
   233|     $ bin/bioformats2raw --pyramid-name pyramid-test "test&sizeX=4096&sizeY&=4096&sizeZ=3.fake" example1
   234|     $ tree example1
```

## S034 — sources/S034.txt (366 lines; https://raw.githubusercontent.com/ome/ome2024-ngff-challenge/master/README.md)

### S034 lines 35-54 — cited by O-017

```text
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

### S034 lines 59-91 — cited by O-018

```text
    59| [2024-08-01 14:24:29 CEST] 1.6MiB STANDARD 2/c/0/0/0/0
    60| [2024-08-01 14:24:28 CEST]   592B STANDARD 2/zarr.json
    61| [2024-08-01 14:24:28 CEST] 1.2KiB STANDARD ro-crate-metadata.json
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
    79|   Size `1.0 TB`,
    80|   [190206.zarr](https://ome.github.io/ome-ngff-validator/?source=https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0090/190206.zarr)
    81|   Size `485 GB`,
    82|   [190211.zarr](https://ome.github.io/ome-ngff-validator/?source=https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0090/190211.zarr)
    83|   Size `704 GB`.
    84| - [76-45.zarr](https://ome.github.io/ome-ngff-validator/?source=https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0010/76-45.zarr)
    85|   plate from idr0010
    86| 
    87|  <details><summary>Expand for more details on creation of these samples</summary>
    88| 
    89| <hr>
    90| 
    91| `4496763.json` was created with ome2024-ngff-challenge commit `0e1809bf3b`.
```

### S034 lines 146-164 — cited by O-017

```text
   146| ```
   147| 
   148|  </details>
   149| 
   150| ## CLI Commands
   151| 
   152| ### `resave`: convert your data
   153| 
   154| The `ome2024-ngff-challenge` tool can be used to convert an OME-Zarr 0.4 dataset
   155| that is based on Zarr v2. The input data will **not be modified** in any way and
   156| a full copy of the data will be created at the chosen location.
   157| 
   158| #### Getting started
   159| 
   160| ```
   161| ome2024-ngff-challenge resave --cc-by input.zarr output.zarr
   162| ```
   163| 
   164| is the most basic invocation of the tool. If you do not choose a license, the
```

## S041 — sources/S041.txt (194 lines; https://raw.githubusercontent.com/ome/ome-ngff-tools/main/docs/index.md)

### S041 lines 1-28 — cited by O-025

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

## S043 — sources/S043.txt (566 lines; https://raw.githubusercontent.com/ome/ome-ngff-tools/main/docs/_data/features.yml)

### S043 lines 43-59 — cited by O-035

```text
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
```

### S043 lines 62-97 — cited by O-025, O-035

```text
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
    87|     supported: no
    88|     opens: no
    89|     issue_url: https://github.com/hms-dbmi/vizarr/issues/101
    90|   Vol-E:
    91|     supported: yes
    92|   BigDataViewer:
    93|     supported: yes
    94|   MoBIE:
    95|     supported: yes
    96|   napari:
    97|     supported: yes
```

### S043 lines 199-228 — cited by O-025

```text
   199|     viewer_url: https://webknossos.org/datasets/308ffc5547d41748/6001240_20240314.zarr?token=equ22C3ELBC6y9aS4pW3cw
   200|   OMERO:
   201|     supported: no
   202|     opens: yes
   203|   Microscopy Nodes:
   204|     supported: no
   205|     opens: yes
   206| 
   207| - name: HCS plate
   208|   description: Does the viewer display an OME-NGFF plate?
   209|   sample_url: https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0001A/2551.zarr
   210|   sample_name: idr0001
   211|   avivator:
   212|     supported: no
   213|   vizarr:
   214|     supported: yes
   215|     notes: Only the lowest resolution of a Plate is shown. Clicking a Well loads it in a new window
   216|   Vol-E:
   217|     supported: no
   218|   napari:
   219|     supported: yes
   220|     notes: "Plate appears to load and display OK, but crashes on zooming in."
   221|   BigDataViewer:
   222|     supported: no
   223|   MoBIE:
   224|     supported: yes
   225|   neuroglancer:
   226|     supported: no
   227|     opens: no
   228|   vtk-itk-viewer:
```

### S043 lines 232-391 (truncated from 419) — cited by O-025, O-026

```text
   232|     supported: no
   233|     opens: no
   234|   OMERO:
   235|     supported: no
   236|   Microscopy Nodes:
   237|     supported: no
   238|     opens: no
   239| 
   240| - name: bioformats2raw.layout
   241|   description: Does the viewer handled a Fileset of images contained within a bioformats2raw.layout wrapper?
   242|   sample_url: https://minio-dev.openmicroscopy.org/idr/Testing/sample_files.zarr
   243|   sample_name: sample_files.zarr
   244|   avivator:
   245|     supported: no
   246|   vizarr:
   247|     supported: yes
   248|     notes: User is redirected to ome-ngff-validator which shows links to open each image in vizarr
   249|   Vol-E:
   250|     supported: no
   251|   napari:
   252|     supported: no
   253|     opens: no
   254|     issue_url: https://github.com/ome/napari-ome-zarr/issues/71
   255|   BigDataViewer:
   256|     supported: yes
   257|     notes: "In the 'Open' dialog, choose `Detect Datasets`. One or more single resolution zarr arrays can be opened, but not as a 'multiscale' image."
   258|   MoBIE:
   259|     supported: no
   260|     opens: no
   261|   neuroglancer:
   262|     supported: no
   263|     opens: no
   264|     notes: "Error: Neither .zarray metadata nor OME multiscale metadata found"
   265|   vtk-itk-viewer:
   266|     supported: no
   267|     opens: no
   268|   WEBKNOSSOS:
   269|     supported: no
   270|     opens: no
   271|   OMERO:
   272|     supported: yes
   273|   Microscopy Nodes:
   274|     supported: no
   275|     opens: no
   276| 
   277| - name: multiple 'multiscales'
   278|   description: Does the viewer open any images beyond the first item in the 'multiscales' list?
   279|   sample_url: https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0050A/4995115.zarr
   280|   sample_name: 4995115.zarr
   281|   avivator:
   282|     supported: no
   283|     opens: yes
   284|   vizarr:
   285|     supported: no
   286|     opens: yes
   287|   Vol-E:
   288|     supported: no
   289|     opens: yes
   290|   napari:
   291|     supported: no
   292|     opens: yes
   293|   BigDataViewer:
   294|     supported: no
   295|     opens: no
   296|     notes: "Fails with: java.lang.RuntimeException: java.lang.ArrayIndexOutOfBoundsException: 3"
   297|   MoBIE:
   298|     supported: no
   299|     opens: no
   300|     notes: "Fails with: java.lang.RuntimeException: java.lang.ArrayIndexOutOfBoundsException: 3"
   301|   neuroglancer:
   302|     supported: no
   303|     opens: yes
   304|   vtk-itk-viewer:
   305|     supported: no
   306|     opens: yes
   307|   WEBKNOSSOS:
   308|     supported: no
   309|     opens: no
   310|     notes: "Error when exploring as layer set: Could not extract common voxel size from layers <~ detected mags are not unique, found List((1, 1, 2), (2, 2, 1), (2, 2, 2))"
   311|   OMERO:
   312|     notes: "All images imported but sample image is corrupted. See issue"
   313|     issue_url: https://github.com/ome/ZarrReader/issues/44
   314|   Microscopy Nodes:
   315|     supported: no
   316|     opens: yes
   317| 
   318| - name: scale within coordinateTransformations on datasets (v0.4)
   319|   description: Does the viewer read the 'scale' transformation for each item in `datasets` list, show pixel size or scalebar?
   320|   sample_url: https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr
   321|   sample_name: 6001240.zarr
   322|   avivator:
   323|     supported: no
   324|     opens: yes
   325|     notes: Avivator doesn't display a scalebar or support scaling info.
   326|   vizarr:
   327|     supported: no
   328|     opens: yes
   329|     notes: Vizarr doesn't display a scalebar or support scaling info.
   330|   Vol-E:
   331|     supported: yes
   332|   napari:
   333|     supported: yes
   334|   BigDataViewer:
   335|     supported: yes
   336|   MoBIE:
   337|     supported: yes
   338|   neuroglancer:
   339|     supported: yes
   340|   vtk-itk-viewer:
   341|     supported: yes
   342|   WEBKNOSSOS:
   343|     supported: yes
   344|     viewer_url: https://webknossos.org/datasets/308ffc5547d41748/6001240_unit.zarr/view?token=KPCLCYXHd50RR7aAULPknA
   345|   OMERO:
   346|     supported: no
   347|     opens: yes
   348|   Microscopy Nodes:
   349|     supported: no
   350|     opens: yes
   351| 
   352| - name: translation within coordinateTransformations on datasets (v0.4)
   353|   description: Does the viewer read the 'translation' transformation for each item in `datasets` list?
   354|   sample_url: https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0101A/13457537.zarr
   355|   sample_name: 13457537.zarr
   356|   sample_html: translate onto <a href="https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0101A/13457227.zarr">13457227.zarr</a>
   357|   avivator:
   358|     supported: no
   359|     opens: yes
   360|     notes: Not possible to assess translation. Can't overlay multiple images
   361|   vizarr:
   362|     supported: no
   363|     opens: no
   364|     issue_url: https://github.com/hms-dbmi/vizarr/issues/271
   365|     notes: 3D translation causes image to disappear
   366|   Vol-E:
   367|     supported: no
   368|     opens: yes
   369|     notes: Not possible to assess translation. Can't overlay multiple images
   370|   napari:
   371|     supported: yes
   372|   BigDataViewer:
   373|     supported: no
   374|     opens: yes
   375|     notes: Not possible to assess translation. Can't overlay multiple images
   376|   MoBIE:
   377|     supported: no
   378|     opens: yes
   379|     notes: Not possible to assess translation. Can't overlay multiple images
   380|   vtk-itk-viewer:
   381|     supported: no
   382|     opens: yes
   383|   WEBKNOSSOS:
   384|     supported: no
   385|     opens: no
   386|     issue_url: https://github.com/scalableminds/webknossos/issues/6600
   387|   OMERO:
   388|     supported: no
   389|     opens: yes
   390|   Microscopy Nodes:
   391|     supported: no
```

## S044 — sources/S044.txt (311 lines; https://github.com/ome/ome-zarr-py/issues/640)

### S044 lines 131-189 — cited by O-038

```text
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
   155| z = zarr.create_array(
   156| store=store,
   157| shape=arr_np.shape,
   158| chunks=(1, 100, 100),
   159| shards="auto",
   160| dtype=arr_np.dtype,
   161| config={
   162| "array.target_shard_size_bytes": 1000  # 1 kB
   163| },
   164| )
   165| z[:] = arr_np
   166| print("Zarr success!")
   167| # Test ome-zarr-py:
   168| out = "test_output.ome.zarr"
   169| shutil.rmtree(out, ignore_errors=True)
   170| ome_zarr.writer.write_image(
   171| image=arr_np,
   172| group="test_output.ome.zarr",
   173| axes="zyx",
   174| storage_options={
   175| "chunks": (1, 100, 100),
   176| "shards": "auto",
   177| "config": {
   178| "array.target_shard_size_bytes": 1000  # 1 kB
   179| },
   180| },
   181| )
   182| print("OME-Zarr success!")
   183| Output
   184| ---------------------------------------------------------------------------
   185| KeyError                                  Traceback (most recent call last)
   186| File /work3/s250250/pixi_cache/envs/comptest-2327749380986101308/envs/default/lib/python3.13/site-packages/dask/utils.py:1631, in parse_bytes(s)
   187| 1630 try:
   188| -> 1631     multiplier = byte_sizes[suffix.lower()]
   189| 1632 except KeyError as e:
```

## S048 — sources/S048.txt (722 lines; https://raw.githubusercontent.com/ome/napari-ome-zarr/main/napari_ome_zarr/ome_zarr_reader.py)

### S048 lines 43-86 — cited by O-034

```text
    43|             and available_cmap.interpolation == custom_cmap.interpolation
    44|         ):
    45|             custom_cmap = available_cmap
    46|             break
    47| 
    48|     return custom_cmap
    49| 
    50| 
    51| def remove_axis_from_transform(transform: Dict[str, Any], axis: int) -> Dict[str, Any]:
    52|     """Remove a specific axis from an OME-Zarr transform dict."""
    53|     new_transform = transform.copy()
    54|     if transform["type"] == "scale":
    55|         new_scale = transform["scale"][:]
    56|         del new_scale[axis]
    57|         new_transform["scale"] = new_scale
    58|     if transform["type"] == "translation":
    59|         new_translation = transform["translation"][:]
    60|         del new_translation[axis]
    61|         new_transform["translation"] = new_translation
    62|     if transform["type"] == "rotation":
    63|         matrix = np.array(transform["rotation"])
    64|         matrix = np.delete(matrix, axis, 0)  # remove row
    65|         matrix = np.delete(matrix, axis, 1)  # remove column
    66|         new_transform["rotation"] = matrix.tolist()
    67|     if transform["type"] == "affine":
    68|         matrix = np.array(transform["affine"])
    69|         matrix = np.delete(matrix, axis, 0)  # remove row
    70|         matrix = np.delete(matrix, axis, 1)  # remove column
    71|         new_transform["affine"] = matrix.tolist()
    72|     if transform["type"] == "sequence":
    73|         new_transforms = []
    74|         for sub_transform in transform["transformations"]:
    75|             new_sub_transform = remove_axis_from_transform(sub_transform, axis)
    76|             new_transforms.append(new_sub_transform)
    77|         new_transform["transformations"] = new_transforms
    78|     return new_transform
    79| 
    80| 
    81| def single_transform_to_affine(transform: Dict[str, Any]) -> Affine:
    82|     """Convert a single OME-Zarr transform dict to an Affine object."""
    83|     aff: Affine = None
    84|     if transform["type"] == "scale":
    85|         aff = Affine(scale=transform["scale"])
    86|     elif transform["type"] == "translation":
```

### S048 lines 239-266 — cited by O-037

```text
   239|         img_name = img_name.rstrip("/")
   240|         img_name = img_name.split("/")[-1] if "/" in img_name else img_name
   241|         channel_axis = None
   242|         if "channel" in atypes and self._splits_channels():
   243|             channel_axis = atypes.index("channel")
   244|             rsp["channel_axis"] = channel_axis
   245|             anames.pop(channel_axis)
   246|             aunits.pop(channel_axis)
   247|         if all(isinstance(n, str) and n for n in anames):
   248|             rsp["axis_labels"] = tuple(anames)
   249|         # Forward units per-axis, leaving axes without a unit (e.g. a retained
   250|         # channel axis on a label) as None rather than dropping the whole tuple.
   251|         # napari treats a None entry as its default (pixel); keeping the spatial
   252|         # units means label and split-image layers stay unit-consistent, so the
   253|         # scale bar still renders (napari warns "Inconsistent units across
   254|         # layers" and hides units when one layer lacks them).
   255|         if any(isinstance(u, str) and u for u in aunits):
   256|             rsp["units"] = tuple(
   257|                 u if isinstance(u, str) and u else None for u in aunits
   258|             )
   259| 
   260|         transforms = []
   261| 
   262|         # if we have "graph" of transforms from scene...
   263|         if len(self.parent_transforms) > 0:
   264|             transforms.extend(self.parent_transforms)
   265|         else:
   266|             # First we handle (single) transform from datasets[0]...
```

### S048 lines 572-592 — cited by O-034

```text
   572| class Label(Multiscales):
   573|     @staticmethod
   574|     def matches(group: Group) -> bool:
   575|         # label must also be Multiscales
   576|         if not Multiscales.matches(group):
   577|             return False
   578|         return "image-label" in Spec.get_attrs(group)
   579| 
   580|     def _splits_channels(self) -> bool:
   581|         # A label is loaded as a single layer keeping all axes (no per-channel
   582|         # split), so the channel axis must be retained in the per-axis metadata
   583|         # to match the layer ndim.
   584|         return False
   585| 
   586|     def add_parent_transform(
   587|         self, transform: Dict[str, Any], parent_channel_axis: int | None
   588|     ) -> None:
   589|         # Add the parent transform to the current transform. If
   590|         # parent_channel_axis is not in Label, we need to remove that axis
   591|         # from the transform.
   592|         label_channel_axis = self.metadata().get("channel_axis", None)
```

### S048 lines 644-664 — cited by O-034

```text
   644|             properties["index"] = []
   645|             for label_id, props_dict in props_by_labelid.items():
   646|                 properties["index"].append(label_id)
   647|                 # ...in case some objects don't have all the keys
   648|                 for key in keys:
   649|                     properties[key].append(props_dict.get(key, None))
   650|             ms_data["properties"] = properties
   651| 
   652|         rsp = {
   653|             "name": f"labels{self.group.name}",
   654|             "visible": False,  # labels not visible initially
   655|             **ms_data,
   656|         }
   657|         # in case no colors, don't set colormap (no labels will be shown)
   658|         if len(colors) > 0:
   659|             rsp["colormap"] = colors
   660| 
   661|         return rsp
   662| 
   663| 
   664| def read_ome_zarr(root_group: Group) -> Callable:
```

### S048 lines 699-723 — cited by O-034

```text
   699|             print("No matching spec", root_group)
   700| 
   701|         if spec:
   702|             nodes = list(spec.iter_nodes())
   703|             for node in nodes:
   704|                 node_data = node.data()
   705|                 metadata = node.metadata()
   706|                 layer_type = "image"
   707|                 if Label.matches(node.group) or isinstance(node, PlateLabels):
   708|                     layer_type = "labels"
   709|                     # napari "labels" layer MUST not have "channel_axis"
   710|                     if "channel_axis" in metadata:
   711|                         ch_axis = metadata.pop("channel_axis")
   712|                         # also splice out channel_axis from node_data if present
   713|                         for level in range(len(node_data)):
   714|                             darray = node_data[level]
   715|                             if darray.ndim > ch_axis:
   716|                                 node_data[level] = da.squeeze(darray, axis=ch_axis)
   717|                 rv: LayerData = (node_data, metadata, layer_type)
   718|                 results.append(rv)
   719| 
   720|         return results
   721| 
   722|     return f
   723| 
```

## S051 — sources/S051.txt (1195 lines; https://ngff.openmicroscopy.org/rfc/5/)

### S051 lines 508-528 — cited by O-033

```text
   508| }
   509| ]
   510| }
   511| For example, the scale transformation above defines the function:
   512| x = 3.12 * i
   513| y = 2 * j
   514| i.e., the mapping from the first input axis to the first output axis is determined by the first scale parameter.
   515| Conforming readers:
   516| MUST parse identity, scale, translation transformations;
   517| SHOULD parse mapAxis, affine, rotation transformations;
   518| SHOULD display an informative warning if encountering transformations that cannot be parsed or displayed by a viewer;
   519| SHOULD be able to apply transformations to points;
   520| SHOULD be able to apply transformations to images;
   521| Coordinate transformations can be stored in multiple places to reflect different use cases.
   522| Inside multiscales > datasets: coordinateTransformations herein MUST be restricted
   523| to a single scale, identity or sequence of a scale followed by a translation transformation.
   524| For more information, see multiscales section below.
   525| Inside multiscales > coordinateTransformations: Additional transformations for single multiscale images MAY be stored here.
   526| The coordinateTransformations field MUST contain an array of valid transformations.
   527| The input to every one of these transformations MUST be the intrinsic coordinate system.
   528| The output can be another coordinate system defined under multiscales > coordinateSystems.
```

### S051 lines 536-553 — cited by O-033

```text
   536| using the input and output fields.
   537| These fields MUST correspond to the name of a coordinate system or the path to a multiscales group.
   538| Exceptions are if the coordinate transformation is wrapped in another transformation,
   539| e.g. as part of a sequence, byDimension or bijection.
   540| In these cases, the input and output fields MAY be omitted or null.
   541| Graph connectedness: The coordinate systems defined in the multiscales metadata
   542| and the scene metadata combined with the coordinate transformations form a transformations graph.
   543| In this graph, coordinate systems represent nodes and coordinate transformations represent edges.
   544| The graph MUST be fully connected in the sense that any two coordinate systems in the metadata
   545| MUST be connected by a sequence of edges represented by coordinate transformations.
   546| Coordinate systems that are connected by a non-invertible transformation count as connected in this sense, even though graph traversal may not be closed-form computable in every direction.
   547| Coordinate transformations are functions of points in the input space to points in the output space.
   548| We call this the “forward” direction.
   549| Points are ordered lists of coordinates,
   550| where a coordinate is the location/value of that point along its corresponding axis.
   551| The indexes of axis dimensions correspond to indexes into transformation parameter arrays (see examples).
   552| Image rendering: When rendering transformed images and interpolating,
   553| implementations may need the “inverse” transformation - from the fixed
```

## S052 — sources/S052.txt (647 lines; https://api.github.com/repos/ome/ome-zarr-py/releases?per_page=15)

### S052 lines 120-136 — cited by O-029

```text
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

### S052 lines 292-308 — cited by O-029

```text
   292|   "immutable": false,
   293|   "prerelease": false,
   294|   "created_at": "2026-04-14T09:30:21Z",
   295|   "updated_at": "2026-04-14T09:43:07Z",
   296|   "published_at": "2026-04-14T09:43:07Z",
   297|   "assets": [],
   298|   "tarball_url": "https://api.github.com/repos/ome/ome-zarr-py/tarball/v0.16.0",
   299|   "zipball_url": "https://api.github.com/repos/ome/ome-zarr-py/zipball/v0.16.0",
   300|   "body": "## What's Changed\r\n* Support sharding by @melonora in https://github.com/ome/ome-zarr-py/pull/534\r\n* Document sharding by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/569\r\n* feat: do not delay writing metadata by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/568\r\n* [pre-commit.ci] pre-commit autoupdate by @pre-commit-ci[bot] in https://github.com/ome/ome-zarr-py/pull/558\r\n* chore: fix defaults for scale factors by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/567\r\n\r\n\r\n**Full Changelog**: https://github.com/ome/ome-zarr-py/compare/v0.15.0...v0.16.0",
   301|   "mentions_count": 3
   302|  },
   303|  {
   304|   "url": "https://api.github.com/repos/ome/ome-zarr-py/releases/306551469",
   305|   "assets_url": "https://api.github.com/repos/ome/ome-zarr-py/releases/306551469/assets",
   306|   "upload_url": "https://uploads.github.com/repos/ome/ome-zarr-py/releases/306551469/assets{?name,label}",
   307|   "html_url": "https://github.com/ome/ome-zarr-py/releases/tag/v0.15.0",
   308|   "id": 306551469,
```

### S052 lines 335-351 — cited by O-029

```text
   335|   "immutable": false,
   336|   "prerelease": false,
   337|   "created_at": "2026-03-30T07:48:56Z",
   338|   "updated_at": "2026-04-08T11:57:02Z",
   339|   "published_at": "2026-04-08T11:57:02Z",
   340|   "assets": [],
   341|   "tarball_url": "https://api.github.com/repos/ome/ome-zarr-py/tarball/v0.15.0",
   342|   "zipball_url": "https://api.github.com/repos/ome/ome-zarr-py/zipball/v0.15.0",
   343|   "body": "## What's Changed\r\n* More Pythons tested by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/551\r\n* Use markdown and Jupyter notebooks in doc pages by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/548\r\n* Fix downloading ome-zarr 0.5 by @psobolewskiPhD in https://github.com/ome/ome-zarr-py/pull/562\r\n* BREAKING CHANGE: Deprecate writing v01, v02 and v03 by @jo-mueller in https://github.com/ome/ome-zarr-py/pull/557\r\n* update codespell github action by @melonora in https://github.com/ome/ome-zarr-py/pull/565\r\n\r\n\r\n**Full Changelog**: https://github.com/ome/ome-zarr-py/compare/v0.14.0...v0.15.0",
   344|   "mentions_count": 3
   345|  },
   346|  {
   347|   "url": "https://api.github.com/repos/ome/ome-zarr-py/releases/295395395",
   348|   "assets_url": "https://api.github.com/repos/ome/ome-zarr-py/releases/295395395/assets",
   349|   "upload_url": "https://uploads.github.com/repos/ome/ome-zarr-py/releases/295395395/assets{?name,label}",
   350|   "html_url": "https://github.com/ome/ome-zarr-py/releases/tag/v0.14.0",
   351|   "id": 295395395,
```

### S052 lines 550-566 — cited by O-029

```text
   550|   "immutable": false,
   551|   "prerelease": false,
   552|   "created_at": "2025-08-18T15:04:17Z",
   553|   "updated_at": "2025-08-18T15:14:08Z",
   554|   "published_at": "2025-08-18T15:14:08Z",
   555|   "assets": [],
   556|   "tarball_url": "https://api.github.com/repos/ome/ome-zarr-py/tarball/v0.12.0",
   557|   "zipball_url": "https://api.github.com/repos/ome/ome-zarr-py/zipball/v0.12.0",
   558|   "body": "## What's Changed\r\n* Ome zarr v0.5 reading and writing by @will-moore in https://github.com/ome/ome-zarr-py/pull/413 🥇 \r\n* Drop 3.10 for pre-release build by @joshmoore in https://github.com/ome/ome-zarr-py/pull/462\r\n* [pre-commit.ci] pre-commit autoupdate by @pre-commit-ci[bot] in https://github.com/ome/ome-zarr-py/pull/443\r\n* Enforce more ruff rules by @DimitriPapadopoulos in https://github.com/ome/ome-zarr-py/pull/442\r\n* Change deprecated Gaussian/Laplacian pyramid args by @AlbertDominguez in https://github.com/ome/ome-zarr-py/pull/454\r\n* Remove unused field `tools.setuptools.dynamic` by @jdblischak in https://github.com/ome/ome-zarr-py/pull/456\r\n* PEP 639 compliance by @DimitriPapadopoulos in https://github.com/ome/ome-zarr-py/pull/464\r\n* Update pre-commit ruff legacy alias by @DimitriPapadopoulos in https://github.com/ome/ome-zarr-py/pull/465\r\n* Use f-string by @DimitriPapadopoulos in https://github.com/ome/ome-zarr-py/pull/466\r\n* Enforce ruff/Pylint Refactor rules (PLR) by @DimitriPapadopoulos in https://github.com/ome/ome-zarr-py/pull/467\r\n* [pre-commit.ci] pre-commit autoupdate by @pre-commit-ci[bot] in https://github.com/ome/ome-zarr-py/pull/469\r\n\r\n## New Contributors\r\n* @AlbertDominguez made their first contribution in https://github.com/ome/ome-zarr-py/pull/454 🎉 \r\n* @jdblischak made their first contribution in https://github.com/ome/ome-zarr-py/pull/456 👏🏽 \r\n\r\n**Full Changelog**: https://github.com/ome/ome-zarr-py/compare/v0.11.1...v0.12.0",
   559|   "mentions_count": 6
   560|  },
   561|  {
   562|   "url": "https://api.github.com/repos/ome/ome-zarr-py/releases/238224437",
   563|   "assets_url": "https://api.github.com/repos/ome/ome-zarr-py/releases/238224437/assets",
   564|   "upload_url": "https://uploads.github.com/repos/ome/ome-zarr-py/releases/238224437/assets{?name,label}",
   565|   "html_url": "https://github.com/ome/ome-zarr-py/releases/tag/v0.12rc1",
   566|   "id": 238224437,
```

## S053 — sources/S053.txt (268 lines; https://raw.githubusercontent.com/ome/ngff/v0.5/schemas/image.schema)

### S053 lines 23-82 — cited by O-040

```text
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
    39|       "type": "string"
    40|      },
    41|      "datasets": {
    42|       "type": "array",
    43|       "minItems": 1,
    44|       "items": {
    45|        "type": "object",
    46|        "properties": {
    47|         "path": {
    48|          "type": "string"
    49|         },
    50|         "coordinateTransformations": {
    51|          "$ref": "#/$defs/coordinateTransformations"
    52|         }
    53|        },
    54|        "required": [
    55|         "path",
    56|         "coordinateTransformations"
    57|        ]
    58|       }
    59|      },
    60|      "axes": {
    61|       "$ref": "#/$defs/axes"
    62|      },
    63|      "coordinateTransformations": {
    64|       "$ref": "#/$defs/coordinateTransformations"
    65|      }
    66|     },
    67|     "required": [
    68|      "datasets",
    69|      "axes"
    70|     ]
    71|    },
    72|    "minItems": 1,
    73|    "uniqueItems": true
    74|   },
    75|   "omero": {
    76|    "type": "object",
    77|    "properties": {
    78|     "channels": {
    79|      "type": "array",
    80|      "items": {
    81|       "type": "object",
    82|       "properties": {
```

### S053 lines 188-269 — cited by O-040

```text
   188|       },
   189|       "required": [
   190|        "name"
   191|       ]
   192|      }
   193|     ]
   194|    }
   195|   },
   196|   "coordinateTransformations": {
   197|    "type": "array",
   198|    "minItems": 1,
   199|    "contains": {
   200|     "type": "object",
   201|     "properties": {
   202|      "type": {
   203|       "type": "string",
   204|       "enum": [
   205|        "scale"
   206|       ]
   207|      },
   208|      "scale": {
   209|       "type": "array",
   210|       "minItems": 2,
   211|       "items": {
   212|        "type": "number"
   213|       }
   214|      }
   215|     }
   216|    },
   217|    "maxContains": 1,
   218|    "items": {
   219|     "oneOf": [
   220|      {
   221|       "type": "object",
   222|       "properties": {
   223|        "type": {
   224|         "type": "string",
   225|         "enum": [
   226|          "scale"
   227|         ]
   228|        },
   229|        "scale": {
   230|         "type": "array",
   231|         "minItems": 2,
   232|         "items": {
   233|          "type": "number"
   234|         }
   235|        }
   236|       },
   237|       "required": [
   238|        "type",
   239|        "scale"
   240|       ]
   241|      },
   242|      {
   243|       "type": "object",
   244|       "properties": {
   245|        "type": {
   246|         "type": "string",
   247|         "enum": [
   248|          "translation"
   249|         ]
   250|        },
   251|        "translation": {
   252|         "type": "array",
   253|         "minItems": 2,
   254|         "items": {
   255|          "type": "number"
   256|         }
   257|        }
   258|       },
   259|       "required": [
   260|        "type",
   261|        "translation"
   262|       ]
   263|      }
   264|     ]
   265|    }
   266|   }
   267|  }
   268| }
   269| 
```

## S055 — sources/S055.txt (74 lines; https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr/0/zarr.json)

### S055 lines 8-64 — cited by O-019

```text
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
```

## S058 — sources/S058.txt (398 lines; https://docs.webknossos.org/webknossos/data/zarr.html; local-capture (origin URL not recorded))

### S058 lines 352-370 — cited by O-027

```text
   352| webknossos convert \
   353| --layer-name em \
   354| --voxel-size 11.24,11.24,25 \
   355| --chunk-shape 64,64,64 \
   356| --jobs 4 \
   357| input.tif output.zarr
   358| webknossos compress --jobs 4 output.zarr
   359| webknossos downsample --jobs 4 output.zarr
   360| This example will create a sharded Zarr v3 dataset with a voxel size of (11.24, 11.24, 25) nm3 and a chunk size of (64,64,64) voxel.
   361| A maximum of 4 parallel jobs will be used to parallelize the conversion, compression and downsampling.
   362| Using the --data-format zarr argument will produce unsharded Zarr v2 datasets.
   363| Read the full documentation at WEBKNOSSOS CLI.
   364| Conversion with Python¶
   365| You can use the free WEBKNOSSOS Python library to convert image stacks to Zarr3 or integrate the conversion as part of an existing workflow.
   366| import webknossos as wk
   367| def main() -> None:
   368| """Convert a folder of image files to a WEBKNOSSOS dataset."""
   369| dataset = wk.Dataset.from_images(
   370| input_path=INPUT_DIR,
```

### S058 lines 375-396 — cited by O-027

```text
   375| )
   376| print(f"Saved {dataset.name} at {dataset.path}.")
   377| with wk.webknossos_context(token="..."):
   378| dataset.upload()
   379| if __name__ == "__main__":
   380| main()
   381| Read the full example in the WEBKNOSSOS Python library documentation.
   382| Time-Series and N-Dimensional Datasets¶
   383| WEBKNOSSOS also supports loading n-dimensional datasets, e.g. 4D = time series of 3D microscopy.
   384| This feature is currently only supported for Zarr datasets due to their flexible structure and design for n-dimensional data.
   385| Performance Considerations¶
   386| To get the best streaming performance for Zarr datasets consider the following settings.
   387| Use chunk sizes of 32 - 128 voxels^3
   388| Enable sharding (only available in Zarr 3+)
   389| Use 3D downsampling
   390| Get Help
   391| Community Forums
   392| Email Support
   393| Back to top
   394| Previous
   395| Image Stacks
   396| Next
```

## S059 — sources/S059.txt (885 lines; https://ngff.openmicroscopy.org/0.4/)

### S059 lines 121-142 — cited by O-014

```text
   121| Some of the JSON examples in this document include comments. However, these are only for
   122| clarity purposes and comments MUST NOT be included in JSON objects.
   123| 2. On-disk (or in-cloud) layout
   124| An overview of the layout of an OME-Zarr fileset should make
   125| understanding the following metadata sections easier. The hierarchy
   126| is represented here as it would appear locally but could equally
   127| be stored on a web server to be accessed via HTTP or in object storage
   128| like S3 or GCS.
   129| OME-Zarr is an implementation of the OME-NGFF specification using the Zarr
   130| format. Arrays MUST be defined and stored in a hierarchical organization as
   131| defined by the
   132| version 2 of the Zarr specification .
   133| OME-NGFF metadata MUST be stored as attributes in the corresponding Zarr
   134| groups.
   135| 2.1. Images
   136| The following layout describes the expected Zarr hierarchy for images with
   137| multiple levels of resolutions and optionally associated labels.
   138| Note that the number of dimensions is variable between 2 and 5 and that axis names are arbitrary, see § 3.4 "multiscales" metadata for details.
   139| For this example we assume an image with 5 dimensions and axes called t,c,z,y,x.
   140| .                             # Root folder, potentially in S3,
   141| │                             # with a flat list of images by image ID.
   142| │
```

## S072 — sources/S072.txt (147 lines; allen-cell-animated/agave:README.md; https://raw.githubusercontent.com/allen-cell-animated/agave/main/README.md)

### S072 lines 1-12 — cited by O-028

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
    12| 
```

### S072 lines 15-36 — cited by O-028

```text
    15| ```
    16| git submodule update --init
    17| ```
    18| 
    19| ### For WINDOWS:
    20| 
    21| Make sure you are in an environment where vsvarsall has been run, e.g. a "VS2022 x64 Native Tools Command Prompt"
    22| 
    23| **tensorstore** requires:
    24| 
    25| - Python 3.7 or later
    26| - CMake 3.24 or later
    27| - Perl, for building libaom from source (default). Must be in PATH. Not required if -DTENSORSTORE_USE_SYSTEM_LIBAOM=ON is specified.
    28| - NASM, for building libjpeg-turbo, libaom, and dav1d from source (default). Must be in PATH.Not required if -DTENSORSTORE*USE_SYSTEM*{JPEG,LIBAOM,DAV1D}=ON is specified.
    29| - GNU Patch or equivalent. Must be in PATH.
    30| 
    31| A convenient way to install Perl, NASM, and GNU Patch is with chocolatey.
    32| 
    33| ```
    34| choco install strawberryperl nasm patch
    35| ```
    36| 
```

## S117 — sources/S117.txt (904 lines; allen-cell-animated/agave:docs/agave.rst)

### S117 lines 18-36 — cited by O-028

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
```

### S117 lines 89-142 — cited by O-028

```text
    89| 
    90| This menu will present a list of the most recently opened volume files
    91| for quick selection if AGAVE was previously used on your computer.
    92| This choice will then open the `Load Settings <#load-settings>`__ dialog.
    93| 
    94| Load Settings
    95| -------------
    96| 
    97| In order to support loading from very large datasets, AGAVE can load subsets of data
    98| based on precomputed multiresolution levels stored in the data, time series, channels,
    99| and in some cases sub-regions within the spatial volume data.
   100| 
   101| OME-Zarr supports all of the above selections when present in the data.  Other formats are more restrictive and may only support a few of the options.
   102| The Load Settings dialog presents you with a memory estimate of how much data will be loaded with current settings.  Coupled with knowledge of your own system's configuration, this allows you to make informed choices about how much data to load.
   103| The memory estimate is an expected estimate of how much GPU memory AGAVE will use for rendering.  Main memory usage may be higher, but is not indicated as usually GPU memory is the limiting factor.
   104| 
   105| Resolution Level
   106| ~~~~~~~~~~~~~~~~
   107| 
   108| The OME-Zarr format supports precomputed multiresolution data and will let you select the resolution level.
   109| The highest resolution is the default, so beware if you have a large dataset, you risk running out of memory.
   110| 
   111| Time
   112| ~~~~
   113| 
   114| If you are loading time-series data, you may select the initial time to load.
   115| You will be able to change the current time point after the data is loaded.
   116| (See `Time Panel <#time-panel>`__)
   117| 
   118| Channels
   119| ~~~~~~~~
   120| 
   121| You may choose to exclude certain channels from being loaded.
   122| All channels will be selected by default. If you leave channels out, be aware you will have to reload the file to get them back.
   123| 
   124| Subregion
   125| ~~~~~~~~~
   126| 
   127| For OME-Zarr data, you may select a sub-region in X, Y, and Z. This is useful for loading a subset of a large dataset.
   128| A typical usage might be to first load a very low resolution level and then select a sub-region of interest to then load at a higher resolution.
   129| 
   130| Keep Current AGAVE Settings
   131| ~~~~~~~~~~~~~~~~~~~~~~~~~~~
   132| 
   133| If you have already loaded a volume file and have made changes to the appearance, channel intensities, lighting, etc., you can choose to keep those settings when loading a new volume file.
   134| This is useful if you are loading several images consecutively that have similar channels and dimensions, and want to apply a consistent appearance to each.
   135| 
   136| Adjusting the camera view
   137| -------------------------
   138| 
   139| The 3D viewport in AGAVE supports direct manipulation by *zoom*, *pan*,
   140| and *rotate*.  It also provides a toolbar with some convenient buttons
   141| for common view settings.
   142| 
```

## Mechanical quote checks

- O-001: exact_at_cited_lines ['S003', 68, 72] — "OME-Zarr is implemented using the Zarr format as defined by the version 3 of the Zarr specification."
- O-002: exact_at_cited_lines ['S003', 153, 156] — "The OME-Zarr Metadata is stored in the various zarr.json files throughout the above array hierarchy. In this file, the metadata is stored under the namespaced key ome in attributes."
- O-003: not_found_in_cited_sources — "The \"dimension_names\" attribute MUST be included in the zarr.json of the Zarr array of a multiscale level and MUST match the names in the \"axes\" metadata."
- O-004: not_found_in_cited_sources — "The \"axes\" MUST contain 2 or 3 entries of \"type:space\" and MAY contain one additional entry of \"type:time\" and MAY contain one additional entry of \"type:channel\" or a null / custom type."
- O-005: not_found_in_cited_sources — "Each dictionary in \"datasets\" MUST contain the field \"path\", whose value contains the path to the array for this resolution relative to the current zarr group. The \"path\"s MUST be ordered from l"
- O-006: not_found_in_cited_sources — "The transformations are defined according to § 2.3 \"coordinateTransformations\" metadata. The transformation MUST only be of type translation or scale."
- O-007: not_found_in_cited_sources — "The pixels of the label images MUST be integer data types, i.e. one of [uint8, int8, uint16, int16, uint32, int32, uint64, int64]. Intermediate groups between \"labels\" and the images within it are a"
- O-008: exact_at_cited_lines ['S003', 461, 466] — "Conforming readers SHOULD display labels using the colors specified by the colors JSON array, as follows."
- O-009: not_found_in_cited_sources — "The \"omero\" metadata is optional, but if present it MUST contain the field \"channels\", which is an array of dictionaries describing the channels of the image."
- O-010: exact_at_cited_lines ['S003', 120, 129] — "Three groups MUST be defined above the images: the group above the images defines the well and MUST implement the well specification."
- O-011: not_found_in_cited_sources — "MUST have the value \"3\" for the \"bioformats2raw.layout\" key in their OME-Zarr Metadata in the zarr.json at the top of the hierarchy"
- O-012: exact_at_cited_lines ['S016', 368, 384] — "Changelog: added FormatV05 (May 2025): writing not supported yet"
- O-013: not_found_in_cited_sources — "For zarr v3, everything is under the \"ome\" namespace"
- O-014: not_found_in_cited_sources — "OME-Zarr is an implementation of the OME-NGFF specification using the Zarr format. Arrays MUST be defined and stored in a hierarchical organization as defined by the version 2 of the Zarr specificatio"
- O-015: exact_at_cited_lines ['S033', 159, 162] — "| v3/0.5            | yes                 | yes   | yes  | no   | yes  |"
- O-016: exact_at_cited_lines ['S033', 225, 226] — "that should be used while writing Zarr. Current supported values are 0.4 and 0.5."
- O-017: exact_at_cited_lines ['S034', 43, 46] — "- all v2 arrays converted to v3, optionally sharding the data"
- O-018: exact_at_cited_lines ['S034', 78, 83] — "[190129.zarr](https://ome.github.io/ome-ngff-validator/?source=https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0090/190129.zarr)"
- O-019: not_found_in_cited_sources — "\"name\": \"sharding_indexed\"
- O-020: exact_at_cited_lines ['S011', 151, 159] — "The default napari reader (without napari-ome-zarr plugin) does not correctly read OME-Zarr coordinate transformations/scale metadata, resulting in incorrect anisotropic volume rendering."
- O-021: exact_at_cited_lines ['S014', 141, 142] — "Vizarr renders chunks repetitively for image data converted into OME-ZARR v0.5 format, using the resave command of https://github.com/ome/ome2024-ngff-challenge"
- O-022: exact_at_cited_lines ['S008', 149, 150] — "This updates ome-zarr-py to use zarr-python v3 but doesn't include support for writing Zarr v3 (OME-Zarr v0.5)."
- O-023: exact_at_cited_lines ['S013', 151, 156] — "This PR adds support for writing OME-Zarr v0.5, which becomes the default CurrentFormat()."
- O-024: exact_at_cited_lines ['S027', 150, 159] — "Investigating a lighter-weight alternative to ome-zarr-py."
- O-025: exact_at_cited_lines ['S043', 80, 89] — "Can the viewer handle pyramids when the scale factor between levels is not equal to 2?"
- O-026: exact_at_cited_lines ['S043', 394, 411] — "Does the viewer read the 'scale' transformation for each item in `multiscales` list?"
- O-027: exact_at_cited_lines ['S058', 387, 388] — "Enable sharding (only available in Zarr 3+)"
- O-028: exact_at_cited_lines ['S072', 1, 4] — "AGAVE is a desktop application for viewing multichannel volume data. Several formats are supported, including OME-ZARR 0.4 and 0.5, OME-TIFF and Zeiss .czi files."
- O-029: exact_at_cited_lines ['S052', 300, 300] — "## What's Changed\r\n* Support sharding by @melonora in https://github.com/ome/ome-zarr-py/pull/534"
- O-030: exact_at_cited_lines ['S026', 257, 257] — "## What's Changed\r\n* drop ome-zarr dependency by @will-moore in https://github.com/ome/napari-ome-zarr/pull/123"
- O-031: exact_at_cited_lines ['S023', 150, 154] — "This command will traverse your local filesystem, looking for zarr images (only .zattrs for now - can add zarr v3 support as a follow-up)"
- O-032: exact_at_cited_lines ['S031', 1, 6] — "Web page for validating OME-NGFF files"
- O-033: exact_at_cited_lines ['S051', 516, 520] — "MUST parse identity, scale, translation transformations;"
- O-034: not_found_in_cited_sources — "napari \"labels\" layer MUST not have \"channel_axis\"
- O-035: exact_at_cited_lines ['S043', 51, 51] — "The channel labels are read from 'omero' metadata, but the colors are ignored"
- O-036: exact_at_cited_lines ['S005', 1, 1] — "ValueError: Clone exceeded 256 MiB or 120 second cap; partial clone retained, not admitted"
- O-037: not_found_in_cited_sources — "napari treats a None entry as its default (pixel); keeping the spatial units means label and split-image layers stay unit-consistent, so the scale bar still renders (napari warns \"Inconsistent units "
- O-038: exact_at_cited_lines ['S044', 139, 139] — "ome-zarr-py does not appear to work correctly with auto-sharding."
- O-039: exact_at_cited_lines ['S018', 540, 558] — "check whether the Well exists at this row/column"
- O-040: not_found_in_cited_sources — "\"type\": \"object\","
