# Shard 124: CV-2300 — `settings.layer.changed` producer, identity and replay (newly authored, DL-411)

Source: `Plans/Contracts_V0.md`

Source lines: L57319-L57386

Source SHA256: `20b166e3f5825e366fd62bfebf5499ccb5000932011f62ef6e45b31412bb1aa5`

---

## CV-2300 — `settings.layer.changed` producer, identity and replay (newly authored, DL-411)

```yaml
plan_unit_id: CV-2300
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Exactly settings.layer.changed@1.0.0, registered by DL-300 with the application-only payload
  pm.settings.layer_changed.v1, takes its producer, ordering, identity, replay and withdrawal from this unit and its
  storage custody from SP-2300. The payload schema and registry row are unchanged; the native producer must adopt
  this contract before any append (requires_owner_adoption).
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; Settings presentation owners
  remain authoritative.
depends_on:
- SSYS-060
- SP-348
- CV-317
- CV-339
- CV-366
- DL-300
- DL-411
unblocks: []
acceptance_criteria:
- Only a Server-side sole level writer produces the event, after its own rows commit, with the exact payload joins below.
- Identity, replay and withdrawal follow the recipes below; retries return the original without a second effect.
- ATS-2301's checker passes every positive and refuses every single-defect negative at its own guard row.
validation_surfaces:
- python3 scripts/pm-s2-dl300-event-contracts.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s2
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411) and DL-300; exact answers and deck SHA-256 in Plans/Decision_Log.md
- reports/event-authority-20261114/s2-dl300-search-evidence.json
preserved_exact_tokens:
- settings.layer.changed
- pm.settings.layer_changed.v1
- SettingsLevelWriter::commit_level_transaction
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
negative_constraints:
- No registry change, admission, new writer, feature, retention or deletion rule.
- No local number or timestamp codec; the shared CV-1100, CV-1101 and SP-1101 foundations apply.
owner_hints:
- Plans/Contracts_V0.md
```

**Producer.** The producer is `SettingsLevelWriter::commit_level_transaction`, the sole writer that SSYS-060 and SP-348 name for the exact level, calling `storage.s2.settings_layer_changed.append.v1@1.0.0`: the explicit settings home Server for Everywhere, that Server for a Server Computer level, its dispatching Server for a tagged Execution Host Computer level, and the Project Home Server for Project own values (the event stays application-scoped; the Project is in `target` only). Current owner text names no Server-side sole writer for Device, provider or account levels, so this family has no producer there: such a change emits no `settings.layer.changed` (`producer_unavailable`), and no device route is invented. Follower mirrors, Everywhere copies, the differences index and client caches never produce it.

**Ordering.** Admission comes first, before any effect: the family is registered at 1.0.0, the registry selects exactly the application edition with this payload schema id, the producer has adopted this contract, the writer edition is not withdrawn, the original permission is current, no Stop fences the effect and the authoritative dedupe owner is available. The writer then commits the per-setting own rows and level head (SP-348) together with the prepared SP-2300 journal in one body transaction; the prepared journal carries no receipt. SP-286 and CV-339 (`storage.first_append_receipt.resolve.v2`, full-value custody) append the frozen event and return the first receipt; the journal advances prepared, appended, settled by exact previous-value CAS. The Settings transaction result is acknowledged only after `settled`. A transaction that commits no own row, or leaves the level snapshot hash unchanged, emits nothing.

**Payload joins.** `scope` is WorkflowScopeV2 application with `server_id` the sole writer Server. `target` is the committed level target. `changed_setting_ids` are exactly the committed own rows; `before_revisions` and `after_revisions` are keyed by exactly those ids and hold each row's prior and new `setting_revision`, each advanced by exactly one per-setting CAS (a theme pair commits both halves in one transaction and one event). `before_sha256` and `after_sha256` are the level snapshot hashes (`pm.settings_level_snapshot.v1` or `pm.project_settings_snapshot.v2`) before and after the commit. `home_generation` is the level head writer and role generation. `transaction_receipt_ref` is the transaction receipt and equals the journal `source_receipt_ref`. `redacted_summary_ref` names the transaction's redacted summary, redacted before persistence; no secret, key, profile, pairing, memory or notebook body enters the payload (SP-348).

**Identity.** The writer allocates one lifetime-unique immutable effect id per committed level transaction from the accepted Settings transaction (`transaction_id` of `pm.settings_transaction_result.v1`), with the declared component `settings.layer.changed` and the exact `level_key` included before issuance; a multi-Computer batch allocates one per target writer. That frozen id is `owner_operation_id`; it survives retry and is never reminted from a timer or callback. The idempotency key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`, with no suffix; `event_id` is `s2dl300@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`; the Storage partition is `app`. Hex is lowercase byte-preserving encoding. The envelope has `scope_kind` application, null `project_id`, `thread_id`, `run_id`, `node_id` and `attempt_id`, the transaction actor, the frozen accepted time and producer sequence, `redaction_profile` `secret_refs_only`, `replay_policy` `dedupe_by_idempotency_key` and null migration fields.

**Replay.** The same scoped identity `(scope_partition, event_type, idempotency_key)` with the same CV-317 producer digest returns the original first receipt with no effect; a different digest is `identity_conflict`; a missing dedupe owner is `dedupe_unavailable` with zero effect; a lost acknowledgement or restart resolves the same original and never re-applies a setting; `projector_replay_only` is never appendable.

**Compatibility and withdrawal.** 1.0.0 is the only edition, with no alias or extension. `settings.updated` and `settings.theme.updated` are retired by DL-408 and are never aliases; older dedicated DRY-guard records stay readable without rewrite. Writer withdrawal, under the append lock, refuses new preparation and lets pending originals drain or resolve; reader withdrawal is SP-2300's; a successor needs a new registry revision and the StorageMigrationCoordinator.

ContractRef: ContractName:Plans/Settings_System.md#SSYS-060, ContractName:Plans/storage-plan.md#SP-348, ContractName:Plans/storage-plan.md#SP-2300, ContractName:Plans/Contracts_V0.md#CV-366
