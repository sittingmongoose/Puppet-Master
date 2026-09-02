# Shard 032: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Contracts_V0.md`

Source lines: L18063-L18295

Source SHA256: `8c7a1cfb06b9002436190af12a1dcdccdc2913bbb7c6ffe13118bc081fa33613`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### CV-290 - Planning Runtime Events, Packs, Records, And Exceptions

```yaml
plan_unit_id: CV-290
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Approval creates an immutable, versioned Approved PRD Pack containing the primary PRD, accepted PRD-ledger snapshot, source manifest, traceability, assumptions and constraints, open questions, quality report, approval receipt, hashes, and version identity. Edits after approval create a new draft based on the approved version and require a new approval event; previous Approved PRD Packs remain immutable and addressable. Planning Wizard accepts an Approved PRD Pack, normalized imported requirements pack, or structured Assistant Chat handoff seed, preserving source identity, version, hashes, warnings, amendments, and lineage. PlanningRun owns source pack identity, project and work-intent context, thread group, global planning ledger, dynamic topic map, topic threads, topic plan drafts, amendments, invalidations, audit cycles, final plan pack, status, hashes, and handoff events. Planning Wizard child-thread identity uses thread_type planning_wizard plus thread_role values for intake, topic, final_integration, audit_review, and final_review, bound to Planning Run membership rather than minted as unrelated top-level thread families. The controller can add, split, merge, rename,
  defer, reopen, reorder, and mark topics impacted, recording the reason, source refs, dependencies, user-visible origin, and resulting invalidations. A later decision that changes a prior topic''s assumptions or outputs marks affected topic drafts stale_due_to_dependency_change, stale_due_to_new_scope, or requires_recompile/requires_reaudit and propagates impact through typed topic dependencies. New information during planning becomes a planning clarification, immutable Planning Amendment, out_of_current_approved_scope item, or PRD revision request according to materiality and impact. Disabling or restricting automated testing requires a durable testing_policy_override explicitly approved by the user for exact projects, PlanUnits, WorkNodes, capability classes, reasons, risks, and reopen conditions. Affected work remains truthfully marked with an approved verification exception, such as completed_with_approved_verification_exception, and must never be
  represented as an automated test pass or full certification. Each testing capability family supports Auto, On, and Off: Auto discovers and selects or installs within authority; On is required and blocks or asks for authority when unavailable; Off prohibits use and installation for that capability without implying a pass. Approve And Build atomically writes the immutable pack, user approval receipt, and PlanApproved transactional-outbox event so approval cannot be committed without a recoverable downstream trigger. PlanApproved uses a deterministic idempotency key derived from project_id, pack_id, pack version, and pack hash; duplicate delivery returns the existing PlanCompileRun rather than creating another run. The runtime schema includes contract_mode, launch_policy, runtime_adapter, runtime_enablement_ref, and runtime_policy_snapshot_ref; the design_only branch preserves disabled bootstrap semantics, while the finished-product native_runtime branch defaults to automatic_after_approval through native_puppet_master_adapter with runtime enablement evidence.
  Each stage card defines exact inputs, outputs, algorithms, bounded units, read/write authority, required parallelism, validators, retry and repair routes, currentness behavior, terminal states, and evidence/receipt requirements. A certified WorkNodeRequest has non-empty objective, source PlanUnits and acceptance units, bounded read/write/implementation surfaces, typed dependencies, authority, model/capability routing, test binding, repository currentness, evidence requirements, idempotency, cancellation, and no unsupported or placeholder content. After Activation Decision accepts the certified graph, Executor materializes canonical WorkNodeRecord objects from accepted WorkNodeRequests and emits materialization receipts. WorkNodeRecord includes worknode_id, goal_run_id, workgraph_id and revision, source_request_id, source PlanUnit and acceptance refs, objective, surfaces, typed readiness predicates, lifecycle, attempts and retries, authority,
  model, tests, repository/worktree/safe-point refs, evidence, currentness, cancellation, invalidation, and replan generation. Existing project_plan_node schema remains an import or compatibility contract with an explicit adapter and must not silently become the canonical runtime WorkNodeRecord. Work dispatch, change, test, retry, and completion receipts use worknode_id and attempt_id plus source_request_id and graph revision; a WorkNodeRequest reference alone is not sufficient runtime identity. After provisioning acceptance, one activation transaction creates or binds the GoalRun in activating state, installs the certified WorkGraph revision, materializes all WorkNodes, queues runnable entrypoints, records the activation receipt, and writes GoalRunStarted or BuildStarted through a transactional outbox. Orchestrator may show launch and provisioning progress before activation, but it marks the build running and exposes runnable WorkNodes only after
  the atomic activation commit and durable start receipt. Activation persists activation_pending, records_materialized, entrypoints_queued, start_event_pending, active, and cancelled_before_mutation states; retries resume idempotently, duplicate commands return the existing GoalRun, and cancellation routes according to whether mutation began. Within the stable pm.plans_to_code_handoff.v1 schema document, plans-to-code runtime-capable v2 native_runtime records carry schema version, project, planning run, plan pack, PlanCompileRun, GoalRun, WorkGraph and revision, WorkNode, attempt, actor, status, revision, hashes, currentness, correlation, causation, idempotency, source, artifact, evidence, and supersession fields as applicable. Planning Wizard uses current Goal Runtime and Auditor-based AuditCycle, AuditFinding, RepairAttempt, AuditClosure, and CertificationReceipt records rather than superseded experimental workflow machinery. The final audit controller must launch multiple bounded read-only specialist agents in parallel for distinct
  defect families, persist assignments and results, reduce findings, run bounded repairs, and re-audit until all findings are durably closed or a true typed blocker remains. Audit findings have stable finding keys, source and artifact hashes, closure status, evidence, reason, repair attempts, and reopen conditions so unchanged closed findings become previously closed rather than recurring forever. The only permitted incomplete item is a user_approved_incomplete_item naming the exact artifact and span, reason, risk, approver, downstream disposition, expiration or reopen condition, and evidence; broad permission to leave TODOs is invalid.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: [PNC-015]
unblocks: [CV-289]
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- "The handoff schema carries the runtime-v2 PlanCompileRun fields `contract_mode`, `launch_policy`, `runtime_adapter`, `runtime_enablement_ref`, and `runtime_policy_snapshot_ref`; design_only records remain disabled, while native_runtime records require enablement evidence before automatic launch."
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/PRD_Builder.md
- Plans/Project_Output_Artifacts.md
- Plans/Planning_Wizard.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/Automated_Testing_System.md
- Plans/human-in-the-loop.md
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Orchestrator_Page.md
- Plans/Progression_Gates.md
- Plans/plans_to_code_handoff.schema.json
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0008
- pldg-20260618-001-prd-planning-wizard:atom-0027
- pldg-20260618-001-prd-planning-wizard:atom-0029
- pldg-20260618-001-prd-planning-wizard:atom-0039
- pldg-20260618-001-prd-planning-wizard:atom-0042
- pldg-20260618-001-prd-planning-wizard:atom-0048
- pldg-20260618-001-prd-planning-wizard:atom-0055
- pldg-20260618-001-prd-planning-wizard:atom-0056
- pldg-20260618-001-prd-planning-wizard:atom-0081
- pldg-20260618-001-prd-planning-wizard:atom-0082
- pldg-20260618-001-prd-planning-wizard:atom-0090
- pldg-20260618-001-prd-planning-wizard:atom-0104
- pldg-20260618-001-prd-planning-wizard:atom-0105
- pldg-20260618-001-prd-planning-wizard:atom-0110
- pldg-20260618-001-prd-planning-wizard:atom-0113
- pldg-20260618-001-prd-planning-wizard:atom-0118
- pldg-20260618-001-prd-planning-wizard:atom-0121
- pldg-20260618-001-prd-planning-wizard:atom-0122
- pldg-20260618-001-prd-planning-wizard:atom-0123
- pldg-20260618-001-prd-planning-wizard:atom-0124
- pldg-20260618-001-prd-planning-wizard:atom-0125
- pldg-20260618-001-prd-planning-wizard:atom-0126
- pldg-20260618-001-prd-planning-wizard:atom-0127
- pldg-20260618-001-prd-planning-wizard:atom-0128
- pldg-20260618-001-prd-planning-wizard:atom-0130
- pldg-20260618-001-prd-planning-wizard:atom-0133
- pldg-20260618-001-prd-planning-wizard:atom-0134
- pldg-20260618-001-prd-planning-wizard:atom-0139
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0008
- atom-0027
- atom-0029
- atom-0039
- atom-0042
- atom-0048
- atom-0055
- atom-0056
- atom-0081
- atom-0082
- atom-0090
- atom-0104
- atom-0105
- atom-0110
- atom-0113
- atom-0118
- atom-0121
- atom-0122
- atom-0123
- atom-0124
- atom-0125
- atom-0126
- atom-0127
- atom-0128
- atom-0130
- atom-0133
- atom-0134
- atom-0139
decision_refs:
- dec-0002
- dec-0010
- dec-0013
- dec-0016
- dec-0018
- dec-0021
- dec-0022
- dec-0024
- dec-0025
- dec-0026
- dec-0027
correction_refs:
- corr-0007
- corr-0015
- corr-0009
- corr-0010
preserved_exact_tokens:
- Approved PRD Pack
- immutable
- versioned
- successor version
- Assistant Chat handoff seed
- PlanningRun
- 'thread_type: planning_wizard'
- thread_role
- thread_group_id
- topic map
- add_topic
- split_topic
- merge_topics
- mark_topic_impacted
- stale_due_to_dependency_change
- requires_recompile
- requires_reaudit
- Planning Amendment
- PRD revision request
- testing_policy_override
- completed_with_approved_verification_exception
- Auto
- 'On'
- 'Off'
- PlanApproved
- transactional outbox
- idempotency_key
- project_id
- pack_hash
- contract_mode
- launch_policy
- runtime_adapter
- native_puppet_master_adapter
- inputs
- outputs
- required parallelism
- terminal states
- WorkNodeRequest
- objective
- acceptance units
- test binding
- WorkNodeRecord
- WorkNodeMaterializationReceipt
- worknode_id
- goal_run_id
- workgraph_revision
- attempt_id
- replan generation
- project_plan_node
- compatibility adapter
- GoalRunStarted
- BuildStarted
- activation transaction
- activation commit
- running
- activation_pending
- records_materialized
- entrypoints_queued
- cancelled_before_mutation
- correlation_id
- causation_id
- currentness_status
- AuditCycle
- AuditFinding
- RepairAttempt
- AuditClosure
- CertificationReceipt
- multiple bounded read-only specialist agents in parallel
- durably closed
- finding_key
- previously_closed
- reopen conditions
- user_approved_incomplete_item
negative_constraints:
- Do not leave a topic marked Ready after a material dependency change.
- Do not infer an opt-out from casual conversation or a capability setting being unavailable.
- Do not convert an approved testing exception into test_passed or certified.
- Do not treat Off as successful verification.
- Do not overload a legacy plan-node shape as runtime execution truth.
- Do not make superseded experimental pipeline artifacts part of the product audit architecture.
- Do not certify a broad final audit performed by one agent when parallel specialist review is required.
- Do not accept a broad 'allow TODOs' exception.
- Do not define planning_topic or audit_review as unrelated top-level thread types.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/Planning_Wizard.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/Automated_Testing_System.md
- Plans/human-in-the-loop.md
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Orchestrator_Page.md
- Plans/Progression_Gates.md
```
