## Runtime Safe-Point Clarification Addendum (2026-03-08)

### 1. Restore points vs safe points

Existing restore-point and rollback features remain valid, but this packet introduces a separate runtime safe-point concept.

Required distinction:
- restore point = user-facing history / rewind anchor
- rollback = explicit requested/confirmed restoration flow
- safe point = runtime-internal retry/remediation anchor created before risky execution

### 2. Recovery UX

Interrupted-run recovery may reference both:
- user-facing restore/resume state
- runtime safe-point status for the current attempt lineage

The UI must not collapse them into one concept.

### 3. Acceptance criteria

- The product distinguishes safe-point recovery from history/rollback recovery.
- Recovery UI copy makes the distinction clear.
