# Shard 009: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Orchestrator_Page.md`

Source lines: L1604-L1703

Source SHA256: `ed8d6eed25610d681f69a605aa39a58225f343b31053fa3a1c923153c28f2fc3`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### OP-023 - Plan Compile Tab Projection

```yaml
plan_unit_id: OP-023
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator has a dedicated Plan Compile tab for the long design-only and later-enabled process of converting approved Plans into non-executable NodeSeed candidate drafts, WorkGraph drafts, and WorkNode request drafts. The tab projects compile_id, current_stage, stage_timeline, current activity, PlanUnits processed, candidate drafts, WorkNode request drafts, dependency/seam graph, test capability requirements, model lane routing, GUI/high-effort counts, Auditor loop status, throughput, speed, ETA confidence, blockers, warnings, model lane status, test capability status, and handoff readiness. It consumes Plan_To_Node_Compilation, Models_System, Automated_Testing_System, Executor_Protocol, and Goal_Runtime_System records without becoming compiler or scheduler authority.
  The tab groups stage progress, speed, ETA confidence, blockers, warnings, model lane status, test capability status, and handoff readiness as progress/speed/ETA/status panels.
  The tab can label the compile as Plans to WorkNodes, but Plan Compile tab scope excludes Executor execution progress except summarized handoff readiness or final handoff status.
gui_related: true
gui_classification_reason: This unit defines a user-visible Orchestrator tab, status panels, progress projection, and activity details.
depends_on: [OP-022, PNC-010, PNC-014, MS-110, ATS-001, GRS-028]
unblocks: [F3-397, RGV-013, RAP-029]
acceptance_criteria:
  - Plan Compile tab shows progress/speed/ETA/status panels for progress, speed, stage status, counts, blockers, warnings, ETA confidence, model lane status, test capability status, and handoff readiness.
  - The tab is scoped to Plans-to-node draft projection and does not display Executor code-generation progress except final handoff status.
  - Orchestrator consumes owner records and does not become PlanCompile or Executor authority.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Orchestrator Plan Compile tab review
risk_class: gui_runtime_authority_drift
reasoning_tier: high
context_scope: orchestrator_plan_compile_tab
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/FinalGUISpec.md, Plans/Run_Graph_View.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: orchestrator_plan_compile_projection, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0007
  - pldg-20260617-001-plans-to-code-handoff:atom-0050
  - pldg-20260617-001-plans-to-code-handoff:atom-0052
  - pldg-20260617-001-plans-to-code-handoff:dec-0022
  - pldg-20260617-001-plans-to-code-handoff:corr-0007
preserved_exact_tokens:
  - "Plan Compile tab"
  - "stage timeline"
  - "throughput"
  - "speed"
  - "ETA confidence"
  - "progress/speed/ETA/status panels"
  - "NodeSeeds drafted"
  - "WorkNode requests drafted"
  - "Plan Compile tab scope"
  - "Executor execution progress"
negative_constraints:
  - Do not overload Plan Compile tab with WorkNode execution/code-generation details beyond handoff status.
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
```

### OP-024 - Plans-To-Code Execution Observability Separation

```yaml
plan_unit_id: OP-024
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Existing Orchestrator execution views remain responsible for queued WorkNodes, active WorkNodes, blocked WorkNodes, completed WorkNodes, model lanes, worktrees, safe points, test runs, browser/device sessions, repair loops, Auditor status, GitHub PR/Actions when configured, and final certification progress. Progress, Node Graph, Evidence, History, Ledger, Runtime Artifacts, Source Control, and Worktrees consume execution receipts and runtime projections after Executor intake; they do not belong inside the Plan Compile tab except as summarized handoff readiness or final handoff status.
  Existing execution views, not Plan Compile, own Executor execution progress after handoff.
gui_related: true
gui_classification_reason: This unit maps visible execution progress to existing Orchestrator tabs and panels.
depends_on: [OP-023, EP-103, GRS-030, RAP-029, W-072]
unblocks: [RGV-013, F3-397]
acceptance_criteria:
  - Execution progress remains on existing execution views.
  - Source-control, testing, repair, GitHub, and completion receipts are visible through execution and evidence surfaces.
    - Plan Compile tab remains focused on node/request draft projection and handoff readiness.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Orchestrator execution observability review
risk_class: plan_compile_execution_scope_blur
reasoning_tier: high
context_scope: orchestrator_execution_observability
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/Run_Graph_View.md, Plans/Runtime_Artifacts_Panel.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: orchestrator_execution_projection, create_worknodes: false}
source_lineage:
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
  - Do not make the Plan Compile tab the code-generation dashboard.
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Runtime_Artifacts_Panel.md
