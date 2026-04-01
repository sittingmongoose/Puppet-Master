## 6. Potential problems and solutions

| Problem | Solution |
|---------|----------|
| **seglog corruption or partial write** | Append-only with flush and last-complete-record recovery. CRC32 per record is mandatory; validate on every read; corrupt record -> skip + recovery event. |
| **redb corruption** | Restore from backup or rebuild projections from canonical seglog. |
| **Projector falls behind** | Buffer events in bounded batches and checkpoint only after a successful commit. |
| **Analytics scan blocks UI** | Run analytics scans in the background; UI shows last committed rollup plus freshness state. |
| **Disk full / storage I/O** | Surface a user-facing error, stop unsafe writes, and retry only per storage I/O policy. |
| **Migration failure** | Leave previous version intact; do not open a half-migrated store. |
| **Multiple app instances** | Acquire exclusive flock on `<project>/.puppet-master/pm.lock` before any writes. If lock is held, enter read-only/viewer mode and notify the user. |

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

| Problem | Solution |
|---------|----------|
| **Checkpoint lost** | Rebuild from seglog / last retained segment. |
| **API contract (caller handling errors)** | `append()` / redb write operations return structured `Result`; no silent swallow. |
| **Projector panic or crash** | Do not advance checkpoint; restart from last good checkpoint. |
| **File record LRU eviction** | Cap in-memory file records at 10,000 entries and rebuild lazily on access. |
| **Boot-time janitor** | After `pm.lock` acquisition, sweep stale `.tmp.*` artifacts, validate lock freshness, and emit a `storage.boot_recovery` event if cleanup was required. |
| **DB / redb shutdown hygiene** | Close the DB handle in the shutdown sequence before process exit. |

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Contracts_V0.md

