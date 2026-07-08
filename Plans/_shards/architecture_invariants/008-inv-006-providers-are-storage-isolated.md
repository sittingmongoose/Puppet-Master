# Shard 008: INV-006 -- Providers are storage-isolated

Source: `Plans/Architecture_Invariants.md`

Source lines: L121-L125

Source SHA256: `13ae96c59ca1c16416a77b1d9bac8c759d67536df3d0c4f1e332ad5763e83785`

---

## INV-006 -- Providers are storage-isolated

**Rule:** Providers and provider adapters MUST NOT write directly to persistent storage (`seglog`, `redb`, `Tantivy`, sparse n-gram index files, or remote-cache state). They emit normalized events or tool results; PM-owned storage writers, projectors, and cache managers own persistence.

ContractRef: Primitive:Provider, Primitive:SessionStore, ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md
