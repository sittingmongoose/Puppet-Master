# Shard 058: Browser workspace-reset filtered checkpoint — 2026-09-11

Source: `Plans/storage-plan.md`

Source lines: L20668-L21091

Source SHA256: `809b4dbabe4adc927a029ef7b9c76e80cf359dd6036bfaf968e413eefd1a4808`

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
- DL-045
unblocks: []
acceptance_criteria:
- Only a proved native post-adoption original creates one nonrecursive source-first metadata obligation.
- Exact deterministic metadata mapping preserves existing source, payload and producer digest recipes
  and separately enforces native replay admission.
- Actual source and metadata durability precede canonical contiguous-prefix commit, which precedes disposable
  progress.
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
