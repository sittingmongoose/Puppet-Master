# Shard 090: Collaborative workflow event persistence binding (DL-090, 2026-11-04)

Source: `Plans/storage-plan.md`

Source lines: L29595-L31427

Source SHA256: `f9d18b0c887c42883b76f24346977549971ba1e441fc7e7234d66370565f0080`

---

## Collaborative workflow event persistence binding (DL-090, 2026-11-04)

This is a **newly authored Storage owner contract under DL-090** (DL-091 for `collaboration.failed`) for exactly the 18 collaborative workflow families: `collaboration.created`, `collaboration.started`, `collaboration.paused`, `collaboration.resumed`, `collaboration.cancelled`, `collaboration.completed`, `collaboration.failed`, `collaboration.participant_started`, `collaboration.participant_completed`, `collaboration.message_added`, `collaboration.artifact_added`, `collaboration.configuration_changed`, `brainstorm.proposal_added`, `brainstorm.vote_added`, `brainstorm.plan_synthesized`, `review.finding_added`, `review.finding_dispositioned`, `review.artifact_finalized`. The per-family search that DL-090 requires is `reports/event-authority-20261104/DC-binding-search.md`. At its original pre-landing snapshot it found no append admission, projector, reader, checkpoint key or value, identity recipe, transition rule, first-receipt adoption or retention assignment for any of them on `main`. The current base now includes the landed Storage reuse check and `RP-CHAT-THREAD-LIFETIME@1.0.0`; those definitions are reused without changing their policy. Their semantic owner is `Plans/Collaborative_Workflows.md` (CWR-105 to CWR-123) and their payloads are `Plans/Contracts_V0.md` CV-460 to CV-478.

This contract reuses existing bindings by name, each in the role, version and scope its owner defines: SP-278's generic EventRecord index checkpoint and reader with DL-076's nine-field durable read token, SP-286/CV-339's `storage.first_append_receipt.resolve.v2`, SP-336's commit-group durability, Storage's `scope_partition` rule and dedupe identity, CV-366's application idempotency key form, `RP-PROJECTION-3GEN@1.0.0` and the landed `RP-CHAT-THREAD-LIFETIME@1.0.0`. It borrows no sibling binding: the coordination append path, projector and checkpoint of SP-320, and the `app.coordination_append.v1` path of SP-351, are not reused, because they bind the agent coordination families, not these.

Nothing here admits a family. Each of the 18 stays quarantined before append or projection and absent from `Plans/event_family_registry.json` until its own Storage admission landing, one family per landing (DL-090, DL-078).

### SP-460 - Shared persistence mechanisms of the collaborative workflow families

**Identities**, each newly defined here:
- `storage.collaboration_append.v1@1.0.0` is the collaboration append admission, the only path that appends the 18 families. `CollaborationRuntime` (CWR-105) is its only caller.
- `storage.collaboration_projector.v1@1.0.0` is the only direct consumer of the 18 families' events and the only writer of the seven projection key shapes and of the checkpoint.
- Six readers, each reading projections only, never events, and never writing:
  - `storage.collaboration_reader.run_view.v1@1.0.0` for transcript cards (CWR-019), the run view (CWR-020) and the four Activity domains (section 4.4, CWR-036);
  - `storage.collaboration_reader.completion.v1@1.0.0` for the completion projection pm.collaboration.completion_projection.v1 that PART-016..020 and CWR-029 derive on read;
  - `storage.collaboration_reader.participant_activity.v1@1.0.0` for the participant activity projection that CWR-030 derives on read from these events and the run and attempt records;
  - `storage.collaboration_reader.composer_destination.v1@1.0.0` for composer destination revalidation of sections 4.5 and 4.6 (target ended, removed participant);
  - `storage.collaboration_reader.review_followon.v1@1.0.0` for Review follow-on reads of CWR-026 (Create To-Dos default selection, the display-only re-run comparison, accept_partial and finish_stale availability);
  - `storage.collaboration_reader.inspection.v1@1.0.0` for read-only inspection (pm inspect and pm tail, SP-339);

**Checkpoint.** The key is `projector.checkpoint.collaboration:{scope_partition}`, one per scope partition (`app`, or one per Project), in redb's `checkpoints` table. The value is canonical MessagePack `pm.storage_value.collaboration_projector_checkpoint.v1@1.0.0`, defined at `Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint`: schema identity; `publication_id`; `storage_instance_id`; `scope_kind`, `scope_partition` and `project_id` (null in application scope); `projector_id` and `projector_version`; `admitted_event_types`, the sorted exact list of these families admitted in the registry when the publication was built; `index_read_token`, SP-278's nine-field durable read token (DL-076), never `redb_snapshot_id`; the examined bounds `first_retained_sequence_id` and `index_through_sequence_id` and SP-278's inclusive `source_cursor`; `filter_complete`, `state` (`current`, `degraded`, `withdrawn`), `health`, `updated_at_utc`, `withdrawn_at_utc`, `published_at_utc`, `hold_refs` and at most two `retired_generations`.

**Projections.** The seven key shapes are rows of one redb table, `collaboration_read_model_projections`, in the database that holds `checkpoints`, so one write transaction covers rows and checkpoint. Each value carries its own `schema_id` and `schema_version` and the `publication_id` of the checkpoint core it belongs to, so replay dispatches by schema, never by key template. Values hold only identities, references, hashes, enums, integers, booleans and timestamps.

| Row | Key | Value schema |
|---|---|---|
| definition | `collaboration_definition_projection.v1:{scope_partition}:{hex(collaboration_id)}` | `pm.storage_value.collaboration_definition_projection.v1@1.0.0` at `#/$defs/definition_projection` |
| run | `collaboration_run_projection.v1:{scope_partition}:{hex(collaboration_run_id)}` | `pm.storage_value.collaboration_run_projection.v1@1.0.0` at `#/$defs/run_projection` |
| participant | `collaboration_participant_projection.v1:{scope_partition}:{hex(collaboration_run_id)}:{hex(participant_slot_id)}` | `pm.storage_value.collaboration_participant_projection.v1@1.0.0` at `#/$defs/participant_projection` |
| artifact | `collaboration_artifact_projection.v1:{scope_partition}:{hex(collaboration_run_id)}:{hex(artifact_version_ref)}` | `pm.storage_value.collaboration_artifact_projection.v1@1.0.0` at `#/$defs/artifact_projection` |
| proposal | `collaboration_proposal_projection.v1:{scope_partition}:{hex(collaboration_run_id)}:{hex(proposal_id)}` | `pm.storage_value.collaboration_proposal_projection.v1@1.0.0` at `#/$defs/proposal_projection` |
| vote | `collaboration_vote_projection.v1:{scope_partition}:{hex(collaboration_run_id)}:{hex(vote_id)}` | `pm.storage_value.collaboration_vote_projection.v1@1.0.0` at `#/$defs/vote_projection` |
| finding | `collaboration_finding_projection.v1:{scope_partition}:{hex(collaboration_run_id)}:{hex(finding_id)}` | `pm.storage_value.collaboration_finding_projection.v1@1.0.0` at `#/$defs/finding_projection` |

**Binding record.** `Plans/collaboration_projection_contracts.schema.json` carries `x-pm-event-authority-binding`, this unit's binding in machine form for the admission ledger and the checker. It restates the identities above and adds none.

**SP-278 adoption and atomic advance.** The projector adopts SP-278 by name. Each advance: (1) `reader.storage.event_record_index@1.0.0` establishes the independently published, CURRENT-selected, globally complete SP-278 snapshot and verifies source controls, frames, hashes, coverage, lawful gaps, schema dispatch and dedupe through that owner; (2) the projector scans the captured range with an exact filter, this scope partition and the types in `admitted_event_types`, verifies registry admission, envelope and payload identity and the CV-460 joins, and applies matching events strictly in canonical sequence order through each family's unit; a verified nonmatch is skipped, while unsupported, corrupt or unexplained missing source fails the advance or leads to a governed rebuild; (3) it commits the changed rows and the checkpoint in one redb write transaction under exact prior-value compare-and-swap of the checkpoint's publication, cursor and token, writing no index row, generic checkpoint or EventRecord; a stale swap, cursor regression, changed scope or unproved empty range never advances; (4) an inclusive restart rechecks the last applied frame's identity and end offset. Every advance, read and recovery joins its own live read transaction's snapshot ID to the stored nine fields and revalidates the whole token; an equal generation alone proves nothing. A proven empty source has null bounds and cursor; a nonempty source with no collaborative event keeps its examined bounds; missing coverage is not empty.

**Readers and coverage.** Each reader requires the checkpoint `current`, `admitted_event_types` containing every family its read depends on, coverage of the sequence it needs (after its own write, `index_through_sequence_id` at or beyond the receipt's `sequence_id`; for a latest read, a token equal to the current SP-278 frontier), rows of the current `publication_id`, and schema versions it supports. It applies current Project or application thread permission, the existing deletion tombstones and Collaborative Workflows' blind-phase rules (CWR-013) before it discloses a row. Otherwise it returns typed unavailable or stale, never falls back to older rows and never writes. Opening a run view never replays the run's events (CWR-020).

**Admission order.** `storage.collaboration_append.v1@1.0.0` admits one event at a time under the existing Storage append-writer lock: (1) **exact retry**: the dedupe identity `(scope_partition, event_type, idempotency_key)` with the same producer semantic digest returns the original event and result, its receipt only through `storage.first_append_receipt.resolve.v2`; the same identity with another digest is `idempotency_conflict` and appends nothing; (2) **family admission**: a type the registry does not admit, or an application edition still marked `requires_owner_adoption`, is quarantined before append and advances no checkpoint; (3) **payload**: the edition's CV-460 to CV-478 definition and the EventRecord joins; (4) **current projection**: the projector first brings the checkpoint up to the verified tail of the scope partition under the same lock, or the call returns `collaboration_projection_unavailable` and appends nothing; (5) **transition**: the family's own unit checks the event against the current rows and returns `collaboration_conflict` with one `conflict_kind` on refusal; (6) **append** through the ordinary EventRecord path with SP-336's single data sync for the group, then first-receipt custody. A refused event appends nothing and changes no row.

**Common run checks.** For every family except `collaboration.created`, `collaboration.started` and `collaboration.configuration_changed`, step (5) first applies, in order: the run has a `collaboration.started` event in this scope partition (`run_not_started`); the payload's `thread_id`, `kind` and `collaboration_id` equal the run's (`lineage_mismatch`); the run is not terminal (`already_terminal`); the payload's `definition_revision` equals the run's current revision (`stale_definition_revision`). The family's unit lists its further checks in order. `conflict_kind` is closed to: `lineage_mismatch`, `stale_definition_revision`, `stale_assignment_revision`, `already_created`, `definition_not_recorded`, `already_started`, `run_not_started`, `stale_lifecycle_seq`, `already_terminal`, `run_state_invalid`, `slot_not_in_roster`, `attempt_already_started`, `unknown_attempt`, `attempt_already_closed`, `open_attempts`, `unresolved_required_slots`, `required_slot_set_mismatch`, `waived_slot_set_mismatch`, `waiver_not_recorded`, `sequence_gap`, `message_already_written`, `artifact_already_added`, `not_core_participant`, `unknown_proposal`, `proposal_already_added`, `vote_already_added`, `wonderer_cannot_vote`, `attempt_not_current`, `already_synthesized`, `target_hash_mismatch`, `unknown_finding`, `finding_already_added`, `already_dispositioned`, `findings_not_dispositioned`, `artifact_not_added`, `already_finalized`, `partial_not_accepted`, `stale_not_accepted`, `missing_output`, `output_refs_mismatch`.

**Identity recipe.** Newly defined here, for both scopes:
- `owner_operation_id` is `collabop_` followed by the lowercase hex SHA-256 of the RFC 8785 JSON array `[event_type, scope_partition, subject..., recovery_epoch]`, where the subject is the family's ordered identity components (each family's unit), integers in base 10, an absent `attempt_id` as JSON null, and `recovery_epoch` in base 10.
- `idempotency_key` is `collaboration@1:{owner_operation_id}` in project scope and, adopting CV-366's application producer key form by name, `application@1:{hex(server_id)}:{hex(owner_operation_id)}` in application scope. `replay_policy` is `dedupe_by_idempotency_key` and the dedupe identity is `(scope_partition, event_type, idempotency_key)`.
- `event_id` is `evt_collaboration_` followed by the lowercase hex SHA-256 of the RFC 8785 array `[storage_instance_id, recovery_epoch, scope_partition, event_type, subject...]`.
- `storage_instance_id` and `recovery_epoch` are Storage's actual values (Case L-2) when the owner commit prepares the event, and the prepared event keeps them for every retry. After a verified older restore a newly prepared event never reuses the scoped identity or event ID of an event lost with the post-backup writes. No clock, retry count or checkpoint generation enters either recipe. Within one epoch the scoped identity makes a second event for the same subject an exact retry or an `idempotency_conflict`; each family's `already_*` conflict refuses the same subject under a later epoch.

**Numeric and type interpretation.** The new semantic-body and typed-snapshot SHA-256 domains use sorted-key, compact UTF-8 JSON (DL-077), with lossless decimal/exponent decoding before any binary64 conversion. Mathematical integers retain every digit and serialize in base 10; negative zero becomes `0`. Thus `9007199254740993`, `9007199254740993.0` and `9007199254740993e0` have one commitment as well as `1`, `1.0` and `1e0`. Nonintegral decimals are admitted only when their shortest binary64 round-trip decimal preserves the exact input decimal value; otherwise decoding refuses them. Already-decoded integral binary64 inputs outside the safe-integer range (absolute value above 9007199254740991) are refused because their original value may already have been lost. Leading-zero JSON, duplicate keys, nonfinite numbers and wrong field types are refused. Every boolean control requires the exact boolean type before its value is read; every integer control refuses booleans, numeric strings, null, arrays and objects. Identity subjects and recovery epochs use the same canonical base-10 integer string. Existing native codecs and owner-issued currentness domains remain unchanged. SP-337 reference bytes must equal this entire canonical encoding.

**Durable prepared-source physical binding (B1; newly authored owner contract under DL-090).** `collaboration_prepared_source` is a canonical, non-rebuildable registered Storage value. Its key is `collaboration_prepared_source.v1:{hex(storage_instance_id)}:{recovery_epoch}:{scope_partition}:{hex(event_type)}:{hex(owner_operation_id)}` in the canonical redb file's `collaboration_prepared_sources` table. Canonical MessagePack stores `Plans/collaboration_prepared_sources.schema.json` without an additional redb value cap; the EventRecord body and the separately stored SP-351 application wrapper each retain their own 16 KiB inline limit: one closed project/application holder per family, exact legacy typed `owner_record`, its reference and SHA-256, the frozen definition's `slot_requirements` (one boolean requiredness per slot, PART-001..006), original Storage instance/epoch, full caller semantic body, its SHA-256, original operation identity and event ID. The digest covers only canonical UTF-8 JSON of that semantic body, excluding every assigned sequence, locator, receipt, token, sync group and observed/persisted timestamp. `currentness_hash` is the original owner-issued currentness, verified against the independent original-source capture; its existing hash domain is preserved. The separate owner_record_sha256 checks the typed snapshot bytes and is never substituted for owner currentness. Only CollaborationRuntime writes holders; the append path reads them and cannot fabricate one from EventRecord/projection state.

For each family's exact owner fact its existing typed owner body and this immutable source snapshot commit in one canonical redb write transaction, before append. Project records use the holder's typed owner body as durable version custody; application records additionally write the SP-351 physical wrapper/key in the same canonical database transaction. The four collaborative wrappers have explicit `Collaboration{Definition,Run,Participant,Transcript}StorageApplicationV2` successors in `Plans/application_workflow_contracts.schema.json`: schema IDs `pm.storage_value.collaboration_{definition,run,participant,transcript}.application.v2`, version `2.0.0`. Each retains the instance, Server and scope header, and requires `record` and `record_ref`: exactly one is non-null. Inline `record` contains the unchanged logical V1 record and `record_ref` is null. A reference wrapper has `record` null and `record_ref` in SP-337's `payload:blake3:{hash}:{byte_size}:application/json` form. Measure the entire canonical MessagePack wrapper, including header, pointer and null fields; an inline or reference wrapper above 16,384 bytes is refused. Above the inline boundary, store the complete canonical JSON logical record once in a durable SP-337 pack and use the small reference wrapper. Resolve, check byte count/BLAKE3/canonical encoding and validate the original logical record and every identity before use. A missing or forged pack fences append, retry, recovery and disclosure. Keys, logical record editions and codecs are unchanged; the original closed V1 wrapper schemas remain read-only and receive no new fields. The registry selects V2 explicitly. The holder, wrapper, packs and original controls share canonical transaction and backup/restore custody. The holder pins the exact definition/run/participant/transcript/proposal/vote/finding/disposition and payload references the fact needs. A missing original record, holder, reference, source hash or whole-value CAS join fences append/recovery; an owner snapshot cannot be reconstructed from a later event, digest or mutable current row. All eighteen family-specific holder definitions select their own closed payload edition and source owner type; a sibling is never a source substitute.

A coherent Project Backup or BRS-033 application Server Backup includes the canonical typed records, all prepared-source holders, referenced payload packs, original event/first-receipt custody and Storage controls together. Restore validates instance, original epoch, source/body hashes, scope, owner and event identities before resolving the original receipt through SP-286/CV-339 resolve.v2. A genuinely absent append may retry only that prepared semantic request; unresolved original custody keeps the run/definition fenced. A verified older restore retains restored holders unchanged; fresh work uses the new recovery epoch, without renaming lost or older work. Chat lifetime and holds govern the holders and chat-owned source records under E-CARDS-1 1c A; independently retained source/receipt/artifact custody keeps its own deadline. No native transaction, provenance or restore proof is claimed.

Review Start stores the full existing typed ReviewTargetPack inside the canonical holder, so recovery never relies on an unmaterialized pack reference. Proposal and vote holders retain the actual participant_id-to-slot mapping from the frozen run roster; they never equate the two identifier namespaces. Independent source capture joins kind, family, subject, scope, thread, definition revision, original currentness and these exact roster/pack values. Existing owner fields and codecs remain unchanged. The original caller-owned envelope metadata (actor, correlation, causation/parent and requested/effective account refs) is durably frozen in envelope_metadata before append. A proposed EventRecord resolves its payload and must match that exact semantic body and metadata; changing only Storage-assigned sequence, observed/persisted time or receipt/locator data never changes the producer digest. Exact retry still returns the original event metadata and first receipt. The source context is an ephemeral, independently authenticated read result of storage.collaboration_append.v1@1.0.0, never a caller-submitted request field: original resolved owner-record reference and typed-record digest, binding/subject, owner-issued currentness, actual frozen roster and required-slot set, waiver/pack and settled output facts come from actual original owner controls. The holder’s required booleans and roster join that independent definition capture on every family path; changing both a prepared body’s list and its header cannot change requiredness. Static fixture contexts do not prove native authentication. The physical key is read independently, not recomputed as proof of a stored locator. The holder joins the actual Storage instance and its independently captured original write epoch; a newer live restore epoch never replaces that original epoch. An unavailable capture or mismatched key is refusal. `source_record_ref` is the payload's definition_record_ref for created, `collaboration_definition:{collaboration_id}:{definition_revision}` for configuration changes, run_record_ref or `collaboration_run:{collaboration_run_id}` for run facts, `collaboration_participant:{collaboration_run_id}:{participant_slot_id}:{attempt_id}` for participant admission, disposition_record_ref for participant outcome, `collaboration_message:{collaboration_message_id}` for transcript writes, and the family's proposal_record_ref, vote_record_ref or finding_record_ref for those owner records. These are scoped by the physical holder key; body/Plan/artifact/failure/receipt refs keep their actual independent owner custody. Every captured application_context, including nested participant/coordinator contexts, joins the same real Storage instance, Server and thread as the semantic body. Join each copied fact field by field: `state_after` to the committed run's exact state (running, waiting or blocked for Start/Resume); the complete semantic roster to the independently frozen definition roster; participant requiredness to that definition's per-slot boolean; proposal/vote attempt attribution to the original admitted attempt; vote constraint IDs to the vote record's exact hard_constraint_conflicts; synthesized Plan identity/version/hash/receipt to the original Plan-create result, never the launching Plan; Review vote target hashes and reviewer identities to the frozen target/reviewer evidence, and counted/dissent totals to the retained votes/dissent. A stored native disposition currentness joins the emitted currentness_hash without replacing either domain with the typed-snapshot SHA-256. Artifact-added/finalized facts require the actual artifact reference in the committed run record. These comparisons are recomputed from the captured original records and controls, not accepted because a caller refreshed a digest. `source_context.owner_facts` contains only the remaining original owner-control fields absent from the typed record/binding/roster/result; compare the exact per-family field set and values after the derived joins. Its provenance is the authenticated original owner read, never an EventRecord or caller copy. Storage-assigned metadata never enters it.

**Authoritative requiredness in projections.** definition_projection and run_projection both require required_slot_ids. Created records the independently frozen definition set; configuration_changed updates the definition and any active run’s retained set in the same advance; started copies its selected definition’s set into the run. Completion compares its list to this persisted run set, never a caller-supplied substitute. Native original-definition capture is a mandatory producer join; the header cannot authenticate itself.

**Physical projection composition (B2).** Section 2.3.1's keyed composition applies here by the same rule: the eight independent registry entries are `collaboration_projector_checkpoint` and `collaboration_{definition,run,participant,artifact,proposal,vote,finding}_projection`. `x-pm-keyed-composition` lists their exact key/schema pairs; it is never a stored header. Every registry row fixes canonical MessagePack, the sole projector writer, its own closed schema, RP-PROJECTION-3GEN and derived-file rebuild without backup. Rows and checkpoint share one derived redb transaction. The canonical source holder is a separate ninth registration with mandatory coherent backup; it grants no event membership. The readiness census rises from 344 to 353; stale pre-existing test census pins are integration items, never a reason to weaken a guard.

**Checkpoint semantic joins (B6).** In addition to shape, every read/advance compares outer, token and source-selection Storage identities, decodes and re-encodes the exact Project partition, compares all nine token fields with the independently captured SP-278 frontier, the exact sorted admitted set and complete examined bounds, and joins the inclusive cursor's generation, sequence, event identity and frame offsets to the verified source frame. The cursor equals the captured last frame; the event's scope/Project, payload edition, identity and recorded write epoch also join. A proven empty range has null bounds/cursor; absence or mismatch is unavailable, never empty. The static context is synthetic; native CURRENT selection, token authentication, legal gaps, CAS and frame hashing remain NOT_RUN.

**Prepared events and recovery.** The owner commit stores the prepared event with its record (CWR-105). On restart the runtime resolves each committed record's prepared event through `storage.first_append_receipt.resolve.v2`; if Storage's own reconciliation establishes that no original event exists, only that prepared identity is retried through the unchanged idempotency route with the same input, which is not a first mint. A run whose append is uncertain stays fenced until Storage resolves it. A verified older restore brings back only the records it restores, with their prepared events; lost work is never renamed or reaccepted as new.

**First-receipt custody.** For every append of the 18 families, the append admission and its caller adopt SP-286/CV-339's `storage.first_append_receipt.resolve.v2` by name: the request is the original admitted EventRecord identity and semantic request in the same Storage instance; the returned eleven-field AppendReceipt and the four-field `original_append_result` must join the original event and sequence; the durability class is the synced commit group (SP-336, SP-347). A newer locator, timestamp, supplied digest or dedupe result alone never satisfies it. At the final publication boundary the runtime rechecks that the resolved receipt still joins the original request. Resolution is passive and appends nothing. This owner does not rely on `storage.first_append_receipt.resolve_full_value.v1`.

**Custody and redaction.** The 18 families' EventRecords in seglog are their only history: canonical, included in the canonical backup (BRS-033's application custody for application scope), never rebuilt from projections. First receipts live in SP-286's `event_append_receipt_custody`. Projections and the checkpoint are derived, not backed up, and rebuilt from restored seglog. EventRecords and derived projection/checkpoint values hold no user or participant text, credential, account identifier, prompt, output or local path. Canonical prepared-source holders preserve the existing typed owner data and text references, under that source record’s visibility, chat lifetime and holds; they never add credentials. Opaque references, IDs, hashes and cursors confer no access; readers check permission, tombstones and blind phases at read.

**Retention.** Events: kept as long as the run's chat exists (DL-092, DL-292). The chat is the payload's `thread_id`. The structured reference in every prepared row is `{registry_schema_id: pm.storage_value_registry.v2, policy_id: RP-CHAT-THREAD-LIFETIME, policy_version: 1.0.0}`, the Chat content class materialized by the landed Storage owner's DL-045 reuse check for DL-092 in `Plans/storage_value_registry.json`. The object is present on the current base; each family still requires its separate event admission. Deleting the chat follows the chat deletion rule that object carries: the content-free tombstone is persisted at once, unheld active copies are purged within 24 hours and deleted backup bytes within 30 days, and a hold delays physical purge but never restores visibility; the projector removes the rows of that chat's runs at its next advance, and readers hide them at once through the tombstone. The per-thread count and successor rule belong to that object; this contract decides no count rule. Projections and the checkpoint use `RP-PROJECTION-3GEN@1.0.0`: at most three generations per key, the checkpoint keeping its current core and at most two retired cores, each with its own `publication_id`, first publication time, holds and first withdrawal time. Run, participant, transcript, proposal and finding records in both scopes, including vote and disposition custody attached to those owners, live as long as their chat exists (Jared, E-CARDS-1 item 1c option A, recorded in landed DL-404). This replaces SP-351's app one-year rule. Chat deletion hides them immediately through the tombstone, purges unheld active bytes within 24 hours and backup bytes within 30 days; chat/legal holds postpone physical purge without restoring visibility. Shared artifacts and original receipts retain independent custody; deleting a card/message never deletes a shared artifact. The historical DL-092 quotation remains historical.

**Replay, rebuild and withdrawal.** Replay runs in canonical seglog order from the checkpoint's inclusive cursor and only rebuilds projection rows: no message delivery, dispatch, card, notification, command or append follows from replay. Missing, malformed or inconsistent rows or checkpoint enter the existing Q-DERIVED quarantine and StorageMigrationCoordinator rebuilds them from verified CURRENT-selected source through the adopted SP-278 token; readers get unavailable meanwhile. `admitted_event_types` grows only through a governed rebuild: the current core is withdrawn, the projector rebuilds over the complete range with the new set and a new core is published; admitting a family never back-fills, aliases or re-reads a sibling. Withdrawal of one family: first the writer is cut off (the append admission refuses it, and the runtime refuses whatever its unit says depends on it); then the current core is withdrawn with `withdrawn_at_utc` set once, the projector stops ordinary advance and readers return unavailable; last, every original event and its dedupe and receipt custody are kept, the owner-approved successor is identified, and StorageMigrationCoordinator rebuilds with the new admitted set before a new core is published. No zero-cursor reset, sibling reuse, history rewrite or seglog deletion follows. A run that cannot reach an admitted terminal event stays non-terminal in the projection and is never inferred terminal.

**Activation.** Admission is per family, but a run of a kind appends natively only when every family its kind needs is admitted: the twelve run families (`collaboration.*`) for every kind, plus the three BrainStorm families for a BrainStorm run and the three Review families for a Review run, and only when the owner records those families commit are registered Storage families in the run's scope. Until then an admitted family is contract-only and nothing is appended.

**Proof boundary.** Everything here is contract. Native seglog and redb behavior, locks, SP-278 publication, SP-286 issuance and resolution, migration, backup, restore and deletion stay NOT_RUN. Static schemas, fixtures and the checker establish no DEPTH_PASS, readiness or seal.

```yaml
plan_unit_id: SP-460
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Newly authored Storage owner contract under DL-090 for the 18 collaborative workflow families.
  storage.collaboration_append.v1@1.0.0 is the only append admission and
  storage.collaboration_projector.v1@1.0.0 the only direct consumer; six versioned readers read projections
  only after checking current state, admitted types, coverage and publication, and apply permission,
  tombstones and blind phases. The key projector.checkpoint.collaboration:{scope_partition} holds
  pm.storage_value.collaboration_projector_checkpoint.v1@1.0.0 with SP-278's nine-field durable read token
  (DL-076), examined bounds, an inclusive cursor, state and generation custody; seven projection rows and the
  checkpoint advance in one redb transaction under prior-value compare-and-swap. Admission runs exact retry,
  family admission, payload, current projection, the family's transition checks and append, and refusals
  return collaboration_conflict with a closed conflict_kind. owner_operation_id, idempotency_key
  (collaboration@1 or CV-366's application@1 form) and event_id derive from the scope partition, the family
  subject and the recovery epoch. Producers adopt storage.first_append_receipt.resolve.v2; prepared events
  recover by identity. Events are canonical and backed up; projections rebuild. Events keep
  RP-CHAT-THREAD-LIFETIME@1.0.0 once its Storage landing records it, projections RP-PROJECTION-3GEN.
  Withdrawal cuts off the writer, fences readers and rebuilds without deleting source; a kind activates
  natively only when every family it needs is admitted.
  The registered canonical collaboration_prepared_source holder commits exact unchanged typed source, frozen
  caller body/envelope and original identities atomically, with independently authenticated original-source
  joins and coherent backup/restore; explicit collaborative app V2 wrapper successors join that same transaction.
  Every copied fact joins its original source field by field. Complete app wrappers independently fit
  16384 MessagePack bytes or externalize the unchanged logical record through SP-337, preserving closed V1 readers. All eight independent
  derived physical families and their keyed composition are registered. Checkpoints join real instance,
  frontier, coverage and original frame. Canonical numeric commitments decode decimal/exponent inputs losslessly before binary64 and equate admitted
  equivalent forms, including large integers and negative zero; exact control types prevent truthiness
  substitution. Source/currentness domains and native codecs remain distinct.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [DL-090, DL-076, SP-278, SP-286, CV-339, SP-336, CV-366, CWR-105, CV-460]
unblocks: []
acceptance_criteria:
  - "Only storage.collaboration_append.v1 appends the 18 families and only storage.collaboration_projector.v1 consumes their events."
  - "The checkpoint stores the nine-field durable read token without redb_snapshot_id, and every advance, read and recovery revalidates the whole token of its own read."
  - "Rows and checkpoint commit in one redb transaction under prior-value compare-and-swap."
  - "Exact retries return the original result, a different digest is idempotency_conflict, and transition refusals return collaboration_conflict with a closed conflict_kind."
  - "Lost acknowledgement resolves only through storage.first_append_receipt.resolve.v2, and recovery retries only prepared identities."
  - "Events are kept as long as the run's chat exists under RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and chat deletion removes them under its deletion rule."
  - "Withdrawal cuts off the writer, fences readers and rebuilds without deleting source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: stale_collaboration_projection_or_lost_event
reasoning_tier: high
context_scope: collaborative_event_persistence_shared
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
  - Plans/collaboration_event_admission.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
  - "Plans/storage-plan.md#SP-278"
  - "Plans/storage-plan.md#SP-286"
  - "Plans/storage-plan.md#SP-320"
preserved_exact_tokens:
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "projector.checkpoint.collaboration"
  - "collaboration_conflict"
  - "collaboration_projection_unavailable"
  - "RP-CHAT-THREAD-LIFETIME"
  - "RP-PROJECTION-3GEN"
negative_constraints:
  - "No event admission, registry row, retention policy change, sibling binding reuse, runtime capability or native proof."
  - "No stored redb_snapshot_id, no currentness from a generation alone, and no read from stale publications."
  - "No WorkNode, NodeSeed, readiness clearance or governance seal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-090, ContractName:Plans/Decision_Log.md#DL-076, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/Collaborative_Workflows.md#CWR-105, ContractName:Plans/Contracts_V0.md#CV-460

**Settled record custody:** Run, participant, transcript, proposal and finding records in both scopes, including vote and disposition custody attached to those owners, live as long as their chat exists (Jared, E-CARDS-1 item 1c option A, recorded in landed DL-404). This replaces SP-351's app one-year rule. Chat deletion hides them immediately through the tombstone, purges unheld active bytes within 24 hours and backup bytes within 30 days; chat/legal holds postpone physical purge without restoring visibility. Shared artifacts and original receipts retain independent custody; deleting a card/message never deletes a shared artifact. The historical DL-092 quotation remains historical.

### SP-461 - Persistence of collaboration.created

**Identity.** The subject is `collaboration_id`, `definition_revision`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. The subject's revision is always 1, so a collaboration has one created identity per recovery epoch.

**Admission checks, in order.** the `collaboration_id` has no `collaboration.created` event (`already_created`; within one recovery epoch a repeat is an exact retry or `idempotency_conflict`). It records definition revision 1, the kind and the thread for the collaboration.

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the definition row (collaboration_definition_projection.v1): creates the definition row (latest recorded revision 1, the created event ID), and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Requiredness projection.** Created retains the original definition required_slot_ids in definition_projection.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.admit_run(StartAdmission)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** The definition's name and purpose are user text and stay in the definition record; the event carries the identity, the admission source, the slot IDs and the coordinator kind only. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** New Start admissions that would create a definition are refused while it is withdrawn; runs of existing definitions are unaffected. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.created`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeDefinition` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationDefinitionApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-461
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_created prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.created. Its subject is
  collaboration_id, definition_revision, and its identity follows SP-460. Admission checks in order: the
  collaboration_id has no collaboration.created event (already_created; within one recovery epoch a repeat is
  an exact retry or idempotency_conflict). It records definition revision 1, the kind and the thread for the
  collaboration. storage.collaboration_projector.v1@1.0.0 applies it to the definition rows and advances the
  checkpoint with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.admit_run(StartAdmission) through storage.collaboration_append.v1 and adopts
  storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave
  with their chat; projections keep RP-PROJECTION-3GEN. New Start admissions that would create a definition
  are refused while it is withdrawn; runs of existing definitions are unaffected.
  Created retains the original definition required_slot_ids in definition_projection.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-106, CV-461, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.created is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_id, definition_revision."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-231"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_created
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.created"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "already_created"
negative_constraints:
  - "Do not append collaboration.created before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-106, ContractName:Plans/Contracts_V0.md#CV-461, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-462 - Persistence of collaboration.started

**Identity.** The subject is `collaboration_run_id`, `lifecycle_seq`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. `lifecycle_seq` 1 makes the start the run's first lifecycle identity; a repeated Start with the same command binding resolves to the original run and event (section 2.6).

**Admission checks, in order.** the run has no event (`already_started`); the payload's `definition_revision` has a recorded `collaboration.created` or `collaboration.configuration_changed` for its `collaboration_id` (`definition_not_recorded`); the payload's `kind` and `thread_id` equal the definition's (`lineage_mismatch`). It creates the run with status `active` and `lifecycle_seq` 1.

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the run row (collaboration_run_projection.v1): creates the run row: kind, thread, definition revision, admission source, frozen roster, Review target hashes, lifecycle status `active`, `lifecycle_seq` 1; the participant row (collaboration_participant_projection.v1): creates one slot row per roster slot, with no attempt, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.participant_activity.v1@1.0.0`, `storage.collaboration_reader.composer_destination.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Requiredness projection.** Started copies required_slot_ids from the selected definition projection into run_projection.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.admit_run(StartAdmission)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original run, event and receipt; the Start result is never committed from anything else.

**Custody and retention.** The run's job text, topic and purpose are user text and stay in the definition and run records; the event carries identities, enums, refs and hashes only. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn no run of any kind can be admitted, because every other run family needs a started run; existing runs keep their recorded history and continue only through the families still admitted. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.started`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationRunApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-462
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_started prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.started. Its subject is
  collaboration_run_id, lifecycle_seq, and its identity follows SP-460. Admission checks in order: the run has
  no event (already_started); the payload's definition_revision has a recorded collaboration.created or
  collaboration.configuration_changed for its collaboration_id (definition_not_recorded); the payload's kind
  and thread_id equal the definition's (lineage_mismatch). It creates the run with status active and
  lifecycle_seq 1. storage.collaboration_projector.v1@1.0.0 applies it to the run, participant rows and
  advances the checkpoint with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.completion.v1, storage.collaboration_reader.participant_activity.v1,
  storage.collaboration_reader.composer_destination.v1, storage.collaboration_reader.inspection.v1.
  CollaborationRuntime appends it from CollaborationRuntime.admit_run(StartAdmission) through
  storage.collaboration_append.v1 and adopts storage.first_append_receipt.resolve.v2. Records keep
  RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave with their chat; projections keep RP-PROJECTION-3GEN.
  While it is withdrawn no run of any kind can be admitted, because every other run family needs a started
  run; existing runs keep their recorded history and continue only through the families still admitted.
  Started copies required_slot_ids from the selected definition projection into run_projection.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-107, CV-462, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.started is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, lifecycle_seq."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-232"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_started
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.started"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "already_started"
  - "definition_not_recorded"
  - "lineage_mismatch"
negative_constraints:
  - "Do not append collaboration.started before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-107, ContractName:Plans/Contracts_V0.md#CV-462, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-463 - Persistence of collaboration.paused

**Identity.** The subject is `collaboration_run_id`, `lifecycle_seq`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. Each pause is a new lifecycle identity because `lifecycle_seq` advances by exactly one per lifecycle event of the run.

**Admission checks, in order.** SP-460's common run checks; the run's status is `active` (`run_state_invalid`); `lifecycle_seq` is one more than the run's (`stale_lifecycle_seq`).

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the run row (collaboration_run_projection.v1): lifecycle status `paused`, `lifecycle_seq`, the pause time, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.composer_destination.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.record_paused(PauseReached)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** The event carries no message, inbox or composer text; what the pause preserves stays in its own records. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn the runtime cannot record a pause, so `cmd.collaboration.pause` is unavailable with `owner_unavailable`; runs keep running. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.paused`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationRunApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-463
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_paused prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.paused. Its subject is
  collaboration_run_id, lifecycle_seq, and its identity follows SP-460. Admission checks in order: SP-460's
  common run checks; the run's status is active (run_state_invalid); lifecycle_seq is one more than the run's
  (stale_lifecycle_seq). storage.collaboration_projector.v1@1.0.0 applies it to the run rows and advances the
  checkpoint with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.completion.v1, storage.collaboration_reader.composer_destination.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.record_paused(PauseReached) through storage.collaboration_append.v1 and adopts
  storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave
  with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn the runtime cannot record a
  pause, so cmd.collaboration.pause is unavailable with owner_unavailable; runs keep running.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-108, CV-463, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.paused is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, lifecycle_seq."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-233"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_paused
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.paused"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "run_state_invalid"
  - "stale_lifecycle_seq"
negative_constraints:
  - "Do not append collaboration.paused before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-108, ContractName:Plans/Contracts_V0.md#CV-463, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-464 - Persistence of collaboration.resumed

**Identity.** The subject is `collaboration_run_id`, `lifecycle_seq`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. Each resume is a new lifecycle identity because `lifecycle_seq` advances by exactly one.

**Admission checks, in order.** SP-460's common run checks; the run's status is `paused` (`run_state_invalid`); `lifecycle_seq` is one more than the run's (`stale_lifecycle_seq`).

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the run row (collaboration_run_projection.v1): lifecycle status `active`, `lifecycle_seq`, the resume time, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.composer_destination.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.record_resumed(ResumeAdmitted)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** Identities, enums and refs only. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn a paused run cannot be resumed (`cmd.collaboration.resume` unavailable with `owner_unavailable`); it can still be cancelled. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.resumed`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationRunApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-464
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_resumed prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.resumed. Its subject is
  collaboration_run_id, lifecycle_seq, and its identity follows SP-460. Admission checks in order: SP-460's
  common run checks; the run's status is paused (run_state_invalid); lifecycle_seq is one more than the run's
  (stale_lifecycle_seq). storage.collaboration_projector.v1@1.0.0 applies it to the run rows and advances the
  checkpoint with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.completion.v1, storage.collaboration_reader.composer_destination.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.record_resumed(ResumeAdmitted) through storage.collaboration_append.v1 and adopts
  storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave
  with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn a paused run cannot be resumed
  (cmd.collaboration.resume unavailable with owner_unavailable); it can still be cancelled.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-109, CV-464, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.resumed is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, lifecycle_seq."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-234"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_resumed
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.resumed"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "run_state_invalid"
  - "stale_lifecycle_seq"
negative_constraints:
  - "Do not append collaboration.resumed before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-109, ContractName:Plans/Contracts_V0.md#CV-464, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-465 - Persistence of collaboration.cancelled

**Identity.** The subject is `collaboration_run_id`, `lifecycle_seq`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. Its `lifecycle_seq` is the run's last; racing terminal events of one run carry the same sequence, so the first to append wins and the other gets an `idempotency_conflict` or `stale_lifecycle_seq`.

**Admission checks, in order.** SP-460's common run checks; status `active` or `paused` (`run_state_invalid`); `lifecycle_seq` one more (`stale_lifecycle_seq`); no attempt of the run is open (`open_attempts`). It makes the run terminal.

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the run row (collaboration_run_projection.v1): lifecycle status `cancelled` (terminal), `stop_reason`, the cancellation time, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.composer_destination.v1@1.0.0`, `storage.collaboration_reader.review_followon.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.record_cancelled(CancelSettled)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** Identities, enums, counts and refs only; the card, transcript, participants and artifacts are kept by their owners. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn no run can be cancelled through the runtime, so new run admissions are refused (a run must be able to reach every ending); runs already active continue and can still complete or fail. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.cancelled`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationRunApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-465
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_cancelled prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.cancelled. Its subject is
  collaboration_run_id, lifecycle_seq, and its identity follows SP-460. Admission checks in order: SP-460's
  common run checks; status active or paused (run_state_invalid); lifecycle_seq one more
  (stale_lifecycle_seq); no attempt of the run is open (open_attempts). It makes the run terminal.
  storage.collaboration_projector.v1@1.0.0 applies it to the run rows and advances the checkpoint with
  SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.completion.v1, storage.collaboration_reader.composer_destination.v1,
  storage.collaboration_reader.review_followon.v1, storage.collaboration_reader.inspection.v1.
  CollaborationRuntime appends it from CollaborationRuntime.record_cancelled(CancelSettled) through
  storage.collaboration_append.v1 and adopts storage.first_append_receipt.resolve.v2. Records keep
  RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave with their chat; projections keep RP-PROJECTION-3GEN.
  While it is withdrawn no run can be cancelled through the runtime, so new run admissions are refused (a run
  must be able to reach every ending); runs already active continue and can still complete or fail.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-110, CV-465, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.cancelled is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, lifecycle_seq."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-235"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_cancelled
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.cancelled"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "run_state_invalid"
  - "stale_lifecycle_seq"
  - "open_attempts"
negative_constraints:
  - "Do not append collaboration.cancelled before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-110, ContractName:Plans/Contracts_V0.md#CV-465, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-466 - Persistence of collaboration.completed

**Identity.** The subject is `collaboration_run_id`, `lifecycle_seq`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. Its `lifecycle_seq` is the run's last; it races the other terminal families on the same sequence as `collaboration.cancelled` does.

**Admission checks, in order.** SP-460's common run checks; status `active`, or `paused` with `chat_room_end` (`run_state_invalid`); `lifecycle_seq` one more (`stale_lifecycle_seq`); no attempt open (`open_attempts`); the supplied required set equals the retained definition set (`required_slot_set_mismatch`), the waived set equals actual dispositions (`waived_slot_set_mismatch`), and outside explicit Chat Room End every retained required slot has latest outcome `completed` or `explicitly_waived` (`unresolved_required_slots`); a BrainStorm run has its `brainstorm.plan_synthesized` and a Review run its `review.artifact_finalized` (`missing_output`); BrainStorm output_refs equals the singleton `assistant_plan:{assistant_plan_id}` from that run’s recorded synthesis (including its exact retained Plan version), and Review output_refs equals the singleton finalized artifact_version_ref (`output_refs_mismatch`). Crew/Chat Room retain their existing owner-settled output rules. It makes the run terminal.

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the run row (collaboration_run_projection.v1): lifecycle status `completed` (terminal), `completion_trigger`, the completion time, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.composer_destination.v1@1.0.0`, `storage.collaboration_reader.review_followon.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.record_completed(CompletionSettled)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** Identities, enums and refs only; result text stays in its artifact or Plan. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn no run can complete through the runtime, so new run admissions are refused; active runs can still be cancelled or fail, and none is ever inferred complete. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.completed`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationRunApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-466
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_completed prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.completed. Its subject is
  collaboration_run_id, lifecycle_seq, and its identity follows SP-460. Admission checks in order: SP-460's
  common run checks; status active, or paused with chat_room_end (run_state_invalid); lifecycle_seq one more
  (stale_lifecycle_seq); no attempt open (open_attempts); required_slot_ids equals the persisted original
  definition set (required_slot_set_mismatch), waived_slot_ids equals actual dispositions
  (waived_slot_set_mismatch), and outside explicit Chat Room End each retained required slot completes or
  is explicitly waived (unresolved_required_slots). BrainStorm/Review require their recorded synthesis/
  finalization (missing_output), and output_refs matches the exact recorded Plan or finalized artifact
  identity (output_refs_mismatch). Explicit Chat Room End preserves CWR-031 without a new waiver step. It makes the
  run terminal. storage.collaboration_projector.v1@1.0.0 applies it to the run rows and advances the
  checkpoint with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.completion.v1, storage.collaboration_reader.composer_destination.v1,
  storage.collaboration_reader.review_followon.v1, storage.collaboration_reader.inspection.v1.
  CollaborationRuntime appends it from CollaborationRuntime.record_completed(CompletionSettled) through
  storage.collaboration_append.v1 and adopts storage.first_append_receipt.resolve.v2. Records keep
  RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave with their chat; projections keep RP-PROJECTION-3GEN.
  While it is withdrawn no run can complete through the runtime, so new run admissions are refused; active
  runs can still be cancelled or fail, and none is ever inferred complete.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-111, CV-466, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.completed is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, lifecycle_seq."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-236"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_completed
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.completed"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "run_state_invalid"
  - "stale_lifecycle_seq"
  - "open_attempts"
  - "unresolved_required_slots"
negative_constraints:
  - "Do not append collaboration.completed before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-111, ContractName:Plans/Contracts_V0.md#CV-466, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

The required-slot set is retained from the definition/source snapshot committed by created/configuration_changed and frozen at Start; completion's exact set must match (`required_slot_set_mismatch`), and `waived_slot_ids` must equal actual current dispositions (`waived_slot_set_mismatch`). A shortened list never bypasses a failed required slot. BrainStorm output_refs names the exact recorded assistant_plan:{assistant_plan_id}; the captured synthesized Plan version is retained and never replaced by latest. Review output_refs names the exact finalized artifact_version_ref. Other kinds retain their existing completion predicate and owner-settled output facts from immutable source capture. Ordinary kind-specific outputs still apply; CWR-031's explicit Chat Room End settles without an invented waiver interaction.

### SP-467 - Persistence of collaboration.failed

**Identity.** The subject is `collaboration_run_id`, `lifecycle_seq`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. Its `lifecycle_seq` is the run's last; it races the other terminal families on the same sequence.

**Admission checks, in order.** SP-460's common run checks; status `active` or `paused` (`run_state_invalid`); `lifecycle_seq` one more (`stale_lifecycle_seq`); no attempt open (`open_attempts`). It makes the run terminal.

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the run row (collaboration_run_projection.v1): lifecycle status `failed` (terminal), `failure_reason`, the failure time, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.composer_destination.v1@1.0.0`, `storage.collaboration_reader.review_followon.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.record_failed(FailureSettled)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** The reason is a closed code; no provider error text, prompt or output is carried. Any failure sentence is presentation of the code. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn no run can be recorded failed, so new run admissions are refused; an active run that cannot reach an admitted ending stays non-terminal in the projection and is never inferred failed. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.failed`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationRunApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-467
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_failed prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-091 for collaboration.failed. Its subject is
  collaboration_run_id, lifecycle_seq, and its identity follows SP-460. Admission checks in order: SP-460's
  common run checks; status active or paused (run_state_invalid); lifecycle_seq one more
  (stale_lifecycle_seq); no attempt open (open_attempts). It makes the run terminal.
  storage.collaboration_projector.v1@1.0.0 applies it to the run rows and advances the checkpoint with
  SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.completion.v1, storage.collaboration_reader.composer_destination.v1,
  storage.collaboration_reader.review_followon.v1, storage.collaboration_reader.inspection.v1.
  CollaborationRuntime appends it from CollaborationRuntime.record_failed(FailureSettled) through
  storage.collaboration_append.v1 and adopts storage.first_append_receipt.resolve.v2. Records keep
  RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave with their chat; projections keep RP-PROJECTION-3GEN.
  While it is withdrawn no run can be recorded failed, so new run admissions are refused; an active run that
  cannot reach an admitted ending stays non-terminal in the projection and is never inferred failed.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-112, CV-467, DL-091, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.failed is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, lifecycle_seq."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-237"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_failed
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.failed"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "run_state_invalid"
  - "stale_lifecycle_seq"
  - "open_attempts"
negative_constraints:
  - "Do not append collaboration.failed before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-112, ContractName:Plans/Contracts_V0.md#CV-467, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-468 - Persistence of collaboration.participant_started

**Identity.** The subject is `collaboration_run_id`, `participant_slot_id`, `assignment_revision`, `attempt_id`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. Two slots on the same model have distinct attempt IDs and therefore distinct identities (section 2.2); a retry is a new attempt under the same assignment revision and a replacement raises the assignment revision (PART-001..006).

**Admission checks, in order.** SP-460's common run checks; status `active` (`run_state_invalid`); the slot is in the run's roster and not removed (`slot_not_in_roster`); the `attempt_id` has no started event in the run (`attempt_already_started`); `assignment_revision` is at least the slot's current one (`stale_assignment_revision`). It opens the attempt and makes it the slot's current attempt.

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the participant row (collaboration_participant_projection.v1): adds the open attempt with its assignment revision, role kind and requested/effective refs, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.participant_activity.v1@1.0.0`, `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.admit_attempt(AttemptAdmission)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** Identities and refs only; the attempt's prompt, context slice and private working slice are never carried. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn no attempt can be admitted, so new run admissions are refused; open attempts can still close. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.participant_started`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationParticipantApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-468
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_participant_started prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.participant_started. Its subject is
  collaboration_run_id, participant_slot_id, assignment_revision, attempt_id, and its identity follows SP-460.
  Admission checks in order: SP-460's common run checks; status active (run_state_invalid); the slot is in the
  run's roster and not removed (slot_not_in_roster); the attempt_id has no started event in the run
  (attempt_already_started); assignment_revision is at least the slot's current one
  (stale_assignment_revision). It opens the attempt and makes it the slot's current attempt.
  storage.collaboration_projector.v1@1.0.0 applies it to the participant rows and advances the checkpoint with
  SP-278's durable token; readers: storage.collaboration_reader.completion.v1,
  storage.collaboration_reader.participant_activity.v1, storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.admit_attempt(AttemptAdmission) through storage.collaboration_append.v1 and adopts
  storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave
  with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn no attempt can be admitted, so
  new run admissions are refused; open attempts can still close.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-113, CV-468, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.participant_started is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, participant_slot_id, assignment_revision, attempt_id."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-238"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_participant_started
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.participant_started"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "run_state_invalid"
  - "slot_not_in_roster"
  - "attempt_already_started"
  - "stale_assignment_revision"
negative_constraints:
  - "Do not append collaboration.participant_started before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-113, ContractName:Plans/Contracts_V0.md#CV-468, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-469 - Persistence of collaboration.participant_completed

**Identity.** The subject is `collaboration_run_id`, `participant_slot_id`, `assignment_revision`, `attempt_id`, with an absent `attempt_id` as JSON null; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. An attempt has exactly one outcome identity; a slot without an attempt has one attempt-less outcome identity per assignment revision. Replay of a recorded completion is idempotent on the attempt identity (section 15).

**Admission checks, in order.** SP-460's common run checks (a terminal run is `already_terminal`); with an `attempt_id`, the attempt was started for this slot and assignment revision (`unknown_attempt`) and has no outcome (`attempt_already_closed`); without one, the slot is in the roster (`slot_not_in_roster`) and has no attempt-less outcome under that assignment revision (`attempt_already_closed`); `explicitly_waived` needs a recorded waiver of the slot (`waiver_not_recorded`). It closes the attempt or slot; the slot's latest outcome is this one.

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the participant row (collaboration_participant_projection.v1): closes the attempt or slot with its outcome; the slot's current outcome is its latest by assignment revision and attempt order, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.participant_activity.v1@1.0.0`, `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.record_outcome(ParticipantOutcome)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A late result after a cancel fence or from a superseded attempt never reaches this append; it stays rejected or stale evidence with its owner.

**Custody and retention.** A waiver's reason is user text and stays in the disposition record; the event carries the waiver's actor and currentness only. No output, error text or transcript is carried. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn no outcome can be recorded, so new attempts and new runs are refused; an open attempt stays open in the projection and is never inferred finished. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.participant_completed`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/ParticipantDisposition` (Project) and `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/ParticipantDisposition` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-469
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_participant_completed prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.participant_completed. Its subject is
  collaboration_run_id, participant_slot_id, assignment_revision, attempt_id, and its identity follows SP-460.
  Admission checks in order: SP-460's common run checks (a terminal run is already_terminal); with an
  attempt_id, the attempt was started for this slot and assignment revision (unknown_attempt) and has no
  outcome (attempt_already_closed); without one, the slot is in the roster (slot_not_in_roster) and has no
  attempt-less outcome under that assignment revision (attempt_already_closed); explicitly_waived needs a
  recorded waiver of the slot (waiver_not_recorded). It closes the attempt or slot; the slot's latest outcome
  is this one. storage.collaboration_projector.v1@1.0.0 applies it to the participant rows and advances the
  checkpoint with SP-278's durable token; readers: storage.collaboration_reader.completion.v1,
  storage.collaboration_reader.participant_activity.v1, storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.record_outcome(ParticipantOutcome) through storage.collaboration_append.v1 and adopts
  storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave
  with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn no outcome can be recorded, so
  new attempts and new runs are refused; an open attempt stays open in the projection and is never inferred
  finished.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-114, CV-469, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.participant_completed is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, participant_slot_id, assignment_revision, attempt_id."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-239"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_participant_completed
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.participant_completed"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "already_terminal"
  - "unknown_attempt"
  - "attempt_already_closed"
  - "slot_not_in_roster"
negative_constraints:
  - "Do not append collaboration.participant_completed before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-114, ContractName:Plans/Contracts_V0.md#CV-469, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-470 - Persistence of collaboration.message_added

**Identity.** The subject is `collaboration_run_id`, `collaboration_message_id`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. The allocated `collaboration_message_id` is the identity, so a replayed completion resolves to the written message and writes nothing (EP-130).

**Admission checks, in order.** SP-460's common run checks; the `collaboration_message_id` has no event under an earlier epoch (`message_already_written`); `sequence` is exactly one more than the run's last written message (`sequence_gap`); a participant sender is a roster slot (`slot_not_in_roster`) and its `attempt_id`, when present, a started attempt of that slot (`unknown_attempt`).

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the run row (collaboration_run_projection.v1): the last written sequence; the participant row (collaboration_participant_projection.v1): the sender slot's last complete message ID (the lane quote source of CWR-030), and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.participant_activity.v1@1.0.0`, `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.write_message(MessageWrite)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt, and the message is delivered once (section 2.3).

**Custody and retention.** The message text is never in the event: it stays in the message record's body, which body_ref names. Readers apply the blind-phase rules of CWR-013 at read time, so the event's existence is never disclosed to a participant the protocol has not released it to. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn no message can be written through the runtime, so `cmd.collaboration.message` is unavailable and new runs are refused. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.message_added`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessage` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationMessageApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-470
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_message_added prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.message_added. Its subject is
  collaboration_run_id, collaboration_message_id, and its identity follows SP-460. Admission checks in order:
  SP-460's common run checks; the collaboration_message_id has no event under an earlier epoch
  (message_already_written); sequence is exactly one more than the run's last written message (sequence_gap);
  a participant sender is a roster slot (slot_not_in_roster) and its attempt_id, when present, a started
  attempt of that slot (unknown_attempt). storage.collaboration_projector.v1@1.0.0 applies it to the run,
  participant rows and advances the checkpoint with SP-278's durable token; readers:
  storage.collaboration_reader.participant_activity.v1, storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.write_message(MessageWrite) through storage.collaboration_append.v1 and adopts
  storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave
  with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn no message can be written
  through the runtime, so cmd.collaboration.message is unavailable and new runs are refused.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-115, CV-470, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.message_added is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, collaboration_message_id."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-240"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_message_added
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.message_added"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "message_already_written"
  - "sequence_gap"
  - "slot_not_in_roster"
  - "unknown_attempt"
negative_constraints:
  - "Do not append collaboration.message_added before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-115, ContractName:Plans/Contracts_V0.md#CV-470, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-471 - Persistence of collaboration.artifact_added

**Identity.** The subject is `collaboration_run_id`, `artifact_version_ref`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. The exact artifact version is the identity; a new version is a new event.

**Admission checks, in order.** SP-460's common run checks; the `artifact_version_ref` has no event in the run under an earlier epoch (`artifact_already_added`).

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the artifact row (collaboration_artifact_projection.v1): adds the artifact membership row; the run row (collaboration_run_projection.v1): the artifact count, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.attach_artifact(ArtifactAttached)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** The artifact's bytes, versions and retention stay with the artifact owner; the event holds references only, so deleting the chat removes the event and never purges a shared artifact (section 2.4). Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn no artifact can be attached, so new Review runs are refused (they must finalize an artifact) and other kinds continue without attaching. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.artifact_added`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationRunApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-471
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_artifact_added prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.artifact_added. Its subject is
  collaboration_run_id, artifact_version_ref, and its identity follows SP-460. Admission checks in order:
  SP-460's common run checks; the artifact_version_ref has no event in the run under an earlier epoch
  (artifact_already_added). storage.collaboration_projector.v1@1.0.0 applies it to the artifact, run rows and
  advances the checkpoint with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.attach_artifact(ArtifactAttached) through storage.collaboration_append.v1 and adopts
  storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave
  with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn no artifact can be attached, so
  new Review runs are refused (they must finalize an artifact) and other kinds continue without attaching.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-116, CV-471, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.artifact_added is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, artifact_version_ref."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-241"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_artifact_added
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.artifact_added"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "artifact_already_added"
negative_constraints:
  - "Do not append collaboration.artifact_added before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-116, ContractName:Plans/Contracts_V0.md#CV-471, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-472 - Persistence of collaboration.configuration_changed

**Identity.** The subject is `collaboration_id`, `definition_revision`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. The new revision is the identity, so a revision is recorded once per collaboration.

**Admission checks, in order.** the `collaboration_id` has a recorded definition (`definition_not_recorded`) whose kind and thread equal the payload's (`lineage_mismatch`). For `start_commit`: the run has no event (`already_started`) and the collaboration's latest recorded revision equals `previous_definition_revision` (`stale_definition_revision`). For `reconfigure`: the run is started (`run_not_started`), its lineage matches (`lineage_mismatch`), it is not terminal (`already_terminal`), and both the run's current revision and the collaboration's latest revision equal `previous_definition_revision` (`stale_definition_revision`). It records the new revision; a reconfigure also sets the run's current revision, adds `add_participant` slots to the roster, marks `remove_participant` slots removed, records `waive_participant` slots as waived and records `accept_stale_target`.

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the definition row (collaboration_definition_projection.v1): the latest recorded revision; the run row (collaboration_run_projection.v1): for reconfigure: the run's current definition revision, roster additions and recorded waivers, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.participant_activity.v1@1.0.0`, `storage.collaboration_reader.review_followon.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Requiredness projection.** Configuration change updates the definition and any active run required_slot_ids from the new independently frozen definition set.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.commit_revision(RevisionCommit)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** A waiver's reason, a replacement's Persona text and any job text stay in the definition record; the event carries change kinds, slot IDs and refs only. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn no revision after the first can be committed, so `cmd.collaboration.reconfigure` is unavailable (retry, replacement, waiver, added rounds and Grill Me mid-run with it) and re-running an existing collaboration is refused; new collaborations can still start. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `collaboration.configuration_changed`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeDefinition` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationDefinitionApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-472
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own collaboration_configuration_changed prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for collaboration.configuration_changed. Its subject is
  collaboration_id, definition_revision, and its identity follows SP-460. Admission checks in order: the
  collaboration_id has a recorded definition (definition_not_recorded) whose kind and thread equal the
  payload's (lineage_mismatch). For start_commit: the run has no event (already_started) and the
  collaboration's latest recorded revision equals previous_definition_revision (stale_definition_revision).
  For reconfigure: the run is started (run_not_started), its lineage matches (lineage_mismatch), it is not
  terminal (already_terminal), and both the run's current revision and the collaboration's latest revision
  equal previous_definition_revision (stale_definition_revision). It records the new revision; a reconfigure
  also sets the run's current revision, adds add_participant slots to the roster, marks remove_participant
  slots removed, records waive_participant slots as waived and records accept_stale_target.
  storage.collaboration_projector.v1@1.0.0 applies it to the definition, run rows and advances the checkpoint
  with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.completion.v1, storage.collaboration_reader.participant_activity.v1,
  storage.collaboration_reader.review_followon.v1, storage.collaboration_reader.inspection.v1.
  CollaborationRuntime appends it from CollaborationRuntime.commit_revision(RevisionCommit) through
  storage.collaboration_append.v1 and adopts storage.first_append_receipt.resolve.v2. Records keep
  RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave with their chat; projections keep RP-PROJECTION-3GEN.
  While it is withdrawn no revision after the first can be committed, so cmd.collaboration.reconfigure is
  unavailable (retry, replacement, waiver, added rounds and Grill Me mid-run with it) and re-running an
  existing collaboration is refused; new collaborations can still start.
  Configuration change updates the definition and any active run required_slot_ids from the new independently frozen definition set.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-117, CV-472, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "collaboration.configuration_changed is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_id, definition_revision."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-242"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_collaboration_configuration_changed
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.configuration_changed"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "definition_not_recorded"
  - "lineage_mismatch"
  - "already_started"
  - "stale_definition_revision"
negative_constraints:
  - "Do not append collaboration.configuration_changed before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-117, ContractName:Plans/Contracts_V0.md#CV-472, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-473 - Persistence of brainstorm.proposal_added

**Identity.** The subject is `collaboration_run_id`, `proposal_id`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. The `proposal_id` is the identity.

**Admission checks, in order.** SP-460's common run checks (a payload naming a non-BrainStorm run fails `lineage_mismatch`); status `active` (`run_state_invalid`); the `attempt_id` was started for the proposer's slot (`unknown_attempt`) with `additive_role_kind` `none` (`not_core_participant`); the `proposal_id` has no event under an earlier epoch (`proposal_already_added`).

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the proposal row (collaboration_proposal_projection.v1): adds the proposal row with zero tallies, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.release_proposal(ProposalNormalized)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** Text protection (DL-090). The event carries no proposal text: no approach, assumptions, benefits, costs, risks, migrations, cross-system effects, validation, rollback or evidence. That text stays in the proposal record, which proposal_record_ref names. Deleting the chat deletes the event under the chat-lifetime policy; the record and its text follow the same chat lifetime, holds and deletion deadlines under E-CARDS-1 1c A; independently retained artifacts and receipts remain independent. Readers disclose a proposal row only after the protocol releases it (CWR-013). Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn new BrainStorm runs are refused; an active BrainStorm cannot normalize proposals and waits, never inferring a proposal. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `brainstorm.proposal_added`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/BrainstormProposal` (Project) and `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/BrainstormProposal` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-473
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own brainstorm_proposal_added prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for brainstorm.proposal_added. Its subject is
  collaboration_run_id, proposal_id, and its identity follows SP-460. Admission checks in order: SP-460's
  common run checks (a payload naming a non-BrainStorm run fails lineage_mismatch); status active
  (run_state_invalid); the attempt_id was started for the proposer's slot (unknown_attempt) with
  additive_role_kind none (not_core_participant); the proposal_id has no event under an earlier epoch
  (proposal_already_added). storage.collaboration_projector.v1@1.0.0 applies it to the proposal rows and
  advances the checkpoint with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.release_proposal(ProposalNormalized) through storage.collaboration_append.v1 and adopts
  storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave
  with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn new BrainStorm runs are refused;
  an active BrainStorm cannot normalize proposals and waits, never inferring a proposal.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-118, CV-473, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "brainstorm.proposal_added is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, proposal_id."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-243"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_brainstorm_proposal_added
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "brainstorm.proposal_added"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "lineage_mismatch"
  - "run_state_invalid"
  - "unknown_attempt"
  - "not_core_participant"
negative_constraints:
  - "Do not append brainstorm.proposal_added before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-118, ContractName:Plans/Contracts_V0.md#CV-473, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-474 - Persistence of brainstorm.vote_added

**Identity.** The subject is `collaboration_run_id`, `vote_id`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. The `vote_id` is the identity.

**Admission checks, in order.** SP-460's common run checks; status `active` (`run_state_invalid`); the proposal has a `brainstorm.proposal_added` event (`unknown_proposal`); the voter's `attempt_id` was started for its slot (`unknown_attempt`) and is not a Wonderer attempt (`wonderer_cannot_vote`); it is the slot's current attempt and has no outcome other than `completed` (`attempt_not_current`); the `vote_id` has no event under an earlier epoch (`vote_already_added`). Tallies count a vote while its attempt stays the slot's current attempt with no outcome other than `completed`.

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the vote row (collaboration_vote_projection.v1): adds the vote row; the proposal row (collaboration_proposal_projection.v1): updates support, oppose and abstain tallies from counted votes, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.record_vote(VoteCast)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** The vote's reason and evidence are text and stay in the vote record; the event carries the position, confidence and constraint IDs only. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn new BrainStorm runs are refused; an active BrainStorm cannot record votes and never infers one. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `brainstorm.vote_added`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/BrainstormVote` (Project) and `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/BrainstormVote` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-474
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own brainstorm_vote_added prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for brainstorm.vote_added. Its subject is
  collaboration_run_id, vote_id, and its identity follows SP-460. Admission checks in order: SP-460's common
  run checks; status active (run_state_invalid); the proposal has a brainstorm.proposal_added event
  (unknown_proposal); the voter's attempt_id was started for its slot (unknown_attempt) and is not a Wonderer
  attempt (wonderer_cannot_vote); it is the slot's current attempt and has no outcome other than completed
  (attempt_not_current); the vote_id has no event under an earlier epoch (vote_already_added). Tallies count a
  vote while its attempt stays the slot's current attempt with no outcome other than completed.
  storage.collaboration_projector.v1@1.0.0 applies it to the vote, proposal rows and advances the checkpoint
  with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.record_vote(VoteCast) through storage.collaboration_append.v1 and adopts
  storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave
  with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn new BrainStorm runs are refused;
  an active BrainStorm cannot record votes and never infers one.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-119, CV-474, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "brainstorm.vote_added is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, vote_id."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-244"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_brainstorm_vote_added
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "brainstorm.vote_added"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "run_state_invalid"
  - "unknown_proposal"
  - "unknown_attempt"
  - "wonderer_cannot_vote"
negative_constraints:
  - "Do not append brainstorm.vote_added before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-119, ContractName:Plans/Contracts_V0.md#CV-474, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-475 - Persistence of brainstorm.plan_synthesized

**Identity.** The subject is `collaboration_run_id`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. The run alone is the subject: a run has one synthesis identity, matching "exactly one synthesized Deep Plan document" (section 8.1).

**Admission checks, in order.** SP-460's common run checks; status `active` (`run_state_invalid`); the run has no synthesis event under an earlier epoch (`already_synthesized`).

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the run row (collaboration_run_projection.v1): the synthesized Plan identity and version, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.record_synthesis(PlanCreated)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A second synthesis request resolves to the original Plan identity and event; no second Plan is requested.

**Custody and retention.** The Plan's text belongs to the Plan owner; dissent and alternatives are counted, never quoted. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn new BrainStorm runs are refused; an active BrainStorm cannot record its Plan and cannot complete. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `brainstorm.plan_synthesized`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationRunApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-475
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own brainstorm_plan_synthesized prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for brainstorm.plan_synthesized. Its subject is
  collaboration_run_id, and its identity follows SP-460. Admission checks in order: SP-460's common run
  checks; status active (run_state_invalid); the run has no synthesis event under an earlier epoch
  (already_synthesized). storage.collaboration_projector.v1@1.0.0 applies it to the run rows and advances the
  checkpoint with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.completion.v1, storage.collaboration_reader.inspection.v1. CollaborationRuntime
  appends it from CollaborationRuntime.record_synthesis(PlanCreated) through storage.collaboration_append.v1
  and adopts storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded
  and leave with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn new BrainStorm runs
  are refused; an active BrainStorm cannot record its Plan and cannot complete.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-120, CV-475, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "brainstorm.plan_synthesized is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-245"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_brainstorm_plan_synthesized
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "brainstorm.plan_synthesized"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "run_state_invalid"
  - "already_synthesized"
negative_constraints:
  - "Do not append brainstorm.plan_synthesized before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-120, ContractName:Plans/Contracts_V0.md#CV-475, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-476 - Persistence of review.finding_added

**Identity.** The subject is `collaboration_run_id`, `finding_id`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. The `finding_id` is the identity; findings that share a `finding_key` stay distinct records.

**Admission checks, in order.** SP-460's common run checks (a payload naming a non-Review run fails `lineage_mismatch`); status `active` (`run_state_invalid`); `target_hashes` equal the run's frozen pack hashes from its `collaboration.started` (`target_hash_mismatch`); every originating reviewer is a roster slot (`slot_not_in_roster`); the `finding_id` has no event under an earlier epoch (`finding_already_added`).

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the finding row (collaboration_finding_projection.v1): adds the finding row, undisposed, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.review_followon.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.release_finding(FindingNormalized)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** Text protection (DL-090). The event carries no finding text: no claim, category, evidence, dissent or proposed remediation. That text stays in the finding record, which finding_record_ref names. Deleting the chat deletes the event under the chat-lifetime policy; the record and its text follow the same chat lifetime, holds and deletion deadlines under E-CARDS-1 1c A. Readers disclose a finding only after normalization releases it (CWR-013). Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn new Review runs are refused; an active Review cannot normalize findings and cannot finalize. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `review.finding_added`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/ReviewFinding` (Project) and `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/ReviewFinding` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-476
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own review_finding_added prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for review.finding_added. Its subject is
  collaboration_run_id, finding_id, and its identity follows SP-460. Admission checks in order: SP-460's
  common run checks (a payload naming a non-Review run fails lineage_mismatch); status active
  (run_state_invalid); target_hashes equal the run's frozen pack hashes from its collaboration.started
  (target_hash_mismatch); every originating reviewer is a roster slot (slot_not_in_roster); the finding_id has
  no event under an earlier epoch (finding_already_added). storage.collaboration_projector.v1@1.0.0 applies it
  to the finding rows and advances the checkpoint with SP-278's durable token; readers:
  storage.collaboration_reader.run_view.v1, storage.collaboration_reader.review_followon.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.release_finding(FindingNormalized) through storage.collaboration_append.v1 and adopts
  storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave
  with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn new Review runs are refused; an
  active Review cannot normalize findings and cannot finalize.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-121, CV-476, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "review.finding_added is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, finding_id."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-246"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_review_finding_added
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "review.finding_added"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "lineage_mismatch"
  - "run_state_invalid"
  - "target_hash_mismatch"
  - "slot_not_in_roster"
negative_constraints:
  - "Do not append review.finding_added before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-121, ContractName:Plans/Contracts_V0.md#CV-476, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-477 - Persistence of review.finding_dispositioned

**Identity.** The subject is `collaboration_run_id`, `finding_id`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. The `finding_id` is the identity: one final disposition per finding.

**Admission checks, in order.** SP-460's common run checks; status `active` (`run_state_invalid`); the finding has a `review.finding_added` event (`unknown_finding`) and no disposition (`already_dispositioned`); `target_hashes` equal the finding's (`target_hash_mismatch`).

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the finding row (collaboration_finding_projection.v1): the final disposition, confidence and dissent count, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.review_followon.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.record_adjudication(FindingAdjudicated)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A lost acknowledgement returns the original receipt and appends nothing new.

**Custody and retention.** Text protection (DL-090). Dissent and the adjudication's reasoning are text and stay in the finding record; the event carries counts, the closed disposition and refs only. Its deletion follows the chat, and the record and its text follow the chat lifetime, holds and deletion deadlines under E-CARDS-1 1c A. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn new Review runs are refused; an active Review cannot record dispositions and cannot finalize. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `review.finding_dispositioned`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/ReviewFinding` (Project) and `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/ReviewFinding` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-477
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own review_finding_dispositioned prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for review.finding_dispositioned. Its subject is
  collaboration_run_id, finding_id, and its identity follows SP-460. Admission checks in order: SP-460's
  common run checks; status active (run_state_invalid); the finding has a review.finding_added event
  (unknown_finding) and no disposition (already_dispositioned); target_hashes equal the finding's
  (target_hash_mismatch). storage.collaboration_projector.v1@1.0.0 applies it to the finding rows and advances
  the checkpoint with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.review_followon.v1, storage.collaboration_reader.inspection.v1.
  CollaborationRuntime appends it from CollaborationRuntime.record_adjudication(FindingAdjudicated) through
  storage.collaboration_append.v1 and adopts storage.first_append_receipt.resolve.v2. Records keep
  RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and leave with their chat; projections keep RP-PROJECTION-3GEN.
  While it is withdrawn new Review runs are refused; an active Review cannot record dispositions and cannot
  finalize.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-122, CV-477, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "review.finding_dispositioned is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id, finding_id."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-247"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_review_finding_dispositioned
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "review.finding_dispositioned"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "run_state_invalid"
  - "unknown_finding"
  - "already_dispositioned"
  - "target_hash_mismatch"
negative_constraints:
  - "Do not append review.finding_dispositioned before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-122, ContractName:Plans/Contracts_V0.md#CV-477, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

### SP-478 - Persistence of review.artifact_finalized

**Identity.** The subject is `collaboration_run_id`; `owner_operation_id`, `idempotency_key` and `event_id` follow SP-460's recipe with it. The run alone is the subject: a Review run finalizes one artifact; Run Another Review is a new run.

**Admission checks, in order.** SP-460's common run checks; status `active` (`run_state_invalid`); no finalization exists (`already_finalized`); every added finding has a disposition (`findings_not_dispositioned`); the `artifact_version_ref` has a `collaboration.artifact_added` event in the run (`artifact_not_added`); `target_hashes` equal the run's (`target_hash_mismatch`); fewer completed than requested reviewers needs `partial_coverage_accepted` and a recorded waiver in the run (`partial_not_accepted`); `stale_target_accepted` needs a recorded reconfigure with `accept_stale_target` (`stale_not_accepted`).

**Consumers and checkpoint.** `storage.collaboration_projector.v1@1.0.0` applies it to the run row (collaboration_run_projection.v1): the finalized Review artifact, coverage and staleness, and advances the scope partition's checkpoint in the same transaction (SP-460, SP-278 by name). Its readers are `storage.collaboration_reader.run_view.v1@1.0.0`, `storage.collaboration_reader.completion.v1@1.0.0`, `storage.collaboration_reader.review_followon.v1@1.0.0`, `storage.collaboration_reader.inspection.v1@1.0.0`.

**Producer and first receipt.** `CollaborationRuntime` calls `storage.collaboration_append.v1@1.0.0` from `CollaborationRuntime.finalize_review(ReviewArtifactFinalized)` after the owner commit that holds the prepared event, and adopts `storage.first_append_receipt.resolve.v2` for it (SP-460). A retry resolves to the original finalization; the thread summary links the same version.

**Custody and retention.** The artifact's text stays with the artifact owner; the event carries refs, hashes, counts and flags only. Its records are kept as long as the chat named by `thread_id` exists, under `RP-CHAT-THREAD-LIFETIME@1.0.0` once its Storage landing records it; its projection rows use `RP-PROJECTION-3GEN@1.0.0`.

**Withdrawal.** While it is withdrawn new Review runs are refused; an active Review cannot finalize and cannot complete. The writer is cut off first, then the checkpoint core is withdrawn and readers fenced, then a governed rebuild keeps every original event (SP-460).

**Prepared source for `review.artifact_finalized`.** This family uses the registered `collaboration_prepared_source` key and canonical transaction of SP-460, its own `Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized` project/application holder pair, and the exact typed owners `https://puppetmaster.local/schemas/collaborative_workflows/1.0.0/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun` (Project) and `https://puppetmaster.local/schemas/application-workflows/1.0.0/contracts.schema.json#/$defs/CollaborationRunApplicationV1` (application). The owner reference recipe is source_record_ref in SP-460; its physical key, actual Storage instance, captured write epoch, owner hash, full semantic body and original operation/event identities must all join. Coherent backup/restore carries this exact snapshot and its referenced originals; no sibling source substitutes and no append before this family's admission. Newly authored owner contract under DL-090; native source provenance, transaction and restore remain NOT_RUN.

```yaml
plan_unit_id: SP-478
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  This family explicitly adopts its own review_artifact_finalized prepared-source holder under SP-460,
  preserving its selected typed owner editions, atomic source custody and exact recovery identity joins.
  Newly authored Storage owner contract under DL-090 for review.artifact_finalized. Its subject is
  collaboration_run_id, and its identity follows SP-460. Admission checks in order: SP-460's common run
  checks; status active (run_state_invalid); no finalization exists (already_finalized); every added finding
  has a disposition (findings_not_dispositioned); the artifact_version_ref has a collaboration.artifact_added
  event in the run (artifact_not_added); target_hashes equal the run's (target_hash_mismatch); fewer completed
  than requested reviewers needs partial_coverage_accepted and a recorded waiver in the run
  (partial_not_accepted); stale_target_accepted needs a recorded reconfigure with accept_stale_target
  (stale_not_accepted). storage.collaboration_projector.v1@1.0.0 applies it to the run rows and advances the
  checkpoint with SP-278's durable token; readers: storage.collaboration_reader.run_view.v1,
  storage.collaboration_reader.completion.v1, storage.collaboration_reader.review_followon.v1,
  storage.collaboration_reader.inspection.v1. CollaborationRuntime appends it from
  CollaborationRuntime.finalize_review(ReviewArtifactFinalized) through storage.collaboration_append.v1 and
  adopts storage.first_append_receipt.resolve.v2. Records keep RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded and
  leave with their chat; projections keep RP-PROJECTION-3GEN. While it is withdrawn new Review runs are
  refused; an active Review cannot finalize and cannot complete.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [SP-460, CWR-123, CV-478, DL-090, SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - "review.artifact_finalized is admitted only after the checks this unit lists, in order, and a refusal appends nothing."
  - "Its idempotency key and event ID follow SP-460 with the subject collaboration_run_id."
  - "Its projection effects and checkpoint advance commit together under compare-and-swap."
  - "Its retention is RP-CHAT-THREAD-LIFETIME@1.0.0 once recorded, and its withdrawal never deletes source."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-248"
risk_class: collaborative_event_persistence_drift
reasoning_tier: high
context_scope: collaborative_event_persistence_review_artifact_finalized
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/collaboration_projection_contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "review.artifact_finalized"
  - "storage.collaboration_append.v1"
  - "storage.collaboration_projector.v1"
  - "run_state_invalid"
  - "already_finalized"
  - "findings_not_dispositioned"
  - "artifact_not_added"
negative_constraints:
  - "Do not append review.artifact_finalized before its own admission landing."
  - "Do not infer its rows from a sibling family or a rendered state."
  - "Do not delete its source events on withdrawal."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Collaborative_Workflows.md#CWR-123, ContractName:Plans/Contracts_V0.md#CV-478, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286
