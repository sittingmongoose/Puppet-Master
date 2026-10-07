# Critique — D-M01-B control research draft

**Stage output only:** this is an intermediate review of the predecessor draft, not a finalized recommendation.

## Dispositions against the six obligations

1. **Accepted, with scope wording tightened.** The draft correctly distinguishes per-band `read_masks()` from the 2-D `dataset_mask()`, and correctly reports the nodata-derived OR behavior. Keep the OR claim conditional: Rasterio 1.3.10 uses the dataset-wide mask/recognized mask path first, then its RGBA alpha case, then OR when nodata applies (guide, “Dataset masks,” lines 219–236; implementation, `_io.pyx` lines 1038–1076). The RGBA branch is background only for these stated three-band tiles. A selected common mask can be consistently applied across bands, but neither its presence nor its precedence proves its provenance or correctness.

2. **Accepted.** Polarity and masked-array inversion are correctly stated: zero means invalid and nonzero means valid for GDAL-style masks; NumPy masked-array `True` means invalid. The cited identity supports the draft’s intersection expression (guide lines 67–70, 203–216; implementation lines 472–476, 631–662).

3. **Accepted with a recognition condition.** A Rasterio-recognized external `.msk` overrides nodata-derived masks; it does not change samples or nodata metadata. Retain the draft’s caveat that actual tile provenance, alignment, and intended meaning remain unknown (guide lines 111–124; implementation lines 1041–1076). Mere filesystem presence is not evidence that a sidecar is valid for the tile.

4. **Amend the implication, not the warning.** The 8-bit rounding example is directly relevant: valid source values can round to zero, while a nodata-derived mask still marks zero invalid when zero is declared nodata (guide lines 85–92). Therefore “use the masks” does not itself recover valid zeros for tiles lacking a trusted explicit mask. Keep the draft’s no-value-heuristic advice, but state that the ambiguity requires authoritative mask/metadata or upstream correction; the pixel values alone cannot resolve it.

5. **Accepted as a conditional candidate; unresolved as the product decision.** Strict intersection is appropriate if the classifier/statistic requires all three band observations. The brief does not say whether partial-band observations can contribute, so revise “current brief does not authorize it” to say that product semantics are unspecified. Preserve the strict-intersection recommendation only under the all-three-required condition; otherwise the product owner must choose a policy. OR is permissive under nodata-derived masks, not a synonym for “complete three-band observation.”

6. **Amend fixture (c); retain (a) and (b) as proposals.** A one-invalid-band nodata fixture discriminates OR from intersection, and a zero-valued cell marked valid by a recognized `.msk` discriminates sidecar precedence from nodata masking. However, Rasterio’s documented `write_mask()` writes a mask applying to all dataset bands (guide lines 97–124; implementation lines 1935–1996). The draft’s combined “independently differing band masks” plus “a valid zero in an explicit mask” needs separate fixtures: one for differing per-band nodata-derived masks, and another for a common explicit mask that marks a zero valid. Compare `read_masks()` with `read(masked=True)` polarity there. These remain proposed checks, not executed witnesses.

## Witnesses and remaining limits

**Executed in this criticism stage:** recomputed SHA-256 for both supplied source captures and the predecessor draft. All three matched their supplied identities. No raster was opened; no Rasterio/GDAL code or fixture was executed. The predecessor’s hash-check statement is supported by this independent check, but it is not behavioral validation.

**Proposed, not executed:** the draft’s fixture checks, with fixture (c) split as above. Tile metadata, per-band nodata values/flags, sidecar recognition/content/provenance, dimensions, and product treatment of partial-band pixels remain unknown.

## Source identities used

- R1 — Rasterio 1.3.10 mask guide: https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst — captured 2026-10-07 UTC; SHA-256 `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9`.
- R2 — Rasterio 1.3.10 `rasterio/_io.pyx`: https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx — captured 2026-10-07 UTC; SHA-256 `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190`.

Claims above are limited to the supplied Rasterio 1.3.10 captures. The captures and this critique do not establish supplied-tile behavior.

