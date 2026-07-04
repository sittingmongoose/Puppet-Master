# Shard 018: Runtime Scheduler / Recovery Observability Addendum (2026-03-09)

Source: `Plans/usage-feature.md`

Source lines: L866-L879

Source SHA256: `a6b3d7e50490ec5e6a1cde444ce9dc7ef5c7a1af6c12d74639d3c01d2a7f1162`

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
