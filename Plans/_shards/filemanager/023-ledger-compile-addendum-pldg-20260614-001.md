# Shard 023: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/FileManager.md`

Source lines: L4223-L4263

Source SHA256: `76e70962d9b840b741d3c27bddd9f87ba4270fe5e548326e883813dd08eb3604`

---

## Ledger Compile Addendum - pldg-20260614-001

### F-067 - Preview Browser Terminal And Hot Reload Recovery Compile Addendum

```yaml
plan_unit_id: F-067
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager owns file-surface placement for editor, terminal, browser tab, image viewing, HTML/browser preview, and hot-reload entrypoints.
  Missing Sections 5 through 8 and 13 through 14, plus the three-line Section 9 Tabs stub, must recover by consuming live browser,
  terminal, preview, persistence, and command-owner PlanUnits rather than inventing separate FileManager-only behavior.
gui_related: true
gui_classification_reason: This unit governs visible file manager tabs, previews, browser/terminal panes, image viewing, and hot-reload controls.
depends_on: [F-002, F-009, F-010]
unblocks: [F3-387]
acceptance_criteria:
  - Image viewing remains first-class where FileManager references Sections 8.1 and 14.
  - HTML/browser preview and hot reload controls resolve to FileManager placement plus Section15/UI Command behavior owners.
  - Section 9 Tabs covers Editor, Terminal, and Browser without re-owning terminal or browser runtime internals.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual FileManager cross-reference review
risk_class: file_surface_anchor_loss
reasoning_tier: standard
context_scope: file_manager_preview_tabs
implementation_surfaces: [Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: file_surface_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0016
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0048
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0049
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0050
  - source_ref:chat:next-gui-filemanager-cluster
preserved_exact_tokens: ["§5", "§8.1", "§8.2", "§9", "§13", "§14", "§14.6", "Tabs: Editor, Terminal, Browser", "built-in browser", "browser/terminal tabs", "hot-reload controls", "image viewing"]
negative_constraints:
  - Do not make FileManager the browser behavior SSOT.
  - Do not leave the Tabs section as a three-line stub when compiling this recovery.
owner_hints: [Plans/FileManager.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/UI_Command_Catalog.md, Plans/Runtime_Artifacts_Panel.md]
```
