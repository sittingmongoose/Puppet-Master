# Shard 053: First append receipt shared contract

Source: `Plans/Contracts_V0.md`

Source lines: L22096-L22278

Source SHA256: `083dc7844e67d48919a9d0f5b6b9cd37f013bb40f35ad2da6ee465e68e3466f9`

---

## First append receipt shared contract

CV-339 defines the shared first-receipt shapes, byte semantics and caller interfaces. SP-286 owns physical custody, durability, exclusion, restore, migration and withdrawal. The successful `AppendReceipt` remains exactly the existing eleven fields: `event_id`, `sequence_id`, `segment_generation`, `segment_name`, `byte_offset`, `commit_group_id`, `durability_class`, `durable_end_offset`, `durability_state`, `manifest_generation`, `acknowledged_at_utc`. `durability_class = ordinary | barrier`; `durability_state = synced`. The existing four-field `original_append_result` remains `event_id`, `sequence_id`, `segment_ref`, `byte_offset`. Neither gains a pending state, origin flag, replacement ID or new field.

Both source durability barriers remain required. SP-286 then requires durable canonical all-member first-receipt issuance before any successful acknowledgement or receipt-dependent terminal publication. A failed/unknown barrier or uncommitted custody returns no success. `acknowledged_at_utc` records the selected successful first issuance time, not delivery, EventRecord seal time or a reconstructed historical time. Exact retained replay returns that original time and all original receipt coordinates, even when current physical source coordinates differ.

### Exact closed schema routes

`Plans/event_append_receipt_contracts.schema.json` owns these exact definitions:

| Definition | Contract |
|---|---|
| `#/$defs/AppendReceipt` | Existing closed eleven-field synced receipt, unchanged. |
| `#/$defs/member` | Closed original `event_id`, `sequence_id`, `byte_offset`, `frame_length`, `frame_sha256`. |
| `#/$defs/active_durable_group` | Strict initial-native writer `schema_version = 2.0.0`; complete last promoted group, required `restore_admission`, exact ordered members and `group_digest`. |
| `#/$defs/restore_admission` | Closed already-authenticated operation admission for one actual completed restore occurrence/publication. |
| `#/$defs/restore_admitted_member` | Closed original event/scoped semantic tuple and actual owner-operation identity/digest. |
| `#/$defs/custody` and `#/$defs/custody_v1_reader` | Exact retained issued-only `pm.storage_value.event_append_receipt_custody.v1@1.0.0`; unchanged original reader, no pending phase or nullable receipt. |
| `#/$defs/custody_v2` | Strict current issued-only `pm.storage_value.event_append_receipt_custody.v2@2.0.0`, adding only required `original_event_value_commitment`. |
| `#/$defs/custody_reader` | Explicit disjoint exact v1/v2 retained-value reader; never a writer. |
| `#/$defs/original_event_value_commitment` | Closed original complete-value codec/domain/version/schema commitment below. |
| `#/$defs/full_value_request` / `#/$defs/full_value_result` | Separate original full-event input and exact retained receipt/ref/commitment output. |
| `#/$defs/active_durable_group_v1_reader` | Read-only earlier external draft shape; not evidence of deployed native v1 or a native migration route. |

The current group has exactly `schema_version`, `storage_instance_id`, `commit_group_id`, `durability_class`, `segment_generation`, `segment_name`, `durable_start_offset`, `durable_end_offset`, `manifest_generation`, `members`, `group_digest`, `restore_admission`. Numeric group/member fields use exact nonnegative uint64; membership is nonempty, unique and in strict source/sequence order, covers the complete tiled frame span and never crosses segments. The original promotion generation is immutable inside the group; later enclosing-manifest maintenance generations cannot relabel it. SP-286 owns these semantic assertions as well as structural validation.

The retained v1 custody value has exactly `schema_id`, `schema_version`, `storage_instance_id`, `event_id`, `scope_partition`, `event_type`, `idempotency_key`, `producer_semantic_digest`, `group_digest`, `first_append_receipt`, `redaction_profile`, `original_segment_ref`. The original opaque segment ref is outside the unchanged public receipt. It joins Storage's original segment generation/name at first issuance and the unchanged four-field original result at replay. The event ID/raw key hash and actual selected Storage instance must match. New v2 retains all those fields, changes only the schema ID/version to v2/2.0.0 and requires `original_event_value_commitment`. Neither version stores raw event payload, command outcome or UI assertion.

`restore_admission` is required-present null for an in-place root without this restore path, or a closed object with `schema_version = 1.0.0`, `storage_instance_id`, `restore_occurrence_id`, `restore_journal_ref`, `restore_journal_sha256`, `recovery_epoch`, `restored_boundary_sha256`, `publication_id`, and ordered `members`. Each admitted member has exactly `event_id`, `scope_partition`, `event_type`, `idempotency_key`, `producer_semantic_digest`, `owner_id`, `owner_operation_id`, `owner_operation_sha256`. Its member order and event IDs match the complete active group. Event identities, owner/operation pairs and scoped type/idempotency identities are unique. Raw requests, payloads, first-receipt placeholders and caller origin flags are forbidden.

The existing EventRecord envelope, scope partition recipe, native nonempty idempotency keys and producer-semantic digest remain unchanged. Scope partition is exactly `app` or `project~` plus unpadded base64url of exact UTF-8 project ID. Structural schema validity does not replace original owner admission or source/receipt/identity joins.

### Exact group and admission digest bytes

`group_digest` is lowercase SHA-256 over the exact shortest MessagePack ARRAY encoding of this ordered tuple, excluding `group_digest` itself:

```text
["pm.active_durable_group.v2",
 schema_version, storage_instance_id, commit_group_id, durability_class,
 segment_generation, segment_name, durable_start_offset, durable_end_offset,
 manifest_generation,
 [[event_id, sequence_id, byte_offset, frame_length, frame_sha256], ...],
 admission_array]
```

For null `restore_admission`, `admission_array` is `[]`, not a MessagePack null. For present admission it is exactly:

```text
[schema_version, storage_instance_id, restore_occurrence_id,
 restore_journal_ref, restore_journal_sha256, recovery_epoch,
 restored_boundary_sha256, publication_id,
 [[event_id, scope_partition, event_type, idempotency_key,
   producer_semantic_digest, owner_id, owner_operation_id,
   owner_operation_sha256], ...]]
```

Use exact valid UTF-8 string bytes without normalization, case folding or trimming. Use positive fixint for integers 0–127; otherwise the smallest of uint8 (`0xcc`), uint16 (`0xcd`), uint32 (`0xce`) or uint64 (`0xcf`) that holds the nonnegative value, followed by the unsigned big-endian body. Values outside 0 through 18446744073709551615 reject before publication. Do not pass exact integers through a rounded JavaScript Number; native uint64 or equivalent exact integer handling is required.

For a string of UTF-8 byte length n, use fixstr (`0xa0 + n`) for n < 32, str8 (`0xd9` plus one length byte) for n < 256, str16 (`0xda` plus two big-endian length bytes) for n < 65536, or str32 (`0xdb` plus four big-endian length bytes) for n < 2^32. Append the exact bytes. For an array of n elements, use fixarray (`0x90 + n`) for n < 16, array16 (`0xdc` plus two big-endian length bytes) for n < 65536, or array32 (`0xdd` plus four big-endian length bytes) for n < 2^32, followed by recursively encoded elements in order. Longer representations reject. Maps, signed integers, floats, booleans, nulls, binary/extension types, implicit coercion and alternate nonshortest encodings do not enter these digest tuples. Length bounds are codec representation bounds, not new EventRecord payload limits.

For the external v1 reader only, use the identical common group field/member order with domain `pm.active_durable_group.v1`, its `schema_version = 1.0.0`, and no final admission-array element. This preserves interpretation of the retained external draft vector without enabling a native v1 writer or claiming deployed compatibility. Current native group publication always uses v2.

`owner_operation_sha256` is lowercase SHA-256 of the same strict MessagePack array codec over:

```text
["pm.first_append_receipt.owner_operation.v1",
 owner_id, owner_operation_id, restore_occurrence_id, restore_journal_sha256,
 recovery_epoch, accepted_lease_revision, event_id, scope_partition,
 event_type, idempotency_key, producer_semantic_digest]
```

The actual owner accepted-operation observation supplies exactly these named operation facts; it is not caller-reconstructed authority. `accepted_lease_revision` binds the current transient acceptance at seal. The compact protected group retains its authenticated digest after the transient observation is gone; no permanent owner-request copy is required.

`restored_boundary_sha256` is lowercase SHA-256 over:

```text
["pm.first_append_receipt.restored_boundary.v1",
 storage_instance_id, segment_generation, segment_name, byte_offset, sequence_id]
```

Those are the actual selected backup's existing durable seglog boundary fields; `byte_offset` denotes its verified durable end. `restore_journal_sha256` hashes the exact bytes of the actual completed existing restore journal. This does not prescribe a new journal schema or change its native encoding to match a synthetic adapter. Existing EventRecord/source/producer digest algorithms remain separately owned and unchanged.

### Complete original EventRecord value digest and resolver

NEW `original_event_value_commitment` has exactly `schema_id`, `schema_version`, `codec`, `domain`, `event_schema_id`, `event_schema_version`, `sha256`. Its schema ID and domain are both `pm.storage.original_event_value_commitment.v1`; version is `1.0.0`; codec is `pm.seglog_frame_v2.event_value.canonical_msgpack.v1`; event schema is `pm.event.v0@2.0.0`. `sha256` is lowercase SHA-256 of this exact ordered canonical MessagePack array:

```text
["pm.storage.original_event_value_commitment.v1", "1.0.0",
 "pm.seglog_frame_v2.event_value.canonical_msgpack.v1",
 event.schema_id, event.schema_version, COMPLETE_ORIGINAL_EVENTRECORD_MAP]
```

The final element is the complete original closed EventRecord map, including all required-present nulls, full nested payload/values and all three Storage-assigned fields. Use the general canonical MessagePack value codec in Case L-2/SP-026/SP-236: exact integer range/types, UTF-8-byte-sorted unique map keys, ordered arrays, nil/bool/string types and shortest lossless float32/float64 with negative zero preserved. Reject unsupported/unrepresentable/nonfinite values without coercion. The simpler group/operation digest tuple restrictions above remain unchanged and do not restrict this separate full-map preimage. Existing full EventRecord payload admission remains; the hash wrapper creates no new event-size limit.

The preimage excludes physical framing, current source selection and locators. A frame hash, producer-semantic digest or unopened group digest is not this value commitment. SP-286 computes it from independently authenticated original values during actual first all-member issuance, keeps exact v1/v2 stored readers and owns installation, backup, restore, original-source/candidate fencing and immutable lifetime.

The full-value request has exactly `event`, under the unchanged complete canonical EventRecord schema. The result has exactly `first_append_receipt`, `original_segment_ref`, `original_event_value_commitment`, importing their same original shapes. The resolver requires genuine v2 stored authority, exact original event identity and recomputed full-value equality, independently of semantic duplicate selection. Returned fields must equal the actual selected immutable row after final source/row/request/output checks. Missing v1 witness is unavailable; no legacy backfill or semantic fallback is permitted for a dependent full-value write. Current source availability, index authority and mutation permission remain separate.

### Versioned caller interfaces and authority boundaries

The four existing operation roles now have explicit `2.0.0` bindings; the additional full-value resolver is `1.0.0`. They operate in the actual Storage instance, never a caller-provided substitute database. They create no public UI command or event membership.

| Binding | Inputs and successful result | Required refusal boundary |
|---|---|---|
| `storage.first_append_receipt.issue.v2` | The existing writer's authenticated selected source/manifest, complete protected group, normal append-class/identity admission, both actual durability barriers and held canonical store/gate. Storage derives and durably commits the complete group once; only then may the unchanged receipts be exposed. | Caller row, mapping, acknowledgement timestamp or index assertion cannot supply authority. Changed gate/source/dedupe/segment/restore controls, prior issuance loss or partial custody fences; no partial successful group. |
| `storage.first_append_receipt.resolve.v2` | An incoming EventRecord identity/semantic request under its existing replay policy; Storage resolves retained original global/scoped identity and actual canonical custody, then returns the exact original eleven-field receipt. | The request cannot override source, group, locator, custody row or retained mapping. Missing/conflicting custody/identity returns unavailable/fenced behavior under existing caller failure contracts, without append or domain effects. |
| `storage.first_append_receipt.group_gate.v2` | Existing writer/recovery/maintenance operation against actual current Storage/generation/lease; complete immutable current-group custody is authenticated before advance, replacement or retirement is released. | A phase marker or stale dedupe state is insufficient. Every operation that could lose/replace an unissued group remains excluded, including a recovery event append. |
| `storage.first_append_receipt.backup_gate.v2` | Existing coherent backup/restore operation and actual selected canonical boundary; settle current issuance, capture/verify all required receipt authority with source/manifest/store identity, and restore covered exact receipts through existing coordinator. | Pending authority backup, partial/missing required custody, epoch skew, changed confirmed selection or unsupported state cannot produce successful authority restoration or a replacement first receipt. |
| `storage.first_append_receipt.resolve_full_value.v1` | Exact original complete EventRecord input; authenticate retained v2 and return only the original receipt, original opaque segment ref and matching complete-value commitment. | An asserted hash, alternate semantic duplicate ID, changed typed value, legacy v1 row or unavailable original authority cannot supply full-value proof. Current event access/effects remain independent. |

NEW explicit compatibility entrypoints, installed with the actual SP-286 v2 owner, map the old `storage.first_append_receipt.issue.v1`, `resolve.v1`, `group_gate.v1` and `backup_gate.v1` selectors to the respective `issue.v2`, `resolve.v2`, `group_gate.v2` and `backup_gate.v2` selectors under that same prefix. No physical alias or substitute authority is introduced. Every new first issuance through any selector, mandatory backup or recovery writes strict v2; already-issued v1 remains immutable and retains semantic replay only. Unknown, wrong-operation or uninstalled selectors fence. This mapping requires actual coordinated installation/activation; the fixture's post-activation dispatch tests do not execute that native gate. Caller-specific full-value adoption remains separate.

These are semantic caller contracts around existing Storage owners, not a new generic dispatch/authentication service or a prescribed fixture API. No new result/error vocabulary is introduced. Callers use their existing refusal/recovery contracts when original receipt authority is unavailable and must not treat absence as success.

First issuance validates full original frame/source/group, current dedupe checkpoint and actual global/scoped identity values, Storage instance and both barriers under the held gate. Replay instead validates retained global/scoped schemas, exact key/raw/original-result identities, custody scope/type/idempotency/semantic digest and original receipt/result. A matching scoped alternate incoming event ID resolves the retained original event ID. Replay never reassigns first time, group/generation, original segment ref or coordinates, and does not require retired frames, historical redb snapshots or old owner requests. It provides append evidence only; current event availability and downstream mutation permission remain independent.

### Restore caller protocol and crash handoff

SP-286 preserves verified older restore with existing risk/disclosure/confirmation, exact `pre_restore` or quarantine and completed-journal ownership. A restored absence cannot prove an old event was never issued. Covered receipts replay; lost old requests/pending commands/idempotency retries cannot be renamed into fresh work. Genuine fresh-operation admission comes only from an actual native owner accepting a new logical operation after the coordinator opens the actual completed restore occurrence/session. An EventRecord, caller flag, UUID, root path or equal Storage identity cannot instantiate that acceptance.

The authenticated owner call supplies its actual operation identity and exact native event/scoped idempotency/semantic tuple. The writer issues a transient capability bound to those facts, the completed restore journal/epoch/boundary and current accepted lease revision, for exactly one logical publication. Freeze/revalidate actual owner acceptance and current controls before promotion. The source/group watermark and compact `restore_admission` are protected together; the capability is consumed at this publication, not at receipt delivery. Retrying a promoted capability returns its same publication and cannot append another group. No successful receipt or dependent terminal escapes before SP-286's durable all-member custody.

On in-place restart after promotion but before issuance, current Storage/coordinator authority authenticates the same selected protected root/group and current restore occurrence. Lost transient capabilities, old lease and owner-request handles are not reconstructed. The compact protected group carries the prior admitted tuple; after complete source/current-control/barrier verification it first-mints at the subsequent successful issuance time. A later restart after issuance replays the original eleven fields. A restored pending image or different restore occurrence cannot use that route. Missing actual protected origin/journal/current controls fences pending first mint; a repaired matching hash alone is insufficient.

Event-specific producers must adopt their actual accepted-operation interface and retain their own identity semantics. This shared contract supplies no native operation ID recipe, sequence-gap exception, automatic event admission or permission to relabel lost work. The first-native v2 group and same physical issued-receipt family with strict stored v2, exact retained v1/v2 readers and the explicit selector map activate together under SP-286's existing migration contract. No separate durable restore journal, accepted-operation registry, capability store or historical source mirror is created.

### CV-339 - First AppendReceipt Shared Shapes And Interfaces

```yaml
plan_unit_id: CV-339
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Preserve the exact existing eleven-field AppendReceipt and four-field original append result.
  SP-286 durable first-receipt custody follows both source barriers and precedes exposure.
  The First append receipt shared contract defines exact closed current v2 protected-group,
  compact restore-admission and issued-only custody shapes, strict ordered MessagePack digest
  bytes, versioned Storage caller interfaces, immutable retained replay and the distinct
  actual fresh-owner/restore/in-place-restart handoff. The earlier external v1 reader is not
  deployed native compatibility. Strict stored custody v2 adds the original complete EventRecord
  value commitment and a separate full-value resolver; exact retained v1/v2 readers and explicit
  legacy selector mapping preserve original public semantics without backfill. This shared
  prerequisite grants no event-specific adoption.
gui_related: false
gui_classification_reason: Defines internal shared receipt shapes and Storage caller authority, not a new GUI surface.
depends_on: [CV-309, CV-317, CV-318, SP-286, DL-045]
unblocks: []
acceptance_criteria:
  - Exact eleven receipt and four original-result fields remain unchanged; only committed first issuance yields a successful acknowledgement.
  - Current group v2 has required closed restore admission and exact ordered uint64/UTF-8 MessagePack digest bytes without coercion.
  - Only actual owner/session authority supplies new-operation admission; retry inputs and repaired hashes cannot replace it.
  - Protected promotion consumes one publication capability; in-place restart first-mints only genuinely unissued protected work and preserves later replay.
  - Retained identity/custody joins reject contradictions without reacquiring retired source or rerunning domain actions.
  - Full-value commitment uses the exact domain/version/codec/schema-bound complete EventRecord map; framing and producer-semantic digests are not substitutes.
  - Original request/result shapes and exact v1/v2 dispatch preserve types; legacy selectors never imply full-value proof or new v1 writer fallback.
validation_surfaces:
  - Plans/event_append_receipt_contract_fixtures.json
  - Plans/event_append_receipt_contracts.schema.json
  - Plans/storage_value_registry.json
  - reports/event-authority-20260911/step-08-append-receipt-validation.md
  - Plans/event_append_receipt_full_value_fixtures.json
  - reports/event-authority-20260911/step-08-full-value-validation.md
risk_class: shared_receipt_identity_codec_or_restore_authority_drift
reasoning_tier: high
context_scope: shared_first_append_receipt_contract_only
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/event_append_receipt_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Contracts_V0.md#CV-318
  - Plans/storage-plan.md#SP-236
  - Plans/Decision_Log.md#DL-045
negative_constraints:
  - No new receipt wire field, EventRecord field, event membership, error enum, retention policy or generic journal/service.
  - No automatic event depth, native/runtime proof, critical/MVP-array change, WorkNode, NodeSeed, readiness or governance seal.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/event_append_receipt_contracts.schema.json, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Decision_Log.md#DL-045
