# Shard 064: DL-231 Chat Room definition and command shapes

Source: `Plans/Contracts_V0.md`

Source lines: L24032-L24099

Source SHA256: `2cbcda1c4776a368c3a581f4e04e2fa2fa02f76140733ab77a2e10fcbfa592d0`

---

## DL-231 Chat Room definition and command shapes

### CV-364 - Chat Room Pause Field And Reconfiguration Shape

```yaml
plan_unit_id: CV-364
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  DL-231 and CWR-044 extend CollaborativeDefinition, pm.collaboration.definition.v1, in
  Plans/collaborative_workflows_contracts.schema.json with the Chat Room-only boolean
  pause_between_rounds, default false. It is forbidden on Crew, Review and BrainStorm. An absent
  field reads false, so existing definitions need no rewrite, new schema version, physical family
  or migration row. A committed new sheet carries its choice; the Settings alias
  assistant.multi_agent.chat_room.pause_between_rounds supplies the setup default only and later
  Settings edits never change a committed room. reconfigure_change adds set_pause_between_rounds
  with boolean pause_between_rounds; CollaborationReconfigureRequest and
  CollaborationReconfigureResult keep their identities, revision/currentness check and one system
  entry. The change applies at the next round boundary without cancelling a turn, and switching off
  while waiting between rounds starts the next round immediately. ChatRoomRoundRequest and
  ChatRoomRoundResult keep their schema IDs and command identity cmd.chat_room.next_round for the
  user's start of exactly one round at the switch-on between-round wait; otherwise run_state_invalid.
  Automatic starts dispatch no command. The existing schema/fixture pair remains in CONTRACT_PAIRS;
  structural fixtures and fixture-only owner-state joins prove no native handler, automatic
  progression, storage transaction or EventRecord admission.
gui_related: false
gui_classification_reason: Registers definition and request/result shapes and their static validation boundary.
depends_on: [CWR-031, CWR-032, CWR-044]
unblocks: []
acceptance_criteria:
  - The boolean is valid only on Chat Room; absent means false without a migration.
  - Both switch values use the existing reconfigure envelopes with no schema identity change.
  - Next Round retains its existing envelopes and run_state_invalid boundary.
  - Static validation admits no writer, event or native runtime.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-new-contracts
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_room_shape_owner_drift
reasoning_tier: standard
context_scope: chat_room_rounds_companions
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaborative_workflows_contracts.schema.json
  - Plans/collaborative_workflows_contract_fixtures.json
  - scripts/pm-new-contracts-verify.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-231
  - Plans/Collaborative_Workflows.md#CWR-044
preserved_exact_tokens:
  - pm.collaboration.definition.v1
  - pause_between_rounds
  - set_pause_between_rounds
  - assistant.multi_agent.chat_room.pause_between_rounds
  - cmd.chat_room.next_round
  - run_state_invalid
negative_constraints:
  - Do not add a migration or physical writer for an optional field whose absent value is false.
  - Do not infer runtime progression from shape or fixture-context validation.
owner_hints:
  - Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-231, ContractName:Plans/Collaborative_Workflows.md#CWR-044, ContractName:Plans/Settings_System.md#SSYS-028
