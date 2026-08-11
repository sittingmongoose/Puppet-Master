# Shard 018: INV-016 -- Token fields are never aggregated at storage layer

Source: `Plans/Architecture_Invariants.md`

Source lines: L190-L201

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## INV-016 -- Token fields are never aggregated at storage layer


### Rule

The UF-085 canonical token buckets (`input_total`, `input_non_cached`, `cache_read`, `cache_write`, `cache_write_1h` / `cache_write_ttl` where exposed, `output_total`, `output_visible`, `reasoning` / `thoughts`, `provider_total`, and `context_estimate`) MUST be stored or explicitly represented as unknown/not_exposed in every usage record, with `total_tokens` derived without losing bucket detail or double-counting provider-inclusive cache/reasoning fields. Legacy `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, and `reasoning_tokens` are compatibility import/export aliases only. Pre-aggregation or collapsing at the storage or event layer is prohibited: provider records that aggregate into fewer persisted DB fields are non-canonical. `token-bucket` persistence is part of the same usage/BILL invariant family.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md

ContractRef: Invariant:INV-016

<a id="INV-017"></a>
