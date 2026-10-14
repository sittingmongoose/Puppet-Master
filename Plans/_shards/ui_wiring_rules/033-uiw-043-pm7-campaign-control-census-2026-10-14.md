# Shard 033: UIW-043 — PM7 campaign control census (2026-10-14)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L2409-L2472

Source SHA256: `a8a692dedef736238bd05887cc294bf394375ba53d70045b2fa404cdb93bdb9d`

---

## UIW-043 — PM7 campaign control census (2026-10-14)

```yaml
plan_unit_id: UIW-043
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Plans/pm7_control_bindings.json is the finite PM7 campaign producer census, extending UIW-040 through UIW-042.
  Each row names the visible control, owner unit, setting/field payload, exact command path or typed local
  action/non-dispatch disposition, and the corresponding production entry or reason it has none. Each admitted
  editor setting and every retained customizer field has its own row; aliases and view-local affordances never
  become invented cmd.* ids. Plans/Wiring_Matrix.production.json remains the runtime command wiring inventory; a
  producer binding can reuse its canonical command entry only when the census names that entry and exact
  argument mapping. Its schema is not relaxed for local controls: local exclusions are explicit in the census
  and the production exclusions notes. Required evidence includes the rendered pointer/keyboard path, projected
  availability and disabled reason, request/result, readback, receipt/event delta, focus and accessible names.
  Static source declarations certify neither native handlers nor the complete rendered census. Every PM7 control
  must be classified, including Settings entry/scope/reset, token color channels/hex/reset, preview/sample
  actions, wallpaper keys/default, notifications, DnD and each resize surface. Demo-only controls and preview
  harnesses are outside the product census.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- No new visible product control lacks a census row and exact owner/action route.
- The census validates against its schema and references only existing inventory ids, catalog commands and production
  rows.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/UI_Wiring_Rules.md
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
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-panel-dnd-resize/NOTES.md, SHA-256 03a80f0dea3235ea637149bbec63626c4a4be8521078f9dd601f2b691f03d2d6
  (approved campaign source lineage; not native implementation evidence)
- Plans/Wiring_Matrix.md#WM-093
- Plans/UI_Command_Catalog.md#UCC-204
- Plans/Commands_System.md#CS-102
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/UI_Wiring_Rules.md
```

ContractRef: ContractName:Plans/Wiring_Matrix.md#WM-093, ContractName:Plans/UI_Command_Catalog.md#UCC-204, ContractName:Plans/Commands_System.md#CS-102
