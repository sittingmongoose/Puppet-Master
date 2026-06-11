# Shard 029: Runtime Scheduler / Blocked-State GUI Parity Addendum (2026-03-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L2881-L2901

Source SHA256: `e7d74c518f43fb85d1bcb78c9f41c6ecf73d29086b5c1f37693b3c4ed79ecdd2`

---

## Runtime Scheduler / Blocked-State GUI Parity Addendum (2026-03-09)

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

The GUI must expose the packet's runtime state without relying on hidden behavior.

### Required visible elements
- queue-analysis summary with last wake reason
- blocked-state badges and grouped blocked lists
- safe-point state and restore status where applicable
- remediation lineage navigation
- disabled-action explanations tied to canonical reason codes
- clear distinction between `attention_required`, `blocked`, `retrying`, and terminal failure

### Event-driven update rule


All scheduler, blocked, and remediation widgets MUST update from runtime events/projections rather than periodic timers.

### UX safety rule
If the GUI cannot perform a required action in the current mode, it must state why and point to the canonical recovery path. The GUI must not present controls that imply hidden fallback, hidden retry, or hidden re-auth behavior.
