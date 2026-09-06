# Shard 009: Retired Goal structure and negative ownership

Source: `Plans/Goal_Runtime_System.md`

Source lines: L235-L249

Source SHA256: `62576d2ba5cc5495c0ec34c833274975525938d5686d0e4b45924cbb8a0fed2c`

---

## Retired Goal structure and negative ownership

The following are retired from Goal Runtime. They are not deprecated-but-tolerated; an active Goal V2 record, projection, event, command, or GUI surface that carries any of them is a defect.

- **Goal phases.** No phase list, no `currentPhaseId`, no phase status, no phase exit criterion, no phase-bound evidence, no phase-bound attachment snapshot, no phase stepper, and no phase-derived progress bar.
- **Goal tranches.** No tranche grouping, no tranche budget, no tranche admission.
- **Child Goals.** No child-goal topology, no parent completion authority over children, no child write leases, no subgoal tree display, and no "3 child goals active" projection. Work that used to be a child Goal is either a To-Do under `Plans/ToDo_Runtime.md`, a participant under `Plans/Collaborative_Workflows.md`, or a separate Goal with no parent edge.
- **Goal budgets.** No Goal-owned token, cost, turn, or wall-clock budget. Usage truth belongs to `Plans/usage-feature.md`; quota waiting belongs to `Plans/Scheduling_and_Quota_Resume.md`.
- **Mandatory role cast.** No Goal-specific planner, evaluator, verifier, or adjudicator role is required to run a Goal. Where a workflow genuinely needs a reviewer, that reviewer is a Review run under `Plans/Collaborative_Workflows.md` or a certification step under the workflow's own owner, selected by that owner rather than imposed by Goal.

Goal also does not own, and must not duplicate: To-Do state, Plan documents, ledgers, PlanUnits, WorkNodes, Orchestrator scheduling, schedules and execution windows, quota and reset truth, artifact version and retention, permission grants, Persona or model identity, thread or message lifecycle, or context materialization.

Back Seat Driver is never a required step in a Goal. `Plans/Back_Seat_Driver.md` is read-only advice, and a Goal must complete, pause, block, or cancel identically whether BSD is Off, Auto, On, degraded, or quarantined.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/usage-feature.md, ContractName:Plans/DRY_Rules.md
