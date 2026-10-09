# Shard 033: NieR Mode editor, reboot plate, look store and onboarding hero moments single owners — 2026-10-09

Source: `Plans/DRY_Rules.md`

Source lines: L3009-L3085

Source SHA256: `9ce78fdaab144d9c473fc7671c9148b29d7fb19d4ed60abfe73235a6f135bf4d`

---

## NieR Mode editor, reboot plate, look store and onboarding hero moments single owners — 2026-10-09

DL-152 reaches NieR Mode from four places and DL-153 gives onboarding's hero moments five styles and the first paint the stored look. Each of these must exist once, so the four places and the five styles never grow copies of their own.

### DR-056 - One NieR Mode Editor, One Reboot Plate, One Look Store And One Set Of Hero Moments

```yaml
plan_unit_id: DR-056
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  NieR Mode has exactly one editor, SSYS-043's row editor titled NieR Mode, reached from the Settings row Customize
  NieR Mode, the title-bar theme selector, the Guided Tour bar's Look menu and the onboarding look choice and its Look
  menu, and drawn either as a popup dialog over the application or as a panel inside the onboarding window. It reads
  and writes only through a store: live, the current Project's Settings through cmd.settings.transaction.preview then
  cmd.settings.transaction.apply; inside the onboarding window, the onboarding preview through
  ui.onboarding.choose_look, written with the Project at commit (DL-153). Its open, close and replay are
  ui.settings.nier_editor.open, ui.settings.nier_editor.close and ui.settings.nier_editor.replay, and inside the
  onboarding window ui.onboarding.choose_look opens and closes the panel. No surface keeps a second editor or its own
  preset, part or background list. Every NieR Mode on or off, from Settings, the title bar, the Tour or the onboarding
  window, plays the one reboot plate and its slat transition (F3-598); no surface draws a plate of its own. The look
  has one store, the current Project's Settings (SSYS-010): the first paint only reads it (F3-468), and no app-global,
  cross-Project or local-storage theme copy or paint hint exists. Onboarding's hero moments (the wake, the act card
  and the curtain call) have one trigger, one end state, one snap to that end state and one sound path through the
  Notifications & Sounds owner's player (DR-043); their five styles, NieR's (F3-598) and the four families' (F3-600),
  differ in presentation only.
gui_related: true
gui_classification_reason: "Fixes single owners for the NieR Mode editor, the reboot plate, the look store and onboarding's hero moments."
split_recommended: false
depends_on: [SSYS-043, SSYS-010, F3-468, F3-598, F3-600, DL-152, DL-153, DR-043]
unblocks: []
acceptance_criteria:
  - "The Settings row, the title-bar theme selector, the Tour bar's Look menu and the onboarding look choice open the same NieR Mode editor; no second editor, preset list, part list or background list exists."
  - "The editor writes only through the live Settings transaction pair or, inside the onboarding window, through ui.onboarding.choose_look's preview, never through a store of its own."
  - "Every NieR Mode on or off plays the one reboot plate and slat transition, wherever it is turned."
  - "The theme and NieR rows are stored only in the current Project's Settings; the first paint reads them and keeps no app-global, cross-Project or local-storage copy or hint."
  - "The five styles of the wake, the act card and the curtain call share one trigger, end state, snap and sound path and differ in presentation only."
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
