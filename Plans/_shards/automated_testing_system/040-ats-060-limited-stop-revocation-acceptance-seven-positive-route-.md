# Shard 040: ATS-060 — Limited Stop revocation acceptance: seven positive-route source obligations, D06 negatives and native NOT_RUN (2026-09-25)

Source: `Plans/Automated_Testing_System.md`

Source lines: L5519-L5703

Source SHA256: `a264c124b39b9aed1aca93380904bcb6b96837411fbc07a720d7277d7652e8f1`

---

## ATS-060 — Limited Stop revocation acceptance: seven positive-route source obligations, D06 negatives and native NOT_RUN (2026-09-25)

```yaml
plan_unit_id: ATS-060
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'Acceptance of the limited run-execution revocation Stop route of stop-protocol.md R01-R12 consists
  of the seven positive-route source obligations in Plans/workflow_combined_source_contracts/stop-positive-route-obligations.json
  and the negatives V8-STOP-N1 through V8-STOP-N6. The obligations FIRST-REPLAN-CLAIMED, FIRST-REPLAN-PREPARED,
  FIRST-CERTIFIED-HELD, REPEATED-HELD, READBACK-RELEASED-IDLE-REPLAN, READBACK-RELEASED-IDLE-CERTIFIED and TRUTHFUL-UNAVAILABLE
  are compiled as that file states them: each keeps its trigger, its whole input and result roots in the Stop root
  v2, its original positive obligations and its forbidden shortcuts, and the file status COMPLETE_SOURCE_OBLIGATIONS_NOT_INSTANCES
  holds. They are source obligations, not generated instances or native successes. Instances and native execution
  are NOT_RUN for all seven, and TRUTHFUL-UNAVAILABLE is compiled as a stated rule only. Source acceptance of the
  obligations rests on Stop review v3 and its root acceptance, which discharged the two bounded phase findings at
  source-contract level only, and on the independent and root reviews of the canonical-draft package; the per-obligation
  source_review field, frozen before Stop review v3, is lineage and is read neither as open nor as passed. An obligation
  is discharged only by an authentic native execution of its route against genuine original sources; no test double,
  fixture, schema-valid example or TEST_ONLY adapter discharges one. The released-idle readbacks presuppose a later
  release to idle whose transition from revoked is not stated in the source; they remain source obligations, NOT_RUN.
  The D06 argument grammar is carried; its issuer owner.executor.native.record_cancellation.v1 is an unbound dependency
  whose EP-117 row still reads Complete dependency contract only; nothing in this installation activates it by implication;
  the Stop route rests on owner.executor.native.revoke_run_execution.v1 as Stop review v3 accepted it. NativeExecutionRevocationResult
  never validates as a D06 StopSource, SchedulerStop or RunOperationResult(operation=cancel); full cancellation,
  D06 and GRS-078 steps 5 onward are unavailable for v8 births. This version-scoped source applies only to a genuine
  fresh pm.executor.workflow_source.all_writers.v8 Workflow birth and its pm.goal_run_certified.producer_source.v3
  component. Workflows born under all_writers.v6 or v7, and their editions, keep their closed scope; no existing
  birth is enrolled, cast or re-read as v8. The complete source is the files under Plans/workflow_combined_source_contracts/
  and Plans/workflow_standard_source_contracts/native-v8/, normative together. It supplies no Event registry row,
  payload successor, consumer, projector or checkpoint. Source acceptance establishes neither installed native authority
  nor execution, codec, transaction, durability, recovery, Event-depth or readiness proof; all such native evidence
  and all schema instances remain NOT_RUN. No WorkNode or NodeSeed is created.'
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
- ATS-059
- EP-127
unblocks: []
acceptance_criteria:
- Preserve the complete scoped v8 source and every original entry/final/phase/type/lifetime predicate; compile no
  superseded Stop text as operative.
- Use the canonical realm bindings and exact external lineage tokens; prove the canonical inverse to the v3 source
  and the actual final acyclic commitment and descriptor hash graph.
- Native installation, authentic original source capabilities, execution, schema instances, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
- 'FIRST-REPLAN-CLAIMED First Stop on a claimed Replan slot: Trigger: genuine current Goal Stop while an authentic
  claimed Replan slot has never been revoked and has no PublicationControl. Inputs GoalStoppedCurrentAcquisition,
  ClaimedOrdinaryPhase, ExecutionRevocationSource and ExecutionRevocationCandidate; results ExecutionRevocationPublication
  and StopAcceptedRevocation. Positive: The whole original CurrentGoalStopArgument with its SourceAudit, the complete
  actual before-slot guard and journal and a coherent CurrentSource; the Goal-only acquisition asserts no prior
  slot revocation and the held lower source is complete without future afterimages; the actual lower Executor invalidates
  real capabilities and the same transaction publishes the first revoked Slot, SlotRevision and SlotOrigin while
  the control stays null. Negative: Reject a demanded prior revoked slot, already_execution_revoked from Goal Stop
  alone, and an invented prepare, control, native cancel or D06. Evidence: Source obligation only; instances NOT_RUN;
  native NOT_RUN.'
- 'FIRST-REPLAN-PREPARED First Stop on a prepared Replan slot: Trigger: genuine current Goal Stop while an authentic
  prepared Replan slot and its control have not been revoked. Inputs GoalStoppedCurrentAcquisition, StopPhase, ExecutionRevocationSource
  and ExecutionRevocationCandidate; results ExecutionRevocationPublication and StopAcceptedRevocation. Positive:
  The actual prepared current phase with its original nonnull control and the complete native, all-generation and
  effect source; the independent Goal-only acquisition precedes lower publication, and final native revalidation
  follows every returning helper; only the slot custody is published, and the original control and every native,
  attempt and effect fact are preserved. Negative: Reject a phase chosen by the caller, a new result admitted as
  an input, and a cancellation substituted for the revocation. Evidence: Source obligation only; instances NOT_RUN;
  native NOT_RUN.'
- 'FIRST-CERTIFIED-HELD First Stop on a held certified slot: Trigger: genuine current Goal Stop while an authentic
  certified claimed or prepared slot has not been revoked. Inputs GoalStoppedCurrentAcquisition, StopPhase and ExecutionRevocationSource;
  results ExecutionRevocationPublication and StopAcceptedRevocation. Positive: The original certified empty birth
  control before arm, or the genuine prepared control after it; the full original current D01, Goal, Start, native
  and effect sources and the actual guard; real lower invalidation and exact coissue of the existing slot triple.
  Negative: Reject a Replan-style null control for a certified slot and any assumed certified release or cancellation.
  Evidence: Source obligation only; instances NOT_RUN; native NOT_RUN. How a durable held certified Event behind
  a revoked certified slot ends is not stated in the source; its Event side belongs to the Event contract work A3.'
- 'REPEATED-HELD Repeated Stop on a held or recovering slot: Trigger: an authentic current held or recovering slot
  with a surviving immutable revoked SlotRevision and SlotOrigin and a currently effective original Goal Stop. Inputs
  ExecutionRevocationSource, HeldExecutionRevocationReadbackSource and SlotRevocationCustody; results ExecutionRevocationReadback
  and StopRevocationReadback. Positive: Authenticate the prior immutable revoked SlotRevision and the original origin
  issued by owner.executor.workflow_source.record_stop.v1 with their owner, operation and transaction joins and
  the current native invalidation; acquire the complete current held native phase independently; the already result
  discloses the original custody. Negative: Reject new runtime effects or slot issuance from a repeated read, a
  reconstructed historical native return, and an already status from Goal Stop alone. Evidence: Source obligation
  only; instances NOT_RUN; native NOT_RUN.'
- 'READBACK-RELEASED-IDLE-REPLAN Released-idle readback after Replan: Trigger: original Replan recovery or release
  advanced the current slot to coherent idle, the immutable Stop SlotRevision and SlotOrigin survive and the current
  Goal Stop still applies. Inputs ReleasedIdleExecutionRevocationReadbackSource, OriginalCurrentRelease, ReleasedIdleGuard,
  ReadStopInput and SlotRevocationCustody; results ExecutionRevocationReadback and StopRevocationReadback. Positive:
  Full independent current Goal, Start, native, scheduler, all-generation and effect sources and a coherent current
  D01; the idle slot has nonnull last_released_operation_id and last_release_selector matching the genuine released
  Replan control, its release receipt and their native issuances; the revoked revision and origin scope and the
  held operation match the released operation, and the native invalidation stays effective. Negative: Reject an
  obsolete mutable slot body or historical held source, a demanded native issuer return, native cancel or SchedulerStop
  for this readback, and a D06 substitute, new durable record or retention policy. Evidence: Source obligation only;
  instances NOT_RUN; native NOT_RUN. Its precondition, a genuine Replan release, is itself unavailable until the
  consumer-adoption work A2 supplies the projection admission and A3 the Event admission.'
- 'READBACK-RELEASED-IDLE-CERTIFIED Released-idle readback after certification: Trigger: original certified recovery
  or release advanced the current slot to coherent idle, the immutable Stop SlotRevision and SlotOrigin survive
  and the current Goal Stop still applies. Inputs ReleasedIdleExecutionRevocationReadbackSource, OriginalCurrentRelease,
  ReleasedIdleGuard, ReadStopInput and SlotRevocationCustody; results ExecutionRevocationReadback and StopRevocationReadback.
  Positive: Full independent current Goal, Start, native, scheduler, all-generation and effect sources and a coherent
  current D01; the idle slot has nonnull last_released_operation_id and last_release_selector matching the genuine
  original certified GuardReleased of coordinator.v2; the revoked revision and origin scope and the held operation
  match the released operation, and the native invalidation stays effective. Negative: Reject an obsolete mutable
  slot body or historical held source, a demanded native issuer return, native cancel or SchedulerStop for this
  readback, and a D06 substitute, new durable record or retention policy. Evidence: Source obligation only; instances
  NOT_RUN; native NOT_RUN. Its precondition, a genuine certified release for a v8 birth, needs Storage admission
  of v8 certified values, which is unavailable until a separate Storage revision.'
- 'TRUTHFUL-UNAVAILABLE Truthful unavailability: Trigger: any required current phase, source, Goal authority, custody,
  release or native capability check is missing, inconsistent, disposed or unavailable. Inputs RunRevocationCurrent
  and ReadStopInput; results CombinedStopReadResult and ExecutionRevocationMethodResult. Positive: Return the existing
  unavailable outcome for the limited fact that cannot be proved; the independent original Goal Stop stays effective,
  and a missing source never enables execution. Negative: Reject fabricated original material, a permanent retention
  mandate, an invented current phase and a lower success. Evidence: Compiled as a stated rule only; instances NOT_RUN;
  native NOT_RUN.'
- 'V8-STOP-N1 D06 separation: NativeExecutionRevocationResult and slot custody never validate as, substitute for
  or are header-cast to a D06 StopSource, SchedulerStop, native RunOperationResult(operation=cancel), its PublicationOrigin
  or the real run control. Negative: Reject any Stop outcome that selects, activates or narrows owner.executor.native.record_cancellation.v1,
  fabricates a finished cancellation or presents an old D01 body as new current state; full cancellation, D06 and
  GRS-078 steps 5 onward return unavailable for v8 births. Evidence: Non-validation vectors against the D06 roots;
  a genuine cancellation route needs its own independently and root-reviewed source package for the issuer and native
  execution.'
- 'V8-STOP-N2 Goal Stop alone: GoalStoppedCurrentAcquisition is truthful in every actual slot phase and carries
  slot_revocation_assertion not_asserted_by_goal_stop_acquisition, a type distinction and never proof of native
  work. Negative: Reject execution_revoked or already_execution_revoked selected from Goal Stop alone, a Goal-only
  acquisition that depends on a future SlotRevision, SlotOrigin or lower return, and a reader that creates a Stop
  intent or receipt, latches Stop or invokes the lower writer. Evidence: Result-kind vectors for every slot phase;
  native NOT_RUN.'
- 'V8-STOP-N3 No stale admission or callback: The final admission check and capability invalidation are serialized
  with the slot transaction, and scheduler and executor adapters deny launches, new attempts and effects, wake or
  delay promotion into dispatch, queued or reserved handoffs and execution-bearing callbacks after Stop. Negative:
  Reject a capability checked before Stop that crosses the final handoff after it, a stale admission or callback
  accepted because its stored scheduler or attempt fact remains, a capability minted on restart before current Goal
  authority and slot issuance are reacquired, and missing or unavailable authority read as nonrevocation. Evidence:
  Interleaving and restart matrices as source vectors; actual native adapters and callbacks NOT_RUN.'
- 'V8-STOP-N4 No fabricated instances or originals: Only genuine originals and authentic native execution discharge
  an obligation. Negative: Reject a generated instance, fixture or schema-valid example presented as a discharged
  obligation or native success, a reconstructed historical NativeExecutionRevocationResult, and any WorkNode, WorkNodeControl,
  attempt, execution unit, effect, RunExecutionControl, RunOperationResult, scheduler inventory, SchedulerControl,
  SchedulerStop, Workflow body, Event or coordinator control created or changed by the limited candidate, including
  zeroed pending wakes, delays, reservations or unacknowledged dispatch facts. Evidence: TEST_ONLY labels on every
  synthetic value; instances NOT_RUN.'
- 'V8-STOP-N5 Idle phase, Event and durable roles: None of the seven obligations covers an idle coherent slot; the
  lower revocation input is held-only, released idle is readback-only, and the ordinary original Stop route at idle
  needs genuine native cancel and SchedulerStop sources that stay unavailable while owner.executor.native.record_cancellation.v1
  is dependency-only. The only durable Stop afterimages are the existing Slot, SlotRevision and SlotOrigin. Negative:
  Reject the limited revocation result offered as an ordinary StopResult, a goal_run.stopped or any other Event
  appended by the limited operation, and any new durable revocation family, header alias, audit stream, result or
  origin table or retention policy. Evidence: Static family and route census; native NOT_RUN.'
- 'V8-STOP-N6 Superseded lineage and issuer separation: Only the Stop root v2 is selected at Stop input and result
  positions; the slot issuer is owner.executor.workflow_source.record_stop.v1 and the lower revocation issuer is
  owner.executor.native.revoke_run_execution.v1. Negative: Reject selection of the superseded StopAcceptedPending
  or PendingStopSource of the combined guard root, or of the CombinedStopCurrentInput and CombinedStopResult of
  the original-start v7 root, at any position; either issuer impersonating the other; and a reader, including owner.executor.native.read_run_execution_revocation.v1
  and owner.executor.workflow_source.read_stop.v1, invoking the publication participant. Evidence: The zero-selection
  census of superseded-lineage.json and the participant joins of stop-native-participants.json; native NOT_RUN.'
validation_surfaces:
- Plans/workflow_combined_source_contracts/stop-protocol.md
- Plans/workflow_combined_source_contracts/stop-positive-route-obligations.json
- Plans/workflow_combined_source_contracts/stop-native-participants.json
- Plans/workflow_combined_source_contracts/schemas/workflow-combined-stop-execution-revocation.v2.schema.json
- Plans/workflow_combined_source_contracts/superseded-lineage.json
- Plans/workflow_combined_source_contracts/composition.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: ats-060_whole_combined_v8_family
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/workflow_combined_source_contracts
- Plans/workflow_standard_source_contracts/native-v8
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
gui_classification_reason: Original source, native authority/custody, schema, storage or passive consumer contract;
  no new visual presentation.
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-060, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/workflow_combined_source_contracts/stop-protocol.md, ContractName:Plans/workflow_combined_source_contracts/stop-positive-route-obligations.json, ContractName:Plans/workflow_combined_source_contracts/stop-native-participants.json, ContractName:Plans/workflow_combined_source_contracts/composition.json
