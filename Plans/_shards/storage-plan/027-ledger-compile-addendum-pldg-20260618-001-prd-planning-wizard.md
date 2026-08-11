# Shard 027: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/storage-plan.md`

Source lines: L15221-L15316

Source SHA256: `21bd16a8872bfbd2f641dac39e4b02bb8f311eb5f90d27fbb3c5de62157c5706`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### SP-216 - PlanningRun, PlanCompile, WorkNode, And Audit Persistence

```yaml
plan_unit_id: SP-216
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'PlanningRun owns source pack identity, project and work-intent context, thread group, global planning ledger, dynamic topic map, topic threads, topic plan drafts, amendments, invalidations, audit cycles, final plan pack, status, hashes, and handoff events. Planning Wizard child-thread records persist thread_type planning_wizard, thread_role, and Planning Run membership so intake, topic, final_integration, audit_review, and final_review conversations stay one typed thread family rather than unrelated top-level thread types. PlanCompileRun persists stage, cursor, bounded worklists, assignment receipts, source hashes, currentness status, blockers, repairs, artifacts, retries, cancellation, supersession, and exact next action across context and process restarts. After Activation Decision accepts the certified graph, Executor materializes canonical WorkNodeRecord objects from accepted WorkNodeRequests and emits materialization receipts. WorkNodeRecord includes worknode_id, goal_run_id, workgraph_id and revision, source_request_id, source PlanUnit and acceptance refs, objective, surfaces, typed readiness predicates, lifecycle, attempts and retries, authority, model, tests, repository/worktree/safe-point
  refs, evidence, currentness, cancellation, invalidation, and replan generation. Plans-to-code runtime records carry schema version, project, planning run, plan pack, PlanCompileRun, GoalRun, WorkGraph and revision, WorkNode, attempt, actor, status, revision, hashes, currentness, correlation, causation, idempotency, source, artifact, evidence, and supersession fields as applicable. Audit findings have stable finding keys, source and artifact hashes, closure status, evidence, reason, repair attempts, and reopen conditions so unchanged closed findings become previously closed rather than recurring forever.'
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
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Goal_Runtime_System.md
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0008
- pldg-20260618-001-prd-planning-wizard:atom-0042
- pldg-20260618-001-prd-planning-wizard:atom-0111
- pldg-20260618-001-prd-planning-wizard:atom-0121
- pldg-20260618-001-prd-planning-wizard:atom-0122
- pldg-20260618-001-prd-planning-wizard:atom-0128
- pldg-20260618-001-prd-planning-wizard:atom-0134
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0008
- atom-0042
- atom-0111
- atom-0121
- atom-0122
- atom-0128
- atom-0134
decision_refs:
- dec-0010
- dec-0025
- dec-0026
correction_refs: []
preserved_exact_tokens:
- PlanningRun
- 'thread_type: planning_wizard'
- thread_role
- thread_group_id
- topic map
- PlanCompileRun
- currentness
- resume
- WorkNodeRecord
- WorkNodeMaterializationReceipt
- worknode_id
- goal_run_id
- workgraph_revision
- attempt_id
- replan generation
- correlation_id
- causation_id
- idempotency_key
- currentness_status
- finding_key
- previously_closed
- reopen conditions
negative_constraints:
- Do not define planning_topic or audit_review as unrelated top-level thread types.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Goal_Runtime_System.md
- Plans/Executor_Protocol.md
```
