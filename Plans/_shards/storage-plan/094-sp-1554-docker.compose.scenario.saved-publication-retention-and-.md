# Shard 094: SP-1554 — `docker.compose.scenario.saved` publication, retention and reader (newly authored, no admission)

Source: `Plans/storage-plan.md`

Source lines: L29758-L29826

Source SHA256: `01289a0415563a6f19b93fd2a9ec51339a31c42853763f5da4928ef090ad1480`

---

## SP-1554 — `docker.compose.scenario.saved` publication, retention and reader (newly authored, no admission)

```yaml
plan_unit_id: SP-1554
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Exactly docker.compose.scenario.saved@1.0.0 adopts SP-286/CV-339 full-value first-receipt custody,
  SP-278 complete generic-index reads and the adjacent per-family publication journal. Canonical state remains with
  CRAU-1554; the journal cannot reconstruct it. Retention is RP-AUTHORITY-INDEFINITE@1.0.0 under Card 1 G21; no
  registry admission or family checkpoint is granted.
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SP-278
- SP-286
- CRAU-1554
- CV-1554
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
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- docker.compose.scenario.saved
- ea_w3h_docker_compose_scenario_saved_publication
- RP-AUTHORITY-INDEFINITE
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/storage-plan.md
```

| Stored value for `docker.compose.scenario.saved` | Key | Schema | Producer | Consumers | Retention |
|---|---|---|---|---|---|
| `ea_w3h_docker_compose_scenario_saved_publication` | `ea_w3h_docker_compose_scenario_saved.v1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(owner_operation_id)}` | `Plans/event_payloads/w3h/docker_compose_scenario_saved.schema.json#/$defs/publication` | `storage.w3h.docker_compose_scenario_saved.append.v1@1.0.0` via original `ComposeScenarioController::saved` transaction | `storage.w3h.docker_compose_scenario_saved.recovery_read.v1@1.0.0` and original Storage backup/restore owner | `RP-AUTHORITY-INDEFINITE@1.0.0`, canonical original custody with the same event lifetime and pending/result/backup/hold protections |

This is a new canonical non-rebuildable publication journal, not another domain record or event registry row. The body transaction’s sole adapter prepares its complete original semantic event with source custody once; the owner source effect plus journal commit atomically or neither does. Admission/current writer/source/permission/Stop and expected-domain-currentness precede effects. The prepared entry has null receipt/commitment. SP-286’s actual durable append returns the exact first receipt and v2 original-value commitment; the journal CAS advances prepared→appended→settled without changing the prepared event. `appended` means original append is resolved, `settled` means the already accepted domain result plus event receipt are ready for its original acknowledgement. A lost response, stale journal CAS or restart only resolves the same complete original, never repeats its source effect. Dedupe absence, contradictory receipt/value, missing pack bytes or unresolved restore fences instead of accepting a new event. Only the actual original native owner may issue or enroll this journal; reference strings and fixture copies are insufficient. No existing owner effect is replayed from it.

The exact reader `storage.w3h.docker_compose_scenario_saved.recovery_read.v1@1.0.0` adopts SP-278’s complete CURRENT-selected source token and range under `CRAU-1554`. It is read-only original-result/restart inspection; **no family projector, projection, checkpoint key or durable advance exists**. Generic index CAS/rebuild stays SP-278-owned. A stored token cannot include redb_snapshot_id. Live transaction identity joins the nine durable fields after all helpers at release; healthy same-generation-but-changed-frontier, wrong instance/partition, stale coverage and degraded source cannot claim current results. A valid retained fact uses authentic original recipe/admission/value proof and survives live-state changes; current writer rules never run against historical originals.

Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G21` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. This canonical publication journal binds `RP-AUTHORITY-INDEFINITE@1.0.0` directly, with the same original event lifetime, deletion/tombstone visibility and hold/backup rules; `RP-EVENT-INDEX-SOURCE` remains a derived-index policy and is not used here. SP-286 receipt custody retains its own immutable policy. Pending accepted owner effects/results, unresolved original append/acknowledgement, required receipts, recovery anchors, live references, legal holds and backups independently fence journal cleanup. For Chat cardinality, the event and its publication are custody of one logical audit fact in its owning thread, not two independent counted histories; rollover preserves the complete original closure. Deletion hides content immediately under its owner even while a hold delays physical purge; a retained journal grants no body access or retention beyond that owner. Only an eligible settled original with all required dependency releases may be cleaned up under the selected canonical policy. Do not rebuild, evict as an index, remint an operation, or reconstruct a current body if original custody is missing; disclose unavailable and restore genuine mandatory-backup custody or fence.

Every stored part, including the complete journal wrapper, is measured in its declared physical encoding. Use existing SP-236 canonical MessagePack and SP-337 durable payload references for bodies above 16 KiB; externalize the event body before journal commit using this family schema’s `external_prepared_event`: unchanged non-body envelope fields, null inline `payload`, and the required closed `payload_ref` descriptor (`ref`, `blake3_id`, `byte_size`, `media_type`). The ref uses the existing `payload:v1:{blake3_hex}` route, not SHA-256 addressing. Its raw 64-character lowercase BLAKE3 id equals both the route suffix and the independently authenticated pack/index body id; `byte_size` equals the exact uncompressed SP-236 encoded body length, and `media_type` equals that body’s actual `application/msgpack` encoding. No field is trusted without original pack/index custody. Resolve bytes before decoding and validate the resulting complete logical event under CV-1554; CV-339’s full-value receipt/commitment always covers that authenticated complete original EventRecord, never the physical null or descriptor. At exactly 16,384 body bytes the inline route is allowed only if the complete physical journal also fits; 16,385 or more requires SP-337, and a smaller body may also be referenced to make the wrapper fit. Freeze the selected reference and complete logical original before committing preparation; retry/recovery cannot choose another representation or rewrite the original. If any required remaining wrapper still exceeds its own inline value limit, return the existing Storage unavailable/value-too-large route **before** the owner effect; never truncate, silently cap admitted semantic numbers or leave a mandatory oversized journal. Pack bytes and addressing metadata settle before referencing acknowledgement. This family authors no timestamp, numeric, physical codec or alternate source hash.

The actual Storage key must equal this table’s formula over the authentic `storage_instance_id`, `scope_partition` and original `owner_operation_id`; the publication’s `physical_key` must equal that actual key. Each copied instance/partition/operation/source-record/source-receipt field independently joins the original selected Storage/source custody and resolved event. The resolved `event_type` is exactly `docker.compose.scenario.saved`, and `payload_schema_id`, scope/Project/thread/Server, actor/account/run/attempt, original time/producer sequence and redaction/replay/migration facts match their respective original owners. Storage sequence/observed/persisted values match Storage’s own issued original, never caller copies. In prepared state only receipt and commitment are null; appended and settled require both genuine original values independently. Legal durable writes are absent→prepared, prepared→appended and appended→settled, with exact whole-prior-value CAS and immutable prepared event/source joins. Same-state recovery is a read-only resolution of the identical original. Skips, regressions, mutation of the frozen original and loss of unresolved custody are refused; eligible settled cleanup alone follows the canonical policy above. Withdrawal under append lock fences new preparation and pending append drains, preserves unresolved originals and permits only separately authorized retained-result inspection.

Backup settles owner source effect/result, the journal, actual seglog/packs, full-value receipt and generic-index recovery state coherently. Restore preserves original operation IDs, admitted editions, Stop/tombstones, pending originals and full-value identity; missing post-backup originals cannot be replaced by a new operation. Writer and reader withdrawal use the exact protocol of CRAU-1554, preserving canonical custody and truthful unavailable results; no replay dispatch or new family checkpoint is introduced. Tests and criteria remain phase-1 planning only.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md#CRAU-1554, ContractName:Plans/Contracts_V0.md#CV-1554, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/storage-plan.md#SP-337
