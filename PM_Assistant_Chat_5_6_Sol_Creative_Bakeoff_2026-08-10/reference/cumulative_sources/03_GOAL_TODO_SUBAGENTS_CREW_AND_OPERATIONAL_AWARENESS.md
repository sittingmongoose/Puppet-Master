# Goal, Todo, Subagents, Crew, and Operational Awareness

## Shared Goal Runtime

Assistant Chat projects the shared durable Goal Runtime:

```text
Objective
Phase
Progress
Todos
Subagents/child threads
Pause
Resume
Stop
Update
Replan
Evidence
Artifacts
Blocked state
Completion receipt
```

The UI is not the source of truth. Goal state survives compaction, thread death, server restart, client disconnect, and UI close.

Changing the parent thread's model/Persona/access does not silently retarget the active Goal. The user explicitly updates the Goal, creating a replan or safe-boundary change.

## Compact work presentation

Each concept must explore a distinct way to combine:

```text
Goal phase
Todo completion
Active/queued/blocked/failed/completed subagents
Searches and reads
Web/browser work
Tests
Edits
Diff summary
Verification
Artifacts
```

The default presentation is compact. Expansion reveals chronology, evidence, provider route, files, timings, and receipts.

Completed work condenses into a durable summary whose groups can be reopened.

## Subagents and threads

The demo must show at least three child agents on different routes, including:

```text
Running
Queued for sustainable capacity
Blocked
Completed
Stopped
Retried/fallback
```

Any agent may request another eligible agent. Orchestrator admits the request under provider, Usage, permission, nesting, worktree, file, port, and resource ceilings.

## Sustainable capacity

Chat may show:

```text
Requested specialists: 6
Recommended concurrent: 2
3 waves
Reason: provider allowance and verification reserve
```

This is a compact forecast, not a guarantee.

Required independent roles cannot be silently dropped.

## Crew

Crew is a multi-child execution strategy, not a Persona or mode.

Concepts should show:

```text
Crew template/roles
Members and routes
Concurrent and queued waves
Shared board/activity
Independent results
Parent reducer/synthesis
Usage/resource reason
```

Selecting a Crew in one thread does not affect another.

## Operational awareness

Agents can query:

```text
Active threads/Goals/runs
Files and areas in flight
Worktrees and leases
Ports/processes/services
Containers/VMs/WSL environments
Browser/test/debug/device sessions
CPU/memory/disk/GPU pressure
Provider allowance/reset/cooldown
Logs/backups/snapshots/restore points
```

Chat shows only compact task-relevant summaries and actionable conflicts.

Example:

> Port 3000 is used by the checkout redesign in another worktree. Use 3001 instead?

Details reveals owner/thread/worktree.

## Cross-project work

Default is denied.

Compact grant:

```text
This task will read Project A and modify Project B.
[Cancel] [Allow once] [Allow for this Goal] [Open Settings]
```

Read and write are distinct. One-time access never becomes persistent.

## Worktrees

Agents request worktree creation; Worktree Manager performs it. Show:

```text
Isolated and clean
Waiting for writer
Conflict detected
Patch preserved after failed merge
Cleanup pending
```

Do not let an agent silently remove another owner's worktree.
