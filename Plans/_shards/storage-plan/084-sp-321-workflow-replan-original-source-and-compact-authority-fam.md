# Shard 084: SP-321 — Workflow Replan original source and compact authority families, durable release token and v8 version scope (2026-09-25)

Source: `Plans/storage-plan.md`

Source lines: L27107-L27261

Source SHA256: `4c37d8c13cc374848dcf7bd6354a78c873572c982377584a6bf913da09cdd586`

---

## SP-321 — Workflow Replan original source and compact authority families, durable release token and v8 version scope (2026-09-25)

```yaml
plan_unit_id: SP-321
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Register exactly thirty Workflow Replan original-source and compact authority families for all_writers.v8
  births: executor_workflow_replan_update; the eleven replacement source families workflow_replan_native_compile_source,
  workflow_replan_native_request_source, workflow_replan_certified_graph_source, workflow_replan_native_intake_source,
  workflow_replan_provisioning_receipt, workflow_replan_activation_decision_source, workflow_replan_completion_requirement_source,
  workflow_replan_born_worknode_record, workflow_replan_worknode_materialization_receipt, workflow_replan_installed_workgraph
  and workflow_replan_required_set; workflow_replan_source, workflow_replan_prepared, workflow_replan_producer,
  workflow_replan_native_application, workflow_replan_native_origin, workflow_replan_append_link, workflow_replan_completion,
  workflow_replan_completion_origin, workflow_replan_control and workflow_replan_release; workflow_replan_original_profile_enrollment,
  workflow_replan_manager_decision_authority, workflow_replan_graph_patch_issued_snapshot, workflow_replan_recovery_summary,
  workflow_replan_producer_finalization, workflow_replan_owner_issue_origin and workflow_replan_native_publication_origin;
  and executor_workflow_replan_observer_origin. Each versioned physical name and key prefix is <family_id>.v1 and
  each stored header is pm.storage_value.<family_id>.v1 at schema_version 1.0.0; the draft identities they replace
  are recorded in rename-map.json as lineage and are never stored or selected. Key components and their order are
  exactly those of physical-families.json: H is lowercase hex of the exact Unicode-scalar UTF-8 bytes without normalization,
  and decimal is canonical nonnegative decimal with no leading zeros except 0. Key inputs equal the authenticated
  invocation scope and every duplicated inner identity, the wrapper storage_instance_id equals the scope''s, and
  the physical_key is derived independently, compared byte for byte and checked for collision; on the compact Stored
  wrappers an unqualified scope field means record.scope. Two key shapes are kept as authored: executor_workflow_replan_update
  is keyed by decimal(revision), not by an operation, and executor_workflow_replan_observer_origin has no goal_id
  component. Each row carries inline the closed wrapper that physical-families.json names in the placed Replan source
  or observer root, with required_fields in that wrapper''s own order and a sibling reference to the same whole
  wrapper. Rows are materialized at tier later_gui_or_feature_projection, canonical_non_rebuildable with mandatory
  backup under BRS-031, and migrated only by the store coordinator with fail-closed ambiguity; materialized describes
  the specified physical contract, not native installation or an available writer. Encoding is json_canonical under
  pm.workflow.activation_source_json.v1, the codec SP-308 owns, named in each row''s replay_behavior; workflow_replan_native_publication_origin
  uses pm.executor.native_source_json.v1, which thirteen SP-308 rows already name. No new numeric or escaping codec
  is introduced. Only workflow_replan_control is mutable, by compare-and-swap on its full original beforeimage in
  the declared phase transaction; every other family is immutable original issuance, and unequal bytes under the
  same key conflict. Each row''s producer is an array of exact owner method IDs, never prose: the one issuing owner.workflow.replan
  method for most families; the issuer_method alternatives of the record, twelve and five, for workflow_replan_owner_issue_origin
  and workflow_replan_native_publication_origin; owner.workflow.replan.issue_graph_patch_request.v1, owner.workflow.replan.validate_graph_patch.v1
  and owner.workflow.replan.apply_native.v1 for workflow_replan_graph_patch_issued_snapshot, each issuing only its
  own phase snapshot; and for workflow_replan_control the nine Replan slot-phase writers of slot-transition-contracts.json,
  owner.workflow.replan.prepare.v1, owner.workflow.replan.apply_native.v1, owner.workflow.replan.append_original.v1,
  owner.workflow.replan.complete.v1, owner.workflow.replan.observe.v1, owner.workflow.replan.release.v1, owner.workflow.replan.reconcile.v1,
  owner.workflow.replan.finalize_producer.v1 and owner.workflow.replan.read_original.v1. A listed method never impersonates
  another, and the limited Stop revocation leaves the Replan control and its last phase unchanged. Publication order
  and recovery follow EP-126; source commitments never replace actual original issuance. workflow_replan_release
  stores the release read under source_read_token as the nine-field durable read token: a local DurableGenericToken
  in the Replan source root, equal to the canonical read_token without redb_snapshot_id (DL-076; the SP-278 amendment
  of 2026-09-24), which meets the read-selector rule of section 2.3.1. Every later read, recovery or disclosure
  forms the live ten-field token from the stored nine fields and the snapshot ID of its own actual read transaction
  and revalidates the whole token; no stored value supplies, rewrites or manufactures a snapshot ID, and no registered
  family''s whole record graph reaches redb_snapshot_id. Every row''s record is an external $ref, which the readiness
  checks do not follow for secrets or redb_snapshot_id, so that whole record-graph walk from every registered wrapper
  is package evidence, check C06 of the canonical-draft package in source_lineage, not a readiness result. ExactCurrentEventRead.read_token
  in the Replan source root, and GenericSnapshot.token and ReplanProjectResult.generic_token in the placed consumer
  root, are whole tokens of one live read and are never stored. The consumer''s source_token_at_birth and generic_token
  belong to its unregistered projection checkpoint and are left to that checkpoint''s adoption, with a Storage-owner
  ruling on their names under section 2.3.1; that question goes to the Storage owner before the consumer-adoption
  work A2 registers the checkpoint successor. All 294 previous Storage rows remain unchanged. All 27 retention policies
  remain exact. Twenty-nine families use RP-AUTHORITY-INDEFINITE; workflow_replan_producer uses RP-RUNTIME-365D
  under the original run-completion anchor. The eleven replacement source families are the Replan counterparts of
  SP-308''s eleven activation source families, workflow_native_compile_source through workflow_goal_run_required_set,
  with the same wrapper form, codec, retention and non-rebuildable class; they hold replacement values issued by
  their own owners and never rewrite an SP-308 row. workflow_replan_source, workflow_replan_prepared, workflow_replan_native_application,
  workflow_replan_native_origin, workflow_replan_append_link, workflow_replan_completion, workflow_replan_completion_origin,
  workflow_replan_control, workflow_replan_release and workflow_replan_producer_finalization follow SP-316''s compact
  issuance pattern of commitments, selectors, clocks and issuance metadata; the other families keep their complete
  closed typed values, and, as in SP-308, indefinite authority retention covers only the whole adopted value schema.
  ProducerIntent is a non-Event immutable choice source whose thirteen required fields carry content. ProducerIntent
  keeps RP-RUNTIME-365D because it carries the original Event and payload choices and the requested and validated
  patch snapshots, whereas goal_certified_event_intent keeps only commitments and selectors; once it expires, reconcile
  and full readback of that operation refuse, and no reference holds it. Twelve existing canonical_non_rebuildable
  rows with mandatory backup already use RP-RUNTIME-365D. workflow_replan_graph_patch_issued_snapshot keeps each
  complete requested, validated or applied WholeGraphPatch as original phase staging authority, not as a governance
  projection; the content-free graph-patch rule binds the compact native application record. Full mutable native
  bodies, full source, candidate, afterimage and readback unions, full producer submissions and raw Event frames
  are not stored here and keep their own owners and lifetimes; no reference creates a hold, extends a lifetime or
  permits reconstruction from hashes. The 24 transient-only definitions of physical-families.json, among them PrepareInput,
  NativeApplySource, AppliedNativeValues and WholeProducerSubmission, are never stored. Every mutated native graph,
  required-set, Workflow, node, run, result, origin and coordinator value is written in one authenticated native
  redb transaction domain and Storage instance; Event append and SP-286 first custody stay separately ordered and
  are not atomic with it. Source loss leaves reconciliation and readback unavailable. The governance_record.v1:{project_id}:graph_patch:{graph_patch_id}
  projection target, listed in this document''s Governance Runtime Record Storage section, is an unregistered template
  and is unavailable here. No projection or checkpoint family is registered: the Replan projection checkpoint the
  source authors is not a registry row, owner.workflow.replan.project.v1 has no registered storage, and owner.workflow.replan.release.v1,
  whose input requires the projection admission and an exact current Event read, is unavailable until separate projection
  adoption and the goal_run.replanned Event contract supply them, so a completed Replan operation stays held. The
  mandatory run-history projection of GRS-085 and SP-317 does not admit v8 births and still halts on same-run replanned.
  The certified v8 consumer, the Replan consumer, the started and cancelled combined-profile consumers and the projector,
  checkpoint, backfill and retention declarations are separate required work, as is the goal_run.replanned Event
  contract; the registered goal_run.replanned row stays at v2 and is not selected by this source. With SP-322''s
  four families the registry holds 328 families, and the readiness census is re-pinned in the same landing. This
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
- SP-319
- SP-308
- SP-278
- SP-316
- DL-076
- CV-354
unblocks: []
acceptance_criteria:
- Preserve the complete scoped v8 source and every original entry/final/phase/type/lifetime predicate; compile no
  superseded Stop text as operative.
- Use the canonical realm bindings and exact external lineage tokens; prove the canonical inverse to the v3 source
  and the actual final acyclic commitment and descriptor hash graph.
- Native installation, authentic original source capabilities, execution, schema instances, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
- Register exactly the thirty named rows with inline closed wrappers whose required order equals required_fields,
  exact pm.storage_value.<family_id>.v1 headers at 1.0.0, <family_id>.v1 key prefixes, producer arrays of exact
  owner method IDs, nonempty consumers and owner_doc Plans/storage-plan.md#SP-321; all 294 previous rows and 27
  policies stay byte-identical and the census is re-pinned in the same landing.
- A whole record-graph walk from every registered wrapper reaches no redb_snapshot_id, and source_read_token is
  the local nine-field DurableGenericToken.
- No projection or checkpoint family is registered; owner.workflow.replan.release.v1 stays unavailable until the
  projection admission and exact current Event read exist.
validation_surfaces:
- Plans/workflow_combined_source_contracts/physical-families.json
- Plans/workflow_combined_source_contracts/replan/protocol.md
- Plans/workflow_combined_source_contracts/replan/schemas/workflow-replan-source.v1.schema.json
- Plans/workflow_combined_source_contracts/composition.json
- Plans/storage_value_registry.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: sp-321_whole_combined_v8_family
implementation_surfaces:
- Plans/storage-plan.md
- Plans/storage_value_registry.json
- Plans/workflow_combined_source_contracts
- Plans/workflow_standard_source_contracts/native-v8
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
gui_classification_reason: Original source, native authority/custody, schema, storage or passive consumer contract;
  no new visual presentation.
```

ContractRef: ContractName:Plans/storage-plan.md#SP-321, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/workflow_combined_source_contracts/replan/protocol.md, ContractName:Plans/workflow_combined_source_contracts/physical-families.json, ContractName:Plans/workflow_combined_source_contracts/composition.json, ContractName:Plans/storage_value_registry.json
