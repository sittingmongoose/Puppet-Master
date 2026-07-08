# Shard 013: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Goal_Runtime_System.md`

Source lines: L2082-L2251

Source SHA256: `37f0a7aa5ab93f498be98c282237c78ad8a08981d14d989ca74a8c0fded6894a`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### GRS-028 - Planning Wizard Approval To PlanCompile Boundary

```yaml
plan_unit_id: GRS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Future native Planning Wizard approval may emit a PlanApproved event that invisibly starts native PlanCompile, creates a PlanCompileRun, and projects progress in Orchestrator only after a later enablement PlanUnit accepts that runtime launch. Until then, current bootstrap and design_only v1 PlanCompile records remain design-only and disabled; this disabled boundary does not disable the finished-product native_runtime branch once runtime_enablement_ref and runtime_policy_snapshot_ref exist. Planning Wizard, Plan Compiler supervision, PRD Builder structured conversion, and ledger-to-Plans conversion use Overseer Model semantics, while Auditor Model owns the Auditor audit-to-repair verification loop that repeats audit, bounded repair, and re-audit until completion is certified or a critical block or authority boundary stops the loop.
  Future native launch remains invisible to the user only after explicit enablement, and new records, prompts, and plan updates must use Planning Wizard terminology. Do not introduce new references or meta-comments using retired Chain Wizard or Plan Wizard names as active terminology.
gui_related: false
gui_classification_reason: Trigger and model-role boundary are runtime behavior; Orchestrator owns visible projection.
depends_on: [GRS-002, PNC-010, MS-110]
unblocks: [OP-023, F3-396]
acceptance_criteria:
  - Current bootstrap and design_only v1 PlanCompile launch remains disabled until explicit enablement.
  - Planning Wizard approval is the future trigger source, not this compile's runtime action.
  - Overseer and Auditor model roles are consumed from Models_System.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Goal Runtime PlanApproved integration review
risk_class: premature_runtime_launch
reasoning_tier: high
context_scope: planning_wizard_plancompile_trigger
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Models_System.md, Plans/Orchestrator_Page.md]
node_compile_hint: {mode: future_planning_wizard_plancompile_trigger, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0008
  - pldg-20260617-001-plans-to-code-handoff:atom-0009
  - pldg-20260617-001-plans-to-code-handoff:atom-0020
  - pldg-20260617-001-plans-to-code-handoff:atom-0022
  - pldg-20260617-001-plans-to-code-handoff:dec-0004
  - pldg-20260617-001-plans-to-code-handoff:dec-0008
  - pldg-20260617-001-plans-to-code-handoff:dec-0028
preserved_exact_tokens:
  - "Planning Wizard"
  - "Plan Wizard"
  - "PlanApproved event"
  - "PlanCompileRun"
  - "invisible to the user"
  - "Overseer Model"
  - "Auditor Model"
  - "Auditor audit-to-repair loop"
  - "critical block"
negative_constraints:
  - Do not enable this automatic launch yet.
  - Do not introduce new references using retired Chain Wizard or Plan Wizard names as active terminology.
compatibility_only_notes:
  - Pre-rename Plan Wizard tokens may remain in source_lineage, preserved_exact_tokens, historical migration notes, and compatibility aliases only.
stale_retired_dispositions:
  - Plan Wizard is retired as active product/runtime/compile terminology; current prose, PlanUnits, commands, events, prompts, and index rows use Planning Wizard.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Orchestrator_Page.md
```

### GRS-029 - Hands-Off Autonomy And HITL Boundary

```yaml
plan_unit_id: GRS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Plans-to-code execution defaults to hands-off autonomy. User escalation is last-resort for critical authority blockers: missing credentials or secrets, billing/payment/legal/license acceptance, unsafe destructive operation, irreversible external side effect, unrecoverable environment failure, true product decision with no inferable answer, or security-sensitive approval. HITL is an explicit setting or mode that can add configured package, seam, or critical checkpoints without becoming required for correctness. Default runtime repair routes ordinary uncertainty through Auditor, Overseer, graph/work/model/source-control/test-harness repair, and high-effort repair before asking the user.
  Configured checkpoints are HITL-only additions, while default escalation remains limited to credentials/secrets, billing/payment/legal/license acceptance, unsafe destructive operation, irreversible external side effect, and security-sensitive approval. Internal repair escalation uses Overseer review and High-Effort Worker routing before user escalation when evidence permits.
gui_related: false
gui_classification_reason: Autonomy, HITL, and escalation policy are runtime/permission behavior.
depends_on: [GRS-027, PS-116, HITL-036]
unblocks: [EP-102, GRS-030, OP-024]
acceptance_criteria:
  - Default mode is hands-off with critical-only user escalation.
  - HITL checkpoints are explicit opt-in behavior, not required correctness gates.
  - Ordinary row-level uncertainty is resolved internally when evidence allows.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future autonomy and HITL mode review
risk_class: unnecessary_user_escalation
reasoning_tier: high
context_scope: plans_to_code_autonomy
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Permissions_System.md, Plans/human-in-the-loop.md, Plans/Executor_Protocol.md]
node_compile_hint: {mode: autonomy_hitl_policy, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0044
  - pldg-20260617-001-plans-to-code-handoff:atom-0045
  - pldg-20260617-001-plans-to-code-handoff:atom-0046
  - pldg-20260617-001-plans-to-code-handoff:dec-0019
  - pldg-20260617-001-plans-to-code-handoff:dec-0020
  - pldg-20260617-001-plans-to-code-handoff:corr-0009
preserved_exact_tokens:
  - "HITL"
  - "hands-off"
  - "critical authority blockers"
  - "configured checkpoints"
  - "Overseer review"
  - "High-Effort Worker"
  - "credentials/secrets"
  - "billing/payment/legal/license"
  - "unsafe destructive operation"
  - "irreversible external side effect"
  - "security-sensitive approval"
negative_constraints:
  - Do not ask the user for ordinary row-level uncertainty in default mode.
  - Do not route default failures to user decision before Overseer/Auditor/internal repair paths are exhausted.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Permissions_System.md
  - Plans/Executor_Protocol.md
```

### GRS-030 - Plans-To-Code Goal Completion Certification

```yaml
plan_unit_id: GRS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Plans-to-code completion requires a GoalCompletionReceipt. Code complete means all WorkNodes are terminal with valid receipts, all required automated tests passed or are explicitly dispositioned, all source-control receipts are valid, rollback and safe-point requirements are satisfied, Auditor passed, no active blockers remain, no stale Plan/WorkGraph/currentness mismatch remains, final source state is clean or intentionally preserved, and final summary/evidence is written. GoalCompletionReceipt fields include rollback_requirements_satisfied, safe_point_requirements_satisfied, no_stale_plan_workgraph_currentness_mismatch, final_source_state, final_summary_ref, child_receipt_refs, worknode_receipt_refs, changed_artifact_refs, validator_outcomes, authority_check_refs, source_control_receipt_refs, test_receipt_refs, model_resolution_receipt_refs, unresolved_risks, and evidence_layers. Worker says done is insufficient; completion must preserve source evidence, canonical Plan evidence, process evidence, governance evidence, test evidence, source-control evidence, and completion receipts as separate truth layers.
  GoalCompletionReceipt certification requires the exact code-complete evidence that all WorkNodes terminal, all automated tests passed or were dispositioned, and no active blockers remain. Plans to code completion is an artifact-backed handoff where Auditor verifies before final certification.
gui_related: false
gui_classification_reason: Completion certification and evidence truth-layer policy are runtime/governance behavior.
depends_on: [GRS-027, GRS-029, EP-103, ATS-004]
unblocks: [RAP-029, CV-289, OP-024]
acceptance_criteria:
  - GoalCompletionReceipt proves code-complete status from objective receipt criteria.
  - Test, source-control, Auditor, blocker, currentness, and final evidence states are checked before completion.
  - Evidence truth layers remain separate and auditable.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: false_completion
reasoning_tier: high
context_scope: plans_to_code_completion
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: goal_completion_certification, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0043
  - pldg-20260617-001-plans-to-code-handoff:atom-0055
  - pldg-20260617-001-plans-to-code-handoff:atom-0060
  - pldg-20260617-001-plans-to-code-handoff:dec-0018
  - pldg-20260617-001-plans-to-code-handoff:dec-0023
preserved_exact_tokens:
  - "GoalCompletionReceipt"
  - "code complete"
  - "all WorkNodes terminal"
  - "all automated tests passed"
  - "no active blockers"
  - "source evidence"
  - "canonical evidence"
  - "process evidence"
  - "governance evidence"
  - "test evidence"
  - "source-control evidence"
  - "Plans to code completion"
  - "artifact-backed handoff"
  - "Auditor verifies"
  - "final certification"
negative_constraints:
  - Do not accept worker says done as code completion.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
  - Plans/Project_Output_Artifacts.md
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Models_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Project_Output_Artifacts.md
