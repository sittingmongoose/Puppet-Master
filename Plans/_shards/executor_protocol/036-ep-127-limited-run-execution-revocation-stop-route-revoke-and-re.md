# Shard 036: EP-127 — Limited run-execution revocation Stop route; revoke and read run-execution revocation, native phase selection, actual invalidation, exhaustive slot afterimages and readback; D06 carried with its issuer unbound (2026-09-25)

Source: `Plans/Executor_Protocol.md`

Source lines: L8915-L9057

Source SHA256: `678a1f907845cb356373658edf4b70d5459d93076620cf539c03d4ee2921fe17`

---

## EP-127 — Limited run-execution revocation Stop route; revoke and read run-execution revocation, native phase selection, actual invalidation, exhaustive slot afterimages and readback; D06 carried with its issuer unbound (2026-09-25)

```yaml
plan_unit_id: EP-127
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'For a genuine v8 birth, Stop against the combined operation slot is a limited run-execution revocation
  under stop-protocol.md R01-R12; v6 and v7 births keep the ordinary Stop route of EP-118. Two methods of the original
  Executor run admission and callback owner, registered at genuine v8 birth, are uninstalled source declarations
  resolving in the Stop root Plans/workflow_combined_source_contracts/schemas/workflow-combined-stop-execution-revocation.v2.schema.json:
  owner.executor.native.revoke_run_execution.v1 takes ExecutionRevocationSource, keeps ExecutionRevocationCandidate
  private and returns ExecutionRevocationMethodResult (execution_revoked, already_execution_revoked or unavailable);
  owner.executor.native.read_run_execution_revocation.v1 takes RevocationReadRequest, returns RunRevocationCurrent
  and writes nothing. Neither accepts a caller afterimage. For v8 births owner.executor.workflow_source.record_stop.v1
  and owner.executor.workflow_source.read_stop.v1 bind the CombinedStopCurrentInput, CombinedStopResult, ReadStopInput
  and CombinedStopReadResult of that root; the EP-118 declarations stay for earlier profiles. As in v7, the protocol
  field of the v8 owner.executor.workflow_source.record_stop.v1 declaration names Plans/Executor_Protocol.md#EP-118,
  the ordinary record_stop contract; read_stop carries no protocol field in v7 or v8. The lower source holds the
  whole CurrentGoalStopArgument of EP-119, the immutable Start association of this run and profile, native run control,
  scheduler, every WorkNode, attempt and execution-unit record of every generation with all 24 fields, the full
  effect census, the held phase and the combined guard, omitting nothing for being earlier-generation, queued by
  Replan, terminal or effect-unresolved. The native owner, never the caller, selects the phase: ordinary idle has
  only the ordinary Stop route, whose native cancel and SchedulerStop sources are not supplied here; released idle
  with earlier limited Stop custody is read-only readback; Replan before prepare keeps its null PublicationControl,
  and a missing control never proves absence; Replan after prepare keeps its nonnull control and treats the old
  D01 inventory only as a before-observer; certified held keeps its original control and infers no release or cancellation.
  A contradictory or incomplete original yields unavailable, and Goal Stop never waits for a complete cancellation
  source. The D01 record_stop entry invokes the lower participant under the per-Workflow admission exclusion and
  one same-instance native Storage transaction. The private candidate keeps the held operation and its selectors,
  increments the slot revision exactly once, changes only the slot phase to revoked, and supplies an immutable SlotRevision
  and a SlotOrigin issued by owner.executor.workflow_source.record_stop.v1; no WorkNode, attempt, effect, run control
  or result, scheduler value, SchedulerStop, Workflow body, Event or coordinator control changes, and pending wakes,
  delays, reservations and unacknowledged dispatch facts are kept. The Executor invalidates the dispatch, admission
  and callback authority of the run, serialized with the slot transaction: adapters deny launches, new attempts
  and effects, wake or delay promotion, reserved handoffs and execution-bearing callbacks, and reject stale admissions
  and callbacks. NativeExecutionRevocationResult is returned only after invalidation and slot commit, as an ephemeral
  call result that is never stored, caller input or RunOperationResult(operation=cancel); D01 discloses StopAcceptedRevocation
  only after validating it. Invalidation may precede commit and survives a storage failure, success needs the committed
  slot transaction, restart reacquires Goal authority and slot issuance before any capability is minted, and unavailable
  authority is never nonrevocation. No running external effect is undone, and nothing is declared cancelled or completed.
  The current Slot, immutable SlotRevision and immutable SlotOrigin (workflow_combined_slot, workflow_combined_slot_revision
  and workflow_combined_slot_origin) are the only durable afterimages; no header, family, audit stream, Event or
  retention rule is added, the origin binds the input hash, and the native return lives only for its call. RunRevocationCurrent
  is acquired only through owner.executor.native.read_run_execution_revocation.v1, adds no authority and is not_revoked,
  goal_execution_revoked, execution_revoked or unavailable. not_revoked needs a usable guard, its issuance journal
  and independently current nonrevoked Goal authority; goal_execution_revoked, carried as GoalStoppedCurrentAcquisition,
  is genuine current Goal Stop with an actual guard in every slot phase, including the first Stop on an unrevoked
  held Replan or certified slot, and asserts no slot revocation; execution_revoked, like the lower result already_execution_revoked,
  needs the existing revoked SlotRevision and SlotOrigin and current invalidation, never Goal Stop alone. Readers
  create no Stop intent or receipt, latch nothing and never invoke the lower writer, and combined.claim.v1 cannot
  claim for a stopped Goal. After revocation nothing admits execution, dispatch, wake promotion, a new attempt or
  effect, a graph mutation or normal publication; readback, repeated Stop, original cancellation and cleanup and
  recovery of the exact held operation keep only their narrow capabilities, recovery cannot clear Stop, and Goal
  restart and resume keep their existing contracts with no new ban or restart route. ExecutionRevocationReadbackSource
  is the held branch or the released-idle branch, whose ReleasedIdleGuard has nonnull last_released_operation_id
  and last_release_selector and whose OriginalCurrentRelease is the released Replan control with its release receipt
  or the certified GuardReleased of coordinator.v2; the revoked SlotRevision names the last released operation and
  the Stop SlotOrigin the D01 Stop operation. Readback runs combined.read_guard.v1, then owner.executor.native.read_run_execution_revocation.v1,
  then owner.storage.certified_event.read_guard.v1 for certified, then owner.executor.workflow_source.read_stop.v1,
  and returns StopRevocationReadback, never a reconstructed lower result, old mutable Slot, SchedulerStop, native
  cancel or D06; repeated Stop returns existing custody and replays nothing. The released-idle readbacks presuppose
  a later release to idle whose transition from revoked is not stated in the source; they remain source obligations,
  NOT_RUN. The D06 argument grammar of EP-118 and EP-119 is carried, its argument roots now in the native-v8 successor
  workflow-cancel-positive-arguments.v3. Its issuer owner.executor.native.record_cancellation.v1 is an unbound dependency,
  whose EP-117 row still reads Complete dependency contract only, and nothing in this installation activates it
  by implication. The Stop route rests on owner.executor.native.revoke_run_execution.v1 as Stop review v3 accepted
  it. NativeExecutionRevocationResult and slot custody never validate as or substitute for a D06 StopSource, SchedulerStop
  or RunOperationResult(operation=cancel), so full original cancellation, D06 and GRS-078 steps 5 onward are unavailable
  for v8 births; a later genuine cancellation route neither clears Goal Stop nor erases the revocation lineage.
  The limited operation appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer.
  Only the v2 Stop root is selected at Stop positions. StopAcceptedPending and PendingStopSource in workflow-combined-guard.v1
  and the older CombinedStopCurrentInput and CombinedStopResult in workflow-original-start.v7 stay unselected lineage
  listed in superseded-lineage.json, the pending-Stop text of the placed protocols and guard predicates is amended
  to this route, Stop root v1 is external lineage, and no rule that one text overrides another is adopted. The birth
  registration includes the Executor run admission and callback owner, the Goal Stop owner, the D01 Stop entry,
  the Storage slot writer and the existing scheduler and native adapters, with six typed participants and fourteen
  mandatory joins in stop-native-participants.json; the slot issuer owner.executor.workflow_source.record_stop.v1
  and the lower issuer owner.executor.native.revoke_run_execution.v1 cannot impersonate each other, and no reader
  invokes the publication participant. stop-positive-route-obligations.json states seven source obligations, FIRST-REPLAN-CLAIMED,
  FIRST-REPLAN-PREPARED, FIRST-CERTIFIED-HELD, REPEATED-HELD, READBACK-RELEASED-IDLE-REPLAN, READBACK-RELEASED-IDLE-CERTIFIED
  and TRUTHFUL-UNAVAILABLE; instances and native execution are NOT_RUN for all seven, and TRUTHFUL-UNAVAILABLE is
  compiled as a stated rule only. Native installation, capability authentication and execution are NOT_RUN. This
  version-scoped source applies only to a genuine fresh pm.executor.workflow_source.all_writers.v8 Workflow birth
  and its pm.goal_run_certified.producer_source.v3 component. Workflows born under all_writers.v6 or v7, and their
  editions, keep their closed scope; no existing birth is enrolled, cast or re-read as v8. The complete source is
  the files under Plans/workflow_combined_source_contracts/ and Plans/workflow_standard_source_contracts/native-v8/,
  normative together. It supplies no Event registry row, payload successor, consumer, projector or checkpoint. Source
  acceptance establishes neither installed native authority nor execution, codec, transaction, durability, recovery,
  Event-depth or readiness proof; all such native evidence and all schema instances remain NOT_RUN. No WorkNode
  or NodeSeed is created.'
gui_related: false
source_lineage:
- external-combined-source:sha256:9ed8ba4f825939cc59b37941aafe1068be7ed2d6ada87c0e3b8eaa3b5225896e
- canonical-draft-package:sha256:bb6be609d20536be795bdaab41de179e85caec79e9d5973e16d6e0b3c2139ba5
- independent-source-review:sha256:62d94dc1fa719157dc96effebcc6ad24ed7f2f8d5b5e49332eb70acbc3cc170f
- root-placement-review:sha256:a7f5bb5fbebbc9a5794848140fafc38e08ad5784a5120d3ba801baec41f965c4
- stop-independent-review-v3:sha256:c9271320b89fed97d76fd9b803efbd41b49e52ad6f9dad76deb9a6e69703b1c2
- stop-root-acceptance:sha256:ab69b0a93063993f303000169c63c06b04d2b45e10935e2c6e4ae327048bae62
- currentness-readjudication:sha256:297b0f292bf478846a40f8b8a96ea3db6a0e6d21591d08ca1be8881944fc8a9c
depends_on:
- PDS-003
- EP-126
- EP-119
- EP-121
unblocks: []
acceptance_criteria:
- Preserve the complete scoped v8 source and every original entry/final/phase/type/lifetime predicate; compile no
  superseded Stop text as operative.
- Use the canonical realm bindings and exact external lineage tokens; prove the canonical inverse to the v3 source
  and the actual final acyclic commitment and descriptor hash graph.
- Native installation, authentic original source capabilities, execution, schema instances, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
- The D06 argument grammar is carried, owner.executor.native.record_cancellation.v1 stays an unbound dependency
  that nothing activates, the Stop route rests on owner.executor.native.revoke_run_execution.v1, and no revocation
  value validates as a D06 StopSource, SchedulerStop or RunOperationResult(operation=cancel).
- Goal Stop alone never yields execution_revoked or already_execution_revoked; Slot, SlotRevision and SlotOrigin
  are the only durable afterimages; the seven obligations stay source obligations with instances and native execution
  NOT_RUN.
validation_surfaces:
- Plans/workflow_combined_source_contracts/stop-protocol.md
- Plans/workflow_combined_source_contracts/schemas/workflow-combined-stop-execution-revocation.v2.schema.json
- Plans/workflow_combined_source_contracts/new-original-methods.json
- Plans/workflow_combined_source_contracts/stop-native-participants.json
- Plans/workflow_combined_source_contracts/stop-positive-route-obligations.json
- Plans/workflow_combined_source_contracts/superseded-lineage.json
- Plans/workflow_combined_source_contracts/composition.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: ep-127_whole_combined_v8_family
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/workflow_combined_source_contracts
- Plans/workflow_standard_source_contracts/native-v8
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
gui_classification_reason: Original source, native authority/custody, schema, storage or passive consumer contract;
  no new visual presentation.
```

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-127, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/workflow_combined_source_contracts/stop-protocol.md, ContractName:Plans/workflow_combined_source_contracts/stop-native-participants.json, ContractName:Plans/workflow_combined_source_contracts/stop-positive-route-obligations.json, ContractName:Plans/workflow_combined_source_contracts/composition.json
