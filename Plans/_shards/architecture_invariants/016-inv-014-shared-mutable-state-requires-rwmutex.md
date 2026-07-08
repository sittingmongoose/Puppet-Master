# Shard 016: INV-014 -- Shared mutable state requires RWMutex

Source: `Plans/Architecture_Invariants.md`

Source lines: L165-L176

Source SHA256: `3f3e3b9f42434b65cdfcdfd03597ce25926979886fe66d28c06cd0f8d23a3cc3`

---

## INV-014 -- Shared mutable state requires RWMutex


### Rule

Any data structure shared across threads or async tasks that can be mutated MUST be protected by an `RwLock`/`RWMutex` (or equivalent). Lock-free approaches are allowed only when formally justified. Silent data races are prohibited. Permission state mutations in `Permissions_System` EXEC paths are covered by this invariant.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

ContractRef: Invariant:INV-014

<a id="INV-015"></a>
