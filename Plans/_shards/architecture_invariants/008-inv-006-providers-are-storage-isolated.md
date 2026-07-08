# Shard 008: INV-006 -- Providers are storage-isolated

Source: `Plans/Architecture_Invariants.md`

Source lines: L121-L125

Source SHA256: `fab349fb07405fa12bb0ee2bf0c49308e8b0bb9581290de3ba5db02abe5c0b1e`

---

## INV-006 -- Providers are storage-isolated

**Rule:** Providers and provider adapters MUST NOT write directly to persistent storage (`seglog`, `redb`, `Tantivy`, sparse n-gram index files, or remote-cache state). They emit normalized events or tool results; PM-owned storage writers, projectors, and cache managers own persistence.

ContractRef: Primitive:Provider, Primitive:SessionStore, ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md
