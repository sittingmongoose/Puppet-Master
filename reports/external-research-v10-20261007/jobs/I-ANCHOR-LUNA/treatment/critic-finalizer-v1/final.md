# Field inspection sync proposal — critic-finalized

**Status:** Complete research proposal for planning and prototype evaluation. It is not implementation approval, a procurement decision, or a production component lock.

Source IDs such as [S01] resolve to matching entries in sources/SOURCES.md.

**Decision summary:** Keep local SQLite as the candidate device store. Replace a single mutable inspection row chosen by device timestamp with distinct inspection submissions and a durable event/outbox protocol. Prefer a utility-operated API plus PostgreSQL event store as the leading prototype path when attributable history and supervisor review matter most. Compare it with PouchDB/CouchDB revision-tree replication and, if same-document merge is common, a small Automerge CRDT spike before locking the production architecture. All candidates still need product rules for conflict resolution, authorization, attachments, retention, operations, and offline recovery.

The decision assumes the utility can operate or contract for its own service and wants to avoid dependence on a permanent sync SaaS. SQLite and PostgreSQL core licensing do not impose a software-use fee; they do not eliminate mobile adapter, hosting, monitoring, backup, patching, support, or operational costs. Confirm legal and operating requirements with the utility before selection. [S18] [S19]

## 1. Product model

### Assets and inspections

Keep the authoritative asset catalog separate from field inspection evidence. The utility should identify whether that catalog lives in an existing GIS/CMMS, is imported periodically, or is maintained by this application. A crew visit creates a distinct inspection linked to an asset. Do not overwrite another visit’s note, photo, location reading, or assessment merely because it was uploaded later.

A proposed inspection envelope contains:

- Stable client-generated inspection ID, asset ID, schema version, and visit status.
- Capture time, device-local sequence, device identity, and the field operator claim.
- Observation records and references to attachment IDs.
- Later, a server receipt with the authenticated submitter, receipt time, accepted event ID, and server feed position.

Keep operator claims, device identity, and authenticated submitter distinct. The device’s clock and identity are useful provenance but are not a trusted cross-device order or proof of human authorship. Keep capture time and server receipt time as separate facts.

Store GPS readings as observations with coordinates, coordinate reference system, reported accuracy, capture time, and source when available. Do not silently replace the catalog’s asset location. The utility must decide whether a reading describes where an inspector stood, proposes a correction to the asset position, or both.

### Edits, causality, and conflict resolution

Give inspections, observations, corrections, attachments, and sync events stable IDs. Within the approved retention period, an edit to submitted evidence creates a correction or superseding event that points to what it changes; do not rewrite the historical submission invisibly. The utility must decide whether notes are append-only annotations, editable drafts before submission, or both.

Identify fields that describe one shared current state, such as a valve status. Those fields may carry causal parent/head IDs. If two events based on the same known head set different values, preserve both as unresolved alternatives. Do not let a later device timestamp, server arrival time, database sequence, or arbitrary CRDT winner silently represent a domain decision. Independent changes may be combined only when the utility confirms that their fields have independent meaning.

A supervisor resolution is a separate event that records the exact alternatives it reviewed, the selected value, the resolver, the decision time, and any required reason. The server should reject or return the current conflict state if the expected head set changed since the resolution screen loaded. The projected asset view may show one current value when there is one known head; when there are concurrent heads, show that review is needed and present the alternatives. Call a value “latest” only when the utility has defined what latest means.

Append-first history is still subject to approved retention and deletion. It is not a promise to retain content forever.

## 2. Local writes and synchronization contract

### Local transaction and outbox

Within one local SQLite transaction, persist the user’s edit, update its local projection, and insert the immutable outbox envelope. On one phone, SQLite permits concurrent readers but one writer; a transaction can return SQLITE_BUSY when a reader cannot be upgraded. Handle that outcome with bounded retry and visible UI state. Never show a change as safely saved if the transaction did not commit. [S01]

Store the event envelope and its identity once. Retries send the same event ID and the same canonical bytes. If a payload digest is used, define the canonical representation or hash the exact persisted bytes; do not rely on incidental JSON property ordering. The digest helps detect altered content. It does not authenticate the operator or prove that a compromised device did not replace both the content and digest.

### Push, receipts, and duplicate handling

A candidate push is a PUT to a stable resource such as /v1/events/{event_id}. For a given tenant, the server enforces a unique event ID. In one server transaction it stores the event identity, payload hash, authenticated submitter and receipt, and any applicable projection update.

- A repeated ID with the same hash returns its original receipt and current processing state without reapplying side effects.
- A repeated ID with different bytes is rejected and reported as an identity conflict.
- The receipt says whether the event was accepted, already received, waiting on a dependency, needs review, or was rejected with a reason. A client marks the event acknowledged only after it receives and persists the receipt.
- Server acceptance is not the same as conflict resolution or attachment completion.

PostgreSQL ON CONFLICT DO UPDATE provides an atomic insert-or-update outcome under concurrency. A unique key plus application-side hash comparison can help implement event identity. HTTP PUT is defined as idempotent when repeated requests to the resource have the same intended effect. These are useful building blocks; none automatically implements event semantics or provides exactly-once delivery. [S02] [S03]

### Parent dependencies and pull feed

Allow the server to receive a child event before its declared parent, but keep it pending and out of the materialized projection until its dependency is available and policy permits it. Give each tenant’s durable server feed a committed monotonic position behind an opaque cursor. The feed includes event receipt and state-change records, so clients can see a pending event and later see that it became accepted, rejected, or reviewable. Do not page only “accepted events” if that can hide a state change or strand a client cursor.

Return only feed entries authorized for the requesting principal. Bind a cursor to its tenant and authorization scope; when crew/region assignments or permissions change, require the policy-defined cursor invalidation and authorized resnapshot behavior.

The client pulls a stable feed page, applies its events and state changes, and persists the next cursor in the same SQLite transaction. If it crashes before commit, it replays the page. Server event IDs and idempotent projection processing prevent replay from duplicating annotations, attachment references, or resolutions. Define the cursor’s ordering, continuation, and expiry rules before implementation. If a cursor expires, require a full snapshot/reconciliation path that includes tombstones, pending local events, and unresolved conflicts; do not silently skip to the new head.

This is an at-least-once delivery design with idempotent acceptance and replay-safe projections, not a guarantee that an unreliable network never loses data. Define recovery when a device is lost before it syncs, and define how clients reconcile after a server backup is restored. The service should log batch counts, bytes, oldest pending age, retries, rejection/conflict counts, and cursor recovery without logging credentials or photo contents.

## 3. Attachments

A file path is not proof that a photo exists on the server. On capture, create a stable attachment ID and record the digest, byte length, media type, capture time, and local availability. Keep bytes in protected application storage. Make them visible to supervisors only after full upload acceptance and byte-count/digest verification.

Keep attachment state distinct from inspection-event state. The review view should be able to show not captured, waiting to upload, incomplete/retry, available, rejected, or removed under retention. A receipt for the inspection metadata is not a receipt for its photo.

For the first prototype, select a configurable photo-size limit and test whole-file PUT retries against a stable attachment resource. If measured field use shows that whole-file retries waste too much cellular data, consider a resumable chunk protocol with stable chunk identity and offsets. CouchDB’s cited range-request documentation covers attachment downloads, not resumable uploads. [S06]

PostgreSQL bytea can store binary strings, so a small pilot could evaluate keeping photos inside the database and its backup boundary. The documentation does not establish throughput, memory use, or restore time. Measure real photo sizes, upload behavior, database growth, backup time, and restore time before adopting that approach. Larger media may need utility-operated object/file storage and a separately verified ready, retention, and purge state. [S20]

Authorize upload, download, and deletion of each attachment independently from its inspection metadata. Validate file content and size server-side; do not trust a name or reported MIME type. If PouchDB with the community React Native SQLite adapter is shortlisted, run its pinned attachment and Metro configuration through physical Android and iOS builds with the actual PouchDB, adapter, and Hermes versions. The pinned adapter README documents a Metro browser-build failure mode and workaround; it is not an app-specific reproduced result or a guarantee that the workaround is sufficient. [S12]

## 4. Deletion, retention, and recovery

Represent ordinary deletion as a tombstone event with target ID, actor, time, and policy reason where appropriate. A tombstone hides content from active views and lets a reconnecting device learn that an old edit must not recreate it. Keep logical deletion, event metadata, photo bytes, exports, device copies, and backups under separately approved retention rules.

Set a maximum offline/recovery age and retain tombstone information long enough to enforce that policy. A device or restored backup older than that horizon must first reconcile to a current snapshot or be held for review before it can push old events. Define purge permissions, evidence, backup expiry, and handling of devices that may remain disconnected. Do not promise immediate remote erasure from a disconnected device.

CouchDB illustrates why deletion needs explicit design: normal deletion creates a replicated tombstone, while purge is different; its documentation says external purge operations do not propagate to other external databases. If CouchDB is selected, purge must be planned for each database. This CouchDB-specific behavior is not assumed for the proposed API. [S08]

## 5. Identity, authorization, and audit

Put the API in front of PostgreSQL or CouchDB; do not expose unrestricted database credentials to field clients. Prefer the utility’s existing identity provider if available. For a native public OAuth client, use an external user-agent and PKCE rather than an embedded shared client secret. This does not answer how long offline credentials or cached assignments remain valid. [S21]

Design server-side authorization with deny-by-default and least privilege. Combine roles with tenant, crew/region, asset, relationship, and requested-action attributes where required. Check each request at the object/action level, including event push/pull, cursor access, attachments and static file resources, conflict resolution, review, export, and delete. Do not rely on opaque IDs or client-side controls as authorization. [S17]

Define inspector, supervisor/resolver, and administrator permissions with the utility. Record the field operator claim, device binding, authenticated principal that submitted each event, server receipt, and resolver decision separately. Device identity and a server receipt do not prove an offline device was unaltered. If the utility requires cryptographic non-repudiation or signed chain-of-custody, choose key ownership, signing, revocation, and recovery as separate requirements.

Offline policy must cover lost devices, stale assignments, credential expiry, device re-enrollment, and any local data protection the supported platforms provide. Revocation cannot reach a device that remains disconnected. The current inputs do not establish whether local database or photo encryption is already available, so validate storage protection, key handling, backups, and shared-device behavior rather than claiming protection.

## 6. Supervisor review and exports

Build the browser review view from the event history and current projection. Per asset and inspection, show authorship claims and authenticated submitter, device, capture and receipt times, attachment availability, review status, unresolved alternatives, and resolution event. Offer filters for crew, region, asset, time, and review state after the utility settles its access and workflow rules.

CSV exports should include stable inspection/event IDs, provenance, status, and attachment availability. Do not flatten unresolved changes into a fabricated latest row. If the utility treats exports as audit records, store export actor/time and filter criteria and define their retention. Test parity between accepted events, projections, conflict queue, browser timeline, and CSV.

ODK Collect separates offline draft, finalized/queued, and sent states, and ODK Central documents review states, activity history, and warnings for missing expected media. These patterns can inform visit submission and review, but their labels and rules require supervisor approval. ODK is an analogous field-data workflow, not a multi-crew conflict engine. [S15] [S16]

## 7. Mechanisms and trade-offs

| Mechanism | Useful behavior | Costs and failure modes | Fit to this proposal |
|---|---|---|---|
| Frozen-plan mutable row with greatest updated_at | Smallest initial implementation; one displayed row | Device clocks can be wrong; simultaneous edits can overwrite observations; retries and reordered posts have no event identity; photos, deletion, and attribution are undefined. | Reject as authoritative inspection history. A display-only suggested value may use an explicit policy once the utility defines one. |
| PouchDB plus CouchDB revision-tree replication | Self-hostable HTTP push/pull, checkpoints, retries, tombstones, attachments, and preserved competing revision leaves. | Ordinary reads/views choose one deterministic winner and can hide other leaves. The application must fetch, surface, and resolve conflicts. Database membership grants read/write across that database, not crew-level object scope. Purge is a separate retention path. The React Native SQLite adapter is community code with pinned attachment integration caveats. | Serious packaged-sync alternative if the utility values mature replication behavior over a custom relational protocol. Validate mobile storage, attachments, authorization, deployment, upgrade path, and supervisor conflict workflow first. [S04] [S05] [S06] [S07] [S08] [S12] |
| Automerge CRDT documents | Merges independent operations and exposes concurrent same-property values through getConflicts behind a deterministic visible winner. | The domain still needs a resolver. CRDT sync does not supply SQLite persistence, authorization, media lifecycle, retention, relational review, or server history. The cited Rust sync reference assumes an in-order reliable stream and does not expose a crate version. | Worth a bounded merge spike if simultaneous edits to the same document are frequent. Test transport reconnect, replay, persistence, and product conflict behavior. [S13] [S14] |
| SQLite outbox plus utility-operated API and PostgreSQL event store | Keeps the planned local SQLite candidate; gives the team explicit event identity, receipt, conflict and history semantics; relational projections can support review and CSV. | The team owns event schema, state transitions, cursor recovery, merge rules, authorization, attachment transfer, migrations, client compatibility, backup, and operating service. It is not a drop-in sync engine. | Leading prototype candidate if utility-owned operations and attributable event history outweigh packaged replication. Compare it with the alternatives before production selection. [S01] [S02] [S03] [S17] [S18] [S19] [S20] [S21] |

CouchDB replication follows revision-tree branches and leaves conflict handling to the application. Automerge merges CRDT operations but still exposes competing values for domain resolution. The proposed relational path records inspection-domain events and makes resolution a named event. These are materially different mechanisms; none makes the water-utility’s product policy disappear.

## 8. Pinned implementation history and applicability

PouchDB issue #8525 reports compaction latency and 409 write observations in one user workload. Commit 34cb69117931d4b520ee8d7a6208eb0f33da8ec7 restores filtering compaction work from the last sequence and adds a regression test that simulates an earlier checkpoint and confirms an older revision remains readable. The added test skips remote targets. PouchDB 9.0.0 release notes list the #8525 fix; the release page was marked Latest when independently reopened for this finalizer. This completes an issue → code/test → release trail for a real behavior relevant to offline database maintenance. [S09] [S10] [S11]

Applicability is limited: the issue is a reporter’s workload, the test does not exercise remote targets, the release is from 2024, and none of these sources validates the community React Native adapter, attachment transfer, offline authorization, or this proposal. Before shortlisting PouchDB, recheck maintenance, dependencies, the exact current version, and the adapter’s pinned v4.0.0 guidance at commit e269c4300926c16662560ccc1eb68be4f6bfc76b. The final selection must test the actual mobile builds and binary attachments. [S12]

The other implementation evidence has narrower limits too: SQLite’s transaction page is living documentation without an app binding/version pin; PostgreSQL 17 docs are versioned but do not select a server patch or application protocol; Automerge’s JS API is documented at v3.5.0 while the cited Rust sync reference is unpinned. No installed component or application behavior has been tested.

## 9. Frozen plan v1: proposed corrections

| Frozen-plan assumption | Proposed correction |
|---|---|
| One mutable inspection record per asset/inspection | Use a distinct stable inspection ID per visit, linked to an asset; keep catalog data separate from evidence. |
| Greatest updated_at is the latest value | Do not use device wall time to resolve concurrency. Preserve capture time, server receipt time, local sequence, and causal parent/head IDs separately. |
| POST changed records | Define stable event IDs, canonical payload identity, authenticated receipts, and replay-safe effects. A stable PUT resource is one candidate. |
| Retry failed uploads | Define response-loss behavior, same-ID/same-bytes retry, altered-payload rejection, bounded backoff, parent dependency, visible rejection, and metrics. |
| Photos are paths | Define byte identity, protected local storage, metadata, upload state, authorization, integrity check, retry, and retention. |
| Supervisors browse latest row and export CSV | Add an event timeline, conflict/review queue, missing-media state, named resolution, provenance-rich export, and an explicit review workflow. |
| Concurrent updates, deletes, auth, attachment identity, and audit remain undesigned | Specify each in the API and data model; decide offline credential/device policy, tombstone and purge horizon, backups, attachment completion, and audit level before production. |

## 10. Product and operating decisions still open

The proposal deliberately leaves the following choices with the utility:

- What system owns the asset catalog? Is there an existing GIS or CMMS to read from or update?
- Which fields are independent observations, which represent shared current state, and which require approval? What is the per-field conflict rule?
- What does a finalized visit mean? Can a submitted inspection be corrected, reopened, or superseded, and when is supervisor approval required?
- Which identity provider and team/region assignments exist? How long may credentials and assignments be cached offline? What happens after a lost device, revocation, or re-enrollment?
- Is audit a traceable submission/receipt history or cryptographic non-repudiation? Who owns device signing keys if required?
- What retention periods apply to inspection content, photos, event metadata, tombstones, exports, local devices, and backups? Who may purge, and how is completion evidenced?
- Which device models and OS versions are supported? Is React Native actually the client platform? What encryption and key-storage facilities are available there?
- What are typical/max photo size, daily photo volume, bandwidth, queued days, and restore-time needs? These determine image policy, whole-file retry versus chunks, database versus object storage, and backup design.
- How many crews, regions, records, and offline days must the system handle? What local quotas, snapshot size, cursor retention, conflict volume, and server capacity follow?
- Can utility IT own API/database hosting, backups, patching, monitoring, identity integration, incident response, and database restore? Does its cost model still favor utility-operated hosting?

## 11. Proposed validation gates — none executed

All items below are proposed acceptance checks. No code was run, no component was installed, and no implementation tests were executed.

1. **Two-device concurrency:** Seed two devices from the same asset and shared-state head. Add a shared-state conflict and independent note/location/photo observations. Verify all independent evidence survives, both alternatives stay visible, and a resolution names the exact source heads.
2. **Stale resolution:** Open a conflict set in the supervisor view, add another competing event, then submit the old resolution. Require a stale-head response and updated review state rather than silently resolving unseen work.
3. **Clock faults:** Move device clocks forward, backward, and across time zones. Verify causal order and server receipts remain coherent while capture time is shown only with its provenance.
4. **Duplicate, response loss, and altered retry:** Commit a server event, drop the response, retry with the same ID/bytes, and verify one logical event/projection effect and a stable receipt. Reuse the ID with changed bytes and require visible rejection.
5. **Reordering and pending state:** Deliver a child before its parent. Verify it remains out of the projection, appears as pending in the pull feed, and later emits an accepted/rejected/reviewable state change clients can pull without cursor gaps.
6. **Cursor atomicity and expiry:** Terminate a client before, during, and after applying a page. Verify events and cursor commit together or not at all; replay has no duplicate effects. Expire a cursor and verify snapshot/tombstone reconciliation before old local events are pushed.
7. **Offline and local failure:** Work offline for several days; simulate intermittent links, app termination, reboot, disk-full, and SQLITE_BUSY. An unacknowledged edit remains visible and retryable, or clearly reports an unsaved failure. Do not show “synced” before a persisted receipt.
8. **Attachment transfer and access:** Interrupt and retry whole-file upload, corrupt bytes, mismatch size/digest, reuse an ID with different bytes, request unauthorized download/delete, and exercise incomplete and purge states. If chunking is selected, interrupt and reorder chunks. If PouchDB is shortlisted, test the pinned stack on physical Android/iOS with Metro/Hermes and binary attachments.
9. **Deletion and age horizon:** Tombstone evidence while a device is offline; reconnect with old edits both within and beyond the allowed horizon. Verify no silent resurrection, and require rebase or review where tombstone retention has expired.
10. **Authorization matrix:** Test each inspector/supervisor/admin action over push, pull, cursors, assets, photos/static files, resolution, review, export, and deletion. Include cross-tenant/crew/region IDs, expired credentials, changed assignments, revoked/lost devices, and a stale offline package. Server denial must be enforced on every protected request.
11. **History and export parity:** Compare accepted event feed, projection, conflict queue, browser timeline, and CSV. Verify capture time, receipt time, actor claim, authenticated submitter, IDs, attachment state, and resolution are not collapsed.
12. **Backup, restore, and representative load:** Restore a server backup cleanly, resume device retries and cursor recovery, and measure restore/query/export time using representative crews, queued days, events, and photos.
13. **Records and security review:** Have utility records, security, privacy, and legal owners approve separate retention and purge schedules for content, metadata, photos, local copies, exports, and backups. Verify local key protection and offline lost-device policy on supported devices before field deployment.

These validations are necessary to select a production design. Passing them would provide evidence about the chosen build and deployment only, not a general guarantee about other versions or environments.

## 12. Evidence boundary

The sources register in sources/SOURCES.md preserves the research-v1 source IDs and local evidence-note hashes, then records the independent primary-source checks and their limits. All primary-source claims in this proposal point to those IDs. The frozen case plan remains the comparison baseline; this proposal does not modify canonical Plans, product files, or implementation code.
