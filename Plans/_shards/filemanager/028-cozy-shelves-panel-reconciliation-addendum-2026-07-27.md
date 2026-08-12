# Shard 028: Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

Source: `Plans/FileManager.md`

Source lines: L4547-L4800

Source SHA256: `75c16d913e9410c6988a1e4d67c8bd9a03bf60216e0640aea83d5c0db65109bd`

---

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum closes File Manager spec gaps exposed by the Cozy Shelves left-rail concept review and promotes the user-ratified rulings from that review (user decisions 2026-07-27) into canonical PlanUnits. `Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html` remain illustrative source-lineage only: no HTML, CSS, color values, demo data, or class names from those files may enter spec or implementation. No existing PlanUnit, preserved_exact_tokens list, canonical_text, or retired bridge is edited; stale-prose supersession is expressed only through the new successor units below. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F-074 - File Tree Git Status Decoration Owner Ruling

```yaml
plan_unit_id: F-074
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns the presentation of per-node git status decorations in the file tree (user
  decision 2026-07-27). A decorated node shows a trailing single-letter text badge: M (modified),
  A (added), D (deleted), ? (untracked), C (conflicted). Badge colors resolve through per-theme
  status-decoration text tokens rather than hard-coded values and must meet WCAG AA text contrast
  on light themes; the selection accent (--accent-primary indirection) is reserved for selection
  and is never used as a git-status color. A collapsed folder rolls up descendant status as a
  folder-name tint using the strongest descendant state plus an optional "N changed" count chip;
  the strongest-descendant precedence order is C > D > M > A > ?. Decorations are a consumer
  projection of Source Control state: repository state ownership, git semantics, staging, and
  refresh cadence remain with Source Control and worktree contracts per F-057, with file identity,
  repo_id, and worktree_id handed off explicitly.
gui_related: true
gui_classification_reason: This unit governs visible file-tree git badge, rollup tint, and count-chip presentation.
depends_on: [F-057]
unblocks: []
acceptance_criteria:
  - Per-node badges are limited to the text letters M, A, D, ?, and C; no emoji glyphs.
  - Badge and rollup colors come from per-theme tokens and meet AA text contrast on light themes.
  - Collapsed-folder rollup uses strongest-descendant precedence C > D > M > A > ? with an optional N-changed chip.
  - The selection accent is never used as a git-status decoration color.
  - FileManager renders projected Source Control state and never computes git state locally.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future file-tree git decoration precedence and contrast tests.
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_git_decorations
implementation_surfaces: [Plans/FileManager.md, future file tree renderer]
node_compile_hint: {mode: filemanager_git_decorations, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - user decision 2026-07-27 (Cozy Shelves panel review)
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (source-lineage-only)
  - Plans/FileManager.md:165
source_atom_ids: []
preserved_exact_tokens: ["optional Git status strip"]
negative_constraints:
  - Do not let FileManager own git semantics, staging, or repository refresh; F-057 handoff boundaries apply.
  - Do not hard-code badge colors or reuse the selection accent for status decoration.
compatibility_only_notes:
  - "Slint compatibility: badges and rollup tints render as opaque precomputed surfaces with precomputed color math; no arbitrary-content backdrop blur, no SVG filters; any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
owner_boundary_notes:
  - "Source Control and worktree contracts own git state; this unit owns only the tree-side presentation of the projected state."
owner_hints: [Plans/FileManager.md, Plans/WorktreeGitImprovement.md, Plans/GitHub_Integration.md]
```

### F-075 - Section 10.1 Breadcrumb Prose Stale Disposition

```yaml
plan_unit_id: F-075
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The section 10.1 prose sentence "FileManager owns the editor breadcrumb strip and outline"
  (Plans/FileManager.md:472) is stale source-lineage superseded by accepted F-042: the editor
  breadcrumb strip and outline rail chrome are retired per Jared's 2026-07-16 decision, and
  FileManager retains only the underlying symbol data pipeline (documentSymbol when LSP is
  available, heuristic or regex outline fallback, labeled degraded state) for search and
  navigation consumers. Readers and ports must treat the section 10.1 chrome-ownership wording
  as retired lineage; no Cozy Shelves rail or editor surface may reintroduce breadcrumb or
  outline chrome. This successor unit records the disposition without editing preserved prose.
gui_related: true
gui_classification_reason: This unit dispositions stale prose about visible editor breadcrumb and outline chrome.
depends_on: [F-042]
unblocks: []
acceptance_criteria:
  - Section 10.1 chrome-ownership prose is read as retired lineage; F-042 remains the live canon.
  - No new surface reintroduces breadcrumb or outline chrome; the symbol pipeline remains available to consumers.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_standardization
implementation_surfaces: [Plans/FileManager.md]
node_compile_hint: {mode: filemanager_stale_prose_disposition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/FileManager.md:472
  - Plans/FileManager.md F-042 (Jared's 2026-07-16 decision)
source_atom_ids: []
preserved_exact_tokens: []
negative_constraints:
  - Do not edit the preserved section 10.1 prose or F-042 canonical_text; supersession lives in this unit.
compatibility_only_notes: []
owner_boundary_notes: []
owner_hints: [Plans/FileManager.md]
```

### F-076 - Bulk Operation Selection Basket And Ops Tray Contract

```yaml
plan_unit_id: F-076
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager bulk operations use a selection-basket-plus-ops-tray UI contract (user decision
  2026-07-27). The selection basket persists across scrolling, expansion, and filter changes and
  is disclosed by an always-visible "N selected" chip; range-select extends only across currently
  visible rows, and filtered-out or collapsed rows are never silently added to the basket.
  Executing bulk operations render in an ops-tray footer row inside the panel with per-operation
  and aggregate progress, a cancel control, and a retry-failed action scoped to the failed subset.
  Post-operation refresh contract: on a terminal operation state the affected directory nodes are
  refreshed or invalidated so results appear without manual refresh; the basket clears on full
  success and retains only the failed subset while retry-failed is offered. Destructive bulk
  actions route through the shared confirm surface with exact target preview. Every bulk mutation
  joins the F-068 FileSafe mutation-session model and the F-069 operation lifecycle
  (operation_type bulk with per-file conflict, evidence, rollback/recovery, and refresh state).
gui_related: true
gui_classification_reason: Selection chips, ops-tray progress, cancel/retry controls, and refresh behavior are user-visible panel behavior.
depends_on: [F-068, F-069]
unblocks: []
acceptance_criteria:
  - The selection basket persists across scroll/filter changes and is disclosed by a visible N-selected chip.
  - Range-select is limited to visible rows; hidden rows never join the basket implicitly.
  - The ops tray shows per-op and aggregate progress with cancel and retry-failed controls.
  - Terminal operations refresh affected directories; the basket clears on success and retains the failed subset for retry.
  - Destructive bulk actions use the shared confirm surface with exact target preview and the F-068/F-069 lifecycle.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future bulk-operation basket persistence and ops-tray progress tests.
risk_class: file_operation_conflict_drift
reasoning_tier: high
context_scope: filemanager_bulk_operation_ui
implementation_surfaces: [Plans/FileManager.md, Plans/FileSafe.md, future File Manager panel]
node_compile_hint: {mode: filemanager_bulk_operation_ui, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - user decision 2026-07-27 (Cozy Shelves panel review)
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (source-lineage-only)
  - Plans/FileManager.md:174
source_atom_ids: []
preserved_exact_tokens: ["operation_type", "bulk"]
negative_constraints:
  - Do not let bulk operations bypass per-file conflict, evidence, rollback/recovery, and refresh state (F-069).
  - Do not run bulk mutations outside a FileSafe mutation session (F-068).
  - Do not add hidden rows to the basket through range-select.
compatibility_only_notes:
  - "Slint compatibility: basket chip and ops-tray progress render as opaque precomputed surfaces with transform-driven updates and precomputed color math; no arbitrary-content backdrop blur, no SVG filters; any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
owner_boundary_notes: []
owner_hints: [Plans/FileManager.md, Plans/FileSafe.md, Plans/FinalGUISpec.md]
```

### F-077 - Keyboard Tree Interaction Model Reaffirmation

```yaml
plan_unit_id: F-077
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  This unit reaffirms and concretizes the keyboard contract at Plans/FileManager.md:172. The file
  tree is fully keyboard operable: Up/Down move the active row; Right expands a collapsed folder
  or moves to its first child; Left collapses an expanded folder or moves to the parent; Enter
  opens the active file or toggles the active folder; printable-character type-ahead narrows to
  matching nodes with DiscoveryService ordering per F-072; F2 begins rename on the active row;
  Delete requests deletion of the current selection through the standard confirm and
  mutation-session path. The tree exposes assistive-technology semantics equivalent to
  role=tree/role=treeitem with per-node level (aria-level), expanded state (aria-expanded), and
  selection state, delivered through Slint accessibility properties.
gui_related: true
gui_classification_reason: Keyboard navigation and assistive-technology exposure are user-visible tree interaction behavior.
depends_on: [F-068, F-072]
unblocks: []
acceptance_criteria:
  - Arrow keys, Enter, type-ahead, F2, and Delete behave as specified with keyboard-only operation supported end to end.
  - Delete routes through the standard confirm and FileSafe mutation-session path, never a direct unlink.
  - Tree nodes expose role/level/expanded/selection semantics equivalent to role=tree with aria-level and aria-expanded.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future keyboard-only tree navigation and accessibility exposure tests.
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_keyboard_model
implementation_surfaces: [Plans/FileManager.md, future file tree renderer]
node_compile_hint: {mode: filemanager_keyboard_tree_model, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/FileManager.md:172
  - Plans/FileManager.md:174
source_atom_ids: []
preserved_exact_tokens: ["Keyboard-only use must be supported for accessibility."]
negative_constraints:
  - Do not fork a second keyboard model between docked and floating File Manager surfaces.
compatibility_only_notes:
  - "Slint compatibility: accessibility semantics are exposed through Slint accessible-role/accessible-* properties; role=tree/aria-* names are the contract vocabulary, not a DOM requirement."
owner_boundary_notes: []
owner_hints: [Plans/FileManager.md, Plans/FinalGUISpec.md]
```

### F-078 - Changed And Open Pane Expander Consumption

```yaml
plan_unit_id: F-078
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The File Manager panel's Changed-files and Open-editors panes consume the shared unified
  expander contract owned by the Cozy Shelves Panel Reconciliation Addendum - 2026-07-27 in
  Plans/FinalGUISpec.md; FileManager does not re-own that contract. Consumption binds: rows are
  collapsed by default; each row header is a single accessible button exposing expanded state;
  the expanded body renders slots in the order kv-facts, status-detail, blocked-reason-detail,
  actions, overflow; the body is capped near 200px with internal scroll; blocked reasons remain
  visible outside the collapsible body; destructive row actions route through the shared confirm
  surface; blocked payloads carry blocked_reason_code plus ordered allowed_action_ids[]. Changed
  rows are presentation consumers only: git semantics, staging, and discard ownership remain with
  Source Control per F-057, and row actions hand off file identity, repo_id, and worktree_id
  explicitly.
gui_related: true
gui_classification_reason: Expander rows, slot order, and blocked-reason presentation are user-visible panel behavior.
depends_on: [F-057]
unblocks: []
acceptance_criteria:
  - Changed and Open pane rows follow the shared expander contract without local variants of slot order, cap, or header semantics.
  - Blocked reasons stay visible when the row body is collapsed.
  - Destructive row actions use the shared confirm surface; blocked payloads use blocked_reason_code plus ordered allowed_action_ids[].
  - Git semantics remain owned by Source Control; rows hand off identity explicitly.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future Changed/Open pane expander conformance tests.
risk_class: file_manager_drift
reasoning_tier: standard
context_scope: file_manager_panel_expanders
implementation_surfaces: [Plans/FileManager.md, future File Manager panel]
node_compile_hint: {mode: filemanager_expander_consumption, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - user decision 2026-07-27 (Cozy Shelves panel review)
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (source-lineage-only)
source_atom_ids: []
preserved_exact_tokens: []
negative_constraints:
  - Do not re-own or locally fork the unified expander contract; FileManager is a consumer.
  - Do not render staging or discard controls whose semantics FileManager would own; hand off to Source Control.
compatibility_only_notes:
  - "Slint compatibility: expander bodies are opaque precomputed surfaces with internal scroll; no arbitrary-content backdrop blur, no SVG filters, precomputed color math; any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
owner_boundary_notes:
  - "The unified expander contract itself is owned by Plans/FinalGUISpec.md; this unit binds only FileManager's consumption of it."
owner_hints: [Plans/FileManager.md, Plans/FinalGUISpec.md]
```
