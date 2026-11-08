# Shard 064: DL-231 Chat Room definition and command shapes

Source: `Plans/Contracts_V0.md`

Source lines: L24089-L25362

Source SHA256: `c55089001981fb4c165372f8abaab2a8a76aecc5edc1555ad9d954afb5a8dd83`

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

### CV-550 - filesafe.command_denied closed contract

```yaml
plan_unit_id: CV-550
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.command_denied owns the prepared closed 2.0.0 payload and
  exact original-source, producer, scope and transition joins. The checked whole normalized
  segment is denied before spawn. Preserve segment index and actual denial code; denial
  never grants an override or runs the command.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.command_denied` only.** Current governing behavior: FileSafe F2-041, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_command_denied_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `BaseRunner command-string guard before spawn` is the sole semantic producer. The checked whole normalized segment is denied before spawn. Preserve segment index and actual denial code; denial never grants an override or runs the command. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-550` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `filesafe.command_denied` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.command_denied` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.command_denied` only: `Plans/filesafe_event_sources/filesafe_command_denied.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `BaseRunner::check_command -> BashGuard::check_command -> log_blocked_command`. The two private original-source interfaces are `owner.filesafe.filesafe_command_denied.original_source.project@1.0.0` and `owner.filesafe.filesafe_command_denied.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_command_denied.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.command_denied` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. JSON integer `-0` decodes once to integer zero and uses the same bytes and commitments as `0`; malformed `01` is refused by the JSON parser. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `guard_type`, `normalized_command_identity`, `segment_index`, `permission_snapshot_id`, `filesafe_scope_ref` join the result where applicable. Exact required body roles are `guard_input`, `guard_decision`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.command_denied`.**

| From | To | Required barrier |
|---|---|---|
| checked_segment | denied_no_spawn | Denial is sealed before returning the blocked-command result; spawn remains forbidden, including audit failure. |
| denied_no_spawn | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

ContractRef: ContractName:Plans/storage-plan.md#SP-550, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.command_denied` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

### CV-551 - filesafe.destructive_override_denied closed contract

```yaml
plan_unit_id: CV-551
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.destructive_override_denied owns the prepared closed 2.0.0
  payload and exact original-source, producer, scope and transition joins. A rejected
  request emits denial and leaves the original guarded command blocked. Missing authentication
  may omit operator/auth realm; absence never becomes anonymous permission.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.destructive_override_denied` only.** Current governing behavior: FileSafe F2-052, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_destructive_override_denied_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe authenticated destructive-override evaluator` is the sole semantic producer. A rejected request emits denial and leaves the original guarded command blocked. Missing authentication may omit operator/auth realm; absence never becomes anonymous permission. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-551` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Exact override scope selection.** The new prepared override scope is a closed Project/application union, following current F2-213. Project retains real project_id with optional (required-present null when unrestricted) run_id, worktree_id and normalized_command_identity; a null restriction is not a missing Project and does not erase actual execution_context. A narrower authorized restriction may be selected only within the original requested restriction and actual context. Application requires scope_kind=application, project_id=null and real server_id/computer_id/thread_id/run_id/host_id/environment_id plus nonempty recorded_roots, each with root_id/root_generation/canonical_path; command restriction is explicit string or null. Every authorized root must be an exact member of the original admitted root set and the execution root must join by identity/generation. No Project source is recast, and a source grant is never transplanted by conversion. This corrects the unadmitted first-pass flat scope, which omitted application Server/Environment/roots and overconstrained Project grants.

**Current-writer eligibility for `filesafe.destructive_override_denied` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.destructive_override_denied` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.destructive_override_denied` only: `Plans/filesafe_event_sources/filesafe_destructive_override_denied.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::evaluate_destructive_override -> deny_override`. The two private original-source interfaces are `owner.filesafe.filesafe_destructive_override_denied.original_source.project@1.0.0` and `owner.filesafe.filesafe_destructive_override_denied.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_destructive_override_denied.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.destructive_override_denied` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. JSON integer `-0` decodes once to integer zero and uses the same bytes and commitments as `0`; malformed `01` is refused by the JSON parser. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `request_id`, `guard_type` join the result where applicable. Exact required body roles are `override_request`, `override_denial`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.destructive_override_denied`.**

| From | To | Required barrier |
|---|---|---|
| request_received | denied_no_grant | Refusal seals the exact request and denial; the original command remains blocked and no receipt can become a grant. |
| denied_no_grant | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

The original override request supplies maximum_expires_at computed by its owner from the accepted duration; no new duration policy is selected. authorized_scope, when present, must be within requested_scope, match normalized command identity and exact root/Host/thread/run/project, and issued_at < expires_at <= maximum_expires_at. A missing request, stale root or expired receipt never grants permission.

ContractRef: ContractName:Plans/storage-plan.md#SP-551, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.destructive_override_denied` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

### CV-552 - filesafe.destructive_override_granted closed contract

```yaml
plan_unit_id: CV-552
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.destructive_override_granted owns the prepared closed 2.0.0
  payload and exact original-source, producer, scope and transition joins. Only an
  authenticated operator, exact authorized scope, reason and future expiry can yield
  a grant. The event is audit of the original receipt, never execution authority by
  itself. Expired, mismatched or changed-root grants cannot authorize a command.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.destructive_override_granted` only.** Current governing behavior: FileSafe F2-052, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_destructive_override_granted_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe authenticated destructive-override evaluator` is the sole semantic producer. Only an authenticated operator, exact authorized scope, reason and future expiry can yield a grant. The event is audit of the original receipt, never execution authority by itself. Expired, mismatched or changed-root grants cannot authorize a command. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-552` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Exact override scope selection.** The new prepared override scope is a closed Project/application union, following current F2-213. Project retains real project_id with optional (required-present null when unrestricted) run_id, worktree_id and normalized_command_identity; a null restriction is not a missing Project and does not erase actual execution_context. A narrower authorized restriction may be selected only within the original requested restriction and actual context. Application requires scope_kind=application, project_id=null and real server_id/computer_id/thread_id/run_id/host_id/environment_id plus nonempty recorded_roots, each with root_id/root_generation/canonical_path; command restriction is explicit string or null. Every authorized root must be an exact member of the original admitted root set and the execution root must join by identity/generation. No Project source is recast, and a source grant is never transplanted by conversion. This corrects the unadmitted first-pass flat scope, which omitted application Server/Environment/roots and overconstrained Project grants.

**Current-writer eligibility for `filesafe.destructive_override_granted` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.destructive_override_granted` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.destructive_override_granted` only: `Plans/filesafe_event_sources/filesafe_destructive_override_granted.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::evaluate_destructive_override -> issue_override_receipt`. The two private original-source interfaces are `owner.filesafe.filesafe_destructive_override_granted.original_source.project@1.0.0` and `owner.filesafe.filesafe_destructive_override_granted.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_destructive_override_granted.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.destructive_override_granted` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. JSON integer `-0` decodes once to integer zero and uses the same bytes and commitments as `0`; malformed `01` is refused by the JSON parser. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `request_id`, `guard_type`, `auth_realm`, `operator_identity_ref`, `reason` join the result where applicable. Exact required body roles are `override_request`, `override_receipt`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.destructive_override_granted`.**

| From | To | Required barrier |
|---|---|---|
| request_authenticated | grant_receipt_committed | Authentication, reason, exact requested scope, current roots and unexpired duration are checked before committing the grant receipt. Audit completion precedes making it usable; later execution independently revalidates it. |
| grant_receipt_committed | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

The original override request supplies maximum_expires_at computed by its owner from the accepted duration; no new duration policy is selected. authorized_scope, when present, must be within requested_scope, match normalized command identity and exact root/Host/thread/run/project, and issued_at < expires_at <= maximum_expires_at. A missing request, stale root or expired receipt never grants permission.

ContractRef: ContractName:Plans/storage-plan.md#SP-552, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.destructive_override_granted` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

### CV-553 - filesafe.destructive_override_requested closed contract

```yaml
plan_unit_id: CV-553
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.destructive_override_requested owns the prepared closed 2.0.0
  payload and exact original-source, producer, scope and transition joins. Record
  the authenticated request before evaluation. PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 alone
  is never a grant; requested scope and duration cannot broaden the accepted scope.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.destructive_override_requested` only.** Current governing behavior: FileSafe F2-052, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_destructive_override_requested_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe destructive-override request intake` is the sole semantic producer. Record the authenticated request before evaluation. PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 alone is never a grant; requested scope and duration cannot broaden the accepted scope. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-553` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Exact override scope selection.** The new prepared override scope is a closed Project/application union, following current F2-213. Project retains real project_id with optional (required-present null when unrestricted) run_id, worktree_id and normalized_command_identity; a null restriction is not a missing Project and does not erase actual execution_context. A narrower authorized restriction may be selected only within the original requested restriction and actual context. Application requires scope_kind=application, project_id=null and real server_id/computer_id/thread_id/run_id/host_id/environment_id plus nonempty recorded_roots, each with root_id/root_generation/canonical_path; command restriction is explicit string or null. Every authorized root must be an exact member of the original admitted root set and the execution root must join by identity/generation. No Project source is recast, and a source grant is never transplanted by conversion. This corrects the unadmitted first-pass flat scope, which omitted application Server/Environment/roots and overconstrained Project grants.

**Current-writer eligibility for `filesafe.destructive_override_requested` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.destructive_override_requested` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.destructive_override_requested` only: `Plans/filesafe_event_sources/filesafe_destructive_override_requested.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::request_destructive_override -> record_override_request`. The two private original-source interfaces are `owner.filesafe.filesafe_destructive_override_requested.original_source.project@1.0.0` and `owner.filesafe.filesafe_destructive_override_requested.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_destructive_override_requested.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.destructive_override_requested` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. JSON integer `-0` decodes once to integer zero and uses the same bytes and commitments as `0`; malformed `01` is refused by the JSON parser. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `request_id`, `guard_type`, `normalized_command_identity`, `requested_scope`, `requested_duration`, `reason`, `auth_realm`, `operator_identity_ref` join the result where applicable. Exact required body roles are `override_request`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.destructive_override_requested`.**

| From | To | Required barrier |
|---|---|---|
| request_received | request_recorded | The original request is recorded before evaluation; neither the request event nor PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 authorizes execution. |
| request_recorded | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

ContractRef: ContractName:Plans/storage-plan.md#SP-553, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.destructive_override_requested` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

### CV-554 - filesafe.guard_init_failed closed contract

```yaml
plan_unit_id: CV-554
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.guard_init_failed owns the prepared closed 2.0.0 payload
  and exact original-source, producer, scope and transition joins. On initialization
  failure block the affected capability; no disabled fallback. Embedded known-destructive
  baseline does not make a failed authoritative guard healthy.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.guard_init_failed` only.** Current governing behavior: FileSafe F2-024, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_guard_init_failed_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe guard initialization path` is the sole semantic producer. On initialization failure block the affected capability; no disabled fallback. Embedded known-destructive baseline does not make a failed authoritative guard healthy. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-554` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `filesafe.guard_init_failed` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.guard_init_failed` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.guard_init_failed` only: `Plans/filesafe_event_sources/filesafe_guard_init_failed.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::initialize_guard -> record_guard_init_failure`. The two private original-source interfaces are `owner.filesafe.filesafe_guard_init_failed.original_source.project@1.0.0` and `owner.filesafe.filesafe_guard_init_failed.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_guard_init_failed.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.guard_init_failed` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. JSON integer `-0` decodes once to integer zero and uses the same bytes and commitments as `0`; malformed `01` is refused by the JSON parser. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `guard_type` join the result where applicable. Exact required body roles are `guard_configuration`, `initialization_failure`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.guard_init_failed`.**

| From | To | Required barrier |
|---|---|---|
| guard_initializing | capability_blocked | A failed authoritative guard blocks the affected capability before any return; embedded baseline availability never changes this failure to success. |
| capability_blocked | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

ContractRef: ContractName:Plans/storage-plan.md#SP-554, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.guard_init_failed` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

### CV-555 - filesafe.path_denied closed contract

```yaml
plan_unit_id: CV-555
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.path_denied owns the prepared closed 2.0.0 payload and exact
  original-source, producer, scope and transition joins. Canonicalize existing path
  or nearest existing parent, verify actual root and recheck TOCTOU before effect.
  Refusal leaves the file untouched and preserves the denial code and permission/scope
  refs.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.path_denied` only.** Current governing behavior: FileSafe F2-213, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_path_denied_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe path guard before file effect` is the sole semantic producer. Canonicalize existing path or nearest existing parent, verify actual root and recheck TOCTOU before effect. Refusal leaves the file untouched and preserves the denial code and permission/scope refs. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-555` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `filesafe.path_denied` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.path_denied` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.path_denied` only: `Plans/filesafe_event_sources/filesafe_path_denied.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::check_path -> FileGuard::check_operation -> record_path_denial`. The two private original-source interfaces are `owner.filesafe.filesafe_path_denied.original_source.project@1.0.0` and `owner.filesafe.filesafe_path_denied.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_path_denied.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.path_denied` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. JSON integer `-0` decodes once to integer zero and uses the same bytes and commitments as `0`; malformed `01` is refused by the JSON parser. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `guard_type`, `normalized_path`, `canonical_parent`, `path_kind`, `operation`, `permission_snapshot_id`, `filesafe_scope_ref` join the result where applicable. Exact required body roles are `path_request`, `path_denial`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.path_denied`.**

| From | To | Required barrier |
|---|---|---|
| path_resolved | denied_no_file_effect | Resolve the recorded Host/root and canonical parent, including symlink/reparse and create checks; refusal leaves the target unchanged. |
| denied_no_file_effect | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

ContractRef: ContractName:Plans/storage-plan.md#SP-555, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.path_denied` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

### CV-556 - filesafe.policy_degraded closed contract

```yaml
plan_unit_id: CV-556
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.policy_degraded owns the prepared closed 2.0.0 payload and
  exact original-source, producer, scope and transition joins. Valid only while authoritative
  enforcement is intact; an advisory failure or embedded authoritative fallback can
  be reported. Missing or empty allowlists, roots, unresolved canonical paths or failed
  init require refusal, never a degraded success.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.policy_degraded` only.** Current governing behavior: FileSafe CV-245, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_policy_degraded_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe policy loader advisory/fallback diagnostic path` is the sole semantic producer. Valid only while authoritative enforcement is intact; an advisory failure or embedded authoritative fallback can be reported. Missing or empty allowlists, roots, unresolved canonical paths or failed init require refusal, never a degraded success. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-556` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `filesafe.policy_degraded` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.policy_degraded` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.policy_degraded` only: `Plans/filesafe_event_sources/filesafe_policy_degraded.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::load_policy -> record_policy_degradation`. The two private original-source interfaces are `owner.filesafe.filesafe_policy_degraded.original_source.project@1.0.0` and `owner.filesafe.filesafe_policy_degraded.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_policy_degraded.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.policy_degraded` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. JSON integer `-0` decodes once to integer zero and uses the same bytes and commitments as `0`; malformed `01` is refused by the JSON parser. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `degraded_component`, `fallback_source` join the result where applicable. Exact required body roles are `policy_load`, `enforcement_evidence`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.policy_degraded`.**

| From | To | Required barrier |
|---|---|---|
| policy_loading | degraded_enforcing | Only an advisory failure or known-destructive embedded fallback with authoritative enforcement intact may enter degraded_enforcing. Missing roots, empty authoritative scope or failed init refuses. |
| degraded_enforcing | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

ContractRef: ContractName:Plans/storage-plan.md#SP-556, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.policy_degraded` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

### CV-557 - safe_point.created closed contract

```yaml
plan_unit_id: CV-557
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: safe_point.created owns the prepared closed 2.0.0 payload and exact
  original-source, producer, scope and transition joins. Publish only after immutable
  manifest and blobs verify and the safe_point_record is durably committed. The capture
  precedes mutation; worktree-bound writes carry all four worktree fields. Failed
  or unsupported capture never permits mutation.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `safe_point.created` only.** Current governing behavior: FileSafe F2-213, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/safe_point_created_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe pre-mutation safe-point writer` is the sole semantic producer. Publish only after immutable manifest and blobs verify and the safe_point_record is durably committed. The capture precedes mutation; worktree-bound writes carry all four worktree fields. Failed or unsupported capture never permits mutation. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-557` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `safe_point.created` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `safe_point.created` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Original snapshot version identity.** snapshot_format_version and content_scope_version retain their original nonempty string types from the complete Project safe_point_record source. Integer coercion is forbidden; this corrects the unadmitted first-pass payload draft, without changing any original native source.

**Exact original source graph (second pass).** Newly authored under DL-045 for `safe_point.created` only: `Plans/filesafe_event_sources/safe_point_created.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::capture_pre_write_safe_point -> commit_safe_point_record`. The two private original-source interfaces are `owner.filesafe.safe_point_created.original_source.project@1.0.0` and `owner.filesafe.safe_point_created.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/safe_point_created.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `safe_point.created` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. JSON integer `-0` decodes once to integer zero and uses the same bytes and commitments as `0`; malformed `01` is refused by the JSON parser. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `safe_point_id`, `run_id`, `node_id`, `attempt_id`, `baseline_ref`, `replan_generation`, `creation_reason`, `snapshot_format_version`, `content_scope_version` join the result where applicable. Exact required body roles are `capture_request`, `snapshot_manifest`, `snapshot_blobs`, `safe_point_record`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

For Project `safe_point.created`, the source view also imports native_project_record through the exact original Project schema bytes selected in its resource manifest. Its original body role is validated in full and joins the explicit original_project_joins table in that family's graph. This additional view preserves original native hash/codec domains. It never fills project_id=null or invents node/attempt IDs for application; the separate application source root rejects native_project_record.

**Complete application originals for `safe_point.created` (review round 1).** Newly authored owner contract under DL-045 after the own-family current-canon search: `Plans/filesafe_event_sources/safe_point_created.schema.json#/$defs/application_records` is a required complete method-output composition, not an event-shaped witness. Its closed application safe_point_record, snapshot_manifest and snapshot_blob_inventory have distinct `.application.v1` / `1.0.0` identities. The safe-point record retains complete capture identity, version, counts/lengths, canonical manifest ref/hash, actor/time, eligibility and holds. Every manifest entry carries immutable absolute path, root/generation, Host/Environment and permission-snapshot identity, presence/type/tracked/ignored/write-set disposition, content ref/hash/length and supported SCM/symlink/executable/POSIX/Windows metadata. Optional SCM is a complete repo/worktree/branch/HEAD/index-stage composition; null means no fabricated repository. Manifest paths are canonical ordered and unique, counts/lengths are exact, ignored entries require authorized write-set membership, and blobs exactly cover every addressed file. For every resolved file blob, recompute `blake3:` plus BLAKE3 of the exact decoded bytes and require equality with both the inventory payload_id and each manifest payload_id, in addition to independent SHA-256 and exact lengths. A forged address, swapped bytes or truncated bytes refuses even if every manifest, SHA-256, count, source commitment and receipt has been coherently repaired. Apply this same verification whenever write, retry, read, rebuild, backup/restore or restore execution resolves original blob bytes; no path may treat an advertised address as proof. Event-only reads/retries/rebuilds do not resolve snapshot bodies or recreate disposed originals. Body-dependent historical reads verify the original composition under its retained commitment recipe and access/availability fences, without current-writer admission or live-epoch checks. FileSafe 11.1.2b remains the complete scope/exclusion/equality owner.

Manifest bodies use FileSafe canonical RFC8785 JSON and SHA-256; application request/record/inventory/journal/equality bodies use CV-366 deterministic physical MessagePack. The original request-byte preimage omits only original_input_ref/original_input_sha256, which select those bytes, avoiding a self-hash cycle. The source output supplies complete typed originals and exact body ref/hash/codec/root joins; decode every selected body, validate its closed root and canonical encoding, and require equality with that original output. A role/ref/hash triple, separately supplied metadata dictionary or self-consistent source hash cannot substitute. Each record joins the actual scope, Server and execution context. Original Project schemas, records and physical bytes are unchanged.

The application capture result joins its original capture operation, actor/time, complete safe-point record and decoded manifest hash/content digest/counts/versions; its optional four worktree fields join the actual complete SCM object. The record and manifest/blob composition commit before preparation/append and any dependent mutation. The own graph selects all exact body roots and codecs for this family.

**Lifecycle barriers for `safe_point.created`.**

| From | To | Required barrier |
|---|---|---|
| capture_admitted | capture_committed | Verify immutable manifest and every addressed blob, then commit safe_point_record before append and before mutation. Worktree metadata comes from that manifest. Incomplete capture fences the mutation. |
| capture_committed | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

Worktree-bound creation joins worktree_id/worktree_path/branch_name/HEAD_sha to the original captured manifest as one group; a partial group refuses. All immutable snapshot members must verify; a hash alone never proves capture.

ContractRef: ContractName:Plans/storage-plan.md#SP-557, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `safe_point.created` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

### CV-558 - safe_point.restored closed contract

```yaml
plan_unit_id: CV-558
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: safe_point.restored owns the prepared closed 2.0.0 payload and exact
  original-source, producer, scope and transition joins. Publish only the journal-proven
  outcome. restored_clean requires target equality, restore_failed pre-restore equality,
  restore_skipped preflight equality without mutation, restore_refused no mutation,
  recovery_required keeps fences. restored_with_conflicts is forbidden. Restart reconciles
  the same transaction before dispatch.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `safe_point.restored` only.** Current governing behavior: FileSafe F2-213, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/safe_point_restored_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe exact-replace restore coordinator` is the sole semantic producer. Publish only the journal-proven outcome. restored_clean requires target equality, restore_failed pre-restore equality, restore_skipped preflight equality without mutation, restore_refused no mutation, recovery_required keeps fences. restored_with_conflicts is forbidden. Restart reconciles the same transaction before dispatch. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-558` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `safe_point.restored` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `safe_point.restored` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `safe_point.restored` only: `Plans/filesafe_event_sources/safe_point_restored.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::restore_exact_replace -> reconcile_restore_transaction`. The two private original-source interfaces are `owner.filesafe.safe_point_restored.original_source.project@1.0.0` and `owner.filesafe.safe_point_restored.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/safe_point_restored.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `safe_point.restored` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. JSON integer `-0` decodes once to integer zero and uses the same bytes and commitments as `0`; malformed `01` is refused by the JSON parser. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `restore_transaction_id`, `safe_point_id`, `run_id`, `node_id`, `attempt_id`, `target_state_sha256`, `pre_restore_state_sha256` join the result where applicable. Exact required body roles are `restore_request`, `safe_point_record`, `restore_transaction`, `equality_result`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

For Project `safe_point.restored`, the source view also imports native_project_record through the exact original Project schema bytes selected in its resource manifest. Its original body role is validated in full and joins the explicit original_project_joins table in that family's graph. This additional view preserves original native hash/codec domains. It never fills project_id=null or invents node/attempt IDs for application; the separate application source root rejects native_project_record.

**Complete application originals for `safe_point.restored` (review round 1).** Newly authored owner contract under DL-045 after the own-family current-canon search: `Plans/filesafe_event_sources/safe_point_restored.schema.json#/$defs/application_records` is a required complete method-output composition, not an event-shaped witness. Its closed application safe_point_record, snapshot_manifest and snapshot_blob_inventory have distinct `.application.v1` / `1.0.0` identities. The safe-point record retains complete capture identity, version, counts/lengths, canonical manifest ref/hash, actor/time, eligibility and holds. Every manifest entry carries immutable absolute path, root/generation, Host/Environment and permission-snapshot identity, presence/type/tracked/ignored/write-set disposition, content ref/hash/length and supported SCM/symlink/executable/POSIX/Windows metadata. Optional SCM is a complete repo/worktree/branch/HEAD/index-stage composition; null means no fabricated repository. Manifest paths are canonical ordered and unique, counts/lengths are exact, ignored entries require authorized write-set membership, and blobs exactly cover every addressed file. For every resolved file blob, recompute `blake3:` plus BLAKE3 of the exact decoded bytes and require equality with both the inventory payload_id and each manifest payload_id, in addition to independent SHA-256 and exact lengths. A forged address, swapped bytes or truncated bytes refuses even if every manifest, SHA-256, count, source commitment and receipt has been coherently repaired. Apply this same verification whenever write, retry, read, rebuild, backup/restore or restore execution resolves original blob bytes; no path may treat an advertised address as proof. Event-only reads/retries/rebuilds do not resolve snapshot bodies or recreate disposed originals. Body-dependent historical reads verify the original composition under its retained commitment recipe and access/availability fences, without current-writer admission or live-epoch checks. FileSafe 11.1.2b remains the complete scope/exclusion/equality owner.

Manifest bodies use FileSafe canonical RFC8785 JSON and SHA-256; application request/record/inventory/journal/equality bodies use CV-366 deterministic physical MessagePack. The original request-byte preimage omits only original_input_ref/original_input_sha256, which select those bytes, avoiding a self-hash cycle. The source output supplies complete typed originals and exact body ref/hash/codec/root joins; decode every selected body, validate its closed root and canonical encoding, and require equality with that original output. A role/ref/hash triple, separately supplied metadata dictionary or self-consistent source hash cannot substitute. Each record joins the actual scope, Server and execution context. Original Project schemas, records and physical bytes are unchanged.

This family additionally selects complete target/pre-restore/post-restore manifest compositions (post may be explicit null when equality is unproven), original safe_point_restore_transaction and equality_result roots in its own schema. The journal retains every canonical path operation, expected-before and target type/hash, stage/tombstone ref, state, phase, cursor, lease, timestamps, restart count, outcome, result event, holds and fence. Operation IDs/paths are unique/ordered and cover every target/admission difference. The application safe-point subject key is application@1:hex(UTF-8 server_id):hex(UTF-8 safe_point_id), a scope-safe view identity, not a new physical store. Target/pre/post hashes derive from complete decoded canonical manifests, with SCM equality checked independently. restored_clean requires committed target equality; restore_skipped requires pre=target=post and zero mutations; restore_refused requires unchanged pre-state and zero mutations; restore_failed requires rolled-back pre-state equality; restore_recovery_required requires recovery_required with unproven target/rollback equality, active fence and all safe-point/transaction holds. Transaction/result/event, equality/hold, manifest ref/hash and original lease/cursor joins must all verify. Replay cannot clear recovery holds. A populated restore_transaction.result_event_ref must equal this exact original result EventRecord.event_id; null is supported only as the original source capture before that append, without substituting a different populated result pointer. Derive operation kind from the present before/target entries: create requires absent before and present target; delete requires present before and absent target; replace requires both present; metadata requires both present with unchanged type and content/symlink/gitlink identity. Absent entries normalize to null expected/target types and hashes. Creation/replacement retain their stage; creation has no tombstone; deletion has a transaction-owned tombstone and no stage. Preserve the complete original journal and all owner-required rollback material, mutation fences and holds; this event contract grants no journal disposal or retention change.

**Lifecycle barriers for `safe_point.restored`.**

| From | To | Required barrier |
|---|---|---|
| restore_prepared | outcome_committed | The original exact-replace journal and equality result own the outcome. restored_clean requires target=post; restore_failed/refused require pre=post; restore_skipped requires target=pre=post without mutation; restore_recovery_required retains its independent hold. Restart reconciles the same transaction before dispatch. |
| outcome_committed | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

restore_recovery_required remains a recorded unresolved outcome, never permission to dispatch; replay cannot clear the original recovery hold. Every restore outcome joins the original transaction and full equality evidence; restored_with_conflicts is refused.

ContractRef: ContractName:Plans/storage-plan.md#SP-558, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045


**Selected-original custody for `safe_point.restored` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.
