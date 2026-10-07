# I-ANCHOR-LUNA — integrated final research proposal

**Status:** proposed decision aid after the required same-family critique. This is not an implementation, security certification, procurement decision, or canon edit. No product choice was supplied or made. No selected stack was deployed and no proposed test was executed.

## Recommendation and decision gate

Prototype **PouchDB 9.0.0 with IndexedDB and utility-hosted Apache CouchDB 3.5.2** only if a managed installable web app is acceptable on the actual crew devices. The candidates are pinned at PouchDB commit b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1 and CouchDB commit 5b4d92103e5088d0e23794ddb9c09a6b683f985d. This is conditional: PouchDB documents CouchDB 3.x support generally, not certification of this exact pair. Its browser default is IndexedDB; native SQLite is a separate adapter plugin. Before choosing, name the managed OS, browser/version, app lifecycle, database builds, storage quota/policy, and server build. Prove foreground recovery after process/device restart and several days offline; do not assume background sync or durable browser storage [S08, S14, C09, F08].

Use a distinct data model regardless of sync engine: one immutable event per completed inspection action, a rebuildable current-asset projection, and explicit correction/review events. Do not let client timestamps select authoritative state. The frozen plan's single mutable inspection per asset and greatest-updated_at winner cannot explain concurrent edits, depend on clock agreement, or supply the requested history [S01–S02].

If managed native SQLite and multi-day retention are hard requirements, retain SQLite and compare a utility-hosted PostgreSQL append API with a deliberately built outbox. That path is credible but requires the team to implement and prove replay/checkpoints, duplicate/reorder handling, authorization, projection, schema migration, attachment transfer/resume, and deletion. Keep it as a real alternative; do not select a community SQLite adapter before its maintenance, platform, and offline-photo behavior are proven [S14, S18, C13].

## Findings that change the plan

1. A visit is not a mutable asset row. Keep drafts editable locally; when completed, queue a uniquely identified inspection event. Corrections and supervisor resolutions append events citing inputs and reasons. Device time remains evidence with clock-quality metadata, not a conflict winner [S01–S02].
2. Replication is useful transport, not an application audit or exactly-once guarantee. CouchDB replicates changes/checkpoints and PouchDB supports live retry. CouchDB retains divergent leaves, but ordinary reads choose one deterministic winner and may hide the others. Surface conflicts and persist explicit resolutions [S03–S04, S13, F01, F09].
3. Revision history is not the long-term record: compaction drops old non-leaf revision bodies. Retain events and receipts independently; use Couch revision conflicts for exceptional same-ID divergence [S04, S07, F01, F05].
4. Database membership is a broad boundary. A member can read and modify ordinary documents in the database. Update validation can reject writes with user/security context, but cannot hide receipt rows or provide row-level read filtering. Use separate databases for approved confidentiality scopes and a gateway or separate receipt store for private fields [S05, S19, C02–C03, F02–F03].
5. Attachment lifecycle is a release concern. CouchDB attachment revisions and Range reads do not establish resumable uploads. The pinned Pouch bundle contains a guard for one fixed IndexedDB reference bug. A separate CouchDB issue reports target growth from roughly 1 MB to 2 MB on 3.4.2; it does not establish 3.5.2 behavior [S06, S08–S09, S15, F04, F06, F10].
6. ODK's draft/finalize/send workflow is a useful field-capture pattern, not shared-asset conflict resolution. Automerge merges independent edits but exposes same-property alternatives and does not choose an operationally safe outcome [S16–S17, C11–C12].

## Proposed event, sync, and review behavior

### Capture, identity, ordering, and duplicate delivery

- Keep a recoverable local draft. On complete/queue, create one immutable event with schema version, stable random event ID, asset and inspection/work-item IDs, kind, actor/device IDs, per-device sequence, capture time, coordinates plus accuracy/fix-age, payload or changed fields, parent/superseded IDs, and photo IDs/manifests. Persist identity and payload before any network request.
- Define a versioned canonicalization over immutable event fields. Compute a content hash over those canonical bytes and SHA-256 over each exact photo byte stream; exclude server receipt, transport, and projection fields. The server recomputes attachment hashes before issuing a receipt. Store the canonicalization version.
- Server idempotency is keyed by event ID plus canonical event and attachment hashes: same ID and same hashes is an idempotent duplicate even when delivered concurrently, by a different path, after worker restart, or after a lost response. Return existing receipt/status. Same ID with different content is an integrity conflict: quarantine and surface it; do not overwrite. This specifies idempotent outcome, not exactly-once delivery.
- Per-device sequence orders one device's events; server sequence records arrival order. Neither defines global causality across crews. Use parent/superseded links. If a child arrives before its parent, mark it pending; transport order must not silently choose a mutually exclusive state. Unrelated events remain concurrent until a domain rule or reviewer resolves them.
- Show additive observations/comments together. For mutually exclusive status such as in-service/out-of-service, show competing proposals and a pending decision. A resolution is a new attributed event citing every input. Exact safety rules remain a product choice.

### Replication and receipt

- Start local-to-remote and remote-to-local replication on foreground/connectivity; use live retry while active. Show distinct states: saved on device, waiting to send, received by server, review required, resolved. A replication pause/active signal is transport status, not durable application acknowledgment [S13, F09].
- A utility-controlled ingestion worker validates replicated events and reconciles them into an idempotent receipt store. Keep private receipt details outside the crew-readable replicated database, in a server-side store or authorized gateway. Return only authorized receipt status. If event and receipt stores cannot share a transaction, make worker replay idempotent and reconcile a crash after acceptance but before receipt return.
- Bind claimed actor to authenticated operator/device identity. Test the user context reaching CouchDB validation on replicated writes. If it cannot establish origin, use a utility gateway that verifies a signed event envelope. Client-supplied author/time alone is not trusted evidence [S19, F03].
- Different event IDs for one asset coexist. For same-ID revision conflicts, retrieve every leaf, display them to an authorized reviewer, and write an explicit review event; do not silently discard a leaf [S04, F01].

### Photos, deletion, access, and operations

- Prefer separately addressable photo records with stable IDs, event references, SHA-256, MIME type, byte size, capture time/location, and owner event ID when per-photo redaction may be needed. This is a proposed model pending retention/redaction decisions. If photos instead remain attached to immutable events, prove erasure through revisions, compaction, backups, and disconnected replicas before adoption.
- Deletion is an authenticated redaction/deletion event under a records policy. Keep a server tombstone or deny-reupload record so stale offline devices cannot recreate deleted bytes; quarantine that retry and show the unresolved device. Separate “remove local copy after receipt” from central deletion. Never claim physical erasure while disconnected devices, backups, or retained revisions may hold copies. Compaction reclaims space; it is not retention policy or secure-erasure proof [S06–S07, S13, C04, F04–F05, F09].
- Measure image workload and budget offline days × inspections/day × photos/inspection × typical/high-percentile bytes, plus indexes, revision churn, backups, and compaction headroom. Benchmark CouchDB 3.5.2 with the reported 3.4.2 reproduction and expected photo patterns. Require alarms and an empirically justified headroom factor [S15, C08, F10].
- Use utility-controlled TLS, no client admin credentials, and separate databases per approved confidentiality scope. Supervisor endpoint is read-only except for separate resolution actions. Test direct/replicated writes, cross-scope reads, receipt privacy, role restrictions, and validation context. Define device lock/encryption/management and disconnected revocation; do not claim browser storage encrypts itself.
- Operate CouchDB, receipt worker, supervisor API, and encrypted backups on utility-controlled infrastructure. Specify retention, backup expiry, legal hold, RPO/RTO, restore tests, compaction headroom, disk alerts, replication lag, pending receipts, old devices, and conflict backlog. Public components avoid permanent third-party service dependency; hosting, identity, operations, backups, and storage still have costs.

## Mechanism comparison

| Mechanism | Useful capability | Material limitation | Proposed disposition |
|---|---|---|---|
| PouchDB 9.0.0 + self-hosted CouchDB 3.5.2 | Offline database, bidirectional replication/checkpoints, retry, attachments, visible conflict leaves [S03–S06, S13] | Device fit must be proven; members read ordinary docs database-wide; winner may hide leaves; history, private receipts, review, retention, and photo behavior are application work | Conditional prototype after device/storage gate |
| Native SQLite + utility-hosted PostgreSQL append API | Retains SQLite; transactions and unique IDs can support idempotent insert/receipt [S18] | Outbox, replay, order, auth, schema, projection, attachment resume, deletion must be built and tested | Fallback if native SQLite is required or relational reporting dominates |
| Automerge CRDT | Independent map/list edits can converge; same-property conflicts are exposed [S17] | Convergence does not adjudicate safety/status; server history, auth, blobs, retention are separate | Optional experiment for narrow free-text/annotation |
| ODK Collect/Central workflow | Offline draft → finalized → sent/acknowledged operator pattern [S16] | Finalized submission does not resolve multiple crews editing one asset | Reuse workflow states; assess self-hosted ODK if mainly form capture |

## Frozen-plan correction crosswalk

| Frozen plan v1 | Proposed correction |
|---|---|
| One mutable inspection per asset | Unique visit/work item; append observations, corrections, and review events; derive current state |
| Timestamp winner | Remove as conflict rule; retain capture time as metadata and use causal links/review |
| Coordinates, text, photo paths on latest row | Structured event payload plus stable photo IDs/manifests; local path is not portable identity |
| POST changed records and retry | Conditional Pouch replication with persisted event identity/receipt, or explicit SQLite outbox |
| Latest inspection/CSV only | Projection plus event/conflict history; export is a view, not the history store |
| Auth, deletion, conflict, attachment retry identity, audit unspecified | Gate these requirements with scoped permissions, tombstones/retention, stable IDs, receipts, and observable tests |

## Upstream implementation history and release applicability

PouchDB issue #8456 reports that IndexedDB replication of divergent revisions could associate an attachment with a revision that did not contain it. PR #8460 added regression coverage and a fix; the API reports merge on 2022-03-29. Test commit: 705b17bd761e06f3cb823616ce974dc2a863aff6. Fix commit: 1a30d0525f7b778ac3a4c58d1bf0d03628533999 [S09–S11, C06–C07, F11–F13].

The test creates divergent revisions, attaches a photo to only one branch, replicates, removes that branch, compacts, then tries to write a stub on the remaining branch. It expects status 412 because that attachment should no longer exist. The exact pinned raw test SHA-256 is 696848045d5622891179d4e04d8fd56f3263f4ebfa5141d59434e10834c164fe; it starts at line 3899 and ends at 3967 [S11, F15]. This test was inspected, not run.

The exact PouchDB 9.0.0 IndexedDB bundle checks whether the specific revision body contains the digest and only then associates the digest with that revision [S08, C05, F06]. The visible 8.0.0 release body does not list #8460, so applicability rests on the exact 9.0.0 bundle, not that release-note claim [S12, C15, F14]. This is evidence for one bug path in that artifact, not every attachment failure, platform, or the selected Pouch/Couch pair.

CouchDB issue #5422 is closed and reports target growth from about 1 MB to 2 MB after a small revision with a 1 MB attachment on CouchDB 3.4.2. It does not establish whether 3.5.2 is affected or fixed. Benchmark the pinned server; do not infer either result [S15, C08, F10].

## Open choices before implementation

1. Supported PWA/native clients; managed OS/browser and procurement rules?
2. Offline days, inspections/day, concurrent crews, downloaded assets, photo count/size, acceptable sync delay?
3. Does shared annotation mean append-only observations, joint editing, or competing status? Define field-level merge rules.
4. Which states need supervisor approval? May operators correct finalized observations or reviewers redact photos?
5. Identity source, offline session lifetime, device enrollment/signing, revocation, and staff handoff?
6. Which teams/regions may read which events/photos? Is database-wide membership acceptable?
7. Retention, legal hold, backup expiry, and completion criteria for physical-deletion claims including offline devices?
8. Must large photos resume mid-file, or is whole bounded-photo retry sufficient? Expected bytes and disk/compaction headroom?
9. Utility-controlled backup, failure model, RPO/RTO without SaaS?
10. Operate CouchDB plus receipt worker, or SQLite/PostgreSQL plus custom sync?
11. Is tamper evidence against server administrators required, or are permission-enforced history and audited backups sufficient?

## Proposed validation — not executed

1. **Device/storage gate:** test exact PouchDB 9.0.0 bundle on each proposed managed OS/browser; capture offline for several days; restart app and device; measure quota/eviction, memory, attachment limits, readability.
2. **Concurrent edits/projection:** multiple devices add distinct events and incompatible values offline, then sync in varied orders. Assert every event/photo survives, unresolved values remain pending, and only an attributed resolution chooses a value. Assert child-before-parent does not silently choose a conflict.
3. **Duplicate/reorder/worker faults:** cut links before request, after server acceptance but before response, during photo transfer, and during receipt return. Deliver IDs concurrently/by different paths, restart worker after acceptance, deliver children first. Assert same ID/same hashes yields one existing receipt, mismatched content is quarantined, server recomputes photo hashes, and no exactly-once claim is made.
4. **Regression/pair applicability:** execute #8456 on PouchDB 9.0.0 IndexedDB with CouchDB 3.5.2; repeat across upgrade/compaction and add project adapter coverage. Upstream test was only inspected.
5. **Attachment size/deletion:** run the 3.4.2 reproduction on 3.5.2; compare attached versus separately addressed photos under workload, duplicate delivery, compaction, backup, deletion. Delete a photo, reconnect a stale device that retries it, and assert tombstone/deny-reupload plus no false erasure claim.
6. **Identity/permissions:** test unauthenticated/wrong-role and cross-scope access, crew attempts to alter events/receipts, supervisor read-only behavior, unauthorized update/delete, forged actor/time, revoked credentials, replicated validation context, and receipt privacy.
7. **History/erasure:** prove correction/merge cites inputs and author/reason. Simulate deletion with an offline device and restored backup; show outstanding copies and only report completion under approved policy.
8. **Operations/restore:** interrupt server/worker, restore backup, resume replication, verify IDs, receipts, photo hashes, watermarks, projection, conflicts; measure storage headroom and restore time.

## Execution and decision status

No component was installed, server/account configured, or test run. Public primary-source text was fetched/read and excerpts hashed; no fetched source or installer was executed. All validations are proposed. No purchase, SaaS assumption, external account action, implementation, canon change, or product decision occurred. The recommendation is conditional and requires product owners to answer the open questions and pass the gates.
