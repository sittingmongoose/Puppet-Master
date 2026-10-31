# Shard 047: DL-218 companion dispatch bindings

Source: `Plans/Commands_System.md`

Source lines: L8148-L8549

Source SHA256: `8b453470b6d81a82e0b6e88c0edb1047048762f4c681b47e7ee3a67631504e86`

---

## DL-218 companion dispatch bindings

The census and alias ruling are UCC-205 and UCC-206. Shared CV-333 command responses, closed owner errors, currentness, permissions and idempotency apply to every row below. Source availability stays handler_unavailable; the four new candidates and six existing questionnaire candidates render disabled command_not_registered under their exact exclusions. expected_event_types is empty. No native dispatcher or handler is asserted.

| Command | Sole future handler | Request → Result | Owner | Source surfaces |
|---|---|---|---|---|
| `cmd.collaboration.research_lead` | `handlers::collaboration::research_lead` | `CollaborationLeadResearchRequest` → `CollaborationLeadResearchResult` | `Plans/Collaborative_Workflows.md` | `workflow_card`, `workflow_panel`, `wonderer_workspace` |
| `cmd.questionnaire.draft_update` | `handlers::questionnaire::draft_update` | Existing section 7.4 questionnaire draft operation | `Plans/assistant-chat-design.md` | `questionnaire_card`, existing decision-review origins |
| `cmd.questionnaire.submit` | `handlers::questionnaire::submit` | Existing section 7.4 questionnaire round operation | `Plans/assistant-chat-design.md` | `questionnaire_card`, existing decision-review origins |
| `cmd.questionnaire.grill_me.wrap_up` | `handlers::questionnaire::grill_me_wrap_up` | `QuestionnaireGrillWrapUpRequest` → `QuestionnaireGrillWrapUpResult` | `Plans/assistant-chat-design.md` | `questionnaire_card` |
| `cmd.questionnaire.grill_me.confirm` | `handlers::questionnaire::grill_me_confirm` | `QuestionnaireGrillConfirmRequest` → `QuestionnaireGrillConfirmResult` | `Plans/assistant-chat-design.md` | `questionnaire_card` |
| `cmd.questionnaire.grill_me.keep_going` | `handlers::questionnaire::grill_me_keep_going` | `QuestionnaireGrillKeepGoingRequest` → `QuestionnaireGrillKeepGoingResult` | `Plans/assistant-chat-design.md` | `questionnaire_card` |

cmd.brainstorm.research_lead is compatibility-only, not a second primary dispatch row: normalize to cmd.collaboration.research_lead with the BrainStorm-only run check and UCC-205's one-to-one schema and source mapping before availability, permissions, currentness, idempotency and dispatch. The earlier CS-085 BrainStorm table row names this same canonical handler. Both spellings share the operation identity and original receipt on replay. An already in-flight lead returns its existing research operation without starting another attempt. BrainStorm/Crew synthesis closes further-pass and Check It admission with lead_admission_closed, binding its starting lead/research revision. Both alias-identical results require receipts, revision and currentness on committed success and a terminal evidence/reason outcome or observable running work. The research pair is in collaborative_workflows_contracts.schema.json; the new questionnaire pairs are in assistant_chat_contracts.schema.json. Numbering and recommendation seeding are presentation/draft operations and add no commands.

### CS-103 - Wonderer Research Alias And Grilling Session Dispatch

```yaml
plan_unit_id: CS-103
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  DL-218 binds cmd.collaboration.research_lead to handlers::collaboration::research_lead with
  CollaborationLeadResearchRequest and CollaborationLeadResearchResult. The old
  cmd.brainstorm.research_lead is a BrainStorm-only one-to-one compatibility alias, normalized
  before all gates and operation identity; it has no second handler. Both spellings coalesce an
  already in-flight lead research operation and refuse lead_admission_closed after BrainStorm/Crew
  synthesis starts. A committed success carries receipts, resulting revision and currentness and
  either terminal evidence/reason or observable running work. UCC-206 reuses questionnaire
  draft_update and submit for recommended drafts and accepting a round. The questionnaire_card
  session controls cmd.questionnaire.grill_me.wrap_up, cmd.questionnaire.grill_me.confirm and
  cmd.questionnaire.grill_me.keep_going bind respectively to
  handlers::questionnaire::grill_me_wrap_up, handlers::questionnaire::grill_me_confirm and
  handlers::questionnaire::grill_me_keep_going and their QuestionnaireGrillWrapUpRequest/Result,
  QuestionnaireGrillConfirmRequest/Result and QuestionnaireGrillKeepGoingRequest/Result pairs in
  Plans/assistant_chat_contracts.schema.json. Initial handler_unavailable and
  candidate_not_registered status is preserved, expected_event_types is empty pending DL-093, and
  CV-333 remains the command response owner. No draft or round submit confirms the accumulated
  agreement, and each session's explicit current user confirmation releases only the step that needs
  its new answers while running work continues.
gui_related: true
gui_classification_reason: Defines the visible controls and their owner behavior.
depends_on:
- UCC-205
- UCC-206
- ACD-503
unblocks: []
acceptance_criteria:
- One research operation serves both spellings with unchanged identity and replay.
- The three session controls have one named future handler each.
- Candidate availability and zero unregistered events remain truthful.
validation_surfaces:
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: collaboration_questionnaire_dispatch
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md DL-218"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DEFAULTS-APPROVED.md sha256:f199f188e3e4b1ecd5474a1bc2f87c2d5156863909eb9de9cc3ee9fcb7bfd5be"
preserved_exact_tokens:
- cmd.collaboration.research_lead
- cmd.brainstorm.research_lead
- handlers::collaboration::research_lead
- expected_event_types
negative_constraints:
- Do not create a second BrainStorm research handler or receipt.
- Do not treat handler names as runtime proof.
owner_hints:
- Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043


### CS-104 - Hosted Chat Dispatch And Local Actions

```yaml
plan_unit_id: CS-104
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: 'Hosted chat producers use UCC-208''s closed mapping (DL-232). Dispatch normalizes cmd.editor.close_tab
  to cmd.panel_tab.close before gates and receipts; the alias has no handler. Domain openers use CV-360 placement and
  F3-634''s one opening module; a child transcript remains cmd.agents.open_thread, not a chat-private open. Existing
  command identity, authorization, idempotency, typed results and effect rules do not change with the renderer. Pin History
  and Keep open are the existing ui.chat_column.pin_history and ui.chat_column.keep_open local actions, with no receipt
  or event; resize is the existing cmd.workspace_layout.resize_surface, committed once on release. An app-modal open,
  hover preview, disclosure or body redraw is local presentation. An admitted preference changed in chat uses the same
  cmd.settings.transaction.preview then cmd.settings.transaction.apply over its inventory id as Settings; application/project
  defaults never masquerade as the per-chat ELI5 command. A mirrored renderer value does not write a second store or
  echo the Settings save into a loop. No new event, command, alias or future handler is added by the port, and existing
  DL-218 command candidates retain their exact exclusions until separately admitted. The integrated concept at 59ca2d4382
  realizes the Home opening and local-column controls through JavaScript bridges; it does not implement the native dispatcher
  or typed receipts specified here. Its existing Settings adapter persists Project default ELI5, while All chats remains
  session-only (SSYS-055); that session choice is not evidence of an application-scope transaction. Thought Stream''s
  shared preference drives the chat''s live thinking display (ACD-221, DL-234); opening or folding a thinking block is
  local presentation with no command, receipt or event. PM7 S5/G1–G3: hosted chat adds the one Pip editor’s typed no-write
  open/close/replay; admitted parts edit the existing Settings pair. G1 B (Jared 2026-10-30) restores ui.activity_detail.pin
  as a typed view-local boolean action; History pin/Keep open remain local, and resizing uses the existing layout command.
  CS-105/106 own the newly admitted project/work commands. DL-259 FS-1, 2026-10-31, supersedes Q17’s dimming: hover/focus
  emphasis begins only at an actual control in its affects region, including an embedded plate control; plain text, empty
  space and the picture alone trigger none. Affected marks take a one-pixel theme accent ring, with the shared soft glow
  in Glass and ink in NieR; their connecting lines and the job-card edge take accent, and the linked read-back takes
  the shared wash. Hover/focus never lowers another cast part’s opacity or recolours a Pip body, seat or label; each
  retains its intrinsic colours. Genuine owner-state quietness remains independent of hover. Scheduled emphasises only
  a row/mark with a drawn partner and never dims unrelated marks. Keyboard focus uses the same emphasis, Reduced Motion
  settles it instantly, and emphasis changes no layout or owner state. One shared affects/partner owner serves every
  sheet; there is no per-sheet hover engine. Q15: the menu head and trigger use the same registry wand with the same
  rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the glyph’s
  role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or fallback icon. Q16:
  You is the person alone, head and shoulders in each family’s materials and small-size maps. It carries no marionette
  cross, strings, holding arm/control or connection to a cross, and is never an agent Pip. Diagram edges to You express
  the plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou drawer serves crew diagrams, cast plates,
  run cards and rosters. Optional agent strings and the single Pip primitive retain their existing meaning.'
gui_related: true
gui_classification_reason: Defines shared dispatch, alias normalization and local actions for the hosted chat
  controls.
split_recommended: false
depends_on:
- DL-232
- UCC-208
- CS-100
- CS-101
- CS-103
- DL-234
unblocks: []
acceptance_criteria:
- Hosted producers preserve the existing handler, alias normalization and effect contract.
- Reverse preference projection emits no second command or Settings write.
- 'DL-259 FS-1, 2026-10-31, supersedes Q17’s dimming: hover/focus emphasis begins only at an actual control in its affects
  region, including an embedded plate control; plain text, empty space and the picture alone trigger none. Affected marks
  take a one-pixel theme accent ring, with the shared soft glow in Glass and ink in NieR; their connecting lines and
  the job-card edge take accent, and the linked read-back takes the shared wash. Hover/focus never lowers another cast
  part’s opacity or recolours a Pip body, seat or label; each retains its intrinsic colours. Genuine owner-state quietness
  remains independent of hover. Scheduled emphasises only a row/mark with a drawn partner and never dims unrelated marks.
  Keyboard focus uses the same emphasis, Reduced Motion settles it instantly, and emphasis changes no layout or owner
  state. One shared affects/partner owner serves every sheet; there is no per-sheet hover engine. Q15: the menu head
  and trigger use the same registry wand with the same rod/star/sparkle ink roles. Pip and that wand remain the head’s
  own children so a wrapper cannot discard the glyph’s role-specific colours. The sign’s kind glyph matches its sheet
  head; do not fork a second wand or fallback icon. Q16: You is the person alone, head and shoulders in each family’s
  materials and small-size maps. It carries no marionette cross, strings, holding arm/control or connection to a cross,
  and is never an agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou
  drawer serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and the single Pip primitive
  retain their existing meaning.'
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
- Plans/Commands_System.md
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
- /mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/integrated-behavior-59ca2d4382.md, SHA-256
  108510ec4a80a24dc8a3fe05d7c45ebb7632934cd5b36bfd4edb3f01f833c649 (lead integration brief, corroborated against concept
  source; not native or final visual verification)
- 'PM7 final FS-1: chatpip fc1aa3f503 / deliverable 8ae180658e; pmx-system generatedCss and scheduling linkStyle are
  source evidence, not native APIs.'
preserved_exact_tokens:
- cmd.editor.close_tab
- cmd.panel_tab.close
negative_constraints:
- Do not admit native handlers or events through concept JavaScript bridges.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Commands_System.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-208, ContractName:Plans/Wiring_Matrix.md#WM-096


### CS-105 - Project Box Dispatch And Shortcuts

```yaml
plan_unit_id: CS-105
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  B1/B2/B6. cmd.project.switch_active_tab and cmd.project.open_in_new_workspace_tab are canonical owner
  commands of the workspace/project router, not aliases of opening the menu. Stable project_id and current
  workspace identity/generation are required; stale/not-found/not-permitted refuse without changing the
  active tab. Ctrl+Shift+P binds typed local ui.project_switcher.open (registered ui.project_switcher.*
  prefix); ui.project_switcher.close restores opener focus. Ctrl/Cmd+Enter on a row chooses the new-workspace-tab command;
  keyboard/pointer send identical typed payloads. Opening/closing/filtering a picker does not dispatch a
  domain command. Existing project open/switch receipts and events stay owner-authoritative, no new event
  emission by these producers.
  B2, PM7 companion review fix1, 2026-10-30: ui.project_switcher.all_projects is the no-write route to the
  existing Projects primary view; it does not dispatch the side-panel switch command.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-236
- SMPFS-083
- UCC-013
unblocks: []
acceptance_criteria:
- Two Project commands resolve one workspace owner with stable project/workspace identity and currentness rejection.
- Ctrl+Shift+P/open/close/All projects are typed local menu/page actions; Ctrl/Cmd+Enter dispatches the new-workspace
  command.
- Keyboard/pointer requests match and menu visibility emits no runtime event or duplicate lifecycle.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Commands_System.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
preserved_exact_tokens:
- ui.project_switcher.all_projects
- cmd.project.switch_active_tab
- cmd.project.open_in_new_workspace_tab
- ui.project_switcher.open
- ui.project_switcher.close
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-236, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-083, ContractName:Plans/UI_Command_Catalog.md#UCC-013




### CS-106 - Work Action Contracts And Local Prefixes

```yaml
plan_unit_id: CS-106
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: 'D8–D13, G5–G7/G10. UCC-210 declares cmd.work.stop, cmd.work.restart, cmd.work.send_input, cmd.work.set_completion_delivery,
  cmd.work.clear_finished, cmd.work.quit, cmd.chat.processes.open, cmd.agents_and_processes.show and cmd.agents_and_processes.pop_out.
  Runtime commands bind project/server/environment, stable work/owner and process identity, expected projection/input
  generation, actor/permission and idempotency key, return an owner receipt or typed rejection, and never optimistically
  manufacture success. Unknown/stale/unavailable owner refuses. Navigation and view-local clear do not write runtime
  state or emit events. Stop all is cmd.work.stop with scope thread/platform and the reviewed target list, never a second
  handler; process-group semantics are EP-043/SIR-054. Input is current safe yes/no only; other input reveals terminal.
  Restart is eligible owner-controlled new invocation, no PID-only replay. Completion policy writes one owner value;
  delivery does not wake stopped threads. Quit defaults keep_running; stop_selected excludes services and binds the reviewed
  current target set. Registered local prefixes: ui.work_panel.* (close/select_tab/filter/sort/expand/select), ui.work_quit.*
  (select/cancel), ui.project_switcher.* (open/close), ui.settings.pip_editor.* (open/close/replay), plus ui.work_quit.open
  to draft the quit dialog. They write no durable/runtime state, carry return focus/scope and release timers/subscriptions/copies.
  cmd.work.clear_finished is a navigation_wrapper with view-local hiding, not record deletion. All settings hosts use
  preview/apply. No Home panel-tab command or panel shortcut in this build. ProcessFacts and command request/result/error
  fixtures are static contracts; new input/completion event candidates remain non-emitting until Event Authority. B2:
  ui.project_switcher.all_projects is the typed local action that focuses the existing Projects page route tab_id projects.
  It never misuses cmd.panel.switch, which is only a rail side-panel shell action. D10/D13/G4: Requests carry explicit
  scope_kind under the existing application/project policy. Quit and platform Stop all are application-scoped with project_id
  null; thread Processes is project-scoped with a real Project. A global panel or local editor/navigation action works
  without an active Project. Every reviewed target still carries its actual Project/server/environment and current owner
  permission. Dispatch verifies source/target scope rather than inferring a default Project; a mismatch refuses before
  effects. This adds no Settings store or event family. G1 B (Jared 2026-10-30): Pin/unpin is the view-local ui.activity_detail.pin
  action (binding chat.activity.pin), default false. Pinned Activity Detail stays open across thread switches and reprojects
  the selected thread’s data; unpinned detail closes on a thread switch. Pin changes lifetime only: one full-size docked-or-full-height-cover
  view, no small form. A switch cancels stale subscriptions and never leaves the previous thread’s rows/actions in the
  new thread. A missing domain shows its truthful empty/unavailable state. Pin is session view state, not a Settings
  row, durable layout field or runtime mutation. D11/G4, PM7 Step4, 2026-10-30: System status is a small read-only overlay
  popover, reached from the existing status-bar System status item and the Processes System services link. ui.system_status.open
  and ui.system_status.close are typed local visibility actions, with statusbar.system_status, work.open_system_status
  and system_status.close binding families. Service owner links use the existing ui.settings.route.open action and system_status.service.open_settings
  binding, selecting code.editing.lsp-server-catalog for language servers, system.mcp.server-list for MCP servers or
  web.index.enable for the search index. They open Settings and reveal the owner row without writing a value or controlling
  a service. The popover has close/Escape/outside closure, return focus and the common overlay/Glass plate; unavailable
  owner navigation says why. System status open/close and owner-Settings navigation carry the same explicit source scope,
  view and return-focus identity as other no-write local actions. G6 Clear finished is a Processes-view action; it never
  clears finished agents. Concept thread Stop all reviews processes/scheduled runs, while platform Stop all may include
  agents after review; the canonical cmd.work.stop identity and per-owner permission/identity checks remain. D2/D7, PM7
  Step4 final-source alignment, 2026-10-30: cmd.chat.processes.open accepts optional work_id for a dock Review/Show route
  selecting one process or scheduled row. A bar open may omit it. Resolve that ID only within the signed Project/thread
  scope and current expected generation; missing, stale or foreign selection cannot retarget to a title match or another
  thread. This remains navigation with no process effect. Agent dock Review selects its existing Subagents detail locally
  and never opens a child transcript by this route. D7/D8/D13, PM7 companion review fix1, 2026-10-30 (Astra A2/A3): work.open_owner
  is ui.work_panel.select with an owner-row value, owner_id, destination agents|subagents, invoking view and focus; Subagents
  also binds its exact thread_id. It never opens a transcript. Actual Open thread uses cmd.chat.open_thread for the item’s
  bound Assistant thread; actual Open surface is ui.work_panel.open_surface, a local navigation request to the resolved
  owner surface with work identity and focus, unavailable if that owner cannot be reached. Copy command is ui.work_panel.copy_command,
  a local clipboard request over the selected current command; clipboard refusal cannot report success. Open port reuses
  cmd.browser.open_workspace_preview with a server/environment-authoritative URL and CV-360 placement, never an assumed
  client localhost. A scheduled-row Cancel reuses cmd.chat.schedule_message.cancel with the exact schedule identity/revision
  and owner gates; it is not PID Stop and never enters WorkTarget. Rerun reuses cmd.terminal.rerun for a new invocation
  through the terminal owner, with an explicit new-session request when needed; Restart keeps cmd.work.restart for restartable
  live server/db/watcher work. Concept W.restart/W.stop adapters do not replace those native owner routes. G4/D7/D10,
  PM7 companion review fix1, 2026-10-30 (Astra A4): local_action_request requires a closed action-specific value. select_tab
  is agents|processes|resources. sort is {column: title|rank|time|cpu|mem|ports|where, direction: -1|1}. filter distinguishes
  owner, agent_group and process_grouping; expand distinguishes item, subagents and group plus boolean expanded. select
  distinguishes an item work_id from owner_id with destination agents|subagents; exact thread_id is required for Subagents.
  Quit draft selection is one closed choice keep_running|stop_selected, one work_id/expected_generation/selected checkbox,
  or the Stop-list scope procs|all. Missing values, unknown fields, arbitrary enums and cross-branch fields refuse before
  view or owner effects. Pin and System status retain their separate restrictions. None of these draft/view changes creates
  a runtime mutation or saved setting. D7/D8/D13, PM7 final-review direct correction, 2026-10-30 (Astra r2 N1): reused-owner
  Touch routes retain separate contracts, never PM7 command_result. Browser open and Terminal rerun retain UCC-063/UCC-201
  catalog payload contracts and the existing CV-333 UICommandResponse v2 projection/error/receipt; their per-command
  identity fence checks common dispatch identity only, not an uncompiled owner request body or terminal effect. Scheduling
  Cancel directly consumes ScheduledMessageCancelRequest and ScheduledMessageCancelResult plus the scheduling owner’s
  closed error code. Its admitted source_surface vocabulary is unchanged; Work delegates to the scheduling-owned cancellation
  context rather than inventing a source or PID target. Precise per-command profiles and fixtures bind these distinctions;
  no owner adopts a new PM7 result. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q13/CC5: the PM_WORK dock provider
  gives a live process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that
  thread’s dock projection. Key freshness by thread, work identity and run start/occurrence time; repaint or returning
  to the same run does not restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs
  line leaves. Needs-you lines bypass expiry and remain until the owning question/input is answered. One next-expiry
  timer requests a redraw; it owns no work, schedule or persisted state and expiry never stops/cancels/deletes work.
  Existing dock priority, at-most-three budget and transcript visibility gates remain; full work remains reachable through
  Activity and the panel. Q12 amends G4: every Project’s Resources includes This computer and Puppet Master’s own services,
  which are shared and belong to no individual Project, alongside that Project’s own servers. An empty Project says that
  nothing in this Project is running, above the shared rows; it does not look empty or report another Project’s work
  as its own. Shared machines show only environments with running work. Metadata/freshness is available on tab entry;
  the existing visible-only 2 s sampling owner remains. Permission, exact host/environment identity and stale disclosure
  remain authoritative; shared read scope creates no Stop/Restart/Stop all or service-control authority.'
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-255
- SIR-054
- EP-043
unblocks: []
acceptance_criteria:
- Every command has one sole handler and closed typed request/result; explicit source scope, target owner/permission/storage/currentness
  reject before effects, including application controls with no active Project.
- Stop all reuses cmd.work.stop; pid/start/group/descendant targeting and 3 s grace are enforced by the owner.
- Prompt input is current safe yes/no only, quit defaults keep-running, clear is view-local and candidate events remain
  non-emitting.
- All declared local prefixes write no runtime state and release focus/subscriptions/copies on close.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q13/CC5: the PM_WORK dock provider gives a live process and
  the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that thread’s dock projection.
  Key freshness by thread, work identity and run start/occurrence time; repaint or returning to the same run does not
  restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs line leaves. Needs-you
  lines bypass expiry and remain until the owning question/input is answered. One next-expiry timer requests a redraw;
  it owns no work, schedule or persisted state and expiry never stops/cancels/deletes work. Existing dock priority, at-most-three
  budget and transcript visibility gates remain; full work remains reachable through Activity and the panel. Q12 amends
  G4: every Project’s Resources includes This computer and Puppet Master’s own services, which are shared and belong
  to no individual Project, alongside that Project’s own servers. An empty Project says that nothing in this Project
  is running, above the shared rows; it does not look empty or report another Project’s work as its own. Shared machines
  show only environments with running work. Metadata/freshness is available on tab entry; the existing visible-only 2
  s sampling owner remains. Permission, exact host/environment identity and stale disclosure remain authoritative; shared
  read scope creates no Stop/Restart/Stop all or service-control authority.'
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Commands_System.md
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
- Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-255, ContractName:Plans/Shared_Integration_Runtime.md#SIR-054, ContractName:Plans/Executor_Protocol.md#EP-043




Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.
