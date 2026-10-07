# ER10 candidate proposal draft — I-ANCHOR-LUNA

**Status:** researcher-v1 draft for a fresh same-family critic and a separate final reviser. This is a research proposal, not an implementation, security certification, procurement recommendation, or canon edit. The only case inputs read were the authorized brief and frozen plan listed in S01–S02; their hashes are in [the source register](sources/README.md).

## Recommendation and conditions

Use a **self-hosted PouchDB 9.0.0 client backed by IndexedDB and an Apache CouchDB 3.5.2 server** as the first sync prototype **if the supported crew device can run an installable mobile web app/PWA**. These are public components and the proposal assumes they run on utility-controlled infrastructure; it assumes no managed CouchDB or other permanent third-party SaaS.

Pair this sync mechanism with a different data model: **one immutable record per inspection action, plus explicit review/merge records**. Do not make a single mutable inspection document per asset authoritative, and do not choose a winner by updated_at. A current-asset screen can be a derived projection; the retained inspection events and server receipt records are the source of history.

This is conditional because the brief does not specify Android/iOS/browser support, available device storage, or whether crews need native-app behavior. PouchDB’s default browser store is IndexedDB, while the SQLite option is a separate adapter path [S14]. If managed native SQLite and guaranteed multi-day local retention are required, keep SQLite and compare a utility-hosted PostgreSQL append API with a deliberately implemented outbox protocol. Do not select a community SQLite adapter for production until its maintenance, platform matrix, and offline/photo behavior pass the same proof tests.

The version candidate is pinned for reproducible evaluation: CouchDB 3.5.2 at commit 5b4d92103e5088d0e23794ddb9c09a6b683f985d; PouchDB 9.0.0 at commit b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1. The Pouch release page listed 9.0.0 as latest when retrieved. The exact Pouch IndexedDB bundle contains the attachment-reference guard described below [S08, S12]. The sources establish support for CouchDB 3.x generally, not a certification of this exact Pouch/Couch patch pairing [S14]; prove the pair in a small device/server matrix before locking it.

## Findings

1. **The frozen record model loses required information.** A mutable per-asset record with a client updated_at winner cannot explain which concurrent annotation arrived, can overwrite edits based on skewed device clocks, and cannot distinguish a correction from an old retry. That conclusion is an inference from the case requirements and plan [S01–S02].
2. **CouchDB/PouchDB makes offline replication a first-class mechanism.** Replication follows changes feeds, compares revisions, and records checkpoints; PouchDB documents live retry/pause/resume behavior for intermittent connections [S03, S13]. This removes much of the custom transport/checkpoint machinery. It does not provide an application guarantee of exactly-once delivery, trusted authorship, or a complete audit history.
3. **Conflict preservation is useful only if the UI exposes it.** CouchDB retains divergent leaf revisions and deterministically picks a default winner for ordinary reads. The other leaf can be hidden from a normal read until the app asks for conflicts/open revisions and resolves them [S04]. Therefore default-winner display cannot be the supervisory truth.
4. **Revision history is not the audit store.** CouchDB compaction drops old non-leaf revision bodies [S04, S07]. Preserve each user action as its own immutable document and record a server receipt; use revision trees to detect/resolve accidental same-ID divergence, not as the sole history.
5. **Photos need their own lifecycle and cost test.** CouchDB attachments are revision-bound; its HTTP Range documentation concerns reads and does not itself promise resumable upload [S06]. PouchDB has a released IndexedDB fix for a replication bug that could attach a blob reference to the wrong conflicting revision [S09–S12]. Separately, CouchDB issue #5422 reports target storage growth from about 1 MB to about 2 MB after a small revision with a 1 MB attachment, using 3.4.2; the issue record had no linked PR/branch when checked. This does not establish whether 3.5.2 is affected, so benchmark it rather than assume it is fixed [S15].
6. **Database membership is a broad boundary.** CouchDB members can read and modify all ordinary documents in the database. Use separate databases for distinct confidentiality scopes and server-side validation/gateway rules for operation-level permissions; do not mistake a client-side filter for access control [S05, S19].
7. **A field-data analogue supports explicit workflow states.** ODK Collect lets offline forms move draft → finalized → sent; finalized content is locked by default, while the system reports whether it was sent and supports local deletion after sending [S16]. This is a useful capture/queue/acknowledgment pattern. ODK submissions do not solve concurrent edits to a shared asset, so the proposal adopts the pattern rather than the product.
8. **A CRDT is a real but different option.** Automerge merges independent map/list edits and exposes same-property competing values, while a normal property read uses deterministic winner semantics [S17]. It could help shared free-text collaboration, but convergence cannot decide whether two competing inspection states are operationally acceptable.

## Proposed data and sync behavior

### Local capture and IDs

- Allow a mutable **draft** while an operator is filling an inspection. Save it locally and make it recoverable after app/process restart.
- On “complete/queue,” create an immutable inspection_event document with a cryptographically random event ID generated once and persisted before any network request. Include schema_version, asset_id, inspection_id (one crew visit/work item), event_kind, actor_id, device_id, device-local sequence, captured time, location coordinates plus accuracy/fix-age metadata, changed fields or observation payload, referenced parent/superseded event IDs, and content hash.
- An operator correction creates a new correction event that points to the prior event and gives a reason. A supervisor resolution creates a separate event referencing every resolved input. Neither operation rewrites prior event bodies.
- Use one uniquely identified document per inspection action. Put that action’s image attachment(s) and manifest in the same PouchDB document where feasible, so local event and binary are persisted as one document revision. Do not later edit that photo-bearing event. If large-image sizing or multiple images force a separate photo document, use a stable photo ID and verify the event-to-photo reference and upload lifecycle explicitly.
- A repeated delivery with the same event ID and same revision/payload is a retry of the same operation. A reused event ID with different content is an integrity/conflict condition to quarantine and show; never silently replace it. Keep the ID stable across retries.
- Keep captured_at as evidence of the device’s clock, not as global ordering authority. Show separately the server’s first_received_at time from an ingestion/receipt worker. Use parent-event relationships and per-device sequence for causality; if concurrent events have no causal order, represent them as concurrent and require a domain rule or review.
- Build asset_current as a rebuildable projection over events. For freely additive observations/comments, show all events. For mutually exclusive state fields (e.g. in-service/out-of-service), preserve concurrent proposals and flag a pending supervisor decision rather than applying last-write-wins. The exact safety/status rule is a product choice.

### Replication, acknowledgment, and history

- Start local-to-remote and remote-to-local Pouch replication when the app enters foreground or connectivity returns; keep live retry while the app is active. Display states such as **saved on device**, **waiting to send**, **received by server**, **review required**, and **resolved**. A Pouch pause/active event is useful transport status, not a server receipt [S13].
- A small utility-hosted receipt worker consumes newly replicated immutable event documents and creates one server-only receipt:<event_id> record containing first-seen server time, authenticated principal/device identity, validation result, payload hash, and server sequence/receipt ID. Make receipt creation idempotent by event ID. Pull the receipt back to the device; only then show “received by server.” The receipt worker and its recovery/retention are proposed application code, not a built-in CouchDB feature.

Append-only event validation protects ordinary client workflows; it is not an admin-proof immutable ledger. If the utility requires tamper evidence against server administrators, add a separate design for signed checkpoints of the receipt ledger in separately controlled utility storage, with restore and retention behavior specified.
- Bind actor_id to the authenticated operator/device identity. Use CouchDB update validation to enforce document shape, allowed event types, append-only rules, and roles; verify in an integration test which authenticated user context reaches validation during a PouchDB push [S19]. If that context cannot reliably establish origin, put the client behind a utility gateway that verifies signed event envelopes and writes the receipt. A client-supplied author/time field alone is not trusted evidence.
- Let concurrent edits to the same **asset** coexist as distinct records. Reserve Couch revision conflicts for the exceptional case where the same event ID has divergent content or a mutable draft races. For those cases query all conflict leaves, display both to an authorized reviewer, and persist an explicit merge/review event. Never silently discard a leaf [S04].
- Supervisor web screens read projections and event history through a read-authorized endpoint. The history should show who/device, capture time and clock quality, server arrival time, asset/inspection links, photo hashes, prior/superseded events, receipt, conflict state, and resolution actor/reason. CSV export is a view of that history, not a replacement for it.

### Photos, deletion, access, and operations

- Store image bytes as Couch/Pouch attachments with a manifest including generated photo ID, SHA-256 computed by the application, MIME type, byte size, capture time/location, and owning event ID. Verify the hash after every test transfer. Do not treat Couch’s attachment digest/ETag as a substitute for the application’s stronger content manifest [S06].
- Set a measured photo-size/count budget from field workload: crew-days-offline × inspections/day × images/inspection × mean and high-percentile image bytes, plus database/index overhead and space for compaction. The storage report for #5422 makes target-size measurement a release gate, especially when revisions include attachments [S15]. If resume after an interrupted large upload is required, add and evaluate a resumable upload mechanism; current evidence supports retries/checkpoints for replication and range reads, not resumable attachment uploads.
- Define two deletion actions separately: **remove local copy after server receipt** and **request central record/photo deletion under retention policy**. Central deletion should create an authenticated, timestamped deletion/redaction event and replicate tombstones to connected devices. A device offline for days can still hold a local copy; do not report physical erasure complete until device/backup policy proves it. Decide purge and backup-expiry rules with records/privacy owners. CouchDB compaction is space reclamation, not a data-retention policy [S07].
- Use utility-controlled TLS endpoints, no client admin credentials, and one CouchDB database per project/region or other approved confidentiality boundary. CouchDB database members can read/write all ordinary docs, so narrower rows require a gateway or another explicit security design [S05]. Update validation can reject unauthorized changes; test both direct requests and replicated writes [S19].
- Supervisor access should be read-only except the separate resolution action. Do not issue a plain database-member credential and rely on the UI to hide writes.
- Devices hold sensitive asset coordinates, photos, and drafts for several offline days. Require a supported device lock/encryption/managed-device policy, test local data exposure and cache cleanup, and avoid claiming PouchDB’s browser store encrypts the database. Revocation cannot reach a disconnected device until its next contact; decide local expiry and device-retirement procedure.
- Run CouchDB, receipt worker, supervisor API, and encrypted backups on utility-controlled infrastructure. Specify RPO/RTO, restore tests, disk alerts, compaction headroom, replication lag, old-device inventory, pending receipt count, and conflict backlog before field launch. Open-source/public components reduce service dependency; hosting, operations, identity, backup, and storage still have costs.

## Mechanism comparison

| Mechanism | Good fit | Main tradeoff for this case | Recommendation |
|---|---|---|---|
| PouchDB + self-hosted CouchDB MVCC replication | Ready-made offline local database, bidirectional sync, checkpoint/retry model, attachments, visible divergent revision leaves [S03–S06, S13] | Browser storage/platform fit, broad database membership, revision winner can hide leaves, app must build event history/receipt/merge workflow; attachment storage needs benchmarking | Preferred prototype only if PWA/device matrix is acceptable |
| Native SQLite + utility-hosted PostgreSQL + custom transactional event API/outbox | Retains frozen plan’s SQLite; relational reporting/constraints; unique event ID + transaction/UPSERT supports idempotent insert and atomic receipt [S18] | Team must design and maintain cursor/checkpoint, replay, duplicate/reorder, schema migration, authorization, event projection, attachment upload/resume and deletion. More code to prove than adopting a replication engine. | Preferred fallback if native SQLite is a hard requirement or report/query requirements dominate |
| Automerge CRDT documents | Offline edits can converge without one coordinator; can merge independent structures and reveal same-key conflicts [S17] | Does not make domain conflicts safe to auto-accept; operations/history and binary photos need a separate durable/server/auth/retention design | Prototype only for a narrow annotation field if product wants collaborative free text |
| ODK Collect/Central workflow | Proven field-data workflow pattern for offline draft/finalize/send and optional audit logs [S16] | Form submissions are naturally visit records; sharing and resolving concurrent changes to one asset still needs an application model | Reuse its explicit state transitions; assess self-hosted ODK only if the product is mostly form capture |

The custom PostgreSQL option is technically credible: unique keys and INSERT ... ON CONFLICT can deduplicate a stable event ID and a transaction can commit an event plus receipt atomically [S18]. That does not supply offline synchronization or attachment protocol behavior by itself.

## Corrections to frozen plan v1

| Frozen-plan element | Proposed correction |
|---|---|
| One mutable inspection record per asset | Create a unique inspection/work item per crew visit, plus immutable observation/annotation/correction events. Keep asset summary as derived state. |
| Coordinates, free text, and photo paths are fields on latest record | Store structured observations and photo manifests/attachments by stable event/photo ID. A local file path is not a portable sync identity. |
| POST changed records and retry | Prefer Pouch replication for a PWA prototype; persist event IDs and show transport/receipt state. If SQLite/native stays mandatory, define and test the custom outbox protocol. |
| Server picks greatest timestamp | Remove as conflict rule. Retain device capture times as metadata; use causal links and explicit supervisor resolution for incompatible concurrent state. |
| Supervisor browses “latest inspections” | Show a rebuildable latest-state projection and a per-event audit/conflict timeline. |
| Authentication, deletes, conflict, attachment retry identity, audit remain unspecified | Treat them as first-class requirements, with security boundaries, immutable IDs, receipt events, deletion lifecycle, and tests below before field pilot. |

## Issue/fix/release and code evidence

PouchDB issue #8456 reported that after two peers created divergent revisions, the IndexedDB adapter could add an attachment-to-revision reference for a branch that did not contain that attachment [S09]. PR #8460 added a regression test (commit 705b17b...) and fix (commit 1a30d05...); the fix checks whether the target revision body contains the attachment digest before adding the reference [S10–S11]. The test reproduces the divergence, removes the attachment-bearing branch, compacts, and expects a later attachment stub write to fail with 412. PouchDB 8.0.0 release notes list #8460, and PouchDB 9.0.0’s exact IndexedDB bundle still contains the guard [S08, S12].

This is strong evidence of a real implementation/fix/regression path at the selected client version for one relevant attachment/conflict failure. It is not proof that the test passed on every platform, that all attachment replication failures are fixed, or that the test was executed here. A second issue, CouchDB #5422, flags potential attachment-related target disk amplification on 3.4.2. Its current tracker record has no linked fix; assess 3.5.2 independently [S15].

## Optional discoveries

- ODK’s immutable finalized/sent workflow suggests a simple crew interaction: save draft while at asset, review required fields/photos, finalize/queue, then show server acknowledgment. Distinguish “uploaded” from “supervisor-reviewed” [S16].
- A CRDT may suit annotations where automatic merging of independent map fields or text is desired, but same-property value conflicts remain visible/need a rule. Do not apply a CRDT to safety/status decisions without a domain review [S17].
- Couch’s own replication conflict model is deliberately non-destructive; application event documents align with it while avoiding a single hot shared record [S04].
- The attachment regression shows that even a popular local-first component can have a subtle cross-branch blob-indexing bug. Include upstream-version regression fixtures in the project’s own adapter test suite [S09–S12].

## Open choices before implementation

1. Supported clients: installed PWA only, Android native, iOS native, or a mix? What exact OS/browser versions and device procurement policy?
2. Offline service envelope: maximum disconnected days, inspections per crew/day, concurrent crews per asset, downloaded asset subset, photo count/size, and acceptable sync delay?
3. Does concurrent “annotate the same asset” mean append observations to the same asset, jointly edit the same active inspection, or edit mutually exclusive asset status fields? Define merge semantics per field.
4. Which status changes require supervisor approval; can an operator correct a finalized observation; can a utility reviewer remove/redact a photo?
5. What identity source, offline login/session length, device enrollment, hardware-backed signing, revocation, and staff handoff rules are available?
6. Which teams/regions may read which inspections and photos? Couch database membership is database-wide, so this determines whether Pouch/Couch remains suitable.
7. What retention/backup/legal-hold period applies to event history and photos? What is the required physical-deletion claim, including disconnected devices and backups?
8. Must large attachments resume mid-file after link loss, or is retry of a whole bounded photo acceptable? What are expected bytes per crew and free disk/compaction headroom?
9. What server failure model, local/off-site backup location, RPO, and RTO are acceptable without depending on a third-party SaaS?
10. Is the utility willing to operate CouchDB plus a receipt worker, or does it prefer the more familiar SQLite/PostgreSQL stack and own the custom sync protocol?
11. Does “reliable history” need tamper evidence against server administrators, or is permission-enforced application history with audited backups sufficient?

## Proposed validation (not executed)

1. **Device/storage spike:** install the exact PouchDB 9.0.0 bundle on every supported browser/device; run offline capture through app restart/device restart and several-day use; measure quota/eviction behavior, attachment size limits, memory use, and whether every saved document remains readable.
2. **Conflict convergence:** two or more devices start from the same asset set, disconnect, add distinct observations and concurrently propose conflicting values. Sync in different push/pull orders. Assert that every unique event and photo is present, the projection marks unresolved values, and only a separately authored resolution event chooses a final value.
3. **Delivery faults:** cut the link before request, after server commit but before response, during large attachment transfer, and during receipt return; restart Pouch and the receipt worker; deliver the same event twice and deliver later causal events first. Assert stable IDs, one receipt per accepted ID, hash match, no lost event, and visible pending/stalled status. Do not label this exactly-once delivery; verify idempotent outcome.
4. **Regression/release applicability:** run the #8456 scenario on PouchDB 9.0.0 IndexedDB and the intended CouchDB 3.5.2 server; repeat after upgrade/compaction. Add it to the project’s adapter integration tests. The upstream test was inspected but not run for this proposal.
5. **Attachment storage:** on CouchDB 3.5.2, copy the #5422 one-megabyte/revised-document reproduction, then repeat with immutable photo/event documents at expected image sizes and offline workloads. Measure active/external/file bytes before/after sync, duplicate delivery, compaction, backup, and deletion. Set disk alarms and a tested headroom factor from results.
6. **Identity/access:** test unauthenticated access, wrong role, cross-region reads, unauthorized update/delete, supervisor attempts to mutate raw events, forged actor and capture time, stale/revoked token, and replicated-write validation context. Verify the signed actor or authenticated principal and server receipt remain distinct.
7. **History/deletion:** prove immutable event bodies are not rewritten; correction/merge contains source IDs and reviewer; simulate a deletion request with one device still offline and a backup restore. UI must show the outstanding device/copy and must not claim physical deletion until the policy’s completion conditions hold.
8. **Operational recovery:** interrupt server/worker, restore backup, resume replications, and verify event IDs, receipts, attachment hashes, watermarks, current projection, and conflict queue. Test enough data to calculate storage/compaction headroom and practical restore time.

**Execution record:** no repository code, component installation, test suite, account, or server was changed or run. External primary sources and pinned source files were read and hashed; the only executed commands were local file/hash/metadata collection. The separate critic and final reviser should challenge platform choice, user-context guarantees during replicated validation, photo size/deletion semantics, and the receipt worker’s failure/replay model.

