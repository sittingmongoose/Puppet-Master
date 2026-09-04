# Shard 034: Compatibility/source-lineage - Runtime Scheduler / Blocked-State GUI Parity Addendum (2026-03-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L4580-L4600

Source SHA256: `d5dd0b8f0f130cf3a4834576d4ac87136d579819ec48bf6b3f165ac4874adc2b`

---

## Compatibility/source-lineage - Runtime Scheduler / Blocked-State GUI Parity Addendum (2026-03-09)

> **Superseded — see Canonical Blocked/Recovery Behavior below. Compatibility/source-lineage only.** This section preserves older parity wording; it is not a peer normative blocked/recovery section.

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
