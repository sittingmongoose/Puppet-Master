# Valid-pixel policy for the three-band land-cover summary

## Recommendation

Use the three band masks and accept a pixel for a summary that consumes all three band values only when each mask marks it valid:

`valid = np.all(src.read_masks([1, 2, 3]) != 0, axis=0)`

Rasterio 1.3.10 returns one mask per selected band; nonzero means valid. Its 2D `dataset_mask()` is a different policy. When no recognized dataset-wide mask applies and nodata is present, Rasterio computes it as the binary OR of band masks, so a pixel with just one valid band can pass. Use that dataset mask only if the product deliberately defines validity as “at least one band valid” or selects a common dataset mask as its policy. The brief does not specify whether partial-band pixels can contribute; strict intersection is therefore a conditional recommendation, not a settled product requirement.

## Findings and claim dispositions

1. **Accepted, scope tightened — band versus dataset masks.** `read_masks([1, 2, 3])` gives a 3D per-band result; `dataset_mask()` gives one 2D result. In the nodata-derived path, the 1.3.10 guide and implementation use OR. Precedence matters: a recognized per-dataset mask (including a recognized .msk), then the four-band alpha case, then nodata-derived OR, then all-valid if no nodata applies. These rules describe Rasterio 1.3.10, not whether a supplied tile’s mask is appropriate. [R1, “Dataset masks”; R2, `dataset_mask` implementation]

2. **Accepted — polarity.** GDAL-style mask zero means invalid and nonzero (usually 255) means valid. A NumPy masked-array mask has the inverse sense: `True` means invalid. Rasterio documents `(~masked.mask * 255) == read_masks(band)`; the proposed predicate tests mask values as nonzero. [R1, “Nodata Masks” and “Numpy masked arrays”; R2, masked-read implementation]

3. **Accepted with recognition condition — .msk and nodata.** When Rasterio recognizes an external .msk as the per-dataset mask, it uses that mask instead of nodata-derived masks; samples and nodata metadata are not thereby changed. Filesystem presence alone does not establish that the sidecar is recognized, aligned, authoritative, or semantically correct for a particular tile. Confirm flags, dimensions, and provenance before relying on it. [R1, “Writing masks” and “Dataset masks”; R2, `dataset_mask` and `write_mask`]

4. **Amended — 8-bit ambiguity.** If zero is declared nodata and the returned mask is nodata-derived, zero-valued samples are masked even though some may have rounded to zero from valid source values during scaling. Thus “use the mask” faithfully applies encoded nodata policy but cannot recover such valid zeros by itself. Do not add a second value-equals-zero heuristic or sieve without product and source evidence. A trusted explicit mask or upstream correction is needed to distinguish the cases; values alone cannot. [R1, 8-bit example and discussion of masks]

5. **Conditional candidate; product decision unresolved — multiband policy.** Choose strict intersection if the classifier/statistic requires all three band observations. If partial-band observations are allowed, the product owner must specify how those pixels contribute and select a matching policy. The supplied brief leaves this semantic choice open. Do not equate nodata-derived dataset-mask OR with complete three-band validity.

6. **Rejected and unresolved — overbroad claims.** Reject “zero is always invalid” and “dataset_mask necessarily means all bands are valid.” Also reject the predecessor’s categorical reading that the brief disallows partial-band policies; the brief does not say. Unresolved tile facts include each band’s nodata values and mask flags, recognized mask/alpha path, .msk content and provenance, grid alignment, and the product’s treatment of partial observations.

## Checks

**Executed witnesses:** read the supplied brief, manifest, source captures, predecessor draft, and critique; compared SHA-256 for both source captures and both predecessor artifacts with the supplied identities. All four matched. No raster was opened, no Rasterio/GDAL code or fixture was executed, and no behavior was independently run.

**Proposed, not executed:**

- Build a three-band nodata-only fixture where one pixel is valid in one band and invalid in two. Compare all three `read_masks`, `dataset_mask()`, and the strict intersection; this distinguishes OR from all-band validity.
- Separately, use nodata zero with a recognized common .msk marking a zero-valued cell valid; compare returned masks with the equivalent fixture lacking that sidecar. This tests sidecar precedence while keeping sample values and nodata metadata fixed.
- In another fixture, create differing per-band nodata-derived masks without a common explicit mask, then compare `read_masks`, `dataset_mask()`, and `read(masked=True)` polarity. Do not combine this with a claim that `write_mask()` creates independent per-band masks: Rasterio documents `write_mask()` as applying to all dataset bands.

Before interpreting actual tiles, inspect their nodata values, `mask_flag_enums`, recognized alpha/per-dataset mask path, sidecar presence/content/provenance and dimensions. Record product approval of the partial-band rule. These are proposed checks; none has been run on a raster.

## Sources and limits

- **R1 — Rasterio 1.3.10 mask guide**, frozen public primary capture dated 2026-10-07; SHA-256 `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9`. [Captured release source](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst)
- **R2 — Rasterio 1.3.10 `rasterio/_io.pyx`**, frozen public primary capture dated 2026-10-07; SHA-256 `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190`. [Captured release implementation](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx)

The hashes match the supplied source manifest. Behavioral claims are limited to those 1.3.10 captures. Actual tile metadata, mask correctness, and product semantics remain unverified.
