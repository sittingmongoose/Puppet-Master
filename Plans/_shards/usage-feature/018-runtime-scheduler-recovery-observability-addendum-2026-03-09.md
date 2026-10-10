# Shard 018: Runtime Scheduler / Recovery Observability Addendum (2026-03-09)

Source: `Plans/usage-feature.md`

Source lines: L870-L883

Source SHA256: `f1b1de40aa84794ec9f37bed185aa8e0cceb55d41081c952386c33822f6afc65`

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
