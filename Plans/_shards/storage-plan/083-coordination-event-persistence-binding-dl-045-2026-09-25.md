# Shard 083: Coordination event persistence binding (DL-045, 2026-09-25)

Source: `Plans/storage-plan.md`

Source lines: L26882-L27104

Source SHA256: `ec8f477e0e1e3eaa19e3532c956714f4f4343a50e9dbba00d8a28a093a0b2a17`

---

## Coordination event persistence binding (DL-045, 2026-09-25)

This is a **newly authored Storage owner contract under DL-045** for exactly seven families: `coordination.agent_registered`, `coordination.agent_status_updated`, `coordination.agent_operation_updated`, `coordination.agent_file_ownership_updated`, `coordination.agent_unregistered`, `coordination.agent_crashed` and `coordination.agent_aborted`. The per-family search that DL-045 requires is `reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md`. It found section 2.3.2, SP-232 and the two deferred registry families, but no projector identity or version, checkpoint value schema, payload schema, identity recipe, transition rule or first-receipt adoption. Section 2.3.2 stays in force; this section makes it exact.

The semantic owner of the seven is OSI-438 in `Plans/orchestrator-subagent-integration.md`, and their closed payloads are CV-353 in `Plans/Contracts_V0.md`. This section reuses existing bindings by name, each in the role, version and scope its owner defines: SP-278's generic EventRecord index checkpoint with the nine-field durable read token (DL-076), SP-286/CV-339's `storage.first_append_receipt.resolve.v2`, `RP-COORDINATION-180D@1.0.0` and `RP-PROJECTION-3GEN@1.0.0`, and the checkpoint key `projector.checkpoint.coordination:{project_id}` that SP-232 and CV-310 already name. No sibling binding is borrowed: the Browser, compaction and Home checkpoints are not reused.

Nothing here admits a family. Each of the seven stays quarantined before append or projection, and absent from `Plans/event_family_registry.json`, until its own Storage admission landing, one family per landing (DL-045). Preparing the seven together is not admission. `coordination.debug_mirror_exported` is outside this contract (last subsection).

### Identities

Each identity below is newly defined here:

- `storage.coordination_append.v1@1.0.0` is the PM-owned coordination append admission that section 2.3.2 names. It is the only path that appends the seven families, and `AgentCoordinator` (OSI-438) is its only caller. Platform hook and provider event adapters are observation sources for `AgentCoordinator`, not producers of the record family.
- `storage.coordination_projector.v1@1.0.0` is the only direct consumer of the seven families' events. It is the only writer of the four projection key shapes and of the checkpoint.
- Five readers, one for each consumer role of the registry family `coordination_read_model_projections`. Each reads projections only; none reads events or mirrors, and none writes.
  - `storage.coordination_reader.scheduler.v1@1.0.0` for the Orchestrator scheduler;
  - `storage.coordination_reader.agent_coordinator.v1@1.0.0` for `AgentCoordinator`'s context, conflict and query reads;
  - `storage.coordination_reader.prompt_context.v1@1.0.0` for the prompt context assembler;
  - `storage.coordination_reader.mirror_export.v1@1.0.0` for the debug mirror exporter;
  - `storage.coordination_reader.inspection.v1@1.0.0` for inspection views.

The registry's role names ("coordination projector", "Orchestrator scheduler" and the others) refer to these identities. A role name alone never grants a read.

### Physical binding and values

**Checkpoint.** The key stays `projector.checkpoint.coordination:{project_id}`, one per Project, in redb's existing `checkpoints` table. The version is in the value, not the key. The value is canonical MessagePack `pm.storage_value.coordination_projector_checkpoint.v1@1.0.0`, defined at `Plans/coordination_projection_contracts.schema.json#/$defs/checkpoint`. Its fields are:
- `schema_id` and `schema_version`;
- `storage_instance_id`, `project_id`, and `scope_partition`, the existing `project~{base64url_no_pad(UTF8(project_id))}` encoding;
- `projector_id` `storage.coordination_projector.v1` and `projector_version` `1.0.0`;
- `admitted_event_types`, the sorted exact list of coordination event types that were admitted in the registry when this publication was built;
- `index_read_token`, the nine-field durable read token of SP-278 (DL-076);
- `first_retained_sequence_id` and `index_through_sequence_id`, the examined bounds of the generic index, and `source_cursor`, SP-278's inclusive `coverage.last_frame` with its frame-end offset;
- `filter_complete`, `state` (`current`, `degraded` or `withdrawn`), `health` (`healthy` or `degraded`), `updated_at_utc` and `withdrawn_at_utc`;
- `publication_id`, `published_at_utc`, `hold_refs` and `retired_generations`.

**Projections.** The four projection key shapes of section 2.3.2 are rows of one redb table named `coordination_read_model_projections`, in the same redb database as `checkpoints`, so that one write transaction covers rows and checkpoint. Their values are `pm.storage_value.coordination_agent_projection.v1`, `pm.storage_value.coordination_file_projection.v1`, `pm.storage_value.coordination_operation_projection.v1` and `pm.storage_value.coordination_snapshot_projection.v1`, each at version `1.0.0`. They are defined at `#/$defs/agent_projection`, `#/$defs/file_projection`, `#/$defs/operation_projection` and `#/$defs/snapshot_projection` of the same schema file. Each value carries its own `schema_id` and `schema_version`, so replay dispatches by schema and never by key template (section 2.3.1). Each value also carries the `publication_id` of the checkpoint core it belongs to.

**Binding record.** The same schema file carries `x-pm-event-authority-binding`, this section's binding in machine form for the admission ledger and the checkers: the semantic, payload and Storage owners, `AgentCoordinator` and `storage.coordination_append.v1@1.0.0`, the first-receipt resolver, the projector and the five readers, the two registry families, the checkpoint key, schema and stored read token, both retention policies, and each family's payload schema and entry point. It restates the identities above and adds none.

**Registry.** Storage materializes the two deferred registry families in place from these definitions. `coordination_event_records` takes the CV-353 payload definitions of `Plans/coordination_event_payloads.schema.json`, one for each event type of its key shape. `coordination_read_model_projections` takes one closed value per key shape from `Plans/coordination_projection_contracts.schema.json`. Their producer and consumer lists name the identities above. The family count does not change, and materializing the registry rows admits no event.

Both rows are SP-320 keyed value compositions, the registry shape section 2.3.1 describes: each row's `value_schema_id` names a nonstored validation composition with one closed member per key shape, and each projection member keeps its own `schema_id`. The records row is canonical, restored from the mandatory backup and never rebuilt; the projections row is derived and rebuilt from seglog through SP-278. The census moves to 274 materialized and 19 deferred. The records row's retention text now restates `RP-COORDINATION-180D@1.0.0` and SP-320's anchor rule. Its earlier wording, "retain under runtime audit policy", contradicted the structured reference, which governs (DL-029 PD-SCHEMA-01).

### SP-278 adoption and atomic advance

The projector explicitly adopts SP-278's generic index checkpoint and its reader. Each advance runs these steps:

1. `reader.storage.event_record_index@1.0.0` first establishes the independently published, CURRENT-selected, globally complete SP-278 snapshot. It resolves the root in `checkpoints` and the selected `event_record_index.v2@{generation_id}` table in the same redb instance, and verifies live source controls, frames, hashes, CRC, coverage, lawful gaps, schema dispatch and dedupe through that owner. Neither this projector nor a supplied token can publish the generic index.
2. The projector scans the complete captured range with an exact filter: this Project's partition and the event types in `admitted_event_types`. It resolves each matching EventRecord and payload, and verifies registry admission, envelope and payload identity and the CV-353 payload definition. It applies matching events strictly in canonical sequence order, through the transition table below. A verified nonmatch is skipped. Unsupported, corrupt, unavailable or unexplained missing source is not skipped: the advance fails, or a governed rebuild follows.
3. The projector commits the changed projection rows and the checkpoint in one redb write transaction, with exact prior-value compare-and-swap on the checkpoint: its publication, cursor and token must still equal what this advance read. The generic root, generation, anchor, frontier and read token, and the complete examined range, must still match. This transaction writes no index row, generic checkpoint, EventRecord or mirror. A stale compare-and-swap, a cursor regression, a changed scope or an unproved empty range fails or leads to a governed rebuild, never to an ordinary advance.
4. An inclusive restart rechecks the last applied frame's exact identity and end offset before continuing. Applying an event changes projection rows and nothing else.

`index_read_token` stores the nine-field durable read token that SP-278 defines on 2026-09-24, so no `redb_snapshot_id` is stored (DL-076). Every advance, read and recovery joins the snapshot ID of its own live read transaction to the stored nine fields and revalidates the whole ten-field token. A read never rewrites the stored checkpoint merely to inspect it. An equal generation ID alone proves nothing, because an ordinary append can advance the frontier and keep the generation.

`current` requires healthy, complete, verified coverage, with `filter_complete` true. `degraded` keeps the generic index's actual survivor or loss status and supports no latest or mutation claim. `withdrawn` stops ordinary advance and every read. Empty, degraded and zero-match coverage stay distinct: a proven empty source has null bounds and cursor, while a nonempty source with no coordination event still has its examined bounds and cursor. Missing or unreadable coverage is not empty.

### Readers and coverage

Each reader identity:
- resolves the checkpoint and requires `state` `current`;
- requires `admitted_event_types` to contain every family its read depends on;
- requires coverage of the sequence it needs: after its own append, `index_through_sequence_id` at or beyond the receipt's `sequence_id`; for a latest read, a token equal to the current SP-278 frontier;
- accepts only rows whose `publication_id` equals the current checkpoint core's, and only schema IDs and versions it supports;
- applies current Project and thread permission and existing deletion tombstones before it discloses a row.

Otherwise the read returns typed unavailable or stale. A reader never reads mirrors, never falls back to older rows and never writes. The scheduler and the prompt context assembler treat unavailable as a fail-closed `coordination_conflict` (OSI-438). The mirror exporter writes a mirror only from a current read, and the mirror's source metadata names the checkpoint's cursor.

### Admission, identity and compare-and-swap

`storage.coordination_append.v1@1.0.0` admits one event at a time, under the existing Storage append-writer lock, in this order:

1. **Exact retry.** The existing dedupe policy resolves an exact retry, with the same `(scope_partition, event_type, idempotency_key)` and producer semantic digest, to the original event and result, even when the agent has since moved on. The receipt comes only from `storage.first_append_receipt.resolve.v2` (below). The same identity with a different digest is `idempotency_conflict` and never appends.
2. **Family admission.** An event type that the registry does not admit is quarantined before append (Contracts: "quarantined before append or projection"). Nothing is appended and no checkpoint advances.
3. **Payload.** The payload must validate against its CV-353 definition, including the no-secret rules and closed domains, and must join the EventRecord envelope as CV-353 requires.
4. **Current projection.** The projector first brings the checkpoint up to the verified tail for this Project, as the dedupe index is caught up under the same lock. If it cannot, the call returns `coordination_projection_unavailable` and appends nothing.
5. **Transition and revision.** The transition table and the revision rule are checked against the agent's current projection row. A failure returns `coordination_conflict` with one `conflict_kind`: `stale_revision`, `not_registered`, `already_registered`, `already_terminal` or `lineage_mismatch`. Nothing is appended.
6. **Change.** An update that changes nothing returns `coordination_unchanged`, appends nothing and advances no revision (OSI-438).
7. **Append.** The event is appended through the ordinary EventRecord path, with both source durability barriers and first-receipt custody (below). The projector applies it in its next advance.

The identity recipe is newly defined here:
- **Revision.** `agent_revision` is 1 at registration, and each later event of the same agent is exactly 1 higher than the agent's previous event. `expected_previous_revision`, when present, must equal `agent_revision` minus 1, and `last_applied_event_id`, when present, must equal the agent row's `last_applied_event_id`. Any other value is `stale_revision`.
- **Idempotency key.** `idempotency_key` is `coordination:{event_type}:{project_id}:{agent_id}:{recovery_epoch}:{agent_revision}`, with `recovery_epoch` and `agent_revision` in base 10 without sign or leading zeros. `recovery_epoch` is the value the prepared event keeps for every retry, the same one its event ID uses. The epoch is in the key for the same reason as in the event ID: after a verified older restore, a newly prepared event never reuses the scoped idempotency identity of an event lost with the post-backup writes, which lasts for the lifetime of the app data root (Contracts_V0). The key stays unambiguous, because the epoch and the revision come last and never contain a colon. `replay_policy` is `dedupe_by_idempotency_key`, and the dedupe identity is `(scope_partition, event_type, idempotency_key)`.
- **Event ID.** `event_id` is `evt_coordination_` followed by the lowercase hex SHA-256 of the RFC 8785 JSON array of strings `[storage_instance_id, recovery_epoch, project_id, event_type, agent_id, agent_revision]`, with `recovery_epoch` and `agent_revision` in base 10. `storage_instance_id` and `recovery_epoch` are Storage's actual values (Case L-2) when the coordinator prepares the event, and the prepared event keeps them for every retry. The epoch keeps an event prepared after a verified older restore from reusing the ID of an event lost with the post-backup writes. A retry that the dedupe policy matches returns the original event ID, as SP-286 resolves an alternate incoming ID. No clock, retry count, attempt or checkpoint generation enters either recipe.
- **Agent identity.** A restore can remove registrations from the store, so the uniqueness of `agent_id` (OSI-438) cannot rest on a lookup of earlier registrations. The registering component allocates it from fresh entropy, or derives it only from owner-issued identities that are themselves never reused.
- **Lineage.** Every later event repeats the lineage its registration fixed. `project_id`, `run_id` and `platform` must equal the registration's. `thread_id`, `agent_type`, `parent_run_id`, `child_run_id`, `node_id`, `lane_id` and `worktree_id` may be omitted, and must equal the registration's when present. A differing value is `lineage_mismatch`.

### Transition table

For one `agent_id`:

| Agent state before | Event | Admitted when | Effect in the projection |
|---|---|---|---|
| no event | `coordination.agent_registered` | `agent_revision` 1, with no `expected_previous_revision` | agent row created with status `queued`; lineage fixed |
| no event | any other family | never | `not_registered` |
| registered, not terminal | `coordination.agent_registered` | never, unless it is an exact retry | `already_registered` |
| registered, not terminal | `coordination.agent_status_updated` | revision rule holds; `status` is non-terminal, and `status` or `status_reason` changed | status and reason set |
| registered, not terminal | `coordination.agent_operation_updated` | revision rule holds; the operation is new or changed | operation row written; current operation set |
| registered, not terminal | `coordination.agent_file_ownership_updated` | revision rule holds; the claim is new or changed | the claim row for `(path_hash, agent_id)` written |
| registered, not terminal | `coordination.agent_unregistered`, `coordination.agent_crashed` or `coordination.agent_aborted` | revision rule holds | agent terminal, with status `terminal_status`, `failed` or `cancelled`; every claim of the agent released; the agent leaves every snapshot |
| terminal | any event | never, unless it is an exact retry | `already_terminal` |

Each agent has exactly one terminal event. Two terminal events that race carry the same `agent_revision`: the first to append wins, and the other fails the revision rule (`stale_revision`) and finds the agent terminal when it reloads. Replay after a terminal event is a no-op: an exact retry returns the original result. If source ever holds an event that this table would have refused, such as a later event for a terminal agent, the projector changes nothing for it and advances past it.

### Projection rules

- **Agent row** `coordination_agent_projection.v1:{project_id}:{agent_id}`: the registration's lineage, `agent_type`, `platform`, `model_id` and `started_at_utc`; the current `status` and `status_reason`; the current operation's `operation_id`, from the agent's latest operation event; the count of active claims; `agent_revision` and `last_applied_event_id`; and, once terminal, the terminal family, its reason or status, and its time. The row stays after the terminal event.
- **File row** `coordination_file_projection.v1:{project_id}:{path_hash}:{agent_id}`: the agent's latest claim on that path, with `path_ref`, `path_hash`, `claim_kind`, `claim_confidence`, `operation_id`, `observed_at_utc` and the source event ID. A newer claim by the same agent on the same path replaces it. The terminal event deletes every file row of the agent in the same transaction. There is no release value.
- **Operation row** `coordination_operation_projection.v1:{project_id}:{agent_id}:{operation_id}`: the latest event for that `operation_id` wins, with its summary, progress, refs, first and latest observation times and source event ID. Rows stay after the terminal event.
- **Snapshot row** `coordination_snapshot_projection.v1:{project_id}:{projection_scope}`: the non-terminal agents in scope, each with `agent_type`, `platform`, `status`, current operation summary and progress, and active claims (`path_ref`, `claim_kind`, `claim_confidence`). `projection_scope` is `project`, or `run~{b}`, `worktree~{b}`, `lane~{r}~{b}` or `node~{r}~{b}`, where `b` is the unpadded base64url of the exact UTF-8 `run_id`, `worktree_id`, `lane_id` or `node_id`, and `r` that of the `run_id` for lane and node scopes. The projector keeps the `project` row once any agent is registered, keeps one scoped row for each scope that at least one non-terminal agent names, and deletes a scoped row in the transaction that removes its last non-terminal agent.
- Every projection value holds only IDs, refs, hashes, enums, integers, timestamps and the bounded text of CV-353.

### First-receipt custody

For every append of the seven families, `storage.coordination_append.v1@1.0.0` and its caller `AgentCoordinator` explicitly adopt SP-286/CV-339's `storage.first_append_receipt.resolve.v2`. The request is the original admitted EventRecord identity and semantic request under the existing replay policy, not a caller custody row, locator or receipt: the actual original event ID, scoped idempotency key and authored payload of the original coordination event, in the actual same Storage instance. Storage authenticates the actual global and scoped identity, the source semantic tuple and the canonical issued custody. The returned eleven-field AppendReceipt and the retained four-field `original_append_result` must join the original event and sequence and the Storage-owned original segment reference and offset. The exact original durability class is the required synced barrier. A newer locator, timestamp, supplied digest or four-field dedupe result alone cannot satisfy it.

After a lost acknowledgement, the coordinator returns the resolved original receipt and appends nothing new. An uncertain append stays fenced until Storage resolves the original identity, and the coordinator appends no later event for that agent before then. If Storage's own reconciliation establishes that no original event exists, only the original append identity is retried, through the unchanged shared idempotency route with the same original input; that is not a first-mint request. The coordinator never asks for a first mint from a missing receipt, lost delivery, tail absence or a supplied never-issued flag. Only Storage's own writer reaches `storage.first_append_receipt.issue.v2`, for an authenticated never-issued complete current protected group, after the original source and manifest barriers and complete current group, source, dedupe and restore checks. Missing or conflicting custody keeps the call recovery-required under the existing failure behavior. A proper subset, lost previously issued custody, a restored old pending request or an ambiguous original group stays fenced. In-place restart after actual protected promotion follows SP-286's original group handoff, without reconstructing old transient capabilities.

A verified older restore does not make omitted coordination work fresh. The coordinator keeps no durable pending coordination request, so a restore brings none back and nothing is replayed. Only an actual newly accepted coordination event after the coordinator's completed restore occurrence and session may use SP-286's fresh-operation admission. That covers the crash detector's `process_lost` resolution of an agent the restored store still shows as non-terminal (OSI-438). Lost or restored requests are never renamed or reaccepted as new events.

At the final publication boundary, when the receipt is returned to the caller, the coordinator rechecks that the resolved receipt and `original_append_result` still join the original request and event; no helper may change them in between. Resolution is passive: it grants no current coordination authority and appends nothing. This owner never claims that a supplied complete EventRecord equals its originally issued value, so it does not rely on `storage.first_append_receipt.resolve_full_value.v1`. A later claim of that kind must adopt that interface explicitly.

### Custody and redaction

- **Original.** The seven families' EventRecords in seglog are the only coordination history. They are canonical, belong to the canonical backup, and are never rebuilt from projections. First receipts live in SP-286's `event_append_receipt_custody`. Projections and the checkpoint are derived and rebuildable. They are not backed up, and a restore rebuilds them from the restored seglog.
- **Content.** Stored coordination values hold IDs, refs, hashes, enums, integers, timestamps and the bounded status and operation text of CV-353 only. No prompt, model output, file content, diff, tool argument, command line, environment value, credential, account identifier, token or local absolute path is stored. No mirror carries more than the projection it copies.
- **`path_ref` and `path_hash`.** This recipe is newly defined here, following OSI-438 and the Orchestrator's Gap #34 normalization:
  1. Take the path an observation reported: a hook, a provider event, output parsing or git diff.
  2. Resolve it inside the agent's worktree, following symbolic links only inside that worktree. A path that resolves outside the worktree or the project produces no claim.
  3. Make it relative to the worktree root. A `.puppet-master/worktrees/{name}/` prefix is removed, so the path names the main repository location.
  4. Write it with `/` separators and without `.` segments, `..` segments, empty segments, a leading `/` or `./`, or a trailing `/`. Keep the exact case and the exact Unicode characters the file system reports; do not normalize Unicode.
  5. The result is `path_ref`, a UTF-8 string of 1 to 1,024 characters. `path_hash` is the lowercase hex SHA-256 of the UTF-8 bytes of `path_ref`. Claims are compared only by `path_hash`.
- **Access at read.** Every reader applies current Project and thread permission and the existing deletion tombstones before disclosing a row. Opaque refs, IDs, hashes and cursors confer no access. Coordination records carry no chat content, and `thread_id` is only a lineage join. This contract adds no deletion rule: existing Project deletion and tombstone rules apply as written.

### Retention

- **Records.** The seven families use `RP-COORDINATION-180D@1.0.0`, as the registry family `coordination_event_records` already binds it. Each admitted family's registry row carries it in the structured form `{registry_schema_id: pm.storage_value_registry.v2, policy_id: RP-COORDINATION-180D, policy_version: 1.0.0}`. No policy changes.
- **Anchor.** `run_completion` binds the first durable terminal canonical record of the Run that the event's `run_id` names, as that Run's owner resolves it. An agent's own terminal coordination event is not a Run completion, and event time, file time and mirrors never stand in for one. Until the Run's terminal record resolves, its coordination records are not eligible for expiry. That fail-safe retention covers a Run that crashed without a terminal record. Holds, the recent-run anchor and the existing count order apply unchanged.
- **Projections and checkpoint.** They use `RP-PROJECTION-3GEN@1.0.0`: current plus history, a terminal-transition anchor, 604800 seconds, at most three generations per logical key, holds, `rebuild_projection` overflow and `rebuild` expiry. The checkpoint's same-key generation set is its current core plus at most two closed retired cores in `retired_generations`. Each core has its `publication_id`, first `published_at_utc`, `hold_refs` and first `withdrawn_at_utc`. A retired core's terminal anchor is its first withdrawal time, set once. Ordinary advance keeps the publication ID, birth, holds and history. Only initial publication, a verified rebuild or an admitted binding successor allocates a new publication. A fourth publication waits for the lawful cleanup of one retired core; it never drops protected history or overwrites a held core. Projection rows keep only their current value: a rebuild rewrites every row under the new publication and deletes every row it does not rewrite, and the retired checkpoint cores record the superseded coverage.
- **Append on change.** Coordination events are appended at registration, on an actual change and at termination (OSI-438). Liveness heartbeats are runtime liveness and never reach this admission; an update that changes nothing returns `coordination_unchanged`. This is an event contract, not a retention choice: it decides which facts are recorded, not how long they are kept or how many, and `RP-COORDINATION-180D`'s window, cap, overflow rule and expiry apply unchanged to every appended record.

### Replay, recovery and withdrawal

- **Replay** runs in canonical seglog order from the checkpoint's inclusive cursor. It only rebuilds projection rows and never re-runs an effect: no scheduling, prompt, notification, mirror write, command or append follows from replay.
- **Recovery.** Missing, malformed or inconsistent projection or checkpoint bytes enter the existing Q-DERIVED quarantine. StorageMigrationCoordinator then rebuilds them from verified CURRENT-selected source through the adopted SP-278 token. The physical family is installed through the actual migration graph and ceilings before use; no store-version integer is invented. Canonical events are never reconstructed from projections, and source loss uses canonical recovery and disclosure. While a rebuild runs, the checkpoint is not `current`, so every reader returns unavailable.
- **Admission growth.** `admitted_event_types` changes only through a governed rebuild: the current core is withdrawn, the projector rebuilds over the complete range with the new set, and a new core is published. Readers get unavailable in between. Admitting a family never back-fills, aliases or re-reads a sibling.
- **Withdrawal, per family.** First the writer is cut off: the append admission refuses new events of that family, and because the lifecycle needs all seven, it also refuses new registrations. Registered agents continue only through the families still admitted, and an agent that cannot reach an admitted terminal event stays non-terminal in the projection; it is never inferred terminal. Then the projector and readers are fenced: the current checkpoint core is withdrawn, with `withdrawn_at_utc` set once, the projector stops ordinary advance, and every reader returns unavailable. Last comes the successor: every original event and its dedupe and receipt custody are kept, the owner-approved successor or version is identified, StorageMigrationCoordinator rebuilds with the new admitted set, and scope, coverage and currentness are verified before a new current core is published. No silent zero-cursor reset, sibling reuse, history rewrite or deletion of seglog records follows.
- **Activation.** Admission is per family, but the `AgentCoordinator` append path is activated natively only when all seven families are admitted, because the transition table needs registration and every terminal family. Until then an admitted family is contract-only and nothing is appended.

### Unknown, prepared and sibling families

Until a family is admitted, its events are quarantined before append or projection: the append admission refuses them, and the projector's filter excludes them. The projector applies each admitted family on its own and never infers a sibling's state. A family that is not admitted never makes an agent terminal, and a missing registration never creates an agent.

### `coordination.debug_mirror_exported`

This family is outside this contract. It belongs to DL-045's Storage batch. CV-353 prepares its payload definition only, and it is not admitted: the mirror exporter cannot append it until its own landing, and until then SP-232's criterion that mirror recovery is recorded with it stays unmet. Once admitted, its events advance the checkpoint as no-ops, because debug mirror events are never projection authority. Its retention anchor is settled in its own landing, since its payload has no `run_id`.

### Proof boundary

Everything above is contract. Native seglog and redb behavior, locks, the crash detector, SP-278 generic index publication, SP-286 issuance and resolution, migration, backup and restore remain NOT_RUN. Static schemas, fixtures and checks do not establish DEPTH_PASS, readiness or a governance seal.

### SP-320 - Coordination event persistence binding

```yaml
plan_unit_id: SP-320
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Newly authored Storage owner contract under DL-045 for the seven coordination agent families.
  storage.coordination_append.v1@1.0.0 is the only append admission and storage.coordination_projector.v1@1.0.0 the
  only direct event consumer; five versioned readers (scheduler, agent_coordinator, prompt_context, mirror_export and
  inspection) read projections only after checking checkpoint coverage. The kept key
  projector.checkpoint.coordination:{project_id} holds pm.storage_value.coordination_projector_checkpoint.v1@1.0.0,
  with schema, projector identity and version, admitted event types, SP-278's nine-field durable read token
  (DL-076), examined bounds, an inclusive cursor, filter completeness, state, health and same-key generation
  custody. Projection rows and the checkpoint advance in one redb transaction under prior-value compare-and-swap.
  agent_revision advances by exactly 1; the idempotency key is
  coordination:{event_type}:{project_id}:{agent_id}:{recovery_epoch}:{agent_revision}, with the recovery epoch its
  event ID uses; the event ID is evt_coordination_ plus a SHA-256 over RFC 8785 identity strings; stale writes return
  coordination_conflict. The transition table admits registration first and exactly one terminal event, releases
  claims at the terminal event and makes replay after it a no-op. The append path adopts SP-286/CV-339
  storage.first_append_receipt.resolve.v2. Custody keeps refs, hashes, IDs and bounded text, with an exact path_hash
  recipe. RP-COORDINATION-180D binds its run_completion anchor to the Run's terminal canonical record and keeps
  records of unresolved Runs unexpired. Replay, recovery, admission growth and per-family withdrawal are fenced and
  rebuild from seglog. Nothing is admitted.
gui_related: false
gui_classification_reason: Defines backend persistence, identity, replay and checkpoint authority, not presentation.
depends_on: [DL-045, DL-076, SP-232, SP-278, SP-286, CV-339, OSI-438, CV-353]
unblocks: []
acceptance_criteria:
  - Only storage.coordination_append.v1 appends the seven families and only storage.coordination_projector.v1 consumes their events; each reader checks current state, admitted types, needed coverage and publication before it reads.
  - The checkpoint stores the nine-field durable read token without redb_snapshot_id, and every advance, read and recovery revalidates the whole token of its own read.
  - Rows and checkpoint commit in one redb transaction under prior-value compare-and-swap; a stale swap, cursor regression, changed scope or unproved empty range never advances.
  - Exact retries return the original result and a different digest is idempotency_conflict; stale revisions, missing registration, re-registration, events after the terminal event and lineage changes return coordination_conflict with their conflict_kind; unchanged updates return coordination_unchanged.
  - Each agent has exactly one terminal event, racing terminal events resolve by the revision check, and the terminal event releases every claim of the agent.
  - Lost acknowledgement resolves only through storage.first_append_receipt.resolve.v2, no first mint is requested, and restored or lost work is never reaccepted as fresh.
  - Stored values hold no prompt, output, content, diff, credential or absolute path, and path_hash is the SHA-256 of the normalized path_ref.
  - Records of a Run whose terminal record has not resolved are never expired, and projections and the checkpoint keep at most three generations per key.
  - Missing or corrupt derived data rebuilds from verified source, and withdrawal cuts off the writer, fences readers and rebuilds without deleting source.
  - Families that are not admitted stay quarantined before append or projection, and no sibling state is inferred.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/coordination_projection_contracts.schema.json
  - Plans/coordination_event_payloads.schema.json
  - Plans/storage_value_registry.json
  - reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md
  - python3 scripts/pm_coordination_events.py
  - Plans/coordination_event_contract_fixtures.json
  - Plans/Automated_Testing_System.md#ATS-058
risk_class: stale_coordination_projection_or_lost_update
reasoning_tier: high
context_scope: coordination_event_persistence_seven_families
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/Contracts_V0.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-076, Plans/storage-plan.md#SP-232, Plans/storage-plan.md#SP-278, Plans/storage-plan.md#SP-286, reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md]
preserved_exact_tokens: [storage.coordination_append.v1, storage.coordination_projector.v1, projector.checkpoint.coordination, RP-COORDINATION-180D, RP-PROJECTION-3GEN, coordination_conflict, coordination_unchanged]
negative_constraints:
  - No event admission, registry row, retention policy change, sibling binding reuse, runtime capability or native proof.
  - No stored redb_snapshot_id, no currentness from a generation alone, and no read from mirrors or stale publications.
  - No WorkNode, NodeSeed, readiness clearance, count override or governance seal.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/Decision_Log.md#DL-076, ContractName:Plans/orchestrator-subagent-integration.md#OSI-438, ContractName:Plans/Contracts_V0.md#CV-353, ContractName:Plans/storage-plan.md#SP-232, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/coordination_projection_contracts.schema.json, ContractName:Plans/coordination_event_payloads.schema.json, SchemaID:pm.storage_value.coordination_projector_checkpoint.v1
