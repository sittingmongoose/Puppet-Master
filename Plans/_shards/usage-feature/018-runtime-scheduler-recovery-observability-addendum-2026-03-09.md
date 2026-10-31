# Shard 018: Runtime Scheduler / Recovery Observability Addendum (2026-03-09)

Source: `Plans/usage-feature.md`

Source lines: L869-L882

Source SHA256: `f65e1bd01b100393967cade7f6027e576127765da35587ffacf8b80f7f709bc2`

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
