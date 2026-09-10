# Shard 020: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L2188-L2194

Source SHA256: `a068e282f37be95699a82dba71b64c812aa14b7cf4ce556c2f7ed110b9eb6906`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime provider-stream rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-bbe24dbaee588f11b4a55c4d`: reserved diagnostic categories now consume the versioned `ProviderDiagnosticDetailsV1` schema slot, exposing runtime `attempt_id` and provider continuity fields without adding V0 event types.
- Repairs `sfk-e98bc6a59c457b5cf85d8d99`: raw P5 continuity/recovery audit prose has been converted into normative provider-stream continuity requirements tied to `ProviderDiagnosticDetailsV1`.
- Repairs `sfk-f343634c482c449df4c8d04f`: `approval_scope_key` format is `approval:{project_id}:{policy_axis}:{target_hash}:{operation_class}`. `target_hash` is lowercase hex SHA-256 over the normalized target identity. Keys are recomputed when project, policy axis, target, or operation class changes.
