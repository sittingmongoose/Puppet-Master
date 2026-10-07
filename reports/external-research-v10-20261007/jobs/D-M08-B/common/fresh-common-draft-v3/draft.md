# Legitimate test input — untrusted candidate preliminary proposal

**Question in scope (preserved):** “Finalize a common candidate-authored Rasterio 1.3.10 categorical downsampling draft using its common candidate-authored critique. Inputs have class IDs, nodata metadata, and sometimes external masks; output resolution and transform change. Preserve a supported optional continuous-band recommendation without conflating it with categorical processing.”

This is a fresh proposal for the bounded downsampling question, not a response to or finalization of a critique. I assume a same-CRS grid-size change unless noted.

1. **Keep categorical values categorical.** Use nearest-neighbor as the baseline for class-ID bands: it selects source values, whereas bilinear, cubic, or average can create values that are not class labels. This is an inference from Rasterio’s general resampling guidance, not a categorical guarantee stated in that page. If the goal is instead a dominant class over each output footprint, specify and validate that aggregation rule separately; the supplied sources do not settle it. [S1]

2. **Bind codes and nodata before resampling.** Preserve the authoritative class-code-to-label mapping and its codes; do not treat code magnitude as a continuous quantity. Keep nodata outside the valid class domain and ensure it cannot be emitted as a class. If a nodata sentinel also occurs as a legitimate class value, the pixel values alone are ambiguous; resolve that from authoritative metadata or a validity mask rather than guessing. [S2]

3. **Choose the mask and its polarity deliberately.** Rasterio’s GDAL-style masks use nonzero for valid pixels, while NumPy masked-array masks use True for invalid pixels. An external .msk, dataset-wide alpha, or internal mask can take precedence over nodata metadata. For multiband validity, choose per-band read_masks() or dataset_mask() according to the product meaning: when nodata drives dataset_mask(), its documented OR of band masks is not an all-bands-valid rule. [S2]

4. **Define output validity alongside the class sampling rule.** For nearest-neighbor classes, a candidate policy is to sample validity at the same source location and mark the output invalid when that location is invalid. If validity instead means “any valid contributor” or “all contributors valid” within an output footprint, state that policy explicitly; the provided pages do not prescribe downsampled-mask semantics. Check mask polarity and nodata behavior at boundaries and around external-mask regions. [S2]

5. **Derive the transform from the actual output shape.** For a same-CRS resize, if the source shape is (H, W) and the output is (h, w), scale the source transform by (W/w, H/h), as in Rasterio’s out_shape example. The affine coefficients encode origin, pixel vectors, and possible rotation; do not leave the old transform attached to the new dimensions. Verify output dimensions, corner coordinates, and intended footprint. If CRS also changes, this resize formula alone is insufficient: specify the destination grid through a reprojection workflow. [S1, S3]

6. **Keep the continuous-band lead separate and optional.** For genuinely continuous bands, Rasterio identifies bilinear and cubic as better suited than nearest; average may be useful when retaining particular numerical properties is the aim. Select that method per band and document it independently from the categorical rule, while aligning bands to the intended output grid. [S1]

7. **Checks proposed, not performed.** On representative data, verify that every valid categorical output is an allowed class code, invalid areas follow the chosen mask rule, and the output transform maps the intended pixel corners to the intended footprint. Separately inspect continuous-band values under its selected method. No data processing or tests were run for this proposal.

## Source references

- **[S1]** Rasterio 1.3.10, “Resampling” (capture 2026-10-07): https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst — SHA-256 2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727.
- **[S2]** Rasterio 1.3.10, “Nodata Masks” (capture 2026-10-07): https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst — SHA-256 27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9.
- **[S3]** GDAL 3.9.0, “Geotransform Tutorial” (capture 2026-10-07): https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst — SHA-256 5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc.

**Limitations:** This proposal relies on the supplied pinned documentation; no separate release implementation files or data were inspected. The target grid, class schema, nodata collision status, mask provenance, and intended footprint-validity rule were not provided, so those choices remain conditional.
