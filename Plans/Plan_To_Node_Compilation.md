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
