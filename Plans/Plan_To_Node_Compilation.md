# Plan To Node Compilation

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document owns the PlanUnit-to-node-readiness boundary and the future compiler interface. It does not create WorkNodes.

## 0. Scope

This document defines the safe interface between canonical PlanUnits and future executable build planning. The current allowed output is a PlanUnit index and node-readiness report. NodeSeed candidates, WorkNodes, executable queues, and final build tasks wait until this compiler contract is explicitly completed.

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Plan_Document_System.md

## 1. Boundary

The safe bootstrap flow is:

```text
ledger design atom -> PlanUnit -> PlanUnit index -> node-readiness report -> future NodeSeed / WorkNode compiler -> future native Goal Mode execution
```

The current phase ends at node-readiness reporting. It may analyze blockers, missing dependencies, validation coverage, risk, ambiguity, context scope, implementation surfaces, and gui_related routing inheritance. It does not create final WorkNodes or executable build tasks.

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Plan_Document_System.md

## 2. PlanUnits

### PNC-001 - Readiness Boundary, Not WorkNode Creation

```yaml
plan_unit_id: PNC-001
unit_type: constraint
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: Plan docs contain stable PlanUnits and compilation hints, not final executable WorkNodes. The current system may generate a PlanUnit index and node-readiness report only. NodeSeed candidates and WorkNodes wait until the compiler contract is complete.
gui_related: false
gui_classification_reason: Compiler boundary and execution artifact policy are backend/governance behavior.
depends_on: [PDS-003, PDS-006]
unblocks: [PNC-002, PNC-004, BPM-005]
acceptance_criteria:
  - Plan docs do not embed final executable WorkNodes.
  - Readiness reports do not produce executable build tasks.
  - NodeSeed candidate artifacts are absent until this doc defines their candidate contract.
validation_surfaces:
  - Plan review for WorkNode language that implies executable tasks.
  - Future node-readiness report status.
risk_class: execution_boundary
reasoning_tier: standard
context_scope: plan_to_execution
implementation_surfaces: [Plans/*.md, Plans/.plan_index/node_readiness_report.json]
node_compile_hint: {mode: readiness_only, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0017
  - pldg-20260610-001-ledger-plan-system:atom-0023
  - pldg-20260610-001-ledger-plan-system:atom-0030
  - pldg-20260610-001-ledger-plan-system:atom-0031
  - pldg-20260610-001-ledger-plan-system:dec-0005
  - pldg-20260610-001-ledger-plan-system:dec-0010
  - pldg-20260610-001-ledger-plan-system:corr-0002
  - source_ref:chat:design-discussion
  - source_ref:chat:user-node-readiness-correction
preserved_exact_tokens: ["Plans/Plan_To_Node_Compilation.md", "NodeSeed", "WorkNode", "PlanUnit", "PlanUnit index", "node-readiness report", "Do not create WorkNodes", "not creating the work nodes", "cannot create the work nodes yet", "all the plans are complete"]
negative_constraints:
  - Do not put final WorkNodes directly inside canonical plan docs.
  - Do not generate NodeSeeds or WorkNodes before the Plan_To_Node_Compilation contract is complete.
  - Do not create WorkNodes or executable build tasks during PlanUnit indexing.
  - Do not generate NodeSeed candidates unless the Plan_To_Node_Compilation contract explicitly defines that candidate artifact.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Plan_Document_System.md, Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Plan_Document_System.md

### PNC-002 - Compiler Input Metadata

```yaml
plan_unit_id: PNC-002
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Future compiler inputs come from PlanUnit metadata: depends_on, unblocks,
  implementation surfaces, acceptance criteria, validation surfaces, risk_class,
  reasoning_tier, context_scope, node_compile_hint, and source_lineage.
gui_related: false
gui_classification_reason: Compiler metadata routing is not GUI implementation work.
depends_on: [PDS-003, PNC-001]
unblocks: [PNC-003, PNC-004]
acceptance_criteria:
  - PlanUnit indexes preserve dependency, validation, risk, reasoning, context, implementation surface, and source-lineage metadata.
  - Missing compiler-critical metadata is reported as node-readiness blocker, not silently inferred.
validation_surfaces:
  - Plans/.plan_index/plan_units.jsonl
  - Plans/.plan_index/dependencies.json
  - Plans/.plan_index/node_readiness_report.json
risk_class: compile_correctness
reasoning_tier: standard
context_scope: all_planunits
implementation_surfaces: [Plans/*.md, Plans/.plan_index]
node_compile_hint: {mode: future_compiler_input, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0022
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["depends_on", "unblocks", "risk_class", "reasoning_tier", "context_scope", "node_compile_hint"]
negative_constraints: []
owner_hints: [Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Plan_Document_System.md

### PNC-003 - Ordering And Capability Hints

```yaml
plan_unit_id: PNC-003
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: The future WorkNode compiler uses PlanUnit build order, dependencies, blockers, unblocks, parallelism, validation dependencies, governance dependencies, and capability/risk fields. Plans expose capability fields; runtime maps those fields to model or CLI choices later.
gui_related: false
gui_classification_reason: Scheduling and model-routing metadata are backend/orchestration behavior.
depends_on: [PNC-002]
unblocks: [PNC-004, PNC-005]
acceptance_criteria:
  - PlanUnits carry enough metadata to support build-order analysis.
  - PlanUnits do not hardcode model names as canonical execution policy.
validation_surfaces:
  - Future compiler dry-run.
  - Node-readiness dependency analysis.
risk_class: scheduling_correctness
reasoning_tier: high
context_scope: future_compiler
implementation_surfaces: [Plans/*.md, future compiler]
node_compile_hint: {mode: capability_metadata, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0024
  - pldg-20260610-001-ledger-plan-system:atom-0025
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["depends_on", "unblocks", "parallelizable_with", "validation dependency", "governance dependency", "reasoning_tier", "implementation_risk", "ambiguity_level", "context_scope"]
negative_constraints:
  - Do not hardcode model names such as a specific GPT model into PlanUnits as canonical execution policy.
owner_hints: [Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md

### PNC-004 - Node-Readiness Report Contract

```yaml
plan_unit_id: PNC-004
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: The node-readiness report catalogs whether PlanUnits are ready for future node conversion, why they are blocked, which dependencies or validators are missing, and whether compiler-contract incompleteness prevents safe conversion. It is an analysis artifact only.
gui_related: false
gui_classification_reason: Readiness report generation is backend/governance behavior.
depends_on: [PNC-001, PNC-002, PNC-003, PDS-006]
unblocks: [BPM-005]
acceptance_criteria:
  - If Plans are incomplete, readiness status records blocked_plans_incomplete.
  - If this compiler contract is incomplete, readiness status records blocked_compiler_contract_incomplete.
  - The report preserves gui_related routing inheritance without creating WorkNodes.
validation_surfaces:
  - Plans/.plan_index/node_readiness_report.json
  - Future PlanUnit index validator.
risk_class: false_completion
reasoning_tier: standard
context_scope: plan_index
implementation_surfaces: [Plans/.plan_index/node_readiness_report.json]
node_compile_hint: {mode: readiness_report_only, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0026
  - pldg-20260610-001-ledger-plan-system:atom-0031
  - pldg-20260610-001-ledger-plan-system:dec-0010
  - source_ref:chat:design-discussion
  - source_ref:chat:user-node-readiness-correction
preserved_exact_tokens: ["node_readiness_report.json", "PlanUnit index", "node-readiness report", "Do not create WorkNodes"]
negative_constraints:
  - Do not create WorkNodes or executable build tasks during PlanUnit indexing.
owner_hints: [Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Bootstrap_Planning_Migration.md]
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Plan_Document_System.md

### PNC-005 - GUI Routing Inheritance

```yaml
plan_unit_id: PNC-005
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: Future NodeSeeds and WorkNodes inherit gui_related from source PlanUnits. If gui_related is true and separate GUI model routing is enabled, the orchestrator routes the task to the configured GUI-capable model or CLI; otherwise it uses the default model.
gui_related: false
gui_classification_reason: This is backend/orchestration routing behavior; PDS-007 owns the user-visible setting and is gui_related true.
depends_on: [PDS-003, PDS-007, PNC-003]
unblocks: []
acceptance_criteria:
  - Future node artifacts preserve gui_related exactly from source PlanUnits.
  - Routing policy uses a configurable GUI-capable model/CLI without hardcoding a vendor or model name.
validation_surfaces:
  - Future compiler tests.
  - Future routing-policy tests.
risk_class: routing_mismatch
reasoning_tier: standard
context_scope: future_compiler_and_runtime
implementation_surfaces: [future NodeSeed compiler, future WorkNode compiler, future runtime router]
node_compile_hint: {mode: inherit_gui_related, route_to_gui_model_if_enabled: true, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0032
  - pldg-20260610-001-ledger-plan-system:atom-0033
  - pldg-20260610-001-ledger-plan-system:atom-0034
  - pldg-20260610-001-ledger-plan-system:dec-0009
  - pldg-20260610-001-ledger-plan-system:corr-0003
  - source_ref:chat:user-gui-classification-correction
  - source_ref:chat:user-gui-routing-native-setting
  - source_ref:chat:user-gui-routing-bootstrap-native
preserved_exact_tokens: ["NodeSeeds", "WorkNodes", "gui_related", "route_to_gui_model_if_enabled", "use different model for GUI elements?", "GUI model", "Antigravity", "Cursor"]
negative_constraints:
  - Do not hardcode Antigravity, Cursor, or any specific model name into canonical PlanUnits as the only routing option.
  - Do not expose a highly granular GUI/UI/icon/image routing taxonomy in the product UI.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Plan_Document_System.md

### PNC-006 - Native Goal Mode Compiler Handoff

```yaml
plan_unit_id: PNC-006
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: Future Chain Wizard uses native Goal Mode invisibly for ledger-to-Plans transfer, Plans-to-node conversion after this compiler contract is complete, and audit. Assistant chat can invoke Goal Mode visibly for arbitrary execution tasks.
gui_related: false
gui_classification_reason: Goal handoff and compiler orchestration are not GUI implementation work.
depends_on: [PLS-008, PNC-001]
unblocks: []
acceptance_criteria:
  - Native Goal handoff respects the readiness boundary and does not create nodes before compiler completion.
  - Audit remains a distinct phase from compilation and execution.
validation_surfaces:
  - Future native Goal integration tests.
  - Future compiler boundary tests.
risk_class: phase_boundary
reasoning_tier: standard
context_scope: native_future
implementation_surfaces: [future Chain Wizard, future Goal Mode service, future compiler]
node_compile_hint: {mode: future_native_goal_handoff, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0029
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["Chain Wizard", "native Goal Mode", "ledger-to-Plans", "Plans to work nodes", "audit"]
negative_constraints: []
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Planning_Ledger_System.md


### PNC-008 - Node-Readiness Report Field Contract

```yaml
plan_unit_id: PNC-008
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: The node-readiness report is a generated analysis artifact with status, status_reason, source_plan_unit_index, plan_unit_count, missing_required_metadata, dependency_graph_summary, build_order_blockers, risk_and_reasoning_summary, gui_related_units, compiler_contract_status, no_worknodes_created, and next_required_action. It may recommend future grouping questions, but it must not create NodeSeed candidates or WorkNodes until this owner doc defines those artifact contracts.
gui_related: false
gui_classification_reason: Readiness report structure and routing analysis are backend/orchestration behavior.
depends_on: [PNC-001, PNC-002, PNC-003, PNC-004, PNC-005]
unblocks: [BPM-005]
acceptance_criteria:
  - The report exposes dependency/build-order blockers separately from model/capability risk.
  - The report lists gui_related PlanUnits so future routing can inherit the boolean.
  - The report explicitly states no_worknodes_created=true for the current readiness-only phase.
validation_surfaces:
  - Plans/.plan_index/node_readiness_report.json
  - Future node-readiness validator.
risk_class: false_node_generation
reasoning_tier: standard
context_scope: plan_index
implementation_surfaces: [Plans/.plan_index/node_readiness_report.json]
node_compile_hint: {mode: readiness_report_schema, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0039
  - source_ref:chat:implementation-readiness-review
preserved_exact_tokens: ["status", "status_reason", "source_plan_unit_index", "plan_unit_count", "missing_required_metadata", "dependency_graph_summary", "build_order_blockers", "risk_and_reasoning_summary", "gui_related_units", "compiler_contract_status", "no_worknodes_created", "next_required_action"]
negative_constraints:
  - Do not create NodeSeed candidates from a readiness report unless this doc later defines the NodeSeed candidate contract.
  - Do not create WorkNodes from node-readiness output.
owner_hints: [Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md

## 4. Deferred Compiler Algorithm

The exact future PlanUnit-to-NodeSeed-to-WorkNode compiler algorithm is intentionally deferred. Current work reserves interface fields and readiness reporting only.

```yaml
plan_unit_id: PNC-007
unit_type: deferred_decision
status: deferred
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: The exact PlanUnit-to-NodeSeed-to-WorkNode compiler algorithm remains deferred to a dedicated design process. The current standard reserves fields and reports node-readiness without generating NodeSeed candidates or WorkNodes.
gui_related: false
gui_classification_reason: Deferred compiler algorithm design is not GUI implementation work.
depends_on: [PNC-001, PNC-002, PNC-003]
unblocks: []
acceptance_criteria:
  - Readiness report can mark blocked_compiler_contract_incomplete until this algorithm is defined.
  - No executable node artifacts are produced by this deferred decision.
validation_surfaces:
  - Future compiler design review.
  - Node-readiness report status.
risk_class: deferred_algorithm
reasoning_tier: high
context_scope: future_compiler
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, future compiler]
node_compile_hint: {mode: blocked_compiler_contract_incomplete, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0030
  - pldg-20260610-001-ledger-plan-system:q-0001
  - source_ref:chat:plan-to-node-deferred
preserved_exact_tokens: ["PlanUnit index", "node-readiness report", "NodeSeed", "WorkNode"]
negative_constraints:
  - Do not generate NodeSeeds or WorkNodes before the Plan_To_Node_Compilation contract is complete.
owner_hints: [Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md

### PNC-009 - Orchestrator Runtime Object And Compiler Boundary

```yaml
plan_unit_id: PNC-009
unit_type: constraint
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Canonical Plans may reference owner-defined Orchestrator-facing GoalRun, WorkGraph, WorkNode, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, WorkNodeReceipt, GoalCompletionReceipt, CapabilityLane, and CertificationTier concepts for future implementation, but Plan_To_Node_Compilation owns only the compiler artifact boundary. Plan/PlanUnit, Node Graph, and Run Graph surfaces may display readiness, blockers, gui_related, receipt status, and compiler contract state from owner projections, but they do not create executable runtime artifacts. Ledger-to-Plans compilation and PlanUnit indexing must not emit executable queues, final node manifests, final build tasks, production build tasks, actual WorkNode artifacts, or NodeSeed candidates before this compiler contract defines those artifacts.
gui_related: false
gui_classification_reason: Compiler artifact boundaries and readiness-only contracts are backend/governance behavior, not visual presentation.
depends_on: [PNC-001, PNC-004, PNC-007, PNC-008]
unblocks: [GRS-026, OP-022, EP-098, RGV-012]
acceptance_criteria:
  - Design-time WorkNode concepts in Plans do not create executable WorkNode artifacts.
  - PlanUnit indexes and node-readiness reports remain readiness-only.
  - Missing executable compiler schema keeps NodeSeeds, WorkNodes, executable queues, final node manifests, final build tasks, and production build tasks absent.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/.plan_index/node_readiness_report.json
risk_class: false_node_generation
reasoning_tier: high
context_scope: plan_to_node_orchestrator_runtime_boundary
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Plan_Document_System.md, Plans/Run_Graph_View.md, Plans/FinalGUISpec.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md]
node_compile_hint: {mode: orchestrator_runtime_object_boundary, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0004
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0017
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0070
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0085
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0086
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0104
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0016
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0027
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0029
preserved_exact_tokens:
  - "PlanUnit index"
  - "node-readiness report"
  - "NodeSeeds"
  - "WorkNodes"
  - "executable queues"
  - "final build tasks"
  - "compiler contract"
  - "PlanUnit"
  - "Node Graph"
  - "Run Graph"
  - "readiness"
  - "blockers"
  - "gui_related"
  - "receipt status"
  - "do not emit executable queues"
negative_constraints:
  - Do not create NodeSeeds or WorkNodes during this Orchestrator design compile unless the compiler contract is completed first.
  - Do not create executable WorkNodes from Plan/PlanUnit pages before the compiler contract exists.
  - Do not treat design-time WorkNode terms as permission to create runtime work artifacts.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Plan_Document_System.md, Plans/Run_Graph_View.md, Plans/FinalGUISpec.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md]
```

## 5. Compilation Coverage

| Ledger atom | Disposition |
| --- | --- |
| atom-0017 | PNC-001 |
| atom-0022 | PNC-002 |
| atom-0023 | PNC-001 |
| atom-0024 | PNC-003 |
| atom-0025 | PNC-003 |
| atom-0026 | PNC-004 |
| atom-0029 | PNC-006 |
| atom-0030 | PNC-001, PNC-007 |
| atom-0031 | PNC-001, PNC-004 |
| atom-0032 | PNC-005 |
| atom-0033 | PNC-005; PDS-007 owns the gui_related true user-visible setting PlanUnit. |
| atom-0034 | PNC-005 |
| q-0001 | PNC-007 deferred decision. |
| atom-0039 | PNC-008 |

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### PNC-010 - PlanCompileRun Design-Only State Machine

```yaml
plan_unit_id: PNC-010
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  PlanCompileRun is a durable, idempotent, resumable design-only state machine for converting approved Plans and PlanUnits into non-executable NodeSeed candidates, WorkGraph drafts, and WorkNode requests. The state record must carry compile_id, source_plan_set_id, source_plan_index_hash, launch_source, runtime_adapter, status, current_stage, cursor, last_green_stage, last_green_hashes, blockers, next_required_stage, and resume_command_or_action. The shared compiler core has two adapters, a Codex bootstrap adapter and a native Puppet Master adapter, so the truth model stays shared while execution surfaces differ. PlanCompile remains design_only_disabled with automatic_launch_enabled: false, native_plan_wizard_launch_enabled: false, and codex_bootstrap_launch_enabled: false until an explicit later enablement PlanUnit accepts runtime launch.
gui_related: false
gui_classification_reason: State machine and compiler adapter contracts are backend planning/runtime design, not visual presentation.
depends_on: [PNC-001, PNC-007, PNC-009]
unblocks: [PNC-011, PNC-012, PNC-013, PNC-014, GRS-028, OP-023, CV-289]
acceptance_criteria:
  - PlanCompile stays design_only_disabled until explicit enablement.
  - The shared compiler core owns one truth model with Codex bootstrap and native Puppet Master adapters.
  - Resume is possible from durable state fields, source hashes, blockers, and exact NEXT routing without chat memory.
  - The state machine emits no executable WorkNodes, NodeSeeds, queues, final node manifests, implementation files, dispatched GoalRuns, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future PlanCompileRun schema validation
risk_class: false_node_generation
reasoning_tier: high
context_scope: plancompile_design_state_machine
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: plancompile_design_only_state_machine, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0001
  - pldg-20260617-001-plans-to-code-handoff:atom-0002
  - pldg-20260617-001-plans-to-code-handoff:atom-0003
  - pldg-20260617-001-plans-to-code-handoff:atom-0006
  - pldg-20260617-001-plans-to-code-handoff:atom-0010
  - pldg-20260617-001-plans-to-code-handoff:atom-0056
  - pldg-20260617-001-plans-to-code-handoff:dec-0001
  - pldg-20260617-001-plans-to-code-handoff:dec-0002
  - pldg-20260617-001-plans-to-code-handoff:dec-0003
  - pldg-20260617-001-plans-to-code-handoff:corr-0005
preserved_exact_tokens:
  - "PlanCompileRun"
  - "shared compiler core"
  - "Codex bootstrap adapter"
  - "native Puppet Master adapter"
  - "one truth model"
  - "low quality agent"
  - "low context"
  - "resume"
  - "source hashes"
  - "exact NEXT routing"
  - "design_only"
  - "automatic_launch_enabled: false"
  - "native_plan_wizard_launch_enabled: false"
  - "codex_bootstrap_launch_enabled: false"
negative_constraints:
  - Do not build two unrelated compilers that drift.
  - Do not rely on chat memory or one high-context model remembering the full process.
  - Do not implement PlanCompile as a giant prompt chain.
  - Do not create production WorkNodes, executable WorkGraphs, dispatched GoalRuns, or native queues in this phase.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
```

### PNC-011 - Low-Context Stage Card Contract

```yaml
plan_unit_id: PNC-011
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Each PlanCompile stage has a bounded stage_card with purpose, read_files, write_files, forbidden_writes, entry_gate, item_boundaries, exit_gate, success_route, and blocked_route so a low-context agent can execute or resume the stage from state only. Required stages include preflight/currentness, scope selection, PlanUnit normalization, dependency/cycle analysis, surface mapping, work type and effort classification, NodeSeed candidate synthesis, split/merge sizing, NodeSeed review, WorkGraph draft, WorkNode request emission, adapter emission, and certification/handoff.
gui_related: false
gui_classification_reason: Stage cards and resumable worklists are compiler process contracts, not GUI implementation.
depends_on: [PNC-010]
unblocks: [PNC-012, PNC-013, PNC-014]
acceptance_criteria:
  - Every stage names read/write/forbidden files, entry and exit gates, item bounds, and next route.
  - A new low-context agent can resume from stage state without rereading the whole repo.
  - Stage cards never authorize WorkNodes, NodeSeeds as runtime artifacts, queues, implementation files, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future stage_card schema validation
risk_class: low_context_resume_failure
reasoning_tier: high
context_scope: plancompile_stage_cards
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: low_context_stage_cards, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0004
  - pldg-20260617-001-plans-to-code-handoff:atom-0005
  - pldg-20260617-001-plans-to-code-handoff:dec-0002
preserved_exact_tokens:
  - "preflight/currentness"
  - "PlanUnit normalization"
  - "dependency/cycle analysis"
  - "work type and effort classification"
  - "NodeSeed candidate synthesis"
  - "WorkGraph draft"
  - "WorkNode request emission"
  - "stage_card"
  - "entry_gate"
  - "exit_gate"
  - "item_boundaries"
negative_constraints:
  - Do not ask an agent to reason over the full Plan index when a bounded worklist can be used.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Planning_Ledger_System.md
```

### PNC-012 - NodeSeed Candidate And Review Gate Contract

```yaml
plan_unit_id: PNC-012
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  NodeSeed candidates are non-executable intermediate artifacts. They carry source_plan_unit_ids, source_acceptance_unit_ids, objective, owner_area, implementation_surfaces, read_set, write_set_candidates, acceptance_criteria, validator_candidates, dependency_refs, risk_class, reasoning_tier, work_type, effort, gui_related, frontend_related, capability requirements, authority policy, sizing, status, and blockers. The NodeSeed review gate proves coverage, excluded dispositions, acceptance criteria, validators or explicit gaps, bounded write surfaces, dependencies, GUI flags, risk/reasoning/capability metadata, and absence of executable WorkNodes before a WorkGraph draft can be considered.
gui_related: false
gui_classification_reason: NodeSeed candidates and review gates are compiler artifact contracts, not visual presentation.
depends_on: [PNC-010, PNC-011, PNC-002, PNC-005]
unblocks: [PNC-013, PNC-014, CV-289]
acceptance_criteria:
  - NodeSeed candidates are explicitly non-executable and cannot be dispatched.
  - Review covers coverage, exclusions, acceptance, validators/gaps, write bounds, dependencies, GUI flags, risk/reasoning/capability metadata, and no executable WorkNodes.
  - Candidate contracts preserve gui_related inheritance without creating runtime NodeSeeds.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future node_seed_candidate schema validation
risk_class: false_node_generation
reasoning_tier: high
context_scope: nodeseed_candidate_contract
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Contracts_V0.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: nodeseed_candidate_design_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0013
  - pldg-20260617-001-plans-to-code-handoff:atom-0014
  - pldg-20260617-001-plans-to-code-handoff:atom-0017
  - pldg-20260617-001-plans-to-code-handoff:dec-0005
  - pldg-20260617-001-plans-to-code-handoff:dec-0010
preserved_exact_tokens:
  - "NodeSeed candidate"
  - "non-executable"
  - "source_plan_unit_ids"
  - "acceptance_criteria"
  - "NodeSeed review gate"
  - "coverage"
  - "bounded write surfaces"
  - "absence of executable WorkNodes"
  - "work_type"
  - "gui_related"
  - "effort_class"
  - "reasoning_tier"
  - "capability_lane"
negative_constraints:
  - Do not treat NodeSeeds as final WorkNodes.
  - Do not emit NodeSeed candidates as runtime artifacts in this compile.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/Executor_Protocol.md
```

### PNC-013 - WorkGraph Draft And WorkNode Request Contract

```yaml
plan_unit_id: PNC-013
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  WorkGraph draft is the first executable-shaped artifact but remains reviewable and non-dispatched before Executor intake. It carries nodes, entrypoints, dependency_edges, scheduler_policy, graph_integrity, authority, evidence, and validation_state. PlanCompile emits WorkNodeRequest records, not runnable WorkNodes. Each WorkNode request must carry source PlanUnit refs, objective, implementation surfaces, read/write candidates, acceptance criteria, validator candidates, dependency refs, work_type, gui_related, frontend_related, effort class, reasoning tier, context size, validation cost, risk class, authority risk, user-visible risk, capability lane, test_binding, model routing, and ordering metadata. Default build order begins with test capability discovery, source-control/worktree/safe-point discovery, environment/toolchain setup, contracts/schemas/storage, core runtime/execution, providers/models/settings/permissions, GUI shell/navigation, features, integration/seams, automated tests/browser/device checks, source-control promotion, and final Auditor certification.
gui_related: true
gui_classification_reason: WorkNode request routing includes GUI/frontend flags and user-visible risk metadata that drive visible routing and testing surfaces.
depends_on: [PNC-012, ATS-003]
unblocks: [EP-099, EP-100, EP-101, CV-289]
acceptance_criteria:
  - WorkGraph drafts remain reviewable and cannot dispatch before Executor intake.
  - PlanCompile emits WorkNode requests, not runnable WorkNodes.
  - Requests carry test binding, model routing, ordering, risk, GUI/frontend, authority, and validation metadata.
  - Default build order covers discovery, safe points, environment, contracts, runtime, providers, GUI shell, features, integrations, automated checks, promotion, and Auditor certification before execution is accepted.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future WorkGraph draft and WorkNode request schema validation
risk_class: executor_boundary_bypass
reasoning_tier: high
context_scope: workgraph_draft_worknode_request
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Automated_Testing_System.md, Plans/Models_System.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: worknode_request_design_contract, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0015
  - pldg-20260617-001-plans-to-code-handoff:atom-0016
  - pldg-20260617-001-plans-to-code-handoff:atom-0017
  - pldg-20260617-001-plans-to-code-handoff:atom-0025
  - pldg-20260617-001-plans-to-code-handoff:atom-0026
  - pldg-20260617-001-plans-to-code-handoff:atom-0033
  - pldg-20260617-001-plans-to-code-handoff:dec-0005
  - pldg-20260617-001-plans-to-code-handoff:dec-0010
  - pldg-20260617-001-plans-to-code-handoff:dec-0011
preserved_exact_tokens:
  - "WorkGraph draft"
  - "entrypoints"
  - "dependency_edges"
  - "scheduler_policy"
  - "WorkNodeRequest"
  - "Executor intake"
  - "not runnable WorkNodes"
  - "build_phase"
  - "dependency_type"
  - "parallel_group_id"
  - "scheduler_lane"
  - "ordering_reason"
  - "test_binding"
  - "test capability discovery"
  - "source-control/worktree/safe-point discovery"
  - "environment/toolchain setup"
  - "contracts/schemas/storage"
  - "source-control promotion"
  - "final Auditor certification"
negative_constraints:
  - Do not dispatch from WorkGraph draft before certified Executor intake.
  - Do not let PlanCompile directly dispatch worker execution.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
```

### PNC-014 - Plans-To-Code Handoff Matrix And Schema Boundary

```yaml
plan_unit_id: PNC-014
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Plan_To_Node_Compilation owns the Plan Compile side of the Plans-to-Code Handoff Matrix. Every transition from Plan Wizard approval through PlanCompile, Executor intake, source-control preflight, dispatch, tests, Auditor verification, repair, promotion, graph completion, and certification must name source_artifact, destination_artifact, owner, validator, receipt, retry_route, rollback_route, and user_escalation_condition. The schema draft in Plans/plans_to_code_handoff.schema.json records PlanCompileRun, stage card, compile worklist, NodeSeed candidate, NodeSeed review, WorkGraph draft, WorkNode request, compiler model routing, Codex work package, Codex external GUI-agent request, PlanCompile receipt, automated testing reports, test cases, test run receipts, visual evidence, source-control receipts, model resolution receipts, ExecutorIntakeReport, and GoalCompletionReceipt shapes as design-only contracts.
gui_related: false
gui_classification_reason: Handoff matrix and schema boundaries are backend contract and traceability surfaces.
depends_on: [PNC-010, PNC-011, PNC-012, PNC-013]
unblocks: [EP-102, GRS-030, POA-048, CV-289]
acceptance_criteria:
  - Every handoff names artifact, owner, validator, receipt, retry, rollback, and escalation route.
  - The schema draft records required artifact families without enabling PlanCompile.
  - Codex bootstrap external GUI-agent request is documented as a bootstrap artifact only, not a built Puppet Master setting.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future handoff matrix validation
risk_class: handoff_gap
reasoning_tier: high
context_scope: plans_to_code_handoff
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/Project_Output_Artifacts.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: handoff_matrix_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0007
  - pldg-20260617-001-plans-to-code-handoff:atom-0011
  - pldg-20260617-001-plans-to-code-handoff:atom-0041
  - pldg-20260617-001-plans-to-code-handoff:atom-0057
  - pldg-20260617-001-plans-to-code-handoff:atom-0060
  - pldg-20260617-001-plans-to-code-handoff:atom-0061
  - pldg-20260617-001-plans-to-code-handoff:dec-0009
  - pldg-20260617-001-plans-to-code-handoff:dec-0017
  - pldg-20260617-001-plans-to-code-handoff:dec-0024
  - pldg-20260617-001-plans-to-code-handoff:dec-0026
preserved_exact_tokens:
  - "Plan Compile"
  - "Plans to WorkNodes"
  - "WorkNode requests"
  - "Plans-to-Code Handoff Matrix"
  - "source artifact"
  - "destination artifact"
  - "owner"
  - "validator"
  - "receipt"
  - "retry route"
  - "rollback route"
  - "plan_compile_run.schema.json"
  - "node_seed_candidate.schema.json"
  - "worknode_request.schema.json"
  - "test_capability_report.schema.json"
  - "source_control_preflight_receipt"
  - "goal_completion_receipt"
  - "external GUI-agent CLI"
  - "Antigravity"
  - "Claude Code"
  - "Cursor"
  - "OpenCode"
  - "Codex parent verification"
negative_constraints:
  - Do not show Executor code-generation progress inside the Plan Compile tab except final handoff status.
  - Do not expose the Codex external GUI-agent bridge as a built Puppet Master setting.
  - Do not compile vague roadmap prose that leaves future agents to infer the contracts.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/Project_Output_Artifacts.md
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md
