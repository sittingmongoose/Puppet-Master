# Shard 010: Caching and invalidation

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L280-L298

Source SHA256: `ad4e0b77b672faf847917425be40a12d452f41d9d489bba0879c7e512ac828a5`

---

## Caching and invalidation

### Cache scopes
BinaryLocator MUST maintain: (ContractRef: Primitive:Provider)
- A per-user persistent cache (durable KV) keyed by `provider_cli`. (ContractRef: Primitive:SessionStore)
- A per-workspace ephemeral cache keyed by `(provider_cli, workspace_fingerprint)` during the current Session. (ContractRef: Primitive:Provider)

### Cache read policy


- If `force_rescan == true`, do not read caches. (ContractRef: Primitive:Provider)
- Otherwise, cached entries MUST be fast-validated before being returned. (ContractRef: Primitive:Provider)

### Cache write/eviction policy
- On `Found(Valid)`, write-through to caches in scope. (ContractRef: Primitive:Provider)
- On `FoundButInvalid`, evict matching cached entries. (ContractRef: Primitive:Provider)
- On `NotFound`, evict workspace cache; evict user cache if it fails fast validation. (ContractRef: Primitive:Provider)

---
