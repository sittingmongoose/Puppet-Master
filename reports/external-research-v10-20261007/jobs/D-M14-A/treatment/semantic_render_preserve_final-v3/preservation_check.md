# Preservation check

Status: **PASS — no structural preservation discrepancy observed.**

Audit completed: `2026-10-07T20:51:04.917693+00:00`. Semantic input SHA-256: `22c8ca760be00ae27abdd9f5a226144efd81fef16b00eea339334b01a324ef90`. Projection SHA-256: `8e4a129b2cd486629201d1448bedcd9291339ab2ce89d68f1fb5448f01d4ae2a`. `final.md` is byte-identical to `mechanical_projection.md` (53,056 bytes; SHA-256 `8e4a129b2cd486629201d1448bedcd9291339ab2ce89d68f1fb5448f01d4ae2a`).

## Checks performed

- Confirmed the renderer receipt's input hash equals the pre-render semantic freeze, the recorded renderer hash/version and exit code are as stated, and the projection hash equals the receipt.
- Compared the frozen candidate-authored set with the decision view. All six IDs appear once in authored order; every summary, disposition, full governing-conditions value, and deterministic anchor/link matches exactly.
- Compared every full view—evidence, conditions, options, optional leads, validation, uncertainty, and sources—with the frozen values. Every authored string/list/object, including explicit empty lists, source binding, order, ID, and anchor is retained exactly.
- Compared every complete-record detail value and the exact-authored-input payload. All fields remain present in order; the original UTF-8 semantic bytes are retained, followed only by the renderer's framing newline.
- Confirmed the final artifact is an exact byte copy of the mechanical projection; no projection text was manually edited.
- Checked each supplied source's SHA-256 against `sources.json`; all four matched. The additional pinned Rasterio 1.3.10 `enums.py` capture is at `sources/rasterio-1.3.10-enums.py` and matches its recorded URL/tag hash. Candidate source identities, versions, URLs, hashes, and capture paths match the source manifest or this captured file.

## Primary-source review and limits

The complete supplied Rasterio masks, resampling, and windowed-I/O captures and the GDAL 3.9.0 geotransform capture were read and hash-checked. The additional Rasterio 1.3.10 enum source was read without execution. The cited claims were checked against their locators in those primary bytes. The source material supports mask polarity/precedence, the documented resampling descriptions, window/block caveats, and affine coordinate coefficients. It does not choose this product's validity policy, tie/coverage behavior, or area units. The affine determinant area calculation is explicitly identified in the candidate set as a mathematical derivation; it is not presented as a source-stated physical-area rule.

## Discrepancies and execution status

Discrepancies found: **none**. Structural retention does not establish scientific truth; the renderer is mechanical only. Validation proposals are labeled proposed and were not executed. No raster processing or product tests were run.
