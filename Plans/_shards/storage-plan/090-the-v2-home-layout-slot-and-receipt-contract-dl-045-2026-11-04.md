# Shard 090: The v2 Home layout slot and receipt contract (DL-045, 2026-11-04)

Source: `Plans/storage-plan.md`

Source lines: L29493-L29583

Source SHA256: `5b5b2eb291562397fd1fb812e7cefdd840f33a12a4a33c5ca916e59e9f734b10`

---

## The v2 Home layout slot and receipt contract (DL-045, 2026-11-04)

This is a **newly authored owner contract under DL-045** for `workspace.layout_changed`, one of DL-045's 285 names. SP-330 and SP-273's 2026-10-09 amendment require a successor slot and receipt schema for v2 Home layout writes that references `pm.home_workspace_layout.v2` and the CV-361 2.0.0 payload by `$ref`, and they admit no native v2 writer until it exists. SP-400 writes it: `Plans/home_layout_v2_slot_receipt.schema.json`, slot and receipt schema version 4.0.0 ("Home4"). It adds no feature, command, event family, retention policy, hold or physical family.

**Search before authoring.** On 2026-11-04 every file under `Plans/`, `scripts/` and `tests/` that names `home_workspace_layout/2.0.0`, `workspace_layout_changed/2.0.0`, `home_layout_transaction_slot`, `home_layout_operation_receipt`, `home_content_free_capture` or `home_slot_migration_core` was read. Only the v2 layout schema and its storage registry row name the v2 record. Only CV-361, the event family registry and the Event Authority audit ledger name the 2.0.0 payload. No slot, receipt or capture definition is typed for either, and no MessagePack capture or migration-core codec id exists. The search record is `reports/event-authority-20261104/ds-p2-home4-binding-search.txt`.

**What it reuses unchanged**, by `$ref` into `Plans/home_layout_pending_receipt.schema.json`:
- the two physical families and their `.v1` keys, and the producer `home.workspace_layout_commit.v1`;
- the slot states and their conditionals, Storage and scope identities, the migration binding, pending SIR custody and both pending append-origin variants;
- the twenty-field operation binding except `command_id`, the dispatch receipt, the readback fields and the event envelope fields;
- the eleven-field original AppendReceipt, the four-field append result, original publication v2, and the SIR outcome, normalized request and UI response.

SP-273's custody, transaction, crash convergence, retention mapping, read, deletion and withdrawal rules govern Home4 values unchanged, as its 2026-10-09 amendment says.

**What it replaces:**
- **Layouts.** `prior_layout` and `candidate_layout` are `pm.home_workspace_layout.v2` records, by `$ref`.
- **Event semantics.** `payload_schema_id` names the 2.0.0 payload and `payload` is the CV-361 payload, by `$ref`. Its `change` is never `migrated_from_v1` and its `command_id` is never null. The v1-to-v2 conversion has no admitted command, so it appends its event inside SP-330's StorageMigrationCoordinator transaction and never takes a slot operation or receipt. SP-273 already says that restore, migration and recovery values do not authorize making up a command, interaction or receipt.
- **Commands.** The binding's and owner result's `command_id` is the CV-361 2.0.0 command set, by `$ref`. The owner result is `pm.home_layout_owner_result.v1` at version 2.0.0, and the SIR outcome's `owner_result_schema_ref` points at this contract's `#/$defs/owner_result`.
- **Readback key.** `home_workspace_layout.v2:{project_id}:{workspace_tab_id}`.
- **Encodings (DL-270; SP-337, SP-339, SP-340).** Values are canonical MessagePack. `prior_layout_source_bytes` and `candidate_layout_source_bytes` replace the retired `*_base64` fields. Each holds the exact source bytes as a binary field when they are at most 16 KiB, and a payload-store reference (BLAKE3 id, byte size, media type) above that. Identity capture uses `home_content_free_capture_canonical_msgpack.v1`. A prior migration core uses `home_slot_migration_core_canonical_msgpack.v1`; it may be the final Home3 core or a Home4 core, and it is always an empty resolved operation.

**Installation and readers.** As for Home3, the sole StorageMigrationCoordinator installs coordinated slot and receipt 4.0.0 family edges, the 1.0.0 to 4.0.0 readers and the Home pending resolver, and the owner activation follows the committed MigrationReceipt, before a v2 write is admitted. Unresolved Home1 to Home3 operations are not converted: they settle under their original authority or fence the migration, as SP-273 says. Readers dispatch by `schema_version`: 1.0.0 to 3.0.0 through `Plans/home_layout_value_readers.schema.json`, 4.0.0 through this contract. The reader checkpoint `home.workspace_layout_event_reader.v1` is unchanged and resolves 4.0.0 receipts through this contract. The storage registry rows keep naming Home3 until the 4.0.0 family edges are registered with that installation; this unit changes no registry row.

**Static oracles.** `Plans/home_layout_v2_slot_receipt_fixtures.json` holds 5 valid values (empty slot, empty slot after the Home3 migration, prepared slot, readback-verified slot, committed receipt), 12 schema negatives and 14 joined-value negatives. `scripts/pm_home_layout_v2_slot_receipt.py` checks them against the schema and the invariants I1 to I9 in its `$comment`. Native installation, codecs, redb transactions, authentication and durability remain NOT_RUN.

### SP-400 - The v2 Home Layout Slot And Receipt Contract (Home4)

```yaml
plan_unit_id: SP-400
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045 (2026-11-04). v2 Home layout writes use the Home4 slot and receipt contract Plans/home_layout_v2_slot_receipt.schema.json, slot and receipt schema version 4.0.0 and slot producer version 4.0.0, in the existing home_layout_transaction_slot and home_layout_operation_receipt families at their .v1 keys, with producer home.workspace_layout_commit.v1. It references pm.home_workspace_layout.v2 and the CV-361 2.0.0 payload by $ref and reuses every Home3 definition that is not typed for v1 layouts or the 1.1.0 payload, so SP-273's custody, transaction, crash convergence, retention mapping, read, deletion and withdrawal rules govern it unchanged. The binding's and owner result's command_id is the CV-361 command set; the owner result is pm.home_layout_owner_result.v1 at 2.0.0; the readback key is home_workspace_layout.v2:{project_id}:{workspace_tab_id}. A Home4 event is never migrated_from_v1 and never has a null command: the conversion appends inside SP-330's StorageMigrationCoordinator transaction without a slot operation or receipt. Under DL-270 values are canonical MessagePack, prior_layout_source_bytes and candidate_layout_source_bytes hold the exact source bytes as a binary field up to 16 KiB or a BLAKE3 payload-store reference above it, identity capture uses home_content_free_capture_canonical_msgpack.v1 and a prior migration core uses home_slot_migration_core_canonical_msgpack.v1. The 4.0.0 slot and receipt edges, readers and pending resolver are installed through the StorageMigrationCoordinator with post-receipt owner activation before a v2 write is admitted; unresolved Home1 to Home3 operations settle under their original authority or fence the migration. Readers dispatch 1.0.0 to 3.0.0 through Plans/home_layout_value_readers.schema.json and 4.0.0 through this contract.
gui_related: false
gui_classification_reason: Defines the stored custody of Home layout writes, not presentation.
split_recommended: false
depends_on: [SP-330, SP-273, CV-361, SIR-046, SP-337, SP-339, SP-340, DL-045, DL-180, DL-188, DL-270]
unblocks: []
acceptance_criteria:
  - Plans/home_layout_v2_slot_receipt.schema.json references pm.home_workspace_layout.v2 and the CV-361 2.0.0 payload by $ref and copies neither.
  - Every Home3 member not typed for v1 layouts, the 1.1.0 payload or a DL-270-retired encoding is reused by $ref; families, keys and producer id are unchanged.
  - A Home4 slot or receipt rejects a v1 layout, a 1.1.0 payload, a *_base64 field, a retired JSON codec id, a v1 readback key, a retired command and a migrated_from_v1 event.
  - Layout source bytes are a binary field up to 16 KiB and a payload-store reference only above it; their SHA-256 equals the layout hash.
  - Every valid case of Plans/home_layout_v2_slot_receipt_fixtures.json passes the schema and invariants I1 to I9, and every invalid case is refused by the schema or by the invariant it names.
  - No 4.0.0 write is admitted before the 4.0.0 family edges, readers, pending resolver and owner activation are installed; unresolved Home1 to Home3 operations are never converted.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches or production build tasks are created by this unit.
validation_surfaces:
  - Plans/home_layout_v2_slot_receipt.schema.json
  - Plans/home_layout_v2_slot_receipt_fixtures.json
  - python3 scripts/pm_home_layout_v2_slot_receipt.py
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_layout_v2_write_custody_or_encoding_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/home_layout_v2_slot_receipt.schema.json
  - Plans/home_layout_v2_slot_receipt_fixtures.json
  - scripts/pm_home_layout_v2_slot_receipt.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
  - Plans/storage-plan.md#SP-330
  - Plans/storage-plan.md#SP-273
  - Plans/Contracts_V0.md#CV-361
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-270
  - reports/event-authority-20261104/ds-p2-home4-binding-search.txt
preserved_exact_tokens:
  - home_layout_transaction_slot
  - home_layout_operation_receipt
  - home.workspace_layout_commit.v1
  - pm.home_workspace_layout.v2
  - workspace.layout_changed
  - migrated_from_v1
  - RP-CONFIG-CURRENT
  - RP-AUTHORITY-INDEFINITE
negative_constraints:
  - No new feature, command, event family, payload version, retention policy, hold kind, physical family or key.
  - No storage registry row change; the 4.0.0 family edges are registered with their installation.
  - No conversion of unresolved Home1 to Home3 operations, no native proof, DEPTH_PASS or governance seal.
owner_hints:
  - Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/storage-plan.md#SP-273, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/Decision_Log.md#DL-270
