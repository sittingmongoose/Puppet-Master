# Shard 035: Usage presentation grammar single owner — 2026-10-09

Source: `Plans/DRY_Rules.md`

Source lines: L3149-L3225

Source SHA256: `ce1c0950746900f4fe598e1550fa055d5e636be6a93eb3a2121269cb14a5e117`

---

## Usage presentation grammar single owner — 2026-10-09

The redesigned Usage page (DL-173 to DL-179) adds a presentation grammar that must live in one place, beside the chat transcript owners of DR-043 and the wand grammar of DR-044, and it reuses several of their owners rather than copying them.

### DR-058 - Usage Presentation Grammar Single Owner

```yaml
plan_unit_id: DR-058
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The Usage page's presentation grammar has exactly one GUI owner, FinalGUISpec F3-628 with F3-514:
  the chart family (area, line, columns, budget and stacked, with the crosshair readout card, draw-on
  and morph), meters with the calm spectrum, the threshold tones and the switch-point notch, the hero
  plate with its key light and roll, folded facts behind N more, the provider mark rule, the Accounts
  plates and per-account rows, the Live / Paused control, and the look of move and resize previews.
  Every Usage widget builds these from one shared set of primitives; a room or a widget supplies
  content only and never forks or restyles a primitive. Numbers, times, costs and percentages come
  from the app's one shared formatter and one time-zone implementation (DR-044), never a Usage
  formatter. The grammar reuses its neighbours' owners and never restates them: menus are the chat
  assistant's menu family (F3-531, portaled per F3-424, opening with F3-461's corner sprout); hover is
  the shell's one hover system, F3-465 driven through F3-446's single pointer handler; motion voices
  are ACD-475's per theme family with no per-view override (DR-043), so Usage has no voice of its own;
  any Usage sound would use the Notifications & Sounds owner's mapping and one player (F3-564, F3-599,
  DR-043); NieR Mode is SSYS-043's parts with the grammar of F3-589 and F3-598; and fonts are the app's one embedded font set, under its own owner's rules, never a Usage font list.
  Behaviour stays with its owners: what the page shows and does with usage-feature (UF-107 and the
  units it amends), auto-switch values and rules with Multi-Account MA-073 through the Settings
  owner's transaction (SSYS-009, SSYS-018), and the board transaction with Widget_System WS-019.
  DR-038 and DR-039 stand: Usage admits no shared-runtime role, creates no run-out projection, and
  keeps one Usage authority, one widget-layout authority and one command language.
gui_related: true
gui_classification_reason: "Fixes one owner for the Usage page's presentation grammar and points it at the owners it reuses."
split_recommended: false
depends_on: [DR-038, DR-039, DR-043, DR-044, F3-628, F3-514, DL-173, DL-179]
unblocks: []
acceptance_criteria:
  - "No second chart family, meter, hero, mark rule, folded-facts control or formatter exists for a Usage room or widget."
  - "No Usage-only menu style, hover engine, motion voice, sound registry, NieR grammar or font exists."
  - "No Usage presentation unit restates the menu, hover, motion-voice, sound, NieR or font owners' rules; each cites its owner."
  - "No Usage unit keeps a copy of an auto-switch value or of the board transaction."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: usage_redesign_gui
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-173"
  - "Plans/Decision_Log.md#DL-179"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/DECISIONS-20261009.md (SHA-256 fd8d2d8a092e97f2964331dfe3befea99f2aa66691b5021313bae2cad0a25008)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/R4-plans-20261009.md section 2 (SHA-256 e485c9b971d498774b7bd9b27e85f7f007790235e323dd8a989c51d44b5edad0)"
preserved_exact_tokens:
  - "F3-628"
  - "DR-043"
  - "DR-044"
  - "ACD-475"
  - "F3-465"
  - "N more"
negative_constraints:
  - "Do not restate the Usage presentation grammar outside F3-628."
  - "Do not fork the chat menu family, the shell hover system, the motion voices, the sound player, NieR's grammar or the font set for Usage."
  - "Do not keep a Usage copy of a Settings-owned value or a Usage formatter."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-628, ContractName:Plans/FinalGUISpec.md#F3-514, ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/DRY_Rules.md#DR-044, ContractName:Plans/FinalGUISpec.md#F3-531, ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/FinalGUISpec.md#F3-446, ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/Settings_System.md#SSYS-043, ContractName:Plans/Multi-Account.md#MA-073, ContractName:Plans/Widget_System.md#WS-019
