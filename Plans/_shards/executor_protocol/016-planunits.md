# Shard 016: PlanUnits

Source: `Plans/Executor_Protocol.md`

Source lines: L850-L5699

Source SHA256: `ebea79168c58573e4bee31bc623baa0d719de169323c615032e680f03482be7e`

---

## PlanUnits

### EP-002 - Doc Authority, Compliance, And Scope

```yaml
plan_unit_id: EP-002
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Executor Protocol owns deterministic plan_graph execution ordering and completion semantics for self-build and user-project sharded plan graph artifacts, while preserving owner-section authority, compliance, and compatibility-only vocabulary boundaries.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: doc_authority_compliance_and_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0007
preserved_exact_tokens:
- Overseer Protocol (Canonical)
- Canonical owner-section requirements
- Compatibility-only source vocabulary is noncanonical
- Puppet Master
- plan_graph
- Plans/plan_graph.json
- .puppet-master/project/plan_graph/
- .puppet-master/project/plan_graph/index.json
- monolithic export is optional/non-canonical
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Progression_Gates.md'
negative_constraints: []
compatibility_only_notes:
- Compatibility-only source vocabulary is noncanonical; live wording uses owner terminology.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-003 - Execution Actor Role Definitions

```yaml
plan_unit_id: EP-003
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Executor Protocol defines Builder/node worker, Verifier/reviewer/corroborator, Package Overseer, and Seam Overseer roles without making execution-support actors the scheduler.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: execution_actor_role_definitions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0012
preserved_exact_tokens:
- Builder / node worker
- Verifier / reviewer / corroborator
- Package Overseer
- Seam Overseer
- Work Package
- Feature Seam
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-004 - Runtime Scheduler Authority And Dual Overseer Boundary

```yaml
plan_unit_id: EP-004
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime scheduler owns readiness, blocked state, transitions, retry budgets, wakeups, and dispatch; overseers remain governance actors and are not hidden second schedulers.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_scheduler_authority_and_dual_overseer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0013
preserved_exact_tokens:
- Runtime scheduler
- readiness
- blocked state
- transitions
- retry budgets
- wakeups
- dispatch
- overseers are governance actors, not hidden second schedulers
- /control
- dual-overseer model
- package and seam overseers
negative_constraints:
- Overseers are governance actors, not hidden second schedulers.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-005 - Scheduler Durable State And Tier Compatibility Retirement

```yaml
plan_unit_id: EP-005
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime scheduling consumes durable package/seam/lane and sharded-node state; tier-era terms, TierType, TierContext, active-agents, tier_tree, Tiers, PuppetMasterEvent streams, and related labels are compatibility inputs only.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: scheduler_durable_state_and_tier_compatibility_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0013
preserved_exact_tokens:
- package/seam/lane
- seglog/redb-backed projections
- active-agents
- TierType
- TierContext
- /seams
- tier
- subtask
- run.tier_
- run.tier_*
- tier_tree
- Tiers
- PuppetMasterEvent
- PuppetMasterEvent::*
negative_constraints: []
compatibility_only_notes:
- Tier-era vocabulary is compatibility or derived-view vocabulary only.
stale_retired_dispositions:
- Cleanup /reconciliation moves stale /tier consumers to worktree/package/seam-aware routing and effective account/runtime identity displays.
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-006 - Runtime Object Opening And Projection Consumers

```yaml
plan_unit_id: EP-006
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime objects open through route_target and OpenSubject consumers; projection-backed actions show projection_health and projection_freshness before mutating blocked episodes, seams, packages, or overseer targets.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_object_opening_and_projection_consumers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0013
preserved_exact_tokens:
- route_target
- OpenSubject
- projection_health
- projection_freshness
- blocked-episode
- Feature Seam
- Work Package
- Seam Overseer
- Package Overseer
- /layout/help/glossary
negative_constraints:
- Projection-backed actions must not mutate runtime objects without health/freshness context.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-007 - Canonical Node State Readiness Source

```yaml
plan_unit_id: EP-007
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Overseer reads execution state from canonical node documents in self-build or user-project sharded graph storage and must not infer execution state from index metadata alone.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_node_state_readiness_source
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0014
preserved_exact_tokens:
- Plans/plan_graph.json.nodes[]
- .puppet-master/project/plan_graph/nodes/<node_id>.json
- Overseer MUST NOT infer execution state from index metadata alone
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/project_plan_graph_index.schema.json'
negative_constraints:
- Overseer must not infer execution state from index metadata alone.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-008 - Ready Predicate And Spec Lock Matching

```yaml
plan_unit_id: EP-008
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: A node is ready only when queued, all blockers are done, Spec Lock schema_versions exactly match, and tie-breaking chooses the lexicographically smallest node_id.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: ready_predicate_and_spec_lock_matching
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0014
preserved_exact_tokens:
- status == "queued"
- blockers[]
- status == "done"
- spec_lock_requirements.schema_versions
- Plans/Spec_Lock.json.schema_versions
- lexicographically smallest `node_id`
- 'ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Spec_Lock.json'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-009 - Blocker Integrity Rule

```yaml
plan_unit_id: EP-009
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Every blockers[] entry resolves to an existing canonical node document; unresolved blocker IDs are invalid graph input and keep the node not ready.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocker_integrity_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0014
preserved_exact_tokens:
- Every `blockers[]` entry MUST resolve
- existing canonical node document
- unresolved blocker ID
- invalid graph input
- not ready
- 'ContractRef: ContractName:Plans/Spec_Lock.json, ContractName:Plans/Project_Output_Artifacts.md'
negative_constraints:
- User-project nodes must not invent ad-hoc schema-version key names.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-010 - Canonical Node Status Lifecycle

```yaml
plan_unit_id: EP-010
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Canonical status lifecycle is queued -> in_progress -> verify_pending -> verified -> done for success and verify_pending -> failed for failure; done and failed are terminal and out-of-order transitions are rejected.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_node_status_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0015
preserved_exact_tokens:
- queued -> in_progress -> verify_pending -> verified -> done
- verify_pending -> failed
- done
- failed
- terminal states
- reject out-of-order transitions
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Executor_Protocol.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-011 - Run-Local UI/Orchestrator Status Overlays

```yaml
plan_unit_id: EP-011
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: UI and orchestrator labels such as waiting_approval, needs_review, cancelled, or complete_with_warnings are run-local overlay or CTA states, not canonical node status values, and must persist separately.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: run_local_ui_orchestrator_status_overlays
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0015
preserved_exact_tokens:
- waiting_approval
- needs_review
- cancelled
- complete_with_warnings
- run-local overlays / CTA states
- canonical node `status` values
- persisted as separate events or projections
negative_constraints:
- Run-local overlays must not replace the canonical status lifecycle.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-012 - Verifier Auto-Marking And Verified Transition

```yaml
plan_unit_id: EP-012
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Verifier evidence with pass outcome moves status through verified before done; the verified state is schema-enforced, manual mark-complete is not required, and fail outcome sets failed.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: verifier_auto_marking_and_verified_transition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0016
preserved_exact_tokens:
- evidence_pointer
- verifier_result
- verifier_result.outcome == "pass"
- status = "verified"
- status = "done"
- outcome == "pass"
- timestamp_utc
- SHALL NOT skip it
- Manual mark-complete action MUST NOT be required
- verifier_result.outcome == "fail"
- status = "failed"
- 'ContractRef: ContractName:Plans/Progression_Gates.md#GATE-005, ContractName:Plans/evidence.schema.json'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-013 - Execution Unit Context Field Contract

```yaml
plan_unit_id: EP-013
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: The canonical dispatch/runtime packet carries execution_unit_context with authoritative run, node, attempt, lane, package, seam, worktree, execution role, account, operational identity, blocked sequence, and allowed action fields; stale persona names are compatibility inputs only.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: execution_unit_context_field_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0016
preserved_exact_tokens:
- execution_unit_context
- run_id
- node_id
- attempt_id
- lane_id
- package_id
- seam_id
- worktree_id
- execution_role
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- operational_identity
- blocked_sequence
- allowed_action_ids[]
- requested_persona_id
- effective_persona_id
- _persona_id
- /values
- assistant
- interviewer
- requirements_builder
- prd_builder
- package_overseer
- seam_overseer
- node_worker
- reviewer
- corroborator
- recovery_actor
- 'ContractRef: Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, Plans/Crosswalk.md#3.1 Runtime orchestration ownership'
negative_constraints: []
compatibility_only_notes:
- Stale local worker identity names and persona slots are compatibility inputs only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-014 - DispatchContext Required Projection

```yaml
plan_unit_id: EP-014
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: DispatchContext is the canonical projection over execution_unit_context and carries required run, node, attempt, lane, package, seam, worktree, execution role, account, operational identity, blocked sequence, and approval_scope_key fields.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: dispatchcontext_required_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- DispatchContext
- execution_unit_context
- approval_scope_key
- requested_account_policy
- effective_account_id
- operational_identity
- blocked_sequence
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-015 - Execution Packet Joins And Blocked Carrythrough

```yaml
plan_unit_id: EP-015
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Dispatch, recovery, remediation, and inspection read one execution-unit packet; downstream consumers join losslessly to attempt, worktree, permission, and runtime records while blocked-action carrythrough stays anchored to blocked-episode lineage.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: execution_packet_joins_and_blocked_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- dispatch, recovery, remediation, and inspection
- one execution-unit packet
- attempt
- worktree
- permission
- runtime records
- blocked-action carrythrough
- blocked-episode lineage
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-016 - Assistant Chat Worktree And Safe-Point Handoff

```yaml
plan_unit_id: EP-016
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Assistant Chat freezes worktree_id and working_directory from thread_state worktree binding at turn start, sends working directory through FileSafe/tools/MCP/provider contexts, and records worktree-bound safe point fields before mutation-capable execution.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: assistant_chat_worktree_and_safe_point_handoff
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- thread_state:{thread_id}:worktree_binding
- worktree_id
- working_directory
- turn-start
- FileSafe
- tool invocation cwd
- MCP tools
- '@file'
- provider CLI
- DAE execution-context payloads
- worktree_path
- branch_name
- HEAD_sha
- git rev-parse HEAD
- /safe-point/runtime
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-017 - Worktree Lifecycle And Projection Boundary

```yaml
plan_unit_id: EP-017
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Worktree lifecycle actions recover, archive, prune, and remove have explicit meanings; projections must preserve historical lineage and cannot assume one active-worktree or current-worktree scalar.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: worktree_lifecycle_and_projection_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- recover
- archive
- prune
- remove
- /orphaned/conflicted
- /metadata/lineage
- /orphaned/live-no-longer-needed
- historical/retired/removed
- /retired/removed
- one active-worktree
- current-worktree scalar
- File tree surfaces
- artifact roots
- /worktree
- active package-lane worktree sets
negative_constraints:
- Worktree-aware projections must not assume one active-worktree or current-worktree scalar.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-018 - Artifact, Wizard Builder CUP Handoff, And Producer Boundary

```yaml
plan_unit_id: EP-018
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime artifacts, tool drills, wizard/builder/settings/GUI/CUP pre-run handoffs, interview handoffs, and provider execution payloads carry attempt identity plus requested/effective identity through execution_unit_context; mixed settings/GUI handoff wording remains intact until a later owner split is proven safe.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: artifact_wizard_builder_cup_handoff_and_producer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- artifact_id
- /receipt-based
- tool_name
- invocation_summary
- usage_event_ref
- Wizard
- Builder
- settings/GUI
- CUP
- requested/effective account identity
- /account/role
- /model
- provider/model/persona policy
- /governance
- /isolation
- /package/seam
- /interview
- execution_unit_context
- decomposition_context
- selection_context
negative_constraints: []
compatibility_only_notes:
- Compatibility adapters may derive decomposition_context or selection_context only as optional disclosure or planning views.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-019 - Operational Queue, Progress, Seams, Source Control, And Routes

```yaml
plan_unit_id: EP-019
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Operational projections expose queue/thread views, Progress and Seams navigation, Source Control worktree-first routing, route payload object context, and route-target normalization without collapsing route payloads into filter/subview-shaped surface noise.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: operational_queue_progress_seams_source_control_and_routes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- /queue
- thread-routing views
- Progress
- /Seams
- Feature Seams
- Work Packages
- /problem
- /completion/integration
- Source Control
- worktree_id
- base_branch
- focused_run_id
- /object
- object_kind = worktree
- /seam/package/concern/promotion
- resume_url
- route-target
- /help
- runtime-identity routes
- filter
- /subview
negative_constraints:
- Route payloads must not absorb filter or /subview noise and become surface-shaped again.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-020 - Overseer Worker Naming And Removed-Worktree Revert Error

```yaml
plan_unit_id: EP-020
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime worker copy prefers overseer-spawned node worker while retaining Overseer where protocol title and legacy role framing require it; removed-worktree revert reports the fixed missing-path error without recreating directories.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: overseer_worker_naming_and_removed_worktree_revert_error
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- Overseer
- overseer-spawned node worker
- delegated worker
- cmd.chat.revert
- /project/.puppet-master/worktrees/thread-abc/src/main.rs
- src/main.rs
- 'Cannot restore file: original path no longer exists. The worktree may have been removed.'
negative_constraints: []
compatibility_only_notes:
- delegated worker is a vague compatibility label, not the canonical execution actor name.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-021 - Deterministic Overseer Dispatch Loop

```yaml
plan_unit_id: EP-021
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: The baseline deterministic loop evaluates readiness over queued nodes, selects the smallest lexical node_id, dispatches Builder then Verifier, applies auto-marking, and repeats; later scheduler addendum rules supersede this wording where they conflict.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: deterministic_overseer_dispatch_loop
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0018
preserved_exact_tokens:
- Evaluate readiness predicate
- smallest lexical `node_id`
- Dispatch Builder
- verify_pending
- dispatch Verifier
- verified
- done
- failed
- deterministic ordering
- PolicyRule:Decision_Policy.md§2
- PolicyRule:Decision_Policy.md§3
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime Scheduler Addendum supersedes earlier lexical-dispatch wording where it conflicts.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-022 - Run Completion Document Packaging Gate

```yaml
plan_unit_id: EP-022
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Before run finalization, Executor enforces Document Packaging Policy for triggered Markdown/text artifacts under .puppet-master/**, and failed reconstruction, line accounting, idempotency, index-manifest, or clean-room audits block completion.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: run_completion_document_packaging_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0019
preserved_exact_tokens:
- Plans/Document_Packaging_Policy.md
- .puppet-master/**
- A run MUST NOT be marked complete
- reconstruction/line accounting/idempotency
- index-manifest match
- clean-room determinism
- Repo-local verifier coverage
- generated-artifact validator coverage
- ContractName:Plans/Progression_Gates.md#GATE-014
negative_constraints:
- A run must not be marked complete when any required Document Set audit fails.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-023 - Runtime Scheduler Addendum Supersession

```yaml
plan_unit_id: EP-023
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: The Runtime Scheduler Addendum dated 2026-03-08 supersedes earlier lexical-dispatch wording wherever conflicts exist.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_scheduler_addendum_supersession
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0020
preserved_exact_tokens:
- Runtime Scheduler Addendum (2026-03-08)
- supersedes any earlier lexical-dispatch wording wherever they conflict
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-024 - Canonical Scheduler Pass

```yaml
plan_unit_id: EP-024
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Each scheduler pass rebuilds or refreshes candidates, recomputes readiness, blocked, backoff, and capacity state, builds and scores the ready set, emits queue-analysis observability, and dispatches selected nodes.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_scheduler_pass
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0021
preserved_exact_tokens:
- Rebuild or refresh the candidate node set
- Recompute readiness
- Recompute blocked/backoff/capacity state
- Build the ready set
- Score ready nodes
- Emit queue-analysis observability
- Dispatch selected nodes
- ContractName:Plans/orchestrator-subagent-integration.md
- ContractName:Plans/Contracts_V0.md
- ContractName:Plans/storage-plan.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-025 - Scheduler Readiness Rules Under Addendum

```yaml
plan_unit_id: EP-025
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Under the scheduler addendum, ready nodes must be schedulable, dependency-satisfied, graph-integrity-clean, not in backoff or blocked on listed conditions, valid for active replan_generation, and allowed by lane/pool capacity.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: scheduler_readiness_rules_under_addendum
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0022
preserved_exact_tokens:
- queued
- reopened
- dependency-satisfying
- graph-integrity error
- active backoff
- HITL
- clarification
- external side-effect confirmation
- permission denial
- FileSafe
- auth refresh
- replan-required
- replan_generation
- runtime capacity
- Invalid blocker IDs
- ContractName:Plans/Progression_Gates.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-026 - Deterministic Score Tuple And Queue Analysis

```yaml
plan_unit_id: EP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Ready-node selection uses scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, and node_id, with explicit normalization rules, no critical-path weighting, and user-visible queue analysis tuple breakdown.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: deterministic_score_tuple_and_queue_analysis
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0023
preserved_exact_tokens:
- scheduler_lane
- manual_priority
- transitive_unblock_count
- ready_since_utc
- node_id
- remediation > unblocker > normal
- larger `manual_priority` wins
- larger `transitive_unblock_count` wins
- older `ready_since_utc` wins
- lexicographically smaller `node_id`
- no critical-path weighting term
- queue analysis MUST expose the tuple breakdown
- ContractName:Plans/Run_Graph_View.md
- ContractName:Plans/Orchestrator_Page.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-027 - Capacity-Aware Parallel Dispatch

```yaml
plan_unit_id: EP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Executor selects up to available_slots nodes per scheduler pass, derived from run, phase/task/subtask, resource/provider, and remediation lane constraints, with selection global across the ready set rather than level-by-level lexical dispatch.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: capacity_aware_parallel_dispatch
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0024
preserved_exact_tokens:
- available_slots
- run-level concurrency limit
- phase/task/subtask concurrency constraints
- resource / provider saturation limits
- remediation lane reservations
- global across the ready set
- not level-by-level lexical dispatch
- ContractName:Plans/storage-plan.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-028 - Wake Trigger Forward Reference Boundary

```yaml
plan_unit_id: EP-028
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Wake-trigger values and coalescing behavior are owned by the later Wake reasons and coalescing section; this span is only a forward-reference boundary.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: wake_trigger_forward_reference_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0025
preserved_exact_tokens:
- Wakeup triggers
- Wake reasons and coalescing
- forward-reference only
- single owner section
- ContractName:Plans/FinalGUISpec.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- No wake-trigger values are redefined in this forward-reference span.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-029 - Blocked-To-Runnable Cascade And Prerequisite Event

```yaml
plan_unit_id: EP-029
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: When a dependency completes or a blocking condition clears, direct dependents reevaluate immediately and can enter the ready set in the same wake cycle; node.prerequisite_resolved carries source, resolved prerequisite, targets, resolution, and wake behavior.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_to_runnable_cascade_and_prerequisite_event
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0026
preserved_exact_tokens:
- direct dependents are reevaluated immediately
- same scheduler wake cycle
- unrelated blocked or waiting nodes MUST NOT stall runnable work
- node.prerequisite_resolved
- source_node_id
- resolved_prerequisite_id
- target_node_ids[]
- completed
- skipped
- force_resolved
- blocked
- pending
- ready-eligible queue state
negative_constraints:
- Unrelated blocked or waiting nodes must not stall runnable work elsewhere in the graph.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-030 - Failure Class And Blocked-Episode Classification Boundary

```yaml
plan_unit_id: EP-030
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Every failed or non-executed attempt classifies into one canonical failure class or blocked-episode cause before choosing retry, backoff, remediation, safe-point restore, or escalation.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: failure_class_and_blocked_episode_classification_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0027
preserved_exact_tokens:
- failed or non-executed attempt
- canonical failure class
- blocked-episode cause
- transient provider faults
- auth expiry
- quota pressure
- verification failure
- reviewer findings
- storage I/O
- graph-integrity failure
- permission-denied
- user-declined
- headless approval denial
- FileSafe block
- external-side-effect block
- replan-needed
- retry
- backoff
- remediation
- safe-point restore
- escalation
negative_constraints:
- No consumer may revive legacy approval arrays, opaque recovery option lists, or tier-era compatibility nouns.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-031 - Search FileManager And SSH Handoff Classification

```yaml
plan_unit_id: EP-031
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Search side-panel and SSH-backed file-operation handoffs consume Search/FileManager/Tools route and classification ownership, mapping network, trust, permission, and not-found failures without inventing executor-only file failure classes.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: search_filemanager_and_ssh_handoff_classification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0027
preserved_exact_tokens:
- Search-in-files
- Search side panel
- cmd.search.find_in_files
- cmd.search.open_result
- SSH-backed file-operation handoffs
- FileManager/Tools classification
- network_blocked_by_policy
- host_unreachable
- host_untrusted
- permission_denied
- path_not_found
negative_constraints:
- Do not invent executor-only file failure classes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-032 - Classified Outcome Matrix And Per-Class Retry Rules

```yaml
plan_unit_id: EP-032
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: The classified outcome matrix preserves classifier families, max retries, backoff, auto-retry posture, per-class retry rules, distinct rate_limited handling, and generic retry prohibition.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: classified_outcome_matrix_and_per_class_retry_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0028
preserved_exact_tokens:
- classifier_family
- failure_class
- blocked_reason_code
- provider_transient
- rate_limited
- Retry-After
- structured_output_invalid
- verification_failed
- reviewer_findings
- auth_expired
- permission_denied
- user_declined
- headless_ask_denied
- filesafe_blocked
- external_side_effect_blocked
- storage_io
- quota_exceeded
- graph_integrity
- replan_required
- 1s / 2s / 4s
- 1s -> 2s -> 4s
- per-class
- generic retry without prior classification is prohibited
- ContractName:Plans/CLI_Bridged_Providers.md
negative_constraints:
- Generic retry without prior classification is prohibited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-033 - Doom-Loop Guard

```yaml
plan_unit_id: EP-033
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: If the same tool_name, serialized_args_hash, and error_message triple is observed twice consecutively at the same nesting level, Executor emits stop.identical_failure and terminates the run immediately.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: doom_loop_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0029
preserved_exact_tokens:
- tool_name
- serialized_args_hash
- error_message
- twice consecutively
- same nesting level
- stop.identical_failure
- terminate the run immediately
- ContractName:Plans/Run_Modes.md
- ContractName:Plans/Contracts_V0.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-034 - Classification Lifecycle Consumer Boundary

```yaml
plan_unit_id: EP-034
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Executor classification/lifecycle projection consumes Run Modes, Tools, storage, usage, and provider-facade owner contracts without redefining them locally.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: classification_lifecycle_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- '### 7.1 Classified outcome matrix'
- '### 7.2 Doom-loop guard'
- '### 7.3 Signal handling and process lifecycle'
- '### Blocked and retry behavior'
- /classification/lifecycle
- Run Modes
- Tools
- storage
- usage
- provider-facade
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/WorktreeGitImprovement.md'
negative_constraints:
- Executor classification/lifecycle projection must not redefine owner contracts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-035 - Provider Retry Evidence And Doom-Loop Aliases

```yaml
plan_unit_id: EP-035
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Provider-transient retry evidence preserves 1s -> 2s -> 4s, /2s/4s compatibility shorthand, per-error retry counters after classification, and kill.identical_failure with stop.identical_failure as compatibility alias.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: provider_retry_evidence_and_doom_loop_aliases
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- 1s -> 2s -> 4s
- /2s/4s
- per-error
- tool_name
- args_hash
- error_message
- serialized_args_hash
- kill.identical_failure
- stop.identical_failure
negative_constraints: []
compatibility_only_notes:
- stop.identical_failure is retained only as an older compatibility alias.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-036 - Retry Follow-Up Paths

```yaml
plan_unit_id: EP-036
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Retry may dispatch another overseer-spawned node worker, enter remediation, request review or corroboration, open graph patch/replan, or restore through safe-point logic when explicit handoff artifacts preserve the fresh-worker retry value.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: retry_follow_up_paths
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- fresh-worker retry
- explicit handoff artifacts
- overseer-spawned node worker
- remediation
- /corroboration
- graph patch/replan
- safe-point logic
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-037 - Degraded ListTools Discovery

```yaml
plan_unit_id: EP-037
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'MCP listTools discovery is degraded rather than unavailable: retry three times with 1s backoff, then use the last-known stale tool list until five-minute periodic refresh succeeds, without permanent-killing executor/provider/run.'
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: degraded_listtools_discovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- listTools
- degraded, not unavailable
- retry three times
- 1s backoff
- last-known stale tool list
- five-minute periodic refresh
- never permanent-kill
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Failed discovery uses a last-known stale tool list until periodic refresh succeeds.
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-038 - Bridged Provider Preflight Resume Circuit Breaker

```yaml
plan_unit_id: EP-038
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Bridged-provider execution consumes CLI_Bridged_Providers facade and guard rails, completes parsing/sanitization/payload-preflight before classification, and handles stream disconnects with resume, bounded reconnects, and open/half-open/close circuit breaker.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: bridged_provider_preflight_resume_circuit_breaker
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- '### Contract shape (facade)'
- '### Provider guard rails'
- Plans/CLI_Bridged_Providers.md
- /CLI_Bridged_Providers.md
- /parsing/sanitization/payload-preflight
- /resume
- three reconnect attempts
- circuit breaker
- open
- half-open
- close
- /reopen
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-039 - Storage Usage Budget Receipts

```yaml
plan_unit_id: EP-039
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Executor storage and usage alignment consumes storage-plan and usage-feature owner sections; receipts carry checkpoint-marker, run.completed.usage, bounded usage.jsonl compatibility retirement, lock-path/FileSafe/worktree path alignment, and budget-exceeded split.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: storage_usage_budget_receipts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- '### 2.4 Projector pipeline'
- '## 3. Implementation checklist'
- '### 8.3 Startup and shutdown'
- '### Canonical usage pipeline'
- checkpoint-marker
- run.completed.usage
- usage.jsonl
- lock-path
- FileSafe
- kill.budget_exceeded
- done.budget_exceeded
negative_constraints: []
compatibility_only_notes:
- bounded usage.jsonl compatibility retirement path remains explicit.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-040 - Regex Index FSM And Build Slots

```yaml
plan_unit_id: EP-040
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Regex-index build lifecycle is executor-observable, uses per-project build slots, supports superseded build cancellation and cleanup, and prevents concurrent writes while sharing multi-project thread pool capacity.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: regex_index_fsm_and_build_slots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- no_index
- building_full
- ready
- rebuilding_incremental
- error
- CancellationToken
- clean partial generation directories
- thread pool
- FIFO order
- per-project build slots
- prevent concurrent writes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-041 - Helper Background Usage And Context Handoff

```yaml
plan_unit_id: EP-041
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Helper/background attempts remain first-class usage contributors, and prompt/context handoff preserves implementation-grade context continuation, giant-instruction handling, budget visibility, and compatibility-shim retirement.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: helper_background_usage_and_context_handoff
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- /helper/background
- execution receipt
- projected usage record
- /context
- giant-instruction-file
- budget-visibility
- compatibility-shim retirement
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-042 - Idempotent Shutdown

```yaml
plan_unit_id: EP-042
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'Lifecycle shutdown consumers treat shutdown as idempotent: double shutdown is guarded by a Once/idempotent root and becomes a safe no-op rather than a second destructive lifecycle transition.'
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: idempotent_shutdown
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- /idempotent
- double shutdown
- Once/idempotent root
- safe no-op
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-043 - Signal Fanout And Subprocess Lifecycle

```yaml
plan_unit_id: EP-043
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: PM entrypoints establish a canonical signal.NotifyContext or equivalent once-owned fan-out before subprocess start; provider, MCP, and LSP subprocesses receive bounded graceful termination, SIGHUP reloads config, and managed subprocesses run in isolated process groups.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: signal_fanout_and_subprocess_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0031
preserved_exact_tokens:
- signal.NotifyContext
- once-owned signal fan-out
- SIGTERM
- SIGINT
- 5-second grace window
- 3-second grace window
- SIGHUP
- isolated process groups
- ContractName:Plans/Architecture_Invariants.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-044 - Worktree Snapshot Safe-Point Payload

```yaml
plan_unit_id: EP-044
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Worktree safe-point payloads include worktree_id, worktree_path, worktree_branch, HEAD_sha, worktree_dirty and use redb projection from seglog events as canonical binding source for remediation/resume context.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: worktree_snapshot_safe_point_payload
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0033
preserved_exact_tokens:
- worktree_id
- worktree_path
- worktree_branch
- HEAD_sha
- git rev-parse HEAD
- worktree_dirty
- redb projection
- seglog events
- ContractName:Plans/assistant-chat-design.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-045 - Pre-Mutation Safe-Point Anchor And Restore Boundary

```yaml
plan_unit_id: EP-045
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Before mutation-capable attempts, Executor creates or attaches runtime safe points with required IDs, execution root, baseline refs, and replan_generation; safe points are recovery anchors and not user-facing restore points.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: pre_mutation_safe_point_anchor_and_restore_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0032
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0033
preserved_exact_tokens:
- safe_point_id
- run_id
- node_id
- attempt_id
- worktree_path
- worktree_id
- branch_name
- HEAD_sha
- pre-attempt artifact/workspace baseline
- replan_generation
- runtime recovery anchors
- not user-facing restore points
negative_constraints:
- Safe points must not be conflated with thread rewind/rollback semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-046 - Remediation Child Lineage

```yaml
plan_unit_id: EP-046
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Automatic fix cycles create remediation child lineage attached to the failed attempt, preserve remediation IDs/generation/finding IDs/final resolution state, and create canonical graph nodes only when replan changes scope.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: remediation_child_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0034
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0044
preserved_exact_tokens:
- remediation_root_id
- remediation_parent_attempt_id
- generation
- remediation_generation
- origin_failure_event_id
- finding IDs
- issue IDs
- final resolution state
- A canonical graph node is created only when the remediation requires a replan that changes scope.
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-047 - Draft Versus Canonical Degradation Boundary

```yaml
plan_unit_id: EP-047
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'Executor distinguishes draft decomposition from canonical graph execution: draft may degrade to flat sequencing with warning evidence, but invalid canonical graphs after lock are graph_integrity failures that must not silently flatten or degrade.'
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: draft_versus_canonical_degradation_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0035
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0045
preserved_exact_tokens:
- draft decomposition / pre-canonical planning
- canonical graph execution
- deterministic flat sequencing
- warning evidence
- graph_integrity
- MUST NOT silently flatten
- Invalid canonical graphs after graph lock
negative_constraints:
- Canonical graph execution must not silently flatten or otherwise degrade invalid canonical graphs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-048 - Text-Only Is Not Rich Surface Fallback

```yaml
plan_unit_id: EP-048
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: text-only projection is not a fallback for required rich execution surfaces; required artifacts, tool outputs, and browser/web surfaces must not silently degrade to text-only output.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: text_only_is_not_rich_surface_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0035
preserved_exact_tokens:
- text-only
- required rich execution surfaces
- required artifacts
- tool outputs
- browser/web surfaces
negative_constraints:
- Executor must not silently degrade required rich surfaces to text-only output.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-049 - Auto-Use Draft Plan Panel Review

```yaml
plan_unit_id: EP-049
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: When auto-use fires before canonical execution, on-trigger behavior creates or refreshes a draft plan, surfaces the sticky Plan panel, and keeps it user-dismissible and reviewable before execution observes revised TODO projection.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: auto_use_draft_plan_panel_review
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0035
preserved_exact_tokens:
- auto-use
- draft
- sticky Plan panel
- user-dismissible
- reviewable
- TODO projection
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-050 - Deterministic Runtime Recovery Scheduler Pass

```yaml
plan_unit_id: EP-050
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime recovery scheduler pass refreshes candidate runtime state for active replan_generation, recomputes readiness/blocked/backoff/lane/score terms, selects up to capacity, emits queue-analysis, and dispatches attempts.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: deterministic_runtime_recovery_scheduler_pass
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0038
preserved_exact_tokens:
- Runtime Scheduler / Recovery Canonical Alignment (2026-03-09)
- replan_generation
- recompute readiness
- blocked state
- backoff state
- lane and score terms
- available capacity
- queue-analysis state
- dispatch selected attempts
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-051 - Recovery Readiness Predicate

```yaml
plan_unit_id: EP-051
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Recovery readiness requires all blockers satisfied, current generation, no blocked state, no backoff, and lane capacity; permission denial, FileSafe, auth refresh, confirmation, and replan-required states are non-ready.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: recovery_readiness_predicate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0039
preserved_exact_tokens:
- Readiness contract
- all blockers are satisfied
- generation is current
- not blocked
- not in backoff
- capacity rules
- permission denial
- FileSafe
- auth refresh
- user confirmation
- replan-required
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-052 - Scheduler Score Tuple And MVP Terms

```yaml
plan_unit_id: EP-052
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Scheduler score tuple uses scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, and node_id with remediation/unblocker/normal ordering, no critical-path MVP term, explicit defaults, and invalid/cyclic exclusion.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: scheduler_score_tuple_and_mvp_terms
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0040
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0049
preserved_exact_tokens:
- scheduler_lane
- manual_priority
- transitive_unblock_count
- ready_since_utc
- node_id
- remediation > unblocker > normal
- No critical-path term
- 0..100
- default `50`
- invalid/cyclic relationships are excluded
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-053 - Wake Trigger Forward Reference

```yaml
plan_unit_id: EP-053
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime recovery wakeup triggers refer to the later Wake reasons and coalescing owner section for wake_reason values and watchdog-only polling rule.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: wake_trigger_forward_reference
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0041
preserved_exact_tokens:
- Wake reasons and coalescing
- wake_reason
- watchdog-only polling rule
- ContractName:Plans/Orchestrator_Page.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- No wake-trigger values are redefined in this forward-reference span.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-054 - Multi-Surface Execution Unit Context

```yaml
plan_unit_id: EP-054
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Rich editor-agent, workbench, terminal, browser, document, artifact, plugin-first, command-first, rules/skills, persisted tabs, splits/windows, and history/navigation surfaces dispatch through execution_unit_context and preserve attempt identity, safe points, worktree binding, diff/review visibility, and autonomy defaults.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: multi_surface_execution_unit_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- /editor-agent
- /workbench
- terminal
- browser
- document
- artifact
- /plugin-first
- command-first
- /rules/skills
- /persisted
- /splits/windows
- /history/navigation
- execution_unit_context
- attempt identity
- safe points
- worktree binding
- diff/review visibility
- user-visible autonomy defaults
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-055 - Browser Debug Pause Resume

```yaml
plan_unit_id: EP-055
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Browser-driven debug handoff uses explicit pause and resume inside isolated automation; auth/manual-repro boundaries degrade to attention_required, while richer co-piloting remains future expansion.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: browser_debug_pause_resume
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- Browser-driven debug handoff
- /resume
- isolated automation session
- /manual-repro
- attention_required
- co-piloting
- collaborative browser steering
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-056 - PM Native Context Summarization

```yaml
plan_unit_id: EP-056
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime context summarization stays PM-native, treats provider _context_updates only as a reference, preserves tcN handles, and replaces stale full tool results with audited summaries without a separate extra LLM call.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: pm_native_context_summarization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- PM-native
- _context_updates
- incremental tool-result compression
- context-detail
- compaction updates
- tcN
- audited summaries
- without a separate extra LLM call
- must not be re-compressed
negative_constraints:
- Executor must not transplant a provider _context_updates protocol as-is.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-057 - Runtime UI Action Families

```yaml
plan_unit_id: EP-057
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: UI checkpoint, approve/deny, retry, and seam/lane/promotion/resolution-thread actions are runtime action families keyed by blocked_sequence and allowed_action_ids, not graph-local commands or single-current-task state.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_ui_action_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- UI `/checkpoint`
- /approve/deny
- retry
- /seam/lane/promotion/resolution-thread
- blocked_sequence
- allowed_action_ids[]
- graph-local commands
- single-current-task state
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-058 - Managed Instruction Projection Compatibility

```yaml
plan_unit_id: EP-058
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Cursor-native managed instructions target .cursor/rules/*.mdc and .cursor/rules; .cursorrules is legacy compatibility only, and AGENTS.md/CLAUDE.md/root/provider copies are optional target projections that cannot be sole readiness evidence.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: managed_instruction_projection_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- .cursor/rules/*.mdc
- .cursor/rules
- .cursorrules
- AGENTS.md
- CLAUDE.md
- provider-native projected copies
- readiness must never depend solely on projected copies
negative_constraints:
- Readiness must never depend solely on projected copies.
compatibility_only_notes:
- .cursorrules is legacy compatibility only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-059 - PM Outdated Launch Reprojection

```yaml
plan_unit_id: EP-059
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: At launch time, PM Outdated projection should auto-reproject before run launch when safe.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: pm_outdated_launch_reprojection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- PM Outdated
- auto-reproject
- run launch
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-060 - GUI Auth Copy And Direct Gemini Policy Boundary

```yaml
plan_unit_id: EP-060
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: GUI auth/setup copy exposes user-visible choices like Sign in with ChatGPT and Use API Key, while Direct-Gemini OAuth removal is PM app-policy and public-distribution compliance policy rather than evidence that Google OAuth protocol disappeared.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: gui_auth_copy_and_direct_gemini_policy_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- GUI auth/setup copy
- Sign in with ChatGPT
- Use API Key
- Direct-Gemini OAuth removal
- PM app-policy
- /compliance/public-distribution
- Google OAuth
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-061 - Non-Success Classification And Blocked Retry Rules

```yaml
plan_unit_id: EP-061
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Every non-success outcome is classified before policy; blocked episodes preserve local work/runtime identity/resume prerequisites, FileSafe and external side-effect blocks wait for owning actions, and one path cannot be both failure class and blocked-episode cause.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: non_success_classification_and_blocked_retry_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- classify every non-success outcome
- blocked episodes
- local work
- runtime identity
- resume prerequisites
- FileSafe
- external side-effect blocks
- one decision path must not treat the same situation as both a failure class and a blocked-episode cause
negative_constraints:
- One decision path must not treat the same situation as both a failure class and a blocked-episode cause.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-062 - Attempt Identity Safe-Point Precondition And Cleanup Posture

```yaml
plan_unit_id: EP-062
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Every dispatch creates or reuses attempt_id; mutation/remediation steps create safe_point_id before execution, and MVP cleanup uses canonical workspace or remote project binding with explicit mutation lineage rather than sandbox worktree jail semantics.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: attempt_identity_safe_point_precondition_and_cleanup_posture
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0043
preserved_exact_tokens:
- attempt_id
- safe_point_id
- runtime recovery anchors only
- not restore points
- canonical workspace
- /remote
- temporary-vs-durable mutation lineage
- sandbox worktree `/jail`
negative_constraints:
- MVP cleanup must not require sandbox worktree jail semantics for ordinary debug instrumentation cleanup.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-063 - Scheduler Readiness Reconciliation

```yaml
plan_unit_id: EP-063
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Canonical runtime scheduler readiness requires ready-eligible lifecycle, existing canonical blockers, dependency-satisfying blockers, no active backoff/block projection, matching replan_generation, no worktree conflict, and lane/pool capacity.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: scheduler_readiness_reconciliation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0047
preserved_exact_tokens:
- ready-eligible
- existing canonical node
- dependency-satisfying state
- active backoff
- active runtime projection
- replan_generation
- worktree/conflict rule
- lane/pool capacity
- graph_integrity
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-064 - Node Lifecycle Versus Runtime Overlays

```yaml
plan_unit_id: EP-064
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Node lifecycle remains graph-progress contract while runtime overlays include blocked, backoff, retrying, remediation, and waiting-approval; overlays do not replace lifecycle values and waiting_approval is represented through runtime records.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: node_lifecycle_versus_runtime_overlays
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0048
preserved_exact_tokens:
- Node lifecycle
- graph-progress contract
- blocked
- backoff
- retrying
- remediation
- waiting-approval
- overlays do not replace
- blocked/runtime records
- safe-point
- remediation state
- ContractName:Plans/human-in-the-loop.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-065 - Capacity-Aware Dispatch Cycle

```yaml
plan_unit_id: EP-065
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Each scheduler wake refreshes runtime state, recomputes readiness and score terms, reevaluates direct dependents, builds global ready set, emits queue-analysis keyed by scheduler_pass_id, selects up to available_slots, and dispatches attempts.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: capacity_aware_dispatch_cycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0050
preserved_exact_tokens:
- scheduler wake
- scheduler_pass_id
- global ready set
- available_slots
- canonical score order
- dispatch selected attempts
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-066 - Blocked-To-Runnable Same-Wake Cascade

```yaml
plan_unit_id: EP-066
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: When dependency or blocking condition clears, direct dependents reevaluate synchronously in the same wake cycle and newly ready nodes enter the ready set before dispatch completes without an extra scheduler pass.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_to_runnable_same_wake_cascade
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0051
preserved_exact_tokens:
- same wake cycle
- newly ready nodes
- same ready set
- no extra scheduler pass
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-067 - Class-Driven Pre-Dispatch Blocker Rules

```yaml
plan_unit_id: EP-067
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Provider/model selection, worktree availability, and prerequisite readiness resolve before dispatch; dirty-baseline, merge-conflict, approval, auth, or validation blockers surface through the canonical blocked-episode contract.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: class_driven_pre_dispatch_blocker_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0052
preserved_exact_tokens:
- provider/model selection
- worktree availability
- prerequisite readiness
- dirty-baseline
- merge-conflict
- approval
- auth
- validation blockers
- blocked-episode contract
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-068 - HTE DAE Graph-Lock Write-Scope Safety

```yaml
plan_unit_id: EP-068
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: HTE and DAE execution paths share graph-lock and write-scope safety, surfacing generation staleness, degradation, cleanup-remediation loops, FileSafe bypass, side-effect uncertainty, safe-point/restore conflicts, and projection trust failures as blocked/degraded/remediation classes.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: hte_dae_graph_lock_write_scope_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0052
preserved_exact_tokens:
- HTE
- DAE
- graph-lock
- write-scope safety
- /generation
- /degradation
- FileSafe bypass
- side-effect
- remote side-effect
- safe-point/restore-point conflicts
- projection trust failures
- blocked/degraded/remediation classes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-069 - Blocked Projection Family And Startup Recovery Continuity

```yaml
plan_unit_id: EP-069
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: node-blocked, wizard-blocked, and thread-blocked projections keep family-local fields separate; Executor mints and reuses blocked_sequence across HITL/auth/storage/recovery updates and startup recovery must not lose or remint existing blocked episodes.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_projection_family_and_startup_recovery_continuity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0052
preserved_exact_tokens:
- node-blocked
- wizard-blocked
- thread-blocked
- blocked_sequence
- attempt_id
- failure_class
- clarification `/report`
- /persisted
- HITL
- auth
- /storage
- startup_recovered
- startup-recovery handshakes
- request_id
negative_constraints:
- Recovery must not cause silent block-loss or accidental episode reminting.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-070 - Diagnostic Attempt Continuity

```yaml
plan_unit_id: EP-070
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Reserved diagnostic schemas for execution, audit, handoff, and HITL events carry attempt_id and preserve attempt continuity as an architecture invariant.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: diagnostic_attempt_continuity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0052
preserved_exact_tokens:
- Reserved diagnostic schemas
- execution
- audit
- handoff
- HITL events
- attempt_id
- architecture invariant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-071 - Graph-Lock Dispatch Stop Boundary

```yaml
plan_unit_id: EP-071
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Draft decomposition fallback is allowed only before run.graph_canonical_locked; after graph lock, graph_integrity structure errors stop new dispatches and no silent flattening or degraded canonical execution is allowed.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: graph_lock_dispatch_stop_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0053
preserved_exact_tokens:
- run.graph_canonical_locked
- graph_integrity
- stop accepting new dispatches
- no silent flattening
- degraded canonical execution
- ContractName:Plans/Progression_Gates.md
negative_constraints:
- After graph lock, execution must stop accepting new dispatches for invalid canonical graph structure.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-072 - Retry Resume Restored Rerun Attempt Identity

```yaml
plan_unit_id: EP-072
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Every retry, resume-after-prerequisite, or safe-point-restored rerun creates a new attempt_id; prior attempts remain immutable, and post-lock execution must preserve runtime identity plus corroboration/promotion/runtime context.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: retry_resume_restored_rerun_attempt_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0054
preserved_exact_tokens:
- retry
- resume-after-prerequisite
- safe-point-restored rerun
- new `attempt_id`
- Prior attempts remain immutable historical records
- identity-blind
- single-branch
- /corroboration/promotion/runtime
negative_constraints:
- After graph lock, execution must not fall back to identity-blind planning-artifact-centric execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-073 - Canonical Runtime Scope Context

```yaml
plan_unit_id: EP-073
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: execution_unit_context is the canonical runtime-facing context object and execution_unit_context plus execution_unit_type define authoritative runtime scope, replacing retired tier-era context as live runtime contract.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_runtime_scope_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0055
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0056
preserved_exact_tokens:
- Unified Runtime Scheduler and Attempt Lifecycle Canonical Alignment
- execution_unit_context
- canonical runtime-facing context object
- execution_unit_type
- authoritative runtime scope
- retired tier-era context object
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-074 - Shared Context For Worker Recovery Coordination UI Inspection

```yaml
plan_unit_id: EP-074
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Worker spawn, recovery, remediation, coordination services, scheduler joins, and UI inspection surfaces read one shared execution_unit_context so restart, approval, blocked-episode continuity, and audit views resolve the same runtime unit.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: shared_context_for_worker_recovery_coordination_ui_inspection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0056
preserved_exact_tokens:
- Worker spawn
- recovery
- remediation
- coordination
- UI inspection surfaces
- restart
- approval
- blocked-episode continuity
- audit views
- same runtime unit
- 'ContractRef: Primitive:ExecutionContext'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-075 - Tier-Era Compatibility Adapter Retirement

```yaml
plan_unit_id: EP-075
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Compatibility adapters may derive retired tier-era context objects only for legacy selector translation or decomposition and must not persist, exchange, or rehydrate them as the live runtime contract.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: tier_era_compatibility_adapter_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0056
preserved_exact_tokens:
- Compatibility adapters
- legacy selector translation
- decomposition
- MUST NOT persist, exchange, or rehydrate
- live runtime contract
negative_constraints: []
compatibility_only_notes:
- Retired tier-era context object is a derived or compatibility-only selection/decomposition helper.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-076 - Blocked Sequence Identity And Restart Recovery

```yaml
plan_unit_id: EP-076
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: blocked_sequence is canonical per run_id/node_id blocked episode and unresolved blocked episodes restore on restart without reminting, with request_id retained only as subordinate compatibility lookup metadata.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_sequence_identity_and_restart_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0057
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0058
preserved_exact_tokens:
- blocked_sequence
- run_id/node_id
- blocked episode
- restart
- without reminting
- request_id
- subordinate compatibility handle
negative_constraints: []
compatibility_only_notes:
- request_id is lineage or lookup metadata rather than a competing approval target.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-077 - Approval Scope And Durable Approver Identity

```yaml
plan_unit_id: EP-077
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Blocked-episode approval scope is separate from session-wide policy scope, and approval/rejection events persist durable approver identity fields.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: approval_scope_and_durable_approver_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0058
preserved_exact_tokens:
- approval scope
- session-wide policy scope
- durable approver identity
- approval and rejection events
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-078 - Execution Role Account Usage Carry-Through

```yaml
plan_unit_id: EP-078
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Execution role, requested_account_id, operational_identity, account-switch and pressure ownership, startup recovery, DAE jail/approval policy, usage switch-history, and usage execution-role follow-through transfer through owner and consumer docs.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: execution_role_account_usage_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0058
preserved_exact_tokens:
- execution_role
- requested_account_id
- operational_identity
- account-switch
- pressure ownership
- DAE jail/approval policy
- usage switch-history
- usage execution-role follow-through
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-079 - Provider Model Precedence And Worktree Assignment

```yaml
plan_unit_id: EP-079
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Provider/model precedence is owned across run, seam, package, node, overseer, and delegated-subagent levels and ties to parallel-node worktree assignment and ownership transitions.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: provider_model_precedence_and_worktree_assignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0059
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0060
preserved_exact_tokens:
- provider/model precedence
- run
- seam
- package
- node
- overseer
- delegated-subagent
- parallel-node worktree assignment
- ownership transitions
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-080 - Promotion-Aware Provider Records And Legacy Taxonomy Retirement

```yaml
plan_unit_id: EP-080
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Provider and event records for dispatched work are promotion-aware, preserve requested/effective account resolution across delegation, and keep Phase/Task/Subtask/Iteration as legacy taxonomy rather than canonical runtime ownership.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: promotion_aware_provider_records_and_legacy_taxonomy_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0060
preserved_exact_tokens:
- promotion-aware
- requested/effective account resolution
- package and seam overseer delegation
- Phase/Task/Subtask/Iteration
- legacy taxonomy
- canonical runtime ownership
negative_constraints: []
compatibility_only_notes:
- Phase/Task/Subtask/Iteration remains legacy taxonomy, not canonical runtime ownership.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-081 - Actor Resolver Inputs And Auto Receipt Basis

```yaml
plan_unit_id: EP-081
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Actor resolver inputs include actor type, overseer/worker/reviewer/corroborator/recovery/graph patch roles, operation type, scope, language/framework/domain, and GUI/backend/infra hints; auto resolution records actor-type basis.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: actor_resolver_inputs_and_auto_receipt_basis
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0060
preserved_exact_tokens:
- actor type
- package overseer
- seam overseer
- node worker
- verifier
- /reviewer
- corroborator
- graph patch planner
- recovery actor
- operation type
- scope level
- language/framework
- repo `/domain`
- GUI, backend-heavy, or infra-heavy hints
- auto
- actor-type mapping
- receipt records
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GUI is used as routing hint here, not GUI implementation.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-082 - Run-Level Deferred Rule

```yaml
plan_unit_id: EP-082
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: If any node is runnable the run remains active; if no node is runnable and blocked, backoff, or prerequisite-waiting work exists, the run is deferred until prerequisite, restore, remediation, auth, or capacity wakeups.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: run_level_deferred_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0061
preserved_exact_tokens:
- runnable
- active
- deferred
- blocked
- backoff
- prerequisite-waiting
- prerequisite resolution
- restore completion
- remediation completion
- auth recovery
- capacity change
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-083 - Attempt Counter Invariant

```yaml
plan_unit_id: EP-083
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: attempt_count equals automatic_retry_count plus prerequisite_resume_count plus manual_resume_count plus remediation_retry_count plus one initial attempt, with sub-counters incrementing at attempt start and not inferred by subtraction.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: attempt_counter_invariant
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0062
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0063
preserved_exact_tokens:
- Counter Relationships and Event Ordering Addendum
- attempt_count
- automatic_retry_count
- prerequisite_resume_count
- manual_resume_count
- remediation_retry_count
- + 1 (initial attempt)
- increments at attempt start
- Independent policy counters MUST NOT be inferred
negative_constraints:
- Independent policy counters must not be inferred by subtracting from attempt_count.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-084 - Debug Verification Summary Recurrence Rule

```yaml
plan_unit_id: EP-084
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Debug-mode verification records verification_summary with adapter_kind, attempt_count, passed, heuristic_version, optional latest_receipt_ref, and notes, and passes only when the prior class/reason/signature does not recur and rerun reaches expected terminal state.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: debug_verification_summary_recurrence_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0063
preserved_exact_tokens:
- verification_summary
- adapter_kind
- attempt_count
- passed
- heuristic_version
- latest_receipt_ref
- notes[]
- failure_class
- blocked_reason_code
- tool error signature
- expected terminal state
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-085 - Event Ordering Dedupe And Wake Coalescing

```yaml
plan_unit_id: EP-085
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Events are per-node sequential, cross-node eventual, deduplicated by event_name/node_id/attempt_id/ts, and multiple wakeup triggers in one scheduler-pass window coalesce into one scheduler pass with first wake_reason recorded.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: event_ordering_dedupe_and_wake_coalescing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0064
preserved_exact_tokens:
- Per-node sequential
- Cross-node eventual
- Deduplication
- Wakeup coalescing
- event_name
- node_id
- attempt_id
- ts
- wake_reason
- first trigger
- ContractName:Plans/Wiring_Matrix.md
negative_constraints:
- The event bus must not reorder events within a single node stream.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-086 - Replan Generation Lifecycle And Stale Records

```yaml
plan_unit_id: EP-086
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: replan_generation is a per-run monotonic u32 starting at 0, increments exactly once per applied replan via run.graph_canonical_locked, marks prior attempts/safe points/blocked projections stale, and stale attempts remain auditable but never resumable.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: replan_generation_lifecycle_and_stale_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0065
preserved_exact_tokens:
- replan_generation
- u32
- '0'
- run.graph_canonical_locked
- structural change
- adding/removing/reordering nodes or edges
- stale
- queryable for audit
- never resumable
- no practical maximum value
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-087 - PM-Native Open With Worktree Handoff Boundary

```yaml
plan_unit_id: EP-087
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  PM-native Open With stays inside the file/editor surface and carries the
  same worktree handoff context as other executor file operations; later OS
  handoff must be a separate explicit command such as
  cmd.file.open_in_system_default.
gui_related: true
gui_classification_reason: This unit governs user-visible file/editor Open With behavior and its worktree handoff boundary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- PM-native target selection, blocked/recovery semantics, and worktree-scoped file identity remain preserved.
- OS system-default launching remains a separate explicit command and does not dilute PM-native executor/file identity semantics.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: pm_native_open_with_worktree_handoff_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- PM-native `Open With`
- file/editor surface
- cmd.file.open_in_system_default
- system-default launching
- PM-native target selection
- blocked/recovery semantics
- worktree-scoped file identity
negative_constraints:
- OS handoff must remain a separate explicit command and must not dilute PM-native executor/file identity semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Open With UI behavior consumes the same executor worktree handoff context rather than defining a separate launch context.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-088 - Worktree Execution Context Identity Fields

```yaml
plan_unit_id: EP-088
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Orchestrator and Assistant Chat execution units that run inside a worktree
  carry worktree identity through execution_unit_context fields including
  working_directory, worktree_id, worktree_branch, and is_worktree.
gui_related: false
gui_classification_reason: This unit defines runtime handoff identity fields, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- working_directory is set to the worktree root path, not the project root, when a worktree is bound.
- worktree_id, worktree_branch, and is_worktree remain explicit identity fields in the handoff context.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: worktree_execution_context_identity_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- execution context handoff includes worktree identity
- working_directory
- worktree root path (not project root)
- worktree_id
- worktree_branch
- is_worktree
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The handoff consumes Orchestrator, Run Modes, Assistant Chat, and storage contracts through explicit execution context fields.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-089 - Caller Worktree Handoff Responsibilities

```yaml
plan_unit_id: EP-089
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Orchestrator sets worktree execution fields when launching a DAE in a
  lane-owned worktree, Assistant Chat sets them for bound-thread agent-mode or
  plan-mode work, and execution defaults to the project root when is_worktree is
  false or absent.
gui_related: false
gui_classification_reason: This unit defines caller runtime responsibilities, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- Orchestrator launch of a DAE in a lane-owned worktree sets the handoff fields.
- Assistant Chat bound-thread agent-mode and plan-mode work set the handoff fields.
- Missing or false is_worktree falls back to project-root execution.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: caller_worktree_handoff_responsibilities
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- Caller responsibilities
- Orchestrator
- DAE
- lane-owned worktree
- Assistant Chat
- active thread has a bound worktree
- agent-mode
- plan-mode
- is_worktree
- project root
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Caller responsibilities define who populates runtime handoff fields before executor dispatch.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-090 - Assistant Chat Turn Worktree Freeze And CWD Propagation

```yaml
plan_unit_id: EP-090
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Assistant Chat turn-start resolves thread_state:{thread_id}:worktree_binding,
  freezes execution_unit_context.worktree_id and working_directory for that
  turn, applies mid-turn unbinds only to later turns or rotated follow-ups, and
  propagates the frozen cwd to FileSafe, tools, shell cwd, MCP, @file,
  auto-retrieval, provider CLI, and DAE execution-context payloads.
gui_related: false
gui_classification_reason: This unit defines backend/runtime turn context propagation, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- thread_state:{thread_id}:worktree_binding resolves at turn start.
- execution_unit_context.worktree_id and working_directory are frozen for the turn.
- Mid-turn unbind changes apply only to the next turn or rotated follow-up.
- The contract remains cwd-based and does not require prompt-only worktree injection.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: assistant_chat_turn_worktree_freeze_and_cwd_propagation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- thread_state:{thread_id}:worktree_binding
- execution_unit_context.worktree_id
- working_directory
- Mid-turn unbind changes
- next turn
- rotated follow-up
- FileSafe checks
- bash/shell `cwd`
- MCP tools
- '@file'
- auto-retrieval scope context
- provider CLI
- DAE execution-context JSON payloads
- cwd-based execution contract
negative_constraints:
- The cwd-based execution contract does not require separate prompt-only worktree injection.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Assistant Chat consumes thread worktree binding and passes a frozen cwd-oriented execution context to executor surfaces.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-091 - Executor Worktree Operation Resolution And Removed-Worktree Revert

```yaml
plan_unit_id: EP-091
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor worktree operations resolve files, git commands, terminals, and LSP
  root identity through working_directory, store absolute mutation paths, and
  report a non-recreating error when cmd.chat.revert targets an edit whose
  original worktree path no longer exists.
gui_related: false
gui_classification_reason: This unit defines executor file/git/terminal/LSP and revert behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- File operations resolve relative to working_directory.
- Git operations target the worktree, terminal sessions start in working_directory, and LSP root identity uses the worktree path when is_worktree is true.
- File mutation logs store absolute paths.
- A removed-worktree cmd.chat.revert reports the preserved error message and does not recreate missing directories.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: executor_worktree_operation_resolution_and_removed_worktree_revert
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- File operations resolve relative to `working_directory`
- Git operations target the worktree, not the main repo
- Terminal sessions start in `working_directory`
- LSP root identity uses worktree path when `is_worktree` is true
- File mutation logs store absolute paths
- cmd.chat.revert
- /project/.puppet-master/worktrees/thread-abc/src/main.rs
- 'Cannot restore file: original path no longer exists. The worktree may have been removed.'
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Commands_System.md'
negative_constraints:
- The executor does not recreate missing directories when a removed worktree makes the original path unavailable.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FileManager, LSPSupport, and Commands_System consume this executor worktree resolution behavior.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-092 - Execution Unit Context Required Fields And Labels

```yaml
plan_unit_id: EP-092
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Execution-unit context preserves required run, node, attempt, lane, package,
  seam, role, account, operational identity, blocked sequence, and approval
  scope fields plus the canonical labels execution unit context and blocked
  episode.
gui_related: false
gui_classification_reason: This unit defines runtime identity schema and labels, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- All required fields from the source span remain explicit.
- Canonical terms and values duplicate the required fields so consumers use the same runtime vocabulary.
- The labels execution unit context and blocked episode remain preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: execution_unit_context_required_fields_and_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- run_id
- node_id
- attempt_id
- lane_id
- package_id
- seam_id
- execution_role
- requested_account_id
- effective_account_id
- operational_identity
- blocked_sequence
- approval_scope_key
- execution unit context
- blocked episode
- 'ContractRef: Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Required identity fields align executor runtime scope with the canonical blocked-episode approval anchor.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-093 - Runtime Scope Blocked Episode And Permission Carry-Through

```yaml
plan_unit_id: EP-093
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Execution Protocol defines runtime scope through execution-unit context rather
  than tier roots, keeps blocked-episode identity explicit in recovery paths,
  and carries effective account, execution role, and blocked-episode approval
  scope through execution handoff.
gui_related: false
gui_classification_reason: This unit defines runtime scope, recovery identity, and permission handoff behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- Runtime scope is defined through execution-unit context rather than tier roots.
- Blocked-episode identity remains explicit in execution-relevant recovery paths.
- effective account, execution role, and blocked-episode approval scope survive execution handoff.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_scope_blocked_episode_and_permission_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- Behavioral rules
- runtime scope through execution-unit context rather than tier roots
- Blocked-episode identity
- Permission carry-through
- effective account
- execution role
- blocked-episode approval scope
negative_constraints:
- Runtime scope must not be derived from tier roots.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Permission carry-through binds execution handoff to blocked-episode recovery identity.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-094 - Assistant Chat Mode Worktree Behavior Matrix

```yaml
plan_unit_id: EP-094
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Ask, Agent, Plan, Deep Plan, and Debug modes operate within the thread's
  bound worktree, with reads, edits, plan execution, and debug operations
  routed to the worktree context according to mode behavior.
gui_related: false
gui_classification_reason: This unit defines Assistant Chat runtime mode routing, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- Ask mode reads context from worktree files.
- Agent mode writes file edits to the worktree.
- Plan and Deep Plan modes execute plans in worktree context.
- Debug mode targets the worktree for debug operations.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: assistant_chat_mode_worktree_behavior_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0067
preserved_exact_tokens:
- Ask
- Agent
- Plan
- Deep Plan
- Debug
- thread's worktree
- read-only context from worktree files
- file edits go to worktree
- plans execute in worktree context
- debug operations target worktree
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Run Modes and Assistant Chat consume this mode matrix through the thread worktree binding.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-095 - Thread-Level Worktree Binding Across Mode Transitions

```yaml
plan_unit_id: EP-095
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Assistant Chat mode transitions do not affect worktree binding because the
  binding is thread-level, not mode-level.
gui_related: false
gui_classification_reason: This unit defines runtime binding invariants across mode transitions, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- Mode transitions do not change the active worktree binding.
- Worktree binding remains thread-level rather than mode-level.
- ContractRefs and source lineage remain traceable.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: thread_level_worktree_binding_across_mode_transitions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0067
preserved_exact_tokens:
- Mode transitions do not affect worktree binding
- thread-level
- not mode-level
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints:
- Mode transitions must not affect worktree binding.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Worktree binding is owned at the Assistant Chat thread level and is consumed by individual modes.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-001 - Executor Protocol Retired Source-Preserving Bridge

```yaml
plan_unit_id: EP-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  The former Executor Protocol source-preserving bridge is retired after Phase
  2B atomized Executor_Protocol-S0001 through Executor_Protocol-S0067 into
  EP-002 through EP-095 and structurally dispositioned the owner map, PlanUnits
  heading, retired bridge lineage, and Migration Coverage. EP-001 remains only
  as migration lineage for the retired bridge span and must not re-own atomized
  source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior; coverage_map still preserves S0070 gui_related_inferred=true from the historical broad bridge span.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- EP-001 no longer uses the source-preserving PlanUnit compile hint.
- EP-002 through EP-095 own product coverage for Executor_Protocol-S0001 through Executor_Protocol-S0067.
- Executor_Protocol-S0068, S0069, and S0071 are structural owner-map, heading, and migration-coverage dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0070
preserved_exact_tokens:
- EP-001
- source_preserving_planunit
- source_preserving_bridge_retired
- EP-002
- EP-095
- Executor_Protocol-S0001
- Executor_Protocol-S0071
- 'Execution Context: Worktree Handoff'
- Mode interaction
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- Do not remap atomized Executor_Protocol spans back to EP-001.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit.
compatibility_only_notes:
- The old source-preserving bridge is retained only so migration lineage and historical references to EP-001 remain auditable.
stale_retired_dispositions: []
owner_boundary_notes:
- EP-002 through EP-095 own product coverage for Executor_Protocol-S0001 through Executor_Protocol-S0067.
- S0068, S0069, and S0071 are structural owner-map, PlanUnits-heading, and Migration Coverage dispositions.
owner_hints:
- Plans/Executor_Protocol.md
```
