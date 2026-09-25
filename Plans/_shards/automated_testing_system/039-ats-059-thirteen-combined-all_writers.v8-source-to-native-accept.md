# Shard 039: ATS-059 — Thirteen combined all_writers.v8 source-to-native acceptance facets, status-field check reading and truthful NOT_RUN boundaries (2026-09-25)

Source: `Plans/Automated_Testing_System.md`

Source lines: L5305-L5516

Source SHA256: `a264c124b39b9aed1aca93380904bcb6b96837411fbc07a720d7277d7652e8f1`

---

## ATS-059 — Thirteen combined all_writers.v8 source-to-native acceptance facets, status-field check reading and truthful NOT_RUN boundaries (2026-09-25)

```yaml
plan_unit_id: ATS-059
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'Acceptance of the combined all_writers.v8 source covers thirteen separate facets V8-CF-01 through
  V8-CF-13: static checks judged by status field; birth-only installation and Unborn; complete guard census; exclusive
  claim; slot triple coissue; disjoint generation branches; the eight ordered Replan phases; D01 inventory observation;
  certified append-first under the combined guard; recovery fencing; physical key, header, route and durable read-token
  exactness; commitment acyclicity and descriptor digests; and v7 non-admission of v8 births. Every facet needs
  complete positive and negative whole values with their canonical source coordinates and exact expected outcomes.
  Static schema, reference, inverse and mapping checks establish source shape only. A check is judged only by the
  status field it writes and by the counts of its own actual report: its exit code is not evidence, because the
  external source scripts exit 0 on FAIL, and a field that a script writes as a fixed literal instead of computing
  it is not evidence either. The frozen external diagnostic original-bank-checks.json is recorded as a known stale
  diagnostic and is not regenerated: a re-run of its script appends two banks that the frozen output omits, after
  which the external Stop review check reports a hash and bytes FAIL on that member while still exiting 0. It is
  not a placed canonical file and writes no status field, so it is evidence for no facet. Synthetic source-equality
  snapshots, deterministic reducers and in-memory transaction adapters must be labeled TEST_ONLY and cannot establish
  authentic owner issuance, production native transactions, codec, durability, recovery, Event depth or readiness.
  Native installation, capability authentication and execution are NOT_RUN, and so are real source acquisition,
  transaction interruption, crash and compare-and-swap, expiry, hold, deletion, backup and restore evidence until
  separately executed. This version-scoped source applies only to a genuine fresh pm.executor.workflow_source.all_writers.v8
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
- ATS-057
- CV-354
- SP-322
unblocks: []
acceptance_criteria:
- Preserve the complete scoped v8 source and every original entry/final/phase/type/lifetime predicate; compile no
  superseded Stop text as operative.
- Use the canonical realm bindings and exact external lineage tokens; prove the canonical inverse to the v3 source
  and the actual final acyclic commitment and descriptor hash graph.
- Native installation, authentic original source capabilities, execution, schema instances, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
- 'V8-CF-01 Static checks judged by status field: Re-run the external v8 source checks, both Stop checks included,
  on the canonical edition with their expectations mapped through rename-map.json, together with the canonical-draft
  package checks of inverse, draft markers, host paths, reference resolution, durable-token reachability, registry
  rows, collisions, descriptors, path case and citations; each passes by the status field it writes, with the counts
  of its own actual report. Negative: Reject a pass inferred from exit code 0, a status or count field that the
  script writes as a fixed literal, a count copied from an earlier report, a check run on the external edition in
  place of the canonical one, and the stale original-bank diagnostic read as a verdict. Evidence: Status-bearing
  outputs pinned by SHA-256 in the landing evidence are static only; repository validators run at landing; native
  NOT_RUN.'
- 'V8-CF-02 Birth-only installation and Unborn: Before the genuine original Workflow birth every method entry, owner
  participant, codec, source and physical selector and recovery, backup, deletion and hold boundary is registered
  under the complete static descriptor; combined.read_guard.v1 proves Unborn as the authentic absence of a native
  Workflow birth and of every combined enrollment, slot and coordinator record in one census; combined.birth.v1
  coissues the original birth, D01 issuance, required Start and association controls, certified birth and empty
  control, Replan enrollment, immutable Enrollment, Slot revision zero, SlotRevision zero and SlotOrigin in one
  native birth transaction, with WorkflowBirth.writer_contract the fixed v8 constant and installed_contract_digest
  the canonical descriptor digest. Negative: Reject late enrollment, enrollment of an existing v6 or v7 birth, enrollment
  from a missing coordinator row, JSON metadata, a restored absence, a missing key or a later Replan request, a
  caller-selected profile or phase, a future WorkflowBirthResult offered as a preexisting source, and a partial
  installation returned as enrolled. Evidence: Whole birth-input and census vectors against the placed roots; genuine
  prebirth registration and the native birth transaction NOT_RUN.'
- 'V8-CF-03 Guard census: combined.read_guard.v1 acquires one native Storage snapshot through the installed Storage
  handle, holding the complete run-prefix and key census, the native birth selection, typed whole rows, every immutable
  SlotRevision and SlotOrigin, the current Slot and the relevant coordinator controls and releases from one storage
  instance, database and snapshot; the current Slot equals the latest genuine journal record, previous_slot names
  the previous immutable revision, and idle is proved only by birth genesis or the complete released slot chain.
  Negative: Reject a missing, contradictory, stale, unissued or incomplete fact returned as anything but unavailable,
  missing JSON read as idle, a GuardResult used as a capability or given a kind or phase by the caller, a guard
  read that depends on a future guard result, intent, application, Event or release, and idle taken as sufficient
  for native work without every original source and current Goal, Start and effect guard. Evidence: Complete positive
  and negative census vectors; actual native Storage acquisition NOT_RUN.'
- 'V8-CF-04 Exclusive claim: combined.claim.v1 runs under the native per-Workflow exclusive lock and slot compare-and-swap,
  checks RunRevocationCurrent, and claims exactly one Replan or certified operation whose native request identity
  exists before the claim; certified identity derivation and its producer source query occur inside that claimed
  operation. Negative: Reject a second live slot, a claim that selects the other family, a claim for a stopped Goal
  or under unavailable revocation authority, and a claim that depends on a future Event or coordinator identity,
  prepared result or ProducerIntent; a conflicting operation queues natively or fails with conflict. Evidence: Contention
  vectors as source values; the actual lock, compare-and-swap and native queue NOT_RUN.'
- 'V8-CF-05 Slot triple coissue: Every coordinator control hash change, including Replan producer finalization and
  full-readback verification when the phase name stays the same, coissues the matching Slot, immutable SlotRevision
  and SlotOrigin in the same native transaction, deriving source and candidates, then the Slot and SlotRevision,
  then the SlotOrigin that selects both afterimages; claim_origin_key is the deterministic key, never the future
  origin hash. Negative: Reject a control change without its slot triple, a slot or origin self-hash, an overwritten
  mutable head named as previous_slot, a slot change by an operation that slot-transition-contracts.json does not
  list, and an Event append presented as atomic with a later native slot or control update. Evidence: Transition-table
  walk and chronology witnesses; native transaction and crash evidence NOT_RUN.'
- 'V8-CF-06 Disjoint generation branches: The native birth, installed graph and generation select the generation-zero
  or the post-Replan branch of the combined generation source; generation zero keeps the unchanged original requirement
  sources and the U1-U8, F and G rules with the no-structural-Replan rule U4 inside it; post-Replan uses the immutable
  replacement values, owner origins, installed graph and RequiredSet with every join of generation-correspondence.json;
  all 24 source-to-native field equalities and the three source-only predicates of birth-native-correspondence.json
  hold. Negative: Reject a caller-selected branch, the old seven-input branch chosen to avoid replacement provenance,
  a post-Replan tag chosen to avoid original source requirements, a reconstructed historical physical value, a demanded
  durable archive of previous mutable native bodies, and a RequiredSet that hides old members, failures or effects.
  Evidence: Whole branch vectors; native generation reads NOT_RUN.'
- 'V8-CF-07 Eight ordered Replan phases: owner.workflow.replan.prepare.v1, owner.workflow.replan.apply_native.v1,
  owner.workflow.replan.finalize_producer.v1, owner.workflow.replan.append_original.v1, owner.workflow.replan.complete.v1,
  owner.workflow.replan.observe.v1, owner.workflow.replan.read_original.v1 with its required projection, and owner.workflow.replan.release.v1
  run in that order, the publication control advancing by owner compare-and-swap from prepared through native_applied,
  append_verified, observer_verified and whole_verified to released; ProducerIntent is issued before effect; apply_native
  publishes every native change, the applied graph-patch snapshot, the graph-lock receipt, the compact NativeApplicationRecord
  and its origin, the control transition and the slot triple in one native transaction and advances the checked
  u32 generation to g+1 exactly once; finalization adds only the applied graph patch and its history; completion
  follows proved native application and append. Negative: Reject an Event append or a scheduler, verifier, provider
  or tool call inside the native transaction, a future applied history, Event, completion or release in the prepare
  input, a wrapped, saturated or repeated generation advance and any outcome for g=4294967295 but refusal, a phase
  before its predecessor, activation of a dependency-only EP-117 method by implication, and a release that grants
  an attempt, provider or tool call, verifier, Usage charge or more than one replan_applied wake per run and generation.
  Evidence: Ordered phase witnesses and every crash and refusal point as source vectors. An authentic append of
  a Replan Event cannot be admitted until the Event contract work A3, owner.workflow.replan.project.v1 has no registered
  storage, and Replan release is unavailable until the consumer-adoption work A2 supplies the projection admission,
  so a completed Replan operation stays held; native transactions NOT_RUN.'
- 'V8-CF-08 D01 inventory observation: The D01 register_materialization owner consumes ReplanInventoryObservationInput,
  preserves every previous materialized, attempt and dispatch entry, appends exactly one MaterializedMember per
  born WorkNode of the actual native generation with a monotonically assigned registration_sequence, and issues
  its registration origins in the same observer transaction as the Workflow update, Workflow head, inventory head,
  pointer, observer origin, Replan control and slot triple. Negative: Reject RequiredSet filtering, new attempt
  or dispatch rows, a future coherent CurrentSource as observer input, the before-observer presented as an after-native
  census, a reapplied native body, generation, attempt, effect or manager decision, and observation before authentic
  append and completion. Evidence: Whole before and after inventory vectors; the D01 native observer transaction
  NOT_RUN.'
- 'V8-CF-09 Certified append-first under the combined guard: Claim the certified slot, derive identity and producer
  source inside that operation, prepare candidates, arm intent, control and slot, then complete the original Storage
  append of the held Event before the native certification transaction publishes the Standard and Workflow receipt,
  native, D01, result, origin, control and slot; readback_held follows native_committed and precedes release and
  the idle slot; v8 births publish through the v2 coordinator, identity and append-phase roots placed beside v1.
  Negative: Reject the Replan native-first order under the guard, readback_held from Event durability alone, certification
  or an Event reissued after a cross-store failure, and a held-phase source read used as public certification or
  action authority. Evidence: Phase witnesses and an interruption matrix as source vectors; native append and certification
  NOT_RUN.'
- 'V8-CF-10 Recovery fencing: Recovery completes only the exact originally claimed operation from its native transactions
  and surviving original sources: an unknown native outcome is reconciled from the complete atomic transaction,
  a missing finalization, link, completion or observer is issued only for the same original, an existing release
  receipt returns unchanged, revoked or recovering slots keep their operation and prior phase, and a Replan operation
  lacks control only where the journal proves revocation or recovery before prepare. Negative: Reject a new identity
  used to evade conflict, a generation advance on an unknown result, a source body, native publication or Event
  read rebuilt from compact commitments or hashes, a second effect invocation, new custody, release of a partly
  verified operation, recovery that clears Stop, and missing data read as absence, idle or nonrevocation. Evidence:
  Crash-point vectors for every row of the Replan crash and refusal table; real crash, restart and recovery NOT_RUN.'
- 'V8-CF-11 Physical key, header, route and durable token exactness: Each of the 34 appended Storage registry rows
  carries its canonical family_id, an inline closed wrapper with a sibling $ref, required_fields in value_schema.required
  order, non-empty producer and consumers arrays and encoding json_canonical with its source codec named in replay_behavior;
  every physical key is derived byte for byte from its exact field paths, with reversible lowercase hex of exact
  UTF-8, canonical nonnegative decimal and no normalization; stored headers are pm.storage_value.<family_id>.v1,
  including pm.storage_value.workflow_combined_slot_origin.v1; the eleven v8 stored-profile routes and the header
  decisions equal native-v8/stored-profile-routes.json and physical-header-decisions.json; workflow_replan_release
  stores source_read_token as the local nine-field DurableGenericToken. Negative: Reject a draft marker, the pre-correction
  slot-origin header that lacks the underscore between slot and origin, any stored value that reaches redb_snapshot_id
  (DL-076), a stored token field not named read_token or *_read_token, a persisted transient ten-field read token,
  unequal immutable same-key bytes, a mutable slot or control write without full beforeimage and owner compare-and-swap,
  a schema URI or method name alone selecting a stored role, any registered projection or checkpoint row, and any
  change to the 294 existing rows or the 27 retention policies. Evidence: Row checks, the whole-graph token reachability
  walk and key recomputation are static; codec, durability and native Storage NOT_RUN.'
- 'V8-CF-12 Commitment acyclicity and descriptor digests: Runtime source, candidate, native output, origin, producer,
  Event, append link, completion, observer, readback, release and Stop commitments follow the acyclic domains and
  order of runtime-commitment-dag.json and combined-commitment-domains.json; the descriptor preimage excludes its
  own digest and every runtime value; both descriptors reproduce under the CV-352 codec, the SHA-256 of the sorted-key
  compact UTF-8 JSON serialization without prefix or trailing LF, as 7b22c1f471761caffd37319dd0ae4f5da07c5f3e6f5ac83828d07308df5aaf8b
  for all_writers.v8 and 1157877714ff6c1ebf799610e696e0af92f43a2fba5902ce5535552007339548 for producer_source.v3;
  the bound certified coordinator and producer native-v7 descriptors match their canon digest files; every bound
  canon member hash is current at the landing base. Negative: Reject a future-result or return-hash cycle, a candidate
  hash taken as proof of issuance, a descriptor that hashes an enclosing future digest, the external edition file-bytes
  digest used as the canonical digest, a stale member hash, and installed_descriptor_bytes_base64 bytes other than
  the canonical serialization. Evidence: Independent recomputation of the graph and both digests; the digests commit
  static source only and prove no registration, installation or native birth, which remain NOT_RUN.'
- 'V8-CF-13 v7 non-admission of v8 births: The v7 certified family of EP-124, GRS-084, GRS-085, SP-316 and SP-317,
  the certified v7 consumer and every v6 or v7 birth keep their closed scope; the certified values of v8 births
  use the seven goal_certified_event_* physical names, headers and keys under the v2 roots, and their Storage admission
  for v8 births is unavailable until a separate Storage revision; SP-316 is unchanged. Negative: Reject a v8 birth
  cast into the v7 consumer or the SP-316 and SP-317 rows by matching fields, Event type, URI alias or validation
  namespace, a v6 or v7 birth enrolled or re-read as v8, and a v8 birth admitted to the mandatory run-history projection.
  Evidence: Scope-negative vectors. The certified v8 consumer, the Replan consumer, the started/cancelled combined-profile
  consumers and the projector, checkpoint, backfill and retention declarations are separate required work (A2);
  the mandatory run-history projection (GRS-085, SP-317) does not admit v8 births and still halts on same-run replanned.'
validation_surfaces:
- Plans/workflow_combined_source_contracts/protocol.md
- Plans/workflow_combined_source_contracts/replan/protocol.md
- Plans/workflow_standard_source_contracts/native-v8/protocol.md
- Plans/workflow_combined_source_contracts/installed-profile.json
- Plans/workflow_combined_source_contracts/canonical-inverse.json
- Plans/workflow_combined_source_contracts/composition.json
- Plans/storage_value_registry.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: ats-059_whole_combined_v8_family
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

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-059, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/workflow_combined_source_contracts/protocol.md, ContractName:Plans/workflow_combined_source_contracts/replan/protocol.md, ContractName:Plans/workflow_standard_source_contracts/native-v8/protocol.md, ContractName:Plans/workflow_combined_source_contracts/composition.json
