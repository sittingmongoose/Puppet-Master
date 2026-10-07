# D-M05-B: Incremental WAL research after deployment change

A sandbox SQLite 3.51.3 job index refreshes its prior bounded WAL proposal. Prior: all connections and database files on one Linux host's local disk. No-op change: rename 'Queue store' to 'Job store'. Material change: two machines now open the same database on a mounted network filesystem; application requires simultaneous readers and one writer. Runtime and data model are unchanged.

This is one bounded diagnostic module. Address these six material obligations; do not produce a full application plan:

1. Bind prior findings to exact deployment and source dependencies.
2. Treat the rename as no-op only where dependencies establish that.
3. Re-evaluate the network-filesystem and process-location assumptions.
4. Revisit locking, shared memory, durability, and operational promises affected by deployment.
5. Keep unaffected findings only with evidence of equivalence.
6. State a bounded revised disposition, uncertainty, and proposed validation.

Sources mode: FROZEN_PUBLIC_PRIMARY_CORPUS. Both arms receive exact same listed frozen source bytes and source identity metadata. Additional primary-source checks are allowed under the same access policy and budget; record URLs, versions, capture hashes, and limitations. Large repositories/clones and arbitrary installers are not needed. Mutable docs are capture-pinned; released implementation files govern claims about the selected release.

Deliver one complete source-linked bounded recommendation with conditions, uncertainty, and proposed checks. Soft ceiling: 1100 words / eight material findings. A soft ceiling does not authorize omitting a governing condition. Supplied drafts, if any, are legitimate untrusted test inputs, not truth or evaluator judgments. Do not execute downloaded project code or installers. Only M06's later root-qualified tiny candidate witness may execute; this is outside designer work.
