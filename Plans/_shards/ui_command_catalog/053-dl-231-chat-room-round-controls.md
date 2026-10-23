# Shard 053: DL-231 Chat Room round controls

Source: `Plans/UI_Command_Catalog.md`

Source lines: L16245-L16413

Source SHA256: `70e75fed74819bcca3a553f1dd94631b4766b8f8d0a06985c568bb285ad46cfc`

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


### UCC-208 - Hosted Chat Producers Keep Their Existing Commands

```yaml
plan_unit_id: UCC-208
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The chat port adds producers to existing commands and local actions, not new command identities
  (DL-232). Plans open their exact version through cmd.chat.plan.open_version (UCC-176); files and
  diffs through cmd.file.open; artifacts and documents through the subject routes of UCC-200; a child
  transcript through cmd.agents.open_thread (UCC-188); browser addresses through
  cmd.browser.open_workspace_preview; and existing terminal sessions through cmd.terminal.open. Every
  domain route carries CV-360 placement and reaches the one opening module of F3-634, preserving
  revision/identity and user-versus-agent focus. A direct cmd.panel_tab.open is used only where
  UCC-200 already permits it, including read-only editor buffers for command output.
  cmd.editor.close_tab remains alias metadata for cmd.panel_tab.close and owns no second handler. Host
  close and activation notifications update the chat's card state without another command. Chat
  show/hide is cmd.panel.switch with panel_id chat; a resize commits once through
  cmd.workspace_layout.resize_surface with surface chat and width, including null for reset. History
  pin is ui.chat_column.pin_history with history_pinned; Keep open is ui.chat_column.keep_open with
  keep_open. These two are typed local layout view-state actions with no receipt or event and never
  Settings writes. Menus, sheets, hover previews, disclosure, tab body repaint and focus return
  dispatch no command. Wand setup opens its existing app modal and its committed action keeps its own
  command. ELI5's per-chat override remains cmd.chat.eli5.set; the product's All chats and Project
  default use Settings transactions over general.interaction.eli5-default. Working style, master sound and naming
  use the same Settings preview/apply transaction as their Settings rows, including when changed from
  chat; no chat-only mute, title-policy or take command is minted. The compact command card offers
  only Open in Terminal for a live session, View output when no session remains, and Rerun in Terminal
  under ACD-502. These retain UCC-201's identities and exact-session behavior. Show Terminal and Focus
  remain their existing other-surface commands; the port adds no compact-card producers for them;
  Insert command and retained-output candidates remain unavailable until their existing admission.
  Thought Stream in Settings, New chat defaults and the composer capability menu uses the existing
  Settings transaction over general.interaction.thought-stream (SSYS-055), with no new command
  identity, and so does its Lines shown while thinking choice over
  general.interaction.thought-stream-lines from the same three places (DL-234); arbitrary Demo Studio
  family takes receive no product command or production row. Candidate
  exclusions for DL-218's Check It and Grill Me controls remain unchanged by this port; the concept
  proving a click is not command admission. In integrated concept 59ca2d4382 the chat header's Keep
  History open uses ui.chat_column.pin_history, its Keep open row uses ui.chat_column.keep_open and
  Pop out / Dock back consumes UCC-203's existing route. Hosted opens use the Home bridge with D7 file
  gestures, D8 background agent tabs and the centre's narrow rule. These JavaScript paths demonstrate
  concept routing only, not native typed dispatch. The existing project-only Settings adapter
  persists Project default ELI5; All chats ELI5 remains session-only and therefore does not prove the
  application-scope Settings transaction above. In that snapshot Thought Stream changed only its
  shared preference and preview; the live thinking display it drives followed on 2026-10-23
  (ACD-221, DL-234).
gui_related: true
gui_classification_reason: Maps hosted chat controls to existing commands, Settings transactions and local actions.
split_recommended: false
depends_on: [DL-232, UCC-175, UCC-176, UCC-188, UCC-200, UCC-201, UCC-203, UCC-205, UCC-206, DL-234]
unblocks: []
acceptance_criteria:
  - "Every port producer resolves to one existing command, its recorded alias, a Settings transaction or an explicit local disposition."
  - "History pin and Keep open never issue a Settings transaction or workspace.layout_changed; resizing commits once."
  - "No candidate is registered or enabled merely because its concept demonstration works."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
  - "Plans/UI_Command_Catalog.md"
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D3, D4, D7, D8, D9, D26, D27, D28)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/CONTRACT.md, SHA-256 10adf449002887257c2a95eb97bf25d923e68a1650264622b6461e954f87389b (concept integration lineage, not native API authority)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/integrated-behavior-59ca2d4382.md, SHA-256 108510ec4a80a24dc8a3fe05d7c45ebb7632934cd5b36bfd4edb3f01f833c649 (lead integration brief, corroborated against concept source; not native or final visual verification)"
preserved_exact_tokens:
  - "cmd.agents.open_thread"
  - "cmd.editor.close_tab"
  - "ui.chat_column.pin_history"
  - "ui.chat_column.keep_open"
  - "cmd.workspace_layout.resize_surface"
  - "cmd.panel.switch"
negative_constraints:
  - "Do not add a chat-private route, close handler, terminal command or Settings writer."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/UI_Command_Catalog.md"
```

ContractRef: ContractName:Plans/Commands_System.md#CS-104, ContractName:Plans/Wiring_Matrix.md#WM-096, ContractName:Plans/UI_Wiring_Rules.md#UIW-044, ContractName:Plans/Settings_System.md#SSYS-055
