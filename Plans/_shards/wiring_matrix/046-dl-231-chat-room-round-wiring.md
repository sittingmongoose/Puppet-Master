# Shard 046: DL-231 Chat Room round wiring

Source: `Plans/Wiring_Matrix.md`

Source lines: L6435-L6578

Source SHA256: `af616ba422a6c7ed930ee6a7747efb5e6a0295a2ca2aea8c6feff58dcd124573`

---

## DL-231 Chat Room round wiring

### WM-095 - Chat Room Pause And Next Round Wiring

```yaml
plan_unit_id: WM-095
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  DL-231 and UCC-207 update assistant.redesign.cmd.collaboration_reconfigure in
  Plans/Wiring_Matrix.production.json to admit chat_room_card and chat_room_panel alongside the
  existing workflow_modal, workflow_card, workflow_panel, activity, composer and brainstorm_panel
  sources. Their Pause between rounds switch raises cmd.collaboration.reconfigure with
  set_pause_between_rounds and boolean pause_between_rounds. The sole handler remains
  handlers::collaboration::reconfigure. Require waiting, running, blocked or paused, the expected
  definition revision and currentness; write one new definition revision and one system transcript
  entry. Apply the switch at the next round boundary without cancelling a turn; switching off at
  the between-round wait starts the next round immediately. CWR-020 allows only one actionable
  host. The same chat_room_card source covers Add 2 more rounds (add_rounds) and Continue without
  (waive_participant), with CWR-024's explicit waiver and revision contracts. The existing
  assistant.redesign.cmd.chat_room_next_round row retains chat_room_card and chat_room_panel and
  handlers::collaboration::chat_room_next_round; cmd.chat_room.next_round is available only at the
  switch-on between-round wait after round 1 with remaining configured rounds and an unmet stop
  condition. It starts exactly one round under the unchanged policy and returns the deterministic
  participant order; otherwise run_state_invalid. Start, Grill Me Confirm and automatic round
  progression raise no Next Round command, and automatic starts dispatch no command at all.
  Ask Everyone has no producer. Both rows retain handler_unavailable, command_not_registered and
  empty expected_event_types until native admission; their dispatcher, availability, currentness,
  permission, replay, keyboard/pointer and return-route obligations prove no runtime behavior here.
  assistant.redesign.cmd.collaboration_cancel also checks the Chat Room waiting state: between
  rounds, after exhaustion and at the stop condition it remains available through the same
  cmd.collaboration.cancel handler and wins over automatic progression, settling cancelled while
  retaining transcripts and artifacts.
gui_related: true
gui_classification_reason: Wires the Chat Room card and panel switches and restricts the Next Round control.
depends_on: [CWR-020, CWR-024, CWR-044, UCC-207]
unblocks: []
acceptance_criteria:
  - Both run-switch surfaces dispatch the same reconfigure request and apply its boundary effect without cancelling work.
  - The existing card round-extension and participant-waiver producers reach the same reconfigure row.
  - Next Round dispatches only from the switch-on between-round wait; other states refuse run_state_invalid.
  - Automatic round starts dispatch nothing; no Ask Everyone producer is wired.
  - Disabled controls, stale revision, denial and replay create no extra work or system entry.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py validate-new-contracts
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_room_wiring_availability_drift
reasoning_tier: standard
context_scope: chat_room_rounds_companions
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: static_wiring_intent_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-231
  - Plans/Collaborative_Workflows.md#CWR-044
preserved_exact_tokens:
  - assistant.redesign.cmd.collaboration_reconfigure
  - assistant.redesign.cmd.chat_room_next_round
  - set_pause_between_rounds
  - pause_between_rounds
  - chat_room_card
  - chat_room_panel
  - run_state_invalid
negative_constraints:
  - Do not mint a switch command or dispatch automatic round starts through user commands.
  - Do not claim native or event admission from production-intent wiring.
owner_hints:
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-231, ContractName:Plans/Collaborative_Workflows.md#CWR-044, ContractName:Plans/UI_Command_Catalog.md#UCC-207


### WM-096 - Existing Wiring For The Hosted Chat

```yaml
plan_unit_id: WM-096
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  The hosted 5.6 Pro chat reuses the production-intent rows of its existing commands under UCC-208 and
  UIW-044 (DL-232). catalog.agents_open_thread includes the chat's Activity Detail transcript action,
  live child card and working-activity child openers; the preview row itself still opens Activity
  Detail. catalog.terminal_open and catalog.terminal_rerun cover the compact card's Open in Terminal
  and Rerun in Terminal under ACD-502, preserving exact-session behavior and candidate limits from
  UCC-201. terminal.mark_menu.open_output also covers the compact card's View output and View output
  log through the same kept read-only editor-buffer open; its location names both producers.
  catalog.terminal_show and catalog.terminal_focus keep their existing other-surface producers;
  neither gains a compact-card control. assistant.redesign.cmd.chat_plan_open_version retains
  exact-version Plan opening; assistant.redesign.w_051.chat_eli5_set retains only the per-chat
  override producers, with application/project defaults written by Settings. home.tab.close uses
  cmd.panel_tab.close, with cmd.editor.close_tab as its alias; host close/activate updates the chat
  without another dispatch. home.chat.activity_toggle and home.more_options.chat_visibility keep
  cmd.panel.switch, and home.resizer.chat keeps cmd.workspace_layout.resize_surface. History pin and
  Keep open stay their existing typed-local exclusions, never duplicate production rows. The port
  changes producer locations and acceptance checks in Plans/Wiring_Matrix.production.json only; it
  adds no command, handler, physical storage family, EventRecord or claim of native readiness. Every
  row's planned-handler and unavailable-candidate boundary remains in force. Settings preferences use
  the existing Settings transaction rows, not one synthetic row per preference. The hosted surface's
  boot, body mounting, appearance projection and one Demo Studio are local/concept dispositions and do
  not become production wiring.
gui_related: true
gui_classification_reason: Binds hosted chat producers to existing wiring rows and their reverse GUI consumers.
split_recommended: false
depends_on: [DL-232, UCC-208, UIW-044, WM-090, WM-091, WM-092, WM-094, WM-095]
unblocks: []
acceptance_criteria:
  - "The changed production-intent entries identify the hosted producers and retain their existing commands and handlers."
  - "No duplicate rows are added for local History pin, Keep open, modal opening or concept demos."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
  - "Plans/Wiring_Matrix.md"
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D3, D4, D7, D8, D9, D26, D27, D28)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/CONTRACT.md, SHA-256 10adf449002887257c2a95eb97bf25d923e68a1650264622b6461e954f87389b (concept integration lineage, not native API authority)"
preserved_exact_tokens:
  - "Demo Studio"
  - "Keep open"
negative_constraints:
  - "Do not remove DL-218 exclusions or assert native proof from the port."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/Wiring_Matrix.md"
```

ContractRef: ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/UI_Command_Catalog.md#UCC-208, ContractName:Plans/UI_Wiring_Rules.md#UIW-044
