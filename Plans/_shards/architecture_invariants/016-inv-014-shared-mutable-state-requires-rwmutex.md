# Shard 016: INV-014 -- Shared mutable state requires RWMutex

Source: `Plans/Architecture_Invariants.md`

Source lines: L165-L176

Source SHA256: `d48461a5189f0540f72edec82e53ffffd9a421fcdd39f7ec884aa1a81e22e254`

---

## INV-014 -- Shared mutable state requires RWMutex


### Rule

Any data structure shared across threads or async tasks that can be mutated MUST be protected by an `RwLock`/`RWMutex` (or equivalent). Lock-free approaches are allowed only when formally justified. Silent data races are prohibited. Permission state mutations in `Permissions_System` EXEC paths are covered by this invariant.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

ContractRef: Invariant:INV-014

<a id="INV-015"></a>
