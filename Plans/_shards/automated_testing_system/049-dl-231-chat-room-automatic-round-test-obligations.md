# Shard 049: DL-231 Chat Room automatic round test obligations

Source: `Plans/Automated_Testing_System.md`

Source lines: L6715-L7353

Source SHA256: `4db24ef59eb3dc78b5eae868648ddc0bdf299178ed54e00d0671bd7658d96c2b`

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


### ATS-315 - Memory maintenance prepared event oracles

```yaml
plan_unit_id: ATS-315
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Newly authored static oracles for the eight exact families in Plans/memory_maintenance_contracts.json. Run python3 scripts/pm_memory_maintenance_events.py against Plans/memory_maintenance_event_fixtures.json, payload/operation schemas and Plans/memory_maintenance_rebuild_target.schema.json. Boundary cases retain all original schema/admission/permission/source/withdrawal checks and additionally supply concrete phase-valid operation rows and retained synthetic full event values. They compare the complete original payload, including frozen timestamp, status/ref/hash, not asserted proof Booleans. Invalid completed rows with null start/terminal/outcome are rejected by the closed operation schemas.

  Each exact family owns stateful positive and negative traces for exact-prior whole-value CAS, failed/stale CAS with unchanged state, crash before/after start append and start-row advancement, settled effect, terminal append and terminal-row advancement, lost acknowledgement, retry and replay. Trace expectations are separately authored full operation snapshots, retained originals and effect/selector counters; the checker computes transitions and rejects repeated effect attempts, conflicting original outcomes and repeated swaps. Lexical and semantic traces separately interrupt durable target preparation and selector publication and compare the complete prepared descriptor/selected target, including post-swap/pre-effect recovery. Negative descriptors cover wrong target identity/manifest/source/prior selector, unsafe or mismatched artifacts and unprepared publication. A mutated succeeded/failed result with unchanged original custody must fail for every completed family.

  Each exact family additionally owns an independent current-writer boundary suite using the complete canonical EventRecord 2.0.0 schema with format checking, its own exact payload definition URI and dedupe_by_idempotency_key policy. Positive append and identical retry return the retained full-value original with one append and no maintenance effect; scoped dedupe keys use the encoded project~ partition. Both fresh append and retry with projector_replay_only refuse replay_only_not_appendable with no output, append or effect. Unsupported/missing envelope fields, wrong payload dispatch, Project/correlation/causation joins, trailing-LF event names and raw Project partitions are negative cases. Compatibility reader shapes are never accepted as current writers. The reduced phase-model values remain explicitly synthetic and are not canonical envelopes or physical receipts.

  Completed recovery has separate permission-revoked and family-withdrawn negative traces for every exact family, requiring no output and unchanged durable state; authorized recovery returns the original value. All four started gates distinguish lawful accepted pre-append admission from recorded receipt/later phases and reject missing original start custody through completed state. Post-completion retry and recovery with lost start custody refuse rather than infer proof from terminal IDs. Schema-level trailing-LF negatives cover every lane-owned patterned identifier, including nested target inventories/selectors and operation schema copies in the storage registry.

  Every completed-family current-writer suite checks retained-original retries in effect_committed and completed phases, for both succeeded and failed outcomes. Missing, changed or unflushed original start custody refuses start_receipt_missing before any original return; intact custody returns the exact terminal original without append or effect. Each of the eight exact families also rejects Application attempts, including CV-366-shaped application keys, because these contracts are Project-only. Maximum-width schema-valid UTF-8 payloads must fit the 16 KiB inline cap; oversized bodies fail the closed schema rather than acquire an undeclared large-body path. Storage-assigned sequence/observed/persisted retry changes individually return the original; changes to caller semantics conflict. SP-337 remains authoritative for any separately declared larger body.

  Each exact family's SP-278 adoption has a synthetic storage-identity join case reusing Plans/event_record_index_checkpoint_contract_fixtures.json's existing generic checkpoint positive and its canonical schema. The event identity binds the same operation storage_instance_id as the checkpoint and instance-qualified key. Foreign checkpoint storage, key or event identity fails. This tests only that join, creates no DMEM checkpoint/cursor and does not validate a native source inclusion or authorize disclosure. The external full-checker mutation audit must corrupt each family's negative expectation independently and require a nonzero checker exit. These in-process maintenance events have no process-exit field; exit_code=0 is an unknown payload property and is rejected, not interpreted as a maintenance outcome.

  Start custody gate oracle (fix round 4) for SP-630 to SP-637: the checker has one start_custody_gate and applies it at the commit point of every phase-model transition except crash, every canonical current-writer append or retry, every boundary acceptance and every history read; every earlier start-custody check calls the same gate. start_custody_matrix takes, for each exact family, every positive non-crash step of every unedited authored trace, retry and replay of every retained original, recovery from every phase, both terminal row advances (succeeded and failed), every positive writer and boundary case and a history read of every retained original. Each is first run intact as a positive control against its authored after-state and output, then once per start-record defect: missing, digest-only corruption, rehashed changed source value, coherently rehashed other operation, rehashed foreign storage identity, coherently rehashed foreign started family, coherently rehashed changed frozen time, unflushed receipt, extra record field, and a withdrawal fence. Every retained-value mutation refreshes its own digest and every identity or envelope copy affected by its one semantic change; digest-only corruption keeps the value intact. Started families also mutate the canonical writer's own retained start. Each negative cell must refuse exactly (start_receipt_missing; original_missing where the path's requested original is the start record itself; permission_or_withdrawal under withdrawal; false at the boundary) with no output and unchanged state, and each family's declared cell count must match. Absence is skipped only for first start admission from an accepted row. Operation cases reject a null, foreign or trailing-LF start receipt in every later phase of every operation definition.

  Standing check 11: `python3 scripts/pm_memory_guard_isolation.py --out <evidence-path>` runs all twelve fixture-declared custody matrices plus schema, writer, transition, checkpoint, boundary, history, reference and archive witnesses. Each negative first has an intact passing control. The audit removes one named predicate across its repeated sites, requires its own negatives to accept and the complete remaining corpus for that checker to retain its exact refusal, and restores the predicate. Integrity, flush, record shape, absence and retained-value binding are separate guards; no whole start-gate no-op counts as proof. Missing-byte and withdrawal witnesses use the actual common custody gate, without fabricating absent originals; other custody witnesses execute the complete model entry point. This is synthetic static evidence, with native custody and physical atomicity still NOT_RUN.

  Canonical historical-reader oracles additionally run Plans/memory_canonical_history_fixtures.json through read_canonical_history for each exact family. They resolve an immutable write-time operation witness and full retained EventRecords, verify the same original-start identity/flush/digest/custody gate, and compare every producer/payload join. Ordinary 2.0.0, replay-only 2.0.0, the envelope owner's frozen 1.0.0 compatibility reader and replay-only compatibility originals remain readable after arbitrary live operation/source/request/selector/counter changes, current admission removal or absent cutoffs. Current-writer replay restrictions never reach those historical originals. Missing/corrupt/unflushed start custody, forged commitments, coherently rehashed foreign Project/storage identity or producer/body values, unknown families, revoked access and withdrawal refuse. Complete schemas independently own required/unknown fields; binding removal never suppresses required-field errors.

  Current producer-semantic projections and current identity inputs use safe-integer-write-v2: their numeric leaves are integers in the I-JSON safe range -9007199254740991 through 9007199254740991; existing nonnegative domains keep their lower bound. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Plans/memory_storage_uint64_fixtures.json and scripts/pm_memory_storage_metadata.py exercise every family through the complete current writer and metadata-only retry at 0, 2^53-1, 2^53, 2^53+1, 2^60 and 2^64-1; 2^64, -1, booleans, typed 1.0, strings, null, arrays and objects refuse. The guard-removal table cuts each Storage type exclusion and each bound separately, proves repeated sites individually, flips only that invariant’s negatives and restores them; the general envelope-schema mutation retains these independent Storage predicates. Decode decimal/exponent tokens losslessly before validation. Identity, idempotency, result and target commitments use sorted-key compact UTF-8 JSON after recursive exact integer normalization: 1, 1.0 and 1e0 encode as 1; -0 encodes as 0. Current producer fractions, nonfinite values and out-of-range producer integers refuse before hashing or append. Full EventRecord commitments reuse the existing integer-json-v1 encoding with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two envelope editions share the same numeric/hash recipe, and current writes are a byte-identical subset, so no edition change can select weaker numeric hashing. Reader dispatch is closed by schema_id/schema_version; no caller recipe override, permissive fallback or current writer predicate reaches a historical commitment. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the same frozen recipe; only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds, the separate producer bounds and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time and uuid format is explicitly enforced without optional validator packages: a timestamp requires a real calendar date/time and explicit RFC3339 zone, allows a nonempty decimal fraction, and refuses leap seconds, bad fields/separators, missing zones and trailing LF; existing UTC-Z and length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. These enforce the existing format contract, not a narrower historical format edition. Per-family Plans/memory_write_recipe_fixtures.json records 48 integral and 24 integral-binary64 actual old-writer receipts, large retained values in every mode, and original-recipe rebuild artifacts; none is repaired during evaluation. Plans/memory_maintenance_boundary_fixtures.json retains current numeric/type controls. Every formatted leaf of every used schema, including dormant checkpoint branches and frozen definitions, has malformed/edge-case negatives and allowed fractional/leap-day positives. The guard proof removes one guard or named duplicate set at a time: current numeric normalization plus numeric schema bounds; historical integrality plus its integer schemas; format enforcement plus UTC/end-of-input patterns on formatted leaves only. Required/unknown fields, unrelated types and lower bounds stay enabled. Structural schema removal retains the separate format guard. Permission/admission/withdrawal and all receipt/source/acceptance fields retain exact Boolean checks. Every input/output archive memory retains exact Boolean pinned/archived checks and unchanged DL-402 evidence/version/pin preservation. The sequential --family mode checks free RAM before each family and guard and pauses below 6 GiB available.

  history_families checks standing check 10 for each exact family: a retained original is returned unchanged after completion and when the source revision, request digest, counters or (for rebuilds) selector have changed; a withdrawal fence, revoked access, forged hash, rehashed changed value, rehashed foreign identity, missing start custody, unwritten original, another family's type and a trailing-LF type refuse without changing state. reference_cases checks standing check 9: before any instance validation the checker walks every subschema of every schema document it uses and of the registry mirrors, follows nested $id bases, resolves every $ref offline and fails on any unresolved one. Each family has dormant, active, nested-base, cross-document and unknown-document mutations, and definitions are validated inside their own documents.

  These are a static contract model and adversarial fixtures. They do not execute MemoryMaintenance, authenticate real SP-286 receipts, validate physical SeglogFrameV2 bytes or prove redb/filesystem atomicity/flush, native crash recovery, backup/restore or read-time deletion/permission races. Those native obligations remain NOT_RUN. Static success confers no Event Authority, retention assignment or deletion policy. The four monthly-summary/prune families have conditional payload and operation definitions under ATS-316; activation still requires their own admission, operation/result retention resolution and an authenticated binding of the DL-446/DL-447 cutoffs. Card 6 supplies those cutoff values; the independent activation gates remain.

  Card 6 policy oracles execute scripts/pm_memory_policy.py through each exact --family checker using Plans/memory_card6_policy_fixtures.json. DL-444/DL-445 positives cover oldest creation time, same-time stable-ID tie, preserved evidence/merge history, archive-only copies and excluded pins. Negative post-states carry one semantic defect, with survivor-dependent archive/link/lineage copies changed coherently for a wrong-survivor case. DL-446/DL-447 positives and refusals cover 89/90 and 179/180 idle days, exact duration boundaries, scores 0.0999/0.10 and 0.0499/0.05, independent edit/access fallback, both conditions together, each Project separately and refusal of no-project execution. Each negative must produce only its named failed predicate; the full checker must exit nonzero on a wrong oracle. Round-11 preservation checks compare exact primitive types before values recursively, including selected and unselected originals, nested evidence/version/metadata values and full expected results. Dedup input flags must be exact Booleans; output flags must match exact Boolean originals or the explicitly permitted Boolean archived state. Boolean/integer aliases, typed floats, strings, null, arrays and objects have isolated one-field negatives. Full-checker wrong typed expected results must fail. Compare owner-admitted creation instants and elapsed idle durations with every fractional digit preserved, without truncation or a precision cap; retained timestamp spellings and commitments stay unchanged. Early, equal and late 90/180-day boundaries cover edit, access, creation fallback and capture at 9, 18 and 40 fractional digits; creation-order and stable-note-ID tie cases cover the same precisions. The dedup no-project input has coherent Project copies and a separate foreign-Project join negative. Minimum group size, unique IDs and original existence each have their own negative and per-predicate removal witness with peers enabled. The general local proof inventory and compound cuts remain S4 for shared-tool adoption; this round does not claim a complete check-11 proof from that local tool. Snapshot usefulness scores remain owner-declared values outside integer identity recipes. No count cutoff, lane-local serializer or native proof is introduced. Existing number/format recipe and guard-proof machinery issues are shared-sweep items, not repaired here. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447 on origin/plans/ea-cards2-answers-20261105.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- SP-630
- SP-631
- SP-632
- SP-633
- SP-634
- SP-635
- SP-636
- SP-637
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### ATS-316 - Card 1b maintenance oracles

```yaml
plan_unit_id: ATS-316
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: For memory.monthly_summary.started, memory.monthly_summary.completed, memory.prune_archive.started
  and memory.prune_archive.completed, each at 1.0.0, execute scripts/pm_memory_archive_events.py against Plans/memory_archive_event_fixtures.json.
  Each exact family adopts ATS-315 and the SP-636/SP-637 first-start-custody model by explicit SP-638/SP-639/CV-658/CV-659
  adoption, not sibling admission. Test the closed separate payload and operation definitions, full EventRecord
  2.0.0, encoded Project partition, storage-assigned retry-field exclusion, replay-only refusal, both terminal outcomes,
  CAS, start receipt on all writer/effect/recovery/history paths and SP-278 storage joins. Test cutoff refusal for
  automatic, Memory-panel and direct invocation with no operation/effect/append/output; buttons unavailable with
  a reason; synthetic authority exercises the DL-446/DL-447 approved values without granting runtime admission. Historical originals stay readable with current
  cutoffs absent and source/request/counters changed, but forgery, access revocation and withdrawal refuse. Archive
  oracles compare selected originals in full except the allowed archived change, preserve all evidence refs/version refs and pins, and reject deletion/merging a pin. Cutoff lookup keys, resolved self-references and frozen operation refs must identify exactly one record; copied content hashes and all owner fields agree. A contradictory or ambiguous reference refuses despite coherent rehashing and intact start custody. Every negative is derived
  from an intact control; run the whole negative corpus with each logical guard removed, report negatives that flip
  and all others that remain rejected, and restore the guard. A failed oracle must produce a nonzero process exit;
  unresolved refs including dormant branches fail. Bounds enforce 16 KiB and trailing LF rejection. Physical transactions,
  receipts, flushes and native GUI execution are NOT_RUN. No admission or runtime activation is authorized by these tests.

  Card 6 policy oracles execute scripts/pm_memory_policy.py through each exact --family checker using Plans/memory_card6_policy_fixtures.json. DL-444/DL-445 positives cover oldest creation time, same-time stable-ID tie, preserved evidence/merge history, archive-only copies and excluded pins. Negative post-states carry one semantic defect, with survivor-dependent archive/link/lineage copies changed coherently for a wrong-survivor case. DL-446/DL-447 positives and refusals cover 89/90 and 179/180 idle days, exact duration boundaries, scores 0.0999/0.10 and 0.0499/0.05, independent edit/access fallback, both conditions together, each Project separately and refusal of no-project execution. Each negative must produce only its named failed predicate; the full checker must exit nonzero on a wrong oracle. Round-11 preservation checks compare exact primitive types before values recursively, including selected and unselected originals, nested evidence/version/metadata values and full expected results. Dedup input flags must be exact Booleans; output flags must match exact Boolean originals or the explicitly permitted Boolean archived state. Boolean/integer aliases, typed floats, strings, null, arrays and objects have isolated one-field negatives. Full-checker wrong typed expected results must fail. Compare owner-admitted creation instants and elapsed idle durations with every fractional digit preserved, without truncation or a precision cap; retained timestamp spellings and commitments stay unchanged. Early, equal and late 90/180-day boundaries cover edit, access, creation fallback and capture at 9, 18 and 40 fractional digits; creation-order and stable-note-ID tie cases cover the same precisions. The dedup no-project input has coherent Project copies and a separate foreign-Project join negative. Minimum group size, unique IDs and original existence each have their own negative and per-predicate removal witness with peers enabled. The general local proof inventory and compound cuts remain S4 for shared-tool adoption; this round does not claim a complete check-11 proof from that local tool. Snapshot usefulness scores remain owner-declared values outside integer identity recipes. No count cutoff, lane-local serializer or native proof is introduced. Existing number/format recipe and guard-proof machinery issues are shared-sweep items, not repaired here. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447 on origin/plans/ea-cards2-answers-20261105.
gui_related: true
gui_classification_reason: Includes unavailable Memory-panel button contract.
depends_on:
- ATS-315
- SP-638
- SP-639
- CV-658
- CV-659
unblocks: []
acceptance_criteria:
- All four families pass the static suite with exact refusal, unchanged state and no output.
- Each guard-removal row proves its own negatives flip and all other negatives remain rejected.
validation_surfaces:
- python3 scripts/pm_memory_archive_events.py
risk_class: event_authority_oracle
reasoning_tier: high
context_scope: ea_DMEM_card1b_20261104
implementation_surfaces:
- scripts/pm_memory_archive_events.py
- Plans/memory_archive_event_fixtures.json
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-card1b-search.json
preserved_exact_tokens:
- cutoffs_unavailable
- NOT_RUN
negative_constraints:
- No admission, automatic deletion or native proof.
```
