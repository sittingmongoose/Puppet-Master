# Valid-pixel policy for the three-band land-cover tile

## Recommendation

Treat a pixel as usable only if every band required by the land-cover computation is valid. If all three bands are required, compute `valid = np.logical_and.reduce(src.read_masks([1, 2, 3]) != 0)`. This is a recommended product rule, not a Rasterio default. If the algorithm can use missing bands, the product owner must define that policy explicitly.

Rasterio’s band masks use GDAL polarity: zero is invalid and nonzero (usually 255) is valid. NumPy masked-array masks use the inverse convention: True means invalid. Do not invert `read_masks()` when applying the predicate. [1, lines 7–15, 67–70, 203–216; 2, lines 472–476]

## Material findings and obligation dispositions

1. **Band masks vs dataset mask — accepted, with condition.** `read_masks()` supplies per-band masks. When no higher-precedence dataset-wide mask is used and nodata metadata applies, `dataset_mask()` combines band masks by OR, so it can accept a pixel where only one of three bands is valid. That does not meet an all-required-bands rule. A dataset-wide mask/alpha/internal mask takes precedence; with no nodata, the documented fallback is all valid (255). The four-band shadow-nodata branch does not describe the stated three-band input. [1, lines 219–236; 2, lines 1038–1076]

2. **Polarity and masked arrays — accepted.** Nonzero means valid in the GDAL-style mask; True means invalid in a NumPy masked-array mask. Rasterio documents `(~masked_read.mask * 255 == read_masks(band))`. [1, lines 7–15, 203–216; 2, lines 472–476]

3. **External `.msk` — accepted, conditional on sidecar use.** When a `.msk` sidecar exists, Rasterio says it ignores nodata metadata values and returns masks based on the sidecar; the dataset-mask precedence also selects it. Thus zero may be valid and nonzero invalid if that is what the sidecar marks. This says how Rasterio reads the mask, not whether a supplied sidecar is trustworthy. [1, lines 111–124, 219–236; 2, lines 1038–1051]

4. **8-bit ambiguity — accepted.** Valid low values may round to zero when higher-bit data are scaled to uint8. A zero nodata declaration can therefore misclassify valid observations; that does not make every zero valid or let pixel values alone recover intent. [1, lines 85–92]

5. **Product validity choice — amended and unresolved.** Recommend AND across the bands the computation actually requires. Use a dataset-wide mask only if its producer’s meaning matches “usable for this product.” The brief does not say whether the downstream algorithm tolerates missing bands. [1, lines 219–236; 2, lines 1038–1076]

6. **Supplied-tile uncertainty — unresolved.** No per-tile nodata value, mask flags, sidecar coverage/correctness, or algorithm band requirements were supplied. Inspect those before treating the recommendation as validated.

## Discriminating proposed fixtures (not executed)

- **Nodata fallback:** create a tiny three-band uint8 dataset with nodata=0 and no `.msk`. Include pixels with only band 1 nodata, all bands nodata, and all bands nonzero. Assert dataset-mask OR accepts the first while the all-required-bands AND rejects it; both reject the second and accept the third.
- **Sidecar precedence:** with nodata=0, add a `.msk` marking a zero-valued pixel valid and a nonzero-valued pixel invalid. Assert returned masks follow the sidecar. This distinguishes sidecar behavior from nodata fallback; it does not validate production sidecar quality.
- **Polarity:** assert `(~src.read(1, masked=True).mask * 255) == src.read_masks(1)` and that the product predicate interprets nonzero as valid.
- **No-nodata fallback:** with no nodata and no explicit mask, assert the documented dataset-mask result is all 255.

## Claim classification

- **Accepted:** mask polarity; sidecar precedence; low-value/8-bit ambiguity; per-band versus dataset-mask distinction.
- **Amended:** dataset-mask use is conditional on product semantics; recommend all-required-band AND when all three values are needed.
- **Rejected:** “zero is always invalid”; treating nodata as controlling when a `.msk` is used; treating nodata-fallback dataset-mask OR as an all-bands-valid test.
- **Unresolved:** actual tile metadata and sidecar quality, and whether the land-cover computation requires all three bands.

## Evidence and executed checks

I read the supplied brief, source manifest, predecessor draft, and the relevant sections of both supplied primary raw captures. SHA-256 checks completed: both captures match the frozen manifest. No raster code was executed, and no supplied tile was inspected. All fixtures above are proposals, not executed checks.

1. Rasterio 1.3.10, `docs/topics/masks.rst`, captured 2026-10-07; SHA-256 `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9`: [pinned source](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst).
2. Rasterio 1.3.10, `rasterio/_io.pyx`, captured 2026-10-07; SHA-256 `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190`: [pinned source](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx).

