# D-M01-B — valid-pixel policy for a three-band land-cover tile

## Recommendation

For a summary or classifier that requires all three survey bands, define a pixel as usable only when every required band mask is nonzero: conceptually, `valid = logical_and.reduce(src.read_masks([1, 2, 3]) != 0)`. This keeps GDAL/Rasterio mask polarity explicit and avoids `dataset_mask()`'s nodata fallback, whose OR can admit a pixel with only one valid band. If the product deliberately accepts a pixel when any one band is valid, `dataset_mask()` may instead match that policy; the product owner must choose. Rasterio defines masks as valid where nonzero (typically 255), opposite to NumPy masked-array masks where True means invalid. [1, lines 7–15, 67–70, 203–216; 2, lines 472–476, 1027–1051]

## Material findings and obligation dispositions

1. **Band masks vs dataset mask — accepted, with scope.** `read_masks()` exposes one GDAL-style mask per band. For a three-band source with nodata and no higher-precedence dataset mask, `dataset_mask()` combines band masks with binary OR (valid if any band is valid); this differs from the all-bands-required AND above. A dataset-wide mask/alpha/internal mask takes precedence, and a four-band RGBA shadow-nodata case has a separate band-4 rule. The latter is not the stated three-band input. [1, lines 46–70, 219–236; 2, lines 1038–1076]

2. **Polarity and masked arrays — accepted.** In GDAL-style masks, 0 means invalid and any nonzero value means valid. In a NumPy masked array, True marks invalid. The release docs give the identity `(~masked_read.mask * 255 == read_masks(band))`; do not invert the GDAL mask when applying the recommendation above. [1, lines 7–15, 203–216; 2, lines 472–476, 631–673]

3. **External `.msk` — accepted, conditional on file presence.** When a sidecar `.msk` exists, Rasterio says it ignores nodata metadata values and returns masks based on that file; its dataset-mask precedence also puts `.msk` first. Therefore a valid zero can survive if the sidecar marks it valid, and a nonzero value can be invalid if the sidecar marks it invalid. Do not assume the nodata value alone controls validity on those tiles. [1, lines 111–124, 219–236; 2, lines 1038–1051]

4. **8-bit zero ambiguity — accepted.** The 1.3.10 guide warns that valid low values can round to zero when higher-bit data are scaled to uint8; a nodata declaration of zero can then misclassify real observations. This supports “zero is not inherently invalid,” not “every zero is valid.” A nodata-derived mask cannot recover intent from pixel values alone. [1, lines 85–92]

5. **Product validity choice — unresolved product policy, recommended default.** If land-cover computation requires all three band values, use the AND of the masks for the bands actually consumed. If it can operate with missing bands, define and test that domain rule separately; OR/dataset-mask semantics would otherwise overstate completeness. A trusted dataset-wide mask can be used as the product mask only if its producer's semantics mean “usable for this three-band product.” Rasterio documents precedence and combination rules, not the supplied mask's quality or the classifier's missing-band tolerance. [1, lines 219–236; 2, lines 1038–1076]

6. **Supplied tile uncertainty — unresolved.** The brief establishes three-band uint8 data, nodata metadata, and that some tiles have `.msk`; it does not establish each tile's nodata value, sidecar coverage/correctness, mask flags, or whether all three bands are required by the downstream algorithm. Inspect those per tile before treating the recommendation as validated.

## Discriminating proposed fixtures (not executed)

- **Nodata fallback:** a tiny three-band uint8 dataset with nodata=0 and no `.msk`; include one pixel where only band 1 is nodata, one where all are nodata, and one where all are nonzero. Assert that `dataset_mask()` is valid at the one-band-valid pixel (OR), while the product AND rejects it; both reject the all-nodata pixel and accept the all-valid pixel.
- **Sidecar precedence and zero ambiguity:** keep nodata=0, add a `.msk` marking a zero-valued pixel 255 and a nonzero-valued pixel 0. Assert Rasterio masks follow the sidecar for those locations, rather than nodata-derived values. This distinguishes precedence from an absent-sidecar case; it does not establish the sidecar is authoritative in production.
- **Polarity contract:** on the fixture, compare `(~src.read(1, masked=True).mask * 255)` with `src.read_masks(1)`; assert equality, and assert the product predicate uses nonzero as valid.
- **Metadata-free fallback:** with no nodata and no explicit mask, assert the documented all-valid dataset-mask fallback. This guards against assuming all sources have nodata-derived invalid pixels.

## Evidence and executed checks

No raster code or downloaded project code was executed, and no supplied tile was inspected. I read the two supplied raw captures and computed their SHA-256 values; both match the frozen manifest. All fixtures above are proposed, not executed.

1. Rasterio 1.3.10, `docs/topics/masks.rst`, capture date 2026-10-07, SHA-256 `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9`: [pinned raw source](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst).
2. Rasterio 1.3.10, `rasterio/_io.pyx`, capture date 2026-10-07, SHA-256 `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190`: [pinned raw source](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx).

## Claim classification

- **Accepted:** mask polarity/inversion; sidecar precedence; 8-bit low-value ambiguity; per-band versus dataset-level distinction.
- **Amended:** “use a dataset mask” is narrowed to the product's validity rule; `dataset_mask()` is not generally equivalent to “all three bands valid.”
- **Rejected:** “zero is always invalid”; treating nodata metadata as controlling when a `.msk` is present; treating nodata-fallback `dataset_mask()` OR as an all-bands-valid test.
- **Unresolved:** actual sidecar/nodata quality for each tile and whether downstream land-cover logic requires all three bands.

