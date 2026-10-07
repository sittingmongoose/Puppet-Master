# D-M02-B — bounded Q1/Q2 recommendation

## Recommendation

For Q1, represent the crop as a pixel window, read that window, and carry its window transform with the returned pixels. For Q2, pass the smaller output shape on that same window, choose a resampling method from the value semantics, and derive the output transform by scaling the crop transform by the input-to-output width and height ratios. This keeps the resampled grid on the crop’s geographic extent. These are separate grid choices: cropping selects an extent; changing array dimensions changes cell size and values. [W, R, G, I]

    from rasterio.windows import Window
    from affine import Affine

    win = Window(col_off, row_off, width, height)
    crop = src.read(window=win)
    crop_transform = src.window_transform(win)

    out = src.read(
        window=win,
        out_shape=(src.count, out_h, out_w),
        resampling=method,
    )
    out_transform = crop_transform * Affine.scale(
        win.width / out_w, win.height / out_h
    )

Use integer, pixel-edge window bounds for the ordinary crop path. If fractional windows are accepted, specify and test their rounding policy: Rasterio 1.3.10 accepts float windows, computes natural array dimensions by rounding window lengths up, and passes the fractional window to GDAL. [W, I]

If writing either array as a raster, set its width and height to the array dimensions and its transform to the corresponding crop or output transform; do not copy the full-tile transform unchanged. Rasterio’s crop example updates dimensions and uses the window transform. [W]

## Obligations and conditions

1. **Q1—crop:** A Rasterio window is described by column/row offsets and width/height. Read with that window and use src.window_transform(win) (or the documented window transform utility). For an output file, set width/height to the crop array and transform to crop_transform. [W]
2. **Q2—smaller array:** Rasterio documents that a read into a different out_shape is resampling; its 1.3.10 read implementation exposes out_shape and a resampling parameter, defaults to nearest, and sends the output buffer and requested window through GDAL RasterIO. Apply the size ratios to the crop transform, not the full-tile transform. This formula is the documented whole-dataset scaling recipe applied after cropping; the proposed corner fixture below should verify it for this service. [R, I]
3. **Logical pixels versus physical I/O:** The requested array is the logical window. A windowed read can fetch complete storage blocks: a 1×1 request may read a whole block, and an unchunked source may require reading the dataset. Inspect block_shapes per band; block-aligned windows are most efficient. The 1024×1024 tile size alone does not reveal block layout or physical bytes read. [W]
4. **Coordinates:** The crop transform translates the source grid by the window’s column/row offset. GDAL defines (0,0) as the upper-left pixel corner and (0.5,0.5) as its center. Resampling scales pixel/line steps while retaining the crop’s outer extent; with rotation or skew, use the full affine composition above, not a north-up-only pixel-size edit. [W, G]
5. **Value semantics:** For nominal class labels, nearest is the conservative label-preserving choice; bilinear, cubic, or average can create values that are not class codes. If downsampling should represent class prevalence rather than one sampled label, assess a class-aware aggregation such as mode only after confirming its availability and tie/NoData rules for the deployed stack. For continuous data, nearest can be unsuitable; bilinear or cubic may fit interpolation, while average may fit a downsampling statistic. No method is universally correct; choose against the variable’s meaning and acceptance metric. The nearest recommendation for categories and the aggregation condition are semantic guidance, not a tested result. [R, I]
6. **Unknowns:** Actual block shapes and whether bands share them are unknown; Rasterio advises checking band block layouts. Class labels, NoData behavior, intended output dimensions, and acceptable numeric/class error are also unspecified. Therefore this is a bounded method recommendation, not a selected production resampling policy or physical-I/O estimate. [W]

## Claim dispositions

No draft, critique, or sibling answer was supplied, so these dispositions apply to propositions in this answer, not to another researcher’s claims.

- **Accepted:** A pixel window plus its window transform locates a crop; a different output shape is a resampled grid. [W, R]
- **Amended:** “A small logical window reads only those bytes” is narrowed: it selects logical pixels, while physical reads follow block layout and may be much larger. [W]
- **Rejected:** Reusing the full-tile transform unchanged for a crop or smaller output shape; it misstates the crop origin or output cell size. [W, R, G]
- **Unresolved:** The best resampler, acceptable error, class-aware downsampling rule, actual block I/O cost, and fractional-window policy; the required data/layout/acceptance inputs are absent.

## Discriminating checks proposed—not executed

1. Create a synthetic 1024×1024 raster with a nonzero rotation/skew affine, crop at a nonzero integer offset, then read to unequal smaller width/height. Assert the returned shape; compare the transformed crop/output outer corners with the corresponding source-window corners; verify center coordinates and that deliberately reusing the full transform fails.
2. Use a continuous ramp/known surface and a categorical raster containing every class plus a narrow rare class. Compare nearest, bilinear, cubic, and average against predeclared continuous error/statistic thresholds; for labels, assert nearest emits only source codes and measure rare-class retention. If an aggregation method is considered, assert its tie and NoData behavior against explicit class rules.
3. Build same-size tiled and striped fixtures, including a window crossing block boundaries; inspect block_shapes for every band and compare predicted intersected blocks with physical bytes from a suitable driver/network I/O counter. If no physical counter exists, report only logical pixels and block metadata—do not infer bytes read from array size.

**Executed witness:** SHA-256 was computed for the three supplied source captures and each matched sources.json. The tagged Rasterio implementation below was additionally fetched and hashed. No raster fixture, code execution, or pixel-level test was run.

## Source register

- **W — Rasterio windowed reads**, tag 1.3.10, captured 2026-10-07. https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst — SHA-256 4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1. Local capture: /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-B/inputs/sources/rasterwindow.rst
- **R — Rasterio resampling**, tag 1.3.10, captured 2026-10-07. https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst — SHA-256 2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727. Local capture: /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-B/inputs/sources/rasterresample.rst
- **G — GDAL geotransforms tutorial**, tag v3.9.0, captured 2026-10-07. https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst — SHA-256 5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc. Local capture: /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-B/inputs/sources/geotransform.rst
- **I — Rasterio read implementation**, tag 1.3.10, raw file captured 2026-10-07 20:32:32–20:32:33 UTC. https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx — SHA-256 1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190. Local capture: /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M02-B/control/question_2-v3/sources/rasterio-1.3.10-_io.pyx (read interface and shape calculation at lines 438–486, 584–620; GDAL dispatch at 910–982).
