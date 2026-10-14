# Shard 047: CS-102 — Customize and notification local actions (2026-10-14)

Source: `Plans/Commands_System.md`

Source lines: L7885-L7949

Source SHA256: `b51d9c8b5cdff090bdb8936df888e4971452b899d079c5ba7b0a3c1c39f3457b`

---

## CS-102 — Customize and notification local actions (2026-10-14)

```yaml
plan_unit_id: CS-102
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  UCC-204 mints cmd.editor.appearance.set under the existing reserved cmd.editor. prefix. Its
  expected_state_hash guards the editor tab's saved nonstructural state; a mismatch refuses as stale_projection,
  a replay with the same idempotency key returns the existing receipt, and conflicting reuse refuses.
  Validation/permission, bounded serialization, write and readback complete before applied is returned; failure
  retains or restores the earlier state. Plans/editor_appearance.schema.json closes fields and fixed failure
  reasons; no arbitrary code, path payload or unknown field is accepted. UI_Command_Catalog remains the only
  command minter. ui.appearance.open, close, set_scope, search, preview_scheme, cancel_preview, select_token and
  try_sample are typed local actions, parameterized by editor/terminal and target tab where available;
  Indentation opens the same editor screen at its indentation group. Scope selection is saved tab view state
  only when invoked from that tab; Settings' All entry is temporary. ui.notifications.open, close, expand_group,
  mark_visible_read and dismiss_toast operate the one shared inbox's presentation/read projection and never
  resolve its source. Mark_visible_read names only notices actually shown for the F3-453 dwell. No catalog row,
  dispatcher receipt or domain event belongs to these ui.* ids. Picker/menu openings, hover, keyboard gallery
  navigation before selection, change-meter display, drag previews, glow and timer suspension dispatch nothing
  and write nothing. Choosing a background file returns a validated owner asset reference then uses the selected
  scope's writer; importing a scheme uses the existing import command. Sample cursor/caret, bell, typing,
  problem and Step back trials affect only isolated sample state. Committed quick sets, reset, fields and token
  edits always use UCC-204's writers, never a view-local bypass. The production/exclusion census is
  WM-093/UIW-043 and Plans/pm7_control_bindings.json.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every named local action has no command row/event; committed appearance edits have a guarded receipt.
- Cancel/hover/trial never stores an appearance field, starts a terminal or changes buffer contents.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/Commands_System.md
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
- Plans/UI_Command_Catalog.md#UCC-204
- Plans/UI_Wiring_Rules.md#UIW-043
- Plans/Wiring_Matrix.md#WM-093
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Commands_System.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-204, ContractName:Plans/UI_Wiring_Rules.md#UIW-043, ContractName:Plans/Wiring_Matrix.md#WM-093
