# Shard 049: DL-231 Chat Room automatic round test obligations

Source: `Plans/Automated_Testing_System.md`

Source lines: L6715-L7710

Source SHA256: `bedf4c5c767f8945976a3d1b0ca4ed56bdbd73ba19ea3a8e18ba9c9757b4698a`

---

## DL-231 Chat Room automatic round test obligations

| Case | Required proof |
|---|---|
| Start and initial Grill Me | Start begins round 1 with no Ask Everyone or Next Round click. With Grill Me on, no participant turn starts before the current What we agreed Confirm; round 1 starts automatically after it. A Wonderer never delays the round. |
| Automatic rounds | With pause_between_rounds false or absent, completing a round creates no pacing wait. Run every eligible later round without a click under the same moderated, round_robin or free_discussion policy and its deterministic recorded participant order, until the configured limit or stop condition. Existing permission, needs-you and Grill Me gates remain in force, including every later session's current Confirm; only dependent work waits, and eligible round progression continues automatically once the gate clears. No automatic start dispatches cmd.chat_room.next_round or any other command. |
| Mid-run Grill Me and later Confirm | Enable Grill Me during round 2. Running work continues and the session starts at the next round boundary. Only the round or step consuming its answers waits for its current What we agreed Confirm. A later session needs a fresh Confirm; an earlier session's Confirm cannot release its dependent work. Eligible round progression resumes automatically after each current Confirm without a Next Round click when pause_between_rounds is off. |
| Ordinary needs-you gates | With Grill Me off and pause_between_rounds false, raise an ordinary user-decision question and a permission request. Only dependent work waits for the answer or approval; clearing the gate resumes eligible round progression automatically. Questions, approvals and failures keep the needs dock tone even between numbered rounds. |
| Pausing between rounds | With the switch true, wait after each non-final round, show Round N done as the user's move and offer Next Round, Summarize Now and End discussion. One Next Round starts exactly one round under the unchanged policy. |
| Next Round refusal | Return run_state_invalid with no committed work when the switch is false or absent, a round is running, round 1 has not run, all configured rounds are used, the stop condition is met, the room is paused or terminal, it waits for Grill Me or another user action instead of between rounds, the wait position is unknown, or ask_everyone_once has finished. Exercise both chat_room_card and chat_room_panel. |
| Exhaustion and stop condition | Wait after the final round or an earlier stop condition; never finish automatically. Preserve This room used all its rounds at exhaustion. Add 2 more rounds raises add_rounds through reconfigure and starts the next round immediately; added rounds obey the switch. Summarize Now writes a summary and does not end the room. End discussion completes; Cancel cancels. |
| Pause and Resume | Pause wins over automatic continuation and holds at the next safe turn boundary. Resume continues the round in progress, with later automatic rounds unless the switch is on. No turn is cancelled, duplicated or restarted by a switch change. |
| Messages | A message queued mid-round reaches its addressees exactly once when the next round starts, whether automatically or through Next Round. Send now steers without cancelling a turn; the next speaker reads it first and all later speakers in that round see it. |
| Definition and Settings | New definitions persist a boolean pause_between_rounds. Reject it on Crew, Review or BrainStorm. Existing definitions without it read false. The sheet copies assistant.multi_agent.chat_room.pause_between_rounds, factory false; Save as default uses the Settings transaction and later defaults never alter a committed room. |
| Mid-run on and off | Both card and panel raise set_pause_between_rounds through cmd.collaboration.reconfigure. Under revision/currentness checks, bump the definition revision once and write one system entry. Turning on during a round waits only after it finishes; turning off at a between-round wait starts the next round immediately subject to existing gates. Preserve the turn, reject terminal reconfiguration, fence stale revisions and replay, and allow only one actionable host. |
| One-shot policy | ask_everyone_once asks every participant once and then stops starting turns regardless of the switch; no extra round follows from a between-round control. |
| Dock | Between automatic rounds publish live when no existing user gate or manual pause requires attention. Publish yourmove at the switch-on between-round wait, after the final round or stop condition, while paused, and while any Grill Me session waits for its current Confirm, before round 1 or after mid-run activation before the round needing its answers. Questions, approvals and failures remain needs (ACD-476). Round completion alone creates no user attention. |

Schema validation and explicit fixture-only owner-state joins prove static admission constraints. Automatic progression, dispatch counts, transcript writes, actual Settings/storage behavior, UI/dock rendering, provider work, races and recovery remain future runtime obligations. A passing fixture gate is no native implementation proof.

### ATS-079 - Chat Room Automatic Rounds And Pause Boundary Obligations

```yaml
plan_unit_id: ATS-079
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  DL-231 and CWR-044 require the test rows above for Start, initial and later Grill Me Confirm,
  ordinary needs-you and permission gates, automatic rounds,
  pausing between rounds, Next Round refusal, exhaustion, stop conditions, Pause/Resume, messages,
  definition/Settings defaults, mid-run switching, ask_everyone_once and ACD-476's dock. Static
  positives cover boolean pause_between_rounds, a missing legacy field, on/off
  set_pause_between_rounds requests from chat_room_card and chat_room_panel, and the existing
  reconfigure results. ParticipantActivity positives express a mid-run Grill Me Confirm and an
  ordinary needs-you question through existing decision_ref fields; they prove shape only.
  Negatives reject non-booleans, the field on other kinds, malformed changes,
  non-Chat Room switching and cmd.chat_room.next_round outside the switch-on between-round wait.
  Fixture-only owner-state joins prove run_state_invalid for switch false or absent, a running
  round, before round 1, exhausted rounds, met stop conditions, paused/terminal state, other or
  unknown user waits and one-shot completion; these context projections are not new durable records or request fields. Native
  acceptance must prove automatic round starts dispatch no command, unchanged deterministic turn
  order, exactly one user-started round, one revision and system entry per switch, boundary
  activation without cancelled work, immediate continuation when switched off at the between-round
  wait, one actionable host, exact-once message delivery, manual pause precedence, nonterminal
  exhaustion and correct needs and live/yourmove dock tones. Only work consuming a gated answer
  waits; each later Grill Me session requires its own current Confirm, and eligible rounds resume
  automatically after an existing permission, needs-you or Confirm gate clears. Replay, stale
  currentness, denial and restart must not duplicate turns, system entries or messages. Passing static schema and fixture joins
  establishes none of these native protocol, dispatch, persistence, provider or visual facts.
gui_related: true
gui_classification_reason: Covers the setup check, run switch, round controls and live/yourmove dock presentation.
depends_on: [CWR-024, CWR-031, CWR-044, ACD-476, ATS-062, UCC-207, WM-095, CV-364]
unblocks: []
acceptance_criteria:
  - Every schema positive passes its selected definition and aggregate root; every negative fails its named shape or fixture-join invariant.
  - All thirteen CWR-044 acceptance criteria have explicit test rows, including no command dispatch for automatic starts.
  - Mid-run Grill Me activation and every later session require a fresh current Confirm for dependent work; clearing it resumes eligible automatic progression.
  - Ordinary needs-you questions and permission requests still gate dependent work with Grill Me off and no pacing pause; clearing them resumes eligible automatic progression, and questions, approvals and failures remain needs.
  - Defaults, mid-run switching, message timing and dock attention obey the same owner boundary.
  - Static fixture success claims no native protocol, UI, persistence or recovery proof.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-new-contracts
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_room_round_boundary_coverage
reasoning_tier: standard
context_scope: chat_room_rounds_companions
implementation_surfaces:
  - Plans/Automated_Testing_System.md
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
  - pause_between_rounds
  - set_pause_between_rounds
  - cmd.chat_room.next_round
  - run_state_invalid
  - chat_room_card
  - chat_room_panel
  - ask_everyone_once
  - live/yourmove
negative_constraints:
  - Do not call fixture-only owner-state joins runtime or storage proof.
  - Do not treat automatic round starts as user commands.
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-231, ContractName:Plans/Collaborative_Workflows.md#CWR-044, ContractName:Plans/assistant-chat-design.md#ACD-476, ContractName:Plans/UI_Command_Catalog.md#UCC-207, ContractName:Plans/Wiring_Matrix.md#WM-095, ContractName:Plans/Contracts_V0.md#CV-364


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.

### ATS-080 - Settings Layering Copy Readiness And Model Selection Acceptance

```yaml
plan_unit_id: ATS-080
unit_type: acceptance_gate
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Acceptance checks every live inventory row against SSYS-059's reviewed classification, offered-level/key/combine/atomic/not_offered contract and the actual census. Seven approved additions use the final F-d/A/D spelling map; 1010 is only the starting count, 12 categories and 38 managers remain. Test host paths versus Project-relative paths, no Computer+Device combination, declared scalar careful_order versus per_item maps, custom profile fallback, Computer ceilings, Managed limits, atomic theme_pair and Reduce motion plus OS. An Everywhere default may be loosened only where the owners allow it; a Computer safety answer/cap and parent mandatory ceiling still hold.

  Test the single writer/home/mirror and per-setting CAS: independent edits succeed, same-setting/stale preview fails, offline writes queue nothing, join shows alternatives and supports 30-day Undo, home transfer requires old-writer fencing, and same raw IDs from different key domains never collide. Stale indexes disclose as-of rather than fabricating Varies. No credential/content leakage in mirrors/index/history/events/exports. Q5 keeps general.interaction.thread-archive-days zero as non-offered compatibility only, never an auto-archive offer. Retired Goal worker/verifier rows stay non-offered pending their explicit owner retirement. The five already missing branching.plan/deep-plan subgroup declarations are reported as a pre-existing census defect, not repaired by inventing another category or silently changing the denominator. Human origin edits, agent narrowest/mode handling and protected Always/source acceptance remain distinct.

  Detached own_values/effective_values copy tests exact disjoint selectors, owner things/readback/eligible compensation, chosen account readiness and no install/trust/keys/paths/live-body transfer. New-registry draft rebind/listing and Later/connect-only exclusions use real owner joins. Same-Computer unchosen account never reuses sign-in. App auth keeps protected pre-identity and exact Client/Host/return.

  Model acceptance uses A's lead-accepted scoped-owner chain and explicit tier edition: explicit, scoped owner, Persona, surface/stage, Project own, Computer own, Everywhere/factory, permitted last-used, provider. Standard uses 1–7, Aggressive 1–9, Conservative 1,2,5,6,7,9, explicitly excluding Persona and stage. Preserve historical audit tiers/bytes, account/capability clamps and owner merge semantics; no new model router follows.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DR-084
- DR-085
- DR-089
unblocks: []
acceptance_criteria:
- The owner/companion matrix includes meaningful successful and refusing app/Project joins, with original exact Project
  fixtures unchanged.
- Coverage reports distinguish missing/blocked/not_run and static/concept/native evidence instead of treating omitted
  scenarios as pass.
- All code changes and repository checks are phase-2 work after the actual PM7 landing and owner/interface freeze;
  no new runtime proof follows here.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: missing_scope_semantics_or_false_certification
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/Settings_System.md
- Plans/Models_System.md
- Plans/Multi-Account.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#ATS-080
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- own_values
- effective_values
- theme_pair
- 30-day
- Conservative
negative_constraints:
- Do not relax historical codecs, infer native authority from fixtures, write raw captures into canon, excuse failures
  by refreshing a baseline, or reseal governance in this pass.
owner_hints:
- Plans/Settings_System.md#SSYS-059
- Plans/Settings_System.md#SSYS-060
- Plans/Settings_System.md#SSYS-062
- Plans/Settings_System.md#SSYS-065
- Plans/Models_System.md#MS-099
- Plans/Multi-Account.md#MA-074
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-059, ContractName:Plans/Settings_System.md#SSYS-060, ContractName:Plans/Settings_System.md#SSYS-062, ContractName:Plans/Settings_System.md#SSYS-065, ContractName:Plans/Models_System.md#MS-099, ContractName:Plans/Multi-Account.md#MA-074


### ATS-081 - Application Workflow Source Custody And Counterpart Limits

```yaml
plan_unit_id: ATS-081
unit_type: acceptance_gate
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Static acceptance requires one explicit app/Project scope union and an exhaustive selected-version/adoption manifest for each admitted family. Application means genuine null Project with real Server/thread/Computer/Host/Environment/roots/permission/writer identity; outer/inner scope, reversible partitions and source joins agree. Preserve every original Project schema resource, physical codec/key, semantic/hash/idempotency domain and accepted source byte-for-byte. A nullable field or all-true client booleans is not an app-source proof. Each active source, create/update/cancel/association/append/first receipt/index/read/backup/retention/restore edge adopts the selected app edition or remains explicitly unavailable.

  Test Goal concise body field count, four states, exact objective/currentness, direct Save versus approved proposal, Stop/cancel/continuation/history and non-rebuildable custody. Ordinary Goal/Plan/Crew updates reject null-to-Project binding mutation. Crew and all existing admitted collaboration kinds test real app parent, frozen participants/ceilings, evaluator/configuration, one scoped message board/coordinator and 16 KiB inline/payload-reference policy. Private notebooks/memory never become cross-read content. Plan/Deep Plan tests all six strategies, one current Plan, immutable approved revisions, adherence/To-Dos, Deep ledger/scoped bundle and Build/Crew/Goal/cancel source joins. Assistant bundles do not produce product Plans, NamedPlans, WorkNodes or Orchestrator activation.

  Scheduling tests exact frozen text/attachments/destination and target version/hash/topology, one atomic Build At/window commit, actual Server timers, occurrence idempotency, DST gap/repeat, grace/missed policy, quota unknown reset/consent, offline/restart and final Stop/pause races. App Pause has a real independent epoch and user-only clear; missing custody is unavailable. No fallback Computer, duplicate timer/backlog burst or latest-target substitution.

  Every app family uses one counterpart Server-wide bucket with the same actual limits, holds/retention/backup, including 2,048 restore points and 500 MB default web cache where their owners declare them; no per-chat cap reset or invented Goal/schedule cap. Test app root/tool/provider/To-Do/artifact/Usage/restore/compaction/notebook/memory/browser/terminal isolation. Retired goal.scheduled/goal.degraded/child/progress/replan/stop/verifier writers remain historical-only. goal_run.certified and actual native-v6/v7 Workflow/certified source paths retain their intrinsic Project-bound subjects and exact frozen banks. CV-329/SP-259 owns compaction; CV-334 is historical child-status exclusion and SP-319 is historical terminal-move inspection. App graph status is specified_unimplemented with runtime_enabled:false. Whole-resource source banks keep goal_runtime_contracts.schema.json, goal_body_custody.schema.json and full_thread_runtime_contracts.schema.json byte-exact; facade/send and local-preview successor definitions live in the new application_workflow_contracts.schema.json root, not by adding fields to those frozen files. Passive replay emits no effect, original Project fixtures stay exact and native/runtime certification remains NOT_RUN.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DR-091
- DR-092
unblocks: []
acceptance_criteria:
- The owner/companion matrix includes meaningful successful and refusing app/Project joins, with original exact Project
  fixtures unchanged.
- Coverage reports distinguish missing/blocked/not_run and static/concept/native evidence instead of treating omitted
  scenarios as pass.
- All code changes and repository checks are phase-2 work after the actual PM7 landing and owner/interface freeze;
  no new runtime proof follows here.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: missing_scope_semantics_or_false_certification
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Goal_Runtime_System.md
- Plans/Collaborative_Workflows.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#ATS-081
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- 2,048
- 500 MB
- NOT_RUN
- goal.scheduled
negative_constraints:
- Do not relax historical codecs, infer native authority from fixtures, write raw captures into canon, excuse failures
  by refreshing a baseline, or reseal governance in this pass.
owner_hints:
- Plans/Contracts_V0.md#CV-365
- Plans/Contracts_V0.md#CV-366
- Plans/Contracts_V0.md#CV-368
- Plans/storage-plan.md#SP-349
- Plans/storage-plan.md#SP-351
- Plans/storage-plan.md#SP-352
- Plans/Goal_Runtime_System.md#GRS-086
- Plans/Collaborative_Workflows.md#CWR-045
- Plans/Assistant_Plan_Runtime.md#APR-073
- Plans/Scheduling_and_Quota_Resume.md#SQR-019
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-365, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/Contracts_V0.md#CV-368, ContractName:Plans/storage-plan.md#SP-349, ContractName:Plans/storage-plan.md#SP-351, ContractName:Plans/storage-plan.md#SP-352, ContractName:Plans/Goal_Runtime_System.md#GRS-086, ContractName:Plans/Collaborative_Workflows.md#CWR-045, ContractName:Plans/Assistant_Plan_Runtime.md#APR-073, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019


### ATS-082 - Every Conversion Family And Cutover Undo Race

```yaml
plan_unit_id: ATS-082
unit_type: acceptance_gate
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Acceptance covers both equal conversion choices, new/existing Project, local/cross-Server and Regular/guarded YOLO using the same manifest engine. Every current NOPROJECT section 7.12 and TOUCHPOINTS-L2 section 8 row has an exact disposition: thread/messages/composer/questions; folder/files/attachments; immutable events/receipts/Usage/payloads; restore/revert/safe points/attention/handoff/Lens; Goal body/control/history/association/continuation; Crew definition/run/participant/transcript/board/lineage; coordination claims/keys/checkpoints; Plan/revisions/PlanRun/adherence/To-Dos/Deep ledger/bundle; schedules/windows/consents/occurrences; Project-only Wizard/PRD/Orchestrator state; native repository/worktree/forge/conflict identity; artifacts/shared refs; live terminal/dev/process/ports; browser/debug/testing; editor/buffers/absolute links; search/log/chat indexes and builder slots; Home/boards/panels/rail/dock/layout; memory/Teach/capsule/notebook/Persona; MCP/skills/plugins/custom commands/provider choices; permission/Always/FileSafe/trust; Server/Home Server/Vault/routes/WS auth/fairness; app/Project Stop/pause/History; backup/deletion/retention/quotas; and each inverse Undo. Goals, Crew, Plans and schedules cannot be marked nothing-to-move.

  Positive cases require explicit statement/current preview/named apply/report/Undo, real new-Project listing before cutover, copy/hash verification before source removal, full destination-owned history, one live writer/index and preserved thread/source lineage. N25 defaults linked new records; a separately admitted rebind needs its complete owner transaction. Test active-task safe-stop/fence, pending approval settlement, exact target/step/To-Do maps and schedule hold/replacement with fresh consent and both stop contexts.

  Inject failure at each copy/check/owner/commit/cutover/index boundary, cross-Server interruption/restart/resume/cancel, stale claim generation, late source writer and timer race. Duplicate apply/replay returns the original result; no repeated remote create, usage charge, source send or dual continuation occurs. Test keep-both/same/different/unsaved conflict, direct-main Advanced versus default separate draft, ambiguous/stale YOLO refusal and fresh destination authority. Undo rejects first new work or seven-day expiry, needs both Computers remotely, removes only eligible unchanged local effects, never remote repo/branch/backup/modified work or independent canonical/audit/shared custody, and never clears Stop. Restoring an old app backup consults lineage and cannot revive the sealed source.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DR-087
- DR-091
- DR-092
unblocks: []
acceptance_criteria:
- The owner/companion matrix includes meaningful successful and refusing app/Project joins, with original exact Project
  fixtures unchanged.
- Coverage reports distinguish missing/blocked/not_run and static/concept/native evidence instead of treating omitted
  scenarios as pass.
- All code changes and repository checks are phase-2 work after the actual PM7 landing and owner/interface freeze;
  no new runtime proof follows here.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: missing_scope_semantics_or_false_certification
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/assistant-chat-design.md
- Plans/Project_Sync_and_Backbone.md
- Plans/Goal_Runtime_System.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Backup_Restore_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#ATS-082
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- N25
- Undo
- seven-day
- one live writer
negative_constraints:
- Do not relax historical codecs, infer native authority from fixtures, write raw captures into canon, excuse failures
  by refreshing a baseline, or reseal governance in this pass.
owner_hints:
- Plans/assistant-chat-design.md#ACD-510
- Plans/assistant-chat-design.md#ACD-511
- Plans/Project_Sync_and_Backbone.md#PSB-007
- Plans/Goal_Runtime_System.md#GRS-087
- Plans/Assistant_Plan_Runtime.md#APR-074
- Plans/Backup_Restore_System.md#BRS-033
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-510, ContractName:Plans/assistant-chat-design.md#ACD-511, ContractName:Plans/Project_Sync_and_Backbone.md#PSB-007, ContractName:Plans/Goal_Runtime_System.md#GRS-087, ContractName:Plans/Assistant_Plan_Runtime.md#APR-074, ContractName:Plans/Backup_Restore_System.md#BRS-033


### ATS-083 - Mode Grant Read Receiver And Computer Use Authority

```yaml
plan_unit_id: ATS-083
unit_type: acceptance_gate
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Positive cases cover Regular actual human approval and admitted YOLO ordinary Git/JJ/package/image/template push/publish/create with no extra ordinary yes, preserving exact target/privacy/currentness/capability and unknown-effect reconciliation. Distinguish human, mode and build_grant receipt/source editions; automation can never serialize as human_confirmed=true. Y1 success needs a current expected-head lease and a verified branch create receipt for this work; foreign/imported/unrelated/main/default/protected branch or lost lease refuses with no force fallback. Ordinary prune/delete/discard/Kubernetes asks remain without an exact grant.

  Build-grant tests join exact Plan/revision/hash/build, allowed operation/resource selectors, current permission/account/Stop/revocation and verified created-resource UID/generation/receipt. Allow listed CI/deploy/container/publish operations and cleanup of grant-created resources only. Reject named pre-existing/same-name replacement/unlisted child/broad namespace or prune/modified-referenced/unrelated resource cleanup. Agent self-issue/expand/renew, wider children, app/cross-Project borrowed grant, changed Plan/target, restore/revocation and final-dispatch Stop races fail. FileSafe, safe points, source trust/loosening, durable Always, protected input, secrets, paid sign-up and human-only administration remain independent guards. Run-owner Stop and truthful Undo/compensation/No safe Undo use shared work/History.

  App tool approval binds actual thread/run/Computer/tool/target and separate versioned app envelope, never fake node/blocked sequence. Read tests cover all/named/empty/offline/denied/partial/archived-skipped/missing index, source switch revoked during read, source-Computer route, scrubbed exposure/outward provenance and protected Project/PM-data/credential symlink exclusions. Sender/receiver Regular/YOLO pairs retain independent Off/Ask me/mode ceilings, exact approved body, expiry/order and three-round-trip cap. No read or settings.follow grant permits mutation. FileSafe-on listed home reads differ from FileSafe-off/no grant. Computer-use negatives cover absent desktop/DAE/provider namespace/disclosure, wrong app/Host/controller, protected auth and raw-frame persistence; targeted Stop/double-Esc fences only its own controller. N27 requires the exact explicit destination and fresh preview/authority, not a person-only approval click.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DR-090
- DR-088
- UIW-051
unblocks: []
acceptance_criteria:
- The owner/companion matrix includes meaningful successful and refusing app/Project joins, with original exact Project
  fixtures unchanged.
- Coverage reports distinguish missing/blocked/not_run and static/concept/native evidence instead of treating omitted
  scenarios as pass.
- All code changes and repository checks are phase-2 work after the actual PM7 landing and owner/interface freeze;
  no new runtime proof follows here.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: missing_scope_semantics_or_false_certification
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/Run_Modes.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#ATS-083
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- human_confirmed=true
- Y1
- No safe Undo
- settings.follow
negative_constraints:
- Do not relax historical codecs, infer native authority from fixtures, write raw captures into canon, excuse failures
  by refreshing a baseline, or reseal governance in this pass.
owner_hints:
- Plans/Permissions_System.md#PS-144
- Plans/Permissions_System.md#PS-145
- Plans/Permissions_System.md#PS-146
- Plans/Permissions_System.md#PS-147
- Plans/Permissions_System.md#PS-148
- Plans/Tools.md#T-185
- Plans/Tools.md#T-186
- Plans/Run_Modes.md#RM-053
```

ContractRef: ContractName:Plans/Permissions_System.md#PS-144, ContractName:Plans/Permissions_System.md#PS-145, ContractName:Plans/Permissions_System.md#PS-146, ContractName:Plans/Permissions_System.md#PS-147, ContractName:Plans/Permissions_System.md#PS-148, ContractName:Plans/Tools.md#T-185, ContractName:Plans/Tools.md#T-186, ContractName:Plans/Run_Modes.md#RM-053


### ATS-084 - Shared Setup Forge Starter Backup And Project Action Acceptance

```yaml
plan_unit_id: ATS-084
unit_type: acceptance_gate
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Verify the six ingress ways against the current PJCT-009/PWIZ-037 draft and actual owner joins, all ten offered API profiles plus transport-only generic Git, equal native Git/JJ choices and precommit read/auth versus mutation fences. Preserve nine historical registration kinds, add mounted_existing only through current mount/device proof, and keep online_import/fork_contribute as closed native clone provenance. Every create/fork chain verifies exact reviewed setup/consumer/real reserved identity, tagged remote effect result, local source, Settings rebind and registry receipts. Wrong original digest, fork-as-create, new_local remote receipt, booleans without joins, unknown retry/delete and repeat create refuse. Fresh fenced resume executes only remaining effects; original replay never resumes.

  Read-only inspection covers local/Server/SSH/PM/SMB/NFS/mount, native revision/dirty/remotes/submodules/LFS/hooks and duplicate-copy evidence. Stale/partial/denied never means clean or none; inspection cannot bind origin, snapshot JJ or execute hooks/helpers. remote.add is local config only, rejects unsafe/taken names/credentials/stale leases and never publishes. GH/GHES fork/head/base/upstream and local_reconcile_only sync freeze both repositories/revisions/strategy, while other forges remain typed unsupported for contribution forks. DL-273, GHES host-policy, Dedicated unoffered, TFVC and token deferral stay enforced at entry/resume/activation.

  Test spaces, invalid names, private-most Review, duplicate-copy Open suggestion, team branch default/direct alternative and display-name-only rename with CAS. Starters versus detached Saved setups uses exact content/version/scan/path manifest and no secrets/history/live bodies; other-app import stays unavailable. Source-location repoint and actual content move remain distinct. Backup tests destination before sign-in, exact device/NAS identity across transports, safe test/Use existing, first-policy absent-key CAS/replay, Standard 7/4/6 seed and Advanced counts/time/zone. Archive pauses schedule and keeps last-good without prune; unarchive restores eligibility without run or Stop clear. Full Server app custody/old-restore lineage and Project converted history remain coherent. Remove is list-only and Delete data has its own strong owner. Keep all FO-22, protected return and historical exact fixtures; native provider/media/backup proof remains NOT_RUN.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DR-085
- DR-086
- DR-089
- DR-090
unblocks: []
acceptance_criteria:
- The owner/companion matrix includes meaningful successful and refusing app/Project joins, with original exact Project
  fixtures unchanged.
- Coverage reports distinguish missing/blocked/not_run and static/concept/native evidence instead of treating omitted
  scenarios as pass.
- All code changes and repository checks are phase-2 work after the actual PM7 landing and owner/interface freeze;
  no new runtime proof follows here.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: missing_scope_semantics_or_false_certification
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/Project_System.md
- Plans/Planning_Wizard.md
- Plans/Source_Control_System.md
- Plans/Forge_Integrations.md
- Plans/Jujutsu_Integration.md
- Plans/Backup_Restore_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#ATS-084
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- mounted_existing
- online_import
- fork_contribute
- Standard
- NOT_RUN
negative_constraints:
- Do not relax historical codecs, infer native authority from fixtures, write raw captures into canon, excuse failures
  by refreshing a baseline, or reseal governance in this pass.
owner_hints:
- Plans/Project_System.md#PJCT-009
- Plans/Project_System.md#PJCT-010
- Plans/Project_System.md#PJCT-011
- Plans/Project_System.md#PJCT-012
- Plans/Planning_Wizard.md#PWIZ-037
- Plans/Source_Control_System.md#SCS-025
- Plans/Forge_Integrations.md#FGI-023
- Plans/Forge_Integrations.md#FGI-024
- Plans/Jujutsu_Integration.md#JJI-023
- Plans/Backup_Restore_System.md#BRS-032
- Plans/Backup_Restore_System.md#BRS-033
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-009, ContractName:Plans/Project_System.md#PJCT-010, ContractName:Plans/Project_System.md#PJCT-011, ContractName:Plans/Project_System.md#PJCT-012, ContractName:Plans/Planning_Wizard.md#PWIZ-037, ContractName:Plans/Source_Control_System.md#SCS-025, ContractName:Plans/Forge_Integrations.md#FGI-023, ContractName:Plans/Forge_Integrations.md#FGI-024, ContractName:Plans/Jujutsu_Integration.md#JJI-023, ContractName:Plans/Backup_Restore_System.md#BRS-032, ContractName:Plans/Backup_Restore_System.md#BRS-033


### ATS-085 - Complete Touch GUI Motion And Truthful Evidence Boundaries

```yaml
plan_unit_id: ATS-085
unit_type: acceptance_gate
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Every command/agent/typed local producer and reverse consumer in UIW-048 through UIW-052 has one exact disposition and a source-extracted touch row. Validate primary/alias/sole-handler/request/result/schema edition, owner/PlanUnit/DRY route, exact scope/state selector/closed disabled reason, permission/currentness, effect/receipt-or-event/no-persist, ObservableWork, persistence, return/focus and meaningful positive/negative cases. Aliases normalize before admission with no peer rows; rejected command spellings and unavailable P11 Import stay inert. Existing Project switch/open-new-tab and continuity/request primaries are amended once. An excluded control cannot conceal an incomplete required behavior.

  Scenario evidence covers all changed Settings rows/panel/managers/copy; Split Projects/New Project and owner recovery; No project/draft/folder/Computer/offline; explicit read coverage/incoming requests; both conversions/report/Undo; app Goal/Crew/Plan/Deep Plan/Build At/Schedule Manager/pause; grant review/live targets/Stop/Undo; and allowed computer-use strip/Stop. Check all ten look variants, effective Reduced Motion, narrow/long-content reflow, accessible labels/reasons, keyboard/pointer equivalence, stale/late returns and stable focus. Keep the one Assistant node, board/rail/menu/hover/overlay/sound/loader owners, all PM7 Glass/FO-22/service-refusal rules and native source/composer capture-return fences. Cached/partial/offline/unknown data never presents healthy/zero/none or completed effects.

  Report exact card/register row → owner unit → companion → command/touch → check/evidence mapping, plus each omitted/not_run/native gap. TCME-007 owns exact subject/configuration/artifact hashes, delivered frames, review findings/repair/replacement and raw/derived distinction. Static schema/semantic fixtures, source checks, browser concept review, native runtime/custody, rendering/motion, actual providers/media/WAN/hardware and assistive technology have separate verdicts. A passing contract or concept never proves native handler/Event Authority/readiness. Phase 2 runs focused checks after interface/companion freeze, serial derived-file generation and authorized full-tree aggregates; no raw capture, baseline excuse or governance reseal is introduced here.
gui_related: true
gui_classification_reason: This unit governs visible controls, context, feedback, accessibility or visual acceptance.
depends_on:
- DR-040
- DR-041
- UIW-048
- UIW-049
- UIW-050
- UIW-051
- UIW-052
- TCME-007
unblocks: []
acceptance_criteria:
- The owner/companion matrix includes meaningful successful and refusing app/Project joins, with original exact Project
  fixtures unchanged.
- Coverage reports distinguish missing/blocked/not_run and static/concept/native evidence instead of treating omitted
  scenarios as pass.
- All code changes and repository checks are phase-2 work after the actual PM7 landing and owner/interface freeze;
  no new runtime proof follows here.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: missing_scope_semantics_or_false_certification
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/UI_Wiring_Rules.md
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#ATS-085
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- UIW-048
- UIW-052
- FO-22
- not_run
negative_constraints:
- Do not relax historical codecs, infer native authority from fixtures, write raw captures into canon, excuse failures
  by refreshing a baseline, or reseal governance in this pass.
owner_hints:
- Plans/UI_Wiring_Rules.md#UIW-048
- Plans/UI_Wiring_Rules.md#UIW-052
- Plans/Test_Capture_and_Motion_Evidence.md#TCME-007
- Plans/FinalGUISpec.md#F3-668
- Plans/FinalGUISpec.md#F3-674
```

ContractRef: ContractName:Plans/UI_Wiring_Rules.md#UIW-048, ContractName:Plans/UI_Wiring_Rules.md#UIW-052, ContractName:Plans/Test_Capture_and_Motion_Evidence.md#TCME-007, ContractName:Plans/FinalGUISpec.md#F3-668, ContractName:Plans/FinalGUISpec.md#F3-674


### ATS-320 — doctor.custom_headless.checked positive/negative oracles.

```yaml
{
  "plan_unit_id": "ATS-320",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/Automated_Testing_System.md",
  "canonical_text": "doctor.custom_headless.checked positive/negative oracles.\nPlans/ds15_event_contract_fixtures.json has exact-family valid payload, extra-field, missing-field and wrong-version cases; scripts/pm-ds15-event-contracts.py checks them and each checkpoint closure, nine-field token, identity, producer and consumer. The native boundary obligations in Plans/newtools.md#N2-217 remain NOT_RUN. Successful static checks never admit this family or settle retention.\nRound 1 semantic oracles: execute the exact-family cases in Plans/ds15_event_contract_fixtures.json through scripts/pm-ds15-event-contracts.py: original outcome and full receipt joins, recovery before/after append without repeat effect, changed-byte refusal, producer transition rejection, read-time deletion/permission changes, complete filtered coverage, full prior-value CAS, live snapshot/source/token changes, rebuild missing prefix, writer cutoff/drain and reader withdrawal/reinstallation. Fixtures contain concrete closed checkpoint values; each negative mutates an otherwise valid family-specific case. Static reference-model proof only; native execution NOT_RUN.\nRound 2 doctor.custom_headless.checked oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 3 doctor.custom_headless.checked oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Automated_Testing_System.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "ATS-320"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Automated_Testing_System.md"
  ]
}
```


### ATS-321 — tool.custom_headless.skipped — withdrawn DS15 draft; DT question reference

```yaml
{
  "plan_unit_id": "ATS-321",
  "unit_type": "contract",
  "status": "superseded",
  "owner_doc": "Plans/Automated_Testing_System.md",
  "canonical_text": "tool.custom_headless.skipped is STOPPED; DS15 withdraws its unsupported draft. DT owns the first-Doctor-run eligibility/reset/restore question at origin/plans/ea-w2-tools-gates-approvals-20261104:reports/event-authority-20261104/DT.md, Question for Jared. No DS15 producer, eligibility, identity, schema, checkpoint or prepared outcome is bound for this family. N2-066 remains the behavior source; no ruling is inferred. This unit id is retired from drafting and must not be reused.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "No DS15 draft remains; DT question stays unresolved."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Automated_Testing_System.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "ATS-321"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Automated_Testing_System.md"
  ]
}
```


### ATS-322 — live.session.started positive/negative oracles.

```yaml
{
  "plan_unit_id": "ATS-322",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/Automated_Testing_System.md",
  "canonical_text": "live.session.started positive/negative oracles.\nPlans/ds15_event_contract_fixtures.json has exact-family valid payload, extra-field, missing-field and wrong-version cases; scripts/pm-ds15-event-contracts.py checks them and each checkpoint closure, nine-field token, identity, producer and consumer. The native boundary obligations in Plans/newtools.md#N2-219 remain NOT_RUN. Successful static checks never admit this family or settle retention.\nRound 1 semantic oracles: execute the exact-family cases in Plans/ds15_event_contract_fixtures.json through scripts/pm-ds15-event-contracts.py: original outcome and full receipt joins, recovery before/after append without repeat effect, changed-byte refusal, producer transition rejection, read-time deletion/permission changes, complete filtered coverage, full prior-value CAS, live snapshot/source/token changes, rebuild missing prefix, writer cutoff/drain and reader withdrawal/reinstallation. Fixtures contain concrete closed checkpoint values; each negative mutates an otherwise valid family-specific case. Static reference-model proof only; native execution NOT_RUN.\nRound 2 live.session.started oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 3 live.session.started oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Automated_Testing_System.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "ATS-322"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Automated_Testing_System.md"
  ]
}
```


### ATS-323 — live.step.updated positive/negative oracles.

```yaml
{
  "plan_unit_id": "ATS-323",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/Automated_Testing_System.md",
  "canonical_text": "live.step.updated positive/negative oracles.\nPlans/ds15_event_contract_fixtures.json has exact-family valid payload, extra-field, missing-field and wrong-version cases; scripts/pm-ds15-event-contracts.py checks them and each checkpoint closure, nine-field token, identity, producer and consumer. The native boundary obligations in Plans/newtools.md#N2-220 remain NOT_RUN. Successful static checks never admit this family or settle retention.\nRound 1 semantic oracles: execute the exact-family cases in Plans/ds15_event_contract_fixtures.json through scripts/pm-ds15-event-contracts.py: original outcome and full receipt joins, recovery before/after append without repeat effect, changed-byte refusal, producer transition rejection, read-time deletion/permission changes, complete filtered coverage, full prior-value CAS, live snapshot/source/token changes, rebuild missing prefix, writer cutoff/drain and reader withdrawal/reinstallation. Fixtures contain concrete closed checkpoint values; each negative mutates an otherwise valid family-specific case. Static reference-model proof only; native execution NOT_RUN.\nRound 2 live.step.updated oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 3 live.step.updated oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Automated_Testing_System.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "ATS-323"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Automated_Testing_System.md"
  ]
}
```


### ATS-324 — live.artifact.created positive/negative oracles.

```yaml
{
  "plan_unit_id": "ATS-324",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/Automated_Testing_System.md",
  "canonical_text": "live.artifact.created positive/negative oracles.\nPlans/ds15_event_contract_fixtures.json has exact-family valid payload, extra-field, missing-field and wrong-version cases; scripts/pm-ds15-event-contracts.py checks them and each checkpoint closure, nine-field token, identity, producer and consumer. The native boundary obligations in Plans/newtools.md#N2-221 remain NOT_RUN. Successful static checks never admit this family or settle retention.\nRound 1 semantic oracles: execute the exact-family cases in Plans/ds15_event_contract_fixtures.json through scripts/pm-ds15-event-contracts.py: original outcome and full receipt joins, recovery before/after append without repeat effect, changed-byte refusal, producer transition rejection, read-time deletion/permission changes, complete filtered coverage, full prior-value CAS, live snapshot/source/token changes, rebuild missing prefix, writer cutoff/drain and reader withdrawal/reinstallation. Fixtures contain concrete closed checkpoint values; each negative mutates an otherwise valid family-specific case. Static reference-model proof only; native execution NOT_RUN.\nRound 2 live.artifact.created oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 3 live.artifact.created oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Automated_Testing_System.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "ATS-324"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Automated_Testing_System.md"
  ]
}
```


### ATS-325 — live.session.completed positive/negative oracles.

```yaml
{
  "plan_unit_id": "ATS-325",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/Automated_Testing_System.md",
  "canonical_text": "live.session.completed positive/negative oracles.\nPlans/ds15_event_contract_fixtures.json has exact-family valid payload, extra-field, missing-field and wrong-version cases; scripts/pm-ds15-event-contracts.py checks them and each checkpoint closure, nine-field token, identity, producer and consumer. The native boundary obligations in Plans/newtools.md#N2-222 remain NOT_RUN. Successful static checks never admit this family or settle retention.\nRound 1 semantic oracles: execute the exact-family cases in Plans/ds15_event_contract_fixtures.json through scripts/pm-ds15-event-contracts.py: original outcome and full receipt joins, recovery before/after append without repeat effect, changed-byte refusal, producer transition rejection, read-time deletion/permission changes, complete filtered coverage, full prior-value CAS, live snapshot/source/token changes, rebuild missing prefix, writer cutoff/drain and reader withdrawal/reinstallation. Fixtures contain concrete closed checkpoint values; each negative mutates an otherwise valid family-specific case. Static reference-model proof only; native execution NOT_RUN.\nRound 2 live.session.completed oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 3 live.session.completed oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Automated_Testing_System.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "ATS-325"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Automated_Testing_System.md"
  ]
}
```


### ATS-326 — live.session.degraded positive/negative oracles.

```yaml
{
  "plan_unit_id": "ATS-326",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/Automated_Testing_System.md",
  "canonical_text": "live.session.degraded positive/negative oracles.\nPlans/ds15_event_contract_fixtures.json has exact-family valid payload, extra-field, missing-field and wrong-version cases; scripts/pm-ds15-event-contracts.py checks them and each checkpoint closure, nine-field token, identity, producer and consumer. The native boundary obligations in Plans/newtools.md#N2-223 remain NOT_RUN. Successful static checks never admit this family or settle retention.\nRound 1 semantic oracles: execute the exact-family cases in Plans/ds15_event_contract_fixtures.json through scripts/pm-ds15-event-contracts.py: original outcome and full receipt joins, recovery before/after append without repeat effect, changed-byte refusal, producer transition rejection, read-time deletion/permission changes, complete filtered coverage, full prior-value CAS, live snapshot/source/token changes, rebuild missing prefix, writer cutoff/drain and reader withdrawal/reinstallation. Fixtures contain concrete closed checkpoint values; each negative mutates an otherwise valid family-specific case. Static reference-model proof only; native execution NOT_RUN.\nRound 2 live.session.degraded oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 3 live.session.degraded oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Automated_Testing_System.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "ATS-326"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Automated_Testing_System.md"
  ]
}
```


### ATS-327 — DS15 independent family semantic oracle sections

```yaml
{
  "plan_unit_id": "ATS-327",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/Automated_Testing_System.md",
  "canonical_text": "browser.context_captured@1.0.0: independently adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-310; execute this exact family's concrete payload/checkpoint/custody/transition/coverage/CAS/withdrawal/permission/rebuild vectors in Plans/ds15_event_contract_fixtures.json via scripts/pm-ds15-event-contracts.py. Valid source/outcome/receipt joins return original identity without effect; changed joins refuse. Native execution NOT_RUN. No sibling fixture supplies this family's cases.\nRound 2 browser.context_captured oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN. Application capture additionally executes exact CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}, raw-hash/wrong-Server/wrong-original-operation negatives, and the unchanged Project recipe positive; genuine source identity comes from OriginalBrowserTransitionSource, never a checkpoint scope hash.\nRound 3 browser.context_captured oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.",
  "gui_related": false,
  "gui_classification_reason": "Durable event/runtime contract.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Automated_Testing_System.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "ATS-327"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Automated_Testing_System.md"
  ]
}
```


### ATS-328 — DS15 independent family semantic oracle sections

```yaml
{
  "plan_unit_id": "ATS-328",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/Automated_Testing_System.md",
  "canonical_text": "dev.session.started@1.0.0: independently adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-311; execute this exact family's concrete payload/checkpoint/custody/transition/coverage/CAS/withdrawal/permission/rebuild vectors in Plans/ds15_event_contract_fixtures.json via scripts/pm-ds15-event-contracts.py. Valid source/outcome/receipt joins return original identity without effect; changed joins refuse. Native execution NOT_RUN. No sibling fixture supplies this family's cases.\n\ndev.session.stopping@1.0.0: independently adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-312; execute this exact family's concrete payload/checkpoint/custody/transition/coverage/CAS/withdrawal/permission/rebuild vectors in Plans/ds15_event_contract_fixtures.json via scripts/pm-ds15-event-contracts.py. Valid source/outcome/receipt joins return original identity without effect; changed joins refuse. Native execution NOT_RUN. No sibling fixture supplies this family's cases.\n\ndev.session.stopped@1.0.0: independently adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-313; execute this exact family's concrete payload/checkpoint/custody/transition/coverage/CAS/withdrawal/permission/rebuild vectors in Plans/ds15_event_contract_fixtures.json via scripts/pm-ds15-event-contracts.py. Valid source/outcome/receipt joins return original identity without effect; changed joins refuse. Native execution NOT_RUN. No sibling fixture supplies this family's cases.\n\ndev.session.restarting@1.0.0: independently adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-314; execute this exact family's concrete payload/checkpoint/custody/transition/coverage/CAS/withdrawal/permission/rebuild vectors in Plans/ds15_event_contract_fixtures.json via scripts/pm-ds15-event-contracts.py. Valid source/outcome/receipt joins return original identity without effect; changed joins refuse. Native execution NOT_RUN. No sibling fixture supplies this family's cases.\nRound 2 dev.session.started oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 2 dev.session.stopping oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 2 dev.session.stopped oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 2 dev.session.restarting oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 3 dev.session.started oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.\nRound 3 dev.session.stopping oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.\nRound 3 dev.session.stopped oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.\nRound 3 dev.session.restarting oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.",
  "gui_related": false,
  "gui_classification_reason": "Durable event/runtime contract.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Automated_Testing_System.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "ATS-328"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Automated_Testing_System.md"
  ]
}
```


### ATS-329 — DS15 independent family semantic oracle sections

```yaml
{
  "plan_unit_id": "ATS-329",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/Automated_Testing_System.md",
  "canonical_text": "preview.session.started@1.0.0: independently adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-315; execute this exact family's concrete payload/checkpoint/custody/transition/coverage/CAS/withdrawal/permission/rebuild vectors in Plans/ds15_event_contract_fixtures.json via scripts/pm-ds15-event-contracts.py. Valid source/outcome/receipt joins return original identity without effect; changed joins refuse. Native execution NOT_RUN. No sibling fixture supplies this family's cases.\n\npreview.session.refreshed@1.0.0: independently adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-316; execute this exact family's concrete payload/checkpoint/custody/transition/coverage/CAS/withdrawal/permission/rebuild vectors in Plans/ds15_event_contract_fixtures.json via scripts/pm-ds15-event-contracts.py. Valid source/outcome/receipt joins return original identity without effect; changed joins refuse. Native execution NOT_RUN. No sibling fixture supplies this family's cases.\n\npreview.session.stopped@1.0.0: independently adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-317; execute this exact family's concrete payload/checkpoint/custody/transition/coverage/CAS/withdrawal/permission/rebuild vectors in Plans/ds15_event_contract_fixtures.json via scripts/pm-ds15-event-contracts.py. Valid source/outcome/receipt joins return original identity without effect; changed joins refuse. Native execution NOT_RUN. No sibling fixture supplies this family's cases.\nRound 2 preview.session.started oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 2 preview.session.refreshed oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 2 preview.session.stopped oracles: the exact family fixture supplies a complete EventRecord, exact eleven-field receipt, shared custody_v2/full-value result and independent selected global source. Execute replay-only append/recovery refusals, current publication permission/deletion/share/owner refusals with retained-receipt recovery positives, initial omitted-row plus rewritten-low refusal, every receipt-field contradiction, original full-value commitment corruption, semantic-only retry comparison and encoded partition/storage joins. Verified zero-match suffix after an existing match must advance and retain that match; no first-match means no checkpoint. Every concrete patterned payload/checkpoint field has a trailing-LF negative. Full-checker failure probes must exit nonzero when a refusal is replaced with success. Native NOT_RUN.\nRound 3 preview.session.started oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.\nRound 3 preview.session.refreshed oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.\nRound 3 preview.session.stopped oracles: bind every current and prior SP-278 token root key to the original event Storage instance, its checkpoint_ref to that exact root/generation and its dataset name to that generation; foreign key/reference selectors refuse for checkpoint and rebuild. Eagerly resolve every $ref, including optional properties, unused definitions and all branches, through the retained local schema-resource closure; an unresolved reference makes the full checker fail. Historical reads validate the immutable original transition, full event/receipt custody and current disclosure authorization, independently of later live workflow, source or composer state. Accept history-after-live-state-advances; refuse forged/invalid originals and deny deleted, unauthorized, unshared or withdrawn-reader disclosure. Current publication and new append recovery still require current transition/source joins. Execute all standing checks 1 through 10 and prior-finding mutations through the full checker. Native NOT_RUN.",
  "gui_related": false,
  "gui_classification_reason": "Durable event/runtime contract.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Automated_Testing_System.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "ATS-329"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Automated_Testing_System.md"
  ]
}
```
