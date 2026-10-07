# D-M01-A: Live snapshot backup while a SQLite writer runs

A local note index uses SQLite 3.51.3 on a single-host local disk. One writer remains active. Decide whether an incremental Online Backup API job is a suitable nightly snapshot mechanism, and specify a bounded failure/retry/cleanup policy without designing the rest of the application.

This is one bounded diagnostic module. Address these six material obligations; do not produce a full application plan:

1. State source and destination connection roles and legal usage.
2. Explain snapshot consistency when the source changes during a multi-step backup.
3. Distinguish completion, retryable contention, and terminal failures.
4. Address destination transaction/page-size restrictions relevant to this setup.
5. State what progress counts can and cannot establish.
6. Propose a minimal validation plan and one justified alternative or uncertainty.

Sources mode: FROZEN_PUBLIC_PRIMARY_CORPUS. Both arms receive exact same listed frozen source bytes and source identity metadata. Additional primary-source checks are allowed under the same access policy and budget; record URLs, versions, capture hashes, and limitations. Large repositories/clones and arbitrary installers are not needed. Mutable docs are capture-pinned; released implementation files govern claims about the selected release.

Deliver one complete source-linked bounded recommendation with conditions, uncertainty, and proposed checks. Soft ceiling: 1100 words / eight material findings. A soft ceiling does not authorize omitting a governing condition. Supplied drafts, if any, are legitimate untrusted test inputs, not truth or evaluator judgments. Do not execute downloaded project code or installers. Only M06's later root-qualified tiny candidate witness may execute; this is outside designer work.
