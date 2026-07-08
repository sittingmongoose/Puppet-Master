# Shard 015: Runtime Attempt Identity vs Provider Continuity (2026-03-09)

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L364-L372

Source SHA256: `a068e282f37be95699a82dba71b64c812aa14b7cf4ce556c2f7ed110b9eb6906`

---

## Runtime Attempt Identity vs Provider Continuity (2026-03-09)

Runtime `attempt_id` is Puppet Master's per-dispatch identity.

Rules:
- retries, prerequisite resumes, remediation reruns, and restore-before-reruns always create a new runtime `attempt_id`
- upstream provider/session continuity uses a separate `provider_attempt_ref?`
- provider/session IDs MUST NOT be reused as runtime `attempt_id`
- reconnect flows may observe or resume streaming for the same runtime attempt but MUST NOT create hidden provider-local retry identity
