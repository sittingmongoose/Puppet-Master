# Shard 058: Browser workspace-reset filtered checkpoint — 2026-09-11

Source: `Plans/storage-plan.md`

Source lines: L20834-L21582

Source SHA256: `716ae8fd1126a7b7ff901d65dfc0730c645783b3471f938df5c2191b9deefa21`

---

## Browser workspace-reset filtered checkpoint — 2026-09-11

These are **newly authored Storage technical definitions under DL-046** for
`browser.workspace.reset` alone, after its individual existing-first search.
SP-278's newly concrete generic projector/reader/checkpoint is reused in that
exact role. It is not a reset-specific binding, and the created-only SP-266
checkpoint is neither reused nor silently upgraded by this section.

### Exact physical and semantic binding

Define `storage.browser_workspace_reset_index.v1@1.0.0` as the sole writer of
the new derived family `browser_workspace_reset_index_checkpoint`, in redb's
existing `checkpoints` namespace. Its exact logical key is
`browser_workspace_reset_index_checkpoint.v1:{storage_instance_id}:{scope_partition}`;
Storage instance is the actual UUID and Project partition is the existing
`project~{base64url_no_pad(UTF8(project_id))}` encoding. It covers examination of
all retained reset facts for that Project, not the state of one live workspace.
There is no alias or compatibility write key. The sole semantic read consumer is
`browser.workspace_inventory.reset.v1@1.0.0` in SMPFS-168.

The canonical MessagePack value is
`pm.storage_value.browser_workspace_reset_index_checkpoint.v1@1.0.0`, defined by
`Plans/browser_workspace_reset_contracts.schema.json#/$defs/checkpoint`. The registry
materialization must match that definition and the exact referenced SP-278
`read_token` and `coverage.last_frame` definitions. It fixes event/projector/schema
identity; stores the complete read token, examined first/through bounds, inclusive
source cursor including frame-end offset, filter completeness, health, state and
first-withdrawal time. Bounds describe the **examined global captured range** of
the generic index; the semantic filter remains this exact Project and event.
They are not the minimum/maximum matching reset sequence. A proven empty generic
source has null bounds/cursor; a nonempty source with zero resets still has its
actual examined bounds/cursor. Missing or unreadable coverage is not empty.

`index_read_token` explicitly adopts SP-278's exact root key and generation JSON
Pointer, generation/anchor digest, advancing frontier revision/digest, physical
dataset, captured source-selection object and pinned redb snapshot identity.
The token's Storage instance must equal this checkpoint's instance; its source
selection must belong to that same instance. The selected node ID, root pointer,
node state, dataset and token must join exactly. Anchor/frontier digests use only
SP-278's existing `pm.event_index.binding.msgpack_sha256.v1` recipe; this does not
change source/payload/producer-semantic or filtered-checkpoint CAS hash recipes.

A stored snapshot ID is historical provenance, not a reopenable native snapshot
or a restart credential. Every read/recovery reacquires an actual SP-278 reader
snapshot/source fence and revalidates the complete token. Equality of generation
ID alone is insufficient: an ordinary append can advance frontier/source while
preserving the generation and all older index rows.

A fresh read may have a different native snapshot ID while all persistent
root/generation/anchor/frontier/source bindings remain unchanged. Bind that new
ID only to the actual newly acquired read snapshot; do not rewrite the stored
checkpoint merely to inspect it. This transient rebind grants no permission to
replace any persistent token field or accept changed source/frontier coverage.

### Complete source filter and atomic advancement

1. `reader.storage.event_record_index@1.0.0` must first establish the independently
   published, CURRENT-selected, globally complete SP-278 snapshot. Resolve the
   actual root in `checkpoints` and the selected `event_record_index.v2@{generation_id}`
   table in the same redb instance. Verify live source controls, frames, hashes,
   CRC, coverage, lawful gaps, schema dispatch and dedupe through that owner.
   Neither this filtered writer nor a supplied token can publish the generic index.
2. Scan the complete declared captured range with the exact Project/event filter.
   Resolve matching source EventRecord/payload bytes and verify registry admission,
   envelope/source/index identity and SMPFS-168's reset semantics. Topology,
   session, workspace and generation are payload facts, not generic index metadata.
   Verify prior/new generation edges; conflicting identities/digests cannot be
   silently deduped or interpreted as a new reset. A verified nonmatch may be
   skipped; unsupported, corrupt, unavailable or unexplained missing source may not.
   Historical inspection does not reconstruct or require reviving the original
   Browser process/result/receipt content. Producer-time resolution requirements
   remain distinct from current read-access checks.
3. Compute only the bounded historical reset join. Under the same source/access/
   deletion/maintenance fence, commit **only this checkpoint**, using exact
   prior-value/cursor CAS. The global root/generation/anchor/frontier/read token,
   complete examined range, permission and tombstone predicates must still match.
   Do not write index rows, the global checkpoint, Browser owner state, UsageRecords
   or prompt delivery. Prior-key scope changes, unproved empty ranges, stale CAS
   and cursor regression require failure or governed rebuild, never ordinary advance.
4. Revalidate the token and current access/deletion fence before disclosing the
   computed read result. A post-commit change blocks disclosure; it does not undo
   an already committed checkpoint. Crash before commit leaves the old value;
   crash after commit recomputes the read join under newly validated authority.
   Inclusive restart rechecks the last complete frame's exact identity and end
   offset before continuing and never repeats a reset or other domain effect.

`current` requires healthy, complete verified coverage. `degraded` preserves the
actual generic survivor/loss status and grants no healthy/latest or mutation claim.
`withdrawn` prohibits ordinary advance/disclosure. Empty, degraded and zero-match
coverage remain distinguishable. A source change, changed frontier with the same
generation, unsupported binding, missing physical source/table, invalid checkpoint,
failed CAS, permission loss or tombstone returns typed unavailable/stale without
falsely advancing or presenting current authority.

### Recovery, retention, deletion and withdrawal

Rebuild this disposable checkpoint only through StorageMigrationCoordinator from
verified CURRENT-selected source and the adopted SP-278 token. Install the exact
physical family through the actual migration graph/ceilings before use; do not
invent store-version integers. There is no source-event alias/backfill transform,
lazy sibling-key migration or schema-shaped source repair. Compaction translation
requires SP-278's actual semantic/survivor/source evidence; stale physical offsets
and timestamps cannot identify the new range. Unsupported or invalid derived
bytes use existing Q-DERIVED custody and governed rebuild. Neither index nor
checkpoint reconstitutes Browser session/profile/controller/result custody.

### Concrete same-key generation custody

The same redb `checkpoints` value holds the entire generation set: its current
core and `retired_generations`, at most two complete closed predecessor cores
without recursive history. There is no secondary history key, unspecified redb
generation slot or backup substitute. Every core has stable `publication_id`,
first `published_at_utc` and `hold_refs`, in addition to its source/token/state
fields. A history entry contains exactly `checkpoint_core` and
`successor_publication_id`. Its terminal anchor is the core's actual first
`withdrawn_at_utc`, not birth, cursor time or a guessed prior retirement. Every
retained core joins this exact Storage/Project/partition; publication IDs are
unique and never retire into themselves. Old successor refs record their actual
historical transition and are not retargeted when later history is cleaned up.

Only initial governed publication, a verified rebuild or an explicitly admitted
binding successor allocates a new publication identity. The coordinator selects
that identity once and reuses it on retry. Ordinary advance preserves the current
publication ID, birth, hold refs and every history entry; generic append/rebuild
does not itself retire this filtered generation. Any separately authorized hold
update serializes through the existing hold owner, not ordinary traversal.

`Plans/browser_workspace_reset_contracts.schema.json#/$defs/generation_transaction`
is a new read-only resolver view of the actual same-key redb generation commit,
not another physical record. It binds the original before/after values, exact key,
selected ID and actual commit time. Initial publication has null prior value and
empty history. Replacement requires complete verified source rebuild, exact
predecessor CAS, current coordinator/maintenance/hold/reference fences and a
lawful reserved slot. One redb commit first withdraws an active predecessor,
archives its complete finalized core with the selected successor ID, preserves
all older entries byte-for-byte, and publishes the new complete core. If the
predecessor was already withdrawn, preserve its entire core and earlier first
withdrawal time. Successor birth equals actual commit time and cannot precede the
prior observation. A supplied transaction dictionary does not authenticate that
operation or establish native custody.

One current core plus two retained predecessors consumes all three slots. A fourth
publication waits for lawful cleanup; it never drops history, overwrites a held
generation or stages in a hidden fourth key. Cleanup selects one exact retired
publication ID and removes only that entry in a same-key compare-and-swap commit,
preserving the current core and every sibling. Eligibility begins inclusively at
first withdrawal plus 604800 seconds and requires complete current hold/ref
resolution, authorized maintenance/access/deletion and the same-redb fence used
by hold admission and capacity reservation. Resolve stored `hold_refs` through
the unchanged `retention_hold_record` owner and enumerate all applicable existing
application/Project/thread/Run/event/receipt and live/backup/recovery references;
no new hold scope or meaning is introduced. Missing hold resolution blocks
cleanup. Archived cores never become current by moving them to the root.

The source event retains SP-262's exact `RP-AUTHORITY-INDEFINITE@1.0.0` assignment:
creation anchor, bounded metadata retained indefinitely, no TTL/cardinality
eviction, hold eligible and fail-closed pressure. App-root identity/dedupe remains
unchanged. Generic index rows retain `RP-EVENT-INDEX-SOURCE@1.0.0`; SP-278 retains
its own exact root/generation policy. This checkpoint reuses existing
`RP-PROJECTION-3GEN@1.0.0`: current plus history, terminal-transition anchor,
604800 seconds, at most three physical generations per logical key, actual holds,
`rebuild_projection` overflow and `rebuild` expiry. No retention policy changes.

For this filtered binding, the terminal anchor is first durable withdrawal; set
`withdrawn_at_utc` once and preserve it on repeats. Normal cursor refresh updates
the current physical value and does not manufacture a new history generation.
Browser reset/close, Run completion and generic-index frontier/generation changes
do not start or reset this withdrawal TTL. Governed replacement/history remains
subject to the existing three-generation limit and hold/reference rules; lack of
a lawful slot blocks replacement, not protected-history eviction. A withdrawn
checkpoint cannot revive by ordinary refresh. Missing derived data authorizes a
governed rebuild, not expiry or extension of canonical source custody.

Current Project/thread permissions, deletion tombstones and content redaction
gate every read and recovery disclosure. Retained content-free reset metadata
does not restore deleted workspace/thread visibility, search, export, return
routes, profiles or artifacts. List removal and separately confirmed data purge
retain their existing meanings and scoped Storage intent/hold rules. Opaque refs,
IDs, hashes and cursors confer no access; credentials, protected-auth identities,
page/DOM/profile state, inline captures and local absolute paths are excluded.

Writer withdrawal prevents new event-dependent reset publication and fences
unresolved owner effects under SMPFS-168; it must not erase a known reset effect.
Checkpoint-only withdrawal fences this reader without changing the independently
owned Browser command. Preserve original event/dedupe evidence, identify an exact
owner-approved successor/version, install/rebuild through StorageMigrationCoordinator,
verify scope/coverage/currentness/deletion, then activate the adopted reader.
No silent zero-cursor reset, sibling reuse, bulk Browser admission, history rewrite,
global count override or governance reseal follows.

### SP-282 - Browser workspace-reset single-family persistence binding

```yaml
plan_unit_id: SP-282
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Newly define storage.browser_workspace_reset_index.v1@1.0.0 and the derived
  browser_workspace_reset_index_checkpoint under DL-046. Explicitly adopt the
  full SP-278 root/generation/anchor/frontier/source/read-snapshot token and
  complete examined coverage before atomic filtered-checkpoint CAS and fenced
  historical reset disclosure. Preserve original owner effects and all existing
  source/index/checkpoint retention, recovery, deletion and withdrawal boundaries.
gui_related: false
gui_classification_reason: Defines backend persistence, replay and source authority.
depends_on: [DL-046, SP-262, SP-278, SMPFS-168]
unblocks: []
acceptance_criteria:
  - The exact family/key/value/producer/consumer and SP-278 read-token schema are registered without sibling or compatibility substitution.
  - Complete global captured range and Project/reset source filter are verified, including empty, zero-match, degraded and unavailable distinctions.
  - Same-generation frontier changes invalidate publication; prior-value CAS and before/after-commit source/access/deletion fences prevent false advance or disclosure.
  - Recovery and withdrawal preserve original reset effects, source identity, actual owner custody boundaries and exact existing retention policies.
  - Same-key current plus two closed retired cores preserve original identities, birth/withdrawal anchors and siblings; full capacity, active holds or unresolved refs block replacement/cleanup without early eviction.
  - Synthetic schema/codec/oracle passes do not establish native authenticated resolution, indexed-reset end-to-end execution, durability or DEPTH_PASS.
validation_surfaces: [Plans/browser_workspace_reset_contracts.schema.json, Plans/browser_workspace_reset_contract_fixtures.json, Plans/storage_value_registry.json, tests/test_pm_browser_workspace_reset.py]
risk_class: stale_reset_projection_or_replayed_owner_effect
reasoning_tier: high
context_scope: browser_workspace_reset_single_family
implementation_surfaces: [Plans/storage-plan.md, Plans/browser_event_admission.json]
node_compile_hint: {mode: static_single_family_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-046, Plans/storage-plan.md#SP-278, Plans/storage-plan.md#SP-262]
negative_constraints:
  - No sibling event, Browser owner physical family, retention policy, launch-critical promotion, runtime capability or native execution proof is admitted here.
  - No currentness inferred from a generation alone, a stored snapshot ID, matching-row maximum, unavailable source, supplied booleans or schema validity.
  - No WorkNode, NodeSeed, readiness clearance, count override, historical-audit restamp or governance seal.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-046, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-168, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:pm.storage_value.browser_workspace_reset_index_checkpoint.v1

<a id="seglog-append-observability-producer-and-read-contract"></a>
### Seglog append observability producer and read contract

This NEW technical definition under DL-045 preserves event-family-seglog-event-appended@2.0.0, its inline payload schema https://puppetmaster.local/schemas/event_payloads/seglog_event_appended/1.0.0, inherits_referenced_event scope and RP-SEGLOG-7D@1.0.0. The closed payload has seq,type,event_ref,segment_ref,ts and optional writer_id; it does not acquire schema_version or any other field. Contracts_V0 names the Storage append writer and projectors/analytics/replay, and ATS SEA-P01 requires the referenced frame and watermark synchronized before observability. Generation-1 wire-format retirement in Storage §2.2.2 does not retire this event. No runtime, readiness or depth pass follows from this contract.

### Producer authority, introduction boundary and no recursion

Define storage.seglog_append_observability_writer.v1@1.0.0 as an active Storage append-writer continuation. It is not a replay projector. For each newly committed native logical EventRecord after its adopted boundary, the validated original frame itself establishes the durable obligation to produce exactly one append-observability fact, except when the original event_type is seglog.event_appended. The metadata append never invokes this producer on itself. Ordinary original appends, metadata appends, physical compaction copies and compatibility reads remain distinct operations.

A NEW canonical adoption record with an immutable adoption floor and a separately mutable compact settlement prefix, seglog_observability_adoption.v1:{storage_instance_id}:{producer_version}, pins the actual instance, writer/version, exclusive committed-tail boundary, manifest ref/hash and source cursor, adoption ID and sole migration receipt. Its source_after_sequence_id/event_id/cursor are all null only for a coordinator-verified empty source boundary. A nonempty boundary requires exact equality to the cursor's last sequence/event and actual synchronized source manifest. Numeric gaps are not source events. A floor is not inferred from mtime, first retained row, maximum visible sequence or missing metadata.

StorageMigrationCoordinator creates this floor once under its existing exclusive lock, backup, pre-stamp verification, stamp-last, reopen and terminal migration-receipt round-trip contract before enabling the writer. The actual supported store graph must install the named family/version; an absent graph edge or receipt is no activation proof. Restore captures floor, source and source identity authority in the same existing canonical boundary. A missing/corrupt canonical floor restores from mandatory backup or fences this writer; it is never rebuilt from a retained tail. A successor has an explicitly adopted floor and semantics, preserves old identities and settles/preserves predecessor obligations before it can treat new sources as its own. It never retroactively claims pre-floor native records.

Only new native source appends under the installed writer are obligations. Pre-floor records, frozen v1/envelope compatibility views, projector_replay_only processing, JSONL, import inspection and physical survivor relocation never create one. Recovery may continue a proved post-floor native obligation from its preserved original source and actual recovery durability evidence; missing observability alone cannot prove that obligation. Unknown introduction, source provenance or historical settlement is unavailable, not permission to backfill.

### Strict source-first append and immutable producer bytes

The source append is the existing canonical append and returns its own original result. Before admitting any observability append, prove the original decoded EventRecord and registered payload; actual frame identity/CRC/bounds; and the committed original frame/watermark durability boundary under Storage's source/manifest authority. A four-field dedupe original_append_result is only an identity/location join. It is not the eleven-field synced AppendReceipt and cannot supply missing frame/watermark proof. persisted_at_utc alone is never durability proof. An atomic group that writes the metadata before the original proof is established does not satisfy this contract.

The original source remains authoritative whether observability subsequently succeeds, fails or is temporarily unavailable. Failure cannot uncommit/rewrite the original, replace its receipt with a metadata receipt, or rerun its owning action. Pending observability remains an explicit Storage producer obligation until reconciled. There is no best-effort disappearance or in-memory-only acknowledgement of that obligation.

For new v1 producer writes, derive identity_digest = SHA256(RFC8785([storage_instance_id, original.event_id])). event_id is evt_seglog_appended_ plus that digest; idempotency_key is seglog.event_appended: plus it. Writer/binding version, time, current segment, retries and process identity are excluded from this semantic identity. Preserve every already committed metadata identity/result during compatibility or successor adoption; a new spelling cannot rewrite it.

The new deterministic semantic mapping is:

- payload.seq = original.sequence_id; payload.type = original.event_type; payload.event_ref = original.event_id exactly, not a URL, encoded locator or dereferenced payload.
- payload.segment_ref is the original append result's Storage-owned segment reference, resolved and cross-checked against the actual original append/segment authority. Rotation/compaction does not replace it with today's locator. Unresolvable original segment identity is unavailable.
- payload.ts and outer occurred_at_utc equal original.persisted_at_utc. That stable commit-group time is descriptive and becomes admissible here only after the separate original durability proof. It is not replay order or the metadata TTL anchor. This binding omits optional payload.writer_id rather than inventing a historical process identity.
- Scope and envelope project_id exactly inherit the referenced original. The other domain joins are null; the original remains the source of thread/run/node/attempt attribution. The new actor_ref is the non-capability Storage service identity storage.append_observer:{storage_instance_id}:v1. It grants no user/service permission. Requested/effective account refs are null. correlation_id copies the original; causation_event_id and parent_event_id equal original.event_id. producer_sequence_id equals original.sequence_id. payload_ref is null; redaction_profile=no_secrets; migration fields are null; replay_policy=dedupe_by_idempotency_key.

These are producer bindings to the existing Contracts semantic projection, not an alternate EventRecord envelope. Storage assigns the metadata's own sequence_id, observed_at_utc and persisted_at_utc through normal append; its sequence must be strictly greater than the original. Apply registered schema, no-secret, scope, dedupe and writer-admission checks again to the metadata. Ordinary metadata uses the existing ordinary durability class; an original barrier stays a barrier and is not weakened. Metadata success requires its own frame and watermark barriers and matching synced receipt. Same identity/digest returns the original result; conflicting digest is idempotency_conflict; unavailable authority is dedupe_unavailable. No acknowledgement is fabricated from an index row.

The semantic bytes are reproducible from immutable original source, original append identity and the pinned adopted mapping; they do not require a second payload-copy outbox. Once metadata exists, its original semantic bytes/identity take precedence on retry. If the original inputs needed for an unfulfilled obligation are unavailable, do not invent replacement values. Preparation may occur earlier, but it is not an admitted/emitted payload or success before the original proof.

### Producer reconciliation, source preservation and exact settlement

Define the NEW progress binding storage.seglog_append_observability_producer.v1@1.0.0 and its disposable seglog_observability_producer_checkpoint.v1:{storage_instance_id}:{producer_version}. The canonical floor, authenticated contiguous settlement prefix and source authority are stronger than this checkpoint. It reads original seglog authority directly; it cannot manufacture authority from generic-index progress.

Under the existing append-writer lock and maintenance fence, validate floor, dedupe currentness and a frozen verified source range. Enumerate it in source sequence order, checking each complete frame and registered identity before classification. Pre-floor/compatibility/non-native frames and metadata frames are non-emitting skips only after that provenance is verified. Each eligible native source is pending until actual matching metadata settlement is proved. Call the normal admitted metadata append under the already-held writer context without reacquiring the same lock or bypassing validation. Newly appended metadata frames are examined as non-emitting records; a bounded reconciliation pass stops at a completely verified boundary, not at an unbounded moving native workload.

For each pending original, order the effects: prove original frame/watermark; admit and durably append/reconcile metadata; then advance the canonical settlement prefix for a complete eligible range in the adoption value under its own prior-value CAS; only afterward commit disposable producer checkpoint progress in redb. The checkpoint never advances ahead of that metadata durability result. No cross-store atomic transaction is claimed. Crash after metadata durability but before canonical-prefix commit preserves original/meta evidence and reexamines it through permanent event/scoped identity plus actual source durability, then commits the prefix once. Crash after prefix commit but before disposable checkpoint commit rebuilds progress from that canonical prefix and current verified tail, without reemitting metadata. Crash before metadata durability leaves the obligation pending. This is an owner producer continuation; a projector_replay_only invocation cannot execute it or append anything.

The producer checkpoint includes exact adoption ref/hash, source boundary ref, CURRENT digest, processed-through sequence, and the nine-field survivor cursor: manifest_generation,recovery_epoch,segment_generation,segment_name,byte_offset,last_sequence_id,last_event_id,survivor_prefix_sha256,projector_schema_version. The through sequence equals the cursor sequence. Resolve every ref to actual selected Storage evidence; timestamp is observation only. Resume rereads the last frame inclusively and validates its identity. Commit progress only against the actual post-append selected source generation and unchanged prior-checkpoint CAS; a changed fence aborts progress. current requires healthy, complete coverage of the declared boundary and actual matching manifest/survivor evidence. It does not claim that no later source append exists. Unknown ranges or source/settlement proof cannot be skipped.

An original obligation and its needed original/meta first-append evidence remain pending for preservation until the canonical prefix covers it; actual metadata settlement or a disposable checkpoint alone cannot release this dependency. Pending originals use the existing Storage-owned live-ref/maintenance-ref eligibility override in Case L-3; old source deletion already waits for cleared refs. Define storage.seglog_observability_pending_source_ref.v1 as the new resolver for that existing class: under the maintenance fence, floor plus actual source and metadata settlement evidence determine whether the source's bytes/identity are still needed by this producer. Unknown status is ineligible for destructive removal. This is not a new retention_hold_record.hold_kind, legal hold, manual_keep or safe-point recovery anchor. It retains no source beyond the pending dependency's authenticated canonical-prefix commit and does not retain source content for diagnostics afterward. Before compaction or deletion removes/relocates a pending original or metadata's necessary first-append evidence, reconcile and canonically certify the obligation or preserve that evidence through the existing verified source/translation mechanism. If neither is possible, maintenance remains blocked with evidence intact; do not silently create a permanent hold or waive the dependency.

Retained settlement validates actual original and metadata frames, exact adopted mapping, both frame/watermark barriers and matching permanent event/scoped identity values. A metadata four-field dedupe result alone never establishes this admission. The old proposal's guessed expired removal-lineage dictionary remains disallowed; current owners provide no permanent per-event removal receipt that can supply it. Instead the following NEW narrow canonical prefix closes prior-settlement custody without another family or retention policy.

### Original and metadata retained first-receipt resolver adoption

For exactly `storage.seglog_append_observability_writer.v1@1.0.0` and `storage.seglog_append_observability_producer.v1@1.0.0`, retained source-first admission and above-prefix settlement explicitly adopt SP-286/CV-339's `storage.first_append_receipt.resolve.v2` separately for the original event and its actual metadata event. Each request is that original admitted EventRecord identity/semantic request under its existing replay policy, in the actual same Storage instance. Storage resolves authentic global/scoped identity and canonical issued custody; the request cannot supply a replacement row, locator or receipt. Join each exact eleven-field first receipt and its retained four-field original result to that event's original ID/sequence, original segment reference/offset, scope/type/idempotency and producer-semantic identity. An allowed semantic duplicate ID resolves the originally issued ID without altering the adopted original-to-metadata mapping. The original receipt proves its own admitted durability class; metadata has its own synced receipt and normal original class. Neither receipt substitutes for the other, converts the original class, nor supplies the separate actual complete frame/CRC/payload/watermark proofs already required above.

When a caller claims that an available complete original or metadata EventRecord is the exact originally issued value, this retained-value path explicitly adopts `storage.first_append_receipt.resolve_full_value.v1` using only the closed `full_value_request = {event: <that available complete original value>}` and `full_value_result` in `Plans/event_append_receipt_contracts.schema.json`. Require actual v2 custody, exact original event ID, CV-339's full-value commitment and equality of the returned original receipt/segment ref to the actual selected originals. No payload reconstruction, caller hash, semantic-only receipt or v1 backfill supplies that stronger claim. Tuple-only original receipt replay keeps its existing semantic route; this adoption does not convert every receipt read into a source read or weaken independently required native original-source checks.

Lost acknowledgement after real issuance returns the exact stored original receipt. A missing result or metadata checkpoint does not mint another first acknowledgement. Only the actual never-issued complete current protected group may first-mint through `storage.first_append_receipt.issue.v2` after SP-286's complete source/group/dedupe/restore and both-barrier checks. Invoke the shared owner within the existing held writer context without reacquiring its lock, bypassing its guards or opening a second issuer. An unissued original group must settle before the metadata append can replace it, and unissued metadata must settle before dependent prefix certification. Previously issued loss, partial custody, a restored pending image or contradictory protected origin fences the obligation; no age, source-presence claim or guessed receipt repairs it. A restored absence cannot turn an old original or metadata identity into fresh work. Genuine new native original appends retain SP-286's actual fresh-owner/restore-occurrence admission; retrying a preserved observer obligation is not a new accepted original operation.

Before above-prefix certification, recheck every required original/meta receipt/result against the actual selected immutable custody, adopted original-to-metadata mapping, complete retained source/frame/watermark evidence, floor/prior-prefix CAS, scope/identity/dedupe, current writer/maintenance authority and independently derived whole prefix candidate after all dependent helpers. Keep these facts held through the canonical prefix transaction; only its real durable commit releases the pending source dependency and permits later disposable progress. Receipt issuance or metadata append that really occurred survives a later prefix refusal. No new cross-store atomicity is asserted.

This adoption does not change the separate `already_settled_prefix_certified` route below. Once the authenticated canonical prefix covers an original and its metadata has expired, use the exact existing canonical floor/prefix and permanent original/metadata identity joins under current inspection/access/deletion authority. That route calls neither receipt resolver nor issuer, requires no retained receipt row or available full EventRecord solely because of this adoption, reacquires no retired source/frame/manifest/group/request, and returns no new AppendReceipt or reconstructed payload. Do not reopen an already certified prefix or extend source retention to make a full-value call. Above-prefix/unsettled inputs still need their actual retained proof and cannot claim this exemption. Current filtered reader source/checkpoint obligations remain independently unchanged.

ContractRef: ContractName:Plans/storage-plan.md#SP-270, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/event_append_receipt_contracts.schema.json

The same seglog_observability_adoption value contains settlement_prefix, initially null. Its immutable floor fields remain exact. A prefix contains revision, through_sequence_id, through_event_id, the exact nine-field source_cursor, the captured source_selection, cumulative settled_native_original_count, committed_at_utc, commit_transaction_id and predecessor_prefix_sha256. Revision begins at one and increases by exactly one; the previous prefix hash is SHA-256 of its exact canonical MessagePack value bytes, null only for the first prefix. That new custody digest changes no existing producer, EventRecord, payload, control or legacy hash. The root is still one bounded canonical value per Storage instance and producer version. It stores neither per-event entries nor payload copies, and no checkpoint-style history array. The adopted mapping version remains pinned by the immutable floor.

Under the actual writer lock, maintenance fence and canonical prior-value CAS, freeze and verify the entire logical source interval after the previous prefix (or original exclusive floor) through the proposed boundary. Every eligible native original in that interval must have actual exact metadata settlement proved before this commit; enumerate every source position and settle each original exactly once. Metadata source records are verified non-emitting skips. Only actual proven abandoned allocator ranges can explain a missing numeric position in the newly certified interval; an unknown, retention-removal or corruption-loss hole cannot advance this prefix. For an originally empty store, null floor remains null and the verified interval starts with the actual first allocated source boundary; all earlier numeric leases, if any, require existing allocator evidence. Compatibility reads, import inspection and physical survivor relocation never become eligible native originals. Existing writer/source authority must authenticate the post-adoption native interval; a caller-provided boolean or source timestamp cannot do so.

Commit the complete new same-family canonical value only after those original/meta durability barriers. Preserve all needed source evidence until that commit is proven durable. The prefix's through cursor/event/source selection must equal the actual verified interval end; its cumulative count adds exactly the newly settled native originals, and the prior prefix and immutable floor must match the actual stored preimage. The commit transaction ID/time are the actual first canonical commit, not a disposable observation. No derived checkpoint can advance beyond this prefix. A retry reads the committed value and reuses the proved prefix; it neither invents another metadata event nor silently recertifies missing source. A later prefix overwrites this bounded certificate only after validating the entire next interval and its predecessor CAS.

After metadata expiry, read the actual authenticated canonical adoption/prefix and permanent original and metadata event/scoped identity records in the same admitted store snapshot. Resolve their exact existing dedupe keys and actual values; original global/scoped records must agree in identity, digest, original append result and locator. The original sequence must lie strictly after the immutable adoption floor and at or below the committed prefix; it must be an original event under the pinned native writer contract, not metadata-about-metadata or a pre-floor/compatibility source. The preserved metadata identity must equal SHA256(RFC8785([storage_instance_id, original.event_id])) under the already adopted spelling, have the original scope, and have a sequence strictly after the original. The authenticated certificate asserts that every eligible original in its interval was durably settled; it does not need to retain old frames or fabricate a removed-source receipt. Return already_settled_prefix_certified with the preserved identity and no new AppendReceipt, append, payload reconstruction, current source-presence claim or original-action replay. Original source may also be gone, provided actual permanent identity and canonical prefix custody remain authentic. Independently apply current inspection/access/deletion rules; this content-free settlement check grants no content access.

An original above the prefix still requires retained actual original/meta source and watermark proof before prefix advance. Missing/corrupt canonical prefix or floor requires their mandatory coherent backup under the original instance/writer boundary, otherwise fence reconciliation and dependent maintenance. Never reconstruct either canonical field from a disposable checkpoint, retained-tail maximum, absent metadata, timestamp, guessed removal manifest or unrelated backup. Restore preserves the immutable floor and latest authenticated prefix coherently with the canonical identity/source authority; a mismatched or older prefix cannot silently release evidence or regenerate expired metadata. The record remains non-rebuildable source/receipt lineage under existing RP-AUTHORITY-INDEFINITE. The new prefix is not a second canonical event source and has no per-event perpetual catalog or new retention timer.

A lost/corrupt producer checkpoint rebuilds from the actual immutable adoption floor and authenticated canonical settlement prefix, plus verified current source and permanent identity evidence for the remaining tail. Prefix-covered originals use the certified prior-settlement route; above-prefix originals require actual retained metadata settlement and a new canonical commit. If a preexisting hole cannot prove eligible skip or prior settlement, do not move the floor to the first retained row and do not reemit historical metadata. Preserve uncertainty and fence this producer's advancement. Generic original-event index/read access remains governed independently. This contract does not promise successful recovery when required canonical evidence has been lost.

### Concrete read consumers and publication

Define storage.seglog_append_observability_reader.v1@1.0.0 over the existing event_record_index.v2 output, with NEW seglog_observability_reader_checkpoint.v1:{storage_instance_id}:{scope_partition}. The exact partition is app for application scope or project~base64url_no_pad(UTF8(project_id)) for project scope. Three NEW read bindings use the same verified join and checkpoint token: storage.seglog_append_observability_projectors.v1, storage.seglog_append_observability_analytics.v1 and storage.seglog_append_observability_replay.v1, all at 1.0.0. They provide append observability to the already named consumers, with no new GUI, billable usage, durable analytics row or owner state transition.

Generic EventRecord index publication occurs first and independently. The filtered reader enumerates the complete declared partition range through an actual published full-index checkpoint, resolving each candidate metadata frame and exact payload. Then resolve payload.event_ref to the original registered source and verify original type/sequence/segment identity, inherited scope and actual committed source authority. Outer event_type remains seglog.event_appended while payload.type names the original; payload.seq is not the outer sequence. The metadata's sequence is later than the original. The index has no authority to replace either source frame.

Do not recursively follow metadata-about-metadata chains. New producer emission excludes them. A schema-valid historical record that references an earlier metadata record may be inspected one hop under its original contract, without scheduling anything; a self-reference, cycle or nonpreceding source cannot pass the sequence/source join. No new payload exclusion is added to the frozen registry schema merely to implement the current producer's no-recursion rule.

A complete checkpoint requires the full retained range, verified gaps/removals, CURRENT generation and source joins. An unreadable potentially relevant original is not a filter skip. Proven source removal is reported honestly as source_removed; unexplained absence is source_unavailable. The reader may expose already verified partial diagnostics, but cannot claim complete healthy coverage across an unresolved join. Metadata expiry does not imply original-event loss, and metadata presence does not authorize replaying its original action.

The reader adopts SP-278 reader.storage.event_record_index@1.0.0 and stores the exact closed read_token as index_read_token: storage_instance_id, checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection and redb_snapshot_id. The ref resolves the actual checkpoints root and its generation JSON Pointer in the same redb database as the selected generation dataset; no flat-table or foreign-database fallback is allowed. Row publication locators bind the immutable birth anchor; currentness separately binds the advancing frontier. An ordinary append changes the token even when generation and older rows remain fixed. Resolve actual selected source frames and both original and metadata EventRecord envelopes; recompute existing payload and producer-semantic digests without changing their codecs. The typed joins in the frozen joined-evidence schema pinned by reports/event-authority-20260911/step-08-seglog-validation.md are decoded adapter inputs, not replacements for native owner controls or receipts. The reader writes only its filtered checkpoint in one redb transaction under unchanged full generic token, CURRENT, source/survivor, access/deletion and prior-cursor fences. Read-only joins publish after commit under that exact snapshot token and are revalidated before disclosure. They have no separate durable effect. Crash before commit leaves prior progress; after commit recomputes the same join. These three consumers cannot advance a business projector, global index checkpoint, UsageRecord, canonical state or dispatch on the basis of this metadata. The original event's owner reducer still processes its original source exactly once under its own checkpoint.

Compaction may translate producer/reader cursors only by preserved semantic identity and verified survivor evidence, otherwise rebuild as defined. Target shadows publish only after the existing synchronized CURRENT selection. No retired locator survives and no timestamp steers selection. The original first-append segment reference is historical provenance, not permission to open a retired physical file.

### Exact policy and custody bindings

The metadata event remains RP-SEGLOG-7D@1.0.0: creation anchor, 604800 seconds, 500000 per actual Storage instance across application and project partitions, oldest-eligible overflow, hold eligibility and compact expiry. Its creation anchor is its own canonical persisted_at_utc after actual durable commit, not payload.ts, original creation, mtime or checkpoint refresh. Inclusive expiry and all stronger existing protections remain. Do not regenerate an expired metadata record and reset its seven-day window. Index rows for metadata use RP-EVENT-INDEX-SOURCE with THIS metadata event as their source; the original event and its separate index keep their own exact registered policies.

The new canonical adoption floor and compact mutable settlement prefix map to existing RP-AUTHORITY-INDEFINITE as migration/source-lineage authority. This is an explicit NEW technical class assignment under DL-045, justified by Case L-1 migration receipt/backup obligations and Case L-3's indefinite receipt/audit/source-lineage class. It is one introduction boundary per producer version and contains no per-event payload/history catalog. No policy value changes. Do not describe the assignment as an existing row or infer permanence from the word identity alone.

Both new disposable checkpoints use RP-PROJECTION-3GEN@1.0.0: current_plus_history, 604800 seconds, at most three per logical key, hold eligible, overflow rebuild_projection and expiry rebuild. Their precise terminal edge is current|degraded -> withdrawn; updated_at_utc freezes at first withdrawal and is the terminal anchor. Normal cursor refresh, source append, source completion and repeated withdrawal do not reset/start that TTL. A withdrawn record cannot refresh itself into current; an explicitly adopted successor/rebuild owns its new generation. Checkpoint expiry never expires a source or authorizes a new metadata emission.

The two actual redb checkpoint values live in the same database table named checkpoints, at their already proposed logical producer/reader keys. Each root contains one publication core and retired_generations with at most two closed, nonrecursive entries. A core now includes publication_id, published_at_utc and hold_refs. A retired entry contains checkpoint (the exact withdrawn core), retired_at_utc equal to that core's frozen updated_at_utc, and successor_publication_id. It does not embed an entire root or recursively nest history. Current, degraded and withdrawn root cores plus retired entries all count toward the three-generation ceiling; no fourth staged generation is persisted under another spelling or hidden side table.

Allocate a fresh non-capability publication_id exactly once for each deliberately rebuilt/new publication and durably reuse it across retry; published_at_utc is that publication's first committed selection. A same-generation refresh preserves both birth fields, all retired cores and hold_refs exactly while advancing only its admissible cursor/token/progress and observation fields under prior-value CAS. Withdrawal changes only state and updated_at_utc on the first current/degraded-to-withdrawn edge. An already withdrawn core is preserved byte-for-byte on a later successor handoff; repeated withdrawal never resets the anchor. The original root's complete existing retired array is carried unchanged, followed by the exact newly withdrawn core. The new current root, old withdrawal, carried history, selected identity and full source token commit in one redb transaction in the same store under the actual prior-value CAS. Initial admission and subsequent refresh/generation admission are separately verified; a self-consistent fabricated birth hash is not admission proof.

Cleanup targets one actual nonselected retired publication ID. It requires inclusive age >= first retirement + 604800 seconds, actual applicable existing retention_hold_record values and live/maintenance/backup refs, and an unchanged current owner hold/ref fence. An unresolved referenced hold blocks cleanup. Existing dynamically applicable holds protect it even when they were set after retirement and therefore are absent from the frozen core. The current root, never-withdrawn state and protected siblings cannot be removed. Serialize eligible cleanup and slot reservation with hold/ref admission and publication; preserve sibling bytes, then reserve the released slot. If no eligible slot exists, stop the new derived publication and disclose governed rebuild unavailability without eviction or a fourth generation. These records create no new hold kind or source-retention clock.

The three physical families and their v1 bindings are first-native registrations in this contract. No previously admitted historical value is reinterpreted. The frozen predecessor proposals remain source-lineage only. The sole StorageMigrationCoordinator still installs the actual supported graph before any production persistence; this packet allocates no store-version integer.


Adoption, checkpoints and diagnostics contain IDs, hashes, bounded cursors and non-capability refs, never source payload copies, credentials, account material or local absolute paths. Source and metadata permissions, deletion tombstones and quarantine custody apply independently before join/publication and after restore. Removing a project from a UI registry is not physical purge; explicit scoped data deletion follows existing Storage intents and eligibility. No application-wide deletion permission is created by inherited app scope. A preserved metadata/audit reference does not restore content or navigation that current deletion policy removed.

### Compatibility and withdrawal

The event payload stays its exact registered inline 1.0.0 shape under current EventRecord 2.0.0. Frozen EventRecord 1.0.0 and EventEnvelopeV1 use only existing registered normalization and unique referenced-event scope evidence. Preserve original source hashes and transient-upgrader provenance. A projector_replay_only view affects only allowed disposable read state; it never starts the producer, creates adoption, appends metadata or dispatches the original action. Missing/ambiguous scope or refs quarantine/refuse without reader advancement. No alias, new payload field or membership change is added.

Read-only consumer withdrawal fences only its own filtered publication. Producer withdrawal stops admitting new observability obligations at an explicit owner-controlled native append boundary; original appends that require the withdrawn contract cannot silently continue as if observability were active. Preserve and reconcile already admitted obligations or keep them fenced with their source refs. The adopted floor and permanent original/meta identity evidence remain under their existing lineage policies. An explicit successor migration defines its own floor and compatible semantic mapping and verifies pending settlement, source cardinality/joins and checkpoints before activation. Withdrawal never deletes the floor to pretend the producer was absent, rewrites historical identities, clears unresolved pending refs or reconstructs source actions from metadata.

All listed transitions, static fixtures and native obligations are contract evidence only. Actual source sync, expiry settlement, migration, maintenance races, checkpoint loss, permissions, deletion and recovery must be tested natively before any runtime acceptance claim.

### Static fixture and remaining contract boundary

The retained-source examples bind actual registered EventRecord and payload shapes to a complete SP-278 synthetic source/checkpoint/dataset and typed original/meta source evidence, both permanent dedupe value shapes, the canonical adoption value, actual checkpoint table/key/value bindings and full publication tokens. Producer progress examines the metadata tail as a non-emitting record after source-first settlement. Two positive retained joins and the individually named relational negatives do not authenticate installed migration floors, original native provenance, frame CRC, real receipt/manifest codecs, disk sync, redb or inventory completeness. The adoption floor and prefix read authenticity are assumed supplied by actual installed owner custody in these synthetic examples; native migration/adoption proof remains NOT_RUN. Transaction JSON hashes in retention fixtures are test-only checks, not new canonical producer or control hash recipes. The NEW same-value prefix remedy has typed initial, incremental and empty-floor canonical-commit fixtures, plus expired prior-settlement reuse with missing disposable progress and no source-presence claim. The old removal-lineage route has zero positive fixtures. No DEPTH_PASS is claimed.

### Exact producer projection, native bookkeeping and history joins

The immutable metadata producer projection binds occurred_at_utc to the original persisted_at_utc, exactly like payload.ts, even when the original occurred_at_utc is earlier. Validate all existing producer-semantic fields, schema and deterministic event identity against that projection. Do not compare the whole envelope to an example factory. Metadata sequence_id, observed_at_utc and persisted_at_utc are normal independently assigned Storage fields and join the actual metadata frame/watermark. Metadata sequence must be strictly greater than the original, not necessarily adjacent; complete coverage must explain any allocator gap through the actual owner evidence. Metadata's own persisted time remains its registered TTL anchor. These rules apply both to retained reads and canonical settlement-prefix admission. No existing producer hash or timestamp meaning changes.

Every producer/reader checkpoint generation has birth <= current observation. Retired cores keep first withdrawal as their exact update/retirement anchor. Every link has retired-core birth <= first retirement <= actual immediate successor birth, and all IDs form one unique ordered acyclic chain ending at the selected root. Resolve every actual successor in the bounded value; timestamps alone cannot infer links. A replacement cannot withdraw before birth or retire after its already selected successor. Refresh and replacement preserve the full logical owner identity, including schema/version, Storage instance and binding/version, and for readers scope_kind, project_id and exact encoded scope_partition. A matching partition string alone cannot admit a foreign project.

The permanent event/scoped identity pair must additionally join original_append_result.byte_offset to source_locator.byte_offset and original_append_result.segment_ref to source_locator.segment_name, alongside exact sequence/event/digest and actual store values. Repaired hashes or agreement between two identically forged index entries do not waive this cross-field source identity join. This historical check does not grant permission to open a retired segment or claim current source presence. Unsupported custody remains unavailable under its actual owner.

All nine root v2 findings are covered by schema-valid v3 regressions. Additional positive fixtures exercise Storage-assigned later times and nonadjacent legal sequence allocation through both retained and canonical-prefix paths. Native source/identity/commit authenticity remains NOT_RUN separately from these static predicate checks.

Validate replay_policy independently of the producer-semantic digest: a native metadata record requires dedupe_by_idempotency_key, and a projector_replay_only original cannot establish a native producer or settlement-prefix obligation. This adds no field to the existing semantic hash preimage.

```yaml
plan_unit_id: SP-270
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage defines source-first native append observability with an immutable introduction
  floor, bounded canonical settlement prefix, exact metadata identity, and independently verified producer
  and reader checkpoint generations.
gui_related: false
gui_classification_reason: Backend append custody, source preservation, filtered read publication and
  retention.
depends_on:
- SP-235
- SP-236
- SP-237
- SP-241
- SP-278
- SP-286
- CV-339
- DL-045
unblocks: []
acceptance_criteria:
- Only a proved native post-adoption original creates one nonrecursive source-first metadata obligation.
- Exact deterministic metadata mapping preserves existing source, payload and producer digest recipes
  and separately enforces native replay admission.
- Actual source and metadata durability precede canonical contiguous-prefix commit, which precedes disposable
  progress.
- Retained original/meta receipt recovery explicitly adopts SP-286/CV-339 original issued custody, genuine
  never-issued group recovery and lost/restore fencing; stronger original-value claims use the exact
  separate full-value interface without replacing required native source proof.
- Prefix-certified post-expiry resolution uses canonical prefix and permanent identities without receipt
  resolution, first mint, payload reconstruction or reacquiring retired source.
- Authenticated canonical prefix and permanent identity permit prior-settlement reuse after expiry without
  reappend or a source-presence claim.
- Pending evidence remains protected by the existing live-ref and maintenance class until canonical settlement
  certification.
- All three read consumers join actual source frames and the complete SP-278 snapshot token before checkpoint
  commit and disclosure.
- Two physical checkpoint roots carry at most three lawful generations with stable birth, exact first
  withdrawal, holds and serialized eligible cleanup.
- The new canonical floor and bounded prefix use existing indefinite migration and source-lineage authority
  with coherent backup.
- Unsupported migration, native provenance or missing canonical custody fences affected work; static fixtures
  confer no native or DEPTH_PASS acceptance.
validation_surfaces:
- Plans/seglog_append_observability_contracts.schema.json
- Plans/seglog_append_observability_contract_fixtures.json
- reports/event-authority-20260911/step-08-seglog-validation.md
risk_class: false_native_append_settlement_or_source_retirement
reasoning_tier: high
context_scope: event_authority_step08_seglog_append_observability
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Contracts_V0.md
- Plans/Automated_Testing_System.md#SEA-P01
- Plans/storage-plan.md#SP-278
split_recommended: false
source_atom_ids: []
preserved_exact_tokens:
- seglog.event_appended
- seglog_observability_adoption
- seglog_observability_producer_checkpoint
- seglog_observability_reader_checkpoint
- RP-SEGLOG-7D
- RP-PROJECTION-3GEN
- RP-AUTHORITY-INDEFINITE
- already_settled_prefix_certified
negative_constraints:
- No new event membership, payload field, retention policy, per-event perpetual catalog, global semantic
  hash preimage, launch-array entry, WorkNode or governance seal.
- No migration activation, source authenticity, native sync or runtime acceptance inferred from synthetic
  fixture values.
owner_hints:
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-270, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Log.md#DL-045, SchemaID:pm.storage_value.seglog_observability_adoption.v1

<a id="workspace-layout-changed-producer-custody-and-read-contract"></a>
### Workspace layout changed producer, custody and read contract

This is a new technical binding under DL-045 for the existing `event-family-workspace-layout-changed@1.1.0`. Keep `project_only`, payload schema `https://puppetmaster.local/schemas/event_payloads/workspace_layout_changed/1.1.0`, its exact 26 required fields and closed enums, and `RP-AUTHORITY-INDEFINITE@1.0.0`. The event is not a new admission. F3-515 owns applicable settled interaction; CV-323 owns truthful Home event/result/receipt joins; SP-245 owns the sole layout record's transaction/readback/recovery; UCC-144/UCC-147 retain command IDs. SP-273 owns this technical Storage supplement; no competing Home product owner is created.

### Existing behavior and exact applicability

The sole layout remains `pm.home_workspace_layout.v1` at `home_workspace_layout.v1:{project_id}:{workspace_tab_id}`. Its registered RP-CONFIG-CURRENT, resettable-UI recovery, schema, stable domain identities and four-editor/four-terminal-section/four-visible-pane limits remain unchanged. It stores presentation and refs only. Editor buffers/tabs/dirty state, terminal trees/PTYS/transcripts, Browser sessions/history, Chat messages and Dashboard widget arrangement remain separately owned. An event is evidence of a settled change; it is not a replay instruction for those domains or an alternative layout snapshot.

Only an actual admitted existing command whose owner accepts an applicable changed Home layout produces this event. Preserve the exact command enum of the current payload. The enum is a syntax ceiling, not proof that each command/mutation pair is supported. The owner result must identify the actual normalized command and mutation under its existing owner contract. A `cmd.widget.*` transaction cannot emit this event. `cmd.workspace_layout.size_surface` remains a documentation-only preset normalization to `cmd.workspace_layout.resize_surface`, never an admitted command or event alias. `cmd.panel.redock` is absent from the current closed payload command enum; its presence in a sibling panel owner is not permission to widen this schema or fabricate a `cmd.panel.undock` command. An unsupported pairing remains event-inapplicable and cannot be silently normalized.

Opening/closing/moving/resizing/collapsing/resetting Home presentation, or the already defined targeted file/Browser placement and terminal-owner handoff, uses exact actual command applicability. An already-open panel or unchanged focus target may return the existing admitted `no_change` result/receipt, with no changed event. A preview, cancellation/no-change release before admission, disclosure, disabled action, hover or pointer frame creates no command, receipt, layout write or event. For an admitted rejection/failure/cancellation, preserve its typed owner result and the one dispatch receipt; do not fabricate a successful change. Restore/migration/recovery enum values do not authorize making up a command, interaction or receipt: an automatic recovery that has no admitted command carries its existing recovery projection and no workspace event. The existing safe-default write still occurs under SP-245.

`terminal.workgroup_moved`, `panel.undocked`, `panel.redocked` and Browser events keep their separate applicability, identity and owner result. This binding covers only the workspace-event obligation from a proved Home change. A sibling obligation must be durably coordinated by its actual owner before that domain reports completion; its unresolved contract is not an excuse to fabricate or omit either event. The sibling producer remains subject to its own contract.

### Newly defined producer and operation identity

The current writer is `home.workspace_layout_commit.v1@3.0.0`, the Rust Home owner command continuation with Storage performing its canonical writes and append. The retained canonical `1.0.0` contract and frozen external `2.0.0` compatibility shape keep their original read authority; the current Home3 admission and pending/full-value requirements below govern new writes. It is not the descriptive registry projector role, a GUI callback, a generic EventRecord indexer or `projector_replay_only` consumer. An actual command instance and request identity remain distinct from the command ID enum. Before mutation, authenticate current project/workspace, actual Storage instance, command instance, expected revision, idempotency binding, origin/correlation, current domain references and permissions. Obtain one serialized Home transaction lease per project/workspace under the existing Storage admission/maintenance fence. Other owners' identities are resolved, never created or repaired by a layout event.

Define `operation_digest = lowerhex(SHA256(RFC8785([storage_instance_id,project_id,workspace_tab_id,command_instance_id])))`. This is a NEW exact naming binding for the existing logical transaction. It excludes current revision, clock, producer version and retry count. Use `home_layout_operation:{digest}`, `home_layout_result:{digest}`, `home_layout_dispatch_receipt:{digest}`, and `home_layout_settlement:{digest}` as non-capability refs to the corresponding parts of the new operation receipt. The EventRecord ID is `evt_workspace_layout_{digest}` and its idempotency key is `workspace.layout_changed:{digest}`. Resolve each ref through actual Storage custody; string syntax conveys no authority or access.

Keep the actual command idempotency key and the NEW Home domain-request RFC8785 binding digest request_sha256 in the operation receipt. Its input is the normalized Home object with exactly command_id, command_instance_id and args, without retry transport dispatch fields. The separate normalized_command_payload_sha256 preserves the actual existing SIR normalized-command payload digest, whose owner algorithm is unchanged; do not equate it with this Home-specific request digest. request_source_bytes_sha256 additionally binds the exact authenticated original request bytes and never replaces semantic idempotency. Before executing a retry, resolve the same command-instance and the scoped command-idempotency binding to the original operation, request digest, result, receipt and event. Same binding joins pending or returns the original terminal result. Different request bytes under either identity refuse without effects. Neither a repeated gesture nor a caller-selected new command instance can reuse an old command idempotency key to bypass that comparison. Event-level app-root dedupe remains separately required. An operation ID, reference or schema-valid result alone is not proof of a valid original command.

The first prepared event semantic fields are immutable after readback certification. Envelope project_id equals payload project_id and the actual layout project; scope_kind=project. Thread/run/node/attempt and account refs are null for this presentation-only fact. actor_ref is the authenticated admitted command actor, not a reconstructed UI identity. correlation_id equals command/payload correlation; parent_event_id and causation_event_id are the actually admitted causal EventRecord ID or null when no such event exists. producer_sequence_id is the accepted new layout revision; occurred_at_utc equals the frozen settled_at_utc. payload_ref=null, redaction_profile=no_secrets, replay_policy=dedupe_by_idempotency_key, and all migration fields are null for new native writes. Storage assigns event sequence and observed/persisted times. Freeze actor, correlation, causality, command refs, settled time and payload bytes before append retries; the retry does not regenerate them from current UI state.

### Exact new custody, without an alternative layout history

Use the three existing physical families, each with a real standalone schema definition pointer:

1. `home_layout_transaction_slot`, key `home_layout_transaction_slot.v1:{project_id}:{workspace_tab_id}`. One mutable serialized recovery slot contains the current operation, exact prior and candidate semantic layout bytes only while a mutation is unresolved, request/identity pins, phase and canonical readback evidence. It stores no preview frames. The empty state retains only scope, installed-version/migration binding, monotonic slot generation and last terminal operation ref. This is an operational rollback buffer, not a historical Home layout archive or second user-editable store. Candidate/prior snapshots are removed atomically when the resolved operation releases the slot; canonical Home layout remains the sole selected presentation record. The slot's mapping to existing RP-CONFIG-CURRENT is NEW technical assignment: one current slot plus at most its protected prior migration generation, existing actual migration-completion anchor/90-day policy unchanged; operation settlement/refresh does not start/reset that TTL. Active operation custody is an existing live-ref/maintenance eligibility dependency, not a new hold kind.
2. `home_layout_operation_receipt`, key `home_layout_operation_receipt.v1:{project_id}:{workspace_tab_id}:{operation_digest}`. This holds the immutable admitted identity/request digest, content-free prepared/terminal result, single dispatch receipt, revision edge, layout hashes, readback identity and event semantic pins. It contains no full layout, request args, file paths, buffers or domain bodies. It is the actual new exact custody of the already required typed Home result and receipt, not the deferred generic `receipt_record_baseline` or a fixture trace. Its NEW mapping to existing RP-AUTHORITY-INDEFINITE is receipt/audit lineage under Case L-3, with policy values unchanged. `settled_layout_ref` resolves the receipt's exact historical layout revision/hash/readback binding; current layout bytes can be returned only if the independently selected canonical record still matches. Old layout bytes are not reconstructed or retained forever merely because the receipt/event is indefinite.
3. `home_layout_event_reader_checkpoint`, key `home_layout_event_reader_checkpoint.v1:{storage_instance_id}:{project_id}:{workspace_tab_id}`. Disposable filtered coverage/currentness only, RP-PROJECTION-3GEN unchanged, never canonical layout or receipt authority.

The original DL-045 binding authored these technical class assignments; Home3 reuses their existing registered families, keys and policies. Neither registration nor the successor schema claims that native physical rows already exist. No retention catalog value, source Home retention, event retention or allowed hold kind changes. Install the new actual family/version through the sole StorageMigrationCoordinator, exact supported store graph/family floor, exclusive lock, protected backup, verify-before-stamp and terminal receipt round trip before enabling the producer. Initialize an empty slot for each existing scoped Home layout only through that proved adoption; absence after adoption is loss, not permission to assume no operation. Canonical slot/receipt custody is mandatory-backup/non-rebuildable while command lineage exists; the independent selected Home layout remains resettable UI state. Restore the slot, receipt and canonical Home row in one verified boundary before re-enabling Home mutations. Missing/corrupt slot or receipt fences this scope until existing backup recovery proves the state; never infer success/failure from a newer-looking layout or absence of an event.

The receipt's command-idempotency resolver uses the exact scope/command key across existing operation rows; a disposable lookup index may accelerate it only if separately registered. No hidden durable index is defined. A bounded authoritative scan is permitted within the existing governed storage lane; unavailable complete identity coverage means refuse/join-unavailable, not execute again.

### Transaction and crash convergence

No cross-store atomic commit is claimed. All direct Home readers and restore paths consume the slot's selected-state fence along with the canonical Home row; while pending they cannot treat an unfinalized candidate as a successful committed UI revision. The prior verified model can remain visible with existing pending/recovery treatment. One operation owns the scope until success or proved rollback; later changes cannot pass it.

1. Validate command availability and exact expected revision against selected canonical bytes, all stable identity/limit/bounds/owner joins, and a genuinely changed candidate. Freeze the actual prior focus sequence in the prior layout. Before domain mutation, durably record the slot's prepared operation/identities and exact prior/candidate bytes. Domain effects from file/Browser/terminal commands remain their owners' prerequisites; this slot cannot authorize or roll them back.
2. In one durable redb transaction, compare-and-swap the same prior canonical hash/revision and slot generation, write the candidate to the canonical Home key, and mark the slot canonical_written. This is the one candidate layout write. Read the canonical value back independently through the admitted Storage adapter, byte-for-byte in the actual canonical Home owner encoding, without substituting a new encoder, and rerun schema/scope/identity/limit/bounds validation. The slot keeps prior bytes until this verification and event settlement resolve. A row object or boolean fixture witness is not actual durable readback.
3. On successful readback, durably freeze the exact new revision, canonical hash, Storage transaction/readback reference, settled time and complete producer semantic pins. Create the operation receipt in prepared state with the real accepted owner result/dispatch receipt, exact one result ref and one receipt ref, and the allocated event ID. The prepared result reflects the certified layout change but is internal: the dispatcher must not publish terminal command success or a linked committed EventRecord yet. The pending-versus-terminal phase is explicit; the preallocated event ref is not a claim that a frame exists.
4. Append `workspace.layout_changed` through normal schema/redaction/scope/dedupe admission using those exact frozen bytes. Success requires actual frame synchronization and selected durable watermark plus matching synced AppendReceipt. As a fact after a presentation mutation, it uses the existing ordinary append durability class; it is not permission for a subsequent external mutation. Do not substitute the four-field dedupe original_append_result for durability proof. Reconciliation must join the actual source frame and committed watermark to that result.
5. After actual append success, atomically finalize the receipt with the real event result and committed state, release the slot to empty (clearing prior/candidate snapshots), and pin its last operation ref/generation. Only then publish the successful model/revision/counter, owner result, one dispatch receipt and CV-333 response with the actual event link. The existing layout record's revision is the candidate's accepted revision; intermediate slot writes and readback bookkeeping are not extra successful layout writes.

A write/readback failure before event admission restores the exact prior canonical bytes and model/focus sequence, verifies that rollback, and commits the one failed rolled_back receipt without a success event. A definitively refused event append may similarly roll back only after proving no matching event was admitted/durably recoverable. An ambiguous append result or interrupted readback is unresolved: preserve the slot and fence publication/mutation, recover actual Storage state, and never claim rolled_back=true or a failed terminal result while a matching success event might exist. If rollback persistence itself fails, keep recovery-required/fenced state and exact custody; a guessed in-memory rollback is not durable failure completion. UICommandResponse uses its existing pending/recovery_required/error vocabulary, without adding generic error codes.

Crash before candidate write resumes or cancels only the same admitted operation; it cannot invent a new command. Crash after candidate commit but before readback re-reads that candidate under the same slot and source fence. Crash after readback/preparation but before append retries only the exact frozen event. Crash after event durability but before receipt finalization obtains the actual original event result, finalizes once and never reverts a proved committed event. Crash after slot release returns the existing terminal result via command and event dedupe without another layout write, revision advance or event. A current layout mismatch outside these declared phases is an integrity/currentness failure, not permission to overwrite a concurrent owner.

A missing event for an old layout is never enough to create one. Existing pre-adoption layouts and old receipts are not retroactively emitted. Recovery/migration default writes without exact command/result/receipt lineage retain their existing recovery disclosure and do not fabricate the closed event's required command fields. Event replay is read-only, cannot enter this producer, mutate canonical Home state or restart a native window/domain action.

### Payload relations and read consumers

The unchanged schema is necessary but insufficient. Producer and reader enforce:

- All operation, command, interaction, correlation, project and workspace refs join the same actual admitted command and receipt. The single receipt entry equals that operation's dispatch receipt; command_result_ref names its accepted result. An unresolved caller-provided ref refuses emission/publication.
- prior_layout_revision equals the selected prior layout; new_layout_revision equals the validated candidate and is exactly prior+1 for this serialized semantic Home mutation. A reset creates its own revision edge instead of reusing revision zero. Before effects, unsupported representation in the unchanged event or semantic-hash adapter refuses this event-producing operation; it never wraps, rounds, truncates, or rewrites an independently valid Home source.
- affected_surface_instance_ids is the exact distinct set whose owned Home fields changed under the actual mutation, including required layout reflow peers when their canonical fields changed. It cannot be an arbitrary subset or contain newly minted domain identities. saved_at, validation or migration bookkeeping alone is not a user-layout change.
- Source/target host, slot, target surface and insertion edge describe the actual final accepted command intent and candidate. Use null for genuinely inapplicable fields; do not infer a single source host for a multi-surface reset. A changed reorder commits the last painted intent, never a new pointer-up target. Preset ID is null except when the actual accepted size binding uses one of the existing curated values, and it agrees with candidate size data. All target/domain refs obey owner capability/identity rules.
- settled_layout_ref resolves the exact candidate revision/hash/readback evidence. settled_at_utc is the first certified settlement timestamp; it is neither replay order nor retention reset. settled_only=true, preview_state_included=false and persisted=true require the actual source proof, not merely schema constants.

Define NEW `home.workspace_layout_event_reader.v1@1.0.0` over existing `event_record_index.v2` plus actual source frames and `home_layout_operation_receipt`. Generic index publication remains first and independent. Enumerate the complete declared project/workspace filtered range, resolve actual payload and terminal receipt, verify source frame/watermark, all immutable joins, and gaps/removals. A prepared receipt or unresolved potential match prevents healthy complete advancement; already verified partial diagnostics remain partial. Receipt metadata can establish historical settlement even when the old full layout has been superseded under RP-CONFIG-CURRENT; report historical source bytes as unavailable rather than reconstructing them.

Three NEW read consumers share the verified token: `home.workspace_layout_home_view.v1`, `home.workspace_layout_editor_routing.v1`, and `home.workspace_layout_terminal_presentation.v1`, all 1.0.0, corresponding to the existing Home restore, FileManager routing and Section15 presentation consumers. They may use an event as invalidation/diagnostic context, then read the sole independently selected canonical Home layout after its slot fence clears. They never apply event deltas to rewind/rebuild that canonical row, create editor/terminal/Browser identity, infer process liveness, replay the command, or recover deleted content. The prototype mirror is illustrative and is not native durable producer/receipt authority.

The reader checkpoint contains actual instance/project/workspace, binding/version, generic-index checkpoint, complete range, current-selection digest, nine-field survivor cursor, selected layout revision/hash and slot-generation fence, health/coverage and update time. In one redb transaction it writes only the filtered checkpoint under unchanged generic index, source/CURRENT/survivor evidence, receipt state, selected layout/slot generation, deletion/access and prior-checkpoint CAS. Publish the read join only after commit under that exact token and revalidate before disclosure. Crash before checkpoint leaves old progress; after commit recomputes the same read-only join. No second durable projection or successful persistence counter is derived from this metadata. A historical event may be valid history while the selected current layout has a later revision; sequence/current token, not event timestamp, determines processing and currentness.

### Retention, compatibility, deletion and withdrawal

The event remains indefinite metadata under its exact registered policy. The event index is RP-EVENT-INDEX-SOURCE coupled to this event; permanent EventRecord identities remain app-root authority. Neither implies indefinite full layout, window geometry history, buffers or domain-body retention. The existing canonical Home record remains latest valid plus its protected prior migration/recovery generation under RP-CONFIG-CURRENT, with live restore/migration refs preventing premature compaction. The transaction slot and receipt mappings above change no policy values; content-free receipt permanence cannot be used to retain cleared temporary snapshots.

The filtered checkpoint now materializes RP-PROJECTION-3GEN in the exact generation/history value below. Its current terminal transition is first current|degraded -> withdrawn; terminal_at_utc and updated_at_utc freeze at that edge. Actual replacement retires the final old core once in a predecessor wrapper. Refresh, repeated withdrawal and source completion do not restart a seven-day terminal anchor or create more than three generations. Checkpoint loss invalidates coverage and rebuilds only disposable read state from actual retained events/receipts; it cannot rebuild a missing canonical slot/receipt or replay Home mutations.

Apply current project/workspace access, deletion tombstones, quarantine and backup custody before every ref resolution and disclosure. A deleted project/workspace or closed UI tab is not permission to physically purge indefinite receipts or pending rollback evidence. Conversely a retained event/receipt is not permission to reopen inaccessible tabs, restore deleted bodies or recreate owner resources. Unknown pending-operation status is ineligible for destructive maintenance under existing live-ref rules. Do not mint a new legal/manual/recovery-anchor hold. Revalidate current bounds and native capabilities on ordinary Home restore; Wayland best-effort position and safe-dock fallback remain SP-245/F3-HOME-005 behavior, not event-authored recovery.

Payload 1.0.0 history is read-only compatibility using actual frozen source contracts where available; never upconvert by inventing missing interaction/result/receipt/settlement refs. The current 1.1.0 schema and membership are unchanged. Frozen EventRecord 1.0.0/envelope normalization uses only existing registered evidence and unique scope joins, preserves source hashes and remains projector_replay_only. Unsupported or ambiguous historical records quarantine/refuse without filtered advancement; no alias or payload extension is introduced.

Withdrawing a read consumer invalidates only its token/publication. Withdrawing the producer prevents admission of new applicable Home mutations at an explicit owner boundary; it must settle or preserve already admitted slot operations and exact receipts before a successor activates. Ordinary layout restore/read can continue only through verified selected-state fences. A successor installs through the sole migration owner, preserves old event and command identities/semantic bytes, resolves pending state and validates existing canonical layout before enabling new mutations. It does not erase the slot or infer a clean first run from its absence. No new user command, mode, feature, retention decision or event family is introduced by withdrawal.

Schemas and fixture checks establish static contract evidence; the native acceptance obligations require actual execution. Native redb/seglog ordering, receipt authenticity, actual command dispatch, crash recovery, window effects, migration, deletion/access and UI behavior remain NOT_RUN until executed through their real owners.


### Exact admitted request, original shared outcome and response custody

Before any effect, request args project_id, workspace_tab_id and expected_layout_revision equal the binding and actual selected prior source; hashing a foreign request does not admit it. Envelope actor_ref, causation_event_id and parent_event_id equal the authenticated original admitted actor/causal binding. Native presentation-only thread/run/node/attempt/account/payload refs remain null. Slot, receipt binding, filtered checkpoint, generic checkpoint and actual Storage admission instance agree. Withdrawing or degrading a checkpoint never returns healthy current.

The Home-owned owner_result and dispatch_receipt are typed domain evidence, not Full Thread CommandOutcomeRecord substitutes. NEW SIR-046 delegates capture of the authentic SIR outcome for these actually admitted Home command operations to this same home_layout_operation_receipt family. SIR remains the sole semantic producer/authenticator. SIR-044 is create-restore-point only and grants no Home custody authority. The exact existing CommandOutcomeRecord and CV-333 UICommandResponse are imported by their original schemas, with internal reference relocation only. original_normalized_request captures the exact content-free identity projection (actual request ref, command/instance/operation, complete original owner identity, original existing payload digest, idempotency, target generation and dispatch frame). It is a NEW Home capture of that actual original, not a new normalized-request format or a replacement request.

Authenticate the original SIR owner and dispatcher at initial capture and every pending advance. The original command outcome identity equals that request identity, including server, project-home server, environment, source location and topology generation; no field is filled from current UI topology. Its command, payload digest, idempotency, target generation and dispatch frame equal the actual original request. The original normalized request command_id and original CommandOutcomeRecord command_id both equal the exact accepted Home operation binding, actual Home request, event payload, Home owner result and original CV-333 response command_id. Equality between two foreign commands is insufficient; the whole joined command must belong to the unchanged workspace.layout_changed payload enum and actual accepted mutation pairing. The operation/command instance equals the Home binding. The original CV-333 response joins original dispatch/request, command/instance, operation/full owner identity, command_outcome_ref, typed result ref/schema, receipt and event IDs, and genuine status/error. A succeeded Home change requires the actual SIR succeeded result and actual CV-333 succeeded projection. Acknowledgement alone is not completion.

Compute original_owner_result_sha256 from the Home-owned owner_result object ALONE using the existing CV-333 RFC8785/SHA256 rule. The result contains neither this hash nor the containing receipt, outcome or UI response, so the graph is nonrecursive. The SIR owner_result_ref resolves the same stored #/$defs/owner_result typed value through the actual receipt resolver; owner_result_schema_ref has path Plans/home_layout_event_contracts.schema.json and json_pointer #/$defs/owner_result. The original command_outcome_ref resolves the captured authentic original_command_outcome; it is not evidence merely because it is nonempty. Home's one actual dispatch receipt remains independently authenticated evidence and its exact receipt_ref matches the SIR outcome and response. No parallel global receipt/outcome writer or fourth durable family is added.

Barrier3 atomically commits terminal original owner result, outcome, response and byte-custody hashes with the Home receipt and empty slot. No terminal UI success is released beforehand. Prepared/ambiguous operations preserve genuine pending owner custody and cannot manufacture a terminal capture. Pre-dispatch refusal creates no Home operation row or SIR outcome. Admitted no-effect failure/no_change/cancellation requires its real original typed result, SIR terminal disposition and CV-333 response under existing semantics, not synthesized failure after an ambiguous append. Only move/succeeded is statically executed here; other terminal/applicability paths remain native obligations.

The entire terminal receipt is immutable canonical delegated custody under existing RP-AUTHORITY-INDEFINITE and mandatory backup. The resolver returns those original records after layout replacement or temporary snapshot cleanup. A new transport retry may project existing CV-333 replay metadata using the actual new dispatch while preserving the original result/outcome/status/error/request/receipt/event identities and original_dispatch_id; it cannot regenerate originals from current state. Missing authentic historical outcome/response means replay unavailable and scoped recovery fencing, never a second layout effect. Historical event inspection can remain valid without claiming missing command replay authority. Passive read/replay writes nothing. The source refs remain original; the canonical receipt's resolver binds each original ref to its exact captured field.

### New byte digests and numeric boundary

NEW request_source_bytes_sha256, prior_layout_sha256, settled_layout_sha256, readback.layout_sha256 and checkpoint.selected_layout_sha256 bind exact bytes actually supplied/read by the corresponding Home source adapter. They do not assert that the fixture JSON encoder is the canonical Home serializer. Native source capture must use the admitted actual source codec and reject unsupported encoding before dependent effects. Exact integer and finite-decimal values and original Home bytes are preserved; layout_revision remains unbounded in the original Home schema. No decoded-object reserialization stands in for rollback/readback byte identity.

By contrast, identity_capture_bytes.normalized_request|command_outcome|ui_response is a NEW content-free Home projection capture of the actual authenticated owner values. The original owner docs do not establish that those exact JSON bytes were ever serialized by SIR or the dispatcher. This contract therefore does not call them original owner wire bytes and does not require an invented native source encoding. identity_capture_encoding = home_content_free_capture_utf8_json.v1 identifies this new same-receipt capture: strict UTF-8 JSON with unique keys, exact arbitrary-length integers and exact finite decimal values, preserving the imported original typed fields and no extra arguments/body. Capture once from the real authenticated SIR/dispatcher values; retain the exact chosen serialization bytes and SHA-256 of those bytes. Whitespace/object order is not semantic identity, and no normalized-source digest is recomputed from this new serialization. Subsequent reads decode the retained bytes strictly and require exact typed-value equality with the stored original fields and original owner identity/request/outcome/response joins. Unsupported or lossy owner-value capture is unavailable; no native serialization or authenticity is inferred from a digest.

checkpoint.receipt_boundary_sha256 binds the exact persisted Home receipt value bytes, including these new captures and the original-publication fields below. The operation's existing Home domain request digest, SIR normalized payload_sha256, CV-333 separate owner_result RFC8785 hash, EventRecord producer-semantic/payload hashes and SP-278 binding codec are unchanged. Refs remain refs rather than recursive digest inputs. Native encoding of the canonical Home receipt and actual byte readback must still be verified; fixture capture serialization is explicitly synthetic.

Before admitting a new event-producing Home mutation, its exact revision edge and every existing semantic digest must be representable by the unchanged event/hash adapters: EventRecord producer_sequence_id remains u64 and JCS numeric requirements remain. Refuse unsupported exact numeric admission before effects; never round a revision or declare an otherwise valid Home source corrupt. Existing independent Home read/storage behavior remains SP-245 authority. Static source vectors preserve integers beyond u64 and long finite decimals; separate new-event admission vectors refuse unsupported edges. No overflow migration or source-schema cap is introduced.

### Canonical generic index adoption and complete read token

Adopt actual canonical SP-278, not an opaque generic-index pointer. Under one actual redb snapshot resolve event_record_index_checkpoint.v1:{storage_instance_id}, current_generation_id, its exact node and event_record_index.v2@{generation_id} dataset. Each indexed row key is event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}, with exact existing project partition encoding. Resolve its checkpoint_ref to root#/generations/{generation_id}; compare row publication_locator to the immutable birth anchor, including manifest/recovery/survivor binding, rather than incorrectly requiring old rows to carry the newest append manifest. Verify every row's existing payload/source/producer digest recipes, immutable source locator and event identity against actual source frame bytes and synchronized watermark.

Separately verify the complete advancing CURRENT-selected frontier: Storage instance, actual CURRENT and manifest bytes, selected segment generation, recovery epoch, retained inventory, watermarks, exclusions, survivors, complete global row set/count and retained source coverage. Coverage is global across application/project scopes and all event families; filtering workspace.layout_changed happens afterward. Every filtered candidate must resolve its original payload and Home terminal receipt. Missing/unverified or ambiguous filtered matches cannot be hidden by a healthy generic range. Nonmatches still belong in generic global coverage. A metadata row is not a receipt or frame authority.

reader_checkpoint.generic_read_token is the exact canonical SP-278 read_token schema, including root key/ref, generation anchor digest, frontier revision/hash, dataset, full source selection and actual redb_snapshot_id. The filtered checkpoint also joins current source selection digest using unchanged SP-278 binding codec, source cursor to the actual selected frame, the separately admitted historical original receipt, selected Home exact bytes, slot generation and full terminal receipt byte digest. Check generic and filtered prior-CAS, actual source/permission/deletion/receipt/layout/slot evidence immediately before the same redb publication and before disclosure. A same-generation append changes frontier freshness and invalidates the full token even when no matching workspace event was appended. A withdrawn or degraded filtered checkpoint cannot return current. Static mixed-scope append coverage preserves the old row anchor while catching up to a newer manifest; native source/CRC/fsync and locking remain NOT_RUN.

### Concrete three-generation history and refresh

The same home_layout_event_reader_checkpoint row owns generation_id, generation_born_at_utc, terminal_at_utc and previous_generations. generation_id is a fresh hlg_ plus 64-hex native generation identity allocated under the existing maintenance publication fence, never inferred from timestamps or reused. previous_generations has at most TWO entries. Each contains exactly retired_at_utc, successor_generation_id, existing hold_refs and a complete nonrecursive reader_checkpoint_core with no previous_generations. Thus one current plus two retired is the exact three-generation cap, with no hidden history table. All scope/binding/version identities join. Every retained chain satisfies birth <= first retirement <= immediate successor birth and distinct generation identity. Unknown or impossible old history cannot authorize a refresh.

An ordinary source/authority/layout/receipt refresh keeps schema_id, schema_version, storage_instance_id, project_id, workspace_tab_id, binding_id, binding_version, generation_id, generation_born_at_utc, terminal_at_utc and all predecessor entries byte-for-byte, replacing only mutable current read state under the complete freshness/CAS fence. Exact logical-key identity is checked even with an empty predecessor array; matching or absent history never supplies that join. It consumes no generation slot even at cap. A verified rebuild or supported successor allocates a distinct generation; in one redb transaction archive the exact final old core, its first actual retirement time and exact successor, publish the new current core and preserve all older entries. A stale initial core is not the final retired core. A failed/retried replacement cannot move birth/retirement clocks or expose half a replacement. First withdrawal changes exactly state, terminal_at_utc and updated_at_utc, preserving every other field including selected layout hash, source/receipt token, logical identity and history. terminal_at_utc equals updated_at_utc at that first edge and is no earlier than the prior update. Repeated withdrawal is byte-for-byte identical and ordinary refresh cannot revive it. Replacement of an already withdrawn core preserves its first terminal_at_utc as the wrapper retired_at_utc, even when the successor birth is later. Replacement of a nonwithdrawn core uses the actual successful replacement time. Every archived withdrawn core has retired_at_utc = terminal_at_utc = frozen updated_at_utc. Birth <= first terminal/retirement <= immediate successor birth is required at every retained link; no replacement slides a seven-day window.

Existing RP-PROJECTION-3GEN remains three generations and seven days after actual terminal state, with existing hold/live-reference eligibility. For a retired wrapper use its first actual retirement timestamp; for current withdrawal use first terminal_at_utc. This is exact storage of the existing anchor, not a new duration or sliding TTL. Retained core history is derived metadata only and grants no extra Home/source-body retention. Remove only an eligible oldest retired tail after seven days and after actual hold/ref/source-maintenance checks under serialized cleanup/publication/hold admission. Do not remove an intervening successor needed by a retained older node. All three protected slots blocks replacement and requires existing rebuild/recovery disclosure; never evict held history or exceed cap. Current authoritative Home layout and canonical receipts remain independently governed. Checkpoint loss rebuilds disposable state only from actual admitted sources.


Exact byte-capture closure: the pending slot retains actual prior_layout_source_bytes_base64 and candidate_layout_source_bytes_base64 alongside decoded layouts and their exact byte hashes. Empty-slot release clears both bytes and both snapshots atomically. Rollback restores and verifies exact original Home bytes; equal-looking reserialization is insufficient. The terminal receipt retains only the new content-free identity capture bytes and typed original values, never full Home request args or layout bodies. Native source adapters and authenticated owner-value capture remain separate proof obligations.

### Retained original publication v1 admission and current relocation

This subsection preserves the original publication-v1 and original source-admission contract for retained Home1 and external Home2 reader values. It does not require Home3 to fabricate or reacquire those old controls: the Home3 full-value route below uses its own exact versioned metadata. Existing named hashes and original stored values remain unchanged.

The same new home_layout_operation_receipt value now retains original_append_receipt using the existing closed eleven-field synced AppendReceipt shape. original_publication is a NEW nonrecursive content-free Home custody capsule: schema_id pm.home_layout_original_publication.v1, actual storage_instance_id, event_id, sequence_id, original source_selection, source_value_sha256 of exact original EventRecord value bytes, frame_end_offset, original_append_receipt_sha256, terminal_transaction_id and terminal_at_utc. The receipt digest is SHA-256 of the exact canonical MessagePack AppendReceipt value; this new field changes no existing hash. Both fields are null for prepared/no-event terminal outcomes and required only for committed event settlement. The legacy four-field append_result remains an exact identity projection of this actual original receipt; source_durability_ref is a resolver hint, never sufficient proof.

At initial terminal admission, Storage resolves actual original source/control/frame custody through Case L-2. Validate the original event envelope and payload bytes, frame identity/bounds/CRC, original segment generation/name/offset, actual committed group ID and class, group persisted time, manifest generation/digest and synchronized durable watermark. The actual synced AppendReceipt must join that original frame and group, including sequence/event identity, durable_end_offset and acknowledged time. Its ordinary durability class follows this post-layout fact's existing binding. Verify frame sync before watermark sync before the terminal Home receipt/slot-release transaction. That transaction atomically captures the original typed receipt and capsule, authenticated SIR/dispatcher values and new content-free capture bytes. Store identity, receipt key, transaction ID/time and complete receipt byte hash must join the actual committed canonical receipt. A self-consistent supplied hash or typed object cannot authenticate this admission.

The existing indefinite mandatory-backup Home receipt owns that original committed custody. On subsequent reads, resolve its actual authenticated admitted canonical value and exact original fields; ordinary reads need not retain old CURRENT/manifest snapshots or open retired physical files. If the original admission was not captured/authenticated, missing original evidence remains unavailable and cannot be manufactured from the current index. The fixture explicitly separates initial birth_evidence from admitted_receipt_store; neither synthetic marker executes native authentication. Read without old control snapshots is tested only after validating the original synthetic admission and preserving its stored capsule.

Current EventRecord-index reads independently resolve the CURRENT-selected SP-278 full root/anchor/frontier/source/snapshot token and actual current frame. A lawful physical relocation preserves the original AppendReceipt, original publication capsule and original four-field result unchanged. Current frame coordinates may differ. Current exact EventRecord source value bytes, sequence, event ID and semantic/payload identity must match the original admitted event/capsule. Never rewrite original append coordinates to today's segment or compare an original receipt as though it were a current locator. Missing current translation proof follows SP-278 rebuild/current-survivor rules; this custody capsule grants no authority to open retired sources or extend source retention.

The paired-command, empty-history foreign-key refresh, arbitrary first-withdrawal mutation and slid already-withdrawn retirement probes are schema-valid relational refusals. A lawful current-source relocation preserving original receipt is a positive fixture. Initial source/publication mismatch probes repair dependent digest bytes so source/birth ownership remains independently checked. All native source codecs, CRC, group/manifest synchronization, redb transactions, permissions, source/receipt/owner authentication and backup remain NOT_RUN. No DEPTH_PASS or governance seal is claimed.

### Home3 original pending and full-value completion

Current writes use stable producer ID `home.workspace_layout_commit.v1`, slot and receipt schema version `3.0.0` and slot producer version `3.0.0`, with the same `.v1` physical keys and the exact closed twenty-field operation binding. `Plans/home_layout_pending_receipt.schema.json` owns the strict Home3 writer definitions. `Plans/home_layout_value_readers.schema.json` dispatches exact canonical Home1 readers from `Plans/home_layout_event_contracts.schema.json`, exact frozen external Home2 readers from `Plans/home_layout_pending_receipt_v2_reader.schema.json`, and current Home3 readers. The old operation result schema/ref, eleven-field AppendReceipt, four-field append result, source/hash recipes and old publication/capture definitions remain unchanged. External Home2 reader support is not evidence of deployed version-2 data or permission to enable writer 2. Existing Home1/Home2 terminal rows keep their exact original read contracts and are never rewritten into Home3 metadata. The unchanged Home1 filtered checkpoint and its history remain independently governed.

**Actual installation and activation.** Before new Home3 admission, install coordinated slot/receipt 3.0.0 family edges under the actual supported store graph and application ceiling; exact slot/receipt readers 1.0.0, 2.0.0 and 3.0.0; the Home pending resolver 3.0.0; and `owner.sir.home_layout_pending_custody@1.0.0`. Require SP-286/CV-339's actual strict shared receipt writer 2.0.0, retained exact shared readers, `storage.first_append_receipt.resolve_full_value.v1` and the approved four-entry legacy-selector map. A legacy selector or semantic-only reader cannot supply missing full-value authority. Protected coherent backup, target verification before stamp, read-only reopen, actual committed MigrationReceipt persistence/readback and journal completion precede the separate Home activation transaction and readback. Writers stay disabled until that actual binding is verified. The bounded fresh-install evidence supplies no production graph registration or conversion of a persisted pending Home1/Home2 operation: settle it through its own original authority or fence migration. The exact retained nonrecursive migration cores and current-plus-one-prior/7,776,000-second rules above remain unchanged.

Pin the actual activation owner handle, complete records, enabled state and revision before its installation reader and shared-activation helpers. Compare their returned values and the still-current actual owner to that original pin. Carry that same validated pin through actual SIR rebinding and complete fence/candidate capture; both the actual activation records and copied fence must equal it. A withdrawn resolver, changed nested migration record, replaced owner or changed revision between installation validation and capture cannot become a new accepted baseline. At each final Home publication, directly require the exact admitted readers, Home3 pending resolver, SIR binding and shared capability, as well as unchanged complete owner records. This requirement covers initial prepare, SIR advance, canonical write/readback, source publication/capture, Home-requested issuance, terminal settlement and retained response disclosure. No dependent reader, validator, rebinder or copy runs after the final pure owner predicate before its guarded publication.

**Original admission and temporary SIR custody.** Initial prepare authenticates actual original normalized Home request bytes, full original SIR identity/dispatch/outcome source, selected prior canonical bytes, current scoped command permission, target/domain identities and held Home lease. Independently pin the original request, binding, identity and clock before candidate copying, encoding or validation; derive the exact permitted digest overlays and initial input/source state from that original, never a returned candidate. Preserve the distinct Home request digest and original SIR payload digest. The original request arguments and expected revision, actor/correlation/causality, command/instance/idempotency, operation/topology/target/frame identities and actual complete existing receipt set must all join. No future result, fabricated EventRecord, copied authority marker or mutually repaired hashes establish original ingress. Preserve unrelated exact Home values and the existing unsupported event/semantic-number refusal before effects without narrowing source validity.

Two required nullable fields belong to the existing mutable slot only: `pending_sir_custody` and `pending_append_origin`. Empty requires both null; prepared/canonical-written phases forbid append-origin capture; every unresolved Home3 phase requires its genuine pending SIR capsule. `pm.home_layout_pending_sir_custody.v1@1.0.0` retains the exact Home-only binding, actual original Home admission transaction identity, original target-identity digest, immutable original and current nonterminal SIR sources and their separate digests. Before any canonical layout mutation, durable prepare admits that complete pending row and genuine original source. Actual SIR acknowledgement/executing progression is separately authenticated and durably captured; a preallocated event ref is neither acknowledgement nor completion.

SIR remains the sole source producer. Original normalized request/full owner topology, dispatch frame, target generation, actor/causal refs and request-byte/Home/SIR digest identities remain exact. Acknowledged/executing sources require a real acknowledgement receipt and actual current frame/offset: same-frame uses zero offset; a later available frame preserves its actual offset and false same-frame flag. Derive the complete expected acknowledgement from the original entry fence's actual frame, selected source, revision and clock before copying. Returned frame, working candidate, installed source and returned source must equal that independent expectation with exact types after all helpers. Original source never changes; current progression preserves existing acknowledgement and cannot regress phase or clocks. Home capture compares the actual selected SIR source, complete expected candidate and original owner facts before its slot transaction. Current identity, target, availability, installed binding, frame, clock and Home permission remain independent gates.

After lawful original ingress/source/stage/delegation disposal, explicit SIR rebind can reacquire only the same admitted Home3 operation from its actual canonical slot and original admission transaction. Its transient tuple binds the actual Home owner, exact slot key, operation digest, admission transaction and original source digest. Repeated resume preserves that owner identity; no copied owner, new request/acknowledgement, terminal result or fresh restored-operation capability is created. Actual current source and every returned projection must still match the selected owner facts. Private SIR terminal staging is authentic original outcome/response production, not durable success; the same terminal Home transaction captures those genuine values and their existing content-free bytes.

**Original append cuts and disjoint metadata.** Certified readback freezes the exact one candidate revision, canonical bytes/hash, actual write/readback refs, first settled time and complete producer semantics. The prepared typed result/dispatch receipt stays internal with pending event status. Before source publication, complete actual global/scoped identity absence and the shared prior-group gate must authorize the new ordinary-class append. Preserve original producer input and independently assigned Storage sequence/observed/persisted fields across source helpers and final returned copies; the returned event must equal the event actually published and the original expected value. There is no extra layout write/readback. Before first issuance, actual protected source/group custody remains necessary; missing receipt is never proof of no append or authority for rollback/duplicate emission.

`pending_append_origin` has two exact disjoint versions in the same temporary field. Before issuance, unchanged `pm.home_layout_pending_append_origin.v1@1.0.0` may capture the authentic original complete EventRecord, source selection/value hash, exact frame end/locator, actual group ID/digest, ordinary class and independent opaque segment ref, only while the original owner actually supplies them. Home's own first-issuance call requires that admitted original-source capture and the actual shared group/clock authority. After actual shared v2 issuance, `pm.home_layout_pending_full_value_origin.v1@1.0.0` contains exactly `schema_id`, `schema_version`, `capture_transaction_id`, `storage_instance_id` and `witness`. That witness is exactly the shared three-field full-value result: original eleven-field receipt, original opaque segment ref and original domain/version/codec-bound complete-event commitment. The witness branch retains no EventRecord, full layout or request body and creates no old source-selection hash, frame end, group opening/digest or old source-byte hash. Group durable end is not an event frame end; current relocated extent is not original extent.

Capture either variant in the actual existing slot transaction after independently deriving the complete expected metadata from actual owner sources. After issuance, independently authenticate the complete current SP-278 root/generation/anchor/frontier/index/source/snapshot token and exact current EventRecord; feed that actual full value to `storage.first_append_receipt.resolve_full_value.v1`. The returned event, token and complete three-field witness and every copy must equal actual current source/checkpoint state and the immutable canonical shared v2 custody projection. Source selection in a returned token must equal the actual current generation/frontier and snapshot revision, including nested fields; repeat the actual token join at pending capture and both initial/final terminal resolution. Typed equality preserves Boolean/integer/float/decimal distinctions. Semantic-only shared v1 replay is still supported under its own contract but cannot supply or backfill Home3 full-value proof.

New terminal Home3 receipts use `pm.home_layout_original_publication.v2@2.0.0` with exactly schema ID/version, Storage instance, original event ID/sequence, `original_event_value_commitment`, unchanged-algorithm `original_append_receipt_sha256`, terminal transaction ID and terminal time. No top-level receipt field is added. Keep the exact eleven fields in `original_append_receipt` and independent four-field opaque result in `append_result`; compare both to actual retained shared custody. The shared domain-bound canonical MessagePack commitment is a distinct named hash, never a relabeling of Home producer semantics or the old source-byte hash. Source-backed Home3 pending capture also completes through the explicit full-value resolver and this new terminal variant after v2 issuance. Current physical coordinates may relocate; original receipt coordinates/times and opaque ref remain historical. No old source/group/mapping/issuer controls are reacquired for retained-witness completion. Missing current original value or mandatory v2 witness refuses without original-value synthesis, semantic fallback or migration mapping.

**Complete final values and lawful effect conservation.** Independently derive every complete permitted Home postimage and transaction metadata/hash from pinned actual original ingress, selected prior bytes, admitted SIR source, prepared receipt, actual retained shared custody and current owner clock before dependent validators/copies. Final comparisons cover original expectation, working candidate, copied slot/receipts/layout bytes and transaction, actual canonical preimage/CAS and actual staged SIR values. Hold actual owner/domain exclusion through publication. The complete fence includes Home/SIR/receipt/shared/activation identities, raw layout bytes, slot/receipt/transaction state, permissions/target/deletion/writer/lease/clocks, SIR identity/frame/source/delegation, shared custody/gate/internal revision/history, full current SP-278 source/snapshot, restored intent and installed capabilities. Only independently completed expected shared effects may advance the corresponding append-state observation; no changed local authority becomes the original fence.

The terminal transaction captures the complete original result, event/receipt/publication, SIR outcome/response and content-free hashes, then empties the slot and clears both pending captures, prior/candidate layouts and their exact bytes atomically. It performs no second layout write or event append. Response disclosure has its own final current-owner/permission/activation fence after terminal commit. Pin the original response from the actual retained receipt before copying and compare returned output to that pin and the still-actual row after all helpers. A refused disclosure leaves a valid terminal receipt intact; authorized retry resolves the same originals. One model delivery count is not proof of native/network exactly-once delivery.

Independent source publication, direct Store first issuance and mandatory shared BackupVault settlement remain lawful real effects on the same actual owner, including when Home's pending capability is withdrawn. Home cannot veto another caller's authorized shared issuance/backup. Later Home permission, activation, target, owner, token or candidate refusal preserves those actual effects; it cannot discard a staged backend or roll back the shared store. After independent issuance before Home capture, lawful retirement of original append and SIR controls, current-source relocation and explicit same-operation resume can capture the retained witness and finish/replay once. A fresh authorized retry preserves the original event, receipt, clocks, coordinates and response without another command, layout revision, append or acknowledgement. All three cuts remain explicit: certified readback before source, published protected source before first receipt, and issued receipt before Home terminal settlement.

Coherent Home backup captures the exact slot/receipt/layout boundary with actual shared settled custody and compares complete copied candidates to actual sources. Restore authenticates the selected artifact and complete candidate before copies/validation, then rechecks them before the explicitly authorized root replacement; it is never a rollback mechanism for a rejected Home mutation. Original SIR raw ingress is not recreated as fresh admission. Old pending work restored from a boundary predating its event has no fresh append/first-issuance capability and remains recovery-required. An authentically retained issued receipt and admitted pending custody can settle the same original operation without reminting. Pending captures keep their existing unresolved lifetime; terminal metadata follows the unchanged Home receipt policy. No new family, hold kind, indefinite layout/request body history, reader generation or retention rule follows.

The bounded executed Home3 route is one original cross-host move/succeeded continuation plus the specified pending, full-value and compatibility regressions. Other applicable command/failure/rollback paths retain their existing obligations. Exact original-source authentication, native wire/CRC/fsync, held leases/concurrency, actual redb crash transactions, production migration/backup/hold enumeration and UI delivery remain `NOT_RUN`; normative shared wire adoption and static/model passes establish no native operation, complete event depth, readiness, WorkNode or governance seal.

### Slot migration-generation custody and activation

The existing `home_layout_transaction_slot` family remains `json_canonical` at the same exact key. Its first-native v1 schema remains an exact retained reader; current Home3 writes use the explicit 3.0.0 slot/receipt admission above. Required `migration_generation` and nullable `prior_migration_generation` close its RP-CONFIG-CURRENT mapping. The original first-native migration layout remains the retained contract. Historical packet labels do not establish deployed predecessor data; in particular the Home2 schema is frozen external compatibility lineage, not a deployed writer. Current plus at most one complete nonrecursive prior migration core is two generations. The ordinary `slot_generation` CAS counter is separate from migration identity.

Current migration binding uses generation_id `home-migration:{migration_id}` within the exact logical slot and records actual migration ID/completed_at_utc, exact `migration_receipt.v1:{migration_id}` key and canonical MigrationReceipt-byte SHA-256, backup ref and actual selected store/family transition tuples. Initial `installation_receipt_ref` stays the first actual installation receipt. Initial adoption publishes an empty slot with zero operation generation and null last terminal operation only after that actual installation migration completes; independently proved absence at the protected backup key is required. Absence after admitted installation remains loss and cannot cause initialization.

The single prior wrapper carries the complete exact final old core, excluding only its own prior_migration_generation, independently encoded core bytes/hash, logical key/storage instance, exact successor generation and migration identity/completion/receipt key/hash, protected backup ref, backup entry key and SHA-256 of the exact old FULL canonical slot value in that backup. That full backup input decodes to the independently selected before-slot; removing only its prior wrapper produces the archived core. No prior wrapper can recursively retain earlier generations. Scope, installation identity, predecessor/successor identity and birth/update/completion chronology all join. Ordinary operation preparation, readback, rollback and settlement preserve both migration fields byte-for-byte, while ordinary CAS advances and resolved temporary layouts and original bytes clear. No operation starts or resets a migration clock.

Migration publication does not require a future receipt hash or create a receipt/target-row digest cycle. The sole StorageMigrationCoordinator retains its aggregate lock and maintenance lease, and Home producer activation remains disabled. Before taking the actual shared backup boundary it settles a pending Home operation through its existing protocol or remains fenced. Capacity cleanup, when eligible, occurs under existing maintenance ordering before the new migration backup; no third protected generation is admitted. Coordinator preflight binds the actual registered store graph/application ceiling and exact family edge; no production version integers are allocated here. The registered migration edge must preserve a valid inactive pre-activation slot or actual initial absence through target schema verification. The retained first-native synthetic store edges keep slot family 1.0.0 after initial adoption and demonstrate that old inactive-core relation only. Current Home3 requires coordinated slot and receipt 3.0.0 edges with the exact installed readers/resolver and separate activation above. Neither fixture supplies a production edge or a conversion for unresolved Home1/Home2 work; an incompatible target requires its own supported conversion and cannot skip target verification.

Required sequence remains verified protected backup, all target rows verified, store stamp last, close/reopen without product writers, actual terminal MigrationReceipt persisted and read back, journal committed. During that sequence an existing slot remains its old generation value, schema-valid but not activated for the new producer; first installation has not yet created a per-scope slot. Then a separate idempotent owner activation transaction under the same exclusion compares exact selected old slot bytes/CAS or proved first absence, joins the actual committed receipt and protected backup entry, and atomically publishes the new current migration binding plus complete prior core. Its transaction identity is distinct from the receipt transaction; it is an after-migration owner publication, not an extra pre-stamp migration step. It does not rewrite the terminal receipt, include its own hash in that receipt, or guess completed_at_utc. Only after activation readback verifies the canonical slot may Home mutations enable. Initial absence/old slot on a crash between receipt and activation resumes only that actual committed activation; an already published exact generation returns the existing binding without rearchiving or changing clocks. Failed/blocked/rolled-back migration cannot publish. The existing restore path restores and validates the same receipt/backup/generation closure without minting a new migration merely because recovery ran.

Source audit: storage-plan.md `Migration coordinator and state machine` requires exact registered edge preflight and ordered steps 1–7, notably target-row validation before stamp and terminal receipt roundtrip after read-only reopen. Its `verified` paragraph retains backup protection until receipt roundtrip and later compatible snapshot. The explicit post-receipt Home activation transaction is a NEW bounded owner integration between committed migration and Home admission; it neither claims an already registered production edge nor changes the coordinator phase order. Native actual graph registration and lock-lifetime/activation execution are NOT_RUN. The selected edge must demonstrate compatible inactive pre-activation target schema and this owner gate before native admission is enabled.

The new `home_slot_migration_core_utf8_json.v1` codec is an independent serialization of the nonrecursive resolved core, not captured original owner wire bytes or RFC8785/JCS. Encode valid Unicode scalar strings as UTF-8 without normalization or unnecessary ASCII escapes; JSON escaping is quote/backslash and control U+0000–001F (`\b`, `\t`, `\n`, `\f`, `\r` for those five and lowercase `\u00xx` for others). Sort object keys by Unicode scalar value, emit compact commas/colons and no whitespace/BOM/trailing newline. Null and booleans use JSON literals; integers use exact minimal base-10 decimal without rounding or a leading plus (zero is `0`); preserve array order. Floats/decimal bodies are not a migration-core input: the archived core must be an empty resolved operation and contains no layout bodies. This does not restrict canonical Home layout/source numeric values or their encoding. SHA-256 is over these new bytes. The original full canonical slot backup value remains its actual original owner bytes and is joined separately; decode equality cannot replace that exact-byte backup/CAS join. Static original before/after JSON bytes and MigrationReceipt MessagePack bytes are synthetic adapter captures, not execution of native owner codecs.

A prior generation becomes age-eligible only at its actual SUCCESSOR migration completed_at_utc + 7776000 seconds, inclusively, with all actual applicable hold/live-reference/source/restore eligibility cleared under serialized maintenance and hold admission. A cleanup transaction removes only prior_migration_generation and preserves the complete current core/binding exactly. An ineligible prior blocks replacement. Removing this inline prior does not authorize deleting the protected backup, journal or indefinite MigrationReceipt; their independent stronger retention and successor-backup rules remain. No catalog value, hold kind, physical family or policy changes.

Static evidence independently types the actual MigrationReceipt, actual store key/hash/transaction, exact protected backup entry key/storage/value bytes, before/pre-activation/after slot values, actual selected graph tuples and ordered activation evidence. Actual native receipt/backup authenticity, canonical codecs, registered production graph, transaction/lock durability, crash recovery and complete hold/ref enumeration remain NOT_RUN. Fixtures do not turn self-consistent supplied hashes or authority markers into those proofs.

The exact native and static validation boundaries, frozen synthetic source/owner adapters, and corrected proposal lineage are pinned by reports/event-authority-20260911/step-08-home-validation.md. Physical writes require the actual supported StorageMigrationCoordinator graph and owner activation; the fixtures do not install it.

```yaml
plan_unit_id: SP-273
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The existing workspace.layout_changed 1.1.0 family consumes F3-515/CV-323 settled Home
  behavior through the newly defined scoped Home command transaction and content-free result/receipt custody.
  SP-245 canonical layout readback precedes event admission; actual event durability precedes terminal
  receipt/slot release and successful publication. Exact source/receipt/current-layout/checkpoint joins
  are read-only and cannot replay Home or domain effects. The detailed Workspace layout changed producer,
  custody and read contract supplies the normative transition, retention-class mapping, compatibility
  and withdrawal rules. The current binding captures authentic original SIR outcome/request and CV-333
  response in the same Home receipt, uses separately defined content-free capture-byte custody, and adopts
  canonical SP-278 full root/generation/frontier currentness. Its same row materializes stable generation
  birth plus at most two complete nonrecursive retired reader cores with exact atomic successor and existing
  retention. The distinct canonical slot stores current plus one nonrecursive prior migration core, actual
  successor migration completion anchor and exact receipt/backup/key custody; post-receipt owner activation
  precedes Home producer enable. Current Home3 writes require explicit 3.0.0 slot/receipt and original
  pending SIR admission, exact retained shared v2 full-value custody and independently authenticated current
  SP-278 event/token. Complete original activation/source/value pins survive dependent helpers through final
  Home publication and disclosure; lawful shared effects survive local refusal. Exact Home1 and frozen
  external Home2 readers remain separate, with no pending conversion or deployment inference.
gui_related: true
gui_classification_reason: Layout mutation, rollback, currentness and receipt publication govern visible
  Home placement and recovery.
depends_on:
- SP-245
- F3-515
- CV-323
- UCC-144
- UCC-147
- ATS-040
- CV-333
- DL-045
- SP-278
- SIR-046
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- Preserve exact registered family/payload version, project scope, enums and retention objects; no admission
  or alias.
- Verify installed operation custody, authenticated request/revision, exact candidate readback, original
  event frame/watermark and terminal release before publishing success.
- Preserve uncertain append/rollback state and prior bytes; never fabricate a failed rolled-back result
  while a success event may exist.
- Validate command/event identity joins, exact changed surfaces, actual result/receipt refs, current selected-layout/slot
  and read-checkpoint fences.
- Keep indefinite content-free receipt metadata separate from existing configuration history and temporary
  pending snapshots.
- Keep compatibility/replay read-only and settle or fence pending obligations before withdrawal/successor
  activation.
- Preserve exact original shared schemas and existing semantic hash algorithms; reject unsupported numeric
  event admission before effects without narrowing Home source validity.
- Validate actual original request args, actor/causal scope, Storage instance, full generic token, complete
  global source range and current-only publication.
- Refresh at cap preserves history; replacement archives final core once; chronology, seven-day cleanup,
  holds and terminal withdrawal are exact.
- Slot migration keeps current plus one protected prior core, preserves actual successor receipt completion
  across ordinary operations, blocks a third protected generation, and removes only eligible prior after
  7776000 seconds and actual holds/refs.
- Verify existing coordinator stamp-last/read-only-reopen/terminal-receipt order before separate gated
  owner activation; no future receipt hash, receipt-target cycle or invented production graph.
- Require explicit installed Home3 writer/readers/pending resolver, original SIR binding and shared v2/full-value capability before dependent operations; preserve the original activation handle/records/revision through rebinding and final publication.
- Derive actual original ingress and acknowledgement values before copying; preserve complete admitted pending SIR identity, real frame/acknowledgement and same-owner repeated resume.
- Use exact disjoint raw-origin or retained-witness pending metadata and original-publication v2; never manufacture old source hashes, frame end or group opening from current data.
- Join the complete current EventRecord and token to actual SP-278 source/checkpoint state and exact shared v2 witness at capture, terminal staging/finalization and replay; no v1 semantic fallback or backfill.
- Compare independently derived full postimage/transaction/output values after final helpers, preserving actual canonical and owner fences before every dependent publication.
- Preserve lawful independent source/direct-issue/backup effects on Home refusal; retry completes the same original event/receipt/response without repeating the layout operation.
- Preserve exact Home1 and external Home2 readers, unchanged physical keys/lifetimes/checkpoint history and original hash meanings; unresolved old pending work settles under original authority or fences migration.
validation_surfaces:
- Plans/home_layout_event_contracts.schema.json
- Plans/home_layout_pending_receipt.schema.json
- Plans/home_layout_pending_receipt_v2_reader.schema.json
- Plans/home_layout_value_readers.schema.json
- Plans/home_layout_full_value_contract_fixtures.json
- Plans/event_payloads/workspace_layout_changed.schema.json
- Plans/home_workspace_layout.schema.json
- Plans/home_layout_event_contract_fixtures.json
- reports/event-authority-20260911/step-08-home-validation.md
- reports/event-authority-20260911/step-08-home-full-value-validation.md
- reports/event-authority-20260911/step-08-home-full-value-checks.json
risk_class: home_layout_readback_event_receipt_crash_or_replay_authority_escape
reasoning_tier: high
context_scope: workspace_layout_changed_only
implementation_surfaces:
- Plans/storage-plan.md
- Plans/home_layout_event_contracts.schema.json
- Plans/storage_value_registry.json
- Plans/home_layout_pending_receipt.schema.json
- Plans/home_layout_value_readers.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/FinalGUISpec.md#F3-515
- Plans/Contracts_V0.md#CV-323
- Plans/storage-plan.md#SP-245
- Plans/Decision_Log.md#DL-045
negative_constraints:
- No event admission, sibling terminal/panel closure, retention value change, runtime claim, global accounting
  change, readiness or seal.
```

ContractRef: ContractName:Plans/storage-plan.md#SP-273, ContractName:Plans/Shared_Integration_Runtime.md#SIR-046, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/FinalGUISpec.md#F3-515, ContractName:Plans/Contracts_V0.md#CV-323, ContractName:Plans/Decision_Log.md#DL-045
