## Scheduler / blocked Usage Observability Addendum (2026-03-08)

Usage/telemetry surfaces should account for the new runtime packet so observability is not limited to successful executed calls.

Required guidance:
- usage rollups may continue to exclude non-executed tool calls from executed-tool latency/error widgets, but blocked and remediation counts should remain queryable via dedicated runtime/scheduler projections
- queue-analysis freshness, blocked counts, remediation generations, and retry/backoff counts should be available for future usage/operations surfaces rather than being lost because they are not ordinary tool invocations

Acceptance criteria:
- the product can report on blocked/remediation/scheduler behavior without corrupting executed-tool usage metrics
