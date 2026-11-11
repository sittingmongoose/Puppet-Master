# Shard 064: DL-231 Chat Room definition and command shapes

Source: `Plans/Contracts_V0.md`

Source lines: L23972-L24488

Source SHA256: `974b4a737050357f760deafa8f6247c7679b93d6352a1c45684f72d219510105`

---

## DL-231 Chat Room definition and command shapes

### CV-364 - Chat Room Pause Field And Reconfiguration Shape

```yaml
plan_unit_id: CV-364
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  DL-231 and CWR-044 extend CollaborativeDefinition, pm.collaboration.definition.v1, in Plans/collaborative_workflows_contracts.schema.json with the Chat Room-only boolean pause_between_rounds, default false. It is forbidden on Crew, Review and BrainStorm. An absent field reads false, so existing definitions need no rewrite, new schema version, physical family or migration row. A committed new sheet carries its choice; the Settings alias assistant.multi_agent.chat_room.pause_between_rounds supplies the setup default only and later Settings edits never change a committed room. reconfigure_change adds set_pause_between_rounds with boolean pause_between_rounds; CollaborationReconfigureRequest and CollaborationReconfigureResult keep their identities, revision/currentness check and one system entry. The change applies at the next round boundary without cancelling a turn, and switching off while waiting between rounds starts the next round immediately. ChatRoomRoundRequest and ChatRoomRoundResult keep their schema IDs and command identity cmd.chat_room.next_round for the user's start of exactly one round at the switch-on between-round wait; otherwise run_state_invalid. Automatic starts dispatch no command. The existing schema/fixture pair remains in CONTRACT_PAIRS; structural fixtures and fixture-only owner-state joins prove no native handler, automatic progression, storage transaction or EventRecord admission. The app Chat Room counterpart references CWR-045 and CV-366’s separately versioned definition/run graph; the pause_between_rounds restriction and existing command/reconfigure semantics remain identical. No new event producer or scheduler follows from app scope.
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
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-work-packages;
  /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md; C-F07
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


### CV-365 - Application Scope Routes And Existing Thread Facades

```yaml
plan_unit_id: CV-365
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  WorkflowScopeV2, logical pm.workflow_scope.v2 version 2.0.0, is the single explicit application/Project scope contract at Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2. Its required members are schema_id, schema_version, scope_kind, scope_partition, server_id, project_id, project_home_server_id and named_plan_id; no unknown members. server_id is the real owning Server, not a display Computer or client device. Application requires scope_kind=application, scope_partition=app and required-present null project_id/project_home_server_id/named_plan_id. Project requires the actual nonempty Project/Home Server, scope_partition=project~ plus unpadded base64url of exact UTF-8 project_id under existing Storage §2.2.5, and a real named_plan_id only when actually referenced, otherwise null. Empty/sentinel Project strings, mismatched outer/inner scope and focus-based inference refuse. A scope is not an execution context: Server-owned Settings/pause need no fabricated thread; every chat/task execution envelope additionally requires actual thread/Server/Host/Environment/root identities and applicable run/Goal/Crew/Plan/schedule refs. Before first message use draft_id, never a fabricated durable thread.
  CV-169’s reconciled route vocabulary includes application. App routes, WebSocket identity, permission and payload contexts bind exact scope/object/Server and issued currentness/return. Conversion reissues destination auth/route/permission rather than reusing source capability. Default/Computer Settings, settings.follow and client reachability grant no Project/content/execution authority. Explicit projects.* reads owned by Plans/Tools.md and Plans/Permissions_System.md use current source-Computer access and coverage; actual Project writes use that Project’s chat/owner/conversion.
  Thread preview is a typed local draft projection: ui.thread.request.preview and ui.thread.spawn.preview, not new domain commands or fresh authority. Send reuses the registered cmd.thread.request -> handlers::thread::request and cmd.thread.spawn -> handlers::thread::spawn; cmd.thread.await retains its existing wait owner and adds the explicitly selected ThreadAwaitRequestScopeV2/ThreadAwaitResultScopeV2 compatibility union. The proposed cmd.thread.request.preview/send and cmd.thread.spawn.preview/send spellings are rejected duplicates, not aliases. New ThreadRequestFacadeRequestV2/ResultV2 and ThreadSpawnFacadeRequestV2/ResultV2 live at Plans/application_workflow_contracts.schema.json#/$defs/<name>, each logical pm.thread.<request|spawn>.facade_<request|result>.v2 version 2.0.0. Legacy requests retain their exact interpretation; the new send variants are explicit schema/version selectors and do not add operation=preview.
  A preview binds sender scope/thread/Computer/mode and receiver scope/thread or bounded requested child role, exact bounded body/context ref+hash, parent Goal/Plan/run/agent lineage, request/spawn id, permission ceiling, target/topology/body generations, automatic_round_trip_count, offline expiry and origin return. Keep protected input/credential bytes out. preview_sha256 uses CV-366’s thread-preview domain; expires_at and the captured revisions make stale state explicit. Result display is truthful draft/as-of state, not an allow receipt. Send revalidates actual source/target/mode/Off/permission/Stop/body/preview/currentness immediately before the one durable outbox commit. Request uses request_id, spawn uses spawn_request_id; conflicting same identity/digest refuses, duplicate same intent returns the original continuity result. No new conversation transport, branch command or queue is created. Incoming receiver-owned accept/decline uses the existing commands owned by Plans/Commands_System.md; sender authority never changes receiver mode or answers its retained approvals. Three automatic round trips and one-day offline expiry remain. Return preserves exact request/child/target/initiating Client, route/focus/context revision and continuation generation. Preview is no-persist/no EventRecord; Send keeps existing continuity/outbox result and no EventRecord pending Event Authority. Handler absence remains handler_unavailable. The local preview envelope defs ThreadFacadePreviewLocalActionRequestV2 and ThreadFacadePreviewLocalActionResultV2 also live in the new app resource; logical IDs are pm.thread.facade_preview.local_request.v2 and pm.thread.facade_preview.local_result.v2, both 2.0.0. No facade or ScopeV2 alias is added inside full_thread_runtime_contracts.schema.json or goal_runtime_contracts.schema.json or goal_body_custody.schema.json: their whole bytes are selected by ten frozen source manifests. General aggregate companions not selected whole by a frozen bank may add $ref aliases while retaining original definitions; any selected-whole aggregate uses a new-resource alias instead. Pure conversation/internal planning carries an explicit empty admitted-root set and null working_directory until an actual file/command creates the lazy folder or a directory grant supplies a root. Null cwd never launches a process or triggers HOME/CWD/Project fallback.
  Application-only logical codecs constrain WorkflowScopeV2 to scope_kind=application, including schedule, quota consent, artifact, Home and Goal payload siblings. A physical wrapper joins its complete scope, server_id and storage_instance_id to the corresponding logical fields or application_context; individually valid but different outer/inner identities refuse before custody or dispatch. Project codecs remain separate.
  ThreadAwaitRequestApplicationV2 binds actual app sender context, original request_id/await_request_id, exact receiver scope/thread/generation, condition, expiry, outbox evidence and reply route without Project Home Server or Source Location placeholders. Its result preserves those joins and the existing ordered reply sequence, expiry, cancellation and idempotent wait identity. ThreadAwaitRequestScopeV2/ResultScopeV2 preserve the historical Project request/result exactly and use handlers::thread::await_condition for both app-to-Project and app-to-app waits; a reply from another request, receiver or sequence cannot settle this wait.
  SettingsOperationContextV1 carries actual record scope/storage, actor, permission/writer generations, initiating Client route/focus and idempotent return. Its settings_surface/setup origin has no execution root or task/thread requirement; a thread origin embeds the unchanged strict WorkflowCommandContextV1. Selected Settings preview/apply/rollback V3 compatibility unions add this owner context, with exact destination level/Computer/Device and preview generation joins. AttachmentOwnerContextV1 instead discriminates pre-message draft ownership from committed-thread execution, preserving actual Host/root and composer identity. StarterCatalogContextV1 is an application record/catalog owner context without a thread. These editions do not weaken execution contexts or mint a thread/Project for owner metadata work.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- CV-054
- CV-169
- CV-327
unblocks: []
acceptance_criteria:
- Scope union distinguishes real app from missing Project and separates scope from execution context.
- Two existing thread primaries/handlers and local previews share exact bounded intent/currentness/receiver joins.
- Legacy exact requests/routes remain readable; new contexts do not widen authority.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: projects_refresh_application_workflows
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F04
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F12
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F02
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F03
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F05
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F08
preserved_exact_tokens:
- WorkflowScopeV2
- pm.workflow_scope.v2
- scope_kind=application
- project_id=null
- scope_partition=app
- project~
- cmd.thread.request
- cmd.thread.spawn
- ui.thread.request.preview
- ui.thread.spawn.preview
- ThreadRequestFacadeRequestV2
- ThreadSpawnFacadeRequestV2
negative_constraints:
- No synthetic Project, second messenger, four duplicate facade commands, operation=preview effect branch or borrowed
  source capability.
- Acceptance does not prove native handlers, Event Authority admission, durability, readiness or governance certification.
owner_hints:
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Contracts_V0.md#CV-365


### CV-366 - App Versions Semantic Hashes And Whole Source Graphs

```yaml
plan_unit_id: CV-366
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  The frozen application tables attached to this unit define selected versioned siblings, never an in-place relaxation of a Project codec. Existing Project resource bytes, schema IDs/versions, original accepted-source/hash domains, source/cancel/certification banks and replay readers remain exact. Current compatibility $refs may be added in non-frozen aggregate companions, but never replace an immutable historical resource or rebind an old literal URI to new contents. New app logical IDs use .application.v1 and 1.0.0; shared WorkflowScopeV2 and the thread facade editions are explicit v2 exceptions. The Plans/assistant_plan_runtime_contracts.schema.json and Plans/assistant_plan_runtime_contract_fixtures.json pair was created with original Project definitions under their own exact identities and references to the new app definitions, never a duplicate Plan engine.
  Hash domains are frozen separately from payload-store addressing and physical codecs. New application semantic hashes use pm.application.semantic_hash.v1: SHA-256, lowercase hex, over UTF-8 domain prefix "pm.application.semantic_hash.v1\0" + exact closed kind + "\0" + RFC8785 canonical JSON of a lossless typed tree. The typed tree is ["null"], ["bool",value], ["string",exact Unicode scalar string], ["int",canonical signed base-10 integer string with no +/leading zero/-0], ["float64",sixteen lowercase hex digits of the big-endian IEEE754 finite value], ["array",ordered typed children] or ["object",[[exact key,typed value],...]] with keys in unsigned UTF-8 byte order. Duplicate keys, non-scalar Unicode, NaN/infinity and unknown kinds reject; strings are never normalized/trimmed. This retains arbitrary exact integer identity without coercing values to floating point. Physical records still use their declared numeric types.
  Closed semantic kinds are goal_body_currentness, goal_objective_revision, accepted_source, operation_intent, thread_preview, schedule_target, conversion_manifest and source_graph. Each preimage is a closed object: schema_id/schema_version of the selected semantic record, WorkflowScopeV2, the complete semantic record and purpose-specific immutable identity. goal_body_currentness uses the exact eleven-field Goal body with only currentness_hash omitted, plus scope; objective revision hashes its full selected revision including source body link. operation_intent includes command/owner interface, exact actor/target/input/source commitments, expected revisions/Stop/permission/writer generations and idempotency identity; thread_preview includes the full redacted CV-365 preview including expiry. schedule_target includes actual target version/hash/topology/team or exact message text/attachments/destination/time/runtime snapshots. conversion_manifest covers the entire CV-367 manifest excluding only its self-hash. source_graph covers the complete resource/method/graph manifest excluding only graph_sha256. A source hash authenticates bytes only; accepted-source authority still requires its genuine original owner joins.
  App physical codec pm.application.physical_messagepack.v1 is deterministic MessagePack of the complete closed wrapper: maps in unsigned UTF-8 key order, minimal integer widths (positive values use unsigned encodings), exact UTF-8 strings without normalization, declared binary as MessagePack binary, finite floats as IEEE754 binary64, arrays in semantic order, no duplicate keys, trailing data or nonminimal encoding. SHA-256 of those exact encoded wrapper bytes is physical_record_sha256, never body currentness/source/semantic digest. Original Project MessagePack/JSON codecs are unchanged. CV-339/SP-286 shared append/wire/full-value commitments stay their own exact domains; SP-337 BLAKE3 payload IDs and immutable binary bytes are not converted to SHA-256 or re-encoded through JSON.
  App producer idempotency keys incorporate actual server_id and original owner operation identity as application@1:{hex(server_id)}:{hex(owner_operation_id)}; the existing storage lifetime tuple remains (scope_partition,event_type,idempotency_key) and app-root-global event_id remains unchanged. Every optional effect uses an exact declared operation component before hashing; no retry timestamp/focus can remint an original source. Same identity/same semantic digest returns the original result; different digest conflicts; missing authoritative dedupe is dedupe_unavailable with zero new effect. Reversible Project partitions keep Storage’s project~base64url rule, never a new project:hex scheme.
  The attached table is the closed event/app-source selection policy. Its CompactionCompletionApplicationV1 shape and source are non-emitting candidates only: context.compaction.completed remains project_only, DL-300 admits no app edition, and missing_event_registration persists until separate Event Authority admission and complete owner adoption. A schema/source row is not an append or event-checkpoint grant. settings.layer.changed is application-only; normal chat/history/run/tool/Usage/recovery/Goal/Crew/Plan/schedule/attention/layout app variants are application_or_project only for their actual admitted writer. Every selected variant must join full original source, commit/append/first-receipt, canonical or derived read/checkpoint, backup/restore and retention. New approval.chat_tool_requested/resolved payloads are thread/tool/target bound, distinct from Project Orchestrator node approval events. Wizard handoff, PRD/PlanningRun/NamedPlan/WorkNode/gates and frozen Workflow/certified sources stay Project-only. Unknown/missing source, version or family is unavailable/quarantined; a registry or all-true fixture boolean cannot admit native writes. Existing notebook/plugin/auth/pause/scheduler candidate/non-emitting dispositions remain until their own complete admission. goal.paused/resumed or any other required unregistered semantic name cannot emit by inference; missing_event_registration is preserved. App support is an accepted requirement, while native availability and exact source adoption remain evidence-bounded.
  The developer-session resources are separately selected in Plans/developer_session_application_contracts.schema.json: DebugSessionRecordApplicationV1 and EvalSessionRecordApplicationV1 plus their physical wrappers. OriginalDebugSessionSource and OriginalEvalSessionSource select owner.debug.session.application@1.0.0 and owner.eval.session.application@1.0.0 under the existing DebugSessionBroker/EvalSessionBroker. The two added ordered source graphs cover original intent, pending/lease/Stop fence, commit, receipt/result/read, coherent backup and retention; both stay specified_unimplemented. Browser sources/profile/page/controller records belong only to the browser owner. Project dev_session_record/eval_session_record codecs and sources retain exact bytes.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- CV-365
- CV-317
- CV-339
- DL-300
unblocks: []
acceptance_criteria:
- Every selected sibling has exact logical ID/root/version/source methods and full offline resource closure.
- Semantic, original-source, physical, payload and append hashes stay separate; exact Project resources pass unchanged.
- Each graph edge is genuinely adopted or explicitly unavailable; historical/certified exclusions never gain app
  writes.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: projects_refresh_application_workflows
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-F11
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F10
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F11
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F05
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F09
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F10
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F05
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F11
preserved_exact_tokens:
- .application.v1
- 1.0.0
- pm.application.semantic_hash.v1
- pm.application.physical_messagepack.v1
- WorkflowScopeV2
- dedupe_unavailable
- BLAKE3
- project~
- specified_unimplemented
negative_constraints:
- No recursive nullable rewrite, excerpt source bank, old source restamp, native all-true witness or Event Authority
  inference.
- Acceptance does not prove native handlers, Event Authority admission, durability, readiness or governance certification.
owner_hints:
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Contracts_V0.md#CV-365


**CV-366 frozen application roots**

Every row is version `1.0.0` and its sole `$defs/<definition>` lives in `Plans/application_workflow_contracts.schema.json`; the $id is `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json`. Each logical schema_id is closed and matches its selected wrapper. Do not silently bind these IDs to old Project definitions. Pure bounded reference/enum helpers may reference unchanged complete resources; scope-sensitive definitions are explicit new shapes.

| Definition | Logical schema_id | Semantic owner | Original-source root in Plans/application_workflow_sources.schema.json#/$defs/ |
|---|---|---|---|
| `ExecutionUnitContextApplicationV1` | `pm.execution_unit_context.application.v1` | EP-132 / SIR-055 | `OriginalApplicationRunStartSource` |
| `GoalRecordApplicationV1` | `pm.goal.record.application.v1` | GRS-086 / SP-351 | `OriginalGoalStartSource` |
| `GoalObjectiveRevisionApplicationV1` | `pm.goal.objective_revision.application.v1` | GRS-086 / SP-351 | `OriginalGoalUpdateSource` |
| `GoalObjectiveOriginApplicationV1` | `pm.goal.objective_origin.application.v1` | GRS-086 / SP-351 | `OriginalGoalStartSource` |
| `GoalBodyControlApplicationV1` | `pm.goal.body_control.application.v1` | GRS-086 / SP-351 | `OriginalGoalCancelSource` |
| `GoalMutationReceiptApplicationV1` | `pm.goal.mutation_receipt.application.v1` | GRS-086 / SP-351 | `OriginalGoalUpdateSource` |
| `GoalCommandRequestApplicationV1` | `pm.goal.command_request.application.v1` | GRS-086 | `OriginalGoalStartSource` |
| `GoalCommandResultApplicationV1` | `pm.goal.command_result.application.v1` | GRS-086 | `OriginalGoalStartSource` |
| `GoalExecutionBindingApplicationV1` | `pm.goal.execution_binding.application.v1` | GRS-086 / EP-132 | `OriginalApplicationRunStartSource` |
| `GoalCancelSourceApplicationV1` | `pm.goal.cancel_source.application.v1` | GRS-086 / EP-132 | `OriginalGoalCancelSource` |
| `CollaborationDefinitionApplicationV1` | `pm.collaboration.definition.application.v1` | CWR-045 | `OriginalCoordinationAppendSource` |
| `CollaborationRunApplicationV1` | `pm.collaboration.run.application.v1` | CWR-045 | `OriginalApplicationRunStartSource` |
| `CollaborationParticipantApplicationV1` | `pm.collaboration.participant.application.v1` | CWR-045 | `OriginalCoordinationAppendSource` |
| `CollaborationMessageApplicationV1` | `pm.collaboration.message.application.v1` | CWR-045 | `OriginalCoordinationAppendSource` |
| `CollaborationQuestionBankApplicationV1` | `pm.collaboration.question_bank.application.v1` | CWR-045 | `OriginalCoordinationAppendSource` |
| `CrewAutoApplicationV1` | `pm.collaboration.crew_auto.application.v1` | CWR-045 | `OriginalCoordinationAppendSource` |
| `AgentMessageApplicationV1` | `pm.coordination.agent_message.application.v1` | OSI-440 | `OriginalCoordinationAppendSource` |
| `CoordinationProjectionApplicationV1` | `pm.coordination.projection.application.v1` | OSI-440 / SP-351 | `OriginalCoordinationAppendSource` |
| `CoordinationCheckpointApplicationV1` | `pm.coordination.checkpoint.application.v1` | OSI-440 / SP-351 | `OriginalCoordinationAppendSource` |
| `AssistantPlanRecordApplicationV1` | `pm.assistant_plan.record.application.v1` | APR-073 | `OriginalAssistantPlanCancelSource` |
| `AssistantPlanDocumentRevisionApplicationV1` | `pm.assistant_plan.document_revision.application.v1` | APR-073 | `OriginalAssistantPlanCancelSource` |
| `AssistantPlanRunApplicationV1` | `pm.assistant_plan.run.application.v1` | APR-074 | `OriginalApplicationRunStartSource` |
| `AssistantPlanAdherenceApplicationV1` | `pm.assistant_plan.adherence.application.v1` | APR-012 / APR-074 | `OriginalApplicationRunStartSource` |
| `AssistantDeepPlanLedgerApplicationV1` | `pm.assistant_deep_plan.ledger.application.v1` | PLS-024 | `OriginalAssistantPlanCancelSource` |
| `AssistantDeepPlanBundleApplicationV1` | `pm.assistant_deep_plan.bundle.application.v1` | PDS-023 | `OriginalAssistantPlanCancelSource` |
| `AssistantPlanCancelApplicationV1` | `pm.assistant_plan.cancel.application.v1` | APR-016/017 / CV-368 | `OriginalAssistantPlanCancelSource` |
| `ScheduledMessageApplicationV1` | `pm.scheduled_message.application.v1` | SQR-019 | `OriginalScheduleDispatchSource` |
| `ExecutionScheduleApplicationV1` | `pm.execution.schedule.application.v1` | SQR-019 | `OriginalScheduleDispatchSource` |
| `QuotaResumeConsentApplicationV1` | `pm.runtime.quota_resume_consent.application.v1` | SQR-019 | `OriginalScheduleDispatchSource` |
| `ScheduleRunBindingApplicationV1` | `pm.execution.schedule_run_binding.application.v1` | SQR-019 | `OriginalScheduleDispatchSource` |
| `ExecutionOccurrenceApplicationV1` | `pm.execution.occurrence.application.v1` | SQR-019 | `OriginalScheduleDispatchSource` |
| `ApplicationAutomationPauseRecord` | `pm.runtime.application_automation_pause.v1` | SQR-020 / CV-368 | `OriginalApplicationPauseSource` |
| `ApplicationPermissionSnapshot` | `pm.permissions.snapshot.application.v1` | PS-145/148 | `OriginalApplicationRunStartSource` |
| `ChatToolApprovalApplicationV1` | `pm.approval.chat_tool.application.v1` | PS-145 / HITL-038 | `OriginalApplicationRunStartSource` |
| `BrowserWorkspaceApplicationV1` | `pm.browser.workspace.application.v1` | CV-332 | `OriginalBrowserTransitionSource` |
| `BrowserSessionApplicationV1` | `pm.browser.session.application.v1` | CV-332 | `OriginalBrowserTransitionSource` |
| `DebugSessionRecordApplicationV1` | `pm.debug_session.record.application.v1` | SMPFS-139 | `OriginalDebugSessionSource` |
| `EvalSessionRecordApplicationV1` | `pm.eval_session.record.application.v1` | SMPFS-140 | `OriginalEvalSessionSource` |
| `BrowserProgramApplicationV1` | `pm.browser.program.application.v1` | SMPFS-141 | `OriginalBrowserTransitionSource` |
| `RestorePointApplicationV1` | `pm.restore_point.record.application.v1` | ACD-086 / SP-349 | `OriginalRestoreLifecycleSource` |
| `CompactionCompletionApplicationV1` | `pm.context.compaction_completed.application.v1` | ACD-461 | `OriginalRestoreLifecycleSource` |
| `WorkingNotebookApplicationV1` | `pm.working_notebook.application.v1` | WN-021 | `OriginalNotebookMutationSource` |
| `WorkingNotebookEntryApplicationV1` | `pm.working_notebook.entry.application.v1` | WN-021 | `OriginalNotebookMutationSource` |
| `WorkingNotebookCheckpointApplicationV1` | `pm.working_notebook.checkpoint.application.v1` | WN-021 | `OriginalNotebookMutationSource` |
| `MemoryViewApplicationV1` | `pm.assistant_memory.view.application.v1` | AMS-054 | `OriginalMemoryMutationSource` |
| `HomeLayoutApplicationV1` | `pm.home_workspace_layout.application.v1` | F3-630 / SP-349 | `OriginalHomeLayoutMutationSource` |
| `RequestedEffectiveApplicationV1` | `pm.requested_effective_runtime.application.v1` | EP-132 / SIR-055 | `OriginalApplicationRunStartSource` |
| `TodoWorkBindingApplicationV1` | `pm.todo.work_binding.application.v1` | TDR-001 / EP-132 | `OriginalApplicationRunStartSource` |
| `RuntimeArtifactApplicationV1` | `pm.runtime_artifact.application.v1` | RAP-059 | `OriginalApplicationRunStartSource` |
| `ChatPlaceV1` | `pm.chat.place.v1` | ACD-508 | `OriginalChatMoveSource` |
| `ChatMoveManifestV1` | `pm.chat.move_manifest.v1` | ACD-510/511 | `OriginalChatMoveSource` |

**CV-366 exact Goal family disposition**

| Existing event_type | Pinned current Project payload/resource | App selection |
|---|---|---|
| `goal_run.blocked` | `pm.goal_runtime_event.goal_run_blocked.schema.v2` / `Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_run_blocked.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalRunBlockedEventApplicationV1`; complete source/admission required |
| `goal_run.cancelled` | `pm.goal_runtime_event.goal_run_cancelled.schema.v3` / `Plans/executor_cancellation_contracts/schemas/goal-run-cancelled.v3.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_run_cancelled.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalRunCancelledEventApplicationV1`; complete source/admission required |
| `goal_run.certified` | `pm.goal_runtime_event.goal_run_certified.schema.v3` / `Plans/workflow_standard_source_contracts/schemas/goal-run-certified.v3.schema.json` | preserve_project_only; no app payload or borrowed WorkNode/certified source |
| `goal_run.replanned` | `pm.goal_runtime_event.goal_run_replanned.schema.v2` / `Plans/event_payloads/goal_runtime/goal_run_replanned.schema.json` | preserve_project_only; no app payload or borrowed WorkNode/certified source |
| `goal_run.started` | `pm.goal_runtime_event.goal_run_started.schema.v3` / `Plans/executor_cancellation_contracts/schemas/goal-run-started.v3.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_run_started.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalRunStartedEventApplicationV1`; complete source/admission required |
| `goal_run.stopped` | `pm.goal_runtime_event.goal_run_stopped.schema.v2` / `Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json` | preserve_project_only; no app payload or borrowed WorkNode/certified source |
| `goal.blocked` | `pm.goal_runtime_event.goal_blocked.schema.v2` / `Plans/event_payloads/goal_runtime/goal_blocked.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_blocked.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalBlockedEventApplicationV1`; complete source/admission required |
| `goal.cancelled` | `pm.goal_runtime_event.goal_cancelled.schema.v3` / `Plans/event_payloads/goal_runtime/goal_cancelled.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_cancelled.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalCancelledEventApplicationV1`; complete source/admission required |
| `goal.child_status_changed` | `pm.goal_runtime_event.goal_child_status_changed.schema.v2` / `Plans/event_payloads/goal_runtime/goal_child_status_changed.schema.json` | historical_only; zero app or Project current writes; no alias |
| `goal.completed` | `pm.goal_runtime_event.goal_completed.schema.v2` / `Plans/event_payloads/goal_runtime/goal_completed.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_completed.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalCompletedEventApplicationV1`; complete source/admission required |
| `goal.created` | `pm.goal_runtime_event.goal_created.schema.v3` / `Plans/event_payloads/goal_runtime/goal_created.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_created.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalCreatedEventApplicationV1`; complete source/admission required |
| `goal.degraded` | `pm.goal_runtime_event.goal_degraded.schema.v2` / `Plans/event_payloads/goal_runtime/goal_degraded.schema.json` | historical_only; zero app or Project current writes; no alias |
| `goal.evidence_captured` | `pm.goal_runtime_event.goal_evidence_captured.schema.v2` / `Plans/event_payloads/goal_runtime/goal_evidence_captured.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_evidence_captured.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalEvidenceCapturedEventApplicationV1`; complete source/admission required |
| `goal.progressed` | `pm.goal_runtime_event.goal_progressed.schema.v2` / `Plans/event_payloads/goal_runtime/goal_progressed.schema.json` | historical_only; zero app or Project current writes; no alias |
| `goal.receipt_recorded` | `pm.goal_runtime_event.goal_receipt_recorded.schema.v2` / `Plans/event_payloads/goal_runtime/goal_receipt_recorded.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_receipt_recorded.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalReceiptRecordedEventApplicationV1`; complete source/admission required |
| `goal.replanned` | `pm.goal_runtime_event.goal_replanned.schema.v2` / `Plans/event_payloads/goal_runtime/goal_replanned.schema.json` | historical_only; zero app or Project current writes; no alias |
| `goal.scheduled` | `pm.goal_runtime_event.goal_scheduled.schema.v2` / `Plans/event_payloads/goal_runtime/goal_scheduled.schema.json` | historical_only; zero app or Project current writes; no alias |
| `goal.stopped` | `pm.goal_runtime_event.goal_stopped.schema.v2` / `Plans/event_payloads/goal_runtime/goal_stopped.schema.json` | historical_only; zero app or Project current writes; no alias |
| `goal.tool_check_recorded` | `pm.goal_runtime_event.goal_tool_check_recorded.schema.v2` / `Plans/event_payloads/goal_runtime/goal_tool_check_recorded.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_tool_check_recorded.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalToolCheckRecordedEventApplicationV1`; complete source/admission required |
| `goal.updated` | `pm.goal_runtime_event.goal_updated.schema.v3` / `Plans/event_payloads/goal_runtime/goal_updated.schema.json` | application_or_project via exact sibling `pm.goal_runtime_event.goal_updated.application.v1` 1.0.0, `Plans/application_workflow_contracts.schema.json#/$defs/GoalUpdatedEventApplicationV1`; complete source/admission required |
| `goal.verification_decided` | `pm.goal_runtime_event.goal_verification_decided.schema.v2` / `Plans/event_payloads/goal_runtime/goal_verification_decided.schema.json` | historical_only; zero app or Project current writes; no alias |

**CV-366 source graph and method roots**

`Plans/application_workflow_sources.schema.json` has `$id=https://puppetmaster.local/schemas/application-workflows/1.0.0/sources.schema.json`. Every source root below is a complete closed original-source composition, not a boolean witness, object excerpt or reborn historical source. Request/result names reference the sole roots in Plans/application_workflow_contracts.schema.json; request/result below denotes the domain value carried by the original source envelope, not a replacement UICommand schema.

| Source graph id | Complete source $defs root | Domain input → output | Sole participating owner interface |
|---|---|---|---|
| `app.goal_start.v1` | `OriginalGoalStartSource` | `GoalCommandRequestApplicationV1` → `GoalCommandResultApplicationV1` | `owner.goal.start.application@1.0.0` |
| `app.goal_update.v1` | `OriginalGoalUpdateSource` | `GoalCommandRequestApplicationV1` → `GoalCommandResultApplicationV1` | `owner.goal.body.mutation.application@1.0.0` |
| `app.goal_cancel.v1` | `OriginalGoalCancelSource` | `GoalCommandRequestApplicationV1` → `GoalCommandResultApplicationV1` | `owner.goal.cancel.application@1.0.0` |
| `app.run_start.v1` | `OriginalApplicationRunStartSource` | `ExecutionUnitContextApplicationV1` → `RequestedEffectiveApplicationV1` | `owner.execution.application.start@1.0.0` |
| `app.run_cancel.v1` | `OriginalApplicationRunCancelSource` | `ExecutionUnitContextApplicationV1` → `GoalCommandResultApplicationV1` | `owner.execution.application.cancel@1.0.0` |
| `app.plan_cancel.v1` | `OriginalAssistantPlanCancelSource` | `AssistantPlanCancelApplicationV1` → `AssistantPlanCancelApplicationV1` | `owner.assistant_plan.cancel.application@1.0.0` |
| `app.schedule_dispatch.v1` | `OriginalScheduleDispatchSource` | `ExecutionScheduleApplicationV1` → `ExecutionOccurrenceApplicationV1` | `owner.schedule.dispatch.application@1.0.0` |
| `app.coordination_append.v1` | `OriginalCoordinationAppendSource` | `AgentMessageApplicationV1` → `CoordinationProjectionApplicationV1` | `storage.coordination_append.application@1.0.0` |
| `app.browser_transition.v1` | `OriginalBrowserTransitionSource` | `BrowserWorkspaceApplicationV1` → `BrowserWorkspaceApplicationV1` | `owner.browser.transition.application@1.0.0` |
| `app.restore_lifecycle.v1` | `OriginalRestoreLifecycleSource` | `RestorePointApplicationV1` → `RestorePointApplicationV1` | `owner.restore_point.lifecycle.application@1.0.0` |
| `app.notebook_mutation.v1` | `OriginalNotebookMutationSource` | `WorkingNotebookEntryApplicationV1` → `WorkingNotebookCheckpointApplicationV1` | `owner.notebook.mutation.application@1.0.0` |
| `app.memory_mutation.v1` | `OriginalMemoryMutationSource` | `MemoryViewApplicationV1` → `MemoryViewApplicationV1` | `owner.memory.mutation.application@1.0.0` |
| `app.home_layout_mutation.v1` | `OriginalHomeLayoutMutationSource` | `HomeLayoutApplicationV1` → `HomeLayoutApplicationV1` | `owner.home_layout.mutation.application@1.0.0` |
| `app.chat_move.v1` | `OriginalChatMoveSource` | `ChatMoveManifestV1` → `ChatMoveManifestV1` | `owner.chat.move@1.0.0` |
| `app.application_pause.v1` | `OriginalApplicationPauseSource` | `ApplicationAutomationPauseSetRequestV1` → `ApplicationAutomationPauseSetResultV1` | `owner.runtime.application_automation_pause.set@1.0.0` |

Each source graph has the ordered roles `original_intent -> accepted_original_source -> current_owner_and_stop_fence -> canonical_pending_or_reservation -> owner_commit -> event_append_if_admitted -> first_receipt_custody -> immutable_terminal_result -> canonical_or_derived_read -> coherent_backup_restore -> retention_release`. These are separate joins, not a universal transaction that undoes earlier accepted effects. Preserve already accepted body/Stop/event effects when a later stage refuses or is unknown. Each role declares actual owner method, complete request/result root and original operation identity; first receipt uses unchanged CV-339/SP-286/SP-336, never a fixture receipt. Current read uses the corresponding actual source/token/checkpoint/visibility; it does not require disposed original controls or recreate accepted sources. Replay is immutable original-result lookup and cannot dispatch.
`Plans/application_workflow_source_graph.json`, logical `pm.application_workflow_source_graph.v1` 1.0.0, is the sole selected app resource/method manifest. Required top-level members are schema_id, schema_version, resources, methods, graphs and graph_sha256. Each resources row is retrieval_uri, path, whole_resource_sha256, resource_role and literal_root_pointers; embedded roots additionally bind containing_resource_sha256 and pointer. Each methods row is interface_id, owner_doc, source_root_ref, input_root_ref, output_root_ref and current_or_retained_role. Each graphs row is graph_id, scope_kind, participating_method_ids, ordered_role_edges, physical_family_ids, event_selectors, reader_ids, backup_restore_owner_refs, retention_policy_refs and adoption_disposition. Rows/edges resolve all transitive refs offline by declared full URI, not basename, network, host-path or newest-same-ID lookup. resources order is UTF-8 retrieval_uri order; methods order is interface_id; graphs order is graph_id. Reference cycles are rejected unless the exact owning schema explicitly declares a legal recursive data shape; dependencies and execution edges are acyclic.
All graphs start with adoption_disposition=specified_unimplemented. A role may become selected only with its whole actual source/native writer/reader/custody binding; an unsupported role remains explicit unavailable and cannot fall through to a Project resource. Dynamic source/state authority, aggregate schema acceptance, source file hashes, all-true booleans and a fixture source are not interchangeable. App Goal/Plan/Crew/ordinary run paths enroll as one coherent graph or are unavailable. The Project all-writers.v6/v7, certified-v3, historical Goal exclusion, native receipt and original cancellation banks retain their exact resources and scopes; none is moved into the app graph by recursion or nullability edits.


### CV-367 - Immutable Conversion Manifest And Destination Admission

```yaml
plan_unit_id: CV-367
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  One versioned ChatMoveManifestV1, pm.chat.move_manifest.v1 1.0.0, binds conversion_id, source WorkflowScopeV2/thread/Computer/root generations, destination kind=new_project|existing_project and, only at cutover, reserved/selected real target, source/destination writer generations, exact selected files/attachments/record/revision/body/content digests, Settings preview and contributed owner plans, permissions/Stop/pause/retention/backup evidence, per-family dispositions, operation/idempotency and exact report/return/Undo basis. Its hash uses CV-366 conversion_manifest; preview expires and any meaningful target/source change invalidates it. No effect comes from navigation, preview, transport completion or a stale receipt. The attached exhaustive table is mandatory: absent family disposition is an integration error, not an implicit nothing-to-move.
  New Project registration/listing completes before chat cutover. Existing Project uses actual destination backend and the chosen separate draft/folder by default; source raw git/jj is content, not PM Project authority. Files copy and verify before source removal. A generation-bound writer fence and destination verified claim make one authoritative cutover. A crash/partition exposes paused/resume/cancel and exact known/unknown effects; no speculative source deletion, automatic failover or offline write queue. Same-store payloads share immutable refs; cross-Server payloads copy/check before commit. Source conversation records seal; destination receives full owned records with origin links, preserving thread_id without changing original EventRecord/Usage/result bytes.
  N25 defaults to a new destination Goal/Plan/Crew record linked to the immutable source. Source active work/claims/timers must reach its admitted safe stop/fence; destination authority is freshly resolved. Ordinary Goal update, Plan revise or run mutation cannot change project_id/thread_id/creation or an admitted run binding. The optional explicit association rebind is unavailable until its separately versioned complete owner transaction/source/Stop/lease/control/currentness/cancel/replay/backup graph exists; no pretend rebind is registered here. Moved transcript approval/certification is historical evidence only. Preserve one current Plan slot for the retained thread and no two live source/destination continuations. Schedules explicitly hold/invalidate old pending bindings and create chosen destination replacements/rebinds for exact frozen target/text/time under fresh consent; source occurrences remain retained and no dispatch happens twice.
  Regular conversion applies by the person; N27’s YOLO agent route uses the same owner command and exact unambiguous destination/task/preview/fresh authority, never a human click. Source YOLO, read access or Project build grant never becomes destination authority. Ambiguous convert this asks for destination. Undo is owner-verified inverse for eligible unchanged effects until first new work or seven days. It cannot delete a remote repository/branch/backup, discard modified work, clear Stop, auto-resume source or purge held independent Goal/Plan/Crew/schedule/permission custody. Exiting Undo permits only eligible sealed conversation cleanup under its deletion rules. Full Server restore checks current lineage/tombstone/cutover generation before making old source live.
  Project setup/provenance/recovery refs consume PJCT-009/010 and the exact nine existing registration kinds plus mounted_existing owned by Plans/Project_System.md; acquisition_provenance online_import/fork_contribute composes native git_clone/jujutsu_clone, never a generic clone or P11 import. Plans/Source_Control_System.md and Plans/source_control_contracts.schema.json own contribution reconciliation through source_control_command_request_v2/result_v2/scope_v2 and the remote_operation_target_v2/local_reconcile_only target; preserve v1 exact receipts and keep publish separate. Starter file sets and configuration Saved setups retain their distinct Project/Settings owners.
  Conversion-to-new preview selects ChatMoveDraftPreviewManifestV1: real setup draft_id/revision/hash, proposed Server/Computer/folder/native plan and registration-plan hash, complete planned family dispositions and visible-effect digest, with project_id=null and no destination writer or native-change receipt. Read-only preview never reserves a Project. Create project and move chat consumes ChatMoveCreateAndApplyRequestV2, then PJCT-009 reserves once. After owner registration/listing/readback, ChatMoveCutoverManifestV2 links that exact draft preview to the real-target ChatMoveManifestV1 and real destination writer/native receipts. Revalidate source, draft, current permissions/Stop and every family before transfer/cutover; any user-visible destination/effect change requires renewed review, not implicit rebind. Existing-project previews retain their real selected target and historical codecs remain exact.
  The selected ChatMoveCreateApplyResultV2 connects the bound ChatMoveCutoverManifestV2 to the actual command result. A completed result requires the real Project ID, creation operation and cutover manifest; preview_refused returns null destination/creation/manifest and preserves the source. Thus pre-reservation failures do not invent a destination scope, and a standalone cutover schema is not treated as an accepted result.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- CV-365
- CV-366
unblocks: []
acceptance_criteria:
- Manifest accounts for every attached family and exact source/destination authority.
- Copy/verify/fence/one-writer cutover and failure/replay/Undo are explicit.
- Immutable task bindings use linked birth; optional rebind stays unavailable until complete.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: projects_refresh_application_workflows
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-F03
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F02
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F09
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F10
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F11
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F12
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F15
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F04
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F09
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F05
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F11
preserved_exact_tokens:
- ChatMoveManifestV1
- N25
- seven days
- new_project
- existing_project
- thread_id
- local_reconcile_only
- source_control_command_request_v2
negative_constraints:
- No copied execution authority, source restamp, silent scope mutation, duplicate occurrence or destructive Undo.
- Acceptance does not prove native handlers, Event Authority admission, durability, readiness or governance certification.
owner_hints:
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Contracts_V0.md#CV-365


**CV-367 exhaustive conversion disposition**

This is the single current per-family inventory for both new and existing destinations; target-specific owners remain authoritative for their operations.

| Family | Required manifest disposition |
|---|---|
| thread/message/title/pin/todo/composer/questionnaire | Retain thread_id, full destination-owned history and origin refs; settle retained approvals; never merge two chats. |
| place/folder/files/attachments | Copy/check selected exact files first; list stayed/unpicked/outside content; Same skips, Different drafts/keep-both, unsaved overwrite blocks. |
| events/envelopes/receipts/Usage/log payloads | Original immutable bytes/scope remain sealed; fresh destination conversation copies retain lineage; local payload share/cross-store verified copy, no new billing. |
| restore/revert/safe points/concerns/attention/handoff/Lens | Explicit destination/source ref map and actual absolute Host roots; same quota/hold/currentness; no outside mutation becomes a Project restore target. |
| Goal body/control/history/receipts/GoalRun/continuation | Linked new destination Goal by default; source safe-stop/fence before cutover; original body/binding/certification immutable; no two live continuations. |
| Crew definition/run/participant/transcript/board | Linked new destination definition/run; fence participants/claims; fresh roster/admission snapshots; frozen run scope never edited in place. |
| coordination agent/file/operation/snapshot/checkpoint/token | Retain original app claims/checkpoints; fresh destination root claims and reader publication; copied checkpoint/token is not authority. |
| Assistant Plan/revisions/run/adherence/To-Dos/ledger/bundle | Linked destination Plan with exact revision/step/unit/To-Do map; stop source PlanRun and release current slot before fresh destination selection; no two current Plans. |
| scheduled messages/tasks/windows/consents/occurrences | Hold/invalidate old pending authority with exact reason; explicit destination replacement of frozen text/attachments/time or exact target version/hash under fresh consent/epochs; historical occurrences stay. |
| PRD/Wizard/Orchestrator/NamedPlan/WorkNode | No app instances to fabricate; Project selection enables only later separate entry, never run activation by chat movement. |
| PM worktree/SCM/forge/conflicts | New Project imports inspected source through its own native backend; existing target receives files only, no history graft; branch/worktree or admitted JJ change/bookmark default. |
| artifacts/checkpoints/shared refs | Re-home owner/index refs explicitly; share/copy verified payloads with reference holds, never purge another owner’s payload. |
| terminals/dev sessions/profiles/ports | Existing processes stay on their original Computer; future sessions re-resolve destination cwd/profile and liveness. |
| browser/Eval/debug/testing/preview | Live controllers/kernels/ports do not migrate; destination starts supported actual targets; no invented Project debug/build state. |
| editors/buffers/absolute links | Map moved file identities and preserve outside-file identities/unsaved buffers; no lost edit or ungranted source exposure. |
| search/chat/code/log indexes/build slot | Remove live app publication only at committed cutover; publish destination once, retaining source recovery on reindex failure; other app chats keep service. |
| Home/layout/boards/panels/rail/dock/Visualizer | Load fresh/existing destination Project UI state without merging/overwriting boards; app UI namespace stays for other chats; keep one Assistant node. |
| memory/capsule/Teach/notebook/Persona | Explicit restricted gist/capsule carry; fenced notebook transfer into Vault; re-resolve Persona/future context; historical snapshots and public-safe restrictions stay. |
| MCP/Skills/Plugins/commands/account choices | Rediscover and copy selected own things only through owners; no install/trust/credential/profile/pairing transfer; same-Computer chosen account resolves locally. |
| permissions/Always/overrides/trust/FileSafe/grants | Fresh destination roots/mode/permission/account/route/exposure; source settings/read/YOLO/build authority never travels; protected holds survive. |
| Server/Home Server/Vault/routes/WebSocket/fairness | One actual destination binding/lease, verified copy and cutover generation; reissue target-authorized auth and do not create a duplicate registry. |
| Stop/pause/run start/History/discovery | Source and destination scope/task epochs remain separate and both gate cutover/re-admission; move/Undo never clears or automatically resumes work. |
| backup/deletion/retention/quotas | Full Server retains app canonical custody and optional chat folders; Project Backup includes destination full history/new records; old restore checks lineage/tombstones; same counterpart caps. |
| Undo | Exact inverse of unchanged eligible effects until new work/seven days; list-only remove for created Project, no remote deletion or altered work cleanup; both Servers required cross-Computer. |


### CV-368 - App Assistant Plan Scheduler And Operational Pause Editions

```yaml
plan_unit_id: CV-368
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  APR-073/074 and SQR-019/020 own app Assistant Plan/Deep Plan, PlanRun/adherence/To-Do/ledger/bundle, scheduled message/task/window/consent/occurrence and cancel-source semantics. Use CV-366’s exact app schema/source roots and same existing command/handler owners. Original Project Plan/cancel/Schedule schemas, complete source resources, exact hashes/immutable bindings and readers stay unchanged. PDS artifact scope_kind=assistant_deep_plan is an artifact-profile token separate from the WorkflowScopeV2/EventRecord application/project discriminator. Do not null PRD/PlanningRun/NamedPlan/Orchestrator/WorkNode fields to admit Assistant app work.
  Build and Build With Crew freeze exact approved Plan version/hash/steps, real app roots/runtime/permission and topology/team; Build As Goal requires the existing explicit Goal request and association. Build At uses one atomic cmd.chat.plan.schedule_build transaction with its execution window, no initial run or duplicate window.create. Revised Plan invalidates old target binding and says Schedule needs update; never substitute latest. The one-current-Plan slot follows retained thread identity across scope changes. N25 creates linked new destination records by default after source safe-stop/current-slot release and exact revision/step/unit/To-Do mapping. Explicit rebind remains separately unavailable until its complete owner-versioned protocol exists.
  One named-Server scheduler owns scheduled_message|assistant_plan_run|crew_run|goal_run|agent_run, with exact text/attachment/destination or frozen target version/hash/topology/team, IANA/DST/missed/grace/wind-down, quota consent and occurrence identity. Client close/Project switching does not move or fire timers. Recheck actual roots/account/tools/permissions/writer/currentness and both task and scope Stop epochs at eligibility and final dispatch; unknown reset/offline/missing custody remains held or unavailable, never fallback/backlog. Only the existing user Send now update has its admitted exception, with every other guard intact. goal.scheduled remains historical-only.
  The exact app pause shape/result union below is an independent Server-owned operational record and epoch for all no-project automations on that Server. Existing pm.runtime.project_automation_pause.v1 stays its own exact Project edition. Neither is Settings, follows Everywhere, defaults off on missing custody, nor gets cleared by YOLO/automation/Goal/Crew/Plan/quota resume. Genuine never-born application authority may create revision0 off; later absence is app_automation_pause_unavailable. Only an authorized user changes desired paused value. Transition to true advances epoch exactly once; no-op and false never advance, and false clears no per-run latch or schedule/consent. Safe-boundary pause lets the existing predicate re-evaluate later with its missed policy, never starts work from this command. Conversion observes source app and destination Project latches/epochs, explicitly re-admits exact schedules and never clears/resumes either.
  App pause/scheduling event candidates keep missing_event_registration/non-emitting disposition until their own complete family/payload/source/append/read/retention admission. A real canonical operational write/result is distinct from an EventRecord claim; static companions do not prove either native effect. Whole source/cancel/backup/retention joins must match the app scopes and preserve partial/unknown effects. The unchanged Project schemas are compatibility readers, not nullable app codecs.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- CV-366
- CV-367
- SP-323
unblocks: []
acceptance_criteria:
- All five app task kinds/Plan modes bind exact targets and one Server scheduler.
- App pause birth/CAS/no-op/user-only clear/results/epochs and missing state are closed.
- Project originals and immutable accepted-source/cancel graphs remain exact.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: projects_refresh_application_workflows
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F09
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F10
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F05
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F11
preserved_exact_tokens:
- pm.runtime.application_automation_pause.v1
- pm.runtime.project_automation_pause.v1
- application_automation_paused
- app_automation_pause_unavailable
- user_stop_epoch
- Schedule needs update
- scope_kind=assistant_deep_plan
negative_constraints:
- No Settings seed, fake Project, automatic clear, latest-version substitution, second scheduler or goal.scheduled
  revival.
- Acceptance does not prove native handlers, Event Authority admission, durability, readiness or governance certification.
owner_hints:
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Contracts_V0.md#CV-365


**CV-368 app pause edition — exact shape and result union**

| Definition in Plans/application_workflow_contracts.schema.json | Exact contract |
|---|---|
| ApplicationAutomationPauseRecord | schema_id=pm.runtime.application_automation_pause.v1, schema_version=1.0.0; required exactly ten fields: schema_id, schema_version, server_id, project_id, paused, user_stop_epoch, changed_by_actor_ref, changed_by_actor_kind, changed_at, revision. server_id is nonempty actual owner; project_id required null; paused boolean; epoch/revision exact nonnegative integers. Revision 0 requires paused=false, epoch=0 and actor_ref/actor_kind/changed_at null. Revision >0 requires actual non-secret actor_ref, actor_kind=user and timestamp; paused=true requires positive epoch. No unknown fields. |
| ApplicationAutomationPauseSetRequestV1 | schema_id=pm.runtime.application_automation_pause_set_request.v1, version1.0.0, request_type=ApplicationAutomationPauseSetRequestV1, command_id=cmd.runtime.automation_pause.set; required command_instance_id, scope=WorkflowScopeV2(application), actor_ref, actor_kind=user, permission_snapshot_ref, idempotency_key, source_surface=schedule_manager, return_route and paused. No expected_revision, toggle, inherit or preview branch; no-op is idempotent by desired value. Non-user request returns permission_denied rather than being cast to user. |
| ApplicationAutomationPauseSetResultV1 | schema_id=pm.runtime.application_automation_pause_set_result.v1, version1.0.0, result_type=ApplicationAutomationPauseSetResultV1, command_id, command_instance_id, scope, requested_paused, outcome, error_code, projection_ref, changed, epoch_advanced, pause, original_operation_ref and side_effects are required. outcome=accepted requires error_code=null and real canonical pause; changed=false has epoch_advanced=false. Changed accepted true-to-paused has epoch_advanced=true; paused=false never advances. outcome=rejected requires closed reason and exact unchanged real pause, changed=false/epoch_advanced=false. outcome=unavailable requires error_code=app_automation_pause_unavailable, pause=null, projection_ref=null, changed=false/epoch_advanced=false; unavailable is never an off record. Other required owner/source refs remain actual non-secret refs or explicit null only in unavailable. |
| side_effects | Required exactly schedules_cancelled_or_invalidated, quota_consents_disabled, per_run_latches_changed and work_dispatched; all const false, every path. The old Project helper may be referenced unchanged, not copied with a different meaning. |
| app eligibility error additions | application_automation_paused, app_automation_pause_unavailable; existing Project error tokens and codecs remain untouched. No alias equates the two scopes. |

The selected app request union accepts only an authenticated user actor. A malformed or non-user request still returns the owner’s refusal without fabricating a structurally valid user input. Changed canonical pause record, its epoch and original result custody commit under one internal whole-value CAS/write/readback; retries that observe the already desired value return the current unchanged record with no new epoch. An unavailable result may not reconstruct pause from an event, Setting or absence. The physical wrapper/key/retention and never-born birth proof are defined only in SP-352.
