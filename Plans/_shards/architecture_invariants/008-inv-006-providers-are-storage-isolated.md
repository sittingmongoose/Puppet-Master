# Shard 008: INV-006 -- Providers are storage-isolated

Source: `Plans/Architecture_Invariants.md`

Source lines: L88-L92

Source SHA256: `aabdd384375f6ff5f75eac1ad5085ed9af05a5cebcf0dcbf4b5b3462eef1935e`

---

## INV-006 -- Providers are storage-isolated

**Rule:** Providers and provider adapters MUST NOT write directly to persistent storage (`seglog`, `redb`, `Tantivy`, sparse n-gram index files, or remote-cache state). They emit normalized events or tool results; PM-owned storage writers, projectors, and cache managers own persistence.

ContractRef: Primitive:Provider, Primitive:SessionStore, ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md
