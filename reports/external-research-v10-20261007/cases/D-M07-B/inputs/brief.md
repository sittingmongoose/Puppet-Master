# D-M07-B: Verify a CRS import recommendation with breadth reserved

Review a common candidate-authored pyproj 3.6.1 / PROJ 9.3.0 import proposal for user-entered longitude/latitude coordinates. It includes an EPSG:4326 to EPSG:3857 choice, a unit/order contract, invalid-input handling, and one optional batch-processing opportunity. The input can include poles and swapped coordinates.

This is one bounded diagnostic module. Address these six material obligations; do not produce a full application plan:

1. Check the order/unit assumptions governing all downstream coordinates.
2. Check selected transform applicability and error handling.
3. Review boundary behavior rather than only ordinary city points.
4. Preserve supported validation and user-facing constraints.
5. Assess the optional batch-processing opportunity separately.
6. Keep any unresolved environmental dependency visible.

Sources mode: FROZEN_PUBLIC_PRIMARY_CORPUS. Both arms receive exact same listed frozen source bytes and source identity metadata. Additional primary-source checks are allowed under the same access policy and budget; record URLs, versions, capture hashes, and limitations. Large repositories/clones and arbitrary installers are not needed. Mutable docs are capture-pinned; released implementation files govern claims about the selected release.

Deliver one complete source-linked bounded recommendation with conditions, uncertainty, and proposed checks. Soft ceiling: 1100 words / eight material findings. Do not omit governing conditions to fit the soft ceiling. Supplied drafts, if any, are legitimate untrusted test inputs, not truth or evaluator judgments. No execution of downloaded project code or installers.
