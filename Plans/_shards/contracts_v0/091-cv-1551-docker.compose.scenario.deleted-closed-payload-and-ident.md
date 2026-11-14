# Shard 091: CV-1551 — `docker.compose.scenario.deleted` closed payload and identity (newly authored, no admission)

Source: `Plans/Contracts_V0.md`

Source lines: L48608-L48664

Source SHA256: `4623d6a821793daf4f7eaeeecbb64981e0a86fcd21d2f483f414d14bebe1982f`

---

## CV-1551 — `docker.compose.scenario.deleted` closed payload and identity (newly authored, no admission)

```yaml
plan_unit_id: CV-1551
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Exactly docker.compose.scenario.deleted@1.0.0 uses Plans/event_payloads/w3h/docker_compose_scenario_deleted.schema.json#/$defs/payload
  under CRAU-1551; this is prepared payload materialization only. Original EventRecord/CV-317 envelope and CV-339
  full-value receipt recipes remain authoritative. The exact selected app edition, if any, has its own application.v1
  payload identity; no Project codec is relaxed. Registry membership remains absent.
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- CV-317
- CV-339
- CRAU-1551
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- docker.compose.scenario.deleted
- pm.event_payload.docker_compose_scenario_deleted.v1
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Contracts_V0.md
```

`docker.compose.scenario.deleted` has closed required fields `schema_id, schema_version, scope_kind, project_id, server_id, thread_id, owner_operation_id, source_record_ref, source_receipt_ref, scenario_id, compose_config_hash, scenario_revision_ref`. Its semantic owner is `Plans/Containers_Registry_and_Unraid.md#CRAU-1551`. Project payload identity is `pm.event_payload.docker_compose_scenario_deleted.v1@1.0.0`; application payloads are refused. The EventRecord’s payload_schema_id must equal the resolved payload’s schema_id; type, partition, Project/thread/Server, actor, source operation/result, applicable run/attempt and redaction all join the actual original accepted source. For external SP-337 payloads, `#/$defs/external_prepared_event` validates only the physical journal representation: null `payload` and the closed `payload_ref` descriptor (`ref`, `blake3_id`, `byte_size`, `media_type`). Reuse Storage’s `payload:v1:{blake3_hex}` address; independently verify descriptor-to-index/pack joins, BLAKE3 over the exact uncompressed encoded body, exact size and actual media before decoding. Materialize `#/$defs/logical_event` with the authenticated resolved object and the original descriptor’s `ref` string, preserving every other original envelope value. Validate that map against the unchanged EventRecord envelope and this family’s closed payload, then perform original source/identity/admission and CV-339 full-value validation. A physical descriptor or null is never substituted for the complete original payload in a receipt request or commitment. Inline `#/$defs/prepared_event` requires an object body and null reference. Physical encoding is SP-236; no alternative logical envelope, number/time codec or historical reencoding is introduced.

The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `docker.compose.scenario.deleted` and exact `scenario_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application input is refused for this Project-only family. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). The original source’s accepted time and producer sequence are frozen once; retry does not obtain a new clock/sequence/actor. Existing Project source hashes, CV-366 application semantic hashes, producer-semantic RFC 8785, SP-236 physical bytes, SP-337 payload IDs and CV-339 full-value commitments remain separate original-owner domains. Do not implement a new number/time codec. Phase 2 must bind the reviewed shared helper with authentic original-recipe dispatch; an unknown recipe cannot select a weaker reader.

Family-specific source predicates are scenario_project — scenario and original result belong to the exact Project; config_fingerprint — fingerprint equals the owner-computed resolved config hash, never env-file contents; validation — existing scenario validation succeeds before enabled action; scenario_effect — original result proves the deleted fact, not UI acceptance. Wrong primitive types, unknown keys, unresolvable refs, mismatched actual source, trailing controls or LF in IDs, contradictory before/after facts, wrong schema/edition and any new legacy alias fail closed. Source refs never grant access or authority by themselves. These predicates apply after all dependent helpers at final release; no source/body ref, receipt or matching self-attestation can replace actual owner custody. Exact original retries resolve retained facts before current-state transition checks, but current append cannot select replay-only history. The field-level negatives and isolation plan for this exact family are ATS-1270 and W3H-oracle-plan.json.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md#CRAU-1551, ContractName:Plans/storage-plan.md#SP-1551, ContractName:Plans/Contracts_V0.md#CV-317, ContractName:Plans/Contracts_V0.md#CV-339
