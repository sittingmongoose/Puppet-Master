# Shard 011: PlanUnits

Source: `Plans/Crosswalk.md`

Source lines: L486-L3136

Source SHA256: `e88b43bb3e48e9741c3984ff34850f091b52560bad6c3bc7d6b01c4277a87c77`

---

## PlanUnits

### C-002 - Crosswalk Owner Section Canonicality

```yaml
plan_unit_id: C-002
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk is canonical live specification text for owner-section requirements
  and preserves product, runtime, storage, UI, and governance details in
  owner-section form while acting as the owner-boundary map.
gui_related: true
gui_classification_reason: The owner-section requirement explicitly includes UI details and user-visible surface boundaries.
split_recommended: false
depends_on: []
unblocks: [C-003, C-004]
acceptance_criteria:
  - "Crosswalk remains canonical live specification text for this owner document."
  - "Product, runtime, storage, UI, and governance details are preserved in owner-section form."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crosswalk_owner_section_loss
reasoning_tier: standard
context_scope: crosswalk_owner_section_canonicality
implementation_surfaces:
  - Plans/Crosswalk.md
node_compile_hint:
  mode: crosswalk_owner_section_canonicality
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0002
preserved_exact_tokens:
  - "Crosswalk (Canonical)"
  - "Canonical owner-section requirements"
  - "product, runtime, storage, UI, and governance details"
negative_constraints: []
owner_hints:
  - Plans/Crosswalk.md
```

### C-003 - Compliance Naming And Compatibility Fallback

```yaml
plan_unit_id: C-003
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk follows DRY_Rules, references SSOT contracts in Contracts_V0,
  uses the platform name Puppet Master only, treats older naming as legacy
  naming, and preserves route/open compatibility-only fallback marking.
gui_related: false
gui_classification_reason: This unit defines naming, compliance, and compatibility constraints rather than UI presentation.
split_recommended: false
depends_on: [C-002]
unblocks: [C-004, C-006]
acceptance_criteria:
  - "Crosswalk references SSOT contracts in Plans/Contracts_V0.md and follows Plans/DRY_Rules.md."
  - "The platform name is Puppet Master only."
  - "Older naming is referred to only as legacy naming."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: naming_compatibility_drift
reasoning_tier: standard
context_scope: compliance_naming_compatibility_fallback
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/DRY_Rules.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: compliance_naming_compatibility_fallback
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0003
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0004
preserved_exact_tokens:
  - "Coverage blocker worktree allocation strategy"
  - "Route/open compatibility-only fallback marking"
  - "Puppet Master"
  - "legacy naming"
negative_constraints:
  - "If older naming exists, refer to it only as legacy naming."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/DRY_Rules.md
  - Plans/Contracts_V0.md
```

### C-004 - Crosswalk Boundary Map Scope

```yaml
plan_unit_id: C-004
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk is a boundary map, not an implementation plan; it assigns
  authoritative primitive ownership so plan documents remain DRY.
gui_related: false
gui_classification_reason: This unit defines document scope and ownership routing.
split_recommended: false
depends_on: [C-002, C-003]
unblocks: [C-005, C-006]
acceptance_criteria:
  - "Crosswalk is treated as a boundary map rather than an implementation plan."
  - "Primitive ownership assignments keep plan documents DRY."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crosswalk_scope_overreach
reasoning_tier: standard
context_scope: crosswalk_boundary_map_scope
implementation_surfaces:
  - Plans/Crosswalk.md
node_compile_hint:
  mode: crosswalk_boundary_map_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0005
preserved_exact_tokens:
  - "`boundary map`"
  - "`Primitive:Crosswalk`"
negative_constraints:
  - "Crosswalk must not become an implementation plan."
owner_hints:
  - Plans/Crosswalk.md
```

### C-005 - Crosswalk Anti-Drift Precedence

```yaml
plan_unit_id: C-005
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk conflict resolution follows the anti-drift precedence order:
  Spec_Lock.json, Crosswalk, DRY_Rules, Glossary, and Decision_Policy.
gui_related: false
gui_classification_reason: This unit defines governance precedence rather than user-visible UI.
split_recommended: false
depends_on: [C-004]
unblocks: [C-006]
acceptance_criteria:
  - "Conflicts between plan documents are resolved through the stated precedence order."
  - "Decision_Policy.md§2 and Spec_Lock.json references remain preserved."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: anti_drift_precedence_loss
reasoning_tier: high
context_scope: crosswalk_anti_drift_precedence
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Spec_Lock.json
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: crosswalk_anti_drift_precedence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0006
preserved_exact_tokens:
  - "`Plans/Spec_Lock.json`"
  - "`Plans/DRY_Rules.md`"
  - "`Plans/Glossary.md`"
  - "`Plans/Decision_Policy.md`"
  - "ContractRef: PolicyRule:Decision_Policy.md§2, SchemaID:Spec_Lock.json"
negative_constraints:
  - "Consumer wording must not override Crosswalk's stated precedence order."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Decision_Policy.md
```

### C-006 - Primitive Routing Labels And SSOT Ownership

```yaml
plan_unit_id: C-006
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk uses primitive names as routing labels only; detailed schemas belong
  to their SSOT documents, including Provider, Tool, UICommand, SessionStore,
  PatchPipeline, DocumentPane, DocumentReviewSurface, ReviewFindingsSummary,
  ReviewApprovalGate, DocumentCheckpoint, RouteTarget, OpenSubject, and
  AuthState.
gui_related: true
gui_classification_reason: The primitive index includes UICommand, DocumentPane, review surfaces, route targets, and open subjects that affect user-visible navigation and controls.
split_recommended: false
depends_on: [C-004, C-005]
unblocks: [C-007, C-008, C-009]
acceptance_criteria:
  - "Primitive names are routing labels only."
  - "Detailed schemas remain in their SSOT documents."
  - "RouteTarget and OpenSubject ownership stays in Contracts_V0."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: primitive_schema_ownership_drift
reasoning_tier: high
context_scope: primitive_routing_labels_ssot_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: primitive_routing_labels_ssot_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0007
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0008
preserved_exact_tokens:
  - "`Primitive:RouteTarget`"
  - "`Primitive:OpenSubject`"
  - "`Primitive:UICommand`"
  - "`Primitive:DocumentPane`"
  - "ContractRef: ContractName:Contracts_V0.md, SchemaID:Spec_Lock.json"
negative_constraints:
  - "Crosswalk must not redefine detailed primitive schemas owned by SSOT documents."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
```

### C-007 - Route Target Navigation Cascade

```yaml
plan_unit_id: C-007
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  CLI route arguments and GUI Save buttons resolve route_target strings through
  the canonical cascade for file, GitHub, workspace, SharePoint, and Notion
  routes; ambiguous routes use the active Persona default route, while
  Contracts_V0 and Models_System own the decision that flows through to UI.
gui_related: true
gui_classification_reason: This unit governs GUI Save behavior and cross-surface navigation resolution.
split_recommended: false
depends_on: [C-006]
unblocks: [C-008, C-024]
acceptance_criteria:
  - "CLI -r/--route and GUI Save actions resolve route_target strings through the documented cascade."
  - "Ambiguous routes use the active Persona default route."
  - "Crosswalk documents flow-through and does not own the underlying route decision."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_target_navigation_drift
reasoning_tier: high
context_scope: route_target_navigation_cascade
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
node_compile_hint:
  mode: route_target_navigation_cascade
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0009
preserved_exact_tokens:
  - "`file://...`"
  - "`github://owner/repo/path`"
  - "`workspace://project/concern`"
  - "`share://sharepoint-url`"
  - "`notion://...`"
negative_constraints:
  - "Route-target decisions must not become Crosswalk-owned implementation behavior."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
```

### C-008 - OpenSubject Navigation Normalization

```yaml
plan_unit_id: C-008
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  GUI Open and Inspect buttons normalize open requests to OpenSubject and route
  through orchestrator concern/help/artifact resolution; Crosswalk describes
  openable subject types while Contracts_V0 owns canonical OpenSubject rules.
gui_related: true
gui_classification_reason: This unit governs GUI Open and Inspect button normalization.
split_recommended: false
depends_on: [C-006, C-007]
unblocks: [C-009, C-024]
acceptance_criteria:
  - "GUI Open and Inspect actions normalize requests to OpenSubject."
  - "Subject types include file, concern, help_entry, project_state, run, and artifact_storage."
  - "Contracts_V0 owns canonical OpenSubject rules."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: open_subject_normalization_drift
reasoning_tier: high
context_scope: opensubject_navigation_normalization
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: opensubject_navigation_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0010
preserved_exact_tokens:
  - "`OpenSubject`"
  - "`file`"
  - "`concern`"
  - "`help_entry`"
  - "`project_state`"
  - "`run`"
  - "`artifact_storage`"
negative_constraints:
  - "Crosswalk must not replace Contracts_V0 as the canonical OpenSubject owner."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
```

### C-009 - FileManager Path Realization Boundary

```yaml
plan_unit_id: C-009
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  FileManager owns path-based OpenFile realization only after a canonical path is
  known; cross-surface route-target/OpenSubject navigation, open-by-identity,
  and identity-native document, artifact, runtime, and governance opens route
  through the canonical route/open boundary before OpenFile realization.
gui_related: false
gui_classification_reason: This unit defines owner routing and path-realization boundaries; UI consumption is indirect.
split_recommended: false
depends_on: [C-006, C-008]
unblocks: [C-024, C-030]
acceptance_criteria:
  - "FileManager owns path-based editor realization only."
  - "Identity-native opens normalize through route/open boundaries before OpenFile realization."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: filemanager_navigation_overclaim
reasoning_tier: high
context_scope: filemanager_path_realization_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: filemanager_path_realization_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0011
preserved_exact_tokens:
  - "`OpenFile`"
  - "`route-target`"
  - "`OpenSubject`"
  - "`/open-by-identity`"
negative_constraints:
  - "FileManager must not become the universal navigation owner."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/Contracts_V0.md
```

### C-010 - Source Control Lane Worktree Ownership

```yaml
plan_unit_id: C-010
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Source Control and WorktreeGitImprovement own Git/worktree object navigation
  and worktree lifecycle, while FileManager only preserves path/root context;
  routes carry package, worktree, repo, worktree, node attempt, lane, package,
  seam, lifecycle, and historical lineage rather than becoming panel-only state.
gui_related: true
gui_classification_reason: This unit governs Source Control pivots, Orchestrator tab copy, blocked/recovery actions, and other user-visible route labels.
split_recommended: false
depends_on: [C-009]
unblocks: [C-025, C-033]
acceptance_criteria:
  - "Source Control and WorktreeGitImprovement own Git/worktree object navigation and lifecycle."
  - "SCM lineage preserves package, worktree, repo_id, worktree_id, node/attempt, rollback/retry context, and cross-surface navigation."
  - "acknowledged remains escalation/noise control and ownership visibility, not semantic closure."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_lane_worktree_boundary_drift
reasoning_tier: high
context_scope: source_control_lane_worktree_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FileManager.md
node_compile_hint:
  mode: source_control_lane_worktree_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0012
preserved_exact_tokens:
  - "`open-in-SCM`"
  - "`/package`"
  - "`/worktree`"
  - "`repo_id`"
  - "`worktree_id`"
  - "`/node/attempt`"
  - "`acknowledged`"
negative_constraints:
  - "Worktree selection, open-in-SCM, and Source Control pivots are object navigation, not pure layout state."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FileManager.md
```

### C-011 - Assistant Thread Worktree Binding Ownership

```yaml
plan_unit_id: C-011
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Assistant thread worktree binding is owned by assistant-chat-design, with the
  owner table preserving binding data model, seglog events, commands, settings,
  merge-back, pre-merge test gate, Source Control accordion/filter, worktree
  record extension, FileManager toggle, and LSP root identity consumers.
gui_related: true
gui_classification_reason: The owner table includes settings, Source Control accordion/filter, FileManager toggle, and other user-visible controls.
split_recommended: false
depends_on: [C-010]
unblocks: [C-032]
acceptance_criteria:
  - "Thread-to-worktree binding is owned by assistant-chat-design.md."
  - "The binding owner table remains the routing source for consumers."
  - "Freshness/health projection follows storage-plan projection state."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: thread_worktree_binding_owner_drift
reasoning_tier: high
context_scope: assistant_thread_worktree_binding_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: assistant_thread_worktree_binding_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0013
preserved_exact_tokens:
  - "`chat.thread_worktree_*`"
  - "`cmd.chat.worktree.*`"
  - "`owner_thread_id`"
  - "`root_identity`"
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md"
negative_constraints:
  - "Consumer docs must not reassign thread-to-worktree binding ownership away from assistant-chat-design.md."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### C-012 - Projection Freshness Health Ownership

```yaml
plan_unit_id: C-012
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Projection freshness and health vocabulary is centrally owned: storage-plan
  owns axes and persisted semantics, Decision_Policy owns stale/degraded/
  unavailable gating behavior, FinalGUISpec owns UI disclosure, and consumers
  may consume but must not redefine or collapse the axes.
gui_related: true
gui_classification_reason: FinalGUISpec owns UI disclosure for freshness and health state.
split_recommended: false
depends_on: [C-011]
unblocks: [C-022, C-026]
acceptance_criteria:
  - "Projection freshness/health axes and persisted semantics are owned by storage-plan."
  - "Decision_Policy owns behavior when projection state affects execution or mutation gating."
  - "FinalGUISpec owns UI disclosure of freshness/health."
  - "Feature and surface docs do not redefine or collapse the axes."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_state_axis_drift
reasoning_tier: high
context_scope: projection_freshness_health_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: projection_freshness_health_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0014
preserved_exact_tokens:
  - "`freshness=current|refreshing|stale`"
  - "`health=healthy|degraded|unavailable`"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md"
negative_constraints:
  - "Feature/surface docs may consume these states but MUST NOT redefine the axes or collapse them into one field."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
```

### C-013 - Subagent Crew Context Shaping Ownership

```yaml
plan_unit_id: C-013
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Subagent, crew, shell isolation, context-shaping transitions, crew lifecycle,
  and requested/effective child-run runtime surfaces are split across their SSOT
  owner docs; per-surface docs may narrow these behaviors but must not redefine
  the owners.
gui_related: false
gui_classification_reason: This unit defines runtime ownership routing rather than UI presentation.
split_recommended: false
depends_on: [C-012]
unblocks: [C-032]
acceptance_criteria:
  - "Each subagent, crew, shell-isolation, context-shaping, and child-runtime concern has one authoritative owner."
  - "Per-surface docs may narrow behaviors but must not redefine the owners."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_crew_owner_redefinition
reasoning_tier: high
context_scope: subagent_crew_context_shaping_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: subagent_crew_context_shaping_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0015
preserved_exact_tokens:
  - "`maxNestingDepth`"
  - "`maxTotalSpawnedAgents`"
  - "`maxToolRoundsPerAgent`"
  - "`shell-isolation`"
  - "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md"
negative_constraints:
  - "Per-surface docs may narrow these behaviors, but MUST NOT redefine the owners above."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
  - Plans/Tools.md
```

### C-014 - Human In The Loop Ownership Split

```yaml
plan_unit_id: C-014
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Human-in-the-loop ownership is split so human-in-the-loop owns approval and
  decline semantics plus blocked-episode overlay, Contracts_V0 owns canonical
  blocked fields/action ids/persisted payloads, UI_Command_Catalog owns command
  ids, and FinalGUISpec plus assistant-chat-design own presentation only.
gui_related: false
gui_classification_reason: This unit routes HITL ownership; presentation ownership is named but not defined here.
split_recommended: false
depends_on: [C-013]
unblocks: [C-016, C-028]
acceptance_criteria:
  - "human-in-the-loop.md owns approval/decline semantics and blocked-episode overlay contract."
  - "Contracts_V0 owns canonical blocked-episode fields, action ids, and persisted payload shapes."
  - "FinalGUISpec and assistant-chat-design own presentation only."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hitl_ownership_drift
reasoning_tier: high
context_scope: hitl_ownership_split
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/human-in-the-loop.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: hitl_ownership_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0016
preserved_exact_tokens:
  - "`Contracts_V0.md` owns the canonical blocked-episode fields, action ids, and persisted payload shapes"
  - "ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md"
negative_constraints:
  - "HITL presentation docs must not become owners of blocked payload shapes."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/human-in-the-loop.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
```

### C-015 - Debug Investigation Ownership Split

```yaml
plan_unit_id: C-015
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Debug and investigation ownership is split across assistant-chat-design for
  Assistant Debug Mode and investigation-thread behavior,
  orchestrator-subagent-integration for delegated-worker use,
  Executor_Protocol for execution-time propagation, storage-plan for persisted
  records/snapshots/recovery joins, and Permissions_System for Debug Automation
  Profile grants and revalidation.
gui_related: false
gui_classification_reason: This unit routes debug/investigation ownership and persistence boundaries.
split_recommended: false
depends_on: [C-014]
unblocks: [C-029]
acceptance_criteria:
  - "Assistant debug workflow overlay ownership remains in assistant-chat-design."
  - "Execution, persistence, and permission aspects route to their named owner docs."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_investigation_owner_drift
reasoning_tier: high
context_scope: debug_investigation_ownership_split
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: debug_investigation_ownership_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0017
preserved_exact_tokens:
  - "Assistant Debug Mode"
  - "Debug Automation Profile"
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md"
negative_constraints:
  - "Debug/investigation ownership must not collapse into a single surface doc."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```

### C-016 - Permission Approval Scope Ownership

```yaml
plan_unit_id: C-016
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Permissions_System owns permission precedence, rule persistence,
  approval-scope derivation, durable-rule authoring, and permission-caused
  blocked outcomes; Contracts_V0 owns canonical blocked payload shapes,
  approval_scope_key, and action-id fields; human-in-the-loop owns approval
  interaction semantics.
gui_related: false
gui_classification_reason: This unit defines permission and payload ownership routing.
split_recommended: false
depends_on: [C-014]
unblocks: [C-028]
acceptance_criteria:
  - "Permissions_System owns permission precedence and approval-scope derivation."
  - "Contracts_V0 owns blocked payload shape, approval_scope_key, and action-id field names."
  - "Consumer docs may name required keys or blocked triggers but do not redefine approval-scope contracts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: permission_approval_scope_redefinition
reasoning_tier: high
context_scope: permission_approval_scope_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: permission_approval_scope_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0018
preserved_exact_tokens:
  - "`approval_scope_key`"
  - "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md"
negative_constraints:
  - "Consumer docs may name required permission keys or blocked triggers but MUST NOT redefine the approval-scope contract."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
```

### C-017 - Remediation Lifecycle Ownership

```yaml
plan_unit_id: C-017
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Executor_Protocol owns remediation spawn/retry/safe-point/escalation behavior,
  Contracts_V0 owns remediation.spawned and remediation.resolved event shapes
  plus the resolution enum, Decision_Policy owns deterministic ceilings and
  blocked posture after ceiling exhaustion, and storage-plan owns durable
  remediation lineage and historical projection behavior.
gui_related: true
gui_classification_reason: Orchestrator, GUI, and chat docs consume remediation state and user-visible blocked/recovery behavior.
split_recommended: false
depends_on: [C-016]
unblocks: [C-029]
acceptance_criteria:
  - "Remediation spawn/retry/safe-point behavior routes to Executor_Protocol."
  - "Remediation event shapes and resolution enum route to Contracts_V0."
  - "Orchestrator, GUI, and chat docs consume remediation state without redefining enums or ceiling behavior."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remediation_lifecycle_owner_drift
reasoning_tier: high
context_scope: remediation_lifecycle_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/Decision_Policy.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: remediation_lifecycle_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0019
preserved_exact_tokens:
  - "`remediation.spawned`"
  - "`remediation.resolved`"
  - "`resolution`"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md"
negative_constraints:
  - "Orchestrator/GUI/chat docs consume remediation state but MUST NOT redefine remediation enums or ceiling behavior."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/Decision_Policy.md
  - Plans/storage-plan.md
```

### C-018 - Provider Account Selection Precedence

```yaml
plan_unit_id: C-018
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Provider and account selection ownership routes to Models_System for
  provider-entry/runtime-surface selection priority and requested/effective
  runtime fields, Multi-Account for account selection and switch lineage,
  Prompt_Pipeline for runtime handoff freeze points, and provider docs for
  transport/capability facts rather than global selection precedence.
gui_related: false
gui_classification_reason: This unit defines provider/account owner routing and runtime precedence.
split_recommended: false
depends_on: [C-013]
unblocks: [C-020, C-023]
acceptance_criteria:
  - "Models_System owns provider-entry/runtime-surface selection priority and requested/effective runtime fields."
  - "Multi-Account owns account selection and switch lineage."
  - "Provider-specific docs do not own global selection precedence."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_account_precedence_drift
reasoning_tier: high
context_scope: provider_account_selection_precedence
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Prompt_Pipeline.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: provider_account_selection_precedence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0020
preserved_exact_tokens:
  - "`requested/effective`"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md"
negative_constraints:
  - "Provider-specific transport/capability docs must not own global selection precedence."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Prompt_Pipeline.md
```

### C-019 - Event Record Terminal Identity Ownership

```yaml
plan_unit_id: C-019
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Contracts_V0 owns event families and command/event envelopes, storage-plan
  owns persisted record families, projection joins, terminal_session_id,
  dev_session_id, and terminal continuity identity, FinalGUISpec owns shell
  realization, and Section15 owns shell/session identities across Plans
  consumers.
gui_related: true
gui_classification_reason: FinalGUISpec owns shell realization and terminal layout presentation.
split_recommended: false
depends_on: [C-018]
unblocks: [C-029, C-032]
acceptance_criteria:
  - "Contracts_V0 owns event families and command/event envelopes."
  - "storage-plan owns persisted records, projection joins, and terminal continuity/restart identity."
  - "Consumer docs may extend display metadata but do not redefine terminal or event identity primitives."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_record_terminal_identity_drift
reasoning_tier: high
context_scope: event_record_terminal_identity_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: event_record_terminal_identity_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0021
preserved_exact_tokens:
  - "`terminal_session_id`"
  - "`dev_session_id`"
  - "`/session`"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"
negative_constraints:
  - "Consumer docs may extend display metadata but MUST NOT redefine terminal or event identity primitives."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

### C-020 - Provider Pressure Effort And Repair Routing

```yaml
plan_unit_id: C-020
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk routes provider pressure, effort-control rewrites, context-detail
  usage display, and Firecrawl/lost-spec web/chat/storage repair to the named
  owner docs while preserving cross-provider requested/effective state and
  keeping provider-specific strings subordinate evidence rather than scheduler
  inputs.
gui_related: true
gui_classification_reason: This unit names GUI, usage, context-detail, and routing surfaces that consume provider pressure state.
split_recommended: false
depends_on: [C-018]
unblocks: [C-023, C-029]
acceptance_criteria:
  - "Provider pressure projection records Observed effective versus Inferred only and normalized pressure fields."
  - "GUI, usage, and routing surfaces preserve coherent effective state across providers."
  - "Firecrawl/lost-spec repair routing remains owner/consumer only."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_pressure_owner_routing_drift
reasoning_tier: high
context_scope: provider_pressure_effort_repair_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/Tools.md
node_compile_hint:
  mode: provider_pressure_effort_repair_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0022
preserved_exact_tokens:
  - "`Observed effective`"
  - "`Inferred only`"
  - "`pressure_state`"
  - "`hard_block`"
  - "`effective_pressure_state`"
  - "`effective_resolution_outcome`"
  - "`/context-detail`"
negative_constraints:
  - "Provider-specific strings remain subordinate evidence rather than scheduler inputs."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/Tools.md
```

### C-021 - Rewrite Era Cross Cutting Owner Routing

```yaml
plan_unit_id: C-021
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Rewrite-era cross-cutting field families, event names, account IDs,
  account-routing semantics, requested/effective runtime resolution, stable
  command IDs, command arguments, Glossary terms, and execution-core semantics
  route to their owner docs, while UI_Command_Catalog does not own the deeper
  route ontology by itself and structural owner-doc debt remains explicit.
gui_related: false
gui_classification_reason: This unit defines owner routing and structural debt rather than UI presentation.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is dense and is split across C-021 through C-033 to preserve separate owner-routing concerns.
depends_on: [C-005, C-006]
unblocks: [C-022, C-024, C-029]
acceptance_criteria:
  - "Cross-cutting persisted-envelope, event, account, command, Glossary, and execution-core families route to owner docs."
  - "UI_Command_Catalog does not own the deeper route ontology by itself."
  - "Structural owner safety debt and append-after-references drift remain visible."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: rewrite_owner_routing_drift
reasoning_tier: high
context_scope: rewrite_era_cross_cutting_owner_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
  - Plans/UI_Command_Catalog.md
  - Plans/Glossary.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: rewrite_era_cross_cutting_owner_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`Contracts_V0.md`"
  - "`storage-plan.md`"
  - "`Prompt_Pipeline.md`"
  - "`Multi-Account.md`"
  - "`UI_Command_Catalog.md`"
  - "`Glossary.md`"
  - "`Executor_Protocol.md`"
  - "`orchestrator-subagent-integration.md`"
  - "`Primitive:Seglog`"
  - "`Primitive:EvidenceBundle`"
  - "`Primitive:CapabilityGating`"
negative_constraints:
  - "`UI_Command_Catalog.md` does not own the deeper route ontology by itself."
  - "Append-after-references drift is a structural owner-doc failure, not a new source of truth."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
  - Plans/UI_Command_Catalog.md
  - Plans/Glossary.md
  - Plans/Executor_Protocol.md
```

### C-022 - Storage Project And Surface State Routing

```yaml
plan_unit_id: C-022
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Storage and project-state support routes through storage-plan, while
  surface-specific active_subview, selection, branch, filter, document history,
  and worktree focus state remain owner-handled routing identities instead of
  consumer-owned local state.
gui_related: true
gui_classification_reason: This unit governs user-visible surface state such as active subviews, selected repos/worktrees, filters, and document pane selection.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-021]
unblocks: [C-024, C-030, C-032]
acceptance_criteria:
  - "Project-state and persisted support route through storage-plan."
  - "Surface-specific active_subview, selection, branch, filter, and document state remain owner-handled."
  - "Selection and worktree focus are routing identities, not consumer-owned local state."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: surface_state_owner_drift
reasoning_tier: high
context_scope: storage_project_surface_state_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
node_compile_hint:
  mode: storage_project_surface_state_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`orchestrator.project_state.{project_id}`"
  - "`/project-state`"
  - "`active_subview`"
  - "`/selection`"
  - "`/worktree`"
negative_constraints:
  - "Surface-specific state must not become consumer-owned local state when it is a route or focus identity."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
```

### C-023 - Provider Account Persona Model Routing

```yaml
plan_unit_id: C-023
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Multi-account switch and pressure behavior routes to Multi-Account; provider
  transport/upstream identity routes to provider owner docs; persona, prompt,
  interview handoff, requested/effective persona names, model selection,
  orchestrator integration, and shell exposure remain split by their owner
  families.
gui_related: false
gui_classification_reason: This unit routes provider/account/persona/model owner families and runtime disclosure.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-018, C-020, C-021]
unblocks: [C-030]
acceptance_criteria:
  - "Multi-Account owns selection policy, role/account precedence, durable switch-history storage, and pressure joins."
  - "Provider-specific transport-vs-upstream identity routes to provider owner docs."
  - "Persona and model-adjacent routing stays split by owner family."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_account_persona_model_owner_drift
reasoning_tier: high
context_scope: provider_account_persona_model_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
  - Plans/interview-subagent-integration.md
  - Plans/Models_System.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: provider_account_persona_model_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`requested/effective`"
  - "`preferred-account`"
  - "`effective_account_id`"
  - "`Plans/Provider_OpenCode.md`"
  - "`Plans/Personas.md`"
negative_constraints:
  - "Account and persona/model routing must not collapse into provider-only notes."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
  - Plans/Models_System.md
```

### C-024 - Route Open Normalization Boundary

```yaml
plan_unit_id: C-024
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Route-target, subject-open, OpenSubject, OpenFile, resume_url, generated
  subject transport, and open-by-identity behavior normalize to the shared
  route/open contract boundary rather than allowing FileManager,
  UI_Command_Catalog, or any surface wrapper command to become the navigation
  owner.
gui_related: true
gui_classification_reason: This unit governs command palette, preview subject, deep links, open-file actions, and cross-surface navigation behavior.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-006, C-007, C-008, C-009, C-021, C-022]
unblocks: [C-027, C-030, C-032]
acceptance_criteria:
  - "resume_url serializes route identity and is not the canonical navigation primitive."
  - "OpenSubject and OpenFile live inside the same route/open model rather than separate navigation stacks."
  - "FileManager and navigation consumers do not make OpenFile the universal navigation primitive."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_open_normalization_drift
reasoning_tier: high
context_scope: route_open_normalization_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: route_open_normalization_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`route-target`"
  - "`subject-open`"
  - "`resume_url`"
  - "`OpenSubject`"
  - "`OpenFile`"
  - "`/open-by-identity`"
  - "`generated://<artifact_id>`"
negative_constraints:
  - "`FileManager.md` and `/navigation` consumers must not make `OpenFile` the universal navigation primitive."
  - "`resume_url` is only one persisted serialized recovery deep-link transport form, not the hidden canonical navigation primitive."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FileManager.md
  - Plans/UI_Command_Catalog.md
```

### C-025 - Source Control Lane Worktree Historical Routing

```yaml
plan_unit_id: C-025
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Source Control remains Git worktree-first while Orchestrator remains
  lane/package/seam first; SCM/runtime flows replace tier-bound worktree
  identity with lane/worktree plus execution context, preserve package and
  worktree lineage through cleanup/archive/remove, and keep worktree operations
  as object navigation rather than panel-only state.
gui_related: true
gui_classification_reason: This unit governs Source Control, Orchestrator, history, graph, and cleanup views.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-010, C-021]
unblocks: [C-026, C-033]
acceptance_criteria:
  - "Source Control remains Git worktree-first while Orchestrator remains lane/package/seam first."
  - "Historical lane/worktree records survive archive, prune, and remove."
  - "SCM/runtime routes carry lane/package/seam context rather than reviving per-tier worktree ownership."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_lane_worktree_historical_drift
reasoning_tier: high
context_scope: source_control_lane_worktree_historical_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: source_control_lane_worktree_historical_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`worktree-first`"
  - "`/package/seam/node-first`"
  - "`/run/package/lane/worktree`"
  - "`archive`"
  - "`prune`"
  - "`remove`"
negative_constraints:
  - "Source Control and Git worktree routes must not degrade into panel-only jumps or tier-bound ownership."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
```

### C-026 - Orchestrator Tab IA And Cross Tab Navigation

```yaml
plan_unit_id: C-026
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Orchestrator routing preserves tab responsibility, CTA behavior, Usage,
  Evidence, Graph, history, blocked outcomes, provider/model/persona precedence,
  worktree ownership, Tiers retirement, cross-tab deep-linkability, and
  route/filter/select target context without duplicating Source Control or
  reducing navigation to tab switches.
gui_related: true
gui_classification_reason: This unit governs Orchestrator tabs, CTAs, cross-tab navigation, and shell IA.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-012, C-025]
unblocks: [C-027, C-032, C-033]
acceptance_criteria:
  - "Tier-era UI assumptions route through FinalGUISpec, Orchestrator_Page, and storage-plan for retirement."
  - "Cross-tab routes preserve filter/select target context instead of merely switching tabs."
  - "Progress remains widget-hosting operational tab while native deep-inspection tabs own seams plus graph/evidence/history/ledger."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_tab_navigation_drift
reasoning_tier: high
context_scope: orchestrator_tab_ia_cross_tab_navigation
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/UI_Command_Catalog.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
  - Plans/human-in-the-loop.md
  - Plans/Glossary.md
  - Plans/Orchestrator_Page.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: orchestrator_tab_ia_cross_tab_navigation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`CTA`"
  - "`Tiers`"
  - "`/filter/select`"
  - "`Progress`"
  - "`/graph/evidence/history/ledger`"
negative_constraints:
  - "Orchestrator tab ownership must not collapse runtime ownership, page/tab IA, blocked/remediation UX, and graph/evidence/history/usage lineage into one page discussion."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
```

### C-027 - Wrapper Commands And Command Palette Route Consumption

```yaml
plan_unit_id: C-027
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Wrapper commands, command palette jumps, panel switches, chat/thread
  navigation, show/open actions, and command-specific payloads are route/open
  consumers that normalize into the shared route model instead of becoming a
  second navigation language or a universal navigation primitive.
gui_related: true
gui_classification_reason: This unit governs user-facing commands, palette jumps, panel switches, and show/open actions.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-024, C-026]
unblocks: [C-029, C-032]
acceptance_criteria:
  - "Wrapper commands remain useful surface verbs but not the universal navigation primitive."
  - "cmd.panel.switch remains panel-centric and too shallow for richer restoration contexts."
  - "Command-specific payloads normalize to the shared route model."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wrapper_command_navigation_drift
reasoning_tier: high
context_scope: wrapper_commands_palette_route_consumption
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: wrapper_commands_palette_route_consumption
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`cmd.panel.switch`"
  - "`cmd.chat.open_thread_usage`"
  - "`cmd.artifacts.show_in_usage`"
  - "`cmd.orchestrator.open_in_source_control`"
  - "`cmd.project.open`"
  - "`jump-to-message`"
negative_constraints:
  - "Wrapper commands must not replace shared route/open contract semantics."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### C-028 - Permissioned Interview Chat Approval Routing

```yaml
plan_unit_id: C-028
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Permissioned interview and chat flows route Permissions_System,
  assistant-chat-design, and interview-subagent-integration as the owner set for
  approval, chat, and interview behavior; preview/browser trust_tier must not be
  reused as a generic projection-state term.
gui_related: true
gui_classification_reason: This unit governs approval, chat, interview, preview, and browser user-visible behavior.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-014, C-016]
unblocks: [C-035]
acceptance_criteria:
  - "Permissioned interview/chat flows route approval, chat, and interview behavior through the named owner docs."
  - "preview/browser trust_tier is not reused as generic projection-state terminology."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: permissioned_interview_chat_owner_drift
reasoning_tier: high
context_scope: permissioned_interview_chat_approval_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: permissioned_interview_chat_approval_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`trust_tier`"
  - "`projection-state`"
negative_constraints:
  - "preview/browser `trust_tier` must not be reused as a generic `projection-state` term."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
  - Plans/interview-subagent-integration.md
```

### C-029 - Execution Command Cleanup And Scheduler Truth

```yaml
plan_unit_id: C-029
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Execution and command cleanup stays owner-specific: Executor_Protocol owns
  execution_role, blocked_sequence minting, and startup-recovery scheduler
  handoff; UI_Command_Catalog owns command-family migration; scheduler truth
  must not split among lexicographic, scored, and UI-derived recovery models
  across Executor_Protocol, Progression_Gates, plan_graph.schema, and
  Run_Graph_View.
gui_related: false
gui_classification_reason: This unit defines execution-core and scheduler ownership routing.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-015, C-017, C-019, C-020, C-021, C-027]
unblocks: [C-037]
acceptance_criteria:
  - "Executor_Protocol owns execution_role, blocked_sequence minting, and startup-recovery scheduler handoff."
  - "UI_Command_Catalog owns command-family migration."
  - "One scheduler truth is required across the listed owner docs."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scheduler_truth_split
reasoning_tier: high
context_scope: execution_command_cleanup_scheduler_truth
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/UI_Command_Catalog.md
  - Plans/Progression_Gates.md
  - Plans/plan_graph.schema.json
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: execution_command_cleanup_scheduler_truth
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`execution_role`"
  - "`blocked_sequence`"
  - "`startup-recovery`"
  - "`scheduler.pass`"
  - "`cmd.runtime.*`"
negative_constraints:
  - "Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across Plans/Executor_Protocol.md, Plans/Progression_Gates.md, Plans/plan_graph.schema.json, and Plans/Run_Graph_View.md."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/UI_Command_Catalog.md
  - Plans/Progression_Gates.md
  - Plans/Run_Graph_View.md
```

### C-030 - Artifact Runtime Operational Identity Routing

```yaml
plan_unit_id: C-030
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Artifact, file, storage, runtime, operational identity, and generated subject
  routing promote project_id, attempt_id, doc/artifact subject IDs, generated
  runtime subject identity, and environment-specific target context to
  first-class owner-routed identities without making generated transport or raw
  path opens the canonical persisted subject model.
gui_related: true
gui_classification_reason: This unit governs runtime artifact, file, report, and open/show surface navigation.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-022, C-023, C-024]
unblocks: [C-032]
acceptance_criteria:
  - "Project/artifact/file surfaces route by project_id, attempt_id, runtime subject identity, and artifact/file pivots."
  - "generated:// remains implementation-level transient representation rather than persisted subject ID."
  - "operational_identity records external side-effect target context."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_runtime_identity_owner_drift
reasoning_tier: high
context_scope: artifact_runtime_operational_identity_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: artifact_runtime_operational_identity_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`project_id`"
  - "`attempt_id`"
  - "`doc:`"
  - "`artifact:`"
  - "`generated://`"
  - "`operational_identity`"
  - "`Open Artifact`"
  - "`Open Report`"
negative_constraints:
  - "Orchestrator/Evidence surface copy such as Open in Editor must not imply raw-path opens for artifact-backed or report-backed subjects."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
```

### C-031 - Usage Attention Help Labels And Acknowledged Semantics

```yaml
plan_unit_id: C-031
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Usage navigation, attention surfaces, help labels, lane/worktree copy,
  blocked/recovery terminology, concerns/promotions/patches/history/ledger copy,
  and acknowledged semantics are route consumers of the shared route/open model;
  acknowledged is escalation noise control and ownership visibility only.
gui_related: true
gui_classification_reason: This unit governs user-visible Usage, attention, help label, blocked/recovery, and ledger copy.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-010, C-020, C-024]
unblocks: [C-032]
acceptance_criteria:
  - "usage_event is a first-class routed object."
  - "Attention and CtA surfaces normalize local field conventions to route-target."
  - "acknowledged does not close concerns, remove blockers, or replace resolved/dismissed lifecycle states."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_attention_acknowledged_semantics_drift
reasoning_tier: high
context_scope: usage_attention_help_labels_acknowledged_semantics
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/Glossary.md
node_compile_hint:
  mode: usage_attention_help_labels_acknowledged_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`usage_event`"
  - "`/CtA`"
  - "`acknowledged`"
  - "`concerns/promotions/patches/history/ledger`"
negative_constraints:
  - "`acknowledged` is escalation `/noise` control and ownership visibility only; it does not close a concern, remove a blocker, or replace resolved/dismissed lifecycle states."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/Glossary.md
```

### C-032 - Durable Route Identity Across History Surfaces

```yaml
plan_unit_id: C-032
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Ledger records, history chronology, graph generations, seams completion,
  promotions, runtime lineage, blocked episodes, scheduler passes, graph
  generations, attempts, concerns, graph patches, recovery records, and
  lane/worktree objects preserve durable route identity and lifecycle semantics
  across graph, evidence, history, ledger, runtime-artifact, and chat consumers.
gui_related: true
gui_classification_reason: This unit governs graph, evidence, history, ledger, runtime-artifact, chat, and blocked/runtime resume navigation.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-011, C-013, C-019, C-022, C-024, C-026, C-027, C-030, C-031]
unblocks: [C-033]
acceptance_criteria:
  - "Durable route identity distinguishes none selection, open/focus/navigate/deep-link, and tab-local filter/sort/search changes."
  - "Runtime lineage is object-first, not attempt-first."
  - "Shared record-semantic vocabulary spans attempts, promotions, concerns, graph patches, recovery records, and lane/worktree objects."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: durable_route_identity_drift
reasoning_tier: high
context_scope: durable_route_identity_history_surfaces
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/Run_Graph_View.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: durable_route_identity_history_surfaces
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`/history/ledger/source`"
  - "`/focus/navigate/deep-link`"
  - "`jump-to-message`"
  - "`cost_usage`"
  - "`runtime-lineage`"
negative_constraints:
  - "Runtime lineage is object-first, not attempt-first."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/Run_Graph_View.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/assistant-chat-design.md
```

### C-033 - Tier Bound Identity Replacement

```yaml
plan_unit_id: C-033
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Tier-bound selection, override-owner, execution-framing, per-tier worktree,
  tier/subtask, and owner run/tier assumptions must yield to package-based
  lane-pool, package/seam/lane-aware, graph/seam/package, effective identity,
  lane/worktree, and execution-context models.
gui_related: true
gui_classification_reason: This unit governs shell/Orchestrator migration away from Tiers and linear UI assumptions.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-025, C-026, C-032]
unblocks: []
acceptance_criteria:
  - "Tiers is retired as a primary view and route identity."
  - "Tier/rooted worktree identity yields to lane/worktree plus execution-context models."
  - "Owner docs retire tier-bound selection, override-owner, and execution-framing assumptions."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tier_bound_identity_resurrection
reasoning_tier: high
context_scope: tier_bound_identity_replacement
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
  - Plans/Models_System.md
  - Plans/Personas.md
node_compile_hint:
  mode: tier_bound_identity_replacement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`Tiers`"
  - "`/tier`"
  - "`/tier/subtask`"
  - "`lane-pool`"
  - "`/package/seam/lane-aware`"
  - "`execution-context`"
negative_constraints:
  - "SCM/runtime flows replace tier-bound worktree identity with the lane/worktree plus execution-context model."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
  - Plans/storage-plan.md
```

### C-034 - Document Inline Notes Annotation Boundary

```yaml
plan_unit_id: C-034
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  DocumentInlineNotes routes durable document annotation behavior across
  FinalGUISpec, storage-plan, chain-wizard-flexibility,
  interview-subagent-integration, and assistant-chat-design; user-facing
  Annotations preserve note_record.v1 continuity, operation shapes, lifecycle,
  anchoring selectors, deterministic re-anchoring, coexistence/conflict rules,
  and send-selection-to-chat boundaries.
gui_related: true
gui_classification_reason: This unit governs embedded document annotations, source surfaces, and user-facing annotation behavior.
split_recommended: false
depends_on: [C-024, C-028]
unblocks: [C-035, C-036]
acceptance_criteria:
  - "DocumentInlineNotes preserves durable annotation operation shapes and lifecycle."
  - "Anchor storage includes TextPositionSelector and TextQuoteSelector when deterministic source text exists."
  - "Send selection to chat remains adjacent behavior and not durable annotation lifecycle or patch-apply semantics."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: document_inline_notes_boundary_drift
reasoning_tier: high
context_scope: document_inline_notes_annotation_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: document_inline_notes_annotation_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0025
preserved_exact_tokens:
  - "`Primitive:DocumentInlineNotes`"
  - "`Annotations`"
  - "`note_record.v1`"
  - "`operation = comment | replace | insert_after | remove`"
  - "`TextPositionSelector { start, end }`"
  - "`TextQuoteSelector { exact, prefix, suffix }`"
  - "`Anchor not found — reselect to re-anchor`"
negative_constraints:
  - "`Send selection to chat` is a thread-scoped chip/handoff path; it must not be collapsed into the durable `/annotation` lifecycle, and it does not create patch-apply semantics."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/assistant-chat-design.md
```

### C-035 - Targeted Revision Pass Boundary

```yaml
plan_unit_id: C-035
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  TargetedRevisionPass routes targeted revision through workflow, UI, prompt,
  persistence, interview, and permission owners; Resubmit with Annotations
  consumes ordered annotation records, records addressed/still_open/cannot_apply
  outcomes, supports explicit requested/effective revision capability, exposes
  bundle lifecycle/audit events, and remains note-based V1 without direct
  patch-apply behavior.
gui_related: true
gui_classification_reason: This unit governs Resubmit with Annotations, document review, and revision workflow controls.
split_recommended: false
depends_on: [C-028, C-034]
unblocks: [C-036]
acceptance_criteria:
  - "Targeted revision consumes deterministic ordered annotation records."
  - "Each input annotation records addressed, still_open, or cannot_apply with explanation and optional updated anchor."
  - "Targeted revision does not trigger Multi-Pass Review and direct patch-apply is out of scope."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: targeted_revision_pass_boundary_drift
reasoning_tier: high
context_scope: targeted_revision_pass_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/FinalGUISpec.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: targeted_revision_pass_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0026
preserved_exact_tokens:
  - "`Primitive:TargetedRevisionPass`"
  - "`Resubmit with Annotations`"
  - "`addressed | still_open | cannot_apply`"
  - "`schema_enforced_structured_revision`"
  - "`validated_structured_revision`"
  - "`chat_handoff_only`"
  - "`bundle.revision_started`"
  - "`bundle.revision_completed`"
negative_constraints:
  - "Targeted revision MUST NOT trigger Multi-Pass Review."
  - "V1 is note-based embedded-document review upgraded into structured annotations; direct `patch-apply` behavior is out of scope."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```

### C-036 - Final Review Gate Boundary

```yaml
plan_unit_id: C-036
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  FinalReviewGate routes final-review-only Multi-Pass Review through workflow
  and storage owners; it is enabled only when all bundle docs are Approved/Done
  and no durable annotations remain open, pending Send selection to chat chips
  do not satisfy or bypass it, reruns are explicit, and the gate decision is
  Accept, Reject, or Edit.
gui_related: false
gui_classification_reason: This unit defines workflow gate semantics and artifact taxonomy rather than UI presentation.
split_recommended: false
depends_on: [C-034, C-035]
unblocks: []
acceptance_criteria:
  - "Multi-Pass Review is final-review only and requires approved/done bundle docs with no open durable annotations."
  - "Question/comment annotations count as open until user resolution."
  - "Final gate decisions are Accept, Reject, or Edit."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: final_review_gate_boundary_drift
reasoning_tier: high
context_scope: final_review_gate_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: final_review_gate_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0027
preserved_exact_tokens:
  - "`Multi-Pass Review`"
  - "`Approved/Done`"
  - "`Send selection to chat`"
  - "`Accept | Reject | Edit`"
negative_constraints:
  - "Pending Send selection to chat chips do not satisfy or bypass the final review gate."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/storage-plan.md
```

### C-037 - Recovery Terminology Distinction

```yaml
plan_unit_id: C-037
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Recovery terminology distinguishes safe point as runtime-internal
  retry/remediation anchor, restore point as user-visible history/rewind anchor,
  rollback as explicit request/confirm restoration flow, and worktree baseline
  as execution-root state used to materialize a safe point or restore point
  depending on context.
gui_related: true
gui_classification_reason: The unit includes user-visible restore point, rollback, and UI copy distinctions.
split_recommended: false
depends_on: [C-017, C-029]
unblocks: []
acceptance_criteria:
  - "safe point, restore point, rollback, and worktree baseline remain distinct terms."
  - "Docs and implementations do not use these terms interchangeably."
  - "UI copy preserves the distinction."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: recovery_terminology_conflation
reasoning_tier: high
context_scope: recovery_terminology_distinction
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: recovery_terminology_distinction
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0028
preserved_exact_tokens:
  - "`safe point`"
  - "`restore point`"
  - "`rollback`"
  - "`worktree baseline`"
negative_constraints:
  - "Docs and implementations must not use these terms interchangeably."
  - "UI copy must preserve the distinction."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
```

### C-038 - Runtime Scheduler Recovery Ownership Precedence

```yaml
plan_unit_id: C-038
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Runtime scheduler and recovery ownership routes lifecycle and scheduling to
  Executor_Protocol, runtime events/enums/payloads to Contracts_V0, persistence
  and restart recovery to storage-plan, deterministic recovery defaults to
  Decision_Policy, runtime command IDs to UI_Command_Catalog, Context Lens
  control/action wiring to Wiring_Matrix, and chat/GUI/run-graph/orchestrator/
  wizard surfaces as consumers.
gui_related: true
gui_classification_reason: The unit names GUI, chat, run graph, orchestrator, wizard, and Context Lens consumer surfaces.
split_recommended: false
depends_on: [C-017, C-029, C-037]
unblocks: [C-039, C-046]
acceptance_criteria:
  - "Executor_Protocol owns runtime lifecycle, scheduling, blocked_sequence minting, and restart-recovery to first scheduler.pass handoff from startup_recovered."
  - "Contracts_V0 owns runtime events, enums, payloads, and contracts/UI payload implications."
  - "Legacy packet-era names are compatibility terms only."
  - "Scheduler truth does not split among lexicographic, scored, and UI-derived recovery models."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_scheduler_recovery_owner_split
reasoning_tier: high
context_scope: runtime_scheduler_recovery_ownership_precedence
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_scheduler_recovery_ownership_precedence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0029
preserved_exact_tokens:
  - "`analysis_id`"
  - "`run.scheduler_analysis`"
  - "`allowed_actions[]`"
  - "`recovery_options[]`"
  - "`blocked_sequence`"
  - "`startup_recovered`"
  - "`scheduler.pass`"
  - "`execution_role`"
  - "`/worktree/permission/runtime`"
negative_constraints:
  - "Legacy packet-era names such as analysis_id, run.scheduler_analysis, allowed_actions[], and recovery_options[] are compatibility terms only."
  - "When a consumer doc conflicts with the owner docs, the owner docs win."
  - "Stale canonical text must be replaced or retired, not preserved by later additive notes alone."
  - "Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across Plans/Executor_Protocol.md, Plans/Progression_Gates.md, Plans/plan_graph.schema.json, and Plans/Run_Graph_View.md."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

### C-039 - Source Control Operations Ownership

```yaml
plan_unit_id: C-039
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  SourceControlSurface routes Git-local and Git-remote repo operations, history,
  graph, stash, conflicts, worktree UX, remote-first Source Control/SSH
  consequences, worktree lifecycle, and Worktrees subview routing to
  GitHub_Integration and WorktreeGitImprovement, while GitHub-hosted workflow
  and admin behavior does not belong to Source Control.
gui_related: true
gui_classification_reason: SourceControlSurface, Worktrees subview routing, graph/history/conflict UX, and Source Control rows are user-visible surfaces.
split_recommended: true
split_recommendation_reason: Crosswalk-S0031 is split across Source Control operation, identity, command, and cross-surface panel concerns.
depends_on: [C-010, C-025, C-038]
unblocks: [C-040, C-041, C-042]
acceptance_criteria:
  - "Git-local and Git-remote repo operations, history, graph, stash, conflicts, and worktree UX belong to Source Control."
  - "Remote-first project-mode consequences route through the Source Control and SSH owner chain."
  - "GitHub-hosted workflow/admin behavior does not belong to Source Control."
  - "Remote project mode consumers do not silently substitute local files, local git, or local shells."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_operation_owner_drift
reasoning_tier: high
context_scope: source_control_operations_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/WorktreeGitImprovement.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: source_control_operations_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0031
preserved_exact_tokens:
  - "`SourceControlSurface`"
  - "`Git-local`"
  - "`Git-remote`"
  - "`Plans/GitHub_Integration.md §C`"
  - "`Worktrees`"
  - "`package/lane/run`"
  - "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md"
negative_constraints:
  - "GitHub-hosted workflow/admin behavior does not belong to Source Control."
  - "Remote project mode must not silently substitute local files, local git, or local shells."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/WorktreeGitImprovement.md
  - Plans/UI_Command_Catalog.md
```

### C-040 - Source Control Worktree Identity Cleanup Gates

```yaml
plan_unit_id: C-040
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Source Control and GitHub worktree views stay worktree-centric while attaching
  package-lane and seam/lane-aware visibility; WorktreeGitImprovement owns
  worktree_id, base-branch, and lifecycle semantics; cleanup/archive/prune/
  remove is gated by active-run ownership, blocked recovery, safe-point restore,
  conflict inspection, and newer lane/worktree lineage; Git (GitHub) is only a
  migration alias.
gui_related: true
gui_classification_reason: This unit governs Source Control rows, worktree views, cleanup actions, and visible migration labels.
split_recommended: true
split_recommendation_reason: Crosswalk-S0031 is split across Source Control operation, identity, command, and cross-surface panel concerns.
depends_on: [C-025, C-039]
unblocks: [C-041, C-042]
acceptance_criteria:
  - "Source Control and GitHub worktree views stay worktree-centric with package-lane and seam/lane-aware visibility."
  - "Legacy run/tier row ownership remains compatibility metadata, not shared worktree identity."
  - "Blocked-emitter behavior routes through Contracts and runtime owner docs rather than being inferred from Source Control rows."
  - "Git (GitHub) is a migration alias only."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_worktree_identity_drift
reasoning_tier: high
context_scope: source_control_worktree_identity_cleanup_gates
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: source_control_worktree_identity_cleanup_gates
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0031
preserved_exact_tokens:
  - "`/worktree-centric`"
  - "`/seam/lane-aware`"
  - "`worktree_id`"
  - "`base-branch`"
  - "`/prune/remove`"
  - "`safe-point restore`"
  - "`Git (GitHub)`"
  - "`/surfaces`"
negative_constraints:
  - "Legacy run/tier row ownership is compatibility metadata, not the shared worktree identity model."
  - "Canonical blocked-emitter behavior must not be inferred from Source Control rows."
  - "Live surfaces route through Source Control plus WorktreeGitImprovement rather than preserving a combined Git/GitHub panel."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
  - Plans/Contracts_V0.md
```

### C-041 - Git Diff Commands And Chat Recovery Boundary

```yaml
plan_unit_id: C-041
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Git/diff command anchors are owned by GitHub_Integration, chat rollback and
  recovery anchors remain owned by UI_Command_Catalog, and compatibility
  shorthands such as local-git and worktree/push route through
  Primitive:PatchPipeline and Source Control owners without letting consumer
  help text define conflict precedence.
gui_related: true
gui_classification_reason: This unit governs concrete UI command anchors and chat recovery commands.
split_recommended: true
split_recommendation_reason: Crosswalk-S0031 is split across Source Control operation, identity, command, and cross-surface panel concerns.
depends_on: [C-039, C-040]
unblocks: [C-042]
acceptance_criteria:
  - "Git/diff commands remain owned by GitHub_Integration."
  - "Chat rollback/recovery commands remain owned by UI_Command_Catalog."
  - "Compatibility shorthands route through Primitive:PatchPipeline and Source Control owner docs."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: git_chat_command_boundary_drift
reasoning_tier: high
context_scope: git_diff_commands_chat_recovery_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: git_diff_commands_chat_recovery_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0031
preserved_exact_tokens:
  - "`cmd.git.stage`"
  - "`cmd.git.unstage`"
  - "`cmd.git.discard`"
  - "`cmd.git.diff_open`"
  - "`cmd.git.diff_toggle_mode`"
  - "`cmd.chat.rewind`"
  - "`cmd.chat.revert`"
  - "`/local-git`"
  - "`/worktree/push`"
  - "`Primitive:PatchPipeline`"
  - "`conflict-precedence`"
negative_constraints:
  - "Chat rollback/recovery anchors remain owned by UI_Command_Catalog."
  - "Consumer help text must not define conflict precedence."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/UI_Command_Catalog.md
```

### C-042 - Cross Surface Panel Context Receipt Boundary

```yaml
plan_unit_id: C-042
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Cross-surface actions Open in Source Control, Open in GitHub Actions, and
  Open in Docker Manager use canonical context, shared panel-context envelopes,
  and receipt-extension payloads that extend shared runtime receipts and blocked
  packets with domain capability and identity refs without creating a second
  receipt, navigation, or index owner.
gui_related: true
gui_classification_reason: This unit governs cross-surface panel actions, blocked cards, destination panels, and deep links.
split_recommended: true
split_recommendation_reason: Crosswalk-S0031 is split across Source Control operation, identity, command, and cross-surface panel concerns.
depends_on: [C-039, C-040, C-041]
unblocks: [C-043, C-044]
acceptance_criteria:
  - "Cross-surface actions use exactly Open in Source Control, Open in GitHub Actions, and Open in Docker Manager when canonical context exists."
  - "panel-switch navigation uses a shared panel-context envelope instead of panel-local ad hoc arguments."
  - "receipt-extension payloads extend shared runtime receipt and blocked-payload packets without creating second owners."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: panel_context_receipt_boundary_drift
reasoning_tier: high
context_scope: cross_surface_panel_context_receipt_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/GitHub_Integration.md
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: cross_surface_panel_context_receipt_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0031
preserved_exact_tokens:
  - "`Open in Source Control`"
  - "`Open in GitHub Actions`"
  - "`Open in Docker Manager`"
  - "`panel-switch`"
  - "`panel-context`"
  - "`project_id`"
  - "`repo_id`"
  - "`worktree_id`"
  - "`workflow_id`"
  - "`container_id`"
  - "`image_ref`"
  - "`publish_result_id`"
  - "`/registry/Kubernetes/SSH`"
  - "`/index/reference`"
negative_constraints:
  - "Per-project panel state and run receipts spanning SCM/Actions/Docker/Kubernetes are not underdefined local UI extras."
  - "receipt-extension payloads do not create a second receipt, navigation, or index owner."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/GitHub_Integration.md
  - Plans/Containers_Registry_and_Unraid.md
```

### C-043 - GitHub Actions Surface Identity Boundary

```yaml
plan_unit_id: C-043
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  GitHubActionsSurface uses GitHub API identity and capability, not Git
  transport state, for hosted workflow/admin behavior; Current Branch,
  Workflows, and Settings are subviews of one Actions surface, GitHub API
  remains hidden plumbing, and migration labels such as Git (GitHub) are aliases
  rather than owner changes.
gui_related: true
gui_classification_reason: This unit governs GitHub Actions surface subviews and migration labels visible in the UI.
split_recommended: false
depends_on: [C-042]
unblocks: [C-046]
acceptance_criteria:
  - "GitHub Actions uses GitHub API identity and capability rather than Git transport state."
  - "Current Branch, Workflows, and Settings are subviews of one Actions surface."
  - "GitHub API remains hidden plumbing, not a user panel."
  - "Final GUI migration labels are routing aliases, not owner changes."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: github_actions_identity_boundary_drift
reasoning_tier: high
context_scope: github_actions_surface_identity_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/newtools.md
node_compile_hint:
  mode: github_actions_surface_identity_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0032
preserved_exact_tokens:
  - "`GitHubActionsSurface`"
  - "`GitHub API`"
  - "`Current Branch`"
  - "`Workflows`"
  - "`Settings`"
  - "`Git (GitHub)`"
  - "ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md"
negative_constraints:
  - "GitHub API plumbing is hidden and must not be exposed as a user panel."
  - "Final GUI migration labels such as Git (GitHub) are routing aliases, not owner changes."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/newtools.md
```

### C-044 - Docker Manager Umbrella Persistence Boundary

```yaml
plan_unit_id: C-044
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  DockerManagerSurface is the canonical umbrella for Docker, Podman,
  registries/Docker Hub, compose, build/bake, Publish/Unraid, and
  project-focused Kubernetes; it owns runtime/build/publish and project
  operations while routing persistence as global settings plus project-scoped
  state and reusing newtools doctor/result minima rather than inventing
  parallel IDs.
gui_related: false
gui_classification_reason: This unit defines surface ownership and persistence boundaries rather than visual presentation.
split_recommended: false
depends_on: [C-042]
unblocks: [C-045, C-046]
acceptance_criteria:
  - "Docker Manager is the canonical umbrella for Docker, Podman, registries, compose, build/bake, Publish/Unraid, and project-focused Kubernetes."
  - "/Podman/Kubernetes wording remains compatibility shorthand."
  - "Unraid and Kubernetes are not required top-level shell surfaces for MVP."
  - "Docker Manager reuses newtools doctor IDs and result payload shapes instead of inventing parallel IDs."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: docker_manager_persistence_boundary_drift
reasoning_tier: high
context_scope: docker_manager_umbrella_persistence_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
node_compile_hint:
  mode: docker_manager_umbrella_persistence_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0033
preserved_exact_tokens:
  - "`DockerManagerSurface`"
  - "`Docker Manager`"
  - "`Docker/Podman/Kubernetes`"
  - "`/Podman/Kubernetes`"
  - "`Publish / Unraid`"
  - "`/runtime/build/publish`"
  - "`/build/compose/registry/publish/Kubernetes`"
  - "`/runtime/context`"
  - "`/context/workload`"
  - "ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md"
negative_constraints:
  - "`/Podman/Kubernetes` wording is a compatibility shorthand, not separate shell ownership."
  - "Unraid and Kubernetes are not required top-level shell surfaces for MVP."
  - "Docker Manager must not invent parallel doctor IDs or result payload shapes."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
```

### C-045 - External Reference Baseline Non-Ownership

```yaml
plan_unit_id: C-045
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  External references for Git worktrees, VS Code/SCM, GitHub Actions, Docker,
  Kubernetes, JetBrains, GitLens, and GitKraken-style behavior remain
  reconciliation inputs that may inform owner-doc wording without becoming live
  product owners.
gui_related: false
gui_classification_reason: This unit defines evidence/reference status and owner boundaries.
split_recommended: false
depends_on: [C-039, C-043, C-044]
unblocks: [C-046]
acceptance_criteria:
  - "External references remain useful reconciliation inputs."
  - "External references do not become live product owners."
  - "Owner-doc wording remains controlled by canonical Plans."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: external_reference_owner_leak
reasoning_tier: standard
context_scope: external_reference_baseline_non_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: external_reference_baseline_non_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0034
preserved_exact_tokens:
  - "`git-scm.com/docs/git-worktree`"
  - "`/docs/git-worktree`"
  - "`/committing`"
  - "`/fetch/pull/push`"
  - "`/outgoing`"
  - "`Current Branch`"
  - "`Workflows`"
  - "`Settings`"
  - "`logs`"
  - "`exec`"
  - "`port-forward`"
  - "`/logs/exec/port-forward/Helm/workload`"
  - "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md"
negative_constraints:
  - "External references are reconciliation inputs and must not become live product owners."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
```

### C-046 - Feature Owner Precedence And Action ID Compatibility

```yaml
plan_unit_id: C-046
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  When feature-owner docs disagree, Crosswalk records owner precedence and
  secondary-doc constraints; newtools owns Docker and Actions doctor IDs/result
  minima, usage-feature owns cost_usage and deep-link usage identity, Section15
  owns workspace/thread/browser/dev-session identities, UI_Wiring_Rules and
  Wiring_Matrix own command gating, blocked routing stays with Contracts_V0 and
  destination owners, and canonical blocked/recovery payloads use ordered
  allowed_action_ids.
gui_related: true
gui_classification_reason: This unit governs visible doctor IDs, Usage/Ledger deep links, blocked routing, and action-id behavior.
split_recommended: true
split_recommendation_reason: Crosswalk-S0035 is split across feature-owner precedence, HITL action-list, and secondary cleanup concerns.
depends_on: [C-038, C-043, C-044, C-045]
unblocks: [C-047, C-048]
acceptance_criteria:
  - "Consumer wording does not decide feature-owner conflicts."
  - "doctor.registry.auth remains deprecated alias and doctor.dockerhub.auth.capability is the preferred visible ID."
  - "blocked routing is owned by Contracts_V0 and destination feature owners, not retyped locally."
  - "Legacy allowed_actions[] is compatibility-only; canonical blocked and recovery payloads use ordered allowed_action_ids[]."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: feature_owner_precedence_action_id_drift
reasoning_tier: high
context_scope: feature_owner_precedence_action_id_compatibility
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/newtools.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
  - Plans/human-in-the-loop.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: feature_owner_precedence_action_id_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0035
preserved_exact_tokens:
  - "`newtools.md`"
  - "`doctor.registry.auth`"
  - "`doctor.dockerhub.auth.capability`"
  - "`cost_usage`"
  - "`/deep-link/usage`"
  - "`/workspace/thread/browser/dev-session`"
  - "`/gating`"
  - "`/internal`"
  - "`/blocked`"
  - "`safe point`"
  - "`restore point`"
  - "`allowed_actions[]`"
  - "`allowed_action_ids[]`"
negative_constraints:
  - "Consumer wording must not decide feature-owner conflicts."
  - "`/blocked` routing must not be retyped locally by Crosswalk."
  - "Legacy `allowed_actions[]` is compatibility-only; canonical blocked and recovery payloads use ordered `allowed_action_ids[]`."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/newtools.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
  - Plans/human-in-the-loop.md
  - Plans/Contracts_V0.md
```

### C-047 - HITL Action List Vocabulary Boundary

```yaml
plan_unit_id: C-047
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  HITL approval requests may use explicit action-list vocabulary only where
  Contracts_V0 owns the request shape; blocked and recovery payloads stay on
  canonical action-id and allowed_action_ids naming so implementers do not
  guess between HITL and recovery fields.
gui_related: false
gui_classification_reason: This unit defines payload vocabulary ownership rather than UI presentation.
split_recommended: true
split_recommendation_reason: Crosswalk-S0035 is split across feature-owner precedence, HITL action-list, and secondary cleanup concerns.
depends_on: [C-046]
unblocks: [C-048]
acceptance_criteria:
  - "HITL approval requests use action-list vocabulary only where Contracts_V0 owns the request shape."
  - "Blocked/recovery payloads stay on canonical action-id and allowed_action_ids naming."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hitl_action_list_vocabulary_drift
reasoning_tier: high
context_scope: hitl_action_list_vocabulary_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: hitl_action_list_vocabulary_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0035
preserved_exact_tokens:
  - "`HITL`"
  - "`Contracts_V0`"
  - "`action-list`"
  - "`action-id`"
  - "`allowed_action_ids[]`"
negative_constraints:
  - "Action-list vocabulary is allowed only where Contracts_V0 owns the request shape."
  - "Blocked/recovery payloads must stay on canonical action-id and allowed_action_ids naming."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
```

### C-048 - Secondary Consumer Cleanup UI State Resolution

```yaml
plan_unit_id: C-048
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Secondary broad-pass cleanup keeps chat and file-tree docs as consumers of the
  legacy Git/GitHub model until reconciled with feature-owner docs, preserves
  git* and actions* built-in chat namespaces, leaves Docker/registry/Kubernetes
  operational identity outside Multi-Account unless later moved by an owner doc,
  and resolves underdefined UI-state contracts in named surface owner docs
  rather than consumer-only state.
gui_related: true
gui_classification_reason: This unit governs chat/file-tree consumers, built-in chat namespaces, and underdefined UI-state contracts.
split_recommended: true
split_recommendation_reason: Crosswalk-S0035 is split across feature-owner precedence, HITL action-list, and secondary cleanup concerns.
depends_on: [C-046, C-047]
unblocks: []
acceptance_criteria:
  - "Chat and file-tree docs remain consumers of the legacy Git/GitHub model until reconciled with feature-owner docs."
  - "git* and actions* remain built-in chat command namespaces."
  - "Docker/registry/Kubernetes operational identity is not owned by Multi-Account unless a later owner doc explicitly moves it."
  - "Underdefined UI-state contracts are resolved in named surface owner docs rather than by adding consumer-only state."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: secondary_consumer_ui_state_owner_drift
reasoning_tier: high
context_scope: secondary_consumer_cleanup_ui_state_resolution
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/newtools.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: secondary_consumer_cleanup_ui_state_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0035
preserved_exact_tokens:
  - "`chat and file-tree`"
  - "`legacy Git/GitHub model`"
  - "`git*`"
  - "`actions*`"
  - "`Docker/registry/Kubernetes`"
  - "`Multi-Account`"
  - "`/underdefined`"
  - "`recovery_options`"
  - "`recovery_options[]`"
  - "`allowed_action_ids`"
negative_constraints:
  - "Docker/registry/Kubernetes operational identity is not owned by Multi-Account unless a later owner doc explicitly moves it."
  - "`/underdefined` UI-state contracts must be resolved in the named surface owner docs rather than by adding consumer-only state."
  - "Prescriptive recovery_options or recovery_options[] wording must be retired in favor of allowed_action_ids and allowed_action_ids[]."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/newtools.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
  - Plans/human-in-the-loop.md
```

### C-001 - Crosswalk Source-Preserving Bridge Retired

```yaml
plan_unit_id: C-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  The former Crosswalk source-preserving bridge is retired in place after Phase
  2B atomized or structurally dispositioned Crosswalk-S0001 through
  Crosswalk-S0039 into C-002 through C-048 or explicit structural coverage.
  C-001 remains only as migration lineage for the retired bridge span and must
  not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- C-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by C-002 through C-048 and structural coverage_map dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 042 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Crosswalk.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0038
preserved_exact_tokens:
- C-001
- source_preserving_planunit
- C-002
- C-048
negative_constraints:
- "Do not remap atomized Crosswalk spans back to C-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to C-001 remain auditable."
owner_hints:
- Plans/Crosswalk.md
```
