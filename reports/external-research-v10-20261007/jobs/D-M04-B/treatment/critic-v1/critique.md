# D-M04-B treatment critic

## Dispositions

1. **Accepted, with conditions:** nearest-neighbor for categorical labels; average only when a downsampled cell is meant to represent a footprint statistic such as mean; bilinear for a smooth point-sampled surface. The frozen resampling guide offers these general distinctions, not a policy for this tile.
2. **Amended / unresolved:** keep modal resampling as an experiment only if the selected Rasterio/GDAL build exposes it and its tie rule is specified. The mapped captures do not establish mode support or tie behavior.
3. **Amended:** the mask semantics and nodata-collision warning are supported. Add that `read(masked=True)` reads/resamples values and then separately reads/resamples masks; the sources do not establish that invalid neighbors are excluded from value interpolation. Also, `write_mask` creates a per-dataset mask. It cannot be presumed to preserve distinct categorical/elevation masks.
4. **Rejected as an implicit guarantee:** a single masked-array/write-mask round trip is sufficient to preserve two independent band masks or to define valid-contributor interpolation. Require an output representation and algorithm that explicitly meet those policies.
5. **Accepted, conditional:** the scale-factor transform formula applies to a same-extent, same-CRS full-raster resize. Cropping and reprojection need their own target-grid derivation.
6. **Accepted:** tile-specific uncertainty and proposed fixtures are appropriate. Retain coverage fraction as an optional application-computed diagnostic, not a documented Rasterio feature. No tile was inspected and no proposed test was run.

## Critical additions

Require a per-band validity source and output representation; document any mask combination rather than silently using `dataset_mask()`. Define the elevation validity threshold and how valid contributors are normalized. Test that changing invalid sentinel values cannot change valid output values, and round-trip distinct masks through the chosen output driver. These are discriminating checks, not witnesses.

Sources and ranges are recorded in `sources.json`; no additional sources were needed.

