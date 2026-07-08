# Shard 014: Stream Wake and Attempt Continuity Consolidation Addendum (2026-03-09)

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L332-L347

Source SHA256: `a497a4740f6579a773ecc70aced0ba62b3da2bd91e4afd75b33b83340508eee4`

---

## Stream Wake and Attempt Continuity Consolidation Addendum (2026-03-09)

Provider/A2A stream normalization MUST preserve canonical wake reasons and attempt continuity.

### Required mappings
- completion -> `wake_reason = node_completed` or `verification_completed` as applicable
- approval/input resolution -> `wake_reason = approval_resolved` or `clarification_resolved`
- auth recovery -> `wake_reason = auth_recovered`
- startup recovery -> `wake_reason = startup_recovered`
- watchdog defensive recheck -> `wake_reason = watchdog_recheck` only as a non-primary defensive wake; correctness still comes from event-driven prerequisite, auth, startup, and remediation wakes.
- backoff expiry -> `wake_reason = backoff_expired`
- remediation completion -> `wake_reason = remediation_completed`
- replan application -> `wake_reason = replan_applied`

### Continuity rule
Normalized streams MUST preserve `attempt_id` across reconnect/observe-only flows and MUST NOT create provider-local retry identity separate from runtime identity.
