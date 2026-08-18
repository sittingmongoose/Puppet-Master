# Goal Capacity, Time, and Operational State

## Sustainable concurrency

Distinguish:

```text
Hard PM safety maximum
Configured preferred maximum
Provider/account advertised/discovered maximum
Current effective maximum
Predicted sustainable maximum
Requested workers
Admitted concurrent workers
Queued workers
```

The sustainable value answers how many workers can plausibly finish useful work with current allowance, reset timing, host capacity, and reserved verification budget.

Required specialists remain required. Six specialists may run as two concurrent workers across three waves.

## Forecasts

Planning Wizard, PRD Builder, Goal Mode, Orchestrator, and Crew may request a forecast.

A forecast can contain:

```text
Likely to finish / uncertain / unlikely
Estimated usage range
Estimated elapsed range
Current included/extra/API capacity
Reset/cooldown
Recommended wave size
Reserved synthesis/testing/repair
Confidence
Data source/freshness
```

It is advice, not a promise.

## Time

Separate:

```text
Provider-active time
Local compute
Tool/runtime execution
Resource wait
Provider permit wait
Approval wait
Outbox/offline wait
Reconnect/sync/replay/snapshot
Waiting for reset
Maintenance
Total elapsed
```

Persist UTC timestamps; show user/system timezone in 24-hour form by default.

## Agent/Goal/Crew lineage

Every child can carry:

```text
Parent turn/Goal/Plan
Agent/subagent ID
Crew/template/role
Provider/account/connection/model
Start/finish
Tokens/cache/cost
Queue/throttle time
Retry/fallback
Worktree/host/environment
```

## Operational admission

Detailed Usage/diagnostics may record why work queued:

```text
Provider capacity
Worktree capacity
Port conflict
File writer conflict
Browser/test/device capacity
Host CPU/memory/GPU/disk pressure
Waiting for reset
Waiting for update/repair
```

Do not present wait time as provider-active model work.

## Cross-project

Cross-project events retain source/destination Project, grant scope, read/write boundary, route, worktree, and receipt.

## Current-state return to Settings

Settings may consume compact read-only projections:

```text
Included usage remaining
Extra balance
Packs/resets
Pressure
Next reset/cooldown
Post-plan rate
Last success/failure
Cache state
Run-out projection
Source freshness
Data quality
```

Usage does not own the policy controls.
