# Shard 013: Retry/Remediation Event Continuity Addendum (2026-03-08)

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L319-L331

Source SHA256: `a497a4740f6579a773ecc70aced0ba62b3da2bd91e4afd75b33b83340508eee4`

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
