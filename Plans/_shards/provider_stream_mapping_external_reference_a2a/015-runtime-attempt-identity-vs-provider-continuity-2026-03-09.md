# Shard 015: Runtime Attempt Identity vs Provider Continuity (2026-03-09)

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L349-L357

Source SHA256: `71c0dafe1f3fb92db49dcf2c8a44377b951c755f3988253a8116e9d2dab5086c`

---

## Runtime Attempt Identity vs Provider Continuity (2026-03-09)

Runtime `attempt_id` is Puppet Master's per-dispatch identity.

Rules:
- retries, prerequisite resumes, remediation reruns, and restore-before-reruns always create a new runtime `attempt_id`
- upstream provider/session continuity uses a separate `provider_attempt_ref?`
- provider/session IDs MUST NOT be reused as runtime `attempt_id`
- reconnect flows may observe or resume streaming for the same runtime attempt but MUST NOT create hidden provider-local retry identity
