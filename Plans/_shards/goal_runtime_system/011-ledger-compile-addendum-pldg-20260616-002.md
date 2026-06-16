# Shard 011: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Goal_Runtime_System.md`

Source lines: L1751-L1874

Source SHA256: `6a4c063ee97d85c2bdb619731929673b2ac9cdf22b7fd1e05fa7603f53075e06`

---

## Ledger Compile Addendum - pldg-20260616-002

### GRS-026 - Orchestrator GoalRun Runtime Envelope

```yaml
plan_unit_id: GRS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime is the durable objective, authority, child-work, evidence, repair, and certification envelope for Orchestrator GoalRuns. It governs GoalRun phase, scope, write authority, child goals and SubagentWaves, evidence expectations, completion criteria, replan events, blockers, receipts, and final certification while Orchestrator owns user-visible projections and Executor owns scheduler truth.
gui_related: false
gui_classification_reason: Runtime authority, state, receipts, and certification behavior are orchestration/control-plane behavior, not visual presentation.
depends_on: [GRS-002, GRS-005, GRS-012, GRS-016, GRS-017, OP-020, EP-097]
unblocks: [OP-022, OSI-428, EP-098, CV-288]
acceptance_criteria:
  - Orchestrator GoalRuns use Goal Runtime as the control envelope without replacing Orchestrator projections.
  - Executor/runtime scheduler remains the canonical owner for readiness, blocked overlays, retry/backoff, capacity, wakeups, and dispatch.
  - GoalRun completion requires receipt-backed certification rather than worker, subagent, or WorkNode success alone.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow
risk_class: orchestrator_runtime_authority_drift
reasoning_tier: high
context_scope: orchestrator_goal_runtime
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md]
node_compile_hint: {mode: orchestrator_goal_runtime_envelope, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0002
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0003
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0006
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0011
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0039
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0040
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0047
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0048
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0089
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0095
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0001
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0006
preserved_exact_tokens:
  - "Goal Runtime"
  - "Orchestrator"
  - "control envelope"
  - "GoalRun"
  - "WorkGraph"
  - "WorkNode"
  - "SubagentWave"
  - "GoalCompletionReceipt"
  - "Completion requires receipt-backed certification"
negative_constraints:
  - Do not make Goal Runtime replace Orchestrator UI/projections or Executor scheduler truth.
  - Do not dispatch graph nodes directly from Goal Runtime when Executor scheduling truth exists.
  - Do not mark tasks or goals complete only because a worker reports success.
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md]
```

### GRS-027 - Verification Repair Loop And Certification Policy

```yaml
plan_unit_id: GRS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Orchestrator GoalRuns treat execution success as provisional. VerificationCycle failures create findings and DefectBundles, repair WorkNodes or repair subgoals run under bounded authority, and verification reruns against the affected target plus regression scope until zero findings remain or a true blocker or authority boundary is reached. Two repeated same-signature failures force strategy adjustment, and the third failed cycle escalates to a high-end adjudicator or root-cause replan.
gui_related: false
gui_classification_reason: Verification, repair, receipts, and certification policy are runtime/governance behavior, not GUI implementation.
depends_on: [GRS-010, GRS-012, GRS-013, GRS-014, GRS-019]
unblocks: [OP-022, EP-098, CV-288, RAP-027]
acceptance_criteria:
  - A failed VerificationCycle cannot become a done-with-issues completion state.
  - Verification reruns after every repair before a WorkNode, child goal, or GoalRun is certified.
  - Repeated defect signatures trigger strategy adjustment after two repeats and high-end adjudication/root-cause replan on the third failed cycle.
  - Cost controls may reduce exploratory fanout but cannot disable required verification, receipts, independent review, or certification gates.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime verification-loop tests
risk_class: false_completion
reasoning_tier: high
context_scope: orchestrator_verification_repair
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: verification_repair_loop_policy, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0019
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0020
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0038
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0043
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0044
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0045
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0046
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0049
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0050
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0051
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0052
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0053
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0054
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0055
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0090
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0092
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0094
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0100
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0024
preserved_exact_tokens:
  - "verify again"
  - "keep doing that flow until it stops finding issues"
  - "zero findings remain"
  - "VerificationReceipt"
  - "DefectBundle"
  - "RepairWorkNode"
  - "defect signature"
  - "two repeats"
  - "third failed cycle"
  - "high-end adjudicator"
negative_constraints:
  - Do not allow a failed verification to become a done-with-issues state.
  - Do not reduce audit/verification strictness to save cost.
  - Do not keep applying the same low-end patch indefinitely.
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Progression_Gates.md]
```
