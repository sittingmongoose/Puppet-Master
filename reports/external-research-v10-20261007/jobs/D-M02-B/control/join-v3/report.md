# Research report — D-M02-B control join

## Scope and recommendation

The brief asks for a bounded Rasterio 1.3.10 recommendation covering a small crop, a smaller output shape, coordinates, physical I/O, value semantics, and missing layout/class inputs. I read the authorized frozen brief, source manifest and three source captures directly. The two authorized predecessor reports were hash-checked against the dispatch map and reconciled as legitimate drafts, not treated as source truth. I additionally fetched three tagged Rasterio 1.3.10 implementation files and inspected their text only to resolve predecessor differences.

For an in-bounds pixel-aligned crop, create an integer `Window(col_off, row_off, width, height)`, call `src.read(window=win)`, and carry `src.window_transform(win)` with that array. For a smaller output array, read the same window with `out_shape` and an explicit resampling method, then scale the crop transform by `win.width/out_width` and `win.height/out_height` (using actual returned dimensions). The scaled affine preserves the crop’s outer extent, including rotation or skew. When writing either result, write its actual dimensions and matching transform. [W, R, G, I, T]

```python
win = Window(col_off, row_off, width, height)
t_crop = src.window_transform(win)
out = src.read(window=win, out_shape=(src.count, out_h, out_w), resampling=method)
t_out = t_crop * Affine.scale(win.width / out.shape[-1], win.height / out.shape[-2])
```

## Six brief obligations

1. **Q1 window/transform — accepted.** Windows are pixel offsets and sizes; use a window transform for the returned crop. The ordinary path should be integer and in bounds. If the service admits clipping or fractional windows, resolve the effective read window and test alignment rather than pairing returned data with a different requested-window transform. [W, T, I]
2. **Q2 output shape/transform — accepted with condition.** A different output shape is resampling. Scale the crop transform, not the original tile transform, by the input/output ratios. Use the returned shape if allocation or clipping may alter dimensions. [R, I]
3. **Logical pixels/physical I/O.** The requested window defines logical pixels, not a byte budget: Rasterio may read full blocks, and an unchunked source may need the whole dataset for a 1×1 request. Inspect each band’s `block_shapes` and `block_windows` on the actual file. With source layout, driver, and storage unknown, no physical byte or latency estimate follows from the 1024×1024 image size. [W]
4. **Crop/resampled coordinates.** Cropping translates the affine origin and retains pixel vectors; resampling scales the vectors over the same crop extent. GDAL locates pixel/line corner (0,0) at the upper-left pixel corner; its center is (0.5,0.5). Test corners and centers, not only array shape. [W, G]
5. **Categorical/continuous.** Nearest is a conservative label-preserving choice for categorical values. `mode` exists in the 1.3.10 enum and selects the most frequent sampled value, so retain it as an optional majority-aggregation lead only when that meaning is intended. The captured description does not settle ties or the deployed NoData behavior; define and test them. For continuous values, bilinear/cubic are interpolation candidates; average can fit downsampling when a weighted mean is intended. No universal “correct” choice is implied. [R, E]
6. **Fixtures and uncertainty.** Propose a known-value raster with nonzero crop offsets and a rotated/skewed affine; verify crop/output extent corners and pixel centers. Propose continuous and categorical fixtures with a rare label, ties and NoData, checked against declared numeric/class criteria. Propose tiled and striped files with aligned, cross-block and 1×1 windows; inspect all band layouts and use I/O instrumentation before claiming physical bytes. These tests were not run. Unknowns include actual block shapes, band layout differences, class labels/meaning, NoData/tie rules, target shape, and acceptable error.

## Reconciliation and dispositions

The predecessor reports agree that the crop needs its own transform, output-shape changes need an affine scale, block reads can exceed logical pixels, and the recommended method depends on data semantics. I retained these shared conditions.

The reports conflict about fractional window lengths: Q2 says Rasterio rounds them up; Q1 says lengths are rounded when allocating natural shape. In the tagged 1.3.10 `_io.pyx`, the read path calls `window.round_lengths()`. The corresponding `windows.py` implements this as `floor(x + 0.5)` (nearest, half-up for positive lengths). `_io.pyx` has a nearby comment saying “round up,” inconsistent with the call. I therefore reject “round up” as a reliable statement of behavior and keep fractional windows out of the ordinary recommendation; verify runtime behavior before supporting that edge path.

The reports also differ in their treatment of `mode`. The enum verifies availability and describes most-frequent-value selection, but does not establish tie or application-specific NoData rules. I amend the stronger recommendation to a conditional optional lead. “Nearest preserves a sampled label” is accepted only when choosing one source label is the desired meaning. Continuous interpolation and average remain candidates, not an automatic policy.

- **Accepted claims:** an integer crop window plus its window transform; scaling that crop transform for the output shape.
- **Amended claims:** physical-I/O expectations and mode selection are bounded by block layout and intended value semantics.
- **Rejected claims:** fractional lengths can be relied upon to round up; reusing the full-tile transform for a crop or resampled output.
- **Unresolved claims/questions:** physical read cost, correct resampler for the actual variable, class labels, ties/NoData, and acceptance thresholds.

## Source register and evidence status

Frozen public primary captures (Rasterio 1.3.10 / GDAL 3.9.0, capture date 2026-10-07), each matching the supplied `sources.json` SHA-256:

- [W — Rasterio windowed reads](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst): `4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1`.
- [R — Rasterio resampling](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst): `2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727`.
- [G — GDAL geotransforms](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst): `5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc`.

Additional pinned raw primary captures are preserved with URLs, capture-time window, hashes, and limitations in `sources/manifest.json`: [I — `_io.pyx`](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx), `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190`; [T — `windows.py`](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/windows.py), `91659f9becc7a61cf29109f29d2388507c5df916c88ecccc5462d3864c6518d3`; [E — `enums.py`](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py), `4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b`. The captured implementation describes this release only; it was not executed and does not prove runtime behavior for the service’s installed GDAL build.

**Executed:** source and predecessor SHA-256 checks; text inspection of frozen docs and tagged sources. **Not executed:** project code, raster reads, pixel fixtures, performance/I/O measurements. The checks listed above are proposals, not results.
