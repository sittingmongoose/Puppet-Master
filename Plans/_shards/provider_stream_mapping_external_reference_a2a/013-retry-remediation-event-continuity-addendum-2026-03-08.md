# Shard 013: Retry/Remediation Event Continuity Addendum (2026-03-08)

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L319-L331

Source SHA256: `dd39be33bb75ade2f1a0a6c352ec2b9a02cace2077e5d5e5e09f2e189553c0b4`

---

## Retry/Remediation Event Continuity Addendum (2026-03-08)

Provider/A2A event normalization must preserve enough continuity for the shared runtime scheduler packet.

Required behavior:
- resumed or retried runs must preserve attempt identity where the upstream provider/protocol exposes it
- normalized diagnostics should preserve distinctions relevant to `failure_class`, especially `input_provided`, forced remediation, malformed artifact streaming, and interruption/resume signals
- when a provider-side audit forces remediation, the normalized stream must preserve that fact so runtime lineage can record `origin_failure_event_id` and remediation generation coherently
- pause/resume semantics for input-required flows must remain compatible with scheduler wake reasons and blocked-to-runnable wakeups

Acceptance criteria:
- A2A/provider normalization does not erase retry/remediation lineage
- input-provided / resume events remain sufficient to wake blocked runtime flows deterministically
