# Shard 046: GRS-087 — Source-level goal_run.replanned publication without Event admission: ProducerIntent, producer finalization, separate clocks and exact idempotency; registry row and payload unchanged (2026-09-25)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L8052-L8164

Source SHA256: `4e29386674ebd3cc904fa9217d066792a464e5a9d4a0e69ea5471709f26b59c2`

---

## GRS-087 — Source-level goal_run.replanned publication without Event admission: ProducerIntent, producer finalization, separate clocks and exact idempotency; registry row and payload unchanged (2026-09-25)

```yaml
plan_unit_id: GRS-087
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'owner.workflow.replan.append_original.v1 is the source-level writer of goal_run.replanned for an
  all_writers.v8 birth: its WholeOriginalEvent fixes that event_type, it is not installed, it has no public dispatch,
  and it is admitted only in the actual replan:native_applied phase. owner.workflow.replan.prepare.v1 durably issues
  ProducerIntent, grammar pm.workflow_replan.producer_intent.v1, before any effect. It freezes every original identity,
  time, actor, runtime, account, correlation and causal field, all twenty-four non-payload Event choices, every
  payload choice with optional-field presence, the intended graph and disposition refs, the requested and validated
  graph-patch snapshots and the applied-phase operation and owner; it holds no complete Event, producer semantic
  digest, applied snapshot or future application result. After genuine native application, owner.workflow.replan.finalize_producer.v1
  derives the complete twenty-five-field WholeProducerSubmission by copying every frozen choice unchanged and inserting
  only the applied graph patch and its requested, validated and applied history from actual native issuance, validates
  it, and records a ProducerFinalizationReceipt without appending or repeating native work; original output that
  cannot be proved refuses and is never rebuilt from hashes or current Goal text. The clocks stay separate. expected_goal_revision
  and goal_revision equal the unchanged current Goal revision as a freshness predicate, never a Goal mutation. expected_goal_run_revision
  is the actual before Workflow body and control revision and goal_run_revision its checked after revision, before
  plus one. The native run generation advances by checked u32 g+1 exactly once per applied structural Replan, in
  the native application transaction of EP-126, and refuses at g=4294967295. WorkGraph, run-control, WorkNodeControl
  and Workflow body and control revisions stay independent, and no alias, wrap, saturation or rounding repairs a
  mismatch. The idempotency key is pm.goal-runtime-event.v3: plus lowercase SHA-256 of RFC8785 JCS of ["pm.goal-runtime-event-idempotency.v3",
  scope_partition, "goal_run.replanned", project_id, goal_id, goal_revision, expected_goal_revision, expected_goal_run_revision,
  goal_run_revision, goal_run_id, replan_generation, new_workgraph_ref, next_action]; inner and outer keys are byte-equal,
  and the key bypasses neither original-operation uniqueness nor Goal and Workflow CAS. producer_semantic_digest
  keeps exactly the twenty-one fields of the Contracts_V0 EventRecord digest and covers the full payload with applied
  history; producer_full_sha256 binds all twenty-five producer fields and producer_intent_sha256 the whole intent,
  and an unequal whole producer refuses even where the semantic digest matches. At append, Storage assigns only
  sequence_id, observed_at_utc and persisted_at_utc, runs both SP-286 barriers and all-member first custody, resolves
  an equal original identity to its original Event and receipt and refuses a conflicting or unprovable one; a crash
  before AppendLink is reconciled from original Storage custody without a replacement receipt. The graph-patch governance
  projection derives only from that authentic Event and its applied record, and its projection target is not registered
  here and stays unavailable. ProducerIntent keeps RP-RUNTIME-365D under the original run-completion anchor and
  is never retained indefinitely. This is the Workflow Replan source work that DL-080 places before the goal_run.replanned
  Event Authority contract, not that contract. The registered goal_run.replanned row stays at family revision 2.0.0
  with payload pm.goal_runtime_event.goal_run_replanned.schema.v2 and is not selected here. The source payload identity
  goal_run_replanned_clock_split_20260921.v4 is a frozen external literal, not a registry selection or payload successor,
  and nothing in canon resolves it. An authentic append of a Replan Event therefore cannot be admitted until the
  Event contract work A3, which owns the goal_run.replanned, goal_run.blocked and goal_run.stopped contracts, their
  registry rows and payload successors, the reconciliation of this source envelope (which requires expected_goal_revision
  and allows parent_goal_id) with the goal_run v3 envelope, and whether the Runtime Replan action is rewired from
  goal.replanned to goal_run.replanned; each A3 change to a registered row needs its own DL-036 checkpoint approval.
  The source''s replanned payload envelope requires expected_goal_revision, allows parent_goal_id, and puts expected_goal_revision
  in its v3 idempotency key (replan/protocol.md). The goal_run v3 envelope that this document records for started,
  cancelled and certified requires expected_goal_run_revision, goal_run_revision and idempotency_key and has no
  expected_goal_revision or parent_goal_id. This edition does not reconcile them; A3 decides the goal_run.replanned
  v3 envelope. goal.replanned stays historical-only under GRS-070 and is never written by a Workflow Replan. The
  Replan consumer root is placed as source only and is not the mandatory run-history projector; that projection
  (GRS-085, SP-317) does not admit v8 births and still halts on same-run replanned. owner.workflow.replan.project.v1
  has no registered storage, and Replan release is unavailable until the consumer-adoption work A2 supplies the
  projection admission, so no Replan operation can complete its publication and release before A2 and A3 land. The
  Replan consumer, the started and cancelled combined-profile consumers and the projector, checkpoint, backfill
  and retention declarations are separate required work (A2). This version-scoped source applies only to a genuine
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
- GRS-086
- GRS-070
- DL-080
unblocks: []
acceptance_criteria:
- Preserve the complete scoped v8 source and every original entry/final/phase/type/lifetime predicate; compile no
  superseded Stop text as operative.
- Use the canonical realm bindings and exact external lineage tokens; prove the canonical inverse to the v3 source
  and the actual final acyclic commitment and descriptor hash graph.
- Native installation, authentic original source capabilities, execution, schema instances, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
- The registered goal_run.replanned row stays at 2.0.0 with its v2 payload; the source payload identity stays an
  unresolved external literal and is never read as a registry selection or payload successor.
- ProducerIntent precedes effect and finalization adds only the applied graph patch and its history; the idempotency,
  semantic, full and intent digests follow their exact domains, and unequal whole producers refuse.
- Replan release and projection stay unavailable until A2, and authentic append of the replanned Event stays unavailable
  until A3.
validation_surfaces:
- Plans/workflow_combined_source_contracts/protocol.md
- Plans/workflow_combined_source_contracts/stop-protocol.md
- Plans/workflow_combined_source_contracts/replan/protocol.md
- Plans/workflow_combined_source_contracts/installed-profile.json
- Plans/workflow_combined_source_contracts/composition.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: grs-087_whole_combined_v8_family
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

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-087, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/workflow_combined_source_contracts/protocol.md, ContractName:Plans/workflow_combined_source_contracts/replan/protocol.md, ContractName:Plans/workflow_combined_source_contracts/replan/methods.json, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Decision_Log.md#DL-080
