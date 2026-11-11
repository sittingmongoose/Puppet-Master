# Shard 064: DL-231 Chat Room definition and command shapes

Source: `Plans/Contracts_V0.md`

Source lines: L24089-L25257

Source SHA256: `4930cd40d05aa2c5e6946d6f0fa9a7437ccc3f5f8a694976bb0163fb79cc05be`

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
  CV-1100 and SP-1101 govern exact input and authenticated original-recipe dispatch; this unit retains its typed semantic tree, app float64/binary physical profile, closed kinds, exact prefixes and original Project codecs.
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


### CV-600 - approval.requested prepared event contract

```yaml
plan_unit_id: CV-600
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for approval.requested@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/human-in-the-loop.md (Contracts_V0.md:954-957 / CV-355; human-in-the-loop.md:50-110; CV-366). An actual current blocked episode creates one ordered action request; it is not a grant. Tool requests carry tool_use_id; other requests omit it. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/approval_requested with schema_id pm.event_payload.approval_requested.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For approval.requested, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, node_id, blocked_sequence, approval_scope_key], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-290. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For approval.requested alone, the full source/identity contract in SP-580 and Plans/dt_event_contracts.schema.json#/$defs/approval_requested_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The HITLBlockedEpisodeOwner.requested source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For approval.requested alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For approval.requested alone, the explicit lifecycle transition is blocked -> requested: request action set is captured; no grant or tool execution. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For approval.requested alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/approval_requested, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-601 - approval.granted prepared event contract

```yaml
plan_unit_id: CV-601
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for approval.granted@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/human-in-the-loop.md (Contracts_V0.md:954-957 / CV-355; human-in-the-loop.md:50-110; CV-366). Requires the exact unresolved requested episode and an authenticated human selecting a member of its ordered allowed_action_ids; PAUSE precedence and live revocation remain enforced. Grant resolves only this episode. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/approval_granted with schema_id pm.event_payload.approval_granted.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For approval.granted, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, node_id, blocked_sequence, approval_scope_key], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-290. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For approval.granted alone, the full source/identity contract in SP-581 and Plans/dt_event_contracts.schema.json#/$defs/approval_granted_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The HITLBlockedEpisodeOwner.granted source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For approval.granted alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For approval.granted alone, the explicit lifecycle transition is requested -> granted: exact human action, current unpaused/unrevoked request; resolves only this blocked episode. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For approval.granted alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/approval_granted, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-602 - approval.denied prepared event contract

```yaml
plan_unit_id: CV-602
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for approval.denied@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/human-in-the-loop.md (Contracts_V0.md:954-957 / CV-355; human-in-the-loop.md:50-110; CV-366). Requires the exact unresolved requested episode; terminal denial never unblocks or executes the tool. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/approval_denied with schema_id pm.event_payload.approval_denied.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For approval.denied, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, node_id, blocked_sequence, approval_scope_key], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-291. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For approval.denied alone, the full source/identity contract in SP-582 and Plans/dt_event_contracts.schema.json#/$defs/approval_denied_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The HITLBlockedEpisodeOwner.denied source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For approval.denied alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For approval.denied alone, the explicit lifecycle transition is requested -> denied: exact unresolved request; no unblock or execution. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For approval.denied alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/approval_denied, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-603 - approval.timeout prepared event contract

```yaml
plan_unit_id: CV-603
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for approval.timeout@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/human-in-the-loop.md (Contracts_V0.md:954-957 / CV-355; human-in-the-loop.md:50-110; CV-366). Requires the exact unresolved requested episode and the original owner timeout expiry evidence; terminal timeout never authorizes work. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/approval_timeout with schema_id pm.event_payload.approval_timeout.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For approval.timeout, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, node_id, blocked_sequence, approval_scope_key], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-291. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For approval.timeout alone, the full source/identity contract in SP-583 and Plans/dt_event_contracts.schema.json#/$defs/approval_timeout_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The HITLBlockedEpisodeOwner.timeout source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For approval.timeout alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For approval.timeout alone, the explicit lifecycle transition is requested -> timed_out: actual original deadline expired; no authorization. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For approval.timeout alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/approval_timeout, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-604 - config.migrated prepared event contract

```yaml
plan_unit_id: CV-604
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for config.migrated@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/WorktreeGitImprovement.md (WorktreeGitImprovement.md:594-612). Only first-load single→None, per_phase→Phase and per_task→Task are accepted. Original immutable input hash and committed Settings result are retained. Replay never writes Settings again. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/config_migrated with schema_id pm.event_payload.config_migrated.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For config.migrated, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, source_ref, source_sha256], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-292. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For config.migrated alone, the full source/identity contract in SP-584 and Plans/dt_event_contracts.schema.json#/$defs/config_migrated_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The SettingsMigrationCoordinator.branch_granularity source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For config.migrated alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For config.migrated application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/config_migrated_application_source at storage/event-sources/dt/config_migrated/application/{event_id}/{stage}.msgpack, physical family dt_config_migrated_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For config.migrated alone, the explicit lifecycle transition is legacy_input -> migrated_settings: exact first-load enum mapping and original committed Settings result. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For config.migrated alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For config.migrated alone, retention_policy_ref = RP-OPERATIONAL-2555D. Case L-3 already decides migration/recovery operational history: 2,555 days, 2,000,000/Project, anchored to the original terminal migration transition. SP-349 already decides one app Server-wide counterpart bucket for config.migrated with the same 2,000,000 cap, TTL, holds and backup classification; it never resets per chat. This exact binding is technical work under current policy, not a new lifetime/app-counting question. All original holds/dependencies override expiry; retries do not reset the anchor.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/config_migrated, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-605 - gate.evaluation_started prepared event contract

```yaml
plan_unit_id: CV-605
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for gate.evaluation_started@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Progression_Gates.md (Contracts_V0.md:943-945; Progression_Gates.md GATE-012). A fresh evaluation_id is captured with the exact gate inputs before evaluation. Neither this event nor a previous pass permits progression. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/gate_evaluation_started with schema_id pm.event_payload.gate_evaluation_started.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For gate.evaluation_started, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, gate_id, run_id, evaluation_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-292. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For gate.evaluation_started alone, the full source/identity contract in SP-585 and Plans/dt_event_contracts.schema.json#/$defs/gate_evaluation_started_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ProgressionGateRunner.evaluation_started source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For gate.evaluation_started alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For gate.evaluation_started alone, the explicit lifecycle transition is allocated -> evaluating: fresh actual evaluation identity and original inputs; no progression. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For gate.evaluation_started alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For gate.evaluation_started alone, the newly authored dispatch-context binding reuses Executor_Protocol section 3: dispatch_score_ref resolves the original scheduler.pass node entry for the same run/node/attempt, and dispatch_score_tuple preserves exactly scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc and node_id. Before preparation, the original gate owner authenticates that source and captures the exact ref/tuple and optional score_threshold in immutable before (null proves absence). completed.owner_result carries the actual numeric score or null; payload score equals that outcome, score_threshold equals before, and both tuple/ref equal before exactly. Exposing either scalar requires both dispatch fields and the matching node_id. The numeric gate result/threshold retain Progression_Gates semantics; this context is not a replacement scoring/ranking policy. Missing, changed, wrong-node or transplanted dispatch context refuses before append; unscored events retain null source context and omit score fields.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/gate_evaluation_started, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-606 - gate.failed prepared event contract

```yaml
plan_unit_id: CV-606
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for gate.failed@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Progression_Gates.md (Contracts_V0.md:943-945; Progression_Gates.md GATE-012). Exactly one failed result follows the matching evaluation_started with failure code and evidence. A blocked GATE-012 report with clarification items is BLOCKED, not falsely classified FAIL or PASS. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/gate_failed with schema_id pm.event_payload.gate_failed.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For gate.failed, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, gate_id, run_id, evaluation_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-293. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For gate.failed alone, the full source/identity contract in SP-586 and Plans/dt_event_contracts.schema.json#/$defs/gate_failed_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ProgressionGateRunner.failed source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For gate.failed alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For gate.failed alone, the explicit lifecycle transition is evaluating -> failed: exact original FAIL report/evidence, no BLOCKED misclassification. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For gate.failed alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For gate.failed alone, the newly authored dispatch-context binding reuses Executor_Protocol section 3: dispatch_score_ref resolves the original scheduler.pass node entry for the same run/node/attempt, and dispatch_score_tuple preserves exactly scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc and node_id. Before preparation, the original gate owner authenticates that source and captures the exact ref/tuple and optional score_threshold in immutable before (null proves absence). completed.owner_result carries the actual numeric score or null; payload score equals that outcome, score_threshold equals before, and both tuple/ref equal before exactly. Exposing either scalar requires both dispatch fields and the matching node_id. The numeric gate result/threshold retain Progression_Gates semantics; this context is not a replacement scoring/ranking policy. Missing, changed, wrong-node or transplanted dispatch context refuses before append; unscored events retain null source context and omit score fields.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/gate_failed, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-607 - gate.passed prepared event contract

```yaml
plan_unit_id: CV-607
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for gate.passed@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Progression_Gates.md (Contracts_V0.md:943-945; Progression_Gates.md GATE-012). Exactly one result follows the matching evaluation_started; all gate-specific PASS predicates and evidence must hold. GATE-012 requires a valid PASS report with zero clarification items. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/gate_passed with schema_id pm.event_payload.gate_passed.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For gate.passed, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, gate_id, run_id, evaluation_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-293. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For gate.passed alone, the full source/identity contract in SP-587 and Plans/dt_event_contracts.schema.json#/$defs/gate_passed_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ProgressionGateRunner.passed source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For gate.passed alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For gate.passed alone, the explicit lifecycle transition is evaluating -> passed: all original gate predicates PASS with complete evidence and no clarification. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For gate.passed alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For gate.passed alone, the newly authored dispatch-context binding reuses Executor_Protocol section 3: dispatch_score_ref resolves the original scheduler.pass node entry for the same run/node/attempt, and dispatch_score_tuple preserves exactly scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc and node_id. Before preparation, the original gate owner authenticates that source and captures the exact ref/tuple and optional score_threshold in immutable before (null proves absence). completed.owner_result carries the actual numeric score or null; payload score equals that outcome, score_threshold equals before, and both tuple/ref equal before exactly. Exposing either scalar requires both dispatch fields and the matching node_id. The numeric gate result/threshold retain Progression_Gates semantics; this context is not a replacement scoring/ranking policy. Missing, changed, wrong-node or transplanted dispatch context refuses before append; unscored events retain null source context and omit score fields.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/gate_passed, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-608 - requirements.clarification_requested prepared event contract

```yaml
plan_unit_id: CV-608
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for requirements.clarification_requested@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Progression_Gates.md (Progression_Gates.md:428-475; Contracts_V0.md:1451). Only a schema-valid blocked requirements report with nonempty needs_user_clarification emits. question_ids equals the complete report question set. No automatic answers or progression; explicit answers and a new PASS report are required. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/requirements_clarification_requested with schema_id pm.event_payload.requirements_clarification_requested.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For requirements.clarification_requested, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, wizard_id, thread_id, report_ref], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-294. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For requirements.clarification_requested alone, the full source/identity contract in SP-588 and Plans/dt_event_contracts.schema.json#/$defs/requirements_clarification_requested_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The RequirementsQualityGate.request_clarification source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For requirements.clarification_requested alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For requirements.clarification_requested alone, the explicit lifecycle transition is blocked_report -> clarification_pending: complete report questions; explicit answers and new PASS required. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For requirements.clarification_requested alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For requirements.clarification_requested alone, retention_policy_ref = PENDING_RETENTION_DECISION for only the unresolved runless facet. GATE-012 defines a pre-execution BLOCKED report/question request with wizard/thread/question/report identity and no required run. No exact current event-policy assignment was found. Runtime-linked instances keep the existing runtime minimum. Exact residual question for Jared: Which class and expiry anchor govern this report request where a run-completion anchor is inapplicable? Do not assume that a ref-only report request is chat content. Runtime-linked cases should reuse existing runtime minima. No expiration, eviction or admission follows while pending; source/receipt/reference closure and holds remain protected.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/requirements_clarification_requested, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-609 - run.background_enqueued prepared event contract

```yaml
plan_unit_id: CV-609
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for run.background_enqueued@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/storage-plan.md (storage-plan.md:1656; CV-365/CV-366). Append only after the durable enqueue intent captures authenticated actual scope/Host/root. Queue release follows receipt. Missing worktree fields never choose main Project or application scope. Replay never enqueues again. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/run_background_enqueued with schema_id pm.event_payload.run_background_enqueued.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For run.background_enqueued, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, enqueue_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-294. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For run.background_enqueued alone, the full source/identity contract in SP-589 and Plans/dt_event_contracts.schema.json#/$defs/run_background_enqueued_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The BackgroundRunQueue.enqueue source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For run.background_enqueued alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For run.background_enqueued application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/run_background_enqueued_application_source at storage/event-sources/dt/run_background_enqueued/application/{event_id}/{stage}.msgpack, physical family dt_run_background_enqueued_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For run.background_enqueued alone, the explicit lifecycle transition is captured_queue_intent -> enqueued: durable queue record and actual scope/Host/root before receipt-gated release. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For run.background_enqueued alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/run_background_enqueued, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-610 - tool.denied prepared event contract

```yaml
plan_unit_id: CV-610
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for tool.denied@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Tools.md (Tools.md 8.0/8.2; Contracts_V0.md 3 tool.denied, CV-355/CV-366). Only the already specified policy/user-denial path is prepared, before any dispatch; never executes or contributes to executed-call rollups. DL-430 resolves FileSafe non-emission: a FileSafe block saves only its dedicated FileSafe refusal entry, never tool.denied. The tool view shows the FileSafe reason and ordered allowed recovery actions; the block is distinct from execution failure and is never retried automatically. Schema refusal alone is not this prepared policy/user-denial path. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/tool_denied with schema_id pm.event_payload.tool_denied.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For tool.denied, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, tool_use_id, attempt_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-295. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For tool.denied alone, the full source/identity contract in SP-590 and Plans/dt_event_contracts.schema.json#/$defs/tool_denied_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ToolDispatcher.denied source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For tool.denied alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For tool.denied application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/tool_denied_application_source at storage/event-sources/dt/tool_denied/application/{event_id}/{stage}.msgpack, physical family dt_tool_denied_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For tool.denied alone, the explicit lifecycle transition is policy_evaluated -> denied: original refusal before dispatch; no executed-call contribution. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For tool.denied alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For tool.denied alone, only the already specified policy/user-denial path is prepared. DL-430 resolves FileSafe non-emission: a FileSafe block saves only its dedicated FileSafe refusal entry, never tool.denied. The tool view shows the FileSafe reason and ordered allowed recovery actions; the block is distinct from execution failure and is never retried automatically. Schema refusal alone, allow decisions and already-dispatched operations do not emit this policy/user-denial record. Accepted policy/user refusal emits one denial with zero tool execution and zero executed-call rollup contribution. Runtime-attributed denials capture original denial_origin, policy decision, not-dispatched state, blocked_sequence, approval_scope_key and the exact canonical runtime mapping in immutable before. The closed payload carries blocked_reason_code, failure_class, ordered allowed_action_ids, headless_denied, permission_snapshot_id and executed_at_all=false. Policy/user denial is pre-dispatch with no classified attempted outcome, so failure_class is explicitly null rather than inventing a transient class; headless_denied is true exactly for headless_ask_denied. The original effective permission_snapshot_id and action order must match, not just their membership. All mapping fields and both blocked-episode fields join before exactly before append, for both the Project source and the separate CV-366 application source. App bytes/operation identity remain distinct. Changed episodes, action order, reason, headless flag or permission snapshot refuse; optional web-local metadata never substitutes for this top-level runtime mapping.
  For tool.denied alone, retention_policy_ref = RP-RUNTIME-365D for tool.denied runtime-attributed actual-run/attempt history (Contracts runtime attribution; Case L-3): 365 days after actual run completion, 1,000,000/run and 5,000,000/Project, successor compaction under every existing hold, including recent-run and backup dependencies. SP-349 binds one Server-wide app counterpart bucket per family with the same limits/TTL/holds, never a per-chat reset. No run completion means no expiry anchor. This assignment covers this drafted runtime population only; it invents no separate non-authority diagnostic population or class choice.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/tool_denied, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-611 - tool.execution_completed prepared event contract

```yaml
plan_unit_id: CV-611
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for tool.execution_completed@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Tools.md (Contracts_V0.md:941-942; Tools.md 8.2). Exactly one terminal record follows a matching execution_started; result_ref joins original result custody and duration_ms is nonnegative. Replay never reexecutes. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/tool_execution_completed with schema_id pm.event_payload.tool_execution_completed.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For tool.execution_completed, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, tool_use_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-295. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For tool.execution_completed alone, the full source/identity contract in SP-591 and Plans/dt_event_contracts.schema.json#/$defs/tool_execution_completed_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ToolRunner.execution_completed source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For tool.execution_completed alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For tool.execution_completed application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/tool_execution_completed_application_source at storage/event-sources/dt/tool_execution_completed/application/{event_id}/{stage}.msgpack, physical family dt_tool_execution_completed_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For tool.execution_completed alone, the explicit lifecycle transition is started -> terminal_outcome: matching start, exact original outcome/result and nonnegative duration. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For tool.execution_completed alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/tool_execution_completed, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-612 - tool.execution_started prepared event contract

```yaml
plan_unit_id: CV-612
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for tool.execution_started@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Tools.md (Contracts_V0.md:941-942; Tools.md 8.2). After every dispatch policy/schema/hook gate succeeds, record the admitted tool-use start before invoking the tool. No start is emitted for a policy denial. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/tool_execution_started with schema_id pm.event_payload.tool_execution_started.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For tool.execution_started, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, tool_use_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-296. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For tool.execution_started alone, the full source/identity contract in SP-592 and Plans/dt_event_contracts.schema.json#/$defs/tool_execution_started_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ToolRunner.execution_started source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For tool.execution_started alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For tool.execution_started application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/tool_execution_started_application_source at storage/event-sources/dt/tool_execution_started/application/{event_id}/{stage}.msgpack, physical family dt_tool_execution_started_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For tool.execution_started alone, the explicit lifecycle transition is admitted -> started: schema, policy and hooks pass; receipt before invoking tool. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For tool.execution_started alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/tool_execution_started, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-613 - tool.invoked prepared event contract

```yaml
plan_unit_id: CV-613
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for tool.invoked@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Tools.md (Tools.md 8.0/8.2/8.4; Contracts_V0.md 3 and 3.4). A completed or attempted-completed operation emits exactly one record; success=false contributes to error_count. Refused calls use tool.denied and never increment executed-call rollups. index_used describes actual acceleration and never guesses. Web operations stay this family, never web.operation.*. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/tool_invoked with schema_id pm.event_payload.tool_invoked.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For tool.invoked, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, tool_use_id, attempt_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-296. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For tool.invoked alone, the full source/identity contract in SP-593 and Plans/dt_event_contracts.schema.json#/$defs/tool_invoked_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ToolDispatcher.completed_invocation source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For tool.invoked alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For tool.invoked application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/tool_invoked_application_source at storage/event-sources/dt/tool_invoked/application/{event_id}/{stage}.msgpack, physical family dt_tool_invoked_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For tool.invoked alone, the explicit lifecycle transition is started -> attempted_completed: actual attempt outcome, success/latency/index facts; refused calls excluded. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For tool.invoked alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For tool.invoked alone, the repaired closed web meta shape preserves semantic web_operation=search|read|extract|research|crawl|map (webfetch maps to read; deep_research maps to research), current stored support-tier enums and operation-local counters/refs. Required web context includes tool_id, operation_input_ref, invocation_source, support_tier, execution_path and provider_fallback_occurred. operation_input_ref resolves the actual immutable normalized structured operation_input through the original owner; a preview cannot replace it. sources_ref, content_ref and map_ref are opaque permission-checked refs, never inline full bodies/source sets/graphs. nodes_count and edges_count belong to map; read, extract, research and crawl retain their current counters, refs, cache and source identifiers. Compatibility aliases normalize before this closed current shape. before.web_request freezes original operation/input/source and batch lineage; completed.owner_result.meta carries the exact actual redacted result metadata and joins payload.meta in full, not only success/latency. Non-web records use null source web context and omit meta. The source resolver authenticates the actual request/result references, not a caller assertion. For batch_webfetch, meta.batch_id and batch_role=parent freeze the ordered child_tool_use_ids allocated by the same original batch; each URL child has its own actual tool_use_id/event identity, batch_role=child, parent_tool_use_id, EventRecord.parent_event_id, URL/status/cache/provenance and provider_attempt_ref. Each child source freezes the exact parent event ID and URL; all share original run/attempt/scope. Parent aggregate success equals the child aggregate. These are newly authored correlation bindings for the already required one-parent/per-URL-child behavior, not a new event family or replacement batch timeout/approval policy.
  For tool.invoked alone, retention_policy_ref = RP-RUNTIME-365D for tool.invoked runtime-attributed actual-run/attempt history (Contracts runtime attribution; Case L-3): 365 days after actual run completion, 1,000,000/run and 5,000,000/Project, successor compaction under every existing hold, including recent-run and backup dependencies. SP-349 binds one Server-wide app counterpart bucket per family with the same limits/TTL/holds, never a per-chat reset. No run completion means no expiry anchor. This assignment covers this drafted runtime population only; it invents no separate non-authority diagnostic population or class choice.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/tool_invoked, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-614 - usage.event prepared event contract

```yaml
plan_unit_id: CV-614
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for usage.event@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/usage-feature.md (usage-feature.md UF-085, UF-108; storage-plan.md SP-341; CV-366). Normalize actual provider/header/CLI/estimate observations; null means unknown, never zero. Cache/reasoning subset fields are not added to inclusive totals. Adjustments replace the prior contribution for usage_record_id atomically, never add it twice. Opening Usage reads rollups and does not scan events; JSONL is import/export only. Daily account/provider/model totals survive detail expiry. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/usage_event with schema_id pm.event_payload.usage_event.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For usage.event, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, usage_record_id, dedupe_key, settlement_status, observed_at_utc], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. UF-085 remains accounting authority; nullable buckets represent unknown and do not fabricate zeros. Existing provider mapper cost, quota, pricing and authority detail remains required when exposed; this schema does not admit an analytics-thin replacement. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-297. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For usage.event alone, the full source/identity contract in SP-594 and Plans/dt_event_contracts.schema.json#/$defs/usage_event_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The UsageTracker.normalize_finish_step source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For usage.event alone, UF-085's existing providerIdentity, costFields and quotaFields in Plans/runtime_artifact_cost_usage.schema.json are reused for the normalized event wire. The new closed cost/quota slots preserve those existing fields; cost_minor_units is tightened to amount/currency/minor_unit_exponent, and bucket_costs_microdollars to the six named accounting slots; cache_write_1h remains subset attribution and is never added onto inclusive cache_write cost. No arbitrary provider extension map or secret enters the normalized event. The legacy flat cost fields are equal mirrors of cost's fields, never an independent charge. raw_payload_ref is present (nullable only when original evidence proves no provider payload), provider_attempt_ref is a real source execution trace, and provider_payload_hash equals the redacted original observation bytes, not a reconstructed UsageRecord. Unknown numeric slots stay null. display_cost_policy reuses the existing show/hide/subscription_covered/unknown policy; it never changes provider authority. Quota reset/cooldown and windows retain their original source evidence; unknown/disabled/not_exposed quantities are null, never fabricated zero/countdown. usage_event_ref equals the computed EventRecord event_id exactly. The original usage_record_id, dedupe_key, provider_attempt_ref, actual runtime attempt, account, provider route, billing entity and optional parent record remain joined to original observation/source custody. Each new observed/streaming_partial/settled/adjusted/failed/unknown observation has its original timestamp and source identity; an exact duplicate returns its original value. A same-record revision requires the prior original Usage event ref and same source identity; adjusted requires a settled/adjusted predecessor and an adjusted_at_utc, settled requires settled_at_utc, and terminal/adjusted observations cannot regress to observed/streaming_partial. Failures and unknown values never manufacture a bill. A new billed retry uses its actual new attempt/UsageRecord and may link its parent; it never aliases a prior record. UF-085 accounting applies deltas by replacing the previous accepted contribution for usage_record_id atomically with the Usage rollup cursor; the DT inspection checkpoint is not a second accounting engine. Inclusive cache/reasoning totals are never added twice, and exclusive totals add the disjoint cache/reasoning components once (cache_write_1h remains a cache_write subset). Parent/child records retain separate billed attempts; grouping does not fold inherited context into child consumption. Exact known and null cost/quota/pricing vectors, all source classes, all settlement states, partial/failed/resumed streams, BYOK/subscription suppression and parent retry joins are authored. UF-108/SP-341 remain controlling: page totals/windows/charts read rollups, Ledger pages the index, JSONL is import/export only, canonical daily account/provider/model totals commit before detail expiry and survive derived-file loss; restore discloses post-backup lost totals. The structured retention assignment is PENDING_RETENTION_BINDING for the RT setting-driven adapter under decided SP-341/UF-108; deletion/admission remain fenced, with no new duration question.
  For usage.event alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For usage.event application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/usage_event_application_source at storage/event-sources/dt/usage_event/application/{event_id}/{stage}.msgpack, physical family dt_usage_event_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For usage.event alone, the explicit lifecycle transition is original_observation -> normalized_observation: retain original observation, state and lineage; replace only accepted accounting contribution. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For usage.event alone, Storage section 5.2 parent_run_id is preserved when an actual source has parent-run lineage. It equals the original captured parent run and complements parent_usage_record_id; neither is inferred from UI focus or inherited context. The nullable original before/runtime-context slots prove inapplicability when the event omits it. The child-run fixture has its own actual Run, Attempt, provider response and UsageRecord identities and joins the original parent run/record without folding or double charging.
  For usage.event alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For usage.event alone, immutable before.account_id, billing_entity_id and provider_account_ref are required nullable source slots. Null proves original absence and joins an omitted optional payload field; a real identity joins byte-for-byte and cannot be replaced with absence, another identity or a fabricated placeholder. The correction is mirrored in the Project source, distinct CV-366 application source, both embedded payload/source editions and both registry schema mirrors. Complete absent-account, unknown/no-provider-evidence, local estimate and CLI observations exercise this path; provenance/unknown quantities stay truthful and no new account is manufactured.
  For usage.event alone, retention_policy_ref = PENDING_RETENTION_BINDING, a technical dependency under the decided SP-341/UF-108 policy, not PENDING_RETENTION_DECISION. Structured retention_binding names ai.usage.usage-retention (30 days, 90 days default, 180 days, 1 year or unlimited), detail in both seglog and Parquet, and canonical backed-up permanent daily account/provider/model totals committed before detail retirement and never rebuilt from expired events. SP-349 keeps the same setting and holds in one Server-wide app counterpart bucket. RT still must materialize the setting-driven policy object and expiry-anchor adapter; until then deletion and admission remain fenced. No duration is chosen here.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/usage_event, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-615 - worktree.created prepared event contract

```yaml
plan_unit_id: CV-615
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for worktree.created@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/WorktreeGitImprovement.md (WorktreeGitImprovement.md:200-221; Contracts_V0.md:946-947). Original allocation ownership and branch/path custody must exist before created is appended and before a node starts work. Creation replay inspects original allocation, never creates another tree. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/worktree_created with schema_id pm.event_payload.worktree_created.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For worktree.created, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, project_id, worktree_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-297. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For worktree.created alone, the full source/identity contract in SP-595 and Plans/dt_event_contracts.schema.json#/$defs/worktree_created_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The WorktreeLifecycleOwner.created source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For worktree.created alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For worktree.created alone, the explicit lifecycle transition is allocated -> created: original owned allocation and branch/path/lineage; receipt before node use. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For worktree.created alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For worktree.created alone, retention_policy_ref = PENDING_RETENTION_DECISION for only the unresolved runless facet. Runtime allocation history keeps the existing runtime minimum. WorktreeGitImprovement section 2.0A also defines Project/thread operations outside a running executor. The worktree projection is a separate family. Exact residual question for Jared: Resolve the runless event's class/anchor and required lineage dependencies; the projection policy does not automatically register this event's retention. No expiration, eviction or admission follows while pending; source/receipt/reference closure and holds remain protected.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/worktree_created, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-616 - worktree.deleted prepared event contract

```yaml
plan_unit_id: CV-616
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for worktree.deleted@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/WorktreeGitImprovement.md (WorktreeGitImprovement.md:200-221; Contracts_V0.md:946-947). Delete only after original result custody, grace period, file-lock and active-lock/safe-point dependency checks pass. Active lock references must be empty or proven released; no held safe point may lose its dependencies. Replay never deletes another tree. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/worktree_deleted with schema_id pm.event_payload.worktree_deleted.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For worktree.deleted, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, project_id, worktree_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-298. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For worktree.deleted alone, the full source/identity contract in SP-596 and Plans/dt_event_contracts.schema.json#/$defs/worktree_deleted_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The WorktreeLifecycleOwner.deleted source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For worktree.deleted alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For worktree.deleted alone, the explicit lifecycle transition is cleanup_eligible -> deleted: original removal outcome only after grace/file-lock and every dependency guard. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For worktree.deleted alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For worktree.deleted alone, retention_policy_ref = PENDING_RETENTION_DECISION for only the unresolved runless facet. Runtime history keeps the existing runtime minimum. The runless lifecycle event and worktree_lane_thread_families projection are distinct. That projection has RP-WORKTREE-TOMBSTONE-365D and retains tombstones while historical links exist; Case L-3 separately names deletion-tombstone authority. Neither name alone proves this event is that authority. Exact residual question for Jared: Is this exact event deletion-tombstone authority, or runless lifecycle history, and what is its applicable anchor? Separate runtime history and the distinct worktree_lane_thread_families projection; its RP-WORKTREE-TOMBSTONE-365D policy does not automatically register this event. No expiration, eviction or admission follows while pending; source/receipt/reference closure and holds remain protected.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/worktree_deleted, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286
