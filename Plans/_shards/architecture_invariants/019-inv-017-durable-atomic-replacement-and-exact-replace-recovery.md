# Shard 019: INV-017 -- Durable atomic replacement and exact-replace recovery

Source: `Plans/Architecture_Invariants.md`

Source lines: L202-L212

Source SHA256: `6ce7f74c2d708b8bdc9358c3f7e41354630e681db5985087d30bd42654a39c7b`

---

## INV-017 -- Durable atomic replacement and exact-replace recovery

All FileSafe-managed single-file writes and storage-owned same-directory journal, manifest, and pointer replacements MUST use the durable atomic-replace pattern: stage a temp file in the target directory, fsync the staged content, rename or replace the target, then fsync the affected parent directory before reporting durable success. When the platform cannot establish equivalent directory-entry durability, the canonical operation fails closed. Direct `os.WriteFile` or equivalent non-atomic write calls MUST NOT be used for managed files.

Concurrent-edit safety remains part of INV-017: managed rewrites capture `read_revision`, re-check the expected preimage immediately before promote, and abort with `concurrent_edit_conflict` on drift; any missing path is a MUST CHANGE item, not an implementation preference. FileSafe safe-point restore and Chat revert are exact-replace operations over the manifest-owned state, but their atomicity is a durable journaled logical transaction with per-path durable replacement, verified rollback, and restart reconciliation. They are not a claim that a portable whole-worktree atomic rename exists.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

ContractRef: Invariant:INV-017

<a id="INV-018"></a>
