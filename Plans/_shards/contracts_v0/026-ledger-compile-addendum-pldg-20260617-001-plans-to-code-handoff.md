# Shard 026: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Contracts_V0.md`

Source lines: L17478-L17569

Source SHA256: `62ac536232f2fe0947cc864c88fcd075628826b7e5ef05a81530c5b15169a232`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### CV-289 - Plans-To-Code Shared Contract Envelope

```yaml
plan_unit_id: CV-289
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns shared envelope references for handoff_matrix, handoff_row, PlanCompileRun, stage_card, compile_worklist, NodeSeed candidate, NodeSeed review, WorkGraph draft, WorkNodeRequest, compiler model routing, Codex bootstrap work package, Codex external GUI-agent request, PlanCompile receipt, TestCapabilityReport, TestHarnessProbeReport, TestStrategy, test case, TestRunReceipt, visual evidence, source_control_receipt, source_control_preflight_receipt, safe_point_receipt, worknode_dispatch_receipt, worknode_change_receipt, worknode_completion_receipt, auditor_cycle_report, auditor_verification_receipt, repair_attempt_receipt, legacy validation_pass_report compatibility aliases, merge_or_promotion_receipt, source-control finalization receipt, model_resolution_receipt, ExecutorIntakeReport, WorkNode execution receipts, and GoalCompletionReceipt. These contract envelopes carry IDs, source refs, owner refs, validator refs, receipt refs, evidence refs, requested/effective model refs, source-control refs, authority refs, retry/rollback routes, user_escalation_condition, canonical enums, strict nested shapes, and source-control execution context while owner docs retain behavior semantics. The shared Plans/plans_to_code_handoff.schema.json document keeps top-level schema_id at pm.plans_to_code_handoff.v1; within that stable document identity, the current bootstrap/v1 design_only schema branch is historical and disabled, while CV-290 and PNC-015 own the runtime-aware v2 native_runtime branch.
  Shared contract envelopes name source_artifact, destination_artifact, retry_route, rollback_route, user_escalation_condition, and the `Plans/plans_to_code_handoff.schema.json` `$defs` for `handoff_matrix`, `handoff_row`, `plan_compile_run`, `node_seed_candidate`, `worknode_request`, `test_capability_report`, `source_control_receipt`, `source_control_preflight_receipt`, `worknode_dispatch_receipt`, `auditor_cycle_report`, `validation_pass_report`, and `goal_completion_receipt` without creating runtime artifacts. The plan_compile_run `$defs` distinguish the current design_only disabled branch from native_runtime records that require runtime enablement evidence. Low-context route and review fields use strict schema defs rather than free-form strings: stage_success_route, stage_blocked_route, compile_wave_retry_route, compile_worklist_blocked_route, node_seed_review_decision, and node_seed_reviewer_role. Historical per-artifact schema filename tokens `plan_compile_run.schema.json`, `node_seed_candidate.schema.json`, `worknode_request.schema.json`, and `test_capability_report.schema.json` are compatibility aliases for the single schema draft's `$defs`, not separate schema files.
gui_related: false
gui_classification_reason: Shared contract envelopes and schema references are backend schema work, not visual presentation.
depends_on: [CV-288, PNC-014, PNC-015, CV-290, EP-103, POA-048, MS-111, ATS-001]
unblocks: []
acceptance_criteria:
  - Shared envelope refs exist for PlanCompile, NodeSeed candidate, WorkGraph draft, WorkNodeRequest, testing, source-control, model, Executor intake, and completion receipt families.
  - Contract envelopes carry refs and cross-owner fields without replacing owner behavior semantics.
  - Per-artifact schema filename tokens resolve to $defs aliases in the single handoff schema while the current bootstrap/v1 design_only branch remains distinct from the runtime-aware v2 native_runtime branch.
  - The current bootstrap/v1 design_only branch remains disabled and does not create runtime artifacts; the runtime-aware v2 native_runtime branch remains gated by runtime enablement evidence.
  - Low-context route and NodeSeed-review fields resolve to canonical route/role defs, not unrestricted strings.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: shared_contract_gap
reasoning_tier: high
context_scope: plans_to_code_contracts
implementation_surfaces: [Plans/Contracts_V0.md, Plans/plans_to_code_handoff.schema.json, Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Automated_Testing_System.md]
node_compile_hint: {mode: plans_to_code_contract_envelope, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260618-001-prd-planning-wizard:atom-0101
  - pldg-20260618-001-prd-planning-wizard:atom-0102
  - pldg-20260618-001-prd-planning-wizard:atom-0106
  - pldg-20260618-001-prd-planning-wizard:atom-0109
  - pldg-20260617-001-plans-to-code-handoff:atom-0013
  - pldg-20260617-001-plans-to-code-handoff:atom-0015
  - pldg-20260617-001-plans-to-code-handoff:atom-0016
  - pldg-20260617-001-plans-to-code-handoff:atom-0040
  - pldg-20260617-001-plans-to-code-handoff:atom-0041
  - pldg-20260617-001-plans-to-code-handoff:atom-0057
  - pldg-20260617-001-plans-to-code-handoff:atom-0061
  - pldg-20260617-001-plans-to-code-handoff:dec-0005
  - pldg-20260617-001-plans-to-code-handoff:dec-0016
  - pldg-20260617-001-plans-to-code-handoff:dec-0017
  - pldg-20260617-001-plans-to-code-handoff:dec-0024
  - pldg-20260617-001-plans-to-code-handoff:dec-0026
preserved_exact_tokens:
  - "PlanCompileRun"
  - "plan_compile_run.schema.json"
  - "stage cards"
  - "NodeSeed candidate"
  - "node_seed_candidate.schema.json"
  - "WorkGraph draft"
  - "WorkNodeRequest"
  - "worknode_request.schema.json"
  - "handoff_matrix"
  - "handoff_row"
  - "TestCapabilityReport"
  - "test_capability_report.schema.json"
  - "TestHarnessProbeReport"
  - "TestStrategy"
  - "TestRunReceipt"
  - "source_control_receipt"
  - "source_control_preflight_receipt"
  - "safe_point_receipt"
  - "worknode_dispatch_receipt"
  - "worknode_change_receipt"
  - "worknode_completion_receipt"
  - "auditor_cycle_report"
  - "auditor_verification_receipt"
  - "repair_attempt_receipt"
  - "validation_pass_report"
  - "merge_or_promotion_receipt"
  - "model resolution receipt"
  - "ExecutorIntakeReport"
  - "GoalCompletionReceipt"
  - "runtime-aware"
  - "design_only"
  - "native_runtime"
negative_constraints:
  - Do not create runtime WorkNodes, NodeSeeds, executable queues, final node manifests, or dispatched GoalRuns from this schema draft.
  - Do not treat the historical bootstrap/v1 design_only branch as runtime enablement.
  - Do not let contract envelopes replace owner behavior semantics.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Executor_Protocol.md
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Automated_Testing_System.md
