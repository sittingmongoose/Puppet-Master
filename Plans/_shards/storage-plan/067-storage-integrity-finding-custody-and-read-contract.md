# Shard 067: Storage integrity finding custody and read contract

Source: `Plans/storage-plan.md`

Source lines: L22793-L23069

Source SHA256: `6ab46ef95ecc859b6ad97847bd6790722b7f29104e7e44ee60eeb3f49d51b534`

---

## Storage integrity finding custody and read contract

SP-279 defines the new Storage integrity finding capture/custody and passive read contracts under DL-045. Existing Case L-2 / SP-026 / SP-236, SP-278 and SP-286/CV-339 retain their shared authority. This static contract materialization does not establish native execution, event depth, readiness or governance acceptance.

### 1. Membership, owners and unchanged schema

The existing event-family-storage-integrity-detected has revision 2.0.0, application_only scope, and the separately referenced closed payload https://puppetmaster.local/schemas/event_payloads/storage_integrity_detected/2.0.0 at Plans/event_payload_storage_integrity_detected.schema.json. Storage Case L-2 owns byte validation, loss evidence and barriers; Case L-5 owns persistence/normalization; Contracts owns EventRecord and AppendReceipt; Runtime Artifacts RAP-045 owns truthful display. Automated_Testing_System IN-P01..05/IN-N01..05 supplies existing unexecuted oracles. Detection records a finding. It does not truncate, seal, change manifests, exclude ranges, repair bytes, rebuild projectors, clear a block, or advance any checkpoint.

Payload remains exactly its current schema, including seven failure classes, four precision classes and four watermark relations. schema_version=2.0.0 and frame_version=2. No project_id, recovery action, survivor digest, receipt, disclosure flag or repeat_of is added. The finding family and its report-ref resolver below are new technical owner contracts; actual installed adapters remain required before production use.

### 2. Actual byte authority, closed routing and representability

The new producer `storage.integrity_finding_capture.v1` runs only in the Storage validation/recovery coordinator under the actual root identity, aggregate ownership and stable source boundary. Bind storage instance, root generation/fingerprint, manifest precondition generation/hash, and target segment generation/name/state/hash/length before any separately authorized repair. The narrow report-writing capability never authorizes source mutation. Viewer, unsupported, root-mismatch and lost-lock modes cannot persist a finding or append; user approval cannot substitute for this authority.

Adopt the exact current Case L-2 first profile rather than defining another codec. It has the packed 48-byte little-endian prefix, header CRC at +32, payload CRC at +36, prefix CRC at +40, and uint64 sequence at +24. The header is exactly `[1, event_id, event_type, schema_id, schema_version, payload_schema_id, scope_kind, project_id]`. The payload is canonical MessagePack of the complete closed EventRecord with all required-present nulls. Prefix/header/payload CRC32/ISO-HDLC, flags=0, caps, canonical numeric/string/container representation, reader/version dispatch and no generation-1 fallback follow Case L-2 unchanged. The 4 KiB header and 16 MiB inline payload caps are existing transport caps, not numeric-domain changes.

Execute the existing mandatory stages in order: magic; complete prefix and prefix CRC; version/reserved/flags; caps and checked remaining-file bounds; generation and strict sequence; header CRC/decode; payload CRC; identity decompression bounds; full EventRecord/payload schema and scope admission; duplicate header/envelope/prefix identity and persisted-ID checks. A transient observation records the actual first failed stage/code and marks later stages unrun. No caller-provided decoder object, scan digest or all-true witness can replace actual byte validation against independently held original source-owner facts.

Authenticate each predecessor from the actual segment origin through the failed frame boundary. For frame-codec findings, `detection_offset` is that failed frame start; the actual failed check's field position, when trustworthy, belongs to transient check evidence. `last_good_offset` is the verified predecessor end, equal to the failed frame start, or zero only with explicit source-origin proof. Partial prefix bytes may be hashed without trusting any field. A verified prefix CRC may expose actual generation/sequence operands; it does not establish frame-end authority after a generation/sequence failure. The frame end `start+48+header_length+payload_length` is authoritative only after prefix/version/reserved/flags/caps/file-bound/generation/sequence admission. Header intervals require that trusted boundary. Failed header CRC yields no verified identity. Even a successfully decoded header alone cannot establish exact-event loss.

Prove corruption at the failed start before declaring loss. Test a trustworthy computed next boundary through every required stage; otherwise scan actual bytes to the first fully validated candidate or authenticated EOF. Re-decode accepted and rejected candidates on that same path. Magic alone, a suffix hash, matching supplied result or assumed length is not survivor proof. A valid frame or an offset inside an existing frame is not a failed boundary. Unsupported frame/header/envelope/family/reader and unavailable validation/resource authority stop the operation with no finding, event, cursor advance or skip to later supported data. Representation refusal is not source corruption.

The following newly authored DL-045 mappings specialize the existing taxonomy without adding a class or changing its schema products:

| Actual failure | Finding class | Required evidence and precision qualification |
|---|---|---|
| Bad magic/prefix, reserved/caps/file bounds, or generation mismatch | `frame_integrity` | Actual prefix bytes/completed stages; generation mismatch additionally compares CRC-verified prefix generation with the separately admitted selected generation. `exact_byte_range` or `unknown_segment_remainder`; it never proves segment-owner failure. |
| Header CRC/canonical decode/arity/types or duplicated header/envelope identity other than sequence | `header_integrity` | Actual header bytes and, for duplicate fields, completed EventRecord admission. `exact_byte_range` or `unknown_segment_remainder`; no event-ref inference from the failed header. |
| Payload CRC/canonical decode or known envelope/payload/scope admission failure | `payload_integrity` | Actual stored payload bytes and completed prior stages. The bounded detector uses `exact_byte_range`, including `[failed_start, EOF)` after authenticated complete no-candidate scanning. Schema-permitted `exact_event` remains a separate obligation requiring independently verified and corroborated event/sequence identity; this header alone does not provide it. |
| Strict sequence failure, prefix/envelope sequence disagreement, duplicate persisted event ID | `sequence_integrity` | Exact CRC-verified/current decoded operands and the independently admitted prior sequence or actual prior persisted-ID frame as applicable. The bounded detector uses `bounded_sequence_range=[min(operands),max(operands)]`. This conservative disagreement interval neither enumerates IDs nor says every enclosed ID exists or is corrupt. Schema-permitted `exact_event` requires separate complete identity proof. |
| Segment, manifest or watermark control failure | `segment_integrity`, `manifest_integrity`, `watermark_integrity` respectively | Actual corresponding separately owned bytes, controls and comparison evidence. A frame exception, supplied class or supplied watermark relation cannot detect these owner failures. Preserve the exact current schema precision products and CRC exclusions. |

Never enumerate an integer sequence span or allocate proportional to its cardinality. Use exact uint64 interval comparisons for ordering, overlap, holes and coverage; retain the original closed gap-reason/evidence records. Sequence zero is valid data and never an absence sentinel. Missing trustworthy sequence/identity operands produce transient unavailable rather than fabricated endpoints or identities.

Offsets are unsigned source-segment boundaries, with `0 <= last_good_offset <= detection_offset < next_good_offset <= segment_length`. `next_good_offset` is the first fully verified resynchronization candidate start or authenticated EOF. Affected byte intervals are nonempty half-open ranges. For frame/header unknown remainder, use `[detection_offset, segment_length)`, EOF next-good offset and complete no-candidate proof, with no inferred event or sequence identity. The approved payload-EOF and supported sequence-disagreement routes retain their own schema-valid precision; EOF is not a blanket promotion to unknown remainder. Inclusive sequence ranges remain ordered exact uint64 values. At any separately supported exact-event route, unique UTF-8-byte-sorted refs must join complete corroborated event/sequence/source witnesses; advisory index rows are never identity authority.

CRC pairs are required together only when actual stored and computed operands are known and the class permits them. `expected_crc` is the actual stored u32 value; `observed_crc` is computed over the exact required bytes. Prefix CRC uses all 48 bytes with only +40..+43 zeroed, including the other stored CRCs. Range, identity, pair and class/precision constraints supplement the closed schema; JSON shape validation alone cannot establish the relation.

Compute watermark relation only against an independently authenticated same-generation durable watermark with its actual manifest/group authority. Use the four existing relations unchanged. Wholly-above requires that all possibly affected bytes are outside the acknowledged boundary; missing or disagreeing control evidence gives unknown relation and a mutation fence. Testing these range relations does not authenticate the watermark, detect watermark corruption, permit truncation/sealing/repair or clear acknowledged-loss blocks.

The payload requires actual segment identity/hash/state and non-null offsets even for a control-owner failure. If no particular segment or trustworthy bounded source length can be established, this event is unrepresentable: retain fail-closed Storage diagnostics; do not invent a segment, zero hash, project or range and do not widen the event family. Detection records evidence only; the existing recovery owners decide physical action separately.

### 3. Physical finding custody

Define storage_integrity_finding, disk-first canonical metadata at storage/integrity/findings/v1/{storage_instance_path_hash}/{input_sha256}.json. Its exact schema is Plans/storage_integrity_finding_contracts.schema.json#/$defs/finding. The file is immutable and content-addressed by report_sha256=SHA256(canonical_uint_json.v1 finding bytes). The semantic report_ref is pm.storage.integrity_report.v1:{report_sha256}; resolution is through the deterministic finding path derived from integrity_id's input hash, then equality with report hash. It is not a raw filesystem path or a moving URL. File names do not infer retention. storage_instance_path_hash is lowercase SHA-256 of the exact UTF-8 instance ID. Both path components are therefore fixed 64-hex, never raw IDs or user-controlled separators. Resolve only beneath the currently verified root using directory handles and no-follow semantics; reject symlink traversal, root substitution, wrong device/instance or mismatched directory ownership. The report-ref resolver requires the matching event integrity_id to derive the input path and verifies report_ref hash there; it does not scan or guess a path from report_ref alone.

The finding contains only the closed finding input, validation witnesses (hashes, source positions, check results and non-secret semantic refs), and the first frozen producer timestamp. It contains no raw segment/header/payload text, shell output, credentials, decoded message, source path or arbitrary error string. Raw source bytes remain under existing Seglog/backup/quarantine custody, never duplicated into this new family or the permanent event. No new raw-capture family or retention policy is introduced. The validation-witness attestation is produced by the actual owner validator over actual bytes; a caller's all-true witness map is not evidence. Static fixtures only test the relation and cannot prove the attestation.

Write a temporary file in the same finding directory, sync it, promote without replacing an existing immutable finding, sync the parent and read back exact bytes/hash/schema. On existing identity, compare the canonical input and preserved original finding; return original bytes/timestamp/report. Different input at a bound identity is idempotency_conflict. Different attempted first timestamp on retry never rewrites the prior finding. A torn/malformed existing finding is not replaced from guessed data: block and invoke existing Storage recovery/backup custody. Same-directory orphan temps are not visible findings; owner janitor resolves only those proven unreferenced and never erases a prepared unresolved finding just because no event exists.

This family is NEW audit authority/source lineage, not ordinary diagnostic history. Map only to the existing RP-AUTHORITY-INDEFINITE@1.0.0 object: Case L-3 explicitly assigns audit authority/source lineage indefinite retention and IN-P05 requires stable report-backed replay. No TTL, count limit or policy value changes. Storage pressure fails closed. Mandatory canonical backup includes this family and preserves content hashes, pending findings and their dependency order. This is the explicit DL-045 technical class assignment to the existing audit-authority/source-lineage policy. Actual registry/backup/reader installation remains a separate production prerequisite.

### 4. Exact identity and envelope

input_sha256=SHA256(canonical_uint_json.v1 input), where the closed input object is defined in Plans/storage_integrity_finding_contracts.schema.json#/$defs/input. It includes action_kind=detect_integrity, storage_instance_id, root_generation, logical_root_fingerprint, precondition_manifest_generation/hash, target segment identity/hash/state/length, failure class, all offsets, precision, affected range/ref data and durable-watermark proof. Optional current payload fields remain absent when unknown, never defaulted. This fixes the existing action/preimage/range/manifest identity rule with an exact serialization. NEW canonical_uint_json.v1 permits only schema-defined objects, arrays, strings, booleans, null and unsigned integers; keys are sorted by UTF-8 bytes (all schema keys here are ASCII), whitespace is absent, strings escape quote and backslash, use the short JSON escapes `\b`, `\f`, `\n`, `\r`, `\t` for backspace, formfeed, newline, carriage return and tab, and encode the remaining U+0000–U+001F controls as lowercase `\u00hh`. All other Unicode scalars appear as literal UTF-8, including slash and U+2028/U+2029. Every integer is its exact base-10 spelling without exponent or leading zeros. Decoding requires source bytes to equal exact re-encoding; alternative whitespace, key order or escape forms reject. Floats/NaN/infinities, duplicate object keys, invalid UTF-8 and surrogate code points reject. This avoids IEEE-754 rounding of valid uint64 offsets. It is a finding-file serializer, not an alteration of the existing Contracts RFC8785 EventRecord semantic-digest rule. Native interoperability for both boundaries is NOT_RUN. integrity_id=pm.storage.integrity.v1:{input_sha256}. report_ref derives from immutable report bytes, and is excluded from the input to avoid a hash cycle.

New event_id=evt_storage_integrity_{input_sha256}; idempotency_key=storage.integrity_detected:{input_sha256}; replay_policy=dedupe_by_idempotency_key. Existing app-root event-ID and scoped-key indexes remain the only append identity owners. Envelope scope_kind=application, project_id=null and storage partition app. thread/run/node/attempt and account refs are null; affected event refs stay in payload and proven project/run joins are resolved separately with permission, never copied into a fabricated envelope scope. actor_ref is the actual non-secret Storage coordinator principal; no user impersonation. producer_sequence_id=null because there is no documented upstream monotonic finding sequence. occurred_at_utc is the first owner detection time frozen in the immutable finding, not retry or scan-publication time. Correlation is a stable owner capture ref derived from the input; causation_event_id and parent_event_id are both exactly null for this narrow writer, at original admission and historical read. No optional non-null lineage is supported by this finding shape. Existing migration/redaction fields use the current EventRecord contract. observed_at_utc, sequence_id and persisted_at_utc are Storage-assigned; permanent producer semantic digest uses Contracts RFC8785 fields. The entire first semantic envelope is frozen before append.

The input distinguishes changed preimage, range, manifest precondition or failure evidence. A later observation of the identical bound input is the same finding; no repeat_of or timestamp-based fresh episode is invented. Changed precondition forms a new deterministic input and finding, with no claim that recovery happened.

### 5. Producer state and append barriers

Transitions are transient capture -> durable finding -> append pending -> verified event/result. Durable finding plus authoritative event lookup determines restart state; there is no second hidden mutable outbox or receipt family. The permanent finding is both report authority and the recoverable pending obligation. It is discoverable to the restricted coordinator but not presented as an appended EventRecord.

Before capture publication, revalidate source lock/root/boundary after scanning; changed bytes/generation invalidate the capture. After durable report, preserve its original preimage even if separately authorized recovery changes source bytes. A later event truthfully records that original finding. Never re-evaluate it against today's source and silently alter the payload.

The coordinator obtains a Case L-authorized valid append sink without modifying the damaged source itself. When possible acknowledged loss, ambiguous sequence/identity, invalid manifest or an unavailable dedupe store prevents safe append, the finding stays pending and mutation blocked. This producer does not bypass the block, manufacture a healthy segment, invoke recovery, or assume appending a finding is safe. Existing recovery coordination must establish the valid append channel first; circular dependencies are prohibited. Recovery may consume the durable finding directly for evidence, but a sibling boot/recovery contract that requires the actual integrity event must wait for its verified append. Native integration must demonstrate this order; unavailable sink is a supported pending outcome, not append success.

Append as durability_class=barrier under Case L-2 and SP-286/CV-339: actual complete frame write + active-segment sync_all, then actual atomic watermark/manifest promotion + parent directory sync, then durable custody of the first synced AppendReceipt before success. The existing original eleven receipt fields and four-field append result remain exact. Read back selected manifest and original source frame, event identity/digest/payload, finding/report hash and receipt identity/generation/group/offset/durable end. A returned four-field event tuple, timestamps, existing index row or receipt-shaped object is not durability proof. Only that proof releases an appended detection result. This release never clears the global integrity block, authorizes mutation, publishes recovery effects or advances a reader.


The immutable finding is the existing producer's sole recoverable domain pending obligation; it is not the shared first-receipt row or a full-value witness. SP-279 explicitly adopts SP-286/CV-339's strict v2 writer, retained version readers, full-value resolver and settled-backup gate for Integrity-specific producer completion. This is a new technical composition under DL-045. It introduces no new installed completion endpoint, mutable domain terminal row, event/payload/physical family, policy, raw journal or semantic codec.

Before original append, derive every producer-owned EventRecord field from actual admitted immutable finding bytes and fixed owner constants. Preserve the original actor/time, exact input and event identities, and required-present nulls. Independently fix this complete projection before any copy, validator or source helper; sequence_id, observed_at_utc and persisted_at_utc remain Storage's three original assignments. The actual recovery coordinator must admit the safe append sink and the same original append owner under current root, installation, access/deletion and maintenance authority. A public flag, copied owner or matching hash is no grant. Complete source/dedupe absence remains necessary for fresh append. The final source publisher conserves every previously admitted event and the complete ordered sequence-gap/evidence values; ordinary append or relocation cannot drop or rewrite gap authority while preserving only event bytes.

Original source publication and first receipt issuance use the same actual shared owner, with the complete original-owner and Integrity guards held through their respective final publications. Independently retain exact expected source/issuance values before returning helpers, then compare the entire candidate after all helpers and validators. Preserve the original eleven-field AppendReceipt and four-field append result exactly. A later Integrity refusal does not undo an already lawful shared source publication, receipt transaction or shared backup artifact; it withholds only the not-yet-authorized outer result. Missing or ambiguous first issuance stays pending, with no duplicate append or invented acknowledgement.

Producer completion and settled response retry require the genuine current complete EventRecord under the full current SP-278 source/token, the exact admitted finding, and the actual retained v2 custody. Compare the entire producer projection with the finding and open that current event through storage.first_append_receipt.resolve_full_value.v1 on the same actual shared owner. Require its exact three-field witness to equal the actual canonical custody projection: all eleven original receipt fields, original opaque segment ref and original-event value commitment. The commitment authenticates Storage's three assigned fields as well as the frozen producer input. At return, recheck the same owner, complete current source/token, actual selected finding/event, installation/access/deletion snapshot and exact whole output after the last resolver/copy. A missing current event or v2 witness is unavailable completion; legacy semantic replay cannot backfill or replace the full-value route.

After genuine first issuance, lawful disposal of original damaged-source or append controls does not require reacquiring them for completion from the surviving current event, permanent finding and retained full-value custody. This producer completion route remains distinct from the existing receipt-independent passive historical reader. Passive inspection can disclose a verified current detection without an issued receipt and cannot certify issuance, authorize recovery, advance a checkpoint or stand in for completion.

Aggregate backup invokes the actual shared settled-backup gate, verifies the returned token against the exact current shared owner snapshot, and binds genuine finding bytes and current source under the same outer fence. If shared settlement succeeds before outer refusal, preserve that lawful receipt/artifact but publish no aggregate finding backup. An authentic aggregate saved before original-control disposal can later restore exact issued pending-response custody. The current shared backup path still requires its actual original controls for a fresh capture; unavailable controls cause refusal before reacquisition, not a claim of successful new backup.

Restore authenticates the selected actual aggregate token, original vault and complete original artifact. Before invoking the vault's returning restore helper, independently derive the exact entire typed expected Store state from that authenticated artifact with only the existing required settled-restore origin transformation. Immediately validate the returned Store against that expectation; after every remaining validator/copy, require the same returned object and complete expected state together with exact finding/source/root/binding values and original aggregate currentness before admission. Do not learn the expected state from the unchecked returned Store. Finding-only restored work has no fresh-append grant from its mere presence or a domain sink flag: without actual SP-286 restore-coordinator admission it stays pending. No new restored-root first-mint path is supplied here.

Crash before finding durability returns no durable detection success. After finding, retries reconcile authoritative dedupe/source state. Valid unacknowledged frames may be adopted only by existing Case L recovery; ambiguous append stays pending and fenced. Once the semantic event may exist, no duplicate append and no report rollback. Same identity/same producer semantic digest returns original event/result; mismatch conflicts. If canonical evidence cannot distinguish absence from incomplete indexing, do not append on absence-from-index. Closed source segments remain immutable throughout.

### 6. Consumers and checkpoint dependency

NEW storage.integrity_history_reader.v1 supplies read-only Runtime Artifacts and History/Ledger detection joins. A separate live Storage admission/recovery coordinator consumes canonical findings and owner recovery state, never a UI projection. Detection consumers do not execute recovery, restore, truncate, clear fences, call providers, charge usage, emit events or trigger another integrity detector by replay. This exact reader owns no checkpoint advance; its ephemeral examined boundary is not a durable effect attributed to the detection payload.

Canonical SP-278 owns event_record_index_checkpoint.v1:{storage_instance_id}, its actual selected generation and complete all-scope index dataset. This reader adopts the exact Plans/event_record_index_checkpoint.schema.json#/$defs/read_token: complete current root/generation/anchor/frontier/source selection plus actual redb_snapshot_id. An index row's immutable publication locator binds the generation birth anchor; separately validate CURRENT/manifest/source control bytes, recovery epoch, complete retained inventory/gaps, synced watermark coverage, all-scope row count/hash and advancing frontier. A same-generation nonmatching append invalidates the old full token. The reader never owns a generic checkpoint write or a filtered durable cursor, so no integrity-specific checkpoint family is introduced.

The bounded request binds the exact consumer storage.integrity_history_reader.v1, storage instance, application scope, request ID, explicit page size, original filter and access/deletion epochs. Traverse every examined global source event, including nonmatches, before filtering. Pagination is ephemeral and requires the actual token issued by this reader under the identical request, maintenance lease, root and read snapshot, full generic token, access/deletion epochs and exact prior global event/sequence boundary. An unissued caller token or a token for another snapshot cannot skip into a new generation or fabricate coverage. Continuation custody is transient reader-session state, never a new durable family. The result names only the actual examined extent and carries no owned durable or generic-checkpoint effect.

For every accepted index candidate, verify the shared checkpoint, CURRENT-selected generation, source-locator generation/offset, V2 frame bounds/CRC/schema, envelope scope, sequence/event identity, payload hash and producer semantic digest. In one actual read fence, resolve the immutable finding file at its exact verified-root relative path, source bytes and hash, and bind input identity, all payload fields and the event's first frozen actor/time/owned semantics. Revalidate the same root/source/access/deletion/lease snapshot before returning the exact passive result. Resolve report_ref to the immutable finding, verify its actual bytes/content hash/input hash, exact field mapping and original owner witness binding; recompute identity. Independently check event payload/envelope version, redaction/migration and retention policy. Projections/advisory index cannot overrule source or finding. All required original generation refs resolve through approved relocation/compaction maps; a stale physical cursor is never applied to another generation.

Under the same storage maintenance/read fence and access/deletion snapshot, publish only the read-only result for the verified source extent and the named consumer request. Revalidate source generation, root instance/generation, CURRENT/checkpoint/survivor digest and access epoch before return. A changing snapshot retries or reports unavailable. A retained event whose mandatory permanent report is absent/corrupt is unavailable authority, not a healthy finding or permission to reconstruct the report from an advisory index. Original source damaged bytes may later be retired under their own authorized policy: the permanent content-free finding remains historical evidence and does not claim those raw bytes remain available or that a native validator reran.

Runtime Artifacts preserves application scope and resolves affected identities only where proven and currently authorized. Do not add project/run refs forbidden by the payload. A project-filtered view cannot expose unrelated application metadata or suppress an unresolved root-wide integrity condition by assuming it belongs to another project. Unknown/mutation-authorizing/acknowledged loss cannot render healthy; use existing freshness current|refreshing|stale and health healthy|degraded|unavailable. Detection alone cannot claim repaired, recovered or current full projection coverage. Disclosure distinguishes exact event/byte, bounded sequence and unknown remainder; sibling recovery evidence is separately checked before any recovery statement.

### 7. Permissions, deletion, redaction and backup

Root-local finding scan is restricted to the owning Storage process/current authorized reader. Reject raw path or credential-like semantic refs before durable report/event append using the existing reject_unhandled_secrets profile. Hashes are not a license to export raw bytes. Viewer reads use the owner's frozen manually refreshed supported snapshot; root mismatch/unavailable/newer schema returns existing blocked/metadata-only posture. Permission changes between lookup and return withdraw the result. Open/export routes revalidate permission/FileSafe and no raw evidence is copied into a durable artifact implicitly.

Application findings and events do not become owned by the currently selected project and project deletion does not purge them. Affected event/project detail links obey current deletion and authorization; retain content-free audit identity while suppressing deleted/inaccessible detail. Report content excludes source message bodies and arbitrary paths, so this permanent class does not silently retain raw content through project deletion. Canonical restore includes findings and event/dedupe boundary together; it does not regenerate a missing permanent finding from a projection. Loss of either required side is a disclosed integrity/recovery failure.

### 8. Compatibility and withdrawal

Current producer emits only payload 2.0.0 and EventRecord 2.0.0. Existing MIG-STORAGE-INTEGRITY-DETECTED-PAYLOAD-001@1.0.0 and storage_integrity_detected_v1_upgrade_unresolvable govern v1; no defaults for missing identity/ranges or in-place rewrite. A legacy normalized event may be inspected only with its verified original bytes and declared compatibility outcome. The new report family cannot retroactively claim custody for predecessor report refs. Missing legacy report evidence is typed unavailable; no fake finding backfill and no new event.

StorageMigrationCoordinator alone installs the new family/schema and backup/reader bindings under actual registered migration graph and ceilings; no production store version integer is allocated here. Current values are validated before writer admission; no lazy migration. Withdrawal stops new captures, drains/reconciles pending findings without deleting them, and keeps audit read/recovery support or installs a verified successor that preserves original identity/hash/event joins. Disabling a reader discards its ephemeral tokens and does not delete canonical events/findings or shared checkpoints. Policy/catalog objects, registered event denominator and governance artifacts remain unchanged.

### 9. Exact new family and registry structural extension

Register `storage_integrity_finding` with storage_kind `canonical_file`, encoding `json_canonical`, authority `canonical_non_rebuildable` and recovery strategy `restore_from_mandatory_backup`. The `canonical_file` storage-kind member and this one finding family are explicit new technical registrations. Existing family objects, retention policies, event families, critical/MVP membership and buildability/governance gates are preserved. The exact closed finding/input/witness shapes are in `Plans/storage_integrity_finding_contracts.schema.json`; `Plans/storage_integrity_finding_contract_fixtures.json` provides compact static fixtures. Physical registry materialization does not establish installed file, backup, migration or reader support.

Retention selection resolves the row's exact RP-AUTHORITY-INDEFINITE@1.0.0 mapping from the installed catalog under the same policy/hold/maintenance snapshot. Missing row, unknown version or changed policy hash fails closed before claiming custody support. Since expiry_action=none and max_cardinality=null, neither completion, a hold clear nor age makes a finding deletable. Existing legal/recovery/backup/live-reference holds compose by union and are preserved; no new hold kind or automatic release is invented. Backup/relocation/restore copy exact immutable bytes and refs under the existing aggregate maintenance lease and verify them before switching root authority. An unregistered disk-first family cannot be silently ignored by backup enumeration or janitor; production admission requires explicit adapters and tests.

### 10. Exact numeric boundaries and implementation qualification

The finding-file/input serializer `canonical_uint_json.v1` is a new boundary for this one schema. Its full uint64 domain and exact decimal spellings do not alter Contracts RFC8785 producer-semantic digest rules or the canonical MessagePack profile. Full frame generation/sequence uint64 values outside the producer-semantic projection can be checked independently from a finding payload that itself contains values above 2^53.

A conforming production implementation must preserve the existing event semantic projection. The inherited generic fixture adapter has only an ASCII/safe-integer subset; it does not establish RFC8785 admission for the two full-u64 finding-payload disagreement cases. Those cases prove actual capture and exact finding-file codec only; downstream semantic digest/append/receipt/history are `NOT_RUN_NO_CONFORMING_FIXTURE_ADAPTER`. Do not invent a replacement hash adapter, round values, add a 53-bit product limit or claim the generic fixture constructor admits arbitrary canonical values.

The permanent finding remains the unchanged closed schema. Transient wire observations can express unavailable prefix/header/end authority, first failed checks, actual candidate path, CRC operands and conservative sequence witnesses; they introduce no durable scan journal, raw-byte report family or new lifetime. Authenticate the separate original source owner before and after capture and before immutable publication. Historical reads require the admitted permanent finding and complete current source/index/access fence, not a rerun of disposed raw bytes.

Native segment/manifest/watermark detectors, source/root/manifest/watermark authentication, actual file/directory durability, redb/CAS, fd/lease exclusion, safe sink, first receipt issuance, shared full-value adoption, crash/recovery/restore/migration and installed reader/UI behavior remain separate implementation obligations. A canonical normative rule, a schema materialization and a passing bounded static test are three different claims. None alone is event `DEPTH_PASS`, physical readiness, WorkNode admission or governance seal.

### 11. Bounded validation and outstanding authority

The reviewed actual-wire successor records 407 bounded static checks: 102 actual-byte/capture, 56 supplied-owner/reader, 126 unchanged codec vectors, 93 inherited checks and 30 independent controls. Inherited checks retain their original scope and do not make the predecessor synthetic frame into actual-wire evidence. This inventory and its exact source pins are recorded in `reports/event-authority-20260911/step-08-integrity-wire-validation.md` and `reports/event-authority-20260911/step-08-integrity-wire-checks.json`. The two full-u64 finding-payload paths remain capture/file-codec evidence only; exact_event corroboration, the three separate control-owner detectors and all native obligations above remain unproved. Static checks do not execute the native IN oracles or establish DEPTH_PASS.

The separately reviewed Integrity full-value successor supplies the explicit producer composition in §5, with 371 scoped author checks and 137 bounded independent correction checks recorded in `reports/event-authority-20260911/step-08-integrity-full-value-validation.md` and `reports/event-authority-20260911/step-08-integrity-full-value-checks.json`. The report preserves the failed predecessor restore and gap-conservation findings and their corrected scope. Shared source adapters remain supplied-owner fixtures; no capture, current schema check or matching receipt upgrades them into native wire/durability/authentication proof. Existing passive paginated history remains independently preserved. Fresh backup after original-control retirement and finding-only restored fresh append without the actual shared coordinator remain unavailable under the declared unchanged prerequisites.

ContractRef: ContractName:Plans/storage-plan.md#SP-026, ContractName:Plans/storage-plan.md#SP-236, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/Runtime_Artifacts_Panel.md#RAP-045, ContractName:Plans/Decision_Log.md#DL-045, SchemaID:https://puppetmaster.local/schemas/event_payloads/storage_integrity_detected/2.0.0

### SP-279 — Storage integrity finding custody and checkpoint-free read

```yaml
plan_unit_id: SP-279
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The existing application-only storage.integrity_detected event adopts current Case
  L-2 actual whole-frame validation and exact closed class/precision routing, backed by one immutable
  canonical finding preserving actual original source, first failure/candidate proof, input and first
  actor/time. The exact checkpoint-free storage.integrity_history_reader.v1 independently joins the
  admitted finding, full current SP-278 source/token and current access/deletion fences; historical
  reads do not reacquire lawfully retired damaged bytes or original append controls. Native owner/durability
  proof, three control-owner detectors and the full-u64 finding-payload semantic adapter remain separately
  unproved. Producer completion explicitly joins the actual finding, complete current event/SP-278 token
  and original SP-286 v2 full-value custody; final append/relocation conserves original gap evidence, and
  restore authenticates the complete artifact-derived Store before admission. No detection authorizes
  recovery or checkpoint effects.
gui_related: true
gui_classification_reason: Runtime Artifacts and History display application scope, exact loss precision
  and truthful degraded or unavailable health from these verified read-only joins.
split_recommended: true
split_reason: Finding capture/custody is independent of the shared-index-backed read-only publication
  dependency; native proof remains separate from schema materialization.
depends_on:
- SP-026
- SP-236
- SP-237
- SP-241
- SP-278
- SP-286
- CV-309
- CV-318
- CV-339
- DL-045
unblocks: []
acceptance_criteria:
- Adopt exact Case L-2 48-byte prefix, CRC offsets +32/+36/+40, eight-element header and whole EventRecord
  MessagePack; do not retain synthetic +24 CRC or missing-wire framing.
- Authenticate predecessors, first failed stage and every accepted/rejected candidate from actual
  bytes; unsupported or resource stops produce no finding, cursor or skip.
- Apply newly adjudicated class routing and exact uint64 conservative interval bounds without enumeration,
  inferred identity, coalesced evidence or numeric-domain changes.
- Keep segment, manifest and watermark detection dependent on their actual separate owner controls,
  and exact_event on corroborated identity beyond a header.
- Preserve the full closed finding/input/witness schema, exact canonical UInt file bytes, first actor/time
  and null causation/parent at initial and historical admission.
- Register the sole storage_integrity_finding canonical_file family with the exact finding schema; preserve
  existing family/policy/event objects, critical/MVP arrays and governance gates.
- Use existing RP-AUTHORITY-INDEFINITE as an explicit technical source-lineage class assignment with
  exact mandatory backup, hold, migration and withdrawal custody.
- Keep durable finding pending until actual safe source/manifest barriers and first-receipt custody
  establish completion; no duplicate append, repair or report rollback.
- Qualify shared original full-value custody adoption as a separate Integrity-specific prerequisite;
  old receipt-shaped/static capture values do not prove it.
- Bind passive reads to exact current source/token, canonical finding and current access/deletion/maintenance
  snapshot; pagination is issued within that same snapshot and examines nonmatches globally.
- Keep the two full-u64 finding-payload cases at capture/file-codec evidence only until a conforming
  existing RFC8785 semantic adapter is available; no replacement hash or 53-bit cap.
- Qualify ATS IN-P04 by actual authenticated class/operands and retain IN-P03 complete identity proof
  as NOT_RUN; separate normative text, bounded static evidence and native evidence.
- Explicitly complete and retry through the same actual shared full-value owner, complete current
  source/token and exact immutable finding; recheck the whole original witness and result after helpers.
- Independently conserve complete original ordered gap/evidence values at ordinary append and relocation
  publication; event-byte preservation or a self-consistent rebuilt candidate alone is insufficient.
- Derive complete expected restored Store state from the authenticated selected artifact before the
  restore helper; check its entire returned state and final same-object custody, preserving lawful earlier effects.
- Preserve receipt-independent passive history, saved aggregate restore after original-control disposal,
  and pending finding-only restore without actual shared fresh-operation admission; no new first-mint path.
validation_surfaces:
- reports/event-authority-20260911/step-08-integrity-full-value-validation.md
- reports/event-authority-20260911/step-08-integrity-full-value-checks.json
- Plans/storage_integrity_finding_contract_fixtures.json
- reports/event-authority-20260911/step-08-integrity-wire-validation.md
- reports/event-authority-20260911/step-08-integrity-wire-checks.json
- Plans/storage_integrity_finding_contracts.schema.json
- Plans/event_payload_storage_integrity_detected.schema.json
- Plans/event_record.schema.json
- Plans/storage_value_registry.schema.json
- Plans/storage_value_registry.json
- Plans/Automated_Testing_System.md#storage-boot-integrity-and-recovery-owner-oracles
risk_class: integrity_evidence_authority_or_crash_duplicate_or_false_recovery
reasoning_tier: high
context_scope: storage_integrity_detected_only
implementation_surfaces:
- Plans/storage-plan.md
- Plans/storage_integrity_finding_contracts.schema.json
- Plans/storage_value_registry.schema.json
- Plans/storage_value_registry.json
node_compile_hint:
  mode: storage_integrity_finding_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/storage-plan.md#case-l-2-seglogframev2-acknowledgement-corruption-and-crash-convergence
- Plans/storage-plan.md#case-l-3-retention-holds-compaction-deletion-and-quarantine
- Plans/Contracts_V0.md#durable-append-receipt-and-storage-recovery-events
- Plans/Automated_Testing_System.md#storage-boot-integrity-and-recovery-owner-oracles
- Plans/Runtime_Artifacts_Panel.md#RAP-045
- Plans/storage-plan.md#SP-026
- Plans/storage-plan.md#SP-286
- Plans/Contracts_V0.md#CV-339
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- storage.integrity_detected
- application_only
- integrity_id
- report_ref
- impact_precision
- unknown_segment_remainder
- RP-AUTHORITY-INDEFINITE
- canonical_file
- SP-278
- NOT_RUN
negative_constraints:
- No new event family, payload widening, product retention default, fake source identity or detector-owned
  recovery effect.
- No index-as-authority, detector checkpoint advance, append success without actual barriers, or project-scope
  invention.
- No raw bytes or secret-bearing source content in the new permanent report.
- No shared checkpoint copy, native proof, WorkNode, readiness, closure or governance seal claim.
- No inference of segment/manifest/watermark detection from a frame exception or supplied class.
- No numeric-domain narrowing, huge sequence enumeration, unsupported-candidate skip or shared full-value
  adoption claim from old captures.
compatibility_only_notes:
- v1 uses the existing exact migration rule or storage_integrity_detected_v1_upgrade_unresolvable;
  predecessor report refs do not establish new finding custody.
stale_retired_dispositions:
- Gen1 frame writing and timestamp checkpoint authority remain retired under Case L.
- Integrity v3 synthetic 8192-byte source and +24 CRC fixture, missing-wire assertion and header-only
  original decoder witness are predecessor lineage only; current Case L-2 wire contract and actual-byte
  successor take precedence.
owner_hints:
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Runtime_Artifacts_Panel.md
```


<a id="platform-capability-decision-custody"></a>
