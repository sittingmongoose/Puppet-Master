# Shard 012: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Goal_Runtime_System.md`

Source lines: L1844-L2036

Source SHA256: `50159de77b54714b528deb77faf74dd1eb9725125f226d21e6e39e19a4357c4d`

---

## Ledger Compile Addendum - pldg-20260616-002

### GRS-026 - Orchestrator GoalRun Runtime Envelope

```yaml
plan_unit_id: GRS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime is the durable objective, authority, child-work, evidence, repair, and certification envelope for Orchestrator GoalRuns. It governs GoalRun phase, scope, write authority, child goals and SubagentWaves, evidence expectations, completion criteria, replan events, blockers, receipts, and final certification while Orchestrator owns user-visible projections and Executor owns scheduler truth. The lifecycle sequence preserves GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification without changing Executor dispatch ownership. Replan records preserve affected WorkNodes, cancelled or re-steered child work, remaining valid evidence, new revision, and next action without replacing the existing Goal Replan Event owner policy. GoalRun write authority consumes write_mode values read_only, proposal_only, patch_only, isolated_worktree, leased_writer, and parent_writer through Permissions and Worktree owners rather than re-owning permission enforcement.
gui_related: false
gui_classification_reason: Runtime authority, state, receipts, and certification behavior are orchestration/control-plane behavior, not visual presentation.
depends_on: [GRS-002, GRS-005, GRS-012, GRS-016, GRS-017, OP-020, EP-097]
unblocks: [OP-022, OSI-428, EP-098, CV-288]
acceptance_criteria:
  - Orchestrator GoalRuns use Goal Runtime as the control envelope without replacing Orchestrator projections.
  - The GoalRun lifecycle preserves GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification.
  - Executor/runtime scheduler remains the canonical owner for readiness, blocked overlays, retry/backoff, capacity, wakeups, and dispatch.
  - GoalRun completion requires receipt-backed certification rather than worker, subagent, or WorkNode success alone.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow
risk_class: orchestrator_runtime_authority_drift
reasoning_tier: high
context_scope: orchestrator_goal_runtime
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: orchestrator_goal_runtime_envelope, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0002
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0003
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0006
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0009
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0011
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0013
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0039
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0040
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0047
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0048
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0089
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0095
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0001
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0006
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0007
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
  - "isolated_worktree"
  - "GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification"
  - "affected WorkNodes"
  - "cancelled"
  - "re-steered"
  - "remaining valid evidence"
  - "new revision"
  - "next action"
negative_constraints:
  - Do not make Goal Runtime replace Orchestrator UI/projections or Executor scheduler truth.
  - Do not dispatch graph nodes directly from Goal Runtime when Executor scheduling truth exists.
  - Do not mark tasks or goals complete only because a worker reports success.
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
```

### GRS-027 - Verification Repair Loop And Certification Policy

```yaml
plan_unit_id: GRS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Orchestrator GoalRuns treat execution success as provisional. VerificationCycle failures create typed VerificationFinding records, findings, and DefectBundles, repair WorkNodes or repair subgoals run under bounded authority, and verification reruns against the affected target plus regression scope until zero findings remain or a true blocker or authority boundary is reached. Runtime policy consumes the contract-owned VerificationCycle example shape with verification_cycle_id, target_ref, attempt, status failed | passed | blocked, findings, defect_signatures, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, repair_strategy, and next_required_action without re-owning the schema. VerificationReceipt records verifier identity, findings, defect signatures, passed/failed/skipped validator outputs, repair-cycle refs, and regression checks. WorkNodeReceipt records executor identity, input refs, output refs, changed artifacts, validators run, evidence refs, and unresolved risks. GoalCompletionReceipt records child receipts, WorkNode receipts, changed artifacts, validator outcomes, authority checks, and final certifier decision. Repair strategy values include patch, replan, split_node, merge_node, widen_context, rollback, escalate_capability_lane, assign_specialist_subagents, manual_decision, and authority_blocked. Acceptance checks require acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence. Controller, planner, executor, reviewer, verifier, adjudicator, certifier, root_cause, and replan roles remain distinct when verifying or certifying repair loops. Validator failure, verifier unavailable, and repair budget exhaustion produce blocked or degraded outcomes rather than certified complete. Two consecutive failed verification cycles with the same defect signature force strategy adjustment, and the third failed cycle escalates to a high-end adjudicator or root_cause replan.
gui_related: false
gui_classification_reason: Verification, repair, receipts, and certification policy are runtime/governance behavior, not GUI implementation.
depends_on: [GRS-010, GRS-012, GRS-013, GRS-014, GRS-019]
unblocks: [OP-022, EP-098, CV-288, RAP-027]
acceptance_criteria:
  - A failed VerificationCycle cannot become a done-with-issues completion state.
  - Verification reruns after every repair before a WorkNode, child goal, or GoalRun is certified.
  - Runtime verification policy consumes the contract-owned VerificationCycle example shape, preserving attempt, failed | passed | blocked, typed VerificationFinding details, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, next_required_action, and defect_signatures without re-owning schema.
  - Repeated defect signatures trigger strategy adjustment after two consecutive failed verification cycles and high-end adjudication/root_cause replan on the third failed cycle.
  - VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt preserve verifier/executor/certifier identity, changed artifacts, validator outcomes, evidence refs, unresolved risks, authority checks, and repair-cycle refs.
  - Repair strategy and evidence taxonomy values remain explicit rather than compressed into generic retry language.
  - Cost controls may reduce exploratory fanout but cannot disable required verification, receipts, independent review, or certification gates.
  - Validator failure, verifier unavailable, and repair budget exhaustion cannot be certified complete as normal success.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime verification-loop tests
risk_class: false_completion
reasoning_tier: high
context_scope: orchestrator_verification_repair
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: verification_repair_loop_policy, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0019
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0020
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0035
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
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
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0065
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0066
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0067
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
  - "WorkNodeReceipt"
  - "GoalCompletionReceipt"
  - "passed/failed/skipped"
  - "repair-cycle refs"
  - "regression checks"
  - "executor identity"
  - "input refs"
  - "output refs"
  - "changed artifacts"
  - "validators run"
  - "evidence refs"
  - "unresolved risks"
  - "validator outcomes"
  - "authority checks"
  - "final certifier decision"
  - "VerificationFinding"
  - "DefectBundle"
  - "RepairWorkNode"
  - "finding type"
  - "failing check"
  - "affected artifact/path/span"
  - "root_cause_key"
  - "prior repair strategies"
  - "defect signature"
  - "two consecutive failed verification cycles"
  - "two repeats"
  - "third failed cycle"
  - "high-end adjudicator"
  - "root_cause"
  - "patch"
  - "replan"
  - "split_node"
  - "merge_node"
  - "widen_context"
  - "rollback"
  - "escalate_capability_lane"
  - "assign_specialist_subagents"
  - "manual_decision"
  - "authority_blocked"
  - "attempt"
  - "failed | passed | blocked"
  - "defect_signatures"
  - "controller"
  - "planner"
  - "reviewer"
  - "validator failure"
  - "verifier unavailable"
  - "budget exhaustion"
  - "blocked"
  - "degraded"
  - "certified complete"
negative_constraints:
  - Do not allow a failed verification to become a done-with-issues state.
  - Do not reduce audit/verification strictness to save cost.
  - Do not keep applying the same low-end patch indefinitely.
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/Progression_Gates.md]
```
