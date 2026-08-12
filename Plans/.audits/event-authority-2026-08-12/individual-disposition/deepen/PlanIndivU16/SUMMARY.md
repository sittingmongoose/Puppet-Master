# PlanIndivU16 deepening summary

- Input: `individual-disposition/shards/indiv_unreg_16.json`
- Rows deepened: 10
- Immutable cohort pin: `july248` on every row
- Working bucket: `confirmed_persisted_unregistered` on every row
- Dispositions: 10 `NEEDS_OWNER_VETO`
- Admission decisions: none
- Every row is a non-provisional individual adjudication, not an admission decision.
- Owner and producer authority were not inferred from namespaces, family tables, storage ownership, or projection ownership.
- Residual vetoes remain agent-local and are not a finalized owner sheet.
