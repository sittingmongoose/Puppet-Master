# Shard 030: Run-start consumer binding and recovery read boundary - 2026-09-11

Source: `Plans/Executor_Protocol.md`

Source lines: L7265-L8447

Source SHA256: `f9859b9c1c413bf547e524701feb57ac6662a2e254fa7ef6c15730c6cb91c32f`

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

### EP-118 - Whole current Workflow sources, original start and bounded cancellation

#### Complete current Workflow and scheduler source

The current D01 source is the whole `Plans/executor_cancellation_contracts/schemas/workflow-original-start.v2.schema.json` resource. Its `WorkflowCurrent`, `CurrentSource`, `StopSource`, original birth/coverage/transition inputs and all 64 definitions retain the complete native and activation dependencies. Use complete A4 sources and the complete current 85-definition native resource; neither a body/control pair nor a metadata selector substitutes for the entire applicable input. Current D02/D03 scheduler values preserve their seven ordinary v2 wrappers and original v1 method identities. Their unchanged value shape does not exempt the actual writer from current source admission.

Install the exact current source and all original observer hooks before genuine Workflow birth and first coverage. `owner.executor.workflow_source.enroll_workflow_birth.v3` participates in `owner.workflow.activation.begin.v1` at actual T1; `begin_coverage.v3` participates in actual first `owner.executor.activation.materialize.v1` at T2; `update_workflow.v3` observes the original materialized, stage-entrypoint, prepare-start, prestart-abort, separately admitted original-start or D06 writer. D01 never becomes the issuer of the underlying native effect. All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`; this adoption supplies no completion, certification, ownership-transfer or optional/replanned materialization route.

T1 uses full `OriginalBirthArgument`, full `WorkflowBirthInput`, and the separate `BirthGoalArgument`/`BindingLowerArgument` before-and-prepared Goal union. The whole birth candidate equals authentic prepared Workflow body/control and original accepted activation/launch sources. Initial start control and its original begin origin are derived joint outputs, not future preexisting admission evidence. T2 uses full `OriginalFirstCoverageArgument` and `OriginalMaterializedWorkflowUpdateArgument`, including every actual WorkNode/control/result/origin, whole global run control/result/origins, A4 born/materialization/graph/RequiredSet/body/control/transition union and original outbox. Separate `CurrentAssociatedGoalRead` supplies actual B1 controls and association. Do not reduce a batch to one representative node or demand vanished B0/W0 beforeimages after their original publication.

The native run-control outer hash, semantic run-result hash and whole physical wrapper checks keep their original distinct domains. Derive run control, run result, then original result origin. Initial zero revision/null before-control is permissible only for genuinely absent native keys under actual original admission; a failed read, missing restored row or obsolete head is not absence. D01 lineage and scheduler/inventory membership preserve complete original identity, order where declared, owner generations, current head CAS and original provenance.

Every materialization/attempt registration, wake record/consume, delay record/release, capacity reserve/release, dispatch admission/handoff acknowledgement, Stop recording/recovery and current/Stop reader uses its complete original method input and applicable current Start and separate Goal companion from the exact method map. A precoverage read carries full `WorkflowCurrent` and authentic initialized start control/origin; it does not invent coverage, SchedulerControl or empty inventory. Postcoverage reads carry complete `CurrentSource`. Original T1/T2 arguments are confined to their actual original phase. Later stage/prepare uses full present native truth and immutable original activation/transition sources. Existing native method definitions remain dependency-only wherever their separate lifecycle owner has not admitted the effect.

The named offline source and Goal-control realms preserve their complete resource maps, retrieval bases and embedded-resource pointers. No network fallback, same-ID replacement, caller-selected realm or merged conflicting registry is admitted. Each actual original owner joins the full arguments through genuine native operation, root, scope, registration, owner epoch, current permission/Stop/association and final fences. Every independently callable participant authenticates the full source/preimage set before helpers and derives its entire permitted candidate; after all returning helpers it repeats one final pure predicate over complete sources, current native fences and the whole transaction/disclosure union, with no helper or mutable gap before effect or release. Original readback independently checks the committed union. Serialization, enum membership and matching URI/hash establish no native capability.

#### Original Workflow start and later source reads

`owner.workflow.activation.commit_start.v2` and its original Storage participant `owner.storage.workflow_start.commit_original.v2` bind coordinator profile `workflow_start_original.v2`. Both require the complete `OriginalCommitArgument` in the current Workflow/native realm and separate complete `OriginalGoalArgument` in the Goal-control realm. Preserve genuine whole current WorkNodes, scheduler/inventory/run controls, immutable graph/RequiredSet/materialization sources, activation receipt, staging, seven durable inputs and accepted nonempty exact request membership. Scheduler Stop and run cancellation must be null and the separate current Goal argument must prove no effective Stop. Existing permissions, write mode, provider/model/account, budget, parallelism and writer-capable Storage admission remain actual owner predicates.

The full start definitions resolve in `Plans/executor_cancellation_contracts/schemas/workflow-start-custody.v2.schema.json`; private activation-phase arguments use `workflow-start-arguments.v2.schema.json` and separate Goal arguments use `workflow-start-goal-argument.v2.schema.json` in the same canonical directory. The original A4 outbox remains the exact v1 prepared record with intended payload v2, null event/receipt and false dispatch release. The new disjoint StartCandidate explicitly binds that historical preparation to delivery payload v3 under `original_workflow_start_clock_split.v1`; it does not migrate the old intent or reinterpret its literal version. Original birth initializes the new per-run StartControl at epoch zero with no pending candidate, committed start or start operation, together with authentic `OwnerIssueOriginPhysical`. Missing original control/profile refuses later admission; no retroactive enrollment or zero initialization repairs it.

At original start, independently derive the full native after-images: Workflow status becomes running, body revision advances once, activation state changes start_event_pending to active and activation revision advances once; all other body fields remain exact. Control matches the new body revision/semantic hash, retains actual owner epoch and has no pending operation. Goal body/control remain unchanged. The existing five-field ActivationTransitionReceipt preserves its original meaning inside compact StartCommit, without a new write to the old activation-transition family.

The complete coordinated outcome contains one authentic EventRecord append, its synced first barrier and original full-value custody, the native body/control, StartCandidate/Commit/Control/Origin and D01 update/head/pointer/lineage-origin. All unchanged WorkNode, run and scheduler participants remain preserved and fenced. Authenticate genuine immutable-key absence, exact current control/head CAS and operation uniqueness; an absent caller acknowledgement, expired event, missing backup member or failed lookup proves none of them. Derive native physical after-images, then compact Commit, StartControl, StartOrigin, then D01 members; StartOrigin excludes the downstream D01 hashes that bind it. This is dependency order within one coherent original outcome, not authorization for separately visible commits. Each upper/lower publisher independently applies both whole-union native boundaries. Matching transaction strings, a redb commit or an append receipt alone cannot establish cross-store atomicity.

Only the actual held original invocation returns full `PublicationResult`, while its complete producer, native after-images and co-issued D01 result exist. Same-identity/same-digest dedupe permits no second append/CAS/effect. This bounded source supplies no later full commit-replay route: compact custody cannot recreate historical native bodies or original full result. Differing digest is idempotency_conflict, stale native revision is revision_conflict, and unprovable dedupe is dedupe_unavailable. Preserve original event ID, occurred time and producer fields; a new key or timestamp cannot bypass original-start uniqueness.

`owner.workflow.activation.read_started_current.v2` instead returns complete `CurrentSourceArgument` or original D01 `Unavailable`, with separate fresh `CurrentGoalArgument`. It joins compact original Commit/Origin and current StartControl to full present native/D01 truth. Historical start commitments bind their original lineage link, including after a later admitted D06 transition; they are not equated to the latest body. `recover_start.v2` only classifies authentic original outcome. Externally pending or ambiguous partial publication stays fenced; this bounded coordinator has no pending-marker completion, independent append/body repair or dispatch route. Prestart abort requires its own original proof of no append/effect and never reclassifies a committed start.

Whole original readback and final predicates precede running projection or runnable release. Executor's subsequent real admission consumes the original Workflow barrier plus fresh readiness/Stop/current source guards. This Workflow event remains distinct from Executor attempt `run.started` and does not itself create an Attempt, provider/tool invocation or Usage charge.


Candidate.actual_source_argument_sha256 and Origin.actual_source_argument_sha256 hash the complete OriginalWorkflowArgument using `pm.workflow.activation_source_json.v1`; the root excludes the enclosing OriginalCommitArgument, stored Candidate and co-issued output union. GoalContextCommitment.source_argument_sha256 and Origin.goal_source_argument_sha256 hash the complete separate OriginalGoalArgument through that same codec. Neither recipe projects away producer, current-control or initialized-control fields. The exact roots prevent a candidate/origin self-dependency.

Successful StartControl advances its own epoch exactly once, clears pending candidate, selects the genuine original immutable commit and records the original start operation. The old A4 outbox remains byte-equal after start: its prepared/null/false fields are historical preparation, not a current dispatch verdict. Current consumers use the complete new start source and actual original current authority.
#### Positive D06 bounded terminal publication

The whole `Plans/executor_cancellation_contracts/schemas/workflow-cancel-positive-safestop.v1.schema.json` resource preserves all 44 D06 definitions and changes only resource identity and the false D05 slot to full start-aware `SuccessfulReadback`. The old false profile remains historical. Install `original_bounded_safe_stop_terminal_publication.v1` at actual native original registration before complete domain birth; unchanged D06 v3 method literals bind the exact positive source/profile in that original descriptor. D05/current C do not import the future consumer. Value-grammar equality of stored D06 rows permits compatible original value reading; it does not upgrade an old false native registration.

The private argument roots resolve in `Plans/executor_cancellation_contracts/schemas/workflow-cancel-positive-arguments.v1.schema.json`; the whole D05 root is `Plans/executor_cancellation_contracts/schemas/safestop-original-start.v1.schema.json#/$defs/SuccessfulReadback` and its start companion is `Plans/executor_cancellation_contracts/schemas/safestop-start-arguments.v1.schema.json#/$defs/CurrentStartArgument`. Prepare/recovery consumes full `OriginalAdmission`; publication consumes full `OriginalPublication`; current reads consume full `CurrentRead` and return full `CurrentSuccessfulReadback`. Each non-retained entry additionally consumes separate `CurrentGoalStopArgument` and its existing complete D06 current-controls argument. Full CurrentStartArgument is mandatory. The actual owner joins full current D06 executor, both D05 current_executor participants, Start d01_current and the Goal native witness at one held native boundary, with exact same scope, graph, owner/generations, bodies/controls/lineage, inventory, SchedulerControl and run control.

Full D05 SuccessfulReadback must prove the entire original partition/capability census, immutable birth/reservation/compile chain, inventory cut, every supported original role/settlement and complete mandatory flush history. Unknown/unsupported/pre-attempt effects refuse; checkpoint success remains false. Required flush occurs even for a genuinely empty event set; every failed required flush remains sticky. D05Join identifies the native cancellation operation selected by original_scheduler_stop.native_cancel_result.operation_id. D05's own aggregate operation, D06's own operation/transaction and each effect/flush operation retain their distinct genuine identities. Authenticate their actual root Stop/SourceAudit/SchedulerStop causation; do not force unrelated operation IDs equal.

`ControlPlaneAdmission` contains authentic full DomainBirth, exact original terminal WriterRegistration and actual OriginalBoundary. That registration must be the actual matching DomainBirth/DomainCut member with native entrypoint, principal, original registration operation, positive contract/profile and epoch. Genuine current native authority traces to the original root Goal cancellation command; serialized handles or URI/role matches cannot grant it. All selected-run work/effect/callback/normalizer/drain capabilities remain revoked, and each CoreWriterCut retains unchanged queue/generation/admission members/counts. Distinct originally registered terminal service authority permits only this disposition and its required cancelled event/first barrier. It reopens no queue, admits no unknown producer and creates no ordinary late output.

Prepare derives the complete producer EventCandidate for the nonterminal branch, then Intent, initial Control and method-specific prepare Origin at exact absent operation keys. Same-operation equal occupancy is original recovery; unequal occupancy refuses. Intent binds whole actual before/after commitments and D05/Stop/inventory selections. Control moves prepared-to-committed with one revision increment and selects the one immutable Result. Origin binds only its closed prepare or publish outputs, excluding itself and downstream D01; Control names the origin operation rather than a circular origin hash. At publication derive native values, Result/committed Control, publish Origin and then D01 lineage under the authentic common exclusion/CAS and joint outcome. Terminal preservation has no EventCandidate.

For a nonterminal Workflow, status becomes cancelled and body revision advances once; Control matches while every other field, including activation state/revision, remains unchanged. Goal body/control are preserved. Publish whole original native after-images, compact D06 intent/control/result/origin, original typed goal_run.cancelled/v3 EventRecord/own first barrier and D01 update/head/pointer/origin in the authentic coordinated outcome. `D01CoissuedPublication` binds full held publication and original transition with genuine current before-values and derived co-issued after-values; no future receipt, D01 lineage or returned result is an admission prerequisite. Every original upper/lower boundary applies complete independent pre-helper/final predicates and original acyclic hash ordering. D-R17 effect branches, mutation_started, user_cancelled reason and actual settlement/rollback references come from their genuine original owners; empty dispatch or a rollback selector does not prove them. Keep Stop latched, active_run_ref/association, Goal objective/history/lifecycle and all WorkNode/Attempt/prior-result truth. No fifth Goal state, implicit resume, native cancellation repeat, Plan schedule/quota effect or replan bump is added. Already terminal status is preserved byte-for-byte with no new cancelled event, but still requires full D05 success to claim settlement.

D06 recovery resolves the original candidate/Intent/Control, genuine coordinator and actual append outcome. A proved never-published outcome may re-admit the same immutable operation/candidate with fresh complete current sources; committed outcomes use original custody. Unknown outcomes remain prepared/recovery_required, preserving all prior effects and never regenerating timestamps, candidate, receipt or conflicting intent.

Later current readback obtains fresh complete D05/Start/Goal/current controls after any native advancement; immutable aggregate/settlement/flush and start commitments retain their original historical links. It cannot reuse an old SuccessfulReadback body as current. `read_retained_disposition.v3` remains Request-to-RetainedResult metadata audit without fresh D05/Start/Goal/native prerequisites or action authority. Missing historical full values are not rebuilt from compact custody. D06's separate event has its own original barrier and never alters or substitutes for D05's sealed final flush.


For this exact cancelled-v3 source, the idempotency key is `pm.goal-runtime-event.v3:` followed by lowercase SHA-256 of RFC8785 JCS of `["pm.goal-runtime-event-idempotency.v3", scope_partition, "goal_run.cancelled", project_id, goal_id, goal_revision, expected_goal_run_revision, goal_run_revision, goal_run_id, "user_cancelled", mutation_started]`. Storage owns the exact reversible scope partition. Inner and outer keys must byte-equal; the unchanged original Goal context and advancing Workflow revision remain distinct clocks. Existing v2 identity and readers retain their original interpretation.

Before success, compare every stored producer-owned field against the genuine complete EventCandidate, not only producer_semantic_digest. Same original identity/digest uses the actual first original event, receipt and transition with no second append, revision increment or newly generated timestamp. Storage idempotency_conflict maps to D06 immutable_conflict; tail catch-up and dedupe_unavailable remain under original Storage authority. A different key never bypasses original native, Goal, Stop or CAS fences.

#### Event and native qualification boundary

GRS-079/SP-311 now adopt the complete original started-v3 reader/consumer, owned durable projection/checkpoint and exact existing-family registry selection. GRS-080/SP-312 now separately adopt the complete positive cancelled-v3 consumer, versioned combined projection/checkpoint and exact existing cancelled-family v3 source selection. Existing started-v3 methods, rows and profiles remain unchanged. The original started RP-RUNTIME-365D and cancelled RP-AUTHORITY-INDEFINITE policies remain unchanged. Neither source adoption nor a registry row clears Event depth, original native source/codec/custody/backup qualification or runtime execution; those independent gates remain unproved. No sibling checkpoint or passive none_required disposition is borrowed.

Native installation/capability authentication, complete original source execution, both final fences and all-writer exclusion, exact codec execution, original atomicity/fsync/crash recovery, current/retained replay, coherent backup/restore and compatible outer Goal terminal integration remain NOT_RUN. RequiredCheckpointSuccess is false in the bounded aggregate. No WorkNode, NodeSeed, executable queue, runtime/readiness admission, global safe-stop closure, Step 9 result or governance seal follows from these source contracts.

```yaml
plan_unit_id: EP-118
unit_type: schema_contract
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Whole current Workflow sources, original start and bounded cancellation. Original T1/T2 and later
  current source phases use complete separate current native and Goal arguments, with authentic original absence
  and source lineage.
gui_related: false
gui_classification_reason: Defines original runtime source, owner, storage and verification semantics without a
  visual surface.
split_recommended: false
depends_on:
- EP-117
- CV-349
- GRS-077
- SP-308
unblocks: []
acceptance_criteria:
- Original T1/T2 and later current source phases use complete separate current native and Goal arguments, with authentic
  original absence and source lineage.
- Original start and D06 publication preserve exact source clocks, full typed producer/custody, compact durable
  state and independently fenced atomic participant unions.
- Retained metadata audit never recreates expired original body, source, event or native authority.
- Unbound Workflow writers, active v3 event consumers and outer Goal terminal integration remain explicitly unavailable
  until separately admitted.
validation_surfaces:
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
- Plans/storage_value_registry.json
risk_class: original_workflow_source_custody_or_native_admission_drift
reasoning_tier: high
context_scope: ep_118_original_source_contract
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
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
source_atom_ids: []
negative_constraints:
- No public command, event-membership, Goal lifecycle or retention-policy expansion.
- No fabricated source, absence, origin, receipt, current body, native authority or retrospective original enrollment.
- No numeric coercion, lossy codec, hidden effect/census member or required-flush failure removal.
- No WorkNode/NodeSeed/runtime/readiness/event-depth/global safe-stop or governance claim from source adoption.
```

ContractRef: ContractName:Plans/executor_cancellation_contracts/methods.json, ContractName:Plans/executor_cancellation_contracts/realm-entry-boundaries.json, ContractName:Plans/executor_cancellation_contracts/physical-families.json, ContractName:Plans/executor_cancellation_schema_resources.json

### EP-119 - Original bounded safe-stop, FileSafe and disposable Process sources

These contracts define the selected original native source obligations. The complete schema and method declarations reside under `Plans/executor_cancellation_contracts/`. Exact original-owner authority, source availability and current fences remain required in addition to schema validity. Native execution is not established by this adoption.

#### Complete canonical source resources

Every short definition below resolves within the corresponding entire source resource and its exact offline owner realm. A stored wrapper selecting a historical dependency never selects a new private native operation.

| Complete source | Canonical file |
|---|---|
| Current D05 aggregate | `Plans/executor_cancellation_contracts/schemas/safestop-original-start.v1.schema.json` |
| Separate current Goal arguments | `Plans/executor_cancellation_contracts/schemas/safestop-current-goal-arguments.v1.schema.json` |
| Current and original-phase Start arguments | `Plans/executor_cancellation_contracts/schemas/safestop-start-arguments.v1.schema.json` |
| Original injective FileSafe source | `Plans/executor_cancellation_contracts/schemas/filesafe-injective-key-sources.v1.schema.json` |
| Original disposable Process source | `Plans/executor_cancellation_contracts/schemas/process-shutdown-sources.v1.schema.json` |
| Transient Process normalized producer | `Plans/executor_cancellation_contracts/schemas/process-normalized-producer.v1.schema.json` |

#### Complete bounded D05 admission

Existing Goal Stop, Executor cancellation, Workflow status, WorkNode lifecycle, Run Modes outcomes, FileSafe reconciliation, Storage durability and permissions retain their owners. Every positive value is issued by its genuine native owner during the actual original operation and privately read back; schema membership or a matching digest is not original authority.

#### Exact supported profile

The profile starts enrollment at original native launch identity reservation and concludes only for a genuinely Goal-bound C run with authentic Workflow birth/current lineage and actual Executor materialization. At that run's genuine Stop cut, its complete all-generation invocation census is either truly zero, or consists entirely of exact FileSafe v2 `restore_safe_point_then_retry` admissions and/or Process v1 originally disposable, unshared, PM-managed local Unix stdio MCP diagnostic admissions. A retry named in a FileSafe action does not authorize a retry after Stop. Process v1 covers each actual nested process only with its own original pre-effect C admission. Group membership cannot hide a tool/provider invocation inside a process row.

Every invocation in every historical materialization, attempt, retry, remediation, resume and replan generation remains counted, including acknowledged, unacknowledged, failed, terminal and outcome-unknown invocations. Unknown acceptance is unresolved even if no process is now visible. C's full materialized WorkNode/current-control, original materialization source/result/origin, attempt/current-control/birth and dispatch admission/origin/ack values are mandatory. WorkGraph membership, RequiredSet, current generation, UI queue emptiness or maximum matching receipt cannot replace that census. No cancelled WorkNode status or other lifecycle rewrite is introduced.

The only supported effect assessments are the complete original FileSafe resolved disposition and complete original Process quiescent disposition with all of their source readbacks and current owner boundaries. FileSafe does not prove current filesystem equality. Process termination/EOF does not prove provider, network, SCM, worktree, verification or tool side effects resolved. Those actual obligations remain separate, even if the outer dispatch's role is `process`. Normal pooled MCP remains pooled; cancellation never relabels it diagnostic. Any actual unsupported role, callback, descriptor escape, beneficiary, external effect, provisioning mutation or required checkpoint remains an explicit unresolved member and prevents success. Source-unavailable enumeration returns `enumeration_status=native_census_unavailable`; its known list is expressly incomplete, never certified empty.

This profile supports genuine zero required-checkpoint obligations established by original enrollment and current native obligation custody. It supplies no generic checkpoint-success adapter: `RequiredCheckpointSuccess` is false. A required checkpoint encountered in any original operation stays visible with its actual identity and `required_original_checkpoint_source_unavailable`. EP-115 requires checkpoints at actual context transitions; it does not mandate a fresh cancel snapshot. Existing FileSafe safe-point references alone are not evidence that a distinct required checkpoint completed. No checkpoint requirement is deleted, waived or replaced with an empty array to enter this profile. A future exact checkpoint owner source needs its own explicit successor binding.

#### Corrected C source and exact owner joins

Read the complete current GoalControlWitness, original StopIntent and StopReceipt, plus the separate mandatory CurrentGoalStopArgument carrying the whole current SourceAudit, from the original Goal cancellation owner. Verify original receipt/control epoch, Stop-intent/source-audit commitments and authentic original host transaction, plus the exact current Goal-bound Workflow/run binding. An already-latched Stop receipt and current StopControl, the original native `RunOperationResult(operation=cancel)` and PublicationOrigin, and the immutable SchedulerStop/inventory cut are distinct real originals. Their root cancellation operation IDs, complete scope, generations, before/after revisions, owners and native transaction sources must join exactly. The per-owner shutdown/restore/flush operation IDs remain distinct and are linked by real original admission, never overwritten with the root ID. Do not require the eventual Goal cancellation terminal or D06 result here; those depend on this aggregate and would create a cycle.

Stop must already fence the original run. C's actual native coordinator orders dispatch handoff versus Stop. A capability accepted before Stop remains in the census; Stop-before-transfer prevents the effect. Every unacknowledged member needs original role-owner acceptance/disposition or stays unresolved. This aggregate cannot prove no handoff from absent ack, create an owner binding retrospectively, rerun an operation, or transfer an unknown effect to a cancellation custodian. Stop and replan generation cannot be cleared or advanced to hide work.

#### Original complete native enrollment

The enrollment boundary is the genuine native allocator's first allocation/admission of the complete LaunchIdentityReservation, before the first operation or capability release owned by that reserved RunScope. It is not Workflow activation.begin. The known original reservation has all nine exact fields: project_id, goal_id, goal_run_id, plan_compile_run_id, activation_id, idempotency_key, original_goal_body, execution_owner_ref and execution_owner_epoch. The complete SourceSelector and exact nonnegative owner epoch retain their original native grammar. IDs are reserved, not an issued GoalRun, Workflow, WorkNode, attempt, dispatch, launch receipt or proof of admission. No source is retroactively manufactured for an already active reserved run.

`owner.workflow.launch.reserve_execution_identity.v1` is a precise integration inside the authentic existing native allocation operation, not a public allocator service or a route to create a Goal from Plan Build. Its private admission resolves the entire original native parent compile/controller state and pending allocation operation, actual original project and Goal binding, current complete original Goal body B0, BodyControlV2, StopControl and permission, actual native allocator/root/boot identity, and native ID namespace under its genuine exclusion. These are whole native owner objects through registered owner resolvers, not caller-selected JSON projections or reference-string attestations. Their actual native source contracts and original host handles must exist. The `NativeAllocationIdentity` is allocated by that owner from its real project/Goal/compile/idempotency/pending-operation identity before the reserved IDs are issued. Missing actual Goal B0 makes this Goal-bound profile unavailable; Plan Build does not create one. No current GoalRun or Workflow body is required at this boundary, and no future published NativeCompileSource is an input.

The allocator reads actual native namespace absence or the same pending original operation while holding the namespace, parent-controller, Goal/Stop/permission and domain-installation fences. Absence is a real native no-row result, never a synthetic zero control. It allocates the full genuine reservation once, binds RunScope's exact storage_instance_id/project_id/goal_id/goal_run_id, serializes ReservationAllocation then DomainBirth referencing that already-serialized allocation, then its Origin and AggregateHead in one recoverable original durable unit. Origin hashes both already-issued physical wrappers; neither hashes a future origin, native compile source or Workflow. Only after that original unit is durable may the owner release the first reserved-run capability. An existing identical original allocation with its authentic original custody is recovered/read unchanged. An existing reservation whose earlier work lacks enrollment is unavailable; a later same-ID wrapper cannot cure it. Failed/pending allocation never mints replacement IDs, releases work, or acquires a fabricated successful origin. Across stores an actual native coordinator and its recoverable pending transaction are mandatory.

True pre-Goal parent compiler operations remain in their actual native owner scope only when the real native ownership/operation record establishes that boundary. A caller label, absent Workflow ID, future timestamp or missing dispatch does not place an already reserved-run operation outside RunScope. If assignment occurs earlier than the owner can authentically enroll, this profile cannot qualify. Native original operation history must establish that allocation is the first reserved-run assignment and that every later scoped producer, obligation and effect passes the gates; a timestamp or native_original_enrollment_ref string is not proof.

Native compiler, graph/intake/preflight, Models, provisioning, decision and Workflow participants are enrolled at allocation before their first actual scoped operation. Each selected original owner entrypoint must have a registered exact complete source contract, original full input/result custody, and a mandatory native gate that distinguishes its actual metadata/read operation from every possible external effect. Product metadata custody may use `product_metadata_custody` only when the authentic installed native owner contract, complete actual original inputs/results and exhaustive native operation/capability history establish that the operation stays within its existing metadata/read authority. A role name, `inputs=[]`, semantic capture, noEffect claim, schema-valid result or final empty dispatch list cannot establish this. This is not a generic adapter for arbitrary metadata writers. Unsupported or uninspectable entrypoints make the entire native-domain qualification unavailable. The mechanism is required original native source authority; it cannot be satisfied by a helper asserting the reference strings below.

Every actual reserved-run external-effect handoff before a legitimate original C attempt/admission is available requires an immutable PreAttemptEffectAdmission before release under the allocator/domain capability fence. It retains the complete RunScope, original allocation, authentic native owner/role/operation identity, full original input binding and contract, capability, original boundary, contiguous zero-based ordinal and previous original admission. It creates no WorkNode, attempt or dispatch. Compiler artifact writes, actual tests, SCM/worktree operations, processes, tool/provider/network calls, verification and safe-point writes all take this route when scoped to the reservation. Actual accepted, rejected, never-released, pending, failed, terminal and outcome-unknown members remain in the complete append-only history. No later attempt replaces or hides them. PreAttemptEffectCurrent privately reads the entire authentic native original input/result/acceptance/current custody through that registered source, as well as its full admission and origin. The compact resolver ref is not an outcome proof. This narrow profile supplies no positive pre-attempt effect disposition adapter: every present admission is unsupported, even if an original owner later reports completion. An unadmitted effect makes census qualification unavailable rather than zero.

AggregateHead and every DomainCut retain the entire ordered pre_attempt_effect_admissions list. AggregateInput and CurrentBoundary read the corresponding complete PreAttemptEffectCurrent list, exactly equal to the original chain, every relevant original Origin issue and exhaustive native operation/handoff history. A genuinely zero list can qualify only after authentic native allocation enrollment, complete existing owner operation/input/result custody, full capability inheritance and current closed gates prove no such handoff occurred or can occur. This does not infer emptiness from any A3/A4 semantic or captured input schema. Product metadata writes remain admitted through their actual native custody and event/obligation gates; any operation outside that proven scope must take the effect route or remain unavailable. Original permissions and product sandbox policy remain unchanged.

##### Later immutable joins, with no future-record prerequisite

During the real `owner.workflow.compile.issue_native.v1`, read the entire original NativeCompileSource candidate and native compiler inputs, original allocation and current native allocator head, Goal/Stop/permission and source controls at that owner's final fence. Compare every byte-domain value in `launch_identity_reservation` to the original complete allocation reservation, plus full project/compile/run/owner/idempotency identities. After authentic issuance of NativeCompileSource and its OwnerIssueOrigin, issue CompileReservationJoin and its aggregate Origin/head update within the same recoverable native publication boundary. The join selects those already-issued originals; it does not cause their creation or relabel a compile operation. All native original source publication-time whole-input requirements remain mandatory. ReservationLineage later reads the entire immutable selected NativeCompileSource, original OwnerIssueOrigin and authentic current NativeSourceControl; an incompatible current source or broken original lineage is unavailable.

During the genuine C Workflow-birth operation, independently authenticate that original compile join/allocation and full original native birth inputs/candidate using corrected D01. Once authentic C WorkflowBirth and WorkflowMutationOrigin are issued, issue WorkflowReservationJoin selecting them and the prior compile join/allocation, then aggregate Origin/head in the same recoverable native owner boundary. Full scope, reservation, source identity, Workflow candidate and native parent causation must join exactly, without replacing IDs or substituting a string assertion. This is a companion original source issue, not a new Workflow writer or a change to the original C physical registrations. If the owner cannot execute that coordinated original publication, the join is unavailable. Neither earlier allocation nor compile join reads a future Workflow; neither C birth nor aggregate Origin hashes a future D06 result.

ReservationLineage authenticates both immutable joins and their complete original Origins, current AllocationCurrent and the complete C current Workflow birth/head/update sources already required by CorrectedCurrentSource. The nine-field historical original_goal_body selector stays unchanged. Full B0 is read at the authentic original allocation/compile/birth admission where required; subsequent current reads authenticate its original issue commitment through those immutable original operations and read the present whole Goal body/control B1 through the current Goal witness. They do not demand overwritten B0 bytes or archive a historical full body. The same rule preserves corrected D01's immutable birth commitment/current whole Workflow behavior. A source helper never reconstructs an old original body from a digest.

WriterRegistration is the entire compact native registration value, issued by the actual installation/registration owner and bound to its native entrypoint, pre-effect gate, principal, original registration operation, parent and exact source contract digest. Original registration occurs before the writer can obtain capability. A writer added later requires an authentic newly issued registration in the original domain-cut transaction before any release. Retired registrations remain in current membership. `component_kind=other` is retained and prevents admission unless a future exact source profile supplies it. Real registration, permissions, codec/storage/retention/backup and current owner lease sources are privately resolved whole. Merely carrying their reference strings cannot pass qualification.

The original native gate issues CapabilityBirth before an actual scoped capability is released. This includes delayed wakes, watchdog/retry/resume timers, capacity/admission, handoffs, Workflow/attempt mutations, FileSafe writers, process/output producers, normalizers, event append, checkpoint writers, external callbacks, subscriptions and reconnects. Parent capabilities and every inheriting holder belong to the native membership source. Dispatch-handoff/FileSafe/process capabilities must bind their exact original invocation; root scheduler/Workflow/attempt/queue capabilities must bind the authentic complete native owner domain and all affected census members. Null invocation never means an unowned effect. Each real change writes an immutable CapabilityDisposition and source origin. The current DomainCut reads all original births and latest authentic dispositions, not a caller list of known live workers. Dispositions are original owner results, not commands to revoke. At the final cut all selected-run mutation capabilities must be authentically revoked; in-flight callbacks must be completed/fenced so they cannot produce a fresh state mutation, event or effect after the cut.

The capability census distinguishes scoped ongoing-work capabilities from the native service authority to complete the already-authenticated root cancellation command. It enumerates the terminal writer registration as part of complete installation, but does not manufacture or revoke a future D06 command capability. Ordinary Workflow/attempt callbacks are scoped work capabilities and are revoked. The separate original Goal/D06 terminal owner can later consume this result only through its existing authenticated root command, exact current admission and own source protocol; it cannot dispatch work, revive a revoked capability or append arbitrary late producer output. An implementation that cannot enforce that separation remains unavailable. This is a boundary of the existing original owner authority, not permission for a generic post-cut writer.

The global Storage service keeps its own actual append/maintenance/metadata-commit authority for other scopes. This aggregate revokes only the selected-run producing/admission capabilities and drains already-admitted data using the actual owner's restricted internal drain authority. Publishing this compact settlement uses a preexisting original coordinator custody transaction; it does not reopen a run capability. D06 later uses its distinct original terminal-publication boundary. No global writer, DB lock, application process or unrelated user's session is revoked by this profile.

ObligationBirth is issued by the actual responsible owner when an existing requirement becomes due, before an effect/transition can outrun it. The complete obligation registry covers context checkpoints, required flushes and effect settlements, not a filtered list of successfully completed obligations. DomainBirth establishes the complete actual native initial registry at reservation allocation. Any obligation already arising with allocation is enrolled atomically; an empty list is allowed only when the original native owner establishes genuinely no due obligation. No already-existing requirement is reset. Every new requirement is appended at a monotonically allocated sequence and remains visible. The required final normalized-event/seglog flush is enrolled in the original Stop/aggregate admission; it occurs even when dispatch and event counts are truly zero. Process before-force and final flush obligations join the process owner's real stage records. All remaining obligations stay typed unresolved. A schema enum does not create a product obligation or make an existing one optional.

This bounded positive profile does not admit top-level external_callback, subscription, reconnect or other capability kinds even when a disposition says revoked. Their actual owners must supply a future exact original profile; any such member stays unsupported. Internal process writer/callback capability custody remains fully required within Process v1 and cannot hide external operations. Original enrollment qualification must establish that no mutation-capable escape path can bypass these original gates and that the registry is exhaustive for the selected run's capability domain. The actual owner source/installation must exist; this contract supplies its required original carrier and protocol, not native runtime proof. If the mechanism cannot authenticate complete membership, fence inheritance or enumerate a callback/effect source, return native_domain_unavailable. Observing no current PID, no queue item or no known capability is insufficient. FileSafe/process original native qualification remains independently required.

#### Complete partition and obligations

At `observe_stopped_domain`, take the actual current C Stop and immutable inventory cut while holding its original dispatch fence and all participating owner fences. Capture the native DomainCut and full sources. `partition.filesafe` covers exactly one complete invocation per FileSafe assessment. `partition.process_groups` covers a nonempty explicit set per genuine probe; the set must equal the complete original ProcessBirth/member_dispatch_sources set of that probe, including root and descendants. Every member has its own complete C invocation/admission/origin and authentic original process owner admission. Group sets and FileSafe sets are pairwise disjoint and their union must equal the entire C inventory dispatch identity set, byte-for-byte on the complete invocation. A shared probe source may not cover another run, generation, owner or outside beneficiary.

Any member that cannot pass its complete selected assessment appears exactly once in unsupported or unknown_or_pending rather than being dropped. These diagnostic partitions can be partial only when enumeration itself is unavailable, in which case no positive result is possible. Native capabilities/obligations outside dispatch membership are likewise retained and prevent success. Do not infer complete external-effect coverage merely because every role tag is filesafe or process; the actual native effect/callback domain must connect every scoped effect to its exact admitted owner. Any opaque/untracked effect makes that qualification unavailable.

Read each FileSafe assessment's whole current original journal, binding, original safe point and permission, authentic first terminal resolution origin, allowed later link-writer chain, current head and all actual writer capabilities as required by FileSafe v2. Original committed clean/skipped or authentically rolled-back failure can resolve that invocation; a recovery fence, failed unknown restore or pending reconciliation cannot. Journal terminal-core custody is historical issue commitment semantics, not a promise to fetch overwritten same-key journal bytes.

Read each Process assessment's entire ProbeBirth, each process birth, admission/origin, actual containment/member/current MCP lifecycle, original shutdown, native waits/signals, both stream finalizers, required-flush records and whole original current event readbacks. All original members must be terminal-waited; producer descriptors and callbacks revoked; both parsers finalized; all required original flushes durable. The process group's actual original three-second grace and sticky flush-failure rules remain unchanged. Outer process success cannot discharge an uncovered provider/tool/network/worktree operation.

All actual required obligations are matched once to their genuine source: effect_settlement to the exact covered owner assessment, process_preforce_flush/process_final_flush to that exact process record and stage, and final_normalized_event_flush to the distinct aggregate final flush. Cardinality and trigger/source/owner joins are checked against the full original obligation registry. No unknown or checkpoint obligation is allowed in SupportedInput. There must be exactly one original aggregate final-flush obligation for this aggregate operation. A process final flush can precede later core events and does not replace the aggregate final flush.

#### Original core event admission and mandatory final flush

CoreEventAdmission is compact original producer/normalizer custody, issued before the actual event is released into the selected-run queue. It is not a fake event, raw payload archive or process byte normalizer replacement. It binds actual original event ID/type/schema/semantic identity, original event source, queue generation and exact zero-based ordinal. Every selected-run normalized/event producer, including activation/Executor/FileSafe observations, must be enrolled from original domain birth. Process stream event admissions retain the complete Process v1 source chain; any queue items transferred to the core route must preserve their real original admission identity and be counted exactly once, not generate new events or receipts. Unsupported queue routes stay unavailable.

Before the final aggregate cut, first block new work/effect admissions through original Stop, finish the supported per-owner reconciliation, finalize producers and drain all already-admitted data. The actual queue/normalizer owner captures each CoreWriterCut under its native queue fence with the complete original admission chain, current membership and exact admitted/drained/remaining/in-flight counts. Start is ordinal zero; no gaps, duplicates, omitted payload types or matching-run maximum. Original truly zero admissions requires the genuine original birth/gate plus sealed current native empty queue. A no-dispatch run may still have many actual Workflow/Executor events and must flush all of them. If an original buffered event or partial normalization was lost before authentic durable admission/result, it is loss/unknown and cannot become zero.

All selected-run producers must be sealed, normalizers finished and queues drained. The original Storage owner executes its real required final durability boundary: writes complete actual source frames, synchronizes required selected segments, promotes the actual manifest watermark, performs required parent-directory sync and durably commits the original first-receipt custody. Complete global CURRENT/manifest and actual source read tokens remain required, including commits containing other scopes. No sequence-zero cursor, fake flush marker or synthetic append receipt is minted. A truly empty event set still performs the original required Storage boundary against authentic current controls; absence is not skip permission.

FinalFlushRecord persists only compact commitments, original boundary identity and truthful outcome. FinalFlushReadback privately resolves complete original EventRecord values, original whole first-append custody/full_value_result, current source frame/read token and whole current Storage controls from their existing owners. Full payload schema validation follows the original event registry. A receipt-shaped object or metadata commitment cannot replace an extant current full original event value on this first aggregate admission. Historical receipt manifest generation need not equal current selected manifest generation; authenticated current translation/compaction rules remain original Storage-owned. Retention, permissions, deletion, holds, recovery/backup and full current source availability are required. No additional event/body/log archive is installed by these records.

Flush operations bind the exact complete writer cut and every admitted item once. Successful record/event commitment/custody fields must match current full readbacks and the originally executed native Storage result; no helper selected fields substitute for the whole original. The actual AggregateHead retains an append-only selection for every originally attempted aggregate required flush. Required_final_flush_history reads the complete immutable record and origin for each selection; the list must also equal every required-flush issue in the complete original origin chain and authentic native Storage operation history. An unresolved original flush operation cannot disappear merely because it never durably issued a success or failure record. The selected final readback is the actual terminal member; older failures are not filtered. Any required flush failure, including a process pre-force flush that later retries successfully, is sticky `done.crashed`. Record authentic structured diagnostic persistence as durable/pending/unavailable. If the diagnostic itself cannot persist, do not claim it emitted. Unknown durability remains unresolved. User/parent cancellation whose complete required flushes are durable retains `done.cancelled` even when the genuine process teardown required force.

After successful final flush, revoke all remaining selected-run drain-producing capabilities and capture the final DomainCut under the same authentic coordinator exclusion. There can be no queued callback, held writer, late FileSafe observation or normalization after that final cut capable of admitting a further event; if one exists, drain/fence it in the real owner before a new original final-flush operation and do not reuse a stale successful cut. A preceding authenticated required-flush failure remains sticky. The aggregate result itself is compact non-event custody; subsequent D06 event/status publication is its own required original durability boundary.

#### Original result, physical storage and current read

Only the genuine original Executor aggregate owner may issue AggregateResult. The public Request contains only scope, operation ID and expected actual Executor owner. Callers cannot select census, obligations, outcomes, empty membership, writer cuts or settlements. A pure helper may prepare bytes but never confer source authority. The original owner reads the complete SupportedInput and performs the complete semantic/physical comparisons at its final held native boundary before committing the original result, origin and head CAS. All originals, selectors, current revisions, native owners/epochs, Stop, permissions and source custody are compared again after every helper/copy/decode/hash operation. No mutable gap or helper follows that final comparison.

A positive result requires authentic original reservation enrollment, both complete immutable reservation joins, a genuinely zero native pre-attempt external-effect census, and both a supported exact invocation partition and a quiescent complete native capability/obligation domain, mandatory durable final flush and no sticky failure/recovery condition. Its settlements contain compact original role-result and authenticating-origin selections per complete invocation. For FileSafe, original_result selects the immutable first original terminal resolution origin itself, whose issued journal commitment and terminal core bind the original result; it never promises an old full journal body at the mutable journal key. original_origin selects that same genuine immutable resolution origin, not an invented second envelope. Current full journal and permitted link changes are verified using FileSafe v2. For Process, original_result selects its immutable ProcessShutdownResult and original_origin its genuine original write origin. These are explicit different original custody forms; no generic selector-shaped adaptation makes a mutable journal immutable. Genuinely zero invocations yields genuinely zero settlements only after all those other full original prerequisites pass. The result supplies the selected whole-run D05 source profile; it grants no effect, retry, restore, cleanup, Workflow terminal status or Goal terminal authority. The separate positive D06 source binds exact root scope/operation/Goal Stop/SchedulerStop/inventory and consumes this complete original result/current readback. It preserves the historical false profiles; its actual v3 event publication remains unavailable until its separate event-consumer/registry route is adopted.

SuccessfulReadback.source_readback is a private fresh read of complete current originals plus immutable original operation custody, not a persisted copy of the first admission inputs. In particular it reads the present whole Workflow body/control through corrected D01, and authenticates actual allowed original transitions. It does not require overwritten initial Workflow values, old mutable permissions, or a historical same-key journal. Full original event values remain current reads from their existing retained source as specified above.

`read_original_safe_stop` reads the exact original immutable result and origin at the original operation key plus current full boundary and re-evaluates all required original role/current sources and immutable inventory equality at one coherent held cut. Later authenticated metadata-only links or Workflow changes must use their exact allowed original lineage; they cannot reopen work capability. An old positive record alone is not a perpetual current permission or source-availability token. Required native registration/source/permission/retention/hold/backup/deletion refs in CurrentBoundary are private whole-source resolver inputs, never trust booleans. If the current native boundary or full source is unavailable, return that rather than pretending a stale result is current. The final current read authenticates the actual head and original result/origin; replay issues no new time, origin, queue admission, stop, dispatch or event.

#### Failure and recovery

Unknown, unsupported and pending effects stay with their actual owners. An original AggregateResult may record unresolved or required-flush-failed disposition when that truthful record can be committed; no positive result is returned. If source/diagnostic persistence also fails, the native pending operation remains fenced and read returns unavailable with actual prior effect posture. The aggregate never declares noEffect, rolls an operation forward because a caller retries, releases an unknown worktree or converts a failed reconciliation into cancellation success.

Same-operation recovery consults the authentic original coordinator transaction. If its immutable result/origin/head already committed, read them unchanged under current original custody. If the transaction is pending, recover the genuine commit through its actual owner protocol or remain pending; no synthetic original transaction/result is issued. A crash with unfinished runtime lacking canonical terminal done follows Run Modes: `done.crashed` with `stop_reason=crash_recovered`. Reclaiming a process, finding no PID, restoring a DB or later flushing surviving events cannot manufacture an earlier clean cancellation. Even an authenticated aggregate record does not override a subsequent authentic unfinished-no-terminal crash disposition. SuccessfulReadback allows a recovery record only for `read_authenticated_original_result` with preserve_original outcome/stop_reason and currently valid source/capability custody.

Native capability/root identity includes its authentic owner epoch, original root generation, host boot and retained original object/handle. Current similarly named processes/paths cannot reattach identity. A genuine recovered source may restore compact rows through mandatory verified backup, but current native boundary must still be authenticated. Final application DB closure/lock release belongs to the application shutdown owner; this scoped aggregate does not shut down the global service.

#### Current complete source realms and original phase admission

The aggregate uses all 67 definitions of `Plans/executor_cancellation_contracts/schemas/safestop-original-start.v1.schema.json`, with complete current D01 CurrentSource/StopSource, complete 85-definition native source and complete 82-definition A4 source. No old A3 compile/materialization becomes current by changing a URI, selector or installed-contract label. All sixteen D05 stored v2 grammars, keys, codecs and original methods remain exact. Existing C2/C3 and role/native/Goal/Storage physical values retain their own whole original registrations; distinct current source resources do not alias historical IDs. V1 D05 rows cannot be rewritten, cast, relabeled or rehashed into v2, and an earlier v1 DomainBirth cannot satisfy original allocation enrollment.

#### Separate exact argument realms

`current_d05_source` validates the whole current aggregate source and every referenced value it consumes. `current_goal_control` validates the separate complete original Goal arguments. `retained_original_d05` retains the entire original D05/FileSafe2/Process/C/native graph. `filesafe_injective_owner` selects the entire distinct FileSafe k1 source with that original dependency graph for authentic new-profile FileSafe owner operations. Process retains its exact original owner realm. Old FileSafe2 remains historical source lineage and cannot authorize a k1 operation. The complete canonical realm-entry map enumerates all 67 current aggregate definition roots, the whole selected current C source, all nine comparison-only role value roots, and the complete separate FileSafe/Process operation realms. Those root/type boundaries are mandatory native route checks; unused historical definitions in a copied C2/native document are not callable current routes. There is no generic schema dispatcher or caller-selected realm. There is no network fallback, cross-realm fallback or merged same-ID registry. Original `$id`, retrieval base and embedded-resource scope remain intact in the canonical whole-resource maps. Complete current source and original role-owner resources retain their exact independently bound values.

Two same-ID conflicts remain deliberate: historical versus current handoff, and historical versus current Goal cancellation custody. The three excluded historical handoff aliases stay in the retained realm. All nine FileSafe/Process definition roots actually consumed by this aggregate compare recursively equal both to their original logical value grammars and to their actual selected complete role-owner source routes. For FileSafe the selected owner route is the distinct k1 source; for Process it remains the original source. This licenses only those exact value comparisons. The independent original FileSafe/Process operation still validates its full original source/candidate/read contract in its selected original-owner realm, with original native authority and, for FileSafe, authentic original k1 installation. Unused historical definitions in a copied schema are not silently adopted as current owner operations. Each current source route admits all 67 D05 definitions and their full reachable values, the entire selected current C graph at its original bases, and its separate complete Goal or role-owner contract as applicable.

The new private current-Goal argument resource contains four complete contracts:

- `OriginalLaunchGoalRead` references the whole canonical association ActualGoalBefore: actual full B0 body/control, accepted objective/origin, host Stop, binding revision/origin/control and writer domain/head. It is used at genuine initial launch identity allocation and original native compile issuance. Its name does not authorize a beforeimage phase or manufactured absence.
- `OriginalWorkflowBirthGoalArgument` references the whole canonical BindingLowerArgument at the actual original T1 joint Workflow birth/Goal metadata/association publication.
- `CurrentAssociatedGoalArgument` references the whole canonical CurrentAssociatedGoalRead at the actual permitted post-association pre-Stop source boundary. Its original B1 and compact original association custody rules remain unchanged; it cannot be used to widen a later Workflow writer.
- `CurrentGoalStopArgument` contains the entire unchanged D06 current-controls argument, complete current StorageStopControl and StorageWriterDomainHead, original complete StopIntent, and complete StorageStopReceipt and StorageSourceAudit outer values from the actual current Goal cancellation owner. The D06 argument is a source/control read type; it does not require a D06 disposition, future Workflow event or Goal terminal.

Every generic phase-routed method has an explicit `actual_original_t1` route to the entire OriginalWorkflowBirthGoalArgument. This is available only if its complete original owner contract independently permits that method inside the actual original T1; otherwise the method is unavailable in T1. The route grants no new writer or phase authority. The original owner determines the real lifecycle and admits the correct entire argument. No serialized discriminator, enum, object shape, method name or caller can select a phase. Missing whole source, source authority, lifecycle hook or final native fence makes the route unavailable.

#### Original launch allocation and later immutable joins

The first-enrollment rule remains before the first reserved RunScope capability release at the actual native identity allocation. Independently authenticate the full real native parent operation/input/result contract, native namespace/root/host owner and boot identity, actual pending allocation or authenticated absence, complete OriginalLaunchGoalRead and actual permissions. The new nine-field reservation, ReservationAllocation, DomainBirth, Origin and head are prepared and published under that real original recoverable boundary before release. No future NativeCompileSource, Workflow, materialization or StopReceipt is required there.

The D05 identity allocation is not silently identified with GRS-077's later binding-control T0 reservation. T0 is the original existing binding owner operation needed before T1 and has its own complete before/candidate/CAS contract. Neither its future prepared values nor a future BindingOrigin authorize initial D05 allocation. If an implementation uses one genuine combined boundary, all actual original participants and ordering must independently satisfy both entire contracts; equality of names or IDs does not establish that. Earlier native pre-Goal work remains in its authentic native parent scope. Missing Workflow or binding cannot relabel an already reserved run as pre-Goal.

At the actual original `owner.workflow.compile.issue_native.v1` publication, read the entire A4 NativeCompileSource, complete original compile input and real durable/source/origin custody, actual NativeSourceControl and original OwnerIssueOrigin. Match all nine reservation fields to the authentic allocation and original B0 selector. The complete original Goal read is B0 at this actual boundary, with current original control/Stop/permission; it is not reconstructed later. The immutable CompileReservationJoin, its original Origin and head join that exact original publication. This helper never issues the native compile source itself. The compile-join observer receives NativeCompileSource and OwnerIssueOrigin only after their genuine original issuance within the same still-held original joint transaction. They are not future output prerequisites of the lower native compile issuer. The original issuer first authenticates its complete actual original inputs and derives its own whole source/origin candidates; the observer then authenticates the genuine co-issued values and its own complete join candidate before the final original joint commit/readback. No post-commit enrollment or invented already-persisted source is admitted. All seven current input-role contracts remain complete at the lifecycle point where each is actually required; a future RequiredSet or materialization is not introduced as a compile prerequisite.

At actual T1, current C's entire OriginalBirthArgument and the separate entire OriginalWorkflowBirthGoalArgument apply. Original Workflow body/control/decision/origins equal the actual complete association/activation participants. The WorkflowReservationJoin selects the exact genuine D01 birth and WorkflowMutationOrigin and original allocation/compile join under the same original recoverable publication. Full pending candidates are not falsely required to be previously persisted rows. C enrollment is an observer of original birth, not a second issuer. Canonical T0 genuine binding pending, complete B0 preimage/B1 metadata afterimage, original common transaction union and whole owner CAS/final checks remain mandatory.

At T2, current C's entire first-coverage and Workflow materialization arguments, canonical current materialization source and separately current Goal guard/association argument apply. They include every native WorkNode/control/result/origin, shared run control/result/origin and all A4 born/materialization/graph/RequiredSet/body/control/transition participants. A representative node, old witness or empty invocation count cannot replace that union. The D05 map adds no authority to execute T2 or later dependency-only native operations.

Every actual reserved pre-attempt external-effect admission remains recorded before release. Accepted, rejected, pending, failed, never-released, terminal and unknown members remain in complete original order and native history. Every present admission is unsupported by this positive D05 profile. `product_metadata_custody` still requires the complete original native operation/input/result/history and capability proof. A label, empty array or current schema-valid result is not zero-effect evidence. Old domains lacking original current-source enrollment cannot be backfilled or migrated by this adoption.

#### Exact current Goal, audit and native joins

These joins apply to AggregateInput.goal_stop and CurrentBoundary.current_goal_stop at every directly callable current source reader, preparation, publication, recovery or replay boundary that uses them. The separate CurrentGoalStopArgument is mandatory at that same held original native boundary, including the final pure predicate after all returning helpers. Its members are actual complete original owner values, not copies asserted current by the caller.

1. The complete native GoalControlWitness.body and .control equal `current_controls.goal_body` and `.goal_control`. Its `.stop` equals `current_stop_control.record`; its thread/project/Goal identity and actual original body/control/Stop physical selectors resolve those same full native originals. Its `.goal_run_body` and `.goal_run_control` equal current_executor.workflow.current_body/current_control. Authenticate whole original outer wrappers and their exact native selectors independently, even where the semantic values compare equal.
2. `current_controls.binding` is the entire genuine original BindingReadCurrent; `.association` equals its actual single original Workflow association. Verify full current revision/control/origin, writer domain and current_writer_domain_head under the original binding owner, including exact domain/head membership, epochs and source commitments. The native complete Goal/run, D05 allocation, compile reservation and Workflow birth all select that same original association, execution owner/epoch and reserved run. Current body.active_run_ref and actual binding selection must agree. The genuine selection is `workflow_requires_owner_disposition` with association_count=1; `bound_plan_requires_owner_settlement`, `no_execution_association`, foreign or missing association cannot substitute. The original ExecutionBinding discriminator still uses its exact existing `no_bound_plan` arm for a Workflow and preserves its actual nonnull active_run_ref and execution owner/source; no new Workflow enum or bound-Plan coercion is introduced.
3. GoalStopSources.original_stop_intent equals the entire `original_stop_intent`. GoalStopSources.original_stop_receipt equals `original_stop_receipt.record`, which also equals `current_controls.goal_stop`. The existing original_stop_receipt_selection resolves that exact genuine full StorageStopReceipt outer value. No receipt is reissued here.
4. The existing original_source_audit_selection resolves the entire separate `original_source_audit` StorageSourceAudit outer value. Its record is validated only in the current Goal realm. Both StopIntent.source_audit_sha256 and StopReceipt.source_audit_sha256 equal SHA-256 of the actual complete original outer StorageSourceAudit bytes under the existing local Goal codec. Verify its complete request, normalized identity, original acceptance/dispatch/outcome authority and historical original body/execution binding. Equal request IDs or selectors alone do not establish original acceptance.
5. StopReceipt.stop_intent_sha256 uses the unchanged exact recipe: SHA-256 of UTF-8 `pm.goal.cancel.stop_intent.v1`, one actual LF, and the local canonical JSON of the entire StopIntent. It is not the StopIntent wrapper hash, semantic JCS or D05 MessagePack. The source audit's before-Stop commitment and captured epochs equal the original StopIntent's actual before values; genuine receipt after epochs and current host Stop lineage remain authenticated. Current epochs may later advance only through original permitted custody; they are never reset to the old receipt's after values to manufacture currentness.
6. Full audit normalized operation identity, StopIntent.operation_id and StopReceipt.operation_id agree with the authentic original root cancellation. Receipt.original_host_transaction_ref and original accepted cancellation/owner epochs are verified through their actual owners. Native cancel result/origin and SchedulerStop/inventory are genuine original distinct sources with exact root-operation/scope/generation joins. Per-role shutdown, restore, drain, append and aggregate operation IDs retain their own genuine original identities; they are not overwritten with the root cancellation ID.
7. Audit.original_execution_binding and StopIntent.original_execution_binding equal the original binding accepted for this same run and join current binding through its immutable original association/transition custody. Their historical original_body revision/hash remains historical. Later current Goal body/control must be fully read under current authority, not forced equal to vanished B0, B1 or the captured audit body. Deletion or unavailable current controls makes this current D05 route unavailable; it does not recreate them or grant a new indefinite body hold.

The two realm arguments are independently authenticated and compared as full real original values. D05's original native witness does not grant current Goal authority. Current Goal cancellation custody does not grant native Executor/Workflow authority. The same actual original operation, full scopes, permission/current owner, native registration, deletion/hold/backup epoch and no-gap final fence must hold across both.

#### Physical preservation and retained safeguards

All sixteen D05 physical family declarations, schema IDs/versions, codecs, keys, source-origin fields and complete recursively referenced value grammars remain unchanged. The entire recursively referenced stored value grammar is preserved; its unchanged shape is not native authority. The transient current Goal argument is not a durable family or new request/event field. An actual original installed contract digest must identify this exact selected source integration from the genuine initial allocation; an existing stored v2 wrapper cannot acquire current A4/Goal coverage by reinterpretation. Original physical declarations retain their complete historical value grammar. The fixed family map explicitly selects the recursively equal current source route for the sixteen aggregate values; that value route does not replace the original native method contract or admit an original role-owner operation through the current aggregate realm.

The new FileSafe source profile is mandatory for any represented FileSafe operation. The complete FileSafe key and owner contract is stated in these FileSafe and Storage sections. Its three metadata prefixes are `executor_filesafe_invocation_binding.v2.k1:`, `executor_filesafe_journal_head.v2.k1:` and `executor_filesafe_journal_origin.v2.k1:`. Every identifier component is K = lowercase hex of its exact valid UTF-8 bytes, preserving colon, case and Unicode scalar sequence without normalization or domain narrowing. Fixed-arity separators remain literal colon; the final journal-origin revision uses canonical positive decimal N. The original safe-point, permission and restore-journal keys/codecs remain unchanged.

Actual FileSafe/Storage authority must have installed `filesafe_original_injective_keys.v1` before the represented original binding admission/preparation and before mutation, with complete authentic original/current installation custody at every writer, acknowledgement, reconciliation, read/recovery, backup and deletion boundary. Original k1 physical keys must match the exact entire selected values and actual owner scope; the source/codec/retention/backup fields are resolved to full real native sources, not trusted as profile strings. No caller, aggregator or new registry map can rekey an old operation. Raw-v2, mixed-profile or missing-original-installation operations remain unsupported and remain in the complete D05 census; no migration, discovery-based backfill, rename or equal-value adoption is supplied. An already enrolled D05 domain cannot gain missing original capability coverage retrospectively.

The FileSafe stored schema IDs/versions and all complete value grammars remain v2. D05's unchanged physical `profile` literal mentioning `exact_filesafe_v2` denotes that original logical effect/value grammar; it does not waive this successor's mandatory k1 source/key provenance. The explicit new source URI and original native installed contract select the real profile. Whole-value equality is preservation evidence, never proof of original profile installation.

The whole FileSafe k1 source retains the exact original v2 restore-safe-point-then-retry effect role and complete logical value grammar, with its genuine resolved original effects and no post-Stop retry or broad filesystem equality claim. Process v1 remains the exact disposable, unshared local Unix stdio diagnostic role, with all original member admission, actual wait/signal/parser/drain/preforce/final-flush evidence. Neither can settle unrelated external effects. Whole original role readback, current C census membership and original dispatch/acceptance/owner/capability/origin joins remain separately required.

Current C materialization remains mandatory even for zero invocations. Census and partition cover all original invocation/attempt/retry/remediation/replan generations; unknown or unsupported effects stay unresolved. The original append-only pre-attempt history remains genuinely zero for positive admission. Every actual checkpoint obligation remains unresolved because RequiredCheckpointSuccess is literal false. Mandatory final normalized-event flush, including zero-event cases, authentic whole EventRecord/first append custody/current readback, fsync boundaries, native queue/writer census and append-only required-flush history remain unchanged. Any original required-flush failure stays sticky even after later success. Final run-producing capability revocation and no returning helper/callback after the final predicate remain mandatory.

Every directly callable issuer, lower writer, observer, helper, current reader, recovery reader and replay responder independently performs complete before-helper source/preimage/native-authority checks and candidate derivation. After all parsers, codecs, builders, validators and currentness helpers return, it rechecks the complete original source set, exact pending candidates/preserved transaction union and full current realm joins in one pure predicate before its own commit or release. The outer original publisher independently repeats the full union check. Later refusal preserves earlier real effects. A JSON schema instance, schema-ID route, hash comparison or source check alone is never that admission.

#### Actual original phases

Before original Workflow birth, authentic native allocation and compile require their complete original owner inputs and full OriginalLaunchGoalRead. No Workflow, StartControl or future activation result is demanded. Original allocation still precedes first reserved-run capability release. The compile observer still receives genuine NativeCompileSource and OwnerIssueOrigin only after their co-issuance within the same held original publication.

At actual T1, consume the whole original native birth argument, separate BindingLowerArgument and actual joint Goal/native candidates. The complete BirthStartOutput is a co-issued output: full zero-epoch StartControl and genuine A4 begin OwnerIssueOrigin produced by that same original begin operation. It is not a previously published prerequisite. D05's original WorkflowReservationJoin authenticates the already co-issued complete D01 birth/origin, native birth and start control/origin within the one unreleased native transaction. It neither creates these sources nor enrolls a preexisting run.

At materialization and subsequent genuine current boundaries, the complete selected start CurrentSourceArgument supplies authentic precoverage, prestart or original_started truth only where that actual original owner phase permits it. Precoverage does not invent a future inventory or coverage receipt. Every later post-materialization D05 stopped aggregate or current-read boundary requires the covered prestart or original_started arm, never precoverage. A covered prestart source can honestly describe a run stopped before original start; it proves no committed or pending start, not permission to begin one after Stop. The separate full actual stopped Goal/native controls still govern that operation. The no-effective-Stop guard on OriginalCommitArgument is specific to original start admission and is never imposed on a stopped NoStartSource read.

At the actual original start operation, any existing D05 metadata/capability/obligation/core-event observer that its complete original owner contract already admits in that phase receives the whole OriginalStartArgument in the native realm and whole OriginalGoalArgument in the separate Goal realm. These are true held prestart sources and complete privately derived candidates. They do not demand a future committed CurrentStartSource or first Storage receipt before its authentic assignment. OriginalD01StartPublicationArgument remains the original start owner's exact co-issue phase. D05 grants no new start writer, producer or observation authority. The actual start producer submission/event identity, occurred timestamp, full typed payload and all provenance fields are preserved by the original owner; no D05 metadata operation reconstructs or replaces them. Every actual selected-run core event, including original goal_run.started where admitted through the core route, retains its actual original admission and joins the final cut once. A D05 observer that cannot fit inside the genuine original held transaction remains unavailable, not a later backfill.

The five generic phase maps distinguish actual original prebirth, actual original T1 output, actual held original start and later full current source. These are private owner phase obligations, not a caller discriminator. A phase mapping supplies an argument only where the unchanged whole original method already admits that operation; otherwise no route exists. Two prebirth-only methods and the dedicated T1 method retain their exact narrower phases. All five stopped methods require complete current start source at every aggregate and current-boundary read, with the whole pairs explicitly typed by StoppedAggregateArgument and StoppedCurrentBoundaryArgument.

#### Complete current joins and final boundary

For each AggregateInput, SupportedInput or CurrentBoundary held by a stopped boundary, obtain a complete fresh CurrentStartArgument from its genuine original owner. Join its entire d01_current to the corresponding complete current_executor value, recursively including full Workflow current body/control, original D01 current lineage, every present WorkNode/control/result/origin, inventory, SchedulerControl and run control/result/origin. The same complete start value must apply to the corresponding source_readback and current_boundary participants in a successful read at that one held boundary; differing current native values are stale, not separate acceptable observations. Exact storage instance, project, Goal, Workflow GoalRun, actual owner/epoch, original allocation/compile/birth lineage, Stop and inventory joins remain mandatory. The separate full CurrentGoalStopArgument's native GoalRun witness must equal those same genuinely current Workflow body/control values. D05, D01, start and D06 operation IDs keep their distinct original owners; equality is required only where their actual original reference fields define it.

NoStartSource requires authentic initial control/origin, no pending start operation and no original committed start. CurrentStartSource requires authentic compact immutable original StartCommit/StartOrigin, authentic current StartControl and the whole current D01/native chain. Its original start after-image selection joins the actual original start link in that chain; a later admitted D06 native link may advance current Workflow body/control without changing that historical start commitment. Old outbox prepared/null/false fields remain exact historical preparation, never a current start or dispatch verdict. Missing original initialization, pending coordinator truth, unavailable current native values, mixed backup generation or stale origin fences mutation and positive current disclosure. Compact commitments never supply missing source bodies.

At every original reader and independently callable lower writer, authenticate the full actual source union, original native operation and installed profile, real owner/capability and registration generations, scope and identity, current Goal/Stop/binding, all whole native preimages and privately derived candidates, permissions, codec admission, holds/deletion/tombstones, backup/recovery and genuine source custody before returning helpers. After all reads, decodes, copies, hashes, codecs and builders, independently repeat the complete pure predicate over that same held union. No returning helper, callback, await, logger or mutable gap can follow it before publication or passive disclosure. A checked map or schema, old upper-layer check or comparison-only foreign value never grants native authority.

#### Original result, later D06 and event cut

SuccessfulReadback is transient. Its source_readback and current_boundary contain whole genuinely current D01/native/Goal sources, not archived original Workflow after-images. Original AggregateResult and its actual Origin remain compact immutable original custody, together with original settlement, reservation and append-only flush history. A later read must authenticate those originals and obtain fresh full current native sources. It does not make their historical issuance selections equal to today's mutable body bytes. The original source's actual retention, deletion and current-read requirements still apply; if unavailable, do not fabricate a full readback from the compact result.

The complete original DomainCut still revokes all scoped work, mutation, callback, producer, normalizer, admission and drain-producing capabilities. The native domain contract separately enumerates the native original terminal owner registration and distinguishes its existing authenticated root-cancellation service authority from scoped ongoing work. The distinct later D06 control-plane publication can use only that actual originally registered owner entrypoint, root command, source contract and private final fence. Its existence must be proved by the authentic installation/native operation, complete actual input/candidate/current source and original capability history; a role label, registration string or terminal-looking event cannot establish this separation. D05 imports no positive D06 consumer source or future disposition; the separate positive consumer imports this complete D05 source.

The original D05 final CoreWriterCut and FinalFlushRecord cover exactly the complete originally enrolled and sealed selected-run producer/normalizer queues and every originally admitted member. The later distinct original D06 control-plane append is outside those sealed producing routes and has its own authentic original first barrier and whole custody. It cannot re-open a sealed queue, mutate its original admission chain, reuse its producer capability, revise the original final flush, conceal a failed flush, or count a late ordinary event as terminal service output. All selected-run ordinary buffered output remains subject to the original complete D05 cut. If the installed native source cannot establish the distinct original terminal authority and closed-queue separation, the later D06 operation remains unavailable; no generic post-cut exception exists. This enforces the original terminal-owner boundary without a new source family or changed stored cut.

A later D06-linked current source may advance native Workflow status only through its genuine original D01/D06 lineage. D05 re-reads that current source against its original immutable aggregate, source lifetime and unchanged scoped-cut semantics. It does not need the old full Workflow body. Positive D06 original admission consumes this entire source binding and complete fresh D05 result/current readback before its own effect; after that effect its later readback must likewise use current sources and its own immutable original custody, not persist a stale D05 SuccessfulReadback.

All original final-flush requirements, empty-event native durability, whole EventRecord/first receipt/custody/read tokens, exact queue census, sticky failed-flush outcome and all original required-flush attempts remain mandatory. Checkpoint success remains literal false. Unsupported pre-attempt effects, unknown capabilities/obligations, pooled/shared processes, arbitrary callbacks and unsupported effect roles remain unresolved. Start itself does not imply a provider/tool attempt or Usage effect. D05 is not Workflow/Goal terminal publication, completion, certification, general status or replan authority.

Full original start PublicationResult exists only inside the actual held original invocation. Later full commit replay remains unsupported under the original start contract; current compact readback and existing original EventRecord reads retain their own full-source/lifetime rules. Neither D05 nor its original compact custody archives a start producer/native snapshot or resumes lost pending start context. This current source selection adds no physical family or retention extension. Actual installed descriptors, owner exclusion, native/seglog atomicity, durability/crash, recovery, integer codec and backup qualification remain NOT_RUN.

#### Original FileSafe effect resolution

The bounded `local_safe_point_exact_replace_v1` role covers only the original FileSafe invocation of `cmd.runtime.restore_safe_point_then_retry` with its exact nine canonical payload fields. It does not cover arbitrary writes, Git/provider effects or every invocation labelled FileSafe. Use the complete original source grammar and mandatory `filesafe_original_injective_keys.v1` installation. This role result alone is not whole-run D05 success.

#### Original ownership and admission

The actual Executor dispatch writer registers the entire DispatchInvocation in the dependency's whole-run InventoryHead before original dispatch. After C admit_dispatch and its MutationOrigin durably commit, the actual FileSafe owner accepts that genuine handoff under the shared current stop/capability fence, reserves its genuine restore_transaction_id and commits FileSafeInvocationBinding with original journal preparation before mutation. The binding identifies the existing command's original source, exact payload, execution host, source location, operation, transaction and owner epoch. It is immutable. The binding selects the already-committed C admission and origin; the dependency's original_input_capture selects the actual already-captured command input, never this later binding. C admit_dispatch MutationOrigin afterimages cover C/native dispatch rows issued by that transaction, not future FileSafe rows. The separate original FileSafe preparation origin authenticates this binding through its exact BindingSelector digest along with its issued journal commitment. The binding does not hash that FileSafe origin. C ack_handoff occurs after actual FileSafe acceptance and selects the already-issued acceptance/binding and FileSafe origin. That later C acknowledgement origin is not selected by the binding. This is an acyclic dependency order, not one cross-owner transaction. No retrospective binding is inferred from command names, timestamps, matching payloads or an existing journal.

The new metadata is necessary original-writer source instrumentation. It does not replace original command validation: allowed blocked episode, permission snapshot, FileSafe policy, repository/worktree identity, original idempotency and baseline ownership remain mandatory. Cancellation never calls restore_safe_point_then_retry, creates another restore, dispatches the retry or mints an attempt. It can observe an existing result or leave its already-authorized original reconciliation under its original owner. A serialized binding grants none of these actions.

#### Read operation and complete native boundary

The private FileSafe source owner receives FileSafeReadRequest for a currently enumerated genuine dispatch. It resolves the binding through the original admission, not through caller-provided paths or an arbitrary adapter. Inside the actual native FileSafe/storage ownership boundary it reads the whole binding, whole dependency admission and mutation origin, current head, whole current journal, current origin and first resolution origin if one exists, whole original safe point and original permission snapshot. It returns OriginalFileSafeSources only with the actual current native boundary captured in that operation.

The boundary's writer_members is the exhaustive native registry under the real mutation lease, including subprocess/delegated/reconciliation writers; it is not a caller-selected list. Empty is valid only where the owner proves empty membership. Native ownership, root generation, host, source location, permission and codec/retention/hold/backup/deletion registrations are acquired and revalidated before and after the read under the owner's actual lock/transaction. Those *_source_ref fields name full native sources held by that original operation; a detached string, cached disclosure or a schema-valid object does not satisfy a guard. There is no transportable authority token and no public API. If an actual owner cannot execute this boundary, report unavailable. Writers cannot regain a revoked mutation capability for this original resolved invocation. All late callbacks remain fenced by the original invocation/attempt/generation and dependency stop state.

#### Semantic acceptance, beyond schema validity

All duplicated identities must join exactly: current dependency scope and complete inventory member; binding's DispatchInvocation; actual admission and its MutationOrigin; command project/run/node/attempt/repo/worktree/safe_point; original safe-point tuple; original journal project/transaction and attempt identity; storage instance, host, source location and actual owner epochs. Every actual read selector resolves in its declared original family, decodes using the registered codec, validates against the complete schema and hashes its actual physical bytes. Historical journal issue commitments in origins are not current reads; no reader attempts to retrieve overwritten same-key bytes. Head revision, origin revision, origin issued_journal_commitment and current journal selector match at the current head. The complete immutable prior-origin chain reaches authenticated original preparation with no gap, fork or reader-written member. The original first-resolution origin is read from its immutable origin key. Its issued journal commitment remains historical; current full journal plus the original-owner terminal-core commitment and allowed link-only chain establish the original terminal truth as specified below.

Original FileSafe equality remains the owner algorithm in FileSafe 11.1.2b: full manifest/path coverage and exact bytes/metadata as specified, not Git cleanliness, mtime, process exit or a receipt assertion. The read operation does not redo equality, restore files or require reading archived raw payloads after an already-authenticated resolved original result. If original reconciliation still needs files/manifests/blobs, it must use its own complete original inputs, permissions and holds; missing material never becomes resolved.

A resolved disposition requires the authentic first terminal origin, exact terminal journal and current capability quiescence. committed/restored_clean joins commit_target with target_proven; committed/restore_skipped joins already_target_zero_mutation with authentic no-mutation target verification; rolled_back/restore_failed joins commit_rollback with pre_restore_proven. post_restore_state_sha256 must match the corresponding complete original target or pre-restore state hash proved by that owner, with the original count/failure fields consistent. Terminal result truth cannot be reopened or rewritten by a later link; such a link changes only the original result-event reference/time permitted by the canonical journal and retains the first resolution origin. Every actual writer is revoked_terminal. A recovery_required journal, retained recovery fence, active reconciliation, unknown effect or unsupported outcome stays unresolved. A retained fence is not terminal resolution.

The claim is only the original FileSafe invocation's effect resolution. It explicitly does not certify current filesystem equality after later legitimate writers. current_filesystem_equality_claim and unknown_effect_custody_transfer remain false. There is no reconstructed success, new public command/event, second stop timestamp or synthetic terminal receipt.

#### Inventory and whole-workflow boundary

RoleSetAssessment consumes the whole dependency StopSource including the complete current original inventory. Partition every dispatch invocation exactly once by its full identity: a supported FileSafe disposition or an UnsupportedInvocation. No filtering to a favorable generation, currently active subset, role, provider-visible subset or convenient empty inventory is allowed. Every unavailable disposition retains its corresponding original invocation in unsupported_invocations; therefore it cannot enter FileSafeRoleSetResolved. Duplicate, omitted, foreign or changed members fail acceptance. The inventory cut, scheduler stop and actual role reads must remain coherent under the original aggregate owner's boundary.

selected_filesafe_role_set_resolved means only the represented effects are resolved. workflow_safe_stop_admission explicitly remains requires_original_workflow_executor_and_all_other_source_roles even when every inventory member is supported FileSafe or the original inventory is authentically empty. The D05 aggregate separately supplies original complete census, capability/obligation and final-flush composition; Process supplies only its exact supported original shutdown source. FileSafe role assessment alone supplies none of those facts and cannot serve as D06 admission. Checkpoint success remains unavailable.

Executor EP115 context-transition retention/reconciliation and FileSafe recovery fencing do not authorize Goal cancellation to transfer unknown effects. No such transfer is supported here. Scheduler stop fences dispatch; it does not prove effect resolution. Any unknown other-role effect or missing native source remains pending/unavailable under the existing original owner. This is an explicit unmet source dependency, not proof that no future canonical contract can supply it.

#### v2 exact terminal-core and result-link rule

FileSafe v2 complete metadata values and original journal families remain exact; the k1 profile changes only the three compact metadata keys and source identity. No full journal archive is added.

At original first terminal resolution, the native journal writer validates the complete original journal and exact equality under its real FileSafe boundary. It computes terminal_core_sha256 as SHA-256 of the UTF-8 domain `pm.filesafe.terminal-core.v2` followed by one zero byte followed by canonical MessagePack of the complete original journal map after removing exactly the top-level keys updated_at_utc and result_event_ref. No other field, nested member, nullable value or array element is removed or normalized. The stored journal still has every original required field. This commitment is non-null only at first resolution or a later permitted result link; prior nonterminal origins have null. The first-resolution origin stores the exact two removed field values in journal_link_fields. It commits this core digest in the actual original terminal transaction, never later observation.

A later result-link writer reads and validates the complete current journal under the actual original owner lease, verifies its terminal core matches the authentic first-resolution origin, and may change only result_event_ref and updated_at_utc. It validates the complete candidate original journal and requires candidate terminal core to equal the same first-resolution digest before commit. Its own journal_link_fields stores the exact issued two field values; prior values are in the immediately preceding immutable origin, so the reader checks a complete actual link chain without an old journal body. Every later link carries the unchanged non-null terminal_core_sha256 and resolved_original_result pointing to that first-resolution origin. No link may change operations, phase, cursor, holds, restarts, recovered_after_restart, outcome, conflict reason, state hashes, identity, schema or any other original field. If a later canonical writer needs such a change, this profile becomes unsupported; it does not claim that the owner generally forbids such changes.

The read operation validates the current complete original journal, checks its two current link fields against the current origin and computes its full terminal core using the exact recipe. That core must equal the authentic first-resolution commitment and every subsequent link commitment. The first resolution origin's exact original equality and write-kind must still support its terminal class. This is an owner-validated comparison of the currently retained full original terminal fields and original link-field custody, not reconstruction or reinstallation of a historical journal. The current journal, genuine original equality-origin and entire immutable origin chain are required; an origin/hash without the current full journal cannot pass. No historical operations-array archive, raw manifest/blob archive, or indefinite full-journal-version archive is introduced.

The two link fields are required-present in the exact original journal schema. result_event_ref retains explicit null or its exact string and updated_at_utc retains the exact original timestamp spelling; no absent-to-null or timestamp normalization is allowed. The terminal publication also validates and hashes the entire original value in its JournalIssueCommitment, independently of the core digest. JournalIssueCommitment is a distinct typed historical commitment, not SourceSelector, and uses issued_physical_sha256. Compare its identity/key/codec and issued hash to current JournalSelector only for the current head; never dereference an old journal commitment as an extant row.

Stop/acceptance races remain ordered under C's actual original handoff fence. If Stop wins before FileSafe acceptance, no FileSafe capability or new restore is issued. If FileSafe accepts first, it is a genuine inventoried operation requiring original reconciliation. Crash after C admission but before known FileSafe acceptance keeps unacknowledged/unknown inventory; a reader cannot infer no effect or redispatch. Crash after FileSafe acceptance but before C ack preserves that same original binding/journal/origin and permits only authentic same-operation ack/readback. A missing FileSafe source does not remove the C member.

#### Original disposable local Unix MCP process shutdown

This original custody contract is owned by Executor, Run Modes, MCP lifecycle and Storage and remains only one prerequisite of D05. The supported route is an original explicitly disposable PM-managed local Unix MCP diagnostic probe using stdio and the Run Modes MCP three-second grace. It must be genuinely admitted as that diagnostic before launch and must have no shared-session beneficiaries. MCP pooling remains the canonical default; no normal tool invocation becomes a disposable probe because cancellation would be convenient. Pooled MCP, remote MCP, external-managed MCP, CLI provider shim, provider five-second route, Windows and LSP/terminal sessions require their own original source profiles. Unsupported routes remain exact members of the C v2 all-generation dispatch census.

#### Original source and capability boundary

The actual C admit_dispatch transaction durably issues the entire original DispatchInvocation, admission and MutationOrigin before downstream handoff. C afterimages cover its own issued rows, not this later owner's records. Under the same authentic stop/capability handoff fence, the original process/MCP supervisor accepts that exact capability and records ProbeBirth from the real launch operation. ProbeBirth binds complete invocation, original dispatch input capture, actual original command source, original server/runtime lifecycle value, host boot and process namespace, native containment birth, original root process reservation, owner epoch and both output streams. It is not an alternative launch request. C ack_handoff follows the actual acceptance and selects its already-issued birth/origin. A Stop that wins before transfer prevents launch; a launch that wins remains in the stop census. A crash before known acceptance/ack leaves the C member unacknowledged/unknown, never eligible for blind redispatch.

The original supervisor's `native.process_scope` boundary is a mandatory native source primitive with the following exact responsibilities. This is a required owner integration, not a claim that a process-group ID implements it. Before any child can execute user code, the supervisor reserves and owns the native containment domain, process group/session, kernel process identity, namespace/boot, stream descriptors and spawn/exec gates. The child is stopped behind its actual native gate while original ProcessBirth and the membership origin commit durably. It creates its own process group/session as required by Run Modes before effect-capable release. Every nested process has its own pre-effect C dispatch admission and ProcessBirth, or cannot be released by this profile. The actual boundary enforces all spawn, exec, group/namespace escape, descriptor passing, callback, reconnect, subscription and tool-dispatch capabilities; it does not infer them from a scan or an in-memory array.

An implementation that cannot prevent unregistered child effects, cannot enumerate/revoke all inherited output writers, or cannot preserve containment against process-group escape returns native_containment_unproven. Ordinary process groups, `ps`, PID absence, kill return codes, elapsed time and a caller-provided list are insufficient. No implementation mechanism is presumed installed. The source primitive is qualified only when the native owner can establish these exact original enforcement facts; its identity/registration is privately resolved at every operation. This profile adds no authority to sandbox or relaunch an existing arbitrary process. A process launched without original profile admission remains unsupported.

Kernel identity is the retained original native object/handle plus host boot, process namespace, kernel birth/start sequence and original group/session birth. Numeric PID/PGID alone is never reused as identity. Both stdout and stderr occur exactly once, with distinct original pipe/read and complete writer-domain identities. No other supervisor-owned output channel can be omitted. Application network or other external effects remain separate effect-owner obligations and are not resolved by this process source. The actual native registry is the source of membership; every registered process, writer, inherited descriptor holder and callback capability is present, including terminal members. NativeMembership outside_scope_beneficiaries and escape_or_untracked_sources are exhaustive actual sources, not optional caller disclosures. New helpers receive new identities; they cannot impersonate an old member.

#### Shutdown admission, grace and escalation

ShutdownAdmission is written only inside the genuine original supervisor operation consuming C's authentic full StopSource. Match complete scope, attempt/invocation, operation, Goal Stop, SchedulerStop, immutable stop inventory cut and actual current native cancellation result/origin. The original Once key belongs to that real root and probe; duplicate entry observes the same original operation and never sends another initial signal. SIGTERM/SIGINT entrypoint fan-out and SIGHUP reload semantics remain Run Modes-owned. This internal selected-route teardown sends SIGTERM to the actual originally owned process group and fixes a monotonic three-second deadline. It does not rewrite the original Goal stop time or choose a new public stop reason.

Before signal delivery, revoke spawn/exec/reconnect/subscription/tool-dispatch admissions and state-changing callback capabilities in the actual native domain. Graceful output readers and normalizers retain only the exact drain capabilities they need until finalization. During grace, already-authorized original work can terminate and produce final output; new effects cannot be dispatched. SignalResult records the original syscall operation and result against the exact native group identity; a genuine already-terminal wait can produce already_terminated_confirmed without sending a signal. That state cannot be inferred from ESRCH on a recycled or unavailable PID.

If the group is still live at the original monotonic deadline, run and record the before_force mandatory flush before issuing SIGKILL. Failure of that flush is sticky done.crashed even if force teardown still proceeds to reclaim the process group. A successful pre-force flush is not final stream completion: late grace/termination output can arrive and must enter the final drain/flush. The force SignalResult selects the same group birth, original scope and current membership, and is issued only once for this original escalation. No force result is clean until every actual original process has a native terminal wait result and the current enforced containment/writer domain is quiescent. A stuck or unidentified member stays unresolved; failure diagnostics do not make it absent.

WaitResult preserves native exit/signal distinctions, optional status as explicit null, and exact kernel identity. `original_group_terminated` requires terminal observed status for every actual member and a current domain read proving no live descendants or escape capabilities. Root-process exit alone does not qualify. Finalization closes owned input and protocol sessions in their original deterministic lifecycle order and revokes every remaining process-related mutation capability; current helpers outside the probe are not affected.

#### Stream finalization and normalized queue coverage

Each stream's actual normalizer owns an ordered chain from byte offset zero and normalized ordinal zero. The original normalizer produces a NormalizedAdmission before releasing each normalized event toward storage, retaining the original normalization operation, exact byte interval and event source/schema/semantic identity. Queue writers cannot admit an item without this original chain and capability. Zero emitted events is valid only with a genuinely complete native zero-item chain and finalized input; empty caller arrays prove nothing. Gaps, duplicates or a wrong ordinal are unresolved. SHA commitments are original observation metadata, not replay or current raw-byte certification.

StreamFinalization is an original native finalizer result, committed while it owns the complete pipe writer domain and parser. It requires actual EOF after all original producers close, complete received-byte accounting, completion of every outstanding normalizer job and final partial-input disposition. A final incomplete protocol fragment must follow the existing normalizer's actual error path and resulting original event custody; it cannot disappear or become fabricated valid output. A failed read/parser, unknown producer or crash-lost unflushed bytes cannot yield eof_and_parser_finalized. Both streams remain independent of terminal UI/backing-file lifetime. This route does not certify browser, remote terminal or retained UI state.

Raw bytes are not copied into these new durable records. The positive reader consumes an authenticated already-issued original finalizer result and its actual native current capability boundary. If that original result never durably existed and raw buffered input was lost, recovery reports the loss and cannot recreate a successful parser result from hashes. The existing owner may reconcile retained real material under its own authority; this cancellation reader does not manufacture it or install an archive to make it available.

#### Required flush writer and whole source readback

There are two original flush stages: before_force when escalation occurs, and before_final_outcome in every completion path. WriterCut is captured by the actual shared normalizer/seglog admission owners under their native queue fences. It enumerates all original writer queues contributing to this probe, their complete admitted items, drained/remaining counts and normalizer in-flight counts. These arrays are exhaustive native membership, not items filtered by a favored event type, run generation or matching-row maximum. Shared Storage commits can contain other scopes; this process does not claim ownership of those scopes, and the complete global Storage controls/read token remain required.

At before_force, the cut fixes the complete current prefix while later output can still be admitted. At before_final_outcome, both streams must be finalized, all producer/normalizer admission capabilities sealed and all probe queues drained. Each admitted item is accounted exactly once by a complete original EventRecord, original first-append custody and original full_value_result, or remains unresolved. Full current EventRecord envelope and registered payload schema admission are mandatory. Receipt-shaped metadata, seglog.event_appended observability, normalized output EOF or a write/buffer flush do not establish durability.

The actual Storage append owner performs the existing two durability barriers: complete source frame writes plus selected active-segment sync, then original manifest watermark promotion plus required parent-directory synchronization. Original SP-286 first-receipt custody must also durably commit. Its exact original full_value_result and custody bind the whole original EventRecord commitment. Readback uses the existing complete event_record_index read_token and full current original CURRENT/manifest/source under the native append/maintenance fence. Original historical receipt coordinates remain original; the current selected source may have a separately authenticated later frontier or supported compaction. Never equate original manifest_generation with current manifest_generation merely to make a join pass. Missing translation, retained full value or current original source is unavailable.

RequiredFlushRecord is the only new durable flush record. It contains compact original admission/custody selectors and original full_value_result commitments, typed failure state and the genuine native Storage boundary operation reference. FlushResult is a private readback wrapper, not a persisted metadata family. Its full EventRecord values, whole current CURRENT/manifest and whole original first-receipt custody are resolved from their existing owners for that read and are not copied into a new archive. The original required flush record's status/operation/stage/sequence/time and every commitment must equal the complete readback. The native Storage operation referenced by the original record authenticates the originally executed sync/promotion/custody operations; strings or matching schemas do not execute or substitute for those operations.

No fake event is appended solely to serve as a flush marker. A genuinely empty flush still invokes the actual registered writer's durability boundary and validates its real queue/capability cut and current original controls. It does not mint a receipt or sequence-zero cursor. Source validation, segment write/sync, manifest promotion, directory sync, first-receipt commit or readback failure produces an authentic original failure record. A structured diagnostic is required by the original owner; if diagnostic persistence also fails, the record preserves pending/unavailable diagnostic state and cannot claim it was durably emitted.

Flush failure requires done.crashed, never done.failed or clean done.cancelled. Later successful retry/recovery cannot erase an already-authenticated required-flush failure from this operation. User/parent cancellation with all required original flushes durable requires done.cancelled even when force termination was necessary. This field is an original terminal requirement for the selected prerequisite, not a newly emitted `done` event or permission to publish a Workflow status. All other original Executor obligations remain separately required.

#### Crash recovery and current reader

The original crash owner handles an unfinished run lacking canonical terminal done against the last durable seglog state. RecoverySource records the actual recovery operation/origin, old/current native host identities, authenticated original result if one exists and the current original Storage recovery boundary. If no canonical terminal exists, Run Modes requires done.crashed with stop_reason=crash_recovered; this cannot become a fabricated clean cancellation even if a later kernel scan finds no processes. Unknown or acknowledged Storage loss remains original Storage recovery failure and mutation fencing. Recovery does not reconstruct lost output or issue new dispatch/restore/tool calls.

After a crash, an already-authenticated original process result can be read unchanged only if current genuine owner/source/permissions/retention and native capability dispositions still support it. Old numeric PID/PGID, stale descriptor tokens or host-path strings cannot reattach identity. If the original native scope cannot be authenticated, return native_process_identity_unavailable or an unresolved original result. The original recovery owner may re-establish a current native boundary from its actual persistent supervisor/OS authority, but this contract grants neither a fresh process nor a fabricated old birth. Recovered crash metadata and original required-flush failure stay sticky. Storage final lock release happens only after actual final writer flush; this scoped process reader never closes the app's DB or releases the app-global store lock.

`read_original_process_shutdown` takes ShutdownReadRequest only. The actual process owner resolves the real birth, current head and all immutable source/origin rows from the original dispatch, then retrieves full native membership, original C admission/origin/current Stop, original process waits/finalizers/flush records and required full Storage readback. It validates every whole schema and selector, joins exact scope/attempt/invocation/operation/host/boot/namespace/group, follows the complete original sequence with no gap/fork, and proves all invocations and original writer queues represented by its domain belong to the authentic stop census. Different role or outside-scope membership is unavailable; the reader cannot filter it away.

Under the actual current supervisor/storage owner locks, repeat whole owner epoch, root generation, Stop/census, current source head, membership, current MCP lifecycle, permissions, registered codecs and retention/hold/backup/deletion admission before and after decoding/copying/hash/Storage helper calls. No source release follows a mutable/helper gap. Each independently callable read repeats this complete boundary; prior read output is not transferable authority. Those native source refs name real full private owner sources held and checked by the operation; a caller-supplied string, assertion or hash cannot satisfy them.

`this_original_process_shutdown_resolved` requires original_group_terminated; every actual ProcessMember terminal_waited with matching native WaitResult; no outside beneficiaries or untracked/escaped sources; every capability revoked; exactly stdout/stderr eof-finalized; authentic final flush present and durable; pre-force flush present and durable iff force occurred; no original failure/crash branch; and unchanged genuine original result with done.cancelled requirement. Zero/missing process membership cannot pass for a ProbeBirth whose child was released. Admitted-but-never-spawned operations need a separate profile and are not inferred as empty success here. Every schema condition is necessary, not sufficient without these native source joins.

This process assessment says nothing about remote effects, filesystem mutation, MCP application-level success or unresolved ToolSettlementReceipt. Forced/synthetic settlement may settle an invocation for liveness without proving its external effect. All original FileSafe/SCM/worktree/tool/provider/verification owners remain necessary. D06 requires the separate whole D05 aggregate and its positive source contract; this Process role result cannot satisfy it alone. No new user-facing status, Goal terminal event, stop timestamp, effect transfer or unconditional cancellation success is introduced.

Each ProcessBirth carries its own complete process-role DispatchInvocation and original admission/origin selectors, including nested processes. member_dispatch_sources supplies every corresponding whole original admission and origin. Root birth/admission is identical to the root member, never an extra invented dispatch. Process sources can cover several authentic nested process invocations in one original native group; the whole-run D05 partition must account for each such exact invocation once. A child lookup can resolve the same original probe only through its own authentic ProcessBirth/native membership, never a guessed parent PID. No process in NativeMembership may lack its own C stop-cut member.

Every capability represented here is the original probe-scoped capability, including its normalized-event enqueue/append contribution. Revoking it never revokes the app-global shared Storage writer or another run's enqueue capability. Current global Storage controls remain whole original sources; the scope split is proved by actual native owner bindings, not by filtering a global queue into a claimed empty list.

The process operation_id is the actual supervisor shutdown operation and matches its own admission/results. C StopSource retains the original root cancellation operation separately and unchanged; it is not renamed to a per-process operation or forced equal to an unrelated native syscall ID. Every source joins both through its genuine original ShutdownAdmission. Whole-D05 composition joins the root C cancellation operation and every per-owner original operation without collapsing their identities.

#### Independently callable FileSafe and Process boundaries

The complete canonical method declarations identify all eighteen exact private entries. Every named schema is a full definition within its whole pinned source root. Every native input is a private owner operation, never arbitrary JSON or a transferable string. The complete original owner boundary is necessary in addition to schema validity. These calls are not public commands and are not cancellation-reader authority to cause effects. Writers are invoked only by the corresponding originally admitted FileSafe/process operation at its genuine phase.

FileSafe initial admission requires the existing original command/blocked attempt/safe point/permission and already-durable C admission/origin, and does not require future journal/head/origin. The single original acceptance/journal-preparation transaction atomically commits the complete binding, original journal, first origin and head together before mutation or C acknowledgment. The initial journal is an independently derived whole native-owner preparation candidate and absent initial preimages are proved; prepared values are not authority before this outer all-four commit. Subsequent publish_journal calls require the complete original prior journal/head/origin and never create the initial binding. C acknowledgment is authentic acceptance readback, not a second admission. The injective key profile is authentically installed before original admission/preparation; old raw-key operations are unsupported. Current whole-read and same-operation recovery do not write. Native FileSafe reconciliation remains its own original operation and only it invokes the journal writer.

Process probe admission does not require future process birth. Actual child release waits for original own C admission, native gated ProcessBirth and membership durability. Each source write serializes its complete immutable Physical wrapper, hashes the exact canonical MessagePack bytes into its own OriginalWriteOrigin, then updates ProcessSourceHead in the same actual Storage transaction. Multiple source writes in one actual native transaction use distinct original source-write IDs and increasing origin sequence; the head selects the last already-serialized origin. Do not confuse a native syscall ID, root C cancellation ID, per-probe shutdown ID and original source-write ID. The key recipe's operation_id means the authentic original source-write identity, carried by its origin/OriginLocator where the payload names the syscall differently; original native_wait_operation_id remains separately exact. No method relabels those identities to force equality.

There is no atomicity claim between an arbitrary kernel syscall and redb. The native owner must hold the genuine original operation and capability fence and record only an authentic operation result. A crash between syscall and durable result preserves unknown/pending unless actual original native custody can recover it; a subsequent scan, matching PID, elapsed time or new observation cannot manufacture an old original result. No new side-effect call is authorized by readback.

Every method refuses a changed owner, epoch, storage/root generation, source location, permission, Stop/census, native membership, codec or retention/hold/backup/deletion boundary. Revalidate after every source/codec/hash/storage/native helper and immediately before commit or output release. No stale helper result or prior read is authority. Pending genuine intermediate records retain their exact typed status; unavailable returns the complete existing Unavailable branch and action_authority=none. Failed persistence never yields a committed tuple. The real original pending owner custody remains unresolved; no reader synthesizes missing rows.

Original reused FileSafe journal/safe-point/permission and Process lifecycle/CURRENT/manifest/first-append receipt values remain their original whole families with exact keys/codecs/lifetimes. Process FlushResult and full EventRecord/source controls are read-time whole owner inputs, never extra persisted families. The 3 FileSafe and 15 Process metadata families use only the separately mapped existing authority policy, with source/raw lifetimes independent. No method defines deletion policy, raw history, new public done event, Workflow terminal authority or whole safeStop success.

##### Pre-enqueue producer and post-append EventRecord

The normalized-event admission takes the complete original producer submission in `Plans/executor_cancellation_contracts/schemas/process-normalized-producer.v1.schema.json`. This whole transient signature schema preserves the exact bound original EventRecord2 grammar except only sequence_id, observed_at_utc and persisted_at_utc, which Storage has not yet issued. Its complete producer grammar differs from the original EventRecord only by those three absent Storage-owned fields and the explicit producer resource identity. Every other original required, optional, nullable and nested constraint is preserved. The exact original native payload schema and normalizer operation remain necessary; this adds no event type, payload contract or persisted family.

Only the actual later Storage append supplies the three fields and produces the true full EventRecord. The required-flush operation then needs that whole original EventRecord, its full registered payload, original first-append custody and full_value_result, plus current complete controls/read token. No pre-enqueue path requires a future EventRecord/receipt, and no post-append path accepts a producer submission in place of the full EventRecord.

#### Exact original D05 method boundaries

These complete original methods retain their original scope. The native owner determines the actual phase; adding a whole argument never grants a phase not admitted by that method. Prebirth requires full OriginalLaunchGoalRead and no StartControl. T1 requires full OriginalWorkflowBirthGoalArgument and co-issued BirthStartOutput. Admitted actual-start observations require full OriginalStartArgument plus separate OriginalGoalArgument. Every stopped method requires full CurrentGoalStopArgument and CurrentStartArgument, including both StoppedAggregateArgument and StoppedCurrentBoundaryArgument where consumed.

| Original method | Actual original boundary | Original result |
|---|---|---|
| `executor.bounded_safestop.join_original_compile.v2` | Inside authentic owner.workflow.compile.issue_native.v1 publication after original NativeCompileSource and OwnerIssueOrigin issuance | Immutable CompileReservationJoin, Origin and head CAS, complete original reservation equality |
| `executor.bounded_safestop.join_original_workflow_birth.v2` | Inside genuine corrected C Workflow birth after original birth and WorkflowMutationOrigin issuance | Immutable WorkflowReservationJoin, Origin and head CAS; exact original compile/allocation/birth joins |
| `executor.bounded_safestop.admit_original_pre_attempt_effect.v2` | Every actual reserved-run external-effect handoff before legitimate original C attempt/admission, under native capability exclusion before release | Immutable PreAttemptEffectAdmission, Origin and append-only head; every such member unsupported in this positive profile |
| `owner.workflow.launch.reserve_execution_identity.v1` | Genuine original native LaunchIdentityReservation allocation/admission, after authentic native namespace absence/same-operation and whole original parent/Goal/Stop/permission read, before first reserved-run capability release; no future NativeCompileSource or Workflow input | Original ReservationAllocation, DomainBirth, authentic Origin and head durable together; uninstalled precise native integration, no public Goal or ID creation route |
| `executor.bounded_safestop.register_capability.v2` | Actual native owner issues a capability behind its pre-effect gate | CapabilityBirth and authentic original Origin before release |
| `executor.bounded_safestop.record_capability_disposition.v2` | Actual original revoke/drain/terminal capability operation | Immutable CapabilityDisposition, complete DomainCut and Origin/head; no caller-selected revoke claim |
| `executor.bounded_safestop.register_required_obligation.v2` | Actual existing owner requirement becomes due before its triggering transition/effect can outrun custody | Immutable ObligationBirth plus Origin/head; no new policy |
| `executor.bounded_safestop.admit_core_event.v2` | Original selected-run producer/normalizer before actual queue release | CoreEventAdmission and original Origin; actual event remains in existing owner source |
| `executor.bounded_safestop.observe_stopped_domain.v2` | Actual original coordinator holding Goal Stop, native cancel, SchedulerStop/inventory and complete owner domain | Original complete DomainCut; unresolved retained |
| `executor.bounded_safestop.flush_original_final.v2` | Actual original queue seals/drains and Storage durability barriers before final outcome | CoreWriterCut and compact FinalFlushRecord/origins, private full original event/custody/current readbacks |
| `executor.bounded_safestop.issue_original_safe_stop.v2` | Genuine original Executor aggregate after exact supported input and final pure native fence | Immutable AggregateResult/Origin and actual head CAS; no new event or Workflow status |
| `executor.bounded_safestop.read_original_safe_stop.v2` | Independent read at original result key with actual full current owner/Goal/Stop/census/source boundary | SuccessfulReadback or truthful unavailable; no effects/replay writes |
| `executor.bounded_safestop.recover_original_safe_stop.v2` | Actual original coordinator recovery, preserving immutable original operation identity | Same original result or authentic Recovery/pending; crash without done remains crash_recovered |

#### Exact private method phases and original algorithms

OriginalProcessOperationBoundary: Actual originally registered disposable local Unix MCP stdio probe native.process_scope, private operation/transaction identity and durable original source chain, genuine host/boot/namespace/process handles, complete membership/writer/descriptor/callback registry, original capability gates, current C Stop/census and own invocation sources, owner/permission/source/codec/retention/holds/backup/deletion fences. Child remains pre-exec gated until its original admission/birth durable; plain PID/PGID or caller list is insufficient.

##### owner.filesafe.original_source.admit_binding.v1

Single original FileSafe acceptance/journal-preparation transaction after C admission, before mutation and C acknowledgment.

OriginalFileSafeAdmissionBoundary: Actual original command, blocked-attempt, Goal Stop/current permission and C capability-handoff sources; native FileSafe owner lease/epoch, storage instance, host/root/location, original operation and transaction IDs, native source/codec/retention/backup/hold/deletion registrations; filesafe_original_injective_keys.v1 authentically installed before this admission. Genuine absence or exact same-original-operation custody for all binding/journal/head/origin keys; new initial candidate is not a future committed source. Native original preparation and binding acceptance share the single actual original acceptance/journal transaction.

1. Resolve exact native command, whole genuine safe-point and permission sources, already-durable C admission/origin; join full invocation and all canonical payload identities without narrowing IDs.
2. Independently derive and validate entire original initial journal candidate inside original FileSafe preparation; genuine absent initial keys substitute for nonexistent preimages, not caller-supplied future origins.
3. Prepare complete binding under .v2.k1 key; initial journal revision is 1 with null prior selectors. Compute issued_journal_commitment from complete original journal bytes, serialize immutable first origin, then head selecting that already-prepared origin. None of these prepared candidates alone is installed authority.
4. Atomically commit binding, original journal, first immutable origin and head together in the single actual original acceptance/journal transaction before any mutation capability release. No intermediate binding-only commit. Immutable unequal same-key bytes conflict.
5. Only after this complete authentic transaction may original mutation capability be released and C acknowledgment select already-issued complete acceptance/binding/origin custody. Crash with unknown commit preserves C unknown membership and authentic same-operation readback only.

Physical write participants: `executor_filesafe_invocation_binding`, `safe_point_restore_transaction (existing exact original family)`, `executor_filesafe_journal_origin`, `executor_filesafe_journal_head`.

##### owner.filesafe.original_source.publish_journal.v1

Every subsequent original journal write: progress, first resolution or permitted result-link, after the initial all-four acceptance commit.

OriginalFileSafeJournalWriteBoundary: Actual registered original FileSafe mutation/reconciliation/result-link operation, equality sources where applicable, lock and original transaction; entire current preimage journal/head/origin, prior immutable origin chain and first resolution origin if any; installed original key profile; actual owner, permissions, all writer capabilities, codec/retention/holds/backup/deletion before and after helpers. Initial creation belongs exclusively to admit_binding.v1 all-four transaction.

1. All calls validate whole actual prior journal/head/origin and owner-lease CAS; increment revision exactly once, retain prior journal commitment rather than full prior body.
2. First original terminal resolution must execute canonical full equality and store terminal core using exact FileSafe2 recipe plus exact two journal_link_fields; never infer from process exit or metadata.
3. Subsequent result links may change exactly result_event_ref and updated_at_utc; validate complete current/candidate journal and identical terminal core, store exact link fields and immutable first resolution reference.
4. Own operation/transaction IDs and committed selectors come from this native write; no self-hashing origin and no reader-issued origin or fabricated prior revision.

Physical write participants: `safe_point_restore_transaction (existing exact original family)`, `executor_filesafe_journal_head`, `executor_filesafe_journal_origin`.

##### owner.filesafe.original_source.read_current.v1

Read-only original current disposition.

CurrentFileSafeReadBoundary: Privately resolve original admission, installed original key profile, real exhaustive writer domain and native FileSafe/source/permission/hold/backup/codec owner fence; acquire independently on every call.

1. Resolve whole OriginalFileSafeSources including binding, complete original C admission/origin, current full journal/head/origin, first resolution origin, entire origin chain, original safe point and permission; no caller-chosen path.
2. Validate all exact byte hashes and physical families/codecs, operation and full identity joins; historical journal commitments are not read selectors.
3. Repeat owner/root/location/permission/Stop and source-head/writer/hold/deletion/backup/codec checks after every decoding/hash/native helper and before release.
4. Full first-resolution custody plus allowed link chain/current terminal core and all writers revoked_terminal is necessary for resolved; recovery fence or unknown result stays unresolved.

Physical write participants: none; passive read only.

##### owner.filesafe.original_source.recover_same_operation.v1

Restart or interrupted admission/journal commit readback.

OriginalFileSafeRecoveryBoundary: Actual persistent original FileSafe recovery operation, original key-profile admission, original command and pending transaction custody under restored current owner and source registrations; no new restore/dispatch/operation identity.

1. Read exact original committed binding/journal/origins under independent full boundary; never install missing or old-profile rows.
2. If native reconciliation is still required, only its original mutation owner may continue its existing operation using its full original retained inputs/holds and publish_journal.v1; this readback method itself has no writes.
3. Missing known acceptance preserves unacknowledged C membership; unknown effects cannot be recast as absent or clean.
4. Return original result unchanged only when complete current boundary and original terminal custody validate; no new observed-at timestamp, terminal core or success receipt.

Physical write participants: none; passive read only.

##### owner.executor.process_source.admit_probe.v1

After genuine C admission, before launch capability release.

OriginalProbeLaunchBoundary: Actual preauthorized disposable probe command/input capture and C capability-handoff fence; own root process reservation/native containment birth and exactly stdout/stderr stream birth facts. No later ProbeBirth required as an input.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Accept only originally admitted disposable PM-managed local Unix MCP stdio probe, no outside beneficiaries; pooled/default/shared/remote/CLI/Windows routes unavailable.
2. Issue authentic ProbeBirth from native reservation; first origin has null probe_birth and null priors, sequence 1; origin hashes issued full wrapper then head selects origin.
3. Commit wrapper+origin+head atomically before capability release; C acknowledgment follows actual acceptance.

Physical write participants: `executor_process_probe_birth`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_process_birth.v1

Every root or nested child before any effect-capable execution.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Each child has its own complete genuine C DispatchInvocation/admission/origin, retained kernel identity, native containment attachment and pre-exec gate.
2. Reserve distinct original source-write IDs for ProcessBirth and membership; each full row gets its own successive origin, committed together with head under native original transaction.
3. Release child only after durable birth/membership; enforce escape/spawn/descriptor capabilities. No late scan enrollment.

Physical write participants: `executor_process_member_birth`, `executor_process_membership`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_membership.v1

Every original native membership change before changed capability release.

OriginalMembershipMutation: Actual complete native membership transition and original transaction; children require already genuine gated original process birth; output writers/callbacks/terminal members remain exhaustive.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Validate previous head and exhaustive native registry; issue immutable membership revision exactly next.
2. Commit complete membership+origin+head CAS atomically; no omission of terminal/escaped/untracked members and no caller subset.

Physical write participants: `executor_process_membership`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.admit_shutdown.v1

Original once-owned supervisor shutdown entry.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Join root cancellation and own per-probe shutdown IDs distinctly; original Once key prevents duplicate initial shutdown.
2. Revoke spawn/exec/reconnect/subscription/tool/state-changing callback admissions before signal; drain-only capabilities remain bounded.
3. Issue original monotonic three-second grace admission, preserving Goal stop time and root delivery semantics.

Physical write participants: `executor_process_shutdown_admission`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_signal.v1

Actual original signal/escalation result.

OriginalSignalOperation: Actual SIGTERM or SIGKILL operation against retained native group birth; original monotonic clock/deadline and before_force original flush for escalation, or genuine already-terminal wait. No caller-fabricated syscall observation.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Only original group identity; no PID reuse inference or ESRCH-to-success.
2. SIGKILL requires original grace deadline and before_force flush attempt; failed required flush stays done.crashed although reclamation may proceed.
3. Persist original syscall result exactly once; duplicate original operation reads same bytes.

Physical write participants: `executor_process_signal_result`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_wait.v1

Each actual original process wait.

OriginalNativeWait: Actual terminal/nonterminal native wait result bound to retained process handle/boot/namespace/kernel birth and original wait operation.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Preserve native observed status, exit/signal/core-dump distinctions and explicit nulls.
2. Unknown/nonterminal/identity-unavailable result cannot establish terminal membership; every actual member needs own matching terminal wait.

Physical write participants: `executor_process_wait_result`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.admit_normalized_event.v1

Before each normalized event can be released toward Storage.

OriginalNormalizationAdmission: Actual original stream parser operation with complete normalized producer submission and exact original payload-schema admission, byte interval, semantic digest, zero-based ordinal and previous original admission; real enqueue capability and original normalized source. No final EventRecord, sequence_id, observed_at_utc, persisted_at_utc, append receipt, first custody or full_value_result exists or is required before enqueue.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Start actual byte/ordinal chain at zero; every interval and ordinal accounted, no gaps/duplicates.
2. Issue original immutable admission before enqueue release; contains commitments/refs only, not raw output/EventRecord archive.
3. Only actual later Storage append adds sequence_id, observed_at_utc and persisted_at_utc. Required flush subsequently requires the whole true EventRecord and original receipt/full-value custody; this pre-enqueue producer signature never substitutes for that post-append readback.

Physical write participants: `executor_process_normalized_admission`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_writer_cut.v1

Original pre-force or final flush queue cut.

OriginalWriterQueueCut: Actual exhaustive original probe contributing queue membership and in-flight normalizers under shared queue/admission fences; before_force or before_final_outcome stage, complete original admitted-item chain and real writer identity.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Keep before_force prefix distinct from final seal; late output remains admitted and included at final stage.
2. Final cut requires both finalized streams, sealed producer/normalizer admission and drained probe queues; no filtered matching-row maximum.
3. Scope capability revocation never revokes shared app Storage or another run.

Physical write participants: `executor_process_writer_cut`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.finalize_stream.v1

Independent original stdout and stderr finalizers.

OriginalStreamFinalizer: Actual original pipe and complete inherited writer domain; EOF, full byte accounting and all parser jobs/partial-input error disposition; exact original normalized admissions and native gate. No historical raw stream recreation.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. EOF requires all original producers closed; complete parser jobs and partial input follow actual owner error/event path.
2. Lost buffered input, failed parser/read, unknown writer or missing original result cannot yield eof_and_parser_finalized.
3. Record authentic finalizer while holding native writer domain; zero items valid only with complete native zero chain.

Physical write participants: `executor_process_stream_finalization`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.commit_required_flush.v1

Actual mandatory durability stage.

OriginalRequiredFlushOperation: Actual original before_force or before_final_outcome Storage operation with every whole current EventRecord+registered payload, SP-286 first custody/full_value_result, whole CURRENT/manifest and complete read_token under append/maintenance fence; complete arrays of original cuts where several writers contribute.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Execute source frame writes+segment sync, manifest watermark promotion+required directory sync and original first-receipt custody durable commit.
2. Read full original/current sources via actual Storage boundary; respect original receipt coordinates vs current frontier/compaction translation.
3. Persist compact commitments only. Any required failure is sticky done.crashed; preserve diagnostic persistence failure. Empty stage invokes true durability boundary with real controls, no marker event/cursor-zero invention.

Physical write participants: `executor_process_required_flush`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_termination.v1

Original group termination assessment.

OriginalTerminationInputs: Complete original SignalResultPhysical set, terminal WaitResultPhysical for every actual member, before_force RequiredFlushRecordPhysical iff escalated, genuine original monotonic clock and enforced current containment/writer registry.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Require terminal waits for every actual process, no outside/untracked/escaped capability and current containment quiescence; root exit alone insufficient.
2. Preserve original grace/force references and sticky failures; unresolved member stays unresolved.

Physical write participants: `executor_process_termination_result`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.commit_shutdown_result.v1

Original process prerequisite result publication.

OriginalShutdownResultInputs: Exactly both original stream finalizations and all original required flush records plus full FlushResult readbacks, whole current native capability/membership sources and complete original origin chain.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Resolved only with original group terminal, all capabilities revoked, both streams authentic EOF-finalized, final flush durable and pre-force flush durable iff forced, no crash/failure branch.
2. Required flush failure remains done.crashed; genuinely clean cancelled path requires done.cancelled even if force occurred; no Workflow/Goal done emission.
3. Persist unchanged first original result/origin; this result does not resolve external FileSafe/tool/remote effects.

Physical write participants: `executor_process_shutdown_result`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_crash_recovery.v1

Original unfinished-run recovery.

OriginalCrashRecoveryInputs: Actual unfinished original run and pending shutdown custody, old/current native hosts, original result if it exists, last durable whole Storage recovery state and canonical terminal EventRecord if present; actual original Run Modes recovery owner authority.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. No canonical terminal implies done.crashed/crash_recovered; unknown Storage loss and flush failure remain sticky.
2. Authenticate original native scope using persistent owner/OS authority; no PID scan success or new process/old-birth fabrication.
3. Existing result read unchanged only with whole current boundary; lost raw input cannot be reconstructed.

Physical write participants: `executor_process_shutdown_recovery`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.read_current.v1

Read-only process prerequisite disposition.

CurrentProcessReadBoundary: Independently acquire genuine current supervisor/source/permission/retention/codec/backup/hold/deletion, root/Stop/census and membership/capability fences; privately resolve source from each genuine root/child admission.

1. Resolve whole ProcessShutdownSources and every physical source/origin/current head plus all complete C admissions/origins/Stop and whole original/current Storage readback.
2. Validate complete immutable sequence no gap/fork, exact key codec/hash, all invocation/host/process/operation joins and every stop census member owned by group.
3. Repeat complete native/source/owner/Stop/permission/hold/backup/codec/deletion boundary before and after all helpers and immediately before release; prior result is not transferable authority.
4. Return unresolved/unavailable for missing original/current sources or unsupported route; resolved assessment gives no action authority or whole-workflow safeStop.

Physical write participants: none; passive read only.

For every method above, failed/unknown original commit or changed native boundary returns the complete original Unavailable branch with action_authority=none; no committed output is fabricated. Genuinely committed intermediate records keep their exact nonterminal status and never imply effect resolution. Preserve the original pending operation and unknown inventory membership; recovery is restricted to the genuine same operation. Every entry independently derives the complete permissible source/candidate union before helpers and repeats its whole native/source/permission/Stop/codec/retention/backup/hold/deletion/root-generation predicate after all returning helpers with no subsequent helper, callback, await, logger or mutable gap before its own commit or passive disclosure. The outer joint publisher independently checks the complete union, including preserved members. Prior caller checks never authorize a lower entry.

#### Event registry, terminal caller and remaining proof boundary

The exact started-v3 source-family selection and complete original reader/consumer/projector/checkpoint are now governed by GRS-079/SP-311. The separate complete cancelled-v3 consumer/projector/checkpoint and existing-family v3 source selection are now GRS-080/SP-312; original started-v3 routes and all native proof gates remain unchanged. Actual original native v3 publication and reads remain unavailable until the corresponding original owner/custody/codec/root/backup and current-source boundaries qualify. This source contract supplies no Event-depth pass, cannot borrow Executor run.started qualification and cannot replace a full original EventRecord claim with receipt-only custody.

Positive D06 has a separate originally registered terminal-service source boundary and its own required first append barrier. It does not mutate D05's sealed work queues, capability/admission history, final flush or sticky failures. If SP-305's actual outer Goal operation holds a competing pre-reserved sequence/segment/offset append/rotation fence, D06 remains unavailable until the original Goal/Storage owner supplies its explicit compatible caller/assignment successor. No foreign lock release, fake receipt, omitted event, widened numeric domain or generic post-cut exception is admitted. D05 imports no future D06 result, event or Goal terminal; the positive consumer imports complete fresh D05 readback.

RequiredCheckpointSuccess remains false. Every actual required checkpoint, unsupported pre-attempt effect, unknown capability/obligation, pooled/shared process, arbitrary callback or unsupported role remains unresolved in the complete original census. The admitted product controls, default pooling, Stop priority, independent effect ownership and all source/raw lifetimes remain unchanged. No original source is recreated from a schema, event projection, surviving hash, current body, PID scan or new producer operation.

Source/schema checks establish no native installation, actual capability/root authentication, source execution, exhaustive native enrollment, concurrent exclusion, exact codec execution, cross-store atomicity/fsync/crash behavior, complete current/retained replay, backup/restore or outer Goal integration. Those runtime proofs remain NOT_RUN. No runtime launch, global D05 closure, event-depth pass, WorkNode/NodeSeed/readiness admission or governance seal follows.

```yaml
plan_unit_id: EP-119
unit_type: schema_contract
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Original bounded safe-stop, FileSafe and disposable Process sources. Native allocation enrollment
  precedes every reserved-run capability; the whole original census includes every generation, pre-attempt effect,
  unknown member and actual obligation.
gui_related: false
gui_classification_reason: Defines original runtime source, owner, storage and verification semantics without a
  visual surface.
split_recommended: false
depends_on:
- EP-118
- EP-115
- GRS-073
- GRS-075
- SP-308
unblocks: []
acceptance_criteria:
- Native allocation enrollment precedes every reserved-run capability; the whole original census includes every
  generation, pre-attempt effect, unknown member and actual obligation.
- Only genuine zero invocations or fully owned FileSafe and disposable unshared Unix MCP Process dispositions can
  enter the bounded positive partition; unsupported effects and checkpoints remain unresolved.
- All required flush attempts remain in authentic original history; any required flush failure remains sticky and
  an empty event set still performs its required original barrier.
- Every original upper/lower method, helper and reader independently enforces complete source and final native predicates;
  sealed work queues cannot be reopened by terminal publication.
validation_surfaces:
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
- Plans/storage_value_registry.json
risk_class: original_workflow_source_custody_or_native_admission_drift
reasoning_tier: high
context_scope: ep_119_original_source_contract
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
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
source_atom_ids: []
negative_constraints:
- No public command, event-membership, Goal lifecycle or retention-policy expansion.
- No fabricated source, absence, origin, receipt, current body, native authority or retrospective original enrollment.
- No numeric coercion, lossy codec, hidden effect/census member or required-flush failure removal.
- No WorkNode/NodeSeed/runtime/readiness/event-depth/global safe-stop or governance claim from source adoption.
```

ContractRef: ContractName:Plans/executor_cancellation_contracts/methods.json, ContractName:Plans/executor_cancellation_contracts/realm-entry-boundaries.json, ContractName:Plans/executor_cancellation_contracts/physical-families.json, ContractName:Plans/executor_cancellation_schema_resources.json


### EP-120 - Original started Event to native publication custody join

EP-118 already owns the complete original workflow_start_original.v2 producer/coordinator and current D01/Start source, and EP-119 retains actual original D05 observer and shutdown boundaries. GRS-079 and SP-311 now select the exact started-v3 source route and its complete required event consumer/projection/checkpoint contract. They do not alter the original start method signatures, accepted A4 outbox, Start/D01 values, native mutation algorithm, D05 or D06 routes. This started unit does not select goal_run.cancelled; its separate complete cancelled-v3 consumer/projector/checkpoint and existing-family source selection are GRS-080/SP-312, with native qualification still independently required.

The passive `owner.goal_run.started.read_retained_native.v1` owner boundary obtains the entire existing Start control at its actual physical key, unchanged original A4 initial control origin, complete original StorageCandidate, StorageCommit and StorageOrigin, plus complete original D01 StorageWorkflowUpdate, StorageWorkflowMutationOrigin and StorageWorkflowHead. Authenticate these as actual original coissued values under native original registration/custody; caller JSON, source hashes, identical operation/transaction strings or method names do not prove provenance. Before any returning helper independently obtain whole actual phase inputs and candidate; after all helpers reevaluate the pure whole source/candidate/current applicable owner/permission/hold/deletion/root/codec/transaction predicate with no helper/interleaving gap to release. Missing original custody is unavailable, never a native repair or new publication.

Exact run/storage scope, operation/transaction, owner identity/epoch, candidate and commit references, before/after native selectors, prepared outbox, delivery profile and historical intended payload, captured original Goal context/source commitments, event ID/schema/type, producer semantic digest, first append receipt and original stored-value commitment agree across all complete objects. Start control selects the original immutable commit and operation, with no pending candidate; its initial origin belongs to the same original run birth. Original candidate/native inputs were transient; a retained argument hash is an original issuance commitment, not a claim that a historical full argument or body remains available.

Start Commit.record.transition is the complete unchanged five-field ActivationTransitionReceipt: original activation identity, from_state=start_event_pending, to_state=active, original prepared outbox and actual original cause. The separate original D01 update.record.transition.rule is original_workflow_start and cause is owner_status. D01 update original_owner_result/origin select the actual Start commit/origin; its original lineage origin is the genuine owner.executor.workflow_source.update_workflow.v3 publication and selects the original update/head in its full afterimages. Original head binds that update and native after selectors. Validate exact before/after BodyIssuanceCommitment identity, revisions, owner and ready/start_event_pending to running/active transition. Authenticate original publication rather than requiring the original head to be today's head. Do not dereference historical body/control selectors to require or reconstruct old body copies.

`inspect_original.v1` separately requires the complete genuine SP278 index/checkpoint/token/whole-source frame evidence and full original Event/first barrier/full-value custody; the native metadata reader alone proves no complete EventRecord availability. Current projected running interpretation additionally uses original read_started_current.v2 rules with whole fresh CurrentStartSource and separate CurrentGoalArgument. Its current body commitment must equal the original projected after commitment. EP-118's broader authentic current-source read may still expose later D06 native truth; this started-only current projection refuses that later revision instead of representing it as running. Historical reader requires no new Goal/native body and asserts no currentness or action authority.

No new original Start publication, D01 update, origin, dispatch, Stop, D05 checkpoint, D06 action or Event is caused by any passive method. The concrete GoalRuntime projector writes only its two derived Storage families, never native state. Original source-family policies and mandatory BRS-025 custody backup remain unchanged. Additional bounded passive source consumption is declared by these exact owner methods without rekeying, reschematizing or rewriting any of the coordinator baseline's 278 complete family rows. Actual original native service installation, complete original publication atomicity/fsync, codec/custody execution and post-helper/final fences remain independently unproved; source adoption and matching metadata do not make them available.

```yaml
plan_unit_id: EP-120
unit_type: schema_contract
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Complete original started-v3 source and bounded consumer ownership; native execution remains unproved.
gui_related: false
gui_classification_reason: Defines original runtime source, custody, replay and retention contracts without a visual surface.
split_recommended: false
depends_on:
- EP-118
- EP-119
unblocks: []
acceptance_criteria:
- Exact original whole source and retained/current boundary is preserved.
- Only the existing started Event family changes; all other Event rows and all 278 Storage rows and 27 policies remain exact.
- The mandatory durable projection has complete atomic generation/checkpoint ownership.
- Source definitions do not claim installed native authority, Event depth or runtime execution.
validation_surfaces:
- Plans/goal_run_started_consumer_contracts/consumer.schema.json
- Plans/goal_run_started_consumer_contracts/methods.json
- Plans/goal_run_started_consumer_contracts/physical-families.json
- Plans/goal_run_started_consumer_schema_resources.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
risk_class: original_started_source_or_projection_currentness_drift
reasoning_tier: high
context_scope: original_started_v3_consumer_adoption
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Executor_Protocol.md#EP-118
- Plans/storage-plan.md#SP-309
- Plans/Backup_Restore_System.md#BRS-025
source_atom_ids: []
```


### EP-121 - Whole original positive D06 event and causal custody consumption

EP118's complete positive original_bounded_safe_stop_terminal_publication.v1 registration, D06 v3 methods and D01 coissued original outcome remain the exact producer authority. EP119 and the already adopted original coordinator/started units retain their existing source, boundary and custody contracts. GRS-080/SP-312 now discharge the distinct cancelled-v3 consumer/projector/checkpoint and existing-family source-selection prerequisite. They change no native registration, method signature, coordinator algorithm, original stored value, capability or effect permission. Actual native installation/execution, original authority, codecs, final fences, atomicity and Event depth remain unavailable until independently qualified.

The new retained native method obtains the entire original nonterminal EventCandidate, Intent, committed Control, CancelledResult, prepare and publish Origins, D01 update/head/mutation origin, full original D05 cause, original Start cause and original process effect custody. Original Goal SourceAudit/StopIntent/StopReceipt/ControlPublication/binding sources and full original FileSafe bindings/terminal journals/origin chains are admitted in their separate complete source realms. Every helper independently authenticates full applicable original sources, candidate and current disclosure/owner fences, then repeats the complete final predicate after returning helpers with no gap to release. Copied JSON, a method/profile literal, an original argument hash or serialized capability handle proves no original invocation.

Original native registration must precede DomainBirth and genuinely identify the positive terminal service principal, native entrypoint, original operation and epoch. Full original DomainBirth/final cut, complete writer/capability/obligation and pre-attempt census, original reservation/compile/workflow enrollment, core writer cuts/event admissions, all required flush records and original origin chains establish the bounded D05 outcome. No pre-attempt, unknown or unsupported effect, reopened queue or ordinary late output is admitted. Every required flush failure remains sticky, including an authentic empty event set. D05 required checkpoint success remains false. D06's separate original cancellation Event/first barrier does not rewrite the sealed earlier final flush.

D05 aggregate, D06 disposition, SchedulerStop/native cancellation, effect and flush operations preserve genuinely distinct coordinates. Resolve the selected SchedulerStop native_cancel_result.operation_id against full original native RunOperationResult/PublicationOrigin; join original root Goal Stop/SourceAudit and execution binding, exact inventory/capability boundaries and genuine full D05 result/origin. Do not force those distinct operations equal. Authenticate the exact original control-plane writer, stopped queues and all revoked work/effect/callback/normalizer/drain capabilities through the original owner.

Candidate precedes prepare outputs; the method-specific prepare Origin closes only its original candidate/Intent/control commitments. Committed Control advances its phase/revision once and selects its original immutable Result. Publish Origin closes native/result/control outputs without self/downstream D01 dependency. Original D01 update is owner_status with rule d06_cancel_nonterminal; original_owner_result/origin select that exact D06 result and publish origin. Genuine owner.executor.workflow_source.update_workflow.v3 custody binds complete update/head and original pointer commitment in the same coordinated outcome as native status+1 revision, unchanged activation and original first append. Historical issuance selectors do not authorize fetching/reconstructing old mutable Workflow/Goal bodies or requiring an old head to be current.

The original_started cause carries the entire previously adopted RetainedNativeStart and every original candidate/commit/initial-control-origin/transition/D01 predicate, including the complete five-field ActivationTransitionReceipt. The no-start cause instead requires the genuine initialized StartControl with epoch zero and three null operation/pending/committed fields, original A4 issuance and full original WorkflowBirth/mutation origin for that born run. Absence of a retained started Event or empty dispatch proves neither no-start nor no mutation. Pending Start is unavailable in this bounded reader.

Original effect owners independently resolve the exhaustive complete original FileSafe and disposable-process partition. Full native journal/origin/binding and process birth/admission/termination/shutdown/origin values establish which mutation/settlement/rollback actually occurred and became durable before cancellation. Reference presence, phase or enum alone never suffices. Required original source disposal makes this dependent read unavailable; no archive or source reconstruction is introduced. The exact complete producer submission, original stored Event and full append/custody are compared field by field under the original JCS/idempotency, producer digest and original-value codecs, not by one digest alone.

Current cancelled reads additionally admit complete positive CurrentRead and CurrentSuccessfulReadback, full D05/current Start and separate CurrentGoalStopArgument/current D06 controls at one held actual native/Goal boundary. They do not reuse an old readback as current. Exact matching cancelled native body/control/activation, original result and current complete generic frontier are mandatory; changed native/Goal/source state refuses the view. Passive original/historical reads remain independent of current mutable Workflow/Goal bodies and confer no action. Complete source and independent lower-owner boundary details are SP-312. No reader runs native cancellation, repairs lineage, creates an origin/receipt, mutates D05 or gains terminal writer authority.

```yaml
plan_unit_id: EP-121
unit_type: schema_contract
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Complete positive original cancelled-v3 source consumer and bounded versioned projector ownership; native execution remains unproved.
gui_related: false
gui_classification_reason: Original runtime custody and derived source currentness contract without visual presentation.
split_recommended: false
depends_on:
- EP-118
- EP-119
- EP-120
unblocks: []
acceptance_criteria:
- Whole original Event/native/Goal/effect sources and independent helper entry/final predicates are preserved.
- Only the cancelled Event row changes; two separate derived families preserve all 280 expected predecessor rows and all 27 policies.
- Existing started-v3 profiles and methods remain unchanged, with explicit fresh combined generation/cutover.
- Source adoption does not qualify installed native authority, Event depth, runtime or governance.
validation_surfaces:
- Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json
- Plans/goal_run_cancelled_consumer_contracts/cancelled-causal-arguments.schema.json
- Plans/goal_run_cancelled_consumer_contracts/goal-arguments.schema.json
- Plans/goal_run_cancelled_consumer_contracts/filesafe-arguments.schema.json
- Plans/goal_run_cancelled_consumer_contracts/methods.json
- Plans/goal_run_cancelled_consumer_contracts/physical-families.json
- Plans/goal_run_cancelled_consumer_schema_resources.json
- Plans/storage_value_registry.json
- Plans/event_family_registry.json
risk_class: original_cancelled_source_or_combined_projection_currentness_drift
reasoning_tier: high
context_scope: positive_cancelled_v3_consumer_adoption
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Executor_Protocol.md#EP-118
- Plans/storage-plan.md#SP-309
- Plans/Backup_Restore_System.md#BRS-025
source_atom_ids: []
```
