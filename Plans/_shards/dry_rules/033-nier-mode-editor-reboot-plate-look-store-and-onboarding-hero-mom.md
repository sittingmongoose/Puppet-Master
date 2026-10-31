# Shard 033: NieR Mode editor, reboot plate, look store and onboarding hero moments single owners — 2026-10-09

Source: `Plans/DRY_Rules.md`

Source lines: L3142-L3219

Source SHA256: `3e54996b18a8b9e3c3eabfbce6f8859c0427e58b48789ece794b71cdf8ebb852`

---

## NieR Mode editor, reboot plate, look store and onboarding hero moments single owners — 2026-10-09

DL-152 reaches NieR Mode from four places and DL-153 gives onboarding's hero moments five styles and the first paint the stored look. Each of these must exist once, so the four places and the five styles never grow copies of their own.

### DR-056 - One NieR Adjust Editor, One Reboot Plate, One Look Store And One Set Of Hero Moments

```yaml
plan_unit_id: DR-056
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Q22, Jared 2026-10-30 (DL-257): NieR is the fifth selectable theme family (nier), ordered after Basic,
  Friendly, Glass and Retro. NieR Light (nier-light) and NieR Dark (nier-dark) complete ten built-in variants. A
  NieR family pick uses general.visual.theme and the existing mode through cmd.settings.transaction.preview then
  cmd.settings.transaction.apply; no independent NieR switch or command remains. Exactly one NieR row editor
  serves Settings, the title bar, the Guided Tour and onboarding. Preset, part and background lists have one
  owner. Live edits use the existing Project Settings preview/apply pair; onboarding uses its existing
  non-persistent ui.onboarding.choose_look preview and exact commit boundary. The retained local actions
  ui.settings.nier_editor.open, ui.settings.nier_editor.close and ui.settings.nier_editor.replay add no command
  or store. Entering NieR uses its one Reboot moment only when the Reboot moment part is installed; otherwise it
  uses the standard look cover. Leaving NieR and switching Light/Dark within NieR use the standard look cover.
  Reduced Motion keeps the existing calm/instant settle policy. Explicit Play reboot moment remains a local
  rehearsal that changes no setting. One Project look store and one first-paint reader serve all five theme
  families. No app-global or cross-Project copy, independent NieR boolean writer, local-storage hint, second
  Reboot plate or per-surface family selector exists. Hero moments share one trigger, end state, snap and sound
  path through DR-043; five family styles differ in presentation only. Pip keeps the SSYS-056 row editor, shared
  parts/preset registry and Settings owner. Onboarding reads factory/Project Pip parts and has no Pip editor.
  Legacy NieR Mode and Customize NieR Mode labels are source lineage, superseded by Q22.
gui_related: true
gui_classification_reason: "Fixes single owners for the NieR Mode editor, the reboot plate, the look store and onboarding's hero moments."
split_recommended: false
depends_on: [SSYS-043, SSYS-010, F3-468, F3-598, F3-600, DL-152, DL-153, DR-043]
unblocks: []
acceptance_criteria:
  - "One editor, part/preset/background registry, look store and first-paint reader serve all five families."
  - "Live writes use the existing Settings pair and onboarding uses its existing preview/commit boundary."
  - "Entering NieR uses its one Reboot moment only when the Reboot moment part is installed; otherwise it uses the standard look cover. Leaving NieR and switching Light/Dark within NieR use the standard look cover. Reduced Motion keeps the existing calm/instant settle policy. Explicit Play reboot moment remains a local rehearsal that changes no setting."
  - "No independent NieR boolean, separate family command, per-surface selector list or second sound player exists."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-touch-closure-verify.py
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: nier_onboarding_tour
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-152"
  - "Plans/Decision_Log.md#DL-153"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/nier-next-20261009/JARED-REQUEST-20261009.md, SHA-256 5d4f5b2aa55364c55fb022e4624657b5185e5ea5b316b6108b880dde51a98e48"
preserved_exact_tokens:
  - "NieR Mode"
  - "Customize NieR Mode"
  - "ui.settings.nier_editor.open"
  - "ui.settings.nier_editor.close"
  - "ui.settings.nier_editor.replay"
  - "ui.onboarding.choose_look"
negative_constraints:
  - "Do not build a second NieR Mode editor, preset list, part list or background list for any surface."
  - "Do not draw a reboot plate or transition of a surface's own."
  - "Do not keep a theme copy or paint hint outside the current Project's Settings."
  - "Do not give one family's hero moments a trigger, end state, snap or sound path of their own."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-043, ContractName:Plans/Settings_System.md#SSYS-010, ContractName:Plans/FinalGUISpec.md#F3-468, ContractName:Plans/FinalGUISpec.md#F3-598, ContractName:Plans/FinalGUISpec.md#F3-600, ContractName:Plans/Decision_Log.md#DL-152, ContractName:Plans/Decision_Log.md#DL-153, ContractName:Plans/DRY_Rules.md#DR-043
