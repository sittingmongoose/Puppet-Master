# Shard 019: INV-017 -- File mutations are atomic (temp-fsync-rename)

Source: `Plans/Architecture_Invariants.md`

Source lines: L235-L243

Source SHA256: `13ae96c59ca1c16416a77b1d9bac8c759d67536df3d0c4f1e332ad5763e83785`

---

## INV-017 -- File mutations are atomic (temp-fsync-rename)

All FileSafe-managed file write operations MUST use the atomic write pattern: write to a temp file, fsync, rename to the target path. Direct `os.WriteFile` or equivalent non-atomic write calls MUST NOT be used for managed files. Concurrent-edit safety is part of INV-017: managed rewrites capture `read_revision`, re-check before promote, and abort with `concurrent_edit_conflict` on concurrent-edit drift; any missing path is a MUST CHANGE item, not an implementation preference.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

ContractRef: Invariant:INV-017

<a id="INV-018"></a>
