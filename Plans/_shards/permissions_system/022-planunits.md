# Shard 022: PlanUnits

Source: `Plans/Permissions_System.md`

Source lines: L1246-L7470

Source SHA256: `b25aae7b5aae414e64daafa83d8df6a2bf9463f273118a7e5aa4dd5fdc8c12bb`

---

## PlanUnits

### PS-002 - Permission SSOT Authority And Compatibility Header

```yaml
plan_unit_id: PS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Plans/Permissions_System.md owns the canonical permission system SSOT, owner-section live specification framing, compatibility-only source vocabulary handling, and the requirement that other docs reference permission anchors rather than restating action definitions, precedence, granular syntax, or defaults."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "PS-002 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_ssot_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0004
preserved_exact_tokens:
- "Permissions System (Canonical SSOT)"
- "Canonical owner-section requirements"
- "Requested/effective account identity contract"
- "Compatibility-only source vocabulary is noncanonical"
- "single canonical source of truth"
- "Plans/Permissions_System.md#PERM-ACTIONS"
- "Puppet Master"
negative_constraints:
- "Other plan documents must reference permission anchors rather than restating permission action definitions, precedence rules, granular syntax, or default tables."
preserved_contractrefs:
- "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md"
compatibility_only_notes:
- "Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/DRY_Rules.md"
- "Plans/Contracts_V0.md"
- "Plans/Decision_Policy.md"
```

### PS-003 - Permission SSOT Reference Catalog

```yaml
plan_unit_id: PS-003
unit_type: reference
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The Permissions SSOT reference catalog preserves the governing references for Spec Lock, Contracts, DRY, Glossary, Decision Policy, Tools, FileSafe, Run Modes, Personas, OpenCode baseline permissions, GUI specification, and CLI-bridged providers."
gui_related: true
gui_classification_reason: "This unit is GUI-related only because the reference catalog preserves the GUI specification reference; it does not itself define a GUI implementation."
split_recommended: false
depends_on:
- PS-002
unblocks: []
acceptance_criteria:
- "PS-003 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_reference_catalog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0005
preserved_exact_tokens:
- "SSOT references (DRY)"
- "Plans/Spec_Lock.json"
- "Plans/Contracts_V0.md"
- "Plans/DRY_Rules.md"
- "Plans/Glossary.md"
- "Plans/Decision_Policy.md"
- "Plans/auto_decisions.jsonl"
- "Plans/Tools.md"
- "Plans/FileSafe.md"
- "Plans/Run_Modes.md"
- "Plans/Personas.md"
- "Plans/OpenCode_Deep_Extraction.md"
- "Plans/FinalGUISpec.md"
- "Plans/CLI_Bridged_Providers.md"
negative_constraints:
- "The reference catalog must not be read as permission behavior that supersedes the owner sections."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/Tools.md"
- "Plans/FileSafe.md"
```

### PS-004 - Requested Account Binding And Approval Scope Data Shape

```yaml
plan_unit_id: PS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission data shape requires requested_account_id beside requested_account_policy, requested_account_binding, subordinate provider_account_id metadata, provider-native OpenCode session IDs instead of canonical thread_id, and approval_scope_key across actor, lane, run, and account context."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-002
unblocks: []
acceptance_criteria:
- "PS-004 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_account_identity_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0008
preserved_exact_tokens:
- "Canonical data-shape reconciliation"
- "Required data shape"
- "Acceptance carry-through"
- "requested_account_id"
- "requested_account_policy"
- "requested_account_binding"
- "provider_account_id"
- "thread_id"
- "approval_scope_key"
- "HITL"
- "doom-loop"
negative_constraints:
- "provider_account_id is subordinate provider-native metadata, not canonical account identity."
- "OpenCode session IDs must move to provider-native correlation fields instead of canonical thread_id."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Contracts_V0.md"
- "Plans/CLI_Bridged_Providers.md"
```

### PS-005 - Actor Lane Approval Scope Key Boundary

```yaml
plan_unit_id: PS-005
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Approval scope is actor/lane-aware across actor, run, lane, account, package/seam context, shared runtime identity, HITL, and blocked-overlay flow; session-centric and tier-boundary approval language is compatibility-only."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-004
unblocks: []
acceptance_criteria:
- "PS-005 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: approval_scope_key_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "P5 permission authority recovery"
- "/actor/lane"
- "/account"
- "/lane/run/account"
- "shared-runtime"
- "actor"
- "lane"
- "run"
- "account"
- "package/seam"
- "ask -> deny unless HITL at current tier boundary"
negative_constraints:
- "The permission layer must not mix tier-boundary governance with tool-level HITL approval semantics."
preserved_contractrefs: []
compatibility_only_notes:
- "Session-scoped approval logic, permission session cache, reject cascade, and OpenCode SSE/session isolation must resolve through actor/lane-aware boundaries."
stale_retired_dispositions:
- "ask -> deny unless HITL at current tier boundary is deprecated tier-era behavior."
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-006 - Execution Entity Approval Snapshot And Carryover

```yaml
plan_unit_id: PS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission resolution, approval carryover, and approval cascade are execution-entity scoped, with lane, package, lane/account, effective-account, and effective account identity facts preserved in approval snapshots and blocked-card explanations."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-005
unblocks: []
acceptance_criteria:
- "PS-006 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: execution_entity_approval_snapshot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "execution-entity scoped"
- "Lane"
- "package"
- "/lane/account"
- "effective-account"
- "/identity"
- "approval snapshot"
- "/cascade"
- "reject-cascade"
negative_constraints:
- "Approval carryover must not silently become same-session when lanes are parallel."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-007 - Runtime Artifact Drill Through And Permission State Hooks

```yaml
plan_unit_id: PS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Runtime artifact permission drill-through preserves runtime artifact ownership and hook vocabulary so permission cards and blocked-state records share blocked_reason_code, allowed_action_ids, failure_class, permission_snapshot_id, and provider_attempt_ref."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-005
- PS-006
unblocks: []
acceptance_criteria:
- "PS-007 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: runtime_artifact_permission_drillthrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "Plans/Runtime_Artifacts_Panel.md"
- "/Runtime_Artifacts_Panel.md"
- "/schema-family"
- "attempt-key"
- "envelope family"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "failure_class"
- "permission_snapshot_id"
- "provider_attempt_ref"
negative_constraints:
- "Permission cards and blocked-state records must not fork the hook vocabulary."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Runtime_Artifacts_Panel.md"
- "Plans/Contracts_V0.md"
- "Plans/storage-plan.md"
```

### PS-008 - Blocked Action Identity And Cross Owner Policy Routing

```yaml
plan_unit_id: PS-008
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Blocked-state approval actions map from canonical allowed_action_ids while graph approval actions target request_id; worktree and decision-policy routing remain lineage-aware without splitting blocked-state authority away from request identity."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-005
unblocks: []
acceptance_criteria:
- "PS-008 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: blocked_action_identity_policy_route
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "allowed_action_ids[]"
- "allowed_action_ids"
- "request_id"
- "Plans/WorktreeGitImprovement.md"
- "/WorktreeGitImprovement.md"
- "lane pools"
- "parallel toggles"
- "Plans/Decision_Policy.md"
- "/storage/runtime"
negative_constraints:
- "Consumer surfaces must not split blocked-state authority away from request identity."
preserved_contractrefs: []
compatibility_only_notes:
- "Per-subtask worktree references are lineage until lane pools and parallel toggles are reconciled."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/WorktreeGitImprovement.md"
- "Plans/Decision_Policy.md"
```

### PS-009 - Mode Override And Remote Side Effect Authority

```yaml
plan_unit_id: PS-009
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Mode override semantics reconcile ask/plan to deny, approval, external_publish_side_effect, side-effect, and non-bypassable remote publication approval so mutating remote side effects cannot diverge by surface or mode."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-005
unblocks: []
acceptance_criteria:
- "PS-009 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: mode_override_remote_side_effect
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "ask/plan -> deny"
- "/plan"
- "/approval"
- "external_publish_side_effect"
- "side-effect"
- "non-bypassable approval"
negative_constraints:
- "Mutating remote publication cannot diverge by surface or mode."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-010 - Provider Gap And Requested Effective Disclosure

```yaml
plan_unit_id: PS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Provider-gap disclosure remains distinct from overrides, and requested/effective permission display may stay compact only when requested equals effective and no control was skipped or clamped."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-009
unblocks: []
acceptance_criteria:
- "PS-010 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: provider_gap_requested_effective_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "Provider-gap disclosure"
- "honored"
- "skipped"
- "clamped"
- "requested == effective"
- "/clamped"
- "/disclose"
negative_constraints:
- "Provider-gap states must not be collapsed into generic override wording."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-011 - Permission Trust And Projection Health Disclosure

```yaml
plan_unit_id: PS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Degraded-trust and projection-health are permission-visible trust inputs consumed by permission cards, approval surfaces, Orchestrator, Usage, widgets, and provider surfaces; stale, degraded, and restricted-trust render states cannot appear as fresh authority."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-007
- PS-010
unblocks: []
acceptance_criteria:
- "PS-011 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_trust_projection_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "degraded-trust"
- "projection-health"
- "permission-visible trust inputs"
- "attempt_id"
- "/file"
- "read-only"
- "historical"
- "restricted-trust"
- "fresh authority"
negative_constraints:
- "Stale, degraded, or restricted-trust render states cannot masquerade as fresh authority."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale or degraded projections do not become authoritative just because they are visible in the UI."
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-012 - Route Search And Target Approval Facts

```yaml
plan_unit_id: PS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission cards approve the exact route, search, subject-open, output, file, navigation, line, range, and editor-group facts they display instead of collapsing them into generic file-open prompts."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-011
unblocks: []
acceptance_criteria:
- "PS-012 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: route_search_target_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "line /range"
- "OpenFile"
- "object-family-specific anchors"
- "tab-local"
- "global object search"
- "route-target"
- "subject-open"
- "/output"
- "line?"
- "range?"
- "editor-group"
- "/navigation"
negative_constraints:
- "Permission cards must not hide route, search, and target facts behind a generic file-open prompt."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-013 - Compact Permission Surface Terminology

```yaml
plan_unit_id: PS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Small permission surfaces keep canonical compact terms and labels while Source Control stays worktree-first, graph badges and inspector chips remain dense, and contextual help expands explanations without renaming local jargon."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-012
unblocks: []
acceptance_criteria:
- "PS-013 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: compact_permission_surface_terms
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "Small permission surfaces"
- "canonical terms"
- "compact labels"
- "Source Control"
- "worktree-first"
- "graph badges"
- "inspector chips"
- "/contextual"
negative_constraints:
- "Contextual help links expand to deeper explanations instead of renaming local jargon."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-014 - Path Normalization And Fail Closed Matching

```yaml
plan_unit_id: PS-014
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Before any permission match, paths expand home references, resolve absolute components and symlinks through realpath, match only canonical paths, and fail closed on broken symlinks, permission errors, missing targets, unresolved paths, or unexpanded runtime home tokens."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-002
unblocks: []
acceptance_criteria:
- "PS-014 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: path_normalization_fail_closed
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0011
preserved_exact_tokens:
- "Definitions and scope"
- "Path normalization invariants"
- "DEF-SCOPE"
- "realpath()"
- "symlink-root canonicalization"
- "~"
- "$HOME"
- "PM MUST NOT compare against an unresolved path as fallback"
- "fail-closed"
negative_constraints:
- "realpath() failure is fail-closed."
- "PM must not compare against an unresolved path as fallback."
- "Unexpanded ~ in a runtime path comparison is always a bug."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md"
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FileSafe.md"
- "Plans/Executor_Protocol.md"
- "Plans/Architecture_Invariants.md"
```

### PS-015 - Tool Registry Boundary And HTE DAE Enforcement

```yaml
plan_unit_id: PS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permissions owns when a tool invocation is allowed, asks, or is denied, while Tools owns dispatch; HTE uses Puppet Master as sole dispatcher and DAE enforces the resolved permission ceiling through pre-spawn policy injection and post-hoc reconciliation."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-002
unblocks: []
acceptance_criteria:
- "PS-015 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: tool_registry_execution_strategy_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0013
preserved_exact_tokens:
- "Tool registry/policy vs Permission rules"
- "HTE vs DAE applicability"
- "policy.may_execute_tool()"
- "HTE"
- "DAE"
- "pre-spawn policy injection"
- "post-hoc reconciliation"
- "Child, subagent, or crew context is not a bypass"
negative_constraints:
- "DAE never creates an execution path that bypasses permission canon."
- "Child, subagent, or crew context is not a bypass."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, Primitive:DRYRules"
- "ContractRef: ContractName:Plans/Run_Modes.md#STRATEGY-HTE, ContractName:Plans/Run_Modes.md#STRATEGY-DAE, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/orchestrator-subagent-integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
- "Plans/Run_Modes.md"
- "Plans/Architecture_Invariants.md"
- "Plans/orchestrator-subagent-integration.md"
```

### PS-016 - Mutable Permission State And Hook Recheck Safety

```yaml
plan_unit_id: PS-016
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Mutable permission state shared across threads or async tasks requires an RwLock/read-write lock, and hooks that modify arguments or context must trigger a fresh permission evaluation on modified arguments before dispatch."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-015
unblocks: []
acceptance_criteria:
- "PS-016 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_mutation_hook_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0014
preserved_exact_tokens:
- "Permission-state mutation and hook safety"
- "RwLock"
- "read-write lock"
- "allowlists"
- "deny rules"
- "session approvals"
- "post-hook permission re-check contract"
negative_constraints:
- "Unguarded mutation of allowlists, deny rules, session approvals, or cached effective policy state is prohibited."
- "Hook execution can narrow permissions, but must not widen them after the original check has already passed."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md"
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Architecture_Invariants.md"
- "Plans/storage-plan.md"
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
```

### PS-017 - Executable Capability Surfaces And Network Trust

```yaml
plan_unit_id: PS-017
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Discovery is not execution approval: plugin code, custom tools, MCP server binaries, command templates, formatter binaries, arg-touching hooks, and network trust settings must clear permission and trust posture before load or execution."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-016
unblocks: []
acceptance_criteria:
- "PS-017 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: executable_capability_trust_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0015
preserved_exact_tokens:
- "Executable capability surfaces and trust posture"
- "Discovery is not execution approval"
- "plugin code"
- "custom tool executables"
- "MCP server binaries"
- "command templates"
- "formatter binaries"
- "/network/trust"
- "system"
- "manual"
- "off"
- "http_proxy"
- "https_proxy"
- "no_proxy"
- "OS credential store"
- "custom CA bundle"
negative_constraints:
- "Config presence, package discovery, or catalog availability does not imply execution approval."
- "Source or version change invalidates prior approval and requires a new decision."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileSafe.md"
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
- "Plans/FinalGUISpec.md"
- "Plans/FileSafe.md"
- "Plans/Architecture_Invariants.md"
```

### PS-018 - Enterprise Host Registry And Kubernetes Policy Outcomes

```yaml
plan_unit_id: PS-018
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Enterprise host, private registry, Kubernetes, plugin-added, MCP, and custom-tool external-host actions inherit shared host policy, trust, proxy, and blocked-reason checks with canonical outcomes instead of generic network failure."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-017
unblocks: []
acceptance_criteria:
- "PS-018 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: enterprise_host_policy_outcomes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0016
preserved_exact_tokens:
- "Enterprise host, registry, and cluster policy outcomes"
- "/air-gapped"
- "offline_cached"
- "network_blocked_by_policy"
- "host_unreachable"
- "host_untrusted"
- "registry_hosts[]"
- "k8s_host_policy"
- "apply"
- "exec"
- "port_forward"
- "logs"
- "allowed_action_ids[]"
negative_constraints:
- "Policy-denied but otherwise valid registry or Kubernetes actions must not be reported as generic network failure."
- "Plugin-added, MCP, custom-tool, and other extensibility surfaces do not get plugin-private network exceptions."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Plugins_System.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
- "Plans/Contracts_V0.md"
- "Plans/Plugins_System.md"
```

### PS-019 - Permission Action Triad

```yaml
plan_unit_id: PS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Exactly three permission actions exist: allow proceeds without approval, ask pauses pending canonical user resolution options, and deny blocks execution, emits tool.denied, and returns an error."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-002
unblocks: []
acceptance_criteria:
- "PS-019 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_action_triad
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0017
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0019
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0020
preserved_exact_tokens:
- "Permission actions"
- "PERM-ACTIONS"
- "allow"
- "ask"
- "deny"
- "Exactly three permission actions exist"
- "deny"
- "once"
- "for session"
- "always"
- "tool.denied"
negative_constraints:
- "Every tool invocation resolves to exactly one action."
- "The denied tool is not executed."
preserved_contractrefs:
- "ContractRef: PolicyRule:Decision_Policy.md§2"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Decision_Policy.md"
- "Plans/FileSafe.md"
- "Plans/Contracts_V0.md"
- "Plans/human-in-the-loop.md"
```

### PS-020 - Precedence Layers And Child Inheritance

```yaml
plan_unit_id: PS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission rules evaluate in strict layer precedence for mode override, parent/run ceiling, session cache, Persona overrides, project, global, and defaults, while child runs inherit restrictive action ceilings and argument-pattern rules additively without widening."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-019
unblocks: []
acceptance_criteria:
- "PS-020 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_precedence_layers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0021
preserved_exact_tokens:
- "Deterministic precedence across layers"
- "Mode override"
- "Parent/run ceiling"
- "Session cache"
- "Persona overrides"
- "Project-level"
- "Global-level"
- "Defaults"
- "ask / plan"
- "yolo"
- "merge-not-replace"
- "Parent Agent -> Parent Session -> Child Session -> Child Agent"
negative_constraints:
- "Higher-precedence layers shadow lower layers on a per-rule basis but do not replace the entire lower ruleset."
- "A child may narrow authority, but must not widen or replace away inherited restrictions."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Personas.md#PERSONA-INJECTION, PolicyRule:Decision_Policy.md§2"
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Run_Modes.md"
- "Plans/Personas.md"
- "Plans/Tools.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/Executor_Protocol.md"
```

### PS-021 - Scope Specificity And Account Aware Carryover Fields

```yaml
plan_unit_id: PS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Scope specificity resolves lane before seam before package before project before global, carries role-scoped account policy overrides, and preserves execution_entity_id, account_id, permission_scope, and approval_carryover_scope for multi-lane account-aware permission carry-through."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-020
unblocks: []
acceptance_criteria:
- "PS-021 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: scope_specificity_account_carryover
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0021
preserved_exact_tokens:
- "lane:{lane_id}"
- "seam:{seam_id}"
- "package:{package_id}"
- "allowed_roles"
- "disallowed_roles"
- "cooldown_policy_override"
- "switch_threshold_override"
- "execution_entity_id"
- "account_id"
- "permission_scope"
- "approval_carryover_scope"
- "effective-account"
negative_constraints:
- "Permission resolution and approval carryover must be multi-lane and account-aware rather than session-only."
- "Role-scoped account policy override fields narrow authority but do not widen the parent/run permission ceiling."
preserved_contractrefs:
- "ContractRef: Plans/FinalGUISpec.md#10.8 Human-in-the-loop approvals, Plans/Tools.md#10.7A Web-operation approval summary rules"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/Tools.md"
```

### PS-022 - Requested Vs Effective Capability Disclosure

```yaml
plan_unit_id: PS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "UI and runtime distinguish requested from effective permissioned capability state for tools, MCP, browser trust, project overrides, Persona profiles, and child ceilings, and disclose the governing layer on the owning surface."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-020
- PS-021
unblocks: []
acceptance_criteria:
- "PS-022 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: requested_effective_capability_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0022
preserved_exact_tokens:
- "Requested vs effective permissioned capability state"
- "PRECEDENCE-LAYERS"
- "#PRECEDENCE-LAYERS"
- "requested state"
- "effective state"
- "MCP server/tool availability"
- "browser trust/capability tiers"
- "/requested-vs-effective"
- "Section15"
- "terminal action"
negative_constraints:
- "The PRECEDENCE-LAYERS alias does not redefine the layer table."
- "Permission UI must not imply a terminal action is allowed when the effective permission or capability state is clamped."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, PolicyRule:Decision_Policy.md§2"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Run_Modes.md"
- "Plans/Tools.md"
- "Plans/Section15_MVP_Promoted_Features_Spec.md"
```

### PS-023 - Granular Permission Rule Object Shape

```yaml
plan_unit_id: PS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Granular permission rules may be simple action strings or objects containing pattern-based sub-rules that match invocation context such as file path, bash command string, or URL."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-019
unblocks: []
acceptance_criteria:
- "PS-023 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: granular_permission_rule_object
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0023
preserved_exact_tokens:
- "Granular rules"
- "GRANULAR-RULES"
- "allow"
- "ask"
- "deny"
- "file path"
- "read"
- "edit"
- "bash"
- "URL"
- "webfetch"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/OpenCode_Deep_Extraction.md"
- "Plans/Decision_Policy.md"
```

### PS-024 - Wildcard Matching Ordering And Case Mode

```yaml
plan_unit_id: PS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Wildcard matching defines star, question mark, optional trailing command portions, tool-family prefixes, definition-order last-match wins, path case sensitivity from resolved root semantics, and fail-closed behavior when stable roots cannot be determined."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-014
- PS-023
unblocks: []
acceptance_criteria:
- "PS-024 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: wildcard_matching_case_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0024
preserved_exact_tokens:
- "Wildcard syntax and matching"
- "WILDCARD-SYNTAX"
- "*"
- "?"
- "git *"
- "github_*"
- "last matching rule wins"
- "case-sensitive"
- "case-insensitive"
- "bytewise case-sensitive"
- "fail closed"
negative_constraints:
- "If PM cannot determine a stable canonical root for a path comparison, it fails closed rather than guessing a case mode."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2"
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/WorktreeGitImprovement.md"
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/OpenCode_Deep_Extraction.md"
- "Plans/FileSafe.md"
- "Plans/WorktreeGitImprovement.md"
- "Plans/Architecture_Invariants.md"
- "Plans/Executor_Protocol.md"
```

### PS-025 - Home Expansion Pattern Rule

```yaml
plan_unit_id: PS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Home expansion applies only when ~ or $HOME appear at the start of a pattern; mid-pattern occurrences remain literal characters."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-024
unblocks: []
acceptance_criteria:
- "PS-025 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: home_expansion_pattern_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0025
preserved_exact_tokens:
- "Home expansion"
- "HOME-EXPANSION"
- "~"
- "$HOME"
- "start of a pattern"
- "literal characters"
negative_constraints:
- "Mid-pattern ~ and $HOME occurrences must be treated as literal characters."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-026 - External Directory Guard And Allowlist

```yaml
plan_unit_id: PS-026
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Any tool invocation referencing a path outside active project working roots triggers the external_directory permission key with default ask, except paths on the external directory allowlist, whose entries support wildcard syntax."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-014
- PS-024
- PS-025
unblocks: []
acceptance_criteria:
- "PS-026 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_directory_guard_allowlist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0026
preserved_exact_tokens:
- "External directory guard"
- "EXTERNAL-DIR-GUARD"
- "external_directory"
- "Default: ask"
- "external directory allowlist"
- "~/.cargo/**"
- "/usr/local/include/**"
negative_constraints:
- "Paths outside active project working roots must not bypass the external_directory guard unless covered by the allowlist."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-027 - Always Approval Pattern Suggestions

```yaml
plan_unit_id: PS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "An always approval derives a suggested scope from invocation context for bash, edit/read/glob/grep, webfetch/websearch, and webextract/webresearch/webcrawl/webmap, presents scope-bound choices, and binds canonical approval to approval_scope_key plus blocked-episode identity."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-005
- PS-023
- PS-026
unblocks: []
acceptance_criteria:
- "PS-027 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: always_approval_pattern_suggestion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0027
preserved_exact_tokens:
- "Pattern suggestion contract (\"always\" approval)"
- "PATTERN-SUGGESTION"
- "always"
- "bash"
- "edit/read/glob/grep"
- "webfetch/websearch"
- "webextract/webresearch/webcrawl/webmap"
- "https://<domain>/*"
- "https://<actual-host>/*"
- "approval_scope_key"
- "blocked-episode identity"
negative_constraints:
- "The system must not silently mint a session-wide allow."
- "The canonical approval anchor is approval_scope_key plus blocked-episode identity rather than a UI session id."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-028 - Web Operation Derived Key Taxonomy

```yaml
plan_unit_id: PS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Web operation permission keys derive from normalized domains and query categories rather than raw user-entered URLs, with explicit webextract, webresearch, webcrawl, webmap, and broad web*:* authoring vocabulary."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-023
- PS-024
- PS-027
unblocks: []
acceptance_criteria:
- "PS-028 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: web_operation_key_derivation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0028
preserved_exact_tokens:
- "Web-operation permission-key derivation"
- "webextract:{domain}"
- "webresearch:{query_category}"
- "webcrawl:{domain}"
- "webmap:{domain}"
- "query_category ∈ {general, code, docs, news}"
- "web*:*"
- "registrable domain"
- "docs.example.com"
- "example.com"
negative_constraints:
- "Concrete approvals must resolve to normalized derived web permission keys."
- "Wildcard family authoring does not change the requirement that concrete approvals resolve to normalized derived keys."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
- "Plans/FinalGUISpec.md"
```

### PS-029 - Web Operation Approval Visibility

```yaml
plan_unit_id: PS-029
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Default web-operation posture remains ask where network web tools are enabled, six web tools stay explicit, and extract/crawl/map fan-out is visible in permission cards and audit payloads rather than hidden behind generic webfetch."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-028
unblocks: []
acceptance_criteria:
- "PS-029 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: web_operation_approval_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0028
preserved_exact_tokens:
- "Default web-operation posture remains ask"
- "webextract"
- "webresearch"
- "webcrawl"
- "webmap"
- "webfetch"
- "websearch"
- "advanced matcher"
- "Crawl/map fan-out"
- "permission cards"
- "audit payloads"
negative_constraints:
- "Crawl/map fan-out must not be hidden behind generic webfetch."
- "Query/task pattern rules are future-only until the advanced matcher is implemented."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget"
compatibility_only_notes:
- "Search/research may use query/task pattern rules only when the advanced matcher is implemented."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-030 - Web Approval Summary Templates

```yaml
plan_unit_id: PS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Approval cards render tool-specific summaries for websearch, webfetch/webextract, webresearch, and webcrawl/webmap using query preview, target host or URL, task summary, estimated source count, root URL, and page/depth caps."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-028
- PS-029
unblocks: []
acceptance_criteria:
- "PS-030 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: web_approval_summary_templates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0028
preserved_exact_tokens:
- "websearch summary shows tool name + query preview"
- "webfetch/webextract summary shows tool name + target host/URL"
- "webresearch summary shows tool name + task summary + estimated source count when available"
- "webcrawl/webmap summary shows tool name + root URL + page/depth caps"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-031 - Web Session Approval Semantics

```yaml
plan_unit_id: PS-031
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Web Once, For Session, Always, and Deny approvals preserve host-scoped follow-ons, wildcard-only MVP search/research, durable rule creation, and reject-all-pending cascade behavior under approval_scope_key and blocked-episode identity."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-005
- PS-027
- PS-028
unblocks: []
acceptance_criteria:
- "PS-031 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: web_session_approval_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0028
preserved_exact_tokens:
- "Once"
- "For Session"
- "Always"
- "Deny"
- "reject-all-pending"
- "approval_scope_key"
- "https://host.example/*"
- "https://docs.example.com/*"
- "MVP uses wildcard session approval for search/research"
- "Approving webcrawl For Session auto-approves crawl/map/extract/fetch"
negative_constraints:
- "For Session websearch and webresearch wildcard behavior does not permit unrelated file, shell, or network mutation tools."
- "Approving webresearch For Session does not create broad allow for unrelated tools."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-032 - Browser Capture And Auth Session Permission Boundary

```yaml
plan_unit_id: PS-032
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Browser capture requests for screenshot or pdf require session_granted approval, browser permission storage values remain canonical while UI/source aliases are lineage only, and auth_session follows normal capture/share/clipboard permission disclosure."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-010
- PS-022
- PS-031
unblocks: []
acceptance_criteria:
- "PS-032 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: browser_capture_permission_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0028
preserved_exact_tokens:
- "screenshot"
- "pdf"
- "session_granted"
- "always_allowed"
- "explicit_confirmation"
- "always-allowed"
- "session-granted"
- "explicit-confirmation"
- "trust-tier"
- "auth_session"
- "/copy/paste"
- "/share"
negative_constraints:
- "Do not revive the retired preview/browser trust-tier matrix."
- "Browser implementation-readiness details stay with browser owner docs, not Permissions implementation ownership."
preserved_contractrefs: []
compatibility_only_notes:
- "UI/source aliases always-allowed, session-granted, and explicit-confirmation are lineage labels only."
stale_retired_dispositions:
- "Retired preview/browser trust-tier matrix is not revived by browser-session permission tiers."
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-033 - Special Guard Synthetic Key Family

```yaml
plan_unit_id: PS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Special guards are synthetic permission keys tied to behavioral conditions rather than specific tools and are evaluated in addition to tool-specific permissions."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-019
unblocks: []
acceptance_criteria:
- "PS-033 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: special_guard_family
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0029
preserved_exact_tokens:
- "Special guards"
- "SPECIAL-GUARDS"
- "synthetic permission keys"
- "behavioral condition"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: PolicyRule:Decision_Policy.md§2"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-034 - Doom Loop Guard

```yaml
plan_unit_id: PS-034
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "doom_loop triggers when the same tool is called with identical input three consecutive times, defaults to ask, pauses or denies in headless mode, and allows configurable threshold and action."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-033
unblocks: []
acceptance_criteria:
- "PS-034 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: doom_loop_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0030
preserved_exact_tokens:
- "doom_loop"
- "GUARD-DOOM-LOOP"
- "identical input three consecutive times"
- "3×"
- "possible loop"
- "once"
- "for session"
- "always"
- "abort the run"
- "threshold = 3"
negative_constraints:
- "Headless mode cannot wait for an unavailable approval and therefore denies when the guard requires ask."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-035 - External Directory Guard Evaluation

```yaml
plan_unit_id: PS-035
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "external_directory triggers when a tool references a path outside project working roots, checks the external directory allowlist first, and otherwise applies the configured allow, ask, or deny action."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-026
- PS-033
unblocks: []
acceptance_criteria:
- "PS-035 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_directory_guard_runtime
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0031
preserved_exact_tokens:
- "external_directory"
- "GUARD-EXTERNAL-DIR"
- "project working roots"
- "Default action: ask"
- "external directory allowlist"
- "allow"
- "ask"
- "deny"
- "allowlist"
negative_constraints:
- "Outside-root paths must not bypass the guard unless they match an allowlist entry."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-036 - External Publish Guard Coverage

```yaml
plan_unit_id: PS-036
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "external_publish_side_effect covers DockerHub repository creation, autonomous DockerHub image push, managed remote template repository creation, and managed Unraid template repository remote push as non-bypassable remote side-effect approvals."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-009
- PS-033
unblocks: []
acceptance_criteria:
- "PS-036 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_guard_non_bypassable
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0032
preserved_exact_tokens:
- "external_publish_side_effect"
- "DockerHub repository creation"
- "DockerHub image push"
- "managed remote template repository"
- "managed Unraid template repository"
- "Default action: ask"
- "non-bypassable"
- "yolo"
- "scope-bound approval reuse"
- "generic prior allows"
negative_constraints:
- "yolo mode, scope-bound approval reuse, and generic prior allows must not suppress external_publish_side_effect."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-037 - External Publish Approval And Failure Presentation

```yaml
plan_unit_id: PS-037
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "A direct user click approves only the exact remote side effect named by that control, chained remote side effects require separate approvals in execution order, and blocked or rejected runtime errors identify the blocked step, guard, and recovery actions inline and in chat/evidence output."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-036
unblocks: []
acceptance_criteria:
- "PS-037 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_failure_presentation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0032
preserved_exact_tokens:
- "direct user click"
- "exact remote side effect"
- "separate approval step"
- "execution order"
- "Failure presentation"
- "blocked remote step"
- "guard name"
- "recovery actions"
- "Docker Manager"
- "orchestrator surfaces"
- "chat/evidence output"
negative_constraints:
- "A direct click approval must not authorize a different remote side effect in the same chained flow."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
- "Plans/FinalGUISpec.md"
```

### PS-038 - Tool Permission Key Taxonomy

```yaml
plan_unit_id: PS-038
unit_type: reference
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Tool permission key taxonomy and preset vocabulary remain owned by Permissions, while approval-card summaries and session-approval behavior are owned by Ask flow semantics and durable always reuse remains inspectable through permission/audit surfaces."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-019
- PS-028
unblocks: []
acceptance_criteria:
- "PS-038 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: tool_permission_key_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0033
preserved_exact_tokens:
- "Tool permission keys"
- "tool permission-key taxonomy"
- "preset vocabulary"
- "deny"
- "once"
- "for session"
- "always"
- "question default `allow` only when HITL is available"
- "read_only"
- "plan"
- "websearch"
- "webfetch"
- "webextract"
- "webresearch"
- "webcrawl"
- "webmap"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "status: \"unavailable\""
negative_constraints: []
preserved_contractrefs:
- "ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-039 - Ask Flow Web Summary Ownership

```yaml
plan_unit_id: PS-039
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Web tool permission keys, approval-card summary templates, session-approval semantics, and exact approval-card cross-reference targets remain canonical in Permissions and must not be reinvented from thin tool descriptions or stale Ask UI links."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-030
- PS-031
unblocks: []
acceptance_criteria:
- "PS-039 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: ask_flow_web_summary_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0034
preserved_exact_tokens:
- "Ask flow semantics"
- "Web tool permission keys"
- "approval-card summary templates"
- "session-approval semantics"
- "stale Ask UI links"
negative_constraints:
- "Web tool permission keys, approval-card summary templates, and session-approval semantics must not be re-invented from thin tool descriptions or stale Ask UI links."
preserved_contractrefs:
- "ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-040 - Ask Flow Preset Carry Through

```yaml
plan_unit_id: PS-040
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Ask flow preset behavior carries TODO, plan-mode web, batch webfetch, four-tier approval ladder, web tool visibility, strict read_only/no-network options, blocked/unavailable payload fields, and skill/lsp/question/todo/web keys through permission presets."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-038
- PS-039
unblocks: []
acceptance_criteria:
- "PS-040 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: ask_flow_preset_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0034
preserved_exact_tokens:
- "todowrite"
- "todoread"
- "blanket-denied"
- "Batch webfetch canon"
- "four-tier approval ladder"
- "question default allow only when HITL is available"
- "six web tools"
- "read_only/no-network"
- "skill"
- "lsp"
- "question"
- "todo"
- "web"
negative_constraints:
- "Plan-mode permission behavior removes web tools from any blanket deny."
preserved_contractrefs: []
compatibility_only_notes:
- "TODO behavior is locked so todowrite and todoread use the normalized TODO schema."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-041 - Approval Ladder Durable Always Path

```yaml
plan_unit_id: PS-041
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Approval UI preserves deny, once, for session, and always; once approves only the current invocation, for session creates an ephemeral session-cache allow under approval_scope_key, and always creates a revocable project or global rule through canonical permissions storage."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-019
- PS-023
- PS-027
unblocks: []
acceptance_criteria:
- "PS-041 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: approval_ladder_durable_always
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "Approval UX, recovery, and audit visibility"
- "deny"
- "once"
- "for session"
- "always"
- "approval_scope_key"
- "Project"
- "Global"
- "canonical permissions storage"
- "FileSafe allowlists"
- "one-off UI side effects"
negative_constraints:
- "Durable approval must not be implemented through ad-hoc FileSafe allowlists or one-off UI side effects."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-042 - Blocked Recovery Payload Routing

```yaml
plan_unit_id: PS-042
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Blocked-action recovery uses blocked_reason_code plus ordered allowed_action_ids and surfaces only canonical actions for permission policy, FileSafe, unavailable MCP, unavailable providers/services, and headless ask denial."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-008
unblocks: []
acceptance_criteria:
- "PS-042 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: blocked_recovery_action_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "Blocked-action recovery"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "FileSafe"
- "unavailable MCP"
- "unavailable providers"
- "headless ask denial"
- "open_permissions"
- "open_filesafe_settings"
- "approve_once"
- "filesafe_add_rule"
negative_constraints:
- "Blocked recovery must be direct rather than a passive error string."
- "UI surfaces render only canonical allowed actions."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FileSafe.md"
- "Plans/FinalGUISpec.md"
```

### PS-043 - Permission Evidence Audit Visibility

```yaml
plan_unit_id: PS-043
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission prompts, denials, approvals, and blocked outcomes write operational evidence to the audit stream and appear in both concise collapsible thread transparency and a dedicated log/audit inspector."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-007
unblocks: []
acceptance_criteria:
- "PS-043 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_audit_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "Permission prompts"
- "denials"
- "approvals"
- "blocked outcomes"
- "audit stream"
- "concise, collapsible in-thread transparency"
- "dedicated log/audit inspector"
- "search"
- "filtering"
- "drill-down"
- "on-demand payload reads"
negative_constraints:
- "Chat transparency must not be the only place to inspect operational history."
- "The dedicated inspector must not replace lightweight thread transparency."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-044 - Question TODO Task Permission Boundary

```yaml
plan_unit_id: PS-044
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Question, todowrite, todoread, user-facing task behavior, and todo-tool availability keep schemas in their owner contracts while Permissions owns allow/ask/deny posture, inherited ceilings, blocked/unavailable payloads, and audit visibility."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-040
unblocks: []
acceptance_criteria:
- "PS-044 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: question_todo_task_permission_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "question"
- "todowrite"
- "todoread"
- "task"
- "todo-tool"
- "Deep Plan markdown"
- "normalized TODO projection"
- "active thread/run"
negative_constraints:
- "The permission layer must not redefine question, TODO, or task schemas locally."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/assistant-chat-design.md"
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### PS-045 - Batch Web Approval Inputs And Timeout

```yaml
plan_unit_id: PS-045
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Batch web approval preserves domain prompt semantics, required URL list bounds, concurrency limits, continue_on_error default, For Session domain grants, and locked batch timeout formula individual_timeout times min(url_count, 5) capped at 600 seconds."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-031
unblocks: []
acceptance_criteria:
- "PS-045 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: batch_web_approval_timeout
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "single confirmation prompt showing all unique domains in the batch"
- "urls: string[]"
- "min 1, max 50"
- "concurrency?: number"
- "default 3"
- "max 10"
- "continue_on_error?: boolean"
- "default true"
- "For Session grants all listed domains for that session"
- "individual_timeout × min(url_count, 5)"
- "cap 600s"
negative_constraints:
- "Batch timeout formula is locked and must not be silently replaced."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-046 - HITL Approval Scope Fields And Labels

```yaml
plan_unit_id: PS-046
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Shared HITL approval ladder alignment carries approval_scope_key, blocked_sequence, execution_entity_id, lane_id, package_id, account_id, Deny/Once/For session/Always labels, and ordered allowed actions without same-session widening."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-005
- PS-042
unblocks: []
acceptance_criteria:
- "PS-046 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: hitl_approval_scope_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "Shared approval-ladder alignment"
- "approval_scope_key"
- "blocked_sequence"
- "execution_entity_id"
- "lane_id"
- "package_id"
- "account_id"
- "Deny"
- "Once"
- "For session"
- "Always"
- "ordered `allowed_action_ids[]`"
- "lane/package/account scope"
negative_constraints:
- "Approval scope must not silently become same-session if lanes are parallel."
- "Session-wide approval policy must remain distinct from blocked-episode approval."
preserved_contractrefs:
- "ContractRef: Plans/human-in-the-loop.md#Shared approval-ladder alignment (2026-04-04)"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/human-in-the-loop.md"
```

### PS-047 - Plan Mode And Read Only Default Split

```yaml
plan_unit_id: PS-047
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Plan mode and Read-only are distinct permission concepts: Plan may allow information-gathering read/search/question/web operations while denying mutation, and strict read_only/no-network may deny web operations explicitly."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-020
- PS-040
unblocks: []
acceptance_criteria:
- "PS-047 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: plan_readonly_default_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0036
preserved_exact_tokens:
- "Deterministic defaults"
- "Plan mode"
- "Read-only preset"
- "deny-all-except-read"
- "information-gathering tools"
- "external-read web work"
- "websearch"
- "webresearch"
- "webfetch"
- "webextract"
- "webcrawl"
- "webmap"
- "read_only"
- "plan"
negative_constraints:
- "Plan mode must not be treated as deny-all-except-read."
- "Entering plan mode must not auto-deny web operations as a family."
- "read_only and plan must not be treated as synonyms."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-048 - Permission Settings Web Rows And Provider Help

```yaml
plan_unit_id: PS-048
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission settings surfaces render web tool rows individually, granular editor help includes host/domain pattern examples, session help explains wildcard versus host-scoped approval, and provider settings explain API-key and fallback ordering behavior."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-047
unblocks: []
acceptance_criteria:
- "PS-048 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_settings_web_rows_provider_help
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0036
preserved_exact_tokens:
- "Permission settings surfaces"
- "web tool rows individually"
- "https://docs.rs/*"
- "https://developer.mozilla.org/*"
- "/crawl/map/read"
- "Exa"
- "Tavily"
- "Firecrawl"
- "DuckDuckGo fallback"
- "provider ordering"
negative_constraints:
- "Provider fallback help must not imply that API-key requirements are uniform across providers."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-049 - Automation First And Deterministic Gate Wording

```yaml
plan_unit_id: PS-049
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Automation-first is the baseline permission posture for non-interactive execution; compatibility defaults and nondeterministic gate phrases are compatibility notes only and do not weaken required owner-doc enforcement."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-047
unblocks: []
acceptance_criteria:
- "PS-049 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: automation_first_gate_wording
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0036
preserved_exact_tokens:
- "Automation-first"
- "non-interactive execution"
- "HTE-by-default"
- "visible-first local runs"
- "regular"
- "/HTE"
- "visual_mode = auto"
- "mandatory approvals"
- "allowed_action_ids[]"
- "Execution contract (recommended)"
- "targeted for future enforcement"
negative_constraints:
- "Compatibility defaults must not silently prefer visible runs or mandatory approvals when effective policy supports automation-first execution."
- "Nondeterministic gate language does not weaken required owner-doc enforcement."
preserved_contractrefs: []
compatibility_only_notes:
- "HTE-by-default, visible-first local runs, regular, /HTE, and visual_mode = auto are compatibility defaults in this context."
- "Execution contract (recommended) and targeted for future enforcement are compatibility notes only."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-050 - Resolution Algorithm Composition

```yaml
plan_unit_id: PS-050
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission resolution composes precedence layers with dispatch checks by building invocation context, applying mode and scoped layers, running non-bypassable guards and capability gates, persisting requested/effective evidence, rechecking hook mutations, and dispatching only final allow outcomes."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-020
- PS-021
- PS-022
- PS-026
- PS-036
unblocks: []
acceptance_criteria:
- "PS-050 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_resolution_algorithm
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0038
preserved_exact_tokens:
- "Resolution algorithm"
- "Composition with precedence layers"
- "mode layer"
- "ask"
- "plan"
- "yolo"
- "non-bypassable guards"
- "requested_permission_state"
- "effective_permission_state"
- "downgrade_reason"
- "permission_snapshot_id?"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "Dispatch only when the final effective decision is allow"
negative_constraints:
- "ask, deny, blocked, unavailable, or capability-failed outcomes must emit audit evidence and must not call the underlying tool."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Run_Modes.md"
- "Plans/Tools.md"
- "Plans/Executor_Protocol.md"
- "Plans/Contracts_V0.md"
```

### PS-051 - Banned Command Full String Check

```yaml
plan_unit_id: PS-051
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Banned-command evaluation scans the full command string, including shell metacharacters and substitution forms, and denies commands whose arguments contain banned destructive sequences even when the first token is allowed."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-024
unblocks: []
acceptance_criteria:
- "PS-051 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: banned_command_full_string
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0039
preserved_exact_tokens:
- "Banned-command full-string check"
- "full command string"
- "first token"
- ";"
- "&&"
- "||"
- "|"
- "$()"
- "backticks"
- "First-token-only checking is prohibited"
negative_constraints:
- "First-token-only checking is prohibited."
- "A command that passes a first-token allowlist but contains a banned destructive sequence in arguments is still denied."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FileSafe.md"
- "Plans/Tools.md"
- "Plans/Executor_Protocol.md"
- "Plans/Architecture_Invariants.md"
```

### PS-052 - Hook Recheck Before Dispatch

```yaml
plan_unit_id: PS-052
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Arg-touching hooks require permission checks on the original invocation and the modified invocation before dispatch, in the required order from context normalization through final dispatch."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-016
- PS-050
unblocks: []
acceptance_criteria:
- "PS-052 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: hook_recheck_before_dispatch
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0040
preserved_exact_tokens:
- "Hook re-check and execution-path invariance"
- "policy.may_execute_tool()"
- "arg-touching hooks"
- "Re-run permission checks"
- "Dispatch only if the re-check passes"
negative_constraints:
- "The dispatch layer must not call the underlying tool implementation until both checks pass on the final argument set."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
- "Plans/Executor_Protocol.md"
- "Plans/Architecture_Invariants.md"
```

### PS-053 - Shell Isolation Owner Boundary

```yaml
plan_unit_id: PS-053
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Shell and session process environment isolation is jointly owned by orchestrator-subagent integration and Tools; Permissions consumes that invariant for agent and crew execution context without defining shell lifecycle behavior."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-050
unblocks: []
acceptance_criteria:
- "PS-053 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: shell_isolation_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0041
preserved_exact_tokens:
- "Shell environment isolation routing"
- "shell/session processes"
- "jointly owned"
- "agent/crew execution context"
- "does not define shell lifecycle behavior itself"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/Tools.md"
```

### PS-054 - Cleanup Sensitive Retention Approval Gate

```yaml
plan_unit_id: PS-054
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Cleanup-sensitive approval and retention checks are permission-visible: active-run ownership, unresolved blocked recovery, required safe-point restore, unresolved conflict inspection, or newer lineage dependency keep targets retained, suspect, or restoring rather than cleanup_eligible."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-042
- PS-053
unblocks: []
acceptance_criteria:
- "PS-054 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: cleanup_retention_approval_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0041
preserved_exact_tokens:
- "Cleanup-sensitive approval"
- "retention checks"
- "active-run ownership"
- "unresolved blocked recovery"
- "required safe-point restore"
- "unresolved conflict inspection"
- "newer lineage dependency"
- "retained"
- "suspect"
- "restoring"
- "cleanup_eligible"
negative_constraints:
- "Approval cards must not offer destructive cleanup as if age alone made it safe."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-055 - Permission Storage Layer Stack

```yaml
plan_unit_id: PS-055
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission configuration is stored across durable global, project, and persona layers plus an ephemeral in-memory session layer with the specified locations, TOML format, and lifetimes."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-020
- PS-021
unblocks: []
acceptance_criteria:
- "PS-055 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_storage_layers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0042
preserved_exact_tokens:
- "Persistence and storage"
- "PERSISTENCE"
- "Global"
- "Project"
- "Persona"
- "Session"
- "~/.config/puppet-master/permissions.toml"
- "<project_root>/.puppet-master/permissions.toml"
- "default_permissions_profile"
- "permission-profiles"
- "In-memory session cache"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Personas.md#STORAGE-LAYOUT"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Decision_Policy.md"
- "Plans/Personas.md"
```

### PS-056 - Durable Approval Record Metadata

```yaml
plan_unit_id: PS-056
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Durable approvals created through create_project_rule or create_global_rule persist in their owning config layer as metadata-bearing records with tool_pattern, action, optional scope_key, created_at, and created_by_thread_id."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-041
- PS-055
unblocks: []
acceptance_criteria:
- "PS-056 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: durable_approval_record_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0042
preserved_exact_tokens:
- "create_project_rule"
- "create_global_rule"
- "metadata-bearing records"
- "tool_pattern"
- "action"
- "scope_key?"
- "created_at"
- "created_by_thread_id"
- "File-level TOML projections"
negative_constraints:
- "Simpler per-tool TOML projections must not replace stored rule identity and audit metadata."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-057 - TOML Permission Config Format

```yaml
plan_unit_id: PS-057
unit_type: reference
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permissions TOML format examples preserve simple per-tool permissions, granular object syntax, special guard actions, external directory allowlist, and doom loop threshold override."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-055
unblocks: []
acceptance_criteria:
- "PS-057 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: toml_permission_format
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0043
preserved_exact_tokens:
- "TOML format"
- "[tools]"
- "read = \"allow\""
- "edit = \"ask\""
- "bash = \"ask\""
- "webfetch = \"allow\""
- "[tools.bash]"
- "git *"
- "npm *"
- "rm *"
- "[tools.read]"
- "*.env"
- "*.env.*"
- "*.env.example"
- "[guards]"
- "doom_loop"
- "external_directory"
- "external_publish_side_effect"
- "[guards.external_directory]"
- "[guards.doom_loop]"
- "threshold = 3"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-058 - Redb Tool Permissions Projection

```yaml
plan_unit_id: PS-058
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The resolved active-session permission set may be persisted to redb config:v1 under tool_permissions only as a compatibility projection; TOML files remain the durable source of truth."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-055
unblocks: []
acceptance_criteria:
- "PS-058 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: redb_tool_permissions_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0044
preserved_exact_tokens:
- "Config key in redb"
- "config:v1"
- "tool_permissions"
- "Plans/Tools.md §10.1"
- "TOML files"
- "durable source of truth"
- "redb key"
- "projection"
negative_constraints:
- "The redb tool_permissions key must not become the durable source of truth."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md"
compatibility_only_notes:
- "The redb key is a compatibility projection for the existing config schema."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
```

### PS-059 - Effective State Disclosure And Stale Projection Gate

```yaml
plan_unit_id: PS-059
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission effective-state disclosure separates inherited, overridden, requested, effective, honored, skipped, clamped, projection_freshness, and projection_health, and stale or degraded projections do not become authoritative or bypass mutating-action revalidation."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-022
- PS-042
unblocks: []
acceptance_criteria:
- "PS-059 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: effective_state_disclosure_projection_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0045
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0046
preserved_exact_tokens:
- "GUI requirements"
- "Effective-state disclosure requirements"
- "inherited / overridden"
- "requested"
- "effective"
- "honored / skipped / clamped"
- "projection_freshness"
- "projection_health"
- "allowed_action_ids[]"
- "blocked-episode identity"
- "legacy request-era fields"
negative_constraints:
- "Stale or degraded projections do not become authoritative just because they are visible in the UI."
- "Mutating actions must revalidate or gate when permission-relevant projections are stale, degraded, or unavailable."
- "Blocked/recovery action visibility must use allowed_action_ids[] and blocked-episode identity rather than legacy request-era fields."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md"
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/FinalGUISpec.md"
compatibility_only_notes:
- "Legacy request-era fields are compatibility only and must not replace allowed_action_ids[] and blocked-episode identity."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Decision_Policy.md"
- "Plans/Prompt_Pipeline.md"
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
- "Plans/human-in-the-loop.md"
- "Plans/FinalGUISpec.md"
```

### PS-060 - Debug Automation Profile Disclosure

```yaml
plan_unit_id: PS-060
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Requested and effective Debug Automation Profile state is disclosed in active Debug headers, detailed inspectors, the Permissions surface, and recovery banners, including grant origin, scope, capability groups, degraded or blocked reasons, and expiry or revocation state."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-022
- PS-042
- PS-059
unblocks: []
acceptance_criteria:
- "PS-060 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: debug_profile_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0047
preserved_exact_tokens:
- "Debug Automation Profile disclosure"
- "investigation_id"
- "front_door_approval"
- "revalidated_after_resume"
- "not_granted"
- "requested capability groups"
- "effective capability groups"
- "active"
- "degraded"
- "blocked"
- "expiry / revocation state"
negative_constraints:
- "High-risk actions outside the profile must continue to surface explicit confirmation UI instead of being described as silently covered by the profile."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
- "ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
- "Plans/human-in-the-loop.md"
- "Plans/Section15_MVP_Promoted_Features_Spec.md"
- "Plans/assistant-chat-design.md"
```

### PS-061 - Debug Profile Run Scoped Grant Boundary

```yaml
plan_unit_id: PS-061
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Debug Automation Profile grants are run-scoped and investigation-scoped rather than durable global/static permission layers, and expire unless a separate durable permission rule is explicitly approved."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-055
- PS-060
unblocks: []
acceptance_criteria:
- "PS-061 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: debug_profile_run_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0048
preserved_exact_tokens:
- "Debug profile target binding and reason codes"
- "run-scoped"
- "/static"
- "front-door approval"
- "resume revalidation"
- "no grant"
- "global"
- "project"
- "Persona"
- "default profile layers"
negative_constraints:
- "The Debug Automation Profile must not be appended to global, project, Persona, or default profile layers as durable static policy."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-062 - Debug Profile Target Binding And Verification Disclosure

```yaml
plan_unit_id: PS-062
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Debug Investigation Context records stop, attention, blocked, and budget reason codes; target binding is deterministic, unresolved same-tier ties enter attention_required, strong verification is required for automated debug resolution, and remote/dev-session sections disclose requested/effective capability differences."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-061
- PS-049
unblocks: []
acceptance_criteria:
- "PS-062 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: debug_profile_target_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0048
preserved_exact_tokens:
- "stop_reason_code"
- "attention_required_reason_code"
- "blocked_reason_code"
- "budget_kind"
- "target_selection_required"
- "verification_strength=strong"
- "/prototyping"
- "/output"
- "attention_required"
- "failed"
- "failed_cleanup"
negative_constraints:
- "PM must not guess a target under the Debug Automation Profile."
- "Weaker or missing verification remains attention_required, failed, or failed_cleanup according to investigation state."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Section15_MVP_Promoted_Features_Spec.md"
- "Plans/assistant-chat-design.md"
```

### PS-063 - Dedicated Permissions Settings Tab

```yaml
plan_unit_id: PS-063
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Settings includes a dedicated Permissions tab whose sections are provided as collapsible cards."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-059
unblocks: []
acceptance_criteria:
- "PS-063 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permissions_tab_structure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0049
preserved_exact_tokens:
- "Dedicated Permissions tab"
- "Permissions"
- "Settings"
- "collapsible cards"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-064 - Global Defaults And Per Tool Overrides UI

```yaml
plan_unit_id: PS-064
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The Permissions UI includes a global wildcard default dropdown and a per-tool overrides table with tool category, action dropdown, granular expand affordance, and inline inherited, overridden, and effective provenance."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-038
- PS-055
- PS-063
unblocks: []
acceptance_criteria:
- "PS-064 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permissions_global_tool_overrides
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0050
preserved_exact_tokens:
- "Global defaults + per-tool overrides"
- "Allow"
- "Ask"
- "Deny"
- "Global wildcard default"
- "Per-tool overrides"
- "category badge"
- "expand chevron"
- "Inherited"
- "Overridden"
- "Effective"
- "/inheritance/fallback"
negative_constraints:
- "Override display is inline, not modal-only."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
- "Plans/FinalGUISpec.md"
```

### PS-065 - Granular Rule Editor UI

```yaml
plan_unit_id: PS-065
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Expanded tool rows expose an ordered granular rule editor with pattern/action entries, Add rule, reorder handles, delete controls, wildcard input help, and last-match-wins ordering."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-023
- PS-024
- PS-064
unblocks: []
acceptance_criteria:
- "PS-065 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: granular_rule_editor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0051
preserved_exact_tokens:
- "Granular rule editor"
- "{pattern, action}"
- "Add rule"
- "Ask"
- "Drag handles"
- "last-match-wins"
- "Delete button"
- "*"
- "?"
- "wildcard syntax"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-066 - Permission Preset Approval Contract

```yaml
plan_unit_id: PS-066
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission preset surfaces preserve the four-tier approval ladder, HITL-gated question default allow, independently visible ask-gated web tools, strict read_only/no-network denial options, and blocked/unavailable payload fields."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-019
- PS-040
- PS-041
- PS-042
unblocks: []
acceptance_criteria:
- "PS-066 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_preset_approval_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0052
preserved_exact_tokens:
- "Presets"
- "four-tier approval ladder"
- "question default `allow` only when HITL is available"
- "six web tools"
- "ask-gated"
- "read_only/no-network"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "status: \"unavailable\""
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/human-in-the-loop.md"
```

### PS-067 - Read Only And Full Preset Key Matrix

```yaml
plan_unit_id: PS-067
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Read-only and full presets preserve explicit allow, ask, and deny key families across read/search/skill/lsp/question/todo/web/task/media/import tools and keep preset tables aligned with mode-override text."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-038
- PS-047
- PS-066
unblocks: []
acceptance_criteria:
- "PS-067 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_preset_key_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0052
preserved_exact_tokens:
- "Read-only preset reconciliation"
- "Full preset reconciliation"
- "read_only"
- "plan"
- "webfetch"
- "websearch"
- "webextract"
- "webresearch"
- "webcrawl"
- "webmap"
- "lsp(ro)"
- "/question/todoread/todowrite/capabilities.get"
- "repo.import"
- "media.generate"
negative_constraints:
- "Plan-mode wording must not imply blanket denial of tools expected during planning or research."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-068 - External Directory Allowlist Manager UI

```yaml
plan_unit_id: PS-068
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The external directory allowlist manager provides a scrollable wildcard path list, Add path input with optional native directory picker, per-row delete, and resolved home expansion display."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-026
- PS-035
- PS-063
unblocks: []
acceptance_criteria:
- "PS-068 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_directory_allowlist_manager
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0053
preserved_exact_tokens:
- "External directory allowlist manager"
- "external directory allowlist"
- "Scrollable list"
- "wildcard support"
- "Add path"
- "native directory picker"
- "Per-row delete"
- "Home expansion display"
- "~ patterns"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FileSafe.md"
- "Plans/FinalGUISpec.md"
```

### PS-069 - Doom Loop Policy Display Config

```yaml
plan_unit_id: PS-069
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The doom_loop policy card shows current allow, ask, or deny action, a repeat threshold spinner with default 3 and range 2-10, and explanation text for identical-input repeat triggering."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-034
- PS-063
unblocks: []
acceptance_criteria:
- "PS-069 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: doom_loop_policy_display_config
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0054
preserved_exact_tokens:
- "doom_loop"
- "policy display/config"
- "allow"
- "ask"
- "deny"
- "Repeat threshold"
- "spinner"
- "default 3"
- "range 2–10"
- "same tool is called with identical input N consecutive times"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-070 - Per Persona Override Editor

```yaml
plan_unit_id: PS-070
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Persona-specific permission profiles are listed, created, edited, and deleted from the Permissions surface, with tool override counts and default_permissions_profile integration in Persona management."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-055
- PS-063
unblocks: []
acceptance_criteria:
- "PS-070 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: persona_permission_profile_editor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0055
preserved_exact_tokens:
- "Per-Persona override editor"
- "permission-profiles"
- "Create profile"
- "tool count"
- "edit/delete"
- "Plans/Personas.md §4"
- "default_permissions_profile"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Personas.md"
- "Plans/FinalGUISpec.md"
```

### PS-071 - Permission Scope Selector UI

```yaml
plan_unit_id: PS-071
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The Permissions scope selector exposes Global, Project, Package, Seam, and Lane scopes when applicable, prevents orphan project rules when no project is active, saves selected scope files, and displays effective layer-of-origin badges."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-021
- PS-055
- PS-064
unblocks: []
acceptance_criteria:
- "PS-071 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_scope_selector_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0056
preserved_exact_tokens:
- "Scope selector"
- "Global"
- "Project"
- "Package"
- "Seam"
- "Lane"
- "/disabled"
- "selected scope"
- "layer-of-origin badges"
- "project-scoped rules"
negative_constraints:
- "Durable always approval scope selection must not offer Project when no active project context exists."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
- "Plans/FinalGUISpec.md"
```

### PS-072 - Cross Surface Permission Mutation Parity

```yaml
plan_unit_id: PS-072
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Settings GUI, command palette, API/CLI, and automation surfaces all mutate permission rules through the same canonical permission commands and storage records."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-056
- PS-071
unblocks: []
acceptance_criteria:
- "PS-072 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_mutation_command_storage_parity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0056
preserved_exact_tokens:
- "Settings GUI"
- "command-palette"
- "API/CLI"
- "automation surfaces"
- "canonical permission commands"
- "storage records"
- "durable approval creation"
- "revocation"
- "inspection"
negative_constraints:
- "GUI-only affordances must not become the sole management path for durable approval creation, revocation, or inspection."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
- "Plans/UI_Command_Catalog.md"
- "Plans/Commands_System.md"
```

### PS-073 - Permissions ELI5 Expert Copy Modes

```yaml
plan_unit_id: PS-073
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permissions UI follows app-level Expert and ELI5 Interaction Mode, with simplified ELI5 views and full Expert sections plus tooltip.permissions.* tooltip namespace."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-063
unblocks: []
acceptance_criteria:
- "PS-073 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permissions_copy_mode
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0057
preserved_exact_tokens:
- "ELI5/Expert copy"
- "Interaction Mode"
- "Expert/ELI5"
- "ELI5"
- "Expert"
- "tooltip.permissions.*"
- "Granular rules"
- "profile editor"
- "allowlist manager"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-074 - Permission Trust Boundaries Threat Model

```yaml
plan_unit_id: PS-074
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The security model defines the Permissions trust boundaries across user intent, runtime policy/projection/audit machinery, tool execution backends, and external services, and tracks prompt injection, privilege escalation, and data exfiltration threats."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-015
- PS-017
unblocks: []
acceptance_criteria:
- "PS-074 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_threat_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0058
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0059
preserved_exact_tokens:
- "Security model"
- "Trust boundaries and threat model"
- "user intent"
- "explicit approval surfaces"
- "Puppet Master runtime policy"
- "projection"
- "audit machinery"
- "tool execution backends"
- "external services"
- "Prompt injection"
- "Privilege escalation"
- "Data exfiltration"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-075 - Capability Gates And Sandbox Boundaries

```yaml
plan_unit_id: PS-075
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission allow is necessary but insufficient: tools must be capability-registered, unregistered tools remain non-runnable, file tools stay scoped to roots unless policy broadens access, and web tools honor domain allowlists and web-operation scope keys."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-017
- PS-028
- PS-035
unblocks: []
acceptance_criteria:
- "PS-075 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: capability_sandbox_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0060
preserved_exact_tokens:
- "Capability gates and sandbox boundaries"
- "capability-registered"
- "permission-allowed"
- "unregistered tools"
- "non-runnable"
- "bash"
- "project root"
- "working roots"
- "domain allowlists"
- "web-operation scope keys"
negative_constraints:
- "Unregistered tools remain non-runnable even if a rule says allow."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
- "Plans/FileSafe.md"
```

### PS-076 - Permission Audit Trail Records

```yaml
plan_unit_id: PS-076
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Every operationally meaningful permission grant, deny, or prompt writes a seglog audit record with at least tool_pattern, decision, scope, and requesting_context."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-043
- PS-055
unblocks: []
acceptance_criteria:
- "PS-076 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_audit_trail
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0061
preserved_exact_tokens:
- "Audit trail"
- "seglog"
- "tool_pattern"
- "decision"
- "scope"
- "requesting_context"
- "durable-rule creation"
- "inherited narrowing"
- "denied/externalized execution attempts"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
```

### PS-077 - OpenCode Reference Boundary

```yaml
plan_unit_id: PS-077
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "External OpenCode behavior is reference-only and may inform terminology, but it does not override PM-native terminology, approval ladder, preset matrix, or batch permission behavior owned by Permissions."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-002
- PS-019
- PS-040
unblocks: []
acceptance_criteria:
- "PS-077 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: opencode_reference_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0062
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0063
preserved_exact_tokens:
- "OpenCode baseline and Puppet Master deltas"
- "External OpenCode behavior"
- "reference-only"
- "PM-native terminology"
- "approval ladder"
- "preset matrix"
- "batch permission behavior"
negative_constraints:
- "External design evidence does not override Puppet Master permission canon."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md"
compatibility_only_notes:
- "External OpenCode examples are terminology and lineage reference only."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Run_Modes.md"
- "Plans/Tools.md"
```

### PS-078 - Puppet Master Permission Deltas

```yaml
plan_unit_id: PS-078
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Puppet Master permission deltas preserve deny, once, for session, and always actions, keep read-only and plan web operations at ask, and make batch web For Session grants domain-scoped for all unique domains in scope."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-019
- PS-031
- PS-047
unblocks: []
acceptance_criteria:
- "PS-078 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: pm_permission_deltas
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0064
preserved_exact_tokens:
- "Puppet Master deltas"
- "deny | once | for session | always"
- "read-only"
- "plan web operations"
- "ask"
- "batch web approvals"
- "all unique domains"
- "For Session"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-079 - Deny Scope Acceptance Alignment

```yaml
plan_unit_id: PS-079
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "AC-PM07 binds deny response cascade to the current blocked episode and only to other pending asks with exactly matching approval_scope_key."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-005
- PS-006
- PS-042
unblocks: []
acceptance_criteria:
- "PS-079 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: deny_scope_acceptance_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0065
preserved_exact_tokens:
- "AC-PM07"
- "deny"
- "current blocked episode"
- "pending asks"
- "approval_scope_key"
negative_constraints:
- "Deny cannot reject nonmatching pending asks."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-080 - Deterministic Resolution Acceptance Group

```yaml
plan_unit_id: PS-080
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Acceptance criteria AC-PM01, AC-PM02, AC-PM03, AC-PM10, AC-PM13, and AC-PM14 cover deterministic resolution, precedence layer ordering, last-match wins, mode override behavior, scope specificity, and context narrowing."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-020
- PS-021
- PS-024
- PS-047
- PS-050
unblocks: []
acceptance_criteria:
- "PS-080 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: deterministic_resolution_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0066
preserved_exact_tokens:
- "Acceptance criteria"
- "ACCEPTANCE"
- "AC-PM01"
- "AC-PM02"
- "AC-PM03"
- "AC-PM10"
- "AC-PM13"
- "AC-PM14"
- "deterministic"
- "Persona override"
- "last-match-wins"
- "yolo"
- "ask/plan"
- "lane"
- "seam"
- "package"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Progression_Gates.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Progression_Gates.md"
```

### PS-081 - Guard Defaults And Web Key Acceptance Group

```yaml
plan_unit_id: PS-081
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Acceptance criteria AC-PM04, AC-PM05, AC-PM08, and AC-PM12 cover doom_loop, external_directory, .env deny defaults, and derived web-operation permission keys."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-028
- PS-034
- PS-035
- PS-047
unblocks: []
acceptance_criteria:
- "PS-081 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: guard_default_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0066
preserved_exact_tokens:
- "AC-PM04"
- "AC-PM05"
- "AC-PM08"
- "AC-PM12"
- "doom_loop"
- "external_directory"
- ".env"
- ".env.*"
- ".env.example"
- "webextract:{domain}"
- "webresearch:{query_category}"
- "webcrawl:{domain}"
- "webmap:{domain}"
- "registrable-domain"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Progression_Gates.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Progression_Gates.md"
```

### PS-082 - Approval Persistence And GUI Acceptance Group

```yaml
plan_unit_id: PS-082
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Acceptance criteria AC-PM06, AC-PM09, and AC-PM11 cover always approval scope, Permissions tab display/edit/persist behavior, durable approval record persistence, restart survival, and revocation."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-041
- PS-056
- PS-063
- PS-064
- PS-065
- PS-071
unblocks: []
acceptance_criteria:
- "PS-082 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: approval_gui_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0066
preserved_exact_tokens:
- "AC-PM06"
- "AC-PM09"
- "AC-PM11"
- "Settings → Permissions"
- "cmd.permissions.revoke"
- "tool_pattern"
- "action"
- "scope_key?"
- "created_at"
- "created_by_thread_id"
negative_constraints:
- "always must not create a blind session-wide allow."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Progression_Gates.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Progression_Gates.md"
- "Plans/FinalGUISpec.md"
```

### PS-083 - Capability Gate And Audit Acceptance

```yaml
plan_unit_id: PS-083
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Acceptance criterion AC-PM15 requires permission execution to be capability-gated as well as permission-gated and requires seglog audit entries for grants, denials, and prompts with tool_pattern, decision, scope, and requesting_context."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-075
- PS-076
unblocks: []
acceptance_criteria:
- "PS-083 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: capability_audit_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0066
preserved_exact_tokens:
- "AC-PM15"
- "capability-gated"
- "permission-gated"
- "seglog"
- "grant"
- "deny"
- "prompt"
- "tool_pattern"
- "decision"
- "scope"
- "requesting_context"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Progression_Gates.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Progression_Gates.md"
- "Plans/storage-plan.md"
```

### PS-084 - External Publish Addendum Guard Coverage

```yaml
plan_unit_id: PS-084
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The DockerHub and Unraid addendum extends special-guard, tool-key, and default sections for remote publication and managed template-repo mutation coverage, reinforcing external_publish_side_effect rather than creating a rival owner."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-033
- PS-036
unblocks: []
acceptance_criteria:
- "PS-084 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_addendum_coverage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0067
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0068
preserved_exact_tokens:
- "DockerHub / Unraid remote-side-effect guard addendum"
- "external_publish_side_effect"
- "DockerHub repository creation"
- "DockerHub image push"
- "managed remote template repo"
- "remote push"
- "publication visibility"
- "remote repository state"
- "remote distribution state"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- "This source addendum reinforces PS-036 and does not create a competing owner for external publish guard semantics."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-085 - External Publish Non Bypassable Behavior

```yaml
plan_unit_id: PS-085
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Local build approval and enabled defaults do not approve later remote publication, external_publish_side_effect defaults to ask, is non-bypassable, and cannot be globally suppressed by yolo or session-scoped always approvals."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-036
- PS-084
unblocks: []
acceptance_criteria:
- "PS-085 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_non_bypassable_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0069
preserved_exact_tokens:
- "push_policy = after_build"
- "Default action: ask"
- "non-bypassable"
- "yolo"
- "Session-scoped always"
- "Build click"
- "remote publication"
- "enabled defaults"
negative_constraints:
- "yolo mode must not auto-allow external_publish_side_effect."
- "Session-scoped always approvals must not suppress this guard globally."
- "Earlier local-only actions or enabled defaults do not implicitly approve follow-on remote side effects."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-086 - Exact Publish Action Approval UI Examples

```yaml
plan_unit_id: PS-086
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Direct user clicks approve only the exact publish, create, or push side effect requested, preserving examples that Push image does not auto-approve creating a missing DockerHub repo or pushing a managed Unraid template repo unless that was the exact action."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-037
- PS-085
unblocks: []
acceptance_criteria:
- "PS-086 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: exact_publish_action_approval
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0069
preserved_exact_tokens:
- "direct user click"
- "exact publish/create/push button"
- "Push image"
- "DockerHub repo"
- "managed Unraid template repo"
- "one requested side effect only"
- "Follow-on side effects"
negative_constraints:
- "One clicked publish action cannot auto-approve different follow-on side effects."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-087 - External Publish Failure Preservation

```yaml
plan_unit_id: PS-087
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "When the external publish guard is rejected, local build results and template edits remain intact, remote side effects do not execute, and the runtime surfaces a corrected error naming the blocked remote step."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-037
- PS-085
unblocks: []
acceptance_criteria:
- "PS-087 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_failure_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0070
preserved_exact_tokens:
- "Failure behavior"
- "local build results remain intact"
- "local template generation/editing remains intact"
- "remote side effects do not execute"
- "corrected error"
- "blocked remote step"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
```

### PS-088 - External Publish Key And Default Additions

```yaml
plan_unit_id: PS-088
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The tool and special-guard key list and defaults table include external_publish_side_effect as a Guard with default ask for remote publication and remote repository mutation."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-033
- PS-038
- PS-057
- PS-084
unblocks: []
acceptance_criteria:
- "PS-088 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_key_default_additions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0071
preserved_exact_tokens:
- "Canonical key/default additions"
- "Key"
- "Category"
- "Scope"
- "Notes"
- "Default"
- "Rationale"
- "external_publish_side_effect"
- "Guard"
- "Remote publication and remote repo mutation"
- "ask"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
```

### PS-089 - Policy Denied Outcomes Are Blocked Outcomes

```yaml
plan_unit_id: PS-089
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "When the permission layer prevents execution, runtime treats the result as blocked or denied rather than generic failure, including deny rules, user ask rejection, headless ask-to-deny, and external_publish_side_effect blocks."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-042
- PS-076
- PS-084
unblocks: []
acceptance_criteria:
- "PS-089 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: policy_denied_blocked_outcome
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0072
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0073
preserved_exact_tokens:
- "Runtime blocked-Outcome Integration Addendum (2026-03-08)"
- "Policy-denied outcomes are blocked outcomes"
- "blocked/denied"
- "generic failure"
- "deny rules"
- "user rejection of `ask`"
- "headless `ask -> deny`"
- "external_publish_side_effect blocks"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Contracts_V0.md"
- "Plans/storage-plan.md"
```

### PS-090 - Blocked Recovery Payload Schema And Alias Closure

```yaml
plan_unit_id: PS-090
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission blocked and denied outcomes expose canonical blocked-state payload fields, blocked family, guard details, allowed_action_ids[], optional approval and snapshot refs, revalidation status, and executed: false; legacy recovery_options[] and allowed_actions[] are compatibility aliases only."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-042
- PS-089
unblocks: []
acceptance_criteria:
- "PS-090 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: blocked_recovery_payload_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "blocked_family"
- "blocked_policy"
- "blocked_approval"
- "blocked_preflight"
- "blocked_governance"
- "blocked_reason_code"
- "guard_name?"
- "allowed_action_ids[]"
- "approval_scope_key?"
- "approval_target_ref?"
- "permission_snapshot_id?"
- "runtime_identity_context?"
- "revalidation_required?"
- "executed: false"
- "recovery_options[]"
- "allowed_actions[]"
negative_constraints:
- "Runtime payload field names are closed; legacy recovery_options[] and allowed_actions[] must not replace allowed_action_ids[] in new blocked or recovery payloads."
- "Prose-only recovery hints are non-conforming when allowed_action_ids[] are required."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes:
- "legacy recovery_options[] and allowed_actions[] are compatibility aliases only."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/assistant-chat-design.md"
- "Plans/Contracts_V0.md"
- "Plans/storage-plan.md"
- "Plans/Decision_Policy.md"
```

### PS-091 - Approval Surface Action Semantics

```yaml
plan_unit_id: PS-091
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Approval surfaces in chat, dialogs, and cards summarize the exact target, scope, and drift boundary while mapping UI labels to canonical one-shot approval, reusable scope or session approval when policy allows, and deny or decline semantics."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-031
- PS-042
- PS-090
unblocks: []
acceptance_criteria:
- "PS-091 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: blocked_recovery_action_surface_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "approval surfaces"
- "chat/dialogs/cards"
- "exact target"
- "scope"
- "drift boundary"
- "one-shot approval"
- "reusable scope/session approval"
- "deny/decline"
negative_constraints:
- "UI labels may vary, but exposed actions must map to canonical approval and deny semantics rather than local enum families."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/assistant-chat-design.md"
- "Plans/FinalGUISpec.md"
```

### PS-092 - Domain Sensitive Approval Classes

```yaml
plan_unit_id: PS-092
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Domain-sensitive operational sessions and remote mutations use separate permission classes, so generic tool allow, /session/YOLO, or headless defaults never approve SCM destructive actions, workflow admin CRUD, image or template publish, Kubernetes mutations, docker exec or attach, kubectl exec, or kubectl port-forward."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-018
- PS-037
- PS-084
- PS-085
unblocks: []
acceptance_criteria:
- "PS-092 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: domain_sensitive_approval_classes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "docker exec"
- "docker attach"
- "kubectl exec"
- "kubectl port-forward"
- "/force-push/prune/destructive"
- "workflow /cancel/rerun/admin CRUD"
- "image push"
- "repo create"
- "template push"
- "Kubernetes /delete/exec/port-forward"
- "domain approval class"
negative_constraints:
- "Generic tool allow, /session/YOLO, or headless defaults never approve domain-sensitive remote side effects."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
- "Plans/GitHub_API_Auth_and_Flows.md"
```

### PS-093 - Queued Approval Preflight Binding

```yaml
plan_unit_id: PS-093
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "/queued and background approval requests bind to the exact queued attempt, target, guard, and preflight snapshot; resumption can pause one node, block the run, or block a follow-on step, but it always re-runs preflight when target, policy, or permission snapshot may have changed."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-006
- PS-042
- PS-090
unblocks: []
acceptance_criteria:
- "PS-093 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: queued_approval_preflight_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "/queued"
- "background approval requests"
- "exact queued attempt"
- "target"
- "guard"
- "preflight snapshot"
- "re-runs preflight"
negative_constraints:
- "Approval reuse must not resume a queued attempt without re-running preflight when target, policy, or permission snapshot may have changed."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
```

### PS-094 - Per Target Mutating Operation Dedupe

```yaml
plan_unit_id: PS-094
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Mutating actions use a per-target in-flight operation key for /dedupe across the main window, detached windows, Dashboard, and Orchestrator shortcuts; identical operations coalesce and conflicting operations surface operation_in_progress with owning target and action context."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-037
- PS-089
unblocks: []
acceptance_criteria:
- "PS-094 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: mutating_operation_dedupe
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "per-target in-flight operation key"
- "/dedupe"
- "main window"
- "detached windows"
- "Dashboard"
- "Orchestrator shortcuts"
- "operation_in_progress"
negative_constraints:
- "Conflicting mutating operations must not silently coalesce as if they were identical operations."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
- "Plans/Orchestrator_Page.md"
```

### PS-095 - Stable Target Revalidation Refresh

```yaml
plan_unit_id: PS-095
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Every mutating action revalidates stable target identity immediately before execution, including stale table rows, stale cards, and stale /selections; material target changes abort with state_changed_refresh_required and require refresh or reselection."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-011
- PS-094
unblocks: []
acceptance_criteria:
- "PS-095 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: stable_target_revalidation_refresh
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "stable target identity"
- "stale table rows"
- "stale cards"
- "stale /selections"
- "state_changed_refresh_required"
- "refresh"
- "reselection"
negative_constraints:
- "A stale visible target must not be treated as authoritative for mutation after material target identity changes."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale rows, cards, and /selections require refresh or reselection before mutation."
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-096 - Indeterminate Remote Outcome Recovery

```yaml
plan_unit_id: PS-096
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Remote-side-effect transports may end as indeterminate_remote_outcome when server-side action might have succeeded but the client lost confirmation; the receipt preserves requested, transport_lost, and later reconciled states, and the UI exposes a Refresh remote state recovery CTA instead of labeling the action simply failed."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-089
- PS-095
unblocks: []
acceptance_criteria:
- "PS-096 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: indeterminate_remote_outcome_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "indeterminate_remote_outcome"
- "requested"
- "transport_lost"
- "reconciled"
- "Refresh remote state"
- "recovery CTA"
negative_constraints:
- "Indeterminate remote outcomes must not be labeled simply failed when reconciliation is required."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/assistant-chat-design.md"
- "Plans/storage-plan.md"
```

### PS-097 - Permission Snapshot Lifecycle

```yaml
plan_unit_id: PS-097
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "A permission snapshot captures resolved permission state before durable attempt or run start, remains immutable, and creates new snapshot and lineage entries after approval, policy, mode, project, account, target, or runtime-identity changes before retry or resume."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-006
- PS-055
- PS-076
unblocks: []
acceptance_criteria:
- "PS-097 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_snapshot_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "permission snapshot"
- "snapshot_id"
- "attempt_id"
- "node_id"
- "captured_at"
- "attempt.started"
- "immutable after creation"
- "retry"
- "resume"
negative_constraints:
- "Prior permission snapshots never mutate in place after later approval, policy, mode, project, account, target, or runtime-identity changes."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### PS-098 - Permission Snapshot Context Schema

```yaml
plan_unit_id: PS-098
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission snapshot schema preserves approval scope and target refs, requested and effective account bindings, permission_decision_context, actor_surface_context, runtime_identity_context, and resolved_permissions with requested and effective state, downgrade reason, source, and effective value."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-004
- PS-006
- PS-021
- PS-097
unblocks: []
acceptance_criteria:
- "PS-098 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_snapshot_context_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "approval_scope_key"
- "approval_target_ref"
- "requested_account_binding"
- "effective_account_binding"
- "account_switch_event_ref"
- "permission_decision_context"
- "actor_surface_context"
- "runtime_identity_context"
- "resolved_permissions"
- "requested_permission_state"
- "effective_permission_state"
- "downgrade_reason"
negative_constraints:
- "Consumers may index decision-context refs but must not collapse them into the runtime identity block."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### PS-099 - Snapshot Requested Effective Display Rules

```yaml
plan_unit_id: PS-099
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Historical run, attempt, chat, and audit views show the frozen permission snapshot that governed execution, including requested and effective permission states and downgrade reasons; current Settings state must not be presented as historical effective permission state."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-022
- PS-098
unblocks: []
acceptance_criteria:
- "PS-099 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: requested_effective_snapshot_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "Historical run"
- "attempt"
- "chat"
- "audit views"
- "frozen permission snapshot"
- "current Settings state"
- "historical effective permission state"
negative_constraints:
- "Current Settings state must not be presented as historical effective permission state."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/storage-plan.md"
```

### PS-100 - Blocked Episode Identity Carry Through

```yaml
plan_unit_id: PS-100
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission snapshots preserve blocked-episode identity and scoped approval dimensions together, including blocked_sequence, execution_entity_id, lane_id, package_id, account_id, and ordered allowed_action_ids[] carry-through."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-008
- PS-021
- PS-042
- PS-097
unblocks: []
acceptance_criteria:
- "PS-100 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: blocked_episode_identity_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "blocked_sequence"
- "execution_entity_id"
- "lane_id"
- "package_id"
- "account_id"
- "allowed_action_ids"
- "ordered allowed_action_ids[]"
- "Permission carry-through"
negative_constraints:
- "Permission snapshots must not separate blocked-episode identity from scoped approval dimensions."
preserved_contractrefs:
- "ContractRef: Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Contracts_V0.md"
```

### PS-101 - External Side Effect Wakeup Chain

```yaml
plan_unit_id: PS-101
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "When HITL approval resolves external_side_effect_blocked, the approval handler emits prerequisite_resolved with wake_reason: approval_resolved and node or attempt identity; the scheduler performs an immediate event-driven wakeup pass rather than polling."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-089
- PS-100
unblocks: []
acceptance_criteria:
- "PS-101 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_side_effect_wakeup_chain
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0075
preserved_exact_tokens:
- "external_side_effect_blocked"
- "prerequisite_resolved"
- "wake_reason: approval_resolved"
- "node_id"
- "attempt_id"
- "wakeup pass"
- "immediate event-driven wakeup"
- "not polling-based"
negative_constraints:
- "External-side-effect approval wakeup is immediate and event-driven, not polling-based."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
- "Plans/Contracts_V0.md"
```

### PS-102 - Target Bound Domain Preflight Revalidation

```yaml
plan_unit_id: PS-102
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Domain approval and preflight decisions bind exact mutable targets for SCM, GitHub Actions, Docker, and Kubernetes, run static policy and cheap /precondition before approval, and run execution-time /revalidate before mutation; stale preflight evidence or changed target identity invalidates reuse."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-092
- PS-093
- PS-101
unblocks: []
acceptance_criteria:
- "PS-102 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: target_bound_domain_preflight_revalidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0076
preserved_exact_tokens:
- "project_id"
- "repo_id"
- "worktree_id"
- "/worktree/context"
- "branch"
- "commit"
- "repo_remote"
- "workflow_id"
- "run_id"
- "/environment"
- "runtime"
- "registry_host"
- "namespace"
- "/repository"
- "image_ref"
- "kube_context"
- "workload_ref"
- "resource_ref"
- "preflight_revision"
- "/precondition"
- "/revalidate"
negative_constraints:
- "Approval of an action name alone must not approve a changed or under-bound mutable target."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale-preflight evidence or changed target identity invalidates approval reuse and returns the action to blocked state."
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/GitHub_API_Auth_and_Flows.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-103 - Admin Side Effect Guard Mappings

```yaml
plan_unit_id: PS-103
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Source Control, GitHub Actions, Docker Manager, Docker Hub, and Kubernetes admin or hosted side effects use canonical permission and blocked-state guard rules when approval, capability, or auth prerequisites are missing."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-084
- PS-088
- PS-089
- PS-102
unblocks: []
acceptance_criteria:
- "PS-103 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: admin_side_effect_guard_mappings
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0077
preserved_exact_tokens:
- "Source Control, GitHub Actions, and Docker Manager Permission Addendum (2026-03-12)"
- "GitHub Actions rerun/cancel/dispatch"
- "admin CRUD"
- "Docker Hub repository creation"
- "image push"
- "managed template-repo create/push"
- "Kubernetes mutating actions"
- "external-side-effect guard model"
negative_constraints:
- "External-side-effect and admin-gated behavior for this packet must use canonical permission and blocked-state rules."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/GitHub_API_Auth_and_Flows.md"
- "Plans/Containers_Registry_and_Unraid.md"
- "Plans/Decision_Policy.md"
```

### PS-104 - Partial Auth Requested Effective Disclosure

```yaml
plan_unit_id: PS-104
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Requested versus effective capability disclosure remains visible whenever a surface control is disabled by partial auth or policy state."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-010
- PS-022
- PS-103
unblocks: []
acceptance_criteria:
- "PS-104 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: partial_auth_requested_effective_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0077
preserved_exact_tokens:
- "requested vs effective capability disclosure"
- "visible"
- "surface control"
- "disabled"
- "partial auth"
- "policy state"
negative_constraints:
- "Controls disabled by partial auth or policy state must not hide requested versus effective capability disclosure."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/GitHub_API_Auth_and_Flows.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-105 - Provider Exposure Permission Scrub Gate

```yaml
plan_unit_id: PS-105
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Provider and LLM exposure rules apply before diffs, hunks, logs, manifests, discovered URLs, screenshots, or equivalent content is sent to provider-backed features; exposure requires explicit permission, /data-class labeling, per-feature opt-in, local-only fallback, and secret-scrub before provider transmission."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-022
- PS-076
- PS-103
unblocks: []
acceptance_criteria:
- "PS-105 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: provider_exposure_permission_scrub_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "Provider/LLM exposure"
- "diff"
- "conflict hunk"
- "workflow log"
- "container log"
- "manifest snippet"
- "inspect output"
- "workflow YAML preview"
- "manifest diff"
- "discovered URL"
- "screenshot"
- "explicit permission"
- "/data-class"
- "per-feature opt-in"
- "local-only fallback"
- "secret-scrub"
negative_constraints:
- "Secret scrubbing only before local persistence is insufficient for LLM or other provider features."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Provider_OpenCode.md"
- "Plans/Models_System.md"
```

### PS-106 - Redaction Profile View Export Evidence

```yaml
plan_unit_id: PS-106
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Review, diff, export, evidence/history, and provider features distinguish ephemeral in-memory view, scrubbed persisted blob, and user-exported file; persisted, indexed, screenshotted, exported, or evidence/history records preserve redaction profile, mandatory scrub status, and display-detail hiding rules."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-076
- PS-105
unblocks: []
acceptance_criteria:
- "PS-106 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: redaction_profile_view_export_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "Review"
- "diff"
- "export"
- "/evidence/history"
- "ephemeral in-memory view"
- "scrubbed persisted blob"
- "user-exported file"
- "/screenshots"
- "redaction profile"
- "mandatory scrub"
negative_constraints:
- "Persisted, indexed, screenshotted, exported, or evidence/history content must not omit redaction profile and mandatory scrub metadata."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Project_Output_Artifacts.md"
- "Plans/Runtime_Artifacts_Panel.md"
```

### PS-107 - Remote Side Effect Receipt Provenance

```yaml
plan_unit_id: PS-107
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Remote-side-effect receipts record approval_source, executing_subsystem, effective account, and credential handle for push, dispatch, admin changes, publish, repo creation, apply, rollout, and equivalent actions."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-100
- PS-103
unblocks: []
acceptance_criteria:
- "PS-107 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: remote_side_effect_receipt_provenance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "Remote-side-effect receipts"
- "approval_source"
- "executing_subsystem"
- "effective account"
- "credential handle"
- "explicit confirm"
- "cached permission"
- "policy auto-allow"
- "browser fallback"
- "git"
- "GitHub API"
- "docker CLI"
- "kubectl"
- "SSH remote"
negative_constraints:
- "Remote-side-effect receipts must not omit provenance for approval source, executing subsystem, effective account, or credential handle."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
```

### PS-108 - Sensitive Metadata Export Masking

```yaml
plan_unit_id: PS-108
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Sensitive metadata minimization masks remote URLs, private repo names, registry namespaces, Docker Hub account identity, kube context names, namespace and workload names, discovered service URLs, port-forward endpoints, screenshots, and downloaded scrubbed artifacts by default unless the user explicitly chooses a fuller export profile."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-105
- PS-106
unblocks: []
acceptance_criteria:
- "PS-108 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: sensitive_metadata_export_masking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "remote URLs"
- "private repo names"
- "registry namespaces"
- "Docker Hub account identity"
- "kube context names"
- "namespace/workload names"
- "discovered service URLs"
- "port-forward endpoints"
- "screenshots"
- "downloaded scrubbed artifacts"
- "fuller export profile"
negative_constraints:
- "Exports and screenshots mask sensitive metadata by default unless the user explicitly chooses a fuller export profile."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Project_Output_Artifacts.md"
- "Plans/FinalGUISpec.md"
```

### PS-109 - Project Delete Residue Cleanup

```yaml
plan_unit_id: PS-109
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "/logout/project-delete, unlink, and project-delete cleanup clear or invalidate non-secret residue that can identify the user or project, including validation snapshots, account identity, workflow admin receipts, registry capability snapshots, kube context selections, discovered endpoints, and downloaded scrubbed artifacts."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-055
- PS-076
- PS-107
unblocks: []
acceptance_criteria:
- "PS-109 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: project_delete_residue_cleanup
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "/logout/project-delete"
- "unlink"
- "project-delete cleanup"
- "non-secret residue"
- "validation snapshots"
- "last-used account identity"
- "workflow admin receipts"
- "registry capability snapshots"
- "kube context selections"
- "discovered endpoints"
- "downloaded scrubbed artifacts"
negative_constraints:
- "Project delete cleanup must not retain non-secret residue that can still identify the user or project."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
```

### PS-110 - Privileged Session Metadata Minimization

```yaml
plan_unit_id: PS-110
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Session-style privileged operations persist bounded metadata only for actor, target, timestamps, credential realm, transport, local bind address or port when relevant, and requested versus effective state; interactive transcript and stdin are not persisted by default."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-092
- PS-102
- PS-107
unblocks: []
acceptance_criteria:
- "PS-110 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: privileged_session_metadata_minimization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "docker exec/attach"
- "kubectl exec"
- "kubectl port-forward"
- "remote SCM-over-SSH mutation sessions"
- "browser/device auth handoffs"
- "actor"
- "target"
- "started/ended timestamps"
- "credential realm"
- "transport"
- "local bind address/port"
- "requested vs effective state"
- "interactive transcript"
- "stdin"
negative_constraints:
- "Do not persist interactive transcript or stdin by default for session-style privileged operations."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
```

### PS-111 - Build Deploy Secret No Persist No Echo

```yaml
plan_unit_id: PS-111
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Build and deploy secret handling uses no-persist and no-echo rules for docker build secrets, build args, compose env files, registry auth helpers, kube Secret manifests, and generated deployment YAML containing sensitive values."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-105
- PS-108
unblocks: []
acceptance_criteria:
- "PS-111 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: build_deploy_secret_no_persist_no_echo
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "Build/deploy secret-handling"
- "no-persist/no-echo"
- "docker build secrets"
- "build args"
- "compose env files"
- "registry auth helpers"
- "kube Secret manifests"
- "generated deployment YAML"
- "sensitive values"
negative_constraints:
- "Sensitive build and deployment values must not be echoed, persisted, rendered back in full, indexed, or included in receipts/evidence beyond allowed redacted identity."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-112 - Secret Rendering And ConfigMap Redaction

```yaml
plan_unit_id: PS-112
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Secret resources are never rendered back in full, indexed, or included in receipts or evidence beyond kind, name, namespace, and redacted status; ConfigMap rendering follows a separate configurable redaction policy because it may contain sensitive plaintext."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-108
- PS-111
unblocks: []
acceptance_criteria:
- "PS-112 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: secret_resource_rendering_redaction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "Secret resources"
- "kind/name/namespace"
- "redacted status"
- "ConfigMap rendering"
- "separate configurable redaction policy"
- "sensitive plaintext"
negative_constraints:
- "Secret resources are never rendered back in full, indexed, or included in receipts/evidence beyond kind, name, namespace, and redacted status."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
- "Plans/FinalGUISpec.md"
```

### PS-001 - Permissions System Source-Preserving Bridge Retired

```yaml
plan_unit_id: PS-001
unit_type: generated_artifact_residual
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "PS-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 208 because Permissions_System-S0079 through S0082 are generated standardization tail material: Owner / Consumer Map, PlanUnits heading, former generated PS-001 bridge, and Migration Coverage. Permissions_System-S0001 through S0078 are covered by PS-002 through PS-112 or explicit structural and split dispositions. PS-001 no longer carries source_preserving_planunit compile mode and must not own product coverage."
gui_related: false
gui_classification_reason: "The retired bridge is generated migration lineage rather than implementation-facing GUI behavior, even though the retired source lineage preserved earlier GUI-related product tokens."
split_recommended: false
depends_on:
- PS-002
- PS-003
- PS-004
- PS-005
- PS-006
- PS-007
- PS-008
- PS-009
- PS-010
- PS-011
- PS-012
- PS-013
- PS-014
- PS-015
- PS-016
- PS-017
- PS-018
- PS-019
- PS-020
- PS-021
- PS-022
- PS-023
- PS-024
- PS-025
- PS-026
- PS-027
- PS-028
- PS-029
- PS-030
- PS-031
- PS-032
- PS-033
- PS-034
- PS-035
- PS-036
- PS-037
- PS-038
- PS-039
- PS-040
- PS-041
- PS-042
- PS-043
- PS-044
- PS-045
- PS-046
- PS-047
- PS-048
- PS-049
- PS-050
- PS-051
- PS-052
- PS-053
- PS-054
- PS-055
- PS-056
- PS-057
- PS-058
- PS-059
- PS-060
- PS-061
- PS-062
- PS-063
- PS-064
- PS-065
- PS-066
- PS-067
- PS-068
- PS-069
- PS-070
- PS-071
- PS-072
- PS-073
- PS-074
- PS-075
- PS-076
- PS-077
- PS-078
- PS-079
- PS-080
- PS-081
- PS-082
- PS-083
- PS-084
- PS-085
- PS-086
- PS-087
- PS-088
- PS-089
- PS-090
- PS-091
- PS-092
- PS-093
- PS-094
- PS-095
- PS-096
- PS-097
- PS-098
- PS-099
- PS-100
- PS-101
- PS-102
- PS-103
- PS-104
- PS-105
- PS-106
- PS-107
- PS-108
- PS-109
- PS-110
- PS-111
- PS-112
unblocks: []
acceptance_criteria:
- "Permissions_System-S0001 through S0078 remain mapped to fine-grained Permissions System PlanUnits or explicit structural dispositions rather than PS-001."
- "Permissions_System-S0079 through S0082 are generated standardization tail material or retired bridge lineage, not product implementation coverage."
- "PS-001 no longer uses source_preserving_planunit mode and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: permissions_system_generated_tail_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0079
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0080
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0081
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0082
preserved_exact_tokens:
- "source_preserving_planunit"
- "Permissions System (Canonical SSOT) Source-Preserving PlanUnit"
- "Permissions_System-S0079"
- "Permissions_System-S0082"
- "Migration Coverage"
- "PlanUnits"
- "Owner / Consumer Map"
negative_constraints:
- "PS-001 must not provide product implementation coverage for Permissions_System-S0001 through S0078 after Phase 2B batch 208."
- "PS-001 must not override PS-002 through PS-112 or later fine-grained Permissions System PlanUnits."
- "Do not rely on one coarse source_preserving_planunit as the final implementation standard for Permissions_System.md."
preserved_contractrefs:
- "ContractRef lineage remains preserved in span_map and coverage_map; malformed trailing apostrophes from the generated PS-001 span are lineage only and are not promoted as active ContractRefs."
compatibility_only_notes:
- "The retired bridge is compatibility lineage for generated Owner / Consumer Map, generated PlanUnits, former PS-001 bridge, and Migration Coverage tail spans only."
stale_retired_dispositions:
- "Former generated source-preserving bridge material is retired as migration lineage only."
owner_hints:
- Plans/Permissions_System.md
```
