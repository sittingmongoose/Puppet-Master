# D-M13-A: Trace one real extraction-filter change into a release

A package importer targeting CPython 3.12.3 is considering an explicit extraction filter. Investigate the PEP 706 implementation lead (issue 102950 / PR 102953), trace the applicable implementation branch, regression coverage, and release boundary, and propose a small importer-policy amendment. Do not audit every tarfile vulnerability.

This is one bounded diagnostic module. Address these six material obligations; do not produce a full application plan:

1. Separate issue, PR merge, and chosen-release availability.
2. Trace one consequential extraction-filter branch and its callers.
3. Find relevant regression coverage and state what it demonstrates.
4. Explain an applicable change to importer policy.
5. Preserve residual limitations and avoid universal safety claims.
6. Propose a bounded additional regression and stop when the decision is supported.

Sources mode: FROZEN_PUBLIC_PRIMARY_CORPUS. Both arms receive exact same listed frozen source bytes and source identity metadata. Additional primary-source checks are allowed under the same access policy and budget; record URLs, versions, capture hashes, and limitations. Large repositories/clones and arbitrary installers are not needed. Mutable docs are capture-pinned; released implementation files govern claims about the selected release.

Deliver one complete source-linked bounded recommendation with conditions, uncertainty, and proposed checks. Soft ceiling: 1100 words / eight material findings. Do not omit governing conditions to fit the soft ceiling. Supplied drafts, if any, are legitimate untrusted test inputs, not truth or evaluator judgments. No execution of downloaded project code or installers.
