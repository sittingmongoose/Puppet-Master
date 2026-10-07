# Critique dispositions — D-M01-B treatment

The predecessor draft was used as an untrusted candidate, not as evidence. It covers all six obligations and its central conditional recommendation is supported by the supplied Rasterio 1.3.10 captures. The complete corrected answer is in `final.md`.

| Obligation | Disposition | Critique / correction carried into final |
|---|---|---|
| Band masks vs dataset mask | Accepted with clarification | Per-band `read_masks` supports all-required-band AND. Dataset-mask OR applies in nodata fallback; explicit dataset-wide masks take precedence. State no-nodata fallback and keep the four-band RGBA branch out of the three-band conclusion. |
| Polarity and masked-array convention | Accepted | Correct: GDAL-style nonzero is valid; NumPy masked-array True is invalid. |
| External `.msk` | Accepted, conditional | Correct precedence claim. Clarify behavior only establishes Rasterio’s read choice, not sidecar correctness/authority for production. |
| Low-value/8-bit ambiguity | Accepted | Correctly explains valid samples rounded to zero; preserve that not every zero is valid. |
| Multiband product validity | Amended / unresolved | Recommend AND only when the computation requires all three values. Product owner must settle missing-band tolerance; no generic dataset-mask choice is implied by Rasterio. |
| Fixtures and tile uncertainty | Accepted, expanded | Keep fixtures proposed; explicitly add no-nodata fallback assertion and identify tile-specific nodata, mask flags, sidecar quality, and algorithm requirements as unknown. |

Executed witness: read named brief, manifest, candidate draft and relevant source sections; computed SHA-256 for both provided captures, each matching its manifest value. No Rasterio code or tile execution occurred.

