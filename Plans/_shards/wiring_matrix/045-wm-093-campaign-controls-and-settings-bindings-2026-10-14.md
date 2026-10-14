# Shard 045: WM-093 — Campaign controls and Settings bindings (2026-10-14)

Source: `Plans/Wiring_Matrix.md`

Source lines: L6228-L6290

Source SHA256: `260f613060dbf7e41e6ded6344502caaa66a84d9780a8d5ed32082774ef0a35a`

---

## WM-093 — Campaign controls and Settings bindings (2026-10-14)

```yaml
plan_unit_id: WM-093
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Plans/pm7_control_bindings.json is this unit's enumerated companion table; UIW-043 owns its completeness rule.
  This editor fields/reset/quick sets bind to production editor.appearance.field and cmd.editor.appearance.set.
  This terminal binds to terminal.appearance.field; import to terminal.appearance.import_scheme. All scopes,
  every corresponding Settings row and general.visual.wallpaper bind to catalog.settings_transaction_preview
  then catalog.settings_transaction_apply, over the exact ids named in each census row. Menu/Settings entry,
  scope, search, sample trial, token-kind selection and noncommitted previews are CS-102 local actions with no
  production dispatch row. The notification inbox's dismiss/Delete binds catalog.alert_dismiss; Clear all
  composes it per captured eligible item, while toast close/swipe remains local and domain actions reuse
  catalog.alert_acknowledge, catalog.alert_snooze and their existing owner commands. DnD commits reuse UCC-200's
  panel_tab.move/workspace_layout split or move_surface according to target; cancel/hover commit nothing.
  Divider/chat/rail/history resize controls keep their existing layout command/view-state ownership, with
  keyboard alternatives; F3-657 adds presentation only. A rendered control disabled for no Project, stale state,
  locked target or owner permission dispatches nothing and announces the projected reason. All new evidence is
  planned production evidence, never inferred from a concept callback or screenshot.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Each census command route resolves a production entry with typed payload, owner state, accessibility and effect
  assertions.
- This/All, Clear all races, drop/cancel and no-Project paths have explicit planned fixtures.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-terminal-customizer/PROPOSAL-canon-followups.md, SHA-256 1e0739b70d9b0f8c55f8df4747d80ff099baae6d40caf6ae784dc13864d580b0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-panel-dnd-resize/NOTES.md, SHA-256 03a80f0dea3235ea637149bbec63626c4a4be8521078f9dd601f2b691f03d2d6
  (approved campaign source lineage; not native implementation evidence)
- Plans/UI_Wiring_Rules.md#UIW-043
- Plans/UI_Command_Catalog.md#UCC-204
- Plans/Commands_System.md#CS-102
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/UI_Wiring_Rules.md#UIW-043, ContractName:Plans/UI_Command_Catalog.md#UCC-204, ContractName:Plans/Commands_System.md#CS-102
