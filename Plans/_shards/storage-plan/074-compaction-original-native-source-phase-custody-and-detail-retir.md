# Shard 074: Compaction original native source, phase custody and detail retirement

Source: `Plans/storage-plan.md`

Source lines: L23579-L23786

Source SHA256: `6ab46ef95ecc859b6ad97847bd6790722b7f29104e7e44ee60eeb3f49d51b534`

---

## Compaction original native source, phase custody and detail retirement

SP-295 through SP-297 give the existing `storage.compaction_lifecycle_changed` operation exact native source/control, original phase-effect, result and detail-retirement contracts. `Plans/storage_compaction_native_contracts.schema.json` is the closed shape owner. The five `Plans/storage_compaction_contracts/{identity,methods,phases,guards,effect-methods}.json` resources define the exact identity recipes, original methods, phase graph, semantic guards G01–G32 and effect-to-method bindings. The separate exact-byte `detail-policy.json` resource binds the registered DL-049 policy object. These resources are required together; shape validation does not establish original ownership, source validity, native durability, installed authority or a phase postcondition. The existing event row, payload schema, two action domains, eight phases, first-receipt/full-value formats, SP-278 checkpoint schema and five-kind maintenance-history family remain their existing contracts.

### Original role, codecs and physical membership

The new native source role is exactly `storage.compaction.native_source.v1`. Its declared producer, reader, reconciler and detail-retirement roles are `storage.compaction.lifecycle.producer.v1`, `storage.compaction.native_read.v1`, `storage.compaction.reconcile.v1` and `storage.compaction.detail_retire.v1`. The actual selected Store, StorageMigrationCoordinator installation, original root/instance, namespace, index/database, maintenance and sequence owners must participate under current writer/access authority, aggregate lock and the single maintenance lease. The `installed_role` value is an observation of that original installation. Copied values, class identity, `source_adapter_kind`, equal hashes, unsupported-role fallthrough or a caller-supplied installation receipt cannot create membership. Original single-segment roles keep their original dispatch and formats; this new role cannot silently use an old factory, inferred initial source, copied namespace or a restored pending identity as fresh admission.

The installed graph binds exact bytes of this native schema, `Plans/event_record.schema.json`, `Plans/event_record_index_checkpoint.schema.json`, `Plans/event_append_receipt_contracts.schema.json`, identity and method resources, and the exact `RP-COMPACTION-DETAIL-7D@1.0.0` object. Its `schema_sha256` keys are exactly `native-contracts`, `event-record`, `event-index-checkpoint` and `event-append-receipt-contracts`; its other named hash fields retain their closed schema names. The detail-policy hash is SHA-256 of the exact UTF-8 bytes of `Plans/storage_compaction_contracts/detail-policy.json`, whose decoded object must equal the registered policy object. `installed_contract_sha256` is exactly `HMP` of the four-field binding object containing `schema_sha256`, `method_contract_sha256`, `identity_contract_sha256` and `detail_policy_sha256`; it excludes itself and every later owner/receipt field. The actual admitted package graph must additionally bind the phases, guards and effect-methods resources. That seven-resource digest alone does not prove the complete graph or installation. Actual install/running-selection and complete pending/read/backup obligations must be authenticated through the existing migration coordinator before birth and remain current through each publication or disclosure. No Platform package-support map is adopted, no migration edge or generic capability service is created, and a declarative resource hash does not attest native installation.

Let `MP` be the unchanged Case L-2 canonical MessagePack codec: byte-ordered UTF-8 string map keys, minimal permitted encodings, preserved value types, no normalization, duplicate keys, trailing values or unadmitted binary/extension/timestamp tags. Native unsigned values are exact uint64, never Boolean, floating-point or values rounded through binary64. Schema `integer` validation alone does not enforce that rule. `H` is lowercase SHA-256 over exact bytes, `HMP(x)=H(MP(x))`, and `HUTF8(s)=H(UTF8(s))`. Raw native-file hashes, existing SP-278 binding digests and EventRecord/RFC8785 semantic hashes have separate domains and must not substitute for one another. Unsupported exact numeric routes remain unavailable without reducing the product's numeric range.

The sixteen exact physical families below are canonical, non-rebuildable and require coherent backup under their existing boundary rules. The complete closed schema for each is its named definition, including reachable dependencies; there is no generic detail union wrapper on disk.

| Family | Native location | Definition / policy |
|---|---|---|
| `seglog_current` | `storage/seglog/CURRENT` | `current`; `RP-AUTHORITY-INDEFINITE` |
| `seglog_manifest` | `storage/seglog/manifest.v1.msgpack` | `manifest`; `RP-AUTHORITY-INDEFINITE` |
| `seglog_sequence_allocator` | table `seglog_sequence_allocator.v1`, UTF-8 key `seglog_sequence_allocator.v1:{storage_instance_id}` | `sequence_lease_control`; `RP-AUTHORITY-INDEFINITE` |
| `storage_pending_generation` | table `storage_generation_control.v1`, UTF-8 key `pending_generation.v1:{storage_instance_id}` | `pending`; `RP-AUTHORITY-INDEFINITE` |
| `storage_active_generation` | same table, UTF-8 key `active_generation.v1:{storage_instance_id}` | `active_generation`; `RP-AUTHORITY-INDEFINITE` |
| `storage_compaction_journal` | `storage/seglog/compaction-{operation_digest}.intent.msgpack` | `journal`; `RP-COMPACTION-DETAIL-7D` |
| `storage_compaction_survivor_map` | detail kind `survivors` | `survivor_artifact`; `RP-COMPACTION-DETAIL-7D` |
| `storage_compaction_removal_map` | detail kind `removals` | `removal_artifact`; `RP-COMPACTION-DETAIL-7D` |
| `storage_compaction_translation_map` | detail kind `translation` | `translation_artifact`; `RP-COMPACTION-DETAIL-7D` |
| `storage_compaction_core_descriptor` | detail kind `core` | `core_artifact`; `RP-COMPACTION-DETAIL-7D` |
| `storage_compaction_candidate` | detail kind `candidate` | `complete_candidate`; `RP-COMPACTION-DETAIL-7D` |
| `storage_compaction_carrier_snapshot` | detail kind `carrier` | `carrier_artifact`; `RP-COMPACTION-DETAIL-7D` |
| `storage_compaction_index_snapshot` | detail kind `index-snapshot` | `index_snapshot_artifact`; `RP-COMPACTION-DETAIL-7D` |
| `storage_compaction_target_manifest_snapshot` | detail kind `target-manifest` | `manifest`; `RP-COMPACTION-DETAIL-7D` |
| `storage_compaction_terminal` | table `storage_compaction_terminal.v1`, UTF-8 key `storage_compaction_terminal.v1:{HUTF8(storage_instance_id)}:{operation_digest}` | `terminal_map`; `RP-AUTHORITY-INDEFINITE` |
| `storage_compaction_retirement_intent` | `storage/seglog/compaction-{operation_digest}.retire.msgpack` | `detail_retirement_intent`; `RP-AUTHORITY-INDEFINITE` |

Each ordinary detail path is `storage/seglog/compaction-{operation_digest}.{artifact_kind}.{artifact_ordinal_20}.msgpack`, using its exact kind and a zero-padded twenty-digit unsigned decimal ordinal. Journal uses its special intent path. The actual original slot allocation and namespace owner choose the object; filenames or path prefixes never establish authority. Live manifest and target-manifest snapshot intentionally share `pm.storage.seglog_manifest.v1@1.0.0` and exact bytes/schema shape where applicable, while original physical membership and retention role remain distinct. Phase proofs and effect results are inline journal values, not additional untyped files. Current controls may change only through their original semantic replacement or pending-clear transaction; the indefinite policy does not archive every overwritten live preimage. Historical publication snapshots belong to the separately protected detail families. The retirement intent has no age expiry and clears only after its original completed handoff in SP-297.

Native segment transport remains under Case L/SP-286. Actual names use `seg-{generation_at_least_6_digits}-{first_sequence_20}.active`, `.opening`, or `seg-{generation_at_least_6_digits}-{first_sequence_20}-{last_sequence_20}.seglog`; full uint64 generations are allowed. Namespace intent and original registered physical identity establish membership, never the name. An active-to-closed rename preserves exact bytes and original receipt coordinates through the authenticated namespace mapping. Source segments, current index datasets, original receipt/dedupe rows, installation observations and decoded read views do not become new detail families.

### Original admission, immutable identity and attempts

Before allocating any nonce, target or journal, the original maintenance owner resolves the incoming command/evaluation identity and semantic digest against complete actual live journals and minimum terminal mappings. Same original identity and digest rejoins its original operation/result; changed digest conflicts; unavailable lookup authority is unavailable. An absent index entry, expired detail or absent UI row is not proof of a new operation. Manual admission retains the actual dispatcher identity/ref, actor and exact command correlation for the existing request `{storage_instance_id, retention_policy_ref, reason?}`. Automatic admission retains the actual Storage principal and evaluation identity. This adds no compaction permission token, force/retry argument or public bypass.

At first durable admission the original owner allocates one 32-byte cryptographic nonce, encoded as 64 lowercase hexadecimal digits. The exact recipes in `identity.json` use these prefixes:

- `operation_digest = HMP(["pm.storage.compaction.identity.v1","1.0.0",storage_instance_id,operation_nonce])`; `compaction_id = "pm.storage.compaction.v1:" + operation_digest`.
- `transition_digest = HMP(["pm.storage.compaction.transition.v1","1.0.0",compaction_id,ordinal,predecessor_transition_id,from_phase,to_phase])`; transition ID is `pm.storage.compaction.transition.v1:{transition_digest}`. Initial preparing has ordinal zero and null predecessor/from. Later ordinals increase without reuse or wrap, and identify a reservation from the last actually proved edge.
- Each planned effect has ID `pm.storage.compaction.effect.v1:` plus `HMP(["pm.storage.compaction.effect.v1","1.0.0",compaction_id,attempt_ordinal,effect_ordinal,effect_kind])` before that exact original effect. Each artifact ref is `pm.storage.compaction.artifact.v1:` plus `HMP(["pm.storage.compaction.artifact.v1","1.0.0",compaction_id,artifact_kind,artifact_ordinal])`.
- Target selection is `pm.storage.selection.v1:` plus `HMP(["pm.storage.selection.v1","1.0.0",storage_instance_id,"compaction",compaction_id,target_generation])`. Initial native selection uses `"initial"` and the actual original Storage birth-operation identity in the corresponding positions. Physical segment identity uses `pm.storage.segment_object.v1:` plus `HMP(["pm.storage.segment_object.v1","1.0.0",storage_instance_id,original_namespace_birth_operation_id,creation_ordinal,segment_generation])`; a carried segment preserves its previously issued identity.
- Admission semantic digest is `HMP(["pm.storage.compaction.admission.v1","1.0.0",header_without_operation_semantic_digest])`; header integrity is separately `HMP(complete_header)`. Neither recipe hashes a future event, receipt, journal image, candidate or settlement time.

The immutable header freezes the actual closed input boundary, separately authenticated active carrier, original policy ID/version/revision/hash and eligibility/hold/reference/backup facts, actual initial index generation, target generation exactly one greater than the selected source generation, and the two existing selected action tokens. Overflow refuses. Source generation refs are actual distinct input generations in first-occurrence order. The active carrier is excluded from frozen removal/policy inputs; its whole original prefix and subsequent required lifecycle appends are carried unchanged. It cannot be reclassified under this attempt's closed-input policy.

Original journal birth uses exclusive creation and synchronized same-directory publication before a target, index or lifecycle effect. Header identity, previous resolved entries and original effect/receipt bytes are immutable. An attempted edge reserves an increasing ordinal, exact predecessor and intended legal successor, then records complete original effect plans with preimages and permitted afterimages before each effect. It does not change the last-proven phase or create an emit-ready event. A planned artifact ref proves allocation only; one published artifact ref has immutable bytes. Fixed survivor/removal/core/carrier/journal slots use ordinal zero; replacement complete candidates and target-manifest snapshots use the same increasing candidate ordinal in separate kinds, without a self-hash cycle.

An unresolved reservation must be reconciled before any different successor. If its exact complete postcondition is proved, the original edge is recorded once. Otherwise the original publisher records every actual known or unresolved effect, closes that conditional observation without a proved event, and admits the actual exceptional successor from the last-proven predecessor at a fresh ordinal. Disposition and successor join in one original journal replacement or exact recoverable pre/post intent. The old ordinal, intended identity, effects and dependencies are retained and cannot be recycled. `phases.json` preserves the existing complete adjacency; skipped/reversed edges, same-state-as-new, direct recovery_required-to-finalized and every edge out of a terminal phase remain forbidden.

### Source, candidate and visibility publication

Each genuine new SP-278 prepared index generation gets fresh original 256-bit entropy, retained in its original anchor. Crash continuation reuses that generation's original seed; even a later identical source gets a fresh seed. No candidate ordinal, compaction ID, fixture recipe, caller or timestamp supplies it. Existing SP-278 source-selection, coverage, anchor, frontier, dataset, rowset, survivor and translation digests remain exact. Native CURRENT/manifest hashes cover complete actual files, including namespace/physical identities not projected into the closed existing coverage schema. Every selected segment is scanned from byte zero to its captured durable boundary; global semantic sequence/gaps and the whole member inventory are authenticated. Header frame generation matches the actual original segment member, while CURRENT retains overall selection identity. This is the exact new-role qualification of a homogeneous single-segment source; it does not permit arbitrary generation mixtures.

The builder fixes the exact retained EventRecord core in original order and preserves original semantic identities, payload bytes/hash, timestamps and gaps. It extends candidates with the complete carrier prefix and actual source index frontier. Each candidate contains complete real target index/checkpoint/shadow state, original source/native preconditions, exact survivor/removal/translation proof and a distinct complete target-manifest snapshot. A core descriptor cannot replace a full manifest or candidate. Original `IndexOwner.replace_staged_candidate` and `replace_staged_candidate_and_pending` replace only the permitted staged/pending afterimage while preserving unrelated existing root nodes, datasets, old receipt/dedupe custody and holds. Translation or rebuild and shadow activation or rebuild retain their existing proof requirements; unsupported required projectors or incomplete targets make the operation unavailable.

An ordinary live manifest has one selected entry. Staged snapshot manifests have the exact captured source entry plus one `staged_prefix` target entry, and remain nonselected artifacts. Their candidate ordinal is separate from live manifest revision. After the original commit_pending receipt, the source carrier is sealed without rewriting bytes, preserving its exact historical frontier and issued group. The original final publisher prepares a complete dual-entry live manifest: the original source selection with its sealed carrier/namespace, plus a complete `sealed_target` selection containing fixed core and the same whole carrier, with no target active sink yet. The latest issued group remains unchanged. Final target index/shadow and pending candidate bind that complete manifest; the original live manifest publisher alone allocates the next revision under exact preimage CAS.

Publish and synchronize/read back the exact final manifest at the single manifest path before replacing CURRENT. Source CURRENT continues to select its source entry. Then atomically replace and synchronize CURRENT to the exact target value; this alone changes visibility. The target wins immediately, even while redb activation remains incomplete. One original redb transaction activates the target index/generation, changes both actual current pointers, retires the old node once and clears pending. Finalization creates the original target active segment through namespace authority and updates the target entry. Once retained original source snapshot custody is secure, the live manifest may become one target entry through its original control transition. Physical old-source deletion remains separately gated and is not an effect of detail retirement or terminal settlement.

CURRENT does not contain a mutable manifest hash and is stable across ordinary append. Selection resolves by exact instance/selection ID/generation, never entry order, mtime or filename. A `staged_prefix` entry is never selectable. Source CURRENT plus the exact dual-entry manifest still selects source; target CURRENT plus exact dual-entry/finalized target manifest always selects target. Missing, unsupported, duplicate, unreadable or third-state control joins fence both sides. Proven pending absence is valid before pending creation and after original atomic activation/clear; it alone proves neither nonpublication nor activation. Replacing a manifest with an old entry cannot override target visibility.

The original SequenceOwner durably leases exactly 4096 IDs under checked uint64 arithmetic and original revision/preimage CAS. The actual append-reserved journal entry retains the original lease control and exact assigned EventRecord/value hash before source write. A durable assigned ID is used identity, never reusable for another event. Recovery first reconciles complete actual assigned intents, preserves exact pending assignments and abandons only genuinely unassigned lease IDs under existing `allocator_lease_abandoned` evidence. Missing assignment/source/lease authority fences; it cannot mint a new duplicate or reuse an old receipt.

### Phase observations, effect fences and passive reads

Only a proved edge freezes the existing application-scoped EventRecord. Event ID is `evt_storage_compaction_{transition_digest}` and idempotency key is `storage.compaction_lifecycle_changed:{transition_digest}`. Occurrence is the first durably captured original phase-proof observation time, never retry time or a guessed execution time. Manual actor/correlation are original command facts; automatic correlation is `storage.compaction:{operation_digest}`. `frozen_producer` defines every required member: all project/thread/run/node/attempt/account refs, producer sequence, causation, parent and payload ref are null; all migration members are null; `no_secrets` and `dedupe_by_idempotency_key` are exact. Original Storage alone assigns global sequence, observed/persisted times and first receipt. Later schema registration cannot reconstruct that original source.

Every source-selected phase settles its required original v2/full-value/first receipt before the next physical stage. If CURRENT became target while the intended committed edge lacks complete activation proof, close that unproved reservation with its genuine target-visible effects and prove commit_pending -> recovery_required at a fresh ordinal. Later prove recovery_required -> committed -> finalized. No source rollback, reused edge or repeated physical effect follows. Once target is selected, G21 permits only the same original maintenance owner to use proved committed plus its durable observation obligation for remaining finalization/next-active effects before committed's temporarily unavailable receipt. Ordinary runtime writes, other maintenance, unrelated projector publication, checkpoint advance and successful terminal result stay fenced. This internal dependency exception is not a generic advance permit.

Once an actual safe sink exists, proved observations drain in legal predecessor order through original source/group/first-receipt authority, authenticating intervening closed-unproved dispositions. No later group advances before the previous original first receipt settles. A delayed recovery_required observation retains its historical actor/time and does not assert that repaired current native state remains ambiguous. An unissued proved finalized/failed observation remains a terminal phase with pending delivery/result obligations. Source-side successor-active creation after a sealed carrier requires exact proof of never-published source and the actual separately installed recovery/rotation adapter; it cannot reopen the carrier or choose source after target visibility.

G24 applies inside every actual original namespace, control, database, source, receipt and output publisher. Before returning helpers, independently derive the complete permitted afterimage from actual original state. After all parsers, validators, builders, copies and currentness helpers, compare complete original owner/root/installation/lock facts, actual selected backup state, source/target/carrier bytes and membership, all journal/pending/attempt/phase/producer inputs, receipt groups/full-value rows, index roots/datasets and exact candidate. Include unrelated existing members and their origins. No returning helper intervenes between the final pure predicate and its publication. An outer check after an incorrect original publication is insufficient. A later refusal has no new unadmitted effect and preserves every genuine earlier effect and its original custody, including completed restore/receipt effects; no compensating rollback or post-publication repair supplies admission.

The closed `read_request` selects exactly `current_operation`, `original_terminal_result` or `retained_detail`; expected_detail_ref is nonnull only for retained_detail. G32 applies current original access/root/source/owner and whole-output checks after all helpers before release. Current reads distinguish last-proven and delivered history from actual native authority. Retained terminal reads use the actual minimum map and original canonical receipt row, preserving original result/time without reconstructing expired event bodies or detail. They do not claim `resolve_full_value` over a missing event; full-value reads still require the actual surviving event and existing original resolver. Detail reads are available only while exact original bytes and custody remain. All are passive: no append, checkpoint, dispatch, refabrication or restart. The external model's existing positional method calls do not certify native dispatch of the closed read-request schema.

### Settlement, seven-day detail disposal and coherent backup

The original terminal publisher requires a proved finalized or failed phase, complete disposition of every physical attempt, actual original full-value/first-receipt joins for every proved observation, applied required successful aftermath and resolved result obligations. It derives the closed result from original header/terminal edge/receipt itself. Before terminal publication, freeze `settlement_ready` and the exact immutable detail catalogue in the closed journal. The catalogue excludes that journal's own image; terminal_map binds its exact closed hash separately. One original terminal transaction checks absence or the exact existing result and writes the immutable first_fully_settled_at_utc and original settlement transaction. Retry returns original bytes/time; conflict refuses. This transaction does not create a lifecycle edge.

DL-049 is materialized exactly as `RP-COMPACTION-DETAIL-7D@1.0.0`, resolution anchor, 604800 seconds, inclusive eligibility at first settlement plus TTL, no cardinality/byte cap, fail-closed overflow and existing hold eligibility. Only the first durable fully settled original terminal result anchors either successful or failed operation. Unresolved operations have no anchor; reads, retry, duplicated result, re-observation or later reference release never reset it. The existing janitor schedule and frozen-cutoff limits apply. Current source/control membership and all actual hold, live, backup, rollback, recovery and maintenance dependencies override age. Refs must be resolved through original complete owners; a string neither proves release nor invents an automatic retention duty.

Eligible detail is limited to the original completed survivor/removal/translation metadata, obsolete candidate/carrier/publication/index snapshots and fully resolved journal/attempt/phase bytes. An obsolete core descriptor may be eligible metadata; physical core/source/target segments are separate source authority. Current CURRENT/manifest/active/pending controls, selected source/carrier/target bytes, original receipts/dedupe, minimum terminal map and independently required owner values are forbidden targets. A current translation/index or namespace reader needing detail protects it until an actual valid handoff/rebuild releases the dependency. A mutable journal with any needed member cannot be unlinked wholesale; mixing live members into a settled file makes this disposal unavailable absent a separately reviewed member-preserving rewrite.

Under original writer/hold/reference exclusion, the janitor authenticates the original terminal/result, exact policy, complete catalogue, each member's kind/ref/path/instance/operation/ordinal, bytes and length, and all current protections. Omitted/extra targets, path substitutes or missing release evidence refuse. Before unlink, create the exact original retirement intent. Its ID is `pm.storage.compaction.detail_retirement.v1:` plus `HMP(["pm.storage.compaction.detail_retirement.v1","1.0.0",storage_instance_id,compaction_id,original_settlement_transaction_id,detail_catalog_sha256])`, independent of cutoff/retry time. Before every individual unlink and parent synchronization, the actual original publisher rechecks the entire terminal/policy/remaining-member/protection state and exact native preimage. Each completed removal has original effect/readback custody. Recovery resumes its matching pre/post state or fences a third state. A later blocker preserves both genuine completed removals and remaining intent; references cannot race that same exclusion.

After all listed members are proven removed, one original terminal-map transaction fills only the previously null detail_retirement_receipt with exact member-set digest/count and first retirement time/transaction. Original result, identity, receipt and first-settlement fields stay byte-identical. Clear the original retirement intent only after durable compact receipt and full native absence readback. A crash before that receipt keeps the intent; a crash after receipt rejoins the same original result. This is completed semantic handoff of transient indefinite authority, not a new expiry clock or reopened lifecycle. The compact content-free retirement receipt shares the minimum map's existing indefinite source-lineage policy and contains no raw journal/detail archive.

Supported backup-boundary capture remains mutually exclusive with compaction and captures a complete coherent settled source/receipt/control/terminal state. Retained detail participates through actual mandatory-backup membership or existing protection. Active-detail removal does not delete registered backup copies, alter their clock or bypass a backup reference. Restore preserves original settlement/retirement times and complete original terminal/receipt authority, authenticates the actual selected backup/root/inventory through StorageRecoveryCoordinator, and fences missing required custody with loss disclosure. New post-restore work requires a genuinely new admitted operation/transition under the existing transient acceptance protocol; old pending identity or missing old receipt never becomes fresh first-mint. New-role arbitrary native restore is unavailable until original restore/installation authority exists. Withdrawal fences new mutations and preserves actual pending reconciliation and independently supported retained read/backup obligations until their existing owners resolve them.

These contracts specify native obligations; the accompanying report supplies narrower source/schema and ordinary model evidence. It records six ordinary lifecycle observations, three candidate stages, one activation, five fresh index seeds, original receipt preservation, and protected/unprotected seven-day detail handling as observations of one supplied offline composition. It does not establish native installation, SeglogFrameV2/CRC/fsync, actual redb transactions, concurrent writer/hold exclusion, exceptional/crash/recovery paths, physical source deletion, complete projectors, all exact numeric/empty/multiple-source cases, broad native backup/restore, closed-selector dispatch or event-depth/readiness. Existing older tests and old-role checks are scoped separately, without borrowing their results as certification of this new role. No WorkNode, NodeSeed or governance seal follows.

ContractRef: ContractName:Plans/storage-plan.md#SP-182, ContractName:Plans/storage-plan.md#SP-236, ContractName:Plans/storage-plan.md#SP-237, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-279, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/storage-plan.md#SP-293, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/Decision_Log.md#DL-049, ContractName:Plans/storage_compaction_native_contracts.schema.json, ContractName:Plans/storage_value_registry.json

### SP-295 - Compaction Original Native Source Controls

```yaml
plan_unit_id: SP-295
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The original installed Compaction source role authenticates exact CURRENT, manifest,
  sequence allocator and pending/active generation controls. It preserves whole source
  and receipt custody while publishing the dual-entry manifest before CURRENT and
  activating the complete target in one original index transaction.
gui_related: false
gui_classification_reason: Defines native source and storage authority without visual presentation.
depends_on: [SP-182, SP-236, SP-278, SP-279, SP-286, CV-339, DL-045]
unblocks: []
acceptance_criteria:
  - Five exact closed canonical MessagePack families bind original native source controls; actual installation and complete source membership are required beyond schema/hash equality.
  - CURRENT remains sole visibility authority; exact dual-entry manifest precedes its synchronized replacement, and one original transaction activates target and clears pending.
  - Active carrier is excluded from closed-input policy/removals and carried unchanged with original receipt coordinates and exact segment-generation joins.
  - Fresh original SP-278 seed allocation, complete roots/datasets/frontiers and exact durable 4096-ID assignment custody preserve unrelated and historical authority.
  - Actual native publishers enforce complete independent original expectations after every returning helper; third-state controls fence without rollback of genuine effects.
  - Live indefinite controls change only through original semantic replacement or clear; historical snapshots use their separate detail custody.
validation_surfaces: [reports/event-authority-20260911/step-08-compaction-validation.md, Plans/storage_compaction_native_contracts.schema.json, Plans/storage_compaction_contracts/guards.json, Plans/storage_value_registry.json]
risk_class: false_native_source_selection_or_receipt_rebinding
reasoning_tier: high
context_scope: original_compaction_source_control_and_target_publication
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_compaction_native_contracts.schema.json, Plans/storage_compaction_contracts/methods.json, Plans/storage_value_registry.json]
node_compile_hint: {mode: compaction_native_source_prerequisite_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [reports/event-authority-20260911/step-08-compaction-validation.md]
negative_constraints:
  - Do not infer original source or installed authority from schema-shaped values, a path, an old-role factory, restored pending identity or selected helper output.
  - Do not choose target before CURRENT, roll back target visibility, reclassify the carrier or rewrite old receipt coordinates.
  - Do not claim native atomicity, installation, crash coverage, source deletion, depth, readiness or governance clearance from ordinary model observations.
```

### SP-296 - Compaction Original Phase and Observation Custody

```yaml
plan_unit_id: SP-296
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Original Compaction admission freezes immutable identity, inputs and selected modes;
  journal attempts record exact native effects before mutation and prove only legal
  successors. Original source/full-value/first-receipt custody drains proved historical
  observations in order while preserving unresolved and already completed effects.
gui_related: false
gui_classification_reason: Defines internal maintenance effect and observation custody without visual presentation.
depends_on: [SP-295, SP-286, CV-339, DL-045, DL-049]
unblocks: []
acceptance_criteria:
  - Nine exact detail families and immutable original artifact slots use the closed schemas and original method bindings, without a generic union on disk.
  - Complete original live and terminal retry lookup precedes allocation; immutable operation, transition, effect and artifact identities use their exact separate recipes.
  - An attempted edge is distinct from a proved edge; unproved disposition and actual exceptional successor join without ordinal/event/effect reuse.
  - Whole target/candidate/carrier/index proof and existing action domains govern each phase; target-visible incomplete activation requires the exact recovery_required route.
  - G21 permits only necessary original post-CURRENT convergence while unrelated writes and terminal success remain fenced; legal historical first-receipt order remains mandatory.
  - Frozen producer inputs retain original actor/time and exact null relationships; every original publisher applies G24 and preserves genuine earlier effects on refusal.
validation_surfaces: [reports/event-authority-20260911/step-08-compaction-validation.md, Plans/storage_compaction_native_contracts.schema.json, Plans/storage_compaction_contracts/identity.json, Plans/storage_compaction_contracts/phases.json, Plans/storage_compaction_contracts/guards.json, Plans/storage_compaction_contracts/effect-methods.json]
risk_class: false_compaction_phase_or_repeated_original_effect
reasoning_tier: high
context_scope: original_compaction_attempt_effect_and_observation_chain
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_compaction_native_contracts.schema.json, Plans/storage_compaction_contracts/methods.json, Plans/storage_value_registry.json]
node_compile_hint: {mode: compaction_phase_custody_prerequisite_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [reports/event-authority-20260911/step-08-compaction-validation.md]
negative_constraints:
  - Do not treat reservation, selected mode, emitted history or helper return as physical postcondition authority.
  - Do not reuse a closed unproved ordinal, append from an unproved edge, fabricate a safe sink or restart a terminal phase.
  - Do not borrow old-role tests, declare exceptional/native coverage or grant event-depth/readiness/governance clearance.
```

### SP-297 - Compaction Original Settlement and Seven-Day Detail Retirement

```yaml
plan_unit_id: SP-297
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The original terminal transaction preserves minimum content-free result and receipt
  authority and anchors completed detail at its immutable first fully settled result.
  Exact protected member custody and original crash-safe retirement enforce DL-049's
  seven days while preserving independent source, receipt and backup policies.
gui_related: false
gui_classification_reason: Defines internal settlement, retention, backup and passive read authority without visual presentation.
depends_on: [SP-237, SP-279, SP-293, SP-295, SP-296, DL-045, DL-049]
unblocks: []
acceptance_criteria:
  - Original terminal_map publication requires every physical attempt, proved observation, original receipt and required result obligation settled and freezes first settlement once.
  - RP-COMPACTION-DETAIL-7D version 1.0.0 uses exactly 604800 seconds after first fully settled success or failure with inclusive eligibility, no unresolved anchor and no timer reset or cap.
  - Complete original catalogue and current policy/hold/live/backup/rollback/recovery/maintenance membership are authenticated through every unlink; needed whole journals and source/control/receipt authority remain protected.
  - Original retirement intent precedes effects; exact pre/post recovery preserves completed removals and remaining work, then fills only the compact receipt slot before verified intent handoff/clear.
  - Current, retained terminal and detail reads preserve original authority and current access without append, checkpoint, disposed-content reconstruction or operation restart.
  - Complete coherent backup/restore preserves original clocks/results and separately owned backup rules; unsupported native roles remain unavailable.
validation_surfaces: [reports/event-authority-20260911/step-08-compaction-validation.md, Plans/storage_compaction_native_contracts.schema.json, Plans/storage_compaction_contracts/guards.json, Plans/storage_value_registry.json, Plans/Decision_Log.md#DL-049]
risk_class: premature_detail_deletion_or_false_original_terminal_result
reasoning_tier: high
context_scope: original_compaction_terminal_detail_and_backup_custody
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_compaction_native_contracts.schema.json, Plans/storage_value_registry.json]
node_compile_hint: {mode: compaction_detail_retirement_prerequisite_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [reports/event-authority-20260911/step-08-compaction-validation.md, Plans/Decision_Log.md#DL-049]
negative_constraints:
  - Do not age-evict unresolved authority, reset settlement time, unlink needed mixed journals or delete source segments under detail policy.
  - Do not extend receipt/event/backup lifetimes, bypass actual references, reconstruct retired detail or relabel stale restore obligations as new admission.
  - Do not claim native retirement, backup, concurrency, crash, selector-dispatch, complete depth or governance certification from finite ordinary model results.
```

<a id="goal-created-passive-reader-and-original-members"></a>
