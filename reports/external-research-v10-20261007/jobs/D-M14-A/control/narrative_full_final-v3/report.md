# Raster class downsampling and valid-area decision — evidence report

Job: `D-M14-A/control/narrative_full_final-v3`  
Scope: one bounded Rasterio 1.3.10 decision module. The recommendation is conditional because the sources do not define the product meaning of a coarse class label or “valid area.” Final decision items link to these evidence records and the source register.

<a id="e1"></a>

## E1 — Choose by label semantics; do not install a universal resampler

Expose an explicit class policy. Use **nearest** when each output cell is intended to report the class of one representative source sample; the result remains a sampled input ID and small classes may disappear. Use **valid-only majority** when the output is intended to represent the most frequent class across a target footprint; ignore invalid source cells, define ties deterministically, and make any minimum-coverage threshold explicit. This can suppress minority classes. If neither meaning is specified, require the caller to choose rather than silently selecting a universal rule.

Rasterio’s resampling guide says every method involves interpolation and there is no generally “correct” choice. Its 1.3.10 enum defines `nearest` as the default and `mode` as the most frequent sampled value; the implementation accepts `mode` in reads. These descriptions support the two bounded policies but do not choose one for class IDs, prescribe tie behavior for `read()`, or promise preservation of rare classes. Treat the two outputs as different product semantics, not quality levels. [S2, S3, S4]

<a id="e2"></a>

## E2 — Carry validity separately from class values

Keep three concepts separate: class IDs, nodata metadata, and a validity mask. `read_masks(band)` is a GDAL-style per-band mask: zero is invalid and nonzero (typically 255) is valid. A NumPy masked-array mask has the opposite sense (`True` means invalid). The documented `dataset_mask()` priority is: `.msk`, dataset-wide alpha, or internal mask; then band 4 for four-band RGBA with shadow nodata; then OR of band masks when nodata exists; otherwise all-valid. The nodata OR means any-band-valid, not “all required bands valid.” Rasterio’s example also shows that 8-bit values equal to declared nodata can still be legitimate data, so a value comparison is not a substitute for the chosen mask. [S1]

For the class band, make the validity source explicit: normally its `read_masks(class_band)`; choose a dataset-wide or all-required-bands mask only if that matches the product definition. Do not reapply `value != src.nodata` over an authoritative external mask: Rasterio documents that a `.msk` can override nodata metadata without changing the stored values. If that mask is present, its declared validity can make a value equal to the metadata nodata value valid.

Release implementation detail: `read(masked=True, resampling=...)` first resamples the values, then reads/resamples the masks separately and applies the resulting mask. The value I/O call does not receive an explicit source validity-mask argument. Therefore the masked result should not be assumed to mean that nodata samples were excluded from a `mode` vote before the output mask was applied. This is an inference from the 1.3.10 call path; validate it against the pinned GDAL runtime. For valid-only majority, read source values and masks at native resolution and filter votes explicitly. For nearest, read the class band and its mask with the same nearest sampling policy. [S4]

<a id="e3"></a>

## E3 — Derive valid area from the validity plane, not the chosen class

Compute coverage independently of the categorical output. For aligned integer-factor downsampling on a same-area grid, count source cells with `mask > 0` in each target footprint; report `coverage_fraction = valid_count / source_cell_count`. Compute total valid area as the sum of valid source-cell areas, or as `coverage_fraction × target_cell_area` when the footprints and cell areas align. A nearest class sample or a modal class is not itself an area estimate. Keep a no-valid-contributor output invalid; if partial cells need a cutoff, expose the cutoff as product policy.

GDAL’s geotransform defines the affine mapping. Its linear part has planar cell area `abs(GT(1)*GT(5) - GT(2)*GT(4))` in squared coordinate units; this is a derived determinant, not a geodesic-area guarantee. Use it as physical ground area only under an appropriate area model (for example, a suitable equal-area projected grid). For geographic coordinates, non-equal-area projections, or nonaligned/reprojected footprints, calculate geodesic or actual overlap-weighted areas; if the CRS/area model is unknown, report coverage or grid units rather than claiming physical area. [S6]

<a id="e4"></a>

## E4 — Optional continuous-band path and source limits

Keep a continuous-band lead separate from class processing: `average` may suit a mean-like summary; bilinear or cubic may suit a smooth interpolated surface. Do not apply those continuous interpolation choices to class IDs. The pinned guide says these methods have different numerical behavior but does not establish a universally best method for a particular band. The sources also do not define the product’s validity scope, a class tie rule, a partial-coverage threshold, or physical-area model. Those are open product choices, not facts to infer from the library. [S2, S3]

For large inputs, native-resolution validity and vote accumulation can be blockwise. Rasterio windows can bound application memory, but reads operate on whole storage blocks; block layouts can differ among bands, and unchunked inputs may require reading the full dataset even for a tiny window. Verify block compatibility before sharing windows. This is an I/O option, not a change in the decision semantics. [S5]

<a id="e5"></a>

## E5 — Proposed validation and remaining product choices

**Proposed, not executed:** (1) use a tiny fixture with class ID 0, a separate nodata sentinel, a conflicting external `.msk`, and per-band masks; verify mask precedence, `read_masks`, `dataset_mask`, and the inverse masked-array convention. (2) Compare nearest and valid-only majority against hand-computed 2×2/4×4 footprints, including a tie, rare class, partial coverage, and all-invalid footprint; verify the configured tie/coverage rules and that invalid values never win. (3) For aligned equal-area grids, compare coverage and valid area with exact source-cell counts; include a rotated affine transform and a geographic-grid case to prove the area branch is not silently planar. (4) Compare blockwise and in-memory results and record the exact Rasterio/GDAL runtime; specifically probe `read(masked=True, resampling=mode)` with invalid sentinels and external masks.

Open choices: point-sample versus majority meaning; deterministic tie rule; minimum valid coverage; class-band versus dataset-wide/all-required-band validity; whether summaries are per target cell, aggregate, or per class; CRS/physical-area method and output units; and any class nodata/sentinel encoding. The continuous-band method is likewise caller-selected.

<a id="e6"></a>

## E6 — Source register and executed checks

Source IDs used in `final.md` refer to these captures. Frozen inputs are linked by their exact source URLs; their bytes remain at the mapped case paths.

- **S1 — Rasterio masks, 1.3.10.** [Source page](https://rasterio.readthedocs.io/en/1.3.10/topics/masks.html); raw capture URL: https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst. Capture: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst`; SHA-256 `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9` (9,114 bytes). Locators: “Reading dataset masks,” “Numpy masked arrays,” “Dataset masks,” “Nodata representations in raster files.” Limit: API and examples illustrate precedence and mask sense, not a domain-specific validity policy.
- **S2 — Rasterio resampling, 1.3.10.** [Source page](https://rasterio.readthedocs.io/en/1.3.10/topics/resampling.html); raw URL: https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst. Capture: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst`; SHA-256 `2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727` (2,267 bytes). Locators: “Up and downsampling,” “Resampling Methods.” Limit: general resampling guidance; no categorical policy.
- **S3 — Rasterio `enums.py`, 1.3.10 tag.** [Tagged source](https://github.com/rasterio/rasterio/blob/1.3.10/rasterio/enums.py); exact capture: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M14-A/control/narrative_full_final-v3/sources/rasterio-1.3.10-enums.py`; captured 2026-10-07; SHA-256 `4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b` (5,550 bytes). Locator: lines 48–100. Limit: enum definitions, not tie/mask semantics.
- **S4 — Rasterio `_io.pyx`, 1.3.10 tag.** [Tagged source](https://github.com/rasterio/rasterio/blob/1.3.10/rasterio/_io.pyx); exact capture: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M14-A/control/narrative_full_final-v3/sources/rasterio-1.3.10-_io.pyx`; captured 2026-10-07; SHA-256 `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190` (86,415 bytes). Locators: lines 57–68, 438–485, 633–662, 742–780, 984–1076. Limit: Rasterio release call path; the underlying GDAL runtime/kernel is separately versioned.
- **S5 — Rasterio windowed I/O, 1.3.10.** [Source page](https://rasterio.readthedocs.io/en/1.3.10/topics/windowed-rw.html); raw URL: https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst. Capture: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterwindow.rst`; SHA-256 `4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1` (8,035 bytes). Locators: “Reading,” “Blocks.” Limit: storage/I/O behavior, not output correctness.
- **S6 — GDAL geotransform tutorial, 3.9.0.** [Source page](https://gdal.org/en/3.9/tutorials/geotransforms_tut.html); raw URL: https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst. Capture: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/geotransform.rst`; SHA-256 `5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc` (1,713 bytes). Locators: affine equations and north-up coefficients. Limit: coordinate mapping, not CRS units or physical/geodesic area.

**Executed:** SHA-256 of all four frozen source files matched the mapped manifest; the two tagged Rasterio source captures were stored and hashed as listed. No raster algorithm, downloaded code, installer, or proposed validation fixture was executed. The recommendation is source-based and still requires the proposed runtime checks.
