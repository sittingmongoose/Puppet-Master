# Shard 096: SP-1556 — `execution_window.invalidated` publication, retention and reader (newly authored, no admission)

Source: `Plans/storage-plan.md`

Source lines: L29886-L29952

Source SHA256: `627014d3d6815999052c84ae5e77051ccd2bccbe06dc3bb9d637529476a07e4d`

---

## SP-1556 — `execution_window.invalidated` publication, retention and reader (newly authored, no admission)

```yaml
plan_unit_id: SP-1556
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Exactly execution_window.invalidated@1.0.0 adopts SP-286/CV-339 full-value first-receipt custody,
  SP-278 complete generic-index reads and the adjacent per-family publication journal. Canonical state remains with
  SQR-1556; the journal cannot reconstruct it. Retention is RP-AUTHORITY-INDEFINITE@1.0.0 under Card 1 G18; no registry
  admission or family checkpoint is granted.
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SP-278
- SP-286
- SQR-1556
- CV-1556
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
- execution_window.invalidated
- ea_w3h_execution_window_invalidated_publication
- RP-AUTHORITY-INDEFINITE
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/storage-plan.md
```

| Stored value for `execution_window.invalidated` | Key | Schema | Producer | Consumers | Retention |
|---|---|---|---|---|---|
| `ea_w3h_execution_window_invalidated_publication` | `ea_w3h_execution_window_invalidated.v1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(owner_operation_id)}` | `Plans/event_payloads/w3h/execution_window_invalidated.schema.json#/$defs/publication` | `storage.w3h.execution_window_invalidated.append.v1@1.0.0` via original `SchedulingService::execution_window_invalidated` transaction | `storage.w3h.execution_window_invalidated.recovery_read.v1@1.0.0` and original Storage backup/restore owner | `RP-EVENT-INDEX-SOURCE@1.0.0`, coupled only to this event’s `RP-AUTHORITY-INDEFINITE@1.0.0` and actual holds |

This is a new canonical non-rebuildable publication journal, not another domain record or event registry row. The body transaction’s sole adapter prepares its complete original semantic event with source custody once; the owner source effect plus journal commit atomically or neither does. Admission/current writer/source/permission/Stop and expected-domain-currentness precede effects. The prepared entry has null receipt/commitment. SP-286’s actual durable append returns the exact first receipt and v2 original-value commitment; the journal CAS advances prepared→appended→settled without changing the prepared event. `appended` means original append is resolved, `settled` means the already accepted domain result plus event receipt are ready for its original acknowledgement. A lost response, stale journal CAS or restart only resolves the same complete original, never repeats its source effect. Dedupe absence, contradictory receipt/value, missing pack bytes or unresolved restore fences instead of accepting a new event. Only the actual original native owner may issue or enroll this journal; reference strings and fixture copies are insufficient. No existing owner effect is replayed from it.

The exact reader `storage.w3h.execution_window_invalidated.recovery_read.v1@1.0.0` adopts SP-278’s complete CURRENT-selected source token and range under `SQR-1556`. It is read-only original-result/restart inspection; **no family projector, projection, checkpoint key or durable advance exists**. Generic index CAS/rebuild stays SP-278-owned. A stored token cannot include redb_snapshot_id. Live transaction identity joins the nine durable fields after all helpers at release; healthy same-generation-but-changed-frontier, wrong instance/partition, stale coverage and degraded source cannot claim current results. A valid retained fact uses authentic original recipe/admission/value proof and survives live-state changes; current writer rules never run against historical originals.

Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G18` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The publication value below adopts RP-EVENT-INDEX-SOURCE, coupled to this event and its protections, with no independent lifetime. SP-286 receipt custody keeps its own policy. The publication’s source-coupled retention does not shorten mandatory original first-receipt custody, permit unresolved journal loss, or preserve linked content after its owner deletes it. Required pending/result/backup/hold dependencies fence journal cleanup. Missing-original reads disclose unavailable without reconstructing a current body.

Every stored part, including the complete journal wrapper, is measured in its declared physical encoding. Use existing SP-236 canonical MessagePack and SP-337 durable payload references for bodies above 16 KiB; externalize the event body before journal commit, retaining the complete exact EventRecord with payload_ref and null inline payload. If any required remaining wrapper still exceeds its own inline value limit, return the existing Storage unavailable/value-too-large route **before** the owner effect; never truncate, silently cap admitted semantic numbers or leave a mandatory oversized journal. Pack bytes and addressing metadata settle before referencing acknowledgement. This family authors no timestamp, numeric, physical codec or alternate source hash.

Backup settles owner source effect/result, the journal, actual seglog/packs, full-value receipt and generic-index recovery state coherently. Restore preserves original operation IDs, admitted editions, Stop/tombstones, pending originals and full-value identity; missing post-backup originals cannot be replaced by a new operation. Writer and reader withdrawal use the exact protocol of SQR-1556, preserving canonical custody and truthful unavailable results; no replay dispatch or new family checkpoint is introduced. Tests and criteria remain phase-1 planning only.

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-1556, ContractName:Plans/Contracts_V0.md#CV-1556, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/storage-plan.md#SP-337
