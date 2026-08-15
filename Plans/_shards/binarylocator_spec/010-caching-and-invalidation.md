# Shard 010: Caching and invalidation

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L282-L302

Source SHA256: `68378275f233e682c37ebbeb405a91ea064046815bf2454781f7589caba3304b`

---

## Caching and invalidation

### Cache scopes
BinaryLocator MUST maintain: (ContractRef: Primitive:Provider)
- A per-user persistent cache (durable KV) keyed by `provider_cli`. (ContractRef: Primitive:SessionStore)
- A per-workspace ephemeral cache keyed by `(provider_cli, workspace_fingerprint)` during the current Session. (ContractRef: Primitive:Provider)

Persistent cache rows serialize as `{ provider_cli, resolved_path, version?, validated_at_utc, validation_method, workspace_fingerprint?, path_fingerprint, status }`. `workspace_fingerprint = sha256_utf8(canonical_project_root + "\n" + git_worktree_id_or_empty + "\n" + provider_cli)`; `path_fingerprint = sha256_utf8(resolved_path + "\n" + file_size_or_empty + "\n" + modified_time_or_empty)`.

### Cache read policy


- If `force_rescan == true`, do not read caches. (ContractRef: Primitive:Provider)
- Otherwise, cached entries MUST be fast-validated before being returned. (ContractRef: Primitive:Provider)

### Cache write/eviction policy
- On `Found(Valid)`, write-through to caches in scope. (ContractRef: Primitive:Provider)
- On `FoundButInvalid`, evict matching cached entries. (ContractRef: Primitive:Provider)
- On `NotFound`, evict workspace cache; evict user cache if it fails fast validation. (ContractRef: Primitive:Provider)

---
