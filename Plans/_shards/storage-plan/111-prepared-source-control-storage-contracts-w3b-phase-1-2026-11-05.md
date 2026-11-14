# Shard 111: Prepared Source Control Storage contracts — W3B phase 1, 2026-11-05

Source: `Plans/storage-plan.md`

Source lines: L52756-L54918

Source SHA256: `5065d9e04e53131a2344a6f1759caa92647dc0714c5e80d03fd384f1779318fb`

---

## Prepared Source Control Storage contracts — W3B phase 1, 2026-11-05

These newly authored per-family bindings use the existing Storage engines. Exact row proposals are `Plans/source_control_event_storage_rows.json`; no row is appended to the central value registry here. Every proposed value remains unavailable until registration, resolved retention/disk-budget/backup/migration admission, source adoption and native proof. Event families remain unadmitted. A pending policy is materially incomplete and cannot silently become indefinite or a live writer.

### SP-1250 — source_control.backend.detected source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1250
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.backend.detected@1.0.0. The append adapter
  is storage.source_control.backend_detected.append.v1@1.0.0; semantic/payload owners are SCS-1250/CV-1250. Stage
  two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_backend_detected_fact
  at source_control_event.backend_detected.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.backend_detected.fact.v1@1.0.0 (#/$defs/backend_detected_fact); derived
  source_control_backend_detected_checkpoint at source_control_event.backend_detected.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.backend_detected.checkpoint.v1@1.0.0 (#/$defs/backend_detected_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/backend_detected_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.backend_detected.history.v1@1.0.0 and reader.source_control.backend_detected.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.backend.detected, payload schema
  pm.source_control_event.backend_detected.payload.v1@1.0.0 and this Project in the actual Storage instance. Scan
  the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may advance
  with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1250 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-454 (E-CARDS-3 item 2.a): RP-TELEMETRY-90D@1.0.0, kept for 90
  days from the first successful save that survives a restart, under the existing 2,000,000-entry Project allowance.
  Retention of the original source fact source_control_backend_detected_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-TELEMETRY-90D@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission, native
  activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1250
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.backend.detected
- source_control_backend_detected_fact
- source_control_backend_detected_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1251 — source_control.backend.selected source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1251
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.backend.selected@1.0.0. The append adapter
  is storage.source_control.backend_selected.append.v1@1.0.0; semantic/payload owners are SCS-1251/CV-1251. Stage
  two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_backend_selected_fact
  at source_control_event.backend_selected.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.backend_selected.fact.v1@1.0.0 (#/$defs/backend_selected_fact); derived
  source_control_backend_selected_checkpoint at source_control_event.backend_selected.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.backend_selected.checkpoint.v1@1.0.0 (#/$defs/backend_selected_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/backend_selected_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.backend_selected.history.v1@1.0.0 and reader.source_control.backend_selected.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.backend.selected, payload schema
  pm.source_control_event.backend_selected.payload.v1@1.0.0 and this Project in the actual Storage instance. Scan
  the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may advance
  with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1251 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-453 (E-CARDS-3 item 1.a): RP-AUTHORITY-INDEFINITE@1.0.0, kept
  permanently, with no age or count expiry and no new count allowance. Retention of the original source fact source_control_backend_selected_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission,
  native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1251
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.backend.selected
- source_control_backend_selected_fact
- source_control_backend_selected_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1252 — source_control.checkpoint.created source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1252
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.checkpoint.created@1.0.0. The append
  adapter is storage.source_control.checkpoint_created.append.v1@1.0.0; semantic/payload owners are SCS-1252/CV-1252.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_checkpoint_created_fact
  at source_control_event.checkpoint_created.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.checkpoint_created.fact.v1@1.0.0 (#/$defs/checkpoint_created_fact); derived
  source_control_checkpoint_created_checkpoint at source_control_event.checkpoint_created.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.checkpoint_created.checkpoint.v1@1.0.0 (#/$defs/checkpoint_created_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/checkpoint_created_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.checkpoint_created.history.v1@1.0.0 and reader.source_control.checkpoint_created.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.checkpoint.created, payload
  schema pm.source_control_event.checkpoint_created.payload.v1@1.0.0 and this Project in the actual Storage instance.
  Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may
  advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1252 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-453 (E-CARDS-3 item 1.a): RP-AUTHORITY-INDEFINITE@1.0.0, kept
  permanently, with no age or count expiry and no new count allowance. Retention of the original source fact source_control_checkpoint_created_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission,
  native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1252
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.checkpoint.created
- source_control_checkpoint_created_fact
- source_control_checkpoint_created_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1253 — source_control.checkpoint.restored source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1253
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.checkpoint.restored@1.0.0. The append
  adapter is storage.source_control.checkpoint_restored.append.v1@1.0.0; semantic/payload owners are SCS-1253/CV-1253.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_checkpoint_restored_fact
  at source_control_event.checkpoint_restored.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.checkpoint_restored.fact.v1@1.0.0 (#/$defs/checkpoint_restored_fact); derived
  source_control_checkpoint_restored_checkpoint at source_control_event.checkpoint_restored.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.checkpoint_restored.checkpoint.v1@1.0.0 (#/$defs/checkpoint_restored_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/checkpoint_restored_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.checkpoint_restored.history.v1@1.0.0 and reader.source_control.checkpoint_restored.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.checkpoint.restored, payload
  schema pm.source_control_event.checkpoint_restored.payload.v1@1.0.0 and this Project in the actual Storage instance.
  Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may
  advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1253 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-453 (E-CARDS-3 item 1.a): RP-AUTHORITY-INDEFINITE@1.0.0, kept
  permanently, with no age or count expiry and no new count allowance. Retention of the original source fact source_control_checkpoint_restored_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission,
  native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1253
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.checkpoint.restored
- source_control_checkpoint_restored_fact
- source_control_checkpoint_restored_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1254 — source_control.remote.fetch_completed source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1254
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.remote.fetch_completed@1.0.0. The append
  adapter is storage.source_control.remote_fetch_completed.append.v1@1.0.0; semantic/payload owners are SCS-1254/CV-1254.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_remote_fetch_completed_fact
  at source_control_event.remote_fetch_completed.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.remote_fetch_completed.fact.v1@1.0.0 (#/$defs/remote_fetch_completed_fact);
  derived source_control_remote_fetch_completed_checkpoint at source_control_event.remote_fetch_completed.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.remote_fetch_completed.checkpoint.v1@1.0.0 (#/$defs/remote_fetch_completed_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/remote_fetch_completed_source_body; original_request is exact v2 legacy_exact
  (or SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source
  fact phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.remote_fetch_completed.history.v1@1.0.0 and reader.source_control.remote_fetch_completed.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.remote.fetch_completed, payload
  schema pm.source_control_event.remote_fetch_completed.payload.v1@1.0.0 and this Project in the actual Storage
  instance. Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter
  may advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity.
  through_sequence_id is the verified global source boundary, never the maximum matching sequence. Each advance
  pins the actual live read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching
  EventRecord and original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction.
  Before commit revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only
  publication. Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current
  data or silent cursor reset. Materialized filtered history is the verified read over index plus this checkpoint;
  no extra canonical projection family is invented. Quarantine malformed derived state and rebuild only from retained
  canonical evidence. Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source
  alive and is unavailable if required retained source has expired/deleted. Generic SP-278 root generations keep
  their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1254 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-455 (E-CARDS-3 item 3.a): RP-OPERATIONAL-2555D@1.0.0, kept seven
  years (2,555 days) from the original saved change, under the existing 2,000,000-entry Project allowance and
  Storage’s Project first-save anchor adapter. Retention of the original source fact source_control_remote_fetch_completed_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter; the source fact is kept exactly as long as the
  history entry that points to it. No central family
  append, admission, native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1254
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.fetch_completed
- source_control_remote_fetch_completed_fact
- source_control_remote_fetch_completed_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1255 — source_control.remote.fetch_started source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1255
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.remote.fetch_started@1.0.0. The append
  adapter is storage.source_control.remote_fetch_started.append.v1@1.0.0; semantic/payload owners are SCS-1255/CV-1255.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_remote_fetch_started_fact
  at source_control_event.remote_fetch_started.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.remote_fetch_started.fact.v1@1.0.0 (#/$defs/remote_fetch_started_fact);
  derived source_control_remote_fetch_started_checkpoint at source_control_event.remote_fetch_started.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.remote_fetch_started.checkpoint.v1@1.0.0 (#/$defs/remote_fetch_started_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/remote_fetch_started_source_body; original_request is exact v2 legacy_exact
  (or SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source
  fact phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.remote_fetch_started.history.v1@1.0.0 and reader.source_control.remote_fetch_started.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.remote.fetch_started, payload
  schema pm.source_control_event.remote_fetch_started.payload.v1@1.0.0 and this Project in the actual Storage instance.
  Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may
  advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1255 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-455 (E-CARDS-3 item 3.a): RP-OPERATIONAL-2555D@1.0.0, kept seven
  years (2,555 days) from the original saved change, under the existing 2,000,000-entry Project allowance and
  Storage’s Project first-save anchor adapter. Retention of the original source fact source_control_remote_fetch_started_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter; the source fact is kept exactly as long as the
  history entry that points to it. No central family
  append, admission, native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1255
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.fetch_started
- source_control_remote_fetch_started_fact
- source_control_remote_fetch_started_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1256 — source_control.remote.publish_completed source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1256
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.remote.publish_completed@1.0.0. The append
  adapter is storage.source_control.remote_publish_completed.append.v1@1.0.0; semantic/payload owners are SCS-1256/CV-1256.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_remote_publish_completed_fact
  at source_control_event.remote_publish_completed.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.remote_publish_completed.fact.v1@1.0.0 (#/$defs/remote_publish_completed_fact);
  derived source_control_remote_publish_completed_checkpoint at source_control_event.remote_publish_completed.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.remote_publish_completed.checkpoint.v1@1.0.0 (#/$defs/remote_publish_completed_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/remote_publish_completed_source_body; original_request is exact v2 legacy_exact
  (or SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source
  fact phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.remote_publish_completed.history.v1@1.0.0 and reader.source_control.remote_publish_completed.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.remote.publish_completed, payload
  schema pm.source_control_event.remote_publish_completed.payload.v1@1.0.0 and this Project in the actual Storage
  instance. Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter
  may advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity.
  through_sequence_id is the verified global source boundary, never the maximum matching sequence. Each advance
  pins the actual live read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching
  EventRecord and original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction.
  Before commit revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only
  publication. Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current
  data or silent cursor reset. Materialized filtered history is the verified read over index plus this checkpoint;
  no extra canonical projection family is invented. Quarantine malformed derived state and rebuild only from retained
  canonical evidence. Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source
  alive and is unavailable if required retained source has expired/deleted. Generic SP-278 root generations keep
  their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1256 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-455 (E-CARDS-3 item 3.a): RP-OPERATIONAL-2555D@1.0.0, kept seven
  years (2,555 days) from the original saved change, under the existing 2,000,000-entry Project allowance and
  Storage’s Project first-save anchor adapter. Retention of the original source fact source_control_remote_publish_completed_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter; the source fact is kept exactly as long as the
  history entry that points to it. No central family
  append, admission, native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1256
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.publish_completed
- source_control_remote_publish_completed_fact
- source_control_remote_publish_completed_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1257 — source_control.remote.publish_started source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1257
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.remote.publish_started@1.0.0. The append
  adapter is storage.source_control.remote_publish_started.append.v1@1.0.0; semantic/payload owners are SCS-1257/CV-1257.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_remote_publish_started_fact
  at source_control_event.remote_publish_started.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.remote_publish_started.fact.v1@1.0.0 (#/$defs/remote_publish_started_fact);
  derived source_control_remote_publish_started_checkpoint at source_control_event.remote_publish_started.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.remote_publish_started.checkpoint.v1@1.0.0 (#/$defs/remote_publish_started_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/remote_publish_started_source_body; original_request is exact v2 legacy_exact
  (or SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source
  fact phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.remote_publish_started.history.v1@1.0.0 and reader.source_control.remote_publish_started.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.remote.publish_started, payload
  schema pm.source_control_event.remote_publish_started.payload.v1@1.0.0 and this Project in the actual Storage
  instance. Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter
  may advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity.
  through_sequence_id is the verified global source boundary, never the maximum matching sequence. Each advance
  pins the actual live read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching
  EventRecord and original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction.
  Before commit revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only
  publication. Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current
  data or silent cursor reset. Materialized filtered history is the verified read over index plus this checkpoint;
  no extra canonical projection family is invented. Quarantine malformed derived state and rebuild only from retained
  canonical evidence. Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source
  alive and is unavailable if required retained source has expired/deleted. Generic SP-278 root generations keep
  their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1257 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-455 (E-CARDS-3 item 3.a): RP-OPERATIONAL-2555D@1.0.0, kept seven
  years (2,555 days) from the original saved change, under the existing 2,000,000-entry Project allowance and
  Storage’s Project first-save anchor adapter. Retention of the original source fact source_control_remote_publish_started_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter; the source fact is kept exactly as long as the
  history entry that points to it. No central family
  append, admission, native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1257
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.publish_started
- source_control_remote_publish_started_fact
- source_control_remote_publish_started_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1258 — source_control.remote.sync_completed source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1258
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.remote.sync_completed@1.0.0. The append
  adapter is storage.source_control.remote_sync_completed.append.v1@1.0.0; semantic/payload owners are SCS-1258/CV-1258.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_remote_sync_completed_fact
  at source_control_event.remote_sync_completed.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.remote_sync_completed.fact.v1@1.0.0 (#/$defs/remote_sync_completed_fact);
  derived source_control_remote_sync_completed_checkpoint at source_control_event.remote_sync_completed.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.remote_sync_completed.checkpoint.v1@1.0.0 (#/$defs/remote_sync_completed_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/remote_sync_completed_source_body; original_request is exact v2 legacy_exact
  (or SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source
  fact phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.remote_sync_completed.history.v1@1.0.0 and reader.source_control.remote_sync_completed.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.remote.sync_completed, payload
  schema pm.source_control_event.remote_sync_completed.payload.v1@1.0.0 and this Project in the actual Storage instance.
  Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may
  advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1258 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-455 (E-CARDS-3 item 3.a): RP-OPERATIONAL-2555D@1.0.0, kept seven
  years (2,555 days) from the original saved change, under the existing 2,000,000-entry Project allowance and
  Storage’s Project first-save anchor adapter. Retention of the original source fact source_control_remote_sync_completed_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter; the source fact is kept exactly as long as the
  history entry that points to it. No central family
  append, admission, native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1258
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.sync_completed
- source_control_remote_sync_completed_fact
- source_control_remote_sync_completed_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1259 — source_control.remote.sync_started source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1259
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.remote.sync_started@1.0.0. The append
  adapter is storage.source_control.remote_sync_started.append.v1@1.0.0; semantic/payload owners are SCS-1259/CV-1259.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_remote_sync_started_fact
  at source_control_event.remote_sync_started.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.remote_sync_started.fact.v1@1.0.0 (#/$defs/remote_sync_started_fact); derived
  source_control_remote_sync_started_checkpoint at source_control_event.remote_sync_started.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.remote_sync_started.checkpoint.v1@1.0.0 (#/$defs/remote_sync_started_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/remote_sync_started_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.remote_sync_started.history.v1@1.0.0 and reader.source_control.remote_sync_started.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.remote.sync_started, payload
  schema pm.source_control_event.remote_sync_started.payload.v1@1.0.0 and this Project in the actual Storage instance.
  Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may
  advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1259 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-455 (E-CARDS-3 item 3.a): RP-OPERATIONAL-2555D@1.0.0, kept seven
  years (2,555 days) from the original saved change, under the existing 2,000,000-entry Project allowance and
  Storage’s Project first-save anchor adapter. Retention of the original source fact source_control_remote_sync_started_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission,
  native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1259
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.sync_started
- source_control_remote_sync_started_fact
- source_control_remote_sync_started_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1260 — source_control.repository.bound source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1260
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.repository.bound@1.0.0. The append adapter
  is storage.source_control.repository_bound.append.v1@1.0.0; semantic/payload owners are SCS-1260/CV-1260. Stage
  two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_repository_bound_fact
  at source_control_event.repository_bound.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.repository_bound.fact.v1@1.0.0 (#/$defs/repository_bound_fact); derived
  source_control_repository_bound_checkpoint at source_control_event.repository_bound.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.repository_bound.checkpoint.v1@1.0.0 (#/$defs/repository_bound_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/repository_bound_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.repository_bound.history.v1@1.0.0 and reader.source_control.repository_bound.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.repository.bound, payload schema
  pm.source_control_event.repository_bound.payload.v1@1.0.0 and this Project in the actual Storage instance. Scan
  the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may advance
  with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1260 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-453 (E-CARDS-3 item 1.a): RP-AUTHORITY-INDEFINITE@1.0.0, kept
  permanently, with no age or count expiry and no new count allowance. Retention of the original source fact source_control_repository_bound_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission,
  native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1260
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.repository.bound
- source_control_repository_bound_fact
- source_control_repository_bound_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1261 — source_control.repository.unbound source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1261
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.repository.unbound@1.0.0. The append
  adapter is storage.source_control.repository_unbound.append.v1@1.0.0; semantic/payload owners are SCS-1261/CV-1261.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_repository_unbound_fact
  at source_control_event.repository_unbound.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.repository_unbound.fact.v1@1.0.0 (#/$defs/repository_unbound_fact); derived
  source_control_repository_unbound_checkpoint at source_control_event.repository_unbound.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.repository_unbound.checkpoint.v1@1.0.0 (#/$defs/repository_unbound_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/repository_unbound_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.repository_unbound.history.v1@1.0.0 and reader.source_control.repository_unbound.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.repository.unbound, payload
  schema pm.source_control_event.repository_unbound.payload.v1@1.0.0 and this Project in the actual Storage instance.
  Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may
  advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1261 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-453 (E-CARDS-3 item 1.a): RP-AUTHORITY-INDEFINITE@1.0.0, kept
  permanently, with no age or count expiry and no new count allowance. Retention of the original source fact source_control_repository_unbound_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission,
  native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1261
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.repository.unbound
- source_control_repository_unbound_fact
- source_control_repository_unbound_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1262 — source_control.status.refreshed source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1262
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.status.refreshed@1.0.0. The append adapter
  is storage.source_control.status_refreshed.append.v1@1.0.0; semantic/payload owners are SCS-1262/CV-1262. Stage
  two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_status_refreshed_fact
  at source_control_event.status_refreshed.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.status_refreshed.fact.v1@1.0.0 (#/$defs/status_refreshed_fact); derived
  source_control_status_refreshed_checkpoint at source_control_event.status_refreshed.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.status_refreshed.checkpoint.v1@1.0.0 (#/$defs/status_refreshed_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/status_refreshed_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.status_refreshed.history.v1@1.0.0 and reader.source_control.status_refreshed.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.status.refreshed, payload schema
  pm.source_control_event.status_refreshed.payload.v1@1.0.0 and this Project in the actual Storage instance. Scan
  the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may advance
  with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1262 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-454 (E-CARDS-3 item 2.a): RP-TELEMETRY-90D@1.0.0, kept for 90
  days from the first successful save that survives a restart, under the existing 2,000,000-entry Project allowance.
  Retention of the original source fact source_control_status_refreshed_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-TELEMETRY-90D@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission, native
  activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1262
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.status.refreshed
- source_control_status_refreshed_fact
- source_control_status_refreshed_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1263 — source_control.workspace.created source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1263
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.workspace.created@1.0.0. The append adapter
  is storage.source_control.workspace_created.append.v1@1.0.0; semantic/payload owners are SCS-1263/CV-1263. Stage
  two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_workspace_created_fact
  at source_control_event.workspace_created.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.workspace_created.fact.v1@1.0.0 (#/$defs/workspace_created_fact); derived
  source_control_workspace_created_checkpoint at source_control_event.workspace_created.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.workspace_created.checkpoint.v1@1.0.0 (#/$defs/workspace_created_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/workspace_created_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.workspace_created.history.v1@1.0.0 and reader.source_control.workspace_created.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.workspace.created, payload schema
  pm.source_control_event.workspace_created.payload.v1@1.0.0 and this Project in the actual Storage instance. Scan
  the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may advance
  with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1263 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-453 (E-CARDS-3 item 1.a): RP-AUTHORITY-INDEFINITE@1.0.0, kept
  permanently, with no age or count expiry and no new count allowance. Retention of the original source fact source_control_workspace_created_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No
  central family append, admission, native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1263
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.created
- source_control_workspace_created_fact
- source_control_workspace_created_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1264 — source_control.workspace.opened source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1264
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.workspace.opened@1.0.0. The append adapter
  is storage.source_control.workspace_opened.append.v1@1.0.0; semantic/payload owners are SCS-1264/CV-1264. Stage
  two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_workspace_opened_fact
  at source_control_event.workspace_opened.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.workspace_opened.fact.v1@1.0.0 (#/$defs/workspace_opened_fact); derived
  source_control_workspace_opened_checkpoint at source_control_event.workspace_opened.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.workspace_opened.checkpoint.v1@1.0.0 (#/$defs/workspace_opened_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/workspace_opened_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.workspace_opened.history.v1@1.0.0 and reader.source_control.workspace_opened.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.workspace.opened, payload schema
  pm.source_control_event.workspace_opened.payload.v1@1.0.0 and this Project in the actual Storage instance. Scan
  the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may advance
  with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1264 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-454 (E-CARDS-3 item 2.a): RP-TELEMETRY-90D@1.0.0, kept for 90
  days from the first successful save that survives a restart, under the existing 2,000,000-entry Project allowance.
  Retention of the original source fact source_control_workspace_opened_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-TELEMETRY-90D@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission, native
  activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1264
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.opened
- source_control_workspace_opened_fact
- source_control_workspace_opened_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1265 — source_control.workspace.removed source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1265
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.workspace.removed@1.0.0. The append adapter
  is storage.source_control.workspace_removed.append.v1@1.0.0; semantic/payload owners are SCS-1265/CV-1265. Stage
  two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_workspace_removed_fact
  at source_control_event.workspace_removed.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.workspace_removed.fact.v1@1.0.0 (#/$defs/workspace_removed_fact); derived
  source_control_workspace_removed_checkpoint at source_control_event.workspace_removed.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.workspace_removed.checkpoint.v1@1.0.0 (#/$defs/workspace_removed_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/workspace_removed_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.workspace_removed.history.v1@1.0.0 and reader.source_control.workspace_removed.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.workspace.removed, payload schema
  pm.source_control_event.workspace_removed.payload.v1@1.0.0 and this Project in the actual Storage instance. Scan
  the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may advance
  with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1265 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-453 (E-CARDS-3 item 1.a): RP-AUTHORITY-INDEFINITE@1.0.0, kept
  permanently, with no age or count expiry and no new count allowance. Retention of the original source fact source_control_workspace_removed_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No
  central family append, admission, native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1265
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.removed
- source_control_workspace_removed_fact
- source_control_workspace_removed_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1266 — source_control.workspace.switched source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1266
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.workspace.switched@1.0.0. The append
  adapter is storage.source_control.workspace_switched.append.v1@1.0.0; semantic/payload owners are SCS-1266/CV-1266.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_workspace_switched_fact
  at source_control_event.workspace_switched.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.workspace_switched.fact.v1@1.0.0 (#/$defs/workspace_switched_fact); derived
  source_control_workspace_switched_checkpoint at source_control_event.workspace_switched.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.workspace_switched.checkpoint.v1@1.0.0 (#/$defs/workspace_switched_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/workspace_switched_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.workspace_switched.history.v1@1.0.0 and reader.source_control.workspace_switched.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.workspace.switched, payload
  schema pm.source_control_event.workspace_switched.payload.v1@1.0.0 and this Project in the actual Storage instance.
  Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may
  advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1266 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-454 (E-CARDS-3 item 2.a): RP-TELEMETRY-90D@1.0.0, kept for 90
  days from the first successful save that survives a restart, under the existing 2,000,000-entry Project allowance.
  Retention of the original source fact source_control_workspace_switched_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-TELEMETRY-90D@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission,
  native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1266
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.switched
- source_control_workspace_switched_fact
- source_control_workspace_switched_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1267 — source_control.writer_lease.granted source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1267
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.writer_lease.granted@1.0.0. The append
  adapter is storage.source_control.writer_lease_granted.append.v1@1.0.0; semantic/payload owners are SCS-1267/CV-1267.
  Stage two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_writer_lease_granted_fact
  at source_control_event.writer_lease_granted.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.writer_lease_granted.fact.v1@1.0.0 (#/$defs/writer_lease_granted_fact);
  derived source_control_writer_lease_granted_checkpoint at source_control_event.writer_lease_granted.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.writer_lease_granted.checkpoint.v1@1.0.0 (#/$defs/writer_lease_granted_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/writer_lease_granted_source_body; original_request is exact v2 legacy_exact
  (or SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source
  fact phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.writer_lease_granted.history.v1@1.0.0 and reader.source_control.writer_lease_granted.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.writer_lease.granted, payload
  schema pm.source_control_event.writer_lease_granted.payload.v1@1.0.0 and this Project in the actual Storage instance.
  Scan the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may
  advance with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1267 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-453 (E-CARDS-3 item 1.a): RP-AUTHORITY-INDEFINITE@1.0.0, kept
  permanently, with no age or count expiry and no new count allowance. Retention of the original source fact source_control_writer_lease_granted_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission,
  native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1267
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.writer_lease.granted
- source_control_writer_lease_granted_fact
- source_control_writer_lease_granted_checkpoint
- DL-510
- SP-278
- SP-286
```

### SP-1268 — source_control.writer_lease.lost source custody and filtered checkpoint

```yaml
plan_unit_id: SP-1268
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for exactly source_control.writer_lease.lost@1.0.0. The append adapter
  is storage.source_control.writer_lease_lost.append.v1@1.0.0; semantic/payload owners are SCS-1268/CV-1268. Stage
  two value rows only in Plans/source_control_event_storage_rows.json: canonical source_control_writer_lease_lost_fact
  at source_control_event.writer_lease_lost.fact.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)},
  pm.storage_value.source_control_event.writer_lease_lost.fact.v1@1.0.0 (#/$defs/writer_lease_lost_fact); derived
  source_control_writer_lease_lost_checkpoint at source_control_event.writer_lease_lost.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  pm.storage_value.source_control_event.writer_lease_lost.checkpoint.v1@1.0.0 (#/$defs/writer_lease_lost_checkpoint),
  both in Plans/source_control_event_contracts.schema.json. Store strict UTF-8 keys and SP-236 canonical MessagePack
  values in the existing canonical redb and derived redb respectively. Put this family''s checkpoint in that derived
  database''s checkpoints table. hex encodes full strict UTF-8 IDs without normalization. Cross-store/root/Project/operation/family
  key-value collisions refuse, never rename or overwrite.


  Source custody: one actual accepted owner operation reserves its identity before effect and commits the immutable
  original source body, exact native evidence refs and original owner result ref. A started fact''s result ref denotes
  its admitted start result, not a fabricated terminal receipt; a successful completion resolves the original terminal
  receipt. Source body uses #/$defs/writer_lease_lost_source_body; original_request is exact v2 legacy_exact (or
  SCS-025 selected sync successor) for commands, null only for authenticated writer-lease transitions. Source fact
  phase starts source_committed with null first_append_receipt_ref. After append issuance, resolve strict full-value
  v2 and atomically CAS that same fact to issued with the exact first receipt ref. An issued fact never changes
  semantic body/identity or original receipt. Recovery of source_committed resolves the original append identity
  before any publication; an unavailable original is fenced, not restamped. Native source snapshots/requests/results
  are original canonical owner evidence; their hashes and joins are independently reverified, not established by
  self-consistent caller objects. Additional body/receipt bytes above 16 KiB use SP-337 refs; both each stored wrapper
  and each decoded typed body are measured, with metadata-only refusal if an unbounded identity would keep the wrapper
  over limit.


  Adopt SP-286 and CV-339 explicitly, including the full-value v2 successor and storage.first_append_receipt.resolve_full_value.v1.
  Source advance, native continuation and dependent terminal publication require exact original source/full EventRecord/receipt
  joins and the SP-336/SP-347 issued group. SP-236 owns wire types/sign/bytes; CV-317 owns producer-semantic digest
  and timestamp/number domains. No lane codec, blanket integer cap or historical current-rule rewrite is introduced.
  Missing pending/current/retained source custody, substituted event family, receipt, storage identity or original
  recipe fences this adapter.


  Checkpoint: projector.source_control.writer_lease_lost.history.v1@1.0.0 and reader.source_control.writer_lease_lost.history.v1@1.0.0
  explicitly adopt SP-278 and DL-076. The exact filter is event_type=source_control.writer_lease.lost, payload schema
  pm.source_control_event.writer_lease_lost.payload.v1@1.0.0 and this Project in the actual Storage instance. Scan
  the complete verified global index frontier, including nonmatching rows and legal gaps. Empty filter may advance
  with last_event_id/last_source_fact_ref null; non-empty retains the last matching original identity. through_sequence_id
  is the verified global source boundary, never the maximum matching sequence. Each advance pins the actual live
  read snapshot and entire SP-278 generation/anchor/frontier/source token, joins every matching EventRecord and
  original fact, and CASes the predecessor durable token and cursor in one derived-redb transaction. Before commit
  revalidate CURRENT, source coverage, all nine token fields and read authority; no row-only or cursor-only publication.
  Stale source triggers catch-up or governed shadow rebuild, never guessed offsets, retired-as-current data or silent
  cursor reset. Materialized filtered history is the verified read over index plus this checkpoint; no extra canonical
  projection family is invented. Quarantine malformed derived state and rebuild only from retained canonical evidence.
  Checkpoint retention is source-coupled RP-EVENT-INDEX-SOURCE; it holds no payload or source alive and is unavailable
  if required retained source has expired/deleted. Generic SP-278 root generations keep their own RP-PROJECTION-3GEN.


  Replay is read-only: no command/native/network/outbox/notification/lease/charge side effects. Valid retained originals
  remain readable after live lease/revision/setup changes, via authenticated original recipe selection; withdrawn
  or mismatched source cannot pass. Canonical fact is nonrebuildable and needs coherent mandatory backup with original
  source/native result refs, selected event bytes/packs and SP-286 receipt closure, using SCS-014 and Backup''s
  existing capture barrier. Source payloads and referenced bodies retain independent policies and read/deletion
  checks. Do not reconstruct an operation source from event/index/history. Restore older backups obeys SP-286 missing-original
  fences and never revives a lease or repeats a remote effect. StorageMigrationCoordinator must register these rows,
  exact schema/codec/backup closure and compatible reader ceilings before activation; no store version is invented.
  Withdrawal follows this exact family''s SCS-1268 cutoff, receipt retention and verified successor rebuild. Retention of the saved event history is bound by DL-453 (E-CARDS-3 item 1.a): RP-AUTHORITY-INDEFINITE@1.0.0, kept
  permanently, with no age or count expiry and no new count allowance. Retention of the original source fact source_control_writer_lease_lost_fact is the same as its saved event history (DL-510, E-CARDS-6
  E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0; the source fact is kept exactly as long as the
  history entry that points to it. No central family append, admission,
  native activation or depth pass occurs in phase 1.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SP-236
- SP-278
- SP-286
- SP-337
- SCS-1268
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.writer_lease.lost
- source_control_writer_lease_lost_fact
- source_control_writer_lease_lost_checkpoint
- DL-510
- SP-278
- SP-286
```
