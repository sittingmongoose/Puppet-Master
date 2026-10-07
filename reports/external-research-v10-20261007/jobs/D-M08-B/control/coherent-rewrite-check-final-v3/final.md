# Categorical raster downsampling recommendation

## Recommendation

Choose a resampling and validity policy for each band from its meaning. For a categorical band, nearest-neighbor is a reasonable proposed baseline only when the intended output is one sampled source class per output cell. This is an inference and product choice, not a categorical guarantee in Rasterio’s general resampling guidance. If the intended value is the dominant class within an output footprint, define that aggregation, how invalid contributors count, and tie handling separately. Do not average class IDs or infer class meaning from code magnitude. [S1]

Before resampling, bind the authoritative code-to-label mapping and allowed valid class-code set. Keep class identity separate from validity. Resolve nodata metadata against the schema and masks. If a nodata sentinel can also be a valid class, the pixel value alone is ambiguous; use authoritative metadata or a validity mask. Rasterio’s mask guide illustrates that declared nodata can hide meaningful values. The cited docs do not guarantee that the selected operation will exclude nodata from output class values, so verify that on the chosen operation. The actual mapping and collision status are unknown here. [S2]

Choose mask meaning explicitly. GDAL-style valid-data masks use nonzero for valid pixels; NumPy masked-array masks use `True` for invalid pixels. An existing `.msk`, dataset-wide alpha, or internal mask takes precedence over nodata metadata for mask reads. For a four-band RGBA dataset with shadow nodata, `dataset_mask()` instead uses band 4. `read_masks()` gives per-band masks. `dataset_mask()` is dataset-wide; when nodata drives it, its OR of band masks means some band is valid, not that all bands are valid. Use that mask only when its meaning fits the product. [S2]

For nearest-neighbor classes, sampling validity at the same source location is one candidate output policy. “Any contributor valid” and “all contributors valid” are separate policies and can yield different edges. The mask guide documents source masks, not downsampled-mask semantics or how every Rasterio operation propagates nodata and masks. The selected Rasterio 1.3.10 operation’s behavior remains unverified; do not present a candidate policy as library behavior. [S2]

For a same-CRS resize from `(H, W)` to `(h, w)`, scale the existing transform by `(W/w, H/h)`, as in Rasterio’s `out_shape` example. This preserves the existing footprint and origin while changing pixel vectors. Verify dimensions and transformed outer pixel corners, including rotation encoded in the affine transform. If required bounds or alignment differ, specify destination transform and shape together. A CRS change requires a reprojection workflow and defined destination grid; the resize formula alone is insufficient. [S1, S3]

Keep continuous bands separate and optional. For genuinely continuous data, bilinear or cubic may be better suited than nearest; average may help when retaining particular numerical properties is the goal. Choose per band and task, independently of the categorical policy. [S1]

## Critique disposition

1. **Amend:** nearest-neighbor is conditional on sampled-class intent; dominant-class aggregation and tie handling need a separate rule.
2. **Amend; unresolved inputs:** bind mapping and valid codes, separate validity, and resolve any sentinel collision. The schema and collision status were not provided.
3. **Accept:** mask polarity and precedence are supported, with the `dataset_mask()` OR condition and its dataset-wide meaning stated above.
4. **Amend; unresolved policy/behavior:** same-location validity sampling remains a candidate; distinguish any/all contributors and verify the selected operation.
5. **Accept with condition:** the transform scale applies to a same-CRS resize of the existing footprint. Specify another destination grid for different bounds/alignment; reproject for CRS changes.
6. **Accept:** retain qualified, per-band continuous-data advice as optional and separate.
7. **Amend:** proposed verification covers valid output codes, chosen validity semantics and mask polarity, selected operation nodata/mask behavior, output shape and corners/footprint, and continuous output.

## Checks and limits

Proposed, not performed: on representative data, check valid categorical outputs against the allowed code set; check the chosen validity rule and polarity at external-mask regions, per-band disagreements, edges, and partially or wholly invalid neighborhoods; test the selected Rasterio 1.3.10 operation’s nodata/mask behavior; verify output dimensions and corners against the intended footprint; inspect continuous output separately. No raster data were processed and no Rasterio runtime tests were run.

Only the three mapped frozen documentation captures were reviewed. No released implementation files, extra sources, or raster data were inspected. The target grid, class mapping, nodata collision status, mask provenance, and intended output-validity rule remain unknown, so this is a conditional recommendation rather than a dataset-specific configuration.

### Sources

- **[S1]** Rasterio 1.3.10, “Resampling,” capture 2026-10-07: https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst — SHA-256 `2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727`.
- **[S2]** Rasterio 1.3.10, “Nodata Masks,” capture 2026-10-07: https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst — SHA-256 `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9`.
- **[S3]** GDAL 3.9.0, “Geotransform Tutorial,” capture 2026-10-07: https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst — SHA-256 `5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc`.

### Run record

Timing basis: mapped T0 2026-10-07T20:57:14.367Z; this stage’s T3 `requestedAt` 2026-10-07T21:07:52.603Z; 24-minute stage cutoff 2026-10-07T21:31:52.603Z; common absolute deadline 2026-10-07T21:37:14.367Z. Read the mapped input map and its eight listed paths (brief, source manifest, boundary, draft, critique, and three captures); no additional primary-source checks. The eight listed files totaled 28,947 bytes. The three capture hashes matched the map/manifest values. No runtime tests were run. Billing, input/cache/generated-token values are unknown; native Goal cumulative counters are reported separately.
Artifact generation/check finished at: 2026-10-07 21:13:19 UTC.
Output artifacts: rewrite.md 6283 bytes; final.md 6638 bytes.
