# Shard 061: CV-354 — Whole all_writers.v8 schema roots, canonical identifiers and frozen literals, coordinator v2 successors, canonical realm bindings, method-root closure and descriptor digests (2026-09-25)

Source: `Plans/Contracts_V0.md`

Source lines: L23489-L23638

Source SHA256: `e7296553babef18b777b1c02e00867d34b4f2eb32874410a39ac9fc2b9f3ebd5`

---

## CV-354 — Whole all_writers.v8 schema roots, canonical identifiers and frozen literals, coordinator v2 successors, canonical realm bindings, method-root closure and descriptor digests (2026-09-25)

```yaml
plan_unit_id: CV-354
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Bind exactly the nineteen active whole v8 schema roots named in active-resource-ids.json: nine
  native successor roots under Plans/workflow_standard_source_contracts/native-v8/schemas/, and under Plans/workflow_combined_source_contracts/
  the combined guard, generation source, native WorkNode current and Stop workflow_combined_stop_execution_revocation.v2
  roots in schemas/, the coordinator, identity and append-phase v2 roots in coordinator/schemas/ and the Replan
  source, observer and consumer roots in replan/schemas/. Each identifier that carries a draft marker (a drafts
  namespace host, a draft method, constant or family prefix, or a draft date stamp) and that this installation owns
  is renamed once, to a .v1 identifier, as rename-map.json records with kind, draft identifier and draft version:
  the Replan roots become workflow_replan_source.v1, executor_workflow_replan_observer.v1 and goal_run_started_cancelled_replanned_consumer.v1;
  the twenty-seven Replan methods become owner.workflow.replan.<operation>.v1; Replan families become workflow_replan_<name>
  and executor_workflow_replan_update, with key prefixes <family_id>.v1 and stored headers pm.storage_value.<family_id>.v1;
  and owned constants take the recorded names, such as pm.workflow_replan.producer_intent.v1. Every other identifier
  stays byte-exact, including the sixteen other root identifiers, combined.read_guard.v1, combined.birth.v1, combined.claim.v1,
  owner.executor.native.revoke_run_execution.v1, owner.executor.native.read_run_execution_revocation.v1, both profile
  identifiers and every inherited v7 method identifier. The replanned payload identity goal_run_replanned_clock_split_20260921.v4,
  at five payload positions of the Replan source root, and the payload version constant pm.goal_runtime_event.goal_run_replanned.schema.v3.draft.20260921
  stay frozen external literals owned by the Event contract work A3: not renamed, resolved nowhere in canon, and
  neither a registry selection nor a payload successor. The argument schemas of owner.workflow.replan.{finalize_producer,
  append_original, complete, observe, read_original, reconcile, release, project}.v1 reach this frozen payload reference
  and cannot be compiled or validated in canon until A3''s payload successor replaces it. Outside rename, lineage,
  inverse and routing records and the lineage positions that keep external predecessor declarations and identities
  byte-exact (the complete_original_declaration values of complete-method-occurrences.json and the source_id values
  of whole-successor-lineage.json), which name draft identifiers only as recorded originals, no other draft marker
  occurs in a placed file. The roots goal_certified_event_coordinator.v2, goal_certified_event_identity.v2 and goal_certified_event_append_phase.v2
  are canon''s v1 roots with only the v1 identifiers of these three roots renumbered to v2 wherever they occur (138,
  7 and 5 substitutions), placed beside v1 without replacing it. The coordinator and producer successor method,
  participant and tuple maps keep every v7 declaration, key and canon declaration coordinate, change only schema-reference
  versions and, for producer methods, the profile and status, and add only combined, execution-revocation and status
  keys. Plans/goal_certified_event_coordinator_contracts/, Plans/goal_certified_producer_source_contracts/, Plans/goal_run_certified_consumer_contracts/
  and CV-352 are unchanged and keep their all_writers.v7 scope. The operative certified dependencies are canon''s
  Plans/goal_certified_event_coordinator_contracts/installed-profile.json and Plans/goal_certified_producer_source_contracts/native-v7/installed-profile.json,
  bound by Plans path and SHA-256; the external corrected coordinator and producer editions and the certified-v2
  edition are external-source-evidence lineage tokens only, and Plans/goal_certified_family_composition.json is
  not bound. Every $ref of a placed root and every method schema reference resolves to a placed root, to a canonical
  realm row whose path and SHA-256 match current canon, or to an allowlisted frozen literal, never by name, prefix,
  newest version, host path, network or realm merge. A schema reference whose document URI is the $id of one of
  the 19 placed roots resolves only in placed_roots, whatever realm field encloses it in a method, tuple, participant
  or occurrence map. In such a position the map''s realm value (native, coordinator, standard, event, current_d05_source,
  start_current_workflow_native_activation, combined_guard) records the realm name of the source declaration and
  selects no resolution realm; combined_guard is not a realm of this edition. The external predecessor references
  inside the byte-exact lineage positions are lineage coordinates and are not resolved. Plans/workflow_combined_source_contracts/resource-realms.json
  records realm file, realm, literal original URI and SHA-256 for each root pointer and method argument; it selects
  the realms of Plans/goal_certified_event_coordinator_contracts/resource-realms.json and the native_consumer, goal_consumer
  and filesafe_consumer realms of Plans/goal_run_cancelled_consumer_schema_resources.json, and no realm of Plans/executor_cancellation_schema_resources.json.
  No external bank, original copy, derived composition or validation namespace is placed or selected. original-reference-routing.json
  routes each original file reference to a Plans path with SHA-256 or to an external-source-evidence token with
  member path and SHA-256, and composition.json aliases resolve unchanged original text references, including those
  to the four byte-equal native-v7 maps, which stay at their native-v7 paths and are not copied. The literal file
  retrieval URIs of the cancel start-profile v7 root remain offline identities, as in CV-352. No second body is
  added for any $id: external v3 bodies, the two pre-correction certified-v2 v6 bodies, the prior Replan roots and
  validation derivatives stay external by SHA-256. The Replan source root defines its own DurableGenericToken, equal
  to the Replan consumer root''s, and stores it as ReleaseReceipt.source_read_token, so no stored Replan value holds
  a read token with redb_snapshot_id; it carries byte-equal local copies of the five helper definitions it used
  from the prior payload draft, repoints its projection-result reference to the placed consumer root and drops six
  unreferenced legacy physical wrappers. canonical-inverse.json classifies every difference from the external v3
  source as relocation, rename or recorded repair and inverts to that source structurally; the original hashes of
  preserved declarations still pin the external v3 bytes. The inherited GoalBodySelector names family goal_body
  with header pm.storage_value.goal_body.v1, which no Storage row registers, so it cannot resolve against the registry;
  this existing canon gap is kept unchanged and belongs to the Storage and Goal owners. StopAcceptedPending and
  PendingStopSource in the guard root and CombinedStopCurrentInput and CombinedStopResult in the original Start
  v7 root remain unselected lineage listed in superseded-lineage.json; only the Stop v2 root is selected at Stop
  input and result positions, and its NativeExecutionRevocationResult never validates as a D06 StopSource, SchedulerStop
  or RunOperationResult with operation cancel. The Replan consumer root is source only, not the mandatory run-history
  projector and selected by no registry row; its adoption, like a certified v8 consumer, is separate required work
  (the consumer-adoption work A2). All 323 original method occurrences keep their complete declarations. Closure
  counts come from the package''s actual reports: 2035 bound method schema positions over 240 whole roots, and an
  acyclic runtime commitment graph of 54 nodes and 67 edges beside the unchanged original commitment domains. The
  all_writers.v8 descriptor Plans/workflow_combined_source_contracts/installed-profile.json and the producer_source.v3
  descriptor Plans/workflow_combined_source_contracts/producer/installed-profile.json bind members by Plans path,
  SHA-256 and bytes and use the CV-352 codec, SHA-256 of the entire sorted-key compact UTF-8 JSON serialization
  without prefix or trailing LF; their digests, recorded in the installed-profile-digest.txt beside each, are 7b22c1f471761caffd37319dd0ae4f5da07c5f3e6f5ac83828d07308df5aaf8b
  and 1157877714ff6c1ebf799610e696e0af92f43a2fba5902ce5535552007339548. WorkflowBirth.installed_contract_digest
  and the combined Enrollment installed_descriptor_sha256 equal the v8 digest, and installed_descriptor_bytes_base64
  carries exactly that serialization of the v8 descriptor. Neither descriptor hashes its own digest, runtime values
  or an enclosing future digest; the v8 descriptor binds the producer digest. The producer descriptor binds canon''s
  transformed ninety-field map Plans/goal_certified_producer_source_contracts/whole-field-bindings.json, as CV-352
  requires for v7. External package digests are lineage only. source-citations.json and owner-sources.json record
  relied-on owner passages and documents by whole_sha256_at_base with their base commit, never as live pins. Whole
  schema and value carriers confer no authority. This version-scoped source applies only to a genuine fresh pm.executor.workflow_source.all_writers.v8
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
- CV-352
- EP-125
- GRS-086
unblocks: []
acceptance_criteria:
- Preserve the complete scoped v8 source and every original entry/final/phase/type/lifetime predicate; compile no
  superseded Stop text as operative.
- Use the canonical realm bindings and exact external lineage tokens; prove the canonical inverse to the v3 source
  and the actual final acyclic commitment and descriptor hash graph.
- Native installation, authentic original source capabilities, execution, schema instances, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
- Every $ref of the nineteen roots and every method schema reference resolves to a placed root, a canonical realm
  row with matching path and SHA-256, or an allowlisted frozen literal; a bank copy, validation namespace, second
  body for an $id, cross-realm merge, host or network fallback or newest-same-ID substitution is refused.
- Draft markers remain only at the six frozen-literal positions, in rename, lineage, inverse and routing records
  and in the byte-exact lineage positions of complete-method-occurrences.json and whole-successor-lineage.json;
  neither frozen literal is resolved, registered or read as a payload successor, and the v1 coordinator roots, the
  v7 family directories and CV-352 are unchanged.
- Both descriptors reproduce under the CV-352 codec with every member current at the landing base, and every stated
  closure count equals the actual package report it comes from.
validation_surfaces:
- Plans/workflow_combined_source_contracts/active-resource-ids.json
- Plans/workflow_combined_source_contracts/rename-map.json
- Plans/workflow_combined_source_contracts/resource-realms.json
- Plans/workflow_combined_source_contracts/method-root-bindings.json
- Plans/workflow_combined_source_contracts/original-reference-routing.json
- Plans/workflow_combined_source_contracts/canonical-inverse.json
- Plans/workflow_combined_source_contracts/superseded-lineage.json
- Plans/workflow_combined_source_contracts/installed-profile.json
- Plans/workflow_combined_source_contracts/producer/installed-profile.json
- Plans/workflow_combined_source_contracts/composition.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: cv-354_whole_combined_v8_family
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/workflow_combined_source_contracts
- Plans/workflow_standard_source_contracts/native-v8
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
gui_classification_reason: Original source, native authority/custody, schema, storage or passive consumer contract;
  no new visual presentation.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-354, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/Contracts_V0.md#CV-352, ContractName:Plans/workflow_combined_source_contracts/protocol.md, ContractName:Plans/workflow_combined_source_contracts/installed-profile.json, ContractName:Plans/workflow_combined_source_contracts/resource-realms.json, ContractName:Plans/workflow_combined_source_contracts/rename-map.json, ContractName:Plans/workflow_combined_source_contracts/composition.json
