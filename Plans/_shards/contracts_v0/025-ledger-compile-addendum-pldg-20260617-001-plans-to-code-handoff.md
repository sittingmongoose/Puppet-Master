# Shard 025: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Contracts_V0.md`

Source lines: L17295-L17363

Source SHA256: `9514fa715a8e119c554095a24d32aa6c2f97b24ba8f22a7461028a6c2a4d03a4`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### CV-289 - Plans-To-Code Shared Contract Envelope

```yaml
plan_unit_id: CV-289
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns shared envelope references for PlanCompileRun, stage_card, compile_worklist, NodeSeed candidate, NodeSeed review, WorkGraph draft, WorkNodeRequest, compiler model routing, Codex bootstrap work package, Codex external GUI-agent request, PlanCompile receipt, TestCapabilityReport, TestHarnessProbeReport, TestStrategy, test case, TestRunReceipt, visual evidence, source_control_preflight_receipt, safe_point_receipt, worknode_change_receipt, merge_or_promotion_receipt, source-control finalization receipt, model_resolution_receipt, ExecutorIntakeReport, WorkNode execution receipts, and GoalCompletionReceipt. These contract envelopes carry IDs, source refs, owner refs, validator refs, receipt refs, evidence refs, requested/effective model refs, source-control refs, authority refs, retry/rollback routes, and user_escalation_condition while owner docs retain behavior semantics. The design-only schema draft is Plans/plans_to_code_handoff.schema.json.
  Shared contract envelopes name source_artifact, destination_artifact, retry_route, rollback_route, and the design-only `Plans/plans_to_code_handoff.schema.json` `$defs` for `plan_compile_run`, `node_seed_candidate`, `worknode_request`, `test_capability_report`, and `goal_completion_receipt` without creating runtime artifacts.
gui_related: false
gui_classification_reason: Shared contract envelopes and schema references are backend schema work, not visual presentation.
depends_on: [CV-288, PNC-014, EP-103, POA-048, MS-111, ATS-001]
unblocks: []
acceptance_criteria:
  - Shared envelope refs exist for PlanCompile, NodeSeed candidate, WorkGraph draft, WorkNodeRequest, testing, source-control, model, Executor intake, and completion receipt families.
  - Contract envelopes carry refs and cross-owner fields without replacing owner behavior semantics.
  - The schema draft remains design-only and does not create runtime artifacts.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future plans_to_code_handoff schema validation
risk_class: shared_contract_gap
reasoning_tier: high
context_scope: plans_to_code_contracts
implementation_surfaces: [Plans/Contracts_V0.md, Plans/plans_to_code_handoff.schema.json, Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Automated_Testing_System.md]
node_compile_hint: {mode: plans_to_code_contract_envelope, create_worknodes: false, create_nodeseeds: false}
source_lineage:
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
  - "stage cards"
  - "NodeSeed candidate"
  - "WorkGraph draft"
  - "WorkNodeRequest"
  - "TestCapabilityReport"
  - "TestHarnessProbeReport"
  - "TestStrategy"
  - "TestRunReceipt"
  - "source_control_preflight_receipt"
  - "safe_point_receipt"
  - "worknode_change_receipt"
  - "merge_or_promotion_receipt"
  - "model resolution receipt"
  - "ExecutorIntakeReport"
  - "GoalCompletionReceipt"
negative_constraints:
  - Do not create runtime WorkNodes, NodeSeeds, executable queues, final node manifests, or dispatched GoalRuns from this schema draft.
  - Do not let contract envelopes replace owner behavior semantics.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Executor_Protocol.md
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Automated_Testing_System.md
