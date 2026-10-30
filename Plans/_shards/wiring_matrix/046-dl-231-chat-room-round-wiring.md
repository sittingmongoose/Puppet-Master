# Shard 046: DL-231 Chat Room round wiring

Source: `Plans/Wiring_Matrix.md`

Source lines: L6482-L6798

Source SHA256: `a1bcd353fe2e9b33c3f364ff4e8b31ff8e1e401304c1816b7df50b0a2831ffde`

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
  The hosted 5.6 Pro chat reuses the production-intent rows of its existing commands under UCC-208 and UIW-044
  (DL-232). catalog.agents_open_thread includes the chat's Activity Detail transcript action, live child card
  and working-activity child openers; the preview row itself still opens Activity Detail. catalog.terminal_open
  and catalog.terminal_rerun cover the compact card's Open in Terminal and Rerun in Terminal under ACD-502,
  preserving exact-session behavior and candidate limits from UCC-201. terminal.mark_menu.open_output also
  covers the compact card's View output and View output log through the same kept read-only editor-buffer open;
  its location names both producers. catalog.terminal_show and catalog.terminal_focus keep their existing
  other-surface producers; neither gains a compact-card control. assistant.redesign.cmd.chat_plan_open_version
  retains exact-version Plan opening; assistant.redesign.w_051.chat_eli5_set retains only the per-chat override
  producers, with application/project defaults written by Settings. home.tab.close uses cmd.panel_tab.close,
  with cmd.editor.close_tab as its alias; host close/activate updates the chat without another dispatch.
  home.chat.activity_toggle and home.more_options.chat_visibility keep cmd.panel.switch, and home.resizer.chat
  keeps cmd.workspace_layout.resize_surface. History pin and Keep open stay their existing typed-local
  exclusions, never duplicate production rows. The port changes producer locations and acceptance checks in
  Plans/Wiring_Matrix.production.json only; it adds no command, handler, physical storage family, EventRecord or
  claim of native readiness. Every row's planned-handler and unavailable-candidate boundary remains in force.
  Settings preferences use the existing Settings transaction rows, not one synthetic row per preference. The
  hosted surface's boot, body mounting and appearance projection are local presentation with no command or
  event. Demo Studio is wholly outside production wiring (DR-070), not a wiring disposition. These rows remain
  product wiring requirements. Integrated concept 59ca2d4382 supplies Home open/close/activate bridges, not
  native handler evidence. Run-card controls move to the run view only while its tab is active in a panel that
  is visible, including narrow-switcher and collapsed-panel state. Browser capture must retain the original
  thread and composer destination; context-tab actions use that tab's thread; attachment viewers retain
  thread/message/attachment identity. More Info now has the bounded-popover producer required by ACD-500, so the
  earlier modal gap is closed in the concept. Project ELI5 is persisted through the existing adapter; All chats
  ELI5 is session-only. The production-intent ELI5 acceptance row records that limitation without claiming its
  application-scope route is built. Astra's round-2 concept check confirms isolated browser delivery retains its
  destination, but composer attachment, list and insertion can lose that destination after the origin composer
  changes. Those paths still require restoring the saved destination or refusing a mismatch before draft
  mutation; the original thread alone is not sufficient reverse coverage. PM7 W4/W6/W7: hosted chat adds Pip
  editor producers through the existing Settings pair and the conditional Processes domain through UCC-210.
  Existing file/terminal/thread routes retain exact identity; no private opener or small Activity Detail
  returns. G1 B (Jared 2026-10-30) restores the view-local ui.activity_detail.pin / chat.activity.pin contract:
  pinned detail follows the new thread across switches, and unpinned detail closes on a switch. QA round 2,
  Jared 2026-10-30; DL-258; GUI 7d586bad18: Q17: hover-to-light/dimming starts only from an actual control
  inside its affects region (button, input, select, textarea, label, link, switch/radio/checkbox/tab/slider/spinbutton/combobox semantics, or editable text). Plain
  words, empty section space and the plate picture do not dim the cast. Keyboard focus on a control gives the
  same feedback; a plate-embedded control remains eligible. Scheduled highlights only rows/marks with a real
  partner on its plate; markless rows dim nothing. One affectsOf/linkStyle owner supplies this behavior, with no
  per-sheet hover engine. Q15: the menu head and trigger use the same registry wand with the same
  rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the
  glyph’s role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or
  fallback icon. Q16: You is the person alone, head and shoulders in each family’s materials and small-size
  maps. It carries no marionette cross, strings, holding arm/control or connection to a cross, and is never an
  agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. The one
  ppYou/PX_YOU/pnYou drawer serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and
  the single Pip primitive retain their existing meaning.
gui_related: true
gui_classification_reason: Binds hosted chat producers to existing wiring rows and their reverse GUI consumers.
split_recommended: false
depends_on:
- DL-232
- UCC-208
- UIW-044
- WM-090
- WM-091
- WM-092
- WM-094
- WM-095
unblocks: []
acceptance_criteria:
  - "The changed production-intent entries identify the hosted producers and retain their existing commands and handlers."
  - "No duplicate rows are added for local History pin, Keep open, modal opening or concept demos."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q17: hover-to-light/dimming starts only from an actual control inside its affects region (button, input, select, textarea, label, link, switch/radio/checkbox/tab/slider/spinbutton/combobox semantics, or editable text). Plain words, empty section space and the plate picture do not dim the cast. Keyboard focus on a control gives the same feedback; a plate-embedded control remains eligible. Scheduled highlights only rows/marks with a real partner on its plate; markless rows dim nothing. One affectsOf/linkStyle owner supplies this behavior, with no per-sheet hover engine. Q15: the menu head and trigger use the same registry wand with the same rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the glyph’s role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or fallback icon. Q16: You is the person alone, head and shoulders in each family’s materials and small-size maps. It carries no marionette cross, strings, holding arm/control or connection to a cross, and is never an agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou drawer serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and the single Pip primitive retain their existing meaning."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
- Plans/Wiring_Matrix.md
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
- /mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/capture-destination-r2-gap.md,
  SHA-256 9f8937823eeac12174ab07a023a4c3d5b867bf94b498e99e5b96aeaafb691208 (Astra round-2 verified composer
  destination gap; corrects the broad integrated capture claim)
preserved_exact_tokens:
- Demo Studio
- Keep open
negative_constraints:
- Do not remove DL-218 exclusions or assert native proof from the port.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/UI_Command_Catalog.md#UCC-208, ContractName:Plans/UI_Wiring_Rules.md#UIW-044


### WM-097 - PM7 Project Pip And Work Control Closure

```yaml
plan_unit_id: WM-097
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  B1/B2/B6, S1–S9, D1–D14, G1–G10. pm7_control_bindings.json enumerates project-box rows/keys,
  statusbar.agents/processes, Agents/Processes/Resources tabs and view controls, thread Processes,
  stop/restart/input/delivery/clear/quit, and the one Pip editor/entry hosts. Command rows resolve
  production-intent wiring and typed owner payload/availability/permission/error/receipt contracts; local rows
  resolve declared no-write actions with focus return and teardown. Stop all shares cmd.work.stop. Existing
  terminal/owner/schedule/Settings routes are reused. New event candidates do not emit. Counts are
  derived/pinned together in companions; partial native evidence remains partial. Decorative brand/loader are
  excluded because they are not controls. D10/D13/G4: Each production row has command-specific locations and
  falsifiable effect checks. Request/source scope pairing is explicit: application scope has project_id null,
  project scope has a real Project, and platform target permissions remain per owner. Null is never permission
  to substitute an active/default Project. Local action requests preserve the same source scope without
  persistence. G1 B, Jared 2026-10-30: chat.activity.pin binds ui.activity_detail.pin, with thread_id, boolean
  pinned, view/scope/focus identity and one Touch reverse consumer. It is an explicit local wiring disposition
  with no production mutation row. Thread-switch coverage requires pinned follow-new-thread and unpinned close,
  including teardown and stale-action rejection. D11/G4, PM7 Step4, 2026-10-30: System status is a small
  read-only overlay popover, reached from the existing status-bar System status item and the Processes System
  services link. ui.system_status.open and ui.system_status.close are typed local visibility actions, with
  statusbar.system_status, work.open_system_status and system_status.close binding families. Service owner links
  use the existing ui.settings.route.open action and system_status.service.open_settings binding, selecting
  code.editing.lsp-server-catalog for language servers, system.mcp.server-list for MCP servers or
  web.index.enable for the search index. They open Settings and reveal the owner row without writing a value or
  controlling a service. The popover has close/Escape/outside closure, return focus and the common overlay/Glass
  plate; unavailable owner navigation says why. Each new PM7 binding carries concept_sources path/token anchors
  for its actual GUI adapter. Sources use PM_PROJECT_BOX/PM_TB_DENSITY for project controls, PM7_WORK_UI/PM_WORK
  for work, PM_PIP_EDITOR and the shared parts registry for Pip, and the existing Settings reveal route for
  System status owner links. No JavaScript adapter is native command/effect proof. W6 identity mapping: PM_WORK
  item delivery maps to completion_delivery, restarting maps to pending with Restarting words, and its
  clearFinished platform/thread:<id> views map to the invoking view. canSendInput/answer are concept projections
  of current prompt eligibility and owner answers; native process identity, generation, permission, yes/no-only
  stdin and read-only-service gates remain unchanged. D2/D7, PM7 Step4 final-source alignment, 2026-10-30
  (integration e9b15abc64): chat.work_dock.process_open maps Review/Show to existing pm7.processes_open /
  cmd.chat.processes.open. chat.work_dock.agent_review records ordinary local Subagents row selection with no
  command or new action ID. Both source-anchor work-dock-review in activity-panel.js and preserve exact
  selected-thread/work identity. Existing work controls are reused in rail/Home shared rows; Resources Time
  reuses ui.work_panel.sort. No new production row or Touch action is created by these producers; the Q22 census
  has 479 records, with 61 source-anchored producer families after QA2 family-control alignment; the three
  retired checkbox rows remain non_dispatch tombstones. D7/D8/D13, PM7 companion review fix1, 2026-10-30: the
  reverse work-detail census discovers emitted data-work-act values and act.* button labels, including both goto
  destinations and scheduled Cancel versus process Stop, and requires their binding/owner dispositions. It
  covers Copy command, Open port, Rerun, actual Open thread/Open surface and local owner selection; forward
  token counts alone are not closure. Existing owner commands receive producer/Touch coverage, never a new
  native handler or evidence promotion. D7/D8/D13, PM7 final-review direct correction, 2026-10-30 (Astra r2
  N1/N2): TCP-PM7-BROWSER-OPEN, TCP-PM7-SCHEDULE-CANCEL and TCP-PM7-TERMINAL-RERUN replace the incorrect
  reused-command assignment to TCP-PM7-WORK. Their request/result/error/receipt refs stay with the actual
  owners, with command-identity fences and explicit catalog-only request-body limits. All 715 Touch rows now use
  140 profiles; command/binding counts are unchanged. cmd.chat.open_thread retains one owner and one row:
  consumer rules require a Teacher/help target and Settings return only for its Teacher Settings producer; Work
  accepts its ordinary bound Assistant thread and returns to the exact invoking Work view/focus. Wrong-owner
  request/result, non-Teacher Work and per-consumer return cases are focused requirements, not native dispatch
  evidence. G2/F3-1, Jared follow-ups 2026-10-30: static presentation companions exercise widen-first, the 360
  px docking/squeeze threshold and full-height-cover fallback, plus bell/theme-menu-resting-top placement on
  every page, the lead’s open-inbox push exception and the entry/exit click guard. F3-5/F3-6, final GUI
  5abe285507, adds every-page/Usage first-mount and leaving-card pass-through plus inbox resting-height
  measurement after owner open/reopen, content/height updates and resize, and offset removal on close.
  Notification body/action/dismiss bindings keep their owner contracts and record the transient no-dispatch
  gate; static cases and actual pure-helper probes remain distinct from native or rendered evidence. No
  control-clearance or chat-head placement rule, new binding, command, event, setting or native certification is
  introduced. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q13/CC5: the PM_WORK dock provider gives a
  live process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that
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
- UCC-209
- UCC-210
- UCC-211
- UIW-045
unblocks: []
acceptance_criteria:
  - "Every one of 468 binding families resolves its declared command/local disposition with unique control identity and valid Settings IDs."
  - "All eleven new production-intent rows have typed requests/results/availability/accessibility/effect evidence requirements and one handler."
  - "Touch covers each admitted action once; Stop all and all reused terminal/Settings routes retain their owner identity without native-certification promotion."
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
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- "/mnt/Cursor/share/puppet-master/2026-10-29-pm7-build-decisions/README.md — Jared's answers (2026-10-30)"
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-255, ContractName:Plans/UI_Command_Catalog.md#UCC-209, ContractName:Plans/UI_Command_Catalog.md#UCC-210, ContractName:Plans/UI_Command_Catalog.md#UCC-211, ContractName:Plans/UI_Wiring_Rules.md#UIW-045




Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.


QA2 owner amendment (2026-10-30; DL-258; integration 7d586bad18): current requirements in this document’s amended units take precedence over earlier presentation descriptions. Q6/Q7: point to the actual backup before asking to unlock it. A Recovery Kit is an untrusted locator plus protected recovery credential, not a storage place, backup payload, NAS password or cloud sign-in. Offer the Kit first, then the explicit no-Kit path to a folder, another device/NAS, or a cloud service. Continue waits for the selected file/folder/device/account and required fields. Validate the locator/trust and reach/authenticate the selected place through its existing owner. An accepted Kit may unlock that backup, but cannot bypass storage authentication. Show Unlock the backup only for a still-locked backup without an accepted unlock; name its selected place. Select a copy, coverage and preview only afterwards. Repointing invalidates the former unlock and snapshot selection. Owner recovery prerequisites, approval, protected secret handling and actual restore/Project commit boundaries remain mandatory; a concept Kit or seed never proves native unlock or restore. H5: the onboarding owner holds one original inert-state basis for the entire open lifetime. Replacing an already-open screen acquires only newly encountered background nodes; it never re-snapshots nodes already held by that modal as originally inert. Every close/finish/skip path removes only the modal’s own holds, preserves pre-existing inert nodes and restores focus/input. H1: explicit lab open({screen}) invokes the screen owner’s seed(S), filling only missing fixture prerequisites; seed:false opts out. Connect/NAS/online fixtures have coherent identities, trust/key/source/sign-in examples. Seeds and seedCommit are lab-only: no native Project receipt, authentication, permission or completed owner work is inferred, no selected live input is overwritten, and no new product action/DTO field is admitted. Q1/Q2: onboarding sound defaults on under general.interaction.sound-effects, through the existing one player and trusted-gesture gate. No verified readable Project snapshot means an unbound preview: retain the factory-on choice or the person’s current visit choice rather than muting it on each refresh. An explicit readable Project value wins when it binds; a genuinely refused bound write remains refused. No Project value, credential, second mute key or durable sound preference is fabricated from an unreadable preview. Q17: hover-to-light/dimming starts only from an actual control inside its affects region (button, input, select, textarea, label, link, switch/radio/checkbox/tab/slider/spinbutton/combobox semantics, or editable text). Plain words, empty section space and the plate picture do not dim the cast. Keyboard focus on a control gives the same feedback; a plate-embedded control remains eligible. Scheduled highlights only rows/marks with a real partner on its plate; markless rows dim nothing. One affectsOf/linkStyle owner supplies this behavior, with no per-sheet hover engine. Q15: the menu head and trigger use the same registry wand with the same rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the glyph’s role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or fallback icon. Q16: You is the person alone, head and shoulders in each family’s materials and small-size maps. It carries no marionette cross, strings, holding arm/control or connection to a cross, and is never an agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou drawer serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and the single Pip primitive retain their existing meaning. Q13/CC5: the PM_WORK dock provider gives a live process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that thread’s dock projection. Key freshness by thread, work identity and run start/occurrence time; repaint or returning to the same run does not restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs line leaves. Needs-you lines bypass expiry and remain until the owning question/input is answered. One next-expiry timer requests a redraw; it owns no work, schedule or persisted state and expiry never stops/cancels/deletes work. Existing dock priority, at-most-three budget and transcript visibility gates remain; full work remains reachable through Activity and the panel. Q12 amends G4: every Project’s Resources includes This computer and Puppet Master’s own services, which are shared and belong to no individual Project, alongside that Project’s own servers. An empty Project says that nothing in this Project is running, above the shared rows; it does not look empty or report another Project’s work as its own. Shared machines show only environments with running work. Metadata/freshness is available on tab entry; the existing visible-only 2 s sampling owner remains. Permission, exact host/environment identity and stale disclosure remain authoritative; shared read scope creates no Stop/Restart/Stop all or service-control authority.
