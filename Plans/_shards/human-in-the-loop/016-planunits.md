# Shard 016: PlanUnits

Source: `Plans/human-in-the-loop.md`

Source lines: L421-L2401

Source SHA256: `547b28001f8297b26cbd57823d00c6037b7066f68f51a032662200e08904801c`

---

## PlanUnits

### HITL-002 - HITL Doc Authority, Status, And Compatibility Vocabulary

```yaml
plan_unit_id: HITL-002
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The HITL document is plan-only canonical owner-section text for Human-in-the-Loop behavior, keeps Puppet Master compliance and deterministic-default rules, and treats compatibility-only source vocabulary as noncanonical while preserving HITL behavior, settings model, run-loop integration, and DRY alignment as plan scope.
gui_related: false
gui_classification_reason: This unit defines document authority, status, and compatibility vocabulary rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-002 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: hitl_doc_authority_status_and_compatibility_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0007
preserved_exact_tokens:
- Human-in-the-Loop (HITL) Mode -- Plan
- Canonical owner-section requirements
- Retire tier-era canon and shadow fields
- Approval scope key and approver identity
- PLAN DOCUMENT ONLY
- HITL behavior and tier-boundary semantics
- Settings model
- Integration points with the orchestrator run loop
- DRY alignment
negative_constraints: []
compatibility_only_notes:
- Compatibility-only source vocabulary is noncanonical; live wording uses owner terminology.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-003 - Rewrite-Aligned HITL Event Semantics

```yaml
plan_unit_id: HITL-003
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL approvals are explicit events in the unified event model and seglog ledger; Pause for approval must be reproducible and replayable through event stream and projections, while UI can change in the Slint rewrite without changing blocked-runtime, package-complete, seam-complete, or mandatory side-effect approval requirements. Tier-boundary wording is compatibility lineage only.
gui_related: false
gui_classification_reason: This unit defines event/persistence semantics, not visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-003 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: rewrite_aligned_hitl_event_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0008
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:13
preserved_exact_tokens:
- Rewrite alignment (2026-02-21)
- unified event model
- seglog ledger
- Pause for approval
- reproducible/replayable
- event stream + projections
- Slint rewrite
- tier-boundary meaning and approval requirements
negative_constraints:
- UI can change, but blocked-runtime, package-complete, seam-complete, and mandatory side-effect approval requirements must not.
compatibility_only_notes:
- Tier-boundary wording remains compatibility lineage only.
stale_retired_dispositions:
- tier-boundary meaning and approval requirements is retired as live canon wording; tier-boundary examples remain display/compatibility copy.
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-004 - Canonical Blocked-Runtime HITL Request Contract

```yaml
plan_unit_id: HITL-004
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The canonical HITL contract remains a blocked-runtime overlay with run_id, node_id, blocked_sequence, optional attempt_id, blocked_reason_code, ordered allowed_action_ids, approval_scope_key, optional detail_ref, and optional approver_identity; blocked_sequence is the canonical approval anchor and action_available rows derive from the same blocked-runtime action set.
gui_related: false
gui_classification_reason: This unit defines runtime request fields and identity semantics rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-004 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: canonical_blocked_runtime_hitl_request_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0009
preserved_exact_tokens:
- blocked-runtime overlay
- run_id
- node_id
- blocked_sequence
- attempt_id?
- blocked_reason_code
- allowed_action_ids[]
- approval_scope_key
- detail_ref?
- approver_identity?
- action_available
negative_constraints:
- allowed_action_ids[] stay ordered and runtime-owned.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-005 - Shared-Runtime Attribution And Lane/Account Provenance

```yaml
plan_unit_id: HITL-005
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL is the approval consumer for shared-runtime multi-lane execution and must preserve effective_account_id, requested account fields, execution_role, permission posture, actor identity, lane identity, attempt_id, account/role, package/lane/attempt, and safely scoped always policy so later review can attribute who asked and who approved.
gui_related: false
gui_classification_reason: This unit defines attribution and provenance fields, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-005 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: shared_runtime_attribution_and_lane_account_provenance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- shared-runtime
- multi-lane execution
- effective_account_id
- requested_account
- requested_account_id
- execution_role
- permission posture
- actor identity
- lane identity
- attempt_id
- /account/role
- /package/lane/attempt
- /always
negative_constraints:
- Post-hoc explanations that omit these fields are under-attributed and lane-unsafe.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-006 - Blocked-Episode Persistence And Approval Identity Join

```yaml
plan_unit_id: HITL-006
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Runtime HITL persistence is keyed by blocked episode identity first; checkpoints.hitl.{run_id} and checkpoints.hitl are compatibility paths only, and runtime storage must distinguish concurrent pending HITL episodes by run_id, node_id, blocked_sequence, optional attempt_id, approval_scope_key, actor/account/lane context, and approver identity while supporting a three-way join among the blocked episode, approval identity record, and triggering tool request.
gui_related: false
gui_classification_reason: This unit defines persistence and join semantics, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-006 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: blocked_episode_persistence_and_approval_identity_join
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- checkpoints.hitl.{run_id}
- checkpoints.hitl
- blocked episode identity
- run_id
- node_id
- blocked_sequence
- attempt_id?
- approval_scope_key
- actor/account/lane context
- approver identity
- three-way join
negative_constraints: []
compatibility_only_notes:
- checkpoints.hitl.{run_id} and checkpoints.hitl are compatibility paths only.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-007 - Request-Era Compatibility Bridge And Axis Separation

```yaml
plan_unit_id: HITL-007
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The historical HITLRequest request-era contract is a compatibility bridge subordinate to the runtime blocked episode; request_id, tier_id, tier_type, request_kind=tier_boundary_approval, allowed_actions, allowed_actions[], tier/request_kind/allowed_actions, and hitl.approval_requested must not become a second action family, and HITL classification keeps source, request, and execution/result axes separate.
gui_related: false
gui_classification_reason: This unit records compatibility and classification constraints rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-007 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: request_era_compatibility_bridge_and_axis_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- HITLRequest
- request_id
- tier_id
- tier_type
- request_kind = tier_boundary_approval
- allowed_actions
- allowed_actions[]
- /tier/request_kind/allowed_actions
- hitl.approval_requested
- source axis
- request axis
- execution/result axis
negative_constraints:
- allowed_actions must not become a second action family.
- A result or execution outcome must not become request identity or source identity.
compatibility_only_notes:
- The request-era contract remains documented only as a compatibility bridge.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-008 - Automation-First Boundary Model

```yaml
plan_unit_id: HITL-008
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL settings are automation-first and off by default unless explicitly enabled for phase, task, or subtask groupings; live approval can be package/seam/lane-bound, package_complete_gate and seam_complete_gate outcomes replace tier-local pauses, and mandatory and optional cases such as Docker repo creation, FileSafe approvals, Multi-Pass review, wizard attention-required, and graph-level HITL share one boundary model.
gui_related: true
gui_classification_reason: This unit governs user-visible HITL grouping behavior and approval boundaries.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-008 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: automation_first_boundary_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- automation-first
- OFF by default
- <phase>/<task>/<subtask>
- /task/subtask
- /package/seam/lane-bound
- /seam-aware
- package_complete_gate
- seam_complete_gate
- Docker repo creation
- FileSafe approvals
- Multi-Pass review
- wizard attention-required
- graph-level HITL
negative_constraints:
- Phase/task/subtask labels are display/configuration labels only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-009 - Clarification Metadata And Event-To-Surface Routing

```yaml
plan_unit_id: HITL-009
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Clarification questions and blocked-resolution flows use node-effective execution metadata, palette-friendly copy, and detail pivots without losing runtime truth; UI and storage routes must not cross-wire governance approvals with tool approvals, and hitl.* event rows carry config, run.started, usage.event, actor projections, meta links, action-family normalization, and current blocked-episode mutation binding.
gui_related: true
gui_classification_reason: This unit includes palette copy, route/surface behavior, and user-visible approval routing.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-009 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: clarification_metadata_and_event_to_surface_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- node-effective execution metadata
- provider
- model
- effort
- /model/effort
- /detail/history/ledger/evidence
- hitl.*
- /config
- run.started
- usage.event
- /role-aware
- /meta
- /families
- /action-family
- current blocked episode
negative_constraints:
- UI and storage routes must not cross-wire governance approvals with tool approvals.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-010 - Runtime-Native Ontology, Graph Shims, Session Scope, And Object-Open Boundaries

```yaml
plan_unit_id: HITL-010
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL blocked/runtime semantics use blocked-episode and runtime-native ontology; graph-local HITL commands are compatibility shims that resolve through blocked_sequence before mutation, session copy is display/provider context only, object-open requests for runtime artifacts use open-by-identity with artifact envelopes, and compatibility labels must be explicit.
gui_related: true
gui_classification_reason: This unit covers graph command shims, session copy, object-open routing, and visible compatibility labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-010 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: runtime_native_ontology_graph_shims_session_scope_and_object_open_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- blocked-episode
- /runtime-native
- /tier-boundary-native
- cmd.graph.approve_hitl
- cmd.graph.deny_hitl
- hitl_request_id
- request_id
- blocked_sequence
- session
- OpenFile
- PathBuf
- target_group
- open-by-identity
- HITL tier-boundary approvals
- TierContext
- Run_Modes
negative_constraints:
- The plan must not preserve two competing approval/blocked ontologies.
- Session copy must not overload scope meanings.
- HITL, object-open, and runtime surfaces must not invent custom argument families for each destination.
compatibility_only_notes:
- Graph-local HITL commands remain compatibility shims over runtime actions.
- Compatibility labels must be explicit.
stale_retired_dispositions:
- Run_Graph_View and usage-feature tier_id correlation is stale compatibility metadata over blocked episode identity.
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-011 - Consequential Transition Reports And Recovery Label Normalization

```yaml
plan_unit_id: HITL-011
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Consequential approval and recovery transitions use a shared transition report with from/to state, target object, actor/source, reason, prerequisite evidence, review or corroboration references, and downstream obligations; recovery labels distinguish true Undo from Restore, Rollback, Retry from Safe Point, Reopen, Start fresh attempt, and compensating_action_only behavior.
gui_related: true
gui_classification_reason: This unit governs user-visible transition and recovery labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-011 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: consequential_transition_reports_and_recovery_label_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0011
preserved_exact_tokens:
- state transition report
- /source
- projection-trust
- Undo
- Restore
- Rollback
- Retry from Safe Point
- Reopen
- compensating_action_only
- /dismiss
- Create New Lane
- Re-request Promotion
- Reapply
- Start fresh attempt
negative_constraints:
- Restore language must not mint another recovery action family.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-012 - Tray Scope, Provider-Native Correlation, And Execution-Core Compatibility

```yaml
plan_unit_id: HITL-012
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: System tray notifications remain narrow, provider-native approval correlation preserves provider IDs, provider, and attempt/account/trust metadata without overloading runtime thread identity, GUI concern-model and projection-health requirements are HITL consumers, and Builder, Verifier, Overseer, Phase to Task to Subtask to Iteration, TierContext, tier-boundary, and tier-keyed labels are compatibility/display context only.
gui_related: true
gui_classification_reason: This unit governs user-visible tray scope, GUI concern/projection rendering, and displayed compatibility labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-012 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: tray_scope_provider_native_correlation_and_execution_core_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0011
preserved_exact_tokens:
- /tray
- HITL approval required
- run complete
- major failure requiring attention
- /pressure
- rate-limit
- provider-native IDs
- /provider
- /attempt/account/trust
- GUI concern-model
- projection-health
- degraded-trust
- Builder
- Verifier
- Overseer
- Phase -> Task -> Subtask -> Iteration
- allowed_action_ids[]
negative_constraints:
- Tray copy is not the owner for approval identity, allowed actions, or recovery semantics.
compatibility_only_notes:
- Execution-core labels may describe roles; graph/runtime ownership wins.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-013 - Debug Front-Door Grants

```yaml
plan_unit_id: HITL-013
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Debug Mode may request a run-scoped front-door grant for repeated low-risk investigation actions, but the grant remains represented through the canonical blocked-runtime overlay, is anchored by the blocked episode and investigation identity, does not create a separate approval transport, preserves degraded/blocked continuation when declined, limits scope to low-risk evidence reads and declared temporary instrumentation, and is revoked on grant revocation or investigation finish.
gui_related: false
gui_classification_reason: This unit defines debug approval scope and runtime grant behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-013 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: debug_front_door_grants
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0012
preserved_exact_tokens:
- Debug Mode
- run-scoped front-door grant
- low-risk investigation actions
- canonical blocked-runtime overlay
- blocked episode
- investigation identity
- degraded or blocked state
- low-risk evidence reads
- declared-scope temporary instrumentation
- agent_session
negative_constraints:
- Debug Mode does not invent a separate approval transport.
- High-risk mutations, auth/state mutation, publish-side effects, and explicit-confirmation actions still require their own confirmations.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md'
```

### HITL-014 - Optional HITL UX And Autonomy Rule

```yaml
plan_unit_id: HITL-014
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Human-in-the-Loop mode is an optional product UX feature for package or seam decision-point approvals when explicitly enabled, with all HITL toggles off by default; HITL must not be required for correctness, verification, or progression gates, and autonomous runs proceed deterministically without human approvals.
gui_related: true
gui_classification_reason: This unit defines optional user-facing HITL UX and autonomy behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-014 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: optional_hitl_ux_and_autonomy_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0013
preserved_exact_tokens:
- Human-in-the-Loop (HITL) mode
- package or seam decision points
- phase
- task
- subtask
- off by default
- Critical autonomy rule
- MUST NOT
- correctness
- verification
- progression gates
- autonomous runs
negative_constraints:
- HITL must not be required for correctness, verification, or progression gates.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§4, Gate:GATE-001'
```

### HITL-015 - Derived Grouping Boundaries

```yaml
plan_unit_id: HITL-015
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Tier boundaries are not a co-equal execution model; approvals do not bind to tier_id, surviving tier or phase labels are derived grouping/view concepts only, and approval and recovery bind to blocked runtime episodes anchored by run_id, node_id, blocked_sequence, and optional attempt_id.
gui_related: true
gui_classification_reason: This unit governs displayed phase/task/subtask grouping labels and their non-authority over runtime scope.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-015 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: derived_grouping_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0015
preserved_exact_tokens:
- Derived Grouping Boundaries (DRY)
- Tier boundaries
- tier_id
- derived grouping/view concepts
- run_id
- node_id
- blocked_sequence
- attempt_id?
negative_constraints:
- Approvals do not bind to tier_id as the canonical execution scope.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md'
```

### HITL-016 - Package And Seam Completion Gates

```yaml
plan_unit_id: HITL-016
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The node-model rewrite uses package_complete_gate and seam_complete_gate as canonical gate types; package gates fire when all nodes are completed or skipped and run package verification, seam gates fire when seam transitions are needed and validate cross-package contracts, and HITL approval behavior binds to these gate types while keeping approve, decline, skip, and abort flow intact.
gui_related: false
gui_classification_reason: This unit defines runtime gate semantics rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-016 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: package_and_seam_completion_gates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0016
preserved_exact_tokens:
- package_complete_gate
- seam_complete_gate
- '{completed, skipped}'
- package-level verification
- cross-package contracts
- gate_id = package_complete_gate
- gate_id = seam_complete_gate
- approve / decline / skip / abort
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md'
```

### HITL-017 - Independent HITL Grouping Toggles

```yaml
plan_unit_id: HITL-017
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL exposes three independent user-facing grouping toggles for phase, task, and subtask, all defaulting off; toggles request approval at the corresponding package/seam gate decision point before the next grouping begins and must not redefine approval_scope_key, blocked identity, recovery semantics, persistence ownership, or package/seam gate ownership.
gui_related: true
gui_classification_reason: This unit defines visible settings toggles and their runtime boundary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-017 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: independent_hitl_grouping_toggles
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0018
preserved_exact_tokens:
- HITL at phase
- HITL at task
- HITL at subtask
- 'Off'
- phase-only
- task+subtask
- all three
- approval_scope_key
- blocked identity
- recovery semantics
- persistence ownership
negative_constraints:
- Phase/task/subtask labels must not redefine approval_scope_key, blocked identity, recovery semantics, persistence ownership, or package/seam gate ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§4'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### HITL-018 - GUI Config Persistence And Run Snapshot

```yaml
plan_unit_id: HITL-018
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL is configured in the GUI and persisted in one canonical execution-affecting config block shaped as hitl.phase, hitl.task, and hitl.subtask; the structure lives inside GuiConfig, persists in redb at config:gui.hitl, GUI controls read and write the exact structure, Option B runtime config construction copies it unchanged into the run snapshot at run start, and no second backend-only HITL key family exists.
gui_related: true
gui_classification_reason: This unit defines GUI configuration, persistence, and run snapshot behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-018 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: gui_config_persistence_and_run_snapshot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0019
preserved_exact_tokens:
- 'GUI: Primary Place to Turn On and Configure HITL'
- 'hitl:'
- 'phase: false'
- 'task: false'
- 'subtask: false'
- GuiConfig
- redb
- config:gui.hitl
- Option B
- run snapshot
- no second backend-only HITL key family
negative_constraints:
- There is no second backend-only HITL key family for the same semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md'
```

### HITL-019 - Run-Loop Pause Through Blocked Episode

```yaml
plan_unit_id: HITL-019
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: At package or seam decision points, enabled HITL groupings pause through the canonical blocked episode, show completion state and approval controls, emit canonical approval and gate outcome events on approval, retain the grouping as display/configuration context only, and continue autonomous execution until a package/seam gate or blocked episode reaches its decision point.
gui_related: true
gui_classification_reason: This unit governs visible pause/approval controls and runtime run-loop behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-019 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: run_loop_pause_through_blocked_episode
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0020
preserved_exact_tokens:
- Run-Loop Integration
- Phase → Task → Subtask → Iteration
- package or seam
- decision point
- pause
- canonical blocked episode
- approval controls
- canonical approval and gate outcome events
- display/configuration context
- no competing tier-only execution model
negative_constraints:
- HITL does not create a competing tier-only execution model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-020 - Runtime Action Labels, Decline/Abort Lineage, And Human Controls

```yaml
plan_unit_id: HITL-020
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'HITL controls use runtime action labels and families: Approve or Approve & Continue dispatches cmd.runtime.approve, Decline dispatches cmd.runtime.decline, recovery actions derive from ordered allowed_action_ids, Skip node maps to skip_node, Abort run maps to abort_run, legacy Reject, Skip, and Cancel Run are compatibility copy only, decline keeps the run paused with the same run_id/node_id/blocked_sequence, and abort preserves blocked episode and node execution lineage.'
gui_related: true
gui_classification_reason: This unit governs user-facing button labels, controls, and visible decline/abort behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-020 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: runtime_action_labels_decline_abort_lineage_and_human_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0021
preserved_exact_tokens:
- Approve
- Approve & Continue
- cmd.runtime.approve
- Decline
- cmd.runtime.decline
- Retry from safe point
- Start fresh attempt
- Resume after prerequisite
- Replan
- Skip node
- allowed_action_id = skip_node
- Abort run
- allowed_action_id = abort_run
- allowed_action_ids[]
- Reject
- Cancel Run
- What the Human Sees and Does
negative_constraints:
- Legacy Skip or Cancel Run copy must not create graph-local command semantics.
compatibility_only_notes:
- Reject, Cancel Run, and Skip are action-label surface copy over runtime action families.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-021 - Dashboard CtA And Assistant Addressability

```yaml
plan_unit_id: HITL-021
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: When Orchestrator pauses for HITL, Dashboard surfaces the state as a warning or Call to Action, and HITL prompts are addressable through the chat Assistant or direct Dashboard controls while remaining a single concept owned by Dashboard warning/CtA and Assistant integration.
gui_related: true
gui_classification_reason: This unit governs visible Dashboard warnings, calls to action, Assistant response, and direct controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-021 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: dashboard_cta_and_assistant_addressability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0022
preserved_exact_tokens:
- Dashboard
- Warnings
- Calls to Action
- CtA
- Phase X complete -- approval required to continue
- Task Y done -- approve to proceed
- Assistant
- approve and continue
- Approve & continue
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md'
```

### HITL-022 - HITL Gate, Global Pause, And DRY Summary

```yaml
plan_unit_id: HITL-022
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'HITL is separate from the global PAUSE.md pause gate: global pause can coexist, while HITL adds package-complete or seam-complete approval points when enabled. DRY alignment keeps Phase/Task/Subtask labels from redefining blocked identity, uses one config schema shared by GUI and Orchestrator, and introduces only a blocked-episode approval step after existing verification work.'
gui_related: true
gui_classification_reason: This unit covers user-facing pause/gate distinction and GUI/runtime DRY alignment.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-022 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: hitl_gate_global_pause_and_dry_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0024
preserved_exact_tokens:
- PAUSE.md
- global pause
- package-complete / seam-complete approval gate
- Display grouping labels
- Phase/Task/Subtask
- one config schema
- GUI and orchestrator
- Verification order
- no new verification concept
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-023 - Implementation Hooks For Config, Runtime, Persistence, And Dashboard

```yaml
plan_unit_id: HITL-023
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Implementation planning hooks require shared runtime config for approval/blocking policy, transition into canonical blocked episode flow rather than tier-local pause flags, persistence and restore of the same blocked episode so restart, retry, skip, abort, and recovery actions stay attached to original runtime identity, and Dashboard/Assistant surfacing without rewriting identity or action set.
gui_related: true
gui_classification_reason: This unit includes implementation-facing hooks for visible Dashboard/Assistant HITL surfacing and runtime integration.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-023 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: implementation_hooks_for_config_runtime_persistence_and_dashboard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0025
preserved_exact_tokens:
- Implementation Hooks (Planning Only)
- Config
- Runtime loop
- Persistence
- Dashboard CtAs
- shared runtime config
- canonical blocked episode flow
- tier-local pause flag
- persist and restore
- restart
- retry
- skip
- abort
- Dashboard and Assistant
negative_constraints:
- Dashboard and Assistant must surface the blocked episode without rewriting its identity or action set.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-024 - Restart Recovery Carry-Through And Approval Scope Correlation

```yaml
plan_unit_id: HITL-024
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Acceptance carry-through transfers execution_role, requested_account_id, operational_identity, account switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs; approval_scope_key is the durable blocked-episode scope key across actor, lane, run, node, and account context, reused across permissions, HITL, doom-loop handling, and session approval caching, while provider-native correlation lives in dedicated fields and approver identity persists durably.
gui_related: false
gui_classification_reason: This unit defines restart recovery, approval-scope identity, provider correlation, and audit persistence rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-024 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: restart_recovery_carry_through_and_approval_scope_correlation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0028
preserved_exact_tokens:
- execution_role
- requested_account_id
- operational_identity
- account-switch
- pressure ownership
- blocked_sequence
- startup recovery handshake
- DAE jail/approval policy
- approval_scope_key
- actor
- lane
- run
- node
- account context
- doom-loop handling
- session approval caching
- approver identity
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-025 - Tier-Era Payload Retirement And Canonical Blocked Identity

```yaml
plan_unit_id: HITL-025
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Legacy tier-era runtime context, identifier, type, collection labels, and Phase-Task-Subtask wording are retired compatibility-only display/grouping aliases that must not appear in runtime-owned blocked payloads, approval events, persistence records, cache keys, or recovery state; canonical blocked-episode identity is run_id plus node_id plus blocked_sequence and owns lookup, replay, restart recovery, audit joins, and resolver routing.
gui_related: false
gui_classification_reason: This unit defines runtime payload identity and retired compatibility vocabulary rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-025 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: tier_era_payload_retirement_and_canonical_blocked_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0029
preserved_exact_tokens:
- Tier-era compatibility retirement
- legacy tier-era runtime canon
- Phase-Task-Subtask
- compatibility-only display/grouping aliases
- run_id
- node_id
- blocked_sequence
- lookup
- replay
- restart recovery
- audit joins
- resolver routing
negative_constraints:
- Legacy tier-era labels must not appear in runtime-owned blocked payloads, approval events, persistence records, cache keys, or recovery state.
compatibility_only_notes: []
stale_retired_dispositions:
- The legacy tier-era runtime canon is retired.
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-026 - Blocked Classification, Action Enumeration, And Approval Outcome Identity

```yaml
plan_unit_id: HITL-026
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Canonical blocked classification uses concern_reason with optional detail_ref for additional structured metadata; ordered allowed_action_ids is the only canonical action enumeration for Runtime, Dashboard, Assistant, and APIs; canonical approval resolution uses approval_outcome and approval_recorded_at scoped by approval_scope_key, and durable approver_identity records who approved or declined.
gui_related: true
gui_classification_reason: This unit governs visible controls derived from allowed_action_ids and approval outcome identity.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-026 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: blocked_classification_action_enumeration_and_approval_outcome_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0029
preserved_exact_tokens:
- concern_reason
- detail_ref?
- allowed_action_ids[]
- Runtime
- Dashboard
- Assistant
- APIs
- approval_outcome
- approval_recorded_at
- approval_scope_key
- approver_identity
negative_constraints:
- No legacy short-code survivor field remains in the live contract.
- Runtime, Dashboard, Assistant, and APIs must not carry a second survivor array for blocked or recovery actions.
compatibility_only_notes:
- Canonical approval resolution is represented by recorded approval outcome, not a legacy continue-decision field.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-027 - Recovery Semantics And Phase/Task Label Compatibility

```yaml
plan_unit_id: HITL-027
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'Blocked-episode recovery semantics are canonical: retry, resume-after-prerequisite, skip, abort, replan, and safe-point restore remain attached to the same run_id/node_id/blocked_sequence episode, with affordances derived from allowed_action_ids, concern_reason, and safe-point metadata; remaining phase/task/subtask labels may render as explanatory UI copy but must not redefine approval scope, blocked identity, recovery semantics, or persistence ownership.'
gui_related: true
gui_classification_reason: This unit governs visible recovery affordances and explanatory grouping copy.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-027 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: recovery_semantics_and_phase_task_label_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0029
preserved_exact_tokens:
- retry
- resume-after-prerequisite
- skip
- abort
- replan
- safe-point restore
- run_id + node_id + blocked_sequence
- allowed_action_ids[]
- concern_reason
- safe-point metadata
- phase/task/subtask labels
- approval_scope_key
negative_constraints:
- Phase/task/subtask labels must not redefine approval scope, blocked identity, recovery semantics, or persistence ownership.
compatibility_only_notes:
- Remaining phase/task/subtask labels are explanatory UI copy only.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-028 - Scheduler Wake And Approval Wait Timers

```yaml
plan_unit_id: HITL-028
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'HITL approval/rejection resolution is a primary scheduler wake trigger: hitl.approved and hitl.rejected cause immediate queue reevaluation while unrelated runnable work continues; approval waits consume the shared temporal taxonomy as approval_wait and possibly long_governance_wait, known timers must not render generic deadlock/stall or auto-pause unrelated runnable work, and user_visible_wait_timer_expiry keeps the same blocked episode identity.'
gui_related: true
gui_classification_reason: This unit includes user-visible wait timers and scheduler wake behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-028 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: scheduler_wake_and_approval_wait_timers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0031
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0032
preserved_exact_tokens:
- hitl.approved
- hitl.rejected
- immediate queue reevaluation
- unrelated runnable work
- approval_wait
- long_governance_wait
- long-governance-wait
- deadlock/stall
- stall banners
- user_visible_wait_timer_expiry
- user-visible wait timer expiry
- run_id
- node_id
- blocked_sequence
- approval_scope_key
negative_constraints:
- HITL surfaces must not render known approval waits as generic deadlock/stall, must not show stall banners, and must not auto-pause unrelated runnable work.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-029 - Reject Rerun, Skip, Abort, And Acceptance Criteria

```yaml
plan_unit_id: HITL-029
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: After reject, Re-run must declare retry_from_safe_point or fresh_attempt, defaulting to retry_from_safe_point for mutation-capable attempts with a valid safe point and using fresh_attempt when no safe point exists or recovery is forbidden; Skip preserves lineage and shows the user advanced without rerunning, downstream behavior obeys graph policy, Abort terminates the run while preserving paused/rejected lineage, and acceptance criteria require scheduler wake, explicit rerun semantics, skip lineage, and abort audit history.
gui_related: true
gui_classification_reason: This unit governs visible rerun/skip/abort choices and their audit behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-029 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: reject_rerun_skip_abort_and_acceptance_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0033
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0034
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0035
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0036
preserved_exact_tokens:
- Re-run
- retry_from_safe_point
- fresh_attempt
- valid safe point
- mutation-capable attempts
- Skip
- skipped attempt remains in history
- UI must show
- advance without rerunning
- graph semantics
- Abort
- full paused/rejected lineage
- Acceptance criteria
negative_constraints:
- Skip is not silent success.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-030 - Canonical Recovery Action Families

```yaml
plan_unit_id: HITL-030
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL actions are canonical across graph, Orchestrator, and chat surfaces; allowed action families are approve, decline, retry_now, resume_after_prerequisite, skip_node, abort_run, replan, and restore_safe_point_then_retry.
gui_related: false
gui_classification_reason: This unit defines canonical action families and naming semantics rather than GUI layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-030 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: canonical_recovery_action_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0038
preserved_exact_tokens:
- Canonical HITL Recovery Action Alignment Addendum (2026-03-09)
- approve
- decline
- retry_now
- resume_after_prerequisite
- skip_node
- abort_run
- replan
- restore_safe_point_then_retry
- graph
- orchestrator
- chat surfaces
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-031 - Recovery Action Gating And Surface Consistency

```yaml
plan_unit_id: HITL-031
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Recovery action gating keeps approve/decline for side-effect gates and review approvals, resume_after_prerequisite for auth or policy prerequisites, restore_safe_point_then_retry when rollback is required, skip_node only when graph integrity permits it, and replan when classification is replan_required; all surfaces must use the same action names, meanings, and enablement conditions, and may hide actions for layout but must not rename or reinterpret them.
gui_related: true
gui_classification_reason: This unit governs visible action availability and cross-surface consistency.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-031 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: recovery_action_gating_and_surface_consistency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0039
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0040
preserved_exact_tokens:
- approve
- decline
- external-side-effect gates
- resume_after_prerequisite
- auth recovery
- policy change
- restore_safe_point_then_retry
- skip_node
- graph integrity
- replan
- replan_required
- same action names
- enablement conditions
negative_constraints:
- A surface may hide an action for layout reasons, but it must not rename or reinterpret it.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-032 - Approval Resolution And Rerun Event Semantics

```yaml
plan_unit_id: HITL-032
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Waiting for approval is a blocked state with blocked_reason_code=waiting_approval; approval resolution emits node.prerequisite_resolved and wakes scheduling in the same cycle, valid safe points default to Retry from safe point for mutation-capable attempts, Start fresh attempt is the explicit alternative when no valid safe point exists or policy forbids restore, and Skip remains a separate graph policy action that never masquerades as success.
gui_related: true
gui_classification_reason: This unit defines visible rerun affordances and event semantics after approval resolution.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-032 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: approval_resolution_and_rerun_event_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0041
preserved_exact_tokens:
- blocked_reason_code = waiting_approval
- node.prerequisite_resolved
- same cycle
- Retry from safe point
- Start fresh attempt
- Skip
- graph policy action
- never masquerades as success
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-033 - Visible Labels And Decline/Reject Follow-Up Choices

```yaml
plan_unit_id: HITL-033
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL surfaces use canonical visible labels Approve, Decline, Retry from safe point, Start fresh attempt, Resume after prerequisite, Replan, Skip node, and Abort run; Reject, Deny, and other variants map back to canonical action families, and after decline/reject the surface chooses among safe-point retry, fresh attempt, Replan, Skip node only when permitted, or debug verification rerun in the active isolated automation session unless corrupted state requires a fresh isolated session.
gui_related: true
gui_classification_reason: This unit governs user-visible labels and decline/reject follow-up choices.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-033 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: visible_labels_and_decline_reject_follow_up_choices
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0042
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0043
preserved_exact_tokens:
- Approve
- Decline
- Retry from safe point
- Start fresh attempt
- Resume after prerequisite
- Replan
- Skip node
- Abort run
- Reject
- Deny
- decline/reject
- active isolated automation session
- fresh isolated session
negative_constraints:
- Reject, Deny, and other variants must map back to canonical action families.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-034 - Shared Approval Ladder And Approval Vocabulary Consumption

```yaml
plan_unit_id: HITL-034
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL-specific affordances consume the shared permission ladder instead of defining a shorter local approval menu; approval choices are deny, once, for session, and always, batch web review may present one domain-grouped approval surface, question defaults to allow only when HITL is available and otherwise remains ask-gated, and HITL surfaces do not create a competing approval vocabulary.
gui_related: true
gui_classification_reason: This unit governs user-visible HITL approval affordances, permission/question prompts, terminal blocked-state handling, or approval labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-034 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_permission_ladder_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: shared_approval_ladder_and_approval_vocabulary_consumption
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0044
preserved_exact_tokens:
- Shared approval-ladder alignment (2026-04-04)
- HITL-specific affordances
- shared permission ladder
- shorter local approval menu
- deny
- once
- for session
- always
- batch web review
- one domain-grouped approval surface
- question
- allow
- HITL is available
- ask-gated
- competing approval vocabulary
negative_constraints:
- HITL must not define a shorter local approval menu.
- question defaults to allow only when HITL is available; otherwise it remains ask-gated.
- HITL surfaces must not create competing approval vocabulary.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md owns HITL consumer alignment only.
- Plans/Permissions_System.md and Plans/Tools.md remain owners for the shared permission ladder and tool permission behavior.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md'
split_recommendation_reason: The source span contains separable approval-ladder vocabulary and ask-flow/terminal-block consumer-alignment requirements; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-035 - Ask-Flow And Terminal Block Consumer Alignment

```yaml
plan_unit_id: HITL-035
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: As an approval/ask-flow consumer, HITL preserves repaired permission, question, and terminal block handling exactly through the shared permission ladder and blocked-episode model rather than drifting into local-only action names or terminal-only approval behavior; /ask-flow and /question/terminal routes are consumer labels over the shared model and not independent HITL-only state machines.
gui_related: true
gui_classification_reason: This unit governs user-visible HITL approval affordances, permission/question prompts, terminal blocked-state handling, or approval labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-035 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_permission_ladder_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: ask_flow_and_terminal_block_consumer_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0044
preserved_exact_tokens:
- approval/ask-flow consumer
- MUST preserve repaired permission/question/terminal block handling exactly
- permission prompts
- question prompts
- terminal blocked states
- shared permission ladder
- blocked-episode model
- local-only action names
- terminal-only approval behavior
- /ask-flow
- /question/terminal
- consumer labels
- not independent HITL-only state machines
negative_constraints:
- HITL must not drift into local-only action names or terminal-only approval behavior.
- /ask-flow and /question/terminal must remain consumer labels, not independent HITL-only state machines.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- HITL consumes the shared question, permission, and terminal blocked-episode model.
- HITL must not re-own shared question, permission, or terminal state machines.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md'
split_recommendation_reason: The source span contains separable approval-ladder vocabulary and ask-flow/terminal-block consumer-alignment requirements; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-001 - Human-in-the-Loop Retired Source-Preserving Bridge

```yaml
plan_unit_id: HITL-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The former human-in-the-loop doc-level source-preserving bridge is retired after Phase 2B atomized human-in-the-loop-S0001 through S0044 into HITL-002 through HITL-035 and structurally dispositioned S0004, S0005, S0014, S0017, S0026, S0030, S0045, S0046, and S0048. HITL-001 remains only as migration lineage for human-in-the-loop-S0047 and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained HITL PlanUnits HITL-002 through HITL-035.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- HITL-001 no longer uses source_preserving_planunit compile mode.
- HITL-002 through HITL-035 own product coverage for atomized human-in-the-loop spans.
- Structural spans are explicit coverage dispositions, not product coverage owned by HITL-001.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0047
preserved_exact_tokens:
- HITL-001
- source_preserving_planunit
- source_preserving_bridge_retired
- Human-in-the-Loop (HITL) Mode -- Plan
- human-in-the-loop-S0047
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- HITL-001 must not re-own atomized human-in-the-loop product coverage.
- HITL-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- HITL-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former HITL-001 residual source-preserving bridge is retired by Phase 2B batch 082.
owner_boundary_notes:
- HITL-002 through HITL-035 own atomized human-in-the-loop product coverage.
- human-in-the-loop-S0047 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/human-in-the-loop.md
```
