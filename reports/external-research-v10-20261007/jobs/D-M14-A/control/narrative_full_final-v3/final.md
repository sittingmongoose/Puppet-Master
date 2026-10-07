# Decision module: class downsampling and valid area

**Decision.** Require an explicit class-label policy and validity policy. Use nearest sampling for representative-source-pixel semantics; use a valid-only majority for footprint-majority semantics. Compute valid coverage and area independently from class IDs. The sources do not support one universal class resampler. Each item below links to its fuller evidence in [report.md](report.md) and the primary sources in its source register.

## M1 — Conditional class policy

- **Nearest:** choose when each coarse label should be the nearest source sample. It preserves a sampled input ID, but can omit small classes.
- **Valid-only majority:** choose when the intended label is the most frequent valid class in the footprint. Exclude invalid source cells before voting; define a deterministic tie rule and any minimum-coverage threshold explicitly. Majority can remove minority classes. If product semantics are unspecified, require a caller choice rather than silently choosing either rule.

Rasterio says there is no generally correct resampling method; its 1.3.10 enum defines nearest and mode but does not prescribe a class-label policy or read-time tie rule. See [E1](report.md#e1), [S2–S4](report.md#e6).

## M2 — Preserve class, nodata, and mask distinctions

Keep class IDs, nodata metadata, and validity as separate inputs. `read_masks(band)` uses zero for invalid and nonzero (usually 255) for valid; NumPy masked arrays invert that sense. Rasterio’s dataset-mask priority is `.msk`/dataset-wide alpha/internal mask; RGBA band 4 when it shadows nodata; OR of band masks when nodata exists; otherwise all-valid. The OR means any band valid and may differ from class-band validity or an all-required-bands rule. A `.msk` can override nodata metadata, and 8-bit nodata values can collide with legitimate data, so do not reapply `value == nodata` over an authoritative mask. Select per-band, dataset-wide, or all-band validity deliberately. [E2](report.md#e2), [S1, S4](report.md#e6).

Rasterio 1.3.10 reads/resamples values and masks separately, then applies the resampled mask. The value-resampling call receives no explicit source validity mask. Thus `read(masked=True, resampling=mode)` should not be assumed to exclude invalid sentinels from the mode vote. For majority, filter source-resolution values with the chosen mask before aggregation; for nearest, sample the class and its mask using the same nearest policy. The mode warning is an implementation-based inference to verify on the pinned GDAL runtime. [E2](report.md#e2), [S4](report.md#e6).

## M3 — Summarize valid area independently

From the selected native-resolution mask, count valid source cells per aligned target footprint and report `valid_fraction = valid_count / source_count`. For aligned equal-area cells, `valid_area = Σ(valid_fraction × target_cell_area)` (equivalently, valid source-cell count × source-cell area). Do not count a whole coarse cell as valid merely because its nearest or modal label is valid. Keep a no-valid-contributor result invalid; any partial-coverage cutoff is a product choice.

For an affine grid, planar cell area is the absolute determinant `|GT(1)·GT(5) − GT(2)·GT(4)|` in squared coordinate units. This is derived from GDAL’s geotransform, not a guarantee of physical ground area. Use an appropriate equal-area or geodesic method for physical area; for unaligned/reprojected footprints, weight actual overlaps. If CRS/area semantics are unknown, report coverage or grid units only. [E3](report.md#e3), [S1, S6](report.md#e6).

## M4 — Keep the continuous-band lead separate

For a continuous band only, consider `average` when a mean-like aggregate is wanted, or bilinear/cubic when a smooth interpolated surface is wanted. Do not apply those choices to class IDs. The sources describe method behavior but do not select a band-specific scientific meaning. [E4](report.md#e4), [S2, S3](report.md#e6).

## M5 — Validation to run before adoption

These checks are **proposed, not executed**: (1) a small fixture with valid class ID 0, a different nodata sentinel, conflicting `.msk`, and per-band masks; verify precedence, `read_masks`, `dataset_mask`, and masked-array inversion. (2) Hand-computed nearest and valid-only-majority footprints with ties, rare classes, partial coverage, and all-invalid cells; verify no invalid value wins. (3) Compare coverage/area with exact counts on aligned equal-area cells, then exercise rotated and geographic grids. (4) Compare blockwise and in-memory results and test the mode/nodata case on the exact Rasterio/GDAL runtime. Only source-hash checks were executed for this report. [E5](report.md#e5), [S1, S4–S6](report.md#e6).

## M6 — Product choices still open

Choose: point-sample versus majority semantics; tie behavior and minimum valid fraction; class-band versus dataset-wide/all-required-band validity; per-cell versus aggregate (or per-class) summary; physical-area model, CRS, and units; output invalid/sentinel encoding; and, if a continuous band is included, its statistic/interpolation method. Rasterio windows can bound memory, but process storage blocks carefully because block shapes can differ by band and small reads can still fetch whole blocks. [E5](report.md#e5), [S5](report.md#e6).
