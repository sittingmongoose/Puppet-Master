# Shard 048: GRS-089 — Goal Stop in the combined route: independent current Goal Stop, GoalStoppedCurrentAcquisition, no stopped or blocked Event and no new restart route (2026-09-25)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L8267-L8360

Source SHA256: `4e29386674ebd3cc904fa9217d066792a464e5a9d4a0e69ea5471709f26b59c2`

---

## GRS-089 — Goal Stop in the combined route: independent current Goal Stop, GoalStoppedCurrentAcquisition, no stopped or blocked Event and no new restart route (2026-09-25)

```yaml
plan_unit_id: GRS-089
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'In the combined route the original Goal owner supplies the complete CurrentGoalStopArgument of
  EP-119, with its full source audit, current permission and capability, Stop intent and receipt, through the original
  native owners, and the host Stop row of GRS-073 stays the Goal Stop authority. Goal Stop and capability revocation
  are independent of Workflow cancellation and are not delayed while a complete Workflow cancellation source is
  absent. At ordinary idle the ordinary StopResult still needs its genuine native cancel and SchedulerStop sources,
  which this source does not supply. Every one of the 323 original method occurrences of the v8 source additionally
  requires RunRevocationCurrent, acquired only through owner.executor.native.read_run_execution_revocation.v1, and
  combined.claim.v1 cannot claim execution for a stopped Goal. The goal_execution_revoked branch of RunRevocationCurrent
  is the separately typed GoalStoppedCurrentAcquisition: independently genuine current Goal Stop with an actual
  current guard, truthful in every actual slot phase, including the first Stop on an unrevoked held Replan or certified
  slot and the already revoked, recovering and released or idle phases. Its slot_revocation_assertion=not_asserted_by_goal_stop_acquisition
  is a type distinction, never proof of native work, and it depends on no revoked slot, future SlotRevision or SlotOrigin,
  or lower return. execution_revoked additionally requires the immutable revoked SlotRevision and SlotOrigin and
  actual native invalidation, and already_execution_revoked is never selected from Goal Stop alone. The revocation
  reader creates no Stop intent or receipt, latches no Stop and invokes no revocation. The limited revocation of
  EP-127 neither latches nor clears Goal Stop, and neither recovery, a later D06 nor a coordinator release clears
  it or remints execution capability. After revocation no execution, dispatch, wake promotion, new attempt or effect,
  graph mutation or normal continuation or publication is admitted; readback, repeated Stop, original cancellation
  and effect cleanup and recovery of the exact held operation keep only their original narrow capabilities. Existing
  Goal restart, resume and new-run authority is governed by its original contract; this source adds no permanent
  ban and no restart route. Pause stays addressed by run ID and Abort is not a constant false permission. The Stop
  route may revoke a held certified slot without any certified release or cancellation being inferred; what then
  becomes of an already durable held goal_run.certified Event is not stated by the source and stays open, its Event
  side with the Event contract work A3. The limited revocation appends no Event: no goal_run.stopped or goal_run.blocked
  writer is added (A3), and the D-R21 transitions are unchanged. The D06 argument grammar is carried; its issuer
  owner.executor.native.record_cancellation.v1 is an unbound dependency whose EP-117 row still reads Complete dependency
  contract only; nothing in this installation activates it by implication; the Stop route rests on owner.executor.native.revoke_run_execution.v1
  as Stop review v3 accepted it. NativeExecutionRevocationResult never validates as a D06 StopSource, SchedulerStop
  or RunOperationResult(operation=cancel), and full cancellation and D06 are unavailable for v8 births. The original
  Workflow Goal cancellation of GRS-078 therefore cannot pass its step 5 (D05 then positive D06) for a v8 birth;
  its earlier Goal Stop latch is not delayed by that. This version-scoped source applies only to a genuine fresh
  pm.executor.workflow_source.all_writers.v8 Workflow birth and its pm.goal_run_certified.producer_source.v3 component.
  Workflows born under all_writers.v6 or v7, and their editions, keep their closed scope; no existing birth is enrolled,
  cast or re-read as v8. The complete source is the files under Plans/workflow_combined_source_contracts/ and Plans/workflow_standard_source_contracts/native-v8/,
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
- GRS-088
- GRS-073
- GRS-078
- EP-127
unblocks: []
acceptance_criteria:
- Preserve the complete scoped v8 source and every original entry/final/phase/type/lifetime predicate; compile no
  superseded Stop text as operative.
- Use the canonical realm bindings and exact external lineage tokens; prove the canonical inverse to the v3 source
  and the actual final acyclic commitment and descriptor hash graph.
- Native installation, authentic original source capabilities, execution, schema instances, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
- Goal Stop is acquired independently in every actual slot phase and is never delayed by absent Workflow cancellation;
  already_execution_revoked is never selected from Goal Stop alone.
- No goal_run.stopped or goal_run.blocked writer, D06 result, permanent ban or restart route is created, and GRS-078
  from step 5 (D05 then positive D06) onward stays unavailable for v8 births.
validation_surfaces:
- Plans/workflow_combined_source_contracts/protocol.md
- Plans/workflow_combined_source_contracts/stop-protocol.md
- Plans/workflow_combined_source_contracts/replan/protocol.md
- Plans/workflow_combined_source_contracts/installed-profile.json
- Plans/workflow_combined_source_contracts/composition.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: grs-089_whole_combined_v8_family
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/workflow_combined_source_contracts
- Plans/workflow_standard_source_contracts/native-v8
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
gui_classification_reason: Original source, native authority/custody, schema, storage or passive consumer contract;
  no new visual presentation.
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-089, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/workflow_combined_source_contracts/stop-protocol.md, ContractName:Plans/workflow_combined_source_contracts/stop-native-participants.json, ContractName:Plans/workflow_combined_source_contracts/stop-positive-route-obligations.json, ContractName:Plans/Executor_Protocol.md#EP-119
