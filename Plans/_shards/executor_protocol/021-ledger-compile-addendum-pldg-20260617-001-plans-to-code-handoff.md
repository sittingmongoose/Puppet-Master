# Shard 021: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Executor_Protocol.md`

Source lines: L5899-L6172

Source SHA256: `59ce0d71f0d06c16fda1878df12a1adab67123f1b818c2435be3add28bf29932`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### EP-099 - Executor Intake For WorkNode Requests

```yaml
plan_unit_id: EP-099
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
    WorkNode requests become runnable only after Executor intake validates graph integrity, source-control requirements, test bindings, model routing, authority requirements, readiness prerequisites, and scheduler metadata. ExecutorIntakeReport is the boundary artifact proving that a WorkNodeRequest was accepted, rejected, or blocked. When explicitly enabled later, PlanCompile may draft non-executable requests and WorkGraph drafts only; Executor owns runnable dispatch, ready-state evaluation, capacity-aware scheduling, retry/backoff, blocked-state recovery, and failure-class recovery.
gui_related: false
gui_classification_reason: Intake, scheduling, retry, and blocked recovery are runtime protocol behavior, not visual presentation.
depends_on: [EP-098, PNC-013]
unblocks: [EP-100, EP-101, EP-102, GRS-030]
acceptance_criteria:
  - WorkNodeRequest records cannot bypass Executor intake.
  - ExecutorIntakeReport validates graph integrity, source-control/test/model/authority metadata, readiness prerequisites, and scheduler metadata.
  - PlanCompile remains unable to dispatch runnable WorkNodes directly.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: executor_intake_bypass
reasoning_tier: high
context_scope: executor_worknode_request_intake
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Plan_To_Node_Compilation.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: executor_intake_boundary, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0016
  - pldg-20260617-001-plans-to-code-handoff:atom-0042
  - pldg-20260617-001-plans-to-code-handoff:dec-0005
preserved_exact_tokens:
  - "ExecutorIntakeReport"
  - "WorkNodeRequest"
  - "readiness prerequisites"
  - "Executor intake"
  - "not runnable WorkNodes"
negative_constraints:
  - Do not let WorkNodeRequest bypass Executor intake.
  - Do not let PlanCompile directly dispatch worker execution.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Plan_To_Node_Compilation.md
```

### EP-100 - Source-Control And Model Preflight Execution Context

```yaml
plan_unit_id: EP-100
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor intake and dispatch must establish a source-control execution context and model-resolution context before mutation-capable work starts. The execution context preserves repo_id, worktree_id, worktree_path, branch_ref, branch_head_state, baseline_commit_oid, head_commit_oid, safe_point_id, changed_files, conflict_refs, dirty_state_policy, conflict_policy, merge_policy, github_policy, rollback_available, rollback_ref, and restore_command_or_action. Model routing preserves requested_lane, requested_model_profile, effective_model_profile, fallback_used, fallback_reason, and capability_checks. PlanCompile does not own source control; source control, worktrees, safe points, snapshots, rollback, FileSafe, and GitHub promotion apply after Executor accepts WorkNode requests.
  This PlanUnit is the source-control execution contract, and GitHub optional promotion cannot replace local execution truth.
gui_related: false
gui_classification_reason: Execution preflight and model receipt fields are backend runtime contracts.
depends_on: [EP-099, MS-111, W-072, F2-189]
unblocks: [EP-102, POA-048, RAP-029]
acceptance_criteria:
  - Mutation-capable WorkNodes have repo/worktree/baseline/safe-point context before risky execution.
  - Model resolution receipts are captured before dispatch and visible to receipt consumers.
  - GitHub is optional promotion/output and local source-control/worktree state remains execution truth.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: unsafe_execution_context
reasoning_tier: high
context_scope: executor_preflight_context
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md, Plans/FileSafe.md, Plans/Models_System.md, Plans/GitHub_Integration.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: source_control_and_model_preflight, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0024
  - pldg-20260617-001-plans-to-code-handoff:atom-0035
  - pldg-20260617-001-plans-to-code-handoff:atom-0038
  - pldg-20260617-001-plans-to-code-handoff:dec-0015
preserved_exact_tokens:
  - "source-control execution contract"
  - "worktrees"
  - "snapshots"
  - "safe points"
  - "branch_head_state"
  - "head_commit_oid"
  - "changed_files"
  - "conflict_refs"
  - "rollback_ref"
  - "rollback"
  - "FileSafe"
  - "GitHub optional"
  - "PR"
  - "GitHub Actions"
  - "local source-control truth"
  - "requested_model_profile"
  - "effective_model_profile"
negative_constraints:
  - Do not make PlanCompile own source-control mutation.
  - Do not require GitHub for local-only project completion.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FileSafe.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### EP-101 - Automated Test Binding Intake

```yaml
plan_unit_id: EP-101
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor intake must validate WorkNode test_binding fields before dispatch: required capabilities, required harnesses, generated/reused tests, generated_test_ids, reused_test_ids, completion commands, browser/session requirements, emulator requirements, visual evidence requirements, flake policy, expected artifacts, and test_gap_policy. WorkNode completion cannot depend on human eyeballing. If automatic verification is unavailable, Executor blocks the WorkNode or requests test-harness work rather than marking it complete.
  Executor test intake preserves generated_test_ids, reused_test_ids, browser_session_required, visual_evidence_required, browser/GUI/device sessions, and manual_only_acceptance_not_allowed before completion is accepted.
gui_related: true
gui_classification_reason: Browser/session requirements, emulator requirements, screenshots, and visual evidence are user-visible verification surfaces.
depends_on: [EP-099, ATS-003, ATS-004]
unblocks: [EP-102, GRS-030, RAP-029]
acceptance_criteria:
  - Test binding is validated during Executor intake before runnable dispatch.
  - Manual-only acceptance is not sufficient for WorkNode completion.
  - Test gaps become blockers or harness work.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: unverified_execution_completion
reasoning_tier: high
context_scope: executor_test_binding
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Automated_Testing_System.md, Plans/Runtime_Artifacts_Panel.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: executor_test_binding_intake, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0029
  - pldg-20260617-001-plans-to-code-handoff:atom-0033
  - pldg-20260617-001-plans-to-code-handoff:atom-0034
  - pldg-20260617-001-plans-to-code-handoff:dec-0012
  - pldg-20260617-001-plans-to-code-handoff:dec-0013
preserved_exact_tokens:
  - "test_binding"
  - "reused_test_ids"
  - "browser_session_required"
  - "visual_evidence_required"
  - "test_gap_policy"
  - "100% automated"
  - "no human intervention"
  - "test capability blocker"
  - "test-harness WorkNode"
negative_constraints:
  - Do not make manual visual inspection a required completion step.
  - Do not silently allow unverifiable WorkNodes.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Automated_Testing_System.md
```

### EP-102 - Failure Signatures, Loop Breakers, And Plan Changes

```yaml
plan_unit_id: EP-102
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor repair loops preserve failure_signature records with kind, normalized_key, attempt_count, last_safe_point_id, last_repair_worknode_id, overseer_reviewed, auditor_reviewed, repeated_failure_policy, escalation_lane, user_escalation_allowed, and last evidence refs. Repeated failures escalate internally through normal repair, Auditor classification, Overseer graph/work/model/source-control/test-harness repair, High-Effort/Auditor deep repair, and only then critical user escalation unless explicit HITL policy requires earlier intervention. If Plans change during execution, PlanChangeDetected pauses affected lanes, a PlanDiffImpactReport classifies nodes as unaffected, needs_recompile, invalidated, or already_safe, and Executor resumes only after graph patching/replan work and currentness gates. The ledger phrase create replan WorkNodes is disposed for this phase as future runtime-enabled replan work only; current Plans-to-code contracts do not create replan WorkNodes.
  Failure signatures expose failure_signature.kind, and external-effect preflights preserve network_access_policy, secret_access_policy, and destructive_command_policy before risky repair or execution continues. Overseer review and High-Effort Worker escalation remain internal repair routes before critical user escalation.
gui_related: false
gui_classification_reason: Loop-breaker and PlanChangeDetected policy is runtime orchestration behavior.
depends_on: [EP-099, EP-100, EP-101, GRS-029, PS-116]
unblocks: [GRS-030, POA-048]
acceptance_criteria:
  - Failure signatures are normalized and counted across repair attempts.
  - Repeated failures route internally before user escalation in default mode.
  - Plan changes pause affected lanes and require impact classification before resume.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future failure_signature and PlanDiffImpactReport validation
risk_class: infinite_repair_loop
reasoning_tier: high
context_scope: executor_repair_loop_breakers
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md, Plans/Permissions_System.md, Plans/Project_Output_Artifacts.md]
node_compile_hint: {mode: executor_loop_breaker_policy, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0046
  - pldg-20260617-001-plans-to-code-handoff:atom-0047
  - pldg-20260617-001-plans-to-code-handoff:atom-0048
  - pldg-20260617-001-plans-to-code-handoff:dec-0020
  - pldg-20260617-001-plans-to-code-handoff:dec-0021
  - pldg-20260617-001-plans-to-code-handoff:corr-0009
preserved_exact_tokens:
  - "failure_signature"
  - "normalized_key"
  - "attempt_count"
  - "repeated_failure_policy"
  - "escalation_lane"
  - "Auditor classification"
  - "Overseer review"
  - "High-Effort Worker"
  - "critical user escalation"
  - "PlanChangeDetected"
  - "PlanDiffImpactReport"
  - "needs_recompile"
  - "invalidated"
  - "currentness gate"
negative_constraints:
  - Do not jump to user decision because a low-quality agent got stuck.
  - Do not create replan WorkNodes in this design-only phase.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
```

### EP-103 - Plans-To-Code Execution Receipt Chain

```yaml
plan_unit_id: EP-103
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor contributes the execution side of the Plans-to-Code Handoff Matrix. A complete WorkNode execution flow emits worknode_dispatch_receipt, source_control_preflight_receipt, safe_point_receipt, worknode_change_receipt, test_run_receipt, auditor_verification_receipt, repair_attempt_receipt when needed, merge_or_promotion_receipt when applicable, worknode_completion_receipt, and finalization evidence. Each transition records source artifact, destination artifact, owner, validator, receipt, retry route, rollback route, and user escalation condition. Worker claims are never enough to certify code complete.
  The receipt chain preserves source_artifact, destination_artifact, retry_route, rollback_route, all WorkNodes terminal, all automated tests passed or dispositioned, and artifact-backed handoff evidence before code completion is certified. The source-control chain must preserve the same repo_id, worktree_id, worktree_path, branch_ref, branch_head_state, baseline_commit_oid, head_commit_oid, safe_point_id, changed_files, conflict_refs, rollback_available, rollback_ref, and restore_command_or_action through preflight, safe point creation, mutation/change, optional promotion, finalization, and completion certification.
gui_related: false
gui_classification_reason: Execution receipts and certification handoffs are runtime/evidence contracts.
depends_on: [EP-099, EP-100, EP-101, EP-102, PNC-014]
unblocks: [GRS-030, POA-048, RAP-029, CV-289]
acceptance_criteria:
  - Every Executor handoff has artifact, owner, validator, receipt, retry, rollback, and escalation fields.
  - WorkNode execution receipts distinguish dispatch, preflight, safe point, change, test, audit, repair, promotion, and completion.
  - Code completion is certified from receipts, tests, source-control state, Auditor result, blockers, and final evidence, not worker prose.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: false_completion
reasoning_tier: high
context_scope: plans_to_code_execution_receipts
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: execution_receipt_chain, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0039
  - pldg-20260617-001-plans-to-code-handoff:atom-0040
  - pldg-20260617-001-plans-to-code-handoff:atom-0041
  - pldg-20260617-001-plans-to-code-handoff:atom-0043
  - pldg-20260617-001-plans-to-code-handoff:dec-0016
  - pldg-20260617-001-plans-to-code-handoff:dec-0017
  - pldg-20260617-001-plans-to-code-handoff:dec-0018
preserved_exact_tokens:
  - "worknode_dispatch_receipt"
  - "source_control_preflight_receipt"
  - "safe_point_receipt"
  - "worknode_change_receipt"
  - "test_run_receipt"
  - "auditor_verification_receipt"
  - "repair_attempt_receipt"
  - "worknode_completion_receipt"
  - "Plans-to-Code Handoff Matrix"
  - "artifact-backed handoff"
  - "worker says done is insufficient"
  - "branch_head_state"
  - "baseline_commit_oid"
  - "head_commit_oid"
  - "safe_point_id"
  - "changed_files"
  - "conflict_refs"
  - "rollback_ref"
negative_constraints:
  - Do not accept worker says done as code completion.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Runtime_Artifacts_Panel.md
