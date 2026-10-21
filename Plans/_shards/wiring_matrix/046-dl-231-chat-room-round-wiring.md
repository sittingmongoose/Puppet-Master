# Shard 046: DL-231 Chat Room round wiring

Source: `Plans/Wiring_Matrix.md`

Source lines: L6435-L6511

Source SHA256: `7304c55288721d09f1c08a64e30ee5cd202487c687a30507474da61c58fa3f1a`

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
