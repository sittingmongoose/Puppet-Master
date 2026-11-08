# Shard 060: First append receipt custody

Source: `Plans/storage-plan.md`

Source lines: L22291-L22545

Source SHA256: `4fffea5e8b61d7da2fb58809e76417f0cea4bba610f099b0ff4681daa0d3e5d3`

---

## First append receipt custody

SP-286 defines Storage's shared first-acknowledgement prerequisite under DL-045. CV-339 owns its shared shapes, exact digest bytes and caller interfaces. This contract preserves the existing eleven-field `AppendReceipt`, four-field `original_append_result` and EventRecord semantics; since DL-270 its two source durability barriers are replaced by SP-336's single segment sync, with each group's terms carried in its commit frame (SP-347). It adds one canonical issued-receipt family and five explicitly scoped Storage bindings. Event-specific owners must separately adopt the resolver and complete their own producer, consumer, checkpoint, recovery and withdrawal contracts; this shared prerequisite grants no event-family admission or automatic depth closure.

### Canonical issued-only family and lifetime

The same `event_append_receipt_custody` family now has a strict `2.0.0` writer and exact retained `1.0.0`/`2.0.0` readers. It uses the literal table `event_append_receipt_custody.v1` in the existing redb database selected by the actual `storage_instance_id`. The exact UTF-8 key is `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `event_id_sha256` is lowercase SHA-256 of the raw event ID's exact UTF-8 bytes, without normalization. New values use canonical MessagePack and the closed `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`, schema ID `pm.storage_value.event_append_receipt_custody.v2`, version `2.0.0`. Exact earlier issued values retain `pm.storage_value.event_append_receipt_custody.v1@1.0.0` through the unchanged `#/$defs/custody` and exact `#/$defs/custody_v1_reader`. The disjoint `#/$defs/custody_reader` selects retained values only; it is never a writer schema. The raw event ID must match its actual key hash, selected Storage instance and embedded receipt. There is no flat-table alias, cross-database fallback or alternate store-instance mapping.

The family is `canonical_non_rebuildable`, with mandatory backup. The sole canonical writer is `storage.first_append_receipt.issue.v2`; `storage.first_append_receipt.resolve.v2` reads original receipts, `storage.first_append_receipt.group_gate.v2` reads complete current-group custody before source advance or retirement, and `storage.first_append_receipt.backup_gate.v2` coordinates coherent backup/restore. `storage.first_append_receipt.resolve_full_value.v1` separately authenticates the original complete EventRecord value from v2 custody. These are versioned Storage binding identities, not a new event, projector, global checkpoint or registry service.

A row contains only issued custody: exact Storage/event/scoped idempotency/type/producer-semantic identities, immutable `group_digest`, required `original_segment_ref`, required nonnullable `first_append_receipt`, required `original_event_value_commitment` for new v2 values, and `redaction_profile = no_secrets`, alongside its schema fields. It has no prepared/pending phase, payload copy or nullable receipt. Initial issuance authenticates Storage's original opaque segment-ref binding to the receipt's original `segment_generation` and `segment_name`; the same row retains that original ref. Later resolution reconstructs the existing four-field original result from `event_id`, `sequence_id`, `original_segment_ref` as `segment_ref`, and `byte_offset`. No new mapping family is created, and the original result is never changed to a current compacted locator.

The unchanged `RP-EVENT-IDENTITY-APPROOT@1.0.0` applies: app-data-root lifetime, `retention_mode = indefinite`, `anchor_kind = creation`, `retain_indefinitely = true`, null TTL/cardinality/byte ceilings, `overflow_action = fail_closed`, `hold_eligible = false`, `expiry_action = none`. Existing lifetime-scoped event/idempotency identity requires the original successful result for that same lifetime. Amended 2026-11-01 (DL-270): on macOS that holds once a full flush covers the receipt; an ordinary receipt lost before that goes with its group (Crash and uncertainty behavior). This retains content-free acknowledgement evidence, not raw payloads. Derived dedupe indexes remain derived and cannot rebuild first acknowledgement time. Loss of this canonical family requires truthful loss disclosure and unresolved mutation fencing. Its `tier_0_launch_critical` classification is the explicit shared prerequisite for the already required durable acknowledgement/startup boundary; it neither edits nor implies additions to `critical_family_ids` or `mvp_required_family_ids` arrays.

### Explicit stored-value and call-selector activation

This is a NEW bounded same-family technical successor under DL-045. The registry root, `value_schema_id`, `schema_version` and required/optional/nullable lists describe the strict current v2 writer. Its inline `#/$defs/custody_v1_reader` preserves the exact original v1 schema; `#/$defs/registered_read_value` explicitly dispatches only the two closed retained versions. The external schema routes above own the same definitions. A generic current-writer validator does not become a retained reader merely because the physical key is unchanged.

After the actual Storage instance installs and activates the complete v2 binding set, NEW explicit compatibility entrypoints map `storage.first_append_receipt.issue.v1` to `issue.v2`, `resolve.v1` to `resolve.v2`, `group_gate.v1` to `group_gate.v2`, and `backup_gate.v1` to `backup_gate.v2`, all under the same `storage.first_append_receipt` prefix and within the same actual owner/store/admission boundary. These are call-selector contracts, not physical key aliases or pre-existing authority. Unknown, wrong-operation, uninstalled or withdrawn selectors fence under existing failure behavior. Install both exact readers, the codec, mapping, v2 issuer and all mandatory group/backup/recovery paths before enabling new first issuance.

Every new all-member issuance after activation writes strict v2, including a legacy issue entrypoint, mandatory backup settlement or recovery. No v1 writer fallback is permitted. An intact already-issued v1 group instead returns its unchanged original receipt and remains v1 during group advance, backup and restore. Legacy semantic resolution preserves its eleven-field receipt/four-field result contract and does not select the full-value interface. Each full-value-dependent caller must explicitly adopt that separate interface. Existing callers naming the four old selectors receive this exact compatibility mapping only after its installation; they receive no automatic original-value or domain-depth proof.

### Original complete value commitment and final issuance

At the actual first issuance, compute CV-339's exact domain/version/codec-bound commitment from each independently authenticated ORIGINAL complete EventRecord value, including `sequence_id`, `observed_at_utc` and `persisted_at_utc`, every required-present null and every nested value. Store that commitment with the original receipt in the SAME all-member canonical transaction. The complete original frame/header/CRC/source/group/dedupe and the group's durable commit frame still require their own original owner verification. A current index value, producer-semantic digest, supplied witness or detached validator return cannot supply the original value. Amended 2026-10-31 (DL-270): issuance is the group's durable commit frame (SP-336, SP-347), so the final guard runs before the commit frame is written; the custody transaction that stores the commitment follows the sync, and a rebuild after a crash recomputes the identical commitment from the group's own durable member frames.

The value selected from a source/validation helper must exactly join the actual admitted original owner source/group before preparation and again before publication. Independently bind the complete expected custody row set to that source before later helpers. Validate every pending row and transaction, then compare the exact typed expected rows, pending/postimage/transaction, selected preimage, actual original source/owner/restore/gate facts and any caller predicate after all dependent validators and copies. Schema validity and host-language equality alone are insufficient: booleans, integers, integral floats and signed zero preserve distinct canonical types/bytes. No dependent resolver follows the final complete guard before the original owner's atomic issuance. A later backup, output or domain refusal preserves an already real issuance; it does not erase or restamp it.

The commitment excludes relocatable frame prefix/header/CRC/physical coordinates while retaining the full immutable EventRecord value. It is bounded non-secret hash metadata within the unchanged `RP-EVENT-IDENTITY-APPROOT@1.0.0` lifetime. It adds no raw event/source/control retention, group-opening archive or Platform lifetime. The original public receipt and four-field result remain unchanged.

For the activated `storage.boot_recovery` lane, SP-291/SP-292 bind positive actual Boot enrollment at every original issuance route and the original mandatory backup boundary. The existing same original one-member barrier publication advances the Boot floor with its original receipt row; pending-to-anchor completion remains separately guarded. Any actual Boot event requires this binding regardless of native ID/actor grammar. Unrelated issuance retains its existing admission, while a full backup containing Boot custody must preserve that custody's installed continuity. This extension adds no receipt fields, legacy writer fallback, second issuer or replacement full-value resolver.

### Protected last group and immutable promotion terms

Rewritten 2026-10-31 for DL-270 (SP-336, SP-347): per-group manifest promotion and the separately synced redb issuance transaction are retired; the pre-DL-270 text is in the repository history.

The manifest at `storage/seglog/manifest.v1.msgpack` carries `active_durable_group` using CV-339's closed version `2.0.0` definition. This is the first native writer contract for this group custody. The retained `active_durable_group_v1_reader` describes an earlier external draft only; its presence does not establish deployed native v1 data, a native migration edge or a fallback writer. The manifest is published only at creation, rotation and structural changes, so `active_durable_group` records the last issued group at the manifest's latest publication, which is where recovery starts scanning; the latest issued group is the last valid commit frame within the durable tail. Before any manifest publication, the segments it covers are fully flushed and a synced redb commit makes durable the custody rows of every group up to that point, so recovery never needs a commit frame from before the manifest's latest publication. The manifest remains disk-first publication/recovery control and never a second EventRecord source.

Assign `commit_group_id` once at actual seal within the Storage instance, check it against existing group/receipt identity and reject conflicting reuse. Exact-publication retry preserves it; timestamps are not its identity. All member event IDs and sequence IDs are unique, ordered by strictly increasing sequence and physical position. The member frames tile the group's span, which ends exactly at `durable_end_offset`; the group's commit frame (SP-347) begins there and is not a member, and the segment's durable watermark is the commit frame's end. A group never spans two segments. Validate native frame identity, CRC, bounds, schema and exact bytes before writing the commit frame, not just hashes supplied by a projection. CV-339 defines the exact group digest tuple and compact restore-admission bytes.

A group's `manifest_generation`, in its commit frame and in `active_durable_group`, is the manifest generation current when the group was sealed. Later maintenance may advance the manifest generation while every issued group stays unchanged. Current segment metadata remains separately authoritative, and the in-segment watermark is the last valid commit frame. A fresh empty store has no issued group. Rotation can preserve the last group pointing into the just-sealed segment. No maintenance runs inside a group's write-and-sync window (the group gate below). Retained issued-receipt replay does not require an old manifest generation to remain current.

Case L-2 seal and allocation rules remain exact: ordinary sealing on the first of 10 ms, 64 records or 1 MiB; immediate `barrier` commit for existing barrier-required inputs; 4,096-ID durable leases before sequence issuance; unused leased IDs abandoned after crash and never reused; only `allocator_lease_abandoned | corruption_loss | retention_compaction` gap reasons. A commit frame repeats the sequence of the frame before it and uses no lease ID (SP-347). The existing 48-byte frame prefix, 4 KiB header and namespace synchronization requirements remain unchanged, except that commit frames set flags bit 1 (SP-347) and the write-time compression descriptor stays reserved (SP-346). The inline body of a record is capped at 16 KiB (SP-337); larger bodies are payload-store references, and the 16 MiB figure is only an outer frame bound. The digest's representation bounds create no event-size cap, oversized-frame exception or new sequence-gap reason. Recovery processes any required ordered groups under the same gate without inventing gaps or changing original EventRecord bytes.

### Publication, first issuance and complete group exclusion

Rewritten 2026-10-31 for DL-270 (SP-336, SP-347): per-group manifest promotion and the separately synced redb issuance transaction are retired; the pre-DL-270 text is in the repository history.

Under the existing writer gate, validate current normal writer/schema/registry/no-secret/scope/permission/dedupe admission, actual append input durability class, all source frames and exact original segment bindings. Global/scoped dedupe values and the existing checkpoint must agree with the verified actual source tail. Application partition is exactly `app`; project partition is `project~` plus unpadded base64url of exact UTF-8 project ID. Native idempotency keys remain nonempty. This contract changes no EventRecord producer-semantic digest recipe.

Seal the actual complete group: write every member frame, then the group's commit frame (SP-347), whose payload carries every member's receipt terms and the group's `acknowledged_at_utc`, selected once at seal; from then on those terms are immutable. Then make one data sync of the active segment: `F_BARRIERFSYNC` for an ordinary group on macOS, `fdatasync` on Linux and `FlushFileBuffers` on Windows, and a full flush for a barrier-class group. The group is issued when its commit frame is durable: normally when that sync returns, which is its first successful issuance, or, if the process dies first, when recovery's flush makes a surviving commit frame durable, with the terms sealed in it (Crash and uncertainty behavior). `acknowledged_at_utc` is the time carried in the frame, not delivery time; `persisted_at_utc` remains commit-group seal time. Receipts are exposed, and receipt-dependent terminal writes released, only after the sync. Then commit all member custody rows in one redb transaction without a sync of its own; they become durable at the next durability checkpoint (SP-336). Every durable redb commit, in either redb file and of any family, is preceded by a full flush of the active segment and of any payload pack written since the last full flush, so no durable row outlives the frames it depends on; it holds the group gate from that flush until the durable commit returns, so no group is acknowledged, and no row depending on an unflushed group commits, in between. Writers that commit often commit without durability and let the checkpoint make them durable. A barrier-class group commits its custody rows durably before acknowledging. No cross-redb/seglog transaction is asserted, and the manifest is not published per group.

The held gate binds actual source/control identity and generation, group/source bytes, original segment mappings, complete current dedupe admission, selected store, gate lease/revision and canonical custody preimage. Revalidate those actual owner values immediately before writing the commit frame. An independently repaired mapping/candidate or source/dedupe set still invalidates the attempt when held facts changed. Validate the exact all-member terms against independently authenticated source and owner terms, not merely mutual hashes or a caller row. Disclose nothing before the sync, and verify the commit frame's terms before release.

`storage.first_append_receipt.group_gate.v2` encloses each group's write-and-sync window, from its first member frame to its commit frame's sync, every durable redb commit's window from its full flush to its return, and every operation that could replace, advance or lose that group inside it: next append, manifest/source generation advance, recovery publication, intent resumption, rotation, compaction/retirement and the recovery event's own append. Startup checks it before those operations or mutation admission. Both source advance and retirement authenticate the issued groups' commit frames and immutable receipt terms; an `issued` phase marker alone is insufficient. Revalidate current source/dedupe for such mutations even after issuance. Once an admitted retirement completes, passive original receipt reads do not reacquire retired source controls.

Recovery checks custody against the groups it scans, from the manifest's latest publication through the durable tail. For each such group the custody rows are either all present and exactly equal to the terms of its durable commit frame, or all absent, in which case recovery rebuilds them from the frame, and no custody row may name a sequence beyond the last valid commit frame. A proper subset, mixed first timestamps, duplicate keys, mixed Storage identities, rows that differ from their commit frame, rows beyond the durable tail, or evidence that a commit frame covered by a full flush was lost is corruption/loss/backup skew. Fence rather than filling missing rows from anything but the group's own commit frame or minting a second first acknowledgement. Rows for groups before the manifest's latest publication, including groups whose source was lawfully retired or compacted (Case L-3), replay from the rows alone and need no frame (Retained original receipt resolution). Issued rows remain immutable on retries.

### Crash and uncertainty behavior

Rewritten 2026-10-31 for DL-270 (SP-336, SP-347): per-group manifest promotion and the separately synced redb issuance transaction are retired; the pre-DL-270 text is in the repository history.

Recovery runs under the recovery gate and first makes the active segment, and any payload pack written since the last full flush, durable with a full flush before it classifies anything. Frame validity alone does not prove that a sync returned: a process killed between write and sync can leave complete, valid frames in the operating system's cache, and an operating-system crash or power loss can keep or drop them. After that flush, a group whose valid commit frame lies within the durable tail is issued, whether or not its original sync returned; when it did not, its receipts were never exposed, and a retry under the same idempotency key returns them. Member frames after the last valid commit frame are an unissued tail that existing Case L-2 recovery truncates, provided no custody row or full flush covers them. No recoverable issuance of those operations survives: they were never acknowledged or, on macOS, belong to an ordinary group acknowledged and then lost within its class, and either way they may be retried as new work under their idempotency keys. Do not assert an earlier acknowledged group existed. An OS-visible write or rename with unknown synchronization is not durability proof.

Recovery rebuilds every missing custody row before it admits appends or answers receipt requests. The eleven receipt fields come from the group's commit frame; event_id, scope partition, event type, idempotency key and the complete original EventRecord come from the authenticated member frame, from which `producer_semantic_digest` and `original_event_value_commitment` are recomputed by their existing recipes; `group_digest` is recomputed from the group's frames (CV-339); `original_segment_ref` is the segment's opaque ref, recorded in the manifest's segment inventory when the segment was created, a structural publication; and `storage_instance_id` and `redaction_profile` come from the store. A rebuilt row must equal, byte for byte, the row the original custody transaction would have written. A barrier-class group's rebuilt rows commit durably before its receipt is returned or any dependent write released, and a `storage.boot_recovery` group's rebuilt receipt row advances the Boot floor in the same durable transaction, exactly as its original publication would have (SP-291, SP-292). After issuance, lost caller delivery or an interrupted domain terminal commit returns the exact stored original receipt from its custody rows. Domain owners independently reconcile action execution and original terminal outcome; the generic reader does not rerun the action.

On macOS an ordinary group acknowledged after `F_BARRIERFSYNC` may be missing after a power loss, with nothing reordered or corrupted (SP-336's durability classes); the durability checkpoint bounds this to about the last second of ordinary groups. Because every durable redb commit follows a full flush, no custody row, dedupe row, domain row or other durable state can refer to such a group, and every receipt that authorizes a mutation or an external effect is barrier-class (Case L-2). The group and its identities are lost within the durability class: its sequence IDs read as `allocator_lease_abandoned`, and a later append under one of its idempotency keys is admitted as new work. That is not a replacement first receipt, because no durable trace of the lost one exists for it to replace; the rule against minting a replacement applies to every identity whose receipt a full flush has covered. Only an in-process caller can hold such a receipt, since every durable row and every barrier-class dependent follows a full flush and receipts the UI waits on are barrier-class, and in-process callers end with the power cut; were one presented, resolve answers unavailable. Corrupt or ambiguous source, loss of anything a full flush covered, missing commit-frame terms or lost issued authority beyond the durability class follows existing integrity and verified-restore fencing. Missing receipts cannot be reconstructed from the current clock, index, current locator or arbitrary surviving frames, only from their group's commit frame. A recovery event blocked by the gate does not bypass it: use existing persistent recovery intent/report and read-only disclosure until its append is valid, without inventing an event or converting an unknown sync into success. Buffered redb commits, OS visibility and self-consistent supplied hashes do not establish native durability or authentication.

### Retained original receipt resolution

`storage.first_append_receipt.resolve.v2` receives the incoming EventRecord identity/semantic request and selects the original identity using the existing dedupe policy. Validate actual retained global/scoped value schemas and key/raw identities: selected global key hash and raw `event_id`, scoped `event_id`, both original results' event IDs and custody/receipt event IDs agree. Scope/type/idempotency/producer-semantic joins and original four-field results agree. A legitimate alternate incoming event ID for the same scoped idempotency hit resolves to the original event ID without rewriting it. Contradictory retained identity fails even if a caller repairs both index hashes.

Read and authenticate the canonical custody row from its actual table/store/key. Validate its closed schema, raw/key Storage and event identity, source semantic tuple, original result and immutable receipt. Return the exact eleven fields. Lawful physical relocation preserves the receipt and four-field original result; a current frame may have different coordinates. No old raw frame, source manifest, transient policy/owner request, historical redb snapshot or retired segment object is needed to reproduce an intact issued receipt. Current EventRecord-byte availability and current mutation admission are separate checks; passive append evidence grants neither. Integrity and domain-specific authorization still constrain subsequent effects.

### Separate retained full-value resolution

`storage.first_append_receipt.resolve_full_value.v1` receives only the closed `#/$defs/full_value_request`, containing the original complete `event`, and returns `#/$defs/full_value_result`: exact original `first_append_receipt`, `original_segment_ref` and `original_event_value_commitment`. It does not accept a caller-asserted hash, row, source locator or witness. Resolve and authenticate the same actual canonical stored identity as semantic replay, require exact v2 and exact ORIGINAL event ID, and recompute CV-339's full-value commitment over the supplied available value. An alternate incoming ID allowed by semantic idempotency replay does not satisfy this original-value request. Compare the exact returned values to the actual selected immutable row and recheck complete request/owner/candidate facts after all resolvers, validators and copies before disclosure.

No retired raw frame, original CURRENT/manifest, historical transaction/control object, old policy request or group opening is needed once genuine v2 custody is available. Authentic native canonical origin remains mandatory; self-consistent copied rows/hashes do not establish it. Current event availability, CURRENT-selected SP-278 source/index authority, permission, action execution and domain terminalization are independent caller obligations. This passive proof grants no mutation or original source access. Relocation may change framing/locators but must preserve the exact committed value; this successor supplies no reconstruction or authenticated migration mapping for changed value representations.

Exact v1 rows retain their original semantic replay but have no full-value witness. No backfill, conversion-on-read or inference from surviving current bytes, a bare group digest or current clocks is admitted by this successor. Missing or unsupported proof fences dependent completion without downgrading to semantic replay. Previously retained caller-specific immutable full-value proof remains separately usable under its owner contract. Existing settled Hold/Home custody is not reopened, and their unfinished paths plus Restore and Platform each require explicit reviewed adoption.

### Settled authority backup and confirmed rollback

`storage.first_append_receipt.backup_gate.v2` joins the existing shared-boundary backup mechanism. Settle the current group's complete issuance first, then hold the group gate or an equivalent coherent canonical snapshot boundary through capture of selected source/manifest/store identity and all required issued custody. A supported authority backup contains no pending group. Verify complete custody, original generation bounds and source/identity coherence; reject proper subsets, missing required older rows and source/custody epoch skew. Existing canonical backup membership, staging, synchronization, verification and journaled offline restore remain required. Amended 2026-10-31 (DL-270): this gate is BRS-031's brief capture barrier. It records one consistent point and is released well under a second. Sealed segments and payload packs copy in the background, redb copies from a read snapshot, and no writer lock is held while copying. Settling means the current group's commit frame is durable and its custody rows are committed, so the redb read snapshot and the recorded segment offset agree. The active segment is captured as its exact prefix up to the recorded offset, read through a handle opened at the capture point; the segment is append-only below that offset, and rotation renames it without rewriting it, so concurrent appends never change the copied bytes; on restore, recovery still rebuilds any custody row missing beyond the snapshot from the restored segments' commit frames (SP-336).

A settled older backup can still omit receipts issued later on the live root. Restoring it does not prove those identities were never issued. Preserve supported older-backup restore and the exact existing `data_loss_risk.class = none | post_backup_writes_will_be_lost | unknown_due_corruption`; non-`none` requires explicit confirmation with boundary/family disclosure. The recovery shell's confirmation binds the selected backup identity and exact bytes/hash, exact current canonical source/custody bytes/hash, verified restored boundary, risk class and affected family identities. A changed selected backup or current boundary requires fresh confirmation. Capture verified readable `pre_restore` authority, or quarantine exact unreadable current bytes, through the existing coordinator before promotion. Verified pre-restore authority may preserve/resolve an exact historical receipt through its owner; unreadable quarantine cannot prove absence.

Covered intact rows replay exactly. A missing post-backup original receipt remains unavailable: never restamp an old request, restored pending command, idempotency retry or reconstructed source as new because it is absent from restored indexes/custody. In particular, settled backup A followed by live issued/delivered B and restore A cannot produce a replacement first receipt for B. A pending forensic/crash capture is not supported authority backup and cannot establish never-issued status after restore; live execution might have issued since capture. Capturing pending, then issuing/delivering live, then restoring that pending image must fence even when the captured admission was once valid.

### Actual fresh-operation admission after verified restore

Confirmed rollback does not make the restored store permanently read-only. A genuinely new native owner operation may append after normal source, sequence-lease, registry/producer, permission, no-secret and dedupe admission succeeds. Its owner must distinguish actual new acceptance from retry of restored/lost work; inability to prove that distinction makes this scoped first-mint path unavailable. The generic writer cannot rename an old operation or accept a caller's fresh-origin flag.

After verified terminal restore/reopen, `StorageRecoveryCoordinator` establishes the actual restore occurrence from its existing completed journal identity, exact journal bytes/hash, new recovery epoch and verified selected restored boundary. A new restore creates a new occurrence even for identical backup bytes. Equal Storage instance, root path, timestamp or self-selected UUID does not prove it. The coordinator/writer open a transient session under current mutation admission. An actual native owner accepts a new logical operation after that session opens and supplies its owner-operation identity and exact event/scoped idempotency/semantic tuple through authenticated in-process/dispatcher authority. A retry/read EventRecord input cannot instantiate this owner call.

A transient capability binds actual owner ID/operation ID and complete accepted-operation digest, event ID, scope partition, event type, idempotency key, producer-semantic digest, completed restore occurrence/journal/epoch/boundary, current acceptance lease revision and one logical publication ID. Callers supply neither its authority nor replacement owner records. Freeze and revalidate owner acceptance, current lease revision, restore control and source/dedupe/segment terms under the existing writer gate. Any late change revokes the attempt even if rows/hashes are repaired. Native owner identity recipes remain with the actual owner, not fixture-generated IDs.

The protected group carries CV-339's closed `restore_admission` with complete ordered admitted members; null applies to an ordinary in-place root without this restore path. Duplicate event IDs, owner-operation pairs or scoped type/key identities, inconsistent owner joins, or incomplete member coverage fail before publication. A legal ordinary group may carry complete admission, while barrier inputs still seal immediately. The binding contains no raw request/payload, UI claim, pending receipt or nullable first acknowledgement. Amended 2026-10-31 (DL-270): the group's commit frame carries it (SP-347), since the manifest is no longer published per group.

Consume the capability for exactly one logical publication: the group whose commit frame carries its `restore_admission` (SP-347). Revalidate the owner operation/session and current controls immediately before writing that commit frame; its sync is the issuance (SP-336), and all receipts and dependent terminals stay withheld until then. Before the commit frame is durable, retries revalidate the same owner operation/session. After it, retry resolves that same publication and cannot publish another event/group. A consumed capability never authorizes a second group, and source advancement stays gated until the group is issued.

### In-place restart after admitted promotion

Rewritten 2026-10-31 for DL-270 (SP-336, SP-347): per-group manifest promotion and the separately synced redb issuance transaction are retired; the pre-DL-270 text is in the repository history.

There is no promoted-but-unissued state: after recovery's flush an in-place restart finds each group either issued, with a durable commit frame whose receipts replay identically, or treated as never issued on this root, with no surviving commit frame. When no custody row or full flush covers such a group, its unacknowledged tail at the active segment's end is truncated by Case L-2, no receipt of it survives and nothing durable refers to it (SP-336), which on macOS can include an acknowledged ordinary group lost within its class; that separates it from restored old work, whose receipts may have authorized effects outside the restored image. A damaged frame before later valid groups is instead a proven hole that keeps Case L-2's loss fences, and a missing frame that custody rows or a full flush covered fences as corruption, loss or backup skew. Its operations may be retried under their idempotency keys, and a fresh post-restore operation is accepted again only as a new logical operation through a new session's fresh-operation admission, which still refuses restored old work. A restart loses transient capabilities, accepted-operation adapters and old session leases. Authenticate the actual same current root and selected manifest, actual current restore occurrence/journal/epoch and current mutation controls through Storage startup/coordinator authority before resuming appends; do not reconstruct or reacquire a lost transient capability or original owner request.

Protected origin must come from the existing selected-store/manifest owner, never a caller's repaired source or matching hash alone. If actual root/journal/epoch/origin is unavailable or contradictory, fence new appends until the owner resolves it. This adds no durable journal, historical snapshot service or indefinite transient-capability retention.

A restored pending image is never an in-place restart of that protected root. A newly completed restore cannot reuse an older occurrence's admission for a new group. Covered issued rows still replay; fresh publication needs the new actual restore occurrence and a newly accepted operation. This distinction preserves confirmed rollback while forbidding replacement acknowledgement for lost old work. Existing native post-loss sequence leases/source adoption/gap classification remain prerequisites; this contract adds no allocator or recovery gap reason.

### Activation, compatibility, withdrawal and verification boundary

**First-open ordering.** Phase 1's prohibition on projectors and redb product writers does not postpone this narrow Storage control/receipt table. Under the existing root continuity/version checks, aggregate lock and coordinator exclusion, materialize the compatible protected-group parser, table and all five active bindings and the explicit compatibility map before the first successful seglog append, including a startup recovery event. Genuine first-run proof permits an empty table and null current group; existing continuity evidence with missing authority never becomes a fresh empty root. Preserve Case L-1's existing version ceilings, first-run tests, migration journal/backup/stamp-last/readback and recovery admission. This foundation bootstrap does not activate settings/session/product writers, projections or analytics.

Existing-store activation verifies its supported preimage and completes the compatible parser/table/gate installation through the actual StorageMigrationCoordinator before new receipt-dependent appends. Its journal, protected backup and canonical migration receipt are existing coordinator authority, not successful seglog events required to create their own first-receipt table. Do not require a receipt-dependent migration/recovery success event before the prerequisite is active. If an actual supported migration edge cannot establish this ordering, fence and retain existing journal/report evidence; do not fabricate a bootstrap receipt or waive the gate. After activation, any such event follows normal current source/dedupe admission, SP-336's segment sync with its commit frame (SP-347) and custody. Broader product-schema open, projectors and analytics remain in their existing later build/startup phases.

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
  event_append_receipt_custody family. Since DL-270 (SP-336, SP-347) an ordinary group is issued exactly when its
  commit frame, carrying every member's receipt terms and the seal-time acknowledged_at_utc, is durable after one
  segment sync; receipts are exposed only after that sync; the custody rows then commit without a sync of their
  own and are rebuilt identically from the frame after a crash, once recovery's flush has made the surviving
  frames durable; every durable redb commit follows a full flush of the segments and packs written since the last
  one. The lifetime replay guarantee covers every receipt a full flush has covered; on macOS an ordinary receipt
  that no full flush covered can be lost with its group in a power cut, after which resolve answers unavailable
  for it and its idempotency key is admitted as new work (SP-336). A barrier-class group keeps a full flush and
  commits its custody rows durably before acknowledging. The writer gate encloses each group's write-and-sync
  window and authenticates issued groups' commit frames before source advance or retirement. Retained original
  replay is independent of old source controls. Settled backup, confirmed older restore, unavailable
  missing-original retries, actual fresh-owner admission and in-place restart follow the detailed First append
  receipt custody contract. CV-339 owns the exact shared shapes, digest bytes and caller interfaces. This is a
  shared technical prerequisite only; event-specific adoption and native proof remain separate. New strict stored
  v2 retains the original complete EventRecord value commitment, exact v1/v2 read dispatch and explicit
  legacy-selector compatibility; full-value resolution is independently adopted.
  SP-1100 preserves the exact physical numeric/profile domain and original payload bytes; CV-1100 qualifies only the selected semantic preimage, and SP-1101 authenticates frozen original-recipe selection for retained reads and retries.
gui_related: false
gui_classification_reason: Defines Storage receipt custody and internal restore admission; existing recovery-shell disclosure remains separately owned.
depends_on: [SP-230, SP-235, SP-236, CV-318, DL-045]
unblocks: []
acceptance_criteria:
  - "An ordinary group is issued when its commit frame is durable after one segment sync; no receipt or dependent terminal write escapes earlier, and its custody rows follow without their own sync and are rebuilt identically from the frame after a crash (SP-336, SP-347)."
  - "Original eleven receipt fields and four-field result remain immutable across retries, source relocation and lost delivery."
  - "Subset custody, rows that differ from or lack a durable commit frame, repaired held mappings/dedupe, contradictory identities or late owner/session changes fence; a group missing within its durability class resolves as lost, not corrupt."
  - "Settled older restore preserves covered receipts but cannot mint a replacement for missing delivered work."
  - "Actual new owner acceptance is distinct from retry input; an in-place restart finds each group's issuance recoverable from its commit frame or absent, invents no prior acknowledgement and keeps the loss and restore fences."
  - "Settled backup, current restore controls, explicit migration/withdrawal and unchanged app-root identity lifetime remain mandatory."
  - "Strict stored v2 is derived from actual original full values carried in the group's commit frame; final typed row/source/output guards follow every dependent helper."
  - "Explicit legacy selectors enter the installed v2 owner without new v1 issuance; exact old rows remain immutable and full-value proof never backfills or downgrades."
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

### SP-1101 - Authenticated Write-Time Recipe And Retained-Reader Dispatch

```yaml
plan_unit_id: SP-1101
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  The native original Storage/producer owner selects and authenticates one immutable recipe tuple for the original accepted record: original envelope and payload schema IDs/versions, original owner/source and registered family edition or registry revision, identity recipe, producer-semantic recipe, physical/full-value profile and any separately owned local source/payload profile needed to verify that record. Existing semantic-version/field-context recipe definitions are reused. Bind the selection through the existing actual original issuance/source/admission custody to the Storage instance, exact scope/Server/Project, event type and original event/idempotency identity, original owner operation and original value/source commitment. Copying a recipe name, hashing a caller-supplied tuple, setting `verified=true` or presenting an index checkpoint does not authenticate that binding.
  CV-1101 owns the shared enforced EventRecord date-time predicate. The frozen original schema/resources select the applicable timestamp profile as part of this authenticated recipe dispatch; a request cannot choose a weaker profile. Owner-valid lowercase, offset and long-fraction history retains its exact spelling, while a skipped format check never authenticates invalid history.
  Every retained reader and retry resolver first obtains that selection from the authenticated original owner. It uses exactly the frozen original schemas, lexical/type/number rules and hash preimages to verify and return the original bytes/results. A current caller cannot select the old recipe; a historical record cannot be validated by trying current then legacy until one passes. Current access/deletion/hold/withdrawal gates still control disclosure, and original currentness/receipt/source controls still apply to the actual downstream action. A later current writer’s numeric, format or live-state guard never runs on a retained original merely because the same event name is read.
  A new incompatible number/format/hash rule receives an explicit governed successor recipe/edition and coordinated writer/reader adoption before current activation. Closed EventRecord fields are not extended ad hoc. Use an existing immutable schema/edition discriminator where it uniquely selects the recipe, otherwise the authentic original issuance/registry custody must select it; an old event timestamp alone is not sufficient. If an older original lacks enough authentic provenance to select exactly one supported recipe, retain its exact bytes and use the existing unavailable/unsupported contract; do not rehash/restamp/backfill, falsely mark it corrupt, fabricate provenance or select a weaker recipe. Valid authentic supported old originals remain readable. Unknown/foreign/ambiguous/forged selection refuses with zero append or canonical/domain effects.
  This is a newly authored shared technical owner contract for existing identity/replay behavior under DL-045 and the separately permitted family scopes; family-specific adoption remains necessary. The recipe tuple also pins the exact original resource/edition bytes through the existing authenticated custody (including their original hashes); a rewritten URI, registry revision or same-named replacement resource is not the original recipe. No permanent owner-request mirror, new durable recipe family or new EventRecord field is introduced. CV-339's original eleven receipt fields and full-value tuple, SP-286's first issuance/replay interfaces, and SP-278's source/currentness/read-token controls remain unchanged.
  A reference dispatcher installs the trusted original-owner resolver and supported exact tuple-to-frozen-verifier mapping at composition, outside untrusted request data. The owner authenticates original custody; each frozen verifier checks the complete original schema/identity/source/value/result/receipt joins with its original recipes. Unknown or ambiguous tuples cannot be probed through alternative verifiers. Ordinary current append and current retry inputs retain their current admission gates, including replay_only_not_appendable, while original receipt/history resolution applies frozen original validation. Current disclosure permission/deletion/hold/withdrawal is checked independently, and no retained read/retry remints first time, sequence, identity, bytes or effects. Missing provenance preserves exact bytes under the existing unavailable contract and is not a corruption finding.
  Finite fixtures use an independent sealed lookup to model that boundary; a caller-controlled dictionary, historical flag, original_recipe field, verified boolean or recomputed self-hash is never a native custody proof. Native installation/activation, original owner authentication, durability, restore/withdrawal and every family adoption remain NOT_RUN here.
gui_related: false
gui_classification_reason: Defines exact numbers, byte profiles and original recipe custody; no visual presentation.
depends_on:
- CV-1100
- SP-1100
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- |-
  One exact supported recipe tuple resolves from authentic immutable original issuance/source/edition custody with Storage, scope, family, schema, operation, event, key and source/value joins.
- Authentic old integral-float/exponent/negative-zero and large-metadata originals remain readable by their frozen
  recipe after current grammar or live state changes.
- Caller overrides, downgrade, foreign/forged/ambiguous/missing/unknown recipe or replaced resources refuse without
  alternate dispatch, append or domain effects.
- Current access/deletion/hold/withdrawal gates still apply; original result/receipt/bytes remain exact, with no
  restamp, backfill or fabricated provenance.
validation_surfaces:
- python3 scripts/pm_event_numbers.py --self-test
- Plans/event_number_recipe_corpus.json
- python3 scripts/pm-plan-index.py validate
risk_class: numeric_identity_or_retained_recipe_drift
reasoning_tier: high
context_scope: event_authority_shared_number_recipe_contract
implementation_surfaces:
- Plans/storage-plan.md
- scripts/pm_event_numbers.py
- Plans/event_number_recipe_corpus.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/NUMRULE/REPORT.md#4-proposed-owner-rule
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-1101
negative_constraints:
- No global numeric ceiling, alternate hash domain, envelope field, registry service, family admission or native
  proof.
- No rehash, restamp, backfill, current-then-legacy fallback or fabricated original custody.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-1100, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


ContractRef: ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/event_append_receipt_contracts.schema.json, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Decision_Log.md#DL-045
