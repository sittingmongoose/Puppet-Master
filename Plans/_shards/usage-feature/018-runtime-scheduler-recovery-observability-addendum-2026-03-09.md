# Shard 018: Runtime Scheduler / Recovery Observability Addendum (2026-03-09)

Source: `Plans/usage-feature.md`

Source lines: L868-L881

Source SHA256: `85a0a8e8e78485774a55d5d4185f3653412cc4c33707817e77b83171fca838b1`

---

## Runtime Scheduler / Recovery Observability Addendum (2026-03-09)

### Recommended counters / views
- blocked attempts by `blocked_reason_code`
- retries by `failure_class`
- remediation children spawned and resolved
- queue-analysis passes and wake reasons
- safe-point creates/restores
- blocked outcomes remain distinct from failures
- blocked counters also retain `escalation_level` and the shared blocked-action disclosure (`action_available`)

### Metrics integrity rule
- usage rollups may keep executed-tool metrics separate while blocked and remediation disclosure remains queryable
- blocked outcomes remain distinct from failures in user-visible statistics
