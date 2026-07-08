# Shard 018: INV-016 -- Token fields are never aggregated at storage layer

Source: `Plans/Architecture_Invariants.md`

Source lines: L223-L234

Source SHA256: `6f883fb60e510b7c00faba9208e8a0702690c2df24d96a4294dc6f33d861634b`

---

## INV-016 -- Token fields are never aggregated at storage layer


### Rule

The five canonical token fields (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, `reasoning_tokens`) MUST be stored individually in every usage record, with `total_tokens` derived without losing bucket detail. Pre-aggregation or collapsing at the storage or event layer is prohibited: provider records that AGGREGATES into fewer persisted DB fields are non-canonical. `token-bucket` persistence is part of the same usage/BILL invariant family.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md

ContractRef: Invariant:INV-016

<a id="INV-017"></a>
