# Categorical raster downsampling recommendation — rewrite

## Recommendation and conditions

Treat each band according to its meaning. For a categorical band, nearest-neighbor is a reasonable proposed baseline only when the product calls for one sampled source class per output cell. This is a policy choice, not a categorical rule guaranteed by Rasterio’s general resampling guidance. If the intended result is the dominant class over an output footprint, define the aggregation, treatment of invalid contributors, and tie rule separately. Do not average class IDs or infer class meaning from their numeric order. [S1]

Before resampling, bind the authoritative code-to-label mapping and the allowed valid class-code set. Keep class identity separate from validity. Nodata metadata, source masks, and the class schema must agree. If a nodata sentinel can also be a legitimate class value, the pixel value alone cannot distinguish the two; resolve this using authoritative metadata or a validity mask. The cited mask guide demonstrates that declared nodata can mask meaningful values. Neither it nor the resampling page guarantees that a selected operation will keep nodata out of the output class domain, so check that explicitly. The actual schema and sentinel status were not supplied. [S2]

Choose validity semantics per product and band. Rasterio/GDAL valid-data masks use nonzero for valid pixels; NumPy masked-array masks use `True` for invalid pixels. An existing `.msk`, dataset-wide alpha, or internal mask takes precedence over nodata metadata for mask reads; a four-band RGBA dataset with a shadow nodata value has a separate `dataset_mask()` precedence rule using band 4. `read_masks()` provides per-band masks. `dataset_mask()` is dataset-wide; when nodata drives it, it ORs band masks, so it means some band is valid, not that all bands are valid. Use it only if that meaning matches the product. [S2]

For nearest-neighbor classes, sampling validity at the same selected source location is one candidate output policy. Any-valid-contributor and all-contributors-valid are different policies and may produce different boundaries. The cited guide explains input mask representations and selection, not downsampled-mask semantics or the behavior of every Rasterio read/resampling operation. Select the policy explicitly; until the chosen Rasterio 1.3.10 operation is checked on representative inputs, describe its mask/nodata behavior as unknown rather than assumed. [S2]

For a same-CRS resize from source `(H, W)` to output `(h, w)`, scale the existing transform by `(W/w, H/h)` as in Rasterio’s `out_shape` example. This changes pixel vectors while preserving the existing grid footprint and origin. Check dimensions and transformed outer pixel corners; the affine terms also encode rotation. If required bounds, alignment, or footprint differ, define destination transform and shape together instead of assuming the resize formula meets them. A CRS change requires a reprojection workflow that defines a destination grid; the resize formula alone is insufficient. [S1, S3]

Keep continuous bands as a distinct optional lead: for genuinely continuous data, bilinear or cubic may suit the task better than nearest, and average may help when retaining particular numerical properties is the goal. Select the method per band and do not transfer it to categorical bands by default. [S1]

## Critique disposition and checks

1. **Amend** the nearest-neighbor recommendation: retain it only for the sampled-class intent; a dominant-class intent needs a separately specified aggregation and tie rule.
2. **Amend; unresolved inputs** for class codes and nodata: bind the mapping and valid-code set, keep validity separate, and resolve any sentinel collision from authoritative metadata or masks. Those inputs are unknown here.
3. **Accept** the mask-polarity and selection findings, with the `dataset_mask()` condition and distinction from an all-bands-valid rule stated above.
4. **Amend; unresolved policy/behavior** for output validity: make same-location sampling a candidate, distinguish any/all contributor policies, and check the selected operation rather than asserting library behavior.
5. **Accept with condition** the transform formula for same-CRS resizing of the existing footprint; use an explicit destination grid for other bounds/alignment and reproject for a CRS change.
6. **Accept** the separate, optional continuous-band advice, qualified by the numerical goal and per-band choice.
7. **Amend** the verification record: check valid output codes, chosen validity semantics and mask polarity, selected operation’s nodata/mask behavior, output shape and corners/footprint, and continuous output separately.

These checks are proposed and were not run: use representative categorical rasters to verify class-domain membership and the chosen validity rule, including external-mask areas, per-band disagreement, edges, and partially or wholly invalid neighborhoods; verify dimensions and transformed corners against the intended footprint; inspect continuous output under its selected method. No raster data were processed and no Rasterio runtime test was performed.

## Evidence and limits

- **[S1]** Rasterio 1.3.10, “Resampling,” capture 2026-10-07: https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst — SHA-256 `2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727`.
- **[S2]** Rasterio 1.3.10, “Nodata Masks,” capture 2026-10-07: https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst — SHA-256 `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9`.
- **[S3]** GDAL 3.9.0, “Geotransform Tutorial,” capture 2026-10-07: https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst — SHA-256 `5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc`.

Only the three mapped frozen documentation captures were reviewed; no released implementation files, additional sources, or raster data were inspected. The target grid, class mapping, sentinel collision status, mask provenance, and intended output-validity rule remain unknown. These conditions must be resolved for a dataset-specific implementation.
