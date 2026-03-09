## Queue Analysis / Attempt Lineage Reconciliation Addendum (2026-03-09)

The run graph is the canonical node-level surface for scheduler and recovery diagnostics.

### Required detail sections
The detail panel MUST show:
1. current execution status and generation
2. current attempt identity and most recent stale attempt identity when one exists
3. scheduler score breakdown and last queue-analysis reason
4. blocked or failed classification with exact reason codes
5. recovery actions available now
6. safe-point creation/restore history and latest restore outcome
7. remediation lineage, generations, and linked finding identifiers
8. evidence/artifacts for the selected attempt

### State rendering rules
- blocked, retrying/backoff, remediation-in-progress, and terminal failure MUST render as distinct states
- stale attempts MUST be visibly marked as historical and non-resumable
- safe-point details MUST explicitly distinguish runtime safe points from user-facing restore points
