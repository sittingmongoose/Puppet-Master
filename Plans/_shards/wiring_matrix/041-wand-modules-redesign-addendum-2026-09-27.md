# Shard 041: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/Wiring_Matrix.md`

Source lines: L4965-L5102

Source SHA256: `38f3602203cf7abd51870b4c39fc63d60d1065e34d3e7ce30ba2d1e321c6a48a`

---

## Wand Modules Redesign Addendum (2026-09-27)

### WM-062 - Wand Module Producer Surfaces

The wand-module redesign changes producer surfaces, not handlers. For every row UCC-169 names, the production wiring entry's "the surfaces that may raise it are exactly: …" list gains the surfaces UCC-169 adds to that row, and no others. The `assistant.redesign.cmd.chat_teach_open_memory` entry gains `wand` and `memory_proposal_line`; `cmd.runtime.approve`, `cmd.runtime.decline` and `cmd.permissions.review_request` gain `workflow_card`, and never `run_dock`; `cmd.chat.revert` gains `revert_confirm` as its only GUI dispatcher, with `message_files_row` recorded as an entry to that sheet and not as a dispatcher. BrainStorm "Answer now" binds `cmd.questionnaire.resume` from `run_dock` and `brainstorm_card` under the questionnaire family's existing exact exclusion: the control reads availability and renders disabled with `command_not_registered` until the family's command and handler admission removes that exclusion. A control that CDRY-021 lists as view state or draft state gets no production wiring entry. The wiring entries themselves are written in `Plans/Wiring_Matrix.production.json` by the companion task, not by this unit.

```yaml
plan_unit_id: WM-062
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Production wiring follows UCC-169's producer surfaces exactly. Each named row's exact surface list
  gains only the surfaces UCC-169 adds to it: assistant.redesign.cmd.chat_teach_open_memory gains wand and
  memory_proposal_line; cmd.runtime.approve, cmd.runtime.decline and cmd.permissions.review_request
  gain workflow_card and never run_dock; cmd.chat.revert is dispatched only from revert_confirm, with
  message_files_row an entry to that sheet. cmd.questionnaire.resume is bound from run_dock and
  brainstorm_card under the questionnaire family's existing exclusion and renders disabled with
  command_not_registered until admission. CDRY-021 view-state and draft-state controls get no
  production wiring entry. The entries are written by the companion task.
gui_related: true
gui_classification_reason: "Binds visible dock, card, sheet and header producers to existing command routes and their disabled states."
split_recommended: false
depends_on: [UCC-169, CDRY-021]
unblocks: []
acceptance_criteria:
  - "Every surface UCC-169 adds to a row appears in that row's production wiring surface list, and no other surface is added."
  - "run_dock is absent from the approve, decline and permission-review producer lists."
  - "No production wiring entry exists for a CDRY-021 view-state or draft-state control."
  - "cmd.questionnaire.resume stays disabled with command_not_registered from run_dock and brainstorm_card until its exclusion is removed by admission."
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: wand_module_surface_drift
reasoning_tier: medium
context_scope: assistant_wand_module_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: static_wiring_intent_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.4, 8.10, 8.12, 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 lines B-CMD-03, B-CMD-04, B-ACD-12"
preserved_exact_tokens:
  - "assistant.redesign.cmd.chat_teach_open_memory"
  - "workflow_card"
  - "run_dock"
  - "revert_confirm"
  - "cmd.questionnaire.resume"
  - "command_not_registered"
negative_constraints:
  - "Do not add a producer surface that UCC-169 does not name."
  - "Do not fabricate a handler or remove the questionnaire exclusion without admission."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-169, ContractName:Plans/Commands_System.md#CDRY-021

### WM-063 - Wand Module Wiring After The Owner's Answers

**New rows.** The seven new rows of UCC-171 have no handler yet. Each one is therefore an exact candidate exclusion in `Plans/Wiring_Matrix.production.exclusions.json`, under the DL-035 convention:
- the exclusion is temporary, and is not an active-command exemption;
- a surfaced control renders disabled with `command_not_registered`;
- admission removes each exclusion atomically with that row's command and handler registration and its production wiring entry.

**Surfaces.** Where a row UCC-172 names already has a production wiring entry, that entry's list of the surfaces that may raise it gains exactly the surfaces UCC-172 adds, and nothing more:
- `assistant.redesign.cmd.chat_crew_auto_open_config` gains `workflow_modal`.
- The Teach capture entry gains `teach_document`. Its `wand` surface comes from UCC-169 under WM-062.
- `assistant.redesign.cmd.chat_teach_open_memory` gains `teach_receipt`.
- The capsule-preview entry gains `teach_document`.

**Held.** Nothing is wired for `eli5_sheet`, `crew_auto_receipt` or `cmd.runtime.automation_stop.set` while their cards or follow-ups are open. None of the three has a candidate exclusion; `cmd.runtime.automation_stop.set` is excluded only as deliberately not registered, because the catalog names it.

The exclusions and the list changes themselves are written by the companion task, not by this unit.

```yaml
plan_unit_id: WM-063
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  The seven UCC-171 rows are exact candidate exclusions in Plans/Wiring_Matrix.production.exclusions.json
  under the DL-035 convention until admission, rendering disabled with command_not_registered, and
  admission removes each exclusion atomically with its registration and production wiring entry.
  Existing production wiring entries gain exactly the UCC-172 surfaces:
  assistant.redesign.cmd.chat_crew_auto_open_config gains workflow_modal, the Teach capture entry gains
  teach_document, assistant.redesign.cmd.chat_teach_open_memory gains teach_receipt, and the
  capsule-preview entry gains teach_document. Nothing is wired for eli5_sheet, crew_auto_receipt or
  cmd.runtime.automation_stop.set while they are open, and none of them has a candidate exclusion;
  cmd.runtime.automation_stop.set is excluded only as deliberately not registered. The companion task
  writes the entries.
gui_related: true
gui_classification_reason: "Binds the visible Teach, Crew Auto and new-command controls to wiring entries or exclusions and their disabled states."
split_recommended: false
depends_on: [WM-062, UCC-171, UCC-172, CS-085]
unblocks: []
acceptance_criteria:
  - "Each of the seven new rows has exactly one candidate exclusion until it is admitted, and none has a production wiring entry before then."
  - "Only the surfaces UCC-172 names are added to existing entries."
  - "No wiring entry or candidate exclusion exists for eli5_sheet, crew_auto_receipt or cmd.runtime.automation_stop.set; the last is excluded only as deliberately not registered."
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: wand_module_surface_drift
reasoning_tier: medium
context_scope: assistant_wand_module_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: static_wiring_intent_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 7.4 CC-9"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 line B-CMP-02"
  - "Plans/Decision_Log.md#DL-130"
preserved_exact_tokens:
  - "Plans/Wiring_Matrix.production.exclusions.json"
  - "command_not_registered"
  - "assistant.redesign.cmd.chat_crew_auto_open_config"
  - "teach_document"
  - "teach_receipt"
negative_constraints:
  - "Do not write a production wiring entry for a UCC-171 row before its admission."
  - "Do not wire eli5_sheet, crew_auto_receipt or cmd.runtime.automation_stop.set while they are open."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.exclusions.json
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-171, ContractName:Plans/UI_Command_Catalog.md#UCC-172, ContractName:Plans/Commands_System.md#CS-085
