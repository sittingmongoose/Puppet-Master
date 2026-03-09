## Runtime Scheduler / Recovery Observability Addendum (2026-03-09)

Usage and analytics surfaces should reflect the new runtime model.

### Recommended counters / views
- blocked attempts by `blocked_reason_code`
- retries by `failure_class`
- remediation children spawned and resolved
- queue-analysis passes and wake reasons
- safe-point creates/restores

Any summary view must differentiate blocked outcomes from failures so user-visible statistics do not imply unsuccessful work where local progress was preserved.
