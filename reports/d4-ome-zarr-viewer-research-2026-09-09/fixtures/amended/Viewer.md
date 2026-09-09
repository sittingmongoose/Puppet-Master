# Slide Scout — amended evaluation fixture

This is a separate synthetic planning fixture for a research-workflow evaluation, not a Puppet Master feature. The frozen initial plan remains preserved separately. These additions specify correctness and acceptance for the original viewing behavior; implementation, acceptance execution and unanswered capability choices remain open.

The desktop application opens a local OME-Zarr 0.5 fileset and lists the images it finds. Selecting an image opens a canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant, and optional overlays for associated label images. A details panel shows dimensions, units and coordinates. The viewer chooses an available pyramid level appropriate for the current view.

Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed. Opening failures explain which image or data could not be displayed and allow the user to choose another item.

The initial implementation should interoperate with filesets from real OME-Zarr 0.5 tools. Source files remain unchanged; display settings are local to the viewing session. Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan. Additional capability choices require explicit review.

Acceptance uses representative filesets to check image discovery, navigation, channel and plane controls, calibrated coordinate display and aligned label overlays. A large dataset must not freeze interaction. Malformed or unavailable input must produce understandable feedback rather than a crash.

## Version, node role and image identity

Identify the selected node from metadata, preserving its supplied image-group path even when a containing directory ends in `.zarr`. Retain the owning group and selected multiscales entry as part of displayed-image identity. Shared pixel arrays may share decoded bytes, but cannot automatically share coordinates, labels or calibrated view state across entries. Validate the Zarr storage version and node role separately from the OME namespace and version. A filename substring is not format evidence. Do not silently reinterpret generic Zarr, legacy OME metadata, inconsistent versions or an array selected in place of an image group as an admitted OME-Zarr 0.5 image.

State which container organizations are supported. Within that scope, resolve the declared image paths in their proper metadata context and keep distinct images distinct. An incomplete, cancelled or unreadable discovery is not a completed empty inventory. A broken image leaves usable siblings selectable. Plate/well support, transitional collections, arbitrary recursive discovery and their presentation remain unanswered capability choices; these clauses do not admit all of them.

Acceptance distinguishes renamed but otherwise identical image directories, dotted or nested image paths, generic groups, legacy metadata, inconsistent versions, wrong node roles and malformed JSON. A shared array referenced by two entries with different transforms must retain the coordinate context of the entry selected for display. An entry chooser and exhaustive multi-entry display remain separate choices. For each admitted container type, verify declared-path identity, usable siblings and truthful incomplete-discovery status.

## Axis identity and selection

Derive rank, indices and slicing from the OME axes and matching array dimension names. Preserve each axis's name, type, order and unit; do not require literal TCZYX names or a fixed five-dimensional source. An absent axis and a present length-one axis remain distinguishable. Do not expose fictitious navigation or infer anatomical orientation from an arbitrary name. Keep details and active controls consistent with the dimensions actually selected.

Acceptance checks reference slices for supported 2D through 5D combinations, descriptive axis names, distinct time/channel/plane values and non-square dimensions. Include absent versus length-one time and third-spatial axes, and contradictory names/rank/order as negative cases. Backend broadcasting alone does not prove correct slice identity.

## Pyramid paths and geometry

Resolve each `datasets[].path` relative to its image group using the selected multiscales entry, retaining declared level order and the geometry of that level. Do not construct paths from integer indices, sort them lexicographically or infer physical calibration only from shape ratios. A missing declared level cannot become fabricated data. Automatic level selection must preserve the physical location of the viewed image and overlays.

Acceptance includes non-numeric and nested level paths, anisotropic and non-twofold level changes, and a missing declared level. A known landmark remains at the same physical position across level changes. Manual level or region controls are separate choices.

## Coordinates and per-axis units

Apply each level's valid dataset transformations in order, followed by the selected multiscales entry's transformations. For inline scale and translation, use `p = s_global * (s_dataset * i + t_dataset) + t_global`, with identity for an omitted global mapping. Use the same mapping for the canvas, details and labels. Preserve per-axis units or convert values numerically between compatible units. Keep index coordinates distinct from physical calibration; missing or unsupported calibration is explicit, never invented.

Acceptance verifies index 4 with dataset scale 2/translation 10 and global scale 3/translation -5 yields 49; the corresponding next-level index 2/scale 4 also yields 49. Include mixed nanometer/micrometer axes and time scale 2 centiseconds at index 25, equal to 0.5 seconds. Preserve valid negative physical coordinates: time scale 2 seconds and translation -5 seconds yield -5 at index 0 and -3 at index 1; do not clamp them to zero or invent a clock when units are missing. Translation before scale is a negative 0.5 metadata case. For an admitted transform-path representation, verify equivalence with an inline reference; otherwise disclose that unsupported representation.

## Associated labels and source resolution

Discover associated label groups from the selected image's labels registry, resolving registered paths relative to the labels group and retaining intermediate groups. Preserve whether `image-label`, `source` and `source.image` were supplied. Their absence does not create stored metadata. Missing recommended or optional enclosing metadata alone is not proof of an invalid label image.

Resolve a supplied source path literally from the label image group. For a present source object without `image`, evaluate the stated `../../` default. Validate the resulting image target against the registration context; never silently add parent steps or override an explicit conflicting reference. Distinguish this case from an absent source object. Any registry-based recovery when association remains ambiguous requires a documented policy; it is not approved here. If a trustworthy association cannot be established, explain why that overlay is unavailable while retaining the base image.

Check axes, level counts and physical mappings before overlaying. Image and label dataset paths may differ and must be independently resolved. A source-group reference that leaves multiple multiscales coordinate contexts possible is insufficient to choose an aligned overlay. Acceptance distinguishes direct registered labels with omitted optional source, deeper `labels/original/0` labels with an explicit `../../..` source, absent enclosing metadata, an empty source object whose default reaches a label container, and conflicting references. Unresolved cases require an explicit diagnostic or a separately adopted recovery policy, not unconditional successful attachment. A labeled landmark stays aligned at multiple levels, planes and times; mismatched level counts are diagnosed.

## Exact categorical identity

Treat labels as categorical integers independently of the source intensity dtype and codec. Preserve supported signed and unsigned label values exactly through lookup and color assignment; use label values as lookup keys. Do not narrow, normalize, interpolate or route identities through an inexact floating-point representation. Sampling may not invent intermediate IDs. Sparse IDs must not require an allocation proportional to the largest ID. Report unsupported integer representations instead of merging identities.

Acceptance distinguishes 1, 65537 and 16777217, supported negative IDs, and adjacent supported uint64 IDs above 2^53. Supply shuffled label-value/color entries and sparse high IDs so positional lookup and maximum-ID allocation cannot pass accidentally. Test different parent/label dtypes and discrete sampling during zoom. Palette, opacity and background defaults remain separate choices.

## Decoder and dependency compatibility

Record the implemented dtype, transform and codec/layout compatibility envelope and the exact backend version used to demonstrate it. Decode the complete admitted chain, including reverse decoding order, array permutations, byte order and applicable shard/index codecs. A codec name in documentation, passing metadata parsing or a later fix on another revision is not decoded-value proof. Unsupported extensions receive a truthful capability result.

Acceptance uses asymmetric known values for byte order and transpose, a supported compound codec chain, and a non-self-inverse three-dimensional transpose combined with sharding. Compare reference slices and values, not just successful opening. Include the selected version's relevant fixes and failure cases. No backend, production dependency pin, exhaustive extension catalog or implementation stack is selected by this fixture.

## Fill, failed reads and source immutability

Use declared fill values only for absent or uninitialized data under the admitted storage semantics. Absence interpreted as fill does not establish whether data were intentionally omitted or whether the acquisition is complete. Permission failures, malformed metadata, corruption, failed decodes, cancellation and partial destination buffers do not become valid fill pixels. Check results before publishing an image; a failed overlay or image does not abort the application or prevent selecting usable data.

Reading, diagnostics and any model normalization must preserve source metadata and pixel bytes. Do not create a catalog, cache or display-settings file inside the source fileset. Display settings remain session-local. Acceptance distinguishes a valid absent chunk with nonzero fill from the failure variants, and verifies source-tree contents before and after successful and failed operations. Filesystem access-time changes are outside the content-immutability check.

## Honest validation and evidence

Distinguish metadata shape validation, cross-node semantic checks, decoder support, operational failures and demonstrated display correctness. State the validator/profile and version; schema acceptance alone is not full format conformance, and schema rejection of a recommended-field omission does not establish a universal reader-rejection rule. Expose warnings or normalization without rewriting the source. Preserve conflicting specification/schema/producer evidence instead of silently resolving it by mutation or declaring an entire collection valid or invalid.

Acceptance includes schema-pass but semantically invalid transforms, contradictory cross-array metadata, unavailable validation and a documented authority conflict. A fixture manifest records exact metadata identity, producer/version, provenance and permitted local acquisition, expected slice/calibration/label values, and the checks actually run. An inventory of URLs or parsed metadata is not a passing image corpus.

## Bounded work and current-view state

Keep metadata discovery and data decode away from interaction handling. Schedule a bounded working set for the current image and multiscales-entry identity, level, viewport, time, plane, channels and overlays; full-resolution volume or whole-series loading cannot be a prerequisite for a useful coarse view. Use checked shape, stride, byte-count and index-offset arithmetic, validating bounds before allocation or upload. Bound pending work, decoded buffers and caches together. Stop obsolete scheduling and use supported cancellation, recognizing that an individual in-flight operation may finish later. Release stale and previous-image resources when their actual consumers finish, within the cache policy.

Publish results only for their still-current view identity. Delayed success, error or partial data from an obsolete request cannot replace current pixels, details or control state. A failed new selection must not leave an old image labeled as the newly loaded selection. Acceptance delays A, completes B after a view change, then delivers A's success/failure/partial variants. Include rapid time/plane/channel/overlay changes and an over-RAM full-resolution dataset with a bounded coarse view. Check overflowing dimension products before allocation and logical extents above 4 GiB with small requested regions for size wrapping. Repeated open/switch/cancel cycles must return to the configured resource bounds after work settles, while retaining buffers still in use. Sparse controlled inputs can check arithmetic without requiring a full 4 GiB allocation; real allocations use declared capable hardware. Record first-useful-view latency, interaction delays, peak memory and I/O on stated fixtures and hardware. Numerical budgets remain open and no passing performance result is asserted.

## Intensity and optional display metadata

For admitted intensity types, preserve signedness and numeric interpretation through decoding and display conversion. Do not reinterpret signed int32 bit patterns as float32 values. Handle constant and nonfinite inputs explicitly so normalization cannot silently publish invalid results. Missing optional channel names or other display metadata cannot cause an unchecked conversion failure; it also cannot fabricate scientific metadata.

Acceptance includes negative int32 values, constant finite data, nonfinite values where supported, and missing optional channel labels. Verify decoded values separately from the chosen display mapping. Saved display windows, automatic statistics, float display quantization and presentation defaults remain unanswered policies. All checks in this document are acceptance specifications, not executed Slide Scout tests.
