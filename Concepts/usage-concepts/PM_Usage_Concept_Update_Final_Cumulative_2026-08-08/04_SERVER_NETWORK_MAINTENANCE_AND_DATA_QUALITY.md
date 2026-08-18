# Server, Network, Maintenance, and Data Quality

## Server-first lineage

Detailed records may carry:

```text
Project
Home Server
Execution Host
Execution Environment
Source Location
Client
Thread/Goal/Plan/agent/Crew
```

Default UI should remain compact and human.

Docker/TrueNAS/Unraid/Kubernetes Servers can execute without a desktop worker. Native Windows remains complete without WSL.

## Offline and synchronization

Track operational timing/events for:

```text
Client offline
Command outbox wait
Reconnect
Cursor replay
Snapshot catch-up
Domain synchronization
Hydration
Server work continuing
```

A slow thread load or offline client does not imply high provider Usage or stopped host work.

## Maintenance

Separate local/system maintenance from model usage:

```text
Provider CLI check/install/update/repair/rollback
Non-provider tool provisioning
PM app/content update
Catalog refresh
Backup/restore
Project Move
Server/client connection
Sound preview
Notification test-send
Search index rebuild
Storage compaction
```

If a maintenance flow invokes a model for verification, that provider call is a separate `validation` event.

Provider CLI update detail may include:

```text
Installation/host/environment
Check/schedule/wait/install/verify/rollback time
Failure class
Target version
Outcome
Affected connections
```

Do not add installer bytes/time to token totals.

## Notifications

Local sound preview is not Usage.

External notification test-send is operational activity. It may have a receipt but is not model Usage.

## Data quality

Every field carries one of:

```text
Provider reported
CLI reported
PM observed
Derived
Estimated
Unknown
Partial
Stale
```

Zero and unknown are distinct.

When usage telemetry is unavailable:

> Provider ready · Usage details unavailable

Cookie-based telemetry remains optional/experimental and must not gate provider readiness.

## Catalog and probes

Catalog source refresh is not the same as active model probing.

Probes can consume allowance. Attribute them as validation/probe Usage and avoid aggressive normal-user probing.

Models.dev and Free Coding Models source version/freshness belong in detailed diagnostics and historical snapshots.

## No Playwright labels

Use PM Browser Program or external Project test command. Do not create Playwright-shaped Usage categories for PM-owned browser work.
