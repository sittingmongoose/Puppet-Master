# Shard 047: DL-218 companion dispatch bindings

Source: `Plans/Commands_System.md`

Source lines: L7999-L8247

Source SHA256: `5904d4146c13db64458e0b8b3069ab27d6690663f6f212455bc064e541d23aa9`

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
canonical_text: >-
  Hosted chat producers use UCC-208's closed mapping (DL-232). Dispatch normalizes
  cmd.editor.close_tab to cmd.panel_tab.close before gates and receipts; the alias has no handler.
  Domain openers use CV-360 placement and F3-634's one opening module; a child transcript remains
  cmd.agents.open_thread, not a chat-private open. Existing command identity, authorization,
  idempotency, typed results and effect rules do not change with the renderer. Pin History and Keep
  open are the existing ui.chat_column.pin_history and ui.chat_column.keep_open local actions, with no
  receipt or event; resize is the existing cmd.workspace_layout.resize_surface, committed once on
  release. An app-modal open, hover preview, disclosure or body redraw is local presentation. An
  admitted preference changed in chat uses the same cmd.settings.transaction.preview then
  cmd.settings.transaction.apply over its inventory id as Settings; application/project defaults never
  masquerade as the per-chat ELI5 command. A mirrored renderer value does not write a second store or
  echo the Settings save into a loop. No new event, command, alias or future handler is added by the
  port, and existing DL-218 command candidates retain their exact exclusions until separately
  admitted. The integrated concept at 59ca2d4382 realizes the Home opening and local-column controls
  through JavaScript bridges; it does not implement the native dispatcher or typed receipts specified
  here. Its existing Settings adapter persists Project default ELI5, while All chats remains
  session-only (SSYS-055); that session choice is not evidence of an application-scope transaction.
  Thought Stream's shared preference drives the chat's live thinking display (ACD-221, DL-234);
  opening or folding a thinking block is local presentation with no command, receipt or event. Demo
  Studio launches, lab-only document ids and unknown-id document fallback add no product command.
  Amended 2026-10-29 (PM7): W1–W9 (B1/B2/B6, S5, D5/D6/D8–D13, G4–G7): PM7 project box/shortcuts, Pip editor hosts, status work items, full Activity Detail, three-tab platform panel, work actions and quit join the exact command/local binding census. Only the two admitted Settings rows use preview/apply. F3-664/CS-106 govern owner scope; concept handlers/fixtures remain simulation, no native certification. Activity Pin is retired; History pin remains. Pip introduces a Settings editor, never a new chat capability.
gui_related: true
gui_classification_reason: Defines shared dispatch, alias normalization and local actions for the hosted chat controls.
split_recommended: false
depends_on: [DL-232, UCC-208, CS-100, CS-101, CS-103, DL-234]
unblocks: []
acceptance_criteria:
  - "Hosted producers preserve the existing handler, alias normalization and effect contract."
  - "Reverse preference projection emits no second command or Settings write."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
  - "Plans/Commands_System.md"
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
  - "cmd.editor.close_tab"
  - "cmd.panel_tab.close"
negative_constraints:
  - "Do not admit native handlers or events through concept JavaScript bridges."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/Commands_System.md"
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-208, ContractName:Plans/Wiring_Matrix.md#WM-096


### CS-105 - Project Box Dispatch And Shortcuts

```yaml
plan_unit_id: CS-105
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: B1/B2/B6. cmd.project.switch_active_tab and cmd.project.open_in_new_workspace_tab are canonical
  owner commands of the workspace/project router, not aliases of opening the menu. Stable project_id and current
  workspace identity/generation are required; stale/not-found/not-permitted refuse without changing the active
  tab. Ctrl+Shift+P binds typed local ui.project_switcher.open (registered ui.project_switcher.* prefix); .close
  restores opener focus. Ctrl/Cmd+Enter on a row chooses the new-workspace-tab command; keyboard/pointer send
  identical typed payloads. Opening/closing/filtering a picker does not dispatch a domain command. Existing
  project open/switch receipts and events stay owner-authoritative, no new event emission by these producers.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-236
unblocks: []
acceptance_criteria:
- The stated decision-tagged requirements are preserved by each named consumer; static checks do not certify
  native implementation.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
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
- cmd.project.switch_active_tab
- cmd.project.open_in_new_workspace_tab
- ui.project_switcher.open
- ui.project_switcher.close
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-236


### CS-106 - Work Action Contracts And Local Prefixes

```yaml
plan_unit_id: CS-106
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: |-
  D8–D13, G5–G7/G10. UCC-210 declares cmd.work.stop, cmd.work.restart, cmd.work.send_input, cmd.work.set_completion_delivery, cmd.work.clear_finished, cmd.work.quit, cmd.chat.processes.open, cmd.agents_and_processes.show and cmd.agents_and_processes.pop_out. Runtime commands bind project/server/environment, stable work/owner and process identity, expected projection/input generation, actor/permission and idempotency key, return an owner receipt or typed rejection, and never optimistically manufacture success. Unknown/stale/unavailable owner refuses. Navigation and view-local clear do not write runtime state or emit events. Stop all is cmd.work.stop with scope thread/platform and the reviewed target list, never a second handler; process-group semantics are EP-043/SIR-054. Input is current safe yes/no only; other input reveals terminal. Restart is eligible owner-controlled new invocation, no PID-only replay. Completion policy writes one owner value; delivery does not wake stopped threads. Quit defaults keep_running; stop_selected excludes services and binds the reviewed current target set.
  Registered local prefixes: ui.work_panel.* (close/select_tab/filter/sort/expand/select), ui.work_quit.* (select/cancel), ui.project_switcher.* (open/close), ui.settings.pip_editor.* (open/close/replay), plus ui.work_quit.open to draft the quit dialog. They write no durable/runtime state, carry return focus/scope and release timers/subscriptions/copies. cmd.work.clear_finished is a navigation_wrapper with view-local hiding, not record deletion. All settings hosts use preview/apply. No Home panel-tab command or panel shortcut in this build. ProcessFacts and command request/result/error fixtures are static contracts; new input/completion event candidates remain non-emitting until Event Authority.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-255
unblocks: []
acceptance_criteria:
- The stated decision-tagged requirements are preserved by each named consumer; static checks do not certify
  native implementation.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
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
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-255
