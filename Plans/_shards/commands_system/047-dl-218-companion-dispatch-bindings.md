# Shard 047: DL-218 companion dispatch bindings

Source: `Plans/Commands_System.md`

Source lines: L8001-L8222

Source SHA256: `3e0e4494a8c7b306f843b8d32ceb1cc5bc2ab442b5a6a495669be42b65fa2c58`

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

### CS-107 - DL-270 Storage Profile Command Boundary

DL-270 (Plans/Decision_Log.md#DL-270, 2026-10-31) adds one User Command, `cmd.chat.load_older`, and no reserved prefix. It also rules what the command layer says about three other things, so no surface invents a second route.

**Command-line reads.** `pm db dump`, `pm inspect`, `pm tail` and `pm export` (JSON or JSONL on request; optional `pm export --sqlite`, Plans/storage-plan.md#SP-339) are command-line reads of the product. They are not User Commands or UICommands and mint no `cmd.*` id, catalog row or production-wiring row, because no UI control dispatches them. UCC-212 holds their disposition table. The storage command gate above governs UICommand dispatch; these verbs sit outside it, so SP-339 owns their read semantics. The in-app record inspector is a read-only `record` tab opened through the existing `cmd.storage.open_value`; DL-270 adds no in-app export control and no new command for it.

**Reclaim.** The reclaim action in storage health (Plans/storage-plan.md#SP-340) is the existing `cmd.storage.compaction.request`: one owner-routed maintenance request for the whole storage instance, with results shown per storage group. Writer posture, permission and the maintenance lease are required, and dispatch never compacts inline. There is no `cmd.storage.reclaim`. "Store compaction" is redb `compact()`, "segment repack" is seglog's seal-time repack, and "conversation compaction" is summaries and context; this unit uses those words only. Per-group disk budgets are owned by SP-340 and add no command here.

**Load older.** `cmd.chat.load_older` is registered in Plans/UI_Command_Catalog.md#UCC-212 as a `shell_view` command with the sole handler `handlers::chat::load_older`, arguments `thread_id` and `before_page_ref`, and the disabled reasons `stale_projection` and `degraded`. One request reads the next older sealed 50-item page of one thread from the render-page store (Plans/assistant-chat-design.md#ACD-242, Plans/storage-plan.md#SP-338). It writes nothing and records a no-persist command receipt. Scrolling near the top dispatches it by itself, and a "Load 50 older" row stays as the fallback. Opening a thread never replays its events and is not this command. There is no `ui.chat_thread.*` prefix.

**Usage detail retention.** No retention window and no `cmd.storage.compaction.request` removes `usage.event` records beyond the Keep usage history for setting (`ai.usage.usage-retention`); daily usage totals are kept whatever it says (Plans/usage-feature.md#UF-108, Plans/storage-plan.md#SP-341). Commands infer no expiry for them from prefix, key, path or age.

```yaml
plan_unit_id: CS-107
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  DL-270 commands part. pm db dump, pm inspect, pm tail and pm export are command-line reads, not User
  Commands or UICommands, and mint no cmd.* id, catalog row or wiring row; SP-339 owns their read semantics.
  The record inspector is a read-only record tab opened through the existing cmd.storage.open_value. The SP-340
  verified reclaim is the existing cmd.storage.compaction.request, one owner-routed maintenance request for the
  whole storage instance under writer posture, permission and the maintenance lease, with results shown per
  storage group; there is no cmd.storage.reclaim. cmd.chat.load_older is registered in UCC-212 as a shell_view
  command with the sole handler handlers::chat::load_older that reads one older sealed 50-item page of a thread
  from the render-page store with no write; scrolling near the top dispatches it and a Load 50 older row
  stays as the fallback. Detail usage.event records are governed by ai.usage.usage-retention and daily usage
  totals are kept whatever it says (UF-108).
gui_related: true
gui_classification_reason: Rules the reclaim action in storage health, the chat's load-older control and the record inspector's command route.
split_recommended: false
depends_on: [CS-059, SP-338, SP-339, SP-340, SP-341]
unblocks: []
acceptance_criteria:
  - No catalog row, wiring row or cmd.* id exists for pm db dump, pm inspect, pm tail or pm export.
  - Reclaim dispatches cmd.storage.compaction.request and never compacts inline; no cmd.storage.reclaim exists.
  - cmd.chat.load_older has one handler, writes nothing and never replays events.
  - No command prunes usage.event beyond ai.usage.usage-retention.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_command_boundary_drift
reasoning_tier: high
context_scope: dl270_storage_profile_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-270
  - Plans/storage-plan.md#SP-338
  - Plans/storage-plan.md#SP-339
  - Plans/storage-plan.md#SP-340
preserved_exact_tokens:
  - cmd.chat.load_older
  - cmd.storage.compaction.request
  - cmd.storage.open_value
  - usage.event
negative_constraints:
  - Do not mint a cmd.* id for a command-line verb.
  - Do not add a cmd.storage.reclaim command or a ui.chat_thread.* prefix.
  - Do not add a standalone verify, repair or salvage command.
owner_hints:
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/storage-plan.md#SP-339, ContractName:Plans/storage-plan.md#SP-340, ContractName:Plans/UI_Command_Catalog.md#UCC-212
