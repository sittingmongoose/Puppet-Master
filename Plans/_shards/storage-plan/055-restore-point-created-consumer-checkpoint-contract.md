# Shard 055: Restore-point created consumer checkpoint contract

Source: `Plans/storage-plan.md`

Source lines: L19644-L19808

Source SHA256: `809b4dbabe4adc927a029ef7b9c76e80cf359dd6036bfaf968e413eefd1a4808`

---

## Restore-point created consumer checkpoint contract

This addendum defines the previously missing restore-created bindings under `DL-045` for already specified behavior. These are new owner definitions, not claims that the identifiers pre-existed. The existing `event-family-restore-point-created@2.0.0`, `restore_point.created`, project-only scope, EventRecord `pm.event.v0@2.0.0`, inline payload `https://puppetmaster.local/schemas/event_payloads/restore_point_created/1.0.0` and source policy `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0` remain unchanged. This is a static contract; native runtime, crash, GUI and durable-storage behavior remain unproven. No sibling event is admitted.

Storage newly owns `projector.chat.restore_point_created@1.0.0`. The exact consumers are Chat ACD-465 and Runtime Artifacts RAP-059; FileSafe has no conversation-created consumer. The source search found existing generic checkpoint mechanics and canonical `rp:` custody, but no exact versioned restore-created projector/checkpoint binding. Runtime Artifacts storage is deferred; event-dedupe and shared-runtime checkpoints have other authority. None supplies this new binding.

The logical read projection has no per-record projection key. The canonical creation companion described below is separate required producer custody. It joins the existing `rp:` canonical record with verified existing `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` rows and the following one new physical checkpoint family. Event-index ownership stays with the existing EventRecord lookup writer; this projector may verify its durable result but cannot replace it or write a second event index. Querying the existing source/index range for created events is allowed; this contract promises no new index performance characteristic.

Checkpoint key: `projector.checkpoint.restore_point_created.v1:{scope_partition}`. `scope_partition` is exactly `project~` plus unpadded base64url of UTF-8 `project_id`, using the existing Storage §2.2.5 encoding. No application checkpoint is admitted. Family: `restore_point_created_checkpoint`; value ID `pm.storage_value.restore_point_created_checkpoint.v1`, version 1.0.0. The inline closed `restore_point_created_checkpoint` value schema in `Plans/storage_value_registry.json` closes every value and nested cursor field. The value also binds the actual storage_instance_id, verified full_index_checkpoint_ref, current selected index generation digest and published_at_utc. All required fields are present; no optional/null fields or local paths exist. Integer generation/epoch/offset/sequence fields are nonnegative, hashes lowercase 64-hex. The storage key's project partition must byte-equal the encoding of the value's project ID. Binding IDs and versions are constants.

The cursor's `byte_offset` denotes the beginning of the verified source record identified by `last_sequence_id,last_event_id`; resume validates that record and starts immediately after its length-checked end. Segment name, segment generation, manifest generation, recovery epoch, survivor prefix digest and projector schema version must all resolve against the current Storage manifest/recovery authority. A schema-valid but unprovable cursor is unusable. Missing checkpoint is the uninitialized state, not a fabricated zero cursor. The first checkpoint is written only after at least one complete validated source record.

The `restore_point_created_checkpoint` physical row in `Plans/storage_value_registry.json` supplies **all required physical registry metadata**, inline closed value schema, existing policy reference, source-family recovery binding, migration/restore dispositions, encoding and exact owner references. Storage §2.3.1 requires that row be materialized in `Plans/storage_value_registry.json` in the same canonical transaction as this key definition. Until then no code may persist the key. The second required physical family described below must also be registered before creation depends on it; neither family is silently added to critical/MVP arrays. Existing Runtime Artifacts storage family is deferred and cannot supply it; event-dedupe and shared-runtime checkpoints have different authority and cannot be borrowed. This definition changes no event-registry membership. The physical family needs normal StorageMigrationCoordinator introduction against the actual store graph/version ceilings; this contract allocates no store integer or production write authority. The unchanged full Storage admission validators remain required; a row-shape check alone does not establish readiness.

### Required native creation custody

`restore_point_creation_commit@1.0.0` is a materialized redb canonical family at `restore_point_creation_commit.v1:{project_id}:{restore_point_id}`, with value ID `pm.storage_value.restore_point_creation_commit.v1` and the complete inline closed schema in `Plans/storage_value_registry.json`. Its sole purpose is required original restore-point creation custody and completion verification. It is `canonical_non_rebuildable`, requires mandatory backup together with its canonical point and cannot be regenerated from merged `context_provenance_refs`, the EventRecord alone, a UI projection or an artifact. Its frozen command/input and pending/committed/receipt field conditions, three-barrier producer protocol, native completion predicate and separately valid historical reader are owned by Chat ACD-465.

Commit the immutable `rp` and complete pending companion in one redb transaction; append seglog only from that frozen input; after proof of a matching synced source event, CAS the companion to committed in another redb transaction. Do not assert cross-store atomicity. Original capture, category-separated refs, command identity and all producer envelope values are preserved; only `sequence_id` and `persisted_at_utc` come from the append writer. A stored commit marker is an accelerator, never independent durable-event authority. Owner reconciliation, not event replay, finishes a pending marker after source/dedupe verification.

`restore_disposition.mutation_fence_on_unresolved=true` applies only to canonical operations dependent on the unresolved native `project_id,restore_point_id`, including branch, lifecycle mutation and release of required custody. Read-only diagnostics/owner recovery and unrelated records remain unaffected. Historical points satisfying ACD-465's complete supported pre-introduction read predicate are not unresolved merely because no new companion exists. There is no project-wide FileSafe/runtime fence or automatic filesystem restore.

### Consumption, atomic checkpoint and currentness

Read in canonical segment/offset/sequence order through the current verified survivor range. Validate EventRecord 2.0, exact payload schema, project identity, registered policy, secret posture, record/source joins and event-index lookup bytes before certifying a restore-created observation. Generic valid nonmatching records may advance traversal after envelope/registry validation without restore-specific effects. Unknown/malformed records quarantine without crossing them; valid future versions halt as unsupported and are not recast as corruption. Timestamps never order processing.

Within one redb write transaction/snapshot, verify the existing event-index row and exactly one supported branch: present native point plus full native completion proof; present historical point plus the full historical completion predicate; or the independent complete lawful terminal-retention traversal predicate below. Branch C does not require lawfully purged rp/companion bytes. Commit the projector checkpoint only after the selected branch and all shared current-generation/source checks pass. The logical view is computed from that same committed snapshot and selected proof; branch C yields only terminal/summary unavailability, never live creation completion or an action. Verify the existing full-index CURRENT selection, publication_locator and resolved full-index checkpoint, source_locator frame bounds/CRC/event/payload digest and same-generation coverage. Any changed selected index digest, source manifest/epoch or missing complete range aborts publication. This consumer cannot advance the globally owned index checkpoint or infer it from its own cursor. Its only owned durable write is this checkpoint, so there are no partially published projection rows. Missing/stale index durability, failed CAS against predecessor checkpoint, unresolved retention proof, or transaction failure leaves the checkpoint unchanged. Cursor advancement cannot race source generation/recovery changes; revalidate the Storage manifest/epoch authority under its maintenance exclusion before commit. UI notification timing is not durability.

The checkpoint certifies **source traversal**, not live restore-point availability. Reader lookup uses the current canonical record and owner permission/source-visibility/hold state in that snapshot. Action dispatch re-runs current Chat preflight. Creation replay never writes `status=available` back, consumes a record, branches a thread, touches source files/Git/worktree/queues, clears holds, charges Usage, notifies, dispatches or emits any EventRecord. Replay after expired/deleted/corrupt retains the canonical unavailable state. A source-thread deletion stays hidden; branching remains governed by Chat’s immutable conversation restore-point lifecycle, including `source_deleted_content_unavailable` when retained bytes are insufficient. Historical creation visibility must not revive deleted source visibility.

Repeated source identity/digest is a no-op except safe cursor traversal; conflicting content quarantines and preserves the prior checkpoint. After crash before checkpoint commit, replay revalidates the same join and commits once. Checkpoint/schema rebuild may clear only this derived checkpoint. Missing canonical `rp:` bytes without complete lawful terminal-retention removal proof require the existing mandatory-backup recovery; neither a created event nor artifact projection can rebuild that non-rebuildable value. Missing referenced material is unavailable, not automatically corrupt. Backup/remote/root ownership follows the existing Storage and Backup contracts; no raw local machine path or silent local fallback is introduced.

### Retention, compatibility and withdrawal

The checkpoint is directly assigned **`RP-PROJECTION-3GEN@1.0.0`**, not the source restore-point policy. The existing machine policy is `current_plus_history`, anchor `terminal_transition`, TTL 604800 seconds, maximum 3 generations per logical key, hold-eligible, overflow `rebuild_projection`, expiry `rebuild`. Storage's committed actual projection-generation transition is its terminal history transition recorded in retired_generations[].retired_at_utc; ordinary cursor updates do not retire a generation; `published_at_utc` records publication but does not pretend to prove a source-record release. Current publication and eligible prior generations follow that existing policy and the exact embedded retired_generations/retired_at_utc structure below. Eviction rebuilds only derived traversal/currentness. Source EventRecord and canonical `rp` keep the unchanged 90-day-after-release policy independently.

The companion is directly assigned **`RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0` as required custody of the same restore_point_id**, with its actual TTL/cap/eligibility, not a mislabeled source-coupled checkpoint. Chat’s creation contract defines a point as one inclusive captured boundary; Chat’s retention contract gives the 2,048/project cap and required source-lineage/in-flight/backup/rollback/recovery/maintenance hold overrides. The canonical record registry binds the same identity, policy and required custody. Exactly one companion joins exactly one `rp` and cannot exist as a second independently user-created point. Thus logical-point count is `count(distinct canonical project_id,restore_point_id)`, never rp-plus-companion row count. A point over count pressure remains subject to the same oldest-eligible selection; the companion cannot create a second eligibility pool or independently remove a still-required capture.

Resolve companion `reference_release`, all holds and eligibility from that exact canonical point's durable owner release evidence. TTL is inclusively 7,776,000 seconds after that release; no companion creation/commit timestamp supplies it. Pending uses only existing in-flight/required-source-lineage obligations. Completion releases only the proved creation in-flight claim; it cannot clear any other source/descendant/application/legal/preserve/backup/recovery hold. Required capture and canonical record are included together in mandatory backup and restore custody. Missing companion cannot be reconstructed from merged rp refs or an artifact. Owner-authorized point expiry/delete applies the same eligible custody disposition and required hash-summary preservation; no pending/held point is purged, no new permanent hold or 365-day delivery retention is imposed. The capture stores only data already required for the created event and its creation identity, not an extra feature history.

Checkpoint translation/rebuild still needs verified retained source/survivor evidence. If source ranges were lawfully removed, owner retention successor proof is required; absence alone cannot certify a gap. Event-record identity indexes keep their separate app-root-lifetime policy. Read predicates never use an evicted checkpoint/companion to revive expired or deleted source content.

The registry admits no event aliases/extensions. Registered envelope-v1 compatibility is read-only normalization into `projector_replay_only`; it may update only the owned disposable checkpoint and existing permitted projections, never append or mutate canonical records. The `record.v1` storage alias remains coordinator-only; ordinary writers do not rewrite on read. An unsupported future envelope, payload, value, reader, projector or checkpoint version halts affected coverage and preserves the last supported checkpoint/source bytes.

Withdrawing or replacing this consumer binding requires an owner-reviewed versioned successor and verified source-range/currentness handoff before publishing successor coverage. It does not remove event membership or make old records unknown, rewrite historical payloads, clear holds, alter retention, or permit new writes with old IDs. Until a supported successor is available, affected projection currentness is unavailable and canonical owner routes remain subject to their existing preflight. A stored checkpoint cannot self-upgrade by substituting a version string. This contract does not withdraw an event family.


ContractRef: ContractName:Plans/assistant-chat-design.md#restore-point-created-native-and-historical-consumers, ContractName:Plans/storage_value_registry.json, ContractName:Plans/event_family_registry.json, ContractName:Plans/Contracts_V0.md, DecisionID:DL-045

### Lawful terminal-retention traversal

Creation completion and terminal-retention traversal are separate predicates. For an indexed surviving created event, classify exactly one supported read branch: (A) a present native point with complete required native creation proof; (B) a present supported historical point with its complete historical completion proof; or (C) an owner-proven **already completed terminal retention disposition** for this exact project/restore identity and original capture hash. Branch C is not a relaxed version of A or B and does not require a purged native companion, original command request or removed `rp` bytes.

Branch C must join the surviving event's project, restore ID, canonical record ref and original hash to the durable owner-authorized terminal disposition and retained required hash summary; prove the exact point's owner-defined reference release, all required hold/ref release evidence, and the applicable existing age/count/deletion authorization; and verify committed deletion/retention/successor-generation custody for the bytes actually removed. Native custody may be absent only where that same durable disposition explicitly covers its lawful removal. Verify the current source/index manifest, survivor prefix and permitted range coverage exactly as for ordinary traversal. No terminal state inferred from missing rows, elapsed wall time, event time, a deleted source thread, UI status or an unverified summary is proof. `corrupt` alone is not a removal authorization. A lifecycle event by itself is not proof of completed purge. Storage SP-269 now defines the exact new canonical restore_point_retention_summary family and atomic retirement result supplying these embedded proofs. Branch C must resolve and validate that physical value; generic storage_deletion_record, an unresolved manifest pointer or a self-issued summary is not a substitute.

Branch C may advance only this derived traversal checkpoint and expose read-only terminal/summary availability with the owner reason. It never publishes completed native creation, actionable availability, success for a retried create command, target creation, a recreated `rp`/companion, source visibility, a new EventRecord, deletion dispatch or cleared holds. Missing canonical custody without this complete lawful-removal proof remains unexplained loss: preserve the prior checkpoint and apply the existing affected-record recovery fence. Do not route a missing/corrupt native companion through historical mode or branch C. A proven terminal-disposition read does not resurrect bytes for the purpose of satisfying a creation predicate.

### Concrete checkpoint generation history

The newly registered checkpoint value requires `publication_id`, `hold_refs`, and `retired_generations` in addition to its current identity/cursor/publication fields. Here `publication_id` is the stable **projection-generation** identity, and `published_at_utc` is that generation's first verified publication time. The exact generation discriminator is `(storage_instance_id, scope_partition, consumer_id, consumer_version, projector_id, projector_version, cursor.projector_schema_version, publication_id)`. Source segment rotation, source/index cursor advancement, updated full-index checkpoint/selection and a new event do not by themselves change this discriminator. No timestamp, filename or event sequence allocates a new generation.

Ordinary traversal performs a CAS update to the same current generation's cursor and verified source/index fields, revalidating every current source/index/survivor proof and predecessor checkpoint. It preserves `publication_id`, `published_at_utc` and every retired generation/anchor. It does not archive the previous cursor position or consume a retention-generation slot. No per-cursor timestamp is needed for this contract. Source recovery/translation may continue this same generation only when the existing owner source-range/currentness proof remains valid; otherwise the projector must take the separately verified rebuild path, never copy a stale cursor into CURRENT.

Only first initialization, an explicit verified projection rebuild, or an owner-reviewed supported schema/binding successor establishes a new projection generation. Repeated retry of the same unpublished generation transition reuses its selected identity; it does not slide a retirement anchor. A transition cannot publish until the new full source coverage/currentness proof succeeds. On that real generation transition, one redb transaction writes the new current core, archives the previous current core, and sets that archived entry's `retired_at_utc` exactly to the new generation's `published_at_utc`, with `successor_publication_id` exactly the new generation ID. The archived core contains the final cursor of its old generation. Retained older entries preserve their original retirement facts. The terminal-transition TTL anchor is the explicitly persisted retirement time, never the old generation's birth time or an inferred timestamp. The new publication time must be valid and cannot predate the archived core's birth; a clock/authority inconsistency fails publication rather than rewriting history.

`retired_generations` contains zero to two entries, each a complete closed prior checkpoint core **without** recursive history, its required `retired_at_utc`, and `successor_publication_id`. One current plus at most two prior generations is the existing three-generation cap. No secondary history key or unspecified metadata supplies retention facts.

Each archived core retains the exact old storage/project/consumer/projector identity, cursor, selected-index reference/digest, original publication ID/time and owned hold refs. All project/scope/storage identities match this logical key; publication IDs are distinct and a generation cannot retire into itself. Completed generation transition records the timestamp and successor relation atomically, so no archived generation has an unknown terminal anchor. The exact existing registry policy is `RP-PROJECTION-3GEN@1.0.0`: `current_plus_history`, `terminal_transition`, TTL `604800`, `max_cardinality=3`, `cardinality_scope=logical_key`, `overflow_action=rebuild_projection`, `hold_eligible=true`, `expiry_action=rebuild`. History expiry checks the persisted retirement anchor and owner hold state. Overflow invokes that existing rebuild disposition; these fields are not new permission for early eviction, dropping a held generation, or bypassing the stated retirement window. If the owner cannot establish a policy-permitted generation slot, preserve the last committed checkpoint and disclose affected currentness as unavailable until a lawful rebuild/publication is possible. Ordinary cursor advances do not need new slots and continue after fresh proof. Rebuild never fabricates retirement times.

Archived cursors are retention/history data only. None certifies currentness or becomes a fallback CURRENT selection. The current core must independently validate against the current source/index generation and survivor authority. Moving an old core into the current position without a fresh verified publication is rejected even if its schema and earlier retirement facts are valid. No old generation can authorize a point action.

### Concrete typed terminal-summary result

The third result is `kind = terminal_retention_summary`, backed by the exact registered `restore_point_retention_summary` family and Storage SP-269 atomic retirement contract. Its `summary_ref` resolves to `restore_point_retention_summary.v1:{scope_partition}:{restore_point_id}`; project/point/ref/original-hash and the surviving created event's ID/schema/payload/frame/semantic digests match the embedded summary facts. Required native creation custody is explicitly present in the summary's retired-key set. The summary is independently canonical atomic retirement authority, so this branch does not first require a present `rp`, a removed native companion, a removed original request or the present-point historical completion predicate.

Only `reader.chat.restore_point_history` and `reader.runtime_artifacts.restore_point_record` consume this third result for passive terminal/hash-summary inspection. It carries the actual terminal status and no action authority. `reader.chat.branch_from_restore` accepts only a present point satisfying native or supported historical creation completion plus its full fresh Chat preflight; it never accepts the summary result. Missing/unproven summary authority keeps unexplained-loss recovery/fencing and does not produce a terminal result. The common typed result contract distinguishes `native_completion`, `historical_completion`, and `terminal_retention_summary`; they are not interchangeable truthy success values.

### SP-281 — Restore-point created custody and checkpoint

**Versioned successor qualification.** The surrounding predecessor v1 consumer/projector/checkpoint definition and original stored digest meanings remain compatibility-only. Current v2 uses `pm.storage_value.restore_point_created_checkpoint.v2@2.0.0`, the existing consumer/projector IDs at2.0.0 and cursor projector_schema_version2.0.0 under the explicit SP-265/SP-281 successor contract. All named dependent reader successors are at2.0.0. Its actual supported successor transition archives exact old cores under the existing three-generation/hold rules, after complete source-range/currentness handoff; no version-string substitution upgrades an old value. Original native append evidence is separately typed/authenticated and may predate the current generic index anchor. See `Plans/event_index_consumer_adoption.schema.json#/$defs/restore_created_checkpoint_v2`.

```yaml
plan_unit_id: SP-281
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage selects pm.storage_value.restore_point_created_checkpoint.v2@2.0.0 at the existing
  projector.checkpoint.restore_point_created.v1:{scope_partition} key. The same consumer/projector IDs
  at 2.0.0 and explicitly adopted history, branch-preflight and Runtime Artifacts reader successors consume
  the complete SP-278 source/index token after actual owner-admitted full rebuild. Original v1 values
  and digest meanings remain compatibility-only, with exact nonrecursive v1/v2 retired cores under the
  unchanged RP-PROJECTION-3GEN policy. Current native completion separately authenticates the original
  creation publication/receipt and canonical record/companion transaction, which may predate the current
  generic index generation. A matching current index anchor cannot replace original custody. Existing
  native, supported historical and terminal-summary predicates, original capture/command hash recipes,
  source release/hold/cap policy, mandatory-backup recovery and passive consumer limits remain unchanged.
  No sibling checkpoint or deferred family is borrowed.
gui_related: false
gui_classification_reason: This unit defines canonical custody, storage schemas and checkpoint mechanics.
split_recommended: false
depends_on:
- SP-269
- SP-242
- CV-320
- DL-045
- SP-278
unblocks: []
acceptance_criteria:
- Closed embedded prior generations carry exact atomically recorded retired_at_utc and successor publication
  identity; stale history never certifies currentness.
- Typed terminal-summary traversal resolves the physical SP-269 value and its exact retired native custody
  set without requiring removed rp/companion bytes.
- A complete lawful terminal-retention disposition independently permits passive traversal after covered
  point and companion removal; unexplained loss never selects this branch.
- Both physical rows include exact closed schemas, key/value joins, migration/recovery/retention metadata
  before use.
- Checkpoint currentness proves full-index selection, source durability, contiguous source coverage and
  atomic snapshot publication.
- Checkpoint projection policy differs explicitly from unchanged per-point source/custody retention; no
  new timer or hold authority is inferred.
- Missing native custody imposes an affected-record fence; verified supported historical completion does
  not require a fabricated companion.
- The unchanged implementation-readiness physical-family count check may remain failing; no validator
  edit or count override is permitted.
- Current v2 selection binds complete SP-278 anchor/frontier/source evidence; ordinary append changes
  the current token while preserving old index-row birth anchors and filtered generation history.
- Actual original native creation publication and canonical companion transaction bind the original receipt
  independently of a later generic rebuild; self-consistent caller evidence cannot supply original authority.
validation_surfaces:
- Plans/restore_point_created_contract_fixtures.json
- Plans/storage_value_registry.json
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- Plans/event_index_consumer_adoption.schema.json
- Plans/event_index_consumer_adoption_fixtures.json
risk_class: restore_point_created_completion_authority
reasoning_tier: high
context_scope: restore_point_created_event_authority
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: restore_point_created_storage_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20260911/step-08-depth-binding-work-records.md#ea-s8-restore-binding--restore-consumercheckpoint-evidence
- Plans/storage-plan.md#run-start-and-restore-created-versioned-index-adoption
preserved_exact_tokens:
- restore_point.created
- event-family-restore-point-created
- RP-RESTOREPOINT-90D-AFTER-RELEASE
- RP-PROJECTION-3GEN
- projector_replay_only
negative_constraints:
- No new event-family admission, retention policy, runtime proof, readiness clearance, WorkNodes, NodeSeeds
  or governance seal.
- No recreation of missing canonical creation custody from projections or guessed original command data.
- No passive replay side effects, hold clearing, source resurrection or filesystem restore.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FileSafe.md
```
