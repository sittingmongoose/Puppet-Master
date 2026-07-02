# Shard 015: Runtime Attempt Identity vs Provider Continuity (2026-03-09)

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L349-L357

Source SHA256: `dd39be33bb75ade2f1a0a6c352ec2b9a02cace2077e5d5e5e09f2e189553c0b4`

---

## Runtime Attempt Identity vs Provider Continuity (2026-03-09)

Runtime `attempt_id` is Puppet Master's per-dispatch identity.

Rules:
- retries, prerequisite resumes, remediation reruns, and restore-before-reruns always create a new runtime `attempt_id`
- upstream provider/session continuity uses a separate `provider_attempt_ref?`
- provider/session IDs MUST NOT be reused as runtime `attempt_id`
- reconnect flows may observe or resume streaming for the same runtime attempt but MUST NOT create hidden provider-local retry identity
