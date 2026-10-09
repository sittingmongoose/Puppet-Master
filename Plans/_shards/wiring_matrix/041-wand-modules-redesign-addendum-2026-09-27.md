# Shard 041: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/Wiring_Matrix.md`

Source lines: L4992-L5248

Source SHA256: `d01cf010925aae49a11423d348fc706afb483c5b300aeb80f995ade5912ad1cf`

---

## Wand Modules Redesign Addendum (2026-09-27)

This addendum states the production wiring of the redesigned Assistant wand modules. WM-062 wires the producer surfaces of UI_Command_Catalog UCC-169. WM-063 wires the surfaces of UCC-172 and holds the seven new UCC-171 rows as candidate exclusions. WM-064 does the same for the two UCC-174 rows and the ELI5 surfaces of UCC-175. The wiring entries and exclusions themselves are written by the companion task.

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
  DL-138 adds plan_card to the existing cmd.execution_window.cancel production entry alongside
  schedule_manager, matching UCC-169 and the already accepted request source; no new entry or handler is added.
gui_related: true
gui_classification_reason: "Binds visible dock, card, sheet and header producers to existing command routes and their disabled states."
split_recommended: false
depends_on: [UCC-169, CDRY-021]
unblocks: [WM-063]
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
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.4, 8.10, 8.12, 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 lines B-CMD-03, B-CMD-04, B-ACD-12"
preserved_exact_tokens:
  - "DL-138"
  - "cmd.execution_window.cancel"
  - "plan_card"
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
- `assistant.redesign.cmd.chat_crew_auto_open_config` gains `workflow_modal` and `crew_auto_receipt`, the Change control of the Crew Auto note in the chat (DL-135).
- The Teach capture entry gains `teach_document`. Its `wand` surface comes from UCC-169 under WM-062.
- `assistant.redesign.cmd.chat_teach_open_memory` gains `teach_receipt`.
- The capsule-preview entry gains `teach_document`.

**Held.** `crew_auto_receipt` was held here while card p11 was open. DL-135 has since answered that card, so the surface joins the open-config entry above, and it has no candidate exclusion. `cmd.runtime.automation_stop.set` is never wired and has no candidate exclusion. It is excluded only as deliberately not registered, because the catalog names it as the audit's draft name for the pause. `eli5_sheet` was held here too. It has since been settled by DL-126, and WM-064 wires it.

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
  assistant.redesign.cmd.chat_crew_auto_open_config gains workflow_modal and crew_auto_receipt (DL-135),
  the Teach capture entry gains teach_document, assistant.redesign.cmd.chat_teach_open_memory gains
  teach_receipt, and the capsule-preview entry gains teach_document. crew_auto_receipt raises only the
  open-config entry and has no candidate exclusion; cmd.runtime.automation_stop.set is never wired and
  is excluded only as deliberately not registered. eli5_sheet, settled by DL-126, is wired by WM-064.
  The companion task writes the entries.
  DL-138 requires the CS-085 request/result pairs and TeachConfirmRequest.locked to be defined
  in their existing Collaboration, Back Seat Driver and Memory contract pairs before admission.
  Schema completion does not admit a handler or remove an exclusion. The existing
  assistant.redesign.cmd.chat_crew_auto_open_config entry includes crew_auto_receipt;
  assistant.redesign.w_024.chat_crew_auto_set states project | thread, with the chat check writing
  only its thread override and never opening the sheet. The existing cmd.review.send_findings_to_agent
  entry also admits message_chrome for Ask for a fix with taught_rule_check; both source variants
  retain ComposerBufferResult, composer_not_empty and the source-thread empty-composer/no-send rule
  (UCC-172). These are revisions of existing entries, not new production rows.
gui_related: true
gui_classification_reason: "Binds the visible Teach, Crew Auto and new-command controls to wiring entries or exclusions and their disabled states."
split_recommended: false
depends_on: [WM-062, UCC-170, UCC-171, UCC-172, CS-085]
unblocks: [WM-064]
acceptance_criteria:
  - "Each of the seven new rows has exactly one candidate exclusion until it is admitted, and none has a production wiring entry before then."
  - "Only the surfaces UCC-172 names are added to existing entries."
  - "crew_auto_receipt appears only on assistant.redesign.cmd.chat_crew_auto_open_config and has no candidate exclusion. No wiring entry or candidate exclusion exists for cmd.runtime.automation_stop.set; it is excluded only as deliberately not registered. eli5_sheet is wired only as WM-064 states."
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
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 7.4 CC-9"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 line B-CMP-02"
  - "Plans/Decision_Log.md#DL-130, #DL-135"
preserved_exact_tokens:
  - "composer_not_empty"
  - "ComposerBufferResult"
  - "taught_rule_check"
  - "message_chrome"
  - "cmd.review.send_findings_to_agent"
  - "assistant.redesign.w_024.chat_crew_auto_set"
  - "locked"
  - "TeachConfirmRequest"
  - "DL-138"
  - "Plans/Wiring_Matrix.production.exclusions.json"
  - "command_not_registered"
  - "assistant.redesign.cmd.chat_crew_auto_open_config"
  - "crew_auto_receipt"
  - "teach_document"
  - "teach_receipt"
negative_constraints:
  - "Do not write a production wiring entry for a UCC-171 row before its admission."
  - "Do not wire crew_auto_receipt to any entry but the Crew Auto open-config entry, and never wire cmd.runtime.automation_stop.set."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.exclusions.json
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-171, ContractName:Plans/UI_Command_Catalog.md#UCC-172, ContractName:Plans/Commands_System.md#CS-085

### WM-064 - Wand Module Wiring After The Closure Answers

**New rows.** The two new rows of UCC-174, `cmd.chat.eli5.explain_reply` and `cmd.runtime.automation_pause.set`, have no handler yet. Each is therefore an exact candidate exclusion in `Plans/Wiring_Matrix.production.exclusions.json`, under the same DL-035 convention as WM-063:
- the exclusion is temporary, and is not an active-command exemption;
- a surfaced control renders disabled with `command_not_registered`;
- admission removes each exclusion atomically with that row's command and handler registration and its production wiring entry.

When `cmd.runtime.automation_pause.set` is admitted, its production entry names `schedule_manager` as the only surface that may raise it. It also carries the negative path that no automatic producer dispatches it and that only a user clears the pause (DL-136).

**The ELI5 entry is revised.** `assistant.redesign.w_051.chat_eli5_set` is revised as follows:
- It is rebound from the wand row to `eli5_sheet`, because the wand's ELI5 row now only opens the sheet.
- Its list of the surfaces that may raise it is exactly `eli5_sheet` and `composer`, the ELI5 dot.
- It gains the value `inherit`.
- It gains a negative path: an ELI5 switch never re-sends, regenerates or rewrites an earlier reply (DL-126, UCC-175).

The guided tour's same-answer ELI5 step consumes `cmd.chat.eli5.explain_reply` (WM-041), and the tour becomes a consumer of that row's production entry when the row is admitted. Where the tour uses `cmd.chat.eli5.set`, it is the quick dot for later replies only, through this same entry; no second entry is added for it.

**Held and unchanged.** `crew_auto_receipt` is wired as WM-063 states (DL-135). `cmd.runtime.automation_stop.set` keeps only its deliberately-not-registered exclusion. The Settings levels of the ELI5 sheet are Settings transactions: they get no command entry here, and Settings SSYS-028 persists their project scope (DL-138).

The exclusions and the entry changes themselves are written by the companion task, not by this unit.

```yaml
plan_unit_id: WM-064
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  cmd.chat.eli5.explain_reply and cmd.runtime.automation_pause.set (UCC-174) are exact candidate
  exclusions in Plans/Wiring_Matrix.production.exclusions.json under the DL-035 convention until
  admission, rendering disabled with command_not_registered, and admission removes each exclusion
  atomically with its registration and production wiring entry; the pause's entry will name only
  schedule_manager and the negative path that no automatic producer dispatches it (DL-136).
  assistant.redesign.w_051.chat_eli5_set is rebound from the wand row to eli5_sheet, raised by exactly
  eli5_sheet and composer, gains the inherit value and the negative path that an ELI5 switch never
  re-sends, regenerates or rewrites an earlier reply (DL-126). cmd.runtime.automation_stop.set keeps
  only its deliberately-not-registered exclusion, and the ELI5 sheet's Settings levels get no command
  entry. The companion task writes the entries.
  DL-138 confirms that assistant.redesign.w_051.chat_eli5_set describes the tour's quick dot
  for later replies only. Its same-answer step uses cmd.chat.eli5.explain_reply after admission;
  no new production entry is added for the tour.
gui_related: true
gui_classification_reason: "Binds the visible ELI5 sheet, ELI5 dot, Explain this reply simply action and Pause all automations switch to wiring entries or exclusions and their disabled states."
split_recommended: false
depends_on: [WM-063, UCC-170, UCC-174, UCC-175, CS-087]
unblocks: [ATS-066]
acceptance_criteria:
  - "Each of the two new rows has exactly one candidate exclusion until it is admitted, and none has a production wiring entry before then."
  - "assistant.redesign.w_051.chat_eli5_set is raised by exactly eli5_sheet and composer, and not by the wand row."
  - "No wiring entry names an automatic producer for cmd.runtime.automation_pause.set."
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
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 7.4 CC-9"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 lines B-CMD-03, B-CMP-02"
  - "Plans/Decision_Log.md#DL-126, #DL-136"
preserved_exact_tokens:
  - "DL-138"
  - "Plans/Wiring_Matrix.production.exclusions.json"
  - "command_not_registered"
  - "assistant.redesign.w_051.chat_eli5_set"
  - "eli5_sheet"
  - "composer"
  - "inherit"
  - "cmd.chat.eli5.explain_reply"
  - "cmd.runtime.automation_pause.set"
  - "schedule_manager"
negative_constraints:
  - "Do not write a production wiring entry for a UCC-174 row before its admission."
  - "Do not let the wand row raise cmd.chat.eli5.set, or add a second ELI5 entry for the guided tour."
  - "Do not wire an automatic producer for cmd.runtime.automation_pause.set."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-174, ContractName:Plans/UI_Command_Catalog.md#UCC-175, ContractName:Plans/Commands_System.md#CS-087, ContractName:Plans/Decision_Log.md#DL-126, ContractName:Plans/Decision_Log.md#DL-136
