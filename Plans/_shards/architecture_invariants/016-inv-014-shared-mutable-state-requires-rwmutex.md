# Shard 016: INV-014 -- Shared mutable state requires RWMutex

Source: `Plans/Architecture_Invariants.md`

Source lines: L165-L176

Source SHA256: `6ce7f74c2d708b8bdc9358c3f7e41354630e681db5985087d30bd42654a39c7b`

---

## INV-014 -- Shared mutable state requires RWMutex


### Rule

Any data structure shared across threads or async tasks that can be mutated MUST be protected by an `RwLock`/`RWMutex` (or equivalent). Lock-free approaches are allowed only when formally justified. Silent data races are prohibited. Permission state mutations in `Permissions_System` EXEC paths are covered by this invariant.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

ContractRef: Invariant:INV-014

<a id="INV-015"></a>
