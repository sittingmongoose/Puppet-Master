# Shard 063: Restore Point Expired Custody And Checkpoint

Source: `Plans/storage-plan.md`

Source lines: L22108-L22307

Source SHA256: `91652e7e3f4913b727e3516303f1b216cb5628360e7ecc9aad0ca1ddd43e65aa`

---

## Restore Point Expired Custody And Checkpoint

### Explicitly bindings and exact physical ownership

producer.storage.retention.restore_point_expired@1.0.0 is the Storage retention executor of the existing Chat expiry predicate. It owns no new timer/cadence/SLO/product selection rule. consumer.chat.restore_point_expired@1.0.0 is the Chat-owned passive fact consumer; projector.chat.restore_point_expired@1.0.0 owns only the verified logical-view checkpoint. reader.runtime_artifacts.restore_point_expired@1.0.0 is passive terminal evidence presentation. The expiry-family route of reader.chat.restore_point_history@2.0.0 is explicitly adopted under ACD-466. The history@1.0.0 compatibility route remains fenced to raw v1.

The logical projection stores no new per-point durable view/index. It resolves the canonical rp point, exact existing event_record_index.v2 row and native expiry companion, or a separately validated supported historical/terminal-summary branch. Event-index ownership stays with the existing Storage index writer. No new query-performance claim is made.

Two physical families are required before use:

- restore_point_expiry_commit at restore_point_expiry_commit.v1:{scope_partition}:{expiry_id}, value pm.storage_value.restore_point_expiry_commit.v1@1.0.0, canonical_non_rebuildable and mandatory-backup custody under the existing point policy.
- restore_point_expired_checkpoint at projector.checkpoint.restore_point_expired.v1:{scope_partition}, value pm.storage_value.restore_point_expired_checkpoint.v1@1.0.0, rebuildable only from verified canonical sources under RP-PROJECTION-3GEN.

scope_partition is exactly project~ plus unpadded base64url of UTF-8 project_id. New producer scope is project only. Complete physical rows contain actual standalone Plans/restore_point_expired_contracts.schema.json#/$defs/expiry_commit and #/$defs/checkpoint pointers equal to inline schemas, all required/nullable fields, owner/consumer versions, encoding, retention, redaction and migration/restore/recovery dispositions. SP-269 updates the existing summary family; it is not a third new family ID. None of these rows may remain prose-only when writes depend on them. Actual StorageMigrationCoordinator source/target graph and version ceilings are required; no store version integer or critical/MVP-array membership is guessed.

### Exact eligibility, native identity and admission

Eligibility is a current owner proof, not an event-label inference. The closed eligibility object stores the exact policy ID/version, complete owner-verified reference-release fact, evaluated time, selection kind/count/eligible-set digest/rank, exactly one complete evaluation of all eleven named protecting-ref classes, nonempty release-evidence refs with owner/digest, current owner-gate revision, actual writer admission and actual maintenance exclusion. Each ref must resolve to genuine durable owner evidence; a hash or string pointer is not authentication. Classes are descendant_branch, application, preserve, legal_hold, in_flight_application, source_lineage, live_ref, backup, rollback, recovery_anchor and maintenance. All have complete enumeration and zero active blockers at the lifecycle-admission boundary. An observed empty array is not release evidence. A producer's coordination lease is not an invented exception to an actual point-protecting maintenance ref.

Both selection kinds require evaluated_at >= released_at + 7,776,000 seconds. oldest_eligible_count_pressure additionally requires actual count >2,048 and rank0 in the actual eligible-set proof, following the reviewed SP-269 interpretation; pressure never bypasses age or holds. The cap counts logical full points, not companion rows or final hash-summary residues. If the actual oldest eligible selected point is already terminal, this expiry producer emits nothing; its independent retirement owner handles that state. The expiry producer does not select a younger point merely to obtain an available-to-expired transition. Selection must still be current under the same writer/hold/maintenance serialization used by the transition. No point held at this boundary expires. Missing, unavailable, deleted, corrupt, already expired, hash-mismatched, unprovable, before-boundary or nonwriter input changes nothing and emits no expiry event.

The actual canonical record must be available with its exact immutable hash. A native-created record requires the genuine committed created companion/source admission and the SP-281 immutable-capture hash recipe. The native recipe hashes the existing thirteen immutable fields, excluding mutable status and holds; expiry never recomputes it from an expired status or rewrites record_sha256. Supported historical capture uses its actual unchanged hash and explicitly supported owner verification. A historical record is never relabeled native solely because its fields resemble the current schema.

technical expiry_id is rpe_ plus lowercase SHA256 over four UTF-8 strings, each preceded by its unsigned64 big-endian byte length: restore_point.expired/expiry/v1, project_id, restore_point_id, original record_sha256. Event ID is er_rpe_ plus the same digest; the native idempotency_key is expiry_id. Since the point lifecycle is one-way, a second expiry identity for the same point/hash cannot authorize another transition. Before initial admission an evaluation may be refreshed under the same candidate identity; after admission the complete selected proof/input is frozen. A matching existing identity/digest returns the original result; mismatch fails closed. No inference from native-looking key spelling establishes source admission.

The complete envelope, registered payload, native identity/hash joins and frozen input are validated before E1; malformed input cannot change point status. The complete append input is persisted before any event append. It uses Contracts EventRecord2, exact payload schema, inline payload, no_secrets, dedupe_by_idempotency_key, authenticated retention-owner actor_ref, project parity, and null thread/run/node/attempt/requested-account/effective-account refs. Payload release refs exactly preserve the frozen admission evidence list. Occurrence time equals the logical transition time; original correlation/causation/producer sequence and event ID are retained on recovery. Producer semantic digest uses the exact Contracts1028 field set and excludes Storage-assigned sequence/observation/persistence fields. frozen_append_input_sha256 separately covers the complete frozen input. No command-result/FullThread outcome is invented for this background lifecycle transition.

### Logical expiry and physical retirement are separate stages

E1: Under current global writer admission, current verified source/creation prerequisites and the shared hold/maintenance exclusion, one redb transaction CAS-checks available+exact hash, changes only status to expired and stores the complete pending expiry companion. It retains the immutable capture, all source refs/holds and every required companion. It does not write a final retirement summary or remove any point/source/event byte. The point is now unavailable for apply/delete, but no completed expiry publication is exposed yet.

E2: The native producer submits exactly the stored frozen event through the existing append owner and receives a real barrier/synced AppendReceipt. Actual frame/manifest/directory durability, global event-ID and scoped-idempotency admission remain the existing append owner's responsibility. Buffered or guessed coordinates are insufficient. If append fails or the process dies after E1, the point remains expired with pending mandatory custody; only the expiry owner reconciles that same intent under current writer authority. It never rolls back to available, changes occurrence/evidence/identity, publishes a terminal refusal instead, or creates a second expiry event.

E3: One redb transaction commits the actual AppendReceipt and exact original typed expiry result in the companion. Result outcome is expired with original project/point/ref/hash/expiry/event identities and physical_retirement_performed=false. Only then may a completed lifecycle result be published. Crash after E2 but before E3 resolves the same canonical dedupe identity and commits the same genuine exact first eleven-field receipt through the explicitly adopted SP-286 append-owner protocol; until that custody is resolved, remain recovery-required, never fabricate the missing fields from a four-field locator; crash after E3 returns the original result. A schema-valid event or expired status alone proves none of these joins.

R: Actual physical custody retirement is a later, independently authorized SP-269 transaction. After resolving admitted retained native custody through SP-285 without old original controls, it freshly re-evaluates current release/age/count/all refs and requires committed E3/native custody plus actual summary-writer and reader admission. It writes complete validated final summary and removes exactly the named eligible redb keys atomically. It emits no expired event and creates no lifecycle transition. Therefore expiry does not depend on a summary that itself needs an expiry event; retirement depends on the already completed lifecycle. R may follow E3 in one maintenance execution, but cannot collapse or reorder the durable boundaries. The same retained-read lease and complete final retirement selection/eleven-class/release check remain bound through handoff; Storage is revalidated again after that owner check.

A legitimate hold/ref admitted after E1 preserves the expired capture and required custody while independently blocking R. It does not resurrect available or imply the earlier zero-blocker admission was invalid. Consumers may truthfully inspect that held expired record. A hold serialized before E1 blocks E1. No stage clears a hold. No stage deletes source thread/conversation/worktree/file/Git/index/queue/runtime-safe-point state, performs FileSafe restore, or emits runtime_artifact.restore_point. Expiry status is an unavailable conversation state, not proof of physical purge.

### Passive consumer truth and currentness

Native_completion requires the actual current frame/payload/semantic/index proof, expired point/project/hash relation, immutable capture/native-or-supported creation proof, exact committed companion/frozen input/eligibility digest, and actual synced receipt coordinates and original result. The current record may carry a later hold because it is inspectable terminal custody, not action eligibility. Missing a required native companion is unexplained loss, never evidence it was optional.

Historical_completion requires genuine supported historical expired point/event/hash, original policy/release/ref proof, supported source/version admission and actual evidence that expiry-companion introduction did not require native custody for this source. No native companion, AppendReceipt, event, creator proof or new hash is fabricated. EventRecord1/2 or registered minimal-envelope compatibility input follows the existing normalizer/schema/source context; no alias or payload extension is added. Native-looking IDs and absence of a row are not introduction proof.

Terminal_retention_summary is distinct from both present-point branches. When a surviving expired event drives traversal, its actual frame/payload/semantic/identity must match the authoritative final summary under current source/index/generation proof. This branch does not require the lawfully removed point, creation companion or expiry companion. V1 is valid only for genuinely supported pre-expiry-custody history under explicit introduction proof; native expiry retirement requires the SP-269 v2 writer and separately admitted codec2. Missing/unproven summary or unexplained loss preserves the affected-record fence and prior checkpoint. No terminal branch authorizes apply/delete, restoration, source visibility or reconstruction.

The point/event/source have their own owner retention and holds. Summary publication removes only named redb custody; it is not seglog/blob/thread/file deletion permission. Later event retention may lawfully remove the expired event. The event-driven projector then cannot fabricate that frame or advance through an unexplained gap. Current owner-approved retention/compaction range/translation proof governs remaining source coverage and disclosure. Direct summary-by-point inspection and expiry-owner original-result lookup can use genuine final summary admission without requiring already retired event bytes; they do not manufacture an event cursor or certify missing source coverage. Summary is independent canonical residue, not a projection from currently present source bytes.

Checkpoint publication is a single owned redb update after contiguous verified source/index coverage, with current Storage instance/project, full-index checkpoint/selection digest, manifest/recovery epoch/segment generation, survivor prefix, source offset and event identity. It binds the stable publication generation and schema/consumer/projector versions. The cursor is the beginning of the last verified record; resume validates that record and starts after its checked frame end. Missing checkpoint means uninitialized, not zero-proof. Before commit, revalidate the same current generation/source range under the existing Storage publication/maintenance protocol; a changed generation or hole leaves the last committed checkpoint unchanged. This projector does not own or rebuild the canonical event index and writes no per-point canonical repair.


Later present native expiry inspection explicitly adopts SP-285 reader.storage.restore_point_retained_custody@1.0.0 and its retained_native_terminal output, preserving all retained immutable operation/result/receipt/capture joins and complete current SP-278 source/hold facts without reacquiring original E1/E2/E3, eligibility or nested creation controls. Historical and terminal-summary branches remain independently typed; expiry gains no SP-274 dependency.

### Expired checkpoint generation history

The registered checkpoint value requires `publication_id`, `hold_refs`, and `retired_generations` in addition to its current identity/cursor/publication fields. Here `publication_id` is the stable **projection-generation** identity, and `published_at_utc` is that generation's first verified publication time. The exact generation discriminator is `(storage_instance_id, scope_partition, consumer_id, consumer_version, projector_id, projector_version, cursor.projector_schema_version, publication_id)`. Source segment rotation, source/index cursor advancement, updated full-index checkpoint/selection and a new event do not by themselves change this discriminator. No timestamp, filename or event sequence allocates a new generation.

Ordinary traversal performs a CAS update to the same current generation's cursor and verified source/index fields, revalidating every current source/index/survivor proof and predecessor checkpoint. It preserves `publication_id`, `published_at_utc` and every retired generation/anchor. It does not archive the previous cursor position or consume a retention-generation slot. No per-cursor timestamp is needed for this contract. Source recovery/translation may continue this same generation only when the existing owner source-range/currentness proof remains valid; otherwise the projector must take the separately verified rebuild path, never copy a stale cursor into CURRENT.

Only first initialization, an explicit verified projection rebuild, or an owner-reviewed supported schema/binding successor establishes a new projection generation. Repeated retry of the same unpublished generation transition reuses its selected identity; it does not slide a retirement anchor. A transition cannot publish until the new full source coverage/currentness proof succeeds. On that real generation transition, one redb transaction writes the new current core, archives the previous current core, and sets that archived entry's `retired_at_utc` exactly to the new generation's `published_at_utc`, with `successor_publication_id` exactly the new generation ID. The archived core contains the final cursor of its old generation. Retained older entries preserve their original retirement facts. The terminal-transition TTL anchor is the explicitly persisted retirement time, never the old generation's birth time or an inferred timestamp. The new publication time must be valid and cannot predate the archived core's birth; a clock/authority inconsistency fails publication rather than rewriting history.

`retired_generations` contains zero to two entries, each a complete closed prior checkpoint core **without** recursive history, its required `retired_at_utc`, and `successor_publication_id`. One current plus at most two prior generations is the existing three-generation cap. No secondary history key or unspecified metadata supplies retention facts.

Each archived core retains the exact old storage/project/consumer/projector identity, cursor, selected-index reference/digest, original publication ID/time and owned hold refs. All project/scope/storage identities match this logical key; publication IDs are distinct and a generation cannot retire into itself. Completed generation transition records the timestamp and successor relation atomically, so no archived generation has an unknown terminal anchor. The exact existing registry policy is `RP-PROJECTION-3GEN@1.0.0`: `current_plus_history`, `terminal_transition`, TTL `604800`, `max_cardinality=3`, `cardinality_scope=logical_key`, `overflow_action=rebuild_projection`, `hold_eligible=true`, `expiry_action=rebuild`. History expiry checks the persisted retirement anchor and owner hold state. Overflow invokes that existing rebuild disposition; these fields are not new permission for early eviction, dropping a held generation, or bypassing the stated retirement window. If the owner cannot establish a policy-permitted generation slot, preserve the last committed checkpoint and disclose affected currentness as unavailable until a lawful rebuild/publication is possible. Ordinary cursor advances do not need new slots and continue after fresh proof. Rebuild never fabricates retirement times.

Archived cursors are retention/history data only. None certifies currentness or becomes a fallback CURRENT selection. The current core must independently validate against the current source/index generation and survivor authority. Moving an old core into the current position without a fresh verified publication is rejected even if its schema and earlier retirement facts are valid. No old generation can authorize a point action.

### Complete expiry, creation and original-publication predicates

Initial expiry admission composes the original full expiry_commit semantic predicate, not only its schema. It derives expiry_id, EventRecord ID and idempotency from the exact existing length-prefixed original project/point/hash recipe and verifies every typed result field, before/after status, policy/release/hold/current-gate evidence and all frozen input/eligibility/producer hashes. The operation's actual Storage instance equals the admitted current Storage source/checkpoint instance; repairing a foreign operation key or digest cannot change that authority. Existing expiry eligibility, 7,776,000-second release rule, 2,048 logical point pressure and all eleven protecting-ref classes are unchanged. A later hold can protect completed expired custody without invalidating its original expiry or authorizing retirement. Later native expiry inspection explicitly calls SP-285 reader.storage.restore_point_retained_custody@1.0.0: complete retained semantic fields remain required, while old eligibility/release/transaction controls are admitted historical facts rather than reacquired inputs. Fresh current protecting refs still govern separate retirement.

At original native creation admission, compose the actual SP-281 creation-domain predicate and the now canonical event_index_consumer_adoption original_creation_publication/original_creation_commit_transaction predicates. Preserve the exact admitted original created event, original canonical companion/record transaction, original append receipt and original source selection. Verify full immutable capture, request/frozen input, receipt manifest and physical interval, event/scope/schema and every original publication field and hash. The original creation transaction must identify the exact companion and record bytes; a repaired companion hash or paired receipt/source-fixture manifest is insufficient. The accepted created checkpoint's actual v2 generation admission, predecessor retirement and captured complete source/index read are independently checked under SP-281. A schema-version substitution is not admission. Later native expiry reads use SP-285 retained creation joins within the terminal adapter, without original creation publication/transaction/source snapshots or an old created checkpoint. They gain no SP-274 result dependency; historical introduction remains separate.

Creation's original publication is separate from later current generic source and from expiry's own original E2 append. Preserve each original receipt's true manifest, recovery/source context and physical locator. Neither is overwritten with current rebuilt/compacted index coordinates. The current full index locates the current surviving event, whose unchanged semantics still join the original custody. Unsupported historical creation/source admission remains in its original owner lane; no native companion or new hash is manufactured to satisfy this predicate. Supported historical admission remains separately required.

### Expiry SP-278 complete index adoption

This first-native expiry checkpoint is its own v1 binding, with exact required generic_read_token from canonical Plans/event_record_index_checkpoint.schema.json#/$defs/read_token. No existing checkpoint version or source-hash meaning is silently changed.

Within one actual redb snapshot, resolve event_record_index_checkpoint.v1:{storage_instance_id}, its selected current_generation_id and actual event_record_index.v2@{generation_id} dataset. Every row's key/source identity/digests and checkpoint_ref resolve the actual generation node. publication_locator joins its immutable generation birth anchor; an old row is not required to carry the latest append manifest. Separately validate actual CURRENT/manifest/source-control bytes, recovery epoch, inventory, synced watermarks, survivor/exclusion/gap facts and the complete advancing frontier across all scopes and families. Full row cardinality/row-set hash and exact retained source coverage precede any filtering.

For this newly introduced expiry index_selection_sha256, use the exact canonical SP-278 binding codec over its closed selection object (read_token excluding redb_snapshot_id). This is a local checkpoint binding assignment, not an alteration of EventRecord payload/source, producer semantic or point hash recipes. generic_read_token additionally carries the actual redb_snapshot_id. full_index_checkpoint_ref, selection digest, current-source traversal cursor, actual index row and actual event all join that snapshot. The cursor marks the final verified global record, including nonmatching application/project events. A matching expiry event is not necessarily the traversal boundary. Same-generation append changes the full frontier token and invalidates old filtered publication even if no matching expiry event was added.

Original expiry receipt/source evidence remains separate from these current coordinates. Revalidate current source/index, phase-appropriate authenticated retained receipt/point/summary custody under SP-285, with full original controls required at initial admission, owner gates, permissions/deletion and prior filtered-checkpoint CAS immediately before committing the one owned checkpoint and again before disclosure. No row/schema/ref alone authenticates a frame or policy decision. The original payload, immutable point, original append-input and producer-semantic hash algorithms remain unchanged. Source frame/CRC/native MessagePack/control encodings, sync and locking are native obligations, not established by the synthetic single-segment adapter.

### Expiry final summary without removed-row dependencies

SP-269 owns the exact same-key v2 summary, strict writer and registered retained-value dispatcher. All required reader/writer gates apply before physical retirement.

Before R removes anything, validate the actual expired point and required creation/expiry companions, exact E3 original result/receipt, the current re-evaluated release/hold eligibility and actual summary writer/read-route admission. In the single owner summary transaction, write the final summary and remove exactly its enumerated canonical redb keys. For native expiry, the exact set is rp:{project}:{point}, restore_point_expiry_commit.v1:{partition}:{derived_expiry_id}, plus restore_point_creation_commit.v1:{project}:{point} when genuine creation introduction requires it. No deletion companion is allowed in this expired set. Every entry has its exact original registered schema ID/version, canonical encoding, actual value-byte digest and removed_in_summary_transaction disposition. Count remains at most three; the point is one logical point for the 2,048 policy.

The original_expiry_result must equal the entire exact derived expiry result, including record_ref, original hash, project, point, expiry ID, event ID and physical_retirement_performed=false. terminal_event.original_record_hash and creation_event.original_record_hash equal original_record_hash. The original expiry receipt's event/sequence/manifest/segment generation/name/offset/durable end equal the ORIGINAL terminal_event publication facts exactly. Original publication coordinates must be genuine owner facts. Later current source rebuild is independently validated and does not rewrite these original facts. Original source-admission/capture verification facts remain actual owner-certified canonical summary evidence; a ref or repaired hash cannot manufacture them.

After lawful retirement, direct summary inspection and expiry original-result lookup require the actual canonical summary at its exact instance/project/key and its admitted owner summary transaction/source-generation path. They do not require the removed point, creation/expiry companion or retired source manifest. Event-driven traversal additionally requires the actual surviving current event/index and unchanged payload/semantic identity, plus complete current source range. The summary itself is durable canonical owner evidence; it is not reconstructed from current EventRecord metadata. Missing authenticity, original custody or unexplained source range leaves the prior checkpoint and affected-record fence intact. None of these routes grants apply/delete/branch, process restart, FileSafe restore, purge or source-body visibility.

### Expired predecessor chronology

The existing exact history layout remains one current checkpoint plus at most two complete nonrecursive retired cores. Validate the input's entire history before any refresh or replacement. Every predecessor birth must be <= its first retirement <= its actual immediate successor birth; successor IDs resolve the retained chain to the selected current generation, without cycles or missing/foreign nodes. Scope/Storage/binding/version identities agree throughout. A paired bogus retirement/successor time before predecessor birth is invalid even when both values are changed together.

Ordinary advancement preserves current publication_id, birth and every predecessor value/retirement/successor exactly and consumes no generation slot. Only a separately verified rebuild/supported successor may archive the exact final old core and publish a distinct generation atomically. New retirement equals that successor's actual first publication and cannot slide on retry. Existing seven-day terminal anchor, holds/live refs and three-generation protected cap remain unchanged. All protected slots blocks replacement; no erased predecessor or fabricated publication can create capacity.


### Original expiry owner boundaries

New expiry E1 consumes the actual retained-created passive_creation prerequisite under SP-285 lifecycle_from_retained_creation. The complete initial native expiry evidence composes the actual existing Storage expiry owner's original E1 transaction, E2 append acknowledgement and source commit-group controls, E3 transaction and original eligibility/admission snapshots. These are typed transient resolution inputs from the existing point/expiry custody, Storage transaction/source controls and actual owner authority. They do not create new physical families, an E1/E2/E3 journal, additional retained roots or new policy. The closed schema Plans/restore_point_expired_owner_resolution.schema.json describes this read adapter; a string ref, repaired caller digest or caller boolean does not authenticate the owner input. Every original E1/E2/E3/eligibility predicate below remains mandatory at its original boundary. After authentic E1 pending publication, the explicitly installed SP-285 pending recovery route consumes that admitted canonical custody and SP-286 first receipt without disposed E1/eligibility/nested creation controls, and applies the final receipt-before-owner-local-guard ordering before atomic E3. Later retained-row inspection uses SP-285 with actual immutable admitted companion/capture/receipt/result and current source, without these disposed transient controls.

E1 resolves the exact canonical record and companion keys and Storage/project/partition/point identity. Its actual before record is available with the original immutable hash. Its after record changes only status to expired, preserving capture/source fields and hold_refs exactly. Its complete pending companion equals the frozen original operation with state pending_append and null receipt/result/commit time. The actual transaction binds original writer admission, maintenance exclusion, eligibility snapshot and owner revision and identifies only those two permitted mutations. E1's actual transition time agrees with the frozen event occurrence and original operation, not a new retry time.

The original eligibility snapshot resolves the exact Storage/project/partition/point/input and selected before-record bytes; installed unchanged policy object/version; every original hold-class evaluation; actual writer identity/revision; actual maintenance lease held for that E1 transaction; selection time and reference-release source records. Every release ref resolves its full original owner value and byte digest, project/point/release ID/time and closed-ref-set digest. These new transient source adapters do not redefine any existing durable hash recipe. Actual source serialization, complete hold enumeration, provenance, writer CAS and lease exclusion remain native obligations.

E2 resolves the complete original eleven-field AppendReceipt from the actual append owner, including commit_group_id and acknowledged_at_utc. Its original source group contains the event/sequence and exact manifest/segment/offset/durable-end acknowledgement, with matching frozen append input and producer semantics. Full frame/manifest/watermark/directory barriers precede a successful acknowledged group. This source selection and group remain original facts when the current generic index relocates or advances. Current location fields cannot rewrite the original acknowledgement. Contracts_V0.md's Durable append receipt and storage recovery events section is the receipt owner; no CV-338 inference is used.

E3 resolves the exact pending-to-committed companion transaction, preserving the original E1/E2 references and unchanged point. The entire actual committed operation includes the actual original receipt and complete original expiry result. The E3 point snapshot may contain independently admitted post-E1 holds; E3 itself writes only the companion. Its value-byte digests and commit timestamp agree with the independently resolved original transaction and current canonical owner read under the selected current source fence. E1, acknowledgement and E3 have the required operation ordering. There is no new maximum pending age, wall-clock cutoff or future-time rejection: a legitimately late E3 remains lawful when all original/current custody, source and owner joins hold. Replacing committed_at_utc or acknowledgement time without the actual corresponding owner record fails.

Current point holds can legitimately differ after E1 through their existing owner. The read still verifies the actual current canonical point bytes and preserves the frozen expired capture. Those later holds block independent retirement and cannot invalidate the original completed expiry. Before any R summary publication, the retirement owner resolves the already-admitted immutable E3 custody through SP-285 and separately validates the complete fresh current retirement gate, then copies its entire original receipt/result into the exact same-key summary. After lawful retirement, the independently canonical summary remains the terminal authority and does not acquire a dependency on removed point/operation/source rows.

Ordinary checkpoint cursor advancement preserves current hold_refs exactly, in addition to publication birth/identity and every retained predecessor core. It cannot remove or add a current hold under cursor_advance. A separately authorized hold operation remains with the existing hold owner and is outside this adapter; no hold mutation is inferred from source progress.

E3.record_value is the actual point snapshot read at E3. It preserves the E1 after-state's status and immutable/capture/source fields, but can contain holds admitted by their existing owner after E1. Its complete value-byte hash and the independently resolved original E3 owner record bind that actual held snapshot. E3's permitted mutation remains only the expiry companion's original receipt/result commit; it does not write the point or remove holds. The actual current point read may contain separately owned later holds as well.

This does not recapture or amend E1's available point, pending input, original eligibility or preflight. A protecting ref before E1 still blocks admission. A hold admitted between E1 and E3 protects custody without cancelling the already admitted expiry. All original receipt/group/time/owner and current checkpoint-hold preservation checks remain required.

### Expiry original-result lookup and terminal admission

The SP-269 final summary retains the expiry owner's complete original result/receipt and terminal semantic digest for the existing app-root same-identity rule. An expiry-owner retry checks exact native intent or lawful canonical final summary before append. After point/intent/event retirement, a matching original identity/digest returns that exact original lifecycle result/receipt and never invokes E1/E2 again. `physical_retirement_performed=false` remains E3's historical result even after later physical retirement. A conflicting semantic digest fails closed; missing mandatory receipt/custody fences instead of recreating a lifecycle fact. This is the expiry owner's lookup, not command-outcome authority or a global dedupe writer.

The producer, consumer, projector and passive readers use the shared SP-269 codec and exact route table. All direct bindings retain raw-v1-only support; v2 reaches current consumers only through their separately admitted codec2 typed boundary. Native expiry retirement requires v2; supported v1 history requires actual pre-introduction proof. Point/companion/event retain RP90 and independently owned holds; the checkpoint retains RP-PROJECTION-3GEN. Missing non-rebuildable native custody or summary is disclosed data loss requiring owner recovery and mandatory backup, not reconstruction from an index, checkpoint or transcript. Coherent recovery preserves held/pending custody and actual introduction/version boundaries.

ContractRef: ContractName:Plans/restore_point_expired_contracts.schema.json, ContractName:Plans/restore_point_expired_owner_resolution.schema.json, ContractName:Plans/event_record_index_checkpoint.schema.json, ContractName:Plans/storage-plan.md#restore-point-summary-codec-and-coordinated-admission

### SP-275 — Restore-point expiry custody and checkpoint

```yaml
plan_unit_id: SP-275
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage executes the existing expiry predicate through status-only E1, original barrier
  append E2 and complete receipt/result E3. New E1 uses SP-285 retained-created admission and full fresh expiry gates;
  later passive native reads explicitly adopt SP-285 retained_custody with complete current SP-278 source
  and no disposed original or nested creation controls; later holds preserve terminal custody. Checkpoint
  refresh preserves current holds and generation history. Independent retirement uses SP-269 v2 custody
  and coordinated codec admission without changing retained v1.
  SP-285 pending recovery explicitly requires the installed SP-286 full-value resolver at terminal staging and final publication, authenticating the original complete event and actual v2 receipt custody before the complete owner-local guard; no dependent resolver intervenes before atomic terminal publication.
gui_related: false
gui_classification_reason: Defines backend custody, source validation and owner-result authority.
split_recommended: false
depends_on:
- SP-269
- SP-281
- SP-278
- SP-285
- SP-286
unblocks: []
acceptance_criteria:
- Release plus 7776000 seconds, oldest-eligible count above 2048 and all eleven protecting-ref classes
  gate admission; pressure bypasses neither age nor holds.
- Frozen identity/input survives every E1/E2/E3 crash boundary; unresolved exact-first-receipt custody
  stays recovery-required; actual full original receipt and source-group barriers precede completed publication.
- E1 changes only status; E3 writes only companion and preserves independently admitted intervening holds,
  including legitimately late commits.
- Native, supported historical and canonical terminal-summary branches require exact source/custody/version
  admission; no removed-row dependency is introduced after lawful retirement.
- Full global frontier and same-redb token are revalidated before checkpoint CAS/disclosure; ordinary
  advancement preserves birth, holds and entire lawful predecessor chronology.
- V2 retirement retains the entire original expiry receipt/result and removes only exact admitted keys;
  original-result replay cannot rerun expiry.
- The explicitly installed SP-285 retained-present route rejects unknown native origin, missing required
  rows and any late registration/install/migration/backup/permission/quarantine/row/source change; an
  unchanged generic token alone cannot authorize disclosure.
- SP-285 pending recovery explicitly requires the installed SP-286 full-value resolver at terminal staging and final publication, authenticating the original complete event and actual v2 receipt custody before the complete owner-local guard; no dependent resolver intervenes before atomic terminal publication.
- Authentic admitted pending custody replaces disposed original admission controls only on the exact installed recovery route; final completion preserves independently current point holds.
validation_surfaces:
- Plans/restore_point_expired_contracts.schema.json
- Plans/restore_point_expired_owner_resolution.schema.json
- Plans/restore_point_expired_contract_fixtures.json
- reports/event-authority-20260911/step-08-restore-pair-validation.md
- Plans/restore_point_retained_read.schema.json
- Plans/restore_point_retained_read_result.schema.json
- Plans/restore_point_retained_creation_read.schema.json
- Plans/restore_point_retained_creation_read_result.schema.json
risk_class: restore_point_terminal_custody_or_false_completion
reasoning_tier: high
context_scope: event_authority_step08_restore_pair
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- EA-BINDINGS-285-RESPONSE-001
- RSE-P01
- RSE-P02
- RSE-N01
- RSE-N02
- RSE-N03
```
