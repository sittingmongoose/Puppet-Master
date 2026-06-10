# Shard 029: Runtime Scheduler / Blocked-State GUI Parity Addendum (2026-03-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L2879-L2899

Source SHA256: `1074b6a34eb9c96664250a0ebadca7944d9295c74022d594254fceccd385d69e`

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
