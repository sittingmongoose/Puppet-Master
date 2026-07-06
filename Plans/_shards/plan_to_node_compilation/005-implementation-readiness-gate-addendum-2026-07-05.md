# Shard 005: Implementation Readiness Gate Addendum - 2026-07-05

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L144-L448

Source SHA256: `251de9d43cc5b0c5a19649e338bb296b6fd7c5e189171315196847f636ddbd0e`

---

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
