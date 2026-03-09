## Interview Blocked / Degradation Handoff Reconciliation Addendum (2026-03-09)

Interview-stage flows must hand off blocked and degraded planning state without ambiguity.

### Clarification path rule
- while the current clarification loop can still resolve the issue set, use `attention_required`
- when the clarification round budget is exhausted or the required next step is outside the current flow, escalate to `blocked`
- preserve the provisional bundle, latest report, active generation, and degradation status for resume

### Degradation handoff rule
If draft decomposition degraded before graph lock, Interview MUST persist:
- degradation reason
- degraded/not-degraded marker
- the user-visible explanation shown at resume time
- whether the degraded draft was later replaced before canonical lock
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md
