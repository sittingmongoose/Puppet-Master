# D-M02-B — bounded Q1/Q2 recommendation

For an ordinary pixel-aligned, in-bounds crop, use an integer `Window(col_off, row_off, width, height)`, read that window, and carry `src.window_transform(window)` with the returned pixels. If writing a cropped raster, set its dimensions to the array shape and its transform to this crop transform. A smaller `out_shape` resamples the crop: scale the crop transform by the input/output width and height ratios so the resampled grid covers the same crop extent. [W, R]

```python
win = Window(col_off, row_off, width, height)
crop = src.read(window=win)
t_crop = src.window_transform(win)

out = src.read(
    window=win,
    out_shape=(src.count, out_h, out_w),
    resampling=method,
)
t_out = t_crop * Affine.scale(
    win.width / out.shape[-1], win.height / out.shape[-2]
)
```

## Obligations and conditions

1. **Q1 — window and transform (accepted).** Windows express pixel offsets and sizes. Pair the returned crop with its window transform; do not reuse the full-tile transform. This also works with a rotated/skewed affine because the full affine is translated. Keep the ordinary case integer and in bounds. If clipping or fractional windows are permitted, determine the effective read window first and test it against the transform; do not rely on fractional-length rounding. [W, G, T, I]
2. **Q2 — smaller shape (accepted with condition).** Reading to another shape is resampling, even without a CRS change. Scale the crop transform by `window.width/out_width` and `window.height/out_height` (using actual returned dimensions). This keeps the crop’s outer extent while changing cell size. Set any output raster’s dimensions and transform to the new array and transform. [R, I]
3. **Logical pixels versus physical I/O.** A 1×1 logical request can read a full block; an unchunked source can require the whole dataset. The 1024×1024 tile size alone does not reveal block shape or bytes read. Inspect `block_shapes` for every band and `block_windows` on the actual file; estimate physical cost only with appropriate driver/storage instrumentation. [W]
4. **Coordinates.** Cropping shifts the affine origin by the window offset while retaining its pixel vectors. Resampling scales those vectors to cover the crop extent. GDAL defines pixel/line (0,0) at the upper-left pixel corner and (0.5,0.5) at its center, so compare world coordinates at corners and centers when validating. [W, G]
5. **Categorical versus continuous.** For class codes, nearest is the conservative choice when one sampled source label should be retained. Rasterio 1.3.10 also exposes `mode`, described as selecting the most frequent sampled value; keep it optional for an explicitly majority-based product, and define/test ties and NoData first. For continuous data, bilinear or cubic are interpolation candidates; average is a downsampling candidate when a mean-like statistic is intended. No method is universally correct. Data semantics, NoData rules, and acceptance criteria are not supplied, so no production method can be selected here. [R, E]
6. **Fixtures and unknowns.** Proposed checks—not executed: (a) a known-value raster with nonzero integer crop offsets and a rotated/skewed affine; compare crop and smaller-output corner/center coordinates to the source crop extent; (b) continuous and class-ID fixtures, including a rare class, ties, and NoData, checked against predeclared numeric and class-retention rules; (c) tiled and striped files with aligned, crossing, and 1×1 windows, inspecting every band’s block shapes and measuring physical I/O only if instrumentation supports it. Unknowns are actual block layout, class labels and meaning, NoData behavior, target dimensions, and acceptable error.

## Claim dispositions

- **Accepted:** windowed crop plus its window transform; output-shape change plus a proportionally scaled crop transform.
- **Amended:** `mode` is a conditional majority-aggregation option, not a default for all categorical data; small logical windows do not imply proportionally small physical reads.
- **Rejected:** Q2’s predecessor statement that the natural shape for fractional window lengths is rounded up. The tagged 1.3.10 read path calls `round_lengths()`, whose implementation is `floor(x + 0.5)` (nearest with half-up behavior); its nearby “round up” comment is inconsistent. Use integer windows in the recommended path. Also reject copying the full-tile transform unchanged to either output.
- **Unresolved:** actual I/O cost and the best resampler without block metadata, data semantics, NoData/tie rules, and target acceptance criteria.

## Sources and witnesses

Frozen inputs, all public primary raw bytes captured 2026-10-07 and hash-checked against `sources.json`: [W — Rasterio 1.3.10 windowed reads](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst), SHA-256 `4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1`; [R — Rasterio 1.3.10 resampling](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst), `2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727`; [G — GDAL 3.9.0 geotransforms](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst), `5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc`. Additional tagged Rasterio 1.3.10 raw captures [I — `_io.pyx`](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx), `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190`; [T — `windows.py`](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/windows.py), `91659f9becc7a61cf29109f29d2388507c5df916c88ecccc5462d3864c6518d3`; [E — `enums.py`](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py), `4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b`. Capture details and limits are in `sources/manifest.json`.

**Executed witnesses:** hashes of all three frozen source files and both predecessor reports matched the supplied manifest/map; hashes of the three additional source captures were recorded. Only source text was inspected; no raster fixture, project code, or pixel-level test was executed. The proposed checks above remain proposals.
