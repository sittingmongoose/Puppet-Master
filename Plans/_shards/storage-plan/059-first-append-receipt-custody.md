# Shard 059: First append receipt custody

Source: `Plans/storage-plan.md`

Source lines: L21570-L21743

Source SHA256: `b3e31951b704c491ad0a76760157ed490c580f9c553f2ee9d66d7bc01e44e3cd`

---

## First append receipt custody

SP-286 defines Storage's shared first-acknowledgement prerequisite under DL-045. CV-339 owns its shared shapes, exact digest bytes and caller interfaces. This contract preserves the existing eleven-field `AppendReceipt`, four-field `original_append_result`, two source durability barriers and EventRecord semantics. It adds one canonical issued-receipt family and five explicitly scoped Storage bindings. Event-specific owners must separately adopt the resolver and complete their own producer, consumer, checkpoint, recovery and withdrawal contracts; this shared prerequisite grants no event-family admission or automatic depth closure.

### Canonical issued-only family and lifetime

The same `event_append_receipt_custody` family now has a strict `2.0.0` writer and exact retained `1.0.0`/`2.0.0` readers. It uses the literal table `event_append_receipt_custody.v1` in the existing redb database selected by the actual `storage_instance_id`. The exact UTF-8 key is `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `event_id_sha256` is lowercase SHA-256 of the raw event ID's exact UTF-8 bytes, without normalization. New values use canonical MessagePack and the closed `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`, schema ID `pm.storage_value.event_append_receipt_custody.v2`, version `2.0.0`. Exact earlier issued values retain `pm.storage_value.event_append_receipt_custody.v1@1.0.0` through the unchanged `#/$defs/custody` and exact `#/$defs/custody_v1_reader`. The disjoint `#/$defs/custody_reader` selects retained values only; it is never a writer schema. The raw event ID must match its actual key hash, selected Storage instance and embedded receipt. There is no flat-table alias, cross-database fallback or alternate store-instance mapping.

The family is `canonical_non_rebuildable`, with mandatory backup. The sole canonical writer is `storage.first_append_receipt.issue.v2`; `storage.first_append_receipt.resolve.v2` reads original receipts, `storage.first_append_receipt.group_gate.v2` reads complete current-group custody before source advance or retirement, and `storage.first_append_receipt.backup_gate.v2` coordinates coherent backup/restore. `storage.first_append_receipt.resolve_full_value.v1` separately authenticates the original complete EventRecord value from v2 custody. These are versioned Storage binding identities, not a new event, projector, global checkpoint or registry service.

A row contains only issued custody: exact Storage/event/scoped idempotency/type/producer-semantic identities, immutable `group_digest`, required `original_segment_ref`, required nonnullable `first_append_receipt`, required `original_event_value_commitment` for new v2 values, and `redaction_profile = no_secrets`, alongside its schema fields. It has no prepared/pending phase, payload copy or nullable receipt. Initial issuance authenticates Storage's original opaque segment-ref binding to the receipt's original `segment_generation` and `segment_name`; the same row retains that original ref. Later resolution reconstructs the existing four-field original result from `event_id`, `sequence_id`, `original_segment_ref` as `segment_ref`, and `byte_offset`. No new mapping family is created, and the original result is never changed to a current compacted locator.

The unchanged `RP-EVENT-IDENTITY-APPROOT@1.0.0` applies: app-data-root lifetime, `retention_mode = indefinite`, `anchor_kind = creation`, `retain_indefinitely = true`, null TTL/cardinality/byte ceilings, `overflow_action = fail_closed`, `hold_eligible = false`, `expiry_action = none`. Existing lifetime-scoped event/idempotency identity requires the original successful result for that same lifetime. This retains content-free acknowledgement evidence, not raw payloads. Derived dedupe indexes remain derived and cannot rebuild first acknowledgement time. Loss of this canonical family requires truthful loss disclosure and unresolved mutation fencing. Its `tier_0_launch_critical` classification is the explicit shared prerequisite for the already required durable acknowledgement/startup boundary; it neither edits nor implies additions to `critical_family_ids` or `mvp_required_family_ids` arrays.

### Explicit stored-value and call-selector activation

This is a NEW bounded same-family technical successor under DL-045. The registry root, `value_schema_id`, `schema_version` and required/optional/nullable lists describe the strict current v2 writer. Its inline `#/$defs/custody_v1_reader` preserves the exact original v1 schema; `#/$defs/registered_read_value` explicitly dispatches only the two closed retained versions. The external schema routes above own the same definitions. A generic current-writer validator does not become a retained reader merely because the physical key is unchanged.

After the actual Storage instance installs and activates the complete v2 binding set, NEW explicit compatibility entrypoints map `storage.first_append_receipt.issue.v1` to `issue.v2`, `resolve.v1` to `resolve.v2`, `group_gate.v1` to `group_gate.v2`, and `backup_gate.v1` to `backup_gate.v2`, all under the same `storage.first_append_receipt` prefix and within the same actual owner/store/admission boundary. These are call-selector contracts, not physical key aliases or pre-existing authority. Unknown, wrong-operation, uninstalled or withdrawn selectors fence under existing failure behavior. Install both exact readers, the codec, mapping, v2 issuer and all mandatory group/backup/recovery paths before enabling new first issuance.

Every new all-member issuance after activation writes strict v2, including a legacy issue entrypoint, mandatory backup settlement or recovery. No v1 writer fallback is permitted. An intact already-issued v1 group instead returns its unchanged original receipt and remains v1 during group advance, backup and restore. Legacy semantic resolution preserves its eleven-field receipt/four-field result contract and does not select the full-value interface. Each full-value-dependent caller must explicitly adopt that separate interface. Existing callers naming the four old selectors receive this exact compatibility mapping only after its installation; they receive no automatic original-value or domain-depth proof.

### Original complete value commitment and final issuance

At the actual first issuance, compute CV-339's exact domain/version/codec-bound commitment from each independently authenticated ORIGINAL complete EventRecord value, including `sequence_id`, `observed_at_utc` and `persisted_at_utc`, every required-present null and every nested value. Store that commitment with the original receipt in the SAME all-member canonical transaction. The complete original frame/header/CRC/source/group/dedupe and both barriers still require their own original owner verification. A current index value, producer-semantic digest, supplied witness or detached validator return cannot supply the original value.

The value selected from a source/validation helper must exactly join the actual admitted original owner source/group before preparation and again before publication. Independently bind the complete expected custody row set to that source before later helpers. Validate every pending row and transaction, then compare the exact typed expected rows, pending/postimage/transaction, selected preimage, actual original source/owner/restore/gate facts and any caller predicate after all dependent validators and copies. Schema validity and host-language equality alone are insufficient: booleans, integers, integral floats and signed zero preserve distinct canonical types/bytes. No dependent resolver follows the final complete guard before the original owner's atomic issuance. A later backup, output or domain refusal preserves an already real issuance; it does not erase or restamp it.

The commitment excludes relocatable frame prefix/header/CRC/physical coordinates while retaining the full immutable EventRecord value. It is bounded non-secret hash metadata within the unchanged `RP-EVENT-IDENTITY-APPROOT@1.0.0` lifetime. It adds no raw event/source/control retention, group-opening archive or Platform lifetime. The original public receipt and four-field result remain unchanged.

### Protected last group and immutable promotion terms

The manifest at `storage/seglog/manifest.v1.msgpack` carries the complete latest protected `active_durable_group` using CV-339's closed version `2.0.0` definition. This is the first native writer contract for this group custody. The retained `active_durable_group_v1_reader` describes an earlier external draft only; its presence does not establish deployed native v1 data, a native migration edge or a fallback writer. The manifest remains disk-first publication/recovery control and never a second EventRecord source.

Assign `commit_group_id` once at actual seal within the Storage instance, check it against existing group/receipt identity and reject conflicting reuse. Exact-publication retry preserves it; timestamps are not its identity. All member event IDs and sequence IDs are unique, ordered by strictly increasing sequence and physical position. Their complete frame ranges tile the group's span and end exactly at `durable_end_offset`; a group never spans two segments. Validate native frame identity, CRC, bounds, schema and exact bytes before issuance, not just hashes supplied by a projection. CV-339 defines the exact group digest tuple and compact restore-admission bytes.

`active_durable_group.manifest_generation` is the immutable generation at that group's actual promotion; it equals the enclosing selected manifest generation at first publication. After issuance, later maintenance may advance the enclosing manifest generation while preserving the entire group unchanged. The protected group records the last append group, not the active segment's current capacity. Current segment/watermark metadata remains separately authoritative. A fresh empty store may have no current group; after promotion, only the next actual append group may replace it, after complete receipt issuance. Rotation can preserve a group pointing into the just-sealed segment. An unissued group cannot undergo maintenance. First mint requires the original promotion still be the actual current generation with exact source/watermark correspondence; a later maintenance generation with missing custody violates the gate and fences recovery. Retained issued-receipt replay does not require that old manifest generation to remain current.

Case L-2 seal and allocation rules remain exact: ordinary sealing on the first of 10 ms, 64 records or 1 MiB; immediate `barrier` commit for existing barrier-required inputs; 4,096-ID durable leases before sequence issuance; unused leased IDs abandoned after crash and never reused; only `allocator_lease_abandoned | corruption_loss | retention_compaction` gap reasons. Existing 48-byte frame prefix, 4 KiB header, 16 MiB inline payload and namespace synchronization requirements remain unchanged. The digest's representation bounds create no event-size cap, oversized-frame exception or new sequence-gap reason. Recovery processes any required ordered groups under the same gate without inventing gaps or changing original EventRecord bytes.

### Publication, first issuance and complete group exclusion

Under the existing writer gate, validate current normal writer/schema/registry/no-secret/scope/permission/dedupe admission, actual append input durability class, all source frames and exact original segment bindings. Global/scoped dedupe values and the existing checkpoint must agree with the verified actual source tail. Application partition is exactly `app`; project partition is `project~` plus unpadded base64url of exact UTF-8 project ID. Native idempotency keys remain nonempty. This contract changes no EventRecord producer-semantic digest recipe.

Seal the actual complete group. Complete frame writes and active-segment `sync_all`, then atomically publish its complete terms with the manifest watermark and synchronize the parent directory. These remain the two source durability barriers. After both succeed, durably commit ALL member custody rows in ONE redb transaction before exposing any successful receipt or releasing any receipt-dependent terminal write. No cross-redb/seglog transaction is asserted. `acknowledged_at_utc` is the UTC time selected for that first successful durable issuance transaction; the complete group shares one selected time. It is not delivery time or `persisted_at_utc`, which remains commit-group seal time. A tentative timestamp in an uncommitted candidate is not a receipt.

The held gate binds actual source/control identity and generation, manifest/group/source bytes, original segment mappings, complete current dedupe admission, selected store, gate lease/revision and canonical custody preimage. Revalidate those actual owner values immediately before the atomic commit. An independently repaired mapping/candidate or source/dedupe/barrier set still invalidates the attempt when held facts changed. Validate the exact all-member row set against independently authenticated source and owner terms, not merely mutual hashes or a caller row. Prevent precommit disclosure and verify committed custody before release.

`storage.first_append_receipt.group_gate.v2` encloses every operation that could replace, advance or lose an unissued current group: next append, manifest/source generation advance, recovery publication, intent resumption, rotation, compaction/retirement and the recovery event's own append. Startup checks it before those operations or mutation admission. Both source advance and retirement authenticate the complete current-group rows and immutable receipt/group terms; an `issued` phase marker alone is insufficient. Revalidate current source/dedupe for such mutations even after issuance. Once that admitted retirement completes, passive original receipt reads do not reacquire retired source controls.

Current-group rows are either all absent with authenticated never-issued authority, or all present and exactly compatible with one completed issuance. A proper subset, mixed first timestamps, duplicate keys, mixed Storage identities, conflicting group/receipt terms, or evidence that absent rows were previously issued is corruption/loss/backup skew. Fence rather than filling missing rows or minting a second first acknowledgement. Previously issued rows remain immutable on retries.

### Crash and uncertainty behavior

Before manifest promotion there is no successful receipt. Valid unacknowledged tail frames follow existing Case L-2 recovery and acquire their first actual recovery group/class/publication; do not assert an earlier acknowledged group existed. An OS-visible manifest rename with unknown directory synchronization is not prior durability proof. Authenticate the actually selected old/new state and establish both actual barriers.

After both source barriers but before issuance, the intact last protected group's original terms permit first mint at the subsequent actual issuance time only after revalidation and actual barrier establishment. Preserve original coordinates and promotion generation. After issuance, lost caller delivery or an interrupted domain terminal commit returns the exact stored original receipt. Domain owners independently reconcile action execution and original terminal outcome; the generic reader does not rerun the action.

Corrupt/ambiguous source, loss at or below the watermark, missing protected terms or lost issued authority follows existing integrity and verified-restore fencing. Missing old receipts cannot be reconstructed from the current clock, index, current locator or arbitrary surviving frames. Only an authenticated never-issued protected group has the first-mint route. A recovery event blocked by this gate does not bypass it: use existing persistent recovery intent/report and read-only disclosure until its append is valid, without inventing an event or converting an unknown barrier into success. Buffered redb commits, OS visibility and self-consistent supplied hashes do not establish native durability/authentication.

### Retained original receipt resolution

`storage.first_append_receipt.resolve.v2` receives the incoming EventRecord identity/semantic request and selects the original identity using the existing dedupe policy. Validate actual retained global/scoped value schemas and key/raw identities: selected global key hash and raw `event_id`, scoped `event_id`, both original results' event IDs and custody/receipt event IDs agree. Scope/type/idempotency/producer-semantic joins and original four-field results agree. A legitimate alternate incoming event ID for the same scoped idempotency hit resolves to the original event ID without rewriting it. Contradictory retained identity fails even if a caller repairs both index hashes.

Read and authenticate the canonical custody row from its actual table/store/key. Validate its closed schema, raw/key Storage and event identity, source semantic tuple, original result and immutable receipt. Return the exact eleven fields. Lawful physical relocation preserves the receipt and four-field original result; a current frame may have different coordinates. No old raw frame, source manifest, transient policy/owner request, historical redb snapshot or retired segment object is needed to reproduce an intact issued receipt. Current EventRecord-byte availability and current mutation admission are separate checks; passive append evidence grants neither. Integrity and domain-specific authorization still constrain subsequent effects.

### Separate retained full-value resolution

`storage.first_append_receipt.resolve_full_value.v1` receives only the closed `#/$defs/full_value_request`, containing the original complete `event`, and returns `#/$defs/full_value_result`: exact original `first_append_receipt`, `original_segment_ref` and `original_event_value_commitment`. It does not accept a caller-asserted hash, row, source locator or witness. Resolve and authenticate the same actual canonical stored identity as semantic replay, require exact v2 and exact ORIGINAL event ID, and recompute CV-339's full-value commitment over the supplied available value. An alternate incoming ID allowed by semantic idempotency replay does not satisfy this original-value request. Compare the exact returned values to the actual selected immutable row and recheck complete request/owner/candidate facts after all resolvers, validators and copies before disclosure.

No retired raw frame, original CURRENT/manifest, historical transaction/control object, old policy request or group opening is needed once genuine v2 custody is available. Authentic native canonical origin remains mandatory; self-consistent copied rows/hashes do not establish it. Current event availability, CURRENT-selected SP-278 source/index authority, permission, action execution and domain terminalization are independent caller obligations. This passive proof grants no mutation or original source access. Relocation may change framing/locators but must preserve the exact committed value; this successor supplies no reconstruction or authenticated migration mapping for changed value representations.

Exact v1 rows retain their original semantic replay but have no full-value witness. No backfill, conversion-on-read or inference from surviving current bytes, a bare group digest or current clocks is admitted by this successor. Missing or unsupported proof fences dependent completion without downgrading to semantic replay. Previously retained caller-specific immutable full-value proof remains separately usable under its owner contract. Existing settled Hold/Home custody is not reopened, and their unfinished paths plus Restore and Platform each require explicit reviewed adoption.

### Settled authority backup and confirmed rollback

`storage.first_append_receipt.backup_gate.v2` joins the existing shared-boundary backup mechanism. Settle the current group's complete issuance first, then hold the group gate or an equivalent coherent canonical snapshot boundary through capture of selected source/manifest/store identity and all required issued custody. A supported authority backup contains no pending group. Verify complete custody, original generation bounds and source/identity coherence; reject proper subsets, missing required older rows and source/custody epoch skew. Existing canonical backup membership, staging, synchronization, verification and journaled offline restore remain required.

A settled older backup can still omit receipts issued later on the live root. Restoring it does not prove those identities were never issued. Preserve supported older-backup restore and the exact existing `data_loss_risk.class = none | post_backup_writes_will_be_lost | unknown_due_corruption`; non-`none` requires explicit confirmation with boundary/family disclosure. The recovery shell's confirmation binds the selected backup identity and exact bytes/hash, exact current canonical source/custody bytes/hash, verified restored boundary, risk class and affected family identities. A changed selected backup or current boundary requires fresh confirmation. Capture verified readable `pre_restore` authority, or quarantine exact unreadable current bytes, through the existing coordinator before promotion. Verified pre-restore authority may preserve/resolve an exact historical receipt through its owner; unreadable quarantine cannot prove absence.

Covered intact rows replay exactly. A missing post-backup original receipt remains unavailable: never restamp an old request, restored pending command, idempotency retry or reconstructed source as new because it is absent from restored indexes/custody. In particular, settled backup A followed by live issued/delivered B and restore A cannot produce a replacement first receipt for B. A pending forensic/crash capture is not supported authority backup and cannot establish never-issued status after restore; live execution might have issued since capture. Capturing pending, then issuing/delivering live, then restoring that pending image must fence even when the captured admission was once valid.

### Actual fresh-operation admission after verified restore

Confirmed rollback does not make the restored store permanently read-only. A genuinely new native owner operation may append after normal source, sequence-lease, registry/producer, permission, no-secret and dedupe admission succeeds. Its owner must distinguish actual new acceptance from retry of restored/lost work; inability to prove that distinction makes this scoped first-mint path unavailable. The generic writer cannot rename an old operation or accept a caller's fresh-origin flag.

After verified terminal restore/reopen, `StorageRecoveryCoordinator` establishes the actual restore occurrence from its existing completed journal identity, exact journal bytes/hash, new recovery epoch and verified selected restored boundary. A new restore creates a new occurrence even for identical backup bytes. Equal Storage instance, root path, timestamp or self-selected UUID does not prove it. The coordinator/writer open a transient session under current mutation admission. An actual native owner accepts a new logical operation after that session opens and supplies its owner-operation identity and exact event/scoped idempotency/semantic tuple through authenticated in-process/dispatcher authority. A retry/read EventRecord input cannot instantiate this owner call.

A transient capability binds actual owner ID/operation ID and complete accepted-operation digest, event ID, scope partition, event type, idempotency key, producer-semantic digest, completed restore occurrence/journal/epoch/boundary, current acceptance lease revision and one logical publication ID. Callers supply neither its authority nor replacement owner records. Freeze and revalidate owner acceptance, current lease revision, restore control and source/dedupe/segment terms under the existing writer gate. Any late change revokes the attempt even if rows/hashes are repaired. Native owner identity recipes remain with the actual owner, not fixture-generated IDs.

The protected group carries CV-339's closed `restore_admission` with complete ordered admitted members; null applies to an ordinary in-place root without this restore path. Duplicate event IDs, owner-operation pairs or scoped type/key identities, inconsistent owner joins, or incomplete member coverage fail before publication. A legal ordinary group may carry complete admission, while barrier inputs still seal immediately. The binding contains no raw request/payload, UI claim, pending receipt or nullable first acknowledgement.

Consume the capability for exactly one logical publication at the canonical source/group watermark/digest/admission promotion boundary. Complete the existing source and manifest/directory sync barriers, then keep all receipts/dependent terminals withheld until group-atomic issuance. Before successful promotion, retries revalidate the same owner operation/session. After promotion, retry resolves that same publication and cannot publish another event/group. A consumed capability never authorizes a second group; all source advancement remains gated until custody completes.

### In-place restart after admitted promotion

After protected promotion but before first issuance, an in-place restart loses transient capabilities, accepted-operation adapters and old session leases. Authenticate the actual same current root and selected protected manifest, actual current restore occurrence/journal/epoch and current mutation controls through Storage startup/coordinator authority. The compact canonical group proves the writer's prior admission join; do not reconstruct/reacquire the lost transient capability or original owner request. Revalidate complete source/group/member/dedupe/segment terms, establish both actual barriers and first-mint the entire group once. The successful new issuance time is its first acknowledgement because no prior receipt was issued. A later crash after issuance replays the identical retained eleven fields.

Protected origin must come from the existing selected-store/manifest owner, never a caller's repaired source or matching hash alone. If actual root/journal/epoch/origin is unavailable or contradictory, fence pending first mint until the owner resolves it. The protected admission remains resolvable while the group is unissued. This adds no durable journal, historical snapshot service or indefinite transient-capability retention.

A restored pending image is never an in-place restart of that protected root. A newly completed restore cannot reuse an older occurrence's admission for a new group. Covered issued rows still replay; fresh publication needs the new actual restore occurrence and a newly accepted operation. This distinction preserves confirmed rollback while forbidding replacement acknowledgement for lost old work. Existing native post-loss sequence leases/source adoption/gap classification remain prerequisites; this contract adds no allocator or recovery gap reason.

### Activation, compatibility, withdrawal and verification boundary

**First-open ordering.** Phase 1's prohibition on projectors and redb product writers does not postpone this narrow Storage control/receipt table. Under the existing root continuity/version checks, aggregate lock and coordinator exclusion, materialize the compatible protected-group parser, table and all five active bindings and the explicit compatibility map before the first successful seglog append, including a startup recovery event. Genuine first-run proof permits an empty table and null current group; existing continuity evidence with missing authority never becomes a fresh empty root. Preserve Case L-1's existing version ceilings, first-run tests, migration journal/backup/stamp-last/readback and recovery admission. This foundation bootstrap does not activate settings/session/product writers, projections or analytics.

Existing-store activation verifies its supported preimage and completes the compatible parser/table/gate installation through the actual StorageMigrationCoordinator before new receipt-dependent appends. Its journal, protected backup and canonical migration receipt are existing coordinator authority, not successful seglog events required to create their own first-receipt table. Do not require a receipt-dependent migration/recovery success event before the prerequisite is active. If an actual supported migration edge cannot establish this ordering, fence and retain existing journal/report evidence; do not fabricate a bootstrap receipt or waive the gate. After activation, any such event follows normal current source/dedupe admission and both barriers plus custody. Broader product-schema open, projectors and analytics remain in their existing later build/startup phases.

`StorageMigrationCoordinator` activates compatible manifest parsing, exact value schema/table, all five active bindings and the explicit compatibility map and writer/recovery exclusion together through existing preflight, protected backup, verified target commit and rollback. No new append is enabled before the whole prerequisite is installed. Legacy records receive no fabricated historical receipt. Legacy unacknowledged-tail adoption must prove unacknowledged status under existing recovery, not infer it from absent custody. Missing exact older receipt authority fences receipt-dependent recovery.

Before activation, rollback may restore its verified preimage. After any newly issued receipt, preserve/restore matching new custody or verify an explicitly compatible successor; never downgrade and discard issued authority. Withdrawal fences dependent writers/readers and retains required original evidence until explicit successor verification. Future schema evolution requires an explicit versioned migration; no open extension map, inferred fallback ref or implicit native v1 writer is admitted.

The original bounded evidence is recorded in `reports/event-authority-20260911/step-08-append-receipt-validation.md`; the explicit full-value successor and its limits are in `reports/event-authority-20260911/step-08-full-value-validation.md`. The selector model executes only the post-activation map; native installation, activation and rejection of uninstalled selectors remain NOT_RUN. Synthetic transaction histories, protected-source mirrors, journal observations and object handles are test evidence/adapters, not additional durable product families or native authentication. Native frame codec, redb/fsync durability, actual owner dispatch, recovery-shell confirmation, backup/restore promotion, full backup-family membership, post-loss source/sequence adoption and crash injection remain `NOT_RUN`. Shared static validation is not an event-specific adoption, `DEPTH_PASS`, runtime/readiness claim, critical/MVP-array expansion or governance seal.

### SP-286 - First AppendReceipt Custody And Restore Admission

```yaml
plan_unit_id: SP-286
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Storage retains the exact first successful eleven-field AppendReceipt in the canonical
  event_append_receipt_custody family after both source durability barriers and before exposure.
  The existing writer gate protects the complete last promoted v2 group through one durable
  all-member issuance transaction and authenticates complete current custody before source advance
  or retirement. Retained original replay is independent of old source controls. Settled backup,
  confirmed older restore, unavailable missing-original retries, actual fresh-owner admission and
  compact protected-group restart follow the detailed First append receipt custody contract.
  CV-339 owns the exact shared shapes, digest bytes and caller interfaces. This is a shared
  technical prerequisite only; event-specific adoption and native proof remain separate. New strict
  stored v2 retains the original complete EventRecord value commitment, exact v1/v2 read dispatch
  and explicit legacy-selector compatibility; full-value resolution is independently adopted.
gui_related: false
gui_classification_reason: Defines Storage receipt custody and internal restore admission; existing recovery-shell disclosure remains separately owned.
depends_on: [SP-230, SP-235, SP-236, CV-318, DL-045]
unblocks: []
acceptance_criteria:
  - Both source barriers precede one durable complete-group custody commit; no receipt or dependent terminal write escapes earlier.
  - Original eleven receipt fields and four-field result remain immutable across retries, source relocation and lost delivery.
  - Current-group loss, subset custody, repaired held mappings/dedupe, contradictory identities or late owner/session changes fence.
  - Settled older restore preserves covered receipts but cannot mint a replacement for missing delivered work.
  - Actual new owner acceptance is distinct from retry input; protected v2 admission survives in-place loss of transient handles without inventing prior acknowledgement.
  - Settled backup, current restore controls, explicit migration/withdrawal and unchanged app-root identity lifetime remain mandatory.
  - Strict stored v2 is derived from actual original full values in the all-member transaction; final typed row/source/output guards follow every dependent helper.
  - Explicit legacy selectors enter the installed v2 owner without new v1 issuance; exact old rows remain immutable and full-value proof never backfills or downgrades.
validation_surfaces:
  - Plans/event_append_receipt_contract_fixtures.json
  - Plans/event_append_receipt_contracts.schema.json
  - Plans/storage_value_registry.json
  - reports/event-authority-20260911/step-08-append-receipt-validation.md
  - Plans/event_append_receipt_full_value_fixtures.json
  - reports/event-authority-20260911/step-08-full-value-validation.md
risk_class: duplicate_first_acknowledgement_or_lost_canonical_receipt_authority
reasoning_tier: high
context_scope: shared_first_append_receipt_custody_only
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/event_append_receipt_contracts.schema.json
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Contracts_V0.md#CV-318
  - Plans/storage-plan.md#SP-236
  - Plans/Decision_Log.md#DL-045
negative_constraints:
  - No new EventRecord fields, events, retention policy, generic journal/service, event-specific adoption, native proof or automatic depth closure.
  - No critical/MVP-array change, WorkNode, NodeSeed, readiness or governance seal.
```

ContractRef: ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/event_append_receipt_contracts.schema.json, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Decision_Log.md#DL-045
