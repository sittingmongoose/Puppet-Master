# Shard 035: EP-126 — Replan native-first application, graph-lock generation, D01 inventory observation and source-level release; Executor and D01 lower-owner obligations (2026-09-25)

Source: `Plans/Executor_Protocol.md`

Source lines: L8800-L8912

Source SHA256: `678a1f907845cb356373658edf4b70d5459d93076620cf539c03d4ee2921fe17`

---

## EP-126 — Replan native-first application, graph-lock generation, D01 inventory observation and source-level release; Executor and D01 lower-owner obligations (2026-09-25)

```yaml
plan_unit_id: EP-126
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'For a v8 birth Replan publication is native-first: the slot moves from replan:claimed through replan:prepared,
  replan:native_applied, replan:appended_held, replan:completed and replan:observed to idle, owner.workflow.replan.finalize_producer.v1
  and owner.workflow.replan.read_original.v1 republish it without a phase change, and owner.workflow.replan.reconcile.v1
  recovers only the same operation. At replan:prepared, owner.workflow.replan.apply_native.v1 and the materialization
  issuers owner.workflow.replan.source_born_worknode_record.v1, owner.workflow.replan.source_worknode_materialization_receipt.v1,
  owner.workflow.replan.source_installed_workgraph.v1 and owner.workflow.replan.source_required_set.v1 each consume
  their whole argument and rederive candidates from genuine sources, and the materializers run only inside that
  one native redb transaction. It rechecks every source, the settled release and effect census and old-generation
  invalidation, then publishes the Workflow body and control, graph and RequiredSet, the complete 24-field WorkNode
  and control changes and born members, materialization sources, receipts and origins, the applied graph-patch snapshot,
  the graph-lock receipt, the NativeApplicationRecord and its origin, the Replan control transition and the slot
  revision and origin. It appends no Event, calls no scheduler, verifier, provider or tool, and keeps no mutable
  body snapshot or raw Event in compact custody. Within it the run generation advances exactly once per applied
  structural Replan, by checked u32 g+1 through the original graph-lock owner; g=4294967295 refuses, nothing wraps
  or saturates, and the WorkGraph, run-control, WorkNodeControl and Workflow revisions stay independent clocks.
  Replan apply_native advances the checked u32 run generation via the original graph-lock owner (replan/protocol.md)
  and consumes a genuinely issued graph-lock capture and origin. The only graph-lock issuer, owner.executor.native.apply_graph_lock.v1,
  remains a complete dependency contract only (EP-117), and no v8 method map binds it. This edition activates nothing.
  Unless an owner unit states that the apply_native transaction itself performs the lock as that owner, genuine
  Replan native application is unavailable until the graph-lock owner''s participation is separately established.
  Producer finalization checks the native outputs, adds only the applied graph patch and its history, and coissues
  receipt, control and slot without repeating native work. The append link, control and slot advance only after
  an authentic Storage append, which is never cross-store atomic with native redb; a crash in that gap is reconciled
  from Storage custody without a second Event or replacement receipt. owner.workflow.replan.append_original.v1 and
  its goal_run.replanned Event belong to GRS-087 and cannot be admitted until the Event contract work A3. owner.workflow.replan.complete.v1
  writes the compact completion record and origin only after application and append are both proved. owner.workflow.replan.observe.v1
  is the separately installed D01 observer. While publication is pending the native census includes the born members
  and the earlier D01 observer is labelled before, never current. At observation it keeps every existing materialized,
  attempt and dispatch entry and appends exactly one materialized member per WorkNode born in the actual generation,
  checking identities, scope, source request, native keys and hashes, materialization receipt and origin and a monotonic
  registration_sequence against the originals, with no RequiredSet filtering and no new attempt or dispatch row.
  The D01 lower owner owner.executor.workflow_source.register_materialization.v1 consumes ReplanInventoryObservationInput,
  not a future coherent CurrentSource, and issues its MutationOrigin records in the same observer transaction, which
  coissues the Workflow update and head, inventory head, pointer, registration origins, the stored Replan observer
  origin, the Replan control and the slot revision and origin. D01 reapplies no native state, generation, attempt,
  effect or manager decision. owner.workflow.replan.release.v1 is specified at source level only. At replan:observed
  it rereads current Goal, Stop, permission, association, native and D01 state, the settled all-generation effect
  census, the required projection and the advancing SP-278 frontier, then issues the compact release receipt and
  returns the slot to idle in one native transaction. It clears only the publication fence and starts no attempt,
  provider or tool call, verifier, Usage charge or manager next action; at most one replan_applied wake per run
  and generation follows through its own owner. The stored receipt records its release read as the nine-field durable
  read token under source_read_token (DL-076), and every later read, recovery or disclosure forms the live ten-field
  token from the stored nine fields and the snapshot ID of its own actual read transaction and revalidates the whole
  token. Release cannot be admitted in this installation: its projection admission needs the consumer-adoption work
  A2 and its exact Event read needs A3, owner.workflow.replan.project.v1 has no registered storage, and a completed
  Replan operation stays held. Recovery uses only the originally claimed operation and surviving source lifetimes;
  compact facts never recreate a full source, native publication or Event read, unknown sources keep the operation
  fenced, an unknown native outcome never advances the generation, and recovery never repeats native application
  or effects or releases a partly verified operation. The Replan method map has public_dispatch false and is not
  installed. This version-scoped source applies only to a genuine fresh pm.executor.workflow_source.all_writers.v8
  Workflow birth and its pm.goal_run_certified.producer_source.v3 component. Workflows born under all_writers.v6
  or v7, and their editions, keep their closed scope; no existing birth is enrolled, cast or re-read as v8. The
  complete source is the files under Plans/workflow_combined_source_contracts/ and Plans/workflow_standard_source_contracts/native-v8/,
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
- EP-125
unblocks: []
acceptance_criteria:
- Preserve the complete scoped v8 source and every original entry/final/phase/type/lifetime predicate; compile no
  superseded Stop text as operative.
- Use the canonical realm bindings and exact external lineage tokens; prove the canonical inverse to the v3 source
  and the actual final acyclic commitment and descriptor hash graph.
- Native installation, authentic original source capabilities, execution, schema instances, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
- Native application publishes every native change, born member, materialization record, graph-lock receipt, application
  record, control and slot revision in one native transaction, advances the generation exactly once and appends
  no Event.
- The D01 observer preserves the whole previous inventory and appends exactly the born members; release stays unavailable
  until A2 and A3 supply its projection admission and exact Event read.
validation_surfaces:
- Plans/workflow_combined_source_contracts/replan/protocol.md
- Plans/workflow_combined_source_contracts/replan/methods.json
- Plans/workflow_combined_source_contracts/replan/schemas/workflow-replan-source.v1.schema.json
- Plans/workflow_combined_source_contracts/pending-source-boundaries.json
- Plans/workflow_combined_source_contracts/observer-physical-joins.json
- Plans/workflow_combined_source_contracts/slot-transition-contracts.json
- Plans/workflow_combined_source_contracts/composition.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: ep-126_whole_combined_v8_family
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

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-126, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/workflow_combined_source_contracts/protocol.md, ContractName:Plans/workflow_combined_source_contracts/replan/protocol.md, ContractName:Plans/workflow_combined_source_contracts/replan/methods.json, ContractName:Plans/workflow_combined_source_contracts/composition.json
