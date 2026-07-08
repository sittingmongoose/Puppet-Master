# Shard 020: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L2165-L2171

Source SHA256: `a497a4740f6579a773ecc70aced0ba62b3da2bd91e4afd75b33b83340508eee4`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime provider-stream rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Keeps `sfk-bbe24dbaee588f11b4a55c4d` explicitly deferred: provider diagnostic category schemas need a versioned schema-owner slice before closure.
- Keeps `sfk-e98bc6a59c457b5cf85d8d99` explicitly deferred: raw P5 continuity/recovery audit prose must be converted into schema text in a provider-stream lane before closure.
- Repairs `sfk-f343634c482c449df4c8d04f`: `approval_scope_key` format is `approval:{project_id}:{policy_axis}:{target_hash}:{operation_class}`. `target_hash` is lowercase hex SHA-256 over the normalized target identity. Keys are recomputed when project, policy axis, target, or operation class changes.
