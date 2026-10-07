# Preliminary research proposal — D-M01-B (control)

**Recommendation.** For a three-band land-cover summary that needs a complete three-band observation, define a pixel as usable only when all three Rasterio band masks mark it valid. Read the masks for bands 1–3 and intersect their nonzero cells. Do not infer validity directly from pixel value zero. Do not use `dataset_mask()` as the summary filter unless the product explicitly intends “any band valid” or the dataset-wide mask is the chosen common policy.

## Findings and dispositions

1. **Accepted — band masks and dataset mask answer different questions.** `read_masks([1, 2, 3])` returns a 3D set of per-band masks. `dataset_mask()` returns one 2D mask. For the three-band nodata case without a dataset-wide mask, Rasterio 1.3.10 computes that mask by binary OR across band masks: a pixel can therefore pass the dataset mask when only one band is valid. The precedence is a `.msk`/dataset-wide alpha/internal mask first, then a shadowed RGBA alpha case, then nodata-mask OR, then all-valid if there is no nodata. [R1, lines 219–236; R2, lines 984–1076]

2. **Accepted — polarity.** GDAL-style mask bytes use zero for invalid and nonzero (typically 255) for valid. NumPy masked-array masks have the inverse meaning: `True` means invalid. The documented identity is `(~masked.mask * 255) == read_masks(band)`. Thus an intersection can be expressed as `np.all(masks != 0, axis=0)`. [R1, lines 7–15, 67–70, 203–216]

3. **Accepted, conditional on sidecar integrity — external `.msk` precedence.** When a sidecar `.msk` exists, Rasterio says it ignores nodata metadata values and returns masks based on the sidecar. This is the relevant Rasterio behavior for affected tiles; it does not establish that a supplied sidecar has correct provenance, extent, or intended semantics. [R1, lines 111–124; R2, lines 1038–1062]

4. **Amended — “zero is invalid” is not a safe general rule.** If zero is declared nodata and no overriding mask exists, zero-valued cells are treated as invalid by nodata-derived masks. But the 1.3.10 mask guide documents valid 8-bit values rounded to zero during scaling and band masks that differ for this reason. Preserve mask metadata as the validity signal; do not add a second value-equals-zero filter or “repair” small regions without product evidence. [R1, lines 85–92, 141–183]

5. **Product choice — strict intersection.** For a statistic whose land-cover classification uses all three band values, accept a cell only if every selected band mask is nonzero. This avoids the permissive OR behavior of the nodata-derived `dataset_mask()`. If product semantics instead allow classification from partial-band observations, that is a separate explicit policy decision; current brief does not authorize it. [R1, lines 152–160, 222–236; R2, lines 742–753, 1045–1076]

6. **Rejected and unresolved.** Reject both “all zero-valued pixels are invalid” and “the dataset mask necessarily means all bands are valid.” Unresolved: the brief gives no per-tile nodata values, mask flags, sidecar inventory/content, mask provenance, or evidence that masks match tile dimensions. Inspect those metadata and confirm sidecar availability before interpreting any result; do not silently replace the recommended intersection with a heuristic.

## Discriminating checks

**Executed:** read the supplied frozen captures and verified their SHA-256 values match the supplied manifest. No raster was opened, no project code was run, and no fixture was executed.

**Proposed:** (a) create a three-band fixture with two valid band masks and one invalid; assert `dataset_mask()` is true under nodata OR while the all-band intersection is false; (b) set nodata to zero, then use an external `.msk` that marks a zero-valued cell valid and verify Rasterio’s returned masks follow the sidecar; compare with the same fixture without that sidecar; (c) include independently differing band masks and a valid zero in an explicit mask, then compare `read_masks`, the intersection, and `read(masked=True).mask` polarity. Record actual tile metadata and sidecar provenance before generalizing these fixture results.

## Source identities

- **R1 — Rasterio 1.3.10 mask guide**, supplied raw capture; read completed by the 2026-10-07 18:54:54 UTC clock observation; SHA-256 `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9`. <https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst>
- **R2 — Rasterio 1.3.10 `rasterio/_io.pyx`**, supplied raw capture; relevant implementation lines read by the 2026-10-07 18:55:08 UTC clock observation; SHA-256 `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190`. <https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx>

The file hashes were compared to the exact supplied manifest. Sources are capture-pinned to release 1.3.10; claims about method behavior are limited to that release’s guide and implementation. Tile-specific correctness remains unverified.
