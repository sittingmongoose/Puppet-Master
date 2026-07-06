# Shard 023: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/Executor_Protocol.md`

Source lines: L6289-L6428

Source SHA256: `fb9aabd06d324fae90cd54c82bf189bbba1a8a8b785856b07cc0bfeb7f09608e`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### EP-106 - Executor Discovery Orientation And Verification Handoff

```yaml
plan_unit_id: EP-106
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor Builder and Verifier actors may use discover_paths for file orientation when implementation or verification requires locating files without exact path evidence. Builder uses ranked discovery candidates for read orientation only, while Verifier may use discovery to locate verification-relevant files. Ranking never substitutes for exact evidence, tests, AST/LSP, grep/codesearch/Instant Grep, domain checks, or verifier pass criteria; discovery receipts feed attempt evidence only when linked to exact verification receipts before edits, test claims, completion, or verifier pass.
gui_related: false
gui_classification_reason: This is Executor protocol and verification handoff behavior, not GUI presentation.
depends_on: [T-161, T-162, OSI-429, CV-291]
unblocks: [ATS-011]
acceptance_criteria:
  - Builder uses discovery only for orientation when exact paths are absent.
  - Verifier may use discovery to find evidence targets but still requires exact evidence.
  - Discovery output cannot satisfy verifier pass criteria without exact verification.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future Builder no-path orientation test.
  - Future Verifier exact evidence follow-up test.
  - Future SSH no-local-checkout Executor task test.
risk_class: executor_evidence_drift
reasoning_tier: standard
context_scope: executor_discovery_handoff
implementation_surfaces: [Plans/Executor_Protocol.md, future Executor Builder/Verifier routes]
node_compile_hint: {mode: executor_discovery_orientation, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0041
  - pldg-20260622-001-fff:atom-0027
  - pldg-20260622-001-fff:atom-0030
  - pldg-20260622-001-fff:atom-0037
  - pldg-20260622-001-fff:atom-0043
  - pldg-20260622-001-fff:atom-0058
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:atom-0094
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#executor_builder_verifier
source_atom_ids: [atom-0027, atom-0030, atom-0037, atom-0041, atom-0043, atom-0058, atom-0059, atom-0092, atom-0094]
preserved_exact_tokens: ["Builder", "Verifier", "orientation only", "ranking never substitutes", "exact evidence", "AST/LSP", "grep/codesearch/Instant Grep", "verifier pass"]
negative_constraints:
  - Do not let ranking substitute for verifier evidence.
  - Do not claim root cause, completion, or verifier pass from discovery candidates alone.
owner_hints: [Plans/Executor_Protocol.md, Plans/Tools.md, Plans/Automated_Testing_System.md]
```

### EP-105 - Runtime WorkNodeRecord Identity, Receipts, And Activation Consumers

```yaml
plan_unit_id: EP-105
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'After Activation Decision accepts the certified graph, Executor materializes canonical WorkNodeRecord objects from accepted WorkNodeRequests and emits materialization receipts. WorkNodeRecord includes worknode_id, goal_run_id, workgraph_id and revision, source_request_id, source PlanUnit and acceptance refs, objective, surfaces, typed readiness predicates, lifecycle, attempts and retries, authority, model, tests, repository/worktree/safe-point refs, evidence, currentness, cancellation, invalidation, and replan generation. Existing project_plan_node schema remains an import or compatibility contract with an explicit adapter and must not silently become the canonical runtime WorkNodeRecord. Work dispatch, change, test, retry, and completion receipts use worknode_id and attempt_id plus source_request_id and graph revision; a WorkNodeRequest reference alone is not sufficient runtime identity. A context-aware incomplete-content
  validator runs at Planning Wizard approval, Plan Compile certification, WorkNode completion, and Goal completion across active Plans, compile artifacts, first-party code, tests, generated outputs, and delivery artifacts. Implementation readiness of the complete pipeline requires a clean-room fixture proving Approve And Build creates exactly one PlanCompileRun, executes mandatory parallel stages, certifies a complete WorkGraph and WorkNodeRequests, passes Executor intake/provisioning, atomically creates GoalRun and WorkNodes, queues an entrypoint, and appears in Orchestrator. The fixture suite covers duplicate PlanApproved delivery, restart during every activation step, greenfield Git, non-Git FileSafe, dirty repository, remote SSH, optional GitHub or PR, missing harness, testing override, plan revision during compile and execution, cancellation before and after mutation, missing parallel receipts, and a deliberately introduced incomplete item.'
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
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Progression_Gates.md
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0121
- pldg-20260618-001-prd-planning-wizard:atom-0122
- pldg-20260618-001-prd-planning-wizard:atom-0123
- pldg-20260618-001-prd-planning-wizard:atom-0124
- pldg-20260618-001-prd-planning-wizard:atom-0137
- pldg-20260618-001-prd-planning-wizard:atom-0145
- pldg-20260618-001-prd-planning-wizard:atom-0146
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0121
- atom-0122
- atom-0123
- atom-0124
- atom-0137
- atom-0145
- atom-0146
decision_refs:
- dec-0025
- dec-0027
- dec-0028
correction_refs: []
preserved_exact_tokens:
- WorkNodeRecord
- WorkNodeMaterializationReceipt
- worknode_id
- goal_run_id
- workgraph_revision
- attempt_id
- replan generation
- project_plan_node
- compatibility adapter
- Planning Wizard approval
- Plan Compile certification
- WorkNode completion
- Goal completion
- clean-room fixture
- exactly one PlanCompileRun
- entrypoint queued
- duplicate PlanApproved
- dirty repository
- missing parallel receipts
- deliberately introduced incomplete item
negative_constraints:
- Do not overload a legacy plan-node shape as runtime execution truth.
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Progression_Gates.md
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
```
