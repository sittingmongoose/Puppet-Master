# Shard 010: PlanUnits

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L808-L8167

Source SHA256: `46df2540088076542f93f48d3f2e59932d097185a55261e4d591f01b270d3443`

---

## PlanUnits

### SMPFS-002 - Section 15 Authority And Owner Boundary

```yaml
plan_unit_id: SMPFS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Section 15 owns promoted-feature shell and surface behavior while storage, command, permission, tool, usage, FileManager, and widget SSOTs remain canonical subsystem owners through ContractRefs and owner/consumer boundaries.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
- SP-001
- T-001
- UCC-001
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-002 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: standard
context_scope: section15_authority
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: section15_authority_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0002
preserved_exact_tokens:
- Section 15 Promoted Features Spec
- 0. Scope and SSOT status
- Puppet Master MVP GUI plan addendum
- SSOT
- must not redefine their persistence schemas or command catalogs
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/usage-feature.md
- Plans/FileManager.md
```

### SMPFS-003 - Workspace-Tab Shell Ownership

```yaml
plan_unit_id: SMPFS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'The app shell is workspace-tab based: each workspace tab owns one active project, project switching is a workspace-tab concern rather than a title-bar project bar, and background, blocked, or failed activity remains visible through persistent shell regions.'
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-003 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shell_ownership_drift
reasoning_tier: standard
context_scope: workspace_tab_shell
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: workspace_tab_shell_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0004
preserved_exact_tokens:
- 1. Canonical shell and surface model
- 1.1 Shell ownership
- workspace tab
- one active project
- Title bar
- background/blocked/failed activity
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Wiring_Matrix.md
```

### SMPFS-004 - Persistent Shell Surface Inventory

```yaml
plan_unit_id: SMPFS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Persistent shell surfaces include primary in-window and secondary detached surfaces, preserving workspace preview, detached preview, terminal, browser, DevTools, compare/review, and related shell-region identities.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- SP-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-004 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: surface_inventory_drift
reasoning_tier: standard
context_scope: persistent_shell_surfaces
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: persistent_shell_surface_inventory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0005
preserved_exact_tokens:
- 1.2 Persistent shell surfaces
- workspace_preview
- detached_preview
- terminal
- browser
- DevTools
- compare/review
- primary in-window surfaces
- secondary detached surfaces
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-005 - Shell Surface Hosting Constraints

```yaml
plan_unit_id: SMPFS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser and HTML preview are editor or workspace-tab first; the bottom panel is not the canonical browser host, and no promoted feature may depend only on floating transient overlays for navigation, review, or activity state.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-005 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: surface_hosting_drift
reasoning_tier: standard
context_scope: persistent_shell_surfaces
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: shell_surface_hosting_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0005
preserved_exact_tokens:
- browser
- HTML preview
- editor-area or workspace-tab first
- bottom panel is not the canonical browser host
- floating/transient overlays
negative_constraints:
- No feature may depend only on floating/transient overlays for state that must survive navigation, review, or background activity.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Wiring_Matrix.md
```

### SMPFS-006 - Research Session Runtime Class

```yaml
plan_unit_id: SMPFS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: A research_session is a restricted automation_session that shares browser/runtime infrastructure while enforcing tighter lifecycle, profile isolation, blocked-state visibility, and no implicit takeover of normal browsing.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-006 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_runtime_scope_drift
reasoning_tier: standard
context_scope: research_session_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: research_session_runtime_class
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0007
preserved_exact_tokens:
- 1.3 Browser surface classes
- 1.3A Research session alignment
- research_session
- automation_session
- browser/runtime infrastructure
- profile isolation
- blocked-state visibility
negative_constraints:
- Research sessions are not a replacement for normal browser tabs and must not silently take over persistent browsing state.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
```

### SMPFS-007 - Research Browser Affordance Alignment

```yaml
plan_unit_id: SMPFS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Research-session browser-action affordances consume Tools, Permissions, and UI command routing; restoring or revealing a blocked/stopped research surface returns stopped with attention_required rather than silently escalating or promoting automation.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-007 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_affordance_drift
reasoning_tier: standard
context_scope: research_session_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: research_browser_affordance_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0007
preserved_exact_tokens:
- research-session
- /browser-action
- stopped
- attention_required
- session_granted
- Tools
- Permissions
- UI command routing
negative_constraints:
- Research browser restore must not silently escalate permissions or convert a restricted automation session into normal browsing.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-008 - Research Action Tiers And Evidence

```yaml
plan_unit_id: SMPFS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Research action tiers preserve the 15-action list, excluded action categories, annotation payloads, evidence/citation behavior, and capture-format permission boundaries including session_granted for screenshot and PDF requests.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-008 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_action_permission_drift
reasoning_tier: standard
context_scope: research_action_tiers
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: research_action_tiers_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0008
preserved_exact_tokens:
- Action tiers
- webfetch
- webextract
- webresearch
- session_granted
- screenshot
- pdf
- annotation payload
- 15-action
negative_constraints:
- webfetch screenshot and pdf capture-format requests require session_granted and must not auto-elevate silently from static fetch permission.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-009 - Research Lifecycle Boundaries

```yaml
plan_unit_id: SMPFS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Research session creation is implicit only for webfetch/webextract actions or webresearch fallback, remains transient unless explicitly escalated, and has no hidden takeover, promotion, or normal-browser persistence side effect.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-009 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_lifecycle_drift
reasoning_tier: standard
context_scope: research_action_tiers
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: research_lifecycle_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0008
preserved_exact_tokens:
- webfetch
- webextract
- webresearch
- fallback
- transient
- takeover
- promotion
- explicit automation escalation
negative_constraints:
- Research sessions must not silently promote, persist, or take over normal browsing state.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
```

### SMPFS-010 - Thread And Session Navigation Persistence

```yaml
plan_unit_id: SMPFS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Thread and session navigation is persistent sidebar or shell-region behavior, preserving background progress, blocked/error badges, attention surfaces, restore-and-branch lineage, and usage access without reviving floating-thread-selector canon.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- ACD-008
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-010 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: thread_navigation_drift
reasoning_tier: standard
context_scope: thread_session_navigation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: thread_session_navigation_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0010
preserved_exact_tokens:
- 1.4 Thread and session navigation
- 1.5 Thread usage surface
- sidebar
- persistent shell region
- blocked/error badges
- restore then fork
- usage
negative_constraints:
- Floating thread-selector overlay is not the canonical thread navigation model.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Detached usage pop-out remains non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-011 - Assistant Worktree Surface Points

```yaml
plan_unit_id: SMPFS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Assistant worktrees are an MVP per-project setting surfaced through chat header, thread selector icon, Source Control accordion, breadcrumb toggle, settings, and merge/test affordances without hiding project/worktree state.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UCC-001
- W-001
unblocks: []
acceptance_criteria:
- SMPFS-011 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_surface_drift
reasoning_tier: standard
context_scope: assistant_worktree_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: assistant_worktree_surface_points
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0011
preserved_exact_tokens:
- Assistant worktree integration
- per-project setting
- chat header
- thread selector icon
- Source Control accordion
- breadcrumb toggle
- merge/test
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/WorktreeGitImprovement.md
```

### SMPFS-012 - Worktree Cross-Owner Boundaries

```yaml
plan_unit_id: SMPFS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Assistant worktree integration preserves GitHub Integration, WorktreeGitImprovement, FinalGUISpec, Orchestrator/Source Control, and chain-wizard owner splits, consumes the current seven-tab Orchestrator shell from Orchestrator_Page, and keeps Non-MVP exclusions from becoming implicit MVP behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-012 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_owner_boundary_drift
reasoning_tier: standard
context_scope: assistant_worktree_owner_boundary
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: worktree_cross_owner_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0011
preserved_exact_tokens:
- GitHub Integration
- WorktreeGitImprovement
- FinalGUISpec
- Orchestrator
- Source Control
- chain wizard
- Non-MVP
negative_constraints:
- Section 15 must not redefine Source Control, GitHub Integration, or chain-wizard ownership while exposing worktree surfaces.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/WorktreeGitImprovement.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
```

### SMPFS-013 - Thread Context Detail Usage Surface

```yaml
plan_unit_id: SMPFS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Thread context detail preserves the active-thread context indicator, compact rows, Deep Plan, usage/tokens/cost hover, Compact Now, and editor-tab Context Detail Pane while rejecting a detached usage pop-out as canonical.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-013 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: thread_usage_surface_drift
reasoning_tier: standard
context_scope: thread_usage_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: thread_context_detail_usage_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0011
preserved_exact_tokens:
- active-thread context indicator
- compact rows
- Deep Plan
- usage/tokens/cost hover
- Compact Now
- Context Detail Pane
- detached usage pop-out
negative_constraints:
- Detached usage pop-out is not the canonical per-thread usage surface.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-014 - Terminal Surface Model

```yaml
plan_unit_id: SMPFS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The terminal is the canonical interactive shell surface with up to two terminal sections, tab and pane layout families, bottom-default placement, detach/move/resize behavior, labels, and settings vocabulary.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-014 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_surface_drift
reasoning_tier: standard
context_scope: terminal_surface_model
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_surface_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0012
preserved_exact_tokens:
- 1.6 Dev-loop and terminal surface model
- canonical interactive shell
- up to two terminal sections
- tabs
- panes
- bottom default
- detach
- move/resize
- labels
- settings
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
```

### SMPFS-015 - Terminal Runtime Identity Contract

```yaml
plan_unit_id: SMPFS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal runtime identity preserves terminal_section_id, terminal_tab_id, terminal_pane_id, terminal_session_id, and dev_session_id owner splits; presentation changes must not mint runtime identity and dev_session_id is not a shell-session alias.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-015 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_identity_drift
reasoning_tier: standard
context_scope: terminal_runtime_identity
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_runtime_identity_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0013
preserved_exact_tokens:
- terminal_section_id
- terminal_tab_id
- terminal_pane_id
- terminal_session_id
- dev_session_id
- same terminal session
- runtime identity
negative_constraints:
- Moving or relabeling a tab or pane changes presentation state only and MUST NOT mint a new runtime identity.
- A dev_session_id is not a shell-session alias and MUST NOT be used where exact PTY continuity is required.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-016 - Terminal Presentation Containers

```yaml
plan_unit_id: SMPFS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal presentation containers preserve labels, roles, settings precedence, tab/pane motion, reveal/move/rename/pin/close/detach/reattach behavior, and requested/effective disclosure without changing runtime identity.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-016 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_presentation_drift
reasoning_tier: standard
context_scope: terminal_presentation_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_presentation_containers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0013
preserved_exact_tokens:
- Terminal section, tab, pane, and session model
- labels
- roles
- settings precedence
- reveal
- move
- rename
- pin
- close
- detach
- reattach
- requested/effective
negative_constraints:
- Role hints MUST NOT override terminal_session_id ownership, actual pane runtime status, cwd/profile/runtime context of an already running session, explicit user labels, or explicit user default overrides.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
```

### SMPFS-017 - Terminal Reveal Ownership

```yaml
plan_unit_id: SMPFS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Open in Terminal and Show Terminal reveal existing sessions first, historical state shows transcript or recovery state, and only explicit new/split/restart actions mint a new terminal runtime identity.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-017 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_reveal_drift
reasoning_tier: standard
context_scope: terminal_reveal_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_reveal_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0014
preserved_exact_tokens:
- Cross-surface ownership and reveal rules
- Open in Terminal
- Show Terminal
- existing terminal sessions
- historical state
- new/split/restart
- terminal_session_id
negative_constraints:
- Adjacent run/debug, IDE, remote, and workflow-heavy systems may reference or reveal Terminal, but they MUST NOT redefine terminal ownership or runtime identity.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/storage-plan.md
```

### SMPFS-018 - Dev-Session Linkback And Adoption

```yaml
plan_unit_id: SMPFS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Derived artifacts preserve terminal_session_id and dev_session_id linkbacks; adoption into a dev session is explicit and must never silently attach arbitrary shell sessions from weak heuristics.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-018 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dev_session_adoption_drift
reasoning_tier: standard
context_scope: dev_session_linkback
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: dev_session_linkback_adoption
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0014
preserved_exact_tokens:
- terminal_session_id
- dev_session_id
- derived artifacts
- adoption is explicit
- weak heuristics
negative_constraints:
- PM must not silently adopt arbitrary shell sessions into a dev session from weak heuristics.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-019 - Terminal Interaction Mode State Machine

```yaml
plan_unit_id: SMPFS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal interaction modes preserve live_input, scrollback_review, selection_active, search_active, tui_capture, shortcut precedence, PTY/TUI ownership, and accessible state disclosure.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-019 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_interaction_state_drift
reasoning_tier: standard
context_scope: terminal_interaction_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_interaction_mode_state_machine
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0015
preserved_exact_tokens:
- Interaction modes and selection semantics
- live_input
- scrollback_review
- selection_active
- search_active
- tui_capture
- PTY
- TUI
- shortcut precedence
negative_constraints:
- One keystroke MUST NOT trigger both a terminal action and an application action.
- Selection-active keeps copy and selection-adjustment terminal-owned; non-selection terminal actions must not clear active selection unless they inherently replace it.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/Permissions_System.md
```

### SMPFS-020 - Terminal Selection Copy Search Semantics

```yaml
plan_unit_id: SMPFS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal selection, copy, paste, and search semantics preserve linear selection, logical wrapped-line copy, live/review copy behavior, active-owner paste, TUI override paths, search/review transitions, and unicode/grapheme integrity.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-020 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_selection_drift
reasoning_tier: standard
context_scope: terminal_interaction_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_selection_copy_search_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0015
preserved_exact_tokens:
- linear selection
- logical wrapped-line copy
- live/review copy
- active-owner paste
- TUI override
- search
- unicode
- grapheme
negative_constraints:
- Terminal copy/paste/search behavior must not double-trigger app-wide actions or silently discard active terminal selection state.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
```

### SMPFS-021 - Shell Integration Confidence

```yaml
plan_unit_id: SMPFS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Shell integration confidence tiers rich, basic, and opaque constrain command-boundary claims; Puppet Master must not fabricate command text, success, block markers, exact boundaries, or exit status beyond observed data.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- T-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-021 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shell_integration_fabrication
reasoning_tier: standard
context_scope: shell_integration_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: shell_integration_confidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0016
preserved_exact_tokens:
- Command-block and shell-integration rules
- rich
- basic
- opaque
- command boundaries
- command text
- success semantics
- exit status
negative_constraints:
- Puppet Master MUST NOT fabricate exact command boundaries, command text, success semantics, block markers, or exit status when shell integration is weaker than the observed data supports.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/Tools.md
```

### SMPFS-022 - Command Block Identity Metadata

```yaml
plan_unit_id: SMPFS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Command blocks are transcript-oriented metadata with command_block_id, terminal_session_id ownership, lifecycle states, marker references, nullable command/cwd/exit fields, confidence, and compatibility mapping from session_terminated_while_running to session-end.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-022 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_block_identity_drift
reasoning_tier: standard
context_scope: command_block_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: command_block_identity_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0016
preserved_exact_tokens:
- command_block_id
- terminal_session_id
- block-start
- block-end
- session_terminated_while_running
- session-end
- confidence
- nullable cwd
negative_constraints:
- Command-block identity is transcript-oriented metadata, not rendered UI fragments.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md'
compatibility_only_notes:
- session_terminated_while_running maps to session-end compatibility vocabulary.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-023 - Command Review Retention Degradation

```yaml
plan_unit_id: SMPFS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Command review surfaces, cards, navigation, and sticky headers degrade honestly when transcript retention is pruned; restored panes restore structure and recent transcript first and reconnect only when runtime support exists.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- ACD-008
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-023 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_review_degradation_drift
reasoning_tier: standard
context_scope: command_review_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: command_review_retention_degradation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0016
preserved_exact_tokens:
- command cards
- navigation
- sticky headers
- history-unavailable
- scrollback
- retained raw transcript
- restored panes
- reconnect
negative_constraints:
- If pruning invalidates backing output, raw-transcript-only actions degrade honestly rather than fabricating history.
- Restore language must not blur live continuity with historical slot recovery.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md'
compatibility_only_notes: []
stale_retired_dispositions:
- degraded-copy and history-unavailable wording remains live degradation vocabulary, not vague uncertainty.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/Run_Modes.md
```

### SMPFS-024 - Terminal Session Lifecycle Actions

```yaml
plan_unit_id: SMPFS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal lifecycle preserves session states and actions including clear_scrollback, restart_session, terminate_session, kill_session, close-vs-terminate distinction, pre-run safety, and user-visible lifecycle disclosure.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-024 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_lifecycle_drift
reasoning_tier: standard
context_scope: terminal_lifecycle_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_session_lifecycle_actions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0017
preserved_exact_tokens:
- Session lifecycle and user-visible actions
- clear_scrollback
- restart_session
- terminate_session
- kill_session
- close vs terminate
- pre-run safety
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Run_Modes.md
```

### SMPFS-025 - Terminal Status Attention Close Ladder

```yaml
plan_unit_id: SMPFS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal section, tab, and pane statuses preserve runtime states, attention flags, hidden-output semantics, relaunch/review affordances, and the close/interrupt/terminate/kill ladder.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-025 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_attention_drift
reasoning_tier: standard
context_scope: terminal_lifecycle_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_status_attention_close_ladder
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0017
preserved_exact_tokens:
- section/tab/pane states
- running
- blocked
- exited
- attention flags
- hidden output
- relaunch
- review
- interrupt
- terminate
- kill
negative_constraints:
- Close, interrupt, terminate, and kill must remain distinct user-visible actions with honest consequences.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/storage-plan.md
```

### SMPFS-026 - Terminal Empty State And Restore Language

```yaml
plan_unit_id: SMPFS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal empty-state and first-run language preserves Start Terminal, linked-surface activation, historical banners, runtime-vs-settings boundaries, restored_without_history, and no live-continuity blur.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-026 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_restore_language_drift
reasoning_tier: standard
context_scope: terminal_empty_state_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_empty_state_restore_language
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0018
preserved_exact_tokens:
- Empty-state and first-run rules
- Start Terminal
- linked-surface activation
- historical banners
- runtime vs settings
- restored_without_history
negative_constraints:
- Restore language must not imply live continuity when only metadata or limited review state was restored.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/storage-plan.md
```

### SMPFS-027 - Requested Vs Effective Runtime Contract

```yaml
plan_unit_id: SMPFS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Requested/effective state is one cross-feature runtime model spanning terminal, browser, provider, tool, project runtime, MCP/tool availability, remote/local surfaces, and project switching.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-027 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: requested_effective_drift
reasoning_tier: standard
context_scope: requested_effective_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: requested_effective_runtime_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0019
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0020
preserved_exact_tokens:
- 2. Cross-feature runtime contracts
- 2.1 Requested vs effective state
- requested
- effective
- terminal
- browser
- provider
- tool
- MCP
- remote/local
negative_constraints:
- Requested preferences MUST NOT let the UI imply a terminal or shell capability that the effective runtime cannot currently provide.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-028 - Requested Vs Effective Disclosure Freshness

```yaml
plan_unit_id: SMPFS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Differences between requested and effective state must be visible; stale or degraded projections must revalidate before mutating actions and disclose freshness, projection_health, pending-sync, and degraded-copy wording honestly.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-028 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: freshness_disclosure_drift
reasoning_tier: standard
context_scope: requested_effective_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: requested_effective_disclosure_freshness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0020
preserved_exact_tokens:
- differences between requested and effective
- /revalidate
- /freshness
- projection_freshness
- projection_health
- pending-sync
- degraded-copy
negative_constraints:
- The UI must not imply unsupported terminal, browser, provider, or shell capability.
- Stale or degraded projections must /revalidate before mutating actions.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions:
- stale or degraded projections are live freshness/revalidation vocabulary, not retired prose.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
```

### SMPFS-029 - Stable Promoted Identity Catalog

```yaml
plan_unit_id: SMPFS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Section 15 preserves the promoted stable identity catalog from project_id through automation_session_id, with path alone insufficient for project restore semantics and shell/container identities distinct from target_kind route classes.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-029 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: identity_catalog_drift
reasoning_tier: standard
context_scope: promoted_identity_catalog
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: stable_promoted_identity_catalog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0021
preserved_exact_tokens:
- project_id
- workspace_tab_id
- window_id
- thread_id
- branch_id
- browser_tab_id
- preview_session_id
- terminal_section_id
- terminal_tab_id
- terminal_pane_id
- terminal_session_id
- dev_session_id
- automation_session_id
- target_kind
negative_constraints:
- A path alone is not a sufficient identity for project restore semantics.
- dev_session_id owns higher-level workflow continuity and MUST NOT replace terminal_session_id when exact shell reuse is required
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/FinalGUISpec.md
```

### SMPFS-030 - Identity-Aware Reveal And Runtime Boundaries

```yaml
plan_unit_id: SMPFS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Terminal and browser reveal behavior preserves presentation continuity, exact PTY continuity, and workflow continuity boundaries: terminal_section_id, terminal_tab_id, and terminal_pane_id own shell presentation/reveal targets, terminal_session_id owns exact PTY continuity, and dev_session_id owns workflow continuity without replacing shell identity.'
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
- UCC-001
- WM-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-030 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: identity_reveal_boundary_drift
reasoning_tier: standard
context_scope: promoted_identity_reveal
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: identity_aware_reveal_runtime_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0021
preserved_exact_tokens:
- terminal_section_id
- terminal_tab_id
- terminal_pane_id
- terminal_session_id
- dev_session_id
- Open in Terminal
- Show Terminal
- New Terminal
- explicit split
- explicit restart
- route_target
- OpenSubject
- OpenFile
negative_constraints:
- dev_session_id owns higher-level workflow continuity and MUST NOT replace terminal_session_id when exact shell reuse is required.
- Moving, renaming, pinning, docking, or detaching sections, tabs, and panes are presentation changes only and do not mint new PTY identity.
- dev_session_id owns higher-level workflow continuity and MUST NOT replace terminal_session_id when exact shell reuse is required
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/FileManager.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/assistant-chat-design.md
```

### SMPFS-031 - Background And Blocked Attention Routing

```yaml
plan_unit_id: SMPFS-031
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Background and blocked work routes through durable attention items that preserve owner, reason, route payload, projection trust, and resume_url transport while History, Progress/Dashboard, chat/thread, and system notifications keep distinct attention purposes.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-031 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: attention_routing_drift
reasoning_tier: standard
context_scope: attention_routing
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: background_blocked_attention_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0022
preserved_exact_tokens:
- project_state:v1:{project_id}
- project_state
- resume_url
- History
- Progress / Dashboard
- /chat
- /thread
- projection trust
- Ledger
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
```

### SMPFS-032 - Attention Surfaces And Project Badges

```yaml
plan_unit_id: SMPFS-032
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Background activity, blocked episodes, action-needed states, attention-center rows, project-card badges, title-bar attention badges, command-palette resume/fix entries, and /fix routes normalize into visible canonical attention surfaces instead of unrelated UI hints.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-032 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: attention_surface_drift
reasoning_tier: standard
context_scope: attention_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: attention_surfaces_project_badges
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0022
preserved_exact_tokens:
- project-attention
- attention center
- project-card badges
- title-bar attention badges
- command-palette "resume/fix"
- /fix
- wizard cards
- thread badges
- dashboard CtAs
- blocked-node lists
- auth badges
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/assistant-chat-design.md
```

### SMPFS-033 - FileSafe Blocked Outcome Semantics

```yaml
plan_unit_id: SMPFS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: FileSafe dangerous-command blocks are first-class blocked outcomes, and rerun after destructive blocks respects restore-before-rerun requirements when local work or safe-point rules require them.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-033 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: filesafe_block_semantics_drift
reasoning_tier: standard
context_scope: filesafe_blocking
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: filesafe_blocked_outcome_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0024
preserved_exact_tokens:
- Dangerous-Command Blocking (FileSafe)
- FileSafe blocks
- blocked outcomes
- rerun
- restore-before-rerun
- safe-point
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-034 - FileSafe Visible Blocked UI

```yaml
plan_unit_id: SMPFS-034
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Blocked commands render visible blocked UI in thread, terminal/output surfaces, and action-needed routing, and the feature cannot rely on terminal-only messaging.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-034 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: filesafe_block_ui_drift
reasoning_tier: standard
context_scope: filesafe_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: filesafe_visible_blocked_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0024
preserved_exact_tokens:
- blocked UI
- thread
- terminal/output surfaces
- action-needed routing
- terminal-only messaging
negative_constraints:
- The feature does not rely on terminal-only messaging.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-035 - Branch Restore Boundary And Lineage

```yaml
plan_unit_id: SMPFS-035
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Branching conversations always start from a restore point or equivalent preserved state boundary, create a new thread/session identity linked to the source branch and restore point, and leave the source thread intact.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-035 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: branch_restore_lineage_drift
reasoning_tier: standard
context_scope: branching_conversations
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: branch_restore_boundary_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0025
preserved_exact_tokens:
- Branching Conversations (Restore Then Fork)
- restore point
- preserved state boundary
- new thread/session identity
- source branch
- source thread remains intact
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
```

### SMPFS-036 - Branch Navigation And Confirmation UI

```yaml
plan_unit_id: SMPFS-036
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Branch labels, source-origin lineage, branch origin time, and dirty or active thread confirmation are visible in history and navigation surfaces before branching from risky source state.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-036 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: branch_navigation_ui_drift
reasoning_tier: standard
context_scope: branching_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: branch_navigation_confirmation_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0025
preserved_exact_tokens:
- branch labels
- source-origin lineage
- branch origin time
- history/navigation surfaces
- dirty or active thread
- confirmation
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-037 - Project Instructions Runtime Source Boundary

```yaml
plan_unit_id: SMPFS-037
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The in-app project instructions editor writes the same AGENTS-style guidance, project rules, or equivalent instruction files that the runtime consumes, without creating a shadow runtime source.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-037 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instructions_source_boundary_drift
reasoning_tier: standard
context_scope: project_instructions
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: project_instructions_runtime_source_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0026
preserved_exact_tokens:
- In-App Project Instructions Editor
- project-rules/instruction files
- AGENTS-style guidance
- project rules
- shadow runtime source
negative_constraints:
- Editing AGENTS-style guidance, project rules, or equivalent instruction files cannot create a shadow runtime source.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
```

### SMPFS-038 - Project Instructions Editor UI

```yaml
plan_unit_id: SMPFS-038
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The project instructions editor exposes path, scope, validation or lint feedback, and dirty state for runtime-consumed instruction files.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-038 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instructions_editor_ui_drift
reasoning_tier: standard
context_scope: project_instructions_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: project_instructions_editor_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0026
preserved_exact_tokens:
- path
- scope
- validation/lint feedback
- dirty state
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-039 - Mention Picker Sources

```yaml
plan_unit_id: SMPFS-039
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The @ mention picker is rooted in the active project context and supports recent files, modified files, symbol-aware results when available, folder navigation, and Assistant plus Interview chat surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-039 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mention_picker_source_drift
reasoning_tier: standard
context_scope: mention_picker_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: mention_picker_sources
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0027
preserved_exact_tokens:
- '@'
- active project context
- recent files
- modified files
- symbol-aware results
- folder navigation
- Assistant
- Interview chat
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
```

### SMPFS-040 - Mention Result Identity

```yaml
plan_unit_id: SMPFS-040
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Mention results preserve the identity required by prompt assembly and click-to-open behavior across Assistant and Interview chat surfaces.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-040 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mention_identity_drift
reasoning_tier: standard
context_scope: mention_identity
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: mention_result_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0027
preserved_exact_tokens:
- mention result
- prompt assembly
- click-to-open behavior
- Assistant
- Interview chat
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-041 - Stream Timing Identity

```yaml
plan_unit_id: SMPFS-041
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Stream timing is tied to canonical assistant message or run identity and can be aggregated later without recomputing from rendered text.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-041 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: stream_timing_identity_drift
reasoning_tier: standard
context_scope: stream_timing
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: stream_timing_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0028
preserved_exact_tokens:
- Stream Timers and Segment Durations
- assistant turn/segment
- event stream
- canonical message/run identity
- aggregated later
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
```

### SMPFS-042 - Lightweight Timer UI

```yaml
plan_unit_id: SMPFS-042
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Timer UI remains lightweight, visible per assistant turn or segment when supported, and must avoid reflow or flicker in long threads.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-042 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: timer_ui_drift
reasoning_tier: standard
context_scope: stream_timing_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: lightweight_timer_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0028
preserved_exact_tokens:
- timer UI
- lightweight
- reflow/flicker
- long threads
negative_constraints:
- Timer UI must remain lightweight and not cause reflow/flicker in long threads.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
```

### SMPFS-043 - Interleaved Thinking Toggle

```yaml
plan_unit_id: SMPFS-043
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The interleaved thinking toggle is thread-local unless another owner broadens scope, shows requested state and effective provider behavior when exact honoring is unavailable, and prevents provider-specific naming from leaking into canonical user copy.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
unblocks: []
acceptance_criteria:
- SMPFS-043 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: thinking_toggle_drift
reasoning_tier: standard
context_scope: thinking_toggle_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: interleaved_thinking_toggle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0029
preserved_exact_tokens:
- Interleaved Thinking Toggle
- thread-local
- requested state
- effective provider behavior
- provider-specific naming
- canonical user copy
negative_constraints:
- The feature cannot rely on provider-specific naming leaking into canonical user copy.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
```

### SMPFS-044 - MCP Capability Resolution

```yaml
plan_unit_id: SMPFS-044
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: MCP support is host-managed capability resolution with project-, Persona-, and permission-aware effective tool availability, and unhealthy servers never produce silent success-shaped fallback.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-044 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_capability_drift
reasoning_tier: standard
context_scope: mcp_capability
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: mcp_capability_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0030
preserved_exact_tokens:
- MCP Support
- host-managed capability resolution
- project-
- Persona-
- permission-aware
- effective MCP tool availability
- unhealthy MCP servers
negative_constraints:
- Unhealthy MCP servers never produce silent success-shaped fallback.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SMPFS-045 - MCP Management UI

```yaml
plan_unit_id: SMPFS-045
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: MCP server configuration, enable/disable, test connection, and runtime health are first-class UI behaviors rather than config passthrough only.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-045 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_management_ui_drift
reasoning_tier: standard
context_scope: mcp_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: mcp_management_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0030
preserved_exact_tokens:
- server configuration
- enable/disable
- test connection
- runtime health
- first-class UI behaviors
- config passthrough only
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-046 - Project Session Browser Data Scope

```yaml
plan_unit_id: SMPFS-046
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The project/session browser spans projects plus per-project sessions, runs, and threads while active-thread navigation remains directly available in chat.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-046 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_session_browser_scope_drift
reasoning_tier: standard
context_scope: project_session_browser
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: project_session_browser_data_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0031
preserved_exact_tokens:
- Project and Session Browser
- projects
- per-project sessions/runs/threads
- active-thread navigation
- chat
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
```

### SMPFS-047 - Project Session Browser Surface

```yaml
plan_unit_id: SMPFS-047
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The project/session browser is a real shell surface with empty states, search and filter behavior, row actions, badges, and responsive collapse behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-047 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_session_browser_ui_drift
reasoning_tier: standard
context_scope: project_session_browser_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: project_session_browser_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0031
preserved_exact_tokens:
- real shell surface
- empty states
- search/filter behavior
- row actions
- badges
- responsive collapse behavior
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-048 - Streaming Usage Payloads

```yaml
plan_unit_id: SMPFS-048
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Mid-stream token/context updates preserve provisional stream usage payloads with session_id, response, per-model API totals, and token totals including prompt, total, cached, thoughts, and tool until final provider usage closes the turn.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-048 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: streaming_usage_payload_drift
reasoning_tier: standard
context_scope: streaming_usage
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: streaming_usage_payloads
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0032
preserved_exact_tokens:
- session_id
- response
- per-model API totals
- prompt
- total
- cached
- thoughts
- tool
- provisional
- final provider usage event
negative_constraints:
- Partial updates must not invent final totals before the platform reports them.
- partial updates must not invent final totals before the platform reports them
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
- Plans/storage-plan.md
```

### SMPFS-049 - Streaming Context Usage UI

```yaml
plan_unit_id: SMPFS-049
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Context and usage indicators may update during streaming with stable updating/streaming states, and final per-thread context and usage lands in the canonical Context Detail Pane used outside streaming.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UF-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-049 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: streaming_usage_ui_drift
reasoning_tier: standard
context_scope: streaming_usage_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: streaming_context_usage_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0032
preserved_exact_tokens:
- context and usage indicators
- updating
- streaming
- Context Detail Pane
- outside streaming
negative_constraints:
- The user sees stable in-progress states such as updating or streaming rather than flickering totals.
- partial updates must not invent final totals before the platform reports them
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
- Plans/storage-plan.md
```

### SMPFS-050 - Workspace Tab Window Identity

```yaml
plan_unit_id: SMPFS-050
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Workspace tabs are first-class identities that persist order, active tab, per-tab project identity, and local shell state across supported windows.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-050 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: workspace_tab_identity_drift
reasoning_tier: standard
context_scope: workspace_tabs
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: workspace_tab_window_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0033
preserved_exact_tokens:
- workspace tabs
- persist order
- active tab
- per-tab project identity
- local shell state
- windows
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-051 - Multi-Window Close Fallback Behavior

```yaml
plan_unit_id: SMPFS-051
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Multi-window behavior defines deterministic drag/fallback behavior and close handling for dirty editors, running dev sessions, active terminals, and detached children.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-051 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: multiwindow_close_ui_drift
reasoning_tier: standard
context_scope: multiwindow_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: multi_window_close_fallback_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0033
preserved_exact_tokens:
- drag-between-window support
- fallback behavior
- close behavior
- dirty editors
- running dev sessions
- active terminals
- detached children
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/storage-plan.md
```

### SMPFS-052 - Virtualized Conversation Log Lists

```yaml
plan_unit_id: SMPFS-052
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Long chat and runtime lists use virtualization while preserving keyboard navigation, focus recovery, anchor-to-message behavior, sticky status elements, selection, and search result navigation.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- ACD-008
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-052 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: virtualized_list_drift
reasoning_tier: standard
context_scope: virtualized_lists_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: virtualized_conversation_log_lists
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0034
preserved_exact_tokens:
- Virtualized Conversation or Log List
- keyboard navigation
- focus recovery
- anchor-to-message
- sticky status elements
- selection
- search results navigation
negative_constraints:
- Virtualization cannot break sticky status elements, selection, or search results navigation.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-053 - Normalized Usage Contract

```yaml
plan_unit_id: SMPFS-053
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: App-wide Usage and the thread-scoped Context Detail Pane share one normalized usage contract, and cost_usage artifacts deep-link into canonical Usage/Ledger surfaces rather than artifact-local models.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-001
- ACD-008
- RAP-024
unblocks: []
acceptance_criteria:
- SMPFS-053 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_contract_drift
reasoning_tier: standard
context_scope: usage_contract
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: normalized_usage_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0035
preserved_exact_tokens:
- Know Where Your Tokens Go
- Usage
- Context Detail Pane
- normalized usage contract
- cost_usage
- Usage/Ledger surfaces
- artifact-local model
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/usage-feature.md
- Plans/assistant-chat-design.md
- Plans/Runtime_Artifacts_Panel.md
```

### SMPFS-054 - Token Cost Attribution Framing

```yaml
plan_unit_id: SMPFS-054
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Token and cost framing makes per-thread, per-run, and per-model attribution explainable without duplicating data sources.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-054 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_framing_ui_drift
reasoning_tier: standard
context_scope: usage_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: token_cost_attribution_framing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0035
preserved_exact_tokens:
- token and cost framing
- per-thread
- per-run
- per-model attribution
- duplicating data sources
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/usage-feature.md
- Plans/assistant-chat-design.md
```

### SMPFS-055 - Catalog Lifecycle Semantics

```yaml
plan_unit_id: SMPFS-055
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Catalog install, update, and remove flows are lifecycle-aware for commands, skills, plugins/hooks, themes, and MCP configs, with update/remove behavior explicit for active or referenced items.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-055 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_lifecycle_drift
reasoning_tier: standard
context_scope: catalog_lifecycle
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: catalog_lifecycle_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0036
preserved_exact_tokens:
- One-Click Install
- commands
- agents
- hooks
- skills
- plugins/hooks
- themes
- MCP configs
- blocked
- deferred-until-next-load
- immediate effect
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SMPFS-056 - Catalog Management UI

```yaml
plan_unit_id: SMPFS-056
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The catalog is not install-only; steady-state management, apply-later behavior, and active/referenced item outcomes are part of MVP UI behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-056 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_management_ui_drift
reasoning_tier: standard
context_scope: catalog_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: catalog_management_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0036
preserved_exact_tokens:
- catalog
- install/update/remove
- enable
- disable
- apply-later
- steady-state management
- MVP behavior
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Tools.md
```

### SMPFS-057 - Shell Adjacent Pane Family

```yaml
plan_unit_id: SMPFS-057
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal, Problems, Output, Debug Console, and Ports are canonical shell-adjacent panes with distinct responsibilities linked by terminal-session and dev-session identity rather than loose textual association.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-057 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pane_family_drift
reasoning_tier: standard
context_scope: pane_family_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: shell_adjacent_pane_family
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0038
preserved_exact_tokens:
- Terminal
- Problems
- Output
- Debug Console
- Ports
- shell-adjacent panes
- terminal-session
- dev-session identity
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-058 - Pane Ownership Boundaries

```yaml
plan_unit_id: SMPFS-058
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Pane ownership boundaries remain explicit: Terminal owns live PTY/transcript/search/overlays, Output owns structured process output, Problems owns diagnostics, Debug Console owns debugger REPL/evaluation, and Ports owns service endpoints.'
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-058 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pane_owner_boundary_drift
reasoning_tier: standard
context_scope: pane_boundaries_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: pane_ownership_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0038
preserved_exact_tokens:
- Terminal owns live interactive PTY
- Output owns structured or aggregated process output
- Problems owns problem and diagnostic views
- Debug Console
- Ports owns discovered or declared service endpoints
- Surface-boundary labels
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-059 - Origin Preserving Cross Surface Patterns

```yaml
plan_unit_id: SMPFS-059
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Output, Run, Problems, Debug Console, Ports, and Services patterns are canonical only when they preserve origin linkback to the owning terminal, dev session, run, file, tool, or service context.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-059 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: origin_linkback_drift
reasoning_tier: standard
context_scope: cross_surface_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: origin_preserving_cross_surface_patterns
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0038
preserved_exact_tokens:
- /Run
- /search
- /preserve
- /reveal-origin
- /errors/warnings
- /line/code
- /evaluation
- /commands
- /endpoint
- /copy
- /session
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-060 - Debug Run Workbench Boundary

```yaml
plan_unit_id: SMPFS-060
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Debug and run surfaces are part of the broader workbench story; remote run/debug follows requested/effective disclosure, derived shard hints cannot become shipped behavior without owner-doc contracts, and JSONL/logsearch diagnostics remain future hints until reconciled.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- RM-025
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-060 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_run_boundary_drift
reasoning_tier: standard
context_scope: debug_run_boundary
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: debug_run_workbench_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0038
preserved_exact_tokens:
- remote run/debug
- requested/effective disclosure
- derived shard hints
- JSONL mirrors
- logsearch-style retrieval
- future /diagnostics hints
negative_constraints:
- Only hand-authored plan contracts can promote derived shard hints into shipped behavior.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Run_Modes.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-061 - Terminal Persistence Tiers

```yaml
plan_unit_id: SMPFS-061
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal persistence preserves guaranteed_durable, best_effort_durable, and transient_only tiers, separate transcript/history/layout/settings owners, append-oriented chunked persistence, and bounded transcript/metadata-only degraded states.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-061 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_persistence_drift
reasoning_tier: standard
context_scope: terminal_persistence
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_persistence_tiers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0039
preserved_exact_tokens:
- guaranteed_durable
- best_effort_durable
- transient_only
- transcript state
- command-block /history metadata
- layout /session metadata
- settings /theme defaults
- append-oriented
- bounded transcript chunks
- metadata-only records
negative_constraints:
- transient_only live PTY state, full scrollback, TUI alternate-screen content, selections, and in-flight search highlights MUST NOT be faked after restart.
- Terminal state categories MUST NOT be collapsed into one terminal blob.
- '| `transient_only` | live PTY state, full scrollback beyond retained bounds, active TUI alternate-screen content, active selection ranges, in-flight search highlights | MUST NOT be faked after restart |'
- 'Terminal state categories stay distinct: transcript state, command-block `/history` metadata, layout `/session` metadata, and settings `/theme` defaults keep separate persistence owners and MUST NOT be collapsed into one terminal blob.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-062 - Transcript Disclosure And Restore UI

```yaml
plan_unit_id: SMPFS-062
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal restore UI discloses missing transcript backing before transcript-specific review/copy/search and uses exact labels live-restored, /disconnected/review-only, /history/context, and /ephemeral for restored or degraded states.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-062 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_restore_ui_drift
reasoning_tier: standard
context_scope: terminal_restore_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: transcript_disclosure_restore_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0039
preserved_exact_tokens:
- missing backing transcript
- review
- copy
- search
- live-restored
- /disconnected/review-only
- /history/context
- /ephemeral
- restore banners
negative_constraints:
- The UI must disclose missing backing transcript before offering transcript-specific review, copy, or search behavior.
- '| `transient_only` | live PTY state, full scrollback beyond retained bounds, active TUI alternate-screen content, active selection ranges, in-flight search highlights | MUST NOT be faked after restart |'
- 'Terminal state categories stay distinct: transcript state, command-block `/history` metadata, layout `/session` metadata, and settings `/theme` defaults keep separate persistence owners and MUST NOT be collapsed into one terminal blob.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-063 - Canonical Terminal Restore Outcomes

```yaml
plan_unit_id: SMPFS-063
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Canonical terminal restore outcomes are restored_live, restored_exited, restored_disconnected, and restored_without_history, with restore labels kept distinct from live PTY continuity.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-063 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_restore_outcome_drift
reasoning_tier: standard
context_scope: terminal_restore_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: canonical_terminal_restore_outcomes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0039
preserved_exact_tokens:
- restored_live
- restored_exited
- restored_disconnected
- restored_without_history
negative_constraints:
- '| `transient_only` | live PTY state, full scrollback beyond retained bounds, active TUI alternate-screen content, active selection ranges, in-flight search highlights | MUST NOT be faked after restart |'
- 'Terminal state categories stay distinct: transcript state, command-block `/history` metadata, layout `/session` metadata, and settings `/theme` defaults keep separate persistence owners and MUST NOT be collapsed into one terminal blob.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
```

### SMPFS-064 - Terminal Shortcut And Agent Control Boundary

```yaml
plan_unit_id: SMPFS-064
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal shortcuts coexist with PM-wide shortcuts through explicit scope and precedence, and PM-built-in agents control terminal sessions through the canonical terminal subsystem rather than a parallel hidden shell model.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- T-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-064 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_shortcut_boundary_drift
reasoning_tier: standard
context_scope: terminal_shortcut_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_shortcut_agent_control_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0040
preserved_exact_tokens:
- terminal shortcuts
- PM-wide shortcuts
- scope and precedence
- PM-built-in agents
- canonical terminal subsystem
- parallel hidden shell model
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Tools.md
- Plans/storage-plan.md
```

### SMPFS-065 - Same Session Reveal Commands

```yaml
plan_unit_id: SMPFS-065
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Open in Terminal and Show Terminal are idempotent same-session reveal commands that reveal existing sections, tabs, and panes for the referenced session before considering new containers.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-065 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: same_session_reveal_drift
reasoning_tier: standard
context_scope: terminal_reveal_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: same_session_reveal_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0040
preserved_exact_tokens:
- Open in Terminal
- Show Terminal
- idempotent same-session reveal
- New Terminal
- section
- tab
- pane
negative_constraints:
- Open in Terminal is idempotent same-session reveal, not shorthand for New Terminal.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
```

### SMPFS-066 - Terminal Browser Anti Collapse Shape

```yaml
plan_unit_id: SMPFS-066
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal remains a first-class shell workspace, not mini-shells or /browser/terminal placeholders, preserving distinct session/command-block, dev-session, tabs/panes, GUI, debug/hot-reload, and recovery/inspector boundaries.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-066 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_browser_collapse_drift
reasoning_tier: standard
context_scope: terminal_shape_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_browser_anti_collapse_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0040
preserved_exact_tokens:
- first-class shell-workspace
- mini-shells
- /browser/terminal
- /session/command-block
- /dev-session
- /tabs/panes
- /debug/hot-reload
- /recovery/inspector
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-067 - PTY Shell Remote Capability Matrix

```yaml
plan_unit_id: SMPFS-067
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The cross-platform capability matrix preserves PTY host/process supervision, shell integration metadata, docking/detach support, local and remote/multi-context launches, and deterministic degradation when capabilities are unavailable.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-067 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_capability_matrix_drift
reasoning_tier: standard
context_scope: terminal_capability_matrix
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: pty_shell_remote_capability_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0041
preserved_exact_tokens:
- PTY host
- process supervision
- shell integration metadata
- docking and detached windows
- SSH
- WSL
- containers
- /dev-container
- degraded PTY control
- unsupported contexts
negative_constraints:
- Unavailable or degraded PTY control MUST be surfaced as effective capability loss, not hidden fallback.
- Unsupported contexts MUST fail deterministically rather than silently retargeting to the wrong runtime.
- Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell or generic GUI fallback.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes:
- Legacy routing shorthand such as /SSH, /WSL/container-or-similar, /render, and /replaces resolves through process-host, renderer, and requested/effective host contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SMPFS-068 - Renderer Accessibility Text Model Matrix

```yaml
plan_unit_id: SMPFS-068
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Renderer modes, clipboard, IME, accessibility, text/selection model, TUI capture, terminal shortcuts, and requested/effective renderer disclosure remain first-class acceptance requirements across platforms.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-068 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: renderer_accessibility_drift
reasoning_tier: standard
context_scope: terminal_renderer_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: renderer_accessibility_text_model_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0041
preserved_exact_tokens:
- /render-mode
- interactive rich
- plain /log/CI
- machine-readable /export
- degraded ASCII /low-capability
- /spectacle
- Clipboard
- IME
- accessibility
- Unicode
- TUI capture
- requested/effective
negative_constraints:
- Effective renderer mode MUST be disclosed whenever it differs from the requested preference.
- Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell or generic GUI fallback.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-069 - Platform Acceptance And Legacy Routing

```yaml
plan_unit_id: SMPFS-069
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Platform acceptance covers macOS, Linux, Windows, WSL, Wayland, X11, dock/detach, package/runtime dependencies, and legacy shorthand resolved through process-host, renderer, and requested/effective capability contracts.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-069 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: platform_acceptance_drift
reasoning_tier: standard
context_scope: terminal_platforms
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: platform_acceptance_legacy_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0041
preserved_exact_tokens:
- macOS
- Linux
- Windows
- WSL
- Wayland
- /X11
- /dock/detach
- package/runtime dependencies
- /SSH
- /WSL/container-or-similar
- /render
- /replaces
negative_constraints:
- PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell or generic GUI fallback.
- Legacy routing shorthand such as `/SSH`, `/WSL/container-or-similar`, `/render`, and `/replaces` is resolved through the same process-host, renderer, and requested/effective host contract; PM must not mask a remote, WSL, container, or unsupported runtime request by silently launching a local shell or generic GUI fallback.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes:
- /SSH, /WSL/container-or-similar, /render, and /replaces are legacy shorthand resolved through canonical host/render contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SMPFS-070 - Terminal Subsystem Layers And Gates

```yaml
plan_unit_id: SMPFS-070
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal subsystem architecture has explicit process-host, PTY transport, VT/ANSI grid buffer engine, renderer, shell-integration metadata, and workspace/session UI layers with acceptance gates for platform behavior.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-070 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_layer_drift
reasoning_tier: standard
context_scope: terminal_architecture
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_subsystem_layers_gates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- process host
- PTY /session/process transport
- VT /ANSI/grid/buffer
- renderer
- shell-integration metadata
- workspace/session UI
- acceptance gates
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
```

### SMPFS-071 - Terminal Parser Replay Requirements

```yaml
plan_unit_id: SMPFS-071
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal parser and replay requirements preserve mutable grid/buffer state, scrollback and selection anchors, command-block annotations, replay fixtures, resize/reflow, huge output, Unicode/IME, search, and TUI capture behavior.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-071 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_parser_replay_drift
reasoning_tier: standard
context_scope: terminal_parser
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_parser_replay_requirements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- /VT
- /ANSI/grid/buffer
- scrollback
- selection anchors
- command-block annotations
- replay fixtures
- resize/reflow
- huge output
- Unicode
- IME
- search
- TUI capture
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
```

### SMPFS-072 - Non Ship Terminal Rendering Constraints

```yaml
plan_unit_id: SMPFS-072
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: A DOM-style, document-style, line-widget-per-output, or string-concatenation terminal core is non-ship; terminal output is mutable grid/buffer state rendered by a purpose-built terminal engine.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-072 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_rendering_constraint_drift
reasoning_tier: standard
context_scope: terminal_rendering_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: non_ship_terminal_rendering_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- DOM-style
- document-style
- one widget per line forever
- line-widget
- string-concatenation
- non-ship
- mutable grid/buffer state
negative_constraints:
- A DOM-style terminal rendering architecture for the terminal core is non-ship.
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
```

### SMPFS-073 - Native Buffer Render Performance Model

```yaml
plan_unit_id: SMPFS-073
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal performance requires off-UI-thread PTY and buffer work, diff/dirty-region painting, throttled rendering, bounded memory, stable scroll/selection/focus, and platform performance tests.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-073 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_performance_drift
reasoning_tier: standard
context_scope: terminal_rendering_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: native_buffer_render_performance_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- off-UI-thread
- diff/dirty-region painting
- throttled rendering
- bounded memory
- scroll
- selection
- focus
- performance tests
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
```

### SMPFS-074 - Terminal Observability Events

```yaml
plan_unit_id: SMPFS-074
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal observability records structured lifecycle and state-transition events including create, attach, ready, start/finish command, interrupt, terminate, kill, detach, reattach, move-window, resize, focus/visibility, cwd/profile changes, renderer errors, shell-integration changes, selection/clipboard failures, and capability fallback.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-074 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_observability_drift
reasoning_tier: standard
context_scope: terminal_observability
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_observability_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- session create
- /attach/ready/start-command/finish-command
- interrupt
- /terminate/kill
- detach
- /reattach/move-window
- resize
- /focus/visibility
- cwd/profile changes
- renderer errors
- shell-integration state changes
- selection and clipboard failures
- capability fallback
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-075 - Terminal Diagnostics Visibility

```yaml
plan_unit_id: SMPFS-075
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal settings and diagnostics expose renderer mode/fallback, shell-integration capability tier/source, last restore outcome, transcript persistence and retention availability, and recent errors/events relevant to the current pane.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-075 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_diagnostics_ui_drift
reasoning_tier: standard
context_scope: terminal_diagnostics_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_diagnostics_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- settings/diagnostics
- renderer mode/fallback state
- shell integration capability tier/source
- last restore outcome
- transcript persistence availability/retention status
- recent terminal errors/events
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-076 - Terminal Diagnostic Privacy And Bundles

```yaml
plan_unit_id: SMPFS-076
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal diagnostic logging records metadata, state transitions, failure codes, and performance counters without indiscriminate shell-content capture; user-requested diagnostic bundles clearly label transcript content as absent, partial, or included.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-076 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_diagnostic_privacy_drift
reasoning_tier: standard
context_scope: terminal_diagnostics
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_diagnostic_privacy_bundles
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- metadata
- state transitions
- failure codes
- performance counters
- diagnostic bundle
- absent
- partial
- included
- transcript excerpts
negative_constraints:
- Diagnostic logging must not indiscriminately capture or duplicate full shell content.
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SMPFS-077 - Terminal Rollback Snapshot Boundary

```yaml
plan_unit_id: SMPFS-077
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Rollback/snapshot boundaries allow terminal metadata, layout state, settings, and retained transcript artifacts to be snapshotted, but not arbitrary live PTY or process undo after commands have executed.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-077 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_rollback_boundary_drift
reasoning_tier: standard
context_scope: terminal_recovery
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_rollback_snapshot_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- Rollback/snapshot boundary
- terminal metadata
- layout state
- settings
- retained transcript artifacts
- live PTY runtime/process state
- restart/rerun/reopen/restore-structure
negative_constraints:
- PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed.
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
```

### SMPFS-078 - Terminal Noise And Queryable State

```yaml
plan_unit_id: SMPFS-078
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Repeated identical terminal failures are coalesced under the /noise rule while persistent degraded state remains inspectable, and major terminal subsystem state is queryable per pane/session and project-wide without scraping rendered UI text.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-078 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_noise_state_drift
reasoning_tier: standard
context_scope: terminal_diagnostics_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_noise_queryable_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0042
preserved_exact_tokens:
- /noise
- persistent degraded conditions
- typed events
- state-transition boundaries
- queryable per pane/session
- project-wide
- without scraping rendered UI text
negative_constraints:
- a DOM-style terminal rendering architecture for the terminal core is non-ship; the core MUST NOT be a DOM-style “one widget per line forever” model.
- Diagnostic logging records terminal subsystem events and failures as metadata, state transitions, failure codes, and performance counters; it must not indiscriminately capture or duplicate full shell content. Transcript capture remains a terminal review feature, not a blanket debug log sink, and logging boundaries distinguish metadata-only artifacts from transcript-including artifacts without unexpectedly exporting sensitive command content/environment data unless the user explicitly chooses that artifact class.
- 'Rollback/snapshot boundary is explicit: PM may snapshot terminal metadata, layout state, settings, and retained transcript artifacts, but PM must not imply that it can roll back arbitrary live PTY runtime/process state after commands already executed. Recovery actions are restart/rerun/reopen/restore-structure, not "undo terminal execution".'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- All major terminal subsystems emit typed events at state-transition boundaries, and diagnostic state is queryable per pane/session and project-wide without scraping rendered UI text.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-079 - Terminal Acceptance Criteria

```yaml
plan_unit_id: SMPFS-079
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal acceptance requires deterministic two-section, multi-tab, one-to-four pane behavior across docked/detached presentation, same-session reveal, restart identity minting, honest historical restore, terminal/output/problems/debug/ports linkback, and responsive huge-output/search/scrollback paths.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-079 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_acceptance_drift
reasoning_tier: standard
context_scope: terminal_acceptance_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_acceptance_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0043
preserved_exact_tokens:
- two terminal sections
- multi-tab behavior
- one-to-four pane tabs
- docked
- detached
- same-session reveal
- new terminal_session_id
- historical sessions
- huge-output
- search
- scrollback
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-080 - Hot Live Reload Semantics

```yaml
plan_unit_id: SMPFS-080
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Dev sessions are stack-aware and distinguish hot reload from live reload, with explicit cleanup and termination rules for project switch and app shutdown.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-080 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hot_reload_semantics_drift
reasoning_tier: standard
context_scope: dev_loop_reload
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: hot_live_reload_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0044
preserved_exact_tokens:
- Hot Reload
- Live Reload
- Fast Iteration
- dev sessions
- stack-aware
- project switch
- app shutdown
- termination/cleanup rules
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
```

### SMPFS-081 - Hot Live Reload UI

```yaml
plan_unit_id: SMPFS-081
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Hot/live reload UI discloses fallback to live reload, and one-click launch, status, logs, errors, and termination rules are required.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-081 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hot_reload_ui_drift
reasoning_tier: standard
context_scope: dev_loop_reload_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: hot_live_reload_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0044
preserved_exact_tokens:
- fallback to live reload
- UI copy and state
- one-click launch
- status
- logs
- errors
- termination rules
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-082 - Sound Effects Settings

```yaml
plan_unit_id: SMPFS-082
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Sound effects are grouped settings, not per-view ad hoc toggles, and sound notifications follow action-needed/completion semantics while respecting do-not-disturb or muted-state shell policy.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-082 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: sound_settings_drift
reasoning_tier: standard
context_scope: sound_settings_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: sound_effects_settings
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0045
preserved_exact_tokens:
- Sound Effects Settings
- grouped as settings
- per-view ad hoc toggles
- action-needed
- completion semantics
- do-not-disturb
- muted-state
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### SMPFS-083 - Instant Project Switch Command Semantics

```yaml
plan_unit_id: SMPFS-083
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Instant project switch defaults to switching the active workspace tab, while an alternate command opens the target project in a new workspace tab.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-083 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_switch_command_drift
reasoning_tier: standard
context_scope: project_switch
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: instant_project_switch_command_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0046
preserved_exact_tokens:
- Instant Project Switch
- default switch target
- active workspace tab
- alternate command
- new workspace tab
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
```

### SMPFS-084 - Instant Project Switch State And Edge UI

```yaml
plan_unit_id: SMPFS-084
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Project switching recalculates project-scoped config, sessions, terminal cwd, browser preview state, effective tool/MCP/Persona state, preserves old project background activity through attention surfaces, and exposes deterministic missing-path, duplicate-path, and in-flight-run states.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- SP-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-084 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_switch_ui_drift
reasoning_tier: standard
context_scope: project_switch_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: instant_project_switch_state_edge_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0046
preserved_exact_tokens:
- project-scoped config
- sessions
- terminal cwd
- browser preview state
- effective tool/MCP/persona state
- background activity
- badges/attention surfaces
- missing-path
- duplicate-path
- in-flight-run
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
- Plans/Tools.md
```

### SMPFS-085 - Browser Site Reader Web Boundary

```yaml
plan_unit_id: SMPFS-085
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The built-in browser and click-to-context browser-interaction topic is separate from websearch, provider-routed webfetch, site/page reading intents, and Site Reader-only behavior.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-085 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_web_boundary_drift
reasoning_tier: standard
context_scope: browser_web_boundary
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_site_reader_web_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- Built-in Browser and Click-to-Context
- Site Reader v1
- browser-interaction
- websearch
- webfetch
- web-operation family
- Reading Site
- Site Reader-only behavior
negative_constraints:
- Provider-routed fetch must not reuse the reserved native Site Reader identity.
- Browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Contracts_V0.md
```

### SMPFS-086 - Web Research Labels And Degradation UI

```yaml
plan_unit_id: SMPFS-086
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Promoted GUI consumes web research activity cards without re-owning tool routing, preserving Searching Web and reserved Reading Site labels, Site Reader detail-level choices, token-efficient fetches, observe/read path separation, and free-tier/provider-limit degradation before unavailable actions.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-086 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_research_ui_drift
reasoning_tier: standard
context_scope: browser_research_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: web_research_labels_degradation_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- 'Searching Web: <query>'
- 'Reading Site: <url>'
- /detail-level
- minimal
- summary
- full
- /fetches
- /observe
- /automation
- /free-tier
- provider-limit degradation
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### SMPFS-087 - PM Managed Browser Runtime

```yaml
plan_unit_id: SMPFS-087
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: PM browser runtime is capability-first and PM-managed CEF by default; wef, cargo-wef, Wry/hybrid, OS webviews, Playwright/CDP sidecars, chromiumoxide, and Chrome-for-Testing helpers remain candidates or comparison inputs until packaging, update, install, verification, and health strategy is explicit.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-087 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_runtime_drift
reasoning_tier: standard
context_scope: browser_runtime
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: pm_managed_browser_runtime
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- PM-managed CEF runtime
- wef
- cargo-wef
- runtime_unavailable
- Wry/hybrid
- OS webviews
- Playwright/CDP sidecars
- chromiumoxide
- Chrome-for-Testing
- packaging/update/install strategy
negative_constraints:
- If the selected path uses an auto-downloaded CEF binary distribution via cargo-wef, requested/effective browser state must surface runtime_unavailable until the pinned binary is present, verified, and healthy.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes:
- wef and cargo-wef are implementation candidates only until packaging/update/install strategy is explicit.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Tools.md
```

### SMPFS-088 - Browser Requested Effective Disclosure

```yaml
plan_unit_id: SMPFS-088
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser runtime capability state is requested/effective and must disclose runtime_unavailable, degraded capability, visible-host support, platform differences, and capability-degradation before offering unavailable features.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-088 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_effective_disclosure_drift
reasoning_tier: standard
context_scope: browser_capability_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_requested_effective_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- requested/effective browser state
- runtime_unavailable
- /capability-degradation
- visible host
- cross-platform embedding
- degraded-but-supported
negative_constraints:
- PM must not leave browser fallback behavior or effective capability disclosure under-specified.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
```

### SMPFS-089 - Browser Chip Capture And Share Flow

```yaml
plan_unit_id: SMPFS-089
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser click, highlight, capture, and share flows use explicit user-triggered chips; cmd.browser.share_with_agent and revoke_share_with_agent update explicit browser-session share state only.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-089 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_chip_flow_drift
reasoning_tier: standard
context_scope: browser_context_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_chip_capture_share_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- chip-based model
- visible, user-triggered chips
- cmd.browser.share_with_agent
- cmd.browser.revoke_share_with_agent
- browser-session share state
- hidden automatic context injection
negative_constraints:
- Browser-derived context enters a thread only through visible, user-triggered chips, never through hidden automatic context injection.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### SMPFS-090 - Browser Attachment And Prompt Limits

```yaml
plan_unit_id: SMPFS-090
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser text selection and element pick create browser_selection_context and browser_element_context chips, while screenshots and combined captures create runtime-artifact references and must not inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- RAP-024
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-090 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_prompt_limit_drift
reasoning_tier: standard
context_scope: browser_context_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_attachment_prompt_limits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- browser_selection_context
- browser_element_context
- runtime-artifact references
- selected browser context chip
- raw unbounded page bodies
- DOM dumps
- screenshots
- prompt text
negative_constraints:
- Browser screenshot and combined selection+screenshot actions MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
```

### SMPFS-091 - Named Browser Action Taxonomy

```yaml
plan_unit_id: SMPFS-091
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The browser control plane remains named-action based, covering tab lifecycle, richer interactions, wait primitives, dialogs, file uploads, storage controls, network routing/mocking, trace/video capture, page/PDF export, test verification, coordinate fallback, and locator generation.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-091 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_action_taxonomy_drift
reasoning_tier: standard
context_scope: browser_actions
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: named_browser_action_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- named-action
- list
- create
- select
- close
- hover
- drag
- select option
- fill form
- press key
- navigate back
- wait for time
- wait for text
- wait for text disappearance
- storage-state
- network
- trace/video
- PDF export
- locator generation
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Contracts_V0.md
```

### SMPFS-092 - DevTools And Test Debug Boundaries

```yaml
plan_unit_id: SMPFS-092
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Embedded/detached DevTools, agent/browser introspection, and advanced browser test-debug flows are explicit opt-in or named-action surfaces; raw DevTools/CDP scripting and page-code execution are not the default PM browser contract.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-092 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: devtools_boundary_drift
reasoning_tier: standard
context_scope: browser_devtools_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: devtools_test_debug_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- DevTools
- embedded
- detached
- /test-debug
- browser_run_code
- browser_evaluate
- raw DevTools/CDP
- named browser actions
- active browser-session capability state
negative_constraints:
- Raw DevTools/CDP exposure is not an unresolved browser-contract question.
- Page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM guaranteed browser contract.
- Advanced browser /test-debug remains opt-in and MUST NOT replace the named browser/testing action contract as PM default surface.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### SMPFS-093 - Browser Artifact Pipeline

```yaml
plan_unit_id: SMPFS-093
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser screenshots, traces, combined selection/screenshot captures, DevTools automation artifacts, and evidence actions use the runtime-artifact pipeline with naming, retention, manifest shape, chat rendering, privacy redaction, permission disclosure, and requested/effective capability state.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- RAP-024
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-093 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_artifact_pipeline_drift
reasoning_tier: standard
context_scope: browser_artifacts_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_artifact_pipeline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- browser screenshots
- traces
- combined selection+screenshot captures
- artifact pipeline
- naming
- retention
- manifest shape
- chat rendering
- privacy redaction
- runtime-artifact references
- /screenshot/devtools/automation
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
```

### SMPFS-094 - Browser Session Persistence And Profiles

```yaml
plan_unit_id: SMPFS-094
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser session persistence covers history, cookies, storage, auth sessions, profile { name, saveChanges }, project-scoped normal sessions, workspace_preview/detached_preview sharing, isolated automation_session and auth_session profiles, restore eligibility, and crash recovery.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-094 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_profile_drift
reasoning_tier: standard
context_scope: browser_persistence
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_session_persistence_profiles
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- 'profile: { name: string, saveChanges: boolean }'
- cookies
- localStorage
- workspace_preview
- detached_preview
- automation_session
- auth_session
- project-scoped
- persistent profile/store
- restore eligibility
- crash recovery
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes:
- /localStorage slash notation remains lineage for the canonical localStorage storage field.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Tools.md
```

### SMPFS-095 - Browser Tab Cap And Retargeting

```yaml
plan_unit_id: SMPFS-095
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: 'Browser tab-cap handling is no-silent-retargeting/no LRU reuse: PM prompts, blocks, explicitly closes, or opens detached rather than silently retargeting an existing browser subject.'
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-095 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_retargeting_drift
reasoning_tier: standard
context_scope: browser_tabs_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_tab_cap_retargeting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- no-silent-retargeting
- no LRU reuse
- prompt
- block
- explicitly close
- open detached
- browser subject
negative_constraints:
- PM must prompt, block, explicitly close, or open detached rather than silently retargeting an existing browser subject.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-096 - Browser Lifecycle Distribution Platform Guarantees

```yaml
plan_unit_id: SMPFS-096
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: PM-managed browser helpers use helper/subprocess lifecycle, crash detection, restart policy, sandboxing, diagnostics, per-platform bundle layout, update rules, signature/hash verification, uninstall/removal evidence, and explicit Linux/macOS/Windows platform guarantees.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-096 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_lifecycle_distribution_drift
reasoning_tier: standard
context_scope: browser_distribution
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_lifecycle_distribution_platform_guarantees
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- helper/subprocess layout
- /subprocess
- startup
- shutdown
- crash detection
- restart policy
- sandboxing
- diagnostics
- bundle layout
- update rules
- signature/hash verification
- /hash
- uninstall/removal
- /removal
- macOS
- Linux
- Windows
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/Tools.md
```

### SMPFS-097 - Browser Permissions And Safety

```yaml
plan_unit_id: SMPFS-097
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser actions, storage/auth use, DevTools flows, artifact capture, agent-vs-user authority, permission keys, trust tiers, auth/session sensitivity, and no-silent-fallback blocked semantics are governed by Permissions and safety contracts.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-097 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_permission_drift
reasoning_tier: standard
context_scope: browser_safety
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_permissions_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- permission keys
- trust tiers
- agent-vs-user authority
- auth/session sensitivity
- no-silent-fallback blocked semantics
- browser action
- storage/auth
- DevTools flow
- artifact capture
negative_constraints:
- No-silent-fallback blocked semantics govern every browser action, storage/auth use, DevTools flow, and artifact capture.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/Tools.md
```

### SMPFS-098 - Browser Chrome Controls And Test Plan

```yaml
plan_unit_id: SMPFS-098
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser command/UI surfaces expose inspect, screenshot, DevTools, automation controls, exact browser chrome controls, status indicators, activity disclosure, and scenario-driven acceptance criteria for preview, interaction, screenshots, DevTools, auth, crash recovery, restore, and cross-platform packaging.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- UCC-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-098 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_controls_testplan_drift
reasoning_tier: standard
context_scope: browser_controls_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_chrome_controls_test_plan
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- inspect
- screenshot
- devtools
- automation
- browser chrome controls
- status indicators
- activity disclosure
- local HTML preview
- web app interaction
- auth flow
- crash recovery
- cross-platform packaging
negative_constraints:
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### SMPFS-099 - Browser Reference Material Dispositions

```yaml
plan_unit_id: SMPFS-099
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Playwright MCP, Chrome DevTools MCP, BrowserMCP, Saik0s/mcp-browser-use, browser-use, chromiumoxide, Wry, WebView2, WKWebView, WebKitGTK, OS webviews, CDP sidecars, and MCP config shapes remain reference, comparison, lineage, or background inputs and do not replace PM-owned browser architecture.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-099 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_reference_disposition_drift
reasoning_tier: standard
context_scope: browser_reference_material
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_reference_material_dispositions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- Playwright MCP
- Chrome DevTools MCP
- BrowserMCP/mcp
- Saik0s/mcp-browser-use
- browser-use
- chromiumoxide
- Wry
- WebView2
- WKWebView
- WebKitGTK
- OS webviews
- CDP
- storage-state
- cdpEndpoint
negative_constraints:
- Reference material does not change PM design center away from a PM-owned built-in browser surface.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes:
- Reference/comparison/background labels remain lineage only and do not become PM product commands or core architecture.
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
```

### SMPFS-100 - Browser Action Schema And Output Shape

```yaml
plan_unit_id: SMPFS-100
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The canonical browser action table and output shape preserve action_id, bucket, tier, permission_layer, allowed_session_classes, requested_capabilities, artifacts_emitted, degradation_or_blocking_behavior, user_visible_entry_points, typed output sections, fields, limits, sequential execution, URL validation, and invalid_input errors.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-100 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_action_schema_drift
reasoning_tier: standard
context_scope: browser_action_schema
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_action_schema_output_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0047
preserved_exact_tokens:
- action_id
- bucket
- tier
- guaranteed_everyday
- advanced_debug_testing
- permission_layer
- allowed_session_classes
- requested_capabilities
- artifacts_emitted
- degradation_or_blocking_behavior
- user_visible_entry_points
- Open tabs
- Page state
- Snapshot
- New console messages
- Modal state
- Downloads
- timeout_ms
- invalid_input
- 5 MB default
- 5000ms
- 30000ms
- 30s
- HTTP(S)
- https://
negative_constraints:
- Unknown type values produce invalid_input error.
- Reject non-HTTP(S) schemes and malformed URLs.
- provider-routed fetch must not reuse the reserved native Site Reader identity.
- 'The PM built-in browser and click-to-context /browser-interaction topic is separate from the web-operation family and the Site Reader/Reading Site read path: browser browsing, preview, click-to-context, DevTools-linked capture, and visible browser-session behavior MUST NOT collapse into websearch, provider-routed webfetch, site/page reading intents, or Site Reader-only behavior.'
- Browser screenshot and combined selection+screenshot actions create runtime-artifact references plus the selected browser context chip; they MUST NOT inject raw unbounded page bodies, DOM dumps, or screenshots directly into prompt text.
- Blocked, expired, or revoked browser chips may remain visible for audit, but they MUST NOT serialize as successful prompt attachments.
- Playwright MCP remains reference material for structured page snapshots, screenshots, and browser automation taxonomy; raw DevTools/CDP exposure is not an unresolved browser-contract question, and page-code execution APIs such as browser_run_code and browser_evaluate MUST NOT become PM's guaranteed browser contract because PM converges on strong named actions instead of freeform low-level execution.
- An explicit advanced browser /test-debug escape hatch may expose low-level diagnostics or execution for testing workflows, but it remains opt-in and MUST NOT replace the named browser/testing action contract as PM's default surface.
- Legacy runtime comparison inputs Wry, WebView2, WKWebView, and WebKitGTK are preserved only as background labels; PM must not leave browser fallback behavior or effective capability disclosure under-specified, because degraded states are advertised through requested/effective browser capability fields, runtime_unavailable, and /capability-degradation before a feature is offered.
preserved_contractrefs:
- 'ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Tools.md#3.5D Web operation family runtime contract'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Contracts_V0.md
```

### SMPFS-101 - Promoted Command Families

```yaml
plan_unit_id: SMPFS-101
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The UI command catalog exposes stable command families for project switching/open-new-tab, workspace tabs, detached windows, thread context detail, branching, browser controls, terminal actions, dev-session actions, and catalog lifecycle actions.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-101 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: promoted_command_family_drift
reasoning_tier: standard
context_scope: command_catalog_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: promoted_command_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0048
preserved_exact_tokens:
- project switch
- project open-in-new-workspace-tab
- workspace tab create
- detached window
- thread context detail
- branch-from-restore
- browser open
- terminal show
- dev-session start
- catalog install
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/assistant-chat-design.md
```

### SMPFS-102 - Command Category And Identity Reveal Rules

```yaml
plan_unit_id: SMPFS-102
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Open in Terminal and Show Terminal normalize to the terminal command family, terminal layout and runtime actions remain separate command categories, and cross-surface reveal commands target canonical identities such as terminal_session_id and dev_session_id rather than freeform labels.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-102 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_identity_reveal_drift
reasoning_tier: standard
context_scope: command_catalog_gui
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: command_category_identity_reveal_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0048
preserved_exact_tokens:
- Open in Terminal
- Show Terminal
- terminal command family
- terminal layout changes
- terminal runtime actions
- terminal_session_id
- dev_session_id
- freeform labels
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-103 - Project Restore Identity

```yaml
plan_unit_id: SMPFS-103
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Project restore uses stable project_id rather than raw path alone, preserving restore semantics as identity-driven runtime state.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-103 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: project_restore_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- project_id
- raw path alone
- project restore
negative_constraints:
- Project restore uses stable project_id, not raw path alone.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
```

### SMPFS-104 - Workspace And Detached Surface Restore

```yaml
plan_unit_id: SMPFS-104
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Workspace tabs restore independently, and detached windows restore only when their surface class and platform support allow deterministic restoration.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-104 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: workspace_detached_surface_restore
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- workspace tabs restore independently
- detached windows
- surface class
- platform support
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-105 - Normal Browser Restore Scope

```yaml
plan_unit_id: SMPFS-105
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Normal browser tabs restore by project and workspace tab while preserving profile scope; detached normal browsing restores with the originating normal browsing session when supported.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-105 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: normal_browser_restore_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- normal browser tabs
- project
- workspace tab
- profile scope
- detached normal browsing
- originating normal browsing session
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Tools.md
```

### SMPFS-106 - Auth And Automation Restart Boundaries

```yaml
plan_unit_id: SMPFS-106
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Auth sessions and automation sessions do not auto-resume active work after restart, and auth_session must not auto-close on presumed success because completion requires explicit user or provider/flow evidence.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-106 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: auth_automation_restart_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- auth_session
- automation sessions
- auto-resume
- auto-close
- presumed success
- explicit user or provider/flow evidence
negative_constraints:
- auth_session must not auto-close on presumed success; PM cannot reliably infer completion across arbitrary sites.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/Tools.md
```

### SMPFS-107 - Terminal And Dev Restore Verification

```yaml
plan_unit_id: SMPFS-107
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal sessions and dev sessions have explicit restore eligibility; running processes are never assumed alive after restart, and terminal restart or replacement creates a new terminal_session_id.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- RM-025
unblocks: []
acceptance_criteria:
- SMPFS-107 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_dev_restore_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- terminal sessions
- dev sessions
- explicit restore eligibility
- running process
- restart
- terminal_session_id
negative_constraints:
- A running process is never assumed alive after restart without verification.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
```

### SMPFS-108 - Terminal Durable Presentation Metadata

```yaml
plan_unit_id: SMPFS-108
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal section, tab, pane, selection-of-active-pane, labels, pin state, dock/detach placement, and linked dev-session references are guaranteed_durable presentation metadata.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- UCC-001
unblocks: []
acceptance_criteria:
- SMPFS-108 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_durable_presentation_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- section
- tab
- pane
- selection-of-active-pane
- labels
- pin state
- dock/detach placement
- linked dev-session references
- guaranteed_durable
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### SMPFS-109 - Terminal Transcript And Runtime Persistence Tiers

```yaml
plan_unit_id: SMPFS-109
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal transcript snapshots, command-block metadata, cwd snapshots, shell-integration hints, and Output/Ports linkage are best_effort_durable, while live PTY continuity, unlimited scrollback, TUI alternate-screen content, live selections, and in-flight search highlights are transient_only.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-109 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: terminal_transcript_runtime_persistence_tiers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- bounded transcript snapshots
- command-block metadata
- cwd snapshots
- shell-integration hints
- best_effort_durable
- live PTY continuity
- unlimited scrollback
- active TUI alternate-screen content
- live selections
- in-flight search highlights
- transient_only
negative_constraints:
- transient_only runtime state MUST NOT be faked after restart.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

### SMPFS-110 - Canonical Restore Outcome Vocabulary

```yaml
plan_unit_id: SMPFS-110
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Canonical restore outcomes are exactly restored_live, restored_exited, restored_disconnected, and restored_without_history.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-110 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: canonical_restore_outcome_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- restored_live
- restored_exited
- restored_disconnected
- restored_without_history
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
```

### SMPFS-111 - Automation Promotion To Normal Browsing

```yaml
plan_unit_id: SMPFS-111
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Promotion from paused automation into normal browsing is an explicit user-confirmed action that may copy or promote eligible browser state, reclassifies the visible automation browser as normal, and is never a hidden side effect.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-111 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: automation_promotion_normal_browsing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- user-confirmed promotion
- paused automation
- normal browsing
- normal persistent profile/store
- visible automation browser
- hidden side effect
negative_constraints:
- Promotion or state copy must be an explicit user action, never a hidden side effect.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SMPFS-112 - Frozen Browser Runtime History And Crash Evidence

```yaml
plan_unit_id: SMPFS-112
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser requested/effective runtime and capability state is stored as frozen runtime history instead of recomputed heuristically, and crash recovery preserves recoverable metadata and completed evidence artifacts when possible.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- RAP-024
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-112 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: frozen_browser_runtime_history_crash_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- browser requested/effective runtime
- capability state
- frozen runtime history
- recomputed heuristically
- crash recovery
- recoverable metadata
- completed evidence artifacts
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Contracts_V0.md
```

### SMPFS-113 - Profile Scope Isolation And SaveChanges

```yaml
plan_unit_id: SMPFS-113
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser or terminal session classes must not silently bleed storage into another profile scope, and profile { name, saveChanges } scopes cookies and localStorage by profile name and project while disabled saveChanges keeps the session isolated.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-113 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: profile_scope_isolation_savechanges
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0049
preserved_exact_tokens:
- 'profile: { name: string, saveChanges: boolean }'
- cookies
- localStorage
- profile name
- project
- saveChanges
- isolated
- storage bleed
negative_constraints:
- No browser or terminal session class may silently bleed storage into another profile scope.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Glossary.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SMPFS-114 - Retired Shell Navigation And Usage Surfaces

```yaml
plan_unit_id: SMPFS-114
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The title-bar project bar, floating thread-selector overlay, and detached usage pop-out are explicitly non-canonical promoted shell, thread navigation, and per-thread usage models.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- UF-001
- ACD-008
unblocks: []
acceptance_criteria:
- SMPFS-114 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: retired_shell_navigation_usage_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- title-bar project bar
- floating thread-selector overlay
- detached usage pop-out
- non-canonical
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- These surfaces are explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/usage-feature.md
- Plans/assistant-chat-design.md
```

### SMPFS-115 - Browser Instance Reuse Non Goal

```yaml
plan_unit_id: SMPFS-115
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: One broad browser-instance model with LRU reuse is not the core browser contract.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-115 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_instance_reuse_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- one broad browser-instance model
- LRU reuse
- browser contract
negative_constraints:
- One broad browser-instance model with LRU reuse is not the core browser contract.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- This model is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/storage-plan.md
```

### SMPFS-116 - Browser Host Placement Non Goal

```yaml
plan_unit_id: SMPFS-116
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The bottom panel is not the primary browser host for the promoted browser model.
gui_related: true
gui_classification_reason: This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UCC-001
- WM-001
unblocks: []
acceptance_criteria:
- SMPFS-116 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: browser_host_placement_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- bottom panel
- primary browser host
negative_constraints:
- The bottom panel is not the primary browser host.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Bottom-panel-as-primary-browser-host is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
```

### SMPFS-117 - Silent Browser Context Injection Prohibition

```yaml
plan_unit_id: SMPFS-117
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Ordinary browser clicks or text selection must not silently inject context into assistant prompts or runtime state.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-117 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: silent_browser_context_injection_prohibition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- silent automatic context injection
- ordinary browser clicks
- text selection
negative_constraints:
- Silent automatic context injection from ordinary browser clicks or text selection is non-canonical.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Silent browser context injection is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SMPFS-118 - Storage Bleed Non Goal

```yaml
plan_unit_id: SMPFS-118
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Silent storage bleed between browser session classes or profile scopes is non-canonical.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- SP-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-118 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: storage_bleed_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- silent storage bleed
- browser session classes
- profile scopes
negative_constraints:
- Silent storage bleed between browser session classes or profile scopes is non-canonical.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Silent storage bleed is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```

### SMPFS-119 - Low Level Browser Execution Non Goal

```yaml
plan_unit_id: SMPFS-119
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Raw CDP or arbitrary browser code execution is not the guaranteed core browser contract.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
- PS-001
unblocks: []
acceptance_criteria:
- SMPFS-119 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: low_level_browser_execution_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- raw CDP
- arbitrary browser code execution
- guaranteed core browser contract
negative_constraints:
- Raw CDP or arbitrary browser code execution is not the guaranteed core browser contract.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Raw CDP/code execution as core browser contract is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/Permissions_System.md
```

### SMPFS-120 - Generic Watch Mode Non Goal

```yaml
plan_unit_id: SMPFS-120
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Generic watch mode is not the primary dev-loop model.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- RM-025
- SP-001
unblocks: []
acceptance_criteria:
- SMPFS-120 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: generic_watch_mode_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- generic watch mode
- primary dev-loop model
negative_constraints:
- Generic watch mode is not the primary dev-loop model.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Generic watch mode as primary dev-loop model is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Run_Modes.md
- Plans/storage-plan.md
```

### SMPFS-121 - MCP Config Passthrough Non Goal

```yaml
plan_unit_id: SMPFS-121
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: MCP is not config-and-passthrough only; Section 15 consumers rely on host-managed MCP capability resolution.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-121 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: mcp_config_passthrough_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- MCP
- config-and-passthrough only
negative_constraints:
- MCP as config-and-passthrough only is non-canonical.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- MCP config-only framing is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
```

### SMPFS-122 - Tool Permission Scope Non Goal

```yaml
plan_unit_id: SMPFS-122
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: App-level-only tool permission scope is insufficient for the promoted project-switch, MCP, and browser model.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PS-001
- T-001
unblocks: []
acceptance_criteria:
- SMPFS-122 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: tool_permission_scope_non_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- app-level-only tool permission scope
- project-switch
- MCP
- browser model
negative_constraints:
- App-level-only tool permission scope is insufficient for the promoted project-switch/MCP/browser model.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- App-level-only permission scope is explicitly non-canonical after promotion.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/Tools.md
```

### SMPFS-123 - Persona Tier Selector Stale Disposition

```yaml
plan_unit_id: SMPFS-123
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Stale Persona/tier selectors from Personas.md, Contracts_V0, and Contracts_V0.md, including _persona_id and select_for_tier(), are not canonical promoted-shell fields; Section 15 consumers use requested/effective Persona identity and runtime owner scope instead.
gui_related: false
gui_classification_reason: This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- CV-215
unblocks: []
acceptance_criteria:
- SMPFS-123 remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: section15_tail_drift
reasoning_tier: standard
context_scope: section15_tail
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: persona_tier_selector_stale_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0050
preserved_exact_tokens:
- Persona/tier selectors
- Personas.md
- Contracts_V0
- _persona_id
- select_for_tier()
- requested/effective Persona identity
- runtime owner scope
negative_constraints:
- Stale Persona/tier selectors are not canonical promoted-shell fields.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md'
compatibility_only_notes: []
stale_retired_dispositions:
- _persona_id and select_for_tier() are stale/retired promoted-shell fields.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Contracts_V0.md
```

### SMPFS-001 - Section 15 Retired Source-Preserving Bridge

```yaml
plan_unit_id: SMPFS-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: SMPFS-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 170. Section15_MVP_Promoted_Features_Spec-S0001 through S0050 are covered by fine-grained PlanUnits SMPFS-002 through SMPFS-123 or explicit structural coverage, while S0051, S0052, and S0054 are generated structural/audit dispositions and S0053 is retired bridge lineage. SMPFS-001 must not re-own or override implementation-facing PlanUnits and must not use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map.
split_recommended: false
depends_on:
- SMPFS-002
- SMPFS-003
- SMPFS-004
- SMPFS-005
- SMPFS-006
- SMPFS-007
- SMPFS-008
- SMPFS-009
- SMPFS-010
- SMPFS-011
- SMPFS-012
- SMPFS-013
- SMPFS-014
- SMPFS-015
- SMPFS-016
- SMPFS-017
- SMPFS-018
- SMPFS-019
- SMPFS-020
- SMPFS-021
- SMPFS-022
- SMPFS-023
- SMPFS-024
- SMPFS-025
- SMPFS-026
- SMPFS-027
- SMPFS-028
- SMPFS-029
- SMPFS-030
- SMPFS-031
- SMPFS-032
- SMPFS-033
- SMPFS-034
- SMPFS-035
- SMPFS-036
- SMPFS-037
- SMPFS-038
- SMPFS-039
- SMPFS-040
- SMPFS-041
- SMPFS-042
- SMPFS-043
- SMPFS-044
- SMPFS-045
- SMPFS-046
- SMPFS-047
- SMPFS-048
- SMPFS-049
- SMPFS-050
- SMPFS-051
- SMPFS-052
- SMPFS-053
- SMPFS-054
- SMPFS-055
- SMPFS-056
- SMPFS-057
- SMPFS-058
- SMPFS-059
- SMPFS-060
- SMPFS-061
- SMPFS-062
- SMPFS-063
- SMPFS-064
- SMPFS-065
- SMPFS-066
- SMPFS-067
- SMPFS-068
- SMPFS-069
- SMPFS-070
- SMPFS-071
- SMPFS-072
- SMPFS-073
- SMPFS-074
- SMPFS-075
- SMPFS-076
- SMPFS-077
- SMPFS-078
- SMPFS-079
- SMPFS-080
- SMPFS-081
- SMPFS-082
- SMPFS-083
- SMPFS-084
- SMPFS-085
- SMPFS-086
- SMPFS-087
- SMPFS-088
- SMPFS-089
- SMPFS-090
- SMPFS-091
- SMPFS-092
- SMPFS-093
- SMPFS-094
- SMPFS-095
- SMPFS-096
- SMPFS-097
- SMPFS-098
- SMPFS-099
- SMPFS-100
- SMPFS-101
- SMPFS-102
- SMPFS-103
- SMPFS-104
- SMPFS-105
- SMPFS-106
- SMPFS-107
- SMPFS-108
- SMPFS-109
- SMPFS-110
- SMPFS-111
- SMPFS-112
- SMPFS-113
- SMPFS-114
- SMPFS-115
- SMPFS-116
- SMPFS-117
- SMPFS-118
- SMPFS-119
- SMPFS-120
- SMPFS-121
- SMPFS-122
- SMPFS-123
unblocks: []
acceptance_criteria:
- Section15_MVP_Promoted_Features_Spec-S0001 through S0050 remain mapped to fine-grained PlanUnits SMPFS-002 through SMPFS-123 or structural coverage rather than SMPFS-001.
- Section15_MVP_Promoted_Features_Spec-S0051, S0052, and S0054 are structurally dispositioned as generated migration metadata.
- Section15_MVP_Promoted_Features_Spec-S0053 is explicitly dispositioned as retired generated bridge lineage.
- SMPFS-001 no longer uses node_compile_hint.mode=source_preserving_planunit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: section15_retired_bridge
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: retired_migration_bridge
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0051
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0052
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0053
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Section15_MVP_Promoted_Features_Spec-S0054
preserved_exact_tokens:
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
- SMPFS-001
- source_preserving_planunit
- retired_migration_bridge
- Section15_MVP_Promoted_Features_Spec-S0051
- Section15_MVP_Promoted_Features_Spec-S0054
negative_constraints:
- SMPFS-001 must not provide product implementation coverage for Section15_MVP_Promoted_Features_Spec-S0001 through S0050.
- SMPFS-001 must not override SMPFS-002 through SMPFS-123 or structural dispositions.
- SMPFS-001 must not use source_preserving_planunit compile mode after Phase 2B batch 170.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
compatibility_only_notes:
- The retired bridge remains only as migration-lineage compatibility metadata; historical ContractRefs, negative constraints, compatibility notes, stale/retired evidence, and GUI-related bridge markers remain preserved in span_map and coverage_map.
stale_retired_dispositions:
- source_preserving_planunit retired for Section 15 after Phase 2B batch 170.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```
