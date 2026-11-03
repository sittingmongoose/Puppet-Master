# Shard 008: INV-006 -- Providers are storage-isolated

Source: `Plans/Architecture_Invariants.md`

Source lines: L88-L92

Source SHA256: `480fac0bed813d64ffbc35f54515ef098785f04fd1b0893cdf132bba61a93e2b`

---

## INV-006 -- Providers are storage-isolated

**Rule:** Providers and provider adapters MUST NOT write directly to persistent storage (`seglog`, `redb`, `Tantivy`, sparse n-gram index files, or remote-cache state). They emit normalized events or tool results; PM-owned storage writers, projectors, and cache managers own persistence.

ContractRef: Primitive:Provider, Primitive:SessionStore, ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md
