# Shard 018: INV-016 -- Token fields are never aggregated at storage layer

Source: `Plans/Architecture_Invariants.md`

Source lines: L190-L201

Source SHA256: `3f3e3b9f42434b65cdfcdfd03597ce25926979886fe66d28c06cd0f8d23a3cc3`

---

## INV-016 -- Token fields are never aggregated at storage layer


### Rule

The five canonical token fields (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, `reasoning_tokens`) MUST be stored individually in every usage record, with `total_tokens` derived without losing bucket detail. Pre-aggregation or collapsing at the storage or event layer is prohibited: provider records that AGGREGATES into fewer persisted DB fields are non-canonical. `token-bucket` persistence is part of the same usage/BILL invariant family.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md

ContractRef: Invariant:INV-016

<a id="INV-017"></a>
