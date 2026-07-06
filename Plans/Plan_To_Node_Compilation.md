# Plan To Node Compilation

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document owns the PlanUnit-to-node-readiness boundary and the future compiler interface. It does not create WorkNodes.

## 0. Scope

This document defines the safe interface between canonical PlanUnits and executable build planning. The PlanUnit indexing phase still emits only a PlanUnit index and node-readiness report. Runtime PlanCompile may later materialize NodeSeed, WorkGraph, WorkNodeRequest, and WorkNodeRecord artifacts only through the explicit compiler, Executor intake, activation, and certification contracts below; generated index artifacts never create executable queues or final build tasks.

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Plan_Document_System.md

## 1. Boundary

The safe bootstrap flow is:

```text
ledger design atom -> PlanUnit -> PlanUnit index -> node-readiness report -> future NodeSeed / WorkNode compiler -> future native Goal Mode execution
```

The PlanUnit index phase ends at node-readiness reporting. It may analyze blockers, missing dependencies, validation coverage, risk, ambiguity, context scope, implementation surfaces, and gui_related routing inheritance. Runtime PlanCompile is a separate implementation surface: it can draft non-executable NodeSeed candidates, certify a WorkGraph draft, emit WorkNodeRequest records for Executor intake, and materialize WorkNodeRecord objects only after activation. The indexer itself does not create final WorkNodes or executable build tasks.

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Plan_Document_System.md

## 2. PlanUnits

### PNC-001 - Readiness Boundary, Not WorkNode Creation

```yaml
plan_unit_id: PNC-001
unit_type: constraint
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: Plan docs contain stable PlanUnits and compilation hints, not final executable WorkNodes. PlanUnit indexing generates a PlanUnit index and node-readiness report only. Runtime PlanCompile uses the accepted compiler contract to draft NodeSeed candidates, certify WorkGraph and WorkNodeRequest artifacts, and hand accepted requests to Executor; the indexer never emits runtime NodeSeeds, WorkNodes, executable queues, or final build tasks.
gui_related: false
gui_classification_reason: Compiler boundary and execution artifact policy are backend/governance behavior.
depends_on: [PDS-003, PDS-006]
unblocks: [PNC-002, PNC-004, BPM-005]
acceptance_criteria:
  - Plan docs do not embed final executable WorkNodes.
  - Readiness reports do not produce executable build tasks.
  - PlanUnit indexing does not emit NodeSeed candidate artifacts, WorkNodeRequests, or WorkNodes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/.plan_index/node_readiness_report.json
risk_class: execution_boundary
reasoning_tier: standard
context_scope: plan_to_execution
implementation_surfaces: [Plans/*.md, Plans/.plan_index/node_readiness_report.json]
node_compile_hint: {mode: readiness_only, create_worknodes: false}
source_lineage:
  - pldg-20260703-001-feature-intake:atom-0002
  - pldg-20260610-001-ledger-plan-system:atom-0017
  - pldg-20260610-001-ledger-plan-system:atom-0023
  - pldg-20260610-001-ledger-plan-system:atom-0030
  - pldg-20260610-001-ledger-plan-system:atom-0031
  - pldg-20260610-001-ledger-plan-system:dec-0005
  - pldg-20260610-001-ledger-plan-system:dec-0010
  - pldg-20260610-001-ledger-plan-system:corr-0002
  - source_ref:chat:design-discussion
  - source_ref:chat:user-node-readiness-correction
source_atom_ids:
  - atom-0002
preserved_exact_tokens: ["Plans/Plan_To_Node_Compilation.md", "NodeSeed", "WorkNode", "PlanUnit", "PlanUnit index", "node-readiness report", "Do not create WorkNodes", "not creating the work nodes", "cannot create the work nodes yet", "all the plans are complete", "Do not write canonical Plans yet.", "Do not write canonical Plans until Jared explicitly asks to compile the ledger.", "Do not create or update Plans/.plan_index, WorkNodes, NodeSeeds, executable queues, Spec_Lock, shards, evidence, plan_graph, or auto_decisions."]
negative_constraints:
  - Do not put final WorkNodes directly inside canonical plan docs.
  - Do not generate NodeSeeds or WorkNodes from the PlanUnit index phase.
  - Do not create WorkNodes or executable build tasks during PlanUnit indexing.
  - Do not dispatch NodeSeed candidates or WorkNodeRequests before Executor intake and activation certification.
  - Do not recreate the removed legacy Iced app.
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

## Implementation Readiness Gate Addendum - 2026-07-05

This addendum installs a buildability gate for PlanCompile without creating WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, generated governance seal artifacts, or production build tasks.

### PNC-021 - Implementation Buildability Gate Report Boundary

```yaml
plan_unit_id: PNC-021
unit_type: constraint
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  PlanUnit indexes, node-readiness reports, strict runtime contract validators, semantic closure registries,
  schema-file existence, wiring JSON existence, and source-lineage preservation are buildability inputs only.
  They cannot mark PlanCompile, NodeSeed, WorkGraph, WorkNodeRequest, Executor intake, activation, Orchestrator
  projection, or Goal Runtime certification buildable. `Plans/.implementation_readiness/buildability_gate_report.json`
  is the current product-facing implementation-buildability gate report for Planning Wizard and PlanCompile. The report
  remains blocked while any registered blocker row is open or while `Plans/.plan_index/node_readiness_report.json`
  projects node_readiness.hard_disabled for `PNC-019`. The gate may become buildable only after open_blocker_count is
  zero, hard disabled reasons are absent, executable lifecycle certification is complete, source hashes are current,
  and concrete schemas, command wiring, security boundaries, behavioral acceptance, persistence lifecycle,
  currentness, provider stream behavior, structural integrity, owner routing, and executable clean-room lifecycle
  evidence are recorded.
gui_related: false
gui_classification_reason: Defines compiler/readiness boundary and buildability evidence requirements, not visual presentation.
depends_on: [PNC-019, PDS-019, PNC-022]
unblocks: [PWIZ-018, PG-060]
acceptance_criteria:
  - Buildability report remains blocked while PNC-019 executable lifecycle certification is incomplete.
  - buildability_gate_passed=true requires open_blocker_count=0, no hard disabled reasons, executable lifecycle certification complete, and current report source hashes.
  - Node-readiness output and validator success are not treated as runtime buildability proof.
  - Required evidence covers concrete schemas, command wiring, security, behavioral acceptance, persistence, currentness, provider behavior, structure, owner routing, and clean-room lifecycle proof.
  - No NodeSeeds, WorkNodes, executable queues, final node manifests, implementation files, runtime launches, or production build tasks are emitted by this report.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plan-index.py validate
risk_class: false_plancompile_buildability
reasoning_tier: high
context_scope: plancompile_buildability_gate
implementation_surfaces:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/.implementation_readiness/buildability_gate_report.json
  - Plans/.plan_index/node_readiness_report.json
node_compile_hint:
  mode: buildability_gate_report_boundary
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
  - source_ref:chat:2026-07-05-implementation-readiness-buildability-gate
  - Plans/Plan_To_Node_Compilation.md#PNC-019
  - Plans/.plan_index/node_readiness_report.json
preserved_exact_tokens:
  - "PNC-019"
  - "blocked_runtime_certification_incomplete"
  - "buildability_gate_report.json"
  - "concrete schemas, command wiring, security boundaries, behavioral acceptance, and clean-room lifecycle evidence"
negative_constraints:
  - Do not treat source-preservation, schema existence, wiring JSON existence, semantic closure, or validator success as proof of PlanCompile buildability.
  - Do not create product WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, or production build tasks from this gate.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Plan_Document_System.md
  - Plans/Planning_Wizard.md
  - Plans/Progression_Gates.md
```

### PNC-022 - PNC-019 Bootstrap Authority And Lifecycle Harness Boundary

```yaml
plan_unit_id: PNC-022
unit_type: constraint
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Tier 0A may specify controlled bootstrap authority for the PlanCompile compiler, PNC-019 lifecycle
  certification harness, and certifier path only. This authority exists solely to make the runtime lifecycle
  certifiable; it does not authorize ordinary product WorkNodes, NodeSeeds, executable queues, final node
  manifests, implementation files, runtime launches, or production build tasks. The bootstrap certification
  boundary covers ApprovedPlanPack intake, PlanCompileRun identity, WorkGraph draft generation, WorkNodeRequest
  generation, Executor intake handoff, activation lifecycle, Orchestrator projection, restart/cancel/failure
  paths, receipt/evidence outputs, positive fixtures, and negative fixtures. `bootstrap_authorized=true` means
  only this harness/spec path may be reasoned about; it is not equivalent to compiler_contract_complete,
  executable lifecycle certification, runtime_enabled, ordinary_product_worknodes_allowed, or
  buildability_gate_passed. Ordinary PlanUnits remain `create_worknodes:false`, the node-readiness status remains
  blocked until executable lifecycle certification evidence exists, and any future harness-scoped materialization
  must be unambiguously marked as PNC-019 certification-harness/bootstrap-only.
gui_related: false
gui_classification_reason: Defines a compiler/harness certification boundary rather than visual presentation.
depends_on: [PNC-006, PNC-010, PNC-012, PNC-013, PNC-014, PNC-018, PNC-019]
unblocks: [PWIZ-018, PG-060]
acceptance_criteria:
  - Bootstrap authority is limited to the PlanCompile compiler, PNC-019 certification harness, and certifier path.
  - The lifecycle boundary names ApprovedPlanPack intake, PlanCompileRun identity, WorkGraph draft, WorkNodeRequest, Executor intake, activation, Orchestrator projection, restart/cancel/failure, receipts/evidence, positive fixtures, and negative fixtures.
  - bootstrap_authorized, compiler_contract_complete, certification_harness_specified, executable_lifecycle_certification_complete, runtime_enabled, and ordinary_product_worknodes_allowed remain distinct node-readiness fields.
  - Ordinary product PlanUnits remain create_worknodes:false and ordinary_product_worknodes_allowed:false until executable lifecycle certification is complete.
  - The bootstrap authority does not set buildability_gate_passed=true and does not enable Planning Wizard Approve And Build for ordinary product work.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
risk_class: bootstrap_authority_overreach
reasoning_tier: high
context_scope: pnc019_bootstrap_certification_boundary
implementation_surfaces:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/.plan_index/node_readiness_report.json
  - Plans/.implementation_readiness/buildability_gate_report.json
  - scripts/pm-plan-index.py
  - scripts/pm-implementation-readiness.py
node_compile_hint:
  mode: pnc019_bootstrap_authority
  bootstrap_authorized: true
  bootstrap_scope: pnc019_certification_harness_only
  certification_harness_specified: true
  executable_lifecycle_certification_complete: false
  runtime_enabled: false
  ordinary_product_worknodes_allowed: false
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_ref:goal:2026-07-05-tier-0a-pnc019-bootstrap-authority
  - Plans/Plan_To_Node_Compilation.md#PNC-019
  - Plans/.implementation_readiness/readiness_blockers.jsonl#IRB-005
  - Plans/.implementation_readiness/readiness_blockers.jsonl#IRB-011
preserved_exact_tokens:
  - "ApprovedPlanPack intake"
  - "PlanCompileRun identity"
  - "WorkGraph draft generation"
  - "WorkNodeRequest generation"
  - "Executor intake handoff"
  - "activation lifecycle"
  - "Orchestrator projection"
  - "restart/cancel/failure paths"
  - "positive fixtures"
  - "negative fixtures"
  - "ordinary_product_worknodes_allowed"
negative_constraints:
  - Do not treat PNC-019 bootstrap authority as implementation buildability.
  - Do not enable ordinary product WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks from this authority.
  - Do not close IRB-005 runtime_lifecycle or IRB-011 clean_room_harness until executable lifecycle proof exists.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Executor_Protocol.md
  - Plans/Goal_Runtime_System.md
  - Plans/Orchestrator_Page.md
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md

### PNC-004 - Node-Readiness Report Contract

```yaml
plan_unit_id: PNC-004
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: The node-readiness report catalogs whether PlanUnits are ready for runtime PlanCompile, why they are blocked, which dependencies or validators are missing, and whether the compiler contract is complete. It is an analysis artifact only and never materializes NodeSeed, WorkGraph, WorkNodeRequest, WorkNodeRecord, queue, or final build-task artifacts.
gui_related: false
gui_classification_reason: Readiness report generation is backend/governance behavior.
depends_on: [PNC-001, PNC-002, PNC-003, PDS-006]
unblocks: [BPM-005]
acceptance_criteria:
  - If Plans are incomplete, readiness status records blocked_plans_incomplete.
  - If the PlanCompile compiler contract is incomplete, readiness status records blocked_compiler_contract_incomplete; once PNC-007 is accepted, runtime_enablement_status records the compiler contract as complete, but readiness remains blocked_runtime_certification_incomplete until the PNC-019 executable lifecycle certification harness passes and records evidence.
  - The report preserves gui_related routing inheritance without creating WorkNodes.
validation_surfaces:
  - Plans/.plan_index/node_readiness_report.json
  - python3 scripts/pm-plan-index.py validate
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
preserved_exact_tokens: ["node_readiness_report.json", "PlanUnit index", "node-readiness report", "blocked_compiler_contract_incomplete", "runtime_disabled", "Do not create WorkNodes"]
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
  - python3 scripts/pm-plan-index.py validate
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
canonical_text: Future Planning Wizard uses native Goal Mode invisibly for ledger-to-Plans transfer, Plans-to-node conversion after this compiler contract is complete, and audit. Assistant chat can invoke Goal Mode visibly for arbitrary execution tasks.
gui_related: false
gui_classification_reason: Goal handoff and compiler orchestration are not GUI implementation work.
depends_on: [PLS-008, PNC-001]
unblocks: []
acceptance_criteria:
  - Native Goal handoff respects the readiness boundary and does not create nodes before compiler completion.
  - Audit remains a distinct phase from compilation and execution.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future native Goal integration tests.
  - Future compiler boundary tests.
risk_class: phase_boundary
reasoning_tier: standard
context_scope: native_future
implementation_surfaces: [future Planning Wizard, future Goal Mode service, future compiler]
node_compile_hint: {mode: future_native_goal_handoff, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0029
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["Planning Wizard", "Chain Wizard", "native Goal Mode", "ledger-to-Plans", "Plans to work nodes", "audit"]
negative_constraints:
  - Chain Wizard is retained only as retired compatibility/source-lineage terminology and must not name the current product.
stale_retired_dispositions:
  - Chain Wizard in source lineage is retired; active current-product prose uses Planning Wizard.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Planning_Ledger_System.md


### PNC-008 - Node-Readiness Report Field Contract

```yaml
plan_unit_id: PNC-008
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: The node-readiness report is a generated analysis artifact with status, status_reason, source_plan_unit_index, plan_unit_count, missing_required_metadata, dependency_graph_summary, build_order_blockers, risk_and_reasoning_summary, gui_related_units, runtime_enablement_status, no_worknodes_created, and next_required_action. It may recommend grouping questions, but it must never create NodeSeed candidates or WorkNodes; runtime node artifacts belong only to PlanCompile/Executor activation after source indexes, acceptance units, strict schemas, and certification gates are current.
gui_related: false
gui_classification_reason: Readiness report structure and routing analysis are backend/orchestration behavior.
depends_on: [PNC-001, PNC-002, PNC-003, PNC-004, PNC-005]
unblocks: [BPM-005]
acceptance_criteria:
  - The report exposes dependency/build-order blockers separately from model/capability risk.
  - The report lists gui_related PlanUnits so future routing can inherit the boolean.
  - The report explicitly states no_worknodes_created=true for index generation even when the compiler contract is complete.
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
preserved_exact_tokens: ["status", "status_reason", "source_plan_unit_index", "plan_unit_count", "missing_required_metadata", "dependency_graph_summary", "build_order_blockers", "risk_and_reasoning_summary", "gui_related_units", "runtime_enablement_status", "blocked_compiler_contract_incomplete", "runtime_disabled", "no_worknodes_created", "next_required_action"]
negative_constraints:
  - Do not create NodeSeed candidates from a readiness report.
  - Do not create WorkNodes from node-readiness output.
owner_hints: [Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md

## 4. Runtime Compiler Algorithm And Enablement

The PlanUnit-to-NodeSeed-to-WorkNode compiler contract is accepted for implementation. This acceptance authorizes builders to implement the compiler, schemas, and validators; it does not cause this docs/index repair to emit runtime artifacts, queues, implementation files, or WorkNodes.

```yaml
plan_unit_id: PNC-007
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Runtime PlanCompile is accepted as an implementation contract by a deterministic PlanUnit to NodeSeed to WorkGraph to WorkNodeRequest to Executor intake boundary. The compiler reads the frozen PlanUnit index, acceptance-unit index, dependencies, implementation-surface classifications, validation surfaces, source-control/project context snapshot, and runtime policy snapshot. It excludes retired, source-lineage-only, explicit future, and out-of-scope PlanUnits; converts accepted implementation PlanUnits into non-executable NodeSeed candidates with source PlanUnit refs, acceptance refs, objective, owner area, typed implementation surfaces, read/write candidates, validators, risk, reasoning tier, gui_related, capability requirements, and dependency refs; runs NodeSeed review for coverage, exclusion disposition, missing validators, authority, and sizing; constructs a WorkGraph draft using only typed executable-order edges; emits WorkNodeRequest records only after graph certification; hands requests to Executor intake for source-control, authority, model, test, and scheduler validation; and allows WorkNodeRecord materialization only inside the activation transaction after Executor intake is accepted. Completion certification authority is Goal Runtime's certifier using Executor receipts, test evidence, source-control receipts, runtime artifact refs, unresolved-item disposition, and Auditor/verification receipts. The readiness-guard removal path is: PNC-007 accepted, CV-287 concrete event registration accepted, runtime artifact schemas materialized or future-scoped, dependency graph acyclic, strict handoff/runtime validators green, PNC-019 executable lifecycle certification harness passed with recorded evidence, and node-readiness reporting runtime_enablement_status.compiler_contract_complete=true plus executable_lifecycle_certification_complete=true while no index-generated WorkNodes are emitted.
gui_related: false
gui_classification_reason: Runtime compiler algorithm design is backend/orchestration behavior.
depends_on: [PNC-001, PNC-002, PNC-003]
unblocks: [PNC-009, PNC-010, PNC-012, PNC-013, GRS-024]
acceptance_criteria:
  - The compiler algorithm names deterministic inputs, excluded dispositions, NodeSeed candidate fields, review gates, WorkGraph draft construction, WorkNodeRequest emission, Executor intake, activation, and completion certification authority.
  - PlanUnit index generation reports compiler_contract_complete=true when Plans are otherwise ready, but reports runtime_enabled=false and executable_lifecycle_certification_complete=false until the PNC-019 harness has passed and recorded evidence, while still reporting no_worknodes_created=true and nodeseed_candidates_created=false for index generation.
  - Runtime artifacts are produced only by implemented PlanCompile/Executor/Goal Runtime flows, never by editing Plans or regenerating Plans/.plan_index.
  - Accepted runtime flow does not depend on unresolved deferred PlanUnits.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/.plan_index/node_readiness_report.json
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: compiler_algorithm_contract
reasoning_tier: high
context_scope: runtime_compiler
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/plans_to_code_handoff.schema.json, Plans/prd_planning_runtime_contracts.json, Plans/.plan_index/node_readiness_report.json]
node_compile_hint: {mode: compiler_contract_complete, create_worknodes: false, create_nodeseeds: false, runtime_enabled: false, compiler_contract_complete: true, runtime_blocked_until: executable_lifecycle_certification_evidence}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0030
  - pldg-20260610-001-ledger-plan-system:q-0001
  - source_ref:chat:plan-to-node-deferred
preserved_exact_tokens: ["PlanUnit index", "node-readiness report", "NodeSeed", "WorkNode"]
negative_constraints:
  - Do not generate NodeSeeds, WorkNodes, executable queues, final node manifests, implementation files, or production build tasks from this documentation repair or from PlanUnit index generation.
  - Do not let PlanCompile bypass Executor intake, activation, Goal Runtime completion certification, or Auditor verification receipts.
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
  The current bootstrap/v1 PlanCompileRun is a durable, idempotent, resumable design-only state machine for converting approved Plans and PlanUnits into non-executable NodeSeed candidates, WorkGraph drafts, and WorkNode requests. The state record must carry compile_id, source_plan_set_id, source_plan_index_hash, launch_source, runtime_adapter, status, current_state, current_stage, cursor, last_green_stage, last_green_hashes, blockers, next_required_stage, resume_command_or_action, receipts, and compile_wave_contracts; last_green_stage and next_required_stage are stage_name | null, not free-form strings. Compile waves are bounded subagent assignment contracts: each wave names assignment_id, assigned_agent_role, source_item_refs, read_set, write_set, forbidden_writes, parent_only_writes, result_status, retry_route, resume_ref, durable_evidence_refs, assignment_receipt, completion_receipt, and parent_writeback_required so a parent compiler remains the only writer/adjudicator. retry_route uses the canonical compile_wave_retry_route object with route_kind, target_stage, reason, and optional resume_ref rather than free-form strings; target_stage is a stage_name, except terminal route kinds must use null. The shared compiler core has two adapters, a Codex bootstrap adapter and a native Puppet Master adapter, so the truth model stays shared while execution surfaces differ. Current bootstrap/v1 PlanCompile remains design_only_disabled with automatic_launch_enabled: false, planning_wizard_launch_enabled: false, and codex_bootstrap_launch_enabled: false until an explicit later enablement PlanUnit accepts runtime launch; native_runtime records use the separate PNC-015 branch and must not reinterpret v1 const-false flags as runtime enablement.
  Resume must be possible through a bounded stage card, stage cards, worklists, compile-wave result receipts, and a single goal prompt carrying the compile_id plus current state refs, and the Codex bootstrap adapter may package Codex work packages without native runtime dispatch. Do not depend on the native Puppet Master scheduler for bootstrap. The explicit no-build boundary is No WorkNodes, No NodeSeeds, No executable queues, No final node manifests, and PlanCompile dry-run/non-executable schema examples may be documented but not emitted as runtime work.
gui_related: false
gui_classification_reason: State machine and compiler adapter contracts are backend planning/runtime design, not visual presentation.
depends_on: [PNC-001, PNC-007, PNC-009]
unblocks: [PNC-011, PNC-012, PNC-013, PNC-014, GRS-028, OP-023, CV-289]
acceptance_criteria:
  - Current bootstrap/v1 PlanCompile stays design_only_disabled until explicit enablement.
  - The shared compiler core owns one truth model with Codex bootstrap and native Puppet Master adapters.
  - Resume is possible from durable state fields, source hashes, blockers, and exact NEXT routing without chat memory.
  - Compile-wave assignment contracts preserve bounded assignments, result status, retry/resume routes, durable evidence, and parent-only writes.
  - The state machine emits no executable WorkNodes, NodeSeeds, queues, final node manifests, implementation files, dispatched GoalRuns, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
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
  - "current_state"
  - "waves"
  - "receipts"
  - "shared compiler core"
  - "Codex bootstrap adapter"
  - "native Puppet Master adapter"
  - "one truth model"
  - "low quality agent"
  - "low context"
  - "resume"
  - "startable from one goal prompt"
  - "source hashes"
  - "exact NEXT routing"
  - "compile_wave_contracts"
  - "parent_only_writes"
  - "durable_evidence_refs"
  - "design_only"
  - "automatic_launch_enabled: false"
  - "planning_wizard_launch_enabled: false"
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
    Each design-only PlanCompile stage has a bounded stage_card with stage_id, purpose, read_files, write_files, forbidden_writes, entry_gate, item_boundaries, exit_gate, success_route, blocked_route, assignment_contract, and parent_writeback_policy so a low-context agent can execute or resume the stage from state after explicit runtime enablement, while the current bootstrap remains non-dispatching. Stage success_route and blocked_route use canonical route objects with route_kind, target_stage, reason, and optional resume_ref, and compile worklist blocked_route uses the same exact target object shape, rather than unrestricted strings. target_stage is a stage_name whenever the route chooses a next stage; terminal route kinds must set target_stage to null. Required stage contracts use the canonical registry: preflight_currentness, scope_selection, planunit_normalization, test_repository_discovery, typed_dependency_analysis, implementation_surface_mapping, work_risk_classification, nodeseed_candidate_drafting, split_merge_sizing, candidate_review, workgraph_construction, worknode_request_construction, final_compile_audit_repair, executor_handoff_certification, activation_transaction, and orchestrator_projection.
gui_related: false
gui_classification_reason: Stage cards and resumable worklists are compiler process contracts, not GUI implementation.
depends_on: [PNC-010]
unblocks: [PNC-012, PNC-013, PNC-014]
acceptance_criteria:
  - Every stage names stage_id, read/write/forbidden files, entry and exit gates, item bounds, and exact route objects.
  - A new low-context agent can resume from stage state without rereading the whole repo.
  - Stage cards never authorize WorkNodes, NodeSeeds as runtime artifacts, queues, implementation files, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
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
  NodeSeed candidates are non-executable intermediate artifacts. They carry source_plan_unit_ids, source_acceptance_unit_ids, objective, owner_area, implementation_surfaces, read_set, write_set_candidates, acceptance_criteria, validator_candidates, dependency_refs, risk_class, reasoning_tier, work_type, effort, gui_related, frontend_related, capability_requirements, authority policy, sizing, status, and blockers. The NodeSeed review gate proves coverage, excluded dispositions, acceptance criteria, validators or explicit gaps, bounded write surfaces, dependencies, GUI flags, risk/reasoning/capability metadata, and absence of executable WorkNodes before a WorkGraph draft can be considered. Review decision and reviewer_role use canonical node_seed_review_decision and node_seed_reviewer_role enums rather than free-form strings.
  NodeSeed routing metadata preserves effort_class, capability_lane, and capability_requirements alongside work_type, gui_related, frontend_related, and reasoning_tier before any reviewable candidate can be promoted to a WorkGraph draft.
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
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
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
  - "capability_requirements"
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
    WorkGraph draft is the first executable-shaped artifact but remains reviewable and non-dispatched before Executor intake. It carries nodes, entrypoints, dependency_edges, scheduler_policy, graph_integrity, authority, evidence, and validation_state. When a later explicit runtime enablement exists, PlanCompile may draft WorkNodeRequest records for review, not runnable WorkNodes. Each WorkNode request schema must carry source PlanUnit refs, objective, implementation surfaces, read/write candidates, acceptance criteria, validator candidates, dependency refs, work_type, gui_related, frontend_related, effort_class, reasoning tier, context size, validation cost, risk class, authority risk, user-visible risk, capability_lane, capability_requirements, test_binding, model routing, and ordering metadata. The design-only default build order records discovery, source-control/worktree/safe-point discovery, environment/toolchain setup, contracts/schemas/storage, core runtime/execution, providers/models/settings/permissions, GUI shell/navigation, features, integration/seams, automated tests/browser/device checks, source-control promotion, and final Auditor certification.
    WorkNode request ordering metadata explicitly carries build_phase, dependency_type, depends_on, unblocks, manual_priority, required_before_start, required_after_start, required_before_completion, required_after_completion, parallel_group_id, scheduler_lane, and ordering_reason. Its test_binding includes generated_test_ids, reused_test_ids, completion_commands, browser_session_required, emulator_required, visual_evidence_required, expected_artifacts, flake_policy, test_gap_policy, and manual_only_acceptance_not_allowed when automated evidence is required. The current repair records schema contracts only and emits no NodeSeeds, WorkNodes, executable queues, or build tasks.
gui_related: true
gui_classification_reason: WorkNode request routing includes GUI/frontend flags and user-visible risk metadata that drive visible routing and testing surfaces.
depends_on: [PNC-012, ATS-003]
unblocks: [EP-099, EP-100, EP-101, CV-289]
acceptance_criteria:
  - WorkGraph drafts remain reviewable and cannot dispatch before Executor intake.
  - Native runtime enablement may draft WorkNode requests, not runnable WorkNodes; the current repair emits no runtime artifacts.
  - Requests carry test binding, model routing, ordering, risk, GUI/frontend, authority, and validation metadata.
  - Default build order covers discovery, safe points, environment, contracts, runtime, providers, GUI shell, features, integrations, automated checks, promotion, and Auditor certification before execution is accepted, with manual priority and required-before/after start/completion relationships.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
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
  - "effort_class"
  - "capability_lane"
  - "capability_requirements"
  - "build_phase"
  - "dependency_type"
  - "manual_priority"
  - "required_before_start"
  - "required_after_start"
  - "required_before_completion"
  - "required_after_completion"
  - "parallel_group_id"
  - "scheduler_lane"
  - "ordering_reason"
  - "test_binding"
  - "reused_test_ids"
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
  Plan_To_Node_Compilation owns the Plan Compile side of the Plans-to-Code Handoff Matrix. Every transition from Planning Wizard Approve And Build approval and the PlanApproved handoff into PlanCompileRun state, then through PlanCompile, Executor intake, source-control preflight, dispatch, tests, Auditor verification, repair, promotion, graph completion, and certification must name row_id, transition, source_artifact, destination_artifact, producer, consumer, owner, validator, receipt, schema_payload, retry_route, rollback_route, user_escalation_condition, evidence_refs, and plan_unit_refs. For the current bootstrap/v1 matrix, Plan Compile source authority is the immutable ApprovedPlanPack plus frozen PlanUnit and acceptance-unit indexes; the Planning Wizard ledger remains source and reasoning lineage rather than executable Plan Compile authority. The shared `Plans/plans_to_code_handoff.schema.json` document keeps top-level `schema_id` at `pm.plans_to_code_handoff.v1`; within that stable document identity, the current bootstrap/v1 branch is the historical design_only contract with launch disabled, while PNC-015 owns the runtime-capable v2 native_runtime branch with runtime enablement evidence. The schema draft in Plans/plans_to_code_handoff.schema.json records handoff_matrix, handoff_row, PlanCompileRun, stage card, compile worklist, NodeSeed candidate, NodeSeed review, WorkGraph draft, WorkNode request, compiler model routing, Codex work package, Codex external GUI-agent request, PlanCompile receipt, automated testing reports, test cases, test run receipts, visual evidence, source-control receipts, WorkNode dispatch/change/completion receipts, Auditor cycle and verification receipts, repair attempt receipts, legacy validation_pass_report compatibility aliases, model resolution receipts, ExecutorIntakeReport, and GoalCompletionReceipt shapes for the disabled design_only branch plus the runtime-aware native_runtime branch; neither branch creates runtime artifacts by itself.
  The PlanApproved handoff records the approval_cas_receipt, transactional outbox requirement, and deterministic idempotency_key over project_id, pack identity/version/hash, PlanningRun revision, topic map version, PlanUnit and acceptance-unit index hashes, testing policy hash, project-context snapshot hash, and final audit/closure hash so approval cannot create duplicate or stale PlanCompileRun state. The handoff matrix names Plans to WorkNodes as a design-only bridge. Do not expose this bridge as a built Puppet Master setting. Its schema boundary is the single `Plans/plans_to_code_handoff.schema.json` draft, whose `$defs` include a concrete strict payload definition for every `artifact_kind` enum value and whose top-level discriminator maps each `artifact_kind` to the matching `payload` schema, including `handoff_matrix`, `handoff_row`, `plan_compile_run`, `node_seed_candidate`, `worknode_request`, `test_capability_report`, `source_control_receipt`, `source_control_preflight_receipt`, `worknode_dispatch_receipt`, `auditor_cycle_report`, `validation_pass_report`, and `goal_completion_receipt` while preserving source_artifact, destination_artifact, retry_route, rollback_route, and user_escalation_condition fields. Within that single schema_id=v1 draft, current bootstrap/v1 records use the historical design_only branch and runtime-capable v2 records use native_runtime only with runtime enablement evidence. H-001 through H-018 must remain present exactly once, and each row's schema_payload refs must resolve to concrete `$defs` or artifact_kind payloads. The historical per-artifact filename tokens `plan_compile_run.schema.json`, `node_seed_candidate.schema.json`, `worknode_request.schema.json`, and `test_capability_report.schema.json` are compatibility aliases for `$defs` in `Plans/plans_to_code_handoff.schema.json`, not separate schema files. The artifact-backed handoff can carry Plans to code completion only after Auditor verifies and final certification evidence closes the chain.
gui_related: false
gui_classification_reason: Handoff matrix and schema boundaries are backend contract and traceability surfaces.
depends_on: [PNC-010, PNC-011, PNC-012, PNC-013, PNC-015]
unblocks: [EP-102, GRS-030, POA-048, CV-289]
acceptance_criteria:
  - Every handoff names artifact, owner, validator, receipt, retry, rollback, and escalation route.
  - The schema draft records required artifact families without enabling PlanCompile.
  - The schema draft distinguishes the current bootstrap/v1 design_only branch from the PNC-015 runtime-capable v2 native_runtime branch.
  - The schema draft discriminates payload schemas by artifact_kind and defines every artifact_kind payload under $defs.
  - The row-by-row handoff matrix below maps every required transition to schema_payload, producer, consumer, evidence_refs, and PlanUnit refs.
  - Codex bootstrap external GUI-agent request is documented as a bootstrap artifact only, not a built Puppet Master setting.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: handoff_gap
reasoning_tier: high
context_scope: plans_to_code_handoff
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/Project_Output_Artifacts.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: handoff_matrix_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260618-001-prd-planning-wizard:atom-0002
  - pldg-20260618-001-prd-planning-wizard:atom-0101
  - pldg-20260618-001-prd-planning-wizard:atom-0102
  - pldg-20260618-001-prd-planning-wizard:atom-0103
  - pldg-20260618-001-prd-planning-wizard:atom-0104
  - pldg-20260618-001-prd-planning-wizard:atom-0105
  - pldg-20260618-001-prd-planning-wizard:atom-0106
  - pldg-20260618-001-prd-planning-wizard:atom-0109
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
source_atom_ids:
  - atom-0002
  - atom-0101
  - atom-0102
  - atom-0103
  - atom-0104
  - atom-0105
  - atom-0106
  - atom-0109
preserved_exact_tokens:
  - "Plan Compile"
  - "Planning Wizard"
  - "Approve And Build"
  - "ApprovedPlanPack"
  - "PlanApproved"
  - "approval_cas_receipt"
  - "transactional outbox"
  - "idempotency_key"
  - "project_id"
  - "pack_hash"
  - "PlanUnit index"
  - "acceptance-unit index"
  - "lineage"
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
  - "Plans/plans_to_code_handoff.schema.json"
  - "plan_compile_run"
  - "node_seed_candidate"
  - "worknode_request"
  - "test_capability_report"
  - "source_control_preflight_receipt"
  - "goal_completion_receipt"
  - "external GUI-agent CLI"
  - "custom CLI providers"
  - "provider_kind"
  - "plan_compile_run.schema.json"
  - "node_seed_candidate.schema.json"
  - "worknode_request.schema.json"
  - "test_capability_report.schema.json"
  - "Antigravity"
  - "Claude Code"
  - "Cursor"
  - "OpenCode"
  - "Codex parent verification"
  - "runtime-aware"
  - "design_only"
  - "native_runtime"
  - "runtime-capable v2"
negative_constraints:
  - Do not treat the Planning Wizard ledger as executable Plan Compile authority.
  - Do not treat the historical bootstrap/v1 design_only branch as runtime enablement.
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

#### Plans-To-Code Handoff Matrix Rows

These rows are design-only contract rows. They do not launch PlanCompile, create runtime NodeSeeds, dispatch WorkNodes, create executable queues, write implementation files, or produce production build tasks.

| row_id | transition | source_artifact | destination_artifact | producer | consumer | owner | validator | receipt | schema_payload | retry_route | rollback_route | user_escalation_condition | evidence_refs | plan_unit_refs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H-001 | Planning Wizard Approve And Build approval to current bootstrap/v1 design-only PlanCompileRun state | immutable ApprovedPlanPack plus frozen PlanUnit and acceptance-unit indexes plus PlanApproved event | current bootstrap/v1 PlanCompileRun state | Planning Wizard Approve And Build / PlanApproved outbox | Plan_To_Node_Compilation | Planning_Wizard + Plan_To_Node_Compilation + Contracts_V0 | ApprovedPlanPack currentness, approval CAS receipt, PlanUnit index hash, acceptance-unit index hash, design_only disabled gate | plan_compile_receipt | plan_compile_run | rerun currentness preflight or reissue PlanApproved from the same approved pack | no runtime mutation to roll back | true product decision, missing Approve And Build approval evidence, missing approval_cas_receipt, stale ApprovedPlanPack hash, or stale PlanUnit/acceptance-unit index hash | ApprovedPlanPack ref, PlanApproved/approval receipt ref, approval_cas_receipt ref, PlanUnit index ref, acceptance-unit index ref, compile state ref | PWIZ-010, PWIZ-014, PNC-010, PNC-015, CV-290, GRS-028, GRS-031 |
| H-002 | Compile state to bounded stage work | PlanCompileRun state | stage_card and compile_worklist | Plan_To_Node_Compilation | low-context compile adapter | Plan_To_Node_Compilation | stage entry/exit gate validation | plan_compile_receipt | stage_card, compile_worklist | regenerate bounded worklist from same source hashes | discard draft worklist | stage cannot name bounded read/write/forbidden surfaces | compile state ref, stage card ref, worklist ref | PNC-010, PNC-011 |
| H-003 | Stage work to non-executable NodeSeed candidate review | compile_worklist | NodeSeed candidate plus NodeSeed review | Plan_To_Node_Compilation | Plan_To_Node_Compilation review gate | Plan_To_Node_Compilation | coverage, exclusions, validators/gaps, GUI flags, no executable WorkNodes | plan_compile_receipt | node_seed_candidate, node_seed_review | split/merge candidate and rerun review | mark candidate excluded or blocked | source PlanUnit ambiguity or authority boundary | candidate ref, review ref, coverage ref | PNC-012 |
| H-004 | Reviewed candidates to WorkGraph draft | approved NodeSeed reviews | WorkGraph draft | Plan_To_Node_Compilation | Executor intake preview | Plan_To_Node_Compilation | graph integrity, dependencies, scheduler policy, authority | plan_compile_receipt | workgraph_draft | repair graph edges or candidate sizing | return to NodeSeed review | irreconcilable dependency cycle or authority conflict | workgraph ref, candidate refs, graph validation ref | PNC-012, PNC-013 |
| H-005 | WorkGraph draft to WorkNode request draft | WorkGraph draft node | non-executable WorkNodeRequest | Plan_To_Node_Compilation | Executor intake | Plan_To_Node_Compilation + Automated_Testing_System + Models_System | request completeness, test_binding, model routing, ordering, risk, authority | plan_compile_receipt | worknode_request, compiler_model_routing, test_binding, ordering | regenerate request from reviewed graph node | return request to graph draft | missing acceptance criteria, missing test capability, or unsafe authority | request ref, model routing ref, test binding ref | PNC-013, ATS-003, MS-111 |
| H-006 | WorkNode request to Executor intake | WorkNodeRequest | ExecutorIntakeReport | Executor intake | Executor scheduler/runtime | Executor_Protocol | graph/source-control/test/model/authority/readiness checks | executor_intake_report | executor_intake_report | repair request metadata and resubmit intake | leave request non-runnable | rejected authority, missing source-control preflight, or missing tests | intake report ref, rejected/accepted request refs | EP-099, PNC-013 |
| H-007 | Executor intake to source-control preflight | accepted request plus repo/worktree context | source-control preflight and source-control execution context | Executor_Protocol | WorktreeGitImprovement / FileSafe / GitHub optional promotion | Executor_Protocol + WorktreeGitImprovement + FileSafe | repo/worktree/baseline/safe-point policy validation | source_control_preflight_receipt | source_control_preflight_receipt, source_control_receipt | refresh worktree/safe-point context | restore from safe point or block before mutation | missing credential, unsafe dirty state, conflict, or rollback unavailable | repo ref, worktree ref, baseline ref, safe-point ref | EP-100, W-072, F2-189 |
| H-008 | Source-control preflight to safe point | validated source-control preflight | safe-point receipt | WorktreeGitImprovement / FileSafe | Executor_Protocol | FileSafe + WorktreeGitImprovement | safe point created and restorable | safe_point_receipt | safe_point_receipt | retry snapshot/safe-point creation | no mutation after failed safe point | snapshot failure or destructive action without rollback | safe-point ref, restore action ref | EP-100, W-072, F2-189 |
| H-009 | Accepted request to dispatch receipt | accepted request plus preflight/model/test refs | WorkNode dispatch receipt | Executor scheduler/runtime | WorkNode executor | Executor_Protocol | dispatch boundary, capacity, model, authority, test binding | worknode_dispatch_receipt | worknode_dispatch_receipt | requeue after transient capacity or model issue | cancel dispatch before mutation or restore safe point | unavailable model/tool, authority block, or capacity exhaustion | dispatch ref, model ref, preflight ref, test binding ref | EP-099, EP-100, EP-101, EP-103 |
| H-010 | Work execution to change receipt | dispatched WorkNode plus safe point | WorkNode change receipt | WorkNode executor | Executor verifier | Executor_Protocol | changed paths, diffs, source-control receipt, test refs | worknode_change_receipt | worknode_change_receipt | rerun bounded repair or request graph patch | restore safe point or revert diff | write-surface violation, conflict, or unreviewable diff | diff refs, changed paths, source-control refs | EP-103, W-072 |
| H-011 | Test capability discovery to test strategy | project surface and WorkNode request | capability/probe/strategy/test case artifacts | Automated_Testing_System | Executor intake and verifier | Automated_Testing_System | capability discovery, probe command, oracle, gap blocker validation | test_capability_report, test_harness_probe_report | test_capability_report, test_harness_probe_report, test_strategy, test_case | probe alternate harness or create deferred test-harness request candidate after enablement | block completion without marking pass | no automated capability, missing runner, or official testing option requires research | capability report ref, probe ref, strategy ref, test case refs | ATS-001, ATS-002, ATS-003 |
| H-012 | Test execution to automated evidence | changed artifact refs plus test strategy | TestRunReceipt and visual evidence | Automated_Testing_System / Executor verifier | Auditor loop and completion certification | Automated_Testing_System + Executor_Protocol | command result, expected artifacts, evidence refs, flake policy, manual-only block | test_run_receipt | test_run_receipt, visual_evidence | rerun or quarantine per flake policy | restore safe point if test reveals unsafe change | required automation unavailable or visual evidence missing | test run ref, screenshots/log refs, visual evidence refs | ATS-004, EP-101 |
| H-013 | Test/source-control evidence to Auditor cycle | change/test/source-control/model receipts | Auditor cycle report and verification receipt | Auditor Model loop | Executor repair/completion | Models_System + Goal_Runtime_System + Executor_Protocol | audit, bounded repair, re-audit until certified or blocked | auditor_verification_receipt | auditor_cycle_report, auditor_verification_receipt | run bounded repair cycle | restore/revert via safe point when repair invalidates source state | critical block, authority boundary, or repair budget exhausted | auditor cycle refs, verification ref, finding refs | MS-110, GRS-028, EP-102, EP-103 |
| H-014 | Legacy validation pass compatibility mirror | Auditor cycle report | legacy validation_pass_report mirror | Project_Output_Artifacts compatibility bridge | import/export/search consumers | Project_Output_Artifacts + Contracts_V0 | compatibility_only true and cycle_report_ref present | validation_pass_report | validation_pass_report | regenerate mirror from canonical Auditor cycle | discard mirror; canonical cycle remains authoritative | legacy import cannot map pass fields to Auditor cycle | cycle report ref, legacy mirror ref | POA-047, CV-289, MS-110 |
| H-015 | Auditor finding to repair attempt | Auditor unresolved finding | repair attempt receipt | Executor repair loop | Auditor re-audit | Executor_Protocol + Goal_Runtime_System | failure signature, repair strategy, changed refs, rerun tests | repair_attempt_receipt | repair_attempt_receipt | choose alternate repair strategy or escalate internal lane | restore last safe point on failed repair | repeated signature, authority boundary, or unsafe external effect | failure signature ref, repair ref, test refs | EP-102, GRS-029 |
| H-016 | Source-control finalization or optional promotion | verified changes and source-control receipts | final source-control or promotion receipt | WorktreeGitImprovement / GitHub optional promotion | Goal completion certification | WorktreeGitImprovement + GitHub_Integration + FileSafe | local truth, final branch/commit, PR/checks when configured | source_control_finalization_receipt, merge_or_promotion_receipt | source_control_finalization_receipt, merge_or_promotion_receipt | retry merge/promotion after conflicts/check repair | restore safe point or preserve intentional dirty state | credential, remote conflict, failed checks, or irreversible external side effect | branch/commit refs, PR/check refs, local finalization ref | W-072, GI-031, EP-103 |
| H-017 | Terminal WorkNode to completion receipt | change/test/Auditor/source-control receipts | WorkNode completion receipt | Executor_Protocol | Goal Runtime certification | Executor_Protocol + Goal_Runtime_System | terminal status, unresolved findings, receipts complete | worknode_completion_receipt | worknode_completion_receipt | re-open repair loop for unresolved finding | restore/revert failed terminal change | unresolved finding or missing child receipt | completion ref, test refs, source-control refs | EP-103, GRS-030 |
| H-018 | All terminal receipts to GoalCompletionReceipt | terminal WorkNode receipts plus final evidence | GoalCompletionReceipt | Goal Runtime certifier | Runtime Artifacts / Project_Output_Artifacts / Orchestrator projection | Goal_Runtime_System + Project_Output_Artifacts | all terminal, tests dispositioned, source-control valid, Auditor passed, no blockers, currentness clean | goal_completion_receipt | goal_completion_receipt | re-open affected WorkNode or graph patch lane | preserve/revert final source state per safe-point policy | active blocker, stale Plan/WorkGraph, failed Auditor, or missing final evidence | child receipts, WorkNode receipts, validator refs, evidence refs | GRS-030, POA-048, RAP-029, OP-024 |

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PNC-015 - Runtime-Capable PlanCompile v2 Boundary

```yaml
plan_unit_id: PNC-015
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: 'The Approved Plan Pack carries a hash-addressed project-context snapshot containing repository identity, host, path, branch, remotes, dirty state, codebase scan facts, test-capability facts, and currentness conditions, and the approval_cas_receipt binds that snapshot to the exact PlanningRun revision, topic map version, pack hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, and final audit/closure hash shown at final review. Plan Compile and Executor provisioning must compare live repository and environment state against the approved snapshot and route stale facts through bounded re-analysis or recompile rather than executing against invalid assumptions. Keep the current plans-to-code handoff v1 schema_id as the stable shared schema document for the historical design-only contract with launch disabled, and introduce the versioned runtime-capable v2 identity as the native_runtime branch inside that document rather than silently changing v1 branch semantics. The runtime schema includes contract_mode, launch_policy, runtime_adapter, runtime_enablement_ref, and runtime_policy_snapshot_ref; the design_only branch preserves const-false launch gates, while the finished-product native_runtime branch defaults to automatic_after_approval through native_puppet_master_adapter and requires runtime enablement evidence. PlanCompileRun persists stage, cursor,
  bounded worklists, assignment receipts, source hashes, currentness status, blockers, repairs, artifacts, retries, cancellation, supersession, and exact next action across context and process restarts. Changes after approval create successor ApprovedPlanPack versions; during compilation or execution a PlanDiffImpactReport classifies unaffected, already safe, needs recompile, and invalidated lanes and only continues unaffected work when dependencies and write surfaces prove safety. The PlanUnit index/readiness Goal regenerates only allowed Plans/.plan_index outputs, reports exact blockers, and creates no WorkNodes, NodeSeeds, candidates, executable queues, implementation files, or production tasks.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: [PNC-014, CV-289, CV-290]
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- "`Plans/plans_to_code_handoff.schema.json` carries `contract_mode`, `launch_policy`, `runtime_adapter`, `runtime_enablement_ref`, and `runtime_policy_snapshot_ref` in the `plan_compile_run` schema; its design_only branch preserves const-false launch gates for the current disabled contract, and its native_runtime branch allows automatic_after_approval only with runtime enablement evidence."
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/plans_to_code_handoff.schema.json
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/bootstrap/Codex_Prompts.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0077
- pldg-20260618-001-prd-planning-wizard:atom-0078
- pldg-20260618-001-prd-planning-wizard:atom-0109
- pldg-20260618-001-prd-planning-wizard:atom-0110
- pldg-20260618-001-prd-planning-wizard:atom-0111
- pldg-20260618-001-prd-planning-wizard:atom-0129
- pldg-20260618-001-prd-planning-wizard:atom-0164
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/09-bootstrap-prompts-and-transfer.md#SRC-PROMPTS
source_atom_ids:
- atom-0077
- atom-0078
- atom-0109
- atom-0110
- atom-0111
- atom-0129
- atom-0164
decision_refs:
- dec-0022
correction_refs: []
preserved_exact_tokens:
- project-context snapshot
- currentness
- revalidate
- stale facts
- design_only
- runtime-capable v2
- contract_mode
- launch_policy
- runtime_adapter
- native_puppet_master_adapter
- PlanCompileRun
- resume
- PlanDiffImpactReport
- unaffected
- needs_recompile
- invalidated
- node_readiness_report
- no WorkNodes
negative_constraints:
- Do not reinterpret existing const-false v1 launch flags as runtime enablement.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/plans_to_code_handoff.schema.json
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/bootstrap/Codex_Prompts.md
```

### PNC-016 - Runtime Stage Cards, Parallel Worklists, And Typed Dependencies

```yaml
plan_unit_id: PNC-016
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: 'Define executable stage cards for preflight and currentness, scope selection, PlanUnit normalization, test and repository discovery, typed dependency analysis, implementation-surface mapping, work and risk classification, NodeSeed candidate drafting, split or merge sizing, independent candidate review, WorkGraph construction, WorkNodeRequest construction, final compile audit and repair, Executor handoff certification, activation transaction, and Orchestrator projection. Each stage card defines exact inputs, outputs, algorithms, bounded units, read/write authority, required parallelism, validators, retry and repair routes, currentness behavior, terminal states, and evidence/receipt requirements. For broad stages the controller computes a bounded worklist and mandatory minimum parallel assignments, launches read-only subagents, records assignment and completion receipts, and rejects certification when required parallel work is absent. A required broad stage may reduce scope or
  block with a typed runtime-capability error, but it may not silently substitute one broad agent for mandatory parallel analysis or review. Plan Compile distinguishes owner_reference, consumer_reference, contract_dependency, validation_dependency, build_dependency, runtime_prerequisite, required-before-start, required-before-completion, and write-conflict serialization; only executable ordering edges participate in WorkGraph acyclicity. Plan Compile may draft NodeSeed candidates as generated intermediate proposals with source PlanUnit coverage, objectives, surfaces, dependencies, capabilities, risks, tests, and sizing, but they are not runtime WorkNodes. A certified WorkNodeRequest has non-empty objective, source PlanUnits and acceptance units, bounded read/write/implementation surfaces, typed dependencies, authority, model/capability routing, test binding, repository currentness, evidence requirements, idempotency, cancellation, and no unsupported or placeholder
  content.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Plan_To_Node_Compilation.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_Document_System.md
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0112
- pldg-20260618-001-prd-planning-wizard:atom-0113
- pldg-20260618-001-prd-planning-wizard:atom-0114
- pldg-20260618-001-prd-planning-wizard:atom-0115
- pldg-20260618-001-prd-planning-wizard:atom-0116
- pldg-20260618-001-prd-planning-wizard:atom-0117
- pldg-20260618-001-prd-planning-wizard:atom-0118
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
source_atom_ids:
- atom-0112
- atom-0113
- atom-0114
- atom-0115
- atom-0116
- atom-0117
- atom-0118
decision_refs:
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0008
preserved_exact_tokens:
- stage card
- NodeSeed candidate
- WorkGraph
- WorkNodeRequest
- inputs
- outputs
- required parallelism
- terminal states
- minimum_parallel_assignments
- assignment receipt
- completion receipt
- parallelism_required
- runtime-capability blocker
- typed dependency
- build_dependency
- runtime_prerequisite
- write_conflict_serialization
- intermediate
- objective
- acceptance units
- test binding
negative_constraints:
- Do not accept agent self-report as proof that required parallel subagents were used.
- Do not silently degrade a mandatory parallel stage to one agent.
- Do not dispatch or execute a NodeSeed candidate.
owner_hints:
- Plans/Plan_To_Node_Compilation.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_Document_System.md
- Plans/Executor_Protocol.md
```

### PNC-017 - Compile Readiness Fixtures And No-Runtime-Artifact Boundary

```yaml
plan_unit_id: PNC-017
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: 'A context-aware incomplete-content validator runs at Planning Wizard approval, Plan Compile certification, WorkNode completion, and Goal completion across active Plans, compile artifacts, first-party code, tests, generated outputs, and delivery artifacts. Every material plan and compile claim must trace to an Approved PRD Pack, user planning answer, accepted Planning Amendment, repository fact, reference artifact, explicit system policy, or recorded assumption; unsupported invented claims are audit defects. Implementation readiness of the complete pipeline requires a clean-room fixture proving Approve And Build creates exactly one PlanCompileRun, executes mandatory parallel stages, certifies a complete WorkGraph and WorkNodeRequests, passes Executor intake/provisioning, atomically creates GoalRun and WorkNodes, queues an entrypoint, and appears in Orchestrator. The fixture suite covers duplicate PlanApproved delivery, restart during
  every activation step, greenfield Git, non-Git FileSafe, dirty repository, remote SSH, optional GitHub or PR, missing harness, testing override, plan revision during compile and execution, cancellation before and after mutation, missing parallel receipts, and a deliberately introduced incomplete item. Ledger-to-Plans compilation writes or updates canonical Plans and allowed PlanUnit indexes only in their proper phases; it does not start Plan Compile, create WorkNodes, launch GoalRuns, modify implementation code, or start an Orchestrator build.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: implementation_readiness
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Wizard.md
- Plans/Executor_Protocol.md
- Plans/Progression_Gates.md
- Plans/Plan_Document_System.md
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0137
- pldg-20260618-001-prd-planning-wizard:atom-0142
- pldg-20260618-001-prd-planning-wizard:atom-0145
- pldg-20260618-001-prd-planning-wizard:atom-0146
- pldg-20260618-001-prd-planning-wizard:atom-0168
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/09-bootstrap-prompts-and-transfer.md#SRC-PROMPTS
source_atom_ids:
- atom-0137
- atom-0142
- atom-0145
- atom-0146
- atom-0168
decision_refs:
- dec-0027
- dec-0028
- dec-0030
correction_refs: []
preserved_exact_tokens:
- Planning Wizard approval
- Plan Compile certification
- WorkNode completion
- Goal completion
- traceability
- unsupported claim
- clean-room fixture
- exactly one PlanCompileRun
- entrypoint queued
- duplicate PlanApproved
- dirty repository
- missing parallel receipts
- deliberately introduced incomplete item
- ledger-to-Plans
- not runtime
negative_constraints:
- Do not certify invented planning details with no source or explicit assumption.
- Do not confuse the bootstrap compile Goal with the finished-product Approve And Build runtime.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Progression_Gates.md
- Plans/Plan_Document_System.md
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/Planning_Ledger_System.md
```

### PNC-018 - Runtime Contract Packet And Readiness Gate

```yaml
plan_unit_id: PNC-018
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: 'Implementation readiness for PRD Builder, Planning Wizard, Plan Compile, WorkNodeRequest, Executor activation, and Orchestrator launch depends on the strict runtime contract packet in Plans/prd_planning_runtime_contracts.json plus the shared handoff schema in Plans/plans_to_code_handoff.schema.json. The runtime contract packet instantiates stage-specific Plan Compile cards, Native Ledger Service operations, discriminated ProjectContextSnapshot variants, PRD source projection and extraction records, Planning topic-map operations, WorkNodeRecord and attempt records, activation state/outbox records, visible testing records, typed UI command contracts, clean-room positive and negative scenarios, and retired Chain Wizard search exclusions. The standard run-gates include scripts/pm-prd-planning-runtime-validate.py so unresolved local schema refs, generic stage algorithms, impossible terminal success records, empty valid WorkGraphs, zero-request certified compiles, false-integrity activation, no-evidence visible test passes, and current-name-as-legacy tautologies cannot be used as certification evidence. node_compile_hint.create_worknodes=false in bootstrap PlanUnits means no WorkNodes are emitted during planning/governance compiles; it does not exclude accepted product requirements from later native Plan Compile once runtime enablement evidence, strict contracts, and executor intake are available.'
gui_related: false
gui_classification_reason: Runtime/schema/validator contract, not visual presentation.
depends_on: [PNC-013, PNC-014, PNC-016, PNC-017, PLS-015]
unblocks: [EP-104, EP-105, GRS-031, UCC-098]
acceptance_criteria:
- Plans/prd_planning_runtime_contracts.json validates against Plans/prd_planning_runtime_contracts.schema.json.
- WorkNodeRequest carries source PlanUnit and acceptance-unit refs plus direct acceptance, validator, test, model, authority, capability, ordering, and evidence fields.
- Valid WorkGraph and certified compile states require non-empty nodes, entrypoints, WorkNodeRequests, evidence, and closure receipts.
- Retired Chain Wizard docs are excluded from active product/runtime search or treated only as compatibility/source-lineage evidence.
validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
- python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
- python3 scripts/pm-plans-verify.py run-gates
risk_class: implementation_readiness
reasoning_tier: high
context_scope: prd_planning_runtime_contracts
implementation_surfaces:
- Plans/Plan_To_Node_Compilation.md
- Plans/plans_to_code_handoff.schema.json
- Plans/prd_planning_runtime_contracts.json
- Plans/prd_planning_runtime_contracts.schema.json
- scripts/pm-prd-planning-runtime-validate.py
- scripts/pm-plans-verify.py
node_compile_hint:
  mode: runtime_contract_readiness_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Plan_To_Node_Compilation.md#PNC-013
- Plans/Plan_To_Node_Compilation.md#PNC-016
- Plans/Plan_To_Node_Compilation.md#PNC-017
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-002
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-003
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-005
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-006
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-017
preserved_exact_tokens:
- stage cards
- ProjectContextSnapshot
- WorkNodeRequest
- WorkNodeRecord
- activation_pending
- BuildStarted
- zero-incomplete
- clean-room fixture
- node_compile_hint
negative_constraints:
- Do not mark runtime readiness from file presence or JSON parse alone.
- Do not treat create_worknodes:false as a product requirement exclusion.
- Do not use legacy Chain Wizard PlanUnits as active product search authority.
owner_hints:
- Plans/Plan_To_Node_Compilation.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/Planning_Ledger_System.md
- Plans/UI_Command_Catalog.md
```

### PNC-019 - Static Scenario Boundary And Executable Certification Requirement

```yaml
plan_unit_id: PNC-019
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: 'The clean-room positive and negative scenarios in Plans/prd_planning_runtime_contracts.json are contract fixtures and certification targets, not proof that Approve And Build, Plan Compile, Executor intake, activation, Orchestrator projection, testing, or source-control behavior has executed. Runtime readiness after explicit enablement requires an executable certification harness that drives the full lifecycle from immutable ApprovedPlanPack and PlanApproved through currentness preflight, mandatory parallel stage execution, WorkGraph and WorkNodeRequest certification, Executor intake, atomic activation, queued entrypoint, visible Orchestrator projection, testing evidence, cancellation/restart cases, and negative-case rejection. Static JSON parse, required-file existence, schema validation, and contract-scenario presence are necessary preconditions only; they cannot by themselves mark the native pipeline ready. The node-readiness report must remain blocked until either runtime is intentionally disabled or the executable certification harness has passed and recorded evidence for the enabled runtime boundary.'
gui_related: false
gui_classification_reason: Certification harness and readiness gates are runtime/governance contracts, not visual presentation.
depends_on: [PNC-017, PNC-018]
unblocks: []
acceptance_criteria:
- Contract scenarios are labeled as static certification targets rather than executable proof.
- Native runtime readiness requires executable lifecycle evidence once runtime launch is enabled.
- File presence, JSON parse, and schema validation alone cannot certify Approve And Build or Plan Compile implementation readiness.
- Negative scenarios must be executed by the harness after enablement, not merely listed in the contract packet.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: static_fixture_false_certification
reasoning_tier: high
context_scope: executable_runtime_certification_boundary
implementation_surfaces:
- Plans/Plan_To_Node_Compilation.md
- Plans/prd_planning_runtime_contracts.json
- Plans/prd_planning_runtime_contracts.schema.json
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: executable_certification_required_after_enablement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- external_report:PRD_Planning_Runtime_Second_Sweep/static_fixture_gap
- external_report:PRD_Planning_Runtime_Second_Sweep/runtime_readiness_false_positive_gap
preserved_exact_tokens:
- clean-room fixture
- executable end-to-end tests
- Approve And Build
- PlanCompileRun
- Executor intake
- atomic activation
- Orchestrator projection
- runtime readiness
negative_constraints:
- Do not treat static JSON fixtures as executable lifecycle tests.
- Do not mark native runtime ready from required files existing or parsing.
- Do not certify implementation readiness before an executable harness proves the lifecycle after runtime enablement.
owner_hints:
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Automated_Testing_System.md
```

## Ledger Compile Addendum - pldg-20260622-001-fff

### PNC-020 - Discovery WorkNode Intake Future Boundary

```yaml
plan_unit_id: PNC-020
unit_type: constraint
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  WorkNode and Plan-to-Node discovery references are future_boundary_only. They may provide a backlink and future conformance expectation for Plans/Plan_To_Node_Compilation.md, but they are excluded from current runtime conformance proof and compile readiness. This compile creates no WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks. Future compiler work must preserve exact verification requirements inherited from source PlanUnits before any runtime enablement.
gui_related: false
gui_classification_reason: This is a Plan-to-Node compiler boundary and execution-artifact constraint.
depends_on: [PNC-001, PNC-004, T-161, OSI-429]
unblocks: [ATS-011]
acceptance_criteria:
  - WorkNode discovery references are future conformance expectations only.
  - Node-readiness/index outputs do not create WorkNodes, NodeSeeds, queues, manifests, launches, implementation files, or build tasks.
  - Runtime conformance proof is not required for the disabled future compiler boundary.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/.plan_index/node_readiness_report.json
risk_class: execution_boundary
reasoning_tier: standard
context_scope: plan_to_node_future_boundary
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/.plan_index/node_readiness_report.json]
node_compile_hint: {mode: future_boundary_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0027
  - pldg-20260622-001-fff:atom-0030
  - pldg-20260622-001-fff:atom-0037
  - pldg-20260622-001-fff:atom-0043
  - pldg-20260622-001-fff:atom-0058
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:atom-0094
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#worknode_intake_future_contract
source_atom_ids: [atom-0027, atom-0030, atom-0037, atom-0043, atom-0058, atom-0059, atom-0092, atom-0094]
preserved_exact_tokens: ["future_boundary_only", "WorkNode", "Plan-to-Node", "excluded from current runtime conformance proof", "No WorkNodes", "NodeSeeds", "executable queues", "final node manifests", "runtime launches"]
negative_constraints:
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks.
  - Do not treat future WorkNode intake rows as current runtime readiness or creation permission.
owner_hints: [Plans/Plan_To_Node_Compilation.md]
```
