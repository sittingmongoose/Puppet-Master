# Shard 012: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Run_Graph_View.md`

Source lines: L892-L942

Source SHA256: `d57670d628c93ed10bede2a20f143df4880e9b3e8c1d32a3560d41bf78bc528b`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### RGV-013 - Plans-To-Code Execution Progress Projection

```yaml
plan_unit_id: RGV-013
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  Run Graph consumes plans-to-code execution progress after Executor intake by projecting queued WorkNodes, active WorkNodes, blocked WorkNodes, completed WorkNodes, dependency edges, model lanes, worktrees, safe points, test runs, browser/device sessions, repair loops, Auditor status, GitHub PR/Actions when configured, receipt refs, and final certification progress. The Run Graph remains an execution projection and does not own Plan Compile tab progress, PlanCompile state, Executor dispatch authority, or GoalCompletionReceipt certification authority.
  Run Graph shows Executor execution progress only after intake and does not replace Plan Compile tab scope.
gui_related: true
gui_classification_reason: Execution graph nodes, model lanes, worktrees, safe points, tests, repairs, GitHub status, and certification progress are visible graph UI.
depends_on: [RGV-012, OP-024, EP-103, GRS-030, RAP-029]
unblocks: []
acceptance_criteria:
  - Run Graph projects WorkNode execution progress after Executor intake.
  - It shows source-control, test, repair, Auditor, GitHub, receipt, and certification progress where records exist.
  - It does not replace Plan Compile tab or runtime/certification authority.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Run Graph plans-to-code execution projection review
risk_class: execution_projection_authority_drift
reasoning_tier: standard
context_scope: plans_to_code_run_graph
implementation_surfaces: [Plans/Run_Graph_View.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: plans_to_code_execution_projection, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0052
  - pldg-20260617-001-plans-to-code-handoff:atom-0053
  - pldg-20260617-001-plans-to-code-handoff:dec-0022
  - pldg-20260617-001-plans-to-code-handoff:corr-0007
preserved_exact_tokens:
  - "queued WorkNodes"
  - "active WorkNodes"
  - "worktrees"
  - "safe points"
  - "test runs"
  - "repair loops"
  - "final certification"
negative_constraints:
  - Do not let Run Graph own PlanCompile state, Executor dispatch, or completion certification.
owner_hints:
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/Executor_Protocol.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Runtime_Artifacts_Panel.md
