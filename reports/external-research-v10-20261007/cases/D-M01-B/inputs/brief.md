# D-M01-B: Valid-pixel policy for a multiband land-cover tile

A Rasterio 1.3.10 pipeline reads three-band uint8 survey tiles with nodata metadata; some tiles additionally ship an external .msk file. Decide how to obtain a valid-pixel mask for a downstream land-cover summary without assuming that zero is always invalid. No raster execution is required.

This is one bounded diagnostic module. Address these six material obligations; do not produce a full application plan:

1. Compare band masks with dataset-level masks.
2. State mask polarity and relationship to masked-array conventions.
3. Address how an external .msk affects nodata-derived validity.
4. Explain the low-value/8-bit ambiguity relevant to this input.
5. State which multiband validity choice belongs to the product.
6. Propose discriminating fixtures and preserve uncertainty about supplied tile metadata.

Sources mode: FROZEN_PUBLIC_PRIMARY_CORPUS. Both arms receive exact same listed frozen source bytes and source identity metadata. Additional primary-source checks are allowed under the same access policy and budget; record URLs, versions, capture hashes, and limitations. Large repositories/clones and arbitrary installers are not needed. Mutable docs are capture-pinned; released implementation files govern claims about the selected release.

Deliver one complete source-linked bounded recommendation with conditions, uncertainty, and proposed checks. Soft ceiling: 1100 words / eight material findings. A soft ceiling does not authorize omitting a governing condition. Supplied drafts, if any, are legitimate untrusted test inputs, not truth or evaluator judgments. Do not execute downloaded project code or installers. Only M06's later root-qualified tiny candidate witness may execute; this is outside designer work.
