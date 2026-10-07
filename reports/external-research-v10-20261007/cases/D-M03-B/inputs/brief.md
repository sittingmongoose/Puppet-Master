# D-M03-B: pyproj axis-order contract from implementation

A pyproj 3.6.1 / PROJ 9.3.0 import stage accepts coordinate tuples documented by its users as longitude, latitude in degrees, and converts EPSG:4326 to EPSG:3857. Determine which Transformer.from_crs configuration and call contract this requires, including what one successful central-city example would fail to establish.

This is one bounded diagnostic module. Address these six material obligations; do not produce a full application plan:

1. Trace from_crs configuration into transformer creation and transform use.
2. Bind input order separately from CRS native axis metadata.
3. State meaning and limitations of always_xy.
4. Address radians and output unit domains relevant to this API.
5. Discuss area-of-use and invalid-input/error handling limits.
6. Propose boundary checks and acknowledge dependency/environment uncertainty.

Sources mode: FROZEN_PUBLIC_PRIMARY_CORPUS. Both arms receive exact same listed frozen source bytes and source identity metadata. Additional primary-source checks are allowed under the same access policy and budget; record URLs, versions, capture hashes, and limitations. Large repositories/clones and arbitrary installers are not needed. Mutable docs are capture-pinned; released implementation files govern claims about the selected release.

Deliver one complete source-linked bounded recommendation with conditions, uncertainty, and proposed checks. Soft ceiling: 1100 words / eight material findings. A soft ceiling does not authorize omitting a governing condition. Supplied drafts, if any, are legitimate untrusted test inputs, not truth or evaluator judgments. Do not execute downloaded project code or installers. Only M06's later root-qualified tiny candidate witness may execute; this is outside designer work.
