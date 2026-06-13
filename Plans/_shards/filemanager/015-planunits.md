# Shard 015: PlanUnits

Source: `Plans/FileManager.md`

Source lines: L546-L4174

Source SHA256: `9b3728947067fc1565aa540c0eacd71e57bcc7a81e66b98f1ae53b0cae5cd819`

---

## PlanUnits

### F-002 - File Manager Editor Scope And Compliance

```yaml
plan_unit_id: F-002
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns the File Manager, in-app IDE-style editor, @ mention, click-to-open, image/HTML preview, tabs, and editor enhancement scope while deferring chat UX, layout, browser actions, and storage terms to their owner docs.
gui_related: true
gui_classification_reason: This unit defines user-visible File Manager/editor/chat integration scope and authored help-copy alignment.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: file_manager_editor_scope_and_compliance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0003
preserved_exact_tokens:
- Puppet Master
- File Manager
- IDE-style editor
- "@ mention"
- click-to-open
- redb
- seglog
- ELI5/Expert copy alignment
- ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Chat UX details defer to assistant-chat-design; layout defers to FinalGUISpec; browser click-to-context and agent-driven browser actions defer to the promoted browser owner docs.
owner_hints:
- Plans/FileManager.md
```

### F-003 - Project Driven Capability Activation

```yaml
plan_unit_id: F-003
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager/editor capability packs are activated by detected project signals after explicit detection/import logic, with plausible interpretations visible and overridable, indexing degraded states explicit, remote attachment state visible, and capability-pack breadth bounded and lazy-loaded.
gui_related: true
gui_classification_reason: This unit governs visible project-open detection, degraded states, and remote support affordances.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: project_driven_capability_activation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0004
preserved_exact_tokens:
- MUST assemble
- Project open MUST run explicit detection/import logic
- autodetection visible and overridable
- reduced-capability/degraded-mode state
- Remote mode MUST NOT pretend remote is only local with different paths
- bounded/reused
- lazy-loaded
- ContractName:Plans/Architecture_Invariants.md
negative_constraints:
- Remote mode must not pretend remote is only local with different paths.
- Indexing and external-model sync must be bounded/reused and must not dominate project open, navigation, or editor responsiveness.
compatibility_only_notes:
- Remote project support uses a thin local client/launcher with backend attachment/version management.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Mixed project-detection backend behavior and visible degraded/remote UI state are kept together for source preservation; later implementation may split detection service and UI projection work.
```

### F-004 - External Discovery Cluster Constraints

```yaml
plan_unit_id: F-004
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  External discovery research-lineage anchors constrain the editor/File Manager toward local-first remote-capable operation, incremental scanning, first-class preview/manage operations, durable recovery, native diff/test/task widgets, reusable Rust text core, atomic save/watch handling, and explicit histories while rejecting known fragility modes.
gui_related: true
gui_classification_reason: This unit carries file-tree/sidebar, preview, and editor recovery product constraints with visible surface implications.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: external_discovery_cluster_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0005
preserved_exact_tokens:
- bench-01
- bench-04
- bench-05
- bench-06
- bench-08
- bench-15
- bench-23
- bench-25
- bench-27
- bench-30
- Rust text core
- atomic save
- watcher-driven external-change handling
- persistent search/replace/location histories
negative_constraints:
- Puppet Master must avoid monolithic customization debt and harden auth/path behavior.
- A marker-based split comparison is not enough for PM diff/merge goals.
- Fragile worker /path/SSR/shadow-DOM integration remains a failure mode to design against.
compatibility_only_notes:
- External discovery labels are research-lineage anchors, not product names.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Span mixes implementation-reference architecture constraints with visible File Manager/editor behavior; this PlanUnit preserves the grouped research-lineage cluster.
```

### F-005 - Editor Archetype Constraints

```yaml
plan_unit_id: F-005
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor archetype evidence is grouped by AI-native workbench/IDE, traditional IDE/workbench, embedded wrapper, collaborative/online editor, and terminal-native editor, preserving useful strengths while rejecting hidden defaults such as ephemeral state, weak recovery, limited workspace models, and terminal ownership of the broader surface.
gui_related: true
gui_classification_reason: This unit constrains visible editor/workbench behavior and collaboration affordances.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editor_archetype_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0006
preserved_exact_tokens:
- AI-native workbench/IDE
- full traditional IDE/workbench
- embedded editor engine/wrapper
- collaborative/online editor
- terminal-native editor
- room/share-link
- terminal-native editor
negative_constraints:
- Puppet Master must not inherit ephemeral or memory-backed state, weak durable storage, reconnect/forced-refresh flows, limited multi-buffer/workspace models, no synced scrolling, sanitization shortcuts, or backend/API dependency risk as hidden defaults.
- Terminal-native strengths can inform command design without making the broader File Manager/editor surface terminal-owned.
compatibility_only_notes:
- Lightweight native editors validate direction but also carry plugin compatibility, memory, rendering, and incomplete split/history/navigation risks.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Archetype evidence includes visible UI strengths and backend architecture risks; kept source-preserving as one archetype summary.
```

### F-006 - Editor Adapter Implementation Reference Constraints

```yaml
plan_unit_id: F-006
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The editor adapter stays thin: host/workspace owns file, project, runtime, execution transport, and project identity while the editor renders and edits; selection/caret, guarded updates, split-pane undo ownership, Unicode/revision transforms, degraded language fallback, and execution-transport separation remain explicit.
gui_related: false
gui_classification_reason: This unit defines adapter/runtime ownership constraints, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editor_adapter_implementation_reference_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0007
preserved_exact_tokens:
- thin
- host/workspace own file/project/runtime identity
- selection/caret
- silent/guarded update paths
- split-pane/editor-instance undo ownership
- Unicode-aware OT/revision transforms
- Deterministic extension/file-name based language fallback
- degraded path
negative_constraints:
- Deterministic extension/file-name based language fallback is degraded only, not a substitute for real detection/indexing/LSP.
- The editor surface does not own workspace truth, execution transport, or project identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-007 - File Manager Editor Definitions

```yaml
plan_unit_id: F-007
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager defines Buffer, Tab, Editor group, Dirty, Preset, redb, seglog, and FileSafe terms for the editor and File Manager surface.
gui_related: true
gui_classification_reason: Definitions describe user-visible editor concepts such as buffers, tabs, groups, dirty state, and presets.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: file_manager_editor_definitions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0008
preserved_exact_tokens:
- Buffer
- Tab
- Editor group
- Dirty
- Preset
- redb
- seglog
- FileSafe
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- seglog is the canonical append-only event ledger; FileSafe owns patch/apply/verify pipeline guards.
owner_hints:
- Plans/FileManager.md
```

### F-008 - Shared Buffer Transaction And Save Authority

```yaml
plan_unit_id: F-008
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  All user, preview, agent, FileSafe/LSP, restore/revert, and recovery replay mutations enter the shared buffer through typed transaction sources before dirty state, undo grouping, and save authority update; one save authority per file path governs split panes, previews, LSP edits, and agent mutations.
gui_related: false
gui_classification_reason: This unit defines buffer transaction, save, history, and mutation authority behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: shared_buffer_transaction_and_save_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0009
preserved_exact_tokens:
- typed transaction sources
- Save authority remains single-owner per file path
- one shared buffer
- one dirty flag
- one authoritative save/retry path
- /paste/delete
- /revert/history
- /undo
- /redo
- Restore to… / History
- MUST NOT masquerade as ordinary editor undo
- Remote `/SSH`
negative_constraints:
- Multi-file apply-edit, rename, hunk-level patch-apply, repo/worktree restore, and conflict-resolution flows must not masquerade as ordinary editor undo.
- Editor Ctrl+Z never becomes cross-file global undo.
- Runtime safe points remain internal blocked recovery anchors and are not restore points.
compatibility_only_notes:
- legacy `unsaved-content` wording maps to recover-unsaved handling on /quit and /later.
stale_retired_dispositions: []
owner_boundary_notes:
- FileSafe, LSPSupport, FinalGUISpec, and storage-plan own adjacent mutation, LSP, UI, and storage behavior.
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Span mixes buffer transaction classes, visible requested/effective modes, and restore/history boundaries; this unit preserves the shared authority contract.
```

### F-009 - File Manager Panel MVP Tree Behavior

```yaml
plan_unit_id: F-009
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The File Manager panel lists project files under root, opens selected files through the editor open-file contract, virtualizes large trees, restores expand/collapse state, exposes Hide ignored and row-cap settings, and shows explicit open/refresh/empty/permission error states.
gui_related: true
gui_classification_reason: This unit defines visible File Manager tree behavior, settings, and error states.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: file_manager_panel_mvp_tree_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0011
preserved_exact_tokens:
- File Manager panel
- Done when
- Virtualized tree handles 10k+ rows
- Open failed
- Refresh failure
- Empty project
- No permission on subfolder
- Hide ignored
- Row cap per directory
- file_manager/expanded/{project_id}
- file_manager/row_cap_per_directory
negative_constraints:
- Open failure must not leave the tree in an inconsistent state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Source span also includes worktree identity and context-menu/layout details split into F-010 and F-011.
```

### F-010 - Worktree Aware File Identity

```yaml
plan_unit_id: F-010
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Worktree-variant opens are identity-rich: same repo-relative path across worktrees defaults to side-by-side compare with project, repo, path, left/right worktree, and optional revision identity; ordinary tabs stay path-backed to one concrete file identity and must not hide dirty state, undo history, save target, file-watch identity, or chat/diff routing.
gui_related: true
gui_classification_reason: This unit governs visible worktree variant compare/open behavior and editor tab identity.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: worktree_aware_file_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0011
preserved_exact_tokens:
- same-file-across-worktrees
- project_id
- repo_id
- repo_relative_path
- left_worktree_id
- right_worktree_id
- current worktree
- other variants available
- Open other worktree version
- Compare with worktree...
- content-swapping tab
negative_constraints:
- PM must not implement a content-swapping tab that hides dirty state, undo history, save target, file-watch identity, or chat/diff routing.
- A worktree variant chip may switch variants only inside compare or multi-variant inspection, not ordinary editor-tab identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Source Control owns stronger switch/manage/conflict worktree UI.
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Split from File Manager panel behavior so worktree identity does not get buried in generic tree behavior.
```

### F-011 - Panel Placement Context Menu Keyboard And Accessibility

```yaml
plan_unit_id: F-011
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager panel placement supports left/right dock or pop-out, optional detach/snap behavior, filter/search, .gitignore dimming or hiding, context menu entrypoints for canonical tree actions, active-row plus multi-select behavior, create/rename validation, reveal/current-file highlighting, and keyboard-only accessibility.
gui_related: true
gui_classification_reason: This unit covers visible panel placement, context menus, keyboard interaction, and accessibility.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: panel_placement_context_menu_keyboard_accessibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0011
preserved_exact_tokens:
- pop-out
- left sidebar
- right sidebar
- Search/filter box
- dock/pin position
- Detach/snap
- Context menu
- Add to Assistant Chat
- Open in Terminal
- Open With
- Save Local Copy
- Arrow keys
- Enter
- multi-select
- Copy full path
- reveal
- current-file /highlight
negative_constraints:
- Open actions are open-on-click and open-on-enter against the active row, not bulk-open of every selected file.
- Create/rename rejects empty names, . / .., separators, and platform-reserved names before mutation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Split from File Manager panel MVP tree behavior for GUI interaction details.
```

### F-012 - External Drag Drop Behavior Summary

```yaml
plan_unit_id: F-012
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager external drag/drop supports dropping files/folders onto project folders with copy default, Shift-move semantics, valid drop target validation, tree refresh/progress, drag-out URIs for project files, and deterministic per-item handling for multi-select operations.
gui_related: true
gui_classification_reason: This unit governs user-visible external drag/drop behavior and multi-selection operations.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: external_drag_drop_behavior_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0013
preserved_exact_tokens:
- Drag and drop
- external ↔ File Manager
- copy
- move
- Shift
- valid drop targets
- multi-selection
- lexicographic by normalized source path
- name conflicts
- ContractRef: Plans/Tools.md §2.5, Plans/FileSafe.md
negative_constraints:
- Drag/drop operations must reject paths outside the project through security validation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-013 - Drag Drop Implementation And Feedback

```yaml
plan_unit_id: F-013
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Drag/drop implementation uses platform file-drop APIs for Windows, macOS, and Linux, normalizes and validates target paths under the project root, provides conflict dialog or setting behavior, performs large copy/move in background tasks with progress/cancel, and shows visual drag target plus post-drop feedback.
gui_related: true
gui_classification_reason: This unit defines visible drag target feedback and platform drag/drop implementation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: drag_drop_implementation_and_feedback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0014
preserved_exact_tokens:
- IDropTarget
- CF_HDROP
- DoDragDrop
- NSDraggingDestination
- NSPasteboardTypeFileURL
- Xdnd
- Wayland
- text/uri-list
- Normalize
- under the project root
- Name conflict dialog
- background task
- progress
- visual drag target
negative_constraints:
- Large drop operations must not block the main thread or tree UI.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Implementation and user feedback details are combined in the source span.
```

### F-014 - Drag Drop Gaps Security And Failure Handling

```yaml
plan_unit_id: F-014
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Drag/drop gap handling covers cross-platform behavior, directory drops, move-versus-copy clarity, name conflicts, symlink policy, sensitive path exposure, cancellation, errors, locked files, path-too-long messages, project-root write guards, permission-denied errors, disk-space checks, rollback cleanup, and background execution.
gui_related: true
gui_classification_reason: This unit covers user-visible drag/drop failure handling and security prompts.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: drag_drop_gaps_security_failure_handling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0016
preserved_exact_tokens:
- Symlinks
- Sensitive path exposure
- Cancel / failure mid-copy
- Locked files / permissions
- Path too long
- project-root write guard
- permission-denied
- insufficient space
- rollback cleanup
- background task
negative_constraints:
- Dragged-in paths must be validated against allowed workspace/project boundaries before mutation.
- Do not block the main thread or tree UI.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Security/backend failure and user-visible error handling are preserved together from adjacent spans.
```

### F-015 - Deferred Drag Drop Enhancements

```yaml
plan_unit_id: F-015
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Deferred drag/drop enhancements include internal reorder for custom sort, same-filesystem move fallback, undo toast for recent copies, drag-to-chat attachment, and Settings options for default drop action, conflict policy, and show hidden files.
gui_related: true
gui_classification_reason: This unit captures optional visible drag/drop enhancements and settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: deferred_drag_drop_enhancements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0017
preserved_exact_tokens:
- Internal reorder
- Move instead of copy
- Undo toast
- Drag to chat
- Default drop action
- Conflict policy
- Show hidden files
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- These are enhancements, not MVP hard blockers unless promoted by later owner docs.
owner_hints:
- Plans/FileManager.md
```

### F-016 - IDE Style Editor MVP Acceptance

```yaml
plan_unit_id: F-016
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The in-app IDE-style editor MVP opens files from the open-file contract, saves buffers, shows dirty and read-only states, enforces large-file limits, shows transient states, handles empty-file behavior, preserves canonical paths, and records cursor/scroll payload shape and highlight duration settings.
gui_related: true
gui_classification_reason: This unit defines visible editor MVP acceptance behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: ide_style_editor_mvp_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0018
preserved_exact_tokens:
- In-app IDE-style editor (MVP)
- Open failure
- Empty file behavior
- canonical path
- §4.1
- { line, column, scroll_y }
- editor/highlight_duration_ms
- Loading
- File not found
negative_constraints:
- Editor behavior must enforce large file threshold and hard cap.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-017 - Editor Placement Layout Detach And Tabs

```yaml
plan_unit_id: F-017
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor placement uses the File Editor strip and supports docked visibility, detach/redock, one floating editor window, tabs with active-buffer switching, close/unsaved prompts, reorder, and persistence.
gui_related: true
gui_classification_reason: This unit defines editor placement, layout, detach, and tab UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editor_placement_layout_detach_and_tabs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0019
preserved_exact_tokens:
- File Editor strip
- Placement
- layout
- detach
- redock
- one floating editor window
- tabs
- reorder
- persistence
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-018 - Editing Save State Model

```yaml
plan_unit_id: F-018
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor save state keeps dirty, read-only, degraded, change-marker, write-lock, stale-disk, changed-on-disk, transient save/reload failure, and recovery attention as orthogonal facts; Save is explicit, save failure leaves dirty state intact with retry, save-as, and reason, and shared buffers remain authoritative.
gui_related: true
gui_classification_reason: This unit covers user-visible dirty/read-only/degraded/change-marker/write-lock/stale-disk facts and save behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editing_save_state_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0020
preserved_exact_tokens:
- dirty
- read-only
- /degraded
- change-marker
- write-lock
- stale-disk
- changed-on-disk
- Save is explicit
- save failure leaves dirty
- retry
- save-as
- ContractName:Plans/storage-plan.md
negative_constraints:
- Save failure must not silently clear dirty state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Source span also carries revert/restore and remote recovery contracts split into F-019 and F-020.
```

### F-019 - Revert Restore Boundaries

```yaml
plan_unit_id: F-019
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Revert and restore flows route through explicit backend-owned restore history: cmd.chat.revert resolves target_message_id or latest assistant turn, whole-turn multi-file restores update each buffer via backend refresh notification, and document pane restore/history uses the same restore pipeline without owning separate restore points.
gui_related: false
gui_classification_reason: This unit defines backend restore/revert routing and history boundaries, not GUI layout.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: revert_restore_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0020
preserved_exact_tokens:
- cmd.chat.revert
- target_message_id
- latest assistant turn
- whole-turn multi-file restore
- backend refresh notification
- Restore to… / History
- document pane
- restore points
negative_constraints:
- Neither File Editor nor document pane stores or manufactures restore points independently.
- Restore/revert must not create separate history branches.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Split from editing/save source span to keep backend restore history separate from GUI save states.
```

### F-020 - Recover Unsaved And Remote Backed Recovery

```yaml
plan_unit_id: F-020
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Recover-unsaved is required for local and remote-backed buffers; recovered remote-backed buffers represent local unsaved memory only, show the exact recovery banner, and must reconnect or revalidate destination before save or flush claims remote success.
gui_related: true
gui_classification_reason: This unit governs visible recover-unsaved and remote-backed recovery banners and states.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: recover_unsaved_remote_backed_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0020
preserved_exact_tokens:
- Recover unsaved
- local and remote-backed buffers
- Recovered local edits — remote destination not yet synchronized
- reconnect
- revalidate
- remote save/flush
- remote terminal
- /run-debug
negative_constraints:
- Remote terminal and /run-debug execution must not be promised merely because a remote-backed file can be edited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Split from broader editing/save source span for recovery-specific user-visible behavior.
```

### F-021 - Remote Offline Cached File Wording

```yaml
plan_unit_id: F-021
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager/editor owns cached-file-only offline editing: live UI uses Work offline (cached files only), legacy Work offline (cached) is compatibility shorthand only, no cached snapshot disables or shows no-cached-files state, and remote degraded states disclose host, pending write, read-only, search, git, shell, LSP, and file write availability.
gui_related: true
gui_classification_reason: This unit defines visible offline/cached-file labels and remote degraded states.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: remote_offline_cached_file_wording
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0021
preserved_exact_tokens:
- Work offline (cached files only)
- Work offline (cached)
- legacy shorthand
- no-cached-files state
- Remote host reconnecting
- Remote host unavailable
- Pending remote write
- Remote file is read-only
- remote `/offline`
negative_constraints:
- Live UI copy must not alternate between Work offline (cached files only) and legacy shorthand.
- When disconnected, remote file listings, searches/diffs, git, shell, LSP, and file writes must not pretend to be live.
compatibility_only_notes:
- Work offline (cached) may appear only in migration aliases, telemetry lineage, or compatibility notes.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-022 - Display Navigation Line Range And Highlighting

```yaml
plan_unit_id: F-022
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor display and navigation show line numbers, open and scroll to requested line/range data, highlight read-only ranges, clamp beyond-EOF requests, support go-to-line, and use basic syntax highlighting with LSP semantic highlighting augmentation or fallback.
gui_related: true
gui_classification_reason: This unit defines visible editor display, line navigation, highlighting, and syntax behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: display_navigation_line_range_highlighting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0022
preserved_exact_tokens:
- Line numbers
- Go to line / range
- 12
- 12-45
- L12-L45
- 1-based, inclusive
- highlights the range
- AutoDecision: default 5 s
- Clamped to line N
- .rs
- .py
- .md
- .json
- .toml
- .html
- .css
- .js
- semantic highlighting
negative_constraints:
- Unknown extension or plain text has no highlighting beyond fallback behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-023 - Split Panes And Editor Groups

```yaml
plan_unit_id: F-023
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Split editor panes are MVP scope with multiple editor groups, one tab list and active tab per group, one shared buffer per file path, focused group open targeting by default, optional Open in other group/new group actions, and per-view cursor and scroll state.
gui_related: true
gui_classification_reason: This unit defines visible split-pane editor group behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: split_panes_and_editor_groups
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0023
preserved_exact_tokens:
- Split editor panes
- multiple editor groups
- Tab bar model (MVP)
- one buffer per file path
- active (focused) editor group
- Open in other group
- Open in new group
- Cursor/scroll position is per-view
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-024 - Embedded Document Pane Shared Buffer And Write Lock

```yaml
plan_unit_id: F-024
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Embedded document pane shares the same file buffer, dirty state, save authority, restore pipeline, and history model as File Editor; when DocumentPane status is writing…, File Editor and document pane are write-locked/read-only for user edits with a visible lock banner while streaming updates still apply.
gui_related: true
gui_classification_reason: This unit governs visible embedded document pane editing, read-only, and lock states.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: embedded_document_pane_shared_buffer_write_lock
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0024
preserved_exact_tokens:
- Embedded document pane
- same file buffer
- one dirty state
- same restore pipeline
- writing…
- read-only
- Locked: agent is writing this document
- Streaming updates
- shared-buffer invariant
negative_constraints:
- The lock is an interaction rule only; it does not create a separate buffer or history branch.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Combines shared-buffer backend invariant with visible write-lock/banner behavior.
```

### F-025 - Embedded Annotation Chat Handoff Boundary

```yaml
plan_unit_id: F-025
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Embedded document annotations and chat handoff share document identity and buffer state while keeping annotation and composer-prep state adjacent to, not part of, file buffers: annotations anchor to canonical source text, send selection to chat does not mutate the buffer, and stale rendered selections fail explicitly.
gui_related: false
gui_classification_reason: This unit defines annotation and chat handoff state boundaries rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: embedded_annotation_chat_handoff_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0025
preserved_exact_tokens:
- Embedded Document Pane
- annotations
- chat handoff
- canonical source text
- rendered DOM state
- second buffer
- second dirty flag
- separate undo/history branch
- Send selection to chat
- thread-scoped composer-prep state
- stale rendered state
negative_constraints:
- Creating or resolving annotations must not create a second buffer, second dirty flag, or separate undo/history branch.
- Stale rendered-state annotation creation must fail explicitly rather than silently rebase.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-026 - Data Model Dirty State And Changed On Disk Prompt

```yaml
plan_unit_id: F-026
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor data model uses one buffer per file path and no duplicate tabs per group; dirty state reflects in-memory versus last-saved content, revert prompts before discarding dirty data, and file-changed-on-disk checks on save or focus show one combined prompt for dirty plus changed-on-disk cases.
gui_related: true
gui_classification_reason: This unit defines visible buffer dirty state and file-changed prompts.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: data_model_dirty_state_changed_on_disk_prompt
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0026
preserved_exact_tokens:
- One buffer per file path
- one tab per path per group
- Dirty state
- Revert (reload from disk)
- Discard unsaved changes and reload?
- File changed on disk
- Reload / Overwrite / Cancel
- Do not check on every keystroke
- File changed on disk. You have unsaved changes. Reload (discard yours) / Overwrite disk / Cancel
negative_constraints:
- Do not show two separate dialogs in sequence for dirty plus file-changed-on-disk.
- Do not check for file-changed-on-disk on every keystroke.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Span combines buffer data model and visible prompt behavior.
```

### F-027 - Text Encoding File Type And Read Only Reasons

```yaml
plan_unit_id: F-027
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor text behavior includes per-buffer undo/redo, selection and clipboard, optional word wrap, monospace font, UTF-8 editable text, line-ending preservation, explicit Save only, binary/read-only file handling, and user-visible read-only reasons.
gui_related: true
gui_classification_reason: This unit covers visible text behavior, decode errors, binary/read-only states, and editor settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: text_encoding_file_type_read_only_reasons
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0027
preserved_exact_tokens:
- Undo/redo
- Ctrl+Z
- Ctrl+Shift+Z
- Ctrl+Y
- Copy, Cut, Paste
- UTF-8
- Cannot decode as UTF-8
- Only on explicit Save
- Binary file -- cannot edit.
- Read-only on disk
- File too large
- read-only reason in UI
negative_constraints:
- No auto-save in MVP.
- Hex view is out of scope for MVP.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-028 - Large File Strategy And Limits

```yaml
plan_unit_id: F-028
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Large-file MVP uses truncated read-only view plus Load full file above the line threshold, enforces a 10 000-line default and 5 MB hard cap, offers read-only/system-editor alternatives above cap, and persists configurable editor thresholds.
gui_related: true
gui_classification_reason: This unit defines visible large-file affordances and settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: large_file_strategy_and_limits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0028
preserved_exact_tokens:
- truncated view + "Load full file"
- 10 000 lines
- 5 MB
- File too large to edit
- View read-only (truncated)
- Open in system editor
- Large file threshold (lines)
- Hard cap (MB)
negative_constraints:
- Do not implement read-only virtualized editing in MVP unless needed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-029 - Editor Keyboard Shortcuts And Focus Policy

```yaml
plan_unit_id: F-029
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor focus handles Save, Close tab, Go to line, Next/Previous tab, Save As, and app/chat shortcut routing; floating editor windows handle editor shortcuts when any editor window has OS focus and open-file actions target/focus the floating editor.
gui_related: true
gui_classification_reason: This unit covers user-visible keyboard shortcuts and floating-editor focus routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editor_keyboard_shortcuts_focus_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0029
preserved_exact_tokens:
- Ctrl+S
- Ctrl+W
- Ctrl+G
- Ctrl+Tab
- Ctrl+Shift+Tab
- Save As
- Floating editor
- OS focus
- open the file there
negative_constraints:
- When focus is elsewhere, app/chat shortcuts apply instead of editor shortcuts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
```

### F-030 - Editor Persistence Schema

```yaml
plan_unit_id: F-030
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor persistence stores open tab order, active tab index, scroll/cursor state, max tabs, session view state, layout/recent files, lazy-load restore behavior, persisted tab cap, dirty-buffer exit prompts, and recover-unsaved availability using redb-backed per-project/session keys without persisting full buffer content.
gui_related: true
gui_classification_reason: This unit defines persisted editor tab, cursor, and layout state visible across sessions.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: editor_persistence_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0030
preserved_exact_tokens:
- tabs.{project_id}
- active_tab.{project_id}
- scroll_cursor.{project_id}.{path_hash}
- max_tabs
- session.{project_id}.{session_id}
- Do not persist full buffer content
- editor.max_persisted_tabs
- default `50`
- Dirty buffers on exit
- Recover unsaved
negative_constraints:
- Do not persist full buffer content as ordinary editor state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Source span also contains transient state and accessibility requirements split into F-031.
```

### F-031 - Transient Editor States And Accessibility

```yaml
plan_unit_id: F-031
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Editor and File Manager surfaces show consistent transient UI states and support keyboard-only operation, focus indicators, logical focus order, screen-reader-friendly labels where available, and reduced-motion preferences.
gui_related: true
gui_classification_reason: This unit covers visible loading/error states and accessibility behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: transient_editor_states_and_accessibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0030
preserved_exact_tokens:
- Loading...
- Decoding...
- Cannot decode as UTF-8
- File not found
- Deleted
- Binary file
- File too large
- Indexing...
- Open failed
- keyboard-only use
- visible focus indicators
- logical focus order
- screen reader-friendly labels
- reduced-motion preferences
negative_constraints:
- Editor and File Manager must not be mouse-only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/FileManager.md
split_recommendation_reason: Split from persistence schema so accessibility and transient UI states are independently addressable.
```

### F-032 - Mention In Chat Identity Preserving References

```yaml
plan_unit_id: F-032
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The @ mention system is project-scoped and identity-preserving: invoking @ opens a picker rooted in active project context, sources can include recent/modified/folder/symbol results, inserted mentions preserve canonical file identity/path, and already-open references resolve to existing editor state.
gui_related: true
gui_classification_reason: Although span_map inferred non-GUI, this unit governs the visible @ mention picker and chat navigation behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: mention_in_chat_identity_preserving_references
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0031
preserved_exact_tokens:
- "@ mention"
- project-scoped
- identity-preserving
- recent files
- modified files
- folder navigation
- symbol-aware results
- canonical file identity/path
- Assistant and Interview chat surfaces
- existing editor state
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GUI-related classification corrects span_map inference because this span defines visible chat picker/navigation behavior.
owner_hints:
- Plans/FileManager.md
```

### F-033 - File Manager Editor Chat Shared Project Integration

```yaml
plan_unit_id: F-033
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager, editor, and chat share one project context, @ mention uses the same file list as File Manager, and clicking a file path or code block in chat opens the file in the editor.
gui_related: true
gui_classification_reason: Although span_map inferred non-GUI, this unit governs visible click-to-open integration between chat and editor.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: file_manager_editor_chat_shared_project_integration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0032
preserved_exact_tokens:
- same project context
- "@ mention resolution"
- same file list
- single source of truth for project files
- Clicking a file path or code block in chat opens the file in the editor
- §5
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GUI-related classification corrects span_map inference because this span defines visible click-to-open behavior.
owner_hints:
- Plans/FileManager.md
```

### F-034 - Identity-Based Open Routing And Worktree File Realization

```yaml
plan_unit_id: F-034
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns identity-based file-open routing: route_target paths resolve through
  Contracts_V0 route/open semantics, opened files bind to the active worktree
  execution_unit_context, and chat file-edit cards open the worktree filesystem path resolved from
  working_directory + relative_path without a special rewrite layer.
gui_related: true
gui_classification_reason: >-
  This unit governs visible file/editor open behavior from GUI, CLI, chat cards, and internal
  routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: identity_based_open_routing_and_worktree_file_realization
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0033"
preserved_exact_tokens:
- "route_target"
- "github://owner/repo/file.md"
- "execution_unit_context"
- "working_directory + relative_path"
- "to-open"
- "real file on disk"
- "worktree path"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Contracts_V0 owns shared route/open semantics; FileManager realizes workspace file opens rather than raw route_target reads."
owner_hints:
- "Plans/FileManager.md"
```

### F-035 - Artifact Identity Storage And Approval-Scoped Open Visibility

```yaml
plan_unit_id: F-035
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Artifact opens are identity-backed and approval-scoped: artifacts are stored by content hash
  with concern_id, route_target, artifact_type, and timestamp identity, raw paths are deprecated,
  and the GUI open-file list filters by active execution_role and approval_scope.
gui_related: true
gui_classification_reason: >-
  This unit affects the GUI open-file list and approval-scoped visibility of opened files and
  artifacts.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: artifact_identity_storage_and_approval_scoped_open_visibility
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0033"
preserved_exact_tokens:
- "content hash"
- "(concern_id, route_target, artifact_type, timestamp)"
- "raw paths are deprecated"
- "execution_role"
- "approval_scope"
- "Open-file visibility"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Raw paths are deprecated for artifact identity."
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-036 - Route Target And OpenFile Boundary Rules

```yaml
plan_unit_id: F-036
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Route/open handling keeps Contracts_V0 as owner for canonical route_target and OpenSubject
  contracts, keeps Crosswalk limited to primitive boundary ownership, and keeps OpenFile narrow as
  a filesystem/editor realization for path, optional line/range, target_group, navigation, and
  workspace file paths.
gui_related: false
gui_classification_reason: >-
  This unit defines routing and owner-boundary contracts rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: route_target_and_openfile_boundary_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0034"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0035"
preserved_exact_tokens:
- "route_target"
- "OpenSubject"
- "Crosswalk"
- "OpenFile { path, line?, range?, target_group? }"
- "open-file"
- "file-open"
- "/navigation"
- "line /range"
- "target_group"
negative_constraints:
- "OpenFile must not become the owner for every openable object."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Contracts_V0 owns route_target and OpenSubject; Crosswalk owns primitive boundary ownership; FileManager owns narrow workspace-file realization."
owner_hints:
- "Plans/FileManager.md"
```

### F-037 - OpenArtifact Attempt-Native Resolution

```yaml
plan_unit_id: F-037
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  OpenArtifact resolves identity-native runtime-artifact opens by artifact_id first, then follows
  envelope references to content_ref, linked_artifact_id, logical_artifact_id, receipt-like refs,
  attempt-level evidence lineage, and Source Control, GitHub, Docker, or Kubernetes surfaces when
  relevant.
gui_related: false
gui_classification_reason: >-
  This unit defines artifact identity resolution and runtime envelope linkage.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: openartifact_attempt_native_resolution
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0035"
preserved_exact_tokens:
- "OpenArtifact"
- "artifact_id"
- "content_ref"
- "linked_artifact_id"
- "logical_artifact_id"
- "receipt-like refs"
- "attempt-level"
- "run_id"
- "node_id"
- "thread_id"
- "attempt_id"
- "task_id"
negative_constraints: []
compatibility_only_notes:
- "task_id remains legacy /compatibility display metadata, not the primary execution anchor."
stale_retired_dispositions: []
owner_boundary_notes:
- "Runtime artifact envelopes carry run_id, node_id, thread_id, attempt_id, and artifact_id."
owner_hints:
- "Plans/FileManager.md"
```

### F-038 - Route Open Ref Family Separation

```yaml
plan_unit_id: F-038
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager route/open handling keeps inspection detail refs, report evidence refs, provenance
  source refs, receipt external-operation refs, and navigation deep-link refs distinct as inputs
  to OpenSubject, OpenArtifact, or workspace-file realization.
gui_related: false
gui_classification_reason: >-
  This unit defines route/open taxonomy and identity boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: route_open_ref_family_separation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0035"
preserved_exact_tokens:
- "/detail"
- "/evidence"
- "/source"
- "/external-operation"
- "/deep-link"
- "OpenSubject"
- "OpenArtifact"
- "workspace-file realization"
- "subject_id"
- "object_kind/object_id"
negative_constraints: []
compatibility_only_notes:
- "Normalize legacy /special-case IDs into subject_id or object_kind/object_id before open/navigation handling."
stale_retired_dispositions: []
owner_boundary_notes:
- "FileManager consumes route_target and subject_id identity without collapsing ref families under one loose link idea."
owner_hints:
- "Plans/FileManager.md"
```

### F-039 - File And Artifact Open Recovery Classification

```yaml
plan_unit_id: F-039
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Broken file paths or unreachable route_targets log visibility deferral, emit a navigable concern
  error, provide a fallback route when primary routing is unavailable, and classify remote SSH
  open/save/list/search failures before recovery while preserving network, permission, and
  not-found distinctions in Search/FileManager UI state.
gui_related: true
gui_classification_reason: >-
  This unit governs navigable user-visible recovery state for broken file, artifact, Search, and
  remote SSH access.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: file_and_artifact_open_recovery_classification
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0036"
preserved_exact_tokens:
- "visibility deferral"
- "navigable error"
- "workspace://project/concern"
- "cmd.search.find_in_files"
- "cmd.search.open_result"
- "network_blocked_by_policy"
- "host_unreachable"
- "host_untrusted"
- "permission_denied"
- "path_not_found"
- "File not found"
- "remote /SSH"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Search owns cmd.search.find_in_files and cmd.search.open_result; FileManager records route/open recovery state."
owner_hints:
- "Plans/FileManager.md"
split_recommendation_reason: >-
  The span mixes backend recovery classification with user-visible Search/FileManager UI state;
  both remain source-preserved in one unit for this standardization pass.
```

### F-040 - Terminal And Browser Tab Identity Separation

```yaml
plan_unit_id: F-040
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager consumes terminal and browser tab ownership without collapsing them: terminal tabs
  use terminal_tab_id, terminal_pane_id, and terminal_session_id from the terminal model, browser
  tabs use browser-session identity from browser owner docs, and pinning, capability badges, and
  labels keep the state separate.
gui_related: true
gui_classification_reason: >-
  This unit governs visible tabs, labels, pinning, and capability badges.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: terminal_and_browser_tab_identity_separation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0037"
preserved_exact_tokens:
- "terminal_tab_id"
- "terminal_pane_id"
- "terminal_session_id"
- "browser-session identity"
- "Pinning"
- "capability badges"
- "tab labels"
- "/cap/browser-tab"
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "The source shorthand /cap/browser-tab is retired as an ambiguous combined concept rather than a live tab type."
owner_boundary_notes:
- "Terminal and browser owner docs define their respective tab/session identity models."
owner_hints:
- "Plans/FileManager.md"
```

### F-041 - Live Section 10-12 Ownership Restoration

```yaml
plan_unit_id: F-041
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The old restore missing §10-§12 placeholder is retired; sections 10, 11, and 12 are live owner
  sections for editor navigation, file-tree action handoff, and Source Control review behavior and
  are not optional appendices.
gui_related: false
gui_classification_reason: >-
  This unit records canonical owner-section restoration and stale placeholder retirement.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: live_section_10_12_ownership_restoration
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0038"
preserved_exact_tokens:
- "restore missing §10-§12"
- "Sections 10, 11, and 12"
- "editor navigation"
- "file-tree action handoff"
- "Source Control review behavior"
- "not optional appendices"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "The old placeholder restore missing §10-§12 is retired."
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-042 - Breadcrumb And Outline LSP Fallback

```yaml
plan_unit_id: F-042
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns the editor breadcrumb strip and outline; available LSP data uses
  documentSymbol, fallback uses heuristic or regex outline data, and degraded state is labeled
  when LSP is unavailable.
gui_related: true
gui_classification_reason: >-
  This unit governs visible editor breadcrumb and outline surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: breadcrumb_and_outline_lsp_fallback
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0039"
preserved_exact_tokens:
- "breadcrumb strip"
- "outline"
- "documentSymbol"
- "heuristic or regex outline data"
- "degraded state"
- "LSP"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-043 - Editor Surface Seams And Strong Preview Coverage

```yaml
plan_unit_id: F-043
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager keeps broad editor meta-findings canonical, preserves sparse implementation seams as
  visible product seams, keeps image and HTML/browser preview coverage explicit, keeps cmd.browser
  command routing with the browser command family, and shares click-to-open from files-touched,
  Read:, and Edited: entries with assistant-chat-design.
gui_related: true
gui_classification_reason: >-
  This unit carries user-visible editor, preview, browser, and chat routing surface boundaries.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: editor_surface_seams_and_strong_preview_coverage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0039"
preserved_exact_tokens:
- "/buffers"
- "/dirty"
- "/drop"
- "image /HTML preview"
- "rename"
- "delete"
- "duplicate"
- "/compare"
- "patch/conflict handling"
- "symbol-index fallback"
- "remote SSH/LSP"
- "cmd.browser"
- "cmd.browser.*"
- "files-touched"
- "Read:"
- "Edited:"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Browser preview and cmd.browser routing belong to the browser owner docs; click-to-open from chat entries is shared with assistant-chat-design.md."
owner_hints:
- "Plans/FileManager.md"
split_recommendation_reason: >-
  The span mixes strong existing preview coverage, sparse editor seams, and cross-doc browser/chat
  routing boundaries; later implementation may split those surfaces.
```

### F-044 - Go To Symbol Owner And Fallbacks

```yaml
plan_unit_id: F-044
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager §10.2 is the canonical owner for Go to symbol; command-palette and quick-open symbol
  picker behavior uses documentSymbol and workspace/symbol when LSP is available and heuristic,
  regex, or indexed symbol fallbacks when it is not.
gui_related: true
gui_classification_reason: >-
  This unit governs command-palette and quick-open symbol picker behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: go_to_symbol_owner_and_fallbacks
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0040"
preserved_exact_tokens:
- "FileManager §10.2"
- "Go to symbol"
- "command-palette"
- "quick-open symbol picker"
- "documentSymbol"
- "workspace/symbol"
- "heuristic, regex, or indexed symbol fallback"
- "FileManager §10.9"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "References to FileManager §10.9 as the Go to symbol owner are stale and must be corrected rather than inventing a new §10.9 owner."
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-045 - Symbol Index Status Search Boundary

```yaml
plan_unit_id: F-045
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Symbol-index /status language in FileManager is scoped to Go to symbol and semantic navigation;
  FileManager consumes search results and fallback labels while grep and Search regex acceleration
  stay under Tools and storage-plan.
gui_related: true
gui_classification_reason: >-
  This unit governs visible symbol-index status and fallback labels while preserving Search
  ownership boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: symbol_index_status_search_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0040"
preserved_exact_tokens:
- "symbol-index /status"
- "/FileManager.md"
- "grep"
- "Search regex acceleration"
- "Tools"
- "storage-plan"
- "fallback labels"
negative_constraints:
- "Symbol-index /status language must not imply that the regex index owns File Manager search or symbol indexing."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Search and grep acceleration remain under Tools and storage-plan; FileManager consumes results and labels."
owner_hints:
- "Plans/FileManager.md"
```

### F-046 - Diagnostics Gutter And Change Marker Projection

```yaml
plan_unit_id: F-046
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Diagnostics, gutter markers, and editor change markers render in the editor surface, consume LSP
  or fallback projections, and preserve open-file identity from §4.1.
gui_related: true
gui_classification_reason: >-
  Diagnostics, gutter markers, and change markers are visible editor projections.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: diagnostics_gutter_and_change_marker_projection
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0041"
preserved_exact_tokens:
- "Diagnostics"
- "gutter markers"
- "editor change markers"
- "LSP"
- "fallback projections"
- "§4.1"
- "open-file identity"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-047 - Editor Semantic Actions And FileSafe Mutation Boundary

```yaml
plan_unit_id: F-047
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Definition, references, hover, code actions, formatting, rename, and apply-edit flows route
  through the FileManager editor surface, with FileSafe used whenever a mutation is applied.
gui_related: true
gui_classification_reason: >-
  Definition, hover, code action, formatting, rename, and apply-edit flows are visible editor
  actions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: editor_semantic_actions_and_filesafe_mutation_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0042"
preserved_exact_tokens:
- "Definition"
- "references"
- "hover"
- "code actions"
- "formatting"
- "rename"
- "apply-edit"
- "FileSafe"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-048 - Add To Assistant Chat File Reference Lock

```yaml
plan_unit_id: F-048
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns the file-tree action surface, and cmd.chat.add_file_reference is a lock: Add to
  Assistant Chat inserts a visible file reference chip into the active composer or thread context,
  file references are file-only in MVP, and folder insertion is out of scope.
gui_related: true
gui_classification_reason: >-
  This unit governs the visible Add to Assistant Chat action and composer reference chip.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: add_to_assistant_chat_file_reference_lock
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0043"
preserved_exact_tokens:
- "cmd.chat.add_file_reference"
- "lock, not a recommendation"
- "Add to Assistant Chat"
- "visible file reference chip"
- "active composer/thread context"
- "file-only in MVP"
- "folder insertion is out of scope"
negative_constraints:
- "Add to Assistant Chat must not inline full file contents as a hidden side effect."
- "Folder insertion is out of scope for MVP."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-049 - Search Entrypoint Delegation

```yaml
plan_unit_id: F-049
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Search entrypoints from command palette, keyboard shortcuts, Search panel chrome, and context
  menus normalize to the Search-owned cmd.search.* family; FileManager may reveal or open selected
  file results but must not duplicate Search semantics under file-manager-local or legacy
  /chat/lsp-local names.
gui_related: true
gui_classification_reason: >-
  This unit governs command palette, keyboard shortcut, Search panel, and context-menu entrypoints
  visible to users.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: search_entrypoint_delegation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0043"
preserved_exact_tokens:
- "cmd.search.*"
- "Search panel chrome"
- "command palette"
- "keyboard shortcuts"
- "context menus"
- "file-manager-local"
- "/chat/lsp-local"
negative_constraints:
- "FileManager must not duplicate search semantics under file-manager-local or legacy /chat/lsp-local names."
compatibility_only_notes:
- "Legacy /chat/lsp-local search semantics normalize to Search-owned cmd.search.* behavior."
stale_retired_dispositions: []
owner_boundary_notes:
- "Search owns search semantics; FileManager may reveal or open selected file results."
owner_hints:
- "Plans/FileManager.md"
```

### F-050 - Canonical File Tree Action Catalog

```yaml
plan_unit_id: F-050
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File-tree context menus expose create, rename, delete, copy path, Add to Assistant Chat, Open in
  Terminal, Open With, Save Local Copy, compare, and reveal actions through canonical cmd.file.*,
  cmd.chat.*, and related command IDs rather than ad hoc UI callbacks.
gui_related: true
gui_classification_reason: >-
  This unit governs visible file-tree context menu actions and command IDs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: canonical_file_tree_action_catalog
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0044"
preserved_exact_tokens:
- "create"
- "rename"
- "delete"
- "copy path"
- "Add to Assistant Chat"
- "Open in Terminal"
- "Open With"
- "Save Local Copy"
- "compare"
- "reveal"
- "cmd.file.*"
- "cmd.chat.*"
negative_constraints:
- "File-tree actions must use canonical command IDs rather than ad hoc UI callbacks."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-051 - Tree Node Clipboard And Menu Semantics

```yaml
plan_unit_id: F-051
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Tree-level and tree-node menus include clipboard, path, chat, Open With, Download / Save Local
  Copy, and reveal actions; tree Copy/Cut/Paste uses a dedicated file-operation clipboard model
  where Copy duplicates on paste, Cut marks a pending move, paste targets are folder or project
  root, and validation/conflict handling reuse drag/drop rules.
gui_related: true
gui_classification_reason: >-
  This unit governs visible tree-node menu and clipboard behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: tree_node_clipboard_and_menu_semantics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0044"
preserved_exact_tokens:
- "Copy / Cut / Paste"
- "Copy relative path"
- "/open-containing-folder"
- "Download / Save Local Copy"
- "Save As"
- "tree copy/cut/paste"
- "/export"
- "dedicated file-operation clipboard model"
- "Copy duplicates on paste"
- "Cut marks a pending move"
- "system-default"
negative_constraints: []
compatibility_only_notes:
- "system-default remains a separate future handoff rather than part of the MVP PM-native target set."
stale_retired_dispositions: []
owner_boundary_notes:
- "Save As remains editor-oriented; tree copy/cut/paste and export flows use copy-vs-move and transfer semantics."
owner_hints:
- "Plans/FileManager.md"
```

### F-052 - Transfer Engine Progress And Hardening

```yaml
plan_unit_id: F-052
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Clipboard, drag/drop, upload, download, and archive flows reuse File Manager transfer contracts
  and keep path hardening, read-only state, and transfer progress explicit.
gui_related: true
gui_classification_reason: >-
  This unit has visible transfer progress and read-only-state implications.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: transfer_engine_progress_and_hardening
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0045"
preserved_exact_tokens:
- "Clipboard"
- "drag/drop"
- "upload"
- "download"
- "archive"
- "File Manager transfer contracts"
- "path hardening"
- "read-only state"
- "transfer progress explicit"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-053 - Local Tree Filter And Current File Reveal

```yaml
plan_unit_id: F-053
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The local tree filter is a File Manager filter/type-ahead rather than semantic search, and
  current-file reveal uses the open-file contract and may reveal an existing tree node instead of
  opening a duplicate buffer.
gui_related: true
gui_classification_reason: >-
  This unit governs visible File Manager filter/type-ahead and current-file reveal behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: local_tree_filter_and_current_file_reveal
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0046"
preserved_exact_tokens:
- "local tree filter"
- "filter/type-ahead"
- "not semantic search"
- "Current-file reveal"
- "open-file contract"
- "existing tree node"
- "duplicate buffer"
negative_constraints:
- "The local tree filter must not become semantic search."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-054 - PM-Native Open With Target Enum

```yaml
plan_unit_id: F-054
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  cmd.file.open_with is the PM-native Open With command for MVP editor and preview targets; Open
  With… resolves to exactly source_editor, image_viewer, workspace_preview, detached_preview, or
  diff_review rather than a hidden preview host or system-default fallback.
gui_related: true
gui_classification_reason: >-
  This unit governs the visible Open With chooser label and PM-native target set.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: pm_native_open_with_target_enum
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0047"
preserved_exact_tokens:
- "cmd.file.open_with"
- "source_editor"
- "image_viewer"
- "workspace_preview"
- "detached_preview"
- "diff_review"
- "Open With…"
- "system_default"
- "cmd.file.open_in_system_default"
negative_constraints:
- "system_default is not part of the canonical MVP target enum for cmd.file.open_with."
- "Open With… must not resolve to a hidden preview host or system-default fallback."
compatibility_only_notes:
- "Future OS handoff must use a separate explicit command such as cmd.file.open_in_system_default."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-055 - Save Local Copy Copy-Out Flow

```yaml
plan_unit_id: F-055
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  cmd.file.save_local_copy is the explicit Download / Save Local Copy copy-out flow for workspace
  nodes: it exports a readable source to a user-chosen local destination without changing
  project-relative path identity, is the remote-to-local escape hatch for remote projects, and
  remains distinct from tree Copy/Paste, editor Save As, or moving into the workspace.
gui_related: true
gui_classification_reason: >-
  This unit governs visible Download / Save Local Copy export behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: save_local_copy_copy_out_flow
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0047"
preserved_exact_tokens:
- "cmd.file.save_local_copy"
- "Download / Save Local Copy"
- "/copy-out"
- "user-chosen local destination"
- "project-relative path identity"
- "remote-to-local escape hatch"
- "tree Copy/Paste"
- "editor Save As"
- "move into the workspace"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Save Local Copy does not change the node project-relative path identity."
owner_hints:
- "Plans/FileManager.md"
```

### F-056 - Source Control Handoff Command Boundary

```yaml
plan_unit_id: F-056
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Source Control handoff from FileManager keeps file identity, worktree identity, and compare
  targets explicit; handoff prose cannot leave unresolved clarification conditions and must either
  route through a canonical command or record the behavior as out of scope for the current
  surface.
gui_related: false
gui_classification_reason: >-
  This unit defines command/routing boundary and owner handoff rules.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: source_control_handoff_command_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0048"
preserved_exact_tokens:
- "file identity"
- "worktree identity"
- "compare targets"
- "if needed"
- "only if clarification text is needed"
- "canonical command"
- "out of scope"
negative_constraints:
- "Handoff prose must not leave unresolved if needed or only if clarification text is needed conditions."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Source Control handoff either routes through a canonical command or is out of scope for the FileManager surface."
owner_hints:
- "Plans/FileManager.md"
```

### F-057 - File Tree Source Control Entry Points

```yaml
plan_unit_id: F-057
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The file tree may expose Source Control status, Open in Source Control, Open diff, and Open
  compare entrypoints, but repository state ownership remains with Source Control and worktree
  contracts, with file identity, active repo_id, worktree_id, and compare target handed off
  explicitly.
gui_related: true
gui_classification_reason: >-
  This unit governs visible file-tree Source Control status, compare, and diff entrypoints.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: file_tree_source_control_entry_points
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0049"
preserved_exact_tokens:
- "Source Control status"
- "Open in Source Control"
- "Open diff"
- "Open compare"
- "repo_id"
- "worktree_id"
- "compare target"
- "branch/history/worktree ownership"
negative_constraints:
- "File/file-manager surfaces must not absorb branch/history/worktree ownership or invent a file-surface history model."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Repository state remains with Source Control and worktree contracts."
owner_hints:
- "Plans/FileManager.md"
```

### F-058 - Diff Review Surface Ownership Split

```yaml
plan_unit_id: F-058
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Diff and review ownership is split across chat inline operation cards, File Editor and compare
  source-level viewing, FileManager preview/open entrypoints, FileSafe mutation safety and
  restore-before-rerun enforcement, Source Control git-native ownership, docked editor review,
  optional detached review windows, Source Control side panel pivots, compact chat preview/audit,
  and editor gutter or scrollbar state feedback.
gui_related: true
gui_classification_reason: >-
  This unit governs visible diff/review, chat, Source Control panel, editor gutter, and detached
  review surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: diff_review_surface_ownership_split
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0049"
preserved_exact_tokens:
- "files changed"
- "code diffs"
- "/diff"
- "/focus"
- "/subjects"
- "preview-generated edits"
- "Open diff"
- "Open compare"
- "/file-manager"
- "/file-manager/source-control"
- "/history/worktree"
- "restore-before-rerun"
- "history/graph/worktree"
- "heat-map summaries"
- "change-marker state-feedback"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Chat owns inline operation cards; File Editor and compare own source-level viewing; FileSafe owns mutation safety; Source Control remains the git-native owner."
owner_hints:
- "Plans/FileManager.md"
split_recommendation_reason: >-
  The span intentionally mixes FileManager entrypoints, FileSafe mutation safety, Source Control
  ownership, chat previews, and detailed review surfaces; later implementation may split by owner
  surface.
```

### F-059 - Compare Target Defaults And Choice Surfacing

```yaml
plan_unit_id: F-059
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Compare targets default from active worktree and source-control state, and ambiguous compare
  targets must surface choices instead of silently selecting a stale branch, remote, or generated
  artifact.
gui_related: true
gui_classification_reason: >-
  This unit requires ambiguous compare choices to surface to the user.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: compare_target_defaults_and_choice_surfacing
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0050"
preserved_exact_tokens:
- "Compare targets"
- "active worktree"
- "source-control state"
- "stale branch"
- "remote"
- "generated artifact"
negative_constraints:
- "Ambiguous compare targets must surface choices instead of silently selecting a stale branch, remote, or generated artifact."
compatibility_only_notes: []
stale_retired_dispositions:
- "Silent stale branch, remote, or generated-artifact selection is disallowed."
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-060 - Hunk Conflict And Diff Search Launch Boundary

```yaml
plan_unit_id: F-060
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Hunk actions and conflict review use diff/review owner contracts; FileManager may launch or
  reveal stage, unstage, discard, apply, expand/collapse, search-within-diff, and
  conflict-resolution review flows but does not bypass review policy.
gui_related: true
gui_classification_reason: >-
  This unit governs visible hunk action, conflict review, and diff-local search entrypoints.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: hunk_conflict_and_diff_search_launch_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0051"
preserved_exact_tokens:
- "hunk actions"
- "conflict review"
- "Stage"
- "unstage"
- "discard"
- "apply"
- "expand/collapse"
- "search-within-diff"
- "conflict-resolution review UX"
negative_constraints:
- "FileManager may launch or reveal review flows but must not bypass review policy."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Diff/review owner contracts own hunk actions and conflict review behavior."
owner_hints:
- "Plans/FileManager.md"
```

### F-061 - Hunk Catalog Reconciliation Owners

```yaml
plan_unit_id: F-061
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager diff/review entrypoints preserve later reconciliation ownership across
  GitHub_Integration.md, UI_Command_Catalog.md cmd.git coverage, assistant-chat-design.md
  cmd.chat.revert defaults and chat-thread diff exposure, and the hunk catalog; if merge strategy
  is unavailable, the surface shows conflict UI or rejects instead of silently applying.
gui_related: true
gui_classification_reason: >-
  This unit governs visible hunk/review command UX and cross-owner command routing.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: hunk_catalog_reconciliation_owners
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0051"
preserved_exact_tokens:
- "GitHub_Integration.md"
- "UI_Command_Catalog.md"
- "cmd.git"
- "cmd.git.*"
- "assistant-chat-design.md"
- "cmd.chat.revert"
- "/apply/review/conflict"
- "/reject/stage/unstage/revert/collapse"
- "/unstage"
- "/comments"
- "/reanchor"
- "large-directory-safe review loading"
- "/file-manager"
- "/unstaged/conflicted"
negative_constraints:
- "If merge strategy is unavailable, the surface must show conflict UI or reject rather than silently applying."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "GitHub_Integration.md owns compare-target defaults, hunk actions, conflict review, and diff-local search; UI_Command_Catalog.md owns cmd.git coverage; assistant-chat-design.md owns cmd.chat.revert defaults and chat-thread diff exposure."
owner_hints:
- "Plans/FileManager.md"
split_recommendation_reason: >-
  This span carries multiple owner-doc reconciliation boundaries for hunk actions, command
  catalog, chat revert, and conflict UI.
```

### F-062 - Change Marker Projection And Exact Revert Identity

```yaml
plan_unit_id: F-062
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Change markers in the editor are visual projections over source-control and FileSafe state, and
  revert actions identify the exact file, hunk, or persisted mutation being reverted.
gui_related: true
gui_classification_reason: >-
  Change markers and revert actions are visible editor/review behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: change_marker_projection_and_exact_revert_identity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0052"
preserved_exact_tokens:
- "Change markers"
- "visual projections"
- "source-control"
- "FileSafe state"
- "exact file"
- "hunk"
- "persisted mutation"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-063 - Git Mutations Versus Restore History Boundary

```yaml
plan_unit_id: F-063
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Git source-control discard, compare, and stage actions are not ordinary editor undo; restore
  points, rollback, and revert-last-agent-edit remain explicit restore-history actions,
  diff-specific projections are required over compare state, and
  conflicted/staged/unstaged/reverted feedback stays visually distinct without creating a new
  persistent heat-map class.
gui_related: true
gui_classification_reason: >-
  This unit governs visible undo/revert controls, git-panel affordances, heat maps, and change
  markers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: git_mutations_versus_restore_history_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0052"
preserved_exact_tokens:
- "Git/source-control discard/compare/stage"
- "ordinary editor undo"
- "Restore points"
- "rollback"
- "revert-last-agent-edit"
- "diff-specific heat-map/change-marker"
- "diff-edit"
- "per-hunk controls"
- "open-in-diff"
- "scrollbar change-marker"
- "Conflicted markers"
- "staged and unstaged"
- "toast/banner"
- "persistent heat-map class"
negative_constraints:
- "Git/source-control discard/compare/stage actions are not ordinary editor undo."
- "Restore points, rollback, and revert-last-agent-edit must not be hidden behind git-panel affordances."
- "Conflicted markers override staged/unstaged styling until resolved."
- "Revert/restore outcomes MUST NOT create a new persistent heat-map class."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-064 - Diff-Affecting Taxonomy And Restore Event Refresh

```yaml
plan_unit_id: F-064
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The diff-affecting taxonomy distinguishes source-buffer edits, git mutations, and
  restore/rollback actions, and those actions resolve to confirmed restore events that refresh
  affected buffers rather than popping a local editor stack.
gui_related: true
gui_classification_reason: >-
  This unit governs source-buffer refresh and review-state feedback after diff-affecting actions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: diff_affecting_taxonomy_and_restore_event_refresh
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0052"
preserved_exact_tokens:
- "source-buffer edits"
- "typing"
- "preview-originated bounded patch apply"
- "assistant patch apply"
- "conflict-result text edits"
- "stage"
- "unstage"
- "discard"
- "stash push/pop"
- "mark conflict resolved"
- "Restore to…"
- "checkpoint restore"
- "rewind"
- "rollback"
- "confirmed restore events"
- "refresh affected buffers"
negative_constraints:
- "Diff-affecting restore events refresh affected buffers rather than popping a local editor stack."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-065 - Diff Undo Scope And Chat Diff Affordances

```yaml
plan_unit_id: F-065
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Diff undo/redo scope remains action-class based and never collapses into one global editor undo
  stack; chat routing exposes files-touched strip, diff card, open-in-editor, and open-in-diff as
  distinct affordances, revert scope is declared as last edit, last turn, per-file, or per-thread,
  and GUI ownership remains split across docked editor diff, detached review, Source Control
  side-panel state, scrollbar heat-map, gutter markers, and dirty/staged/conflicted/reverted
  feedback loops.
gui_related: true
gui_classification_reason: >-
  This unit governs visible chat, diff, editor affordances and undo scope declarations.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: diff_undo_scope_and_chat_diff_affordances
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0052"
preserved_exact_tokens:
- "single-file assistant edits"
- "multi-file assistant edits"
- "hunk-level Git actions"
- "patch-apply / preview-apply actions"
- "conflict-resolution actions"
- "one global editor undo stack"
- "files-touched strip"
- "diff card"
- "open-in-editor"
- "open-in-diff"
- "last edit"
- "last turn"
- "per-file"
- "per-thread"
- "docked editor diff"
- "detached review window"
- "Source Control side-panel pivot"
- "scrollbar heat-map"
- "dirty / staged / conflicted / reverted feedback loops"
negative_constraints:
- "Diff undo/redo actions never collapse into one global editor undo stack."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "GUI ownership remains split across docked editor diff, detached review window, Source Control side-panel pivot/selection state, scrollbar heat-map/gutter change markers, and dirty/staged/conflicted/reverted feedback loops."
owner_hints:
- "Plans/FileManager.md"
split_recommendation_reason: >-
  The span mixes action-class undo grouping, chat routing affordances, revert scope labels, and
  GUI surface ownership.
```

### F-066 - Runtime Artifact Open By Identity Addendum

```yaml
plan_unit_id: F-066
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The Runtime Artifact Open-by-Identity Consolidation Addendum makes runtime artifacts
  attempt-native by default with artifact identity, routing refs, content refs, and provider/usage
  linkage, and resolves artifact open flows by artifact_id before linked envelope refs.
gui_related: false
gui_classification_reason: >-
  This addendum defines runtime artifact identity resolution rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: runtime_artifact_open_by_identity_addendum
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0053"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0054"
preserved_exact_tokens:
- "Runtime Artifact Open-by-Identity Consolidation Addendum (2026-03-09)"
- "attempt-native"
- "artifact identity"
- "routing refs"
- "content refs"
- "provider/usage linkage"
- "artifact_id"
- "linked envelope refs"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileManager.md"
```

### F-001 - File Manager Retired Source-Preserving Bridge

```yaml
plan_unit_id: F-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The former FileManager source-preserving bridge is retired after Phase 2B atomized
  FileManager-S0001 through FileManager-S0054 into F-002 through F-066 and structurally
  dispositioned the owner map, PlanUnits heading, retired bridge lineage, and Migration Coverage.
  F-001 remains only as migration lineage for the retired bridge span and must not re-own atomized
  source coverage.
gui_related: false
gui_classification_reason: >-
  The retired bridge is migration lineage and no longer owns GUI or product behavior; coverage_map
  preserves gui_related_inferred=true from the historical broad bridge span.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "F-001 no longer uses the source-preserving PlanUnit compile hint."
- "F-002 through F-066 own product coverage for FileManager-S0001 through FileManager-S0054."
- "FileManager-S0055, S0056, and S0058 are structural owner-map, heading, and migration-coverage dispositions."
- "The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- "Plans/FileManager.md"
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileManager-S0057"
preserved_exact_tokens:
- "F-001"
- "source_preserving_planunit"
- "source_preserving_bridge_retired"
- "F-002"
- "F-066"
- "FileManager-S0001"
- "FileManager-S0058"
- "Owner / Consumer Map"
- "PlanUnits"
- "Migration Coverage"
negative_constraints:
- "Do not remap atomized FileManager spans back to F-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to F-001 remain auditable."
stale_retired_dispositions: []
owner_boundary_notes:
- "F-002 through F-066 own product coverage for FileManager-S0001 through FileManager-S0054."
owner_hints:
- "Plans/FileManager.md"
```
