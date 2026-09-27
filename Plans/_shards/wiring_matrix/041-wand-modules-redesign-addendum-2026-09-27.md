# Shard 041: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/Wiring_Matrix.md`

Source lines: L4965-L5026

Source SHA256: `b49622e78e4945e4d316ea4b367222858a52446745859f58eba9ec10ce1e2e03`

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
