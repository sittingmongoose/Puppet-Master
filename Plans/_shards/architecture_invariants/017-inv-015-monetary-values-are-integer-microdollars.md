# Shard 017: INV-015 -- Monetary values are integer microdollars

Source: `Plans/Architecture_Invariants.md`

Source lines: L177-L189

Source SHA256: `6ce7f74c2d708b8bdc9358c3f7e41354630e681db5985087d30bd42654a39c7b`

---

## INV-015 -- Monetary values are integer microdollars


### Rule

All persisted and in-memory monetary cost values MUST be stored as integer microdollars (`u64`). Float types MUST NOT be used for cost storage or accumulation at any layer. `cost_usd` is derived display copy only: `cost_microdollars / 1_000_000`, presentation-only, and never a persisted billing field.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md

Enforcement: `clippy` or custom lint to reject `f64`/`f32` fields named `cost*`, `price*`, or `amount*` in persisted structs.
ContractRef: Invariant:INV-015

<a id="INV-016"></a>
