# Shard 023: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/FileManager.md`

Source lines: L4308-L4352

Source SHA256: `1f8b8735ac479cc2ef429cfb5eb5f2be86b8612ae35c291df95db6029ac3af6a`

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
  Amended 2026-10-09 (DL-180): FileManager keeps these entrypoints, but where an editor, terminal, browser or preview tab lands in the home panels is the one opening module's (Plans/FinalGUISpec.md#F3-634), not FileManager's. Open in Terminal on a folder reveals the last-focused terminal tab whose folder is that folder, else opens a new terminal tab there; on a file it uses the file's folder in the same way (F-090).
gui_related: true
gui_classification_reason: This unit governs visible file manager tabs, previews, browser/terminal panes, image viewing, and hot-reload controls.
depends_on: [F-002, F-009, F-010, DL-180]
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
stale_retired_dispositions:
  - "Amended 2026-10-10 (lead ruling L11): Open in Terminal reveals the last-focused terminal tab in the target folder, else opens one there."
  - 'Amended 2026-10-09 (DL-180): FileManager no longer owns where editor, terminal, browser and preview tabs are placed; F3-634 does.'
negative_constraints:
  - Do not make FileManager the browser behavior SSOT.
  - Do not leave the Tabs section as a three-line stub when compiling this recovery.
owner_hints: [Plans/FileManager.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/UI_Command_Catalog.md, Plans/Runtime_Artifacts_Panel.md]
```
