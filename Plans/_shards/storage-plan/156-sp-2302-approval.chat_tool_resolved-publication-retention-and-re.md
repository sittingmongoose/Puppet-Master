# Shard 156: SP-2302 — `approval.chat_tool_resolved` publication, retention and reader (newly authored, DL-411)

Source: `Plans/storage-plan.md`

Source lines: L78690-L78759

Source SHA256: `f9aeabf51a464afd2ff3660a2ecb2336a589dcf2b931c2c97868000898094b29`

---

## SP-2302 — `approval.chat_tool_resolved` publication, retention and reader (newly authored, DL-411)

```yaml
plan_unit_id: SP-2302
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Exactly approval.chat_tool_resolved@1.0.0, registered by DL-300, adopts SP-286/CV-339 full-value first-receipt custody,
  SP-278 complete generic-index reads and the adjacent publication journal. Canonical state stays with PS-145 and
  its record; the journal cannot reconstruct it. Retention is RP-AUTHORITY-INDEFINITE@1.0.0, the policy the DL-300
  registry row assigns; no registry change, admission or family checkpoint is granted.
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-2302
- DL-300
- DL-411
unblocks: []
acceptance_criteria:
- The journal commits with the owner body or not at all and advances prepared, appended, settled by exact CAS.
- The recovery reader is read-only over SP-278 and stores no token, checkpoint or projection.
- Retention, cleanup, backup and withdrawal follow the rules below; ATS-2301's checker passes.
validation_surfaces:
- python3 scripts/pm-s2-dl300-event-contracts.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s2
implementation_surfaces:
- Plans/storage-plan.md
- Plans/storage_value_registry.json
- Plans/event_payloads/s2/approval_chat_tool_resolved.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411) and DL-300; exact answers and deck SHA-256 in Plans/Decision_Log.md
- reports/event-authority-20261114/s2-dl300-search-evidence.json
preserved_exact_tokens:
- approval.chat_tool_resolved
- ea_s2_approval_chat_tool_resolved_publication
- RP-AUTHORITY-INDEFINITE
negative_constraints:
- No event registry change, admission, new feature, retention or deletion rule.
- No local number or timestamp codec; the shared CV-1100, CV-1101 and SP-1101 foundations apply.
owner_hints:
- Plans/storage-plan.md
```

| Stored value for `approval.chat_tool_resolved` | Key | Schema | Producer | Consumers | Retention |
|---|---|---|---|---|---|
| `ea_s2_approval_chat_tool_resolved_publication` | `ea_s2_approval_chat_tool_resolved.v1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(owner_operation_id)}` | `Plans/event_payloads/s2/approval_chat_tool_resolved.schema.json#/$defs/publication` | `storage.s2.approval_chat_tool_resolved.append.v1@1.0.0` via `ApprovalHost::resolve_chat_tool_request` | `storage.s2.approval_chat_tool_resolved.recovery_read.v1@1.0.0` and the original Storage backup/restore owner | `RP-AUTHORITY-INDEFINITE@1.0.0` (DL-300 registry assignment), canonical original custody |

**Journal.** This is a new canonical non-rebuildable publication journal, not another domain record or event registry row. The owner's body transaction commits the approval record's terminal decision and resolution_ref (SP-353 or SP-2303) and the prepared journal together, or neither. The prepared journal holds the complete frozen original event with null receipt and null commitment. SP-286's durable append returns the exact first receipt and the CV-339 v2 full-value commitment; the journal advances prepared to appended to settled under exact whole-prior-value CAS without changing the prepared event or any copied field. Legal writes are absent to prepared, prepared to appended, appended to settled, and settled to absent only through an accepted cleanup; skips, regressions and same-key rewrites are refused, and a same-state write is a read-only resolution of the identical original. A lost response, stale CAS or restart resolves the same complete original and never repeats the owner effect. Missing dedupe, a contradictory receipt or value, missing pack bytes or an unresolved restore fence refuse instead of accepting a new event. The Storage key equals the table formula over the authentic instance, partition and original operation; the journal's `physical_key`, `storage_instance_id`, `owner_operation_id`, `source_record_ref` and `source_receipt_ref` each join their original custody, and Storage's issued `sequence_id`, `observed_at_utc` and `persisted_at_utc` (CV-253 `storage_utc_z`) are never caller copies.

**Physical size.** Every stored part is measured in its declared encoding (SP-236 canonical MessagePack, SP-1100). A body of at most 16,384 encoded bytes may be inline only if the complete journal also fits; 16,385 bytes or more uses the SP-337 `payload:v1:{blake3_hex}` route with the closed descriptor (`ref`, `blake3_id`, `byte_size`, `media_type`), whose BLAKE3, exact size and `application/msgpack` media are verified against authenticated pack/index custody before decoding. A wrapper that still exceeds its limit returns Storage's existing value-too-large refusal before the owner effect; nothing is truncated or capped.

**Reader.** `storage.s2.approval_chat_tool_resolved.recovery_read.v1@1.0.0` is the family's only reader: read-only original-result and restart inspection over SP-278's complete generic EventRecord index. **No family projector, projection, checkpoint key or durable advance exists**, and the reader persists no token, so DL-076's stored-token rule has nothing to hold. Each read captures the live ten-field SP-278 `read_token` (the nine durable fields plus `redb_snapshot_id`) and revalidates it at final release: the same Storage instance, an unchanged index frontier revision and hash, the same healthy generation and the same live snapshot, selecting exactly this partition and event type; a degraded or moved source cannot claim a current result. Generic index CAS and rebuild stay SP-278's. Reads require current access to the approval's thread and scope under PS-145, rechecked at final release. Backup is as SP-2301, coherent with the paired request journal: a restore never keeps a resolution without its settled request, and an older restore never revives a resolved approval or re-dispatches the tool. A retained original is read through SP-1101: its recipe comes only from the one receipt Storage sealed for that exact original locator, an unknown recipe or another family's or edition's recipe is unsupported, and a missing or ambiguous receipt preserves the bytes and returns unavailable; no read creates a receipt.

**Retention.** The journal binds `RP-AUTHORITY-INDEFINITE@1.0.0` directly, the policy the DL-300 registry row assigns to `approval.chat_tool_resolved`; no age or count ever removes it. Cleanup is allowed only for a settled original after the approval record's owning thread or Project was deleted under its owner, and only when no pending owner effect or result, unresolved append or acknowledgement, recovery anchor, live reference, legal hold or unsettled backup remains; SP-286 receipt custody keeps its own policy; the journal is never evicted or rebuilt as a disposable index, and a missing original is reported unavailable, never reconstructed.

**Withdrawal.** Writer withdrawal under the append lock refuses new preparation, lets pending originals drain or resolve and preserves unresolved custody; reader withdrawal fences reads with `reader_withdrawn` while retained custody stays intact; a successor installs only through a new registry revision and the StorageMigrationCoordinator. Native execution is NOT_RUN.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-2302, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/storage-plan.md#SP-337
