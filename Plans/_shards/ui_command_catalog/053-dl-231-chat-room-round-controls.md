# Shard 053: DL-231 Chat Room round controls

Source: `Plans/UI_Command_Catalog.md`

Source lines: L16245-L16322

Source SHA256: `de41fe051c2b1708bb857fef83ff1ee916f653d629840e69e9db37052351393d`

---

## DL-231 Chat Room round controls

### UCC-207 - Chat Room Pause Switch And User Next Round

```yaml
plan_unit_id: UCC-207
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  DL-231 and CWR-044 retain cmd.chat_room.next_round, ChatRoomRoundRequest,
  ChatRoomRoundResult and handlers::collaboration::chat_room_next_round for the user's start of
  exactly one round while a Chat Room waits between rounds with pause_between_rounds true, a
  completed first round, another configured round available and an unmet stop condition. The
  command preserves the active turn policy and returns its deterministic participant order;
  otherwise it refuses run_state_invalid. Its sources remain chat_room_card and chat_room_panel.
  Start starts round 1, after Grill Me Confirm when enabled. Ask Everyone has No producer and
  automatic round starts dispatch no command. Pause between rounds on workflow_modal is a draft
  field copied from assistant.multi_agent.chat_room.pause_between_rounds, default false, and
  committed with the definition. The run switch on chat_room_card and chat_room_panel reuses
  cmd.collaboration.reconfigure with change_kind set_pause_between_rounds and a boolean
  pause_between_rounds. Those sources are added to that command's workflow_modal, workflow_card,
  workflow_panel, activity, composer and brainstorm_panel sources. Reconfigure is available only
  in waiting, running, blocked or paused, never on a terminal run. It bumps the definition revision
  once under the expected-revision check, writes one system transcript entry, takes effect at
  the next round boundary and cancels no turn; switching off at a between-round wait starts the
  next round immediately. Only one host is actionable under CWR-020. The existing chat_room_card
  Add 2 more rounds and Continue without also reach this reconfigure handler as add_rounds and
  waive_participant, preserving their revision and explicit-waiver checks (CWR-024). No command
  identity is minted or retired; handler_unavailable and command_not_registered still apply.
  cmd.collaboration.cancel also remains available to a Chat Room in waiting, including its
  between-round, exhausted-round and stop-condition waits, as CWR-044 requires.
gui_related: true
gui_classification_reason: Binds the Chat Room setup check, run switch and Next Round to their existing commands and sources.
depends_on: [CWR-024, CWR-031, CWR-044, UCC-169]
unblocks: []
acceptance_criteria:
  - The setup check is draft state; both run-switch sources use the same reconfigure command and boolean change.
  - Next Round starts one round only at the switch-on between-round wait; every other state refuses run_state_invalid.
  - Automatic starts dispatch no command and Ask Everyone has no producer.
  - Reconfigure refuses terminal runs, preserves in-flight turns and applies the switch at the next boundary.
  - Add 2 more rounds and Continue without on chat_room_card use the existing reconfigure handler.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-new-contracts
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_room_control_availability_drift
reasoning_tier: standard
context_scope: chat_room_rounds_companions
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.production.json
  - Plans/collaborative_workflows_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-231
  - Plans/Collaborative_Workflows.md#CWR-044
preserved_exact_tokens:
  - cmd.chat_room.next_round
  - cmd.collaboration.reconfigure
  - pause_between_rounds
  - set_pause_between_rounds
  - assistant.multi_agent.chat_room.pause_between_rounds
  - chat_room_card
  - chat_room_panel
  - run_state_invalid
negative_constraints:
  - Do not dispatch a command for automatic round progression.
  - Do not expose Ask Everyone or a second switch command.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-231, ContractName:Plans/Collaborative_Workflows.md#CWR-044, ContractName:Plans/Collaborative_Workflows.md#CWR-031
