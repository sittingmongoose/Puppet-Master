# D-M11-A: Bind release and API before choosing an extraction policy

A Linux package-ingest sandbox targets CPython 3.14.0 and receives untrusted tar archives. An older report discusses the pre-filter extraction problem; PEP 706, its implementation PR, and the default-filter issue are available. Decide a bounded filter/error/compatibility policy, explicitly binding the actual release and path/type domain before relying on an older warning.

This is one bounded diagnostic module. Address these six material obligations; do not produce a full application plan:

1. Identify the old concern, implementation/fix lineage, and released default relevant to 3.14.0.
2. Bind omitted versus explicit filter and errorlevel behavior.
3. Separate file/link/path domains and destination assumptions.
4. State residual security and resource-exhaustion limits.
5. Avoid projecting an older issue onto every current code path.
6. Propose version-discriminating regression checks and conditional compatibility policy.

Sources mode: FROZEN_PUBLIC_PRIMARY_CORPUS. Both arms receive exact same listed frozen source bytes and source identity metadata. Additional primary-source checks are allowed under the same access policy and budget; record URLs, versions, capture hashes, and limitations. Large repositories/clones and arbitrary installers are not needed. Mutable docs are capture-pinned; released implementation files govern claims about the selected release.

Deliver one complete source-linked bounded recommendation with conditions, uncertainty, and proposed checks. Soft ceiling: 1100 words / eight material findings. Do not omit governing conditions to fit the soft ceiling. Supplied drafts, if any, are legitimate untrusted test inputs, not truth or evaluator judgments. No execution of downloaded project code or installers.
