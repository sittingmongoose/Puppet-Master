# Shard 018: Runtime Scheduler / Recovery Observability Addendum (2026-03-09)

Source: `Plans/usage-feature.md`

Source lines: L869-L882

Source SHA256: `f14b411d90a38f9cf14ee5f171356e770083f8b20d3e2beea31dd9618b8ed4e8`

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
