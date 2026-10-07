# Field inspection sync proposal — researcher draft

**Status:** Complete research draft for the separate same-family critic to review and turn into the final proposed-change artifact. This is not implementation approval.

**Research boundary:** I read only the exact input map, its named case brief and frozen plan, and primary public project/specification sources. I did not inspect other arms, reviews, evaluation material, historical answers, or parent campaign analysis. The local source notes, identities, retrieval metadata, excerpts/locators, and SHA-256 values are in [sources/manifest.json](sources/manifest.json); the authorized case-input identity is [S00](sources/S00.md).

## Recommendation

Retain a local SQLite database on each crew device, but replace “one mutable inspection row, selected by greatest device updated_at” with an append-first inspection/event model and an explicitly specified push/pull API. Operate the API and a PostgreSQL event store on utility-controlled infrastructure. Keep the server self-hostable and make the authentication provider an explicit utility choice. This uses public, no-fee core components (SQLite and PostgreSQL) without assuming a hosted sync vendor or permanent SaaS dependency ([S18](sources/S18.md), [S19](sources/S19.md)).

This recommendation is a proposal for a small bounded prototype, not a claim that SQLite or PostgreSQL supplies offline synchronization. Those components supply local/server transactions and uniqueness primitives. The application still needs defined event identities, causal relationships, conflict policy, authorization, attachment state, cursor recovery, and retention. The proposed validations below are acceptance gates before choosing production components.

The central product choice is to represent each crew visit as a distinct inspection submission linked to an asset, not as another overwrite of the asset’s single record. A crew can therefore add a new observation while offline without erasing another crew’s photo, location reading, note, or assessment. For fields that really are meant to describe one shared current state, preserve concurrent alternatives and require an explicit supervisor resolution.

## Proposed model and sync contract

### Records and authorship

Keep the asset catalog separate from inspection evidence. An inspection has a client-generated stable inspection ID, asset ID, schema version, captured time, local device sequence, crew/user claim, and its observations and attachment references. Record both the claimed field operator and the authenticated principal that submitted it to the server. A device ID and a clock value are useful provenance; neither is a trustworthy cross-device ordering source.

Store location readings as inspection evidence with coordinates, coordinate reference system, reported accuracy, capture time, and source where available. Do not silently replace the asset catalog’s coordinates with a crew’s GPS reading. The utility should decide whether a reading corrects the master asset location, describes the crew’s observation point, or both.

Use immutable IDs for inspections, annotations, attachments, and sync events. An edit to submitted evidence creates a correction/supersedes event that points to what it changes; the old value remains in history until the retention policy permits removal. Notes should be separate append-only annotations where practical. A field such as a shared “current valve state” may have causal parent/head IDs. If two edits to that same field descend from the same previously seen head, store both as unresolved alternatives. A supervisor’s resolution event names the alternatives it resolves, the selected value, the resolver, and the decision time. Independent changes to different fields can appear together. A conflict is never cleared by whichever device happened to have a later wall clock.

The materialized asset view may show a suggested current value when there is a single known head. When there are concurrent heads, display “needs review” and show both alternatives. Do not label an observation as the physically latest solely because it arrived last at the server; show capture time and server receipt time separately.

### Local writes, retries, reordering, and pull

Within one SQLite transaction, write the crew’s change, update the local inspection projection, and insert an immutable outbox envelope. SQLite supports explicit transactions and allows multiple readers but one concurrent writer; handle SQLITE_BUSY with a bounded retry and an observable UI state rather than dropping a write ([S01](sources/S01.md)). Store the outbox event ID and payload hash once; a retry must resend the same ID and same bytes.

Proposed API shape:

- Push an event to a client-chosen stable resource, such as PUT /v1/events/{event_id}. PostgreSQL enforces a unique tenant/event ID. The server returns the original receipt for the same ID and same payload hash; the same ID with a different hash is a visible 409/rejected event. RFC 9110 defines PUT as idempotent when repeated identical requests have the same intended effect, and PostgreSQL supports a concurrency-safe unique-key conflict action. These primitives support a retry design but do not create “exactly once” delivery by themselves ([S02](sources/S02.md), [S03](sources/S03.md)).
- The response records event ID, payload hash, server receipt time, server sequence/cursor, and a status such as accepted, already accepted, pending a parent, needs review, or rejected with reason. Do not mark an event acknowledged merely because a request was sent.
- Pull a stable page of accepted server events using an opaque cursor or sequence. Apply events and persist the next cursor in one local SQLite transaction. If a client crashes before committing, it replays the page; event IDs make the replay harmless. Events received before their declared parent are stored but not projected until the dependency arrives.
- Let the client retry after timeout or process restart with backoff. Keep rejected or unresolved work visible until it is corrected or explicitly dismissed. Log batch counts, bytes, oldest pending age, retry count, and rejection/conflict counts without logging tokens or photo contents.
- Keep the server event log and current-state projections in a transaction. Use the unique event ID to prevent duplicate application; do not use the device timestamp as a database sequence.

This is at-least-once delivery with idempotent event acceptance and replay-safe projection, not a promise that a link can never lose data. The service must define how it recovers if a device is damaged before local data has synced and how backups are restored.

### Photos and other attachments

A photo path alone is not an attachment. On capture, create an immutable attachment ID and record a SHA-256 content digest, byte length, media type, capture time, and local availability. Keep the actual bytes in protected app storage and mark the attachment pending. The attachment becomes available to the supervisor only after the complete upload is accepted and its byte count and digest are verified. A submitted inspection with missing bytes stays visibly incomplete; its event receipt is not proof that the photo arrived.

For the first prototype, set a configurable photo-size target and test whole-file PUT retries using a stable attachment ID. If field measurements show whole-file retry wastes too much cellular data, add a resumable chunk protocol whose chunk IDs and offsets are themselves idempotent. Do not claim that HTTP Range downloads prove resumable uploads; CouchDB documents byte-range downloads, not that upload behavior [S06](sources/S06.md). PostgreSQL bytea can keep small pilot attachments within the same DB transaction and backup boundary, but the utility must measure photo sizes, upload behavior, backup time, and restore time before choosing that store; large media may require utility-operated object/file storage and a separately verified ready/purge state ([S20](sources/S20.md)).

The API must authorize attachment upload, download, and deletion independently from inspection metadata. Validate content and size server-side; do not trust the filename or reported MIME type. A UI should distinguish “not captured,” “waiting to upload,” “upload incomplete/retry,” “available,” and “removed under retention policy.” The React Native PouchDB SQLite adapter examined as an alternative documents an attachment-specific Metro configuration requirement and a binary putAttachment hang under the default browser build at the pinned adapter source revision. That is an actionable compatibility test if this alternative is reconsidered, not an executed test or evidence that the issue is fixed ([S12](sources/S12.md)).

### Deletes, retention, and access

Represent ordinary deletion as a tombstone event with target ID, actor, time, and policy reason where appropriate. A tombstone removes an item from active views but prevents a late offline event from silently recreating it. Keep deletion history and content under separate retention rules. Define a purge process that covers database records, photo bytes, local devices when they reconnect, exports, and backups. Never promise remote erasure from a device that has been offline for days; policy must decide how long credentials and data remain usable offline. A restored or very old client must be reconciled against tombstones before it can upload.

The CouchDB comparison makes the distinction concrete: normal deletion creates a replicated tombstone, while its purge endpoint is a different operation and CouchDB documents that external purge operations are not replicated to other external databases ([S08](sources/S08.md)). Retention and privacy requirements for the utility remain unknown and must be decided before a deletion deadline is promised.

Put the API in front of the database; do not expose PostgreSQL or unrestricted CouchDB credentials to field clients. Prefer the utility’s existing identity provider. Native public clients should use the external browser and PKCE rather than embedding a shared client secret ([S21](sources/S21.md)). The API and supervisor web view should authorize every read/write by tenant, crew/region assignment, role, object, and action; default to deny and check every request ([S17](sources/S17.md)). Define inspector, supervisor/resolver, and administrator actions separately. A database user or device ID is not proof that an offline edit was made by the named human. Keep submitted actor claims, device identity, and server-authenticated submitter distinct in history. If the utility requires non-repudiation or signed chain-of-custody, that is a separate choice: the proposed server receipt alone does not prove that a device was not altered while offline.

### Supervisor history and exports

Build the web review view from the event log and projections. Show, per asset and inspection: author/device, captured time, server receipt time, attachment availability, current review state, unresolved alternatives, and resolution event. Provide filters for crew, region, asset, time, and review state. CSV export should include inspection/event IDs, provenance, status, and attachment availability; it should not flatten unresolved changes into a fabricated “latest” row. Record export actor/time and the filter criteria if the utility treats exports as audit artifacts.

ODK Central is a useful adjacent field-data analogue: its docs describe separate Received/Edited and user-assigned review states, per-submission activity history, map access, and a warning when expected media is missing ([S16](sources/S16.md)). Those labels do not automatically encode water-utility workflow; adopt only after supervisors decide what each state means.

## Mechanism comparison

| Mechanism | Useful behavior | Costs and failure modes | Fit here |
|---|---|---|---|
| Frozen-plan LWW row | Smallest implementation; one current row | Device clocks can be wrong; concurrent fields, comments, images, deletes, and attribution can disappear. Retries and reordered POSTs have no identity rule. | Reject for authoritative inspection state. Use a timestamp only as displayed provenance. |
| PouchDB + CouchDB revision-tree replication | Self-hosted HTTP push/pull, checkpoints, retries, tombstones, and competing document leaves. CouchDB expects unstable networks and documents checkpoints/retries. | A deterministic winner hides alternatives from ordinary reads/views; the app must fetch, surface, and explicitly resolve conflicts. Database membership grants read/write over that DB, so crew-level reads need an API or careful partitioning. Purge is a distinct retention path. PouchDB’s React Native SQLite adapter is community code with documented attachment/Hermes integration caveats. | Strong packaged-sync alternative if the prototype values mature replication over a relational server/API, but only after native attachment, auth, and deployment spikes. Sources: [S04](sources/S04.md), [S05](sources/S05.md), [S06](sources/S06.md), [S07](sources/S07.md), [S08](sources/S08.md), [S12](sources/S12.md). |
| Automerge CRDT documents | Merges independent document changes; preserves same-property alternatives behind a deterministic value and exposes them via getConflicts. | Same-field conflicts still need a product resolver; conflict order is not device wall time. Repository storage/network are pluggable, so SQLite persistence, auth, binary media, retention, review, and server history remain application work. Rust sync docs state an ordered/reliable stream assumption; test the chosen transport under disconnects and replay. | Worth a small merge spike if same-document concurrent edits are frequent. Do not assume CRDT semantics resolve inspection-domain choices. Sources: [S13](sources/S13.md), [S14](sources/S14.md). |
| SQLite outbox + self-hosted API + PostgreSQL event log (recommended prototype) | Keeps the planned local SQLite; explicit event identity and authenticated server receipt; maps audit/projection data to relational queries; utility controls hosting. | The team owns event schema, merge/review rules, checkpoint recovery, authorization, attachment transfer, migrations, backup, and client version compatibility. It is not a drop-in sync engine. | Best fit to the brief if event identity and supervisor audit matter more than automatic document replication. Prototype fault cases before production selection. Sources: [S01](sources/S01.md), [S02](sources/S02.md), [S03](sources/S03.md), [S17](sources/S17.md), [S18](sources/S18.md), [S19](sources/S19.md), [S20](sources/S20.md), [S21](sources/S21.md). |

Automerge is a substantially different strategy from CouchDB replication: a CRDT library merges operations in a data structure, while CouchDB replicates revision-tree branches and leaves application-specific merge to the caller. The proposed event model instead treats visits as evidence and makes resolution a named domain action.

## Pinned implementation and issue/fix/test/release evidence

PouchDB provides a concrete upstream history relevant to offline database maintenance. Issue #8525 reports slow manual compaction and separately reports 409 writes in the auto-compaction setup ([S09](sources/S09.md)). Commit 34cb69117931d4b520ee8d7a6208eb0f33da8ec7 restores filtering compaction changes by last sequence and adds an integration regression test named “Only compact document with seq > last_seq.” That test creates revisions, simulates a prior compaction checkpoint, compacts, then confirms an older revision can still be read. The PouchDB 9.0.0 release notes include the #8525 fix, so the source trail is issue → code plus regression test → released version ([S10](sources/S10.md), [S11](sources/S11.md)).

Applicability is limited: the test skips remote targets and does not exercise the community React Native SQLite adapter, binary attachments, offline authorization, or this proposed event protocol. PouchDB 9.0.0 was released in June 2024 and appeared as the release page’s Latest at retrieval; recheck its maintenance and dependency status before locking it. The adapter README at immutable commit e269c4300926c16662560ccc1eb68be4f6bfc76b describes v4.0.0 and says attachments require Metro to force Node builds because the default browser build can hang on binary writes. This makes adapter compatibility a gate, not a paper detail ([S12](sources/S12.md)).

## Corrections to frozen plan v1

| Frozen-plan assumption | Proposed correction |
|---|---|
| One mutable inspection record per asset/inspection | Give each visit an immutable inspection ID linked to an asset. Keep asset master data separate from inspection evidence. |
| Latest record is greatest updated_at | Do not resolve concurrency with device wall time. Track capture time, server receipt time, local device sequence, and causal parents separately. Preserve concurrent same-field alternatives. |
| POST changed records | Use stable event IDs, payload hashes, idempotent acceptance, explicit per-event receipts, an outbox, and a replay-safe pull cursor. |
| Retry failed uploads | Define the retry identity, response-loss behavior, backoff, duplicate handling, dependency handling, rejection state, and metrics. |
| Photos are paths | Store photo identity, bytes, digest, metadata, upload state, authorization, retry, integrity verification, and retention separately. |
| Latest-only supervisor view and CSV | Add conflict queue, event timeline, missing-media warning, named resolution, provenance-rich export, and explicit review status. |
| Deletes, auth, concurrent updates, attachment identity, audit are “to design” | Make each an explicit API/data-model requirement and prototype gate. Define separate logical tombstone, content purge, backup expiry, and offline-device behavior. |

## Optional discoveries

1. Treat the visit/submission as the unit of offline work. ODK Collect separates draft, finalized/queued, and sent forms; a finalized form is not normally editable unless explicitly enabled. This pattern fits a field visit better than repeatedly overwriting one asset-wide row. It does not itself solve shared current-state conflicts ([S15](sources/S15.md)).
2. Model “asset position” and “where the crew observed it” separately, with coordinate reference and accuracy metadata. This follows from the brief’s location-reading requirement; the utility should confirm which reading is operationally authoritative.
3. The CouchDB/Pouch alternative combines attachment transfer and revision replication, but its default conflict winner and database-level access scope mean “the database synced” is not equivalent to “a supervisor sees every field conflict under least privilege” ([S04](sources/S04.md), [S07](sources/S07.md)).
4. SQLite and PostgreSQL core licensing is permissive/no-fee, but drivers, mobile adapters, deployment, monitoring, backup, and support still have operating costs ([S18](sources/S18.md), [S19](sources/S19.md)).

## Open product and operating choices

- What constitutes the authoritative asset catalog, and is there an existing GIS/CMMS to read from or update?
- Which inspection fields are independent observations, which are shared current-state values, and which require supervisor approval? Define each same-field conflict rule.
- What user/crew identity provider exists? How long can a device use cached assignments and credentials offline? What is the lost-device and re-enrollment policy?
- Does audit mean traceable attribution and receipt history, or cryptographic signatures/non-repudiation as well?
- What retention periods apply to inspection values, photos, event bodies, tombstones, exports, and backup snapshots? Who may purge and how is purge proved?
- What devices/OS versions are supported? Is React Native actually the client platform? The Pouch adapter spike is relevant only if it is.
- What is the typical and maximum image size, daily volume, expected link bandwidth, and required recovery time? These determine photo compression, whole-file retry vs chunks, DB vs separate storage, and backup strategy.
- How many crews/regions, records, and offline days must a device cache? This sets local storage quotas, asset packages, conflict thresholds, cursor retention, and server capacity.
- Is a self-hosted PostgreSQL/API acceptable to utility IT, and what existing backup, monitoring, patching, and incident-response service can own it?
- Should an inspector be able to correct a sent inspection, and if so does it require a superseding event, supervisor signoff, or a reopening workflow?

## Proposed validation; none executed

1. **Two-device concurrency:** Seed the same cached asset/head on two isolated devices. One edits status and adds a note/photo; the other edits the same status differently and adds an independent location observation. Verify independent additions survive, same-field alternatives remain visible, and a supervisor resolution names both source events. No device timestamp should silently choose the winner.
2. **Clock faults:** Set device clocks far apart and backwards. Verify causal order and server receipts stay coherent, while both capture times remain displayed with their device provenance.
3. **Duplicate and reordered delivery:** Drop the response after server commit, retry the same event, and confirm one event with one receipt. Reuse an event ID with changed bytes and require rejection. Deliver a child event before its parent and verify it is stored but not projected until its dependency arrives.
4. **Cursor atomicity:** Terminate the client before, during, and after applying a pull page. Verify it either commits both event effects and cursor or commits neither; replay must not duplicate notes, attachments, or conflict resolutions.
5. **Connectivity and process loss:** Simulate airplane mode for several days, intermittent captive/weak links, app termination, reboot, disk-full, and SQLITE_BUSY. Every unacknowledged event remains visible and retryable; no service displays “synced” before receipt.
6. **Attachment integrity:** Interrupt an upload, retry it, and verify the status stays incomplete until full length/digest match. Test corrupt bytes, wrong content type, duplicate upload, attachment authorization, download after reconnect, and purge behavior. If PouchDB is shortlisted, run the pinned PouchDB/adapter combination on physical Android and iOS builds with Metro/Hermes and binary attachments.
7. **Delete/retention:** Tombstone an asset observation while one device is offline; have that old device reconnect with an earlier edit. Verify no silent resurrection, a visible rejected/review state, and the configured retention process handles photo bytes, database rows, exports, and backups separately.
8. **Authorization:** Test each role across push, pull, asset, photo, resolution, review, export, and delete endpoints; include cross-crew/region requests, expired tokens, revoked/lost devices, stale offline packages, and password/session changes. All server requests must be denied unless permitted.
9. **History and exports:** Compare the browser event timeline, current projection, conflict queue, and exported CSV against the authoritative accepted event list. Verify actor claim, authenticated submitter, capture time, receipt time, event ID, attachment state, and resolution are not collapsed into one timestamp or one row.
10. **Backup/restore and load:** Restore a backup to a clean server, resume device retries from pre-restore state, and verify receipts/cursors reconcile. Load with a representative number of crews, images, and several days of queued events; measure server memory/storage, PostgreSQL restore time, and supervisor query/export time.
11. **Retention and legal review:** Have utility records/security/privacy owners approve separate retention and purge schedules for content, metadata, audit, local copies, and backups before field deployment.

**Execution boundary:** No repository or install scripts were downloaded or executed; no components were installed, no code was run, and no implementation tests were executed. Research consisted of reading the authorized case inputs and public sources, plus mechanically hashing the saved source notes and case inputs. Every item above is proposed validation, not observed test evidence.

