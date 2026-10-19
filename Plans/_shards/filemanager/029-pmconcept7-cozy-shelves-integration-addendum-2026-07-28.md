# Shard 029: PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

Source: `Plans/FileManager.md`

Source lines: L4894-L4954

Source SHA256: `2fd5798870ecce2350e8b50203c6afe14837512fb7be8731398f68deb09a5518`

---

## PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

This addendum records the File Manager behavior illustrated by the ratified Cozy Shelves concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html`, source-lineage-only per `Plans/usage-feature.md`) and `Concepts/PMConcept7.html`. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F-079 - Cozy Shelves File Manager PM7 Integration

```yaml
plan_unit_id: F-079
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The File Manager panel-files view follows the Cozy Shelves concept shown in
  Concepts/PMConcept7.html: explorer/changed/open segmented tabs, a measured-height tree
  animator with full keyboard tree model, hover quick actions per row kind,
  multi-select with a selection bar, type-ahead filter, hide-ignored toggle,
  collapse-all, worktree root menu, and the sprout context menu whose hook id
  remains fileContextMenu. The context menu's Delete affordance follows the F2-205
  trash-first decision (OS-trash soft delete with undo toast; permanent delete
  stays behind the fail-closed confirm; explicit disclosure when trash is
  impossible), and Open with / Copy path submenu entries keep their c2 command
  bindings. The earlier PM6 file-tree presentation is retired; its markup and
  filter wiring are historical only.
gui_related: true
gui_classification_reason: This unit records the user-visible File Manager panel behavior shown in PMConcept7.
split_recommended: false
depends_on: [F-078, F2-205]
unblocks: []
acceptance_criteria:
- "The integrated File Manager opens from the FILES activity-bar icon with the three segmented tabs and all tree folders collapsed by default except the reveal chain of the active file."
- "Right-click and Shift+F10 open the sprout context menu; submenu hover/click/keyboard paths work; Delete routes the trash-first flow per F2-205."
- "Tree keyboard model works: arrows walk visible rows, Right expands, Left collapses or focuses parent, Enter activates, letters type-ahead."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filemanager_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces: []
node_compile_hint:
  mode: cozy_shelves_fm_pm7_integration_record
  create_worknodes: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (winning files concept; source-lineage-only)"
- "Plans/FileSafe.md (F2-205 trash-first delete decision)"
preserved_exact_tokens:
- "fileContextMenu"
- "explorer"
- "changed"
- "open"
negative_constraints:
- "Do not reintroduce the retired PM6 file-tree markup or its filter wiring."
- "Do not surface a permanent-delete primary action; trash-first per F2-205 with permanent only behind the fail-closed confirm."
compatibility_only_notes:
- "Slint: the tree maps to a model-driven TreeView with measured expand animation per F3-473; the context menu maps to PopupWindow (F3-242 contract); no DOM-shaped hover quick actions — use Slint hover delegates."
stale_retired_dispositions: []
owner_boundary_notes:
- "Plans/FinalGUISpec.md owns the panel integration record (F3-497) and the unified expander contract; Plans/FileSafe.md owns the delete safety semantics; this unit owns only the File Manager surface realization."
owner_hints: [Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/FileSafe.md]
```
