# Shard 016: INV-014 -- Shared mutable state requires RWMutex

Source: `Plans/Architecture_Invariants.md`

Source lines: L198-L209

Source SHA256: `6f883fb60e510b7c00faba9208e8a0702690c2df24d96a4294dc6f33d861634b`

---

## INV-014 -- Shared mutable state requires RWMutex


### Rule

Any data structure shared across threads or async tasks that can be mutated MUST be protected by an `RwLock`/`RWMutex` (or equivalent). Lock-free approaches are allowed only when formally justified. Silent data races are prohibited. Permission state mutations in `Permissions_System` EXEC paths are covered by this invariant.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

ContractRef: Invariant:INV-014

<a id="INV-015"></a>
