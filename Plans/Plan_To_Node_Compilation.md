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

## FABLE Residual Plan-To-Node Contract Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High Plan-to-Node contract rows for schema authority and disabled-runtime readiness projections. It does not create WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks.

### PNC-023 - FABLE Residual NodeSeed Schema And Readiness Boundary

```yaml
plan_unit_id: PNC-023
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  The authoritative NodeSeed candidate schema is Plans/plans_to_code_handoff.schema.json#/$defs/node_seed_candidate.
  Prose field lists in Plan_To_Node_Compilation are explanatory summaries only and must not drift into a second schema.
  While the WorkNode compiler remains disabled, generated readiness projections may report blocked_runtime_certification_incomplete
  for runtime certification and hard_disabled for runtime gate state; neither status authorizes WorkNode creation or execution.
gui_related: false
gui_classification_reason: Plan-to-Node schema and readiness projection rules are compiler governance contracts, not visual surfaces.
depends_on: [PNC-004, PNC-010, PNC-012, PNC-014, PNC-016, PNC-019, PNC-021]
unblocks: []
acceptance_criteria:
  - NodeSeed candidate contract references resolve to Plans/plans_to_code_handoff.schema.json#/$defs/node_seed_candidate as the single schema authority.
  - PNC prose field lists are explicitly non-authoritative summaries and must include a schema pointer when they name NodeSeed fields.
  - compile_wave_retry_route uses the schema enum values and records route_kind, reason_code, failed_plan_unit_ids[], retry_after_ms?, and owner_doc_refs[].
  - node_readiness_report may retain node_readiness_status = blocked_runtime_certification_incomplete while plan-to-node runtime gates remain hard_disabled.
  - No PlanUnit index, readiness report, or migration proof output may be interpreted as WorkNode, NodeSeed, executable queue, final node manifest, runtime launch, implementation file, or production build task creation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
risk_class: fable_residual_plan_to_node_schema_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/plans_to_code_handoff.schema.json
  - Plans/.plan_index/node_readiness_report.json
node_compile_hint:
  mode: residual_node_seed_schema_readiness_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1171
  - fablereport.md:1172
  - fablereport.md:1173
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "NodeSeed"
  - "node_seed_candidate"
  - "compile_wave_retry_route"
  - "blocked_runtime_certification_incomplete"
  - "hard_disabled"
negative_constraints:
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks.
  - Do not treat schema presence, index generation, or migration hashes as runtime certification.
  - Do not introduce a second NodeSeed schema in prose.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/plans_to_code_handoff.schema.json
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
  Runtime PlanCompile is accepted as an implementation contract by a deterministic PlanUnit to NodeSeed to WorkGraph to WorkNodeRequest to Executor intake boundary. The compiler reads the frozen PlanUnit index, acceptance-unit index, dependencies, implementation-surface classifications, validation surfaces, source-control/project context snapshot, and runtime policy snapshot. It excludes retired, source-lineage-only, explicit future, and out-of-scope PlanUnits; converts accepted implementation PlanUnits into non-executable NodeSeed candidates with source PlanUnit refs, acceptance refs, objective, owner area, typed implementation surfaces, read/write candidates, validators, risk, reasoning tier, gui_related, capability requirements, and dependency refs; runs NodeSeed review for coverage, exclusion disposition, missing validators, authority, and sizing; constructs a WorkGraph draft using only typed executable-order edges; emits WorkNodeRequest records only after graph certification; hands requests to Executor intake for source-control, authority, model, test, and scheduler validation; and allows WorkNodeRecord materialization only inside the activation transaction after Executor intake is accepted. The readiness-guard removal path is: PNC-007 accepted, CV-287 concrete event registration accepted, runtime artifact schemas materialized or future-scoped, dependency graph acyclic, strict handoff/runtime validators green, PNC-019 executable lifecycle certification harness passed with recorded evidence, and node-readiness reporting runtime_enablement_status.compiler_contract_complete=true plus executable_lifecycle_certification_complete=true while no index-generated WorkNodes are emitted.
gui_related: false
gui_classification_reason: Runtime compiler algorithm design is backend/orchestration behavior.
depends_on: [PNC-001, PNC-002, PNC-003]
unblocks: [PNC-009, PNC-010, PNC-012, PNC-013, GRS-024]
acceptance_criteria:
  - The compiler algorithm names deterministic inputs, excluded dispositions, NodeSeed candidate fields, review gates, WorkGraph draft construction, WorkNodeRequest emission, Executor intake, and activation.
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
  - Do not let PlanCompile bypass Executor intake, activation, or Auditor verification receipts.
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
  Canonical Plans may reference owner-defined Orchestrator-facing WorkGraph, WorkNode, WorkNodeReceipt, and CapabilityLane concepts for future implementation, but Plan_To_Node_Compilation owns only the compiler artifact boundary. Plan/PlanUnit, Node Graph, and Run Graph surfaces may display readiness, blockers, gui_related, receipt status, and compiler contract state from owner projections, but they do not create executable runtime artifacts. Ledger-to-Plans compilation and PlanUnit indexing must not emit executable queues, final node manifests, final build tasks, production build tasks, actual WorkNode artifacts, or NodeSeed candidates before this compiler contract defines those artifacts.
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
  A WorkNode is a bounded executable unit that the compiler contract produces only through this review gate, a WorkGraph draft and a WorkNodeRequest admitted at Executor intake (PNC-013); this contract emits none. It is bounded so that low-end agents can execute it where its routing allows: only a node whose work_type and routing tags (effort_class, capability_lane, reasoning_tier) describe small, low-risk, non-GUI implementation may take the Easy, routine jobs route (low_effort_worker, MS-109); review, validation and other checking work and difficult work never take that route (MS-111), and every other node resolves under MS-109 and MS-111 to the job its metadata names, each on the model the user configured for that job. Each WorkNode executes under exact input/output contracts and under write-surface, evidence and verification contracts. Its input/output contracts are the NodeSeed fields source_plan_unit_ids, objective, implementation_surfaces, read_set, write_set_candidates, acceptance_criteria and validator_candidates, which the WorkNodeRequest carries as source PlanUnit refs, objective, implementation surfaces, read/write candidates, acceptance criteria and validator candidates. Its write-surface contract is write_set_candidates, bounded at this review gate. Its evidence and verification contracts are its validator candidates and the WorkNodeRequest test_binding (generated_test_ids, reused_test_ids, completion_commands, expected_artifacts and visual_evidence_required). A WorkNode executor's success covers only its own node: it never certifies global completion, which stays with the final Auditor certification that ends the build order (PNC-013).
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
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0017
  - pldg-20260616-002-orchestrator-goal-runtime-flow:corr-0012
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
  - "WorkNode"
  - "bounded executable unit"
  - "low-end agents"
  - "input/output contracts"
  - "write-surface"
  - "evidence"
  - "verification contracts"
negative_constraints:
  - Do not treat NodeSeeds as final WorkNodes.
  - Do not emit NodeSeed candidates as runtime artifacts in this compile.
  - Do not let WorkNode executors certify global completion.
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

Persisted PlanCompile, handoff, and certification events consume the canonical EventRecord envelope in `Plans/Contracts_V0.md#EventRecord` and `Plans/event_record.schema.json`. This document may name event semantics, receipts, and PlanCompile artifacts, but it must not copy the EventRecord field set or treat EventRecord schema materialization as runtime enablement.

### PNC-014 - Plans-To-Code Handoff Matrix And Schema Boundary

```yaml
plan_unit_id: PNC-014
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Plan_To_Node_Compilation owns the Plan Compile side of the Plans-to-Code Handoff Matrix. Every transition from Planning Wizard Approve And Build approval and the PlanApproved handoff into PlanCompileRun state, then through PlanCompile, Executor intake, source-control preflight, dispatch, tests, Auditor verification, repair, promotion, graph completion, and certification must name row_id, transition, source_artifact, destination_artifact, producer, consumer, owner, validator, receipt, schema_payload, retry_route, rollback_route, user_escalation_condition, evidence_refs, and plan_unit_refs. For the current bootstrap/v1 matrix, Plan Compile source authority is the immutable ApprovedPlanPack plus frozen PlanUnit and acceptance-unit indexes; the Planning Wizard ledger remains source and reasoning lineage rather than executable Plan Compile authority. The shared `Plans/plans_to_code_handoff.schema.json` document keeps top-level `schema_id` at `pm.plans_to_code_handoff.v1`; within that stable document identity, the current bootstrap/v1 branch is the historical design_only contract with launch disabled, while PNC-015 owns the runtime-capable v2 native_runtime branch with runtime enablement evidence. PlanCompile and handoff rows consume the Executor-owned `execution_unit_context` contract only by reference through `Plans/Executor_Protocol.md` and `Plans/execution_unit_context.schema.json`; they must not define a local field list, omit schema_version from persisted context payloads, or persist secrets in context payloads. The schema draft in Plans/plans_to_code_handoff.schema.json records handoff_matrix, handoff_row, PlanCompileRun, stage card, compile worklist, NodeSeed candidate, NodeSeed review, WorkGraph draft, WorkNode request, compiler model routing, Codex work package, Codex external GUI-agent request, PlanCompile receipt, automated testing reports, test cases, test run receipts, visual evidence, source-control receipts, WorkNode dispatch/change/completion receipts, Auditor cycle and verification receipts, repair attempt receipts, legacy validation_pass_report compatibility aliases, model resolution receipts, and ExecutorIntakeReport shapes for the disabled design_only branch plus the runtime-aware native_runtime branch; neither branch creates runtime artifacts by itself.
  The PlanApproved handoff records the approval_cas_receipt, transactional outbox requirement, and deterministic idempotency_key over project_id, pack identity/version/hash, PlanningRun revision, topic map version, PlanUnit and acceptance-unit index hashes, testing policy hash, project-context snapshot hash, and final audit/closure hash so approval cannot create duplicate or stale PlanCompileRun state. The handoff matrix names Plans to WorkNodes as a design-only bridge. Do not expose this bridge as a built Puppet Master setting. Its schema boundary is the single `Plans/plans_to_code_handoff.schema.json` draft, whose `$defs` include a concrete strict payload definition for every `artifact_kind` enum value and whose top-level discriminator maps each `artifact_kind` to the matching `payload` schema, including `handoff_matrix`, `handoff_row`, `plan_compile_run`, `node_seed_candidate`, `worknode_request`, `test_capability_report`, `source_control_receipt`, `source_control_preflight_receipt`, `worknode_dispatch_receipt`, `auditor_cycle_report` and `validation_pass_report` while preserving source_artifact, destination_artifact, retry_route, rollback_route, and user_escalation_condition fields. Within that single schema_id=v1 draft, current bootstrap/v1 records use the historical design_only branch and runtime-capable v2 records use native_runtime only with runtime enablement evidence. H-001 through H-017 must remain present exactly once, and each row's schema_payload refs must resolve to concrete `$defs` or artifact_kind payloads. The historical per-artifact filename tokens `plan_compile_run.schema.json`, `node_seed_candidate.schema.json`, `worknode_request.schema.json`, and `test_capability_report.schema.json` are compatibility aliases for `$defs` in `Plans/plans_to_code_handoff.schema.json`, not separate schema files. The Goal-owned final certification handoff H-018 is retired by DL-478; workflow-owned Auditor verification and WorkNode completion receipts remain current.
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
  - PlanCompile consumes the Executor-owned execution_unit_context schema by reference and does not redefine context fields.
  - "`cmd.plan_compile.open_build` is a route/open or post-build reveal command with projected availability, disabled reason, and explicit receipt; it must not fabricate a PlanCompile success event or claim runtime activation while the branch is design_only."
  - Codex bootstrap external GUI-agent request is documented as a bootstrap artifact only, not a built Puppet Master setting.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: handoff_gap
reasoning_tier: high
context_scope: plans_to_code_handoff
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/execution_unit_context.schema.json, Plans/Contracts_V0.md, Plans/Project_Output_Artifacts.md, Plans/plans_to_code_handoff.schema.json]
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
  - "Plans/execution_unit_context.schema.json"
  - "execution_unit_context"
  - "schema_version"
  - "plan_compile_run"
  - "node_seed_candidate"
  - "worknode_request"
  - "test_capability_report"
  - "source_control_preflight_receipt"
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
  - Do not redefine execution_unit_context required fields, optional fields, enum values, or nullability in PlanCompile artifacts.
  - Do not persist execution_unit_context payloads without schema_version or with secrets, tokens, passwords, credentials, API keys, provider auth values, or local machine secrets.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
  - Plans/execution_unit_context.schema.json
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
| H-016 | Source-control finalization or optional promotion | verified changes and source-control receipts | final source-control or promotion receipt | WorktreeGitImprovement / GitHub optional promotion | Runtime Artifacts / Project_Output_Artifacts projection | WorktreeGitImprovement + GitHub_Integration + FileSafe | local truth, final branch/commit, PR/checks when configured | source_control_finalization_receipt, merge_or_promotion_receipt | source_control_finalization_receipt, merge_or_promotion_receipt | retry merge/promotion after conflicts/check repair | restore safe point or preserve intentional dirty state | credential, remote conflict, failed checks, or irreversible external side effect | branch/commit refs, PR/check refs, local finalization ref | W-072, GI-031, EP-103 |
| H-017 | Terminal WorkNode to completion receipt | change/test/Auditor/source-control receipts | WorkNode completion receipt | Executor_Protocol | Runtime Artifacts / Project_Output_Artifacts projection | Executor_Protocol | terminal status, unresolved findings, receipts complete | worknode_completion_receipt | worknode_completion_receipt | re-open repair loop for unresolved finding | restore/revert failed terminal change | unresolved finding or missing child receipt | completion ref, test refs, source-control refs | EP-103 |

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
canonical_text: 'A context-aware incomplete-content validator runs at Planning Wizard approval, Plan Compile certification, and WorkNode completion across active Plans, compile artifacts, first-party code, tests, generated outputs, and delivery artifacts. Every material plan and compile claim must trace to an Approved PRD Pack, user planning answer, accepted Planning Amendment, repository fact, reference artifact, explicit system policy, or recorded assumption; unsupported invented claims are audit defects. Implementation readiness of the complete pipeline requires a clean-room fixture proving Approve And Build creates exactly one PlanCompileRun, executes mandatory parallel stages, certifies a complete WorkGraph and WorkNodeRequests, passes Executor intake/provisioning, creates WorkNodes, queues an entrypoint, and appears in Orchestrator. The GoalRun activation and Goal-completion checking obligations are retired by DL-478. The fixture suite covers duplicate PlanApproved delivery, restart during
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


## Compile receipt timing and original dispatch evidence - 2026-09-13

### PNC-024 - Truthful Compile Worklist Receipt Timing

```yaml
plan_unit_id: PNC-024
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Compile worklists persist only the original assignment and completion receipts actually
  issued at their current lifecycle point. Draft and ready may precede assignment; running
  mandatory parallel work requires the configured minimum distinct non-parent assignments
  and authentic matching assignment receipts before dispatch, at least two. Completion is
  never fabricated before a wave finishes. Completion and certification retain all existing
  required successful receipt, evidence, coverage, currentness and original source checks.
  The adjacent lifecycle and recovery rules are mandatory semantic obligations; a schema
  cardinality lower bound alone cannot prove dispatch or complete coverage.
gui_related: false
gui_classification_reason: Defines compiler source custody, receipt timing and dispatch predicates without a visual surface.
depends_on: [PNC-010, PNC-014, PNC-015, PNC-016, PNC-019, PNC-021, DL-045]
unblocks: []
acceptance_criteria:
  - Draft and ready can retain empty receipt lists and no waves before any original assignment; incremental preparation retains only actual issued receipts.
  - Every persisted wave retains its original typed assignment receipt, and both receipt lists equal the actual receipts belonging to the exact persisted waves.
  - Before dispatch and while running mandatory parallel work, the configured minimum distinct non-parent assignments, at least two, and matching authentic assignment receipts are required.
  - Serial running retains its existing schema behavior; the exact ten broad stages, sixteen stage names and required minimum parallelism remain unchanged.
  - A wave that has not completed needs no completion receipt; completed waves retain the existing complete receipt and durable evidence requirements.
  - Complete worklists and stage or compile certification require all required successful completions, full parallel coverage and original assignment, source and attempt identity.
  - Blocked or cancelled worklists preserve already issued receipts and actual dispatch history; original controller custody distinguishes before-dispatch and after-dispatch cases.
  - Missing, failed, duplicate, foreign, mismatched or stale required evidence never authorizes certification, and required parallel work cannot fall back to one broad parent agent.
  - Existing validator discrepancies remain visible and confer no bypass, lifecycle certification, runtime enablement or readiness clearance.
validation_surfaces:
  - Plans/plans_to_code_handoff.schema.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fabricated_or_premature_compile_receipt
reasoning_tier: high
context_scope: original_compile_receipt_lifecycle
implementation_surfaces:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/plans_to_code_handoff.schema.json
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
  - Plans/Decision_Log.md#DL-039
  - Plans/Decision_Log.md#DL-045
  - Plans/Plan_To_Node_Compilation.md#PNC-010
  - Plans/Plan_To_Node_Compilation.md#PNC-016
  - reports/event-authority-20260911/step-08-compile-receipt-timing-validation.md
source_atom_ids: []
preserved_exact_tokens: [draft, ready, running, blocked, complete, cancelled, parallelism_required, minimum_parallel_assignments, assignment_receipt_refs, completion_receipt_refs]
negative_constraints:
  - Do not create placeholder receipts, predict their identities or borrow receipts from another wave, stage, attempt or invocation.
  - Do not treat schema checks or retained source contracts as actual dispatch, native installation, completion, certification or governance seal evidence.
  - Do not create WorkNodes, NodeSeeds, GoalRuns, executable queues, runtime launches or production build tasks through this source correction.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md]
```

Draft and ready worklists may have empty assignment and completion receipt lists and no assigned waves. Partially prepared assignments retain only authentic issued receipts. Every persisted wave has its original typed assignment receipt. Receipt lists identify exactly the actual receipts belonging to those persisted waves, preserving original null/presence and parent-only write authority.

Before dispatching a mandatory parallel stage, the controller must possess its configured minimum distinct non-parent assignments, at least two, and their authentic matching assignment receipts. Running requires the same proof. Ready alone does not authorize dispatch. A shortage uses the existing typed block or reduce-scope route. No completion receipt is required for an assignment whose execution has not completed. As results arrive, actual completion receipts and durable evidence join the original assignment identity. Complete worklists and stage or compile certification require every required successful completion, full required parallel coverage, current original source and attempt identity, and existing audit closure. A single arbitrary receipt-list entry cannot establish that coverage.

Blocked or cancelled status does not erase issued receipts or past dispatch obligations. Before-dispatch blocked or cancelled worklists may truthfully have no waves; after dispatch they retain original assignment proof and every completion already received. Recovery uses actual original controller and dispatch custody to distinguish those cases. A status label proves neither historical dispatch nor completion. Failed, foreign, duplicate, stale or mismatched receipts cannot satisfy required successful completion. The sixteen-stage algorithm, mandatory broad-stage parallelism, disabled bootstrap/v1 launch flags, distinct native-runtime enablement, and Executor and Goal Runtime certification boundaries remain unchanged.

The authoritative schema correction is limited to `compile_parallelism_policy` and `compile_worklist` in `Plans/plans_to_code_handoff.schema.json`. Required receipt fields and list types remain. The unconditional nonempty receipt-list predicates are removed from the reusable policy and its broad-stage duplicate; a running or complete worklist with `parallelism_required=true` retains a nonempty assignment list and at least one assigned wave. These structural lower bounds do not replace the configured minimum, distinct original identities, actual dispatch proof or complete successful coverage above. The original complete-worklist condition and entire wave, assignment-receipt and completion-receipt contracts are preserved.

The existing semantic predicate in `scripts/pm-prd-planning-runtime-validate.py` still requires the configured non-parent wave count whenever parallelism is required, including draft and ready before assignment. This is an unresolved validator discrepancy with the truthful pre-assignment contract. Its source-established limitation is not an executed lifecycle result. The current Event Authority task permits no validator edit beyond its already completed Step 3 holding-bucket change; this correction supplies no bypass or green gate claim. A later separately authorized validator correction must preserve exact receipt-set equality, dispatch minimum, original joins and completed-worklist checks. Operational consumers must report this limitation and prove original dispatch and completion custody before authorizing either action.

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md#PNC-010, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-016, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-019, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-021, ContractName:Plans/plans_to_code_handoff.schema.json, ContractName:Plans/Decision_Log.md#DL-039, ContractName:Plans/Decision_Log.md#DL-045

### PNC-025 - Original complete native compiler custody and recovery

PNC-025 defines original native compiler checkpoint, artifact and certification custody through `Plans/workflow_activation_contracts/schemas/operational-custody.v2.schema.json`. `native_plan_compile_checkpoint` is an immutable genuine compiler-controller checkpoint, selected by the real compile identity’s current `native_plan_compile_head`. It contains the entire existing 23-field native_runtime plan_compile_run plus all additional complete operational bodies defined by CompilerCheckpoint. The bootstrap-only existing plan_compile_run row and design-only compiler_wave_contract retain their original disabled/runtime and policy contracts; they cannot store, impersonate or enable this native route.

#### Complete state and original input custody

The full checkpoint retains run stage/current state, cursor, last-green hashes, blockers, next required stage, resume command/action, receipts and every complete compile-wave contract. It additionally retains all original full stage_cards, worklists, source_hashes, currentness_checks, repairs, repair_attempt_receipts, audit_cycles, verification_receipts, repair_receipt_sources, retry_records, cancellation, supersession, next_action, artifact_sources, compile_receipt_sources and other_required_receipt_sources. Approved pack, PlanUnit index, acceptance index, approved project context, testing policy and final audit/closure remain complete original source bindings with actual readers and exact bytes. Their hashes are not replacement bodies and cannot reconstruct an unavailable original input from the current repository.

`compiler-field-map.json` is the exact PNC-015 field coverage map. Stage cards cover the same sixteen-stage registry. Bounded worklists preserve every item/source hash, original assignment identity, read/write/forbidden scope, parent-only writeback, parallelism policy, full assignment and completion receipts, and original source/evidence. Where stage cards, worklists and run.compile_wave_contracts describe the same actual contract, their entire values agree. Counts, IDs or receipt refs alone cannot replace these complete bodies. Parent review and original writeback remain required; a subagent proposal or schema-valid native artifact does not certify itself.

CurrentnessCheck preserves original check identity, complete expected/observed source digest, source schema/owner/codec, result status, full reason, occurrence and evidence. Unavailable observed source is not current. Saved original observations describe what the owner actually checked then and do not waive current source revalidation. CompilerRetry retains the exact canonical compile_wave_retry_route, original assignment/attempt identity, actual result/receipt and retry count. No stored command string is executed by recovery.

CompilerCancellation preserves its authentic original source/operation, exact last committed stage, every unfinished assignment and all earlier genuine effects; it creates no Goal for genuine pre-Goal compilation. CompilerSupersession preserves both actual approved-pack identities and the original PlanDiffImpactReport’s exact lane dispositions, reasons and dependency/write-surface proofs, without a new plan_compile_run state. An unsupported original state is unavailable for this profile until its actual owner defines the mapping; it is never trimmed. NextAction preserves the full original bounded route/action/input references and exact next_required_stage/resume_command_or_action; terminal absence is null only when the genuine controller has no next action.

CompilerCheckpoint.final_audit_closure_source is the complete earlier ApprovedPlanPack final audit/closure input available at compiler birth. It is not the future final_compile_audit_repair output. Later actual compiler audits, repairs, Auditor verification and completion receipts retain their own complete checkpoint fields and appear only after original issuance. No hash edge is allowed from an earlier input to the future receipt or checkpoint that needs that input.

#### Original artifacts, certification and commit

`owner.plan_compile.native.publish_state_input.v1` is the original state-output boundary. `/record/value/run` is exactly the whole original native compile input consumed by activation; the additional checkpoint state is neither squeezed into that run nor replaced by its compact live capture. The genuine checkpoint and original capture/origin participate in that actual state publication. `owner.plan_compile.native.publish_artifact.v1` issues only the complete original typed node_seed_candidate, node_seed_review, workgraph_draft or worknode_request through CompilerArtifactValue and its full record/wrapper. Every acceptance, dependency, order, risk, gui_related, context, test, authority, model-routing and source-control field remains. This source definition creates no artifact instance or WorkNode.

`owner.plan_compile.native.publish_certification_input.v1` issues the complete seven-field plan_compile_receipt, including summary, evidence and entire handoff, in its actual original certification operation. It binds the genuine earlier input checkpoint, certified graph and every original request source. `owner.workflow.compile.issue_graph.v1` and `owner.workflow.compile.issue_request.v1` must independently establish that these graph/requests are the actual accepted outputs of that certification. Any schema-valid lookalike, copied receipt, foreign output or missing whole certificate refuses source issuance.

The certificate’s compiler_checkpoint selects the real earlier checkpoint. A subsequent checkpoint may reference the newly issued certificate, but the certificate never hashes a future checkpoint that itself hashes the certificate. The actual owner may reserve an original receipt identity before publication; that reserved ID is not a previously issued receipt or authorization. Whole original certificate/source/capture/activation-origin participants preserve their actual native transaction and acyclic dependency order.

CompilerCommitInput/CompilerCommitResult bind the existing state publication to the lower original `owner.plan_compile.native.publish_artifact.v1`, `owner.plan_compile.native.advance_head.v1` and `owner.storage.activation_operational_custody.publish.v1` participants. The complete new checkpoint, current head, origins and every newly issued artifact/receipt participant commit together or none of those new effects do. Expected head/value/origin is null only at proven fresh native compiler birth under the actual owner/root exclusion fence; restored loss or an empty scan is not that proof. Head generation starts at zero only at genuine birth and advances once per real checkpoint commit; checkpoint output_revision starts at one and advances once. Immutable new keys must be genuinely absent. Current-head CAS compares its entire outer value, genuine origin, owner/epoch and actual generation.

Checkpoint prior_checkpoint selects its genuine predecessor. The checkpoint origin’s prior_physical_sha256 commits that prior logical checkpoint, while the head origin commits the prior whole head; neither is an absent-key proof for the new immutable checkpoint. Other immutable receipt/artifact births have null prior only where their exact original revision contract declares no predecessor. No older native state receives a synthesized former origin. A restored head cannot regress a newer generation or erase actual terminal cancellation/supersession truth.

#### Original reads and truthful restart

`owner.native_plan_compile_checkpoint.read_original.v1` retains the complete CompilerReadRequest/CompilerReadResult and returns the complete original run plus operational checkpoint and source/origin, or exact unavailable. `owner.native_plan_compile_certification_receipt.read_original.v1` retains the whole CertificationReadRequest/CertificationReadResult and original certification body/origin. Both use the independently authenticated role/operation/request/capture and current disclosure/source guards, not a selector-only lookup.

This unit explicitly defines `owner.native_plan_compile_checkpoint.read_recovery.v1` with the whole CompilerRecoveryRequest/CompilerRecoveryResult and `owner.native_plan_compile_artifact.read_original.v1` with the whole CompilerArtifactReadRequest/CompilerArtifactReadResult. These newly named internal technical owner entries close the previously unnamed complete signatures; they do not add public commands, alter ordinary CompilerReadRequest/Result, claim an installed runtime endpoint or introduce a caller discriminator. Each is bound to its native original compiler/Storage authority and enforces its own full entry/final predicates.

Compiler recovery returns the genuine current full head/checkpoint, every required original artifact and compile receipt with authentic origins. Every referenced source, approval, repair/audit/verification/test/source-control/request/model dependency required by the saved next action must also be obtained through its actual full original owner interface. Inline repair, Auditor and verification bodies remain the entire genuinely received canonical values, not flattened findings. A historical immutable checkpoint can be disclosed under current permission; it is not automatically resumable and cannot supersede later state. Any missing or conflicting dependency is reported as unavailable and keeps dependent mutation fenced. No replacement comes from current Plans, UI, event payloads, sibling receipts, a fresh test/compile/model invocation or a reconstructed source hash.

Recovery never interprets resume_command_or_action or NextAction as sufficient execution permission. Original enabled-runtime, current source/approval/host/project/repository/worktree, owner, Stop/cancellation and permission checks precede any resumed effect. The complete BRS-024 recovery closure and SP-308 policy/deletion/tombstone rules also remain mandatory. Restoring source custody does not recreate a native lease or ownership capability.

#### Truthful receipt timing and current source admission

PNC-024 remains exact: draft/ready may have no assigned waves and empty receipt lists before genuine assignment; incremental preparation stores only actually issued receipts. Before dispatch and while running mandatory parallel work, require the configured minimum distinct non-parent assignments, at least two, their authentic matching assignment receipts and unchanged parent authority. Persisted waves retain their whole original typed assignment receipt. A wave that has not completed has no manufactured completion receipt; complete worklists, stages and compile certification require every actual required successful completion, source/attempt identity, evidence and full coverage. Serial-running behavior, all sixteen stages, ten broad stages, blocked/cancelled prior dispatch and existing receipt rules remain unchanged.

The known pinned semantic validator discrepancy that demands minimum non-parent assignments for pre-assignment draft/ready remains a separate unproved implementation mismatch; this owner contract supplies no bypass or validator-support claim. Original child-source emptiness follows GRS-075 at every current issue/certification/current-writer replay boundary. A supplied empty array cannot override a nonempty, unknown, stale or missing actual original child graph. Whole RequiredSet/CompletionRequirementSource are consumed at their genuine lifecycle point and never fabricated early.

Every independently callable original issuer, capture participant, head/artifact writer, Storage publisher, live/current/durable/retained reader, recovery reader and replay responder must enforce both native boundaries itself. Before its first returning helper it authenticates the complete actual operation, registered owner and epoch, native Storage/root/backend identity, whole original source values and beforeimages, current permissions, effective Stop/cancellation, writer/registration generations, deletion/tombstone/hold and coherent recovery state. It independently derives every complete permissible candidate and return from those sources. Caller-selected method, schema, family, codec, source mode, operation ID, owner string or serialized lease cannot establish that authority.

After all returning parsers, builders, codecs, copies, resolvers, validators, comparison helpers and currentness reads, the same original participant independently rechecks the whole authentic source/preimage set, actual native fences and entire candidate. A publisher checks its complete pending transaction union, including preserved/unrelated members; the outer joint publisher independently checks the complete joined union as well. One final pure predicate has no returning helper, asynchronous callback, logger or mutable gap before that participant’s commit or passive disclosure. A lower entry never inherits authority merely because its caller checked. Whole original readback with its own independent final predicate precedes dependent release. A later refusal preserves every genuine prior effect and never repairs a missing source by replaying its producer.

This unit establishes a canonical source contract and the required original-owner placements. Native installation and capability authentication, original source execution, all-writer exclusion, exact codec execution, redb atomicity/fsync/crash behavior, retained/current replay and coherent backup/restore remain NOT_RUN. Schema/source checks do not establish those properties. No WorkNode, NodeSeed, executable queue, runtime launch, PNC-019 enablement, readiness admission, event-depth pass, Step 9 campaign result, global D05 closure or governance seal follows from this adoption.

```yaml
plan_unit_id: PNC-025
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: Original complete native compiler custody and recovery. The immutable original checkpoint and current
  head preserve the complete native compiler run, full operational state, exact next action and every required original
  source/artifact/receipt.
gui_related: false
gui_classification_reason: Defines original source, owner, storage and verification semantics without a visual surface.
split_recommended: false
depends_on:
- PNC-015
- PNC-019
- PNC-024
- CV-349
- SP-308
unblocks: []
acceptance_criteria:
- The immutable original checkpoint and current head preserve the complete native compiler run, full operational
  state, exact next action and every required original source/artifact/receipt.
- State, artifact, head and Storage owners jointly commit whole candidates and origins with original predecessor
  semantics and exact current-head CAS.
- Certification binds the genuine earlier input checkpoint and complete actual graph/request outputs without a cyclic
  future-checkpoint dependency.
- Original recovery and artifact readers use their full named technical signatures and require original dependency
  closure plus current admission before resumed effects.
- PNC-024 truthful assignment/completion timing and the existing validator discrepancy remain explicit; no fabricated
  receipts or runtime enablement follows.
validation_surfaces:
- Plans/workflow_activation_contracts/schemas/operational-custody.v2.schema.json
- Plans/workflow_activation_contracts/compiler-field-map.json
- Plans/workflow_activation_contracts/methods.json
- Plans/plans_to_code_handoff.schema.json
- Plans/Backup_Restore_System.md#BRS-024
risk_class: workflow_activation_original_source_or_lifetime_drift
reasoning_tier: high
context_scope: pnc_025_activation_original_custody
implementation_surfaces:
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/physical-families.json
source_atom_ids: []
negative_constraints:
- No public command, event or Goal lifecycle expansion and no fabricated original source or receipt.
- No full historical mutable-body archive, new retention policy, native field redaction, numeric coercion or automatic
  deployed migration.
- No WorkNode/NodeSeed/runtime/readiness/global event-depth or governance claim from source adoption.
```

ContractRef: ContractName:Plans/workflow_activation_contracts/schemas/operational-custody.v2.schema.json, ContractName:Plans/workflow_activation_contracts/compiler-field-map.json, ContractName:Plans/workflow_activation_contracts/methods.json, ContractName:Plans/plans_to_code_handoff.schema.json, ContractName:Plans/Backup_Restore_System.md#BRS-024

## PERF-001 Named Plan join consumer (2026-09-27)

PlanCompile is a Named Plan consumer through the single NPLAN-006 owner-join contract, not
through a duplicated Plan state machine. Every PlanCompileRun, NodeSeed candidate draft,
WorkGraph draft, and WorkNodeRequest carries the explicit immutable `project_id` plus
`named_plan_id` parent edge it was resolved under, with exact child ref, kind, revision, and
currentness hash; compile scope selection filters by that resolved Plan identity, and a
wrong-Plan same-Project, wrong-Project, stale revision or hash, orphan, kind mismatch, or
focus-only join fails certification closed instead of compiling under an assumed Plan.

The join proves lineage only: compile stage semantics, candidate review, graph/request
certification, Executor intake, activation, and the design-only versus runtime-enabled
boundaries stay owned here and by their existing owners. Compile scope admission is mutate
intent and requires a current-edge accept; a historical edge authorizes read inspection only.
This section adds no lifecycle, no commands, no storage keys, no events, and no handlers, and
it changes no PNC-019 certification or buildability gate.

ContractRef: ContractName:Plans/Named_Plan_System.md#NPLAN-006, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-010

### PNC-026 - PlanCompile Parent Edge Through Single Owner-Join Contract

```yaml
plan_unit_id: PNC-026
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Every PlanCompileRun, NodeSeed candidate draft, WorkGraph draft, and WorkNodeRequest carries an explicit
  immutable project_id plus named_plan_id parent edge resolved through the single NPLAN-006 owner-join
  contract against the actual owner record and aggregate edges; scope selection filters by resolved Plan
  identity and any rejected join fails certification closed. The join proves lineage only and changes no
  compile, intake, activation, certification, or buildability boundary. An AssistantDeepPlanUnitBundle
  under PDS-021/023 is outside this product PlanCompile input family and may be application-owned without
  project_id/named_plan_id. It maps directly to Assistant To-Dos and never creates NodeSeeds/WorkNodes;
  this exclusion does not relax any real Project PlanCompile parent join.
gui_related: false
gui_classification_reason: Parent-edge lineage for compile artifacts is a compiler identity contract, not visual presentation.
depends_on: [PNC-010, NPLAN-006]
unblocks: []
acceptance_criteria:
  - Compile artifacts carry explicit project_id plus named_plan_id with exact child ref, kind, revision, and hash.
  - Scope selection admits only artifacts whose join resolves accepted under the resolved Plan identity.
  - Wrong-Plan, stale, orphan, kind-mismatch, and focus-only joins fail certification closed.
  - No Plan state machine, lifecycle, command, storage key, event, or handler is duplicated here.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 -m unittest tests.test_named_plan_semantics
risk_class: plancompile_plan_lineage_drift
reasoning_tier: high
context_scope: plancompile_named_plan_join
implementation_surfaces:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Named_Plan_System.md
node_compile_hint:
  mode: plancompile_named_plan_join_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "packet:PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08#PERF-001"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "PlanCompileRun"
  - "named_plan_id"
  - "project_id"
negative_constraints:
  - Do not compile under an assumed or focused Plan without a resolved join.
  - Do not duplicate Plan lifecycle or child state machines for compile lineage.
  - Do not admit compile scope on a historical-edge join; admission requires a current-edge accept.
  - Do not change PNC-019 certification or buildability gates through this lineage.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Named_Plan_System.md
```

## Command payload definitions (DL-333, 2026-11-05)

### PNC-037 - Plan Compile Command Payload Definitions

```yaml
plan_unit_id: PNC-037
unit_type: command_contract
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Typed payload definitions for the nine cmd.plan_compile.* commands that UI_Command_Catalog UCC-098
  registers and UCC-230 routes to this doc (DL-333). Each command's field list is the runtime
  contract row keyed by its catalog id in Plans/prd_planning_runtime_contracts.json
  ui_command_contracts (DL-333 coordinator resolution 1); that file's former ids are recorded
  compatibility aliases, and the catalog row's payload summary column is history. The run identity is
  the PlanCompileRun compile_id the state record names (PNC-010 state machine), and
  cmd.plan_compile.open_build takes the PlanCompileRun identity the catalog names
  (plan_compile_run_id), not a goal run id (DL-333 resolution 1). The runtime contract's owner
  disabled states map to the overlay's closed codes through UCC-230 owner_state_code_map. The
  definitions block below gives each command its args, owner result and narrowed error and
  disabled-reason codes in pm.command_payload_definitions.v1. The catalog keeps ids, labels,
  availability and aliases; the strict schema overlay keeps the common envelope and the closed code
  sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Plan Compile pause, resume, cancel, retry, inspection, recompile and Open Build commands.
depends_on: [UCC-230, UCC-097, UCC-098, DL-333, DL-341, CV-333, PNC-010, PNC-011, PNC-014]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to PNC-037 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "Plans/prd_planning_runtime_contracts.json ui_command_contracts and plan_compile_runtime (field lists under the catalog ids; DL-333 resolution 1)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.plan_compile.pause, cmd.plan_compile.resume, cmd.plan_compile.cancel, cmd.plan_compile.retry, cmd.plan_compile.inspect_blocker, cmd.plan_compile.inspect_evidence, cmd.plan_compile.inspect_assignment, cmd.plan_compile.request_bounded_recompile, cmd.plan_compile.open_build]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token; the runtime contract file's former ids are compatibility aliases and never dispatch.
  - Do not enable runtime launch through these definitions; bootstrap/v1 PlanCompile stays design_only_disabled (PNC-015 boundary).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/plans_to_code_handoff.schema.json]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: PNC-037
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.plan_compile.pause
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.pause; PlanCompileRun state record identity compile_id (PNC-010 state machine, Plan_To_Node_Compilation.md:644)"
        reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names reason with no type or bounds; JUDGMENT: typed string with no
            bounds.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompilePauseResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: compile_terminal, code: blocked_state_required}
      aliases: []
    - command_id: cmd.plan_compile.resume
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.resume; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        resume_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.resume; compile wave contracts and resume routes carry resume_ref (PNC-010, Plan_To_Node_Compilation.md:644; PNC-011 stage-card route objects with optional resume_ref, :717); guard resume_ref_valid"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompileResumeResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: missing_resume_ref, code: blocked_state_required}
      aliases: []
    - command_id: cmd.plan_compile.cancel
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.cancel; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        cancel_reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names cancel_reason with no type or bounds; JUDGMENT: typed string
            with no bounds.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompileCancelResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: mutation_already_active, code: blocked_state_required}
      aliases: []
    - command_id: cmd.plan_compile.retry
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.retry; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        stage_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.retry; stage_card required field stage_id, a canonical registry stage_name (PNC stage-card contract, Plan_To_Node_Compilation.md:717)"
        repair_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.retry; guard stage_retry_allowed over the recorded repair; the history column's currentness-token input has no runtime field"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompileRetryResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: stage_not_retryable, code: blocked_state_required}
      aliases:
        - {command_id: cmd.plan_compile.retry_stage, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.plan_compile.inspect_blocker
      ucc_units: [UCC-098, UCC-097]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_blocker; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        blocker_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_blocker; PlanCompileRun state record carries blockers; guard blocker_exists"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: blocker_missing, code: blocked_state_required}
      judgments:
        - key: error_codes
          choice: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
          gap_note: >-
            The narrowing rule adds stale_projection for a domain_action or when the disabled reasons include it;
            this navigation_wrapper's only disabled reason is blocked_state_required (owner state blocker_missing). It
            is added because the runtime row's stale_projection_policy refresh_blocker_projection_before_open
            (Plans/prd_planning_runtime_contracts.json ui_command_contracts) refreshes the projection before
            the open, so a stale projection is refused at dispatch and travels in stale_projection.
        - key: response_kind
          choice: local_projection
          gap_note: >-
            The runtime row is a navigation_wrapper whose result_contract is only route_target and whose receipt
            effect is inspection_opened (Plans/prd_planning_runtime_contracts.json ui_command_contracts), and its
            wiring row asks only for a no-persist receipt or route/open disposition (catalog.plan_compile_inspect_blocker).
            Canon does not say whether that is an owner result. Choice: a local projection. The route is applied as
            the command's route/open disposition, and the inspection_opened receipt travels as the CV-333 response's
            own receipt_ref, which carries the "actual dispatch/route/owner receipt" (Contracts_V0.md:1929), so no
            owner result is defined. cmd.plan_compile.open_build is modelled differently because PNC canon gives it
            an explicit receipt and a route_open effect.
      aliases: []
    - command_id: cmd.plan_compile.inspect_evidence
      ucc_units: [UCC-098, UCC-097]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_evidence; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        evidence_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_evidence; compile waves carry durable_evidence_refs (Plan_To_Node_Compilation.md:644); guard evidence_exists"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: evidence_missing, code: blocked_state_required}
      judgments:
        - key: error_codes
          choice: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
          gap_note: >-
            The narrowing rule adds stale_projection for a domain_action or when the disabled reasons include it;
            this navigation_wrapper's only disabled reason is blocked_state_required (owner state evidence_missing). It
            is added because the runtime row's stale_projection_policy refresh_evidence_projection_before_open
            (Plans/prd_planning_runtime_contracts.json ui_command_contracts) refreshes the projection before
            the open, so a stale projection is refused at dispatch and travels in stale_projection.
        - key: response_kind
          choice: local_projection
          gap_note: >-
            The runtime row is a navigation_wrapper whose result_contract is only route_target and whose receipt
            effect is evidence_opened (Plans/prd_planning_runtime_contracts.json ui_command_contracts); its wiring row
            asks only for a no-persist receipt or route/open disposition. Canon does not say whether that is an owner
            result. Choice: a local projection: the route is the command's route/open disposition and
            evidence_opened travels as the CV-333 response's receipt_ref (Contracts_V0.md:1929), as for
            cmd.plan_compile.inspect_blocker.
      aliases: []
    - command_id: cmd.plan_compile.inspect_assignment
      ucc_units: [UCC-098, UCC-097]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_assignment; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        assignment_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.inspect_assignment; compile wave contracts carry assignment_id (Plan_To_Node_Compilation.md:644); guard assignment_exists"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: assignment_missing, code: blocked_state_required}
      judgments:
        - key: error_codes
          choice: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
          gap_note: >-
            The narrowing rule adds stale_projection for a domain_action or when the disabled reasons include it;
            this navigation_wrapper's only disabled reason is blocked_state_required (owner state assignment_missing). It
            is added because the runtime row's stale_projection_policy refresh_assignment_projection_before_open
            (Plans/prd_planning_runtime_contracts.json ui_command_contracts) refreshes the projection before
            the open, so a stale projection is refused at dispatch and travels in stale_projection.
        - key: response_kind
          choice: local_projection
          gap_note: >-
            The runtime row is a navigation_wrapper whose result_contract is only route_target and whose receipt
            effect is assignment_opened (Plans/prd_planning_runtime_contracts.json ui_command_contracts); its wiring
            row asks only for a no-persist receipt or route/open disposition. Canon does not say whether that is an
            owner result. Choice: a local projection: the route is the command's route/open disposition and
            assignment_opened travels as the CV-333 response's receipt_ref (Contracts_V0.md:1929), as for
            cmd.plan_compile.inspect_blocker.
      aliases: []
    - command_id: cmd.plan_compile.request_bounded_recompile
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        compile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.request_bounded_recompile; PlanCompileRun state record identity compile_id (Plan_To_Node_Compilation.md:644)"
        invalidated_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.request_bounded_recompile; the history column names affected PlanUnit refs; guard invalidated_refs_present"
        reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names reason with no type or bounds; JUDGMENT: typed string with no
            bounds.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompileBoundedRecompileResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: no_invalidated_refs, code: blocked_state_required}
      aliases: []
    - command_id: cmd.plan_compile.open_build
      ucc_units: [UCC-098, UCC-097]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        plan_compile_run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.open_build; overlay UCC-096..UCC-100 optional identity plan_compile_run_id; DL-333 resolution 1 (PlanCompileRun identity the catalog names)"
        build_started_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.plan_compile.open_build; guard build_started_exists over the durable BuildStarted projection; the history column's target-artifact-or-route input rides the result route"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PlanCompileOpenBuildResultV1
      error_codes: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: activation_not_active, code: blocked_state_required}
      judgments:
        - key: error_codes
          choice: [invalid_route, invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
          gap_note: >-
            The narrowing rule adds stale_projection for a domain_action or when the disabled reasons include it;
            this navigation_wrapper's only disabled reason is blocked_state_required (owner state activation_not_active). It
            is added because the runtime row's stale_projection_policy "open only after durable BuildStarted projection"
            (Plans/prd_planning_runtime_contracts.json ui_command_contracts) makes the open depend on a current
            projection, so a stale projection is refused at dispatch and travels in stale_projection.
        - key: response_kind
          choice: owner_operation
          gap_note: >-
            The runtime row is a navigation_wrapper with result_contract route_target and receipt effect build_opened,
            the same shape as the inspect rows. It is owner_operation, unlike them, because PNC canon calls it "a
            route/open or post-build reveal command with projected availability, disabled reason, and explicit
            receipt" (Plan_To_Node_Compilation.md:913) and its wiring rows give it a route_open effect that opens the
            build route or records a disabled route/open receipt (catalog.plan_compile_open_build,
            orchestrator.plan.compile.open_build). Canon does not state the response_kind itself.
      aliases: []
  results:
    PlanCompilePauseResultV1:
      fields:
        compile_pause_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PlanCompileResumeResultV1:
      fields:
        compile_resume_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PlanCompileCancelResultV1:
      fields:
        compile_cancel_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PlanCompileRetryResultV1:
      fields:
        stage_retry_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PlanCompileBoundedRecompileResultV1:
      fields:
        bounded_recompile_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PlanCompileOpenBuildResultV1:
      fields:
        route_target: {type: contract, ref: Primitive:RouteTarget, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; the resulting build or build-artifact route the history column names"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "build_opened effect of the runtime row; PNC-014 requires an explicit receipt; no typed result contract"}
```

## Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

### PNC-038 - Rule Fixtures Bound At WorkNode Request Creation

```yaml
plan_unit_id: PNC-038
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  When PlanCompile drafts WorkNodeRequest records (PNC-013), every rule of every contract reaches a node as tests in
  that node's test_binding. A node's contracts are the contracts its source_plan_unit_ids and
  source_acceptance_unit_ids reach through an owner_reference or consumer_reference edge (PNC-016). Each rule's test target is fixed during WorkGraph construction (PNC-016), before WorkNodeRequest construction, so
  that any ordering edge the target needs is part of the graph that is validated. A rule whose enforcement one node's
  source_acceptance_unit_ids own binds to that node. A rule whose enforcement is split across several nodes, or that no
  single node owns, binds to one fixture owner designated among the nodes whose source units hold the contract's
  owner_reference, and that node's completion must follow every other node that implements a part the rule's
  fixtures exercise (every other owner_reference node when no node's source units own the rule). The companion's
  deterministic designation rule picks it among the candidates for which those ordering edges keep the graph acyclic
  and in phase order, preferring a candidate the graph already orders after all of them, and WorkGraph construction
  adds to its required_before_completion every such node not already ordered before it; when no candidate qualifies,
  the rule has no lawful target. Those fixtures count toward the designated node's completion only when they ran against the designated node's
  final build together with the completed outputs of every other node they exercise, all named in their
  TestRunReceipt; a pass on an earlier or partial build never counts (Plans/Automated_Testing_System.md#ATS-401). A rule whose enforcement lies
  outside the compile's write scope, as when the compile reaches its contract only through consumer_reference edges, is
  verified rather than rebuilt: each node in the compile that reaches the contract binds that rule's required tests
  exactly as this unit produces them for a rule inside the write scope, for the plan version the compile consumes,
  and runs them directly against the enforcing owner's built surfaces, in the exact owner build or deployment the
  receiving node resolves for the work being certified, through a generated or independently checked adapter and never
  through the receiving node's own code; the rule ends in the same dispositions, and the owner's existing tests never
  stand in for a required case. A run counts, for either outcome, only when its TestRunReceipt binds the immutable
  identity of the owner build it ran against and that identity matches the owner dependency the receiving node's final
  build resolves; a refusal counts only when that owner build produced it, a run against any other owner build never
  counts, a changed owner dependency needs a fresh run, and a node with no automatic route to that exact build records
  a test gap whose test_gap_policy PlanCompile sets as this unit states below, except that a gap whose missing
  piece is the owner build itself is block_completion and names that build. A failing test keeps the receiving node incomplete until a valid run of it passes:
  an adapter or harness fault goes through the test-harness repair route (Plans/Executor_Protocol.md#EP-101 and
  #EP-102) and the test reruns, while a failure that reproduces directly against that same owner build is an
  enforcement defect of that owner and goes to it through a successor plan (PNC-015). No change to the receiving node's own code can satisfy such a test; a change to which owner build it resolves only
  changes the build the test must run against and needs a fresh run, and that build must implement the plan version the
  compile consumes. A change to an approved fixture or its expectation likewise arrives only through a successor
  plan. A
  rule left without a lawful target, because the edges it needs would create a cycle or break the graph's phase order
  or no node in the compile can receive it, goes through the WorkGraph construction stage's repair route (PNC-016),
  and if repair gives it no target, compile certification fails closed with a finding naming the rule. A contract's rules are its schema rules (the contract's effective validation assertions as Plans/Planning_Wizard.md#PWIZ-111 defines them, with each member of
  a required list or other per-member constraint as its own rule and that member part of the refusal's identity), its
  declared failure results and its acceptance criteria, and each kind of rule gets its own tests. A schema rule gets at least two payload fixtures: a payload the whole contract refuses because of that rule alone, by the companion's attribution, expected to be
  refused, and
  a payload that passes, expected to be accepted; for an assertion an if selects, the passing payloads include one
  on each route the contract distinguishes and, wherever the contract admits one, a contrasting accepted control: the
  refusing payload with the selector switched to a route that does not select the assertion, and with any routing
  fields that route requires, still breaking the assertion and expected to be accepted. A declared failure result gets two behaviour fixtures: an input that
  meets its failing condition, expected to be refused with that failure's code, and, on the same surface wherever the
  approved contract admits an accepted call there, the same input without the failing condition, expected to be
  accepted; on a surface the contract declares refusal-only, the refusing fixture binds with its stated effect
  assertions and the record states why an accepted call is outside the contract, while a lawful control on a distinct
  surface keeps its own binding. When code establishes that an earlier approved check refuses every input meeting
  a declared failure's condition before that failure can be reached (as when a schema bound always refuses first), the declared failure is a shadowed refusal on that surface: its refusing fixture binds with the outcome the contract
  actually produces, the earlier check's code, its passing neighbour still binds on the same surface wherever the approved contract admits an accepted call there
  (otherwise the shadowed refusal binds alone with its effect assertions), and the shadowed result is recorded
  with that coverage evidence and earns no independent coverage credit. Shadowing is judged per declared surface: a
  separately declared owner surface that can reach the original result binds that result's own required tests under
  the ordinary disposition and gap policy. A search that ends without that coverage evidence leaves a test gap. A behavioural acceptance criterion (one with an input and an observable outcome)
  gets one behaviour fixture for each input condition it lists, each carrying the criterion's state and effect
  assertions and asserting the outcome the criterion states on its input or sequence: a refusal where the
  criterion prescribes one, otherwise the stated result, compared so that a wrong result fails (a duplicate delivery
  that must return the existing identity fails when another identity comes back). Any other acceptance criterion
  (a latency gate, a visual or browser check, an artifact that must not exist) binds its ATS-003 oracle as its test.
  No contract is exempt from schema fixtures because its acceptance criteria use other oracles. The compile model writes
  behaviour fixtures; each cites the exact span it comes from and keeps an immutable reference to that span in the
  approved plan version, and before it binds, code validates the fixture record, confirms that its input has the schema result the approved
  contract specifies for the case (valid where the case expects the operation to reach the owner's own checks, and
  refused with that refusal's identity where the case expects an earlier schema refusal, as a shadowed refusal does),
  and checks its expected code against the declared failure codes. Risky
  contracts add the cases of the planning referee check (Plans/Planning_Wizard.md#PWIZ-111). A fixture's expected
  outcome comes only from the approved contract: accepted with any stated result, or refused with the declared failure code and, when several rules share that
  code, the validator's error path (with the member for a per-member rule) that names the rule; every expected state comes from the owner-stated state and
  effect assertions. A referee case binds only when the
  approved contract states its expected outcome; a case where the referee and the contract disagree, or where the
  contract states no outcome, stays a design finding or gap evidence and never becomes a fixture, and the outcome the
  referee observed is recorded beside the case but never used as an expectation. A payload fixture record holds a
  fixture id, the contract ref, the rule id, the payload and its expected outcome; a behaviour fixture record holds the same fields with an input (a prior owner state plus an operation or event,
  or a short sequence) in place of the payload, its span reference, and the owner-stated state and effect assertions
  that apply to either polarity, each read through a declared observation surface (Plans/Planning_Wizard.md#PWIZ-110);
  a missing observation surface that already has a carried PWIZ-110 completeness finding keeps that disposition and is
  carried once, as a completeness gap, while one first found at compile time is an assertion test gap. Fixtures are listed in generated_test_ids (Plans/Automated_Testing_System.md#ATS-003); a bound oracle is listed in
  generated_test_ids, or in reused_test_ids when it is an existing test. A rule's surfaces are fixed by its kind: a declared failure result's are the callable surfaces in the interface
  bindings of the operations or events that declare it; a schema rule has one, its data shape's built validator (a
  declared consuming operation may be its run route, as Plans/Automated_Testing_System.md#ATS-401 allows), plus any
  owner surface on which the contract declares that shape's validation separately; a behavioural criterion's is the
  surface its input names; and an ATS-003 oracle criterion has one. No rule needs an accepted case on a surface the
  contract declares refusal-only. Only a declared failure result's callable surface can be silent on acceptance: when
  its approved contract leaves undecidable whether the passing neighbour is accepted there, that is the PWIZ-110
  completeness finding for an operation without its failure results, carried as a recorded gap that stands in for the
  missing neighbour while the refusing fixture still binds. A schema rule, a behavioural criterion or an ATS-003 oracle
  criterion whose required test is bound satisfies its disposition through that test, with no acceptance polarity and
  no completeness gap. Each rule ends in exactly one
  disposition on each of its surfaces, every surface's outcome and gaps counting toward the receiving node's completion
  for that rule, with coverage credit local to that surface: its required tests bound; for a shadowed refusal, its reachable refusal
  bound, with its passing neighbour where the surface admits an accepted call, and the recorded coverage evidence;
  for a schema rule whose refusing payload cannot be isolated, the passing payload bound together with a named gap
  evidenced to the standard of Plans/Planning_Wizard.md#PWIZ-111 (code-established coverage of the rule by its catching rules, found by the bounded isolation search PWIZ-111
  defines, with the same generators and stopping condition at compile time), whether
  the planning check or PlanCompile's own code produced that evidence, as the disposition of the refusal, binding a recorded multi-rule input
  as a regression fixture only where the approved contract determines the refusal for that exact input, and never with
  single-rule coverage credit; or a test gap for each required test that is missing because it could not be
  produced, failed its pre-bind check, or has no automatic route. A PWIZ-111 budget test gap whose rule PlanCompile then
  covers with bound required tests stays as planning evidence only. A bound fixture with a missing assertion keeps the rule's disposition as bound, and that assertion's test gap
  still applies at completion. A test gap is a recorded-gap record holding the rule id, the missing test or the
  missing assertion of a bound fixture, the reason, evidence refs, catching rules and its
  test_gap_policy, which PlanCompile sets under ATS-004 from what is actually missing, never from the planning
  check's search result alone: block_completion when the test or assertion itself is missing and an automatic route
  could run it (as when an isolation search ended on collisions against a runnable validator), and
  defer_non_executable_harness_candidate, recorded with its test-harness WorkNode request candidate, only when that
  automatic route is what is missing; allow_with_disposition and not_applicable are never used for a rule's required
  test. A deferred harness candidate keeps the rule's required verification open: the node is not marked complete on
  it until the harness work lets the test run and pass (Plans/Executor_Protocol.md#EP-101). A completeness or design finding carried as a recorded gap (Plans/Planning_Wizard.md#PWIZ-110 and #PWIZ-111) keeps
  its PWIZ-012 gap class and is resolved under that class, outside the test-gap policies above; when the build resolves
  the missing detail, the resulting rule's tests bind through the successor plan (PNC-015). When a contract changes after approval, the successor plan reruns its PWIZ-110 and PWIZ-111 checks
  and regenerates its tests, and the PlanDiffImpactReport (Plans/Executor_Protocol.md#EP-102) classifies each consuming
  node, with changed tests counting as an impact. The test_binding, test_case and test_run_receipt definitions in Plans/plans_to_code_handoff.schema.json do not yet
  carry payload fixture, behaviour fixture or recorded-gap records, or per-test outcomes with references to each
  recorded gap and its policy; that schema change is a required companion change before any compile uses this unit,
  it also fixes the per-keyword candidate generators and named-gap coverage conditions PWIZ-111 relies on, the fixture-owner designation rule and the TestRunReceipt fields that name a split rule's build inputs and an
  out-of-scope run's owner build, and its
  validation scenarios include a pattern rule and a length bound whose isolating witness must bind, a required list whose members each need their own refusal, a discriminated oneOf whose per-branch required member must bind an isolated refusal, a branch switch the contract
  accepts and a branch switch refused only by an independent assertion (neither credited to the branch's rule), a negation, a conditional selector whose contrasting accepted control must be accepted (an assertion applied on
  every route fails it), a refusal that must preserve state, and a replay that must return the right value without repeating its effect, and one case for each graph shape: a rule
  one node owns, a rule split across two parallel owner candidates with a fixture pass on an early or stale build that must not
  count, a rule enforced outside the compile's write scope whose existing owner tests, including one refusal that breaks
  two members at once, must not stand in for its required cases, and whose refusal a check added in the receiving
  node's code must not satisfy, and a run against a different owner build that produces the expected refusal but
  must not count, a split rule for which an implementing node and a later integration node both
  qualify, a candidate whose added edges would create a cycle, a rule
  with no lawful target, a declared failure that an earlier schema refusal shadows, whose case must bind, reach the built owner's validation and earn no independent
  coverage credit, and an absent owner build tested beside an existing owner build that lacks an automatic test route, a refusal-only
  surface certified by an executed denial with zero-effect evidence that still blocks when the refusal is missing or
  fails, a shadowed pair bound on one surface beside an ordinary test gap on a second surface, a shadowed failure on a
  refusal-only surface, and a data shape consumed by two operations, one of them refusal-only, that gets one schema
  disposition and no blocking gap, and a latency oracle that binds and runs with no operation-level accepted call and
  no completeness gap.
  This unit specifies the binding
  only; it emits no NodeSeeds, WorkNodes, executable queues or build tasks.
gui_related: false
gui_classification_reason: Defines how compile artifacts carry test fixtures; no visual presentation.
depends_on: [DL-512, PNC-013, PNC-015, PNC-016, EP-101, EP-102, PWIZ-110, PWIZ-111, ATS-003, ATS-004]
unblocks: [ATS-401]
acceptance_criteria:
  - "Every rule of every contract gets a test target fixed at WorkGraph construction: the one node that owns its enforcement; a designated fixture owner, picked by the companion's deterministic rule among candidates whose added edges keep the graph lawful, whose completion follows every other node its fixtures exercise; or, for a rule enforced outside the compile's write scope, each node in the compile that reaches its contract, with the required tests and dispositions an in-scope rule gets, run against the enforcing owner's built surfaces, and no existing owner test standing in for a required case; a split rule's fixtures count only when run on the designated node's final build with the completed outputs of every other node they exercise, all named in their receipt; a rule with no lawful target goes through the stage's repair route and otherwise fails certification closed."
  - "A test for a rule enforced outside the write scope runs directly against the exact owner build the receiving node resolves, never through the receiving node's code; a run counts only when its receipt binds that build's identity and it matches the receiving node's final owner dependency, a refusal only when that build produced it, and a changed owner dependency needs a fresh run; a failing test keeps the receiving node incomplete until a valid run passes, an adapter or harness fault is repaired through the test-harness route and the test reruns, and a failure that reproduces against the owner's surface waits for the owner's successor plan."
  - "Every rule ends in exactly one disposition on each of its surfaces as its kind fixes them (a declared failure's callable surfaces, a schema rule's built validator plus any separately declared validation surface, a behavioural criterion's named input surface, an oracle criterion's single one), every surface's outcome and gaps counting toward the receiving node's completion for that rule with credit local to that surface; no rule needs an accepted case on a refusal-only surface, and only a declared failure's callable surface left silent on acceptance is a recorded completeness gap, while a bound oracle criterion needs no acceptance polarity: its required tests bound; for a declared failure an earlier approved check always intercepts on a surface, its reachable refusal bound, with its passing neighbour where that surface admits an accepted call, and with code-established coverage evidence and no independent coverage credit for the shadowed result, while any other declared surface that reaches the original result binds that result's own required tests; a passing payload with a named gap evidenced to PWIZ-111's standard, by the planning check or by PlanCompile, for an unisolatable schema refusal; or a test gap for each required test that could not be produced, failed its pre-bind check, or has no automatic route."
  - "A schema rule's required tests are a refusing and a passing payload fixture, and for an assertion an if selects also a passing payload on each route the contract distinguishes and, wherever the contract admits one, a contrasting accepted control that still breaks the assertion on a route that does not select it; a declared failure result's are a refusing input and its passing neighbour on the same surface wherever the contract admits an accepted call there, or, on a surface the contract declares refusal-only, the refusing input with its stated effect assertions; a behavioural criterion's is one fixture per input condition it lists, each asserting its stated outcome so that a wrong result fails; any other criterion's is its ATS-003 oracle; no contract is exempt from schema fixtures; each member of a required list or other per-member constraint is its own rule with its own refusing fixture."
  - "Every behaviour fixture carries the owner-stated state and effect assertions for its polarity, each read through a declared observation surface; where a surface is missing, the carried PWIZ-110 completeness gap stands, or an assertion test gap if the gap was first found at compile time."
  - "Every expected outcome comes from the approved contract; a referee case that disagrees with the contract or lacks a contract outcome never binds, and observed planning outcomes are kept only as evidence."
  - "Every behaviour fixture cites its source span and keeps an immutable reference to that span in the approved plan version; before it binds, code validates the fixture record, confirms that its input has the schema result the approved contract specifies for the case, an expected earlier schema refusal included, and checks its expected code against the declared failure codes."
  - "A named-gap regression input binds only where the approved contract determines its refusal, and never with single-rule coverage credit."
  - "A test gap's test_gap_policy is set by PlanCompile from what is actually missing: block_completion when an automatic route exists for the missing test or assertion, defer_non_executable_harness_candidate only when the route itself is missing, a missing owner build always block_completion naming that build and never a harness candidate, and a deferred candidate keeps the rule's verification open under EP-101; allow_with_disposition and not_applicable are never used for a rule's required test."
  - "A contract change after approval reruns its checks in the successor plan and regenerates its tests, and the PlanDiffImpactReport classifies every consuming node."
  - "The handoff schema change for payload fixture, behaviour fixture and recorded-gap records, and for per-test outcomes in test_run_receipt, is a recorded companion change, required before any compile uses this unit; it also fixes the per-keyword candidate generators, the named-gap coverage conditions, the effective-assertion definitions and refusal attribution for applicators, the per-member identity, the fixture-owner designation rule and the TestRunReceipt fields that name a split rule's build inputs and an out-of-scope run's owner build, with the
  pattern, length-bound, required-member, discriminated-oneOf, branch-switch, independent-assertion, negation,
  conditional-selector contrasting-control, state-preserving refusal and replay scenarios, and one scenario for each graph shape (a single owner, split parallel owners with an early or stale-build pass that must not count, enforcement outside the write scope whose existing owner tests must not stand in for its required cases and whose refusal the receiving node's own check or a different owner build must not satisfy, an integration node that also qualifies as fixture owner, a candidate whose edges would create a cycle, no lawful target, a shadowed declared failure, an absent owner build, a refusal-only surface, a shadowed pair beside a gap on a second surface, a shadowed failure on a refusal-only surface, a shape consumed by a refusal-only operation, and a latency oracle with no accepted call and no gap)."
  - "A carried completeness or design gap keeps its PWIZ-012 class and is resolved under that class, not under the test-gap policies."
  - "No NodeSeeds, WorkNodes, executable queues, final node manifests, production build tasks, implementation files or source code are created by this PlanUnit."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: weak_test_oracle
reasoning_tier: high
context_scope: worknode_test_binding
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: worknode_test_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-512
  - "pm-mail 1125004841-a1d8 (pm-ea-lead, 2026-11-25): a credited kill is a negative fixture and its control a positive one; per-rule fixtures for the other families must come from the WorkNode compiler, the builder or the tooling"
preserved_exact_tokens:
  - "payload fixture"
  - "behaviour fixture"
  - "recorded-gap record"
  - "generated_test_ids"
  - "test_gap_policy"
  - "required_before_completion"
  - "PlanDiffImpactReport"
negative_constraints:
  - Do not count a named gap, a test gap or a rule without its required tests as passing.
  - Do not use an outcome the referee observed as a fixture's expected outcome; only the approved contract sets expectations.
  - Do not exempt a contract's schema rules from payload fixtures, and do not invent an opposite-polarity test for a behavioural criterion that prescribes none.
  - Do not give a rule's required test the test_gap_policy allow_with_disposition or not_applicable.
  - Do not create WorkNodes, NodeSeeds or build tasks from this unit.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/Planning_Wizard.md, Plans/Executor_Protocol.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-013, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-015, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-016, ContractName:Plans/Executor_Protocol.md#EP-101, ContractName:Plans/Executor_Protocol.md#EP-102, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004
