# Storage and source-control performance requirements

Base: `584039793616b5af1a348da5806fc9f73ab6acd0`.

SP-138 now retains the packet's short redb transactions, grouped projection revisions, no transaction/lock across UI/network/provider awaits, lazy Project/Vault index opening, maintenance-governed Tantivy batches and stable-content skipping for derived work. Canonical append, publication and checkpoint durability remain mandatory.

SCS-005 now retains shared status snapshots within an exact current RepositoryContext, watcher-burst coalescing, stable-content invalidation, batched Git reads rather than a subprocess per row, compatibility-gated FSMonitor/untracked-cache and deterministic bounded fallback for remote shares. No Git rule is imposed on Jujutsu, and no new configuration, credential or mutation authority is granted.

## Verification

Six preapplication source/retention tests passed. Three tests against the applied files confirm source hashes, preservation of every existing unit field/list/clause and non-YAML prose, and sensitivity to removal of each required clause. Independent actual-diff review passed with no findings. Only SP-138 and SCS-005 indexed semantics changed, adding three acceptance criteria each; all 6,719 unit identities remain. Index validation, 99-document/2,721-shard verification and whitespace checks passed. There are 26,269 acceptance criteria; runtime readiness remains blocked.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `settings_dependencies/performance-pr03-pr04-review-receipt.json`, SHA-256 `feba5333a8ff1d0b9c050b351504077a7f519e63a17aeeb9f4674c4fa9383ee8` (exact raw source paths, hashes, ranges and adjudication).
- `storage-scm-performance-source-verification-001.json`, SHA-256 `5ac5201c6c53e09efe5848c909d3c71078e8291a4f2d09c51426fdc10168c94a`.
- `storage-scm-performance-bounded-verification-001.json`, SHA-256 `813f233c6cafb779228dc2dd4567d0e77cadd29bda86768011c9ee96bbac8d5f` (full indexed delta and check results).
- `settings_dependencies/performance-pr03-pr04-actual-review.json`, SHA-256 `6317682e0c526b58c5c61bd2a23b0e8eadd2026cbaa55b9db300511057ab62e3`.

These are source-to-specification repairs, not native storage or repository performance results. Remaining packet review, companion contracts and runtime obligations stay open. No main landing or governance binding/baseline refresh is included.
