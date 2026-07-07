# Shard 022: Runtime Integrity and Recovery Gates Addendum (2026-03-08)

Source: `Plans/Progression_Gates.md`

Source lines: L563-L605

Source SHA256: `8f884b510c35f1f7bceb11f6f55804f46405d0a8b5c37870a464e2adf399fb33`

---

## Runtime Integrity and Recovery Gates Addendum (2026-03-08)

Add the following gate expectations.

### 1. Canonical graph integrity gate

A run MUST NOT proceed into canonical execution when the canonical sharded graph is invalid, cyclic, or internally inconsistent.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, Gate:GATE-014

Required outcome:
- raise `graph_integrity` failure
- stop execution
- do not silently degrade to flat canonical execution

### 2. Safe-point-before-risk gate

Any mutation-capable attempt must have a valid runtime safe point before dispatch.

Missing safe point for a risky attempt is a gate failure.

### 3. Blocked-outcome correctness gate

UI/projections must keep blocked outcomes distinct from failures for:
- policy denial
- FileSafe blocks
- external side-effect confirmation blocks
- auth refresh blocks where the action never executed

### 4. Event-driven wakeup gate

Scheduler correctness must not depend on timer polling. Authoritative wakeups must be event-driven.

### 5. Wizard blocked-state gate

Wizard flows must recognize `blocked` as a canonical persisted state distinct from `attention_required`.

### 6. Acceptance criteria

- Invalid canonical graphs stop execution.
- Risky execution cannot run without a safe point.
- Blocked/failed semantics do not collapse into one UI state.
- Scheduler correctness does not depend on polling.
- Wizard blocked is treated as a real state, not a footnote.
