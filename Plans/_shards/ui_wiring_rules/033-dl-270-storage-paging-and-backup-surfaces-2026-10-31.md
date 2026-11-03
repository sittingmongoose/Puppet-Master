# Shard 033: DL-270 storage, paging and backup surfaces (2026-10-31)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L2931-L3400

Source SHA256: `6597b1aa624433b3663cf1cf6eeea686c0399ad7388e843578639c6c179a9508`

---

## DL-270 storage, paging and backup surfaces (2026-10-31)

### UIW-046 - Storage Health And Backup Status Are Projections; Paging And The Inspector Read Through Commands

```yaml
plan_unit_id: UIW-046
unit_type: wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: |-
  DL-270. A display of owner state is a projection, not a wiring row: Storage health (each storage group's usage against its disk budget, reclaimable bytes, last compaction; SP-340), the Last verified backup line and the line saying what a restore from it would lose (BRS-031) dispatch nothing and receive no production row, because a row asserts a real cmd.* identity (UIW-018). Their actions are the existing commands: cmd.settings.open_storage_retention opens Storage health, cmd.storage.compaction.request is the only manual space action (Reclaim space), and cmd.backup.verify, cmd.backup.open_details and cmd.backup.open_history are the backup consumers. Reverse coverage is required: a completed reclaim updates the last-compaction line from the storage_maintenance_operation result, and a completed verification updates the Last verified backup line from the latest verification receipt joined with its capture point (time and last event), with an explicit no verified backup state. The record inspector opens a record only through cmd.storage.open_value; every control that does so is its own element row on that command, and filtering, paging, selection and expansion inside the inspector are view-local and ephemeral and dispatch nothing (the viewer rule of FinalGUISpec). Older chat history loads through cmd.chat.load_older only: the Load 50 older button and the history list's near-top threshold are two producers of one request that returns one sealed 50-item page, never a replay of events; the control is required, not optional (ACD-242). Opening a thread and expanding an item add no paging command: open reads the first page, expand reads one body. pm db dump, pm inspect, pm tail and pm export are command-line tools, not UICommands, and take no row. This unit owns only the wiring rule; storage content, budgets and page format stay with SP-338 to SP-340 and BRS-031.

  Application chat history uses the same sealed 50-item paging owner with exact app/Server/thread/cursor, no Project fallback or event replay. Full Server app backup and Project converted-record backup retain their distinct owner scopes; Safe shows last complete backup separately from last verified and any newer failed/unverified attempt. Application inspector/health views remain readers, never writers or proof of current authority.
gui_related: true
gui_classification_reason: Governs how Storage health, backup status, the record inspector entry and chat paging controls bind to commands.
split_recommended: false
depends_on: [UIW-018, UIW-044, WM-098, DL-270, SP-339, SP-340, ACD-242, BRS-031]
unblocks: []
acceptance_criteria:
  - "Storage health and the Last verified backup line have no production row and no command, and each names its reverse source."
  - "The Reclaim space, record-open and Load 50 older controls each resolve one command and one sole handler."
  - "In-inspector filter, paging, selection and follow dispatch nothing, and opening a record writes no file."
  - "A thread opens without replay and loads older pages only through cmd.chat.load_older."
validation_surfaces:
  - "python3 scripts/pm-plans-verify.py validate-wiring-matrix"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: storage_projection_row_or_replay_on_open
reasoning_tier: high
context_scope: dl270_storage_wiring
implementation_surfaces:
  - "Plans/UI_Wiring_Rules.md"
  - "Plans/Wiring_Matrix.production.json"
node_compile_hint:
  mode: static_wiring_rule_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
preserved_exact_tokens:
  - "cmd.storage.open_value"
  - "cmd.chat.load_older"
  - "Load 50 older"
negative_constraints:
  - "Do not give a projection a production row."
  - "Do not make Load 50 older optional or replay events to open a thread."
owner_hints:
  - "Plans/UI_Wiring_Rules.md"
```

ContractRef: ContractName:Plans/Wiring_Matrix.md#WM-098, ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/UI_Command_Catalog.md#UCC-212


### UIW-047 — Footage return fences and route-disable wiring

```yaml
plan_unit_id: UIW-047
unit_type: wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: 'UIW-047. cmd.free_models.route.disable. DL-272: WM-099 and CS-108 own the single new route-disable producer
  and command. Keyboard and pointer carry the same route/provider/policy scope and expected catalog/policy generations.
  Refusal, readonly storage, unknown target, stale result or missing owner leaves accepted configuration unchanged. Its
  result refreshes the same originating row; it never revokes another account, changes model order or cancels in-flight
  work. Existing Sign in/fallback/cancel/retry routes retain protected input custody, initiating Client/control network,
  operation and return-generation fences; no raw code or token enters ordinary persistence. One shared feedback owner
  preserves Ready accounts during additions and supplies current reasons and truthful outcomes.'
gui_related: true
gui_classification_reason: Defines user-visible setup/feedback or its exact owner-routed control.
split_recommended: false
depends_on:
- DL-272
- MS-121
- MA-045
unblocks: []
acceptance_criteria:
- 'DL-272: WM-099 and CS-108 own the single new route-disable producer and command. Keyboard and pointer carry the same
  route/provider/policy scope and expected catalog/policy generations. Refusal, readonly storage, unknown target, stale
  result or missing owner leaves accepted configuration unchanged. Its result refreshes the same originating row; it
  never revokes another account, changes model order or cancels in-flight work. Existing Sign in/fallback/cancel/retry
  routes retain protected input custody, initiating Client/control network, operation and return-generation fences; no
  raw code or token enters ordinary persistence. One shared feedback owner preserves Ready accounts during additions
  and supplies current reasons and truthful outcomes.'
validation_surfaces:
- python3 scripts/pm7-canon-check.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: owner_identity_and_truthful_feedback
reasoning_tier: high
context_scope: pm7_footage_review_20261101
implementation_surfaces:
- Plans/UI_Wiring_Rules.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01
- Concepts/onboarding/opus-5.5 at7d2dd568be76874ff8b4d3e82bad3701226d248c (source lineage only)
preserved_exact_tokens:
- UIW-047
- cmd.free_models.route.disable
negative_constraints:
- Do not infer native handlers, trust, success, credential authority or governance readiness from a concept or static
  fixture.
owner_hints:
- Plans/UI_Wiring_Rules.md
```

### UIW-048 - Settings Levels Origin Details And Exact Owner Writes

```yaml
plan_unit_id: UIW-048
unit_type: wiring_contract
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: |-
  Settings controls render SSYS-059/063's one effective result for an immutable target context. Changed plus a 1px control outline, origin-word Details, Varies, Where it applies, six-difference summary, searchable Set for, Change view, Recent changes and explicit reset targets are typed local presentation over owner results; local open/close/hover/filter/preview never writes a setting or emits a domain event. The scope-label switch starts Off. Disabled/offline/stale/managed/limited choices expose the owner's reason with keyboard/focus parity and no color-only meaning.

  Exactly five Settings primaries remain: cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback and cmd.settings.export. Navigation preserves setting/manager/detail, level/key, Project-or-app, actual Computer/Device/Client, route/query/scroll/focus and continuation generation/expiry and authorizes no domain work. Apply requires the current exact preview/hash, offered level/key, per-setting/owner revisions, sole writer, permission/mode and idempotency; terminal saved state needs readback/result, not an acknowledgement. Human edits target origin; agents use SSYS-065. All chats/All terminals explicitly targets Everywhere. Batch done/not_reached/refused queues nothing and claims no distributed atomicity.

  Every one of 38 manager descriptors retains its owner-specific target fields, home/reach/whole-version/switch contract and exact copy subtransaction. Reach/installation/auth/readiness are separate; read-only external profiles and protected built-ins stay protected. Owner results drive single outcome/retarget/Undo. Row controls, hosted Customize/Usage/AI controls, managers, History/Compare/Reset, Transfer and New Project receive exact reverse coverage and action-source extraction. Missing handler, writer, mapping or admitted edition remains typed unavailable.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on:
- DR-040
- DR-041
- DR-084
- DR-085
- DR-089
unblocks: []
acceptance_criteria:
- Each primary has one exact request_schema_ref/result_schema_ref pair, sole handler, current state selector, closed
  disabled reason, permission/currentness and effect/return contract.
- Every visible and agent producer has forward and reverse touch coverage, with stable action-source extraction and
  typed local/no-persist distinctions.
- Pointer/keyboard/accessibility, offline/stale/refusal, duplicate dispatch and wrong-scope/exact-return negatives
  are specified together.
- Unregistered names remain command_not_registered and missing native handlers remain handler_unavailable; no optimistic
  saved/sent/completed state.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: scope_actor_dispatch_or_return_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/UI_Wiring_Rules.md
- Plans/Settings_System.md#SSYS-059
- Plans/Settings_System.md#SSYS-063
- Plans/Settings_System.md#SSYS-065
- Plans/UI_Command_Catalog.md#UCC-214
- Plans/Wiring_Matrix.md#WM-100
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#UIW-048
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- Changed
- 1px
- Details
- '38'
- Everywhere
negative_constraints:
- Do not create duplicate primaries, false domain handlers for local controls, focus-based targets, forged human authority,
  unregistered events or native proof from static rows.
owner_hints:
- Plans/Settings_System.md#SSYS-059
- Plans/Settings_System.md#SSYS-063
- Plans/Settings_System.md#SSYS-065
- Plans/UI_Command_Catalog.md#UCC-214
- Plans/Wiring_Matrix.md#WM-100
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-059, ContractName:Plans/Settings_System.md#SSYS-063, ContractName:Plans/Settings_System.md#SSYS-065, ContractName:Plans/UI_Command_Catalog.md#UCC-214, ContractName:Plans/Wiring_Matrix.md#WM-100


### UIW-049 - No Project Reads Requests Conversion And Exact Return

```yaml
plan_unit_id: UIW-049
unit_type: wiring_contract
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: |-
  An application control binds actual scope_kind=application, project_id=null, Server/Computer/thread-or-draft/roots, actor and operation generation. Where chooses a draft place before first message and is not the composer message destination. No project is a fixed switcher target; existing cmd.project.switch_active_tab and cmd.project.open_in_new_workspace_tab are amended in place. Here/All chats and offline lists state scope, never fabricate a Project or move work by focus. Folder open/delete and attachment save use the actual lazy folder owner; deletion is explicit and unchecked by default.

  Cross-project reads use projects.* tools with source-Computer/current read grants and the DR-088 coverage object; coverage expansion and request preview are local. Existing cmd.thread.request and cmd.thread.spawn plus thread.await keep their registered continuity owners. Send/incoming decisions bind the exact body/target/generation, sender authority and independent receiver Off/Ask me/mode/ceiling, max three automatic round trips and typed delivery/refusal. Sender YOLO cannot answer the receiver's retained approvals. Do not register a second transport or infer new facade primaries from preview labels.

  Both conversion choices bind the same fresh manifest, actual destination, required owner receipts and current permission/root/Stop evidence. Regular human apply and N27's guarded agent route share the same owner; an agent never clicks a person-only approval. New Project listing and copy/check precede cutover; only one live writer/index remains. Report/Resume/Cancel/Undo return to the exact operation and retained thread. N25 successors and schedule fences/explicit re-admission are mandatory; no permission, mutable scope, latest-version, board or profile transfer. Stale/ambiguous/late/canceled/expired returns refuse before mutation and preserve source state.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on:
- DR-087
- DR-088
- DR-091
- UIW-048
unblocks: []
acceptance_criteria:
- Each primary has one exact request_schema_ref/result_schema_ref pair, sole handler, current state selector, closed
  disabled reason, permission/currentness and effect/return contract.
- Every visible and agent producer has forward and reverse touch coverage, with stable action-source extraction and
  typed local/no-persist distinctions.
- Pointer/keyboard/accessibility, offline/stale/refusal, duplicate dispatch and wrong-scope/exact-return negatives
  are specified together.
- Unregistered names remain command_not_registered and missing native handlers remain handler_unavailable; no optimistic
  saved/sent/completed state.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: scope_actor_dispatch_or_return_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/UI_Wiring_Rules.md
- Plans/assistant-chat-design.md#ACD-508
- Plans/assistant-chat-design.md#ACD-509
- Plans/assistant-chat-design.md#ACD-510
- Plans/assistant-chat-design.md#ACD-511
- Plans/Project_Sync_and_Backbone.md#PSB-007
- Plans/UI_Command_Catalog.md#UCC-216
- Plans/Wiring_Matrix.md#WM-102
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#UIW-049
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- scope_kind=application
- project_id=null
- Where
- No project
- N25
negative_constraints:
- Do not create duplicate primaries, false domain handlers for local controls, focus-based targets, forged human authority,
  unregistered events or native proof from static rows.
owner_hints:
- Plans/assistant-chat-design.md#ACD-508
- Plans/assistant-chat-design.md#ACD-509
- Plans/assistant-chat-design.md#ACD-510
- Plans/assistant-chat-design.md#ACD-511
- Plans/Project_Sync_and_Backbone.md#PSB-007
- Plans/UI_Command_Catalog.md#UCC-216
- Plans/Wiring_Matrix.md#WM-102
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-508, ContractName:Plans/assistant-chat-design.md#ACD-509, ContractName:Plans/assistant-chat-design.md#ACD-510, ContractName:Plans/assistant-chat-design.md#ACD-511, ContractName:Plans/Project_Sync_and_Backbone.md#PSB-007, ContractName:Plans/UI_Command_Catalog.md#UCC-216, ContractName:Plans/Wiring_Matrix.md#WM-102


### UIW-050 - Reviewed Project Drafts And Actual File Tool Roots

```yaml
plan_unit_id: UIW-050
unit_type: wiring_contract
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: |-
  Projects/New Project consumes PJCT-009/PWIZ-037's one reviewed draft and current-answer applicability. Launcher/ways/sections/Edit/Back/Review/Advanced/Details/filters are typed local controls, never generic Project create/clone/init commands or O55/PJX APIs. Changing source/Computer/way/owner fields invalidates incompatible cached branch/auth/inspection and Review; a valid return cannot revive abandoned work. Actual owner receipts drive Creating/recovery and N15 app AI/Later returns; no separate success timer or duplicate remote create. Existing provider-vocabulary, DL-273 retirement-at-entry/resume/activation and FO-22 rules remain.

  Rename, refresh, archive/remove/open_settings/delete_data, inspect/remote.add, native clone/fetch/sync/publish, source_location repoint versus Project move, Starters, Backup/Recovery Kit and per-forge create/fork use the single centrally registered owner identity and exact request/result edition. Projects/New Project/conversion, Settings and Doctor are reverse consumers of those rows. Navigation is no-persist, refresh reads the registry, Remove is list-only and strong deletion stays Storage-owned. Import from another app is explicitly unavailable, not a fake command. Existing switch/open-new-tab commands stay single.

  Ordinary app file/attachment/search/notebook/memory/editor/terminal/browser controls bind actual Computer/Host/Environment/root/file/version/session rather than CWD, HOME or a default Project. Foreign Project references stay read-only under their source grant; mutation enters the actual target owner. PM worktree/SCM/debug/backup operations retain intrinsic target requirements. Converted future context re-resolves while live processes/profile/history remain original. Viewers never replay effects. Keyboard/pointer, unsaved-buffer safety, exact origin/return and closed unavailable reasons cover both app and original Project variants.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on:
- DR-086
- DR-087
- DR-091
- UIW-049
unblocks: []
acceptance_criteria:
- Each primary has one exact request_schema_ref/result_schema_ref pair, sole handler, current state selector, closed
  disabled reason, permission/currentness and effect/return contract.
- Every visible and agent producer has forward and reverse touch coverage, with stable action-source extraction and
  typed local/no-persist distinctions.
- Pointer/keyboard/accessibility, offline/stale/refusal, duplicate dispatch and wrong-scope/exact-return negatives
  are specified together.
- Unregistered names remain command_not_registered and missing native handlers remain handler_unavailable; no optimistic
  saved/sent/completed state.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: scope_actor_dispatch_or_return_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/UI_Wiring_Rules.md
- Plans/Project_System.md#PJCT-009
- Plans/Project_System.md#PJCT-012
- Plans/Planning_Wizard.md#PWIZ-037
- Plans/Source_Control_System.md#SCS-025
- Plans/FileManager.md#F-084
- Plans/Tools.md#T-187
- Plans/UI_Command_Catalog.md#UCC-215
- Plans/Wiring_Matrix.md#WM-101
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#UIW-050
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- FO-22
- DL-273
- N15
- no-persist
negative_constraints:
- Do not create duplicate primaries, false domain handlers for local controls, focus-based targets, forged human authority,
  unregistered events or native proof from static rows.
owner_hints:
- Plans/Project_System.md#PJCT-009
- Plans/Project_System.md#PJCT-012
- Plans/Planning_Wizard.md#PWIZ-037
- Plans/Source_Control_System.md#SCS-025
- Plans/FileManager.md#F-084
- Plans/Tools.md#T-187
- Plans/UI_Command_Catalog.md#UCC-215
- Plans/Wiring_Matrix.md#WM-101
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-009, ContractName:Plans/Project_System.md#PJCT-012, ContractName:Plans/Planning_Wizard.md#PWIZ-037, ContractName:Plans/Source_Control_System.md#SCS-025, ContractName:Plans/FileManager.md#F-084, ContractName:Plans/Tools.md#T-187, ContractName:Plans/UI_Command_Catalog.md#UCC-215, ContractName:Plans/Wiring_Matrix.md#WM-101


### UIW-051 - App Goal Crew And Automation Authority Controls

```yaml
plan_unit_id: UIW-051
unit_type: wiring_contract
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: |-
  Existing Goal commands and open-editor navigation, Crew/configure/start/stop/message/participant controls and Crew Auto keep their sole runtime owners and gain only explicitly selected app editions. Save versus approved objective proposal, frozen participant/roster/parent ceilings, exact body/run/control/claim/Stop state and real app roots remain checked. Goal/Crew Activity, Home/Agents/Processes/History, participant transcripts, board and conversion reports render the same owner projections; one message board/store/cancel path remains. App Crew configuration is a thread-bound saved owner record, not another Settings value. A missing source or app writer graph stays unavailable rather than reconstructing truth from events.

  Permission controls distinguish actual human approval, mode authority and prior build_grant authority. Always scopes are explicit and never preselected, paths never Everywhere, and source-loosening acceptance is separate from trust. Grant preview/approve/revoke are Permissions-owned; approve/expand/renew is human-only, exact Plan/preview/current permission/target/Stop bound. Agents cannot issue their own grant or borrow one through another Project/chat. Ordinary YOLO push/publish does not show a fake human confirmation. Y1 lease/created-work-branch and PS-147 verified created-resource cleanup limits remain.

  What the build did is a shared work/History receipt view with exact target/authority/outcome, including stale/pending/unknown/refused; no extra action log or build.* event is inferred. Stop uses the existing run owner and fences children. Undo dispatches only an eligible exact owner inverse; compensation is labeled, and No safe Undo is explicit. Grant/currentness/refusal, scope and list/details controls get complete local/command/agent forward and reverse closure, exact accessibility and original-source return.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on:
- DR-090
- DR-091
- UIW-049
unblocks: []
acceptance_criteria:
- Each primary has one exact request_schema_ref/result_schema_ref pair, sole handler, current state selector, closed
  disabled reason, permission/currentness and effect/return contract.
- Every visible and agent producer has forward and reverse touch coverage, with stable action-source extraction and
  typed local/no-persist distinctions.
- Pointer/keyboard/accessibility, offline/stale/refusal, duplicate dispatch and wrong-scope/exact-return negatives
  are specified together.
- Unregistered names remain command_not_registered and missing native handlers remain handler_unavailable; no optimistic
  saved/sent/completed state.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: scope_actor_dispatch_or_return_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/UI_Wiring_Rules.md
- Plans/Goal_Runtime_System.md#GRS-086
- Plans/Goal_Runtime_System.md#GRS-087
- Plans/Collaborative_Workflows.md#CWR-045
- Plans/Permissions_System.md#PS-147
- Plans/Permissions_System.md#PS-148
- Plans/UI_Command_Catalog.md#UCC-217
- Plans/UI_Command_Catalog.md#UCC-218
- Plans/Wiring_Matrix.md#WM-103
- Plans/Wiring_Matrix.md#WM-104
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#UIW-051
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- build_grant
- YOLO
- What the build did
- No safe Undo
negative_constraints:
- Do not create duplicate primaries, false domain handlers for local controls, focus-based targets, forged human authority,
  unregistered events or native proof from static rows.
owner_hints:
- Plans/Goal_Runtime_System.md#GRS-086
- Plans/Goal_Runtime_System.md#GRS-087
- Plans/Collaborative_Workflows.md#CWR-045
- Plans/Permissions_System.md#PS-147
- Plans/Permissions_System.md#PS-148
- Plans/UI_Command_Catalog.md#UCC-217
- Plans/UI_Command_Catalog.md#UCC-218
- Plans/Wiring_Matrix.md#WM-103
- Plans/Wiring_Matrix.md#WM-104
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-086, ContractName:Plans/Goal_Runtime_System.md#GRS-087, ContractName:Plans/Collaborative_Workflows.md#CWR-045, ContractName:Plans/Permissions_System.md#PS-147, ContractName:Plans/Permissions_System.md#PS-148, ContractName:Plans/UI_Command_Catalog.md#UCC-217, ContractName:Plans/UI_Command_Catalog.md#UCC-218, ContractName:Plans/Wiring_Matrix.md#WM-103, ContractName:Plans/Wiring_Matrix.md#WM-104


### UIW-052 - App Plan Modes Schedule Manager And Independent Pause

```yaml
plan_unit_id: UIW-052
unit_type: wiring_contract
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: |-
  Plan/Deep Plan, all six strategies and the existing Plan card/version/revise/export/Build/Build With Crew/Build As Goal/Build At controls work in explicit app scope through APR-073/074 and the existing command owners. Freeze exact Plan identity/version/hash/steps, real roots/Computer/runtime/tools/permission, adherence and To-Do bindings; planning does not synthesize a Project repo/worktree. Historical versions are read-only. A revision invalidates the old exact schedule and shows Schedule needs update; no latest-version substitution occurs. Send to Planning Wizard still requires an explicit real Project and fresh person-started handoff.

  Schedule Message create/update/cancel/Send now, execution windows, Build At, recurring task/Goal/Crew/Plan targets and quota consent share SQR-019's Server timers, source/cancel custody and occurrence idempotency. Build At writes one schedule/window transaction, never a parallel execution_window.create. Saved sheet text/attachments/destination and frozen mode/model/account/team/target stay exact. App pause uses cmd.runtime.automation_pause.set's explicit Server/app variant with its own operational epoch; Project pause remains unchanged. Only a user clears either latch, and missing pause custody is unavailable rather than off. Client closure, tab/Project switches and dock expiry never dispatch, move timers, clear Stop or authorize a send.

  Cards, wand, four-tab Schedule Manager, Plan/To-Dos, Home/Processes/attention/History and conversion report bind exact app/Project/Server/thread/target/occurrence and return. Twice-checked permissions/roots/account/tools/writer/task+scope Stop, DST/grace/missed rules and final-dispatch currentness remain. Conversion fences old pending authority and explicitly re-admits the mapped frozen target with fresh consent and both stop contexts, retaining source history. Local views emit no domain event; accepted app schema/payload variants require complete source graph and do not revive goal.scheduled or app Wizard/PRD/Orchestrator.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on:
- DR-091
- DR-092
- UIW-051
unblocks: []
acceptance_criteria:
- Each primary has one exact request_schema_ref/result_schema_ref pair, sole handler, current state selector, closed
  disabled reason, permission/currentness and effect/return contract.
- Every visible and agent producer has forward and reverse touch coverage, with stable action-source extraction and
  typed local/no-persist distinctions.
- Pointer/keyboard/accessibility, offline/stale/refusal, duplicate dispatch and wrong-scope/exact-return negatives
  are specified together.
- Unregistered names remain command_not_registered and missing native handlers remain handler_unavailable; no optimistic
  saved/sent/completed state.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: scope_actor_dispatch_or_return_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/UI_Wiring_Rules.md
- Plans/Assistant_Plan_Runtime.md#APR-073
- Plans/Assistant_Plan_Runtime.md#APR-074
- Plans/Scheduling_and_Quota_Resume.md#SQR-019
- Plans/Scheduling_and_Quota_Resume.md#SQR-020
- Plans/Contracts_V0.md#CV-368
- Plans/UI_Command_Catalog.md#UCC-219
- Plans/Wiring_Matrix.md#WM-105
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#UIW-052
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- Plan/Deep Plan
- Build At
- Schedule needs update
- cmd.runtime.automation_pause.set
- goal.scheduled
negative_constraints:
- Do not create duplicate primaries, false domain handlers for local controls, focus-based targets, forged human authority,
  unregistered events or native proof from static rows.
owner_hints:
- Plans/Assistant_Plan_Runtime.md#APR-073
- Plans/Assistant_Plan_Runtime.md#APR-074
- Plans/Scheduling_and_Quota_Resume.md#SQR-019
- Plans/Scheduling_and_Quota_Resume.md#SQR-020
- Plans/Contracts_V0.md#CV-368
- Plans/UI_Command_Catalog.md#UCC-219
- Plans/Wiring_Matrix.md#WM-105
```

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-073, ContractName:Plans/Assistant_Plan_Runtime.md#APR-074, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-020, ContractName:Plans/Contracts_V0.md#CV-368, ContractName:Plans/UI_Command_Catalog.md#UCC-219, ContractName:Plans/Wiring_Matrix.md#WM-105
