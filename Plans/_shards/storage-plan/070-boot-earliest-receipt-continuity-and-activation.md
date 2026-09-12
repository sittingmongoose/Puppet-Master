# Shard 070: Boot earliest receipt continuity and activation

Source: `Plans/storage-plan.md`

Source lines: L23288-L23389

Source SHA256: `6ab46ef95ecc859b6ad97847bd6790722b7f29104e7e44ee60eeb3f49d51b534`

---

## Boot earliest receipt continuity and activation

### Three families and four physical locations

The actual selected narrow SP-286 receipt database gains one current row in table `boot_recovery_history_floor.v1`, exact UTF-8 key `boot_recovery_history_floor.v1:{storage_instance_id}`, containing canonical MessagePack `pm.storage.boot_history_floor.v1@1.0.0` under `Plans/storage_boot_history_floor.schema.json`. It is canonical, non-rebuildable continuity authority and participates in the same database transaction and coherent mandatory backup as original receipt custody.

Storage's actual current bootstrap-binding/root-selection owner, under the existing out-of-root bootstrap and SP-236 root-management contract, selects its existing parent directory. The current external anchor is exactly `boot-recovery-history.v1/{sha256_utf8(storage_instance_id)}.anchor.msgpack`. Once settled, it has the exact same complete floor bytes as the selected in-root row. Root restore does not restore this outside-root anchor; a raw path or caller-supplied parent cannot change actual root/instance selection.

The external-anchor family owns at most one protected replacement publication path, `boot-recovery-history.v1/{sha256_utf8(storage_instance_id)}.pending.msgpack`. It carries the same next complete-floor value, narrowed by `Plans/storage_boot_history_pending.schema.json`; there is no additional wrapper, transition log or separately retained pending family. Thus aggregate, in-root floor and external anchor are three families with four physical locations. Pending is publication/recovery custody, consumed by rename or removed only by the actual closed never-committed cancellation route; it has no independent TTL, seven-year history or policy. No second staging file or archived floor chain is introduced.

Current floor and current anchor use the unchanged `RP-EVENT-IDENTITY-APPROOT@1.0.0`: app-data-root lifetime, indefinite, creation anchor, `retain_indefinitely=true`, null TTL/cardinality/byte ceilings, fail-closed overflow, hold ineligible, expiry none. This retains content-free identity/first-receipt continuity, not raw event/source controls. The original activation MigrationReceipt remains under its existing `RP-AUTHORITY-INDEFINITE` policy. No Boot mapping changes any existing policy value or the independent payload/aggregate lifetimes.

### Exact canonical installation binding before original birth

The installed producer is exactly `storage.boot_recovery.publish.v1`; reader exactly `storage.boot_recovery.resolve_earliest.v1`. Required original shared roles are, in order, `storage.first_append_receipt.issue.v2`, `storage.first_append_receipt.resolve.v2`, `storage.first_append_receipt.group_gate.v2`, `storage.first_append_receipt.backup_gate.v2`, and `storage.first_append_receipt.resolve_full_value.v1`. Installation must additionally admit the six exact capture-kind bindings, three physical families/four paths, complete source/receipt readers, current bootstrap selection and required mandatory backup/recovery publication behavior. Mere schema registration or an old authentic migration receipt does not establish current installation.

The reviewed activation algorithm is unchanged. Its `schema_sha256` map uses exactly keys `boot-control`, `boot-history-floor`, `boot-history-pending`, and `boot-original-source-contracts`, each hashing the canonical MessagePack representation of the complete installed canonical schema object. The corresponding exact files are `Plans/storage_boot_recovery_control.schema.json`, `Plans/storage_boot_history_floor.schema.json`, `Plans/storage_boot_history_pending.schema.json`, and `Plans/storage_boot_original_source_contracts.schema.json`. Their canonical root IDs are respectively `https://puppetmaster.local/schemas/storage_boot_recovery_control/1.0.0`, `https://puppetmaster.local/schemas/storage_boot_history_floor/1.0.0`, `https://puppetmaster.local/schemas/storage_boot_history_pending/1.0.0`, and `https://puppetmaster.local/schemas/storage_boot_original_source_contracts/1.0.0`. The aggregate's nested pending-event metadata ID is `https://puppetmaster.local/schemas/storage_boot_recovery_pending_event/1.0.0`; actual EventRecord/payload schema IDs and all record tags/structural definitions remain unchanged.

`activation_contract_sha256` is SHA-256 of canonical MessagePack of exactly `{schema_sha256, producer, reader, native_grammar, shared}`. `native_grammar` is exactly `^boot-recovery:v1:([0-9a-f]{64}):(0|[1-9][0-9]*):([0-9a-f]{64})$`; producer/reader/shared are the exact values above. These schema-object hashes differ from raw-file source pins and from the older reviewed proposal-metadata activation hash. Configure all canonical schemas and the exact canonical source selector before any original birth owner, activation receipt, source discovery or aggregate capture. Runtime admission uses that actual installed canonical hash; historical reviewed proposal hashes are evidence lineage only. No alias, repaired birth/floor/receipt hash or post-capture path rewrite promotes an old fixture into original canonical admission. The existing coordinator must supply an actual eligible installation/activation receipt; no production migration version or new migration edge is inferred from fixture tokens.

Before creating a genuinely new Storage instance, the actual root/coordinator exclusion authenticates all six original absence observations: bootstrap binding, in-root identity, redb, retained seglog, relevant migration/restore/maintenance journals and backup manifests. All must have been absent before identity creation. Existing continuity plus missing/corrupt bytes is not first run. Independently pin the whole original identity and allowed birth-owner effect before `begin`, then original receipt/birth and allowed installed-owner effect before activation; compare actual original returned projections and owner identity/state after each operation. Genuine completed identity or installed MigrationReceipt effects survive refused dependent publication.

The complete floor has only schema/version/instance, revision, complete state, immutable inline birth, boot receipt count/set hash, previous-floor hash, last transition and no-secrets marker. Birth binds original native birth ID/instance, six absence observations, identity-creation hash, exact installed canonical activation hash and original MigrationReceipt key/hash. Its revision/count are zero and previous-floor hash null. The unavailable variant has only schema/version/instance/revision, unavailable state, closed reason and marker; it has no invented birth or completeness proof. Unknown/pre-native history cannot be upgraded from an empty receipt scan, restored image or copied complete floor.

### Original receipt/floor publication and bounded pending replacement

For birth and every original Boot issuance, capture the entire independently permitted next floor before any candidate copy/validator. Create pending exclusively, write exact canonical bytes, synchronize it and its parent, and verify readback before receipt/floor publication depends on it. Pending, candidate floor and returned result copies must equal the original expectation. Commit the birth's empty floor, rename the exact pending file over the current anchor, synchronize/verify the namespace, and only then enable the producer. A birth cut uses the already admitted original identity/pending proof; it cannot repeat all-absent discovery against the created instance or manufacture a second birth.

For issuance, `last_transition` is exactly `{kind: issued, receipt_key, receipt_custody_sha256}`, referring to the existing independently prepared canonical SP-286 custody row. `previous_floor_sha256` hashes the actual complete predecessor bytes; revision/count advance exactly once. The original shared issuer derives its exact row from actual source/group/clock. The Boot owner joins that original row to immutable intent/W/actor and independently captures the complete successor, including unchanged birth, before any predecessor/pending copy. Candidate and every durable pending copy remain equal through the original last precommit predicate.

After all validators/copies, the same original transaction authenticates source/dedupe/barriers/restore/gate, complete previous receipt table, original receipt candidate, current domain/permission/activation/control/floor/anchor and pending/next floor, then publishes original receipt row and new floor together in that actual database. No fabricated future acknowledgement, alternate publisher or cross-file atomic transaction is claimed. Then recheck original admission/row/floor/complete Boot set and finish the exact pending-to-anchor rename/sync. Rename consumes pending. A dependent refusal after receipt commit preserves the original row and eleven fields/time without restamping or rollback. Hash preimages are acyclic: identity contains no floor; installation hashes schema objects/roles; predecessor is already admitted; original custody row contains no floor; pending equals the resulting next floor.

### Exact crash-state recovery and unrelated progress

Explicit recovery permits only the following original states. For an ordinary issuance's never-committed pre-state, floor equals anchor; its hash equals pending's predecessor; the actual complete Boot set matches floor; pending's exact original key is absent; and actual in-place original issuer authority proves no commit. Only then cancel that pending replacement. A later genuine retry issues under the original shared gates. A restored pending image cannot claim this origin.

For exact committed post-state, floor equals pending; complete Boot count/hash matches actual canonical custody; original key/custody hash and original one-member barrier group match; birth is unchanged; and revision/count advance exactly once from current predecessor anchor. Complete that same rename/sync without changing original receipt/time. Before each pending/birth-floor copy, pin original pending bytes and full actual Store/root/owner state; construct candidates before the final pure recovery predicate. Third states, missing pending with floor/anchor skew, corrupt/unsupported pending, stale selection, missing role or owner loss remain unavailable.

A rename cut can leave the exact new anchor and no pending. Only explicit startup recovery may establish namespace durability after authenticating exact current floor/anchor and full Boot set; passive reads never repair it. Unknown durability cannot justify dependent success. Birth uses its separate empty pre/post rules with original absence/admission conserved. Later lawful unrelated receipts do not change the Boot-only commitment, do not invalidate exact pending resolution merely by growing the table, and cannot be discarded. Whole-table snapshots/hashes are transient final guards, not a permanent all-producer freeze.

### Earliest original first-receipt resolution

`storage.boot_recovery.resolve_earliest.v1` accepts exactly a lowercase 64-hex W digest. Authenticate actual selected root/bootstrap/instance and external path, installed roles/canonical hash and original retained MigrationReceipt, complete current floor/anchor, and the entire actual SP-286 custody table through its original owner. Validate every row/key/instance/original-receipt join and unique exact uint64 original sequence, including unrelated rows for current-table admission. Filter native Boot rows only after admission; their exact ID/idempotency/application/v2/barrier grammar binds W and original epoch. Unsupported/malformed Boot history prevents completeness. Select the minimum original sequence, never timestamp, table order, prefix or earliest retained payload.

For Boot rows ordered by original sequence, form canonical MessagePack pairs `[exact_receipt_key, sha256(exact_canonical_custody_value)]`. The durable set hash is SHA-256 of the exact bytes `pm.storage.boot_history.receipts.v1` followed by a zero byte and those encoded pairs. Count/hash excludes unrelated rows; complete current table and byte/membership guards still include them. Current floor/anchor and its exact latest original receipt key/hash must match this set; no historical directory or retained chain is needed.

The result is only original receipt key, event ID, eleven first-AppendReceipt fields, original opaque segment reference and original full-value commitment. Independently capture that complete allowed result from actual admitted selected custody before the first nested copy and compare constructed candidate and final output after all helpers while whole original Store/table/root/birth/permission/activation remain current. It can disclose original identity/receipt metadata after lawful payload and old-source expiry; it claims no body availability, current-source presence, new action authority or read-through coverage. Reads create no checkpoint, event, repair, cleanup or new original result. Body-dependent pending completion still requires current full-event/full-value joins under SP-291.

### Restore, installed-role withdrawal and evidence boundary

Before original BackupVault restore returns anything, independently capture the whole expected restored Store from the actual selected authenticated artifact, with only its admitted settled-restore origin transition. Compare every returned field, receipt, floor, extra-key absence and actual object identity with that expectation, while original selected Store/root/anchor/vault state remains current. Only then reattach to actual current Boot custody. Genuine inner effects are not rolled back for a bad outer return. A matching image may preserve earliest completeness after actual current owner reattachment and external anchor comparison; older/missing custody, absent anchor, unresolved pending origin or unknown history remains unavailable. The anchor never rolls backward to make restored bytes agree. Fresh producer acceptance after restore and native cold-open reconstruction are not proved by this contract's model.

Installation/withdrawal keeps new producer admission, retained aggregate completion, earliest receipt reading and original mandatory-backup/recovery support independently necessary for their actual obligations. Closing new producer admission is not permission to forget original identity/first-receipt history or release unresolved pending custody. A required schema/reader/receipt/coordinator binding remains installed until a verified compatible successor supplies it or actual existing-policy release/deletion removes every dependent obligation. No raw source control, old birth journal, constructor object, old source locator or original executable archive must live forever solely for this contract; current native canonical identity/floor/receipt and actual current owner binding supply continuing authority. Loss stays unavailable; it is not repaired from receipt-shaped data or a new admission flag. Unrelated issuance and independent event/receipt lifetimes remain unchanged.

Validation combines the frozen V5 supplied-owner model and independent correction review: 175 integrated author checks, 13 additional independent checks, and separately 120 unadapted shared checks, totaling 308 in distinct contexts. Canonical metadata binding requires a fresh original root capture after canonical configuration; historical proposal-schema results are not that capture. Six source-positive paths remain supplied-owner fixtures. Native all-absent discovery, original source/result codecs and authentication, actual installed role/migration authority, leases, redb atomicity, frame/CRC/fsync, namespace rename, complete backup enumeration, physical restore and cold-process reconstruction remain NOT_RUN. The application aggregate cardinality adapter is separately unproved. No native, event-depth, Goal/event registry, readiness, WorkNode, NodeSeed or governance clearance follows.

### SP-292 - Boot Earliest Receipt Continuity and Activation

```yaml
plan_unit_id: SP-292
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Original Boot earliest-first-receipt truth is preserved by one current in-root floor,
  one current external anchor and its one protected pending replacement. Exact canonical
  installation and original all-absent birth precede activation; the same original receipt
  transaction advances floor custody before pending-to-anchor completion. Earliest reads
  authenticate complete current custody and return original metadata without checkpoints.
gui_related: false
gui_classification_reason: Defines internal continuity, original installation, pending recovery and historical receipt disclosure without visual presentation.
depends_on: [SP-026, SP-236, SP-237, SP-286, SP-291, CV-339, DL-045]
unblocks: []
acceptance_criteria:
  - Three families/four physical locations retain exact canonical MessagePack floor/anchor bytes; pending is the anchor family's one protected publication replacement, not a separate history family.
  - Identity/operational policy values remain unchanged, and no additional archive, TTL, count cap, staging file or raw-control lifetime is invented.
  - Exact four canonical schema objects and producer/reader/shared roles bind installation before original birth/capture; proposal hashes, aliases or repaired records are never current admission.
  - Original six-way absence, created identity and actual retained coordinator activation receipt prove birth; unknown history cannot become complete from empty scans or restore.
  - Independently derived complete next-floor/pending afterimages join the same original one-member receipt publication and survive all copy/validator/return boundaries.
  - Exact pre/post/birth/rename crash states either resolve original pending custody or remain unavailable while preserving genuine original effects and unrelated progress.
  - Complete actual receipt admission, native W/epoch grammar and Boot-only domain commitment select the minimum original sequence and disclose only exact original first-receipt metadata.
  - Restore derives whole expected Store from authenticated original artifact before helper return; current external anchor never rolls backward and fresh post-restore producer proof remains unavailable.
  - Withdrawal preserves independently required retained read/completion/backup roles until compatible successor or actual release, without retaining original raw controls forever.
  - Distinct integrated/standalone/supplied-owner evidence and every native/physical/current installation gap remain explicit; registry arrays and governance readiness do not change.
validation_surfaces: [Plans/storage_boot_history_floor.schema.json, Plans/storage_boot_history_pending.schema.json, Plans/storage_boot_recovery_control.schema.json, Plans/storage_boot_original_source_contracts.schema.json, Plans/event_append_receipt_contracts.schema.json, Plans/storage_value_registry.json]
risk_class: false_earliest_boot_history_or_lost_original_activation_continuity
reasoning_tier: high
context_scope: boot_first_receipt_continuity_and_pending_anchor
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_boot_history_floor.schema.json, Plans/storage_boot_history_pending.schema.json, Plans/storage_value_registry.json]
node_compile_hint: {mode: bounded_boot_continuity_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - reports/event-authority-20260911/step-08-storage-boot-recovery-validation.md
negative_constraints:
  - Do not fabricate birth from an empty scan, archive all transitions, treat restored pending as live never-committed authority, or roll back the current external anchor.
  - Do not publish helper-derived floor/receipt afterimages, copy after the last guard, accept schema-shaped installation evidence or repair proposal hashes into canonical admission.
  - Do not require raw source/birth controls forever, turn identity metadata into payload/currentness proof, or perform checkpoints/repair during passive earliest reads.
  - Do not infer native source/install/backup/crash proof or change event/Goal registry arrays, existing policy values, readiness, WorkNodes or governance locks.
owner_hints: [Plans/storage-plan.md, Plans/Contracts_V0.md, Plans/Decision_Log.md]
```

ContractRef: ContractName:Plans/storage-plan.md#SP-291, ContractName:Plans/storage-plan.md#SP-292, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/storage-plan.md#SP-026, ContractName:Plans/storage-plan.md#SP-236, ContractName:Plans/storage-plan.md#SP-237, ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/storage_boot_recovery_control.schema.json, ContractName:Plans/storage_boot_history_floor.schema.json, ContractName:Plans/storage_boot_history_pending.schema.json, ContractName:Plans/storage_boot_original_source_contracts.schema.json, ContractName:Plans/storage_value_registry.json
