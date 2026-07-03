# Shard 014: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Goal_Runtime_System.md`

Source lines: L2210-L2348

Source SHA256: `583517d758bc7d638bea028ae83ceea2657045df38867dd578b3c7db0a17815e`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### GRS-031 - Approve And Build Launch, Parallel Enforcement, And Atomic Activation

```yaml
plan_unit_id: GRS-031
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'Approve And Build first validates a compare-and-swap approval boundary over the PlanningRun revision, topic map version, immutable pack identity, pack version, pack hash, project-context snapshot hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, and final audit/closure hash shown in final review. It then atomically writes the immutable pack, approval_cas_receipt, user approval receipt, and PlanApproved transactional-outbox event so approval cannot be committed without a recoverable downstream trigger. PlanApproved uses a deterministic idempotency key derived from project_id, pack_id, pack version, pack hash, and approval CAS inputs; duplicate delivery returns the existing PlanCompileRun rather than creating another run. In the finished-product native runtime contract, ordinary Approve And Build flow immediately creates or resumes exactly one PlanCompileRun and returns its identity synchronously before projection reconciliation; optional HITL checkpoints are policy exceptions, not the default. During the current bootstrap ledger-to-Plans lane, this remains product-runtime canon and does not launch PlanCompile. For broad stages the controller computes a bounded worklist and mandatory minimum parallel assignments, launches read-only subagents, records assignment and completion receipts, and rejects certification when required parallel work is absent. A required broad stage may reduce scope or block with a typed runtime-capability
  error, but it may not silently substitute one broad agent for mandatory parallel analysis or review. Activation requires all required active-scope WorkNodeRequests to be accepted together; optional work must be explicitly excluded or deferred before activation, and a mixed result cannot silently start a partial build. After provisioning acceptance, one activation transaction creates or binds the GoalRun in activating state, installs the certified WorkGraph revision, materializes all WorkNodes, queues runnable entrypoints, records the activation receipt, and writes GoalRunStarted or BuildStarted through a transactional outbox. Orchestrator may show launch and provisioning progress before activation, but it marks the build running and exposes runnable WorkNodes only after the atomic activation commit and durable start receipt. Activation persists activation_pending, records_materialized, entrypoints_queued, start_event_pending, active, and cancelled_before_mutation
  states; retries resume idempotently, duplicate commands return the existing GoalRun, and cancellation routes according to whether mutation began. Planning Wizard uses current Goal Runtime and Auditor-based AuditCycle, AuditFinding, RepairAttempt, AuditClosure, and CertificationReceipt records rather than superseded experimental workflow machinery. The final audit controller must launch multiple bounded read-only specialist agents in parallel for distinct defect families, persist assignments and results, reduce findings, run bounded repairs, and re-audit until all findings are durably closed or a true typed blocker remains. Audit and repair subagents inspect, classify, compare, and propose; the Planning Run controller or assigned canonical artifact owner performs serialized writes, updates closures, and issues certification. Classify gaps as auto_resolvable, safe_default_with_assumption, defer_to_plan_compile, defer_to_worknode_system, requires_user_policy_decision,
  requires_user_risk_acceptance, requires_external_credential, or true infrastructure/runtime blocker.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
- Approve And Build records an approval CAS receipt and fails closed when final-review currentness inputs drift.
- The PlanCompileRun identity is created or returned synchronously; projection identity reconciliation cannot be the source of run identity truth.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Orchestrator_Page.md
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0104
- pldg-20260618-001-prd-planning-wizard:atom-0105
- pldg-20260618-001-prd-planning-wizard:atom-0106
- pldg-20260618-001-prd-planning-wizard:atom-0114
- pldg-20260618-001-prd-planning-wizard:atom-0115
- pldg-20260618-001-prd-planning-wizard:atom-0120
- pldg-20260618-001-prd-planning-wizard:atom-0125
- pldg-20260618-001-prd-planning-wizard:atom-0126
- pldg-20260618-001-prd-planning-wizard:atom-0127
- pldg-20260618-001-prd-planning-wizard:atom-0130
- pldg-20260618-001-prd-planning-wizard:atom-0133
- pldg-20260618-001-prd-planning-wizard:atom-0135
- pldg-20260618-001-prd-planning-wizard:atom-0143
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0104
- atom-0105
- atom-0106
- atom-0114
- atom-0115
- atom-0120
- atom-0125
- atom-0126
- atom-0127
- atom-0130
- atom-0133
- atom-0135
- atom-0143
decision_refs:
- dec-0021
- dec-0023
- dec-0025
- dec-0026
correction_refs:
- corr-0008
- corr-0009
preserved_exact_tokens:
- PlanApproved
- approval_cas_receipt
- transactional outbox
- idempotency_key
- project_id
- pack_hash
- PlanningRun revision
- topic map version
- project-context snapshot hash
- automatic_after_approval
- PlanCompileRun
- minimum_parallel_assignments
- assignment receipt
- completion receipt
- parallelism_required
- runtime-capability blocker
- all required active-scope
- mixed
- GoalRunStarted
- BuildStarted
- activation transaction
- activation commit
- running
- activation_pending
- records_materialized
- entrypoints_queued
- cancelled_before_mutation
- AuditCycle
- AuditFinding
- RepairAttempt
- AuditClosure
- CertificationReceipt
- multiple bounded read-only specialist agents in parallel
- durably closed
- sole writer
- serialized writes
- auto_resolvable
- safe_default_with_assumption
- requires_user_risk_acceptance
negative_constraints:
- Do not require a redundant ordinary Start Build confirmation after Approve And Build.
- Do not approve stale final-review inputs or defer PlanCompileRun identity creation to projection reconciliation.
- Do not accept agent self-report as proof that required parallel subagents were used.
- Do not silently degrade a mandatory parallel stage to one agent.
- Do not start a partially accepted required WorkGraph.
- Do not make superseded experimental pipeline artifacts part of the product audit architecture.
- Do not certify a broad final audit performed by one agent when parallel specialist review is required.
- Do not allow parallel repair subagents to race canonical Plan writes.
owner_hints:
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Orchestrator_Page.md
- Plans/human-in-the-loop.md
```
