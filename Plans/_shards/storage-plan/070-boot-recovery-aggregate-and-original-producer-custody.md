# Shard 070: Boot recovery aggregate and original producer custody

Source: `Plans/storage-plan.md`

Source lines: L23596-L23706

Source SHA256: `3f93bf2ba1abbb4e909a5116d747441ea809bebc18511b05a69b5f090faf0fe9`

---

## Boot recovery aggregate and original producer custody

This section extends the existing application-only `storage.boot_recovery` event under the DL-045 technical contract. It preserves its current v2 payload, supported v1 reader and exact `MIG-STORAGE-BOOT-RECOVERY-PAYLOAD-001@1.0.0` compatibility edge. It adds no event type, maintenance kind, product action, first-run inference or replacement EventRecord. SP-291 owns the aggregate/source/producer joins below; SP-292 owns earliest original receipt continuity and the floor/anchor publication protocol. Both consume SP-286/CV-339 original receipt/full-value custody, SP-026/Case L-2 source admission and existing Storage migration/root/backup owners.

### Aggregate physical custody and existing terminal policy

The closed `pm.storage.boot_recovery_control.v1@1.0.0` aggregate uses `Plans/storage_boot_recovery_control.schema.json` and exact actual-root path `storage/migrations/boot-recovery.v1/{sha256_utf8(storage_instance_id)}/{recovery_epoch_20}.intent.msgpack`. `recovery_epoch_20` is the zero-padded twenty-digit unsigned-decimal epoch. The path selects an exact identity; filename resemblance is not original occurrence or owner evidence. This canonical, non-rebuildable control retains current selection, original source membership, original frozen producer input and original issued result through its closed collecting/frozen/issued/settled/no-obligation states. All values use the unchanged canonical MessagePack profile: exact JSON value types, UTF-8 byte-ordered string keys, minimal integer/container encodings, exact finite float representation where the schema permits floats, and no Boolean/integer/float or string coercion. The closed Boot schemas require actual unsigned integers for their integer fields; no floating-point or 53-bit shortcut is introduced.

Unsettled aggregate custody is protected until actual original resolution. Settled/no-obligation controls retain the unchanged `RP-OPERATIONAL-2555D@1.0.0` policy and stronger existing references/holds. This policy remains `fixed_ttl`, terminal-transition anchor, `retain_indefinitely=false`, `ttl_seconds=220752000`, `max_cardinality=2000000`, `cardinality_scope=project`, `max_bytes=null`, fail-closed overflow, hold eligible and compact expiry; none of these values changes. The existing application Boot event already maps to that same policy. The application-scoped records that the next subsection assigns count in its application-wide buckets, which Jared decided in DL-083 and DL-089; no fictitious project, new policy object or policy value resolves their count, and no other application-scoped record under this policy is counted there. The model proves no seven-year scheduler or native cleanup.

### Application-wide count buckets under the operational policy (DL-083, DL-089)

Until 2026-09-25 this section called the count of application-scoped records under `RP-OPERATIONAL-2555D@1.0.0` an unproved policy-owner adapter seam: the policy counts per Project, and these records belong to no Project. Jared decided that count in DL-083 on 2026-09-24 for `storage.boot_recovery`, `storage.recovery_applied` and `storage.compaction_lifecycle_changed`, and in DL-089 on 2026-09-25 for the application-scoped evaluations of `platform.capability_evaluated`. The binding below is a newly authored Storage owner contract under DL-045, whose registered-depth column holds all four families; no earlier Storage text defines an application count bucket. It creates no retention policy object and changes no value of `RP-OPERATIONAL-2555D@1.0.0`, including `cardinality_scope=project`: an application-wide bucket takes the place of the Project bucket only for records that have no Project.

**Buckets.** These are the count buckets of `RP-OPERATIONAL-2555D@1.0.0` in a Storage instance, and no record counts in more than one of them:
- the Project bucket of a project-scoped record, named by its existing scope partition `project~{base64url_no_pad(UTF8(project_id))}`. Per-project counting is unchanged.
- `app:storage_operational` (DL-083), one bucket for the application-scoped records of `storage.boot_recovery`, `storage.recovery_applied` and `storage.compaction_lifecycle_changed` together.
- `app:platform_capability` (DL-089), a bucket of its own for the application-scoped evaluations of `platform.capability_evaluated`.

A bucket name is a count key only. It is not a scope partition, a Project ID, a dedupe partition or an event field. These records keep `scope_kind=application`, `project_id=null`, the scope partition `app` and their event and idempotency identities unchanged (DL-031 `EVT-01`, `EVT-02`).

**Assignment.** Storage selects a record's bucket from its registered family and its scope, for an EventRecord its registered `event_type` and `scope_kind`, never from a key prefix, file name, producer or actor name, ID grammar or time:
- A project-scoped record counts in its Project bucket. `platform.capability_evaluated` is `application_or_project`, so its project-scoped evaluations stay there.
- An EventRecord with `scope_kind=application` and `event_type` `storage.boot_recovery`, `storage.recovery_applied` or `storage.compaction_lifecycle_changed` counts in `app:storage_operational`. The three families are application-only, so every record they write counts there. So does every settled or no-obligation Boot aggregate control of this section (registry family `boot_recovery_control`), which is `storage.boot_recovery`'s own aggregate custody under the same policy.
- An EventRecord with `scope_kind=application` and `event_type` `platform.capability_evaluated` counts in `app:platform_capability`.

This binding assigns no other family or storage value to either application-wide bucket and decides no count for an application-scoped record of any other family. A record whose scope or event type is unknown or unregistered is quarantined before append (DL-031 `EVT-05`) and never defaulted into a bucket.

**Count and overflow.** Each application-wide bucket applies the policy's unchanged values to its own members, exactly as a Project bucket does: at most 2,000,000 retained records, counting every record in the bucket whichever of its families wrote it, in the existing count order `(retention_anchor_at_utc, sequence_id?, stable_object_id)`; expiry inclusive at the terminal-transition anchor plus 220,752,000 seconds; only expired unheld records are compacted; holds and stronger references override age and count. Overflow fails closed, as for a Project: when a new record would take its bucket past 2,000,000 and no expired unheld member remains to compact, that record is refused and nothing is written. A full bucket never evicts an unexpired or held record, never borrows room from another bucket and never refuses a record of another bucket. Platform evaluations therefore cannot use up the room kept for recovery records (DL-089), and neither application-wide bucket affects a Project bucket.

**Boundary.** The platform capability catalog stays empty until build time (DL-082), so no evaluation is recorded or counted today. Native counting, refusal, expiry and cleanup remain NOT_RUN. The `boot_recovery_control` registry row's retention text states this binding; its structured `retention_policy_ref` is unchanged. This binding registers or admits nothing and changes no event family registry row.

### Six original source captures

The exact union in `Plans/storage_boot_original_source_contracts.schema.json` closes `migration`, `backup_restore`, `rotation_truncation`, `compaction`, `deletion_quarantine` and `root_relocation`. Each `storage.boot_recovery.capture_<kind>.v1` is a direct binding from its actual original owner, supplying original admission and occurrence, exact kind schema, original journal/record and pre/postcondition facts, and original integrity/recovery result IDs. `source_contract` uses exactly `path=Plans/storage_boot_original_source_contracts.schema.json`, `json_pointer=#/$defs/<kind>` and that kind's unchanged `pm.storage.boot_source.<kind>.v1` record schema ID. No proposal path, alias or structurally equivalent alternate schema is admitted.

Concrete source owners are `StorageMigrationCoordinator`, `StorageRecoveryCoordinator`, `StorageSeglogRecoveryOwner`, `StorageMaintenanceCoordinator`, `StorageDeletionQuarantineOwner` and `StorageRootSelectionOwner`, respectively. Their aggregate broad owner labels remain unchanged: migration maps to `StorageMigrationCoordinator`; backup restore and root relocation to `StorageRecoveryCoordinator`; rotation/truncation and compaction to `storage maintenance coordinator`; deletion/quarantine to `storage retention/deletion/quarantine owner`. The exact source pointer/admission disambiguates the concrete binding; this introduces no additional kind in an existing maintenance enum.

All six owners must authenticate complete discovery for the selected actual root/generation/epoch, including authentic empty results. Missing owners, incomplete discovery, foreign occurrence, a janitor-discovered filename or schema-shaped substitute are not empty proof. Every captured member has a nonempty union of genuine integrity/recovery result IDs. An operation, journal or backup identity cannot substitute for a recovery result. Native underlying source journal/result codecs and owner reconstruction remain separately required.

### Original aggregate publication and source-control release

Before discovery returns or any source-ID/control copy, independently derive the complete allowed source-member projection from actual original source owners. Complete returned discovery, sorted unique members, full control afterimage and returned projection must equal that expectation under unchanged root, epoch, lease, source owner/permission and actual original Store state through the last pure publication predicate. Protect original sources until durable aggregate publication/readback. Initial episode and empty-obligation candidates must also be fully constructed, validated and checked before publication. A helper return, matching digest or copied owner is not the original authority.

After admitted capture/readback, later in-place continuation may use the minimal immutable aggregate capsule without retaining or reacquiring old raw journals, results or constructor handles forever. Existing independent source/backup/hold policies still govern their release. Frozen membership and original producer semantics are never refreshed on retry. Genuine original source or identity effects already completed before an outer refusal remain preserved.

### Exact work-set and episode bytes

Sort/de-duplicate nonempty integrity IDs, recovery IDs and interrupted kinds by exact UTF-8 bytes. `W` is lowercase SHA-256 of the RFC 8785 string-tree preimage with exactly `domain="pm.storage.boot_work_set.v1"`, actual `storage_instance_id`, `integrity_ids`, `recovery_ids`, and `interrupted_transaction_kinds`. `S` is lowercase SHA-256 of the RFC 8785 string-tree preimage with exactly `domain="pm.storage.boot_episode.v1"`, `work_set_digest=W`, `recovery_epoch`, `manifest_generation`, and `active_segment_ref`; the two unsigned numbers enter this preimage as canonical unsigned-decimal strings, without leading zeros except `0`. This preserves full uint64 inputs without changing payload numeric types or generic EventRecord codecs.

The event ID is exactly `boot-recovery:v1:{W}:{recovery_epoch}:{S}`, its idempotency key `boot-recovery:v1:{W}:{recovery_epoch}`, and `recovery_set_id=pm.storage.recovery_set.v1:{S}`. The original application actor is `storage.boot_recovery.publish.v1:{storage_instance_id}`; occurrence/correlation/time and all other producer-owned fields come from the actual immutable original occurrence. Arrays remain sorted/unique and bounded at 4096 under the unchanged v2 payload. No-work discovery settles `no_obligation` and emits no EventRecord. The final reconciled segment must be writable; `opening` is not completed reconciliation.

Before freezing, independently verify complete captured membership and actual reconciled manifest/segment observation. Resolve earliest history under SP-292. A same episode replays its original input/result; a genuinely later exact-W episode uses a new epoch/S and a direct `repeat_of` to the earliest matching original event. No timestamp, payload-retention scan, arbitrary prior link or new work-set evaluation supplies that earliest identity. Independently derive the whole original producer intent before EventRecord construction/copy helpers and compare the entire returned earliest projection with actual custody before using it. Frozen afterimage and returned intent remain exact through final publication.

### Original installation, gaps and settlement

Before expected-event, source or Store construction, pin the complete original producer intent, its three actual Storage assignments (`sequence_id`, `observed_at_utc`, `persisted_at_utc`) and full surviving event set. Conserve all existing original sequence gaps and manifest excluded ranges, including pre-extent intervals and distinct evidence bytes, through every source constructor/copy and final original publication predicate. This preserves already admitted gap authority and creates no allocator or retention eligibility. The reviewed model contains ordinary next-group installation, not a Boot relocation implementation.

The installed source and complete created/updated actual Store must equal the independently permitted whole afterimage; returned event copies are constructed before the last guard. Actual Store, source/dedupe/barrier, root/restore/gate and Boot-domain authority remain the same, not a byte-equal replacement. Pending completion requires the exact current complete EventRecord, original frozen input and explicit SP-286/CV-339 original full-value witness with strict stored-v2 receipt. Pin whole expected settled control and result directly from actual original control/event/custody before request copy, full-value resolver, candidate copy or validator. Validate every candidate/output byte and type after all helpers, then publish only that guarded settled afterimage.

The issue coordinator independently checks the whole settlement return and allowed actual domain effect. Already-settled retry independently pins the authentic retained result before copying and checks current whole original Store/table/domain through final disclosure. A corrupt returned receipt, segment, commitment, assignment or extra field cannot become acknowledged custody. Refused dependent completion never rolls back, restamps or replaces genuine earlier original receipt/anchor/settlement effects.

### Every activated Boot issuance and mandatory backup route

Every actual selected group containing `event_type=storage.boot_recovery` requires positive actual enrolled Boot owner/Store authority at original issuance. Selection uses event type, not native-looking actor/ID/idempotency prefixes. Loss of enrollment, floor or both cannot create an unbound fallback. Direct issue, existing compatibility dispatch, explicit joint ingress and the original mandatory BackupVault settlement route use the same installed binding and same actual publisher. Boot uses its own one-member barrier group; unrelated members cannot co-batch silently. Unrelated issuance remains independent of Boot-local producer withdrawal and does not acquire a Boot floor requirement.

Mandatory full-authority backup additionally requires actual Boot continuity enrollment when its selected group or retained receipt image contains Boot custody, even if an unrelated group is current. It resolves an already-issued pending anchor before publication and rechecks the original Boot owner/current continuity at the original final backup boundary. The coherent image includes the in-root floor with the actual receipt table; it does not copy or roll back the external current anchor. This is backup-image completeness, not permission to block unrelated issuance or discard unrelated genuine rows. The shared stored-v2 receipt, eleven original public fields, compatibility reader and explicit full-value resolver remain unchanged.

### SP-291 - Boot Recovery Aggregate and Original Producer Custody

```yaml
plan_unit_id: SP-291
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The existing application Boot recovery event uses a closed immutable aggregate and six
  complete original source-owner captures. Exact work/episode hashes and original frozen
  producer input join the same activated original receipt publisher, one-member barrier
  custody and strict v2 full-value settlement. All copy/return/publication boundaries
  conserve original authority and effects; mandatory backups retain coherent Boot custody.
gui_related: false
gui_classification_reason: Defines internal source, aggregate, original append and backup custody without visual presentation.
depends_on: [SP-026, SP-236, SP-237, SP-278, SP-286, CV-339, DL-045, DL-083, DL-089]
unblocks: []
acceptance_criteria:
  - The exact canonical aggregate path/schema/MessagePack value preserves original occurrence, frozen membership and producer-owned input through retries.
  - Six authenticated complete source bindings, including empty results, precede capture; schema-shaped projections and operation IDs cannot replace original result authority.
  - All expected afterimages/results are independently captured before helpers and compared at the final actual owner boundary; old raw sources can retire after admitted durable capture.
  - Exact string-tree W/episode hashes, unsigned-decimal preimages, ID/idempotency/actor grammar, payload limits and direct earliest repeat_of remain unchanged.
  - Install and settlement preserve the complete original event set, all assignments, distinct old gaps/evidence, actual same Store and explicit original full-value witness.
  - Any activated Boot event requires positive enrollment on every original issuance route, regardless of malformed identity grammar; unrelated issuance stays independent.
  - Original mandatory backup joins current Boot custody and pending resolution without copying the external current anchor or undoing unrelated original effects.
  - Existing operational policy values stay unchanged and explicit; the application-scoped records of storage.boot_recovery, storage.recovery_applied and storage.compaction_lifecycle_changed and the settled/no-obligation Boot aggregate controls count in the DL-083 bucket app:storage_operational, and the application-scoped evaluations of platform.capability_evaluated in the DL-089 bucket app:platform_capability, each with the unchanged 2,000,000 cap, fail-closed overflow and seven-year period; no other family is assigned to either bucket, and no event/Goal registry array, native proof or readiness scope expands.
validation_surfaces: [Plans/storage_boot_recovery_control.schema.json, Plans/storage_boot_original_source_contracts.schema.json, Plans/event_payload_storage_boot_recovery.schema.json, Plans/event_append_receipt_contracts.schema.json, Plans/storage_value_registry.json]
risk_class: false_boot_occurrence_or_non_original_receipt_publication
reasoning_tier: high
context_scope: original_boot_source_and_aggregate_custody
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_boot_recovery_control.schema.json, Plans/storage_boot_original_source_contracts.schema.json, Plans/storage_value_registry.json]
node_compile_hint: {mode: bounded_boot_custody_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-083
  - Plans/Decision_Log.md#DL-089
  - reports/event-authority-20260911/step-08-storage-boot-recovery-validation.md
negative_constraints:
  - Do not infer actual source work from filenames, regenerate frozen membership, fabricate recovery IDs, emit no-work events, or select earliest from retained payloads.
  - Do not bypass enrollment with actor/ID grammar, clone original authority, replace strict v2/full-value custody, or roll back genuine independent issuance after refusal.
  - Do not introduce raw-control archives, an application cardinality bucket other than those of DL-083 and DL-089, an invented project, new retention values or policy objects, event/Goal registry entries, native readiness or executable work nodes.
owner_hints: [Plans/storage-plan.md, Plans/Contracts_V0.md, Plans/Decision_Log.md]
```
