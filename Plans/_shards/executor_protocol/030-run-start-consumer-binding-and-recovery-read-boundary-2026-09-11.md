# Shard 030: Run-start consumer binding and recovery read boundary - 2026-09-11

Source: `Plans/Executor_Protocol.md`

Source lines: L7265-L7515

Source SHA256: `0e776e116a335bbad98cf4a07f02282001ca3f398e498cec2c3eb28e7797a6b9`

---

## Run-start consumer binding and recovery read boundary - 2026-09-11

**Versioned run-start reader adoption.** For `run.started`, the current reader is `executor.run_start_recovery_evidence.v2@2.0.0` through `storage.run_started_index.v2@2.0.0` and the SP-265/SP-278 successor contract. The v1 identifiers in the following predecessor text are compatibility-only; its owner behavior and restrictions apply unchanged to v2. Current publication requires the actual admitted full rebuild and complete current index/source token. Substituting version strings or accepting an old stored digest does not upgrade a v1 reader.

Under DL-045 this addendum newly defines `executor.run_start_recovery_evidence.v1@1.0.0`, a read-consumer binding through SP-265's `storage.run_started_index.v1@1.0.0` reducer and `run_started_index_checkpoint.v1:{storage_instance_id}:{scope_partition}`. It names the existing Executor restart/admission read path, not a new recovery service or handler. Its source is the CURRENT-selected EventRecord index **plus the verified source frame and immutable runtime snapshot**, not index-only run state. The consumer validates the requested run against `payload.run_id`, preserves envelope/project/thread joins, and reports the source event identity and snapshot ref. It cannot materialize missing intake, attempt, safe-point, permission or dispatch authority.

The producer remains Executor's existing immutable start barrier. It still persists and verifies the complete `pm.requested_effective_runtime@1.0.0` snapshot and six owner joins before activation, follows `candidate -> admission_validated -> runtime_identity_resolved -> activated -> start_recorded`, and obtains the synced barrier AppendReceipt before attributable provider/tool work. No GUI/index refresh timing replaces that receipt or becomes an extra provider-start condition. The EventRecord envelope remains `2.0.0`, payload remains the current closed run-start v2 root, and source retention remains `RP-RUNTIME-365D@1.0.0`.

To make the already required same-semantic-start idempotency concrete, newly define the mechanical start identity as `(storage_instance_id, project_id, run_id)` for this binding. Use `replay_policy=dedupe_by_idempotency_key`, `idempotency_key = "run-start:" + lowerhex(SHA256(RFC8785([project_id, run_id])))`, and `event_id = "evt_run_start_" + lowerhex(SHA256(RFC8785([storage_instance_id, project_id, run_id])))`. Storage supplies its actual instance ID and scopes the key by `(scope_partition, event_type, idempotency_key)` under the existing app-root lifetime rule. No account, timestamp, attempt, retry, selected tab or checkpoint generation enters those identities. These formulas are new owner definitions, not claims about existing bytes; historical event identities are never relabelled or rehashed.

The new formulas apply only to a genuinely new logical start. During handover, before treating a run as new, the existing admission path must establish from the verified canonical tail whether that exact project/run already has a committed start, including historical v2 records with other stable keys. If it does, preserve and replay that original event ID/key; never mint the new-formula identity for the same existing run. Retained-tail absence is not historical absence: lawful expiry/deletion may have removed the source. A genuinely new owner-issued run identity or surviving durable owner identity/dedupe evidence must establish that a new logical start is admissible. If neither proves the distinction, return `dedupe_unavailable`; a missing historical source cannot authorize a second start. An incomplete or ambiguous tail check fails closed. Under the existing serialized run-start admission path, first check the current app-root dedupe authority. If the same logical start is already durably committed, compare the immutable semantic request, snapshot ref/digest and producer-owned intent with that original event and return the original durable result; preserve its original authored timestamps, actor/causal fields and bytes. Do not regenerate those fields on retry. A different snapshot, scope or semantic intent under the same identity is `idempotency_conflict`; uncertain dedupe/append truth is `dedupe_unavailable` and blocks further dispatch until Storage reconciles the original append. A valid unacknowledged tail may be adopted only by Case L-2 recovery. Absence of a UI row or missing caller acknowledgement is never permission to append or execute again. Resume of an existing run keeps the same run identity and uses existing resume/attempt authority; it does not mint a second start. A genuinely new run has a new owner-issued `run_id`.

`executor.run_start_recovery_evidence.v1` treats a verified start as evidence of the original start barrier, never evidence that an attempt is live, complete, safe to retry or authorized now. Recovery still requires canonical `executor_intake_report`, `attempt_receipt`, runtime checkpoint markers, safe points, current permissions, worktree/baseline and currentness checks from their owners. Missing canonical records require verified mandatory-backup recovery; neither EventRecord fields nor this disposable checkpoint reconstruct them. Storage recovery, projection rebuild, historical replay or a late start row cannot auto-resume work, repeat provider/tool/network effects, change terminal run state or create Usage charges.

Consumer-only invalidation/withdrawal fences this read path and any recovery admission that requires it, while retaining existing owner behavior for independent new-run admission. Withdrawal of the run-start writer itself stops new activation/start writes until the explicit compatible successor is adopted; it does not remove registration or rewrite history. SP-265 owns checkpoint rebuild and custody; this owner retains execution admission and all current no-auto-resume rules.

ContractRef: ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:pm.requested_effective_runtime

### Original run-start first-receipt recovery adoption

For exactly the existing `run.started` start barrier and `executor.run_start_recovery_evidence.v2@2.0.0`, Executor explicitly adopts SP-286/CV-339's `storage.first_append_receipt.resolve.v2`. The request is the original admitted EventRecord identity/semantic request under its existing replay policy, not a caller custody row or receipt. Preserve the original Storage instance, project/run identity, actual original event ID and scoped idempotency key, immutable snapshot ref/digest, producer intent and authored semantic fields. Resolve historical original identities before applying the new-run formula; an allowed scoped alternate incoming event ID resolves the original ID and cannot create another logical start. Storage authenticates actual global/scoped key/raw identity, source semantic tuple and canonical issued custody in its original database. The returned eleven-field AppendReceipt and the retained four-field original_append_result must join that original event/sequence and Storage-owned original segment reference/offset. Exact original durability class is the required synced start barrier; a newer locator, timestamp, supplied digest or four-field dedupe result alone cannot satisfy it.

An intact already-issued receipt replays unchanged after lost delivery or interrupted dependent acknowledgement. This passive receipt resolution does not reopen a retired source, reacquire the old manifest/group/request or establish present execution authority. The existing recovery reader still needs its independently verified current SP-265/SP-278 source/index boundary and original runtime snapshot when it claims those source facts; source or snapshot unavailability refuses that claim without erasing an intact receipt. Original full-frame/source/CRC/durability and complete snapshot/six-owner joins remain mandatory where required by the existing start barrier. Receipt-only resolution is not proof that a supplied complete EventRecord equals its originally issued value. For that stronger claim this owner explicitly adopts `storage.first_append_receipt.resolve_full_value.v1` with exact `full_value_request = {event: <the available complete original EventRecord>}` and `full_value_result` from `Plans/event_append_receipt_contracts.schema.json`: compare the original first receipt, original segment ref and CV-339 complete-value commitment to the independently selected original source. It requires actual v2 custody and exact original event ID. An unavailable full-value route cannot be downgraded to semantic replay; an intact v1 row retains only its existing semantic receipt use. No raw value is reconstructed for this call.

Uncertain append is resolved by the actual Storage owner before any dependent start acknowledgement or attributable dispatch. Only an authenticated never-issued complete current protected group may reach `storage.first_append_receipt.issue.v2`, after the original source/manifest barriers and complete current group/source/dedupe/restore checks. Executor never calls first mint from a missing receipt, lost delivery, tail absence or a supplied never-issued flag. A proper subset, lost previously issued custody, restored old pending request or ambiguous original group remains fenced under existing `dedupe_unavailable`/integrity/recovery behavior. In-place restart after actual protected promotion follows SP-286's original group handoff without reconstructing old transient capabilities. A verified older restore does not make omitted run-start work fresh. Only an actual newly accepted owner-issued run after the coordinator's completed restore occurrence/session may use its fresh-operation admission; existing lost/restored run IDs and pending work cannot be renamed or reaccepted as a new start.

At the final held Executor acknowledgement/admission boundary, after all receipt/source/snapshot/currentness helpers, compare the complete original request, resolved receipt/result, actual run/source identity, immutable snapshot and current required permission/Stop/intake/attempt/safe-point/worktree/admission facts. No helper may change those facts between the final check and publication. A passive recovery read instead applies its existing current inspection/access/source token and no-auto-resume predicates; it does not require or grant live-run authority merely to return historical receipt evidence. Any later refusal preserves actual prior start/receipt effects. Receipt recovery cannot activate or resume work, repeat provider/tool/network effects, manufacture missing owner records, change terminal run state or charge Usage. This is explicit adoption of existing shared interfaces, not a new event, source provider, native implementation claim or checkpoint.

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-116, ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/event_append_receipt_contracts.schema.json

### EP-116 - Run-start identity and recovery consumer

```yaml
plan_unit_id: EP-116
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'Executor newly defines executor.run_start_recovery_evidence.v2@2.0.0 through SP-265 and
  keeps its existing complete immutable runtime-snapshot barrier before attributable execution. A genuinely
  new logical start uses idempotency_key run-start: plus lowercase SHA-256 of RFC8785([project_id,run_id])
  and event_id evt_run_start_ plus lowercase SHA-256 of RFC8785([storage_instance_id,project_id,run_id]).
  Historical committed identities take precedence; retained-tail absence after lawful removal never proves
  a new run. Equal semantic retries return original durable results and preserve authored bytes, while
  conflicting or uncertain identity fails idempotency_conflict or dedupe_unavailable. The recovery reader
  supplies verified historical start evidence only; canonical intake, attempt, permissions, safe-point
  and currentness authority remain independently required, with no replay dispatch, resume, canonical
  reconstruction or Usage charge. The v1 reader is compatibility-only for this family; current v2 publication
  requires the explicitly admitted SP-265/SP-278 successor and complete current source/index token, with
  unchanged owner behavior.'
gui_related: false
gui_classification_reason: Defines storage or execution contracts, not a new visual surface.
depends_on:
- SP-265
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- Immutable snapshot and six owner joins precede the existing durable start barrier and attributable execution.
- New mechanical identity formulas preserve existing historical event IDs/keys; retained-tail absence
  cannot prove a new logical run, and unknown durable identity is dedupe_unavailable.
- Same semantic start returns the original durable result; conflicting snapshot/intent and uncertain append
  truth produce no second event or dispatch.
- Explicit SP-286/CV-339 receipt resolution preserves issued replay, authentic never-issued protected-group
  recovery and restored/lost-work fencing; full-value-dependent claims require the separate exact v2
  original-value interface without downgrading unavailable proof.
- Final receipt/source/snapshot/admission joins precede dependent publication; passive recovery grants no
  live-run authority and never reacquires retired source solely for an intact receipt.
- The recovery consumer never reconstructs canonical intake/attempt authority, changes terminal state,
  auto-resumes work or charges Usage.
validation_surfaces:
- Plans/run_started_consumer_contracts.schema.json
- Plans/run_started_consumer_contract_fixtures.json
- Native execution of the named replay, crash, source-lookup and custody pairs remains required.
- Plans/event_index_consumer_adoption.schema.json
- Plans/event_index_consumer_adoption_fixtures.json
risk_class: event_source_and_checkpoint_authority_drift
reasoning_tier: high
context_scope: run_started_single_family_depth
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: run_started_owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20260911/step-08-run-started-depth.json
- Plans/storage-plan.md#run-start-and-restore-created-versioned-index-adoption
source_atom_ids: []
negative_constraints:
- No event membership, retention-policy definition, frozen accounting, runtime-proof or governance change.
- No canonical source reconstruction from a checkpoint or UI projection.
owner_hints:
- Plans/storage-plan.md
- Plans/Executor_Protocol.md
```

### EP-117 - Whole original intake, provisioning and bounded native materialization

EP-117 defines original accepted-request intake/provisioning and the bounded native materialization source composition. CV-349 preserves the complete native schema and every original physical field. SP-308 provides exact source/receipt/capture/WorkNode/control/result/origin custody; GRS-077 owns the actual Goal association and Workflow birth. An adopted source contract does not instantiate a WorkNode or grant an Executor lease.

#### Seven whole original input roles

Every role has a complete original semantic output owner, separately identified capture publisher/origin, original durable primary/origin and the following exact full read interface. The request/result definition names resolve in `Plans/workflow_activation_contracts/schemas/operational-custody.v2.schema.json`; source-control primary/origin definitions retain their exact independent source-control resource. The complete source and current-control arguments remain in separate CV-349 realms.

| Whole original input role | Actual output owner | Original durable reader | Full direct request/result |
|---|---|---|---|
| `native_compile` | `owner.plan_compile.native.publish_state_input.v1` | `owner.native_plan_compile_checkpoint.read_original.v1` | `/$defs/CompilerReadRequest` / `/$defs/CompilerReadResult` in operational-custody.v2 |
| `compile_certification` | `owner.plan_compile.native.publish_certification_input.v1` | `owner.native_plan_compile_certification_receipt.read_original.v1` | `/$defs/CertificationReadRequest` / `/$defs/CertificationReadResult` in operational-custody.v2 |
| `aggregate_intake` | `owner.executor.intake.publish_aggregate_input.v1` | `owner.executor_aggregate_intake_receipt.read_original.v1` | `/$defs/AggregateReadRequest` / `/$defs/AggregateReadResult` in operational-custody.v2 |
| `test_capability` | `owner.ats.test_capability.output.v1` | `owner.ats_test_capability_receipt.read_original.v1` | `/$defs/TestReadRequest` / `/$defs/TestReadResult` in operational-custody.v2 |
| `model_resolution` | `models.resolve_plans_to_code_role.v1` | `owner.models_plans_to_code_resolution_receipt.read_original.v1` | `/$defs/ModelsReadRequest` / `/$defs/ModelsReadResult` in operational-custody.v2 |
| `worknode_request_set` | `goal_runtime.executor.decide_activation_request_set.v1` | `owner.workflow_activation_request_set_decision.read_original.v1` | `/$defs/RequestSetReadRequest` / `/$defs/RequestSetReadResult` in operational-custody.v2 |
| `source_control_preflight` | `owner.executor.source_control_preflight.output.v1` | `owner.executor_source_control_preflight_receipt_source.read_original_activation.v1` | `/$defs/PreflightReadRequest` / `/$defs/PreflightReadResult` in operational-custody.v2 |


The original publishers and every lower reader authenticate the exact actual accepted graph/request/source scope, entire original input value and canonical request digest, operation/output identity and revision, owner/epoch, occurrence and original transaction. Equal bytes from another operation do not acquire original identity. Every complete durable binding retains the original capture and actual primary/origin; the capture is provenance, not input content or a renewed live lease. Current direct live/audit result selection remains CV-349’s exact inner union; durable reads retain their whole available/unavailable grammar and action_authority=none.

#### Actual aggregate intake and provisioning

`owner.executor.intake.publish_aggregate_input.v1` publishes the entire thirteen-field executor_intake_report through the new executor_aggregate_intake_receipt family. Every blocker, accepted/rejected request, source-control/test/Models/authority/evidence reference and full handoff remains. It binds the genuine whole graph and complete per-request reports under their unchanged MessagePack family. Already committed genuine per-request rows are read dependencies; newly co-issued rows participate only through their real original transaction. The aggregate is the actual original output, not a reconstruction from a later collection, and no per-request registry row is repurposed as the aggregate. Mixed, blocked, rejected and all explanations remain truthful. An incompatible genuine per-request value under an inherited PredicateObservation refinement is unavailable until its original owner/consumer schema contract is resolved; it cannot be coerced to fit.

`owner.executor.intake.issue.v1` independently derives the complete A4 NativeIntakeSource from these actual aggregate/per-request sources and accepted original graph/request membership. `owner.executor.provision.issue.v1` independently derives the complete A4 ProvisioningReceipt from the actual accepted requests and genuine preflight, test and Models outputs. Both preserve exact required/optional membership and original original_source/complete_input bindings. Revalidate approved versus actual repository, host, environment, original permission/write ceilings, provider/account/model, test capability/harness, source-control/safe-point/rollback, budget, parallelism and current writer-capable Storage at their actual owners. No fake Attempt or WorkNode is created to fill an execution_unit_context; real native context, when present, remains whole under its unchanged owner schema.

Source-control preflight reuses the one genuine `executor_source_control_preflight_receipt_source` and `executor_sc_receipt_original_origin` through `owner.executor.source_control_preflight.output.v1` joined with `owner.storage.executor_sc_receipt.publish.v1`. `owner.executor_source_control_preflight_receipt_source.read_original_activation.v1` consumes the whole original PreflightReadRequest/PreflightReadResult. The full 25-field receipt at /record/receipt, complete original context and handoff match the exact same accepted request, whole request digest, scope, output_identity, occurrence and actual service/native operation as OriginalPreflightLiveStage. Its separately typed live capture and origin remain original provenance. A later completion capture, current repository report, fresh probe or compact live capture cannot replace it. Existing SCS-021/FileSafe/source-control recovery and backup claims remain independently required where applicable; this accepted-request reuse adds no Source Control product operation or new receipt body.

ATS-053 supplies the complete 22-field original test_capability_report and original output identity; MS-139 supplies all eight original Models resolution fields plus actual native model/configuration/capability and runtime sources where required. Neither source is reduced to a capability Boolean or effective-model name. The original provisioning output retains all members of those role arrays, preserving original request applicability. Absence is admissible only when the genuine original provisioning source has no such member and the actual original admission permits that branch; a failed reader is never converted to absence.

`owner.executor.activation.decide.v1` performs its own full source integrity, accepted membership, provisioning and original request-set checks, issuing a complete original decision/origin only on actual owner admission. `goal_runtime.executor.decide_activation_request_set.v1` retains the entire WorkNodeRequests decision and its exact reasons/readiness/activation linkage. A mixed required result refuses; a retained failed decision is not re-decided to manufacture materialization.

#### Complete current materialization argument and native join

`Plans/workflow_activation_contracts/schemas/native-worknode-current-activation.v1.schema.json` has a new explicit resource ID. `Plans/workflow_activation_contracts/current-materialization-reference-map.json` enumerates its 33 ID/reference changes and verifies that reversing only those changes reconstructs the entire old schema exactly. Activation references now name the actual full A4 resource explicitly; all other relative references name their exact old effective resources so the new enclosing ID cannot alter their target. The old native schema/ID and complete graph remain historical resources. No old lexical alias is rebound to the new native schema. A4 remains byte-exact: all 82 definitions, source records, original metadata and capture provenance are unchanged.

`Plans/workflow_activation_contracts/schemas/current-materialization.v1.schema.json` adds a separate whole current source argument. `native_candidates` is the complete current-native MaterializeCurrentCandidates, including every original input, whole WorkNode/control/run-control candidate and complete original result. Current original RequiredSet and CompletionRequirementSource additionally retain their whole A4 bodies with GRS-075 empty-child refinements. The complete current source graph is authenticated too; array validation alone is insufficient.

The second part supplies seven full original activation source values with their genuine original issuer origins: native compiler source, certified graph, aggregate intake source, provisioning source, accepted activation decision, original completion requirements and this complete source request. These are actual complete A4 physical values, not metadata projections or source-hash placeholders. OriginalSourceBinding/physical keys and complete physical hashes must equal the genuine sources referenced by the native inputs and the original accepted graph/activation chain. The native input `original_source_request` equals the source request's entire semantic record. Pending materialization values are independently derived complete candidates in the actual original transaction, not falsely claimed previously persisted sources.

`seven_durable_original_inputs` supplies all seven typed routes. Compiler, certification, aggregate and request-set entries contain their complete durable binding and entire successful original read. Preflight, test and Models entries contain complete collections of those same pairs, preserving every corresponding original provisioning member. The original owner proves exact multiset membership and identity with no duplicates, omissions or foreign entries; original array order is preserved wherever the canonical source declares it. An empty collection is allowed only when the complete authenticated original provisioning source has no member for that role and the actual original admission permits that case. Missing source or failed read never becomes empty, and no not-required result, fake probe or invented model output is introduced. This preserves A4's existing per-role array cardinalities and original native obligations rather than narrowing them to one representative receipt.

Each durable binding's `original_capture` equals the complete original A4 metadata `complete_input` at its matching source position: NativeCompileSource.compile_metadata; CertifiedGraphSource.compile_certification_receipt; NativeIntakeSource.aggregate_intake; each ProvisioningReceipt.source_control/test_capability_reports/model_resolution_receipts member; and the native input RequiredSet.worknode_requests. The actual native owner authenticates original capture/source/origin identities and full bytes. A4's stored capture is provenance; this route does not call an original-live reader, demand its old native lease, change its source_mode, reissue a capture or treat retained metadata as full content.

For each pair, the original read's full source/origin is exactly the durable binding's selected primary/origin and belongs to the same actual original method, operation, transaction, output identity/revision and source scope. The complete returned input and original semantic hash/codec equal the whole genuine original value captured by that operation. Current compiler reads additionally carry the whole checkpoint, not just its run view. Native compiler source metadata, certification and graph/request sources, intake membership, provisioning source/request applicability and original WorkNodeRequests declaration must all describe the same accepted original activation. Distinct semantic outputs do not acquire identity merely from equal bytes or caller IDs.

The exact native candidate WorkNode, readiness, authority, model metadata, test binding, source lineage and currentness remain derived from these complete original sources. In particular the native WorkNode.model is the same entire A4 Models metadata object, while the durable Models collection supplies its full eight-field receipt and actual accepted-request applicability. Original requested_effective_runtime and original configuration/policy sources remain independently authenticated where required; the resolution receipt cannot substitute for them. Preflight uses C's one genuine primary/origin and does not fabricate native WorkNode/Attempt context for accepted-request preflight.

The original seven durable readers return their exact available/unavailable union. This success argument can only be prepared after every required whole original read is available. Upstream unavailable, corrupt, stale, foreign, duplicate or missing required inputs prevent original materialization; no validator fallback, old live retry, re-probe or second model resolution repairs them. A separately authorized new original operation needs new admission and provenance.

`current_guard` remains a separate native argument validated in the actual current shared-control realm. Materialization requires CurrentGoalGuard's actual_bound_goal branch and the complete genuine GRS-074 Workflow association already committed with the shared Goal metadata mutation. OriginalPreGoalGuard is valid for truly pre-Goal compiler/preflight sources but never for actual materialization. Full BodyControlV2, effective host Stop, binding revision/origin/control, exhaustive registered writer domain/head and actual original Goal/project/thread/run/owner joins are checked from real owners. Neither old native GoalControlWitness nor the schema-valid serialized arguments establish current authority.

Before helpers, each actual original Executor/Workflow/source/Storage participant authenticates all complete source/preimage values, owner capabilities and current guard, and independently derives all complete pending output rows/origins and the transaction union. Each helper/directly callable reader or lower writer repeats its own checks. After all helpers return, the actual native materializer and final joint publisher independently compare all full source and candidate bytes, original graph/requirement emptiness, current writer-domain/control/Stop and exact union in the final pure predicate with no subsequent helper or mutable gap before commit/release. The genuine same transaction includes full native WorkNode/control/run-control/result/origins and A4 born/materialization/installed-graph/required-set/body/control/transition participants. Whole authenticated readback precedes dependent exposure. No event or dispatch is released here; prior genuine effects remain durable on later refusal.



The named realms are exactly current_materialization_source for CurrentMaterializeArgument and WorkflowMaterializationLowerArgument, and current_goal_control for current_guard plus CurrentAssociatedGoalRead. T2 can begin only after GRS-077’s authentic T0/T1 binding reservation and original joint publication. The actual Goal B1 ordinary revision/currentness/body/control, accepted objective head and original binding receipt/origin must be the specifically committed association metadata step; an arbitrary intervening Goal edit is not admitted by the bridge. B0’s immutable launch selector stays historical. T2 reads whole actual current pre-materialization Workflow W0/control/outbox and every original source/origin; no vanished B0 full body is required.

Native MaterializeCurrentInputs.original_goal_run_body/control are the entire actual current W0 preimages at T2, not a later W1 and not a relabeled historic value. Native original_installed_graph and original_required_set are complete genuine candidates staged in that same T2, whose actual graph/requirement sources have already been authenticated. Born records/origins precede complete materialization receipts/origins, then full installed graph and RequiredSet/origins, then all complete native WorkNode wrappers, WorkNode controls, native operation results, global run control with its required installed_workgraph binding, and their original native publication origins. The actual original transition/origin precedes W1’s origin and new Workflow control/origin; W1 remains ready with materialized activation state and ordinary Workflow revision advancing once. Actual shared Goal B1 and binding are guarded reads and do not mutate again.

The whole native materialization participants include executor_worknode, executor_worknode_control, executor_run_execution_control, executor_native_operation_result, executor_run_operation_result and executor_original_publication_origin under their exact original schemas and owner transaction. Per-member and global result/control origins are whole genuine co-issued values. The complete outer T2 union also includes A4 born sources, materialization receipts, installed graph, RequiredSet, Workflow body/control and activation transition with every original origin. No missing global run result/control or unrelated preserved member can be hidden by validating only a WorkNode candidate. Native result identities and all whole payload hashes are independently derived from actual original sources before helpers.

Original output/receipt candidates are not pre-issued admission proofs. If a required nested authority/source/hash dependency points back to a future BindingOrigin, after-binding-control, W1 origin or returned result, the route refuses; no required field is omitted to make the dependency graph acyclic. The full GRS-077 dependency map is enforced at the actual native boundary, including fixed actual owner time attribution. T2 completion returns genuine original result/readback and releases no event, Attempt, tool dispatch or Usage charge.

The retained CurrentWorkflowLaunchChainRead supports only GRS-077’s original pre-start materialization/staging/preparation successor path. Stage/prepare use the current Workflow body/control and their authentic compact transition sources, not an archived W0 body. Later native execution/state changes remain separately admitted. A retry after genuine T2 returns the original actual receipt/result and verifies current relevant source truth; it does not create a second birth or materialization.

#### Complete later native dependencies remain separately admitted

| Existing complete native method | Current activation selection |
|---|---|
| `owner.executor.activation.materialize.v1` | Original T2 materialization only, under the whole current source and current-Goal arguments. |
| `owner.executor.native.begin_attempt.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.submit_verification.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.record_verified.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.record_failed.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.complete_worknode.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.record_cancellation.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.record_invalidation.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.apply_graph_lock.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.capture_original_input.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |

All ten original native method IDs retain their complete input/candidate definitions, joint family sets and existing operation semantics. Keeping later attempt, verification, completion, cancellation, invalidation, graph-lock or capture schema definitions in the current resource graph is not admission to call them through activation. Each later owner must independently establish its actual original lifecycle/source contract, native capability and complete writer/final predicates. The three existing generic native dependency families remain in their unchanged original registry posture, with no runtime promotion. Current materialization cannot use a dependency-only route as an alternate private writer.

Every independently callable original issuer, capture participant, head/artifact writer, Storage publisher, live/current/durable/retained reader, recovery reader and replay responder must enforce both native boundaries itself. Before its first returning helper it authenticates the complete actual operation, registered owner and epoch, native Storage/root/backend identity, whole original source values and beforeimages, current permissions, effective Stop/cancellation, writer/registration generations, deletion/tombstone/hold and coherent recovery state. It independently derives every complete permissible candidate and return from those sources. Caller-selected method, schema, family, codec, source mode, operation ID, owner string or serialized lease cannot establish that authority.

After all returning parsers, builders, codecs, copies, resolvers, validators, comparison helpers and currentness reads, the same original participant independently rechecks the whole authentic source/preimage set, actual native fences and entire candidate. A publisher checks its complete pending transaction union, including preserved/unrelated members; the outer joint publisher independently checks the complete joined union as well. One final pure predicate has no returning helper, asynchronous callback, logger or mutable gap before that participant’s commit or passive disclosure. A lower entry never inherits authority merely because its caller checked. Whole original readback with its own independent final predicate precedes dependent release. A later refusal preserves every genuine prior effect and never repairs a missing source by replaying its producer.

This unit establishes a canonical source contract and the required original-owner placements. Native installation and capability authentication, original source execution, all-writer exclusion, exact codec execution, redb atomicity/fsync/crash behavior, retained/current replay and coherent backup/restore remain NOT_RUN. Schema/source checks do not establish those properties. No WorkNode, NodeSeed, executable queue, runtime launch, PNC-019 enablement, readiness admission, event-depth pass, Step 9 campaign result, global D05 closure or governance seal follows from this adoption.

```yaml
plan_unit_id: EP-117
unit_type: schema_contract
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Whole original intake, provisioning and bounded native materialization. Materialization consumes
  all seven complete genuine original durable input roles with exact membership, operation/source identity and current
  native owner admission.
gui_related: false
gui_classification_reason: Defines original source, owner, storage and verification semantics without a visual surface.
split_recommended: false
depends_on:
- EP-103
- EP-116
- GRS-077
- CV-349
- SP-308
- PNC-025
unblocks: []
acceptance_criteria:
- Materialization consumes all seven complete genuine original durable input roles with exact membership, operation/source
  identity and current native owner admission.
- The complete current native candidate and A4 source graph are preserved and joined to actual current Goal control
  in separate resource realms.
- One original T2 joins every native WorkNode/control/run/result/origin and Workflow born/materialization/graph/RequiredSet/body/control/transition
  participant.
- Same-original preflight and Models sources are reused without fake Attempt/context, new producer replay or metadata
  substitution.
- Nine later native operations remain complete dependency contracts with no current activation dispatch or lifecycle
  authority.
validation_surfaces:
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/schemas/current-materialization.v1.schema.json
- Plans/workflow_activation_contracts/schemas/native-worknode-current-activation.v1.schema.json
- Plans/workflow_activation_contracts/native-birth-field-map.json
- Plans/workflow_activation_contracts/activation-field-map.json
- Plans/workflow_activation_contracts/source-control-field-map.json
- Plans/Goal_Runtime_System.md#GRS-077
risk_class: workflow_activation_original_source_or_lifetime_drift
reasoning_tier: high
context_scope: ep_117_activation_original_custody
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/physical-families.json
source_atom_ids: []
negative_constraints:
- No public command, event or Goal lifecycle expansion and no fabricated original source or receipt.
- No full historical mutable-body archive, new retention policy, native field redaction, numeric coercion or automatic
  deployed migration.
- No WorkNode/NodeSeed/runtime/readiness/global event-depth or governance claim from source adoption.
```

ContractRef: ContractName:Plans/workflow_activation_contracts/methods.json, ContractName:Plans/workflow_activation_contracts/schemas/current-materialization.v1.schema.json, ContractName:Plans/workflow_activation_contracts/schemas/native-worknode-current-activation.v1.schema.json, ContractName:Plans/workflow_activation_contracts/native-birth-field-map.json, ContractName:Plans/workflow_activation_contracts/activation-field-map.json, ContractName:Plans/workflow_activation_contracts/source-control-field-map.json, ContractName:Plans/Goal_Runtime_System.md#GRS-077
