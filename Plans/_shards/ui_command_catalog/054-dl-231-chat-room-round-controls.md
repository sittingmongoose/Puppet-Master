# Shard 054: DL-231 Chat Room round controls

Source: `Plans/UI_Command_Catalog.md`

Source lines: L16405-L16802

Source SHA256: `9acefb9159762fec111c86e6d075da46a5b71cf95b79a23705b801bc7b3c8dee`

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
canonical_text: 'The chat port adds producers to existing commands and local actions, not new command identities (DL-232).
  Plans open their exact version through cmd.chat.plan.open_version (UCC-176); files and diffs through cmd.file.open;
  artifacts and documents through the subject routes of UCC-200; a child transcript through cmd.agents.open_thread (UCC-188);
  browser addresses through cmd.browser.open_workspace_preview; and existing terminal sessions through cmd.terminal.open.
  Every domain route carries CV-360 placement and reaches the one opening module of F3-634, preserving revision/identity
  and user-versus-agent focus. A direct cmd.panel_tab.open is used only where UCC-200 already permits it, including read-only
  editor buffers for command output. cmd.editor.close_tab remains alias metadata for cmd.panel_tab.close and owns no
  second handler. Host close and activation notifications update the chat''s card state without another command. Chat
  show/hide is cmd.panel.switch with panel_id chat; a resize commits once through cmd.workspace_layout.resize_surface
  with surface chat and width, including null for reset. History pin is ui.chat_column.pin_history with history_pinned;
  Keep open is ui.chat_column.keep_open with keep_open. These two are typed local layout view-state actions with no receipt
  or event and never Settings writes. Menus, sheets, hover previews, disclosure, tab body repaint and focus return dispatch
  no command. Wand setup opens its existing app modal and its committed action keeps its own command. ELI5''s per-chat
  override remains cmd.chat.eli5.set; the product''s All chats and Project default use Settings transactions over general.interaction.eli5-default.
  Working style, master sound and naming use the same Settings preview/apply transaction as their Settings rows, including
  when changed from chat; no chat-only mute, title-policy or take command is minted. The compact command card offers
  only Open in Terminal for a live session, View output when no session remains, and Rerun in Terminal under ACD-502.
  These retain UCC-201''s identities and exact-session behavior. Show Terminal and Focus remain their existing other-surface
  commands; the port adds no compact-card producers for them; Insert command and retained-output candidates remain unavailable
  until their existing admission. Thought Stream in Settings, New chat defaults and the composer capability menu uses
  the existing Settings transaction over general.interaction.thought-stream (SSYS-055), with no new command identity,
  and so does its Lines shown while thinking choice over general.interaction.thought-stream-lines from the same three
  places (DL-234); Candidate exclusions for DL-218''s Check It and Grill Me controls remain unchanged by this port; the
  concept proving a click is not command admission. In integrated concept 59ca2d4382 the chat header''s Keep History
  open uses ui.chat_column.pin_history, its Keep open row uses ui.chat_column.keep_open and Pop out / Dock back consumes
  UCC-203''s existing route. Hosted opens use the Home bridge with D7 file gestures, D8 background agent tabs and the
  centre''s narrow rule. These JavaScript paths demonstrate concept routing only, not native typed dispatch. The existing
  project-only Settings adapter persists Project default ELI5; All chats ELI5 remains session-only and therefore does
  not prove the application-scope Settings transaction above. In that snapshot Thought Stream changed only its shared
  preference and preview; the live thinking display it drives followed on 2026-10-23 (ACD-221, DL-234). PM7 S5: hosted
  Pip parts use the same admitted inventory row and Settings pair in every host. G1 B (Jared 2026-10-30) restores ui.activity_detail.pin
  with boolean pinned (default false), selected thread_id, view_id, source scope and return-focus identity. It is view-local,
  has no runtime/Settings/event/receipt write and uses no production mutation handler. Pinned detail follows thread data
  across switches; unpinned detail closes on a switch. History pin remains separate; work actions use the UCC-210 owners
  instead of chat-private aliases. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q17: hover-to-light/dimming
  starts only from an actual control inside its affects region (button, input, select, textarea, label or switch/radio/tab/slider
  semantics). Plain words, empty section space and the plate picture do not dim the cast. Keyboard focus on a control
  gives the same feedback; a plate-embedded control remains eligible. Scheduled highlights only rows/marks with a real
  partner on its plate; markless rows dim nothing. One affectsOf/linkStyle owner supplies this behavior, with no per-sheet
  hover engine. Q15: the menu head and trigger use the same registry wand with the same rod/star/sparkle ink roles. Pip
  and that wand remain the head’s own children so a wrapper cannot discard the glyph’s role-specific colours. The sign’s
  kind glyph matches its sheet head; do not fork a second wand or fallback icon. Q16: You is the person alone, head and
  shoulders in each family’s materials and small-size maps. It carries no marionette cross, strings, holding arm/control
  or connection to a cross, and is never an agent Pip. Diagram edges to You express the plate’s result/topology, not
  puppet strings. The one ppYou/PX_YOU/pnYou drawer serves crew diagrams, cast plates, run cards and rosters. Optional
  agent strings and the single Pip primitive retain their existing meaning.'
gui_related: true
gui_classification_reason: Maps hosted chat controls to existing commands, Settings transactions and local
  actions.
split_recommended: false
depends_on:
- DL-232
- UCC-175
- UCC-176
- UCC-188
- UCC-200
- UCC-201
- UCC-203
- UCC-205
- UCC-206
- DL-234
unblocks: []
acceptance_criteria:
  - "Every port producer resolves to one existing command, its recorded alias, a Settings transaction or an explicit local disposition."
  - "History pin and Keep open never issue a Settings transaction or workspace.layout_changed; resizing commits once."
  - "No candidate is registered or enabled merely because its concept demonstration works."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q17: hover-to-light/dimming starts only from an actual control inside its affects region (button, input, select, textarea, label, link, switch/radio/checkbox/tab/slider/spinbutton/combobox semantics, or editable text). Plain words, empty section space and the plate picture do not dim the cast. Keyboard focus on a control gives the same feedback; a plate-embedded control remains eligible. Scheduled highlights only rows/marks with a real partner on its plate; markless rows dim nothing. One affectsOf/linkStyle owner supplies this behavior, with no per-sheet hover engine. Q15: the menu head and trigger use the same registry wand with the same rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the glyph’s role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or fallback icon. Q16: You is the person alone, head and shoulders in each family’s materials and small-size maps. It carries no marionette cross, strings, holding arm/control or connection to a cross, and is never an agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou drawer serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and the single Pip primitive retain their existing meaning."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-185
- /mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D3, D4, D7, D8, D9, D26, D27, D28)
- /mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/CONTRACT.md, SHA-256 10adf449002887257c2a95eb97bf25d923e68a1650264622b6461e954f87389b
  (concept integration lineage, not native API authority)
- /mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/integrated-behavior-59ca2d4382.md,
  SHA-256 108510ec4a80a24dc8a3fe05d7c45ebb7632934cd5b36bfd4edb3f01f833c649 (lead integration brief, corroborated
  against concept source; not native or final visual verification)
preserved_exact_tokens:
- cmd.agents.open_thread
- cmd.editor.close_tab
- ui.chat_column.pin_history
- ui.chat_column.keep_open
- cmd.workspace_layout.resize_surface
- cmd.panel.switch
negative_constraints:
- Do not add a chat-private route, close handler, terminal command or Settings writer.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Commands_System.md#CS-104, ContractName:Plans/Wiring_Matrix.md#WM-096, ContractName:Plans/UI_Wiring_Rules.md#UIW-044, ContractName:Plans/Settings_System.md#SSYS-055


### UCC-209 - Project Box Command And Shortcut Producers

```yaml
plan_unit_id: UCC-209
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  B1/B2/B6; CS-105. The project box and row-key producer add cmd.project.switch_active_tab and
  cmd.project.open_in_new_workspace_tab as canonical workspace-owner commands with stable project_id.
  ui.project_switcher.open/close are typed local presentation actions, Ctrl+Shift+P opens and
  Ctrl/Cmd+Enter on a row dispatches the new-tab command. All projects uses the existing Projects route.
  Binding census includes all six shell.project.* controls; decorative mark/loader dispatch nothing. B2:
  All projects is ui.project_switcher.all_projects, a typed local existing-page route with tab_id projects,
  never a cmd.panel.switch side-panel operation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-236
- CS-105
unblocks: []
acceptance_criteria:
- The catalog has one canonical row for each of the two Project commands and no command merely to open the
  menu.
- Shortcut and alternate-row producers match CS-105 and six project-box binding families.
- All projects focuses the existing Projects page, never a side-panel cmd.panel.switch.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-236, ContractName:Plans/Commands_System.md#CS-105




### UCC-210 - Work Commands And Navigation

```yaml
plan_unit_id: UCC-210
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  D2/D6/D8–D13, G4–G8/G10; CS-106. cmd.chat.processes.open is thread navigation; cmd.agents_and_processes.show
  selects agents|processes|resources; cmd.agents_and_processes.pop_out moves the same desktop view.
  cmd.work.stop is item|thread|platform owner mutation over current reviewed IDs, services excluded;
  cmd.work.restart restarts eligible work; cmd.work.send_input answers current safe yes/no;
  cmd.work.set_completion_delivery writes agent|user|quiet; cmd.work.clear_finished is view-local
  navigation_wrapper hiding only; cmd.work.quit confirms keep_running|stop_selected. Each canonical row has one
  handler and identity. Reuse cmd.terminal.open, owner thread/node routes and schedule cancel. New Home
  panel-tab route and keyboard shortcuts remain deferred. Typed local ui.work_panel.* and ui.work_quit.* are
  no-write view state. D11/G4, PM7 Step4, 2026-10-30: System status is a small read-only overlay popover,
  reached from the existing status-bar System status item and the Processes System services link.
  ui.system_status.open and ui.system_status.close are typed local visibility actions, with
  statusbar.system_status, work.open_system_status and system_status.close binding families. Service owner links
  use the existing ui.settings.route.open action and system_status.service.open_settings binding, selecting
  code.editing.lsp-server-catalog for language servers, system.mcp.server-list for MCP servers or
  web.index.enable for the search index. They open Settings and reveal the owner row without writing a value or
  controlling a service. The popover has close/Escape/outside closure, return focus and the common overlay/Glass
  plate; unavailable owner navigation says why. G6 confines Clear finished producers to the thread Processes
  view and panel Processes tab. PM7_WORK_UI and PM_WORK demonstrate these routes in the concept; they are
  adapters to the stable catalog identities, not replacement native commands or Event Authority admission.
  D2/D7, PM7 Step4 final-source alignment, 2026-10-30 (integration e9b15abc64): composer run_dock Review/Show is
  an additional producer of cmd.chat.processes.open for a process or scheduled item, preserving
  Project/thread/work identity and selecting that item in Processes. Agent Review selects the existing Subagents
  Activity Detail row as ordinary local view state; it does not open the live transcript or dispatch
  cmd.agents.open_thread. This view selection owns no runtime mutation or new action ID. D7/D8/D13, PM7
  companion review fix1, 2026-10-30 (Astra A2/A3): work.open_owner is ui.work_panel.select with an owner-row
  value, owner_id, destination agents|subagents, invoking view and focus; Subagents also binds its exact
  thread_id. It never opens a transcript. Actual Open thread uses cmd.chat.open_thread for the item’s bound
  Assistant thread; actual Open surface is ui.work_panel.open_surface, a local navigation request to the
  resolved owner surface with work identity and focus, unavailable if that owner cannot be reached. Copy command
  is ui.work_panel.copy_command, a local clipboard request over the selected current command; clipboard refusal
  cannot report success. Open port reuses cmd.browser.open_workspace_preview with a
  server/environment-authoritative URL and CV-360 placement, never an assumed client localhost. A scheduled-row
  Cancel reuses cmd.chat.schedule_message.cancel with the exact schedule identity/revision and owner gates; it
  is not PID Stop and never enters WorkTarget. Rerun reuses cmd.terminal.rerun for a new invocation through the
  terminal owner, with an explicit new-session request when needed; Restart keeps cmd.work.restart for
  restartable live server/db/watcher work. Concept W.restart/W.stop adapters do not replace those native owner
  routes. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q13/CC5: the PM_WORK dock provider gives a live
  process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that
  thread’s dock projection. Key freshness by thread, work identity and run start/occurrence time; repaint or
  returning to the same run does not restart it, while a restarted/new occurrence gets a new lifetime. At
  elapsed >=60000 the non-needs line leaves. Needs-you lines bypass expiry and remain until the owning
  question/input is answered. One next-expiry timer requests a redraw; it owns no work, schedule or persisted
  state and expiry never stops/cancels/deletes work. Existing dock priority, at-most-three budget and transcript
  visibility gates remain; full work remains reachable through Activity and the panel. Q12 amends G4: every
  Project’s Resources includes This computer and Puppet Master’s own services, which are shared and belong to no
  individual Project, alongside that Project’s own servers. An empty Project says that nothing in this Project
  is running, above the shared rows; it does not look empty or report another Project’s work as its own. Shared
  machines show only environments with running work. Metadata/freshness is available on tab entry; the existing
  visible-only 2 s sampling owner remains. Permission, exact host/environment identity and stale disclosure
  remain authoritative; shared read scope creates no Stop/Restart/Stop all or service-control authority.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-255
- CS-106
unblocks: []
acceptance_criteria:
  - "The nine work/navigation command IDs match the closed schema enum and each has exactly one canonical production-intent handler."
  - "Navigation/view-local clear are distinguished from runtime mutations; no stop_all alias or delete-record Clear Finished appears."
  - "Existing terminal/owner/schedule routes preserve exact identities, and deferred Home/shortcut/event producers stay absent."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q13/CC5: the PM_WORK dock provider gives a live process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that thread’s dock projection. Key freshness by thread, work identity and run start/occurrence time; repaint or returning to the same run does not restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs line leaves. Needs-you lines bypass expiry and remain until the owning question/input is answered. One next-expiry timer requests a redraw; it owns no work, schedule or persisted state and expiry never stops/cancels/deletes work. Existing dock priority, at-most-three budget and transcript visibility gates remain; full work remains reachable through Activity and the panel. Q12 amends G4: every Project’s Resources includes This computer and Puppet Master’s own services, which are shared and belong to no individual Project, alongside that Project’s own servers. An empty Project says that nothing in this Project is running, above the shared rows; it does not look empty or report another Project’s work as its own. Shared machines show only environments with running work. Metadata/freshness is available on tab entry; the existing visible-only 2 s sampling owner remains. Permission, exact host/environment identity and stale disclosure remain authoritative; shared read scope creates no Stop/Restart/Stop all or service-control authority."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-255, ContractName:Plans/Commands_System.md#CS-106




### UCC-211 - Pip Editor And Settings Hosts

```yaml
plan_unit_id: UCC-211
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  S1–S9. ui.settings.pip_editor.open/close/replay are typed local no-write actions; Settings row, wand Pip…
  and title-bar Customize Pip… share one editor. Parts/presets and status-bar words use
  cmd.settings.transaction.preview/apply over their two admitted IDs. Wand census grows 195→196 with Pip…
  as a Settings disposition, no new capability or command. No editor inside onboarding, no Classic/master
  Pip/loader preference.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-239
- SSYS-056
- UCC-120
unblocks: []
acceptance_criteria:
- Exactly three Pip editor local actions dispatch no mutation, while part/preset changes use the Settings pair.
- Settings/wand/titlebar share one row/editor and the actual wand census contains Pip… as Settings, total 196.
- No editor inside onboarding, extra sound/master/loader setting or new chat capability command is admitted.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-239, ContractName:Plans/Settings_System.md#SSYS-056, ContractName:Plans/UI_Command_Catalog.md#UCC-120
