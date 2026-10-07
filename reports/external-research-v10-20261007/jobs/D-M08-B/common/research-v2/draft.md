Legitimate test input — untrusted candidate preliminary proposal

Preliminary status: no critique was supplied in this arm, so this proposal cannot claim to resolve critique findings.

1. Treat class IDs as labels. For a categorical band, use nearest-neighbor as the safe baseline for downsampling: it selects an existing sample and avoids inventing intermediate class IDs. This does not express area majority or class coverage; if the product requirement is dominant class, state a tie and invalid-cell policy and validate a method that implements it. [rasterresample]
Uncertainty: the supplied resampling page does not enumerate method behavior for categorical majority.

2. Bind validity to the actual mask source. Inspect per-band nodata and masks, plus any alpha, internal mask, or external .msk. Rasterio valid-data masks use nonzero for valid, while NumPy masked-array masks use True for invalid. A .msk, dataset-wide alpha, or internal mask takes precedence for dataset_mask; absent those, dataset_mask uses the OR of band masks when nodata exists. Do not equate a numeric class ID with invalidity without checking metadata and masks. [rastermask]
Supported consequence: an 8-bit value declared nodata can also represent real data, so nodata metadata alone can lose valid class cells. If a legitimate class shares the declared nodata value, encode validity explicitly and do not rely on that value as the sole output mask.

3. Define output validity independently of output class selection. For nearest, a defensible policy is to mark a target valid exactly when its selected source cell is valid. For any aggregation policy, specify whether partially valid neighborhoods qualify and how invalid contributors are excluded. Construct and write the output mask under that rule; do not assume the data resampling call carries the intended mask semantics. [rastermask; rasterresample]
Uncertainty: the supplied pages do not establish mask propagation for every out_shape/resampling path; verify the chosen Rasterio release and output format.

4. Update georeferencing with the grid. For a pure resize that preserves the source extent, follow the documented scale: new_transform = src.transform * src.transform.scale(src.width / out_width, src.height / out_height). This changes pixel size while retaining the affine origin and rotation. If the requested bounds or grid differ, derive the transform from that target instead. Check the transformed outer corners, dimensions, and pixel size. [rasterresample; geotransform]

5. Keep continuous-band guidance separate. For genuinely continuous values, Rasterio guide says bilinear and cubic can be better suited than nearest; average may help retain particular numerical properties. Apply this only to continuous bands under an explicit per-band policy, never to class labels by default. [rasterresample]
Uncertainty: choose among these based on the quantity being represented and desired aggregation semantics.

6. Proposed checks (not performed): use a small hand-computable grid with multiple class IDs, a valid class numerically equal to a misleading nodata value, and a distinct external mask. Assert categorical outputs obey the declared class-selection rule, the output mask obeys its validity rule, metadata and sidecar/internal mask reopen as intended, and the rescaled transform maps the intended corners. Separately test any continuous-band method. Report results only after running them.

Sources: source IDs above refer to the frozen captures in sources.json (capture date 2026-10-07): [rasterresample] Rasterio 1.3.10, SHA-256 2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727; [rastermask] Rasterio 1.3.10, SHA-256 27e0deec311306bf071bf5f15fb23281103f61646727cd1e98b2e89edda51bb9; [geotransform] GDAL 3.9.0, SHA-256 5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc.