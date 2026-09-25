# Shard 034: EP-125 — Fresh all_writers.v8 before-birth installation; combined descriptor, birth-only enrollment, combined guard and exclusive operation slot, disjoint generation sources and the 323-occurrence successor map (2026-09-25)

Source: `Plans/Executor_Protocol.md`

Source lines: L8684-L8797

Source SHA256: `678a1f907845cb356373658edf4b70d5459d93076620cf539c03d4ee2921fe17`

---

## EP-125 — Fresh all_writers.v8 before-birth installation; combined descriptor, birth-only enrollment, combined guard and exclusive operation slot, disjoint generation sources and the 323-occurrence successor map (2026-09-25)

```yaml
plan_unit_id: EP-125
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'The genuine fresh installation registers the complete pm.executor.workflow_source.all_writers.v8
  static descriptor, Plans/workflow_combined_source_contracts/installed-profile.json, before original Workflow birth,
  with every method entry, owner participant, codec, source and physical selector and recovery, backup, deletion
  and hold boundary of the native, Start, Stop, Standard, certified and Replan maps and of combined.read_guard.v1,
  combined.birth.v1, combined.claim.v1, owner.executor.native.revoke_run_execution.v1 and owner.executor.native.read_run_execution_revocation.v1;
  an unknown or incompletely enrolled participant refuses birth. WorkflowBirth.writer_contract is the fixed v8 constant
  and installed_contract_digest is the digest in installed-profile-digest.txt, the SHA-256 of the entire sorted-key
  compact UTF-8 JSON serialization of the descriptor without prefix or trailing LF, the codec CV-352 states; the
  preimage excludes its own digest and all runtime values, and the digests of the external package are lineage only.
  Only genuine original birth installs v8: there is no late or old-birth enrollment and no caller-selected profile
  or phase. combined.read_guard.v1 reads, through the installed Storage handle, one native snapshot with the complete
  run-prefix and key census, birth selection, typed whole rows and original issuances; it needs no future result
  and does not depend on RunRevocationCurrent. combined.birth.v1 requires authentic Unborn in that census, takes
  the complete WorkflowBirthInput, the prebirth and Goal inputs, the exact descriptor bytes and the native owner,
  derives candidates without accepting a future WorkflowBirthResult, and in the one original native birth transaction
  coissues the birth, D01 issuance, the Start and association controls their owner requires, certified birth and
  empty control, Replan profile enrollment, the immutable combined Enrollment, Slot revision zero, immutable SlotRevision
  zero and SlotOrigin; a failed partial installation returns no enrolled Workflow. combined.claim.v1 runs under
  the per-Workflow exclusive native lock and slot compare-and-swap with an already existing native request identity,
  claims exactly one Replan or certified operation, queues or refuses a conflicting one, never creates a second
  live slot, and denies the claim on execution revocation or unavailable authority. GuardResult is a typed observation,
  never a capability, and no caller chooses its kind or phase. The current Slot equals the latest genuine journal
  record and previous_slot names the previous immutable revision; missing, contradictory, stale or unissued facts
  yield unavailable, and missing JSON never means idle. Idle is necessary but never sufficient for native work.
  The slot changes only through the operations of slot-transition-contracts.json, and every coordinator control
  hash change coissues Slot, SlotRevision and SlotOrigin in one native transaction. claim_origin_key is a deterministic
  key, never a future origin hash; revoked or recovering slots keep their operation and prior phase, and unknown
  state stays fenced. An Event append is separately durable and never cross-store atomic with a later slot or control
  update. Generation-zero and post-Replan current sources are disjoint and chosen by the native birth, installed
  graph and generation, never by the caller: generation zero keeps the original U1-U8, F and G rules with its no-structural-Replan
  U4, and post-Replan requires the complete immutable replacement values, owner origins, manager authority, installed
  graph and RequiredSet that generation-correspondence.json joins. The native WorkNode stays the closed 24-field
  record, and the 24 field correspondences and three source-only predicates of birth-native-correspondence.json
  are mandatory. The Start association stays immutable and apart from phase currentness. Certified append-first
  keeps the earlier D01 current until native commit coissues the new one, with dependent current action held until
  release; the certified append-first and Replan native-first orders are not interchangeable, and a cross-store
  failure keeps the real held phase. All 323 original occurrences in complete-method-occurrences.json keep their
  declarations, not deduplicated, with explicit successor treatment, and each additionally requires RunRevocationCurrent
  (EP-127); fresh registration uses the native-v7-derived v8 maps, and frozen native v6 stays lineage. native-v8/methods.json
  keeps the eighteen native-v7 method IDs, binding the bounded successful chain of owner.executor.native.admit_first_attempt.v1,
  owner.executor.native.capture_original_input.v1, owner.executor.native.begin_attempt.v1, owner.executor.native.submit_verification.v1,
  owner.executor.native.record_verified.v1 and owner.executor.native.complete_worknode.v1 as EP-122 and EP-124 do.
  No v8 map or occurrence names owner.executor.native.record_failed.v1, owner.executor.native.record_cancellation.v1,
  owner.executor.native.record_invalidation.v1 or owner.executor.native.apply_graph_lock.v1, which stay complete
  dependency contracts only under EP-117. General retries, repair execution, child execution, unknown effect owners,
  waivers and exceptions, whose route DL-081 approved but whose contract has not landed, and an unbound verifying
  writer remain unavailable. This version-scoped source applies only to a genuine fresh pm.executor.workflow_source.all_writers.v8
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
- EP-124
- EP-117
- EP-118
- EP-119
unblocks: []
acceptance_criteria:
- Preserve the complete scoped v8 source and every original entry/final/phase/type/lifetime predicate; compile no
  superseded Stop text as operative.
- Use the canonical realm bindings and exact external lineage tokens; prove the canonical inverse to the v3 source
  and the actual final acyclic commitment and descriptor hash graph.
- Native installation, authentic original source capabilities, execution, schema instances, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
- Only a genuine fresh birth installs v8; an old birth, late enrollment, caller-selected profile or phase, incomplete
  participant registration or partial birth transaction is refused without recapture or reinterpretation.
- Every one of the 323 occurrences keeps its original declaration and requires RunRevocationCurrent; no v8 map activates
  an EP-117 dependency-only method.
validation_surfaces:
- Plans/workflow_combined_source_contracts/installed-profile.json
- Plans/workflow_combined_source_contracts/new-original-methods.json
- Plans/workflow_combined_source_contracts/complete-method-occurrences.json
- Plans/workflow_combined_source_contracts/guard-acquisition-predicates.json
- Plans/workflow_combined_source_contracts/slot-transition-contracts.json
- Plans/workflow_combined_source_contracts/generation-correspondence.json
- Plans/workflow_combined_source_contracts/birth-native-correspondence.json
- Plans/workflow_standard_source_contracts/native-v8/methods.json
- Plans/workflow_combined_source_contracts/composition.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: ep-125_whole_combined_v8_family
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

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-125, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/workflow_combined_source_contracts/protocol.md, ContractName:Plans/workflow_standard_source_contracts/native-v8/protocol.md, ContractName:Plans/workflow_combined_source_contracts/installed-profile.json, ContractName:Plans/workflow_combined_source_contracts/composition.json
