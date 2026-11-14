# Shard 020: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Executor_Protocol.md`

Source lines: L6080-L6144

Source SHA256: `2572ffbe8bea64b72cb8dd8446a5265ad01885bf6fe90b1c3ea1fb279de194fc`

---

## Ledger Compile Addendum - pldg-20260616-002

### EP-098 - GoalRun WorkNode Scheduler Boundary

```yaml
plan_unit_id: EP-098
unit_type: requirement
status: retired
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  RETIRED BY DL-478 (Jared, 2026-11-12, "Sweep and retire all") -- NOT ACTIVE CURRENT-PRODUCT TRUTH. The GoalRun decomposition, verification, repair, and certification dispatch flow is retired; the old text is retained only for source lineage.
  Executor/runtime scheduler owns concrete runnable WorkNode dispatch for Orchestrator GoalRuns. Goal Runtime and Orchestrator may define objectives, WorkGraph shape, WorkNode requests, verification requirements, receipts, and projections, but Executor remains authoritative for readiness, dependency, blocked-state, retry/backoff, wakeups, capacity-aware parallel dispatch, and failure-class recovery. High-end controller/planner decomposition may decompose objectives into a WorkGraph and bounded WorkNodes as runnable work requests, but concrete dispatch remains gated by Executor readiness and scheduler policy. WorkNode execution success is provisional until verification and receipt certification complete.
  A failed VerificationCycle yields typed VerificationFinding records grouped in a DefectBundle; Executor schedules bounded RepairWorkNodes under its intake, readiness, write-authority, and retry policies, then verification reruns against the affected target plus regression scope after each repair. The loop continues until zero findings remain or a true blocker or authority boundary is reached; a failed verification cannot be reported as successful completion.
gui_related: false
gui_classification_reason: Scheduler ownership, dispatch, retry/backoff, capacity, and provisional execution semantics are runtime behavior, not visual presentation.
depends_on: [GRS-026, GRS-027, PNC-009, PS-115, W-071]
unblocks: [OP-022, RGV-012, RAP-027]
acceptance_criteria:
  - No product work or acceptance obligation is compiled from this retired unit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Executor WorkNode scheduler integration tests
risk_class: scheduler_boundary_drift
reasoning_tier: high
context_scope: executor_goalrun_worknode_dispatch
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: goalrun_worknode_scheduler_boundary, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0009
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0013
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0017
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0020
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0041
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0042
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0043
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0048
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0049
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0054
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0076
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0085
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0086
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0007
preserved_exact_tokens:
  - "VerificationFinding"
  - "DefectBundle"
  - "RepairWorkNode"
  - "zero findings remain"
  - "true blocker"
  - "readiness"
  - "blocked state"
  - "retry/backoff"
  - "capacity-aware dispatch"
  - "failure-class recovery"
  - "ready WorkNodes"
  - "bounded executable unit"
  - "decomposes"
  - "bounded WorkNodes"
  - "runnable work"
  - "Execution success is not completion"
negative_constraints:
  - Do not bypass blocked/backoff/capacity semantics.
  - Do not let WorkNode executors certify global completion.
  - Do not treat design-time WorkNode terms as permission to create runtime work artifacts.
owner_hints: [Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
```
