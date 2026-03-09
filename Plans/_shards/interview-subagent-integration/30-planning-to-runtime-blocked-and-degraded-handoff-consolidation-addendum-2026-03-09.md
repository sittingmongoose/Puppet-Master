## Planning-to-Runtime Blocked and Degraded Handoff Consolidation Addendum (2026-03-09)

Interview and planning flows that influence decomposition MUST hand off blocked and degraded state without ambiguity.
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### Required handoff state
Persist and hand off:
- active `replan_generation`
- degradation reason
- degraded/not-degraded marker
- latest quality/report ref
- user-visible explanation shown at resume time
- whether the degraded draft was later replaced before graph lock
- whether runtime execution has started yet

### Runtime boundary rule
Degraded flat draft sequencing is a planning-stage fallback only. Canonical runtime execution begins only after graph lock. If graph lock has not occurred, the handoff remains in planning/wizard/interview state rather than executable runtime state.

### Blocked-state rule
Interview-originated clarification exhaustion uses the same `attention_required` -> `blocked` escalation rules and `blocked_reason_code = clarification_blocked` as the wizard packet.
