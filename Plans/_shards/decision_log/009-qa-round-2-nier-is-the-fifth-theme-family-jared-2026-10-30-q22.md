# Shard 009: QA round 2 — NieR is the fifth theme family (Jared, 2026-10-30, Q22)

Source: `Plans/Decision_Log.md`

Source lines: L18563-L18677

Source SHA256: `5e7cf8e9afc50ceeca6a4c4f1888d43a42ef8129ba5d71c476626a4dea99c425`

---

## QA round 2 — NieR is the fifth theme family (Jared, 2026-10-30, Q22)

### DL-257 - NieR Theme Family Replaces The Independent Override

```yaml
plan_unit_id: DL-257
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Q22, Jared 2026-10-30 (DL-257): NieR is the fifth selectable theme family (nier), ordered after Basic,
  Friendly, Glass and Retro. NieR Light (nier-light) and NieR Dark (nier-dark) complete ten built-in variants. A
  NieR family pick uses general.visual.theme and the existing mode through cmd.settings.transaction.preview then
  cmd.settings.transaction.apply; no independent NieR switch or command remains. Adjust NieR opens the one
  existing editor. general.visual.nier-parts (29 parts) and general.visual.nier-background remain its Adjust
  rows, shown when general.visual.theme is NieR Light or NieR Dark, with hidden values retained. Basic High
  contrast and Basic color scheme remain Basic-only; Glass and Retro controls remain confined to their own
  families. general.visual.nier-mode is a retired migration-only key, removed from the active inventory. On
  load, stored true selects the NieR theme in the stored presentation mode (Light, Dark or Auto, resolving Auto
  through the OS), preserving parts and background; false or absent preserves the existing family/mode. The old
  boolean is then cleared, and repeating migration has no further effect. No second underlying family is saved
  to restore later. Rendering reuses Basic CSS via data-theme='basic-<scheme>' plus html[data-o55-nier='on'];
  that marker is derived only from family nier, never an independent override. PMLogo.look() returns
  nier-<scheme>. NieR uses its existing precomputed palette and local fonts; its accent/font ownership while
  selected is unchanged, and stored general appearance overrides resume where applicable after another family is
  selected. The title-bar selector, Guided Tour Look menu, onboarding welcome and its Look menu all offer the
  same five families in order basic, friendly, glass, retro, nier. Live family picks use the Settings
  transaction pair; inside onboarding, choose_look on ui.onboarding.choose_look previews family/mode or retained
  NieR Adjust values in the closed look_choice and persists only at the existing exact Project commit/finish
  boundary. preview_nier and the independent nier_mode field are retired. Hover is silent and changes no theme;
  click or keyboard activation selects (O6). ui.settings.nier_editor.open, ui.settings.nier_editor.close and
  ui.settings.nier_editor.replay remain presentation-only; nier.editor.open is the Adjust binding. No
  manager_id, route, detail id, command, new part or event is added. shell.nier.mode, tour.nier.mode and
  onboarding.nier.mode are retired non_dispatch census tombstones with no action, setting or production writer.
  Entering NieR uses its one Reboot moment only when the Reboot moment part is installed; otherwise it uses the
  standard look cover. Leaving NieR and switching Light/Dark within NieR use the standard look cover. Reduced
  Motion keeps the existing calm/instant settle policy. Explicit Play reboot moment remains a local rehearsal
  that changes no setting. Jared’s QA round 2 ruling supersedes the override/four-family assumptions of DL-144,
  DL-152 and DL-153 while retaining their accepted art, local fonts, sound owner, Adjust parts/background and
  onboarding commit boundaries. Every current selector, Settings inventory, onboarding contract, wiring/command
  binding and DRY owner follows this decision. Earlier ten-theme evidence remains historical evidence only; the
  current acceptance matrix contains ten variants. Q22 visible copy is Adjust NieR, or Adjust NieR… in the
  title-bar menu (foundations source confirmation 1030182542-5544).
gui_related: true
gui_classification_reason: Defines the fifth selectable theme family and its shared Settings/onboarding presentation.
split_recommended: false
depends_on:
- F3-425
- SSYS-043
- DR-056
- PWIZ-021
- UCC-120
- UIW-043
unblocks: []
acceptance_criteria:
- The family selectors expose Basic, Friendly, Glass, Retro and NieR, with ten variants and the same Project-scoped
  Settings owner.
- 'The retired general.visual.nier-mode key is migration-only: true selects NieR in the stored mode and is cleared;
  false/absent preserves the selection; migration is idempotent.'
- The retained 29-part and background Adjust rows show only for a NieR theme, preserve values while hidden and reuse
  the one editor and local actions.
- Onboarding uses choose_look, never preview_nier or nier_mode, and writes no Settings before its existing exact
  Project commit boundary.
- The three removed checkbox bindings have non_dispatch tombstones, and no new command, event, key or manager is
  introduced.
- Entering NieR uses its one Reboot moment only when the Reboot moment part is installed; otherwise it uses the
  standard look cover. Leaving NieR and switching Light/Dark within NieR use the standard look cover. Reduced Motion
  keeps the existing calm/instant settle policy. Explicit Play reboot moment remains a local rehearsal that changes
  no setting.
- Basic-specific rows stay Basic-only; CSS reuse is not a logical Basic family selection.
validation_surfaces:
- python3 scripts/pm7-canon-check.py
- python3 scripts/pm7-nier-theme-check.py
- python3 scripts/pm-onboarding-contracts.py
- python3 scripts/pm-shard-plans.py --check
risk_class: theme_identity_migration
reasoning_tier: high
context_scope: pm7_q22_nier_family
implementation_surfaces:
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/product_onboarding_contracts.schema.json
- Plans/pm7_control_bindings.json
node_compile_hint:
  mode: static_contract_only
  create_worknodes: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/QA-ROUND2.md#q22
- Jared 2026-10-30 QA round 2; accepted names relayed by pm7-build and pm7-found mail 1030175829-4688
preserved_exact_tokens:
- nier
- nier-light
- nier-dark
- general.visual.theme
- general.visual.nier-mode
- general.visual.nier-parts
- general.visual.nier-background
- cmd.settings.transaction.preview
- cmd.settings.transaction.apply
- preview_nier
negative_constraints:
- Do not restore an independent NieR override, checkbox, preview_nier intent or nier_mode field.
- Do not add a settings key, part, manager, route, command or event for the fifth family.
- Do not persist onboarding appearance before its existing Project commit boundary.
- Do not derive palette values at runtime or use game assets/audio.
owner_hints:
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-043, ContractName:Plans/FinalGUISpec.md#F3-425, ContractName:Plans/DRY_Rules.md#DR-056


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.
