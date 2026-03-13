## Runtime Scheduler / Recovery Observability Addendum (2026-03-09)

Usage and analytics surfaces should reflect the new runtime model.

### Recommended counters / views
- blocked attempts by `blocked_reason_code`
- retries by `failure_class`
- remediation children spawned and resolved
- queue-analysis passes and wake reasons
- safe-point creates/restores

### Metrics integrity rule
- usage rollups may continue to exclude non-executed tool calls from executed-tool latency/error widgets, but blocked and remediation counts should remain queryable via dedicated runtime/scheduler projections
- queue-analysis freshness, blocked counts, remediation generations, and retry/backoff counts should be available for future usage/operations surfaces rather than being lost because they are not ordinary tool invocations

Any summary view must differentiate blocked outcomes from failures so user-visible statistics do not imply unsuccessful work where local progress was preserved.

Acceptance criteria:
- the product can report on blocked/remediation/scheduler behavior without corrupting executed-tool usage metrics

