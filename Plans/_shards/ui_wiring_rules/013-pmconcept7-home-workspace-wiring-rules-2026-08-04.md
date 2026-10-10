# Shard 013: PMConcept7 Home Workspace wiring rules — 2026-08-04

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L625-L708

Source SHA256: `4c1dd01297a065808ec216a3774a89bb2bd9824fdcb1e56f8f5fb9a0247f1e5a`

---

## PMConcept7 Home Workspace wiring rules — 2026-08-04

Superseded 2026-10-09 (DL-180): Home is one universal panel system with a fixed chat column. The fixed-zone controls this passage names (Panel 1 through Panel 4, Open Panel and Open Browser in Panel, File Manager's Open in Panel, the host drop targets, Collapse Bottom Terminal and the terminal add and split leaves) are retired; the Home census is UIW-040's closed list, the tab rules are UIW-041 and the wiring rows are `Plans/Wiring_Matrix.md#WM-090`. The rule that every visible control has exactly one production row or a `view_only` disposition, and that preview is local and one semantic end commits once, stands.

Home Workspace is a reconciliation input for UI wiring. Every visible menu item,
grab handle, Browser action, File Manager Open-in-Panel action, drop target, and
semantic resize endpoint has exactly one production wiring row. Preview movement
and resize are local projection updates; only semantic drop/resize end dispatches
the typed command and persists the committed layout once.

Popup/flyout disclosure controls are explicitly view-local and are recorded in the
control census with a `view_only` disposition rather than fabricated command rows.
The compact Home popup's rows are F3-502's (amended 2026-10-09, DL-180: the named and
saved layouts, the chat's rows, Save this layout..., Restore home layout and Run setup
wizard; the earlier four rows Open Panel, Open Browser in Panel, Collapse Bottom
Terminal and Reset Layout, with their Panel 1 through Panel 4 leaves, are retired); each
of its leaves, each tab, "+", panel and tab menu leaf, drop endpoint and committed
divider endpoint resolves to one typed production row and one executable test. Disabled rows project the owner-provided reason and
dispatch zero commands.

Rows must prove the command ID, typed payload, expected layout/terminal revision,
correlation and idempotency values, projected availability, disabled reason,
effect/event or no-persist disposition, explicit invocation path, focus return,
keyboard access, and no unexpected event. The production matrix is the concrete
coverage artifact; this document does not re-own layout or event field schemas.
Home rows cite `Plans/FinalGUISpec.md`, `Plans/FileManager.md`,
`Plans/Section15_MVP_Promoted_Features_Spec.md`, and
`Plans/home_workspace_layout.schema.json` as appropriate.

### UIW-010 - Home Control Census And Semantic Commit Wiring

```yaml
plan_unit_id: UIW-010
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Every Home control, submenu leaf, grab handle, drop target, resizer, and disabled state
  is source-hashed and resolves to a selector, state selector, canonical command or
  view-only disposition, event/receipt, handler, production row, and executable test with
  zero omissions. Amended 2026-08-13 - the census additionally covers the top-bar Reset
  Layout row, the Chat and Dashboard Pop Out rows, and the floating bottom-right corner
  resize endpoint. Amended 2026-08-13 (tweak wave) - the grab-handle rows describe the
  top-right lines-only grip (the corner-triangle wording is retired), the drop-target
  rows carry the target-geometry change-gated hover-preview acceptance (the
  pickup-footprint wording is retired), and the census adds the row-dock track-handle
  resize endpoint (home.resizer.dock_track). Amended 2026-10-09 (DL-180): the census
  is UIW-040's closed list of the universal panel controls; the fixed-zone rows named
  above (the Dashboard Pop Out, the floating corner and dock track resizers, the
  grab-handle and host drop-target rows) and the terminal caps are retired, and the
  Chat's Pop Out row is the chat's Pop out into its own window only.
gui_related: true
gui_classification_reason: This unit owns concrete UI-to-command wiring completeness for the Home workspace.
split_recommended: false
depends_on: [UIW-009, F3-501, UCC-144, CV-323]
unblocks: []
acceptance_criteria:
- Disclosure-only menu/flyout actions are view_only; each selected leaf maps to exactly one command and exact result/event family.
- Pointermove and live resize preview have no command/event/persistence mapping; one changed pointer-up/drop has one semantic mapping.
- Disabled terminal cap and Collapse states carry exact accessible reasons and zero dispatch. (Amended 2026-10-09, DL-180 - the terminal caps and Collapse Bottom Terminal are retired; every disabled Home control of UIW-040 carries its owner's reason and zero dispatch.)
- The source-hashed control census reports unresolved_count=0 and every production row names an executable test, not declarative prose alone.
validation_surfaces:
- python3 scripts/pm-validate-wiring-matrix.py
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 scripts/pm-plan-index.py validate
risk_class: home_wiring_orphan
reasoning_tier: standard
context_scope: home_control_wiring
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json, Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json]
node_compile_hint:
  mode: home_control_wiring
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/04_COMMAND_EVENT_STORAGE_WIRING.md
preserved_exact_tokens: [view_only, unresolved_count, pointermove, disabled reason]
negative_constraints:
- Do not count a declarative wiring row as executable test proof.
- Do not fabricate commands for disclosure-only controls.
compatibility_only_notes: []
stale_retired_dispositions:
- The prior non-census Home reconciliation summary is superseded by the source-hashed control census.
- "Amended 2026-10-09 (DL-180): the census contents are UIW-040's closed list; the fixed-zone rows, the terminal caps and Collapse Bottom Terminal leave it. DL-180 is cited here and not in depends_on: DL-180 builds on DL-147, whose chain already reaches this unit, so the dependency would close a loop; UIW-040 depends on this unit instead. The validation surface home_workspace_matrix.mjs is superseded lineage from this date: its fixed-model cases do not prove the DL-180 rows, and the replacement executable cases are Plans/Automated_Testing_System.md#ATS-075."
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json]
```
