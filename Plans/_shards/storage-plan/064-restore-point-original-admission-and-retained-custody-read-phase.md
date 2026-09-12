# Shard 064: Restore-point original admission and retained-custody read phases

Source: `Plans/storage-plan.md`

Source lines: L22304-L22485

Source SHA256: `e72da89398067e67dcf3b6650e6769278329504112579bce60e481417e830907`

---

## Restore-point original admission and retained-custody read phases

This NEW technical owner definition under DL-045 is SP-285. It separates original creation/deletion/expiry admission, pending reconciliation, ordinary authenticated retained-row inspection, fresh physical-retirement authority and post-retirement summary/original-result resolution. The retained-reader phase split changes no stored schema, key, checkpoint version, original hash recipe, retention policy, hold kind or event membership. The separately installed pending-deletion recovery route below requires its explicit closed pending dispatch-custody variant in the existing result family; it does not reinterpret older null-custody rows. A current canonical committed companion/result is an owner-admitted value; it is not an instruction to repeat its original transaction. Redb and backup custody do not imply perpetual original per-transaction snapshots.

### Exact transient bindings and explicit callers

| New binding | Input schema and exact ID | Output schema and exact ID | Closed result |
| --- | --- | --- | --- |
| `reader.storage.restore_point_retained_custody@1.0.0` | `Plans/restore_point_retained_read.schema.json#`, `pm.restore_point.retained_read.v1` | `Plans/restore_point_retained_read_result.schema.json#`, `pm.restore_point.retained_read_result.v1` | `retained_native_terminal` for present native expired/deleted custody |
| `reader.storage.restore_point_retained_creation@1.0.0` | `Plans/restore_point_retained_creation_read.schema.json#`, `pm.restore_point.retained_creation_read.v1` | `Plans/restore_point_retained_creation_read_result.schema.json#`, `pm.restore_point.retained_created_read_result.v1` | `retained_native_creation` for present available native creation |

Both are separately installed transient owner adapters, not persisted families or changed checkpoint schemas. Inputs bind actual encoded canonical row bytes/keys/SHA-256, decoded values, Storage/project/point/partition, actual current created and applicable terminal EventRecords/index rows, full SP-278 read token, final examined source boundary, native-issued read lease and actual store-origin resolution. They contain no original E1/B1/E3/B3 transaction object, original creation publication/source/group object, raw original SIR payload, old created checkpoint or caller `already_admitted` flag. Original receipt/input/result members already retained in canonical rows remain exact. `read_through` carries no projector_schema_version and does not certify a stored checkpoint by itself.

These exact current callers explicitly adopt the new retained-present branch:

- SP-281's `consumer.chat.restore_point_created@2.0.0`, `projector.chat.restore_point_created@2.0.0`, `reader.chat.restore_point_history@2.0.0` and `reader.runtime_artifacts.restore_point_record@2.0.0` use retained_creation with `read_purpose=passive_creation` for available native points, or retained_custody for supported present native expired/deleted points. ACD-465 and RAP-059 own their passive presentation. Their old @1 compatibility bindings are not widened.
- SP-268/ACD-464/RAP-058's `consumer.chat.restore_point_deleted@1.0.0`, `projector.chat.restore_point_deleted@1.0.0`, deletion-family history@2.0.0 and `reader.runtime_artifacts.restore_point_deleted@1.0.0` use retained_custody with deleted. The existing SP-274 creation-result dependency is preserved.
- SP-275/ACD-466/RAP-060's `consumer.chat.restore_point_expired@1.0.0`, `projector.chat.restore_point_expired@1.0.0`, expiry-family history@2.0.0 and `reader.runtime_artifacts.restore_point_expired@1.0.0` use retained_custody with expired. Expiry/passive creation gain no SP-274 result dependency.
- The current `reader.chat.branch_from_restore@2.0.0` may consume the available retained_creation evidence only as its creation-custody prerequisite. All existing actual current action preflight remains mandatory; this passive result grants no action, FileSafe or branch authority. Compatibility branch routes remain unchanged and terminal/summary results are not apply authority.
- SP-274/SIR-044's combined available-created/original-result view explicitly selects `read_purpose=original_create_result_custody`, which additionally requires the actual SP-274 canonical row and all retained original result joins. The output binds that purpose and creation_result_ref. Choosing passive_creation cannot obtain original-result replay authority. Source-independent create/delete original-result replay remains with SP-274/SP-272 and SIR-044/SIR-045, using their actual immutable retained row and current disclosure authority without requiring a present point or surviving event.

An unsupported caller/version, unknown native introduction, corrupt terminal status or missing required row is not accepted by these new types through shape similarity. A status outside these new types retains its pre-existing owner predicate; SP-285 neither supplies a corrupt-family completion contract nor retires an independently valid original route. Supported historical introduction and existing SP-269 summary branches remain separate and unchanged. In particular, absent/pending native custody cannot select historical mode. The thirteen summary-codec2 adoptions and three v1-only compatibility fences remain independently mandatory; they do not themselves install these retained-present readers.

### Original admission, new lifecycle admission and pending recovery

Original creation admission retains every SP-281/ACD-465 capture/request/frozen-input/hash, original publication, actual canonical record/companion transaction and three-barrier check, with SP-274 command custody where required. A committed-looking row never substitutes for actual native admission. The following adapters consume actual canonical custody established by those checks; they do not authenticate caller-supplied admission claims.

The explicitly installed `owner.storage.restore_point_lifecycle_from_retained_creation@1.0.0` consumes `reader.storage.restore_point_retained_creation@1.0.0` as the creation prerequisite of a NEW available-to-deleted B1 or available-to-expired E1. SP-268/SP-272 and ACD-464 use `read_purpose=original_create_result_custody` for deletion, preserving the actual SP-274 result dependency. SP-275 and ACD-466 use `passive_creation` for expiry, adding no SP-274 dependency. These are lifecycle-owner calls, not a summary route or passive-reader action grant. All original creation controls were authenticated at creation admission and are not fetched again for the new lifecycle operation.

Before B1/E1 changes status, consume the actual complete retained-created input/output and its current SP-278 lease in the same held transaction as the exact available-point/hash CAS and every fresh lifecycle gate. Deletion still requires its new actual writer/permission/confirmation, complete eleven-class protecting-ref evaluation and genuine new SIR dispatch. Expiry still requires its new writer/maintenance/policy/release/selection and complete eleven-class evaluation. Recheck current registration, installed bindings, origin/backup/migration/access/quarantine, exact rows and complete source frontier through mutation. Freeze expiry's existing `creation_source_admission_ref` as `retained-creation-admission:` plus the canonical JSON SHA-256 of the exact `{binding, family, input, output}` object, with this lifecycle binding, `family=expired` and the actual complete retained-reader input/output; `creation_source_admission_sha256` equals that digest. Independently issued owner resolution, not a repaired hash, authenticates the lineage. No new physical family is created.

Actual original B1/E1 must authenticate all those gates and atomically publish the status-only point transition with its frozen pending operation and required pending command custody before restart can consume them. Creation similarly publishes point, creation intent and SP-274 pending result together. After that lawful publication, the admitted immutable pending rows carry the original admission facts. Restart does not reacquire old B1/E1 transaction observations, eligibility/preflight authority, original creation controls or raw SIR payloads, nor reopen the now-stale available-point lease. It verifies authentic current canonical pending origin and every retained immutable relation instead. Future B3/E3 results are not required at B1/E1; full completed-operation fixtures are static predicate evidence only.

The exact installed recovery bindings are `owner.storage.restore_point_creation_pending_recovery@1.0.0` (SP-281/SP-274/ACD-465/SIR-044), `owner.storage.restore_point_deletion_pending_recovery@1.0.0` (SP-268/SP-272/ACD-464/SIR-045), and `owner.storage.restore_point_expiry_pending_recovery@1.0.0` (SP-275/ACD-466). Creation uses its existing pending schema; expiry uses its existing pending companion. Deletion requires the explicitly admitted closed pending dispatch-custody variant in its existing result family: actual original dispatch ID, original normalized identity/payload digest, genuine nonterminal original SIR outcome and capture provenance, with no terminal response/hash. Older pending rows lacking this custody remain recovery-required; migration cannot manufacture it. No operation is made pending by downgrading a terminal outcome. The first installed pending discriminator is exactly `pm.chat.restore_point_delete_pending_dispatch.proposal.v1` at `Plans/restore_point_deleted_contracts.schema.json#/$defs/pending_dispatch_custody`, with schema_version `1.0.0`. The literal `proposal` segment is preserved from the reviewed schema identity; it does not mean optional or unadmitted behavior after this explicit adoption. `command_result_receipt` and the registered physical value schema select this required pending variant; existing deleted/refused/failed branches retain their exact schemas. No alias, inferred older version or raw-payload reconstruction is allowed.

These three recovery bindings explicitly adopt SP-286/CV-339, including `storage.first_append_receipt.resolve_full_value.v1`, for the original complete EventRecord and exact first eleven-field AppendReceipt. Each remains disabled until its existing pending-owner binding, required dispatch-custody variant where applicable, and this additional full-value resolver dependency are actually installed against the same admitted Storage receipt owner. Installing the shared selector alone does not activate a pending owner or promise recovery for old v1 custody. Before append, authenticate complete current pending rows, immutable capture/frozen producer input, current full source/index and owner admission, and verify the event/scoped identity absent from the complete selected append root. Submit only that frozen input under the existing append writer; do not redispatch, recapture or repeat the status transition. A crash before source publication resumes the same intent. A crash after protected source publication but before receipt issuance uses SP-286's actual current protected-group issuance. A crash after issuance resolves its exact immutable first receipt. Repeated recovery joins the original event and produces no second event. Four-field dedupe, current latest-group metadata, current time and relocated source coordinates cannot reconstruct a receipt. Disposed original append controls need not be reacquired after lawful first-receipt custody exists; current surviving source and full immutable receipt semantics still join.

Terminal staging and final terminal publication each call `storage.first_append_receipt.resolve_full_value.v1` with the actual complete surviving original EventRecord under `Plans/event_append_receipt_contracts.schema.json#/$defs/full_value_request`. Authenticate the closed `#/$defs/full_value_result` against the same actual selected `event_append_receipt_custody.v1` table row: exact typed equality of `first_append_receipt`, `original_segment_ref` and `original_event_value_commitment`, original event/scoped identity, strict issued v2 custody and the full-value commitment over the current complete event. Preserve every original eleven-field receipt value, including original coordinates and time; current relocated coordinates and semantic-only replay cannot supply this proof. Missing, unsupported or exact legacy v1 full-value custody is unavailable: preserve pending recovery state, without fallback, backfill, restamping or inference from current bytes. The thirteen-field immutable point hash and producer-semantic digest remain separate from the full EventRecord commitment.

The already-authenticated pending input and complete current local owner predicate must participate inside the actual shared source installation and receipt-issuance boundary, with the same receipt-owner identity throughout. The shared owner independently enforces its original source, protected group, restore admission and immutable custody predicates. Refused source installation creates no event; a later local issuance or terminal refusal preserves an already lawfully published source and any genuine first receipt. Independent shared issuance and mandatory backup settlement remain lawful even while the local pending owner refuses. Completion after lawful original-control retirement must conserve that exact original event and receipt through a fresh current-owner check.

For creation/deletion, actual SIR uses the retained pending normalized identity and original dispatch ID to produce the original operation's terminal outcome; the dispatcher supplies its original response. Preserve a genuine existing acknowledgement exactly. If the original accepted outcome has no acknowledgement, SIR acknowledges in its actual current recovery frame, never by fabricating an acknowledgement in the original dispatch frame. Bind current target generation, full owner identity, availability, frame and revision. Intermediate staging is undisclosed and disappears on restart. Canonical retained payload digest replaces raw payload reacquisition only in this explicitly installed pending recovery route; normalization/domain hash recipes and all other result joins remain unchanged.

Before a snapshot resolver, candidate copier, row encoder, validator or terminal builder can intervene, derive the complete permitted terminal operation/result values from the actual selected pending rows and actual original receipt custody. Preserve all original operation/request/input/hash/identity and pending command-custody values; overlay only the existing specified terminal receipt, state, result, SIR dispatch-custody/acknowledgement/outcome/response/provenance and terminal-time fields. Bind the complete expected decoded typed values, unchanged physical keys, exact bytes under each existing owner codec, byte hashes and full returned output. A mutually consistent substituted candidate and output cannot replace this independently derived expectation. Creation/deletion require both existing operation and result afterimages; expiry requires its existing operation afterimage only. No new terminal metadata variant, physical family or durable expectation journal is introduced.

Authenticate each pending snapshot against direct actual canonical row keys, decoded values, encoded bytes and checksums, complete current source/checkpoint/index state, independently derived selected token, installed binding and epoch under the actual issued lease. A second matching resolver return cannot authenticate a forged first return. Revalidate that captured actual state and all current admission facts against the actual store at final publication; the final resolver must agree with that independently authenticated state.

Immediately before terminal publication, resolve and compare the actual full-value witness and original receipt again, then perform the complete owner-local final guard over current domain/runtime authority, point, pending operation/result, registration/install/migration/origin/backup/permissions/quarantine and full source/index facts. After all dependent resolvers and candidate validation, a final pure comparison binds complete actual owner identity/authority, stage identity, original-row expectations, candidate keys/decoded values/encoded bytes/hashes, receipt custody and returned output immediately to the single atomic publication. No dependent owner resolver, row encoder or output copier follows that boundary before publication or return; selected pending-row loss must not recreate it from a candidate. Any late change rejects and preserves pending operation/result. A fresh retry uses current legitimate holds/source rather than rolling them back, and preserves the same receipt/event identity. Creation/deletion publish terminal companion and original result/outcome/response atomically; expiry publishes only its companion. B3/E3 preserve the actual point byte-for-byte, including later independently admitted holds. Receipt issuance precedes success; no guessed failure, pending-age cutoff or physical-retirement authority is introduced.

The existing terminal rows need the authentic original public receipt and their existing command/point/SIR/result fields, not a newly reconstructed old source selection, group opening, manifest checksum or original transaction body. The full-value witness does not recreate those disposed controls. Separate initial-admission proofs, settled retained-reader observation shapes and retention-summary authority remain under their existing contracts; this pending-only adoption does not expand them.

SP-286's actual backup/restore authority also governs these callers. Forensic pending backup cannot restore first-issuance authority; mandatory authority backup settles protected-group issuance and retains the first receipt. An old pending operation absent from a restored settled source is not a newly admitted post-restore operation and cannot append without the required fresh owner capability. It remains recovery-required without a new identity, invented receipt or silent redispatch. This bounded refusal does not claim arbitrary rollback recovery.

### Actual current-store authority and final disclosure fence

The native Storage reader must itself open the actual selected canonical store under its current root/maintenance domain, materialized family/version/encoding bindings, completed startup/recovery/migration state, verified coherent backup/restore and native introduction/origin authority. It obtains one real redb/source/access snapshot and an opaque owner-issued lease. Resolve exact current canonical point, required creation/terminal companions and applicable command-result rows from that snapshot. Mere presence in a copied redb file, matching self-generated hashes, a schema ID or a caller packet does not establish admitted origin. No permanent per-row admission journal is invented.

Independently resolve SP-278's entire current root/generation/immutable anchor/advancing frontier/source token, actual complete frame decoding/durability and full row/source coverage before filtering. Surviving created and applicable terminal events must match their exact canonical index rows and immutable original event semantics. Valid nonmatching records still determine the final examined boundary. Original receipt coordinates remain original committed facts and are never rewritten from the current rebuilt/compacted locator. Authenticate the adapter against the actual selected bytes/keys/values and issued snapshot, not against its own repaired digests.

Every change to current family registration, reader installation, supported migration, verified backup/store origin, permissions, quarantine, canonical point/companion/result rows or selected source invalidates the lease or must fail final complete owner revalidation. Bind and recheck all these actual facts together through checkpoint publication and disclosure; checking only the generic token or a snapshot-shaped body is insufficient. The same applies to current access/deletion and independently owned hold changes. A changed fence discards the answer and preserves the prior checkpoint. This final verification uses current owner facts, not retired original admission controls.

### Complete retained-domain joins

Recompute the unchanged SP-281 thirteen-field immutable point hash, excluding status and holds, and verify exact project/point/ref/source boundary/capture time, category-separated created payload and context/provenance set relation, attachments, citations and optional safe-point lineage. Preserve original ordering/normalization meanings. Resolve the exact immutable committed creation companion; validate complete retained command and original digest, frozen append input/digest, identity and equality to the surviving created EventRecord excluding only Storage-assigned sequence/persisted fields. All original stored eleven receipt fields, event/sequence, successful result and original chronology remain exact canonical custody.

For deleted, require the existing actual SP-274 original create-result row with its retained normalized request, original outcome, CV-333 response, full AppendReceipt, original command/frozen/producer hashes and every identity/result/receipt join. Require the full retained deletion operation, preflight/request/frozen-input/hash/identity/result and genuine original succeeded/accepted SIR semantics, not no_op or reconstructed current topology. For expired, require the full original hash-derived operation/event/idempotency, stored eligibility/digest, frozen input/producer hashes, creation-admission identity/companion digest, full committed receipt/result and chronology; physical_retirement_performed remains false in that historical lifecycle result. No SP-274 dependency is added to expiry.

The original stored eligibility/permission/source facts were authenticated at admission. Ordinary later reads do not fetch original release/group/transaction/creation-generation controls, raw dispatch payloads or old before/after point snapshots. Actual retained-row origin and integrity are indispensable: a semantic hash function alone cannot distinguish a forged self-consistent store. Current point holds may legitimately differ while the original immutable capture and terminal status stay fixed. Reading those current holds does not undo the original lifecycle or authorize their release.

Standalone available-created reads apply the same complete retained creation joins without terminal event/companion/result members. passive_creation requires no create-result row. original_create_result_custody requires the actual existing SP-274 row and every original retained request/outcome/response/receipt/result join; SIR/CV-333 alone supply replay semantics. Later row resolution does not recreate original acknowledgement, request, outcome, response or topology and never requires disposed raw original source merely because first capture required it.

Both outputs are passive: no checkpoint/family write, event append, command dispatch, branch/apply/delete, source resurrection, FileSafe/file/Git restore, runtime/queue effect, hold clear or original-command-success publication follows from the result itself. A projector still owns its exact existing checkpoint CAS, birth/history/generation retention and complete source publication. Actions independently rerun every existing current owner preflight.

### Fresh retirement and post-retirement result authority

Physical retirement first resolves the admitted present native expired/deleted custody above, then acquires fresh complete policy/release/age/count/eligible-rank/all eleven protecting-class/writer2/codec/maintenance authority. It uses the same authenticated retained-read lease and snapshot throughout the no-effect custody handoff. Final retirement-owner validation compares complete current selection, release boundary, age/count ordering and every protecting-class evaluation to the captured owner snapshot, or proves their unchanged authoritative revision under the coordinated lease. Late blockers or changed release/selection reject. Revalidate the Storage read owner again after that owner check, before the independent full atomic summary writer gate.

SP-269 still atomically publishes the complete summary and removes only its exact admitted set: one point, required creation companion and at most one deletion or expiry companion, never both or original command-result custody. V1/v2 closed retired-set rules, original hashes/receipts/results, coordinated writer2/codec adoption, mandatory backup and independently canonical later summary authority remain unchanged. This phase adapter itself removes nothing and does not prove native atomic summary publication. Current later holds can block retirement without invalidating passive admitted terminal inspection.

After lawful retirement, SP-269's independently canonical summary and surviving-source predicate remain the terminal traversal authority without removed point/companion/original controls. SP-274/SP-272/SIR original-result replay independently resolves authentic immutable retained command custody and current disclosure policy; expiry's original lifecycle-result route resolves its admitted companion or canonical final summary. Missing required canonical authority is disclosed recovery loss, not a cue to reconstruct from an event, checkpoint or current topology.

Static phase-model evidence preserves all 199 frozen original expiry/deletion admission regressions, adds retained reads after removing all original transaction/control/source objects, and rejects late current-owner/final-retirement changes. Native origin/authentication, frame CRC/sync, redb transaction/CAS, actual reader/migration/backup installation and complete atomic handoff-to-summary execution remain NOT_RUN. The reviewed pending-recovery composition explicitly adopts SP-286 original full-value and first-receipt authority; its bounded validation and exact source pins are recorded in `reports/event-authority-20260911/step-08-restore-full-value-validation.md` and `reports/event-authority-20260911/step-08-restore-full-value-checks.json`. Initial `observed_at_utc` provenance remains NOT_RUN under the original fixture-admission limitation: retaining that field in frozen input neither changes its owner nor proves an observation allocator. Native binding activation, source/SIR authentication, codec/CRC/fsync, concurrent leases, redb atomicity and real restart/whole-root restore remain NOT_RUN; this contract does not clear runtime, depth, readiness or governance gates.

ContractRef: ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-281, ContractName:Plans/storage-plan.md#SP-274, ContractName:Plans/storage-plan.md#SP-268, ContractName:Plans/storage-plan.md#SP-275, ContractName:Plans/storage-plan.md#SP-269, ContractName:Plans/assistant-chat-design.md#ACD-465, ContractName:Plans/Shared_Integration_Runtime.md#SIR-044, DecisionID:DL-045

### SP-285 — Restore-point admission and retained-read phases

```yaml
plan_unit_id: SP-285
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage defines two separately installed transient retained-custody readers for already-admitted
  native restore creation and expired/deleted custody. Complete original creation and fresh lifecycle controls
  apply at their respective original boundaries; ordinary later reads authenticate exact immutable retained canonical
  rows and full current source without disposed original controls. All current callers adopt the exact
  passive types explicitly. Current registration/install/migration/backup/origin/access/quarantine/row/source
  facts remain bound through final disclosure. Physical retirement additionally rechecks fresh complete
  release/selection/all protecting refs in the same lease, followed by Storage revalidation and the unchanged
  atomic summary gate. Pending recovery explicitly installs the SP-286 original full-value resolver at terminal staging and final publication, using the same actual v2 receipt owner.
  New lifecycle B1/E1 consumes admitted retained creation under its exact purpose and fresh gates; installed pending recovery authenticates direct actual rows/source/token and derives complete terminal afterimages before dependent helpers, preserving original receipt custody without disposed original controls.
gui_related: false
gui_classification_reason: Defines Storage custody/read phase and owner verification contracts; existing
  Chat and Runtime Artifacts units own presentation.
depends_on:
- SP-278
- DL-045
- SP-286
unblocks: []
acceptance_criteria:
- Two exact transient input/output schemas and native reader installation are required; no new physical
  family, stored checkpoint version or existing hash meaning is introduced.
- Every original creation/deletion/expiry admission rejection remains enforced; a committed-looking row
  never substitutes for native first admission.
- Available native passive creation needs no SP-274 result; original_create_result_custody and existing
  native deletion require its actual retained row, while expiry gains no new dependency.
- Ordinary later reads succeed only through actual retained-row origin/integrity and complete current
  source after old original transaction/publication/SIR controls are absent; self-issued or transplanted
  rows reject.
- Late registration, reader installation, migration, backup/store origin, access, quarantine, row or source
  changes invalidate the lease or fail complete final owner revalidation; generic-token equality alone
  is insufficient.
- Retirement compares fresh complete selection/release/age/count and all eleven protecting classes under
  the same lease, rechecks Storage after the owner gate and preserves the exact SP-269 atomic set.
- Historical/summary/compatibility and original-result routes retain their separate authority; no passive
  type authorizes actions, event append, hold clear, source revival or command success.
- Each pending recovery binding explicitly installs storage.first_append_receipt.resolve_full_value.v1; staging and final publication authenticate its complete typed witness and original eleven-field receipt against the same actual v2 custody row and complete original current event.
- Missing or legacy v1 full-value witness remains unavailable without semantic fallback, backfill, timestamp inference or receipt restamping.
- Native authentication, CRC/fsync, transaction/CAS, reader/migration/backup installation and full handoff-to-summary
  execution remain NOT_RUN; static phase tests are not runtime or governance clearance.
- New deletion B1 uses original_create_result_custody under SP-268/SP-272/ACD-464; new expiry E1 uses passive_creation under SP-275/ACD-466 and freezes the exact retained-creation admission digest.
- Actual B1/E1 and creation admission atomically publish pending custody before restart; future terminal fixture values are not required at that boundary.
- All three installed recovery bindings cover pre-append, protected-publication-before-issuance and post-issuance crashes using SP-286 and exactly one original event/receipt.
- Final actual full-value resolution precedes complete owner-local domain/runtime/rows/source and pure candidate/receipt checks; stale completion preserves pending rows and retries preserve current holds.
- Snapshot authentication compares direct actual row bytes/values, complete source/index/token and binding/epoch; matching resolver returns cannot authenticate each other.
- Complete terminal operation/result keys, typed afterimages, existing-codec bytes/hashes and returned output derive from actual pending authority before helpers; altered originals or lost selected rows reject without reconstruction.
- Actual shared install/issue jointly checks the complete pending-owner predicate and same receipt owner; later refusal conserves lawful source publication and genuine direct or mandatory-backup first issuance.
- Existing terminal fields suffice; no new terminal metadata variant or old source/group-opening reconstruction is authorized, and initial observation provenance remains NOT_RUN.
- Old pending rows lacking required dispatch custody or fresh restored-root capability remain recovery-required without reconstruction or redispatch.
validation_surfaces:
- Plans/restore_point_retained_read.schema.json
- Plans/restore_point_retained_read_result.schema.json
- Plans/restore_point_retained_creation_read.schema.json
- Plans/restore_point_retained_creation_read_result.schema.json
- reports/event-authority-20260911/step-08-restore-pair-validation.md
- reports/event-authority-20260911/step-08-restore-full-value-validation.md
- reports/event-authority-20260911/step-08-restore-full-value-checks.json
- Plans/event_append_receipt_contracts.schema.json
risk_class: restore_point_admission_retained_authority_phase_confusion
reasoning_tier: high
context_scope: restore_point_retained_custody_read_phases
implementation_surfaces:
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: restore_point_retained_read_contract
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- storage.first_append_receipt.resolve_full_value.v1
- owner.storage.restore_point_lifecycle_from_retained_creation@1.0.0
- owner.storage.restore_point_creation_pending_recovery@1.0.0
- owner.storage.restore_point_deletion_pending_recovery@1.0.0
- owner.storage.restore_point_expiry_pending_recovery@1.0.0
- "retained-creation-admission:"
- reader.storage.restore_point_retained_custody@1.0.0
- reader.storage.restore_point_retained_creation@1.0.0
- retained_native_terminal
- retained_native_creation
- passive_creation
- original_create_result_custody
negative_constraints:
- Do not require disposed original transaction/control/source inputs for explicitly adopted ordinary retained-row
  reads.
- Do not weaken original admission or infer native origin from shape, hashes, absence or an event index.
- Do not treat a passive reader, codec adoption or four-field dedupe locator as action/first-receipt authority.
owner_hints:
- Plans/storage-plan.md
```
